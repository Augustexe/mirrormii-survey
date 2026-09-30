// Authoring-only fields in the persona quiz V2 kit (research/persona-quiz-v2/final) that the scorer never reads:
// masks ("looks like X; measures Y"), situation fingerprints (fp), trigger notes, origins, "never read as" notes,
// translation notes and build notes. The Heart to heart text (heart) is player-facing and stays.
// The web build drops them so the bundle does not ship what a card secretly measures. tests/persona-kit.test.mjs
// proves the scorer returns identical results on the stripped and the full kit.
import { sceneTitle } from "./src/persona/scene-titles.js";

export const AUTHORING_KEYS = new Set([
  "mask", "ae", "triggers", "origin", "never", "sources", "cardNotes", "backupWhy", "optionsNote", "gate",
  "zhStatus", "zhSally", "fp",
]);

// A card keeps a few words of its scene as `title` (Genii's calls screen names each locked guess by its scene) before
// its fingerprint goes: sceneTitle() reads only the fingerprint's device, never what the card measures.
export function stripAuthoring(value) {
  if (Array.isArray(value)) return value.map(stripAuthoring);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const [key, item] of Object.entries(value)) if (!AUTHORING_KEYS.has(key)) out[key] = stripAuthoring(item);
  if (value.fp && typeof value.id === "string" && typeof value.prompt === "string" && typeof out.title !== "string") {
    const title = sceneTitle(value.fp);
    if (title) out.title = title;
  }
  // The device is a scene prop (e.g. "carrier-owl-offer"), not what the card measures: keep it so the card art
  // resolves from DEVICE_TABLE instead of falling back to keywords.
  if (value.fp?.device && typeof value.id === "string" && typeof out.device !== "string") out.device = value.fp.device;
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
