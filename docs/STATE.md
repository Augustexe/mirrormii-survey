---
title: Genii survey state
status: current
owner: jerry
updated: 2026-09-27
source_basis: CODE-MAP.md; DECISIONS.md; OPEN-QUESTIONS.md; git state of the active worktree read 2026-09-25; persona MVP branch claude/survey-mvp-finish-20260927 verified 2026-09-27
---

# Genii survey state

## Newest: persona quiz V2 web MVP (local, 2026-09-27)

The V2 persona game now runs end to end inside the quiz64 shell as one product: setup (age band, closest person, pronoun), seven chapters from the maintained kit with teen and 18+ gating, adaptive extras, Genii's eight guesses locked with a SHA-256 before the finale, the template result page, a share card, and a working "Do you really know me?" loop over URL-fragment links (owner makes a link, friend plays four levels on their own device, a reply link brings the answers back). Scoring is the kit's own `score-core.mjs`. Branch `claude/survey-mvp-finish-20260927` (based on `5c47928`), local only: not pushed, not deployed, not tested with people. Tests: kit 27 of 27, quiz64 123 of 123, production build passes, 119 of 119 browser checks. Contract and limits: [quiz64/docs/PERSONA-MVP.md](../quiz64/docs/PERSONA-MVP.md); evidence: [quiz64/docs/PERSONA-MVP-VERIFICATION.md](../quiz64/docs/PERSONA-MVP-VERIFICATION.md). The live Pages build below is unchanged.

## Live

The personality-game survey with the final dossier is public at https://augustexe.github.io/Mirrormii-survey-main-publication-/ (deployed 2026-09-23, Jerry selected this version). It serves branch `codex/final-survey-dossier` at commit `ebaac0944724e2316f778e24d9bafdfb9805392b` from repository `Augustexe/Mirrormii-survey-main-publication-`. The workflow `.github/workflows/deploy-pages.yml` on that branch builds `quiz64/dist` on every push to the branch or on manual dispatch. The Pages environment allows exactly `main` and `codex/final-survey-dossier`. At deploy time 95 tests and the production build passed (known large-chunk warning, about 730 kB). This is dated evidence, not a fresh uptime check.

`/preview.html` on the same site shows the dossier with synthetic fixtures, labelled as not saved and not validating predictions.

## What the live build is

- A personality game, not a wellness intake (founder pivot, 2026-09-19). No health features or health inference.
- Three contextual editions (everyday, work and study, social), not validated ICP segments. Three voices (gentle, playful, sharp) change wording only, never scoring.
- Everyday: 24 profile scenes, 33 with optional personal sections. Work/study and social: 16 profile scenes, 25 with personal sections. Every route ends with 8 sealed checks that never rescore the frozen profile. Bank detail: [questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md](questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md).
- The result is the personality dossier: a provisional game nickname, five evidence facets, answer-grounded stories, one eight-card prediction reveal with baseline and abstentions, append-only corrections, private JSON export and a share-safe PNG card (nickname plus invitation only). Contract: [RESULT-DISPLAY-V1.md](RESULT-DISPLAY-V1.md).
- Answers stay in the browser. No backend, accounts, analytics or survey API. The app handoff destination is a labelled placeholder.

Preserve the approved pre-result graphic baseline (App components, styles and assets at `2e65313`); only the final dossier may change visually.

## Source

The active code is a clean git worktree of the project repository, still inside a workbench folder; [CODE-MAP.md](CODE-MAP.md) gives the path. It tracks `publication/codex/final-survey-dossier` with nothing ahead or behind. The project checkout's `main` (`336584e`) is an ancestor of the active branch and still holds the older R6 app. Proposed permanent home: merge `codex/final-survey-dossier` into the project checkout so `quiz64/` at the project root is the live app, then remove the workbench worktree. Not yet done; needs a Git review.

## Repositories

- Authoritative: `Augustexe/Mirrormii-survey-main-publication-` (local remote `publication`).
- Outdated: `Augustexe/mirrormii-survey` (local remote `origin`). It was made public on 2026-09-18 and got an older GitHub Pages site at https://augustexe.github.io/mirrormii-survey/ (not re-checked since). The mistaken branch pushed there was deleted on 2026-09-21; deleting or archiving the whole repository awaits Jerry's scope decision ([OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)).

## Research beside the build

SYNTH-30 personas and the TAM v0.1 model are synthetic planning research, not customer facts: [MARKET-MODEL.md](MARKET-MODEL.md).

## Open

Human validation, backend ownership, persistence, the app destination and the outdated repository remain open in [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md). Use [WORKING-SET.md](WORKING-SET.md) for the technical reading order and governed Lark reads for company claims.
