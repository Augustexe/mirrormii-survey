---
title: MirrorMii launch survey, the locked spec
status: locked 2026-09-29 (Jerry, "First, lock your docs, tighten them up"); changes only by a dated ruling (section 0)
owner: jerry
created: 2026-09-28
updated: 2026-09-29
history: docs/history/LAUNCH-SPEC-2026-09-29-full.md (the 26-section spec this replaces, with every superseded ruling)
---

# MirrorMii launch survey: the locked spec

## 0. How to use this spec

- **One spec.** This file is the only spec for the launch survey. Every rule appears once, in its final form. Nothing superseded is kept here; the old wording lives in [history/LAUNCH-SPEC-2026-09-29-full.md](history/LAUNCH-SPEC-2026-09-29-full.md). Paths are relative to `products/survey/`.
- **This file wins.** Where any other doc, skill, README or code comment disagrees, this file is right and the other one gets fixed. Design docs decide only how a screen looks, inside these rules.
- **Change only by a dated ruling.** A change needs a ruling from Jerry with its date. Edit the rule in place (never add a new "round" section on top), then add one line to section 11. Numbers are updated in place with the date they were measured.
- **Plan before build.** When Jerry asks for a plan or an audit, build nothing; answer with straight numbers. Evidence and tagging come first; copy and visuals after.
- **Read in this order:** this file, then [quiz64/README.md](../quiz64/README.md) (run, test, build, folder map), then [HANDOFF-DESMOND.md](HANDOFF-DESMOND.md) (backend and deployment).
- **Guarded.** `node scripts/check-docs.mjs` (run inside `npm test --prefix quiz64`) fails if this file names a retired label or asset outside section 11, or if any file in `docs/` or `quiz64/docs/`, `AGENTS.md` or `quiz64/README.md` has an em dash.

## 1. Product and goal

A phone-first web game hosted by Genii, MirrorMii's glass slime. The player taps 40 quick cards, Genii locks 8 guesses, the player plays those 8 sealed cards, then gets a 12-screen Stories reveal and a long-form Evidence Article, a share image, a friend game ("How well do you know me?") and the get-the-app screen.

**Goal.** People finish it, get a read that feels accurate and a little spicy ("I didn't know that about me"), share it so friends play, and want the app. It must not read like another generic personality test.

**What it is not.** Entertainment and self-discovery, not a validated scale. No MBTI names, no health, no identity inference. Answers stay in the browser; there is no backend, account or analytics yet.

**State (2026-09-29).** Built on local branch `survey/launch`, never pushed. The public site is still the older dossier build ([STATE.md](STATE.md)). No real person has tested this build (blind test 2 is open, section 10).

| Part | Where |
|---|---|
| Card bank (authored) and merged bank | `research/persona-quiz-v2/final/bank/*.json`, merged by `merge-bank.mjs` into `cards.json` |
| Result copy (names, tags, lines, rooms, article frames) | `research/persona-quiz-v2/final/library.json` |
| Friend game copy | `research/persona-quiz-v2/final/friend.json` |
| The one scorer (app, CLI, sims, tests) | `research/persona-quiz-v2/final/score-core.mjs` (`CONFIG`), grades in `card-schema.mjs` |
| Evidence lock | `research/persona-quiz-v2/final/evidence-lock.json`, `lock-evidence.mjs` |
| Web game | `quiz64/` (entry `src/PersonaApp.jsx`, run state and picker `src/persona/session.js`) |
| Scale labels (kickers, stats, retired labels) | `quiz64/src/persona/stats.js` |
| Backend contracts and question pack | `docs/contracts/`, `docs/question-pack/` |
| Card writing rules for agents | `skills/shared/genii-card-writer/SKILL.md` (workspace root; follows this file) |

## 2. Jerry's standing rulings

One list, final wording. Dates are 2026.

**Process**
1. One build, one spec: this survey and this file. No parallel builds, specs or result design families (09-28).
2. Evidence and tagging first. Tags, questions, answers and result copy are Jerry's to change freely afterward; everything is keyed by id so a rename never touches evidence (09-28).
3. On a plan or audit request, build nothing and report numbers (09-28).
4. Local only. Push, deploy or publish only on Jerry's go (09-28).
5. Keep spend tight: small crews, then one integration and judge pass (09-29).

**Voice and copy**
6. Result voice is smooth and natural, like a perceptive friend saying it warmly. Spicy in content, never in snark (09-28).
7. No gotcha lines ("You'd say X. Last three times, you did Y.") and no sitcom or announcer lines ("Genii called this before you answered") (09-28).
8. Never quote the player's answers on the result, and show no data list. The read is written as fact, never as a science or accuracy claim (09-28).
9. No percentages on any player surface. The one number allowed is Genii's calls count ("5 guessed right") (09-29).
10. Never-say list: PRODUCT-TRUTH section 8 (diagnose, treat, cure, prevent, clinically proven, anti-aging; streaks or absence guilt; "predicts"; DNA or genomics; wearable sync; competitor names; fabricated counts, ratings or reviews; "free forever"; 2.0 features described as live). Player screens also never show "evidence", "axis", "sealed", "run id", "hash", genie or lamp. The app screen promises only what the app does today (09-28).
11. No em dashes anywhere: copy, code comments and docs (standing).
12. Sally's v2 system (`research/sally-v2-2026-09-26`) is a template for structure and humor, never a translation source. English names and tags are written natively (09-28).
13. Two voices with identical meaning: Make it fun and Heart to heart (09-28).
14. Multiple choice only, never free text (09-26).

**Questions**
15. Sub-question first: every card is built backward from a sub-question in `subquestions.json` (field `sq`), and each option lands on one side of it (09-29).
16. Unique situations: no two cards share a situation (trigger, setting, ask, who, stakes; field `fp`), and no answer line repeats anywhere (09-28).
17. At most 2 cards per concept or prop across the whole bank (a dragon, a time freeze, an AI confidant, a group chat name; field `fp.device`) (09-29).
18. Absurd, never-seen worlds: about 40% absurd, 40% unusual, 20% everyday. Everyday only for the "did" formats (real, receipts, bet). The magic never comes from Genii (09-29).
19. Spice: every card clears at least 3 of 5 marks (real stakes, no safe answer, the unsaid, self-question, group-chat test) (09-28).
20. Not too much agency: 3 or 4 tight answers (5 or 6 only where the format needs it), no escape hatches ("Both", "Depends", "Talk it through"), no answer that rewrites the premise (09-29).
21. Hook and shape variety: rotate hook types, prompt openers and closers, answer openers and rhythm; limits enforced by `check-bank.mjs` `SHAPE_LIMITS` (09-28, 09-29).
22. Masked and legible: never name the trait being measured, never ask "what would you do when"; every premise reads instantly (09-26, 09-29).
23. No sensitive asks: never ask the player to open an app, account, bank, messages or photos; nothing about health, body, politics, religion, orientation or party; no explicit sexual content (09-28).
24. No age screen and no age-based content: everyone plays the same bank. Marriage and kids cards are written so anyone can answer or skip (09-28).
25. Gender-neutral wording ("your person", "they") (09-26).

**Visuals**
26. Canon world only, from the GDD v0.2 (company/marketing/docs/10-product-specs/mirrormii-v2-gdd-v0.2, sections 3.2 and 3.4): a floating island of white pearl marble terraces, pools and waterfalls, the lavender tree, an arch pavilion and fountain, and at the center the World Mirror, a tall oval mirror with an iridescent opal frame on a round marble plinth (09-29).
27. Genii is our own 3D slime (`quiz64/src/genii`): a translucent lavender teardrop with a bead on top and two eyes. It starts as an orb and evolves to the full slime by the lock and the reveal. Never a genie, a lamp, smoke or a wish trope; never a library image (09-29).
28. No landing-page marketing media, old UI mockups, generic island stock or library Genii renders anywhere in the build (09-29).
29. Keep what works: the mirror mechanic (each answer becomes a clear glass shard that rebuilds the mirror), the chapter interludes and the Stories format (09-29).
30. In-product names such as Tree of Life stay out of player copy (09-29).
31. Scroll is never hijacked; only tab strips scroll themselves (09-29).

**Names**
32. Plain-names gate: every player-facing label passes the cold-reader gate in [NAMING-RULES.md](NAMING-RULES.md) before it ships (09-29).
33. Two classic, widely known archetypes, one per half, shown side by side; never glued into one phrase, never "X with Y energy" (09-28).
34. Every title card shows kicker, name and one plain defining line under the name (09-29).
35. Labels describe behavior, never beliefs or identity, and both ends of every scale are flattering and shareable (09-29).

## 3. Flow

```mermaid
flowchart LR
  L[Landing] --> S[Setup, 2 taps] --> Y[Lobby, 3 taps]
  Y --> P[40 cards: chapters in order,<br/>interlude per chapter, bonus cards]
  P --> K[Lock: Genii seals 8 guesses]
  K --> F[8 sealed cards]
  F --> R[Stories, 12 screens]
  R --> A[Evidence Article]
  R --> SH[Share image] --> FG[Friend game] -->|Your turn| L
  R --> APP[Get MirrorMii]
```

| # | Screen | What happens | Copy lives in |
|---|---|---|---|
| 1 | Landing | The World Mirror in the canon island; promise, "48 cards", "About 8 minutes" | `lobby.js` `LOBBY_COPY.landing` |
| 2 | Setup (2 taps) | Closest person (my best friend, my partner, a crush, a sibling, a parent, someone else; "your person" in cards means them) and pronoun (she, he, they; friend game only). No age question | `screens/Setup.jsx`, `session.js` |
| 3 | Lobby (3 taps, unscored) | "How should Genii talk to you?" Make it fun / Heart to heart / Just the cards (Make it fun wording, reactions hidden). "How personal can Genii get?" Keep it light (skips `intimate` cards) / Ask me anything. "Which rooms can Genii visit?" love, work, family (each can be closed) | `lobby.js` `LOBBY_COPY` |
| 4 | Play | 40 cards ("Card N of 40"), chapters in order, each opened by an island interlude; extras arrive as "A few bonus cards". Genii reacts between cards per voice. Every answer holds a beat, then flies home as a shard | `session.js`, `play/`, `reactions.js` |
| 5 | Lock | Genii locks its 8 guesses with a SHA-256 before the finale and cannot change them | `play/` lock ritual |
| 6 | Finale | 8 sealed cards ("Final N of 8"), drawn per run from the pool of 24 | `session.js` |
| 7 | Stories | The 12 screens below; tap through, share per screen | `stories/story-data.js` |
| 8 | Evidence Article | Opens after the last story and from "Read the long version"; 3 to 5 minutes | `persona/article/`, `library.json` `article` |
| 9 | Share, friend, app | Share image (story and post), "How well do you know me?" challenge, Get MirrorMii | `share-image.js`, `friend.js`, `story-data.js` |

**Chapters** (rooms): 1 Your phone (22 cards), 2 Friends (22), 4 Money and treats (20), 7 Play, rules and you (20) are always on. 3 Love and your person (18), 5 Work, school and ambition (18), 6 Family and home (18) are rooms the player can close; the run stays 40 cards. Extras: 12 axis cards (2 per axis). Sealed pool: 24 (4 per axis).

**The 12 Stories screens** (order in `STORY_IDS`; screens 6 and 10 show only when they have content):

| # | Screen | Shows |
|---|---|---|
| 1 | Intro | "40 answers in." The shards assemble the World Mirror |
| 2 | Names | The two archetypes in the mirror, each as a title card (section 6) |
| 3 | The short version | The read: one confident line per half |
| 4 | Your personality stats | The character sheet: six stats, 5 pips and a level word each, strongest and closest-to-middle marks |
| 5 | What Genii is surest about | 5 to 6 findings, clearest first |
| 6 | In different parts of life | Room by room lines, and where a room leans the other way (needs 2 or more rooms) |
| 7 | A surprise about you | One warm insight from a believe-versus-did split, else the half's fallback line |
| 8 | Core traits | 5 to 6 keyword traits, each with one line |
| 9 | Every strength has a flip side | The stings, open-book tone |
| 10 | Genii guessed your answers | The locked guesses as panes and the one number (needs locked guesses) |
| 11 | Your card | The share image preview, Share image, Challenge a friend, Copy link, Read the long version |
| 12 | Get MirrorMii | One in-game moment and the store button; Read the long version; the friend game, Genii's guesses and "See or delete your data" as small links |

Share-worthy screens: 2, 8 and 11. Every displayed line traces to the player's own score (`quiz64/tests/reveal-accuracy.test.mjs`, `article-accuracy.test.mjs`).

**Evidence Article** ([quiz64/docs/ARTICLE-DESIGN.md](../quiz64/docs/ARTICLE-DESIGN.md), direction C "The Codex" with A's editorial type): cover, the short version, the character sheet, core traits and where each comes from, the thing you didn't know, room by room and the room where you flip, your two sides at one table, open book, the record (Genii's calls), your people (who you click with, your opposite, a one-line bio), closing with share, challenge and app. Every section distinct, image-rich, animated, natural language; every line from the player's evidence.

**Friend game.** The owner picks a relationship (partner, crush, friend or coworker, bestie) and sends a link. Level 1: 6 either-or guesses, one per axis. Level 2: 12 of the owner's cards in third person. Level 3: 12 trait cards (the owner's, opposites, decoys). Level 4 (bestie, owner opt-in): which sting hits hardest. The owner sees "You, through {friend}'s eyes"; the friend sees only counts, then "Your turn". Links carry the answer key and are unsigned: fine for testing, a backend is needed before real players (section 9).

## 4. Scoring and evidence model

Every answer option carries its own evidence; the scorer only adds up what options say. No hidden topic scores.

| Field | Rule |
|---|---|
| `axes` | Signed -2 to +2 on the six axes (+ is the first pole). Usually one axis, never more than two; only when the behavior implies the pole |
| `tags` | Strength 1 to 3, usually 1 or 2 tags, never more than 3. Support for a tag counts against its pair |
| `emotion` | Optional, research record only |
| `circumstance` | The option is a situation, not a choice. Scores nothing; at most one per card |
| `depends` | Rare. Scores nothing; opens "What would flip you?" with 3 presets |
| `none` | Receipts only: "None of these", exclusive, scores nothing |
| Exits | Skip, Not my life (real cards add No recent example). Never score |

**Axes** (internal pole names never reach a player; the player sees the stats in section 6):

| Axis | + pole | - pole | Meaning | Cards carrying it (pool of 143, `audit.mjs`) |
|---|---|---|---|---|
| R1 | We | Me | close means shared, versus close still means space | 22 |
| R2 | Direct | Soft | says the hard thing now, versus holds the person first | 22 |
| R3 | Classic | Own | the traditional script for love, home and holidays, versus writing your own | 19 |
| L1 | Steady | Venture | the known, versus the new | 17 |
| L2 | Push | Easy | visible progress, versus your own pace | 17 |
| L3 | Rules | Context | the fair process, versus the situation and the need | 18 |

People half = R1 x R2 x R3 (8 archetypes); life half = L1 x L2 x L3 (8 archetypes); a player gets one of each. An axis too close to call (normalized score under `flexBand` 0.12) shows as "Right in the middle"; the pole then follows real-behavior evidence first.

**Grades and weights** (`cards.json` `weights`, `card-schema.mjs`):

| Grade | Formats | Weight |
|---|---|---|
| did | real, bet | 0.80 |
| did | receipts | 0.40 per tick; past 3 ticks each tick is scaled to 3/ticks |
| would | scenario, reply | 0.55 |
| believe | others, this or that, role, pick two (per pick), rank (positions 1, 0.5, 0, -0.5), eyes | 0.45 |
| none | feeling (emotion only), sealed (never scored) | 0 |

Absurd cards are capped at 0.35 (`ABSURD_WEIGHT_CAP`). Answers under 1.5 s count at 0.3.

**Tags.** 50 tags in 25 opposite pairs across the 7 chapters (`library.json` `tags`). A tag fires with net support of at least 2.25 from at least 2 separate cards, one of them calm; "strong" at 3.0; if nothing fires, the best candidate above 1.25 shows. Up to 5 shown, spread over at least 3 chapters where possible, ranked strong first, then by coverage share.

**Scorer settings** (`score-core.mjs` `CONFIG`, set by simulation): rushedMs 1500, rushedFactor 0.3, minAxisCards 2, flexBand 0.12, tagFire 2.25, tagStrong 3.0, tagFloor 1.25, tagMinCards 2, maxTags 5, minChapters 3, tagRank "share", receiptsCap 3, splitMin 0.4, sealedTagWeight 0.6, sealedPairScale 1.2, finaleSize 8.

**Sealed guesses.** Before the finale Genii picks, for each of the 8 drawn sealed cards, the option that best fits the profile, or passes when the card's main axis is in the middle or unfinished. The 8 guesses are hashed and cannot change; a tampered save refuses to score. Sealed answers never feed the profile. Exact hits (chance about 25%) and right-side hits (chance 50%) are counted.

**The picker** (`session.js`). Every player answers exactly 40 cards (`RUN_SIZE`) then the 8 sealed cards. Deterministic: the only randomness is seeded from the run id, and a restored save replays the same route. Pool: open chapters plus the 12 extras, after the depth filter, the C3-9 gate (shown only if the C3-8 picks include a T11A line) and feeling-card rules (a feeling card plays right after the card it follows). Chapters play in order, each opening with its first authored card. Per pick, in priority order:
1. **Coverage:** every axis gets at least 2 valid cards; if a closed room carries an axis, other chapters and extras cover it.
2. **Retention:** after an exit, the next card targets the same axis; after 3 rushed taps, the next card is a quick one.
3. **Flow:** no two cards of the same type in a row (except this-or-that rounds); no two neighbors on the same axis or tag pair; receipts and bet cards spread out.
4. **Value:** balance the axes and favor tag pairs the player leans on; each run focuses on 10 of the 25 tag pairs (seeded).
5. One card per sub-question per run (M2, in progress).

**Coverage targets and where they stand** (2026-09-29, `node audit.mjs` in `research/persona-quiz-v2/final`):

| Target | Now |
|---|---|
| Every axis on 15+ pool cards, 6+ in the always-on chapters | Met: 17 to 22 cards, 7 to 13 always-on |
| Every tag on 4+ cards, 1+ of them "did" | 38 of 50 met; every tag has did evidence. Short: T01A/B, T03A/B, T15A/B (3 cards), T06B, T14B (3), T02A/B (2, concept cap), T11A/B (2, kids cards) |
| Random clickers 45 to 55% on every axis | Met: 45.9 to 54.3% on the full walk; 48.0 to 53.1% at 40 cards |

**Simulation** (2026-09-29):
- Full walk (`node sim.mjs`, `SIM-REPORT.md`, 640 consistent players): axis recovery 94.9%, 100% get 3 to 5 tags, 0 get none, shown tags match the hidden profile 86.4%, sealed exact 67.6% (random clickers 25.5%, chance), all 50 tags reachable.
- Web picker at 40 cards (`node quiz64/tests/persona-sim.mjs --acceptance`, 2,000 consistent players, every room open): sealed exact 64.2%, 0% with no tags, mean 4.30 tags shown, T12B fires for 0.4% (the one tag under 1%). With a room closed, that room's tags stay silent, as designed.

**Evidence lock.** `evidence-lock.json` holds a SHA-256 of every normalized card text (both voices, threads, friend sides) next to the evidence it carries; the kit tests fail while any text or evidence differs from its entry. After re-reading a changed card, `node lock-evidence.mjs --confirm <cardId>` re-locks it (no flag lists what changed). Library renames never reach it.

## 5. Question bank

**Formats** (13; counts from `cards.json`, 2026-09-29):

| Format | The player | Grade | Count |
|---|---|---|---|
| Scenario | Picks a move in a vivid imagined moment | would | 41 |
| Real moment | "The last time..." picks what they actually did | did | 16 |
| Receipts | Taps every ordinary fact that is true, or "None of these" | did | 7 |
| Genii's bet | Genii bets on a specific thing they did; 3 to 5 answers written for that bet, never Guilty/Never | did | 18 |
| Reply | Picks the reply they'd send in a mock text thread | would | 14 |
| Other people | First thought about what someone else did | believe | 14 |
| This or that | 2 punchy options, in quick rounds of 2 or 3 | believe | 17 |
| Role | "In your group chat, you're the..." | believe | 5 |
| Pick two | 2 of 6 short lines most like them | believe | 4 |
| Rank it | Orders 4 items | believe | 3 |
| Friend's-eye view | The line their best friend would use about them | believe | 4 |
| Feeling | Right after a card: the first feeling | emotion | 7 |
| Sealed | A new moment for Genii's locked guess | never scored | 24 |

**Card template.** Hook (one concrete scene-setter, 15 words or fewer, one true detail) then Event (what just happened that forces a response) then Ask (the format's stem, usually implied) then Moves (3 or 4 distinct actions, first person, action first, 12 words or fewer, equally charming, no ladders). Prompt under about 30 words.

**Voices.** Top-level text is Make it fun (playful, specific, roast the move never the person). The `heart` object holds Heart to heart (sincere, calm, full sentences, no exclamation marks, no grading words), same option order and meaning; evidence is shared. Just the cards reads Make it fun.

**Schema.** One card: skill section 7 (`skills/shared/genii-card-writer/SKILL.md`); build-time grades in `card-schema.mjs`; the published shape in `docs/contracts/` (card schema) and the export in `docs/question-pack/`. `privacy` is `normal` or `intimate`.

**Bank** (targets met, 2026-09-29): 174 cards = 138 chapter (22, 22, 18, 20, 18, 18, 20) + 12 extras + 24 sealed. Worlds: absurd 61 (35%), unusual 74 (43%), everyday 39 (22%). Both voices on all 174; friend versions on 117; 67 of 68 sub-questions used. Ids: new cards continue each chapter's numbering; kept cards keep their ids.

**Change flow.** Edit `bank/*.json` (never `cards.json`), then `node merge-bank.mjs`, `node check-bank.mjs --kit`, `node shape-audit.mjs --limits`, re-lock changed cards, `node --test tests.mjs`, then `npm test --prefix quiz64` (the kit parity test proves the stripped kit scores the same). Record concept or evidence moves in a bank log (latest: `bank/ROUND4-LOG.md`).

**Checker** (`check-bank.mjs`): schema and format rules, `sq` and `world` present and valid, everyday only on did formats, unique fingerprints, no repeated answer lines, shape limits (opening words, "Verdict. Reason." share, prompt openers and closers, clock-time hooks, crutch words), genie words in both voices and friend texts, bans. Last run: 174 of 174 cards, 0 errors, 6 warnings (this-or-that cards without a round id).

## 6. Result copy and names

**Sources.** Kickers, stat names and ends: `quiz64/src/persona/stats.js` (`HALVES`, `STATS`, `RETIRED_LABELS`). Archetype names, defining lines (`define`), tag names and keywords: `library.json`. Result chrome: `STORY_COPY`, `UI_COPY`, `GUESS_COPY` in `stories/story-data.js`; article frames in `library.json` `article`. Nothing else spells a label out.

**Title card format.** Kicker (sentence case), then the name, then one plain defining line directly under it, on every screen that shows an archetype name: the names screen, the share image (story and post), the article cover and the party slots.

| Half | Kicker |
|---|---|
| People | With the people you love |
| Life | Day to day |

| People archetype | Code | Defining line |
|---|---|---|
| Golden Retriever | We·Soft·Own | Warm, loyal and happy to see everyone. |
| Comfort Person | We·Soft·Classic | Kind, caring and easy to talk to. |
| Ride-or-Die | We·Direct·Own | Loyal, honest and always there. |
| The Glue | We·Direct·Classic | Brings people together. |
| Lone Wolf | Me·Direct·Own | Enjoys time alone and a few close friends. |
| Straight Shooter | Me·Direct·Classic | Speaks plainly and kindly. |
| Free Spirit | Me·Soft·Own | Gentle, relaxed and one of a kind. |
| Old Soul | Me·Soft·Classic | Loves cozy nights, old favorites and alone time. |

Jerry approved the eight people names (09-28); they are exempt from the gate.

| Life archetype | Code | Defining line |
|---|---|---|
| The Planner | Steady·Push·Rules | Plans ahead and sees it through. |
| The Quiet Achiever | Steady·Push·Context | Gets big things done without the spotlight. |
| The Routine Lover | Steady·Easy·Rules | Enjoys a good routine and favorite things. |
| The Calm One | Steady·Easy·Context | Stays calm and takes life as it comes. |
| The Strategist | Venture·Push·Rules | Goes after big goals with a clear plan. |
| The Go-Getter | Venture·Push·Context | Sees a goal and goes for it. |
| The Explorer | Venture·Easy·Rules | Tries new things, with good judgment. |
| The Spontaneous One | Venture·Easy·Context | Follows curiosity wherever it goes. |

**Stats** (the character sheet; same labels in both voices):

| Axis | Stat | Left end (+ pole) | Right end (- pole) |
|---|---|---|---|
| R1 | Closeness | Stays close | Keeps some space |
| R2 | Hard truths | Says it straight | Says it gently |
| R3 | Traditions | Carries them on | Starts new ones |
| L1 | New things | Sticks with favorites | Tries new things |
| L2 | Pace | Goes fast | Takes it slow and steady |
| L3 | Rules | By the book | Case by case |

| Label set | Words |
|---|---|
| Level words (with 5 pips) | A little, Somewhat, Moderately, Strongly, Very strongly; Right in the middle; Not enough answers yet |
| Badges | Your strongest stat; Closest to the middle |
| What Genii is surest about | Came through clearly; Genii is fairly sure; Genii has a hunch; Genii can't tell yet |
| Genii's calls | Guessed right; Close, not exact; Surprised Genii; No guess; You skipped. The count reads "N guessed right" |
| Rooms | Phone habits, Friends, Love and dating, Spending and saving, Work and school, Family and home, Free time |
| Friend game and share invite | How well do you know me? |

**Traits and keywords.** 5 to 6 core traits per player, one or two plain words each, evidence-backed from the top tags and the strongest stat ends. Tag names are plain phrases of 4 words or fewer that a stranger gets at once, each with one confident line. Keywords follow the same rules: everyday words, behavior not beliefs (for example "Keeps traditions alive", not a political label), both sides of a pair flattering. The full current lists are `library.json` `tags[].name` and the keyword fields; 48 of 50 tag names and 39 keywords were replaced on 09-29 (history file, section 26).

**What the result never shows.** Quoted answers, ids, percentages or scores (except the calls count), the words in ruling 10, science or accuracy claims. The share image shows the two title cards, the core traits with their lines, the invite and the address label; never stings, marriage or kids tags, answers or numbers.

**The gate.** `node scripts/naming-inventory.mjs` lists every label with where it sits. A Codex panel of six cold readers aged 20 to 35 (a progressive activist, a religious conservative, an ESL speaker, a Gen Z TikTok user, a nurse, an engineer) scores clear, hurt and share 1 to 5. Pass: clear 4.5 or more, hurt 2 or less, share 3.5 or more (share only for labels about the player); final labels are scored by 18 readers. Now: 193 of 278 final labels pass (69%), scores in [NAMING-PANEL.json](NAMING-PANEL.json). The residuals are mostly the exempt people names, Traditions and Rules sitting just over the hurt line (every alternative tested scored the same or worse), sensitive topics (kids, weddings, AI, phone privacy) and short UI chrome that needs its screen. `quiz64/tests/naming-retired.test.mjs` fails if any label in `RETIRED_LABELS` renders anywhere or a title card lacks its kicker or line.

## 7. Visual system

**Design docs.** [quiz64/docs/DESIGN-DIRECTION.md](../quiz64/docs/DESIGN-DIRECTION.md) holds the system (type Fraunces and Figtree, color, materials, motion tokens, accessibility contract, per-screen specs, QA checklist); [quiz64/docs/ARTICLE-DESIGN.md](../quiz64/docs/ARTICLE-DESIGN.md) holds the article. Both predate some rulings. Where they disagree with section 2, section 2 wins: the mirror is the oval World Mirror (not an arched mirror), Genii is the 3D slime (not light only), the backgrounds are the canon island renders (not code-made islands), the map is the stat sheet in section 6 (not a facet gem), and every label is from section 6.

**Canon assets** (`quiz64/public/assets/island/`, sizes and sources in `MANIFEST.json`; generated from the GDD references):

| Asset | Files | Used on |
|---|---|---|
| Island hero, day portrait | `hero-portrait-720/1080.webp` | Landing, product screens |
| Island hero, wide | `hero-wide-960/1600.webp` | Desktop backdrops |
| Island hero, night | `hero-night-720/1080.webp` | Night screens of the reveal |
| World Mirror frame (opal, alpha) | `mirror-frame-240/480/900.webp` | Landing, lock, names, share image |
| Room inside the mirror | `mirror-inside-360/720/1080.webp` | The glass of the mirror |
| Chapter islets 1 to 7 | `ch1-360.webp` to `ch7-720.webp` | Interludes, chapter map, rooms |
| Still of our 3D Genii | `genii-still.png`, `genii-still.webp` | Share image, static fallbacks |

Also `quiz64/public/assets/mirrormii-wordmark.svg` (used as is) and `genii-opal-alert.webp` (the canon render our 3D Genii is checked against in `qa/genii-lab`, not shown in the game). Glyphs, shards, rails and panes are code-made in `quiz64/src/art`. Genii's evolution stages are in `quiz64/src/genii/evolution.js` (three.js, lazy; SVG fallback).

**Motion.** Headings and primary controls readable within 300 ms of any screen change; total stagger at most 280 ms; one hero motion per screen; taps during an animation finish it and act; every answer holds a beat before the next card (the reply format holds 1.18 s); every motion has a reduced-motion path (crossfades, no travel); at most one WebGL canvas alive, paused off screen; card screens run no shader.

**Layout.** Phone first (390 x 844 reference, 16 px gutters), then desktop. Every card's answers and exits sit above the fold at 390 x 844. Tap targets at least 48 px; WCAG 2.2 AA; 200% text zoom without horizontal scroll. The layout guard (`qa/layout-guard.mjs`) fails on text over text or controls, text showing through a fixed bar, clipped text, offscreen text, labels squeezed into pills and focus targets covered by a sticky bar; run it after any CSS change.

## 8. Quality gates

Commands run from `products/survey/` unless noted. "Last" is the latest verified result with its date or source; the 2026-09-29 numbers in sections 4, 5 and 8 were measured on the bank and picker at commit 556cf94, before package M2 (one card per sub-question) landed.

| Gate | Command | Pass bar | Last |
|---|---|---|---|
| App tests | `npm test --prefix quiz64` | all pass | 151 of 151 at 556cf94, plus the 2 docs-check tests (153 in all) |
| Kit tests | `node --test tests.mjs` in `research/persona-quiz-v2/final` | all pass | 45 of 45 (2026-09-29) |
| Bank checker | `node check-bank.mjs --kit` (same folder) | 0 errors | 174 cards, 0 errors, 6 warnings (2026-09-29) |
| Shape audit | `node shape-audit.mjs --limits` (same folder) | passes | enforced inside check-bank |
| Evidence audit | `node audit.mjs` (same folder) | section 4 targets | axes met, 12 tags short (2026-09-29) |
| Evidence lock | `node lock-evidence.mjs` (same folder) | nothing changed unconfirmed | enforced by the kit tests |
| Kit simulation | `node sim.mjs` (same folder) | SIM-REPORT targets | all pass except random strong tags on the full walk (reported only) |
| Picker simulation | `node quiz64/tests/persona-sim.mjs --acceptance` | no player with 0 tags; random clickers 45 to 55% | 0%, 48.0 to 53.1%, sealed exact 64.2% (2026-09-29) |
| Contracts | `node scripts/validate-contracts.mjs` (also in `npm test`) | all checks pass | pass (2026-09-29) |
| Docs | `node scripts/check-docs.mjs` (also in `npm test`) | no retired labels here, no em dash in `docs/` | pass (2026-09-29) |
| Retired labels, title cards | `quiz64/tests/naming-retired.test.mjs` (in `npm test`) | pass | pass |
| Display accuracy | `quiz64/tests/reveal-accuracy.test.mjs`, `article-accuracy.test.mjs` (in `npm test`) | pass | pass |
| Naming panel | `node scripts/naming-inventory.mjs`, then the Codex panel | section 6 gate | 193 of 278 pass (NAMING-PANEL.json) |
| Layout guard | `npm run qa:layout --prefix quiz64 -- <dev url>` (dev server, `PLAYWRIGHT_MODULE` set) | 0 failures | built 2026-09-29 (commit 94996db); rerun after CSS changes |
| Fold | `node quiz64/tests/visual/fold.mjs` | every option above the fold | 348 renders, 0 failures (round 3) |
| axe, CLS, LCP, never-say, share PNGs | `node quiz64/qa/qa-checks.mjs <dev url>`; article: `quiz64/qa/article-axe.mjs` | axe 0, CLS under 0.02, LCP 2.0 s or less on a mid phone | axe 0 on 205 screens, CLS 0, LCP 276 ms fast and 3.1 s cold slow 4G (round 3) |
| Play-through | `node quiz64/qa/play-through.mjs <dev url> fun\|heart\|cards` (`KEYS=1` for keyboard) | no errors | mouse and keyboard clean (round 3) |
| Codex judges | `codex exec -s read-only -o out.json "prompt" -i imgs... < /dev/null` | target 8 | visual 6.8 (`quiz64/docs/VISUAL-JUDGE-CODEX-R5.json`); article 7.73 and 7.64 (`ARTICLE-JUDGE.json`); bank rounds in `research/persona-quiz-v2/final/bank/JUDGE-CODEX-R*.json` |

Known gaps: the cold slow-4G first paint (about 3 s) comes from bundle size (PersonaApp about 207 kB gzip, three.js scene about 146 kB gzip, lazy); no real-person validation.

## 9. Handoff

Desmond builds the backend (signed links with the answer key server-side, reply sync, storage, analytics, deployment). His entry is [HANDOFF-DESMOND.md](HANDOFF-DESMOND.md): data flow, what is built, build order, the contracts in [contracts/](contracts/) (checked against real runs by `scripts/validate-contracts.mjs`), the question pack in [question-pack/](question-pack/), deployment. Storage when a backend exists: SQLite (09-24/26). Card content, names, result copy, scoring rules and visual design stay Jerry's.

| Placeholder | Where | Today |
|---|---|---|
| Get MirrorMii button target | `quiz64/src/persona/stories/story-data.js` `APP_LINK` | `"#get-mirrormii"` |
| Address on the share image | `story-data.js` `SHARE_URL_LABEL` | `"mirrormii.ai"` (no digits on the image) |
| Challenge and reply link base | `quiz64/src/persona/links.js` `linkFor` | the current page; a backend issues short links |
| Invite lines per relationship | `quiz64/src/persona/friend.js` `invitesFor` | not used by the UI yet |

Known limits today: unsigned fragment links carrying the answer key; no cross-device sync; `localStorage` only; every save and link is pinned to `KIT_ID`, so a bank merge refuses old saves and links by design.

## 10. Open decisions for Jerry

Only real open decisions. The build ships the default until Jerry rules.

| # | Decision | Default in the build | Where it stands |
|---|---|---|---|
| 1 | People kicker | "With the people you love" | Jerry locked "With your people"; it failed the gate three times (read as an ethnic or political group, clear 4.0). The replacement passed; needs his yes |
| 2 | Hard truths wording | "Hard truths: Says it straight / Says it gently" | Sits just under the gate on hurt; "Giving feedback: Direct / Gentle" passed once. Pick one |
| 3 | T02 and short tags | T02 on 2 cards | The 2-per-concept rule moved two T02 cards to T04 and T05 (`bank/ROUND4-LOG.md`); T02 still fires. The 4-cards-per-tag target is unmet for 12 tags (section 4). Choose: concept rule wins, or write more cards for the short tags |
| 4 | "Your opposite: X and Y. Know one?" on the share screen and in the article | In | Proposed by Claude; needs a yes or a cut |
| 5 | Copy sign-off | Shipping as written | No recorded sign-off for the eight life names, the Heart to heart wording, the tag names, the Evidence Article copy and the DESIGN-DIRECTION D6 proposed copy |
| 6 | Blind test 2 | Not run | Jerry plus 3 to 5 real people: accuracy and "that's me" per line |
| 7 | Teens 13 to 17 | No age question, no age content | Conflicts with PRODUCT-TRUTH; the backend must not collect or infer age |
| 8 | Public app link and share domain | Placeholders (section 9) | Waiting on Jerry |
| 9 | Push and the Pages workflow | Local only | The Pages workflow still deploys the older dossier branch; shipping means pointing it at `survey/launch` or merging, on Jerry's go |
| 10 | Lone Wolf | Kept (approved, exempt) | The panel reads it as antisocial (hurt over the line); keep or rename |
| 11 | Virality pass on the mirror text | Not started | The words on the names mirror and the share image; proposed, scope to set |

## 11. Changes

- 2026-09-29: Locked. Rewritten from the 26-section spec into this one (every rule once, final form); the old file moved to `docs/history/LAUNCH-SPEC-2026-09-29-full.md`; `scripts/check-docs.mjs` added to `npm test`. Superseded content removed here: the round 2 map stat labels (Orbit, Delivery, Blueprint, Compass, Engine, Code), the first life names (The Slow Burner, Creature of Habit, The Easygoer, The Wanderer), "With your people" and "With your life", "Do you really know me?", round 3's library assets on product screens (`quiz64/public/assets/world/`), the gothic arch and stained glass mirror, Genii as light only, the 9-screen deck, the ending-style lobby tap, the age question and teen prompts, the facet gem.
- 2026-09-29: Plain names (history section 26): naming rules, cold-reader gate and panel; new life names, kickers, stats, level words, badges, calls, rooms, keywords and tag names; every title card shows kicker, name and defining line.
- 2026-09-29: Round 4 (history section 25): canon GDD world and oval World Mirror; Evidence Article (C with A's type); Desmond's handoff, contracts and question pack.
- 2026-09-29: Round 3 (history section 24): stats without percentages, 5 to 6 core traits, spicier rooms, open-book stings, bank legibility pass, handoff cleanup.
- 2026-09-29: Round 2 (history section 23): Genii evolves from orb to slime; no lamps or genie tropes; hold beat and one selected state; card variety pass; 12-screen reveal with a display-accuracy test.
- 2026-09-29: Sub-question first and worlds; absurd weight cap 0.35; overnight build of the full 174-card bank and the visual rebuild.
- 2026-09-28: Build C grill (history sections 21 and 22): bank size and uniqueness, spice, card template, 13 formats, two voices, no age screen, classic archetype names, no quotes on the result; 2-tap setup and 3-tap lobby.
- 2026-09-28: Step B evidence lock: axis depth, tag support with did evidence, random-clicker balance, text-change guard.
- 2026-09-28: One spec created from six earlier documents; Jerry approved the formats, 40 + 8, two voices, the guard, the app promise and the testing-only friend links.
