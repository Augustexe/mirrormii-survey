// The Evidence Article (LAUNCH-SPEC section 25 item 3, docs/ARTICLE-DESIGN.md): the long read that follows the Stories
// deck. A pure projection, like story-data.js: the deck's own screens (already picked from the player's evidence) plus
// library.json in, one article model out. Nothing here scores, quotes an answer or shows a number, except the one count
// the deck already allows (Genii's calls) and the drama stat scores (1 to 20). New lines come from library.json:
// `article` (frames that carry no claim of their own) and `drama` (the top stat and dump stat lines).
//
// Cuts (Jerry, 2026-09-30, drama stats pass; every section says something new): the lede (the cover carries the
// title and its one story line), the character sheet and its drawers (the drama stat block replaces it), your two
// results side by side (the crossover table) and every strength has a flip side (green flag and red flag cover it).

import { HALVES, STATS } from "../stats.js";
import { oppositeOf, sheetLine, voiced } from "../stories/story-data.js";
import { COMBO_LINES, comboLine } from "../combo-lines.js";

// Part one follows the Stories deck in its own order (the same beats, deeper); part two is new.
export const ARTICLE_TABS = Object.freeze(["stats", "rooms", "surprise", "traits", "record", "heist", "flags", "bets", "party", "seed"]);
export const PART_ONE = Object.freeze(["stats", "rooms", "surprise", "traits", "record"]);
// Where each chapter's islet floats on the rooms map, in percent of the map (x, y of the islet's center), and how wide
// it is. Love, work and home sit forward; the phone and play sit back. `lift` raises a pin above its islet (percent of
// the map): money and home sit side by side, so home's pin stands higher and their labels never collide on a phone.
export const ISLETS = Object.freeze({
  1: { x: 20, y: 22, w: 30 },
  7: { x: 78, y: 20, w: 32 },
  2: { x: 50, y: 38, w: 38 },
  3: { x: 18, y: 60, w: 36 },
  5: { x: 80, y: 58, w: 34 },
  4: { x: 36, y: 84, w: 30 },
  6: { x: 66, y: 86, w: 36, lift: 8 },
});

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const str = (v) => (typeof v === "string" && v.trim() ? v : null);
const lower = (t) => { const v = String(t || ""); return v.charAt(0).toLowerCase() + v.slice(1); };
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

const FLIP = { We: "Me", Me: "We", Direct: "Soft", Soft: "Direct", Classic: "Own", Own: "Classic", Steady: "Venture", Venture: "Steady", Push: "Easy", Easy: "Push", Rules: "Context", Context: "Rules" };

// The people stat closest to the middle: a near-even one first (the one whose bead sits nearest dead center), else the
// weakest decided lean. Unfinished stats never count.
export function softestPeopleStat(rows) {
  const people = rows.map((r, i) => ({ r, i })).filter(({ r }) => r.key[0] === "R" && !r.unfinished);
  const flex = people.filter(({ r }) => r.flex).sort((a, b) => Math.abs(a.r.pos - 50) - Math.abs(b.r.pos - 50) || a.i - b.i);
  if (flex.length) return flex[0].r;
  const lean = people.filter(({ r }) => !r.flex).sort((a, b) => a.r.pips - b.r.pips || a.r.strength - b.r.strength || a.i - b.i);
  return lean.length ? lean[0].r : null;
}

// You click with: your one title (the people archetype) with the people stat closest to the middle flipped; your
// day-to-day side stays yours, so the story line is the flipped pair's own.
export function clickWith(lib, relCode, lifeCode, row, wording) {
  if (!row || !relCode) return null;
  const list = lib.relationship || [];
  const idx = Number(row.key[1]) - 1;
  const code = relCode.split("·").map((p, i) => (i === idx ? FLIP[p] : p)).join("·");
  const hit = list.find((x) => x.code === code);
  if (!hit) return null;
  const toPole = FLIP[relCode.split("·")[idx]];
  return { name: hit.name, code, line: comboLine(COMBO_LINES, code, lifeCode, wording) || "", stat: row.stat, end: STATS[row.key].ends[toPole] };
}

// Heist crew role (V2): the strongest decided day-to-day stat end picks the job; with none decided, the day-to-day
// half's own pole on New things.
export const HEIST_ROLE = Object.freeze({ "L3+": "planner", "L2-": "planner", "L2+": "driver", "L1+": "inside", "L3-": "inside", "L1-": "distraction" });
export const HEIST_ORDER = Object.freeze(["planner", "driver", "inside", "distraction"]);
export function heistEnd(rows, lifeCode) {
  const top = byStrength(rows.filter((r) => r.key[0] === "L"))[0];
  if (top) return endKey(top);
  const pole = String(lifeCode || "").split("·")[0];
  return pole === "Venture" ? "L1-" : "L1+";
}

// Traits that never give a flag or a bet: AI use (library tags T03A and T03B), kids and weddings (locked18).
const quietTag = (lt) => !lt || lt.locked18 || /^T03[AB]$/.test(lt.id);

// A stat end's own line for one field ("Green", "Red", "Bet"), in voice.
const endLine = (meta, row, field, wording) => voiced(meta, `${row.side === "right" ? "plus" : "minus"}${field}`, wording);

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
  // One title (the people archetype) and one story line under it, as on story 2 (decision 1a); the deck carries the
  // line, and a deck without one falls back to the pair's line here, then the people half's read.
  const deckTitle = names.title || null;
  const title = {
    kicker: f("cover.youAre"),
    name: halves.people,
    line: (deckTitle && str(deckTitle.line)) || comboLine(COMBO_LINES, relL ? relL.code : "", lifeL ? lifeL.code : "", wording) || read.lines[0] || "",
  };
  // The lede merged into the cover (2026-09-30): the title and its one story line, the day-to-day row, the dek. No
  // restated read or description, and no keyword chips (the traits section right after shows them with their lines).
  const cover = {
    masthead: f("masthead"),
    readTime: f("readTime"),
    dek: f("cover.dek"),
    title,
    lifeRow: { label: HALVES.life.kicker, name: halves.life },
  };

  // ------------------------------------------------------------------ the six leans (internal, never rendered as a sheet)
  // The traits' backs, the rooms' flip, the heist role, the flags, the bets and the party still read the six axis
  // leans; only their character sheet display is gone.
  const rows = map.groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.label })));
  const findings = (by.knows && by.knows.findings) || [];
  const knowOf = (key) => (findings.find((x) => x.key === key && x.kind === "axis") || {}).line || null;
  const core = ((by.traits && by.traits.core) || []).map((k) => ({ ...k }));
  const sheetRows = rows.map((r) => {
    const decided = !r.flex && !r.unfinished;
    const otherEnd = decided ? (r.side === "right" ? "minus" : "plus") : null;
    const band = r.band === "both" ? null : r.band;
    return {
      key: r.key, stat: r.stat, group: r.group, a: r.a, b: r.b, leadEnd: r.leadEnd, otherEnd: r.otherEnd, side: r.side, pos: r.pos,
      flex: r.flex, unfinished: r.unfinished, pips: r.pips, split: r.split, level: r.level, note: r.note, strength: r.strength,
      otherLine: decided && band ? sheetLine(axisMeta[r.key], otherEnd, band, wording) : null,
    };
  });
  // ------------------------------------------------------------------ the drama stat block
  // All six from the deck's own numbers (rpg-stats.js via story-data), then the top stat line and the dump stat line.
  const stats = {
    kicker: map.kicker, title: f("stats.title"), intro: f("stats.intro"),
    all: (map.stats || []).map((x) => ({ id: x.id, abbr: x.abbr, name: x.name, score: x.score, mark: map.top && x.id === map.top.id ? "top" : map.dump && x.id === map.dump.id ? "dump" : null })),
    top: map.top ? { ...map.top, label: f("stats.top") } : null,
    dump: map.dump ? { ...map.dump, label: f("stats.dump") } : null,
  };

  // ------------------------------------------------------------------ core traits, each with where it comes from
  const tags = (by.traits && by.traits.tags) || [];
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
      // A stat-backed card reads the stat end's finding, not its sheet line.
      const line = k.kind === "stat" ? knowOf(k.axis) || k.line : k.line;
      if (back && back === line) back = null;
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
    line: f("rooms.flipLine", { overall: lower(lead[flipRow.axis].leadEnd), room: flipRow.room, roomEnd: lower(flipRow.leadEnd) }),
  } : null;
  const rooms = roomRows.length ? {
    kicker: by.rooms.kicker, title: f("rooms.title"), intro: f("rooms.intro"), mapLabel: f("rooms.mapLabel"), quiet: f("rooms.quiet"), differs: by.rooms.differs,
    rows: roomRows.map((r) => ({ chapter: r.chapter, room: r.room, line: r.line, end: r.kind === "axis" ? r.leadEnd : r.lead, stat: r.kind === "axis" && lead[r.axis] ? lead[r.axis].stat : null, differs: Boolean(flip && flip.chapter === r.chapter), level: r.level })),
    flip,
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
  const soft = softestPeopleStat(sheetRows);
  const click = clickWith(L, relCode, lifeCode, soft, wording);
  const share = by.share;
  const oppCodes = relCode && lifeCode ? [relCode, lifeCode].map((c) => c.split("·").map((p) => FLIP[p]).join("·")) : null;
  const party = {
    title: f("party.title"), you: f("party.you"), halves,
    // Each slot is one title (a people archetype); the other slots carry their pair's story line. Your own slot shows
    // the name only: the cover already carries your line.
    me: { name: halves.people },
    click: click ? { ...click, label: f("party.clickLabel"), diff: f("party.click", { stat: lower(click.stat), end: lower(click.end) }) } : null,
    opposite: opp ? { name: opp[0], line: comboLine(COMBO_LINES, oppCodes[0], oppCodes[1], wording) || "", a: opp[0], b: opp[1], label: f("party.oppositeLabel"), diff: f("party.opposite") } : null,
    challenge: share ? share.challenge : "", challengeSub: share ? share.sub : "",
  };
  // The one-line bio: the title and the first three shareable core traits. Never a sting or a private trait.
  const kws = (names.keywords || []).slice(0, 3).map((k, i) => (i ? k.toLowerCase() : k));
  const bio = { title: f("bio.title"), text: `${halves.people}.${kws.length ? ` ${kws.join(", ")}.` : ""}`, copy: f("bio.copy"), copied: f("bio.copied") };

  // ------------------------------------------------------------------ part two: the heist crew
  const hEnd = heistEnd(sheetRows, lifeCode);
  const role = HEIST_ROLE[hEnd];
  const hStat = STATS[hEnd.slice(0, 2)];
  const heist = {
    title: f("heist.title"), intro: f("heist.intro"), yoursLabel: f("heist.yours"), openLabel: f("heist.open"), recruit: f("heist.recruit"),
    role, end: hEnd, from: hStat.ends[hEnd.endsWith("+") ? hStat.first : hStat.second],
    why: f(`heist.why.${hEnd}`),
    roles: HEIST_ORDER.map((id) => ({ id, name: f(`heist.roles.${id}.name`), job: f(`heist.roles.${id}.job`), mine: id === role })),
  };

  // ------------------------------------------------------------------ part two: green flag, red flag
  // From the top shareable traits (green from the first, red from the second, or both from one); a player with none
  // gets them from the strongest stat ends. Never AI, kids or wedding traits.
  const decidedAll = byStrength(sheetRows);
  const flagTags = tags.filter((t) => !t.private && !quietTag(tagLib[t.key]) && voiced(tagLib[t.key], "green", wording));
  const fromTag = (t, field) => ({ kind: "tag", key: t.key, from: t.name, line: voiced(tagLib[t.key], field, wording) });
  const fromEnd = (r, field) => ({ kind: "stat", key: endKey(r), from: r.leadEnd, line: endLine(axisMeta[r.key], r, field, wording) });
  let green = null;
  let red = null;
  if (flagTags.length) { green = fromTag(flagTags[0], "green"); red = fromTag(flagTags[1] || flagTags[0], "red"); }
  else if (decidedAll.length) { green = fromEnd(decidedAll[0], "Green"); red = fromEnd(decidedAll[1] || decidedAll[0], "Red"); }
  const flags = green && green.line && red && red.line ? {
    title: f("flags.title"), intro: f("flags.intro"),
    green: { ...green, label: f("flags.green") }, red: { ...red, label: f("flags.red") },
  } : null;

  // ------------------------------------------------------------------ part two: Genii's bets
  // The shareable core traits in order (a trait's own bet, or a stat end's), topped up from the strongest stat ends.
  const betLines = [];
  const betKeys = new Set();
  const addBet = (b) => { if (b && b.line && !betKeys.has(b.key) && betLines.length < 3) { betKeys.add(b.key); betLines.push(b); } };
  for (const k of traits.items) {
    if (k.private) continue;
    if (k.kind === "tag") {
      const lt = tagLib[k.key.slice(4)];
      if (!quietTag(lt)) addBet({ kind: "tag", key: lt.id, from: k.keyword, line: voiced(lt, "bet", wording) });
    } else {
      const r = sheetRows.find((x) => x.key === k.axis);
      if (r) addBet({ kind: "stat", key: endKey(r), from: k.keyword, line: endLine(axisMeta[r.key], r, "Bet", wording) });
    }
  }
  for (const r of decidedAll) addBet({ kind: "stat", key: endKey(r), from: r.leadEnd, line: endLine(axisMeta[r.key], r, "Bet", wording) });
  const stakes = (L.article && L.article.bets && L.article.bets.stakes) || [];
  const bets = betLines.length ? {
    title: f("bets.title"), intro: f("bets.intro"),
    items: betLines.map((b, i) => ({ ...b, stake: stakes[i] ? (wording === "heart" ? stakes[i].heart : stakes[i].fun) : "" })),
  } : null;

  // ------------------------------------------------------------------ part two: your island seed (coming in 2.0)
  const seedWhat = voiced(relL, "seed", wording);
  const seedHow = voiced(lifeL, "seed", wording);
  const seed = seedWhat && seedHow ? {
    title: f("seed.title"), soon: f("seed.soon"), intro: f("seed.intro"), label: f("seed.label"), howLabel: f("seed.how"), hook: f("seed.hook"),
    what: seedWhat, how: seedHow,
  } : null;

  const parts = {
    one: { label: f("parts.one.label"), title: f("parts.one.title"), intro: f("parts.one.intro") },
    two: { label: f("parts.two.label"), title: f("parts.two.title"), intro: f("parts.two.intro") },
  };

  // ------------------------------------------------------------------ closing and the app
  const app = by.app;
  const closing = {
    line: f("closing"), foot: f("foot"),
    app: app ? { kicker: app.kicker, title: app.title, body: app.body, button: app.button, store: app.store, note: app.note, link: app.link } : null,
    challenge: party.challenge, share: share ? share.share : null,
  };

  const tabs = ARTICLE_TABS
    .filter((id) => ({ surprise, rooms, record, heist, flags, bets, seed }[id] !== null))
    .map((id) => ({ id, label: f(`tabs.${id}`) }));

  return {
    wording, voice: stories.voice, back: f("back"), readMore: f("readMore"), tabsLabel: f("tabs.label"), allSections: f("tabs.all"),
    tabs, parts, cover, stats, traits, surprise, rooms, record, heist, flags, bets, party, bio, seed, closing,
    tagLib, // for the owner-only mark on private traits
  };
}

// Every line a reader can see, for tests and the reading-time check (frames and claims alike).
export function articleText(A) {
  const out = [];
  const add = (...xs) => xs.forEach((x) => { if (typeof x === "string" && x.trim()) out.push(x); });
  const c = A.cover;
  add(c.masthead, c.readTime, c.dek, c.title.kicker, c.title.name, c.title.line, c.lifeRow.label, c.lifeRow.name);
  add(A.parts.one.label, A.parts.one.title, A.parts.one.intro, A.parts.two.label, A.parts.two.title, A.parts.two.intro);
  add(A.stats.title, A.stats.intro);
  for (const x of A.stats.all) add(x.abbr, x.name);
  for (const x of [A.stats.top, A.stats.dump]) if (x) add(x.label, x.name, x.line);
  add(A.traits.title, A.traits.intro);
  for (const k of A.traits.items) add(k.keyword, k.from, k.line, k.back);
  if (A.surprise) add(A.surprise.belief, A.surprise.behavior);
  if (A.rooms) { add(A.rooms.title, A.rooms.intro, A.rooms.quiet); for (const r of A.rooms.rows) add(r.room, r.line); if (A.rooms.flip) add(A.rooms.flip.title, A.rooms.flip.line); }
  if (A.record) { add(A.record.headline, A.record.intro, A.record.key); for (const r of A.record.rows) add(r.title, r.shown); }
  const h = A.heist;
  add(h.title, h.intro, h.yoursLabel, h.why, h.from, h.recruit); for (const r of h.roles) add(r.name, r.job);
  if (A.flags) add(A.flags.title, A.flags.intro, A.flags.green.label, A.flags.green.line, A.flags.green.from, A.flags.red.label, A.flags.red.line, A.flags.red.from);
  if (A.bets) { add(A.bets.title, A.bets.intro); for (const b of A.bets.items) add(b.stake, b.line, b.from); }
  const p = A.party;
  add(p.title, p.me.name, p.click && p.click.label, p.click && p.click.name, p.click && p.click.line, p.click && p.click.diff, p.opposite && p.opposite.label, p.opposite && p.opposite.name, p.opposite && p.opposite.line, p.opposite && p.opposite.diff, p.challenge, p.challengeSub, A.bio.text);
  if (A.seed) add(A.seed.title, A.seed.soon, A.seed.intro, A.seed.label, A.seed.what, A.seed.howLabel, A.seed.how, A.seed.hook);
  add(A.closing.line, A.closing.app && A.closing.app.title, A.closing.app && A.closing.app.body);
  return out;
}
