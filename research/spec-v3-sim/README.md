# Spec V3 noise test

Supports [SURVEY-SPEC-V3.md](../../docs/SURVEY-SPEC-V3.md) sections 1, 5 and 8.

- `noise-test.mjs`: runs simulated respondents (uniform random, 20% skips, always-left, always-right) through the real `dossier-session.js` scoring and `buildGameOutcome`, per route. Reports how often the title is "Plot still developing", how many distinct titles appear and the top titles. Usage: `node noise-test.mjs 400` (about 5 minutes).
- `persona-jasmine.mjs`: runs SYN-23 Jasmine's 33 answers through the same code and prints her axes and title.
- `item-tags.json`: the A to E tag, bond, scene summary and proposed V3 remap for every live item.

The imports expect the live `quiz64/` at the project root, which is the proposed permanent home (STATE.md). Until that merge, point the imports at the worktree listed in CODE-MAP.md. Results of the 2026-09-26 run (seed 42, n=400) are quoted in the spec.
