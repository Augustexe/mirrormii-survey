# BATCH-01: ten cards for Jerry

Package A1, 2026-09-30. The 10 worst scored cards from [CARD-AUDIT.md](CARD-AUDIT.md), each with one proposed rewrite. **Nothing is applied.** No bank, cards.json, library or app file was touched; cards were read from survey git HEAD `9772a94` (cards.json as of `4eb53c8`).

**How to answer in chat:** one line per card, for example `1 yes, 2 no, 3 yes but change option 2 to ...`. Only the cards you approve get written into the bank, re-merged, checked and re-locked.

**Rules held on every proposal:** same sub-question, same type, same option count and order; option N keeps option N's evidence exactly (axes and tags listed under each card); no em dashes; gender-neutral; no genie, lamp or wish; nothing asks the player to open an app or private data; both voices mean the same thing. Answer lines checked against the whole bank for repeats; new props (voice note, recruiter, van, meeting room) appear nowhere else.

## One decision first: the world tag

8 of the 10 proposals move from an absurd world to an unusual one, because the advisor lens wants real friction, not magic props. Two effects:

- **Evidence weight goes up.** Absurd cards are capped at 0.35; as unusual they take their format's weight (0.55 scenario and reply, 0.45 this-or-that and rank). Axes and tags stay the same.
- **The bank mix shifts.** Absurd goes from 61 of 174 (35%) to 53 of 174 (30%), against your rule 18 target of about 40%.

Rule 18 also says everyday settings only on did formats. Card 8 (family tech support) sits on that line: I tagged it unusual for twelve requests in a week; you may see it as everyday. If you approve these, the question under it is whether rule 18 should allow everyday settings on any format when the card is built on a specific micro-behavior. That is pattern 3 in the audit.

## 1. C5-141 (Chapter 5, Work, school and ambition, scenario)

**Measures:** When the person who asked first and the person who needs it most collide, who gets it?

**Now**

> New job: you decide the town's weather. A kite festival booked Saturday's sunshine a year ago. A farmer's crops die without rain that day.

1. The kites booked first, so sunshine.
2. Sunshine. Then I go apologize to the farmer myself.
3. Rain. Crops outrank kites.
4. Rain, then let everyone blame the forecast.

**Proposed**

> You booked the only quiet room two weeks ago, for your own performance review. A coworker is at the door, whispering: "Job interview. Video call. Four minutes. Please."

1. "Booked it two weeks ago. The stairwell has great acoustics."
2. Keep the room. They can take the call in my car. It smells like fries.
3. Hand it over. I'll do my review in the kitchen, next to the microwave.
4. Give it up, then tell my manager the booking system ate it.

_Heart to heart:_ Two weeks ago you booked the only quiet meeting room, for your own performance review. A coworker comes to the door and whispers that they have a job interview by video in four minutes.

1. I booked it two weeks ago, so I send them to the stairwell.
2. I keep the room and hand them my car keys for the call.
3. They take the room, and I have my review in the kitchen, beside the microwave.
4. I give it up and tell my manager the booking system lost it.

- **Evidence:** unchanged, option by option (1 = L3+2, T25A:2; 2 = L3+1, T25A:1; 3 = L3-2, T25B:2; 4 = L3-1, T25B:1).
- **World:** absurd to unusual; weight 0.35 to 0.55 (absurd cap lifted).
- **Why:** Trades a weather-god moral test for a room fight everyone has had; the interview twist means the kind answer also helps them quit, so it stops being the obvious pick.
- **Codex check:** Round 1: current 2, proposed 4; flagged that your own need for the room was never set up, which made handing it over (3) the free pick. Fixed: it is your own performance review, and it moves next to the microwave. Round 2: 2 to 4, no bugs; named 2 (lend your car) as the easy win-win, so I gave it a cost (the car smells like fries).

## 2. C7-147 (Chapter 7, Play, rules and you, rank)

**Measures:** Whose is your free time: yours, or whoever asks?

**Now**

> You wake up able to fix anything by touching it. Rank what you'd do first, top to bottom.

1. Every broken thing on the street, via a sign-up sheet.
2. Whatever my friends have broken, one by one.
3. My old car first, then the rest of my stuff.
4. Fixes by appointment, weekdays only. Weekends are mine.

**Proposed**

> Word got out: you can fix anything by touching it. Forty texts by breakfast. Rank what gets your Saturday, first to last:

1. The building chat: eleven bikes and a dishwasher that screams
2. My friend's laptop, the one they "didn't spill anything on"
3. My own car, finally. It's made the noise since June
4. The couch. Phone off. These hands are closed on weekends

_Heart to heart:_ People have found out that you can fix anything by touching it, and forty messages arrive before breakfast. Put these in order, the way you would most want to spend your Saturday at the top.

1. The building group chat: eleven bikes and a dishwasher that screams.
2. My friend's laptop, which they insist nobody spilled anything on.
3. My own car, at last. It has made that noise since June.
4. The couch. My phone is off, and my hands rest on weekends.

- **Evidence:** unchanged, option by option (1 = T23A:2; 2 = T23A:1; 3 = T23B:1; 4 = T23B:2).
- **World:** absurd, unchanged.
- **Why:** Keeps the power but turns it into the real instinct (being the friend everyone texts when something breaks); the power is now the setup, not the choice.
- **Codex check:** Round 1: 2 to 4; flagged that "Nobody" does not fit "who gets your Saturday". Fixed: "what gets", and item 4 is now the couch. Round 2: 2 to 4, no bugs, no default.

## 3. C6-121 (Chapter 6, Family and home, scenario)

**Measures:** Is fair the same rule for everyone, or what each person needs?

**Now**

> Family curse: every winter, one sibling spends a week as a pumpkin. Swaps are allowed. It's your youngest sibling's turn, the week they move into their first place.

1. Their turn is their turn. No swaps from me.
2. I'll be the pumpkin. Their big week matters more.
3. Their turn. I'll carry them up the new stairs myself.
4. Whoever has the quietest week takes it. Not always me.

**Proposed**

> Family rule: the holiday dinner rotates between siblings. This year it's your youngest sibling's turn. They live in a van.

1. "A rotation is a rotation. I'm bringing a folding chair."
2. I'll host. Nobody's carving anything in a van.
3. Their year. I'll show up early with a card table and extra plates.
4. Whoever has a dining table hosts. That's not automatically me.

_Heart to heart:_ In your family, hosting the holiday dinner rotates between siblings. This year it is your youngest sibling's turn, and they live in a van.

1. The rotation stands. I will bring a folding chair.
2. I host this year instead. A van is no place for that dinner.
3. It stays their turn. I arrive early with a card table and plates.
4. Whoever has a dining table should host, and that is not always me.

- **Evidence:** unchanged, option by option (1 = L3+2, T18B:1; 2 = L3-2, T18A:2; 3 = L3+1, T18A:1; 4 = L3-1, T18B:1).
- **World:** absurd to unusual; weight 0.35 to 0.55.
- **Why:** One beat instead of four (curse, rotation, swap rule, move); the van makes the rules answer funny instead of cruel, so it is no longer a kindness test.
- **Codex check:** Round 1: 2 to 3, no bugs, no default. Round 2: 2 to 3, no bugs; named 4 (whoever has a table) as the sensible pick. Kept: it still says "not me" at a family dinner, which costs something.

## 4. C6-140 (Chapter 6, Family and home, this or that)

**Measures:** When the family you came from and the person you chose both want you, whose claim comes first?

**Now**

> You wake up as a goldfish, for one year. Your parent and your person both show up to take your bowl home. You pick.

1. Back to my parent. They know which little castle I like.
2. My person. The home we're building is my home now.

**Proposed**

> Two surprise plane tickets, same holiday weekend, both nonrefundable. One from your parent: come home. One from your person: just us, somewhere warm.

1. Home. My childhood bedroom still has my name on the door.
2. Somewhere warm with my person. We make our own holidays now.

_Heart to heart:_ Two surprise plane tickets arrive for the same holiday weekend, and neither can be refunded. One is from your parent, to come home. The other is from your person, for a trip somewhere warm, just the two of you.

1. I go home. My old room still has my name on the door.
2. Somewhere warm, with my person. We are making our own holidays now.

- **Evidence:** unchanged, option by option (1 = R3+2, T19B:1; 2 = R3-2, T19A:1).
- **World:** absurd to unusual; weight 0.35 to 0.45; privacy stays intimate.
- **Why:** The most argued holiday question at this age, with no goldfish to decode; both answers disappoint someone you love.
- **Codex check:** Round 1: 2 to 3; flagged that meeting your person's family is itself the classic script, so option 2 no longer fit its evidence (R3-2, T19A). Fixed: your person's ticket is now a trip for two. Round 2: 2 to 3; flagged the heart prompt dropping "somewhere warm". Fixed.

## 5. X-L1-40 (Extras, this or that)

**Measures:** Do you keep a safety net, even when it holds you back?

**Now**

> You're a pro cyclist who never took the training wheels off. Never fallen once. The final is tomorrow, and nobody has ever won with them.

1. The wheels stay. I've never fallen, and won't start now.
2. Off tonight. I didn't come this far to play safe.

**Proposed**

> A year-long job abroad starts in May. Your landlord will hold your apartment, the one with the good light and 2019 rent, if you keep paying the whole time.

1. Keep paying. Nobody walks away from 2019 rent.
2. Hand back the keys. With a way home, I'd use it by month three.

_Heart to heart:_ Your year-long job abroad starts in May. Your landlord will hold your apartment, with its good light and its old rent, if you keep paying for the whole year.

1. I keep paying. Rent like that does not come back.
2. The keys go back. If I had a way home, I would use it within three months.

- **Evidence:** unchanged, option by option (1 = L1+2; 2 = L1-2).
- **World:** absurd to unusual; weight 0.35 to 0.45.
- **Why:** A safety net people really keep; the second answer admits why they would drop it, which is the self-question the training-wheels card never reached.
- **Codex check:** Round 1: 1 to 3; flagged "home by March" against a May start. Fixed: "by month three". Round 2: 2 to 4, no bugs; named 2 as the prudent pick (a year of double rent). Kept: a defensible risk answer is the balance this card lacked.

## 6. C2-142 (Chapter 2, Friends, rank)

**Measures:** Do you show love by doing or by saying?

**Now**

> You slept through helping your best friend move. Rank these apologies, from the one you'd choose first to last:

1. The sky over their new place spells "I'M SO SORRY"
2. Every box unpacked overnight, shelves up, no note
3. A letter from me that glows until they forgive me
4. Me at their door every weekend for a month, toolbox in hand

**Proposed**

> Moving day. You slept through it. Your best friend carried a dresser down five floors with a stranger. Rank your apology, first pick to last:

1. An 11-minute voice note. The groveling starts at minute two
2. Their whole kitchen unpacked while they're at work. No note
3. A handwritten card. One full page, zero jokes
4. Me at their door every Saturday this month, drill in hand

_Heart to heart:_ You slept through your best friend's moving day, and they carried a dresser down five floors with a stranger. Put these apologies in order, your first choice at the top.

1. A voice message eleven minutes long, most of it apologizing.
2. Their whole kitchen, unpacked while they are at work, with no note.
3. A handwritten card, one full page, with no jokes in it.
4. Me at their door every Saturday this month, with a drill.

- **Evidence:** unchanged, option by option (1 = T05B:2; 2 = T05A:2; 3 = T05B:1; 4 = T05A:1).
- **World:** absurd to unusual; weight 0.35 to 0.45.
- **Why:** Keeps the premise, which was already gold, and swaps sky writing and a glowing letter for four real apologies, so the order says something true.
- **Codex check:** Round 1: 2 to 4, no bugs, no default. Round 2: 3 to 5, no bugs, no default.

## 7. C1-126 (Chapter 1, Your phone, reply)

**Measures:** When you can't see how it ends, do you step in or wait for more information?

**Now**

> Your map app: skip your exit. keep driving. 400 miles.
> Your map app: trust me. you'll thank me
>
> Driving to work. Your map app, which has never texted anyone, texts you.

1. "Skipping the exit. Work thinks something came up."
2. "Fine. I'm calling work from the road."
3. "Taking my exit. Text me the destination tonight."
4. "Taking my exit. Not driving 400 miles blind."

**Proposed**

> Your ex's parent: Hi sweetheart! Do you have ten minutes for a call?
> Your ex's parent: Nothing bad!
>
> Two years after the breakup, your ex's parent texts you.

1. "Calling you now!" Dial before I can think.
2. "Of course! Two minutes?" Then pace the kitchen for both.
3. "Hi!! Everything okay?? What's it about?"
4. Don't answer. Send it to the group chat for a ruling first.

_Heart to heart:_ Two years after your breakup, your ex's parent sends you a message.

1. I call right away, before I can think about it.
2. I say yes, ask for two minutes, and pace the kitchen.
3. Before I agree, I ask whether everything is all right, and what it is about.
4. I do not answer yet. My friends see it first and tell me what to do.

- **Evidence:** unchanged, option by option (1 = L1-2; 2 = L1-1; 3 = L1+1; 4 = L1+2).
- **World:** absurd to unusual; weight 0.35 to 0.55.
- **Why:** "Nothing bad!" makes every stomach drop, so the feeling comes from the situation; four different moves replace the old four-step ladder about a talking map app.
- **Codex check:** Round 1: 2 to 4; flagged texting the ex (4) as a poor fit for Steady +2 and 3 as the polite default. Fixed: 4 now sends it to the group chat for a ruling. Round 2: 2 to 4; flagged 3 agreeing to the call before asking (weak for Steady +1) and a heart mismatch on 4. Both fixed. Codex still calls 3 the socially competent default; kept, since 2 and 4 are just as common in real life.

## 8. C6-110 (Chapter 6, Family and home, scenario)

**Measures:** When family needs help, are you the first name they call?

**Now**

> Anything your family loses can now turn up in your mailbox or your sibling's. Everyone picks yours: 23 lost things, 23 calls this week.

1. Return all 23 by Sunday. This is my calling now.
2. Return every one, and bring it up at dinner for a year.
3. Forward half to my sibling. Their mailbox needs practice.
4. Mailbox hours: Sundays, two to four. Lost keys can wait.

**Proposed**

> Twelve family tech requests this week, including a TV that "lost all the channels." Your sibling works in actual IT. Nobody calls them.

1. All twelve fixed by Sunday. The TV was on the wrong input.
2. Fix every one, then invoice the family chat. As a joke. Mostly.
3. Forward all twelve to my sibling. Their phone, their problem now.
4. One call, Sundays only. Everything else waits in line.

_Heart to heart:_ This week your family has sent you twelve requests for tech help, including a television that "lost all its channels." Your sibling works in IT, yet nobody calls them.

1. I fix all twelve by Sunday. The television was on the wrong input.
2. All of them get fixed, and then the family gets an invoice, mostly as a joke.
3. I forward all twelve to my sibling. It is their problem now.
4. I take one call on Sundays. Everything else waits in line for its turn.

- **Evidence:** unchanged, option by option (1 = T18A:2; 2 = T18A:1; 3 = T18B:2; 4 = T18B:2).
- **World:** absurd to unusual; weight 0.35 to 0.55; borderline everyday, see the rule 18 decision.
- **Why:** Almost everyone this age is somebody's IT department; the sibling who actually works in IT is the joke and the sting, replacing a magic mailbox.
- **Codex check:** Round 1: 2 to 4; flagged 3 (forward to the IT sibling) as sensible delegation that blurs its boundary evidence. Reworded to "Their phone, their problem now." Round 2: 3 to 4; flagged two heart mismatches (3 and 4). Fixed. Named 4 as a clean-boundary default; kept.

## 9. C5-51 (Chapter 5, Work, school and ambition, this or that)

**Measures:** Is work a race to win, or a job that ends when it ends?

**Now**

> A carrier owl lands between your desk and your closest friend's: one dream-job offer, seventy-hour weeks. Whoever feeds it first gets it.

1. Feed it first. It's a race, and I'm not sorry.
2. My friend feeds it. I like my evenings, and my friend.

**Proposed**

> A recruiter emailed you and your work best friend the same dream job: huge title, seventy-hour weeks, one hire. They haven't mentioned the email.

1. Apply tonight. Tell them after, if I get it.
2. Delete it. Seventy hours? My friend can burn out first.

_Heart to heart:_ A recruiter emailed you and your closest friend at work about the same dream job: a big title, seventy-hour weeks and only one hire. Your friend has not mentioned the email.

1. Tonight I apply, and I tell them only if I get it.
2. I delete it. My friend can have the seventy-hour weeks.

- **Evidence:** unchanged, option by option (1 = T16A:2; 2 = T16B:1).
- **World:** absurd to unusual; weight 0.35 to 0.45.
- **Why:** Same race-with-a-friend tension without the owl; "they haven't mentioned it" is the unsaid, so neither answer is the clean one.
- **Codex check:** Round 1: 2 to 3; flagged "haven't mentioned getting it" as ambiguous and the race as too weak for its evidence. Fixed: "one hire", "the email". Round 2: 3 to 4, no bugs; named 2 as the healthy default. Changed 2 to "My friend can burn out first", which is petty, not virtuous.

## 10. C4-142 (Chapter 4, Money and treats, bet)

**Measures:** Do you keep a safety net, even when it holds you back?

**Now**

> Somewhere, you've got money you try to keep untouchable. Right?

1. It's there. Never touched it, not once.
2. Raided it twice this year, for fun.
3. No. Money sitting still is fun not happening.
4. A small stash. It grows about $20 a month.

**Proposed**

> Twenty bucks says your emergency fund has paid for something that was not an emergency.

1. Untouched. Emergencies only, and nothing has qualified yet.
2. Concert tickets counted as an emergency. Twice.
3. No emergency fund. Money sitting still is a trip not happening.
4. Used it once, for a real one. Then panic-refilled it in a week.

_Heart to heart:_ Has your emergency fund ever paid for something that was not really an emergency?

1. No. It is for emergencies only, and none has come up yet.
2. Yes. Concert tickets counted as an emergency, twice.
3. I do not keep one. Money sitting still is a trip not taken.
4. Once, for a real emergency, and then I rushed to refill it within a week.

- **Evidence:** unchanged, option by option (1 = L1+1, T13B:2; 2 = L1-1, T13A:1; 3 = L1-1, T13A:2; 4 = T13B:1).
- **World:** everyday, unchanged.
- **Why:** A stiff savings question becomes a real, slightly embarrassing confession, and nobody has to report how much they have.
- **Codex check:** Round 1: 3 to 4; flagged that nobody who used the fund properly and refilled it had an answer. Fixed: option 4 covers that. Round 2: 3 to 4, no bugs; named 4 as the textbook answer, so it now admits the panic refill.

## Codex judge, in short

Independent check with the Codex CLI (read-only, ephemeral), two rounds on these 10 proposals only, scoring current versus proposed on group-chat appeal, one-read clarity and obvious defaults, and flagging bugs. Codex flags; I decided each one above.

| # | Id | Current | Proposed (round 2) | Round 2 bugs (all fixed after; no round 3) |
|---|---|---|---|---|
| 1 | C5-141 | 2 | 4 | 0 |
| 2 | C7-147 | 2 | 4 | 0 |
| 3 | C6-121 | 2 | 3 | 0 |
| 4 | C6-140 | 2 | 3 | 1 |
| 5 | X-L1-40 | 2 | 4 | 0 |
| 6 | C2-142 | 3 | 5 | 0 |
| 7 | C1-126 | 2 | 4 | 2 |
| 8 | C6-110 | 3 | 4 | 2 |
| 9 | C5-51 | 3 | 4 | 0 |
| 10 | C4-142 | 3 | 4 | 0 |

Round 2 left one evidence-fit note (card 7: option 3 agreed to the call before asking, which is weak for Steady +1; it now asks first), two heart-voice mismatches (cards 7 and 8) and one missing detail (card 4), all fixed after the round; and a named "most defensible" option on 7 cards, which is Codex's view that one answer is the reasonable one. Where that read was fair I added a cost to that option (cards 1, 9, 10); where every option is equally common in real life I kept it (cards 3, 5, 7, 8).
