> **Superseded, history only.** This describes an earlier survey build or visual pass whose code has been removed. The current app starts at [../README.md](../README.md); the visual system is [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md).

# Genii launch visual refinement

2026-09-17 · `codex/genii-launch-visuals` · based on `4c7b4f87`.

This is a presentation refinement of the established Genii survey. All English questions, answer choices, host reactions, route slots, evidence mappings, missingness behavior, saved-answer semantics and result features remain unchanged. The white primary canvas and purple secondary color are explicit brand requirements.

The design uses a centered invitation, self-hosted Satoshi typography, a brighter optical-glass ribbon stage, unchanged canonical Genii2 artwork, softly raised controls, an accessible chapter trail, and tactile chapter icons. Pointer movement tilts only the mascot; choosing an answer produces a brief nod. Answer text remains stable. Existing Motion owns transitions; no additional animation or component framework was added.

Results remain one evidence portrait. Sleep receives a full-width section, with the other six routine domains paired below it. Usual and Recent use aligned tracks with separate named readings, qualitative evidence confidence and source disclosures. Mobile stacks the same information. Unknown values stay explicitly missing; track positions have not been reinterpreted as health scores. Per-claim True/False feedback, emotional layers, facts, checks, export and reset retain their behavior.

## Developer preview

`preview.html` is a separate Vite entry with complete, mixed, sparse and fully skipped fictional fixtures. It invokes the real engine and real result component. Fixed check answers are independent of the frozen predictions. Answer review, claim feedback and synthetic-marked JSON export work entirely in memory. Preview does not read or write respondent localStorage.

The preview is a local development/review convenience, not an authenticated admin surface. It exposes the authored check questions, so a reviewer who has used it should not subsequently be considered a blind prediction-test participant. No separate quality score, timing tracking, random-answer classifier, or cheeky all-skipped gate is implemented: those behavior changes remain separate planning decisions.

## Design reasoning and provenance

Applied the explicitly requested design-taste-frontend and gpt-taste skills with design/motion/density dials 8/7/3. The seeded exploration (4196) selected Cinematic center and Satoshi; decorative marquees, testimonial carousels and scroll-pinned marketing sections were rejected as inappropriate to the existing survey. The questionnaire and brand brief govern over generic skill preferences.

Reviewed [React Bits](https://reactbits.dev/components/tilted-card) and the existing [Motion spring API](https://motion.dev/docs/react-use-spring) as references. No third-party component source was copied. [Fontshare Satoshi](https://www.fontshare.com/fonts/satoshi) is supplied as an unmodified variable WOFF2 with its complete license. Current company content was not refreshed for this visual-only pass and no new business or health claims were introduced.

Asset source IDs, rights, source/delivery hashes and full generation prompts are in [ASSETS.json](ASSETS.json). Generated stages are project supporting assets, not canon replacements. The official character and wordmark remain unmodified.

## Review boundary

Existing engine/bank tests, source comparison, an independent diff review, production rendering, preview storage isolation and downloads, keyboard controls, contrast, mobile overflow, and motion preferences are the proportionate checks for this pass. Recorded browser and performance results belong to the current run handoff. These checks do not certify an award, clinical accuracy, or an externally validated design score.
