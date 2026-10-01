// A-20: canvas helpers for the share image and story images. They draw from the same geometry and
// path strings as the SVG components (Path2D), with colors resolved from the live tokens (palette.js
// `resolve`, falling back to the token-mirrored defaults), so the PNG matches the DOM.
import { archPath, facetGeometry, mosaic, sigilParts, SIGIL_GRID, SIGIL_STROKE } from "./geometry.js";
import { chapterKey, resolve } from "./palette.js";
import { CHAPTER_GLYPHS, DEVICE_GLYPHS, FORMAT_GLYPHS, SETUP_GLYPHS, star } from "./shapes.js";

const W = 100;
const H = 160;

// "#RRGGBB" (or rgb()) plus alpha -> a canvas color string.
export function withAlpha(color, a) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(color).trim());
  if (!m) return color;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

const col = (name, el) => resolve(name, el);

/**
 * drawArch(ctx, { x, y, width, seed, filled, fog, glow, mullion, el })
 * The mirror arch in the SVG's 112 x 172 box (glass 100 x 160 inside a 6 unit margin), scaled to `width`.
 */
export function drawArch(ctx, { x = 0, y = 0, width = 320, seed = "mirror", filled = [], fog = 0, glow = 0.6, mullion = true, el } = {}) {
  const s = width / (W + 12);
  const white = col("c-on-deep", el);
  const silver1 = col("mirror-silver-1", el);
  const silver2 = col("mirror-silver-2", el);
  ctx.save();
  ctx.translate(x + 6 * s, y + 6 * s);
  ctx.scale(s, s);

  if (glow > 0) {
    const halo = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, H * 0.62);
    halo.addColorStop(0, withAlpha(col("c-violet", el), 0.5 * glow));
    halo.addColorStop(1, withAlpha(col("c-violet-300", el), 0));
    ctx.fillStyle = halo;
    ctx.fillRect(-W * 0.4, -H * 0.3, W * 1.8, H * 1.5);
  }
  const frame = ctx.createLinearGradient(-5, 0, W + 5, 0);
  [[0, silver2], [0.18, white], [0.4, silver1], [0.62, silver2], [0.82, white], [1, silver2]].forEach(([o, c]) => frame.addColorStop(o, c));
  ctx.save();
  ctx.translate(-5, -5);
  ctx.fillStyle = frame;
  ctx.fill(new Path2D(archPath(W + 10, H + 5)));
  ctx.restore();

  const outline = new Path2D(archPath(W, H));
  ctx.save();
  ctx.clip(outline);
  const glass = ctx.createLinearGradient(0, 0, 0, H);
  glass.addColorStop(0, col("c-violet-300", el));
  glass.addColorStop(0.5, col("c-violet-100", el));
  glass.addColorStop(1, silver1);
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, W, H);
  const light = ctx.createRadialGradient(W / 2, H * 0.36, 0, W / 2, H * 0.36, H * 0.6);
  light.addColorStop(0, withAlpha(white, 0.35 + 0.65 * glow));
  light.addColorStop(0.5, withAlpha(col("c-violet-300", el), 0.2));
  light.addColorStop(1, withAlpha(col("c-violet-300", el), 0));
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);
  drawMosaic(ctx, { w: W, h: H, seed, filled, el });
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0, withAlpha(white, 0.5));
  sheen.addColorStop(0.4, withAlpha(white, 0));
  sheen.addColorStop(1, withAlpha(white, 0.2));
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);
  if (fog > 0) {
    ctx.globalAlpha = Math.min(1, fog);
    ctx.fillStyle = withAlpha(silver1, 0.92);
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  ctx.strokeStyle = withAlpha(white, 0.95);
  ctx.lineWidth = 0.9;
  ctx.stroke(outline);
  if (mullion) {
    ctx.fillStyle = frame;
    ctx.fillRect(0, H / 2 - 1.3, W, 2.6);
    ctx.beginPath();
    ctx.arc(W / 2, H / 2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = white;
    ctx.fill(new Path2D(star(W / 2, H / 2, 2.2)));
  }
  ctx.fillStyle = frame;
  ctx.beginPath();
  ctx.roundRect ? ctx.roundRect(-8, H - 1.5, W + 16, 7, 2.5) : ctx.rect(-8, H - 1.5, W + 16, 7);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(W / 2, -5, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = white;
  ctx.fill(new Path2D(star(W / 2, -5, 3.4)));
  ctx.restore();
}

/** drawMosaic(ctx, { w, h, seed, filled, count, el }): the seeded cells in a w x h box at the origin. */
export function drawMosaic(ctx, { w = W, h = H, seed = "mirror", filled = [], count, el } = {}) {
  const cells = mosaic(seed, Math.max(count ?? 0, filled.length, 40), { w, h }).cells;
  const white = col("c-on-deep", el);
  cells.forEach((cell, i) => {
    const shard = filled[i];
    if (!shard) return;
    const key = chapterKey(shard.chapter);
    const [x0, y0] = cell.points[0];
    const g = ctx.createLinearGradient(x0 - 6, y0 - 6, x0 + 10, y0 + 14);
    g.addColorStop(0, withAlpha(white, 0.85));
    g.addColorStop(0.45, col(`tint-${key}`, el));
    g.addColorStop(1, col(`tint-${key}-deep`, el));
    ctx.fillStyle = g;
    ctx.globalAlpha = 0.9;
    ctx.fill(new Path2D(cell.path));
    ctx.globalAlpha = 1;
  });
  ctx.strokeStyle = withAlpha(white, filled.length ? 0.8 : 0.5);
  ctx.lineWidth = 0.4;
  ctx.lineJoin = "round";
  ctx.stroke(new Path2D(cells.map((c) => c.path).join(" ")));
}

/** drawFacet(ctx, axes, { x, y, size, theme, el }): the facet gem with spokes, waterline and sparkle vertices. */
export function drawFacet(ctx, axes, { x = 0, y = 0, size = 300, theme = "night", el } = {}) {
  const g = facetGeometry(axes, size);
  const k = size / 300;
  const white = col("c-on-deep", el);
  const line = col(theme === "night" ? "n-ink-3" : "c-ink-3", el);
  const [cx, cy] = g.center;
  ctx.save();
  ctx.translate(x, y);
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.spokeLength * 1.3);
  glow.addColorStop(0, withAlpha(col("c-violet", el), theme === "night" ? 0.55 : 0.35));
  glow.addColorStop(1, withAlpha(col("c-violet", el), 0));
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = withAlpha(line, 0.45);
  ctx.lineWidth = k;
  for (const s of g.spokes) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(s.tip[0], s.tip[1]);
    ctx.stroke();
  }
  ctx.setLineDash([5 * k, 4 * k]);
  ctx.beginPath();
  ctx.moveTo(g.waterline[0][0], cy);
  ctx.lineTo(g.waterline[1][0], cy);
  ctx.stroke();
  ctx.setLineDash([]);
  const gem = ctx.createLinearGradient(cx - g.spokeLength, cy - g.spokeLength, cx + g.spokeLength, cy + g.spokeLength);
  gem.addColorStop(0, col("g-brand-1", el));
  gem.addColorStop(0.45, col("g-deep-1", el));
  gem.addColorStop(1, col("g-deep-2", el));
  const poly = new Path2D(g.path);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = gem;
  ctx.fill(poly);
  ctx.globalAlpha = 1;
  [0.2, 0.05, 0.12, 0.02, 0.1, 0.16].forEach((a, i) => {
    const p = g.points[i];
    const q = g.points[(i + 1) % g.points.length];
    ctx.fillStyle = withAlpha(white, a);
    ctx.fill(new Path2D(`M${cx},${cy} L${p[0]},${p[1]} L${q[0]},${q[1]} Z`));
  });
  ctx.strokeStyle = withAlpha(white, 0.3);
  for (const [a, b] of g.facetLines) {
    ctx.beginPath();
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.stroke();
  }
  ctx.strokeStyle = withAlpha(white, 0.8);
  ctx.lineWidth = 1.4 * k;
  ctx.lineJoin = "round";
  ctx.stroke(poly);
  ctx.fillStyle = white;
  for (const vx of g.vertices) {
    if (vx.double) {
      for (const [px, py] of vx.double) {
        ctx.beginPath();
        ctx.arc(px, py, 2.4 * k, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fill(new Path2D(star(vx.x, vx.y, 5.5 * k)));
    }
  }
  ctx.restore();
}

/** drawSigil(ctx, code, { x, y, size, color }): the half's emblem, stroked in `color` (default white). */
export function drawSigil(ctx, code, { x = 0, y = 0, size = 48, color, el } = {}) {
  const c = color || col("c-on-deep", el);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / SIGIL_GRID, size / SIGIL_GRID);
  ctx.strokeStyle = c;
  ctx.fillStyle = c;
  ctx.lineWidth = SIGIL_STROKE;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const part of sigilParts(code)) {
    const p = new Path2D(part.d);
    ctx.setLineDash(part.dash || []);
    if (part.fill) ctx.fill(p);
    else ctx.stroke(p);
  }
  ctx.restore();
}

const GLYPH_SETS = { chapter: CHAPTER_GLYPHS, format: FORMAT_GLYPHS, device: DEVICE_GLYPHS, setup: SETUP_GLYPHS };

/**
 * drawGlyph(ctx, set, id, { x, y, size, line, accent }): a glass glyph from "chapter" | "format" |
 * "device" | "setup". Chapter glyphs default to their tint and deep tint; the rest to violet.
 */
export function drawGlyph(ctx, set, id, { x = 0, y = 0, size = 24, line, accent, el } = {}) {
  const table = GLYPH_SETS[set] || CHAPTER_GLYPHS;
  const key = set === "chapter" ? (chapterKey(id).startsWith("ch") ? Number(chapterKey(id).slice(2)) : chapterKey(id)) : id;
  const g = table[key];
  if (!g) return;
  const tk = set === "chapter" ? chapterKey(id) : null;
  const lineColor = line || col(tk ? `tint-${tk}-deep` : "c-violet-text", el);
  const accentColor = accent || col(tk ? `tint-${tk}` : "c-violet-300", el);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(size / 24, size / 24);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (g.a) {
    ctx.fillStyle = accentColor;
    ctx.fill(new Path2D(g.a));
  }
  if (g.l) {
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1.75;
    ctx.stroke(new Path2D(g.l));
  }
  if (g.f) {
    ctx.fillStyle = lineColor;
    ctx.fill(new Path2D(g.f));
  }
  if (g.h) {
    ctx.fillStyle = withAlpha(col("c-on-deep", el), 0.9);
    ctx.fill(new Path2D(g.h));
  }
  ctx.restore();
}
