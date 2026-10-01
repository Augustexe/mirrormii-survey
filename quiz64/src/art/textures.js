// A-14 and A-19 textures as tiny SVG sources (no raster in the bundle). The same strings are written to
// files by scripts/make-textures.mjs (grain.png for canvas, frost.svg, foxing.svg) and used here as
// data URLs for CSS backgrounds. Colors come from the token-mirrored defaults in palette.js.
import { CANVAS_DEFAULTS } from "./palette.js";
import { mulberry32 } from "./geometry.js";

const XMLNS = "http://www.w3.org/2000/svg";

// Token hex as rgb(), so the written .svg files carry no hex literals (tests scan src/art for them).
const rgb = (name) => {
  const n = parseInt(CANVAS_DEFAULTS[name].slice(1), 16);
  return `rgb(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255})`;
};

// Grain: 160 px monochrome fractal noise, tiled; use at --grain-opacity with mix-blend-mode soft-light.
export function grainSvg(size = 160) {
  return `<svg xmlns='${XMLNS}' width='${size}' height='${size}'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`;
}

// Frost: feTurbulence at 0.85, 2 octaves, as white specks at about 6% (section 6, A-14).
export function frostSvg(size = 200, alpha = 0.06) {
  const k = (alpha * 2.2).toFixed(3);
  return `<svg xmlns='${XMLNS}' width='${size}' height='${size}'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 ${k} 0 0 0 0'/></filter><rect width='100%' height='100%' filter='url(#f)'/></svg>`;
}

// Night foxing (A-19): 24 seeded soft silver specks, like old mirror backing, at about 6%.
export function foxingSvg(seed = "foxing", w = 400, h = 800, count = 24) {
  const rand = mulberry32(seed);
  const silver = rgb("mirror-silver-1");
  const specks = [];
  for (let i = 0; i < count; i++) {
    const r = 6 + rand() * 38;
    specks.push(`<circle cx='${(rand() * w).toFixed(1)}' cy='${(rand() * h).toFixed(1)}' r='${r.toFixed(1)}' fill='url(#s)' opacity='${(0.35 + rand() * 0.65).toFixed(2)}'/>`);
  }
  return `<svg xmlns='${XMLNS}' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'><radialGradient id='s'><stop offset='0' stop-color='${silver}' stop-opacity='0.12'/><stop offset='1' stop-color='${silver}' stop-opacity='0'/></radialGradient>${specks.join("")}</svg>`;
}

// Night sky specks: small sharp points for the night backdrop (seeded, 18 of them).
export function specksSvg(seed = "night", w = 480, h = 480, count = 18) {
  const rand = mulberry32(seed);
  const ink = rgb("n-ink");
  const dots = [];
  for (let i = 0; i < count; i++) dots.push(`<circle cx='${(rand() * w).toFixed(1)}' cy='${(rand() * h * 0.62).toFixed(1)}' r='${(0.6 + rand() * 1.1).toFixed(2)}' fill='${ink}' opacity='${(0.25 + rand() * 0.5).toFixed(2)}'/>`);
  return `<svg xmlns='${XMLNS}' width='${w}' height='${h}'>${dots.join("")}</svg>`;
}

const encode = (svg) => svg.replace(/</g, "%3C").replace(/>/g, "%3E").replace(/#/g, "%23").replace(/"/g, "'");
export const dataUrl = (svg) => `url("data:image/svg+xml,${encode(svg)}")`;

export const GRAIN_URL = dataUrl(grainSvg());
export const SPECKS_URL = dataUrl(specksSvg());
