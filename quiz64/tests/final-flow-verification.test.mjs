import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import * as Session from "../src/dossier-session.js";
import { getBank } from "../src/question-bank-v2.js";
import { makeDossierFixture } from "../src/dossier-fixtures.js";

const ROUTES = ["everyday", "work_study", "social"];
const VOICES = ["gentle", "playful", "sharp"];

function clock(start = "2026-09-21T09:30:00.000Z") {
  const origin = Date.parse(start);
  let tick = 0;
  return () => new Date(origin + tick++ * 1000).toISOString();
}

function optionFor(bank, itemId) {
  const template = bank.templates.find((item) => item.itemId === itemId);
  assert.ok(template, `template ${itemId}`);
  return template.options?.[0]?.id || template.exits?.[0]?.id;
}

function answerRemaining(session, bank) {
  let next = session;
  while (next.phase !== Session.SESSION_PHASES.COMPLETE) {
    if (next.phase === Session.SESSION_PHASES.READY_TO_FREEZE) {
      next = Session.freezeSession(next);
      continue;
    }
    const question = Session.currentQuestion(next);
    assert.ok(question, `current question in ${next.phase}`);
    next = Session.answerQuestion(next, question.itemId, optionFor(bank, question.itemId));
  }
  return next;
}

test("interrupted profile restores and resumes across every route, voice, and personal setting", () => {
  for (const route of ROUTES) for (const voice of VOICES) for (const personal of [false, true]) {
    const label = `${route}/${voice}/${personal}`;
    const bank = getBank({ route, voice, personal });
    let session = Session.createSession({ route, voice, personal, clock: clock() });
    const cutoff = Math.max(1, Math.floor(bank.profileIds.length / 2));
    for (const itemId of bank.profileIds.slice(0, cutoff)) {
      session = Session.answerQuestion(session, itemId, optionFor(bank, itemId));
    }
    const currentBefore = Session.currentQuestion(session);
    const restored = Session.restoreSession(Session.serializeSession(session), { clock: clock("2026-09-21T09:40:00.000Z") });
    assert.equal(restored.phase, Session.SESSION_PHASES.PROFILE, label);
    assert.equal(Session.currentQuestion(restored).itemId, currentBefore.itemId, label);
    assert.deepEqual(restored.events, session.events, label);
    const complete = answerRemaining(restored, bank);
    assert.equal(complete.phase, Session.SESSION_PHASES.COMPLETE, label);
    assert.equal(complete.snapshot.scope.heldoutExcluded, true, label);
    assert.equal(complete.evaluation.heldoutEvents.length, complete.heldoutIds.length, label);
  }
});

test("Other remains private unscored text through freeze, restore, and result receipts", () => {
  const bank = getBank({ route: "everyday", voice: "gentle", personal: false });
  let session = Session.createSession({ route: "everyday", voice: "gentle", personal: false, clock: clock() });
  const firstId = session.profileIds[0];
  const firstTemplate = bank.templates.find((item) => item.itemId === firstId);
  const otherExit = firstTemplate.exits.find((exit) => exit.reason === "other_unscored");
  assert.ok(otherExit, "first profile question has an Other exit");
  session = Session.answerQuestion(session, firstId, otherExit.id, {
    otherText: "A private answer that must remain unscored.",
    note: "A separate context note.",
  });
  const otherEvent = session.events.find((event) => event.itemId === firstId);
  assert.equal(otherEvent.sourceStatus, "other_unscored");
  assert.deepEqual(otherEvent.predicates, []);
  assert.equal(otherEvent.missingness.reason, "other_unscored");
  assert.equal(otherEvent.privateFreeText, "A private answer that must remain unscored.");
  session = Session.restoreSession(Session.serializeSession(session), { clock: clock("2026-09-21T09:40:00.000Z") });
  assert.equal(session.responses[firstId].otherText, "A private answer that must remain unscored.");
  assert.equal(session.responses[firstId].note, "A separate context note.");
  session = answerRemaining(session, bank);
  const result = Session.getResult(session);
  const receipt = result.receipts.find((item) => item.itemId === firstId);
  assert.equal(receipt.missingness.reason, "other_unscored");
  assert.equal(receipt.privateFreeText, "A private answer that must remain unscored.");
  assert.equal(result.snapshot.evidenceEvents.some((event) => event.itemId === firstId), false);
  assert.equal(result.projection.axes.every((axis) => !axis.supportingEvidenceIds.includes(otherEvent.evidenceId)), true);
});

test("revision keeps prior reading and heldout evaluation separate while allowing profile edits", () => {
  const original = makeDossierFixture("complete", { route: "work_study", voice: "playful", personal: true });
  const priorSnapshotId = original.snapshot.snapshotId;
  const priorEvaluationId = original.evaluation.evaluationId;
  let child = Session.beginRevision(original, { clock: clock("2026-09-21T10:00:00.000Z") });
  assert.equal(child.phase, Session.SESSION_PHASES.READY_TO_FREEZE);
  assert.equal(child.priorExposure, true);
  assert.equal(child.revisionOfSnapshotId, priorSnapshotId);
  assert.equal(child.priorSnapshot.snapshotId, priorSnapshotId);
  assert.equal(child.priorEvaluation.evaluationId, priorEvaluationId);
  assert.equal(child.heldoutIds.some((id) => Object.hasOwn(child.responses, id)), false);
  const editedId = child.profileIds[0];
  const editedTemplate = getBank(child.config).templates.find((item) => item.itemId === editedId);
  child = Session.editProfileAnswer(child, editedId, editedTemplate.exits[0].id);
  assert.equal(child.phase, Session.SESSION_PHASES.READY_TO_FREEZE);
  child = answerRemaining(child, getBank(child.config));
  const result = Session.getResult(child);
  assert.equal(result.priorSnapshot.snapshotId, priorSnapshotId);
  assert.equal(result.priorEvaluation.evaluationId, priorEvaluationId);
  assert.notEqual(result.snapshot.snapshotId, priorSnapshotId);
  assert.equal(result.snapshot.evidenceEvents.some((event) => event.phase === "heldout"), false);
  assert.equal(result.evaluation.heldoutEvents.every((event) => event.phase === "heldout"), true);
});

test("frozen sessions from a changed wording manifest fail closed for explicit recovery", () => {
  const session = makeDossierFixture("complete", { route: "social", voice: "sharp", personal: true });
  const stale = JSON.parse(Session.serializeSession(session));
  stale.freeze.bankManifestBinding = "bank-manifest-v1-before-copy-edit";
  assert.throws(
    () => Session.restoreSession(stale, { clock: clock("2026-09-21T10:30:00.000Z") }),
    /manifest changed/i,
  );
});

test("result renders one interactive reveal and one scoring disclosure", async () => {
  const server = await createServer({
    root: fileURLToPath(new URL("../", import.meta.url)),
    server: { middlewareMode: true },
    appType: "custom",
  });
  globalThis.document = { hidden: false };
  try {
    const { PersonalityDossier } = await server.ssrLoadModule("/src/components/PersonalityDossier.jsx");
    const session = makeDossierFixture("complete", { route: "everyday", voice: "playful", personal: false });
    const result = Session.getResult(session);
    const html = renderToStaticMarkup(React.createElement(PersonalityDossier, { result, storageStatus: "preview" }));
    assert.equal((html.match(/class="guess-reveal"/g) || []).length, 1);
    assert.equal((html.match(/THE REVEAL/g) || []).length, 1);
    assert.equal((html.match(/How this round was scored/g) || []).length, 1);
    assert.equal((html.match(/Genii locked in/g) || []).length, 1);
    assert.doesNotMatch(html, /undefined|NaN|\[object Object\]/);
  } finally {
    delete globalThis.document;
    await server.close();
  }
});
