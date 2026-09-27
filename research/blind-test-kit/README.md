# Genii blind prediction test kit (2026-09-26)

The fastest real test of the evidence parsing: a Claude Code agent shows the 45 cards to Jerry through lavish-axi pages, parses his answers deterministically with `score.mjs`, seals its guesses before he sees the sealed cards, writes his personality prediction, and collects his line-by-line verdict. No build, no backend.

- `PROMPT.md`: the handoff prompt and the one command that starts a blind session.
- `cards.json`: 45 cards in the approved golden-set register (20 scenarios, 10 real moments, 5 hot takes, 3 feeling follow-ups, 7 sealed checks) over 19 tags, plus 2 opening taps.
- `score.mjs`: weighted evidence (real 0.80, scenario 0.55, hot take 0.45), tag strength, believe-versus-did splits, emotions, circumstances, timing pauses, sealed freeze with sha256, and sealed scoring.
- `PREDICTION-REGISTER.md`: the voice and rules of the prediction.

Self-tested on a synthetic respondent 2026-09-26: 19 tags, 2 splits found, 4 guesses frozen and 3 passed, a second freeze refused.

Caveat: Jerry designed and has seen 9 of these cards (the golden set) and knows the tag ideas, so his run is a first real signal, not a blind validation. Teammates who haven't seen the cards are the real test.
