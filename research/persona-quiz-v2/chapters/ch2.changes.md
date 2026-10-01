# Chapter 2 (Friends): rewrite changes

Input: `ch2.json` plus the eight judge files. Output: `ch2.final.json`. No card was judged dead, so no card was cut and none was added. Two sealed cards (C2-10, C2-11) move to the finale per the flow judge. Ids are unchanged.

Rule for conflicts: the evidence auditor wins on scoring and rules; Theo plus the audience majority (Jasmine, Jordan, Riley, Mika, Wei) win on fun.

## Structure

- **Run order (new top-level `order`)**: C2-1, C2-2, C2-3, C2-4, C2-7, C2-5, C2-6, C2-9, C2-8. **Finale (new top-level `finale`)**: C2-10, C2-11. The `cards` array follows that order.
- **Why this is not the flow judge's exact order.** Flow proposed C2-1, C2-2, C2-3, C2-5, C2-6, C2-9, C2-8, C2-7, C2-4. The evidence fix on C2-5 (the "checked on the other person" option now feeds T08B) makes C2-3 and C2-5 share the T08 pair, so they cannot sit together. I searched the orders that keep all of flow's goals: open on the golden song card, no same type or same axis/tag pair side by side, and a non-scenario last card so the ch2-to-ch3 border (C3-1 is a scenario) is not scenario to scenario. The order above passes all of them. It keeps flow's intent: the two real cards sit early (slots 2 and 6), the haircut card (C2-8) sits 8 cards from the song (C2-1), and the three T06 capacity cards (C2-2, C2-7, C2-9) are spread out at slots 2, 5 and 8.
- **Chapter length**: 9 chapter cards plus 2 finale cards (target 7 to 9 per chapter).
- **Real-card openers varied** (flow: all 11 real cards opened with "Think of the last time"): C2-2 now "Your most recent...", C2-5 now "Remember the last time...".
- **Feeling stem varied** (flow, Riley, Theo): C2-6 is now Theo's "Rewind to that moment. First feeling, no editing."

## Per card

**C2-1, song for a contest (scenario, Q37, chapter opener).**
- Replaced "Hum your own version of the chorus back at them." (R2 +1). Evidence: humming is showing, not saying, so it can't score Direct. Jordan, Mika and Theo found it confusing. New line is Theo's: "'Honestly? Enter the other song you played me.'" (R2 +1, T07A s1). It is a plain, direct call, and it's funny.
- "Rave about the verse. Suggest a bigger chorus, super casually." became Riley's "Rave about the verse. Mumble 'maybe a louder chorus?' Change the subject." Riley flagged the old line as the socially correct cool answer. The scoring stays the same (R2 −1, T07B s2).

**C2-2, a friend's plan that costs too much (real, Q28).**
- "Told them it was over my budget. Suggested something cheaper." was the flat, grown-up cool answer (Jordan, Theo, Mika). It became Theo's "Admitted it was over my budget in the chat. Took three drafts.", still T06B s2. Friend option b was updated to match.
- Kept "instant noodles" here. Jasmine, Jordan and Wei all said to keep it here and change the second use in C5-2. Theo and Riley wanted it changed here, but they were the minority. **The ch5 writer owns that change.**
- Mika's concern: saying you're broke shouldn't fire "Limited-edition energy". Not applied at card level. The evidence auditor scored this card 5/5, and the library's Q28 trigger maps budget honesty to T06B. The card already has the circumstance exit "Couldn't go. The money just wasn't there." so a player who is simply broke scores nothing. Mika's library fix (add "Not having the money" to T06B `never`) is a library change, so it is flagged for the library owner. Mask updated to say so.

**C2-3, rumor-spreader wants back in (scenario, Q39).**
- New prompt, merged from Theo, Jordan and Riley: "The person who started a rumor about your friend last year wants back in the group chat. They apologized. Publicly. With a slideshow. They've been decent ever since." Judges said the old one read like a mediation form. The new one keeps Sally's premise: apologized, made it right, has kept changing.
- Replaced the saintly "DM your friend: 'Your call. I'm with you either way.'" (Jasmine, Jordan, Theo) with "DM my friend: 'Say the word and I hit decline.'" (T08B s2).
- Fixed the near-ladder between options 1 and 2 (evidence, Jasmine, Wei). Option 2 is now Wei's "One group hangout first. I'm watching the whole time." (T08A s1). It's a probation move, a different behavior from adding them right away.
- Option 1 punctuation tightened. "Depends" line sharpened to "Depends what the rumor actually was." The flip stays on Sally's three factors.
- Friend option a is now "Adds them back right away." (evidence: the old wording read as the s1 option but carried s2). Friend b matches the new DM line.

**C2-4, friend just got dumped (pick_two).** The judges voted to keep it; these are punch-ups.
- "Say 'you'll be fine' and plan their whole weekend." was flat next to the snacks line (Jasmine, Jordan, Mika). It became Mika's "Block the ex on their phone for them. With permission. Mostly." (T05A s1, still a deed).
- The voice note became Theo's "Send a voice note listing why they're amazing. Numbered." (T05B s1). Friend option b was updated.

**C2-7, 11:48pm, third night (scenario, Q27).**
- Prompt now reads "it's the talking-stage drama again, sorry" (Riley). This makes it clearly drama, not a friend in crisis. It matches Sally's Q27 premise (no urgent danger) and makes "pretend I'm asleep" teen-safe. The friend prompt was updated to match.
- Kept "Start a group call. Tag in a second friend." Riley wanted it cut, but Theo, Jasmine, Jordan, Mika and Wei called it one of the funniest moves.
- The echo flow found between "Can we do this properly tomorrow?" and C5-5 is assigned to C5-5 (flow's fix), so this card is unchanged there.

**C2-5, friend in the wrong (real, Q25, R2 did-grade tie breaker).**
- "Said nothing to them. Checked on the other person." now scores no R2 and carries T08B s1. This is the evidence fix, with Jasmine, Jordan and Wei agreeing: looking after the hurt person is not holding your friend first. It also gives T08B a second card. Text lightly edited to "Said nothing to my friend. Checked on the other person."
- "Laughed along, then felt weird about it all day." now scores no R2 and no tag; guilt is kept (evidence).
- "Told them straight: that was wrong, go fix it." became "Told them straight it was wrong. Left on read for two days." (Theo, Riley). The hero answer now has a cost.
- Cut "Called it out right there, in front of everyone." Riley: it was the same move as the line above at a higher volume, and both were hero answers.
- The remaps left the Soft pole with one weak option, so two soft moves take the freed slots:
  - Wei's "Took them for bubble tea first. Brought it up on the walk back." This is Sally Q25A exactly (hold first, then responsibility) and replaces "Had their back first...". R2 −1, T07B s2, the same strength the rest of the chapter gives "hold now, say it later".
  - Jordan's alternative, as "Made sure my friend was okay. Never mentioned the thing." (R2 −2, no tag). It is the clean Soft pole. Without it the tie-breaker card could reach +2 Direct but only −1 Soft.
- Prompt examples dropped "a leaked screenshot", which cut a repeat of the screenshot motif (flow); C2-3 keeps its screenshots line. Friend option b was updated to the bubble-tea move.

**C2-6, feeling after C2-5.** New stem only (see Structure). Options kept; every judge rated "Guilty. Part of me found it funny." the best line.

**C2-9, laptop loan (scenario, Q15).**
- "Send part of it as a gift. Only what I can lose." moved from T06B to T06A s1 (evidence: this is Sally Q15A, which the library maps to T06A).
- Cut "Skip the loan. Help them hunt down a cheaper one tonight." (Theo: six options was too many, and this was a responsible-adult answer). T05A still has C2-4 and C2-9; T06B still has C2-2 and C2-7 in this chapter, plus C5-5.
- The payback line became "Agree on a payback date first. Set a reminder titled 'OWED'." (T12A s2). This keeps Sally Q15B (settle the date before deciding) and adds Theo's self-own. Theo's exact "Notes app" wording was not used because "Notes app" already appears in ch1 and ch5.
- Circumstance line: "I can't. That money already has a job." repeated the golden banner joke (evidence, flow, Jasmine, Jordan, Riley, Mika, Wei, Theo). It is now Mika's "Can't. Having it isn't the same as having it spare." This wording works for both the $300 and the teen $60 version.
- Added "Losing it would sting." to both prompts. It completes Sally's Q15 premise: you can afford it, but losing it would hurt. The premise now matches the circumstance exit (Mika).
- Friend option b was updated.

**C2-8, the haircut (now a true role card, Q30 reframed).**
- Evidence: two mappings were inverted ("DMs later" scored Direct; "waits till they ask, then honest" scored Soft), and "Nobody asked" rewarded unsolicited looks critique. Now the friend asks: "Be honest. Love it?"
- Mika and evidence: it was a scenario dressed as a role card. It is now five named roles:
  - Critic "Honestly? Not your best. Grow it out." (R2 +2, T07A s2; evidence's line)
  - Stylist "The back works. The front, not yet." (R2 +1, T07A s1; evidence's line)
  - Hype machine "ICONIC." (R2 −2, T07B s1)
  - Diplomat "Okay, but the shoes, though." (R2 −1, T07B s1)
  - Mirror "Do you love it? Then I love it." (R2 −1, T07B s1; Mika, Wei)
- Flow said to drop the "later, in private" move and the "compliment something else" move. The private DM is gone. The shoes line stays: Theo called it the most screenshot-able line in the quiz, and Jordan and Riley agreed, so the fun rule decides it. It no longer echoes C2-1, because C2-1's side-step now delivers the note, while the shoes line never does.
- The prompt was shortened (Theo: overloaded).
- Riley's "It'll grow on me. (Means: it'll grow out.)" was not used, to keep five roles and avoid a third soft dodge.
- The type is now `role`, which also keeps the run order free of two scenarios in a row.

**C2-10, crush red flag (sealed), moved to the finale.**
- Flow: it was the third "your friend shows you something bad" card in the chapter. It now opens the finale as the R2 check.
- Theo's specific flag replaces the abstract one: "still has their ex as their lock screen." Options were reworded to name the lock screen. Scoring unchanged. Jordan's and Mika's full rewrites were not needed once the card left the chapter.

**C2-11, couch move (sealed), moved to the finale.**
- Flow: it was the third rest-versus-show-up card. It is now the T05/T06 common-tag check.
- Added Riley's teenPrompt (help pack for a family move).
- "Send pizza for the helpers and a very warm text." became "Send snacks for the helpers and a very warm text. From bed." This keeps the roast Theo liked, lowers the cost for broke players and teens (Mika, Riley), and removes the pizza repeat with ch3.

## Coverage after the rewrite (non-sealed chapter cards)

- R2: C2-1, C2-5, C2-8.
- T07A/B: C2-1, C2-5, C2-8.
- T06A: C2-2, C2-7, C2-9. T06B: C2-2, C2-7.
- T05A: C2-4, C2-9. T05B: C2-2, C2-4.
- T04: C2-4 (plus ch1).
- T12A: C2-9 (plus ch3, ch4).
- T08A: C2-3. T08B: C2-3, C2-5.

## Open items for other writers (not changed here)

- **T08A has one card in the whole run (C2-3), so it cannot fire yet.** The evidence auditor sent its second card to ch7 (the rage-quit squad card).
- **T10 still has only C3-5.** The library's "best friend keeps canceling" ch2 trigger was never built, and evidence sent the fix to the C5-3 replacement. I did not add a ch2 card, to stay inside the 7 to 9 card target. If ch5 builds the L3 card instead, a canceling-friend card can take a ch2 slot.
- **R2 has no card outside ch2.** Evidence proposes a ch3 card ("retire the camping story").
- **"Instant noodles" must be changed in C5-2**, not here.
- **Library:** add "Not having the money." to T06B `never` (Mika).

## Verification

Checked with node (`verify-ch.js` in the session scratchpad). It checks:
- JSON parses; ids are well formed and unique; types and privacy values are valid.
- Option counts fit each type; axes are valid, signed from −2 to 2, at most 2 per option.
- At most 3 tags per option; every tag id exists in `library/tags.json`; no option carries a tag and its own pair.
- Circumstance options and feeling cards score nothing; the feeling card sits right after the card it follows.
- The depends option has a 3-option flip.
- Friend blocks only on normal, non-sealed cards, with a `{name}` placeholder and no gendered pronouns.
- Every sealed option carries evidence; no em or en dash in the file.
- Run order: no same type side by side and no shared axis or tag pair side by side.

Result: 0 errors, 0 warnings. The chapter borders were also checked by hand: C1-8 (this_or_that) into C2-1 (scenario), and C2-8 (role) into C3-1 (scenario).

## Fix pass 2026-09-26

Open items answered: spec §12 #1 (stuck tags T05A, T05B; T03B gets a third card here), #2 (C2-8 and C2-10 repeated C2-1 and C3-12), #3 (C2-9 ladder), #6 (C2-5.4 had no evidence), plus the coordinator's C2-2.1 money-pressure fix. Chapter 2 stays at 9 run cards; order unchanged. C2-3 is untouched.

- **C2-2 (real).** "Admitted it was over my budget in the chat. Took three drafts." is now `circumstance: true`: spec §10 says money pressure never reads as a trait, and T06B's `never` now includes "Not having the money." The old circumstance "Couldn't go. The money just wasn't there." is removed because the admission line now covers that case. "Showed up for the cheap part. Skipped the expensive part." was money-driven T06B too; it is replaced by an energy move, "Went, but left early. My social battery was done." T06B s2, so T06B on this card comes only from capacity. "Went, paid, and ate instant noodles for a week." adds T05A s1 (love shown by going and paying, a deed). "Invented a clash. Sent a very long, very sweet message instead." goes T05B s1 → s2 (the long sweet message is the T05B behavior itself) and drops T06B (the reason for skipping could be money). The card is now a clean deeds-versus-words contrast. Friend side a adds T05A s1; side b is the social-battery line (T06B s2). Four options (real allows 4 or 5).
- **C2-4 (pick two).** "Send a voice note listing why they're amazing. Numbered." adds T03B s1 (library T03B call: "You'd rather send a voice note than let anything tidy up what you meant"). This is T03B's third card.
- **C2-5 (real).** "Laughed along, then felt weird about it all day." is now `circumstance: true` with guilt kept: being swept along in the moment is not a stance, and the evidence auditor ruled it scores nothing. Option order unchanged (tests use indexes 0 and 2).
- **C2-9 (scenario), ladder fixed.** "'You're a disaster.' Then send it anyway." and "Send part of it as a gift." were the same action as "Send it tonight" at other sizes. Now: "Lend them my old laptop. 'One crumb in the keys and it's war.'" T05A s2 (gruff words, real deed: the "rolls eyes, grabs keys" move) and "Start a laptop fund in the group chat. Put in first." T06A s1 (yes first, shared with the group). T12A s2 on the payback-date line is unchanged (1.10).
- **C2-8 (role), rewritten.** The haircut was the third "your friend's thing isn't good" card (C2-1 song, C3-12 bear story). New situation: the whole group got invited to a party except one friend, who asks the chat "anything fun this weekend?". The hard thing is news about their place in the group, not their work, look or story. Roles keep the old R2 values by index (tests use 0, 2 and 4): Truth-teller R2 +2 T07A s2 / Leaker (screenshots the invite) R2 +1 T07A s1 / Cover story R2 −2, no T07B (a kind lie, and T07B never means dishonest) / Hinter R2 −1 T07B s1 / Plan B (tacos first, confesses over dessert) R2 −1 T07B s1. `sally` Q30 removed: a friend's look is by nature the repeated situation. Friend sides rebuilt (Truth-teller / Cover story). No T05, T06 or T12 (C2-9 sits before it) and no R3 (C3-1 after it).
- **C2-10 (sealed, finale R2 check), rewritten.** The crush's lock screen was again "your friend shows you something bad". New situation: your friend forgot your birthday and asks "you're not mad, right??". That is your own hurt, one on one, and different from C2-8's news to deliver. Evidence by index is kept, so option 0 stays the Direct guess (tests): "Honestly? A little. It stung." R2 +2 T07A s2 / "Not even a tiny bit!" R2 −2 / "All good!", brought up later R2 −1 T07B s2 / "I'll allow it. You're buying dinner." R2 +1 T07A s1.

Max support after (check-src): T05A 2.0 → 2.8 (C2-2, C2-4, C2-9), T05B 1.7 → 2.95 (C1-8, C2-2, C2-4). T06A/T06B unchanged here (T06B still 4.3), T07A 3.6 and T07B 3.15 unchanged, T12A C2-9 still 1.10. T08A reaches 2.65 from C1-1 + C2-3 + C7-10 (ch7 keeps C7-10 at 1.10).

## Fix pass round 2

Answers judge-flow repeat #1 (C3-12 vs C2-10, and C7-10 → C2-10 at the finale border), the C2-8 answer pattern, the "tomorrow" repeats, the C2-11 ladder; judge-evidence fix 1 (C2-10.2 passive-aggressive under T07B); judge-writing C2-2, C2-8 and the "Honestly" and "screenshot" tics. Tag maxima unchanged (check-src: no problems; T05A 2.80, T05B 2.95, T06B 4.30, T07A 3.60, T07B 3.15).

- **C2-10 (sealed, finale R2 check), new situation.** A friend who forgot your birthday repeated C3-12 (your person's joke hurt) and followed C7-10 (a flaky friend) directly. Now a stranger: "Your food arrives. You asked for no cilantro. It is mostly cilantro. The server, beaming: 'How is everything?'" Evidence kept by index, so option 0 is still the Direct guess (tests): "'Small problem: I asked for no cilantro. Could you swap it?'" R2 +2 T07A s2 / "'Perfect, thanks!' Then pick out every leaf for twenty minutes." R2 −2, no tag (a kind lie; T07B never: dishonest) / "'The fries are amazing! The rest is, um, a lot of cilantro?'" R2 −1 T07B s2 (the compliment sandwich, no jab: T07B never passive-aggressive) / "Hold up a sprig: 'I think the cilantro snuck in.'" R2 +1 T07A s1. No "Honestly".
- **C2-8 (role).** Hinter ("Some people MIGHT be doing something?") copied C2-1's mumble-a-hint line and Plan B (tacos, confess over dessert) copied C2-5's "later, over food" and was the cool answer. Index 3 is now "Smuggler: 'Come with me. Act like you were invited.'" R2 +1, no tag (says the exclusion out loud and overrides it). Index 4 is now "Plan B: 'Eh, some party. Their loss. Mini golf Saturday, loser pays.'" R2 −1 T07B s1 (breaks the news now, wrapped in a consolation plan; small self-serving edge). Index 4 keeps R2 −1 for the tests.mjs flex fixture. Leaker "Screenshots" → "Forwards them the invite" (third screenshot); Cover story "honestly" → "sadly" (friend side b too). friend.json answerMap index 3 changes b → a (rerun friend-snapshot.mjs).
- **C2-2 (real).** "Went, but left early. My social battery was done." was off-topic on a cost card; now "Paid my share. Home by 9. Completely peopled out." (T06B s2 kept; paying first shows the limit is energy, not money). Friend side b follows.
- **C2-7 (golden scenario).** "'I'm fading. Can we do this properly tomorrow?'" was the second "later" answer and the "tomorrow" repeat; now "'They're the WORST. Love you. Sleeping.' Phone goes across the room." (T06B s2 kept). The flow judge asked to replace "Pretend I'm asleep. Text them first thing at 7am." instead; declined because that line is in the golden set.
- **C2-11 (sealed).** Option 2 "Come for an hour, then head back to bed" (echoed C2-2's home-early line) → "Show up at noon, once the heavy stuff is done. Bring pizza." (T06B s2). Option 3 "Send snacks ... a very warm text. From bed." (echoed C2-2 and C5-5) → "Send two friends who owe me one. Cheer them on by text." (T05B s1, T06B s1 kept, so a T05B profile still has a guess). Both fit the teen packing prompt.

Checked on a scratch copy: assemble + friend-snapshot + tests.mjs 27/27.
