// Card formats for the persona quiz (LAUNCH-SPEC sections 6, 7 and 22; skill genii-card-writer section 4). One table
// says, per type, the evidence grade, the card weight, the exits and how many options a card may have. merge-bank.mjs
// fills grade, weight and exits from it, check-bank.mjs and tests.mjs validate against it, and score-core.mjs and the
// quiz64 picker read its type groups. Plain ES module, no I/O, safe in the browser.

export const EXITS = Object.freeze(["skip", "not_my_life"]);
export const REAL_EXITS = Object.freeze(["skip", "not_my_life", "no_recent"]);

// options: the range the kit accepts (cards.json, including legacy cards); bank: the range a new bank card must meet.
export const TYPES = Object.freeze({
  scenario: { grade: "would", weight: 0.55, options: [3, 6], bank: [3, 5] },
  real: { grade: "did", weight: 0.8, options: [3, 5], bank: [3, 5] },
  receipts: { grade: "did", weight: 0.4, options: [5, 8], bank: [5, 6] }, // 4 or 5 facts plus "None of these" (Codex R1: fewer choices)
  bet: { grade: "did", weight: 0.8, options: [2, 5], bank: [3, 5] }, // legacy guilty cards keep 2 until rewritten
  reply: { grade: "would", weight: 0.55, options: [3, 5], bank: [3, 5] },
  others: { grade: "believe", weight: 0.45, options: [3, 5], bank: [3, 5] },
  this_or_that: { grade: "believe", weight: 0.45, options: [2, 3], bank: [2, 2] },
  role: { grade: "believe", weight: 0.45, options: [5, 6], bank: [5, 6] },
  pick_two: { grade: "believe", weight: 0.45, options: [6, 6], bank: [6, 6] },
  rank: { grade: "believe", weight: 0.45, options: [4, 4], bank: [4, 4] },
  eyes: { grade: "believe", weight: 0.45, options: [4, 5], bank: [4, 5] },
  feeling: { grade: "emotion", weight: 0, options: [5, 5], bank: [5, 5] },
  sealed: { grade: "none", weight: 0, options: [3, 5], bank: [3, 5] },
});
export const TYPE_IDS = Object.freeze(Object.keys(TYPES));

// Type groups (LAUNCH-SPEC sections 10 and 22).
export const DID_TYPES = Object.freeze(["real", "receipts", "bet"]);
export const QUICK_TYPES = Object.freeze(["this_or_that", "role", "pick_two", "rank", "eyes"]);
// Served after three rushed taps: one short tap each.
export const LIGHT_TYPES = Object.freeze(["this_or_that", "role", "bet", "eyes"]);
// Never in a friend deck: a receipts card is a list of facts, a ranking has no either-or side.
export const NO_FRIEND_TYPES = Object.freeze(["receipts", "rank"]);
// Rank it: position weights on each item's evidence, first to last.
export const RANK_WEIGHTS = Object.freeze([1, 0.5, 0, -0.5]);
// Types renamed since the cards were first written.
export const LEGACY_TYPES = Object.freeze({ guilty: "bet" });

export const PRIVACY = Object.freeze(["normal", "intimate"]);
// Worlds (Jerry, 2026-09-29): everyday, unusual (possible but rare) or absurd (impossible, magic, Genii's wishes).
// Absurd choices are weaker evidence than real life, so their weight is capped; "what you did" cards stay real.
export const WORLDS = Object.freeze(["everyday", "unusual", "absurd"]);
export const ABSURD_WEIGHT_CAP = 0.35;
export const FP_FIELDS = Object.freeze(["trigger", "setting", "ask", "who", "stakes"]);

// Grade, weight and exits come from the type, never from the writer.
export function fillFromType(card) {
  const type = LEGACY_TYPES[card.type] || card.type;
  const spec = TYPES[type];
  if (!spec) throw new Error(`${card.id}: unknown type "${card.type}"`);
  const weight = card.world === "absurd" ? Math.min(spec.weight, ABSURD_WEIGHT_CAP) : spec.weight;
  return { ...card, type, grade: spec.grade, weight, exits: [...(type === "real" ? REAL_EXITS : EXITS)] };
}

// Fields no card carries any more (no age screen, LAUNCH-SPEC section 22). locked18 privacy becomes intimate, so
// "Keep it light" still skips those cards.
export function stripAgeFields(card) {
  const { teen, teenPrompt, ...rest } = card;
  if (rest.privacy === "locked18") rest.privacy = "intimate";
  if (rest.heart && typeof rest.heart === "object") {
    const { teenPrompt: _hp, ...h } = rest.heart;
    rest.heart = h;
  }
  return rest;
}

// Every player-facing text of a card, per voice: [{ where, text, voice }]. voice is "fun" or "heart".
export function cardTexts(card) {
  const out = [];
  const add = (where, text, voice = "fun") => { if (typeof text === "string" && text) out.push({ where, text, voice }); };
  add("prompt", card.prompt);
  (card.thread || []).forEach((m, i) => add(`thread ${i}`, m && m.text));
  (card.options || []).forEach((o, i) => add(`option ${i}`, o && o.t));
  if (card.flip) { add("flip", card.flip.prompt); (card.flip.options || []).forEach((t, i) => add(`flip ${i}`, t)); }
  const h = card.heart;
  if (h && typeof h === "object") {
    add("heart prompt", h.prompt, "heart");
    (h.thread || []).forEach((m, i) => add(`heart thread ${i}`, m && m.text, "heart"));
    (h.options || []).forEach((t, i) => add(`heart option ${i}`, t, "heart"));
  }
  return out;
}
