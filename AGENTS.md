## Shared current context - required startup

We are finishing one build, the launch survey (persona quiz V2). Before any survey work read `docs/LAUNCH-SPEC.md`: it is the only spec (rules, rulings, numbers, status, plan, open decisions). Update it in place; never start a parallel build or a second spec. Before code or tests read **`quiz64/README.md`**, the one developer entry for the web game (run, test, build, QA, folder map, content flow, the friend game and backend boundary, known gaps); `docs/CODE-MAP.md` is the short source map. Backend, friend game server, contracts, question pack or deployment work starts at **`docs/HANDOFF-DESMOND.md`** (the developer handoff: data flow, what is built, build order, placeholders, open decisions) and `docs/contracts/` (JSON Schemas checked by `node scripts/validate-contracts.mjs`, part of `npm test --prefix quiz64`). Historical worktree docs do not override this maintained context.

Older builds are history only (`docs/history/BUILD-ITERATIONS.md`); their code (App.jsx, DossierApp.jsx, data.js, respondent-copy.js) is gone from `quiz64/src`, and their docs in `quiz64/docs` are marked superseded.

Keep ongoing evidence, questions, ICP and psychology work in the listed masters. Runs retain frozen experiments and receipts. At task completion, update the maintained current-state/decision pages and catalog the run; do not leave the only current context in a run output. Never promote an experiment to an approved requirement merely because it is recent or finalized.

# Genie survey project instructions

This is the canonical source for project `mirrormii-genie-survey`. The user authorized local MVP implementation from docs/FOUNDER-BRIEF.md on 2026-09-14. Build and validate locally for review; do not push, deploy, or publish until the user reviews it.

## Begin here

- Inside Jerry's central workspace, the root contract and this project entry are already loaded before this file; do not re-route to them from here. Outside that workspace, follow this repository's own instructions without requiring Jerry's local paths.
- Read `docs/DECISIONS.md`, then the sections of `docs/PRODUCT-SPEC.md` relevant to the task.
- Keep execution pinned to this project. General MirrorMii keywords add company context; they do not move source edits to another project.
- In the central workspace, allocate a unique run with `python3 /Users/jerryzhang/Workspace-Draft/system/bin/workspace.py new-run mirrormii-genie-survey codex "Task" --packet PACKET-ID`. Use its scratch/output/logs and finalize output for a receipt. Source edits are permitted when the task intends them; `--cwd project` is only for those edits.
- Execute CLIs through `/Users/jerryzhang/Workspace-Draft/system/bin/dev COMMAND` from the allocated cwd to select the managed toolchain. `dev --project mirrormii-genie-survey COMMAND` changes cwd to source and is for intended source work. Read `docs/CLI-ACCESS.md` before diagnosing setup/auth failures: distinguish PATH, native login presence, verified remote access, and sandbox restrictions.

## Authority

- Founder decisions in this project govern the proposed survey, not all existing MirrorMii products.
- MirrorMii OS Base and MirrorMii Marketing OS Wiki own current company truth. Read a fresh bounded packet through existing authorized services/native Lark authentication before making company claims. Source coordinates are in `docs/source-map.json`.
- If unavailable, mark company grounding pending. Never substitute local legacy Work OS, archives, imported histories, or stale snapshots.
- Canon media is `/Users/jerryzhang/Workspace-Draft/assets/Genomii AI.library`. Select by Eagle item ID, metadata, folder membership, descriptions, and rights. Do not infer master identity from filename or fabricate a replacement Genie. The founder will provide visual direction.
- Git owns the proposed spec, schemas, code, and technical decisions. Lark will be the operational home for survey business records as requested; exact storage/authentication architecture is open.
- Never commit raw Lark packets, respondent data, authentication secrets, runtime histories, or private exports. Keep source references and verification status instead.

## Planning discipline

Use explicit labels: confirmed, proposed, open, verified, blocked. Proposed question counts, result categories, launch cohorts, payment models, thresholds, and architecture are not approved requirements. Preserve accepted decisions and remove superseded open questions from the current view.

Use Kun's research → visual planning → iteration workflow when requested. Keep drafts reviewable. Validate consequential changes with an independent reviewer. Do not install a new orchestration platform merely to plan this product.

Current authorization covers local product implementation and validation, planning and environment setup, read-only company grounding, and connection to the founder-selected existing GitHub repository `https://github.com/Augustexe/mirrormii-survey.git`. Local `origin` is configured; remote contents and instructions have not been read. Inspect and reconcile existing team source before any integration or push; never force-push the independent local planning history. No Lark business mutation, permission expansion, payout, external message, or public launch is implied by this brief. Once the founder authorizes a concrete action, carry it through without repeated permission questions.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
