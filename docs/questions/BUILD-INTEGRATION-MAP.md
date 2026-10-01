> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

> Maintained working document, promoted 2026-09-18. [Original run snapshot](../../../../hall/data/jobs/mirrormii-genie-survey/20260918T174625Z-7724d715c4d8/output/BUILD-INTEGRATION-MAP.md) remains immutable. Original status and limitations below still apply; promotion is filing, not product approval.

# Experimental bank to current engine: integration map

Status: implementation mapping based on the reviewed `quiz64` source at `runs/20260918T003758Z-1798bfab3e72/scratch/worktree/quiz64/src/`. This document does not modify that source or authorize deploying the experimental bank.

## Current contract observed

`src/data.js` exports `VERSION`, `DIMS`, `QUESTIONS`, `MEASURES`, and `ROUTE_SLOTS`. Each question is a candidate with a stable `id`, chapter/title/setup, ordered options with option `id`, and optional role/test/applicability/baseline fields. `meta` carries domain, evidence/source type, source/version, subject, and time window. Option fields used by the engine include `text`, literal `why`, `facts`, `tags`, `measures`, `signals`, and optionally a host `reaction`. The route is a list of slots, each with ordered eligible candidate IDs; an ineligible item falls through to the next candidate.

`src/engine.js` derives `facts`, `observations`, grouped `profile`, `measureRecords`, `emotions`, `claims`, and a frozen portrait from this schema. Every observation keeps question/option/version, target, source, evidence role, and window. Questions marked `test` are excluded from training observations and require a locked snapshot before answering. `freeze()` stores the training answers/signature, route, profile, facts, observations, predictions, exposure state, and timestamp. `setAnswer()` prevents a test answer before freeze and treats the check answer as final for the attempt. Feedback is linked to the immutable result/evidence snapshot; it does not revise the original claim. `restore()` validates stored state against the active data `VERSION` (`genii-root.v2`); the storage key constant is separately `genii.evidence64.v2`.

This is an authored evidence/portrait pipeline with a deterministic local session model. It is not a general-purpose importer for an alternate question schema, a calibrated inference service, or a production account/backend contract.

## What the current engine can consume

| Experimental content | Existing representation | Compatibility condition |
|---|---|---|
| Question and response copy | `QUESTIONS[]`: `id`, `chapter`, `title`, `setup`, `options[].id`, `options[].text` | IDs must be unique, stable for the version, and included in `ROUTE_SLOTS`. Existing wording adapter must be applied if used. |
| Literal answer interpretation | `options[].why` | State only what the selected answer entails. Never infer an unasked motive. |
| Context facts | `options[].facts` | Values must be deliberately named and used by applicability/target rules; current built-in facts are close-person and household context. |
| Behavioral evidence | `options[].tags[] = {d, v, target}` | Dimension/value vocabulary must be declared in `DIMS`; profile aggregation counts tags and distinct question IDs, not independent corroboration or source quality. Several tags from one item do not count as several questions, but all still enter raw tag counts. |
| Direct routine/body report | `options[].measures[] = {id, value, label?}` plus `MEASURES[id]` definition | A measure needs a stable ID, domain, labels/range/unit/description, and supported window. The current portrait exposes usual (`past_month`) and recent (`last_7_days`) separately; other windows do not become those cards. A later observation for the same measure/window replaces its displayed value; this is not averaging. |
| Feeling/action/recovery signal | `options[].signals[] = {family, layer, value, label?}` | Family must fit the current enumerated emotion families and layer must be `feeling`, `response`, or `recovery`; otherwise `emotionsFor()` will not surface it. |
| Target and situation | `question.applicable`, option facts, tag target, and `meta.subject` | Built-in applicability rules cover close person/shared household or `{fact, values}`. Additional situation bindings require engine changes; free-text metadata alone will not bind or preserve a target in profile grouping. |
| Evidence provenance and time | `meta.evidence`, `meta.window`, `meta.source`, plus `meta.domain/subject` | The engine normalizes evidence into role/window and source. Supported practical windows include `past_month`, `last_7_days`, `latest_instance_past_month`, and `scenario`. `source` should identify authored source/version, not a claimed participant source. |
| Candidate routing | `ROUTE_SLOTS: [{id, candidates}]` | The route builder selects the first eligible candidate per slot. It does not schedule conditional follow-up trees, multi-select answers, or several items in one slot. |
| Held-out check | `test: true`, optional `baseline`, distinct check route slot | All training answers are normalized and frozen before checks appear. Prediction uses the frozen training evidence and returns an abstention/heuristic ranking; its score is explicitly not a probability. |

## Missingness, skip, Other, and partial completion

The runtime recognizes the exact special answer IDs `other`, `skip`, and `no_example`. They remain distinct: none creates scored tags/measures/signals; `other` requires a separately stored text field and remains unscored; skip and no-example do not have an answer payload or become negative evidence. An unanswered item is absent from `answers`. A route slot with no eligible candidate is omitted and recorded with a reason; this is structurally different from a respondent skip. A question omitted by context applicability is not a zero-valued answer.

For routine facts, a missing answer/window remains `null`/absent, not zero, “poor,” or an implied default. Do not use a routine-item skip to infer health or personality. The existing interface includes answer notes and Other text, but those are not evidence tags and should remain explicitly unscored unless a future, separately consented interpretation step is designed.

## Freeze and feedback boundary

The 8 experimental checks must have `test: true` and be excluded from `trainingQuestions()`. Each session must call the freeze boundary only after the complete routed training/profile phase; the resulting signature and snapshot define exactly what could support the prediction. A check result is a post-freeze answer and may not be merged into `profile`, `observations`, `claims`, routine summaries, prediction inputs, or a regenerated portrait for that same result. If a pre-answer prediction is unavailable, retain an abstention rather than retrofitting.

True/False claim review must continue through the existing feedback path: retain the result version/ID, original claim and evidence snapshot, feedback value/reason, and timestamp. Feedback is a separate record and does not rewrite the claim or frozen result. Experimental collection must preserve this separation if its output is transformed into the existing state model.

## Current 64 versus experimental 40

The reviewed build routes 64 question slots: 56 training/profile-context slots and 8 check slots, drawing on 76 authored candidates because some slots have alternate candidates. The experiment defines 32 profile items, with the six light-routine items included in that count (6 context + 20 behavior + 6 routine), plus 8 held-out checks: 40 items total. It is therefore a substantially shorter, differently balanced session than the current 64-slot build, not a 40-slot replacement that also appends six more routine questions.

The experiment is not drop-in compatible solely because both builds have profile and check questions. The current renderer and engine expect the current schema, `VERSION`, route slot definitions, known special answer IDs, and existing DIMS/MEASURES/signal vocabulary. The current `data.js` has a 64-slot route, multiple alternate candidates, an existing 8-check arrangement, broad behavior dimensions D1–D14d, and multiple routine windows/measure IDs. The experimental design narrows the profile to 32 and centers the current belonging/friction thesis; directly replacing the old question list could change route coverage, invalidate stored `genii-root.v2` sessions, alter prediction domains/baselines, or leave render/result components without matching authored output.

Treat the new bank as a **separate experimental version**. Before any runtime integration, create a field-level adapter or new versioned data module, specify stable question/option IDs and route semantics, declare the six-routine count relationship, map any new concepts to dimensions without collapsing contextual facets, and test old-state restore/version behavior. Keep old v2 state readable or fail closed with a clear version boundary; do not silently reinterpret or discard it.

## Fields and decisions the experimental author must supply

For each question, provide: stable candidate ID; intended slot/route group; primary facet and any supported secondary facet; concrete situation; target; window; source type (`actual_event`, `hypothetical`, `self_report`, or direct routine); applicability predicate; prompt and response copy; and whether it is profile/training or held-out. For each option provide stable option ID, literal answer text, an entailment-only explanation, tags/facts/measures/signals as applicable, and an explicit list of unsupported inferences. Every Other/Skip/no-example route must preserve established missingness semantics. Because six routine items are within the 32-item profile allocation, show which profile slots they occupy and ensure the remaining 26 profile items do not implicitly add extra runtime slots.

For every routine measure provide a stable measure ID, domain, label, low/high labels, valid ordinal range or explicit categorical scale, unit, description, reporting window, and a no-answer state. Routine measures should use only supported direct report fields; they must not feed personality tags unless the respondent directly states that connection. For every check provide its baseline and option mapping before outcome access, plus an explicit prediction target and eligibility rule.

For the output layer, specify which frozen claim(s) can support the epithet/tension, the exact evidence IDs/receipts, how conflicting or sparse evidence changes wording, and the modest CTA that follows the user's chosen route. A copy-only sample portrait does not establish that `portrait()` can render it; that requires an explicit adapter/result schema and a separate runtime review.

## Non-goals of this mapping

This map does not score any new candidate, bless the experimental thesis, change UI or source code, select an external data store, authorize account/consent/retention architecture, or establish participant recognition, accuracy, health validity, launch readiness, or publication approval.
