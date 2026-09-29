// The Reflection screens (DESIGN-DIRECTION 5.12, 7.4 package C): the facet reads leans the right way, reduced
// motion shows the finished mirror with the names at once, the insight flips or degrades, story 9 has one primary
// job, the stings screen only saves, and the guess sheet defrosts eight panes.
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

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const slideHtml = (html, id) => { const at = html.indexOf(`data-story="${id}"`); const start = html.indexOf(">", at) + 1; return html.slice(start, html.indexOf("</section>", start)); };

async function realView(voice = "fun") {
  const { ADULT, completeRun, leaning } = await import("./persona-helpers.mjs");
  const { resultView } = await load("/src/persona/views.js");
  return resultView(completeRun(ADULT, leaning({ R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 }), `reveal${voice}1`, { voice, depth: "anything", rooms: ["love", "work", "family"] }));
}
async function render(view, reduced = "always") {
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const friends = { setup: { closest: "best_friend", pronoun: "she" }, defaults: {}, challenges: [], ranking: null, returnTo: null };
  return renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: reduced },
    React.createElement(PersonaResult, { view, friends, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true })));
}

test("the mirror is the run's: seeded by the run id, one shard per answered card in its chapter", async () => {
  const view = await realView();
  const intro = view.slides.find((s) => s.id === "intro");
  assert.equal(intro.mirror.seed, "revealfun1");
  assert.equal(intro.mirror.filled.length, 40);
  for (const f of intro.mirror.filled) assert.ok(Object.keys(f).every((k) => ["chapter", "skipped"].includes(k)), "only chapters leave the run");
  assert.ok(intro.mirror.filled.every((f) => (f.chapter >= 1 && f.chapter <= 7) || f.chapter === "extras"));
});

test("reduced motion: the assembled, fogged mirror and both names are there at once", async () => {
  const view = await realView();
  const html = await render(view, "always");
  assert.match(html, /data-reduced="true"/);
  const intro = slideHtml(html, "intro");
  assert.match(intro, /data-phase="set"/, "no orbit, the finished mirror");
  assert.match(intro, /data-art="mirror-arch"/);
  const names = slideHtml(html, "names");
  for (const s of [view.slides[1].people.name, view.slides[1].life.name, "With your people", "With your life"]) assert.ok(visible(names).includes(s), s);
  assert.ok(!names.includes("We·"), "no type code, even in attributes");
  const motion = await render(view, "never");
  assert.match(slideHtml(motion, "intro"), /data-phase="orbit"/, "with motion, story 1 opens on the orbit");
  assert.match(slideHtml(motion, "intro"), /class="rv-shard"/);
});

test("the facet: leans point to the right pole, people above the waterline, flex and open axes at 0.28 with a double vertex", async () => {
  const { buildStories } = await load("/src/persona/stories/story-data.js");
  const { geometry } = await load("/src/art/index.js");
  const view = await realView();
  const facet = view.slides.find((s) => s.id === "map").facet;
  assert.deepEqual(facet.map((a) => a.key), ["R1", "R2", "R3", "L1", "L2", "L3"]);
  const rows = view.slides.find((s) => s.id === "map").groups.flatMap((g) => g.rows);
  for (const a of facet) {
    const r = rows.find((x) => x.key === a.key);
    if (a.flex || a.unfinished) { assert.equal(a.lean, 0); continue; }
    assert.equal(Math.sign(a.lean), r.side === "right" ? 1 : -1, a.key);
    assert.ok(Math.abs(a.lean) >= 0.3, "a decided lean never sits at the middle");
  }
  const g = geometry.facetGeometry(facet, 300);
  for (const v of g.vertices) {
    const a = facet.find((x) => x.key === v.key);
    if (a.key.startsWith("R")) assert.ok(v.y <= 150, `${a.key} above the waterline`); else assert.ok(v.y >= 150, `${a.key} below`);
    if (!a.flex && !a.unfinished) assert.equal(v.lead, a.lean > 0 ? a.plus : a.minus, `${a.key} names the pole it leans to`);
  }
  const soft = geometry.facetGeometry([{ key: "R2", lean: 0, flex: true, plus: "Direct", minus: "Soft" }], 300).vertices.find((v) => v.key === "R2");
  assert.equal(soft.reach, 0.28);
  assert.equal(soft.double.length, 2);

  const lib = { axes: [{ id: "R1", plus: "We", minus: "Me" }], relationship: [], life: [], tags: [] };
  const flexView = buildStories({ result: { halves: [{ side: "relationship", name: "A", code: "We·Soft·Own", axes: [{ axis: "R1", pole: "We", flex: true }] }, { side: "life", name: "B", code: "Steady·Push·Rules", axes: [] }], tags: [], stings: [] }, lib, voice: "fun" });
  assert.equal(flexView.slides.find((s) => s.id === "map").facet[0].lean, 0);

  const html = await render(view);
  const map = slideHtml(html, "map");
  assert.ok(map.includes("Read it as a list") && map.includes("rv-maplist"), "the list is always in the DOM");
  assert.doesNotMatch(visible(map), /\d/);
});

test("the insight flips at its sentence boundary and sits whole when it is one sentence", async () => {
  const { splitInsight } = await load("/src/persona/stories/story-data.js");
  assert.deepEqual(splitInsight("You think of yourself as the gentle one. When it matters, you say it."), { belief: "You think of yourself as the gentle one.", behavior: "When it matters, you say it." });
  assert.deepEqual(splitInsight("Your hidden strength: people open up around you."), { belief: "Your hidden strength: people open up around you.", behavior: null });
  const { InsightFlip } = await load("/src/persona/reveal/InsightFlip.jsx");
  const two = renderToStaticMarkup(React.createElement(InsightFlip, { s: { kicker: "K", parts: splitInsight("One. Two.") } }));
  assert.match(two, /rv-insight__turn/);
  const one = renderToStaticMarkup(React.createElement(InsightFlip, { s: { kicker: "K", line: "Only one", parts: splitInsight("Only one") } }));
  assert.match(one, /is-single/);
  assert.match(one, /rv-insight__echo/);
});

test("story 9 has one primary job; the stings sheet only saves; the guess sheet defrosts every pane", async () => {
  for (const voice of ["fun", "heart"]) {
    const view = await realView(voice);
    const html = await render(view);
    const app = slideHtml(html, "app");
    assert.equal((app.match(/class="rv-cta /g) || []).length, 1, `${voice}: one primary button`);
    assert.ok(visible(app).includes("Your data"));
    const share = slideHtml(html, "share");
    assert.match(share, /Your opposite: .+ and .+\. Know one\?/);
  }
  const { ShareSheet, GuessSheet } = await load("/src/persona/reveal/Sheets.jsx");
  const stings = visible(renderToStaticMarkup(React.createElement(ShareSheet, { slide: { id: "stings", private: true }, onShare() {}, onSave() {} })));
  assert.ok(stings.includes("Save for me"));
  assert.ok(!stings.includes("Share image"));
  const other = visible(renderToStaticMarkup(React.createElement(ShareSheet, { slide: { id: "read" }, onShare() {}, onSave() {} })));
  assert.ok(other.includes("Share image") && other.includes("Save image"));
  const rows = Array.from({ length: 8 }, (_, i) => ({ key: `k${i}`, prompt: `P${i}`, status: i % 3 ? "hit" : "miss", label: i % 3 ? "Called it" : "Missed" }));
  const sheet = renderToStaticMarkup(React.createElement(GuessSheet, { guesses: { called: 8, exact: 5, rows } }));
  assert.equal((sheet.match(/rv-gpane__frost/g) || []).length, 8);
  assert.ok(visible(sheet).includes("5 of 8"));
});

test("the friend hero is the owner's arch under fog that clears to nothing", async () => {
  const { FriendMirrorHero } = await load("/src/persona/reveal/index.js");
  const full = renderToStaticMarkup(React.createElement(FriendMirrorHero, { ownerSeed: "abc123", fog: 1, pronoun: "she" }));
  assert.match(full, /data-art="mirror-arch"/);
  assert.match(full, /aria-hidden="true"/);
  const clear = renderToStaticMarkup(React.createElement(FriendMirrorHero, { ownerSeed: "abc123", fog: 0 }));
  assert.match(clear, /opacity:0\b/);
});
