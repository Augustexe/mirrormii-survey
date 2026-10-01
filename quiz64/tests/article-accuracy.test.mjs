// Display accuracy for the Evidence Article (LAUNCH-SPEC section 25 item 3; the reveal-accuracy rule, extended):
// simulated players with known answer patterns play the real step machine, the real article renders on the server, and
// every name, drama stat, trait, room, flip, call and party slot is recomputed here from the player's own profile and
// the library, without going through article-data.js. Every visible line is a library line or a library frame; nothing
// quotes an answer, shows a percentage, a stray number (only the drama stat scores and Genii's calls count are
// allowed), an em dash or a never-say word. The 2026-09-30 cuts (the lede, the character sheet, your two results side
// by side, every strength has a flip side) stay cut.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionConfig } from "motion/react";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { makePlayer, playPicker } from "./persona-sim.mjs";
import { leaning } from "./persona-helpers.mjs";
import names64 from "../../research/persona-quiz-v2/final/naming/names-64.json" with { type: "json" };

// The one story line per archetype pair (names-64.json), read here straight from the naming package.
const PAIR_LINE = Object.fromEntries(names64.combos.map((c) => [c.key, c.line]));
const pairLine = (relCode, lifeCode, w) => { const l = PAIR_LINE[`${relCode}|${lifeCode}`]; return l ? (w === "heart" ? l.heart : l.fun) : null; };
// The heist role per day-to-day stat end, and the traits that never give a flag or a bet (AI use, kids, weddings).
const HEIST = { "L3+": "planner", "L2-": "planner", "L2+": "driver", "L1+": "inside", "L3-": "inside", "L1-": "distraction" };
const quiet = (t) => !t || t.locked18 || /^T03[AB]$/.test(t.id);

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  globalThis.document = { hidden: false };
});
test.after(async () => { delete globalThis.document; await server.close(); });

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const SETUP = { closest: "best_friend", pronoun: "she" };
const ROOMS = [["love", "work", "family"], ["love"], [], ["work", "family"]];
const LEANERS = {
  golden: { R1: 1, R2: -0.8, R3: -0.6, L1: 0.9, L2: -0.6, L3: 0.9 },
  wolf: { R1: -1, R2: 0.8, R3: -0.8, L1: -0.9, L2: -0.7, L3: -0.9 },
  glue: { R1: 0.9, R2: 0.8, R3: 0.9, L1: 0.8, L2: 0.9, L3: 0.8 },
  mixed: { R1: 0.05, R2: -0.9, R3: 0.9, L1: -0.8, L2: 0.9, L3: -0.1 },
  demo: { R1: 0.7, R2: -0.75, R3: -0.55, L1: 0.18, L2: 0.8, L3: -0.6 },
};

async function players() {
  const Session = await import("../src/persona/session.js");
  const { clock } = await import("./persona-helpers.mjs");
  const out = [];
  let k = 0;
  for (const [name, signs] of Object.entries(LEANERS)) {
    for (const voice of ["fun", "heart", "cards"]) {
      const choose = leaning(signs);
      let s = Session.chooseLobby(Session.startRun(Session.newRun({ now: clock(), runId: `art${name}${voice}` }), SETUP, { now: clock() }), { voice, depth: "anything", rooms: ROOMS[k++ % ROOMS.length] }, { now: clock() });
      for (let g = 0; g < 200; g++) {
        const step = Session.currentStep(s);
        if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
        if (step.kind !== "card") break;
        s = Session.answerCard(s, step.card.id, choose(step.card).value, { ms: 4200, now: clock() });
      }
      out.push({ label: `${name} ${voice}`, run: s, voice });
    }
  }
  // Players who lean one way everywhere except one room, where they lean the other way: the room where you flip.
  // (Found by search: in the chosen room the player answers only on one stat, the other way.)
  const B = { R1: 0.9, R2: -0.7, R3: -0.6, L1: 0.8, L2: 0.7, L3: -0.7 };
  const Z = { R1: 0, R2: 0, R3: 0, L1: 0, L2: 0, L3: 0 };
  const FLIPPERS = [
    { base: B, room: 5, local: { ...Z, L3: 0.7 }, id: "flipx5l3" },
    { base: B, room: 2, local: { ...Z, L2: -0.7 }, id: "flipx2l2" },
  ];
  for (const [i, f] of FLIPPERS.entries()) {
    const everywhere = leaning(f.base);
    const inRoom = leaning(f.local);
    const voice = "fun";
    let s = Session.chooseLobby(Session.startRun(Session.newRun({ now: clock(), runId: f.id }), SETUP, { now: clock() }), { voice, depth: "anything", rooms: ["love", "work", "family"] }, { now: clock() });
    for (let g = 0; g < 200; g++) {
      const step = Session.currentStep(s);
      if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
      if (step.kind !== "card") break;
      s = Session.answerCard(s, step.card.id, (step.card.chapter === f.room ? inRoom : everywhere)(step.card).value, { ms: 4200, now: clock() });
    }
    out.push({ label: `flipper ${i} ${voice}`, run: s, voice });
  }
  for (let i = 0; i < 8; i++) {
    const voice = i % 2 ? "heart" : "fun";
    const run = playPicker(SETUP, { voice, depth: "anything", rooms: ROOMS[i % ROOMS.length] }, makePlayer(`article${i}`, { noise: 0.25 }), `artsim${i}`);
    out.push({ label: `sim ${i} ${voice}`, run, voice });
  }
  return out;
}

// Recomputed here from the score, as in reveal-accuracy: pips from |norm| (cuts 0.25, 0.45, 0.65, 0.85), capped at
// three under three cards; the band picks the library's sheet line.
function pipsFor(a) {
  if (a.unfinished || a.flex) return 0;
  let pips = 1 + [0.25, 0.45, 0.65, 0.85].filter((c) => Math.min(1, Math.abs(a.norm)) >= c).length;
  if (a.cards < 3) pips = Math.min(pips, 3);
  return pips;
}
const bandOf = (pips) => (pips >= 4 ? "strong" : pips === 3 ? "clear" : "light");
function inVoice(entry, field, w) {
  if (!entry) return null;
  if (w === "heart" && entry.h && typeof entry.h[field] === "string") return entry.h[field];
  const v = entry[field];
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return w === "heart" ? v.heart || v.fun : v.fun;
  return null;
}
const FLIP = { We: "Me", Me: "We", Direct: "Soft", Soft: "Direct", Classic: "Own", Own: "Classic", Steady: "Venture", Venture: "Steady", Push: "Easy", Easy: "Push", Rules: "Context", Context: "Rules" };
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("every article line, name, drama stat, trait, room, flip, call, party slot, heist role, flag, bet and seed comes from the player's evidence", async () => {
  const { resultView } = await load("/src/persona/views.js");
  const Session = await load("/src/persona/session.js");
  const { LIB, S } = await load("/src/persona/kit.js");
  const { STATS } = await load("/src/persona/stats.js");
  const { STORY_COPY, UI_COPY } = await load("/src/persona/stories/story-data.js");
  const { buildArticle, articleText } = await load("/src/persona/article/article-data.js");
  const R = await load("/src/persona/rpg-stats.js");
  const { ArticlePage } = await load("/src/persona/article/ArticlePage.jsx");
  const axisMeta = Object.fromEntries(LIB.axes.map((a) => [a.id, a]));
  const tagLib = Object.fromEntries(LIB.tags.map((t) => [t.id, t]));
  const endName = (ax, pole) => STATS[ax].ends[pole];

  // Every string the library and the story copy hold, and every article frame as a pattern: the page may show nothing else.
  const libStrings = new Set();
  // A library line may be split in two on the page (the surprise: the belief, then the turn), so its parts count too.
  const walk = (o) => {
    if (typeof o === "string") { libStrings.add(o); const m = /^(.+?[.!?])\s+(\S.*)$/.exec(o.trim()); if (m) { libStrings.add(m[1]); libStrings.add(m[2]); } }
    else if (o && typeof o === "object") Object.values(o).forEach(walk);
  };
  walk(LIB); walk(STORY_COPY); walk(UI_COPY); walk(PAIR_LINE);
  Object.values(STATS).forEach((s) => { libStrings.add(s.stat); Object.values(s.ends).forEach((e) => libStrings.add(e)); });
  const frames = [];
  const walkFrames = (o) => { if (typeof o === "string") { if (o.includes("{")) frames.push(new RegExp(`^${esc(o).replace(/\\\{\w+\\\}/g, ".+")}$`)); } else if (o && typeof o === "object") Object.values(o).forEach(walkFrames); };
  walkFrames(LIB.article);
  const traced = (line) => libStrings.has(line) || frames.some((re) => re.test(line));

  const list = await players();
  let flips = 0, clicks = 0, hits = 0, statCores = 0, tagBacks = 0, tagFlags = 0, statBets = 0;
  const tops = new Set();
  const dumps = new Set();
  const roles = new Set();
  for (const { label, run, voice } of list) {
    const w = voice === "heart" ? "heart" : "fun";
    const { profile, sealed } = Session.resultFor(run);
    const P = profile.axes;
    const stories = resultView(run);
    const A = buildArticle({ stories, lib: LIB });
    const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" }, React.createElement(ArticlePage, { stories, lib: LIB, onBack() {}, onChallenge() {}, onData() {}, onSave() {} })));
    const text = visible(html);

    // 1. Names: one title (the people half whose poles match the profile) with its pair's story line; the day-to-day
    //    half as a labeled row under it.
    const rel = LIB.relationship.find((h) => h.R1 === P.R1.pole && h.R2 === P.R2.pole && h.R3 === P.R3.pole);
    const life = LIB.life.find((h) => h.L1 === P.L1.pole && h.L2 === P.L2.pole && h.L3 === P.L3.pole);
    assert.equal(A.cover.title.name, rel.name, `${label}: the title is the people archetype`);
    assert.equal(A.cover.title.line, pairLine(rel.code, life.code, w), `${label}: the title's story line`);
    assert.equal(A.cover.lifeRow.name, life.name, `${label}: the day-to-day row`);
    assert.ok(text.includes(`${A.cover.title.kicker} ${rel.name} ${A.cover.title.line}`), `${label}: title and line on the cover`);
    assert.ok(text.includes(life.name), `${label}: the day-to-day name on the page`);
    // The lede is merged into the cover: no restated read or description, no keyword chips.
    for (const line of [inVoice(rel, "read", w), inVoice(life, "read", w), inVoice(rel, "desc", w), inVoice(life, "desc", w)]) {
      if (line && line !== A.cover.title.line) assert.ok(!text.includes(line), `${label}: no restated read or description: ${line}`);
    }
    assert.doesNotMatch(html, /ea-lede|ea-covertags/, `${label}: no lede and no cover chips`);

    // 2. The drama stat block: all six recomputed from the profile, in order, scores 1 to 20; the top stat line and
    //    the dump stat line (the lowest stat) in voice. The old character sheet never renders.
    const six = R.dramaStats(profile);
    assert.deepEqual(A.stats.all.map((x) => [x.abbr, x.score]), six.map((x) => [x.abbr, x.score]), `${label}: the stat block`);
    const statsHtml = html.slice(html.indexOf('<section id="stats"'), html.indexOf("</section>", html.indexOf('<section id="stats"')));
    for (const x of six) {
      assert.ok(x.score >= 1 && x.score <= 20 && Number.isInteger(x.score), `${label}: ${x.id} in range`);
      assert.ok(visible(statsHtml).includes(`${x.name}, ${x.score}`), `${label}: ${x.name} ${x.score} on the page`);
    }
    const hi = six.slice().sort((x, y) => y.score - x.score || y.raw - x.raw || x.order - y.order)[0];
    const lo = six.slice().sort((x, y) => x.score - y.score || x.raw - y.raw || y.order - x.order)[0];
    assert.equal(A.stats.top.id, hi.id, `${label}: top stat`);
    assert.equal(A.stats.dump.id, lo.id, `${label}: dump stat`);
    assert.equal(A.stats.top.line, inVoice(LIB.drama.stats[hi.id], "top", w), `${label}: top stat line`);
    assert.equal(A.stats.dump.line, inVoice(LIB.drama.stats[lo.id], "dump", w), `${label}: dump stat line`);
    assert.ok(text.includes(A.stats.top.line) && text.includes(A.stats.dump.line), `${label}: both lines on the page`);
    tops.add(hi.id); dumps.add(lo.id);
    assert.doesNotMatch(html, /class="ea-stat\b|ea-drawer|ea-pips/, `${label}: no character sheet`);
    for (const n of ["Closeness", "Hard truths", "Traditions", "New things", "Pace"]) assert.ok(!text.includes(n), `${label}: ${n} retired`);
    // The six leans behind the traits, the flip and part two (internal).
    const rows = stories.slides.find((s) => s.id === "map").groups.flatMap((g) => g.rows);
    const sheetOf = (meta) => (w === "heart" && meta.h && meta.h.sheet ? meta.h.sheet : meta.sheet);

    // 3. Core traits: the story's core, each with its source; the back of a tag card is that tag's own heart line,
    //    the back of a stat card is that stat end's own finding.
    const storyCore = stories.slides.find((s) => s.id === "traits").core;
    assert.deepEqual(A.traits.items.map((k) => k.keyword), storyCore.map((k) => k.keyword), `${label}: the same core traits`);
    for (const k of A.traits.items) {
      if (k.kind === "tag") {
        const tag = k.key.slice(4);
        assert.ok(profile.shownTags.includes(tag), `${label}: ${k.keyword} is a shown trait`);
        assert.equal(k.from, tagLib[tag].name, `${label}: ${k.keyword} comes from its trait`);
        assert.equal(k.line, inVoice(tagLib[tag], "line", w));
        if (k.back) { assert.equal(k.back, inVoice(tagLib[tag], "heart", w), `${label}: ${k.keyword} heart line`); tagBacks++; }
      } else {
        const a = P[k.axis];
        assert.ok(!a.flex && !a.unfinished, `${label}: ${k.keyword} from a decided stat`);
        assert.ok(k.from.includes(endName(k.axis, a.pole > 0 ? axisMeta[k.axis].plus : axisMeta[k.axis].minus)), `${label}: ${k.keyword} names its stat end`);
        assert.equal(k.line, inVoice(axisMeta[k.axis], a.pole > 0 ? "plusKnow" : "minusKnow", w), `${label}: ${k.keyword} reads its stat end's finding`);
        const meta = axisMeta[k.axis];
        const otherLine = sheetOf(meta)[a.pole > 0 ? "minus" : "plus"][bandOf(pipsFor(a))];
        if (k.back) assert.equal(k.back, otherLine, `${label}: ${k.keyword} turns over to the other end`);
        if (k.back) assert.equal(k.backName, endName(k.axis, a.pole > 0 ? meta.minus : meta.plus));
        statCores++;
      }
      assert.ok(text.includes(k.keyword), `${label}: ${k.keyword} on the page`);
    }

    // 4. Rooms and the room where you flip: each room line recomputed from that chapter's answers; a flip only where
    //    the room leans against the overall end, and its sentence names both ends.
    if (A.rooms) {
      const storyRooms = stories.slides.find((s) => s.id === "rooms").rows;
      assert.deepEqual(A.rooms.rows.map((r) => r.line), storyRooms.map((r) => r.line), `${label}: room lines`);
      for (const r of storyRooms.filter((x) => x.kind === "axis")) {
        const chapterOf = (id) => (S.cardById[id] ? S.cardById[id].chapter : null);
        const ev = P[r.axis].evidence.filter((e) => chapterOf(e.card) === r.chapter && e.w > 0);
        const sum = ev.reduce((t, e) => t + e.w * e.v, 0);
        assert.equal(Math.sign(sum), r.sign, `${label}: room ${r.chapter} lean from its own answers`);
      }
      const f = A.rooms.flip;
      const want = storyRooms.find((r) => r.kind === "axis" && r.differs && !P[r.axis].flex && !P[r.axis].unfinished);
      if (!want) assert.equal(f, null, `${label}: no flip without a room that leans the other way`);
      else {
        flips++;
        const overall = endName(want.axis, P[want.axis].pole > 0 ? axisMeta[want.axis].plus : axisMeta[want.axis].minus);
        const roomEnd = endName(want.axis, want.sign > 0 ? axisMeta[want.axis].plus : axisMeta[want.axis].minus);
        assert.notEqual(overall, roomEnd);
        assert.equal(f.chapter, want.chapter);
        const lowerLine = f.line.toLowerCase();
        assert.ok(lowerLine.includes(overall.toLowerCase()) && lowerLine.includes(roomEnd.toLowerCase()) && f.line.includes(want.room), `${label}: flip sentence names ${overall}, ${roomEnd} and ${want.room}`);
        assert.ok(text.includes(f.line), `${label}: the flip is on the page`);
      }
    }

    // 5. Cut on 2026-09-30: your two results side by side and every strength has a flip side.
    assert.equal(A.sides, undefined, `${label}: no two-sides model`);
    assert.equal(A.book, undefined, `${label}: no flip-sides model`);
    assert.doesNotMatch(html, /id="(sides|book)"|ea-cell|ea-stings|ea-said/, `${label}: no two sides, no flip sides`);
    for (const f of [LIB.article.sides.title, LIB.article.sides.intro, LIB.article.book.intro, LIB.article.sheet.title, LIB.article.sheet.intro]) assert.ok(!text.includes(f[w]), `${label}: cut frame "${f[w]}"`);

    // 6. The record: Genii's calls in play order, statuses and the one count straight from the sealed check.
    if (A.record) {
      assert.deepEqual(A.record.rows.map((r) => r.status), sealed.rows.map((r) => r.status), `${label}: call statuses in play order`);
      const exact = sealed.rows.filter((r) => r.status === "hit").length;
      assert.equal(A.record.exact, exact);
      hits += exact;
      assert.match(text, new RegExp(`\\b${exact} of ${A.record.called}\\b`), `${label}: the count`);
      for (const r of A.record.rows) assert.ok(r.title && text.includes(r.title), `${label}: scene title ${r.title}`);
    }

    // 7. Party: every slot is one title with its pair's line. Click with is your people half with its people stat
    //    closest to the middle flipped (a near-even stat first, the one nearest dead center; else the weakest lean);
    //    your opposite is every pole flipped.
    const posOf = (a) => Math.round(Math.max(8, Math.min(92, Math.max(43, Math.min(57, 50 + Math.max(-1, Math.min(1, a.norm)) * 42)))));
    const peopleAx = ["R1", "R2", "R3"].map((ax, i) => ({ ax, i, a: P[ax] })).filter((x) => !x.a.unfinished);
    const flexAx = peopleAx.filter((x) => x.a.flex).sort((x, y) => Math.abs(posOf(x.a) - 50) - Math.abs(posOf(y.a) - 50) || x.i - y.i);
    const leanAx = peopleAx.filter((x) => !x.a.flex).sort((x, y) => pipsFor(x.a) - pipsFor(y.a) || Math.abs(x.a.norm) - Math.abs(y.a.norm) || x.i - y.i);
    const softAx = (flexAx[0] || leanAx[0] || {}).ax;
    if (softAx) {
      const idx = Number(softAx[1]) - 1;
      const code = rel.code.split("·").map((x, i) => (i === idx ? FLIP[x] : x)).join("·");
      const name = LIB.relationship.find((x) => x.code === code).name;
      assert.equal(A.party.click.name, name, `${label}: click with`);
      assert.equal(A.party.click.line, pairLine(code, life.code, w), `${label}: click with line`);
      assert.ok(text.includes(name), `${label}: click with on the page`);
      clicks++;
    } else assert.equal(A.party.click, null);
    const oppCode = rel.code.split("·").map((p) => FLIP[p]).join("·");
    const oppLife = life.code.split("·").map((p) => FLIP[p]).join("·");
    assert.equal(A.party.opposite.name, LIB.relationship.find((x) => x.code === oppCode).name, `${label}: opposite`);
    assert.equal(A.party.opposite.line, pairLine(oppCode, oppLife, w), `${label}: opposite line`);
    assert.equal(A.party.me.line, undefined, `${label}: your slot does not repeat the cover line`);

    // 8. The bio: the title and up to three shareable core traits; never a sting or a private trait.
    const shareable = storyCore.filter((k) => !k.private).map((k) => k.keyword);
    assert.ok(A.bio.text.startsWith(`${rel.name}.`), `${label}: bio title`);
    for (const k of storyCore.filter((x) => x.private)) assert.ok(!A.bio.text.toLowerCase().includes(k.keyword.toLowerCase()), `${label}: private trait off the bio`);
    for (const k of shareable.slice(0, 3)) assert.ok(A.bio.text.toLowerCase().includes(k.toLowerCase()), `${label}: bio carries ${k}`);

    // 8b. Part two, new sections (V2). Decided stats strongest first: most pips, then the lean, then sheet order.
    const strongest = (ids) => ids.filter((ax) => !P[ax].flex && !P[ax].unfinished)
      .map((ax, i) => ({ ax, i, pips: pipsFor(P[ax]), n: Math.abs(P[ax].norm) }))
      .sort((x, y) => y.pips - x.pips || y.n - x.n || x.i - y.i)
      .map((x) => `${x.ax}${P[x.ax].pole > 0 ? "+" : "-"}`);
    const endText = (key, field) => inVoice(axisMeta[key.slice(0, 2)], `${key.endsWith("+") ? "plus" : "minus"}${field}`, w);
    // The heist role: the strongest decided day-to-day end, else the day-to-day half's pole on New things.
    const hEnd = strongest(["L1", "L2", "L3"])[0] || (life.L1 > 0 ? "L1+" : "L1-");
    assert.equal(A.heist.role, HEIST[hEnd], `${label}: heist role`);
    assert.equal(A.heist.why, inVoice(LIB.article.heist.why, hEnd, w), `${label}: heist why line`);
    assert.ok(text.includes(A.heist.why), `${label}: heist why on the page`);
    roles.add(A.heist.role);
    // Flags: green from the first shareable trait, red from the second (or the first); else from the strongest ends.
    const shownTags = stories.slides.find((s) => s.id === "traits").tags.filter((t) => !t.private && !quiet(tagLib[t.key]));
    if (shownTags.length) {
      assert.equal(A.flags.green.line, inVoice(tagLib[shownTags[0].key], "green", w), `${label}: green flag`);
      assert.equal(A.flags.red.line, inVoice(tagLib[(shownTags[1] || shownTags[0]).key], "red", w), `${label}: red flag`);
      tagFlags++;
    } else {
      const ends = strongest(["R1", "R2", "R3", "L1", "L2", "L3"]);
      if (ends.length) {
        assert.equal(A.flags.green.line, endText(ends[0], "Green"), `${label}: green flag from a stat end`);
        assert.equal(A.flags.red.line, endText(ends[1] || ends[0], "Red"), `${label}: red flag from a stat end`);
      } else assert.equal(A.flags, null);
    }
    for (const t of stories.slides.find((s) => s.id === "traits").tags.filter((x) => x.private || quiet(tagLib[x.key]))) {
      for (const field of ["green", "red", "bet"]) for (const v of ["fun", "heart"]) {
        const line = v === "heart" ? (tagLib[t.key].h || {})[field] : tagLib[t.key][field];
        if (line) assert.ok(!text.includes(line), `${label}: no ${field} from ${t.key}`);
      }
    }
    // Genii's bets: the shareable core traits in order, topped up from the strongest ends, three at most, no repeats.
    const wantBets = [];
    const seenBet = new Set();
    const addBet = (key, line) => { if (line && !seenBet.has(key) && wantBets.length < 3) { seenBet.add(key); wantBets.push(line); } };
    for (const k of storyCore.filter((x) => !x.private)) {
      if (k.kind === "tag") { const lt = tagLib[k.key.slice(4)]; if (!quiet(lt)) addBet(lt.id, inVoice(lt, "bet", w)); }
      else { const key = `${k.axis}${P[k.axis].pole > 0 ? "+" : "-"}`; addBet(key, endText(key, "Bet")); statBets++; }
    }
    for (const key of strongest(["R1", "R2", "R3", "L1", "L2", "L3"])) addBet(key, endText(key, "Bet"));
    assert.deepEqual(A.bets ? A.bets.items.map((b) => b.line) : [], wantBets, `${label}: Genii's bets`);
    for (const b of wantBets) assert.ok(text.includes(b), `${label}: bet on the page`);
    // The island seed: what grows from the people half, how it grows from the day-to-day half; labeled as 2.0.
    assert.equal(A.seed.what, inVoice(rel, "seed", w), `${label}: seed`);
    assert.equal(A.seed.how, inVoice(life, "seed", w), `${label}: seed growth`);
    assert.ok(text.includes(A.seed.soon) && /MirrorMii 2\.0/.test(A.seed.soon), `${label}: the seed says it is coming in 2.0`);

    // 9. Every visible line traces to the library or an article frame.
    for (const line of articleText(A)) {
      if (line === A.bio.text || /^[A-Z][\w' -]+$/.test(line) && line.length < 40 && text.includes(line)) continue;
      assert.ok(traced(line), `${label}: untraced line: ${line}`);
    }

    // 10. Voice and safety rules on everything rendered.
    const said = [];
    for (const [id, value] of Object.entries(run.answers)) {
      const card = S.cardById[id];
      if (!card || typeof value === "string") continue;
      for (const i of [].concat(value)) if (card.options[i] && card.options[i].t.length >= 16) said.push(card.options[i].t);
    }
    for (const t of said) assert.ok(!text.includes(t), `${label}: quoted answer: ${t}`);
    assert.doesNotMatch(text, /%|\bpercent/i, `${label}: no percentage`);
    assert.doesNotMatch(text, /—/, `${label}: no em dash`);
    assert.doesNotMatch(text, /\b(streaks?|gacha|lottery|jackpot|predicts?|predicted|clinically|diagnos\w*|treat(ment|ed|ing|s)?|cures?|prevent\w*|genies?|lamps?)\b/i, `${label}: never-say`);
    assert.doesNotMatch(text, /energy\b|You'd say|Last time, you|Only you see this/i, `${label}: voice rules`);
    // Scene titles name a card's scene ("The dating profile"), not the page's mechanics; the footer holds "Your data".
    let body = visible(html.replace(/<footer[\s\S]*<\/footer>/, ""));
    for (const r of A.record ? A.record.rows : []) body = body.split(r.title).join(" ");
    // The trait card's own label ("Based on", the cold-reader pick in LAUNCH-SPEC 26) names the card's source, not an analysis.
    body = body.split(A.traits.fromLabel).join(" ");
    assert.doesNotMatch(body, /(?<!keep(?:ing|s)? )\bscore\b|\b(analysis|result|profile|evidence|axis|based on|indicates)\b/i, `${label}: no system words ("keeping score" is an idiom)`);
    // The one count, the drama stat scores (in the stat block only) and the version label on the island seed
    // ("Coming in MirrorMii 2.0").
    let digits = body.replace(new RegExp(`\\b${A.record ? A.record.exact : "x"} of ${A.record ? A.record.called : "x"}\\b`), "").split("MirrorMii 2.0").join(" ");
    const block = visible(statsHtml);
    digits = digits.split(block).join(" ");
    let blockDigits = block;
    for (const x of six) blockDigits = blockDigits.split(`, ${x.score}`).join(" ").split(` ${x.score} `).join(" ");
    assert.doesNotMatch(blockDigits, /\d/, `${label}: the stat block shows only the scores`);
    assert.doesNotMatch(digits, /\d/, `${label}: no numbers but the calls count and the stat scores`);
    for (const id of ["stats", "traits", "rooms", "heist", "party", "seed"]) assert.match(html, new RegExp(`id="${id}"`), `${label}: section ${id}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${label}: one h1`);

    // 11. Reading time: about six minutes of visible words at most (V2 added part two; the cover says six minutes).
    const words = articleText(A).join(" ").split(/\s+/).length;
    assert.ok(words >= 450 && words <= 1400, `${label}: ${words} words`);
  }
  assert.ok(flips >= 1, `a room flip exercised (${flips})`);
  assert.ok(tops.size >= 3 && dumps.size >= 3, `several top and dump stats exercised (${[...tops]}; ${[...dumps]})`);
  assert.ok(clicks >= 5 && hits >= 10 && statCores >= 10 && tagBacks >= 5, `party, calls and cards exercised (${clicks}, ${hits}, ${statCores}, ${tagBacks})`);
  assert.ok(roles.size >= 3 && tagFlags >= 10 && statBets >= 5, `heist roles, trait flags and stat bets exercised (${[...roles]}, ${tagFlags}, ${statBets})`);
});

test("the crossover table: 36 cells, both voices, and every player gets a team and a clash", async () => {
  const { LIB } = await load("/src/persona/kit.js");
  const X = LIB.crossover;
  const keys = [];
  for (const p of ["R1", "R2", "R3"]) for (const ps of ["+", "-"]) for (const l of ["L1", "L2", "L3"]) for (const ls of ["+", "-"]) keys.push(`${p}${ps}|${l}${ls}`);
  assert.deepEqual(Object.keys(X).sort(), keys.sort());
  for (const k of keys) {
    assert.ok(["team", "clash"].includes(X[k].type), k);
    for (const v of ["fun", "heart"]) {
      assert.ok(X[k][v] && X[k][v].length > 40, `${k} ${v}`);
      assert.doesNotMatch(X[k][v], /—|\d|%|energy\b|streak|predict|diagnos/i, `${k} ${v}`);
      for (const s of X[k][v].split(/(?<=[.?!])\s+/)) assert.ok(s.split(/\s+/).length <= 22, `${k} ${v}: sentence too long: ${s}`);
    }
    assert.notEqual(X[k].fun, X[k].heart, `${k}: two voices`);
  }
  for (let p = 0; p < 8; p++) for (let l = 0; l < 8; l++) {
    const pe = [0, 1, 2].map((i) => `R${i + 1}${(p >> i) & 1 ? "+" : "-"}`);
    const le = [0, 1, 2].map((i) => `L${i + 1}${(l >> i) & 1 ? "+" : "-"}`);
    const types = new Set(pe.flatMap((a) => le.map((b) => X[`${a}|${b}`].type)));
    assert.equal(types.size, 2, `${pe.join(" ")} x ${le.join(" ")} gets both a team and a clash`);
  }
  for (const [k, v] of Object.entries(LIB.article)) {
    const walk = (o, at) => { if (typeof o === "string") assert.doesNotMatch(o, /—|%|streak|predict|energy\b/i, at); else Object.entries(o).forEach(([kk, vv]) => walk(vv, `${at}.${kk}`)); };
    walk(v, k);
    const both = (o, at) => { if (o && typeof o === "object" && ("fun" in o || "heart" in o)) assert.ok(o.fun && o.heart, `${at}: both voices`); else if (o && typeof o === "object") Object.entries(o).forEach(([kk, vv]) => both(vv, `${at}.${kk}`)); };
    both(v, k);
  }
});

test("the article renders in both voices, with its tabs, one h1 and every section", async () => {
  const { resultView } = await load("/src/persona/views.js");
  const { LIB } = await load("/src/persona/kit.js");
  const { ArticlePage } = await load("/src/persona/article/ArticlePage.jsx");
  const { ADULT, completeRun } = await import("./persona-helpers.mjs");
  for (const voice of ["fun", "heart"]) {
    const run = completeRun(ADULT, leaning(LEANERS.demo), `artrender${voice}`, { voice, depth: "anything", rooms: ["love", "work", "family"] });
    const stories = resultView(run);
    const html = renderToStaticMarkup(React.createElement(ArticlePage, { stories, lib: LIB, onBack() {}, onChallenge() {}, onData() {}, onSave() {} }));
    for (const id of ["stats", "rooms", "surprise", "traits", "record", "heist", "flags", "bets", "party", "seed"]) {
      assert.match(html, new RegExp(`href="#article/${id}"`), `${voice}: tab ${id}`);
      assert.match(html, new RegExp(`<section id="${id}"`), `${voice}: section ${id}`);
    }
    for (const id of ["book", "sides"]) assert.doesNotMatch(html, new RegExp(`#article/${id}"|<section id="${id}"`), `${voice}: ${id} is cut`);
    // V2: spot art from the article set, one sky band on the cover, no banner photos.
    assert.match(html, /assets\/article\/cover-band-/, `${voice}: the sky band on the cover`);
    assert.match(html, /assets\/article\/room-(phone|friends|love|money|work|home|play)-/, `${voice}: the room islets on the map`);
    for (const art of ["stats-crystal", "insight-shard", "record-quill", "heist-(planner|driver|inside|distraction)", "flags-pair", "bets-chips", "island-seed", "closing-mirror", "divider"]) {
      assert.match(html, new RegExp(`assets/article/${art}-`), `${voice}: spot art ${art}`);
    }
    assert.doesNotMatch(html, /assets\/island\/hero-|assets\/island\/mirror-inside-/, `${voice}: no banner photos`);
    assert.doesNotMatch(html, /ea-spot--ph/, `${voice}: every piece of art is a real file`);
    assert.doesNotMatch(html, /assets\/world\//, `${voice}: nothing from the retired world folder`);
    assert.match(html, /class="genii-light/, `${voice}: our own 3D Genii`);
    assert.match(visible(html), new RegExp(esc(LIB.article.readTime[voice === "heart" ? "heart" : "fun"])));
    // Scroll is never hijacked: no wheel or touch handlers and no scrollIntoView outside the tab tap.
    assert.doesNotMatch(html, /onwheel|ontouchmove/i);
  }
  const fs = await import("node:fs");
  const src = fs.readFileSync(fileURLToPath(new URL("../src/persona/article/ArticlePage.jsx", import.meta.url)), "utf8");
  const calls = [...src.matchAll(/scrollIntoView\(/g)].length;
  assert.equal(calls, 2, "scrollIntoView only on a tab tap and on opening a deep link");
  assert.doesNotMatch(src, /addEventListener\(["'](scroll|wheel|touchmove)/, "no scroll, wheel or touch listeners");
  assert.match(src, /ul\.scrollTo\(/, "the tab strip scrolls itself");
});

test("the V2 copy: flags, bets, heist lines and seeds in both voices, never-say clean, never about AI, kids or weddings", async () => {
  const { LIB } = await load("/src/persona/kit.js");
  const NEVER = /\b(streaks?|gacha|lottery|jackpot|predicts?|predicted|clinically|diagnos\w*|treat(ment|ed|ing|s)?|cures?|prevent\w*|dna|genomic|genies?|lamps?|wish(es|ed)?|energy)\b|—|%/i;
  const HEART = /\b(boundaries|valid|healing|trauma|toxic|self-care|kind|brave|healthy|mature|selfish|responsible)\b|!/i;
  const lines = [];
  const both = (fun, heart, at) => {
    assert.ok(typeof fun === "string" && fun.length > 10 && typeof heart === "string" && heart.length > 10, `${at}: both voices`);
    assert.notEqual(fun, heart, `${at}: two voices`);
    lines.push([fun, "fun", at], [heart, "heart", at]);
  };
  for (const t of LIB.tags) {
    const quietTag = t.locked18 || /^T03[AB]$/.test(t.id);
    for (const f of ["green", "red", "bet"]) {
      if (quietTag) assert.ok(!t[f] && !(t.h || {})[f], `${t.id}: no ${f} on an AI, kids or wedding trait`);
      else both(t[f], (t.h || {})[f], `${t.id}.${f}`);
    }
  }
  for (const a of LIB.axes) for (const s of ["plus", "minus"]) for (const f of ["Green", "Red", "Bet"]) both(a[s + f], a.h[s + f], `${a.id}.${s}${f}`);
  for (const x of [...LIB.relationship, ...LIB.life]) both(x.seed, x.h.seed, `${x.code}.seed`);
  for (const [k, v] of Object.entries(LIB.article.heist.why)) both(v.fun, v.heart, `heist.why.${k}`);
  for (const [k, v] of Object.entries(LIB.article.heist.roles)) both(v.job.fun, v.job.heart, `heist.${k}.job`);
  assert.deepEqual(Object.keys(LIB.article.heist.why).sort(), ["L1+", "L1-", "L2+", "L2-", "L3+", "L3-"]);
  for (const [line, voice, at] of lines) {
    assert.doesNotMatch(line, NEVER, `${at} ${voice}: never-say`);
    assert.doesNotMatch(line, /\d/, `${at} ${voice}: no numbers`);
    assert.doesNotMatch(line, /\bwith \w+ energy\b|You'd say|Last time, you/i, `${at} ${voice}: voice rules`);
    assert.doesNotMatch(line, /\b(AI|kids?|children|wedding|married|marriage)\b/, `${at} ${voice}: never about AI, kids or weddings`);
    if (voice === "heart") assert.doesNotMatch(line, HEART, `${at} heart: no therapy or grading words, no exclamation`);
    assert.ok(line.split(/\s+/).length <= 26, `${at} ${voice}: one line, not a paragraph`);
  }
  assert.ok(lines.length >= 380, `${lines.length} lines checked`);
});

// No squiggly type (Jerry, 2026-09-30): the Stories deck, its saved images and the article set upright type only
// (Fraunces and Figtree, roman weights); no italic, no Fraunces WONK axis, no italic display token.
test("upright type only in the Stories deck, its images and the article", async () => {
  const fs = await import("node:fs");
  const read = (p) => fs.readFileSync(fileURLToPath(new URL(`../src/${p}`, import.meta.url)), "utf8");
  for (const p of ["persona/reveal/reveal.css", "persona/reveal/craft.css", "persona/stories/sheet-screens.css", "persona/article/article.css"]) {
    const css = read(p).replace(/\/\*[\s\S]*?\*\//g, "");
    assert.doesNotMatch(css, /italic|oblique|"WONK" 1|--font-display-italic/, `${p}: upright only`);
  }
  const img = read("persona/share-image.js");
  assert.doesNotMatch(img, /italic: true|`italic /, "share images: upright only");
  for (const p of ["persona/stories/SheetScreens.jsx", "persona/stories/StoryScreens.jsx", "persona/article/ArticleSections.jsx"]) {
    assert.doesNotMatch(read(p), /<(i|em|q|cite)>\{/, `${p}: no italic elements around copy`);
  }
});
