# Genii Switch Modes survey

Genii is a local React/Vite survey experience with a deterministic, evidence-first route. The v3 implementation test has 32 profile/context candidates and eight sealed checks. Four linked follow-ups appear only after an authored parent answer, so a respondent sees 36–40 questions rather than irrelevant filler.

The current product direction is: **the useful result is not a permanent type; it is the pattern between the situation, what mattered, and what the person did.** The approved visual system and page layout remain unchanged in this implementation.

## Run locally

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm install --prefix quiz64
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run dev --prefix quiz64 -- --port 4188
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run build --prefix quiz64
```

The build uses a relative base path and local assets. It has no runtime data requests, account, analytics, backend, messaging, or survey API. Answers stay in the browser unless the respondent explicitly downloads the private JSON export.

## Developer result preview

Open `preview.html` beside the survey entry to inspect complete, mixed, sparse, or fully skipped synthetic answers. The preview uses the same engine and final evidence screen, never writes survey localStorage, and labels exports as synthetic.

## Evidence behavior

`src/data.js` owns v3 questions, literal option receipts, direct context fields, routine measures, behavioral mappings, route order, and follow-up predicates. `src/engine.js` owns routing, validation, evidence rows, bounded claims, routine projections, emotion layers, sealed predictions, feedback, restore, and export.

The six opening fields are locked literal selections: current friction, social context, desired help, optional tender topic, friend-challenge preference, and preferred teaching tone. They never become personality evidence. Action and motive stay separate. Linked answers from one event may support one bounded explanation but do not count as independent corroboration.

The final evidence screen presents:

- a context-first “switch modes” thesis;
- a teaching tone selected by the respondent (`understanding`, `direct`, `funny`, or `permission-first`);
- exact source receipts, scope, alternatives, and next validation for each claim;
- direct routine pairs for sleep restoration, meal timing, and daytime energy;
- separate inside feeling and outward response records;
- a goal-aligned MirrorMe continuation preview;
- eight predictions frozen before held-out answers, with abstention and baseline denominators.

`skip`, `no_example`, and `other` are distinct and unscored. Variable routine answers remain unknown rather than becoming zero. True/False feedback appends an immutable claim/evidence snapshot and never rewrites the portrait. The versioned local key is `genii.switch-modes.v3`; v2 attempts fail closed and remain untouched under their prior key.

This is an implementation test, not a validated personality inventory, health score, diagnosis, calibrated probability, or proof of product benefit.

## Verification

```sh
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm test --prefix quiz64
/Users/jerryzhang/Workspace-Draft/system/bin/dev npm run build --prefix quiz64
```

The v3 suite has 18 bank/engine tests covering route semantics, reviewed wording patches, locked literal fields, action/motive fidelity, routine unknowns, inside/outside emotion separation, conditional invalidation, sealed-check isolation, abstention, immutable feedback, restore hardening, export secrecy, and all-skipped behavior.
