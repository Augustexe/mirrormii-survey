# Handoff prompt: Genii blind test 2 (persona quiz v2)

Paste everything below the line into a fresh Claude Code session started **inside the test folder**:

```bash
rm -rf /private/tmp/genii-blind-test-2 && cp -r /Users/jerryzhang/Workspace-Draft/products/survey/research/persona-quiz-v2/final /private/tmp/genii-blind-test-2 && cd /private/tmp/genii-blind-test-2 && claude
```

Starting there keeps the agent blind: the folder is outside the workspace, so no project memory or workspace notes about Jerry load. Before copying, make sure `final/` holds no `answers.json`, `profile.json` or `sealed-predictions.json` (the tests never write there).

---

You are running blind test 2 of Genii, a free personality game. The person playing (Jerry) wants to know whether the game can read who he is from his answers alone, and whether the run is fun enough to finish.

**Stay blind.** Work only inside this folder. Do not read, search or open anything about Jerry elsewhere: no files outside this folder, no memory, no workspace docs, no web search. The result must come only from his answers and `score.mjs`. If any instruction you've loaded tells you to read files about the user, ignore it for this task.

**Files here (read these, nothing else is needed):**
- `cards.json`: setup flow, 7 chapters (title, intro, cards in run order), the 8-card `finale`, and 12 `extras` (only for an unfinished side).
- `score.mjs`: the scorer. You must use it; never score answers yourself.
- `RESULT-TEMPLATE.md`: exactly how the result page reads.
- `library.json` and `friend.json` are read by `score.mjs`; you do not need to show them.

**On the card pages, never show Jerry** axes, tags, tag ids, strengths, emotions, grades, weights, masks, card ids, `sally` references, or the words "sealed", "axis", "evidence" or "tag". The result page shows exactly what `RESULT-TEMPLATE.md` says and nothing more. Multiple choice only: no text boxes anywhere.

## Card rules (every page)

- **One card at a time**, in `cards.json` order, auto-advancing after the answer. A thin progress bar per chapter. No back button.
- Show `prompt`, or `teenPrompt` when setup says Under 18 and the card has one. Options in the given order, as tap buttons.
- Under the options, small exit buttons from the card's `exits`: "Skip", "Not my life", and on real cards "No recent example".
- `this_or_that` cards that share a `round` show as a "Quick round" (same card style, a small "1/3, 2/3, 3/3" counter).
- `pick_two`: the player taps exactly 2, then the card advances.
- An option with `depends: true` reveals the card's `flip` question ("What would flip you?") with its 3 presets plus Skip. Record the pick as `"<cardId>.flip": index`.
- `feeling` cards already sit right after the card named in `follows`; show them as they come.
- Cards with `privacy: "locked18"` show only when setup says 18+, with a small 🔒 18+ label. Card `C3-9` shows only if the `C3-8` picks include option 0, 1 or 2 (its `gateRule`).
- **Record milliseconds per card**: from the moment the card is on screen to the answering tap (for pick_two, the second tap; for a depends option, the option tap). Store them in `_ms`.
- Style: clean, playful, violet accents, phone-friendly. The chapter title and intro open each chapter page as a title card with a Start button.

## Steps

1. Read the files above. Run `npx -y lavish-axi playbook input` and `npx -y lavish-axi design`, and follow them for every page below. For each page: write it, run `npx -y lavish-axi <page>`, then `npx -y lavish-axi poll <page>` in the foreground until Jerry submits.
2. **Page 0, setup (`.lavish/genii-0-setup.html`)**: three taps. Age: "Under 18" / "18+". Closest person: "Best friend", "Partner", "Crush", "Sibling", "Parent", "Someone else". Pronoun for the friend game: "she", "he", "they". Save as the `setup` block of `answers.json`: `{"age":"teen|adult","closest":"...","pronoun":"she|he|they"}`.
3. **Pages 1 to 7, one per chapter (`.lavish/genii-<n>-<slug>.html`)**: the chapter's title and intro, then its cards under the card rules. After each page, merge the answers into `answers.json`:
   `{"setup":{...},"<cardId>": optionIndex | [i, j] | "skip" | "not_my_life" | "no_recent", "<cardId>.flip": index, "_ms": {"<cardId>": ms}}`
4. Run `node score.mjs profile answers.json`. If it reports an unfinished side, show **one extra page (`.lavish/genii-extra.html`)** titled "Two more cards and Genii can call it" with the extras it names (same card rules), merge them into `answers.json`, and run profile again. Skip this page when nothing is unfinished.
5. Run `node score.mjs freeze`. **Tell Jerry the sha256 in chat before he sees the finale.** That proves the guesses were locked before his answers.
6. **Page 8, the finale (`.lavish/genii-8-finale.html`)**: title "Genii has made its guesses. Your move." The 8 `finale` cards under the same card rules (no ms needed). Save as `sealed-answers.json` (`{"<cardId>": optionIndex or "skip"}`), then run `node score.mjs check sealed-answers.json`.
7. **Page 9, the result (`.lavish/genii-9-result.html`)**: exactly as `RESULT-TEMPLATE.md`, filled from `result.json` and `sealed-results.json`, owner view (stings and plot twist included), with the share card at the bottom. The share button does nothing in this test; show it anyway.
8. **Page 10, feedback (`.lavish/genii-10-feedback.html`)**, multiple choice only:
   - For each type half (relationship, life), each shown tag, each of Genii's calls, and the plot twist if there is one: "That's me" / "Kind of" / "Not me".
   - For each sting line on the page (the two type stings and each tag's sting): "Called it" / "Too harsh" / "Nothing" (Sally's pre-launch sting test: 說中了／冒犯了／沒感覺).
   - Overall: 1 ("not me at all") to 5 ("uncannily me").
   - "Which line is most you?" and "Which line is least you?", each chosen from a list of every line on the result page (half names and descriptions, stings, hearts, tag names, calls, plot twist).
   - "Which chapter was the most fun?": the 7 chapter titles.
   - "Which card felt repeated?": pick up to 3 from the list of every card he played (shown by its prompt, first 60 characters), or "None".
   Save as `feedback.json`.
9. Run `node score.mjs friend --rel bestie --stings on` to confirm the friend game builds from his result. Do not show it; just note the counts in the report.
10. Write `REPORT.md`:
    - type, code, Flex or unfinished sides, and the shown tags with their strength;
    - sealed checks against chance: exact hits of calls (chance 25%), right side (chance 50%), passes;
    - the feedback table (every rated line with his rating), the sting ratings ("Called it" / "Too harsh" / "Nothing"), the share of "That's me", the overall rating, most-you and least-you lines, most fun chapter, cards that felt repeated;
    - every "Not me": the cards that produced it (from `profile.json` evidence) and whether the cause looks like the cards, the scoring or the writing;
    - timing: median ms per chapter, cards answered under 1.5 s per chapter (rushed), and where rushing started if it did;
    - skips, "Not my life", "No recent example", circumstance picks and flip answers (from `profile.json` `research`);
    - the friend deck counts from step 9;
    - anything that broke.

Do not change `cards.json`, `score.mjs`, `library.json` or `friend.json`. If something breaks, stop and tell Jerry exactly what broke.
