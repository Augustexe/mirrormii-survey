# Proposed API (for Desmond)

Status: **proposed, nothing built.** Desmond owns the final design; this is a starting point that fits the code as it is. Rulings it respects: no accounts, no health data, storage SQLite when a backend exists (LAUNCH-SPEC section 9), friend answers private to the owner, stings owner only, backend before real players for the friend game (section 19 item 8).

## Shape

- **Stateless static app + one small service.** The web game stays a static build. The service is Node (it imports the same `score-core.mjs`, `session.js` and `friend.js` the app uses, as the tests do), with SQLite.
- **The server re-scores; it never trusts a client result.** A client submits its stored run ([run.schema.json](run.schema.json)); the server replays it with `Session.restore` and computes the result with `Session.resultFor` and `buildResultRecord` ([records.mjs](records.mjs)). A tampered run fails the lock check.
- **Auth-free, capability tokens.** No accounts or passwords. The server signs short tokens (HMAC-SHA256, key in the environment, rotated by `kid`): `base64url(payload).base64url(mac)`, payload `{ typ, id, kit, iat, exp, kid }`. Whoever holds a token can do what it names, nothing more.
  - `run` token: the owner's capability for one run (submit it, make links, read replies, delete). Stored in its own localStorage key (for example `genii.persona.server.v1`): the run save refuses unknown fields ([run.md](run.md)).
  - `chal` token: a friend link. Opaque, unguessable, carries no answer key.
- **Kit pinning.** Every body carries `kit` (`KIT_ID`). The server loads kits by id and keeps the previous kit loadable while its open links live (30 days proposed); otherwise it answers `409 kit_changed`, as the app does.
- **JSON only**, `Content-Type: application/json`, UTF-8, errors as `{ "error": code, "message": text }` with the app's codes (`corrupt`, `schema`, `kit_changed`, `tampered`, `not_complete`, `invalid`, `unknown_challenge`, `rate_limited`).

## Endpoints

| Method and path | Auth | Body | Response | Notes |
|---|---|---|---|---|
| `POST /v1/runs` | none | `{ kit }` | `{ runId, runToken }` | Create run. Optional: the app can keep making its own `runId` offline and skip this; if used, the app seeds the picker with the server's `runId` |
| `PUT /v1/runs/{runId}` | `run` token, or none on first submit | stored run | `{ runId, runToken, result }` (`result` = [result.schema.json](result.schema.json)) | Submit result. Server validates the schema, replays, checks the lock, stores run and result. Idempotent on `runId` + `lockHash`. First submit without a token mints one |
| `GET /v1/runs/{runId}/result` | `run` token | | result record | Owner re-opens the result on another device |
| `DELETE /v1/runs/{runId}` | `run` token | | `204` | Delete my data: run, result, challenges, replies, share page |
| `POST /v1/challenges` | `run` token | `{ runId, rel, love, mk, stings, showType, emoji, invite, name }` | `{ challengeId, token, url }` | Create challenge. Server builds the deck from the stored run (`challengeDeck`), stores a `challengeRecord` with the answer key, returns a short link `https://{host}/c/{token}`. 20 per run (the app's cap) |
| `GET /v1/challenges/{token}` | `chal` token | | `publicChallenge` | Fetch challenge: the deck with no truth ([friend-challenge.schema.json](friend-challenge.schema.json)) |
| `POST /v1/challenges/{token}/answers` | `chal` token | `friendSubmission` | `friendSafeResult` | Submit friend answers. Scored server-side (`scoreFriendGame`). One accepted submission per link (decision below) |
| `GET /v1/runs/{runId}/challenges` | `run` token | | `[{ challengeId, rel, emoji, played, playedAt }]` | The owner's links; replies sync across devices |
| `GET /v1/challenges/{challengeId}/comparison` | `run` token | | `ownerComparison` | Compare: "You, through {friend}'s eyes" (`ownerFriendView`), owner only |
| `GET /v1/runs/{runId}/ranking` | `run` token | | ranking | Who knows you best (`ranking`), owner only |
| `GET /v1/share/{shareId}` | none | | `{ names, keywords, tags, invite }` | Optional public share page and image: the record's `share` block only, never stings |
| `POST /v1/events` | none | `{ events: [...] }` | `202` | Analytics batch ([events.md](events.md)) |

## Rate limits and size caps (starting values)

| What | Limit |
|---|---|
| Any endpoint | 120 requests per minute per IP (hashed, window only) |
| `POST /v1/runs`, `PUT /v1/runs/{id}` | 10 per minute per IP; run body 64 KB max |
| `POST /v1/challenges` | 10 per minute per run token; 20 live links per run |
| `GET /v1/challenges/{token}` | 60 per minute per IP |
| `POST .../answers` | 5 per minute per IP; 1 accepted per link |
| `POST /v1/events` | 60 batches per minute per IP; 50 events and 32 KB per batch |

Return `429 rate_limited` with `Retry-After`.

## Privacy and security notes

- Store no name, email, phone, IP or raw user agent. The only free text is the optional owner display name on a link (24 letters, `cleanName`); it is shown to the friend and nowhere else.
- Answers are personal data even without a name: encrypt the database at rest, keep runs 12 months unless Jerry sets another window, delete on request, and expire links (30 days proposed).
- Stings, Level 4 answers and friend replies are owner only; `publicChallenge` and `friendSafeResult` never contain them.
- Tokens only in the `Authorization: Bearer` header or the path, never in query strings; do not log paths with tokens in full.
- No age question and no age inference (teens are an open decision); no health data; no identity inference (LAUNCH-SPEC section 2).
- CORS: allow only the static host's origin. HTTPS only.

## Migration from today's links

1. Ship the service with `PUT /v1/runs` and the challenge endpoints behind a flag; keep `#play=` and `#reply=` readable so links already sent still work.
2. New links use `/c/{token}`; the app stops putting the answer key in any link.
3. After the longest link TTL, drop the old link format.
