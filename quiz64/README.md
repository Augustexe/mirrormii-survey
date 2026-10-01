# MirrorMii launch survey: the Genii persona game (quiz64)

The developer page for the web app. The repository entry is [../README.md](../README.md); the product rules live in
[../docs/LAUNCH-SPEC.md](../docs/LAUNCH-SPEC.md) (the one locked spec; read it first; where anything below differs, the spec wins).

## What the app is

A phone-first web game hosted by Genii (a glass slime, never a genie or a lamp). The player taps through 40 quick
cards in seven chapters (13 card formats, two voices: "Make it fun" and "Heart to heart"), Genii locks 8 guesses, the
player plays those 8 sealed cards, then gets a 12-screen Stories reveal: one title (the people archetype) with one
story line that merges both halves, the drama stats (four D&D style stat blocks scored 1 to 20 from
`src/persona/rpg-stats.js`, all six in the article), what Genii knows best, room by room, the core traits (5 to 6),
the stings, Genii's calls, a share image and the get-the-app screen. Genii itself evolves from an orb to the full slime
as cards are answered. The friend game ("How well do you know me?") runs on links.

It is entertainment and self-discovery, not a validated scale. Answers stay in the browser: no backend, account,
analytics or survey API.

## Run, test, build

Node 22 or newer (the kit JSON uses import attributes). Commands run from the repository root.

```sh
npm ci --prefix quiz64
npm run dev --prefix quiz64 -- --port 5195        # http://127.0.0.1:5195/
npm test --prefix quiz64                          # node --test tests/*.test.mjs (includes the contract checks)
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
| `qa/layout-guard.mjs [base] [outDir]` (`npm run qa:layout -- [base]`) | Layout guard: walks landing, setup, lobby, interlude, a card of each format, lock, finale, every Stories screen (scrolled in steps) and the whole Evidence Article (scrolled in steps, section menu, every tab) at 375x667, 390x844 and 1440x900 in both voices. Fails on text over text, icons or controls; text showing through a fixed or sticky bar without a solid backing; text clipped by overflow, ellipsis or line clamp; text or controls off the left or right edge; labels squeezed into round pills; controls a sticky bar covers once focused. Writes `report.json` and a marked screenshot per failing step to outDir (default `qa/layout-report/`, ignored); exit 1 on any failure or error. A format no run can reach (feeling cards while `SERVE_FEELING` is off; rank, served only for coverage) is a printed note, not an error; `tests/visual/fold.mjs` still renders every card of both. Justified exceptions live in its `EXCEPTIONS` list (none today). Env: `SIZES`, `VOICES`, `ONLY`, `PLAYER=a\|b\|c`. Run it after any CSS or layout change |
| `qa/qa-checks.mjs [base] [outDir]` | axe (WCAG 2 AA) on every screen, fonts, never-say copy (and the retired "your person"), overflow at 390 px and 200% zoom, share PNGs, friend link flow, landing LCP and CLS. Default outDir `qa/qa-report/` (ignored); unreachable formats are notes, as in the layout guard |
| `qa/play-through.mjs [base] [fun\|heart\|cards] [outDir]` | One full run through the real UI (40 + lock + 8 + 12 reveal screens), mouse or `KEYS=1` keyboard only |
| `tests/visual/fold.mjs` | Every card of the bank in the real card screen: all options and exits above the fold at 390x844 |
| `tests/visual/play-evidence.mjs` | Proves the card sends the same answers as the pre-rebuild card for the same taps |
| `qa/article-axe.mjs [base]`, `qa/article-capture.mjs [base] [outDir]` | axe on the Evidence Article; section-by-section captures at phone and desktop (shared setup in `qa/article-open.mjs`) |
| `qa/article-sheet.mjs [base] [out.png]`, `qa/drama-sheet.mjs [base] [out.png]` | Contact sheets: the whole article for three players, and the drama stats for four players, both voices (default out in their ignored `qa/` folders) |
| `qa/capture-genii.mjs`, `qa/genii-lab.html` | Genii evolution stage sheet and a side-by-side lab against the canon render |
| `qa/capture-genii.mjs` with `STILL=1` | Saves the transparent still of our own 3D Genii that the share image draws (`public/assets/island/genii-still.png`) |

Every QA output folder under `qa/` is git-ignored; screenshots and sheets never go into `docs/`.

## Folder map

```
quiz64/
  index.html            entry; preloads the landing's world image and the one font (Satoshi)
  vite.config.js        React, the kit strip plugin; dev server may read ../research/.../final
  kit-strip.mjs         build-time plugin: drops authoring fields (masks, fingerprints, notes) from the kit JSON
  src/
    main.jsx, Boot.jsx  first paint: the landing from a tiny chunk, then PersonaApp loads lazily
    PersonaApp.jsx      the app shell and screen router (setup, lobby, play, lock, finale, reveal, friend game)
    system/             design system: tokens (CSS and JS), fonts, cascade layers, motion, GeniiLight, theme, Sheet
    art/                the World Mirror (MirrorArch: canon frame render over a code-drawn opal ring), chapter islets
                        (Islet), backdrop and shader, glyphs (chapters, formats, devices), device table (devices.js),
                        palette, geometry, textures, world.js (the canon island renders and the mirror's geometry)
    genii/              Genii's evolution: orb to droplet to slime (three.js scene, lazy; SVG fallback), stages in evolution.js
    persona/
      session.js        run state machine: setup, lobby, picker, answers, lock (sha256), finale, result, save and restore
      kit.js            binds cards.json, library.json, friend.json and the shared scorer
      combo-lines.js    the one story line per archetype pair (names-64.json; kit-strip.mjs ships only the lines)
      stats.js          the one source for scale labels: half kickers, the six stats and their ends, retired labels (LAUNCH-SPEC section 6)
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
                        StoryScreens, SheetScreens (drama stats, core traits, stings)
      FriendsPanel.jsx, FriendGame.jsx, FriendResultsView.jsx, PersonaDialogs.jsx
    legacy.css          the few rules still used from earlier builds, lowest cascade layer (tree-shaken; keep)
  public/assets/island/ canon GDD v0.2 renders (LAUNCH-SPEC section 7): island day, wide and night, the World Mirror frame, the
                        room inside it, seven chapter islets, a still of our 3D Genii; sizes in MANIFEST.json
  tests/                node tests (logic, kit parity, picker, friend links, render, reveal accuracy, style and asset guards)
  scripts/              calibrate-drama.mjs (drama stat calibration), make-textures.mjs, render-icons.mjs (favicon, OG image)
  qa/                   browser QA scripts (above)
  docs/                 design direction, Evidence Article design and art set, dependency notices (see "Docs" below)
```

## Where the content lives and how it reaches the app

```
research/persona-quiz-v2/final/bank/*.json   card bank, authored per chapter (plus extras and sealed)
        | node merge-bank.mjs  (checked by check-bank.mjs, evidence locked by lock-evidence.mjs -> evidence-lock.json)
        v
research/persona-quiz-v2/final/cards.json    the merged bank: 136 chapter cards, 12 extras, 24 sealed (172)
research/persona-quiz-v2/final/library.json  result copy: archetype names, tag names, lines, stings, hearts (both voices)
research/persona-quiz-v2/final/friend.json   friend game levels, relationships, privacy switches, invites
research/persona-quiz-v2/final/naming/names-64.json   the story line under the title, per people x day-to-day pair (src/persona/combo-lines.js)
research/persona-quiz-v2/final/score-core.mjs  the one deterministic scorer (shared by the web app, CLI, sim and tests)
        | imported by src/persona/kit.js
        | kit-strip.mjs (Vite plugin) removes mask, fp, triggers, notes; keeps heart text, a scene title and the device
        v
the app bundle (PersonaApp chunk)
```

Change a card in `bank/`, merge, run the kit checks, then `npm test` here (the kit parity test proves the stripped
kit scores the same as the full one). The full change flow, with the friend snapshot, the sim example, the contract
examples and the question pack, is LAUNCH-SPEC section 5. Card rules, formats and the evidence layer: LAUNCH-SPEC sections 4 and 5.

**Scoring overview.** Six axes in two halves (R1 to R3 the people half, L1 to L3 the life half), tags from
option evidence, grades and weights per format (`card-schema.mjs`), the picker in `session.js` (coverage first, then
flow and value), Genii's 8 sealed guesses frozen and hashed before the final cards. Read LAUNCH-SPEC section 4,
`score-core.mjs`, and the engine notes below. Every line on the reveal traces to the
player's own scores: `tests/reveal-accuracy.test.mjs`.

**Engine notes** (`src/persona/session.js`; rules in LAUNCH-SPEC sections 3 and 4):

- The run is a plain JSON object (schema `genii.persona.run/3`; `/1` and `/2` saves are refused). Every write goes
  through one step machine, and a restored save is replayed card by card through the same step machine and picker
  before it is trusted.
- Setup is two taps (closest person, pronoun); the lobby is stored as `{ voice, depth, rooms }`. `voice` is `fun`,
  `heart` or `cards` (Just the cards reads Make it fun); `depth: "light"` skips `privacy: "intimate"` cards.
- A card carries both voices: top-level text is Make it fun, `card.heart` holds Heart to heart in the same option
  order. Answers are option indexes either way, so evidence is never duplicated.
- The picker is deterministic: the only randomness is seeded from the run id. The 8 sealed cards are drawn per run
  from the pool of 24 with a seed from `sha256("genii.finale|" + runId)` (`finaleIds`); Genii's guesses are frozen and
  hashed (`lockHash`) before the first sealed card.

## The friend game and backend boundary (Desmond)

**Desmond's entry is [../docs/HANDOFF-DESMOND.md](../docs/HANDOFF-DESMOND.md)**: data flow, build order, the backend contracts in [../docs/contracts/](../docs/contracts/) (JSON Schemas for the stored run, the result record, the question pack, the library and the friend links, plus the proposed API and analytics events), placeholders, deployment and open decisions. `node ../scripts/validate-contracts.mjs` checks the contracts against real runs; `tests/contracts.test.mjs` runs it inside `npm test`.

What exists today, all in the browser:

- **Friend game v1** on two URL-fragment links: challenge `#play=<payload>` and reply `#reply=<payload>` (base64url
  JSON plus a SHA-256 check, 6000 characters max; `links.js`, `friend.js`). The owner opens the reply in the browser
  that holds their run. Known limit: the answer key rides in the challenge link, links are unsigned, and replies do
  not sync across devices. Link formats: [../docs/contracts/friend-challenge.md](../docs/contracts/friend-challenge.md).
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
record store and the friend comparison view (bestie versus partner). The static build is live on GitHub Pages
(`../docs/STATE.md`).

## Known gaps

- No real-person validation yet (blind test 2 open, LAUNCH-SPEC section 10).
- Two chunks are over 500 kB minified: `PersonaApp` (the kit JSON and app, about 212 kB gzip, 2026-09-30) and `scene` (three.js
  for Genii, lazy, about 146 kB gzip). The landing paints from the small `main` chunk first.
- Resolved 2026-09-30: Satoshi is the one font (`src/system/fonts/satoshi-variable.woff2`, license in `public/fonts/`), upright only; see
  `docs/DESIGN-DIRECTION.md` 4.1 and LAUNCH-SPEC section 7.
- `src/system/tokens.js` `choreography`, `.mm-btn--glass`, `.mm-btn--block` and `.mm-genii-line` are design-system
  entries the current screens do not use; kept as part of the system.
- `library.json` axis `topic` strings still echo internal pole words; the reveal reads stat names from `stats.js`.

## Docs

| Doc | Use it for |
|---|---|
| [../docs/LAUNCH-SPEC.md](../docs/LAUNCH-SPEC.md) | the locked spec: rulings (section 2), flow, scoring, copy, gates with commands (section 8), open decisions (section 10) |
| [../docs/HANDOFF-DESMOND.md](../docs/HANDOFF-DESMOND.md) | the backend and friend game handoff: contracts, API, events, question pack, deployment, open decisions |
| [docs/DESIGN-DIRECTION.md](docs/DESIGN-DIRECTION.md) | the visual system, screen by screen (section 5), QA checklist (section 7); partly superseded, the spec's section 7 says where |
| [docs/ARTICLE-DESIGN.md](docs/ARTICLE-DESIGN.md), [docs/ARTICLE-ART-SET.md](docs/ARTICLE-ART-SET.md) | the Evidence Article design record and its spot art set |
| [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) | shipped packages and licenses |
| [../research/persona-quiz-v2/final/README.md](../research/persona-quiz-v2/final/README.md) | the content kit |
