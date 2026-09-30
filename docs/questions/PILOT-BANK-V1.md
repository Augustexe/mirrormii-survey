---
title: Tag pilot bank V1, questions broken down into evidence
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: generated from products/survey/pilot/bank.js (genii-tag-pilot-v1); Sally's research in research/sally-values-2026-09-26; TAG-VALIDATION-SPEC.md
---

> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Tag pilot bank V1

Generated from `pilot/bank.js` by `pilot/build-doc.cjs`. Edit the bank, not this page.

32 tag dimensions (14 with a masked scene), 8 sealed checks. Every tag has a stance item (what they believe, 5 positions, grade *prefer*). Scenes (what they did, grade *did*) set the tag level when answered. A stance and scene on opposite sides make a **split** tag. Levels: A2 strongly A, A1 leaning A, 0 depends, B1 leaning B, B2 strongly B.

Sources: Qnn are Sally's 48 dilemmas; Tnn are her 60 debate topics.


## Love and closeness

### `closeness_style`: Togetherness ↔ Own orbit

Sally: Q05, Q26 · Never read as: an attachment style or how much they love anyone

**Stance** (recognition; looks like relationship goals; measures how much shared time they want): "With the person you're closest to, the ideal is…"

- A: Most free time together, sharing the whole day.
- B: Close, and each of us keeps real time and space of our own.


**Scene** (recognition; looks like a weekend recap; measures togetherness in practice): "Think of your last free weekend day with nothing planned. How much of it went to your closest person?"

| Option | Level | Also records |
|---|---|---|
| Nearly all of it, on purpose. | A2 strongly A |  |
| A good chunk, then some time to myself. | A1 leaning A |  |
| A check-in call or text. The rest was mine. | B1 leaning B |  |
| Mostly mine. We'd catch up another time. | B2 strongly B |  |
| No recent example / Skip | missing | |

**Predicts, sealed check H03:** "Your closest person suggests spending all of Sunday together. You'd planned a solo day."

- Move the solo plan. Sunday's theirs. (A2 strongly A)
- Half the day together, half mine. (A1 leaning A)
- Keep my plan, offer the evening. (B1 leaning B)
- Keep my plan. Another Sunday. (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `betrayal_line`: Emotional closeness is the line ↔ Broken agreements are the line

Sally: Q06 · Never read as: how jealous they are or how serious any betrayal is

**Stance** (sting; looks like a cheating debate; measures where they draw the line): "Your person secretly grew close to someone else. Nothing physical, but they shared things that used to be just yours. What hurts most?" Teen version: "Your best friend secretly grew close to someone else and shared things that used to be just yours. What hurts most?"

- A: The closeness itself. That was ours.
- B: The hiding. We never agreed that was okay.


### `commitment_pace`: Closeness can come first ↔ Commitment comes first (18+ only)

Sally: Q07 · Never read as: their history, experience or orientation

**Stance** (recognition; adult-only; own comfort, not a rule for others): "Mutual attraction, respect, everything talked through, but nothing official yet. Getting physical is…"

- A: Fine by me. Commitment isn't a precondition.
- B: Something I'd rather wait on until it's official.


### `phone_privacy`: Open phones ↔ Private phones

Sally: Q41 · Never read as: trust issues or having something to hide

**Stance** (curiosity; looks like a trust test; measures privacy inside closeness): "Your closest person suggests you both share phone passcodes. No trust issues, just an idea."

- A: Sure. Feels natural.
- B: I'd rather keep mine. If something's up, just ask me.


### `who_pays`: Whoever asked pays ↔ Split from the start

Sally: T09, T11 · Never read as: generosity or stinginess

**Stance** (delight; looks like dating etiquette; measures their default fairness frame): "First date or first hangout, the bill arrives."

- A: Whoever did the asking pays. That's the move.
- B: Split it. Clean start, no scorekeeping.


### `standards`: Trust the ick ↔ Look past small things

Sally: T03, T04 · Never read as: being picky or being desperate

**Stance** (cringe; looks like dating banter; measures how fast a small signal ends things): "Someone great does one small thing that gives you the ick."

- A: The ick knows things. I trust it.
- B: Small stuff shouldn't outweigh the whole person.



## Friends

### `support_capacity`: Show up anyway ↔ Say so and reschedule

Sally: Q27 · Never read as: kindness, selfishness or how much they care

**Stance** (guilt; looks like friend loyalty; measures their capacity boundary): "A friend needs you tonight and you're running on empty. Being a good friend means…"

- A: Showing up anyway.
- B: Saying so, and picking another time.


**Scene** (guilt; looks like a friendship story; measures whether they voice their limit): "Think of the last time someone wanted a long talk or a favor on a night you were running on 4%. What happened?"

| Option | Level | Also records |
|---|---|---|
| Showed up, full session. Sleep is a social construct. | A2 strongly A | need_voice:absorber |
| Showed up, and quietly set a timer in my head. | A1 leaning A |  |
| Let it sit and replied the next day. | B1 leaning B | emotion: guilt |
| Sent "can't tonight, tomorrow?" | B2 strongly B | need_voice:asker |
| No recent example / Skip | missing | |

**Predicts, sealed check H01:** "Your group chat asks who can help someone move on Saturday, your only free day. First reply?"

- "I'm in." (A2 strongly A)
- "I can do the morning." (A1 leaning A)
- "I can lend my car instead." (B1 leaning B)
- "Can't this time, good luck!" (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `contact_needs`: Low contact is fine ↔ I need people to reach out

Sally: Q26, T45 · Never read as: how good a friend they are

**Stance** (sting; looks like a friendship debate; measures how much contact they need to feel held): "You and a friend haven't talked in a couple of months. Nobody's upset."

- A: Totally fine. We'll pick up right where we left off.
- B: It matters to me that someone reaches out.


**Scene** (sting; looks like a friendship recap; measures the sting of silence): "Think of the last time a friend went quiet for a few weeks. What actually went on in your head?"

| Option | Level | Also records |
|---|---|---|
| Didn't notice until they popped back up. | A2 strongly A |  |
| Noticed, figured they were busy, moved on. | A1 leaning A |  |
| Checked their stories to see if they were alive. | B1 leaning B | emotion: worry |
| Felt it. A little "do they still like me?" | B2 strongly B | emotion: sting |
| No recent example / Skip | missing | |

### `friend_did_harm`: Steady them first ↔ Call it first

Sally: Q25, T41 · Never read as: loyalty or moral character

**Stance** (tension; looks like friend drama; measures support versus accountability order): "A close friend clearly hurt someone else. The facts are pretty settled. First move?"

- A: Be there for them first, then talk about owning it.
- B: Tell them it wasn't okay, even if they feel I'm not on their side.


**Scene** (tension; looks like gossip; measures whether they name it): "Think of the last time a friend was pretty clearly in the wrong in some group drama. What did you do?"

| Option | Level | Also records |
|---|---|---|
| Stayed on their side in public. Talked to them privately later. | A2 strongly A | signal:private |
| Stayed neutral and let it blow over. | A1 leaning A | friction:let_it_breathe |
| Told them privately they'd messed up. | B1 leaning B | friction:name_it |
| Said it in the group chat, kindly but clearly. | B2 strongly B | signal:out_loud; friction:name_it |
| No recent example / Skip | missing | |

**Predicts, sealed check H07:** "A friend brags about ghosting someone who was really kind to them."

- Laugh along, bring it up gently later. (A2 strongly A)
- Change the subject. (A1 leaning A)
- "That's kind of harsh, no?" (B1 leaning B)
- "Not cool. You should message them." (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `celebration_budget`: Stretch for the moment ↔ Say the budget

Sally: Q28, T23 · Never read as: cheapness or showing off

**Stance** (guilt; looks like money etiquette; measures voicing a limit in a group): "Friends plan a birthday trip that's over your comfortable budget, but doable."

- A: Go. You cut back somewhere else. Some moments are worth it.
- B: Say the budget out loud and celebrate a cheaper way.


**Scene** (guilt; looks like a money story; measures silent stretching versus saying it): "Think of the last time friends planned something above your budget. What did you do?"

| Option | Level | Also records |
|---|---|---|
| Went, paid, and quietly ate rice for a week. | A2 strongly A | need_voice:absorber |
| Went, and skipped the pricier parts without saying why. | A1 leaning A |  |
| Said my budget and suggested a cheaper version. | B2 strongly B | need_voice:asker |
| Sat this one out and made it up to them later. | B1 leaning B |  |
| No recent example / Skip | missing | |

### `feedback_style`: Straight to the fix ↔ Warm first, fix later

Sally: Q37 · Never read as: honesty or kindness

**Stance** (tension; looks like a friendship dilemma; measures feedback order): "A friend asks what you think of their practice run for something big. It isn't there yet, and they're already rattled."

- A: Name the main problem now, with a way to fix it.
- B: Build them up first. The hard part can wait until they're steadier.


**Scene** (cringe; looks like a story about a friend; measures directness): "Think of the last time a friend asked what you honestly thought of something they made or planned. What did you actually say?"

| Option | Level | Also records |
|---|---|---|
| The truth, first sentence. | A2 strongly A | friction:name_it |
| One nice thing, then the truth. | A1 leaning A |  |
| Mostly the nice things. The truth got a small cameo. | B1 leaning B |  |
| "I love it!" and moved on. | B2 strongly B | friction:let_it_breathe |
| No recent example / Skip | missing | |

**Predicts, sealed check H05:** "A friend shows you a haircut they got an hour ago. It isn't great."

- "Honestly? Not your best. Here's a fix." (A2 strongly A)
- "The color's great, the cut needs a week." (A1 leaning A)
- "It'll grow on me!" (B1 leaning B)
- "Obsessed." (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `second_chances`: They can earn their way back ↔ The hurt person decides

Sally: Q39 · Never read as: forgiveness as a virtue score

**Stance** (tension; looks like group politics; measures repair versus protection): "Someone in your group hurt a person, owned it, made it right and actually changed. They want back in."

- A: Let them back in gradually, with some boundaries.
- B: Whatever the person they hurt wants comes first.



## Family

### `strings_attached`: Help comes with family terms ↔ Only on my terms

Sally: Q21 · Never read as: gratitude or how close they are to family

**Stance** (guilt; looks like money; measures duty against autonomy): "Your parents offer to help with rent, as long as you live closer to them." Teen version: "Your parents offer a later curfew, as long as you share your location."

- A: Fair deal. Family help comes with family expectations.
- B: Only if it fits my own plans. Otherwise I'll wait.


### `family_vs_own_call`: Bring family along first ↔ My call after listening

Sally: Q24 · Never read as: respect or rebellion

**Stance** (guilt; looks like a life choice; measures family consensus versus own call): "You want to make a big move (new city, new school, new job). Your family isn't on board, but nothing actually needs you home."

- A: Keep talking until they're on board, even if it means waiting.
- B: Hear them out, then decide on my own timeline.


**Scene** (guilt; looks like a family story; measures who has the final say in practice): "Think of the last time your family pushed back on a decision of yours, big or small. What happened next?"

| Option | Level | Also records |
|---|---|---|
| Changed the plan. Peace at home won. | A2 strongly A |  |
| Found a compromise so everyone could live with it. | A1 leaning A |  |
| Did it anyway, and explained a lot. | B1 leaning B | friction:name_it |
| Did it anyway. Told them after. | B2 strongly B |  |
| No recent example / Skip | missing | |

### `family_safety_net`: Family carries each other ↔ Help with an end date

Sally: Q23 · Never read as: love or loyalty

**Stance** (guilt; looks like family money; measures open-ended duty): "Your parents want you to keep supporting a grown sibling who isn't in a crisis, just not standing on their own yet." Teen version: "Your parents want you to keep covering for a sibling who keeps skipping their chores."

- A: Family carries each other. We'll sort out the fairness later.
- B: Help, with an end date. They need to stand on their own.


### `caregiving`: Be there in person ↔ Organize the help

Sally: Q22 · Never read as: how devoted they are to family

**Stance** (guilt; looks like a family dilemma; measures in-person duty versus coordinated care): "A family member needs long-term care. You could chip in money, siblings could help, but moving home would hurt your work or school."

- A: Be there in person. Everything else adjusts.
- B: Organize family and professional help, and keep my life going.



## Money

### `fairness_rule`: Fair means equal ↔ Fair means proportional

Sally: Q14, T10 · Never read as: stinginess, generosity or wealth

**Stance** (tension; looks like a 50/50 debate; measures their fairness rule): "Two people share costs. One earns about twice as much. Fair is…"

- A: Split it evenly.
- B: The higher earner pays more.


**Scene** (tension; looks like a money story; measures fairness in practice, and resentment): "Think of the last shared bill: dinner, a trip, a group gift. How did the split actually go?"

| Option | Level | Also records |
|---|---|---|
| Down the middle. Clean math, no feelings. | A2 strongly A |  |
| Even split, and I did the math on it later. | A1 leaning A | emotion: resentment |
| Whoever had more that month covered more. | B2 strongly B |  |
| I covered it and didn't bring it up. | none on this tag | need_voice:absorber |
| No recent example / Skip | missing | |

**Predicts, sealed check H02:** "A group trip house costs $1,200. One person's room is much bigger than the rest. What do you propose?"

- Split it evenly. Simple. (A2 strongly A)
- Even, and whoever gets the big room buys dinner. (A1 leaning A)
- The big room pays a bit more. (B1 leaning B)
- Price each room by size. (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `lending`: Help first ↔ Terms first

Sally: Q15 · Never read as: kindness or trust

**Stance** (guilt; looks like a money dilemma; measures boundaries around help): "A close friend urgently needs money you could spare, but losing it would sting. They're not sure when they can pay you back."

- A: Give what I can afford to lose. Don't lead with the payback date.
- B: Get the payback plan clear first, then decide.


**Scene** (guilt; looks like a money story; measures whether they set terms): "Think of the last time someone asked you to lend or cover money. What did you do?"

| Option | Level | Also records |
|---|---|---|
| Sent it. Didn't mention paying back. | A2 strongly A | need_voice:absorber |
| Sent it, with a vague "whenever". | A1 leaning A |  |
| Sent it with a clear "by the 15th?" | B1 leaning B | need_voice:asker |
| Said not this time. | B2 strongly B | need_voice:asker |
| No recent example / Skip | missing | |

### `effort_vs_start`: Credit the effort ↔ Name the head start

Sally: Q13 · Never read as: politics or class

**Stance** (envy; looks like a class debate; measures how they explain success): "A friend bought a home with help from their parents. They say they worked hard for it too."

- A: They did. Help doesn't erase effort.
- B: Sure, but the head start should be said out loud.


### `time_horizon`: Now ↔ Later

Sally: Q33, T55 · Never read as: responsibility or impulsiveness

**Stance** (delight; looks like a money quiz; measures now versus later): "An unexpected $300 lands. The best use is…"

- A: Something I'll remember this month.
- B: Savings, or something I'll need later.


**Scene** (delight; looks like a money recap; measures time horizon in practice): "Think of the last bit of surprise money: a refund, birthday cash, a bonus. Where did most of it go?"

| Option | Level | Also records |
|---|---|---|
| Straight into a plan or a treat. Gone within a week. | A2 strongly A |  |
| Some fun, the rest set aside. | A1 leaning A |  |
| Mostly saved, one small treat. | B1 leaning B |  |
| Saved or went to bills. Didn't really feel it. | B2 strongly B | caution: can reflect tight money, not personality |
| No recent example / Skip | missing | |

**Predicts, sealed check H04:** "A favorite artist announces a surprise show this week. Tickets are $180. Your budget is fine but not loose."

- Bought before finishing the announcement. (A2 strongly A)
- Bought after checking my budget twice. (A1 leaning A)
- Waiting for resale prices. (B1 leaning B)
- Passing. Next tour. (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `favorite_premium`: Pay for the one I love ↔ Keep the difference

Sally: Q34, Q36 · Never read as: vanity or thrift

**Stance** (delight; looks like shopping; measures what they pay for): "Two versions do the same job. You love one, and it costs a lot more but still fits your budget."

- A: The one I love. The feeling is part of the value.
- B: The cheaper one. The difference goes somewhere else.


**Scene** (delight; looks like a shopping recap; measures the premium they actually pay): "Think of the last time you chose between a pricier favorite and a cheaper equivalent. What did you get?"

| Option | Level | Also records |
|---|---|---|
| The favorite. No regrets. | A2 strongly A |  |
| The favorite, after a week of deliberating. | A1 leaning A |  |
| The cheaper one, and I still think about the other. | B1 leaning B | emotion: longing |
| The cheaper one. Didn't think twice. | B2 strongly B |  |
| No recent example / Skip | missing | |


## Work or school

### `pay_or_passion`: Pay first ↔ Interest first

Sally: Q17 · Never read as: ambition or laziness

**Stance** (recognition; looks like career advice; measures what work is for): "Two options both cover your needs. One pays more but bores you; the other pays less and you'd actually enjoy it." Teen version: "Two part-time jobs. One pays more but bores you; the other pays less and you'd actually enjoy it."

- A: Take the money. Enjoy life outside it.
- B: Take the one I'd enjoy. I'll live a bit leaner.


### `risk_style`: Test it on the side ↔ Go all in

Sally: Q19 · Never read as: bravery or caution as a virtue

**Stance** (hope; looks like a career choice; measures how they take risks): "You have a cushion for six months. A risky thing you really want to try shows up next to your steady option."

- A: Keep the steady thing and test the new one on the side.
- B: Give it six real months. Accept the cushion might shrink.


**Scene** (hope; looks like a story about a new thing; measures ramp-up style): "Think of the last new thing you really wanted to start: a project, a club, a side hustle, a move. How did you start?"

| Option | Level | Also records |
|---|---|---|
| Dipped a toe in while keeping everything else the same. | A2 strongly A |  |
| Started small, then went bigger once it worked. | A1 leaning A |  |
| Jumped in and figured it out as I went. | B2 strongly B | tempo:starter |
| Still planning it, honestly. | none on this tag | tempo:watcher |
| No recent example / Skip | missing | |

### `success_meaning`: Something to point at ↔ A life that feels right

Sally: Q20, Q45 · Never read as: ambition, laziness or success

**Stance** (hope; looks like a daydream; measures what success means to their): "Five years from now, you'd rather hear…"

- A: "You built something people know about."
- B: "Your life looks exactly how you wanted."


**Scene** (pride; looks like a work or school story; measures ambition versus pace in practice): "Think of the last time you were offered more responsibility: a lead role, an extra project, captain, organizer. What did you do?"

| Option | Level | Also records |
|---|---|---|
| Took it before they finished asking. | A2 strongly A |  |
| Took it, and negotiated what came off my plate. | A1 leaning A | need_voice:asker |
| Asked for time, then said no. | B1 leaning B |  |
| Said no right away. I like my life at this size. | B2 strongly B |  |
| No recent example / Skip | missing | |

**Predicts, sealed check H06:** "You're offered the lead on a group project: more credit, more work, and it overlaps with a trip."

- Take the lead. The trip can move. (A2 strongly A)
- Take it and shrink the trip. (A1 leaning A)
- Take a smaller role. (B1 leaning B)
- Pass. Going on the trip. (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `stay_late`: Cover for the team ↔ Protect my evening

Sally: Q18 · Never read as: work ethic

**Stance** (guilt; looks like work etiquette; measures their default boundary): "Your part is done. Someone asks you to stay late for something that could wait until tomorrow."

- A: Stay. Covering for each other matters.
- B: Say I have plans and offer to help tomorrow.



## Online life

### `ai_apology`: Meaning counts ↔ Own words count

Sally: Q43 · Never read as: honesty

**Stance** (curiosity; looks like a tech take; measures what makes words sincere to their): "Someone uses AI to help word an apology to you. They meant every bit of it and followed through."

- A: Still sincere. What matters is meaning it and changing.
- B: For something important, I want their own words.


### `ai_companion`: Can be real comfort ↔ Useful, not intimate

Sally: Q44, T49 · Never read as: loneliness

**Stance** (curiosity; looks like a tech take; measures where they place closeness): "An AI companion makes someone feel understood, and they still have real friends and a life."

- A: That comfort can be real, even if it isn't a person.
- B: Useful, sure. But not part of anyone's intimate life.


### `posting_person`: Post them ↔ Keep it offline

Sally: T02 · Never read as: how serious the relationship is

**Stance** (delight; looks like social media etiquette; measures private versus public signal): "You're happy with someone new (a partner, or a new best friend). Posting them is…"

- A: Obvious. I'm proud of them.
- B: Not my thing. My feed isn't where that lives.



## Me and my future

### `explore_or_root`: Go see ↔ Deepen where I am

Sally: Q46 · Never read as: courage or fear

**Stance** (hope; looks like a daydream; measures appetite for the unfamiliar): "You could live somewhere new for a year. Your current life is good and the risks are manageable."

- A: Go. The unknown is the point.
- B: Stay and go deeper with what I have.


**Scene** (hope; looks like a story; measures exploration in practice): "Think of the last time you could try something unfamiliar that took real effort: a trip, a class, a new group. What happened?"

| Option | Level | Also records |
|---|---|---|
| Went for it, no research. | A2 strongly A | novelty:side_quester |
| Went for it after a lot of research. | A1 leaning A |  |
| Thought about it, then stuck with what I know. | B1 leaning B |  |
| Passed. I like my usual. | B2 strongly B | novelty:usual_order |
| No recent example / Skip | missing | |

**Predicts, sealed check H08:** "You get a free weekend and a free train ticket anywhere you've never been."

- Pick a random city and go. (A2 strongly A)
- Go, after a night of planning. (A1 leaning A)
- Save it for somewhere familiar. (B1 leaning B)
- Give the ticket away and enjoy home. (B2 strongly B)

Genii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.


### `life_timeline`: Lock in a direction ↔ My own pace

Sally: Q48, T17 · Never read as: anxiety or maturity

**Stance** (envy; looks like a life-stage take; measures the pull of the peer timeline): "People your age are starting to lock things in: careers, partners, cities." Teen version: "People your age are starting to lock things in: majors, paths, friend groups."

- A: I'd like a few long-term directions set. Milestones calm me down.
- B: I'd rather keep exploring. Their timeline isn't mine.


### `self_or_others`: Invest in me ↔ Invest in others

Sally: Q47 · Never read as: selfishness or selflessness

**Stance** (recognition; looks like a time choice; measures where their discretionary energy goes): "Free time for one big thing: your own hobby and growth, or a volunteer project that helps people."

- A: My own thing, first.
- B: The project that helps people.


### `looking_put_together`: Worth the time ↔ Keep it simple

Sally: Q29, T25 · Never read as: vanity or self-worth

**Stance** (recognition; looks like a beauty debate; measures what they spend time on for herself): "Your look-good routine takes an hour a day. It makes you happy; nobody requires it."

- A: Worth it. Looking good feels good.
- B: I'd simplify and spend the hour on something else.

