# Final question check (Q1, independent judge pass)

Scope: `research/persona-quiz-v2/final/cards.json` (172 cards: 136 chapter + 12 extras + 24 sealed). Checked against `docs/VOICE.md` and `docs/LAUNCH-SPEC.md` sections 2 to 5. No cards rewritten; this pass found no bugs that needed a fix, so no bank files changed.

## 1. Repeated questions

`check-bank.mjs` already enforces unique `fp` fingerprints and no repeated answer lines, and it reports 0 errors (24 warnings, all pre-known: unlabeled this-or-that round ids, scene links on the unserved feeling cards, and the two approved over-length cards). I re-ran the same checks independently:

- Exact-duplicate answer lines across cards: one match, and it is "None of these" on six different receipts cards (C2-146, C3-148, C4-140, C5-161, C6-148, C7-144). That is the reserved exclusive-exit label, not a written answer, so it is not a repeat in the sense the rule means.
- Same `fp.trigger` + `fp.who` on three or more cards: none found.
- Read closely across chapters (about 110 of 172 cards, every chapter and the extras and sealed pool): no two situations felt like the same premise in different clothes.

No repeats found.

## 2. Boring answers

Scanned every option for escape-hatch words (depends, both, talk it through, sometimes) and for the four-strengths-of-one-move pattern. The four literal hits on "both" are all descriptive ("both families," "both names," not an escape hatch) and not mush. Across roughly 110 cards read in full, I did not find a ladder-of-intensity card or an unflagged responsible-adult default; answers consistently read as distinct moves, each with a cost or a detail, matching VOICE.md section 5. No ids to list here.

## 3. The two voices (spot check, 30+ cards across all 7 chapters, extras and sealed)

Checked C1-140, C1-141, C1-142, C1-143, C1-144, C1-126, C1-1, C2-160, C2-142, C2-143, C2-144, C3-101, C3-124, C3-148, C4-140, C4-30, C4-126, C5-140, C5-141, C5-124, C6-125, C6-140, C6-143, C6-148, C7-112, C7-7, C7-134, X-R1-40, X-L3-30, S-120, S-122.

All 31 pairs: same meaning, same option order, same evidence. Heart to heart used contractions throughout and read as a real voice ("I'm not swapping," "I'd want at least a paragraph"); Make it fun stayed playful without slang overreach. No mismatches found.

## 4. Audience fit

Grepped the full bank for health, body, diet, politics, religion, pregnancy, mental-health and app/account/private-data asks: no hits. Read through for teen- or parent-coded framing: none found; money, dating, and family cards read as 20s-to-30s situations (first dates, splitting rent, a partner's family, a parent's text), not teen or empty-nester framing. Couples/partner framing appears steadily across chapters 3, 4 and 6, matching the "women first, couples matter" brief. No flags.

## 5. Format serve rates

Ran `completeRun` from `quiz64/tests/persona-helpers.mjs` over 300 to 800 simulated lobbies (varied room sets and depths, `firstOption` chooser):

| Format | Served in run | Notes |
|---|---|---|
| bet, others, scenario, real, reply, receipts | 100% of runs | core formats, healthy |
| this_or_that | 97.7% of runs | healthy |
| role | 76% of runs | healthy |
| pick_two | 77.7% of runs | healthy |
| eyes | ~9.3% of runs (28/300) | rare |
| rank | ~5.7% of runs (17/300) | rare, matches LAUNCH-SPEC's own note that "runs almost never reach one" |
| feeling | 0% | switched off by design (`SERVE_FEELING`), confirmed |
| sealed | drawn at finale, not in the 40-card run; all 24 sealed cards got drawn at least once in 300 finales | working as designed |

Individual cards that came up 0 or near-0 times across an 800-run sample, beyond the feeling cards (off by design) and the known-rare rank card C2-142: **C2-145** (real), **C4-102** (scenario), **C5-128** (real), **C7-162** (others), **C7-120** (bet) never appeared; **X-R3-50**, **X-L3-30** (both scenario/this_or_that extras) appeared 0 to 1 times. These are ordinary-format cards, not feeling or rank, so their near-invisibility looks like picker weighting or axis/tag competition rather than a card problem. Worth a look from whoever owns the picker, but out of scope for this check-only pass (another agent owns app code right now).

**Decision for Jerry:** rank (2 cards) and eyes (4 cards) are both low-visibility formats; worth deciding whether to keep them as rare flavor or fold their content into more common formats.

## 6. Evidence sanity

Spot-checked evidence against text on about 20 cards across chapters, including the tag pairs in C1-140 (T02A "always invites" vs T02B "keeps score"), the axis signs in C6-125 (R1 +2 "front pocket, coming to everything" versus R1 -2 "shrink at your own place, please"), and C4-30/C4-126 (R2, R3 directness and tradition cards). In every case the axis sign or tag pole matched what the answer actually said: no inverted signs, no tag firing on an answer that doesn't support it. No mismatches found in the sampled set.

## Verdict

The bank reads as ready to ship as-is. `check-bank.mjs` passes clean (0 errors), the two voices stay in lockstep everywhere spot-checked, no sensitive or off-audience content turned up, and the evidence spot-checks held up. Nothing here needed a bug fix, so no cards or evidence locks were touched.

Five things worth a look later, none urgent:
1. **C2-145, C4-102, C5-128, C7-162, C7-120** – ordinary cards that almost never get served in an 800-run sample; worth a picker-side look to see if they're starved by axis/tag competition.
2. **Rank format** (2 cards, C2-142 and X-L2-40) – served in roughly 1 run in 17; decide keep-as-rare-flavor or retire.
3. **Eyes format** (4 cards) – served in roughly 1 run in 11; same decision.
4. **X-R3-50, X-L3-30** – extras that barely surface; low priority since extras exist for axis coverage, not variety.
5. The two approved over-length cards (C5-141, C1-126) keep tripping `check-bank.mjs`'s word-count warning; harmless since they're on the never-rewrite list, but worth a one-line note in the checker's known-warnings list so future runs don't re-flag them as new.

## Checks run

- `node research/persona-quiz-v2/final/check-bank.mjs`: 0 errors, 24 warnings (all pre-existing, listed above).
- No cards changed, so `npm --prefix quiz64 test` was not re-run (nothing to re-verify).
