// node --test tests.mjs
// Kit integrity, run order rules and scoring edge cases for persona quiz v2. Plain Node, no dependencies.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { kit, lib, cardById, runCards, buildProfile, buildResult, freezePredictions, checkSealed, buildFriendDeck, promptFor, CONFIG, rankTags, twistOrder, cardLink, friendMapping } from "./score.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
const TAGS = new Set(lib.tags.map((t) => t.id));
const TAG = Object.fromEntries(lib.tags.map((t) => [t.id, t]));
const FRIEND = JSON.parse(fs.readFileSync(path.join(DIR, "friend.json"), "utf8"));
const TYPES = new Set(["scenario", "real", "this_or_that", "role", "pick_two", "feeling", "sealed"]);
const WEIGHT = { real: 0.8, scenario: 0.55, this_or_that: 0.45, role: 0.45, pick_two: 0.45, feeling: 0, sealed: 0 };
const chapterCards = kit.chapters.flatMap((c) => c.cards);
const everyCard = [...chapterCards, ...kit.finale, ...kit.extras];
const dims = (c) => {
  const s = new Set();
  for (const o of c.options) {
    for (const a of Object.keys(o.axes || {})) s.add(a);
    for (const t of o.tags || []) s.add(t.id.slice(0, 3));
  }
  return s;
};
const ADULT = { setup: { age: "adult", closest: "best friend", pronoun: "they" } };
const TEEN = { setup: { age: "teen", closest: "best friend", pronoun: "she" } };

// ------------------------------------------------------------ format
test("cards.json format", () => {
  assert.equal(kit.version, "persona-quiz-v2");
  assert.equal(kit.chapters.length, 7);
  kit.chapters.forEach((ch, i) => {
    assert.equal(ch.n, i + 1);
    assert.ok(ch.title && ch.intro, `chapter ${ch.n} needs a title and intro`);
    assert.ok(ch.cards.length >= 7 && ch.cards.length <= 10, `chapter ${ch.n} has ${ch.cards.length} cards`);
    for (const c of ch.cards) assert.notEqual(c.type, "sealed", `${c.id}: sealed cards run only in the finale`);
  });
  assert.equal(kit.finale.length, 8);
  for (const c of kit.finale) assert.equal(c.type, "sealed");
  const ids = everyCard.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "card ids are unique");
  const total = chapterCards.length;
  assert.ok(total >= 56 && total <= 64, `chapter cards ${total} within 56 to 64`);
});

test("every card: type, weight, options, exits, friend side", () => {
  for (const c of everyCard) {
    assert.ok(TYPES.has(c.type), `${c.id}: type ${c.type}`);
    assert.equal(c.weight, WEIGHT[c.type], `${c.id}: weight`);
    assert.ok(c.prompt && c.prompt.length > 10, `${c.id}: prompt`);
    assert.ok(c.exits.includes("skip") && c.exits.includes("not_my_life"), `${c.id}: Skip and Not my life`);
    assert.equal(c.exits.includes("no_recent"), c.type === "real", `${c.id}: No recent example only on real cards`);
    const n = c.options.length;
    const range = { this_or_that: [2, 3], pick_two: [6, 6], role: [5, 6], scenario: [4, 6], real: [4, 5], feeling: [5, 5], sealed: [4, 5] }[c.type];
    assert.ok(n >= range[0] && n <= range[1], `${c.id}: ${n} options for ${c.type}`);
    if (c.type === "pick_two") assert.equal(c.pick, 2);
    for (const o of c.options) assert.ok(o.t && o.t.length <= 90, `${c.id}: option text "${o.t}"`);
    if (c.friend) {
      assert.ok(c.friend.prompt && c.friend.a.t && c.friend.b.t, `${c.id}: friend field`);
      assert.equal(c.privacy, "normal", `${c.id}: private cards carry no friend field`);
    }
    if (c.follows) {
      const i = chapterCards.findIndex((x) => x.id === c.id);
      assert.equal(chapterCards[i - 1].id, c.follows, `${c.id} must sit right after ${c.follows}`);
    }
    if (c.flip) {
      assert.equal(c.flip.options.length, 3, `${c.id}: flip has 3 presets`);
      assert.ok(c.options.some((o) => o.depends), `${c.id}: flip needs a depends option`);
    }
    if (c.options.some((o) => o.depends)) assert.ok(c.flip, `${c.id}: depends option needs a flip`);
  }
});

test("every tag id and axis value is valid; circumstance and feeling options score nothing", () => {
  for (const c of everyCard) {
    for (const o of c.options) {
      const ax = Object.entries(o.axes || {});
      assert.ok(ax.length <= 2, `${c.id}: at most 2 axes per option`);
      for (const [k, v] of ax) {
        assert.ok(AXES.includes(k), `${c.id}: axis ${k}`);
        assert.ok(Number.isInteger(v) && v !== 0 && Math.abs(v) <= 2, `${c.id}: axis value ${v}`);
      }
      assert.ok((o.tags || []).length <= 3, `${c.id}: at most 3 tags per option`);
      for (const t of o.tags || []) {
        assert.ok(TAGS.has(t.id), `${c.id}: tag ${t.id}`);
        assert.ok([1, 2, 3].includes(t.s), `${c.id}: strength ${t.s}`);
      }
      if (o.circumstance || c.type === "feeling" || o.depends) assert.equal(ax.length + (o.tags || []).length, 0, `${c.id}: "${o.t}" must score nothing`);
    }
  }
  for (const t of lib.tags) {
    assert.ok(TAGS.has(t.pair) && TAG[t.pair].pair === t.id, `${t.id}: clean pair`);
    for (const k of ["name", "sting", "heart", "never"]) assert.ok(t[k], `${t.id}: ${k}`);
    assert.ok(t.calls.length >= 2 && t.calls.length <= 3, `${t.id}: 2 or 3 calls`);
  }
  assert.equal(lib.relationship.length, 8);
  assert.equal(lib.life.length, 8);
});

test("every tag and axis is reachable by at least 2 cards (adult and teen runs)", (t) => {
  const noReal = [];
  for (const [label, setup] of [["adult", ADULT.setup], ["teen", TEEN.setup]]) {
    const run = runCards(setup);
    for (const ax of AXES) {
      const n = run.filter((c) => c.options.some((o) => (o.axes || {})[ax])).length;
      assert.ok(n >= 2, `${label}: ${ax} reachable by ${n} cards`);
    }
    for (const tag of lib.tags) {
      if (label === "teen" && tag.locked18) continue;
      const cards = run.filter((c) => c.options.some((o) => (o.tags || []).some((x) => x.id === tag.id)));
      assert.ok(cards.length >= 2, `${label}: ${tag.id} reachable by ${cards.length} cards`);
      if (label === "adult" && !cards.some((c) => c.type === "real")) noReal.push(tag.id);
    }
  }
  t.diagnostic(`tags with no real-card trigger (only would/believe evidence): ${noReal.join(", ")}`);
  assert.ok(noReal.length <= 30, "at least 20 of 50 tags have a real-card trigger");
});

// DATA TEST (fix pass 2026-09-26, open item 1). Fails until the card agents unstick the thin tags; do not weaken it.
// A tag that cannot reach tagFire from 2+ run cards can never fire for anybody. Maximum support per card = best
// option strength x card weight (pick_two: best two picks), the same measure as check-src.cjs. Adult run: all 50 tags;
// teen run: every tag except locked18 (a teen loses C3-8, C3-9, C6-9 and C6-11).
test("every tag can fire: maximum support from the run cards >= tagFire from at least 2 cards (adult and teen)", () => {
  const stuck = [];
  for (const [label, setup] of [["adult", ADULT.setup], ["teen", TEEN.setup]]) {
    const run = runCards(setup);
    for (const tag of lib.tags) {
      if (label === "teen" && tag.locked18) continue;
      let max = 0, cards = 0;
      for (const c of run) {
        const v = c.options.map((o) => ((o.tags || []).find((x) => x.id === tag.id) || { s: 0 }).s).sort((a, b) => b - a);
        const best = (c.type === "pick_two" ? v[0] + (v[1] || 0) : v[0]) * c.weight;
        if (best > 0) { max += best; cards++; }
      }
      if (max < CONFIG.tagFire - 1e-9 || cards < CONFIG.tagMinCards) stuck.push(`${label} ${tag.id} max ${max.toFixed(2)} from ${cards}`);
    }
  }
  assert.deepEqual(stuck, [], `${stuck.length} tag checks cannot fire:\n  ${stuck.join("\n  ")}`);
});

// ------------------------------------------------------------ run order
function checkOrder(run, label) {
  for (let i = 1; i < run.length; i++) {
    const a = run[i - 1], b = run[i];
    const shared = [...dims(a)].filter((d) => dims(b).has(d));
    assert.deepEqual(shared, [], `${label}: ${a.id} and ${b.id} are neighbours on ${shared.join(", ")}`);
    if (a.type === b.type && a.type !== "sealed") {
      assert.equal(a.type, "this_or_that", `${label}: ${a.id} and ${b.id} are both ${a.type}`);
      assert.equal(a.round, b.round, `${label}: ${a.id} and ${b.id} are this_or_that outside one round`);
    }
  }
}

test("run order: no neighbours on the same axis or tag pair, types rotate, rounds of up to 3", () => {
  for (const [label, s] of [["adult", ADULT.setup], ["teen", TEEN.setup]]) {
    const run = [...runCards(s), ...kit.finale];
    checkOrder(run, label);
    const rounds = {};
    for (const c of runCards(s)) if (c.round) rounds[c.round] = (rounds[c.round] || 0) + 1;
    for (const [r, n] of Object.entries(rounds)) assert.ok(n <= 3, `${label}: round ${r} has ${n}`);
  }
  const chapterRun = runCards(ADULT.setup);
  const reals = chapterRun.map((c, i) => (c.type === "real" ? i : -1)).filter((i) => i >= 0);
  const early = reals.filter((i) => i < (chapterRun.length * 2) / 3).length;
  assert.ok(early >= reals.length / 2, `${early} of ${reals.length} real cards in the first two thirds`);
});

// DATA TEST (fix pass 2026-09-26, open item 7). C1-3, C3-6 and C6-5 were cut; the 18+ role card C6-11 was added so T21
// can fire. Ruling: the adult chapter run is 56 to 61 cards (69 at most with the 8-card finale), and the teen run, which
// skips the locked18 cards, is at most 60.
test("run length: adult chapter run is 56 to 61 cards, teen at most 60", () => {
  const n = runCards(ADULT.setup).length;
  assert.ok(n >= 56 && n <= 61, `adult chapter run is ${n} cards (want 56 to 61)`);
  const t = runCards(TEEN.setup).length;
  assert.ok(t <= 60, `teen chapter run is ${t} cards (want at most 60)`);
});

test("finale covers all six axes plus common tags", () => {
  const covered = new Set(kit.finale.flatMap((c) => c.checks.axes));
  for (const ax of AXES) assert.ok(covered.has(ax), `finale checks ${ax}`);
  assert.ok(kit.finale.filter((c) => !c.checks.primary || c.checks.pairs.length).length >= 2);
  for (const c of kit.finale) {
    const scored = c.options.filter((o) => Object.keys(o.axes || {}).length || (o.tags || []).length).length;
    assert.ok(scored >= 3, `${c.id}: at least 3 sealed options carry evidence, so the guess is computed`);
  }
});

// ------------------------------------------------------------ copy
test("no em dash anywhere in the kit", () => {
  const files = fs.readdirSync(DIR, { recursive: true }).filter((f) => /\.(json|md|mjs|html|txt)$/.test(f));
  assert.ok(files.length > 5);
  for (const f of files) {
    const s = fs.readFileSync(path.join(DIR, f), "utf8");
    assert.ok(!s.includes(String.fromCharCode(0x2014)), `${f} contains an em dash`);
  }
});

// ------------------------------------------------------------ teen
test("teen run skips locked18 cards, uses teen prompts, never scores locked18 tags", () => {
  const run = runCards(TEEN.setup);
  assert.ok(run.every((c) => c.privacy !== "locked18"));
  const locked = chapterCards.filter((c) => c.privacy === "locked18").map((c) => c.id);
  assert.deepEqual(locked, ["C3-8", "C3-9", "C6-9", "C6-11"], "the 18+ cards");
  for (const id of locked) assert.ok(!run.some((c) => c.id === id), `${id} not in teen run`);
  assert.equal(runCards(ADULT.setup).length - run.length, 4);
  assert.equal(promptFor(cardById["C1-2"], TEEN.setup), cardById["C1-2"].teenPrompt);
  assert.equal(promptFor(cardById["C1-2"], ADULT.setup), cardById["C1-2"].prompt);
  // C6-7 is teen-visible but carries T21 (locked18): a teen profile must never hold it.
  const a = { ...TEEN, "C6-7": [0, 3], "C6-3": 1, "C6-1": 0, "C6-9": 0, "C6-11": 0, "C3-8": [0, 1] };
  const p = buildProfile(a);
  assert.ok(!Object.keys(p.tags).some((id) => TAG[id].locked18), "no locked18 tag in a teen profile");
  for (const id of ["C6-9", "C6-11", "C3-8"]) assert.ok(p.warnings.some((w) => w.includes(id)), `${id} answer ignored for a teen`);
});

test("C3-9 plays only after a T11A pick on C3-8", () => {
  const off = buildProfile({ ...ADULT, "C3-8": [3, 4], "C3-9": 1 });
  assert.ok(off.research.gatedOut.includes("C3-9"));
  const on = buildProfile({ ...ADULT, "C3-8": [0, 3], "C3-9": 1 });
  assert.ok(!on.research.gatedOut.includes("C3-9"));
  assert.ok(on.axes.L2.evidence.some((e) => e.card === "C3-9"));
});

// ------------------------------------------------------------ scoring
test("weights by card type and rushed answers at 0.3", () => {
  const p = buildProfile({ ...ADULT, "C2-1": 0, "C2-5": 0, "C2-8": 0, _ms: { "C2-1": 4000, "C2-5": 900, "C2-8": 5000 } });
  const ev = Object.fromEntries(p.axes.R2.evidence.map((e) => [e.card, e.w]));
  assert.equal(ev["C2-1"], 0.55);
  assert.equal(ev["C2-5"], 0.24); // 0.80 x 0.3, rushed
  assert.equal(ev["C2-8"], 0.45);
  assert.equal(p.axes.R2.score, Math.round((0.55 * 2 + 0.24 * 2 + 0.45 * 2) * 1000) / 1000);
});

test("circumstance, Not my life, No recent example and Skip never count", () => {
  const p = buildProfile({ ...ADULT, "C4-1": 3, "C5-2": 2, "C5-6": "not_my_life", "C7-3": "skip", "C6-2": "no_recent", "C4-8": [0, 1] });
  assert.deepEqual(p.research.circumstance.map((x) => x.card).sort(), ["C4-1", "C5-2"]);
  assert.deepEqual(p.research.notMyLife, ["C5-6"]);
  assert.deepEqual(p.research.noRecent, ["C6-2"]);
  assert.deepEqual(p.research.skipped, ["C7-3"]);
  assert.deepEqual(p.axes.L1.evidence.map((e) => e.card), ["C4-8", "C4-8"]);
  assert.equal(p.axes.L1.cards, 1);
  assert.equal(p.axes.L1.unfinished, true, "one valid card leaves the axis unfinished");
});

test("unfinished axis offers extras, and the extras finish it", () => {
  const p = buildProfile({ ...ADULT, "C3-1": 1 });
  assert.equal(p.axes.R3.unfinished, true);
  const r = buildResult(p);
  const u = r.unfinished.find((x) => x.axis === "R3");
  assert.deepEqual(u.extras, ["X-R3-1", "X-R3-2"]);
  assert.equal(u.line, lib.unfinished.line);
  const p2 = buildProfile({ ...ADULT, "C3-1": 1, "X-R3-1": 1 });
  assert.equal(p2.axes.R3.unfinished, false);
  assert.equal(p2.axes.R3.pole, -1);
});

test("flex: tie broken by real-card evidence first, then the first card", () => {
  // C2-1 +2 (0.55) and C2-8 -2 (0.45): norm 0.1, no real card, first card C2-1 decides.
  const a = buildProfile({ ...ADULT, "C2-1": 0, "C2-8": 2 });
  assert.equal(a.axes.R2.flex, true);
  assert.equal(a.axes.R2.pole, 1);
  assert.match(a.axes.R2.decidedBy, /first card C2-1/);
  // C2-1 -2, C3-12 +2 (real), C2-8 -1: near zero, real evidence says Direct although the first card says Soft.
  const b = buildProfile({ ...ADULT, "C2-1": 1, "C3-12": 0, "C2-8": 4 });
  assert.equal(b.axes.R2.flex, true);
  assert.equal(b.axes.R2.pole, 1);
  assert.equal(b.axes.R2.decidedBy, "real cards");
  assert.ok(buildResult(b).type.badges.some((x) => x.axis === "R2" && x.badge === "Flex"));
});

test("split: believe one way, did the other, becomes the plot twist", () => {
  const p = buildProfile({ ...ADULT, "C2-8": 0, "C2-5": 2, "C3-12": 3 });
  const s = p.splits.find((x) => x.dim === "R2");
  assert.ok(s, "R2 split found");
  assert.ok(s.believe > 0 && s.act < 0);
  assert.equal(s.did.grade, "did");
  const r = buildResult(p);
  assert.match(r.plotTwist.line, /^You'd say: .* Last time, you did: /);
  assert.equal(s.twistOk, true, "axis splits always qualify for the twist");
});

// ------------------------------------------------------------ plot twist restriction (open item 4)
const believeCards = () => runCards(ADULT.setup).filter((c) => c.grade === "believe" && !c.gateRule);
const actCards = () => runCards(ADULT.setup).filter((c) => (c.grade === "did" || c.grade === "would") && !c.gateRule);
const ans1 = (c, i) => (c.type === "pick_two" ? [i] : i);
// First believe/act option couple with opposite sides of one tag pair and no axis in common, filtered by link.
function tagSplitFixture(linked) {
  for (const b of believeCards()) for (const a of actCards()) {
    if (!!cardLink(b.id, a.id) !== linked) continue;
    for (const [i, ob] of b.options.entries()) for (const [j, oa] of a.options.entries()) {
      if (Object.keys(ob.axes || {}).some((k) => (oa.axes || {})[k])) continue;
      const t = (ob.tags || []).find((x) => (oa.tags || []).some((y) => y.id === TAG[x.id].pair));
      if (!t) continue;
      const p = buildProfile({ ...ADULT, [b.id]: ans1(b, i), [a.id]: ans1(a, j) });
      const s = p.splits.find((x) => x.dim === t.id.slice(0, 3));
      if (s) return { b, a, p, s };
    }
  }
  return null;
}

test("plot twist: a tag-pair split joins two cards only when they share a Sally question or chapter", () => {
  const off = tagSplitFixture(false);
  assert.ok(off, "fixture: an unlinked believe/act tag-pair split exists in the run");
  assert.equal(off.s.kind, "tag pair");
  assert.equal(off.s.twistOk, false, `${off.b.id} and ${off.a.id} share no Sally question or chapter`);
  assert.equal(off.s.link, null);
  assert.equal(buildResult(off.p).plotTwist, null, `no plot twist from ${off.b.id} + ${off.a.id}`);

  const on = tagSplitFixture(true);
  assert.ok(on, "fixture: a linked believe/act tag-pair split exists in the run");
  assert.equal(on.s.twistOk, true);
  assert.equal(on.s.link, cardLink(on.b.id, on.a.id));
  assert.match(on.s.link, /^(sally Q\d+|chapter \d)$/);
  const tw = buildResult(on.p).plotTwist;
  assert.ok(tw && tw.dim === on.s.dim, `twist from the linked couple ${on.b.id} + ${on.a.id}`);
  assert.equal(tw.said.card, on.b.id);
  assert.equal(tw.did.card, on.a.id);

  // Every twist on a real run respects the rule.
  const ex = buildProfile(JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8")));
  for (const s of ex.splits.filter((x) => x.twistOk && x.kind === "tag pair")) assert.ok(cardLink(s.said.card, s.did.card), `${s.dim}: quoted cards are linked`);
});

test("plot twist order: eligible first, then a real card, then axis over tag pair, then strength", () => {
  const sp = (dim, kind, grade, strength, twistOk = true) => ({ dim, kind, strength, twistOk, did: { grade } });
  const order = (xs) => [...xs].sort(twistOrder).map((x) => x.dim);
  // Axis beats a stronger tag pair at the same grade.
  assert.deepEqual(order([sp("T05", "tag pair", "did", 2.0), sp("R2", "axis", "did", 0.5)]), ["R2", "T05"]);
  // A real (did) card still beats an axis split acted on a scenario.
  assert.deepEqual(order([sp("R2", "axis", "would", 2.0), sp("T05", "tag pair", "did", 0.5)]), ["T05", "R2"]);
  // An unlinked tag pair never leads, whatever its strength or grade.
  assert.deepEqual(order([sp("T05", "tag pair", "did", 3.0, false), sp("L1", "axis", "would", 0.4)]), ["L1", "T05"]);
  // Same kind and grade: stronger first.
  assert.deepEqual(order([sp("L1", "axis", "did", 0.6), sp("L2", "axis", "did", 1.2)]), ["L2", "L1"]);
});

// ------------------------------------------------------------ shown-tag ranking (open item 1, scorer part)
test("tag ranking: strong tags first by net, the rest by coverage share, then net", () => {
  const raw = { T01A: { net: 3.4, share: 0.6 }, T02A: { net: 3.1, share: 1.0 }, T03A: { net: 2.95, share: 0.7 }, T04A: { net: 2.3, share: 1.0 }, T05A: { net: 2.5, share: 1.0 }, T06A: { net: 2.9, share: 0.95 } };
  const tags = Object.fromEntries(Object.keys(raw).map((id) => [id, { cards: 2 }]));
  assert.deepEqual(rankTags(Object.keys(raw), raw, tags, CONFIG), ["T01A", "T02A", "T05A", "T04A", "T06A", "T03A"]);
  assert.deepEqual(rankTags(Object.keys(raw), raw, tags, { ...CONFIG, tagRank: "net" }), ["T01A", "T02A", "T03A", "T06A", "T05A", "T04A"]);
  // Deterministic ties: more cards, then id.
  const tied = { T07A: { net: 2.5, share: 0.8 }, T08A: { net: 2.5, share: 0.8 }, T09A: { net: 2.5, share: 0.8 } };
  assert.deepEqual(rankTags(["T09A", "T07A", "T08A"], tied, { T07A: { cards: 2 }, T08A: { cards: 3 }, T09A: { cards: 2 } }, CONFIG), ["T08A", "T07A", "T09A"]);
});

test("tag ranking: share = net / the most the answered cards could give; exits, circumstance and depends excluded", () => {
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  const p = buildProfile(answers);
  // Independent recomputation of the denominator.
  const scoring = runCards(answers.setup).map((c) => [c, answers[c.id]]).filter(([c, v]) => v !== undefined && typeof v !== "string" && c.weight)
    .filter(([c, v]) => (Array.isArray(v) ? v : [v]).some((i) => !c.options[i].circumstance && !c.options[i].depends));
  for (const [id, t] of Object.entries(p.tags)) {
    let possible = 0;
    for (const [c] of scoring) {
      const ms = answers._ms[c.id];
      const w = c.weight * (ms !== undefined && ms < CONFIG.rushedMs ? CONFIG.rushedFactor : 1);
      const v = c.options.map((o) => Math.max(0, (o.tags || []).reduce((s, x) => s + (x.id === id ? x.s : x.id === TAG[id].pair ? -x.s : 0), 0))).sort((a, b) => b - a);
      possible += w * (c.type === "pick_two" ? v[0] + (v[1] || 0) : v[0]);
    }
    assert.ok(Math.abs(t.possible - possible) < 0.002, `${id}: possible ${t.possible} vs ${possible}`);
    if (possible) assert.ok(Math.abs(t.share - t.net / possible) < 0.002, `${id}: share`);
    if (t.fired) assert.ok(t.share <= 1.0005, `${id}: a fired tag's share is at most 1`);
  }
  // Shown order follows the ranking: strong by net, then the rest by share, then net.
  const sh = p.shownTags.map((id) => p.tags[id]);
  for (let i = 1; i < sh.length; i++) {
    const a = sh[i - 1], b = sh[i];
    if (a.strong !== b.strong) assert.ok(a.strong, "strong tags come first");
    else if (a.strong) assert.ok(a.net >= b.net, "strong tags by net");
    else assert.ok(a.share > b.share || (a.share === b.share && a.net >= b.net), "other tags by share, then net");
  }
  // A circumstance pick leaves the card out of the denominator; an exit does too.
  const card = runCards(ADULT.setup).find((c) => c.options.some((o) => o.circumstance) && c.options.some((o) => (o.tags || []).length));
  const ci = card.options.findIndex((o) => o.circumstance);
  const tagId = card.options.find((o) => (o.tags || []).length).tags[0].id;
  const other = runCards(ADULT.setup).find((c) => c.id !== card.id && c.options.some((o) => (o.tags || []).some((x) => x.id === tagId)));
  const oi = other.options.findIndex((o) => (o.tags || []).some((x) => x.id === tagId));
  const withCirc = buildProfile({ ...ADULT, [card.id]: ci, [other.id]: ans1(other, oi) });
  const withExit = buildProfile({ ...ADULT, [card.id]: "skip", [other.id]: ans1(other, oi) });
  const withAnswer = buildProfile({ ...ADULT, [card.id]: ci === 0 ? 1 : 0, [other.id]: ans1(other, oi) });
  assert.equal(withCirc.tags[tagId].possible, withExit.tags[tagId].possible, `${card.id} circumstance pick is not in ${tagId}'s denominator`);
  assert.ok(withAnswer.tags[tagId].possible > withCirc.tags[tagId].possible, `${card.id} answered normally does count`);
});

test("tags: 2 separate cards, 1 not rushed, net over threshold, pair subtracts, max 5", () => {
  const base = { ...ADULT, "C6-10": 0, "C7-1": 0, "C7-4": 0, "C7-7": 0 };
  const calm = buildProfile(base);
  assert.equal(calm.tags.T25A.fired, true);
  const rushedAll = buildProfile({ ...base, _ms: { "C6-10": 500, "C7-1": 500, "C7-4": 500, "C7-7": 500 } });
  assert.equal(rushedAll.tags.T25A.fired, false, "all-rushed support never fires");
  const oneCard = buildProfile({ ...ADULT, "C7-1": 0 });
  assert.ok(!oneCard.tags.T25A.fired, "one card never fires");
  const paired = buildProfile({ ...base, "C7-4": 2, "C7-7": 1 });
  assert.ok(paired.tags.T25A.net < calm.tags.T25A.net, "pair support subtracts");
  // A strongly consistent full run never shows more than 5, and spreads chapters.
  const full = { ...ADULT, _ms: {} };
  for (const c of runCards(ADULT.setup)) {
    const scoreOpt = (o) => (o.tags || []).reduce((s, t) => s + (t.id.endsWith("A") ? t.s : 0), 0);
    const order = c.options.map((o, i) => [i, scoreOpt(o)]).sort((x, y) => y[1] - x[1]).map(([i]) => i);
    full[c.id] = c.type === "pick_two" ? order.slice(0, 2) : order[0];
  }
  const pf = buildProfile(full);
  assert.ok(pf.shownTags.length <= CONFIG.maxTags);
  assert.ok(new Set(pf.shownTags.map((id) => TAG[id].chapter)).size >= 3, "shown tags span 3 chapters");
});

test("research record: depends picks with flip answers, emotions, feelings", () => {
  // C1-3 (the feeling card after C1-2) was cut; C2-6 is the feeling card after C2-5, option 3 "Guilty...".
  const p = buildProfile({ ...ADULT, "C7-3": 3, "C7-3.flip": 1, "C1-2": 0, "C2-5": 1, "C2-6": 3 });
  assert.ok(cardById["C7-3"].options[3].depends && cardById["C2-6"].follows === "C2-5", "fixture cards");
  assert.deepEqual(p.research.depends, [{ card: "C7-3", said: cardById["C7-3"].options[3].t, flip: cardById["C7-3"].flip.options[1] }]);
  assert.ok(p.emotions.some((e) => e.emotion === "warmth" && e.from.some((f) => f.startsWith("C1-2:"))));
  assert.equal(p.feelings.length, 1);
  assert.equal(p.feelings[0].follows, "C2-5");
  assert.equal(p.feelings[0].feeling, "guilt");
});

test("sealed: passes on flex or unfinished axes; check scores exact and side", () => {
  const p = buildProfile({ ...ADULT, "C2-1": 0, "C2-5": 0, "C2-8": 0 });
  const frozen = freezePredictions(p);
  const r2 = frozen.predictions.find((x) => x.id === "C2-10");
  assert.equal(r2.pass, false);
  assert.equal(r2.predicted, 0, "a Direct profile predicts the direct line");
  const r3 = frozen.predictions.find((x) => x.id === "C6-S1");
  assert.equal(r3.pass, true, "R3 unfinished: Genii passes");
  const res = checkSealed(frozen, { "C2-10": 0, "C6-S1": 1 });
  const row = res.rows.find((x) => x.id === "C2-10");
  assert.equal(row.status, "hit");
  assert.equal(res.rows.find((x) => x.id === "C6-S1").status, "pass");
});

// ------------------------------------------------------------ CLI: freeze refusal and tamper check
function cli(args, cwd) {
  return spawnSync(process.execPath, [path.join(DIR, "score.mjs"), ...args], { cwd, encoding: "utf8" });
}

test("CLI: profile, freeze once, refuse refreeze, refuse tampered predictions, check, friend", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genii-v2-"));
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  fs.writeFileSync(path.join(tmp, "answers.json"), JSON.stringify(answers));
  fs.writeFileSync(path.join(tmp, "sealed-answers.json"), fs.readFileSync(path.join(DIR, "sim-example", "sealed-answers.json")));
  assert.equal(cli(["profile", "answers.json"], tmp).status, 0);
  assert.ok(fs.existsSync(path.join(tmp, "result.json")));
  const f1 = cli(["freeze"], tmp);
  assert.equal(f1.status, 0, f1.stderr);
  const sha = f1.stdout.match(/sha256 ([0-9a-f]{64})/)[1];
  const f2 = cli(["freeze"], tmp);
  assert.equal(f2.status, 1, "second freeze is refused");
  assert.match(f2.stderr, /Refusing to refreeze/);
  assert.equal(fs.readFileSync(path.join(tmp, "sealed-predictions.sha256"), "utf8").split(/\s+/)[0], sha, "hash unchanged");
  const ck = cli(["check", "sealed-answers.json"], tmp);
  assert.equal(ck.status, 0, ck.stderr);
  const res = JSON.parse(fs.readFileSync(path.join(tmp, "sealed-results.json"), "utf8"));
  assert.equal(res.sha256, sha);
  const pred = path.join(tmp, "sealed-predictions.json");
  fs.writeFileSync(pred, fs.readFileSync(pred, "utf8").replace(/"predicted": \d/, '"predicted": 3'));
  assert.equal(cli(["check", "sealed-answers.json"], tmp).status, 1, "tampered predictions are refused");
  const fr = cli(["friend", "--rel", "bestie", "--stings", "on"], tmp);
  assert.equal(fr.status, 0, fr.stderr);
  const deck = JSON.parse(fs.readFileSync(path.join(tmp, "friend-deck.json"), "utf8"));
  assert.equal(deck.level1.length, 6);
  assert.ok(deck.level4 && deck.level4.enabled);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// ------------------------------------------------------------ friend game
test("friend deck: 12 level 2 cards, never private or rushed; 12 tag cards with N true", () => {
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  answers._ms["C2-1"] = 800; // rushed: must not appear
  const p = buildProfile(answers);
  for (const rel of ["partner", "crush", "friendOrCoworker", "bestie"]) {
    const d = buildFriendDeck(p, answers, { rel, seed: 7 });
    assert.equal(d.level1.length, 6);
    assert.ok(d.level2.cards.length <= 12 && d.level2.cards.length >= 6, `${rel}: ${d.level2.cards.length} level 2 cards`);
    for (const c of d.level2.cards) {
      assert.equal(cardById[c.id].privacy, "normal");
      assert.notEqual(c.id, "C2-1", "rushed card excluded");
      assert.ok(["a", "b"].includes(c.answer));
    }
    const levels = FRIEND.relationships.options.find((o) => o.id === rel).cardLevels;
    for (const c of d.level2.cards) assert.ok(levels.includes(FRIEND.level2.cards[c.id].level), `${rel}: ${c.id} level allowed`);
    if (rel === "friendOrCoworker") assert.ok(!d.level2.cards.some((c) => ["C1-2", "C3-3", "C3-1", "C3-2", "C3-4", "C3-5", "C3-12"].includes(c.id)), "no love or couple cards for a friend or coworker");
    if (!d.level3.skipped) {
      assert.equal(d.level3.cards.length, 12);
      assert.equal(d.level3.cards.filter((c) => c.role === "true").length, d.level3.N);
      assert.equal(d.level3.cards.filter((c) => c.role === "opposite").length, d.level3.N);
      const pairs = d.level3.cards.map((c) => c.id.slice(0, 3));
      assert.equal(new Set(pairs.filter((x, i) => d.level3.cards[i].role === "decoy")).size, d.level3.cards.filter((c) => c.role === "decoy").length);
      for (const c of d.level3.cards) assert.ok(!("sting" in c), "tag cards show name and heart only");
    }
    if (rel !== "bestie") assert.equal(d.level4, null);
  }
});

// friend.json level2.cards is a snapshot of the chapter files. If a card's options or friend field change, recompute it
// (level2.answerMapping; /private/tmp/claude-501/quiz-v2-tools/friend-snapshot.mjs does it) so it never goes stale.
test("friend game: level 2 snapshot matches the cards; primary lists are clean", () => {
  const L2 = FRIEND.level2;
  const friendCards = chapterCards.filter((c) => c.friend);
  assert.deepEqual(Object.keys(L2.cards).sort(), friendCards.map((c) => c.id).sort(), "one snapshot per card with a friend field");
  for (const c of friendCards) {
    const s = L2.cards[c.id];
    const sides = [c.friend.a, c.friend.b];
    assert.deepEqual([...s.axes].sort(), [...new Set(sides.flatMap((x) => Object.keys(x.axes || {})))].sort(), `${c.id}: axes`);
    assert.deepEqual([...s.pairs].sort(), [...new Set(sides.flatMap((x) => (x.tags || []).map((t) => t.id.slice(0, 3))))].sort(), `${c.id}: pairs`);
    assert.deepEqual(s.sally, c.sally || [], `${c.id}: sally`);
    assert.equal(s.type, c.type, `${c.id}: type`);
    assert.deepEqual(s.answerMap, c.options.map((o, i) => (o.circumstance || o.depends ? null : friendMapping(c, [i]))), `${c.id}: answerMap`);
    assert.ok(["everyday", "love", "couple"].includes(s.level), `${c.id}: level`);
  }
  const backup = L2.backupOrder;
  assert.deepEqual([...backup].sort(), friendCards.map((c) => c.id).sort(), "backupOrder holds every friend card once");
  for (const [k, list] of Object.entries(L2.primary).filter(([, v]) => Array.isArray(v))) {
    assert.equal(list.length, 12, `${k}: 12 primary cards`);
    const info = list.map((id) => L2.cards[id]);
    assert.ok(info.every(Boolean), `${k}: every primary card has a friend field`);
    const pairs = info.flatMap((x) => x.pairs);
    assert.equal(new Set(pairs).size, pairs.length, `${k}: no tag pair twice`);
    assert.ok(pairs.length >= 12, `${k}: 12 different pairs`);
    assert.deepEqual([...new Set(info.flatMap((x) => x.axes))].sort(), [...AXES].sort(), `${k}: all six axes`);
    assert.ok(new Set(info.map((x) => x.chapter)).size >= 6, `${k}: 6 or more chapters`);
    for (let i = 1; i < info.length; i++) assert.notEqual(info[i].chapter, info[i - 1].chapter, `${k}: ${list[i - 1]} and ${list[i]} share a chapter`);
  }
});

test("sim --quick meets every target", () => {
  const r = spawnSync(process.execPath, [path.join(DIR, "sim.mjs"), "--quick"], { cwd: DIR, encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});
