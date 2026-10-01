// The one source for the result's scale labels (LAUNCH-SPEC section 26 "Plain names", docs/NAMING-RULES.md): the two
// half kickers, the six axis stats and their ends. Since the drama stats (2026-09-30, rpg-stats.js) players no longer
// see the six axis stat names; the ends still render (core traits, findings, rooms, flags, the heist line). Archetype names, their one-line definitions and trait keywords live in
// library.json; nothing else in the app spells a label out. Players never see the scorer's internal pole names (We, Me,
// Direct, Soft, Classic, Own, Steady, Venture, Push, Easy, Rules, Context): every player-facing surface (the names,
// the character sheet, its saved image, what Genii knows best, the rooms, Genii's calls, the article, the share card)
// reads its labels from here. The same labels serve both voices.
//
// Every label passed the cold-reader gate (docs/NAMING-RULES.md: clear 4.5 or more, hurt 2 or less, share 3.5 or
// more): everyday words, no metaphor to decode, behavior never beliefs, both ends flattering. Ends are subjectless
// verb phrases ("Says it straight"), so they read the same on a chip, a card or a sheet.
//
// Each stat has a name and two ends. `first` is the first pole in the type code names (We·Soft·Own reads We first),
// which the library calls `plus`; the map draws it on the left. Ends are keyed by the library's pole name, so a lean
// always lands on the end that means the same thing (checked against library.json plusLine and minusLine in
// tests/reveal-stats.test.mjs).

// The two halves of the result, each with the kicker shown above its archetype name on every title card.
export const HALVES = Object.freeze({
  people: Object.freeze({ side: "relationship", kicker: "With the people you love", axes: Object.freeze(["R1", "R2", "R3"]) }),
  life: Object.freeze({ side: "life", kicker: "Day to day", axes: Object.freeze(["L1", "L2", "L3"]) }),
});

export const STATS = Object.freeze({
  R1: Object.freeze({ axis: "R1", stat: "Closeness", first: "We", second: "Me", ends: Object.freeze({ We: "Stays close", Me: "Keeps some space" }) }),
  R2: Object.freeze({ axis: "R2", stat: "Hard truths", first: "Direct", second: "Soft", ends: Object.freeze({ Direct: "Says it straight", Soft: "Says it gently" }) }),
  R3: Object.freeze({ axis: "R3", stat: "Traditions", first: "Classic", second: "Own", ends: Object.freeze({ Classic: "Carries them on", Own: "Starts new ones" }) }),
  L1: Object.freeze({ axis: "L1", stat: "New things", first: "Steady", second: "Venture", ends: Object.freeze({ Steady: "Sticks with favorites", Venture: "Tries new things" }) }),
  L2: Object.freeze({ axis: "L2", stat: "Pace", first: "Push", second: "Easy", ends: Object.freeze({ Push: "Goes fast", Easy: "Takes it slow and steady" }) }),
  L3: Object.freeze({ axis: "L3", stat: "Rules", first: "Rules", second: "Context", ends: Object.freeze({ Rules: "By the book", Context: "Case by case" }) }),
});

// Labels retired by the plain-names pass (2026-09-29). None may reach a player surface again
// (tests/naming-retired.test.mjs renders every screen, the article and the share image data and fails on any of them).
export const RETIRED_LABELS = Object.freeze([
  "The Slow Burner", "Slow Burner", "Creature of Habit", "The Easygoer", "Easygoer", "The Wanderer", "Wanderer",
  "Orbit", "Delivery", "Blueprint", "Compass", "Engine", "Code:", "Crew", "Solo", "Old School", "Own Lane", "Home Base",
  "Wanderlust", "Full Send", "Cruise Control", "Read the Room", "Traditional", "With your life",
  // The old stat display names, retired from every player surface by the drama stats (Jerry, 2026-09-30); they stay
  // the internal names in STATS below (records, tests). "Rules" is not listed: it is also the L3 pole id.
  "Closeness", "Hard truths", "Traditions", "New things", "Pace",
]);

// Every internal pole name, for tests and guards.
export const POLE_NAMES = Object.freeze(Object.values(STATS).flatMap((s) => [s.first, s.second]));

// The player-facing end for an internal pole name (on any axis), or the name itself when it is not a pole.
const BY_POLE = Object.fromEntries(Object.values(STATS).flatMap((s) => Object.entries(s.ends)));
export function endOf(pole) {
  return (pole && BY_POLE[pole]) || pole || "";
}

// Both ends in one phrase, for a stat that sits in the middle ("Stays close and keeps some space") or is still open
// ("Stays close or keeps some space"). The second end drops its capital so the phrase reads as one.
export function bothEnds(a, b, join = "and") {
  const low = String(b || "");
  return `${a} ${join} ${low.charAt(0).toLowerCase()}${low.slice(1)}`;
}

// The stat for an axis id, or a neutral stand-in so an unknown axis never breaks a screen.
export function statOf(axis) {
  return STATS[axis] || { axis, stat: "", first: "", second: "", ends: {} };
}

// The map's view of one lean: stat name, the two ends in stat order (first on the left), which end leads, and where
// the bead sits from the left end (0 to 100). `pos` is the story data's position measured from the minus (second)
// pole, so the first-on-the-left view mirrors it.
export function statRow(axis, { lead = null, pos = 50 } = {}) {
  const s = statOf(axis);
  const a = s.ends[s.first] || s.first;
  const b = s.ends[s.second] || s.second;
  const leadEnd = lead ? endOf(lead) : null;
  return {
    stat: s.stat,
    a,
    b,
    leadEnd,
    otherEnd: leadEnd ? (leadEnd === a ? b : a) : null,
    leadSide: leadEnd ? (leadEnd === a ? "a" : "b") : null,
    at: Math.round(Math.max(0, Math.min(100, 100 - pos))),
  };
}
