// The mirror card and the story-screen images (DESIGN-DIRECTION 5.13), drawn on a canvas in this browser. Nothing is
// uploaded. The art comes from the same geometry the page uses (src/art/geometry.js: the seeded mosaic, the facet,
// the sigils) and the colors from src/system/tokens.js, so the image is the page's mirror, not a lookalike.
// Never drawn on the mirror card: stings, answers, numbers, the guess check, the words the spec keeps off the page.
import { geometry } from "../art/index.js";
import { MIRROR } from "../art/world.js";
import { OPAL } from "../art/palette.js";
import { tokens } from "../system/index.js";

export const FORMATS = Object.freeze({ story: { w: 1080, h: 1920 }, post: { w: 1080, h: 1350 } });
const N = tokens.night;
const C = tokens.color;
// One font: Satoshi (tokens.fonts.family), upright only. Callers still name a role ("display" for headlines, names,
// numbers and lines; "text" for labels and body); the role only picks the weight, never a different face.
const FAMILY = tokens.fonts.family;
const hasPath2D = () => typeof Path2D !== "undefined";
const path = (d) => (hasPath2D() ? new Path2D(d) : null);
const tintOf = (ch) => (tokens.chapterTint[ch] || tokens.chapterTint[Number(ch)] || tokens.chapterTint.extras).tint;

// ---------------------------------------------------------------- palettes

function rgba(hex, a) {
  const h = String(hex).replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function paletteFor(look, theme = "day") {
  const th = tokens.themes[theme] || tokens.themes.day;
  const deep = theme === "dusk" ? tokens.gradients.deepDusk : tokens.gradients.deep;
  if (look === "light") {
    return { look, bg: [th.canvas, th.canvas2], glows: th.glows, ink: C.ink, ink2: C.ink2, ink3: C.ink3, accent: C.violetText, rim: C.violet300, glass: rgba(C.surfaceSolid, 0.72), line: C.line, deep, dark: false };
  }
  if (look === "deep") {
    return { look, bg: deep, glows: [N.violet, tokens.gradients.brand[1], th.glows[0]], ink: N.ink, ink2: N.ink2, ink3: N.ink2, accent: N.ink, rim: N.ink2, glass: rgba(N.ink, 0.12), line: rgba(N.ink, 0.3), deep, dark: true };
  }
  return { look: "night", bg: [N.n900, N.n700], glows: [tokens.gradients.brand[0], tokens.gradients.brand[1], C.violet], ink: N.ink, ink2: N.ink2, ink3: N.ink3, accent: N.violet, rim: N.ink2, glass: rgba(N.n700, 0.6), line: N.n600, deep, dark: true };
}

// ---------------------------------------------------------------- text

// Display weights retuned for Satoshi: big numbers 900 (callers pass 900), headlines and names 800, prompts and
// story lines 700, quiet lines 500.
export function displayWeight(weight) {
  if (weight >= 900) return 900;
  if (weight >= 580) return 800;
  if (weight >= 540) return 700;
  return 500;
}

function font(ctx, face, weight, size) {
  const w = face === "display" ? displayWeight(weight) : weight;
  ctx.font = `${w} ${Math.round(size)}px ${FAMILY}`;
}

function wrap(ctx, value, width) {
  const lines = [];
  let line = "";
  for (const word of String(value || "").split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Narrow the measure while the line count holds, so a two-line block never ends on one orphaned word.
function balanced(ctx, value, width, first) {
  if (first.length < 2) return first;
  let best = first;
  for (let wd = width * 0.95; wd > width * 0.4; wd *= 0.95) {
    const next = wrap(ctx, value, wd);
    if (next.length !== first.length) break;
    best = next;
  }
  return best;
}

// Fit text into at most `maxLines` lines at the largest size between max and min. Returns { size, lines }.
function fit(ctx, value, { face, weight, max, min, width, maxLines, balance = true }) {
  for (let size = max; size >= min; size -= 2) {
    font(ctx, face, weight, size);
    const lines = wrap(ctx, value, width);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= width)) return { size, lines: balance ? balanced(ctx, value, width, lines) : lines };
  }
  font(ctx, face, weight, min);
  return { size: min, lines: wrap(ctx, value, width).slice(0, maxLines) };
}

// Draw lines with a given alignment; returns the y after the last line.
function lines(ctx, list, x, y, { lh, align = "left", color }) {
  ctx.textAlign = align;
  ctx.fillStyle = color;
  let yy = y;
  for (const l of list) { ctx.fillText(l, x, yy); yy += lh; }
  ctx.textAlign = "left";
  return yy;
}

function block(ctx, value, x, y, opts) {
  const { size, lines: ls } = fit(ctx, value, opts);
  return lines(ctx, ls, x, y + size * 0.82, { lh: size * (opts.lh || 1.18), align: opts.align, color: opts.color }) - size * 0.82;
}

function tracked(ctx, value, x, y, { size, weight = 700, color, align = "left", track = 0.12, upper = true }) {
  font(ctx, "text", weight, size);
  const text = upper ? String(value || "").toUpperCase() : String(value || "");
  if ("letterSpacing" in ctx) {
    ctx.letterSpacing = `${(size * track).toFixed(1)}px`;
    ctx.textAlign = align;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.letterSpacing = "0px";
    ctx.textAlign = "left";
    return;
  }
  lines(ctx, [text], x, y, { lh: size, align, color });
}

// ---------------------------------------------------------------- shapes

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function glow(ctx, x, y, r, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

let grainTile = null;
function grain(ctx, W, H, alpha) {
  if (typeof document === "undefined") return;
  try {
    if (!grainTile) {
      grainTile = document.createElement("canvas");
      grainTile.width = 160;
      grainTile.height = 160;
      const g = grainTile.getContext("2d");
      const img = g.createImageData(160, 160);
      const rand = geometry.mulberry32("mirrormii-grain");
      for (let i = 0; i < img.data.length; i += 4) { const v = Math.floor(rand() * 255); img.data[i] = v; img.data[i + 1] = v; img.data[i + 2] = v; img.data[i + 3] = 255; }
      g.putImageData(img, 0, 0);
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.globalCompositeOperation = "soft-light";
    ctx.fillStyle = ctx.createPattern(grainTile, "repeat");
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  } catch { /* grain is decoration */ }
}

function background(ctx, W, H, p) {
  const bg = ctx.createLinearGradient(0, 0, p.look === "deep" ? W : 0, H);
  bg.addColorStop(0, p.bg[0]);
  bg.addColorStop(1, p.bg[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // An aurora of soft light across the top third, and a low glow near the floor.
  const a = p.look === "light" ? 0.55 : p.look === "deep" ? 0.35 : 0.28;
  glow(ctx, W * 0.18, H * 0.1, W * 0.62, p.glows[0], a);
  glow(ctx, W * 0.86, H * 0.18, W * 0.55, p.glows[1], a * 0.9);
  glow(ctx, W * 0.5, H * 0.92, W * 0.6, p.glows[2], a * 0.5);
  if (p.dark) grain(ctx, W, H, 0.05);
}

// ---------------------------------------------------------------- the mirror

function mosaicOf(mirror) {
  const filled = mirror && Array.isArray(mirror.filled) && mirror.filled.length ? mirror.filled : Array.from({ length: 40 }, (_, i) => ({ chapter: 1 + (Math.floor(i / 6) % 7) }));
  const seed = (mirror && mirror.seed) || "mirror";
  return { filled, cells: geometry.mosaic(seed, Math.max(40, filled.length), { w: MIRROR.w, h: MIRROR.h }).cells };
}

export function drawSigil(ctx, code, x, y, size, color) {
  const k = size / geometry.SIGIL_GRID;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(k, k);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = geometry.SIGIL_STROKE;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const part of geometry.sigilParts(code)) {
    const d = path(part.d);
    if (!d) continue;
    ctx.setLineDash(part.dash || []);
    if (part.fill) ctx.fill(d); else ctx.stroke(d);
  }
  ctx.setLineDash([]);
  ctx.restore();
}

export function drawFacet(ctx, axes, cx, cy, size, p, { labels = false } = {}) {
  const g = geometry.facetGeometry(axes || [], size);
  const ox = cx - size / 2;
  const oy = cy - size / 2;
  glow(ctx, cx, cy, size * 0.7, p.dark ? N.violet : C.violet300, 0.45);
  ctx.save();
  ctx.translate(ox, oy);
  if (labels) {
    ctx.strokeStyle = rgba(p.dark ? N.ink3 : C.ink3, 0.55);
    ctx.lineWidth = Math.max(1, size / 300);
    for (const sp of g.spokes) { ctx.beginPath(); ctx.moveTo(sp.from[0], sp.from[1]); ctx.lineTo(sp.tip[0], sp.tip[1]); ctx.stroke(); }
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(g.waterline[0][0], g.waterline[0][1]); ctx.lineTo(g.waterline[1][0], g.waterline[1][1]); ctx.stroke();
    ctx.setLineDash([]);
  }
  const poly = path(g.path);
  if (poly) {
    const fill = ctx.createLinearGradient(0, 0, size, size);
    fill.addColorStop(0, p.deep[0]);
    fill.addColorStop(1, p.deep[1]);
    ctx.globalAlpha = 0.94;
    ctx.fillStyle = fill;
    ctx.fill(poly);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.clip(poly);
    const hi = ctx.createLinearGradient(0, 0, size * 0.7, size * 0.7);
    hi.addColorStop(0, rgba(tokens.color.surfaceSolid, 0.45));
    hi.addColorStop(0.5, rgba(tokens.color.surfaceSolid, 0));
    ctx.fillStyle = hi;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
    ctx.strokeStyle = rgba(tokens.color.surfaceSolid, 0.75);
    ctx.lineWidth = Math.max(1.5, size / 140);
    ctx.stroke(poly);
  }
  ctx.strokeStyle = rgba(tokens.color.surfaceSolid, 0.32);
  ctx.lineWidth = Math.max(1, size / 220);
  for (const [a, b] of g.facetLines) { ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
  ctx.fillStyle = tokens.color.surfaceSolid;
  for (const v of g.vertices) {
    for (const [x, y] of v.double || [[v.x, v.y]]) { ctx.beginPath(); ctx.arc(x, y, Math.max(2.5, size / 110), 0, Math.PI * 2); ctx.fill(); }
  }
  ctx.restore();
  if (labels) {
    const byKey = Object.fromEntries((axes || []).map((a) => [a.key, a]));
    for (const l of g.labels) {
      const v = g.vertices.find((x) => x.key === l.key) || {};
      const a = byKey[l.key] || {};
      const lead = v.lead || a.minus || "";
      const other = v.lead ? v.other : a.plus || "";
      const align = l.anchor === "middle" ? "center" : l.anchor === "start" ? "left" : "right";
      const lx = ox + l.x;
      const ly = oy + l.y + (l.upper ? -size * 0.02 : size * 0.045);
      tracked(ctx, lead, lx, ly, { size: size * 0.05, color: v.lead ? p.ink : p.ink2, align, track: 0.1 });
      font(ctx, "text", 500, size * 0.04);
      lines(ctx, [other], lx, ly + size * 0.055, { lh: 0, align, color: p.ink3 });
    }
  }
}

function drawCharm(ctx, { x, y, w, item, p, nameSize, lineSize, maxLines = 1 }) {
  const r = nameSize * 0.24;
  ctx.beginPath();
  ctx.arc(x + r, y + nameSize * 0.52, r, 0, Math.PI * 2);
  ctx.fillStyle = tintOf(item.chapter);
  ctx.fill();
  ctx.strokeStyle = rgba(tokens.color.surfaceSolid, 0.9);
  ctx.lineWidth = 2;
  ctx.stroke();
  const tx = x + r * 2 + nameSize * 0.45;
  const tw = w - (tx - x);
  const nm = fit(ctx, item.name, { face: "display", weight: 600, max: nameSize, min: nameSize * 0.75, width: tw, maxLines: 1 });
  font(ctx, "display", 600, nm.size);
  lines(ctx, nm.lines, tx, y + nm.size * 0.82, { lh: nm.size, color: p.ink });
  let end = y + nameSize * 1.1;
  if (item.line) {
    const ln = fit(ctx, item.line, { face: "text", weight: 500, max: lineSize, min: lineSize * 0.78, width: tw, maxLines });
    font(ctx, "text", 500, ln.size);
    end = lines(ctx, ln.lines, tx, end + ln.size * 0.9, { lh: ln.size * 1.3, color: p.ink2 });
  }
  return end;
}

// ---------------------------------------------------------------- the wordmark

let wordmark = null;
function loadWordmark() {
  if (wordmark) return wordmark;
  wordmark = new Promise((resolve) => {
    if (typeof Image === "undefined") { resolve(null); return; }
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    const base = (import.meta.env && import.meta.env.BASE_URL) || "./";
    img.src = `${base}assets/mirrormii-wordmark.svg`;
  });
  return wordmark;
}

// The canon world on the card (LAUNCH-SPEC 25 item 1): the room the World Mirror looks into, the mirror's opal frame
// render, Genii's island by day and by night behind it, and a still of our own three.js Genii (qa/capture-genii.mjs).
// Loaded once, in parallel with the fonts; anything that fails or is late (1.5 s) is simply left out (the code-drawn
// opal frame and a plain field stand in), so the card always draws, and the tests' recording canvas never sees an image.
const worldArt = { inside: null, frame: null, hero: null, night: null, genii: null };
let worldLoading = null;
function loadWorld(timeout = 1500) {
  if (!worldLoading) {
    worldLoading = new Promise((resolve) => {
      if (typeof Image === "undefined") { resolve(worldArt); return; }
      const base = (import.meta.env && import.meta.env.BASE_URL) || "./";
      const files = {
        inside: "island/mirror-inside-720.webp",
        frame: "island/mirror-frame-900.webp",
        hero: "island/hero-portrait-1080.webp",
        night: "island/hero-night-1080.webp",
        genii: "island/genii-still.png",
      };
      let left = Object.keys(files).length;
      const done = () => { left -= 1; if (left === 0) resolve(worldArt); };
      for (const [key, file] of Object.entries(files)) {
        const img = new Image();
        img.decoding = "async";
        img.onload = () => { worldArt[key] = img; done(); };
        img.onerror = done;
        img.src = `${base}assets/${file}`;
      }
    });
  }
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(worldArt), timeout); });
  return Promise.race([worldLoading, late]).finally(() => clearTimeout(timer));
}

// Light behind the mirror: a wide bloom in the brand violet with warm and cool edges.
function aura(ctx, cx, cy, r, p) {
  const night = p.dark;
  glow(ctx, cx, cy, r * 1.15, night ? N.violet : C.violet300, night ? 0.42 : 0.4);
  glow(ctx, cx - r * 0.5, cy + r * 0.35, r * 0.75, tokens.chapterTint[3].tint, night ? 0.18 : 0.22);
  glow(ctx, cx + r * 0.5, cy - r * 0.3, r * 0.75, tokens.chapterTint[1].tint, night ? 0.18 : 0.22);
}

// Genii's island behind everything, cover-fit to the card (the render's own mirror, at 49.2% x 40.7%, lands behind
// the card's mirror), under a veil that keeps the lettering readable. Night cards use the night render.
function drawIslandBackdrop(ctx, W, H, p) {
  const img = (p.dark ? worldArt.night : worldArt.hero) || null;
  if (!img || !ctx.drawImage) return;
  try {
    const k = Math.max(W / img.width, H / img.height);
    const w = img.width * k;
    const h = img.height * k;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
    const veil = ctx.createLinearGradient(0, 0, 0, H);
    const ink = p.dark ? N.n900 : tokens.color.surfaceSolid;
    veil.addColorStop(0, rgba(ink, p.dark ? 0.42 : 0.3));
    veil.addColorStop(0.55, rgba(ink, p.dark ? 0.3 : 0.16));
    veil.addColorStop(0.78, rgba(ink, p.dark ? 0.72 : 0.62));
    veil.addColorStop(1, rgba(ink, p.dark ? 0.9 : 0.86));
    ctx.fillStyle = veil;
    ctx.fillRect(0, 0, W, H);
  } catch { /* the island is decoration */ }
}

// Our own Genii (a still of the three.js scene), standing on the ground at `bottom`.
function drawGenii(ctx, x, bottom, width) {
  const img = worldArt.genii;
  if (!img || !ctx.drawImage) return;
  const h = (width * img.height) / img.width;
  ctx.save();
  glow(ctx, x + width / 2, bottom - h * 0.5, width * 0.9, tokens.color.surfaceSolid, 0.3);
  ctx.save();
  ctx.translate(x + width / 2, bottom - 2);
  ctx.scale(1, 0.18);
  const sh = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.46);
  sh.addColorStop(0, rgba(N.n900, 0.35));
  sh.addColorStop(1, rgba(N.n900, 0));
  ctx.fillStyle = sh;
  ctx.fillRect(-width, -width, width * 2, width * 2);
  ctx.restore();
  ctx.drawImage(img, x, bottom - h, width, h);
  ctx.restore();
}

function drawWordmark(ctx, img, cx, y, width, p) {
  if (!img || typeof document === "undefined") return;
  try {
    const h = Math.round(width * (43 / 265));
    const off = document.createElement("canvas");
    off.width = Math.round(width);
    off.height = h;
    const o = off.getContext("2d");
    o.drawImage(img, 0, 0, off.width, h);
    if (p.dark) {
      o.globalCompositeOperation = "source-in";
      o.fillStyle = rgba(N.ink, 0.9);
      o.fillRect(0, 0, off.width, h);
    }
    ctx.drawImage(off, cx - width / 2, y);
  } catch { /* the wordmark is decoration */ }
}

// ---------------------------------------------------------------- the hero mirror (share card, stories 1 and 2)

// The World Mirror as it stands on story 2 (GDD v0.2 section 3.4): the oval glass showing the room it looks into, every
// shard rebuilt in clear glass with an opal edge, the opal frame render on its marble plinth, and a soft scrim inside
// the glass behind the lettering so the title reads at feed size while the glass stays glass around it.
// `x, y, w` are the glass box (the frame and plinth reach beyond it: MIRROR.frame, in glass units).
function cellBox(cell) {
  const xs = cell.points.map((q) => q[0]);
  const ys = cell.points.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// Where the lettering sits in the glass (decision 1a): one title, the people archetype, over one story line that merges
// both halves, with a short opal stroke between them. The block is centered where the oval is widest, so the scrim can
// be drawn under it before the text goes on top.
function titleLayout(ctx, { x, y, w, h, title }) {
  const k = w / 600;
  const name = fit(ctx, (title && title.name) || "", { face: "display", weight: 600, max: 132 * k, min: 64 * k, width: w - 110 * k, maxLines: 2 });
  const line = title && title.line ? fit(ctx, title.line, { face: "display", weight: 450, max: 52 * k, min: 40 * k, width: w - 120 * k, maxLines: 4 }) : null;
  const ruleGap = 40 * k;
  const rule = 5 * k;
  const lineGap = 34 * k;
  const nameH = name.lines.length * name.size * 1.02;
  const lineH = line ? line.lines.length * line.size * 1.3 : 0;
  const height = nameH + (line ? ruleGap + rule + lineGap + lineH : 0);
  const top = y + h * 0.48 - height / 2;
  return { k, name, line, ruleGap, rule, lineGap, top, panes: [{ top, height }] };
}

// The code-drawn opal frame and plinth (glass units): the frame render stands in front of it when it has loaded.
function drawOpalFrame(ctx) {
  const ring = MIRROR.ring;
  const marble = (y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, OPAL.marble.hi); g.addColorStop(1, OPAL.marble.lo); return g; };
  const disc = (cy, rx, ry, h, top, side) => {
    ctx.fillStyle = side;
    ctx.beginPath(); ctx.ellipse(50, cy + h, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = marble(cy, cy + h);
    ctx.fillRect(50 - rx, cy, rx * 2, h);
    ctx.fillStyle = top;
    ctx.beginPath(); ctx.ellipse(50, cy, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  };
  disc(224, 79.5, 8, 16, OPAL.marble.top, OPAL.marble.side);
  disc(207, 68, 7, 12, OPAL.marble.top2, OPAL.marble.side2);
  const g = ctx.createLinearGradient(-ring, -ring, 100 + ring, 200 + ring);
  OPAL.ring.forEach((c, i) => g.addColorStop(i / (OPAL.ring.length - 1), c));
  const outline = path(geometry.archPath(100 + ring, 200 + ring));
  if (outline) {
    ctx.save();
    ctx.translate(-ring / 2, -ring / 2);
    ctx.strokeStyle = g;
    ctx.lineWidth = ring - 1;
    ctx.stroke(outline);
    ctx.restore();
  }
}

export function drawHeroMirror(ctx, { x, y, w, mirror, p, layout = null, fog = 0 }) {
  const s = w / MIRROR.w;
  const h = MIRROR.h * s;
  const F = MIRROR.frame;
  const arch = path(geometry.archPath(MIRROR.w, MIRROR.h));
  const bleed = path(geometry.archPath(MIRROR.w + 3, MIRROR.h + 3));
  const { filled, cells } = mosaicOf(mirror);
  const night = p.dark;
  const white = tokens.color.surfaceSolid;
  glow(ctx, x + w / 2, y + h * 0.46, w * 1.3, night ? N.violet : C.violet300, night ? 0.4 : 0.42);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const frameImg = worldArt.frame && ctx.drawImage ? worldArt.frame : null;
  // A soft shadow on the ground under the plinth.
  ctx.save();
  ctx.translate(50, MIRROR.bottom - 2);
  ctx.scale(1, 0.12);
  const floor = ctx.createRadialGradient(0, 0, 0, 0, 0, 96);
  floor.addColorStop(0, rgba(N.n900, night ? 0.6 : 0.28));
  floor.addColorStop(1, rgba(N.n900, 0));
  ctx.fillStyle = floor;
  ctx.fillRect(-100, -100, 200, 200);
  ctx.restore();
  if (!frameImg) drawOpalFrame(ctx);
  // The glass: the room the mirror looks into, cropped to the oval.
  ctx.save();
  if (bleed) { ctx.translate(-1.5, -1.5); ctx.clip(bleed); ctx.translate(1.5, 1.5); }
  const base = ctx.createLinearGradient(0, 0, 0, MIRROR.h);
  base.addColorStop(0, OPAL.glass[0]);
  base.addColorStop(0.55, OPAL.glass[1]);
  base.addColorStop(1, OPAL.glass[2]);
  ctx.fillStyle = base;
  ctx.fillRect(-2, -2, MIRROR.w + 4, MIRROR.h + 4);
  const room = worldArt.inside && ctx.drawImage ? worldArt.inside : null;
  if (room) {
    const sw = room.height * (MIRROR.w / MIRROR.h);
    ctx.drawImage(room, (room.width - sw) * 0.58, 0, sw, room.height, -2, -2, MIRROR.w + 4, MIRROR.h + 4);
  }
  // A light tint, so the lettering has something to stand on at night.
  ctx.fillStyle = rgba(N.n900, night ? 0.22 : 0.05);
  ctx.fillRect(0, 0, MIRROR.w, MIRROR.h);
  // Shards: earned ones clear with an opal edge, missing ones frosted.
  const edge = ctx.createLinearGradient(0, 0, MIRROR.w, MIRROR.h);
  OPAL.edge.forEach((c, i) => edge.addColorStop(i / 3, c));
  ctx.lineJoin = "round";
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const shard = filled[i];
    const d = path(cell.path);
    if (!d) continue;
    if (!shard) {
      ctx.fillStyle = rgba(white, night ? 0.5 : 0.62);
      ctx.fill(d);
      continue;
    }
    if (cell.points) {
      const [x0, y0, x1, y1] = cellBox(cell);
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, rgba(white, 0.3));
      g.addColorStop(0.45, rgba(white, 0.02));
      g.addColorStop(1, rgba(white, 0.12));
      ctx.fillStyle = g;
      ctx.fill(d);
    }
    ctx.globalAlpha = shard.skipped ? 0.2 : 0.42;
    ctx.strokeStyle = edge;
    ctx.lineWidth = 0.45;
    ctx.stroke(d);
    ctx.globalAlpha = 1;
  }
  // Scrims: a soft dark (Night) or light (Day) zone behind each block of lettering.
  if (layout) {
    for (const pane of layout.panes) {
      const cy = (pane.top + pane.height / 2 - y) / s;
      const ry = (pane.height / 2) / s + 14;
      ctx.save();
      ctx.translate(50, cy);
      ctx.scale(1, ry / 58);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
      const ink = night ? N.n900 : white;
      sg.addColorStop(0, rgba(ink, night ? 0.86 : 0.9));
      sg.addColorStop(0.6, rgba(ink, night ? 0.7 : 0.74));
      sg.addColorStop(1, rgba(ink, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(-60, -60, 120, 120);
      ctx.restore();
    }
  }
  // Genii's light high in the glass, and one specular sweep.
  const inner = ctx.createRadialGradient(50, 40, 0, 50, 40, 40);
  inner.addColorStop(0, rgba(white, night ? 0.4 : 0.55));
  inner.addColorStop(1, rgba(white, 0));
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, MIRROR.w, MIRROR.h);
  ctx.save();
  ctx.rotate((-20 * Math.PI) / 180);
  const sweep = ctx.createLinearGradient(-30, 0, 10, 0);
  sweep.addColorStop(0, rgba(white, 0));
  sweep.addColorStop(0.5, rgba(white, night ? 0.14 : 0.26));
  sweep.addColorStop(1, rgba(white, 0));
  ctx.fillStyle = sweep;
  ctx.fillRect(-30, -40, 40, 300);
  ctx.restore();
  if (fog > 0) {
    ctx.fillStyle = rgba(night ? N.ink2 : white, 0.72 * fog);
    ctx.fillRect(0, 0, MIRROR.w, MIRROR.h);
  }
  ctx.restore();
  ctx.strokeStyle = rgba(white, 0.7);
  ctx.lineWidth = 0.6;
  if (arch) ctx.stroke(arch);
  if (frameImg) {
    try { ctx.drawImage(frameImg, F.x, F.y, F.w, F.h); } catch { drawOpalFrame(ctx); }
  }
  ctx.restore();
  return { h, s, foot: y + MIRROR.bottom * s };
}

// The lettering: the title at the largest size that fits two lines, the opal stroke, then the story line, upright.
function drawTitleText(ctx, { x, w, layout, p }) {
  const { k, name, line } = layout;
  const ink = p.dark ? N.ink : C.ink;
  const cx = x + w / 2;
  let yy = layout.top;
  ctx.save();
  if (p.dark) { ctx.shadowColor = rgba(N.n900, 0.9); ctx.shadowBlur = 26 * k; }
  font(ctx, "display", 600, name.size);
  lines(ctx, name.lines, cx, yy + name.size * 0.8, { lh: name.size * 1.02, align: "center", color: ink });
  ctx.restore();
  yy += name.lines.length * name.size * 1.02;
  if (!line) return;
  yy += layout.ruleGap;
  const rw = 70 * k;
  const g = ctx.createLinearGradient(cx - rw / 2, 0, cx + rw / 2, 0);
  g.addColorStop(0, tintOf(3));
  g.addColorStop(0.5, N.violet);
  g.addColorStop(1, tintOf(1));
  ctx.fillStyle = g;
  roundRect(ctx, cx - rw / 2, yy, rw, layout.rule, layout.rule / 2);
  ctx.fill();
  yy += layout.rule + layout.lineGap;
  ctx.save();
  if (p.dark) { ctx.shadowColor = rgba(N.n900, 0.95); ctx.shadowBlur = 18 * k; }
  font(ctx, "display", 450, line.size);
  lines(ctx, line.lines, cx, yy + line.size * 0.86, { lh: line.size * 1.3, align: "center", color: ink });
  ctx.restore();
}

// The whole mirror with the title: layout, glass, lettering. Returns { h, foot }: the glass height and the y of the
// plinth's foot. With no title the mirror stands empty (story 1's image).
export function drawNamedMirror(ctx, { x, y, w, title = null, mirror, p, fog = 0 }) {
  const h = w * (MIRROR.h / MIRROR.w);
  const layout = title && title.name ? titleLayout(ctx, { x, y, w, h, title }) : null;
  const { foot } = drawHeroMirror(ctx, { x, y, w, mirror, p, layout, fog });
  if (layout) drawTitleText(ctx, { x, w, layout, p });
  return { h, foot };
}

// One trait for the card: a glass pill with the chapter dot and the name, big enough to read at story size. Returns
// the pill's width for layout.
function pillWidth(ctx, name, size) {
  font(ctx, "display", 600, size);
  return ctx.measureText(name || "").width + size * 1.9;
}
function drawPill(ctx, { cx, y, item, p, size, maxW }) {
  const nm = fit(ctx, item.name, { face: "display", weight: 600, max: size, min: size * 0.7, width: maxW - size * 1.9, maxLines: 1 });
  const w = Math.min(maxW, pillWidth(ctx, nm.lines[0] || "", nm.size));
  const h = nm.size * 1.9;
  const x = cx - w / 2;
  roundRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = p.dark ? rgba(N.n900, 0.8) : rgba(tokens.color.surfaceSolid, 0.92);
  ctx.fill();
  ctx.strokeStyle = p.dark ? rgba(N.ink, 0.5) : rgba(C.violetText, 0.35);
  ctx.lineWidth = 3;
  ctx.stroke();
  const r = nm.size * 0.22;
  ctx.beginPath();
  ctx.arc(x + nm.size * 0.62 + r, y + h / 2, r, 0, Math.PI * 2);
  ctx.fillStyle = tintOf(item.chapter);
  ctx.fill();
  font(ctx, "display", 600, nm.size);
  lines(ctx, nm.lines.slice(0, 1), x + nm.size * 0.62 + r * 2 + nm.size * 0.36, y + h / 2 + nm.size * 0.34, { lh: 0, color: p.ink });
  return h;
}

// ---------------------------------------------------------------- the mirror card

// The core traits as keyword pills in centered rows (round 3, LAUNCH-SPEC 24 item 2): as many as fit in `maxRows`
// rows at a size that reads in a feed, in rank order; the rest stay on the traits screen. Returns the bottom edge.
function drawPillRows(ctx, { items, y, W, p, size, maxW, maxRows = 2, gap = 20, rowGap = 20 }) {
  const rows = [];
  let row = [];
  let used = 0;
  for (const it of items) {
    const w = Math.min(maxW, pillWidth(ctx, it.name, size));
    if (row.length && used + gap + w > maxW) { rows.push(row); row = []; used = 0; }
    if (rows.length >= maxRows) break;
    used += (row.length ? gap : 0) + w;
    row.push({ it, w });
  }
  if (row.length && rows.length < maxRows) rows.push(row);
  const h = size * 1.9;
  let top = y;
  for (const r of rows) {
    const total = r.reduce((t, x) => t + x.w, 0) + gap * (r.length - 1);
    let x = (W - total) / 2;
    for (const { it, w } of r) { drawPill(ctx, { cx: x + w / 2, y: top, item: it, p, size, maxW }); x += w + gap; }
    top += h + rowGap;
  }
  return top - rowGap;
}

// The share card in either format and theme. `card` is the share projection (story-data.js buildStories().share).
// Simplified for story size (VISUAL-JUDGE-CODEX-R2 screen 13): the completed mirror with the one title and its story
// line (decision 1a; the day-to-day half stays in the share text), as large as the
// card allows; the core traits as keyword pills in up to two rows (their evidence stays on the traits screen); the
// invite; the address.
export const SHARE_TRAITS = 6;
export function drawShareCard(ctx, card, { format = "story", theme = "night", lightTheme = "day", wordmarkImage = null } = {}) {
  const { w: W, h: H } = FORMATS[format] || FORMATS.story;
  const p = paletteFor(theme === "day" ? "light" : "night", lightTheme);
  ctx.textBaseline = "alphabetic";
  background(ctx, W, H, p);
  // Older projections carry only the two names: the people half becomes the title with its defining line.
  const title = card.title && card.title.name ? card.title : card.names && card.names[0] ? { name: card.names[0].name, line: card.names[0].define || "" } : null;
  const items = (card.tags || []).filter((t) => t && t.name).slice(0, SHARE_TRAITS);
  drawIslandBackdrop(ctx, W, H, p);
  if (format === "post") {
    drawWordmark(ctx, wordmarkImage, W / 2, 30, 170, p);
    const aw = 340;
    const ay = 104;
    aura(ctx, W / 2, ay + aw, aw * 1.5, p);
    const { foot } = drawNamedMirror(ctx, { x: (W - aw) / 2, y: ay, w: aw, title, mirror: card.mirror, p });
    drawGenii(ctx, W / 2 + aw * 1.12, foot + 4, 128);
    drawPillRows(ctx, { items, y: foot + 26, W, p, size: 34, maxW: W - 100, maxRows: 2, gap: 16, rowGap: 14 });
    font(ctx, "display", 420, 48);
    lines(ctx, [card.invite || ""], W / 2, H - 72, { lh: 0, align: "center", color: p.accent });
    font(ctx, "text", 600, 24);
    lines(ctx, [card.url || ""], W / 2, H - 28, { lh: 0, align: "center", color: p.ink3 });
    return;
  }
  drawWordmark(ctx, wordmarkImage, W / 2, 64, 220, p);
  const aw = 520;
  const ay = 196;
  aura(ctx, W / 2, ay + aw, aw * 1.4, p);
  const { foot } = drawNamedMirror(ctx, { x: (W - aw) / 2, y: ay, w: aw, title, mirror: card.mirror, p });
  drawGenii(ctx, W - 176 - 44, foot + 8, 176);
  drawPillRows(ctx, { items, y: foot + 34, W, p, size: 46, maxW: W - 140, maxRows: 2 });
  font(ctx, "display", 420, 58);
  lines(ctx, [card.invite || ""], W / 2, 1800, { lh: 0, align: "center", color: p.accent });
  font(ctx, "text", 600, 28);
  lines(ctx, [card.url || ""], W / 2, 1876, { lh: 0, align: "center", color: p.ink3 });
}

// ---------------------------------------------------------------- story-screen images

function drawStoryBody(ctx, spec, p, W, H) {
  const X = 110;
  const width = W - X * 2;
  let y = 250;
  const kicker = (value, at = y) => { if (value) tracked(ctx, value, W / 2, at, { size: 28, color: p.accent, align: "center", track: 0.14 }); };
  switch (spec.id) {
    case "intro":
    case "names": {
      const aw = 480;
      const top = 236;
      const { foot } = drawNamedMirror(ctx, { x: (W - aw) / 2, y: top, w: aw, title: spec.id === "names" ? spec.title : null, mirror: spec.mirror, p, fog: spec.id === "intro" ? 1 : 0 });
      y = foot + 70;
      if (spec.id === "intro" && spec.title) y = block(ctx, spec.title, W / 2, y, { face: "display", weight: 600, max: 80, min: 56, width, maxLines: 2, color: p.ink, align: "center", lh: 1.08 });
      // Story 2's rows under the plinth, as on the screen: the day-to-day half, label left and name right.
      for (const r of spec.rows || []) {
        const rx = 190;
        const rw = W - rx * 2;
        ctx.fillStyle = rgba(p.dark ? N.ink : C.ink, 0.16);
        ctx.fillRect(rx, y - 46, rw, 2);
        font(ctx, "text", 600, 30);
        lines(ctx, [r.label], rx + 4, y + 4, { lh: 0, color: p.ink2 });
        const v = fit(ctx, r.value, { face: "display", weight: 600, max: 46, min: 34, width: rw - 260, maxLines: 1 });
        font(ctx, "display", 600, v.size);
        lines(ctx, v.lines, rx + 260, y + 6, { lh: 0, color: p.ink });
        y += 96;
      }
      for (const l of spec.lines || []) block(ctx, l, W / 2, y, { face: "display", weight: 420, max: 40, min: 32, width, maxLines: 2, color: p.ink2, align: "center" });
      return;
    }
    case "read": {
      kicker(spec.kicker, 330);
      y = 420;
      for (const t of spec.tablets || []) {
        const fitted = fit(ctx, t.line, { face: "display", weight: 560, max: 52, min: 40, width: width - 150, maxLines: 4 });
        const body = t.body ? fit(ctx, t.body, { face: "text", weight: 450, max: 34, min: 28, width: width - 112, maxLines: 6 }) : null;
        const bh = fitted.lines.length * fitted.size * 1.22 + (body ? body.lines.length * body.size * 1.4 + 30 : 0) + 110;
        ctx.fillStyle = p.glass;
        roundRect(ctx, X, y, width, bh, 56);
        ctx.fill();
        ctx.strokeStyle = rgba(tokens.color.surfaceSolid, p.dark ? 0.2 : 0.9);
        ctx.lineWidth = 2;
        ctx.stroke();
        if (t.mark && t.mark.kind === "sigil") drawSigil(ctx, t.mark.code, X + width - 100, y + 36, 56, p.accent);
        font(ctx, "display", 560, fitted.size);
        let yy = lines(ctx, fitted.lines, X + 56, y + 55 + fitted.size * 0.82, { lh: fitted.size * 1.22, color: p.ink });
        if (body) { font(ctx, "text", 450, body.size); lines(ctx, body.lines, X + 56, yy + 20 + body.size * 0.5, { lh: body.size * 1.4, color: p.ink2 }); }
        y += bh + 36;
      }
      return;
    }
    case "map": {
      // The drama stats (2026-09-30): four blocks, each its abbreviation and score in an opal-rimmed oval (the World
      // Mirror's shape), the name and the short line beside it. The scores are the only numbers drawn here.
      kicker(spec.kicker, 300);
      y = block(ctx, spec.title, W / 2, 340, { face: "display", weight: 600, max: 72, min: 54, width, maxLines: 2, color: p.ink, align: "center" }) + 70;
      (spec.blocks || []).forEach((b, i) => {
        const textX = X + 230;
        const textW = width - 260;
        const line = fit(ctx, b.line || "", { face: "display", weight: 560, max: 42, min: 34, width: textW, maxLines: 3 });
        const h = Math.max(250, 96 + line.lines.length * line.size * 1.22 + 40);
        roundRect(ctx, X, y, width, h, 60);
        ctx.fillStyle = i === 0 ? rgba(N.violet, 0.26) : rgba(N.ink, 0.07);
        ctx.fill();
        ctx.lineWidth = i === 0 ? 3 : 2;
        ctx.strokeStyle = i === 0 ? rgba(N.violet, 0.85) : rgba(N.ink, 0.16);
        ctx.stroke();
        if (i === 0) glow(ctx, X + 110, y + h / 2, 150, N.violet, 0.32);
        // The oval: an opal rim around a night glass well.
        const cx = X + 110;
        const cy = y + h / 2;
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 82, 102, 0, 0, Math.PI * 2);
        const rim = ctx.createLinearGradient(cx - 82, cy - 102, cx + 82, cy + 102);
        ["#F6D3E6", "#D9D2FF", "#BFE3F7", "#D8F3E6", "#F7E7C4", "#F2C9E3"].forEach((c, k) => rim.addColorStop(k / 5, c));
        ctx.fillStyle = rim;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(cx, cy, 76, 96, 0, 0, Math.PI * 2);
        ctx.fillStyle = N.n900;
        ctx.fill();
        ctx.restore();
        tracked(ctx, b.abbr, cx, cy - 34, { size: 24, weight: 800, color: N.violet, align: "center", track: 0.12 });
        font(ctx, "display", 900, 92);
        lines(ctx, [String(b.score)], cx, cy + 52, { lh: 0, align: "center", color: N.ink });
        // The name, the tag for the most surprising stat, then the line.
        let ty = y + 70;
        tracked(ctx, b.name, textX, ty, { size: 28, weight: 700, color: N.violet, track: 0.02, upper: false });
        if (b.surprise) {
          font(ctx, "text", 700, 24);
          const nw = ctx.measureText(String(b.name)).width + String(b.name).length * 0.56;
          const tw = ctx.measureText(b.surprise).width + 32;
          roundRect(ctx, textX + nw + 18, ty - 30, tw, 40, 20);
          ctx.fillStyle = "#F2A7C3";
          ctx.fill();
          lines(ctx, [b.surprise], textX + nw + 34, ty - 2, { lh: 0, color: N.n900 });
        }
        ty += 30;
        font(ctx, "display", 560, line.size);
        lines(ctx, line.lines, textX, ty + line.size * 0.9, { lh: line.size * 1.22, color: N.ink });
        y += h + 30;
      });
      return;
    }
    case "knows": {
      kicker(spec.kicker, 280);
      y = block(ctx, spec.title, W / 2, 320, { face: "display", weight: 600, max: 70, min: 52, width, maxLines: 2, color: p.ink, align: "center" }) + 60;
      (spec.findings || []).forEach((f, i) => {
        const top = i === 0;
        const size = top ? 44 : 34;
        const fitted = fit(ctx, f.line, { face: "display", weight: 560, max: size, min: size * 0.8, width: width - 170, maxLines: top ? 5 : 3 });
        const bh = fitted.lines.length * fitted.size * 1.25 + 96;
        roundRect(ctx, X, y, width, bh, 40);
        ctx.fillStyle = rgba(N.ink, top ? 0.2 : 0.1);
        ctx.fill();
        ctx.strokeStyle = rgba(N.ink, top ? 0.6 : 0.25);
        ctx.lineWidth = 2;
        ctx.stroke();
        // The clarity cue: three rings, lit from the center out.
        const gx = X + 70;
        const gy = y + bh / 2;
        [3, 2, 1].forEach((ring) => {
          ctx.beginPath();
          ctx.arc(gx, gy, 12 + ring * 11, 0, Math.PI * 2);
          ctx.fillStyle = f.level >= ring ? rgba(N.ink, 0.25 + 0.2 * (3 - ring)) : rgba(N.ink, 0.06);
          ctx.fill();
        });
        tracked(ctx, f.topic, X + 140, y + 52, { size: 22, color: p.ink2, track: 0.12 });
        tracked(ctx, f.tier, X + width - 36, y + 52, { size: 20, color: p.ink, align: "right", track: 0.06 });
        font(ctx, "display", 560, fitted.size);
        lines(ctx, fitted.lines, X + 140, y + 70 + fitted.size * 0.9, { lh: fitted.size * 1.25, color: p.ink });
        y += bh + 20;
      });
      return;
    }
    case "rooms": {
      kicker(spec.kicker, 300);
      y = block(ctx, spec.title, W / 2, 340, { face: "display", weight: 600, max: 72, min: 54, width, maxLines: 2, color: p.ink, align: "center" }) + 70;
      for (const r of spec.rows || []) {
        const fitted = fit(ctx, r.line, { face: "text", weight: 500, max: 36, min: 30, width: width - 200, maxLines: 4 });
        const bh = fitted.lines.length * fitted.size * 1.35 + 120;
        roundRect(ctx, X, y, width, bh, 48);
        ctx.fillStyle = p.glass;
        ctx.fill();
        glow(ctx, X + 90, y + bh / 2, 90, tintOf(r.chapter), 0.9);
        ctx.beginPath();
        ctx.arc(X + 90, y + bh / 2, 40, 0, Math.PI * 2);
        ctx.fillStyle = tintOf(r.chapter);
        ctx.fill();
        font(ctx, "display", 600, 46);
        lines(ctx, [r.room], X + 180, y + 74, { lh: 0, color: p.ink });
        font(ctx, "text", 500, fitted.size);
        lines(ctx, fitted.lines, X + 180, y + 110 + fitted.size * 0.4, { lh: fitted.size * 1.35, color: p.ink2 });
        y += bh + 26;
      }
      return;
    }
    case "calls": {
      kicker(spec.kicker, 280);
      if (spec.called > 0) {
        font(ctx, "display", 900, 180);
        const big = String(spec.exact);
        const bw = ctx.measureText(big).width;
        font(ctx, "display", 900, 72);
        const tail = ` of ${spec.called}`;
        const tw = ctx.measureText(tail).width;
        const x0 = W / 2 - (bw + tw) / 2;
        font(ctx, "display", 900, 180);
        lines(ctx, [big], x0, 480, { lh: 0, color: p.ink });
        font(ctx, "display", 900, 72);
        lines(ctx, [tail], x0 + bw, 480, { lh: 0, color: p.ink });
        font(ctx, "display", 420, 40);
        lines(ctx, [spec.of || ""], W / 2, 548, { lh: 0, align: "center", color: p.ink2 });
      }
      y = block(ctx, spec.title, W / 2, 610, { face: "display", weight: 600, max: 62, min: 48, width, maxLines: 2, color: p.ink, align: "center" }) + 60;
      const cw = (width - 30) / 2;
      (spec.panes || []).forEach((pn, i) => {
        const cx = X + (i % 2) * (cw + 30);
        const cy = y + Math.floor(i / 2) * 170;
        roundRect(ctx, cx, cy, cw, 150, 36);
        ctx.fillStyle = pn.status === "hit" ? rgba(N.ink, 0.26) : rgba(N.ink, 0.08);
        ctx.fill();
        ctx.strokeStyle = rgba(N.ink, pn.status === "hit" ? 0.7 : 0.22);
        ctx.lineWidth = 2;
        ctx.stroke();
        const t = fit(ctx, pn.topic || "", { face: "text", weight: 600, max: 28, min: 22, width: cw - 48, maxLines: 2 });
        font(ctx, "text", 600, t.size);
        lines(ctx, t.lines, cx + 26, cy + 46, { lh: t.size * 1.2, color: p.ink });
        tracked(ctx, pn.label, cx + 26, cy + 124, { size: 20, color: pn.status === "hit" ? p.ink : p.ink2, track: 0.08 });
      });
      return;
    }
    case "traits": {
      kicker(spec.kicker, 300);
      y = block(ctx, spec.title, W / 2, 340, { face: "display", weight: 600, max: 76, min: 56, width, maxLines: 2, color: p.ink, align: "center" }) + 80;
      for (const it of spec.charms || []) y = drawCharm(ctx, { x: X, y, w: width, item: it, p, nameSize: 52, lineSize: 34, maxLines: 2 }) + 46;
      for (const l of spec.lines || []) block(ctx, l, W / 2, y, { face: "text", weight: 500, max: 40, min: 32, width, maxLines: 4, color: p.ink2, align: "center" });
      return;
    }
    case "insight": {
      kicker(spec.kicker, 560);
      const end = block(ctx, spec.belief, W / 2, 640, { face: "display", weight: 600, max: 78, min: 56, width, maxLines: 4, color: p.ink, align: "center", lh: 1.12 });
      const water = Math.max(end + 50, 1000);
      ctx.fillStyle = rgba(N.ink, 0.7);
      ctx.fillRect(X + 80, water, width - 160, 2);
      if (spec.behavior) block(ctx, spec.behavior, W / 2, water + 60, { face: "display", weight: 460, max: 60, min: 44, width, maxLines: 4, color: p.ink, align: "center", lh: 1.2 });
      return;
    }
    case "stings": {
      font(ctx, "text", 700, 26);
      const badge = String(spec.badge || "").toUpperCase();
      const bw = ctx.measureText(badge).width + 90;
      ctx.fillStyle = rgba(N.n700, 0.9);
      roundRect(ctx, (W - bw) / 2, 330, bw, 64, 32);
      ctx.fill();
      tracked(ctx, badge, W / 2, 372, { size: 24, color: N.ink2, align: "center", track: 0.12 });
      y = block(ctx, spec.title, W / 2, 470, { face: "display", weight: 600, max: 76, min: 56, width, maxLines: 2, color: p.ink, align: "center" }) + 80;
      for (const q of spec.quotes || []) {
        ctx.fillStyle = rgba(N.ink2, 0.7);
        ctx.fillRect(X, y, 56, 2);
        y = block(ctx, q, X, y + 36, { face: "display", weight: 460, max: 50, min: 40, width, maxLines: 5, color: p.ink, lh: 1.3 }) + 60;
      }
      return;
    }
    case "app": {
      kicker(spec.kicker, 520);
      y = block(ctx, spec.title, W / 2, 580, { face: "display", weight: 600, max: 80, min: 60, width, maxLines: 3, color: p.ink, align: "center", lh: 1.08 }) + 60;
      for (const l of spec.lines || []) y = block(ctx, l, W / 2, y, { face: "text", weight: 450, max: 42, min: 34, width, maxLines: 4, color: p.ink2, align: "center", lh: 1.4 }) + 30;
      return;
    }
    default:
  }
}

// One story screen as a 1080 x 1920 image.
export function drawStory(ctx, spec, { lightTheme = "day", wordmarkImage = null } = {}) {
  if (spec && spec.card) { drawShareCard(ctx, spec.card, { format: "story", theme: "night", wordmarkImage }); return; }
  const { w: W, h: H } = FORMATS.story;
  const p = paletteFor(spec.look || "night", lightTheme);
  ctx.textBaseline = "alphabetic";
  background(ctx, W, H, p);
  if (spec.id === "intro" || spec.id === "names") drawIslandBackdrop(ctx, W, H, p);
  drawWordmark(ctx, wordmarkImage, W / 2, 118, 200, p);
  drawStoryBody(ctx, spec, p, W, H);
}

// ---------------------------------------------------------------- output

// Wait for Satoshi before drawing (1.5 s at most; after that the system fallback draws). One variable file covers
// every weight, so loading the weights the images use is enough.
export async function fontsReady(timeout = 1500) {
  if (typeof document === "undefined" || !document.fonts || !document.fonts.load) return false;
  const faces = [500, 600, 700, 800, 900].map((w) => `${w} 48px ${FAMILY}`);
  let timer;
  const late = new Promise((resolve) => { timer = setTimeout(() => resolve(false), timeout); });
  const ok = await Promise.race([Promise.all(faces.map((f) => document.fonts.load(f))).then(() => true, () => false), late]);
  clearTimeout(timer);
  return ok;
}

export const currentLightTheme = () => {
  try { return document.documentElement.dataset.theme === "dusk" ? "dusk" : "day"; } catch { return "day"; }
};

function newCanvas(format) {
  const { w, h } = FORMATS[format] || FORMATS.story;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

// Draw the mirror card into a canvas (the live preview on story 8 uses the same call).
export async function renderShareCard(card, { format = "story", theme = "night", canvas = null } = {}) {
  const [, img] = await Promise.all([fontsReady(), loadWordmark(), loadWorld()]);
  const c = canvas || newCanvas(format);
  const { w, h } = FORMATS[format] || FORMATS.story;
  if (c.width !== w) c.width = w;
  if (c.height !== h) c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Image export unavailable");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, w, h);
  drawShareCard(ctx, card, { format, theme, lightTheme: currentLightTheme(), wordmarkImage: img });
  return c;
}

export async function renderStoryImage(spec) {
  const [, img] = await Promise.all([fontsReady(), loadWordmark(), loadWorld()]);
  const c = newCanvas("story");
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Image export unavailable");
  drawStory(ctx, spec, { lightTheme: currentLightTheme(), wordmarkImage: img });
  return c;
}

const toBlob = (canvas) => new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Image export unavailable"))), "image/png"));

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Web Share with the PNG when the browser can share files, a download otherwise. `share: false` always downloads
// (the stings screen: saved for the owner, never shared). Resolves "shared", "saved" or "cancelled".
export async function deliverImage(canvas, filename, { share = true, text = "" } = {}) {
  const blob = await toBlob(canvas);
  if (share && typeof navigator !== "undefined" && navigator.canShare && typeof File !== "undefined") {
    const file = new File([blob], filename, { type: "image/png" });
    if (navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text }); return "shared"; } catch (e) { if (e && e.name === "AbortError") return "cancelled"; }
    }
  }
  saveBlob(blob, filename);
  return "saved";
}

export async function shareImage(card, { format = "story", theme = "night", share = true } = {}) {
  const canvas = await renderShareCard(card, { format, theme });
  return deliverImage(canvas, format === "post" ? "my-mirror-post.png" : "my-mirror-card.png", { share, text: card.invite || "" });
}

// One story screen as a PNG (share: false keeps it a download).
export async function downloadStoryImage(spec, filename = "my-genii-read.png", { share = false } = {}) {
  const canvas = await renderStoryImage(spec);
  return deliverImage(canvas, filename, { share: share && !spec.private });
}

