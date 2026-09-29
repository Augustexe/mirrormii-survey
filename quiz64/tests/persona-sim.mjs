// Picker simulation: consistent synthetic players (hidden axis and tag-pair positions, 20% noise, the same player
// model as research/persona-quiz-v2/final/sim.mjs) play the real step machine for every lobby bucket (8 room sets x
// 3 depths x adult and teen), and the same players play the old fixed walk (every chapter card, then extras for an
// unfinished side) as the 69-card baseline. Finale answers are drawn per player and card, so both runs face the same
// sealed answers.
//   node tests/persona-sim.mjs            -> 300 players per bucket, prints the report tables
//   node tests/persona-sim.mjs --n 50     -> fewer players
//   node tests/persona-sim.mjs --json     -> machine-readable summary
// persona-picker.test.mjs imports simulate() with a small n and checks the targets.
import * as Session from "../src/persona/session.js";
import { S, KIT, LIB } from "../src/persona/kit.js";
import { ROOM_SETS, DEPTHS, lobbyFor, clock } from "./persona-helpers.mjs";

const AXES = S.AXES;
const PAIRS = [...new Set(LIB.tags.map((t) => t.id.slice(0, 3)))];

function hash32(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const U = (r, a, b) => a + (b - a) * r();

function utility(o, h) {
  if (o.circumstance) return -0.4;
  let u = 0;
  for (const [k, v] of Object.entries(o.axes || {})) u += h[k] * (v / 2);
  for (const t of o.tags || []) u += h[t.id.slice(0, 3)] * (t.id.endsWith("A") ? 1 : -1) * (t.s / 3);
  return u;
}

// One synthetic player. Every card draw comes from an rng seeded by the player and the card, so a card gets the same
// answer in the picker run and the baseline run.
export function makePlayer(seed, { noise = 0.2, exitRate = 0, rushFrom = Infinity } = {}) {
  const r0 = S.rng(hash32(`player|${seed}`));
  const hidden = {};
  for (const a of AXES) hidden[a] = U(r0, -1, 1);
  for (const p of PAIRS) hidden[p] = U(r0, -1, 1);
  const answer = (card, served = 0) => {
    const r = S.rng(hash32(`${seed}|${card.id}`));
    const gumbel = () => -Math.log(-Math.log(Math.max(1e-12, r())));
    const rushed = served >= rushFrom && card.type !== "sealed";
    const ms = rushed ? Math.round(U(r, 300, 1400)) : Math.round(U(r, 2500, 11000));
    if (card.type !== "sealed" && exitRate && r() < exitRate) return { value: card.exits[Math.floor(r() * card.exits.length)], ms };
    const n = card.options.length;
    const want = card.type === "pick_two" ? 2 : 1;
    const nz = card.type === "feeling" ? 1 : noise;
    const ranked = card.options.map((o, i) => [i, utility(o, hidden) + 0.12 * gumbel()]).sort((a, b) => b[1] - a[1]).map(([i]) => i);
    const out = [];
    while (out.length < want) {
      const i = r() < nz ? Math.floor(r() * n) : ranked.find((j) => !out.includes(j));
      if (!out.includes(i)) out.push(i);
    }
    const value = want === 2 ? out : out[0];
    const o = card.options[out[0]];
    const flip = o.depends && card.flip ? Math.floor(r() * card.flip.options.length) : null;
    return { value, ms, flip };
  };
  return { seed, hidden, answer };
}

// The picker run, through the real step machine. Returns the finished state.
export function playPicker(setup, lobby, player, runId) {
  let s = Session.chooseLobby(Session.startRun(Session.newRun({ now: clock(), runId }), setup, { now: clock() }), lobby, { now: clock() });
  for (let guard = 0; guard < 100; guard++) {
    const step = Session.currentStep(s);
    if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
    if (step.kind !== "card") break;
    const a = player.answer(step.card, step.phase === "finale" ? 0 : step.resolved);
    s = Session.answerCard(s, step.card.id, a.value, { ms: step.phase === "finale" ? null : a.ms, flip: a.flip, now: clock() });
  }
  return s;
}

// The pre-picker walk: every chapter card in kit order (gate and feeling rules as the old app), then extras for an
// unfinished side (1 or 2 per side), freeze, finale.
export function playBaseline(setup, player) {
  const answers = { setup, _ms: {} };
  let served = 0;
  for (const card of S.runCards(setup)) {
    if (!S.gateOpen(card, answers)) continue;
    if (card.type === "feeling" && card.follows && !(Number.isInteger(answers[card.follows]) || Array.isArray(answers[card.follows]))) continue;
    const a = player.answer(card, served++);
    answers[card.id] = a.value;
    answers._ms[card.id] = a.ms;
    if (a.flip !== null && a.flip !== undefined) answers[`${card.id}.flip`] = a.flip;
  }
  for (;;) {
    const p = S.buildProfile(answers);
    const extra = KIT.extras.find((c) => answers[c.id] === undefined && p.axes[c.axisFor].unfinished);
    if (!extra) break;
    const a = player.answer(extra, served++);
    answers[extra.id] = a.value;
    answers._ms[extra.id] = a.ms;
  }
  const profile = S.buildProfile(answers);
  const frozen = S.freezePredictions(profile);
  const finale = Object.fromEntries(KIT.finale.map((c) => [c.id, player.answer(c).value]));
  return { profile, sealed: S.checkSealed(frozen, finale), cards: served };
}

// Can a tag reach tagFire from at least 2 cards in this pool (best option per card, pick_two its best two)?
export function tagReachable(tagId, cards) {
  const pair = S.TAG[tagId].pair;
  const per = cards.map((c) => {
    const vals = c.options.map((o) => (o.tags || []).reduce((s, t) => s + (t.id === tagId ? t.s : t.id === pair ? -t.s : 0), 0)).map((v) => Math.max(0, v)).sort((a, b) => b - a);
    return c.weight * (c.type === "pick_two" ? (vals[0] || 0) + (vals[1] || 0) : vals[0] || 0);
  }).filter((v) => v > 0).sort((a, b) => b - a);
  return per.length >= S.CONFIG.tagMinCards && per.reduce((s, v) => s + v, 0) >= S.CONFIG.tagFire;
}

export function buckets() {
  const out = [];
  for (const rooms of ROOM_SETS) for (const depth of DEPTHS) for (const age of ["adult", "teen"]) out.push({ rooms, depth, age, key: `${age}|${depth}|${rooms.join("+") || "none"}` });
  return out;
}

const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

// n players per bucket. Returns per-bucket rows and totals.
export function simulate({ n = 300, noise = 0.2, baseline = true } = {}) {
  const rows = [];
  const fireByRooms = {}; // rooms key -> tag -> fires
  const shownAll = {};
  const baseByAge = {};
  const baseFires = {}; // tag -> fires in the baseline (each player and age once)
  for (const b of buckets()) {
    const setup = { age: b.age, closest: "best_friend", pronoun: "they" };
    const lobby = lobbyFor(b.rooms, b.depth);
    const G = { ...b, n: 0, anyUnfinished: 0, tags: [], zero: 0, three5: 0, exact: 0, called: 0, side: 0, sideOf: 0, passes: 0, cards: [], bExact: 0, bCalled: 0, bUnfinished: 0 };
    const roomsKey = b.rooms.join("+") || "none";
    const fires = (fireByRooms[roomsKey] ||= {});
    for (let i = 0; i < n; i++) {
      const player = makePlayer(`${b.age}-${i}`, { noise });
      const s = playPicker(setup, lobby, player, `sim${String(i).padStart(5, "0")}`);
      const { profile, sealed } = Session.resultFor(s);
      G.n++;
      G.cards.push(Session.routeFor(s).length);
      if (AXES.some((a) => profile.axes[a].unfinished)) G.anyUnfinished++;
      G.tags.push(profile.shownTags.length);
      if (!profile.shownTags.length) G.zero++;
      if (profile.shownTags.length >= 3 && profile.shownTags.length <= 5) G.three5++;
      for (const id of profile.firedTags) fires[id] = (fires[id] || 0) + 1;
      for (const id of profile.shownTags) shownAll[id] = (shownAll[id] || 0) + 1;
      G.exact += sealed.exact; G.called += sealed.called; G.side += sealed.side; G.sideOf += sealed.sideOf; G.passes += sealed.passes;
      // The baseline depends only on the age band (no lobby), so it is computed once per player and age.
      if (baseline) {
        const bk = `${b.age}|${i}`;
        if (!baseByAge[bk]) {
          baseByAge[bk] = playBaseline(setup, player);
          for (const id of baseByAge[bk].profile.firedTags) baseFires[id] = (baseFires[id] || 0) + 1;
        }
        const base = baseByAge[bk];
        G.bExact += base.sealed.exact; G.bCalled += base.sealed.called;
        if (AXES.some((a) => base.profile.axes[a].unfinished)) G.bUnfinished++;
      }
    }
    rows.push({
      key: b.key, age: b.age, depth: b.depth, rooms: roomsKey, n: G.n,
      cardsMin: Math.min(...G.cards), cardsMax: Math.max(...G.cards),
      unfinishedShare: G.anyUnfinished / G.n, tagsMean: mean(G.tags), zeroTags: G.zero, share3to5: G.three5 / G.n,
      exactRate: G.called ? G.exact / G.called : 0, sideRate: G.sideOf ? G.side / G.sideOf : 0, passesPerRun: G.passes / G.n,
      baseExactRate: G.bCalled ? G.bExact / G.bCalled : null, baseUnfinishedShare: baseline ? G.bUnfinished / G.n : null,
      _exact: G.exact, _called: G.called, _bExact: G.bExact, _bCalled: G.bCalled,
    });
  }
  // Tags that never fired for anyone on a room set, and whether the room set's widest pool can fire them at all.
  const adultTags = LIB.tags.map((t) => t.id);
  const silent = [];
  for (const rooms of ROOM_SETS) {
    const key = rooms.join("+") || "none";
    const lobby = lobbyFor(rooms, "personal");
    const open = new Set(Session.openChapterIds(lobby));
    const pool = (age) => [...S.runCards({ age }).filter((c) => open.has(c.chapter) && Session.depthAllows(c, "personal")), ...KIT.extras];
    for (const id of adultTags) {
      if (fireByRooms[key][id]) continue;
      silent.push({ rooms: key, tag: id, name: S.TAG[id].name, reachable: tagReachable(id, pool("adult")) });
    }
  }
  const tot = (k) => rows.reduce((s, r) => s + r[k], 0);
  return {
    rows, silent, shownAll, fireByRooms, baseFires, baselinePlayers: Object.keys(baseByAge).length,
    total: {
      n: tot("n"), unfinishedShare: rows.reduce((s, r) => s + r.unfinishedShare * r.n, 0) / tot("n"),
      exactRate: tot("_exact") / tot("_called"), baseExactRate: baseline ? tot("_bExact") / tot("_bCalled") : null,
      zeroTags: tot("zeroTags"), share3to5: rows.reduce((s, r) => s + r.share3to5 * r.n, 0) / tot("n"), tagsMean: rows.reduce((s, r) => s + r.tagsMean * r.n, 0) / tot("n"),
    },
  };
}

const pct = (x) => (x === null ? "n/a" : `${(100 * x).toFixed(1)}%`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const n = Number(arg("--n", 300));
  const t0 = Date.now();
  const out = simulate({ n });
  if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
  console.log(`players per bucket: ${n}, buckets: ${out.rows.length}, seconds: ${((Date.now() - t0) / 1000).toFixed(1)}`);
  console.log("| Age | Depth | Open rooms | Cards | Any unfinished | Tags mean | 3 to 5 tags | 0 tags | Sealed exact | Baseline exact (69) | Sealed side |");
  console.log("|---|---|---|---|---|---|---|---|---|---|---|");
  for (const r of out.rows) console.log(`| ${r.age} | ${r.depth} | ${r.rooms} | ${r.cardsMin === r.cardsMax ? r.cardsMin : `${r.cardsMin}-${r.cardsMax}`}+8 | ${pct(r.unfinishedShare)} | ${r.tagsMean.toFixed(2)} | ${pct(r.share3to5)} | ${r.zeroTags} | ${pct(r.exactRate)} | ${pct(r.baseExactRate)} | ${pct(r.sideRate)} |`);
  const T = out.total;
  console.log(`\nTOTAL n=${T.n}: any unfinished ${pct(T.unfinishedShare)}, tags mean ${T.tagsMean.toFixed(2)}, 3 to 5 tags ${pct(T.share3to5)}, 0 tags ${T.zeroTags}, sealed exact ${pct(T.exactRate)} vs baseline ${pct(T.baseExactRate)}`);
  const byRooms = {};
  for (const s of out.silent) (byRooms[s.rooms] ||= []).push(`${s.tag}${s.reachable ? "*" : ""}`);
  console.log("\nTags that never fired on a room set (* = the widest pool could still fire it):");
  for (const [k, v] of Object.entries(byRooms)) console.log(`  ${k}: ${v.join(", ")}`);
  const never = LIB.tags.map((t) => t.id).filter((id) => !out.shownAll[id]);
  console.log(`\nTags never shown on any page: ${never.join(", ") || "none"}`);
}
