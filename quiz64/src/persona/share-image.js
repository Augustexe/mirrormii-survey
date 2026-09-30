// The mirror card and the story-screen images (DESIGN-DIRECTION 5.13), drawn on a canvas in this browser. Nothing is
// uploaded. The art comes from the same geometry the page uses (src/art/geometry.js: the seeded mosaic, the facet,
// the sigils) and the colors from src/system/tokens.js, so the image is the page's mirror, not a lookalike.
// Never drawn on the mirror card: stings, answers, numbers, the guess check, the words the spec keeps off the page.
import { geometry } from "../art/index.js";
import { tokens } from "../system/index.js";

export const FORMATS = Object.freeze({ story: { w: 1080, h: 1920 }, post: { w: 1080, h: 1350 } });
const N = tokens.night;
const C = tokens.color;
const DISPLAY = tokens.fonts.display;
const TEXT = tokens.fonts.text;
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

function font(ctx, face, weight, size, italic = false) {
  ctx.font = `${italic ? "italic " : ""}${weight} ${Math.round(size)}px ${face === "display" ? DISPLAY : TEXT}`;
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
function fit(ctx, value, { face, weight, italic, max, min, width, maxLines, balance = true }) {
  for (let size = max; size >= min; size -= 2) {
    font(ctx, face, weight, size, italic);
    const lines = wrap(ctx, value, width);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= width)) return { size, lines: balance ? balanced(ctx, value, width, lines) : lines };
  }
  font(ctx, face, weight, min, italic);
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

function tracked(ctx, value, x, y, { size, weight = 700, color, align = "left", track = 0.12 }) {
  font(ctx, "text", weight, size);
  const text = String(value || "").toUpperCase();
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
  return { filled, cells: geometry.mosaic(seed, Math.max(40, filled.length), { w: 100, h: 160 }).cells };
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

// Round 3 (LAUNCH-SPEC 24 item 7): the real MirrorMii world on the card. The city from the world style key shows
// through the mirror's stained glass, the mirror stands on the MirrorMii World island, and the CGI glass Genii sits
// beside it. Loaded once, in parallel with the fonts; anything that fails or is late (1.5 s) is simply left out, so
// the card always draws, and the tests' recording canvas never sees an image.
const worldArt = { mirror: null, island: null, genii: null };
let worldLoading = null;
function loadWorld(timeout = 1500) {
  if (!worldLoading) {
    worldLoading = new Promise((resolve) => {
      if (typeof Image === "undefined") { resolve(worldArt); return; }
      const base = (import.meta.env && import.meta.env.BASE_URL) || "./";
      const files = { mirror: "world/mirror-world-526.webp", island: "world/island-1440.webp", genii: "world/genii-480.webp" };
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

// Light behind the mirror: a wide bloom in the brand violet with warm and cool edges, and soft rays from the dome.
function aura(ctx, cx, cy, r, p) {
  const night = p.dark;
  glow(ctx, cx, cy, r * 1.15, night ? N.violet : C.violet300, night ? 0.5 : 0.55);
  glow(ctx, cx - r * 0.5, cy + r * 0.35, r * 0.75, tokens.chapterTint[3].tint, night ? 0.26 : 0.34);
  glow(ctx, cx + r * 0.5, cy - r * 0.3, r * 0.75, tokens.chapterTint[1].tint, night ? 0.26 : 0.34);
  ctx.save();
  ctx.translate(cx, cy - r * 0.35);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + 0.12;
    const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.25);
    g.addColorStop(0, rgba(tokens.color.surfaceSolid, night ? 0.16 : 0.3));
    g.addColorStop(1, rgba(tokens.color.surfaceSolid, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r * 1.25, a, a + 0.1);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

// The island under the mirror's plinth, faded at its cut edges; returns nothing when the image is not there.
function drawIsland(ctx, cx, top, width, alpha = 1) {
  const img = worldArt.island;
  if (!img || !ctx.drawImage || typeof document === "undefined") return;
  const w = Math.round(width);
  const h = Math.round((width * img.height) / img.width);
  try {
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const o = off.getContext("2d");
    o.drawImage(img, 0, 0, w, h);
    // Soft oval mask: the crop's straight left edge and the diorama's rim melt into the card.
    o.globalCompositeOperation = "destination-in";
    o.save();
    o.translate(w / 2, h * 0.44);
    o.scale(1, (h * 0.62) / (w * 0.5));
    const m = o.createRadialGradient(0, 0, 0, 0, 0, w * 0.5);
    m.addColorStop(0, "rgba(0, 0, 0, 1)");
    m.addColorStop(0.74, "rgba(0, 0, 0, 1)");
    m.addColorStop(1, "rgba(0, 0, 0, 0)");
    o.fillStyle = m;
    o.fillRect(-w, -w, w * 2, w * 2);
    o.restore();
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(off, cx - w / 2, top);
    ctx.restore();
  } catch { /* the island is decoration */ }
}

function drawGenii(ctx, x, bottom, width) {
  const img = worldArt.genii;
  if (!img || !ctx.drawImage) return;
  const h = (width * img.height) / img.width;
  ctx.save();
  glow(ctx, x + width / 2, bottom - h * 0.5, width * 0.9, tokens.color.surfaceSolid, 0.35);
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

// The completed mirror at full strength, the way it stands on story 2: silver frame, every shard in its chapter tint,
// the two panes lit differently (people warm, life cool), and a soft scrim inside the glass behind each block of
// lettering so the names read at feed size while the glass stays glass around them (VISUAL-JUDGE top fixes 1 and 2).
const SILVER = ["#EEF0FA", "#C9CCE0"];
const PANE_HUE = { people: { night: "#8A4FB8", day: "#F2A7C3", rim: "#F2A7C3" }, life: { night: "#3D6FC4", day: "#8FB8F2", rim: "#8FB8F2" } };

function cellBox(cell) {
  const xs = cell.points.map((q) => q[0]);
  const ys = cell.points.map((q) => q[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}

// Where the lettering sits in each pane, so the scrims can be drawn under it before the text goes on top. Each block
// is a label pill (the half's sigil and "With your people" / "With your life") over the name.
function paneLayout(ctx, { x, y, w, h, names }) {
  const k = w / 600;
  const [people, life] = names;
  const fitName = (name) => fit(ctx, name || "", { face: "display", weight: 600, max: 124 * k, min: 72 * k, width: w - 96 * k, maxLines: 2 });
  const pill = 66 * k;
  const gap = 30 * k;
  const block = (name) => pill + gap + name.lines.length * name.size * 1.0;
  const up = fitName(people && people.name);
  const low = fitName(life && life.name);
  const upH = block(up);
  const lowH = block(low);
  // Upper pane: the block ends just above the mullion, so the dome stays open glass; lower pane: centered.
  const upTop = y + h * 0.5 - 44 * k - upH;
  const lowTop = y + h * 0.75 - lowH / 2 - 4 * k;
  return {
    k, pill, gap,
    panes: [
      { half: people, which: "people", name: up, top: upTop, height: upH },
      { half: life, which: "life", name: low, top: lowTop, height: lowH },
    ],
  };
}

export function drawHeroMirror(ctx, { x, y, w, mirror, p, layout = null, fog = 0 }) {
  const s = w / 100;
  const h = 160 * s;
  const arch = path(geometry.archPath(100, 160));
  const frame = path(geometry.archPath(110, 165));
  const { filled, cells } = mosaicOf(mirror);
  const night = p.dark;
  // Light behind the mirror.
  glow(ctx, x + w / 2, y + h * 0.42, w * 1.1, night ? N.violet : C.violet300, night ? 0.42 : 0.5);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  // Silver frame, with a soft shadow under it.
  ctx.save();
  ctx.shadowColor = rgba(N.n900, night ? 0.7 : 0.25);
  ctx.shadowBlur = 40 / s;
  ctx.shadowOffsetY = 18 / s;
  const fr = ctx.createLinearGradient(-5, 0, 105, 40);
  fr.addColorStop(0, SILVER[1]);
  fr.addColorStop(0.2, tokens.color.surfaceSolid);
  fr.addColorStop(0.45, SILVER[0]);
  fr.addColorStop(0.65, SILVER[1]);
  fr.addColorStop(0.85, tokens.color.surfaceSolid);
  fr.addColorStop(1, SILVER[1]);
  ctx.fillStyle = fr;
  if (frame) { ctx.translate(-5, -5); ctx.fill(frame); ctx.translate(5, 5); }
  ctx.restore();
  // The glass.
  ctx.save();
  if (arch) ctx.clip(arch);
  const base = ctx.createLinearGradient(0, 0, 0, 160);
  base.addColorStop(0, night ? N.n600 : C.violet100);
  base.addColorStop(1, night ? N.n900 : tokens.color.surfaceSolid);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 100, 160);
  // The real MirrorMii city behind the stained glass (round 3).
  const city = worldArt.mirror && ctx.drawImage ? worldArt.mirror : null;
  if (city) {
    ctx.save();
    ctx.globalAlpha = night ? 0.85 : 0.95;
    ctx.drawImage(city, 0, 0, 100, 160);
    ctx.restore();
  }
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const shard = filled[i];
    const d = path(cell.path);
    if (!d) continue;
    if (shard && cell.points) {
      const [x0, y0, x1, y1] = cellBox(cell);
      const t = tokens.chapterTint[shard.chapter] || tokens.chapterTint[Number(shard.chapter)] || tokens.chapterTint.extras;
      const g = ctx.createLinearGradient(x0, y0, x0 + (x1 - x0) * 0.8, y1);
      g.addColorStop(0, rgba(tokens.color.surfaceSolid, night ? 0.55 : 0.85));
      g.addColorStop(0.45, t.tint);
      g.addColorStop(1, rgba(t.deep, night ? 0.9 : 0.6));
      ctx.globalAlpha = (shard.skipped ? 0.45 : 1) * (night ? 0.94 : 0.9) * (city ? 0.6 : 1);
      ctx.fillStyle = g;
      ctx.fill(d);
    }
  }
  ctx.globalAlpha = 1;
  // Two panes, two characters: people warm above the mullion, life cool below.
  for (const [which, top] of [["people", 0], ["life", 80]]) {
    const hue = PANE_HUE[which][night ? "night" : "day"];
    const pg = ctx.createLinearGradient(0, top, 0, top + 80);
    pg.addColorStop(0, rgba(hue, night ? 0.26 : 0.2));
    pg.addColorStop(1, rgba(hue, night ? 0.42 : 0.3));
    ctx.fillStyle = pg;
    ctx.fillRect(0, top, 100, 80);
  }
  // Crack lines.
  ctx.strokeStyle = rgba(tokens.color.surfaceSolid, night ? 0.55 : 0.85);
  ctx.lineWidth = 0.45;
  ctx.lineJoin = "round";
  for (const cell of cells) { const d = path(cell.path); if (d) ctx.stroke(d); }
  // Scrims: a soft dark (Night) or light (Day) zone behind each block of lettering.
  if (layout) {
    for (const pane of layout.panes) {
      const cy = (pane.top + pane.height / 2 - y) / s;
      const ry = (pane.height / 2) / s + 14;
      ctx.save();
      ctx.translate(50, cy);
      ctx.scale(1, ry / 58);
      const sg = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
      const ink = night ? N.n900 : tokens.color.surfaceSolid;
      sg.addColorStop(0, rgba(ink, night ? 0.86 : 0.9));
      sg.addColorStop(0.6, rgba(ink, night ? 0.7 : 0.74));
      sg.addColorStop(1, rgba(ink, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(-60, -60, 120, 120);
      ctx.restore();
    }
  }
  // Genii's light resting at the top of the dome, and one specular sweep.
  const inner = ctx.createRadialGradient(50, 18, 0, 50, 18, 34);
  inner.addColorStop(0, rgba(tokens.color.surfaceSolid, night ? 0.5 : 0.7));
  inner.addColorStop(1, rgba(tokens.color.surfaceSolid, 0));
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, 100, 160);
  ctx.save();
  ctx.rotate((-20 * Math.PI) / 180);
  const sweep = ctx.createLinearGradient(-30, 0, 10, 0);
  sweep.addColorStop(0, rgba(tokens.color.surfaceSolid, 0));
  sweep.addColorStop(0.5, rgba(tokens.color.surfaceSolid, night ? 0.14 : 0.3));
  sweep.addColorStop(1, rgba(tokens.color.surfaceSolid, 0));
  ctx.fillStyle = sweep;
  ctx.fillRect(-30, -40, 40, 260);
  ctx.restore();
  if (fog > 0) {
    ctx.fillStyle = rgba(night ? N.ink2 : tokens.color.surfaceSolid, 0.7 * fog);
    ctx.fillRect(0, 0, 100, 160);
  }
  ctx.restore();
  // Inner rim, mullion with its jewel, plinth and finial.
  ctx.strokeStyle = rgba(tokens.color.surfaceSolid, 0.95);
  ctx.lineWidth = 0.9;
  if (arch) ctx.stroke(arch);
  ctx.fillStyle = fr;
  ctx.fillRect(0, 78.4, 100, 3.2);
  ctx.strokeStyle = SILVER[1];
  ctx.lineWidth = 0.3;
  ctx.strokeRect(0, 78.4, 100, 3.2);
  ctx.beginPath(); ctx.arc(50, 80, 3.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = fr;
  roundRect(ctx, -8, 158.5, 116, 7, 2.5);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath(); ctx.arc(50, -5, 4.4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.restore();
  return { h, s };
}

// The lettering on the panes: a label pill edged in that pane's hue, carrying the half's sigil and its label, then the
// name at the largest size that fits two lines.
function drawPaneText(ctx, { x, w, layout, p }) {
  const { k, pill, gap } = layout;
  const ink = p.dark ? N.ink : C.ink;
  const cx = x + w / 2;
  for (const pane of layout.panes) {
    if (!pane.half) continue;
    let yy = pane.top;
    const size = 27 * k;
    const track = size * 0.16;
    const label = String(pane.half.label || "").toUpperCase();
    font(ctx, "text", 700, size);
    const spaced = "letterSpacing" in ctx;
    if (spaced) ctx.letterSpacing = `${track.toFixed(1)}px`;
    const tw = ctx.measureText(label).width - (spaced ? track : 0);
    if (spaced) ctx.letterSpacing = "0px";
    const sig = 46 * k;
    const padL = 18 * k;
    const padR = 30 * k;
    const inner = 12 * k;
    const pw = padL + sig + inner + tw + padR;
    const px = cx - pw / 2;
    roundRect(ctx, px, yy, pw, pill, pill / 2);
    ctx.fillStyle = p.dark ? rgba(N.n900, 0.78) : rgba(tokens.color.surfaceSolid, 0.92);
    ctx.fill();
    ctx.strokeStyle = PANE_HUE[pane.which].rim;
    ctx.lineWidth = Math.max(2, 3 * k);
    ctx.stroke();
    drawSigil(ctx, pane.half.code, px + padL, yy + (pill - sig) / 2, sig, ink);
    tracked(ctx, label, px + padL + sig + inner, yy + pill / 2 + size * 0.36, { size, color: ink, align: "left", track: 0.16 });
    yy += pill + gap;
    font(ctx, "display", 600, pane.name.size);
    ctx.save();
    if (p.dark) { ctx.shadowColor = rgba(N.n900, 0.9); ctx.shadowBlur = 24 * k; }
    lines(ctx, pane.name.lines, cx, yy + pane.name.size * 0.8, { lh: pane.name.size * 1.0, align: "center", color: ink });
    ctx.restore();
  }
}

// The whole mirror with both names: layout, glass, lettering. Returns the glass height.
export function drawNamedMirror(ctx, { x, y, w, names, mirror, p, fog = 0 }) {
  const h = w * 1.6;
  const layout = names && names.length ? paneLayout(ctx, { x, y, w, h, names }) : null;
  drawHeroMirror(ctx, { x, y, w, mirror, p, layout, fog });
  if (layout) drawPaneText(ctx, { x, w, layout, p });
  return h;
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
// Simplified for story size (VISUAL-JUDGE-CODEX-R2 screen 13): the completed mirror with both names, as large as the
// card allows; the core traits as keyword pills in up to two rows (their evidence stays on the traits screen); the
// invite; the address.
export const SHARE_TRAITS = 6;
export function drawShareCard(ctx, card, { format = "story", theme = "night", lightTheme = "day", wordmarkImage = null } = {}) {
  const { w: W, h: H } = FORMATS[format] || FORMATS.story;
  const p = paletteFor(theme === "day" ? "light" : "night", lightTheme);
  ctx.textBaseline = "alphabetic";
  background(ctx, W, H, p);
  const names = card.names || [];
  const items = (card.tags || []).filter((t) => t && t.name).slice(0, SHARE_TRAITS);
  if (format === "post") {
    drawWordmark(ctx, wordmarkImage, W / 2, 30, 170, p);
    const aw = 560;
    const ay = 110;
    aura(ctx, W / 2, ay + aw * 0.72, aw * 0.95, p);
    drawIsland(ctx, W / 2, ay + aw * 1.6 - 200, 880);
    const h = drawNamedMirror(ctx, { x: (W - aw) / 2, y: ay, w: aw, names, mirror: card.mirror, p });
    drawGenii(ctx, (W + aw) / 2 + 6, ay + h + 10, 150);
    drawPillRows(ctx, { items, y: ay + h + 30, W, p, size: 34, maxW: W - 100, maxRows: 2, gap: 16, rowGap: 14 });
    font(ctx, "display", 420, 48, true);
    lines(ctx, [card.invite || ""], W / 2, H - 72, { lh: 0, align: "center", color: p.accent });
    font(ctx, "text", 600, 24);
    lines(ctx, [card.url || ""], W / 2, H - 28, { lh: 0, align: "center", color: p.ink3 });
    return;
  }
  drawWordmark(ctx, wordmarkImage, W / 2, 64, 220, p);
  const aw = 780;
  const ay = 168;
  aura(ctx, W / 2, ay + aw * 0.72, aw * 0.9, p);
  drawIsland(ctx, W / 2, ay + aw * 1.6 - 250, 1240);
  const h = drawNamedMirror(ctx, { x: (W - aw) / 2, y: ay, w: aw, names, mirror: card.mirror, p });
  drawGenii(ctx, (W + aw) / 2 - 70, ay + h + 60, 190);
  drawPillRows(ctx, { items, y: ay + h + 44, W, p, size: 46, maxW: W - 140, maxRows: 2 });
  font(ctx, "display", 420, 58, true);
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
      const aw = 800;
      const top = 210;
      const h = drawNamedMirror(ctx, { x: (W - aw) / 2, y: top, w: aw, names: spec.names || [], mirror: spec.mirror, p, fog: spec.id === "intro" ? 1 : 0 });
      y = top + h + 60;
      if (spec.title) y = block(ctx, spec.title, W / 2, y, { face: "display", weight: 600, max: 80, min: 56, width, maxLines: 2, color: p.ink, align: "center", lh: 1.08 });
      if (spec.hook) {
        // The plaque on the frame's foot, as on the screen: the clearest finding's first sentence.
        const first = String(spec.hook).split(/(?<=[.!?])\s+/)[0];
        const fitted = fit(ctx, first, { face: "display", weight: 450, italic: true, max: 44, min: 34, width: aw - 120, maxLines: 3 });
        const ph = fitted.lines.length * fitted.size * 1.28 + 56;
        const py = top + h - 40;
        roundRect(ctx, (W - aw + 40) / 2, py, aw - 40, ph, 36);
        ctx.fillStyle = rgba(N.n800, 0.94);
        ctx.fill();
        ctx.strokeStyle = rgba(tokens.color.surfaceSolid, 0.75);
        ctx.lineWidth = 3;
        ctx.stroke();
        font(ctx, "display", 450, fitted.size, true);
        lines(ctx, fitted.lines, W / 2, py + 28 + fitted.size * 0.92, { lh: fitted.size * 1.28, align: "center", color: N.ink });
        y = py + ph + 60;
      }
      for (const l of spec.lines || []) block(ctx, l, W / 2, y, { face: "display", weight: 420, italic: true, max: 40, min: 32, width, maxLines: 2, color: p.ink2, align: "center" });
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
      // The character sheet (round 3, LAUNCH-SPEC 24): per stat its end, level word, five pips and the plain line. The
      // signature stat glows, the wild card is dashed. No number or percentage is drawn.
      kicker(spec.kicker, 270);
      y = block(ctx, spec.title, W / 2, 300, { face: "display", weight: 600, max: 64, min: 50, width, maxLines: 1, color: p.ink, align: "center" }) + 18;
      if (spec.sub) y = block(ctx, spec.sub, W / 2, y, { face: "text", weight: 500, max: 28, min: 24, width, maxLines: 2, color: p.ink2, align: "center" }) + 34;
      for (const g of spec.groups || []) {
        tracked(ctx, g.label, X, y + 24, { size: 24, color: p.ink3, track: 0.14 });
        y += 44;
        for (const r of g.rows) {
          const note = fit(ctx, r.line || "", { face: "text", weight: 450, max: 28, min: 24, width: width - 60, maxLines: 2 });
          const h = 100 + note.lines.length * note.size * 1.3 + 16;
          roundRect(ctx, X, y, width, h, 30);
          ctx.fillStyle = r.badge === "signature" ? rgba(N.violet, 0.3) : rgba(N.ink, 0.06);
          ctx.fill();
          ctx.lineWidth = r.badge === "signature" ? 3 : 2;
          ctx.strokeStyle = r.badge === "signature" ? rgba(N.violet, 0.9) : rgba(N.ink, r.badge === "wild" ? 0.55 : 0.16);
          if (r.badge === "wild" && ctx.setLineDash) ctx.setLineDash([10, 8]);
          ctx.stroke();
          if (ctx.setLineDash) ctx.setLineDash([]);
          if (r.badge === "signature") glow(ctx, X + width - 120, y + 40, 120, N.violet, 0.35);
          tracked(ctx, r.stat, X + 30, y + 44, { size: 22, color: N.violet, track: 0.14 });
          // Five pips at the right: lit from the left, all half lit for a near-even stat.
          for (let i = 0; i < 5; i++) {
            const cx = X + width - 40 - (4 - i) * 34;
            const cy = y + 36;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(Math.PI / 4);
            roundRect(ctx, -9, -9, 18, 18, 4);
            ctx.restore();
            if (r.split) { ctx.fillStyle = rgba(N.ink, 0.55); ctx.fill(); }
            else if (i < (r.pips || 0)) { ctx.fillStyle = N.ink; ctx.fill(); }
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = rgba(N.ink, i < (r.pips || 0) || r.split ? 0.95 : 0.45);
            ctx.stroke();
          }
          if (r.badgeLabel) {
            font(ctx, "text", 700, 18);
            const bw = ctx.measureText(String(r.badgeLabel).toUpperCase()).width + String(r.badgeLabel).length * 18 * 0.1 + 28;
            const bx = X + width - 40 - 4 * 34 - 48 - bw;
            roundRect(ctx, bx, y + 20, bw, 32, 16);
            ctx.fillStyle = r.badge === "signature" ? N.ink : rgba(N.ink, 0.08);
            ctx.fill();
            if (r.badge === "wild") { ctx.lineWidth = 2; ctx.strokeStyle = rgba(N.ink, 0.6); ctx.stroke(); }
            tracked(ctx, r.badgeLabel, bx + 14, y + 43, { size: 18, color: r.badge === "signature" ? N.n900 : p.ink, track: 0.1 });
          }
          font(ctx, "display", 600, 44);
          const endText = String(r.end || "");
          lines(ctx, [endText], X + 30, y + 94, { lh: 0, color: p.ink });
          const ew = ctx.measureText(endText).width;
          font(ctx, "text", 600, 26);
          lines(ctx, [r.level || ""], X + 30 + ew + 18, y + 92, { lh: 0, color: p.ink2 });
          font(ctx, "text", 450, note.size);
          lines(ctx, note.lines, X + 30, y + 100 + note.size * 1.05, { lh: note.size * 1.3, color: rgba(N.ink, 0.85) });
          y += h + 14;
        }
        y += 18;
      }
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
        font(ctx, "display", 600, 180);
        const big = String(spec.exact);
        const bw = ctx.measureText(big).width;
        font(ctx, "display", 600, 72);
        const tail = ` of ${spec.called}`;
        const tw = ctx.measureText(tail).width;
        const x0 = W / 2 - (bw + tw) / 2;
        font(ctx, "display", 600, 180);
        lines(ctx, [big], x0, 480, { lh: 0, color: p.ink });
        font(ctx, "display", 600, 72);
        lines(ctx, [tail], x0 + bw, 480, { lh: 0, color: p.ink });
        font(ctx, "display", 420, 40, true);
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
      if (spec.behavior) block(ctx, spec.behavior, W / 2, water + 60, { face: "display", weight: 460, italic: true, max: 60, min: 44, width, maxLines: 4, color: p.ink, align: "center", lh: 1.2 });
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
        y = block(ctx, q, X, y + 36, { face: "display", weight: 460, italic: true, max: 50, min: 40, width, maxLines: 5, color: p.ink, lh: 1.3 }) + 60;
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
  drawWordmark(ctx, wordmarkImage, W / 2, 118, 200, p);
  drawStoryBody(ctx, spec, p, W, H);
}

// ---------------------------------------------------------------- output

// Wait for the brand faces (1.5 s at most; after that the system fallback draws).
export async function fontsReady(timeout = 1500) {
  if (typeof document === "undefined" || !document.fonts || !document.fonts.load) return false;
  const faces = [`600 84px ${DISPLAY}`, `italic 420 52px ${DISPLAY}`, `560 48px ${DISPLAY}`, `600 26px ${TEXT}`, `500 28px ${TEXT}`, `700 26px ${TEXT}`];
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

// Kept for older callers: the mirror card as a download.
export function downloadShareImage(share) {
  return shareImage(share, { format: "story", share: false });
}
