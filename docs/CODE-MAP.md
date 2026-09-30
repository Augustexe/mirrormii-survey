# Source map

## Launch survey (persona quiz V2), verified 2026-09-29 (round 3 handoff)

Developer entry: **[quiz64/README.md](../quiz64/README.md)** (run, test, build, QA, full folder map, content flow, friend game and backend boundary, known gaps). This table is the short version.

| Part | Where |
|---|---|
| Content and scoring kit | `research/persona-quiz-v2/final/`: `bank/*.json` merged into `cards.json` (174 cards), `library.json`, `friend.json`, `score-core.mjs` (the one scorer, shared by the web app, CLI, sim and tests), `tests.mjs` (`node --test tests.mjs`), `check-bank.mjs`, `evidence-lock.json` |
| Web game | This checkout, branch `survey/launch`. `quiz64/src/main.jsx` paints `Boot.jsx`, then lazy loads `PersonaApp.jsx` |
| Kit binding and build-time strip of authoring fields | `quiz64/src/persona/kit.js`, `quiz64/kit-strip.mjs`, `quiz64/vite.config.js` |
| Run state machine, picker, lock, save and replay-validated restore | `quiz64/src/persona/session.js`, `store.js`, `sha256.js` |
| Game stats (six axes as Orbit, Delivery, Blueprint, Compass, Engine, Code) | `quiz64/src/persona/stats.js` |
| Friend challenge and reply links, friend and owner views | `quiz64/src/persona/friend.js`, `links.js` |
| Result: the 12-screen Stories reveal and share image | `quiz64/src/persona/views.js`, `stories/` (story-data.js is the pure projection), `reveal/`, `share-image.js` |
| Screens and play | `quiz64/src/persona/screens/`, `play/` (card and 13 formats, lock) |
| Design system, art, Genii | `quiz64/src/system/`, `quiz64/src/art/` (code-made art, device table), `quiz64/src/genii/` (evolution, three.js), `quiz64/public/assets/world/` (real MirrorMii world renders) |
| Tests and browser QA | `quiz64/tests/*.test.mjs` (`npm test` in `quiz64`), `quiz64/qa/capture-screens.mjs`, `qa-checks.mjs`, `play-through.mjs`, `tests/visual/fold.mjs` |
| Backend handoff and contracts | **[HANDOFF-DESMOND.md](HANDOFF-DESMOND.md)**; `docs/contracts/` (run, result, card, library, friend content and friend challenge schemas, events, API, `records.mjs`, examples); `scripts/validate-contracts.mjs` (run by `quiz64/tests/contracts.test.mjs`) |
| Question pack export | `docs/question-pack/` (QUESTION-PACK.md, generated CSV and counts); `scripts/export-question-pack.mjs` |
| Preview configs (workspace `.claude/launch.json`) | `persona-mvp` (web game, port 5174), `result-wireframes` (port 8793) |

Other worktrees of this repository: `/private/tmp/claude-501/survey-quiz-v2-wt` (`quiz-v2-fix-pass`, same commit as this checkout, removable) and older run worktrees for rows 5 to 7 of [history/BUILD-ITERATIONS.md](history/BUILD-ITERATIONS.md).

## Live dossier build (older), verified 2026-09-25

This is the live GitHub Pages build ([STATE.md](STATE.md)). The worktree below is clean at `ebaac09`, tracks `publication/codex/final-survey-dossier` with nothing ahead or behind, and includes the Pages workflow `.github/workflows/deploy-pages.yml`. Its local `origin` still points at the outdated `Augustexe/mirrormii-survey`; push to `publication`. The path sits inside a workbench folder that is due to leave the workspace: move the code before that happens (proposal in STATE.md).


Use [/Users/jerryzhang/Workspace-Draft/hall/data/jobs/mirrormii-genie-survey/20260921T072033Z-b5c7e4bdfdb4/scratch/worktree](/Users/jerryzhang/Workspace-Draft/hall/data/jobs/mirrormii-genie-survey/20260921T072033Z-b5c7e4bdfdb4/scratch/worktree), branch `codex/final-survey-dossier`, base `2e65313`. The app in registered `project/` is not the new build. Do not retarget `approved-app` or replace historical baselines as cleanup.

| Concern | Active file under `quiz64/src/` |
|---|---|
| Entry and complete respondent flow | `main.jsx`, `DossierApp.jsx`, reused `App.jsx` components, `dossier-adapter.css` (export dialog only) |
| Versioned routed bank and voice variants | `question-bank-v2.js` |
| Framework source of truth | `evidence-framework.js` (inherited) |
| Session, freeze, persistence, predictions, correction | `dossier-session.js` |
| Final evidence screen | `components/PersonalityDossier.jsx`, `DossierGameWorld.jsx`, `DossierStory.jsx`, `dossier-story.js`, scoped dossier styles |
| Synthetic display fixtures | `dossier-preview.jsx`, `dossier-fixtures.js`; `/preview.html` |

Run managed `system/bin/dev npm test --prefix quiz64` and `npm run build --prefix quiz64` from this worktree. Existing legacy tests remain as regression coverage. No production connection is configured by this task.

## Historical source map below

# Source map: select the right app before editing

Verified locally 2026-09-18 after branch cleanup.

The registered `project/` checkout is now local branch `main` at cleanup commit `8b2dfe1`, ahead of `origin/main` by one local context-reconciliation commit. It contains maintained `context/` masters, `docs -> context`, and the approved React/Vite app under `quiz64/`. Use `quiz64` commands to validate the approved app; the older 12/30/96 prototype branches were removed as branch names and preserved only in historical detached run worktrees / backup bundle.

The former wrapper `approved-app` link was historical; that path is no longer present. The release worktree previously contained `quiz64/`. That worktree is at `b8cf8eccddbe441c8a6bdc53e6791c418bfd2684` detached after cleanup; it formerly tracked `release/genii-approved-design`. The approved visual ancestor is `b0d7a89b964e0c0d00adec1093435a570f606343`. Preserve that review baseline; use an explicitly allocated implementation worktree for future code edits.

| R6 concern | Existing file |
|---|---|
| Candidate IDs, literal mappings, dimensions, measures, route slots | [data.js](../quiz64/src/data.js) |
| Respondent English wording | [english-copy.js](../quiz64/src/english-copy.js) |
| Host replies | [host-reactions.js](../quiz64/src/host-reactions.js) |
| Observations, claims, prediction and routines | [engine.js](../quiz64/src/engine.js) |
| Session, freeze, restore and feedback | [survey.js](../quiz64/src/survey.js) |
| Author question/evidence map | [QUESTION-MAP.md](../quiz64/docs/QUESTION-MAP.md) |
| Implemented interface contract | [IMPLEMENTATION-CONTRACT.md](../quiz64/docs/IMPLEMENTATION-CONTRACT.md) |
| App commands | [package.json](../quiz64/package.json) and [README](../quiz64/README.md) |

The experimental JSON in this context folder is an authoring candidate, not a module consumed by the app. Read the [integration map](questions/BUILD-INTEGRATION-MAP.md) before designing an adapter. New schemas must version question meanings, missingness, source roles, target/window fields, routing and saved-state behavior explicitly.

Current maintained context takes precedence over stale copied documentation in any historical worktree. Re-read the central context at the beginning and end of a task. Do not overwrite local changes or retarget the approved-app link without recording the new revision and reason.
