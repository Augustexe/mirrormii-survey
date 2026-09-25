import test from "node:test";
import assert from "node:assert/strict";
import {
  compileResponse,
  createFreezeCommitment,
  createHeldoutEvaluation,
  createProfileSnapshot,
  projectProductAxes,
} from "../src/evidence-framework.js";
import {
  QUESTION_BANK_MANIFEST_V1,
  QUESTION_PRESENTATION_V1,
  QUESTION_SECTIONS_V1,
  QUESTION_TEMPLATES_V1,
  RESULT_DISPLAY_V1,
  questionEligibilityV1,
  questionTemplateV1,
  questionsForSectionV1,
  routeQuestionBankV1,
} from "../src/question-bank-v1.js";

const PROFILE_IDS = Array.from({ length: 18 }, (_, index) => `GQB1-${String(index + 1).padStart(3, "0")}`);
const HELDOUT_IDS = Array.from({ length: 5 }, (_, index) => `GQB1-${String(index + 19).padStart(3, "0")}`);
const AXIS_IDS = [
  "activation_tempo",
  "social_signal_style",
  "friction_posture",
  "structure_reliance",
  "novelty_aperture",
];

function answer(template, value = template.options[0].id, capturedAt = "2026-09-21T03:30:00Z") {
  return compileResponse(template, {
    attemptId: "bank-v1-attempt",
    capturedAt,
    value,
  });
}

test("base bank has 18 profile inputs, five heldouts and complete section metadata", () => {
  assert.equal(QUESTION_TEMPLATES_V1.length, 23);
  assert.deepEqual(QUESTION_TEMPLATES_V1.filter((item) => item.event.phase === "profile").map((item) => item.itemId), PROFILE_IDS);
  assert.deepEqual(QUESTION_TEMPLATES_V1.filter((item) => item.event.phase === "heldout").map((item) => item.itemId), HELDOUT_IDS);
  assert.equal(QUESTION_PRESENTATION_V1.length, QUESTION_TEMPLATES_V1.length);
  assert.equal(QUESTION_SECTIONS_V1.length, 6);
  for (const section of QUESTION_SECTIONS_V1) {
    assert.ok(questionsForSectionV1(section.id).length > 0, `${section.id} must contain questions`);
  }
  assert.equal(QUESTION_BANK_MANIFEST_V1.publicAxisIds.length, 0);
  assert.equal(QUESTION_BANK_MANIFEST_V1.publicClaimTemplateIds.length, 0);
});

test("permission lobby controls experience but emits no personality predicates", () => {
  for (const itemId of ["GQB1-001", "GQB1-002", "GQB1-003"]) {
    const template = questionTemplateV1(itemId);
    const event = answer(template);
    assert.deepEqual(event.predicates, []);
    assert.deepEqual(event.eligibleAxes, []);
  }
  const topicTemplate = questionTemplateV1("GQB1-003");
  const topicEvent = answer(topicTemplate, ["friends", "private_thoughts"]);
  assert.deepEqual(topicEvent.optionIds, ["friends", "private_thoughts"]);
  assert.deepEqual(topicEvent.predicates, []);
});

test("projective prompts preserve disclosure kind and cannot become evidence that fantasy became action", () => {
  for (const itemId of ["GQB1-008", "GQB1-009", "GQB1-011"]) {
    const template = questionTemplateV1(itemId);
    assert.equal(template.event.kind, "projective_prompt");
    assert.ok(template.event.claimLimits.some((limit) => /not evidence.*acted|not evidence.*will act/i.test(limit)));
    assert.ok(template.event.notEvidenceFor.includes("likelihood of acting on a fantasy"));
    assert.ok(template.options.every((option) => option.predicates.some((predicate) => ["reported_fantasy", "reported_temptation", "reported_desire"].includes(predicate.kind))));
  }
  assert.deepEqual(questionTemplateV1("GQB1-008").eligibleAxes, []);
  assert.deepEqual(questionTemplateV1("GQB1-011").eligibleAxes, []);
  const dessert = questionTemplateV1("GQB1-009");
  assert.deepEqual(dessert.eligibleAxes, ["novelty_aperture"]);
  assert.ok(dessert.options.flatMap((option) => option.predicates).filter((predicate) => predicate.axisId).every((predicate) => /low-stakes hypothetical/i.test(predicate.claimText)));
});

test("topic permission and disclosure preference mechanically gate sensitive prompts", () => {
  const surfaceAnswers = { "GQB1-002": "surface", "GQB1-003": ["private_thoughts", "friends"] };
  for (const itemId of ["GQB1-008", "GQB1-009", "GQB1-011"]) {
    assert.deepEqual(questionEligibilityV1(itemId, surfaceAnswers), { eligible: false, reason: "disclosure_mode_blocked" });
  }
  const noPrivatePermission = { "GQB1-002": "hybrid", "GQB1-003": ["friends"] };
  assert.equal(questionEligibilityV1("GQB1-008", noPrivatePermission).eligible, false);
  const openAnswers = { "GQB1-002": "hybrid", "GQB1-003": ["friends", "work_school", "private_thoughts"] };
  const routedIds = routeQuestionBankV1(openAnswers).map((item) => item.itemId);
  assert.ok(routedIds.includes("GQB1-008"));
  assert.ok(routedIds.indexOf("GQB1-010") < routedIds.indexOf("GQB1-009"));
  assert.ok(routedIds.indexOf("GQB1-011") < routedIds.indexOf("GQB1-008"));
});

test("axis mappings use reviewed directional categories and cover every axis repeatedly", () => {
  const profileAxisEvents = new Map(AXIS_IDS.map((axisId) => [axisId, new Set()]));
  const heldoutAxisEvents = new Map(AXIS_IDS.map((axisId) => [axisId, new Set()]));
  for (const template of QUESTION_TEMPLATES_V1) {
    for (const option of template.options) {
      for (const predicate of option.predicates) {
        if (!predicate.axisId) continue;
        assert.match(predicate.value.directionalClass, /^(left|right)_(slight|moderate|strong)$/);
        assert.ok([0.35, 0.7, 1].includes(predicate.strength));
        assert.match(predicate.claimLimits.join(" "), /not a personality percentage or equal-interval scale/i);
        const target = template.event.phase === "heldout" ? heldoutAxisEvents : profileAxisEvents;
        target.get(predicate.axisId).add(template.event.id);
      }
    }
  }
  for (const axisId of AXIS_IDS) {
    assert.ok(profileAxisEvents.get(axisId).size >= 3, `${axisId} needs at least three independent profile events`);
    assert.ok(heldoutAxisEvents.get(axisId).size >= 1, `${axisId} needs a heldout check`);
  }
});

test("every option compiles into an exact receipt and every ordinary profile item has a visible exit", () => {
  for (const template of QUESTION_TEMPLATES_V1) {
    for (const option of template.options) {
      const event = answer(template, template.responseFormat === "multi_choice" ? [option.id] : option.id);
      assert.equal(event.itemId, template.itemId);
      assert.equal(event.answerTextSnapshot, option.text);
      assert.equal(event.literalObservation, option.neutralMeaning);
    }
    if (template.event.phase === "profile") assert.ok(template.exits.length > 0, `${template.itemId} needs an exit`);
  }
});

test("complete profile freezes before heldout exposure and yields all five product projections", () => {
  const profileTemplates = QUESTION_TEMPLATES_V1.filter((item) => item.event.phase === "profile");
  const heldoutTemplates = QUESTION_TEMPLATES_V1.filter((item) => item.event.phase === "heldout");
  const profileEvents = profileTemplates.map((template) => answer(template));
  const entries = heldoutTemplates.map((template) => ({ itemId: template.itemId, optionId: template.options[0].id }));
  const freeze = createFreezeCommitment({
    attemptId: "bank-v1-attempt",
    sealedAt: "2026-09-21T03:31:00Z",
    bankManifest: QUESTION_BANK_MANIFEST_V1,
    profileEvents,
    predictionCommitment: { id: "bank-v1-predictions", entries },
    baselineCommitment: { id: "bank-v1-baseline", entries: heldoutTemplates.map((template) => ({ itemId: template.itemId, abstain: true })) },
  });
  const snapshot = createProfileSnapshot({
    snapshotId: "bank-v1-snapshot",
    events: profileEvents,
    claims: [],
    bankManifest: QUESTION_BANK_MANIFEST_V1,
    freeze,
  });
  const projection = projectProductAxes(snapshot);
  assert.deepEqual(projection.axes.map((axis) => axis.axisId), AXIS_IDS);
  assert.ok(projection.axes.every((axis) => axis.answeredSourceUnits >= 3));

  const heldoutEvents = heldoutTemplates.map((template) => answer(template, template.options[0].id, "2026-09-21T03:32:00Z"));
  const evaluation = createHeldoutEvaluation(snapshot, heldoutEvents, {
    bankManifest: QUESTION_BANK_MANIFEST_V1,
    exposedAt: "2026-09-21T03:32:00Z",
  });
  assert.deepEqual(evaluation.heldoutEvents.map((event) => event.itemId), HELDOUT_IDS);
  assert.equal(snapshot.evidenceEvents.some((event) => HELDOUT_IDS.includes(event.itemId)), false);
});

test("result display separates patterns, inner reports, receipts, unknowns, prediction and correction", () => {
  assert.deepEqual(RESULT_DISPLAY_V1.respondentOrder.map((section) => section.id), [
    "identity",
    "patterns",
    "inside_outside",
    "receipts",
    "unknowns",
    "prediction",
    "correction",
  ]);
  const insideOutside = RESULT_DISPLAY_V1.respondentOrder.find((section) => section.id === "inside_outside");
  assert.deepEqual(insideOutside.content, ["reported_actions", "reported_emotions", "reported_fantasies", "reported_temptations", "reported_desires"]);
  assert.match(insideOutside.rule, /never present one as another/i);
  assert.equal(RESULT_DISPLAY_V1.shareSafeDefault, "disabled_until_public_allowlists_are_approved");
  const prediction = RESULT_DISPLAY_V1.respondentOrder.find((section) => section.id === "prediction");
  assert.match(prediction.rule, /exploratory/i);
});
