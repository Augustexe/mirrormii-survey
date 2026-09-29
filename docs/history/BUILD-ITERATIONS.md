---
title: Survey build iterations, one line each
status: current
owner: jerry
created: 2026-09-28
source_basis: git log --all of this repository read 2026-09-28; questions/RUN-SPEC-LEDGER.md; research/persona-quiz-v2/LESSONS-FROM-TEST-1.md
---

# Survey build iterations

So nobody has to remember them. Only the last rows govern the launch survey; see [../STATE.md](../STATE.md).

| # | Date | Build | What it was | Outcome |
|---|---|---|---|---|
| 1 | 09-14 | Repo setup | Planning baseline and source routing | Done |
| 2 | 09-17 | Genii 64 V1 | 64-question evidence engine, adaptive survey, evidence portrait, glass-world UI | Deployed to the first Pages site (outdated repo) |
| 3 | 09-17 | Demo 30 | 30-question cut kept before the redesign (`demo30/`) | Reference only |
| 4 | 09-18 | Evidence-first switch modes | Branch `codex/evidence-first-survey-implementation` | Abandoned |
| 5 | 09-19 | V4 evidence-bound personality game, plain-English rewrite | Branches `codex/personality-game-council-v4`, `fm/genii-language-astra`. The personality-game pivot happened here | Abandoned as a build; the pivot stands |
| 6 | 09-20 | Question bank V1, evidence framework, result reveal | Branches `codex/question-bank-v1`, `codex/evidence-framework-v1` | Folded into row 7 |
| 7 | 09-21 | Final survey dossier | 5 axes, 50 nicknames, long evidence dossier result | Live on Pages since 09-23; in `main` since 09-25. Not the launch direction |
| 8 | 09-26 | Tag pilot | Sally's values research, 37 tags, voice gauntlet, `pilot/` build | Superseded by row 10 |
| 9 | 09-26 | Blind test kit V1 | 45 topic-scored cards | Test 1 failed: 0 of 6 sealed, repeats and ladder answers |
| 10 | 09-26 | **Persona quiz V2** | Sally's v2 system: 64 types, 6 axes, 50 tags, friend game; fix pass and release check | **The launch survey.** Kit in `research/persona-quiz-v2/final/` |
| 11 | 09-27 | **Persona web MVP** | V2 as a web game in the `quiz64` shell (branch `claude/survey-mvp-finish-20260927`) | Part of the launch survey. Unmerged |
| 12 | 09-28 | Result page drafts | Gazette, Constellation, Stories (`research/result-page-wireframes/`) | Jerry liked Stories; language to redo |
