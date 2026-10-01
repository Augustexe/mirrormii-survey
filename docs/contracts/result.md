# Result record (`result.schema.json`)

**Proposed record, built from today's code.** `buildResultRecord(state)` in [records.mjs](records.mjs) reshapes two things the app already produces for a finished run:

- `views.resultView(state)`: the 12-screen Stories deck in the player's voice, the share projection and the guess sheet (`$defs/resultView` in the schema checks its main fields).
- `session.resultFor(state)`: the scorer's profile, result and sealed check.

Example: [examples/result.json](examples/result.json).

| Field | From | Notes |
|---|---|---|
| `archetype.people`, `archetype.life` | names screen, library | `code` is the internal id (never shown), plus the kicker, the name, its one-line `define` (every title card shows kicker, name and define; LAUNCH-SPEC section 6), read and desc in voice. `opposite` is the share screen's "Your opposite" line (copy not yet approved) |
| `axes[6]` | map screen (character sheet) | `stat` (Closeness, Hard truths, Traditions, New things, Pace, Rules; LAUNCH-SPEC section 6), `pole` (internal) and `end` (player-facing), `sign`, `strength` (abs normalized score, 0 to 1), `cards`, `pips` 0 to 5, `level` (1 to 5, `both`, `open`), `levelWord`, `flex`, `unfinished`, `badge` (signature or wild), `line` |
| `findings` | what Genii knows best | up to 6, clearest first |
| `tags` | top traits | up to 5 shown tags, rank order, with `strength` (strong, showing, leaning) and `private` (marriage and kids) |
| `coreTraits` | core traits | 5 to 6 keywords when evidence allows; `source` is the tag or axis behind each |
| `rooms` | room by room | empty when fewer than 2 rooms have a line |
| `insight` | the thing you didn't know | `from.kind`: split (a real believe-versus-did split), fallback (per half), call |
| `stings` | open book | owner screen only, never on share cards |
| `calls` | Genii's calls | `called`, `exact` (the one number players see) and one row per sealed card |
| `share` | share card | exactly what the image and share text carry |
| `counts` | scorer | answered, skipped, rushed and so on; analytics only |

Rules the schema enforces: no answer text or option index anywhere, share carries no stings, six axes in fixed order, pips 0 to 5, at most 5 tags and 6 core traits.

**Voice.** Copy is in the voice the player picked (`cards` reads Make it fun wording). A server that wants another voice re-renders from the stored run with the other lobby voice; ids are voice-free.

**The Evidence Article** (round 4, `quiz64/src/persona/article/article-data.js` `buildArticle({ stories, lib })`) is a pure projection of the same `resultView` plus `library.json` `article` and `crossover` frames: it adds no evidence of its own. A server holding the stored run can rebuild it exactly; the validator checks that it builds on every synthetic run.
