> **Superseded, history only.** This describes an earlier survey build or visual pass whose code has been removed. The current app starts at [../README.md](../README.md); the visual system is [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md).

# Genii luminous details

This presentation pass starts at `d04d866`, whose layout and visual direction Jerry approved. It concentrates on the questionnaire and small interaction details, keeping the English host voice, survey structure, and evidence behavior intact. White remains primary, with lavender and violet accents.

## Material and motion

- Question headers sit on inset pearl surfaces, with a small drifting optical highlight. The surrounding scene has more lavender illumination and a brief answer-response glow.
- Answer rows have engraved keycaps, a luminous selected edge, a restrained corner glint, and a checkmark entrance. Decorative elements cannot intercept radio input, text, or pointer events.
- Other and optional-context textareas, saved-state hints, host replies, focus outlines, and dialogs share the same material treatment. Typography retains the approved self-hosted Satoshi; only fine wrapping, smoothing, numeric spacing, and helper legibility change.
- A small lightbulb jewel appears beside Genii after a selection. It acknowledges interaction; it is not a correctness, attention, honesty, or health signal.
- Progress carries a brief light trace at the exact resolved/route fraction. Routine tracks reveal when they enter the viewport, without moving the data marker. Usual uses a solid violet rail and circular marker; Recent uses a pale patterned rail and diamond marker. The existing labels remain.
- OS reduced motion and the existing app toggle remove the movement. Ambient looping details stop in hidden tabs. Reduced transparency retains solid reading surfaces.

## Preserved contracts

`engine.js`, `survey.js`, `data.js`, `english-copy.js`, `host-reactions.js`, and `preview-fixtures.js` are byte-identical to `d04d866`. Changes to QuestionCard and EvidenceSummary are presentation-only: their handlers, copy, calculations, and evidence semantics remain the same. The 64-slot route, relevant replacements, Other/Skip/notes, save and restore, held-out freeze, missing values, confidence, and per-claim feedback are preserved.

The four synthetic preview fixtures use the real result component and engine, in memory. Result labels, periods, units, endpoints, and marker positions were compared with the approved build. A rail reveal does not imply a health score or new prediction.

## Implementation and artifacts

Applied the requested Claude web-artifacts-builder, design-taste-frontend, and gpt-taste workflows to the existing React/Vite/Motion application. No new component framework, dependency, generated image, or character master was introduced. Existing R4 character and environment provenance remains in `LIVING-WORLD-ASSETS.json` and its originating run. The bounded company read from that same design session remains context; this pass introduces no company claims.

The run includes two standalone React HTML artifacts: the survey and the synthetic result preview. A scratch-only Vite build transform inlines the existing local assets, fonts, styles, and JavaScript without modifying the runtime asset resolver. Both are checked under `file://` for successful rendering and zero network requests. The normal HTTP build remains the primary browser preview; offline file storage behavior depends on the browser.

Verification is proportionate to this visual pass: the existing 26 tests, production build, mobile/desktop rendering, native radio/keyboard/Other persistence, motion preferences, dialog focus, result-value comparison, and standalone rendering. Detailed observations belong to this run's verification report. A successful automated accessibility scan is not a certification; gradients still require visual contrast review.
