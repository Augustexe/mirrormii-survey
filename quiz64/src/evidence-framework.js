export const EVIDENCE_FRAMEWORK_VERSION = "genii-evidence-framework-v1";
export const PROJECTION_VERSION = "genii-product-projection-v1";
export const RESULT_CARD_VERSION = "genii-result-card-v1";

export const COVERAGE = Object.freeze({
  ABSENT: "absent",
  MENTIONED: "mentioned",
  DISCRIMINATIVE_ITEM: "discriminative_item",
  INTERPRETABLE_ANSWER: "interpretable_answer",
  PROSPECTIVELY_TESTED: "prospectively_tested",
});

export const SOURCE_WEIGHTS = Object.freeze({
  observed_action: 1,
  repeated_self_report: 0.9,
  retrospective_self_report: 0.8,
  hypothetical_choice: 0.55,
  stated_preference: 0.45,
  context_fact: 0,
  heldout: 0,
  missingness: 0,
  other_unscored: 0,
});

export const PRODUCT_AXES = Object.freeze([
  {
    id: "activation_tempo",
    label: "Activation tempo",
    left: { id: "pause_prepare", label: "Pause · watch · prepare" },
    right: { id: "move_initiate", label: "Move · test · initiate" },
    claimLimit: "A product projection about response tempo, not Extraversion, impulsivity, confidence, or ability.",
  },
  {
    id: "social_signal_style",
    label: "Social signal style",
    left: { id: "private_indirect", label: "Private · indirect · process" },
    right: { id: "direct_visible", label: "Direct · visible · coordinate" },
    claimLimit: "A product projection about communication choices, not attachment security, sociability, or social skill.",
  },
  {
    id: "friction_posture",
    label: "Friction posture",
    left: { id: "smooth_absorb_wait", label: "Smooth · absorb · wait" },
    right: { id: "name_repair_boundary", label: "Name · repair · boundary" },
    claimLimit: "A product projection about handling friction, not kindness, agreeableness, aggression, or moral worth.",
  },
  {
    id: "structure_reliance",
    label: "Structure reliance",
    left: { id: "improvise_adapt", label: "Improvise · adapt" },
    right: { id: "plan_verify", label: "Plan · sequence · verify" },
    claimLimit: "A product projection about structure use, not Conscientiousness, competence, discipline, or executive function.",
  },
  {
    id: "novelty_aperture",
    label: "Novelty aperture",
    left: { id: "conserve_known", label: "Conserve · simplify · known path" },
    right: { id: "explore_experiment", label: "Explore · reframe · experiment" },
    claimLimit: "A product projection about selected novelty, not a formal Openness score, intelligence, creativity, or culture.",
  },
]);

const AXIS_BY_ID = new Map(PRODUCT_AXES.map((axis) => [axis.id, axis]));
const EXIT_REASONS = new Set([
  "skip",
  "prefer_not",
  "no_example",
  "no_recent_example",
  "not_applicable",
  "unsafe",
  "not_enough_experience",
  "capacity_not_comparable",
  "other_unscored",
  "omitted_by_route",
]);
const SOURCE_STATUSES = new Set(Object.keys(SOURCE_WEIGHTS));
const RESPONSE_FORMATS = new Set(["single_choice", "multi_choice", "likert", "rank", "free_text", "followup"]);
const VIEWS = new Set(["compact", "private_evidence", "genii_identity", "comparison", "share_safe", "internal_debug"]);
const FREEZE_TOKEN = Symbol("genii-freeze-commitment");

function invariant(value, message) {
  if (!value) throw new Error(message);
}

function clone(value) {
  return value === undefined ? undefined : structuredClone(value);
}

function freezeDeep(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freezeDeep(child);
  return Object.freeze(value);
}

function boundedText(value, max = 1600) {
  return typeof value === "string" ? value.slice(0, max) : null;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function valueBinding(prefix, value) {
  const canonical = stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < canonical.length; index += 1) {
    hash ^= canonical.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${prefix}-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function evidenceBinding(events) {
  return valueBinding("binding-v1", [...events].sort((a, b) => a.evidenceId.localeCompare(b.evidenceId)));
}

function contextFingerprint(context = {}) {
  const entries = Object.entries(context)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.length ? JSON.stringify(entries) : "context:unspecified";
}

function sourceWeight(status) {
  return SOURCE_WEIGHTS[status] ?? 0;
}

function normalizePredicate(predicate, itemId, optionId) {
  invariant(predicate && typeof predicate === "object", `Invalid predicate for ${itemId}`);
  invariant(typeof predicate.id === "string" && predicate.id, `Predicate id required for ${itemId}`);
  invariant(typeof predicate.construct === "string" && predicate.construct, `Predicate construct required for ${itemId}`);
  invariant(typeof predicate.claimText === "string" && predicate.claimText, `Predicate claimText required for ${itemId}`);
  invariant(typeof predicate.claimTemplateId === "string" && predicate.claimTemplateId, `Predicate claimTemplateId required for ${itemId}`);
  invariant(Array.isArray(predicate.allowedInferenceKeys) && predicate.allowedInferenceKeys.length > 0, `Predicate allowedInferenceKeys required for ${itemId}`);
  invariant(Array.isArray(predicate.allowedScopeIds) && predicate.allowedScopeIds.length > 0, `Predicate allowedScopeIds required for ${itemId}`);
  const output = {
    id: predicate.id,
    kind: predicate.kind || "evidence",
    domain: predicate.domain || "product_projection",
    construct: predicate.construct,
    value: predicate.value ?? null,
    claimText: boundedText(predicate.claimText, 480),
    claimTemplateId: predicate.claimTemplateId,
    allowedInferenceKeys: unique(predicate.allowedInferenceKeys),
    allowedScopeIds: unique(predicate.allowedScopeIds),
    polarity: predicate.polarity || "supports",
    strength: Number.isFinite(predicate.strength) ? Math.max(0, Math.min(1, predicate.strength)) : 1,
    axisId: predicate.axisId || null,
    direction: predicate.direction || null,
    itemId,
    optionId,
    claimLimits: unique(predicate.claimLimits || []),
    excludesClaims: unique(predicate.excludesClaims || []),
  };
  if (output.axisId) {
    invariant(AXIS_BY_ID.has(output.axisId), `Unknown product axis: ${output.axisId}`);
    invariant(output.direction === "left" || output.direction === "right", `Axis predicate direction required for ${output.id}`);
  }
  return output;
}

/**
 * Defines a question as an adapter into the stable evidence contract. The UI may
 * render the question however it wants; only this semantic template controls
 * evidence output.
 */
export function defineQuestionTemplate(input) {
  invariant(input && typeof input === "object", "Question template required");
  invariant(typeof input.itemId === "string" && input.itemId, "itemId required");
  invariant(typeof input.surveyVersion === "string" && input.surveyVersion, "surveyVersion required");
  invariant(typeof input.bankVersion === "string" && input.bankVersion, "bankVersion required");
  invariant(typeof input.semanticVersion === "string" && input.semanticVersion, "semanticVersion required");
  invariant(typeof input.wordingVersion === "string" && input.wordingVersion, "wordingVersion required");
  invariant(typeof input.mappingVersion === "string" && input.mappingVersion, "mappingVersion required");
  invariant(typeof input.adapterVersion === "string" && input.adapterVersion, "adapterVersion required");
  invariant(RESPONSE_FORMATS.has(input.responseFormat), `Unsupported response format: ${input.responseFormat}`);
  invariant(input.event && typeof input.event.id === "string", "event.id required");
  invariant(SOURCE_STATUSES.has(input.event.sourceStatus), `Unsupported source status: ${input.event.sourceStatus}`);
  const phase = input.event.phase || (input.event.sourceStatus === "heldout" ? "heldout" : "profile");
  invariant(phase === "profile" || phase === "heldout", `Unsupported event phase: ${phase}`);
  invariant(input.event.sourceStatus !== "heldout" || phase === "heldout", "Held-out source status requires heldout phase");
  invariant(phase !== "heldout" || input.event.sourceStatus === "heldout", "Heldout phase requires held-out source status");

  const options = (input.options || []).map((option) => {
    invariant(typeof option.id === "string" && option.id, `Option id required for ${input.itemId}`);
    invariant(typeof option.text === "string" && option.text, `Option text required for ${input.itemId}:${option.id}`);
    return {
      id: option.id,
      text: option.text,
      neutralMeaning: boundedText(option.neutralMeaning || option.text),
      predicates: (option.predicates || []).map((predicate) => normalizePredicate(predicate, input.itemId, option.id)),
      claimLimits: unique(option.claimLimits || []),
    };
  });
  invariant(new Set(options.map((option) => option.id)).size === options.length, `Duplicate option id in ${input.itemId}`);

  const exits = (input.exits || []).map((exit) => {
    invariant(typeof exit.id === "string" && exit.id, `Exit id required for ${input.itemId}`);
    invariant(EXIT_REASONS.has(exit.reason), `Unsupported missingness reason: ${exit.reason}`);
    return { id: exit.id, text: exit.text || exit.id, reason: exit.reason };
  });

  const eligibleAxes = unique(input.eligibleAxes || []);
  for (const axisId of eligibleAxes) invariant(AXIS_BY_ID.has(axisId), `Unknown eligible axis: ${axisId}`);
  const contextSchema = clone(input.contextSchema || {});
  for (const [key, values] of Object.entries(contextSchema)) {
    invariant(Array.isArray(values) && values.length > 0 && values.every((value) => typeof value === "string"), `Context schema ${key} requires allowed string values`);
  }
  const authoredContext = clone(input.authoredContext || {});
  invariant(Object.keys(authoredContext).every((key) => Object.hasOwn(contextSchema, key)), `Authored context keys must exist in the context schema for ${input.itemId}`);
  invariant(Object.entries(authoredContext).every(([key, value]) => contextSchema[key].includes(value)), `Authored context contains an invalid value for ${input.itemId}`);
  const projectionContextKeys = unique(input.projectionContextKeys || []);
  invariant(projectionContextKeys.every((key) => Object.hasOwn(contextSchema, key)), `Projection context keys must exist in the context schema for ${input.itemId}`);
  const rankWeights = input.responseFormat === "rank" ? input.rankWeights : null;
  if (input.responseFormat === "rank") {
    invariant(Array.isArray(rankWeights) && rankWeights.length === options.length, `Rank template ${input.itemId} requires one weight per option`);
    invariant(rankWeights.every((weight, index) => Number.isFinite(weight) && weight >= 0 && (index === 0 || weight <= rankWeights[index - 1])), `Rank weights for ${input.itemId} must be finite, non-negative and descending`);
  }
  for (const option of options) {
    for (const predicate of option.predicates) {
      invariant(!predicate.axisId || eligibleAxes.includes(predicate.axisId), `Predicate axis ${predicate.axisId} is not eligible for ${input.itemId}`);
    }
  }

  const template = {
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    itemId: input.itemId,
    surveyVersion: input.surveyVersion,
    bankVersion: input.bankVersion,
    semanticVersion: input.semanticVersion,
    wordingVersion: input.wordingVersion,
    mappingVersion: input.mappingVersion,
    adapterVersion: input.adapterVersion,
    responseFormat: input.responseFormat,
    construct: input.construct || null,
    prompt: boundedText(input.prompt),
    referencePeriod: input.referencePeriod || "unspecified",
    event: {
      id: input.event.id,
      kind: input.event.kind || "scenario",
      phase,
      sourceStatus: input.event.sourceStatus,
      target: clone(input.event.target || null),
      timeframe: clone(input.event.timeframe || null),
      claimLimits: unique(input.event.claimLimits || []),
      notEvidenceFor: unique(input.event.notEvidenceFor || []),
    },
    eligibleAxes,
    contextSchema,
    authoredContext,
    projectionContextKeys,
    rankWeights: rankWeights ? [...rankWeights] : null,
    options,
    exits,
  };
  template.templateBinding = valueBinding("question-template-v1", template);
  return freezeDeep(template);
}

export function createBankManifest(templates, options = {}) {
  invariant(Array.isArray(templates) && templates.length > 0, "At least one question template is required");
  invariant(templates.every((template) => template?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION && template.templateBinding), "Valid question templates required");
  invariant(new Set(templates.map((template) => template.itemId)).size === templates.length, "Bank manifest contains duplicate item IDs");
  const bankVersions = unique(templates.map((template) => template.bankVersion));
  invariant(bankVersions.length === 1, "Bank manifest mixes bank versions");
  const publicAxisIds = unique(options.publicAxisIds || []);
  invariant(publicAxisIds.every((axisId) => AXIS_BY_ID.has(axisId)), "Bank manifest contains an unknown public axis");
  const authoredClaimTemplateIds = new Set(templates.flatMap((template) => template.options.flatMap((option) => option.predicates.map((predicate) => predicate.claimTemplateId))));
  const publicClaimTemplateIds = unique(options.publicClaimTemplateIds || []);
  invariant(publicClaimTemplateIds.every((id) => authoredClaimTemplateIds.has(id)), "Bank manifest contains an unknown public claim template");
  const items = Object.fromEntries([...templates]
    .sort((a, b) => a.itemId.localeCompare(b.itemId))
    .map((template) => [template.itemId, {
      templateBinding: template.templateBinding,
      eventId: template.event.id,
      eventDefinition: clone(template.event),
      phase: template.event.phase,
      sourceStatus: template.event.sourceStatus,
      surveyVersion: template.surveyVersion,
      bankVersion: template.bankVersion,
      semanticVersion: template.semanticVersion,
      wordingVersion: template.wordingVersion,
      mappingVersion: template.mappingVersion,
      adapterVersion: template.adapterVersion,
      responseFormat: template.responseFormat,
      rankWeights: clone(template.rankWeights),
      eligibleAxes: [...template.eligibleAxes],
      contextSchema: clone(template.contextSchema),
      authoredContext: clone(template.authoredContext),
      projectionContextKeys: [...template.projectionContextKeys],
      options: clone(template.options),
      exits: clone(template.exits),
    }]));
  const manifest = {
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    bankVersion: bankVersions[0],
    publicAxisIds,
    publicClaimTemplateIds,
    items,
  };
  manifest.manifestBinding = valueBinding("bank-manifest-v1", manifest);
  return freezeDeep(manifest);
}

/** Compiles any supported question format into one normalized EvidenceEvent. */
export function compileResponse(template, response) {
  invariant(template?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Unknown question-template version");
  invariant(response && typeof response === "object", "Response required");
  invariant(typeof response.attemptId === "string" && response.attemptId, "attemptId required");
  invariant(typeof response.capturedAt === "string" && Number.isFinite(Date.parse(response.capturedAt)), "Valid capturedAt required");
  const pinnedVersions = {
    surveyVersion: template.surveyVersion,
    questionBankVersion: template.bankVersion,
    mappingVersion: template.mappingVersion,
  };
  for (const [key, expected] of Object.entries(pinnedVersions)) {
    if (response[key] !== undefined) invariant(response[key] === expected, `${key} cannot override the question template`);
  }
  if (response.phase !== undefined) invariant(response.phase === template.event.phase, "Response phase cannot override the question template");
  invariant(response.sourceUnitId === undefined && response.eventInstanceId === undefined && response.occurrenceId === undefined, "Source-unit identity is derived, not caller-assigned");
  invariant(response.contextKey === undefined, "Projection context identity is derived, not caller-assigned");
  const eventInstanceId = `${response.attemptId}:${template.event.id}`;
  const responseContext = clone(response.context || {});
  invariant(Object.keys(responseContext).every((key) => Object.hasOwn(template.contextSchema, key)), `Response contains undeclared context for ${template.itemId}`);
  invariant(Object.entries(responseContext).every(([key, value]) => template.contextSchema[key].includes(value)), `Response contains invalid context value for ${template.itemId}`);
  invariant(Object.keys(responseContext).every((key) => !Object.hasOwn(template.authoredContext || {}, key)), `Response cannot override authored context for ${template.itemId}`);
  const context = { ...clone(template.authoredContext || {}), ...responseContext };
  const projectionContext = Object.fromEntries(template.projectionContextKeys
    .filter((key) => context[key] !== undefined)
    .map((key) => [key, context[key]]));
  const selectedIds = Array.isArray(response.value) ? response.value : [response.value];
  invariant(selectedIds.length > 0 && selectedIds.every((value) => typeof value === "string"), "Response value must contain option ids");
  if (template.responseFormat !== "multi_choice" && template.responseFormat !== "rank") {
    invariant(selectedIds.length === 1, `${template.responseFormat} accepts one option`);
  }

  const selectedExit = template.exits.find((exit) => selectedIds.includes(exit.id));
  if (selectedExit) {
    invariant(selectedIds.length === 1, "Missingness exits cannot be combined with scored options");
    return freezeDeep({
      schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
      evidenceId: `${response.attemptId}:${template.itemId}:${selectedExit.id}`,
      attemptId: response.attemptId,
      capturedAt: response.capturedAt,
      templateBinding: template.templateBinding,
      eventId: template.event.id,
      eventInstanceId,
      sourceUnitId: eventInstanceId,
      phase: template.event.phase,
      plannedSourceStatus: template.event.sourceStatus,
      eventKind: "missing",
      itemId: template.itemId,
      optionIds: [selectedExit.id],
      answerTextSnapshot: selectedExit.text,
      literalObservation: selectedExit.text,
      surveyVersion: template.surveyVersion,
      questionBankVersion: template.bankVersion,
      semanticVersion: template.semanticVersion,
      wordingVersion: template.wordingVersion,
      mappingVersion: template.mappingVersion,
      adapterVersion: template.adapterVersion,
      sourceStatus: template.event.phase === "heldout"
        ? "heldout"
        : selectedExit.reason === "other_unscored" ? "other_unscored" : "missingness",
      responseFormat: template.responseFormat,
      target: clone(response.target || template.event.target),
      timeframe: clone(response.timeframe || template.event.timeframe),
      context,
      projectionContext,
      contextKey: contextFingerprint(projectionContext),
      eligibleAxes: [...template.eligibleAxes],
      predicates: [],
      missingness: {
        reason: selectedExit.reason,
        freeTextRetained: selectedExit.reason === "other_unscored" && typeof response.otherText === "string",
      },
      privateFreeText: selectedExit.reason === "other_unscored" ? boundedText(response.otherText, 1200) : null,
      claimLimits: [...template.event.claimLimits],
      notEvidenceFor: [...template.event.notEvidenceFor],
    });
  }

  const selected = selectedIds.map((id) => template.options.find((option) => option.id === id));
  invariant(selected.every(Boolean), `Invalid option for ${template.itemId}`);
  if (template.responseFormat === "rank") invariant(new Set(selectedIds).size === selectedIds.length, "Ranked options must be unique");

  const predicates = selected.flatMap((option, rankIndex) => option.predicates.map((predicate) => ({
    ...clone(predicate),
    strength: template.responseFormat === "rank"
      ? predicate.strength * template.rankWeights[rankIndex]
      : predicate.strength,
    responseRank: template.responseFormat === "rank" ? rankIndex + 1 : null,
  })));
  return freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    evidenceId: `${response.attemptId}:${template.itemId}:${selectedIds.join("+")}`,
    attemptId: response.attemptId,
    capturedAt: response.capturedAt,
    templateBinding: template.templateBinding,
    eventId: template.event.id,
    eventInstanceId,
    sourceUnitId: eventInstanceId,
    phase: template.event.phase,
    plannedSourceStatus: template.event.sourceStatus,
    eventKind: template.event.kind,
    itemId: template.itemId,
    optionIds: selectedIds,
    answerTextSnapshot: selected.map((option) => option.text).join("; "),
    literalObservation: selected.map((option) => option.neutralMeaning).join("; "),
    surveyVersion: template.surveyVersion,
    questionBankVersion: template.bankVersion,
    semanticVersion: template.semanticVersion,
    wordingVersion: template.wordingVersion,
    mappingVersion: template.mappingVersion,
    adapterVersion: template.adapterVersion,
    sourceStatus: template.event.sourceStatus,
    responseFormat: template.responseFormat,
    target: clone(response.target || template.event.target),
    timeframe: clone(response.timeframe || template.event.timeframe),
    context,
    projectionContext,
    contextKey: contextFingerprint(projectionContext),
    eligibleAxes: [...template.eligibleAxes],
    predicates,
    missingness: null,
    privateFreeText: null,
    claimLimits: unique([...template.event.claimLimits, ...selected.flatMap((option) => option.claimLimits)]),
    notEvidenceFor: [...template.event.notEvidenceFor],
  });
}

/** Adapts existing V4 observation rows into the stable event contract. */
export function adaptObservationRows(rows, options = {}) {
  const attemptId = options.attemptId || "legacy-attempt";
  return (rows || []).map((row) => freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    evidenceId: `${attemptId}:${row.id || `${row.questionId}:${row.optionId}`}`,
    attemptId,
    capturedAt: row.capturedAt || options.capturedAt || null,
    templateBinding: options.templateBindings?.[row.questionId] || null,
    eventId: row.linkedEventId && row.linkedEventId !== "not_applicable" ? row.linkedEventId : row.questionId,
    eventInstanceId: `${attemptId}:${row.linkedEventId && row.linkedEventId !== "not_applicable" ? row.linkedEventId : row.questionId}`,
    sourceUnitId: `${attemptId}:${row.linkedEventId && row.linkedEventId !== "not_applicable" ? row.linkedEventId : row.questionId}`,
    phase: row.role === "heldout" ? "heldout" : "profile",
    plannedSourceStatus: row.role === "heldout" ? "heldout"
      : row.role === "actual_event" ? "retrospective_self_report"
        : row.role === "self_report" || row.role === "direct_preference" ? "stated_preference" : "hypothetical_choice",
    eventKind: row.kind === "missingness" ? "missing" : row.role === "actual_event" ? "actual_event" : "scenario",
    itemId: row.questionId,
    optionIds: row.optionId ? [row.optionId] : [],
    answerTextSnapshot: row.answer || null,
    literalObservation: row.literalObservation || row.answer || null,
    surveyVersion: row.version || options.surveyVersion || "legacy",
    questionBankVersion: row.bankVersion || options.questionBankVersion || "legacy",
    semanticVersion: row.mappingVersion || options.mappingVersion || "legacy",
    wordingVersion: row.wordingVersion || options.wordingVersion || "legacy",
    mappingVersion: row.mappingVersion || options.mappingVersion || "legacy",
    adapterVersion: "v4-observation-adapter-v1",
    sourceStatus: row.role === "heldout" ? "heldout"
      : row.kind === "missingness"
        ? row.missingness === "other" || row.missingness === "other_unscored" ? "other_unscored" : "missingness"
        : row.role === "actual_event" ? "retrospective_self_report"
          : row.role === "self_report" || row.role === "direct_preference" ? "stated_preference" : "hypothetical_choice",
    responseFormat: "single_choice",
    target: row.target || null,
    timeframe: row.time || row.window || null,
    context: clone(row.context || {}),
    projectionContext: {},
    contextKey: "context:unspecified",
    eligibleAxes: [],
    predicates: [],
    missingness: row.kind === "missingness" ? { reason: row.missingness || "skip", freeTextRetained: false } : null,
    privateFreeText: null,
    claimLimits: unique([row.claimLimit].filter(Boolean)),
    notEvidenceFor: unique(row.unsupportedInferences || []),
  }));
}

function axisUnitContribution(axisId, unitEvents) {
  const inputs = unitEvents.flatMap((event) => (event.predicates || [])
    .filter((predicate) => predicate.axisId === axisId)
    .map((predicate) => ({ predicate, sourceStatus: event.sourceStatus, weight: sourceWeight(event.sourceStatus) })))
    .filter((input) => input.weight > 0);
  if (!inputs.length) return null;
  const denominator = inputs.reduce((sum, input) => sum + input.weight * (input.predicate.strength ?? 1), 0);
  const numerator = inputs.reduce((sum, input) => sum
    + input.weight * (input.predicate.direction === "right" ? 1 : -1) * (input.predicate.strength ?? 1), 0);
  const signed = denominator ? numerator / denominator : 0;
  return {
    sourceUnitId: unitEvents[0].sourceUnitId,
    signed: Math.max(-1, Math.min(1, signed)),
    weight: Math.max(...inputs.map((input) => input.weight)),
    sourceStatuses: unique(inputs.map((input) => input.sourceStatus)),
    evidenceIds: unique(unitEvents.map((event) => event.evidenceId)),
    contexts: unique(unitEvents.map((event) => event.contextKey)),
    itemIds: unique(unitEvents.map((event) => event.itemId)),
  };
}

function supportLevel({ units, absoluteNet, oppositionRatio, allHypothetical, hasCrossContext, hasStrongSource }) {
  if (units < 2) return "unknown";
  if (absoluteNet < 0.2 || oppositionRatio >= 0.35) return "mixed";
  if (allHypothetical || units === 2 || (!hasCrossContext && !hasStrongSource)) return "thin";
  if (units >= 4 && absoluteNet >= 0.75 && oppositionRatio === 0 && (hasCrossContext || hasStrongSource)) return "strongly_supported";
  return "supported";
}

/** Projects a frozen ProfileSnapshot into five stable product axes. */
export function projectProductAxes(snapshot) {
  invariant(snapshot?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Valid ProfileSnapshot required");
  invariant(snapshot.scope?.heldoutExcluded === true, "Projection requires a heldout-excluded snapshot");
  const profileEvents = [...(snapshot.evidenceEvents || []), ...(snapshot.missingnessEvents || [])];
  const axes = PRODUCT_AXES.map((axis) => {
    const eligibleEvents = profileEvents.filter((event) => event.eligibleAxes?.includes(axis.id));
    const eligibleUnits = new Set(eligibleEvents.map((event) => event.sourceUnitId));
    const evidenceEvents = profileEvents.filter((event) => !event.missingness && event.predicates?.some((predicate) => predicate.axisId === axis.id));
    const grouped = new Map();
    for (const event of evidenceEvents) {
      const list = grouped.get(event.sourceUnitId) || [];
      list.push(event);
      grouped.set(event.sourceUnitId, list);
    }
    const contributions = [...grouped.values()]
      .map((unitEvents) => axisUnitContribution(axis.id, unitEvents))
      .filter((unit) => unit && unit.weight > 0 && Math.abs(unit.signed) > 0);
    const denominator = contributions.reduce((sum, unit) => sum + unit.weight * Math.abs(unit.signed), 0);
    const numerator = contributions.reduce((sum, unit) => sum + unit.weight * unit.signed, 0);
    const net = denominator ? numerator / denominator : 0;
    const leadingSign = net > 0 ? 1 : net < 0 ? -1 : 0;
    const opposing = contributions.filter((unit) => leadingSign && Math.sign(unit.signed) && Math.sign(unit.signed) !== leadingSign);
    const opposingWeight = opposing.reduce((sum, unit) => sum + unit.weight * Math.abs(unit.signed), 0);
    const oppositionRatio = denominator ? opposingWeight / denominator : 0;
    const contexts = unique(contributions.flatMap((unit) => unit.contexts).filter((value) => value !== "context:unspecified"));
    const allHypothetical = contributions.length > 0 && contributions.every((unit) => unit.sourceStatuses.every((status) => status === "hypothetical_choice"));
    const hasStrongSource = contributions.some((unit) => unit.sourceStatuses.some((status) => ["observed_action", "repeated_self_report", "retrospective_self_report"].includes(status)));
    const hasCrossContext = contexts.length >= 2;
    const level = supportLevel({
      units: contributions.length,
      absoluteNet: Math.abs(net),
      oppositionRatio,
      allHypothetical,
      hasCrossContext,
      hasStrongSource,
    });
    const direction = level === "unknown" ? "unknown" : level === "mixed" ? "mixed" : net > 0 ? "right" : net < 0 ? "left" : "mixed";
    const coverageRatio = eligibleUnits.size ? contributions.length / eligibleUnits.size : 0;
    return freezeDeep({
      axisId: axis.id,
      label: axis.label,
      endpoints: { left: axis.left, right: axis.right },
      direction,
      supportLevel: level,
      coverage: contributions.length ? COVERAGE.INTERPRETABLE_ANSWER : eligibleUnits.size ? COVERAGE.DISCRIMINATIVE_ITEM : COVERAGE.ABSENT,
      answeredSourceUnits: contributions.length,
      eligibleSourceUnits: eligibleUnits.size,
      coverageRatio,
      supportingEvidenceIds: unique(contributions.filter((unit) => !leadingSign || Math.sign(unit.signed) === leadingSign).flatMap((unit) => unit.evidenceIds)),
      counterevidenceIds: unique(opposing.flatMap((unit) => unit.evidenceIds)),
      contextSplits: hasCrossContext && contributions.some((unit) => Math.sign(unit.signed) !== leadingSign)
        ? contexts
        : [],
      sourceStatuses: unique(contributions.flatMap((unit) => unit.sourceStatuses)),
      claimLimit: axis.claimLimit,
      unknownReason: level === "unknown" ? "Fewer than two independent scored source units." : null,
      nextValidation: level === "mixed"
        ? "Test the same choice while changing one context condition at a time."
        : "Collect another independent example in a different relevant context.",
      debug: {
        numericPosition: Math.round(net * 100),
        denominator,
        oppositionRatio,
        contributions,
      },
    });
  });
  return freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    projectionVersion: snapshot.versions.projectionVersion,
    evidenceFrameworkVersion: snapshot.versions.evidenceFrameworkVersion,
    mappingVersion: snapshot.versions.mappingVersion,
    questionBankVersion: snapshot.versions.questionBankVersion,
    semanticManifestBinding: snapshot.versions.semanticManifestBinding,
    adapterManifestBinding: snapshot.versions.adapterManifestBinding,
    snapshotId: snapshot.snapshotId,
    evidenceBinding: snapshot.evidenceBinding,
    bankManifestBinding: snapshot.bankManifestBinding,
    axes,
    warnings: [
      "These are product projections over collected evidence, not formal personality scores.",
      "Numeric positions are internal diagnostics, not percentages of a person or calibrated probabilities.",
    ],
  });
}

export function createAuditedClaim(input) {
  invariant(input && typeof input === "object", "Claim required");
  invariant(typeof input.id === "string" && input.id, "claim id required");
  invariant(typeof input.canonicalStatement === "string" && input.canonicalStatement, "canonicalStatement required");
  invariant(Array.isArray(input.evidenceIds), "evidenceIds required");
  invariant(input.auditVerdict === "pass" || input.auditVerdict === "blocked", "Explicit auditVerdict required");
  const evidenceIds = unique(input.evidenceIds);
  const supportedPredicateIds = unique(input.supportedPredicateIds || []);
  const inferenceKeys = unique(input.inferenceKeys || []);
  const audit = {
    reviewer: input.audit?.reviewer || null,
    checkedClaimLimits: input.audit?.checkedClaimLimits === true,
    checkedProhibitedInferences: input.audit?.checkedProhibitedInferences === true,
  };
  if (input.auditVerdict === "pass") {
    invariant(evidenceIds.length > 0, `Passing claim ${input.id} requires evidence`);
    invariant(supportedPredicateIds.length > 0, `Passing claim ${input.id} requires supported predicates`);
    invariant(inferenceKeys.length > 0, `Passing claim ${input.id} requires inference keys`);
    invariant(typeof input.scopeId === "string" && input.scopeId, `Passing claim ${input.id} requires a machine-readable scopeId`);
    invariant(typeof input.claimTemplateId === "string" && input.claimTemplateId, `Passing claim ${input.id} requires a claimTemplateId`);
    invariant(audit.reviewer && audit.checkedClaimLimits && audit.checkedProhibitedInferences, `Passing claim ${input.id} requires a complete audit receipt`);
  }
  invariant(input.displayEligibility?.shareSafe !== true || input.publicSafe === true, `Share-safe claim ${input.id} must be publicSafe`);
  return freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    id: input.id,
    domain: input.domain || "synthesis",
    construct: input.construct || "bounded_interpretation",
    claimTemplateId: input.claimTemplateId || null,
    inferenceKeys,
    canonicalStatement: input.canonicalStatement,
    shortStatement: input.shortStatement || input.canonicalStatement,
    scope: input.scope || "collected situations only",
    scopeId: input.scopeId || null,
    evidenceIds,
    supportedPredicateIds,
    counterevidenceIds: unique(input.counterevidenceIds || []),
    alternatives: unique(input.alternatives || []),
    uncertainty: input.uncertainty || "high",
    evidenceStatus: input.evidenceStatus || "limited_evidence",
    nextValidation: input.nextValidation || "Collect another independent example.",
    displayEligibility: {
      compact: input.displayEligibility?.compact === true,
      privateEvidence: input.displayEligibility?.privateEvidence !== false,
      geniiIdentity: input.displayEligibility?.geniiIdentity === true,
      comparison: input.displayEligibility?.comparison === true,
      shareSafe: input.displayEligibility?.shareSafe === true,
    },
    publicSafe: input.publicSafe === true,
    auditVerdict: input.auditVerdict,
    audit,
  });
}

function resolveSnapshotVersion(events, eventKey, supplied, label) {
  const values = unique(events.map((event) => event[eventKey]));
  invariant(values.length <= 1, `Snapshot mixes incompatible ${label} values`);
  const derived = values[0] || supplied;
  invariant(typeof derived === "string" && derived, `${label} required`);
  if (supplied !== undefined) invariant(supplied === derived, `${label} does not match frozen events`);
  return derived;
}

function versionManifest(events, eventKey, label) {
  const byItem = new Map();
  for (const event of events) {
    invariant(typeof event[eventKey] === "string" && event[eventKey], `${label} required for ${event.itemId}`);
    const versions = byItem.get(event.itemId) || new Set();
    versions.add(event[eventKey]);
    byItem.set(event.itemId, versions);
  }
  const manifest = {};
  for (const itemId of [...byItem.keys()].sort()) {
    const values = [...byItem.get(itemId)];
    invariant(values.length === 1, `Item ${itemId} mixes incompatible ${label} values`);
    manifest[itemId] = values[0];
  }
  return freezeDeep(manifest);
}

function validateEventAgainstManifest(event, bankManifest) {
  const item = bankManifest?.items?.[event.itemId];
  invariant(item, `No bank-manifest entry for ${event.itemId}`);
  invariant(event.templateBinding === item.templateBinding, `Template binding mismatch for ${event.itemId}`);
  invariant(event.eventId === item.eventId, `Event identity mismatch for ${event.itemId}`);
  invariant(event.phase === item.phase && event.plannedSourceStatus === item.sourceStatus, `Phase/source mismatch for ${event.itemId}`);
  invariant(event.missingness
    ? (event.phase === "heldout" ? event.sourceStatus === "heldout" : ["missingness", "other_unscored"].includes(event.sourceStatus))
    : event.sourceStatus === item.sourceStatus, `Observed source mismatch for ${event.itemId}`);
  invariant(event.surveyVersion === item.surveyVersion, `Survey version mismatch for ${event.itemId}`);
  invariant(event.questionBankVersion === item.bankVersion, `Bank version mismatch for ${event.itemId}`);
  invariant(event.semanticVersion === item.semanticVersion, `Semantic version mismatch for ${event.itemId}`);
  invariant(event.wordingVersion === item.wordingVersion, `Wording version mismatch for ${event.itemId}`);
  invariant(event.mappingVersion === item.mappingVersion, `Mapping version mismatch for ${event.itemId}`);
  invariant(event.adapterVersion === item.adapterVersion, `Adapter version mismatch for ${event.itemId}`);
  invariant(event.responseFormat === item.responseFormat, `Response format mismatch for ${event.itemId}`);
  invariant(stableStringify(event.eligibleAxes) === stableStringify(item.eligibleAxes), `Axis eligibility mismatch for ${event.itemId}`);
  invariant(event.eventInstanceId === `${event.attemptId}:${item.eventId}` && event.sourceUnitId === event.eventInstanceId, `Source-unit identity mismatch for ${event.itemId}`);
  invariant(Object.keys(event.context || {}).every((key) => Object.hasOwn(item.contextSchema, key)), `Undeclared context for ${event.itemId}`);
  invariant(Object.entries(event.context || {}).every(([key, value]) => item.contextSchema[key].includes(value)), `Invalid context for ${event.itemId}`);
  invariant(Object.entries(item.authoredContext || {}).every(([key, value]) => event.context?.[key] === value), `Authored context mismatch for ${event.itemId}`);
  const projectionContext = Object.fromEntries(item.projectionContextKeys
    .filter((key) => event.context?.[key] !== undefined)
    .map((key) => [key, event.context[key]]));
  invariant(stableStringify(event.projectionContext) === stableStringify(projectionContext) && event.contextKey === contextFingerprint(projectionContext), `Projection context mismatch for ${event.itemId}`);

  invariant(stableStringify(event.notEvidenceFor) === stableStringify(item.eventDefinition.notEvidenceFor), `Inference exclusions mismatch for ${event.itemId}`);
  if (event.missingness) {
    const exit = item.exits.find((candidate) => candidate.id === event.optionIds?.[0]);
    invariant(event.optionIds?.length === 1 && exit && exit.reason === event.missingness.reason, `Missingness mapping mismatch for ${event.itemId}`);
    invariant(event.evidenceId === `${event.attemptId}:${event.itemId}:${exit.id}`, `Evidence identity mismatch for ${event.itemId}`);
    invariant(event.predicates?.length === 0 && event.answerTextSnapshot === exit.text && event.literalObservation === exit.text, `Missingness content mismatch for ${event.itemId}`);
    invariant(stableStringify(event.claimLimits) === stableStringify(item.eventDefinition.claimLimits), `Claim limits mismatch for ${event.itemId}`);
    return;
  }

  const selected = (event.optionIds || []).map((id) => item.options.find((option) => option.id === id));
  invariant(selected.length > 0 && selected.every(Boolean), `Option mapping mismatch for ${event.itemId}`);
  if (item.responseFormat !== "multi_choice" && item.responseFormat !== "rank") invariant(selected.length === 1, `Response cardinality mismatch for ${event.itemId}`);
  if (item.responseFormat === "rank") invariant(new Set(event.optionIds).size === event.optionIds.length, `Rank mapping mismatch for ${event.itemId}`);
  const expectedPredicates = selected.flatMap((option, rankIndex) => option.predicates.map((predicate) => ({
    ...clone(predicate),
    strength: item.responseFormat === "rank" ? predicate.strength * item.rankWeights[rankIndex] : predicate.strength,
    responseRank: item.responseFormat === "rank" ? rankIndex + 1 : null,
  })));
  invariant(stableStringify(event.predicates) === stableStringify(expectedPredicates), `Predicate mapping mismatch for ${event.itemId}`);
  invariant(event.evidenceId === `${event.attemptId}:${event.itemId}:${event.optionIds.join("+")}`, `Evidence identity mismatch for ${event.itemId}`);
  invariant(event.answerTextSnapshot === selected.map((option) => option.text).join("; "), `Answer snapshot mismatch for ${event.itemId}`);
  invariant(event.literalObservation === selected.map((option) => option.neutralMeaning).join("; "), `Literal observation mismatch for ${event.itemId}`);
  invariant(stableStringify(event.claimLimits) === stableStringify(unique([...item.eventDefinition.claimLimits, ...selected.flatMap((option) => option.claimLimits)])), `Claim limits mismatch for ${event.itemId}`);
}

export function createFreezeCommitment(input) {
  invariant(input?.bankManifest?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Freeze requires a bank manifest");
  invariant(typeof input.attemptId === "string" && input.attemptId, "Freeze attemptId required");
  invariant(typeof input.sealedAt === "string" && Number.isFinite(Date.parse(input.sealedAt)), "Valid freeze sealedAt required");
  invariant(input.predictionCommitment && typeof input.predictionCommitment.id === "string", "Prediction commitment required before heldout exposure");
  invariant(input.baselineCommitment && typeof input.baselineCommitment.id === "string", "Baseline commitment required before heldout exposure");
  const profileEvents = input.profileEvents || [];
  invariant(profileEvents.every((event) => event.phase === "profile" && event.attemptId === input.attemptId), "Freeze accepts same-attempt profile events only");
  invariant(profileEvents.every((event) => Number.isFinite(Date.parse(event.capturedAt)) && Date.parse(event.capturedAt) <= Date.parse(input.sealedAt)), "Profile evidence must be captured by the freeze time");
  for (const event of profileEvents) validateEventAgainstManifest(event, input.bankManifest);
  const heldoutItemIds = Object.entries(input.bankManifest.items)
    .filter(([, item]) => item.phase === "heldout")
    .map(([itemId]) => itemId)
    .sort();
  for (const [label, source] of [["prediction", input.predictionCommitment], ["baseline", input.baselineCommitment]]) {
    invariant(Array.isArray(source.entries), `${label} commitment entries required`);
    const itemIds = source.entries.map((entry) => entry.itemId).sort();
    invariant(new Set(itemIds).size === itemIds.length && stableStringify(itemIds) === stableStringify(heldoutItemIds), `${label} commitment must cover the complete heldout set`);
    invariant(source.entries.every((entry) => {
      const item = input.bankManifest.items[entry.itemId];
      const hasOption = typeof entry.optionId === "string";
      const abstains = entry.abstain === true;
      return hasOption !== abstains && (!hasOption || item.options.some((option) => option.id === entry.optionId));
    }), `${label} commitment requires one valid authored option or explicit abstention`);
  }
  const commitment = {
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    attemptId: input.attemptId,
    sealedAt: input.sealedAt,
    bankManifestBinding: input.bankManifest.manifestBinding,
    profileEvidenceBinding: evidenceBinding(profileEvents),
    heldoutItemIds,
    predictionCommitmentId: input.predictionCommitment.id,
    predictionCommitmentBinding: valueBinding("prediction-v1", input.predictionCommitment),
    baselineCommitmentId: input.baselineCommitment.id,
    baselineCommitmentBinding: valueBinding("baseline-v1", input.baselineCommitment),
    heldoutExposureAt: null,
  };
  Object.defineProperty(commitment, FREEZE_TOKEN, { value: true, enumerable: false });
  return freezeDeep(commitment);
}

/** Creates the immutable canonical object before any held-out answer is accepted. */
export function createProfileSnapshot(input) {
  invariant(input && typeof input === "object", "Snapshot input required");
  invariant(typeof input.snapshotId === "string" && input.snapshotId, "snapshotId required");
  invariant(input.bankManifest?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION && input.bankManifest.manifestBinding, "Bank manifest required");
  invariant(input.freeze?.[FREEZE_TOKEN] === true, "Valid in-process freeze commitment required");
  invariant(input.freeze.bankManifestBinding === input.bankManifest.manifestBinding, "Freeze bank manifest mismatch");
  const allEvents = (input.events || []).filter((event) => event?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION);
  invariant(allEvents.length === (input.events || []).length, "Snapshot contains an invalid evidence event");
  invariant(new Set(allEvents.map((event) => event.evidenceId)).size === allEvents.length, "Snapshot contains duplicate evidence IDs");
  invariant(allEvents.every((event) => event.phase === "profile" && event.sourceStatus !== "heldout"), "Heldout events cannot enter a profile snapshot");
  invariant(allEvents.every((event) => event.attemptId === input.freeze.attemptId), "Snapshot mixes attempt IDs");
  for (const event of allEvents) validateEventAgainstManifest(event, input.bankManifest);
  invariant(evidenceBinding(allEvents) === input.freeze.profileEvidenceBinding, "Snapshot evidence differs from the freeze commitment");
  const heldoutItems = input.freeze.heldoutItemIds.map((itemId) => input.bankManifest.items[itemId]);
  invariant(heldoutItems.every((item) => item?.phase === "heldout" && item.sourceStatus === "heldout"), "Freeze heldout set must match the bank manifest");
  const profileEvents = allEvents;
  const evidenceEvents = profileEvents.filter((event) => !event.missingness);
  const missingnessEvents = profileEvents.filter((event) => event.missingness);
  const evidenceIds = new Set(evidenceEvents.map((event) => event.evidenceId));
  invariant((input.claims || []).every((claim) => claim?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION), "Snapshot contains an invalid audited claim");
  invariant(new Set((input.claims || []).map((claim) => claim.id)).size === (input.claims || []).length, "Snapshot contains duplicate claim IDs");
  const claims = (input.claims || []).filter((claim) => claim.auditVerdict === "pass");
  for (const claim of claims) {
    invariant(claim.audit?.reviewer && claim.audit.checkedClaimLimits === true && claim.audit.checkedProhibitedInferences === true, `Claim ${claim.id} lacks a valid audit receipt`);
    invariant(claim.evidenceIds.length > 0 && claim.supportedPredicateIds.length > 0 && claim.inferenceKeys.length > 0 && claim.scopeId && claim.claimTemplateId, `Claim ${claim.id} is incomplete`);
    invariant(claim.evidenceIds.every((id) => evidenceIds.has(id)), `Claim ${claim.id} cites evidence outside this snapshot`);
    invariant(claim.counterevidenceIds.every((id) => evidenceIds.has(id)), `Claim ${claim.id} cites counterevidence outside this snapshot`);
    const citedEvents = evidenceEvents.filter((event) => claim.evidenceIds.includes(event.evidenceId));
    const citedPredicates = citedEvents.flatMap((event) => event.predicates || []);
    const predicateIds = new Set(citedPredicates.map((predicate) => predicate.id));
    invariant(claim.supportedPredicateIds.every((id) => predicateIds.has(id)), `Claim ${claim.id} cites unsupported predicates`);
    const supportingPredicates = citedPredicates.filter((predicate) => claim.supportedPredicateIds.includes(predicate.id));
    invariant(supportingPredicates.every((predicate) => predicate.claimTemplateId === claim.claimTemplateId), `Claim ${claim.id} uses an unauthorized claim template`);
    const approvedClaimTexts = new Set(supportingPredicates.map((predicate) => predicate.claimText));
    invariant(approvedClaimTexts.has(claim.canonicalStatement) && approvedClaimTexts.has(claim.shortStatement), `Claim ${claim.id} uses unapproved statement text`);
    invariant(supportingPredicates.every((predicate) => claim.inferenceKeys.every((key) => predicate.allowedInferenceKeys.includes(key) && !predicate.excludesClaims.includes(key))), `Claim ${claim.id} exceeds predicate inference limits`);
    invariant(supportingPredicates.every((predicate) => predicate.allowedScopeIds.includes(claim.scopeId)), `Claim ${claim.id} exceeds predicate scope limits`);
    const prohibited = new Set(citedEvents.flatMap((event) => event.notEvidenceFor || []));
    invariant(claim.inferenceKeys.every((key) => !prohibited.has(key)), `Claim ${claim.id} makes a prohibited inference`);
  }
  const blockedClaimIds = unique([
    ...(input.blockedClaimIds || []),
    ...(input.claims || []).filter((claim) => claim.auditVerdict !== "pass").map((claim) => claim.id),
  ]);
  const semanticManifest = versionManifest(allEvents, "semanticVersion", "semanticVersion");
  const adapterManifest = versionManifest(allEvents, "adapterVersion", "adapterVersion");
  const versions = {
    surveyVersion: resolveSnapshotVersion(allEvents, "surveyVersion", input.versions?.surveyVersion, "surveyVersion"),
    questionBankVersion: resolveSnapshotVersion(allEvents, "questionBankVersion", input.versions?.questionBankVersion, "questionBankVersion"),
    mappingVersion: resolveSnapshotVersion(allEvents, "mappingVersion", input.versions?.mappingVersion, "mappingVersion"),
    wordingVersion: resolveSnapshotVersion(allEvents, "wordingVersion", input.versions?.wordingVersion, "wordingVersion"),
    semanticManifest,
    semanticManifestBinding: valueBinding("semantic-v1", semanticManifest),
    adapterManifest,
    adapterManifestBinding: valueBinding("adapter-v1", adapterManifest),
    evidenceFrameworkVersion: EVIDENCE_FRAMEWORK_VERSION,
    projectionVersion: input.versions?.projectionVersion || PROJECTION_VERSION,
    resultContractVersion: RESULT_CARD_VERSION,
  };
  invariant(versions.projectionVersion === PROJECTION_VERSION, `Unsupported projection version: ${versions.projectionVersion}`);
  const createdAt = input.createdAt || input.freeze.sealedAt;
  invariant(createdAt === input.freeze.sealedAt, "Snapshot creation must use the freeze seal time");
  return freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    resultContractVersion: RESULT_CARD_VERSION,
    snapshotId: input.snapshotId,
    evidenceBinding: evidenceBinding(profileEvents),
    parentSnapshotId: input.parentSnapshotId || null,
    createdAt,
    frozenAt: createdAt,
    bankManifestBinding: input.bankManifest.manifestBinding,
    publicAxisIds: [...input.bankManifest.publicAxisIds],
    publicClaimTemplateIds: [...input.bankManifest.publicClaimTemplateIds],
    freeze: {
      attemptId: input.freeze.attemptId,
      sealedAt: input.freeze.sealedAt,
      heldoutItemIds: unique(input.freeze.heldoutItemIds),
      predictionCommitmentId: input.freeze.predictionCommitmentId,
      predictionCommitmentBinding: input.freeze.predictionCommitmentBinding,
      baselineCommitmentId: input.freeze.baselineCommitmentId,
      baselineCommitmentBinding: input.freeze.baselineCommitmentBinding,
      heldoutExposureAt: null,
    },
    versions,
    scope: {
      locale: input.scope?.locale || "en",
      optInScope: unique(input.scope?.optInScope || []),
      excludedUses: unique(input.scope?.excludedUses || ["diagnosis", "formal_trait_scores", "hidden_sensitive_inference"]),
      profileCutoff: input.scope?.profileCutoff || createdAt,
      heldoutExcluded: true,
    },
    evidenceEvents,
    missingnessEvents,
    claims,
    unknowns: unique(input.unknowns || []),
    audit: {
      qepSeparated: true,
      blockedClaimIds,
      heldoutItemIds: unique(input.freeze.heldoutItemIds),
      clauseAudit: clone(input.clauseAudit || []),
    },
    correctionRefs: unique(input.correctionRefs || []),
  });
}

export function createHeldoutEvaluation(snapshot, heldoutEvents, input) {
  invariant(snapshot?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Valid ProfileSnapshot required");
  invariant(input?.bankManifest?.manifestBinding === snapshot.bankManifestBinding, "Evaluation bank manifest does not match snapshot");
  invariant(typeof input.exposedAt === "string" && Date.parse(input.exposedAt) > Date.parse(snapshot.frozenAt), "Heldout exposure must occur after freeze");
  invariant(Array.isArray(heldoutEvents), "Heldout events required");
  invariant(new Set(heldoutEvents.map((event) => event.evidenceId)).size === heldoutEvents.length, "Duplicate heldout evidence IDs");
  invariant(new Set(heldoutEvents.map((event) => event.itemId)).size === heldoutEvents.length, "Duplicate heldout item IDs");
  for (const event of heldoutEvents) {
    invariant(event?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Invalid heldout event");
    invariant(event.attemptId === snapshot.freeze.attemptId, "Heldout event belongs to another attempt");
    invariant(event.phase === "heldout" && event.sourceStatus === "heldout", "Evaluation accepts heldout events only");
    invariant(Number.isFinite(Date.parse(event.capturedAt)) && Date.parse(event.capturedAt) >= Date.parse(input.exposedAt), "Heldout answer must be captured after exposure");
    invariant(snapshot.freeze.heldoutItemIds.includes(event.itemId), `Unexpected heldout item ${event.itemId}`);
    validateEventAgainstManifest(event, input.bankManifest);
  }
  return freezeDeep({
    schemaVersion: EVIDENCE_FRAMEWORK_VERSION,
    evaluationId: input.evaluationId || `${snapshot.snapshotId}:heldout`,
    snapshotId: snapshot.snapshotId,
    evidenceBinding: snapshot.evidenceBinding,
    predictionCommitmentId: snapshot.freeze.predictionCommitmentId,
    baselineCommitmentId: snapshot.freeze.baselineCommitmentId,
    exposedAt: input.exposedAt,
    heldoutEvents: [...heldoutEvents],
    evaluationBinding: evidenceBinding(heldoutEvents),
  });
}

export function createCorrectionRecord(input) {
  invariant(typeof input?.id === "string" && input.id, "correction id required");
  invariant(typeof input.snapshotId === "string" && input.snapshotId, "snapshotId required");
  invariant(typeof input.claimId === "string" && input.claimId, "claimId required");
  invariant(["accurate", "partly_accurate", "inaccurate", "prefer_not_to_say"].includes(input.value), "Invalid correction value");
  return freezeDeep({
    id: input.id,
    snapshotId: input.snapshotId,
    claimId: input.claimId,
    value: input.value,
    reason: boundedText(input.reason, 1200),
    createdAt: input.createdAt || new Date().toISOString(),
    effect: input.effect === "new_snapshot_required" ? "new_snapshot_required" : "feedback_only",
    evidenceSnapshotIds: unique(input.evidenceSnapshotIds || []),
  });
}

export function canCompareProjections(left, right, migration = null) {
  const compatible = !!left?.projectionVersion
    && left.projectionVersion === right?.projectionVersion
    && left.evidenceFrameworkVersion === right?.evidenceFrameworkVersion
    && left.mappingVersion === right?.mappingVersion
    && left.questionBankVersion === right?.questionBankVersion
    && left.semanticManifestBinding === right?.semanticManifestBinding
    && left.adapterManifestBinding === right?.adapterManifestBinding
    && left.bankManifestBinding === right?.bankManifestBinding;
  if (compatible) return true;
  return migration?.approved === true
    && migration.fromEvidenceFrameworkVersion === left?.evidenceFrameworkVersion
    && migration.toEvidenceFrameworkVersion === right?.evidenceFrameworkVersion
    && migration.fromProjectionVersion === left?.projectionVersion
    && migration.toProjectionVersion === right?.projectionVersion
    && migration.fromMappingVersion === left?.mappingVersion
    && migration.toMappingVersion === right?.mappingVersion
    && migration.fromSemanticManifestBinding === left?.semanticManifestBinding
    && migration.toSemanticManifestBinding === right?.semanticManifestBinding
    && migration.fromAdapterManifestBinding === left?.adapterManifestBinding
    && migration.toAdapterManifestBinding === right?.adapterManifestBinding
    && migration.fromBankManifestBinding === left?.bankManifestBinding
    && migration.toBankManifestBinding === right?.bankManifestBinding;
}

/** Builds a renderer-safe contract. It does not generate new evidence or claims. */
export function createResultCard(snapshot, projection, options = {}) {
  invariant(snapshot?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Valid ProfileSnapshot required");
  invariant(projection?.schemaVersion === EVIDENCE_FRAMEWORK_VERSION, "Valid ProductProjection required");
  invariant(projection.snapshotId === snapshot.snapshotId, "Projection and snapshot must match");
  invariant(projection.evidenceBinding === snapshot.evidenceBinding, "Projection evidence does not match snapshot");
  invariant(projection.bankManifestBinding === snapshot.bankManifestBinding, "Projection bank manifest does not match snapshot");
  invariant(projection.projectionVersion === snapshot.versions.projectionVersion, "Projection version does not match snapshot");
  invariant(projection.evidenceFrameworkVersion === snapshot.versions.evidenceFrameworkVersion, "Evidence framework version does not match snapshot");
  invariant(projection.mappingVersion === snapshot.versions.mappingVersion, "Mapping version does not match snapshot");
  invariant(projection.questionBankVersion === snapshot.versions.questionBankVersion, "Question-bank version does not match snapshot");
  invariant(projection.semanticManifestBinding === snapshot.versions.semanticManifestBinding, "Semantic-version manifest does not match snapshot");
  invariant(projection.adapterManifestBinding === snapshot.versions.adapterManifestBinding, "Adapter-version manifest does not match snapshot");
  const view = options.view || "compact";
  invariant(VIEWS.has(view), `Unsupported result-card view: ${view}`);
  const matchingCorrections = (options.corrections || []).filter((record) => record.snapshotId === snapshot.snapshotId);
  invariant(matchingCorrections.every((record) => snapshot.claims.some((claim) => claim.id === record.claimId)), "Correction cites a claim outside this snapshot");
  const corrections = view === "share_safe" ? [] : matchingCorrections;
  const allowedClaims = snapshot.claims.filter((claim) => {
    if (view === "private_evidence" || view === "internal_debug") return claim.displayEligibility.privateEvidence;
    if (view === "genii_identity") return claim.displayEligibility.geniiIdentity;
    if (view === "comparison") return claim.displayEligibility.comparison;
    if (view === "share_safe") return claim.displayEligibility.shareSafe
      && claim.publicSafe
      && snapshot.publicClaimTemplateIds.includes(claim.claimTemplateId);
    return claim.displayEligibility.compact;
  });
  const publicAxisIds = new Set(snapshot.publicAxisIds || []);
  const selectedAxes = projection.axes
    .filter((axis) => axis.supportLevel !== "unknown")
    .filter((axis) => view !== "share_safe" || publicAxisIds.has(axis.axisId))
    .sort((a, b) => {
      const order = { strongly_supported: 4, supported: 3, mixed: 2, thin: 1, unknown: 0 };
      return order[b.supportLevel] - order[a.supportLevel] || b.answeredSourceUnits - a.answeredSourceUnits;
    })
    .slice(0, view === "compact" || view === "genii_identity" || view === "share_safe" ? 4 : projection.axes.length);
  const selectedClaimIds = allowedClaims.map((claim) => claim.id);
  const evidenceIds = unique(allowedClaims.flatMap((claim) => claim.evidenceIds));
  const privateView = view === "private_evidence" || view === "internal_debug";
  const identityInput = options.identity || null;
  let identity = null;
  if (identityInput) {
    const labelClaim = allowedClaims.find((claim) => claim.id === identityInput.labelClaimId);
    const hookClaim = allowedClaims.find((claim) => claim.id === identityInput.hookClaimId);
    const axisIds = unique(identityInput.axisIds || []);
    invariant(labelClaim && hookClaim, "Identity text must come from claims available in this view");
    invariant(axisIds.every((id) => selectedAxes.some((axis) => axis.axisId === id)), "Identity cites an axis unavailable in this view");
    if (view === "share_safe") invariant(identityInput.publicSafe === true, "Share-safe identity must be explicitly allowlisted");
    identity = freezeDeep({
      label: boundedText(labelClaim.shortStatement, 120),
      hook: boundedText(hookClaim.shortStatement, 320),
      claimIds: unique([labelClaim.id, hookClaim.id]),
      axisIds,
      provisional: true,
      publicSafe: identityInput.publicSafe === true,
    });
  }
  return freezeDeep({
    schemaVersion: RESULT_CARD_VERSION,
    cardId: options.cardId || `${snapshot.snapshotId}:${view}`,
    snapshotId: snapshot.snapshotId,
    projectionVersion: projection.projectionVersion,
    resultContractVersion: RESULT_CARD_VERSION,
    view,
    privacyLevel: view === "share_safe" ? "public_safe" : view === "internal_debug" ? "internal_debug" : "private_answers",
    provisional: true,
    identity,
    selectedClaimIds,
    selectedAxisIds: selectedAxes.map((axis) => axis.axisId),
    axes: selectedAxes.map((axis) => {
      const safe = {
        axisId: axis.axisId,
        label: axis.label,
        endpoints: axis.endpoints,
        direction: axis.direction,
        supportLevel: axis.supportLevel,
        coverage: axis.coverage,
        answeredSourceUnits: axis.answeredSourceUnits,
        eligibleSourceUnits: axis.eligibleSourceUnits,
        contextSplits: view === "share_safe" ? [] : axis.contextSplits,
        claimLimit: axis.claimLimit,
        nextValidation: axis.nextValidation,
      };
      return privateView ? { ...safe, evidenceIds: axis.supportingEvidenceIds, counterevidenceIds: axis.counterevidenceIds, debug: view === "internal_debug" ? axis.debug : undefined } : safe;
    }),
    claims: allowedClaims.map((claim) => view === "share_safe"
      ? { id: claim.id, text: claim.shortStatement }
      : {
        id: claim.id,
        text: claim.shortStatement,
        scope: claim.scope,
        uncertainty: claim.uncertainty,
        alternatives: privateView ? claim.alternatives : [],
        nextValidation: claim.nextValidation,
        evidenceIds: privateView ? claim.evidenceIds : [],
        counterevidenceIds: privateView ? claim.counterevidenceIds : [],
      }),
    receipts: privateView
      ? snapshot.evidenceEvents.filter((event) => evidenceIds.includes(event.evidenceId)).map((event) => ({
        evidenceId: event.evidenceId,
        itemId: event.itemId,
        optionIds: event.optionIds,
        answerTextSnapshot: event.answerTextSnapshot,
        literalObservation: event.literalObservation,
        sourceStatus: event.sourceStatus,
        context: event.context,
        timeframe: event.timeframe,
        claimLimits: event.claimLimits,
      }))
      : [],
    unknowns: view === "share_safe" ? [] : snapshot.unknowns,
    missingness: privateView ? snapshot.missingnessEvents.map((event) => ({ evidenceId: event.evidenceId, itemId: event.itemId, reason: event.missingness.reason })) : [],
    corrections,
    rendererRules: {
      mayChangeLayout: true,
      mayChangeTone: false,
      maySelectApprovedToneVariant: true,
      mayParaphraseApprovedText: false,
      mayCreateNewInference: false,
      mayShowNumericDebugAsPersonalityPercentage: false,
      mustPreserveSnapshotId: true,
    },
  });
}
