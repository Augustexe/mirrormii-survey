// Evidence audit for the persona quiz kit (LAUNCH-SPEC section 18, step B). Plain Node, no dependencies.
//   node audit.mjs          -> prints per-axis card counts, per-tag supporting cards and "did" evidence, the
//                              option balance per axis, and random-clicker pole shares on the full chapter walk
//   node audit.mjs --json   -> the same as JSON
//   node audit.mjs --n 4000 -> random clickers per age band (default 3000)
// The pool is what the picker can serve: chapter cards plus extras (no finale, no feeling cards). "Did" evidence is a
// card of grade did (real, receipts, guilty). The 40-card picker numbers live in quiz64/tests/persona-sim.mjs.
import { kit, lib, buildProfile, runCards, cardById } from "./score.mjs";

const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

export const poolCards = () => [...kit.chapters.flatMap((c) => c.cards), ...kit.extras].filter((c) => c.type !== "feeling" && c.type !== "sealed");

// Axis coverage: cards in the pool with at least one option carrying the axis.
export function axisCounts(pool = poolCards()) {
  const out = {};
  for (const ax of AXES) {
    const cards = pool.filter((c) => c.options.some((o) => (o.axes || {})[ax]));
    out[ax] = { cards: cards.length, ids: cards.map((c) => c.id), did: cards.filter((c) => c.grade === "did").length };
  }
  return out;
}

// Tag support: cards in the pool with at least one option carrying the tag (positive strength).
export function tagSupport(pool = poolCards()) {
  const out = {};
  for (const t of lib.tags) {
    const cards = pool.filter((c) => c.options.some((o) => (o.tags || []).some((x) => x.id === t.id)));
    out[t.id] = {
      name: t.name, locked18: !!t.locked18, cards: cards.length, ids: cards.map((c) => c.id),
      did: cards.filter((c) => c.grade === "did").map((c) => c.id),
      teenCards: cards.filter((c) => c.teen).length,
    };
  }
  return out;
}

// Option balance: for each card and axis, the mean axis value a uniform random pick gives (receipts: each item has a
// 50% tick chance; pick_two: two picks). A card mean far from 0 pushes random clickers to one pole.
export function optionBalance(pool = poolCards()) {
  const out = Object.fromEntries(AXES.map((a) => [a, { sum: 0, cards: [] }]));
  for (const c of pool) {
    const scoring = c.options.filter((o) => !o.none);
    for (const ax of AXES) {
      if (!scoring.some((o) => (o.axes || {})[ax])) continue;
      const vals = c.options.map((o) => ((o.circumstance || o.depends || o.none) ? 0 : (o.axes || {})[ax] || 0));
      const mean = c.type === "receipts" ? vals.reduce((s, v) => s + v, 0) / 2 : (c.type === "pick_two" ? 2 : 1) * vals.reduce((s, v) => s + v, 0) / vals.length;
      const w = mean * c.weight;
      out[ax].sum += w;
      if (Math.abs(mean) > 1e-9) out[ax].cards.push(`${c.id} ${mean > 0 ? "+" : ""}${mean.toFixed(2)}`);
    }
  }
  return out;
}

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}

// A uniform random answer for one card (the same shapes the app accepts).
export function randomAnswer(card, r) {
  const n = card.options.length;
  if (card.type === "pick_two") {
    const a = Math.floor(r() * n);
    let b = Math.floor(r() * (n - 1));
    if (b >= a) b++;
    return [a, b];
  }
  if (card.type === "receipts") {
    const none = card.options.findIndex((o) => o.none);
    if (none >= 0 && r() < 1 / (n)) return [none];
    const ticks = card.options.map((o, i) => (!o.none && r() < 0.5 ? i : -1)).filter((i) => i >= 0);
    return ticks.length ? ticks : [none >= 0 ? none : 0];
  }
  return Math.floor(r() * n);
}

// Random clickers on the full chapter walk (every chapter card the age band allows, gate rules as the app).
export function randomPoleShares(n = 3000) {
  const r = rng(90210);
  const pos = Object.fromEntries(AXES.map((a) => [a, 0]));
  let total = 0;
  for (const age of ["adult", "teen"]) {
    for (let i = 0; i < n; i++) {
      const answers = { setup: { age, closest: "best friend", pronoun: "they" }, _ms: {} };
      for (const card of runCards(answers.setup)) {
        if (card.gateRule) {
          const g = answers[card.gateRule.card];
          const src = cardById[card.gateRule.card];
          const picks = Array.isArray(g) ? g : typeof g === "number" ? [g] : [];
          if (!picks.some((j) => (src.options[j].tags || []).some((t) => t.id === card.gateRule.anyTag))) continue;
        }
        answers[card.id] = randomAnswer(card, r);
        answers._ms[card.id] = 5000;
      }
      const p = buildProfile(answers);
      for (const a of AXES) if (p.axes[a].pole > 0) pos[a]++;
      total++;
    }
  }
  return Object.fromEntries(AXES.map((a) => [a, pos[a] / total]));
}

export function audit({ n = 3000 } = {}) {
  const pool = poolCards();
  return { poolSize: pool.length, axes: axisCounts(pool), tags: tagSupport(pool), balance: optionBalance(pool), random: randomPoleShares(n) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = audit({ n: Number(arg("--n", 3000)) });
  if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
  const pct = (x) => `${(100 * x).toFixed(1)}%`;
  const meta = Object.fromEntries(lib.axes.map((a) => [a.id, a]));
  console.log(`Pool: ${out.poolSize} cards (chapters + extras, no feeling or sealed cards)\n`);
  console.log("| Axis | Cards | Did cards | Option balance (weighted mean, + = first pole) | Random clickers on + pole (full walk) |");
  console.log("|---|---|---|---|---|");
  for (const a of AXES) console.log(`| ${a} ${meta[a].plus}/${meta[a].minus} | ${out.axes[a].cards} | ${out.axes[a].did} | ${out.balance[a].sum.toFixed(2)} | ${pct(out.random[a])} |`);
  console.log("\nLeaning cards per axis (mean axis value of a random pick):");
  for (const a of AXES) console.log(`  ${a}: ${out.balance[a].cards.join(", ") || "none"}`);
  const short = Object.entries(out.tags).filter(([, t]) => t.cards < 3 || !t.did.length);
  console.log(`\nTags: ${lib.tags.length}; under 3 cards: ${Object.values(out.tags).filter((t) => t.cards < 3).length}; no did evidence: ${Object.values(out.tags).filter((t) => !t.did.length).length}`);
  console.log("| Tag | Name | Cards | Did | Teen cards | Card ids |");
  console.log("|---|---|---|---|---|---|");
  for (const [id, t] of Object.entries(out.tags)) console.log(`| ${id}${t.locked18 ? " 18+" : ""} | ${t.name} | ${t.cards} | ${t.did.length} | ${t.teenCards} | ${t.ids.join(" ")} |`);
  if (short.length) console.log(`\nShort: ${short.map(([id, t]) => `${id} (${t.cards} cards, ${t.did.length} did)`).join(", ")}`);
  const axShort = AXES.filter((a) => out.axes[a].cards < 9);
  const rnd = AXES.filter((a) => out.random[a] < 0.45 || out.random[a] > 0.55);
  console.log(`\nAcceptance: axes under 9 cards: ${axShort.join(", ") || "none"}; tags short: ${short.length}; random clickers outside 45 to 55%: ${rnd.join(", ") || "none"}`);
}
