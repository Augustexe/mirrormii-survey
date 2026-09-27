# Persona quiz V2: build brief (read fully before any work)

The single spec for this build. Written 2026-09-26 from Jerry's rulings and Sally's v2 system. If a detail is not here, choose what best serves the central purpose and say so in your notes.

**Sources you must read:**
- Sally v2 (governing architecture, Chinese): `../sally-v2-2026-09-26/v2-system-64types-tags.md`, `v2-48-questions.md`, `v2-friend-version.md`, `v2-bestie-version.md`
- What failed last time: `LESSONS-FROM-TEST-1.md` (this folder)

## Central purpose

A free web personality game. People **finish** it, get a result that feels uncannily accurate, fun and a little spicy, and **share** it so friends play "Do you really know me?". The friend loop lowers acquisition cost. Everything serves that.

## Architecture: Sally's four layers (keep)

| Layer | What the player sees | Produced by | Shareable |
|---|---|---|---|
| 1. Type (64) | A two-part type name: relationship half-name × life half-name, with descriptions and a share card | 6 axes | yes |
| 2. Tags (up to 5) | Paired persona tags, each with its evidence, a sting line and a heart line | ~42 tags, each fired by ≥2 trigger cards | name + heart yes; sting owner-only |
| 3. Friend game | "Do you really know me?": guess the type, guess their choices, guess their tags (bestie adds: which sting line hits them) | the result + opposite tags as decoys | yes, the growth engine |
| 4. Research record | nothing | want vs have-to, doesn't-fit-my-life, what would flip you | no |

Never use MBTI names, letters or type names. Everything is our own. Outward copy never claims "scientifically measured".

### The six axes (sign convention: + is the first pole)

| Axis | + pole | − pole | Sally scoring questions |
|---|---|---|---|
| R1 | We (connection) | Me (autonomy) | Q05, Q21, Q24, Q41 |
| R2 | Direct (says it) | Soft (holds you first) | Q25, Q27, Q28, Q37 |
| R3 | Classic script | Own script | Q01, Q04, Q09, Q12 |
| L1 | Steady | Venture | Q17, Q19, Q33, Q46 |
| L2 | Push (achievement, certainty) | Easy (own pace) | Q20, Q45, Q48 |
| L3 | Rules (process, order) | Context (situation, need) | Q02, Q38, Q40 |

Relationship half-names = R1 × R2 × R3 (8); life half-names = L1 × L2 × L3 (8); type = one of each (64). Sally's 16 half-names and her tag library are the base; rework them per the rules below.

**Known issue from Sally's own simulations:** R2 mixes two things (responding to a friend's wrongdoing, Q25/Q37, versus your own support capacity, Q27/Q28), so both her test people tied. Cards for R2 must measure one thing: saying the hard thing directly versus holding the person first. Capacity cards feed tags (Limited-edition energy and its pair), not R2, unless they are clearly about directness.

## The evidence layer (Jerry: every answer is tagged)

Every answer option carries its evidence. There are no hidden topic scores:
- `axes`: e.g. `{"R2": 2}` (signed, −2 to +2, on the six axes above; usually one axis, never more than two).
- `tags`: e.g. `[{"id":"T08B","s":2}]` (persona tags this option supports, strength 1 slight, 2 moderate, 3 strong; usually 1 or 2, never more than 3). Support for a tag counts against its pair automatically.
- `emotion`: optional (guilt, sting, worry, resentment, envy, relief, pride, delight, cringe, longing, irritation, warmth).
- `circumstance: true`: the option is a situation, not a choice (money pressure, no real choice right now, family need). It scores nothing and is logged to the research record. This is Sally's "only way right now" (只能這樣) rule, built into the options.
- Every card also offers the exits "Skip" and "Not my life" (Sally's premise check: does not fit my situation). Real cards also offer "No recent example". None of these score.
- If a card has a "depends" style option (both sides true), it gets a follow-up tap, "What would flip you?", with 3 preset conditions. Never free text.
- Card grade sets the weight: real ("did", 0.80), scenario ("would", 0.55), this_or_that, role and pick_two ("believe", 0.45), feeling (emotion only), sealed (never profile evidence).
- `ae`: A–E evidence types the card covers (A action, B bond, C context, D desire, E emotion). `mask`: what it looks like versus what it really measures (internal).
- Every tag and axis value must follow from the behavior described, not from the joke.

## Card types (unique answer types; rotate them)

| type | grade | shape |
|---|---|---|
| `scenario` | would | a vivid imagined situation, 4 or 5 distinct moves (the main format) |
| `real` | did | "Think of the last time…" with a vivid setup, 4 or 5 distinct things you actually did |
| `this_or_that` | believe | 2 punchy options on a spicy everyday debate, served in quick rounds of 3 |
| `role` | believe | "In your group chat, you're the…": pick 1 of 5 or 6 archetype roles, each a short vivid line |
| `pick_two` | believe | pick the 2 of 6 short lines most like you (each pick is slight evidence) |
| `feeling` | emotion | after a scenario or real card: "What showed up first?", 5 feelings in plain words |
| `sealed` | none | a new situation; Genii locks a guess before the player sees it; options carry axes/tags so the guess is computed |

**No ladder answers.** Options must be different behaviors, never four intensities of one action. Bad: "The $300 ones." / "The $300 ones, after a week." **No visible repetition:** a Sally question becomes one card; if an axis needs more evidence, the next card is a different situation in a different part of life.

## Writing rules

- Multiple choice only. Never free text anywhere, including the friend game (Sally's roast box becomes "pick the roast", from preset lines).
- Masked: never name the trait, axis, tag or type being measured.
- Gender neutral: "your person", "your closest person", "they". Pronouns in the friend game come from the owner's setting (she / he / they).
- Teen-safe unless the card is marked `locked18` (marriage, kids and sex topics). Sally's Q07 (sex before commitment) is dropped entirely. R3 must be measurable by teens too: use home, holiday, tradition and "how a home should run" cards, not only marriage and weddings.
- No health data or health items. Sally's Q31/Q32 become "track everything versus go by feel" in daily life (budgets, calendars, streaks), never health. Q30 (a friend's body) becomes a friend's new look you don't love (haircut, outfit, tattoo).
- No politics or public policy. Sally's Q02, Q38, Q40 (L3) become everyday rules: group projects, lines and queues, house rules, game rules, a friend who bends a rule.
- Voice: "Make it fun". Clear is not plain: the fun lives in the situation (Jerry's reference: "You're at a festival, you lose your friends, your phone is at 2%"). Answers start with the action, stay under about 12 words, use true specific details, never metaphors that need decoding. No cool answer: every option gets the same charm. Roast the move, never the person.
- Every emotion is a valid target: guilt, sting, worry, envy, resentment, cringe, pride, relief, delight, hope, curiosity, recognition, tension.

**Golden set (approved by Jerry; match or beat it):**
- "A limited banner drops tonight. Your favorite character, 48 hours only. You have $30 of fun money this month." / Pull. All of it. Tonight. / Wait for the rerun. They always come back. / Skip it. That $30 already has a job.
- "1am. Your friend has carried the team all night and types 'one more match?' You're up at 9." / Obviously. It's never actually one more. / Go "afk" and quietly never come back. / "I'm done, gg. Same time tomorrow?"
- "Think of the last time a message that mattered showed 'Read' and no reply." / Forgot about it. They'd answer eventually. / Kept checking if they'd been online since. / Reread my message like it was evidence.
- "11:48pm. You're finally drifting off. Your best friend texts: 'are you up? I need to talk.'" / Sit straight up and call. Sleep is canceled. / Pretend I'm asleep. Text them first thing at 7am.
- "Your friend plays you a song they wrote. It's not good. They look so hopeful." / "The chorus needs work. Want notes?" / "This is a hit." Start humming it on the spot.
- "You find $200 in a jacket you haven't worn since last winter." / Concert tickets. Tonight if possible. / It went to a bill. Romance is dead. (circumstance: scores nothing)

## Chapters (sections)

Seven chapters, each with a title and a one-line intro in Genii's voice, then the sealed finale. Each chapter covers the listed Sally questions (one card each, rewritten as vivid cards in varied types) plus extra cards where its axes or tags need more evidence. Target 7 to 9 cards per chapter; 56 to 64 cards total; about 10 to 12 minutes.

| Chapter | Sally questions | Notes |
|---|---|---|
| 1 Your phone | Q41, Q42, Q43, Q44, Q26 | online life, group chats, texts, AI |
| 2 Friends | Q25, Q27, Q28, Q37, Q39, Q30 (reframed), Q15 | R2 lives here; keep R2 cards about directness |
| 3 Love and your person | Q05, Q06, Q08, Q14 | teen-safe ("your person" can be a crush or best friend); plus a 🔒 18+ block for Q10, Q11 |
| 4 Money and treats | Q13, Q16, Q33, Q34, Q35, Q36 | include gacha and game spending costumes |
| 5 Work, school and ambition | Q17, Q18, Q19, Q20, Q45, Q48 | teen versions use school, clubs, part-time jobs |
| 6 Family and home | Q21, Q22, Q23, Q24, Q01, Q04, Q09, Q12 | R3 cards; Q09, Q12 as 🔒 18+ or teen-framed "someday" |
| 7 Play, rules and you | Q02, Q38, Q40 (everyday rules), Q46, Q47, Q29, Q31/Q32 (reframed) | L3 lives here; gaming costumes welcome |
| Finale | 8 sealed checks | at least one per axis, plus two for common tags |

**Run order rules:** rotate card types (never two of the same type in a row, except this_or_that rounds of 3); put at least half of the real cards in the first two thirds of the run; never put two cards evidencing the same axis or tag pair next to each other; open each chapter with its most fun card.

## Result page

1. Type name (relationship half × life half) and its code (six parts), then the two half-descriptions.
2. Two sting lines (owner only) and two heart lines.
3. Up to 5 tags: name, the cards that fired it ("you told Genii…"), sting (owner only), heart.
4. Genii's calls: 3 one-liners predicting what they would do (from the fired tags' `calls`).
5. The plot twist, if a split exists: "You'd say X. Last time, you did Y."
6. Share card: type name, tag names and hearts only. Invite: "Do you really know me?"

## Scoring (the engineer implements; thresholds set by simulation)

- **Axis score** = Σ weight × value over valid answers. Rushed answers (under 1.5 s) count at 0.3 weight. Circumstance options, "Not my life", "No recent example" and Skip never count.
- An axis needs at least 2 valid cards, otherwise "this side isn't finished yet" and the player is offered 1 or 2 extra cards for it. A tie (|score| under a small threshold) earns a "flex" badge: the real-card evidence breaks the tie first, then the first card (Sally's rule, adapted).
- **Tags** fire when they have support from at least 2 separate cards, at least 1 of them not rushed, and net support (minus their pair) above a threshold. Up to 5 are shown, strongest first, from at least 3 different chapters where possible.
- **Split:** believe-grade evidence points one way and did/would evidence the other on the same axis or tag pair. A split becomes the plot twist.
- **Sealed:** each sealed option carries axes/tags; Genii locks the option that best matches the profile before the player sees it; it passes when the relevant axis is flex or unfinished.
- Validation targets (Sally's pre-launch list, simulated): on varied synthetic respondents no axis lands above 80% on one pole; most people get 3 to 5 tags, none 0, none above 8; random clickers rarely fire strong tags; a consistent synthetic respondent is recovered.

## Friend game (build the full content)

Pronouns from the owner's setting. The owner picks who they're sending to: partner, crush, friend or coworker, or bestie. Sally's relationship rules decide which questions appear (no partner questions for a coworker; love tags only when opted in for a crush).
- **Level 1, guess the type:** 6 either-or questions, one per axis, in third person ("With the people close to them, {name} is more…"). A flex axis accepts either answer.
- **Level 2, guess their choices:** 12 cards from the run, rewritten in third person with 2 options each (card field `friend`). Cards the owner skipped, answered "depends", circumstance or "Not my life" are swapped for backups in a fixed order. 🔒 and intimate cards never appear.
- **Level 3, guess the tags:** 12 cards = the owner's N tags + their N opposites + 12 − 2N random others (one per pair, never from pairs already used, never 🔒). The friend picks N. Card face: name + heart only.
- **Bestie Level 4 (bestie version, only if the owner opens sting lines):** which of 4 sting lines hits them hardest (1 true, 3 others), plus "pick the roast": the friend picks 1 of 6 preset roast lines about the owner (no free text).
- **Results:** the owner sees "{friend} thinks you're {guessed type}. You're {true type}. They read {x}/6 sides of you", the three zones (They get you, with hearts / What they don't see, with stings / Who they think you are, with the opposite tags picked), the most surprising Level 2 miss, and Sally's score lines per band. The friend sees only their score and "Your turn: see if they know you". Advanced: bestie versus partner comparison, and a "who knows you best" ranking (owner only).

## Library rules (types and tags)

- 16 half-names (8 relationship, 8 life) and about 42 tags in clean opposite pairs; English first, gender neutral; keep Sally's Chinese as `zh`.
- Meme-style names people would proudly share. Never a diagnosis (anxious, avoidant, narcissist) or a moral grade (selfish, toxic, gold-digger). Rename tags that duplicate half-names (Sally already renamed two).
- Each tag: `id` (T01A, T01B…), `pair`, `chapter`, `name`, `zh`, `sting` (owner only; stings because it is true), `heart` (the "I love my imperfection" line), `calls` (2 or 3 "Genii predicts" one-liners), `never` (what it must never be read as), `triggers` (Sally Q-ids and the behaviors that evidence it), `locked18`, `friendGame` (open, default-off, or never).
- Each half-name: `code` (e.g. We·Direct·Own), `name`, `zh`, `desc`, `sting`, `heart`.
- Tags that depend on cut or reframed questions get rebuilt triggers (e.g. Q31/Q32 reframed; Q02 replaced by an everyday fairness card).

## Quality bar (the gauntlet)

A card ships only if: every option is a distinct behavior; no option is the cool answer; it reads in one pass; it is funny or emotionally sharp; its axes and tags are defensible; it does not visibly repeat another card; it is teen-safe unless 🔒. Judges: evidence auditor; Jasmine (27, partnered cozy gamer); Jordan (25, male trainer, not a gamer); Riley (16, synthetic teen); Mika (21, broke student barista); Wei (32, Chinese diaspora, parents nearby); Theo (31, creator, virality); a flow judge who plays the whole run in order and flags repetition, fatigue and pacing.
