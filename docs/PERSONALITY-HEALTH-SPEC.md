> Reconciled 2026-09-18 from the approved release documentation: [consolidation handoff](../runs/20260918T011159Z-16d23238fdf9/output/HANDOFF.md). Implementation/team instructions below describe that historical task. Read [CURRENT.md](CURRENT.md) and [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for later identity/ICP work and the experimental bank. Earlier canonical versions are preserved in the consolidation receipt.

# Genii root survey — personality, emotion and health habits

Version 0.3 · 2026-09-17 · Owner: Jerry Zhang · Status: implementation authorized; concrete contracts linked below

This is the active core document for the survey revision. The latest user instruction authorizes implementing it on the previous build. The [implementation contract](../quiz64/docs/IMPLEMENTATION-CONTRACT.md) resolves local engineering defaults and supersedes the earlier interview pause. It records Jerry’s feedback and answers from the current interview. It is a specification, not a claim that the existing app implements these changes. The earlier founder brief and handoff remain source evidence; later explicit decisions in this document take precedence where they conflict.

## 1. Confirmed product purpose

The root survey blends personality with health-related habits and emotional context. It should help explain how a person feels, responds, makes choices, and handles their body’s needs in different circumstances. Genii’s humor and recognizability make the questions approachable; traceable evidence makes the interpretation useful.

The first-session product priority is now explicit: earn the feeling of being understood and a willingness to continue a longer relationship with Genii. Jerry describes a perceptive, engaging host whose questions themselves create recognition. The first portrait is provisional; final label accuracy is secondary to the quality of the conversation. This changes presentation and evaluation priority, not the literal meaning of evidence or permission to call a reflected answer an independent prediction. See [HOST-EXPERIENCE.md](HOST-EXPERIENCE.md).

The existing question bank is broadly good. Revise coverage, routing and communication rather than replacing it wholesale. Preserve the approved Chinese voice separately; this revision concerns the English root survey and the underlying evidence model.

The current iteration focuses on the survey and its private result. Backend integration remains Desmond’s scope. Final comic names, one-liners and matching to a bank of Genii character templates are deferred. Their eventual labels must follow the evidence rather than drive it.

## 2. Decisions confirmed in the interview

| ID | Confirmed decision | Consequence |
|---|---|---|
| H-001 | Personality and health habits are both central | Supersedes treating health as incidental to a personality-only entertainment flow |
| H-002 | Keep an integrated result with multiple domain bars; avoid a card-grid-led ending | Evidence remains accessible beneath the main portrait; final visual composition is still to be designed |
| H-003 | Bars describe routines or behavior; confidence is separate | A bar must not ambiguously mean health quality, personality intensity and prediction certainty at once |
| H-004 | Capture internal feelings, outward response and recovery | Intense anger with calm speech differs from low anger; silence does not prove calm |
| H-005 | Collect True/False feedback on interpretations while keeping the original result | Feedback is logged separately and does not automatically change the portrait, evidence weights or prediction accuracy |
| H-006 | Include an Other answer path | A custom response must not be forced into the nearest authored category or treated as Skip |
| H-007 | Bypass known irrelevant questions completely | Someone living alone never sees a shared-household chore prompt or a not-applicable interstitial |
| H-008 | Reduce repetition and fix question–answer agreement | Corroboration should use different situations; real-event prompts must have answers that describe that same event and subject |
| H-009 | Keep the evidence model extensible for later evidence-log requirements | Version constructs, events, mappings and result claims; do not silently retrofit meaning onto old answers |
| H-010 | Prioritize unseen-choice prediction versus a no-profile baseline, plus usual-versus-pressure behavior | Jerry delegated Q4; selected both as separate comparisons, without peer rankings or a health-quality score |
| H-011 | Show usual patterns and recent state separately | Confirmed Q5; a recent stressful period must not automatically rewrite a usual tendency |
| H-012 | Sleep includes direct usual routine, recent changes and contextual behavior/prediction | Confirmed Q6 after expansion; exact clock times/duration are not inferred from unrelated personality answers |
| H-013 | Broaden health coverage beyond sleep, eating, movement and rest/energy | Confirmed Q7 direction; H-017 and H-018 subsequently settle the scope and default windows |
| H-014 | Cover all seven proposed feeling families | Confirmed Q8: frustration/anger, worry, disappointment/sadness, embarrassment, guilt, joy/excitement and relief |
| H-015 | Place True/False beside individual interpretations | Confirmed Q9; each review is attached to the exact claim/version, not just a whole-portrait rating |
| H-016 | Use relevant replacements to keep each route around 60 questions | Confirmed Q10 over the shorter-route recommendation; expand the bank with equivalent alternatives and avoid irrelevant padding |
| H-017 | Q11 recommendation accepted: habits plus body/skin experience, with optional relevant health context | Broader coverage does not mean collecting the complete company health schema; conditions/allergies/cycle facts stay direct reports, not personality scores |
| H-018 | Q12 recommendation accepted: usual past month, recent last seven days | Actual examples use the latest event in the past month with no-example available; domains such as cycles need a stated domain-specific period |
| H-019 | Q13 recommendation accepted: preserve written Other answers unscored | No automatic interpretation or forced nearest category in this MVP |
| H-020 | First survey should establish recognition, trust and willingness to continue | The host's questions and responsive conversation are the main first-session experience; final labels are provisional |
| H-021 | North America, all genders, English first | Q14 clarification governs: earlier age/gender/life-event examples are not a fixed demographic target; exact age eligibility is not selected |
| H-022 | Ordinary bodily routines can supply conversational material | Hydration, toilet timing/response and stress-related eating are illustrative candidates, not a mandatory checklist; clarify the literal behavior before mapping it |
| H-023 | Ask once, listen and carry the answer forward | Avoid visibly asking the same thing again; preserve independent evidence only when a later question asks a genuinely different context |
| H-024 | Q15 accepts understanding yourself better and gradually finding small habits that work for you | This is the intended return value to build and test, not demonstrated efficacy or a current long-term capability |

True/False was deliberately chosen as feedback-only, contrary to the earlier recommendation to clarify and automatically revise a result. Do not reintroduce that recommendation as an approved requirement.

## 3. Evidence layers that must remain distinct

| Layer | Example | What it supports |
|---|---|---|
| Direct self-report | “I usually go to bed after 1am” | A reported timing fact, with a stated time window |
| Actual-event account | “Last time I was stressed, I scrolled until late” | A self-reported account of behavior in that context, not external observation |
| Hypothetical choice | “I would finish the task before bed” | A stated preference or intention, not proof it happened |
| Inference | “You tend to delay rest when responsibilities pile up” | A tentative interpretation linked to distinct supporting and contradicting observations |
| Benchmark/comparison | A frozen prediction compared with a later answer or a baseline | Evaluation under an explicit protocol and denominator |
| Respondent endorsement | True/False on a particular result claim | Resonance/disagreement with that claim, not independent validation or another behavioral observation |

The same answer must not be recycled across these layers to inflate confidence. A known bedtime cannot be displayed as a successful prediction of that bedtime. A conflict response alone cannot establish sleep duration, sleep quality, emotional intensity or a health condition.

## 4. Current bank: verified coverage and gaps

Reviewed app baseline: `quiz64/` at commit `ec89aa7`, with 56 training/context questions and eight internally authored heldouts. Its mappings are deterministic; notes are unscored. It has no implemented True/False result-review events or general Other option, and it currently displays inapplicable screens. That baseline predates this implementation. Use the current handoff and tests for delivery status.

| Domain | Existing evidence | Gap before a richer result |
|---|---|---|
| Sleep | q17 bedtime band; q45/q54 hypothetical sleep-versus-obligation choices | No direct duration/quality evidence; no actual sleep-tradeoff counterpart; timing, regularity and protecting sleep must not be collapsed |
| Eating | q20 takeaway dinner days; q44 actual and q55 hypothetical stressed dinner | Takeaway frequency is not diet quality; emotional eating motive/intensity cannot be assumed |
| Movement | q46 movement days; q43 hypothetical and q47 actual plan adherence | Frequency is not duration, intensity, fitness or motivation |
| Recovery | Seven training situations involving rest/capacity/obligation; q61 heldout | Capacity choices do not measure how recovered someone felt or how long recovery took |
| Emotion | D5 relational worry; D7 communication; D9 comparison/recognition; D10 mood-linked urgency; parts of D6/D12/D14d | No separate, consistently measured felt intensity, outward escalation, rumination or recovery-time model |

These are coverage observations, not instructions to add every missing metric. Select the intended claims first, then add only the questions needed to support them.

## 5. Proposed emotional evidence structure

Jerry has approved the three-part distinction, seven feeling families and default windows (usual past month, recent last seven days). Exact emotional intensity/recovery scales remain open.

1. **Internal experience:** emotion named by the person, intensity and trigger/context.
2. **Outward response:** what they did or said; expression, restraint, escalation, withdrawal, seeking support or repair as literal actions.
3. **Recovery:** what they tried afterward, whether it helped, and the time to settle if directly reported.

The confirmed scenario families are frustration/anger, worry, disappointment/sadness, embarrassment, guilt, joy/excitement and relief. These guide bank coverage; they are not permanent respondent labels or a validated taxonomy. Preserve the literal feeling selected or named instead of inferring a specific emotion from the family label. Guilt and shame, or anger and anxiety, should not be merged simply to reduce fields. Joy/excitement and relief explicitly include positive emotion.

A proposed event shape is:

`context + relationship target + actual/hypothetical role + observation window + named feeling/intensity + outward action + recovery action/outcome + source question/option + mapping version`.

Only populate fields supported by the literal answer or an explicit follow-up. “Said nothing” may mean restraint, suppression, fear, indifference or uncertainty; it does not select one of those explanations by itself. “Explosive” and “calm” are shorthand in the design discussion, not approved fixed labels for respondents.

## 6. Result bars and their contract

The primary result should read as one coherent portrait with clearly named behavior/routine axes. It must retain a path to receipts and contradiction details. A Genii character template may eventually frame the portrait; selecting or naming that template is not this iteration’s job.

Each bar requires an explicit contract before implementation:

- Construct and plain-language label, with meaningful endpoints or units.
- Whether its value is a direct report, an inferred tendency or another defined statistic.
- Applicable contexts and observation window.
- Source question IDs, unique supporting opportunities and contrary observations.
- Missing-evidence behavior and a separate confidence/coverage explanation.
- Scale and mapping version. If shown as a percentage, define the numerator/denominator or normalization; never imply a population percentile or calibrated probability without the relevant method/data.

No generic “72% healthy” or “80% anxious” is authorized. Unknown is not zero; sparse evidence may show a qualitative description or an unfilled bar. A behavioral endpoint is not automatically good or bad. Usual patterns and recent state must be shown separately. Default windows are the past month and last seven days; domain-specific exceptions must be explicit. Exact axes and visual treatment remain to be specified; do not infer a longitudinal trend from one session.

## 7. True/False review: confirmed feedback-only behavior

Show True/False beside each individual plain-language interpretation, with its evidence accessible. This claim-level placement is confirmed by Q9. The user may leave a review unanswered; absence is neither False nor agreement. Precise interaction timing and any optional reason remain to be designed.

Preserve the displayed result and the evidence that produced it. A proposed review event records:

`review_id, attempt_id, result_version, claim_id, claim_text_snapshot, evidence_ids, displayed_value_snapshot, endorsement: true|false, recorded_at`.

Any optional reason would be a separate field and is not yet required. Feedback must not alter bars, add matching observations, change the frozen prediction or be counted as a heldout hit. The user can see that their feedback was recorded without the app pretending it changed the result. A later research/model revision can analyze accumulated disagreement under a separate approved method.

Explicit edits to original survey answers are a different operation from True/False review. Existing context invalidation and versioning rules still apply to answer edits; the revised result should remain distinguishable from its earlier snapshot.

## 8. Adaptive routing and Other

For a known mismatch, omit the question without showing a placeholder screen. Q10 selects relevant replacements to maintain roughly 60 questions per route, rather than shortening the route by default. Build a larger bank of suitable alternatives; a replacement must collect the intended construct with a meaningful context and literal evidence mapping. Never present an unrelated filler merely to maintain a count. Roughly 60 is a target, not permission to fabricate relevance or evidence; insufficient alternatives are an explicit bank-coverage gap to fix before release.

Record automatic omission separately from a deliberate user Skip, an Other response, no recalled experience and an unanswered item. Its reason should reference the context rule and version that caused it. Hidden questions provide no neutral or negative evidence and must not count as answered observations.

Unknown context is not a verified mismatch. A skipped or custom context answer may leave applicability unresolved; define a neutral clarification or conservative omission policy rather than inventing a household or relationship. When context changes, invalidate affected evidence/notes and recompute eligibility. Navigation and progress must follow the eligible route without presenting phantom questions.

Other captures a response that does not fit the authored options. Q13 now confirms that written Other answers are saved unscored, with question/context/version, rather than automatically interpreted or forced into the nearest category. Keep Skip and no-experience options available where relevant. Other for categorical prompts with optional text is the working interaction proposal; exact placement remains to be designed.

## 9. Question quality and corroboration

Every prompt must have one clear subject, situation and response frame. Actual-event questions ask what happened on a real occasion; hypothetical questions ask what the person would do; routine questions state a time window and ask about frequency or pattern. Do not mix these in a single answer set without labeling the difference.

Example rewrite direction for q29: “Think of the last outing with {close} where you paid more or did more of the organizing than you had agreed. What did you actually do?” This is a draft, not approved final copy. It avoids suggesting that the partner themselves “became uneven.”

Maintain a counterpart map so a repeated construct is tested through a different situation, target or pressure level. A repeated sentence with near-identical answers does not earn the same confidence as an independent corroborating event. No question should gain speculative secondary tags simply to satisfy a multidimensional quota.

Host behavior is part of question quality: react to the literal answer, let the next question connect naturally, and avoid using praise as the default reaction to every choice. A question can create recognition before the result exists. Separate self-description (“I see myself as gentle”), desired behavior, a reported incident and longitudinal observations. A first-session reflection is allowed; claiming that reflection independently proved the trait is not.

## 10. Benchmarks and validation: separate questions

The user-supplied 2026-09-17 handoff attributes “capture 80% of thought patterns” to Sally and operationalizes it as first-choice agreement on unseen situations. It proposes a separate 20-item test written by another model, a no-profile comparison and repeat-answer consistency. The document also states that the framework awaits Sally’s confirmation and the target has not been demonstrated.

The current app’s eight heldouts are internally authored checks, not that independent 20-item evaluation. q57 has tied conditional signatures; q61c/q62c/q64d each have only one matching source and cannot meet the two-source threshold. These limits remain real until the bank/evaluation is revised.

Keep separate denominators for eligible items, answered items, predictions attempted, abstentions, matches and feedback endorsements. Do not manufacture higher accuracy by excluding hard questions without reporting coverage, or by treating a repeated exposure as a fresh blind test.

Latest founder direction makes conversation quality the primary product test: does the person feel understood, want to continue, and expect useful ongoing support? These are distinct from prediction accuracy and actual health improvement. Proposed pilot measures belong in HOST-EXPERIENCE.md; no threshold is approved. The reference to “20 accuracy” moments explains their intended trust-building role; it does not mandate 20 additional checks. The authorized local build retains eight checks after 56 profile/context scenes. A separate independent validation study remains unspecified.

Jerry delegated benchmark selection in Q4. The selected priorities are (1) unseen-choice prediction against a no-profile baseline, and (2) the person's reported usual behavior versus their behavior under pressure. Keep them separate. The first tests predictive value; the second describes context sensitivity and does not establish prediction accuracy or longitudinal change. First-session usual-versus-pressure comparisons are self-reported contrasts, not measurements of improvement over time.

Both predictors must receive the same allowed scenario/context information; only the personal profile differs. Freeze predictions before revealing heldout answers, and report coverage alongside first-choice agreement. Exact evaluation size, acceptance target and scoring protocol remain to be specified. The handoff's 80% target is historical and unvalidated, not an acceptance threshold silently adopted here.

Q5 confirms separate usual-pattern and recent-state views. Q6 confirms direct usual sleep routine (timing, duration and regularity), recent disruption/restfulness, and contextual sleep-related behavior/prediction. Sources must support the specific fact or inference; a scene mentioning sleep cannot establish all three. Peer rankings are not part of the selected comparison. No numeric clinical reference range, wellness composite, population percentile or causal personality-to-health model is approved here.

## 11. Interview decision tree

```text
Confirmed: personality + health-habit root survey
├─ Bar meaning: routine/behavior; confidence separate [settled]
│  ├─ Benchmark priority: prediction baseline + usual/pressure contrast [Q4 delegated and selected]
│  ├─ Usual pattern and recent state shown separately [Q5 settled]
│  ├─ Sleep: direct routine + recent changes + contextual behavior [Q6 settled]
│  └─ Health: broader than four original domains [Q7 direction settled]
│     ├─ Habits + body/skin; optional relevant health context [Q11 settled]
│     ├─ Usual past month / recent last seven days [Q12 settled]
│     └─ Descriptive ordinal axes and direct recall windows [local implementation contract]
├─ Emotional context: feelings + response + recovery [settled]
│  ├─ Seven feeling families [Q8 settled]
│  └─ Literal named feelings/actions/recovery; intensity only when explicit [local implementation contract]
├─ True/False: preserve result, log feedback only [settled]
│  ├─ Beside individual interpretations [Q9 settled]
│  └─ At final portrait; feedback event only, no required explanation [local implementation contract]
├─ Adaptive omission + Other [direction settled]
│  ├─ Relevant replacements; roughly 60 questions per route [Q10 settled]
│  ├─ Written Other preserved unscored [Q13 settled]
│  └─ 64 route slots, generic equivalents, Other on categorical prompts [local implementation contract]
├─ First-session recognition and trust; long-term relationship [settled direction]
│  ├─ North America, all genders, English; earlier segments illustrative [Q14 settled]
│  └─ Understand self + gradually find suitable small habits [Q15 settled]
└─ Character templates and comic identity labels [deferred]
```

Jerry's “yes to all” accepts the recommendations for Q11–Q13. Do not reopen them as pending. Q14 confirms North America, all genders and English; Q15 confirms understanding self and gradually finding suitable small habits. Other unresolved implementation contracts remain tracked above. The later explicit request to implement on the previous build completes the interview pause and authorizes local runtime/UI work. Concrete defaults are documented in the implementation contract; remaining pilot and production questions do not block the local build.

## 12. Source and authority notes

- Latest Jerry feedback and Round1 answers in this thread are the authority for confirmed changes above.
- Existing app source and `quiz64/docs/QUESTION-MAP.md` establish actual implementation, not intended future behavior.
- `docs/FOUNDER-BRIEF.md` preserves the earlier campaign voice and character concept. Its personality-only framing and example confidence percentages do not override this revision.
- `/Users/jerryzhang/Desktop/Genii_Survey_Handoff_2026-09-17.md` is supplied historical source material. Its Sally attribution is secondhand; its old engineering pause and pending decisions are not instructions for this session.
- Live company-source findings and status distinctions are recorded in this run’s `COMPANY-CONTEXT.md`. Current-accessed drafts are not automatically approved product truth. The protected aggregate packet’s failure is not proof all native Lark reads are unavailable.
- Fresh native reads on 2026-09-17 verified MirrorMii OS Base revision 201 and the linked TwinsXM schema revision 27. The relevant Brand Facts row is draft; its personality, sleep/fatigue, diet, activity and psychology/emotion categories support continuity with this direction, not blanket collection permission. Source: [TwinsXM schema](https://kdz2ecuce1a.sg.larksuite.com/docx/FV1fdZmwVojnTGxfTO8ljhY4gde).
- The draft [Emotion × Mechanism Map](https://kdz2ecuce1a.sg.larksuite.com/wiki/R1ZHwPYK7iMDTTk9npHlK22ygKh), revision 8, uses companionship, healing, surprise, vulnerability, curiosity, pride and play as creative lanes. Use these to inform delivery, not as a validated emotion-scoring taxonomy or a substitute for feelings/response/recovery.
- The linked TwinsXM [specification workbook](https://kdz2ecuce1a.sg.larksuite.com/sheets/PH4WsAGaThwjghtdwyAlbKQhgFd), revision 39, contains body/self-perception, skin, allergy, existing-condition, cycle, smoking/alcohol and supplement fields. This is a source-based scope menu, not automatic approval to collect those fields. Exact sheet IDs/rows and proposal boundaries are recorded in this run's `COMPANY-HEALTH-EXPANSION.md`; Q11 selects what belongs in this survey.
- Research gaps remain explicit. No medical or psychological benchmark has been selected or validated by this document.
