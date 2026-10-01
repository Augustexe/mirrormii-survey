// Genii's between-card reactions (docs/DESIGN-DIRECTION.md section 5.9, package B).
// On about 40% of cards, Genii's line reacts to the answer just given instead of the voice's host line.
// Rules: deterministic from the run seed; never two cards in a row; always on the card right after a bet (so a bet
// card itself never carries one); never on feeling or finale cards; never for "Just the cards".
// Lines are keyed by the picked option's emotion (12 values in the bank) and the voice (fun, heart). Every line is at
// most 48 characters, never names a trait, tag, type or pole, never judges and never quotes the answer.
// Proposed copy (D6): shipped under Jerry's standing go, flagged for his read.

export const REACTION_EMOTIONS = Object.freeze([
  "delight", "pride", "warmth", "relief", "longing", "worry", "guilt", "cringe", "irritation", "resentment", "envy", "sting",
]);

export const REACTIONS = Object.freeze({
  delight: {
    fun: ["Oh, you enjoyed that one.", "That answer came with a grin.", "Somebody is having fun.", "I felt that little spark."],
    heart: ["That one made you smile.", "There was some joy in that.", "That sounds like a happy memory.", "I could feel the lightness there."],
  },
  pride: {
    fun: ["A tiny victory lap. Noted.", "Chin up, shoulders back. Love it.", "You would frame that one, huh.", "Trophy energy. Filed."],
    heart: ["There is some pride in that.", "That one sounds earned.", "You stood a little taller there.", "It is good to feel that way."],
  },
  warmth: {
    fun: ["Aw. Okay, that one is sweet.", "Warm fuzzies detected.", "A hug is hiding in that answer.", "That is a cozy one."],
    heart: ["I can hear the care in that.", "There is warmth in that answer.", "That one felt tender and warm.", "That sounds like love, quietly."],
  },
  relief: {
    fun: ["Crisis averted, apparently.", "Phew. Exhale.", "And the tension leaves the room.", "Dodged it. Nice footwork."],
    heart: ["There is some ease in that answer.", "It sounds like a weight lifted.", "There is a breath out in that one.", "That one sounds like relief."],
  },
  longing: {
    fun: ["Cue the rainy window.", "A little wistful. I see it.", "That one has a soundtrack.", "Somewhere, a slow song started."],
    heart: ["There is some longing in that.", "That sounds like missing something.", "A quiet wish, maybe.", "I hear a little ache in that one."],
  },
  worry: {
    fun: ["Brain, please log off.", "Overthinking? In this economy?", "That one comes with a knot.", "Okay, deep breath. You are fine."],
    heart: ["That one carries some worry.", "It is okay to feel unsure there.", "I hear the what-ifs in that.", "That sounds heavy to hold."],
  },
  guilt: {
    fun: ["The guilt is loud on this one.", "Ah, the 2am replay special.", "Confession received. Moving on.", "Your secret stays here."],
    heart: ["That one sits a little heavy.", "Guilt is a tender thing to carry.", "Thank you for being honest there.", "That is a hard one to admit."],
  },
  cringe: {
    fun: ["Felt that from here.", "Oof. Full-body cringe.", "Deleting that memory for you.", "Everyone has one of those."],
    heart: ["That one is a little tender.", "Awkward moments happen to all of us.", "That sounds uncomfortable, and human.", "Thank you for sharing that one."],
  },
  irritation: {
    fun: ["Deep sigh. A loud one.", "Eye roll registered.", "Somebody's patience ran out.", "That one has a little edge."],
    heart: ["That sounds frustrating.", "There is some frustration in that.", "It makes sense to feel annoyed.", "That one rubbed you the wrong way."],
  },
  resentment: {
    fun: ["Oh, that one is still simmering.", "Filed under: not over it.", "The grudge has a chair here.", "Some history in that answer."],
    heart: ["That one still stings a little.", "It sounds like that stayed with you.", "There is some old hurt there.", "That feeling has been around a while."],
  },
  envy: {
    fun: ["A little green around the edges.", "Scrolling past their life, huh.", "Wanting it is allowed.", "Plot twist: you want it too."],
    heart: ["It is human to want that too.", "There is some wanting in that.", "That one sounds like a quiet wish.", "Wanting more is allowed."],
  },
  sting: {
    fun: ["Ouch. That one landed.", "Okay, that stung a bit.", "Noted, gently.", "That one hit a nerve."],
    heart: ["That one hurt, and that matters.", "Thank you for going there.", "That sounds like it stung.", "Take a breath. That was a real one."],
  },
});

// An answer with no emotion on its option (most options, receipts, ranks, pick two).
export const NEUTRAL_REACTIONS = Object.freeze({
  fun: ["Noted. Next!", "Interesting pick.", "Genii is scribbling.", "Filed away.", "Okay, that tracks.", "Ooh. Tell nobody."],
  heart: ["Thank you. I have noted that.", "That is helpful to know.", "Noted, with care.", "Thank you for that one.", "I am listening.", "That tells a lot."],
});

// Skip, Not my life, No recent example.
export const EXIT_REACTIONS = Object.freeze({
  fun: ["Fair. Not your life.", "Skipped. No hard feelings.", "Next one, then.", "Pass accepted."],
  heart: ["That is fine. Not every card fits.", "Of course. On to the next.", "Skipping is always okay.", "Thank you. Let us move on."],
});

// Chance that an eligible card (not after a reaction, not a bet, not feeling or finale) gets a reaction. Tuned so a
// full run shows one on about 40% of its cards (tests/play-reactions.test.mjs simulates 1,000 runs).
export const REACTION_CHANCE = 0.76;

// FNV-1a over the seed and parts, to a float in [0, 1).
export function unit(...parts) {
  let h = 0x811c9dc5;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h / 4294967296;
}

// The emotion behind an answer: the option's emotion for one index, the first ranked or first picked item for arrays,
// "exit" for Skip, Not my life and No recent example, null when there is none.
export function emotionOf(card, value) {
  if (typeof value === "string") return "exit";
  const first = Array.isArray(value) ? value[0] : value;
  if (!card || !Array.isArray(card.options) || !Number.isInteger(first)) return null;
  const option = card.options[first];
  const emotion = option && option.emotion;
  return REACTION_EMOTIONS.includes(emotion) ? emotion : null;
}

// Is the card now on the table allowed to carry a reaction at all?
const quietCard = (card) => !!card && (card.type === "feeling" || card.type === "sealed");

/**
 * The reaction Genii shows on the next card, or null (then the host line shows).
 * card: the card just answered. optionIndex: what onAnswer received (index, index array or exit id).
 * voice: fun | heart | cards. seed: the run id. cardIndex: 0-based position of the card now shown in the run.
 * previousWasReaction: whether the card just answered showed a reaction. nextCard: the card now shown (when known).
 * phase: the phase of the card now shown ("finale" never reacts).
 */
export function reactionFor({ card, optionIndex, voice, seed = "genii", cardIndex = 0, previousWasReaction = false, nextCard = null, phase = null } = {}) {
  if (!card || voice === "cards") return null;
  if (phase === "finale" || quietCard(nextCard)) return null;
  const v = voice === "heart" ? "heart" : "fun";
  const afterBet = card.type === "bet";
  if (!afterBet) {
    if (previousWasReaction) return null;
    // A bet card never carries one, so the card after it always can.
    if (nextCard && nextCard.type === "bet") return null;
    if (unit(seed, "react", cardIndex) >= REACTION_CHANCE) return null;
  }
  const emotion = emotionOf(card, optionIndex);
  const pool = emotion === "exit" ? EXIT_REACTIONS[v] : emotion ? REACTIONS[emotion][v] : NEUTRAL_REACTIONS[v];
  return pool[Math.floor(unit(seed, "line", cardIndex, card.id) * pool.length)];
}

export function allReactionLines() {
  const out = [];
  for (const e of REACTION_EMOTIONS) for (const v of ["fun", "heart"]) out.push(...REACTIONS[e][v]);
  for (const v of ["fun", "heart"]) out.push(...NEUTRAL_REACTIONS[v], ...EXIT_REACTIONS[v]);
  return out;
}
