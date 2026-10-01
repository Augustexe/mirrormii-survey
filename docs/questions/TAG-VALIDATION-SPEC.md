---
title: Tag validation spec, does the tag set map 80% of people
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: Sally's 48-question tag map (research/sally-values-2026-09-26); team transcript 2026-09-26 (tags, AI-written personality article, friend loop, 80% target); VALUES-LAYER-SYNTHESIS.md; EVIDENCE-FRAMEWORK.md source weights; Jerry's rulings 2026-09-26 (web game, multiple choice only, masked, gender neutral, answer screen deferred)
---

> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Tag validation spec

Status: **proposed.** Scope is the evidence, the framework and the questions only. The answer screen, the article and the visuals are deferred (Jerry, 2026-09-26). The survey stays a web game.

The one question this spec answers: **do Sally's tags describe at least 80% of the people who take it, accurately and specifically?** And what has to be true of the questions for that answer to mean anything.

## 1. Rulings this spec follows

- Web game, not in-app. Download is not the goal here.
- Answer screen ignored for now. Tags first.
- Every question multiple choice. No free text.
- Gender neutral wording. Women stop being the survey's core ICP (Jerry, 2026-09-26). Pushback and the company-doc impact are in section 7.
- Minors are in scope. Every partner item has a teen-safe version.

## 2. What "unmasked opinion poll" means, and the format that replaces it

**Unmasked:** she can see what is being measured and which answer means what. **Opinion poll:** it asks what she believes about a general principle or an imagined case, not what she did.

Sally's Q18 is a clean example:

> You've finished your tasks. A colleague has a non-urgent problem that could wait until tomorrow and asks you to stay tonight. A: Stay; covering for the team matters. B: Say you have plans; help tomorrow.

Four problems, each with a consequence for the tags:

1. **She answers as who she wants to be.** A reads "team player", B reads "healthy boundaries". Both are flattering, so the pick tracks her self-image and the current discourse, not her behavior.
2. **It's a principle, not an event.** In our own framework a hypothetical choice weighs 0.55 and a stated preference 0.45, against 0.80 for a real recent event. Research on the gap between attitude and behavior has found for decades that stated attitudes predict what people actually do only weakly (LaPiere 1934; Wicker's 1969 review).
3. **It will be rated accurate for the wrong reason.** An article built only from these answers reads her own stated opinions back to her. She'll say "so accurate" because she wrote it. That tests whether we can copy, not whether the tags see her. It's the Forer trap from the other direction.
4. **Everyone knows the two camps.** On debate topics people pick the team they identify with online. That gives you a stance tag, which is useful, but it's not a personality tag.

It is still worth keeping. The stance is real data about what she believes, it's fast, and it's the half of the mirror that makes "you believe X, you did Y" possible.

### The synthesis: every tag gets a stance item and a scene item

```
                 one tag dimension (from Sally's 96)
                 e.g. support_capacity: Show up anyway ↔ Say so and reschedule
                        │
      ┌─────────────────┼──────────────────┐
  STANCE item        SCENE item          FRIEND item (later, friend loop)
  unmasked, fast     masked, real event  "what would Jerry do when…"
  5 levels           4 options → level   same options, same tag mapping
  grade: prefer      grade: did          grade: observer report
  "what I believe"   "what I do"         "what others see"
      └─────────────────┼──────────────────┘
                        │
     agree → strong tag     split → a contradiction tag (the "question yourself" material)
```

- **Stance items** are Sally's questions, trimmed and made neutral, shown as a fast round of 5-position taps: strongly A, lean A, both or depends, lean B, strongly B. Each takes about 4 seconds.
- **Scene items** are masked. The visible topic is the everyday moment; the tag is underneath. Each option maps to one of the same 5 levels.
- **Levels:** A2, A1, 0, B1, B2. The tag level shown to her is the scene level when there is one (it weighs more), with the stance as context.
- **Length:** stance for all tag dimensions that survive screening (section 4), scenes for the 12 to 16 that matter most or are least settled. Roughly 3 minutes of stances plus 3 to 4 minutes of scenes.

## 3. Worked examples: question, evidence, prediction

Six tag dimensions from Sally's map, rewritten to be gender neutral. Each shows the stance item, the masked scene, how each answer parses, and what we can predict from it. Predictions are specific enough to be tested: each names a sealed check she answers after the profile is frozen, plus what a friend should pick about her.

### 3.1 `support_capacity`: Show up anyway ↔ Say so and reschedule (Sally Q27, Q18)

**Stance** (5 positions): "A friend needs you tonight, and you're running on empty. Being a good friend means…" A: showing up anyway. B: saying so and picking another time.

**Scene** (masked, *did*): "Think of the last time someone wanted a long talk or a favor on a night you were running on 4%. What happened?"

| Option | Level | Also records |
|---|---|---|
| Showed up, full session. Sleep is a social construct. | A2 | need_voice: Absorber |
| Showed up, and quietly set a timer in my head. | A1 | |
| Sent "can't tonight, tomorrow?" | B2 | need_voice: Asker, signal: out loud |
| Let it sit and replied the next day. | B1 | friction: let it breathe; emotion: guilt (if she then taps "felt bad") |
| No recent example / Skip | none | missing, not neutral |

**What we can predict:**
- **Sealed check:** "Your group chat asks who can help someone move on Saturday, your only free day. First reply?" A2 or A1 predicts "I'm in" or "I can do the morning". B predicts "I'll pass this time" or offering something smaller.
- **Friend prediction:** her friend picks "always there, even when tired" for A, "honest about her limits" for B.
- **Contradiction:** stance B with scene A2 is the classic "tells friends to rest, never rests". That's the strongest article material in the set.
- **Never read as:** kindness, selfishness, or how much she cares.

### 3.2 `fairness_rule`: Fair means equal ↔ Fair means proportional (Sally Q14, Q15)

**Stance:** "Two people share costs, one earns about twice as much. Fair is…" A: split it evenly. B: the higher earner pays more.

**Scene** (masked, *did*): "Think of the last shared bill (dinner, a trip, a gift for someone). How did the split actually go?"

| Option | Level | Also records |
|---|---|---|
| Down the middle. Clean math, no feelings. | A2 | |
| Roughly even; someone rounded up and nobody minded. | A1 | |
| Whoever had more that month covered more. | B2 | |
| I covered it and didn't bring it up. | none on this tag | need_voice: Absorber (covering it all is not a fairness rule) |
| Even split, and I did the math on it later. | A1 | emotion: resentment or worry |

**What we can predict:**
- **Sealed check:** "Group trip house costs $1,200. One friend's room is much bigger. What do you propose?" A predicts an even split; B predicts "big room pays more".
- **Friend prediction:** "keeps it even" (A) or "pays more when she has more" (B).
- **Contradiction:** stance B with "did the math later" means she believes in proportional fairness but keeps score.
- **Never read as:** stinginess, generosity or wealth.

### 3.3 `closeness_style`: Togetherness ↔ Own orbit (Sally Q05, Q41, Q26)

**Stance:** "With the person you're closest to, the ideal is…" A: most free time together, sharing the day. B: close, and each keeps real time and space of their own. Teen-safe as written: "closest person" can be a best friend.

**Scene** (masked, *did*): "Think of your last free weekend day with nothing planned. How much of it went to your closest person?"

| Option | Level |
|---|---|
| Nearly all of it, on purpose. | A2 |
| A good chunk, then some time to myself. | A1 |
| A check-in call or text, the rest was mine. | B1 |
| Mostly mine. We'd catch up another time. | B2 |

**What we can predict:**
- **Sealed check:** "Your closest person suggests spending all of Sunday together. You had a solo plan." A predicts moving the solo plan; B predicts keeping it and offering an evening.
- **Friend prediction:** "always down to hang" (A) or "needs her alone time" (B).
- **Pairs with** the stance on sharing phone passwords (Sally Q41), which predicts how she reacts to a partner's or best friend's privacy request.
- **Never read as:** an attachment style.

### 3.4 `repair_or_release`: Work it out ↔ Let it go (Sally Q08, Q25; topic 47, ghosting)

**Stance:** "A friendship keeps leaving you drained, with no single big fight. The mature move is…" A: talk it through and try to fix it. B: let it fade; not every friendship has to last.

**Scene** (masked, *did*): "Think of the last friendship or group chat that went quiet on your side. What happened?"

| Option | Level | Also records |
|---|---|---|
| I said something, and we talked it out. | A2 | friction: name it |
| I dropped hints and hoped it would sort itself out. | A1 | friction: let it breathe |
| It faded and I let it. | B1 | |
| I left the chat or muted it and didn't look back. | B2 | |

**What we can predict:**
- **Sealed check:** "A coworker or classmate you like has canceled plans with you three times." A predicts naming it; B predicts quietly stopping inviting them.
- **Friend prediction:** "will tell you when something's off" versus "will quietly drift".
- **Never read as:** loyalty or coldness. A "let it go" answer can be a healthy boundary.

### 3.5 `time_horizon`: Now ↔ Later (Sally Q33, Q36)

**Stance:** "Unexpected $300 lands. The best use is…" A: something you'll remember this month. B: savings or something you need later.

**Scene** (masked, *did*): "Think of the last bit of surprise money: a refund, birthday cash, a bonus. Where did most of it go?"

| Option | Level |
|---|---|
| Straight into a plan or a treat. It was gone within a week. | A2 |
| Some fun, the rest set aside. | A1 |
| Mostly saved, with one small treat. | B1 |
| Saved or spent on bills. Didn't really feel it. | B2 |

**What we can predict:**
- **Sealed check:** "A favorite artist adds a surprise show this week, $180. Your budget is fine but not loose." A predicts buying; B predicts passing or waiting for resale.
- **Friend prediction:** "the one who says yes to the trip" versus "the one with the spreadsheet".
- **Guardrail:** "Didn't really feel it" and "bills" can reflect money being tight, not a personality. B2 claims need a second scene before they reach the article.

### 3.6 `success_meaning`: Something to point at ↔ A life that feels right (Sally Q45, Q20, Q48)

**Stance:** "Five years from now, you'd rather hear…" A: "You built something people know about." B: "Your life looks exactly like you wanted."

**Scene** (masked, *did*): "Think of the last time you were offered more responsibility: a lead role, extra project, captain, organizer. What did you do?"

| Option | Level |
|---|---|
| Took it before they finished asking. | A2 |
| Took it and negotiated what came off my plate. | A1 |
| Asked for time, then said no. | B1 |
| Said no right away; I like my life at this size. | B2 |

**What we can predict:**
- **Sealed check:** "You're offered the lead on a group project: more credit, more work, and it overlaps with a trip." A predicts taking it; B predicts passing or taking a smaller role.
- **Friend prediction:** "ambitious" versus "protects her peace".
- **Contradiction:** stance A with scene B2 means she wants the recognition but guards her time. Common, and very recognizable.

## 4. Screening the tags before any human sees an article

Sally's 48 dimensions will not all survive. Run the stance and scene items on a pilot and keep a tag only if it passes all of these:

| Check | Pass rule | Why |
|---|---|---|
| Spread | The minority side gets at least 20% of answers | A tag 95% of people share tells nobody anything about themselves |
| Not all "depends" | At most 35% pick "both or depends" or skip | Otherwise the tag has no content for most people |
| Not a duplicate | Correlation with another tag below 0.6; merge if higher | Sally already flags Q01 and Q04; expect 48 to shrink to about 25 to 30 |
| Scene matches stance often enough to mean something | Stance and scene levels on the same side for 40% to 85% of people | Always agreeing means the scene adds nothing; never agreeing means one of the items is broken |
| Predicts its sealed check | Beats the "everyone picks the most popular answer" baseline | The tag knows something about the person, not just the crowd |
| Gender-neutral performance | Pass rates hold within 10 points across genders | Neutral wording is not neutral performance; check it |

## 5. What "maps 80%" means, measured

Four measures, in order of how hard they are to fake:

1. **Coverage:** at least 80% of people get at least 12 tags that aren't neutral. Too few clear tags means there's nothing to describe.
2. **Recognition:** at least 80% rate their own tag list 4 or 5 out of 5 for "this is me". Easy to pass, which is why it isn't enough alone.
3. **Swap test, the real bar:** show each person two unlabeled tag lists, their own and a random other respondent's. At least 80% must pick their own. A horoscope fails this; accurate tags pass it.
4. **Prediction lift:** across the sealed checks, tag-based predictions beat the popularity baseline by a margin we set before the pilot.

Pilot size: about 200 people, at least 80 per gender if the neutral claim is being tested. At n = 200 an 80% result carries roughly ±6 points of uncertainty. Recruit through a paid panel (Prolific is the standard option for US and Canadian adults, and results come back in a day). Recruit teens separately and only with a consent path counsel approves.

## 6. Gender-neutral audit of Sally's material

| Sally item | Status | Neutral version |
|---|---|---|
| Q01, Q04 gender division of labor | rewrite | "You and your partner earn about the same; one of you could stay home with a kid..." without gender |
| Q02 women's startup grants; Q03 tradwife | cut | policy and gender-identity items |
| Q05 to Q08 love and fidelity | keep, neutral already | teen versions swap partner for best friend or crush; Q07 sex adult only |
| Q09 to Q12 marriage, kids, wedding | adult only, neutral already | |
| Q13 to Q48 (money, work, family, friends, consumption, tech, meaning) | neutral already, apart from Q29 grooming (neutral wording needed) | |
| Feminism self-label | cut | |
| Debate topics: who pays, the ick, situationships, 50/50, low-maintenance friends, ghosting, trauma dumping, AI companions | keep as neutral hooks | "the person who asked pays" instead of "the man pays" |
| Debate topics: pick-me, 雌竞 (women competing for men's approval), mankeeping, surname rights, period leave | cut or neutralize | mankeeping becomes "your partner's only emotional support" |

Most of Sally's 48 are already gender neutral. The hottest hooks in the 60 topics are the most gendered, so neutral wording costs some heat (section 7).

## 7. Pushback: removing women as the core ICP

**Agree for the questions.** Neutral wording is right, and the friend loop requires it: the friends and partners she sends it to are often not women, and they have to answer the same items about her. A women-coded bank breaks the loop at the first share.

**Push back on the ICP itself, for three reasons:**

1. **It's a company decision, not a survey setting.** PRODUCT-TRUTH names women 18 to 34 who play cozy games as the first ICP. Creator spend is led by the Cozy Gamer track, and every campaign doc follows from that. Changing it here without changing those makes the survey the only surface speaking to everyone. I have not edited PRODUCT-TRUTH; that needs your explicit yes.
2. **Neutral wording costs heat.** Who pays, mental load and the ick are hottest when framed through women's experience. Neutral versions are cooler. Mitigation: the opening style questions can offer an optional "dating lens" pack that brings back the spicier framing for whoever picks it.
3. **"Neutral" has to be measured.** Section 4's gender check exists because a neutrally worded item can still land very differently by gender. Keep women as a named subgroup in every test, even if they're no longer the core ICP.

**My call:** gender neutral questions and tests now. Keep the company ICP as is until acquisition data says otherwise. Revisit after the pilot shows whether men pass the 80% bar as well as women.

## 8. Build status against requirements (audit, 2026-09-26)

Test build: [pilot/](../../pilot/README.md). Evidence breakdown: [PILOT-BANK-V1.md](PILOT-BANK-V1.md).

| Requirement (source) | Status | Gap |
|---|---|---|
| Multiple choice only, no free text (Jerry) | Met | none; the swap-test paste box is for researchers only |
| Gender neutral wording (Jerry) | Met | automated check; neutral performance still has to be measured in the pilot |
| Domains: love, relationships, money and so on (Jerry) | Met | 7 domains, 32 tags |
| Sally's 48 questions converted | Partial: 31 of 48 | Intentional cuts: Q02, Q03, Q16, Q35, Q38, Q40, Q42 (policy), Q30 to Q32 (health). **Missed by mistake:** Q08 repair or leave (spec 3.4 wrote it, the bank didn't), Q01/Q04 division of labor, Q09 to Q12 marriage and kids (18+) |
| 5 levels per tag (team transcript) | Met | 32 tags, 64 poles instead of 48 and 96, after cuts and merges |
| Every question masked (Jerry) | Partial | 14 masked scenes; 32 quick takes are unmasked by design; 18 tags have only the quick take, which is weak evidence (grade prefer) |
| Onion L2: emotion, psychology, targeting, timing (Jerry) | Partial | timing and "paused" flag work; each item records its mask and target feeling; only 5 of 56 scene options capture an emotion; no thesis move per item; no targeting by who they are; no emotional arc in the order |
| A to E evidence tags (SURVEY-SPEC-V3) | Missing | not in the bank's data model |
| Tone versions chosen by opening style questions (team transcript) | Missing | one neutral voice only; no style questions |
| Adaptive question picker (grill round 1) | Missing | fixed order, interleaved by domain |
| Onboarding with email (Jerry) | Missing | no backend yet |
| Teen versions (Jerry, minors in scope) | Partial | 5 quick takes have teen versions; scenes don't |
| Sealed predictions | Partial | 8 of 32 tags have a sealed check |
| 80% test: collect real answers | Missing | export works, but nothing reaches us from a panel; no consent screen; no attention checks |
| 80% test: analysis | Missing | no script yet |
| Swap test | Partial | works with a pasted export; a live pilot needs a decoy pool |
| Friend loop, article, visuals | Deferred | by Jerry's ruling |

## 9. Next steps

Rule: prove the tags before building tone, the picker, the friend loop or the article. Tone and ordering change completion, not whether a tag is true.

**Phase 1: close the bank gaps (Claude, about half a day)**
1. Add the missed tags: repair or leave (Q08, topic 47), division of labor (Q01/Q04, neutral), and marriage, kids and wedding (Q09, Q10, Q12, 18+ only). 32 tags become 37.
2. Give every tag a masked scene, or mark it "stance only, low priority". Target at least 22 scenes, so most tags have did-grade evidence.
3. Raise sealed checks from 8 to 14, one per scene tag with the most spread.
4. Add A to E tags, the thesis move and an emotion target to every item. Add an emotion code to at least one option of every scene.
5. Write teen versions of the scenes that assume rent, work or dating.
6. Order the run as an emotional arc (recognition, tension, mirror, relief, sealed), instead of plain interleaving.

**Phase 2: make it runnable with real people (Claude builds, Jerry decides the backend, about 1 day)**
7. Collection: host the pilot (GitHub Pages on the publication repo works) and add one intake endpoint that stores each export. Options: a small serverless function writing to a Lark Base "Pilot submissions" table, or a Google Apps Script sheet. Recommendation: Lark Base, since it's where survey records are meant to live anyway. Needs Jerry's call.
8. Consent screen, a data notice and a panel completion code redirect. Pilot is adults only; teens need a parental-consent path that counsel signs off.
9. Two attention checks and a minimum-time filter, standard for panel data.
10. Decoy pool for the swap test: the first 30 respondents' tag lists become the decoys for everyone after them.
11. Analysis script over the exports: every rule in section 4, the four measures in section 5, and gender split tables. The popularity baseline for sealed checks is computed from other respondents only.

**Phase 3: run it**
12. 5 to 8 think-aloud interviews first (Sally's own recommendation): does each question mean what we think, and does any option feel like the right answer?
13. Soft launch with 30 panel respondents: completion rate, median time, drop-off screen, bugs.
14. Full pilot: 200 respondents, at least 80 per gender. Rough cost at typical panel rates for a 7-minute task: $400 to $600 including fees (estimate, not a quote).
15. Gate: tags that pass section 4 stay; if the swap test clears 80%, move to tone versions, the adaptive picker, the friend loop and the article. If it doesn't, revise the failing tags and rerun only those.

**Decisions needed from Jerry**
- Collection backend for the pilot (step 7).
- Adults-only pilot (step 8).
- Panel budget (step 14).
- Who runs the think-aloud interviews (step 12): Sally is the natural owner.
- Confirm tone versions wait until the tags pass.

## Changes

- 2026-09-26: Created.
- 2026-09-26: Sections 8 (requirements audit) and 9 (next steps) added after the test build.
