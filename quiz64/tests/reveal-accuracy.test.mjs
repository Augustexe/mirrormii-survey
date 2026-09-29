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
  const Session = await load("/src/persona/session.js");
  const { LIB, KIT, S } = await load("/src/persona/kit.js");
  const axisMeta = Object.fromEntries(LIB.axes.map((a) => [a.id, a]));
  const tagLib = Object.fromEntries(LIB.tags.map((t) => [t.id, t]));
  const list = await players();
  const seenArchetypes = new Set();
  let roomRows = 0;
  let splitInsights = 0;
  let hits = 0;
  let partial = 0;

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
    }

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
    const topAxis = f.find((x) => x.kind === "axis");
    assert.equal(by.names.hook, topAxis ? topAxis.line : by.names.people.read, `${label}: the plaque is the clearest finding`);

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
    assert.deepEqual(view.share.tags.map((t) => t.name), by.traits.tags.filter((t) => !t.private).map((t) => t.name));

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

    // 8. The stings: both halves', then the strongest trait's, in voice.
    const tagSting = by.traits.tags[0] ? inVoice(tagLib[by.traits.tags[0].key], "sting", voice) : null;
    assert.deepEqual(by.stings.stings, [inVoice(rel, "sting", voice), inVoice(life, "sting", voice), tagSting].filter(Boolean));

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
    for (const id of ["knows", "rooms", "map"]) assert.doesNotMatch(visible(slideHtml(html, id)), /\d/, `${label}: no numbers on ${id}`);
  }
  assert.ok(seenArchetypes.size >= 5, `several archetype pairs covered (${[...seenArchetypes].join("; ")})`);
  assert.ok(roomRows >= 20, "rooms exercised");
  assert.ok(hits >= 10, "hits exercised");
  assert.ok(partial >= 3, `noisy players show partial calls (${partial})`);
  assert.ok(splitInsights >= 1, "a split insight exercised");
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
