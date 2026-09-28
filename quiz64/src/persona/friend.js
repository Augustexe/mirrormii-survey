// "Do you really know me?": the owner's challenge, the link a friend plays, the reply link back, and every view of
// the result. Decks come from score-core buildFriendDeck and scores from score-core scoreFriendGame. Links carry
// only card, tag and roast ids plus the answer key the friend's device needs to show counts: never answer texts,
// stings (except the owner-enabled bestie round), research fields, scores or other answers.
import { S, FRIEND, KIT_ID, AXES, TAG, LIB } from "./kit.js";
import { encodePayload, decodePayload, LinkError } from "./links.js";
import { PersonaError, randomId, resultFor, scorerAnswers } from "./session.js";

export const FRIEND_EMOJI = Object.freeze(["🐸", "🌙", "🦊", "🌻", "🐙", "🍓", "⚡", "🐝", "🌊", "🍜", "🦄", "🎧"]);
export const RELATIONSHIPS = FRIEND.relationships.options;
const REL_IDS = RELATIONSHIPS.map((o) => o.id);
const relOf = (id) => RELATIONSHIPS.find((o) => o.id === id);
const TOGGLE = Object.fromEntries(FRIEND.relationships.privacyToggles.map((t) => [t.id, t]));
const GROUPS = FRIEND.relationships.tagPairGroups;
const ROAST = Object.fromEntries(FRIEND.level4.pickTheRoast.roasts.map((x) => [x.id, x]));
export const WHY_CHIPS = FRIEND.level2.whyChips.options;
const CHIP_IDS = new Set(WHY_CHIPS.map((c) => c.id));
const pairOf = (id) => id.slice(0, 3);
const MAX_CHALLENGES = 20;

const isObj = (v) => !!v && typeof v === "object" && !Array.isArray(v);
const bad = (message = "This link looks cut off or changed.") => new LinkError("invalid", message);

// ---------------------------------------------------------------- names and tokens
// The owner's display name for their friend links: letters, spaces and . ' - only, up to 24 characters, or empty.
export function cleanName(raw) {
  const s = String(raw ?? "").normalize("NFC").replace(/\s+/g, " ").trim();
  if (!s) return "";
  if (s.length > 24 || !/^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u.test(s)) throw new PersonaError("bad_name", "Use letters, spaces, apostrophes or hyphens, up to 24 characters.");
  return s;
}

// Fills owner pronouns (score-core friendFill) and the owner's name. Without a name, "your friend" reads naturally.
export function fillOwner(text, { pronoun = "they", name = "" } = {}) {
  const filled = S.friendFill(text, { pronoun, name: "" });
  if (name) return filled.replaceAll("{name}", name);
  return filled.replace(/\{name\}/g, (_, offset, all) => (/(^|[.!?…]\s+|["“‘(]\s*)$/.test(all.slice(0, offset)) ? "Your friend" : "your friend"));
}

export function fillVars(text, vars = {}) {
  return String(text || "")
    .replace(/\{(\w+)\}/g, (m, key) => (Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : m))
    .replace(/([.!?])(["”])\./g, "$1$2");
}
const q = (name) => `“${name}”`;

export function friendLabel(rel, emoji) {
  const r = relOf(rel);
  return `${r ? r.label : "Friend"} ${FRIEND_EMOJI[emoji] || ""}`.trim();
}

// ---------------------------------------------------------------- owner: create a challenge
// Which switches a relationship offers (friend.json privacyToggles; null = not offered). Teens never get the
// marriage and kids switch.
export function toggleOptions(rel, setup) {
  const def = (id) => TOGGLE[id].default[rel];
  const teen = setup && setup.age === "teen";
  const offer = (id) => (def(id) === null ? null : { default: def(id), label: TOGGLE[id].label, confirm: TOGGLE[id].confirm || null });
  return { love: offer("loveTags"), mk: teen ? null : offer("marriageKidsTags"), stings: offer("stingLines"), showType: offer("showType") };
}

export function invitesFor(rel, state) {
  const sent = (state?.challenges || []).length;
  return (FRIEND.invites[rel] || []).map((line, i) => ({ index: i, line, requires: line.requires || null, ok: !line.requires || (line.requires === "the owner has sent at least one other link" ? sent > 0 : true) }));
}

export function inviteText(rel, index, { stings = false, sentBefore = false } = {}) {
  const line = (FRIEND.invites[rel] || [])[index];
  if (!line) return "";
  if (line.requires === "stingLines on" && !stings) return line.fallback.t;
  if (line.requires === "the owner has sent at least one other link" && !sentBefore) return line.fallback.t;
  return line.t;
}

function randomSeed() {
  const bytes = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(bytes);
  else bytes[0] = Math.floor(Math.random() * 0xffffffff);
  return bytes[0] >>> 0;
}

function normalizeChallenge(input, setup) {
  if (!isObj(input) || !REL_IDS.includes(input.rel)) throw new PersonaError("bad_challenge", "Pick who you're sending this to.");
  const offered = toggleOptions(input.rel, setup);
  const pick = (key) => (offered[key] === null ? false : typeof input[key] === "boolean" ? input[key] : offered[key].default);
  const emoji = Number.isInteger(input.emoji) && input.emoji >= 0 && input.emoji < FRIEND_EMOJI.length ? input.emoji : 0;
  const invite = Number.isInteger(input.invite) && input.invite >= 0 && input.invite < (FRIEND.invites[input.rel] || []).length ? input.invite : 0;
  return { rel: input.rel, love: pick("love"), mk: pick("mk"), stings: pick("stings"), showType: pick("showType"), emoji, invite, name: cleanName(input.name) };
}

export function createChallenge(state, input, { now = new Date().toISOString(), id = randomId(10), seed = randomSeed() } = {}) {
  resultFor(state);
  const ch = { id, ...normalizeChallenge(input, state.setup), seed: seed >>> 0, createdAt: now, sentBefore: state.challenges.length > 0 };
  challengeDeck(state, ch);
  return { state: { ...state, challenges: [...state.challenges.filter((c) => c.id !== id), ch].slice(-MAX_CHALLENGES), updatedAt: now }, challenge: ch };
}

// The owner-side deck (with the truth). Rebuilt from the saved choices every time, never stored.
export function challengeDeck(state, ch, { under18 = false } = {}) {
  const answers = scorerAnswers(state);
  const profile = S.buildProfile(answers);
  return S.buildFriendDeck(profile, answers, { rel: ch.rel, love: ch.love, mk: under18 ? false : ch.mk, stings: ch.stings, seed: ch.seed });
}

const l3Body = (d) => (d.level3.skipped ? null : { n: d.level3.N, d: d.level3.cards.map((c) => c.id), t: d.level3.cards.filter((c) => c.role === "true").map((c) => c.id) });
const l4Body = (d) => {
  if (!d.level4 || !d.level4.enabled) return null;
  const lines = d.level4.stingPick ? d.level4.stingPick.lines : [];
  return { l: lines.map((x) => x.tag), t: (lines.find((x) => x.true) || {}).tag || "", r: d.level4.pickTheRoast.lines.map((x) => x.id) };
};

// The only fields that leave the owner's device in a challenge link.
export function challengeBody(state, ch) {
  const deck = challengeDeck(state, ch);
  const body = {
    v: 1, k: KIT_ID, i: ch.id, r: ch.rel, n: ch.name, p: state.setup.pronoun, e: ch.emoji, s: ch.seed, w: ch.invite,
    o: [ch.love, ch.mk, ch.stings, ch.showType].map(Number),
    a: deck.level1.map((q) => [q.truth, q.why === "unfinished" ? 2 : q.why === "flex" ? 1 : 0]),
    b: deck.level2.skipped ? [] : deck.level2.cards.map((c) => [c.id, c.answer]),
    c: l3Body(deck),
    d: l4Body(deck),
  };
  if (ch.mk) {
    const young = challengeDeck(state, ch, { under18: true });
    body.cu = l3Body(young);
    body.du = l4Body(young);
  }
  return body;
}

export function challengePayload(state, ch) {
  return encodePayload(challengeBody(state, ch));
}

// ---------------------------------------------------------------- friend: parse and play a challenge
const L2_LEVEL = (id) => ((FRIEND.level2.cards || {})[id] || {}).level || "everyday";

function allowedPairs(rel, love, mk) {
  return new Set([...GROUPS.open.pairs, ...(love ? GROUPS.love.pairs : []), ...(mk ? GROUPS.marriageKids.pairs : [])]);
}

function checkL3(c, allowed) {
  if (c === null) return null;
  if (!isObj(c) || Object.keys(c).some((k) => !["n", "d", "t"].includes(k))) throw bad();
  const { n, d, t } = c;
  if (!Number.isInteger(n) || n < 1 || n > 5 || !Array.isArray(d) || d.length !== 12 || !Array.isArray(t) || t.length !== n) throw bad();
  if (new Set(d).size !== 12 || new Set(t).size !== n) throw bad();
  for (const id of d) if (typeof id !== "string" || !TAG[id] || !allowed.has(pairOf(id))) throw bad();
  for (const id of t) if (!d.includes(id) || !d.includes(TAG[id].pair)) throw bad();
  const truthPairs = new Set(t.map(pairOf));
  const count = {};
  for (const id of d) count[pairOf(id)] = (count[pairOf(id)] || 0) + 1;
  for (const [pair, k] of Object.entries(count)) if (k > (truthPairs.has(pair) ? 2 : 1)) throw bad();
  return { N: n, cards: d, truth: t };
}

function checkL4(v, allowed, love) {
  if (v === null) return null;
  if (!isObj(v) || Object.keys(v).some((k) => !["l", "t", "r"].includes(k))) throw bad();
  const { l, t, r } = v;
  if (!Array.isArray(l) || !(l.length === 0 || l.length === 4) || new Set(l).size !== l.length) throw bad();
  for (const id of l) if (typeof id !== "string" || !TAG[id] || !allowed.has(pairOf(id))) throw bad();
  if (l.length ? !l.includes(t) : t !== "") throw bad();
  if (!Array.isArray(r) || r.length > 6 || new Set(r).size !== r.length) throw bad();
  for (const id of r) {
    if (typeof id !== "string" || !ROAST[id]) throw bad();
    if (!love && GROUPS.love.pairs.includes(pairOf(ROAST[id].tag))) throw bad();
  }
  return { lines: l, truth: t, roasts: r };
}

export function parseChallenge(raw) {
  const b = decodePayload(raw);
  const keys = ["v", "k", "i", "r", "n", "p", "e", "s", "w", "o", "a", "b", "c", "d", "cu", "du"];
  if (Object.keys(b).some((k) => !keys.includes(k))) throw bad();
  if (b.v !== 1) throw new LinkError("version", "This link was made with a different version of Genii.");
  if (b.k !== KIT_ID) throw new LinkError("kit_changed", "This link was made with a different version of Genii's cards. Ask for a fresh link.");
  if (typeof b.i !== "string" || !/^[a-z0-9]{8,16}$/.test(b.i)) throw bad();
  if (!REL_IDS.includes(b.r)) throw bad();
  let name;
  try { name = cleanName(b.n); } catch { throw bad(); }
  if (typeof b.n !== "string" || name !== b.n) throw bad();
  if (!["she", "he", "they"].includes(b.p)) throw bad();
  if (!Number.isInteger(b.e) || b.e < 0 || b.e >= FRIEND_EMOJI.length) throw bad();
  if (!Number.isInteger(b.s) || b.s < 0 || b.s > 0xffffffff) throw bad();
  if (!Number.isInteger(b.w) || b.w < 0 || b.w >= (FRIEND.invites[b.r] || []).length) throw bad();
  if (!Array.isArray(b.o) || b.o.length !== 4 || !b.o.every((x) => x === 0 || x === 1)) throw bad();
  const [love, mk, stings, showType] = b.o.map(Boolean);
  const offered = toggleOptions(b.r, { age: "adult" });
  if ((love && !offered.love) || (mk && !offered.mk) || (stings && !offered.stings)) throw bad();
  if (!Array.isArray(b.a) || b.a.length !== 6) throw bad();
  const questions = FRIEND.level1.questions[relOf(b.r).level1Set];
  const level1 = b.a.map((row, i) => {
    if (!Array.isArray(row) || row.length !== 2 || ![1, -1].includes(row[0]) || ![0, 1, 2].includes(row[1])) throw bad();
    return { axis: questions[i].axis, truth: row[0], why: [null, "flex", "unfinished"][row[1]] };
  });
  if (!Array.isArray(b.b) || b.b.length > 12 || (b.b.length > 0 && b.b.length < 6)) throw bad();
  const seen = new Set();
  const level2 = b.b.map((row) => {
    if (!Array.isArray(row) || row.length !== 2 || !["a", "b"].includes(row[1])) throw bad();
    const card = S.cardById[row[0]];
    if (!card || !card.friend || card.privacy !== "normal" || seen.has(row[0]) || !relOf(b.r).cardLevels.includes(L2_LEVEL(row[0]))) throw bad();
    seen.add(row[0]);
    return { id: row[0], answer: row[1] };
  });
  const level3 = checkL3(b.c ?? null, allowedPairs(b.r, love, mk));
  const wantL4 = b.r === "bestie" && stings;
  if (wantL4 !== (b.d !== undefined && b.d !== null)) throw bad();
  const level4 = wantL4 ? checkL4(b.d, allowedPairs(b.r, love, mk), love) : null;
  if (mk !== (b.cu !== undefined)) throw bad();
  if ((mk && wantL4) !== (b.du !== undefined && b.du !== null)) throw bad();
  const level3u = mk ? checkL3(b.cu, allowedPairs(b.r, love, false)) : null;
  const level4u = mk && wantL4 ? checkL4(b.du, allowedPairs(b.r, love, false), love) : null;
  for (const l3 of [level3, level3u]) if (l3) for (const id of l3.cards) if (TAG[id].locked18 && !(mk && l3 === level3)) throw bad();
  return { id: b.i, rel: b.r, name, pronoun: b.p, emoji: b.e, seed: b.s, invite: b.w, love, mk, stings, showType, level1, level2, level3, level4, level3u, level4u };
}

// The friend's playable deck, in the same shape score-core scoreFriendGame reads. Option order is shuffled per link.
export function friendDeckView(ch, { under18 = false } = {}) {
  const who = { pronoun: ch.pronoun, name: ch.name };
  const fill = (t) => fillOwner(t, who);
  const r = S.rng((ch.seed ^ 0x6e11) >>> 0);
  const rel = relOf(ch.rel);
  const bestie = ch.rel === "bestie";
  const questions = FRIEND.level1.questions[rel.level1Set];
  const level1 = ch.level1.map((t, i) => {
    const q = questions[i];
    return { axis: q.axis, prompt: fill(q.prompt), options: S.shuffle(q.options, r).map((o) => ({ pole: o.pole, label: o.label, t: fill(o.t) })), truth: t.truth, acceptEither: t.why !== null, why: t.why };
  });
  const level2 = ch.level2.length
    ? { skipped: false, cards: ch.level2.map(({ id, answer }) => { const c = S.cardById[id]; return { id, prompt: fill(c.friend.prompt), a: fill(c.friend.a.t), b: fill(c.friend.b.t), order: r() < 0.5 ? ["a", "b"] : ["b", "a"], answer, weight: c.weight }; }) }
    : { skipped: true, line: fill(FRIEND.level2.skippedLine.t), cards: [] };
  const l3 = under18 && ch.mk ? ch.level3u : ch.level3;
  const level3 = l3
    ? {
      skipped: false, N: l3.N, pick: l3.N,
      prompt: fill(FRIEND.level3.prompt[bestie ? "bestie" : "friend"].t.replace("{N}", l3.N)),
      fewTagsLine: l3.N <= 2 ? fill(FRIEND.level3.fewTagsLine.t.replace("{N}", l3.N)) : null,
      cards: l3.cards.map((id) => ({ id, role: l3.truth.includes(id) ? "true" : l3.truth.some((t) => TAG[t].pair === id) ? "opposite" : "decoy", name: TAG[id].name, heart: TAG[id].heart })),
    }
    : { skipped: true, line: fill(FRIEND.level3.skippedLine.t), cards: [] };
  const l4 = under18 && ch.mk ? ch.level4u : ch.level4;
  const level4 = l4
    ? {
      enabled: true,
      stingPick: l4.lines.length ? { prompt: fill(FRIEND.level4.stingPick.prompt.t), lines: l4.lines.map((tag) => ({ tag, t: TAG[tag].sting, true: tag === l4.truth })) } : null,
      pickTheRoast: { prompt: fill(FRIEND.level4.pickTheRoast.prompt.t), lines: l4.roasts.map((id) => ({ id, tag: ROAST[id].tag, t: ROAST[id].t })) },
    }
    : null;
  const truthType = S.typeOf(Object.fromEntries(level1.map((q) => [q.axis, { pole: q.truth }])));
  return { relationship: ch.rel, owner: { type: truthType.name, code: truthType.code, pronoun: ch.pronoun }, level1, level2, level3, level4 };
}

export function friendIntro(ch) {
  const who = { pronoun: ch.pronoun, name: ch.name };
  const set = FRIEND.preGame.useFor[ch.rel] || "friend";
  return {
    title: fillOwner(FRIEND.results.friend.title.t, who),
    preGame: fillOwner(FRIEND.preGame[set].t, who),
    cta: FRIEND.preGame.cta,
    needsAgeBand: ch.mk,
  };
}

// A guess set, cleaned against the deck the friend actually played. Unknown ids are dropped.
export function cleanGuesses(view, raw) {
  const g = isObj(raw) ? raw : {};
  const level1 = {};
  for (const q of view.level1) if (g.level1 && (g.level1[q.axis] === 1 || g.level1[q.axis] === -1)) level1[q.axis] = g.level1[q.axis];
  const level2 = {};
  const why = {};
  for (const c of view.level2.cards) {
    if (g.level2 && (g.level2[c.id] === "a" || g.level2[c.id] === "b")) level2[c.id] = g.level2[c.id];
    if (g.why && CHIP_IDS.has(g.why[c.id])) why[c.id] = g.why[c.id];
  }
  const ids = new Set(view.level3.cards.map((c) => c.id));
  const level3 = Array.isArray(g.level3) ? [...new Set(g.level3.filter((id) => ids.has(id)))].slice(0, view.level3.N || 0) : [];
  let level4 = null;
  if (view.level4) {
    const lines = view.level4.stingPick ? view.level4.stingPick.lines.map((l) => l.tag) : [];
    const roasts = view.level4.pickTheRoast.lines.map((l) => l.id);
    const src = isObj(g.level4) ? g.level4 : {};
    level4 = { sting: lines.includes(src.sting) ? src.sting : null, roast: roasts.includes(src.roast) ? src.roast : null };
  }
  return { level1, level2, why, level3, level4 };
}

export function guessesComplete(view, g) {
  return view.level1.every((q) => g.level1[q.axis] !== undefined) &&
    view.level2.cards.every((c) => g.level2[c.id] !== undefined) &&
    (view.level3.skipped || g.level3.length === view.level3.N) &&
    (!view.level4 || !view.level4.stingPick || g.level4.sting !== null);
}

// What the friend sees: counts only, never which ones, never Level 4, and the owner's type only if allowed.
export function friendSafeResult(ch, view, guesses) {
  const score = S.scoreFriendGame(view, guesses);
  const who = { pronoun: ch.pronoun, name: ch.name };
  const set = ch.rel === "bestie" ? "bestie" : "friend";
  const F = FRIEND.results.friend;
  return {
    x: score.level1.x,
    guessedType: score.level1.guessedType ? score.level1.guessedType.name : null,
    y: score.level2.y, total: score.level2.total, z: score.level3.z, N: score.level3.N,
    scoreLine: fillVars(fillOwner(F.score[set].t, who), { x: score.level1.x }),
    countsLine: fillVars(F.counts.t, { y: score.level2.y, total: score.level2.total, z: score.level3.z, N: score.level3.N }),
    typeLine: ch.showType ? fillVars(fillOwner(F.typeReveal.t, who), { trueType: view.owner.type }) : null,
    yourTurn: fillOwner(F.yourTurn[set].t, who),
  };
}

// ---------------------------------------------------------------- reply: friend to owner
export function replyPayload(ch, view, guesses, { under18 = false } = {}) {
  const g = cleanGuesses(view, guesses);
  return encodePayload({
    v: 1, k: KIT_ID, i: ch.id, u: under18 && ch.mk ? 1 : 0,
    a: view.level1.map((q) => g.level1[q.axis] ?? 0),
    b: view.level2.cards.filter((c) => g.level2[c.id]).map((c) => [c.id, g.level2[c.id], g.why[c.id] || ""]),
    c: g.level3,
    d: g.level4 ? [g.level4.sting || "", g.level4.roast || ""] : null,
  });
}

export function parseReply(raw) {
  const b = decodePayload(raw);
  if (Object.keys(b).some((k) => !["v", "k", "i", "u", "a", "b", "c", "d"].includes(k))) throw bad();
  if (b.v !== 1) throw new LinkError("version", "This reply was made with a different version of Genii.");
  if (b.k !== KIT_ID) throw new LinkError("kit_changed", "This reply was made with a different version of Genii's cards.");
  if (typeof b.i !== "string" || !/^[a-z0-9]{8,16}$/.test(b.i)) throw bad();
  if (b.u !== 0 && b.u !== 1) throw bad();
  if (!Array.isArray(b.a) || b.a.length !== 6 || !b.a.every((x) => x === 1 || x === -1)) throw bad();
  if (!Array.isArray(b.b) || b.b.length > 12) throw bad();
  const level2 = {};
  const why = {};
  for (const row of b.b) {
    if (!Array.isArray(row) || row.length !== 3 || typeof row[0] !== "string" || !S.cardById[row[0]] || !["a", "b"].includes(row[1]) || (row[2] !== "" && !CHIP_IDS.has(row[2])) || level2[row[0]]) throw bad();
    level2[row[0]] = row[1];
    if (row[2]) why[row[0]] = row[2];
  }
  if (!Array.isArray(b.c) || b.c.length > 5 || new Set(b.c).size !== b.c.length || !b.c.every((id) => typeof id === "string" && TAG[id])) throw bad();
  let level4 = null;
  if (b.d !== null) {
    if (!Array.isArray(b.d) || b.d.length !== 2) throw bad();
    const [sting, roast] = b.d;
    if ((sting !== "" && !TAG[sting]) || (roast !== "" && !ROAST[roast])) throw bad();
    level4 = { sting: sting || null, roast: roast || null };
  }
  const level1 = Object.fromEntries(AXES.map((ax, i) => [ax, b.a[i]]));
  return { challengeId: b.i, under18: b.u === 1, guesses: { level1, level2, why, level3: b.c, level4 } };
}

// Owner: add a friend's reply. It must answer a challenge saved in this browser and match that challenge's deck.
export function importReply(state, raw, { now = new Date().toISOString() } = {}) {
  const reply = parseReply(raw);
  const ch = state.challenges.find((c) => c.id === reply.challengeId);
  if (!ch) throw new LinkError("unknown_challenge", "This reply answers a challenge that isn't saved in this browser. Open it where you took the quiz.");
  const deck = challengeDeck(state, ch, { under18: reply.under18 && ch.mk });
  checkAgainstDeck(deck, reply.guesses);
  const entry = { challengeId: ch.id, receivedAt: now, under18: reply.under18 && ch.mk, guesses: reply.guesses, hideRoast: false };
  return { state: { ...state, friendResults: [...state.friendResults.filter((r) => r.challengeId !== ch.id), entry], updatedAt: now }, challengeId: ch.id };
}

function checkAgainstDeck(deck, g) {
  const l2 = new Set(deck.level2.skipped ? [] : deck.level2.cards.map((c) => c.id));
  if (Object.keys(g.level2).some((id) => !l2.has(id)) || Object.keys(g.why).some((id) => !l2.has(id))) throw bad("This reply doesn't match the challenge it answers.");
  const l3 = new Set(deck.level3.skipped ? [] : deck.level3.cards.map((c) => c.id));
  if (g.level3.some((id) => !l3.has(id)) || g.level3.length > (deck.level3.N || 0)) throw bad("This reply doesn't match the challenge it answers.");
  if (g.level4) {
    if (!deck.level4 || !deck.level4.enabled) throw bad("This reply doesn't match the challenge it answers.");
    const lines = deck.level4.stingPick ? deck.level4.stingPick.lines.map((l) => l.tag) : [];
    const roasts = deck.level4.pickTheRoast.lines.map((l) => l.id);
    if ((g.level4.sting && !lines.includes(g.level4.sting)) || (g.level4.roast && !roasts.includes(g.level4.roast))) throw bad("This reply doesn't match the challenge it answers.");
  }
}

export function setRoastHidden(state, challengeId, hidden) {
  return { ...state, friendResults: state.friendResults.map((r) => (r.challengeId === challengeId ? { ...r, hideRoast: !!hidden } : r)) };
}

// Checks saved challenges and replies when a run is restored.
export function validateFriendData(state) {
  const ids = new Set();
  for (const ch of state.challenges) {
    const keys = ["id", "rel", "love", "mk", "stings", "showType", "emoji", "invite", "name", "seed", "createdAt", "sentBefore"];
    if (!isObj(ch) || Object.keys(ch).some((k) => !keys.includes(k)) || typeof ch.id !== "string" || !/^[a-z0-9]{8,16}$/.test(ch.id) || ids.has(ch.id)) throw new PersonaError("corrupt", "Bad saved challenge.");
    const norm = normalizeChallenge(ch, state.setup);
    if (["rel", "love", "mk", "stings", "showType", "emoji", "invite", "name"].some((k) => norm[k] !== ch[k]) || !Number.isInteger(ch.seed) || ch.seed < 0 || ch.seed > 0xffffffff) throw new PersonaError("corrupt", "Bad saved challenge.");
    ids.add(ch.id);
  }
  if (state.challenges.length && !(state.frozen && Object.keys(state.finale).length === S.kit.finale.length)) throw new PersonaError("corrupt", "Challenges without a finished run.");
  for (const r of state.friendResults) {
    if (!isObj(r) || !ids.has(r.challengeId) || typeof r.under18 !== "boolean" || typeof r.hideRoast !== "boolean") throw new PersonaError("corrupt", "Bad saved reply.");
    const ch = state.challenges.find((c) => c.id === r.challengeId);
    checkAgainstDeck(challengeDeck(state, ch, { under18: r.under18 && ch.mk }), r.guesses);
  }
  if (state.returnTo !== null) {
    if (!isObj(state.returnTo) || !REL_IDS.includes(state.returnTo.rel) || cleanName(state.returnTo.name) !== state.returnTo.name) throw new PersonaError("corrupt", "Bad saved return link.");
  }
  return state;
}

// ---------------------------------------------------------------- owner view of one friend's reply
// Friend-side option texts shown back to the owner. Pronouns are already filled; an unset name reads as "you".
function ownerText(text, ch) {
  if (ch.name) return text.replaceAll("{name}", ch.name);
  return text.replace(/\{name\}'s/g, "your").replace(/\{name\}/g, "you");
}

export function ownerFriendView(state, challengeId) {
  const ch = state.challenges.find((c) => c.id === challengeId);
  const entry = state.friendResults.find((r) => r.challengeId === challengeId);
  if (!ch || !entry) return null;
  const deck = challengeDeck(state, ch, { under18: entry.under18 && ch.mk });
  const score = S.scoreFriendGame(deck, entry.guesses, scorerAnswers(state));
  const { profile } = resultFor(state);
  const O = FRIEND.results.owner;
  const friend = friendLabel(ch.rel, ch.emoji);
  const trueType = profile.type.name;
  const v = { friend, trueType, guessedType: score.level1.guessedType ? score.level1.guessedType.name : "" };
  const axisMeta = Object.fromEntries(LIB.axes.map((a) => [a.id, a]));
  const flexAxes = score.level1.rows.filter((r) => r.acceptEither);
  const getYou = [
    ...score.level1.rows.filter((r) => r.hit).map((r) => { const a = axisMeta[r.axis]; return fillVars(O.zones.getYou.axisItem, { poleName: r.truth > 0 ? a.plus : a.minus, poleLine: r.truth > 0 ? a.plusLine : a.minusLine }); }),
    ...score.level3.getYou.map((id) => fillVars(O.zones.getYou.tagItem, { tagName: TAG[id].name, heart: TAG[id].heart })),
  ];
  let biggest = null;
  if (score.level2.biggestMiss) {
    const m = score.level2.biggestMiss;
    const card = deck.level2.cards.find((c) => c.id === m.id);
    const chip = WHY_CHIPS.find((c) => c.id === m.why);
    biggest = {
      line: fillVars(O.biggestMiss.t, { friend, guessedText: ownerText(card[m.guess], ch), trueText: ownerText(card[m.answer], ch) }),
      reason: chip ? fillVars(O.biggestMiss.reason, { whyChip: fillOwner(chip.t, { pronoun: "they", name: "" }).replace(/\bthem\b/, "you").replace(/^They\b/, "You") }) : null,
    };
  }
  let level4 = null;
  if (score.level4) {
    const L = FRIEND.level4.results;
    const s = score.level4.sting;
    const roast = score.level4.roast;
    let roastLine = null;
    if (roast) {
      const tag = TAG[roast.tag];
      roastLine = roast.ownersTag === true ? fillVars(L.roastOnTrueTag, { tagName: q(tag.name) })
        : roast.ownersTag === "opposite" ? fillVars(L.roastOnOpposite, { friend, trueTagName: q(TAG[tag.pair].name) })
          : fillVars(L.roastOther, { friend });
    }
    level4 = {
      sting: s ? (s.hit ? fillVars(L.stingHit.t, { friend }) : fillVars(L.stingMiss.t, { friend, pickedLine: s.picked ? TAG[s.picked].sting : "nothing", trueLine: TAG[s.truth].sting })) : null,
      roastHeader: fillVars(L.roastHeader, { friend }),
      roast: roast ? { text: FRIEND.level4.pickTheRoast.roasts.find((x) => x.id === roast.id).t, line: roastLine } : null,
      roastSkipped: roast ? null : fillVars(L.roastSkipped, { friend }),
      hidden: entry.hideRoast,
      hideLabel: L.hide,
    };
  }
  return {
    challengeId, friend, rel: ch.rel, receivedAt: entry.receivedAt,
    title: fillVars(O.title.t, v),
    comparison: score.level1.exact ? fillVars(O.typeComparison.exact.t, v) : fillVars(O.typeComparison.t, { ...v, x: score.level1.x }),
    flexNotes: flexAxes.map((r) => fillVars(O.typeComparison.flexNote, { axisName: `${axisMeta[r.axis].plus} or ${axisMeta[r.axis].minus}` })),
    band: fillVars(O.scoreBands[score.bandSet][score.band].t, v),
    x: score.level1.x,
    zones: {
      getYou: { title: O.zones.getYou.title, sub: fillVars(O.zones.getYou.sub, v), items: getYou, empty: O.zones.getYou.empty },
      dontSee: { title: O.zones.dontSee.title, sub: fillVars(O.zones.dontSee.sub, v), items: score.level3.dontSee.map((id) => fillVars(O.zones.dontSee.tagItem, { tagName: TAG[id].name, sting: TAG[id].sting })), empty: fillVars(O.zones.dontSee.empty, v) },
      thinkYouAre: { title: O.zones.thinkYouAre.title, items: score.level3.thinkYouAre.map((x) => fillVars(O.zones.thinkYouAre.item.t, { friend, oppositeTagName: q(TAG[x.picked].name), trueTagName: q(TAG[x.actual].name) })), empty: fillVars(O.zones.thinkYouAre.empty, v) },
      otherGuesses: { title: O.zones.otherGuesses.title, items: score.level3.otherGuesses.map((id) => fillVars(O.zones.otherGuesses.item, { friend, decoyTagName: q(TAG[id].name) })) },
    },
    level2Line: score.level2.skipped ? null : fillVars(O.level2Score.t, { friend, y: score.level2.y, total: score.level2.total }),
    level3Line: score.level3.skipped ? null : fillVars(O.level3Score.t, { friend, z: score.level3.z, N: score.level3.N }),
    biggestMiss: score.level2.skipped ? null : biggest ? { title: O.biggestMiss.title, ...biggest } : { title: O.biggestMiss.title, line: fillVars(O.biggestMiss.none, v), reason: null },
    level4,
    score,
  };
}

// Owner only: every played link, best reader first (friend.json ranking).
export function ranking(state) {
  const rows = state.friendResults.map((entry) => {
    const ch = state.challenges.find((c) => c.id === entry.challengeId);
    const deck = challengeDeck(state, ch, { under18: entry.under18 && ch.mk });
    return { key: ch.id, friend: friendLabel(ch.rel, ch.emoji), playedAt: entry.receivedAt, score: S.scoreFriendGame(deck, entry.guesses) };
  });
  const R = FRIEND.ranking;
  const ranked = S.rankFriends(rows);
  return {
    title: R.title.t, sub: R.sub, unlocked: ranked.length >= 2, locked: R.locked, topBadge: R.topBadge.t,
    rows: ranked.map((row, i) => ({ key: row.key, line: fillVars(R.row, { rank: i + 1, friend: row.friend, x: row.score.level1.x, z: row.score.level3.z, N: row.score.level3.N }) })),
  };
}
