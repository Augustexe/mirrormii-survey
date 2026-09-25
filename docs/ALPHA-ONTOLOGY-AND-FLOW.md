# Genii Alpha Ontology, Psychology, and Current Survey Flow

Status: **current-state synthesis plus proposed alpha framing** · 2026-09-18

## Problem Statement

Genii already has an integrated personality, emotional-context and health-habit survey, but its product story needs a sharper first emotional entry point. The team needs a shared language for what Genii knows, what it infers, what it predicts, what stays unknown, and how the current dashboard expresses those states.

## Solution

Use one ontology across the conversation, evidence engine and dashboard. The alpha begins with a recognized present friction, gathers direct evidence across social/emotional/routine contexts, makes a provisional portrait, then tests limited frozen predictions. The dashboard is not a bag of personality labels or a health score; it is an inspectable account of **what the user reported, what Genii tentatively reads, and what Genii was willing to test.**

## User Stories

1. As a participant, I want to see what I told Genii separately from what Genii inferred, so that a clever line does not become an unquestionable fact.
2. As a participant, I want usual routines and my recent week displayed separately, so that one chaotic period does not define me.
3. As a participant, I want an insecurity to become a private confidence goal rather than a public flaw label, so that the app has a compassionate continuation point.
4. As a participant, I want my emotional experience, visible behavior and recovery to remain distinct, so that “calm,” “angry,” “quiet,” or “direct” are not flattened into one identity.
5. As a participant, I want Genii to abstain when it lacks enough evidence, so that uncertainty is visible rather than hidden behind an impressive percentage.
6. As a participant, I want a wrong prediction to be interesting and correctable, so that I remain the authority on my own experience.
7. As a participant, I want private tender context and detailed health data excluded from sharing, so that a viral result does not expose my personal life.
8. As a MirrorMe user, I want Miia to continue from my selected confidence goal and rapport preferences, so that downloading the app delivers the relationship the survey started.
9. As the team, we want the same terms used in copy, data, results and evaluation, so that “prediction,” “confidence,” and “fact” do not change meaning across surfaces.
10. As an evaluator, we want to distinguish recognition from prediction performance and both from health outcomes, so that a delightful alpha is not overclaimed as validated care.

## Implementation Decisions

### 1. Core ontology

| Entity | Meaning | Example | May be public? |
| --- | --- | --- |
| Current friction | Explicitly selected area that matters now | “I feel outside around people” | No |
| Current chapter | Relevant life context selected by the user | Work, relationships, routines/body | No |
| Insecurity / tender point | Explicit self-report of what gets loud and its feared meaning | “I worry I am easy to replace” | No |
| Confidence goal | A user-selected desired shift, not product efficacy | “Ask for closeness without auditioning” | No |
| Rapport permission | How Jeannie should approach tender topics | Gentle, direct, playful, ask first | No |
| Observation | Versioned literal answer with role, window, context and source | “Delayed eating on a stressful day” | No |
| Direct fact | A reported routine/context fact | Sleep duration band; movement days | No |
| Routine measure | A named axis with usual/recent records and evidence coverage | Sleep restoration; skin attention | No |
| Pattern claim | An evidence-backed provisional interpretation | “Often delays sleep for optional tasks” | No |
| Emotional record | Separate feeling, outward response and recovery observations | Felt angry; spoke calmly; took space | No |
| Prediction | Frozen pre-answer guess about an unseen choice, with reason and sources | Guesses later sleep choice | No |
| Prediction outcome | Held-out answer comparison plus baseline | Matched, abstained, skipped | No |
| Feedback | True/False review attached to a claim snapshot | “Not quite” | No |
| Public identity | Deliberately allowlisted entertaining result fields | Genii family / public card | Yes, only when selected |

### 2. The alpha psychology

The product thesis is not that people need a diagnosis. It is that people often seek language for a contradiction they can feel but cannot organize.

For the first route, the contradiction is:

> “I have people around me, but I do not always feel known, secure, or able to stop performing.”

The alpha uses five psychological moves:

1. **Recognition:** name the present friction in an ordinary scene.
2. **Differentiation:** distinguish access to people, belonging, performance cost, and protective behavior.
3. **Meaning:** let the user name the insecurity and what they fear it means.
4. **Agency:** translate the feared meaning into a confidence goal the user chooses.
5. **Evidence:** connect this story to direct emotion, routine and health-habit observations without claiming a disease or universal cause.

The value is a better question, not a clinical answer: “Where am I performing belonging?” “What does recovery cost me?” “What can I try without treating myself as a problem?”

### 3. Current survey and result flow

The reviewed local alpha route currently has **76 reachable candidates**, with **64 questions per route**: **56 profile/context questions** followed by **8 sealed held-out checks**. It uses deterministic authored mappings, relevant replacements, unscored written Other, distinct Skip/no-example/omission states, and a frozen profile before tests.

```text
Landing / purpose
  → context and relevant-route selection
  → 56 profile, emotion, routine and context scenes
  → freeze evidence, facts and predictions
  → 8 unseen-choice sealed checks
  → private integrated dashboard
       ├─ everyday rhythm: usual month / recent week
       ├─ provisional portrait claims + True/False + receipts
       ├─ feeling / response / recovery
       ├─ directly reported facts
       ├─ prediction stats + no-profile baseline
       └─ full evidence groups
  → export/review or future MirrorMe continuation
```

The dashboard already orders health/routine data before the broader portrait. It covers sleep, eating, movement, recovery, hydration, body and skin. Its routine cards are descriptive—not a global health score—and display evidence coverage separately. The portrait is provisional; shown claims expose source scenes and True/False feedback does not change the original result.

### 4. Alpha synthesis without changing the current structure

The five-beat belonging opening belongs at the top of the existing profile/context phase. Its result appears as one private provisional portrait claim and a route selector, not as a new score or a replacement dashboard.

```text
Current-friction opening
  → social belonging claim, if supported
  → selected emotional/routine follow-ups
  → direct health measures
  → integrated dashboard
```

Illustrative private result:

> **Socially present, not always socially settled.**
> You reported people being available, but also monitoring whether you fit, editing yourself after social time, and becoming useful or quieter when unsure. You may be protecting belonging by becoming easy to accommodate.

Then the existing rhythm cards remain specific:

- **Sleep:** usual and recent timing/restoration reported separately.
- **Eating:** direct recent routine plus any direct stress-day account.
- **Movement:** directly reported routine/frequency.
- **Skin:** reported comfort/care attention only; no diagnosis or quality score.
- **Hydration/body:** reported cue attention and constraints only.

An allowed bridge claim requires both sides of the evidence, for example:

> “On days you report more social performance and a need to decompress, you also report reclaiming late-night time.”

It cannot become: “social insecurity causes poor sleep,” “your skin reveals anxiety,” or “Genii found the root cause.”

### 5. Dashboard statistics and their meanings

| Statistic | Current meaning | Must not be presented as |
| --- | --- | --- |
| 64 route questions | Route size in the reviewed local build | A measure of scientific precision |
| 56 profile/context scenes | Evidence collection before the freeze | Independent validation |
| 8 sealed checks | Internally authored unseen-choice comparisons | An external accuracy study |
| Low / medium / high claim evidence | 1 / 2 / 3+ distinct source questions in the reviewed engine | A calibrated probability or truth score |
| Usual / recent routine markers | Past-month versus last-seven-days direct reports | A longitudinal improvement trend |
| Matches / predictions attempted | Frozen prediction agreement with answered eligible checks | A health outcome or endorsement rate |
| Abstentions | Cases where Genii declines to predict | A failure hidden from performance reporting |
| Baseline matches | Same-answer comparison without the profile | Proof that the product beats all alternatives |

## Testing Decisions

- Test the single end-to-end seam: versioned answers and context produce one reproducible private portrait containing direct facts, measures, claims, feedback and frozen prediction outcomes.
- Verify that the social opening appears as a provisional claim only with adequate, distinct source observations; otherwise the dashboard remains sparse or says it needs another conversation.
- Verify each dashboard state with complete, mixed, sparse and skipped fixtures. A skipped route must not manufacture a social or health reading.
- Verify that usual/recent markers, evidence coverage, prediction coverage, abstentions and baseline are visible and separately counted.
- Verify that **public share projections** exclude insecurity, health measures, raw observations, prediction outcomes and feedback. A **private attempt export** is different: R6 `exportAttempt()` intentionally includes answers, observations and feedback for the respondent. Preserve that existing private inspection/export capability; do not publish it as a share card. Exact future public-share fields remain a separate contract. (Filing reconciliation, 2026-09-18; see CODE-MAP.md.)
- Evaluate user research separately: recognition, feeling understood, trust, expected continuation value, and desire to return are not substitutes for prediction or health validation.

## Out of Scope

- Clinical psychology, diagnostic classification, medical-device positioning, treatment, therapeutic advice, or a claim that the app solves an insecurity.
- A numerical health quality score, a population percentile, or a claim that the current internal eight checks establish accuracy.
- Final implementation of the social opening, backend persistence, account linking, long-term memory, or app-specific interventions.
- Public disclosure of an insecurity, current friction, health routine, prediction history, or feedback.

## Further Notes

The current alpha has a legitimate “fortune teller” mechanic when it is honest about its terms:

1. A user reports a pattern.
2. Genii makes a bounded, playful inference with receipts.
3. Genii freezes an unseen prediction where enough independent evidence exists.
4. The user sees a match, miss, or abstention alongside coverage and baseline.
5. MirrorMe continues from the user’s explicit confidence goal, not a fabricated diagnosis.

This is the intended unified experience: **recognition creates attention; direct evidence creates credibility; a bounded prediction creates drama; the companion creates a reason to continue.**
