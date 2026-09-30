---
title: "Routed question bank V2 author guide"
status: "current"
access: "internal"
owner: "jerry"
created: "2026-09-24"
updated: "2026-09-25"
source_basis: "quiz64/src/question-bank-v2.js and question-voices-v2.js on branch codex/final-survey-dossier"
promotion_target: null
supersedes: null
superseded_by: null
source_status: "unclassified"
promotion_decision: "CONTEXT-01 sweep; Jerry approves by merging"
---

> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Routed question bank V2 author guide

Status: live bank since 2026-09-23 (the deployed `codex/final-survey-dossier`
build). This guide documents the module in `quiz64/src/question-bank-v2.js`.
Independent bank and voice reviews found no remaining blocker; human
validation of wording, burden and humor is still pending. Section voices are in
[SECTION-VOICE-MAP.md](SECTION-VOICE-MAP.md).

Known copy caution: a few playful and sharp option lines are slightly more
specific than their neutral meanings (for example "Celebrate loudly" for the
group-chat celebration). Scoring is unaffected; align them in the next copy pass.

## Runtime seam

```js
const bank = getBank({
  route: "everyday" | "work_study" | "social" | "close_relationship" | "light" | "universal",
  voice: "gentle" | "playful" | "sharp",
  personal: boolean,
});
```

The return value is version-pinned and contains `templates`, `manifest`, a
presentation map keyed by `itemId`, `profileIds`, `heldoutIds`, and `sections`.
The presentation prompt, option text and exit text are copied directly from
the compiled template. The runtime must render those exact strings and must
keep option IDs stable.

The current runtime already knows route, voice and the personal safety gate.
V2 therefore does not ask a respondent to choose a delivery mode or topic and
then ignore that answer. The old calibration drafts remain in the authoring
source for reference but are excluded from routed output. Topic permission
metadata remains on each optional template for a future finer-grained gate.

## Route coverage

The full everyday/universal route has 33 profile items and eight heldouts when
`personal: true`; it has 24 profile items and eight heldouts when personal
material is closed. The light route has 24 profile items and eight heldouts.
Work/study, social and close-relationship routes have 25 profile items with
personal material and 16 route-specific profile items without it; each retains
all eight heldouts. A light run keeps everyday, work/study and social scenes
and removes the close-connection and secret-menu modules.

The profile set spans three useful contexts: everyday life, work/study and
social scenes. Optional close-connection and private-draft sections are
separate. Every profile item has explicit exits; retrospective items have a
distinct `no_recent_example` exit, and `Other` remains unscored.

## Evidence rules

- `retrospective_self_report` asks for the latest relevant event in a stated
  window. Its literal receipt is an authored observation, not a diagnosis or a
  universal trait claim.
- `hypothetical_choice` is used for low-stakes scenarios only. It is marked as
  hypothetical in the prompt and event metadata, and the framework's source
  weighting keeps hypothetical-only projections thin.
- `stated_preference`, `context_fact`, fantasy, temptation and desire remain
  separate literal records. A private thought is never evidence that someone
  acted on it. Nothing in this bank predicts infidelity or moral behavior.
- Directly mapped axes are limited to the five product projections already
  defined by the evidence framework: activation tempo, social signal style,
  friction posture, structure reliance and novelty aperture. Categorical
  receipts without a reviewed axis mapping are intentionally retained as
  literal evidence only.
- E01 uses a free, unfamiliar activity as a clearly hypothetical profile
  choice. H05 uses a separate familiar-app layout scenario with explicit novelty direction
  predicates for try, preview and familiar-layout choices; its pass option stays
  literal-only. It is a frozen game check, never profile evidence.
- Heldouts are always phase `heldout`, source status `heldout`, and excluded
  from `profileIds`. Prediction and baseline commitments must be created before
  their answers are collected.

## Independence notes

The module gives each semantic item a stable event identity. E02, E04 and E05
share the `recent_everyday_plan` event group, and W01 and W07 share the
`recent_work_plan` group, so a runtime or evaluator cannot count overlapping
latest-event prompts as independent corroboration. W09 and S09 explicitly ask
for a different task or group plan and receive distinct event groups. If a
participant reports that two prompts refer to the same event, the runtime
should still link them to one source unit before projection; item count alone
must never manufacture support.

No source mapping is intended to convert missing access, lack of time, money,
energy, safety, transport or authority into a personality direction. Such
responses should use the authored `Other`, `Skip`, `not_applicable` or
`no_recent_example` path and remain visible as unknown or categorical context.

## Review commands

```sh
node --test quiz64/tests/question-bank-v2.test.mjs
node --test quiz64/tests/question-bank-v2.test.mjs quiz64/tests/question-bank-v1.test.mjs quiz64/tests/evidence-framework.test.mjs
```

The focused contract test covers all route/voice combinations, exact
presentation/template wording, option receipt compilation, personal gating,
light-route coverage, novelty hypothetical boundaries, conservative event
grouping and heldout exclusion.
