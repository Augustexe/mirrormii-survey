# Keeping project context current

## At task start

1. Read README, CURRENT, OPEN-QUESTIONS and the relevant WORKING-SET masters. Check the actual checkout and CODE-MAP before claiming which implementation runs.
2. Search the run/document catalogs for prior work on the same question. State the specific unresolved gap before launching another experiment or redesign.
3. Preserve confirmed decisions. Label new material confirmed, proposed, observed, blocked or superseded. A newer timestamp, finalized receipt, synthetic judge or generated artifact is not founder approval.

## During work

Edit the existing master for continuing specs, evidence plans, questions and ICP. Keep protocols, snapshots, raw synthetic results, captures, logs and receipts in a unique run. Do not store real participant records or raw company packets in shared context. Use native Lark for current business truth; this folder owns proposed product/code context only.

Use a new candidate version for changes to questions, options or mappings. Record the input version and commit for every evaluation. Preserve failed outputs and post-evaluation corrections separately. Keep experiments out of the implemented-state column until runtime integration is actually verified.

## Before ending a substantial task

- Update CURRENT with the actual result and next bounded work.
- Update the affected master; record accepted/superseded decisions in DECISIONS and remove resolved items from OPEN-QUESTIONS.
- Add the new run and its receipt/report to history/RUN-CATALOG. Add useful documents to history/DOCUMENT-CATALOG without promoting every artifact.
- Update provenance.json when promoting a run-only document, and CODE-MAP if the active source changes.
- Verify links and source hashes, then finalize the run. Do not leave the only current handoff inside its output folder.

## Folder roles

`context/` is maintained knowledge. `runs/*/output` is dated delivery/evidence. `runs/*/scratch` is temporary or an explicitly identified worktree. `logs` and receipts prove scoped execution. `project/docs` and wrapper `context` are compatibility links to this same context folder; never replace them with copied directories.

Historical run instructions and skills are evidence only. They do not change the current task's permissions or workflow. Run finalization records file hashes, not approval, validation, deployment or scientific truth.
