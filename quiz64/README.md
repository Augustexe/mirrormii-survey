# Genii persona game (quiz64)

A local React/Vite web game hosted by Genii: seven chapters of real-life cards, eight guesses Genii locks before the
finale, a two-part type with up to five persona tags, a share card, and the "Do you really know me?" friend game.
Content and scoring come from the maintained V2 kit in `../research/persona-quiz-v2/final/`; the rules are
`../docs/questions/PERSONA-QUIZ-SPEC-V2.md`. How the app is put together: [docs/PERSONA-MVP.md](docs/PERSONA-MVP.md).
Verification record: [docs/PERSONA-MVP-VERIFICATION.md](docs/PERSONA-MVP-VERIFICATION.md).

It is entertainment and self-discovery, not a validated scale. Answers stay in the browser: no backend, account,
analytics or API.

## Run locally

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm ci --prefix quiz64
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run dev --prefix quiz64 -- --port 4188
# or the production build:
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run build --prefix quiz64
cd quiz64 && /Users/jerryzhang/Workspace-Draft/system/bin/dev npx vite preview --host 127.0.0.1 --port 4188 --strictPort
```

Open http://127.0.0.1:4188/. To try the friend game on one machine, make a link on your result page, open it in a
private window (the friend), finish, then open the reply link back in the first window.

## Verify

```sh
cd research/persona-quiz-v2/final && node --test tests.mjs && node sim.mjs   # reference kit: 27 tests, sim report unchanged
cd quiz64 && npm test                                                       # 124 tests (95 earlier + 29 persona)
cd quiz64 && npm run build
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/persona-browser-qa.mjs http://127.0.0.1:4188/   # needs the preview server
```

The browser harness uses the installed Google Chrome and writes `qa/evidence/report.json` plus screenshots.

## Earlier builds in this folder

`App.jsx`, `DossierApp.jsx`, `data.js`, `engine.js`, `dossier-session.js` and their tests are the previous survey
generations (Switch Modes v3, V4 language candidate, the live dossier). They stay as regression coverage; the
persona game reuses their visual components (`GeniiStage`, `AmbientWorld`, `ConversationProgress`, `ChapterObject`,
dialog focus handling and the card, jewel and world styles). Their contracts: `docs/IMPLEMENTATION-CONTRACT.md`,
`docs/ASTRA-IMPLEMENTATION.md`, `docs/DESIGN-DIRECTION.md`. The dossier developer preview (`preview.html`) runs
under `npm run dev` only.
