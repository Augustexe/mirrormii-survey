// The one story line under the title on story 2 and the share card (decision 1a, 2026-09-30): one sentence per
// people x day-to-day pair that merges both halves, in both voices. Source: research/persona-quiz-v2/final/naming/
// names-64.json, field `line` per combo ({ fun, heart }). Its merged adjective names were rejected and are never read;
// kit-strip.mjs drops everything but the key and the line from the app bundle. Keyed by the two type codes, so a renamed
// archetype in library.json keeps its line.
import names64 from "../../../research/persona-quiz-v2/final/naming/names-64.json" with { type: "json" };

export const comboKey = (peopleCode, lifeCode) => `${peopleCode}|${lifeCode}`;

export const COMBO_LINES = Object.freeze(Object.fromEntries((names64.combos || [])
  .filter((c) => c && typeof c.key === "string" && c.line && typeof c.line === "object")
  .map((c) => [c.key, Object.freeze({ fun: c.line.fun || null, heart: c.line.heart || null })])));

// The line for one pair in one wording ("fun" or "heart"), or null when the pair has none.
export function comboLine(lines, peopleCode, lifeCode, wording) {
  const entry = lines && lines[comboKey(peopleCode, lifeCode)];
  if (!entry) return null;
  const v = wording === "heart" ? entry.heart || entry.fun : entry.fun || entry.heart;
  return typeof v === "string" && v.trim() ? v : null;
}
