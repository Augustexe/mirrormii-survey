// The canon MirrorMii world (LAUNCH-SPEC section 25 item 1): renders made from the GDD v0.2 (sections 3.2 and 3.4),
// optimized into public/assets/island/ (sizes in its MANIFEST.json; full-size sources live outside the app in
// assets/production-media/survey-island-2026-09-29). Nothing here comes from the landing page or the asset library.
//   hero      the floating island of white marble terraces with the World Mirror at its center (2:3 and 16:9)
//   night     the same island at night, the mirror glowing (2:3)
//   frame     the World Mirror itself: the oval opal frame on its round marble plinth, glass and background transparent
//   inside    what the mirror shows: a corner of a cozy pastel room with a window onto a dream city, no people
//   ch1..ch7  one small floating islet per chapter, transparent around it
//   genii     a still of our own three.js Genii (qa/capture-genii.mjs STILL=1), for the canvas share image only
import { asset } from "../assets.js";

const at = (name) => asset(`island/${name}`);
const set = (name, widths) => widths.map((w) => `${at(`${name}-${w}.webp`)} ${w}w`).join(", ");

// The mirror in glass units: the glass is a 100 x 200 pill (geometry.archPath) and the frame render is placed around it
// so its transparent opening sits exactly on the glass. Measured from the render's alpha (opening 486 x 972 px in the
// 791 x 1284 cut); the plinth ends at y 248.
export const MIRROR = Object.freeze({
  w: 100,
  h: 200,
  frame: Object.freeze({ x: -31.89, y: -15.02, w: 162.76, h: 264.2 }),
  ring: 16.9, // the opal ring's width outside the glass
  plinthTop: 200,
  bottom: 248,
});

// Pick the smallest file that still covers `px` CSS pixels at 2x.
const pick = (px, widths, name) => at(`${name}-${widths.find((w) => w >= px * 2) ?? widths[widths.length - 1]}.webp`);

export const ISLAND = Object.freeze({
  hero: { src: at("hero-portrait-720.webp"), large: at("hero-portrait-1080.webp"), srcSet: set("hero-portrait", [720, 1080]), w: 720, h: 1080 },
  wide: { src: at("hero-wide-960.webp"), large: at("hero-wide-1600.webp"), srcSet: set("hero-wide", [960, 1600]), w: 960, h: 540 },
  night: { src: at("hero-night-720.webp"), large: at("hero-night-1080.webp"), srcSet: set("hero-night", [720, 1080]), w: 720, h: 1080 },
  frame: { src: at("mirror-frame-480.webp"), small: at("mirror-frame-240.webp"), large: at("mirror-frame-900.webp"), srcSet: set("mirror-frame", [240, 480, 900]), w: 480, h: 779, pick: (px) => pick(px, [240, 480, 900], "mirror-frame") },
  inside: { src: at("mirror-inside-720.webp"), small: at("mirror-inside-360.webp"), large: at("mirror-inside-1080.webp"), srcSet: set("mirror-inside", [360, 720, 1080]), w: 720, h: 1080, pick: (px) => pick(px, [360, 720, 1080], "mirror-inside") },
  genii: { src: at("genii-still.webp"), png: at("genii-still.png"), w: 320, h: 306 },
});

// A chapter's islet: 1..7; anything else (extras, finale) has none and screens show the hero island instead.
export function islet(chapter) {
  const n = Number(chapter);
  const k = n >= 1 && n <= 7 ? n : null;
  if (!k) return null;
  return { src: at(`ch${k}-720.webp`), small: at(`ch${k}-360.webp`), srcSet: set(`ch${k}`, [360, 720]), w: 720, h: 720, pick: (px) => pick(px, [360, 720], `ch${k}`) };
}
