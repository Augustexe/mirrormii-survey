// The drama stats (Jerry, 2026-09-30; LAUNCH-SPEC sections 3 and 6): the six numbers players see, D&D style, scored
// 1 to 20. They replace the old character sheet of six axis stats on every player surface. The six axes stay hidden
// as the scoring engine; nothing here changes how the scorer reads a card. Each drama stat is a fixed, explainable
// mix of the player's own profile (score-core.mjs buildProfile): axis leans (normalized score toward one pole) and
// trait support (a tag's net support against its pair). Pure functions only: profile in, numbers out.
//
// One stat, step by step (scoreStat):
//   1. Each part gives a lean x from -1 to 1 and a confidence c from 0 to 1.
//      axis part: x = norm on that axis, signed toward the named pole; c = 1 - e^(-cards/3); an unfinished axis
//        gives c = 0.
//      tag part: x = tanh(net / 2.5), where net is the tag's support minus its pair's (negative when the pair
//        leads); c = 1 - e^(-n/2.5), n = the cards that backed the tag or its pair; no evidence gives x = c = 0.
//   2. raw = sum(w * c * x) / sum(w): thin evidence pulls the raw value toward zero.
//      conf = sum(w * c) / sum(w).
//   3. The raw value goes through this stat's population percentiles (CALIBRATION, from the calibration sim,
//      scripts/calibrate-drama.mjs): the 1st percentile maps to 3, the 5th to 6, the 25th to 9, the median to 12,
//      the 75th to 15, the 95th to 18, the 99th to 20; in between is linear, beyond the ends it runs to 1 and 20.
//   4. Thin evidence gives a soft score near the middle, never a fake extreme: below CONF_FULL the score is pulled
//      toward MID in proportion (score = MID + (mapped - MID) * conf / CONF_FULL). Then it is rounded to a whole
//      number from 1 to 20.
//
// The formulas (weights in brackets; the poles and tags are the library's ids, names as of 2026-09-30):
//   CHA Charm:      R1 We, stays close [1.0] + R2 Soft, says it gently [1.0] + T04B Makes friends easily [1.0]
//                   + T08A Believes in second chances [0.8]
//   ROM Romance:    T09A Loves deeply, all in on us [1.5] + T05B Puts feelings into words [1.0]
//                   + T10A Talks problems through [0.5] (never a kids or wedding tag)
//   LOY Loyalty:    R1 We, stays close [1.0] + T18A First to help family [1.0] + T05A Shows care through actions [0.8]
//                   + T10A Talks problems through [0.8]
//   PEACE Peacemaker: R2 Soft, says it gently [1.0] + T08A Believes in second chances [1.0]
//                   + T10B Knows when to move on [0.8] + T25B Makes room for exceptions [0.8]
//   TEA Tea Radar:  L3 Context, case by case [1.0] + T02B Loves hearing from friends, notices who texts first [1.0]
//                   + T08B Remembers the details [1.0] + T24A Plans with lists, tracks everything [0.6]
//   PETTY Petty:    R2 Direct, says it straight [1.0] + T08B Remembers the details, keeps the receipts [1.0]
//                   + T02B Notices who texts first [0.8] + T12A Splits the bill evenly, to the cent [0.6]

export const DRAMA_ORDER = Object.freeze(["CHA", "ROM", "LOY", "PEACE", "TEA", "PETTY"]);

const axis = (id, pole, w, about) => Object.freeze({ kind: "axis", axis: id, pole, w, about });
const tag = (id, w, about) => Object.freeze({ kind: "tag", tag: id, w, about });

// abbr is the stat block's label, name the full stat name. Both are the same in every voice.
export const DRAMA_STATS = Object.freeze({
  CHA: Object.freeze({ id: "CHA", abbr: "CHA", name: "Charm", parts: Object.freeze([
    axis("R1", 1, 1.0, "stays close"), axis("R2", -1, 1.0, "says it gently"),
    tag("T04B", 1.0, "tags friends with everyone"), tag("T08A", 0.8, "gives second chances"),
  ]) }),
  ROM: Object.freeze({ id: "ROM", abbr: "ROM", name: "Romance", parts: Object.freeze([
    tag("T09A", 1.5, "all in on us"), tag("T05B", 1.0, "says it with words"), tag("T10A", 0.5, "talks it through"),
  ]) }),
  LOY: Object.freeze({ id: "LOY", abbr: "LOY", name: "Loyalty", parts: Object.freeze([
    axis("R1", 1, 1.0, "stays close"), tag("T18A", 1.0, "family's first call"),
    tag("T05A", 0.8, "says it with actions"), tag("T10A", 0.8, "works it out"),
  ]) }),
  PEACE: Object.freeze({ id: "PEACE", abbr: "PEACE", name: "Peacemaker", parts: Object.freeze([
    axis("R2", -1, 1.0, "says it gently"), tag("T08A", 1.0, "gives second chances"),
    tag("T10B", 0.8, "lets it go"), tag("T25B", 0.8, "bends rules for people"),
  ]) }),
  TEA: Object.freeze({ id: "TEA", abbr: "TEA", name: "Tea Radar", parts: Object.freeze([
    axis("L3", -1, 1.0, "case by case"), tag("T02B", 1.0, "notices who texts first"),
    tag("T08B", 1.0, "remembers the details"), tag("T24A", 0.6, "tracks everything"),
  ]) }),
  PETTY: Object.freeze({ id: "PETTY", abbr: "PETTY", name: "Petty", parts: Object.freeze([
    axis("R2", 1, 1.0, "says it straight"), tag("T08B", 1.0, "keeps the receipts"),
    tag("T02B", 0.8, "notices who texts first"), tag("T12A", 0.6, "splits to the cent"),
  ]) }),
});

// The score scale. MID is the middle a thin-evidence stat leans toward; KNOTS pair a population percentile with the
// score it maps to.
export const MIN = 1;
export const MAX = 20;
export const MID = 12;
export const KNOTS = Object.freeze([[0.01, 3], [0.05, 6], [0.25, 9], [0.5, 12], [0.75, 15], [0.95, 18], [0.99, 20]]);
// Below this confidence a stat is softened toward MID (step 4). Set from the calibration sim: about the 10th
// percentile of conf across players, so a typical full run is never softened.
export const CONF_FULL = 0.29;

// Raw values at each KNOTS percentile, per stat, measured by scripts/calibrate-drama.mjs (2026-09-30, 1600 simulated
// players: consistent players at noise 0.1 to 0.5, random clickers, every lobby room set and depth, both voices).
// Rerun the script and paste its output here after a bank or evidence change.
export const CALIBRATION = Object.freeze({
  CHA: Object.freeze([-0.391, -0.302, -0.131, -0.016, 0.092, 0.271, 0.369]),
  ROM: Object.freeze([-0.321, -0.185, -0.079, 0.015, 0.094, 0.217, 0.327]),
  LOY: Object.freeze([-0.268, -0.201, -0.089, -0.004, 0.081, 0.197, 0.242]),
  PEACE: Object.freeze([-0.383, -0.286, -0.137, -0.02, 0.094, 0.254, 0.346]),
  TEA: Object.freeze([-0.405, -0.276, -0.11, 0.008, 0.13, 0.293, 0.392]),
  PETTY: Object.freeze([-0.345, -0.241, -0.088, 0.033, 0.146, 0.283, 0.373]),
});

const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// One part's lean and confidence, read from the profile (score-core buildProfile output).
export function partValue(profile, part) {
  const P = profile || {};
  if (part.kind === "axis") {
    const a = (P.axes || {})[part.axis];
    if (!a || a.unfinished) return { x: 0, c: 0 };
    return { x: clamp(num(a.norm), -1, 1) * part.pole, c: 1 - Math.exp(-Math.max(0, num(a.cards)) / 3) };
  }
  const tags = P.tags || {};
  const t = tags[part.tag];
  const pairId = part.tag.slice(0, 3) + (part.tag.endsWith("A") ? "B" : "A");
  const pair = tags[pairId];
  // A tag missing from the profile has no evidence on its side; its pair's net is the mirror image.
  const net = t ? num(t.net) : pair ? -num(pair.net) : 0;
  const n = (t ? num(t.cards) : 0) + (pair ? num(pair.cards) : 0);
  if (!n && !net) return { x: 0, c: 0 };
  return { x: Math.tanh(net / 2.5), c: 1 - Math.exp(-n / 2.5) };
}

// Step 1 and 2: the raw value (-1 to 1) and the confidence (0 to 1) of one stat.
export function rawStat(profile, id) {
  const def = DRAMA_STATS[id];
  let sw = 0, sx = 0, sc = 0;
  for (const part of def.parts) {
    const { x, c } = partValue(profile, part);
    sw += part.w;
    sx += part.w * c * x;
    sc += part.w * c;
  }
  return { raw: sw ? sx / sw : 0, conf: sw ? sc / sw : 0 };
}

// Step 3: a raw value through one stat's percentile knots to a score (not yet rounded).
export function mapRaw(raw, knots) {
  const xs = knots;
  const ys = KNOTS.map(([, y]) => y);
  if (raw <= xs[0]) return xs[0] <= -1 ? ys[0] : MIN + (ys[0] - MIN) * clamp((raw + 1) / (xs[0] + 1), 0, 1);
  if (raw >= xs[xs.length - 1]) { const top = xs[xs.length - 1]; return top >= 1 ? MAX : ys[ys.length - 1] + (MAX - ys[ys.length - 1]) * clamp((raw - top) / (1 - top), 0, 1); }
  for (let i = 1; i < xs.length; i++) {
    if (raw <= xs[i]) {
      const span = xs[i] - xs[i - 1];
      return span > 0 ? ys[i - 1] + (ys[i] - ys[i - 1]) * (raw - xs[i - 1]) / span : ys[i];
    }
  }
  return ys[ys.length - 1];
}

// Step 3 and 4 for one stat: the whole-number score 1 to 20.
export function scoreFrom(raw, conf, knots) {
  const k = clamp(conf / CONF_FULL, 0, 1);
  return Math.round(clamp(MID + (mapRaw(raw, knots) - MID) * k, MIN, MAX));
}

// How surprising a stat is for this player: how far its raw value sits from the population median, in units of the
// population's middle half (the 25th to 75th percentile), softened like the score. Never shown.
export function surpriseOf(raw, conf, knots) {
  const iqr = Math.max(1e-6, knots[4] - knots[2]);
  return Math.abs(raw - knots[3]) / iqr * clamp(conf / CONF_FULL, 0, 1);
}

// All six for one profile, in DRAMA_ORDER.
export function dramaStats(profile, calibration = CALIBRATION) {
  return DRAMA_ORDER.map((id, order) => {
    const def = DRAMA_STATS[id];
    const { raw, conf } = rawStat(profile, id);
    const knots = calibration[id];
    return { id, abbr: def.abbr, name: def.name, order, raw, conf, score: scoreFrom(raw, conf, knots), surprise: surpriseOf(raw, conf, knots) };
  });
}

// Highest first: score, then raw, then the fixed order.
const byHigh = (a, b) => b.score - a.score || b.raw - a.raw || a.order - b.order;

// The Stories stat screen: the three highest, plus the most surprising stat (furthest from the population median for
// its spread) when it is not already among them; otherwise the fourth highest. Returns ids in screen order, each with
// why it was picked ("top" or "surprise").
export function topFour(stats) {
  const high = stats.slice().sort(byHigh);
  const top3 = high.slice(0, 3);
  const most = stats.slice().sort((a, b) => b.surprise - a.surprise || a.order - b.order)[0];
  const fourth = most && !top3.includes(most) ? { ...most, pick: "surprise" } : { ...high[3], pick: "top" };
  return [...top3.map((s) => ({ ...s, pick: "top" })), fourth];
}

// The highest stat and the dump stat (the lowest: score, then raw, then the last in the fixed order).
export function topStat(stats) { return stats.slice().sort(byHigh)[0]; }
export function dumpStat(stats) { return stats.slice().sort((a, b) => a.score - b.score || a.raw - b.raw || b.order - a.order)[0]; }

// Which short line a stat block reads: its high line at or above the middle, its low line below it.
export const lineSide = (score) => (score >= MID - 1 ? "high" : "low");
