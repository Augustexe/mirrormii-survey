> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

> Reconciled 2026-09-18 from the approved release documentation: [consolidation handoff](../../../hall/data/jobs/mirrormii-genie-survey/20260918T011159Z-16d23238fdf9/output/HANDOFF.md). Implementation/team instructions below describe that historical task. Read [CURRENT.md](CURRENT.md) and [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for later identity/ICP work and the experimental bank. Earlier canonical versions are preserved in the consolidation receipt.

# Genii: a conversation worth coming back to

Version 0.2 · 2026-09-17 · Confirmed product direction; local implementation authorized

## The first-session job

Earn this reaction: **“You asked about something that actually happens to me. You listened. I want to keep talking.”**

Jerry's latest direction prioritizes a skillful host and a promising ongoing relationship. Recognition should happen during the questions, not depend entirely on a final identity label. The first portrait is a starting point; how someone describes themselves and how they act across time can differ. Future observations may add context or change a later portrait without rewriting the history of the first result.

Confirmed first-return value: **understand yourself better, and gradually find small habits that work for you.** This is the intended experience to build and test, not a demonstrated health outcome or a claim that long-term personalization already exists in the demo.

Confirmed audience: **North America, all genders; English first.** Earlier age ranges, women, dating, career changes and bodily routines were illustrative examples. Do not turn them into demographic gates, required life goals or prevalence claims. Exact age eligibility and geographic localization beyond this broad market are not settled here.

## Latest implementation direction · 2026-09-17

Jerry's correction: **questions and retention come first**. The survey must not turn into clinical questionnaire copy while its evidence model improves. Use the approved Chinese voice's principles to write natural English: a recognizable moment, a small absurd turn, and clear choices. Do not translate its slang literally. North American English and all-gender scenarios remain the brief.

The live English layer in `quiz64/src/english-copy.js` rewrites all 76 candidates, including route replacements. IDs, source windows, signal mappings, route slots, and scoring are unchanged. The white theme with purple accents is explicit, including on devices in dark mode. Existing canonical Genii art and the generated glass reference remain in use. Results use semantic icons and aligned usual/recent tracks; True/False still records feedback without changing the original result.

See `quiz64/docs/ENGLISH-VOICE.md` for authoring guardrails. This is the implemented direction for review, not a claim of approved final English wording or measured retention lift.

## What “a host who gets you” means

- Notice specific everyday tensions and invite the person to describe them in their own terms.
- Give every authored response a plausible, dignified interpretation. Humor must not make one choice obviously more desirable.
- Respond to the selected answer, not with the same praise after every option.
- Carry answers forward. Ask a new question because it adds context, not because the system forgot the last answer.
- Let the person surprise Genii: Other, no recent example and Skip are meaningful outcomes.
- Make the pacing feel conversational: playful entry, meaningful detail, short recognition, breathing room, then a natural next topic.

The desired “撩” quality is attentive, playful rapport. It is not a requirement for a romantic or gendered persona. Concrete scene awareness and responsive follow-ups carry the appeal. A result cannot establish more than the answers support, even when its language is warm.

## Proposed conversation structure

1. **Find the current chapter.** Let the participant indicate what has occupied their attention lately: work/study, relationships, family/care, money/home, routines/body, something else, or nothing especially. Multiple priorities may coexist. These are relevance cues, not diagnoses or assumed crises.
2. **Start with an easy, specific scene.** Use a situation applicable to the person's answers. Avoid opening with a medical inventory or demanding a self-label.
3. **Make one responsive move.** Briefly reflect an action they selected, or ask a useful new detail. Do not add a reaction screen after every answer or turn roughly 60 questions into 120 stops.
4. **Connect experience, feeling and bodily routine when supported.** A single scene can support multiple observations when its answer explicitly provides them. Do not infer stress eating just because a stressful day and food appeared in the same story.
5. **Offer a provisional portrait.** Integrate the established behavior/routine bars, separate confidence and inspectable evidence. Put True/False beside individual interpretations; preserve the original result regardless of review feedback.
6. **Give a credible reason to return.** Connect the next interaction to something the participant actually shared. Until ongoing support is implemented, label any proposed follow-up as a preview rather than simulate a saved future service.

This flow now guides the authorized quiz64 implementation. See the implementation handoff for what is verified. Roughly 60 refers to respondent questions, not a license to hide large extra response burdens inside cards. Relevant replacement items should preserve intended evidence coverage.

## English voice samples: drafts for author review

These are examples of host behavior, not a new approved bank or statistical claims about North Americans. Each response set would also provide Other, Skip and, for actual events, no recent example. The ordinary details below are optional creative directions, not a required checklist.

### A. The everyday detail: hydration

**Prompt:** “On a busy day, who's running your hydration department?”

Response meanings, using the usual-past-month window:

- “Me. I usually take drink breaks.”
- “My thirst. It eventually gets my attention.”
- “Whoever puts a drink in front of me.”
- “Nobody. I tend to forget until things slow down.”

If the last answer is chosen: **“So the tricky part is remembering in the middle of everything.”**

Supported: reported cue/routine for drinking while busy. Not supported: daily volume, dehydration, medical adequacy, executive function or a stable personality diagnosis. An amount question would be a separate direct report, not inferred from the joke.

### B. One scene, two honest observations: inner feeling and outer response

**Prompt:** “Last time someone annoyed you, how different were the inside voice and the outside voice?”

- “I was angry. My voice stayed calm.”
- “I wasn't very bothered, and it sounded that way.”
- “I was annoyed, and my tone showed it.”
- “I needed space, so I ended the conversation.”

For the first answer: **“Calm delivery. Very different internal soundtrack.”**

A useful next detail might ask how long the feeling stayed afterward. That is a new recovery observation, not the same conflict question again. The fourth answer supports taking space only: it does not establish the feeling's intensity or whether ending the conversation helped. Do not manufacture complete emotional records from incomplete answers.

### C. Stress and food without assigning blame

**Prompt:** “Think of the last stressful day this month. What happened to your appetite?”

- “About the same as usual.”
- “I wanted something comforting, even though I wasn't hungry.”
- “It disappeared for a while.”
- “I missed a meal while busy and was much hungrier later.”

For the comfort answer: **“Sometimes food also gets hired as emotional support.”**

Supported: that reported event's appetite/comfort relationship. Do not label every comfort choice overeating, infer diet quality, or count this reflection as an unseen prediction. “Much hungrier after missing a meal” is not automatically emotional eating.

### D. A body cue inside a real day

**Prompt:** “You're in the middle of something and need to pee. How many ‘one more things’ usually happen first?”

- “None. I take the break.”
- “Usually one, I finish the bit I'm on.”
- “Several. I tend to keep putting it off.”
- “It depends whether I can step away.”

For the last answer, a relevant follow-up may ask whether work/care responsibilities limit breaks. Do not mistake constrained access for a personality choice. This measures a reported response to a cue, not urinary frequency or bladder health. If the intended question is bowel-movement timing, ask that separately and explicitly; “going to the toilet” is too ambiguous for a data field.

### E. A life event, only when selected

If someone selected a possible job change: **“When you picture leaving, what are you hoping changes first?”**

Possible distinct meanings include the work itself, pay/security, how they are treated, schedule/energy, or still figuring it out. A response about wanting evenings back can naturally lead to an applicable sleep or recovery scene. It cannot establish that the person is burned out or that changing jobs will help.

Do not ask this because of age or gender. People not considering a change receive an equivalent relevant context, such as a routine they want more room for.

## Self-description, reflection and prediction

If someone says “I am gentle,” the host can acknowledge that self-view. An author may write a natural reflection with evidence available underneath. Preserve the distinction in the evidence model:

| What happened | Evidence meaning |
| --- | --- |
| “I see myself as gentle” | Self-description |
| “I want to handle conflict gently” | Intended or aspirational behavior |
| “I was angry last week but kept my voice calm” | Reported action and feeling in one context |
| Genii echoes the stated self-view | Responsive reflection, not a prediction hit |
| Genii commits a guess about an unseen situation, then checks it | Prediction evaluation |
| Different behavior is later reported | Additional contextual evidence; may change a later version |

The host should help someone recognize complexity rather than turn gentleness into the flattering answer everyone receives. Acknowledging a contradiction can feel attentive: “You wanted to stay calm; this time it came out sharply.” Only use that line when both parts were actually provided.

Longitudinal revision does not change the confirmed True/False rule. Feedback alone is logged against the original claim; it does not mutate that result or become evidence of the opposite trait.

## What to test first

The product priority is a conversation that earns interest and credible expectations. Proposed pilot measures, with no approved numeric threshold yet:

- Perceived relevance: did the questions address situations that mattered to the participant?
- Feeling understood: did Genii respond to what the person actually meant?
- Willingness to continue: would the person choose another conversation?
- Expected usefulness: what concrete help does the person expect next, and can the planned product support that expectation?
- Completion, optional elaboration and later return, each with an explicit denominator when a pilot is implemented.

Keep these separate from claim-level True/False, first-choice prediction accuracy, and actual habit/health outcomes. Positive feedback is valuable even when it is not independent prediction evidence. A first-session promise must not be presented as already demonstrated improvement.

The earlier 20-question benchmark remains an evaluation proposal. The founder explained its role in earning trust; exact visible count/placement remains open. Do not add 20 checks to the route or remove heldout safeguards without a concrete design decision.

## Source and status

Primary authority: Jerry's latest conversation and the subsequent corrections “North America,” “all genders,” “this all just examples,” and acceptance of the recommended first-return value. Q11–Q13 recommendations were accepted with “yes to all.”

The previous run's current company reads inform possible health domains but remain draft context. No fresh audience report or event prevalence dataset was supplied. The “60% changing jobs / looking for a husband” examples are not statistics to publish or author against. Empirical conversation research, if used, must identify its samples and limits; it cannot independently establish North American audience segments or this product's efficacy.

## Research rationale and limits

Primary human-conversation research provides a useful design basis for responsive follow-ups. [Huang et al. (2017)](https://www.hbs.edu/ris/Publication%20Files/Huang%20et%20al%202017_6945bc5e-3b3e-4c0a-addd-254c9e603c60.pdf) found increased liking when participants were instructed to ask more questions; preference-prediction accuracy did not significantly improve in the first experiment. The [2025 correction](https://pubmed.ncbi.nlm.nih.gov/40111841/) reports minor errors without changing substantive conclusions. This supports distinguishing conversational appeal from accuracy, not a claim that a longer AI questionnaire is better.

[Roos et al. (2023)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10688667/) examined feeling heard in recalled human conversations and its relationship to intentions about future conversations. That is not observed product retention or evidence of habit improvement. Proposed Genii feedback items are not a validated adaptation of their scale. The bounded review, including a historical demonstration that favorable personality feedback alone does not establish individual validity, is saved in this run's output/CONVERSATION-EVIDENCE.md.
