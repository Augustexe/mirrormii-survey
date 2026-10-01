# Final card read (FR, 2026-09-30)

Every served card read in both voices (Make it fun and Heart to heart), with thread messages and friend-game text, against VOICE.md section 9 and JERRY-TASTE.md. Feeling cards skipped (not served). Text only; evidence locked.

## Counts

| | Cards |
|---|---|
| Read (141 scored + 24 sealed) | 165 |
| Passed as is | 142 |
| Fixed | 23 (20 in player text, 3 in friend-game text only) |
| Could not fix without changing evidence | 0 |

Checks after the pass: `check-bank.mjs` 0 errors, 24 warnings (same 24 as before the pass); evidence diff of all 9 bank files vs `git show HEAD` (everything except prompt, options[].t, thread text, heart, friend text) 0 differences; `tests.mjs` 46 of 46 pass.

## Fixed cards (one line each)

- C1-91: Heart "cry on time" read wrong, now "cry on cue"; friend lines moved from first person to {name}.
- C1-127: Heart "I'd take Sam out myself" could read as a threat; now "remove Sam myself".
- C1-131: friend lines were first person ("I changed three words"); now {name} / {They}.
- C1-132: "Smash it" could mean destroy the app; now "Hit it". Heart answer 4 said "Their call" where fun says "You press it"; meanings now match.
- C1-144: Heart answer 1 ("I said, out loud") was clunky; reworded.
- C2-80: answer 3 broken grammar ("Zip it. Waiting by..."); fixed.
- C2-100: "Their name's on page one" didn't read; now a list of grievances with a table of contents (same move, same evidence).
- C2-143: answer 1 had no bite ("Still keeping it"); now still smiling at the talkers at parties.
- C2-161: prompt garden-pathed ("They deleted their sibling..."); now "deleted the day their sibling sold their guitar".
- C3-123: prompt said the button skips "to 100%, and everything in between"; now "past everything in between".
- C4-5: Heart answer 1 word order was awkward; fixed.
- C4-143: friend line now quotes "Future me's problem" (was unquoted first person).
- C4-53: answer 1 was a bland rule with no detail; now "Even if it's $640 of sky" in both voices and the friend line.
- C4-160: "before shot and all" was unclear; now "before-and-after and all".
- C5-91: logic bug, you can't screenshot something said out loud; the coworker now wrote it in the team chat (both voices, friend prompt).
- C5-141 (approved): bug only, friend prompt used plain "their own" instead of the {their} token.
- C5-144: answer 3 was ambiguous ("someone who works there for a month"); now "spent a month grilling someone who works there".
- C6-141: "Light hooks" unclear, now holiday light hooks. Tacos as the swap-in holiday showed up in 3 cards; this one is now a friends' potluck.
- C7-161: answer 1 had no detail; now the family yelling your full name.
- X-L2-30: "cancelled" spelling made consistent with the rest of the bank ("canceled").
- S-121: "every time something happens" was too vague to picture; now "something big".
- S-122: Heart dropped the fun version's picture; the loud sandwich is back.
- S-160: answer 1 repeated C4-82's "Rules are rules"; now "No exceptions".

## Not fixed on purpose

- Jerry-approved cards: only C5-141 touched (a token bug). The rest had no typo or grammar bug.
- "Group chat" shows up in 6 cards, each time in a different job (the setting, a ruling, a threat). It's VOICE's own slang and the audience's home turf, so left as is.

## Verdict

All 165 served cards now meet VOICE.md section 9 in both voices with evidence unchanged; nothing is held for Jerry.
