// Calibration sim for the drama stats (src/persona/rpg-stats.js). Simulated players play the real step machine
// (tests/persona-sim.mjs: hidden axis and trait positions, the same player model as research/persona-quiz-v2/final/
// sim.mjs) across every lobby room set and depth: consistent players at noise 0.1 to 0.5, random clickers, players
// who skip a share of cards and players who rush the second half. For each stat it prints the raw value at the
// KNOTS percentiles (paste into CALIBRATION), the confidence spread (CONF_FULL) and the score spread that results.
//   node scripts/calibrate-drama.mjs           -> 1600 players, prints the constants and the spread
//   node scripts/calibrate-drama.mjs --n 400   -> fewer players
//   node scripts/calibrate-drama.mjs --json    -> machine-readable
// tests/drama-stats.test.mjs imports simulateProfiles() with a small n and checks the spread.
import * as Session from "../src/persona/session.js";
import { makePlayer, playPicker } from "../tests/persona-sim.mjs";
import { ROOM_SETS, DEPTHS } from "../tests/persona-helpers.mjs";
import { CALIBRATION, DRAMA_ORDER, KNOTS, dramaStats, rawStat } from "../src/persona/rpg-stats.js";

const SETUP = Object.freeze({ closest: "best_friend", pronoun: "she" });
// Player kinds, cycled: mostly consistent players at different noise levels, then random clickers, skippers and
// rushers, so thin evidence is part of the population.
const KINDS = [
  { noise: 0.1 }, { noise: 0.2 }, { noise: 0.2 }, { noise: 0.3 }, { noise: 0.3 }, { noise: 0.5 },
  { noise: 1 }, { noise: 0.25, exitRate: 0.3 }, { noise: 0.25, rushFrom: 20 },
];

// n simulated profiles. Deterministic for a given n and tag.
export function simulateProfiles({ n = 1600, tag = "drama" } = {}) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const kind = KINDS[i % KINDS.length];
    const rooms = ROOM_SETS[i % ROOM_SETS.length];
    const depth = DEPTHS[Math.floor(i / ROOM_SETS.length) % DEPTHS.length];
    const voice = i % 2 ? "heart" : "fun";
    const player = makePlayer(`${tag}${i}`, kind);
    const run = playPicker(SETUP, { voice, depth, rooms }, player, `${tag}${i}`);
    out.push(Session.resultFor(run).profile);
  }
  return out;
}

// The value at percentile p (0 to 1) of a sorted list, linear between neighbors.
export function quantile(sorted, p) {
  if (!sorted.length) return 0;
  const at = (sorted.length - 1) * p;
  const lo = Math.floor(at);
  const hi = Math.ceil(at);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (at - lo);
}
const r3 = (x) => Math.round(x * 1000) / 1000;

export function measure(profiles, calibration = CALIBRATION) {
  const knots = {};
  const conf = [];
  for (const id of DRAMA_ORDER) {
    const raws = profiles.map((p) => rawStat(p, id)).map((r) => { conf.push(r.conf); return r.raw; }).sort((a, b) => a - b);
    knots[id] = KNOTS.map(([p]) => r3(quantile(raws, p)));
  }
  conf.sort((a, b) => a - b);
  const scores = Object.fromEntries(DRAMA_ORDER.map((id) => [id, []]));
  for (const p of profiles) for (const s of dramaStats(p, calibration)) scores[s.id].push(s.score);
  const spread = {};
  for (const id of DRAMA_ORDER) {
    const xs = scores[id].sort((a, b) => a - b);
    spread[id] = { p05: quantile(xs, 0.05), p10: quantile(xs, 0.1), p50: quantile(xs, 0.5), p90: quantile(xs, 0.9), p95: quantile(xs, 0.95), min: xs[0], max: xs[xs.length - 1], distinct: new Set(xs).size };
  }
  return { knots, conf: { p05: r3(quantile(conf, 0.05)), p10: r3(quantile(conf, 0.1)), p50: r3(quantile(conf, 0.5)) }, spread };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const n = Number(args[args.indexOf("--n") + 1]) || 1600;
  const t0 = Date.now();
  const profiles = simulateProfiles({ n });
  const first = measure(profiles);
  // The spread under the new knots (the knots just measured), so the printout shows what pasting them gives.
  const after = measure(profiles, first.knots);
  if (args.includes("--json")) { console.log(JSON.stringify({ n, ...first, spreadAfter: after.spread }, null, 2)); process.exit(0); }
  console.log(`${n} players in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  console.log("CALIBRATION (paste into rpg-stats.js):");
  for (const id of DRAMA_ORDER) console.log(`  ${id}: Object.freeze([${first.knots[id].join(", ")}]),`);
  console.log("conf percentiles:", first.conf);
  console.log("score spread with the current constants:");
  for (const id of DRAMA_ORDER) console.log(`  ${id}`, first.spread[id]);
  console.log("score spread with the knots above:");
  for (const id of DRAMA_ORDER) console.log(`  ${id}`, after.spread[id]);
}
