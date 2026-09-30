---
title: Values layer synthesis, Sally's 12 domains into the Genii survey
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: research/sally-values-2026-09-26 (Sally's 48-question tag map, 60 debate topics, ChatGPT thread); SURVEY-SPEC-V3.md; Jerry's 2026-09-26 grill rulings (multiple choice only, masked, onion layers, end feelings); PRODUCT-TRUTH emotion rule
---

> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Values layer synthesis

Status: **proposed.** How Sally's research feeds the survey, what has to change before any of it reaches a respondent, and the tone and emotion rules for converting it.

## 1. Verdict

Sally's work fills the biggest hole in the survey, and it can't ship as written.

**What it gives us that we don't have:**
1. **The domains.** The live bank has three settings (everyday, work, social). Sally's 12 domains give us love, money, family, friendship, ambition, online life and meaning, which is what you asked for.
2. **A values layer.** Our six axes measure *what you do* (tempo, signal, friction, structure, novelty, need voice). Sally's 96 tags measure *what you believe is right* (autonomy or family consensus, equal or proportional fairness, commitment before closeness). The reveal needs both. Her tags are the "personality" part of "behaviors, personality, a guessed trait".
3. **The mirror.** Her rule, keep "what I think one should", "what I want" and "what I actually did" apart, is what produces "that made me question myself". A stance in one scene against an action in another is the strongest tension moment we can build, and she's already paired the topics.
4. **Heat.** The 60 debate topics are arguments women aged 20 to 30 are already having in public: 50/50 splits, the ick, situationships, bare minimum versus princess treatment, trauma dumping, ghosting, AI boyfriends. That's where the emotion and the share impulse come from.
5. **Her guardrails match ours:** no fixed labels from one answer, context kept, no "80% means you are X", and the respondent confirms or corrects. Nothing to reconcile.

**What has to change:**

| Sally's version | Why it fails the survey | Conversion |
|---|---|---|
| Abstract principle ("a startup grant wants to improve women's access to resources...") | No recognition, no laugh, reads as a policy poll | Principle becomes a scene she has lived: "Think of the last bill you split with your person" |
| Unmasked: the question states the dilemma | Jerry ruled every question masked | The visible topic is the debate; what's scored underneath is behavior, value and emotion |
| 5-point lean scale plus a "why" in her own words | Jerry ruled multiple choice only, no free text | 4 or 5 scene options. The "what would make you switch" follow-up becomes a second tap with 3 preset conditions |
| Neutral, careful tone | No Genii voice; nothing to screenshot | Genii voice (kind / fun / call me out). Every option dignified and funny |
| Public-policy and identity items (Q02 grants, Q16 profit share, Q38 to Q40 rules and public resources, Q42 data, feminism self-label, surname rights) | They pit respondents against each other, not against themselves. Half the audience feels judged, and a cozy title can't sit on a political stance | Cut. Keep the personal side of those debates (who pays, mental load) |
| Health items (Q31, Q32) and a friend's body change (Q30) | The survey carries no health data (Jerry, 2026-09-24) | Cut. Keep appearance only as a value ("for me or for them", Q29) |
| Sex and commitment (Q07), fidelity (Q06), marriage and kids (Q09 to Q12) | Minors are now in scope | Gate by age: adult versions for 18+, crush and friendship versions for teens |
| Chinese-internet specifics (surname rights, 服美役, 雌竞, 捞女) | First market is North America, English first | Keep the ones with English equivalents. Family-duty items stay: they speak to Chinese-diaspora respondents, who scored high in the synthetic segment study |
| Evidence base: 7 of 60 topics verified for ages 20 to 30; 36 are "women, any age" | Topics are hook candidates, not proof of what our audience argues about | Treat as candidates. Real answers tell us which ones land |

## 2. Domain map: Sally's 12 into Genii's 7

| Genii domain | Sally domains merged | Hot hooks (60-topic list #) | Emotions it hits | Default tone | Sally items to convert |
|---|---|---|---|---|---|
| **Love** | 2 Love, sex and fidelity; personal side of 1 Gender | the ick (4), situationship (5), who pays (9), bare minimum vs princess (13), mental load (36), mankeeping (37), AI partner cheating (50) | sting, jealousy, desire, cringe, delight | playful, warm | Q05 together time, Q06 what counts as betrayal, Q08 repair or leave, Q01/Q04 who does what |
| **Friends** | 7 Friendship | best friend vs partner (44), low-maintenance friends (45), trauma dumping (46), ghosting (47), friend's wedding costs (23) | guilt, sting, loyalty, irritation | playful | Q25 friend did harm, Q26 how often you need contact, Q27 capacity, Q28 celebrations over budget |
| **Family** | 6 Family of origin | parents' money with strings, moving away | guilt, obligation, love, irritation | gentle | Q21 down payment near them, Q23 supporting siblings, Q24 moving against their wishes |
| **Money** | 4 Money and fairness, 9 Consumption | 50/50 (10), girl math (54), treat yourself vs underconsumption (55) | guilt, envy, resentment, delight | playful, girl-math wink | Q13 parents bought her a house, Q14 split rule, Q15 lending a friend money, Q33 save or spend, Q34 the brand one, Q36 the closet |
| **Work or school** | 5 Work and ambition | hustle vs soft life (33), success = money (34) | pride, guilt, relief | dry but warm | Q17 pay or passion, Q18 stay late to help, Q19 stable job or the leap, Q20 promotion or free time |
| **Online life** | 11 Tech, privacy, relationships | AI boyfriend (49), AI and cheating (50), posting your partner (2) | jealousy, curiosity, cringe | playful | Q41 phone passwords, Q43 AI-written apology, Q44 AI companionship. On brand: Genii is an AI reading you |
| **Me and my future** | 12 Meaning and identity, appearance part of 8 | settle down by 30 (17), not every girl a girlboss (33), beauty for whom (25) | envy of peers, hope, pressure, relief | gentle | Q45 achievement or ease, Q46 new city, Q48 peers settling down, Q29 the hour of grooming |

Gender and feminism (1), marriage and kids (3) and morals and public fairness (10) stop being domains. Their personal pieces fold into Love, Money and Me; the policy pieces are cut.

## 3. The values layer (L3, new)

Sally's cross-domain composites become **value dimensions**. They sit next to the six behavior axes and use the same gates. Most are measured by stance items (grade *prefer* or *would*) and checked against action scenes (grade *did*).

| Value dimension | Pole A | Pole B | Sally sources | Overlaps with |
|---|---|---|---|---|
| `closeness_style` | Togetherness: shared time, shared phone | Own orbit: own time, own privacy | Q05, Q41, Q26 | social_signal_style |
| `duty_direction` | Family and friends first, even at a cost | My plan first, with care | Q21, Q22, Q23, Q24, Q18 | need_voice |
| `fairness_rule` | Fair means equal | Fair means proportional | Q14, Q15, Q13 | none (new) |
| `time_horizon` | Now: experience, treat, try | Later: save, build, secure | Q33, Q36, Q19, Q17 | novelty_aperture |
| `success_meaning` | Achievement you can point at | A life that feels right | Q45, Q20, Q48 | structure_reliance |
| `repair_or_release` | Work it out | Walk away from a bad fit | Q08, Q25, Q39 | friction_posture |

Recommendation: ship these six as **candidates, not traits yet**. They power the "what you value" reveal card and the mirror. They don't feed the title until real answers show they separate people.

## 4. The mirror: stance against action

This is the "made me question myself" moment, and the concrete answer to grill round 3 (contradiction pairs). Each pair is a quick stance tap in one place and an action scene elsewhere in the run, never back to back.

| Pair | Stance item (what she thinks) | Action scene (what she did) | Reveal line when they split |
|---|---|---|---|
| Friendship upkeep | "Real friends check in, even when busy" (Sally Q26 B) | S01: left the follow-up in drafts | "You believe friends should reach out. Your drafts folder has entered the chat." |
| Capacity | "You should say when you can't hold someone tonight" (Q27 B) | W08 or N-friend scene: said yes on an empty tank | "You'd tell a friend to protect her energy. You did not extend yourself the same memo." |
| Fair split | "Fair means whoever earns more pays more" (Q14 A) | Money scene: paid half, did the math later | "Team proportional in theory. Team quietly-Venmo-ing in practice." |
| Autonomy | "My life, my city, my call" (Q24 B) | Family scene: rearranged plans after a parent's comment | "Independent in principle. Very reachable by one text from your mom." |

A pair that agrees becomes a "that's what I expected" card instead. Both outcomes are content.

## 5. Tone and emotion rules for conversion

1. **Scene, not principle.** She is in it: a bill on the table, a phone lighting up, a parent's text. No policy, no "people in general".
2. **Mask the construct.** The visible topic is the debate everyone knows. The scored layer underneath is behavior, value or emotion, and the reveal takes the mask off.
3. **One option carries the feeling.** At least one option names the private reaction ("paid, then did the math later"), so emotion gets captured without asking "how did you feel".
4. **No good answer.** Sally's neutrality stays: every option is dignified and every option gets a laugh.
5. **Conditions become taps.** Her "what would make you switch sides" follow-up becomes an optional second tap with three preset conditions ("if it happened every week", "if it was my best friend", "if money was tight"). Condition-sensitivity is evidence.
6. **Hot takes as a fast round.** Stance items can run as a quick swipe round ("Team 50/50 or team whoever-earns-more?"). This is the one format where the topic is openly visible; the masking holds because the stance is only scored against actions elsewhere. Timing is sharpest here: a long pause on a hot take marks a conflict worth a follow-up.
7. **Emotion targets by domain:** Love: sting, jealousy, delight. Friends: guilt, loyalty. Family: guilt, love. Money: guilt, envy, delight. Work: pride, relief. Online: jealousy, curiosity. Me: envy of peers, hope. Every emotion is a valid target (PRODUCT-TRUTH).
8. **Register:** North American casual for the first ICP (see SURVEY-SPEC-V3 section 8). Teen versions swap partner for crush or friends, and drop sex, marriage and kids.

## 6. Worked conversions

### Money × Love: the split (Sally Q14 + topics 10, 13)
Sally: "You live with your partner and earn about half what they do. Needs and housework are similar. How should shared costs be split?" (A proportional / B equal)

**L1, what she sees** (fun voice): "Think of the last bill you split with your person (or a date). How did it actually go down?"
- Straight down the middle. Clean math, zero feelings.
- Whoever earns more covered more. Seemed fair.
- They got it. I said thanks and meant it.
- I paid my half, then did the math later. Quietly.
- Tap two, if chosen: "Would that change if...": it happened every week / they earned way more / it was a first date

**L2, the hidden layer:**
- Mask: looks like a money opinion. It's really about what she does when fairness feels off.
- Emotion target: the small "is this fair?" tug, mostly guilt with some resentment.
- Thesis move: recognition.
- Eligible for: anyone with a person or who dates. Teen version: splitting with a friend.

**L3, the evidence:**
- equal split → fairness_rule: equal (did)
- proportional → fairness_rule: proportional (did)
- they paid → closeness_style: togetherness (slight), literal "accepted provision"
- did the math later → need_voice: Absorber (moderate), E: resentment or worry
- Mirror partner: the fairness hot take

### Friends: the third call (Sally Q27 + topic 46)
**L1:** "Think of the last time a friend needed to talk about the same thing, again, on a night you were running on 4%. What happened?"
- Picked up. Full session. Sleep is a social construct.
- Picked up, and quietly set a timer in my head.
- Texted "can't tonight, tomorrow?"
- Let it ring and sent a heart later.

**L2:**
- Mask: looks like friend loyalty. It's really her capacity boundary.
- Emotion target: guilt, plus "I've done that".
- Eligible for: everyone.

**L3:**
- full session → need_voice: Absorber (strong)
- timer → Asker (slight)
- text → Asker (strong), Out loud (slight)
- let it ring → friction: Let it breathe (moderate), E: guilt
- Mirror partner: the capacity hot take

### Family: the offer with strings (Sally Q21/Q24)
**L1** (kind voice): "Your parents offer to help with rent, as long as you move closer to them. Your honest first move?"
- Take it. Family is family, and rent is rent.
- Take it, and say out loud what the deal is and isn't.
- Say thank you, and not yet.
- Say no before they finish the sentence.

**L2:**
- Mask: looks like money. It's really duty against autonomy.
- Emotion target: love tangled up with obligation.
- Eligible for: adults. Teen version: "Your parents offer a later curfew, if you share your location."
- This is a hypothetical (*would*) item, so it pairs with a *did* family scene before anything claims support.

**L3:**
- take it → duty_direction: family first
- take it and say the terms → Asker (strong), family first (slight)
- not yet → my plan first (moderate)
- no → my plan first (strong), friction: Name it (moderate)

## 7. What this changes in the open decisions

- **Grill Q1 (domains):** answered by section 2, seven domains. Confirm.
- **Grill Q2 (reveal layers):** the values layer is where "who you are" gets its content. The mirror is where "what's underneath" gets its tension.
- **Grill round 3 (contradiction pairs):** section 4 is the proposal.
- **New decision:** cut the policy and identity items (section 1). Recommendation: cut.
- **New decision:** hot-takes swipe round, about 8 items at 3 seconds each. Recommendation: yes. It's the fastest way to get stances and the best place to use timing.

## Changes

- 2026-09-26: Created from Sally's research (sources in research/sally-values-2026-09-26).
