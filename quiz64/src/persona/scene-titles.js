// A short scene title for a card ("The shared sailboat"), for Genii's calls screen. Derived from the card's scene
// device in its situation fingerprint (research bank field `fp.device`), which the web build strips as an authoring
// field: kit-strip.mjs calls sceneTitle() before stripping and keeps only the result as the card's `title`, so the
// bundle carries a few words of scene and nothing about what the card measures. Pure; node tests import it.
//
// Most devices read well as "The <device words>"; the table below rewrites the ones that do not. A device the bank adds
// later falls back to the derived form, so a new card never ships without a title.

export const SCENE_TITLES = Object.freeze({
  "co-owned-sailboat": "The shared sailboat",
  "viral-comments": "The viral video",
  "partner-dating-profile": "The dating profile",
  "family-video-call": "The family call",
  "cabin-tradition": "The cabin weekend",
  "game-show-final": "The game show final",
  "chef-offer": "The chef's offer",
  "nameless-club": "The club with no name",
  "murder-mystery-party": "The murder mystery",
  "talent-show-judge": "The talent show",
  "hero-code": "The hero code",
  "milestone-rival": "The rival",
  "spoiler-rule": "The watch party",
  "five-year-contract": "The five-year contract",
  "covered-mosaic": "The hidden mosaic",
});

const MAX_WORDS = 5;

export function sceneTitle(fp) {
  const device = fp && typeof fp === "object" ? fp.device : typeof fp === "string" ? fp : null;
  if (typeof device !== "string" || !device.trim()) return "";
  const key = device.trim().toLowerCase();
  if (SCENE_TITLES[key]) return SCENE_TITLES[key];
  const words = key.replace(/[^a-z0-9' ]+/g, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length || words.length > MAX_WORDS - 1) return "";
  return `The ${words.join(" ")}`;
}
