// src/art (package D): the asset library. Every component is aria-hidden, takes its colors from CSS
// custom properties and passes className through. Signatures are final (DESIGN-DIRECTION.md 7.3).
export { MirrorArch } from "./MirrorArch.jsx";
export { Islet, RoomDoor, Backdrop, Facet } from "./scenes.jsx";
export {
  ChapterGlyph,
  FormatGlyph,
  DeviceGlyph,
  deviceFor,
  SetupGlyph,
  Sigil,
  sigilFor,
  EmotionBead,
  Sparkle,
  SparkleBurst,
  LockPane,
} from "./glyphs.jsx";
export { DEVICE_FAMILIES, isChapterDevice } from "./devices.js";
export { ISLAND_NAMES } from "./Islet.jsx";
export { ISLAND, MIRROR, islet } from "./world.js";
export { drawArch, drawMosaic, drawFacet, drawSigil, drawGlyph } from "./canvas.js";
export * as geometry from "./geometry.js";
export * as shapes from "./shapes.js";
export * as textures from "./textures.js";
export * as canvas from "./canvas.js";
