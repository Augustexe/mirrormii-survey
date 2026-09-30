# Stored run (`run.schema.json`)

**Today.** What `Session.serialize(state)` writes (quiz64/src/persona/session.js): localStorage key `genii.persona.v2.run`, and the file behind "Download my data". Example: [examples/run.json](examples/run.json).

| Field | Meaning |
|---|---|
| `schema` | `genii.persona.run/3`. Older saves (/1, /2) fail closed |
| `kit` | `KIT_ID` = `cards.version@cards.built/library.built/friend.version`. A save or link from another kit is refused (`kit_changed`) |
| `runId` | Random, 12 chars `[a-z2-9]`. Seeds the picker and the 8 sealed cards, so the same run id and answers always give the same route |
| `setup` | `closest` (best_friend, partner, crush, sibling, parent, someone_else) and `pronoun` (she, he, they; friend game only). No age |
| `lobby` | `voice` (fun, heart, cards), `depth` (light skips intimate cards, anything), `rooms` left open (love, work, family) |
| `answers` | Card id to response: option index; index list (pick two: 2; receipts: ticked items sorted, or the lone "None of these"; rank: every option, first to last); or an exit (`skip`, `not_my_life`, `no_recent`). `<id>.flip` holds a depends follow-up (no shipped card uses it) |
| `ms` | Answer time per scored card, ms, capped at 600000. Under 1500 ms counts as rushed (weight x 0.3) |
| `frozen`, `lockHash` | Genii's 8 guesses, frozen before the finale, with the profile hash; `lockHash` = sha256 of the canonical JSON. A mismatch refuses to score |
| `finale` | The 8 sealed answers. Never scored into the profile |
| `challenges`, `friendResults` | Friend links made and replies imported ([friend-challenge.md](friend-challenge.md)) |
| `returnTo` | Set when the run started from a friend's link: who to send the owner's own link back to |

**Why a backend should store this object, not a result.** The route, profile, result and friend decks are all derived by replaying the run through the same step machine (`Session.restore` then `Session.resultFor`). Node runs those modules unchanged (the tests do), so the server can re-score every submitted run with the exact app code and never trust a client-computed result. `restore` refuses unknown fields, answers off the route and a broken lock.

**Careful:** `restore` refuses any field outside the list above. Server tokens must live in their own localStorage key (for example `genii.persona.server.v1`), or the run schema must move to `/4` with `restore` updated in the same change.

Privacy: pseudonymous (no name, email or account). `setup.closest` and the answers are personal; treat the whole object as personal data (api.md, privacy).
