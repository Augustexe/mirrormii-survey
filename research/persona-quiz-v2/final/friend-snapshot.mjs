// Recomputes friend.json level2 (the Level 2 snapshot, the primary lists and the backup order) from cards.json.
// Plain Node, no dependencies.
//
//   node friend-snapshot.mjs          -> checks: prints what is stale, exit 1 when the snapshot differs from the cards
//   node friend-snapshot.mjs --write  -> rewrites friend.json level2.cards, primary.friend, primary.bestie, backupOrder
//
// level2.cards[id] per card with a `friend` field: chapter, type, sally, the axes and tag pairs its two sides name, the
// card level (everyday, love or couple; kept from the current snapshot, new cards default to love in chapter 3 and
// everyday elsewhere: set it by hand when a card is about the owner's person or a shared home) and answerMap (the side
// each owner option maps to, level2.answerMapping; null for circumstance and depends options or no clear side).
// Primary lists (12 cards each): all six axes, 12 different tag pairs, at least 6 chapters, no two neighbours from one
// chapter. primary.friend serves partner, crush and friend-or-coworker, so it holds everyday cards only; primary.bestie
// may hold love and couple cards. A still-valid current list is kept. backupOrder: every friend card once, cards whose
// pairs no primary list uses first, then did cards, then the rest, each in bank order.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createScorer } from "./score-core.mjs";
import { NO_FRIEND_TYPES, DID_TYPES } from "./card-schema.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];

export function snapshot(kit, lib, friend) {
  const S = createScorer({ kit, lib, friend });
  const old = (friend.level2 && friend.level2.cards) || {};
  const cards = kit.chapters.flatMap((ch) => ch.cards).filter((c) => c.friend && c.privacy === "normal" && !NO_FRIEND_TYPES.includes(c.type));
  const snap = {};
  for (const c of cards) {
    const sides = [c.friend.a, c.friend.b];
    snap[c.id] = {
      chapter: c.chapter,
      type: c.type,
      sally: c.sally || [],
      axes: [...new Set(sides.flatMap((x) => Object.keys(x.axes || {})))],
      pairs: [...new Set(sides.flatMap((x) => (x.tags || []).map((t) => t.id.slice(0, 3))))],
      level: (old[c.id] && old[c.id].level) || (c.chapter === 3 ? "love" : "everyday"),
      answerMap: c.options.map((o, i) => (o.circumstance || o.depends ? null : S.friendMapping(c, [i]))),
    };
  }
  return { cards, snap };
}

// A list of 12 is clean when it covers the six axes and 12 different pairs over 6+ chapters, neighbours apart.
export function cleanList(list, snap) {
  if (list.length !== 12 || list.some((id) => !snap[id])) return false;
  const info = list.map((id) => snap[id]);
  const pairs = info.flatMap((x) => x.pairs);
  if (new Set(pairs).size !== pairs.length || pairs.length < 12) return false;
  if (!AXES.every((a) => info.some((x) => x.axes.includes(a)))) return false;
  if (new Set(info.map((x) => x.chapter)).size < 6) return false;
  return info.every((x, i) => !i || x.chapter !== info[i - 1].chapter);
}

// Deterministic search for a clean list from candidate ids (in preference order).
function searchList(cands, snap, seed) {
  let s = seed >>> 0 || 1;
  const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  for (let attempt = 0; attempt < 20000; attempt++) {
    const order = attempt === 0 ? [...cands] : [...cands].sort(() => r() - 0.5);
    const pick = [];
    const usedPairs = new Set();
    const axes = new Set();
    const perChapter = {};
    for (const id of order) {
      const x = snap[id];
      if (pick.length >= 12) break;
      if (!x.pairs.length || x.pairs.some((p) => usedPairs.has(p)) || (perChapter[x.chapter] || 0) >= 2) continue;
      // Leave room for the axes still missing.
      const missing = AXES.filter((a) => !axes.has(a)).length;
      const adds = x.axes.filter((a) => !axes.has(a)).length;
      if (12 - pick.length <= missing && !adds) continue;
      pick.push(id);
      x.pairs.forEach((p) => usedPairs.add(p));
      x.axes.forEach((a) => axes.add(a));
      perChapter[x.chapter] = (perChapter[x.chapter] || 0) + 1;
    }
    if (pick.length !== 12) continue;
    // Order: no two neighbours from one chapter (greedy on the chapter with most cards left).
    const left = [...pick];
    const out = [];
    while (left.length) {
      const prev = out.length ? snap[out[out.length - 1]].chapter : null;
      const counts = {};
      for (const id of left) counts[snap[id].chapter] = (counts[snap[id].chapter] || 0) + 1;
      const next = left.filter((id) => snap[id].chapter !== prev).sort((a, b) => counts[snap[b].chapter] - counts[snap[a].chapter])[0];
      if (!next) break;
      out.push(next);
      left.splice(left.indexOf(next), 1);
    }
    if (cleanList(out, snap)) return out;
  }
  throw new Error("no clean primary list found");
}

export function level2For(kit, lib, friend) {
  const { cards, snap } = snapshot(kit, lib, friend);
  const L2 = friend.level2;
  const clear = (id) => snap[id].answerMap.filter(Boolean).length / Math.max(1, snap[id].answerMap.length);
  // Preference: did cards first (strongest evidence), then the clearest answer mapping, then bank order.
  const pref = cards.map((c) => c.id).sort((a, b) => (DID_TYPES.includes(snap[b].type) - DID_TYPES.includes(snap[a].type)) || clear(b) - clear(a));
  const keep = (list) => Array.isArray(list) && cleanList(list, snap);
  const friendList = keep(L2.primary.friend) && L2.primary.friend.every((id) => snap[id].level === "everyday") ? L2.primary.friend
    : searchList(pref.filter((id) => snap[id].level === "everyday"), snap, 11);
  const bestieList = keep(L2.primary.bestie) ? L2.primary.bestie : searchList(pref, snap, 29);
  const inPrimary = new Set([...friendList, ...bestieList]);
  const primaryPairs = new Set([...friendList, ...bestieList].flatMap((id) => snap[id].pairs));
  const bankOrder = cards.map((c) => c.id);
  const rank = (id) => (snap[id].pairs.some((p) => !primaryPairs.has(p)) ? 0 : 1) * 2 + (DID_TYPES.includes(snap[id].type) ? 0 : 1);
  const backupOrder = [...bankOrder].sort((a, b) => (inPrimary.has(a) - inPrimary.has(b)) || rank(a) - rank(b) || bankOrder.indexOf(a) - bankOrder.indexOf(b));
  return { cards: snap, primary: { ...L2.primary, friend: friendList, bestie: bestieList }, backupOrder };
}

function main(argv) {
  const kit = read("cards.json");
  const lib = read("library.json");
  const friend = read("friend.json");
  const next = level2For(kit, lib, friend);
  const L2 = friend.level2;
  const stale = ["cards", "backupOrder"].filter((k) => JSON.stringify(L2[k]) !== JSON.stringify(next[k]));
  if (JSON.stringify(L2.primary) !== JSON.stringify(next.primary)) stale.push("primary");
  if (!argv.includes("--write")) {
    console.log(stale.length ? `friend.json level2 is stale: ${stale.join(", ")} (node friend-snapshot.mjs --write)` : "friend.json level2 matches cards.json");
    return stale.length ? 1 : 0;
  }
  friend.level2 = { ...L2, cards: next.cards, primary: next.primary, backupOrder: next.backupOrder };
  fs.writeFileSync(path.join(DIR, "friend.json"), JSON.stringify(friend, null, 2) + "\n");
  console.log(`wrote friend.json level2: ${Object.keys(next.cards).length} cards; friend ${next.primary.friend.join(" ")}; bestie ${next.primary.bestie.join(" ")}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
