// SVG path strings shared by the React components and the canvas helpers (`new Path2D(d)`).
// No colors here: components paint them from CSS custom properties (palette.js).

// A-02: eight slightly irregular quadrilateral shards in a 12 x 18 viewBox, chosen by index.
export const SHARD_VIEWBOX = "0 0 12 18";
export const SHARDS = [
  "M2,1 L11,3 L10,17 L1,15 Z",
  "M1,2 L10,1 L11,16 L2,17 Z",
  "M3,1 L11,2 L9,17 L1,14 Z",
  "M1,3 L9,1 L11,15 L3,17 Z",
  "M2,2 L11,1 L10,15 L1,17 Z",
  "M1,1 L10,3 L11,17 L2,16 Z",
  "M2,1 L10,2 L11,14 L1,17 Z",
  "M1,2 L11,1 L9,16 L2,17 Z",
];
export const shardFor = (index) => SHARDS[((Math.floor(index) % SHARDS.length) + SHARDS.length) % SHARDS.length];

// A-15: the one four-point star, in a 24 x 24 viewBox.
export const SPARKLE_VIEWBOX = "0 0 24 24";
export const SPARKLE = "M12,1 C12.9,8.2 15.8,11.1 23,12 C15.8,12.9 12.9,15.8 12,23 C11.1,15.8 8.2,12.9 1,12 C8.2,11.1 11.1,8.2 12,1 Z";

// A four-point star of radius r at (x, y), for scattering sparkles inside larger art.
export function star(x, y, r) {
  const k = r * 0.16;
  const f = (n) => Math.round(n * 100) / 100;
  return `M${f(x)},${f(y - r)} C${f(x + k)},${f(y - k)} ${f(x + k)},${f(y - k)} ${f(x + r)},${f(y)} C${f(x + k)},${f(y + k)} ${f(x + k)},${f(y + k)} ${f(x)},${f(y + r)} C${f(x - k)},${f(y + k)} ${f(x - k)},${f(y + k)} ${f(x - r)},${f(y)} C${f(x - k)},${f(y - k)} ${f(x - k)},${f(y - k)} ${f(x)},${f(y - r)} Z`;
}

// A-17: lock pane (36 x 44) and the star seal stamped on it.
export const PANE_VIEWBOX = "0 0 36 44";
export const PANE = "M8,1 L28,1 Q35,1 35,8 L35,36 Q35,43 28,43 L8,43 Q1,43 1,36 L1,8 Q1,1 8,1 Z";
export const SEAL = "M18,14 L19.9,19.4 L25.6,19.6 L21.1,23.1 L22.7,28.6 L18,25.4 L13.3,28.6 L14.9,23.1 L10.4,19.6 L16.1,19.4 Z";
export const SEAL_RING = "M18,12 a10,10 0 1 0 0.01,0 Z";
export const PANE_CHECK = "M12.5,22 L16.5,26 L24,17.5";
export const PANE_SHEEN = "M5,6 Q5,4.5 7,4.5 L15,4.5 L5,20 Z";

// A-10: door in a 60 x 96 viewBox; the leaf is its own path so it can swing (rotateY).
export const DOOR_VIEWBOX = "0 0 60 96";
export const DOOR_FRAME = "M4,95 L4,26 A26,26 0 0 1 56,26 L56,95 Z";
export const DOOR_OPENING = "M9,95 L9,27 A21,21 0 0 1 51,27 L51,95 Z";
export const DOOR_LEAF = "M9,95 L9,27 A21,21 0 0 1 51,27 L51,95 Z";
export const DOOR_PANELS = "M15,52 L15,32 A15,15 0 0 1 45,32 L45,52 Z M15,86 L15,60 L45,60 L45,86 Z";
export const DOOR_SPILL = "M9,95 L51,95 L60,96 L0,96 Z";
export const DOOR_KNOB = "M42,62 a3,3 0 1 0 0.01,0 Z";
export const DOOR_HEART = "M30,48 C26.5,45.2 24.2,43.2 24.2,40.6 a2.9,2.9 0 0 1 5.8,-0.6 a2.9,2.9 0 0 1 5.8,0.6 C35.8,43.2 33.5,45.2 30,48 Z";
export const DOOR_KNOCKER_RING = "M30,50 a4.5,4.5 0 1 0 0.01,0 Z";
export const DOOR_PLAQUE = "M20,36 L40,36 Q42,36 42,38 L42,44 Q42,46 40,46 L20,46 Q18,46 18,44 L18,38 Q18,36 20,36 Z";
export const DOOR_WINDOW = "M22,50 L22,38 A8,8 0 0 1 38,38 L38,50 Z";
export const DOOR_WINDOW_BARS = "M30,30 L30,50 M22,42 L38,42";

// A-03: island base (a glass lens) and its water line, in a 320 x 320 viewBox.
export const ISLAND_VIEWBOX = "0 0 320 320";
export const ISLAND_TOP = "M40,188 C40,173 100,166 160,166 C220,166 280,173 280,188 C280,203 220,210 160,210 C100,210 40,203 40,188 Z";
export const ISLAND_BODY = "M40,188 C40,203 100,210 160,210 C220,210 280,203 280,188 C272,212 238,234 196,246 L160,258 L124,246 C82,234 48,212 40,188 Z";
export const ISLAND_FACETS = "M40,188 L124,246 L100,206 Z M280,188 L196,246 L222,206 Z M100,206 L124,246 L160,258 L160,210 Z";
export const ISLAND_CRACKS = "M100,206 L124,246 M160,210 L160,258 M222,206 L196,246 M130,209 L142,252 M190,209 L178,252";
export const ISLAND_DROP = "M160,258 L166,266 L160,280 L154,266 Z";
export const ISLAND_WATER_Y = 286;
export const ISLAND_WATER = `M0,${ISLAND_WATER_Y} L320,${ISLAND_WATER_Y}`;

// A-18: app tablet (a glass phone outline) in a 150 x 300 viewBox.
export const TABLET_VIEWBOX = "0 0 150 300";
export const TABLET = "M24,2 L126,2 Q148,2 148,24 L148,276 Q148,298 126,298 L24,298 Q2,298 2,276 L2,24 Q2,2 24,2 Z";
export const TABLET_SCREEN = "M28,14 L122,14 Q136,14 136,28 L136,272 Q136,286 122,286 L28,286 Q14,286 14,272 L14,28 Q14,14 28,14 Z";
export const TABLET_ISLAND = "M60,22 L90,22 Q95,22 95,27 Q95,32 90,32 L60,32 Q55,32 55,27 Q55,22 60,22 Z";

// A-16: zigzag edge for receipt paper, as a clip path in a w x h box.
export function receiptEdge(w = 320, h = 400, tooth = 8) {
  const teeth = Math.max(2, Math.round(w / tooth));
  const step = w / teeth;
  const top = [];
  const bottom = [];
  for (let i = 0; i <= teeth; i++) {
    top.push(`${(i * step).toFixed(2)},${i % 2 ? 0 : tooth / 2}`);
    bottom.push(`${(w - i * step).toFixed(2)},${i % 2 ? h : h - tooth / 2}`);
  }
  return `M${top.join(" L")} L${bottom.join(" L")} Z`;
}

// A-16: the torn edge for the receipt's "tear it off" beat: a seeded ragged line across the strip at `y`,
// as a clip path for the part that stays (above the tear). Deterministic for a given seed.
export function receiptTear(w = 320, y = 400, seed = 1) {
  let s = (Number(seed) || 1) >>> 0;
  const rand = () => ((s = (Math.imul(s ^ (s >>> 15), 0x2c1b3c6d) + 0x9e3779b9) >>> 0) % 1000) / 1000;
  const pts = [];
  const steps = Math.max(8, Math.round(w / 9));
  for (let i = 0; i <= steps; i++) pts.push(`${((w * i) / steps).toFixed(1)},${(y - 1 - rand() * 5).toFixed(1)}`);
  return `M0,0 L${w},0 L${pts.reverse().join(" L")} Z`;
}

// A-16: CSS mask for zigzag receipt edges (top and bottom), as a data URL for `mask-image` / `-webkit-mask`.
// Use with `mask-size: <tooth*2>px 100%` style tiling: `receiptMask(tooth)` returns { top, bottom }.
export function receiptMask(tooth = 8) {
  const t = tooth;
  const svg = (d) => `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${t * 2}' height='${t}'><path d='${d}' fill='black'/></svg>`)}")`;
  return { top: svg(`M0,${t} L${t},0 L${t * 2},${t} Z`), bottom: svg(`M0,0 L${t},${t} L${t * 2},0 Z`) };
}

// ---------------------------------------------------------------- glass glyphs (section 4.5)
// 24 px grid, 1.75 stroke, round caps and joins. Each glyph is up to four path strings:
//   a: the accent shape, filled with the chapter or format tint (drawn first)
//   l: line work, stroked in the deep color
//   f: small solids in the deep color (pips, seals, dots)
//   h: white highlights (glints on glass)
// The same strings feed canvas (drawGlyph) through Path2D.

export const GLYPH_VIEWBOX = "0 0 24 24";
export const GLYPH_WELL = "M7,2 L17,2 Q22,2 22,7 L22,17 Q22,22 17,22 L7,22 Q2,22 2,17 L2,7 Q2,2 7,2 Z";
export const GLYPH_DOT = "M12,8 a4,4 0 1 0 0.01,0 Z";

const circle = (x, y, r) => `M${x - r},${y} a${r},${r} 0 1 0 ${r * 2},0 a${r},${r} 0 1 0 ${-r * 2},0 Z`;

function gear(cx, cy, r1, r2, teeth) {
  const pts = [];
  const f = (n) => Math.round(n * 100) / 100;
  for (let i = 0; i < teeth * 4; i++) {
    const a = (Math.PI * 2 * i) / (teeth * 4) - Math.PI / 2;
    const r = i % 4 === 1 || i % 4 === 2 ? r2 : r1;
    pts.push(`${f(cx + r * Math.cos(a))},${f(cy + r * Math.sin(a))}`);
  }
  return `M${pts.join(" L")} Z`;
}

export const CHAPTER_GLYPHS = {
  // 1 Your phone: a glass phone with a notification bubble
  1: {
    a: "M17.5,2.5 a4,4 0 1 1 0,8 a4,4 0 1 1 0,-8 Z",
    l: "M8.5,3.5 H14 M16,11 V19 a2.5,2.5 0 0 1 -2.5,2.5 H8.5 A2.5,2.5 0 0 1 6,19 V6 A2.5,2.5 0 0 1 8.5,3.5 M10,18.5 H12",
    h: "M16.3,4.6 a1,1 0 1 1 0,2 a1,1 0 1 1 0,-2 Z",
  },
  // 2 Friends: two speech bubbles in conversation
  2: {
    a: "M12,9 H19 a2,2 0 0 1 2,2 V15.5 a2,2 0 0 1 -2,2 H18.5 V20 L16,17.5 H12 a2,2 0 0 1 -2,-2 V11 a2,2 0 0 1 2,-2 Z",
    l: "M5,4 H13.5 a2,2 0 0 1 2,2 V11 a2,2 0 0 1 -2,2 H8.5 L5.5,15.5 V13 H5 a2,2 0 0 1 -2,-2 V6 a2,2 0 0 1 2,-2 Z",
    f: `${circle(6.8, 8.5, 0.95)} ${circle(9.25, 8.5, 0.95)} ${circle(11.7, 8.5, 0.95)}`,
  },
  // 3 Love and your person: a heart with a small sparkle
  3: {
    a: "M11,20.5 C5.5,16.4 3,13.6 3,10.3 a4.2,4.2 0 0 1 8,-1.8 a4.2,4.2 0 0 1 8,1.8 C19,13.6 16.5,16.4 11,20.5 Z",
    l: "M11,20.5 C5.5,16.4 3,13.6 3,10.3 a4.2,4.2 0 0 1 8,-1.8 a4.2,4.2 0 0 1 8,1.8 C19,13.6 16.5,16.4 11,20.5 Z",
    f: star(19.5, 4.5, 3),
    h: "M5.6,9.2 C5.8,8 6.7,7.3 7.8,7.3 L7.8,8.4 C7.2,8.4 6.7,8.8 6.6,9.4 Z",
  },
  // 4 Money and treats: two coins
  4: {
    a: circle(15, 9.5, 6),
    l: `${circle(9.5, 14.5, 6.5)} ${circle(9.5, 14.5, 3.4)}`,
    h: "M6.2,12.2 A4.2,4.2 0 0 1 8.2,10.4 L8.6,11.3 A3.2,3.2 0 0 0 7.1,12.7 Z",
  },
  // 5 Work, school and ambition: a paper plane
  5: {
    a: "M11.5,13.5 L21,3.5 L15,20.5 Z",
    l: "M3,11 L21,3.5 L15,20.5 L11.5,13.5 Z M11.5,13.5 L21,3.5 M11.5,13.5 V18.5 L13.5,16.2",
  },
  // 6 Family and home: a small house with a lit doorway
  6: {
    a: "M10,20.5 V16 a2,2 0 0 1 4,0 V20.5 Z",
    l: "M3.5,11.5 L12,4 L20.5,11.5 M6,9.5 V20.5 H18 V9.5 M16,6.5 V4.5 H18 V8.2",
    h: "M11,16.5 a1,1 0 0 1 1,-1 V17 Z",
  },
  // 7 Play, rules and you: two dice
  7: {
    a: "M13.7,4.1 L19.8,5.6 a2,2 0 0 1 1.5,2.4 L19.8,14 a2,2 0 0 1 -2.4,1.5 L15.5,15 V11.5 a3,3 0 0 0 -3,-3 H11.4 L11.3,5.6 a2,2 0 0 1 2.4,-1.5 Z",
    l: "M5.5,8.5 H12.5 a2.5,2.5 0 0 1 2.5,2.5 V18 a2.5,2.5 0 0 1 -2.5,2.5 H5.5 A2.5,2.5 0 0 1 3,18 V11 A2.5,2.5 0 0 1 5.5,8.5 Z",
    f: `${circle(6.5, 12, 1.1)} ${circle(11.5, 17, 1.1)} ${circle(9, 14.5, 1.1)} ${circle(16.4, 7.2, 0.9)}`,
  },
  // Extras: Genii's notebook, open, with a sparkle
  extras: {
    a: "M12,7 C9.5,5.5 6.5,5.3 3.5,6.2 V19 C6.5,18.2 9.5,18.4 12,20 Z",
    l: "M12,7 C9.5,5.5 6.5,5.3 3.5,6.2 V19 C6.5,18.2 9.5,18.4 12,20 C14.5,18.4 17.5,18.2 20.5,19 V12.5 M12,7 V20 M14.5,11 C15.8,10.5 17,10.3 18,10.4 M14.5,14.5 C15.8,14 17.2,13.8 18,13.9",
    f: star(18.5, 5, 3.2),
  },
  // Finale: the arch mirror with a star seal
  finale: {
    a: "M8.5,19.5 V10.5 a3.5,3.5 0 0 1 7,0 V19.5 Z",
    l: "M5.5,21 V10.5 a6.5,6.5 0 0 1 13,0 V21 Z M3.5,21 H20.5",
    f: star(12, 14.5, 2.6),
    h: "M9.8,10.3 a2.2,2.2 0 0 1 1.4,-1.9 L11.4,9.3 a1.2,1.2 0 0 0 -0.7,1 Z",
  },
};

export const FORMAT_GLYPHS = {
  // Picture this: a spark
  scenario: {
    a: star(17.5, 6.5, 4),
    l: "M10,5 C10.6,9.8 12.4,11.6 17,12.3 C12.4,13 10.6,14.8 10,19.6 C9.4,14.8 7.6,13 3,12.3 C7.6,11.6 9.4,9.8 10,5 Z",
    f: star(18, 18.5, 1.8),
  },
  // From your life: a clock
  real: {
    a: circle(12, 12.5, 8.5),
    l: `${circle(12, 12.5, 8.5)} M12,8 V12.5 L15,14.5 M4.5,4.5 L6.5,6.5 M19.5,4.5 L17.5,6.5`,
  },
  // Receipts: a torn paper ticket
  receipts: {
    a: "M6,3 H18 V21 L16,19.5 L14,21 L12,19.5 L10,21 L8,19.5 L6,21 Z",
    l: "M6,3 H18 V21 L16,19.5 L14,21 L12,19.5 L10,21 L8,19.5 L6,21 Z M9,7.5 H15 M9,11 H15 M9,14.5 H12.5",
  },
  // Genii's bet: a chip
  bet: {
    a: circle(12, 12, 8.5),
    l: `${circle(12, 12, 8.5)} ${circle(12, 12, 4.2)} M12,3.5 V6 M12,18 V20.5 M3.5,12 H6 M18,12 H20.5 M6,6 L7.7,7.7 M16.3,16.3 L18,18 M18,6 L16.3,7.7 M7.7,16.3 L6,18`,
  },
  // Your reply: an outgoing chat bubble
  reply: {
    a: "M6,5 H18 a3,3 0 0 1 3,3 V13.5 a3,3 0 0 1 -3,3 H17 L20,20 L13,16.5 H6 a3,3 0 0 1 -3,-3 V8 a3,3 0 0 1 3,-3 Z",
    l: "M6,5 H18 a3,3 0 0 1 3,3 V13.5 a3,3 0 0 1 -3,3 H17 L20,20 L13,16.5 H6 a3,3 0 0 1 -3,-3 V8 a3,3 0 0 1 3,-3 Z",
    f: `${circle(8, 10.8, 1.1)} ${circle(12, 10.8, 1.1)} ${circle(16, 10.8, 1.1)}`,
  },
  // First thought: an eye (overheard)
  others: {
    a: circle(12, 12, 3.6),
    l: "M2.5,12 C5,7.2 8.5,5 12,5 C15.5,5 19,7.2 21.5,12 C19,16.8 15.5,19 12,19 C8.5,19 5,16.8 2.5,12 Z",
    f: circle(12, 12, 1.4),
  },
  // This or that: two slabs and the "or" coin on the seam
  this_or_that: {
    a: "M4.5,4 H9.5 a1.5,1.5 0 0 1 1.5,1.5 V18.5 a1.5,1.5 0 0 1 -1.5,1.5 H4.5 A1.5,1.5 0 0 1 3,18.5 V5.5 A1.5,1.5 0 0 1 4.5,4 Z",
    l: "M4.5,4 H9.5 a1.5,1.5 0 0 1 1.5,1.5 V18.5 a1.5,1.5 0 0 1 -1.5,1.5 H4.5 A1.5,1.5 0 0 1 3,18.5 V5.5 A1.5,1.5 0 0 1 4.5,4 Z M14.5,4 H19.5 a1.5,1.5 0 0 1 1.5,1.5 V18.5 a1.5,1.5 0 0 1 -1.5,1.5 H14.5 A1.5,1.5 0 0 1 13,18.5 V5.5 A1.5,1.5 0 0 1 14.5,4 Z",
    f: circle(12, 12, 2.4),
  },
  // Pick your role: a name badge on a lanyard clip
  role: {
    a: star(12, 13.5, 3.4),
    l: "M6.5,7.5 H17.5 a2,2 0 0 1 2,2 V19 a2,2 0 0 1 -2,2 H6.5 a2,2 0 0 1 -2,-2 V9.5 a2,2 0 0 1 2,-2 Z M10,7.5 V3.5 H14 V7.5 M9,18 H15",
  },
  // Pick two: two slots, one filled
  pick_two: {
    a: "M5,4 H11 a2,2 0 0 1 2,2 V9.5 a2,2 0 0 1 -2,2 H5 a2,2 0 0 1 -2,-2 V6 a2,2 0 0 1 2,-2 Z",
    l: "M5,4 H11 a2,2 0 0 1 2,2 V9.5 a2,2 0 0 1 -2,2 H5 a2,2 0 0 1 -2,-2 V6 a2,2 0 0 1 2,-2 Z M13,14.5 H19 a2,2 0 0 1 2,2 V18 a2,2 0 0 1 -2,2 H13 a2,2 0 0 1 -2,-2 V16.5 a2,2 0 0 1 2,-2 Z M16,4.5 L18,7 L21,3.5",
  },
  // Rank it: a podium with a star over the top step
  rank: {
    a: "M9,10 H15 V20.5 H9 Z",
    l: "M3,20.5 V14.5 H9 V10 H15 V16 H21 V20.5 Z",
    f: star(12, 5, 2.8),
  },
  // Through a friend's eyes: a pair of glasses
  eyes: {
    a: `${circle(7, 14, 3.6)} ${circle(17, 14, 3.6)}`,
    l: `${circle(7, 14, 4.2)} ${circle(17, 14, 4.2)} M11.2,13.5 C11.7,12.4 12.3,12.4 12.8,13.5 M2.8,13.2 L2,8.5 M21.2,13.2 L22,8.5`,
    h: "M5,12.8 a2.4,2.4 0 0 1 1.8,-1.5 L7,12.3 a1.4,1.4 0 0 0 -1,0.9 Z M15,12.8 a2.4,2.4 0 0 1 1.8,-1.5 L17,12.3 a1.4,1.4 0 0 0 -1,0.9 Z",
  },
  // First feeling: a glowing bead
  feeling: {
    a: circle(12, 12, 6.5),
    l: `${circle(12, 12, 6.5)} M12,2.5 V3.5 M12,20.5 V21.5 M2.5,12 H3.5 M20.5,12 H21.5 M5.3,5.3 L6,6 M18,18 L18.7,18.7 M18.7,5.3 L18,6 M6,18 L5.3,18.7`,
    h: "M8.4,10.6 a3.8,3.8 0 0 1 2.4,-2.3 L11.1,9.3 a2.8,2.8 0 0 0 -1.7,1.7 Z",
  },
  // Sealed: a frosted pane with a star seal
  sealed: {
    a: "M8,3 H16 a3,3 0 0 1 3,3 V18 a3,3 0 0 1 -3,3 H8 a3,3 0 0 1 -3,-3 V6 a3,3 0 0 1 3,-3 Z",
    l: "M8,3 H16 a3,3 0 0 1 3,3 V18 a3,3 0 0 1 -3,3 H8 a3,3 0 0 1 -3,-3 V6 a3,3 0 0 1 3,-3 Z",
    f: star(12, 12, 3.8),
    h: "M7.5,6 a1,1 0 0 1 1,-1 H11 L7.5,10.5 Z",
  },
};

export const DEVICE_GLYPHS = {
  // Wish lamp, with a curl of smoke
  lamp: {
    a: "M3.5,15.5 C3.5,13 6.5,12 11.5,12 C14.5,12 16.5,12.8 18.5,13.6 L22,11 C21.4,14.2 19.8,16.3 16.8,17.6 C14.8,18.6 9,18.7 6.8,17.8 C5,17.2 3.5,16.8 3.5,15.5 Z",
    l: "M3.5,15.5 C3.5,13 6.5,12 11.5,12 C14.5,12 16.5,12.8 18.5,13.6 L22,11 C21.4,14.2 19.8,16.3 16.8,17.6 C14.8,18.6 9,18.7 6.8,17.8 C5,17.2 3.5,16.8 3.5,15.5 Z M8.5,12.2 C8.5,10.2 10,9 11.5,9 C13,9 14.5,10.2 14.5,12 M8.5,21 H14.5 M11.5,18.5 V21 M4,14.5 C1.8,14 1.7,11.6 3.6,11.4",
    f: `${star(19, 4.5, 2.4)} ${circle(11.5, 8, 0.9)}`,
  },
  bell: {
    a: "M5.5,17 C5.5,11 7.5,6.5 12,6.5 C16.5,6.5 18.5,11 18.5,17 Z",
    l: "M5.5,17 C5.5,11 7.5,6.5 12,6.5 C16.5,6.5 18.5,11 18.5,17 M4,17 H20 M12,6.5 V4",
    f: `${circle(12, 19.6, 1.7)} ${circle(12, 3.4, 1.1)}`,
    h: "M8.3,14.5 C8.3,11.5 9.2,9.5 10.8,8.9 L11.1,9.9 C10,10.4 9.4,12.2 9.4,14.5 Z",
  },
  door: {
    a: "M7,21 V9.5 a5,5 0 0 1 10,0 V21 Z",
    l: "M7,21 V9.5 a5,5 0 0 1 10,0 V21 M3.5,21 H20.5 M17,21 L21,17.5",
    f: `${circle(14.5, 15, 0.95)} ${star(4.5, 5, 2.2)}`,
  },
  // Fortune: a crystal ball on its stand (the 8-ball window without the number)
  fortune: {
    a: circle(12, 10.5, 7.5),
    l: `${circle(12, 10.5, 7.5)} M7,21 H17 L15.5,17.5 H8.5 Z`,
    f: "M12,7.5 L14.4,11.6 H9.6 Z",
    h: "M7.3,9 a5,5 0 0 1 3.4,-3.5 L11,6.6 a4,4 0 0 0 -2.6,2.7 Z",
  },
  // Time: an hourglass
  time: {
    a: "M9,20.5 C9.4,17.6 10.8,16.2 12,15.6 C13.2,16.2 14.6,17.6 15,20.5 Z M9.6,6.5 H14.4 C13.9,8.3 13,9.3 12,10 C11,9.3 10.1,8.3 9.6,6.5 Z",
    l: "M6.5,3.5 H17.5 M6.5,20.5 H17.5 M8,3.5 C8,8.5 11,10.5 12,12 C13,13.5 16,15.5 16,20.5 M16,3.5 C16,8.5 13,10.5 12,12 C11,13.5 8,15.5 8,20.5",
  },
  // Shop: a striped awning over a counter
  shop: {
    a: "M4,9 L5.5,4 H9 L8,9 Z M12,4 H15 L16,9 H12 Z M18.5,4 L20,9 H20 Z",
    l: "M4,9 L5.5,4 H18.5 L20,9 M4,9 a2,2 0 0 0 4,0 a2,2 0 0 0 4,0 a2,2 0 0 0 4,0 a2,2 0 0 0 4,0 M5.5,11 V20.5 H18.5 V11 M10,20.5 V15.5 H14 V20.5",
  },
  // Weather: a polite tornado swirl
  weather: {
    a: "M4,5.5 C8,4 16,4 20,5.5 C18,9 15,12 13.5,15 C12.8,16.5 12.6,18.5 12.5,21 H11.5 C11.2,18 10,15.5 9,13.5 C7.5,10.8 5.5,8.5 4,5.5 Z",
    l: "M4,5.5 C8,4 16,4 20,5.5 M6.5,9.5 C9.5,8.5 14.5,8.5 17.5,9.5 M8.5,13.5 C10.5,12.8 13.5,12.8 15,13.5 M10.3,17.5 C11.2,17.1 12.6,17.1 13.4,17.5 M11.6,21 H12.4",
  },
  // Water: a tail fin rising from a wave
  water: {
    a: "M12.5,15 C12.5,12 11.5,10 7.5,7.5 C10,6.8 11.8,7.8 12.5,9.2 C13.2,7.8 15,6.8 17.5,7.5 C13.5,10 12.5,12 12.5,15 Z",
    l: "M12.5,15 C12.5,12 11.5,10 7.5,7.5 C10,6.8 11.8,7.8 12.5,9.2 C13.2,7.8 15,6.8 17.5,7.5 C13.5,10 12.5,12 12.5,15 M2.5,16 C4.5,14.5 6.5,14.5 8.5,16 C10.5,17.5 12.5,17.5 14.5,16 C16.5,14.5 18.5,14.5 20.5,16 M6,19.8 C8,18.8 10,18.8 12,19.8 C14,20.8 16,20.8 18,19.8",
    f: `${circle(18.5, 3.5, 0.9)} ${circle(20.5, 6, 0.6)}`,
  },
  // Treasure: a chest with a glowing seam
  treasure: {
    a: "M4,11 V9 C4,6 6,4.5 8.5,4.5 H15.5 C18,4.5 20,6 20,9 V11 Z",
    l: "M4,11 H20 V19 a2,2 0 0 1 -2,2 H6 a2,2 0 0 1 -2,-2 Z M4,11 V9 C4,6 6,4.5 8.5,4.5 H15.5 C18,4.5 20,6 20,9 V11 M8,4.8 V11 M16,4.8 V11",
    f: "M10.5,10 H13.5 V14.5 H10.5 Z",
    h: "M6,8.8 C6,7.5 6.8,6.6 8,6.5 V7.5 C7.4,7.6 7,8.1 7,8.8 Z",
  },
  // Trace: a paw print (a trace, never an animal)
  trace: {
    a: `M12,12.5 C9.3,12.5 7,14.8 7,17 C7,19.2 9.2,19.8 12,19.3 C14.8,19.8 17,19.2 17,17 C17,14.8 14.7,12.5 12,12.5 Z ${circle(6, 10.5, 1.9)} ${circle(9.5, 6.5, 2)} ${circle(14.5, 6.5, 2)} ${circle(18, 10.5, 1.9)}`,
    l: "M12,12.5 C9.3,12.5 7,14.8 7,17 C7,19.2 9.2,19.8 12,19.3 C14.8,19.8 17,19.2 17,17 C17,14.8 14.7,12.5 12,12.5 Z",
  },
  // House: a haunted house, tilted roof, a ghostly window glow and a crescent
  house: {
    a: "M10,17 V14.5 a2,2 0 0 1 4,0 V17 Z",
    l: "M3.5,12.5 L11,5 L20.5,11 M5.5,11 V20.5 H18.5 V10 M15.5,7.8 V4.5 H17.5 V9.2 M10,17 V14.5 a2,2 0 0 1 4,0 V17 Z",
    f: "M20,2.5 a3,3 0 1 0 2.5,4.4 a2.4,2.4 0 0 1 -2.5,-4.4 Z",
  },
  // Bottle: a stoppered bottle holding a heart
  bottle: {
    a: "M6,14 H18 V18 a3,3 0 0 1 -3,3 H9 a3,3 0 0 1 -3,-3 Z",
    l: "M10.5,4.5 V7.3 C7.6,8.3 6,10.6 6,13.5 V18 a3,3 0 0 0 3,3 H15 a3,3 0 0 0 3,-3 V13.5 C18,10.6 16.4,8.3 13.5,7.3 V4.5 M9.5,2.5 H14.5 V4.5 H9.5 Z",
    f: "M12,19 C10.2,17.7 9.3,16.8 9.3,15.8 a1.35,1.35 0 0 1 2.7,-0.3 a1.35,1.35 0 0 1 2.7,0.3 C14.7,16.8 13.8,17.7 12,19 Z",
    h: "M8,12.5 C8.3,11 9,10 10,9.5 L10.4,10.4 C9.7,10.8 9.2,11.6 9,12.7 Z",
  },
  // Riddle: a pyramid with a question mark drawn as a symbol
  riddle: {
    a: "M12,3.5 L21.5,20.5 H15 Z",
    l: "M2.5,20.5 L12,3.5 L21.5,20.5 Z M12,3.5 L15,20.5 M8.6,12 a1.8,1.8 0 1 1 2.5,1.7 C10.5,14 10.3,14.4 10.3,15",
    f: circle(10.3, 17.3, 0.9),
  },
  // Dream: a cloud and a crescent
  dream: {
    a: "M17.8,2.5 a4.5,4.5 0 1 0 4,6.8 a3.6,3.6 0 0 1 -4,-6.8 Z",
    l: "M6.5,19.5 a3.5,3.5 0 0 1 -0.6,-7 a5,5 0 0 1 9.6,-1.4 a4,4 0 0 1 2.5,8.4 Z",
    f: `${star(4.5, 5.5, 2)} ${circle(10.5, 5, 0.7)}`,
  },
  // Lens: reading glasses with a glint
  lens: {
    a: `M3,11 H10.5 V13.5 a3.75,3.75 0 0 1 -7.5,0 Z M13.5,11 H21 V13.5 a3.75,3.75 0 0 1 -7.5,0 Z`,
    l: "M3,11 H10.5 V13.5 a3.75,3.75 0 0 1 -7.5,0 Z M13.5,11 H21 V13.5 a3.75,3.75 0 0 1 -7.5,0 Z M10.5,11.5 C11.2,10.6 12.8,10.6 13.5,11.5 M3,11 L1.8,8.5 M21,11 L22.2,8.5",
    f: star(17, 5, 2.4),
    h: "M5,12.5 H7 L5.5,15 Z M15.5,12.5 H17.5 L16,15 Z",
  },
  // Frame: an empty portrait frame with a sparkle inside
  frame: {
    a: "M7,6.5 H17 V17.5 H7 Z",
    l: "M4,3.5 H20 V20.5 H4 Z M7,6.5 H17 V17.5 H7 Z",
    f: star(12, 12, 3.6),
  },
  // Machine: a gear with an antenna
  machine: {
    a: gear(12, 14.5, 5.6, 7.4, 8),
    l: `${gear(12, 14.5, 5.6, 7.4, 8)} ${circle(12, 14.5, 2.2)} M12,7 V3`,
    f: circle(12, 2.6, 1.3),
  },
  // Scroll: a rolled contract with a star seal
  scroll: {
    a: "M7,4 H18 a2,2 0 0 1 0,4 H16.5 V18 a2.5,2.5 0 0 1 -2.5,2.5 H5.5 a2,2 0 0 1 0,-4 H7 Z",
    l: "M7,16.5 V4 H18 a2,2 0 0 1 0,4 H16.5 V18 a2.5,2.5 0 0 1 -2.5,2.5 H5.5 a2,2 0 0 1 0,-4 H12 V18.5 M10,8 H13.5 M10,11 H13.5",
    f: star(18.5, 16.5, 3.4),
  },
};

export const SETUP_GLYPHS = {
  // Best friend: two mugs clinking
  best_friend: {
    a: "M3.7,10.3 L9.8,9.1 L10.3,11.6 L4.2,12.8 Z M14.2,9.1 L20.3,10.3 L19.8,12.8 L13.7,11.6 Z",
    l: "M3.2,9.4 L10.5,8 L11.8,17.6 a2,2 0 0 1 -1.6,2.2 L7.3,20.4 a2,2 0 0 1 -2.3,-1.5 Z M3.9,12.6 C1.6,13.3 1.9,16.6 4.6,16.3 M20.8,9.4 L13.5,8 L12.2,17.6 a2,2 0 0 0 1.6,2.2 L16.7,20.4 a2,2 0 0 0 2.3,-1.5 Z M20.1,12.6 C22.4,13.3 22.1,16.6 19.4,16.3",
    f: star(12, 3.6, 2.4),
  },
  // Partner: two interlocked rings with a small gem
  partner: {
    a: "M9,3.6 L11.3,6.4 L9,9.2 L6.7,6.4 Z",
    l: `${circle(9, 14.5, 5.3)} ${circle(15, 14.5, 5.3)} M6.7,6.4 H11.3`,
  },
  // Crush: a folded note sealed with a small heart
  crush: {
    a: "M3.5,7 H20.5 V18.5 H3.5 Z",
    l: "M3.5,7 H20.5 V18.5 H3.5 Z M3.5,7 L12,13.2 L20.5,7",
    f: "M12,17.3 C10.1,15.9 9.2,15 9.2,13.9 a1.4,1.4 0 0 1 2.8,-0.3 a1.4,1.4 0 0 1 2.8,0.3 C14.8,15 13.9,15.9 12,17.3 Z",
  },
  // Sibling: two matching sneakers
  sibling: {
    a: "M2.5,19 H11.5 V20.5 H2.5 Z M12.5,13 H21.5 V14.5 H12.5 Z",
    l: "M2.5,20.5 V15.5 L5.8,15 L7.8,17 C9.8,17.2 11.2,17.8 11.5,19 V20.5 Z M4.6,15.2 V13.8 H6.2 M12.5,14.5 V9.5 L15.8,9 L17.8,11 C19.8,11.2 21.2,11.8 21.5,13 V14.5 Z M14.6,9.2 V7.8 H16.2",
  },
  // Parent: a house key on a ring
  parent: {
    a: circle(9, 9, 3.6),
    l: `${circle(9, 9, 3.6)} M11.6,11.6 L19.5,19.5 M16.5,16.5 L18.2,14.8 M14.5,14.5 L15.8,13.2 M3.8,5.2 A5.6,5.6 0 1 1 4.3,13.4`,
    f: circle(9, 9, 1.1),
  },
  // Someone else: a single sparkle
  other: {
    a: "M12,2.5 C12.9,8.7 15.3,11.1 21.5,12 C15.3,12.9 12.9,15.3 12,21.5 C11.1,15.3 8.7,12.9 2.5,12 C8.7,11.1 11.1,8.7 12,2.5 Z",
    l: "M12,2.5 C12.9,8.7 15.3,11.1 21.5,12 C15.3,12.9 12.9,15.3 12,21.5 C11.1,15.3 8.7,12.9 2.5,12 C8.7,11.1 11.1,8.7 12,2.5 Z",
    f: `${star(19.5, 4.5, 1.8)} ${star(4.5, 19.5, 1.4)}`,
  },
};

export const CHAPTER_KEYS = [1, 2, 3, 4, 5, 6, 7, "extras", "finale"];
export const FORMAT_TYPES = ["scenario", "real", "receipts", "bet", "reply", "others", "this_or_that", "role", "pick_two", "rank", "eyes", "feeling", "sealed"];
export const SETUP_IDS = ["best_friend", "partner", "crush", "sibling", "parent", "other"];
export const ROOMS = ["love", "work", "family"];
