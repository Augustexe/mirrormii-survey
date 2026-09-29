// Picker simulation: consistent synthetic players (hidden axis and tag-pair positions, 20% noise, the same player
// model as research/persona-quiz-v2/final/sim.mjs) play the real step machine for every lobby bucket (8 room sets x
// 2 depths; there is no age band and the voice never changes the route), and the same players play the old fixed walk
// (every chapter card, then extras for an unfinished side) as the baseline. Finale answers are drawn per player and
// card, and the baseline plays the same drawn finale as the picker run, so both face the same sealed answers.
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
function shuffled(n, r) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function utility(o, h) {
  if (o.circumstance) return -0.4;
  let u = 0;
  for (const [k, v] of Object.entries(o.axes || {})) u += h[k] * (v / 2);
  for (const t of o.tags || []) u += h[t.id.slice(0, 3)] * (t.id.endsWith("A") ? 1 : -1) * (t.s / 3);
  return u;
}

// A receipts answer: each item is ticked when it fits the player (utility above a small bar, with the same gumbel
// jitter as a pick); with probability nz an item is a coin flip instead. Nothing ticked: "None of these".
export function receiptsTicks(card, hidden, r, nz) {
  const gumbel = () => -Math.log(-Math.log(Math.max(1e-12, r())));
  const out = [];
  card.options.forEach((o, i) => {
    if (o.none) return;
    const tick = r() < nz ? r() < 0.5 : utility(o, hidden) + 0.12 * gumbel() > 0.1;
    if (tick) out.push(i);
  });
  const none = card.options.findIndex((o) => o.none);
  return out.length ? out : none >= 0 ? [none] : [];
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
    if (card.type === "receipts") return { value: receiptsTicks(card, hidden, r, nz), ms, flip: null };
    const ranked = card.options.map((o, i) => [i, utility(o, hidden) + 0.12 * gumbel()]).sort((a, b) => b[1] - a[1]).map(([i]) => i);
    // Rank it: the fitting order, or (with probability nz) a random one.
    if (card.type === "rank") return { value: r() < nz ? shuffled(n, r) : ranked, ms, flip: null };
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
// unfinished side (1 or 2 per side), freeze, finale (the given drawn finale ids, default: the whole sealed pool).
export function playBaseline(setup, player, finaleIds = KIT.finale.map((c) => c.id)) {
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
  const frozen = S.freezePredictions(profile, finaleIds);
  const finale = Object.fromEntries(finaleIds.map((id) => [id, player.answer(S.cardById[id]).value]));
  return { profile, sealed: S.checkSealed(frozen, finale), cards: served };
}

// Can a tag reach tagFire from at least 2 cards in this pool (the scorer's own per-card maximum: best option, pick_two
// its best two, receipts its best three ticks, rank its best order)?
export function tagReachable(tagId, cards) {
  const per = cards.map((c) => c.weight * S.cardTagMax(c, tagId)).filter((v) => v > 0).sort((a, b) => b - a);
  return per.length >= S.CONFIG.tagMinCards && per.reduce((s, v) => s + v, 0) >= S.CONFIG.tagFire;
}

export function buckets() {
  const out = [];
  for (const rooms of ROOM_SETS) for (const depth of DEPTHS) out.push({ rooms, depth, key: `${depth}|${rooms.join("+") || "none"}` });
  return out;
}

const mean = (xs) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : 0);

// n players per bucket. Returns per-bucket rows and totals.
export function simulate({ n = 300, noise = 0.2, baseline = true } = {}) {
  const rows = [];
  const fireByRooms = {}; // rooms key -> tag -> fires
  const shownAll = {};
  const baseByPlayer = {};
  const baseFires = {}; // tag -> fires in the baseline (each player once)
  for (const b of buckets()) {
    const setup = { closest: "best_friend", pronoun: "they" };
    const lobby = lobbyFor(b.rooms, b.depth);
    const G = { ...b, n: 0, anyUnfinished: 0, tags: [], zero: 0, three5: 0, exact: 0, called: 0, side: 0, sideOf: 0, passes: 0, cards: [], bExact: 0, bCalled: 0, bUnfinished: 0 };
    const roomsKey = b.rooms.join("+") || "none";
    const fires = (fireByRooms[roomsKey] ||= {});
    for (let i = 0; i < n; i++) {
      const player = makePlayer(`p-${i}`, { noise });
      const runId = `sim${String(i).padStart(5, "0")}`;
      const s = playPicker(setup, lobby, player, runId);
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
      // The baseline has no lobby, so it is computed once per player (with the same drawn finale as the picker run).
      if (baseline) {
        const bk = `${i}`;
        if (!baseByPlayer[bk]) {
          baseByPlayer[bk] = playBaseline(setup, player, Session.finaleIds({ runId }));
          for (const id of baseByPlayer[bk].profile.firedTags) baseFires[id] = (baseFires[id] || 0) + 1;
        }
        const base = baseByPlayer[bk];
        G.bExact += base.sealed.exact; G.bCalled += base.sealed.called;
        if (AXES.some((a) => base.profile.axes[a].unfinished)) G.bUnfinished++;
      }
    }
    rows.push({
      key: b.key, depth: b.depth, rooms: roomsKey, n: G.n,
      cardsMin: Math.min(...G.cards), cardsMax: Math.max(...G.cards),
      unfinishedShare: G.anyUnfinished / G.n, tagsMean: mean(G.tags), zeroTags: G.zero, share3to5: G.three5 / G.n,
      exactRate: G.called ? G.exact / G.called : 0, sideRate: G.sideOf ? G.side / G.sideOf : 0, passesPerRun: G.passes / G.n,
      baseExactRate: G.bCalled ? G.bExact / G.bCalled : null, baseUnfinishedShare: baseline ? G.bUnfinished / G.n : null,
      _exact: G.exact, _called: G.called, _bExact: G.bExact, _bCalled: G.bCalled,
    });
  }
  // Tags that never fired for anyone on a room set, and whether the room set's widest pool can fire them at all.
  const allTags = LIB.tags.map((t) => t.id);
  const silent = [];
  for (const rooms of ROOM_SETS) {
    const key = rooms.join("+") || "none";
    const lobby = lobbyFor(rooms, "anything");
    const open = new Set(Session.openChapterIds(lobby));
    const pool = [...S.runCards().filter((c) => open.has(c.chapter)), ...KIT.extras];
    for (const id of allTags) {
      if (fireByRooms[key][id]) continue;
      silent.push({ rooms: key, tag: id, name: S.TAG[id].name, reachable: tagReachable(id, pool) });
    }
  }
  const tot = (k) => rows.reduce((s, r) => s + r[k], 0);
  return {
    rows, silent, shownAll, fireByRooms, baseFires, baselinePlayers: Object.keys(baseByPlayer).length,
    total: {
      n: tot("n"), unfinishedShare: rows.reduce((s, r) => s + r.unfinishedShare * r.n, 0) / tot("n"),
      exactRate: tot("_exact") / tot("_called"), baseExactRate: baseline ? tot("_bExact") / tot("_bCalled") : null,
      zeroTags: tot("zeroTags"), share3to5: rows.reduce((s, r) => s + r.share3to5 * r.n, 0) / tot("n"), tagsMean: rows.reduce((s, r) => s + r.tagsMean * r.n, 0) / tot("n"),
    },
  };
}

// A uniform random clicker (every option equally likely; receipts: each item a coin flip, None 1 in n).
export function makeRandomPlayer(seed) {
  const answer = (card) => {
    const r = S.rng(hash32(`random|${seed}|${card.id}`));
    const n = card.options.length;
    const ms = Math.round(U(r, 2500, 11000));
    if (card.type === "receipts") {
      const none = card.options.findIndex((o) => o.none);
      if (none >= 0 && r() < 1 / n) return { value: [none], ms };
      const ticks = card.options.map((o, i) => (!o.none && r() < 0.5 ? i : -1)).filter((i) => i >= 0);
      return { value: ticks, ms };
    }
    if (card.type === "pick_two") {
      const a = Math.floor(r() * n);
      let b = Math.floor(r() * (n - 1));
      if (b >= a) b++;
      return { value: [a, b], ms };
    }
    if (card.type === "rank") return { value: shuffled(n, r), ms };
    const value = Math.floor(r() * n);
    const flip = card.options[value].depends && card.flip ? Math.floor(r() * card.flip.options.length) : null;
    return { value, ms, flip };
  };
  return { seed, answer };
}

// Acceptance (LAUNCH-SPEC sections 18 and 22): per-tag fire rates for consistent players at RUN_SIZE with every room
// open (depth "anything"), the same per room combination, and random clickers' pole shares with every room open.
// Counts are doubled from the old per-age-band loop so the sample sizes match earlier reports.
export function acceptance({ n = 1000, nRooms = 300, nRandom = 2000, noise = 0.2 } = {}) {
  const tags = LIB.tags;
  const rate = (fires, all) => Object.fromEntries(tags.map((t) => [t.id, (fires[t.id] || 0) / (all || 1)]));
  const runSet = (rooms, count, tagPrefix) => {
    const fires = {};
    let all = 0, zero = 0, unfinished = 0, shown = 0, exact = 0, called = 0;
    for (const half of ["a", "b"]) {
      for (let i = 0; i < count; i++) {
        const player = makePlayer(`${tagPrefix}-${half}-${i}`, { noise });
        const s = playPicker({ closest: "best_friend", pronoun: "they" }, lobbyFor(rooms, "anything"), player, `acc${half}${String(i).padStart(5, "0")}`);
        const { profile, sealed } = Session.resultFor(s);
        all++;
        for (const id of profile.firedTags) fires[id] = (fires[id] || 0) + 1;
        if (!profile.shownTags.length) zero++;
        if (AXES.some((a) => profile.axes[a].unfinished)) unfinished++;
        shown += profile.shownTags.length;
        exact += sealed.exact; called += sealed.called;
      }
    }
    return { rates: rate(fires, all), n: all, zeroShare: zero / all, unfinishedShare: unfinished / all, shownMean: shown / all, exactRate: called ? exact / called : 0 };
  };
  const open = runSet(["love", "work", "family"], n, "open");
  const byRooms = {};
  for (const rooms of ROOM_SETS) byRooms[rooms.join("+") || "none"] = runSet(rooms, nRooms, `rooms-${rooms.join("+") || "none"}`);
  const pos = Object.fromEntries(AXES.map((a) => [a, 0]));
  let rn = 0;
  for (const half of ["a", "b"]) {
    for (let i = 0; i < nRandom; i++) {
      const s = playPicker({ closest: "best_friend", pronoun: "they" }, lobbyFor(["love", "work", "family"], "anything"), makeRandomPlayer(`${half}-${i}`), `rnd${half}${String(i).padStart(5, "0")}`);
      const p = Session.profileFor(s);
      for (const a of AXES) if (p.axes[a].pole > 0) pos[a]++;
      rn++;
    }
  }
  return { open, byRooms, random: Object.fromEntries(AXES.map((a) => [a, pos[a] / rn])), randomN: rn };
}

const pct = (x) => (x === null ? "n/a" : `${(100 * x).toFixed(1)}%`);

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
  const n = Number(arg("--n", 300));
  const t0 = Date.now();
  if (process.argv.includes("--acceptance")) {
    const acc = acceptance({ n: Number(arg("--n", 1000)), nRooms: Number(arg("--rooms", 300)), nRandom: Number(arg("--random", 2000)) });
    if (process.argv.includes("--json")) { console.log(JSON.stringify(acc, null, 1)); process.exit(0); }
    const o = acc.open;
    console.log(`Every room open, depth anything, ${o.n} consistent players, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    console.log(`tags shown mean ${o.shownMean.toFixed(2)}, 0 tags ${pct(o.zeroShare)}, any unfinished ${pct(o.unfinishedShare)}, sealed exact ${pct(o.exactRate)}`);
    const under = Object.entries(o.rates).filter(([, r]) => r < 0.01);
    console.log(`tags under 1%: ${under.map(([id, r]) => `${id} ${pct(r)}`).join(", ") || "none"}`);
    console.log(`lowest five: ${Object.entries(o.rates).sort((a, b) => a[1] - b[1]).slice(0, 5).map(([id, r]) => `${id} ${pct(r)}`).join(", ")}`);
    console.log("\n| Open rooms | Players | Tags under 1% | Never fired | 0 tags | Unfinished | Sealed exact |");
    console.log("|---|---|---|---|---|---|---|");
    for (const [k, r] of Object.entries(acc.byRooms)) {
      const u = Object.entries(r.rates).filter(([, x]) => x < 0.01).map(([id]) => id);
      const never = Object.entries(r.rates).filter(([, x]) => x === 0).map(([id]) => id);
      console.log(`| ${k} | ${r.n} | ${u.length} ${u.join(" ")} | ${never.length} | ${pct(r.zeroShare)} | ${pct(r.unfinishedShare)} | ${pct(r.exactRate)} |`);
    }
    console.log(`\nRandom clickers (${acc.randomN}, every room open) on the + pole: ${AXES.map((a) => `${a} ${pct(acc.random[a])}`).join(", ")}`);
    process.exit(0);
  }
  const out = simulate({ n });
  if (process.argv.includes("--json")) { console.log(JSON.stringify(out, null, 1)); process.exit(0); }
  console.log(`players per bucket: ${n}, buckets: ${out.rows.length}, seconds: ${((Date.now() - t0) / 1000).toFixed(1)}`);
  console.log("| Depth | Open rooms | Cards | Any unfinished | Tags mean | 3 to 5 tags | 0 tags | Sealed exact | Baseline exact (full walk) | Sealed side |");
  console.log("|---|---|---|---|---|---|---|---|---|---|");
  for (const r of out.rows) console.log(`| ${r.depth} | ${r.rooms} | ${r.cardsMin === r.cardsMax ? r.cardsMin : `${r.cardsMin}-${r.cardsMax}`}+8 | ${pct(r.unfinishedShare)} | ${r.tagsMean.toFixed(2)} | ${pct(r.share3to5)} | ${r.zeroTags} | ${pct(r.exactRate)} | ${pct(r.baseExactRate)} | ${pct(r.sideRate)} |`);
  const T = out.total;
  console.log(`\nTOTAL n=${T.n}: any unfinished ${pct(T.unfinishedShare)}, tags mean ${T.tagsMean.toFixed(2)}, 3 to 5 tags ${pct(T.share3to5)}, 0 tags ${T.zeroTags}, sealed exact ${pct(T.exactRate)} vs baseline ${pct(T.baseExactRate)}`);
  const byRooms = {};
  for (const s of out.silent) (byRooms[s.rooms] ||= []).push(`${s.tag}${s.reachable ? "*" : ""}`);
  console.log("\nTags that never fired on a room set (* = the widest pool could still fire it):");
  for (const [k, v] of Object.entries(byRooms)) console.log(`  ${k}: ${v.join(", ")}`);
  const never = LIB.tags.map((t) => t.id).filter((id) => !out.shownAll[id]);
  console.log(`\nTags never shown on any page: ${never.join(", ") || "none"}`);
}
