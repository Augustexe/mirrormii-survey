# Genii project context - start here

## Start here: the launch survey

We are finishing one build, **persona quiz V2**. Read in this order:

1. [STATE.md](STATE.md): what it is, where every file lives, status and next steps.
2. [questions/RUN-SPEC-LEDGER.md](questions/RUN-SPEC-LEDGER.md): Jerry's current rulings. Check before any survey work.
3. [questions/PERSONA-QUIZ-SPEC-V2.md](questions/PERSONA-QUIZ-SPEC-V2.md): the spec.
4. [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md), top section: decisions waiting on Jerry.

Earlier builds are listed in [history/BUILD-ITERATIONS.md](history/BUILD-ITERATIONS.md). They do not govern the launch survey.

## The wider wiki (mostly earlier builds)

Maintained home for this project's decisions, evidence, questions, ICP and psychology. Updated 2026-09-21. This folder is Git-owned. All agents and humans use the same files.

Read [STATE.md](STATE.md) first, then [WORKING-SET.md](WORKING-SET.md) for the exact files to edit. Read [DECISIONS.md](DECISIONS.md) for confirmed founder requirements, with [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for unresolved choices and conflicts. Check [CODE-MAP.md](CODE-MAP.md) before any source edit or test.

| Work area | Start here | What belongs here |
|---|---|---|
| Evidence framework | [Stable contract](EVIDENCE-FRAMEWORK.md) | Question adapters → events → claims → immutable snapshot → projections → result cards |
| Evidence and evaluation | [Evidence guide](evidence/README.md) | Literal response → observation → bounded interpretation; existing failed and successful checks |
| Questions and result | [Playful-disclosure bank V1](QUESTION-BANK-V1.md), [Evidence Display V1](RESULT-DISPLAY-V1.md), [question guide](questions/README.md) | Earlier banks and result contracts. The launch bank is [questions/PERSONA-QUIZ-SPEC-V2.md](questions/PERSONA-QUIZ-SPEC-V2.md) |
| ICP and product thesis | [ICP guide](icp/README.md) | Broad audience versus proposed launch cohort; what has not been validated |
| Psychology and voice | [Psychology guide](psychology/README.md) | Facets, context, motives, humor and research limitations |
| Product contracts | [Product spec](PRODUCT-SPEC.md), [personality/health](PERSONALITY-HEALTH-SPEC.md), [host](HOST-EXPERIENCE.md) | Confirmed requirements plus clearly marked proposals; older implementation-status sentences are checkpoints |
| History and provenance | [Every run](history/RUN-CATALOG.md), [document catalog](history/DOCUMENT-CATALOG.md) | Find prior artifacts without loading them as current instructions |
| Maintenance | [MAINTENANCE.md](MAINTENANCE.md) | How to record decisions and finish future runs without losing context |

`docs/` is the real, maintained local wiki. Run outputs remain historical evidence, not competing editable masters. Some historical scratch links in the catalogs refer to temporary files that are no longer present; retained receipts and outputs remain separately indexed.

Company authority remains current MirrorMii OS Base and Wiki. This filing audit did not refresh live company content; dated local research/specs do not establish current shipped app capabilities. Raw participant records and protected runtime state do not belong here.

## Earlier status notes (history, superseded by STATE.md)

### Active implementation - 2026-09-21

The routed personality-game survey and dossier are live on GitHub Pages since 2026-09-23. Start with [STATE.md](STATE.md) and [CODE-MAP.md](CODE-MAP.md). Synthetic segment and market research: [MARKET-MODEL.md](MARKET-MODEL.md). Proposed next bank and parsing rules (2026-09-26): [SURVEY-SPEC-V3.md](SURVEY-SPEC-V3.md). Earlier implementation-status paragraphs below are historical checkpoints, superseded by CURRENT.


### Active implementation, 2026-09-21

The full routed evidence survey and redesigned personality dossier are implemented locally. Start with [CURRENT.md](CURRENT.md) and [CODE-MAP.md](CODE-MAP.md). Earlier implementation-status paragraphs below are historical checkpoints, superseded by CURRENT.

**Current work: review the first [playful-disclosure question bank](QUESTION-BANK-V1.md) against the stable [evidence framework](EVIDENCE-FRAMEWORK.md).** Questions are replaceable adapters; `ProfileSnapshot` is canonical; axes and result cards are derived and versioned. The framework and 23-item base bank are implemented locally but are not wired into the respondent result or validated with humans. The V4 candidate, 40-item experiment and approved R6 app remain distinct versions.
