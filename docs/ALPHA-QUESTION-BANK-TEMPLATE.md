# Genii Alpha Question Bank Template and Recommended Steps

Status: **proposed authoring template** · 2026-09-18

This template preserves the active root-survey contract: roughly 60 respondent questions per relevant route, direct routine measures, separate usual/recent windows, explicit missingness, unscored Other, and sealed predictions. It does not replace the approved bank or authorize implementation.

## Problem Statement

The current bank has broad personality, emotional-context and health-habit coverage. The alpha needs a coherent opening that makes the later evidence feel like one conversation rather than a keyword pile. New questions must create high-recognition moments without silently converting social answers into health claims.

## Solution

Use a five-beat opening to identify a **current friction**, followed by a route-specific depth sequence. Every authored item has one literal construct, one response frame, an evidence role, a stated window when relevant, and a defined “what this cannot establish” boundary.

The opening produces a provisional route and rapport permission. The later bank produces the evidence for portrait claims, routine cards and frozen predictions.

## User Stories

1. As a participant, I want the first question to start with what feels hard lately, so that I do not have to invent a personality label before Genii knows me.
2. As a participant, I want each following question to feel like a logical response to my previous answer, so that the survey feels conversational.
3. As a participant, I want to select “something else,” “skip,” or “no recent example” where appropriate, so that I do not have to distort my life to fit the options.
4. As a participant, I want Jeannie to make one bounded reflection before the result, so that I can feel noticed while retaining room to disagree.
5. As a participant, I want to choose how direct or playful Jeannie should be around tender material, so that the companion earns familiarity.
6. As a participant, I want health questions to ask what actually happened in my routine, so that the result does not guess physical facts from my social life.
7. As a participant, I want a direct question about what I want to understand or build confidence around, so that MirrorMe can continue a goal I selected.
8. As an author, I want every question to carry its evidence contract, so that copy changes do not silently change what the result claims.
9. As an evaluator, I want unseen checks to remain unseen until the portrait is frozen, so that prediction results are interpretable.
10. As the team, we want equivalent route replacements rather than N/A screens, so that relevance does not become a shorter, less informative experience.

## Implementation Decisions

### 1. The five-beat opening

| Beat | Literal construct | Draft question direction | Allowed result use |
| --- | --- | --- | --- |
| 1. Current friction | User-selected current chapter | “Which tab has been quietly draining your battery lately?” | Route selection only |
| 2. Surface versus private experience | The gap the user reports | “When you are with your usual people, what is the part nobody would guess?” | Social-context observation |
| 3. Repeated scene | A concrete recent or usual pattern | “After being social, what does your brain charge you for?” | Recovery/context observation |
| 4. Desired insight / insecurity | What the user wants explained; what feels tender | “When you are having a bad day, what gets the loudest in your head?” | Private current-context and companion goal |
| 5. Rapport permission | Preferred tone/depth around tender material | “If Genii notices a pattern, should she say it plainly, gently, playfully, or ask first?” | Conversation style only |

Each beat must offer a true other/missing path. Beat 4 can lead to a direct follow-up: “What does that make you afraid is true?” and “What do you usually do to protect yourself?” Those are explicit self-reports, not inferred pathology.

### 2. Route structure after the opening

The following is an authoring allocation, not an approved visible count:

| Phase | Job | Typical question types |
| --- | --- | --- |
| Opening | Establish current friction, private/surface gap, desired insight and rapport | 5 coherent scene questions |
| Route depth | Test the user-selected social, work/future, relationship, body/routine, or other chapter | Actual event, direct self-report, context counterpart |
| Emotion | Keep feeling, outward response and recovery separate | Named feeling, literal action, recovery attempt/outcome |
| Everyday rhythm | Gather direct usual and recent health/routine measures | Sleep, eating, movement, recovery, hydration, body and skin questions only where relevant |
| Cross-context corroboration | Test the same construct in a meaningfully different setting | Different target, pressure level or real-event counterpart |
| Sealed checks | Test selected unseen-choice predictions | Frozen, held-out authored scenarios |

### 3. Example: belonging route

1. **Social reality:** “When your brain says ‘I need a human,’ how quickly does an actual person come to mind?”
2. **Belonging:** “With your usual people, are you relaxed—or on guest Wi-Fi?”
3. **Cost:** “After a social thing with people you like, what does your brain charge you for?”
4. **Protection:** “When you feel slightly outside the circle, does your internal PR team get funny, useful, quiet, or gone?”
5. **Desired shift:** “If one social splinter disappeared, would you want to know where you stand, be less edited, let people closer, have more energy, or find people who feel like yours?”

An allowed reflection after enough literal support:

> “You are not saying you have no people. You are saying that being around them does not always feel like landing anywhere.”

This does **not** establish loneliness, anxiety, attachment style, relationship quality, sleep quality, skin condition, or any diagnosis.

### 4. Bridge into direct health evidence

The social route can select the next relevant question; it cannot answer it. Examples:

- “After a high-social-energy day, where do you get your unedited time back?” may lead to a direct sleep/recovery question.
- “On the last stressful day this month, what happened to your appetite?” may establish a reported stress-appetite response.
- “When your routine gets crowded, what happens to skin comfort or care?” can establish only reported skin attention/experience.

The resulting pattern is conditional: “On the days you report social performance and later decompression, you also report delaying bedtime.” It is never: “social insecurity causes bad sleep or skin.”

### 5. Question card template

For each question, authors must document:

| Field | Required author decision |
| --- | --- |
| Question ID and release | Stable identity and content version |
| Purpose | One construct the question is meant to clarify |
| Route eligibility | The user-selected context required to show it |
| Stem and response frame | One subject; actual, usual, hypothetical or self-description clearly stated |
| Options | Literal, dignified, behaviorally distinct choices plus missing paths |
| Evidence role | Context, direct report, actual event, hypothetical, self-description or held-out test |
| Window | Past month, last seven days, latest event within a month, or explicitly hypothetical |
| Measurements/tags | Only values the literal option supports |
| What it cannot support | Adjacent inferences that must remain unavailable |
| Follow-up / counterpart | A different situation needed for corroboration or a relevant replacement |
| Host reaction | Short response to the selected literal answer, not generic praise |
| Result / prediction use | Claim, routine axis, next route, or sealed-check eligibility |

## Testing Decisions

- Test question quality at the user-facing seam: a participant can answer every displayed option as a coherent response to the stem, including Other, Skip and No example.
- Test route integrity: a belonging answer selects relevant next scenes; a non-belonging answer reaches an equivalent route without an N/A screen or missing-evidence penalty.
- Test inference boundaries: social-opening answers cannot populate health measures; direct health questions cannot automatically create personality labels.
- Test reflection boundaries: a reflection appears only when the corresponding distinct observations exist, and False leaves the original claim/evidence/predictions unchanged.
- Test each sealed item for true blindness: the profile and prediction snapshot must be frozen before the held-out answer exists.
- Use the existing route, missingness, backtracking, freeze, baseline and result-fixture tests as the highest-priority prior art.

## Out of Scope

- Rewriting the entire current question bank in this phase.
- Automatically scoring written Other answers.
- A final list of personality families, weights, accuracy thresholds or any clinical/health score.
- Claims that one route is universally appropriate for a particular gender, age, income, relationship status or health condition.

## Further Notes

Humor belongs in the scenery, not in a distorted measurement. “Your bedtime is a hostage negotiation” can be a Genii reaction after a direct sleep report; it cannot replace asking the sleep question.

Recommended authoring steps:

1. Select one launch route: surrounded but unrooted.
2. Author the five opening cards with their evidence contracts.
3. Map each opening outcome to existing route candidates before adding any new question.
4. Identify only the evidence gaps needed to support the resulting claim and health bridge.
5. Add context counterparts, not duplicated wording, where a claim needs corroboration.
6. Write the provisional claim, its receipts, its False behavior and its next held-out question together.
7. Review the full route with synthetic complete, mixed, sparse and skipped states before user research.
8. Test moderated first sessions for “that was uncomfortably specific,” “that was generic,” and “what did you expect the app to do next?”
