// Synthetic respondents for the persona quiz v2 scorer. Plain Node, no dependencies.
//   node sim.mjs          -> tunes thresholds on a grid, checks the shipped CONFIG, prints a report,
//                            writes SIM-REPORT.md and sim-example/ (one worked respondent)
//   node sim.mjs --quick  -> smaller population, no report files (used by tests)
// Groups: uniform random clickers; consistent respondents (hidden axis and tag positions, 20% noise);
// skippers (consistent, but skip or exit on 25% of cards; 20% of the consistent population);
// speed-tappers (consistent first half, rushed and mostly random second half). 30% of every group is teen.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildProfile, buildResult, freezePredictions, checkSealed, runCards, CONFIG, kit, lib, cardById } from "./score.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const QUICK = process.argv.includes("--quick");
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
const PAIRS = [...new Set(lib.tags.map((t) => t.id.slice(0, 3)))];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const R = rng(424242);
const U = (a, b) => a + (b - a) * R();
const pick = (xs) => xs[Math.floor(R() * xs.length)];
const gumbel = () => -Math.log(-Math.log(Math.max(1e-12, R())));

function utility(o, h) {
  if (o.circumstance) return -0.4;
  let u = 0;
  for (const [k, v] of Object.entries(o.axes || {})) u += h[k] * (v / 2);
  for (const t of o.tags || []) u += h[t.id.slice(0, 3)] * (t.id.endsWith("A") ? 1 : -1) * (t.s / 3);
  return u;
}

function choose(card, h, noise) {
  const n = card.options.length;
  const want = card.type === "pick_two" ? 2 : 1;
  const out = [];
  const ranked = card.options.map((o, i) => [i, utility(o, h) + 0.12 * gumbel()]).sort((a, b) => b[1] - a[1]).map(([i]) => i);
  while (out.length < want) {
    const i = R() < noise ? Math.floor(R() * n) : ranked.find((j) => !out.includes(j));
    if (!out.includes(i)) out.push(i);
  }
  return want === 2 ? out : out[0];
}

function makeRespondent(kind, id) {
  const teen = R() < 0.3;
  const setup = { age: teen ? "teen" : "adult", closest: pick(["best friend", "partner", "sibling", "parent"]), pronoun: pick(["she", "he", "they"]) };
  const h = {};
  for (const a of AXES) h[a] = U(-1, 1);
  for (const p of PAIRS) h[p] = U(-1, 1);
  const ans = { setup, _ms: {} };
  const run = runCards(setup);
  const half = Math.floor(run.length / 2);
  const answerCard = (card, idx, inFinale) => {
    if (card.gateRule) {
      const g = ans[card.gateRule.card];
      const src = cardById[card.gateRule.card];
      const picks = Array.isArray(g) ? g : typeof g === "number" ? [g] : [];
      if (!picks.some((i) => (src.options[i].tags || []).some((t) => t.id === card.gateRule.anyTag))) return;
    }
    let ms = Math.round(U(2500, 11000));
    let noise = 0.2;
    if (kind === "random") noise = 1;
    if (kind === "speed" && !inFinale && idx >= half) { ms = Math.round(U(300, 1400)); noise = 0.6; }
    if (card.type === "feeling") noise = 1;
    if (!inFinale) ans._ms[card.id] = ms;
    if (kind === "skipper" && R() < 0.25) return (ans[card.id] = pick(card.exits));
    const v = choose(card, h, noise);
    ans[card.id] = v;
    const o = card.options[Array.isArray(v) ? v[0] : v];
    if (o.depends && card.flip) ans[`${card.id}.flip`] = Math.floor(R() * card.flip.options.length);
  };
  run.forEach((c, i) => answerCard(c, i, false));
  const sealed = {};
  const saved = { ...ans };
  for (const c of kit.finale) { answerCard(c, 0, true); sealed[c.id] = ans[c.id]; delete ans[c.id]; }
  return { id, kind, teen, hidden: h, answers: saved, sealed };
}

function population(n) {
  const out = [];
  for (let i = 0; i < n.random; i++) out.push(makeRespondent("random", `rand-${i}`));
  for (let i = 0; i < n.consistent; i++) out.push(makeRespondent(i < n.consistent * 0.2 ? "skipper" : "consistent", `cons-${i}`));
  for (let i = 0; i < n.speed; i++) out.push(makeRespondent("speed", `speed-${i}`));
  return out;
}

const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);
const pct = (x) => `${Math.round(x * 1000) / 10}%`;

function evaluate(pop, cfg, detail = false) {
  const g = {};
  for (const r of pop) {
    const p = buildProfile(r.answers, cfg);
    const G = (g[r.kind] ||= { n: 0, shown: [], fired: [], strong: [], zero: 0, over8: 0, tagMatch: [], tagMatchClear: [], axisAcc: [], axisAccClear: [], flex: [], unfinished: [], pole: Object.fromEntries(AXES.map((a) => [a, 0])), exact: 0, called: 0, side: 0, sideOf: 0, passes: 0, rushedOnly: 0, tagCounts: {} });
    G.n++;
    G.shown.push(p.shownTags.length);
    G.fired.push(p.firedTags.length);
    G.strong.push(p.strongTags.length);
    G.tagCounts[p.shownTags.length] = (G.tagCounts[p.shownTags.length] || 0) + 1;
    if (!p.shownTags.length) G.zero++;
    if (p.shownTags.length > 8) G.over8++;
    G.firedMax = Math.max(G.firedMax || 0, p.firedTags.length);
    for (const id of p.shownTags) {
      const hv = r.hidden[id.slice(0, 3)] * (id.endsWith("A") ? 1 : -1);
      G.tagMatch.push(hv > 0 ? 1 : 0);
      if (Math.abs(hv) > 0.25) G.tagMatchClear.push(hv > 0 ? 1 : 0);
      if (p.tags[id].evidence.every((e) => e.rushed || e.s <= 0)) G.rushedOnly++;
    }
    for (const a of AXES) {
      const ax = p.axes[a];
      G.pole[a] += ax.pole > 0 ? 1 : 0;
      G.flex.push(ax.flex ? 1 : 0);
      G.unfinished.push(ax.unfinished ? 1 : 0);
      if (!ax.flex && !ax.unfinished) {
        G.axisAcc.push(Math.sign(r.hidden[a]) === ax.pole ? 1 : 0);
        if (Math.abs(r.hidden[a]) > 0.3) G.axisAccClear.push(Math.sign(r.hidden[a]) === ax.pole ? 1 : 0);
      }
    }
    const frozen = freezePredictions({ ...p, config: cfg });
    // predictCard reads CONFIG thresholds through the profile's flex/unfinished flags, which buildProfile set with cfg.
    const res = checkSealed(frozen, r.sealed);
    G.exact += res.exact; G.called += res.called; G.side += res.side; G.sideOf += res.sideOf; G.passes += res.passes;
  }
  const out = {};
  for (const [k, G] of Object.entries(g)) {
    out[k] = {
      n: G.n,
      shownMean: mean(G.shown), firedMean: mean(G.fired), strongMean: mean(G.strong),
      in3to5: mean(G.shown.map((x) => (x >= 3 && x <= 5 ? 1 : 0))),
      zero: G.zero, over8: G.over8, firedMax: G.firedMax || 0, tagCounts: G.tagCounts,
      tagMatch: mean(G.tagMatch), tagMatchClear: mean(G.tagMatchClear),
      axisAcc: mean(G.axisAcc), axisAccClear: mean(G.axisAccClear),
      flexRate: mean(G.flex), unfinishedRate: mean(G.unfinished),
      poleShare: Object.fromEntries(AXES.map((a) => [a, G.pole[a] / G.n])),
      exactRate: G.called ? G.exact / G.called : 0, sideRate: G.sideOf ? G.side / G.sideOf : 0, passRate: G.passes / (G.n * kit.finale.length),
      rushedOnlyTags: G.rushedOnly,
    };
  }
  return out;
}

function targets(ev) {
  const c = ev.consistent;
  const poleMax = Math.max(...AXES.map((a) => Math.max(c.poleShare[a], 1 - c.poleShare[a])));
  return {
    randomStrongUnder1_5: ev.random.strongMean < 1.5,
    consistent3to5: c.in3to5 >= 0.7 && c.shownMean >= 3 && c.shownMean <= 5,
    consistentTagsMatch: c.tagMatch >= 0.75,
    noAxisOver80: poleMax <= 0.8,
    consistentNoZero: c.zero === 0,
    noneOver8: c.over8 === 0,
    sealedAbove25: c.exactRate >= 0.35,
    poleMax,
  };
}
const passes = (t) => Object.entries(t).filter(([k]) => k !== "poleMax").every(([, v]) => v);

// ---------------------------------------------------------------- run
const sizes = QUICK ? { random: 120, consistent: 200, speed: 40 } : { random: 400, consistent: 800, speed: 120 };
const pop = population(sizes);
const t0 = Date.now();

const grid = [];
if (!QUICK) {
  for (const tagFire of [1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0]) for (const tagStrong of [2.5, 2.75, 3.0, 3.25, 3.5]) for (const flexBand of [0.08, 0.12, 0.16]) {
    if (tagStrong <= tagFire) continue;
    const cfg = { ...CONFIG, tagFire, tagStrong, flexBand };
    const ev = evaluate(pop, cfg);
    const t = targets(ev);
    grid.push({ tagFire, tagStrong, flexBand, ev, t, ok: passes(t) });
  }
}
const shipped = evaluate(pop, CONFIG, true);
const shippedT = targets(shipped);
const ms = Date.now() - t0;

const fmt = (e) => `tags shown ${e.shownMean.toFixed(2)} (fired ${e.firedMean.toFixed(2)}, strong ${e.strongMean.toFixed(2)}), 3-5 tags ${pct(e.in3to5)}, zero-tag ${e.zero}, tag sign match ${pct(e.tagMatch)} (clear ${pct(e.tagMatchClear)}), axis recovery ${pct(e.axisAcc)} (clear ${pct(e.axisAccClear)}), flex ${pct(e.flexRate)}, unfinished ${pct(e.unfinishedRate)}, sealed exact ${pct(e.exactRate)} / side ${pct(e.sideRate)} / pass ${pct(e.passRate)}`;
const lines = [];
lines.push(`population: ${pop.length} (random ${sizes.random}, consistent ${sizes.consistent} incl. ${sizes.consistent * 0.2} skippers, speed-tappers ${sizes.speed}); 30% teen`);
lines.push(`shipped CONFIG: tagFire ${CONFIG.tagFire}, tagStrong ${CONFIG.tagStrong}, flexBand ${CONFIG.flexBand}, splitMin ${CONFIG.splitMin}`);
for (const k of ["random", "consistent", "skipper", "speed"]) if (shipped[k]) lines.push(`${k.padEnd(10)} ${fmt(shipped[k])}`);
lines.push(`pole share (consistent, % first pole): ${AXES.map((a) => `${a} ${pct(shipped.consistent.poleShare[a])}`).join(", ")}`);
lines.push(`pole share (random clickers, card bias check): ${AXES.map((a) => `${a} ${pct(shipped.random.poleShare[a])}`).join(", ")}`);
lines.push(`targets: ${Object.entries(shippedT).map(([k, v]) => `${k}=${typeof v === "number" ? pct(v) : v ? "PASS" : "FAIL"}`).join(", ")}`);
lines.push(`speed-tapper tags evidenced only by rushed taps: ${shipped.speed.rushedOnlyTags}`);
lines.push(`scored ${grid.length + 1} configs in ${ms} ms`);
console.log(lines.join("\n"));

if (!QUICK) {
  const okGrid = grid.filter((x) => x.ok);
  console.log(`grid: ${okGrid.length} of ${grid.length} configs meet every target`);
  // A worked example: the first consistent adult with a split, at least 3 tags and a typical sealed score (50 to 75% exact).
  let ex = null;
  for (const r of pop.filter((x) => x.kind === "consistent" && !x.teen)) {
    const p = buildProfile(r.answers);
    if (!p.splits.length || p.shownTags.length < 3 || p.type.unfinished.length) continue;
    const c = checkSealed(freezePredictions(p), r.sealed);
    if (c.exactRate !== null && c.exactRate >= 0.5 && c.exactRate <= 0.75) { ex = { r, p }; break; }
  }
  const exDir = path.join(DIR, "sim-example");
  fs.mkdirSync(exDir, { recursive: true });
  const res = buildResult(ex.p);
  const frozen = freezePredictions(ex.p);
  const chk = checkSealed(frozen, ex.r.sealed);
  fs.writeFileSync(path.join(exDir, "answers.json"), JSON.stringify(ex.r.answers, null, 2) + "\n");
  fs.writeFileSync(path.join(exDir, "sealed-answers.json"), JSON.stringify(ex.r.sealed, null, 2) + "\n");
  fs.writeFileSync(path.join(exDir, "hidden.json"), JSON.stringify(ex.r.hidden, null, 2) + "\n");
  fs.writeFileSync(path.join(exDir, "result.json"), JSON.stringify(res, null, 2) + "\n");
  fs.writeFileSync(path.join(exDir, "sealed-results.json"), JSON.stringify(chk, null, 2) + "\n");

  const row = (x) => `| ${x.tagFire} | ${x.tagStrong} | ${x.flexBand} | ${x.ev.random.strongMean.toFixed(2)} | ${x.ev.random.shownMean.toFixed(2)} | ${x.ev.consistent.shownMean.toFixed(2)} | ${pct(x.ev.consistent.in3to5)} | ${x.ev.consistent.zero} | ${pct(x.ev.consistent.tagMatch)} | ${pct(x.ev.consistent.exactRate)} | ${pct(x.ev.consistent.passRate)} | ${pct(x.t.poleMax)} | ${x.ok ? "yes" : "no"} |`;
  const tbl = (e) => `| ${e.n} | ${e.shownMean.toFixed(2)} | ${e.firedMean.toFixed(2)} | ${e.strongMean.toFixed(2)} | ${pct(e.in3to5)} | ${e.zero} | ${pct(e.tagMatch)} | ${pct(e.axisAcc)} | ${pct(e.flexRate)} | ${pct(e.unfinishedRate)} | ${pct(e.exactRate)} | ${pct(e.sideRate)} | ${pct(e.passRate)} |`;
  const md = `# Simulation report (persona quiz v2)

Generated by \`node sim.mjs\` on the assembled kit (\`cards.json\`: ${kit.chapters.reduce((s, c) => s + c.cards.length, 0)} chapter cards, ${kit.finale.length} sealed finale cards). Deterministic seed, so the numbers repeat exactly.

## Population

- **Random clickers** (${sizes.random}): every card answered uniformly at random, normal timing.
- **Consistent respondents** (${sizes.consistent * 0.8}): a hidden position on each of the 6 axes and 25 tag pairs (uniform -1 to +1). Each card picks the option that best fits the hidden profile (small tie noise); 20% of picks are uniformly random. Feeling cards are random.
- **Skippers** (${sizes.consistent * 0.2}, the 20% of the consistent population): consistent, but 25% of cards get Skip, Not my life or No recent example.
- **Speed-tappers** (${sizes.speed}): consistent for the first half; the second half is tapped in 0.3 to 1.4 s with 60% random picks.
- 30% of every group plays the teen run (locked18 cards and tags removed, teen prompts). Sealed answers come from the same hidden profile and the same 20% noise.

## Shipped thresholds (score.mjs CONFIG)

| setting | value | what it does |
|---|---|---|
| tagFire | ${CONFIG.tagFire} | net weighted support (tag minus its pair) needed to fire |
| tagStrong | ${CONFIG.tagStrong} | net support that marks a fired tag strong |
| flexBand | ${CONFIG.flexBand} | normalized axis score below this is Flex |
| splitMin | ${CONFIG.splitMin} | weighted evidence each side needs for a split |
| rushed | under ${CONFIG.rushedMs} ms counts at ${CONFIG.rushedFactor} | brief |

## Results with the shipped thresholds

| group | n | tags shown | fired | strong | 3 to 5 tags | 0 tags | shown tags match hidden | axis recovery (non-flex) | flex rate | unfinished rate | sealed exact | sealed right side | sealed pass |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
${["random", "consistent", "skipper", "speed"].map((k) => `| **${k}** |${tbl(shipped[k]).slice(1)}`).join("\n")}

Tag count distribution, consistent: ${Object.entries(shipped.consistent.tagCounts).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} tags: ${v}`).join(", ")}.
Tag count distribution, random: ${Object.entries(shipped.random.tagCounts).sort((a, b) => a[0] - b[0]).map(([k, v]) => `${k} tags: ${v}`).join(", ")}.

Axis pole share across consistent respondents (share landing on the first pole): ${AXES.map((a) => `${a} ${pct(shipped.consistent.poleShare[a])}`).join(", ")}. Most lopsided: ${pct(shippedT.poleMax)}. Random clickers show whether the cards themselves lean to one pole (a balanced axis sits near 50%): ${AXES.map((a) => `${a} ${pct(shipped.random.poleShare[a])}`).join(", ")}.

Sealed exact chance is about 25% (4 options each). Consistent respondents: ${pct(shipped.consistent.exactRate)} exact, ${pct(shipped.consistent.sideRate)} right side, with Genii passing on ${pct(shipped.consistent.passRate)} of checks (flex or unfinished axis). Random clickers: ${pct(shipped.random.exactRate)} exact, which is chance, as it should be.

Speed-tappers: tags shown whose only supporting evidence was rushed taps: ${shipped.speed.rushedOnlyTags} (a tag needs at least one calm card).

## Targets

| target | result |
|---|---|
| random clickers average under 1.5 strong tags | ${shipped.random.strongMean.toFixed(2)}: ${shippedT.randomStrongUnder1_5 ? "pass" : "FAIL"} |
| consistent respondents get 3 to 5 tags | mean ${shipped.consistent.shownMean.toFixed(2)}, ${pct(shipped.consistent.in3to5)} in 3 to 5: ${shippedT.consistent3to5 ? "pass" : "FAIL"} |
| most shown tags match the hidden profile | ${pct(shipped.consistent.tagMatch)}: ${shippedT.consistentTagsMatch ? "pass" : "FAIL"} |
| no axis above 80% on one pole | max ${pct(shippedT.poleMax)}: ${shippedT.noAxisOver80 ? "pass" : "FAIL"} |
| no consistent respondent gets 0 tags | ${shipped.consistent.zero}: ${shippedT.consistentNoZero ? "pass" : "FAIL"} |
| nobody is shown more than 8 (the page caps at 5) | ${shippedT.noneOver8 ? "pass" : "FAIL"}; before the cap, consistent respondents fire ${shipped.consistent.firedMean.toFixed(1)} on average (max ${shipped.consistent.firedMax}), random clickers ${shipped.random.firedMean.toFixed(1)} |
| sealed exact clearly above 25% (consistent) | ${pct(shipped.consistent.exactRate)}: ${shippedT.sealedAbove25 ? "pass" : "FAIL"} |

## Tuning grid

Every combination was scored on the same population. "ok" means every target above passes.

| tagFire | tagStrong | flexBand | random strong | random shown | consistent shown | consistent 3 to 5 | consistent 0 tags | tag match | sealed exact | sealed pass | max pole | ok |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
${grid.map(row).join("\n")}

${okGrid.length} of ${grid.length} combinations meet every target. Why the shipped values:

- **tagFire ${CONFIG.tagFire}**: the highest fire threshold that keeps consistent respondents in 3 to 5 tags. Lower values (1.5 to 2.0) also pass but show random clickers 3.4 to 4.7 tags; higher values (2.75 and up) push consistent respondents under 3 and leave some with none. Support comes in steps (0.45, 0.55 or 0.80 times strength 1 to 3), so the grid moves in jumps.
- **tagStrong ${CONFIG.tagStrong}**: random clickers average well under 1.5 strong tags (the brief's bar) while consistent respondents average about 3.
- **tagFloor ${CONFIG.tagFloor}**: if nothing fires, the single best candidate that meets the same card rules shows as "leaning", so nobody leaves with 0 tags (it rescued the only consistent respondent who had none at tagFire ${CONFIG.tagFire}).
- **flexBand ${CONFIG.flexBand}**: the middle value. Wider bands raise Genii's sealed passes without raising exact hits much; narrower ones call more near-ties.

## Reading the numbers

- Random clickers still see some tags (shown ${shipped.random.shownMean.toFixed(2)} on average) because their picks sometimes line up by chance; only ${shipped.random.strongMean.toFixed(2)} of them are strong. The result page labels a tag "strong" only above tagStrong.
- Recovery is measured against a synthetic hidden profile. It shows the parser is consistent with the card evidence, not that the cards measure a real person. Blind test 2 is the real check.
- Worked example: \`sim-example/\` (answers, sealed answers, hidden profile, result, sealed results), used in RESULT-TEMPLATE.md.
`;
  fs.writeFileSync(path.join(DIR, "SIM-REPORT.md"), md);
  console.log("wrote SIM-REPORT.md and sim-example/");
}

process.exitCode = passes(shippedT) ? 0 : 1;
if (!passes(shippedT)) console.error("shipped CONFIG misses at least one target");
