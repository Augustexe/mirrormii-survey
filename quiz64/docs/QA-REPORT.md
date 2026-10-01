> **Dated record, not the spec.** Current gates and numbers are in the locked spec [LAUNCH-SPEC.md](../../docs/LAUNCH-SPEC.md) section 8; section numbers cited below refer to the pre-lock spec, now [history](../../docs/history/LAUNCH-SPEC-2026-09-29-full.md).

# Integration and visual QA report (2026-09-29)

Branch `survey/launch`, app `quiz64/`, after visual packages A to D and the 174-card bank. Checklist: DESIGN-DIRECTION
section 7.5; rubric: section 2. Captures and the contact sheet are in the session scratchpad (`screens-after/`, 192
PNGs at 390 x 844, 375 x 667 and 1440 x 900; `contact-before-after.png`, the 76 pre-rebuild names side by side plus
116 new screens).

## Tests

- `npm test`: 124 pass, 0 fail. (218 before integration; the 95 removed tests covered the deleted dossier build. Two
  new: varied Genii lines; the persona UI tests now load the barrels, not the removed shims.)
- Fixed the two failures: `deviceFor` (7 new absurd devices mapped on purpose in `src/art/devices.js`) and "an
  unfinished side gets 1 or 2 extra cards" (root cause in the test's player: skipping every card that touches R1 also
  starved L1, because since the bank revision some cards carry R1 and L1 together, so the picker rightly served one
  extra to each side; the player now answers off-axis where it can and skips only when it cannot).
- Browser: fold test 348 checks, 0 fails (0 at 375 x 667, 0 horizontal overflow); play-evidence 2,072 tap scripts,
  0 differences from the pre-rebuild card.

## Removed

Dossier build (DossierApp, App, V4 banks, data/engine/evidence-framework/game-outcome/host-reactions and 6 more
modules, 17 components, preview.html and its CSS, 12 tests and their fixture), the `PersonaCard` and `PersonaScreens`
shims, the unused dialog chapter map and its CSS. The 13 legacy stylesheets (230 KB) became one tree-shaken
`src/legacy.css` (16 KB): static class usage first, then selectors never matched on 192 captured screens and absent
from JSX were dropped. The before and after captures of 128 screens are pixel-identical except the animated reveal
intro. Retired Genii renders and badges stay on disk (D1); nothing in the build references them (they are still
copied to `dist/assets` as static public files).

## Fixes

| Area | Fix |
|---|---|
| Lobby, phone | A tap on a voice tile was lost: the press started a View Transition preview and Chrome sent the release to the transition overlay. Previews now paint at once. |
| Genii's line | Varies per reactions.js rules, never the same line on two cards in a row, speed nudge once per rushed streak (before: the nudge on 36 cards in a row for a fast player; the same host line after every reload). |
| Landing | Composed first screen on phone (promise, mirror, Meet Genii, chips, "How this works" above the fold at 390 x 844; the button above the fold at 375 x 667); stray bands removed (hard water edge at the 62% horizon, shader distortion 0.7 to 0.32); elliptical mirror reflection instead of a box; promise rewritten: "40 quick cards, from group chats to mermaid roommates. Genii locks in 8 guesses. Two archetypes, weirdly you." (LOBBY_COPY, for Jerry's read; meta descriptions follow). |
| GeniiLight | Large sizes had a grey ring around the white core; the core now only lightens inward. |
| Screens CSS | The `.is-on [data-part]` art recolor is scoped to setup and lobby tiles. |
| Lock | Header turns to dark glass over the night scene. |
| Share image | Story format drew the fifth charm over the URL and pushed "Do you really know me?" off the card; the arch steps down when there are more than three charms. |
| Zoom | 320 px `min-width` on html and body removed: at 200% zoom (195 CSS px) the page scrolled sideways. |
| Accessibility | Landing chip row keyboard reachable (axe `scrollable-region-focusable`). |
| Desktop cards | The chapter island poked out behind the mirror as blobs; its edges are now masked into a glow. |
| Performance | `Boot.jsx` paints the landing from a 69 KB gzipped chunk while the game (218 KB gzipped) loads; early taps are kept; the swap does not replay the entrance. |

## Checklist 7.5

| Item | Result |
|---|---|
| Fold at 390 x 844 | Pass: fold test 0 fails; every captured card shows answers and exits. |
| One progress indicator | Pass: shard rail only; "Card N of 40" exists only as screen-reader text (test). |
| Fonts | Pass: computed families on 187 screens are Fraunces and Figtree only (plus their metric fallbacks while loading); no monospace. |
| No library Genii, no faces | Pass: Genii is light only; build references no retired render; no faces in art (reviewed on the captures). |
| Formats distinct at thumbnail size | Pass, with scenario, others and sealed the closest trio (list layouts; vignette and kicker differ). |
| Day, Dusk, Clear distinguishable | Pass (card-day, card-dusk, card-clear); Clear versus Day is the subtlest. |
| Reveal on phone and desktop | Pass: all 9 screens reached through the UI in both voices, mouse and keyboard; names readable on screen 2 after the assembly. |
| Facet, charms, insight, stings | Pass in both voices (captures result-fun and result-heart 01 to 09). |
| Share PNGs | Pass: 1080 x 1920 and 1080 x 1350, brand fonts, no stings, answers, numbers or banned words; stings screen offers "Save for me" only. |
| Contrast (axe-core) | Pass: 0 violations of any WCAG 2.2 A/AA rule on 187 screens (phone, desktop, 200% zoom), including friend game screens. |
| Keyboard-only full run | Pass in both voices: Tab to every non-card control with a visible focus ring, 1 to 5 and Enter on cards, arrows on the reveal. |
| Reduced motion and transparency | Captured (reduced-motion-reveal, reduced-transparency-card and -landing): no travel, no blur, readable. |
| 200% zoom at 390 px | Pass after the min-width fix: 0 horizontal overflow on 56 screens at 195 CSS px. Type tokens are px, so a browser text-only size setting does not scale them (see open items). |
| Performance | See below. One WebGL canvas at most (measured through a full run). |
| Copy | Pass: no em dashes in source or on screen; nothing from the PRODUCT-TRUTH never-say list; none of "evidence", "axis", "sealed", "run id", "hash" on any player screen. |
| Full runs through the real UI | Pass: 40 cards, lock, 8 finale, 9 reveal screens, in each voice, by tap on phone and by keys on desktop; 0 console errors. |
| Friend link flow | Pass on phone and desktop: owner makes a link, a fresh browser plays intro, levels 1 to 3 and the done screen, the reply link opens the owner's friend results. |

## Scores (section 2 rubric, from the captures)

Dimensions: Hook, Craft, Mirror logic, Phone fit, Motion, Share. Before: section 2.

| Screen group | Before mean | After H / C / M / P / Mo / S | After mean |
|---|---|---|---|
| Landing | 4.5 | 8 / 8 / 9 / 8 / 8 / 7 | 8.0 |
| Setup and lobby | 2.5 | 8 / 8 / 7 / 9 / 8 / 6 | 7.7 |
| Chapter interlude | 3.7 | 8 / 8 / 8 / 8 / 8 / 7 | 7.8 |
| Cards (13 formats) | 2.2 | 8 / 8 / 8 / 9 / 8 / 6 | 7.8 |
| Lock and post-lock | 3.7 | 9 / 9 / 9 / 8 / 8 / 7 | 8.3 |
| Result stories (9, two voices) | 3.5 | 9 / 8 / 9 / 8 / 8 / 9 | 8.5 |

Under 8: setup and lobby, interlude and cards miss on Share (6 to 7), which the rubric scores for every screen but
which these screens are not meant to carry; every other dimension is 7 or higher. Improved in this pass for the
groups under 8: the lost voice tap, the art recolor leak, varied Genii lines, the desktop island blobs.

## Performance

| Measure | Result |
|---|---|
| Lighthouse mobile, devtools throttling (Moto G Power, 4G), landing | Performance 98, Accessibility 100, Best practices 100; FCP 1.8 s, LCP 1.8 s, CLS 0, TBT 0 ms |
| Lighthouse mobile, simulated throttling (default), landing | Performance 89; FCP 2.2 s, LCP 3.5 s, CLS 0, TBT 60 to 80 ms. Lantern charges the lazy game chunk to the LCP node that replaces the boot landing; with devtools throttling and in the Performance API (960 ms under 4x CPU and 1.6 Mbps) the LCP is the boot paint. |
| Before the boot split (simulated) | FCP 2.9 s, LCP 3.2 s, TBT 8,060 ms (the mesh shader on software GL in headless Chrome; 0 ms with reduced motion) |
| Tap to next prompt readable (full run, phone) | median 447 ms (target 440 plus or minus 60), p90 929 ms (chapter changes) |
| Bundles (gzipped) | boot 69 KB JS + 13.7 KB CSS; game 218 KB JS + 16.3 KB CSS; shader 9 KB (lazy) |

## Not done or open

- Lighthouse on a card screen (needs a seeded save); INP not measured by Lighthouse, tap-to-prompt timing used instead.
- Share dimension under 8 for setup, lobby, interludes and cards (see scores).
- The type scale is in px: WCAG page zoom passes, but an OS or browser text-only size setting does not enlarge text.
- The game chunk is 218 KB gzipped, mostly the card kit; splitting the kit further would help the simulated LCP.
- `qa/persona-browser-qa.mjs` predates the lobby and was not updated; `qa/play-through.mjs` replaces it.
- Proposed copy for Jerry's read: the new landing promise (plus the D6 items already listed in DESIGN-DIRECTION 8).
