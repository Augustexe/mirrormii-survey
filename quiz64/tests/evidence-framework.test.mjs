import test from "node:test";
import assert from "node:assert/strict";
import {
  EVIDENCE_FRAMEWORK_VERSION,
  PROJECTION_VERSION,
  PRODUCT_AXES,
  adaptObservationRows,
  canCompareProjections,
  createBankManifest,
  compileResponse,
  createAuditedClaim,
  createCorrectionRecord,
  createFreezeCommitment,
  createHeldoutEvaluation,
  createProfileSnapshot,
  createResultCard,
  defineQuestionTemplate,
  projectProductAxes,
} from "../src/evidence-framework.js";

const RIGHT_CLAIM = "In the selected situation, the response leaned toward moving and testing.";
const templatesByBinding = new Map();

function rememberTemplate(question) {
  templatesByBinding.set(question.templateBinding, question);
  return question;
}

function template({
  itemId,
  eventId = itemId,
  sourceStatus = "hypothetical_choice",
  responseFormat = "single_choice",
  axisId = "activation_tempo",
  exits = [],
  semanticVersion = "semantic-v1",
  adapterVersion = "adapter-v1",
}) {
  return rememberTemplate(defineQuestionTemplate({
    itemId,
    surveyVersion: "survey-v1",
    bankVersion: "bank-v1",
    semanticVersion,
    wordingVersion: "wording-v1",
    mappingVersion: "mapping-v1",
    adapterVersion,
    responseFormat,
    construct: axisId,
    prompt: `Prompt for ${itemId}`,
    eligibleAxes: [axisId],
    contextSchema: {
      audience: ["private", "public"],
      setting: ["a", "b", "c"],
    },
    projectionContextKeys: ["audience", "setting"],
    event: {
      id: eventId,
      kind: sourceStatus === "retrospective_self_report" ? "actual_event" : "scenario",
      sourceStatus,
      claimLimits: ["Bounded to the selected situation."],
      notEvidenceFor: ["formal personality score"],
    },
    options: [
      {
        id: "L",
        text: "Pause and prepare",
        predicates: [{ id: `${itemId}:left`, construct: axisId, value: "left", claimText: "In the selected situation, the response leaned toward pausing and preparing.", claimTemplateId: "bounded-behavior-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId, direction: "left" }],
      },
      {
        id: "R",
        text: "Move and test",
        predicates: [{ id: `${itemId}:right`, construct: axisId, value: "right", claimText: "In the selected situation, the response leaned toward moving and testing.", claimTemplateId: "bounded-behavior-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId, direction: "right" }],
      },
    ],
    exits,
  }));
}

function answer(question, value, overrides = {}) {
  return compileResponse(question, {
    attemptId: "attempt-1",
    capturedAt: "2026-09-21T00:00:00Z",
    value,
    surveyVersion: "survey-v1",
    mappingVersion: "mapping-v1",
    ...overrides,
  });
}

function snapshotFor(events, snapshotId = "snapshot-1", claims = [], options = {}) {
  const templates = [...new Map([
    ...events.map((event) => [event.templateBinding, templatesByBinding.get(event.templateBinding)]),
    ...(options.extraTemplates || []).map((question) => [question.templateBinding, question]),
  ]).values()].filter(Boolean);
  const bankManifest = createBankManifest(templates, {
    publicAxisIds: options.publicAxisIds || [],
    publicClaimTemplateIds: options.publicClaimTemplateIds || [],
  });
  const heldoutEntries = Object.entries(bankManifest.items)
    .filter(([, item]) => item.phase === "heldout")
    .map(([itemId]) => ({ itemId, abstain: true }));
  const freeze = createFreezeCommitment({
    attemptId: "attempt-1",
    sealedAt: options.sealedAt || "2026-09-21T00:00:00Z",
    bankManifest,
    profileEvents: events,
    predictionCommitment: { id: "predictions-v1", entries: heldoutEntries },
    baselineCommitment: { id: "baseline-v1", entries: heldoutEntries },
  });
  return createProfileSnapshot({ snapshotId, events, claims, bankManifest, freeze });
}

function projection(events, snapshotId = "snapshot-1") {
  return projectProductAxes(snapshotFor(events, snapshotId));
}

function auditedClaim(input) {
  const events = input.events || [];
  return createAuditedClaim({
    ...input,
    events: undefined,
    evidenceIds: input.evidenceIds || events.map((event) => event.evidenceId),
    supportedPredicateIds: input.supportedPredicateIds || events.flatMap((event) => event.predicates.map((predicate) => predicate.id)),
    claimTemplateId: input.claimTemplateId || "bounded-behavior-v1",
    inferenceKeys: input.inferenceKeys || ["bounded_behavior"],
    scopeId: input.scopeId || "selected_situation",
    auditVerdict: "pass",
    audit: {
      reviewer: "deterministic_clause_audit",
      checkedClaimLimits: true,
      checkedProhibitedInferences: true,
    },
  });
}

test("single choice, Likert, and ranked adapters compile into one stable EvidenceEvent contract", () => {
  const single = template({ itemId: "single" });
  const likert = template({ itemId: "likert", responseFormat: "likert" });
  const ranked = rememberTemplate(defineQuestionTemplate({
    itemId: "rank",
    surveyVersion: "survey-v1",
    bankVersion: "bank-v1",
    semanticVersion: "semantic-v1",
    wordingVersion: "wording-v1",
    mappingVersion: "mapping-v1",
    adapterVersion: "adapter-v1",
    responseFormat: "rank",
    rankWeights: [1, 0.5],
    construct: "activation_tempo",
    prompt: "Rank the responses",
    eligibleAxes: ["activation_tempo"],
    event: { id: "rank-event", sourceStatus: "stated_preference" },
    options: [
      { id: "R", text: "Move", predicates: [{ id: "rank:right", construct: "activation_tempo", claimText: "The ranking put moving first.", claimTemplateId: "ranked-tempo-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId: "activation_tempo", direction: "right", strength: 1 }] },
      { id: "L", text: "Pause", predicates: [{ id: "rank:left", construct: "activation_tempo", claimText: "The ranking included pausing.", claimTemplateId: "ranked-tempo-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId: "activation_tempo", direction: "left", strength: 0.5 }] },
    ],
  }));
  const events = [answer(single, "R"), answer(likert, "L"), answer(ranked, ["R", "L"])];
  assert.ok(events.every((event) => event.schemaVersion === EVIDENCE_FRAMEWORK_VERSION));
  assert.deepEqual(events.map((event) => event.responseFormat), ["single_choice", "likert", "rank"]);
  assert.ok(events.every((event) => event.predicates.some((predicate) => predicate.axisId === "activation_tempo")));
  assert.deepEqual(events[2].predicates.map((predicate) => predicate.responseRank), [1, 2]);
  assert.throws(() => defineQuestionTemplate({
    itemId: "bad-axis-map",
    surveyVersion: "survey-v1",
    bankVersion: "bank-v1",
    semanticVersion: "v1",
    wordingVersion: "v1",
    mappingVersion: "mapping-v1",
    adapterVersion: "v1",
    responseFormat: "single_choice",
    eligibleAxes: [],
    event: { id: "bad-event", sourceStatus: "hypothetical_choice" },
    options: [{
      id: "R",
      text: "Move",
      predicates: [{ id: "bad:right", construct: "tempo", claimText: "Moved.", claimTemplateId: "bad-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId: "activation_tempo", direction: "right" }],
    }],
  }), /not eligible/);
});

test("authored context is compiled, immutable and revalidated on restored events", () => {
  const question = rememberTemplate(defineQuestionTemplate({
    itemId: "authored-context",
    surveyVersion: "survey-v1",
    bankVersion: "bank-v1",
    semanticVersion: "semantic-v1",
    wordingVersion: "wording-v1",
    mappingVersion: "mapping-v1",
    adapterVersion: "adapter-v1",
    responseFormat: "single_choice",
    eligibleAxes: ["activation_tempo"],
    contextSchema: { setting: ["work", "social"], stakes: ["low", "high"] },
    authoredContext: { setting: "work" },
    projectionContextKeys: ["setting", "stakes"],
    event: { id: "authored-context-event", sourceStatus: "retrospective_self_report" },
    options: [{
      id: "move",
      text: "Move",
      predicates: [{ id: "authored-context:move", construct: "tempo", claimText: "Moved in the authored work context.", claimTemplateId: "authored-context-v1", allowedInferenceKeys: ["bounded_behavior"], allowedScopeIds: ["selected_situation"], axisId: "activation_tempo", direction: "right" }],
    }],
  }));
  const event = answer(question, "move", { context: { stakes: "high" } });
  assert.deepEqual(event.context, { setting: "work", stakes: "high" });
  assert.deepEqual(event.projectionContext, { setting: "work", stakes: "high" });
  assert.throws(() => answer(question, "move", { context: { setting: "social" } }), /cannot override authored context/);
  const tampered = { ...event, context: { stakes: "high" }, projectionContext: { stakes: "high" }, contextKey: JSON.stringify([["stakes", "high"]]) };
  assert.throws(() => snapshotFor([tampered], "tampered-authored-context"), /Authored context mismatch/);
});

test("linked action and motive enrich one source unit instead of manufacturing corroboration", () => {
  const action = template({ itemId: "action", eventId: "shared-event", sourceStatus: "retrospective_self_report" });
  const motive = template({ itemId: "motive", eventId: "shared-event", sourceStatus: "retrospective_self_report" });
  const other = template({ itemId: "other", eventId: "independent-event", sourceStatus: "retrospective_self_report" });
  const events = [answer(action, "R"), answer(motive, "R"), answer(other, "R")];
  const axis = projection(events).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.answeredSourceUnits, 2);
  assert.equal(axis.supportLevel, "thin");
  assert.equal(axis.debug.contributions.length, 2);
});

test("a hypothetical predicate cannot inherit retrospective weight from its linked source unit", () => {
  const events = [];
  for (const id of ["one", "two", "three"]) {
    events.push(answer(template({ itemId: `actual-${id}`, eventId: `mixed-${id}`, sourceStatus: "retrospective_self_report", axisId: "structure_reliance" }), "R"));
    events.push(answer(template({ itemId: `hyp-${id}`, eventId: `mixed-${id}`, sourceStatus: "hypothetical_choice", axisId: "activation_tempo" }), "R"));
  }
  const axis = projection(events).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.answeredSourceUnits, 3);
  assert.equal(axis.supportLevel, "thin");
  assert.deepEqual(axis.sourceStatuses, ["hypothetical_choice"]);
});

test("matched context reversals remain mixed instead of averaging into a middle personality", () => {
  const privateQuestion = template({ itemId: "private", eventId: "private-event", sourceStatus: "retrospective_self_report" });
  const publicQuestion = template({ itemId: "public", eventId: "public-event", sourceStatus: "retrospective_self_report" });
  const events = [
    answer(privateQuestion, "L", { context: { audience: "private" } }),
    answer(publicQuestion, "R", { context: { audience: "public" } }),
  ];
  const axis = projection(events).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.supportLevel, "mixed");
  assert.equal(axis.direction, "mixed");
  assert.equal(axis.answeredSourceUnits, 2);
});

test("missingness and Other remain visible but never become neutral axis evidence", () => {
  const question = template({
    itemId: "missing",
    exits: [
      { id: "skip", text: "Skip", reason: "skip" },
      { id: "other", text: "Other", reason: "other_unscored" },
    ],
  });
  const skipped = answer(question, "skip");
  const other = answer(question, "other", { otherText: "It depends on context." });
  const result = projection([skipped, other]);
  const axis = result.axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.answeredSourceUnits, 0);
  assert.equal(axis.supportLevel, "unknown");
  assert.equal(other.privateFreeText, "It depends on context.");
  assert.equal(other.sourceStatus, "other_unscored");
});

test("hypothetical-only evidence cannot exceed thin support", () => {
  const events = ["a", "b", "c", "d"].map((id) => answer(template({ itemId: id, sourceStatus: "hypothetical_choice" }), "R"));
  const axis = projection(events).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.direction, "right");
  assert.equal(axis.supportLevel, "thin");
  assert.equal(axis.debug.numericPosition, 100);
});

test("uncontextualized stated preferences and zero-weight context facts cannot become supported", () => {
  const preferences = ["p1", "p2", "p3"].map((id) => answer(template({ itemId: id, sourceStatus: "stated_preference" }), "R"));
  const preferenceAxis = projection(preferences).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(preferenceAxis.supportLevel, "thin");

  const contextFacts = ["c1", "c2", "c3"].map((id) => answer(template({ itemId: id, sourceStatus: "context_fact" }), "R"));
  const contextAxis = projection(contextFacts).axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(contextAxis.supportLevel, "unknown");
  assert.equal(contextAxis.answeredSourceUnits, 0);
});

test("repeated independent retrospective evidence can support but does not become a personality percentage", () => {
  const events = ["a", "b", "c"].map((id) => answer(template({ itemId: id, sourceStatus: "retrospective_self_report" }), "R", { context: { setting: id } }));
  const result = projection(events);
  const axis = result.axes.find((item) => item.axisId === "activation_tempo");
  assert.equal(axis.supportLevel, "supported");
  assert.equal(axis.direction, "right");
  assert.match(result.warnings.join(" "), /not formal personality scores/i);
  assert.equal(Object.hasOwn(axis, "percentage"), false);
});

test("ProfileSnapshot freezes before heldouts and rejects unsupported claims", () => {
  const profileQuestion = template({ itemId: "profile", sourceStatus: "retrospective_self_report" });
  const heldoutQuestion = template({ itemId: "heldout", sourceStatus: "heldout" });
  const profileEvent = answer(profileQuestion, "R");
  const heldoutEvent = answer(heldoutQuestion, "L", { capturedAt: "2026-09-21T00:00:01Z" });
  const claim = auditedClaim({
    id: "claim:profile",
    canonicalStatement: RIGHT_CLAIM,
    events: [profileEvent],
    displayEligibility: { compact: true, privateEvidence: true },
  });
  const bankManifest = createBankManifest([profileQuestion, heldoutQuestion]);
  const snapshot = snapshotFor([profileEvent], "snapshot-1", [claim], {
    extraTemplates: [heldoutQuestion],
  });
  assert.deepEqual(snapshot.evidenceEvents.map((event) => event.itemId), ["profile"]);
  assert.deepEqual(snapshot.audit.heldoutItemIds, [heldoutQuestion.itemId]);
  assert.equal(snapshot.scope.heldoutExcluded, true);
  assert.throws(() => createFreezeCommitment({
    attemptId: "attempt-1",
    sealedAt: "2026-09-21T00:00:00Z",
    bankManifest,
    profileEvents: [profileEvent],
    predictionCommitment: { id: "incomplete", entries: [] },
    baselineCommitment: { id: "incomplete", entries: [] },
  }), /complete heldout set/);
  assert.throws(() => createFreezeCommitment({
    attemptId: "attempt-1",
    sealedAt: "2026-09-21T00:00:00Z",
    bankManifest,
    profileEvents: [profileEvent],
    predictionCommitment: { id: "invalid", entries: [{ itemId: heldoutQuestion.itemId, optionId: "not-authored" }] },
    baselineCommitment: { id: "valid", entries: [{ itemId: heldoutQuestion.itemId, abstain: true }] },
  }), /valid authored option/);
  const evaluation = createHeldoutEvaluation(snapshot, [heldoutEvent], {
    bankManifest,
    exposedAt: "2026-09-21T00:00:01Z",
  });
  assert.deepEqual(evaluation.heldoutEvents.map((event) => event.itemId), ["heldout"]);
  const earlyHeldout = { ...heldoutEvent, capturedAt: "2026-09-20T23:59:59Z" };
  assert.throws(() => createHeldoutEvaluation(snapshot, [earlyHeldout], {
    bankManifest,
    exposedAt: "2026-09-21T00:00:01Z",
  }), /captured after exposure/);
  assert.throws(() => snapshotFor([profileEvent, heldoutEvent], "bad-heldout"), /Freeze accepts|cannot enter/);
  assert.throws(() => createHeldoutEvaluation(snapshot, [heldoutEvent], {
    bankManifest,
    exposedAt: "2026-09-20T23:59:59Z",
  }), /after freeze/);
  const relabelledHeldout = { ...heldoutEvent, capturedAt: "2026-09-21T00:00:00Z", phase: "profile", sourceStatus: "hypothetical_choice" };
  assert.throws(() => snapshotFor([profileEvent, relabelledHeldout], "forged-heldout"), /mismatch/);
  const forgedPredicate = { ...profileEvent, predicates: [{ ...profileEvent.predicates[0], direction: "left" }] };
  assert.throws(() => snapshotFor([forgedPredicate], "forged-predicate"), /Predicate mapping mismatch/);
  const forgedContext = { ...profileEvent, context: { setting: "forged" }, projectionContext: { setting: "forged" }, contextKey: "forged" };
  assert.throws(() => snapshotFor([forgedContext], "forged-context"), /Invalid context/);
  assert.throws(() => createProfileSnapshot({
    snapshotId: "raw-freeze",
    events: [profileEvent],
    claims: [],
    bankManifest,
    freeze: { attemptId: "attempt-1", sealedAt: "2026-09-21T00:00:00Z" },
  }), /in-process freeze commitment/);
  assert.throws(() => answer(template({ itemId: "heldout-override", sourceStatus: "heldout" }), "L", { phase: "profile" }), /cannot override/);
  assert.throws(() => answer(template({ itemId: "version-override" }), "R", { mappingVersion: "forged-map" }), /cannot override/);
  assert.throws(() => answer(template({ itemId: "unit-override" }), "R", { sourceUnitId: "forged-unit" }), /derived/);
  assert.throws(() => answer(template({ itemId: "occurrence-override" }), "R", { occurrenceId: "fake-repeat" }), /derived/);
  assert.throws(() => snapshotFor([profileEvent], "bad", [auditedClaim({ id: "claim:bad", canonicalStatement: "Bad", events: [heldoutEvent] })]), /outside this snapshot/);

  const missing = answer(template({ itemId: "missing-claim", exits: [{ id: "skip", reason: "skip" }] }), "skip");
  assert.throws(() => snapshotFor([missing], "bad-missing", [auditedClaim({ id: "claim:missing", canonicalStatement: "Bad", evidenceIds: [missing.evidenceId], supportedPredicateIds: ["fake:predicate"] })]), /outside this snapshot/);
  assert.throws(() => createAuditedClaim({
    id: "claim:self-certified",
    canonicalStatement: "Trust me.",
    evidenceIds: [profileEvent.evidenceId],
    supportedPredicateIds: profileEvent.predicates.map((predicate) => predicate.id),
    inferenceKeys: ["bounded_behavior"],
    scopeId: "selected_situation",
    claimTemplateId: "bounded-behavior-v1",
    auditVerdict: "pass",
  }), /complete audit receipt/);
  const restoredWithoutAudit = { ...claim, audit: { reviewer: null, checkedClaimLimits: false, checkedProhibitedInferences: false } };
  assert.throws(() => snapshotFor([profileEvent], "bad-restored-audit", [restoredWithoutAudit]), /lacks a valid audit receipt/);
  assert.throws(() => snapshotFor([profileEvent], "bad-prohibited", [auditedClaim({
    id: "claim:prohibited",
    canonicalStatement: RIGHT_CLAIM,
    events: [profileEvent],
    inferenceKeys: ["formal personality score"],
  })]), /inference/);
  assert.throws(() => snapshotFor([profileEvent], "bad-scope", [auditedClaim({
    id: "claim:scope",
    canonicalStatement: RIGHT_CLAIM,
    events: [profileEvent],
    scopeId: "global_personality",
  })]), /scope limits/);
  assert.throws(() => snapshotFor([profileEvent], "bad-language", [auditedClaim({
    id: "claim:invented-language",
    canonicalStatement: "This secretly proves a clinical or moral conclusion.",
    events: [profileEvent],
  })]), /unapproved statement text/);
});

test("corrections are append-only overlays and do not mutate the frozen snapshot or projection", () => {
  const events = ["a", "b"].map((id) => answer(template({ itemId: id, sourceStatus: "retrospective_self_report" }), "R"));
  const claim = auditedClaim({
    id: "claim:tempo",
    canonicalStatement: RIGHT_CLAIM,
    events,
    displayEligibility: { compact: true, privateEvidence: true },
  });
  const snapshot = snapshotFor(events, "snapshot-1", [claim]);
  const projected = projection(events);
  const before = JSON.stringify({ snapshot, projected });
  const correction = createCorrectionRecord({
    id: "correction-1",
    snapshotId: snapshot.snapshotId,
    claimId: claim.id,
    value: "partly_accurate",
    reason: "Only at work.",
    evidenceSnapshotIds: claim.evidenceIds,
  });
  const card = createResultCard(snapshot, projected, { view: "private_evidence", corrections: [correction] });
  assert.equal(card.corrections[0].value, "partly_accurate");
  assert.equal(JSON.stringify({ snapshot, projected }), before);
  assert.equal(Object.isFrozen(snapshot), true);
});

test("share-safe and private cards are different projections of the same frozen data", () => {
  const events = ["a", "b"].map((id) => answer(template({ itemId: id, sourceStatus: "retrospective_self_report" }), "R"));
  const privateClaim = auditedClaim({
    id: "claim:private",
    canonicalStatement: RIGHT_CLAIM,
    events,
    displayEligibility: { compact: true, privateEvidence: true, shareSafe: false },
    publicSafe: false,
  });
  const publicClaim = auditedClaim({
    id: "claim:public",
    canonicalStatement: RIGHT_CLAIM,
    events,
    displayEligibility: { privateEvidence: true, shareSafe: true },
    publicSafe: true,
  });
  const snapshot = snapshotFor(events, "snapshot-1", [privateClaim, publicClaim], {
    publicAxisIds: ["activation_tempo"],
    publicClaimTemplateIds: ["bounded-behavior-v1"],
  });
  const projected = projectProductAxes(snapshot);
  const correction = createCorrectionRecord({
    id: "correction-private",
    snapshotId: snapshot.snapshotId,
    claimId: publicClaim.id,
    value: "partly_accurate",
    reason: "Private correction text.",
  });
  const privateCard = createResultCard(snapshot, projected, { view: "private_evidence", corrections: [correction] });
  const publicCard = createResultCard(snapshot, projected, { view: "share_safe", corrections: [correction] });
  const allowlistedPublicCard = createResultCard(snapshot, projected, {
    view: "share_safe",
    corrections: [correction],
    identity: {
      labelClaimId: publicClaim.id,
      hookClaimId: publicClaim.id,
      axisIds: ["activation_tempo"],
      publicSafe: true,
      hiddenPrivateField: "must not survive",
    },
  });
  assert.equal(privateCard.receipts.length, 2);
  assert.deepEqual(publicCard.selectedClaimIds, ["claim:public"]);
  assert.deepEqual(publicCard.selectedAxisIds, ["activation_tempo"]);
  assert.deepEqual(allowlistedPublicCard.selectedAxisIds, ["activation_tempo"]);
  assert.equal(publicCard.receipts.length, 0);
  assert.deepEqual(publicCard.corrections, []);
  assert.deepEqual(Object.keys(publicCard.claims[0]), ["id", "text"]);
  assert.equal(publicCard.privacyLevel, "public_safe");
  assert.equal(Object.hasOwn(allowlistedPublicCard.identity, "hiddenPrivateField"), false);
  assert.equal(allowlistedPublicCard.identity.label, publicClaim.shortStatement.slice(0, 120));
  assert.equal(allowlistedPublicCard.rendererRules.mayParaphraseApprovedText, false);
  const privateAxisSnapshot = snapshotFor(events, "private-axis", [publicClaim]);
  const attemptedRuntimeAllowlist = createResultCard(privateAxisSnapshot, projectProductAxes(privateAxisSnapshot), {
    view: "share_safe",
    publicAxisIds: ["activation_tempo"],
  });
  assert.deepEqual(attemptedRuntimeAllowlist.selectedAxisIds, []);
  assert.deepEqual(attemptedRuntimeAllowlist.selectedClaimIds, []);
  assert.throws(() => createResultCard(snapshot, projected, {
    view: "share_safe",
    identity: { labelClaimId: "invented", hookClaimId: "invented", axisIds: [], publicSafe: true },
  }), /must come from claims/);
});

test("comparison and result binding fail closed across incompatible versions or evidence", () => {
  const events = ["a", "b"].map((id) => answer(template({ itemId: id, sourceStatus: "retrospective_self_report" }), "R"));
  const left = projection(events, "left");
  const right = projection(events, "right");
  assert.equal(canCompareProjections(left, right), true);
  assert.equal(canCompareProjections(left, { ...right, mappingVersion: "future-map" }), false);
  const semanticChange = projection([
    answer(template({ itemId: "a", sourceStatus: "retrospective_self_report", semanticVersion: "semantic-v2" }), "R"),
    answer(template({ itemId: "b", sourceStatus: "retrospective_self_report", semanticVersion: "semantic-v2" }), "R"),
  ], "semantic-change");
  assert.equal(canCompareProjections(left, semanticChange), false);
  const migratedRight = { ...right, projectionVersion: "future-v2", mappingVersion: "future-map" };
  assert.equal(canCompareProjections(left, migratedRight, {
    approved: true,
    fromEvidenceFrameworkVersion: left.evidenceFrameworkVersion,
    toEvidenceFrameworkVersion: migratedRight.evidenceFrameworkVersion,
    fromProjectionVersion: PROJECTION_VERSION,
    toProjectionVersion: "future-v2",
    fromMappingVersion: "mapping-v1",
    toMappingVersion: "future-map",
    fromSemanticManifestBinding: left.semanticManifestBinding,
    toSemanticManifestBinding: migratedRight.semanticManifestBinding,
    fromAdapterManifestBinding: left.adapterManifestBinding,
    toAdapterManifestBinding: migratedRight.adapterManifestBinding,
    fromBankManifestBinding: left.bankManifestBinding,
    toBankManifestBinding: migratedRight.bankManifestBinding,
  }), true);

  const snapshot = snapshotFor(events, "bound-snapshot");
  const projected = projectProductAxes(snapshot);
  const differentEvents = [answer(template({ itemId: "different", sourceStatus: "retrospective_self_report" }), "L")];
  const differentSnapshot = snapshotFor(differentEvents, "bound-snapshot");
  assert.throws(() => createResultCard(differentSnapshot, projected), /evidence does not match/);
});

test("legacy V4 observations can be preserved without inventing projection predicates", () => {
  const events = adaptObservationRows([
    {
      id: "legacy:1",
      questionId: "V4-005",
      optionId: "B",
      answer: "I would correct it privately.",
      role: "hypothetical",
      linkedEventId: "EV4-STATUS-CREDIT",
      version: "v4",
      mappingVersion: "v4-map",
      wordingVersion: "v4-copy",
      kind: "evidence",
      unsupportedInferences: ["secret motive"],
    },
  ], { attemptId: "attempt-legacy" });
  assert.equal(events[0].sourceUnitId, "attempt-legacy:EV4-STATUS-CREDIT");
  assert.deepEqual(events[0].predicates, []);
  assert.deepEqual(events[0].notEvidenceFor, ["secret motive"]);
  assert.equal(PRODUCT_AXES.length, 5);

  const [heldoutExit] = adaptObservationRows([{
    id: "legacy:heldout:skip",
    questionId: "V4-045",
    optionId: "skip",
    answer: "Skip",
    role: "heldout",
    version: "v4",
    bankVersion: "v4-bank",
    mappingVersion: "v4-map",
    wordingVersion: "v4-copy",
    kind: "missingness",
    missingness: "skip",
  }], { attemptId: "attempt-legacy" });
  assert.equal(heldoutExit.phase, "heldout");
  assert.equal(heldoutExit.sourceStatus, "heldout");
});
