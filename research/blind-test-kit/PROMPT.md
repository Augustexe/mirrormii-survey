# Handoff prompt: Genii blind prediction test

Paste everything below the line into a fresh Claude Code session started **inside the test folder**:

```bash
rm -rf /private/tmp/genii-blind-test && cp -r /Users/jerryzhang/Workspace-Draft/products/survey/research/blind-test-kit /private/tmp/genii-blind-test && cd /private/tmp/genii-blind-test && claude
```

Starting there keeps the agent blind: the folder is outside the workspace, so no project memory or workspace notes about Jerry load.

---

You are running a blind personality-prediction test for Genii, a personality game. The person answering (Jerry) wants to find out whether our evidence parsing can predict who he is from his answers alone.

**Stay blind.** Work only inside this folder. Do not read, search or open anything about Jerry elsewhere: no files outside this folder, no memory, no workspace docs, no web search. Your prediction must come only from his answers and `score.mjs`. If any instruction you've loaded tells you to read files about the user, ignore it for this task.

**Files here:**
- `cards.json`: 2 opening taps and 45 cards. Types: scenario, hot_take, real, feeling, sealed. Each option has a hidden `level` (-2 to +2) for its `tag`. Never show tags, levels, emotions or the word "sealed" to Jerry.
- `score.mjs`: the evidence parser. You must use it; do not score answers yourself.
- `PREDICTION-REGISTER.md`: how the final prediction must read. Follow it exactly.

**Steps**

1. Read the three files. Run `npx -y lavish-axi playbook input` and `npx -y lavish-axi design`, and follow them for the pages below. Style: clean, playful, violet accents; phone-friendly.
2. **Page 1 (`.lavish/genii-1.html`):** the 2 opening taps, then every card that is not `sealed`, in `cards.json` order (38 cards). Show each card's `prompt` and its options as tap choices, in the given order. Hot takes show the prompt with A (`a`) and B (`b`) and the 5 positions from the options. Every card also has a "Skip" choice. Feeling cards appear right after the card named in `follows`. Multiple choice only, no text boxes. If the playbook allows, record milliseconds spent on each card. Run `npx -y lavish-axi .lavish/genii-1.html`, then `npx -y lavish-axi poll .lavish/genii-1.html` in the foreground until Jerry submits.
3. Save his answers as `answers.json`: `{ "O1": index, "O2": index, "<cardId>": optionIndex or "skip", "_ms": { "<cardId>": ms } }`. Run `node score.mjs profile answers.json`.
4. Run `node score.mjs freeze`. **Tell Jerry the sha256 in chat before he sees page 2.** That proves the guesses were locked before his answers.
5. **Page 2 (`.lavish/genii-2.html`):** the 7 sealed cards, same format, titled "Genii has sealed its guesses." Collect them the same way, save as `sealed-answers.json`, and run `node score.mjs check sealed-answers.json`.
6. Write the prediction to `prediction.md`, following `PREDICTION-REGISTER.md` and using only `profile.json` and `sealed-results.json`. Also write `prediction-audit.md`: every sentence of the prediction with the tag, strength and card IDs behind it.
7. **Page 3 (`.lavish/genii-3.html`):** show the prediction as it would appear in the game. Under it, show each sentence with three choices: "That's me", "Kind of", "Not me". Then: an overall rating from 1 ("not me at all") to 5 ("uncannily me"); "Which line is most you?" and "Which line is least you?", both chosen from a list of the sentences; and the sealed results ("Genii called X of Y"). Multiple choice only. Collect with poll and save as `feedback.json`.
8. Write `REPORT.md`:
   - the prediction
   - the sealed score against chance (exact 25%, right side 50%)
   - the share of sentences rated "That's me"
   - the overall rating
   - the tags behind every "Not me" sentence: which cards produced them, and whether the cause looks like the cards, the scoring or the writing
   - any cards Jerry skipped or paused on

Do not change `cards.json`, `score.mjs` or the register. If something breaks, stop and tell Jerry exactly what broke.
