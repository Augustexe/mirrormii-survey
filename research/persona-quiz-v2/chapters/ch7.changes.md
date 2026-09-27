# Chapter 7 rewrite: what changed and who asked

Input: `ch7.json` (9 chapter cards + 2 sealed). Output: `ch7.final.json` (9 chapter cards + 2 sealed). 1 cut (C7-8), 1 added (C7-10).

Run order follows the flow judge: C7-1, C7-6, C7-5, C7-4, C7-3, C7-2, C7-7, C7-9, then the new C7-10 at the end. C7-S1 and C7-S2 stay in this file for the finale (flow puts them in the finale as the L3 and L1/T22 checks). Checked by node: no two cards of the same type next to each other, and no two neighbours share an axis or tag pair. The last card (C7-10, T08) sits next to the finale opener C2-10 (R2, T07), so they share nothing there either.

Rule for conflicts: the evidence auditor wins on scoring, Theo plus the audience majority win on wording, and flow wins on order, repeats and cuts.

## Per card

**C7-1 Uno stack (scenario, chapter opener, kept first)**
- Scores swapped. "Let it slide. They haven't won a single round all night." is now L3 -2, T25B s2, and "Draw six." is L3 -1, T25B s1. (evidence: bending the rule for the person is the purest Context move)
- The friend game's option b is now "Lets it slide" with the -2 values, so the friend game uses the stronger pole. (follows the evidence fix)
- "Let it count, then settle the stacking rule before next game." is now "Let it count. Write 'NO STACKING' on the box." (Theo: the old line was the sensible-adult answer)

**C7-6 Free afternoon (real, moved to slot 2)**
- Cut back to Sally Q47 only: my own thing versus helping with someone else's. Removed "Stayed horizontal... zero guilt" and "Caught up on work or homework" and their L2 values. (flow: repeats C5-S1 and its "zero guilt")
- "Texted around until a group plan happened." no longer scores R1. (evidence: rounding up friends isn't R1)
- The helper line is now "Got roped into a friend's bake sale. Honestly? Loved it." (evidence and Theo said the old line sounded saintly; Jordan and the evidence auditor said to drop "a move", the third moving-day line in the run; Riley asked for "Honestly? Liked it"; the bake sale is Jordan's detail)
- New opener instead of "Think of the last...". (flow: all 11 real cards opened the same way)
- Friend option b and the mask updated to match.

**C7-5 Sunday night (scenario, slot 3)**
- "Look back at last week to see what went wrong." is now "Copy last week's unchecked boxes onto this week. Again." (T24A s1, guilt). Jordan, Riley, Wei and Theo all asked for the copy-over line; every judge except the evidence auditor called the old line the homework answer.
- "Ask the group chat what I'm doing this week." kept. Every audience judge named it as a highlight. It is now the only "group chat" in the chapter (see C7-7).

**C7-4 A rule that made zero sense (real, moved to slot 4)**
- The prompt now names real rules: "'No outside drinks' and yours is just water. A hallway phone ban." (Jasmine, Jordan, Mika, Wei and Theo said it was too abstract; the drink sign got the most votes; the phone ban is Riley's teen example.) New opener "Remember the last..." (flow)
- Option 1 is now "Found whoever's in charge. Asked, very politely, for an exception." (Wei, and Jordan's "Politely. Twice." idea; "in charge" rather than "manager" so it also fits a school ban)
- Option 4 is now "Did it my way. Had a speech ready, just in case." (Theo: the old bent-it line was hard to picture). Scores unchanged, L3 -1, T25B s1.
- The friend game's option a text updated. The auditor kept the scoring as it was.

**C7-3 A year in a new city (scenario, slot 5)**
- The "depends" option no longer scores R1 and now reads "Depends who'd still be here when I get back." (evidence: a depends option scores nothing and goes to the flip; Riley: the old line was flat). The flip is unchanged.
- "Visit for a week first. Then decide." is now "Stalk the city on Street View for three nights first." (L1 +1). Mika pointed out that visiting costs money, and Jasmine, Theo and Mika all called it the safe dodge. The Street View line costs nothing and is funnier.
- Prompt tightened ("Offer on the table..."). The teen prompt is unchanged.

**C7-2 Getting ready, ride in 10 (role, slot 6)**
- "Still in the shower" no longer scores L2 -1 and keeps T24B s1. (evidence)
- "Wearing the outfit I planned on Tuesday. Accessories included." is shortened to "...on Tuesday." (Jordan)
- The prompt now has a stake that works for every age: "the driver has left people before." (Riley wanted "it's someone's mom"; I kept the joke but not the parent, so adults recognize it too.)

**C7-7 One spare ticket (scenario, slot 7)**
- Removed the saint option "Give up my own ticket so both of them go." (evidence, Jordan, Riley, Mika and Theo). In its place:
  - "Give them my ticket too. Watch their stories from bed." (Riley's and Jordan's cost-to-self version). No tag: the evidence auditor's library note drops T06A from this card because T06A was overfiring (7 cards against 4).
  - "Stall until one of them says 'it's fine, take them.'" (Theo's replacement, no axis). The card now has 5 distinct moves.
- The coin flip is now "Flip a coin. On video, so nobody can argue." I removed "post it in the group chat" because flow flagged "group chat" as appearing on about 10 cards.
- Not taken: Mika's "Sell it to a stranger" (T10B does not follow from selling a ticket). The auditor's "Mention it for the next month" is covered by the cost-to-self line.

**C7-8 Feeling card after the ticket: CUT**
- Flow cut it: it is the seventh identical "What showed up first?" and comes at minute 12. The audience judges kept it but only offered new wording; the cut follows flow's authority on fatigue. The chapter's feeling targets now live in each option's `emotion` field.

**C7-9 Pick two (pick_two, slot 8)**
- New prompt: "Your friends are writing your roast. Pick the two lines they'd definitely use." Every judge flagged the old prompt as word for word C4-8's. The roast framing is Theo's, backed by Jasmine, Mika, Riley and flow. I did not use the evidence auditor's "dating-app-style bio" because it is not teen-safe.
- "I'll give up a Saturday to help anyone move." is now "Someone says 'I need hands' and I'm already putting on shoes." (T23A s1). The evidence auditor, Jasmine, Jordan and Riley flagged the third moving line, and Riley noted teens don't help people move.
- "My free time is booked. By me, for me." is now "Weekends are booked. Me, my project, do not disturb." (T23B s1). Theo called the old line a self-care caption. I did not take his "By my couch" because a couch is rest, not own growth, so it would not honestly evidence T23B.

**C7-10 Squad rage-quit (NEW, scenario, slot 9)**
- Added because T08 had only one supporting card (C2-3) and could never fire. The evidence auditor asked for this exact card, built from the library's "NEW ch7 scenario" trigger.
- Options: "Send the invite. Everyone gets one bad night." (T08A s2) / "Let them in. Bring up the rage-quit every single round." (T08B s1) / "Find a new fourth. Once was enough." (T08B s2) / "Reply 'lol maybe' and hope they forget." (no score).
- Changes from the auditor's draft, so nothing repeats: "mute their mic" became "bring it up every round", because "Mute" already appears in ch1 and ch5. The added fourth option avoids "vote" (C4 has "Put it to a vote") and avoids C2-3's "your call" and "keep the screenshots" moves. It has a friend-game pair.

**C7-S1 Sealed: 10 slides or a video**
- Option 3 "Ask whoever set the brief before touching anything." is now "Make both. Submit whichever one actually gets finished." with no score. Flow said the old line was the same move as C7-4's ask-for-an-exception. I did not use flow's "let the group vote" because C4 already says "Put it to a vote".
- The prompt now opens "Team project, school or work." Jordan (25, not in school) asked for an adult version. The card format has no adult-prompt field, so one prompt now covers both ages.

**C7-S2 Sealed: your go-to spot closes**
- "Track down where the staff went" no longer scores R1 and keeps T22B s1. (evidence)
- The prompt now says "coffee or bubble tea spot". Riley asked for a teen version, and one prompt covers both ages.
- Added Theo's optional fourth line, "Mourn for a week. Make it at home, badly." (T22B s1: stays with what's yours instead of trying new places).

## Left for other owners (not in this chapter file)
- T22B call "Your favorite place starts making your order when you walk in" quotes the C7-S2 prompt back (Jordan, Mika): library fix.
- The type name "Color-Coded Overachiever" echoes C7-5's "Color-code the whole week" (evidence suggests "By-the-Book Overachiever"). I kept the card line because C1-9 was cut, so this is the only "color-code" left in the cards. If the library keeps the name, reword this option.
- Renames for T24B and T25B (the audience says "Eyeballs everything" is unclear and "Bends rules for good reasons" flatters the player): library fix.

## Verification (node, same checks as the writers)
The file parses; ids are unique; every tag id exists in tags.json; axis ids are valid with values from -2 to 2; each card has 2 to 6 options; every option is 14 words or fewer; every prompt is 32 words or fewer; there are no em dashes. I also checked by script that no two cards of the same type are adjacent, no two neighbours share an axis or tag pair, each option has at most 2 axes and 3 tags, and each flip has 3 conditions. Result: PASS.

## Fix pass 2026-09-26

- **C7-10 (rewritten, open item 2):** it repeated C2-3 (someone who let the group down asks back in). It is now: "Your friend has flaked on the last four hangouts. Now they've booked an escape room for six: 'Deposit's paid. Send me $25.'" This is not a let-them-back-in moment. It asks whether you trust that someone has changed. T08A: send the $25 now (s2), write it in my calendar in pen (s1). T08B: pay at the door (s2), ask to see the booking email first (s1). T08A support from this card stays at 1.10, and T08B's at 1.10. The options follow T08's never lines: no one is naive or vindictive. The old no-evidence option C7-10.3 is gone (open item 6). The friend field was rewritten.
- **C7-3 (T22, open item 1):** "Go. Pack tonight" and "Stay. My people, my spots" rise from s2 to s3 on T22A / T22B. A year away from a good life is the core Q46 trigger, so it is strong evidence. The friend sides match. With C5-2 as the new third card, T22A and T22B each go from 1.55 to 3.00.
- **C7-6 (T18B third card, open item 1):** it adds "Gave my family two hours of errands. Kept the rest for me." (T18B s1: help given, with a stop time). The prompt now says "Nothing planned, nothing due" instead of "nobody needing you", so a family ask can happen. T18B goes from 2.00 to 2.80.
- **C7-7 (no-evidence options, open item 6):** "Give them my ticket too. Watch their stories from bed." gets T06A s1, for generosity at your own cost. "Stall until one of them says 'it's fine, take them.'" gets R2 -1: it avoids saying the hard no. Neither neighbour (C7-2, C7-9) carries T06 or R2.
- **C7-S1 (sealed, open item 6):** "Make both. Submit whichever one actually gets finished." gets L3 -1: the situation decides, not the brief. It is not L2, because the finale neighbour C5-S1 is an L2 card.
- **C7-S2 (open item 10):** unchanged. The T22 cards (C5-2 assignment, C7-3 city, C7-9 restaurant and comfort show) do not use the go-to spot that knows your order. The T22B call swap is the library agent's job.

## Fix pass round 2

- **C7-10 (flow high ladder, evidence fix 5, writing):** it had four options but only two stances, and "Big vote of confidence" read as sarcasm. Now there are four distinct moves: "Send the $25 right now. Everyone gets a comeback era." (T08A s2, kept), "Pay at the door. If there is a door." (T08B s2, kept), "Offer them a ride there. Like old times." (T08A s1: invests in them showing up), "Say I'm in. Keep my other plan for that night alive." (T08B s1: commits but hedges). The flow judge's screenshot line was not used, because "screenshot" is already the run's banned repeat. T08A stays at 2.65 and T08B at 3.00. The border into the finale (C7-10 T08 to C2-10 R2/T07) stays clean.
- **C7-9 (flow medium, the C7-6 twin):** the two T23 lines restated C7-6. They are now "I've volunteered the whole group for something. Twice." (T23A s1) and "I'll repost any good cause. From my pottery class." (T23B s1). T23B stays at 2.50.
- **C7-6 option 3 (writing, optional):** now "Gave my family two hours of errands. Then phone off, door shut." (T18B s1, same behavior).
- **C7-3 circumstance (flow, money-says-no fatigue):** "Money or family keeps me here." became "Can't this year. Too many people need me here."
- **C7-S1 option 0 (flow low):** "The brief is the brief" repeated C6-10's "Rule's a rule". It is now "Make the 10 slides. Done by Tuesday, font size 32." (L3 +2, T25A s2, unchanged).
