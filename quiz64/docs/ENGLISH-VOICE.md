# V4 English voice — Astra language candidate

Status: local implementation candidate, awaiting sequential Council audit. This replaces the v3 voice guidance for this branch only.

## Source of wording

- `src/respondent-copy.js`: all 52 prompts, setups, ordered options, shared exits, chapter text and context labels.
- `src/data.js`: frozen authoring meanings and evidence metadata. Its original text is retained as the review baseline, then the wording layer is applied.
- `src/host-reactions.js`: selective acknowledgments, never evidence.
- `src/engine.js`: source-bound result sentences, paired examples, cautious headlines, limited jokes and support preferences.
- `src/result-language.js`: plain explanations of source, circumstances and item-specific limits. Technical metadata remains intact in private exports.

## Voice contract

Use ordinary words. Give each sentence one job. Explain the situation before asking for a choice. Keep humor specific and optional; do not assign an unasked motive just to land a joke.

Keep the answer distinctions intact: an action is not a feeling, a first interpretation is not a fact, a reason for one event is not a general value, and a preference for help is not proof that the help works.

A result should offer a clear headline, a short explanation, concrete examples, an optional small roast and a useful support preference. Quote the actual choice when giving an example. Say whether it describes an imagined situation or an account of something that happened. Do not paste internal targets into sentence templates.

A contrast keeps its parent situation attached. A motive can explain only its own linked event. Linked follow-ups are not independent repeated examples. Unknown, skipped, no-example and custom answers stay distinct and unscored.

Keep the final checks separate. Explain passing on a guess and the fixed-answer comparison without calling a small score personality accuracy. Fits / Not quite saves feedback without rewriting the original result.

## Versions and checks

The wording version is `v4-astra-english-1`; this candidate uses a separate saved-attempt key. Earlier attempts are not silently relabeled.

Run `npm test` and `npm run build` in `quiz64`. The language tests pin every non-copy field to `533c3da`, exercise every option/exit, verify exact receipts and render the real React text. These are regression checks, not proof that a human will understand or endorse every sentence. See `ASTRA-IMPLEMENTATION.md` for known limits and the next review gate.
