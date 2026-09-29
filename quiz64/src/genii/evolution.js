// Genii evolves (LAUNCH-SPEC section 23, ruling 1): the orb is where Genii starts, not what Genii is. One number,
// `evolution` in 0..1, drives every stage of the form. This module is pure (no DOM, no three.js), so the 3D view, the
// SVG fallback and the tests all read the same geometry.
//
// Stages: 0 orb (the glowing light) -> 0.25 droplet forming -> 0.5 the bead pops out at the tip -> 0.7 the eyes open
// -> 1 full Genii with expressions. Genii is a glass slime shaped like a droplet: never a genie, never a lamp.

export const RUN_LENGTH = 40;

// Stage bands, lowest first. `from` is inclusive.
export const EVOLUTION_STAGES = Object.freeze([
  Object.freeze({ id: "orb", from: 0 }),
  Object.freeze({ id: "droplet", from: 0.2 }),
  Object.freeze({ id: "bead", from: 0.45 }),
  Object.freeze({ id: "eyes", from: 0.65 }),
  Object.freeze({ id: "genii", from: 0.9 }),
]);

// Screens where Genii is always complete.
const COMPLETE_PHASES = new Set(["lock", "finale", "reveal", "result"]);
// Before the lock, Genii stops just short of complete so the lock itself lands the last step.
export const PRE_LOCK_CAP = 0.96;

export const clamp01 = (x) => (Number.isFinite(x) ? Math.min(1, Math.max(0, x)) : 0);
export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const lerp = (a, b, t) => a + (b - a) * t;

/**
 * Evolution from play state. answered: cards answered so far; total: the run length (40); confidence: Genii's
 * confidence 0..1 when the play state has one (optional, weighs 15%); phase: lock, finale, reveal and result are
 * always 1. A light ease-out makes the early cards count a little more, so the first change shows sooner.
 */
export function evolutionFor({ answered = 0, total = RUN_LENGTH, confidence = null, phase = null } = {}) {
  if (phase && COMPLETE_PHASES.has(phase)) return 1;
  const n = Number(total) > 0 ? Number(total) : RUN_LENGTH;
  const p = clamp01(Number(answered) / n);
  if (p >= 1) return 1;
  let e = Math.pow(p, 0.85);
  if (Number.isFinite(confidence)) e = 0.85 * e + 0.15 * clamp01(confidence);
  return Math.round(Math.min(PRE_LOCK_CAP, e) * 1000) / 1000;
}

/** The stage id for an evolution value. */
export function stageOf(evolution) {
  const e = clamp01(evolution);
  let id = EVOLUTION_STAGES[0].id;
  for (const s of EVOLUTION_STAGES) if (e >= s.from) id = s.id;
  return id;
}

/**
 * The form weights at an evolution value, each 0..1:
 * glow (the orb's light, fades as the body forms), glass (the jelly material), drop (sphere to teardrop),
 * bead (the pearl at the tip), eyes (the two eyes), expressive (moods show on the face), scale (body size),
 * clarity (the glass clears from frosted to fully clear, with its glow, only as Genii completes).
 */
export function formAt(evolution) {
  const e = clamp01(evolution);
  return {
    glow: 1 - smoothstep(0.02, 0.5, e),
    glass: smoothstep(0.03, 0.46, e),
    drop: smoothstep(0.08, 0.42, e),
    bead: smoothstep(0.4, 0.5, e),
    eyes: smoothstep(0.63, 0.73, e),
    expressive: smoothstep(0.86, 0.95, e),
    scale: lerp(0.66, 1, smoothstep(0, 0.36, e)),
    clarity: smoothstep(0.8, 0.99, e),
  };
}

// ---------- Body geometry (units: body half-width = 1, y up, z toward the viewer) ----------
// Traced from the canon opal renders in public/assets: a wide droplet, slightly heavier bottom left,
// the tip pulled up to the top right where the bead sits.
export const BODY = Object.freeze({
  axes: Object.freeze([1.0, 0.75, 0.8]),
  tilt: 0.1, // radians, lifts the right shoulder
  tip: Object.freeze(normalize([0.5, 0.866, 0])),
  tipA: 0.1, tipK1: 6,
  tipB: 0.1, tipK2: 40,
  neckA: 0.035, neckK: 300, // a slight pinch under the bead, never a stalk
  base: 0.035, // the lower half spreads a little, like a settled jelly
  center: Object.freeze([0, -0.06, 0]),
  bead: 0.17, // bead radius: about 17% of body width, small and hugging the tip like the canon
});

function normalize(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

// Smooth everywhere (no crease at the equator or the bottom pole): peaks a third of the way down.
const baseBulge = (y) => (y < 0 ? 6.75 * y * y * (1 - y * y) * (1 - y * y) : 0);

/** Surface radius along unit direction d at teardrop weight `drop` and neck weight `neck` (mirrors the GLSL in scene.js). */
export function radiusAt(d, drop, neck = drop) {
  const ax = BODY.axes.map((a) => lerp(1, a, drop));
  const t = BODY.tilt * drop;
  const c = Math.cos(t), s = Math.sin(t);
  const qx = c * d[0] + s * d[1];
  const qy = -s * d[0] + c * d[1];
  const qz = d[2];
  const re = 1 / Math.hypot(qx / ax[0], qy / ax[1], qz / ax[2]) + drop * BODY.base * baseBulge(d[1]);
  const k = Math.max(0, d[0] * BODY.tip[0] + d[1] * BODY.tip[1] + d[2] * BODY.tip[2]);
  return re + drop * (BODY.tipA * Math.pow(k, BODY.tipK1) + BODY.tipB * Math.pow(k, BODY.tipK2)) + neck * BODY.neckA * Math.pow(k, BODY.neckK);
}

/** Where the bead sits (body space) for a teardrop weight. */
export function beadCenter(drop, neck = drop) {
  const r = radiusAt(BODY.tip, drop, neck);
  const out = r + BODY.bead * 0.42; // sunk into the tip so the bead hugs it
  return [BODY.tip[0] * out, BODY.tip[1] * out, BODY.tip[2] * out];
}

/** Silhouette outline in the view plane (z = 0 slice, which is the widest), as [x, y] points in body units. */
export function silhouette(drop, samples = 180, neck = drop) {
  const pts = [];
  for (let i = 0; i < samples; i++) {
    const a = (i / samples) * Math.PI * 2;
    const d = [Math.cos(a), Math.sin(a), 0];
    const r = radiusAt(d, drop, neck);
    pts.push([d[0] * r, d[1] * r]);
  }
  return pts;
}

// ---------- Eyes ----------
// Each eye is a closed outline in a unit box (x 0 = the outer side, y 0 = the bottom), resampled to EYE_POINTS points
// so any two expressions morph point by point. Shapes are traced from the canon renders: alert is the flat-topped eye
// with a straight outer edge, curious the curled comma, skeptical the half-lidded eye, thinking the tall eye beside a
// small one; happy closes each eye into a soft arch.
export const EYE_POINTS = 48;

const SHAPES = {
  alert: [["M", 0, 1], ["L", 0.52, 1], ["C", 0.82, 1, 1, 0.8, 1, 0.52], ["L", 1, 0.44], ["C", 1, 0.14, 0.8, 0, 0.5, 0], ["C", 0.2, 0, 0, 0.16, 0, 0.44], ["L", 0, 1]],
  skeptical: [["M", 0, 0.34], ["L", 1, 0.34], ["C", 1, 0.1, 0.9, 0, 0.66, 0], ["L", 0.34, 0], ["C", 0.1, 0, 0, 0.1, 0, 0.34]],
  curious: [["M", 0.08, 1], ["C", 0.56, 1, 0.98, 0.76, 1, 0.42], ["C", 1, 0.14, 0.8, 0, 0.52, 0], ["C", 0.22, 0, 0.02, 0.16, 0.04, 0.4], ["C", 0.06, 0.58, 0.24, 0.66, 0.36, 0.7], ["C", 0.3, 0.84, 0.2, 0.94, 0.08, 1]],
  happy: [["M", 0, 0.22], ["C", 0, 0.8, 0.26, 1, 0.5, 1], ["C", 0.74, 1, 1, 0.8, 1, 0.22], ["C", 1, 0.02, 0.72, 0.0, 0.7, 0.22], ["C", 0.68, 0.46, 0.6, 0.56, 0.5, 0.56], ["C", 0.4, 0.56, 0.32, 0.46, 0.3, 0.22], ["C", 0.28, 0.0, 0, 0.02, 0, 0.22]],
};

function flatten(cmds) {
  const pts = [];
  let cur = [0, 0];
  for (const c of cmds) {
    if (c[0] === "M") { cur = [c[1], c[2]]; pts.push(cur); continue; }
    if (c[0] === "L") { cur = [c[1], c[2]]; pts.push(cur); continue; }
    const steps = 24;
    const p0 = cur;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, u = 1 - t;
      let x, y;
      if (c[0] === "Q") {
        x = u * u * p0[0] + 2 * u * t * c[1] + t * t * c[3];
        y = u * u * p0[1] + 2 * u * t * c[2] + t * t * c[4];
      } else {
        x = u * u * u * p0[0] + 3 * u * u * t * c[1] + 3 * u * t * t * c[3] + t * t * t * c[5];
        y = u * u * u * p0[1] + 3 * u * u * t * c[2] + 3 * u * t * t * c[4] + t * t * t * c[6];
      }
      pts.push([x, y]);
    }
    cur = pts[pts.length - 1];
  }
  return pts;
}

function resample(pts, n) {
  const closed = [...pts, pts[0]];
  const seg = [];
  let total = 0;
  for (let i = 1; i < closed.length; i++) {
    const l = Math.hypot(closed[i][0] - closed[i - 1][0], closed[i][1] - closed[i - 1][1]);
    seg.push(l);
    total += l;
  }
  const out = [];
  let i = 0, acc = 0;
  for (let k = 0; k < n; k++) {
    const target = (k / n) * total;
    while (i < seg.length - 1 && acc + seg[i] < target) { acc += seg[i]; i++; }
    const t = seg[i] ? (target - acc) / seg[i] : 0;
    const a = closed[i], b = closed[i + 1];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

const SAMPLED = Object.fromEntries(Object.entries(SHAPES).map(([k, v]) => [k, resample(flatten(v), EYE_POINTS)]));

/** The eye outline for a shape id, EYE_POINTS points in the unit box. mirror flips it (outer side on the right). */
export function eyeShape(id, mirror = false) {
  const pts = SAMPLED[id] || SAMPLED.alert;
  return mirror ? pts.map(([x, y]) => [1 - x, y]) : pts.map((p) => [p[0], p[1]]);
}

export const EXPRESSIONS = Object.freeze(["alert", "curious", "skeptical", "happy", "thinking"]);

// Per expression: each eye's shape, whether it is mirrored, its center and its box (body units, view plane).
const L = [-0.47, 0.03], R = [-0.06, 0.03];
const EYE_W = 0.21, EYE_H = 0.32;
const LAYOUTS = {
  alert: [{ shape: "alert", mirror: false, c: L, w: EYE_W, h: EYE_H }, { shape: "alert", mirror: true, c: R, w: EYE_W, h: EYE_H }],
  curious: [{ shape: "curious", mirror: false, c: [-0.46, 0.04], w: 0.22, h: 0.3 }, { shape: "curious", mirror: false, c: [-0.06, 0.04], w: 0.22, h: 0.3 }],
  skeptical: [{ shape: "skeptical", mirror: false, c: L, w: 0.22, h: EYE_H }, { shape: "skeptical", mirror: true, c: R, w: 0.22, h: EYE_H }],
  happy: [{ shape: "happy", mirror: false, c: [-0.47, 0.03], w: 0.24, h: 0.2 }, { shape: "happy", mirror: true, c: [-0.06, 0.03], w: 0.24, h: 0.2 }],
  thinking: [{ shape: "alert", mirror: false, c: [-0.44, 0.06], w: 0.2, h: 0.33 }, { shape: "alert", mirror: true, c: [-0.04, -0.08], w: 0.15, h: 0.19 }],
};

/**
 * Both eyes for an expression as outlines in body units: [[x, y] x EYE_POINTS] x 2.
 * blink 0..1 closes the eyes toward a line a third of the way up (1 = shut).
 */
export function eyesFor(expression = "alert", blink = 0) {
  const layout = LAYOUTS[expression] || LAYOUTS.alert;
  const squash = 1 - 0.92 * clamp01(blink);
  return layout.map((eye) => eyeShape(eye.shape, eye.mirror).map(([u, v]) => {
    const vy = 0.34 + (v - 0.34) * squash;
    return [eye.c[0] + (u - 0.5) * eye.w, eye.c[1] + (vy - 0.5) * eye.h];
  }));
}

/** Point-by-point morph between two eye sets. */
export function mixEyes(a, b, t) {
  const k = clamp01(t);
  return a.map((eye, i) => eye.map((p, j) => [lerp(p[0], b[i][j][0], k), lerp(p[1], b[i][j][1], k)]));
}

/** Moods of GeniiLight to face expressions. */
const MOOD_EXPRESSION = { listening: "alert", idle: "alert", noted: "curious", thinking: "thinking", sure: "happy", hush: "skeptical" };
export function expressionFor(mood) {
  if (EXPRESSIONS.includes(mood)) return mood;
  return MOOD_EXPRESSION[mood] || "alert";
}

// Quick reactions after an answer, in turn (never the same face twice in a row).
export const REACTIONS = Object.freeze(["curious", "happy", "skeptical", "curious", "alert", "happy"]);

/** A closed SVG path through points (used by the SVG fallback). */
export function pathOf(pts, scale = 1, ox = 0, oy = 0) {
  if (!pts.length) return "";
  const f = (n) => Math.round(n * 100) / 100;
  return `M${pts.map(([x, y]) => `${f(ox + x * scale)} ${f(oy - y * scale)}`).join("L")}Z`;
}
