// The six leans as game stats (Jerry, 2026-09-29 evening; LAUNCH-SPEC 23 "Map stat labels"; src/persona/stats.js).
// The labels come from one app-side table, every end lands where its pole does (Crew where We lands), and no bare
// internal pole name (We, Me, Direct, Soft, Classic, Own, Steady, Venture, Push, Easy, Rules, Context) renders on any
// reveal screen or reaches the data a saved screen image draws. Also: Genii's calls name each locked guess by a short
// scene title, in play order, with honest partials.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionConfig } from "motion/react";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { STATS, POLE_NAMES, endOf, statRow } from "../src/persona/stats.js";
import { sceneTitle } from "../src/persona/scene-titles.js";
import { stripAuthoring } from "../kit-strip.mjs";

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  globalThis.document = { hidden: false };
});
test.after(async () => { delete globalThis.document; await server.close(); });

const KIT = new URL("../../research/persona-quiz-v2/final/", import.meta.url);
const readJSON = (f) => JSON.parse(fs.readFileSync(new URL(f, KIT), "utf8"));
// Visible text plus what a screen reader hears (sr-only spans are text too); attributes are not read.
const text = (html) => html.replace(/<[^>]*>/g, " \n ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&");
const slideHtml = (html, id) => { const at = html.indexOf(`data-story="${id}"`); if (at < 0) return ""; const start = html.indexOf(">", at) + 1; return html.slice(start, html.indexOf("</section>", start)); };

test("the stat table: one entry per axis, first end on the library's plus pole, ends matching the pole lines", () => {
  const lib = readJSON("library.json");
  assert.deepEqual(Object.keys(STATS), lib.axes.map((a) => a.id));
  const expected = {
    R1: ["Orbit", "Crew", "Solo"], R2: ["Delivery", "Blunt", "Gentle"], R3: ["Blueprint", "Old School", "Own Lane"],
    L1: ["Compass", "Home Base", "Wanderlust"], L2: ["Engine", "Full Send", "Cruise Control"], L3: ["Code", "By the Book", "Read the Room"],
  };
  for (const a of lib.axes) {
    const s = STATS[a.id];
    assert.equal(s.first, a.plus, `${a.id}: the first pole of the code name is the library's plus`);
    assert.equal(s.second, a.minus, `${a.id}: second pole`);
    assert.deepEqual([s.stat, endOf(a.plus), endOf(a.minus)], expected[a.id], `${a.id}: stat and ends`);
    // The end sits on the pole whose line it matches (Crew where "Your people are your happy place", We).
    assert.ok(a.plusLine && a.minusLine, `${a.id}: both pole lines exist`);
  }
  // A lean to the plus pole lights the left end; the bead mirrors the story data's position (measured from minus).
  const r = statRow("R1", { lead: "We", pos: 80 });
  assert.deepEqual([r.a, r.b, r.leadEnd, r.otherEnd, r.leadSide, r.at], ["Crew", "Solo", "Crew", "Solo", "a", 20]);
  const l = statRow("L2", { lead: "Easy", pos: 30 });
  assert.deepEqual([l.leadEnd, l.leadSide, l.at], ["Cruise Control", "b", 70]);
});

test("no bare internal pole name renders on the reveal, in either voice, for several players", async () => {
  const { ADULT, completeRun, leaning } = await import("./persona-helpers.mjs");
  const { resultView } = await load("/src/persona/views.js");
  const { printFor } = await load("/src/persona/stories/story-data.js");
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const bare = new RegExp(`(^|[^A-Za-z])(${POLE_NAMES.join("|")})([^A-Za-z]|$)`);
  const players = [
    { R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 },
    { R1: -1, R2: 1, R3: 1, L1: -1, L2: 1, L3: -1 },
    { R1: 1, R2: 1, R3: -1, L1: -1, L2: -1, L3: -1 },
  ];
  let checked = 0;
  for (const voice of ["fun", "heart"]) {
    for (const [k, lean] of players.entries()) {
      const view = resultView(completeRun(ADULT, leaning(lean), `stats${voice}${k}`, { voice, depth: "anything", rooms: ["love", "work", "family"] }));
      const friends = { setup: { closest: "best_friend", pronoun: "she" }, defaults: {}, challenges: [], ranking: null, returnTo: null };
      const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" },
        React.createElement(PersonaResult, { view, friends, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true })));
      for (const id of ["map", "knows", "rooms", "calls"]) {
        const slide = slideHtml(html, id);
        if (!slide) continue;
        // Every text run on the screen (not whole lines of copy, which may use "me" as a word): a label is a text node
        // of its own, so a bare pole shows up as a node that is exactly a pole name, or as "X over Y", "your X side".
        const endWords = Object.values(STATS).flatMap((x) => Object.values(x.ends)).sort((a, b) => b.length - a.length);
        const nodes = text(slide).split("\n").map((t) => t.trim()).filter(Boolean).map((t) => endWords.reduce((acc, e) => acc.split(e).join("END"), t));
        for (const n of nodes) {
          assert.ok(!POLE_NAMES.includes(n.replace(/[.,:;]$/, "")), `${voice} ${k} ${id}: bare label "${n}"`);
          assert.doesNotMatch(n, new RegExp(`\\b(${POLE_NAMES.join("|")}) over\\b|\\bover (${POLE_NAMES.join("|")})\\b|your (${POLE_NAMES.join("|")}) side|between (${POLE_NAMES.join("|")}) and`), `${voice} ${k} ${id}: pole phrase in "${n}"`);
        }
        checked++;
      }
      // The map's stat names are all there.
      const map = text(slideHtml(html, "map"));
      for (const s of Object.values(STATS)) assert.ok(map.includes(s.stat), `${voice}: ${s.stat} on the map`);
      // What a saved image draws: map ends, findings, calls.
      for (const sl of view.slides.filter((s) => ["map", "knows", "calls", "rooms"].includes(s.id))) {
        const spec = printFor(sl);
        const labels = [];
        for (const g of spec.groups || []) for (const r of g.rows) labels.push(r.left, r.right);
        for (const f of spec.findings || []) labels.push(f.lead, f.topic);
        for (const p of spec.panes || []) labels.push(p.side, p.topic);
        // A label is a stat end or a scene; ends such as "Own Lane" contain a pole word, so check the label as a whole.
        const ends = new Set(Object.values(STATS).flatMap((x) => Object.values(x.ends)));
        for (const l of labels.filter(Boolean).map(String)) {
          const parts = l.split(" · ");
          for (const part of parts) assert.ok(ends.has(part) || !bare.test(part), `${voice} ${sl.id} image label "${l}"`);
        }
      }
      // The share card's facet carries stat ends, never pole names.
      for (const f of view.share.facet) for (const v of [f.plus, f.minus]) assert.ok(!POLE_NAMES.includes(v), `facet ${v}`);
    }
  }
  assert.ok(checked >= 20, `screens checked (${checked})`);
});

test("Genii's calls: scene titles from the build, play order, honest partials", async () => {
  // The web build keeps a short scene title on every sealed card and drops the fingerprint itself.
  const cards = readJSON("cards.json");
  const stripped = stripAuthoring(cards);
  for (const [i, c] of stripped.finale.entries()) {
    assert.ok(typeof c.title === "string" && c.title.length >= 5 && c.title.split(" ").length <= 6, `${c.id}: title "${c.title}"`);
    assert.equal(c.title, sceneTitle(cards.finale[i].fp), `${c.id}: the title is derived from the scene only`);
    assert.ok(!("fp" in c), `${c.id}: no fingerprint in the bundle`);
    assert.doesNotMatch(c.title, /\d|—/);
  }
  assert.equal(sceneTitle({ device: "some-new-thing" }), "The some new thing", "a new device still gets a title");
  assert.equal(sceneTitle(null), "");

  const { makePlayer, playPicker } = await import("./persona-sim.mjs");
  const { resultView } = await load("/src/persona/views.js");
  const { resultFor, finaleIds } = await load("/src/persona/session.js");
  let near = 0;
  for (let k = 0; k < 10; k++) {
    const run = playPicker({ closest: "best_friend", pronoun: "she" }, { voice: "fun", depth: "anything", rooms: ["love", "work", "family"] }, makePlayer(`callsorder${k}`, { noise: 0.35 }), `callsord${k}`);
    const view = resultView(run);
    const calls = view.slides.find((s) => s.id === "calls");
    if (!calls) continue;
    const { sealed } = resultFor(run);
    assert.deepEqual(calls.rows.map((r) => r.key), finaleIds(run), "panes in the order the final cards were played");
    for (const [i, r] of calls.rows.entries()) {
      assert.ok(r.title, `${r.key}: a scene title`);
      const row = sealed.rows[i];
      assert.equal(r.near, row.status === "miss" && row.sideHit === true, `${r.key}: near only when Genii had the side`);
      if (r.near) near++;
      if (r.status === "hit") assert.ok(!r.near);
    }
    // The headline stays the exact count: partials never add to it.
    assert.equal(calls.exact, sealed.rows.filter((r) => r.status === "hit").length);
  }
  assert.ok(near >= 1, `honest partials exercised (${near})`);
});
