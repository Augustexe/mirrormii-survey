# Genii survey workspace

Start with [project context](docs/README.md). The maintained [working set](docs/WORKING-SET.md) contains the evidence, questions, ICP and psychology documents to edit. [Current state](docs/STATE.md) separates confirmed requirements, implemented behavior and experimental candidates.

**Source distinction:** choose the actual application checkout using [CODE-MAP.md](docs/CODE-MAP.md). [STATE.md](docs/STATE.md) records the latest verified deployment evidence and its date. This project root also contains an older prototype; do not assume its `src/` is the deployed app.

`docs/` directly holds maintained knowledge. Project runs hold frozen outputs, evaluation results and receipts; see the [run catalog](docs/history/RUN-CATALOG.md). No historical run was deleted.

For the older prototype only, existing commands remain `npm run dev`, `npm test`, `npm run check`, and `npm run build`. Use the approved app's own package scripts for R6 work. Central workspace execution follows AGENTS.md and the managed toolchain; generated artifacts belong in an allocated run.

Read [AGENTS.md](AGENTS.md) before editing. No public release, backend change or new company capability is implied by this documentation consolidation.
