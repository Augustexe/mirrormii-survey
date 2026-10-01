// Sub-question repeat measurement (package M2, 2026-09-29): per run (40 scored cards plus the 8 sealed cards), how
// many cards share a sub-question (sq) with another card in the same run, the most cards on one sq, back-to-back
// repeats, and feeling cards that replay the scene of a card served in the same run (a `follows` link, or a
// `scene` link, into a served card). Consistent synthetic players play the real step machine for every lobby
// bucket (8 room sets x 2 depths).
//   node tests/sq-measure.mjs            -> 60 run ids per bucket, prints the table
//   node tests/sq-measure.mjs --n 200    -> more run ids
//   node tests/sq-measure.mjs --json     -> machine-readable summary
import * as Session from "../src/persona/session.js";
import { S } from "../src/persona/kit.js";
import { buckets, makePlayer, playPicker } from "./persona-sim.mjs";

// The sq repeats in one finished run: route (scored cards in order) then the finale.
export function sqRepeats(state) {
  const route = Session.routeFor(state);
  const finale = Session.finaleFor(state);
  const all = [...route, ...finale];
  const by = new Map();
  for (const c of all) if (c.sq) by.set(c.sq, [...(by.get(c.sq) || []), c.id]);
  const shared = [...by.values()].filter((ids) => ids.length > 1);
  let backToBack = 0;
  for (let i = 1; i < route.length; i++) if (route[i].sq && route[i].sq === route[i - 1].sq) backToBack++;
  if (route.length && finale.length && route[route.length - 1].sq && route[route.length - 1].sq === finale[0].sq) backToBack++;
  const ids = new Set(all.map((c) => c.id));
  const replays = route.filter((c) => c.type === "feeling" && ((c.follows && ids.has(c.follows)) || (c.scene && ids.has(c.scene)))).map((c) => c.id);
  const sealedClash = finale.filter((f) => f.sq && route.some((c) => c.sq === f.sq)).length;
  return { cards: all.length, sharedCards: shared.reduce((s, ids) => s + ids.length, 0), sharedSqs: shared.length, maxPerSq: Math.max(0, ...[...by.values()].map((x) => x.length)), backToBack, replays, sealedClash, groups: shared };
}

export function measure({ n = 60 } = {}) {
  const rows = [];
  for (const b of buckets()) {
    const R = { key: b.key, runs: 0, sharedCards: [], max: [], b2b: 0, replays: 0, sealedClash: 0, runsWithShare: 0, worst: null };
    for (let i = 0; i < n; i++) {
      const runId = `sqm${String(i).padStart(5, "0")}`;
      const s = playPicker({ closest: "best_friend", pronoun: "they" }, { voice: "fun", depth: b.depth, rooms: b.rooms }, makePlayer(`sq-${i}`), runId);
      const m = sqRepeats(s);
      R.runs++;
      R.sharedCards.push(m.sharedCards);
      R.max.push(m.maxPerSq);
      R.b2b += m.backToBack;
      R.replays += m.replays.length;
      R.sealedClash += m.sealedClash;
      if (m.sharedCards) R.runsWithShare++;
      if (!R.worst || m.sharedCards > R.worst.sharedCards) R.worst = { runId, ...m };
    }
    const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
    rows.push({ key: b.key, runs: R.runs, sharedMean: mean(R.sharedCards), sharedMax: Math.max(...R.sharedCards), maxPerSq: Math.max(...R.max), maxPerSqMean: mean(R.max), runsWithShare: R.runsWithShare, backToBack: R.b2b, replays: R.replays, sealedClash: R.sealedClash, worst: { runId: R.worst.runId, groups: R.worst.groups } });
  }
  const all = rows.reduce((s, r) => s + r.runs, 0);
  const total = {
    runs: all,
    sharedMean: rows.reduce((s, r) => s + r.sharedMean * r.runs, 0) / all,
    sharedMax: Math.max(...rows.map((r) => r.sharedMax)),
    maxPerSq: Math.max(...rows.map((r) => r.maxPerSq)),
    runsWithShare: rows.reduce((s, r) => s + r.runsWithShare, 0),
    backToBack: rows.reduce((s, r) => s + r.backToBack, 0),
    replays: rows.reduce((s, r) => s + r.replays, 0),
    sealedClash: rows.reduce((s, r) => s + r.sealedClash, 0),
  };
  return { rows, total };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  const i = argv.indexOf("--n");
  const n = i >= 0 ? Number(argv[i + 1]) : 60;
  const out = measure({ n });
  if (argv.includes("--json")) console.log(JSON.stringify(out, null, 1));
  else {
    console.log("| Lobby | Runs | Cards sharing an sq (mean / max) | Max cards on one sq | Runs with any share | Back-to-back same sq | Feeling replays | Sealed on a played sq |");
    console.log("|---|---|---|---|---|---|---|---|");
    for (const r of out.rows) console.log(`| ${r.key} | ${r.runs} | ${r.sharedMean.toFixed(1)} / ${r.sharedMax} | ${r.maxPerSq} | ${r.runsWithShare} | ${r.backToBack} | ${r.replays} | ${r.sealedClash} |`);
    const t = out.total;
    console.log(`| all | ${t.runs} | ${t.sharedMean.toFixed(1)} / ${t.sharedMax} | ${t.maxPerSq} | ${t.runsWithShare} | ${t.backToBack} | ${t.replays} | ${t.sealedClash} |`);
  }
}
