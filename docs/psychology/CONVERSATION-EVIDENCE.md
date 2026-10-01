> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](../LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

> Maintained working document, promoted 2026-09-18. [Original run snapshot](../../../../hall/data/jobs/mirrormii-genie-survey/20260917T201408Z-a40d4b34db0c/output/CONVERSATION-EVIDENCE.md) remains immutable. Original status and limitations below still apply; promotion is filing, not product approval.

# Conversation evidence for the first Genii survey

2026-09-17 · Bounded primary-source research · English

Current product direction: a skillful host who helps people feel understood, understand themselves better, and gradually find small habits that work for them. The intended market is North America, all genders. No age restriction or gender-specific effect is inferred from these studies. Market suitability and actual repeat use still need product testing.

The evidence supports responsive conversation as a design direction. It does not establish that this survey, a chatbot, or a roughly 60-question route will produce return visits.

## 1. Follow-up questions can communicate responsiveness

**Primary study:** Huang, Yeomans, Brooks, Minson & Gino (2017), *It Doesn’t Hurt to Ask: Question-Asking Increases Liking*. [Published paper, author institution PDF](https://www.hbs.edu/ris/Publication%20Files/Huang%20et%20al%202017_6945bc5e-3b3e-4c0a-addd-254c9e603c60.pdf).

**Actual finding and context:** two experiments analyzed 398 and 338 participants having brief text conversations with another person. Instructing people to ask more questions increased their partner’s liking. Analyses associated follow-up questions with responsiveness and liking; a separate observational speed-dating study linked follow-ups with second-date agreement. In the first experiment, the question-count manipulation did **not** significantly improve accuracy on the partner-preference measure.

**Limits:** these were human conversations, not an AI survey. The follow-up analyses and speed-dating evidence do not independently randomize every proposed mechanism. Neither liking nor second-date agreement establishes product retention, and the findings do not prescribe an optimal survey length or unlimited questioning.

**Design inference:** make a follow-up visibly depend on the previous answer and learn one useful detail. More questions alone are not the product goal. Treat being liked and knowing the person accurately as separate outcomes.

**Correction check:** a [2025 published correction](https://pubmed.ncbi.nlm.nih.gov/40111841/) reports minor reporting errors found in an independent audit. The notice states that substantive hypothesis-test results and conclusions remained unchanged, with no reason found to doubt data-collection integrity. Avoid reproducing unreviewed original effect-size details.

## 2. Feeling heard is related to willingness to converse again

**Primary study:** Roos, Postmes & Koudenburg (2023), *Feeling heard: Operationalizing a key concept for social relations*. [Open full paper](https://pmc.ncbi.nlm.nih.gov/articles/PMC10688667/).

**Actual finding and context:** scale-development surveys used 194 Dutch respondents recalling online conversations and 1,000 US respondents recalling conversations generally. The authors developed an eight-item measure spanning voice, attention, empathy, respect and common ground. Feeling less heard was associated with stronger intentions to avoid another conversation with the same partner, including after accounting for related variables. Agreement on the topic was not required to feel heard.

**Limits:** the return-related finding concerns recalled experiences and stated intentions, not experimentally caused return behavior. The authors explicitly note the intention–behavior gap and cultural/population limits. Their human-conversation measure is not automatically validated for Genii, clinical use, or every North American group.

**Design inference:** give respondents room to express an exception, show that Genii attended to it, and allow disagreement without a struggle. Measure perceived understanding and willingness to return separately from actual return. An adapted product-feedback item should not be called a validated version of the full scale.

## 3. A satisfying personality reading can still lack individual validity

**Primary study:** Forer (1949), *The Fallacy of Personal Validation: A Classroom Demonstration of Gullibility*. [Publication record](https://pubmed.ncbi.nlm.nih.gov/18110193/); [original-paper scan](https://criticalthinkingtext.wordpress.com/wp-content/uploads/2015/04/forer_the-fallacy-of-personal-validation_1949.pdf); [published study abstract](https://openurl.ebsco.com/contentitem/pdh%3A1949-03749-001?crl=c&id=ebsco%3Apdh%3A1949-03749-001&sid=ebsco%3Aplink%3Ascholar).

**Actual finding and context:** in a classroom demonstration, students completed a personality instrument and later received identical generalized descriptions presented as individual interpretations. They evaluated the descriptions favorably despite their being the same.

**Limits:** this is a small historical classroom demonstration, not a contemporary AI-retention experiment or a general estimate of susceptibility. It does not show that warmth, humor or affirmation is inherently misleading.

**Design inference:** True/False agreement is valuable feedback about fit. It cannot by itself demonstrate that Genii learned something distinctive or predicted an unseen choice. Prefer specific reflections traceable to answers over universal flattering claims.

## Proposed application to this specification

These are product-design inferences, not findings directly tested in the papers:

- **Host sequence:** acknowledge a concrete detail → offer a tentative reflection → ask one relevant follow-up or move on. Do not manufacture an emotional cause the respondent never supplied.
- **Three honest forms of output:** “You told me…” for self-description; “Across these answers, I wonder whether…” for inference; “Before you answer, my guess is…” for a genuinely committed prediction. Accurate reflection can be rewarding without being sold as mind-reading.
- **Keep feedback autonomy:** a rejected reflection need not launch an interrogation. Under the confirmed contract, log True/False while preserving the original result.
- **Separate learning signals:** feeling understood; claim-level fit; stated willingness to return; observed voluntary return; and unseen-choice agreement against its baseline. Do not merge them into one confidence or success score.
- **Test the habit promise later:** this bounded evidence does not demonstrate habit change. A first conversation can surface a respondent-selected small next step; usefulness and sustained change need their own follow-up evidence.

No demographic percentages, additional audience restrictions, clinical interpretation, health benchmarks, implementation changes or backend requirements were added by this research.
