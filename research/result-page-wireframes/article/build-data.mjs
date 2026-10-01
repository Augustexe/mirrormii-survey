// Builds data.json for the Evidence Article prototypes from the app's own modules: a demo player with a plausible,
// consistent answer pattern plays the real step machine (session.js), and the real projection (views.js resultView,
// story-data.js buildStories) turns the run into screens, in both voices. Every line in data.json is library copy
// picked by the player's own evidence; nothing is hand-written here.
//   node research/result-page-wireframes/article/build-data.mjs [--scan]
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
const Q = new URL("../../../quiz64/", import.meta.url);
const Session = await import(new URL("src/persona/session.js", Q));
const { resultView } = await import(new URL("src/persona/views.js", Q));
const { LIB, S } = await import(new URL("src/persona/kit.js", Q));
const { STATS } = await import(new URL("src/persona/stats.js", Q));
const H = await import(new URL("tests/persona-helpers.mjs", Q));

const SETUP = { closest: "best_friend", pronoun: "she" };
function play(signs, voice, runId) {
  const choose = H.leaning(signs);
  let s = Session.chooseLobby(Session.startRun(Session.newRun({ now: H.clock(), runId }), SETUP, { now: H.clock() }), { voice, depth: "anything", rooms: ["love", "work", "family"] }, { now: H.clock() });
  for (let g = 0; g < 200; g++) {
    const step = Session.currentStep(s);
    if (step.kind === "lock") { s = Session.lockGuesses(s, { now: H.clock() }); continue; }
    if (step.kind !== "card") break;
    s = Session.answerCard(s, step.card.id, choose(step.card).value, { ms: 4800, now: H.clock() });
  }
  return s;
}

// The demo player: warm with people, gentle, builds her own way; plans ahead, pushes hard, reads the room. A lean on
// Compass is mild so the sheet has a wild card; tag leanings nudge a mix of traits.
const DEMO = { R1: 0.7, R2: -0.75, R3: -0.55, L1: 0.18, L2: 0.8, L3: -0.6 };

if (process.argv.includes("--scan")) {
  const vals = [-0.8, -0.3, 0.2, 0.7];
  let best = [];
  for (let i = 0; i < 60; i++) {
    const signs = Object.fromEntries(S.AXES.map((a, k) => [a, vals[(i * 7 + k * 3 + (i >> k)) % 4]]));
    const run = play(signs, "fun", `scan${i}`);
    const v = resultView(run);
    const ids = v.slides.map((s) => s.id);
    const traits = v.slides.find((s) => s.id === "traits");
    const ins = v.slides.find((s) => s.id === "insight");
    const rooms = v.slides.find((s) => s.id === "rooms");
    const score = (rooms ? rooms.rows.length : 0) + (traits.tags.length) + (ins.from && ins.from.kind === "split" ? 3 : 0) + (v.slides.find((s) => s.id === "map").wild ? 1 : 0);
    best.push({ score, signs, ids: ids.length, tags: traits.tags.length, rooms: rooms ? rooms.rows.length : 0, ins: ins.from && ins.from.kind });
  }
  best.sort((a, b) => b.score - a.score);
  console.log(JSON.stringify(best.slice(0, 5), null, 1));
  process.exit(0);
}

const signsArg = process.argv.find((a) => a.startsWith("--signs="));
const SIGNS = signsArg ? JSON.parse(signsArg.slice(8)) : DEMO;
const out = { built: new Date().toISOString().slice(0, 10), source: "quiz64 session.js + views.js resultView (buildStories), library.json", demo: { setup: SETUP, rooms: ["love", "work", "family"], depth: "anything", signs: SIGNS }, voices: {} };
for (const voice of ["fun", "heart"]) {
  const run = play(SIGNS, voice, "articledemo01");
  const { profile, result } = Session.resultFor(run);
  const v = resultView(run);
  const w = voice === "heart" ? "heart" : "fun";
  const pick = (e, f) => (w === "heart" && e && e.h && e.h[f]) || (e && e[f]) || null;
  // Library context the article expands with (read-only, picked by the same evidence): both ends of every stat at
  // this player's band, the two halves' full entries, the shown tags' calls, the room lines for every room played.
  const halves = (result.halves || []).map((h) => {
    const l = (h.side === "relationship" ? LIB.relationship : LIB.life).find((x) => x.code === h.code) || {};
    return { side: h.side, name: l.name, desc: pick(l, "desc"), read: pick(l, "read"), sting: pick(l, "sting"), heart: pick(l, "heart") };
  });
  const stats = LIB.axes.map((a) => {
    const sh = (w === "heart" && a.h && a.h.sheet) || a.sheet;
    const st = STATS[a.id];
    const p = profile.axes[a.id];
    return { axis: a.id, stat: st.stat, plusEnd: st.ends[a.plus], minusEnd: st.ends[a.minus], sheet: sh, plusKnow: pick(a, "plusKnow"), minusKnow: pick(a, "minusKnow"), flexKnow: pick(a, "flexKnow"), plusKeyword: a.plusKeyword, minusKeyword: a.minusKeyword, lean: p.flex ? 0 : p.pole, flex: !!p.flex, plusPole: a.plus, minusPole: a.minus };
  });
  const tagIds = (result.tags || []).slice(0, 5).map((t) => t.id);
  const tags = tagIds.map((id) => { const t = LIB.tags.find((x) => x.id === id); const pair = LIB.tags.find((x) => x.id === t.pair); return { id, name: t.name, keyword: t.keyword, line: pick(t, "line"), heart: pick(t, "heart"), sting: pick(t, "sting"), calls: t.calls, chapter: t.chapter, locked18: !!t.locked18, pairName: pair && pair.name }; });
  // Rooms: every chapter played, every axis with at least two local cards, the lean and its line (roomsFor keeps one
  // per room; the article may show a second line when it is clearly evidenced).
  const roomsAll = [];
  for (const ch of [3, 5, 6, 2, 4, 1, 7]) {
    const copy = LIB.rooms[ch];
    const lines = [];
    for (const [ax, a] of Object.entries(profile.axes)) {
      if (!copy[ax]) continue;
      const ev = (a.evidence || []).filter((e) => e && e.w > 0 && S.cardById[e.card] && S.cardById[e.card].chapter === ch);
      const cards = new Set(ev.map((e) => e.card)).size;
      if (cards < 2) continue;
      const sum = ev.reduce((t, e) => t + e.w * e.v, 0), max = ev.reduce((t, e) => t + Math.abs(e.w) * 2, 0);
      const norm = max ? sum / max : 0;
      if (Math.abs(norm) < 0.3) continue;
      const sgn = sum > 0 ? 1 : -1;
      const ent = copy[ax];
      lines.push({ axis: ax, stat: STATS[ax].stat, end: STATS[ax].ends[sgn > 0 ? LIB.axes.find((x) => x.id === ax).plus : LIB.axes.find((x) => x.id === ax).minus], cards, norm: Math.round(norm * 100) / 100, differs: !a.flex && sgn !== a.pole, line: (w === "heart" && ent.h && ent.h[sgn > 0 ? "plus" : "minus"]) || ent[sgn > 0 ? "plus" : "minus"] });
    }
    lines.sort((a, b) => Math.abs(b.norm) * (1 - Math.exp(-b.cards / 3)) - Math.abs(a.norm) * (1 - Math.exp(-a.cards / 3)));
    if (lines.length) roomsAll.push({ chapter: ch, room: (w === "heart" && copy.h && copy.h.name) || copy.name, lines });
  }
  const counts = profile.counts || {};
  out.voices[voice] = { slides: v.slides, share: v.share, library: { halves, stats, tags, roomsAll, flex: pick(LIB.flex, "line") }, counts: { answered: counts.answered, chapters: [...new Set(Object.keys(run.answers).map((id) => S.cardById[id] && S.cardById[id].chapter).filter((x) => x != null))].length } };
}
// Archetype names by code, for the party section (click with: the wild card flipped; opposite: every pole flipped).
out.archetypes = [...LIB.relationship.map((x) => ({ side: "relationship", code: x.code, name: x.name })), ...LIB.life.map((x) => ({ side: "life", code: x.code, name: x.name }))];
// New article copy (frames and the crossover table), kept apart from library.json until it is adopted.
out.newCopy = JSON.parse(readFileSync(fileURLToPath(new URL("article-copy.json", import.meta.url)), "utf8"));
const file = fileURLToPath(new URL("data.json", import.meta.url));
writeFileSync(file, JSON.stringify(out, null, 1));
console.log("wrote", file);
