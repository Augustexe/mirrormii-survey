// The real MirrorMii world (LAUNCH-SPEC section 24 item 7, round 3): optimized cuts of Jerry's approved library renders
// in public/assets/world/, built by qa/make-world-assets.py. Used only where the product itself is
// shown: the glass of the mirror (the airy white-lavender city from the world style key), the get-the-app and share
// screens (the MirrorMii World diorama) and the CGI glass Genii. Everything else in src/art stays code-drawn.
import { asset } from "../assets.js";

const at = (name) => asset(`world/${name}`);

export const WORLD = Object.freeze({
  // The city seen through the mirror, cut to the arch's 100 x 160 proportion.
  mirror: { src: at("mirror-world-526.webp"), small: at("mirror-world-320.webp"), srcSet: `${at("mirror-world-320.webp")} 320w, ${at("mirror-world-526.webp")} 526w`, w: 526, h: 842 },
  // The MirrorMii World diorama (transparent around the island).
  island: { src: at("island-1440.webp"), small: at("island-720.webp"), avif: at("island-1440.avif"), srcSet: `${at("island-720.webp")} 720w, ${at("island-1440.webp")} 1440w`, w: 1440, h: 684 },
  // Genii, the CGI glass render, cut out with a short floor reflection.
  genii: { src: at("genii-480.webp"), small: at("genii-240.webp"), srcSet: `${at("genii-240.webp")} 240w, ${at("genii-480.webp")} 480w`, w: 480, h: 433 },
});
