// Pure, canvas-ready geometry for the asset library (DESIGN-DIRECTION.md sections 6 and 7.3).
// No DOM, no React, no colors: the SVG components and the canvas share image both read these numbers.

const TAU = Math.PI * 2;
const round = (n) => Math.round(n * 100) / 100;

// ---------------------------------------------------------------- seeded randomness

// FNV-1a over the string form of the seed, so a run id ("r-7f3a...") or a number both work.
export function seedFrom(seed) {
  if (typeof seed === "number" && Number.isFinite(seed)) return seed >>> 0;
  const text = String(seed ?? "");
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32: small, fast, well distributed; identical sequences for identical seeds.
export function mulberry32(seed) {
  let a = seedFrom(seed);
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------- polygon helpers

export function polygonArea(points) {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

export function polygonCentroid(points) {
  const a = polygonArea(points);
  if (Math.abs(a) < 1e-9) {
    const n = points.length || 1;
    return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
  }
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const f = x1 * y2 - x2 * y1;
    cx += (x1 + x2) * f;
    cy += (y1 + y2) * f;
  }
  return [cx / (6 * a), cy / (6 * a)];
}

// "M x,y L ... Z" for SVG `d` and for `new Path2D(d)` on canvas.
export function polygonPath(points) {
  if (!points.length) return "";
  return points.map(([x, y], i) => `${i ? "L" : "M"}${round(x)},${round(y)}`).join(" ") + " Z";
}

// Keep the side of the line through `a` with normal `n` where dot(p - a, n) >= 0.
function clipHalfPlane(points, a, n) {
  const out = [];
  const side = (p) => (p[0] - a[0]) * n[0] + (p[1] - a[1]) * n[1];
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    const q = points[(i + 1) % points.length];
    const sp = side(p);
    const sq = side(q);
    if (sp >= 0) out.push(p);
    if ((sp >= 0) !== (sq >= 0)) {
      const t = sp / (sp - sq);
      out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]);
    }
  }
  return out;
}

// Sutherland-Hodgman against a convex, counter-clockwise-or-clockwise clip polygon.
export function clipPolygon(subject, clip) {
  const orientation = Math.sign(polygonArea(clip)) || 1;
  let out = subject;
  for (let i = 0; i < clip.length && out.length; i++) {
    const a = clip[i];
    const b = clip[(i + 1) % clip.length];
    // Inward normal for the clip edge a -> b.
    const n = orientation > 0 ? [-(b[1] - a[1]), b[0] - a[0]] : [b[1] - a[1], -(b[0] - a[0])];
    out = clipHalfPlane(out, a, n);
  }
  return out;
}

// ---------------------------------------------------------------- A-01 the arch

// Arch outline in a w x h box: a semicircle of radius w/2 on top of a rectangle. Origin top-left.
export function archPath(w = 100, h = 160) {
  const r = w / 2;
  const top = Math.min(r, h);
  return `M0,${round(h)} L0,${round(top)} A${round(r)},${round(r)} 0 0 1 ${round(w)},${round(top)} L${round(w)},${round(h)} Z`;
}

// Polygon approximation of the arch (clockwise in screen space), used for clipping and hit tests.
export function archPolygon(w = 100, h = 160, segments = 32) {
  const r = w / 2;
  const cy = Math.min(r, h);
  const pts = [[0, h], [0, cy]];
  for (let i = 1; i < segments; i++) {
    const a = Math.PI - (Math.PI * i) / segments;
    pts.push([r + r * Math.cos(a), cy - r * Math.sin(a)]);
  }
  pts.push([w, cy], [w, h]);
  return pts;
}

// Mullion (the thin silver bar between the two panes), as a line at `at` of the arch height.
export function archMullion(w = 100, h = 160, at = 0.5) {
  const y = round(h * at);
  return { x1: 0, y1: y, x2: round(w), y2: y };
}

// ---------------------------------------------------------------- A-01 the seeded mosaic

function splitPolygon(points, rand) {
  const c = polygonCentroid(points);
  const angle = rand() * Math.PI;
  const n = [Math.cos(angle), Math.sin(angle)];
  const a = clipHalfPlane(points, c, n);
  const b = clipHalfPlane(points, c, [-n[0], -n[1]]);
  return [a, b].filter((p) => p.length >= 3 && Math.abs(polygonArea(p)) > 1e-6);
}

/**
 * Seeded crack pattern clipped to the arch, split until exactly `count` cells exist.
 * Returns cells ordered from the impact point outward (so shards fill center out):
 *   { index, points: [[x, y], ...], path, centroid: [x, y], distance }
 * plus the impact point and the arch box. Identical seeds give identical polygons.
 */
export function mosaic(seed, count = 40, arch = {}) {
  const w = arch.w ?? arch.width ?? 100;
  const h = arch.h ?? arch.height ?? 160;
  const target = Math.max(0, Math.floor(count));
  const rand = mulberry32(seed);
  const clip = archPolygon(w, h);
  const impact = [w * (0.3 + rand() * 0.4), h * (0.28 + rand() * 0.34)];
  if (target === 0) return { w, h, impact, cells: [] };

  // 5 to 7 radial cracks with jittered angles, and 2 to 3 irregular rings, trimmed so the
  // starting cell count never exceeds the target.
  let cracks = Math.min(5 + Math.floor(rand() * 3), target);
  let rings = 2 + Math.floor(rand() * 2);
  while (rings > 0 && cracks * (rings + 1) > target) rings--;
  cracks = Math.max(1, cracks);

  const reach = Math.hypot(w, h);
  const base = rand() * TAU;
  const angles = [];
  for (let i = 0; i < cracks; i++) angles.push(base + (TAU * i) / cracks + (rand() - 0.5) * 0.6 * (TAU / cracks));

  const radii = [0];
  for (let j = 1; j <= rings; j++) radii.push(reach * (0.12 + 0.22 * (j - 1) + rand() * 0.08));
  radii.push(reach * 3);

  // Shared crack vertices, so neighbouring cells meet exactly. Inner rings wobble along the crack.
  const vertex = [];
  for (let j = 0; j < radii.length; j++) {
    vertex.push(angles.map((a, i) => {
      if (j === 0) return impact;
      const last = j === radii.length - 1;
      const r = last ? radii[j] : radii[j] * (0.85 + rand() * 0.3);
      const wobble = last ? 0 : (rand() - 0.5) * 0.12;
      return [impact[0] + r * Math.cos(a + wobble), impact[1] + r * Math.sin(a + wobble)];
    }));
  }

  // The outermost edge of a sector follows the far circle in steps of at most 60 degrees, so a wide
  // sector (few cracks) still covers everything it should.
  const farRadius = radii[radii.length - 1];
  const farArc = (i, k) => {
    const gap = (angles[k] - angles[i] + TAU) % TAU || TAU;
    const steps = Math.ceil(gap / (Math.PI / 3));
    const pts = [];
    for (let s = 1; s < steps; s++) {
      const a = angles[i] + (gap * s) / steps;
      pts.push([impact[0] + farRadius * Math.cos(a), impact[1] + farRadius * Math.sin(a)]);
    }
    return pts;
  };

  let cells = [];
  if (cracks === 1) {
    cells.push(clip.map((p) => [...p]));
  } else {
    const last = radii.length - 1;
    for (let j = 0; j < last; j++) {
      for (let i = 0; i < cracks; i++) {
        const k = (i + 1) % cracks;
        const far = j + 1 === last ? farArc(i, k) : [];
        const poly = j === 0
          ? [impact, vertex[1][i], ...far, vertex[1][k]]
          : [vertex[j][i], vertex[j + 1][i], ...far, vertex[j + 1][k], vertex[j][k]];
        const inside = clipPolygon(poly, clip);
        if (inside.length >= 3 && Math.abs(polygonArea(inside)) > 1e-6) cells.push(inside);
      }
    }
  }

  // Split the largest cell until the target is met.
  let guard = target * 4;
  while (cells.length < target && guard-- > 0) {
    let largest = 0;
    for (let i = 1; i < cells.length; i++) if (Math.abs(polygonArea(cells[i])) > Math.abs(polygonArea(cells[largest]))) largest = i;
    const parts = splitPolygon(cells[largest], rand);
    if (parts.length < 2) continue;
    cells.splice(largest, 1, ...parts);
  }

  const out = cells.slice(0, target).map((points) => {
    const pts = points.map(([x, y]) => [round(x), round(y)]);
    const centroid = polygonCentroid(points);
    return { points: pts, centroid: [round(centroid[0]), round(centroid[1])], distance: round(Math.hypot(centroid[0] - impact[0], centroid[1] - impact[1])) };
  });
  out.sort((a, b) => a.distance - b.distance || a.centroid[1] - b.centroid[1] || a.centroid[0] - b.centroid[0]);
  return {
    w,
    h,
    impact: [round(impact[0]), round(impact[1])],
    cells: out.map((cell, index) => ({ index, ...cell, path: polygonPath(cell.points) })),
  };
}

// ---------------------------------------------------------------- A-11 the facet

// Spoke angles in degrees, math convention (0 = right, 90 = up). People above the waterline, life below.
export const FACET_ANGLES = { R1: 90, R2: 30, R3: 150, L1: 270, L2: 330, L3: 210 };
export const FACET_ORDER = ["R2", "R1", "R3", "L3", "L1", "L2"];
const FACET_MIN = 0.28;
const FACET_NUDGE = 8;
const FACET_DOUBLE = 4;

/**
 * facetGeometry(axes, size): story 4 rules.
 * axes: [{ key, lean: -1..1, flex, unfinished, plus, minus }]
 * Each vertex sits at 0.28 + 0.72 * |lean| of the spoke and nudges 8 degrees toward the pole it leans to
 * (plus: counter-clockwise, minus: clockwise). Flex and unfinished axes sit at 0.28 with a double vertex.
 */
export function facetGeometry(axes = [], size = 300) {
  const c = size / 2;
  const spokeLength = size * 0.36;
  const labelLength = size * 0.46;
  const at = (deg, r) => [round(c + r * Math.cos((deg * Math.PI) / 180)), round(c - r * Math.sin((deg * Math.PI) / 180))];
  const byKey = new Map(axes.map((a) => [a.key, a]));

  const vertices = FACET_ORDER.map((key) => {
    const axis = byKey.get(key) || { key, lean: 0, unfinished: true };
    const base = FACET_ANGLES[key];
    const lean = Math.max(-1, Math.min(1, Number(axis.lean) || 0));
    const soft = Boolean(axis.flex || axis.unfinished) || lean === 0;
    const reach = soft ? FACET_MIN : FACET_MIN + (1 - FACET_MIN) * Math.abs(lean);
    const angle = soft ? base : base + Math.sign(lean) * FACET_NUDGE;
    const [x, y] = at(angle, reach * spokeLength);
    const double = soft ? [at(base - FACET_DOUBLE, reach * spokeLength), at(base + FACET_DOUBLE, reach * spokeLength)] : null;
    const leansPlus = lean > 0;
    return {
      key,
      angle,
      reach: round(reach),
      x,
      y,
      double,
      flex: Boolean(axis.flex),
      unfinished: Boolean(axis.unfinished),
      lead: soft ? null : leansPlus ? axis.plus ?? null : axis.minus ?? null,
      other: soft ? null : leansPlus ? axis.minus ?? null : axis.plus ?? null,
    };
  });

  const spokes = FACET_ORDER.map((key) => ({ key, angle: FACET_ANGLES[key], from: [round(c), round(c)], tip: at(FACET_ANGLES[key], spokeLength) }));
  const labels = FACET_ORDER.map((key) => {
    const deg = FACET_ANGLES[key];
    const [x, y] = at(deg, labelLength);
    const cos = Math.cos((deg * Math.PI) / 180);
    return { key, x, y, anchor: Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end", upper: deg > 0 && deg < 180 };
  });
  const points = vertices.map((v) => [v.x, v.y]);
  const facetLines = [0, 1, 2].map((i) => [points[i], points[i + 3]]);

  return {
    size,
    center: [round(c), round(c)],
    spokeLength: round(spokeLength),
    spokes,
    vertices,
    points,
    path: polygonPath(points),
    facetLines,
    labels,
    waterline: [[round(c - spokeLength * 1.1), round(c)], [round(c + spokeLength * 1.1), round(c)]],
  };
}

// ---------------------------------------------------------------- A-12 sigils

// One part per pole, composed on a 48 grid. Every part is a stroke path (Path2D-ready);
// `dash` asks for a dotted stroke, `fill` for a filled shape.
const SIGIL_PARTS = {
  // Relationship half
  We: [{ d: "M13,24 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0 Z" }, { d: "M21,24 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0 Z" }],
  Me: [{ d: "M17,24 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0 Z" }],
  Direct: [{ d: "M24,12 L24,40" }],
  Soft: [{ d: "M24,12 C29,17 19,21 24,26 C29,31 19,35 24,40" }],
  Classic: [{ d: "M12,16 A12,10 0 0 1 36,16" }],
  Own: [{ d: "M24,3 L25.6,7.4 L30,9 L25.6,10.6 L24,15 L22.4,10.6 L18,9 L22.4,7.4 Z", fill: true }],
  // Life half
  Steady: [{ d: "M12,44.5 L36,44.5" }],
  Venture: [{ d: "M11,46 L20,42.5 L26,44 L36,39.5" }],
  Push: [{ d: "M16,30 L24,16 L32,30 Z" }],
  Easy: [{ d: "M28,15 A8,8 0 1 0 28,31 A6,6 0 1 1 28,15 Z" }],
  Rules: [{ d: "M9,8 L39,8 L39,38 L9,38 Z" }],
  Context: [{ d: "M24,6 a17,17 0 1 0 0.01,0 Z", dash: [0.1, 5] }],
};

const FLEX_PART = { d: "M22.5,24 a1.5,1.5 0 1 0 3,0 a1.5,1.5 0 1 0 -3,0 Z", fill: true };

export function parseCode(code) {
  return String(code ?? "")
    .split(/[·|.\s/]+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
}

// sigilParts("We·Soft·Own") -> [{ pole, d, dash?, fill? }] on a 48 x 48 grid, stroke 2.5, round caps.
export function sigilParts(code) {
  const poles = parseCode(code);
  const parts = [];
  for (const pole of poles) {
    const shapes = SIGIL_PARTS[pole] || [FLEX_PART];
    for (const s of shapes) parts.push({ pole, ...s });
  }
  return parts;
}

export const SIGIL_GRID = 48;
export const SIGIL_STROKE = 2.5;
export const SIGIL_POLES = Object.keys(SIGIL_PARTS);
