# Persona quiz V2 kit: the launch survey's content and scorer

Everything the web app (`quiz64/`) imports about content: the card bank, the merged `cards.json`, the result copy, the
friend game copy and the one deterministic scorer, plus the tools that check, lock, simulate and test them. Plain Node
22 or newer, no dependencies. The rules (formats, evidence, scoring, picker, gates) live in
[LAUNCH-SPEC.md](../../../docs/LAUNCH-SPEC.md) sections 4, 5 and 8; how cards sound lives in
[VOICE.md](../../../docs/VOICE.md).

## Files

| File | What it is |
|---|---|
| `bank/ch1.json` to `ch7.json`, `extras.json`, `sealed.json` | **Source.** The authored cards per chapter (136), the 12 axis extras and the 24 sealed cards, both voices |
| `cards.json` | The merged kit the app and scorer read. Built by `merge-bank.mjs`; never edit by hand except chapter titles and intros |
| `library.json` | Result copy: 6 axes, 16 archetype halves, 50 tags in 25 pairs, rooms, insights, stings, article frames, drama stat lines; both voices |
| `friend.json` | Friend game ("How well do you know me?") copy and rules; `level2` is a snapshot kept by `friend-snapshot.mjs` |
| `subquestions.json`, `SUBQUESTIONS.md` | The 68 sub-questions every card is built from (field `sq`), and a readable map of them |
| `naming/names-64.json` | The one story line under the title, per people x day-to-day pair, both voices (read by `quiz64/src/persona/combo-lines.js`) |
| `evidence-lock.json` | SHA-256 of every card text next to the evidence it carries (`lock-evidence.mjs`) |
| `score-core.mjs` | The scorer: `createScorer({ kit, lib, friend })`, pure functions, no I/O, `CONFIG` thresholds. The app imports this file |
| `card-schema.mjs` | Formats: grade, weight, exits and option counts per type, type groups |
| `score.mjs` | Node wrapper and CLI over the core (below) |
| `merge-bank.mjs` | `bank/*.json` to `cards.json` (refuses on checker errors) |
| `check-bank.mjs` | Bank rules: schema, fingerprints, repeated lines, shapes, bans, scene links (`--kit` checks `cards.json`) |
| `shape-audit.mjs` | Shape variety report; its `SHAPE_LIMITS` are enforced inside `check-bank.mjs` |
| `lock-evidence.mjs` | Checks the evidence lock; `--confirm <cardId>` re-locks a re-read card |
| `friend-snapshot.mjs` | Checks `friend.json` level 2 against the cards; `--write` refreshes it |
| `audit.mjs` | Coverage against the spec's section 4 targets, random-clicker balance |
| `sim.mjs` | Synthetic players: writes `SIM-REPORT.md` and `sim-example/` |
| `SIM-REPORT.md`, `sim-example/` | The last simulation, and one worked respondent the kit and app tests read |
| `tests.mjs` | `node --test tests.mjs`: scorer, kit, lock, friend deck, CLI and copy tests |

## Commands

Run inside this folder.

```sh
node --test tests.mjs                    # all kit tests
node check-bank.mjs                      # check the bank (--kit for cards.json)
node merge-bank.mjs                      # bank/*.json -> cards.json
node lock-evidence.mjs                   # evidence lock holds?
node audit.mjs                           # coverage and balance
node sim.mjs                             # simulation -> SIM-REPORT.md, sim-example/
node score.mjs profile answers.json      # -> profile.json + result.json in the current folder
node score.mjs freeze                    # -> sealed-predictions.json + .sha256 (refuses a second freeze)
node score.mjs check sealed-answers.json # -> sealed-results.json
node score.mjs friend --rel bestie --stings on   # -> friend-deck.json
```

The `answers.json` format is documented at the top of `score.mjs`.

## Changing a card

Follow the change flow in LAUNCH-SPEC section 5: edit `bank/*.json`, merge, check, re-lock the changed cards after
re-reading them, refresh the friend snapshot, run the sim and the kit tests, then from the repository root rewrite the
contract examples and the question pack and run `npm test --prefix quiz64`.

## Bank history in brief

- 2026-09-28 to 09-29: the bank was rebuilt sub-question first (Build C), 13 formats, two voices, evidence locked.
- 2026-09-29 (round 4): concept clusters over the two-cards-per-concept limit got new situations on the same
  sub-questions; C1-163 moved from T02 to T04 and C2-160 from T02 to T05 on purpose, leaving T02 on 2 cards.
- 2026-09-30: BATCH-02 pass (10 cards rewritten, C1-161 and C7-142 cut), the voice pass on all 172 cards and the final
  card read ([docs/review/FINAL-CARD-READ.md](../../../docs/review/FINAL-CARD-READ.md)).
- The full round logs, cut card text, judge rounds and earlier drafts were removed for handoff; they are in git history.
