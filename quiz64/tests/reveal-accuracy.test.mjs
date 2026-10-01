// Display accuracy for the reveal (LAUNCH-SPEC section 23, ruling 6): simulated players with known answer patterns
// play the real step machine, and every line, pole, trait, room and call the story screens show is traced back to
// that player's own score, recomputed here from the profile and the library without going through story-data.js.
// Nothing on a screen may come from anywhere else, and nothing may quote the player's answers.
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

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const slideHtml = (html, id) => { const at = html.indexOf(`data-story="${id}"`); if (at < 0) return ""; const start = html.indexOf(">", at) + 1; return html.slice(start, html.indexOf("</section>", start)); };
const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);
const SETUP = { closest: "best_friend", pronoun: "she" };
const ROOMS = [["love", "work", "family"], ["love"], [], ["work", "family"]];

// Known answer patterns: four consistent leaners (one per corner of the map, one mixed) and noisy simulated players.
const LEANERS = {
  golden: { R1: 1, R2: -0.8, R3: -0.6, L1: 0.9, L2: -0.6, L3: 0.9 },
  wolf: { R1: -1, R2: 0.8, R3: -0.8, L1: -0.9, L2: -0.7, L3: -0.9 },
  glue: { R1: 0.9, R2: 0.8, R3: 0.9, L1: 0.8, L2: 0.9, L3: 0.8 },
  mixed: { R1: 0.05, R2: -0.9, R3: 0.9, L1: -0.8, L2: 0.9, L3: -0.1 },
};

async function players() {
  const Session = await import("../src/persona/session.js");
  const { clock } = await import("./persona-helpers.mjs");
  const out = [];
  let k = 0;
  for (const [name, signs] of Object.entries(LEANERS)) {
    for (const voice of ["fun", "heart"]) {
      const choose = leaning(signs);
      let s = Session.chooseLobby(Session.startRun(Session.newRun({ now: clock(), runId: `acc${name}${voice}` }), SETUP, { now: clock() }), { voice, depth: "anything", rooms: ROOMS[k++ % ROOMS.length] }, { now: clock() });
      for (let g = 0; g < 200; g++) {
        const step = Session.currentStep(s);
        if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
        if (step.kind !== "card") break;
        s = Session.answerCard(s, step.card.id, choose(step.card).value, { ms: 4200, now: clock() });
      }
      out.push({ label: `${name} ${voice}`, run: s, voice });
    }
  }
  for (let i = 0; i < 8; i++) {
    const voice = i % 2 ? "heart" : "fun";
    const run = playPicker(SETUP, { voice, depth: "anything", rooms: ROOMS[i % ROOMS.length] }, makePlayer(`accuracy${i}`, { noise: 0.2 }), `accsim${i}`);
    out.push({ label: `sim ${i} ${voice}`, run, voice });
  }
  return out;
}

// The character sheet, recomputed here from the score (LAUNCH-SPEC 24 item 1): pips from how far the stat leans
// (|norm|, cuts at 0.25, 0.45, 0.65 and 0.85), capped at three when fewer than three cards carried it; a flex reads
// "Both" with no full pip; the band picks the library line (light 1 to 2, clear 3, strong 4 to 5).
function pipsFor(a) {
  if (a.unfinished || a.flex) return 0;
  const n = Math.min(1, Math.abs(a.norm));
  let pips = 1 + [0.25, 0.45, 0.65, 0.85].filter((c) => n >= c).length;
  if (a.cards < 3) pips = Math.min(pips, 3);
  return pips;
}
const bandOf = (pips) => (pips >= 4 ? "strong" : pips === 3 ? "clear" : "light");
function sheetIn(meta, end, band, voice) {
  const sh = voice === "heart" && meta.h && meta.h.sheet ? meta.h.sheet : meta.sheet;
  return band === "both" ? sh.both : sh[end][band];
}

// The library line in a voice, the same rule the screens promise: Heart to heart reads h first.
function inVoice(entry, field, voice) {
  if (!entry) return null;
  if (voice === "heart" && entry.h && typeof entry.h[field] === "string") return entry.h[field];
  const v = entry[field];
  if (typeof v === "string") return v;
  if (v && typeof v === "object") return voice === "heart" ? v.heart || v.h || v.fun : v.fun || v.t;
  return null;
}

test("every reveal line, pole, trait, room and call comes from the player's own evidence", async () => {
  const { resultView, chapterOf } = await load("/src/persona/views.js");
  const { axisClarity, clarityLevel } = await load("/src/persona/stories/story-data.js");
  const R = await load("/src/persona/rpg-stats.js");
  const Session = await load("/src/persona/session.js");
  const { LIB, KIT, S } = await load("/src/persona/kit.js");
  const axisMeta = Object.fromEntries(LIB.axes.map((a) => [a.id, a]));
  const tagLib = Object.fromEntries(LIB.tags.map((t) => [t.id, t]));
  // The naming package read straight from disk (the app bundle carries a stripped copy): one line per pair and voice.
  const fs = await import("node:fs");
  const names64 = JSON.parse(fs.readFileSync(new URL("../../research/persona-quiz-v2/final/naming/names-64.json", import.meta.url), "utf8"));
  const pairLine = Object.fromEntries(names64.combos.map((c) => [c.key, c.line]));
  const list = await players();
  const seenArchetypes = new Set();
  let roomRows = 0;
  let splitInsights = 0;
  let hits = 0;
  let partial = 0;
  let sheetRows = 0;
  let wilds = 0;
  let coreCount = 0;
  let surprisePicks = 0;

  for (const { label, run, voice } of list) {
    const { profile, result, sealed } = Session.resultFor(run);
    const view = resultView(run);
    const by = Object.fromEntries(view.slides.map((s) => [s.id, s]));
    const P = profile.axes;

    // 1. The two archetypes: the half whose three poles match the profile's poles, named from the library.
    const rel = LIB.relationship.find((h) => h.R1 === P.R1.pole && h.R2 === P.R2.pole && h.R3 === P.R3.pole);
    const life = LIB.life.find((h) => h.L1 === P.L1.pole && h.L2 === P.L2.pole && h.L3 === P.L3.pole);
    assert.equal(by.names.people.name, rel.name, `${label}: people half`);
    assert.equal(by.names.life.name, life.name, `${label}: life half`);
    seenArchetypes.add(`${rel.name} / ${life.name}`);
    assert.deepEqual(view.share.names.map((n) => n.name), [rel.name, life.name], `${label}: the card names the same halves`);
    // Decision 1a: one title, the people half, and one line from names-64.json for this exact pair, in voice.
    const want = pairLine[`${rel.code}|${life.code}`];
    assert.ok(want, `${label}: names-64.json has a line for ${rel.code}|${life.code}`);
    assert.equal(by.names.title.name, rel.name, `${label}: the title is the people half`);
    assert.equal(by.names.title.line, voice === "heart" ? want.heart : want.fun, `${label}: the title line is the pair's line in voice`);
    assert.equal(by.names.title.from, "combo", `${label}: the line comes from the pair, not a fallback`);
    assert.deepEqual(view.share.title, { name: rel.name, line: by.names.title.line }, `${label}: the card carries the same title and line`);

    // 2. The read: each half's own line and description, in voice.
    assert.deepEqual(by.read.lines, [inVoice(rel, "read", voice), inVoice(life, "read", voice)], `${label}: read lines`);
    assert.deepEqual(by.read.bodies, [inVoice(rel, "desc", voice), inVoice(life, "desc", voice)], `${label}: read bodies`);

    // 3. The map: six pairs in order, each leaning to the profile's pole, flex and unfinished exactly as scored.
    const rows = by.map.groups.flatMap((g) => g.rows);
    assert.deepEqual(rows.map((r) => r.key), ["R1", "R2", "R3", "L1", "L2", "L3"]);
    for (const r of rows) {
      const a = P[r.key];
      const meta = axisMeta[r.key];
      assert.equal(r.flex, a.flex, `${label}: ${r.key} flex`);
      assert.equal(r.unfinished, a.unfinished, `${label}: ${r.key} unfinished`);
      assert.equal(r.lead, a.pole > 0 ? meta.plus : meta.minus, `${label}: ${r.key} leans to the scored pole`);
      if (!a.flex && !a.unfinished) assert.ok(a.pole > 0 ? r.pos > 50 : r.pos < 50, `${label}: ${r.key} bead on the scored side`);
      else assert.ok(r.pos >= 43 && r.pos <= 57, `${label}: ${r.key} bead near the middle`);
      // The character sheet: pips, the split, the level word and the plain line all follow this stat's own score.
      const pips = pipsFor(a);
      assert.equal(r.pips, pips, `${label}: ${r.key} pips from the score`);
      assert.equal(r.split, a.flex, `${label}: ${r.key} split pips only for a near-even stat`);
      if (a.unfinished) assert.equal(r.levelKey, "open");
      else if (a.flex) {
        assert.equal(r.levelKey, "both");
        assert.equal(r.note, sheetIn(meta, null, "both", voice), `${label}: ${r.key} both line`);
        assert.equal(r.keyword, null, `${label}: ${r.key} a near-even stat gives no keyword`);
      } else {
        assert.equal(r.levelKey, pips);
        assert.equal(r.note, sheetIn(meta, a.pole > 0 ? "plus" : "minus", bandOf(pips), voice), `${label}: ${r.key} sheet line for the end and band`);
        assert.equal(r.keyword, a.pole > 0 ? meta.plusKeyword : meta.minusKeyword, `${label}: ${r.key} keyword for the scored end`);
      }
      sheetRows++;
    }
    // The signature stat is the strongest decided lean; the wild card is the stat closest to both.
    const decided = rows.filter((r) => !P[r.key].flex && !P[r.key].unfinished);
    const strongest = decided.slice().sort((x, y) => pipsFor(P[y.key]) - pipsFor(P[x.key]) || Math.abs(P[y.key].norm) - Math.abs(P[x.key].norm) || P[y.key].cards - P[x.key].cards)[0];
    assert.equal(rows.filter((r) => r.badge === "signature").length, strongest ? 1 : 0, `${label}: one signature stat`);
    if (strongest) {
      assert.equal(by.map.signature.key, strongest.key, `${label}: the signature is the strongest lean`);
      assert.ok(decided.every((r) => pipsFor(P[r.key]) <= pipsFor(P[strongest.key])), `${label}: nothing outranks the signature`);
    }
    const flexes = rows.filter((r) => P[r.key].flex && !P[r.key].unfinished);
    if (by.map.wild) {
      const w = P[by.map.wild.key];
      if (flexes.length) assert.ok(w.flex && flexes.every((r) => Math.abs(P[r.key].norm) >= Math.abs(w.norm)), `${label}: the wild card is the most even flex`);
      else {
        assert.ok(pipsFor(w) <= 3 && by.map.wild.key !== by.map.signature.key, `${label}: the wild card is a weak lean`);
        assert.ok(decided.filter((r) => r.key !== by.map.signature.key).every((r) => pipsFor(P[r.key]) >= pipsFor(w)), `${label}: nothing is closer to both than the wild card`);
      }
      wilds++;
    } else assert.ok(!flexes.length, `${label}: a flex is always the wild card`);

    // 3b. The drama stats (2026-09-30): story 4 shows four blocks, the three highest of the six recomputed from this
    //     profile (tests/drama-stats.test.mjs checks the formulas) and the most surprising one unless it is already
    //     among them, else the fourth highest; each block reads its library line in voice, high at or above the middle,
    //     low below it. The article's top and dump come from the same six.
    const six = R.dramaStats(profile);
    const order = six.slice().sort((x, y) => y.score - x.score || y.raw - x.raw || x.order - y.order);
    const most = six.slice().sort((x, y) => y.surprise - x.surprise || x.order - y.order)[0];
    const wantIds = [...order.slice(0, 3).map((x) => x.id), order.slice(0, 3).includes(most) ? order[3].id : most.id];
    assert.deepEqual(by.map.blocks.map((b) => b.id), wantIds, `${label}: the four stat blocks`);
    if (!order.slice(0, 3).includes(most)) { assert.equal(by.map.blocks[3].pick, "surprise", `${label}: the surprise pick`); surprisePicks++; }
    for (const b of by.map.blocks) {
      const st = six.find((x) => x.id === b.id);
      assert.equal(b.score, st.score, `${label}: ${b.id} score`);
      assert.ok(Number.isInteger(b.score) && b.score >= 1 && b.score <= 20, `${label}: ${b.id} in range`);
      assert.equal(b.line, inVoice(LIB.drama.stats[b.id], b.score >= R.MID - 1 ? "high" : "low", voice), `${label}: ${b.id} line`);
    }
    assert.deepEqual(by.map.stats.map((x) => [x.id, x.score]), six.map((x) => [x.id, x.score]), `${label}: all six for the article`);
    assert.equal(by.map.top.id, order[0].id, `${label}: top stat`);
    const low = six.slice().sort((x, y) => x.score - y.score || x.raw - y.raw || y.order - x.order)[0];
    assert.equal(by.map.dump.id, low.id, `${label}: dump stat is the lowest`);
    assert.ok(six.every((x) => x.score >= by.map.dump.score), `${label}: nothing below the dump stat`);
    assert.equal(by.map.top.line, inVoice(LIB.drama.stats[by.map.top.id], "top", voice));
    assert.equal(by.map.dump.line, inVoice(LIB.drama.stats[by.map.dump.id], "dump", voice));

    // 4. What Genii knows best: every lean that came through (5 or 6), clearest first, each line the library's
    //    finding for the scored pole, each cue recomputed from the lean and the number of cards behind it.
    const f = by.knows.findings;
    const expected = rows.filter((r) => !P[r.key].unfinished);
    assert.equal(f.length, Math.min(6, expected.length), `${label}: one finding per lean that came through`);
    assert.ok(f.length >= 5 || expected.length < 5, `${label}: five or six findings`);
    let prev = Infinity;
    let flexSeen = false;
    for (const x of f) {
      const a = P[x.key];
      const meta = axisMeta[x.key];
      assert.ok(!a.unfinished, `${label}: no finding from an unfinished lean`);
      if (a.flex) {
        flexSeen = true;
        assert.equal(x.kind, "flex");
        assert.equal(x.line, inVoice(meta, "flexKnow", voice), `${label}: ${x.key} flex line`);
        assert.equal(x.level, 0);
        continue;
      }
      assert.ok(!flexSeen, `${label}: flex findings sit after every decided one`);
      assert.equal(x.kind, "axis");
      assert.equal(x.line, inVoice(meta, a.pole > 0 ? "plusKnow" : "minusKnow", voice), `${label}: ${x.key} finding line for the scored pole`);
      assert.equal(x.lead, a.pole > 0 ? meta.plus : meta.minus);
      assert.equal(x.clarity, axisClarity(a.norm, a.cards), `${label}: ${x.key} clarity from norm and cards`);
      assert.equal(x.level, clarityLevel(x.clarity));
      assert.ok(x.clarity <= prev, `${label}: clearest first`);
      prev = x.clarity;
    }

    // 5. The rooms: each row recomputed from that chapter's own evidence.
    if (by.rooms) {
      for (const row of by.rooms.rows) {
        const copy = LIB.rooms[row.chapter];
        assert.equal(row.room, inVoice(copy, "name", voice));
        if (row.kind === "axis") {
          const ev = P[row.axis].evidence.filter((e) => chapterOf(e.card) === row.chapter && e.w > 0);
          const cards = new Set(ev.map((e) => e.card)).size;
          const sum = ev.reduce((t, e) => t + e.w * e.v, 0);
          const max = ev.reduce((t, e) => t + Math.abs(e.w) * 2, 0);
          assert.ok(cards >= 2, `${label}: room ${row.chapter} rests on two cards or more`);
          assert.ok(Math.abs(sum / max) >= 0.3, `${label}: room ${row.chapter} leans clearly`);
          assert.equal(row.sign, sign(sum), `${label}: room ${row.chapter} pole from its own answers`);
          assert.equal(row.line, inVoice(copy[row.axis], sum > 0 ? "plus" : "minus", voice), `${label}: room ${row.chapter} line`);
          assert.equal(row.differs, !P[row.axis].flex && !P[row.axis].unfinished && sign(sum) !== P[row.axis].pole, `${label}: room ${row.chapter} other side`);
          // The room's cards really are this player's answers in that chapter.
          for (const e of ev) assert.ok(run.answers[e.card] !== undefined, `${label}: ${e.card} was answered`);
        } else {
          const t = profile.tags[row.tag];
          assert.ok(t && t.chapter === row.chapter && (t.fired || t.floorOk) && !profile.shownTags.includes(row.tag), `${label}: room ${row.chapter} trait`);
          assert.equal(row.line, inVoice(tagLib[row.tag], "line", voice));
        }
        roomRows++;
      }
      assert.ok(by.rooms.rows.length >= 2 && by.rooms.rows.length <= 4);
    }

    // 6. The traits: the scorer's shown tags, in its rank order, with their own lines; the share card only the public ones.
    assert.deepEqual(by.traits.tags.map((t) => t.key), profile.shownTags.slice(0, 5), `${label}: traits are the shown tags`);
    for (const t of by.traits.tags) {
      assert.equal(t.line, inVoice(tagLib[t.key], "line", voice), `${label}: ${t.key} line`);
      assert.equal(t.private, Boolean(tagLib[t.key].locked18));
    }

    // 6b. The core traits: five or six keywords, each traced to a top trait or to one of the strongest stat ends, with
    //     that trait's or that stat's own line as evidence. The card and the names screen get the shareable ones.
    const core = by.traits.core;
    assert.ok(core.length <= 6, `${label}: at most six core traits`);
    assert.equal(new Set(core.map((k) => k.keyword.toLowerCase())).size, core.length, `${label}: no keyword twice`);
    for (const k of core) {
      if (k.kind === "tag") {
        assert.ok(profile.shownTags.slice(0, 5).includes(k.tag), `${label}: ${k.keyword} comes from a top trait`);
        assert.equal(k.keyword, tagLib[k.tag].keyword, `${label}: ${k.tag} keyword`);
        assert.equal(k.line, inVoice(tagLib[k.tag], "line", voice), `${label}: ${k.tag} evidence line`);
        assert.equal(k.private, Boolean(tagLib[k.tag].locked18));
      } else {
        const a = P[k.axis];
        const meta = axisMeta[k.axis];
        assert.ok(!a.flex && !a.unfinished && pipsFor(a) >= 2, `${label}: ${k.keyword} comes from a decided stat`);
        assert.equal(k.keyword, a.pole > 0 ? meta.plusKeyword : meta.minusKeyword, `${label}: ${k.axis} keyword for the scored end`);
        assert.equal(k.line, sheetIn(meta, a.pole > 0 ? "plus" : "minus", bandOf(pipsFor(a)), voice), `${label}: ${k.axis} evidence line`);
        assert.ok(!k.private);
      }
    }
    // Stat ends at three pips or more join the tags; two pips only fill up to five. A stat end a top trait restates
    // (library `echo`) stays out, so one trait never shows twice.
    const echoed = new Set(by.traits.tags.map((t) => tagLib[t.key].echo).filter(Boolean));
    for (const k of core.filter((x) => x.kind === "stat")) assert.ok(!echoed.has(`${k.axis}:${P[k.axis].pole > 0 ? "plus" : "minus"}`), `${label}: ${k.keyword} is not restated by a top trait`);
    const kw = (minPips) => new Set([
      ...by.traits.tags.map((t) => tagLib[t.key].keyword.toLowerCase()),
      ...rows.filter((r) => !P[r.key].flex && !P[r.key].unfinished && pipsFor(P[r.key]) >= minPips && !echoed.has(`${r.key}:${P[r.key].pole > 0 ? "plus" : "minus"}`)).map((r) => r.keyword.toLowerCase()),
    ]).size;
    assert.equal(core.length, Math.max(Math.min(6, kw(3)), Math.min(5, kw(2))), `${label}: as many core traits as the evidence allows`);
    coreCount += core.length;
    const shareable = core.filter((k) => !k.private).map((k) => k.keyword);
    assert.deepEqual(view.share.tags.map((t) => t.name), shareable, `${label}: the card carries the shareable core traits`);
    assert.deepEqual(view.share.keywords, shareable);
    assert.deepEqual(by.names.keywords, shareable, `${label}: the names screen gets the same keywords`);
    for (const k of core.filter((x) => x.private)) assert.ok(!view.share.tags.some((t) => t.name === k.keyword), `${label}: ${k.keyword} stays off the card`);

    // 7. The insight: a real believe-versus-did split on that axis, or no split at all and the half's fallback.
    const split = profile.splits.find((s) => s.kind === "axis" && LIB.insights[s.dim]);
    if (by.insight.from.kind === "split") {
      splitInsights++;
      assert.ok(split && split.dim === by.insight.from.dim, `${label}: the insight's split exists`);
      assert.equal(by.insight.line, inVoice(LIB.insights[split.dim], split.believe > 0 ? "believePlus" : "believeMinus", voice));
    } else {
      assert.ok(!split, `${label}: a fallback only when there is no split`);
      const fb = LIB.insightFallback[rel.code] || LIB.insightFallback[life.code];
      assert.equal(by.insight.line, voice === "heart" ? fb.heart : fb.fun, `${label}: the half's fallback`);
    }

    // 8. The stings, open book: both halves', then the strongest shareable trait's, in voice. Shared like any screen.
    const stingTrait = by.traits.tags.find((t) => !tagLib[t.key].locked18);
    const tagSting = stingTrait ? inVoice(tagLib[stingTrait.key], "sting", voice) : null;
    assert.deepEqual(by.stings.stings, [inVoice(rel, "sting", voice), inVoice(life, "sting", voice), tagSting].filter(Boolean));
    assert.equal(by.stings.private, false, `${label}: the stings screen is open book`);

    // 9. The calls: counts straight from the check; a hit names the pole of the guess Genii locked, nothing else.
    const called = sealed.rows.filter((r) => r.status === "hit" || r.status === "miss");
    assert.equal(by.calls.exact, sealed.rows.filter((r) => r.status === "hit").length, `${label}: exact`);
    assert.equal(by.calls.called, called.length, `${label}: called`);
    assert.deepEqual(by.calls.rows.map((r) => r.status), sealed.rows.map((r) => r.status));
    for (const [i, r] of by.calls.rows.entries()) {
      const card = KIT.finale.find((c) => c.id === r.key);
      const pred = run.frozen.predictions.find((x) => x.id === r.key);
      assert.equal(r.topic, axisMeta[card.checks.primary].topic, `${label}: call topic is the lean it tested`);
      if (r.status === "hit") {
        hits++;
        assert.equal(sealed.rows[i].answer, pred.predicted, `${label}: a hit is the locked guess`);
        const v = (S.cardById[r.key].options[pred.predicted].axes || {})[card.checks.primary] || 0;
        assert.equal(sign(v), pred.side, `${label}: the frozen side is the guessed option's pole`);
        assert.equal(r.pole, pred.side ? (pred.side > 0 ? axisMeta[card.checks.primary].plus : axisMeta[card.checks.primary].minus) : null, `${label}: the side Genii guessed`);
      } else assert.equal(r.pole, null);
    }

    // 10. Nothing quotes an answer: no answered option's text appears on any screen.
    const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" }, React.createElement((await load("/src/persona/PersonaResult.jsx")).PersonaResult, {
      view, friends: null, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true,
    })));
    const text = visible(html);
    // The calls score on screen is the sealed check's own count, never a fixed 8 of 8 (round 2 G5).
    if (called.length) {
      const score = visible((html.match(/rv-calls__score[^>]*>([\s\S]*?)<\/p>/) || [])[1] || "").trim();
      const exact = sealed.rows.filter((r) => r.status === "hit").length;
      assert.match(score, new RegExp(`^${exact} of ${called.length}\\b`), `${label}: calls score shows ${exact} of ${called.length}`);
      if (exact > 0 && exact < called.length) partial++;
    }
    const said = [];
    for (const [id, value] of Object.entries(run.answers)) {
      const card = S.cardById[id];
      if (!card || typeof value === "string") continue;
      for (const i of [].concat(value)) if (card.options[i] && card.options[i].t.length >= 16) said.push(card.options[i].t);
    }
    for (const [id, value] of Object.entries(run.finale || {})) {
      const card = S.cardById[id];
      if (card && typeof value === "number") said.push(card.options[value].t);
    }
    for (const t of said) assert.ok(!text.includes(t), `${label}: no quoted answer: ${t}`);
    assert.doesNotMatch(text, /—|You'd say|Last time, you|energy\b|streak|gacha|lottery|jackpot|predict|clinically|diagnos/i, `${label}: voice rules`);
    for (const id of ["knows", "rooms", "traits", "stings"]) assert.doesNotMatch(visible(slideHtml(html, id)), /\d/, `${label}: no numbers on ${id}`);
    // The drama stat scores are the only numbers on story 4.
    let mapDigits = visible(slideHtml(html, "map"));
    for (const b of by.map.blocks) mapDigits = mapDigits.split(String(b.score)).join(" ");
    assert.doesNotMatch(mapDigits, /\d/, `${label}: no numbers on map but the stat scores`);
    // The old axis stat names are retired from every screen.
    for (const n of ["Closeness", "Hard truths", "Traditions", "New things", "Pace"]) assert.ok(!text.includes(n), `${label}: ${n} retired`);
    assert.doesNotMatch(text, /Only you see this/, `${label}: no hiding frame`);
  }
  assert.ok(seenArchetypes.size >= 5, `several archetype pairs covered (${[...seenArchetypes].join("; ")})`);
  assert.ok(roomRows >= 20, "rooms exercised");
  assert.ok(hits >= 10, "hits exercised");
  assert.ok(partial >= 3, `noisy players show partial calls (${partial})`);
  assert.ok(splitInsights >= 1, "a split insight exercised");
  assert.ok(sheetRows >= 90 && wilds >= 5, `character sheet exercised (${sheetRows} stats, ${wilds} wild cards)`);
  assert.ok(coreCount >= list.length * 4, `core traits exercised (${coreCount})`);
  assert.ok(surprisePicks >= 2, `the surprise pick exercised (${surprisePicks})`);
});

// Round 3 (LAUNCH-SPEC 24 item 1): no percentage anywhere a player looks: not on any screen of the reveal (visible text
// and what a screen reader hears), not in what a saved screen image draws, not on the share card.
test("no percentage renders on the reveal, its saved images or the card", async () => {
  const { resultView } = await load("/src/persona/views.js");
  const { printFor } = await load("/src/persona/stories/story-data.js");
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const list = await players();
  const texts = (o, out = []) => {
    if (typeof o === "string") out.push(o);
    else if (Array.isArray(o)) o.forEach((x) => texts(x, out));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!["mirror", "facet"].includes(k)) texts(v, out);
    return out;
  };
  for (const { label, run } of list) {
    const view = resultView(run);
    const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" }, React.createElement(PersonaResult, {
      view, friends: null, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true,
    })));
    assert.doesNotMatch(visible(html), /%|\bpercent/i, `${label}: no percentage on the reveal`);
    for (const sl of view.slides) {
      for (const t of texts(printFor(sl))) assert.doesNotMatch(t, /%|\bpercent/i, `${label}: no percentage on the ${sl.id} image ("${t}")`);
    }
    for (const t of texts(view.share)) assert.doesNotMatch(t, /%|\bpercent/i, `${label}: no percentage on the card`);
  }
});

test("the round 2 result copy is complete in both voices and keeps the voice rules", async () => {
  const { LIB } = await load("/src/persona/kit.js");
  const banned = /—|streak|gacha|lottery|jackpot|predict|clinically|diagnos|energy\b|You'd say/i;
  for (const a of LIB.axes) {
    for (const f of ["topic", "plusKnow", "minusKnow", "flexKnow"]) { assert.ok(a[f], `${a.id} ${f}`); assert.doesNotMatch(a[f], banned); }
    for (const f of ["plusKnow", "minusKnow", "flexKnow"]) { assert.ok(a.h[f] && a.h[f] !== a[f], `${a.id} h.${f}`); assert.doesNotMatch(a.h[f], banned); }
  }
  for (const ch of [1, 2, 3, 4, 5, 6, 7]) {
    const room = LIB.rooms[ch];
    assert.ok(room && room.name, `room ${ch}`);
    const axes = Object.keys(room).filter((k) => /^[RL][1-3]$/.test(k));
    assert.ok(axes.length >= 3, `room ${ch} carries three leans or more`);
    for (const ax of axes) for (const f of ["plus", "minus"]) {
      assert.ok(room[ax][f] && room[ax].h[f], `room ${ch} ${ax} ${f}`);
      for (const line of [room[ax][f], room[ax].h[f]]) { assert.doesNotMatch(line, banned); assert.doesNotMatch(line, /\d/); }
    }
  }
});
