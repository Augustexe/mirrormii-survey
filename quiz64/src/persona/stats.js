// The six leans as game stats (Jerry, 2026-09-29 evening; LAUNCH-SPEC section 23 "Map stat labels"). Players never
// see the scorer's internal pole names (We, Me, Direct, Soft, Classic, Own, Steady, Venture, Push, Easy, Rules,
// Context): every player-facing surface (the map, its saved image, what Genii knows best, the rooms, Genii's calls)
// reads its labels from this one table. The same labels serve both voices.
//
// Each stat has a name and two human ends. `first` is the first pole in the type code names (We·Soft·Own reads We
// first), which the library calls `plus`; the map draws it on the left. Ends are keyed by the library's pole name, so
// a lean always lands on the end that means the same thing: Crew is where We lands, Solo where Me lands, and so on
// (checked against library.json plusLine and minusLine in tests/reveal-stats.test.mjs).
//
// Later migration (research/ is owned by the bank package): library.json `axes[].topic` strings such as "Rules or
// the room" and "Safe bet or new road" still echo pole words; the reveal no longer shows them, and they can move to
// these stat names when the library is next opened.

export const STATS = Object.freeze({
  R1: Object.freeze({ axis: "R1", stat: "Orbit", first: "We", second: "Me", ends: Object.freeze({ We: "Crew", Me: "Solo" }) }),
  R2: Object.freeze({ axis: "R2", stat: "Delivery", first: "Direct", second: "Soft", ends: Object.freeze({ Direct: "Blunt", Soft: "Gentle" }) }),
  R3: Object.freeze({ axis: "R3", stat: "Blueprint", first: "Classic", second: "Own", ends: Object.freeze({ Classic: "Old School", Own: "Own Lane" }) }),
  L1: Object.freeze({ axis: "L1", stat: "Compass", first: "Steady", second: "Venture", ends: Object.freeze({ Steady: "Home Base", Venture: "Wanderlust" }) }),
  L2: Object.freeze({ axis: "L2", stat: "Engine", first: "Push", second: "Easy", ends: Object.freeze({ Push: "Full Send", Easy: "Cruise Control" }) }),
  L3: Object.freeze({ axis: "L3", stat: "Code", first: "Rules", second: "Context", ends: Object.freeze({ Rules: "By the Book", Context: "Read the Room" }) }),
});

// Every internal pole name, for tests and guards.
export const POLE_NAMES = Object.freeze(Object.values(STATS).flatMap((s) => [s.first, s.second]));

// The player-facing end for an internal pole name (on any axis), or the name itself when it is not a pole.
const BY_POLE = Object.fromEntries(Object.values(STATS).flatMap((s) => Object.entries(s.ends)));
export function endOf(pole) {
  return (pole && BY_POLE[pole]) || pole || "";
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
