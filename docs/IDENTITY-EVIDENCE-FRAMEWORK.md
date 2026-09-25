# Identity, evidence and question format — discussion draft

Status: proposed framework for interview; no runtime, scoring, UI or remote changes. Visual baseline remains approved and locked at b0d7a89. Published handoff branch release/genii-approved-design at b8cf8ec remains unchanged.

## Founder direction

The memorable result should communicate a recognizable behavioral identity, not lead with a recap of sleep and eating. Playful, sharp language and emotionally specific contrasts should make the experience worth discussing and sharing. Personality plus health context remains the collection scope. Future game username and ID functionality is relevant context, not implementation scope. Literal health evidence remains accessible and cannot be invented to support a joke.

## Proposed result contract

Use three conceptual layers within the approved presentation, without redesigning it:
1. Short character-style epithet: memorable authored copy supported by the evidence.
2. One specific behavioral tension: what the person tends to do, in which circumstances, and where the pattern differs.
3. Inspectable receipts: source answers and contexts, emotional layers, and direct health routines.

The epithet is a playful interpretation, not a diagnosis or account identifier. Account uniqueness is a future backend requirement. Neither uniqueness nor virality has been established for the example names.

## Evidence model

| Facet | Observable or directly reported points | Do not silently infer |
|---|---|---|
| Priorities under competing demands | action chosen, own cost, other person's cost, existing commitment, urgency | selfishness from a single refusal |
| Recognition and audience | seeking credit, response to praise, response to being overlooked, behavior with versus without an audience | insecurity or narcissism from enjoying praise |
| Control and uncertainty | planning, delegating, checking, response to changed plans, reversibility of risk | arrogance from taking charge |
| Closeness and boundaries | target person, helping, asking for help, saying no, requesting repayment/reciprocity | one global relationship style across family/work/partner |
| Emotional expression and repair | trigger, internal feeling/intensity, outward action, recovery time/process, repair after impact | calm feelings from quiet behavior; motives from actions alone |
| Relief and future costs | delaying tasks, seeking comfort, trading rest for work/play, later reported consequences | causal health harm or a permanent trait from one week |
| Routine/body context | usual/recent sleep, eating, movement, hydration, energy and relevant body experience | personality, adequacy, medical condition or causal explanation from a routine fact |

Each candidate question should name a primary facet, supported secondary facets, target, time window, actual/hypothetical/routine source type, and circumstances. Motives are optional directly asked evidence, not guessed explanations. A single response may support multiple facets without increasing independent source count.

## Question format contract

Hook -> concrete scene and competing priorities -> distinguishable actions -> optional targeted follow-up.

The joke earns attention. The literal scene states what happened or what is hypothetical; answer choices describe comparable actions. Humor must not change option meaning or make one answer the only funny/desirable option. Each option must map only to what it entails, including an explicit motive only when the wording supplies it. Other/Skip/no-example retain established semantics.

Mix formats deliberately:
- Actual-event recall to collect reported behavior.
- Hypothetical trade-offs to collect intended choices.
- Direct routine anchors to collect usual/recent facts.
- Matched-context scenes to examine whether a pattern transfers.
- Sparse feeling/action/recovery follow-ups, not bundles that force unsupported combinations.
- Held-out checks remain excluded from profile evidence.

Do not ask the same thing under five near-identical jokes. Route follow-ups only where a meaningful interpretation needs clarification. No new slot quota is approved; reconcile the approximately 60-question budget after mapping coverage.

## Worked drafting example

Hook: Your phone says 11:47. Someone texts, “Quick favor?” Bold use of “quick.”

Recall frame: Think of the last non-urgent favor someone asked for when you were ready for bed, within the past month. What did you do?

A. Helped then. Bedtime could wait. -> immediate help; reported bedtime trade-off.
B. Offered tomorrow. The favor survived the night. -> deferred help; protected bedtime.
C. Asked what it involved before deciding. -> sought scope; outcome unknown.
D. Said no. I was done for the day. -> declined favor; no inferred motive or lack of care.

Other / no recent example / Skip available.

Conditional clarification for C: What did you ultimately do? Do not award sleep-protection or helping tags from merely asking for details. If needed, ask who requested the favor so context is recorded. A separate explicit question is needed for why they accepted/declined and how they felt. None of these answers establishes sleep duration or sleep quality.

## Proposed evidence gates

1. Literal entailment: a tag must follow from the answer, not from comic framing.
2. Context: retain who, circumstances and time window; distinguish changes from contradictions.
3. Corroboration: broad claims need separate situations; several tags from one question or a paraphrase are not independent support. Exact minimums/weights remain open in the interview.
4. Counterevidence: inspect plausible alternative explanations and conflicting responses before choosing a strong interpretation. Withhold or narrow claims when unresolved.
5. Motive: ask why before claiming a psychological reason. “Stayed up to help” does not establish fear of rejection.
6. Cross-domain link: health and personality can be joined when evidence connects them in context. Co-occurring late sleep and generosity do not prove that helping causes late sleep.
7. Language: sharpen behavior rather than claiming a disorder, moral worth or an unreported identity. “Jock/footballer” needs directly reported interest/activity, not inferred gender or confidence. “Narcissist” is too broad and loaded for the intended answer evidence; use the specific evidenced behavior instead.
8. Honest uncertainty: a funny epithet can be provisional. Weak evidence must not trigger a stronger invented story. Count-based confidence remains a known current limitation.

## Naming direction — authored creative candidates

These are not validated types, finalized names or inferred facts. Each would need an explicit inclusion/exclusion rule after the evidence model is agreed.

| Name | Candidate supported tension | Example reveal line |
|---|---|---|
| Selective Saint | repeated care for a chosen circle; different boundaries elsewhere | You would move mountains for your people. Everyone else can use the stairs. |
| Deadline Romantic | repeated postponement followed by urgency, with alternatives/context checked | You and the deadline only get serious when one of you is about to leave. |
| Compliment Collector | repeated explicit credit/praise seeking | You accept compliments casually. You retain them professionally. |
| Resting Nice Face | reported frustration plus restrained outward response across scenes | Your face said “all good.” Your internal review was less generous. |
| After-Hours Menace | chosen late-night leisure despite an intended bedtime, distinguished from required shifts | You set a bedtime. Then treated it like a suggestion from someone you don't respect. |
| Boundary Bouncer | repeated clear limits, including with valued people | You care deeply. Access is still subject to capacity. |
| Competitive Napper | expressed competitive drive plus directly reported protection of rest | You want to win. You also want everyone to stop scheduling things during your recovery. |
| Captain Fine | repeated reported struggle plus telling others they are fine | You said “I'm fine” with the energy of a laptop at 2%. |

Prefer short, speakable names with one memorable contrast. Avoid random adjective stacks, unstable trend references, unsupported intimate explanations and assumed identity. Character epithet, interpretation and future unique username/ID are separate concepts.

## Interview frontier

Previous Q1–Q3 remain unanswered: facet separation, source strength and contextual disagreement. The latest founder message sets result emphasis but does not settle those technical choices.

Next independent creative/product choices:
- Q4: Roast intensity. Recommend affectionate but pointed; stronger jokes about actions without unsupported clinical/moral labels.
- Q5: Naming center. Recommend the dominant supported behavioral tension rather than an exhaustive adjective summary or a transient recent state.
- Q6: Motive collection. Recommend a small number of explicit, conditional “why” questions when the final claim needs a motive, instead of guessing from action alone.

After answers: map current bank to agreed facets, identify evidence gaps, design inclusion/exclusion rules for a small candidate name bank, then decide confidence and source weights. No scoring implementation before shared understanding, per the invoked grilling workflow.
