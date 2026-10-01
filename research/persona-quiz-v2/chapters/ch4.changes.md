# Chapter 4 (Money and treats): changes from ch4.json to ch4.final.json

Rewriter pass, 2026-09-26. Inputs: ch4.json plus all eight judge files. Rule of thumb applied: the evidence auditor decides rules, Theo plus the audience majority (Jasmine, Jordan, Riley, Mika, Wei) decide fun, the flow judge decides order and repeats.

## Summary

- Cards in: 11 (9 chapter, 2 sealed). Cards out: 8 (7 chapter cards in the flow judge's order, plus sealed C4-10, which runs in the finale).
- Cut: C4-6, C4-9, C4-11 (3). New cards: none. Coverage check after cuts: every tag pair this chapter owns still has at least 2 cards across the run (T12: C2-9, C3-3, C4-7; T13: C4-1, C4-8, C5-6; T14: C4-3, C4-5, C4-8, C7-2; T15: C4-2, C4-7; T23: C4-4 plus three in ch7; T24: C4-8 plus three in ch7; L1: C4-1, C4-8 plus ch5 and ch7), so no replacement was needed.
- Order (flow judge): C4-1 scenario > C4-5 real > C4-2 / C4-4 / C4-3 this-or-that round > C4-7 scenario > C4-8 pick two. Checked by node: no two same types in a row outside the round, no neighbors sharing an axis or tag pair, the real card sits at slot 2.
- Sealed C4-10 stays in this file so its id resolves, and sits last. It runs in the finale (slot 2 in the flow judge's finale order). Engine convention: `type: sealed` means finale, never in-chapter.
- Intro: "Money talk. I won't open your bank app, promise." became "Money talk. No judgment. Okay, a little judgment." because "bank app" now lives in the C4-8 prompt (and was also in cut C4-6), which would be three uses in one chapter.
- No em or en dashes. Every option at 12 words or fewer. All tag ids exist in library/tags.json.

## Per card

### C4-1 ($200 in a jacket, golden, chapter opener)
- Option 3 "Dinner for my people": axes R1 +1 removed, T06A s1 kept. Asked by: evidence (treating friends is generosity, not R1).
- "Straight into savings. Future me says thanks." kept here. Jordan and Riley asked to keep it here and change the ch5 copies (C5-S1, C5-6); Theo wanted it rewritten. Audience majority wins on fun; the ch5 rewriter must drop its copy so the line appears once in the run (flow).
- Not applied: Jasmine's fifth option "The skin I've wishlisted since March. Finally." (T14A). The flow order puts C4-5 (T14) right after this card, so a T14 option here would break the no-shared-neighbor rule. Wei's "my mom would save it for me" was a comment, not a fix.

### C4-5 (the thing you already own plenty of, real, Sally Q36)
- Moved to slot 2. Asked by: flow (real cards early, and 3 cards away from C4-3).
- "sneakers" dropped from the list so it stops echoing C4-3. Asked by: flow, Jordan. List is now "Tote bags, figures, skins, mugs" (not "hoodies", which C7-2 already uses).
- Stem varied from "Think of the last time..." to "Confession time. The last time...". Asked by: flow (every real card opens the same way). "Be honest" was avoided because ch1 and ch3 use it.
- "Left it in my cart until the feeling passed." became "Left it in my cart for a week. The feeling passed." (more concrete). Theo's "Checked on it like a pet" not used: "like a pet" already appears in ch3 and ch7.
- Friend version: "plenty of sneakers" became "plenty of tote bags". Asked by: Jordan (so Level 2 does not echo C4-3).
- Evidence unchanged (evidence: keep).

### C4-2 (friend's parents paid the down payment, Sally Q13)
- Kept over C5-3, which is cut in ch5. Asked by: evidence, flow, Jasmine, Jordan, Theo.
- Option B "True. And the head start did a lot of lifting." became "Must be nice. Somebody had to say it." (moved from cut C5-3). Asked by: Jordan, Theo.
- Option A "Fair. They did work hard, and it shows." became "'You earned it!' I say, and mean it." Asked by: Theo (A read as the diplomatic party answer).
- Prompt punched up: "Housewarming tour. Your friend pats the kitchen island: 'I worked so hard for this.'" Emotions added (warmth, irritation). Teen prompt unchanged (Riley: keep).
- Not applied: Mika's rent reframe ("adulting is so hard"). It changes Sally's question from crediting success to judging a complaint, and Wei, Riley, Jordan, Jasmine all recognized the housewarming.
- Tags unchanged: T15A s2 / T15B s2. Friend version updated to the new lines.

### C4-4 (the plant for the shelter, Sally Q35 reframed)
- Price gap raised: $10 versus $13 became $10 versus $25, so both sides are an honest choice. Asked by: evidence (rules lead), Theo ($26), with Jasmine, Jordan, Riley, Mika and Wei all flagging the $3 gap as a cool-answer trap.
- Option A became "The neighbor's. My plant has a backstory now." (Jordan's line, moved to the plant). Option B became "The $10 one. The plant can't tell the difference." Asked by: Wei, evidence ("doesn't know the difference").
- Tags kept per evidence: T23A s2, T23B s1 (B stays slight because cheap is not always self-first; Mika's concern).
- Not applied: Riley's cut (the chapter needs Sally Q35, and T23 needs the card), Mika's beach cleanup versus pottery (that is Q47 free time, which ch7 already covers), Jasmine's shampoo refill and Jordan's phone case (the plant keeps the majority of evidence plus Theo plus Wei).
- feel changed from recognition to tension.

### C4-3 (sneakers you love, $80 more, Sally Q34)
- Seated 3 cards after C4-5, last in the this-or-that round. Asked by: flow.
- "That $80 already has plans." removed; that joke now lives only in C4-10. Asked by: evidence, flow, Jasmine, Jordan, Riley, Mika, Wei, Theo.
- Option B became "The other pair. Nobody looks at my feet anyway." Asked by: Jasmine, Wei, Theo, Riley (same line in four wordings).
- Option A became "Buy them. I've already worn them in my head." and the prompt adds "You've watched 11 unboxing videos of it." Asked by: Theo.
- Kept as sneakers, not backpacks (Jordan) or a game outfit (Mika): the flow judge's fix (drop sneakers from C4-5 instead) removes the echo, and Sally Q34 is about a paid-for item in budget. Mika's broke-player case is covered by the engine's "Not my life" exit and "both in budget".
- Tags unchanged: T14A s2 / T14B s2.

### C4-7 (pop-up profit split, Sally Q16)
- Option 5 "Skip the split. Team dinner, all of it.": axes R1 +1 removed, no tags. Asked by: evidence.
- Prompt names the product: "Kai's glitter phone charms sold most of it." Asked by: Theo (the joke lives in the product). Name changed from Theo's "Sam" to "Kai" because ch1 already has a Sam.
- teenPrompt added: bake sale table, $120, "Kai's brownies". Asked by: Riley.
- Option 1 became "Bigger cut for Kai. Talent gets paid." Asked by: Jordan.
- Option 2 became "Four equal piles. Kai gets bragging rights." Asked by: Theo.
- Option 3 (the quiet tip, which Theo called the generous cool answer) became "Equal piles, then I slip Kai $20 of mine. Shh." so it roasts the move.
- Option 4 became "Put it to a vote. Majority wins, even if I sulk." Asked by: Riley and Jasmine (the vote line was filler). Jasmine's "lobby everyone in DMs first" not used: lobbying changes the behavior from following a fair process to working it, and L3 +1 must follow the behavior.
- Not applied: Mika's credit-not-money rewrite (plaque). With C4-9 and C4-11 cut, this is the chapter's only split card, and Sally Q16 is a money split.
- Tags unchanged: T15A s2 / T15B s1 + T12B s1 / T15A s1 / L3 +1. Friend version updated.

### C4-8 (pick two, money meme list)
- Prompt "Pick the two that are the most you." (word for word C7-9) became "If your bank app could talk, which two would it bring up first?" Asked by: evidence, Riley, Mika, flow. Evidence and Mika proposed "roast"; not used because the flow judge's suggested C7-9 prompt also uses "roast".
- "I could tell you my balance right now." (T24A) became "I could tell you what I spent on boba last month." Asked by: Mika (knowing your balance is what broke people do because they have to; the new line is a tracking habit). "snacks" was avoided because four other chapters use it.
- Kept "I've bragged about a dupe for a full week." and "My fun money is gone by the 10th. Somehow." Mika wanted them changed; Jasmine, Jordan, Theo, Wei and Riley named them the best lines in the chapter. Fun majority wins; evidence called the mapping clean.
- Tags unchanged.

### C4-10 (limited banner, golden, sealed)
- Text and tags unchanged. Asked by: evidence (keep), Theo, Riley ("do not touch"), Jasmine, Wei.
- Moves to the finale (flow). Jasmine asked to make it the chapter opener instead; the flow judge's finale needs it as the L1 and T13/T14/T24 check, and a sealed card cannot also be a chapter card.
- Not applied: Mika's retag of "Skip it. That $30 already has a job." from T24A to T13B. Evidence kept T24A, and the finale uses this card as a T24 check.
- Held for a decision (format change, not a card fix): Jordan's non-gamer costume, "Your favorite brand drops a limited collab tonight. 48 hours only. You have $30 of fun money this month." The card format has no field for it (only `teenPrompt`). If the engine adds a `nonGamerPrompt`, the options map one to one: "Buy it. Tonight." / "Wait. It'll restock." / "Skip it. That $30 already has a job." / "Watch a friend's unboxing and live through them."

### Cut
- C4-6 (feeling card after C4-5). Asked by: flow (weakest of seven identical "What showed up first?" stems; run length). All five audience judges kept it and liked "Worry. I opened the bank app."; the flow judge owns fatigue and repeats. C4-5 still carries per-option emotions.
- C4-9 (group dinner bill roles). Asked by: flow (third split-the-bill card, repeats C3-3 and C4-11). The audience majority wanted to keep it for the roles, but Jasmine, Mika, Theo and Wei also named it a repeat split card. T12 keeps C2-9, C3-3 and C4-7. Lines worth reusing elsewhere if a money role card is ever needed: Wei's "Bill ninja. 'Bathroom break.' Already paid at the counter." and Theo's "Bathroom break. Perfect timing, every single time."
- C4-11 (cabin split, broke friend, sealed). Asked by: flow, Jasmine, Jordan, Mika, Wei, Theo (repeats C4-9 and C3-3, and "Fair is fair" copied C3-3). The finale's T12 check is not needed: the flow judge's finale does not include one.

## Notes for other rewriters
- ch5: drop "Future me says thanks" from C5-S1 and "future me" from C5-6 (kept only in C4-1). C5-3 is cut; its line "Must be nice" now lives in C4-2.
- ch2: C2-9's circumstance line "That money already has a job" must change; the phrase lives only in C4-10.
- ch7: C7-9's prompt must change (C4-8 no longer shares it); avoid "bank app".

## Fix pass 2026-09-26

- **Run order.** The chapter now has an `order` key: C4-1, C4-5, C4-8, C4-4, C4-2, C4-3, C4-7. C4-8 now carries T15, like C4-2 and C4-7, so it can no longer sit next to either of them. This is the only order that keeps C4-1 as opener and C4-5 (real) at slot 2, keeps the this-or-that round in one piece and away from chapter 5's round, and breaks no neighbour rule. It also moves C4-3 four cards away from C4-5 (the two buy-more cards), which the flow judge wanted. The C3-4 to C4-1 and C4-7 to C5-1 borders are clean.
- **C4-7 (scenario, Q16): ladder and missing evidence fixed.** Open items 3 and 6, and open item 1 for T12B and T15B. "Equal piles, then I slip Kai $20 of mine. Shh." was a rung of "Four equal piles", so it became a different behavior: "Give the biggest pile to whoever's broke this week." (T12B s2). That is the split-by-need rule the T12B trigger describes, and it is the player's rule about someone else's need, not their own money pressure. "Four equal piles. Kai gets bragging rights." goes from T15B s1 to s2 (equal shares for equal hours is the Q16 answer for T15B) and keeps T12B s1. The friend field b side matches. "Skip the split. Team dinner, all of it." (C4-7.4, no evidence) is now T12B s1: pooling the money so nobody counts shares, the same reading the evidence auditor accepted for C3-3's shared pot. The five options are now merit, equal, need, vote and pool.
- **C4-2 (this_or_that, Q13): both sides s2 to s3.** Open item 1 (T15A, T15B). This is the one card that asks Sally Q13 head on, and each option is that tag's defining behavior. There is precedent: C6-3 carries s3 on a this_or_that. The friend field matches.
- **C4-8 (pick_two): T14 lines swapped for T15, new prompt.** Open item 1 (T15 needed a third card, and chapter 4 has no other place for it). "I own the fancy version of one boring thing." (T14A) became "Hustle stories get me off the couch. Every single time." (T15A s1: effort pays). "I've bragged about a dupe for a full week." (T14B) became "Someone's big win? My first question: 'Who do they know?'" (T15B s1: spots the head start, with no bitterness). T14 keeps three strong cards (C4-5, C4-3, C7-2), so its maximum drops from 3.85 to 3.40, still well above the firing line. Dropping the dupe line also answers Mika's flag that buying dupes read as a trait. The T13, L1 and T24 lines are unchanged. The prompt "If your bank app could talk..." no longer fit the new lines, so it is now "Money memes that might be about you. Which two are painfully accurate?" This does not echo C7-9's roast prompt or C3-4's "Pick the two lines most like you." Options 0 and 1 are unchanged, so the circumstance test fixture ("C4-8": [0, 1], L1) still holds.

Maximum support after the pass (check-src): T15A 2.00 to 2.90, T15B 1.45 to 2.90 (C4-2, C4-7, C4-8, all teen-visible). T12B reaches 2.65 with C4-7 at 1.10. T13 is unchanged at 2.65, T24A at 2.90 and T24B at 2.45.

## Fix pass round 2

- **C4-7 (scenario, Q16): rewritten so it is no longer a money split (flow high #3, test-1 repeat).** C3-3's equal versus proportional split stays in chapter 3; C4-7 no longer splits anything. New situation: you pick the fundraiser MVP, and $100 (teen: a $50 gift card) comes with it. Kai raised the most with one post to 40k followers (teen 4k); Remy raised almost as much, door to door. Options: "Kai. Most raised wins. Those followers didn't build themselves." (T15A s2), "Remy. Kai posted once. The followers did the rest." (T15B s2: spots the head start), "Whoever's broke this month gets it. Kai will survive." (T12B s2: award by need, with the writing judge's small edge), "Put it to a vote. Majority wins, even if I sulk." (L3 +1, kept). The equal-piles, biggest-pile and team-dinner lines are gone, so no option maps to a C3-3 option. The friend field is rewritten to match (a T15A s2, b T15B s2). The new name Remy avoids C1-1's "Sam".
- **C4-3 option 1 (flow high #4):** "The other pair. Nobody looks at my feet anyway." became "The other pair. The 11 videos were the fun part." That removes the second "nobody can tell the difference" joke next to C4-4's plant. It is still T14B s2. The flow judge's "That $80 is a concert ticket" was not used because C4-1 opens the chapter with concert tickets.
- **C4-8 (flow medium, writing):** the head-start hot take "Someone's big win? My first question: 'Who do they know?'" is gone, so C4-2's "Must be nice" is not asked twice in three cards. In its place: "Everything under $20 counts as basically free." (T24B s1: eyeballs money). "Hustle stories get me off the couch" became the writing judge's "I've watched a 'broke to six figures' video. Twice. Took notes." (T15A s1, same behavior, fits the money-memes prompt). Options 0 and 1 are unchanged, so the tests.mjs fixture still holds.
- **C4-5 (flow medium, circumstance fatigue):** dropped option 4 "Money said no, so that was that." Next to C4-1's golden "It went to a bill", a tight-money player would have tapped the same answer twice in a row.

Maximum support (check-src, adult and teen): T12B 2.65 (C4-7 1.10); T15A 2.90; T15B 2.90 to 2.45 (C4-2 plus C4-7, as the flow judge accepted); T24B 2.45 to 2.90; T13 and T14 unchanged.
