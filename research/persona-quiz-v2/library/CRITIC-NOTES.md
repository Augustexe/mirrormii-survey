# Library critic notes (types.json, tags.json)

Pass date 2026-09-26. Three lenses at once: Theo (31, app-review creator: would people proudly share it?), Riley (16: does it sound like an adult trying to be young?), Jordan (25, male personal trainer, not a gamer: does it read in one pass without gamer or anime knowledge?). Checks on every half-name and tag: shareable, the sting lands because it is true (not cruel, not diagnostic), gender neutral, teen-safe unless locked18, not confusing, not cringe, not a caption cliche.

Edited in place. Ids, codes, pairs, chapters, triggers, flags and structure are unchanged; only `name`, `sting`, `heart`, one or two `calls` and three `origin` cross-references moved. Both files parse; 50 tags, 25 clean pairs, all names unique, no em dashes, no gendered pronouns in any player-facing line. Sally's `zh` is untouched everywhere (a new English name keeps Sally's Chinese).

Downstream: card or friend-game files that copied English tag or half-name text (not ids) need to pick up the new names.

## types.json (half-names)

| Code | Was | Now | Why |
|---|---|---|---|
| Me·Direct·Own | No-Filter Lone Wolf | No-Filter Free Agent | "Lone wolf" is sigma-male meme territory: male-coded and ironic-cringe for Riley, and Theo would not post it straight. "Free agent" keeps autonomy plus own script, is gender neutral, and Jordan gets it at once. |
| Me·Soft·Classic | Cottagecore Hermit | Do-Not-Disturb Homebody | Cottagecore is a feminine-coded aesthetic; Jordan would not share it. "Do Not Disturb" says the need for your own door, "homebody" says the cozy classic home. No new "old" name (Old-School Final Boss already has it). |
| Steady·Easy·Rules | Slice-of-Life Protagonist | Slow-and-Steady Regular | "Slice-of-life" is an anime genre term Jordan may not know, and "protagonist" is the main-character caption cliche. New name maps one word per pole: slow (Easy), steady (Steady), regular (routine, Rules). |
| We·Direct·Own (heart) | "Clingy and honest. You get both." | "I'm clingy and I tell the truth. You get the full set." | Every other heart is a first-person "I love my imperfection" line; this one read as a label. |

Kept after review: Trash-Talking Cuddle Bug (the roast offsets the cute), Family CEO (Sally's own and proud), Open-Book Golden Retriever (the most proudly shared self-label online; "open book" is Sally's 全透明), Human Weighted Blanket, Old-School Final Boss ("final boss" is mainstream now), Soft-Spoken Rebel, Color-Coded Overachiever, Low-Key Tryhard (a reclaimed teen insult, shareable), Chill Personified, Calculated Daredevil, Full-Send Trailblazer, Side-Quest Knight ("side quest" is mainstream), Vibes-Based Wanderer. Stings and descriptions on all 16 read as true, not cruel.

## tags.json

| Id | Was | Now | Why |
|---|---|---|---|
| T01A heart | "Being an open book is how I feel safe." | "Letting you all the way in is how I feel safe." | Reused "open book" from the half-name Open-Book Golden Retriever, which is the exact duplication T01A was renamed to avoid. |
| T02A name | Left on read, still means it | Leaves you on read, still loves you | "Left on read" means *you* got ignored; the tag is the person who does the ignoring. Confusing in one pass. |
| T02A heart, call | "doesn't need to clock in"; "someone you'd take a bullet for" | "doesn't need a daily check-in"; "someone you'd drop everything for" | Clock-in idiom did not land; bullet imagery is needless for teens. |
| T02B sting | "...You're waiting for them to text first." | "...Then you check when they were last online." | The sting repeated the tag name word for word; the new one is a behavior, so it stings because it is true. |
| T03B sting | "...The clumsy part is real." | "You'd rather send the clumsy apology than the good one. Sometimes the clumsy one lands worse." | The old line was a compliment, not a sting. |
| T04A name, sting, call | Small circle, big love | Close Friends list: 4 | "Small circle" is a stock Instagram caption. The new name is a screen everyone recognizes (Riley and Jordan both). Sting and one call rewritten so they do not repeat "four" or the Close Friends list. |
| T04B name | Friends with the whole server | Mayor of every group chat | "Server" is Discord or gamer-only (Jordan). "Mayor" is proud and clear. |
| T05A name | Grumbles, still shows up | Rolls eyes, grabs keys | Flat. The new name is the move itself and matches the call "get in the car". Avoids the half-name's "trash-talking". |
| T06A name, call | Friend VIP pass | Yes first, bank app later | Unclear who holds the pass. The new name is the behavior; the duplicate call was swapped for "the easiest yes in the chat". |
| T07A name, call | Straight shooter | The honest review nobody asked for | Bland, gun idiom, and too close to axis R2's "Direct" and the half-name "No-Filter". The new name is a proud roast of the move. Call swapped so it does not repeat the name. |
| T07B name, sting, call | Sugar-coated assassin; "...There's still a knife in the middle." | Compliment sandwich chef; "You wrap the truth in so much sugar that some people only taste the sugar." | "Assassin" plus "knife" read as passive-aggressive, which the tag's own `never` forbids, and is a violent frame for teens. The new sting is the true cost of soft delivery (the message gets lost). |
| T09A name | Lovebrain, with rules | Head over heels, eyes open | "Lovebrain" is a translation of 戀愛腦, not English; Jordan would not parse it. New name keeps "all in, but I know where the door is". |
| T11B name | Whole without kids | Full life, no kids required | "Whole without" implied parents are the whole ones, a moral grade. (locked18, unchanged.) |
| T12B name | Fair means it hurts the same | Splits by who can afford it | "Hurts" is grim and took two reads. The new name is the behavior on every trigger (income-based split, the broke friend on the trip). |
| T13A name | Rolls the dice | Books it, figures it out later | Gambling read, with a gacha call next to it and a teen audience. The new name is the move (trip, six-month shot). |
| T14A name, sting, call | Treats myself, professionally; "...Looking good still makes your whole day." | Skips the dupe; "You say it's just for you. You still notice exactly who noticed." | "Treat yourself" is a caption cliche. "Dupe" is everyday Gen Z and adult shopping language and fits the triggers (brand, skin, nicer version). The old sting was a compliment. One call now covers skins (game character wardrobe) so non-clothes players see themselves. |
| T15A name | Hustle believer | Earned, not given | "Hustle" is loaded hustle-culture language; Riley rolls their eyes, Theo would not post it. |
| T16A name | Trophy-case energy | Building the trophy shelf | Three tags ended in "energy" (a caption tic). Now one does (Limited-edition energy, which earns it). |
| T18A sting | "...Nobody has asked about your plan A." | "...Your own plan A keeps moving to next month." | Echoed the Family CEO sting ("Nobody has asked if you're tired"); both can show on one result page. |
| T19A name | Moves out, still calls Sunday | Moves out, still calls on Sundays | Grammar. |
| T20B name | Walks the new talk | Writes my own house rules | The pun did not read in one pass. New name is clear and works for teens (house rules, not marriage). |
| T22A name | One-way ticket energy | Always has a flight tab open | "Energy" tic again; the new one is a specific, true, shareable behavior. |
| T23A name | Support main | Team healer, IRL | "Main" is gamer jargon (Jordan). "Healer" is widely understood and matches the role-card trigger. |
| T23B name, sting | Solo leveling | Booked solid, all me | "Solo Leveling" is the title of a manhwa and anime: gamer-only for Jordan, a borrowed title for Theo (possible IP issue on a share card). The sting was rewritten because the old one used the new name's words. |
| T25B name | Rules are more like guidelines | Bends rules for good reasons | A movie-quote caption cliche; the new name says the behavior and stays positive. |
| origin fields | T09A/B, T22A/B | updated | They cited the old half-names No-Filter Lone Wolf and Cottagecore Hermit. |

Kept after review: Here, scroll my phone; My passcode, my dignity; Waiting for you to text first; Tells the AI first; Typos and all, my own words; Writes the birthday paragraph; Limited-edition energy; Redemption arc believer; Keeps the receipts; Dating, not merging; Relationship mechanic; Knows when to log off; Future parent, with terms; Splits it to the cent; Rainy-day fund devotee; Minimalist on purpose; Head-start detector; Clocks out on the dot; Needs a save point ("save point" is mainstream); Still loading, and that's fine; Family's backup battery; Helps, with an end date; Runs it by the family group chat; Modern for you, classic for me; The wedding's for the family; Love without the paperwork; Same order, every time; There's a spreadsheet for that; Eyeballs everything; Actually read the rulebook.

## Open for Jerry (not changed; judgment calls)

- **Chill Personified** is clear but the weakest share of the 16 (Theo). No better neutral name came up that avoids "unbothered" (a caption cliche) and "vibes" (taken by Vibes-Based Wanderer).
- **Trash-Talking Cuddle Bug**: Jordan might hesitate to post "cuddle bug"; kept because the roast half makes it ironic and Sally's 嘴硬黏人精 is exactly this.

## Fix pass 2026-09-26

Library text only (spec section 12 items 5, 9, 10, 11, plus a section 10 sweep). Ids, pairs, chapters, triggers and flags untouched. Contradiction sweep: every half desc, sting, heart and pole chip line read against every tag sting, heart and call that can share a page (pairs never co-occur), with extra weight on likely pairs from the card evidence (T01 and T09 and T19 lean R1, T13 and T22 lean L1, T20 leans R3; T06, T12, T23, T24 lean no axis, so they can sit next to any half).

### types.json

- Steady·Easy·Context (Chill Personified) desc: "...but you never blow the budget doing it" is now "...and keep your feet on solid ground." Item 5: sat next to T06A "Yes first, bank app later", T13A and T24B's "check your bank balance by feel".
- Steady·Push·Rules (Color-Coded Overachiever) sting: "You just keep not pressing start" is now "You hit the goal and start the next list before you celebrate this one." Item 5: the old sting denied the half's own planning and Push core.
- Steady·Push·Rules heart: "Slow, maybe. But every step I take counts." is now "Big goals, small steps. Every one of them counts." "Slow" contradicted the Push chip ("sooner rather than later") on the same half.
- Steady·Push·Rules desc: "every step toward them is planned, checked and done by the book" is now "you'd rather plan, check and do each step toward them by the book." An absolute that T24B ("Your calendar is more of a suggestion") flatly denied.
- Steady·Push·Context (Low-Key Tryhard) desc: "you never bet your safety net" is now "you'd rather not bet your safety net". Absolute versus T13A ("You did the math afterward").
- Venture·Push·Rules (Calculated Daredevil) desc: "only after you've scouted the landing..." is now "you like to scout the landing, pack a plan B and read the fine print first." Sting: "Every leap you've taken had a backup plan" is now "Most of your leaps came with a backup plan." T13A leans Venture, so "Books it, figures it out later" is a likely neighbour.
- We·Direct·Own (Trash-Talking Cuddle Bug) desc: dropped "always" from "You want your people close, always." T06B, T09B and T04A can share the page ("a whole day of nobody", "one night a week that's just yours").
- We·Soft·Own (Open-Book Golden Retriever) desc: "in full view ... never by anyone else's rulebook" is now "mostly by your own rulebook". T19B leans We ("Your big decisions need a family vote"), and "in full view" fought T01B. Sting: "you're running on empty" is now "you can hit empty", so it no longer flatly denies T06B's heart "I charge myself first".
- We·Soft·Classic (Human Weighted Blanket) sting: "Yours are always last on the list" is now "Yours get checked if there's time left over." Absolute versus T06B's heart, and it duplicated T23A's "you're always last" (both lean warm, so likely on one page).
- Me·Direct·Classic (Old-School Final Boss) desc: "nobody, ever, makes your decisions for you" is now "the final call on your life is yours." Versus T19B, which Classic players can fire.
- Me·Soft·Own (Soft-Spoken Rebel) desc: "a life that follows no template anyone handed you" is now "a life you'd rather write yourself than copy from a template." Versus T20A and T21A (classic for me, the wedding's for the family).
- R1 plusLine chip: "You recharge with your people" is now "Your people are your happy place." Versus T06B's call "you'll need a whole day of nobody".

### tags.json

- T06B never: added "Not having the money." (item 11, Mika's fix; section 10 money pressure is never a trait). Now "Selfish, cold or uncaring. Not having the money."
- T06B call: "Do Not Disturb at the same time every night" is now "most nights". Versus T05A's sting "you'll pick up their 2am call".
- T12A call: "You remember who paid last time, every time." is now "You could say who paid last time without checking." Absolute versus T06A's call "paid for a friend's ticket and 'forgot' to ask for it back".
- T13B call: "You've checked your balance before saying yes to dinner." is now "You've moved birthday money straight into savings." Section 10: the old line reads as money pressure, not a saving choice.
- T13B call: "You'll wait for the rerun banner. It always comes back." is now "You've packed snacks and a charger for a two-hour outing." Same defect as item 10: it quoted C4-10 option 1 ("Wait for the rerun. They always come back.") back to the player.
- T18B call: "You'll find the right professional before you'd move back home." is now "You've sent a family member a how-to video instead of doing it for them." Section 10: "professional" in a family-help context reads as care or health.
- T22B call: "Your favorite place starts making your order when you walk in." is now "Your alarm has been the same sound for years." Item 10: the old call repeated the C7-S2 finale prompt.
- T23A sting: "On your own to-do list, you're always last." is now "You'll say yes to one more good cause before you say yes to a nap." Absolute versus T06B, and a duplicate of the Weighted Blanket sting.

### final/friend.json

- Level 1: new wording set `level1.questions.everyday`, the `friend` set with a new R1 question: "With friends and group plans, {name} is more…" (We: "Lots of together time. Big plans get made as a group." Me: "Needs {their} own space, however close. Makes {their} own calls."). `relationships.options` friendOrCoworker now has `level1Set: "everyday"`; a rule line documents the three sets. Item 9: a friend or coworker never sees "In love and with family". score.mjs already picks the set by `level1Set`, so no scorer change is needed. Partner and crush keep the `friend` set.

Checked and kept: calls and hearts have no health, politics or identity inference beyond what section 10 allows (T15A/B stay effort versus head start, no policy). "Rarely" and "most" lines were left where the neighbour is unlikely (No-Filter Free Agent's sting versus T01A, which leans We).

## Fix pass round 2

Rule for every new call (flow judge): a behavior no card offers, checkable in the player's life this week. Each new call was checked against every option, prompt, teen prompt and friend line in chapters/*.final.json as of this pass, the finale cards, and the rewrites the three judges proposed (so it will not echo them once the card agents land them). Triggers arrays, ids and flags untouched.

### tags.json calls: the 13 slot-0 echoes the flow judge listed

- T06B[0]: "can we do this tomorrow?" (C2-7) is now "You've let a call ring out, then texted 'what's up?' ten seconds later." The judge's "left a party without saying bye" was not used: it repeats C2-2's leave-early line.
- T13B[0]: "DO NOT TOUCH" savings (C4-8 savings goal with a name) is now "You have money set aside that you pretend doesn't exist."
- T12A[0]: $3.50 payment request (C3-3 itemized requests; also roast R07) is now "You've pulled out the calculator app at a group dinner, and nobody was surprised." The judge's "to the cent" repeats the tag name.
- T09A[0]: lunch photo (C3-4) is now "Your person's name is the first one your phone suggests." (judge's line).
- T11A[0]: named a future kid (C3-8) is now "You've caught yourself rating playgrounds on a walk." (judge's line).
- T16A[0]: name on something people use (C5-9) is now "You have a folder of wins: kind emails, certificates, one legendary grade."
- T19A[0]: told family afterward (C6-2) is now "You've gone against the family vote and still made it home for dinner that week."
- T20A[0]: defend any couple's setup (C6-3) is now "You'll say 'whatever works for you two' and mean it. Yours will be traditional." The judge's family-recipe line was not used: it is classic only and echoes C6-S1 and the new C6-7 ritual line.
- T22B[0]: comfort show rewatch (C7-9) is now "Your top song of the year was also your top song last year."
- T25A[0]: explains the rules at game night (C7-1) is now "You've actually read the terms and conditions on something." (judge's line).
- T13A[0]: pulled on a banner (C4-10) is now "You've spent a refund before it even hit your account." The judge's deposit line echoes C7-10's "Deposit's paid".
- T08B[0]: "have it saved" (C2-3 screenshots) is now "You've brought up something from three years ago, and you had the date." The judge's line duplicated T08B[1].
- T18B[0]: "next time you do it" (C6-8 Deadline) is now "You've told someone in your family 'I can do Tuesday, not every Tuesday.'" The judge's teach-them line duplicated T18B[2].
- T03A[0]: AI-drafted hard message (C1-8) is now "You've asked an AI who was right in an argument, then shown your friend the answer."
- T04B[0]: add to a group chat tonight (C1-1 Recruiter) is now "You know your friends' coworkers by name, and you've never met a single one."
- T06A[0]: paid a ticket, never asked back (C2-9) is now "You've given up your charger, your seat or your last slice this week."
- T15B[0]: "who paid for it?" (C4-2, C4-8) is now "You've read a 'how I made it at 22' post and gone straight to the comments." The judge's "looked up their parents" repeats the writing judge's new C4-8 line.
- T17A[0]: five-year timeline (C5-9 prompt, laminated plan) is now the judge's pros and cons list line.
- T09B[0]: one night a week that's yours (C3-4 offline nights) is now the judge's trip-without-your-person line.

### tags.json calls: other echoes (flow judge list plus own sweep)

- T01A[1] location shared and forgotten (C1-5 "Already on") and T01A[2] hand the phone over (C1-2): now face or fingerprint unlock, and letting someone scroll your camera roll unchecked.
- T01B[1] location sharing off (C1-5): now "When you show someone a photo, you never let go of the phone."
- T02A[2] pick up an old friend mid-sentence (new C1-6 "Like we never stopped"): now one-emoji replies.
- T02B[1] who texted first (C1-6 "Someone should've texted"): now "A 'k.' with a period has ruined at least one of your afternoons."
- T03A[1] "am I overreacting?" (C1-4 typed it out to an AI, and a near duplicate of the new slot 0): now thanking an AI.
- T03B[1] typo apologies (C1-8) and T03B[2] voice note (C1-4, C2-4): now autocorrect fight, and the group chat knows it's you without the name.
- T04A[0] "top three" (C1-5 option) and T04A[2] "inside jokes" (C3-7 prompt): now phone favorites unchanged for years, and a nickname a new friend has to earn.
- T05A[0] complaining while helping (C2-11, C6-8 Grumbler): now fixing the problem and changing the subject before the thanks.
- T05B[1] Notes-app draft (C1-4) and T05B[2] long voice note (C1-4): now tearing up at your own message, and friends saving your messages for bad days.
- T06B[1] Do Not Disturb at night (new C2-7 "Phone goes across the room"): now a weekend nap nobody may move.
- T07B[0]: dropped "honestly" (writing judge's verbal tic count).
- T08A[2] first yes to let someone back in (C2-3): judge's ex-friend second chance line.
- T09A[1] weekend defaults to "us" (C3-4 "If they're free, I'm free"): now "we're watching this show" when only one of you is.
- T10A[0] "a system" (C3-5 deal, C5-10 system) and T10A[1] "logged off" (T10B's name, C5-10 switch partners): now a new idea for round three, and one "can we talk?" text.
- T10B[1] "without making anyone the villain" (C3-5 prompt): now unfollow and wish them well in the same minute.
- T11B[0] kids' party (evidence judge fix 3, the new C6-11 kids' table option): now "You're some kid's favorite adult, and you still sleep in on Saturdays." T11B[2] "so when are you having kids?" copied C6-9's aunt-question template: now "I love kids" and "not for me" in one sentence.
- T12A[2] who paid last time (C3-4 turn-keeping): now a running tab only you know the total of. T12B[0] quietly covering a broke friend (new C4-7 "Slip my share... Tell nobody"): now paying more toward a shared gift. T12B[1]: "broke" is now "short on cash" (C4-7 word).
- T13A[2] trip booked for next week (C4-8 "booked something"): now "you only live once" at a checkout.
- T13B[1] snacks and a charger (writing judge: preparedness, not saving) and T13B[2] birthday money into savings (C4-1 "Straight into savings"): now snacks from home to skip stadium prices, and a gift card too precious to spend.
- T14A[2] something in your cart (C4-5 cart): now knowing the drop date of your favorite brand.
- T15A[0] carried a group project (C5-10, C7-S1): now turning down help to say you did it alone.
- T16A[1] bigger role that eats weekends (C5-4): now grabbing the hardest part so your name is on it.
- T17A[1] planning mode after big news (C5-7): judge's self-set deadline line. T17B[1] switched majors (C5-9 "Changed plans four times") and T17B[2] five-year plan (C5-9 prompt): now yes to something new with no idea where it leads, and "I don't know yet" as a full answer.
- T18A[1] moved plans and never mentioned it (C6-8 Secret sponsor) and T18A[2] cover a sibling, send money (C6-8 Safety net, new Bank): now answering a family call mid-date, class or movie, and "In your family, 'can someone...' means you." T18B[1] plan and deadline (C6-8 Deadline): now a kind limit you kept.
- T19B[1] peace at home (C6-2): now letting a parent pick the restaurant.
- T20B[1] split chores by what you hate least (C6-1): judge's cook-not-vacuum line. T20B[2] started your own tradition (C6-S1): now a holiday only your friends celebrate.
- T21A[2] 30 guests for one relative (C6-7 every relative): now promising a relative an invite before there was anyone to marry. T21B[0] courthouse and dinner (C6-7 ten people, best dinner), T21B[1] money to a trip or home (C6-7 option), T21B[2] "when's the wedding?" (C6-9 prompt): now a "wanna keep doing this?" proposal, anniversary over wedding, and "lovely, not for me" as a guest. The judge's pricing and bouquet lines were not used (C6-11 open-bar math; bouquet toss reads gendered).
- T22A[0] city you'd move to if someone paid (C7-3 prompt) and T22A[2] year abroad (C7-3 teen prompt): now "thank you" in a language you don't speak yet, and 1am flight prices. T22B[2] turn down a year abroad (C7-3): now a favorite bench at the same vacation spot.
- T23A[0] "healer" repeated the tag name, T23A[1] dragged a friend to help (C7-6 bake sale, new C7-9 volunteered the group), T23A[2] pay more for the helpful version (C4-4): now walking a stranger to where they're going, a birthday fundraiser, the nearest donation bin. T23B[0] free time is a skill (C7-6, C7-9 project) and T23B[1] no to a good cause (near duplicate of the new slot 0): now passing the sign-up sheet along, and a hobby progress tracker.
- T24A[1] calendar backup times (C7-5) and T24A[2] streak at 11:58pm (duplicated T02B's streak): now a packing list for one night, and a list of your other lists. T24B[0] bank balance by feel (C3-3, C4-8 "balance") and T24B[1] calendar is a suggestion (C7-9): now a forgotten subscription, and the wrong day, laughing.
- T25A[2] group project rubric (C7-S1 brief): now the walk signal on an empty street. T25B[2] game night do-over (C7-1): judge's let-a-kid-win line.

### tags.json rules.triggers

- Rewritten for the current format: card id and type (golden marked), the Sally question in parentheses when there is one (reframed, 18+), the situation, then the behavior after the arrow; "(slight)" is strength 1; strings describe evidence that lives on the card options and are synced from the cards. The old line described the Q-number-first format and a "NEW" marker no trigger uses.

### types.json (writing judge)

- Steady·Easy·Context (Chill Personified) desc, rated 3: "...and keep your feet on solid ground" (stock metaphor) is now "You go with the flow, and you like the flow familiar." (judge's line).
- Steady·Push·Rules desc: the clunky "you'd rather plan, check and do each step" is now "you like the steps to them planned, checked and done by the book." The judge wrote "every step"; "the steps" keeps round 1's fix against T24B.
- We·Soft·Own sting: "can hit empty before anyone notices" is now "some weeks the tank hits empty before anyone thinks to ask." That keeps the sting and stays non-absolute next to T06B's heart.

### final/friend.json Level 4

- Added roast R13 (tag T14B, never T14A "Skips the dupe"): "Bragged about a $12 dupe for a full week. Unprompted." This brings back the judges' favorite dropped C4-8 line as a non-scoring preset. It roasts a move, not looks, body or health. The show rule now reads "6 of the 13 lines". score.mjs already takes the tied lines first, then random others, and slices to 6, so no scorer change is needed. The spec still says 12 in its friend-game Level 4 row ("6 of 12 preset lines", about line 271) and its roast comparison row (about line 315); the integrator should update both.

## Release check 2026-09-26

The release judge played the adult and teen runs and read every result line (verdict fix-then-ship). Applied by script (`quiz-v2-tools/apply-release.cjs`):
- Blockers: C6-3 now a role-swap couple (the old setup read as a traditional home, so two options were the same answer; option 1 no longer names "classic"). C7-4 option 0 is "Asked whoever's in charge, then went with their answer." (asking for an exception is the Context side, not Rules).
- Calls: T12B and T13A calls that described the opposite tag; T01A and T20A calls that replayed C1-2 and C6-3; T19A (teen-safe); T03A (predicted a feature the test lacks); T18B (vague); T25B and T25A (replayed the L3 coffee-line extra).
- Lines: T15A heart (read as a sting), T17A sting (echoed C5-7), Open-Book Golden Retriever sting (clashed with Limited-edition energy).
- Friend game: C5-4 and C5-2 teenOk false (their friend prompts describe the adult version); bestie 0 to 1 band now has the friend buying the bubble tea, matching the invite.
