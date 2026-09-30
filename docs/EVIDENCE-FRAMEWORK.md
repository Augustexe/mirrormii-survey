> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Genii evidence framework

Version `genii-evidence-framework-v1` · 2026-09-21  
Status: **implemented and live in the 2026-09-23 build; product-axis wording and question mappings remain unvalidated pending human testing**

This is the maintained contract for turning replaceable questions into stable evidence, projections and result cards. It supersedes treating question tags, generated prose or an archetype as the source of truth. It does not replace the active question bank by itself.

## Core decision

Questions are adapters. Evidence is the product substrate.

```text
Response
  → QuestionTemplate / adapter
  → EvidenceEvent
  → Predicate
  → AuditedClaim
  → immutable ProfileSnapshot
  → ProductProjection
  → ResultCard
  → any renderer

ProfileSnapshot + committed prediction/baseline
  → held-out exposure
  → HeldoutEvaluation
```

The same frozen snapshot may produce a compact card, private evidence report, playful Genii identity, comparison view, public-safe projection or future format. A renderer may alter composition and select an approved tone variant; it may not paraphrase approved claim text or create a new fact or inference.

This adopts the useful product shape of 16Personalities, stable axes and memorable compression, without importing its opaque scorer, MBTI-like authority, global trait claims or unexplained percentages.

## Q, E and P remain separate

- **Q, question quality:** whether an item is aligned, discriminative, context-aware, answerable and worth its burden. Internal authoring evaluation only.
- **E, evidence support:** what the collected responses can support, with exact source units, context, counterevidence, limits and unknowns.
- **P, prospective performance:** exact held-out prediction after freeze, reported against a preregistered baseline with coverage and abstention.

They are never added, averaged or multiplied into a personality-accuracy score. P never becomes E for the frozen result.

## Canonical ontology

### QuestionTemplate

A versioned semantic adapter independent of its visual presentation. It defines:

- stable `itemId`;
- pinned survey, bank, semantic, wording, mapping and adapter versions;
- response format;
- event identity and source status;
- axes for which the item is eligible;
- exact option-to-predicate mappings;
- explicit exits and missingness reasons;
- claim limits and prohibited inferences.

A Likert statement, scenario choice, multi-select, ranking or follow-up may all compile into the same event contract. Reviewed Git-owned templates compile into a trusted bank manifest; restored events must exactly match its item/options, predicates, source-unit identity, phase, source, versions, context schema and axis eligibility. The manifest also owns the public-axis allowlist.

Runtime context is not trusted merely because it is present. A template declares allowed context dimensions and values, may bind prompt-authored context that responses cannot override, and separately allowlists dimensions that may create projection context splits.

### EvidenceEvent

One answer-derived observation. It contains exact answer text, source status, target, timeframe, context, predicates, claim limits and version provenance. It is not proof of objective behavior.

### SourceUnit

The independence key used for aggregation. Action, motive and context follow-ups about one event enrich one source unit; they do not manufacture repeated support. In V1 it is derived only from attempt ID plus the template's authored event ID; a response caller cannot create occurrence IDs or override independence.

### Predicate

A normalized semantic assertion attached to an event, such as an action, explicitly reported motive, emotion expression, boundary, context signature, support preference or product-axis input. A predicate declares what it supports, carries a Git-owned `claimTemplateId` plus exact reviewed `claimText`, machine-readable allowed inference/scope IDs, and records what it cannot support.

### AuditedClaim

A bounded statement that passed source and language checks. It carries receipts, supported predicate IDs, inference keys, counterevidence, alternatives, scope, uncertainty, next validation and an explicit audit receipt. Passing claims require evidence, and both canonical and short text must exactly match reviewed `claimText` on a cited supported predicate. A claim cannot cite a predicate outside its evidence or an inference key prohibited by cited events. Omitted audit state fails closed.

### ProfileSnapshot

The immutable canonical result frozen before held-out checks. It owns profile evidence, missingness, audited claims, unknowns, blocked claims, versions, a bank-manifest binding and a deterministic evidence binding. It does not accept held-out answers or own renderer prose. An in-process freeze commitment binds the exact profile events, reviewed bank manifest, complete authored held-out set, and full prediction/baseline payload bindings before snapshot creation. Aggregate versions and per-item semantic/adapter manifests are derived from frozen events; mixed or caller-spoofed versions fail closed. Durable restoration will require an authenticated persistence signature; the in-process token is not a backend authenticity claim.

### HeldoutEvaluation

A separate post-freeze object. It accepts only bank-manifest items authored as held-out, from the same attempt, strictly after the snapshot seal time; each event's capture time must be at or after recorded exposure. Prediction and baseline commitments must cover every held-out item with exactly one authored option or an explicit abstention. It never mutates the profile or becomes E evidence.

Explicit answer edits create a new snapshot with `parentSnapshotId`. Fits / Not quite feedback is an append-only correction overlay and does not mutate the snapshot.

### ProductProjection

A versioned compression of snapshot evidence into stable product axes. It is derived, reversible to receipts and allowed to abstain. It is not a validated formal trait instrument.

### ResultCard

A renderer-safe selection contract over one snapshot and projection. It chooses claims, axes, privacy and view but cannot derive new evidence.

## Source statuses and internal weights

Weights affect only product projection. They are not probabilities or scientific coefficients.

| Source status | Internal weight | Meaning |
|---|---:|---|
| Observed action | 1.00 | Observation conditions must be recorded; not currently claimed by ordinary self-report questions |
| Repeated self-report | 0.90 | Same bounded pattern reported across genuinely independent events |
| Retrospective self-report | 0.80 | Respondent account of a specific past event |
| Hypothetical choice | 0.55 | Authored scenario choice |
| Stated preference | 0.45 | Literal preference; projection input only when explicitly mapped |
| Context fact | 0 | Routes and scopes evidence; not personality support |
| Missing / Other / held-out | 0 | Retained but excluded from profile scoring |

A later calibrated model may revise these values under a new projection version. Existing snapshots remain tied to their original version.

## Product axes

These five axes are internal product constructs, not MBTI, HEXACO, attachment, clinical or percentile scores. Public labels remain reviewable.

| Axis | Left direction | Right direction | Explicit non-claims |
|---|---|---|---|
| `activation_tempo` | Pause · watch · prepare | Move · test · initiate | Not Extraversion, impulsivity, confidence or ability |
| `social_signal_style` | Private · indirect · process | Direct · visible · coordinate | Not attachment security, sociability or social skill |
| `friction_posture` | Smooth · absorb · wait | Name · repair · boundary | Not kindness, aggression, agreeableness or moral worth |
| `structure_reliance` | Improvise · adapt | Plan · sequence · verify | Not Conscientiousness, competence or discipline |
| `novelty_aperture` | Conserve · simplify · known path | Explore · reframe · experiment | Not formal Openness, intelligence or creativity |

Rejected for this version: honesty, empathy, selfishness, attachment type, secure/insecure, confidence, identity strength, turbulent/assertive, health discipline and direct introvert/extrovert labels.

## Aggregation

For each axis, the projector consumes an immutable `ProfileSnapshot`, verifies its versions/evidence binding, then:

1. Select compatible profile-phase events explicitly eligible for that axis.
2. Ignore missingness, Other and held-out events as directional evidence.
3. Group by `sourceUnitId`.
4. Weight each directional predicate by its own source status, then combine it within the unit so a hypothetical follow-up cannot inherit retrospective strength.
5. Cap the unit's total global weight at its strongest contributing source without increasing independence.
6. Compute an internal signed position:

```text
net = Σ(weight × signed direction) / Σ(weight × absolute direction)
```

7. Preserve units opposing the leading direction as counterevidence.
8. Preserve context reversals as context splits rather than averaging them into a global middle. Only reviewed, allowlisted context dimensions/values marked projection-relevant can increase cross-context support.
9. Apply gates before rendering.

### Gates

- Fewer than two independent scored units: `unknown`.
- Near-balanced evidence or substantial opposition: `mixed`.
- All evidence hypothetical: cannot exceed `thin`.
- Exactly two units: `thin`.
- Three or more aligned units with stronger or cross-context evidence: `supported`.
- Four or more strongly aligned units, no counterevidence and strong/cross-context evidence: `strongly_supported`.

The internal numeric position is diagnostic only. It must never be displayed as “72% of your personality,” probability, percentile or accuracy.

### Coverage

Use Council coverage labels:

- `absent`
- `mentioned`
- `discriminative_item`
- `interpretable_answer`
- `prospectively_tested`

Coverage and direction are separate. Missing evidence is not the center of an axis.

## Question template

```js
const template = defineQuestionTemplate({
  itemId: "credit-response-01",
  surveyVersion: "survey-v1",
  bankVersion: "bank-v1",
  semanticVersion: "credit-response-v1",
  wordingVersion: "en-v1",
  mappingVersion: "mapping-v1",
  adapterVersion: "choice-adapter-v1",
  responseFormat: "single_choice",
  construct: "credit response",
  prompt: "A teammate gets the applause for work you helped build. What do you do?",
  eligibleAxes: ["social_signal_style", "friction_posture"],
  contextSchema: { audience: ["private", "group"], stakes: ["low", "medium"] },
  authoredContext: { stakes: "medium" },
  projectionContextKeys: ["audience", "stakes"],
  event: {
    id: "credit-event-01",
    kind: "scenario",
    phase: "profile",
    sourceStatus: "hypothetical_choice",
    claimLimits: ["Supports the selected response in this scenario only."],
    notEvidenceFor: ["secret motive", "honesty", "competitiveness"],
  },
  options: [{
    id: "private-correction",
    text: "Congratulate them, then correct the record privately.",
    predicates: [
      {
        id: "credit.private-correction",
        construct: "credit response channel",
        value: "private correction",
        claimText: "In this scenario, the selected response corrects the record privately.",
        claimTemplateId: "credit-private-correction-v1",
        allowedInferenceKeys: ["bounded_behavior"],
        allowedScopeIds: ["selected_scenario"],
        axisId: "social_signal_style",
        direction: "left",
      },
      {
        id: "credit.names-friction",
        construct: "friction response",
        value: "names issue",
        claimText: "In this scenario, the selected response names the credit issue.",
        claimTemplateId: "credit-names-issue-v1",
        allowedInferenceKeys: ["bounded_behavior"],
        allowedScopeIds: ["selected_scenario"],
        axisId: "friction_posture",
        direction: "right",
      },
    ],
  }],
  exits: [
    { id: "skip", text: "Skip", reason: "skip" },
    { id: "other", text: "Other / depends", reason: "other_unscored" },
  ],
});
```

Changing the prompt does not change `itemId` or semantic mapping. Changing what an option means requires a new semantic/mapping version. Rank templates must provide explicit descending positional weights; rank order is preserved in emitted predicates rather than treated like an unordered multi-select. A 0–5 item signal is permitted only when its options form a reviewed ordered continuum; categorical strategies use explicit directional classes instead of invented equal spacing.

## ProfileSnapshot template

```json
{
  "schemaVersion": "genii-evidence-framework-v1",
  "snapshotId": "snapshot:attempt:freeze",
  "evidenceBinding": "binding-v1-…",
  "bankManifestBinding": "bank-manifest-v1-…",
  "parentSnapshotId": null,
  "freeze": {
    "attemptId": "attempt:…",
    "sealedAt": "…",
    "heldoutItemIds": ["…"],
    "predictionCommitmentId": "…",
    "predictionCommitmentBinding": "prediction-v1-…",
    "baselineCommitmentId": "…",
    "baselineCommitmentBinding": "baseline-v1-…",
    "heldoutExposureAt": null
  },
  "versions": {
    "surveyVersion": "...",
    "questionBankVersion": "...",
    "mappingVersion": "...",
    "wordingVersion": "...",
    "semanticManifest": { "credit-response-01": "credit-response-v1" },
    "semanticManifestBinding": "semantic-v1-…",
    "adapterManifest": { "credit-response-01": "choice-adapter-v1" },
    "adapterManifestBinding": "adapter-v1-…",
    "evidenceFrameworkVersion": "genii-evidence-framework-v1",
    "projectionVersion": "genii-product-projection-v1",
    "resultContractVersion": "genii-result-card-v1"
  },
  "scope": {
    "heldoutExcluded": true,
    "excludedUses": ["diagnosis", "formal_trait_scores", "hidden_sensitive_inference"]
  },
  "evidenceEvents": [],
  "missingnessEvents": [],
  "claims": [],
  "unknowns": [],
  "audit": {
    "qepSeparated": true,
    "blockedClaimIds": [],
    "heldoutEventIds": []
  }
}
```

## Result-card views

All views cite the same `snapshotId` and `projectionVersion`.

### Compact

- provisional identity or headline;
- two to four supported/mixed axes;
- one caveat or unknown;
- no raw private answers by default.

### Private evidence

- all eligible claims;
- exact receipts and source statuses;
- context splits and counterevidence;
- missingness and unknowns;
- corrections and next validation.

### Genii identity

- playful name and hook;
- label and hook text selected exactly from audited claims; axes may support selection but cannot supply invented prose;
- no secret motive or moral judgment;
- explicit provisional language.

### Comparison

- only compatible framework, bank, mapping, projection and per-item semantic/adapter manifests, or an explicit migration;
- distinguish changed answers, changed evidence coverage and changed mapping;
- never imply longitudinal personality change from incompatible snapshots.

### Share-safe

- claims whose Git-owned `claimTemplateId` and axis IDs are allowlisted in the bank manifest; runtime flags can hide but cannot expand the public set;
- no exact private answer receipts;
- public claims expose only `id` and exact audited `text`; no runtime scope, uncertainty, next-validation text, Other text, correction reasons, sensitive context or hidden inference;
- identity is a constrained allowlisted DTO whose label and hook are exact available public claim text; any cited axis must also be allowlisted.

### Internal debug

- source-unit accounting;
- internal numeric positions;
- blocked claims and clause audits;
- never presented as respondent-facing truth.

## Infinite display, fixed evidence

Renderers may change:

- layout, media and animation;
- information density;
- tone by selecting a pre-audited authored variant chosen by the respondent;
- ordering and progressive disclosure;
- charts, cards, conversation or narrative format.

Renderers may not change:

- evidence identity or wording snapshot;
- source status;
- exact audited claim wording, scope or limits;
- support/counterevidence membership;
- missingness semantics;
- projection and result versions;
- correction history;
- P-only held-out separation, freeze commitments and bank-manifest binding.

## Corrections

A correction records `snapshotId`, `claimId`, value, reason and evidence snapshot IDs. Values are:

- `accurate`
- `partly_accurate`
- `inaccurate`
- `prefer_not_to_say`

Feedback is not new personality evidence. Share-safe cards omit corrections entirely. Explicit answer edits produce a child snapshot.

## Implementation

Implemented candidate module:

- `quiz64/src/evidence-framework.js`
- `quiz64/tests/evidence-framework.test.mjs`

The module currently provides:

- `defineQuestionTemplate`
- `createBankManifest`
- `compileResponse`
- `createFreezeCommitment`
- `adaptObservationRows`
- `projectProductAxes`
- `createAuditedClaim`
- `createProfileSnapshot`
- `createHeldoutEvaluation`
- `createCorrectionRecord`
- `createResultCard`
- `canCompareProjections`

The live build (2026-09-23) consumes this module end to end. `quiz64/src/question-bank-v2.js` authors the routed bank as `QuestionTemplate`s with explicit option-to-axis predicates, and `quiz64/src/dossier-session.js` runs session, freeze, audited claims, projection, heldout evaluation and corrections. Integrity checks reject duplicate heldout item IDs, mismatched stored response keys and forged correction snapshot lists. The older V4 observation adapter is historical and does not feed the axes.

## Required next work

Done in the 2026-09-21 build: bank designed against these templates (V2), independent mapping and voice review, explicit option-to-axis predicates in a new bank version, snapshot, projection and renderer split, and complete, mixed, sparse and skipped fixtures. Remaining:

1. Conduct human comprehension and usefulness tests.
2. Only then approve public axis wording, archetypes, sharing beyond the nickname card, and comparison.
3. Calibrate thresholds; current axis thresholds and mappings are conservative defaults, not calibrated scales.

## Non-claims

This framework is not a validated personality instrument. It does not establish MBTI, HEXACO, attachment, clinical status, diagnosis, percentile, calibrated probability or scientific accuracy. A green test suite proves contract behavior, not human validity.
