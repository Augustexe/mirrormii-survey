# Verification of the blind test 2 kit

Verifier and completeness pass, 2026-09-26, checked against `../BRIEF.md`, Sally's v2 docs (`../../sally-v2-2026-09-26/`) and `../LESSONS-FROM-TEST-1.md`. It was run twice the same day: first on the build output (commit 36cfb0a), then again after the fix pass (commit 425d838) and once more after the release judge's fixes, which changed no result below. Sections 1, 2, 5 and 6 are current. Sections 3 and 4 record the first verify and quote the cards as they were then. Every count here comes from `/private/tmp/claude-501/quiz-v2-tools/doc-numbers.mjs` (`--verify`), which can be rerun after any kit change.

**Bottom line.** The fix-pass kit plays end to end, scores, freezes, checks and builds every friend deck. The three players still get clearly different results that quote their own answers back to them. The first verify's blocker is closed: every tag can now fire on the adult and the teen run (tested), and chapter 1 now feeds a tag for all three players. The plot twist no longer joins unrelated cards, and the result-page contradictions the first verify found are gone. Two new things to watch: one rushed tap now decides Jasmine's relationship half (Flex on R3), and the share ranking puts the same thin tag in slot 4 for both adults.

## 1. Three play-throughs (rerun after the fix pass)

Answer files and every output are in `../verify-plays/<player>/`, outside `final/` so the blind copy stays clean. `node make.mjs --run` there rewrites the answer files, checks every answer against the current cards, then runs `profile`, `freeze` (and a second `freeze`, correctly refused), `check`, and `friend --rel bestie --stings on` for each player. Timings are 2.4 to 14 s per card, with the last two this_or_that taps in the run under 1.5 s to exercise the rushed rule. Partner, crush and friendOrCoworker decks were also built for all three (in a scratch folder, so the bestie decks stay on disk).

| | Jasmine, 27, partnered cozy gamer | Jordan, 25, male trainer, no games | Riley, 16, synthetic teen |
|---|---|---|---|
| Run | adult, 61 cards (C3-9 opened by her C3-8 pick) | adult, 60 cards (C3-9 gated out) | teen, 57 cards, no locked18 cards shown |
| Type | **Human Weighted Blanket × Chill Personified** (We·Soft·Classic \| Steady·Easy·Context) | **Old-School Final Boss × Color-Coded Overachiever** (Me·Direct·Classic \| Steady·Push·Rules) | **Open-Book Golden Retriever × Vibes-Based Wanderer** (We·Soft·Own \| Venture·Easy·Context) |
| Flex / unfinished | Flex on R3 (tie broken by her first R3 card toward Classic) | none | none |
| Tags (strong marked) | Yes first, bank app later (strong); Compliment sandwich chef (strong); Same order, every time (strong); Relationship mechanic; Typos and all, my own words | The honest review nobody asked for (strong); Moves out, still calls on Sundays (strong); Actually read the rulebook (strong); Relationship mechanic; Leaves you on read, still loves you | Bends rules for good reasons (strong); Head over heels, eyes open (strong); Always has a flight tab open (strong); Here, scroll my phone (strong); Still loading, and that's fine |
| Chapters behind the tags | 1, 2, 2, 3, 7 | 1, 2, 3, 6, 7 | 1, 3, 5, 7, 7 |
| Plot twist | T05 split inside chapter 2: "You'd say: 'Make them a playlist with a note on every song.' Last time, you did: 'Went, paid, and ate instant noodles for a week.'" | L1 axis split: "You'd say: 'The brand-new one. Day one, I'm googling everything.' Put on the spot: 'Straight into savings. Future me says thanks.'" | T18 split inside chapter 6: "You'd say: 'Landlord. I help. Rent is my dishes for a week.' Put on the spot: 'Wait to see who steps up, then fill the gaps.'" |
| Sealed finale | 4 of 7 exact (chance 25%), right side 5 of 5, 1 pass (R3 is Flex on the holiday card) | 5 of 7 exact, right side 6 of 6 (C4-10: Not my life) | 7 of 8 exact, right side 6 of 7 |
| Friend deck (bestie, stings on) | L1 6, L2 12, L3 12 (N=5), L4 on | same | same |

**How the results read, as the player.**

- **Specific, not generic.** Every tag still shows "you told Genii" lines in the player's own words, and the new golden real card C1-11 now lands on the page (Jordan's "Leaves you on read, still loves you", Riley's "Here, scroll my phone"). Jordan's three strong tags and type agree; it reads like one person.
- **Clearly different.** No two players share a type. Jasmine and Riley share the We and Soft poles but differ on everything else, and they share no tag. Jasmine and Jordan share the Steady pole, Classic (Flex for Jasmine) and one tag, "Relationship mechanic" (see below). Jordan and Riley share nothing.
- **What felt off.**
  - Jasmine's relationship half flipped from Open-Book Golden Retriever to Human Weighted Blanket with no change in her R3 answers. Her R3 answers are mixed (two classic, two own, one of each on the celebration pick-two). The fix pass reordered chapter 6's quick round, so the harness's rushed tap moved from the classic wedding card (C6-9) to the own-way card (C6-3). That drops her R3 score into the Flex band, and her first R3 card breaks the tie toward Classic. The page shows the Flex badge, so this is the rule working, but a real player could see a half change on one fast tap.
  - "Relationship mechanic" (T10A) shows in slot 4 for both adults with the same two quotes. The share ranking lifts a tag whose two cards the player answered all one way above tags with more support. Both harness players pick the same options on C3-5 and C5-10 (unchanged from the first verify), so this is partly the harness. T10 is one of 9 tags that get their support from only 2 cards.
  - Riley, 16, still gets "Head over heels, eyes open". It is teen-safe (their person is a best friend), but the name reads as romance. Unchanged; not in the fix-pass list.

**What changed versus the first verify.**

- **Answer files.** Answers for the cut cards (C1-3, C3-6, C6-5) are gone, and each player now answers C1-11 (and, for adults, C6-11). Where a rewrite changed what an option index means, the pick was chosen again to fit the player (C2-8 for Jordan, C3-4 for Riley, C3-8, C4-8 and C5-2 for Jasmine, C5-6, C7-9 and C7-10 for Jordan, C7-10 for Riley). Every other answer keeps its index because the option kept its behavior. Jordan no longer uses "Not my life" in the chapters: C7-10 is now an escape room, not a squad game. He still uses it on the C4-10 finale card.
- **First verify's complaints.** Jasmine's plant-versus-hobby twist is gone: that T23 split still exists but no longer qualifies, because its two cards share no Sally question or chapter. Her new twist compares words and deeds for a friend inside one chapter. Chill Personified no longer promises "never blow the budget" next to "Yes first, bank app later". Jordan's life sting no longer says he never presses start. "Modern for you, classic for me" no longer fires for Jordan: plain classic answers now score R3 only.
- **Coverage.** Chapter 1 now feeds a shown tag for all three players (before: Jasmine and Riley). The three pages show 14 different tags, as before, but they now draw from all 50 tags instead of the 30 that could fire.
- **Sealed.** Jordan and Riley are unchanged (5 of 7, 7 of 8). Jasmine is 4 of 7 with one pass instead of 4 of 8, because of the R3 Flex above.
- **Friend game.** Level 3 decoys and the Level 4 "other" sting lines are still never one of the owner's fired tags (0 of 3 players). A friend or coworker deck now uses the `everyday` Level 1 set, so it never asks "In love and with family".

## 2. Requirement checklist

54 requirements from BRIEF.md and Sally's v2 docs: **43 met, 9 partial, 2 missing** after the fix pass (first verify: 40 met, 11 partial, 3 missing). Rows changed by the fix pass say so.

| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | Four layers: type, tags, friend game, research record | met | result.json, friend-deck.json, profile.json `research` |
| 2 | Six axes, sign convention, Sally scoring questions mapped | met | all 45 kept Sally Qs sit on a card (Q03, Q07 dropped per brief; fix pass: Q30 dropped because its card repeated C2-1's pattern) |
| 3 | R2 is directness only; capacity cards feed T06 | met | R2 on C2-1, C2-5, C2-8, C3-12, C7-7 (slight) and the C2-10 finale card; C2-7, C2-2, C5-5 carry T06 only |
| 4 | 64 types from 16 half-names with code, desc, sting, heart, zh | met | 1000 synthetic players hit all 64 types |
| 5 | No MBTI, no "scientifically measured" | met | grep clean |
| 6 | Option evidence fields and limits (at most 2 axes, 3 tags, s 1 to 3) | met | scan of all 81 cards |
| 7 | Every option carries evidence | met | fix pass: every scoring option carries evidence or is marked circumstance or depends (0 left; was 8) |
| 8 | Skip and Not my life on every card, No recent example on real cards | met | `exits` on every card |
| 9 | "Depends" options get a flip with 3 presets | met | C2-3, C3-9, C6-6, C7-3 |
| 10 | Grades and weights (0.80, 0.55, 0.45, 0) | met | cards.json `weights` |
| 11 | `ae` and `mask` on every card | met | scan |
| 12 | All 7 card types, rotated, this_or_that in rounds of up to 3 | met | 22 scenario, 13 real, 12 this_or_that, 7 pick_two, 2 feeling, 5 role, 8 sealed (fix pass: 3 feeling cards cut, C1-11 real and C6-11 role added) |
| 13 | No ladder answers | partial | fix pass rewrote the C1-5, C2-9, C4-7, C5-4 and C7-10 ladders and the judges' round 2 ladders; the release judge is reading the kit now |
| 14 | No visible repetition | partial | fix pass rewrote the section 3 repeats and the judges' round 2 list (chapters/*.changes.md); the release judge is reading the kit now |
| 15 | Multiple choice only, including the friend game | met | why-chips, pick the roast, picked friend label |
| 16 | Masked: no trait, axis, tag or type named | met | spot check of every prompt |
| 17 | Gender neutral, owner pronouns from setting | met | 4 pronoun bugs fixed (section 4) |
| 18 | Teen-safe, locked18 hidden for teens, Q07 dropped, R3 measurable by teens | met | Riley's run: no C3-8, C3-9, C6-9, C6-11; R3 from C3-1, C6-3, C6-1, C6-7 |
| 19 | No health, no politics | met | Q31/Q32 became C7-5 (Sunday planning); Q02/Q38/Q40 became Uno, rules, tickets |
| 20 | Answers action-first, about 12 words or fewer | met | longest option is 13 words |
| 21 | Golden set matched or beaten | partial | fix pass: 5 of 6 golden cards are in the run (C1-11 is the 'Read' card); the "1am, one more match?" card is still out |
| 22 | 7 chapters with title and one-line intro | met | cards.json `chapters` |
| 23 | 56 to 64 cards, about 10 to 12 minutes | partial | fix pass: 61 chapter cards (57 teen) fits 56 to 64, but 69 with the finale (65 teen); ruling keeps C6-11 so T21 can fire |
| 24 | Run order: no same-axis or same-pair neighbours, types rotate, real cards early | met | independent check; 10 of 13 real cards before the two-thirds mark |
| 25 | Finale: 8 sealed, at least one per axis, two common-tag checks | met | C2-10 R2, C4-10 and C7-S2 L1, C6-S1 R3, C5-S1 L2, C7-S1 L3, C3-10 R1; C2-11 and C7-S2 for tags |
| 26 | Result page: type, code, halves, 2 stings, 2 hearts, tags with evidence, 3 calls, share card | met | result.json for all three players |
| 27 | Plot twist reads as "You'd say X. Last time, you did Y." | met | fix pass: a tag-pair split becomes the twist only when its two quoted cards share a Sally question or chapter; Jasmine's old plant-versus-hobby split no longer qualifies |
| 28 | Rushed under 1.5 s at 0.3; exits and circumstance never score | met | profile `research.rushed`, tests |
| 29 | Unfinished axis offers extras; flex tie broken by real cards, then first card | met | 12 extras, score.mjs |
| 30 | Tag firing: 2 cards, 1 calm, net threshold, up to 5, at least 3 chapters | met | all three players show 3 or more chapters |
| 31 | Every tag can actually fire | met | fix pass: tests check every tag reaches tagFire from 2+ run cards on the adult and teen runs; in the sim all 50 fire |
| 32 | Sealed: locked before the finale, sha256, refuse refreeze or tamper, pass on flex | met | second freeze refused for all three |
| 33 | Validation targets (Sally's list, simulated) | met | SIM-REPORT.md, all targets pass after the fixes |
| 34 | Relationship chooser with Sally's rules | met | crush drops C1-2 and love tags unless opted in; friendOrCoworker has no love or couple cards; teen owner never gets marriage and kids tags, even with `--mk on` |
| 35 | Level 1: 6 either-or questions, one per axis, flex accepts either | met | fix pass: a friend or coworker gets the `everyday` Level 1 set (no love or family wording) |
| 36 | Level 2: 12 run cards, backups for skipped, depends, circumstance or Not my life, no locked or intimate | met | Jordan's C7-10 Not my life stayed out; 12 cards in every deck |
| 37 | Level 3: N true, N opposite, 12 - 2N decoys, never a pair already hit | met | fixed: decoys could be tags the owner had fired (section 4) |
| 38 | Level 4: 1 true sting of 4, pick the roast of 6 presets, bestie opt-in only | met | fixed: "other" stings could be the owner's own fired tags; roasts are 6 of 13 presets |
| 39 | Friend results: x/6 line, three zones, bands, biggest miss, friend view, comparison, ranking | partial | copy and rules are in friend.json; no code scores a friend's guesses into these screens |
| 40 | About 42 tags in clean opposite pairs with every field | met | 50 tags, 25 pairs, calls, never, triggers, locked18, friendGame |
| 41 | Meme names; no diagnosis or moral grade | met | diagnosis words appear only in `never` fields |
| 42 | No tag duplicates a half-name | met | e.g. Family CEO (half) vs Family's backup battery (tag) |
| 43 | Rebuilt triggers for cut or reframed questions | partial | T15 and T10 fixed in section 4; after the fix pass the T06B `triggers` prose still describes rewritten options, and T07's `origin` still cites Q30 |
| 44 | Stings owner only; share card is names and hearts | met | result.json `ownerOnly`, `share` |
| 45 | Private tags opt-in (marriage and kids default off, love by relationship) | met | friend.json toggles; decks checked |
| 46 | Want vs have-to (circumstance options, logged, never scored) | met | 15 chapter cards carry one (fix pass dropped several money-says-no lines), including Q17/Q19 (C5-2, C5-6) |
| 47 | Premise check ("Not my life") | met | every card |
| 48 | Research record kept apart | met | profile.json `research` (circumstance, depends with flip, feelings, emotions) |
| 49 | Pre-launch: R2 split check | partial | design fix plus sim pole share 51.4%; real data pending |
| 50 | Pre-launch: type distribution | partial | sim only (max pole 55.5%); the 30 to 50 person trial is pending |
| 51 | Pre-launch: most get 3 to 5 tags, none 0, none over 10 | met | sim: 100% of consistent players in 3 to 5 |
| 52 | Pre-launch: sting test (called it / too harsh / nothing) | partial | added to PROMPT.md page 10 and the report; results come from blind test 2 |
| 53 | Pre-launch: friend game difficulty (friends guess about half) | **missing** | not simulated |
| 54 | Pre-launch: legal check of names and copy (MBTI) | **missing** | outside the kit |

## 3. Repeats a player would call "the same" (first verify)

This is the list as found before the fix pass; the quotes are the old card text. Status now: section 5, items 2 and 3.

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

## 4. What I fixed (first verify)

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

## 5. Open items: status after the fix pass

| # | First verify found | Status now |
|---|---|---|
| 1 | 20 of 50 tags could never fire; chapter 1 fed almost nothing | Closed. Thin pairs got a third card or stronger defining options (C1-11, C4-2, C4-8, C5-2, C5-7, C6-11, C7-3, C7-6 and others), and the scorer ranks strong tags first by net, the rest by coverage share. Tests now check every tag can fire on the adult and the teen run; in the sim all 50 fire. 9 tags still get their support from only 2 cards (T03A, T10A, T10B, T11A, T15B, T18A, T19A, T19B, T20A). |
| 2 | Three strong repeats (C2-3/C7-10, the "your friend's thing" cards, C5-2/C5-6) | Closed in the fix pass: C7-10, C2-8, C2-10, C3-12 and C5-2 were rewritten, then round 2 rewrote C2-10, C4-7, C5-6 and C6-11 after the flow judge found new repeats. The release judge found no repeat blocker. |
| 3 | Ladder answers in C1-5, C5-4, C2-9, C4-7 | Closed: each ladder option became a different move; round 2 also fixed C7-10, C1-5 and C1-11. |
| 4 | Plot twist joined unrelated situations through a tag pair | Closed: `twistPairLink` (a tag-pair twist needs a shared Sally question or chapter). Jasmine's old split is still found but no longer shown. |
| 5 | Result-page contradictions (Chill Personified budget line, Color-Coded Overachiever sting, T20A on plain classic answers) | Closed: library lines rewritten; T20A now comes only from the mixed pattern. |
| 6 | 8 options carried no evidence | Closed: 0 left (tagged, or marked circumstance). |
| 7 | Run length 70 with the finale | Ruled: C1-3, C3-6 and C6-5 cut, C6-11 kept so T21 can fire. Adult 61 chapter cards (69 with the finale), teen 57 (65). The brief asked for 56 to 64; the chapter run fits, the run with the finale does not. |
| 8 | No code scores a friend's guesses; friend difficulty not simulated | Open by decision: after blind test 2. |
| 9 | Level 1 for a coworker asked about love and family | Closed: the `everyday` Level 1 set. |
| 10 | T22B's call repeated the C7-S2 finale prompt | Closed: the call was replaced, and round 2 replaced 77 calls that echoed a card. |
| 11 | Real-data pre-launch checks (R2 split, type spread, sting offence rate, legal check of names) | Open by decision: after blind test 2. |

New since the fix pass (watch items, not blockers): one rushed tap decides Jasmine's relationship half (section 1); the share ranking can show the same thin tag to different players; Riley's "Head over heels, eyes open" reads as romance for a teen; the library's T06B `triggers` prose, T07's `origin` (it still cites Q30) and `tagRules.firing` ("strongest first") are stale text that the scorer does not read.

## 6. Release check

The release judge played the fix-pass kit and ruled **fix then ship**: 2 blockers and 26 polish items. Both blockers were text-only and are fixed with the evidence unchanged: C6-3's prompt had become an ordinary setup after the gender-neutral rewrite and one option named the Classic pole, and C7-4's "asked for an exception" option, scored as the strongest Rules evidence, read as the opposite. 20 polish items were applied (card lines, 9 calls, a heart, a sting, a half sting, two teen flags and a bestie band line in `friend.json`). Skipped on purpose: normalizing quote style (single versus double quotes for speech), the money-with-friends overlap (C2-2, C2-9 and C7-10 all ask you to send money; no fix required, watch Jerry's "felt repeated" picks), and a runner note that Jerry already saw C4-1 and a C5-9 line in test 1 (kept out of the prompt so the runner stays blind; whoever reads `REPORT.md` should not count those two as in-run repeats). After the fixes: tests 27 of 27, every sim target passes, and the three players above get the same results.
