# Astra language audit — before implementation

Status: verified source review; implementation and independent Council review pending.
Base: `533c3da` (`codex/personality-game-council-v4`), fast-forwarded into isolated branch `fm/genii-language-astra`. Local `main` is an ancestor. No remote operations.

## Material reviewed

- All 52 prompts, setups, every authored option/neutral meaning, and every exit in `src/data.js` (44 profile/preferences, eight checks).
- Landing, chapter intros/map, question controls/context selectors, host reactions, review/help dialogs, freeze gateway, result, disclosures, feedback, export and restart copy.
- `engine.js` observations, linked events, narrative construction, archetype gates, receipt/audit projection, prediction/freeze/restore and existing tests.
- Council shared contract; V4 authoring packet reflected by data.js; V4 result contract, Q audit synthesis and final constrained content gate in run `20260919T004056Z-866317ad7d9f/output`.
- Existing `quiz64/docs/IMPLEMENTATION-CONTRACT.md` and English voice file are still v3: they do not override the V4 source or this assignment.

## Findings

1. Every setup currently exposes authoring notes (e.g. "status cost high", "recorded target", linked IDs). All need human scene-setting without changing stakes, target or time.
2. Prompts 001–004 and 041–044 use "read", "receipts", "retry count", and "literal stop-or-ask-first line" instead of ordinary preference questions.
3. Prompts 005–010 obscure credit/ownership and omit the 30-day window from the actual-event stem. 010 must remain the same credit event with only audience changed.
4. Prompts 011–016 obscure correction/repair. 012 is only the imagined inside/outside pair, not recovery or a recalled event. 016 must keep the correction fixed and change only the source's power.
5. Prompts 017–022 need clear friendship/message/reassurance wording. Interpretation in 018 is not felt emotion. Required 021 context and the close/new contrast must remain explicit.
6. Prompts 023–028 use "framing", "capacity branch" and vague rerouting. Preserve advice quality, authority risk and the same-cost rationale/choice contrast.
7. Prompts 029–034 need an explicit 30-day actual-event window, concrete favor language and the same-request closeness contrast. Do not turn costly help into selfishness or unasked motive.
8. Prompts 035–040 use opaque temptation/conflict/admin metaphors. Keep the small non-sensitive scheduling advantage and audience-only contrast. Do not invent financial, intimate or clinical stakes.
9. All eight checks need ordinary language, unchanged option distinctions/baselines, and no source IDs or hints from predictions.
10. Host replies sometimes misread options (017 A described as indirect; 017 D as private clarification; 035 A assigned a story motive; 044 E described as evidence-first). Rewrite against exact selected actions only.
11. Result templates paste metadata into grammar: "When [target] puts a cost..."; connect unrelated motives to actions; imply defaults from hypotheticals; and append generic theatrical filler. Rewrite generation, not merely collapse it.
12. Receipts/disclosures show IDs, mapping versions, raw domains, claim audit verdicts and source-unit counts. Preserve those in private machine-readable export; present exact questions/answers and plain source/limit explanations in the UI.
13. The current share-card label promises public safety while card text includes exact answers. Until a public projection is approved, label these as private highlights, not safe-to-share content.
14. Source inspection found `QuizView` references `contextBinding`/`setContextBinding` without receiving them. A minimal prop-forwarding repair is necessary to exercise questions at all; no layout change.
15. Existing baseline: 29 tests pass. They do not test UI rendering or semantic copy parity.

## Implementation approach and invariants

- Add a reviewed, explicit 52-item language layer. Retain authored metadata/neutral meanings, IDs, tags, options, exits, roles, routing, linked events, baselines and prediction mappings unchanged.
- Pin a baseline semantic fixture from this commit; test every item's non-copy metadata and every option/exit against it. Test that rewritten question/answer text is exactly what receipts retain.
- Version wording separately and isolate new saved attempts so earlier text is not silently relabeled.
- Use short source-bound narrative clauses, with motives only attached to their own event. Separate imagined actions, recalled actions, direct preferences and unknowns. No recovery/feeling inferred from action.
- Keep Q (item quality), E (claim support) and P (prospective performance) separate per Council contract. The result contract's overloaded P label does not authorize combining those measures.
- Preserve the approved visual shell: no CSS, asset, layout-class or animation changes.
- Run tests, build, diff checks and bounded UI verification where the authorized browser tool is available. Commit locally for sequential Council audit; do not merge, push or deploy.

## Risks for later Council review

The baseline includes imperfect contrast bindings and permissive archetype gates. This language pass must not silently redesign scoring or routing. Metadata parity is a regression guard, not proof of semantic equivalence; independent item/option and output review is still required. No company capability claims or live company grounding are needed for this local wording task.
