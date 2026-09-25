> Older prototype design. The approved R6 source and visual ancestry are identified in [CODE-MAP.md](CODE-MAP.md); preserve that baseline for current evidence work.

# Genii — a personality game in your pocket

Version 0.3 · 2026-09-14 · Local design expansion for founder review

Genii is the host and the payoff. The interface should feel like visiting a small character world, making suspiciously revealing choices, and collecting a portrait of yourself. A living character scene, luminous glass conversation panels and sharply edited typography give the survey the presence of a mobile game. The founder requested this direction after reviewing the first MVP; it is a project visual proposal, not a replacement for MirrorMii company canon.

This document defines the intended composition, interaction and review criteria. Implementation and rendered verification are recorded separately in the current run. A document target or passing DOM check is not proof of a rendered layout, contrast level or motion feel.

## Art direction

**Moonmilk playground:** pale lavender atmosphere, a sculpted lilac Genii, soft apricot warmth and translucent surfaces that catch light. The scene has real depth: background world, halo and floor, Genii, small floating pictorial accents, then the question deck. It should look composed before it moves.

The character has more visual weight than the interface. Questions have more contrast than decoration. Color signals selection and hierarchy without classifying any answer as virtuous or unhealthy. The palette is a local campaign interpretation informed by the earlier canon token review; parity with a current company design system remains unverified.

| Token | Value | Use |
| --- | --- | --- |
| Moonmilk | `#F7F5FF` | Page field and calm reading background |
| Lilac glass | `#EAE3FF` | Tinted glass layers and stage atmosphere |
| Iris | `#7660D6` | Brand accent, selection and emphasis |
| Midnight plum | `#30284D` | Primary text and strong controls |
| Muted plum | `#706486` | Secondary text on sufficiently light, quiet surfaces |
| Apricot | `#F5CABB` | Warm reflection and occasional scene accent |
| White | `#FFFFFF` | Frost, rim highlights and high-contrast control text where verified |

Glass uses a tinted translucent fill, a fine light rim, a soft ambient shadow and restrained blur. A stronger opaque layer sits beneath long text. Blur alone is not the material: the visible thickness, highlight, shadow and separation between planes make it read as glass. If backdrop filtering is unavailable, a solid pale panel preserves the same layout and text contrast.

Decorative imagery comes from authorized owned media or explicitly approved project variants with provenance. Favor sculptural pearl hearts, droplets and flowers as scene punctuation. Do not scatter stock photos, unrelated emoji or unfamiliar mascots around the questions. Decoration must not suggest which answer earns a preferred result.

## A 390px reference frame

The primary design frame is **390 × 844 CSS pixels**. The layout is responsive content, not a screenshot locked inside a phone frame. Test 320, 390 and 430px phone widths, a short landscape viewport and desktop. Device browser controls and safe-area insets must not hide the action.

Use a modest outer gutter, generous separation between the character and question, and a consistent card radius. The character scene occupies the upper portion of play; choices and the next action occupy the thumb-reachable lower portion. Long questions and large text extend the document naturally. Do not compress text or crop choices to preserve a fixed composition.

```text
┌──────────────────────────────┐
│ MirrorMii · Genii      sound  │
│                              │
│        soft world / halo     │
│          [ GENII ]           │
│         shadow / floor       │
│                              │
│  ╭── frosted question ────╮  │
│  │ chapter · progress     │  │
│  │ One excellent question │  │
│  │                        │  │
│  │ ○ expressive choice   │  │
│  │ ○ expressive choice   │  │
│  │ ● selected choice     │  │
│  ╰────────────────────────╯  │
│  back · skip          next → │
│       safe-area space        │
└──────────────────────────────┘
```

On wide screens, expand the atmospheric world around a restrained conversation column. The central task remains a personal exchange with Genii. Depth cards can sit in a row, and result details can use a wider arrangement, but answer text should not stretch across the page.

## Typography and copy

Use a rounded, heavy display face for the opening promise, accusation and result title. Prefer an available local rounded font or a bundled font with known rights; do not depend on a remote font request for the interface to settle. Body text uses `Avenir Next` with system sans-serif fallbacks. Compact progress labels and small annotations can use system monospace.

| Role | Mobile target | Treatment |
| --- | --- | --- |
| Landing headline | 42–52px, tight leading | Two or three intentional lines; one vivid emphasis |
| Question / accusation | 25–32px, 1.12–1.25 leading | Sentence case, strong weight, readable punctuation |
| Result title | 34–44px, tight leading | Wrap naturally; do not shrink long family titles into labels |
| Answer text | 16px; 15px on the smallest phones, 1.35–1.5 leading | Complete wording, left aligned, at least a comfortable tap area |
| Supporting explanation | 14–17px, 1.45–1.65 leading | Calm width, clear contrast, no all-caps paragraphs |
| Utility label | 11–13px | Short, restrained tracking; never used for essential instructions |

The joke belongs in the wording. Typography supports timing through emphasis and space; it does not make users decode alternating fonts, wobbling letters or tiny captions. Keep normal answer text still while it is being read. Do not animate letters one by one when that delays answering or causes screen readers to announce fragments.

Opening copy should make one promise: **“Answer suspiciously random questions. Genii will try to figure out who you are.”** A shorter hero can lead into that line. Selection feedback is brief, then the participant advances. A rejected read earns an affectionate correction such as “Noted. My case against you has weakened.” Avoid fake player counts, fake live indicators, diagnostic language and unsupported percentages of accuracy.

## Genii's living scene

The existing Eagle masters remain the visual reference for one Genii identity: attentive `MSF9HPVHMCG93`, curious `MSF9HPVHMO5NX`, and skeptical `MSF9HPVIWCZ4U`. They are unchanged in the project's fallback assets. They do not establish eight distinct family designs.

The founder's current request authorizes a **local interactive render variant**: a softly lit lilac droplet with a recognizable top curl, white eyes and tactile volume. The browser renders this procedural character in WebGL; cursor position can guide a subtle gaze, a blink gives it life, and a touch tap produces a small reaction. Touch scrolling does not drive gaze or require hovering. This is a new project presentation grounded in the canon silhouette, not an edited Eagle master or a claim of a finalized production rig. Preserve provenance and keep generated studies outside canon.

The stage combines a halo, a softly lit world and a contact shadow so Genii appears present above the conversation. Its body can breathe, lean, float or squash slightly. The character should feel responsive like a virtual pet while retaining Genii's own identity. Do not imitate Talking Tom's character design or introduce unrelated facial anatomy solely to make the render expressive.

| Character state | Intended performance | Trigger |
| --- | --- | --- |
| Idle | Slow, small float; occasional blink; relaxed gaze | Waiting for an answer |
| Curious | Slight lean or gaze toward the active choice | Choice focus or selection |
| Poked | Brief squash or bounce, then settle | Explicit character interaction |
| Accusing | More attentive pose and a restrained lighting change | Evidence-supported accusation |
| Guessing | A short anticipatory pause | A committed prediction is shown |
| Corrected | Small tilt or reset, with affectionate copy | Rejected allegation or wrong prediction |
| Summoned | A brief rise/reveal and a confident settle | Result is ready |

Character motion never changes an answer, advances a question or replaces explanatory text. Use a real labeled control for an interactive character; decorative canvas layers are hidden from accessibility APIs. The title, family and result reading stay as HTML text.

Fallback is part of the design: if WebGL is unavailable, a context is lost or rendering fails, display a canon PNG in the same stage. Reduced motion presents a calm, usable character state. A missing image must leave the question and controls intact. Actual renderer capability and fallback checks belong in validation evidence.

The earlier two reference sheets remain exploratory historical outputs. They are not authoritative orthographic masters, and their inferred hidden geometry must not be presented as verified canon. New local renders and scene studies receive their own provenance.

## Panels and controls

The home screen presents a clear invitation, the character world and a strong play button. Three illustrated cards introduce Quick, Medium and Chapters with concise descriptions. On mobile, this is a horizontal swipe strip: each card occupies roughly 46% of its container, leaving the next card visible. Around 114px artwork, 22px titles and 12px descriptions give the choices room to read instead of compressing three cards into tiny columns. The first card feels easy to start; the deeper cards express increasing relationship and detail. Use visual hierarchy rather than three equally dominant calls to action.

A small bottom navigation can connect **Play**, **My Genii** and **Chapters**. It provides reliable orientation, not extra game mechanics. Give each icon a text label and an active state. On a question screen, the explicit next action remains more prominent; fixed controls must reserve layout space and respect the device safe area.

The question deck has one active frosted card with offset planes behind it. A small chapter/progress line precedes the prompt. Answer rows are spacious cards with a leading marker or pictorial accent, complete text and an unmistakable selected state. A subtle iris border, tint and check can work together; color alone is insufficient. Selection does not instantly advance, so an accidental thumb tap is easy to correct.

A sticky action area can keep **Next** reachable after selection. It may soften the background below it, but it must not cover the final answer, skip, back or expanded text. Prefer document scrolling to a second small scroll region within the answer panel. Buttons should have approximately 48px minimum tap areas and visible focus outlines.

Accusations and prediction notices reuse the same material language but alter scale and rhythm. They are events within the game, not error alerts. Wrong, close and right remain equally readable. Do not use a red failure treatment for disagreeing with Genii.

## Results and return

The result is a collectible profile card: character, “You summoned,” title, family plus secondary tendency, tagline, loving roast and a modest confidence treatment. Let the identity and joke win before opening evidence. The share action is clear and the public preview is understandable.

Private result details use calm visual signal rows and operating-manual sections. They explain how choices contributed and where the reading remains uncertain. Confidence means experimental pattern strength, not a probability of being correct. A richer answer set can lower certainty or alter a family reading; the animation must accept that honestly.

The share card and URL use the existing public identity allowlist. No new decorative result feature may accidentally add private answers, context histories, prediction records or contact information to an export. Local referral controls remain an explicitly labeled preview, without invented commissions or confirmed acquisitions.

Eight illustrated chapters form the deep journey. The map shows what is complete and the next unfinished point without publishing the hidden scoring dimensions. A resume action restores existing answers and the saved position. Completion is not confused with answering every prompt: skipped questions remain missing evidence. A user who returns should not need to repeat the first twelve choices.

## Motion system

Use motion to express a change that already happened in state. Durations below are tuning targets, not permission to block input. The final DOM state and controls are available as soon as the action is valid.

| Motion | Target | Purpose |
| --- | --- | --- |
| Button press / choice selection | 100–180ms | Confirm the tap with a small scale or depth change |
| Question enter / exit | 220–360ms | Move the deck to the next thought; short translate and fade |
| Answer arrival | Short stagger, no more than roughly 160ms total | Establish the list without making the last choice slow to reach |
| Glass reflection / rim highlight | Subtle and occasional | Reveal surface depth away from text |
| Genii tap reaction | 350–600ms | Make the character feel touchable, then return to idle |
| Idle float / scene drift | Slow, low amplitude | Sustain presence without demanding attention |
| Accusation / reveal | Approximately 450–800ms | Mark a meaningful beat while allowing immediate reading |

Prefer transforms and opacity for panel movement. Avoid animating large blurs, heavy shadows or page dimensions every frame. Keep the WebGL renderer bounded in size and pixel density; pause unnecessary rendering when the page is hidden. Avoid multiplying animated full-screen layers on a phone. A static frame must retain the composition and material hierarchy.

Honor `prefers-reduced-motion` for CSS and renderer behavior, including changes while the page is open. Remove idle loops, tracking/parallax and large translations; show final selection, dialog and result states immediately. Sound remains off by default, and no cue depends on hearing it.

## Accessibility and review gates

These are acceptance targets for the implementation, not claims of certification:

- At 320, 390 and 430 CSS pixels, there is no horizontal document overflow and no cropped essential control. Long options, 200% text and short viewports remain readable through normal scrolling.
- Text contrast is measured against the rendered panel background, including its translucency. Target at least 4.5:1 for ordinary text and 3:1 for large text and essential control boundaries. If uncertain, strengthen the panel fill rather than relying on a decorative shadow.
- Every answer, navigation item and character action has a keyboard route, a visible focus state and an accessible name. A dialog contains focus while open and restores focus to a useful trigger when closed.
- Question changes put reading order and focus in a predictable place. Announcements are brief; ambient animation and confidence decoration do not continuously update live regions.
- Reduced-motion and WebGL-fallback experiences complete the same answer, accusation, prediction, reveal and share flow.
- Failed storage or export is acknowledged accurately. The UI does not claim a saved response, downloaded image or shared result when the operation failed.
- An independent rendered review checks home, selected answer, accusation, result, chapters and a restored session on phone and desktop. If browser execution is unavailable, record that limitation rather than substituting a DOM-only claim.

## Grounding and implementation boundaries

The local deterministic engine and versioned state remain authoritative for answers, predictions and results. A UI framework can be introduced if it clearly helps implementation, but this design does not require replacing the functioning data model, persistence or standalone review build.

A fresh bounded native Lark Base read on 2026-09-14 failed with `keychain Get failed: keychain not initialized` before company content could be read. The current proposal therefore uses the founder brief, verified Eagle assets and explicit design direction. It adds no unverified company-product promises and does not promote legacy local material to company canon. Native credentials were left unchanged; only nonsecret check status is recorded in the run output.

Review this pass by playing the quick path, rejecting an allegation, completing the reveal, inspecting the public share projection, continuing deeper and resuming a chapter. Visual approval is Jerry's review. No GitHub push, public deployment or Lark business write is included.

## Implementation references

The interaction direction uses a character in a small world, grounded in this project’s Genii silhouette and owned scene assets. [Outfit7’s character-world discussion](https://outfit7.com/blog/news/a-new-chapter-for-talking-tom-friends) was a reference for character presence, not a source of assets or copied UI. Glass implementation follows the [MDN backdrop-filter reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter); reduced-motion handling follows [MDN’s accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility).
