> Maintained working document, promoted 2026-09-18. [Original run snapshot](../../runs/20260918T174625Z-7724d715c4d8/output/BANK-AUTHOR-NOTES.md) remains immutable. Original status and limitations below still apply; promotion is filing, not product approval.

# Candidate bank author notes

Status: experimental v2 review draft; not approved for the live route, not a replacement for the approved 64-question bank, and not a shipped product change.

## Counts and construction

- 40 candidate items total: 32 profile/context candidates (`n01`–`n32`) plus eight held-out checks (`h01`–`h08`).
- The 32 profile/context candidates comprise six context/rapport/goal items, 20 behavioral items, and six direct routine anchors. The routine anchors are three usual/recent pairs: sleep restoration, meal-timing regularity, and subjective daytime energy.
- The eight checks cover corresponding dimensions and targets from the profile bank while using new situations. These are near-transfer prompts, not independent validation; they must be frozen before an answer is seen and do not enter profile evidence.
- The IDs are source identifiers, not route positions, scoring weights, or an instruction to ask every item. Conditional and no-example handling should be preserved by any later routing implementation.

## Inherited decisions applied

- Kept the playful, observant English host and concrete choices while keeping each prompt literal enough to distinguish actual report, hypothetical intention, and direct routine fact.
- Kept context, goals, preferences, and routine anchors separate from personality evidence. Optional tender-topic disclosure is voluntary and may remain unanswered; it is never an insecurity score or a universal belonging assumption.
- Kept actual-event recalls within the past month, recent routine anchors within the last seven days, and usual routine anchors over the past month. Follow-ups name their parent event and provide a neutral skip path.
- Retained Other, Skip, and no-example as separate affordances. A no-example answer is not evidence for a trait. Unknown or omitted body/skin, movement, hydration, toilet, cycle, allergy, and medical-context evidence stays unknown; none is fabricated by this focused candidate set.
- Kept behavior, motive, target, inner feeling, and outward action distinct. An action does not prove a motive; quiet outward behavior does not establish low felt intensity; contextual differences are retained rather than collapsed into one global relationship label.
- Routine anchors are plain self-reports. Their ordinal convenience values are descriptive placeholders only, not health scores, adequate/inadequate classifications, causes, or medical conclusions.
- No weights, personality family assignment, or forced single label are authored here. Multiple tags from one answer are not independent corroboration.

## New choices in this draft

- Open with broad current friction and social context, then let a participant choose a goal and optionally name a tender topic. These are route and rapport signals, not evidence that the participant is insecure, lonely, or socially unrooted.
- Include explicit participant preference about an optional friend challenge. Selecting interest is not consent to contact a friend, disclose results, or share answers; any future sharing requires a distinct affirmative action.
- Include a preference for correcting a poor fit. Any future fit feedback remains separate from source answers and profile evidence.
- Use close-friend and newer/acquaintance counterparts for the same kind of low-key plan to test context shift without asserting that closeness is universally relevant.
- Include four conditional follow-ups that clarify social motive (`n08`), helping motive/capacity (`n20`), what happened when a shared plan changed (`n22`), and inner feeling intensity (`n24`). Each specifies a parent item and a skip path for Other, Skip, no-example, or omission where applicable.
- Separate criticism response, recognition/credit, and repair after impact. Criticism prompts do not assume the source was fair or respectful; such context should be retained if volunteered or explored in a later candidate revision.
- Revision log: v2 sharpened event purpose versus enjoyment, made comparison options action-only, narrowed chosen-person reply behavior, aligned recovery options with the stem, removed authored no-example options in favor of the separate sentinel, added follow-up gates, and split held-out situations into near-transfer dimensions. The held-out set remains an internal evaluation candidate only.

## Limits and review points

- This is a small coverage experiment, not a validated psychological instrument or a complete health/body bank. It intentionally has no direct body/skin item and no movement, hydration, toilet, cycle, allergy, or condition measure. Those topics remain unknown here.
- Three brief routine anchors do not establish health status, causation, or overall wellbeing. Subjective restorative sleep is not sleep duration or adequacy; meal timing is not nutrition quality; energy is not a diagnosis.
- The profile has relatively few repeated reports per behavioral facet. Do not generate a broad claim from a single event or hypothetical, and do not equate eight near-transfer checks with independent validation.
- The friend-challenge item is research about feature interest only; it does not authorize any real friend interaction. The goal and fit-feedback items are also product/context preference, not personality evidence.
- Before implementation, check route eligibility, response storage, no-example semantics, scoring exclusions for all context/routine items, and held-out freeze behavior against the existing state contract. No UI layout or current source code was changed for this draft.
