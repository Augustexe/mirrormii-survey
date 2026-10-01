---
title: Persona quiz V2 web MVP, verification record
date: 2026-09-27
branch: claude/survey-mvp-finish-20260927
status: local verification only; no human players, no deployment
---

> **Dated record, not the spec.** Current gates and numbers are in the locked spec [LAUNCH-SPEC.md](../../docs/LAUNCH-SPEC.md) section 8; section numbers cited below refer to the pre-lock spec, now [history](../../docs/history/LAUNCH-SPEC-2026-09-29-full.md).

> Dated verification record (2026-09-27, before build C and rounds 2 and 3). Current gate numbers: LAUNCH-SPEC section 17; entry page: [../README.md](../README.md).


# Verification record

All commands ran from this worktree with the managed toolchain (`/Users/jerryzhang/Workspace-Draft/system/bin/dev`,
Node 24.21.0). Browser checks used headless Google Chrome through Playwright 1.62.1 against `vite preview` of the
production build on http://127.0.0.1:4188/.

## Reference kit (research/persona-quiz-v2/final)

| Command | Result |
|---|---|
| `node --test tests.mjs` | 27 of 27 pass, before and after the score-core split |
| `node sim.mjs` | Writes `SIM-REPORT.md` and `sim-example/` byte for byte identical to the committed files (`git status` clean for both), so the split changed no score |

## quiz64

| Command | Result |
|---|---|
| `npm test` | 124 of 124 pass: the 95 earlier tests plus 29 persona tests |
| `npm run build` | Passes. One JS chunk of about 561 kB (179 kB gzip) triggers Vite's 500 kB advisory warning; no code splitting attempted |

Persona tests by file:

- `persona-kit.test.mjs` (3): the web app's scorer returns the same profile, result, lock and friend deck as `score.mjs`
  and matches `sim-example/result.json`; stripping authoring fields for the bundle changes no score; kit shape.
- `persona-session.test.mjs` (12): SHA-256 against node:crypto; setup and under-13 refusal; adult run order and counts;
  teen runs never see 18+ cards or score marriage and kids tags; the C3-9 gate; feeling cards after picked moments only;
  exits, pick two, depends follow-ups, order and timing validation; rushed taps; adaptive extras (two when a side has
  none, one when it has one, a pass and "?" when both are skipped); lock once, no finale before the lock, no chapter
  answer after it, changed guesses or answers refuse to score; finale answers never become evidence; save, resume and
  eleven kinds of bad saves failing closed.
- `persona-friend.test.mjs` (10): challenge links carry ids and the answer key only (no stings, answer text, research
  or scores) for all four relationships; Level 2 excludes private, rushed, circumstance and depends answers; teen owners
  get no 18+ switch or tags; perfect and wrong friends, friend-side counts equal owner-side scores, reply replaces an
  earlier reply, restore keeps it; the under-18 friend deck; ranking; malformed, tampered and foreign challenge and
  reply links (31 cases); name rules; an owner with no named tags; the 20-link cap never strands a reply and an
  orphaned reply is dropped on restore instead of breaking the save.
- `persona-ui.test.mjs` (4): every card (adult and teen) renders its prompt, options and only its own exits, 18+
  label only on locked cards; result page follows the template with owner-only markers, no ids or system words, the
  word "tags" only in its heading, no sting on the share card; every friend-game screen, counts-only done screen and
  the owner view; the no-tags explanation.

## Browser flows (qa/persona-browser-qa.mjs, qa/evidence/report.json)

123 of 123 checks pass. Every flow also checks: no page errors, no console errors or warnings, no failed requests,
no request leaving 127.0.0.1:4188 (the app made 11 to 25 same-origin requests per flow, 0 external).

| Flow | Width | What it proved |
|---|---|---|
| Adult owner | 1280 desktop | Setup by taps; 61 chapter cards including the 18+ ones; every chapter title card; a depends follow-up stored; calm timing (0 rushed); lock code shown and equal to the stored hash before any finale card; no guess visible before the finale; 8 finale cards; result with every template section, no ids or system words; reload returns to the result |
| Friend loop | owner desktop, friend 390 mobile in a separate browser profile | Bestie link with the sting round and a name (837-character fragment link); friend plays all four levels with a why-chip; guessed type after question 6; friend result shows counts only and none of the owner's stings; friend's browser stores only friend-game progress; reply link (532 characters) imported by the owner; owner view with all zones, the bonus round and the type comparison; reply fragment cleared; "Your turn" starts the friend's own run, and stopping it at Under 13 saves nothing; a second tab makes a link, the first tab notices, and a link made there keeps both links and the reply |
| Tampered save | 1280 | A save whose locked guesses were edited is refused with a readable message and a fresh start |
| Teen owner | 390 mobile, reduced motion | Tab and Enter answer a card; tap targets at least 44 px; no horizontal overflow; 57 chapter cards, none of the four 18+ cards; 16 teen prompts used; no marriage or kids tag; no marriage and kids switch in the friend composer |
| Unfinished side | 1280 | Skipping every card that carries one side brings "Two more cards and Genii can call it" and exactly that side's two extras; the side is finished afterwards |
| Malformed links | 390 mobile | Garbage, bad checksum, a hand-edited real link, an HTML/script payload, an oversized link, another kit version, an HTML name, a reply opened in a browser without the run, a broken reply: each lands on a readable error screen and nothing executes; a reload after a bad link lands on the start page |
| Resume and delete | 1280 | Reload mid-chapter resumes on the same card with 5 answers saved; "Play again from the start" removes the saved run; "Delete my data" removes every `genii.*` key and the landing starts fresh |
| Landing | 390 mobile | No horizontal overflow |

Curated screenshots kept in git (`qa/evidence/`): landing, a card, the lock code, the result, the friend's result,
the owner's friend view, a teen card on mobile, a malformed-link error. The harness regenerates the full set.

## Independent review

A read-only reviewer agent checked the change set against the spec rules and probed 4,800 generated friend links
(150 random adult and teen runs, 4 relationships, 8 switch combinations, adult and under-18 friends): every link
parsed, friend-side and owner-side scores matched, no 18+ tag reached a teen owner or an under-18 friend. It found and
this branch fixed: the 21st friend link dropped a played link and stranded its reply (crash and unloadable save);
two open tabs could overwrite each other's saves (now a write only lands if storage still holds what the tab last
read, and tabs follow each other's saves); "Your turn" then "Under 13" left a saved name; a bad `#play=` link came back
on reload; a tap could answer after "Save and leave". Accepted as known: the friend answer key is readable in the
challenge link (see PERSONA-MVP.md), and anyone holding a link can replay it.

## Not verified

- No real people played it: comprehension, fun, rushing and whether the result feels accurate are unmeasured
  (blind test 2 and the spec section 12 checks remain).
- Friend difficulty is not simulated. The friend answer key is readable by anyone who decodes the challenge link.
- Browsers other than Chrome, screen readers, and real phones were not tested; mobile was emulated at 390 x 844.
- Clipboard, the native share sheet and PNG download were not exercised by the harness (they need user gestures or
  permissions); the PNG code path mirrors the existing share-card export.
