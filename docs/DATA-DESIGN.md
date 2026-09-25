> Older prototype and proposed backend contract; not evidence of current production persistence. Current app/evidence boundaries are in [CODE-MAP.md](CODE-MAP.md) and [EVIDENCE-REVIEW.md](EVIDENCE-REVIEW.md).

# Survey data: local MVP and production contract

Updated 2026-09-14. The local MVP stores its state in the participant's browser. It has no live Lark adapter, account service, payment provider or production analytics collector. The founder's intended operational home remains Lark Base; local persistence makes the prototype usable and is not a substitute production database decision.

## What exists locally

| Record | Purpose | Handling |
| --- | --- | --- |
| Versioned session | Chosen depth, chapter/progress and resumable state | Scoped to this application and browser origin |
| Answers | Stable question ID and selected option or explicit missing state | Replacing an answer replaces its evidence; deeper paths reuse existing answers |
| Accusation feedback | Allegation reference and rejected/uncertain/confirmed choice | Preserves the correction instead of silently treating it as agreement |
| Prediction checks | Question reference and correct/incorrect outcome from a prediction made before selection | Kept separate from the observations used to make that prediction |
| Derived result | Family, secondary tendencies, signal summary and evidence/confidence | Recomputed deterministically from the matching schema/scoring versions |
| Public share projection | Allowlisted identity fields only | Generated explicitly from the private result |
| Local referral preview | Preview referral identifier and local interaction state | No verified conversion, partner account or payable balance |

The storage key is `mirrormii.genii.v1`, with `version: 1`. The record includes `contentVersion`, `scoringVersion`, `answers`, `level`, a per-depth `cursorByLevel`, accusation/prediction `feedback`, displayed interruption IDs in `seen`, optional display `name`, the `sound` preference, `completed` levels and an optional `referral` code. Results are derived rather than treated as independent authoritative records. Option IDs are validated against the bank; `__skip` is the explicit missing-evidence marker. Unsupported schema or content versions start a fresh state rather than reinterpreting old selections.

Resume restores the selected depth and exact chapter cursor, even when earlier chapters remain unanswered. Completion counts come from unique observations. A browser-storage failure does not claim that the session was saved. Prediction feedback retains `questionId`, `predictedOptionId`, `actualOptionId`, and derived correctness; invalid or duplicate targets are discarded. Editing an earlier answer invalidates later prediction feedback and current allegations. Production research should additionally preserve the exact evidence snapshot/cutoff for an auditable held-out comparison. Result-copy changes currently follow the content version; future releases need explicit migrations and immutable releases.

The app offers deletion of its own saved local records. Clearing data does not erase a downloaded PNG, a copied link, another browser's state or a copy already shared with someone else. There is no remote deletion in the MVP because it has no remote respondent store. Avoid clearing unrelated localStorage keys.

LocalStorage is device/browser storage, not encrypted account backup or durable server acceptance. Browser clearing, private browsing, device changes and file-origin behavior can affect persistence. Do not put real respondent exports or captured local state in Git, fixtures or run evidence; tests use synthetic selections.

## Evidence provenance

Question definitions preserve stable IDs, options, tier/chapter, mask, origin and evidence weights. Related retests and contextual twins identify which observations can be compared. Keep the shared dilemma distinct from its changed context: a different answer to a best-friend scenario and a boss scenario may be a contextual preference, not a contradiction.

Store or derive the observation count, repeated evidence, context differences, explicit corrections and prediction results supporting a reading. Missing evidence remains missing; it is not a zero-valued trait. Confidence is an internal evidence score for the game until separately calibrated. The MVP's signals and families do not establish clinical validity, stable personality or an ability to impersonate someone.

## Public sharing boundary

Build the PNG and URL from a dedicated allowlist of entertaining identity fields. Never serialize the session object as a shortcut. The current URL projection permits the core family, secondary family, bounded confidence and an optional syntactically validated referral code. It excludes even the local display name. Private answers, raw signal observations, sensitive context, prediction history, accusation responses, contact information, participant IDs and authentication material must be absent.

The share decoder validates known family identifiers and finite confidence in the supported 0–85 range. URL content is untrusted user input, not proof that a result was earned or issued by a server. Render titles and copy from trusted local definitions where possible; do not turn arbitrary URL text into HTML. A copied link is public to anyone who receives it and has no revocation service in this MVP.

A local file or localhost URL is for review. A public distribution URL needs a real deployed origin. Share generation and local referral counters do not establish message delivery, visitors, attribution or commission.

## Production ownership

Company reference data belongs to MirrorMii OS Base and the canonical Wiki. The survey needs an explicit business-data destination and permission model; it must not mix respondent records into company Product Truths or Brand Facts. Current canonical content and schema remain unverified because fresh access checks were blocked by this execution session.

The proposed production boundary is **public browser → server-side intake → accepted submission → Lark survey records → bounded agent workflows**. The browser never receives Lark credentials. A visitor account is not a Lark employee identity. Lark can hold account profiles, but login sessions, recovery and credential handling require a selected authentication design.

Whether intake writes directly to Lark or uses an acknowledged durable queue remains open. A queue requires agreement about temporary storage outside Lark and a defined deletion/synchronization policy. Verify actual tenant, endpoint and field limits before choosing physical rows or making scale promises.

| Logical production entity | Minimum contract |
| --- | --- |
| Participant/account profile | Pseudonymous participant ID; optional selected identity-provider reference and verified contact preferences |
| Consent/purpose record | Applicable purpose/version, choice, time and withdrawal; marketing choice separate from participation |
| Survey release | Immutable question, scoring and result-copy versions |
| Submission | Stable idempotency ID, participant/session reference, version, status and timestamps |
| Answer evidence | Versioned question/option, missing state, context and correction provenance |
| Result | Reproducible private interpretation plus a separate approved public projection |
| Shared result | Opaque public reference, approved fields, selected expiry/revocation policy |
| Referral/conversion | Server-observed event, campaign/partner reference, attribution version, eligibility and reversal |
| Payout ledger | Approved conversion references, currency/amount, status and provider reference; later separately scoped work |
| Agent audit | Purpose, actor, bounded source references, write intent, idempotency and reconciled outcome |

These are logical entities, not instructions to create ten tables. Physical layout follows real query needs, limits and permissions. Account secrets, tokens and raw runtime packets never belong in Base, source or shared manifests.

## Proposed Lark table: Survey Customer Information

Planning only (2026-09-14); nothing was created. Proposed home is MirrorMii OS Base, subject to Jerry confirming the Base. One row per customer or participant, guests included.

- **Identity:** Customer ID (primary, stable across imports and repeat surveys; uniqueness enforced by the import, not the display field), display name, email, phone, country or region, preferred language, status (Guest, Registered, Archived).
- **Consent and attribution:** acquisition source, referral code (not proof of conversion), marketing consent (Unknown by default, Opted in, Opted out, Withdrawn), consent time and evidence reference. Never infer consent.
- **Activity and survey summary:** first seen, last active, latest submission ID, latest survey status, latest result identifier. The depth field from the old 12/30/96 prototype is obsolete.
- **Import provenance:** source system, source record ID, import batch, source updated time, imported time, data-quality flag (Ready, Missing identity, Possible duplicate, Needs review).
- **Views:** all customers, survey progress, marketing opt-ins (explicit opt-in with usable contact only), import review.
- **Import rules:** map headers before importing; match on Customer ID, else source system plus source record ID; never auto-merge by name or email; update only supplied fields; serialize writes and reconcile unknown outcomes before retrying; sample first, then reconcile counts. Answers and attempt history belong in a separate Survey Submissions structure linked by Customer ID.
- **Missing inputs:** target Base if not MirrorMii OS, and the source database headers with a stable identity key.

## Intake and agent behavior to implement later

Use explicit states: `draft → submitted → durably accepted → synced to Lark`. In a direct-write design, accepted may coincide with confirmed Lark persistence. In a queue design, accepted means retained durably by the server and must not imply already synced.

Stable submission identifiers govern retries. An unknown upstream write outcome enters reconciliation before another create. Test duplicate submissions, interrupted requests, partial batches, throttling, restart/replay and outage recovery with synthetic data. Test participant isolation, share revocation if selected, deletion propagation and affiliate reversals before public use.

Agent roles should be bounded context reader, aggregate/pseudonymous survey analyst, minimal-access support operator and scoped write worker. An approved automated policy can authorize normal intake without a human prompt for every answer. It must not implicitly authorize publishing, messaging, changing released scoring, expanding access or paying affiliates.

Production release decisions still needed: first audience/markets/ages, survey Base/tables, auth provider, allowed temporary persistence, retention/deletion, volume/latency targets, operational owner, affiliate rules and paid offer. None of these prevents local MVP review; none is implied by a working local result screen.
