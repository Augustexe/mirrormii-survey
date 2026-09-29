// Genii evolves (LAUNCH-SPEC section 23, ruling 1): the orb grows into Genii's real form as the player answers. These
// tests pin the stage mapping (play state to evolution to stage and form weights), the geometry every renderer shares,
// and the GeniiLight markup at each stage. three.js stays out of the first paint: only scene.js imports it, lazily.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

let server;
const load = (p) => server.ssrLoadModule(p);
const src = (p) => fs.readFileSync(new URL(`../src/${p}`, import.meta.url), "utf8");

test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
});
test.after(async () => { await server.close(); });

test("evolutionFor: cards answered over run length, complete at the lock, finale and reveal", async () => {
  const G = await load("/src/genii/evolution.js");
  assert.equal(G.evolutionFor({ answered: 0, total: 40 }), 0);
  assert.equal(G.evolutionFor({ answered: 40, total: 40 }), 1);
  for (const phase of ["lock", "finale", "reveal", "result"]) assert.equal(G.evolutionFor({ answered: 3, total: 40, phase }), 1, phase);
  assert.equal(G.evolutionFor({ answered: 12, total: 40, phase: "chapter" }), G.evolutionFor({ answered: 12, total: 40 }));
  let prev = -1;
  for (let n = 0; n < 40; n++) {
    const e = G.evolutionFor({ answered: n, total: 40 });
    assert.ok(e > prev, `rises every card (${n})`);
    assert.ok(e <= G.PRE_LOCK_CAP, "stops short of complete before the lock");
    prev = e;
  }
  // A light ease-out: a quarter of the run is a little past a quarter of the way.
  const q = G.evolutionFor({ answered: 10, total: 40 });
  assert.ok(q > 0.25 && q < 0.35, `quarter run ${q}`);
  // Confidence nudges, never dominates.
  const lo = G.evolutionFor({ answered: 20, total: 40, confidence: 0 });
  const hi = G.evolutionFor({ answered: 20, total: 40, confidence: 1 });
  assert.ok(hi > lo && hi - lo <= 0.16);
  // Bad input stays safe.
  assert.equal(G.evolutionFor({ answered: -5, total: 40 }), 0);
  assert.equal(G.evolutionFor({ answered: "x", total: 0 }), 0);
  assert.equal(G.evolutionFor(), 0);
  assert.equal(G.evolutionFor({ answered: 60, total: 40 }), 1);
});

test("stageOf: orb, droplet, bead, eyes, Genii at the brief's marks", async () => {
  const G = await load("/src/genii/evolution.js");
  const at = { 0: "orb", 0.1: "orb", 0.25: "droplet", 0.5: "bead", 0.7: "eyes", 0.75: "eyes", 0.95: "genii", 1: "genii" };
  for (const [e, id] of Object.entries(at)) assert.equal(G.stageOf(Number(e)), id, `evolution ${e}`);
  assert.equal(G.stageOf(-1), "orb");
  assert.equal(G.stageOf(7), "genii");
  assert.deepEqual(G.EVOLUTION_STAGES.map((s) => s.id), ["orb", "droplet", "bead", "eyes", "genii"]);
});

test("formAt: each stage adds its part, in order, and full Genii has every part", async () => {
  const G = await load("/src/genii/evolution.js");
  const f0 = G.formAt(0);
  assert.equal(f0.glow, 1);
  assert.equal(f0.drop, 0);
  assert.equal(f0.bead, 0);
  assert.equal(f0.eyes, 0);
  const f25 = G.formAt(0.25);
  assert.ok(f25.drop > 0.3 && f25.drop < 1, "0.25: the sphere is pulling into a teardrop");
  assert.equal(f25.bead, 0);
  const f5 = G.formAt(0.5);
  assert.ok(f5.bead > 0.9, "0.5: the bead has popped out");
  assert.equal(f5.eyes, 0);
  const f7 = G.formAt(0.7);
  assert.ok(f7.eyes > 0.5, "0.7: the eyes are open");
  assert.equal(f7.expressive, 0, "expressions wait for full Genii");
  const f1 = G.formAt(1);
  for (const k of ["glass", "drop", "bead", "eyes", "expressive", "scale"]) assert.equal(f1[k], 1, k);
  assert.equal(f1.glow, 0);
  // Every weight is monotonic in evolution (the form never steps back as the player answers).
  const keys = ["glass", "drop", "bead", "eyes", "expressive", "scale"];
  let last = G.formAt(0);
  for (let i = 1; i <= 100; i++) {
    const f = G.formAt(i / 100);
    for (const k of keys) assert.ok(f[k] >= last[k], `${k} at ${i / 100}`);
    assert.ok(f.glow <= last.glow);
    last = f;
  }
});

test("geometry: a sphere at the orb, a droplet with the tip up and to the right at full Genii", async () => {
  const G = await load("/src/genii/evolution.js");
  for (const p of G.silhouette(0, 36)) assert.ok(Math.abs(Math.hypot(p[0], p[1]) - 1) < 1e-9, "stage 0 is round");
  const full = G.silhouette(1, 360);
  const far = full.reduce((a, p) => (Math.hypot(p[0], p[1]) > Math.hypot(a[0], a[1]) ? p : a));
  assert.ok(far[0] > 0 && far[1] > 0, "the farthest point (the tip) is top right");
  const xs = full.map((p) => p[0]), ys = full.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  assert.ok(w > 1.9 && w < 2.2, `body width ${w}`);
  assert.ok(h > 1.6 && h < 2.0, `wider than tall, like the canon renders (${h})`);
  const bead = G.beadCenter(1);
  assert.ok(bead[0] > 0.4 && bead[1] > 0.8, "the bead sits at the tip");
});

test("eyes: two eyes, every expression morphs point by point, a blink closes them", async () => {
  const G = await load("/src/genii/evolution.js");
  const faces = {};
  for (const x of G.EXPRESSIONS) {
    const eyes = G.eyesFor(x);
    assert.equal(eyes.length, 2, x);
    for (const eye of eyes) assert.equal(eye.length, G.EYE_POINTS, x);
    faces[x] = JSON.stringify(eyes);
  }
  assert.equal(new Set(Object.values(faces)).size, G.EXPRESSIONS.length, "every expression is its own face");
  const open = G.eyesFor("alert"), shut = G.eyesFor("alert", 1);
  const height = (eye) => Math.max(...eye.map((p) => p[1])) - Math.min(...eye.map((p) => p[1]));
  assert.ok(height(shut[0]) < height(open[0]) * 0.15, "a blink closes the eye");
  const a = G.eyesFor("alert"), b = G.eyesFor("happy");
  const close = (x, y) => x.every((eye, i) => eye.every((p, j) => Math.abs(p[0] - y[i][j][0]) < 1e-9 && Math.abs(p[1] - y[i][j][1]) < 1e-9));
  assert.ok(close(G.mixEyes(a, b, 0), a));
  assert.ok(close(G.mixEyes(a, b, 1), b));
  // The face sits left of center, with the bead at the top right (canon).
  const cx = open.flat().reduce((s, p) => s + p[0], 0) / (G.EYE_POINTS * 2);
  assert.ok(cx < 0, "the face looks left of center");
  assert.equal(G.expressionFor("listening"), "alert");
  assert.equal(G.expressionFor("noted"), "curious");
  assert.equal(G.expressionFor("hush"), "skeptical");
  assert.equal(G.expressionFor("sure"), "happy");
  assert.equal(G.expressionFor("thinking"), "thinking");
  assert.equal(G.expressionFor("nonsense"), "alert");
});

test("GeniiLight with evolution: orb at 0, the form from the first answer, eyes only from 0.7, complete at the lock", async () => {
  const { GeniiLight } = await load("/src/system/index.js");
  const html = (props) => renderToStaticMarkup(React.createElement(GeniiLight, { size: "l", ...props }));
  const orb = html({ evolution: 0 });
  assert.match(orb, /data-stage="orb"/);
  assert.doesNotMatch(orb, /genii-form/, "stage 0 is the CSS orb, three.js never loads");
  assert.match(html({}), /data-stage="orb"/, "no evolution is the orb (landing, lobby, setup)");
  const drop = html({ evolution: 0.25 });
  assert.match(drop, /data-stage="droplet"/);
  assert.match(drop, /genii-form/);
  assert.match(drop, /genii-light__core/, "the orb's light stays while the body forms");
  assert.doesNotMatch(drop, /genii-svg__eye/);
  assert.doesNotMatch(html({ evolution: 0.5 }), /genii-svg__eye/, "no eyes at the bead stage");
  assert.match(html({ evolution: 0.5 }), /<circle/, "the bead is drawn");
  const full = html({ evolution: 1 });
  assert.match(full, /data-stage="genii"/);
  assert.equal((full.match(/genii-svg__eye/g) || []).length, 2, "two eyes");
  assert.match(html({ evolution: { answered: 3, total: 40, phase: "finale" } }), /data-stage="genii"/, "finale is complete");
  assert.match(html({ evolution: { answered: 20, total: 40 } }), /data-stage="bead"/, "play state maps to a stage");
  for (const e of [0, 0.25, 0.5, 0.75, 1]) {
    const m = html({ evolution: e, mood: "sure" });
    assert.doesNotMatch(m, /<img|\.webp|\.png|wisp|smoke|lamp/, `code-made, no lamp (${e})`);
    assert.match(m, /aria-hidden="true"/);
  }
  // Every call site's size renders at full evolution.
  for (const size of ["xs", "s", "m", "l", "xl"]) assert.match(renderToStaticMarkup(React.createElement(GeniiLight, { size, evolution: 1 })), /genii-svg/, size);
});

test("three.js is a lazy chunk: only scene.js imports it, and only through a dynamic import", () => {
  const files = ["genii/evolution.js", "genii/GeniiForm.jsx", "genii/GeniiSvg.jsx", "genii/index.js", "system/GeniiLight.jsx", "system/index.js"];
  for (const f of files) assert.doesNotMatch(src(f), /from "three"/, f);
  assert.match(src("genii/scene.js"), /from "three"/);
  assert.match(src("genii/GeniiForm.jsx"), /import\("\.\/scene\.js"\)/);
  assert.doesNotMatch(src("genii/index.js"), /from "\.\/scene/);
  const scene = src("genii/scene.js");
  assert.match(scene, /MeshPhysicalMaterial/);
  for (const k of ["transmission", "iridescence", "clearcoat", "thickness"]) assert.match(scene, new RegExp(k), k);
  assert.match(scene, /Math\.min\(2,/, "device pixel ratio capped at 2");
  const form = src("genii/GeniiForm.jsx");
  assert.match(form, /IntersectionObserver/, "pauses offscreen");
  assert.match(form, /visibilitychange/, "pauses when the tab is hidden");
  assert.match(form, /prefers-reduced-motion/, "reduced motion renders a still frame");
});
