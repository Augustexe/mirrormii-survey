---
title: MirrorMii launch survey, the one build spec
status: approved by Jerry 2026-09-28 (section 19); teens still open
owner: jerry
created: 2026-09-28
updated: 2026-09-28
source_basis: consolidates research/persona-quiz-v2/BRIEF.md, docs/questions/PERSONA-QUIZ-SPEC-V2.md, research/persona-quiz-v2/final/RESULT-TEMPLATE.md, quiz64/docs/PERSONA-MVP.md, docs/questions/RUN-SPEC-LEDGER.md and docs/STATE.md (all superseded by this file); counts computed from research/persona-quiz-v2/final/*.json and the survey/launch code on 2026-09-28; Sally's v2 system (research/sally-v2-2026-09-26); Wrapped research (research/result-page-wireframes/WRAPPED-RESEARCH.md)
---

# MirrorMii launch survey: the one build spec

**This is the only spec.** Rules, rulings, numbers, status, open decisions and the plan all live here and are updated here. Content lives in data files (section 3). Code notes live in `quiz64/docs/PERSONA-MVP.md` and never override this file. Paths are relative to `products/survey/`.

## 1. Purpose

People **finish** it, get a personality read that feels accurate and a little spicy ("I didn't know that about me"), **share** it so friends play "Do you really know me?", and **want the app**. It must not read like another generic personality test.

**Order of work (Jerry, 2026-09-28):** the evidence framework and the tagging must be right first. Tags, questions, answers and the final page are Jerry's to change freely afterward, without breaking the evidence.

## 2. The build in numbers (2026-09-28)

| What | Count |
|---|---|
| Taps per player | 55: setup 3, lobby 4, cards 40, sealed finale 8 |
| Questions built | 96: 76 chapter cards, 12 extra cards, 8 sealed cards |
| Answer options | 391: 199 carry axis values, 291 carry tags, 120 carry an emotion, 15 circumstance (score nothing), 4 "depends" with a follow-up, 4 "None of these" (score nothing) |
| Chapters (categories) | 7: 4 always on, 3 optional rooms |
| Card types (question formats) | 11 built (4 indirect formats added in step B); 3 more held (section 6) |
| Axes | 6 (3 relationship, 3 life) |
| Types | 64 (16 half-names) |
| Tags | 50 in 25 opposite pairs (4 are 18+ only) |
| Genii's calls | 150 one-liners |
| Setup and lobby combinations | 13,824 |
| Combinations that change the cards | 48 (age 2 × depth 3 × rooms 8) |
| Distinct routes | 1,077 distinct card orders from 1,920 simulated players (40 per lobby bucket; the same count gave 903 before step B) |
| Types reached in simulation | 64 of 64 |
| Tests | 140 app, 32 kit, all pass |
| Real-person accuracy | untested (blind test 1 on the older kit: 0 of 6) |

## 3. Where everything lives

| Part | File |
|---|---|
| Cards (content and evidence) | `research/persona-quiz-v2/final/cards.json` |
| Types, axes, tags and result lines | `research/persona-quiz-v2/final/library.json` |
| Friend game content | `research/persona-quiz-v2/final/friend.json` |
| Scorer (one scorer for app, CLI, sim, tests) | `research/persona-quiz-v2/final/score-core.mjs`; `score.mjs` CLI; `sim.mjs`; `tests.mjs` |
| Evidence audit and lock | `research/persona-quiz-v2/final/audit.mjs` (per-axis and per-tag counts, random-clicker balance); `lock-evidence.mjs` and `evidence-lock.json` (section 7); picker acceptance: `node quiz64/tests/persona-sim.mjs --acceptance` |
| Web game | `quiz64/src/PersonaApp.jsx`, `quiz64/src/persona/` (lobby `lobby.js`, picker and state `session.js`) |
| Result page drafts | `research/result-page-wireframes/` (`stories.html` is the chosen direction) |
| Structure source | Sally's v2 system, `research/sally-v2-2026-09-26/` (Chinese). A template, never a translation source |
| Branch | local `survey/launch`, not pushed. The live site (older dossier build) is untouched |

## 4. Flow

```mermaid
flowchart LR
  A[Landing] --> S[Setup: age, closest person, pronoun]
  S --> L[Lobby: ending style, how personal, open rooms, Genii's reactions]
  L --> P[Picker serves 40 cards from open chapters and extras]
  P --> K[Genii locks 8 guesses, sha256]
  K --> F[8 sealed finale cards]
  F --> R[Result: Stories evidence page]
  R --> SH[Share card]
  SH --> FG[Friend game]
  FG -->|Your turn| A
  R --> APP[Get MirrorMii]
```

## 5. Onboarding and chapters

**Setup** (3 taps): age band (18+, 13 to 17, under 13 stops and stores nothing), closest person (best friend, partner, crush, sibling, parent, someone else), pronoun (she, he, they; used in the friend game).

**Lobby** (4 taps, unscored, all copy in `quiz64/src/persona/lobby.js` `LOBBY_COPY`):

| Tap | Options | Effect |
|---|---|---|
| How should your ending read? | one sharp read / the read plus what I said / make me laugh / go easy on me | How the result is told (section 13) |
| How personal can Genii get? | keep it light / a little personal / ask me anything | light: no 18+ or intimate cards; a little: no 18+; anything: all the age band allows |
| Which rooms can Genii visit? | love, work, family (each can be closed) | Closed rooms drop their chapter; the run stays 40 cards |
| How should Genii react between cards? | gently / playful / straight to the point / quietly | Genii's between-card lines; quietly hides them. Answers count the same |

**Chapters:**

| # | Chapter | Cards | On |
|---|---|---|---|
| 1 | Your phone | 10 | always |
| 2 | Friends | 11 | always |
| 3 | Love and your person | 12 | room: love |
| 4 | Money and treats | 9 | always |
| 5 | Work, school and ambition | 11 | room: work |
| 6 | Family and home | 12 | room: family |
| 7 | Play, rules and you | 11 | always |
| Extras | Axis cards (6 scenario, 6 this-or-that) | 12 | pool, used by the picker |
| Finale | Sealed guesses | 8 | always |

## 6. Question formats

**Principle.** Players should never feel asked "what would you do when X happens?" The format is the fun layer; the evidence contract underneath never changes: every option carries its axes and tags, and the card's grade says how strong the evidence is. The grade follows what the format actually observes: something you did (strongest), something you'd do in a situation, or what you believe or how you see yourself (weakest). Indirect is not hidden: the masking rule holds either way (never name the trait being measured).

**Built (in `cards.json`):**

| Format | What the player does | Grade, weight | Count |
|---|---|---|---|
| Scenario | Picks a move in a vivid imagined moment | would, 0.55 | 22 + 6 extras |
| Real moment | "The last time..." picks what they actually did | did, 0.80 | 13 |
| This or that | 2 punchy options, in quick rounds of 3 | believe, 0.45 | 12 + 6 extras |
| Pick two | 2 of 6 short lines most like them | believe, 0.45 per pick | 7 |
| Role | "In your group chat, you're the..." | believe, 0.45 | 5 |
| Feeling | After a card: which feeling showed up first | emotion only, 0 | 2 |
| Sealed | New moment; Genii locked its guess first | never scored | 8 |
| Receipts check (step B) | Taps every ordinary fact that is true right now (5 to 7 items), or "None of these", then Done | did, 0.40 per tick; past 3 ticks each tick is scaled to 3/ticks | 4 (phone, money, week, family) |
| Guilty or not (step B) | Genii bets on one specific thing they did: Guilty or Never | did, 0.80 | 6 (2 are 18+) |
| Reply picker (step B) | A mock text thread in chat bubbles; picks the reply they'd send | would, 0.55 | 3 |
| Other people (step B) | Reacts to what a friend did; first thought | believe, 0.45 | 2 |

**Indirect formats** (approved 2026-09-28: the first four are built, see the table above; Rank it, Friend's-eye view and Vibe pick held until after blind test 2):

| Format | What the player does | Example | Grade, weight |
|---|---|---|---|
| Receipts check | Taps everything that's true right now; items are ordinary facts, never traits | "Tap what's on your phone right now: 3+ alarms / a screenshot of someone else's text / an unread from your mom / a notes-app list titled 'ideas'" | did, 0.40 per tick, max 3 ticks count |
| Guilty or not | Genii bets on a specific thing they've done; tap Guilty or Never | "I bet you've rewritten a text three times, then sent 'k'." | did, 0.80 |
| Reply picker | A mock text thread or notification; pick the reply they'd send | Group chat: "who's booking the Airbnb??" | would, 0.55 |
| Other people | Reacts to what someone else did; judging others reveals their own line | "Your friend reads their partner's texts while they shower. Your first thought?" | believe, 0.45 |
| Rank it | Drags 4 things into order | "Rank what you'd cancel first: gym, date, family dinner, group project" | believe, 0.45 split by rank |
| Friend's-eye view | Picks the line their best friend would use to describe them | "Your best friend describes you to a stranger. Which line?" | believe, 0.45 |
| Vibe pick | Picks an object, room or name; flavor only | "Pick your group chat name" | tags only, 0.20, never axes |

## 7. The evidence layer

Every answer option carries its own evidence. The scorer only adds up what options say. No hidden topic scores.

| Field | Rule |
|---|---|
| `axes` | Signed -2 to +2 on the six axes (+ is the first pole). Usually one axis, never more than two |
| `tags` | Strength 1 to 3. Usually 1 or 2 tags, never more than 3. Support for a tag counts against its pair |
| `emotion` | Optional, research record only |
| `circumstance` | The option is a situation, not a choice (money pressure, no real choice). Scores nothing (Sally's "only way right now") |
| `depends` | Scores nothing; opens "What would flip you?" with 3 presets |
| Exits | Skip, Not my life, No recent example (real cards). Never score |
| Grade weight | did 0.80 (real, guilty), receipts 0.40 per tick (did, at most 3 ticks' worth per card), would 0.55 (scenario, reply), believe 0.45 (this or that, pick two, role, other people), emotion 0, sealed 0 |
| Rushed | Under 1.5 s counts at 0.3. A tag also needs at least one calm card |
| `mask` | Internal: what the card looks like versus what it measures |
| `friend` | Third-person version for friend game Level 2 (60 cards; never on receipts) |
| `none` | Receipts only: "None of these", exclusive, scores nothing |

**Content can change, evidence can't drift (approved, built in step B).** Tag and type names and all result lines are keyed by id, so renaming never touches evidence. Card and answer text can be rewritten freely, but `evidence-lock.json` holds a sha256 of every normalized text (prompt, teen prompt, chat thread, each option, the friend sides) next to the evidence it carries, and the kit tests fail while any text or evidence differs from its locked entry. After re-reading a changed card, `node lock-evidence.mjs --confirm <cardId>` re-locks it (`--all` re-locks everything; with no flag it lists what changed). Typography (quotes, ellipsis, spacing, case) never trips it; library renames never reach it.

## 8. Axes and types

| Axis | + pole | - pole | Cards carrying it (pool) |
|---|---|---|---|
| R1 | We | Me | 10 |
| R2 | Direct | Soft | 10 |
| R3 | Classic | Own | 11 |
| L1 | Steady | Venture | 10 |
| L2 | Push | Easy | 9 |
| L3 | Rules | Context | 11 |

Relationship half = R1 × R2 × R3 (8 names). Life half = L1 × L2 × L3 (8 names). Type = one of each (64). The 16 current names are literal translations of Sally's Chinese and will be rewritten English-native (section 18, step C). Flex badge when an axis is too close to call; the pole then follows real-behavior evidence first.

## 9. Tags

50 tags in 25 opposite pairs across the 7 chapters. Each tag: id, pair, chapter, name, sting (owner only), heart, 2 or 3 calls, what it must never be read as, 18+ flag, friend-game setting. A tag fires with net support of at least 2.25 from at least 2 separate cards, one of them calm; "strong" at 3.0; if nothing fires, the best candidate above 1.25 shows as "leaning". Up to 5 shown, spread over at least 3 chapters where possible. Names: meme-style, never a diagnosis or a moral grade, gender neutral. Tag names and lines can be rewritten any time (ids stay).

## 10. The picker

Every player answers exactly 40 cards (`RUN_SIZE` in `session.js`) then the 8 sealed cards. Deterministic: the only randomness is seeded from the run id, and a restored save replays the same route. Pool: open chapters plus the 12 extras, after age, depth, the C3-9 gate and feeling-card rules. Chapters play in order, each opening with its first authored card. Per pick, in priority order:

1. **Coverage:** every axis gets at least 2 valid cards; if a closed room carries an axis, other chapters and extras cover it. A card counts toward an axis by the share of its answers that carry it, and slots are held back for what a chapter cannot surely cover.
2. **Retention:** after Skip, Not my life or No recent example, the next card targets the same axis. After 3 rushed taps, the next card is a quick this-or-that, role or guilty-or-not card.
3. **Flow:** no two cards of the same type in a row (except this-or-that rounds); no two neighbors on the same axis or tag pair (a receipts card, a list of facts across topics, is compared on its axes only). Receipts and guilty-or-not cards are spread out: never two of one format within 4 cards, rarely one right after the other. An opening quick round takes at most half its chapter's slots.
4. **Value:** otherwise, balance the axes and favor tag pairs the player is already leaning on. Each run also focuses on 10 of the 25 tag pairs (seeded from the run id) and favors the cards that can move those pairs most, so every tag's cards get served together for some players.

Simulation (14,400 runs over every room combination, step B): 0% unfinished sides, 95.7 to 99.7% of players get 3 to 5 tags, none get 0, sealed accuracy 56.6 to 59.3% exact (full-walk baseline 60.7%, chance 25%). Before step B: 0%, 86.7 to 98.3%, none, 57.1 to 61.7%.

## 11. Scoring settings

All in `score-core.mjs` `CONFIG`, set by simulation: weights (section 7), rushed 0.3, minAxisCards 2, flexBand 0.12, tagFire 2.25, tagStrong 3.0, tagFloor 1.25, maxTags 5, minChapters 3, tagRank "share", splitMin 0.4, sealedTagWeight 0.6, sealedPairScale 1.2.

## 12. Genii's sealed guesses

Before the finale, Genii locks its 8 guesses with a sha256 and cannot change them. Genii picks the option that best matches the profile, or passes when the card's main axis is Flex or unfinished. Exact hits (chance about 25%) and right-side hits (chance 50%) are scored. Sealed answers never feed the profile. A tampered save refuses to score.

## 13. The evidence page (result)

**Direction: Stories** (tap-through, like Spotify Wrapped), 7 to 9 screens, type revealed by screen 3 or 4, told in the ending style picked in the lobby. Draft: `research/result-page-wireframes/stories.html` (13 screens, placeholder copy). Principles from the Wrapped research: one type name the data can justify; each claim carries its evidence in one soft clause; contradictions shown warmly as range, never as a catch; one surprising, checkable fact; every screen shareable; sensitive lines never on share cards; ends with the friend invite and the app.

**Content per player (from the scorer):** type and its two halves, 6 axis positions, up to 5 tags with the player's own answers behind each, 2 stings (owner only), 2 hearts, 3 calls, a split if one exists, Genii's 8 guesses with hits. Never shown: numbers, ids, the words "evidence", "axis" or "sealed".

**Voice (rulings):** smooth and natural; no gotcha lines ("You'd say X. Last three times, you did Y.") and no sitcom lines ("Genii called this before you answered"). The current plot-twist template breaks this and will be replaced.

**Share card:** type name, tag names with hearts, "Do you really know me?". No stings, answers or scores.

## 14. Friend game

The owner picks a relationship (partner, crush, friend or coworker, bestie) and sends a link. Level 1: 6 either-or guesses, one per axis. Level 2: 12 of the owner's cards in third person, 2 options each. Level 3: 12 tag cards (the owner's, their opposites, decoys), pick the right ones. Level 4 (bestie, owner opt-in): which sting hits hardest, plus pick a preset roast. The owner sees "You, through {friend}'s eyes" with They get you / What they don't see / Who they think you are. The friend sees only scores, then "Your turn". Links carry the answer key and are unsigned (fine for testing; a backend is needed before real players).

## 15. Safety and privacy

Teen-safe by default (18+ cards need 18+ setup; teens never get the marriage and kids tags). No health, no politics, no identity inference (orientation, religion, party, health). Circumstance answers never become personality. Stings are owner only. Friend answers are private to the owner. Entertainment and self-discovery, not a validated scale; no MBTI names. Answers stay in the browser; no backend yet.

## 16. Rulings in force (Jerry)

| Ruling | Date |
|---|---|
| One build: this survey. No parallel builds or specs; this file is the only spec | 09-28 |
| Evidence and tagging first; tags, questions, answers and the result page are changeable after | 09-28 |
| Result voice: smooth, natural; no gotcha or sitcom lines | 09-28 |
| Result must be spicy ("I didn't know that about me") and distinct from generic tests | 09-28 |
| Sally's system is a template, not a translation source; English names and tags may be rewritten | 09-28 |
| Result display: Stories format | 09-28 |
| Grill 09-28 (section 21): no age screen and no age-based content; nothing sensitive asked (never open a bank, messages or photos app); every situation and answer unique; Genii's bet gets its own answers per card; two voices on every card; classic known archetype names, never "X with Y energy"; final screen shows no quoted answers and no data list, only a confident read | 09-28 |
| Run length 40 + 8; indirect formats (receipts, guilty or not, reply picker, other people); two distinct voices; text-change guard | 09-28 |
| Multiple choice only, never free text | 09-26 |
| Every question masked; vivid scenarios are the main format | 09-26 |
| Every answer option tagged; no topic scores | 09-26 |
| Onboarding: a few routing taps, then scored cards | 09-26 |
| Gender-neutral questions; teens 13 to 17 in scope (conflicts with PRODUCT-TRUTH, open) | 09-26 |
| Web game; no health data; storage SQLite when a backend exists | 09-24/26 |

## 17. Status and known gaps

| Part | Status |
|---|---|
| Setup, lobby, picker, 40 + 8 | Built, tested, played in the browser. Build C engine (09-28): no age screen, 2-tap setup, 3-tap lobby (voice, how personal, rooms), 8 sealed cards drawn per run from the sealed pool; tested, not yet played in the browser |
| Cards and evidence | Built; gaps below |
| Names, tags, result lines | Built as literal translations; to rewrite |
| Voices | Engine built (card `heart` text, Heart to heart host lines, Just the cards); cards carry no `heart` text yet, so everyone reads Make it fun until the bank lands |
| Formats bet, rank, eyes | Built in scorer and app (guilty renamed bet; the 6 legacy bets keep 2 answers until rewritten) |
| Bank tooling | Built: `check-bank.mjs`, `merge-bank.mjs`, `audit.mjs` against section 22 targets; bank files not written yet |
| Evidence page | Old template in the app; Stories drafted |
| Friend game | Built |
| Real-person validation | None |

**Evidence gaps (step B, 2026-09-28):** before and now. Numbers from `audit.mjs` and `persona-sim.mjs --acceptance` (3,000 consistent players with every room open; 4,000 random clickers).

| # | Gap | Before | Now | Status |
|---|---|---|---|---|
| 1 | Cards per axis in the pool | 7 (L3: 8) | 9 to 11 (R1 10, R2 10, R3 11, L1 10, L2 9, L3 11) | fixed |
| 2 | Tags backed by fewer than 3 cards | 9 | 0 (every tag has 3 to 7) | fixed |
| 3 | Tags that never fired at 40 cards with every room open | 8 | 0 | fixed |
| 4 | Tags firing for under 1% of consistent players (every room open; 18+ tags on adults) | 16 | 0 (lowest: T05B 1.6%) | fixed |
| 5 | Tags with no "what you did" evidence | 19 | 0 | fixed |
| 6 | Axes where random clickers lean outside 45 to 55% | R3 43.5% on the full walk (older sim also flagged L2 55.5%, L3 57.5%) | 48.1 to 52.3% at 40 cards, 49.1 to 51.4% on the full walk | fixed |
| 7 | Guard against answer rewrites changing meaning | missing | `evidence-lock.json` + `lock-evidence.mjs`, enforced by the kit tests | fixed |
| 8 | Real-person accuracy | untested | untested | open (blind test 2) |

With a room closed, its chapter's tags can only fire from cards elsewhere; per room combination, 6 to 22 tags stay silent (all of them tags of the closed rooms), as before.

## 18. Plan

**Step A (done 2026-09-28):** this file.

**Step B: evidence lock.** Acceptance: every item below passes, tests green, simulation rerun. Items 1 to 5 done 2026-09-28 (section 17); item 6 open.
1. Every axis has at least 9 cards in the pool, by adding axis values to existing options first and new cards only if needed.
2. Every tag has at least 3 supporting cards, at least 1 of them "did" evidence, using the approved formats of section 6 (receipts check and guilty-or-not cover many tags per card).
3. Every tag fires for at least 1% of consistent simulated players at 40 cards with every room open.
4. Random clickers land 45 to 55% on every axis.
5. Text-change guard in the tests (section 7).
6. Blind test 2 with Jerry and 3 to 5 real people: accuracy and "that's me" per line.

**Step C (after B):** English-native names, tags and result lines (5 samples to Jerry first); voices; the Stories evidence page in the app; remove the old dossier code from `quiz64`.

## 19. Decisions

| # | Decision | Status |
|---|---|---|
| 1 | Indirect formats | **Approved 09-28:** Receipts check, Guilty or not, Reply picker, Other people. Held: Rank it, Friend's-eye view, Vibe pick |
| 2 | Weights for the new formats | **Approved 09-28** as in section 6 |
| 3 | Run length | **Approved 09-28:** 40 cards + 8 sealed |
| 4 | Voices | **Approved 09-28:** two distinct voices, Make it fun plus one more, picked by the player in onboarding. Principle (Jerry): everyone has their own circumstances and likes to be addressed differently, so onboarding learns who they are and the voice meets them there. The second voice is proposed with samples in step C |
| 5 | Text-change guard | **Approved 09-28** |
| 6 | App ending promise | **Approved 09-28:** only what the app does today |
| 7 | Teens 13 to 17 | Open (conflicts with PRODUCT-TRUTH) |
| 8 | Friend link answer key | **Approved 09-28:** fine for testing; backend before real players |

## 20. Superseded documents

Replaced by this file; kept only as history: `research/persona-quiz-v2/BRIEF.md`, `docs/questions/PERSONA-QUIZ-SPEC-V2.md`, `research/persona-quiz-v2/final/RESULT-TEMPLATE.md`, `docs/questions/RUN-SPEC-LEDGER.md`, the launch sections of `docs/STATE.md` and `docs/OPEN-QUESTIONS.md`. `quiz64/docs/PERSONA-MVP.md` stays as code notes only. Build history: `docs/history/BUILD-ITERATIONS.md`.

## 21. Build C: the full bank and the final screen (grill, 2026-09-28)

Rulings from Jerry's grill rounds. Where they differ from earlier sections, this section wins.

**Scope.** Build the full survey (bank, scorer, web game, final screen), then fonts and visual design, then push to GitHub (with Jerry's go at that point). The handoff package is decided later.

**Bank size (delegated to Claude).** 174 unique cards: 150 scored plus 24 sealed. Every tag backed by at least 4 cards, every axis by at least 15. The 96 existing cards count after passing the template and the uniqueness check (keep, rewrite or cut). Variety is the goal: many distinct situations, answers and evidence paths.

**Uniqueness.** Cards may share a chapter, axis or tag, never a situation (trigger + setting + ask + who is involved + stakes). "A friend calls at 4am" and "a friend texts at 2am needing to talk" are the same situation. No answer line repeats anywhere. Every card is fun, exciting and fits the template.

**Spice (Jerry, 2026-09-28: "super boring... need to be spicy... make you question things").** Every card clears at least 3 of 5 marks: real stakes, no safe answer, the unsaid (envy, pettiness, favoritism, keeping score), self-question, group-chat test. Logistics, preferences and polite dilemmas are rewritten. Full standard in the card-writer skill section 1b. Cards are chosen by an iteration round: several writers per angle, a judge panel keeps the best.

**Card template** (codified in `skills/shared/genii-card-writer/`): Hook (one concrete scene-setter, 15 words or fewer, true detail) then Event (what just happened that forces a response; never an abstract opinion) then Ask (the format's stem, usually implied; never "what would you do when") then Moves (3 to 5 distinct actions, first person, action first, 12 words or fewer, equal charm, no ladders). Hidden: evidence per move, situation fingerprint, the two voice variants.

**Formats.** 13: scenario, real moment, receipts, Genii's bet, reply, other people, this or that, role, pick two, rank it, friend's-eye view, feeling, sealed. Genii's bet has its own 3 to 5 answers per bet, never a fixed Guilty/Never pair. Receipts and every other format are answered from memory; never ask the player to open an app, account, bank, messages or photos, and never ask for anything sensitive.

**Voices.** Every card in Make it fun and Heart to heart. One lobby tap, "How should Genii talk to you?" (Make it fun / Heart to heart / Just the cards), drives card wording and Genii's reactions. Claude keeps the two versions identical in meaning (evidence is locked by `evidence-lock.json`).

**Age.** No age screen and no age-based content. Everyone gets the same bank, so every card is fine for anyone who plays. No explicit sexual content. Marriage and kids cards stay but are written so anyone can answer (or skip).

**Names.** The result shows two classic, widely known archetypes, one per half, side by side, never glued into one phrase and never "X with Y energy":

| With your people | Code | With your life | Code |
|---|---|---|---|
| Golden Retriever | We·Soft·Own | The Planner | Steady·Push·Rules |
| Comfort Person | We·Soft·Classic | The Slow Burner | Steady·Push·Context |
| Ride-or-Die | We·Direct·Own | Creature of Habit | Steady·Easy·Rules |
| The Glue | We·Direct·Classic | The Easygoer | Steady·Easy·Context |
| Lone Wolf | Me·Direct·Own | The Strategist | Venture·Push·Rules |
| Straight Shooter | Me·Direct·Classic | The Go-Getter | Venture·Push·Context |
| Free Spirit | Me·Soft·Own | The Explorer | Venture·Easy·Rules |
| Old Soul | Me·Soft·Classic | The Wanderer | Venture·Easy·Context |

Jerry approved the eight people archetypes; the eight life archetypes are Claude's working picks.

**Tags.** All tags renamed to plain, instantly understood phrases (4 words or fewer) that someone who never played would get; each gets one confident line. The library may grow beyond 50 if the bank needs it.

**Final screen** (Stories, no quoted answers, no data list, confident read written as fact, never science or accuracy claims):
1. "40 answers in. Here's you."
2. The two archetypes.
3. The read: 3 confident lines.
4. Your map: the 6 axes as a visual, no numbers.
5. Your top traits: up to 5 tags, one line each.
6. The thing you didn't know: one warm insight, no quotes.
7. Only you: the stings.
8. Share card.
9. Get MirrorMii.
Optional after 9: "How Genii read you" (the guess score). Screens 2, 5 and 8 are the share-worthy ones.

**Order of work.** 1 card-writer skill and checker; 2 a 30-card sample in both voices for Jerry; 3 the rest of the bank in batches; 4 tag and name library; 5 final screen in the app; 6 fonts and visual design; 7 GitHub push with Jerry's go.

## 22. Build C plan (work packages, 2026-09-28)

**Build decisions (delegated to Claude):**
- Setup keeps closest person and pronoun (friend game); the age question is removed. Lobby is 3 taps: "How should Genii talk to you?" (Make it fun / Heart to heart / Just the cards: card wording, result wording and Genii's reactions; "Just the cards" uses Make it fun wording with reactions hidden), "How personal can Genii get?" (Keep it light: skips `intimate` cards / Ask me anything), and rooms. The ending-style tap is removed: its "the read plus what I said" option breaks the no-quotes rule, and voice now carries tone.
- No `teenPrompt`, `teen` or `locked18`; tags T11 and T21 stay but are never age-gated. Cards on marriage, kids and weddings are written so anyone can answer or skip.
- Type `guilty` becomes `bet` with 3 to 5 own answers. New types `rank` and `eyes` (skill section 4).

**Card schema** (skill `skills/shared/genii-card-writer/SKILL.md` section 7): top-level text is Make it fun; `heart` holds Heart to heart (`prompt`, `options` as strings in the same order, optional `thread`); `fp` holds the situation fingerprint.

**Library schema** (result copy, `library.json`): halves get `name` (archetype, section 21), `desc`, `read` (one confident line for the read screen), `sting`, `heart`, and `h: {desc, read, sting, heart}` for Heart to heart. Tags get `name` (plain, 4 words or fewer), `line` (one confident line), `sting`, `heart`, `calls`, and `h: {line, sting, heart}`. Axes keep `plusLine`/`minusLine` and add `h`. New `insights`: for each axis, `believePlus` and `believeMinus` lines (both voices) for "the thing you didn't know" when a believe-versus-did split exists on that axis, plus `insightFallback` per half code when no split exists. Never quote an answer.

**Bank targets** (150 scored + 24 sealed = 174):

| Chapter | Cards | did (real, receipts, bet) | scenario | reply | others | quick (this or that, role, pick two, rank, eyes) | feeling |
|---|---|---|---|---|---|---|---|
| 1 Your phone | 22 | 7 | 5 | 2 | 2 | 5 | 1 |
| 2 Friends | 22 | 7 | 5 | 2 | 2 | 5 | 1 |
| 3 Love and your person | 18 | 5 | 5 | 2 | 2 | 3 | 1 |
| 4 Money and treats | 20 | 6 | 5 | 2 | 2 | 4 | 1 |
| 5 Work, school and ambition | 18 | 5 | 5 | 2 | 2 | 3 | 1 |
| 6 Family and home | 18 | 5 | 5 | 2 | 2 | 3 | 1 |
| 7 Play, rules and you | 20 | 6 | 5 | 2 | 2 | 4 | 1 |
| Extras (2 per axis) | 12 | | 6 | | | 6 | |
| Sealed (4 per axis) | 24 | | | | | | |

Coverage: every axis carried by at least 15 scored cards, at least 6 of them in the always-on chapters (1, 2, 4, 7); every tag supported by at least 4 cards with at least 1 did card; random tappers 45 to 55% on every axis. Existing cards count after keep, rewrite or cut.

**Files:** chapter writers write `research/persona-quiz-v2/final/bank/ch1.json` to `ch7.json`, `extras.json` and `sealed.json` (each a JSON array of cards). New ids continue each chapter's numbering from 30 (`C2-30`, `C2-31`...); kept cards keep their ids. A merge script builds `cards.json` from the bank files.

| Package | Owner (model) | Owns | Depends on |
|---|---|---|---|
| B Engine | agent (Opus) | score-core, score.mjs, sim, tests.mjs, audit, lock-evidence, check-bank, merge script, `quiz64/src/persona/` except result files, `quiz64/tests/` except result tests; mechanical schema migration of cards.json | skill, this section |
| C Library | agent (Opus) | `library.json` | this section |
| D Sample | agent (Opus) | `bank/sample.json`, `bank/SAMPLE-REVIEW.md` | skill |
| F Result screen | agent (Opus) | `PersonaResult.jsx`, `views.js`, `share-image.js`, new Stories components and styles, result tests | library schema above |
| E Chapter writers | 8 agents (Opus) | `bank/*.json` | Jerry's OK on the sample |
| G Integrate | agent | merge, checker, audit, sim, fixes | B, C, E |
| H Fonts and visuals | agent | styles | F, G |

## Changes

- 2026-09-28: Spice standard added (section 21); variety rule for hook shapes enforced by check-bank.
- 2026-09-28: Section 22 added: build decisions (no age question, 3-tap lobby, bet/rank/eyes), card and library schemas, bank targets, files and work packages.
- 2026-09-28: Section 21 added from the grill (bank size, uniqueness, template, 13 formats, voices, no age screen, no sensitive asks, archetype names, final screen order).

- 2026-09-28: Step B items 1 to 5 done: 15 new cards in the four approved formats (4 receipts, 6 guilty or not, 3 reply, 2 other people), 30 option edits on 16 existing cards (16 axis values added where the behavior implies the pole, 7 balance fixes, 7 strength changes), two quick rounds reordered (C6-3 and C4-2 now lead), picker rules for the new formats and per-run tag focus (section 10), evidence lock (section 7). Sections 2, 3, 5 to 8, 10, 17 and 18 updated.
- 2026-09-28: Jerry approved section 19 (formats, 40 + 8, two voices, guard, app promise, friend link); step B started.
- 2026-09-28: Created by consolidating six documents; added the question format catalog (section 6), the evidence gaps and plan (sections 17 and 18) and the approval list (section 19).
