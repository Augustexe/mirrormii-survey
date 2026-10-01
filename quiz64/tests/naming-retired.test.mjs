// Plain names (LAUNCH-SPEC section 26, docs/NAMING-RULES.md): the labels retired on 2026-09-29 (Slow Burner, Orbit,
// Blueprint, Old School, With your life and the rest, stats.js RETIRED_LABELS) never reach a player again. Players with
// every archetype in both voices play the real step machine; the whole Stories deck and the Evidence Article render on
// the server, and a recording canvas captures every string the share card and every saved story image draw. Any
// retired label anywhere fails. Every title card also carries its kicker, the name and the name's defining line.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MotionConfig } from "motion/react";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  globalThis.document = { hidden: false };
});
test.after(async () => { delete globalThis.document; await server.close(); });

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ");

// A 2D context that records every string drawn and accepts every other call.
function recorder() {
  const texts = [];
  const state = { font: "10px x" };
  const grad = { addColorStop() {} };
  return new Proxy(state, {
    get(target, key) {
      if (key === "texts") return texts;
      if (key === "fillText") return (t) => { texts.push(String(t)); };
      if (key === "measureText") return (t) => ({ width: String(t).length * (parseFloat(/(\d+(?:\.\d+)?)px/.exec(target.font)?.[1] || 10) * 0.52) });
      if (key in target) return target[key];
      return () => grad;
    },
    set(target, key, value) { target[key] = value; return true; },
  });
}

// One player per archetype pair: the i-th people code with the i-th life code, both voices, all rooms open.
const SIGNS = [1, -1];
function leanersForAllArchetypes() {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const r = [SIGNS[(i >> 2) & 1], SIGNS[(i >> 1) & 1], SIGNS[i & 1]];
    const l = [SIGNS[i & 1], SIGNS[(i >> 2) & 1], SIGNS[(i >> 1) & 1]];
    out.push({ R1: r[0], R2: r[1] * 0.9, R3: r[2] * 0.8, L1: l[0] * 0.9, L2: l[1], L3: l[2] * 0.85 });
  }
  return out;
}

async function runs() {
  const { ADULT, completeRun, leaning } = await import("./persona-helpers.mjs");
  const out = [];
  leanersForAllArchetypes().forEach((signs, i) => {
    for (const voice of ["fun", "heart"]) {
      out.push({ voice, run: completeRun(ADULT, leaning(signs), `retired${i}${voice}`, { voice, depth: "anything", rooms: ["love", "work", "family"] }) });
    }
  });
  return out;
}

function retiredIn(text, retired) {
  // Case-sensitive, whole words: a card's own scene may say "solo trip" in lower case, a label never does.
  return retired.filter((w) => new RegExp(`(^|[^A-Za-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^A-Za-z]|$)`).test(text));
}

test("no retired label reaches the reveal, the article or any share image; the deck, the card and the article show one title and line", async () => {
  const { RETIRED_LABELS, HALVES } = await load("/src/persona/stats.js");
  const { resultView, shareText } = await load("/src/persona/views.js");
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const { ArticlePage } = await load("/src/persona/article/ArticlePage.jsx");
  const { drawShareCard, drawStory } = await load("/src/persona/share-image.js");
  const { printFor } = await load("/src/persona/stories/story-data.js");
  const { LIB } = await load("/src/persona/kit.js");
  const defines = new Map([...LIB.relationship, ...LIB.life].map((x) => [x.name, x.define]));
  const seen = { people: new Set(), life: new Set() };
  for (const { voice, run } of await runs()) {
    const view = resultView(run);
    const where = `${voice} ${view.slides.find((s) => s.id === "names").people.name} + ${view.slides.find((s) => s.id === "names").life.name}`;
    const friends = { setup: { closest: "best_friend", pronoun: "she" }, defaults: {}, challenges: [], ranking: null, returnTo: null };
    const deck = visible(renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" },
      React.createElement(PersonaResult, { view, friends, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true }))));
    const article = visible(renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" },
      React.createElement(ArticlePage, { stories: view, lib: LIB, onBack() {}, onChallenge() {}, onData() {}, onSave() {} }))));
    const images = [];
    for (const format of ["story", "post"]) for (const theme of ["night", "day"]) { const ctx = recorder(); drawShareCard(ctx, view.share, { format, theme }); images.push(...ctx.texts); }
    for (const slide of view.slides) { const ctx = recorder(); drawStory(ctx, printFor(slide)); images.push(...ctx.texts); }
    const data = JSON.stringify([view.share, view.slides.map(printFor), shareText(view.share)]);
    for (const [surface, text] of [["deck", deck], ["article", article], ["share images", images.join(" | ")], ["share data", data]]) {
      assert.deepEqual(retiredIn(text, RETIRED_LABELS), [], `${where}: retired label on the ${surface}`);
    }
    // Title cards: kicker, name and the name's one defining line, on the names screen, the share card and the cover.
    const names = view.slides.find((s) => s.id === "names");
    for (const [side, half] of [["people", names.people], ["life", names.life]]) {
      seen[side].add(half.name);
      const def = defines.get(half.name);
      assert.ok(def, `${half.name} has a defining line in library.json`);
      assert.equal(half.label, HALVES[side].kicker);
      assert.equal(half.define, def);
      const card = view.share.names.find((n) => n.name === half.name);
      assert.ok(card && card.label === HALVES[side].kicker && card.define === def, `${where}: share card carries ${half.name} with kicker and line`);
    }
    // Decision 1a (2026-09-30): the Stories deck and the share image show one title, the people half, with one line
    // that merges both halves; the day-to-day half sits under the mirror on story 2 as a labeled row.
    assert.ok(deck.includes(`${names.title.name} ${names.title.line}`), `${where}: deck shows the title and its line`);
    assert.ok(deck.includes(`${HALVES.life.kicker} ${names.life.name}`), `${where}: deck shows the day-to-day half as a row`);
    // The Evidence Article (V2 pass): the same one title and line on its cover, the day-to-day half as a labeled row.
    assert.ok(article.includes(`${names.title.name} ${names.title.line}`), `${where}: article cover shows the title and its line`);
    assert.ok(article.includes(`${HALVES.life.kicker} ${names.life.name}`), `${where}: article shows the day-to-day half as a row`);
    const drawn = recorder();
    drawShareCard(drawn, view.share, { format: "story", theme: "night" });
    const all = drawn.texts.join(" ");
    assert.ok(all.includes(view.share.title.name.split(" ")[0]), `${where}: share image title`);
    for (const w of view.share.title.line.split(" ")) assert.ok(all.includes(w), `${where}: share image title line`);
  }
  assert.equal(seen.people.size, 8, `every people archetype rendered: ${[...seen.people]}`);
  assert.equal(seen.life.size, 8, `every life archetype rendered: ${[...seen.life]}`);
});

test("the one sources: stat names and ends in stats.js, archetype names, defining lines and keywords in library.json", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { STATS, HALVES, RETIRED_LABELS, POLE_NAMES } = await load("/src/persona/stats.js");
  const { LIB } = await load("/src/persona/kit.js");
  // A stat named like its internal pole (Rules) is skipped: the scorer's pole ids are code, not labels.
  const labels = [HALVES.people.kicker, HALVES.life.kicker, ...Object.values(STATS).flatMap((s) => [s.stat, ...Object.values(s.ends)])].filter((l) => !POLE_NAMES.includes(l));
  // No other source file spells out a stat label, a kicker or a retired label.
  const root = fileURLToPath(new URL("../src/", import.meta.url));
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.(jsx?|mjs)$/.test(e.name)) files.push(p); } };
  walk(root);
  for (const f of files) {
    if (f.endsWith(`${path.sep}stats.js`)) continue;
    const src = fs.readFileSync(f, "utf8");
    for (const l of labels) assert.ok(!src.includes(`"${l}"`), `${path.relative(root, f)} hardcodes "${l}"`);
    assert.deepEqual(retiredIn(src.replace(/^\s*\/\/.*$/gm, ""), RETIRED_LABELS.filter((w) => w !== "Code:")), [], `${path.relative(root, f)} still names a retired label`);
  }
  // Every archetype has a name and a defining line; every trait has a name and a keyword.
  for (const x of [...LIB.relationship, ...LIB.life]) assert.ok(x.name && x.define && !/[—]/.test(x.define), `${x.code}: name and defining line`);
  for (const t of LIB.tags) assert.ok(t.name && t.keyword, `${t.id}: name and keyword`);
  for (const a of LIB.axes) assert.ok(a.plusKeyword && a.minusKeyword, `${a.id}: keywords`);
  const libText = JSON.stringify({ relationship: LIB.relationship, life: LIB.life, tags: LIB.tags.map((t) => [t.name, t.keyword]), axes: LIB.axes.map((a) => [a.plusKeyword, a.minusKeyword, a.topic]), article: LIB.article, rooms: LIB.rooms, crossover: LIB.crossover });
  assert.deepEqual(retiredIn(libText, RETIRED_LABELS), [], "library.json player copy names a retired label");
});
