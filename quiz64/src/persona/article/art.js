// The canon world renders the article uses (LAUNCH-SPEC section 25 item 1): public/assets/island/, made from the GDD
// v0.2 (sizes in its MANIFEST.json). Paths only; the files are lazy-loaded by the page, except the cover.
import { asset } from "../../assets.js";

const at = (name) => asset(`island/${name}`);
const set = (name, widths) => widths.map((w) => `${at(`${name}-${w}.webp`)} ${w}w`).join(", ");

export const ART = Object.freeze({
  // The floating island with the World Mirror at its center: portrait for phones, wide for desktop.
  portrait: { src: at("hero-portrait-720.webp"), srcSet: set("hero-portrait", [720, 1080]), w: 720, h: 1080 },
  wide: { src: at("hero-wide-960.webp"), srcSet: set("hero-wide", [960, 1600]), w: 960, h: 540 },
  // The same island at night, the mirror glowing.
  night: { src: at("hero-night-720.webp"), srcSet: set("hero-night", [720, 1080]), w: 720, h: 1080 },
  // The World Mirror: the oval opal frame on its round plinth, glass and background transparent. The glass opening
  // sits at these fractions of the frame image (measured from the render's alpha).
  frame: { src: at("mirror-frame-480.webp"), srcSet: set("mirror-frame", [240, 480, 900]), w: 480, h: 779, glass: { left: 19.6, top: 5.7, width: 61.4, height: 75.7 } },
  // What the mirror shows: a cozy pastel room with a window onto the dream city.
  inside: { src: at("mirror-inside-720.webp"), srcSet: set("mirror-inside", [360, 720, 1080]), w: 720, h: 1080 },
});

// One floating islet per chapter (1 phone, 2 friends, 3 love, 4 money, 5 work, 6 home, 7 play), transparent around it.
export function islet(chapter) {
  const n = Number(chapter);
  if (!(n >= 1 && n <= 7)) return null;
  return { src: at(`ch${n}-360.webp`), srcSet: set(`ch${n}`, [360, 720]), w: 360, h: 360 };
}
