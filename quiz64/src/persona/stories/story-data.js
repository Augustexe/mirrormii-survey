// The final screen as Stories (LAUNCH-SPEC sections 21 and 22). A pure projection: result + profile + sealed check +
// library in, nine screens out. Nothing here quotes an answer, shows an id, a number or a score on a main screen, or
// uses the words the spec keeps off the page. Library fields are read defensively so the screen works on the
// 2026-09-26 library (desc, heart) and on the Build C library (read, line, h, insights, insightFallback).

export const VOICES = Object.freeze(["fun", "heart", "cards"]);
export const STORY_IDS = Object.freeze(["intro", "names", "read", "map", "traits", "insight", "stings", "share", "app"]);

// Placeholder until the public app link is decided (FACT-SHEET pending item 2). Swap here only.
export const APP_LINK = "#get-mirrormii";

// The lobby's "How should Genii talk to you?" tap. Old runs carry no voice; they read as Make it fun.
export function voiceOf(lobby) {
  const v = lobby && typeof lobby === "object" ? lobby.voice : null;
  return VOICES.includes(v) ? v : "fun";
}
// "Just the cards" uses Make it fun wording (section 22).
export const wordingFor = (voice) => (voice === "heart" ? "heart" : "fun");

export const STORY_COPY = Object.freeze({
  fun: {
    intro: { kicker: "Genii's read", title: "40 answers in. Here's you.", sub: "Tap to see it." },
    names: { kicker: "You are", people: "With your people", life: "With your life", sub: "Two sides. Both you." },
    read: { kicker: "The read" },
    map: { kicker: "Your map", title: "Where you land" },
    traits: { kicker: "Your top traits", title: "What makes you, you" },
    insight: { kicker: "The thing you didn't know" },
    stings: { kicker: "Only you", title: "The part that stings", badge: "Only you see this" },
    share: { kicker: "Your card", brand: "Genii · MirrorMii", sub: "Send it. See who actually knows you." },
    app: {
      kicker: "Get MirrorMii",
      title: "Genii has only met you on paper.",
      body: "MirrorMii is the cozy game where you snap a moment of your real day, and Miia, your digital twin, lives it.",
      button: "Get MirrorMii",
      note: "Free to join.",
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
    map: { kicker: "Your map", title: "Where you land" },
    traits: { kicker: "Your top traits", title: "What makes you, you" },
    insight: { kicker: "The thing you didn't know" },
    stings: { kicker: "Only you", title: "The tender part", badge: "Only you see this" },
    share: { kicker: "Your card", brand: "Genii · MirrorMii", sub: "Send it to someone who'd get it right." },
    app: {
      kicker: "Get MirrorMii",
      title: "Genii has only met you on paper.",
      body: "In MirrorMii, you snap small moments of your real day, and Miia, your digital twin, lives them.",
      button: "Get MirrorMii",
      note: "Free to join.",
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

// Screen data for one finished run.
//   result: score-core buildResult output; profile: buildProfile output (axes, splits, counts; may be partial)
//   sealed: checkSealed output or null; lib: library.json; voice: "fun" | "heart" | "cards"
//   promptFor(cardId): the sealed card's prompt in this voice, for the optional guess sheet
export function buildStories({ result, profile = {}, sealed = null, lib, voice = "fun", promptFor = null }) {
  const wording = wordingFor(voice);
  const C = STORY_COPY[wording];
  const L = lib || {};
  const axisMeta = Object.fromEntries((L.axes || []).map((a) => [a.id, a]));
  const tagLib = Object.fromEntries((L.tags || []).map((t) => [t.id, t]));
  const halfOf = (side) => (result.halves || []).find((h) => h.side === side) || { side, name: "", desc: "", axes: [] };
  const libHalf = (h) => ((h.side === "relationship" ? L.relationship : L.life) || []).find((x) => x.code === h.code) || h;
  const used = new Set();
  const take = (line) => { if (line) used.add(line); return line; };

  const relH = halfOf("relationship");
  const lifeH = halfOf("life");
  const relL = libHalf(relH);
  const lifeL = libHalf(lifeH);
  const people = { label: C.names.people, name: str(relL.name) || relH.name, read: voiced(relL, ["read", "desc"], wording) || relH.desc || "" };
  const life = { label: C.names.life, name: str(lifeL.name) || lifeH.name, read: voiced(lifeL, ["read", "desc"], wording) || lifeH.desc || "" };
  take(people.read);
  take(life.read);

  // Axis rows for the map, people side then life side.
  const axisLine = (ax, sign) => voiced(axisMeta[ax], sign > 0 ? "plusLine" : "minusLine", wording);
  const mapHalf = (h) => (h.axes || []).map((row) => {
    const meta = axisMeta[row.axis] || {};
    const p = (profile.axes || {})[row.axis] || {};
    const sign = typeof p.pole === "number" ? p.pole : row.pole === meta.minus ? -1 : 1;
    const r = { key: row.axis, left: meta.minus || "", right: meta.plus || "", sign, flex: Boolean(row.flex), unfinished: Boolean(row.unfinished), norm: p.norm };
    return { key: r.key, left: r.left, right: r.right, side: sign > 0 ? "right" : "left", flex: r.flex, unfinished: r.unfinished, pos: dotPosition(r), strength: r.unfinished || r.flex ? 0 : Math.abs(typeof p.norm === "number" ? p.norm : 0.5), line: axisLine(row.axis, sign) };
  });
  const mapGroups = [
    { label: C.names.people, rows: mapHalf(relH) },
    { label: C.names.life, rows: mapHalf(lifeH) },
  ];
  const decided = mapGroups.flatMap((g) => g.rows).filter((r) => r.strength > 0 && r.line).sort((a, b) => b.strength - a.strength);
  const mapCaption = decided.length ? decided[0].line : null;

  // Traits: up to 5, name plus one confident line.
  const tags = (result.tags || []).slice(0, 5).map((t) => {
    const lt = tagLib[t.id] || {};
    const calls = Array.isArray(lt.calls) ? lt.calls.filter(str) : [];
    return {
      key: t.id,
      name: str(lt.name) || t.name,
      line: voiced(lt, ["line"], wording) || calls[0] || voiced(lt, ["heart"], wording) || t.heart || "",
      heart: voiced(lt, ["heart"], wording) || t.heart || "",
    };
  });
  const calls = (result.calls || []).map((c) => (typeof c === "string" ? c : c && c.line)).filter(str);

  // The read: people half, life half, strongest trait. With no trait, a call or the clearest side of the map.
  const third = tags[0] ? tags[0].line : calls.find((c) => !used.has(c)) || mapCaption || "";
  const readLines = [people.read, life.read, take(third)].filter(Boolean);
  tags.forEach((t) => used.add(t.line));
  if (mapCaption) used.add(mapCaption);

  // The thing you didn't know: an axis split first, then the half fallback, then a call nobody has seen yet.
  const split = (profile.splits || []).find((s) => s && s.kind === "axis" && (!L.insights || L.insights[s.dim]));
  let insight = null;
  if (split && L.insights && L.insights[split.dim]) insight = voiced(L.insights[split.dim], split.believe > 0 ? "believePlus" : "believeMinus", wording);
  if (!insight && L.insightFallback) {
    const fb = L.insightFallback;
    const keys = [`${relH.code} | ${lifeH.code}`, relH.code, lifeH.code];
    for (const k of keys) { const v = pickVal(fb[k], wording) || voiced(fb[k], ["line", "text"], wording); if (v) { insight = v; break; } }
  }
  if (!insight) {
    const pool = [...calls, ...(result.tags || []).slice(0, 5).flatMap((t) => (tagLib[t.id] && Array.isArray(tagLib[t.id].calls) ? tagLib[t.id].calls.filter(str) : []))];
    insight = pool.find((c) => !used.has(c)) || pool.find((c) => !readLines.includes(c)) || voiced(relL, "heart", wording) || "";
  }

  const stings = [voiced(relL, "sting", wording), voiced(lifeL, "sting", wording)].map((s, i) => s || (result.stings || [])[i]).filter(Boolean);

  const counts = profile.counts || {};
  const noTraits = tags.length ? null : C.noTraits[(counts.rushed || 0) * 2 >= (counts.answered || 0) && counts.answered ? "rushed" : "thin"];

  const share = {
    brand: C.share.brand,
    names: [{ label: people.label, name: people.name }, { label: life.label, name: life.name }],
    // Marriage and kids tags (library `locked18`) never go on anything shareable.
    tags: tags.filter((t) => !(tagLib[t.key] && tagLib[t.key].locked18)).map((t) => ({ name: t.name, heart: t.heart })),
    invite: str(result.share && result.share.invite) || "Do you really know me?",
  };

  const slides = [
    { id: "intro", tone: "iris", kicker: C.intro.kicker, title: C.intro.title, sub: C.intro.sub },
    { id: "names", tone: "dawn", kicker: C.names.kicker, sub: C.names.sub, people, life },
    { id: "read", tone: "pearl", kicker: C.read.kicker, lines: readLines },
    { id: "map", tone: "dawn", kicker: C.map.kicker, title: C.map.title, groups: mapGroups, caption: mapCaption },
    { id: "traits", tone: "peach", kicker: C.traits.kicker, title: C.traits.title, tags, empty: noTraits },
    { id: "insight", tone: "iris", kicker: C.insight.kicker, line: insight },
    { id: "stings", tone: "night", kicker: C.stings.kicker, title: C.stings.title, badge: C.stings.badge, stings },
    { id: "share", tone: "dawn", kicker: C.share.kicker, sub: C.share.sub, share },
    { id: "app", tone: "iris", kicker: C.app.kicker, title: C.app.title, body: C.app.body, button: C.app.button, note: C.app.note, link: APP_LINK },
  ];

  let guesses = null;
  if (sealed && Array.isArray(sealed.rows)) {
    guesses = {
      called: sealed.called ?? sealed.rows.filter((r) => r.status === "hit" || r.status === "miss").length,
      exact: sealed.exact ?? sealed.rows.filter((r) => r.status === "hit").length,
      rows: sealed.rows.map((r, i) => ({ key: r.id || String(i), prompt: (promptFor && promptFor(r.id)) || "", status: r.status, label: GUESS_COPY.status[r.status] || GUESS_COPY.status.skipped })),
    };
  }

  return { voice, wording, slides, share, guesses };
}

// What a saved image of one screen draws. Plain text blocks only; share-image.js lays them out.
export function printFor(slide) {
  const base = { tone: slide.tone, kicker: slide.kicker };
  switch (slide.id) {
    case "intro": return { ...base, title: slide.title, lines: [slide.sub] };
    case "names": return { ...base, pairs: [slide.people, slide.life].map((h) => ({ label: h.label, name: h.name })), lines: [slide.sub] };
    case "read": return { ...base, lines: slide.lines };
    case "map": return { ...base, title: slide.title, map: slide.groups, lines: slide.caption ? [slide.caption] : [] };
    case "traits": return { ...base, title: slide.title, items: slide.tags.map((t) => ({ name: t.name, line: t.line })), lines: slide.empty ? [slide.empty] : [] };
    case "insight": return { ...base, lines: [slide.line], big: true };
    case "stings": return { ...base, kicker: null, title: slide.title, badge: slide.badge, lines: slide.stings };
    case "share": return { ...base, pairs: slide.share.names, items: slide.share.tags.map((t) => ({ name: t.name, line: t.heart })), button: slide.share.invite };
    case "app": return { ...base, title: slide.title, lines: [slide.body, slide.note] };
    default: return base;
  }
}
