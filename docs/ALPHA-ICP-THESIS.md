> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Genii Alpha ICP and Thesis

Status: **proposed alpha direction** · 2026-09-18

This document synthesizes the founder discussion into an initial go-to-market and product thesis. It does not supersede the confirmed broad audience: North America, all genders, English first. The age range below is an initial test cohort, not an eligibility rule or a claim about all young adults.

## Problem Statement

Young adults can be socially active, visibly functional and surrounded by people while privately feeling unplaced, over-edited and unsure whether they are genuinely known. Generic personality quizzes make them feel categorized; generic wellbeing questionnaires make them feel measured. Neither gives a credible explanation for the contradiction: “I have people, so why do I still feel outside?”

The current Genii alpha needs a focused first audience and a legible reason to begin the survey. “Learn about yourself” is too abstract. “Find out what is wrong with you” is both a bad promise and an unsafe one. The product needs to earn recognition before it asks for deeper health, routine and emotional context.

## Solution

Test Genii first with **English-speaking North American adults aged 21–25 who are socially surrounded but privately unrooted**. They may be in college, early work, a move, graduation, a changing friendship group, or another transition. They are not assumed to be lonely, unwell, single, financially insecure or in crisis.

The alpha promise is:

> **Genii helps you name the gap between being socially connected and feeling personally known.**

Genii begins with the user’s present friction, identifies a bounded belonging pattern, then follows the user’s selected route into direct emotional, routine and body/skin evidence. It returns one integrated portrait: a social read, reported everyday rhythms, evidence-backed interpretations, and frozen unseen-choice checks. The companion continues only what the user actually gave it permission to know.

## User Stories

1. As a socially active young adult, I want Genii to recognize that having contacts is different from feeling securely placed, so that I do not receive generic advice to “meet more people.”
2. As a participant who is unsure what is bothering me, I want to select a current friction before answering detailed questions, so that the conversation starts where my life actually is.
3. As a participant who does not relate to the belonging route, I want an honest pivot to work, money, dating, routine/body, or another stated concern, so that Genii does not force a friendship problem onto me.
4. As a participant, I want playful language that describes a recognizable moment, so that the survey feels observant without making my answer look morally better or worse.
5. As a participant who feels insecure, I want to name what gets loud in my head and what I fear it means, so that my result reflects the actual tender point rather than a generic trait label.
6. As a participant, I want Genii to distinguish what I reported from what it inferred, so that I can see where a sharp read ends and a fact begins.
7. As a participant, I want to correct an interpretation without losing my original result, so that disagreement is part of the relationship rather than a failure state.
8. As a participant, I want my health and routine data to be described plainly, so that I do not receive a fake overall health score or clinical verdict.
9. As a participant, I want a prediction to be made before I answer its test question, so that Genii’s “fortune teller” moments feel earned rather than retrofitted.
10. As a participant, I want the app to continue from the specific confidence goal I chose, so that downloading MirrorMe feels like a continuation rather than a new unrelated product.
11. As a prospective user seeing social content, I want the opening claim to name a sharable contradiction, so that I can recognize myself without having to self-identify as vulnerable or broken.
12. As the product team, we want to learn which current friction yields both high recognition and an expectation MirrorMe can fulfill, so that a high click rate is not mistaken for a viable product promise.

## Implementation Decisions

- The alpha wedge is **surrounded but unrooted**, not “all Gen Z” and not a medical or mental-health segment.
- The opening classifies a current conversation route, not a permanent personality family.
- A strong social read is a provisional claim only after distinct answers support it. It is not a diagnosis of loneliness, attachment, anxiety, trauma, social skill, or relationship quality.
- The product may use bold, funny “Genii reads” about reported behavior. It must not make disease, body-causation, treatment, cure, or health-improvement claims.
- A user-selected insecurity is explicit self-report and private context. It is not a score, a public share field, or evidence that a condition exists.
- The companion promise is to adapt pace, tone, follow-ups and small user-chosen experiments. It is not a promise to solve insecurity or improve health.
- The highest integration seam is the existing **versioned survey-state-to-portrait contract**: opening evidence, health measures, claims, frozen predictions and feedback all enter one reproducible private portrait. New product language must use that contract rather than create an untraceable parallel “vibe score.”

## Testing Decisions

- Test the complete user-visible session: opening route, resulting portrait claim, direct routine cards, frozen checks, feedback, and export/privacy boundary. Do not test whether internal weights happen to take a particular implementation path.
- A good test demonstrates that the social route can produce a supported claim only when it has adequate distinct evidence; sparse, skipped, Other and contradictory answers must produce less or no claim.
- A good test demonstrates that health facts remain direct reports and that social answers alone cannot create a sleep, skin, eating or body-quality conclusion.
- A good test demonstrates that a prediction is frozen before the held-out response, can abstain, and reports its no-profile baseline separately.
- Use the current complete, mixed, sparse and skipped synthetic result fixtures as prior art for result-state coverage; use real moderated participant sessions for recognition and expectation testing.
- Proposed discovery measures: hook-stop, landing continuation, completion through the first five questions, selected current friction, perceived relevance, feeling understood, expected app value, and willingness to continue. Do not treat these as health or accuracy validation.

## Out of Scope

- A claim that the alpha cohort is the largest, most vulnerable, or most profitable audience.
- Paid campaign execution, audience targeting, age gating, clinical validation, diagnosis, treatment, or health recommendations.
- Personality accuracy thresholds, longitudinal outcome claims, a universal relationship taxonomy, and final Genii character/family assignment.
- Production account, storage, consent, data-retention, or remote backend decisions.

## Further Notes

The phrase to test is not “something is wrong with you.” The stronger and safer tension is: **“You can have people around you and still not feel known.”**

Candidate social hooks:

- “You have people. Why do you still feel like you are on guest Wi-Fi?”
- “You do not lack social skills. You may just keep submitting friendship applications for jobs you already have.”
- “You are not short on people. You may be short on places where you can stop performing.”

Before public use, validate the exact marketing and result language for the impression it creates; a disclaimer does not correct a health or efficacy promise that the surrounding product experience implies.

Synthetic segment fit across the 22 company ICPs (SYNTH-30, 2026-09-23) is in [MARKET-MODEL.md](MARKET-MODEL.md). It ranks cozy and character gamers and "seen, not graded" score refugees highest. It is model judgment and does not validate or replace this alpha cohort hypothesis.
