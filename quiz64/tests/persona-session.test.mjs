import test from "node:test";
import assert from "node:assert/strict";
import * as Session from "../src/persona/session.js";
import { S, KIT, KIT_ID } from "../src/persona/kit.js";
import { sha256Hex, canonicalJSON } from "../src/persona/sha256.js";
import { restoreRun } from "../src/persona/store.js";
import { ADULT, TEEN, clock, started, playUntil, firstOption, leaning, completeRun, reach, OPEN_LOBBY } from "./persona-helpers.mjs";
import crypto from "node:crypto";

const LOCKED18 = ["C3-8", "C3-9", "C6-9", "C6-11"];
const seenIds = (state) => Object.keys(state.answers).filter((k) => !k.endsWith(".flip"));

test("sha256 matches node:crypto on ascii, unicode and block-boundary inputs", () => {
  for (const text of ["", "abc", "Genii 🐸 你真的懂我嗎", "a".repeat(55), "b".repeat(56), "c".repeat(64), "d".repeat(1000)]) {
    assert.equal(sha256Hex(text), crypto.createHash("sha256").update(text, "utf8").digest("hex"));
  }
  assert.equal(canonicalJSON({ b: 1, a: [2, { d: 1, c: 2 }] }), canonicalJSON({ a: [2, { c: 2, d: 1 }], b: 1 }));
});

test("setup: an age band, a closest person and a pronoun; under 13 never starts a run", () => {
  const fresh = Session.newRun({ now: clock(), runId: "abcdefgh" });
  assert.deepEqual(Session.currentStep(fresh), { kind: "setup" });
  assert.throws(() => Session.startRun(fresh, { age: "under13", closest: "parent", pronoun: "he" }), { code: "under13" });
  assert.throws(() => Session.startRun(fresh, { age: "adult", closest: "boss", pronoun: "he" }), { code: "bad_setup" });
  assert.throws(() => Session.startRun(fresh, { ...ADULT, name: "free text" }), { code: "bad_setup" });
  const s = Session.startRun(fresh, ADULT);
  assert.throws(() => Session.startRun(s, TEEN), { code: "already_started" });
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

test("teen run: locked 18+ cards and marriage and kids tags never appear", () => {
  for (const choose of [firstOption, leaning({ R1: 1, R2: -1, R3: 1, L1: -1, L2: 1, L3: -1 }), leaning({ R1: -1, R2: 1, R3: -1, L1: 1, L2: -1, L3: 1 })]) {
    let s = started(TEEN, "teenrun01");
    const shown = [];
    s = playUntil(s, (card, step) => { shown.push(card.id); return choose(card, step); });
    for (const id of LOCKED18) assert.ok(!shown.includes(id), `${id} shown to a teen`);
    for (const id of shown) assert.ok(S.cardById[id].teen !== false, `${id} teen flag`);
    const { profile, result } = Session.resultFor(s);
    for (const id of Object.keys(profile.tags)) assert.ok(!/^T(11|21)/.test(id), `teen scored ${id}`);
    for (const t of result.tags) assert.ok(!/^T(11|21)/.test(t.id), `teen shown ${t.id}`);
    assert.ok(shown.filter((id) => !id.startsWith("X-") && S.cardById[id].type !== "sealed").length <= 57);
  }
  const teenPrompted = KIT.chapters.flatMap((c) => c.cards).filter((c) => c.teenPrompt && c.teen);
  assert.ok(teenPrompted.length > 0);
  for (const card of teenPrompted) assert.equal(S.promptFor(card, TEEN), card.teenPrompt);
});

test("C3-9 joins the pool only after a C3-8 pick that carries the kids-yes line", () => {
  const at = reach("C3-8");
  assert.ok(at, "some run serves C3-8");
  assert.ok(!Session.poolFor(at).some((c) => c.id === "C3-9"), "gated before C3-8 is answered");
  const pool = (picks) => Session.poolFor(Session.answerCard(at, "C3-8", picks, { ms: 3000, now: clock() })).map((c) => c.id);
  assert.ok(pool([0, 3]).includes("C3-9"));
  assert.ok(!pool([3, 4]).includes("C3-9"));
});

test("a feeling card joins the pool after a picked moment; after an exit it is left out", () => {
  const card = KIT.chapters.flatMap((c) => c.cards).find((c) => c.type === "feeling");
  const before = reach(card.follows);
  assert.ok(before, `some run serves ${card.follows}`);
  const at = (value) => {
    const s = Session.answerCard(before, card.follows, value, { ms: 3000, now: clock() });
    // Eligible after a picked moment; it plays next when the chapter still has a slot (see persona-picker tests).
    return Session.poolFor(s).some((c) => c.id === card.id);
  };
  assert.equal(at(0), true);
  assert.equal(at("skip"), false);
  assert.equal(at("no_recent"), false);
});

test("answers are validated per card: exits, pick two, depends follow-ups, order and timing", () => {
  let s = started(ADULT, "valrun001");
  const first = Session.currentStep(s).card;
  assert.throws(() => Session.answerCard(s, first.id, "no_recent"), { code: "bad_answer" }, "no_recent only on real cards");
  assert.throws(() => Session.answerCard(s, first.id, 99), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, first.id, 0, { ms: -5 }), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, "C7-10", 0), { code: "out_of_order" });
  const pickTwo = KIT.chapters.flatMap((c) => c.cards).find((c) => c.type === "pick_two" && c.teen);
  s = reach(pickTwo.id);
  assert.throws(() => Session.answerCard(s, pickTwo.id, [0]), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, pickTwo.id, [1, 1]), { code: "bad_answer" });
  assert.throws(() => Session.answerCard(s, pickTwo.id, 0), { code: "bad_answer" });
  const depends = KIT.chapters.flatMap((c) => c.cards).filter((c) => c.flip && c.teen).find((c) => reach(c.id));
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

test("rushed taps count at 0.3 and are logged for research", () => {
  const s = completeRun(ADULT, (card) => ({ ...firstOption(card), ms: 900 }), "rushrun01");
  const p = Session.profileFor(s);
  assert.ok(p.counts.rushed >= Session.RUN_SIZE - 2, `rushed ${p.counts.rushed}`);
  assert.equal(p.shownTags.filter((id) => p.tags[id].calmCards === 0).length, 0, "no tag fires from rushed taps alone");
});

function skipAxis(axis) {
  return (card) => ((card.options || []).some((o) => o.axes && o.axes[axis]) && card.exits.includes("skip") && !card.id.startsWith("X-") ? { value: "skip" } : firstOption(card));
}

test("an unfinished side gets 1 or 2 extra cards for that side only, then Genii locks", () => {
  let s = playUntil(started(ADULT, "extrarun1"), skipAxis("R1"), (step) => step.kind === "card" && step.phase === "extra");
  const step = Session.currentStep(s);
  assert.equal(step.card.axisFor, "R1");
  assert.equal(Session.profileFor(s).axes.R1.unfinished, true);
  const offered = [];
  s = playUntil(s, (card, st) => { if (st.phase === "extra") offered.push(card.id); return firstOption(card); }, (st) => st.kind === "lock" || (st.kind === "card" && st.phase === "finale"));
  assert.deepEqual(offered, KIT.extras.filter((c) => c.axisFor === "R1").map((c) => c.id), "two extras when the side had no cards");
  assert.equal(Session.profileFor(s).axes.R1.unfinished, false);

  // A side with one valid card needs just one extra.
  const r1Cards = S.runCards(ADULT).filter((c) => c.options.some((o) => o.axes && o.axes.R1));
  const keep = r1Cards[0].id;
  let t = playUntil(started(ADULT, "extrarun2"), (card) => (card.id === keep ? firstOption(card) : skipAxis("R1")(card)), (st) => st.kind === "card" && st.phase === "extra");
  const offered2 = [];
  t = playUntil(t, (card, st) => { if (st.phase === "extra") offered2.push(card.id); return firstOption(card); }, (st) => st.kind === "lock");
  assert.equal(offered2.length, 1);

  // Skipping both extras leaves the side unfinished: Genii passes on it and the code shows "?".
  let u = playUntil(started(ADULT, "extrarun3"), (card) => (card.id.startsWith("X-") ? { value: "skip" } : skipAxis("R1")(card)));
  const { profile } = Session.resultFor(u);
  assert.equal(profile.axes.R1.unfinished, true);
  const r1Finale = u.frozen.predictions.find((p) => p.primary === "R1");
  assert.equal(r1Finale.pass, true);
});

test("Genii locks its guesses once, before the finale, and a changed lock or answer refuses to score", () => {
  let s = playUntil(started(ADULT, "lockrun01"), firstOption, (step) => step.kind === "lock");
  assert.throws(() => Session.resultFor(s), { code: "not_complete" });
  const firstFinale = KIT.finale[0].id;
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
  const id = Object.keys(answerChanged.answers).find((k) => Number.isInteger(answerChanged.answers[k]) && S.cardById[k].options.length > 2 && S.cardById[k].type === "scenario");
  answerChanged.answers[id] = (answerChanged.answers[id] + 1) % 3;
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

  const done = completeRun(TEEN, firstOption, "saverun02");
  const again = restoreRun(Session.serialize(done));
  assert.equal(canonicalJSON(Session.resultFor(again).result), canonicalJSON(Session.resultFor(done).result));

  const raw = JSON.parse(Session.serialize(done));
  const bad = (mutate, code) => { const copy = structuredClone(raw); mutate(copy); assert.throws(() => restoreRun(JSON.stringify(copy)), (e) => (code ? e.code === code : true)); };
  assert.throws(() => restoreRun("{not json"), { code: "corrupt" });
  bad((d) => { d.schema = "genii.persona.run/0"; }, "schema");
  bad((d) => { d.kit = "persona-quiz-v1"; }, "kit_changed");
  bad((d) => { d.extra = 1; }, "corrupt");
  bad((d) => { d.answers["C3-8"] = [0, 1]; }, "corrupt");
  bad((d) => { d.ms["C9-9"] = 5; }, "corrupt");
  bad((d) => { d.setup.age = "under13"; }, "corrupt");
  bad((d) => { d.lockHash = "0".repeat(64); }, "tampered");
  bad((d) => { d.frozen = null; }, "corrupt");
  bad((d) => { const k = Object.keys(d.answers)[3]; d.answers[k] = "no_such_exit"; });
  bad((d) => { d.frozen.predictions[0].predicted = (d.frozen.predictions[0].predicted + 1) % 4; }, "tampered");
  bad((d) => { d.finale = { [KIT.finale[3].id]: 0 }; }, "corrupt");
  assert.equal(KIT_ID.startsWith("persona-quiz-v2@"), true);
});
