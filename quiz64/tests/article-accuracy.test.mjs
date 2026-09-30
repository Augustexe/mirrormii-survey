// Display accuracy for the Evidence Article (LAUNCH-SPEC section 25 item 3; the reveal-accuracy rule, extended):
// simulated players with known answer patterns play the real step machine, the real article renders on the server, and
// every name, stat, trait, room, flip, two-sides cell, call and party slot is recomputed here from the player's own
// profile and the library, without going through article-data.js. Every visible line is a library line or a library
// frame; nothing quotes an answer, shows a percentage, a stray number, an em dash or a never-say word.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionConfig } from "motion/react";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { makePlayer, playPicker } from "./persona-sim.mjs";
import { leaning } from "./persona-helpers.mjs";

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

test("every article line, name, stat, trait, room, flip, two-sides cell, call and party slot comes from the player's evidence", async () => {
  const { resultView } = await load("/src/persona/views.js");
  const Session = await load("/src/persona/session.js");
  const { LIB, S } = await load("/src/persona/kit.js");
  const { STATS } = await load("/src/persona/stats.js");
  const { STORY_COPY, UI_COPY } = await load("/src/persona/stories/story-data.js");
  const { buildArticle, articleText } = await load("/src/persona/article/article-data.js");
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
  walk(LIB); walk(STORY_COPY); walk(UI_COPY);
  Object.values(STATS).forEach((s) => { libStrings.add(s.stat); Object.values(s.ends).forEach((e) => libStrings.add(e)); });
  const frames = [];
  const walkFrames = (o) => { if (typeof o === "string") { if (o.includes("{")) frames.push(new RegExp(`^${esc(o).replace(/\\\{\w+\\\}/g, ".+")}$`)); } else if (o && typeof o === "object") Object.values(o).forEach(walkFrames); };
  walkFrames(LIB.article);
  const traced = (line) => libStrings.has(line) || frames.some((re) => re.test(line));

  const list = await players();
  let flips = 0, cells = 0, clicks = 0, hits = 0, statCores = 0, tagBacks = 0;
  const seenPairs = new Set();
  for (const { label, run, voice } of list) {
    const w = voice === "heart" ? "heart" : "fun";
    const { profile, sealed } = Session.resultFor(run);
    const P = profile.axes;
    const stories = resultView(run);
    const A = buildArticle({ stories, lib: LIB });
    const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" }, React.createElement(ArticlePage, { stories, lib: LIB, onBack() {}, onChallenge() {}, onData() {}, onSave() {} })));
    const text = visible(html);

    // 1. Names: the halves whose poles match the profile, set on the cover.
    const rel = LIB.relationship.find((h) => h.R1 === P.R1.pole && h.R2 === P.R2.pole && h.R3 === P.R3.pole);
    const life = LIB.life.find((h) => h.L1 === P.L1.pole && h.L2 === P.L2.pole && h.L3 === P.L3.pole);
    assert.equal(A.cover.people.name, rel.name, `${label}: people name`);
    assert.equal(A.cover.life.name, life.name, `${label}: life name`);
    assert.ok(text.includes(rel.name) && text.includes(life.name), `${label}: both names on the page`);
    assert.equal(A.cover.people.read, inVoice(rel, "read", w), `${label}: people read`);
    assert.equal(A.cover.life.desc, inVoice(life, "desc", w), `${label}: life description`);

    // 2. Stats: your end from the scored pole, pips and line from the score, the other end's line at the same band.
    const rows = A.sheet.groups.flatMap((g) => g.rows);
    assert.deepEqual(rows.map((r) => r.key), ["R1", "R2", "R3", "L1", "L2", "L3"]);
    for (const r of rows) {
      const a = P[r.key];
      const meta = axisMeta[r.key];
      assert.equal(r.flex, Boolean(a.flex), `${label}: ${r.key} flex`);
      if (a.flex || a.unfinished) { assert.equal(r.otherLine, null, `${label}: ${r.key} no other end without a lean`); continue; }
      const pole = a.pole > 0 ? meta.plus : meta.minus;
      assert.equal(r.leadEnd, endName(r.key, pole), `${label}: ${r.key} end`);
      assert.equal(r.pips, pipsFor(a), `${label}: ${r.key} pips`);
      const sh = w === "heart" && meta.h && meta.h.sheet ? meta.h.sheet : meta.sheet;
      assert.equal(r.note, sh[a.pole > 0 ? "plus" : "minus"][bandOf(r.pips)], `${label}: ${r.key} your line`);
      assert.equal(r.otherEnd, endName(r.key, a.pole > 0 ? meta.minus : meta.plus), `${label}: ${r.key} other end`);
      assert.equal(r.otherLine, sh[a.pole > 0 ? "minus" : "plus"][bandOf(r.pips)], `${label}: ${r.key} other end's line at the same level`);
      if (r.know) assert.equal(r.know, inVoice(meta, a.pole > 0 ? "plusKnow" : "minusKnow", w), `${label}: ${r.key} what Genii knows`);
    }

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
        assert.ok(k.from.includes(STATS[k.axis].stat) && k.from.includes(endName(k.axis, a.pole > 0 ? axisMeta[k.axis].plus : axisMeta[k.axis].minus)), `${label}: ${k.keyword} names its stat end`);
        assert.equal(k.line, inVoice(axisMeta[k.axis], a.pole > 0 ? "plusKnow" : "minusKnow", w), `${label}: ${k.keyword} reads its stat end's finding`);
        assert.ok(!rows.some((r) => r.note === k.line), `${label}: ${k.keyword} never repeats a sheet line`);
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
        assert.ok(f.line.includes(overall) && f.line.includes(roomEnd) && f.line.includes(want.room), `${label}: flip sentence names ${overall}, ${roomEnd} and ${want.room}`);
        assert.ok(text.includes(f.line), `${label}: the flip is on the page`);
      }
    }

    // 5. Two sides at one table: every decided people end crossed with every decided life end, strongest first;
    //    the first team cell and the first clash cell.
    const decided = (ids) => ids.filter((ax) => !P[ax].flex && !P[ax].unfinished)
      .map((ax, i) => ({ ax, i, pips: pipsFor(P[ax]), n: Math.abs(P[ax].norm) }))
      .sort((x, y) => y.pips - x.pips || y.n - x.n || x.i - y.i);
    const ppl = decided(["R1", "R2", "R3"]);
    const lf = decided(["L1", "L2", "L3"]);
    const pairs = [];
    ppl.forEach((p, i) => lf.forEach((l, j) => pairs.push({ p, l, rank: i + j, i })));
    pairs.sort((x, y) => x.rank - y.rank || x.i - y.i);
    const want = {};
    for (const { p, l } of pairs) {
      const key = `${p.ax}${P[p.ax].pole > 0 ? "+" : "-"}|${l.ax}${P[l.ax].pole > 0 ? "+" : "-"}`;
      const cell = LIB.crossover[key];
      if (cell && !want[cell.type]) want[cell.type] = { key, line: w === "heart" ? cell.heart : cell.fun };
    }
    const got = A.sides ? A.sides.cells : [];
    assert.deepEqual(got.map((c) => [c.type, c.key, c.line]), ["team", "clash"].filter((t) => want[t]).map((t) => [t, want[t].key, want[t].line]), `${label}: two-sides cells`);
    for (const c of got) { assert.ok(text.includes(c.line), `${label}: ${c.type} cell on the page`); cells++; seenPairs.add(c.key); }

    // 6. The record: Genii's calls in play order, statuses and the one count straight from the sealed check.
    if (A.record) {
      assert.deepEqual(A.record.rows.map((r) => r.status), sealed.rows.map((r) => r.status), `${label}: call statuses in play order`);
      const exact = sealed.rows.filter((r) => r.status === "hit").length;
      assert.equal(A.record.exact, exact);
      hits += exact;
      assert.match(text, new RegExp(`\\b${exact} of ${A.record.called}\\b`), `${label}: the count`);
      for (const r of A.record.rows) assert.ok(r.title && text.includes(r.title), `${label}: scene title ${r.title}`);
    }

    // 7. Party: click with is the wild card flipped inside its half; your opposite is every pole flipped.
    const wild = stories.slides.find((s) => s.id === "map").wild;
    if (wild) {
      const onLife = wild.key[0] === "L";
      const half = onLife ? life : rel;
      const idx = Number(wild.key[1]) - 1;
      const code = half.code.split("·").map((x, i) => (i === idx ? FLIP[x] : x)).join("·");
      const name = (onLife ? LIB.life : LIB.relationship).find((x) => x.code === code).name;
      assert.equal(A.party.click.name, name, `${label}: click with`);
      assert.ok(text.includes(name), `${label}: click with on the page`);
      clicks++;
    } else assert.equal(A.party.click, null);
    const oppP = LIB.relationship.find((x) => x.code === rel.code.split("·").map((p) => FLIP[p]).join("·")).name;
    const oppL = LIB.life.find((x) => x.code === life.code.split("·").map((p) => FLIP[p]).join("·")).name;
    assert.deepEqual([A.party.opposite.a, A.party.opposite.b], [oppP, oppL], `${label}: opposite`);

    // 8. The bio: both names and up to three shareable core traits; never a sting or a private trait.
    const shareable = storyCore.filter((k) => !k.private).map((k) => k.keyword);
    assert.ok(A.bio.text.startsWith(`${rel.name}. ${life.name}.`), `${label}: bio names`);
    for (const k of storyCore.filter((x) => x.private)) assert.ok(!A.bio.text.toLowerCase().includes(k.keyword.toLowerCase()), `${label}: private trait off the bio`);
    for (const k of shareable.slice(0, 3)) assert.ok(A.bio.text.toLowerCase().includes(k.toLowerCase()), `${label}: bio carries ${k}`);
    for (const sting of A.book ? A.book.stings : []) assert.ok(!A.bio.text.includes(sting));

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
    assert.doesNotMatch(body, /(?<!keep(?:ing|s)? )\bscore\b|\b(analysis|result|profile|evidence|axis|based on|indicates)\b/i, `${label}: no system words ("keeping score" is an idiom)`);
    const digits = body.replace(new RegExp(`\\b${A.record ? A.record.exact : "x"} of ${A.record ? A.record.called : "x"}\\b`), "");
    assert.doesNotMatch(digits, /\d/, `${label}: no numbers but the calls count`);
    for (const id of ["stats", "traits", "rooms", "party"]) assert.match(html, new RegExp(`id="${id}"`), `${label}: section ${id}`);
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `${label}: one h1`);

    // 11. Reading time: three to five minutes of visible words.
    const words = articleText(A).join(" ").split(/\s+/).length;
    assert.ok(words >= 650 && words <= 1300, `${label}: ${words} words`);
  }
  assert.ok(flips >= 1, `a room flip exercised (${flips})`);
  assert.ok(cells >= list.length * 1.5, `two-sides cells exercised (${cells})`);
  assert.ok(seenPairs.size >= 8, `several crossover cells exercised (${seenPairs.size})`);
  assert.ok(clicks >= 5 && hits >= 10 && statCores >= 10 && tagBacks >= 5, `party, calls and cards exercised (${clicks}, ${hits}, ${statCores}, ${tagBacks})`);
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
    for (const id of ["stats", "traits", "surprise", "rooms", "book", "record", "party"]) {
      assert.match(html, new RegExp(`href="#article/${id}"`), `${voice}: tab ${id}`);
      assert.match(html, new RegExp(`<section id="${id}"`), `${voice}: section ${id}`);
    }
    assert.match(html, /assets\/island\/hero-portrait-/, `${voice}: the canon island on the cover`);
    assert.match(html, /assets\/island\/ch\d-360/, `${voice}: the chapter islets on the map`);
    assert.match(html, /assets\/island\/mirror-frame-/, `${voice}: the World Mirror`);
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
