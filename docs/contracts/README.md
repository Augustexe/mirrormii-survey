# Backend contracts: the launch survey

Status: **proposed for Desmond, derived from the code on 2026-09-29 (round 4)**. Entry page: [../HANDOFF-DESMOND.md](../HANDOFF-DESMOND.md). Product rules: [../LAUNCH-SPEC.md](../LAUNCH-SPEC.md).

Every schema is JSON Schema draft 2020-12 and is checked against the real kit and real runs of the app, so a change on either side that breaks a contract fails a test.

| Contract | What it is | Today or proposed | Notes |
|---|---|---|---|
| [run.schema.json](run.schema.json) | The stored run: setup, lobby, answers, timings, Genii's lock, sealed answers, friend links and replies (`genii.persona.run/3`) | today (localStorage, Download my data) | [run.md](run.md) |
| [result.schema.json](result.schema.json) | The finished result record (`genii.persona.result/1`): archetype halves, six stats with pole, strength and pips, findings, traits, core trait keywords, rooms, insight, stings, Genii's calls, share card, counts. `$defs/resultView` is the app object it is built from | record proposed, built from today's code | [result.md](result.md) |
| [card.schema.json](card.schema.json) | The question pack, `cards.json` (full and build-stripped) | today | [card.md](card.md) |
| [library.schema.json](library.schema.json) | Result copy, `library.json` (both voices) | today | [library.md](library.md) |
| [friend-content.schema.json](friend-content.schema.json) | Friend game copy and rules, `friend.json` | today | [friend-challenge.md](friend-challenge.md) |
| [friend-challenge.schema.json](friend-challenge.schema.json) | Friend links today (challenge body, reply body, saved challenge and reply, guesses, friend-safe result, owner comparison) and the proposed server shapes (challenge record with the answer key, public challenge, submission) | both | [friend-challenge.md](friend-challenge.md) |
| [events.md](events.md) | Analytics events we recommend, with properties. No personal data | proposed | |
| [api.md](api.md) | Proposed endpoints, tokens, rate limits, privacy | proposed | |

Supporting files:

- [records.mjs](records.mjs): reference mappings from the app's objects to the contracts (`buildResultRecord`, `buildPublicChallenge`, `buildChallengeRecord`). Pure functions over the app's own modules; a network layer or a Node server can import them as is.
- [examples/](examples/): one synthetic player end to end (run, result, links, challenge record, public challenge, submission, friend-safe result). Rewritten by `node scripts/validate-contracts.mjs --write-examples`. Synthetic, never a real person.

## Validate

From `products/survey/` (Node 22, no install needed):

```sh
node scripts/validate-contracts.mjs            # one line per check, exit 1 on any failure
npm test --prefix quiz64                       # includes tests/contracts.test.mjs (the same checks plus drift probes)
```

The validator is a small dependency-free implementation of the draft 2020-12 subset these schemas use (it refuses any other keyword, so a schema never silently skips a rule). On a server, load the same files into Ajv (`ajv/dist/2020`) with `allErrors` and the `unicode` regex flag; `$id`s are stable URLs under `https://mirrormii.ai/contracts/genii-persona/` and cross-file `$ref`s are relative file names.

What the checks run: every schema lints; `cards.json` (full and as the app ships it after `kit-strip.mjs`), `library.json` and `friend.json` validate; three synthetic players play the app's real step machine (`session.js`) to the result in each voice, lobby depth and a spread of rooms; their stored run, result record and `resultView`, the challenge and reply links (decoded), the saved challenge and reply, the owner comparison and the proposed server shapes validate; the example files validate; and the question pack export is current.

## Changing a contract

1. Change the code or the kit.
2. Run the validator. If it fails, decide: is the change right? Then update the schema, the `.md` next to it, `api.md` or `events.md` when the meaning changed, and bump the `schema` string (`genii.persona.result/2`, and so on) when a stored object changes incompatibly.
3. `node scripts/validate-contracts.mjs --write-examples` and `node scripts/export-question-pack.mjs` when the kit changed.
