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

// Fit text into at most `maxLines` lines at the largest size between max and min. Returns { size, lines }.
function fit(ctx, value, { face, weight, italic, max, min, width, maxLines }) {
  for (let size = max; size >= min; size -= 2) {
    font(ctx, face, weight, size, italic);
    const lines = wrap(ctx, value, width);
    if (lines.length <= maxLines && lines.every((l) => ctx.measureText(l).width <= width)) return { size, lines };
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

// The arch at (x, y) with glass width w: silver rim, seeded crack mosaic in chapter tints, mullion, specular sweep.
export function drawArch(ctx, { x, y, w, mirror, p, fog = 0, strength = 0.26 }) {
  const s = w / 100;
  const h = 160 * s;
  const arch = path(geometry.archPath(100, 160));
  const { filled, cells } = mosaicOf(mirror);
  // Glow behind the mirror.
  glow(ctx, x + w / 2, y + h * 0.42, w * 1.05, p.dark ? N.violet : C.violet300, p.dark ? 0.32 : 0.4);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (arch) ctx.clip(arch);
  const base = ctx.createLinearGradient(0, 0, 0, 160);
  base.addColorStop(0, p.dark ? N.n700 : tokens.color.surfaceSolid);
  base.addColorStop(1, p.dark ? N.n900 : C.violet100);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 100, 160);
  const brand = ctx.createLinearGradient(0, 0, 100, 160);
  brand.addColorStop(0, rgba(tokens.gradients.brand[0], 0.24));
  brand.addColorStop(1, rgba(tokens.gradients.brand[1], 0.18));
  ctx.fillStyle = brand;
  ctx.fillRect(0, 0, 100, 160);
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const shard = filled[i];
    const d = path(cell.path);
    if (!d) continue;
    if (shard) {
      ctx.globalAlpha = (shard.skipped ? 0.5 : 1) * strength;
      ctx.fillStyle = tintOf(shard.chapter);
      ctx.fill(d);
    }
    ctx.globalAlpha = p.dark ? 0.32 : 0.7;
    ctx.strokeStyle = tokens.color.surfaceSolid;
    ctx.lineWidth = 0.35;
    ctx.stroke(d);
  }
  ctx.globalAlpha = 1;
  // Genii's light resting behind the glass, and the specular sweep.
  const inner = ctx.createRadialGradient(50, 22, 0, 50, 22, 70);
  inner.addColorStop(0, rgba(N.ink2, p.dark ? 0.28 : 0.5));
  inner.addColorStop(1, rgba(N.ink2, 0));
  ctx.fillStyle = inner;
  ctx.fillRect(0, 0, 100, 160);
  ctx.rotate((-20 * Math.PI) / 180);
  const sweep = ctx.createLinearGradient(-20, 0, 40, 0);
  sweep.addColorStop(0, rgba(tokens.color.surfaceSolid, 0));
  sweep.addColorStop(0.5, rgba(tokens.color.surfaceSolid, p.dark ? 0.1 : 0.35));
  sweep.addColorStop(1, rgba(tokens.color.surfaceSolid, 0));
  ctx.fillStyle = sweep;
  ctx.fillRect(-20, -40, 60, 260);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (fog > 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(s, s);
    if (arch) ctx.clip(arch);
    ctx.fillStyle = rgba(p.dark ? N.ink2 : tokens.color.surfaceSolid, 0.62 * fog);
    ctx.fillRect(0, 0, 100, 160);
    ctx.restore();
  }
  ctx.restore();
  // Silver rim and mullion.
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  const rim = ctx.createLinearGradient(0, 0, 100, 160);
  rim.addColorStop(0, tokens.color.surfaceSolid);
  rim.addColorStop(0.5, rgba(N.ink2, 0.9));
  rim.addColorStop(1, rgba(tokens.color.surfaceSolid, 0.8));
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.4;
  if (arch) ctx.stroke(arch);
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  ctx.moveTo(0, 80);
  ctx.lineTo(100, 80);
  ctx.stroke();
  ctx.restore();
  return { h, s };
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

// The two names in the two panes of the arch. `scale` sets the type size relative to a 600 px glass.
function drawPanes(ctx, { x, y, w, h, names, p }) {
  const k = w / 600;
  const pad = 44 * k;
  const nameMax = 84 * k;
  const nameMin = 56 * k;
  const sig = 80 * k;
  const ink = p.dark ? N.ink : C.ink;
  const soft = p.dark ? N.ink2 : C.ink2;
  const [people, life] = names;
  // Upper pane: label, sigil, name, set on the lower part of the pane so the dome stays open.
  const upName = fit(ctx, people.name, { face: "display", weight: 600, max: nameMax, min: nameMin, width: w - pad * 2, maxLines: 2 });
  const upBlock = 26 * k + 24 * k + sig + 20 * k + upName.lines.length * upName.size * 1.02;
  let yy = y + h / 2 - 40 * k - upBlock;
  tracked(ctx, people.label, x + w / 2, yy + 26 * k, { size: 24 * k, color: soft, align: "center", track: 0.14 });
  yy += 26 * k + 24 * k;
  drawSigil(ctx, people.code, x + w / 2 - sig / 2, yy, sig, ink);
  yy += sig + 20 * k;
  font(ctx, "display", 600, upName.size);
  lines(ctx, upName.lines, x + w / 2, yy + upName.size * 0.82, { lh: upName.size * 1.02, align: "center", color: ink });
  // Lower pane.
  yy = y + h / 2 + 48 * k;
  tracked(ctx, life.label, x + w / 2, yy + 26 * k, { size: 24 * k, color: soft, align: "center", track: 0.14 });
  yy += 26 * k + 24 * k;
  drawSigil(ctx, life.code, x + w / 2 - sig / 2, yy, sig, ink);
  yy += sig + 20 * k;
  const lowName = fit(ctx, life.name, { face: "display", weight: 600, max: nameMax, min: nameMin, width: w - pad * 2, maxLines: 2 });
  font(ctx, "display", 600, lowName.size);
  lines(ctx, lowName.lines, x + w / 2, yy + lowName.size * 0.82, { lh: lowName.size * 1.02, align: "center", color: ink });
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

// ---------------------------------------------------------------- the mirror card

// The share card in either format and theme. `card` is the share projection (story-data.js buildStories().share).
export function drawShareCard(ctx, card, { format = "story", theme = "night", lightTheme = "day", wordmarkImage = null } = {}) {
  const { w: W, h: H } = FORMATS[format] || FORMATS.story;
  const p = paletteFor(theme === "day" ? "light" : "night", lightTheme);
  ctx.textBaseline = "alphabetic";
  background(ctx, W, H, p);
  const names = card.names || [];
  const items = (card.tags || []).filter((t) => t && t.name);
  if (format === "post") {
    const ax = 80;
    const ay = 150;
    const aw = 440;
    const { h } = drawArch(ctx, { x: ax, y: ay, w: aw, mirror: card.mirror, p });
    drawPanes(ctx, { x: ax, y: ay, w: aw, h, names, p });
    drawWordmark(ctx, wordmarkImage, 790, 150, 200, p);
    let y = 250;
    for (const it of items.slice(0, 4)) {
      y = drawCharm(ctx, { x: 590, y, w: 410, item: { name: it.name, line: it.heartShort || it.heart, chapter: it.chapter }, p, nameSize: 34, lineSize: 24, maxLines: 2 }) + 22;
    }
    drawFacet(ctx, card.facet, 795, Math.max(y + 130, 780), 220, p);
    font(ctx, "display", 420, 52, true);
    lines(ctx, [card.invite || ""], W / 2, 1195, { lh: 0, align: "center", color: p.accent });
    font(ctx, "text", 600, 26);
    lines(ctx, [card.url || ""], W / 2, 1270, { lh: 0, align: "center", color: p.ink3 });
    return;
  }
  drawWordmark(ctx, wordmarkImage, W / 2, 118, 220, p);
  const rows = items.slice(0, 5);
  const many = rows.length > 3;
  // Five charms and the invite must fit above the footer: with more than three, the arch steps down (integration QA
  // 2026-09-29 found the fifth charm drawn over the URL and the invite pushed off the 1920 px card).
  const aw = many ? 470 : 600;
  const ax = (W - aw) / 2;
  const ay = 210;
  const { h } = drawArch(ctx, { x: ax, y: ay, w: aw, mirror: card.mirror, p });
  drawPanes(ctx, { x: ax, y: ay, w: aw, h, names, p });
  // The facet as the jewel on the arch's plinth.
  drawFacet(ctx, card.facet, W / 2, ay + h + 20, many ? 170 : 210, p);
  let y = ay + h + (many ? 120 : 150);
  const gap = many ? 12 : 26;
  const FLOOR = 1660;
  for (const it of rows) {
    if (y > FLOOR - 70) break;
    y = drawCharm(ctx, { x: 150, y, w: W - 300, item: { name: it.name, line: it.heartShort || it.heart, chapter: it.chapter }, p, nameSize: many ? 36 : 42, lineSize: 26, maxLines: many ? 1 : 2 }) + gap;
  }
  font(ctx, "display", 420, 52, true);
  lines(ctx, [card.invite || ""], W / 2, Math.min(Math.max(y + 70, 1740), 1770), { lh: 0, align: "center", color: p.accent });
  font(ctx, "text", 600, 26);
  lines(ctx, [card.url || ""], W / 2, 1850, { lh: 0, align: "center", color: p.ink3 });
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
      const aw = 640;
      const { h } = drawArch(ctx, { x: (W - aw) / 2, y: 230, w: aw, mirror: spec.mirror, p, fog: spec.id === "intro" ? 1 : 0 });
      if (spec.names) drawPanes(ctx, { x: (W - aw) / 2, y: 230, w: aw, h, names: spec.names, p });
      y = 230 + h + 110;
      if (spec.title) y = block(ctx, spec.title, W / 2, y, { face: "display", weight: 600, max: 80, min: 56, width, maxLines: 2, color: p.ink, align: "center", lh: 1.08 });
      for (const l of spec.lines || []) block(ctx, l, W / 2, y, { face: "display", weight: 420, italic: true, max: 44, min: 34, width, maxLines: 2, color: p.ink2, align: "center" });
      return;
    }
    case "read": {
      kicker(spec.kicker, 330);
      y = 420;
      for (const t of spec.tablets || []) {
        const fitted = fit(ctx, t.line, { face: "display", weight: 560, max: 52, min: 40, width: width - 120, maxLines: 4 });
        const bh = fitted.lines.length * fitted.size * 1.22 + 110;
        ctx.fillStyle = p.glass;
        roundRect(ctx, X, y, width, bh, 56);
        ctx.fill();
        ctx.strokeStyle = rgba(tokens.color.surfaceSolid, p.dark ? 0.2 : 0.9);
        ctx.lineWidth = 2;
        ctx.stroke();
        if (t.mark && t.mark.kind === "sigil") drawSigil(ctx, t.mark.code, X + width - 100, y + 36, 56, p.accent);
        if (t.mark && t.mark.kind === "chapter") { ctx.beginPath(); ctx.arc(X + width - 72, y + 64, 20, 0, Math.PI * 2); ctx.fillStyle = tintOf(t.mark.chapter); ctx.fill(); }
        font(ctx, "display", 560, fitted.size);
        lines(ctx, fitted.lines, X + 56, y + 55 + fitted.size * 0.82, { lh: fitted.size * 1.22, color: p.ink });
        y += bh + 36;
      }
      return;
    }
    case "map": {
      kicker(spec.kicker, 300);
      y = block(ctx, spec.title, W / 2, 340, { face: "display", weight: 600, max: 76, min: 56, width, maxLines: 2, color: p.ink, align: "center" });
      drawFacet(ctx, spec.facet, W / 2, y + 470, 700, p, { labels: true });
      for (const l of spec.lines || []) block(ctx, l, W / 2, y + 920, { face: "display", weight: 420, italic: true, max: 44, min: 34, width, maxLines: 3, color: p.ink2, align: "center" });
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
  await fontsReady();
  const img = await loadWordmark();
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
  await fontsReady();
  const img = await loadWordmark();
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
