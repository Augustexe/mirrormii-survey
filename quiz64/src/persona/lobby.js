// The lobby: three unscored taps right after setup that shape the run (LAUNCH-SPEC section 22). Every new
// player-facing line for the lobby, the picker's bonus round and the voice-routed host lines lives in LOBBY_COPY, so
// copy can be replaced in one place. Ids are stored in the run; text never is.

// How Genii talks: Make it fun, Heart to heart, or Just the cards (Make it fun wording, no reactions between cards).
export const VOICE_IDS = Object.freeze(["fun", "heart", "cards"]);
// How personal: "light" skips cards marked privacy "intimate"; "anything" plays every card.
export const DEPTH_IDS = Object.freeze(["light", "anything"]);
export const ROOM_IDS = Object.freeze(["love", "work", "family"]);

// Optional rooms and the kit chapter each one opens. Chapters 1, 2, 4 and 7 are always on.
export const ROOM_CHAPTERS = Object.freeze({ love: 3, work: 5, family: 6 });
export const ALWAYS_CHAPTERS = Object.freeze([1, 2, 4, 7]);

// Used only when something asks before the lobby is chosen. The lobby screen asks all three questions.
export const LOBBY_DEFAULTS = Object.freeze({ voice: "fun", depth: "anything", rooms: ROOM_IDS });

// The card wording a voice reads: Heart to heart, or Make it fun (Just the cards reads Make it fun).
export const cardVoice = (voice) => (voice === "heart" ? "heart" : "fun");

// Make it fun: the lines the game already shipped with.
const FUN_HOST = Object.freeze({
  chapter: ["Pick the move you'd actually make. Perfect answers are suspicious.", "No cool answer here. Just yours.", "Not your life? Say so. That's an answer too.", "First instinct. Genii can tell when you overthink."],
  extra: ["Two more and I can call it."],
  finale: ["My guess is already locked. No peeking."],
  rushing: "Speedrun detected. Genii counts super-fast taps a little less.",
});
// Heart to heart: sincere and calm, full sentences, no exclamation marks.
const HEART_HOST = Object.freeze({
  chapter: ["Take your time. The honest answer is the one that helps.", "There is no right answer here, only yours.", "If a card is not your life, you can say so. That counts too.", "Go with what you would really do, not what sounds good."],
  extra: ["A few more, and I will have the whole picture."],
  finale: ["My guesses are already locked. Answer as you are."],
  rushing: "You are moving quickly. Very fast taps count a little less, so take a breath if you like.",
});

export const LOBBY_COPY = Object.freeze({
  eyebrow: "Make it yours",
  counter: (n, total) => `Question ${n} of ${total}`,
  guide: "Three quick picks, then the cards.",
  setupGuide: "Two quick taps, then the lobby.",
  guideNote: "You can skip any card later, whatever you pick here.",
  continue: "Continue",
  back: "Back",
  steps: Object.freeze([
    {
      key: "voice",
      title: "How should Genii talk to you?",
      note: "Only the wording changes. Your answers count the same.",
      options: [
        { id: "fun", text: "Make it fun" },
        { id: "heart", text: "Heart to heart" },
        { id: "cards", text: "Just the cards" },
      ],
    },
    {
      key: "depth",
      title: "How personal can Genii get?",
      note: "You can skip any card, whatever you pick.",
      options: [
        { id: "light", text: "Keep it light" },
        { id: "anything", text: "Ask me anything" },
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
  // Host lines between cards, per voice. Just the cards shows none.
  host: Object.freeze({
    fun: FUN_HOST,
    heart: HEART_HOST,
    cards: null,
  }),
});

// Genii's bubble on a card screen, by voice. Returns null when the bubble should stay empty (Just the cards hides every
// optional reaction, including the speed nudge).
export function hostLine(voice, { phase = "chapter", index = 1, rushing = false } = {}) {
  const lines = LOBBY_COPY.host[VOICE_IDS.includes(voice) ? voice : LOBBY_DEFAULTS.voice];
  if (!lines) return null;
  if (rushing && phase !== "finale") return lines.rushing;
  const set = lines[phase] || lines.chapter;
  return set[(Math.max(1, index) - 1) % set.length];
}

// A chapter's intro bubble on its title card. The intro says what the chapter is about, so every voice keeps it,
// Just the cards included; only the between-card reactions above are optional.
export function chapterIntro(voice, intro) {
  return intro;
}
