# MirrorMii launch survey: the Genii persona game

A phone-first web game hosted by Genii, MirrorMii's glass slime. The player taps 40 quick cards, Genii locks 8
guesses, the player plays those 8 sealed cards, then gets a 12-screen Stories reveal, a long-form Evidence Article, a
share image and a friend game ("How well do you know me?"). Entertainment and self-discovery, not a validated scale.
Everything runs in the browser today: no backend, accounts or analytics.

- **Live:** https://augustexe.github.io/mirrormii-survey/ (GitHub Pages, deployed from `main` by
  `.github/workflows/deploy-pages.yml` on every push)
- **Product owner:** Jerry. **Backend and deployment:** Desmond ([docs/HANDOFF-DESMOND.md](docs/HANDOFF-DESMOND.md)).

## Start reading here

1. [docs/LAUNCH-SPEC.md](docs/LAUNCH-SPEC.md): the one locked spec (rules, flow, scoring, question bank, result copy,
   visuals, quality gates, open decisions). Where anything else disagrees, the spec wins.
2. [quiz64/README.md](quiz64/README.md): the web app (run, test, build, browser QA, source map, content flow).
3. [docs/HANDOFF-DESMOND.md](docs/HANDOFF-DESMOND.md): backend, friend game server, contracts, deployment.
4. [docs/STATE.md](docs/STATE.md): one-page status.

## Run, test, build

Node 22 or newer. Commands run from the repository root.

```sh
npm ci --prefix quiz64
npm run dev --prefix quiz64 -- --port 5195     # http://127.0.0.1:5195/
npm test --prefix quiz64                       # app tests (includes the contract and docs checks)
npm run build --prefix quiz64                  # static build in quiz64/dist
```

## Quality gates

All must pass before a merge to `main` (which deploys). Full table with pass bars and last results: spec section 8.

```sh
node research/persona-quiz-v2/final/check-bank.mjs           # card bank rules, 0 errors
node --test research/persona-quiz-v2/final/tests.mjs         # scorer and kit tests
node research/persona-quiz-v2/final/lock-evidence.mjs        # evidence lock holds
npm test --prefix quiz64                                     # app tests
npm run build --prefix quiz64                                # production build
node scripts/validate-contracts.mjs                          # backend contracts against real runs
node scripts/export-question-pack.mjs --check                # question pack export is current
node scripts/check-docs.mjs                                  # spec has no retired labels, docs have no em dashes
```

## Folder map

```
README.md                    this page
AGENTS.md                    rules for coding agents working here
.github/workflows/           GitHub Pages deploy (build quiz64, publish quiz64/dist)
docs/
  LAUNCH-SPEC.md             the locked spec
  STATE.md                   one-page status
  HANDOFF-DESMOND.md         backend and deployment handoff
  VOICE.md                   how every card sounds (two voices, taste rules)
  NAMING-RULES.md            plain-names rules and the cold-reader gate for result labels
  contracts/                 JSON Schemas, API and events proposals, records.mjs, examples (checked by tests)
  question-pack/             generated export of the card bank (CSV, JSON) and how the bank is organized
  review/FINAL-CARD-READ.md  the last full read of every served card
quiz64/                      the web app (React, Vite): src/, public/, tests/, qa/, scripts/, docs/ (design)
research/persona-quiz-v2/final/
                             the content kit the app imports: card bank, merged cards.json, result copy
                             (library.json), friend game copy, the one scorer, checker, evidence lock, sim, tests
scripts/                     repo-level tools: contracts validator, question pack export, docs check, naming inventory
```

## How content reaches the app

```
research/persona-quiz-v2/final/bank/*.json   authored cards (7 chapters, extras, sealed), both voices
   | merge-bank.mjs, checked by check-bank.mjs, locked by lock-evidence.mjs
   v
cards.json + library.json + friend.json + score-core.mjs
   | imported by quiz64/src/persona/kit.js; kit-strip.mjs drops authoring fields at build
   v
the app bundle (quiz64/dist)
```

The full change flow for a card edit is spec section 5.
