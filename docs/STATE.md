---
title: Genii survey state
status: current
owner: jerry
updated: 2026-09-29
source_basis: questions/RUN-SPEC-LEDGER.md; questions/PERSONA-QUIZ-SPEC-V2.md; git state read 2026-09-28; 2026-09-28 audit of the persona MVP run (hall/data/jobs/mirrormii-genie-survey/20260928T014509Z-survey-mvp-02-ce97f3); Jerry's rulings 2026-09-28
---

# Genii survey state

## The launch survey

Everything about the launch survey (rules, numbers, status, rulings, plan, open decisions) is in **[LAUNCH-SPEC.md](LAUNCH-SPEC.md)**, the only spec. The developer entry for the web game is **[quiz64/README.md](../quiz64/README.md)**.

The launch build (branch `survey/launch`, local only, not deployed) is at round 3 (2026-09-29): 174-card bank in two voices, 40 cards plus 8 sealed guesses, Genii evolving from orb to slime, a 12-screen Stories reveal with a game character sheet (pips and level words, no percentages), 5 to 6 core traits, rooms, Genii's calls, and the real MirrorMii world on the mirrors, share and app screens. It is being handed to Desmond for the friend game backend: his entry is **[HANDOFF-DESMOND.md](HANDOFF-DESMOND.md)** (data flow, what exists, build order, backend contracts in [contracts/](contracts/), the question pack export in [question-pack/](question-pack/), placeholders, unsigned links and no sync, deployment, open decisions). This page keeps only the live site and repository facts below.

## Live site (older build, still public)

The personality-game survey with the final dossier is public at https://augustexe.github.io/Mirrormii-survey-main-publication-/ (deployed 2026-09-23, Jerry selected this version). It serves branch `codex/final-survey-dossier` at commit `ebaac0944724e2316f778e24d9bafdfb9805392b` from repository `Augustexe/Mirrormii-survey-main-publication-`. The workflow `.github/workflows/deploy-pages.yml` on that branch builds `quiz64/dist` on every push to the branch or on manual dispatch. The Pages environment allows exactly `main` and `codex/final-survey-dossier`. At deploy time 95 tests and the production build passed (known large-chunk warning, about 730 kB). This is dated evidence, not a fresh uptime check.

`/preview.html` on the same site shows the dossier with synthetic fixtures, labelled as not saved and not validating predictions.

What the live build is:

- A personality game, not a wellness intake (founder pivot, 2026-09-19). No health features or health inference.
- Three contextual editions (everyday, work and study, social), not validated ICP segments. Three voices (gentle, playful, sharp) change wording only, never scoring.
- Everyday: 24 profile scenes, 33 with optional personal sections. Work/study and social: 16 profile scenes, 25 with personal sections. Every route ends with 8 sealed checks that never rescore the frozen profile. Bank detail: [questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md](questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md).
- The result is the personality dossier: a provisional game nickname, five evidence facets, answer-grounded stories, one eight-card prediction reveal with baseline and abstentions, append-only corrections, private JSON export and a share-safe PNG card (nickname plus invitation only). Contract: [RESULT-DISPLAY-V1.md](RESULT-DISPLAY-V1.md).
- Answers stay in the browser. No backend, accounts, analytics or survey API. The app handoff destination is a labelled placeholder.

Preserve the approved pre-result graphic baseline (App components, styles and assets at `2e65313`); only the final dossier may change visually.

## Source

The project checkout is on branch `survey/launch` (the launch build, local commits only). `main` (`c412671`) holds the live dossier app, merged 2026-09-25. The old dossier workbench worktree still exists under `hall/data/jobs/mirrormii-genie-survey/20260921T072033Z-b5c7e4bdfdb4/scratch/worktree`; [CODE-MAP.md](CODE-MAP.md) lists every worktree.

## Repositories

- Authoritative: `Augustexe/Mirrormii-survey-main-publication-` (local remote `publication`).
- Outdated: `Augustexe/mirrormii-survey` (local remote `origin`). It was made public on 2026-09-18 and got an older GitHub Pages site at https://augustexe.github.io/mirrormii-survey/ (not re-checked since). The mistaken branch pushed there was deleted on 2026-09-21; deleting or archiving the whole repository awaits Jerry's scope decision ([OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)).

## History and research

- Every build so far, one line each: [history/BUILD-ITERATIONS.md](history/BUILD-ITERATIONS.md). Earlier builds do not govern the launch survey.
- SYNTH-30 personas and the TAM v0.1 model are synthetic planning research, not customer facts: [MARKET-MODEL.md](MARKET-MODEL.md).
