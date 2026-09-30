---
title: Persona tags V1, Sally's paired tag library and friend game mapped onto our tags
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: research/sally-values-2026-09-26/Tag-Pairs-and-Friend-Game-v1.md (Sally, received 2026-09-26); pilot/bank.js and research/blind-test-kit/cards.json tag ids; RUN-SPEC-LEDGER.md rulings
---

> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Persona tags V1

Status: **proposed.** Sally's library adds the layer the result was missing: **named, meme-style personality types** built from combinations of our tags, each with a sting line (only the owner sees it) and a 💛 "I love my imperfection" line. Her friend game is the viral loop, and it can run on a static page with no backend.

## Where it sits

```
cards (questions) → our tags (levels, strength, splits) → PERSONA TAGS (Sally) → result + friend game
                     e.g. support_capacity: B, leaning        e.g. 能量限量版 "Limited-edition energy"
```

A persona tag fires when **at least 2 of its trigger tags** are at *leaning* or stronger on the right pole and none is strongly opposite. This replaces Sally's "2 of 3 single A/B answers" with our weighted evidence. A tag in a believe-versus-did split never triggers a persona; the split becomes the plot twist instead. Circumstance answers never count, per her rule 1.

## Mapping (41 tags; the source says 42, but lists 41)

✅ computable with the 19 tags in the blind-test kit · 🟡 needs tags that exist in pilot/bank.js but not the kit, or a rebuilt trigger · ✂ cut (depends on cut items or health) · ⚠ gendered wording to rewrite

| # | Sally tag | Working English name | Triggers (our tag: pole) | Status |
|---|---|---|---|---|
| 1 | 有原則的戀愛腦 | Lovestruck, with rules | closeness_style A, betrayal_line A, repair_or_release A | ✅ ⚠ "他" |
| 2 | 清醒戀愛派 | Clear-eyed romantic | closeness_style B, betrayal_line B, repair_or_release B | ✅ |
| 3 | 全透明戀人 | Open book | phone_privacy A, closeness_style A | ✅ ⚠ "他" |
| 4 | 密碼是我最後的尊嚴 | My passcode, my dignity | phone_privacy B, *(Q42 cut)* → add closeness_style B | 🟡 rebuilt |
| 5 | 婚禮是辦給爸媽看的 🔒 | The wedding's for my parents | marriage_meaning A, wedding_budget A, family_vs_own_call A | 🟡 18+ |
| 6 | 不婚也完整 🔒 | Whole without the paperwork | marriage_meaning B, wedding_budget B | 🟡 18+ |
| 7 | 想當媽，但有條件 🔒 | Wants kids, with terms | kids_someday A, *(Q11 kids vs career, not in bank)* | 🟡 ⚠ "媽" |
| 8 | 人生不一定要有娃 🔒 | Life doesn't need a kid in it | kids_someday B, marriage_meaning B | 🟡 18+ |
| 9 | 嘴上新派，心裡傳統 | New rules for them, old ones for me | home_split A, *(Q04, not in bank)* | 🟡 ⚠ "他主外" |
| 10 | 說到做到的新派 | Walks the new talk | home_split A, *(Q03 cut, Q04 missing)* | 🟡 |
| 11 | 家族CEO | Family CEO | strings_attached A, caregiving A, family_safety_net A | 🟡 |
| 12 | 溫柔的叛逃者 | Gentle runaway | strings_attached B, caregiving B, family_vs_own_call B | 🟡 |
| 13 | 嘴硬心軟 | Tough talk, soft heart | friend_did_harm B, support_capacity A or lending A | ✅ ⚠ "她" |
| 14 | 挑人型溫暖 | Warm, selectively | friend_did_harm A, support_capacity B, phone_privacy B | ✅ |
| 15 | 人情VIP | Friendship VIP | lending A, stay_late A, celebration_budget A | ✅ (2 of 3 in kit) |
| 16 | 能量限量版 | Limited-edition energy | stay_late B, support_capacity B, celebration_budget B | ✅ (2 of 3 in kit) |
| 17 | 已讀不回但真心 | Left on read, still means it | contact_needs A, support_capacity B | ✅ |
| 18 | 需要被主動的人 | Waiting to be texted first | contact_needs B, closeness_style A | ✅ |
| 19 | AB制信徒 | Split-the-bill believer | fairness_rule A (equal), lending B | ✅ pole flip: Sally's Q14B is our A |
| 20 | 一樣痛才叫公平 | Fair means it hurts the same | fairness_rule B, *(Q16 cut)* → add effort_vs_start B | 🟡 rebuilt |
| 21 | 努力信仰者 | Hustle believer | effort_vs_start A, *(Q02, Q16 cut)* → add success_meaning A | 🟡 rebuilt |
| 22 | 起跑線偵測器 | Head-start detector | effort_vs_start B, fairness_rule B | 🟡 rebuilt |
| 23 | 野心藏在打卡背後 | Ambition on the clock | risk_style A, success_meaning A | ✅ |
| 24 | 松弛感本人 | Soft life, fully | success_meaning B, life_timeline B | 🟡 |
| 25 | 賭徒體質 | Born gambler | risk_style B, time_horizon A (now), explore_or_root A | ✅ pole flip: Sally's Q33B is our A |
| 26 | 穩字當頭 | Steady first | risk_style A, time_horizon B (later), explore_or_root B | ✅ |
| 27 | 進度條焦慮者 | Progress-bar anxiety | success_meaning A, life_timeline A | 🟡 |
| 28 | 出走型靈魂 | Runaway soul | family_vs_own_call B, explore_or_root A | ✅ |
| 29 | 紮根型老靈魂 | Old soul, deep roots | contact_needs A, explore_or_root B | ✅ |
| 30 | 志工心 | Volunteer heart | self_or_others B, *(Q35 cut)* → add support_capacity A | 🟡 rebuilt |
| 31 | 先愛自己派 | Me first, finally | looking_put_together A, self_or_others A | 🟡 |
| 32 | 取悅自己專業戶 | Professional self-pleaser | looking_put_together A, favorite_premium A | 🟡 |
| 33 | 極簡清醒派 | Clear-headed minimalist | looking_put_together B, favorite_premium B | 🟡 |
| 34 | 人體數據控 | (cut) | Q31, Q32: health items | ✂ no health data |
| 35 | 快樂優先體 | (cut) | Q31, Q32 | ✂ no health data |
| 36 | 直球選手 | Straight shooter | friend_did_harm B, feedback_style A | ✅ |
| 37 | 溫柔刺客 | Sugar-coated assassin | feedback_style B, *(Q30 cut)* → add friend_did_harm A | 🟡 rebuilt |
| 38 | 規則守門員 | (cut) | Q38, Q40: public-policy items | ✂ |
| 39 | 情境主義者 | (cut) | Q38, Q40 | ✂ |
| 40 | AI知己派 | AI confidant | ai_apology A, ai_companion A | 🟡 |
| 41 | 真人原話派 | Own words only | ai_apology B, ai_companion B | 🟡 |

Totals: 16 ✅ work with the kit today; 21 🟡 need bank tags added to the kit or a rebuilt trigger; 4 ✂ cut. Three trigger poles are flipped between Sally's A/B and ours (Q14, Q33, Q36), so mapping is by meaning, never by letter.

## English lines, first drafts (need Jerry's register approval)

| Tag | Sting (owner only) | 💛 |
|---|---|---|
| Lovestruck, with rules | You say you're independent. You still want to be in every part of their day. | I love all the way, and I know where the door is. |
| Clear-eyed romantic | You're not unromantic. You just won't hand over the wheel. | I'm me first, then someone's someone. |
| Tough talk, soft heart | You'll tell them they're wrong, then answer their 2am call. | My hard words are armor. |
| Limited-edition energy | Your kindness has a daily cap. When it's gone, it's gone. | I charge myself first, so I have more to give. |
| Left on read, still means it | Months of silence feels normal to you. They might think you drifted. | Missing you doesn't need to clock in. |
| Waiting to be texted first | You say "whatever happens, happens." You're waiting for them to text first. | Wanting to matter isn't embarrassing. |
| Split-the-bill believer | Love is love, a tab is a tab. Your biggest fear is owing someone. | Owing no one is my freedom. |
| Born gambler | You'd rather regret doing it than regret not doing it. | If I lose, it's still a good story. |
| Steady first | Your sense of safety gets saved one deposit at a time. | Steady isn't boring. It's my backbone. |
| Runaway soul | You love everything here. You're more scared of only ever seeing here. | Going far is how I see myself clearly. |
| Straight shooter | You think the truth is respect. Some people just feel poked. | I'd rather annoy you than lie to you. |

## Result, combined with the prediction register

1. **Title:** the top persona tag, working as the zodiac-style name.
2. **One short read** (2 or 3 sentences) that ties the four tags together, using one quoted answer and the split, if there is one.
3. **Four tag cards:** name, sting line, 💛 line. The four come from different areas (not three love tags), picked by trigger strength.
4. **Genii's calls:** three situation predictions.
5. **Friend game invite:** "Do your friends really know you?"

## Friend game on a static page (no backend)

1. The owner's result link carries only their 4 persona tag IDs in the URL `#` fragment. No answers.
2. The friend sees 12 cards: the owner's 4, their 4 opposites, and 4 same-area distractors (never 🔒 tags). The friend picks 4 "I think you're…".
3. The friend's page shows how many they got, with 💛 lines only, then "Your turn: see if they know you" (the loop back).
4. The friend taps "Send my picks", and a return link carries their 4 picks. The owner opens it and sees three zones:
   - **They get you:** tags the friend picked right, with the 💛 line.
   - **What they don't see:** tags the friend missed, with the sting line. This is the most screenshot-able zone.
   - **Who they think you are:** the opposite tags they picked ("They think you're a Clear-eyed romantic. You're Lovestruck, with rules.").
5. The match rate is our friend-agreement measure (TAG-VALIDATION-SPEC): does the tag describe how others see you?

Needs: an opposite for every tag. Five of Sally's are not clean pairs (Progress-bar anxiety and Soft life, Volunteer heart and Me first, the family pair, the minimalist pair, the AI pair) and must be fixed.

## Sally's four rules, and where they already live

| Sally's rule | Already in our spec as |
|---|---|
| Circumstances never trigger a preference tag | The "circumstance" answer option (the $200 jacket's bill line), which records context and never scores |
| 🔒 marriage and kids tags stay out of the friend game unless the owner opts in | 18+ gating; extend to "never shared by default" |
| Sting lines only for the owner | The share-safe rule: private evidence never leaves the owner's view |
| Meme-style names only; no diagnoses, no moral labels | The never-read-as field on every tag |

## Changes

- 2026-09-26: Created from Sally's library.
