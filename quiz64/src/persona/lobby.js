// The lobby: four unscored taps right after setup that shape the run (2026-09-28). Every new player-facing line for
// the lobby, the picker's bonus round and the delivery-routed host lines lives in LOBBY_COPY, so copy can be
// replaced in one place. Ids are stored in the run; text never is.

export const ENDING_IDS = Object.freeze(["sharp", "receipts", "funny", "gentle"]);
export const DEPTH_IDS = Object.freeze(["light", "some", "personal"]);
export const ROOM_IDS = Object.freeze(["love", "work", "family"]);
export const DELIVERY_IDS = Object.freeze(["gentle", "playful", "sharp", "minimal"]);

// Optional rooms and the kit chapter each one opens. Chapters 1, 2, 4 and 7 are always on.
export const ROOM_CHAPTERS = Object.freeze({ love: 3, work: 5, family: 6 });
export const ALWAYS_CHAPTERS = Object.freeze([1, 2, 4, 7]);

// Used only for fields a stored lobby may lack. The lobby screen asks all four questions.
export const LOBBY_DEFAULTS = Object.freeze({ ending: "funny", depth: "personal", rooms: ROOM_IDS, delivery: "playful" });

// The playful lines are the ones the game already shipped with. Gentle and sharp reuse them until the founder
// approves a voice for each (TODO copy).
const PLAYFUL_HOST = Object.freeze({
  chapter: ["Pick the move you'd actually make. Perfect answers are suspicious.", "No cool answer here. Just yours.", "Not your life? Say so. That's an answer too.", "First instinct. Genii can tell when you overthink."],
  extra: ["Two more and I can call it."],
  finale: ["My guess is already locked. No peeking."],
  rushing: "Speedrun detected. Genii counts super-fast taps a little less.",
});

export const LOBBY_COPY = Object.freeze({
  eyebrow: "Make it yours",
  counter: (n, total) => `Question ${n} of ${total}`,
  guide: "Four quick picks, then the cards.",
  setupGuide: "A few quick taps, then the cards.",
  guideNote: "You can skip any card later, whatever you pick here.",
  continue: "Continue",
  back: "Back",
  steps: Object.freeze([
    {
      key: "ending",
      title: "How should your ending read?",
      note: "Genii keeps this in mind for your result.",
      options: [
        { id: "sharp", text: "One sharp read" },
        { id: "receipts", text: "The read, plus what I said" },
        { id: "funny", text: "Make me laugh" },
        { id: "gentle", text: "Go easy on me" },
      ],
    },
    {
      key: "depth",
      title: "How personal can Genii get?",
      note: "Some cards stay 18+ only, whatever you pick.",
      options: [
        { id: "light", text: "Keep it light" },
        { id: "some", text: "A little personal" },
        { id: "personal", text: "Ask me anything" },
      ],
    },
    {
      key: "rooms",
      multi: true,
      title: "Which rooms can Genii visit?",
      note: "Your phone, friends, money and play are always in. Tap a room to close it.",
      options: [
        { id: "love", text: "Love and your person" },
        { id: "work", text: "Work, school and ambition" },
        { id: "family", text: "Family and home" },
      ],
      open: "Open",
      closed: "Closed",
    },
    {
      key: "delivery",
      title: "How should Genii react between cards?",
      note: "Only the tone changes. Your answers count the same.",
      options: [
        { id: "gentle", text: "Gently" },
        { id: "playful", text: "Playful" },
        { id: "sharp", text: "Straight to the point" },
        { id: "minimal", text: "Quietly. Just the cards" },
      ],
    },
  ]),
  // Picker surfaces
  runLabel: (n, total) => `Card ${n} of ${total}`,
  chapterKicker: (n, total) => `Chapter ${n} of ${total}`,
  extras: Object.freeze({
    kicker: "Almost there",
    title: "A few bonus cards",
    intro: "A few quick ones so Genii can read every side of you.",
    sub: "Then Genii makes its guesses.",
    badge: "Bonus card",
  }),
  lockEyebrow: "Your cards are done",
  mapLede: "Your rooms, then Genii locks its guesses and you play the final eight.",
  mapClosed: "Not in this run",
  mapFinale: "After your cards",
  landing: Object.freeze({
    promise: "Your phone, your friends, your person, your money, your family. You pick the rooms, then Genii locks in eight guesses about you and you find out how many it got right.",
    factTitle: "48 cards",
    factBody: "You pick the rooms. About 8 minutes.",
  }),
  // Host lines between cards, per delivery. TODO copy: gentle and sharp need their own approved lines.
  host: Object.freeze({
    playful: PLAYFUL_HOST,
    gentle: PLAYFUL_HOST, // TODO copy: gentle voice, awaiting founder approval
    sharp: PLAYFUL_HOST, // TODO copy: sharp voice, awaiting founder approval
    minimal: null, // no reactions between cards
  }),
});

// Genii's bubble on a card screen, by delivery. Returns null when the bubble should stay empty (minimal hides every
// optional reaction, including the speed nudge).
export function hostLine(delivery, { phase = "chapter", index = 1, rushing = false } = {}) {
  const lines = LOBBY_COPY.host[DELIVERY_IDS.includes(delivery) ? delivery : LOBBY_DEFAULTS.delivery];
  if (!lines) return null;
  if (rushing && phase !== "finale") return lines.rushing;
  const set = lines[phase] || lines.chapter;
  return set[(Math.max(1, index) - 1) % set.length];
}

// A chapter's intro bubble on its title card. The intro says what the chapter is about, so every delivery keeps it,
// minimal included; only the between-card reactions above are optional.
export function chapterIntro(delivery, intro) {
  return intro;
}
