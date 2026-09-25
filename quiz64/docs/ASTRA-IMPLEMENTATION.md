# Astra V4 language implementation

Status: **implemented and locally verified; ready for sequential Council audit**. This is not production readiness, human validation or deployment approval.

Branch: `fm/genii-language-astra`. Base: `533c3da` (`codex/personality-game-council-v4`), brought into the disposable worktree by fast-forward before editing. The current local `main` remained an ancestor at validation. No merge into main, push, remote operation or deployment was performed.

The pre-edit review is [ASTRA-LANGUAGE-AUDIT.md](ASTRA-LANGUAGE-AUDIT.md).

## Changed surfaces

| Surface | Implementation |
| --- | --- |
| All 52 prompts and setups | `src/respondent-copy.js` replaces author notes, shorthand, vague placeholders and internal references with ordinary English. Actual examples name their time window; contrasts describe what stays fixed. |
| All 272 authored options and 106 exits reviewed | The wording layer explicitly lists every option in original ID order, including wording retained unchanged. Shared exit labels distinguish declining, insufficient information, missing experience and a custom answer. |
| Context selectors | Human labels for all existing keys/values; fields, allowed values and boundary filtering unchanged. |
| Host replies | `src/host-reactions.js` acknowledges the selected action without adding a motive. Corrected previously mismatched replies for direct asking, stepping back, temptation and public embarrassment. |
| Landing, chapters, map, help, review, gateway, save/skip/notes | Ordinary descriptions of questions, preferences, saved guesses and limitations. The chapter count now reflects the actual nine chapters. |
| Result generation | `src/engine.js` produces a plain headline, a short tentative explanation, contextual examples, an optional behavior-specific roast and a literal support preference. |
| Disclosures | `src/result-language.js` supplies readable source descriptions, context values and item-specific limits. The UI no longer interpolates raw targets, IDs, source-unit labels, domain keys or audit enums into sentences. |
| Feedback and checks | Fits / Not quite explicitly leaves the original unchanged. Check copy explains passes, exact-choice matches and the fixed-answer comparison with denominators. |
| Private highlights/export | Removed the false “public-safe” promise from highlights containing exact answers. Download copy warns that the file contains private answers. Technical provenance remains in JSON. |

### What changed in generated sentences

This is not a visibility-only repair. The old thesis combined a raw target with “puts a cost on your next move” and could borrow an unrelated motive. The replacement selects a real parent/contrast pair and names each situation before quoting its answer. If there is no pair, it uses a single bounded example and only a motive from that same linked event.

The old sections appended stock lines about chaos, choreography, glitter pens and private autobiographies. The new sections describe a selected response in its own setting. Recalled actions are preferred for the action example. Imagined feelings remain imagined; recovery is not inferred. Practical help preferences are drawn from the actual help item before falling back to result-style preferences.

Roasts are small, tied to a specific action, and omitted for gentle/permission-first tone or hands-off support choices. No motive, diagnosis or moral identity is added to make a joke work.

## Preserved evidence contracts

**Verified by exact metadata comparison to the base commit:**

- All item/option/exit IDs, option order and response formats.
- Every neutral meaning, authored claim limit, unsupported-inference list, tag and target.
- Timeframes, windows, costs, source roles, linked-event IDs and dependency metadata.
- All 52 route slots, boundary rules, required context field definitions and allowed values.
- All eight heldout baselines and explicit transfer-rule mappings/thresholds.

Q (question quality), E (claim support) and P (prospective performance) remain separate. No new score, weight, accuracy metric or inferred personality dimension was added.

- Literal receipts now carry the new question/answer text and wording version; `why` equals the exact visible option text.
- Missingness receipts retain the exact displayed exit label plus the unchanged missingness ID. No exit becomes profile evidence.
- Every heldout choice has exact question/answer wording in its evaluation row, never in portrait observations.
- Linked action/motive and matched contrasts remain one event, not extra independent support.
- Selected preferences remain literal facts, never evidence for character.
- Feedback preserves the original result/predictions. Heldout results remain hidden until all checks are resolved, including when a caller supplies partial `_stats`.
- A pre-freeze private export now passes its captured context bindings into receipt construction; previously it omitted those bindings from the receipt rows even though it exported them separately.

### Wording and saved-state boundary

- Frozen authoring bank/version and mapping version are unchanged.
- Wording/copy version: `v4-astra-english-1`.
- Local storage key: `genii.personality-game.v4.astra.v1`.
- Fresh attempts and receipts identify the wording version. Old attempts without it fail closed; older keys remain untouched. A mismatched frozen copy version clears check state instead of silently relabeling it.
- No production migration or cross-version answer reinterpretation is included.

## Small runtime repairs required to review the experience

1. **Context props:** `QuizView` referenced context state it did not receive. Forwarded the existing state/setter from App through QuizView to QuestionCard. All three required-context questions were then completed through the real UI.
2. **Ninth ribbon icon:** the nine-chapter V4 bank exceeded an eight-icon array and crashed the question screen. Reproduced in Chrome and in a failing React-render regression test. Added the same existing Sparkles fallback already used by ChapterObject.

These repairs do not redesign the shell. CSS, visual assets, motion definitions and styling classes were not changed. Existing layout and glass/card treatment remain in place.

## Validation

Commands from this worktree, using the managed `dev` launcher:

```sh
npm --prefix quiz64 test
npm --prefix quiz64 run build
git diff --check
```

**Verified:** 40 tests pass (29 existing tests retained with five wording expectations updated, plus 11 language/UI tests). Vite production build succeeds. It still emits the greater-than-500-kB chunk warning; no bundle optimization was attempted.

Added coverage:

- Exact non-copy parity for all 52 items against `tests/fixtures/v4-semantics-533c3da.json`.
- Every one of the 232 profile options and all profile exits produces the correct literal receipt or missingness state.
- All 40 heldout options and their exits have literal evaluation text and leave the frozen portrait unchanged.
- Context-preserving pre-freeze exports and cross-wording restore isolation.
- 120 deterministic answer sets check generated wording, valid source links, exact thesis quotes and audit outcomes.
- A negative cross-event-motive case and literal-help-versus-result-goal case.
- Gentle and hands-off preferences.
- Real React rendering of every question, all nine ribbon icons, and complete/mixed/sparse/skipped results including closed disclosure contents. Partial checks do not appear.

**Verified through the task-isolated `chrome-devtools-axi` session:**

- Started from the landing page and answered all 52 questions through UI controls, including all chapter transitions and the freeze gateway.
- Captured/stored context for the reassurance, actual-favor and information-sharing items.
- Reached the complete result with 52 saved answers and no browser console errors after the repairs.
- Opened all disclosures and a claim explanation; no internal ID/schema/audit language appeared in visible text.
- Saved Fits feedback: the frozen snapshot remained byte-for-byte unchanged.
- Inspected desktop (1200px) and mobile (390px) result screenshots and a mobile required-context question. No horizontal overflow; selected context restored and Continue enabled on review.

Automated string checks are not a readability study or an independent evidence audit. The Council review is still the next gate.

## Open risks and review priorities

1. **Semantic review remains pending.** Keeping all metadata identical prevents accidental code remapping; it cannot prove that every rewritten phrase carries exactly the same meaning for a human. Review all options against the frozen neutral meanings.
2. **Existing context limitations remain.** In particular, the close/new contrast can follow different relationship selections, and some contrasts rely on the respondent holding imagined costs fixed. The final help check's relationship target is still underspecified in the baseline. No routing or prediction redesign was smuggled into this language pass.
3. **Existing source-role inconsistency:** the favor-motive follow-up is tagged hypothetical in the frozen bank despite referring to a recalled favor. Its metadata is preserved. The disclosure describes it plainly as the reason selected for that recalled event, without upgrading its scoring strength.
4. **Archetype gates and audit heuristics are not validated.** Gates are unchanged. Clearer cautious copy does not establish accuracy. Regex/source-presence checks cannot prove entailment or make a questionable archetype scientific.
5. **No public projection is approved.** Highlights can include exact private answers; they are labeled accordingly. This task does not implement public sharing or certify a public-safe export.
6. **Mobile context controls remain visually dense.** They fit without horizontal overflow, but use the inherited form layout. Visual redesign was explicitly out of scope.
7. **No human usability testing, independent Council audit, production service, analytics, backend write, public launch or company-capability claim.**

## Next reviewer entry points

- Start with the pre-edit audit and this implementation report.
- Compare `respondent-copy.js` against the frozen fixture or original V4 question map for item/option drift.
- Review `thesisFor`, `buildSections`, `darkSideSection` and `result-language.js` for output fidelity.
- Run the tests, then use `quiz64/preview.html` for the synthetic complete/mixed/sparse/skipped cases.
- Report semantic/claim problems before approval; do not treat the green test suite as Council acceptance.
