// Canvas defaults mirrored from the tokens (DESIGN-DIRECTION.md section 4.2). This is the ONLY file in
// src/art allowed to hold hex literals (tests/art-geometry.test.mjs enforces it). SVG components never
// read these directly: they call `v(name)`, which yields `var(--name, default)`, so Day, Dusk, Clear and
// Night come from the CSS custom properties and the default only shows when a token is missing.
// Canvas code (share image) reads CANVAS_DEFAULTS or resolves the live value with `resolve(name)`.

export const CANVAS_DEFAULTS = {
  "c-canvas": "#F8F8FF",
  "c-canvas-2": "#EFEDFC",
  "c-surface-solid": "#FFFFFF",
  "c-ink": "#1E1B2E",
  "c-ink-2": "#4A4560",
  "c-ink-3": "#6E6987",
  "c-line": "#E2DEF7",
  "c-violet": "#8071E4",
  "c-violet-300": "#B3AAF0",
  "c-violet-100": "#E9E6FB",
  "c-violet-text": "#5646C0",
  "c-violet-strong": "#6A5AD6",
  // White in every theme and in night (text on --g-deep); art uses it for highlights and rim light.
  "c-on-deep": "#FFFFFF",
  // Backdrop glows (Day defaults; Dusk swaps to rose and peach through tokens.css).
  "glow-a": "#988DEA",
  "glow-b": "#8FB8F2",
  "glow-c": "#C9B3F0",
  // The two stops of --g-deep and --g-brand, for SVG gradients (CSS gradients cannot feed SVG stops).
  "g-deep-1": "#5A4ED6",
  "g-deep-2": "#4A63D3",
  "g-brand-1": "#988DEA",
  "g-brand-2": "#5B8BEB",
  "n-900": "#171625",
  "n-800": "#1F1D33",
  "n-700": "#2A2744",
  "n-600": "#38345A",
  "n-ink": "#F3F1FF",
  "n-ink-2": "#C9C4EE",
  "n-ink-3": "#9A94C0",
  "n-violet": "#A99CF5",
  // Chapter tints and their deep partners (icons on tint). Never text colors.
  "tint-ch1": "#8FB8F2",
  "tint-ch1-deep": "#3D6FC4",
  "tint-ch2": "#F4B8A0",
  "tint-ch2-deep": "#B5603F",
  "tint-ch3": "#F2A7C3",
  "tint-ch3-deep": "#B0426E",
  "tint-ch4": "#F2D48A",
  "tint-ch4-deep": "#9A7419",
  "tint-ch5": "#96D8C4",
  "tint-ch5-deep": "#2E8A6E",
  "tint-ch6": "#C9B3F0",
  "tint-ch6-deep": "#6A4BB8",
  "tint-ch7": "#8EDBE6",
  "tint-ch7-deep": "#2A8595",
  "tint-extras": "#DCE3F2",
  "tint-extras-deep": "#5B6A8C",
  "tint-finale": "#E6E4F5",
  "tint-finale-deep": "#5646C0",
  "tint-finale-rim": "#8071E4",
  // Silver mirror backing (section 4.3, Mirror material).
  "mirror-silver-1": "#EEF0FA",
  "mirror-silver-2": "#C9CCE0",
};

// `var(--name, default)` for inline SVG attributes and styles.
export function v(name) {
  const fallback = CANVAS_DEFAULTS[name];
  return fallback ? `var(--${name}, ${fallback})` : `var(--${name})`;
}

// Live token value for canvas drawing; falls back to the mirrored default outside the browser.
export function resolve(name, el) {
  try {
    const root = el || (typeof document !== "undefined" ? document.documentElement : null);
    const live = root && typeof getComputedStyle === "function" ? getComputedStyle(root).getPropertyValue(`--${name}`).trim() : "";
    return live || CANVAS_DEFAULTS[name] || "";
  } catch {
    return CANVAS_DEFAULTS[name] || "";
  }
}

// Chapter keys: 1..7, "extras", "finale".
export function chapterKey(chapter) {
  const n = Number(chapter);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return `ch${n}`;
  if (chapter === "extras" || chapter === "finale") return chapter;
  return "extras";
}

export const tint = (chapter) => v(`tint-${chapterKey(chapter)}`);
export const tintDeep = (chapter) => v(`tint-${chapterKey(chapter)}-deep`);

// Emotion beads (section 4.2): 12 emotions onto 6 tints. Unknown or missing: the chapter tint.
export const EMOTION_TINT = {
  delight: "ch4",
  pride: "ch4",
  warmth: "ch2",
  relief: "ch2",
  longing: "ch1",
  worry: "ch1",
  guilt: "ch3",
  cringe: "ch3",
  irritation: "ch6",
  resentment: "ch6",
  envy: "ch6",
  sting: "finale",
};

export function emotionTint(emotion, chapter) {
  const key = EMOTION_TINT[emotion];
  return key ? v(`tint-${key}`) : tint(chapter);
}

// Rooms (lobby doors) borrow their chapter's light.
export const ROOM_CHAPTER = { love: 3, work: 5, family: 6 };

// The World Mirror's materials (LAUNCH-SPEC 25), sampled from the canon frame render: the iridescent opal ring (pearl
// white with pink, peach, sky and lilac lights), the opal edge of a rebuilt shard, the marble plinth, and the pastel sky
// that stands in the glass before the room render decodes. Shared by MirrorArch, the landing mirror and the canvas card.
export const OPAL = Object.freeze({
  ring: ["#F7F1FF", "#FFD6EA", "#FFFFFF", "#CFE3FF", "#E6D8FF", "#FFE9D6", "#FFFFFF", "#D9CCFF"],
  edge: ["#FFD6EA", "#FFFFFF", "#CFE3FF", "#E6D8FF"],
  glass: ["#E9DDFB", "#FBE8F1", "#E4DEF7"],
  sky: ["#D9C8F6", "#F8DCE8", "#E9DDF6"],
  rim: "#B7A8E4",
  marble: { hi: "#FFFFFF", lo: "#E4DDF3", top: "#FBF9FF", side: "#D8D0EA", top2: "#FFFFFF", side2: "#DDD5EE" },
});
