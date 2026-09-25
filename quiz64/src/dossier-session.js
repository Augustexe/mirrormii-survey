import { buildGameOutcome } from "./game-outcome.js";
import { getBank } from "./question-bank-v2.js";
import {
  EVIDENCE_FRAMEWORK_VERSION,
  compileResponse,
  createAuditedClaim,
  createCorrectionRecord,
  createFreezeCommitment,
  createHeldoutEvaluation,
  createProfileSnapshot,
  createResultCard,
  projectProductAxes,
} from "./evidence-framework.js";

export const DOSSIER_SESSION_VERSION = "genii-dossier-session-v2";
export const DOSSIER_STORAGE_KEY = "genii.dossier-session.v2";
export const SESSION_PHASES = Object.freeze({
  PROFILE: "profile",
  READY_TO_FREEZE: "ready_to_freeze",
  HELDOUT: "heldout",
  COMPLETE: "complete",
});

const PHASES = new Set(Object.values(SESSION_PHASES));
const DEFAULT_ROUTE = "everyday";
const DEFAULT_VOICE = "gentle";
const DEFAULT_PERSONAL = false;
const CORRECTION_VALUES = new Set(["accurate", "partly_accurate", "inaccurate", "prefer_not_to_say"]);
let sequence = 0;

function invariant(value, message) {
  if (!value) throw new Error(message);
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function same(left, right) {
  return stable(left) === stable(right);
}

function nowFrom(clock) {
  const value = typeof clock === "function" ? clock() : new Date().toISOString();
  invariant(typeof value === "string" && Number.isFinite(Date.parse(value)), "Clock must return a valid ISO timestamp");
  return value;
}

function sessionClock(session) {
  return session.__clock || (() => new Date().toISOString());
}

function forkSession(session) {
  const next = {
    ...session,
    config: { ...session.config },
    profileIds: [...session.profileIds],
    heldoutIds: [...session.heldoutIds],
    sections: clone(session.sections),
    presentation: clone(session.presentation),
    responses: clone(session.responses),
    events: [...session.events],
    exposures: clone(session.exposures),
    corrections: [...session.corrections],
    predictionCommitment: clone(session.predictionCommitment),
    baselineCommitment: clone(session.baselineCommitment),
    priorEvaluation: clone(session.priorEvaluation),
    priorSnapshot: clone(session.priorSnapshot),
  };
  next.answers = next.responses;
  Object.defineProperty(next, "__templates", { value: session.__templates, enumerable: false, writable: true });
  Object.defineProperty(next, "__clock", { value: sessionClock(session), enumerable: false, writable: true });
  return next;
}

function newId(prefix) {
  sequence += 1;
  const uuid = typeof crypto?.randomUUID === "function" ? crypto.randomUUID() : `${Date.now().toString(36)}-${sequence.toString(36)}`;
  return `${prefix}-${uuid}`;
}

function bankFor(options = {}) {
  const config = options.config || {};
  const route = options.route || config.route || DEFAULT_ROUTE;
  const voice = options.voice || config.voice || DEFAULT_VOICE;
  const personal = options.personal ?? config.personal ?? DEFAULT_PERSONAL;
  const bank = getBank({ route, voice, personal });
  invariant(bank && typeof bank === "object", "Question bank required");
  invariant(Array.isArray(bank.templates) && bank.templates.length > 0, "Question bank templates required");
  invariant(bank.manifest && typeof bank.manifest === "object", "Question bank manifest required");
  invariant(Array.isArray(bank.profileIds) && Array.isArray(bank.heldoutIds), "Question bank phase IDs required");
  const byId = new Map(bank.templates.map((template) => [template.itemId, template]));
  invariant(byId.size === bank.templates.length, "Question bank contains duplicate item IDs");
  invariant(bank.profileIds.every((id) => byId.has(id)), "Question bank profile IDs must reference templates");
  invariant(bank.heldoutIds.every((id) => byId.has(id)), "Question bank heldout IDs must reference templates");
  invariant(new Set([...bank.profileIds, ...bank.heldoutIds]).size === bank.templates.length, "Question bank phase IDs must partition templates");
  invariant(bank.manifest.manifestBinding, "Question bank manifest binding required");
  return {
    route: bank.route || route,
    voice: bank.voice || voice,
    personal: bank.personal ?? personal,
    bankVersion: bank.BANK_VERSION || bank.bankVersion || bank.templates[0].bankVersion,
    templates: bank.templates,
    manifest: bank.manifest,
    presentation: bank.presentation || {},
    profileIds: [...bank.profileIds],
    heldoutIds: [...bank.heldoutIds],
    sections: clone(bank.sections || []),
  };
}

function templateFor(session, itemId) {
  const template = session.__templates.get(itemId);
  invariant(template, `Unknown question ${itemId}`);
  return template;
}

function publicQuestion(session, itemId) {
  if (!itemId) return null;
  const template = templateFor(session, itemId);
  const presentation = clone(session.presentation[itemId] || {});
  const exposure = session.exposures[itemId] || { count: 0, labels: [] };
  return {
    itemId,
    template,
    presentation,
    section: session.sections.find((section) => section.id === presentation.sectionId || section.id === template.sectionId) || null,
    exposureLabel: presentation.exposureLabel || presentation.label || template.exposureLabel || null,
    exposureCount: exposure.count,
    exposureLabels: [...exposure.labels],
  };
}

function unresolvedIn(session, ids) {
  return ids.find((itemId) => !Object.hasOwn(session.responses, itemId)) || null;
}

function recordExposure(session, itemId, at) {
  const presentation = session.presentation[itemId] || {};
  const label = presentation.exposureLabel || presentation.label || templateFor(session, itemId).exposureLabel || null;
  const prior = session.exposures[itemId] || { count: 0, labels: [], firstAt: at, lastAt: at };
  prior.count += 1;
  prior.firstAt ||= at;
  prior.lastAt = at;
  if (label && !prior.labels.includes(label)) prior.labels.push(label);
  session.exposures[itemId] = prior;
}

function ensureProfileAnswerAllowed(session, itemId) {
  invariant(session.phase === SESSION_PHASES.PROFILE || session.phase === SESSION_PHASES.READY_TO_FREEZE, "Profile answers are closed");
  invariant(session.profileIds.includes(itemId), `Question ${itemId} is not a profile item`);
}

function responseRecord(itemId, value, options = {}, capturedAt) {
  return {
    itemId,
    value: Array.isArray(value) ? [...value] : value,
    context: clone(options.context || {}),
    target: clone(options.target),
    timeframe: clone(options.timeframe),
    otherText: typeof options.otherText === "string" ? options.otherText : undefined,
    note: typeof options.note === "string" ? options.note.slice(0,1200) : undefined,
    capturedAt,
  };
}

function compile(session, itemId, response) {
  return compileResponse(templateFor(session, itemId), {
    attemptId: session.attemptId,
    capturedAt: response.capturedAt,
    value: response.value,
    context: response.context,
    target: response.target,
    timeframe: response.timeframe,
    otherText: response.otherText,
  });
}

function validateAnswerTime(session, capturedAt, phase) {
  invariant(typeof capturedAt === "string" && Number.isFinite(Date.parse(capturedAt)), "Valid answer timestamp required");
  const timestamp = Date.parse(capturedAt);
  invariant(timestamp >= Date.parse(session.createdAt), "Answer cannot precede session creation");
  if (phase === "profile") {
    if (session.freeze) invariant(timestamp <= Date.parse(session.freeze.sealedAt), "Profile answer occurs after freeze");
  }
  if (phase === "heldout") {
    invariant(session.exposedAt && timestamp >= Date.parse(session.exposedAt), "Heldout answer must occur after exposure");
  }
}

function claimForPredicate(session, snapshotEvents, predicate, axis) {
  const evidenceEvents = snapshotEvents.filter((event) => !event.missingness && event.predicates?.some((candidate) => candidate.id === predicate.id));
  if (evidenceEvents.length === 0) return null;
  const evidenceIds = evidenceEvents.map((event) => event.evidenceId);
  const counterevidenceIds = snapshotEvents
    .filter((event) => !event.missingness && event.predicates?.some((candidate) => candidate.axisId === predicate.axisId && candidate.direction !== predicate.direction))
    .map((event) => event.evidenceId)
    .filter((id) => !evidenceIds.includes(id));
  const inferenceKey = predicate.allowedInferenceKeys?.[0];
  const scopeId = predicate.allowedScopeIds?.[0];
  if (!inferenceKey || !scopeId) return null;
  return createAuditedClaim({
    id: `${session.snapshotId}:${predicate.id}`,
    domain: predicate.domain || "product_projection",
    construct: predicate.construct,
    claimTemplateId: predicate.claimTemplateId,
    inferenceKeys: [inferenceKey],
    canonicalStatement: predicate.claimText,
    shortStatement: predicate.claimText,
    scope: "selected situations represented by these answers",
    scopeId,
    evidenceIds,
    supportedPredicateIds: [predicate.id],
    counterevidenceIds,
    alternatives: axis?.supportLevel === "mixed" ? ["The same choice may change with context."] : [],
    uncertainty: axis?.supportLevel === "strongly_supported" ? "moderate" : "high",
    evidenceStatus: axis?.supportLevel || "limited_evidence",
    nextValidation: axis?.nextValidation,
    displayEligibility: { compact: true, privateEvidence: true, geniiIdentity: true, comparison: true, shareSafe: false },
    publicSafe: false,
    auditVerdict: "pass",
    audit: { reviewer: "dossier-runtime-v1", checkedClaimLimits: true, checkedProhibitedInferences: true },
  });
}

function buildClaims(session, events, projection, snapshotId) {
  const claims = [];
  const seen = new Set();
  for (const axis of projection.axes.filter((item) => ["supported", "strongly_supported"].includes(item.supportLevel))) {
    const eventIds = new Set([...axis.supportingEvidenceIds, ...axis.counterevidenceIds]);
    for (const event of events.filter((item) => eventIds.has(item.evidenceId))) {
      for (const predicate of event.predicates || []) {
        if (predicate.axisId !== axis.axisId || seen.has(predicate.id)) continue;
        const claim = claimForPredicate({ ...session, snapshotId }, events, predicate, axis);
        if (claim) { claims.push(claim); seen.add(predicate.id); }
      }
    }
  }
  return claims;
}

function baselineFor(template) {
  const option = template.options?.find((candidate) => typeof candidate.id === "string");
  return option ? { itemId: template.itemId, optionId: option.id } : { itemId: template.itemId, abstain: true };
}

function predictionFor(template, axes) {
  const supported = new Map(axes.filter((axis) => ["supported", "strongly_supported"].includes(axis.supportLevel)).map((axis) => [axis.axisId, axis]));
  const scores = (template.options || []).map((option) => {
    let score = 0;
    let matched = 0;
    for (const predicate of option.predicates || []) {
      const axis = supported.get(predicate.axisId);
      if (!axis || predicate.direction !== axis.direction) continue;
      score += (axis.supportLevel === "strongly_supported" ? 2 : 1) * (predicate.strength || 1);
      matched += 1;
    }
    return { option, score, matched };
  }).filter((entry) => entry.matched > 0).sort((left, right) => right.score - left.score || left.option.id.localeCompare(right.option.id));
  if (!scores.length || scores[0].score <= 0 || (scores[1] && scores[0].score === scores[1].score)) return { itemId: template.itemId, abstain: true, reason: "insufficient_supported_axis_evidence" };
  return { itemId: template.itemId, optionId: scores[0].option.id, reason: "supported_axis_projection" };
}


function sameOptions(left, right) {
  const a = Array.isArray(left) ? [...left].sort() : [left];
  const b = Array.isArray(right) ? [...right].sort() : [right];
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function heldoutStats(session) {
  const predictions = new Map((session.predictionCommitment?.entries || []).map((entry) => [entry.itemId, entry]));
  const baselines = new Map((session.baselineCommitment?.entries || []).map((entry) => [entry.itemId, entry]));
  const trials = session.heldoutIds.map((itemId) => {
    const template = templateFor(session, itemId);
    const event = session.evaluation?.heldoutEvents?.find((candidate) => candidate.itemId === itemId);
    const prediction = predictions.get(itemId) || { itemId, abstain: true, reason: "missing_prediction" };
    const baseline = baselines.get(itemId) || { itemId, abstain: true, reason: "missing_baseline" };
    const answerIds = event?.missingness ? null : event?.optionIds || null;
    const optionText = (ids) => (ids && ids.length ? ids.map((id) => template.options.find((option) => option.id === id)?.text || id).join("; ") : null);
    const skipped = !!event?.missingness;
    const predicted = !prediction.abstain && answerIds && sameOptions(prediction.optionId, answerIds);
    const baselineHit = !baseline.abstain && answerIds && sameOptions(baseline.optionId, answerIds);
    return {
      itemId,
      prompt: template.prompt,
      guess: prediction.abstain ? null : optionText([prediction.optionId]),
      guessOptionId: prediction.abstain ? null : prediction.optionId,
      answer: optionText(answerIds),
      answerOptionIds: answerIds,
      baseline: baseline.abstain ? null : optionText([baseline.optionId]),
      baselineOptionId: baseline.abstain ? null : baseline.optionId,
      status: skipped ? "skipped" : prediction.abstain ? "abstained" : predicted ? "hit" : "miss",
      baselineStatus: skipped ? "skipped" : baseline.abstain ? "abstained" : baselineHit ? "hit" : "miss",
      reason: prediction.reason || null,
      sourceStatus: event?.sourceStatus || null,
      missingness: event?.missingness?.reason || null,
    };
  });
  const answered = trials.filter((trial) => trial.status !== "skipped" && trial.answerOptionIds);
  const predicted = answered.filter((trial) => trial.guessOptionId);
  const baselineAnswered = answered.filter((trial) => trial.baselineOptionId);
  const baselineEligible = predicted.filter((trial) => trial.baselineOptionId);
  return {
    trials,
    answered: answered.length,
    skipped: trials.filter((trial) => trial.status === "skipped").length,
    abstentions: answered.length - predicted.length,
    predicted: predicted.length,
    hits: predicted.filter((trial) => trial.status === "hit").length,
    baselineAnswered: baselineAnswered.length,
    baselineEligible: baselineEligible.length,
    baselineHits: baselineEligible.filter((trial) => trial.baselineStatus === "hit").length,
    denominator: predicted.length,
    baselineDenominator: baselineEligible.length,
    predictionCommitmentId: session.predictionCommitment?.id || null,
    baselineCommitmentId: session.baselineCommitment?.id || null,
  };
}

function freezeSessionState(session, at) {
  const profileEvents = session.events.filter((event) => event.phase === "profile");
  const predictionEntries = session.heldoutIds.map((id) => predictionFor(templateFor(session, id), session.projection.axes));
  const baselineEntries = session.heldoutIds.map((id) => baselineFor(templateFor(session, id)));
  const predictionCommitment = { id: `${session.attemptId}:prediction`, entries: predictionEntries };
  const baselineCommitment = { id: `${session.attemptId}:baseline`, entries: baselineEntries };
  const freeze = createFreezeCommitment({
    attemptId: session.attemptId,
    sealedAt: at,
    bankManifest: session.manifest,
    profileEvents,
    predictionCommitment,
    baselineCommitment,
  });
  const snapshotId = `${session.attemptId}:profile`;
  const claims = buildClaims(session, profileEvents, session.projection, snapshotId);
  const snapshot = createProfileSnapshot({
    snapshotId,
    bankManifest: session.manifest,
    freeze,
    events: profileEvents,
    claims,
    unknowns: session.projection.axes.filter((axis) => axis.supportLevel === "unknown").map((axis) => `${axis.label} remains unknown until there are two independent examples.`),
    versions: {
      surveyVersion: profileEvents[0]?.surveyVersion || session.templates[0].surveyVersion,
      questionBankVersion: profileEvents[0]?.questionBankVersion || session.templates[0].bankVersion,
      mappingVersion: profileEvents[0]?.mappingVersion || session.templates[0].mappingVersion,
      wordingVersion: profileEvents[0]?.wordingVersion || session.templates[0].wordingVersion,
    },
    scope: { locale: "en", optInScope: session.personal ? ["personal"] : [], profileCutoff: at },
    createdAt: at,
  });
  session.predictionCommitment = clone(predictionCommitment);
  session.baselineCommitment = clone(baselineCommitment);
  session.freeze = freeze;
  session.snapshot = snapshot;
  session.projection = projectProductAxes(snapshot);
  session.snapshotId = snapshot.snapshotId;
  session.phase = SESSION_PHASES.HELDOUT;
  return session;
}

function ensureBankIntegrity(session) {
  const current = bankFor(session);
  invariant(current.manifest.manifestBinding === session.manifest.manifestBinding, "Question bank changed since this session was created");
  invariant(current.bankVersion === session.bankVersion, "Question bank version changed since this session was created");
  return current;
}

export function createSession(options = {}) {
  const bank = bankFor(options);
  const clock = options.clock || (typeof options.now === "function" ? options.now : undefined);
  const createdAt = typeof options.now === "string" ? options.now : nowFrom(clock);
  invariant(typeof createdAt === "string" && Number.isFinite(Date.parse(createdAt)), "Valid session creation time required");
  const session = {
    schemaVersion: DOSSIER_SESSION_VERSION,
    storageKey: DOSSIER_STORAGE_KEY,
    evidenceFrameworkVersion: EVIDENCE_FRAMEWORK_VERSION,
    sessionId: options.sessionId || newId("session"),
    attemptId: options.attemptId || newId("attempt"),
    parentSessionId: options.parentSessionId || null,
    revisionOfSnapshotId: options.revisionOfSnapshotId || null,
    route: bank.route,
    voice: bank.voice,
    personal: bank.personal,
    config: { route: bank.route, voice: bank.voice, personal: bank.personal },
    bankVersion: bank.bankVersion,
    phase: SESSION_PHASES.PROFILE,
    createdAt,
    profileIds: bank.profileIds,
    heldoutIds: bank.heldoutIds,
    templates: bank.templates,
    manifest: bank.manifest,
    presentation: bank.presentation,
    sections: bank.sections,
    responses: {},
    events: [],
    exposures: {},
    corrections: [],
    predictionCommitment: null,
    baselineCommitment: null,
    freeze: null,
    snapshot: null,
    projection: null,
    evaluation: null,
    exposedAt: null,
    priorEvaluation: options.priorEvaluation ? clone(options.priorEvaluation) : null,
    priorSnapshot: options.priorSnapshot ? clone(options.priorSnapshot) : null,
    priorExposure: options.priorExposure === true,
  };
  session.answers = session.responses;
  Object.defineProperty(session, "__templates", { value: new Map(bank.templates.map((template) => [template.itemId, template])), enumerable: false, writable: true });
  Object.defineProperty(session, "__clock", { value: clock || (() => new Date().toISOString()), enumerable: false, writable: true });
  return session;
}

export function currentQuestion(session) {
  invariantSession(session);
  ensureBankIntegrity(session);
  if (session.phase === SESSION_PHASES.PROFILE) {
    const itemId = unresolvedIn(session, session.profileIds);
    if (!itemId) return null;
    return publicQuestion(session, itemId);
  }
  if (session.phase === SESSION_PHASES.READY_TO_FREEZE) return null;
  if (session.phase === SESSION_PHASES.HELDOUT) {
    const itemId = unresolvedIn(session, session.heldoutIds);
    if (!itemId) return null;
    return publicQuestion(session, itemId);
  }
  return null;
}

export function answerQuestion(session, itemId, value, options = {}) {
  invariantSession(session);
  const next = forkSession(session);
  ensureBankIntegrity(next);
  const phase = next.profileIds.includes(itemId) ? "profile" : next.heldoutIds.includes(itemId) ? "heldout" : null;
  invariant(phase, `Unknown question ${itemId}`);
  if (phase === "profile") {
    ensureProfileAnswerAllowed(next, itemId);
    invariant(!Object.hasOwn(next.responses, itemId), `Question ${itemId} is already answered; use editProfileAnswer`);
  } else {
    invariant(next.phase === SESSION_PHASES.HELDOUT, "Heldout answers require a frozen profile");
    invariant(!Object.hasOwn(next.responses, itemId), `Heldout question ${itemId} is already answered`);
    if (!next.exposedAt) {
      const exposureAt = options.exposedAt || nowFrom(sessionClock(next));
      invariant(next.freeze && Date.parse(exposureAt) > Date.parse(next.freeze.sealedAt), "Heldout exposure must occur after freeze");
      next.exposedAt = exposureAt;
    }
    recordExposure(next, itemId, next.exposedAt);
  }
  const capturedAt = options.capturedAt || nowFrom(sessionClock(next));
  validateAnswerTime(next, capturedAt, phase);
  const response = responseRecord(itemId, value, options, capturedAt);
  const event = compile(next, itemId, response);
  next.responses[itemId] = response;
  next.events.push(event);
  if (phase === "heldout") {
    if (next.heldoutIds.every((id) => Object.hasOwn(next.responses, id))) {
      next.evaluation = createHeldoutEvaluation(next.snapshot, next.events.filter((candidate) => candidate.phase === "heldout"), {
        bankManifest: next.manifest,
        exposedAt: next.exposedAt,
        evaluationId: `${next.snapshot.snapshotId}:heldout`,
      });
      next.phase = SESSION_PHASES.COMPLETE;
    }
  } else if (next.profileIds.every((id) => Object.hasOwn(next.responses, id))) {
    next.phase = SESSION_PHASES.READY_TO_FREEZE;
  }
  return next;
}

export function editProfileAnswer(session, itemId, value, options = {}) {
  invariantSession(session);
  const next = forkSession(session);
  ensureProfileAnswerAllowed(next, itemId);
  invariant(next.phase === SESSION_PHASES.PROFILE || next.phase === SESSION_PHASES.READY_TO_FREEZE, "Frozen profile answers require beginRevision");
  const capturedAt = options.capturedAt || nowFrom(sessionClock(next));
  validateAnswerTime(next, capturedAt, "profile");
  const response = responseRecord(itemId, value, options, capturedAt);
  const event = compile(next, itemId, response);
  const index = next.events.findIndex((candidate) => candidate.itemId === itemId && candidate.phase === "profile");
  if (index >= 0) next.events.splice(index, 1, event);
  else next.events.push(event);
  next.responses[itemId] = response;
  next.phase = next.profileIds.every((id) => Object.hasOwn(next.responses, id)) ? SESSION_PHASES.READY_TO_FREEZE : SESSION_PHASES.PROFILE;
  return next;
}

export function freezeSession(session, options = {}) {
  invariantSession(session);
  const next = forkSession(session);
  ensureBankIntegrity(next);
  invariant(next.phase === SESSION_PHASES.READY_TO_FREEZE || next.phase === SESSION_PHASES.PROFILE, "Profile is not ready to freeze");
  invariant(next.profileIds.every((id) => Object.hasOwn(next.responses, id)), "Every profile question must be resolved before freeze");
  const at = options.sealedAt || nowFrom(sessionClock(next));
  invariant(Date.parse(at) >= Date.parse(next.createdAt), "Freeze cannot precede session creation");
  invariant(!next.events.some((event) => Date.parse(event.capturedAt) > Date.parse(at)), "Freeze cannot precede profile evidence");
  const profileEvents = next.events.filter((event) => event.phase === "profile");
  invariant(profileEvents.length === next.profileIds.length, "Profile event set is incomplete");
  const profileOnlySnapshot = buildProfileProjection(next, at);
  next.projection = projectProductAxes(profileOnlySnapshot);
  return freezeSessionState(next, at);
}

function buildProfileProjection(session, at) {
  const profileEvents = session.events.filter((event) => event.phase === "profile");
  const fakeSnapshot = {
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    snapshotId: `${session.attemptId}:pre-freeze`,
    evidenceBinding: "pre-freeze",
    bankManifestBinding: session.manifest.manifestBinding,
    scope: { heldoutExcluded: true },
    versions: {
      projectionVersion: "genii-product-projection-v1",
      evidenceFrameworkVersion: EVIDENCE_FRAMEWORK_VERSION,
      mappingVersion: profileEvents[0]?.mappingVersion || session.templates[0].mappingVersion,
      questionBankVersion: profileEvents[0]?.questionBankVersion || session.templates[0].bankVersion,
      semanticManifestBinding: "pre-freeze",
      adapterManifestBinding: "pre-freeze",
    },
    evidenceEvents: profileEvents.filter((event) => !event.missingness),
    missingnessEvents: profileEvents.filter((event) => event.missingness),
  };
  return fakeSnapshot;
}

export function getResult(session, options = {}) {
  invariantSession(session);
  invariant(session.phase === SESSION_PHASES.COMPLETE, "Result is available after heldout completion");
  invariant(session.snapshot, "Result is unavailable before freeze");
  const view = options.view || "compact";
  const card = createResultCard(session.snapshot, session.projection, { ...options, view, corrections: session.corrections });
  if (view === "share_safe") return card;
  const gameTitle = buildGameOutcome(session.projection, session.config.voice);
  const stats = heldoutStats(session);
  const receipts = [...session.snapshot.evidenceEvents, ...session.snapshot.missingnessEvents].map((receipt) => {
    const template = templateFor(session, receipt.itemId);
    const presentation = session.presentation[receipt.itemId] || {};
    return {
      ...receipt,
      questionText: presentation.prompt || template.prompt,
      sectionId: presentation.sectionId || null,
      sourceStatus: receipt.sourceStatus || template.event.sourceStatus,
    };
  });
  return {
    ...card,
    receipts,
    config: { ...session.config },
    gameTitle,
    designation: gameTitle.label,
    phase: session.phase,
    snapshot: session.snapshot,
    projection: session.projection,
    evaluation: session.evaluation,
    heldoutStats: stats,
    predictionCommitment: clone(session.predictionCommitment),
    baselineCommitment: clone(session.baselineCommitment),
    priorEvaluation: clone(session.priorEvaluation),
    priorExposure: session.priorExposure === true,
    priorSnapshot: clone(session.priorSnapshot),
  };
}

export function addCorrection(session, claimId, value, reason = null, options = {}) {
  invariantSession(session);
  invariant(session.snapshot, "Corrections require a frozen result");
  invariant(typeof claimId === "string" && session.snapshot.claims.some((claim) => claim.id === claimId), "Correction must cite a claim in this snapshot");
  invariant(CORRECTION_VALUES.has(value), "Invalid correction value");
  const record = createCorrectionRecord({
    id: options.id || newId("correction"),
    snapshotId: session.snapshot.snapshotId,
    claimId,
    value,
    reason,
    createdAt: options.createdAt || nowFrom(sessionClock(session)),
    effect: options.effect === "new_snapshot_required" ? "new_snapshot_required" : "feedback_only",
    evidenceSnapshotIds: [session.snapshot.snapshotId],
  });
  const next = forkSession(session);
  next.corrections = [...next.corrections, record];
  return next;
}

export function beginRevision(session, options = {}) {
  invariantSession(session);
  invariant(session.snapshot, "Revision requires an existing frozen snapshot");
  let child = createSession({
    route: session.route,
    voice: session.voice,
    personal: session.personal,
    clock: options.clock || sessionClock(session),
    parentSessionId: session.sessionId,
    revisionOfSnapshotId: session.snapshot.snapshotId,
    priorEvaluation: session.evaluation,
    priorSnapshot: session.snapshot,
    priorExposure: true,
  });
  const profileResponses = session.profileIds.map((id) => session.responses[id]).filter(Boolean);
  for (const response of profileResponses) {
    const replay = { ...response, capturedAt: options.replayAt || nowFrom(sessionClock(child)) };
    child = answerQuestion(child, response.itemId, replay.value, replay);
  }
  if (child.phase === SESSION_PHASES.READY_TO_FREEZE) child.phase = SESSION_PHASES.READY_TO_FREEZE;
  return child;
}

export function serializeSession(session) {
  invariantSession(session);
  return JSON.stringify({
    schemaVersion: session.schemaVersion,
    storageKey: session.storageKey,
    evidenceFrameworkVersion: session.evidenceFrameworkVersion,
    sessionId: session.sessionId,
    attemptId: session.attemptId,
    parentSessionId: session.parentSessionId,
    revisionOfSnapshotId: session.revisionOfSnapshotId,
    route: session.route,
    voice: session.voice,
    personal: session.personal,
    config: session.config,
    bankVersion: session.bankVersion,
    phase: session.phase,
    createdAt: session.createdAt,
    profileIds: session.profileIds,
    heldoutIds: session.heldoutIds,
    responses: session.responses,
    events: session.events,
    exposures: session.exposures,
    corrections: session.corrections,
    predictionCommitment: session.predictionCommitment,
    baselineCommitment: session.baselineCommitment,
    freeze: session.freeze,
    snapshot: session.snapshot,
    projection: session.projection,
    evaluation: session.evaluation,
    exposedAt: session.exposedAt,
    priorEvaluation: session.priorEvaluation,
    priorSnapshot: session.priorSnapshot,
    priorExposure: session.priorExposure === true,
  });
}

function restoreRaw(serialized) {
  const raw = typeof serialized === "string" ? JSON.parse(serialized) : clone(serialized);
  invariant(raw && typeof raw === "object", "Serialized session required");
  invariant(raw.schemaVersion === DOSSIER_SESSION_VERSION && raw.storageKey === DOSSIER_STORAGE_KEY, "Unknown dossier session format");
  invariant(PHASES.has(raw.phase), "Unknown dossier session phase");
  return raw;
}

export function restoreSession(serialized, options = {}) {
  const raw = restoreRaw(serialized);
  const session = createSession({ route: raw.route, voice: raw.voice, personal: raw.personal, sessionId: raw.sessionId, attemptId: raw.attemptId, clock: options.clock });
  invariant(session.bankVersion === raw.bankVersion, "Stale dossier session bank version");
  invariant(same(session.config, raw.config), "Dossier session configuration changed");
  invariant(same(session.profileIds, raw.profileIds) && same(session.heldoutIds, raw.heldoutIds), "Dossier session question partition changed");
  invariant(session.manifest.manifestBinding === raw.freeze?.bankManifestBinding || !raw.freeze || raw.freeze.bankManifestBinding === session.manifest.manifestBinding, "Dossier session manifest changed");
  session.parentSessionId = raw.parentSessionId || null;
  session.revisionOfSnapshotId = raw.revisionOfSnapshotId || null;
  session.priorExposure = raw.priorExposure === true;
  session.phase = raw.phase;
  session.createdAt = raw.createdAt;
  session.responses = clone(raw.responses || {});
  session.answers = session.responses;
  session.exposures = clone(raw.exposures || {});
  session.exposedAt = raw.exposedAt || null;
  session.priorEvaluation = clone(raw.priorEvaluation || null);
  session.priorSnapshot = clone(raw.priorSnapshot || null);
  if (session.priorSnapshot) {
    invariant(session.priorSnapshot.schemaVersion === EVIDENCE_FRAMEWORK_VERSION
      && session.priorSnapshot.bankManifestBinding === session.manifest.manifestBinding
      && session.priorSnapshot.scope?.heldoutExcluded === true
      && typeof session.priorSnapshot.snapshotId === "string", "Malformed prior profile snapshot");
  }
  invariant(typeof session.createdAt === "string" && Number.isFinite(Date.parse(session.createdAt)), "Invalid session creation time");
  const responseEntries = Object.values(session.responses);
  invariant(responseEntries.every((response) => response && typeof response.itemId === "string"), "Malformed stored response");
  invariant(Object.entries(session.responses).every(([key, response]) => key === response.itemId), "Stored response key does not match item ID");
  invariant(new Set(responseEntries.map((response) => response.itemId)).size === responseEntries.length, "Duplicate stored response");
  invariant(responseEntries.every((response) => session.profileIds.includes(response.itemId) || session.heldoutIds.includes(response.itemId)), "Stored response references an unknown question");
  invariant(responseEntries.every((response) => Date.parse(response.capturedAt) >= Date.parse(session.createdAt)), "Stored answer precedes session creation");
  session.events = responseEntries.map((response) => compile(session, response.itemId, response));
  invariant(same(session.events, raw.events || []), "Stored evidence events failed integrity check");
  const frozenArtifacts = [raw.freeze, raw.snapshot, raw.projection, raw.predictionCommitment, raw.baselineCommitment, raw.evaluation, raw.exposedAt]
    .some((artifact) => artifact !== null && artifact !== undefined);
  if ([SESSION_PHASES.PROFILE, SESSION_PHASES.READY_TO_FREEZE].includes(session.phase)) {
    invariant(!frozenArtifacts, "Profile session contains frozen or heldout state");
    invariant(session.events.every((event) => event.phase === "profile"), "Profile session contains heldout evidence");
  }
  if (frozenArtifacts) {
    invariant(raw.freeze && raw.snapshot && raw.projection && raw.predictionCommitment && raw.baselineCommitment, "Frozen session is missing required profile stages");
    const freeze = createFreezeCommitment({
      attemptId: session.attemptId,
      sealedAt: raw.freeze.sealedAt,
      bankManifest: session.manifest,
      profileEvents: session.events.filter((event) => event.phase === "profile"),
      predictionCommitment: raw.predictionCommitment,
      baselineCommitment: raw.baselineCommitment,
    });
    const snapshot = createProfileSnapshot({
      snapshotId: raw.snapshot.snapshotId,
      bankManifest: session.manifest,
      freeze,
      events: session.events.filter((event) => event.phase === "profile"),
      claims: raw.snapshot.claims,
      unknowns: raw.snapshot.unknowns,
      versions: raw.snapshot.versions,
      scope: raw.snapshot.scope,
      createdAt: raw.snapshot.createdAt,
      parentSnapshotId: raw.snapshot.parentSnapshotId,
      correctionRefs: raw.snapshot.correctionRefs,
      blockedClaimIds: raw.snapshot.audit?.blockedClaimIds,
      clauseAudit: raw.snapshot.audit?.clauseAudit,
    });
    invariant(same(snapshot, raw.snapshot), "Stored profile snapshot failed integrity check");
    const projection = projectProductAxes(snapshot);
    invariant(same(projection, raw.projection), "Stored product projection failed integrity check");
    session.freeze = freeze;
    session.predictionCommitment = clone(raw.predictionCommitment);
    session.baselineCommitment = clone(raw.baselineCommitment);
    session.snapshot = snapshot;
    session.projection = projection;
    session.snapshotId = snapshot.snapshotId;
  }
  if (raw.evaluation) {
    invariant(session.snapshot && session.exposedAt, "Heldout evaluation requires frozen exposure");
    invariant(Date.parse(session.exposedAt) > Date.parse(session.freeze.sealedAt), "Heldout exposure must occur after freeze");
    const evaluation = createHeldoutEvaluation(session.snapshot, session.events.filter((event) => event.phase === "heldout"), {
      bankManifest: session.manifest,
      exposedAt: session.exposedAt,
      evaluationId: raw.evaluation.evaluationId,
    });
    invariant(same(evaluation, raw.evaluation), "Stored heldout evaluation failed integrity check");
    session.evaluation = evaluation;
  }
  invariant((raw.corrections || []).every((record) => record && typeof record.id === "string" && typeof record.snapshotId === "string" && typeof record.claimId === "string" && CORRECTION_VALUES.has(record.value) && typeof record.createdAt === "string" && Number.isFinite(Date.parse(record.createdAt))), "Malformed stored correction");
  session.corrections = (raw.corrections || []).map((record) => createCorrectionRecord(record));
  invariant(new Set(session.corrections.map((record) => record.id)).size === session.corrections.length, "Duplicate stored correction IDs");
  invariant(session.corrections.every((record) => record
    && record.snapshotId === session.snapshot?.snapshotId
    && same(record.evidenceSnapshotIds, [session.snapshot.snapshotId])
    && session.snapshot.claims.some((claim) => claim.id === record.claimId)), "Stored correction failed integrity check");
  const profileComplete = session.profileIds.every((id) => Object.hasOwn(session.responses, id));
  const heldoutCount = session.heldoutIds.filter((id) => Object.hasOwn(session.responses, id)).length;
  if (session.phase === SESSION_PHASES.PROFILE) invariant(!profileComplete && heldoutCount === 0, "Profile session stage is inconsistent");
  if (session.phase === SESSION_PHASES.READY_TO_FREEZE) {
    invariant(profileComplete && heldoutCount === 0, "Ready session stage is inconsistent");
    invariant(!session.freeze && !session.snapshot && !session.projection && !session.evaluation, "Ready session contains frozen state");
  }
  if (session.phase === SESSION_PHASES.HELDOUT) {
    invariant(profileComplete && session.snapshot && session.freeze && session.projection, "Heldout session is missing required profile stages");
    invariant(heldoutCount < session.heldoutIds.length && !session.evaluation, "Heldout session stage is inconsistent");
    invariant(heldoutCount === 0 ? !session.exposedAt : !!session.exposedAt, "Heldout exposure timing is inconsistent");
    if (session.exposedAt) {
      invariant(Number.isFinite(Date.parse(session.exposedAt)) && Date.parse(session.exposedAt) > Date.parse(session.freeze.sealedAt), "Heldout exposure must occur after freeze");
      invariant(session.events.filter((event) => event.phase === "heldout").every((event) => Date.parse(event.capturedAt) >= Date.parse(session.exposedAt)), "Heldout answer precedes exposure");
    }
  }
  if (session.phase === SESSION_PHASES.COMPLETE) {
    invariant(profileComplete && heldoutCount === session.heldoutIds.length && session.snapshot && session.evaluation && session.exposedAt, "Complete session is missing required heldout stages");
    invariant(Date.parse(session.exposedAt) > Date.parse(session.freeze.sealedAt), "Heldout exposure must occur after freeze");
  }
  return session;
}

function invariantSession(session) {
  invariant(session && session.schemaVersion === DOSSIER_SESSION_VERSION, "Valid dossier session required");
  invariant(PHASES.has(session.phase), "Invalid dossier session phase");
  invariant(session.storageKey === DOSSIER_STORAGE_KEY, "Invalid dossier session storage key");
  invariant(session.__templates instanceof Map, "Dossier session is not an active runtime session");
}
