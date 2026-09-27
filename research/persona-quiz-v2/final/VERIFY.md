# Verification of the blind test 2 kit

Verifier and completeness pass, 2026-09-26. Checked against `../BRIEF.md`, Sally's v2 docs (`../../sally-v2-2026-09-26/`) and `../LESSONS-FROM-TEST-1.md`. Three synthetic first-time players, a requirement checklist, a repeat hunt, the fixes made and what is still open.

**Bottom line.** The kit plays end to end, scores, freezes, checks and builds every friend deck. The three players get clearly different results that quote their own answers back to them. One structural problem should be fixed before blind test 2: **20 of the 50 tags can never fire** in the shipped run, so every player draws from the same 30 (section 5, open item 1). Three card pairs still read as "the same question" (section 3).

## 1. Three play-throughs

Answer files and every output are in `../verify-plays/<player>/`, outside `final/` so the blind copy stays clean. `make.mjs` there rebuilds the answer files. Timings are 2.4 to 14 s per card, with two this_or_that taps under 1.5 s each to exercise the rushed rule. Each player ran `profile`, `freeze` (and a second `freeze`, correctly refused), `check`, and `friend --rel bestie --stings on`. Partner, crush and friendOrCoworker decks were also built for Jasmine and Riley.

| | Jasmine, 27, partnered cozy gamer | Jordan, 25, male trainer, no games | Riley, 16, synthetic teen |
|---|---|---|---|
| Run | adult, 62 cards (C3-9 opened by her C3-8 pick) | adult, 61 cards (C3-9 gated out), "Not my life" on C7-10 (squad game) | teen, 59 cards, no locked18 cards shown |
| Type | **Open-Book Golden Retriever × Chill Personified** (We·Soft·Own \| Steady·Easy·Context) | **Old-School Final Boss × Color-Coded Overachiever** (Me·Direct·Classic \| Steady·Push·Rules) | **Open-Book Golden Retriever × Vibes-Based Wanderer** (We·Soft·Own \| Venture·Easy·Context) |
| Flex / unfinished | none | none | none |
| Tags (strong marked) | Yes first, bank app later (strong); Compliment sandwich chef (strong); Head over heels, eyes open; Relationship mechanic; Close Friends list: 4 | Limited-edition energy; Moves out, still calls on Sundays; Modern for you, classic for me; The honest review nobody asked for; Actually read the rulebook (all strong) | Bends rules for good reasons (strong); Head over heels, eyes open (strong); Still loading, and that's fine; Books it, figures it out later; Tells the AI first |
| Chapters behind the tags | 1, 2, 2, 3, 3 | 2, 2, 6, 6, 7 | 1, 3, 4, 5, 7 |
| Plot twist | "You'd say: 'The neighbor's. My plant has a backstory now.' Last time, you did: 'Went deep on my own thing.'" | "You'd say: 'The one I love. Smaller paycheck, happier Mondays.' Put on the spot: 'Straight into savings.'" | "You'd say: 'Ghost. Suddenly busy whenever they call.' Put on the spot: 'Wait to see who steps up, then fill the gaps.'" |
| Sealed finale | 4 of 8 exact (chance 25%), right side 6 of 6 | 5 of 7 exact, right side 6 of 6 (C4-10 banner: Not my life) | 7 of 8 exact, right side 6 of 7 |
| Friend deck (bestie, stings on) | L1 6, L2 12, L3 12 (N=5), L4 on | same | same |

**How the results read, as the player.**

- **Specific, not generic.** Every tag shows "you told Genii" lines in the player's own words ("Went, paid, and ate instant noodles for a week."; "Told them straight it was wrong. Left on read for two days."; "Typed it all out to an AI. It asked good questions."). The calls are fun and concrete ("You've paid for a friend's ticket and 'forgot' to ask for it back."). Jordan's five strong tags and type all agree; it reads like one person.
- **Clearly different.** Jordan shares no type half and no tag with the others. Jasmine and Riley share the relationship half (Open-Book Golden Retriever) and one tag (Head over heels, eyes open), but their life halves and the other four tags differ (steady, easy, gives for friends vs venture, rule-bending, AI-first).
- **What felt off.**
  - Jasmine's plot twist does not read as a contradiction. A charity plant and a free afternoon on her hobby are unrelated situations joined only by the T23 tag pair. Jordan's (L1 axis) and Riley's (T18, same family topic) work.
  - Jasmine's life half says "you never blow the budget doing it" while her top tag says "One ask from a friend and your budget rules vanish." Same page, opposite claims.
  - Jordan's life sting, "Your plan is flawless. You just keep not pressing start.", clashes with his answers: he said yes to the promotion and started a plan the day a peer posted big news.
  - Jordan's "Modern for you, classic for me" fires on plain classic answers ("Run it like home: nobody sits till the dishes are done."). The name promises a two-sided twist that his evidence does not show.
  - Riley, 16, gets "Head over heels, eyes open". It is teen-safe (their "person" is a best friend), but the name reads as romance.

## 2. Requirement checklist

54 requirements from BRIEF.md and Sally's v2 docs: **40 met, 11 partial, 3 missing** (after the fixes in section 4).

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Four layers: type, tags, friend game, research record | met | result.json, friend-deck.json, profile.json `research` |
| 2 | Six axes, sign convention, Sally scoring questions mapped | met | all 46 kept Sally Qs sit on a card (Q03, Q07 dropped per brief) |
| 3 | R2 is directness only; capacity cards feed T06 | met | R2 on C2-1, C2-5, C2-8, C3-12, C2-10; C2-7, C2-2, C5-5 carry T06 only |
| 4 | 64 types from 16 half-names with code, desc, sting, heart, zh | met | 1000 synthetic players hit all 64 types |
| 5 | No MBTI, no "scientifically measured" | met | grep clean |
| 6 | Option evidence fields and limits (at most 2 axes, 3 tags, s 1 to 3) | met | scan of all 82 cards |
| 7 | Every option carries evidence | partial | 7 chapter options and 1 sealed option score nothing: C1-4.3, C1-4.4, C2-5.4, C4-7.4, C7-7.3, C7-7.4, C7-10.3, C7-S1.2 (C7-6.2 fixed) |
| 8 | Skip and Not my life on every card, No recent example on real cards | met | `exits` on every card |
| 9 | "Depends" options get a flip with 3 presets | met | C2-3, C3-9, C6-6, C7-3 |
| 10 | Grades and weights (0.80, 0.55, 0.45, 0) | met | cards.json `weights` |
| 11 | `ae` and `mask` on every card | met | scan |
| 12 | All 7 card types, rotated, this_or_that in rounds of up to 3 | met | 22 scenario, 12 real, 12 this_or_that, 7 pick_two, 5 feeling, 4 role, 8 sealed |
| 13 | No ladder answers | partial | 4 near-ladders left (section 3) |
| 14 | No visible repetition | partial | 3 strong repeats (section 3) |
| 15 | Multiple choice only, including the friend game | met | why-chips, pick the roast, picked friend label |
| 16 | Masked: no trait, axis, tag or type named | met | spot check of every prompt |
| 17 | Gender neutral, owner pronouns from setting | met | 4 pronoun bugs fixed (section 4) |
| 18 | Teen-safe, locked18 hidden for teens, Q07 dropped, R3 measurable by teens | met | Riley's run: no C3-8, C3-9, C6-9; R3 from C3-1, C6-1, C6-3, C6-7 |
| 19 | No health, no politics | met | Q31/Q32 became C7-5 (Sunday planning); Q02/Q38/Q40 became Uno, rules, tickets |
| 20 | Answers action-first, about 12 words or fewer | met | longest option is 14 words |
| 21 | Golden set matched or beaten | partial | 4 of 6 golden cards are in the run; "1am, one more match?" and "'Read' and no reply" are not (ch1.changes.md), yet T02 triggers still cite the Read card |
| 22 | 7 chapters with title and one-line intro | met | cards.json `chapters` |
| 23 | 56 to 64 cards, about 10 to 12 minutes | partial | 62 chapter cards, but 70 with the finale (67 teen) |
| 24 | Run order: no same-axis or same-pair neighbours, types rotate, real cards early | met | independent check; 8 of 12 real cards before the two-thirds mark |
| 25 | Finale: 8 sealed, at least one per axis, two common-tag checks | met | C2-10 R2, C4-10 and C7-S2 L1, C6-S1 R3, C5-S1 L2, C7-S1 L3, C3-10 R1; C2-11 and C7-S2 for tags |
| 26 | Result page: type, code, halves, 2 stings, 2 hearts, tags with evidence, 3 calls, share card | met | result.json for all three players |
| 27 | Plot twist reads as "You'd say X. Last time, you did Y." | partial | tag-pair splits across unrelated cards produce twists that don't contradict (Jasmine) |
| 28 | Rushed under 1.5 s at 0.3; exits and circumstance never score | met | profile `research.rushed`, tests |
| 29 | Unfinished axis offers extras; flex tie broken by real cards, then first card | met | 12 extras, score.mjs |
| 30 | Tag firing: 2 cards, 1 calm, net threshold, up to 5, at least 3 chapters | met | all three players show 3 or more chapters |
| 31 | Every tag can actually fire | **missing** | 20 of 50 tags cannot reach tagFire 2.25 (section 5, item 1) |
| 32 | Sealed: locked before the finale, sha256, refuse refreeze or tamper, pass on flex | met | second freeze refused for all three |
| 33 | Validation targets (Sally's list, simulated) | met | SIM-REPORT.md, all targets pass after the fixes |
| 34 | Relationship chooser with Sally's rules | met | crush drops C1-2 and love tags unless opted in; friendOrCoworker has no love or couple cards; teen owner never gets marriage and kids tags, even with `--mk on` |
| 35 | Level 1: 6 either-or questions, one per axis, flex accepts either | partial | works; a coworker still sees "In love and with family, {name} is more…" (Sally's wording) |
| 36 | Level 2: 12 run cards, backups for skipped, depends, circumstance or Not my life, no locked or intimate | met | Jordan's C7-10 Not my life stayed out; 12 cards in every deck |
| 37 | Level 3: N true, N opposite, 12 - 2N decoys, never a pair already hit | met | fixed: decoys could be tags the owner had fired (section 4) |
| 38 | Level 4: 1 true sting of 4, pick the roast of 6 presets, bestie opt-in only | met | fixed: "other" stings could be the owner's own fired tags |
| 39 | Friend results: x/6 line, three zones, bands, biggest miss, friend view, comparison, ranking | partial | copy and rules are in friend.json; no code scores a friend's guesses into these screens |
| 40 | About 42 tags in clean opposite pairs with every field | met | 50 tags, 25 pairs, calls, never, triggers, locked18, friendGame |
| 41 | Meme names; no diagnosis or moral grade | met | diagnosis words appear only in `never` fields |
| 42 | No tag duplicates a half-name | met | e.g. Family CEO (half) vs Family's backup battery (tag) |
| 43 | Rebuilt triggers for cut or reframed questions | met | fixed: T15 chapter and stale triggers, T10 now cites C5-10 |
| 44 | Stings owner only; share card is names and hearts | met | result.json `ownerOnly`, `share` |
| 45 | Private tags opt-in (marriage and kids default off, love by relationship) | met | friend.json toggles; decks checked |
| 46 | Want vs have-to (circumstance options, logged, never scored) | met | 18 chapter cards carry one, including Q17/Q19 (C5-2, C5-6) |
| 47 | Premise check ("Not my life") | met | every card |
| 48 | Research record kept apart | met | profile.json `research` (circumstance, depends with flip, feelings, emotions) |
| 49 | Pre-launch: R2 split check | partial | design fix plus sim pole share 51%; real data pending |
| 50 | Pre-launch: type distribution | partial | sim only (64 of 64 types, max pole 53%); the 30 to 50 person trial is pending |
| 51 | Pre-launch: most get 3 to 5 tags, none 0, none over 10 | met | sim: 99.4% of consistent players in 3 to 5 |
| 52 | Pre-launch: sting test (called it / too harsh / nothing) | partial | added to PROMPT.md page 10 and the report; results come from blind test 2 |
| 53 | Pre-launch: friend game difficulty (friends guess about half) | **missing** | not simulated |
| 54 | Pre-launch: legal check of names and copy (MBTI) | **missing** | outside the kit |

## 3. Repeats a player would call "the same"

**Strong: likely to be called out**
1. **C2-3 vs C7-10.** Someone who wronged the group apologized and wants back in: a rumor-starter in the group chat, then a rage-quitter in the squad. The answer sets mirror each other (let them in / let them in but keep score / refuse / stall), and both measure T08. Chapters 2 and 7.
2. **C2-1 vs C2-8, plus C2-10 and C3-12.** "Your friend's thing isn't good: honest or hype?" A song, a haircut, then a crush's lock screen (finale) and the bear story. The options line up one to one: "The chorus needs work" / "Critic: Not your best"; "This is a hit" / "Hype machine: ICONIC"; "They seem sweet! You look so happy". C2-1 and C2-8 open and close chapter 2. This comes from R2's sources (Q37 and Q30 reframed), but it shows.
3. **C5-2 vs C5-6.** Safe paycheck vs the thing you love, twice in chapter 5 (Sally Q17 and Q19, both L1): "Smaller paycheck, happier Mondays" vs "Go all in on my thing".

**Medium: same shape, different costume**
4. **C6-4 vs C6-8.** A family member needs carrying, same chapter, 4 cards apart. "Say 'I've got it'" and "Safety net. I cover them"; "Start a shift calendar" and "Deadline. 'Last time' comes with an actual date."
5. **C2-7, C5-5, C2-11 (finale).** Stay all in, or cap it and offer later: "Sleep is canceled" / "Said 'ten minutes.' Left three hours later." / "Stay till the last box"; and "tomorrow?" / "Offered the morning" / "Come for an hour, then head back to bed."
6. **Chapter 4 spend-or-save.** "Buy it now" comes up four times: C4-1 "Concert tickets. Tonight", C4-5 "Bought it on the spot", C4-3 "Buy them", C4-10 finale "Pull. All of it. Tonight." C4-5 (one more of something you own) and C4-3 (sneakers you love cost $80 more) are 3 cards apart. This is close to Jerry's test 1 complaint about money cards.
7. **C1-2 vs C1-5.** Share your private data with your people (passcodes, then live location), 3 cards apart in chapter 1.

**Light**
8. "A rule is a rule" in four places: C6-10 "Rule's a rule", C7-1 "Pull up the official rules", C7-7 "That was the deal", C7-S1 "The brief is the brief".
9. Feeling cards C5-8 "A tiny sting. Why not me yet?" and C6-5 "A tiny voice asking, 'Why is it always me?'"
10. Group-project costume three times: C5-5, C5-10, C7-S1.

**Ladder answers left** (same action at two intensities, or the same action plus an extra):
- C1-5: "Always. Come find me." / "Always, plus alerts for when each of them gets home."
- C5-4: "Yes. Already practicing the new title" / "Say yes. Complain about it all year." (plus the circumstance "Yes. Saying no isn't really my call"). Three yeses.
- C2-9: "Send it tonight" / "'You're a disaster.' Then send it anyway." / "Send part of it as a gift."
- C4-7: "Four equal piles" / "Equal piles, then I slip Kai $20 of mine."

Borderline, but each reads as a different motive: C4-5 "Bought it on the spot" / "Bought it, then hid the bag"; C2-7 "Sit straight up and call" / "Call, put them on speaker, 'mhm'"; C7-1's three ways to let the stack count; C7-S1's two ways to make the slides.

No two cards share a prompt or option text; checked by word overlap across all 82 cards.

## 4. What I fixed

Fixes were made in the sources (`../chapters/ch1.final.json`, `../chapters/ch7.final.json`, `../library/tags.json`), and `node assemble.mjs` rebuilt `cards.json` and `library.json`. Before any edit I confirmed that assemble reproduces the shipped kit byte for byte.

1. **C7-3 friend prompt**: "{name} is offered a year in a city {they}'ve never been to" rendered as "she've" and "he've". It now reads "a year in a brand-new city".
2. **C1-4 friend side b**: "their closest person" is now "{their} closest person", so it no longer reads wrong for she and he.
3. **C1-8 friend side b**: "Their own version" is now "{Their} own version".
4. **C1-2 friend side b**: "Keeps theirs" is now "Keeps {their} own".
5. **Level 3 decoys** (score.mjs): decoys could be tags the owner had fired but not shown. Riley's deck offered "Knows when to log off", one of her own fired tags, as a decoy, so a friend who guessed right got no credit. Decoys now come from pairs with no fired tag first (Sally: never a pair already hit). If those run out, a fired pair shows only the side the owner did not fire.
6. **Level 4 sting pick** (score.mjs): the 3 "other" lines could be the owner's own fired tags. Jordan's deck included "You know everyone. Fewer people really know you." (T04B, fired for him), so two of the four lines were true. The other lines are now never the owner's fired tags.
7. **Pick the roast** (score.mjs): a roast for a fired-but-not-shown tag was flagged `ownersTag: false`. It is now flagged "fired, not shown".
8. **T15 chapter**: T15 was set to chapter 5, but all its cards are in chapter 4 (C4-2, C4-7), which skewed the 3-chapter spread. It is now chapter 4, and the cut chapter 5 trigger is marked cut.
9. **T10 triggers**: now cite C5-10, the only non-chapter-3 card that carries T10. The cut chapter 2 trigger is marked cut.
10. **C7-6 option 2**, "Texted around until a group plan happened.", scored nothing on a real card. It now carries T04B at strength 1 (Mayor of every group chat), which follows from the behavior. The neighbours (C7-1, C7-5) don't touch T04.
11. **PROMPT.md**: the feedback page and report now rate every sting line "Called it" / "Too harsh" / "Nothing" (Sally's pre-launch sting test).

I also updated the matching notes in friend.json (level 2 card notes, level 3 and level 4 deck rules) and in README.md.

**Reruns.** `node --test tests.mjs`: 20 of 20 pass. `node sim.mjs`: every target passes. Consistent players get 4.89 tags, 99.4% of them 3 to 5, and 86.3% of shown tags match the hidden profile. Random clickers get 0.53 strong tags. Sealed calls are 61.2% exact, and no pole goes above 53.1%. SIM-REPORT.md and sim-example/ were regenerated. All three players were replayed on the rebuilt kit: same types and tags, and no decoy or other sting line is an owner's fired tag.

## 5. Still open (not data-level, for the owner to decide)

1. **20 of 50 tags can never fire (blocker).** With tagFire 2.25, these tags can't reach the fire threshold even when every trigger option is picked calmly: T01A, T01B, T02A, T03B, T05A, T05B, T08A, T11A, T11B, T12A, T12B, T15A, T15B, T16A, T16B, T18B, T21A, T21B, T22A, T22B (18 in the teen run). Most pairs have only two scenario or quick-pick triggers (2 × 0.55 × 2 = 2.2). In 1000 consistent synthetic players, 19 tags were never shown and 5 more were shown under 2% of the time (T04A, T04B, T24A, T24B, T16A). Chapter 1 contributes almost nothing to results, and "Here, scroll my phone" / "My passcode, my dignity" (Sally's pair 2) never show. The simulator misses this because it scores match rate, not coverage. Lowering tagFire alone doesn't fix it: at 1.5, 11 tags still never show, because ranking by raw net always favours pairs with more cards.
   - I prototyped one fix in a scratch copy, not shipped: fire at `min(tagFire, 0.8 × what this player's answered cards could give the tag)` and rank by that share. Result: 0 tags never shown, all targets pass, and tag match rises to 89%. Trade-off: it demoted strong, well-evidenced tags. Jordan lost 3 of his 5 strong tags; Riley lost both of hers.
   - Better: keep strong tags first by net, fill the remaining slots by relative share, and add a third trigger to thin pairs. The missing golden cards ("'Read' and no reply" for T02, "1am, one more match?" for T05/T06) are natural candidates. Re-simulate after either change.
2. **Repeats** 1 to 3 in section 3 (C2-3/C7-10, the four "your friend's thing" cards, C5-2/C5-6). Cutting C7-10 would leave T08A with one card, so it needs a rewrite or a new second trigger, not just a cut.
3. **Ladder answers** in C1-5, C5-4, C2-9, C4-7.
4. **Plot twist selection** puts real-card splits first, even across unrelated situations joined only by a tag pair (Jasmine). Consider axis splits first, or require both cards to share a Sally question or chapter.
5. **Result-page contradictions** between half-name lines and tags: Chill Personified's "never blow the budget" next to "Yes first, bank app later"; Color-Coded Overachiever's "keep not pressing start" for a player who pressed start. Also "Modern for you, classic for me" (T20A) fires on plain classic answers.
6. **8 options still carry no evidence** (row 7).
7. **Run length** is 70 cards with the finale (brief: 56 to 64). The flow judge's next cuts were C3-6 and C6-5 (feeling cards).
8. **Friend game scoring code**: decks build, but no code turns a friend's guesses into the results screens (x/6, zones, biggest miss, ranking). Friend difficulty ("about half guessed") has not been simulated.
9. **Level 1 for a coworker** still asks "In love and with family, {name} is more…".
10. **T22B's call** "Your favorite place starts making your order when you walk in" repeats the C7-S2 finale prompt. T22 can't fire today, so this only matters once item 1 is fixed.
11. **Real-data pre-launch checks** (R2 split, type spread over 30 to 50 people, sting offence rate, legal check of names) remain for after blind test 2.
