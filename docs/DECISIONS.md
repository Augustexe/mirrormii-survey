# Live deployment of the final dossier: 2026-09-23

Jerry identified `codex/final-survey-dossier` as the intended public survey after an earlier deployment published the wrong version (publication `main` at `112bf44`). That branch is now live on GitHub Pages from `Augustexe/Mirrormii-survey-main-publication-`; the Pages environment allows exactly `main` and this branch. This supersedes the 2026-09-21 "no publication" boundary for this branch only. Merging into `main`, backend work and business writes remain unauthorized. Current details: [STATE.md](STATE.md).

# Founder pivot to a first-session personality game: 2026-09-19

Jerry confirmed that Genii's first survey is a high-engagement personality game, not a wellness questionnaire, health assessment, habit tracker or self-improvement intake. It should feel surprising, funny, socially risky, specific and worth sharing; the respondent receives an unusually observant provisional portrait. Wellness may emerge later from a relationship with Genii but is not the front-door promise. First-session sleep, food, exercise, hydration, body metrics, medical framing, depression inference and wellness-routine collection are removed.

This supersedes D-015 (personality plus health blend), D-023, D-024, D-028 and the health parts of D-029 and D-033 for the first session; they stay below as history. The evidence target is reactions under challenge, embarrassment, exclusion, pressure and power; emotion triggers and expression; reported actions; recurring decision and interpersonal patterns; values, fears and dark-side tendencies; and support or reminder preferences. A frozen profile reaching roughly 75 percent on defined held-out scenarios is a research hypothesis, never a user-facing claim. Humor and voice are renderers applied after construct validity and cannot change an option's meaning. The Person Profile Council is development and evaluation tooling, not an app feature.

# Overnight final-survey build authorization: 2026-09-21

Jerry explicitly authorized autonomous local finalization with Luna subagents, full evidence-framework and question-bank integration, multiple routes and voices, question-count adjustment, and a full final-screen redesign. Personality/game recognition leads; survey health features remain excluded. The audit-like visual reference is playful packaging, not permission for fabricated probabilities, diagnoses, fidelity judgments or health inference.

Implementation uses contextual editions rather than asserting validated ICP segments. Exact answers and bounded claims feed the dossier; nickname rules are separate game metadata. Final checks never rescore the frozen profile. Feedback is append-only; explicit edits create child attempts. No external publication or business writes were requested.

Earlier decisions follow for provenance. Current implementation status is in [STATE.md](STATE.md).

> Reconciled 2026-09-18 from the approved release documentation (R6 handoff, commit `b8cf8ec`, merged as PR #1). Implementation/team instructions below describe that historical task. Read [STATE.md](STATE.md) and [OPEN-QUESTIONS.md](OPEN-QUESTIONS.md) for current state.

# Decisions and remaining choices

## Current implementation authorization - 2026-09-17

Jerry explicitly requested implementation on the last build using the installed Taste skill, root management and Luna workers. This supersedes the earlier spec/interview pause. Work is isolated on `codex/genii-taste-survey`, based on `fd7c880` (the latest specification atop the verified `ec89aa7` app). Source, design and evidence contracts are under `quiz64/docs/`.

Concrete local choices: 64 route slots (56 context/profile plus eight checks), relevant replacements from a larger bank, optional unscored Other text, separate measure windows, literal emotion layers, frozen claim-level feedback, and a versioned local storage key. The user delegated implementation details; these choices are reviewable defaults, not claims of psychometric validation. No extra 20 checks, clinical health scores, public deployment or backend writes are included.

The installed Taste skill informs the brand composition and quality review. Its generic palette/bar restrictions yield to the user's explicit lilac brand and descriptive bar requirements. The generated glass environment is a non-canon project asset; canonical Genii art remains byte-for-byte unchanged.

Updated 2026-09-17 · Owner: Jerry · Authority: latest conversation and [active personality/health contract](PERSONALITY-HEALTH-SPEC.md). Earlier decisions below remain historical where explicitly superseded.

## Active revision: 2026-09-17

| ID | Decision and effect on earlier direction |
| --- | --- |
| D-015 | Root survey blends personality, health habits and emotional context. Supersedes D-003's exclusion of health from the main purpose; it does not authorize diagnostic claims. |
| D-016 | Preserve the broadly good current bank and repair coverage, repetition and question–answer agreement. Baseline is quiz64 at ec89aa7, 56 context/training plus eight heldout items; legacy M-001/M-002/M-004/M-010 do not describe it. |
| D-017 | Result is an integrated portrait with routine/behavior bars and separate confidence. Supersedes the card/reveal-led priority; final family/stencil/one-liner assignment under D-012 is deferred. |
| D-018 | Capture internal feelings, outward response and recovery separately. Quietness is not proof of low emotional intensity. |
| D-019 | True/False preserves the original result and records feedback only. Supersedes any D-010/D-011 or founder-brief rule that changes evidence, confidence or the portrait from endorsement. Explicit survey-answer edits remain separate. |
| D-020 | Include Other, fully bypass known-inapplicable prompts, distinguish custom/no-experience/skip/omission, and retain versioned provenance. Exact Other scope and unknown-context behavior remain open. |
| D-021 | Jerry delegated Q4. Selected benchmarks: frozen unseen-choice predictions versus a no-profile baseline, and reported usual-versus-pressure behavior. Keep evaluation, contextual contrast and endorsement separate. No peer ranking or health-quality score selected. |
| D-022 | Q5 confirmed: usual patterns and recent state are shown separately. D-029 subsequently settles default recall windows. |
| D-023 | After an expanded explanation, Q6 confirmed all three sleep layers: direct usual routine, directly reported recent changes, and contextual sleep behavior/prediction. No exact timing/duration inferred from unrelated personality choices. |
| D-024 | Q7 requests health coverage broader than sleep, eating, movement and rest/energy. D-028/D-029 subsequently settle scope and default windows. |
| D-025 | Q8 confirms all seven feeling families: frustration/anger, worry, disappointment/sadness, embarrassment, guilt, joy/excitement and relief. |
| D-026 | Q9 places feedback-only True/False beside each individual interpretation. |
| D-027 | Q10 selects relevant replacements to maintain roughly 60 questions per route. Supersedes the recommendation to default to a shorter route; requires a larger bank of applicable alternatives. |
| D-028 | “Yes to all” confirms Q11's recommended scope: habits plus body/skin experience, with optional relevant health context. It does not select the entire company health schema. |
| D-029 | Q12 confirmed: past month for usual patterns, last seven days for recent state; latest actual example within a month, with no-example available; domain-specific periods for cycles and similar exceptions. Settles D-022/D-024's window question. |
| D-030 | Q13 confirmed: preserve written Other text unscored in this MVP. No automatic interpretation or forced authored category. |
| D-031 | First-session priority is a skillful, engaging host: recognition, trust and a credible desire to continue. Final label accuracy is secondary; reflection, prediction and demonstrated benefit remain distinct. |
| D-032 | Q14 correction: North America, all genders, English first. Earlier age/gender/life-event references were examples, not a fixed audience or demographic finding. Exact age eligibility is unselected. |
| D-033 | Everyday health examples include hydration, toilet routines and stress-related eating; these are illustrative, not a mandatory checklist. Ask once and carry answers forward. Job/relationship events are relevance branches, not demographic assumptions. |
| D-034 | First portrait is provisional and can develop through future interaction. This does not change D-019: True/False alone still preserves the original result. Longitudinal implementation is outside this spec checkpoint. |
| D-035 | Q15 accepts the recommended return value: understand yourself better and gradually find small habits that work for you. This is intended value, not measured benefit or an already implemented service. |

The active [Product Spec v0.6](PRODUCT-SPEC.md), [core specification](PERSONALITY-HEALTH-SPEC.md) and [host experience](HOST-EXPERIENCE.md) govern this revision. Approximately 60 questions remains the working scale; do not reinstate old 12/30/96 tiers. Backend remains Desmond's scope. Q11–Q15 are settled; retain unresolved axis/scale/routing contracts separately. User-facing discussion continues in English. The historical 20-item benchmark and latest “20 accuracy” reference do not settle the respondent-visible count/placement.

Fresh native Lark reads succeeded on 2026-09-17. Relevant schema/vision/emotion sources include drafts, and the aggregate packet remains incomplete; the grounding summary is in [PRODUCT-SPEC.md](PRODUCT-SPEC.md). Historical access failures below do not describe current native access.

## Historical product direction: 2026-09-14

| ID | Decision and current scope |
| --- | --- |
| D-001 | Dedicated MirrorMii survey marketing project; local MVP implementation is now authorized, superseding planning-only status |
| D-002 | Genie guides a funny, cheeky conversation and character reveal |
| D-003 | The full brief supersedes the initial wellbeing framing: playful behavioral inference, not a wellness assessment or diagnosis |
| D-004 | Broad reach, sharing, comparison, disagreement and an eventual affiliate system are intended |
| D-005 | Lark Base is the intended operational home for survey, user and account business records; production architecture is still open |
| D-006 | Current company truth comes from canonical Lark; canon imagery comes from Eagle metadata and founder direction |
| D-007 | Develop source for team collaboration through GitHub |
| D-008 | Use the existing `Augustexe/mirrormii-survey` repository; inspect and reconcile its source/instructions before integration |
| D-009 | Three nested depths: quick 10–12, medium 25–35, deep roughly 80–120 prompts; deep mode uses short resumable chapters |
| D-010 | Important latent signals recur through different masks; context, contradictions and explicit corrections matter |
| D-011 | Confidence represents evidence progression; accusations and honest prediction checks are core interaction mechanics |
| D-012 | Character summoning uses roughly 6–8 core families plus secondary tendencies; entertaining public identity and private explanation are separate layers |
| D-013 | Keep the tone loving and specific; avoid clinical/deterministic claims, humiliation and moralized answers |
| D-014 | Build the local working loop now; remote publication, Lark business writes, authentication changes and payments are outside this work |

At that stage, the full brief selected a character identity supported by a behavioral reading. D-017 now changes this iteration's primary result and defers final character assignment. Attention/sharing and future personalization remain context; paid offer and business conversion are still undecided.

## Historical MVP implementation choices: 2026-09-14

These choices make the prototype concrete. They do not claim psychological validation or final founder approval of every question, weight, family name or production architecture.

| ID | Choice | Rationale / remaining validation |
| --- | --- | --- |
| M-001 | 12 / 30 / 96 nested questions | Within the brief's ranges; measure actual completion times and fatigue |
| M-002 | Nine draft behavioral signals; eight provisional families | Enough evidence variety and recognizable identities for a testable first bank |
| M-003 | Deterministic ES-module scoring and authored dialogue | Reproducible readings, corrections and prediction checks without external model credentials |
| M-004 | Dependency-free browser app, Node 24 development server, standalone HTML build | Reviewable locally, including when this execution session cannot bind a port |
| M-005 | Guest start and versioned localStorage with resume/deletion | Complete the MVP loop without pretending production accounts or Lark storage exist |
| M-006 | Existing unchanged Genii V2 expressions retained as fallback and provenance | PNG-only presentation is superseded by M-009 for this local prototype; canon still has one guide identity |
| M-007 | Public identity allowlist for PNG/result URL; local referral/affiliate preview | Exercise sharing while keeping private evidence out of public exports and avoiding fake commission |
| M-008 | Two original generated draft references remain historical prototype evidence | New render has two interactive reference sheets under M-009; neither generation nor code variant replaces a canon master |
| M-009 | Mobile-first living-pearl Genii and glass-panel redesign | User-authorized 2026-09-14: local procedural WebGL character variant, cursor gaze, tap reactions, canon image fallback, owned scene/charm imagery, readable swipe cards and phone navigation; no Eagle master mutation |
| M-010 | Keep the lightweight ES-module stack with scoped offline bundling | Existing survey logic stays unchanged; native WebGL and CSS implement the requested motion without a framework/runtime dependency |

## Remaining product and production decisions

| ID | Open decision | When needed |
| --- | --- | --- |
| Q-004 | First distribution cohort, age eligibility and finer regional localization; North America/all genders/English settled under D-032 | Before a public pilot |
| Q-007 | Final family/visual mapping, copy intensity, voice/audio and expanded motion | After reviewing the working reveal and existing character fit |
| Q-008 | Question/weight tuning, evidence thresholds, confidence calibration and held-out validation | Before claims of accuracy or improvement; refine through prototype tests |
| Q-009 | Account value, timing, minimum information and recovery | Before cross-device saving or account launch |
| Q-010 | Paid offer, price experiment and connection to verified MirrorMii products | Before monetization claims or checkout |
| Q-011 | Eligible affiliate event, attribution window, qualification, reversals, commission and payout | Before a real affiliate program |
| Q-012 | Whether all-in-Lark allows a durable temporary queue and external identity provider | Before production backend selection |
| Q-013 | Survey Base/tables, agent read/write roles and automated intake authority | Before any business-data provisioning or write |
| Q-014 | Traffic/throughput targets, retention, deletion and support ownership | Before production data collection |
| Q-015 | Pilot sample, thresholds, observation windows, launch timing, budget and collaborators | Before interpreting campaign metrics or launching |

At the 2026-09-14 stage, Q-001/Q-003/Q-005/Q-006 were retired. The current revision reopens result structure under D-017 and includes health habits under D-015; it does not reinstate clinical assessment. Legacy nested-depth counts are not the current root requirement. Q-002's commercial event remains under Q-010/Q-011. Current specification choices are tracked in the core document.

## Historical verification snapshot: 2026-09-14

Current Eagle metadata identifies authorized V2 master expressions of one Genii. Current Lark company content remains pending. Fresh checks on 2026-09-14 still encounter this session's network-disabled sandbox, loopback EPERM and Lark Keychain initialization failure. This does not establish broken native logins.

Remote contents, team conventions and default branch remain unverified; no push or integration has occurred. Local feature verification belongs to the current MVP run's evidence, separate from these product decisions. Record future changes with date, scope and the decision they supersede.

## Voice and visibility correction · 2026-09-17

Confirmed by Jerry: prioritize funny, quirky, recognizable English questions and conversational retention while preserving the evidence model. White is the primary theme; purple is a supporting color. Work directly on this pass and keep verification focused. Reuse the existing reference imagery where it supports the design.

Implemented for review in `codex/genii-voice-polish`: all 76 candidate prompts revised; a dedicated English copy layer; selective host replies; clearer answer states; semantic result icons and working routine navigation; separate aligned usual/recent tracks. No scoring, route, or backend changes. Existing tests were reused, with a bounded visual review.


## Living-world visual refinement · 2026-09-17

Jerry approved the preceding layout, text and functionality and authorized a more elaborate visual layer, including new render/media variants of Genii. The Eagle V2 character remains the design reference, not a restriction to the original low-resolution render. Canon master files remain unchanged; generated derivatives stay project-local and are not promoted to canon. White remains primary, purple secondary.

Implemented on `codex/genii-living-world`: two opal-glass character expressions, a generated glass environment, scene-aware animated caustics, ornamental thinking waveforms, tactile button/selection feedback and pearl material icons. Motion is decorative, not a measurement of attention, voice or inference. Existing questionnaire, answers, evidence handling, routing, layout and synthetic developer preview remain authoritative and unchanged. See `quiz64/docs/LIVING-WORLD.md`.

## Questionnaire detail refinement · 2026-09-17

Jerry approved the living-world direction and requested richer question/text surfaces, glow, precise typography, animated bars and small Genii reactions. Implemented for review on `codex/genii-luminous-details`: inset pearl question headers, engraved answer keycaps, illuminated selection and text fields, a brief lightbulb acknowledgment, a brighter reactive ambient scene, dialog entrances, and viewport-triggered routine rail reveals. The existing layout and questionnaire remain authoritative. Animations do not change marker values or interpret response timing. Applied the named Claude artifact-builder and Taste skills within the existing React stack; offline survey and synthetic-result artifacts accompany the normal local build. See `quiz64/docs/LUMINOUS-DETAILS.md`.

## Colored card surfaces · 2026-09-17

Jerry clarified that white/purple governs the main theme, while individual survey/result cards may use complementary colors. Replace flat near-white surfaces with visibly tinted glass, stronger edge separation and colored shadows. Domain colors identify sections (such as periwinkle sleep, apricot eating and mint movement), never health grades or response quality. Preserve layout, questions and all behavior. This supersedes any interpretation that every card must be white/lavender. Uiverse is a design reference, not a requirement to copy a component or introduce a new framework. Implemented for review on `codex/genii-prismatic-cards`; see `quiz64/docs/CARD-MATERIALS.md`.


## 2026-09-21: preserve the official survey world; expand only the final packet

Jerry explicitly rejected replacing the approved pre-result graphics. The visual baseline is the App.jsx/components/styles/assets at `2e65313`, an ancestor commit of the active branch. Reuse those exact components for the welcome, chapter transitions, question cards, Genii reactions, backgrounds and header. New bank content and evidence logic remain authorized. The final evidence packet alone may materially expand its visual design: a personality game with dimensional Genii graphics, 3D objects and motion, interactive discoveries, and longer distinctive answer-grounded writing. Do not treat broader visual redesign as authorized by the bank/framework work.

Source is the active worktree named in [CODE-MAP.md](CODE-MAP.md).

## 2026-09-21: preserve approved game layout; refine content and interactions
Jerry approved the dimensional evidence-screen layout and explicitly requested richer answer-dependent language, curiosity, sharing and game details. Keep pre-result visuals and existing result layout. App destination is a placeholder by explicit reply. Outcomes are deterministic display labels supported by profile evidence, with heldouts separate.

## 2026-09-21: final demo refinement and commit authorization
Jerry requested an end-to-end final survey demo and explicitly said "commit after". Preserve approved visuals. Consolidate duplicate guess displays into one result reveal; keep scoring inspectable. Viewing completed answers must not create revisions; only actual edits do. Old wording-bound saves fail closed with export recovery. Current verification: 94 tests and build pass, real UI complete/save/review flows and mobile result checked. No push or publication is authorized.

2026-09-21: Jerry rejected polite generic names and requested distinct section voice/format while preserving approved visuals. Fifty unique v2 nicknames and five editorial formats now replace the previous naming copy. Gentle remains warm; sarcasm follows selected tone. User authorized commit to GitHub; target origin/codex/final-survey-dossier, not publication/main.

2026-09-21 repository correction: Jerry explicitly identified `Augustexe/Mirrormii-survey-main-publication-` as the correct GitHub repository. Prior guidance selecting `Augustexe/mirrormii-survey` is superseded. Handoff branch: `codex/final-survey-dossier` on the correct repository (local remote alias `publication`). No main merge or Pages deployment is implied.
