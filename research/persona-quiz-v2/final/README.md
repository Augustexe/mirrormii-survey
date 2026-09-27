# Persona quiz v2: blind test 2 kit

The assembled, playable, scoreable quiz from `../BRIEF.md`: 7 chapters and a sealed finale, a deterministic scorer, a simulator that set the thresholds, tests, the result page spec and the handoff prompt for blind test 2. Plain Node (22+), no dependencies.

## Files

| file | what it is |
|---|---|
| `cards.json` | The run: `chapters[]` (n, title, intro, cards in run order), `finale[]` (8 sealed cards), `extras[]` (12 cards offered only when a side is unfinished), weights, exits and the flow. |
| `library.json` | `types.json` and `tags.json` merged: 6 axes, 16 half-names, 50 tags in 25 pairs, tag rules. |
| `friend.json` | The friend game content ("Do you really know me?"), read by `score.mjs friend`. |
| `score.mjs` | The scorer and the CLI (below). Also importable by `sim.mjs` and `tests.mjs`. |
| `sim.mjs` | Synthetic respondents; tunes the thresholds; writes `SIM-REPORT.md` and `sim-example/`. |
| `tests.mjs` | `node --test tests.mjs`: 20 tests (format, validity, reachability, order rules, em dash, teen run, scoring edge cases, freeze refusal, friend deck, sim targets). |
| `SIM-REPORT.md` | The simulation numbers and the tuning grid. |
| `RESULT-TEMPLATE.md` | How the result page and the share card read, with a worked synthetic example. |
| `PROMPT.md` | The handoff prompt for blind test 2 through lavish-axi. |
| `assemble.mjs` | Rebuilds `cards.json` and `library.json` from `../chapters/*.final.json`, `../library/` and `../judges/flow.json`. Run it in the repo, not in the blind copy. |
| `sim-example/` | One synthetic respondent (answers, sealed answers, hidden profile, result, sealed results). |

## Commands

```bash
node score.mjs profile answers.json      # -> profile.json + result.json
node score.mjs freeze                    # -> sealed-predictions.json + .sha256 (refuses a second freeze)
node score.mjs check sealed-answers.json # -> sealed-results.json (refuses if the predictions changed after the freeze)
node score.mjs friend --rel bestie --stings on   # -> friend-deck.json (partner | crush | friendOrCoworker | bestie)
node sim.mjs                             # tune and report
node --test tests.mjs                    # all checks
node assemble.mjs                        # rebuild cards.json and library.json from the sources
```

`answers.json`: `{"setup":{"age":"teen|adult","closest":"...","pronoun":"she|he|they"},"<cardId>": optionIndex | [i, j] | "skip" | "not_my_life" | "no_recent", "<cardId>.flip": index, "_ms": {"<cardId>": ms}}`. Outputs go to the current folder.

## The run

| chapter | cards (adult / teen) | real cards |
|---|---|---|
| 1 Your phone | 8 / 8 | C1-4 |
| 2 Friends | 9 / 9 | C2-2, C2-5 |
| 3 Love and your person | 10 / 8 | C3-2, C3-5, C3-12 |
| 4 Money and treats | 7 / 7 | C4-5 |
| 5 Work, school and ambition | 9 / 9 | C5-5, C5-7 |
| 6 Family and home | 10 / 9 | C6-2 |
| 7 Play, rules and you | 9 / 9 | C7-6, C7-4 |
| Finale | 8 sealed | |

62 chapter cards for adults, 59 for teens, plus the 8-card finale. Order checked by test: no two neighbours share an axis or tag pair (chapter borders and finale included), no two neighbours share a type except this_or_that rounds of up to 3, 8 of 12 real cards in the first two thirds.

## Scoring (brief rules, as built)

- Weights: real 0.80, scenario 0.55, this_or_that, role and pick_two 0.45 (each pick of a pick_two counts), feeling and sealed 0. Under 1500 ms counts at 0.3. Circumstance options, Skip, Not my life, No recent example and "depends" options never score; they go to the research record (with the flip answer).
- Axes: weighted sum, normalized by the maximum possible for the cards answered. Fewer than 2 valid cards: unfinished, and the result names 2 extras for that axis. |normalized| under 0.12: Flex, pole from real-card evidence, else the first card.
- Tags: at least 2 separate cards, at least 1 not rushed, net support (minus the pair) of at least 2.25; strong at 3.0. Up to 5 shown, strongest first, swapped to cover at least 3 chapters where possible. If nothing fires, the best candidate above 1.25 under the same card rules shows as "leaning", so nobody leaves with 0.
- Splits: believe-grade evidence one way and did/would the other on the same axis or tag pair, each at least 0.4. The strongest split with a real card becomes the plot twist.
- Sealed: Genii picks the option whose axes and tags best match the profile; it passes (does not count) when the card's main axis is Flex or unfinished, or when a tag-only card has no evidence.
- Friend deck: Level 1 truth per axis (Flex and unfinished accept either answer), Level 2 by `friend.json` selection rules (answer side computed live from the chapter cards), Level 3 the 12-card tag deck (decoys never come from a pair the owner fired a tag in, unless those run out), Level 4 sting pick (the 3 other lines are never the owner's own fired tags) and roasts for a bestie with sting lines on.

## Key numbers (SIM-REPORT.md)

- Consistent respondents: 4.89 tags shown on average, 99.4% get 3 to 5, none get 0; 86% of shown tags match the hidden profile; axis recovery 88% (96% when the hidden position is clear); sealed exact 61% (chance 25%), right side 84%, Genii passes on 8%.
- Random clickers: 0.53 strong tags on average (target under 1.5), 2.43 tags shown in total, sealed exact 25.6% (chance).
- Speed-tappers: no tag ever fires from rushed taps alone.
- No axis lands above 53% on one pole across consistent respondents.

## Choices not spelled out in the brief

1. **Finale**: the flow judge's 8 sealed cards (C2-10, C4-10, C6-S1, C5-S1, C7-S1, C3-10, C2-11, C7-S2). They cover all six axes; C2-11 (T05/T06) and C7-S2 (T22) are the two common-tag checks. None had to be written.
2. **Extras**: the brief offers "1 or 2 extra cards" for an unfinished axis but no cards existed, so 12 new ones were written (2 per axis, teen-safe, axis evidence only). They play only when needed.
3. **Zero-tag floor** (tagFloor 1.25, "leaning"): added so the brief's "none 0" holds at a fire threshold high enough to keep random clickers' tags down.
4. **Run length**: 62 chapter cards sits inside 56 to 64; with the finale the adult run is 70. If the cap must include the finale, the flow judge's next cuts are C3-6 and C6-5 (feeling cards). Nothing was cut here.
5. **Teen scoring**: C6-7 (teen-visible) carries T21 lines; T11 and T21 (locked18 tags) are never scored or shown for a teen.
6. **"Depends" options** are the options on a card with a `flip` that score nothing and start with "Depends"; they are marked `depends: true` in `cards.json`.
7. **Sealed side hits** are counted only when both the guess and the answer carry a value on the card's main axis (C4-10's "Wait for the rerun" and C7-S1's "Make both" do not).

## Open items for the library (not changed here)

- Fixed in verification (VERIFY.md): T15 moved to chapter 4 and its cut chapter 5 trigger marked cut; T10 triggers now cite C5-10.
- Open (VERIFY.md): 20 of 50 tags can never fire in the shipped run; see VERIFY.md before blind test 2.
- T22B's call "Your favorite place starts making your order when you walk in" echoes the C7-S2 finale prompt (ch7 change notes). It can show among Genii's calls after the finale.
- 27 of 50 tags have no real-card trigger (tests print the list); they fire on scenario and quick-pick evidence only.
