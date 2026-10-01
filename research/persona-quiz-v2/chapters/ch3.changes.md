# Chapter 3 rewrite: what changed and who asked

Input: `ch3.json` (11 cards) and all eight judge files. Output: `ch3.final.json` (11 cards in the file: 10 in the adult run, 8 in the teen run, 1 moved to the finale; 1 cut, 1 added).

Rule for conflicts: evidence auditor wins on rules, Theo plus the audience majority win on fun, flow wins on order and repeats.

## Run order

| Run | Order | Types |
|---|---|---|
| Adult (18+) | C3-1, C3-2, C3-8, C3-3, C3-5, C3-6, C3-7, C3-12, C3-9, C3-4 | scenario, real, pick_two, scenario, real, feeling, scenario, real, scenario, pick_two |
| Adult, C3-9 gated out | same minus C3-9 | ends real, pick_two |
| Teen | C3-1, C3-2, C3-3, C3-5, C3-6, C3-7, C3-12, C3-4 | scenario, real, scenario, real, feeling, scenario, real, pick_two |
| Finale | C3-10 | sealed (R1 check) |

This keeps the flow judge's fixed points: C3-1 opens, C3-8 at slot 3, C3-9 split from C3-8, C3-2 and C3-4 far apart, C3-6 right after C3-5. It changes the flow order in one way, because the chapter gained C3-12: the chapter now closes on C3-4 (pick_two) instead of C3-7 (scenario). That also fixes the ch3 to ch4 border the flow judge flagged (C3-7 scenario next to C4-1 scenario); the flow judge found no fix with the old card set. Checked by node: no two same types in a row, no neighbours sharing an axis or tag pair, in all three runs; C3-6 directly follows C3-5; C3-8 precedes its gated C3-9; no locked18 card in the teen run. The chapter border with C2-4 (pick_two) holds too.

`order`, `teenOrder` and `finale` are new top-level keys in the file; the card format is unchanged.

## Per card

**C3-1 (opener, scenario, R3)**
- "Be my person?" replaced: nobody says it (Jasmine, Riley, Theo) and they asked you, so asking back is awkward (Jordan). Now `'Obviously. We're official. I'm changing my bio.'` R3 +1 (Jordan, Riley).
- "Why name it? We're just us." read as the cool answer (Jordan). Now `'Do we need a label? I like what this is.'` R3 -2 (Jordan).
- "Make it official, then invent our own rules" was abstract (Jordan, Wei, Theo). Now `'Official, sure. But no anniversaries and no couple pics.'` R3 -1 (Jordan's line; concrete where Theo's "Rule one: naps" was a joke without a behavior).
- Family intro was a ladder rung above option 1 and answered a yes/no nobody asked (evidence, Riley, Wei). Now `Skip the talk. Book the meet-my-family dinner for Sunday.` R3 +2: the evidence auditor's fix, with Mika's "Sunday" dinner for charm.
- Prompt opens "Think back, or ahead." so partnered players answer instead of tapping Not my life (Jasmine).
- Friend options updated to match.

**C3-2 (real, R1/T09): kept**
- "Introduced them around, then went off with my own friends" became `Introduced them to everyone. Then abandoned them by the chips.` (Theo, optional fun). Same R1 -1, T09B s1.
- Opener varied to "Remember the last party...?" (flow: all real cards opened "Think of the last").

**C3-3 (scenario, Q14, T12)**
- "Fair is fair" removed everywhere (flow, Jordan, Riley, Wei; it repeated C4-11). Now `50/50. I'll just buy the cheaper version of everything.` T12A s2 (Theo's cheaper-olive-oil joke, widened so it works for the teen prompt too).
- "Keep it separate" felt like 50/50 again (Jasmine) and cannot work for rent (Jordan). Now `Payment request for every single thing. Itemized.` T12A s1 (Jordan).
- "One shared pot, nobody keeps score" was the romantic cool answer (Theo). Now `One shared pot. Neither of us checks the balance.` T12B s1 (still pooling, which the evidence auditor accepted as T12B; now a light roast, not a halo).
- By-income line tightened to "so it pinches us the same" (Theo). Circumstance line kept (Mika).
- teenPrompt now has bubble tea (Riley).
- Friend option a no longer says "Fair is fair".
- The split-the-money repeats live in ch4 (flow cuts C4-9 and C4-11); this card stays the only couple version (Mika, Wei).

**C3-8 (pick_two, Q10, locked18)**
- `I want this someday. My own.` became `I want one. My parents would be unbearable grandparents.` T11A s1 (Wei: the first thought for many is the parents; also breaks the want / names ladder Wei flagged without dropping the library trigger line "I already have names picked out").
- `Someday, but only once my life feels steady.` became `Someday. After I can keep a plant alive.` T11A s1 (Theo, optional fun).
- T11B still has only this card in chapter 3; its second card is the evidence auditor's C6-9 fix (add T11B s1 to C6-9's "No"). Chapter 6 must apply it or T11B can never fire.

**C3-5 (real, Q08, T10)**
- `Ended it kindly. Some things just don't fit.` became `Ended it with a kind text I rewrote eleven times.` T10B s2 (Theo: the mature caption answer; the real version is messier).
- `Changed my own habits to meet them halfway.` was saintly (Jasmine, Riley, Wei). Now `Started doing their dishes too, and mentioned it. Often.` T10A s1 (Wei's line; Jasmine's and Riley's "keeping score" versions were not used because C3-6 already says "keeping quiet score").
- Mika's retag of the joke option (T10A to none or R2 -1) not applied: the evidence auditor passed the card as clean, and the player stays and nudges, which is repair.
- Coverage warning: T10 has only this card in the run. The evidence auditor gives T10 its second card by replacing C5-3 with a group-project card; the flow judge gives C5-3's slot to a new L3 card. Chapter 5 needs both, or T10 can never fire.

**C3-6 (feeling): kept**
- Stem changed from "What showed up first?" to `Back then, under all that, the feeling was...` (flow, Riley, Theo: seven identical stems).

**C3-7 (scenario, Q06, intimate, T09)**
- Option 3 loses R3 -1: Q06 is tag-only, and a missing boundary is not classic versus own script (evidence).
- Option 3 text was a counselor line (Jasmine, Riley, Theo). Now `That we never set rules. I can't even be mad properly.` T09B s1 (Jasmine's idea, cut to 11 words; Theo's "what counts as cheating" does not fit the teen best-friend prompt, which shares the options).
- `The hiding. Months of it breaks the deal.` was the answer anyone would give (Jordan). Now `The months. How many times did they look me in the eye?` Jordan also asked to drop T09B from it; not applied, because the library trigger for T09B is exactly "the lying and the broken deal matter most", and the evidence auditor passed the tag.

**C3-12 (new, real, R2)**
- Added on the evidence auditor's rule finding: R2 had only three non-sealed cards, all in chapter 2, so one skip or a chapter-2 fatigue dip leaves the axis unfinished. The auditor's suggested card was the "camping story"; written as a real card (did-grade, 0.80 weight, and a non-scenario so the run order works):
  - Prompt: `Your person has one party story they tell every time. The bear gets bigger each round. Last time they started it, you...`
  - `Told them on the ride home: 'We need to retire the bear.'` R2 +2 / `Heckled it in front of everyone: 'It was a raccoon.'` R2 +1 / `Jumped in and told it with them, only faster.` R2 -1 / `Laughed like it was the first time. Look how happy they are.` R2 -2.
  - Measures one thing (saying the awkward truth to your person versus protecting their moment), as the brief requires for R2. No tags, as the auditor proposed. Friend version included.

**C3-9 (scenario, Q11, locked18, gated)**
- Option 3 retagged from T11A to T16A s1, L2 +1 kept (evidence: taking the job while someone else covers the baby is Sally's Q11B, not T11A).
- Zero fun, read like a form (Jasmine, Mika, Theo). New prompt: `Kids are penciled in for the next two years. There's already a nursery mood board. Then your dream job calls: bigger title, new city, answer by Friday.` (Jasmine's board, Mika's Friday deadline.)
- The cost is now a new city, not more hours, so it stops echoing C5-4 (flow).
- Option 1 `Turn it down. The mood board stays on schedule.` Option 2 `Take it. We push the baby plan back a year.` (Theo's move-the-date idea).
- Option 3 text is Wei's grandparents angle: `Take it. My parents are already packing to be daycare.` (T16A s1 per the evidence rule above; Wei proposed T11A, overruled on rules).
- Depends option now `Depends. Whichever one we'd regret more.` (Jordan), flip kept.
- Flip option "The job means moving cities" (now in the prompt) replaced with `My parents can help with the baby.` (Wei).

**C3-4 (pick_two, Q05, R1/T09): kept, now closes the chapter**
- `I see my own friends without them, a lot.` repeated C3-2's line; now `I have a hobby they've never tried and never will.` (flow's exact fix).
- `My Tuesday nights are mine, and they know it.` sounded like a book club (Riley). Now `Some nights I'm offline, and they know not to ask.`
- `...lunch included.` became `Photos of lunch included.` (Theo, optional).

**C3-10 (sealed, R1/T09): moved to the finale**
- Flow puts it in the finale as the R1 check; mask updated to say so.
- `Already pricing train tickets for every other weekend.` read European (Jordan) and teens cannot buy tickets (Riley). Now `Already set up a nightly FaceTime. Same time, every night.` (Riley), which works at 16 and 32 without a teenPrompt.
- The evidence auditor would drop C3-10 and keep C1-9 as the R1 check; the flow judge cuts C1-9 as a repeat of C1-2 and keeps C3-10. Followed flow (order and repeats are its call).

**C3-11 (sealed, Valentine's): cut**
- Flow: repeats C6-S1 (classic holiday versus our own). The evidence auditor also drops it from the finale. Its R3 +1 option was scored against the behavior (evidence, Jordan, Wei, Jasmine), and Mika flagged the $40 budget as reading broke as a personality. Not replaced: chapter 3 keeps R3 on C3-1, and R3 lives in chapter 6.

## Open items for the orchestrator

1. **Length:** the adult run is 10 cards, one over the 7 to 9 target, because C3-12 was added for R2. The teen run is 8. If the adult total needs trimming, the flow judge named C3-6 (feeling) as the next cut; I left it in because every persona judge kept it and its "keeping quiet score" line is one of the chapter's strongest.
2. **T10** needs chapter 5's group-project card (evidence C5-3 fix) or it can never fire.
3. **T11B** needs chapter 6's C6-9 retag (evidence) or it can never fire.
4. **C4-1** option 3 has R1 +1, which the evidence auditor wants removed; C3-4 (R1) now ends chapter 3 right before C4-1 in the flow order, so that fix also clears the border.

## Verification

Checked with node (`JSON.parse` plus a script): valid JSON; unique C3 ids; valid types, privacy, axes (six ids, signed 1 or 2, at most 2 per option) and tag strengths (1 to 3, at most 3 per option); every tag id exists in `library/tags.json`; no locked18 tag on a non-locked card; circumstance options score nothing; the depends option has a 3-choice flip and no other card has one; no friend field on intimate or locked18 cards; every option is at most 12 words; no gendered pronouns; no em or en dashes; order rules as listed above.

## Fix pass 2026-09-26

Run order is now adult C3-1, C3-2, C3-8, C3-3, C3-5, C3-7, C3-12, C3-9, C3-4 (9 cards, 8 with C3-9 gated out) and teen C3-1, C3-2, C3-3, C3-5, C3-7, C3-12, C3-4 (7). Checked with check-src: no two same types in a row and no neighbours sharing an axis or tag pair in the adult, gated-out or teen run. The C2-8 to C3-1 and C3-4 to C4-1 borders hold. The C3-7 to C4-1 scenario border that flow.json accepted no longer exists, because C3-4 (pick_two) closes the chapter.

- **C3-6 (feeling): cut.** Open item 7 (run length). It is removed from `cards`, `order` and `teenOrder`. With it gone, C3-5 (real, T10) now sits next to C3-7 (scenario, T09), which is a legal pair, so no reorder was needed.
- **C3-12 (real, R2): rewritten.** Open item 2. The bear story read as another "your friend's thing isn't good" card (C2-1, C2-8, C2-10). The new card is about the player being the target: "Your person's last joke about you that landed a little too hard, in front of everyone." The four options are four different moves. "Said it right there: 'Okay, that one actually hurt.'" is R2 +2. "Roasted them right back" is R2 +1, because it is open pushback in the moment but not the hard thing said plainly, the same reading as the old heckle line. "Went quiet until they asked what was wrong" is R2 -1. "Laughed it off. They meant well..." is R2 -2. Option 0 is still +2 and option 3 is still -2, so the flex and split fixtures in tests.mjs still hold. The friend field was rewritten to match. The card is teen-safe and has no tags, so it still gives R2 the real-card evidence its Flex rule needs.
- **C3-8 (pick_two, locked18): T11 strengthened.** Open item 1 (T11A, T11B could not fire). The two plainest lines now carry s2: "I want one..." and "I already have names picked out." (T11A), and the new "Cute. Anyway, my five-year plan has zero car seats." and "Is a dog basically the same thing? Asking for me." (T11B). "Someday. After I can keep a plant alive." stays s1 because it is a maybe-later line. The car-seats line replaces "Cute. Also, I get to hand them back.", which parents-to-be also say, so it could not carry T11B at s2. This is the only locked18 card a no-kids player sees in chapter 3, so s2 is what lets T11B reach 2.25 without C3-9 (C3-8 1.80 plus C6-9 0.45). Option 0 is still T11A and options 3 and 4 still carry no T11A, so the C3-9 gate test is unchanged.
- **C3-9 (scenario, locked18): option 2 rewritten.** "Take it. My parents are already packing to be daycare." became "Take it. Honestly, the mood board was more their dream." It keeps L2 +1 and T16A s1 and adds T11B s1. This is for a mixed C3-8 picker whose kid plan was never really theirs, and it is the third T11B card. The grandparents angle still lives in C3-8 option 0 and in the flip preset "My parents can help with the baby."
- **C3-4 (pick_two): two lines swapped for T12.** Open item 1 (T12A, T12B). "We can do nothing together for hours..." (T09A) became "We take turns paying. I always know whose turn it is." (T12A s1, exact turn-keeping). "A weekend apart feels like a treat..." (T09B) became "Whoever just got paid covers food. That's the whole system." (T12B s1, whoever has more pays; a rule of fairness, not money pressure). Two T09A/R1+ lines and two T09B/R1- lines remain, so R1 and T09 keep their maximum of 0.90 on this card. The friend field is unchanged: its "some nights solo" side still matches a kept line. This is the teen-visible third card for both T12 tags.

Maximum support after the pass (check-src): T11A 2.00 to 2.90 (C3-8, C3-9; only two locked18 cards exist in chapters 3 and 4), T11B 1.35 to 2.80 (C3-8, C3-9, C6-9), T12A 2.20 to 2.65 (C2-9, C3-3, C3-4), T12B 1.65 to 2.65 (C3-3, C3-4, C4-7). T09A and T09B are unchanged at 3.60, and T16A is not lowered.

## Fix pass round 2

Answers judge-flow pacing (four heavy cards in a row), judge-evidence fix 2 (C3-8.3 time-bound), judge-writing "Honestly" on C3-9, and the circumstance-fatigue item. No evidence values changed on scored options; tag maxima unchanged (T11A 2.90, T11B 2.80, T12A/T12B 2.65).

- **Order.** Adult order is now C3-1, C3-2, C3-3, C3-5, C3-7, C3-8, C3-12, C3-9, C3-4, so the toddler pick-two breaks the heavy run (max two heavy in a row). C3-9 still follows C3-8 for its gate. teenOrder is unchanged (C3-1, C3-2, C3-3, C3-5, C3-7, C3-12, C3-4); C3-12 keeps its light examples. check-src: no type or axis/tag-pair neighbour breaks, including the C2-8 and C4-1 borders.
- **C3-8.3.** "my five-year plan has zero car seats" → "Cute. Anyway, my life plan has zero car seats." (a future parent could say the time-bound version; T11B s2 kept).
- **C3-9.** "Take it. Honestly, the mood board was more their dream." → "Take it. The mood board was always more their dream." Circumstance option 4 "Money decides this one. The paycheck wins." cut (flow: money-says-no on nine cards); the Depends option and flip stay. Options 5 → 4; indices 0 to 3 unchanged.
- **C3-3.** Circumstance reworded from "Money's tight right now" to "Whatever I can cover that month. Some months that's not half." so it no longer reads like the other money-says-no answers. Still circumstance.
