---
title: Genii survey spec V3, evidence and question parsing
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: live bank quiz64/src/question-bank-v2.js and game-outcome.js at ebaac09 (codex/final-survey-dossier, the deployed build); EVIDENCE-FRAMEWORK.md; onboarding 04-genii-survey.md; PRODUCT-TRUTH.md (target, couples angle, emotions); SYNTH-30 persona SYN-23; 2026-09-26 simulation of the live scoring code
---

# Genii survey spec V3: evidence and question parsing

Status: **proposed.** Answers the team's 2026-09-26 feedback (evidence parsing and question parsing). Nothing here changes the live build until Jerry approves it. Visual companion: [Genii Evidence Map](https://claude.ai/artifact/1XxJSjdr1Fbim1o14a8r9H) (private until shared from its Share menu).

## 1. Verdict

The evidence engine is sound: receipts, source strength, sealed guesses and "unknown is a valid result" are the right substrate and stay. The question layer on top of it is what fails. Measured on the live code on 2026-09-26:

| Problem | Number | How it was measured |
|---|---|---|
| Answers that count toward nothing in the title | 77 of 140 answer options (55%) produce no trait evidence | Option-level count of axis predicates, 33 profile items |
| Questions that parse to no trait at all | 11 of 33 (E03, E06, W03, S02, S04, S08, R01, R05, R06, M01, M04). Six of them feed a "How to meet me" card; five (E03, W03, S02, R05, M01) reach the result only as a quoted receipt | Same count, plus grep of the result code |
| Options lean one way | 20 left-pole options against 43 right-pole options across the five axes | Same count |
| A random clicker gets a confident title | 95% of 400 simulated random respondents got a named title on the full route; one title ("Chief Already Made a Checklist") went to 17% of them | Monte Carlo through `dossier-session.js` and `buildGameOutcome`, seed 42 |
| Quiet people all get the same title | A respondent who always picks the left pole got one title in 41 of 41 runs ("The Unscheduled Think Tank"); an always-right respondent spread over five titles | Same simulation |
| Short routes break | Work and study route: 37% "Plot still developing" for random answers, 62% with 20% skips. Social route: 25% and 51% | Same simulation |
| Emotion is barely asked | 1 item of 33 asks what she felt (S02) | Tag audit, section 4 |
| The couples angle is missing | 0 items name a partner. The close-connection section says "a person" or "someone" | Tag audit |
| Copy speaks the wrong dialect | Dry British satire ("trousers", "parliament", "Minister of", "limited diplomatic visa") for a first ICP who is a North American woman aged 18 to 34 who plays cozy games | Read of question-voices-v2.js against PRODUCT-TRUTH target |

Worked example (section 8): the SYNTH-30 persona Jasmine answers all 33 questions. Only 14 of her answers count toward her title. She gets "Minister of the Checklist". Her most telling answers (said yes to a favor on an empty tank, hinted instead of asking, felt the sting when a plan moved on without her) count toward nothing.

## 2. The A to E evidence tags

Nothing in the record defined an A to E framework; this section defines it. Every answer option gets one or more tags. A tag says what kind of evidence the answer is, so an author can see at a glance what a question collects and what it misses.

| Tag | Name | The question it answers | Example evidence | Where it lands in the result |
|---|---|---|---|---|
| **A** | Action | What did she do (or would do) | "Offered a smaller version I could manage" | Trait axes and the title |
| **B** | Bond | Who was it with | partner, close friend, group chat, colleagues, strangers, self | "With your person / with the group" splits, pair card |
| **C** | Context | Where, how high the stakes, who was watching | work, low stakes, public group | Scope of every claim; "depends on context" |
| **D** | Desire | What she wants, needs or wishes others knew | "I want more of your time, on purpose" | "How to meet me" cards, pair card |
| **E** | Emotion | What she felt | sting, relief, guilt, envy | Emotional signature (new) |

Every tag also carries a source grade, which the engine already has: **did** (retrospective, weight 0.80), **would** (hypothetical, 0.55), **prefer** (stated preference, 0.45). Sealed checks are A-tagged but never profile evidence.

Rule: every scored option must carry an A, D or E tag that lands somewhere in the result. No option may parse to nothing silently.

## 3. What we analyze

### Characteristics: six axes (five live, one proposed)

Plain names are proposed for the result screen; internal IDs stay.

| Axis ID | Left pole | Right pole | Status |
|---|---|---|---|
| `activation_tempo` | Watcher: pause, watch, prepare | Starter: move, test, initiate | live |
| `social_signal_style` | Behind the scenes: private, indirect | Out loud: direct, visible | live |
| `friction_posture` | Let it breathe: smooth, absorb, wait | Name it: repair, boundary | live |
| `structure_reliance` | Improviser | Planner | live |
| `novelty_aperture` | Usual order | Side quester | live |
| `need_voice` | Absorber: hints, handles it alone, lets it pass | Asker: says the need, names the limit, takes the help | **proposed** |

Why `need_voice`: it is the couples trait (do you say what you need to your person), and it converts ten options that already exist but parse to nothing (W04, W08, R05, S07) into evidence without new questions. Non-claims: not assertiveness, self-worth, attachment style or relationship quality. Cost: the title table grows from 50 names (10 pairs x 4 + 5 singles x 2) to 72 (15 pairs x 4 + 6 singles x 2).

### Central emotions: nine, mapped to the company's emotion vectors

PRODUCT-TRUTH: every emotion, negative or positive, is an attack vector. The survey records them as literal, bounded answers ("what showed up first"), never as diagnoses.

| Survey emotion | Company vector | Asked in (V2 / V3) |
|---|---|---|
| Sting (left out, hurt) | loneliness, insecurity | S02 / S02, N4 |
| Worry (replaying it) | insecurity | none / N1, N2, S01 follow-up |
| Guilt | guilt | none / N2 |
| Cringe | shame | none / W02 follow-up |
| Irritation | frustration | S02 / S02, M01 |
| Envy | envy | M01 (fantasy) / N4, M01 |
| Relief | relief | S02 / S02, N2 |
| Curiosity | curiosity | S02 / S02 |
| Delight | delight, recognition | none / N4 |

Output: an **emotional signature** card. An emotion shown in two or more separate scenes "keeps showing up"; one scene is "an early signal". Same gates as the axes. Never shareable by default.

### Personalities: the title

Today the title is the top two supported axes and their directions, looked up in a 50-name table (`game-outcome.js`). Keep the mechanism; fix its inputs (section 5). The emotional signature supplies a subtitle line, not the title.

## 4. Scene by scene: question to evidence

Every live item, tagged. Pole names per section 3. "Nothing" means the option produces no trait evidence today. Full option-level breakdown with the parse of every answer is in the visual.

| ID | Scene | Grade | Tags | Bond | Parses toward today | V3 action |
|---|---|---|---|---|---|---|
| E01 | Free activity nearby, never tried it | would | A C | strangers | Side quester / Usual order; "pass" nothing | keep |
| E02 | Latest low-stakes plan: did you go? | did | A C | self | Starter on "went"; "delayed" and "stayed" nothing | unscore both sides (attendance is confounded by energy either way); pair with N2 |
| E03 | Unplanned small purchase | did | A C | self | nothing | cut |
| E04 | Ordinary plan change | did | A C | one person | Improviser / Planner | keep |
| E05 | Invitation where you knew nobody | did | A B C | strangers | Side quester; "research" and "decline" nothing | "decline" to Usual order, "research" to Planner |
| E06 | How you choose small things | prefer | D C | self | nothing (card) | keep as card |
| W01 | Foggy instructions, first move | did | A C | boss | Starter, Watcher, Planner | "rough first version" also Improviser |
| W02 | Visible mistake, first minute | did | A B C | colleagues | Name it, Let it breathe, Out loud | add E follow-up (cringe) |
| W03 | Useful criticism, first move | did | A B C | colleague | nothing | cut |
| W04 | Your contribution went unrecognized | did | A B C D | team | Name it (slight), Out loud; 2 options nothing | map to need_voice |
| W05 | How much planning is enough | prefer | D C | self | Improviser / Planner | "anchors" is Planner here but Improviser in S09 and H04; make it Improviser everywhere |
| W06 | Opportunity with no manual | would | A C | self | Side quester / Usual order | keep |
| W07 | Plan changed after you started | did | A C | team | Improviser / Planner | keep |
| W08 | Asked for help on an empty tank | did | A B C | colleague | Name it; "said yes quietly" nothing | map to need_voice ("yes" is Absorber) |
| W09 | A task you chose to begin | did | A C | self | Starter / Watcher | keep |
| S01 | A reply that mattered took too long | did | A B C | one person | Starter / Watcher | add E follow-up (worry) |
| S02 | A plan moved on without you | did | E B C | group | nothing (only emotion item) | keep; feeds emotional signature |
| S03 | Your joke landed wrong | would | A B C | group | Name it, Let it breathe, both signal poles | keep |
| S04 | What you edit in a new group | prefer | D B | new group | nothing (card) | keep as card |
| S05 | Friend's good news in the group chat | did | A B C | friend | Out loud / Behind the scenes | keep |
| S06 | Dinner debate at forty minutes | would | A B C | group | Starter, Watcher, Planner | keep; rewrite copy |
| S07 | Your idea, their name tag | would | A B C | team | Out loud, Name it; "later" nothing | "later" to Absorber, "private" also Behind the scenes |
| S08 | What helps after a moment sticks | prefer | D | self | nothing (card) | keep as card |
| S09 | A group plan you arranged | did | A B C | group | Improviser / Planner | keep |
| R01 | What you want attention to say | prefer | D B | someone | nothing (card) | retarget to "your person"; feeds pair card |
| R02 | Someone caught your interest | did | A B C | crush | Starter / Watcher | gate: offer only if she is not partnered |
| R03 | You wanted something: how did they know | did | A B D | someone | Out loud on "plain"; 3 options nothing | replaced by N3 |
| R04 | Something you said landed badly | did | A B C | close person | Name it on "repair"; 3 options nothing | "gave space, came back" to Let it breathe |
| R05 | Someone offered practical help | did | A B C | close person | nothing | map to need_voice |
| R06 | The ask you keep in drafts | prefer | D B | close person | nothing (card) | keep; feeds pair card |
| M01 | One message with no fallout | would | D E B | close person | nothing | recode as E (desire, irritation, worry, envy) |
| M03 | New option beside your favorite | would | A | self | Side quester / Usual order | keep |
| M04 | What you wish people understood | prefer | D | everyone | nothing (card) | keep as card |
| H01 to H08 | Sealed checks (train, meeting news, shared-space annoyance, empty room, app layout, small task, friend's win, shared-plan mix-up) | sealed | A (B C) | mixed | one axis each, never profile evidence | keep |

## 5. Parsing rules added in V3

1. **Every option lands.** Each scored option carries an A, D or E tag that reaches the result (axis, card, emotional signature or pair card). Items that cannot are cut (E03, W03).
2. **Symmetry.** If one option of an item parses to an axis pole, a comparable option must parse to the other pole. If the opposite behavior is confounded (energy, money, access), neither side is scored on that axis. This replaces the current one-sided pattern, where "went" scores Starter and "stayed home" scores nothing.
3. **One meaning per option label.** The same option wording maps to the same pole everywhere ("anchors" is Improviser in every item).
4. **Balance per axis.** Weighted left and right option totals within 40:60 per axis. After the V3 fixes and new questions the count moves from 20:43 to 37:54 (41:59); structure and friction still lean right and need one more remap each before the test in rule 5 passes.
5. **Noise test before shipping any bank.** Run the simulation in the Changes line: random respondents must spread across titles (no title above 6%), always-left and always-right respondents must each reach at least four titles across routes, and every route must name at least 70% of full-effort respondents.
6. **Emotion follows action, once.** An E follow-up appears only after an A item about the same event and shares its source unit, so it never inflates independent support.
7. **Partner items are gated, not assumed.** Setup asks "Is there a person you'd call your person?" (partner, best friend, family, no one right now). B-tagged items name that person; nobody is assumed to be partnered.

## 6. Five new questions (V3 candidates)

Each is tagged, graded and mapped. Options are balanced two against two. All add "No recent example", "Different story" and "Skip".

**N1. The small annoyance** · did · A B C E · bond: your person · axes: friction_posture, social_signal_style
"Think of the latest small thing your person did this month that bugged you. What happened in the first hour?"
- Said it lightly, right then. → Name it (strong), Out loud (moderate)
- Waited, then brought it up one on one. → Name it (moderate), Behind the scenes (moderate)
- Let it go, and it actually went. → Let it breathe (strong)
- Let it go on the outside. The inside kept the file open. → Let it breathe (moderate), E: worry
Fills: couples, friction balance, worry.

**N2. The cancelled plan** · did · E C · bond: self · shares a source unit with E02 when it is the same plan
"Think of the latest plan you cancelled or skipped this month. What was loudest afterward?"
- Relief. The couch and I were right. → E: relief
- Guilt, with a side of relief. → E: guilt, relief
- Worry about what they thought. → E: worry
- Nothing much. Plans change. → E: none
Fills: guilt and relief, the highest-converting pair in the company's emotion list.

**N3. The ask** (replaces R03) · did · A B D · bond: your person · axes: need_voice, social_signal_style
"Think of the latest time this month you needed something from your person: a hand, some time, a reply. What did you do?"
- Asked for it, in actual words. → Asker (strong), Out loud (slight)
- Dropped a hint and watched the radar. → Absorber (moderate)
- Did it myself. Faster than explaining. → Absorber (strong)
- Asked someone else instead. → Asker (slight), B: redirected
Fills: need_voice, couples.

**N4. Their good news, your wish list** · did · E B · bond: close friend or your person
"Think of the latest time this month someone close to you got the thing you'd been wanting (the trip, the job, the lucky pull). First honest reaction?"
- Pure happy. Confetti, no footnotes. → E: delight
- Happy, plus a small sting I'll never mention. → E: envy, delight
- Motivated. Noted, and now it's on my list. → E: envy
- Needed a minute before I could say congrats. → E: sting
Fills: envy and delight from a real event (today envy exists only as a fantasy draft in M01).

**N5. Usual order or something new** · did · A C · bond: self · axis: novelty_aperture
"Think of the latest time this month you could pick your usual (food, show, game, route) or something new. What did you actually pick?"
- Something new, no research. → Side quester (strong)
- Something new, after reviews or asking around. → Side quester (moderate)
- My usual, after a real look at the new thing. → Usual order (moderate)
- My usual. It has never let me down. → Usual order (strong)
Fills: novelty today rests on three imagined scenes and one real one, so it rarely gets past "thin" (38% thin for random respondents).

## 7. The opening set: first-journey questions

The survey's job (onboarding 04): make her feel seen, make her laugh, make her send it to someone. The first five scenes after setup carry that job, so they are ordered for it, not by section.

| Order | Item | Why here |
|---|---|---|
| 1 | S05 friend's good news in the group chat | Instant recognition, no stakes, a real memory |
| 2 | E04 ordinary plan change | Funny, universal, starts the Planner axis |
| 3 | N1 the small annoyance | The couples hook lands early; she thinks "my partner has to take this" |
| 4 | N2 the cancelled plan | First emotion; guilt and relief are the most shared feelings |
| 5 | S01 the slow reply, with worry follow-up | Recognition peak; the scene people screenshot |

## 8. Persona walkthrough: Jasmine

Source: SYNTH-30 SYN-23 (synthetic, not a customer). She is the first ICP from PRODUCT-TRUTH and has a partner, so she tests the couples angle.

**Who:** 27, Ottawa, medical office admin (was a nurse's aide), lives with her partner, no kids. Plays Genshin and Love and Deepspace on lunch breaks, does dailies on the bus before her shift, spends modestly on cosmetics she loves and calls it earned. Steady, caring, carries other people's stuff.

**How she arrives:** a creator's TikTok: "we took the Genii quiz and my boyfriend got 'The Group Chat's Unpaid Manager' and I'm not okay." She taps because she wants to know what she'd get, and because she wants to send it to him.

**Setup choices:** Everyday me · Make it fun · includes closer connections · her person is her partner.

**Her language:** casual, lowercase captions, a little self-roast ("plant is thriving unlike me lol"), gacha words (pull, dailies, banner, coord), cozy words (my little corner), a purple heart. What lands: warm teasing, specific scenes, being noticed. What misses: corporate satire and British idiom ("trousers", "parliament", "Minister of", "diplomatic visa"). Rewrites in her register, same meaning:
- E05 "Declined; mystery is charming until it requires trousers." → "Declined. My pajamas had seniority."
- E02 "Went, but on a limited diplomatic visa." → "Went. Stayed an hour. Vanished."
- S06 "accidentally invented a parliament" → "the group chat has been picking dinner for forty minutes and it's become a whole committee"

**Her questions, answers and parse (V2 live versus V3):**

| Item | Her answer | Tags | V2 parse | V3 parse |
|---|---|---|---|---|
| S05 good news in the chat | React now, follow up properly later | A B C | Behind the scenes (slight) | same |
| E04 plan change | Asked for the new time and place | A C | Planner (slight) | same |
| N1 small annoyance | Let it go outside, inside kept the file open | A B C E | not asked | Let it breathe, E: worry |
| N2 cancelled plan | Guilt, with a side of relief | E C | not asked | E: guilt, relief |
| S01 slow reply | Wrote a follow-up, left it in drafts | A B C | Watcher (moderate) | same, plus E: worry |
| W08 asked for help, empty tank | Said yes without naming the low battery | A B C | nothing | Absorber (strong) |
| W04 contribution unrecognized | Let it pass | A B C D | nothing | Absorber (strong) |
| N3 needed something from her partner | Dropped a hint and watched the radar | A B D | (R03 "hinted": nothing) | Absorber (moderate) |
| S02 plan moved on without her | A small clean sting | E B C | nothing (receipt only) | E: sting |
| R01 attention that lands | "I notice the weirdly specific things about you" | D B | card | card plus pair card |

**Her result, live build (computed 2026-09-26 by running all 33 of her answers through the deployed code):** 14 of 33 answers feed a trait. Structure: supported, Planner. Activation: mixed. Signal and novelty: thin. Friction: unknown. Title: **"Minister of the Checklist"**, hook "A little structure keeps the plot from eating the afternoon." True, but it misses her.

**Her result under V3 (hand-computed from the proposed mappings, not yet run in code):** need_voice at least supported, Absorber (four separate scenes: W08, W04, N3, S07; no counterevidence, since her R05 answer "accepted after talking through details" stays unmapped). Structure supported, Planner. Emotional signature: worry keeps showing up (N1, S01 follow-up, N2 side), sting is an early signal. Title from Planner plus Absorber, a new pair such as **"Everyone's Unpaid Chief of Staff"**, subtitle "Keeps the plan together. Keeps her own asks in drafts." The pair card invites her partner: "Take it and see if you get the other half."

That is the result she sends. It is what the survey exists to produce.

## 9. Decisions for Jerry

| # | Decision | Recommendation | Good | Bad |
|---|---|---|---|---|
| 1 | Adopt the A to E tags as the authoring standard | Yes | Every author sees what a question collects; dead options become visible | One more column to maintain per option |
| 2 | Add `need_voice` as a sixth axis | Yes | The couples trait; revives ten dead options | Title table grows to 72 names; projection version bump |
| 3 | Add the emotional signature card | Yes | Uses the company's emotion vectors; most shareable layer | New result section to design; privacy review for the share card |
| 4 | Ship the five new questions and cut E03, W03 | Yes | Fills emotion, couples, novelty; net length +3 | Full route grows from 33 to 36 profile scenes unless two more are cut |
| 5 | Rewrite the playful voice in North American casual | Yes, as its own pass | Speaks to the first ICP | Voice review and tests redone |
| 6 | Pair mode (two people compare titles) | Spec next, after 1 to 4 | The couples angle becomes a mechanic, not a line | Needs a share link design; still no backend |

Unchanged: no health data in the survey (Jerry, 2026-09-24); the evidence gates, receipts, sealed guesses and share-safe card rules in EVIDENCE-FRAMEWORK.md.

## Changes

- 2026-09-26: Created. Noise test and tag map: [research/spec-v3-sim/](../research/spec-v3-sim/README.md); rerun after any bank change.
