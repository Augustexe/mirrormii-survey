// Owner run state for the persona quiz V2 web game: setup, the lobby, a fixed-length run served by a rules-based
// picker, the one-time lock of Genii's finale guesses, the finale and the result. Pure functions over a plain JSON
// state; every write goes through the same step machine, and a restored save is replayed through it before use.
//
// The picker (2026-09-28) replaces the fixed chapter walk. It serves exactly RUN_SIZE cards from the eligible pool
// (open chapters plus the extras, after depth and gate rules; feeling cards only with S.CONFIG.serveFeeling), then the
// 8 finale cards drawn from the sealed pool. Picks are deterministic: the same run id and the same answers always give the same route and the same finale,
// so a save can be replayed. There is no age question and no age-based content (LAUNCH-SPEC section 22).
//
// One card per sub-question (M2, 2026-09-29): every card is built from a sub-question (`sq`, subquestions.json), and a
// run never serves two cards on one sq, counting the 8 sealed cards (drawn first, so their sqs are taken before the
// first pick). The only exception is coverage: when an axis would otherwise end below MIN_AXIS_CARDS, a second card on
// an sq that carries that axis may be served, never right after the card it repeats.
//
// Feeling cards are not served (S.CONFIG.serveFeeling = false, score-core.mjs, 2026-09-30): they score nothing (weight
// 0) and every option already records its emotion, so the picker leaves them out of every group. They stay in the bank
// untouched. Setting the flag to true restores the earlier rule: a feeling card plays right after the picked card it
// follows (`follows`), as a follow-up to that same moment, so it does not count as a second card on its sub-question.
import { S, KIT, KIT_ID } from "./kit.js";
import { sha256Hex, canonicalJSON } from "./sha256.js";
import { VOICE_IDS, DEPTH_IDS, ROOM_IDS, ROOM_CHAPTERS, LOBBY_DEFAULTS, cardVoice } from "./lobby.js";
import { LIGHT_TYPES as LIGHT } from "../../../research/persona-quiz-v2/final/card-schema.mjs";

export const SCHEMA = "genii.persona.run/3";
// Saves from the fixed chapter walk (/1) and from the age screen and four-tap lobby (/2). Their setup and lobby no
// longer exist, so they fail closed.
export const OLD_SCHEMAS = Object.freeze(["genii.persona.run/1", "genii.persona.run/2"]);
export const STORAGE_KEY = "genii.persona.v2.run";
export const EXITS = Object.freeze(["skip", "not_my_life", "no_recent"]);
export const MAX_MS = 600000;

// Scored cards per run (feeling follow-ups included when S.CONFIG.serveFeeling is on), then the finale.
export const RUN_SIZE = 40;
// Sealed cards per run, drawn from the sealed pool (kit.finale) by the run id.
export const FINALE_SIZE = Math.min(S.CONFIG.finaleSize, KIT.finale.length);
export const MIN_AXIS_CARDS = S.CONFIG.minAxisCards;
// Quick cards served after a rushed streak (card-schema.mjs): this or that, role, Genii's bet and friend's-eye view.
export const LIGHT_TYPES = LIGHT;
// Formats that should be spread out over the run, never clustered (LAUNCH-SPEC section 10): the picker penalises one
// when the same format was served within the last SPREAD_WINDOW cards, and when the other one was served just before.
export const SPREAD_TYPES = Object.freeze(["receipts", "bet"]);
export const SPREAD_WINDOW = 4;

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
  return { schema: SCHEMA, kit: KIT_ID, runId, createdAt: now, updatedAt: now, setup: null, lobby: null, answers: {}, ms: {}, frozen: null, lockHash: null, finale: {}, challenges: [], friendResults: [], returnTo: null };
}

export function randomId(length = 12) {
  const alphabet = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(length);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return [...bytes].map((b) => alphabet[b % alphabet.length]).join("");
}

// Setup is two taps: closest person (the cards' "your person") and pronoun (the friend game). No age question.
export function validSetup(setup) {
  if (!isObj(setup)) return false;
  const keys = Object.keys(setup);
  if (keys.some((k) => !["closest", "pronoun"].includes(k))) return false;
  return CLOSEST_OPTIONS.some((o) => o.id === setup.closest) && PRONOUN_OPTIONS.some((o) => o.id === setup.pronoun);
}

export function startRun(state, setup, { now = new Date().toISOString() } = {}) {
  if (!validSetup(setup)) throw new PersonaError("bad_setup", "Setup needs your closest person and a pronoun.");
  if (state.setup) throw new PersonaError("already_started", "This run already has a setup. Start over to change it.");
  return { ...state, setup: { closest: setup.closest, pronoun: setup.pronoun }, updatedAt: now };
}

// ---------------------------------------------------------------- lobby
// A lobby is { voice, depth, rooms }, all three required. voice: fun, heart or cards (Just the cards: Make it fun
// wording, no reactions between cards). depth: light (skips intimate cards) or anything. rooms lists the optional rooms
// left open (any subset of love, work, family).
export function validLobby(lobby) {
  if (!isObj(lobby)) return false;
  if (Object.keys(lobby).some((k) => !["voice", "depth", "rooms"].includes(k))) return false;
  if (!VOICE_IDS.includes(lobby.voice) || !DEPTH_IDS.includes(lobby.depth)) return false;
  if (!Array.isArray(lobby.rooms) || new Set(lobby.rooms).size !== lobby.rooms.length || !lobby.rooms.every((r) => ROOM_IDS.includes(r))) return false;
  return true;
}

export function normalizeLobby(lobby) {
  return { voice: lobby.voice, depth: lobby.depth, rooms: ROOM_IDS.filter((r) => lobby.rooms.includes(r)) };
}

export function chooseLobby(state, lobby, { now = new Date().toISOString() } = {}) {
  if (!state.setup) throw new PersonaError("not_ready", "Setup comes first.");
  if (state.lobby) throw new PersonaError("already_chosen", "This run already has its lobby picks. Start over to change them.");
  if (!validLobby(lobby)) throw new PersonaError("bad_lobby", "The lobby needs a voice, how personal Genii can get and your rooms.");
  return { ...state, lobby: normalizeLobby(lobby), updatedAt: now };
}

// The lobby voice (fun, heart or cards), and the card wording it reads (heart or fun).
export const voiceFor = (state) => (state && state.lobby && state.lobby.voice) || LOBBY_DEFAULTS.voice;
export const cardVoiceFor = (state) => cardVoice(voiceFor(state));

// The answers object score-core expects.
export function scorerAnswers(state) {
  return { setup: state.setup || {}, ...state.answers, _ms: { ...state.ms } };
}

// ---------------------------------------------------------------- the pool
// light: no intimate cards; anything: every card. Everyone gets the same bank.
export function depthAllows(card, depth) {
  return !(depth === "light" && card.privacy === "intimate");
}

// ---------------------------------------------------------------- the finale
// The 8 sealed cards of this run, drawn from the sealed pool (score-core drawFinale), seeded from the run id. Known
// from the start, so the picker can keep the last run card clear of the first finale card.
const FINALES = new Map();
export function finaleIds(state) {
  const id = state.runId;
  if (!FINALES.has(id)) {
    if (FINALES.size > 64) FINALES.delete(FINALES.keys().next().value);
    FINALES.set(id, Object.freeze(S.drawFinale(parseInt(sha256Hex(`genii.finale|${id}`).slice(0, 8), 16), FINALE_SIZE)));
  }
  return FINALES.get(id);
}
export const finaleFor = (state) => finaleIds(state).map((id) => S.cardById[id]);

export function openChapterIds(lobby) {
  const closed = new Set(ROOM_IDS.filter((r) => !lobby.rooms.includes(r)).map((r) => ROOM_CHAPTERS[r]));
  return KIT.chapters.map((ch) => ch.n).filter((n) => !closed.has(n));
}

const INFO = new Map();
// Axes and tag pairs a card can evidence (any option). flow: the dimensions the neighbour rule compares. A receipts card
// is a list of small facts spread over several topics, so it is compared on its axes only; every other card on its
// axes and tag pairs.
function infoOf(card) {
  let info = INFO.get(card.id);
  if (!info) {
    const axes = new Set();
    const pairs = new Set();
    for (const o of card.options) {
      for (const [a, v] of Object.entries(o.axes || {})) if (v) axes.add(a);
      for (const t of o.tags || []) pairs.add(t.id.slice(0, 3));
    }
    const dims = new Set([...axes, ...pairs]);
    // share: for each axis, the share of the card's scoring options that carry it (how surely an answer covers it).
    const scoring = card.options.filter((o) => !o.circumstance && !o.depends && !o.none);
    const share = Object.fromEntries([...axes].map((a) => [a, scoring.filter((o) => (o.axes || {})[a]).length / Math.max(1, scoring.length)]));
    info = { axes, pairs, dims, share, flow: card.type === "receipts" ? new Set(axes) : dims };
    INFO.set(card.id, info);
  }
  return info;
}
export const cardAxes = (card) => [...infoOf(card).axes];
export const flowDims = (card) => [...infoOf(card).flow];
// Do two neighbouring cards share a dimension the neighbour rule compares?
const flowShare = (a, b) => { const fa = infoOf(a).flow; return [...infoOf(b).flow].some((d) => fa.has(d)); };

// Static plan for one run: the groups in play order (open chapters, then the bonus group of extras), each with its
// eligible cards in authored order, plus a seeded jitter per card from the run id (the only randomness, fixed per run).
const PLANS = new Map();
function planFor(state) {
  const { setup, lobby, runId } = state;
  const key = `${runId}|${lobby.depth}|${lobby.rooms.join(",")}`;
  const hit = PLANS.get(key);
  if (hit) return hit;
  const allowed = S.runCards(setup).filter((c) => depthAllows(c, lobby.depth) && (S.CONFIG.serveFeeling || c.type !== "feeling"));
  const open = openChapterIds(lobby);
  const groups = open.map((n, i) => ({ key: n, ordinal: i + 1, cards: allowed.filter((c) => c.chapter === n) }));
  groups.push({ key: "extra", ordinal: null, cards: KIT.extras.filter((c) => depthAllows(c, lobby.depth)) });
  const order = new Map();
  const group = new Map();
  groups.forEach((g, gi) => g.cards.forEach((c, i) => { order.set(c.id, i); group.set(c.id, gi); }));
  // Rounds from every group the picker serves (chapters and extras), so a round id on any served card resolves.
  const rounds = new Map();
  for (const g of groups) for (const c of g.cards) if (c.round) rounds.set(c.round, [...(rounds.get(c.round) || []), c.id]);
  const r = S.rng(parseInt(sha256Hex(`genii.picker|${runId}`).slice(0, 8), 16));
  const jitter = new Map();
  for (const g of groups) for (const c of g.cards) jitter.set(c.id, r());
  const pairCards = new Map();
  for (const g of groups) for (const c of g.cards) if (c.type !== "feeling") for (const p of infoOf(c).pairs) pairCards.set(p, [...(pairCards.get(p) || []), c]);
  // Seeded focus per tag pair (its own stream, so the per-card jitter is unchanged): each run leans toward a different
  // set of pairs, so every pair's cards get served together for some players and every tag can fire for someone.
  const rf = S.rng(parseInt(sha256Hex(`genii.picker.focus|${runId}`).slice(0, 8), 16));
  const ranked = [...pairCards.keys()].sort().map((p) => [p, rf()]).sort((a, b) => b[1] - a[1]);
  const focus = new Map(ranked.map(([p], i) => [p, i < FOCUS_PAIRS ? 1 : 0]));
  const feelingFor = new Map(allowed.filter((c) => c.type === "feeling" && c.follows).map((c) => [c.follows, c]));
  // Sub-questions the sealed cards take (drawn before the run, so no run card may use them).
  const finaleSq = new Set(finaleFor(state).map((c) => c.sq).filter(Boolean));
  const plan = { groups, order, group, rounds, feelingFor, jitter, pairCards, focus, chapterCount: open.length, finaleFirst: finaleFor(state)[0] || null, finaleSq };
  if (PLANS.size > 64) PLANS.delete(PLANS.keys().next().value);
  PLANS.set(key, plan);
  return plan;
}

// ---------------------------------------------------------------- the picker
const AXES = S.AXES;
export const PICK_WEIGHTS = Object.freeze({
  coverage: 20, // per missing valid card on a short axis the card evidences
  urgent: 100, // a short axis only this group can still cover
  balance: 6, // divided by (1 + valid cards already on the axis) squared
  pairPush: 16, // a tag pair the player leans on that has not fired yet (this card can push it over); 8 before one card per sub-question
  pairOpen: 2, // a tag pair with no evidence yet that a later card can still complete
  pairDone: 0.5, // a tag pair that already has enough to fire
  exitSameAxis: 50, // after an exit: the card evidences the exited card's axis
  rushedLight: 40, // after 3 rushed taps: a lighter card
  real: 2, // real cards carry the most weight
  authored: 0.15, // per position in the authored chapter order
  jitter: 3, // seeded variety per run
  focus: 48, // seeded focus: FOCUS_PAIRS tag pairs per run, times how far the card can move the pair (pairReach)
  borderClash: 15, // last card of a chapter clashing with the next opener, or with the finale
  spread: 12, // a receipts or bet card when the same format was served within SPREAD_WINDOW cards
  spreadNear: 6, // a receipts or bet card right after the other one
});
const PICK = PICK_WEIGHTS;
// How far one answer to this card can move a tag pair toward firing: its best support for either side (card weight x
// the most net strength one answer gives, pick_two and receipts capped as in the scorer) over tagFire, at most 1.
const REACH = new Map();
function pairReach(card, pair) {
  const key = `${card.id}|${pair}`;
  if (!REACH.has(key)) REACH.set(key, Math.min(1, (card.weight * Math.max(S.cardTagMax(card, `${pair}A`), S.cardTagMax(card, `${pair}B`))) / S.CONFIG.tagFire));
  return REACH.get(key);
}
// Tag pairs each run focuses on (seeded from the run id).
export const FOCUS_PAIRS = 10;

function freshCtx() {
  return { served: [], ans: {}, valid: Object.fromEntries(AXES.map((a) => [a, 0])), pairs: {}, g: -1, gCount: 0, gQuota: 0, sizes: {}, round: null, timed: [], sqs: {}, repeats: [] };
}
function cloneCtx(c) {
  return { ...c, served: [...c.served], ans: { ...c.ans }, valid: { ...c.valid }, pairs: { ...c.pairs }, sizes: { ...c.sizes }, round: c.round ? { ...c.round, members: [...c.round.members] } : null, timed: [...c.timed], sqs: { ...c.sqs }, repeats: [...c.repeats] };
}

const needOf = (ctx) => Object.fromEntries(AXES.map((a) => [a, Math.max(0, MIN_AXIS_CARDS - ctx.valid[a])]));

function gateOk(card, ctx, state) {
  if (!card.gateRule) return true;
  if (!ctx.ans[card.gateRule.card]) return false;
  return S.gateOpen(card, { [card.gateRule.card]: state.answers[card.gateRule.card] });
}
// A card the coverage exception could still serve: unserved, gate open, its sub-question used exactly once.
const repeatable = (plan, card, ctx, state) => !ctx.ans[card.id] && card.type !== "feeling" && gateOk(card, ctx, state) && sqUses(plan, card, ctx) === SQ_MAX;
// Cards already on this card's sub-question in the run: served cards plus the run's sealed cards.
export const SQ_MAX = 1;
const sqUses = (plan, card, ctx) => (card.sq ? (ctx.sqs[card.sq] || 0) + (plan.finaleSq.has(card.sq) ? 1 : 0) : 0);
const sqFree = (plan, card, ctx) => sqUses(plan, card, ctx) < SQ_MAX;
// A card the picker may still choose freely: unserved, its gate open, its sub-question unused (feeling cards are
// served by their own rule, see pickInGroup).
const choosable = (plan, card, ctx, state) => !ctx.ans[card.id] && card.type !== "feeling" && gateOk(card, ctx, state) && sqFree(plan, card, ctx);

// repeatOk: also count cards the coverage exception could still serve (a second card on a used sub-question); used
// for the bonus cards, which are the designed fallback for a short side.
function supply(plan, ctx, state, from, to, repeatOk = false) {
  const out = Object.fromEntries(AXES.map((a) => [a, 0]));
  const sure = Object.fromEntries(AXES.map((a) => [a, 0]));
  // One card per sub-question: cards on one sq count once, with the best share any of them gives each axis.
  const bySq = new Map();
  for (let gi = from; gi < to; gi++) {
    for (const c of plan.groups[gi].cards) {
      if (!choosable(plan, c, ctx, state) && !(repeatOk && repeatable(plan, c, ctx, state))) continue;
      const k = c.sq || c.id;
      if (!bySq.has(k)) bySq.set(k, {});
      const best = bySq.get(k);
      // An axis counts by how surely an answer to the card covers it (a card with the axis on 2 of 5 options is 0.4).
      for (const a of infoOf(c).axes) best[a] = Math.max(best[a] || 0, infoOf(c).share[a]);
    }
  }
  const count = bySq.size;
  for (const best of bySq.values()) for (const [a, v] of Object.entries(best)) { out[a] += v; if (v === 1) sure[a]++; }
  // axes: expected cover (by share); sure: cards whose every scoring answer covers the axis (used to reserve slots).
  return { axes: out, sure, count };
}

function startGroup(plan, ctx, state, gi, R) {
  if (ctx.g >= 0) {
    const prev = plan.groups[ctx.g].key;
    if (ctx.sizes[prev]) ctx.sizes[prev] = { ...ctx.sizes[prev], total: ctx.sizes[prev].done };
  }
  ctx.g = gi;
  ctx.gCount = 0;
  ctx.round = null;
  const last = plan.groups.length - 1;
  const here = supply(plan, ctx, state, gi, gi + 1, gi === last);
  if (gi === last) { ctx.gQuota = Math.min(R, here.count); return; }
  const later = supply(plan, ctx, state, gi + 1, last);
  const chapters = supply(plan, ctx, state, gi, last);
  const extras = supply(plan, ctx, state, last, last + 1, true);
  const need = needOf(ctx);
  const reserve = AXES.reduce((s, a) => s + Math.ceil(Math.min(extras.axes[a], Math.max(0, need[a] - chapters.sure[a]))), 0);
  const avail = R - reserve;
  const share = Math.round((avail * here.count) / Math.max(1, here.count + later.count));
  const lower = R - (later.count + extras.count);
  ctx.gQuota = Math.max(0, Math.min(here.count, R, Math.max(share, lower, 1)));
}

// Slots this group may still use: its quota, shrunk when later groups must cover a short axis this group can't.
function quotaLeft(plan, ctx, state, R) {
  const last = plan.groups.length;
  const here = supply(plan, ctx, state, ctx.g, ctx.g + 1);
  const cur = here.axes;
  // Later groups: the chapters' unused sub-questions, and the bonus cards including the coverage exception's repeats.
  const laterCh = ctx.g + 1 < last - 1 ? supply(plan, ctx, state, ctx.g + 1, last - 1).axes : Object.fromEntries(AXES.map((a) => [a, 0]));
  const laterX = ctx.g < last - 1 ? supply(plan, ctx, state, last - 1, last, true).axes : Object.fromEntries(AXES.map((a) => [a, 0]));
  const later = Object.fromEntries(AXES.map((a) => [a, laterCh[a] + laterX[a]]));
  const need = needOf(ctx);
  // Slots kept for later groups: what this group cannot surely cover itself.
  const laterNeed = AXES.reduce((s, a) => s + Math.ceil(Math.min(later[a], Math.max(0, need[a] - here.sure[a]))), 0);
  return { left: Math.min(ctx.gQuota - ctx.gCount, R - laterNeed), cur, later, need };
}

const clash = (a, b) => {
  if (!a || !b) return false;
  if (a.type === b.type && a.type !== "sealed") return true;
  return flowShare(a, b);
};

function nextOpener(plan, ctx, state) {
  for (let gi = ctx.g + 1; gi < plan.groups.length - 1; gi++) {
    const c = plan.groups[gi].cards.find((x) => choosable(plan, x, ctx, state));
    if (c) return c;
  }
  return null;
}

// why: which rule served the card ("opener", "round", "feeling", "pick", "partial") plus the retention flags the
// tests check (rushed streak and whether a lighter card was on offer; exited axes and whether a same-axis card was).
function mkPick(plan, ctx, card, size, round = null, why = { rule: "pick" }) {
  const g = plan.groups[ctx.g];
  return { card, group: g.key, ordinal: g.ordinal, index: ctx.gCount + 1, size, round, why };
}

function pickInGroup(plan, ctx, state, R) {
  const group = plan.groups[ctx.g];
  const q = quotaLeft(plan, ctx, state, R);
  const left = q.left;
  if (left <= 0) return null;
  const size = ctx.gCount + left;
  const prevId = ctx.served[ctx.served.length - 1];
  const prev = prevId ? S.cardById[prevId] : null;
  const prevAns = prevId ? ctx.ans[prevId] : null;
  const shortfall = AXES.reduce((s, a) => s + q.need[a], 0);

  // Only with S.CONFIG.serveFeeling (off): a feeling card plays right after the picked moment it follows, when the
  // budget is not needed for coverage. With the flag off, feelingFor is empty (planFor leaves feeling cards out).
  const feeling = prevId ? plan.feelingFor.get(prevId) : null;
  if (feeling && prevAns.picked && !ctx.ans[feeling.id] && plan.group.get(feeling.id) === ctx.g && R > shortfall) return mkPick(plan, ctx, feeling, size, null, { rule: "feeling" });

  const cands = [];
  for (const card of group.cards) {
    if (!choosable(plan, card, ctx, state)) continue;
    if (card.round) {
      const all = plan.rounds.get(card.round).filter((id) => plan.group.get(id) === ctx.g);
      if (all.some((id) => ctx.ans[id])) continue;
      // A round plays the cards whose sub-questions are still unused (and distinct), in authored order, from the first.
      const seen = new Set();
      const members = all.filter((id) => {
        const m = S.cardById[id];
        if (!choosable(plan, m, ctx, state) || (m.sq && seen.has(m.sq))) return false;
        if (m.sq) seen.add(m.sq);
        return true;
      });
      if (members[0] !== card.id) continue;
      // A round can be played whole or cut short (its first one or two cards), so chapters pack flexibly.
      for (let k = members.length; k >= 1; k--) cands.push({ card, members, k, round: true });
    } else cands.push({ card, members: [card.id], k: 1 });
  }
  // Coverage exception: an axis whose unused sub-questions can no longer reach MIN_AXIS_CARDS may take a second card
  // on a sub-question that carries it (never a third, never right after the card it repeats, never the last run card
  // before a sealed card on the same sq).
  const thin = new Set(AXES.filter((a) => q.need[a] > 0 && q.cur[a] + q.later[a] < q.need[a]));
  if (thin.size) {
    for (const card of group.cards) {
      if (ctx.ans[card.id] || card.type === "feeling" || !gateOk(card, ctx, state) || sqFree(plan, card, ctx)) continue;
      if (sqUses(plan, card, ctx) > SQ_MAX || (prev && prev.sq === card.sq)) continue;
      if (card.round && plan.rounds.get(card.round).filter((id) => plan.group.get(id) === ctx.g)[0] !== card.id) continue;
      if (R === 1 && plan.finaleFirst && plan.finaleFirst.sq === card.sq) continue;
      if (![...infoOf(card).axes].some((a) => thin.has(a))) continue;
      cands.push({ card, members: [card.id], k: 1, repeat: true });
    }
  }
  if (!cands.length) return null;

  const start = (u, k, why) => {
    if (u.repeat) why = { ...why, sqRepeat: u.card.sq };
    if (k > 1) { ctx.round = { members: u.members.slice(0, k), pos: 0 }; return mkPick(plan, ctx, u.card, size, { index: 1, size: k }, why); }
    return mkPick(plan, ctx, u.card, size, u.card.round ? { index: 1, size: 1 } : null, why);
  };

  // Each chapter opens with its first authored card. An opening quick round takes at most half the chapter's slots, so
  // a short chapter still has room for its other cards.
  if (ctx.gCount === 0 && group.key !== "extra") {
    const opener = cands.reduce((a, b) => (plan.order.get(a.card.id) <= plan.order.get(b.card.id) ? a : b));
    return start(opener, Math.min(opener.k, left, Math.max(1, Math.floor(left / 2))), { rule: "opener" });
  }

  const urgent = new Set(AXES.filter((a) => q.need[a] > 0 && q.cur[a] > 0 && q.later[a] < q.need[a]));
  const mustHere = [...urgent].reduce((s, a) => s + (q.need[a] - q.later[a]), 0);
  const axesOf = (u) => new Set(u.members.slice(0, u.k).flatMap((id) => [...infoOf(S.cardById[id]).axes]));
  const pairsOf = (u) => new Set(u.members.slice(0, u.k).flatMap((id) => [...infoOf(S.cardById[id]).pairs]));
  const exitAxes = prevAns && prevAns.exit ? infoOf(prev).axes : null;
  const rushedStreak = ctx.timed.length >= 3 && ctx.timed.slice(-3).every(Boolean);

  // Flow rules between two cards: no two of one type in a row, no shared axis or tag pair (F3, spread, below).
  const dimsOk = (a, b) => !flowShare(a, b);
  const F1 = (u) => !prev || u.card.type !== prev.type;
  const F2 = (u) => {
    if (!prev) return true;
    // After an exit the player never answered the previous card, so a replacement on its axis (and the tag pairs
    // that come with it) is the point, not a repeat.
    if (prevAns && prevAns.exit) return true;
    return dimsOk(prev, u.card);
  };
  const carries = (u, set) => [...axesOf(u)].some((a) => set.has(a));
  // Spread (LAUNCH-SPEC section 10): never two receipts or two bet cards within SPREAD_WINDOW cards.
  const recentTypes = ctx.served.slice(-SPREAD_WINDOW).map((id) => S.cardById[id].type);
  const F3 = (u) => !SPREAD_TYPES.includes(u.card.type) || !recentTypes.includes(u.card.type);

  let pool = cands.filter((u) => u.k <= left);
  if (urgent.size && left <= mustHere) { const hit = pool.filter((u) => carries(u, urgent)); if (hit.length) pool = hit; }
  if (R <= shortfall) {
    // Last slots for a short axis: a card whose every answer covers it, when there is one.
    const short = new Set(AXES.filter((a) => q.need[a] > 0));
    const hit = pool.filter((u) => carries(u, short));
    const sure = hit.filter((u) => [...short].some((a) => (infoOf(u.card).share[a] || 0) === 1));
    if (sure.length) pool = sure; else if (hit.length) pool = hit;
  }
  // Retention: after an exit, a card on the exited card's axis; after three rushed taps, a lighter card. Both keep
  // the type rule (no two cards of one type in a row) and apply before the neighbour rule (see F2's exit waiver).
  // The replacement is the next card itself: a round qualifies only when its first card carries the axis.
  const firstCarries = (u, set) => [...infoOf(u.card).axes].some((a) => set.has(a));
  const sameAxis = exitAxes && exitAxes.size ? pool.filter((u) => F1(u) && firstCarries(u, exitAxes)) : [];
  if (sameAxis.length) pool = sameAxis;
  const light = rushedStreak ? pool.filter((u) => F1(u) && LIGHT_TYPES.includes(u.card.type)) : [];
  if (light.length) pool = light;
  const why = { rule: "pick", rushed: rushedStreak, lightOffered: light.length > 0, exitAxes: exitAxes ? [...exitAxes] : [], sameAxisOffered: sameAxis.length > 0 };
  // A repeat only when it is the one way left to cover a thin axis: drop repeat units whenever a fresh unit carries
  // every thin axis they would.
  if (thin.size && pool.some((u) => u.repeat)) {
    const fresh = pool.filter((u) => !u.repeat);
    const freshAxes = new Set(fresh.flatMap((u) => [...axesOf(u)]));
    pool = pool.filter((u) => !u.repeat || [...infoOf(u.card).axes].some((a) => thin.has(a) && !freshAxes.has(a)));
  }
  // Rarely a receipts card right after a bet (or back): preferred against whenever another unit keeps the rules.
  const F4 = (u) => !(prev && SPREAD_TYPES.includes(u.card.type) && SPREAD_TYPES.includes(prev.type));
  const strict = pool.filter((u) => F1(u) && F2(u) && F3(u));
  // One card per sub-question leaves chapters fewer cards: when nothing here keeps the flow rules, the chapter closes
  // early and hands its slots on, as long as the later groups can still fill the run.
  const canClose = group.key !== "extra" && !cands.some((u) => u.repeat) && supply(plan, ctx, state, ctx.g + 1, plan.groups.length).count >= R + CLOSE_SLACK;
  const nextFirst = group.key === "extra" ? null : nextOpener(plan, ctx, state);
  if (!strict.length && prev && canClose && !clash(prev, nextFirst)) return null;
  if (strict.length) pool = strict;
  else {
    const typeFine = pool.filter((u) => F1(u) && F3(u));
    if (typeFine.length) pool = typeFine;
    else { const typeOnly = pool.filter(F1); if (typeOnly.length) pool = typeOnly; }
  }
  // Sequencing: prefer a unit after which the rest of this chapter can still be ordered without breaking the type,
  // neighbour and spread rules, ending clear of the next chapter's opener (or the finale). Failing that, close the
  // chapter here when its last card is clear of the next opener, or pick a unit after which it can close early, clear
  // of it; failing that, drop the border.
  const border = group.key === "extra" || R <= left ? plan.finaleFirst : nextFirst;
  const recent = ctx.served.slice(-SPREAD_WINDOW).map((id) => S.cardById[id].type);
  const clean = (withBorder, close = false) => pool.filter((u) => sequenceable(u, cands, left, withBorder ? border : null, close ? nextFirst : undefined, recent));
  const withB = clean(true);
  if (withB.length) pool = withB;
  else {
    if (canClose && prev && border === nextFirst && !clash(prev, nextFirst)) return null;
    const early = canClose ? clean(true, true) : [];
    if (early.length) pool = early;
    else { const noB = clean(false); if (noB.length) pool = noB; }
  }
  // Rarely a receipts card right after a bet (or back): preferred against whenever another unit keeps the rules.
  const apart = pool.filter(F4);
  if (apart.length) pool = apart;
  let partial = false;
  if (!pool.length) { pool = cands.filter((u) => u.k > left); partial = true; why.rule = "partial"; }
  if (!pool.length) return null;

  const opener = nextOpener(plan, ctx, state);
  // Evidence value per slot: a round is scored as the average of its cards, so three quick picks compete fairly with
  // one scenario for the same budget.
  const balance = (valid) => PICK.balance / (1 + valid) ** 2;
  const cardValue = (c) => {
    const info = infoOf(c);
    let v = 0;
    // Coverage counts in full when later groups hold little for the axis, and less when they can still easily cover it,
    // so an early chapter does not spend its slots on axes a later chapter carries anyway.
    const scarce = (a) => Math.min(1, (q.need[a] + 1) / (1 + q.later[a]));
    // A card covers a short axis only as surely as its options carry it.
    for (const a of info.axes) v += q.need[a] > 0 ? info.share[a] * (PICK.coverage * q.need[a] * scarce(a) + (urgent.has(a) ? PICK.urgent : 0)) : balance(ctx.valid[a]);
    // One answer feeds one or two pairs, so a card counts only its best pair.
    const pv = [...info.pairs].map((p) => {
      const pe = ctx.pairs[p];
      if (pe && Math.abs(pe.net) >= S.CONFIG.tagFire && pe.cards >= S.CONFIG.tagMinCards) return PICK.pairDone;
      if (pe && pe.net !== 0) return PICK.pairPush;
      return (plan.pairCards.get(p) || []).some((x) => x.id !== c.id && choosable(plan, x, ctx, state)) ? PICK.pairOpen : 0;
    }).sort((a, b) => b - a);
    // Focus counts by how much this one card can move the focused pair (its best support toward either side, as a share
    // of what firing a tag takes), so the cards that evidence a pair best are the ones served for it.
    const fv = Math.max(0, ...[...info.pairs].map((p) => (plan.focus.get(p) || 0) * pairReach(c, p)));
    return v + (pv[0] || 0) + PICK.focus * fv;
  };
  const score = (u) => {
    const k = partial ? left : u.k;
    const members = u.members.slice(0, k).map((id) => S.cardById[id]);
    let s = members.reduce((acc, c) => acc + cardValue(c), 0) / k;
    if (exitAxes && [...infoOf(u.card).axes].some((a) => exitAxes.has(a))) s += PICK.exitSameAxis;
    if (rushedStreak && LIGHT_TYPES.includes(u.card.type)) s += PICK.rushedLight;
    if (u.card.type === "real") s += PICK.real;
    s -= PICK.authored * plan.order.get(u.card.id);
    s += PICK.jitter * plan.jitter.get(u.card.id);
    const lastCard = S.cardById[u.members[k - 1]];
    if (k >= left && group.key !== "extra" && clash(lastCard, opener)) s -= PICK.borderClash;
    if (k >= R && clash(lastCard, plan.finaleFirst)) s -= PICK.borderClash;
    if (SPREAD_TYPES.includes(u.card.type)) {
      const recent = ctx.served.slice(-SPREAD_WINDOW).map((id) => S.cardById[id].type);
      if (recent.includes(u.card.type)) s -= PICK.spread;
      if (prev && prev.type !== u.card.type && SPREAD_TYPES.includes(prev.type)) s -= PICK.spreadNear;
    }

    return s;
  };
  let best = null;
  let bestScore = -Infinity;
  for (const u of pool) {
    const s = score(u);
    if (s > bestScore || (s === bestScore && u.card.id < best.card.id)) { best = u; bestScore = s; }
  }
  return start(best, partial ? left : best.k, why);
}

// A chapter closes early only when the later groups keep CLOSE_SLACK spare cards beyond the slots left (their quotas
// and flow rules rarely use every card). Without the margin a skip-heavy run in a four-chapter lobby closed chapter 1
// after 3 cards, then served two bets in a row and ended a card short (P0, 2026-09-30).
const CLOSE_SLACK = 2;

// Can the chapter's remaining slots be filled, after unit u, by other units in an order that keeps both flow rules
// between neighbours (rounds are whole and keep their authored inner order), and end clear of the border card? Depth-first with
// memo; a chapter has at most 10 units.
// closeBorder (optional): the chapter may also end early, before its slots are used up, when its last card is clear
// of this card (the next chapter's opener).
const SEQ_BUDGET = 2000;
function sequenceable(u, cands, left, border, closeBorder, recent = []) {
  // One card per sub-question: units that share a sub-question with u, or with each other, never both fill slots.
  const sqsOf = (v, k = v.k) => new Set(v.members.slice(0, k).map((id) => S.cardById[id].sq).filter(Boolean));
  const uSq = sqsOf(u, Math.min(u.k, left));
  const meets = (a, b) => [...a].some((x) => b.has(x));
  // Units that start at the same card (a round and its shorter cuts) are used at most once, together.
  const units = cands.filter((v) => v.card !== u.card && !v.repeat && !meets(sqsOf(v), uSq));
  const unitSq = units.map((v) => sqsOf(v));
  const masks = units.map((_, i) => units.reduce((m, v, j) => (v.card === units[i].card || meets(unitSq[i], unitSq[j]) ? m | (1 << j) : m), 0));
  const groupUsed = (i) => masks[i];
  const lastOf = (v, k) => S.cardById[v.members[k - 1]];
  // The spread rule too: no receipts or bet card within SPREAD_WINDOW cards of another one of its format.
  const ok = (a, b, win) => a.type !== b.type && !flowShare(a, b) && !(SPREAD_TYPES.includes(b.type) && win.includes(b.type));
  // The window only matters for the spread formats, so every other format is kept as "-" (a smaller search memo).
  const push = (win, v, k) => [...win, ...v.members.slice(0, k).map((id) => (SPREAD_TYPES.includes(S.cardById[id].type) ? S.cardById[id].type : "-"))].slice(-SPREAD_WINDOW);
  const memo = new Map();
  // A search budget keeps a crowded chapter from stalling the step machine: past it, the unit counts as not sequenceable.
  let budget = SEQ_BUDGET;
  const dfs = (last, used, slots, win) => {
    if (slots === 0) return !border || !clash(last, border);
    if (--budget < 0) return false;
    if (closeBorder !== undefined && !clash(last, closeBorder)) return true;
    const key = `${last.id}|${used}|${slots}|${win.join(",")}`;
    if (memo.has(key)) return memo.get(key);
    let found = false;
    for (let i = 0; i < units.length && !found; i++) {
      if (used & groupUsed(i)) continue;
      const v = units[i];
      if (v.k > slots || !ok(last, v.card, win)) continue; // a round is only cut short when nothing else fits
      found = dfs(lastOf(v, v.k), used | groupUsed(i), slots - v.k, push(win, v, v.k));
    }
    memo.set(key, found);
    return found;
  };
  const k = Math.min(u.k, left);
  const after = left - k;
  const available = [...new Set(units.map((v) => v.card))].reduce((n, c) => n + Math.max(...units.filter((v) => v.card === c).map((v) => v.k)), 0);
  // (an upper bound: units that share a sub-question are counted separately here; the search below keeps them apart)
  if (after > available) return false; // the chapter could no longer fill its slots (a round cut too short)
  return dfs(lastOf(u, k), 0, after, push(recent.map((t) => (SPREAD_TYPES.includes(t) ? t : "-")), u, k));
}

function advance(plan, ctx, state) {
  const R = RUN_SIZE - ctx.served.length;
  if (R <= 0) return null;
  if (ctx.round && ctx.round.pos < ctx.round.members.length) {
    const card = S.cardById[ctx.round.members[ctx.round.pos]];
    const size = ctx.sizes[plan.groups[ctx.g].key].total;
    return mkPick(plan, ctx, card, size, { index: ctx.round.pos + 1, size: ctx.round.members.length }, { rule: "round" });
  }
  ctx.round = null;
  if (ctx.g >= 0) {
    const pick = pickInGroup(plan, ctx, state, R);
    if (pick) return pick;
  }
  for (let gi = ctx.g + 1; gi < plan.groups.length; gi++) {
    startGroup(plan, ctx, state, gi, R);
    if (ctx.gQuota <= 0) continue;
    const pick = pickInGroup(plan, ctx, state, R);
    if (pick) return pick;
  }
  return fillPick(plan, ctx, state);
}

// Safety net: every run serves exactly RUN_SIZE cards. When no group can serve a fresh card, the bonus group serves a
// second card on a used sub-question (never a third, never right after the card it repeats), marked like a coverage
// repeat. Not reached by any simulated lobby (P0, 2026-09-30); it only keeps the run length fixed.
function fillPick(plan, ctx, state) {
  const last = plan.groups.length - 1;
  if (ctx.g !== last || plan.groups[last].key !== "extra") return null;
  const prev = ctx.served.length ? S.cardById[ctx.served[ctx.served.length - 1]] : null;
  const ok = plan.groups[last].cards.filter((c) => !ctx.ans[c.id] && c.type !== "feeling" && gateOk(c, ctx, state) && sqUses(plan, c, ctx) <= SQ_MAX && !(prev && c.sq && prev.sq === c.sq));
  if (!ok.length) return null;
  const rank = (c) => (prev && c.type === prev.type ? 2 : 0) + (prev && flowShare(prev, c) ? 1 : 0);
  const card = [...ok].sort((a, b) => rank(a) - rank(b) || plan.jitter.get(a.id) - plan.jitter.get(b.id))[0];
  return mkPick(plan, ctx, card, ctx.gCount + 1, card.round ? { index: 1, size: 1 } : null, { rule: "fill", ...(sqUses(plan, card, ctx) ? { sqRepeat: card.sq } : {}) });
}

// Records one answered card in the picker's running tallies (valid axis cards, tag pair evidence, exits, timing).
function apply(plan, ctx, pick, raw, ms) {
  const card = pick.card;
  // A feeling follow-up (only with S.CONFIG.serveFeeling) belongs to the moment it follows: not a second card on its sq.
  if (card.sq && card.type !== "feeling") {
    if (ctx.sqs[card.sq] || plan.finaleSq.has(card.sq)) ctx.repeats.push(card.id);
    ctx.sqs[card.sq] = (ctx.sqs[card.sq] || 0) + 1;
  }
  ctx.served.push(card.id);
  ctx.gCount++;
  if (ctx.round) ctx.round.pos++;
  ctx.sizes[pick.group] = { done: ctx.gCount, total: Math.max(pick.size, ctx.gCount) };
  const exit = typeof raw === "string";
  const rushed = ms !== null && ms !== undefined && ms < S.CONFIG.rushedMs;
  ctx.ans[card.id] = { exit, picked: !exit, rushed };
  if (ms !== null && ms !== undefined) ctx.timed.push(rushed);
  if (exit || !card.weight) return;
  const picks = [raw].flat();
  const ws = S.pickWeights(card, picks).map((w) => w * (rushed ? S.CONFIG.rushedFactor : 1));
  const axes = new Set();
  const pairs = {};
  for (const [k, i] of picks.entries()) {
    const o = card.options[i];
    const w = ws[k];
    if (!o || o.circumstance || o.depends || o.none || !w) continue;
    // A rank item only covers an axis when it is placed where it counts for it (first or second).
    for (const [a, v] of Object.entries(o.axes || {})) if (v && w > 0) axes.add(a);
    for (const t of o.tags || []) { const p = t.id.slice(0, 3); pairs[p] = (pairs[p] || 0) + (t.id.endsWith("A") ? 1 : -1) * t.s * w; }
  }
  for (const a of axes) ctx.valid[a]++;
  for (const [p, net] of Object.entries(pairs)) {
    const pe = ctx.pairs[p] || { cards: 0, net: 0 };
    ctx.pairs[p] = { cards: pe.cards + 1, net: pe.net + net };
  }
}

// The picker's walk over a state: every answered card in serve order, then the card on the table (or null).
// Cached per answers object; answerCard extends the cached walk by one card instead of replaying the run.
const WALKS = new WeakMap();
function cachedWalk(state) {
  const hit = WALKS.get(state.answers);
  return hit && hit.ms === state.ms && hit.setup === state.setup && hit.lobby === state.lobby && hit.runId === state.runId ? hit.walk : null;
}
function remember(state, walk) {
  WALKS.set(state.answers, { ms: state.ms, setup: state.setup, lobby: state.lobby, runId: state.runId, walk });
  return walk;
}
function walk(state) {
  const hit = cachedWalk(state);
  if (hit) return hit;
  const plan = planFor(state);
  const ctx = freshCtx();
  let pick = advance(plan, ctx, state);
  while (pick && own(state.answers, pick.card.id)) {
    const id = pick.card.id;
    apply(plan, ctx, pick, state.answers[id], own(state.ms, id) ? state.ms[id] : null);
    pick = advance(plan, ctx, state);
  }
  return remember(state, { plan, ctx, pick });
}

// Why the picker put the current card on the table (tests and QA only; never shown to the player).
export function pickInfo(state) {
  if (!state.setup || !state.lobby) return null;
  const w = walk(state);
  return w.pick ? { id: w.pick.card.id, ...w.pick.why } : null;
}

// Cards served so far, in order, plus the card on the table.
export function routeFor(state) {
  if (!state.setup || !state.lobby) return [];
  const w = walk(state);
  return [...w.ctx.served, ...(w.pick ? [w.pick.card.id] : [])].map((id) => S.cardById[id]);
}

// Every card this player could still be served or has been served: open chapters and extras after the depth filter,
// gated cards only once their gate is open, and no unserved card on a sub-question the run already used (the sealed
// cards' included). The coverage exception (pickInGroup) can still serve one of those; routeFor shows it once served.
// Feeling cards only with S.CONFIG.serveFeeling, and then only after a picked moment they follow.
export function poolFor(state) {
  if (!state.setup || !state.lobby) return [];
  const plan = planFor(state);
  const w = walk(state);
  return plan.groups.flatMap((g) => g.cards).filter((c) => {
    if (w.ctx.ans[c.id]) return true;
    if (c.type === "feeling") return !!w.ctx.ans[c.follows] && w.ctx.ans[c.follows].picked;
    if (!sqFree(plan, c, w.ctx)) return false;
    return gateOk(c, w.ctx, state);
  });
}

// Per chapter: { open, done, total } (total is the chapter's planned size once it has started, else 0); 8 is the finale.
export function chapterProgress(state) {
  if (!state.setup) return {};
  const out = {};
  const open = state.lobby ? new Set(openChapterIds(state.lobby)) : new Set(KIT.chapters.map((c) => c.n));
  const w = state.lobby ? walk(state) : null;
  for (const ch of KIT.chapters) {
    const s = w && w.ctx.sizes[ch.n];
    out[ch.n] = { open: open.has(ch.n), done: s ? s.done : 0, total: s ? s.total : 0 };
  }
  if (w && w.pick && typeof w.pick.group === "number") out[w.pick.group] = { ...out[w.pick.group], total: w.pick.size };
  if (state.frozen) out[8] = { open: true, done: Object.keys(state.finale).length, total: FINALE_SIZE };
  return out;
}

export function currentStep(state) {
  if (!state.setup) return { kind: "setup" };
  if (!state.lobby) return { kind: "lobby" };
  const w = walk(state);
  if (w.pick) {
    const p = w.pick;
    return {
      kind: "card", phase: p.group === "extra" ? "extra" : "chapter", card: p.card, chapter: p.group,
      index: p.index, size: p.size, resolved: w.ctx.served.length, total: RUN_SIZE, round: p.round,
      ordinal: p.ordinal, chapters: w.plan.chapterCount,
    };
  }
  if (!state.frozen) return { kind: "lock" };
  const finale = finaleFor(state);
  const index = finale.findIndex((c) => !own(state.finale, c.id));
  if (index >= 0) return { kind: "card", phase: "finale", card: finale[index], chapter: "finale", index: index + 1, size: finale.length, resolved: index, total: finale.length, round: null };
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
  if (card.type === "receipts") {
    // Tap everything that's true, then Done: 0 to n items; "None of these" stands alone.
    if (!Array.isArray(value) || new Set(value).size !== value.length || !value.every(inRange)) throw new PersonaError("bad_answer", "Tap the ones that are true, then Done.");
    if (value.length > 1 && value.some((i) => card.options[i].none)) throw new PersonaError("bad_answer", "\"None of these\" can't be ticked with other items.");
    return [...value].sort((a, b) => a - b);
  }
  if (card.type === "rank") {
    // Rank it: every item once, first to last.
    if (!Array.isArray(value) || value.length !== n || new Set(value).size !== n || !value.every(inRange)) throw new PersonaError("bad_answer", "Put every item in order, then Done.");
    return [...value];
  }
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

// Answer the current card (run or finale). Answers are only accepted for the card the step machine is on, so nothing
// can be answered out of order, and run answers are closed once Genii's guesses are locked.
export function answerCard(state, cardId, value, { ms = null, flip = null, now = new Date().toISOString() } = {}) {
  const step = currentStep(state);
  if (step.kind !== "card" || step.card.id !== cardId) {
    throw new PersonaError(state.frozen && !finaleIds(state).includes(cardId) ? "locked" : "out_of_order", "That card is not the one on the table.");
  }
  const card = step.card;
  const stored = validateResponse(card, value);
  if (step.phase === "finale") return { ...state, finale: { ...state.finale, [cardId]: stored }, updatedAt: now };
  const flipValue = validFlip(card, stored, flip);
  const answers = { ...state.answers, [cardId]: stored };
  if (flipValue !== null) answers[`${cardId}.flip`] = flipValue;
  const time = cleanMs(ms);
  const next = { ...state, answers, ms: time === null ? state.ms : { ...state.ms, [cardId]: time }, updatedAt: now };
  // Extend the picker's walk by this one card, so the next step costs one pick, not a replay.
  const before = walk(state);
  const ctx = cloneCtx(before.ctx);
  apply(before.plan, ctx, before.pick, stored, time);
  remember(next, { plan: before.plan, ctx, pick: advance(before.plan, ctx, next) });
  return next;
}

export function profileFor(state) {
  return S.buildProfile(scorerAnswers(state));
}

// Genii locks its finale guesses exactly once, before any finale card is shown. The lock records the profile hash
// and a hash over the guesses themselves; both are checked again before the finale is scored.
export function lockGuesses(state, { now = new Date().toISOString() } = {}) {
  if (state.frozen) throw new PersonaError("already_locked", "Genii's guesses are locked once.");
  if (currentStep(state).kind !== "lock") throw new PersonaError("not_ready", "Finish the cards first.");
  const profile = profileFor(state);
  const frozen = { ...S.freezePredictions(profile, finaleIds(state)), frozenAt: now, profileSha256: sha256Hex(canonicalJSON(profile)) };
  return { ...state, frozen, lockHash: sha256Hex(canonicalJSON(frozen)), updatedAt: now };
}

export function verifyLock(state) {
  if (!state.frozen) return { ok: true };
  if (typeof state.lockHash !== "string" || sha256Hex(canonicalJSON(state.frozen)) !== state.lockHash) return { ok: false, reason: "guesses_changed" };
  const profile = profileFor(state);
  if (sha256Hex(canonicalJSON(profile)) !== state.frozen.profileSha256) return { ok: false, reason: "answers_changed" };
  if (canonicalJSON(S.freezePredictions(profile, finaleIds(state)).predictions) !== canonicalJSON(state.frozen.predictions)) return { ok: false, reason: "guesses_changed" };
  return { ok: true };
}

export function resultFor(state) {
  if (currentStep(state).kind !== "result") throw new PersonaError("not_complete", "The run is not finished yet.");
  const check = verifyLock(state);
  if (!check.ok) throw new PersonaError("tampered", "This run changed after Genii locked its guesses, so it can't be scored.");
  const profile = profileFor(state);
  return { profile, result: S.buildResult(profile), sealed: S.checkSealed(state.frozen, state.finale) };
}

// True when the last three timed answers, in serve order, were all faster than the rushed threshold. Drives the
// gentle nudge and the picker's lighter-card rule.
export function recentlyRushed(state, n = 3) {
  if (!state.setup || !state.lobby) return false;
  const timed = walk(state).ctx.timed;
  return timed.length >= n && timed.slice(-n).every(Boolean);
}

export function answeredCount(state) {
  return Object.keys(state.answers).filter((k) => !k.endsWith(".flip")).length + Object.keys(state.finale).length;
}

// ---------------------------------------------------------------- save and restore
export function serialize(state) {
  return JSON.stringify(state);
}

// A save is only trusted after it is replayed, card by card, through the same step machine (and picker) that wrote
// it. Unknown fields, answers the picker would never serve, a different kit or a broken lock all fail closed.
export function restore(raw, { validateExtras } = {}) {
  let data;
  try { data = JSON.parse(raw); } catch { throw new PersonaError("corrupt", "This saved run could not be read."); }
  if (isObj(data) && OLD_SCHEMAS.includes(data.schema)) throw new PersonaError("schema", "This saved run is from an earlier version of Genii, so it can't continue here.");
  if (!isObj(data) || data.schema !== SCHEMA) throw new PersonaError("schema", "This saved run is from a different version of Genii.");
  if (data.kit !== KIT_ID) throw new PersonaError("kit_changed", "Genii's cards changed since this run was saved.");
  const allowed = ["schema", "kit", "runId", "createdAt", "updatedAt", "setup", "lobby", "answers", "ms", "frozen", "lockHash", "finale", "challenges", "friendResults", "returnTo"];
  if (Object.keys(data).some((k) => !allowed.includes(k))) throw new PersonaError("corrupt", "This saved run has unexpected fields.");
  if (typeof data.runId !== "string" || !/^[a-z0-9]{6,32}$/.test(data.runId)) throw new PersonaError("corrupt", "Bad run id.");
  if (!isObj(data.answers) || !isObj(data.ms) || !isObj(data.finale)) throw new PersonaError("corrupt", "Bad answers.");
  let state = { ...newRun({ now: String(data.createdAt || ""), runId: data.runId }), updatedAt: String(data.updatedAt || "") };
  if (data.setup !== null) {
    if (!validSetup(data.setup)) throw new PersonaError("corrupt", "Bad setup.");
    state = startRun(state, data.setup, { now: state.updatedAt });
  }
  if (data.lobby !== null && data.lobby !== undefined) {
    if (!state.setup || !validLobby(data.lobby)) throw new PersonaError("corrupt", "Bad lobby.");
    state = chooseLobby(state, data.lobby, { now: state.updatedAt });
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
    const frozenKeys = ["version", "predictions", "frozenAt", "profileSha256"];
    if (currentStep(state).kind !== "lock" || !isObj(data.frozen) || typeof data.lockHash !== "string" || Object.keys(data.frozen).sort().join() !== [...frozenKeys].sort().join()) throw new PersonaError("corrupt", "Bad lock.");
    state = { ...state, frozen: data.frozen, lockHash: data.lockHash };
    const check = verifyLock(state);
    if (!check.ok) throw new PersonaError("tampered", "This run changed after Genii locked its guesses.");
    const finaleIds = Object.keys(data.finale);
    for (const card of finaleFor(state)) {
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
