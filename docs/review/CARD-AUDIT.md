# Card audit: the scored bank, worst first

Package A1, 2026-09-30. Read-only audit of `research/persona-quiz-v2/final/cards.json` at git HEAD of the survey repo (`9772a94`; cards.json last changed in `4eb53c8`), 174 cards. No card, bank, library or app file was changed.

**Lens.** The advisor's bar: Rice Purity x Spotify Wrapped. Would a 20 to 35 year old screenshot this card into the group chat? Specific, slightly embarrassing, real micro-behaviors and friction points; absurd only when it rides a real social instinct; no responsible-adult default; no hedging middle; the situation makes the feeling, the card never asks for it. Jerry's standing rules (LAUNCH-SPEC section 2, card-writer skill) apply on top.

**Score** is the group-chat screenshot test, 1 to 5: 5 = people send it to argue about it; 4 = strong, specific, true; 3 = fine, nobody shares it; 2 = forgettable or effortful; 1 = a player bails or taps at random.

**Scope.** All 143 scored cards are flagged, scored and ranked. The 24 sealed and 7 feeling cards are noted at the end and are not eligible for rewrite batches.

## Summary

- Scored cards: 143. With at least one flag: 75. Clean: 68.
- Scores: 1: 5, 2: 41, 3: 51, 4: 42, 5: 4. Mean 2.99.

| Flag | Cards | What it means here |
|---|---|---|
| ADULT_DEFAULT | 10 | one option is the mature, correct pick most people tap by default |
| MUSH | 5 | a hedging or split-the-difference option |
| STIFF | 8 | formal, robotic or overwritten wording |
| CONFUSING | 20 | the premise needs a second read |
| SAME_AS | 13 | same situation or premise as another card |
| AGENCY | 5 | the player gets implausible power or control |
| GENERIC | 34 | could be any quiz; no specific micro-behavior |
| WEAK_ABSURD | 36 | absurd with no real social instinct under it |
| OFFBRAND | 1 | clashes with the brand world or never-say list |

Mean score by world and format (scored cards):

| World | Cards | Mean score |
|---|---|---|
| everyday | 39 | 3.56 |
| unusual | 49 | 3.24 |
| absurd | 55 | 2.36 |

| Format | Cards | Mean score |
|---|---|---|
| bet | 18 | 3.83 |
| real | 16 | 3.44 |
| reply | 14 | 3.36 |
| receipts | 7 | 3.29 |
| scenario | 41 | 2.88 |
| others | 14 | 2.86 |
| role | 5 | 2.80 |
| pick_two | 4 | 2.75 |
| eyes | 4 | 2.25 |
| this_or_that | 17 | 2.18 |
| rank | 3 | 1.67 |

## Patterns across the bank

1. **Absurd is doing work that real life does better.** 35 of the 55 scored absurd cards carry WEAK_ABSURD. The typical failure is a magic prop bolted onto a real moment (a houseplant for the friend you have not texted, a mailbox for being the family's fixer, a sky message for an apology). The prop removes the embarrassment that makes the moment screenshot-worthy. The absurd cards that work (C3-120 Clean Break machine, C5-121 office dog, C4-2 "Built From Nothing", C7-134 clone) all ride an instinct people already joke about.
2. **The best cards are real behaviors.** Every 5 in the bank (C4-30, C3-81, C5-91, C6-120) is a thing people have actually done or endured. "Did" formats (bet, real, receipts) and everyday worlds score highest; see the tables above.
3. **Rule 18 pulls against the advisor lens.** LAUNCH-SPEC rule 18 and skill section 0b allow the everyday world only on did formats, and the skill calls ordinary settings "the boring flag". That pushes every scenario, reply, this-or-that and rank card into an invented world, which is where most WEAK_ABSURD and GENERIC flags live. **Decision for Jerry:** keep rule 18 as is, or allow everyday settings on any format when the card is built on a specific micro-behavior (unread texts, bill splitting, the "quick call?" message). BATCH-01 marks each world change so you can see the cost.
4. **The evidence template writes ladders.** 79 of 174 cards score one axis +2, +1, -1, -2 across four options. Writers fill it with the same move at two strengths per side, so the +1 and -1 lines read as polite middles (C3-160, C1-163, C2-141, C2-120, C1-126). No card uses "sometimes" or "depends" (the checker bans them); the mush is structural instead.
5. **The good-person option.** Moral-test cards (C5-141 kites versus crops, C1-1 hotel vouchers, C4-82 lateness fines, C6-121 the pumpkin swap) put a kind answer next to a rule answer. Most players tap kind; the card measures manners, not the axis.
6. **Sub-questions crowd onto a few premises.** "Trade a known good for an unknown" appears in C1-132, C2-126, C5-120, S-110 and S-141; "honest feedback on a friend in front of others" in C1-161, C2-120, C6-91 and S-91; "the classic couple script" in C6-160, X-R3-50, C3-124 and S-128. Each passes the fingerprint check but reads as the same card reframed.
7. **Prompt length.** The weakest cards stack three or four setup beats before the ask (C6-121, C4-82, C7-111, C1-161). The strong ones have one hook and one twist ("they just bought it a fitted sheet").

### Cut or merge, not rewrite

These SAME_AS cards are better fixed by cutting one side than by another rewrite round. Listed for a later batch; nothing changed.

| Weaker card | Keep instead | Why |
|---|---|---|
| C1-91 ghost poet | C1-131 AI wrote your big message | same "whose words" premise; the real one is sharper |
| C1-162 journal swap | C1-90 unlockable phone | same phone-privacy premise and sub-question |
| C2-126 closet door | C1-132 or C5-120 | the third "known good versus gamble" card |
| C1-161 talking mirror | C6-91 wedding toast | honest judgment in front of others; the mirror is also a brand risk |
| C2-161 memory delete | C2-132 sworn enemy back in your life | forgiveness, with the real one scoring 4 |
| C4-145 Moon hotel | C4-143 stretch trip | same sub-question; the real one is a did card |
| C7-142 vacation globe | C7-140 "the usual?" | same sub-question; the real one is a did card |

## Ranked list, worst first

Ordered by score, then by editorial severity: within a score, a card a player is likely to bail on or tap at random (confusing, agency, adult default) ranks above one that is only forgettable, and SAME_AS cards whose fix is a cut rank after the rewrites. Rows 1 to 10 are BATCH-01.

| # | Id | Type | Chapter | Prompt (Make it fun) | Flags | Score |
|---|---|---|---|---|---|---|
| 1 | **C5-141** | scenario | 5 Work, school and ambition | New job: you decide the town's weather. A kite festival booked Saturday's sunshine a year ago. A farmer's crops die without rain that day. | **AGENCY**: you control a town's weather; **ADULT_DEFAULT**: crops beat kites; almost nobody picks the kite festival; **WEAK_ABSURD**: weather desk; **GENERIC**: a moral test with no micro-behavior | 1 |
| 2 | **C7-147** | rank | 7 Play, rules and you | You wake up able to fix anything by touching it. Rank what you'd do first, top to bottom. | **AGENCY**: a fix-anything superpower; **WEAK_ABSURD**: no social instinct; **GENERIC**: a what-would-you-do-with-powers list; **CONFUSING**: ranks a street sign-up sheet against your old car | 1 |
| 3 | **C6-121** | scenario | 6 Family and home | Family curse: every winter, one sibling spends a week as a pumpkin. Swaps are allowed. It's your youngest sibling's turn, the week they move into their first place. | **WEAK_ABSURD**: pumpkin curse; **CONFUSING**: curse, rotation, swap rule and a move in one prompt; **ADULT_DEFAULT**: "I'll be the pumpkin. Their big week matters more." | 1 |
| 4 | **C6-140** | this_or_that | 6 Family and home | You wake up as a goldfish, for one year. Your parent and your person both show up to take your bowl home. You pick. | **WEAK_ABSURD**: a year as a goldfish; **CONFUSING**: a goldfish choosing who carries its bowl; **AGENCY**: implausible premise the player must accept first; _the real version (whose family gets the holidays) is one of the most argued questions at this age_ | 1 |
| 5 | **X-L1-40** | this_or_that | Extras | You're a pro cyclist who never took the training wheels off. Never fallen once. The final is tomorrow, and nobody has ever won with them. | **WEAK_ABSURD**: a pro cyclist on training wheels; **CONFUSING**: premise needs a second read; **GENERIC**: no behavior anyone recognizes | 1 |
| 6 | **C2-142** | rank | 2 Friends | You slept through helping your best friend move. Rank these apologies, from the one you'd choose first to last: | **WEAK_ABSURD**: sky writing and a glowing letter are fantasy props with no real behavior; **AGENCY**: the player commands the sky; **CONFUSING**: ranking four magic apologies; _the premise (slept through the move) is gold_ | 2 |
| 7 | **C1-126** | reply | 1 Your phone | Driving to work. Your map app, which has never texted anyone, texts you. | **WEAK_ABSURD**: a map app texting you has no social instinct behind it; **CONFUSING**: you are replying to an app about a 400-mile drive; **GENERIC**: the four answers are one ladder: skip, skip and call, exit and ask, exit | 2 |
| 8 | **C6-110** | scenario | 6 Family and home | Anything your family loses can now turn up in your mailbox or your sibling's. Everyone picks yours: 23 lost things, 23 calls this week. | **WEAK_ABSURD**: lost-things mailbox; **CONFUSING**: 23 lost things, 23 calls, two mailboxes; _the real version (you are the family's tech support) is gold_ | 2 |
| 9 | **C5-51** | this_or_that | 5 Work, school and ambition | A carrier owl lands between your desk and your closest friend's: one dream-job offer, seventy-hour weeks. Whoever feeds it first gets it. | **WEAK_ABSURD**: carrier owl; **CONFUSING**: "whoever feeds it first gets it"; **ADULT_DEFAULT**: "I like my evenings, and my friend" | 2 |
| 10 | **C4-142** | bet | 4 Money and treats | Somewhere, you've got money you try to keep untouchable. Right? | **STIFF**: "Somewhere, you've got money you try to keep untouchable. Right?"; **GENERIC**: no specific behavior; answers report savings habits, close to the money-privacy line; _did card at 0.80, the heaviest weight, so a flat prompt costs the most signal_ | 2 |
| 11 | C3-123 | scenario | 3 Love and your person | A progress bar floats over you and your person: 30%, one pixel a month. Beside it, a button: "Skip to 80%." It skips everything in between. | **WEAK_ABSURD**: a relationship progress bar is abstract; **CONFUSING**: what is 80%?; **GENERIC**: no behavior a player recognizes | 2 |
| 12 | C1-1 | role | 1 Your phone | Flight canceled. 140 stranded strangers, one airline desk, and 12 hotel vouchers. In that crowd, you're the... | **ADULT_DEFAULT**: "The family with the baby gets one first" is the good-person pick; **STIFF**: role labels "Name drawer", "Advocate"; **GENERIC**: a moral test, not a micro-behavior | 2 |
| 13 | C6-162 | real | 6 Family and home | One slice of the family's famous pie left, five relatives eyeing it. Think of the last time. Who got it? | **GENERIC**: few people remember a last-slice decision; **AGENCY**: answers assume you handed out the pie; **STIFF**: "Strict order: whoever hadn't had a slice yet. Me included." | 2 |
| 14 | C4-82 | others | 4 Money and treats | Lateness costs $10 in your friend group, paid into the vacation pot. Mo works a second job for rent and is late weekly. Jae: fines are fines. Your take? | **CONFUSING**: three names, a fine, a pot and a second job in 27 words; **ADULT_DEFAULT**: "Waive it" is the kind pick; **MUSH**: option 3 "next year, we rewrite the rule" is a committee answer | 2 |
| 15 | C6-125 | reply | 6 Family and home | You moved out three months ago. Your parent misses you. | **WEAK_ABSURD**: shrink-ray parent in your pocket; a parent wanting into your new life needs no ray | 2 |
| 16 | C7-143 | scenario | 7 Play, rules and you | Every list, note and calendar entry you write vanishes the moment you finish it. You're running your best friend's surprise party: 40 guests, three weeks. | **WEAK_ABSURD**: vanishing lists; **CONFUSING**: vanishing lists plus a 40-guest surprise party | 2 |
| 17 | C6-161 | others | 6 Family and home | Your town made your friend's anniversary an official holiday: parade, fireworks, day off. Your friend and their person plan to spend it alone, blinds down. Your take? | **WEAK_ABSURD**: a town holiday for a friend's anniversary; **CONFUSING**: judging a friend's quiet anniversary through a parade | 2 |
| 18 | C3-140 | this_or_that | 3 Love and your person | Your person's shadow came home from their weekend away an hour before they did. It's on your couch, happy to tell you everything they did. | **CONFUSING**: a shadow arrives early and narrates your person's weekend; the snooping instinct is buried; **WEAK_ABSURD**: shadow | 2 |
| 19 | C7-111 | others | 7 Play, rules and you | An ash cloud grounds every flight. Four days in a hostel with nine strangers. One tapes a full group schedule to the fridge. Gut reaction? | **CONFUSING**: ash cloud, hostel, nine strangers and a fridge schedule; **GENERIC**: no recognizable behavior | 2 |
| 20 | C4-123 | scenario | 4 Money and treats | Knock, knock. A polite tornado apologizes: tonight it blows away everything you own, except one thing you pick. Your reaction? | **WEAK_ABSURD**: polite tornado; **CONFUSING**: answers mix what you keep with how you feel | 2 |
| 21 | X-L2-40 | rank | Extras | Anything you hang on one wall of your home stays there forever, and every guest sees it. Rank what you'd hang, first to last. | **WEAK_ABSURD**: a forever wall; **CONFUSING**: a hammock on a wall ranked against trophies | 2 |
| 22 | C2-145 | real | 2 Friends | Last big good news from a friend: a new job, a new place, an acceptance. What did you do first? | **GENERIC**: every option is a nice reaction; no sting (the real one is the half-second pang) | 2 |
| 23 | C7-121 | scenario | 7 Play, rules and you | Tiny gnomes need help rebuilding their village: every Saturday for a year. They pay in pastries. | **WEAK_ABSURD**: gnome village; **GENERIC**: a volunteering poll | 2 |
| 24 | C4-125 | scenario | 4 Money and treats | You and a friend dig up a pirate chest. You did all the digging. They had the map, from a thrift-store book. | **WEAK_ABSURD**: pirate chest; the real instinct (who did the work on a joint side hustle) is sharper | 2 |
| 25 | C4-161 | others | 4 Money and treats | One $100 bill a week grows on your friend's new money tree. They pick each one the minute it appears and spend it by dinner. First thought? | **WEAK_ABSURD**: money tree; **GENERIC**: no real behavior | 2 |
| 26 | C3-141 | this_or_that | 3 Love and your person | Your city wants a statue of you in the main square. Catch: you pose every weekend for a year, and your person hates weekends apart. | **WEAK_ABSURD**: a city statue is fame nobody relates to; **GENERIC**: career win versus weekends, no specific behavior | 2 |
| 27 | X-R2-31 | eyes | Extras | Screaming match at the bowling league finale. The mediator asks your best friend how you act in a group fight. | **CONFUSING**: bowling league mediator; **GENERIC**: four ways of handling a fight, no scene | 2 |
| 28 | C1-161 | others | 1 Your phone | Your friend's flea-market mirror answers "How do I look?" out loud. On date night it said "Not that shirt," and their date heard. They're keeping the mirror. Your take? | **CONFUSING**: three beats (mirror talks, date heard, they keep it) before the ask; **WEAK_ABSURD**: talking mirror; **OFFBRAND**: a mirror that judges your looks out loud sits too close to the World Mirror, which should never read as a critic; **SAME_AS**: C6-91 and C2-120: honesty about a friend in front of others; _cut or merge candidate_ | 2 |
| 29 | C1-162 | others | 1 Your phone | Every Sunday, Dani and their person read each other's journals aloud. Every page, no skipping. Dani calls it the best hour of the week. Honest reaction? | **GENERIC**: few 20 to 35 year olds keep journals; the real behavior is phone passcodes; **STIFF**: "Love has no locked drawers"; **SAME_AS**: C1-90: same sub-question, same privacy premise; _cut or merge candidate_ | 2 |
| 30 | C2-161 | others | 2 Friends | Your friend can now delete one memory a year. They deleted the time their sibling sold their guitar and lied about it. Now they're close again. Your take? | **CONFUSING**: a friend deletes a memory of a sibling's betrayal and you judge it; **WEAK_ABSURD**: memory deletion; **SAME_AS**: C2-132: forgiveness of someone who hurt you; _cut or merge candidate_ | 2 |
| 31 | C1-91 | this_or_that | 1 Your phone | There's a ghost poet in your laptop. It offers to write your farewell toast for your best friend. Tears guaranteed. | **SAME_AS**: C1-131: someone else writes your big words; **WEAK_ABSURD**: the ghost poet adds nothing the AI card does not already say; _cut or merge candidate_ | 2 |
| 32 | C2-126 | this_or_that | 2 Friends | Your friend's closet door now opens somewhere random on Earth, back by Sunday. They leave in an hour, with room for you. You had a perfect weekend planned. | **SAME_AS**: C1-132: sure thing versus unknown; **WEAK_ABSURD**: the magic door replaces a real text ("flight at 10, you in?"); _cut or merge candidate_ | 2 |
| 33 | C1-132 | scenario | 1 Your phone | A new app called Probably Better has one button: swap your job, city and apartment for ones it picked, sight unseen. Your life right now is good. | **GENERIC**: swap a good life for an unknown one is a stock hypothetical; **ADULT_DEFAULT**: "Good took me years to build"; **SAME_AS**: C2-126, C5-120, S-110: known good versus a gamble; _cut or merge candidate_ | 2 |
| 34 | C4-145 | this_or_that | 4 Money and treats | One night in the only hotel on the Moon. Tonight. Price: your entire savings. | **GENERIC**: stock hypothetical; **SAME_AS**: C4-143: same sub-question; _cut or merge candidate_ | 2 |
| 35 | C7-142 | this_or_that | 7 Play, rules and you | Pick one travel rule for life: every vacation goes to the town you already love, or wherever a spinning globe lands. | **GENERIC**: same town versus a globe spin; **SAME_AS**: C7-140: same sub-question; _cut or merge candidate_ | 2 |
| 36 | C6-160 | this_or_that | 6 Family and home | A board game turns up on your doorstep: your life with your person, square by square. Move in, ring, wedding, house, in order. Or a blank board. | **GENERIC**: abstract board game; **SAME_AS**: X-R3-50, C3-124: classic script on the same sub-question | 2 |
| 37 | X-R3-50 | this_or_that | Extras | A ring falls from the sky, engraved with your name and your person's. Does one of you kneel, the classic way, or do you just hand it over at breakfast? | **WEAK_ABSURD**: a ring falls from the sky; **SAME_AS**: C6-160 and S-128: proposal script | 2 |
| 38 | C5-1 | this_or_that | 5 Work, school and ambition | One bite of a never-wrong fortune cookie and you'll know your whole career: every job, every title, how it ends. | **GENERIC**: stock "know your future" hypothetical | 2 |
| 39 | C5-123 | scenario | 5 Work, school and ambition | You're a TA. Late essays get zero. This one's four minutes late, from the student who rated your class 'mid.' Only you see the timestamp. | **GENERIC**: asks everyone to be a TA; most will tap Not my life | 2 |
| 40 | C5-160 | eyes | 5 Work, school and ambition | Famous perfumer, one offer: a seven-year apprenticeship before you make your first perfume. Your best friend gets the reference call. What do they say? | **GENERIC**: seven-year perfume apprenticeship; four-step ladder | 2 |
| 41 | C7-112 | scenario | 7 Play, rules and you | You referee a kitten soccer final. The tiniest kitten keeps carrying the ball in its mouth. The crowd adores it; the other bench doesn't. | **WEAK_ABSURD**: kitten soccer is cute with no social instinct | 2 |
| 42 | C7-161 | this_or_that | 7 Play, rules and you | The ceremony: four hours, a $90 gown, your whole family in the stands. Or the diploma just arrives by mail. Your degree is done. | **GENERIC**: walk the stage or mail the diploma is a stock poll | 2 |
| 43 | C2-129 | eyes | 2 Friends | A sphinx blocks the road: your best friend gets one true line about you, or you both turn to stone. They say: | **WEAK_ABSURD**: the sphinx is decoration on a plain friend's-eye card | 2 |
| 44 | X-R1-40 | pick_two | Extras | Overnight, your friend group's moods get linked: when one of you has a bad day, all six feel it. Pick the two thoughts most like yours. | **WEAK_ABSURD**: linked moods | 2 |
| 45 | X-R3-30 | scenario | Extras | Your new town's 200-year tradition: every newcomer rings the old bell at the fair, dressed as a lobster. You just moved in. The fair is Saturday. | **WEAK_ABSURD**: lobster costume tradition is whimsy (tagged unusual) | 2 |
| 46 | X-L2-30 | scenario | Extras | Years ago you posted a story online. Now a publisher wants it as a book: finished manuscript in six months, every evening and weekend until then. | **GENERIC**: book deal from an old post | 2 |
| 47 | C2-80 | scenario | 2 Friends | An 8-ball that has never once been wrong says Jules's crush will say no. Jules confesses in five minutes, in front of everyone. | **WEAK_ABSURD**: the 8-ball only removes doubt; the real version (you know the crush is taken) is sharper; **MUSH**: option 4 "Float 'maybe not in front of everyone?' and stop there" is the hedge | 3 |
| 48 | C3-142 | real | 3 Love and your person | Round three of the same fight with someone close: a partner, roommate or friend. The last time it happened, your move? | **ADULT_DEFAULT**: "Said sorry first. Some things matter more than winning."; **STIFF**: "Called a proper sit-down. Brought a new idea." | 3 |
| 49 | C4-102 | scenario | 4 Money and treats | A signed test pressing of your favorite album: one of twelve in the world, $900. The same album streams free. | **GENERIC**: niche collector purchase; **SAME_AS**: C4-5: same sub-question, pricier version | 3 |
| 50 | C1-123 | scenario | 1 Your phone | Overnight, a billboard goes up outside your window ranking you and your eight closest friends by how well life is going. You're seventh. | **ADULT_DEFAULT**: "Close the curtains. My life isn't a leaderboard." is the mature exit most people tap | 3 |
| 51 | C1-124 | scenario | 1 Your phone | Every friendship you have is now a houseplant on your windowsill. They wilt when nobody texts. Your oldest friend's is brown. | **WEAK_ABSURD**: the plant decorates a real moment (the friend you haven't texted since March) that lands harder plain | 3 |
| 52 | C1-143 | receipts | 1 Your phone | Think of the last party you went to. Tap what actually happened: | **GENERIC**: party receipts with low spice; only the Irish-exit line has bite | 3 |
| 53 | C1-146 | scenario | 1 Your phone | Slid under your door: a note from the neighbor you've nodded at for two years. "Want to be actual friends?" | **GENERIC**: sweet, no sting; nobody screenshots a neighbor's note | 3 |
| 54 | C1-147 | pick_two | 1 Your phone | A tiny AI moves into your ear for a week, rent-free. It knows everything and never judges. Something's eating at you. Pick two. | **WEAK_ABSURD**: an AI in your ear is weaker than the real thing (you told a chatbot what you never told a friend) | 3 |
| 55 | C1-163 | eyes | 1 Your phone | Someone new wants into your friend group. Your best friend gives them one honest tip about you. Which one? | **GENERIC**: two pairs of the same line at two strengths | 3 |
| 56 | C1-90 | this_or_that | 1 Your phone | A phone from a street stall: never cracks, never dies. The seller's one rule? It can never, ever be locked. | **SAME_AS**: C1-162: phone privacy; _"Keep my cracked one at 9%" is a strong line_ | 3 |
| 57 | C2-120 | scenario | 2 Friends | Stand-up debut, tonight: your roommate quit their job for this. They run the whole set for you. Only the landlord joke gets a laugh. | **SAME_AS**: golden-set "friend's song" and S-91: honest feedback on a friend's creative work; _answers are one honesty ladder_ | 3 |
| 58 | C2-127 | role | 2 Friends | Haunted mansion, one night, your whole crew. Something upstairs just knocked twice. In this crew, you're the... | **GENERIC**: haunted-house archetypes; answers 4 and 5 both carry the same pole | 3 |
| 59 | C2-141 | reply | 2 Friends | Your friends want all six of you in one big house. | **GENERIC**: answers are a four-step ladder from yes to no | 3 |
| 60 | C2-144 | real | 2 Friends | The last time a friend asked to borrow something you'd rather not lend: your car, the good jacket. What happened? | **STIFF**: "The rule doesn't apply to them" refers to a rule never stated | 3 |
| 61 | C2-162 | bet | 2 Friends | I bet you've quietly judged a birthday with no cake, no candles and no song. | **GENERIC**: a bet about judging a cakeless birthday is thin | 3 |
| 62 | C3-124 | scenario | 3 Love and your person | Ding-dong. Your talking doorbell greets every guest with your person's last name, never yours. You get one chance to change its greeting. | **CONFUSING**: a talking doorbell stands in for the real last-name question | 3 |
| 63 | C3-160 | others | 3 Love and your person | Mina ended a three-year relationship by mailing back every borrowed book. One sticky note inside: "Thanks for everything. Take care." First thought? | **MUSH**: option 3 "Fine, but a two-minute talk at the door was owed" splits the difference with option 1 | 3 |
| 64 | C4-124 | scenario | 4 Money and treats | New housemate: a mermaid with a sunken ship's worth of gold, while you live on a normal paycheck. They want rent split exactly fifty-fifty. | **WEAK_ABSURD**: the mermaid hides a real fight (the roommate whose parents pay their rent) | 3 |
| 65 | C4-127 | reply | 4 Money and treats | Dev's cat started talking last week. Two million followers already. | **WEAK_ABSURD**: talking cat stands in for a friend's startup ask (mild); _answers are a ladder of how much_ | 3 |
| 66 | C4-144 | role | 4 Money and treats | $6,000 trivia win, one shared prize: the group wants to blow it on one trip together. In this crew, you're the... | **GENERIC**: role lines are plain | 3 |
| 67 | C4-53 | this_or_that | 4 Money and treats | First date, your idea: a hot-air balloon ride. On landing, the pilot hands you the bill. $640. | **WEAK_ABSURD**: tagged absurd but it is a first-date bill; the balloon makes $640 odd | 3 |
| 68 | C5-120 | scenario | 5 Work, school and ambition | Your company offers a full year's pay to anyone who quits this week. You like your job. Half your team is already clearing their desks. | **STIFF**: "ask HR to call me if there's a second round" | 3 |
| 69 | C5-126 | others | 5 Work, school and ambition | Gary the snail has lost six races in a row. Your roommate quit a steady job to race it for prize money. Rent's due in two weeks. Honest take? | **WEAK_ABSURD**: snail racing (mild); _saved by "Is Gary covering their half of rent?"_ | 3 |
| 70 | C5-140 | scenario | 5 Work, school and ambition | Eight days a week now, but only for you. Nobody at work knows the extra one exists. | **GENERIC**: eighth-day hypothetical | 3 |
| 71 | C6-143 | scenario | 6 Family and home | The local paper wants your love story on its front page Sunday, photos included. Your person already said yes. They need your answer tonight. | **GENERIC**: a local paper front page is rare and flat (mild) | 3 |
| 72 | X-L3-31 | role | Extras | Escape room, eight minutes left. On a shelf: an envelope marked "STAFF ONLY: ALL ANSWERS." The camera faces the wall. Your role in the crew? | **MUSH**: "Negotiator: we only peek if we're truly stuck" is the hedge; _fun premise_ | 3 |
| 73 | C2-100 | scenario | 2 Friends | Next door, a new shop fixes any friendship, but both people stay locked in until it's done. Your old best friend just booked you both. | _"Page one: them" earns it_ | 3 |
| 74 | C2-125 | this_or_that | 2 Friends | Your best friend now has a brass bell: one ring when they need you, and you appear. Even mid-nap. You can break it today only. | _grounded in the friend who always needs you_ | 3 |
| 75 | C2-146 | receipts | 2 Friends | A friend's last rough week. Tap everything you actually did: | _"Muted them for a night" is honest_ | 3 |
| 76 | C2-160 | scenario | 2 Friends | Every word you say out loud now costs $5. Your best friend has the biggest presentation of their life in an hour, and they're shaking. | _grounded absurd; "One thumbs up, then I quietly fix their slides" lands_ | 3 |
| 77 | C3-145 | role | 3 Love and your person | Four couples, one rented cabin, one long weekend. By Sunday, which one were you? | _relatable cabin roles_ | 3 |
| 78 | C3-147 | real | 3 Love and your person | Most recent weekend your person had plans without you: how did you spend yours? | _fine, low spice_ | 3 |
| 79 | C3-148 | receipts | 3 Love and your person | Love, lately: which of these happened this month? Tap every one. | _"a friend they've never met, and like it that way"_ | 3 |
| 80 | C3-161 | reply | 3 Love and your person | A farm sanctuary baby goat won't leave your person's side. | _odd but specific_ | 3 |
| 81 | C3-80 | scenario | 3 Love and your person | A street tailor knits you and your person one sweater with two necks. It only comes off when one of you asks. They won't be the one. | _strong image; answers 2 and 3 are one ladder_ | 3 |
| 82 | C3-91 | scenario | 3 Love and your person | Elevator stuck between floors 14 and 15. Two hours so far. Your ex uses the time to apologize. Properly. | _stock elevator-with-ex trope, saved by "Keep them muted"_ | 3 |
| 83 | C4-160 | bet | 4 Money and treats | Admit it: you've spent a whole weekend on a project mostly to post the "done" photo. | _fine_ | 3 |
| 84 | C5-128 | real | 5 Work, school and ambition | The last time friends invited you out on a night you'd saved for your big project. What won? | _fine_ | 3 |
| 85 | C5-129 | bet | 5 Work, school and ambition | Confession time: you've said yes to one job or school offer while secretly hoping another would call. | _fine_ | 3 |
| 86 | C6-122 | scenario | 6 Family and home | In your hallway, the family portrait now frowns at any choice your family wouldn't make. Guests see it. You just said yes to a cross-country move. | _"Hang it in the guest bathroom"_ | 3 |
| 87 | C6-141 | pick_two | 6 Family and home | A home-makeover show bought the house you grew up in. They gut it on TV next week, but your family gets one last day inside. Pick two. | _fine_ | 3 |
| 88 | C6-148 | receipts | 6 Family and home | In your home these days: tap every line that's happened. | _"heard my parent's voice"_ | 3 |
| 89 | C6-82 | reply | 6 Family and home | Your grandparent left you the house. Your cousin texts. | _fine_ | 3 |
| 90 | C7-134 | scenario | 7 Play, rules and you | A perfect clone of you arrives in the mail. It can go to every plan your friend group votes for, in your place. Nobody could tell. | _grounded in wanting to skip plans_ | 3 |
| 91 | C7-135 | reply | 7 Play, rules and you | You and everyone in your neighborhood hero chat can fly. | _grounded in "who's closest?"_ | 3 |
| 92 | C7-144 | receipts | 7 Play, rules and you | Your month in lists and plans. Tap all that apply: | _"Guessed how much money I had and was way off"_ | 3 |
| 93 | C7-146 | pick_two | 7 Play, rules and you | An hour before a 200-person show, your friend's band loses its bassist. You've played bass twice, at parties. They're begging. Pick your two first thoughts. | _fine_ | 3 |
| 94 | C7-148 | real | 7 Play, rules and you | Last trip away with friends, a few nights at least. What did your mornings actually look like? | _fine_ | 3 |
| 95 | C7-41 | scenario | 7 Play, rules and you | Charity poker night: you and your oldest friend share one stack of chips for a trip for two. You just saw them slide an ace from their sleeve. | _loyalty versus rules, fine_ | 3 |
| 96 | X-L1-30 | scenario | Extras | An airport sells unclaimed suitcases, sealed, $300 each. One is humming softly. Another has a first-class sticker. You have exactly $300. | _fun; unclaimed luggage auctions are real_ | 3 |
| 97 | X-R1-30 | scenario | Extras | Two years of saving for your first solo trip: three weeks, one backpack. Your sibling asks to come. They already requested the time off. | _fine_ | 3 |
| 98 | C1-140 | bet | 1 Your phone | Prove me wrong: there's a friend you've stopped inviting, just to see if they'll ever invite you. | **ADULT_DEFAULT**: "I invite whoever I miss" is the healthy pick, and options 3 and 4 say the same thing; **STIFF**: option 4 "No test. Whose turn is it? No idea." is three fragments | 4 |
| 99 | C2-50 | bet | 2 Friends | Be honest: a friend's big plan flopped in public, and part of you felt relieved. | **MUSH**: option 4 "I don't track their plans closely enough to feel anything" is an exit dressed as an answer; _the unsaid: relief when a friend flops_ | 4 |
| 100 | C4-141 | bet | 4 Money and treats | Be honest: you've said "must be nice" about someone else's big win. | **ADULT_DEFAULT**: "If they got there, they did the work." is the gracious default (mild) | 4 |
| 101 | C1-125 | scenario | 1 Your phone | Every holiday for 25 years, your family takes the same photo on the same stairs. This year you're abroad. They want you photoshopped in. | _specific family ritual, funny_ | 4 |
| 102 | C1-127 | reply | 1 Your phone | Four months dating Sam. Your parent adds Sam to the family group chat, asking neither of you. | _real cringe: a parent adds the new partner to the family chat_ | 4 |
| 103 | C1-131 | real | 1 Your phone | Breakups, resignations, real apologies: think of your most recent big message. Who actually wrote it? | _timely and slightly embarrassing; the stronger half of the C1-91 pair_ | 4 |
| 104 | C1-141 | bet | 1 Your phone | Genii bets you've deleted a post because it didn't get enough likes. | _real and a little embarrassing; options 3 and 4 both mean "I don't care about likes"_ | 4 |
| 105 | C1-142 | bet | 1 Your phone | Calling it: at least one person can see your live location right now. | _real, specific, slightly exposing_ | 4 |
| 106 | C1-144 | real | 1 Your phone | The last time someone scrolled their phone while you were telling them something. How did you handle it? | _real micro-behavior; "Take your time. I'll wait." lands_ | 4 |
| 107 | C1-160 | bet | 1 Your phone | Genii's hunch: you've waited for the walk signal with zero cars in sight, while everyone else crossed. | _"Only when a kid's watching" is the screenshot line_ | 4 |
| 108 | C2-121 | scenario | 2 Friends | Time capsule, opened in front of the whole friend group. Your note: "By now I'll run my own company." You don't. Everyone's reading theirs aloud. | _specific and embarrassing_ | 4 |
| 109 | C2-124 | others | 2 Friends | Drive-through chapel, no party, no speeches, ever: that's how your closest friend just got married. They told everyone after. First thought? | _"Robbed. I've had a dance routine ready for years."_ | 4 |
| 110 | C2-132 | bet | 2 Friends | Genii's guess: someone you swore you'd never speak to again is back in your life. | _"On probation forever"_ | 4 |
| 111 | C2-143 | bet | 2 Friends | Confession time: you've heard what others say about a friend behind their back, and never told them. | _spicy and real_ | 4 |
| 112 | C2-41 | reply | 2 Friends | Riley's building bans pets. Riley's pig, Biscuit, is very large. | _"Biscuit is YOUR pig" is screenshot material_ | 4 |
| 113 | C3-101 | reply | 3 Love and your person | Chess club has been your one night alone for three years. Then your person texts. | _"they just voted me president??"_ | 4 |
| 114 | C3-120 | scenario | 3 Love and your person | $5 at the mall vending machine buys a Clean Break: whoever you pick forgets the whole situationship and just remembers you fondly. Yours is fizzling. | _grounded absurd; "Buy two" lands_ | 4 |
| 115 | C3-162 | bet | 3 Love and your person | Genii suspects you've already picked a name for a kid you don't have. | _real and slightly exposing_ | 4 |
| 116 | C3-163 | others | 3 Love and your person | Three months dating a jazz drummer, and your friend owns a hi-hat, quit their book club, and says "we" about every gig. Your read? | _"says 'we' about every gig"_ | 4 |
| 117 | C4-126 | reply | 4 Money and treats | At your person's grandparents' 60th anniversary, one of them stands and shares the secret: "One bank account. Never two." Then a text from across the table. | _"one small account nobody needs to know about"_ | 4 |
| 118 | C4-140 | receipts | 4 Money and treats | Money between friends, this year. Tap each one you've done: | _"payment request for under $10"_ | 4 |
| 119 | C4-143 | real | 4 Money and treats | Friends planned a trip that was a stretch for your budget. The most recent time, how did you handle it? | _real and relatable_ | 4 |
| 120 | C4-2 | this_or_that | 4 Money and treats | A stranger left your friend a castle. They turned it into a hotel, and now they sell a course called "Built From Nothing." | _"Built From Nothing" is sharp satire_ | 4 |
| 121 | C4-5 | real | 4 Money and treats | The pricier version of something you already own plenty of: sneakers, plushies, hoodies, skins. The last time you wanted it, how did it end? | _"hid the bag for a few days"_ | 4 |
| 122 | C5-110 | reply | 5 Work, school and ambition | You quit your job for a food truck. Your cousin posted it before your Sunday reveal. | _"Heart the message. Keep painting the truck."_ | 4 |
| 123 | C5-121 | scenario | 5 Work, school and ambition | The office dog just got the manager job you applied for. It's your boss now. The whole team is thrilled. | _grounded absurd; losing a promotion to the office dog_ | 4 |
| 124 | C5-124 | reply | 5 Work, school and ambition | Wrong number: the CEO meant to text their assistant. Company rule: leaks get you fired. Your closest work friend is on the design team. | _spicy and plausible_ | 4 |
| 125 | C5-125 | others | 5 Work, school and ambition | Three minutes flat: that's how fast your teammate answered the CEO's email. From their honeymoon. A week later, they got the promotion. First thought? | _"Now we're all expected to do that. Cool."_ | 4 |
| 126 | C5-144 | real | 5 Work, school and ambition | Last job post you were only half qualified for. Your move? | _real_ | 4 |
| 127 | C5-161 | receipts | 5 Work, school and ambition | This year's decisions. Which of these have you done? Tap them all. | _"Said maybe to see if something better came up"_ | 4 |
| 128 | C6-127 | real | 6 Family and home | "Can you help me with something this weekend?" The last time a relative asked you for a big favor, how did you answer? | _"Yes, and I lied that I was free"_ | 4 |
| 129 | C6-146 | real | 6 Family and home | Most recent time you started seeing someone. How did people find out? | _real; would gain a soft-launch option (a hand in a photo)_ | 4 |
| 130 | C6-147 | bet | 6 Family and home | Be honest: you've cut the price tag off something big before a family visit, so nobody would ask. | _real and a little shameful_ | 4 |
| 131 | C6-91 | others | 6 Family and home | At the wedding, the couple asked for honest toasts. Their best friend, meaning every word: "I give it two years. Prove me wrong." Your verdict? | _"I give it two years"_ | 4 |
| 132 | C7-120 | bet | 7 Play, rules and you | Bet you've read a game's rulebook out loud mid-game, just to win an argument. | _"Page 12. I had it bookmarked."_ | 4 |
| 133 | C7-140 | bet | 7 Play, rules and you | I bet a café or takeout spot has greeted you with "the usual?" before you said a word. | _"the usual?"_ | 4 |
| 134 | C7-149 | real | 7 Play, rules and you | Forty minutes late, no warning. The most recent friend who did that to you: how did you greet them? | _"no worries!" meant about half_ | 4 |
| 135 | C7-160 | real | 7 Play, rules and you | Someone asked a room for a volunteer, and the room went silent. The most recent time, who broke it? | _real micro-behavior_ | 4 |
| 136 | C7-162 | others | 7 Play, rules and you | Ari and Noor, married four years, sleep in separate bedrooms. By choice. They say it saved the marriage. Honest reaction? | _sleep divorce, argued about everywhere_ | 4 |
| 137 | C7-7 | reply | 7 Play, rules and you | You're reselling your concert ticket at face value. Two texts, a minute apart: | _real and spicy_ | 4 |
| 138 | X-L3-30 | scenario | Extras | One sacred rule in your friend group: nobody dates anyone's ex. Your best friend just matched with yours, and asks you before going further. | _friend matched with your ex_ | 4 |
| 139 | X-R2-30 | scenario | Extras | Costume contest, $1,000 prize. Your friend is winning, dressed as you. The wig is wrong. The laugh is worse. The crowd loves it. | _"The laugh is worse"_ | 4 |
| 140 | C3-81 | bet | 3 Love and your person | Genii's sure: you've rehearsed a whole fight with your person in the shower. Then what? | _universal and embarrassing_ | 5 |
| 141 | C4-30 | scenario | 4 Money and treats | Kai still owes you $400. Today Kai's fundraiser link lands in everyone's inbox: "Help me celebrate my birthday in Lisbon!!" | _best card in the bank on this lens_ | 5 |
| 142 | C5-91 | bet | 5 Work, school and ambition | Hunch: your phone holds a screenshot of something a coworker said. Not to share. Just in case. | _a real, slightly shameful habit_ | 5 |
| 143 | C6-120 | scenario | 6 Family and home | "Two weeks," your sibling said. It's month five on your air mattress, and they just bought it a fitted sheet. | _"they just bought it a fitted sheet"_ | 5 |

## Not eligible for batches: sealed and feeling cards

**Sealed (24).** Never scored, so they are outside the rewrite batches, but they share the bank's habits. Scores on the same 1 to 5 test:

| Id | Prompt | Note | Score |
|---|---|---|---|
| S-134 | 10,000 mosaic tiles, and you're the one placing them for a museum. Nobody sees the full picture until the last tile goes in. | GENERIC, WEAK: 10,000 museum tiles | 1 |
| S-110 | On your pillow, a contract: your job, home and people stay exactly as they are for five years. Good, guaranteed, no surprises. Sign any part, any time. | GENERIC; SAME_AS C1-132 | 2 |
| S-120 | Co-owners, forever: your best friend wants to buy a small sailboat with you. Both names on the hull. Alternating weekends, shared repair bills. | GENERIC: co-owning a sailboat | 2 |
| S-121 | New curse: every time something happens to you, a tiny rain cloud follows you until your person hears about it. You just won a photo contest. | WEAK_ABSURD: rain-cloud curse | 2 |
| S-130 | At a friend's barbecue, a famous chef tastes your cooking and offers you a job in their kitchen. Catch: quit yours by Friday. No trial. | GENERIC: famous chef offer | 2 |
| S-135 | Street talent show, $500 prize, and you're the only judge. Best act by far: a touring juggler. Second: a neighbor who needs the money for rent. Who wins? | ADULT_DEFAULT: rent beats ribbons | 2 |
| S-141 | Game show, final round: walk away with $20,000, or answer one question for $100,000 and lose it all if wrong. The topic: one you half know. | GENERIC: game-show gamble | 2 |
| S-142 | Neighborhood garden contest, winner's photo in the paper. You're in second. First place means weeding every evening until August. | GENERIC: garden contest; "headlamp" contains the banned word lamp (whole-word check passes) | 2 |
| S-143 | Superhero code, rule one: never use your powers for personal favors. Your best friend's new couch is wedged in their stairwell. You can lift trucks. | WEAK_ABSURD: superhero code | 2 |
| S-90 | Six months alone keeping a lighthouse. The rule: log the weather every three hours. You slept through one reading. Nobody will ever check. | GENERIC: lighthouse log | 2 |
| S-101 | Two weeks away next spring, booked by your best friend. They'll tell you everything now, or nothing until the airport. You choose. | fine | 3 |
| S-122 | Seven to one: your friend group votes for a five-day silent retreat in the mountains. No talking at all. You were the one. | fine | 3 |
| S-123 | You and your person share a birthday. They've already booked one joint party for 80 people: both names on the banner, every friend invited. | fine | 3 |
| S-124 | New phrase from the neighbor's parrot: your name, then "never pays anyone back." You always pay people back. | fine | 3 |
| S-125 | Murder mystery party, $200 prize pot. You've worked out that the host rigged the clues so the host wins. Twelve guests are still guessing. | fine | 3 |
| S-128 | The stadium kiss cam lands on you and your person. Someone behind you unrolls a banner: "PROPOSE!" Forty thousand people start chanting. | SAME_AS X-R3-50: proposal script | 3 |
| S-129 | Month-long visit: your person's parent relabels every shelf in your home to match their own. Printed labels. Laminated. | fine | 3 |
| S-131 | A friend of a friend invites you into a club with no name. Members can't say what it does. The invite expires tonight. | fine | 3 |
| S-132 | For years, an old classmate has hit every milestone just before you: job, apartment, first car. Your new job starts Monday. They just announced theirs. | relatable | 3 |
| S-140 | Ten years running: same cabin, same weekend, same broken karaoke machine. Two friends want a city trip instead. The vote's tied, and yours decides. | MUSH: "City this year, cabin next. We alternate." is an escape hatch | 3 |
| S-160 | Watch-party rule among your friends: spoil a finale, lose your seat forever. Your oldest friend just read the ending aloud from a headline. By accident. | fine | 3 |
| S-91 | Your friend's first music video went viral: 4,000 comments, most of them brutal. They hand you their phone: "What are people saying?" | SAME_AS C2-120: honest feedback on a friend's work | 3 |
| S-111 | Accepted: a dream program on the other side of the world. Before you've even said yes, your family books a video call. Its title? "Discussion." | "Its title? 'Discussion.'" is great | 4 |
| S-126 | A single friend shows you a dating profile. It's your best friend's person, active an hour ago. Your best friend is booking them a surprise trip. | spicy and real | 4 |

**Feeling (7):** C1-133, C2-122, C3-129, C4-129, C5-122, C6-144, C7-131. Each asks "which feeling came first?" right after a card. That is the one thing the advisor lens rules out ("never ask did this make you anxious"): the situation should carry the feeling, not a follow-up question. They carry no evidence (weight 0) and are research-only. **Decision for Jerry:** keep them as research probes, or cut them from the player run. Wording is otherwise fine; C3-129 and C7-131 have no `sq`.
