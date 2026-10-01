// Evidence audit for the persona quiz kit (LAUNCH-SPEC sections 17, 18 and 22). Plain Node, no dependencies.
//   node audit.mjs          -> per-axis card counts (total and in the always-on chapters 1, 2, 4, 7), per-tag supporting
//                              cards and "did" evidence, the option balance per axis, and random-clicker pole shares on the
//                              full chapter walk, each against the section 22 targets
//   node audit.mjs --json   -> the same as JSON
//   node audit.mjs --n 4000 -> random clickers (default 3000)
// The pool is what the picker can serve: chapter cards plus extras (no finale, no feeling cards). "Did" evidence is a
// card of grade did (real, receipts, bet). The 40-card picker numbers live in quiz64/tests/persona-sim.mjs.
import { kit, lib, buildProfile, runCards, cardById } from "./score.mjs";

const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };

// LAUNCH-SPEC section 22 coverage targets.
export const TARGETS = Object.freeze({ axisCards: 15, axisAlwaysOn: 6, tagCards: 4, tagDid: 1, randomLow: 0.45, randomHigh: 0.55 });
export const ALWAYS_ON = Object.freeze([1, 2, 4, 7]);

export const poolCards = () => [...kit.chapters.flatMap((c) => c.cards), ...kit.extras].filter((c) => c.type !== "feeling" && c.type !== "sealed");

// Axis coverage: cards in the pool with at least one option carrying the axis, in total and in the always-on chapters.
export function axisCounts(pool = poolCards()) {
  const out = {};
  for (const ax of AXES) {
    const cards = pool.filter((c) => c.options.some((o) => (o.axes || {})[ax]));
    const always = cards.filter((c) => ALWAYS_ON.includes(c.chapter));
    out[ax] = {
      cards: cards.length, alwaysOn: always.length, ids: cards.map((c) => c.id), did: cards.filter((c) => c.grade === "did").length,
      ok: cards.length >= TARGETS.axisCards && always.length >= TARGETS.axisAlwaysOn,
    };
  }
  return out;
}

// Tag support: cards in the pool with at least one option carrying the tag (positive strength).
export function tagSupport(pool = poolCards()) {
  const out = {};
  for (const t of lib.tags) {
    const cards = pool.filter((c) => c.options.some((o) => (o.tags || []).some((x) => x.id === t.id)));
    const did = cards.filter((c) => c.grade === "did").map((c) => c.id);
    out[t.id] = { name: t.name, cards: cards.length, ids: cards.map((c) => c.id), did, ok: cards.length >= TARGETS.tagCards && did.length >= TARGETS.tagDid };
  }
  return out;
}

// Option balance: for each card and axis, the mean axis value a uniform random answer gives (receipts: each item has a
// 50% tick chance; pick_two: two picks; rank: every item placed, so the position weights average to 0.25 each). A card
// mean far from 0 pushes random clickers to one pole.
export function optionBalance(pool = poolCards()) {
  const out = Object.fromEntries(AXES.map((a) => [a, { sum: 0, cards: [] }]));
  for (const c of pool) {
    const scoring = c.options.filter((o) => !o.none);
    for (const ax of AXES) {
      if (!scoring.some((o) => (o.axes || {})[ax])) continue;
      const vals = c.options.map((o) => ((o.circumstance || o.depends || o.none) ? 0 : (o.axes || {})[ax] || 0));
      const sum = vals.reduce((s, v) => s + v, 0);
      const mean = c.type === "receipts" ? sum / 2 : c.type === "rank" ? sum * 0.25 : ((c.type === "pick_two" ? 2 : 1) * sum) / vals.length;
      out[ax].sum += mean * c.weight;
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
  if (card.type === "rank") {
    const order = card.options.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    return order;
  }
  if (card.type === "receipts") {
    const none = card.options.findIndex((o) => o.none);
    if (none >= 0 && r() < 1 / n) return [none];
    const ticks = card.options.map((o, i) => (!o.none && r() < 0.5 ? i : -1)).filter((i) => i >= 0);
    return ticks.length ? ticks : [none >= 0 ? none : 0];
  }
  return Math.floor(r() * n);
}

// Random clickers on the full chapter walk (every chapter card, gate rules as the app).
export function randomPoleShares(n = 3000) {
  const r = rng(90210);
  const pos = Object.fromEntries(AXES.map((a) => [a, 0]));
  for (let i = 0; i < n; i++) {
    const answers = { setup: { closest: "best_friend", pronoun: "they" }, _ms: {} };
    for (const card of runCards()) {
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
  }
  return Object.fromEntries(AXES.map((a) => [a, pos[a] / n]));
}

export function audit({ n = 3000 } = {}) {
  const pool = poolCards();
  const axes = axisCounts(pool);
  const tags = tagSupport(pool);
  const random = randomPoleShares(n);
  const randomOk = Object.fromEntries(AXES.map((a) => [a, random[a] >= TARGETS.randomLow && random[a] <= TARGETS.randomHigh]));
  return {
    poolSize: pool.length, targets: TARGETS, axes, tags, balance: optionBalance(pool), random, randomOk,
    short: {
      axes: AXES.filter((a) => !axes[a].ok),
      tags: Object.keys(tags).filter((id) => !tags[id].ok),
      random: AXES.filter((a) => !randomOk[a]),
    },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = audit({ n: Number(arg("--n", 3000)) });
  if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
  const pct = (x) => `${(100 * x).toFixed(1)}%`;
  const T = out.targets;
  const meta = Object.fromEntries(lib.axes.map((a) => [a.id, a]));
  console.log(`Pool: ${out.poolSize} cards (chapters + extras, no feeling or sealed cards). Targets (LAUNCH-SPEC 22): every axis on ${T.axisCards}+ cards, ${T.axisAlwaysOn}+ of them in chapters ${ALWAYS_ON.join(", ")}; every tag on ${T.tagCards}+ cards with ${T.tagDid}+ did card; random clickers ${pct(T.randomLow)} to ${pct(T.randomHigh)}.\n`);
  console.log("| Axis | Cards | Always-on chapters | Did cards | Option balance (weighted mean, + = first pole) | Random clickers on + pole (full walk) | Target |");
  console.log("|---|---|---|---|---|---|---|");
  for (const a of AXES) console.log(`| ${a} ${meta[a].plus}/${meta[a].minus} | ${out.axes[a].cards} | ${out.axes[a].alwaysOn} | ${out.axes[a].did} | ${out.balance[a].sum.toFixed(2)} | ${pct(out.random[a])} | ${out.axes[a].ok && out.randomOk[a] ? "met" : "SHORT"} |`);
  console.log("\nLeaning cards per axis (mean axis value of a random pick):");
  for (const a of AXES) console.log(`  ${a}: ${out.balance[a].cards.join(", ") || "none"}`);
  console.log(`\nTags: ${lib.tags.length}; under ${T.tagCards} cards: ${Object.values(out.tags).filter((t) => t.cards < T.tagCards).length}; no did evidence: ${Object.values(out.tags).filter((t) => !t.did.length).length}`);
  console.log("| Tag | Name | Cards | Did | Target | Card ids |");
  console.log("|---|---|---|---|---|---|");
  for (const [id, t] of Object.entries(out.tags)) console.log(`| ${id} | ${t.name} | ${t.cards} | ${t.did.length} | ${t.ok ? "met" : "SHORT"} | ${t.ids.join(" ")} |`);
  if (out.short.tags.length) console.log(`\nShort tags: ${out.short.tags.map((id) => `${id} (${out.tags[id].cards} cards, ${out.tags[id].did.length} did)`).join(", ")}`);
  console.log(`\nAcceptance (section 22): axes short: ${out.short.axes.join(", ") || "none"}; tags short: ${out.short.tags.length}; random clickers outside ${pct(T.randomLow)} to ${pct(T.randomHigh)}: ${out.short.random.join(", ") || "none"}`);
}
