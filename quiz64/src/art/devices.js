// A-05: world-device families and deviceFor(card) (DESIGN-DIRECTION.md sections 5.5 and 6).
// Pure: no React, so node tests and the card shell can both import it.
//
// deviceFor(card) returns one of:
//   a family id from DEVICE_FAMILIES     absurd cards whose device has a glyph
//   "chapter-<key>" (key 1..7, extras, finale)  the intentional chapter vignette: unusual cards, and absurd
//                                        cards whose device has no family (listed as "chapter" below)
//   null                                 everyday cards (no vignette), or no card

export const DEVICE_FAMILIES = [
  "lamp", // wish lamp: genies, wishes, fairies, wizards
  "bell",
  "door",
  "fortune", // 8-ball, fortune cookie, snow globe
  "time", // clock, hourglass, moon phase for a long sleep
  "shop", // awning
  "weather", // tornado swirl, rain cloud
  "water", // wave, tail fin, whale tail
  "treasure", // chest, coin pot, golden egg
  "trace", // paw print, feather, bone (never an animal with a face)
  "house", // haunted house: tilted roof, ghostly window glow
  "bottle", // stoppered bottle with a heart
  "riddle", // pyramid with a question mark
  "dream", // cloud and crescent
  "lens", // glasses, telescope
  "frame", // empty portrait frame with sparkle
  "machine", // gear with antenna
  "scroll", // rolled contract with a star seal
];

// Every absurd-world device in research/persona-quiz-v2/final/bank (2026-09-29, bank revision included). "chapter" marks an
// intentional fallback to the chapter vignette. tests/art-geometry.test.mjs fails when the bank gains an
// absurd device that is not listed here, so every new one is mapped on purpose.
export const DEVICE_TABLE = {
  // Chapter 1, Your phone
  "life-billboard": "frame",
  "friendship-houseplants": "chapter",
  "mystery-envelope-machine": "machine",
  "rogue-map-app": "machine",
  "truth-autocorrect": "machine",
  "unlockable-wish-phone": "lamp",
  "ghost-poet": "house",
  "talking-fridge": "machine",
  "ear-advisor": "lamp",
  "honest-mirror": "frame",
  // Chapter 2, Friends
  "ten-year sleep": "time",
  "friendship repair shop": "shop",
  "magic 8-ball": "fortune",
  "rhyme curse": "lamp",
  "summoning bell": "bell",
  "magic door": "door",
  "haunted house": "house",
  "bottled love": "bottle",
  sphinx: "riddle",
  "text-first-ring": "treasure",
  "four-apologies": "scroll",
  "mars-return": "chapter", // no space family; the Friends vignette carries it
  "grudge-stone": "chapter", // a carried stone has no family; the Friends vignette carries it
  // Chapter 3, Love and your person
  "shared dreams": "dream",
  "memory-erase vending machine": "machine",
  "message-reading glasses": "lens",
  "award-for-anniversaries trade": "scroll",
  "talking doorbell": "bell",
  "text from future self": "time",
  "time skip": "time",
  "flickering-lamp": "lamp",
  "statue-unveiling": "frame",
  // Chapter 4, Money and treats
  "polite-tornado": "weather",
  "mermaid-housemate": "water",
  "pirate-chest": "treasure",
  "talking-cat": "trace",
  "leprechaun-gold": "treasure",
  "fairy-godparent": "lamp",
  "pigeon-bill": "trace",
  "genii-pays-forever": "lamp",
  "time-traveler-concert": "time",
  "money-tree": "treasure",
  // Chapter 5, Work, school and ambition
  "genie-fame-deal": "lamp",
  "promoted-office-dog": "trace",
  "barn-muffins-chickens": "trace",
  "never-wrong-fortune-cookie": "fortune",
  "shared-genie-wish": "lamp",
  "wizard-apprentice": "lamp",
  "eighth-day": "time",
  "weather-booking-desk": "weather",
  // Chapter 6, Family and home
  "lazy-river": "water",
  "home-robot": "machine",
  whale: "water",
  "wish-granting-duty": "lamp",
  "golden-goose": "treasure",
  "magic-portrait": "frame",
  "wishing-well-door": "door",
  "cat-year": "trace",
  "squirrel-knighting": "trace",
  "life-board-game": "lamp", // Genii's gift
  "every-relative-wedding": "lamp", // Genii's offer
  // Chapter 7, Play, rules and you
  "kitten-referee": "trace",
  "gnome-village": "chapter",
  "time-loop": "time",
  "life-scoreboard": "machine",
  "superhero-chat": "chapter",
  clone: "frame",
  "feeling-after-clone": "frame",
  "secret-month": "time",
  "vacation-globe": "fortune",
  "vanishing-lists": "scroll",
  "fix-touch-power": "machine",
  // Extras
  "group-teleport": "door",
  "holiday-curse": "chapter",
  "bottomless-fund": "treasure",
  "snow-globes": "fortune",
  "mood-link": "weather",
  "lighthouse-rulebook": "scroll",
  "dragon-savings": "treasure",
  "genii-wall-frame": "frame",
  "self-building-house": "house",
  // Finale (sealed)
  "rain-cloud": "weather",
  "stork-delivery": "trace",
  "blind-life-swap": "door",
  "five-year-contract": "scroll",
  "reunion-name-tag": "chapter",
  "freeze-remote": "machine",
  "dragon-roommate": "treasure",
  "portal-hamster-passport": "door",
};

// Keyword fallback for devices the table has not met yet (device string first, then the prompt).
// Order matters: the first match wins.
export const DEVICE_KEYWORDS = [
  [/\b(?:door ?bell|bell)\b/, "bell"],
  [/\b(?:genie|genii|wish\w*|fairy|wizard|lamp)\b/, "lamp"],
  [/(?:8-ball|fortune|crystal ball|palm reader|snow ?globe)/, "fortune"],
  [/\b(?:robot|machine|fridge|remote|app|autocorrect|scoreboard|gadget)\b/, "machine"],
  [/\b(?:sleep|nap|time|future|clock|hourglass|loop)\b/, "time"],
  [/\b(?:shop|store|market|awning)\b/, "shop"],
  [/\b(?:tornado|storm|rain|cloud|weather|lightning)\b/, "weather"],
  [/\b(?:mermaid|whale|wave|river|ocean|sea|lake)\b/, "water"],
  [/\b(?:treasure|chest|gold|coins?|pirate|leprechaun|egg)\b/, "treasure"],
  [/\b(?:cat|dog|kitten|puppy|paw|pigeon|bird|feather|stork|goose|chickens?|bone)\b/, "trace"],
  [/\b(?:haunt\w*|ghost\w*|mansion)\b/, "house"],
  [/\b(?:bottle\w*|potion|jar)\b/, "bottle"],
  [/\b(?:sphinx|riddle|pyramid|puzzle)\b/, "riddle"],
  [/\b(?:dreams?|nightmare)\b/, "dream"],
  [/\b(?:glasses|lens|telescope|binoculars)\b/, "lens"],
  [/\b(?:portrait|painting|frame|billboard|clone)\b/, "frame"],
  [/\b(?:contract|scroll|deal|curse|trade)\b/, "scroll"],
  [/\b(?:door|portal|teleport|swap)\b/, "door"],
];

export function keywordFamily(text) {
  const t = String(text ?? "").toLowerCase();
  if (!t) return null;
  for (const [re, family] of DEVICE_KEYWORDS) if (re.test(t)) return family;
  return null;
}

// "1".."7", "extras" (X- cards) or "finale" (sealed / S- cards).
export function cardChapterKey(card) {
  const n = Number(card?.chapter);
  if (Number.isInteger(n) && n >= 1 && n <= 7) return String(n);
  const id = String(card?.id ?? "");
  if (card?.type === "sealed" || id.startsWith("S-")) return "finale";
  return "extras";
}

export const chapterDeviceId = (card) => `chapter-${cardChapterKey(card)}`;
export const isChapterDevice = (id) => typeof id === "string" && id.startsWith("chapter-");
export const isDeviceFamily = (id) => DEVICE_FAMILIES.includes(id);

// Family for a device key alone (table, then keywords); "chapter" or null when there is none.
export function deviceFamily(device, prompt = "") {
  if (device && Object.prototype.hasOwnProperty.call(DEVICE_TABLE, device)) return DEVICE_TABLE[device];
  return keywordFamily(device) || keywordFamily(prompt);
}

export function deviceFor(card) {
  if (!card || typeof card !== "object") return null;
  const world = card.world;
  if (world === "everyday") return null;
  if (world === "unusual") return chapterDeviceId(card);
  const device = card.fp?.device;
  // Legacy cards with no world and no device: only a clear keyword earns a glyph.
  if (!world && !device) {
    const family = keywordFamily(card.prompt);
    return family || null;
  }
  const family = deviceFamily(device, card.prompt);
  return family && family !== "chapter" ? family : chapterDeviceId(card);
}
