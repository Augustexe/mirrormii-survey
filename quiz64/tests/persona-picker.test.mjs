// The lobby and the rules-based picker (2026-09-28): lobby validation and persistence, a fixed run length on every
// lobby, axis coverage, determinism and replay, the retention rules, the flow rules and a quick simulation.
import test from "node:test";
import assert from "node:assert/strict";
import * as Session from "../src/persona/session.js";
import { S, KIT } from "../src/persona/kit.js";
import { restoreRun } from "../src/persona/store.js";
import { LOBBY_COPY, VOICE_IDS, DEPTH_IDS, ROOM_IDS, ROOM_CHAPTERS, hostLine, cardVoice } from "../src/persona/lobby.js";
import { ADULT, OTHER, clock, started, playUntil, firstOption, leaning, OPEN_LOBBY, ROOM_SETS, DEPTHS, lobbyFor } from "./persona-helpers.mjs";
import { makePlayer, makeRandomPlayer, playPicker, simulate } from "./persona-sim.mjs";
import { sceneRefs } from "../../research/persona-quiz-v2/final/check-bank.mjs";

const { RUN_SIZE, FINALE_SIZE } = Session;
const AXES = S.AXES;
const SIGNS = [
  { R1: 1, R2: 1, R3: 1, L1: 1, L2: 1, L3: 1 },
  { R1: -1, R2: -1, R3: -1, L1: -1, L2: -1, L3: -1 },
  { R1: 1, R2: -1, R3: 1, L1: -1, L2: 1, L3: -1 },
];
// Every room set x depth, with two different setups (the setup never changes the pool; it varies nothing but is kept
// so the grid still exercises two players).
const COMBOS = ROOM_SETS.flatMap((rooms) => DEPTHS.flatMap((depth) => [ADULT, OTHER].map((setup, k) => ({ rooms, depth, setup, name: `${k ? "other" : "default"}/${depth}/${rooms.join("+") || "no rooms"}` }))));
const runCardsOf = (state) => Session.routeFor(state);
const isRoundPair = (a, b) => a.type === "this_or_that" && b.type === "this_or_that" && a.round && a.round === b.round;

// Plays a run step by step, recording the picker's reason for every run card.
function playTraced(setup, lobby, choose, runId) {
  let s = started(setup, runId, lobby);
  const trace = [];
  for (let guard = 0; guard < 100; guard++) {
    const step = Session.currentStep(s);
    if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
    if (step.kind !== "card") break;
    if (step.phase !== "finale") trace.push({ step, why: Session.pickInfo(s), rushedBefore: Session.recentlyRushed(s) });
    const pick = choose(step.card, step, s);
    s = Session.answerCard(s, step.card.id, pick.value, { ms: pick.ms ?? 4000, flip: pick.flip ?? null, now: clock() });
  }
  return { state: s, trace };
}

// ------------------------------------------------------------------------------------------------ lobby
test("lobby: three taps (voice, how personal, rooms), validation and one-time choice; no ending tap", () => {
  const s = started(ADULT, "lobbyrun1", null);
  assert.deepEqual(Session.currentStep(s), { kind: "lobby" });
  assert.throws(() => Session.chooseLobby(Session.newRun({ runId: "lobbyrun0" }), OPEN_LOBBY), { code: "not_ready" });
  for (const bad of [null, {}, { ...OPEN_LOBBY, depth: "deep" }, { ...OPEN_LOBBY, depth: "personal" }, { ...OPEN_LOBBY, depth: "some" }, { ...OPEN_LOBBY, voice: "loud" },
    { ...OPEN_LOBBY, ending: "funny" }, { ...OPEN_LOBBY, delivery: "playful" }, { depth: "light", rooms: [] },
    { ...OPEN_LOBBY, rooms: ["love", "love"] }, { ...OPEN_LOBBY, rooms: ["money"] }, { ...OPEN_LOBBY, rooms: "love" }, { ...OPEN_LOBBY, extra: 1 }]) {
    assert.throws(() => Session.chooseLobby(s, bad), { code: "bad_lobby" }, JSON.stringify(bad));
  }
  const heart = Session.chooseLobby(s, { voice: "heart", depth: "light", rooms: ["family", "love"] });
  assert.deepEqual(heart.lobby, { voice: "heart", depth: "light", rooms: ["love", "family"] }, "rooms in canonical order");
  assert.equal(Session.voiceFor(heart), "heart");
  assert.equal(Session.cardVoiceFor(heart), "heart");
  assert.equal(Session.voiceFor(s), "fun", "no lobby yet reads as Make it fun");
  assert.equal(Session.endingFor, undefined, "the ending tap is gone");
  assert.equal(Session.deliveryFor, undefined, "voice replaces delivery");
  assert.throws(() => Session.chooseLobby(heart, OPEN_LOBBY), { code: "already_chosen" });
  for (const voice of VOICE_IDS) for (const depth of DEPTH_IDS) assert.equal(Session.chooseLobby(s, { voice, depth, rooms: [] }).lobby.voice, voice);
  assert.equal(Session.cardVoiceFor(Session.chooseLobby(s, { ...OPEN_LOBBY, voice: "cards" })), "fun", "Just the cards reads Make it fun");
});

test("lobby: saved and restored with the run; bad or missing lobbies and old saves fail closed", () => {
  const atLobby = started(OTHER, "lobbysave1", null);
  const back = restoreRun(Session.serialize(atLobby));
  assert.equal(back.lobby, null);
  assert.deepEqual(Session.currentStep(back), { kind: "lobby" });

  const mid = playUntil(started(ADULT, "lobbysave2", lobbyFor(["work"], "light", { voice: "heart" })), firstOption, (step) => step.kind === "card" && step.resolved === 17);
  const again = restoreRun(Session.serialize(mid));
  assert.deepEqual(again.lobby, mid.lobby);
  assert.equal(Session.currentStep(again).card.id, Session.currentStep(mid).card.id);

  const raw = JSON.parse(Session.serialize(mid));
  const bad = (mutate, code) => { const copy = structuredClone(raw); mutate(copy); assert.throws(() => restoreRun(JSON.stringify(copy)), (e) => e.code === code, code); };
  bad((d) => { d.lobby.depth = "deep"; }, "corrupt");
  bad((d) => { d.lobby.rooms = ["work", "attic"]; }, "corrupt");
  bad((d) => { d.lobby.spy = true; }, "corrupt");
  bad((d) => { d.lobby = null; }, "corrupt"); // answers without a lobby are outside any route
  bad((d) => { d.lobby.rooms = ["love", "work", "family"]; }, "corrupt"); // a different lobby gives a different route
  bad((d) => { d.lobby.voice = "loud"; }, "corrupt");
  bad((d) => { delete d.lobby.voice; }, "corrupt");
  bad((d) => { d.lobby.ending = "funny"; }, "corrupt");
  bad((d) => { d.schema = "genii.persona.run/1"; }, "schema");
  // A save from the age screen and four-tap lobby (schema 2) fails closed with a readable reason.
  const v2 = structuredClone(raw);
  v2.schema = "genii.persona.run/2";
  v2.setup = { age: "adult", ...v2.setup };
  v2.lobby = { ending: "funny", depth: "personal", rooms: ["work"], delivery: "playful" };
  assert.throws(() => restoreRun(JSON.stringify(v2)), (e) => e.code === "schema" && /earlier version/.test(e.message));
  // A save from before the lobby existed (schema 1, no lobby field) is refused with a readable reason, never a crash.
  const v1 = structuredClone(raw);
  v1.schema = "genii.persona.run/1";
  delete v1.lobby;
  assert.throws(() => restoreRun(JSON.stringify(v1)), (e) => e.code === "schema" && /earlier version/.test(e.message));
});

test("lobby copy: one object, every id covered, short lines, no em dash; host lines follow the voice", () => {
  const byKey = Object.fromEntries(LOBBY_COPY.steps.map((s) => [s.key, s.options.map((o) => o.id)]));
  assert.deepEqual(byKey, { voice: [...VOICE_IDS], depth: [...DEPTH_IDS], rooms: [...ROOM_IDS] });
  assert.deepEqual(LOBBY_COPY.steps.map((s) => s.title), ["How should Genii talk to you?", "How personal can Genii get?", "Which rooms can Genii visit?"]);
  assert.deepEqual(LOBBY_COPY.steps[0].options.map((o) => o.text), ["Make it fun", "Heart to heart", "Just the cards"]);
  assert.deepEqual(LOBBY_COPY.steps[1].options.map((o) => o.text), ["Keep it light", "Ask me anything"]);
  const strings = [];
  const walk = (v) => { if (typeof v === "string") strings.push(v); else if (typeof v === "function") strings.push(v(1, 2)); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  walk(LOBBY_COPY);
  for (const t of strings) {
    assert.ok(!/\u2014/.test(t), `em dash in "${t}"`);
    assert.ok(t.length <= 190, `long line "${t}"`);
  }
  for (const step of LOBBY_COPY.steps) for (const o of step.options) assert.ok(o.text.split(/\s+/).length <= 6, `short option "${o.text}"`);
  assert.equal(hostLine("cards", { phase: "chapter", index: 2 }), null);
  assert.equal(hostLine("cards", { phase: "chapter", index: 2, rushing: true }), null, "Just the cards hides the speed nudge too");
  for (const v of ["fun", "heart"]) {
    assert.equal(typeof hostLine(v, { phase: "chapter", index: 3 }), "string");
    assert.equal(hostLine(v, { phase: "chapter", rushing: true }), LOBBY_COPY.host[v].rushing);
  }
  assert.notEqual(hostLine("heart", { phase: "chapter", index: 1 }), hostLine("fun", { phase: "chapter", index: 1 }), "two distinct voices");
  for (const t of Object.values(LOBBY_COPY.host.heart).flat()) assert.ok(!/!/.test(t), `Heart to heart has no exclamation marks: "${t}"`);
  assert.equal(cardVoice("heart"), "heart");
  assert.equal(cardVoice("cards"), "fun");
  assert.equal(cardVoice("fun"), "fun");
});

// ------------------------------------------------------------------------------------------------ run length and filters
test("every lobby: exactly RUN_SIZE run cards, then the 8 finale cards, with the room and depth filters", () => {
  assert.equal(RUN_SIZE, 40);
  assert.equal(FINALE_SIZE, 8);
  for (const c of COMBOS) {
    for (const [label, choose] of [["first option", firstOption], ["consistent", leaning(SIGNS[2])]]) {
      const { state, trace } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), choose, "lenrun001");
      const cards = runCardsOf(state);
      assert.equal(cards.length, RUN_SIZE, `${c.name} ${label}: ${cards.length} run cards`);
      assert.equal(Object.keys(state.finale).length, FINALE_SIZE, `${c.name}: finale`);
      assert.equal(Session.answeredCount(state), RUN_SIZE + FINALE_SIZE, `${c.name}: 48 answers`);
      assert.equal(Session.currentStep(state).kind, "result");
      const open = new Set(Session.openChapterIds(lobbyFor(c.rooms, c.depth)));
      for (const card of cards) {
        if (card.chapter !== "extra") assert.ok(open.has(card.chapter), `${c.name}: ${card.id} from a closed room`);
        if (c.depth === "light") assert.notEqual(card.privacy, "intimate", `${c.name}: ${card.id}`);
      }
      // "Card x of 40": the counter moves by one per card and the total never changes.
      trace.forEach((t, i) => { assert.equal(t.step.resolved, i); assert.equal(t.step.total, RUN_SIZE); });
    }
  }
});

test("coverage: every axis gets at least 2 valid cards for a consistent player on every lobby", () => {
  for (const c of COMBOS) {
    for (const [i, signs] of SIGNS.entries()) {
      const { state } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(signs), `cover${i}0001`);
      const p = Session.profileFor(state);
      for (const a of AXES) assert.ok(p.axes[a].cards >= 2 && !p.axes[a].unfinished, `${c.name} signs ${i}: ${a} has ${p.axes[a].cards}`);
    }
    for (let i = 0; i < 3; i++) {
      const player = makePlayer(`cover-${c.name}-${i}`, { noise: 0 });
      const p = Session.profileFor(playPicker(c.setup, lobbyFor(c.rooms, c.depth), player, `covsyn${i}01`));
      for (const a of AXES) assert.ok(!p.axes[a].unfinished, `${c.name} synthetic ${i}: ${a} unfinished`);
    }
  }
});

// ------------------------------------------------------------------------------------------------ determinism and replay
test("the picker is deterministic, restore replays it card for card, and run ids vary the route", () => {
  const lobby = lobbyFor(["love", "family"], "light");
  const choose = leaning(SIGNS[0]);
  const a = playTraced(ADULT, lobby, choose, "determ001");
  const b = playTraced(ADULT, lobby, choose, "determ001");
  assert.deepEqual(runCardsOf(a.state).map((c) => c.id), runCardsOf(b.state).map((c) => c.id));
  // Same answers, same saved run; only the clock differs (timestamps and the lock hash, which covers the lock time).
  const clockless = (st) => Session.serialize(st).replace(/"(createdAt|updatedAt|frozenAt|lockHash)":"[^"]*"/g, "");
  assert.equal(clockless(a.state), clockless(b.state));

  for (const at of [1, 9, 23, RUN_SIZE - 1]) {
    const mid = playUntil(started(OTHER, "replay001", lobby), choose, (step) => step.kind === "card" && step.resolved === at);
    const back = restoreRun(Session.serialize(mid));
    assert.deepEqual(runCardsOf(back).map((c) => c.id), runCardsOf(mid).map((c) => c.id), `replay at ${at}`);
    assert.deepEqual(Session.currentStep(back), Session.currentStep(mid));
    assert.equal(Session.recentlyRushed(back), Session.recentlyRushed(mid));
  }
  const done = restoreRun(Session.serialize(a.state));
  assert.deepEqual(Session.resultFor(done).sealed, Session.resultFor(a.state).sealed);

  // An answer for a card the picker never served (or served in another order) can't be replayed.
  const raw = JSON.parse(Session.serialize(a.state));
  const served = new Set(Object.keys(raw.answers));
  const unserved = S.runCards(ADULT).find((c) => !served.has(c.id) && c.type === "scenario" && Session.openChapterIds(lobby).includes(c.chapter));
  const copy = structuredClone(raw);
  const victim = Object.keys(copy.answers).filter((k) => !k.includes(".")).at(-1);
  delete copy.answers[victim];
  delete copy.ms[victim];
  copy.answers[unserved.id] = 0;
  assert.throws(() => restoreRun(JSON.stringify(copy)), { code: "corrupt" });

  const routes = new Set();
  for (let i = 0; i < 10; i++) routes.add(runCardsOf(playUntil(started(ADULT, `variety${i}0`, OPEN_LOBBY), choose)).map((c) => c.id).join());
  assert.ok(routes.size >= 3, `run ids give different routes (${routes.size} of 10)`);
});

// ------------------------------------------------------------------------------------------------ retention rules
test("rushed streak: after three rushed taps the next free pick is a lighter card whenever one is on offer", () => {
  let fired = 0;
  for (const c of COMBOS) {
    const rusher = (card, step) => ({ ...firstOption(card), ms: step.resolved >= 6 ? 700 : 4000 });
    const { trace } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), rusher, "rushrule1");
    for (const t of trace) {
      if (t.why.rule !== "pick" || !t.why.rushed) continue;
      assert.ok(t.rushedBefore, "the streak matches recentlyRushed");
      if (!t.why.lightOffered) continue;
      fired++;
      assert.ok(Session.LIGHT_TYPES.includes(t.step.card.type), `${c.name}: ${t.step.card.id} is ${t.step.card.type} after a rushed streak`);
    }
  }
  assert.ok(fired >= COMBOS.length, `the rule fired ${fired} times`);
  // Same run, calm versus rushed: the rushed run gets more quick cards.
  const light = (ms) => runCardsOf(playUntil(started(ADULT, "rushcmp01"), (card, step) => ({ ...firstOption(card), ms: step.resolved >= 3 ? ms : 4000 }))).filter((c) => Session.LIGHT_TYPES.includes(c.type)).length;
  assert.ok(light(700) > light(4000), `light cards rushed ${light(700)} vs calm ${light(4000)}`);
});

test("exit replacement: after Skip, Not my life or No recent example, the next free pick evidences the exited card's axis when it can", () => {
  let fired = 0;
  let exits = 0;
  for (const c of COMBOS) {
    const skipper = (card, step) => (step.resolved % 4 === 1 && card.exits.length ? { value: card.exits[step.resolved % card.exits.length] } : firstOption(card));
    const { trace } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), skipper, "exitrule1");
    for (let i = 1; i < trace.length; i++) {
      const prev = trace[i - 1].step.card;
      if (trace[i - 1].step.resolved % 4 === 1 && Session.cardAxes(prev).length) exits++;
      const t = trace[i];
      if (t.why.rule !== "pick" || !t.why.exitAxes.length) continue;
      assert.deepEqual([...t.why.exitAxes].sort(), Session.cardAxes(prev).sort(), "the exited card's axes");
      if (!t.why.sameAxisOffered) continue;
      fired++;
      assert.ok(Session.cardAxes(t.step.card).some((a) => t.why.exitAxes.includes(a)), `${c.name}: ${t.step.card.id} after exiting ${prev.id}`);
    }
  }
  assert.ok(exits > 0 && fired >= COMBOS.length / 2, `the rule fired ${fired} times over ${exits} axis exits`);
});

// ------------------------------------------------------------------------------------------------ flow rules
test("flow: chapters in order and whole, each opened by its first authored card, no feeling cards served", () => {
  for (const c of COMBOS) {
    const { state, trace } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(SIGNS[1]), "flowrun01");
    const cards = runCardsOf(state);
    const groups = [];
    for (const t of trace) if (!groups.length || groups.at(-1).key !== t.step.chapter) groups.push({ key: t.step.chapter, first: t });
    const keys = groups.map((g) => g.key);
    assert.equal(new Set(keys).size, keys.length, `${c.name}: a chapter was left and re-entered ${keys}`);
    assert.deepEqual(keys.filter((k) => k !== "extra"), [...keys.filter((k) => k !== "extra")].sort((x, y) => x - y));
    if (keys.includes("extra")) assert.equal(keys.at(-1), "extra", "bonus cards come last");
    for (const g of groups) {
      assert.equal(g.first.step.index, 1, `${c.name}: chapter ${g.key} starts at card 1 (its intro shows)`);
      if (g.key === "extra") continue;
      // The first authored card whose sub-question is still unused (by the sealed cards or an earlier chapter).
      const before = new Set([...Session.finaleFor(state), ...cards.slice(0, g.first.step.resolved)].map((x) => x.sq).filter(Boolean));
      const eligible = KIT.chapters[g.key - 1].cards.filter((x) => Session.depthAllows(x, c.depth) && !x.gateRule && x.type !== "feeling" && !(x.sq && before.has(x.sq)));
      assert.equal(g.first.step.card.id, eligible[0].id, `${c.name}: chapter ${g.key} opener`);
      assert.equal(g.first.why.rule, "opener");
    }
    // Feeling cards are off (CONFIG.serveFeeling, 2026-09-30): no route serves one.
    assert.deepEqual(cards.filter((x) => x.type === "feeling").map((x) => x.id), [], `${c.name}: a feeling card was served`);
  }
});

// ------------------------------------------------------------------------------------------------ one card per sub-question
// Jerry, 2026-09-29: "I see duplicates again. The questions aren't unique." A run never serves two cards on one
// sub-question (sq), the 8 sealed cards included. The one exception is coverage: a second card on an sq whose axis would
// otherwise end below MIN_AXIS_CARDS (the picker marks it why.sqRepeat), never a third, never right after the card it
// repeats, never the last run card before a sealed card on the same sq.
test("one card per sub-question: no run repeats an sq (sealed cards included) outside the documented coverage exception", () => {
  let runs = 0, repeatRuns = 0, repeats = 0;
  for (const c of COMBOS) {
    for (const [i, signs] of SIGNS.entries()) {
      const { state, trace } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(signs), `sqrun${i}0001`);
      const route = runCardsOf(state);
      const finale = Session.finaleFor(state);
      runs++;
      const seen = new Map();
      finale.forEach((f) => { if (f.sq) { assert.ok(!seen.has(f.sq), `${c.name}: two sealed cards on ${f.sq}`); seen.set(f.sq, 1); } });
      let any = false;
      route.forEach((card, k) => {
        if (!card.sq) return;
        const n = (seen.get(card.sq) || 0) + 1;
        seen.set(card.sq, n);
        if (n === 1) return;
        any = true;
        repeats++;
        assert.equal(n, 2, `${c.name}: ${card.id} is a third card on ${card.sq}`);
        assert.equal(trace[k].why.sqRepeat, card.sq, `${c.name}: ${card.id} repeats ${card.sq} without the coverage exception`);
        if (k > 0) assert.notEqual(route[k - 1].sq, card.sq, `${c.name}: ${card.id} right after a card on ${card.sq}`);
        const axes = Session.cardAxes(card);
        assert.ok(axes.length, `${c.name}: ${card.id} carries no axis, so it can't be a coverage repeat`);
      });
      if (route.length && finale.length) assert.ok(route.at(-1).sq !== finale[0].sq || !route.at(-1).sq, `${c.name}: last run card and first sealed card share an sq`);
      if (any) repeatRuns++;
    }
  }
  // The exception is rare (thin L2 sub-questions in lobbies without the work room, see SIM-REPORT / the M2 report).
  assert.ok(repeatRuns / runs <= 0.05, `coverage repeats in ${repeatRuns} of ${runs} runs (${repeats} cards)`);
});

test("one card per sub-question: the sealed draw never repeats an sq, and every run card avoids the sealed cards' sqs", () => {
  for (let seed = 0; seed < 400; seed++) {
    const ids = S.drawFinale(seed, FINALE_SIZE);
    const sqs = ids.map((id) => S.cardById[id].sq).filter(Boolean);
    assert.equal(new Set(sqs).size, sqs.length, `seed ${seed}: ${sqs}`);
  }
  for (const rooms of ROOM_SETS) {
    const state = playPicker(ADULT, lobbyFor(rooms, "anything"), makePlayer(`sealed-sq-${rooms.join("+")}`), `sealsq${rooms.length}${rooms.join("").slice(0, 6)}`);
    const trace = Session.routeFor(state);
    const sealed = new Set(Session.finaleFor(state).map((c) => c.sq).filter(Boolean));
    const clash = trace.filter((c) => c.sq && sealed.has(c.sq));
    assert.ok(clash.length <= 1, `${rooms}: run cards on sealed sqs ${clash.map((c) => c.id)}`);
  }
});

// Feeling cards (2026-09-30): off in runs (S.CONFIG.serveFeeling), kept in the bank untouched. Every scene link the
// checker finds either involves a feeling card (not served) or is a soft prompt overlap; no served card shares a scene
// device or points at another card.
test("feeling cards are not served: the switch is off, they stay in the bank, and served cards carry no hard scene link", () => {
  assert.equal(S.CONFIG.serveFeeling, false);
  const all = [...KIT.chapters.flatMap((ch) => ch.cards), ...KIT.extras, ...KIT.finale];
  const feelings = all.filter((c) => c.type === "feeling");
  assert.equal(feelings.length, 7, "the 7 feeling cards stay in the bank");
  for (const f of feelings) assert.ok(S.cardById[f.follows], `${f.id} keeps its follows link`);
  const isFeeling = (id) => S.cardById[id] && S.cardById[id].type === "feeling";
  const hard = sceneRefs(all).filter((r) => r.hard && !isFeeling(r.id) && !isFeeling(r.other));
  assert.deepEqual(hard, [], hard.map((r) => `${r.id}: ${r.what}`).join("\n"));
  for (const c of COMBOS) {
    for (const [i, signs] of SIGNS.entries()) {
      const { state } = playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(signs), `nofeel${i}${c.name.length}`);
      assert.deepEqual(Session.routeFor(state).filter((x) => x.type === "feeling").map((x) => x.id), [], c.name);
      assert.deepEqual(Session.poolFor(state).filter((x) => x.type === "feeling").map((x) => x.id), [], c.name);
    }
  }
});

// A receipts card is a list of small facts across topics, so the neighbour rule compares it on its axes only
// (Session.flowDims); every other card on its axes and tag pairs.
test("flow: no two cards of one type in a row except this_or_that rounds, and no neighbours on the same axis or tag pair", () => {
  let chapterBreaks = 0;
  let bonusBreaks = 0;
  let neighbours = 0;
  for (const c of COMBOS) {
    for (const [i, signs] of SIGNS.entries()) {
      const cards = runCardsOf(playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(signs), `nbr${i}00001`).state);
      for (let k = 1; k < cards.length; k++) {
        const a = cards[k - 1];
        const b = cards[k];
        neighbours++;
        const sameType = a.type === b.type && !isRoundPair(a, b);
        const shared = Session.flowDims(b).filter((d) => Session.flowDims(a).includes(d));
        if (!sameType && !shared.length) continue;
        // Coverage outranks flow: when closed rooms leave an axis to the bonus cards alone, two bonus cards may have
        // to sit together. Anywhere else a steady player never sees a repeat.
        if (a.chapter === "extra" && b.chapter === "extra") { bonusBreaks++; continue; }
        chapterBreaks++;
        assert.fail(`${c.name}: ${a.id} (${a.type}) then ${b.id} (${b.type}) share ${sameType ? "a type" : shared}`);
      }
    }
  }
  assert.equal(chapterBreaks, 0);
  assert.ok(bonusBreaks / neighbours < 0.02, `bonus-card repeats ${bonusBreaks} of ${neighbours} neighbours`);
});

// ------------------------------------------------------------------------------------------------ simulation
test("simulation (small): 48 cards for everyone, no unfinished side, nobody with 0 tags, most with 3 to 5", () => {
  const out = simulate({ n: 8, baseline: false });
  assert.equal(out.rows.length, ROOM_SETS.length * DEPTHS.length);
  for (const r of out.rows) {
    assert.equal(r.cardsMin, RUN_SIZE);
    assert.equal(r.cardsMax, RUN_SIZE);
    assert.equal(r.zeroTags, 0, r.key);
  }
  assert.ok(out.total.unfinishedShare <= 0.01, `unfinished ${out.total.unfinishedShare}`);
  assert.ok(out.total.share3to5 >= 0.85, `3 to 5 tags ${out.total.share3to5}`);
  assert.ok(out.total.exactRate >= 0.45, `sealed exact ${out.total.exactRate}`);
  assert.ok(Object.values(ROOM_CHAPTERS).every((n) => KIT.chapters[n - 1]), "room chapters exist in the kit");
});

// Step B formats (2026-09-28): receipts and bet cards are spread out, never back to back or clustered.
test("flow: receipts and bet cards are spread out: never two of one format within 3 cards, and rarely side by side", () => {
  let near = 0;
  let pairs = 0;
  for (const c of COMBOS.filter((x) => x.depth === "anything")) {
    for (const [i, signs] of SIGNS.entries()) {
      const cards = runCardsOf(playTraced(c.setup, lobbyFor(c.rooms, c.depth), leaning(signs), `spr${i}00001`).state);
      cards.forEach((card, k) => {
        if (!Session.SPREAD_TYPES.includes(card.type)) return;
        const window = cards.slice(Math.max(0, k - 3), k).map((x) => x.type);
        assert.ok(!window.includes(card.type), `${c.name}: ${card.id} (${card.type}) within 3 cards of another ${card.type}`);
        pairs++;
        if (k > 0 && Session.SPREAD_TYPES.includes(cards[k - 1].type)) near++;
      });
    }
  }
  assert.ok(pairs > 0, "the new formats are served");
  assert.ok(near / pairs < 0.1, `receipts right after a bet (or back) ${near} of ${pairs}`);
});

// Random clickers at the real run length: the kit sim's full walk no longer stands in for a run (see sim.mjs INFO).
// Acceptance (45 to 55% per pole) is measured on 4,000 random clickers by persona-sim.mjs --acceptance; this sample is
// smaller, so its band is wider.
test("random clickers at RUN_SIZE: under 1.5 strong tags on average, every pole 42 to 58%", () => {
  let strong = 0;
  const plus = Object.fromEntries(AXES.map((a) => [a, 0]));
  const n = 400;
  for (let i = 0; i < n; i++) {
    const setup = i % 2 ? ADULT : OTHER;
    const s = playPicker(setup, OPEN_LOBBY, makeRandomPlayer(`guard-${i}`), `rndg${String(i).padStart(4, "0")}`);
    const p = Session.profileFor(s);
    strong += p.strongTags.length;
    for (const a of AXES) if (p.axes[a].pole > 0) plus[a]++;
  }
  assert.ok(strong / n < 1.5, `random strong tags ${strong / n}`);
  for (const a of AXES) assert.ok(plus[a] / n >= 0.42 && plus[a] / n <= 0.58, `${a}: ${plus[a] / n}`);
});
