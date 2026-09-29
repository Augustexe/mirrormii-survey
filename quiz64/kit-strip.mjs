// Authoring-only fields in the persona quiz V2 kit (research/persona-quiz-v2/final) that the scorer never reads:
// masks ("looks like X; measures Y"), trigger notes, origins, "never read as" notes, translation notes and build notes.
// The web build drops them so the bundle does not ship what a card secretly measures. tests/persona-kit.test.mjs
// proves the scorer returns identical results on the stripped and the full kit.
export const AUTHORING_KEYS = new Set([
  "mask", "ae", "triggers", "origin", "never", "sources", "cardNotes", "backupWhy", "optionsNote", "gate",
  "zhStatus", "zhSally",
]);

export function stripAuthoring(value) {
  if (Array.isArray(value)) return value.map(stripAuthoring);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) if (!AUTHORING_KEYS.has(key)) out[key] = stripAuthoring(item);
  return out;
}

export const KIT_FILES = /research\/persona-quiz-v2\/final\/(cards|library|friend)\.json$/;

// Vite plugin: runs before the JSON plugin and rewrites the three kit files without authoring fields.
export function stripKitPlugin() {
  return {
    name: "genii-strip-persona-kit",
    enforce: "pre",
    transform(code, id) {
      const file = id.split("?")[0].replaceAll("\\", "/");
      if (!KIT_FILES.test(file)) return null;
      return { code: JSON.stringify(stripAuthoring(JSON.parse(code))), map: null };
    },
  };
}
