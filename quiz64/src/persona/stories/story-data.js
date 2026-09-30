// The final screen as Stories (LAUNCH-SPEC sections 21 to 23). A pure projection: result + profile + sealed check +
// library in, twelve screens out. Nothing here quotes an answer, shows an id, a number or a score on a main screen, or
// uses the words the spec keeps off the page (the guess screen is the one place a count is allowed). Every line shown
// is picked from the player's own evidence: the halves and the six leans from the profile's poles, the findings and
// the rooms from the strength of the evidence behind them, the traits from the shown tags, the insight from a real
// believe-versus-did split, the calls from the guesses Genii locked before the final cards. Library fields are read
// defensively so the screen works on the 2026-09-26 library (desc, heart) and on the Build C library.

import { endOf, statOf, statRow } from "../stats.js";

export const VOICES = Object.freeze(["fun", "heart", "cards"]);
export const STORY_IDS = Object.freeze(["intro", "names", "read", "map", "knows", "rooms", "insight", "traits", "stings", "calls", "share", "app"]);

// Placeholder until the public app link is decided (FACT-SHEET pending item 2). Swap here only.
export const APP_LINK = "#get-mirrormii";
// The address printed at the foot of the share image. Placeholder until the game link is decided (the brand site
// for now). No digits: the share image carries no numbers.
export const SHARE_URL_LABEL = "mirrormii.ai";

// How each screen is lit (DESIGN-DIRECTION 5.12, round 2): night for the reveal, the map and the stings, the player's
// light (Day or Dusk) for the read, the rooms, the traits and the card, the deep gradient for the findings, the
// insight, the calls and the app. Light and dark alternate so every tap changes the room.
export const LOOKS = Object.freeze({ intro: "night", names: "night", read: "light", map: "night", knows: "deep", rooms: "light", insight: "deep", traits: "light", stings: "night", calls: "deep", share: "light", app: "deep" });

// Interface strings for the result (proposed copy, DESIGN-DIRECTION section 8 D6; shipped under the 2026-09-29 go).
export const UI_COPY = Object.freeze({
  hold: "Hold, or tap",
  mapList: "Read it as a list",
  mapGem: "Show the pairs",
  mapOver: "over",
  mapBetween: "Right between",
  mapOpen: "still open",
  shareFormats: { story: "Story", post: "Post" },
  shareImage: "Share image",
  saveImage: "Save image",
  saveForMe: "Save for me",
  copyLink: "Copy link",
  copied: "Copied",
  shareSheet: "Share this screen",
  stingsSheet: "Just for you",
  stingsNote: "This screen never goes on a share card. You can keep a copy for yourself.",
  privateTrait: "Only on your screen",
  opposite: (a, b) => `Your opposite: ${a} and ${b}. Know one?`,
  yourData: "Your data",
  dataTitle: "Your data",
  saving: "Making your image",
  saveFailed: "The image couldn't be made in this browser.",
  tap: "Next",
});

// The lobby's "How should Genii talk to you?" tap. Old runs carry no voice; they read as Make it fun.
export function voiceOf(lobby) {
  const v = lobby && typeof lobby === "object" ? lobby.voice : null;
  return VOICES.includes(v) ? v : "fun";
}
// "Just the cards" uses Make it fun wording (section 22).
export const wordingFor = (voice) => (voice === "heart" ? "heart" : "fun");

export const STORY_COPY = Object.freeze({
  fun: {
    intro: { kicker: "Genii's read", title: "40 answers in. Here's you.", sub: "Hold. Then let go." },
    names: { kicker: "You are", people: "With your people", life: "With your life", sub: "Two sides. Both you." },
    read: { kicker: "The read" },
    map: { kicker: "Your map", title: "Where you land", sub: "Six stats, set by your answers.", people: "With your people", life: "With your life" },
    knows: {
      kicker: "What Genii knows best",
      title: "The clearest parts of you",
      tiers: { clear: "Strong signal", sharp: "Clear signal", forming: "Some signal", flex: "Both sides" },
      short: { clear: "Strong", sharp: "Clear", forming: "Some", flex: "Both" },
      surest: "Surest",
      both: "Both",
    },
    rooms: { kicker: "Room by room", title: "Same you, different rooms", differs: "Your other side" },
    traits: { kicker: "Your top traits", title: "What makes you, you" },
    insight: { kicker: "The thing you didn't know" },
    stings: { kicker: "Only you", title: "The part that stings", badge: "Only you see this" },
    calls: {
      kicker: "Genii's calls",
      intro: "Before your last cards, Genii locked in a guess for each one.",
      titles: { most: "Genii saw most of you coming.", half: "Genii read you more often than not.", even: "Half called. Half surprised Genii.", some: "You kept Genii guessing.", none: "Genii held back on every guess this time." },
      of: "called exactly",
      status: { hit: "Called it", near: "Same side", miss: "Surprised Genii", pass: "Genii passed", skipped: "Skipped", unanswered: "Skipped" },
      key: "Called it: your exact answer. Same side: the right lean, another move. Surprised: Genii missed.",
      more: "See the cards",
    },
    share: { kicker: "Your card", brand: "Genii · MirrorMii", sub: "They guess your answers. You see who really knows you.", challenge: "Challenge a friend" },
    app: {
      kicker: "Get MirrorMii",
      title: "Your real day powers the game.",
      body: "Snap a moment of your day and Miia, your digital twin, lives it. Genii is waiting on the island.",
      button: "Get MirrorMii",
      store: "On the App Store",
      note: "Free to join.",
      snap: "You snap lunch",
      lives: "Miia lives it",
    },
    noTraits: {
      rushed: "You played this one fast. Traits land when you take your time, so a slower run brings them out.",
      thin: "You kept a lot of cards to yourself, so Genii kept its traits to itself too.",
    },
  },
  heart: {
    intro: { kicker: "Genii's read", title: "40 answers in. Here's you.", sub: "Take your time with this one." },
    names: { kicker: "You are", people: "With your people", life: "With your life", sub: "Two sides of you, both worth knowing." },
    read: { kicker: "The read" },
    map: { kicker: "Your map", title: "Where you land", sub: "Six stats, set by your answers.", people: "With your people", life: "With your life" },
    knows: {
      kicker: "What Genii knows best",
      title: "What came through clearest",
      tiers: { clear: "Strong signal", sharp: "Clear signal", forming: "Some signal", flex: "Both sides" },
      short: { clear: "Strong", sharp: "Clear", forming: "Some", flex: "Both" },
      surest: "Clearest",
      both: "Both",
    },
    rooms: { kicker: "Room by room", title: "How you show up, room by room", differs: "A different side" },
    traits: { kicker: "Your top traits", title: "What makes you, you" },
    insight: { kicker: "The thing you didn't know" },
    stings: { kicker: "Only you", title: "The tender part", badge: "Only you see this" },
    calls: {
      kicker: "Genii's calls",
      intro: "Before your last cards, Genii quietly locked in a guess for each one.",
      titles: { most: "Genii understood you well.", half: "Genii understood you more often than not.", even: "Genii understood half of you. The other half surprised it.", some: "You surprised Genii, and that's good to know.", none: "Genii held back on every guess this time." },
      of: "called exactly",
      status: { hit: "Called it", near: "Same side", miss: "A surprise", pass: "Genii passed", skipped: "Skipped", unanswered: "Skipped" },
      key: "Called it: your exact answer. Same side: the right lean, another move. A surprise: Genii missed.",
      more: "See the cards",
    },
    share: { kicker: "Your card", brand: "Genii · MirrorMii", sub: "They guess your answers. Send it to someone who'd get them right.", challenge: "Challenge a friend" },
    app: {
      kicker: "Get MirrorMii",
      title: "Your real day, turned into a cozy game.",
      body: "Snap small moments of your day and Miia, your digital twin, lives them. Genii is waiting on the island.",
      button: "Get MirrorMii",
      store: "On the App Store",
      note: "Free to join.",
      snap: "You snap lunch",
      lives: "Miia lives it",
    },
    noTraits: {
      rushed: "You moved quickly through this one. Traits show up when you linger, so a slower run lets them come through.",
      thin: "You kept a lot of cards to yourself, and that's fine. Genii keeps its traits for the answers you share.",
    },
  },
});

export const GUESS_COPY = Object.freeze({
  button: "How Genii read you",
  title: "How Genii read you",
  intro: "Before your last eight cards, Genii wrote down a guess for each one.",
  none: "Genii held back on every guess this time.",
  status: { hit: "Called it", miss: "Missed", pass: "Passed", skipped: "Skipped", unanswered: "Skipped" },
});

const str = (v) => (typeof v === "string" && v.trim() ? v : null);
function pickVal(v, wording) {
  if (str(v)) return v;
  if (v && typeof v === "object") return wording === "heart" ? str(v.h) || str(v.heart) || str(v.fun) || str(v.t) : str(v.fun) || str(v.t) || str(v.text);
  return null;
}

// One library line in the chosen voice. Fields are tried in order; for each, Heart to heart reads entry.h[field]
// before entry[field]. A field may also be a { fun, heart } or { t, h } pair.
export function voiced(entry, fields, wording) {
  if (!entry || typeof entry !== "object") return null;
  for (const f of Array.isArray(fields) ? fields : [fields]) {
    if (wording === "heart" && entry.h && typeof entry.h === "object") {
      const hv = pickVal(entry.h[f], "heart");
      if (hv) return hv;
    }
    const v = pickVal(entry[f], wording);
    if (v) return v;
  }
  return null;
}

// Where the dot sits between the two pole words, in percent from the minus word. Decided sides stay on their side,
// flex sits near the middle, unfinished sits dead center.
export function dotPosition(row) {
  if (row.unfinished) return 50;
  const norm = typeof row.norm === "number" && Number.isFinite(row.norm) ? Math.max(-1, Math.min(1, row.norm)) : row.sign * 0.5;
  let pos = 50 + norm * 42;
  if (row.flex) pos = Math.max(43, Math.min(57, pos));
  else if (row.sign > 0) pos = Math.max(62, pos);
  else pos = Math.min(38, pos);
  return Math.round(Math.max(8, Math.min(92, pos)));
}

// A type code for the sigil art, with spaces instead of the middle dot: the dotted code is an internal id and never
// reaches the page, even in an attribute.
export function sigilCode(code) {
  return String(code || "").split(/[·|.\s/]+/).filter(Boolean).join(" ");
}

const POLE_OPPOSITE = { We: "Me", Me: "We", Direct: "Soft", Soft: "Direct", Classic: "Own", Own: "Classic", Steady: "Venture", Venture: "Steady", Push: "Easy", Easy: "Push", Rules: "Context", Context: "Rules" };
// The pairing hook (DESIGN-DIRECTION section 8 D3): every pole flipped, named from the library. Null when either half
// has no clean opposite.
export function oppositeOf(lib, relCode, lifeCode) {
  const flip = (code) => String(code || "").split("·").map((p) => POLE_OPPOSITE[p] || null);
  const find = (list, code) => {
    const poles = flip(code);
    if (!poles.length || poles.some((p) => !p)) return null;
    const hit = (list || []).find((x) => x.code === poles.join("·"));
    return hit && str(hit.name) ? hit.name : null;
  };
  const a = find(lib && lib.relationship, relCode);
  const b = find(lib && lib.life, lifeCode);
  return a && b ? [a, b] : null;
}

// The insight flip (story 6): the first sentence is the belief, the rest answers it. One sentence: no split.
export function splitInsight(line) {
  const text = String(line || "").trim();
  const m = /^(.+?[.!?])\s+(\S.*)$/.exec(text);
  if (!m) return { belief: text, behavior: null };
  return { belief: m[1], behavior: m[2] };
}

// ---------------------------------------------------------------- evidence strength (no number ever reaches a screen)

const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
const round2 = (x) => Math.round(x * 100) / 100;
// How clearly one lean came through: how far it leans, discounted when few cards carried it. 0 to 1.
export function axisClarity(norm, cards = 4) {
  const n = typeof norm === "number" && Number.isFinite(norm) ? Math.min(1, Math.abs(norm)) : 0;
  return round2(n * (1 - Math.exp(-Math.max(0, cards) / 3)));
}
// How clearly one trait came through: net support against its pair, discounted when few cards carried it.
export function tagClarity(net, cards = 2) {
  const n = typeof net === "number" && Number.isFinite(net) ? Math.max(0, Math.min(1, net / 4.5)) : 0;
  return round2(n * (1 - Math.exp(-Math.max(0, cards) / 2.5)));
}
// The visual cue: three facets lit, two, or one. Flex has its own two-sided cue.
export function clarityLevel(clarity) {
  return clarity >= 0.5 ? 3 : clarity >= 0.3 ? 2 : 1;
}
const TIER_OF = { 3: "clear", 2: "sharp", 1: "forming" };

// The rooms a player walked through, each read from that room's own answers (LAUNCH-SPEC 23): for every chapter the
// lean with the clearest local evidence (two cards or more, leaning at least 0.3 of the way) that the library has a
// line for; with none, a trait from that chapter that fired or leaned but did not make the top traits. Love, work and
// home come first (the rooms the player opened), then friends, money, phone and play.
export const ROOM_ORDER = Object.freeze([3, 5, 6, 2, 4, 1, 7]);
export function roomsFor(profile, chapterOf, lib) {
  const out = [];
  if (!profile || typeof chapterOf !== "function" || !lib || !lib.rooms) return out;
  const axes = profile.axes || {};
  const tags = profile.tags || {};
  const shown = new Set(profile.shownTags || []);
  for (const ch of ROOM_ORDER) {
    const copy = lib.rooms[ch] || lib.rooms[String(ch)];
    if (!copy) continue;
    let best = null;
    for (const [ax, a] of Object.entries(axes)) {
      if (!copy[ax] || !a || !Array.isArray(a.evidence)) continue;
      const ev = a.evidence.filter((e) => e && e.w > 0 && chapterOf(e.card) === ch);
      const cards = new Set(ev.map((e) => e.card)).size;
      if (cards < 2) continue;
      const sum = ev.reduce((t, e) => t + e.w * e.v, 0);
      const max = ev.reduce((t, e) => t + Math.abs(e.w) * 2, 0);
      const norm = max ? sum / max : 0;
      if (Math.abs(norm) < 0.3) continue;
      const clarity = axisClarity(norm, cards);
      if (!best || clarity > best.clarity) {
        best = { chapter: ch, kind: "axis", axis: ax, sign: sign(sum), clarity, cards, differs: !a.flex && !a.unfinished && sign(sum) !== a.pole };
      }
    }
    if (!best) {
      const cand = Object.entries(tags)
        .filter(([id, t]) => t && t.chapter === ch && (t.fired || t.floorOk) && !shown.has(id))
        .sort((x, y) => y[1].net - x[1].net || x[0].localeCompare(y[0]))[0];
      if (cand) best = { chapter: ch, kind: "tag", tag: cand[0], clarity: tagClarity(cand[1].net, cand[1].cards), cards: cand[1].cards, differs: false };
    }
    if (best) out.push(best);
  }
  return out;
}

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

// Screen data for one finished run.
//   result: score-core buildResult output; profile: buildProfile output (axes, tags, splits, counts; may be partial)
//   sealed: checkSealed output or null; lib: library.json; voice: "fun" | "heart" | "cards"
//   promptFor(cardId): the sealed card's prompt in this voice, for the guess sheet
//   callFor(cardId): { topic, pole } for a locked guess: the card's situation in a few words, and the pole Genii
//     guessed on the card's main axis (plus or minus), or null
//   chapterOf(cardId): the chapter a scored card belongs to, for the rooms screen
//   mirror: { seed, filled: [{ chapter }] } for the reveal art (the run id and the answered cards in order), or null
export function buildStories({ result, profile = {}, sealed = null, lib, voice = "fun", promptFor = null, callFor = null, chapterOf = null, mirror = null }) {
  const wording = wordingFor(voice);
  const C = STORY_COPY[wording];
  const L = lib || {};
  const P = profile || {};
  const axisMeta = Object.fromEntries((L.axes || []).map((a) => [a.id, a]));
  const tagLib = Object.fromEntries((L.tags || []).map((t) => [t.id, t]));
  const halfOf = (side) => (result.halves || []).find((h) => h.side === side) || { side, name: "", desc: "", axes: [] };
  const libHalf = (h) => ((h.side === "relationship" ? L.relationship : L.life) || []).find((x) => x.code === h.code) || h;

  const relH = halfOf("relationship");
  const lifeH = halfOf("life");
  const relL = libHalf(relH);
  const lifeL = libHalf(lifeH);
  const half = (h, l, label) => ({
    label, name: str(l.name) || h.name, code: sigilCode(h.code),
    read: voiced(l, ["read", "desc"], wording) || h.desc || "",
    desc: voiced(l, ["desc"], wording) || h.desc || "",
  });
  const people = half(relH, relL, C.names.people);
  const life = half(lifeH, lifeL, C.names.life);

  // The six leans, people side then life side. The pole always comes from the profile (or, with no profile, from the
  // half's own row), so the map, the findings and the names can never disagree.
  const mapHalf = (h) => (h.axes || []).map((row) => {
    const meta = axisMeta[row.axis] || {};
    const p = (P.axes || {})[row.axis] || {};
    const s = typeof p.pole === "number" ? p.pole : row.pole === meta.minus ? -1 : 1;
    const r = { key: row.axis, left: meta.minus || "", right: meta.plus || "", sign: s, flex: Boolean(row.flex), unfinished: Boolean(row.unfinished), norm: p.norm };
    const strength = r.unfinished || r.flex ? 0 : Math.abs(typeof p.norm === "number" ? p.norm : 0.5);
    // The facet reads lean from minus (-1) to plus (+1); a decided side never sits closer to the middle than a flex one.
    const lean = r.unfinished || r.flex ? 0 : s * Math.max(0.3, Math.min(1, strength || 0.5));
    const clarity = r.unfinished ? 0 : r.flex ? 0.1 : axisClarity(typeof p.norm === "number" ? p.norm : 0.5, typeof p.cards === "number" ? p.cards : 4);
    const pos = dotPosition(r);
    const lead = s > 0 ? r.right : r.left;
    return {
      key: r.key, left: r.left, right: r.right, side: s > 0 ? "right" : "left", flex: r.flex, unfinished: r.unfinished, pos, strength, lean, clarity,
      lead, other: s > 0 ? r.left : r.right,
      // What the player sees: the game stat, its two ends (first pole on the left) and the end they lean to.
      ...statRow(r.key, { lead: r.flex || r.unfinished ? null : lead, pos }),
      line: voiced(meta, s > 0 ? "plusLine" : "minusLine", wording),
    };
  });
  const mapGroups = [
    { label: C.map.people, rows: mapHalf(relH) },
    { label: C.map.life, rows: mapHalf(lifeH) },
  ];
  const allRows = mapGroups.flatMap((g) => g.rows);
  const facet = allRows.map((r) => ({ key: r.key, lean: r.lean, flex: r.flex, unfinished: r.unfinished, plus: endOf(r.right), minus: endOf(r.left) }));

  // What Genii knows best: every lean that came through, clearest first. A decided lean says what it knows; a flex lean
  // says so honestly at the bottom; an unfinished one is left out.
  const knowsLine = (r) => {
    const meta = axisMeta[r.key] || {};
    if (r.flex) return voiced(meta, "flexKnow", wording) || voiced(L.flex, "line", wording);
    return voiced(meta, r.side === "right" ? "plusKnow" : "minusKnow", wording) || r.line;
  };
  const findings = allRows
    .map((r, i) => ({ r, i }))
    .filter(({ r }) => !r.unfinished && knowsLine(r))
    .sort((a, b) => (b.r.flex ? -1 : b.r.clarity) - (a.r.flex ? -1 : a.r.clarity) || a.i - b.i)
    .slice(0, 6)
    .map(({ r }) => {
      const level = r.flex ? 0 : clarityLevel(r.clarity);
      return {
        key: r.key, kind: r.flex ? "flex" : "axis", topic: str((axisMeta[r.key] || {}).topic) || `${r.right} or ${r.left}`,
        stat: statOf(r.key).stat, leadEnd: r.flex ? C.knows.both : r.leadEnd, otherEnd: r.flex ? `${r.a} and ${r.b}` : r.otherEnd,
        lead: r.flex ? C.knows.both : r.lead, other: r.flex ? `${r.left} and ${r.right}` : r.other,
        line: knowsLine(r), short: splitInsight(knowsLine(r)).belief, clarity: r.clarity, level, tier: r.flex ? C.knows.tiers.flex : C.knows.tiers[TIER_OF[level]],
        tierShort: r.flex ? C.knows.short.flex : C.knows.short[TIER_OF[level]],
      };
    });

  // Traits: up to 5 shown tags in the scorer's rank order, name plus one confident line.
  const tags = (result.tags || []).slice(0, 5).map((t) => {
    const lt = tagLib[t.id] || {};
    const pt = (P.tags || {})[t.id];
    const calls = Array.isArray(lt.calls) ? lt.calls.filter(str) : [];
    const clarity = pt ? tagClarity(pt.net, pt.cards) : t.strength === "strong" ? 0.7 : t.strength === "leaning" ? 0.25 : 0.4;
    return {
      key: t.id,
      chapter: lt.chapter ?? t.chapter ?? null,
      // Marriage and kids tags (library `locked18`) stay on the owner's screen and never go on anything shareable.
      private: Boolean(lt.locked18),
      name: str(lt.name) || t.name,
      line: voiced(lt, ["line"], wording) || calls[0] || voiced(lt, ["heart"], wording) || t.heart || "",
      heart: voiced(lt, ["heart"], wording) || t.heart || "",
      sting: voiced(lt, ["sting"], wording) || t.sting || null,
      strength: t.strength || "showing",
      clarity,
      level: clarityLevel(clarity),
    };
  });
  const calls = (result.calls || []).map((c) => (typeof c === "string" ? c : c && c.line)).filter(str);

  // The read: two tablets, one per half, the confident line over the longer description.
  const readLines = [people.read, life.read].filter(Boolean);
  const readBodies = [people.desc !== people.read ? people.desc : "", life.desc !== life.read ? life.desc : ""];
  const readMarks = [{ kind: "sigil", code: people.code }, { kind: "sigil", code: life.code }].slice(0, readLines.length);
  const used = new Set([...readLines, ...readBodies, ...findings.map((f) => f.line), ...tags.map((t) => t.line)]);

  // The rooms: one line per room the player played, from that room's own answers.
  const roomRows = roomsFor(P, chapterOf, L).map((rm) => {
    const copy = (L.rooms || {})[rm.chapter] || (L.rooms || {})[String(rm.chapter)] || {};
    const name = voiced(copy, "name", wording) || "";
    if (rm.kind === "axis") {
      const entry = copy[rm.axis];
      const line = voiced(entry, rm.sign > 0 ? "plus" : "minus", wording);
      const meta = axisMeta[rm.axis] || {};
      return line ? { key: `${rm.chapter}`, chapter: rm.chapter, room: name, line, lead: rm.sign > 0 ? meta.plus : meta.minus, leadEnd: endOf(rm.sign > 0 ? meta.plus : meta.minus), level: clarityLevel(rm.clarity), clarity: rm.clarity, differs: rm.differs, kind: "axis", axis: rm.axis, sign: rm.sign } : null;
    }
    const lt = tagLib[rm.tag] || {};
    if (lt.locked18) return null;
    const line = voiced(lt, ["line"], wording);
    return line && !used.has(line) ? { key: `${rm.chapter}`, chapter: rm.chapter, room: name, line, lead: str(lt.name) || "", level: clarityLevel(rm.clarity), clarity: rm.clarity, differs: false, kind: "tag", tag: rm.tag } : null;
  }).filter(Boolean).slice(0, 4);
  roomRows.forEach((r) => used.add(r.line));

  // The thing you didn't know: a real believe-versus-did split on an axis first, then the half fallback, then a call
  // nobody has seen yet.
  const split = (P.splits || []).find((s) => s && s.kind === "axis" && (!L.insights || L.insights[s.dim]));
  let insight = null;
  let insightFrom = null;
  if (split && L.insights && L.insights[split.dim]) {
    insight = voiced(L.insights[split.dim], split.believe > 0 ? "believePlus" : "believeMinus", wording);
    if (insight) insightFrom = { kind: "split", dim: split.dim, believe: sign(split.believe) };
  }
  if (!insight && L.insightFallback) {
    const fb = L.insightFallback;
    const keys = [`${relH.code} | ${lifeH.code}`, relH.code, lifeH.code];
    for (const k of keys) {
      const v = pickVal(fb[k], wording) || voiced(fb[k], ["line", "text"], wording);
      if (v) { insight = v; insightFrom = { kind: "fallback", code: k }; break; }
    }
  }
  if (!insight) {
    const pool = [...calls, ...(result.tags || []).slice(0, 5).flatMap((t) => (tagLib[t.id] && Array.isArray(tagLib[t.id].calls) ? tagLib[t.id].calls.filter(str) : []))];
    insight = pool.find((c) => !used.has(c)) || voiced(relL, "heart", wording) || "";
    insightFrom = { kind: "call" };
  }

  // Only you: both halves' stings, then the strongest trait's.
  const stings = [voiced(relL, "sting", wording), voiced(lifeL, "sting", wording)].map((s, i) => s || (result.stings || [])[i]).filter(Boolean);
  if (tags[0] && tags[0].sting && !stings.includes(tags[0].sting)) stings.push(tags[0].sting);

  const counts = P.counts || {};
  const noTraits = tags.length ? null : C.noTraits[(counts.rushed || 0) * 2 >= (counts.answered || 0) && counts.answered ? "rushed" : "thin"];

  // The one line inside the mirror on story 2 (the screenshot moment): Genii's clearest finding, a lean that holds for
  // anyone who knows the player. With no decided lean at all, the people half's read.
  const top = findings.find((f) => f.kind === "axis");
  const hook = (top && top.line) || people.read || life.read || "";

  const opposite = oppositeOf(L, relH.code, lifeH.code);
  const share = {
    brand: C.share.brand,
    names: [{ label: people.label, name: people.name, code: people.code }, { label: life.label, name: life.name, code: life.code }],
    // Marriage and kids tags (library `locked18`) never go on anything shareable.
    tags: tags.filter((t) => !t.private).map((t) => ({ name: t.name, heart: t.heart, chapter: t.chapter })),
    invite: str(result.share && result.share.invite) || "Do you really know me?",
    facet,
    mirror: mirror || null,
    url: SHARE_URL_LABEL,
  };

  // The locked guesses. Counts come straight from the check; a hit names the pole Genii guessed, nothing else.
  let guesses = null;
  if (sealed && Array.isArray(sealed.rows)) {
    const rows = sealed.rows.map((r, i) => {
      const info = (callFor && callFor(r.id)) || {};
      return {
        key: r.id || String(i),
        prompt: (promptFor && promptFor(r.id)) || "",
        topic: str(info.topic) || "",
        // The card's scene in a few words (derived at build time from the card's own scene, never its answers).
        title: str(info.title) || "",
        axis: str(info.axis) || null,
        pole: r.status === "hit" && str(info.pole) ? info.pole : null,
        status: r.status,
        // An honest partial: Genii missed the exact answer but had the side right. It never counts as a hit.
        near: r.status === "miss" && r.sideHit === true,
        label: GUESS_COPY.status[r.status] || GUESS_COPY.status.skipped,
      };
    });
    guesses = {
      called: typeof sealed.called === "number" ? sealed.called : sealed.rows.filter((r) => r.status === "hit" || r.status === "miss").length,
      exact: typeof sealed.exact === "number" ? sealed.exact : sealed.rows.filter((r) => r.status === "hit").length,
      rows,
    };
  }
  const ratio = guesses && guesses.called ? guesses.exact / guesses.called : 0;
  const callsTier = !guesses || !guesses.called ? "none" : ratio >= 0.75 ? "most" : ratio > 0.5 ? "half" : ratio === 0.5 ? "even" : "some";
  const callsTitle = C.calls.titles[callsTier];
  // Genii's face on the calls screen: pleased when it read you, curious at half, delighted to be surprised below that.
  const callsFace = { most: "happy", half: "happy", even: "curious", some: "alert", none: "thinking" }[callsTier];

  const slides = [
    { id: "intro", kicker: C.intro.kicker, title: C.intro.title, sub: C.intro.sub, mirror },
    { id: "names", kicker: C.names.kicker, sub: C.names.sub, hook, people, life, mirror },
    { id: "read", kicker: C.read.kicker, lines: readLines, bodies: readBodies, marks: readMarks },
    { id: "map", kicker: C.map.kicker, title: C.map.title, sub: C.map.sub, groups: mapGroups, facet },
    { id: "knows", kicker: C.knows.kicker, title: C.knows.title, surest: C.knows.surest, findings },
    roomRows.length >= 2 ? { id: "rooms", kicker: C.rooms.kicker, title: C.rooms.title, differs: C.rooms.differs, rows: roomRows } : null,
    { id: "insight", kicker: C.insight.kicker, line: insight, parts: splitInsight(insight), from: insightFrom },
    { id: "traits", kicker: C.traits.kicker, title: C.traits.title, tags, empty: noTraits },
    { id: "stings", kicker: C.stings.kicker, title: C.stings.title, badge: C.stings.badge, stings, private: true },
    guesses && guesses.rows.length ? {
      id: "calls", kicker: C.calls.kicker, title: callsTitle, intro: C.calls.intro, key: C.calls.key, of: C.calls.of, more: C.calls.more, exact: guesses.exact, called: guesses.called, face: callsFace,
      rows: guesses.rows.map((r) => ({ ...r, side: r.pole ? endOf(r.pole) : null, shown: (r.near ? C.calls.status.near : C.calls.status[r.status]) || C.calls.status.skipped })),
      count: NUMBER_WORDS[guesses.rows.length] || String(guesses.rows.length),
    } : null,
    { id: "share", kicker: C.share.kicker, sub: C.share.sub, challenge: C.share.challenge, share, opposite: opposite ? UI_COPY.opposite(opposite[0], opposite[1]) : null },
    { id: "app", kicker: C.app.kicker, title: C.app.title, body: C.app.body, button: C.app.button, store: C.app.store, note: C.app.note, snap: C.app.snap, lives: C.app.lives, link: APP_LINK, mirror },
  ].filter(Boolean).map((sl) => ({ ...sl, look: LOOKS[sl.id], tone: LOOKS[sl.id] }));

  return { voice, wording, slides, share, guesses };
}

// What a saved image of one screen draws (share-image.js lays it out). Only what the screen itself shows, minus
// anything private: marriage and kids traits never reach an image, and the stings image is saved, never shared.
export function printFor(slide) {
  const base = { id: slide.id, look: slide.look || LOOKS[slide.id] || "night", kicker: slide.kicker };
  switch (slide.id) {
    case "intro": return { ...base, title: slide.title, lines: [], mirror: slide.mirror };
    case "names": return { ...base, kicker: null, names: [slide.people, slide.life].map((h) => ({ label: h.label, name: h.name, code: h.code })), hook: slide.hook || null, lines: [slide.sub], mirror: slide.mirror };
    case "read": {
      const marks = slide.marks || [];
      const keep = slide.lines.map((line, i) => ({ line, body: (slide.bodies || [])[i] || "", mark: marks[i] || { kind: "none" } })).filter((x) => !(x.mark && x.mark.private));
      return { ...base, tablets: keep };
    }
    case "map": return { ...base, title: slide.title, groups: slide.groups.map((g) => ({ label: g.label, rows: g.rows.map((r) => ({ stat: r.stat, left: r.a, right: r.b, pos: r.at, side: r.leadSide === "a" ? "left" : "right", flex: r.flex, unfinished: r.unfinished })) })) };
    case "knows": return { ...base, title: slide.title, findings: slide.findings.map((f, i) => ({ topic: f.stat ? `${f.stat} · ${f.leadEnd}` : f.leadEnd, lead: f.leadEnd, other: f.otherEnd, kind: f.kind, line: i ? f.short || f.line : f.line, level: f.level, tier: f.tier })) };
    case "rooms": return { ...base, title: slide.title, rows: slide.rows.map((r) => ({ room: r.room, line: r.line, chapter: r.chapter, level: r.level })) };
    case "traits": {
      const items = slide.tags.filter((t) => !t.private).map((t) => ({ name: t.name, line: t.line, chapter: t.chapter }));
      return { ...base, title: slide.title, charms: items, lines: items.length ? [] : slide.empty ? [slide.empty] : [] };
    }
    case "insight": return { ...base, belief: slide.parts ? slide.parts.belief : slide.line, behavior: slide.parts ? slide.parts.behavior : null };
    case "stings": return { ...base, kicker: null, title: slide.title, badge: slide.badge, quotes: slide.stings, private: true };
    case "calls": return { ...base, title: slide.title, exact: slide.exact, called: slide.called, of: slide.of, panes: slide.rows.map((r) => ({ topic: r.title || r.topic, status: r.status, near: r.near, label: r.shown || r.label, side: r.side })) };
    case "share": return { ...base, card: slide.share };
    case "app": return { ...base, title: slide.title, lines: [slide.body, slide.note] };
    default: return base;
  }
}
