// Theme store: the lobby voice sets the light (section 3.4). Writes html[data-theme] and notifies subscribers.
// Night is not a theme: it is scoped per element with [data-scene="night"].
import { themes, motionFor, durations, easings, springs, themeForVoice } from "./tokens.js";

export const THEMES = Object.freeze(["day", "dusk", "clear"]);
const listeners = new Set();
let current = "day";

const root = () => (typeof document !== "undefined" ? document.documentElement : null);

export function currentTheme() {
  const attr = root()?.dataset?.theme;
  return THEMES.includes(attr) ? attr : current;
}

// Crossfades the whole page between lights when the browser can (View Transitions), else switches at once.
function paint(next, { fade = false } = {}) {
  const el = root();
  if (!el || el.dataset.theme === next) return;
  const reduced = typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || document.body?.dataset.motion === "off");
  if (fade && !reduced && typeof document.startViewTransition === "function") {
    try { document.startViewTransition(() => { el.dataset.theme = next; }); return; } catch { /* fall through */ }
  }
  el.dataset.theme = next;
}

export function setTheme(theme, { fade = false } = {}) {
  const next = THEMES.includes(theme) ? theme : "day";
  current = next;
  paint(next, { fade });
  for (const fn of [...listeners]) fn(next);
  return next;
}

// Shows a light on the whole page without committing it (lobby voice preview). previewTheme(null) goes back.
export function previewTheme(theme) {
  const next = THEMES.includes(theme) ? theme : current;
  paint(next, { fade: true });
  for (const fn of [...listeners]) fn(next);
  return next;
}

export const setThemeForVoice = (voice, opts) => setTheme(themeForVoice(voice), opts);

export function subscribeTheme(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Motion values for the current theme (voice multipliers applied). Read at use time: motion.ms.base, motion.s.slow.
export const motion = Object.freeze({
  get theme() { return currentTheme(); },
  get scale() { return (themes[currentTheme()] || themes.day).motionScale; },
  get ms() { return motionFor(currentTheme()).ms; },
  get s() { return motionFor(currentTheme()).s; },
  get bursts() { return motionFor(currentTheme()).bursts; },
  base: durations,
  easings,
  springs,
  for: motionFor,
});
