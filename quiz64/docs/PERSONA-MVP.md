> **Developer entry: [../README.md](../README.md).** This page keeps the engine notes (picker, storage, friend links). Blocks at the top are newer than the sections below them; where they disagree the newer block and LAUNCH-SPEC win. The result is now the 12-screen Stories reveal (LAUNCH-SPEC sections 21, 23 and 24), not the result page described under "The player journey as built".

> Picker weights and rules changed in step B (2026-09-28): see docs/LAUNCH-SPEC.md section 10 and quiz64/src/persona/session.js; the picker notes below predate step B.

> Build C engine (2026-09-28, LAUNCH-SPEC sections 21 and 22). Where the notes below still mention an age band, teen
> prompts, locked 18+ cards, the ending tap or the delivery tap, this block wins:
> - **Setup** is two taps (closest person, pronoun). No age screen, no under-13 stop, no teen or 18+ logic anywhere,
>   friend game included (no age question for friends, no under-18 deck copy in links). Former 18+ cards are `intimate`.
> - **Lobby** is three taps, stored as `{ voice, depth, rooms }` (schema `genii.persona.run/3`; `/1` and `/2` saves
>   fail closed). `voice`: fun (Make it fun), heart (Heart to heart), cards (Just the cards: Make it fun wording, no
>   between-card lines). `depth`: light (skips `privacy: "intimate"`) or anything. Copy in `LOBBY_COPY`; host lines per
>   voice via `hostLine(voice)`. `Session.voiceFor(run)` and `cardVoiceFor(run)` read it; the ending tap is gone.
> - **Two voices on a card**: `card.heart = { prompt, options: [strings, same order], thread? }`. `S.promptFor`,
>   `S.optionText` and `S.threadFor` take the voice ("heart" or anything else); a card without `heart` reads Make it
>   fun. Answers are option indexes either way, so evidence is never duplicated. `fp` (fingerprint) is stripped from the
>   bundle with the other authoring keys; `heart` ships.
> - **Formats**: `guilty` is now `bet` (3 to 5 own answers, did 0.80; the 6 legacy cards keep their two options until
>   rewritten). New `rank` (answer: every option index once, first to last; position weights 1.0, 0.5, 0, -0.5 on each
>   item's evidence, believe 0.45; UI: tap in order, then Done) and `eyes` (one pick, believe 0.45). Grades, weights,
>   exits and type groups live in `research/persona-quiz-v2/final/card-schema.mjs`. Rushed-streak light types: this or
>   that, role, bet, eyes. Spread types: receipts, bet. Rank and receipts never enter a friend deck.
> - **Sealed pool**: `kit.finale` is the pool; each run plays `FINALE_SIZE` (8) cards drawn by `S.drawFinale(seed)`,
>   seeded from `sha256("genii.finale|" + runId)` (`Session.finaleIds(run)`): one per axis where possible, then 2
>   tag-pair cards, locked with sha256 as before.
> - **Bank tooling** (in `research/persona-quiz-v2/final/`): `node check-bank.mjs` (bank checker, `--kit` for
>   cards.json), `node merge-bank.mjs` (bank/*.json to cards.json), `node audit.mjs` (section 22 coverage targets).
>   `assemble.mjs` is retired and refuses to run (library.json is hand-edited now).

> Code notes for the web game. The spec is [docs/LAUNCH-SPEC.md](../../docs/LAUNCH-SPEC.md); where they differ, the spec wins.

---
title: Persona quiz V2 web MVP, implementation contract
status: local MVP, verified 2026-09-27; not deployed, not human-validated
owner: jerry
branch: claude/survey-mvp-finish-20260927 (based on 5c47928)
rules: ../../docs/questions/PERSONA-QUIZ-SPEC-V2.md
content: ../../research/persona-quiz-v2/final/ (cards.json, library.json, friend.json, score-core.mjs)
---

# Persona quiz V2 web MVP

One Genii product: the Mirror, Mirror visual system (docs/DESIGN-DIRECTION.md) plays the maintained V2 persona kit end
to end, including the friend game. `src/main.jsx` paints `Boot.jsx` (the landing from a small chunk) and lazy loads
`PersonaApp.jsx`. The dossier app, its V4 bank, components, preview and tests were removed at integration (2026-09-29);
they live in git history (before commit 2ac2fc6).

## Where things live

| Concern | File |
|---|---|
| Scoring, route rules, lock, friend decks and friend scoring (shared with the Node kit CLI, sim and tests) | `../research/persona-quiz-v2/final/score-core.mjs` |
| Kit binding (JSON imports, `KIT_ID`) | `src/persona/kit.js` |
| Build-time removal of authoring fields (masks, triggers, origins, "never" notes) | `kit-strip.mjs`, wired in `vite.config.js` |
| Run state machine: setup, lobby, the picker, lock, finale, result, save and replay-validated restore | `src/persona/session.js` |
| Lobby ids, every new lobby and picker line (`LOBBY_COPY`), host lines by voice | `src/persona/lobby.js` |
| Friend challenge, link payloads, friend deck view, reply import, owner and friend views, ranking | `src/persona/friend.js` |
| Fragment payload encoding and validation | `src/persona/links.js` |
| Result page and share projections | `src/persona/views.js` |
| Storage (run key, friend-play key, delete-all) | `src/persona/store.js` |
| Synchronous SHA-256 and canonical JSON for the lock | `src/persona/sha256.js` |
| First paint (landing before the game chunk loads; taps kept in `bootIntent`) | `src/Boot.jsx` |
| Screens | `src/PersonaApp.jsx`; barrels `src/persona/screens/` (A), `src/persona/play/` (B), `src/persona/reveal/` and `src/persona/stories/` (C); `FriendsPanel.jsx`, `FriendGame.jsx`, `FriendResultsView.jsx`, `PersonaDialogs.jsx` |
| Design system, art | `src/system/` (tokens, fonts, layers, GeniiLight, theme), `src/art/` (asset library) |
| Legacy CSS (what the app still uses from 13 earlier stylesheets, tree-shaken) | `src/legacy.css`, lowest cascade layer |
| Tests | `tests/*.test.mjs` (logic, kit parity, friend links, render, style guards, art); browser: `tests/visual/fold.mjs`, `tests/visual/play-evidence.mjs` |
| Browser QA | `qa/play-through.mjs` (real UI, 40 + lock + 8 + 12 screens, mouse or `KEYS=1`), `qa/capture-screens.mjs` (screenshot matrix), `qa/qa-checks.mjs` (axe, fonts, copy, overflow, share PNGs, friend flow); report in `docs/QA-REPORT.md` |

## The player journey as built

Steps 2 and 3 below describe the fixed chapter walk. Since 2026-09-28 the lobby and the picker replace them; see
"Lobby and picker (2026-09-28)".

1. **Setup** (three taps, no typing): age band (18 or older / 13 to 17 / Under 13), closest person (best friend,
   partner, crush, sibling, parent, someone else), pronoun for the friend game. Under 13 stops with a friendly screen
   and stores nothing.
2. **Seven chapters.** Each opens with its title card (the kit's intro is Genii's bubble). Cards come one at a time in
   kit run order and answer on tap (kit rule: one card at a time, no back button). Each card shows only its own exits
   (Skip, Not my life, No recent example on real cards). `pick_two` needs exactly two taps. A "depends" option opens
   "What would flip you?" with the three presets plus Skip. Locked 18+ cards carry an 18+ label and never reach a teen;
   teen prompts replace prompts where the kit has them. C3-9 appears only after a C3-8 pick with the kids-yes line.
   A feeling card plays only when the card it follows got a real pick (after Skip or No recent example it would ask
   about a moment that didn't happen). Time from the card appearing to the answering tap is stored per card; under
   1.5 s counts at 0.3 (kit rule) and three fast taps in a row change Genii's bubble to a gentle nudge.
3. **Adaptive extras.** After chapter 7, any side with fewer than two valid cards gets its extras under the title card
   "Two more cards and Genii can call it". Extras for a side stop as soon as it has enough cards (1 or 2 per side).
4. **Lock, then finale.** The lock screen explains the rule, then "Lock in Genii's guesses" freezes the eight guesses
   with `freezePredictions` from score-core, stores the profile hash and a SHA-256 over the guesses, and shows the lock
   code before any finale card. A second lock is refused. After the lock no chapter card can be answered again.
   Finale answers lock on tap and never enter the profile. Before scoring, the app checks the stored guesses against
   the lock hash and recomputes the profile from the answers; any change refuses to score.
5. **Result** (RESULT-TEMPLATE.md order): two-part type, code with "?" for an unfinished side, Flex badges, the two
   halves with tappable pole chips, what stings (only you), what you love, up to five tags with "You told Genii" quotes,
   sting (only you) and heart, Genii's calls, the plot twist when a qualifying split exists (only you), and Genii's
   guesses with hits, misses and passes. If no tag qualifies, the page says why instead of inventing one.
6. **Share card**: type name, tag names with hearts, "Do you really know me?". Save as PNG or copy the text.
7. **Friend game** (below), then **resume, restart and delete** from the header and the More menu.

## Friend game: links, privacy and scoring

The owner picks a relationship (partner, crush, friend or coworker, bestie), the switches that relationship offers
(`friend.json` privacyToggles: love tags, marriage and kids tags for an 18+ owner, the bestie sting round, showing the
real type), a preset emoji label and an optional first name, then an invite line. There is no backend, so the loop
uses two links, both URL fragments (never sent to a server):

- **Challenge link** `#play=<payload>`: kit id, challenge id, relationship, switches, owner name and pronoun, emoji,
  seed, and the answer key the friend's device needs to show counts: per side the owner's pole and whether either
  guess counts; Level 2 card ids with the owner's side; Level 3 the twelve tag ids and which are true; for the bestie
  round the four sting-line tag ids, which one is true, and six roast ids. With marriage and kids tags on, a second
  Level 3/4 set without them is included for a friend who taps "Under 18". Nothing else: no answer text, no stings as
  text, no scores, no research record, no other answers.
- **Reply link** `#reply=<payload>`: the challenge id and the friend's taps (six poles, Level 2 sides and why-chips,
  Level 3 picks, Level 4 picks, the age band). The owner opens it in the browser that holds their run; the app
  rebuilds the owner's deck from the saved run and scores it with `scoreFriendGame`.

Every payload is base64url JSON plus 8 hex of its SHA-256, capped at 6000 characters. Decoding checks charset,
checksum, exact keys, versions, the kit id, every card, tag and roast id against the kit, relationship levels, love and
18+ pair rules, deck shapes, and name characters; replies must match the challenge's deck. Everything renders as React
text, never HTML. Friend decks exclude skipped, exited, circumstance, depends, rushed, private and 18+ answers (score-core
rules). The friend sees their Level 1 score, Level 2 and 3 counts, their own guessed type, the owner's type only if
allowed, a reply link and "Your turn", which starts their own run and remembers who to send one back to. The owner sees
"You, through {friend}'s eyes": type comparison, band line, the three zones with hearts and stings, other guesses, counts,
the biggest surprise with the friend's why-chip, the bestie round with a hide-roast switch, and a "Who knows you best"
ranking once two links are played.

**Known MVP limit:** the answer key rides in the challenge link so the friend's device can show counts without a
server. A friend who decodes the link by hand could read the owner's poles (so the type, even with "show my type"
off, which only removes the reveal line), the sides of the Level 2 cards, which tag cards are true and, with the
bestie round on, which sting is the owner's. Sting text, answer texts and everything else stay out. Links are not
signed: anyone holding one can replay it, and a new reply to a link replaces the old one. Hiding the key needs a
backend (see open items).

## Storage

| Key | Holds |
|---|---|
| `genii.persona.v2.run` | The owner's run (schema `genii.persona.run/3` with the three-tap lobby; `/1` and `/2` saves fail closed), kit id, challenges sent, friends' replies |
| `genii.persona.friend-play.v1` | Friend games in progress on this device, by challenge id (up to 12) |
| `genii.motion.v1` | Motion preference, written only when toggled |

A save is replayed card by card through the same step machine before it is trusted; unknown fields, answers outside the
route, a different kit, or a broken lock fail closed with "download the old save" and "clear it". A reply whose link
is gone is dropped rather than breaking the run. Each tab only writes if storage still holds the run it last read, and
follows saves made in other tabs, so a stale tab can't undo a lock or lose a reply. At most 20 links are kept;
unplayed ones go first. "Delete my data" removes every `genii.*` key in the browser. "Play again from the start"
removes the run after a confirm; nothing is saved again until the next setup (so an under-13 stop saves nothing). Nothing is sent anywhere;
the build makes no network requests beyond its own files.

## Lobby and picker (2026-09-28)

**Lobby.** Four unscored taps right after setup, stored as `run.lobby` (schema `genii.persona.run/2`). A save from
the fixed walk (`/1`) is refused with "from an earlier version of Genii" and the usual download-or-clear banner; it
never crashes. Every new line lives in `LOBBY_COPY` in `src/persona/lobby.js`.

| Field | Values | Effect |
|---|---|---|
| `ending` | sharp, receipts, funny, gentle | Stored only, for the result screen later. Missing reads as funny |
| `depth` | light, some, personal | light: no locked18, no intimate (C3-7). some: no locked18. personal: all the age band allows (teens never get locked18) |
| `rooms` | any of love (ch 3), work (ch 5), family (ch 6) | Default all open. Chapters 1, 2, 4 and 7 are always on |
| `delivery` | gentle, playful, sharp, minimal | `hostLine()` picks Genii's between-card bubble; minimal hides it (and the speed nudge). Gentle and sharp reuse the playful lines until the founder approves copy (marked TODO copy). Chapter intros stay for every delivery |

**Fixed length.** `RUN_SIZE = 40` run cards, then the 8 finale cards: 48 for every lobby and age band. Feeling
follow-ups count toward the 40 (decision: the total is always 48 and "Card x of 40" never jumps; they play only when
the chapter still has a slot, 84% of the time in the simulation). The old unfinished-side extras are now ordinary pool
cards in a bonus group after the last open chapter.

**The picker** (`session.js`, deterministic: the only randomness is a jitter seeded from sha256 of the run id; restore
replays it card for card). Pool: open chapters plus the 12 extras, after age, depth, the C3-9 gate and feeling rules.
Each chapter gets a slot quota at its start (its share of the remaining budget, minus bonus cards reserved for axes the
remaining chapters can't cover). Per pick, in priority order:

1. Coverage: every axis needs 2 valid cards. An axis only this chapter can still cover is urgent; the quota shrinks if
   later bonus cards must cover an axis; when the remaining budget equals the shortfall, only short-axis cards qualify.
2. Retention: after Skip, Not my life or No recent example the next pick evidences the exited card's axis when one is
   on offer (the neighbour rule is waived for that pair). After 3 rushed taps (under 1500 ms) the next pick is a
   this_or_that or role card when one is on offer. Both keep the type rule.
3. Flow: chapters in kit order, never re-entered; each opens with its first authored card (title card shows); a
   feeling card right after its picked moment; no two cards of one type in a row except a this_or_that round; no
   neighbours sharing an axis or tag pair. A small search keeps the rest of the chapter orderable under these rules,
   ending clear of the next opener. Rounds may be played whole or cut to their first one or two cards.
4. Value: short axes first, then axis balance, then tag pairs the player already leans on (so tags can fire), then
   pairs a later card can complete; small nudges for real cards and authored order, plus the seeded jitter.

`pickInfo(state)` reports why a card was served (tests and QA only). Weights: `PICK_WEIGHTS`.

**Tests** (`npm test`, 136 pass): `tests/persona-picker.test.mjs` (lobby validation and persistence, old saves, copy,
48 cards on all 48 lobby x age combinations, 2 valid cards per axis for consistent players everywhere, determinism and
replay, rushed and exit rules, flow rules), a lobby render test in `persona-ui.test.mjs`, and the session tests moved to
the picker. `node --test tests.mjs` in the kit: 27 pass (unchanged).

**Simulation** (`node tests/persona-sim.mjs`, 300 consistent players with 20% noise per bucket, 14,400 runs; baseline
= the same players on the old 69-card walk):

| Open rooms | Any unfinished side | Tags shown (mean) | 3 to 5 tags | 0 tags | Sealed exact | Baseline exact |
|---|---|---|---|---|---|---|
| none | 0% | 3.99 | 88.8% | 0 | 58.4% | 59.6% |
| love | 0% | 4.19 | 92.1% | 0 | 58.5% | 59.6% |
| work | 0% | 4.60 | 96.5% | 0 | 58.6% | 59.6% |
| family | 0% | 4.63 | 97.2% | 0 | 58.6% | 59.6% |
| love+work | 0% | 4.68 | 97.2% | 0 | 58.1% | 59.6% |
| love+family | 0% | 4.29 | 93.8% | 0 | 60.6% | 59.6% |
| work+family | 0% | 4.77 | 98.2% | 0 | 57.4% | 59.6% |
| all three | 0% | 4.54 | 96.2% | 0 | 59.0% | 59.6% |
| total | 0% | 4.46 | 95.0% | 0 | 58.7% | 59.6% |

**Known costs (founder decisions).**
- Tag reach. Tags whose cards sit in a closed room can't fire there (expected). With all rooms open, 8 tags that the
  pool could still fire never fired in 1,800 runs at 40 cards: T01A, T01B, T05A, T08B, T11A, T16A, T16B, T20B; several
  more fire for under 1% (T12A, T15A, T15B, T18A, T18B, T21A, T21B, T24B). They need 3 or more cards each. Every tag
  still shows on some page across all lobbies. At 80 players per bucket, room-set x tag combinations that the pool
  could fire but nobody fired: 32 at 40 cards, 11 at 48, 7 at 52, with the same coverage and sealed accuracy.
- Bonus-card repeats: when closed rooms leave an axis to its two extras alone, those two can end up side by side
  (coverage outranks flow); under 2% of neighbours in the tests. Rushers and skippers can also see a repeat, because
  retention outranks flow.
- A chapter's title card count is its plan at the start; in 2.7% of chapters coverage ends it one or two cards early.
- `qa/persona-browser-qa.mjs` still drives the pre-lobby flow and needs the lobby step before it runs again;
  `qa/play-through.mjs` covers the current flow.

## Outside this MVP

- Bestie vs partner comparison (friend.json `comparison`): not built. The "Who knows you best" ranking is.
- The friend-side Level 1 flex line, the screenshot-for-friend export on the owner view and invite-line tracking of
  "sent to someone else too" beyond the local count.
- Hiding the friend answer key, cross-device replies, accounts, analytics, SQLite storage, Lark writes, deployment.
- Feedback page from the blind-test prompt (That's me / Kind of / Not me) and the research export beyond "Download my data".
- Real-data checks from spec section 12 (R2 split, type spread, sting offense rate, legal check of names) and friend
  difficulty simulation.
- The old dossier `preview.html` was removed with the dossier build at integration.

## Integration notes (2026-09-29)

- Genii's line on a card (`geniiLineFor`, `src/persona/play/Quiz.jsx`): a reaction (reactions.js rules) or the voice's
  host line rotated by the card's place in the run and the seed; never the same line on two cards in a row; the speed
  nudge once per rushed streak.
- Theme previews (`previewTheme`) paint at once, never through a View Transition: a running transition swallowed the
  tap that started it, so a voice tile tapped on a phone was never chosen.
- `Boot.jsx` must keep its literal storage keys in step with `session.js` and `store.js` (it cannot import them
  without pulling in the kit). The landing it draws is replaced by PersonaApp's landing with `settled` (no replayed
  entrance).
- No `min-width` on html or body: at 200% zoom a 390 px phone lays out at 195 CSS px.
- Retired Genii renders, badge PNGs and the lockup PNG were deleted from `public/assets/` in the round 3 handoff cleanup (H4); only `genii-opal-alert.webp` (the canon reference for `qa/genii-lab`) and the wordmark remain beside `world/`.
