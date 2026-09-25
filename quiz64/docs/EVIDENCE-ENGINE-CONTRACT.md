# Evidence engine contract

Status: framework slice implemented for local review; not wired into the respondent result and not a validated personality score.

The maintained product/evidence specification is [`../../context/EVIDENCE-FRAMEWORK.md`](../../context/EVIDENCE-FRAMEWORK.md). This file records the code seam.

## Interface

`src/evidence-framework.js` is a pure deterministic module:

```text
defineQuestionTemplate(input) → QuestionTemplate
createBankManifest(templates) → BankManifest
compileResponse(template, response) → EvidenceEvent
adaptObservationRows(rows, options) → EvidenceEvent[]
createFreezeCommitment(input) → FreezeCommitment
projectProductAxes(snapshot) → ProductProjection
createAuditedClaim(input) → AuditedClaim
createProfileSnapshot(input) → ProfileSnapshot
createHeldoutEvaluation(snapshot, events, input) → HeldoutEvaluation
createCorrectionRecord(input) → CorrectionRecord
createResultCard(snapshot, projection, options) → ResultCard
canCompareProjections(left, right) → boolean
```

The caller supplies dates and an attempt ID when deterministic output is needed. Survey/bank/mapping versions come from reviewed templates, source-unit identity is derived from attempt plus authored event ID, snapshot versions come from frozen events, and projection consumes the snapshot rather than a loose event array. Snapshot creation requires a Git-owned reviewed bank manifest plus an in-process commitment binding the exact evidence and prediction/baseline payloads; held-out answers are accepted only by the separate post-freeze evaluation function. Durable restored-state authenticity still requires a future signed persistence boundary. The module performs no storage, network, model, analytics, publishing or backend writes.

## Invariants

- Questions are adapters; wording is not identity.
- Missingness and Other are events, never axis zeroes.
- `sourceUnitId` controls independence and cannot be caller-overridden.
- Linked follow-ups cannot increase independent support or inherit stronger provenance from another predicate in the unit.
- Restored option IDs, predicates, source units, context, phase/source/version/eligibility and exact receipts must match the reviewed bank manifest. Held-out events cannot enter `ProfileSnapshot`.
- Only allowlisted projection-relevant context keys/values can increase cross-context support. Prompt-authored context is template-bound and cannot be removed or overridden by response state.
- Freeze binds exact profile evidence, the complete authored held-out set, and prediction/baseline payloads containing one valid authored option or abstention per item. Capture timestamps must preserve profile-before-freeze and heldout-after-exposure order.
- Passing claims require explicit predicate support, a Git-owned claim template ID, allowed inference/scope IDs, an audit receipt and exact claim text authored on a cited predicate. Snapshot restoration revalidates the receipt.
- Projection consumes an evidence-bound `ProfileSnapshot`, not raw prose, tag frequency or a loose event array.
- Internal numeric position is diagnostic and never a personality percentage. It is used only for reviewed ordered continua; categorical strategies retain explicit direction/strength classes rather than invented equal spacing.
- Result cards select existing claims/axes; they cannot create or paraphrase inference. Identity label/hook text comes exactly from available audited claims. Share-safe cards omit corrections and free-form metadata, and use only the bank manifest's public claim-template and axis allowlists.
- Corrections are overlays. Answer edits require a child snapshot.
- Comparison fails closed across framework, bank-manifest, mapping, projection or semantic/adapter manifest bindings unless an explicit migration matches both sides.

## Current migration boundary

`adaptObservationRows()` preserves current V4 receipts and source-unit identity but intentionally emits no axis predicates. An explicit reviewed mapping is required before current V4 answers affect the five new product axes.

The current `engine.js` remains the running respondent implementation. A later bounded slice should route frozen observations through this module, replace `profile().ratio` as a product score, and split `portrait()` into snapshot, projection and rendering without changing existing respondent behavior prematurely.

## Verification

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm test --prefix quiz64
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run build --prefix quiz64
```

Owned tests cover multiple question formats, source-unit collapse, missingness, hypothetical caps, mixed/context evidence, held-out exclusion, immutable correction overlays, privacy projections, version comparison and legacy adaptation.
