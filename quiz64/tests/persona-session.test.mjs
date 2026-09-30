import test from "node:test";
import assert from "node:assert/strict";
import * as Session from "../src/persona/session.js";
import { S, KIT, KIT_ID } from "../src/persona/kit.js";
import { sha256Hex, canonicalJSON } from "../src/persona/sha256.js";
import { restoreRun } from "../src/persona/store.js";
import { ADULT, OTHER, clock, started, playUntil, firstOption, leaning, completeRun, reach, OPEN_LOBBY, lobbyFor } from "./persona-helpers.mjs";
import crypto from "node:crypto";

const seenIds = (state) => Object.keys(state.answers).filter((k) => !k.endsWith(".flip"));

test("sha256 matches node:crypto on ascii, unicode and block-boundary inputs", () => {
  for (const text of ["", "abc", "Genii 🐸 你真的懂我嗎", "a".repeat(55), "b".repeat(56), "c".repeat(64), "d".repeat(1000)]) {
    assert.equal(sha256Hex(text), crypto.createHash("sha256").update(text, "utf8").digest("hex"));
  }
  assert.equal(canonicalJSON({ b: 1, a: [2, { d: 1, c: 2 }] }), canonicalJSON({ a: [2, { c: 2, d: 1 }], b: 1 }));
});

test("setup: closest person and pronoun only; there is no age question", () => {
  const fresh = Session.newRun({ now: clock(), runId: "abcdefgh" });
  assert.deepEqual(Session.currentStep(fresh), { kind: "setup" });
  assert.throws(() => Session.startRun(fresh, { closest: "boss", pronoun: "he" }), { code: "bad_setup" });
  assert.throws(() => Session.startRun(fresh, { ...ADULT, name: "free text" }), { code: "bad_setup" });
  assert.throws(() => Session.startRun(fresh, { ...ADULT, age: "adult" }), { code: "bad_setup" }, "an age field is not part of setup");
  assert.throws(() => Session.startRun(fresh, { ...ADULT, age: "under13" }), { code: "bad_setup" });
  assert.equal(Session.AGE_OPTIONS, undefined, "no age options");
  const s = Session.startRun(fresh, ADULT);
  assert.deepEqual(s.setup, { closest: ADULT.closest, pronoun: ADULT.pronoun });
  assert.throws(() => Session.startRun(s, OTHER), { code: "already_started" });
  assert.deepEqual(Session.currentStep(s), { kind: "lobby" }, "the lobby comes right after setup");
  const l = Session.chooseLobby(s, OPEN_LOBBY);
  assert.equal(Session.currentStep(l).card.id, KIT.chapters[0].cards[0].id);
});

test("adult run: RUN_SIZE picked cards with chapters in order, the finale after one lock, then a result", () => {
  const s = completeRun(ADULT, firstOption, "adultrun1");
  const seen = Session.routeFor(s).map((c) => c.id);
  assert.equal(seen.length, Session.RUN_SIZE, `adult run cards ${seen.length}`);
  assert.deepEqual(seenIds(s).sort(), [...seen].sort());
  const chapterOf = (id) => (S.cardById[id].chapter === "extra" ? 8 : S.cardById[id].chapter);
  for (let i = 1; i < seen.length; i++) assert.ok(chapterOf(seen[i - 1]) <= chapterOf(seen[i]), `chapters in order at ${seen[i]}`);
  assert.equal(Object.keys(s.finale).length, 8);
  assert.equal(Session.currentStep(s).kind, "result");
  const { profile, result, sealed } = Session.resultFor(s);
  assert.ok(result.tags.length >= 1 && result.tags.length <= 5);
  assert.equal(sealed.rows.length, 8);
  assert.equal(profile.warnings.length, 0);
});

test("one bank for everyone: the setup never changes the route; Keep it light skips intimate cards", () => {
  const route = (setup, lobby) => Session.routeFor(completeRun(setup, firstOption, "samerun01", lobby)).map((c) => c.id);
  assert.deepEqual(route(ADULT, OPEN_LOBBY), route(OTHER, OPEN_LOBBY), "closest person and pronoun never change the cards");
  assert.deepEqual(route(ADULT, OPEN_LOBBY), route(ADULT, { ...OPEN_LOBBY, voice: "heart" }), "the voice never changes the cards");
  const intimate = KIT.chapters.flatMap((c) => c.cards).filter((c) => c.privacy === "intimate").map((c) => c.id);
  assert.ok(intimate.length >= 4);
  for (const runId of ["lightrun1", "lightrun2", "lightrun3"]) {
    const shown = Session.routeFor(completeRun(ADULT, leaning({ R1: 1, R3: 1, L2: 1 }), runId, lobbyFor(["love", "work", "family"], "light"))).map((c) => c.id);
    for (const id of intimate) assert.ok(!shown.includes(id), `${id} served on Keep it light`);
  }
  assert.equal(Session.depthAllows(S.cardById[intimate[0]], "anything"), true);
  assert.equal(Session.depthAllows(S.cardById[intimate[0]], "light"), false);
  for (const c of KIT.chapters.flatMap((ch) => ch.cards)) assert.ok(!("teen" in c) && !("teenPrompt" in c), c.id);
});

// Build C removed the kids gate (C3-8/C3-9): no card is gated, so the pool is every open card after the depth filter,
// less the cards on a sub-question the run's sealed cards already take (one card per sub-question, M2) and less the
// feeling cards (not served, S.CONFIG.serveFeeling off). The scorer's gate support is tested on a fixture in the kit tests.
test("no gated cards: the pool is every open chapter card and extra after the depth filter, less the sealed cards' sub-questions", () => {
  const cards = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.extras];
  assert.deepEqual(cards.filter((c) => c.gateRule).map((c) => c.id), []);
  const s = started(ADULT, "poolrun01", lobbyFor(["work"], "light"));
  const open = new Set(Session.openChapterIds(s.lobby));
  const sealed = new Set(Session.finaleFor(s).map((c) => c.sq).filter(Boolean));
  assert.ok(sealed.size > 0);
  const want = cards.filter((c) => (c.chapter === "extra" || open.has(c.chapter)) && Session.depthAllows(c, "light") && c.type !== "feeling" && !(c.sq && sealed.has(c.sq))).map((c) => c.id).sort();
  assert.deepEqual(Session.poolFor(s).map((c) => c.id).sort(), want);
});

test("feeling cards never join the pool, not even after a picked moment they follow (S.CONFIG.serveFeeling off)", () => {
  assert.equal(S.CONFIG.serveFeeling, false);
  let card = null, before = null;
  for (const f of KIT.chapters.flatMap((c) => c.cards).filter((c) => c.type === "feeling" && c.privacy === "normal")) {
    before = reach(f.follows, { tries: 30 });
    if (before) { card = f; break; }
  }
  assert.ok(before, "some run serves a moment that has a feeling card");
  const moment = S.cardById[card.follows];
  const s = Session.answerCard(before, moment.id, moment.options.findIndex((o) => !o.circumstance), { ms: 3000, now: clock() });
  assert.equal(Session.poolFor(s).some((c) => c.id === card.id), false);
  const next = Session.currentStep(s);
  assert.ok(next.kind !== "card" || next.card.id !== card.id, `${card.id} served after ${moment.id}`);
});

test("answers are validated per card: exits, pick two, depends follow-ups, order and timing", () => {
  let s = started(ADULT, "valrun001");
  const first = Session.currentStep(s).card;
  assert.throws(() => Session.answerCard(s, first.id, "no_recent"), { code: "bad_answer" }, "no_recent only on real cards");
  assert.throws(() => Session.answerCard(s, first.id, 99), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, first.id, 0, { ms: -5 }), { code: "bad_answer" });
  const notNow = KIT.chapters[6].cards.find((c) => c.id !== first.id);
  assert.throws(() => Session.answerCard(s, notNow.id, 0), { code: "out_of_order" });
  const pickTwo = KIT.chapters.flatMap((c) => c.cards).find((c) => c.type === "pick_two");
  s = reach(pickTwo.id);
  assert.throws(() => Session.answerCard(s, pickTwo.id, [0]), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, pickTwo.id, [1, 1]), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, pickTwo.id, 0), { code: "bad_answer" });
  // A follow-up flip belongs only to a "depends" option; on any other pick it is refused.
  assert.throws(() => Session.answerCard(started(ADULT, "valrun001"), first.id, 0, { flip: 1 }), { code: "bad_answer" }, "flip only after a depends option");
  const depends = KIT.chapters.flatMap((c) => c.cards).filter((c) => c.flip).find((c) => reach(c.id));
  if (!depends) return; // no depends card in this bank; the scorer's flip record is tested on a fixture in the kit tests
  const di = depends.options.findIndex((o) => o.depends);
  s = reach(depends.id);
  assert.throws(() => Session.answerCard(s, depends.id, 0, { flip: 1 }), { code: "bad_answer" }, "flip only after a depends option");
  const withFlip = Session.answerCard(s, depends.id, di, { flip: 2, ms: 2500 });
  assert.equal(withFlip.answers[`${depends.id}.flip`], 2);
  assert.equal(withFlip.ms[depends.id], 2500);
  const noFlip = Session.answerCard(s, depends.id, di, { ms: 2500 });
  assert.equal(noFlip.answers[`${depends.id}.flip`], undefined);
  const profile = Session.profileFor(withFlip);
  assert.equal(profile.research.depends.length, 1);
  assert.equal(profile.research.depends[0].flip, depends.flip.options[2]);
});

test("new formats validate their own answer shapes: receipts ticks with an exclusive None, rank a full order, bet, eyes and reply one pick", () => {
  const receipts = { type: "receipts", exits: ["skip", "not_my_life"], options: [{ t: "a" }, { t: "b" }, { t: "c" }, { t: "None of these", none: true }] };
  assert.deepEqual(Session.validateResponse(receipts, [2, 0]), [0, 2], "stored sorted");
  assert.deepEqual(Session.validateResponse(receipts, []), [], "Done with nothing ticked");
  assert.deepEqual(Session.validateResponse(receipts, [3]), [3]);
  assert.throws(() => Session.validateResponse(receipts, [0, 3]), { code: "bad_answer" }, "None stands alone");
  assert.throws(() => Session.validateResponse(receipts, [0, 0]), { code: "bad_answer" });
  assert.throws(() => Session.validateResponse(receipts, 1), { code: "bad_answer" });
  assert.throws(() => Session.validateResponse(receipts, "no_recent"), { code: "bad_answer" });
  assert.equal(Session.validateResponse(receipts, "skip"), "skip");
  for (const type of ["bet", "reply", "others", "eyes"]) {
    const card = { type, exits: ["skip", "not_my_life"], options: [{ t: "a" }, { t: "b" }] };
    assert.equal(Session.validateResponse(card, 1), 1);
    assert.throws(() => Session.validateResponse(card, [0]), { code: "bad_answer" }, type);
    assert.throws(() => Session.validateResponse(card, 2), { code: "bad_answer" }, type);
  }
  const rank = { type: "rank", exits: ["skip", "not_my_life"], options: [{ t: "a" }, { t: "b" }, { t: "c" }, { t: "d" }] };
  assert.deepEqual(Session.validateResponse(rank, [2, 0, 3, 1]), [2, 0, 3, 1], "stored in rank order");
  for (const bad of [[0, 1, 2], [0, 0, 1, 2], [0, 1, 2, 4], 1, []]) assert.throws(() => Session.validateResponse(rank, bad), { code: "bad_answer" }, JSON.stringify(bad));
  assert.equal(Session.validateResponse(rank, "skip"), "skip");
  assert.deepEqual([...Session.LIGHT_TYPES].sort(), ["bet", "eyes", "role", "this_or_that"], "quick cards for the rushed rule");
  assert.deepEqual([...Session.SPREAD_TYPES], ["receipts", "bet"]);
});

test("a receipts card plays through the step machine: ticks, an exclusive None, per-tick weight, save and restore", () => {
  const card = KIT.chapters.flatMap((c) => c.cards).find((c) => c.type === "receipts");
  const s = reach(card.id);
  assert.ok(s, `${card.id} is served`);
  assert.throws(() => Session.answerCard(s, card.id, 0), { code: "bad_answer" }, "receipts take a list");
  const none = card.options.findIndex((o) => o.none);
  assert.throws(() => Session.answerCard(s, card.id, [0, none]), { code: "bad_answer" });
  const ticked = Session.answerCard(s, card.id, [2, 0], { ms: 5000 });
  assert.deepEqual(ticked.answers[card.id], [0, 2]);
  const ev = Object.values(Session.profileFor(ticked).tags).flatMap((t) => t.evidence).filter((e) => e.card === card.id);
  assert.ok(ev.length >= 2 && ev.every((e) => e.w === card.weight && e.grade === "did"), "each tick counts at the card weight as did evidence");
  const back = Session.restore(Session.serialize(ticked));
  assert.equal(Session.currentStep(back).card.id, Session.currentStep(ticked).card.id, "a restored run resumes on the same card");
  const nothing = Session.answerCard(s, card.id, [none], { ms: 5000 });
  assert.equal(Object.values(Session.profileFor(nothing).tags).flatMap((t) => t.evidence).filter((e) => e.card === card.id).length, 0);
  const bet = KIT.chapters.flatMap((c) => c.cards).find((c) => c.type === "bet");
  assert.equal(bet.grade, "did");
  assert.equal(bet.weight, 0.8);
});

test("rushed taps count at 0.3 and are logged for research", () => {
  const s = completeRun(ADULT, (card) => ({ ...firstOption(card), ms: 900 }), "rushrun01");
  const p = Session.profileFor(s);
  assert.ok(p.counts.rushed >= Session.RUN_SIZE - 2, `rushed ${p.counts.rushed}`);
  assert.equal(p.shownTags.filter((id) => p.tags[id].calmCards === 0).length, 0, "no tag fires from rushed taps alone");
});

// A player who gives one side no valid card and every other side its usual evidence: on a chapter card that carries
// the axis, it answers an option without it when the format allows one, and skips only when it cannot. (Skipping every
// card that touches the axis also starves any other axis those cards carry; since the 2026-09-29 bank revision some
// cards carry R1 and L1 together, so that player left two sides short and the extras rightly went to both.)
const SINGLE = ["scenario", "real", "others", "eyes", "role", "this_or_that", "bet", "reply", "feeling"];
function avoidAxis(axis) {
  return (card) => {
    if (card.id.startsWith("X-") || !(card.options || []).some((o) => o.axes && o.axes[axis])) return firstOption(card);
    const free = card.options.map((o, i) => ({ o, i })).filter(({ o }) => !(o.axes && o.axes[axis]) && !o.none && !o.circumstance && !o.depends).map(({ i }) => i);
    if (SINGLE.includes(card.type) && free.length) return { value: free[0] };
    if (card.type === "pick_two" && free.length >= 2) return { value: free.slice(0, 2) };
    if (card.type === "receipts" && free.length) return { value: [free[0]] };
    return card.exits.includes("skip") ? { value: "skip" } : firstOption(card);
  };
}

test("an unfinished side gets 1 or 2 extra cards for that side only, then Genii locks", () => {
  // One card per sub-question (M2) leaves some routes short on a second side too (then the extras rightly serve both),
  // so the first run id where R1 is the only short side at the bonus cards is used.
  let s = null;
  for (let k = 1; k < 40 && !s; k++) {
    const x = playUntil(started(ADULT, `extrarun${k}`), avoidAxis("R1"), (step) => step.kind === "card" && step.phase === "extra");
    const p = Session.profileFor(x);
    const at = Session.currentStep(x);
    if (at.kind === "card" && at.resolved <= Session.RUN_SIZE - 2 && p.axes.R1.cards === 0 && S.AXES.filter((a) => p.axes[a].unfinished).join() === "R1") s = x;
  }
  assert.ok(s, "a route reaches the bonus cards with only R1 short, no R1 card yet and two slots left");
  const step = Session.currentStep(s);
  assert.equal(step.card.axisFor, "R1");
  assert.equal(Session.profileFor(s).axes.R1.unfinished, true);
  const offered = [];
  s = playUntil(s, (card, st) => { if (st.phase === "extra") offered.push(card.id); return firstOption(card); }, (st) => st.kind === "lock" || (st.kind === "card" && st.phase === "finale"));
  assert.deepEqual([...offered].sort(), KIT.extras.filter((c) => c.axisFor === "R1").map((c) => c.id).sort(), "two extras when the side had no cards");
  assert.equal(Session.profileFor(s).axes.R1.unfinished, false);

  // A side with one valid card needs just one extra: the first R1 card served is answered on R1, the rest skipped.
  let keep = null;
  const onR1 = (card) => {
    const i = card.options.findIndex((o) => o.axes && o.axes.R1);
    const rest = card.options.map((_, k) => k).filter((k) => k !== i);
    return { value: card.type === "pick_two" ? [i, rest.find((k) => !card.options[k].none)] : card.type === "receipts" ? [i] : card.type === "rank" ? [i, ...rest] : i };
  };
  const keepOne = (card) => {
    if (card.id.startsWith("X-") || !card.options.some((o) => o.axes && o.axes.R1)) return firstOption(card);
    if (!keep || keep === card.id) { keep = card.id; return onR1(card); }
    return avoidAxis("R1")(card);
  };
  // The picker keeps its fixed run length, so only some routes reach the bonus cards with the side half done.
  let t = null;
  for (let k = 0; k < 40 && !t; k++) {
    keep = null;
    const x = playUntil(started(ADULT, `extraone${k}`), keepOne, (st) => st.kind !== "card" || st.phase !== "chapter");
    const st = Session.currentStep(x);
    const px = Session.profileFor(x);
    if (st.kind === "card" && st.phase === "extra" && st.resolved === Session.RUN_SIZE - 1 && px.axes.R1.cards === 1 && S.AXES.filter((a) => px.axes[a].unfinished).join() === "R1") t = x;
  }
  assert.ok(t, "a route reaches the bonus cards with one valid R1 card and no other short side");
  const offered2 = [];
  t = playUntil(t, (card, st) => { if (st.phase === "extra") offered2.push(card.id); return firstOption(card); }, (st) => st.kind === "lock");
  assert.equal(offered2.length, 1, `offered ${offered2}`);
  assert.equal(S.cardById[offered2[0]].axisFor, "R1");
  assert.equal(Session.profileFor(t).axes.R1.unfinished, false);

  // Skipping both extras leaves the side unfinished: Genii passes on it and the code shows "?".
  let u = playUntil(started(ADULT, "extrarun3"), (card) => (card.id.startsWith("X-") ? { value: "skip" } : avoidAxis("R1")(card)));
  const { profile } = Session.resultFor(u);
  assert.equal(profile.axes.R1.unfinished, true);
  const r1Finale = u.frozen.predictions.find((p) => p.primary === "R1");
  assert.equal(r1Finale.pass, true);
});

test("Genii locks its guesses once, before the finale, and a changed lock or answer refuses to score", () => {
  let s = playUntil(started(ADULT, "lockrun01"), firstOption, (step) => step.kind === "lock");
  assert.throws(() => Session.resultFor(s), { code: "not_complete" });
  const firstFinale = Session.finaleIds(s)[0];
  assert.throws(() => Session.answerCard(s, firstFinale, 0), { code: "out_of_order" }, "no finale before the lock");
  s = Session.lockGuesses(s, { now: clock() });
  assert.throws(() => Session.lockGuesses(s), { code: "already_locked" });
  assert.equal(s.lockHash, sha256Hex(canonicalJSON(s.frozen)));
  assert.equal(s.frozen.predictions.length, 8);
  const frozenBefore = canonicalJSON(s.frozen);
  const lastChapter = Object.keys(s.answers).filter((k) => !k.endsWith(".flip")).at(-1);
  assert.throws(() => Session.answerCard(s, lastChapter, 1), { code: "locked" });
  s = playUntil(s, (card) => ({ value: card.options.length - 1 }));
  assert.equal(canonicalJSON(s.frozen), frozenBefore, "finale answers never touch the guesses");
  const ok = Session.resultFor(s);
  assert.equal(ok.sealed.rows.length, 8);
  assert.equal(Session.verifyLock(s).ok, true);

  const guessChanged = structuredClone(s);
  const row = guessChanged.frozen.predictions.find((p) => !p.pass);
  row.predicted = (row.predicted + 1) % 3;
  assert.deepEqual(Session.verifyLock(guessChanged), { ok: false, reason: "guesses_changed" });
  assert.throws(() => Session.resultFor(guessChanged), { code: "tampered" });

  const answerChanged = structuredClone(s);
  // The last run card: changing its answer cannot change the route, so the run stays complete and only the lock objects.
  const last = Session.routeFor(s).at(-1);
  const id = last.id;
  const v = answerChanged.answers[id];
  const n = last.options.length;
  const real = (i) => !last.options[i].none;
  answerChanged.answers[id] = Array.isArray(v)
    ? (last.type === "rank" ? [...v].reverse() : last.type === "pick_two" ? [v[0], [...Array(n).keys()].find((i) => !v.includes(i))] : [[...Array(n).keys()].find((i) => real(i) && !v.includes(i))])
    : (v + 1) % n;
  assert.equal(Session.verifyLock(answerChanged).ok, false);
  assert.throws(() => Session.resultFor(answerChanged), { code: "tampered" });
});

test("sealed finale answers never become profile evidence", () => {
  const a = completeRun(ADULT, firstOption, "sealrun01");
  // Same run id, so the picker serves the same cards; only the finale answers differ.
  const b = playUntil(started(ADULT, "sealrun01"), (card, step) => (step.phase === "finale" ? { value: card.options.length - 1 } : firstOption(card)));
  assert.equal(canonicalJSON(Session.profileFor(a)), canonicalJSON(Session.profileFor(b)));
  assert.notDeepEqual(a.finale, b.finale);
});

test("save and restore: a round trip resumes on the same card; bad saves fail closed", () => {
  let mid = playUntil(started(ADULT, "saverun01"), firstOption, (step) => step.kind === "card" && step.card.chapter === 4 && step.index === 3);
  const back = restoreRun(Session.serialize(mid));
  assert.equal(Session.currentStep(back).card.id, Session.currentStep(mid).card.id);
  assert.deepEqual(back.answers, mid.answers);

  const done = completeRun(OTHER, firstOption, "saverun02");
  const again = restoreRun(Session.serialize(done));
  assert.equal(canonicalJSON(Session.resultFor(again).result), canonicalJSON(Session.resultFor(done).result));

  const raw = JSON.parse(Session.serialize(done));
  const bad = (mutate, code) => { const copy = structuredClone(raw); mutate(copy); assert.throws(() => restoreRun(JSON.stringify(copy)), (e) => (code ? e.code === code : true)); };
  assert.throws(() => restoreRun("{not json"), { code: "corrupt" });
  bad((d) => { d.schema = "genii.persona.run/0"; }, "schema");
  bad((d) => { d.kit = "persona-quiz-v1"; }, "kit_changed");
  bad((d) => { d.extra = 1; }, "corrupt");
  const offRoute = KIT.chapters.flatMap((c) => c.cards).find((c) => !(c.id in raw.answers) && c.type === "scenario").id;
  bad((d) => { d.answers[offRoute] = 0; }, "corrupt");
  bad((d) => { d.ms["C9-9"] = 5; }, "corrupt");
  bad((d) => { d.setup.age = "adult"; }, "corrupt");
  bad((d) => { d.lobby.ending = "funny"; }, "corrupt");
  bad((d) => { d.lobby.voice = "loud"; }, "corrupt");
  bad((d) => { d.lockHash = "0".repeat(64); }, "tampered");
  bad((d) => { d.frozen = null; }, "corrupt");
  bad((d) => { const k = Object.keys(d.answers)[3]; d.answers[k] = "no_such_exit"; });
  bad((d) => { d.frozen.predictions[0].predicted = (d.frozen.predictions[0].predicted + 1) % 4; }, "tampered");
  bad((d) => { d.finale = { [Session.finaleIds(done)[3]]: 0 }; }, "corrupt");
  bad((d) => { d.schema = "genii.persona.run/2"; }, "schema");
  assert.equal(KIT_ID.startsWith("persona-quiz-v2@"), true);
});

test("sealed pool: each run plays 8 finale cards drawn from the pool by its run id, locked with sha256", () => {
  const a = started(ADULT, "finale001"), b = started(ADULT, "finale001"), c = started(ADULT, "finale002");
  assert.deepEqual(Session.finaleIds(a), Session.finaleIds(b), "same run id, same finale");
  assert.equal(Session.finaleIds(a).length, Session.FINALE_SIZE);
  assert.equal(Session.FINALE_SIZE, Math.min(8, KIT.finale.length));
  for (const id of Session.finaleIds(a)) assert.equal(S.cardById[id].type, "sealed");
  const orders = new Set(["finale001", "finale002", "finale003", "finale004", "finale005", "finale006"].map((id) => Session.finaleIds(started(ADULT, id)).join()));
  assert.ok(orders.size > 1, "run ids draw different finales");
  assert.ok(Session.finaleIds(c).length === 8);
  // The step machine serves the drawn cards in draw order, and the lock covers exactly them.
  let s = playUntil(a, firstOption, (step) => step.kind === "card" && step.phase === "finale");
  assert.deepEqual(s.frozen.predictions.map((p) => p.id), Session.finaleIds(a));
  const served = [];
  s = playUntil(s, (card) => { served.push(card.id); return firstOption(card); });
  assert.deepEqual(served, [...Session.finaleIds(a)]);
  assert.equal(Session.resultFor(s).sealed.rows.length, 8);
  // A frozen set for a different draw refuses to score.
  const other = structuredClone(s);
  other.frozen.predictions.reverse();
  other.lockHash = sha256Hex(canonicalJSON(other.frozen));
  assert.deepEqual(Session.verifyLock(other), { ok: false, reason: "guesses_changed" });
});
