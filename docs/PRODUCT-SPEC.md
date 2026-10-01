> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

> Reconciled 2026-09-18 from the approved R6 release documentation. Implementation/team instructions below describe that historical task; read [STATE.md](STATE.md) for the current build.

# Genii Personality and Health Survey: Product Spec

Version 0.6 · 2026-09-17 · Owner: Jerry Zhang · Status: superseded in part by the 2026-09-19 pivot; see Current direction

## Current direction (2026-09-25)

**The first session is a personality game, not a health survey.** Jerry's 2026-09-19 pivot ([DECISIONS.md](DECISIONS.md)) removes sleep, food, movement, hydration, body metrics and any health inference from the first session. Wellness may come later through the relationship with Genii. The sections below that describe the personality-and-health blend (health scope, sleep scope, routine bars, health acceptance rows) are superseded for the first session and kept as history; the evidence model, missingness rules, feedback rules, heldout separation, accessibility and non-claims still apply.

What is built and live since 2026-09-23 ([STATE.md](STATE.md)):

- Three contextual editions (everyday, work and study, social) with gentle, playful and sharp voices; optional personal sections are opt-in.
- Route length follows Jerry's 2026-09-21 authorization to adjust question count: 16 to 24 profile scenes (25 to 33 with personal sections) plus 8 sealed checks, replacing the roughly 60-question route of D-027.
- Evidence follows [EVIDENCE-FRAMEWORK.md](EVIDENCE-FRAMEWORK.md); the bank is [questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md](questions/QUESTION-BANK-V2-AUTHOR-GUIDE.md).
- The result is the personality dossier described in [RESULT-DISPLAY-V1.md](RESULT-DISPLAY-V1.md): provisional game nickname, five facets, answer-grounded stories, one prediction reveal, corrections, private export and a nickname-only share card.
- Still unvalidated: human comprehension, humor, shareability, usefulness and predictive value. No backend, accounts or analytics.

## Earlier spec v0.6 (2026-09-17)

**A funny conversation that reveals how you feel, respond, and handle everyday health routines.**

The root survey blends personality, emotional context and health-related habits. Questions remain recognizable, surprising and affectionate; traceable evidence makes the interpretation useful. The existing bank is broadly good. Repair coverage, repetition and routing rather than replace it wholesale.

The primary first-session outcome is recognition and earned trust: “You ask about things that matter to me, and I want to keep talking.” Genii should act as an attentive, playful host. The first portrait is provisional; label accuracy is secondary to the conversation's ability to create a credible reason to return. The audience direction is North America, all genders, with English first. Earlier age/gender/life-event examples are illustrative rather than a fixed target segment. The accepted return value is understanding yourself better and gradually finding small habits that work for you. The [host experience contract](HOST-EXPERIENCE.md) translates this direction into flow and authoring rules.

The active detailed contract is [PERSONALITY-HEALTH-SPEC.md](PERSONALITY-HEALTH-SPEC.md). Jerry's latest decisions govern over earlier documents. The [founder brief](FOUNDER-BRIEF.md) remains creative and historical source material; its personality-only framing, correction-based rescoring and example percentages are superseded where they conflict with the active contract. Git history holds the original v0.3 documents.

## Scope and implementation status

The review baseline is the React quiz64 app at commit ec89aa7: 64 authored questions, comprising 56 context/training questions and eight internal heldout checks. It has deterministic evidence mappings, separate unscored notes, missing-evidence handling and conservative prediction abstention. Technical verification does not establish personality accuracy.

This revision concerns the root survey, evidence semantics and private result. It does not reactivate the earlier 12/30/96-depth implementation or require final Genii family names, one-liners or character matching. Each route should stay around 60 questions using relevant replacements from an expanded bank. Confirmed health scope includes habits plus body/skin experience and optional relevant context such as allergies, existing conditions or cycles. Hydration, toilet routines and stress-related eating are illustrative everyday examples, not a mandatory checklist. Optional context remains reported fact, not a personality score.

Backend integration belongs to Desmond. Production accounts, Lark writes, payments, publication and remote integration remain separate work. Jerry explicitly authorized implementation on the last build with Taste guidance and Luna workers. The concrete [implementation contract](../quiz64/docs/IMPLEMENTATION-CONTRACT.md) selects 64 route slots, 56 context/profile questions plus eight frozen checks, with relevant alternatives. Current delivery status and verification belong in the implementation handoff; the older baseline below is historical.

## Confirmed experience

| Moment | Required behavior |
| --- | --- |
| Start | Explain the playful personality-and-health-habit purpose plainly; retain the brand assets and established visual direction |
| Answer | One coherent situation and response frame; short, distinct choices whose literal meaning matches the question |
| Express a different answer | Offer Other, distinct from Skip or no recalled experience; save written text unscored, as confirmed in Q13 |
| Adapt | Omit known irrelevant questions entirely and use relevant replacements; solo households must not encounter shared-household chores or an N/A screen |
| Build a portrait | Separate usual patterns from recent state, and internal feelings from outward action and recovery |
| Read the result | One integrated portrait with routine/behavior bars, separate confidence and accessible evidence |
| Review an interpretation | True/False beside each individual interpretation logs feedback while preserving the original result, bars, confidence and evidence |
| Test a prediction | Freeze an unseen-choice prediction before the answer; report agreement and coverage separately from endorsement |

Preserve the approved Simplified Chinese voice and semantic parity when localization resumes. This round develops English and the shared evidence contract. Humor should live in the scenario and phrasing without making answer categories ambiguous. Keep author-facing datapoint mappings outside respondent quiz copy.

## Evidence model

Keep direct self-reports, actual-event accounts, hypothetical intentions, inferences, comparisons and respondent endorsements distinct. Actual-event accounts remain self-reports, not externally observed behavior. Question scenery alone does not support an additional dimension.

Each observation needs stable question/option IDs, version, role, context/relationship target, explicit recall window where relevant, and its literal measurements or authored tags. Each inference needs source IDs, contrary evidence, role composition and method/version. Unknown, skipped, omitted and custom responses must not become neutral or negative trait evidence.

Confirmed default windows: usual patterns over the past month; recent state over the last seven days; actual-event questions use the latest instance within the month with a no-example option. Cycle and other exceptional domains need their own stated period. Ask once and carry answers forward. Distinguish a self-description, an aspirational identity, a reported action and repeated observations over time; reflecting someone's answer is not an independently correct prediction.

The emotional contract separates **internal feelings, outward response and recovery**. Someone can feel intense anger and speak calmly. Silence alone does not establish calmness; directness alone does not establish aggression. Emotional recovery, relationship repair and physical rest are not interchangeable measures.

Seven feeling families are confirmed for bank coverage: frustration/anger, worry, disappointment/sadness, embarrassment, guilt, joy/excitement and relief. These are scenario families, not permanent labels or a validated emotional scale.

Current direct health facts are q17 bedtime band, q20 takeaway dinner days and q46 movement days. Other health questions mostly concern choices under pressure. These facts cannot establish sleep adequacy, diet quality, fitness or overall health. Select intended claims before adding the measurements needed to support them.

Survey-answer edits are distinct from True/False review. Answer edits replace or supersede observations and recompute affected eligibility. Review feedback attaches to the original result snapshot and never silently changes it.

## Sleep scope: confirmed

Include all three layers:

1. **Usual routine:** directly reported bedtime, wake time, duration and regularity.
2. **Recent changes:** directly reported disruption and restfulness, separate from usual patterns.
3. **Contextual behavior:** evidence-backed interpretations and predictions about protecting or delaying sleep when work, stress or a need for personal downtime interferes.

Do not guess exact clock times or duration from unrelated personality answers. An interpretation such as “you delay sleep to decompress when overwhelmed” needs observations supporting both the action and the stated reason. Use the confirmed default windows; exact units and response formats remain to be specified.

## Result and confidence

The main result is an integrated portrait, not a grid of identity cards. Routine/behavior bars use meaningful labels and endpoints or units. Show usual patterns and recent state separately. Keep evidence and uncertainty accessible through progressive disclosure. Final character templates and comic identity labels are deferred.

A bar's position must not double as confidence or an overall health score. Numeric percentages require a defined meaning; decorative “72% healthy,” “80% anxious” or implied population percentiles are not authorized. Missing evidence is not zero. Confidence describes evidence coverage and its limits; the demo establishes no calibrated probability.

True/False means “this interpretation fits me / does not fit me.” Preserve the exact statement, result version and evidence snapshot, then log the response separately. Neither answer changes the profile or counts as another supporting observation, a prediction hit, or a reason to force clarification. Unanswered review is neither agreement nor disagreement.

## Selected benchmarks

Recognition, willingness to continue and expected ongoing usefulness are now the primary product questions. Actual return behavior and reported benefit require a later pilot; the first-session feeling of being understood is not proof that the app improves health. Prediction checks support trust and remain technically honest, but should not dominate the visible experience. Their final count/placement is open; the founder's reference to 20 does not silently add 20 questions to the route.

Jerry delegated benchmark selection. Use two separate comparisons:

1. **Predictive value:** frozen predictions on unseen situations versus a predictor without the personal profile. Both receive the same permitted scenario/context information. Report eligible/answered items, predictions attempted, abstentions, matches and baseline results so agreement cannot hide low coverage.
2. **Context sensitivity:** reported usual behavior versus behavior under pressure. In one session this describes a self-reported contrast, not measured improvement, longitudinal change or proof of predictive accuracy.

The handoff's 80% target and independent 20-item test are historical proposals, not achieved results or automatically approved acceptance thresholds. The eight current internal checks do not fulfill that independent protocol. Peer rankings and clinical/health-quality comparisons are outside the selected benchmarks. True/False resonance remains separate.

## Visual direction and accessibility

Retain Genii brand colors and authorized assets, strong typography, readable glass surfaces and purposeful motion. Preserve asset provenance; exploratory artwork is not a canon master. The result should become cohesive and expressive without hiding evidence behind decorative numbers.

Use one clear current question and primary action. Support keyboard navigation, visible focus, readable contrast, mobile scrolling and reduced motion. Long choices and Other input must work on narrow screens; sticky controls cannot cover content. Motion must not block answers or access to the result.

Earlier visual work remains a reference, not authority to restore obsolete depth cards, rescoring interactions or character assignments. The current layout and descriptive ordinal axes are specified in the implementation contract and question map.

## Acceptance requirements

These define the implementation gates. Recorded results belong in the final local handoff and review reports.

| Area | Required evidence |
| --- | --- |
| Adaptive route | Solo/no-selected-person contexts omit irrelevant prompts without interstitials; backtracking updates eligibility and progress |
| Other and missingness | Choice, Other, Skip, no actual example and system omission remain distinct; custom text is not silently mapped to a scored category |
| Question integrity | Stem and answers share a subject, scenario and actual/hypothetical/routine frame; repeated scenes are reviewed through a counterpart map |
| Emotion | Feeling, action and recovery have separate evidence; calmness or explosive behavior is not inferred from an unrelated choice |
| Health | Each routine/behavior claim has direct or explicitly inferential support; source facts are not repackaged as predictions |
| Time context | Usual and recent evidence remain separate; no trend is implied from a first session |
| Result bars | Every axis has named endpoints/units, a defined scale, source IDs, a missing state and separate confidence |
| Feedback | Both True and False preserve the result/confidence, record versioned endorsement and cannot affect prediction evaluation |
| Evaluation | Heldout answers never enter the frozen profile; baseline information rules match; abstentions and denominators are visible |
| Accessibility | Mobile/desktop, long text, keyboard, focus and reduced-motion flows work with routing and review controls |
| Handoff | Question map, evidence schema, source/version provenance and known limits are reviewable by Desmond |

Jerry requested Luna implementation with coordinating-agent verification. The current run uses separate question-bank, engine and frontend workers, independent reviews, and root browser verification on the isolated branch.

## Company grounding and source authority

Fresh native reads on 2026-09-17 verified MirrorMii OS Base revision 201 and relevant Wiki/source documents. TwinsXM schema revision 27 includes personality, sleep/fatigue, diet, activity and psychology/emotion; its corresponding Brand Facts row is draft. The draft company Emotion × Mechanism Map provides creative vocabulary, not a respondent scoring scale. Sally's 80% intent is attributed in the supplied handoff, which also says the framework awaits her confirmation.

The protected aggregate packet remains incomplete. Targeted reads succeeded; do not describe Lark as generally inaccessible or treat drafts as approved capabilities. Refresh Lark before relying on these revisions; they are dated 2026-09-17.

This update changed founder requirements; it did not promote the earlier company drafts to approved capability claims.

## Open decisions

Q11–Q13 are settled: habits/body/skin with optional health context; past-month/last-seven-days default windows; written Other saved unscored. Q14–Q15 confirm North America, all genders, English first, and understanding self plus gradually finding suitable small habits. The authorized local build selects named ordinal routine bands, literal emotion categories, generic unknown-context replacements, and eight frozen checks after 56 profile/context scenes. These are engineering defaults documented in the implementation contract, not validated psychometric scales. Pilot thresholds, independent validation, production services and final character labels remain future work.
