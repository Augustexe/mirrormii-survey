// Browser storage for the persona game. Everything stays in this browser's localStorage: the owner's run under one
// versioned key, a friend's in-progress guesses under another. Loads are validated; bad data is never trusted.
import { STORAGE_KEY, restore, serialize, PersonaError } from "./session.js";
import { validateFriendData, parseChallenge, friendDeckView, cleanGuesses } from "./friend.js";

export const RUN_KEY = STORAGE_KEY;
export const FRIEND_PLAY_KEY = "genii.persona.friend-play.v1";
export const MOTION_KEY = "genii.motion.v1";
const MAX_PLAYS = 12;

export function restoreRun(raw) {
  return restore(raw, { validateExtras: validateFriendData });
}

// { state, error, raw }: state is null when nothing is saved or the save failed validation (raw is then kept so the
// player can download it before starting over).
export function loadRun(storage) {
  let raw = null;
  try { raw = storage.getItem(RUN_KEY); } catch { return { state: null, error: "unavailable", raw: null }; }
  if (raw === null) return { state: null, error: null, raw: null };
  try { return { state: restoreRun(raw), error: null, raw: null }; }
  catch (e) { return { state: null, error: e instanceof PersonaError ? e.code : "corrupt", message: e.message, raw }; }
}

export function saveRun(storage, state) {
  try { storage.setItem(RUN_KEY, serialize(state)); return true; } catch { return false; }
}

const STAGES = ["intro", "level1", "level2", "level3", "level4", "done"];

function cleanPlay(entry, id) {
  if (!entry || typeof entry !== "object" || typeof entry.payload !== "string") return null;
  const ch = parseChallenge(entry.payload);
  if (ch.id !== id) return null;
  const under18 = ch.mk ? (entry.under18 === true ? true : entry.under18 === false ? false : null) : false;
  const view = friendDeckView(ch, { under18: !!under18 });
  const stage = STAGES.includes(entry.stage) ? entry.stage : "intro";
  const step = Number.isInteger(entry.step) && entry.step >= 0 && entry.step < 64 ? entry.step : 0;
  return { payload: entry.payload, under18, stage, step, guesses: cleanGuesses(view, entry.guesses), updatedAt: String(entry.updatedAt || "") };
}

export function loadFriendPlays(storage) {
  let data;
  try { data = JSON.parse(storage.getItem(FRIEND_PLAY_KEY) || "{}"); } catch { return {}; }
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const out = {};
  for (const [id, entry] of Object.entries(data)) {
    try { const clean = cleanPlay(entry, id); if (clean) out[id] = clean; } catch { /* a bad entry is dropped */ }
  }
  return out;
}

export function saveFriendPlay(storage, id, entry) {
  const plays = loadFriendPlays(storage);
  plays[id] = entry;
  const keep = Object.entries(plays).sort((a, b) => String(b[1].updatedAt).localeCompare(String(a[1].updatedAt))).slice(0, MAX_PLAYS);
  try { storage.setItem(FRIEND_PLAY_KEY, JSON.stringify(Object.fromEntries(keep))); return true; } catch { return false; }
}

// "Delete my data": every key this app family ever wrote in this browser starts with "genii.".
export function deleteAllGeniiData(storage) {
  const keys = [];
  try { for (let i = 0; i < storage.length; i++) { const k = storage.key(i); if (k && k.startsWith("genii.")) keys.push(k); } } catch { return 0; }
  for (const k of keys) { try { storage.removeItem(k); } catch { /* keep going */ } }
  return keys.length;
}
