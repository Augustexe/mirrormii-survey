// Shared helpers for the persona game tests: deterministic players that drive the real step machine.
import * as Session from "../src/persona/session.js";

export const ADULT = { age: "adult", closest: "best_friend", pronoun: "she" };
export const TEEN = { age: "teen", closest: "best_friend", pronoun: "they" };

let tick = 0;
export const clock = () => new Date(Date.UTC(2026, 8, 27, 12, 0, tick++)).toISOString();

// Every room open, every card the age band allows: the widest pool.
export const OPEN_LOBBY = Object.freeze({ ending: "funny", depth: "personal", rooms: ["love", "work", "family"], delivery: "playful" });

// A run past setup and the lobby. Pass lobby = null to stop at the lobby step.
export function started(setup = ADULT, runId = "testrun01", lobby = OPEN_LOBBY) {
  const s = Session.startRun(Session.newRun({ now: clock(), runId }), setup, { now: clock() });
  return lobby ? Session.chooseLobby(s, lobby, { now: clock() }) : s;
}

// choose(card, step) returns { value, ms?, flip? } for the current card.
export function playUntil(state, choose, stop = () => false) {
  let s = state;
  for (let guard = 0; guard < 200; guard++) {
    const step = Session.currentStep(s);
    if (stop(step, s)) return s;
    if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
    if (step.kind !== "card") return s;
    const pick = choose(step.card, step, s);
    s = Session.answerCard(s, step.card.id, pick.value, { ms: pick.ms ?? 4000, flip: pick.flip ?? null, now: clock() });
  }
  throw new Error("run did not finish");
}

export const firstOption = (card) => ({ value: card.type === "pick_two" ? [0, 1] : 0 });

// A consistent player: prefers options whose evidence points to the given signs.
export function leaning(signs) {
  return (card) => {
    const scoreOf = (o) => Object.entries(o.axes || {}).reduce((acc, [ax, v]) => acc + (signs[ax] || 0) * v, 0) + (o.tags || []).reduce((acc, t) => acc + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
    const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends ? -99 : scoreOf(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
    return { value: card.type === "pick_two" ? [ranked[0].i, ranked[1].i] : ranked[0].i };
  };
}

export function completeRun(setup = ADULT, choose = firstOption, runId, lobby = OPEN_LOBBY) {
  return playUntil(started(setup, runId, lobby), choose);
}

// Every lobby the picker must handle: 8 room sets x 3 depths.
export const ROOM_SETS = [[], ["love"], ["work"], ["family"], ["love", "work"], ["love", "family"], ["work", "family"], ["love", "work", "family"]];
export const DEPTHS = ["light", "some", "personal"];
export const lobbyFor = (rooms, depth, extra = {}) => ({ ending: "funny", depth, rooms, delivery: "playful", ...extra });

// The picker chooses which cards a run serves, so a test that needs one card tries run ids until the picker serves
// it. Returns the state with that card on the table, or null.
export function reach(cardId, { setup = ADULT, lobby = OPEN_LOBBY, choose = firstOption, tries = 60 } = {}) {
  for (let i = 0; i < tries; i++) {
    const s = playUntil(started(setup, `reach${String(i).padStart(3, "0")}`, lobby), choose, (step) => step.kind !== "card" || step.phase === "finale" || step.card.id === cardId);
    const step = Session.currentStep(s);
    if (step.kind === "card" && step.card.id === cardId) return s;
  }
  return null;
}
