// MirrorMii survey design tokens for canvas and motion code (docs/DESIGN-DIRECTION.md section 4).
// Mirrors src/system/tokens.css; tests/system-tokens.test.mjs fails when the two drift apart.

export const fonts = Object.freeze({
  display: '"Fraunces", "Fraunces fallback", Georgia, "Times New Roman", serif',
  text: '"Figtree", "Figtree fallback", system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  displayUpright: '"SOFT" 100, "WONK" 0',
  displayItalic: '"SOFT" 100, "WONK" 1',
});

// [size px, line px, weight, tracking em] for phone and desktop; face is "display" (Fraunces) or "text" (Figtree).
const t = (face, phone, desktop, weight, track, extra = {}) => Object.freeze({ face, phone, desktop, weight, track, ...extra });
export const type = Object.freeze({
  hero: t("display", [44, 46], [80, 80], 600, -0.025),
  display: t("display", [36, 40], [60, 62], 600, -0.02),
  promptS: t("display", [30, 34], [40, 46], 560, -0.015, { maxChars: 70 }),
  promptM: t("display", [26, 30], [34, 40], 560, -0.01, { maxChars: 120 }),
  promptL: t("display", [22, 27], [28, 34], 540, -0.005, { maxChars: 170 }),
  title: t("display", [22, 28], [26, 32], 580, -0.01),
  genii: t("display", [15, 20], [17, 24], 420, 0, { italic: true }),
  quote: t("display", [24, 31], [30, 38], 460, -0.01, { italic: true }),
  bodyL: t("text", [18, 27], [20, 30], 450, 0),
  answer: t("text", [16, 21], [17, 23], 500, 0),
  body: t("text", [16, 24], [16, 24], 400, 0),
  small: t("text", [14, 20], [14, 20], 500, 0.005),
  kicker: t("text", [12, 16], [13, 16], 700, 0.12, { uppercase: true }),
  micro: t("text", [11, 14], [11, 14], 600, 0.04),
});

// Canvas font string for a type token, e.g. fontFor("title", 2) -> "580 44px Fraunces..."
export function fontFor(name, scale = 1, { desktop = false } = {}) {
  const tok = type[name];
  if (!tok) throw new Error(`Unknown type token: ${name}`);
  const [size] = desktop ? tok.desktop : tok.phone;
  return `${tok.italic ? "italic " : ""}${tok.weight} ${Math.round(size * scale)}px ${tok.face === "display" ? fonts.display : fonts.text}`;
}

export const color = Object.freeze({
  canvas: "#F8F8FF",
  canvas2: "#EFEDFC",
  surface: "rgba(255, 255, 255, 0.72)",
  surfaceSolid: "#FFFFFF",
  ink: "#1E1B2E",
  ink2: "#4A4560",
  ink3: "#6E6987",
  line: "#E2DEF7",
  violet: "#8071E4",
  violet300: "#B3AAF0",
  violet100: "#E9E6FB",
  violetText: "#5646C0",
  violetStrong: "#6A5AD6",
  focus: "#5646C0",
  danger: "#B4235A",
});

export const gradients = Object.freeze({
  brand: ["#988DEA", "#5B8BEB"], // 135deg, ink text only
  deep: ["#5A4ED6", "#4A63D3"], // 135deg, white text
  deepDusk: ["#5A4ED6", "#8A4FB8"],
});

export const night = Object.freeze({
  n900: "#171625",
  n800: "#1F1D33",
  n700: "#2A2744",
  n600: "#38345A",
  ink: "#F3F1FF",
  ink2: "#C9C4EE",
  ink3: "#9A94C0",
  violet: "#A99CF5",
  glow: ["rgba(201, 194, 246, 0.55)", "rgba(128, 113, 228, 0)"],
});

export const themes = Object.freeze({
  day: Object.freeze({ canvas: "#F8F8FF", canvas2: "#EFEDFC", glows: ["#988DEA", "#8FB8F2", "#C9B3F0"], glowStrength: 1, motionScale: 1, bursts: true }),
  dusk: Object.freeze({ canvas: "#F7F2FB", canvas2: "#F6E9F1", glows: ["#F2C4D8", "#F8D5C6", "#C9B3F0"], glowStrength: 1, motionScale: 1.25, bursts: false, deep: ["#5A4ED6", "#8A4FB8"] }),
  clear: Object.freeze({ canvas: "#F8F8FF", canvas2: "#EFEDFC", glows: ["#988DEA", "#8FB8F2", "#C9B3F0"], glowStrength: 0.5, motionScale: 0.85, bursts: false }),
});

// Lobby voice -> theme (section 3.4).
export const VOICE_THEME = Object.freeze({ fun: "day", heart: "dusk", cards: "clear" });
export const themeForVoice = (voice) => VOICE_THEME[voice] || "day";

// Chapter tints: 1..7, extras, finale. Never text colors.
export const chapterTint = Object.freeze({
  1: Object.freeze({ name: "sky", tint: "#8FB8F2", deep: "#3D6FC4" }),
  2: Object.freeze({ name: "peach", tint: "#F4B8A0", deep: "#B5603F" }),
  3: Object.freeze({ name: "rose", tint: "#F2A7C3", deep: "#B0426E" }),
  4: Object.freeze({ name: "butter", tint: "#F2D48A", deep: "#9A7419" }),
  5: Object.freeze({ name: "mint", tint: "#96D8C4", deep: "#2E8A6E" }),
  6: Object.freeze({ name: "lilac", tint: "#C9B3F0", deep: "#6A4BB8" }),
  7: Object.freeze({ name: "aqua", tint: "#8EDBE6", deep: "#2A8595" }),
  extras: Object.freeze({ name: "pearl", tint: "#DCE3F2", deep: "#5B6A8C" }),
  finale: Object.freeze({ name: "frost", tint: "#E6E4F5", deep: "#5646C0", rim: "#8071E4" }),
});

export const beads = Object.freeze({ butter: "#F2D48A", peach: "#F4B8A0", sky: "#8FB8F2", rose: "#F2A7C3", lilac: "#C9B3F0", frost: "#E6E4F5" });
export const EMOTION_BEAD = Object.freeze({
  delight: "butter", pride: "butter",
  warmth: "peach", relief: "peach",
  longing: "sky", worry: "sky",
  guilt: "rose", cringe: "rose",
  irritation: "lilac", resentment: "lilac", envy: "lilac",
  sting: "frost",
});
// Bead color for an emotion; unknown or missing falls back to the chapter tint.
export function beadFor(emotion, chapter) {
  const bead = EMOTION_BEAD[emotion];
  if (bead) return beads[bead];
  return (chapterTint[chapter] || chapterTint.extras).tint;
}

export const materials = Object.freeze({
  glass: Object.freeze({ fill: "rgba(255, 255, 255, 0.72)", blur: 22, saturate: 1.5, border: "rgba(255, 255, 255, 0.85)" }),
  tile: Object.freeze({ fill: "rgba(255, 255, 255, 0.88)", border: "#E2DEF7", radius: 18 }),
  glassDark: Object.freeze({ fill: "rgba(31, 29, 51, 0.55)", blur: 24, border: "rgba(201, 196, 238, 0.18)", rim: "rgba(169, 156, 245, 0.35)" }),
  frost: Object.freeze({ overlayOpacity: 0.06, blur: 0.3 }),
  mirror: Object.freeze({ backing: ["#EEF0FA", "#C9CCE0"], backingOpacity: 0.2, glassOpacity: 0.18, specularWidth: 0.3, specularAngle: -20 }),
  grain: Object.freeze({ size: 160, opacity: 0.035, blend: "soft-light" }),
  glow: Object.freeze({ blur: 40, maxElement: 400 }),
});

export const space = Object.freeze([4, 8, 12, 16, 20, 24, 32, 40, 56, 72, 96, 128]);
export const layout = Object.freeze({
  gutter: 16, gutterXs: 12, cardPad: 20, cardPadDesktop: 32, answerGap: 8, sectionGap: 24, sectionGapDesktop: 40,
  contentMax: 1240, sheetMax: 560, headerH: 52, headerHDesktop: 64,
  breakpoints: Object.freeze({ xs: 360, tablet: 600, desktop: 1024, wide: 1440 }),
});
export const radii = Object.freeze({ chip: 8, tileS: 14, answer: 18, sheet: 28, hero: 36, pill: 999 });
export const elevation = Object.freeze({
  e1: "0 1px 2px rgba(23, 22, 37, 0.06), 0 0 0 1px rgba(226, 222, 247, 0.9)",
  e2: "0 10px 28px -10px rgba(86, 70, 192, 0.22)",
  e3: "0 28px 64px -24px rgba(86, 70, 192, 0.32)",
  glowG1: "0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 0 44px rgba(152, 141, 234, 0.35)",
  e3Night: "0 30px 80px -20px rgba(0, 0, 0, 0.55)",
});

// Durations in ms at the Day scale; use motionFor(theme) for the themed values.
export const durations = Object.freeze({ instant: 90, quick: 160, base: 240, slow: 420, scene: 700, reveal: 1600, reduced: 120 });
// Decorative loop lengths and fog timings in ms (tokens.css --d-loop-*, --d-fog-*).
export const loops = Object.freeze({ step: 60, decorDelay: 300, breath: 4800, pulse: 3000, bob: 6000, shimmer: 8000, orbit: 18000, wisp: 11000, fogRefill: 2500, fogPeek: 1500 });
export const easings = Object.freeze({
  out: [0.2, 0.8, 0.2, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.4, 0, 1, 1],
});
export const springs = Object.freeze({
  tap: Object.freeze({ type: "spring", stiffness: 520, damping: 34 }),
  settle: Object.freeze({ type: "spring", stiffness: 180, damping: 24 }),
});
export const choreography = Object.freeze({ headingRise: 8, stepMs: 60, maxSteps: 4, maxStagger: 280, contentReadyMs: 300, exitLift: 6, decorationMs: 700, loopMinMs: 6000 });

// Motion values with a theme's multiplier applied. Durations are returned in ms and in seconds (for motion/react).
export function motionFor(theme = "day") {
  const scale = (themes[theme] || themes.day).motionScale;
  const ms = Object.fromEntries(Object.entries(durations).map(([k, v]) => [k, k === "reduced" ? v : v * scale]));
  const s = Object.fromEntries(Object.entries(ms).map(([k, v]) => [k, v / 1000]));
  return Object.freeze({ theme, scale, ms: Object.freeze(ms), s: Object.freeze(s), easings, springs, bursts: (themes[theme] || themes.day).bursts });
}

export const geniiSizes = Object.freeze({ xs: 24, s: 32, m: 72, l: 160, xl: 280 });
export const GENII_MOODS = Object.freeze(["listening", "noted", "thinking", "hush", "sure", "idle"]);
