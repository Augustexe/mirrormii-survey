# Analytics events (proposed)

Status: **proposed; nothing is wired.** The app has no analytics today (LAUNCH-SPEC section 2). These are the events we recommend so the launch can answer: do people finish, where do they drop, which screens get shared, does the friend loop spread, does anyone tap through to the app. Transport: `POST /v1/events` ([api.md](api.md)) or any self-hosted collector.

## Rules (no personal data)

- **Never send the URL fragment or the full URL.** `#play=` and `#reply=` carry the friend answer key and guesses. Send `entry` (below) instead.
- **Never send answers.** No option index, no answer text, no tag or archetype the player got, no sting. Content stats come from stored runs, not analytics.
- **No identifiers that join to a person.** `sid` is a random id made per run for analytics only; it is never the `runId`, a run token or a challenge token. No name, pronoun, closest person, email, IP (the collector drops it after rate limiting) or raw user agent.
- Times are bucketed, not exact: `ms_bucket` is `rushed` (under 1.5 s), `quick` (1.5 to 5 s), `steady` (5 to 15 s), `slow` (over 15 s).
- Honor Do Not Track and an off switch in "Your data".

## Common properties (every event)

| Property | Values |
|---|---|
| `event` | name below |
| `ts` | ISO time, rounded to the second |
| `sid` | random, per run, analytics only |
| `kit` | `KIT_ID` |
| `build` | app build id (git short sha) |
| `voice` | fun, heart, cards (after the lobby) |
| `device` | phone, tablet, desktop (from viewport width) |
| `entry` | direct, friend_link, reply_link, share, other |

## Events

| Event | When | Properties |
|---|---|---|
| `start` | landing CTA tapped | none |
| `setup_done` | both setup taps done | none (closest person and pronoun are not sent) |
| `lobby_done` | lobby confirmed | `voice`, `depth` (light, anything), `rooms` (subset of love, work, family) |
| `card_answered` | a card is answered | `card` (card id), `format`, `chapter` (1 to 7, extra, finale), `position` (1 to 48), `ms_bucket`, `picks` (count only) |
| `card_skipped` | an exit is tapped | `card`, `format`, `chapter`, `position`, `exit` (skip, not_my_life, no_recent) |
| `chapter_done` | the last card of a chapter | `chapter`, `cards`, `skipped`, `rushed` |
| `lock` | Genii locks its guesses | `answered`, `skipped`, `rushed`, `passes` (guesses Genii passed on) |
| `finale_done` | the 8th sealed card | `exact_bucket` (0-2, 3-5, 6-8) |
| `reveal_screen_viewed` | a Stories screen shows | `screen` (intro, names, read, map, knows, rooms, insight, traits, stings, calls, share, app), `index`, `dwell_bucket` (under 2 s, 2 to 6 s, over 6 s, sent on leave) |
| `article_opened` | the Evidence Article opens | `via` (auto, button) |
| `article_section_viewed` | a section is 50% in view for 1 s | `section` (stats, traits, surprise, rooms, book, record, party), `via` (scroll, tab), `dwell_bucket` |
| `share` | any share or save | `action` (share_sheet, save_image, copy_link, copy_text), `format` (story, post, none), `screen` |
| `challenge_sent` | a friend link is copied or shared | `rel` (partner, crush, friendOrCoworker, bestie), `love`, `mk`, `stings`, `showType` (booleans), `invite` (index), `has_name` (boolean, never the name) |
| `challenge_opened` | a friend opens a link | `rel`, `ok` (boolean), `error` (kit_changed, malformed, checksum, too_long, version) |
| `friend_level_done` | friend finishes a level | `rel`, `level` (1 to 4) |
| `friend_done` | friend sees their result | `rel`, `x` (0 to 6), `level2_bucket`, `level3_bucket` |
| `your_turn` | friend taps "Your turn" | `rel` |
| `reply_imported` | owner opens a reply | `rel`, `ok`, `error` |
| `app_cta_tapped` | Get MirrorMii | `from` (app_screen, article, share, friend_result) |
| `data_downloaded`, `data_deleted` | "Your data" actions | none |
| `error` | a save or link fails | `code` (corrupt, schema, kit_changed, tampered, unavailable) |

## Funnel

`start` > `setup_done` > `lobby_done` > `chapter_done` (x chapters) > `lock` > `finale_done` > `reveal_screen_viewed(app)` > `share` or `challenge_sent` > `challenge_opened` (friend) > `friend_done` > `your_turn` > `start` (the loop), and `app_cta_tapped` at any point after the reveal.
