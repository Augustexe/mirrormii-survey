// Owner run state for the persona quiz V2 web game: setup, the seven-chapter run, adaptive extras, the one-time lock
// of Genii's finale guesses, the finale and the result. Pure functions over a plain JSON state; every write goes
// through the same step machine, and a restored save is replayed through it before use.
import { S, KIT, KIT_ID } from "./kit.js";
import { sha256Hex, canonicalJSON } from "./sha256.js";

export const SCHEMA = "genii.persona.run/1";
export const STORAGE_KEY = "genii.persona.v2.run";
export const EXITS = Object.freeze(["skip", "not_my_life", "no_recent"]);
export const MAX_MS = 600000;

export const AGE_OPTIONS = Object.freeze([
  { id: "adult", text: "18 or older" },
  { id: "teen", text: "13 to 17" },
  { id: "under13", text: "Under 13" },
]);
export const CLOSEST_OPTIONS = Object.freeze([
  { id: "best_friend", text: "My best friend" },
  { id: "partner", text: "My partner" },
  { id: "crush", text: "A crush" },
  { id: "sibling", text: "A sibling" },
  { id: "parent", text: "A parent" },
  { id: "someone_else", text: "Someone else" },
]);
export const PRONOUN_OPTIONS = Object.freeze([
  { id: "she", text: "she / her" },
  { id: "he", text: "he / him" },
  { id: "they", text: "they / them" },
]);

export class PersonaError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);

export function newRun({ now = new Date().toISOString(), runId = randomId() } = {}) {
  return { schema: SCHEMA, kit: KIT_ID, runId, createdAt: now, updatedAt: now, setup: null, answers: {}, ms: {}, frozen: null, lockHash: null, finale: {}, challenges: [], friendResults: [], returnTo: null };
}

export function randomId(length = 12) {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

export function validSetup(setup) {
  if (!isObj(setup)) return false;
  const keys = Object.keys(setup);
  if (keys.some((k) => !["age", "closest", "pronoun"].includes(k))) return false;
  return ["adult", "teen"].includes(setup.age) && CLOSEST_OPTIONS.some((o) => o.id === setup.closest) && PRONOUN_OPTIONS.some((o) => o.id === setup.pronoun);
}

// Under 13 never starts a run; nothing is stored.
export function startRun(state, setup, { now = new Date().toISOString() } = {}) {
  if (setup && setup.age === "under13") throw new PersonaError("under13", "Genii is for ages 13 and up.");
  if (!validSetup(setup)) throw new PersonaError("bad_setup", "Setup needs an age band, your closest person and a pronoun.");
  if (state.setup) throw new PersonaError("already_started", "This run already has a setup. Start over to change it.");
  return { ...state, setup: { age: setup.age, closest: setup.closest, pronoun: setup.pronoun }, updatedAt: now };
}

// The answers object score-core expects.
export function scorerAnswers(state) {
  return { setup: state.setup || {}, ...state.answers, _ms: { ...state.ms } };
}

// Chapter cards this player sees, in run order: teen runs never include locked18 cards (S.runCards), gated cards
// wait for their gate, and a feeling card plays only when the card it follows was answered with a pick.
export function routeFor(state) {
  if (!state.setup) return [];
  const answers = scorerAnswers(state);
  return S.runCards(state.setup).filter((card) => {
    if (!S.gateOpen(card, answers)) return false;
    if (card.type === "feeling" && card.follows) {
      const followed = state.answers[card.follows];
      return Number.isInteger(followed) || Array.isArray(followed);
    }
    return true;
  });
}

// After the chapters: the next extra card for a side that is still unfinished. Extras for one side stop as soon as
// that side has enough cards, so a player sees 1 or 2 per unfinished side.
export function nextExtra(state) {
  const profile = S.buildProfile(scorerAnswers(state));
  return KIT.extras.find((card) => !own(state.answers, card.id) && profile.axes[card.axisFor].unfinished) || null;
}

// Cards still expected in the run: the route plus follow-ups and gated cards whose deciding answer isn't in yet.
// Only used for "card 3 of 9" style counts, so the total doesn't jump when a follow-up joins the route.
function plannedRoute(state) {
  const answers = scorerAnswers(state);
  return S.runCards(state.setup).filter((card) => {
    if (card.type === "feeling" && card.follows) {
      const followed = state.answers[card.follows];
      return followed === undefined || Number.isInteger(followed) || Array.isArray(followed);
    }
    if (card.gateRule && own(state.answers, card.gateRule.card)) return S.gateOpen(card, answers);
    return true;
  });
}

function roundInfo(route, card, state) {
  if (!card.round) return null;
  const members = route.filter((c) => c.round === card.round);
  return { index: members.findIndex((c) => c.id === card.id) + 1, size: members.length };
}

export function currentStep(state) {
  if (!state.setup) return { kind: "setup" };
  const route = routeFor(state);
  const open = route.find((c) => !own(state.answers, c.id));
  if (open) {
    const planned = plannedRoute(state);
    const inChapter = planned.filter((c) => c.chapter === open.chapter);
    return {
      kind: "card", phase: "chapter", card: open, chapter: open.chapter,
      index: inChapter.findIndex((c) => c.id === open.id) + 1, size: inChapter.length,
      resolved: route.filter((c) => own(state.answers, c.id)).length, total: planned.length,
      round: roundInfo(route, open, state),
    };
  }
  if (!state.frozen) {
    const extra = nextExtra(state);
    if (extra) {
      const answeredExtras = KIT.extras.filter((c) => own(state.answers, c.id)).length;
      return { kind: "card", phase: "extra", card: extra, chapter: "extra", index: answeredExtras + 1, size: answeredExtras + 1, resolved: route.length, total: route.length, round: null };
    }
    return { kind: "lock" };
  }
  const index = KIT.finale.findIndex((c) => !own(state.finale, c.id));
  if (index >= 0) return { kind: "card", phase: "finale", card: KIT.finale[index], chapter: "finale", index: index + 1, size: KIT.finale.length, resolved: index, total: KIT.finale.length, round: null };
  return { kind: "result" };
}

// Validates one response against its card. Returns the stored value or throws.
export function validateResponse(card, value) {
  if (typeof value === "string") {
    if (!(card.exits || []).includes(value)) throw new PersonaError("bad_answer", "That exit is not offered on this card.");
    return value;
  }
  const n = card.options.length;
  const inRange = (i) => Number.isInteger(i) && i >= 0 && i < n;
  if (card.type === "pick_two") {
    const need = card.pick || 2;
    if (!Array.isArray(value) || value.length !== need || new Set(value).size !== need || !value.every(inRange)) throw new PersonaError("bad_answer", `Pick exactly ${need}.`);
    return [...value];
  }
  if (!inRange(value)) throw new PersonaError("bad_answer", "Pick one of the options.");
  return value;
}

function validFlip(card, value, flip) {
  if (flip === null || flip === undefined) return null;
  const picks = Array.isArray(value) ? value : [value];
  const dependsPicked = picks.some((i) => Number.isInteger(i) && card.options[i] && card.options[i].depends);
  if (!dependsPicked || !card.flip || !Number.isInteger(flip) || flip < 0 || flip >= card.flip.options.length) throw new PersonaError("bad_answer", "That follow-up does not belong to this answer.");
  return flip;
}

function cleanMs(ms) {
  if (ms === null || ms === undefined) return null;
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) throw new PersonaError("bad_answer", "Bad timing value.");
  return Math.min(MAX_MS, Math.round(ms));
}

// Answer the current card (chapter, extra or finale). Answers are only accepted for the card the step machine is on,
// so nothing can be answered out of order, and chapter answers are closed once Genii's guesses are locked.
export function answerCard(state, cardId, value, { ms = null, flip = null, now = new Date().toISOString() } = {}) {
  const step = currentStep(state);
  if (step.kind !== "card" || step.card.id !== cardId) {
    throw new PersonaError(state.frozen && KIT.finale.every((c) => c.id !== cardId) ? "locked" : "out_of_order", "That card is not the one on the table.");
  }
  const card = step.card;
  const stored = validateResponse(card, value);
  if (step.phase === "finale") return { ...state, finale: { ...state.finale, [cardId]: stored }, updatedAt: now };
  const flipValue = validFlip(card, stored, flip);
  const answers = { ...state.answers, [cardId]: stored };
  if (flipValue !== null) answers[`${cardId}.flip`] = flipValue;
  const time = cleanMs(ms);
  return { ...state, answers, ms: time === null ? state.ms : { ...state.ms, [cardId]: time }, updatedAt: now };
}

export function profileFor(state) {
  return S.buildProfile(scorerAnswers(state));
}

// Genii locks its finale guesses exactly once, before any finale card is shown. The lock records the profile hash
// and a hash over the guesses themselves; both are checked again before the finale is scored.
export function lockGuesses(state, { now = new Date().toISOString() } = {}) {
  if (state.frozen) throw new PersonaError("already_locked", "Genii's guesses are locked once.");
  if (currentStep(state).kind !== "lock") throw new PersonaError("not_ready", "Finish the chapters first.");
  const profile = profileFor(state);
  const frozen = { ...S.freezePredictions(profile), frozenAt: now, profileSha256: sha256Hex(canonicalJSON(profile)) };
  return { ...state, frozen, lockHash: sha256Hex(canonicalJSON(frozen)), updatedAt: now };
}

export function verifyLock(state) {
  if (!state.frozen) return { ok: true };
  if (typeof state.lockHash !== "string" || sha256Hex(canonicalJSON(state.frozen)) !== state.lockHash) return { ok: false, reason: "guesses_changed" };
  const profile = profileFor(state);
  if (sha256Hex(canonicalJSON(profile)) !== state.frozen.profileSha256) return { ok: false, reason: "answers_changed" };
  if (canonicalJSON(S.freezePredictions(profile).predictions) !== canonicalJSON(state.frozen.predictions)) return { ok: false, reason: "guesses_changed" };
  return { ok: true };
}

export function resultFor(state) {
  if (currentStep(state).kind !== "result") throw new PersonaError("not_complete", "The run is not finished yet.");
  const check = verifyLock(state);
  if (!check.ok) throw new PersonaError("tampered", "This run changed after Genii locked its guesses, so it can't be scored.");
  const profile = profileFor(state);
  return { profile, result: S.buildResult(profile), sealed: S.checkSealed(state.frozen, state.finale) };
}

// True when the last three timed answers were all faster than the rushed threshold (a gentle in-game nudge only).
export function recentlyRushed(state, n = 3) {
  const times = Object.values(state.ms).slice(-n);
  return times.length === n && times.every((ms) => ms < S.CONFIG.rushedMs);
}

export function answeredCount(state) {
  return Object.keys(state.answers).filter((k) => !k.endsWith(".flip")).length + Object.keys(state.finale).length;
}

// ---------------------------------------------------------------- save and restore
export function serialize(state) {
  return JSON.stringify(state);
}

// A save is only trusted after it is replayed, card by card, through the same step machine that wrote it.
// Unknown fields, answers the route would never reach, a different kit or a broken lock all fail closed.
export function restore(raw, { validateExtras } = {}) {
  let data;
  try { data = JSON.parse(raw); } catch { throw new PersonaError("corrupt", "This saved run could not be read."); }
  if (!isObj(data) || data.schema !== SCHEMA) throw new PersonaError("schema", "This saved run is from a different version of Genii.");
  if (data.kit !== KIT_ID) throw new PersonaError("kit_changed", "Genii's cards changed since this run was saved.");
  const allowed = ["schema", "kit", "runId", "createdAt", "updatedAt", "setup", "answers", "ms", "frozen", "lockHash", "finale", "challenges", "friendResults", "returnTo"];
  if (Object.keys(data).some((k) => !allowed.includes(k))) throw new PersonaError("corrupt", "This saved run has unexpected fields.");
  if (typeof data.runId !== "string" || !/^[a-z0-9]{6,32}$/.test(data.runId)) throw new PersonaError("corrupt", "Bad run id.");
  if (!isObj(data.answers) || !isObj(data.ms) || !isObj(data.finale)) throw new PersonaError("corrupt", "Bad answers.");
  let state = { ...newRun({ now: String(data.createdAt || ""), runId: data.runId }), updatedAt: String(data.updatedAt || "") };
  if (data.setup !== null) {
    if (!validSetup(data.setup)) throw new PersonaError("corrupt", "Bad setup.");
    state = startRun(state, data.setup, { now: state.updatedAt });
  }
  const pending = new Set(Object.keys(data.answers).filter((k) => !k.endsWith(".flip")));
  for (const k of Object.keys(data.answers)) if (k.endsWith(".flip") && !pending.has(k.slice(0, -5))) throw new PersonaError("corrupt", "Orphan follow-up answer.");
  for (const k of Object.keys(data.ms)) if (!pending.has(k)) throw new PersonaError("corrupt", "Orphan timing.");
  for (;;) {
    const step = currentStep(state);
    if (step.kind !== "card" || step.phase === "finale" || !pending.has(step.card.id)) break;
    const id = step.card.id;
    state = answerCard(state, id, data.answers[id], { ms: own(data.ms, id) ? data.ms[id] : null, flip: own(data.answers, `${id}.flip`) ? data.answers[`${id}.flip`] : null, now: state.updatedAt });
    pending.delete(id);
  }
  if (pending.size) throw new PersonaError("corrupt", "This saved run has answers outside its route.");
  if (data.frozen !== null) {
    if (currentStep(state).kind !== "lock" || !isObj(data.frozen) || typeof data.lockHash !== "string") throw new PersonaError("corrupt", "Bad lock.");
    state = { ...state, frozen: data.frozen, lockHash: data.lockHash };
    const check = verifyLock(state);
    if (!check.ok) throw new PersonaError("tampered", "This run changed after Genii locked its guesses.");
    const finaleIds = Object.keys(data.finale);
    for (const card of KIT.finale) {
      if (!own(data.finale, card.id)) break;
      state = answerCard(state, card.id, data.finale[card.id], { now: state.updatedAt });
    }
    if (Object.keys(state.finale).length !== finaleIds.length) throw new PersonaError("corrupt", "Finale answers out of order.");
  } else if (data.lockHash !== null || Object.keys(data.finale).length) throw new PersonaError("corrupt", "Finale answers without a lock.");
  if (!Array.isArray(data.challenges) || !Array.isArray(data.friendResults)) throw new PersonaError("corrupt", "Bad friend data.");
  state = { ...state, challenges: data.challenges, friendResults: data.friendResults, returnTo: data.returnTo ?? null };
  if (validateExtras) state = validateExtras(state);
  return state;
}
