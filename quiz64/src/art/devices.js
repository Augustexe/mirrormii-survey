// A-05: world-device families and deviceFor(card) (DESIGN-DIRECTION.md sections 5.5 and 6).
// Pure: no React, so node tests and the card shell can both import it.
//
// deviceFor(card) returns one of:
//   a family id from DEVICE_FAMILIES     absurd cards whose device has a glyph
//   "chapter-<key>" (key 1..7, extras, finale)  the intentional chapter vignette: unusual cards, and absurd
//                                        cards whose device has no family (listed as "chapter" below)
//   null                                 everyday cards (no vignette), or no card

// Genii is a slime, never a genie: no lamp, no genie tropes (LAUNCH-SPEC section 23, ruling 2). Wishes draw a
// wishing star, Genii's offers draw a gift box, invitations, deals whispered in secret and letters draw an envelope.
export const DEVICE_FAMILIES = [
  "star", // wishing star: wishes, fairy godparents, wizards, magic lights
  "envelope", // sealed envelope: invitations, secret advice, letters
  "gift", // wrapped gift: something Genii offers, with a catch
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
  "mountain", // a peak with a summit flag: a hill that grows, a climb
  "yarn", // ball of yarn and needles: knitting, a shared sweater
  "shell", // a spiral shell with speed streaks: a snail race (never a face)
  "balloon", // a hot-air balloon with its basket: a sky-high date (and the bill on landing)
];

// Every absurd-world device in research/persona-quiz-v2/final/bank (2026-09-30, after BATCH-02; devices of
// removed cards deleted). "chapter" marks an intentional fallback to the chapter vignette. A device the bank adds before
// this table learns it falls back to DEVICE_KEYWORDS, then the chapter vignette, so a new card never breaks the card;
// tests/art-geometry.test.mjs derives the device list from the bank and reports any device mapped by keyword only.
export const DEVICE_TABLE = {
  // Chapter 1, Your phone
  "life-billboard": "frame",
  "friendship-houseplants": "chapter",
  "unlockable-phone": "machine", // a stall phone that never dies
  "ghost-poet": "house",
  "ear-advisor": "envelope",
  // Chapter 2, Friends
  "friendship repair shop": "shop",
  "magic 8-ball": "fortune",
  "summoning bell": "bell",
  "magic door": "door",
  "haunted house": "house",
  sphinx: "riddle",
  // Chapter 3, Love and dating
  "memory-erase vending machine": "machine",
  "talking doorbell": "bell",
  "two-person-sweater": "yarn",
  "early-shadow": "house", // the shadow waits at home
  "relationship-progress-bar": "machine",
  // Chapter 4, Money and spending
  "polite-tornado": "weather",
  "mermaid-housemate": "water",
  "pirate-chest": "treasure",
  "talking-cat": "trace",
  "money-tree": "treasure",
  "stranger-castle": "treasure", // an inheritance turned hotel
  // Chapter 5, Work, school and ambition
  "promoted-office-dog": "trace",
  "never-wrong-fortune-cookie": "fortune",
  "eighth-day": "time",
  "snail-racer": "shell",
  // Chapter 6, Family and home
  "magic-portrait": "frame",
  "life-board-game": "gift", // Genii's gift
  "pocket-parent": "house", // moving out, coming home
  // Chapter 7, Play, rules and you
  "kitten-referee": "trace",
  "gnome-village": "chapter",
  "superhero-chat": "chapter",
  clone: "frame",
  "feeling-after-clone": "frame",
  "vanishing-lists": "scroll",
  "fix-touch-power": "machine",
  // Extras
  "mood-link": "weather",
  "genii-wall-frame": "frame",
  // Finale (sealed)
  "rain-cloud": "weather",
  "five-year-contract": "scroll",
  // Round 2 card variety, second pass (G4b, landing while this table was updated; chapters as the bank sets them)
  "probably-better-app": "machine",
  "memory-delete": "machine",
  "pumpkin-curse": "scroll",
  "anniversary-holiday": "chapter",
  // Card variety round 4 (G4b, 5c21b23)
  "priced-words": "treasure", // every word costs coins
  "goldfish-year": "water", // a bowl, a fin
  "sky-ring": "gift", // a ring that arrives out of the sky
  "parachute-jackets": "balloon", // a canopy over a basket: the parachute in every jacket (BATCH-02, 2026-09-30)
  "hero-code": "scroll", // the superhero code, rule one
  "moon-hotel": "dream", // a night on the Moon: cloud and crescent
  "statue-posing": "frame", // posed like a statue, framed
  // Round 3 bank legibility (4eb53c8)
  "balloon-date-bill": "balloon", // a hot-air balloon date, and the bill on landing
};

// Keyword fallback for devices the table has not met yet (device string first, then the prompt), so a card the bank
// adds or rewrites still gets a fitting glyph before the table learns its device. Order matters: the first match wins.
export const DEVICE_KEYWORDS = [
  [/\b(?:door ?bell|bell)\b/, "bell"],
  [/\b(?:wish\w*|fairy|fairies|godparent|godmother|wizard\w*|witch\w*|spells?|spellbook|enchant\w*|shooting star|stars?|starlight|lamps?|lantern)\b/, "star"],
  [/\b(?:envelope|letter|invitation|invite\w*|postcard|advisor|whisper\w*|secret\w*|note|mailbox|mail|owl)\b/, "envelope"],
  [/(?:8-ball|fortune|crystal ball|palm reader|snow ?globe)/, "fortune"],
  [/\b(?:mountain|hill|peak|summit|climb\w*)\b/, "mountain"],
  [/\b(?:balloons?|hot-air)\b/, "balloon"],
  [/\b(?:knit\w*|sweater|yarn|scarf|tailor)\b/, "yarn"],
  [/\b(?:snails?|shell)\b/, "shell"],
  [/\b(?:robot|machine|fridge|remote|app|autocorrect|scoreboard|gadget)\b/, "machine"],
  [/\b(?:sleep|nap|time|future|clock|hourglass|loop)\b/, "time"],
  [/\b(?:shop|store|market|awning)\b/, "shop"],
  [/\b(?:tornado|storm|rain|cloud|weather|lightning)\b/, "weather"],
  [/\b(?:mermaid|whale|wave|river|ocean|sea|lake)\b/, "water"],
  [/\b(?:treasure|chest|gold|coins?|pirate|leprechaun|egg|piggy|castle|savings)\b/, "treasure"],
  [/\b(?:cat|dog|kitten|puppy|paw|pigeon|bird|feather|stork|goose|chickens?|bone)\b/, "trace"],
  [/\b(?:haunt\w*|ghost\w*|mansion)\b/, "house"],
  [/\b(?:bottle\w*|potion|jar)\b/, "bottle"],
  [/\b(?:sphinx|riddle|pyramid|puzzle)\b/, "riddle"],
  [/\b(?:dreams?|nightmare)\b/, "dream"],
  [/\b(?:glasses|lens|telescope|binoculars)\b/, "lens"],
  [/\b(?:portrait|painting|frame|billboard|clone)\b/, "frame"],
  [/\b(?:contract|scroll|deal|curse|trade)\b/, "scroll"],
  [/\b(?:door|portal|teleport|swap)\b/, "door"],
  // Last: Genii names half the bank's prompts, so a specific object above always wins over "Genii offers".
  [/\b(?:gift\w*|present|prize|offer\w*|genie|genii)\b/, "gift"],
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
  const device = card.fp?.device ?? card.device;
  // Legacy cards with no world and no device: only a clear keyword earns a glyph.
  if (!world && !device) {
    const family = keywordFamily(card.prompt);
    return family || null;
  }
  const family = deviceFamily(device, card.prompt);
  return family && family !== "chapter" ? family : chapterDeviceId(card);
}
