> **Superseded, history only.** This describes an earlier survey build or visual pass whose code has been removed. The current app starts at [../README.md](../README.md); the visual system is [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md).

# Card materials

This refinement starts from `e5ae89e`. Jerry's feedback was that the questionnaire and result cards still felt too white and flat. White and purple remain the overall theme; complementary color inside cards is explicitly authorized. Existing layout, typography, questions and behavior remain locked.

## Visual direction

Use visible tinted fills, a light upper rim, a darker lower edge and a colored contact shadow to separate the existing layers. The questionnaire panel, question header and answer rows need distinct surfaces rather than three near-white rectangles. Keep reading areas stable and decorative layers unable to intercept controls.

Result sections use domain colors: periwinkle for sleep, apricot for eating, mint for movement, pale gold for recovery, aqua for hydration, rose for body and orchid for skin. These are section identities, independent of the respondent's answer or health status. Usual/Recent markers retain their existing violet-circle and pale-diamond semantics. Missing data stays missing.

The survey cards use variations of lilac, blue and gentle complementary hues across authored chapters. Answer choices within a question share the same material; selection remains explicit through the purple border, keycap and checkmark. Other, context, Genii's speech panel and dialogs receive coordinated depth.

## References and boundaries

Reviewed [Uiverse's glassmorphism card collection](https://uiverse.io/ui/glassmorphism-cards), including public descriptions for [Smit-Prajapati's layered card](https://uiverse.io/Smit-Prajapati/smart-liger-5) and [adamgiebl's raised surface](https://uiverse.io/adamgiebl/horrible-rabbit-39). Browser access to interactive previews was blocked by Cloudflare; public text descriptions were accessible. No Uiverse source code was copied. The CSS is authored for the existing React app and uses existing icons and assets.

The current `design-taste-frontend` and `gpt-taste` workflow is applied selectively to this established product interface. Specific founder instructions override generic landing-page recipes. No new framework, image generation, global brand-token change, new company claim, or backend feature is involved. Company grounding and canon imagery provenance remain those verified in the same design session.

Preserve native radio/keyboard behavior, Other/Skip, notes, storage, routing, held-out checks, result values and feedback. Verification compares the protected source files, exercises actual controls, and checks rendered cards at phone and desktop sizes. Reduced motion and transparency preferences retain readable static alternatives. Source and review artifacts are committed/finalized in the allocated R6 run.
