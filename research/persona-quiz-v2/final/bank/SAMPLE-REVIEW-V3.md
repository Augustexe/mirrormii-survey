# Sample v3: 30 cards in worlds people are never in

For Jerry. Source: `bank/sample-v3.json` (30 cards, both voices). Picked from the 68 world cards (`bank/world-1.json` to `world-4.json`, one per sub-question) by the same five synthetic players: Jasmine 27 (partnered, cozy gamer), Jordan 25 (gym trainer, not a gamer), Mika 21 (broke student), Priya 33 (manager, married, close to family), Theo 31 (creator, judges virality). Six genuinely unusual v2 and spice cards were also considered; none was taken (reasons in section d).

**New rubric** (panel mean, 1 to 5): surprise (never been asked this), reveals (they learn something about themselves), spice (the 5 marks in SKILL 1b), fun, one-read clarity. Panel score = mean of the five.

| | Surprise | Reveals | Spice | Fun | Clarity | **Panel** |
|---|---|---|---|---|---|---|
| **Sample v3 (these 30)** | 3.91 | 4.16 | 3.93 | 4.13 | 4.19 | **4.06** |
| Sample v2, 6 everyday cards rescored (C2-54, C4-50, C7-70, C6-50, C3-60, C1-60) | 2.34 | 4.06 | 4.20 | 3.14 | 4.54 | 3.66 |
| All 68 world candidates | | | | | | 3.89 |

Read: surprise rose by 1.6 and fun by 1.0. Spice dipped slightly (4.20 to 3.93) because absurd stakes are pretend; the river card (spice 5.0) shows an absurd card can still carry it. v2's 4.06 was on the old spice-only rubric; on this rubric v2 lands near 3.7 to 3.8.

**Coverage.** Chapters 3/3/5/3/5/4/4 plus 3 sealed. Worlds 12 absurd, 12 unusual, 6 everyday. 11 of 13 formats (scenario 9, Genii's bet 4, reply 3, other people 3, pick two 2, this or that 2 as one round `ch6-r80`, real 1, receipts 1, role 1, friend's eyes 1, sealed 3; no rank or feeling). Every axis on 3 or more cards. Sealed primaries spread: L3 (S-90), L1 (S-80), R2 (S-91). No absurd device repeats: one river, one time freeze, one cursed phone, one leprechaun, one repair shop, one home robot, and each Genii deal has its own catch (fame for Sundays, a blind life swap). No dragon made the cut. Checker on a split temp bank: **0 errors**, 44 warnings (Heart to heart lines over 12 words and prompts over 30, all from the source cards).

**Evidence audit.** Every option on all 68 cards was checked against the pole map after the map fix (5 secondary targets were swapped in `subquestions.json`: SQ-L1-1, SQ-L1-3, SQ-T13-1, SQ-T19-1, SQ-T22-1; the cards were already written in the right direction, so the map was wrong, not the cards). One fix made in this sample: S-91 option 4 carried R2 +1 (Direct) with T07B (Soft side of its sub-question), so T07B was dropped and the axis kept. Flagged, not picked: C4-81 "Booked the nonrefundable one because it was cheaper" tags T13A (spend-first) but cheaper is the saver's move; C4-80 "Trip planner" carries L1 outside its sub-question with no clear pole; C1-80 "They heard it from someone else first" is closer to a circumstance than a choice; C1-91 uses a ghost poet as a stand-in for AI (loose for T03). Kept with a note: C3-111 "Negotiator. Fifty guests" as T21A at strength 1 (fifty is mid-size). Out-of-map tags that the behavior itself implies were left alone (C7-80 T22A/T24A, C1-110 T08B, C2-100 R2, C1-100 L2).

**Light edits** (evidence unchanged, Heart to heart updated to match): C2-91 "thanks to a wish gone wrong" became "thanks to one cursed nap" (C3-80 already opens on a wish gone sideways). C6-91 Heart to heart prompt gained quote marks around the toast.

## (a) The 30, by chapter

### Chapter 1 Phone

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C1-100 | everyday | Genii's bet | Do you keep a quiet tally of your wins? | Genii bets you know your personal best at something, down to the exact number. | Guilty. 412. Please ask me how. <br>Guilty. Nobody knows the number but me. <br>Never. I stop counting on purpose. Freedom. <br>Never. I didn't know I had a personal best. | 3.6 |
| C1-92 | everyday | Genii's bet | Do you keep count of who reaches out first? | Prove me wrong: there's a friend you won't text first until they text you. You're counting. | Guilty. It's 4 to 1. Their move. <br>Guilty. Held out a week, then caved with a meme. <br>Wrong. I text whoever I miss. No math involved. <br>Wrong. I forget to text everyone, equally. <br>I'm the one who never texts first. Someone's counting me. | 4.0 |
| C1-110 | absurd | Scenario | Do you put your shoes on when someone says they need hands? | Genii curses your phone: it buzzes whenever anyone nearby needs a hand. Muting it floats an "unavailable" badge over your head. Everyone can see it. | Keep it on. Already jogging before the buzz ends. <br>Answer every buzz. Keep a list of who owes me. <br>Keep it on. Wait ten seconds. Someone closer might go. <br>Mute it. Wear the badge. My evenings are spoken for. | 4.2 |

### Chapter 2 Friends

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C2-91 | absurd | Scenario | Does a quiet stretch mean a friendship is fine, or fading? | Ten years asleep, thanks to one cursed nap. Your phone: 212 texts from your neighbor. Zero from your best friend. | Call my best friend first. That's just how we are. <br>Answer all 212 first. My best friend can wait ten years. <br>Text my best friend: "Zero? Really? Anyway, hi." <br>Ten years is ten years. Nobody owes anybody a text. | 4.3 |
| C2-100 | absurd | Scenario | When a relationship gets rocky, do you repair it or release it? | A friendship repair shop opens next door. Any friendship fixed, but both people stay locked in until it's done. Your old best friend just booked you both. | Walk in with two sleeping bags. However long it takes. <br>Go in, but I'm bringing a list. Page one: them. <br>Cancel the booking. Some friendships end for a reason. <br>Leave a thank-you card on the shop door. Walk on. | 4.2 |
| C2-90 | unusual | Reply | When someone close asks for access, is saying no trust or distrust? | Noor is cutting a documentary about your friend group. Everyone else already sent their old chats. <br>*Thread:* Noor: "the doc is SO close. just need our old chats from you" / Noor: "easiest if I borrow your phone at brunch and scroll?" | "Take it. Scroll back to the very beginning. Enjoy." <br>"I'll pick the screenshots. The phone stays with me." <br>"Deal, if I get to see everyone else's first." <br>"Love you. Cut me from the film." | 3.7 |

### Chapter 3 Love and your person

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C3-80 | absurd | Scenario | When closeness and freedom collide, which do you protect? | A wish went sideways: you and your person now share every dream, every night. Your person loves it. Genii can undo it by sunrise. | Keep it. We share a pillow already. Why not the dreams? <br>Undo it. My dreams are the one room nobody enters. <br>Keep it one week, then bargain for dream-free weekends. <br>Keep it, mostly to see what they dream about me. | 4.3 |
| C3-91 | unusual | Scenario | Can someone who hurt you get back in? | Elevator stuck between floors 14 and 15. Two hours so far. Your ex uses the time to apologize. Properly. | "Thank you. Coffee when we're out? Let's actually talk." <br>"Accepted." Then study the buttons for another hour. <br>Forgive them. Unblock them. Keep them muted. <br>Hug it out. Tell my friends we're cool now. | 4.3 |
| C3-101 | unusual | Reply | In love, do you keep something that's only yours? | Chess club has been your one night alone for three years. Then your person texts. <br>*Thread:* Your person: "SURPRISE!! I joined your chess club. they just voted me president?? see you tonight" | "My two loves, one room. Save me the seat next to yours." <br>"Congrats! Can I keep one night that's just mine, though?" <br>"So proud!" Then quietly join a club across town. <br>"Amazing! Thursdays next? I want in on yours too." | 4.3 |
| C3-111 | unusual | Role | Who belongs at the big moments: everyone, or just us? | Your person's family starts a group chat called "THE WEDDING." You're not engaged. It has 41 members. In there, you're the... | Guest-list builder. "Add the second cousins. And their neighbors." <br>Hype machine. Hearts every centerpiece idea within seconds. <br>Negotiator. "Fifty guests. Each side picks twenty-five." <br>Bouncer. "Just us two. Everyone else gets a postcard." <br>Escape artist. Quietly pricing two one-way tickets. <br>Editor. Removes 30 members. Nobody notices for a week. | 4.2 |
| C3-81 | everyday | Genii's bet | When someone crosses a line with you, do you name it or absorb it? | Shower thoughts, Genii edition: you've won a whole argument with your person in there. They never heard a word of it. | Guilty. Then said none of it. Ever. <br>Guilty. Delivered the best line to their face that night. <br>Guilty. Still having it. Same argument, round forty. <br>Never. If it bugs me, they hear it the first time. <br>Guilty. It stopped mattering before I'd dried off. | 4.0 |

### Chapter 4 Money and treats

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C4-102 | unusual | Scenario | Is owning the thing you love worth paying extra? | An auction house mistakes you for a bidder. Next lot: the vintage jacket you've wanted for six years. Bidding just passed your rent. Thirty seconds. | Paddle up. Rent can be late once. <br>One bid at my limit. Then let it go. <br>Paddle down. Six years of wanting it was plenty. <br>Slip out. I'll find a cheaper one that's almost it. | 4.1 |
| C4-82 | unusual | Other people | Is fair the same for everyone, or what each person needs? | $2,400, stuffed inside the secondhand couch you and four roommates bought. Jae splits it by who's short on rent, not five ways. First thought? | Five ways. Couch money isn't a need-based program. <br>Right call. Whoever's short on rent gets more. <br>Who made Jae the judge of who's short? <br>Fine, as long as nobody learns who got the most. | 4.0 |
| C4-100 | absurd | Other people | Found money: joy now, or cushion later? | A leprechaun gave your friend a pot of gold: it doubles every year untouched, vanishes if touched. Day two, they spent a coin on pizza. First thought? | Icon. Best pizza anyone has ever eaten. <br>Doubling forever. Traded for pizza. I need to lie down. <br>Same. I'd have lasted a day and a half. <br>I'd have buried it and drawn myself a map. | 3.9 |

### Chapter 5 Work, school and ambition

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C5-111 | absurd | Scenario | Does fair mean first come, first served, or the right call for each case? | Blizzard. You run the only warm barn in town. The fair's 60 chocolate chip muffins booked it weeks ago. Now 60 cold chickens are at the door. | Muffins stay. They booked. Chickens get blankets and my apologies. <br>Call the muffin baker. Nothing moves without permission. <br>Chickens in. Muffins out in the snow. Tell the fair later. <br>Squeeze the chickens between the muffin trays. Hope for the best. | 4.3 |
| C5-110 | unusual | Reply | When your family says 'absolutely not', what do you do? | You quit your job to open a food truck. You were telling the family Sunday. Your cousin posted it first. <br>*Thread:* Your parent: "Your cousin just showed us. A FOOD TRUCK??" / Your parent: "Absolutely not. Call me. Now." | "Truck's bought. Free tacos for whoever stops yelling first." <br>Heart the message. Keep painting the truck. <br>"Calling now. Bringing the menu and a spreadsheet." <br>"Okay. The truck's on hold until we all talk." <br>Ask my sibling to call them first. Soften the landing. | 4.2 |
| C5-80 | absurd | Scenario | Would you trade your free time for a win people can see? | A deal from Genii: world famous at one thing of your choosing. The catch? You never get a lazy Sunday again. | Deal. I'll rest when the documentary comes out. <br>No deal. Lazy Sundays are my one true talent. <br>Deal, but only for something I'd grind at anyway. <br>Pass. Good at it quietly beats famous and tired. | 4.1 |
| C5-81 | unusual | Friend's eyes | Does someone else's timeline set your clock? | A reality show is casting you. Your oldest friend is your reference. The producer asks: "Whose clock do they run on?" | Keeps a quiet scoreboard of everyone's milestones. <br>Their own. Hasn't noticed anyone else moved. <br>Hears one friend's news, rewrites the five-year plan overnight. <br>Happy for everyone. Changes nothing. Sleeps great. <br>Says "not my race." Then checks the standings. | 3.8 |
| C5-91 | everyday | Genii's bet | Do you forgive and forget, or forgive and file? | Hunch: your phone holds a screenshot of something a coworker said. Not to share. Just in case. | Guilty. Dated, labeled, in its own folder. <br>Guilty. Forgot why I saved it. Keeping it anyway. <br>Guilty. Deleted it the day we were good again. <br>Never. Once it's sorted, it's gone from my head too. <br>Nobody at work or school has earned one. Yet. | 3.9 |

### Chapter 6 Family and home

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C6-80 | absurd | This or that (ch6-r80) | When the family you came from and the person you chose both need you, whose claim comes first? | Your parent and your person fall into a lazy river. Both swim equally badly. One floatie. Everyone will be fine. Who gets it first? | My parent. The family I came from grabs first. <br>My person. The family I'm building floats first. | 4.6 |
| C6-81 | absurd | This or that (ch6-r80) | Should a home and a couple run the way it has always been done, or by a design you invent? | A home robot shows up preset to run your future home exactly like the one you grew up in. Who cooks, who pays, all of it. | Keep the settings. It already knows where the good scissors go. <br>Factory reset. Our house, our settings, from zero. | 3.9 |
| C6-100 | unusual | Pick two | Is raising a kid part of the life you picture? | Street fair palm reader, your person right beside you: "Three kids. I see it clearly." Pick the two thoughts closest to yours. | Three! We'll need a much bigger table. <br>One, maybe. Can I negotiate with the palm? <br>Refund, please. Wrong palm, wrong life. <br>My future has a dog, a balcony, late dinners. <br>Squeeze my person's hand. Hope they heard it too. <br>Laugh. I'll write my own fortune, thanks. | 4.2 |
| C6-91 | unusual | Other people | When a friend asks for the real answer, do you give it raw or wrapped? | The couple asked for an honest toast. Their best friend delivers: "I give it two years. Prove me wrong." First thought? | They asked for honest. That was honest. Respect. <br>True or not, that belongs in the car, not the mic. <br>Right message, wrong wrapping. Lead with a story. <br>Finally, a toast worth listening to. | 4.2 |

### Chapter 7 Play, rules and you

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| C7-112 | absurd | Scenario | In a game, is a rule a rule? | You referee a soccer final between two kitten teams. The tiniest kitten keeps carrying the ball in its mouth. The crowd adores it. The other bench does not. | Yellow card. Tiny rules are still rules. <br>Warn it once, gently. Next time, it's a card. <br>Let it play. Nobody bought tickets for the rulebook. <br>Allow it, but only while its team is losing. | 4.2 |
| C7-100 | everyday | Real | Does ending something need a conversation? | The club, team or crew you most recently stopped showing up to. What did you actually do? | Told them in person: "I'm out. Thanks for everything." <br>Sent a long goodbye message. Muted the chat right after. <br>Just stopped going. Nobody asked. I didn't explain. <br>Said "busy lately" three times till they stopped asking. <br>Still a member on paper. Haven't been in a year. | 3.9 |
| C7-90 | everyday | Receipts | When something eats at you late, who hears it first: a machine or a person? | Something on your mind, too late to call anyone. Tap everything you've done lately: | Typed the whole worry out to an AI before telling anyone <br>Called a friend anyway, apologizing as they picked up <br>Asked an AI whether my text sounded okay <br>Wrote it in a notebook, no screen involved <br>Sent a vague "ugh" to a group chat to see who bit <br>Asked an AI something I'd be embarrassed to ask a friend <br>Waited for morning to say it to a person's face <br>None of these | 3.6 |
| C7-80 | unusual | Pick two | When you can't see how it ends, do you step in or wait for more information? | One spot left on a sailboat crossing the Atlantic. Leaves in 36 hours. You've never sailed. Pick your two first thoughts. | Yes. I'll learn which rope is which on the way. <br>Who's the captain? I need a name and reviews. <br>What's my way off if I hate it by day three? <br>Say yes. Then look up what a "jib" is. <br>Route, weather, every port on the way. Then maybe. <br>Already telling everyone I'm a sailor now. | 3.8 |

### Sealed (Genii's locked guesses)

| Id | World | Format | Sub-question | Make it fun | Options | Panel |
|---|---|---|---|---|---|---|
| S-90 | absurd | Sealed (L3) | Do you follow the process when nobody is checking? | Genii's gift: a remote that freezes everyone but you. The line for the new coaster says four hours. | Freeze. Stroll to the front. Unfreeze looking innocent. <br>Stay put. Frozen people still got here first. <br>Freeze, then pass only the family who cut earlier. <br>Freeze, then read the park rules. Is this even allowed? | 4.3 |
| S-80 | absurd | Sealed (L1) | Would you trade a sure good thing for a shot at a great unknown? | Genii's offer: swap your whole life (home, job, friends) for a random one, somewhere random. "At least as good." No previews. Yours is honestly good. | Keep mine. I built it. I like it. <br>Swap. "At least as good" plus a surprise? Sold. <br>Say no. Then wonder about it every night for a year. <br>Swap, but only if my person comes too. | 4.0 |
| S-91 | unusual | Sealed (R2) | Do you tell a friend what everyone else is saying about them? | Work party, by the coats. You overhear the boss: your friend won't get the promotion they've already celebrated. | Tell them tonight, word for word. Better from me. <br>Hint: "Maybe don't order the new car yet?" <br>Say nothing. Be there with snacks when it lands. <br>Tell them tomorrow, gently, with a plan B ready. | 4.0 |

## (b) What each absurd card reveals

| Id | The absurd hook | The real choice underneath |
|---|---|---|
| C1-110 | A cursed phone buzzes when anyone nearby needs a hand; muting it floats a badge over you | Whether you move before the ask is done, or guard your evenings even when everyone can see it (T23) |
| C2-91 | Ten years asleep: 212 texts from a neighbor, zero from your best friend | Whether a silent friend means "that's just us" or a count you keep (T02) |
| C2-100 | A repair shop locks you in with your old best friend until it's fixed | Whether you repair a bond that broke or let it stay ended (T10) |
| C3-80 | You and your person now share every dream | Whether close means sharing even your inner room, or keeping one place that's only yours (R1, T09) |
| C4-100 | A friend spends a coin from a forever-doubling pot on pizza | Your own line on joy now versus letting money grow, shown by how you judge theirs (T13, L1) |
| C5-111 | 60 muffins booked the only warm barn; 60 cold chickens arrive | Whether the booking (the rule) or the need wins when both are fair (T25, L3) |
| C5-80 | Genii: world famous at one thing, never a lazy Sunday again | Whether you trade rest for a win people can see (L2, T16) |
| C6-80 | Your parent and your person in a lazy river, one floatie | Which bond is your backbone: the family you came from or the one you're building (R3, T19) |
| C6-81 | A home robot preset to run your home like the one you grew up in | Whether your future home runs on the family script or on one you write (R3, T20) |
| C7-112 | You referee kitten soccer; the tiniest one keeps carrying the ball | Whether a rule is a rule even for the crowd's favorite (T25, L3) |
| S-90 | A remote that freezes everyone but you, at a four-hour line | Whether you keep the fair order when nobody could ever know (L3) |
| S-80 | Swap your good life for a random one, "at least as good", no preview | Whether a sure good thing beats an unknown maybe (L1, T22) |

## (c) Where's the line?

**Kept, with the guardrail that keeps it safe**
- **C6-80 river.** Parent versus person is the sharpest card in the set (spice 5.0; Priya: "I'd fight my spouse about this for a week"). Kept comic: a lazy river, "Everyone will be fine", the ask is "first", never death. Marked intimate, so "Keep it light" skips it. Risk: players with a lost or estranged parent.
- **C6-100 palm reader, three kids.** Said in front of your person, which is the spice. Intimate. No option dislikes kids ("Refund, please. Wrong palm, wrong life" is about the life, not children). Risk: anyone for whom kids is a painful topic; Keep it light skips it.
- **C3-111 wedding chat, not engaged.** Intimate. "Removes 30 members. Nobody notices for a week" is petty but roasts the move.
- **C6-91 "I give it two years" toast.** Roasts a couple on their day, which is why it is spicy; the card asks for your first thought, not a verdict on the couple.
- **S-90 time freeze line skip.** Cutting the line is framed as fun, no lecture; that is what makes the fair-order answer cost something.
- **C5-111 chickens left outside.** "Chickens get blankets and my apologies" keeps it from reading as cruelty to animals.
- **C1-100 personal-best bet.** Rewritten by Claude to drop the banned word "streak"; it asks what you already know, never to check an app.
- **C3-81 shower argument.** The shower is only the place; no body content.

**Cut or not picked, partly for the line**
- C2-101 "Reader. Announcing everyone's forehead. Out loud." (public money shaming at brunch; also a device double of C1-110).
- C3-110 skywriting "over your ex's building" (petty toward an ex, and a weak rank card).
- S-81 jury duty on a stolen birthday cake (a courtroom verdict edges toward a moral test; also a second L3 sealed).
- C6-101 "That kitchen looked like a lot of dishes" (fine, but a second kids card in one sample is too much).

## (d) What was cut, and why

38 of 68 world cards cut, plus 6 unusual v2 and spice cards considered and not taken.

| Reason | Count | Cards |
|---|---|---|
| Panel score under 3.7 or a boring flag (logistics, mild taste) | 15 | C1-80, C4-81, C6-102, C4-110, C3-90, C5-100, C7-91, C2-110, C4-101, C2-111, C5-82, C3-110, C6-111, C4-90, C5-90 |
| Same device or setting as a kept card | 6 | C3-100 (merge with your person, as C3-80), C2-101 (a mark over your head, as C1-110), C6-101 (second kids card), S-111 (family versus your career move, as C5-110), C6-112 (a house rulebook, as C6-81), C6-82 (inherited family ritual, ch6 already had two R3 cards) |
| Only one this-or-that round asked for | 6 | C1-90 and C1-91 (round ch1-r90), C7-101 and C7-102 (round C7-w3-credit), C6-113 and C7-110 (round w4-r110) |
| Absurd cap reached (12) | 4 | C2-80 magic 8-ball, C2-81 hammock island, C6-110 family wish-granter, C6-90 alien neighbor |
| Sealed slots (3, primaries spread across axes) | 4 | S-100 dragon rent and S-81 jury (both L3 again), S-110 Genii contract (L1 again, close to S-80), S-101 (score 3.5) |
| Evidence, reveal or fit | 3 | C4-80 (loose L1 on "Trip planner"), C2-92 dragon cat (fight or write reveals little, spice 2.8), C7-111 (chapter 7 full at a higher score) |
| v2 and spice, unusual only | 6 | C3-41 and C3-42 (need their own round), v2 S-41 roommate doc (same sub-question as S-90, strong: 4.4), C5-52 pay button (no clean sub-question), C3-68 phone swap and C3-69 wedding table (a round; C3-69 evidence loose) |

**Strongest cards left on the bench** (worth keeping in the full bank): S-100 dragon roommate (4.2), C2-101 glowing debts (4.2), S-81 jury duty (4.2), C6-101 two futures (4.1), C2-80 magic 8-ball (4.1), C2-81 hammock (4.1), C6-110 family wish-granter (4.1), C7-102 pub quiz split (4.1).
