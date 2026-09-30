# MirrorMii launch survey: the Genii persona game (quiz64)

**Start here.** This is the one entry page for a developer. The product rules live in
[../docs/LAUNCH-SPEC.md](../docs/LAUNCH-SPEC.md) (the only spec; where anything below differs, the spec wins).

## What the app is

A phone-first web game hosted by Genii (a glass slime, never a genie or a lamp). The player taps through 40 quick
cards in seven chapters (13 card formats, two voices: "Make it fun" and "Heart to heart"), Genii locks 8 guesses, the
player plays those 8 sealed cards, then gets a 12-screen Stories reveal: two archetype names, a game character sheet
(six stats with pips and a level word, no percentages), what Genii knows best, room by room, the core traits (5 to 6),
the stings, Genii's calls, a share image and the get-the-app screen. Genii itself evolves from an orb to the full slime
as cards are answered. The friend game ("Do you really know me?") runs on links.

It is entertainment and self-discovery, not a validated scale. Answers stay in the browser: no backend, account,
analytics or survey API.

## Run, test, build

Node 22 (the kit JSON uses import attributes). Commands run from `products/survey/`.

```sh
npm ci --prefix quiz64
npm run dev --prefix quiz64 -- --port 5195        # http://127.0.0.1:5195/
npm test --prefix quiz64                          # node --test tests/*.test.mjs (142 tests)
npm run build --prefix quiz64                     # dist/ (static, base "./")
cd quiz64 && npx vite preview --port 5196         # serve the production build
```

The content kit has its own checks (run inside `research/persona-quiz-v2/final/`):

```sh
node --test tests.mjs          # scorer, kit and evidence-lock tests
node check-bank.mjs --kit      # bank rules on the merged cards.json
node sim.mjs                   # reference simulation (SIM-REPORT.md)
```

and the web picker has a simulation: `node quiz64/tests/persona-sim.mjs --acceptance` (axis recovery, sealed
accuracy, random tappers, tag reach).

### Browser QA

All scripts use Playwright with the installed Chrome and need the **dev server** (they build game states in the page
with the app's own session module). Set `PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs`.

| Script | What it does |
|---|---|
| `qa/capture-screens.mjs [base] [outDir]` | Screenshot matrix: every screen, card format and reveal screen in both voices at 390x844, 375x667 and 1440x900 (`SIZES`, `ONLY`, `PLAYER` env) |
| `qa/qa-checks.mjs [base] [outDir]` | axe (WCAG 2 AA) on every screen, fonts, never-say copy, overflow at 390 px and 200% zoom, share PNGs, friend link flow, landing LCP and CLS |
| `qa/play-through.mjs [base] [fun\|heart\|cards] [outDir]` | One full run through the real UI (40 + lock + 8 + 12 reveal screens), mouse or `KEYS=1` keyboard only |
| `tests/visual/fold.mjs` | Every card of the bank in the real card screen: all options and exits above the fold at 390x844 |
| `tests/visual/play-evidence.mjs` | Proves the card sends the same answers as the pre-rebuild card for the same taps |
| `qa/capture-genii.mjs`, `qa/genii-lab.html` | Genii evolution stage sheet and a side-by-side lab against the canon render |
| `qa/make-world-assets.py` | Rebuilds `public/assets/world/` from the MirrorMii asset library (needs the library on disk) |

`qa/persona-browser-qa.mjs` is **superseded** (it drives the pre-lobby flow); use `play-through.mjs` and `qa-checks.mjs`.

## Folder map

```
quiz64/
  index.html            entry; preloads the landing's world image and the text font
  vite.config.js        React, font fallbacks (fontaine), the kit strip plugin; dev server may read ../research/.../final
  kit-strip.mjs         build-time plugin: drops authoring fields (masks, fingerprints, notes) from the kit JSON
  src/
    main.jsx, Boot.jsx  first paint: the landing from a tiny chunk, then PersonaApp loads lazily
    PersonaApp.jsx      the app shell and screen router (setup, lobby, play, lock, finale, reveal, friend game)
    system/             design system: tokens (CSS and JS), fonts, cascade layers, motion, GeniiLight, theme, Sheet
    art/                all art made in code: mirror arch, islands, backdrop and shader, glyphs (chapters, formats,
                        devices), device table (devices.js), palette, geometry, textures, world.js (real world assets)
    genii/              Genii's evolution: orb to droplet to slime (three.js scene, lazy; SVG fallback), stages in evolution.js
    persona/
      session.js        run state machine: setup, lobby, picker, answers, lock (sha256), finale, result, save and restore
      kit.js            binds cards.json, library.json, friend.json and the shared scorer
      stats.js          the six axes as game stats (Orbit, Delivery, Blueprint, Compass, Engine, Code) and their ends
      lobby.js          lobby ids and copy, host lines per voice
      reactions.js      Genii's between-card reactions
      views.js          player-facing projections of a finished run (resultView, share projection, mirror shards)
      friend.js, links.js   friend challenge and reply links (URL fragments), friend and owner views, ranking
      store.js, sha256.js   local storage, delete-all, canonical JSON and SHA-256 for the lock
      share-image.js    canvas share image (story and post formats) and per-screen saves
      screens/          landing (FogMirror), setup, lobby, chapter interludes, header, toast
      play/             the card (PersonaCard and the 13 formats), shard rail, chapter map, lock ritual
      reveal/           reveal building blocks: mirror, stage light, findings, calls, rooms, stat glyphs, world art
      stories/          the 12-screen Stories deck: story-data.js (pure projection, all result copy), StoryDeck,
                        StoryScreens, SheetScreens (character sheet, core traits, stings)
      FriendsPanel.jsx, FriendGame.jsx, FriendResultsView.jsx, PersonaDialogs.jsx
    legacy.css          the few rules still used from earlier builds, lowest cascade layer (tree-shaken; keep)
  public/assets/world/  real MirrorMii world and CGI Genii renders (mirror city, island, Genii), made by make-world-assets.py
  tests/                node tests (logic, kit parity, picker, friend links, render, reveal accuracy, style and asset guards)
  qa/                   browser QA scripts (above); qa/evidence holds an older report
  docs/                 design direction, verification, judge rounds, sheets (see "Docs" below)
```

## Where the content lives and how it reaches the app

```
research/persona-quiz-v2/final/bank/*.json   card bank, authored per chapter (plus extras and sealed)
        | node merge-bank.mjs  (checked by check-bank.mjs, evidence locked by lock-evidence.mjs -> evidence-lock.json)
        v
research/persona-quiz-v2/final/cards.json    the merged bank: 138 chapter cards, 12 extras, 24 sealed (174)
research/persona-quiz-v2/final/library.json  result copy: archetype names, tag names, lines, stings, hearts (both voices)
research/persona-quiz-v2/final/friend.json   friend game levels, relationships, privacy switches, invites
research/persona-quiz-v2/final/score-core.mjs  the one deterministic scorer (shared by the web app, CLI, sim and tests)
        | imported by src/persona/kit.js
        | kit-strip.mjs (Vite plugin) removes mask, fp, triggers, notes; keeps heart text, a scene title and the device
        v
the app bundle (PersonaApp chunk)
```

Change a card in `bank/`, merge, run the kit checks, then `npm test` here (the kit parity test proves the stripped
kit scores the same as the full one). Card rules, formats and the evidence layer: LAUNCH-SPEC sections 5 to 12 and 21.

**Scoring overview.** Six axes in two halves (R1 to R3 "with your people", L1 to L3 "with your life"), tags from
option evidence, grades and weights per format (`card-schema.mjs`), the picker in `session.js` (coverage first, then
flow and value), Genii's 8 sealed guesses frozen and hashed before the final cards. Read LAUNCH-SPEC sections 7 to 12,
`score-core.mjs`, and `docs/PERSONA-MVP.md` for the picker and storage details. Every line on the reveal traces to the
player's own scores: `tests/reveal-accuracy.test.mjs`.

## The friend game and backend boundary (Desmond)

What exists today, all in the browser:

- **Friend game v1** on two URL-fragment links: challenge `#play=<payload>` and reply `#reply=<payload>` (base64url
  JSON plus a SHA-256 check, 6000 characters max; `links.js`, `friend.js`). The owner opens the reply in the browser
  that holds their run. Known limit: the answer key rides in the challenge link, links are unsigned, and replies do
  not sync across devices. Details: `docs/PERSONA-MVP.md`, "Friend game".
- **Storage**: `localStorage` only (`genii.persona.v2.run`, `genii.persona.friend-play.v1`, `genii.motion.v1`).
  "Download my data" exports the run as JSON; "Delete my data" removes every `genii.*` key.

Stubs and placeholders to replace:

| Where | What |
|---|---|
| `src/persona/stories/story-data.js` `APP_LINK` | `"#get-mirrormii"`: the get-the-app button target, until the public app link is decided |
| `src/persona/stories/story-data.js` `SHARE_URL_LABEL` | `"mirrormii.ai"`: the address printed on the share image (no digits) |
| `src/persona/links.js` `linkFor` | challenge and reply links point at the current page; a backend would issue short links instead |
| `friend.js` `invitesFor` | invite lines per relationship, not yet used by the UI (the panel uses `inviteText`) |

What a finished run exposes (no network code exists; a backend would read these):

- `Session.resultFor(state)` returns `{ profile, result, sealed }`: the scorer profile (axis nets and poles, tag
  evidence), the scorer result (two halves with archetype names, shown tags, share block), and the sealed check
  (Genii's 8 locked guesses against the 8 answers).
- `views.resultView(state)` returns the 12 story screens (all player-facing copy, already filtered for privacy) and
  the share projection (both names, trait names with hearts, the invite; never stings, marriage or kids tags).
- `state.lobby` (voice, depth, rooms), `state.setup` (closest person, pronoun), `state.answers` (option indexes by
  card id, with answer times), `state.frozen` and `state.lockHash` (the lock), `state.challenges` (friend links and
  replies). `KIT_ID` pins every save and link to the kit that made it.

Not built (backend work): hidden answer keys and signed links, cross-device replies, accounts, analytics, a research
record store, the friend comparison view (bestie versus partner), and deployment. The live public site is still the
older dossier build (`../docs/STATE.md`).

## Known gaps

- No real-person validation yet (blind test 2 open, LAUNCH-SPEC section 17).
- Two chunks are over 500 kB minified: `PersonaApp` (the kit JSON and app, about 207 kB gzip) and `scene` (three.js
  for Genii, lazy, about 146 kB gzip). The landing paints from the small `main` chunk first.
- `public/fonts/Satoshi-Variable.woff2` and its license files are unused leftovers (Satoshi is aliased to Figtree and
  never fetched); left in place pending a decision.
- `src/system/tokens.js` `choreography`, `.mm-btn--glass`, `.mm-btn--block` and `.mm-genii-line` are design-system
  entries the current screens do not use; kept as part of the system.
- `library.json` axis `topic` strings still echo internal pole words; the reveal reads stat names from `stats.js`.

## Docs

| Doc | Use it for |
|---|---|
| [../docs/LAUNCH-SPEC.md](../docs/LAUNCH-SPEC.md) | the spec: rules, rulings, numbers, status (section 17), rounds (sections 23 and 24) |
| [docs/DESIGN-DIRECTION.md](docs/DESIGN-DIRECTION.md) | the visual system, screen by screen (section 5), QA checklist (section 7) |
| [docs/PERSONA-MVP.md](docs/PERSONA-MVP.md) | engine notes: picker, storage, friend links (older sections are marked) |
| [docs/QA-REPORT.md](docs/QA-REPORT.md), `docs/VISUAL-JUDGE-CODEX-R*.json` | QA and independent visual judge rounds |
| `docs/ROUND3-SHEET.png` | the full phone flow at 390x844 as of round 3 |
| [../research/persona-quiz-v2/final/README.md](../research/persona-quiz-v2/final/README.md) | the content kit |

Older build docs in `docs/` (ASTRA-*, IMPLEMENTATION-CONTRACT, QUESTION-MAP, EVIDENCE-ENGINE-CONTRACT, ENGLISH-VOICE,
RELEASE-REVIEW) describe removed survey generations; they stay as history only.
