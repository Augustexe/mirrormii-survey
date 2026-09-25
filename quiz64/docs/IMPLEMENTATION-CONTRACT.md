# Switch Modes v3 implementation contract

**Historical v3 contract.** For the V4 language candidate based on `533c3da`, use `ASTRA-IMPLEMENTATION.md`, the V4 question map and the executable bank/engine contracts. The v3 counts and storage keys below are not current for that candidate.

Status: local implementation test, not deployment approval or scientific validation.

## Product thesis

The useful portrait is not a permanent type. It is the pattern between the situation, what mattered, and what the person did.

The result should deliver three distinct things without conflating them:

1. **Recognition:** a bounded contextual contrast the respondent can inspect.
2. **Credibility:** exact answer receipts, explicit scope, alternatives, and a next validation.
3. **Drama:** predictions frozen before eight sealed checks, with abstention and a visible baseline.

## Route

- 32 profile/context candidates (`n01`–`n32`).
- Eight sealed checks (`t01`–`t08`).
- `n08`, `n20`, and `n24` appear only after an authored parent answer; `n06` appears only when the respondent selects an authored tender topic.
- Respondent route: 36–40 questions across six chapters.
- Changing a parent answer deletes now-hidden follow-up answers, notes, Other text, and any frozen check state.

## Evidence invariants

- Opening friction, social context, goal, tender topic, challenge preference, and teaching tone are direct facts only.
- Every narrative receipt reproduces the selected authored answer text exactly.
- Action and motive remain separate fields from one linked event.
- Multiple tags or linked questions from one event never count as independent corroboration.
- A linked claim requires a literal scored receipt from every required question.
- `other`, `skip`, and `no_example` are distinct and unscored.
- Variable routine answers remain unknown; they are not mapped to a low score.
- Feeling and outward response are separate. Recovery is absent unless asked directly.
- Repeated-pattern claims require two distinct source questions, exclude linked-event dimensions, and remain provisional.
- Every claim states evidence status, scope, alternatives, and the next useful validation.

## Frozen checks

- Training answers freeze before any check is shown.
- Check answers never enter the portrait or prediction sources.
- Thin or tied evidence abstains.
- Predictions are exact-option matches with fixed authored baselines; they are not calibrated probabilities.
- Check results remain hidden until all terminal check questions are resolved.

## Result and continuation

- The hero teaches the Switch Modes thesis while preserving the approved two-line/emphasized markup.
- Teaching copy follows the selected tone: `understanding`, `direct`, `funny`, or `permission-first`.
- Direct goals and preferences appear as literal context, never inferred traits.
- The CTA previews a goal-aligned next MirrorMe step; it does not claim that benefit has already occurred.
- True/False appends an immutable claim/evidence snapshot. It cannot rewrite the portrait, confidence, or predictions.

## Storage and boundaries

- State version: `genii-switch-modes.v3`.
- Local key: `genii.switch-modes.v3`.
- Older attempts fail closed and remain untouched under their prior key.
- No account, backend, analytics, remote write, publication, or production migration is included.
- No CSS, template layout, or visual asset change is authorized by this contract.

## Verification

The source contract is enforced by `tests/bank-contract.test.mjs` and `tests/engine.test.mjs`. Release evidence must include passing tests, a production build, a changed-file scope check, literal-receipt fuzzing, and an independent read-only review.
