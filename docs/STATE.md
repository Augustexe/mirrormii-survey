---
title: Genii survey state
status: current
owner: jerry
updated: 2026-09-28
source_basis: questions/RUN-SPEC-LEDGER.md; questions/PERSONA-QUIZ-SPEC-V2.md; git state read 2026-09-28; 2026-09-28 audit of the persona MVP run (hall/data/jobs/mirrormii-genie-survey/20260928T014509Z-survey-mvp-02-ce97f3); Jerry's rulings 2026-09-28
---

# Genii survey state

## The launch survey: the one build we are finishing

There is one build: **persona quiz V2**. Everything else in this folder is history or reference. Do not start a parallel build or a new spec; improve this one.

**Purpose.** People finish it, get a read of their personality that feels accurate, fun and a little spicy ("I didn't know that about me"), share it so friends answer about them, and want to download MirrorMii. It must not read like another generic personality test.

| What | Where |
|---|---|
| Rulings (check before any work) | [questions/RUN-SPEC-LEDGER.md](questions/RUN-SPEC-LEDGER.md) |
| Spec | [questions/PERSONA-QUIZ-SPEC-V2.md](questions/PERSONA-QUIZ-SPEC-V2.md) |
| Open decisions | [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md), top section |
| Content and scoring (the kit) | `research/persona-quiz-v2/final/`: `cards.json` (61 chapter cards in 7 chapters, 8 finale, 12 extras), `library.json` (6 axes, 16 half-names, 50 tags with sting, heart and calls), `friend.json`, `score.mjs`, `tests.mjs` (27 pass) |
| Result template | `research/persona-quiz-v2/final/RESULT-TEMPLATE.md` (spec section 8) |
| Structure source | Sally's v2 system, `research/sally-v2-2026-09-26/` (Chinese originals). A template for structure and humor, never a translation source |
| Web game | `quiz64/src/PersonaApp.jsx` and `quiz64/src/persona/` in this checkout, branch `survey/launch` (see [CODE-MAP.md](CODE-MAP.md)). Not deployed |
| Result page drafts | `research/result-page-wireframes/` (Gazette, Constellation, Stories). Preview config `result-wireframes`, port 8793 |

### Status, 2026-09-28

| Part | State |
|---|---|
| Onboarding lobby | **Built 2026-09-28.** Four taps after setup: ending style, how personal, which rooms (love, work, family can be closed), how Genii reacts. Copy in `quiz64/src/persona/lobby.js` (`LOBBY_COPY`); gentle and sharp reaction lines still TODO |
| Picker and length | **Built 2026-09-28.** Every player answers exactly 40 cards (`RUN_SIZE` in `session.js`) plus the 8 sealed guesses. Covers all 6 sides on every room and depth combination (sim: 0% unfinished); lighter card after 3 rushed taps; same-side replacement after a skip. Cost: 8 tags never fired at 40 cards with every room open (they need 3+ cards); 48 cards would recover most |
| Question cards | Built and judged three times. Vivid scenes; keep |
| Evidence layer | Done. Every option carries axis values, tags and a did, would or believe grade |
| Names and tags | **Rewrite.** They are literal translations of Sally's Chinese slang and read flat in English |
| Result language | **Rewrite.** Library lines are generic, and draft lines read as gotcha or sitcom |
| Result display | Direction: the Stories format (Jerry liked it, 2026-09-28). Designed after the language pass |
| Friend game | Built in the web MVP. The link carries the owner's answer key (open) |
| Validation | None on real people. Blind test 1 (older kit): 0 of 6. Blind test 2 never run |

### Next, in order

1. Remove old dossier code from `quiz64` (the web game still borrows some of its components and CSS) and update `qa/persona-browser-qa.mjs` for the lobby.
2. English-native type names, tags and result lines, with Sally's as the template: 5 sample lines to Jerry first, then all of `library.json`.
3. Voices: Make it fun (default), a sharper voice, Be kind for heavy cards; gentle and sharp Genii reactions.
4. Result display in the Stories format (7 to 9 cards, type by card 3 or 4, told in the ending style from the lobby). Research: `research/result-page-wireframes/WRAPPED-RESEARCH.md`.
5. Blind test 2 with Jerry and 3 to 5 real people. The player prompt is `research/persona-quiz-v2/final/PROMPT.md`; a staged copy sits in `/private/tmp/genii-blind-test-2` (temporary folder, may be gone).

### Pending housekeeping (needs Jerry's OK for the git steps)

- Put the web game on one branch in this checkout (`survey/launch` = this branch + the MVP branch) so it no longer lives only in a run folder.
- Commit the 23 path-rewrite edits left over from the 2026-09-25 workspace rebuild.
- Remove the stale worktree `/private/tmp/claude-501/survey-quiz-v2-wt` (same commit as this branch).
- Remove `pilot/` and `research/blind-test-kit/` from git (superseded; Jerry asked on 2026-09-26 to clear out old bad evidence).
- Nothing is pushed. Merging the web game to the Pages branch would replace the live dossier below.

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

The project checkout is on branch `survey/tag-pilot-2026-09-26` (`5c47928`), which contains `main` plus the V2 kit. `main` (`c412671`) holds the live dossier app, merged 2026-09-25. The old dossier workbench worktree still exists under `hall/data/jobs/mirrormii-genie-survey/20260921T072033Z-b5c7e4bdfdb4/scratch/worktree`; [CODE-MAP.md](CODE-MAP.md) lists every worktree.

## Repositories

- Authoritative: `Augustexe/Mirrormii-survey-main-publication-` (local remote `publication`).
- Outdated: `Augustexe/mirrormii-survey` (local remote `origin`). It was made public on 2026-09-18 and got an older GitHub Pages site at https://augustexe.github.io/mirrormii-survey/ (not re-checked since). The mistaken branch pushed there was deleted on 2026-09-21; deleting or archiving the whole repository awaits Jerry's scope decision ([OPEN-QUESTIONS.md](OPEN-QUESTIONS.md)).

## History and research

- Every build so far, one line each: [history/BUILD-ITERATIONS.md](history/BUILD-ITERATIONS.md). Earlier builds do not govern the launch survey.
- SYNTH-30 personas and the TAM v0.1 model are synthetic planning research, not customer facts: [MARKET-MODEL.md](MARKET-MODEL.md).
