// The Evidence Article (LAUNCH-SPEC section 25 item 3, docs/ARTICLE-DESIGN.md): the long read that follows the Stories
// deck. A pure projection, like story-data.js: the deck's own screens (already picked from the player's evidence) plus
// library.json in, one article model out. Nothing here scores, quotes an answer or shows a number, except the one count
// the deck already allows (Genii's calls). New lines come from library.json: `article` (frames that carry no claim of
// their own) and `crossover` (the two-sides table, picked by the player's strongest stat ends).

import { STATS } from "../stats.js";
import { oppositeOf, sheetLine, voiced } from "../stories/story-data.js";

export const ARTICLE_TABS = Object.freeze(["stats", "traits", "surprise", "rooms", "book", "record", "party"]);
// Where each chapter's islet floats on the rooms map, in percent of the map (x, y of the islet's center), and how wide
// it is. Love, work and home sit forward; the phone and play sit back.
export const ISLETS = Object.freeze({
  1: { x: 20, y: 22, w: 30 },
  7: { x: 78, y: 20, w: 32 },
  2: { x: 50, y: 38, w: 38 },
  3: { x: 18, y: 60, w: 36 },
  5: { x: 80, y: 58, w: 34 },
  4: { x: 36, y: 84, w: 30 },
  6: { x: 66, y: 86, w: 36 },
});

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const str = (v) => (typeof v === "string" && v.trim() ? v : null);
const fill = (t, vars = {}) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? "" : String(vars[k])));

// One frame from library.json `article`, in voice. `path` is dotted ("sheet.title").
export function frame(lib, path, wording, vars) {
  let node = lib && lib.article;
  for (const k of String(path).split(".")) node = node && typeof node === "object" ? node[k] : null;
  if (!node) return "";
  const text = typeof node === "string" ? node : (wording === "heart" && str(node.heart)) || str(node.fun) || "";
  return vars ? fill(text, vars) : text;
}

// The crossover key for a decided stat row: axis plus "+" for the first pole (the library's plus), "-" for the second.
export const endKey = (row) => `${row.key}${row.side === "right" ? "+" : "-"}`;

// Strongest first: most pips, then the lean itself, then sheet order. Near-even and unfinished stats have no end.
const byStrength = (rows) => rows.map((r, i) => ({ r, i }))
  .filter(({ r }) => !r.flex && !r.unfinished && r.leadEnd)
  .sort((a, b) => b.r.pips - a.r.pips || b.r.strength - a.r.strength || a.i - b.i)
  .map(({ r }) => r);

// Your two sides at one table: every decided people end crossed with every decided life end, strongest pairs first;
// the first team cell and the first clash cell are the two the page shows.
export function twoSides(rows, lib, wording) {
  const table = (lib && lib.crossover) || {};
  const people = byStrength(rows.filter((r) => r.key[0] === "R"));
  const life = byStrength(rows.filter((r) => r.key[0] === "L"));
  const pairs = [];
  people.forEach((p, i) => life.forEach((l, j) => pairs.push({ p, l, rank: i + j, i })));
  pairs.sort((a, b) => a.rank - b.rank || a.i - b.i);
  const out = {};
  for (const { p, l } of pairs) {
    const key = `${endKey(p)}|${endKey(l)}`;
    const cell = table[key];
    if (!cell || out[cell.type]) continue;
    const line = wording === "heart" ? str(cell.heart) || str(cell.fun) : str(cell.fun);
    if (line) out[cell.type] = { type: cell.type, key, a: p.leadEnd, aStat: p.stat, b: l.leadEnd, bStat: l.stat, line };
  }
  return out;
}

const FLIP = { We: "Me", Me: "We", Direct: "Soft", Soft: "Direct", Classic: "Own", Own: "Classic", Steady: "Venture", Venture: "Steady", Push: "Easy", Easy: "Push", Rules: "Context", Context: "Rules" };

// You click with: the half the wild card sits in, with that one stat flipped; every other pole stays yours.
export function clickWith(lib, halves, wild, rows) {
  if (!wild) return null;
  const row = rows.find((r) => r.key === wild.key);
  if (!row || row.unfinished) return null;
  const onLife = row.key[0] === "L";
  const list = (onLife ? lib.life : lib.relationship) || [];
  const mine = list.find((x) => x.name === (onLife ? halves.life : halves.people));
  if (!mine) return null;
  const idx = Number(row.key[1]) - 1;
  const code = mine.code.split("·").map((p, i) => (i === idx ? FLIP[p] : p)).join("·");
  const hit = list.find((x) => x.code === code);
  if (!hit) return null;
  // The end the flip swings to: the other end of the wild card (a near-even stat names the end they don't lean).
  const s = STATS[row.key];
  const toPole = FLIP[mine.code.split("·")[idx]];
  return { name: hit.name, side: onLife ? "life" : "people", stat: row.stat, end: s.ends[toPole], pair: onLife ? [halves.people, hit.name] : [hit.name, halves.life] };
}

// The page model. `stories` is buildStories() output (resultView), `lib` is library.json.
export function buildArticle({ stories, lib }) {
  const L = lib || {};
  const wording = stories.wording === "heart" ? "heart" : "fun";
  const f = (path, vars) => frame(L, path, wording, vars);
  const by = Object.fromEntries((stories.slides || []).map((s) => [s.id, s]));
  const names = by.names;
  const read = by.read || { lines: [], bodies: [] };
  const map = by.map;
  const axisMeta = Object.fromEntries((L.axes || []).map((a) => [a.id, a]));
  const tagLib = Object.fromEntries((L.tags || []).map((t) => [t.id, t]));
  const halves = { people: names.people.name, life: names.life.name };
  const libHalf = (list, name) => (list || []).find((x) => x.name === name) || null;
  const relL = libHalf(L.relationship, halves.people);
  const lifeL = libHalf(L.life, halves.life);

  // ------------------------------------------------------------------ cover and lede
  const cover = {
    masthead: f("masthead"),
    readTime: f("readTime"),
    dek: f("cover.dek"),
    keywordsLabel: f("cover.keywords"),
    people: { label: f("cover.people"), name: halves.people, read: read.lines[0] || names.people.read || "", desc: read.bodies[0] || "" },
    life: { label: f("cover.life"), name: halves.life, read: read.lines[1] || names.life.read || "", desc: read.bodies[1] || "" },
    keywords: names.keywords || [],
  };

  // ------------------------------------------------------------------ the character sheet, with the other end
  const rows = map.groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.label })));
  const findings = (by.knows && by.knows.findings) || [];
  const knowOf = (key) => (findings.find((x) => x.key === key && x.kind === "axis") || {}).line || null;
  const core = ((by.traits && by.traits.core) || []).map((k) => ({ ...k }));
  const coreAxes = new Set(core.filter((k) => k.kind === "stat").map((k) => k.axis));
  const sheetRows = rows.map((r) => {
    const decided = !r.flex && !r.unfinished;
    const otherEnd = decided ? (r.side === "right" ? "minus" : "plus") : null;
    const band = r.band === "both" ? null : r.band;
    const badge = r.badge === "signature" ? map.signature : r.badge === "wild" ? map.wild : null;
    // What Genii knows goes in the drawer only for the signature and the wild card, and only when no core trait
    // already carries it (the page never says the same line twice).
    const know = decided && r.badge && !coreAxes.has(r.key) ? knowOf(r.key) : null;
    return {
      key: r.key, stat: r.stat, group: r.group, a: r.a, b: r.b, leadEnd: r.leadEnd, otherEnd: r.otherEnd, side: r.side,
      flex: r.flex, unfinished: r.unfinished, pips: r.pips, split: r.split, level: r.level, note: r.note, strength: r.strength,
      badge: r.badge, badgeLabel: badge ? badge.label : null, badgeNote: badge ? badge.note : null,
      otherLine: decided && band ? sheetLine(axisMeta[r.key], otherEnd, band, wording) : null,
      know,
    };
  });
  const sheet = {
    kicker: map.kicker, title: f("sheet.title"), intro: f("sheet.intro"), hint: f("sheet.hint"), key: f("sheet.key"),
    yours: f("sheet.yours"), other: f("sheet.other"),
    groups: map.groups.map((g) => ({ label: g.label, rows: sheetRows.filter((r) => r.group === g.label) })),
    signature: map.signature, wild: map.wild,
  };

  // ------------------------------------------------------------------ core traits, each with where it comes from
  const tags = (by.traits && by.traits.tags) || [];
  const used = new Set();
  const traits = {
    title: f("core.title"), intro: f("core.intro"), fromLabel: f("core.from"), turn: f("core.turn"), turnBack: f("core.turnBack"), kept: f("core.kept"),
    position: (n, total) => f("core.position", { n: NUMBER_WORDS[n] || n, total: NUMBER_WORDS[total] || total }),
    empty: (by.traits && by.traits.empty) || null,
    items: core.map((k) => {
      let from;
      let back = null;
      let backLabel;
      let backName = k.keyword;
      if (k.kind === "tag") {
        from = k.source;
        const t = tags.find((x) => x.key === k.tag);
        back = t ? str(t.heart) : null;
        backLabel = f("core.backTag");
      } else {
        const row = sheetRows.find((r) => r.key === k.axis);
        from = f("core.statFrom", { stat: row ? row.stat : "", end: row ? row.leadEnd : "" });
        // The back of a stat card: what the other end of that stat looks like, so you can spot it in a friend.
        back = row ? row.otherLine : null;
        backName = row ? row.otherEnd : k.keyword;
        backLabel = f("core.backStat");
      }
      // A stat-backed card reads the stat end's finding, not the sheet line the character sheet already shows.
      const line = k.kind === "stat" ? knowOf(k.axis) || k.line : k.line;
      if (back && back === line) back = null;
      if (back && k.kind === "tag") used.add(back);
      used.add(line);
      return { key: k.key, kind: k.kind, keyword: k.keyword, from, line, back, backLabel, backName, chapter: k.chapter ?? null, axis: k.axis || null, private: Boolean(k.private) };
    }),
  };

  // ------------------------------------------------------------------ the thing you didn't know
  const ins = by.insight;
  const surprise = ins ? {
    kicker: ins.kicker, belief: ins.parts ? ins.parts.belief : ins.line, behavior: ins.parts ? ins.parts.behavior : null,
    save: f("surprise.save"), saved: f("surprise.saved"), slide: ins,
  } : null;

  // ------------------------------------------------------------------ room by room, and the room where you flip
  const roomRows = (by.rooms && by.rooms.rows) || [];
  const lead = Object.fromEntries(sheetRows.map((r) => [r.key, r]));
  const flipRow = roomRows.find((r) => r.differs && r.kind === "axis" && lead[r.axis] && !lead[r.axis].flex && !lead[r.axis].unfinished);
  const flip = flipRow ? {
    chapter: flipRow.chapter, room: flipRow.room, stat: lead[flipRow.axis].stat, overall: lead[flipRow.axis].leadEnd, roomEnd: flipRow.leadEnd,
    title: f("rooms.flipTitle"),
    line: f("rooms.flipLine", { overall: lead[flipRow.axis].leadEnd, room: flipRow.room, roomEnd: flipRow.leadEnd }),
  } : null;
  const rooms = roomRows.length ? {
    kicker: by.rooms.kicker, title: f("rooms.title"), intro: f("rooms.intro"), mapLabel: f("rooms.mapLabel"), quiet: f("rooms.quiet"), differs: by.rooms.differs,
    rows: roomRows.map((r) => ({ chapter: r.chapter, room: r.room, line: r.line, end: r.kind === "axis" ? r.leadEnd : r.lead, stat: r.kind === "axis" && lead[r.axis] ? lead[r.axis].stat : null, differs: Boolean(flip && flip.chapter === r.chapter), level: r.level })),
    flip,
  } : null;

  // ------------------------------------------------------------------ your two sides at one table
  const cells = twoSides(sheetRows, L, wording);
  const sides = cells.team || cells.clash ? {
    title: f("sides.title"), intro: f("sides.intro", { people: halves.people, life: halves.life }),
    people: halves.people, life: halves.life,
    cells: [cells.team, cells.clash].filter(Boolean).map((c) => ({ ...c, label: f(`sides.${c.type}`) })),
  } : null;

  // ------------------------------------------------------------------ open book: the stings, then the heart lines
  const st = by.stings;
  const hearts = [
    relL ? { from: halves.people, line: voiced(relL, "heart", wording) } : null,
    lifeL ? { from: halves.life, line: voiced(lifeL, "heart", wording) } : null,
  ].filter((h) => h && h.line && !used.has(h.line));
  const book = st ? {
    kicker: st.kicker, title: st.title, intro: f("book.intro"), stings: st.stings || [],
    saidTitle: f("book.saidTitle"), saidIntro: f("book.saidIntro"), hearts,
  } : null;

  // ------------------------------------------------------------------ the record: Genii's calls, in play order
  const c = by.calls;
  const record = c ? {
    kicker: c.kicker, title: f("record.title"), headline: c.title, intro: c.intro, key: c.key, order: f("record.order"),
    exact: c.exact, called: c.called, of: c.of, face: c.face,
    rows: c.rows.map((r) => ({ key: r.key, title: r.title || r.topic, status: r.status, near: r.near, shown: r.shown, side: r.side })),
  } : null;

  // ------------------------------------------------------------------ party: click with, your opposite, the empty slot
  const relCode = relL ? relL.code : null;
  const lifeCode = lifeL ? lifeL.code : null;
  const opp = relCode && lifeCode ? oppositeOf(L, relCode, lifeCode) : null;
  const click = clickWith(L, halves, map.wild, sheetRows);
  const share = by.share;
  const party = {
    title: f("party.title"), you: f("party.you"), with: f("party.withLabel"), halves,
    click: click ? { ...click, label: f("party.clickLabel"), line: f("party.click", { stat: click.stat, end: click.end }) } : null,
    opposite: opp ? { a: opp[0], b: opp[1], label: f("party.oppositeLabel"), line: f("party.opposite") } : null,
    challenge: share ? share.challenge : "", challengeSub: share ? share.sub : "",
  };
  // The one-line bio: both names and the first three shareable core traits. Never a sting or a private trait.
  const kws = (names.keywords || []).slice(0, 3).map((k, i) => (i ? k.toLowerCase() : k));
  const bio = { title: f("bio.title"), text: `${halves.people}. ${halves.life}.${kws.length ? ` ${kws.join(", ")}.` : ""}`, copy: f("bio.copy"), copied: f("bio.copied") };

  // ------------------------------------------------------------------ closing and the app
  const app = by.app;
  const closing = {
    line: f("closing"), foot: f("foot"),
    app: app ? { kicker: app.kicker, title: app.title, body: app.body, button: app.button, store: app.store, note: app.note, link: app.link } : null,
    challenge: party.challenge, share: share ? share.share : null,
  };

  const tabs = ARTICLE_TABS
    .filter((id) => ({ surprise, rooms, book, record }[id] !== null))
    .map((id) => ({ id, label: f(`tabs.${id}`) }));

  return {
    wording, voice: stories.voice, back: f("back"), readMore: f("readMore"), tabsLabel: f("tabs.label"), allSections: f("tabs.all"),
    tabs, cover, sheet, traits, surprise, rooms, sides, book, record, party, bio, closing,
    tagLib, // for the owner-only mark on private traits
  };
}

// Every line a reader can see, for tests and the reading-time check (frames and claims alike).
export function articleText(A) {
  const out = [];
  const add = (...xs) => xs.forEach((x) => { if (typeof x === "string" && x.trim()) out.push(x); });
  const c = A.cover;
  add(c.masthead, c.readTime, c.dek, c.people.label, c.people.name, c.people.read, c.people.desc, c.life.label, c.life.name, c.life.read, c.life.desc, ...c.keywords);
  add(A.sheet.title, A.sheet.intro, A.sheet.hint, A.sheet.key);
  for (const g of A.sheet.groups) for (const r of g.rows) add(r.stat, r.leadEnd, r.level, r.note, r.otherLine, r.know, r.badgeLabel, r.badgeNote);
  add(A.traits.title, A.traits.intro);
  for (const k of A.traits.items) add(k.keyword, k.from, k.line, k.back);
  if (A.surprise) add(A.surprise.belief, A.surprise.behavior);
  if (A.rooms) { add(A.rooms.title, A.rooms.intro, A.rooms.quiet); for (const r of A.rooms.rows) add(r.room, r.line); if (A.rooms.flip) add(A.rooms.flip.title, A.rooms.flip.line); }
  if (A.sides) { add(A.sides.title, A.sides.intro); for (const x of A.sides.cells) add(x.label, x.line); }
  if (A.book) { add(A.book.title, A.book.intro, ...A.book.stings, A.book.saidTitle, A.book.saidIntro); for (const h of A.book.hearts) add(h.line); }
  if (A.record) { add(A.record.headline, A.record.intro, A.record.key); for (const r of A.record.rows) add(r.title, r.shown); }
  const p = A.party;
  add(p.title, p.click && p.click.name, p.click && p.click.line, p.opposite && p.opposite.line, p.challenge, p.challengeSub, A.bio.text);
  add(A.closing.line, A.closing.app && A.closing.app.title, A.closing.app && A.closing.app.body);
  return out;
}
