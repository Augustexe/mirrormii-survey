> **Superseded, history only.** This describes an earlier survey build or visual pass whose code has been removed. The current app starts at [../README.md](../README.md); the visual system is [DESIGN-DIRECTION.md](DESIGN-DIRECTION.md).

# Genii living world

This visual evolution begins at approved commit `8eff355`. Jerry asked to lock the questionnaire, functionality and composition while making the art, character quality and motion more expressive. White remains the main color, purple the accent. Nothing was deployed or published.

## Presentation changes

- Two generated opal-glass Genii expressions, preserving the verified V2 silhouette, curl, pearl, white abstract eyes and mouthless/limbless design. Canon Eagle masters remain unchanged. These derivatives are project art, not new canon.
- A generated glass environment with procedural caustics that change with landing, chapter, quiz, seal and result scenes. The quiz remains deliberately calmer than chapter breaks.
- A shared character rig with slow buoyancy, mouse parallax, response nods and decorative orbit/waveform details. Waveforms convey theatrical character thought; they do not measure voice, attention, emotion or computational activity.
- Pearl/chrome icon surfaces, selection light, button sheen and tactile focus/hover/pressed treatment using the existing Motion/React/Lucide stack.
- System reduced motion and the existing app toggle disable motion. Canvas stops in hidden tabs; character CSS loops pause when offscreen or hidden. Reduced transparency uses solid surfaces.

## Preserved boundaries

`engine.js`, `survey.js`, `data.js`, `english-copy.js`, `host-reactions.js`, `QuestionCard.jsx`, `EvidenceSummary.jsx` and `preview-fixtures.js` retain their approved content. The 64-question route, relevant replacements, Other/Skip/notes, save/resume, held-out freeze, evidence confidence, claim feedback and separate usual/recent tracks remain unchanged. Preview fixtures stay synthetic, in memory, and separate from live survey storage.

No click-time honesty classifier, completion gate, extra telemetry, backend or public publication was introduced.

## Design decisions

Applied `design-taste-frontend` and `gpt-taste`, dials 9/8/4. Actual Python RNG using the final request sentence length (149) selected Cinematic Center, Satoshi, marquee/accordion/inline imagery and scale-fade/pinned title. The user's specific layout and functionality lock governs over generic marketing-page prescriptions: retain the existing centered hero and Satoshi, existing disclosure controls and sticky companion; omit unrelated testimonial/marquee/AIDA additions, answer-hiding hover panels and scroll hijacking. No new framework or animation dependency was needed.

Fresh bounded MirrorMii OS/Base and Marketing Wiki reads were available. Brand imagery and token material reviewed was draft, not approved Genii canon. Character identity therefore follows the verified Eagle master and Jerry's explicit instructions. Source references and full prompts are preserved with the run outputs.

See `LIVING-WORLD-ASSETS.json` for source IDs, files, delivery sizes and SHA-256 hashes. Earlier `LAUNCH-VISUALS.md` documents the prior build; its restriction to unchanged character pixels is superseded by the user's explicit rerender authorization in this pass.
