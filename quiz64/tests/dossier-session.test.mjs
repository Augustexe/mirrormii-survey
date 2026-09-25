import test from "node:test";
import assert from "node:assert/strict";
import {
  DOSSIER_SESSION_VERSION,
  SESSION_PHASES,
  addCorrection,
  answerQuestion,
  beginRevision,
  createSession,
  currentQuestion,
  editProfileAnswer,
  freezeSession,
  getResult,
  restoreSession,
  serializeSession,
} from "../src/dossier-session.js";
import { getBank } from "../src/question-bank-v2.js";

function clock() {
  let tick = 0;
  return () => new Date(Date.UTC(2026, 8, 21, 7, 20, 33 + tick++)).toISOString();
}

function authoredValue(template) {
  return template.options?.[0]?.id || template.exits?.[0]?.id || "skip";
}

function answerProfile(session, bank) {
  for (const itemId of bank.profileIds) {
    const template = bank.templates.find((item) => item.itemId === itemId);
    session = answerQuestion(session, itemId, authoredValue(template));
  }
  return session;
}

function answerHeldout(session, bank) {
  for (const itemId of bank.heldoutIds) {
    const template = bank.templates.find((item) => item.itemId === itemId);
    session = answerQuestion(session, itemId, authoredValue(template));
  }
  return session;
}

test("all route, voice and personal combinations use the v2 bank contract", () => {
  for (const route of ["everyday", "work_study", "social"]) {
    for (const voice of ["gentle", "playful", "sharp"]) {
      for (const personal of [false, true]) {
        const bank = getBank({ route, voice, personal });
        const session = createSession({ route, voice, personal, clock: clock() });
        assert.equal(session.schemaVersion, DOSSIER_SESSION_VERSION);
        assert.deepEqual(session.config, { route, voice, personal });
        assert.deepEqual(session.profileIds, bank.profileIds);
        assert.deepEqual(session.heldoutIds, bank.heldoutIds);
        assert.equal(session.phase, SESSION_PHASES.PROFILE);
      }
    }
  }
});

test("skip and interrupted restore preserve answer records and repeated exposure labels", () => {
  let session = createSession({ route: "everyday", voice: "gentle", clock: clock() });
  const bank = getBank(session.config);
  const first = currentQuestion(session);
  assert.equal(first.itemId, session.profileIds[0]);
  const again = currentQuestion(session);
  assert.equal(again.itemId, first.itemId);
  assert.equal(again.exposureCount, 0);
  assert.deepEqual(again.exposureLabels, first.exposureLabels);
  session = answerQuestion(session, first.itemId, first.template.exits?.[0]?.id || authoredValue(first.template));
  const restored = restoreSession(serializeSession(session), { clock: clock() });
  assert.equal(restored.phase, SESSION_PHASES.PROFILE);
  assert.equal(restored.answers[first.itemId].value, session.answers[first.itemId].value);
  assert.deepEqual(restored.events, session.events);
  assert.equal(currentQuestion(restored).itemId, session.profileIds[1]);
});

test("freeze commits profile evidence before heldout exposure and keeps heldout out of the profile snapshot", () => {
  let session = createSession({ route: "work_study", voice: "playful", personal: true, clock: clock() });
  const bank = getBank(session.config);
  session = answerProfile(session, bank);
  assert.equal(session.phase, SESSION_PHASES.READY_TO_FREEZE);
  session = freezeSession(session);
  assert.equal(session.phase, SESSION_PHASES.HELDOUT);
  assert.ok(session.snapshot);
  assert.equal(session.snapshot.scope.heldoutExcluded, true);
  assert.equal(session.snapshot.evidenceEvents.some((event) => event.phase === "heldout"), false);
  assert.equal(session.snapshot.freeze.heldoutExposureAt, null);
  const question = currentQuestion(session);
  assert.ok(question && !session.exposedAt);
  session = answerHeldout(session, bank);
  assert.ok(session.exposedAt);
  assert.equal(session.phase, SESSION_PHASES.COMPLETE);
  assert.ok(session.evaluation);
  const result = getResult(session);
  assert.equal(result.heldoutStats.trials.length, session.heldoutIds.length);
  assert.equal(result.heldoutStats.answered, session.heldoutIds.length);
  assert.equal(result.heldoutStats.predicted + result.heldoutStats.abstentions, result.heldoutStats.answered);
  assert.equal(session.evaluation.heldoutEvents.length, session.heldoutIds.length);
  assert.equal(session.snapshot.evidenceEvents.some((event) => event.phase === "heldout"), false);
});

test("result receipts retain exact question and answer text while share-safe results omit heldout internals", () => {
  let session = createSession({ route: "everyday", voice: "gentle", clock: clock() });
  const bank = getBank(session.config);
  const missingId = session.profileIds[0];
  const missingTemplate = bank.templates.find((template) => template.itemId === missingId);
  session = answerQuestion(session, missingId, missingTemplate.exits[0].id);
  for (const itemId of bank.profileIds.slice(1)) {
    const template = bank.templates.find((item) => item.itemId === itemId);
    session = answerQuestion(session, itemId, authoredValue(template));
  }
  session = freezeSession(session);
  session = answerHeldout(session, bank);

  const result = getResult(session);
  const missingReceipt = result.receipts.find((receipt) => receipt.itemId === missingId);
  assert.equal(missingReceipt.questionText, session.presentation[missingId].prompt);
  assert.equal(missingReceipt.answerTextSnapshot, missingTemplate.exits[0].text);
  assert.equal(missingReceipt.missingness.reason, missingTemplate.exits[0].reason);
  const answeredId = session.profileIds.find((itemId) => itemId !== missingId);
  const answeredReceipt = result.receipts.find((receipt) => receipt.itemId === answeredId);
  const answeredTemplate = bank.templates.find((template) => template.itemId === answeredId);
  assert.equal(answeredReceipt.questionText, session.presentation[answeredId].prompt);
  assert.equal(answeredReceipt.answerTextSnapshot, answeredTemplate.options[0].text);

  const share = getResult(session, { view: "share_safe" });
  assert.equal(Object.hasOwn(share, "snapshot"), false);
  assert.equal(Object.hasOwn(share, "evaluation"), false);
  assert.equal(Object.hasOwn(share, "heldoutStats"), false);
  assert.equal(Object.hasOwn(share, "predictionCommitment"), false);
  assert.equal(Object.hasOwn(share, "priorSnapshot"), false);
});

test("heldout answers are single-use and restore rejects impossible phase timing", () => {
  let session = createSession({ route: "work_study", voice: "playful", clock: clock() });
  const bank = getBank(session.config);
  session = answerProfile(session, bank);
  session = freezeSession(session);
  const heldoutId = session.heldoutIds[0];
  const heldoutTemplate = bank.templates.find((template) => template.itemId === heldoutId);
  const answered = answerQuestion(session, heldoutId, authoredValue(heldoutTemplate));
  assert.throws(() => answerQuestion(answered, heldoutId, authoredValue(heldoutTemplate)), /already answered/i);

  const frozen = JSON.parse(serializeSession(session));
  frozen.phase = SESSION_PHASES.READY_TO_FREEZE;
  assert.throws(() => restoreSession(frozen, { clock: clock() }), /frozen|stage/i);

  const exposedWithoutAnswer = JSON.parse(serializeSession(session));
  exposedWithoutAnswer.exposedAt = "2026-09-21T07:20:40.000Z";
  assert.throws(() => restoreSession(exposedWithoutAnswer, { clock: clock() }), /exposure timing|inconsistent/i);

  const completeWithoutEvaluation = JSON.parse(serializeSession(answerHeldout(session, bank)));
  delete completeWithoutEvaluation.evaluation;
  assert.throws(() => restoreSession(completeWithoutEvaluation, { clock: clock() }), /complete|evaluation|heldout/i);
});

test("answer and freeze timestamps cannot precede session creation", () => {
  const createdAt = "2026-09-21T07:20:33.000Z";
  let session = createSession({ route: "social", voice: "sharp", now: createdAt });
  const bank = getBank(session.config);
  const first = bank.templates.find((template) => template.itemId === session.profileIds[0]);
  assert.throws(() => answerQuestion(session, first.itemId, authoredValue(first), { capturedAt: "2026-09-21T07:20:32.000Z" }), /precede session/i);
  session = answerProfile(session, bank);
  assert.throws(() => freezeSession(session, { sealedAt: "2026-09-21T07:20:32.000Z" }), /precede session/i);
});

test("restore rejects stale, incomplete and tampered frozen state", () => {
  let session = createSession({ route: "social", voice: "sharp", clock: clock() });
  const bank = getBank(session.config);
  session = answerProfile(session, bank);
  session = freezeSession(session);
  const raw = JSON.parse(serializeSession(session));
  raw.events[0].optionIds = ["tampered"];
  assert.throws(() => restoreSession(raw, { clock: clock() }), /integrity|mapping|option/i);
  const wrongResponseKey = JSON.parse(serializeSession(session));
  const firstResponse = wrongResponseKey.responses[wrongResponseKey.profileIds[0]];
  delete wrongResponseKey.responses[wrongResponseKey.profileIds[0]];
  wrongResponseKey.responses.wrong_item_key = firstResponse;
  assert.throws(() => restoreSession(wrongResponseKey, { clock: clock() }), /key|item ID/i);
  const incomplete = JSON.parse(serializeSession(session));
  delete incomplete.snapshot;
  assert.throws(() => restoreSession(incomplete, { clock: clock() }), /required profile stages|snapshot/i);
  const stale = JSON.parse(serializeSession(session));
  stale.bankVersion = "stale-bank";
  assert.throws(() => restoreSession(stale, { clock: clock() }), /stale|version/i);
});

test("corrections are immutable overlays and profile edits create a child attempt", () => {
  let session = createSession({ route: "everyday", voice: "gentle", clock: clock() });
  const bank = getBank(session.config);
  session = answerProfile(session, bank);
  session = freezeSession(session);
  const firstClaim = session.snapshot.claims[0];
  if (firstClaim) {
    const before = session;
    const beforeCorrections = before.corrections;
    session = addCorrection(before, firstClaim.id, "partly_accurate", "A little too neat.");
    assert.notEqual(session, before);
    assert.deepEqual(before.corrections, beforeCorrections);
    assert.equal(session.corrections[0].snapshotId, session.snapshot.snapshotId);
    assert.equal(session.snapshot.claims.some((claim) => claim.id === firstClaim.id), true);
    const forged = JSON.parse(serializeSession(session));
    forged.corrections[0].evidenceSnapshotIds = ["forged-snapshot"];
    assert.throws(() => restoreSession(forged, { clock: clock() }), /correction|integrity/i);
  }
  session = answerHeldout(session, bank);
  assert.equal(getResult(session).corrections.length, firstClaim ? 1 : 0);
  let child = beginRevision(session, { clock: clock() });
  assert.notEqual(child.attemptId, session.attemptId);
  assert.equal(child.revisionOfSnapshotId, session.snapshot.snapshotId);
  assert.equal(child.phase, SESSION_PHASES.READY_TO_FREEZE);
  const editedId = child.profileIds[0];
  const editedTemplate = bank.templates.find((item) => item.itemId === editedId);
  const edited = editProfileAnswer(child, editedId, authoredValue(editedTemplate));
  assert.notEqual(edited, child);
  child = edited;
  assert.equal(child.snapshot, null);
  assert.equal(child.phase, SESSION_PHASES.READY_TO_FREEZE);
  assert.equal(session.snapshot.snapshotId !== child.revisionOfSnapshotId, false);
});
