> **Superseded: history only.** The launch survey's one spec is [LAUNCH-SPEC.md](LAUNCH-SPEC.md) (locked 2026-09-29); nothing here governs the build.

# Genii survey: product handoff

Status: implemented, verified and live on GitHub Pages since 2026-09-23; ready for product review. Approved survey graphics and the dimensional result layout are retained. This pass tightens copy and the presentation inside each evidence facet.

## The five survey sections

| Section | Job | Voice direction |
|---|---|---|
| Everyday | Small choices, attendance, changes of plan | Observational comedy; recognizable ordinary scenes |
| Work & study | First moves, feedback, credit, practical limits | Dry workplace satire without judging competence |
| Social | Message channel, group moments, public/private responses | Group-chat specificity without assuming motives |
| Close connections | Directly stated wants and concrete relational actions | Warm intimacy; sharper delivery only when selected |
| Secret menu | Clearly framed imagination and private-thought scenes | Mischief and admissions, visibly hypothetical where applicable |

The separate eight final checks test sealed guesses. They do not feed back into the personality profile.

## Five evidence facets

| Facet | Distinct display | What it reads |
|---|---|---|
| First move | Action-replay timeline | How a situation was started |
| Social signal | Message-style commentary | How the response reached other people |
| Friction | A tiny hearing with an exhibit | What happened after an awkward mismatch |
| Structure | Numbered plan versus plot twist | Planning, sequencing and adaptation |
| Novelty | Curiosity menu | Familiar choices versus trying an unfamiliar option |

Each has four labeled beats, literal source disclosures and context limits. Thin signals open as early clues; mixed signals keep their split. Imagined choices remain explicitly imagined in the evidence stories. The authoritative projection wins over a duplicate fallback axis representation.

## Names and voices

`quiz64/src/game-outcome.js` is the display-name authority, version `genii-character-pairs-v2`: 50 unique evidence-gated nicknames plus the unresolved fallback. Examples: Chief Lurking Officer; The Group Chat’s Unpaid Manager; Head of Unscheduled Nonsense; Chaos, With a Booking Reference. Tone changes delivery, not the evidence or nickname rule. These are playful roles, never diagnoses or validated personality types.

`question-voices-v2.js` owns question delivery; `dossier-story.js` owns result editorial variants. Preserve IDs, literal option meanings, temporal windows and source status when editing. Wording-bound old saved drafts intentionally fail integrity checks; export recovery is available. Do not weaken validation to load incompatible drafts.

## Run and verify

From `quiz64`, use `npm ci`, `npm test`, `npm run build`, then `npm run dev` for local development. `/` is the full survey; `/preview.html` provides synthetic fixtures, editions and voices. Current local preview uses port 4199.

95 automated tests pass, covering routes/voices, frozen evidence, heldouts, save/restore, unique names, facet label completeness and thin-signal wording. Production build passes with the known large-chunk warning. All five formats were inspected in the browser; long-title mobile layout fits 390px without horizontal overflow; gentle thin-signal wording verified; no console errors observed. The 36 original visual files remain unchanged.

## Product still owns

- Replace the explicitly approved app-handoff placeholder with the verified destination.
- Review comprehension, humor, shareability and real-user outcome quality; tests do not establish virality or predictive validity.
- Decide production persistence, analytics, performance budget and publication. Current storage/export is local; the share card excludes private answers.

This branch has been live on GitHub Pages since 2026-09-23 ([STATE.md](STATE.md)); no merge into `main` has happened. The authoritative repository is Augustexe/Mirrormii-survey-main-publication-. The earlier push to Augustexe/mirrormii-survey was a routing mistake; do not use that outdated repository.
