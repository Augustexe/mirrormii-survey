// Package D, Step 0: asset library geometry, devices, color discipline and the stub's public surface.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { archPath, archPolygon, mosaic, polygonArea, facetGeometry, sigilParts, FACET_ANGLES } from "../src/art/geometry.js";
import { deviceFor, deviceFamily, DEVICE_FAMILIES, DEVICE_TABLE, keywordFamily, isChapterDevice } from "../src/art/devices.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const ART = path.join(here, "../src/art");
const BANK = path.join(here, "../../research/persona-quiz-v2/final/bank");
const digest = (o) => createHash("sha256").update(JSON.stringify(o)).digest("hex").slice(0, 16);

// ------------------------------------------------------------------ archPath and mosaic

// Round 4 (LAUNCH-SPEC 25): the World Mirror is a tall oval, a half circle of radius w/2 at the top and at the bottom.
test("archPath snapshot: the World Mirror's oval glass, a pill with half circles of radius w/2", () => {
  assert.equal(archPath(100, 200), "M0,50 A50,50 0 0 1 100,50 L100,150 A50,50 0 0 1 0,150 Z");
  assert.equal(archPath(320, 640), "M0,160 A160,160 0 0 1 320,160 L320,480 A160,160 0 0 1 0,480 Z");
  assert.equal(archPath(220, 360), "M0,110 A110,110 0 0 1 220,110 L220,250 A110,110 0 0 1 0,250 Z");
});

test("mosaic snapshots: identical seeds give identical polygons", () => {
  const a = mosaic("run-7f3a", 40, { w: 100, h: 200 });
  assert.deepEqual(a, mosaic("run-7f3a", 40, { w: 100, h: 200 }));
  assert.equal(digest(a), "5b0e945426a65239");
  assert.deepEqual(a.impact, [59.95, 88.09]);
  assert.equal(a.cells[0].path, "M59.95,88.09 L91.19,77.34 L71.79,112.58 Z");
  assert.equal(digest(mosaic(12345, 40, { w: 100, h: 200 })), "78b221941877a522");
  assert.equal(digest(mosaic("run-7f3a", 8, { w: 100, h: 200 })), "f171dc3bc1a7caf0");
});

test("mosaic: different seeds crack differently", () => {
  const seen = new Set();
  for (let i = 0; i < 50; i++) seen.add(digest(mosaic(`run-${i}`, 40, { w: 100, h: 200 }).cells));
  assert.equal(seen.size, 50);
});

test("mosaic: exactly `count` cells that tile the oval glass, ordered center out", () => {
  const archArea = Math.abs(polygonArea(archPolygon(100, 200)));
  for (let s = 0; s < 60; s++) {
    for (const count of [0, 1, 2, 3, 5, 8, 12, 40, 48]) {
      const m = mosaic(`seed-${s}`, count, { w: 100, h: 200 });
      assert.equal(m.cells.length, count, `seed-${s} count ${count}`);
      if (!count) continue;
      const area = m.cells.reduce((sum, c) => sum + Math.abs(polygonArea(c.points)), 0);
      assert.ok(Math.abs(area - archArea) < 3, `seed-${s} count ${count} covers ${area} of ${archArea}`);
      for (let i = 1; i < m.cells.length; i++) assert.ok(m.cells[i].distance >= m.cells[i - 1].distance);
      m.cells.forEach((c, i) => {
        assert.equal(c.index, i);
        assert.match(c.path, /^M[\d.,\sL-]+ Z$/);
        for (const [x, y] of c.points) assert.ok(x >= -0.01 && x <= 100.01 && y >= -0.01 && y <= 200.01);
      });
    }
  }
});

// ------------------------------------------------------------------ facet and sigils

test("facetGeometry: people above the waterline, life below, leans and Flex per story 4", () => {
  const axes = [
    { key: "R1", lean: 1, plus: "We", minus: "Me" },
    { key: "R2", lean: -0.5, plus: "Direct", minus: "Soft" },
    { key: "R3", lean: 0.2, flex: true, plus: "Classic", minus: "Own" },
    { key: "L1", lean: 0.6, plus: "Steady", minus: "Venture" },
    { key: "L2", lean: -1, plus: "Push", minus: "Easy" },
    { key: "L3", lean: 0, unfinished: true, plus: "Rules", minus: "Context" },
  ];
  const g = facetGeometry(axes, 300);
  const by = Object.fromEntries(g.vertices.map((vx) => [vx.key, vx]));
  for (const k of ["R1", "R2", "R3"]) assert.ok(by[k].y < g.center[1], `${k} above`);
  for (const k of ["L1", "L2", "L3"]) assert.ok(by[k].y > g.center[1], `${k} below`);
  assert.equal(by.R1.reach, 1);
  assert.equal(by.R2.reach, 0.64);
  assert.equal(by.R1.angle, FACET_ANGLES.R1 + 8);
  assert.equal(by.R2.angle, FACET_ANGLES.R2 - 8);
  assert.equal(by.R1.lead, "We");
  assert.equal(by.R2.lead, "Soft");
  assert.equal(by.R3.reach, 0.28);
  assert.equal(by.R3.double.length, 2);
  assert.equal(by.L3.reach, 0.28);
  assert.ok(by.L3.double);
  assert.equal(g.facetLines.length, 3);
  assert.deepEqual(facetGeometry(axes, 300), g);
});

test("sigils: 16 distinct silhouettes from the poles", () => {
  const rel = [];
  for (const a of ["We", "Me"]) for (const b of ["Direct", "Soft"]) for (const c of ["Classic", "Own"]) rel.push(`${a}·${b}·${c}`);
  const life = [];
  for (const a of ["Steady", "Venture"]) for (const b of ["Push", "Easy"]) for (const c of ["Rules", "Context"]) life.push(`${a}·${b}·${c}`);
  const shapes = new Set([...rel, ...life].map((code) => JSON.stringify(sigilParts(code).map((p) => [p.d, p.dash, p.fill]))));
  assert.equal(shapes.size, 16);
  for (const code of [...rel, ...life]) assert.ok(sigilParts(code).length >= 3, code);
});

// ------------------------------------------------------------------ deviceFor covers the bank

function bankCards() {
  const cards = [];
  for (const file of fs.readdirSync(BANK).filter((f) => f.endsWith(".json")).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(BANK, file), "utf8"));
    const list = Array.isArray(data) ? data : Array.isArray(data?.cards) ? data.cards : [];
    for (const card of list) if (card && typeof card === "object" && card.fp?.device) cards.push({ file, card });
  }
  return cards;
}

test("deviceFor maps every fp.device in the bank to a family or an intentional chapter fallback", (t) => {
  const cards = bankCards();
  assert.ok(cards.length >= 150, `expected the device-tagged bank, found ${cards.length}`);
  const devices = new Set(cards.map(({ card }) => card.fp.device));
  assert.ok(devices.size >= 38);
  const unmapped = [];
  for (const { file, card } of cards) {
    const id = deviceFor(card);
    const where = `${file} ${card.id} ${card.fp.device} (${card.world})`;
    if (card.world === "everyday") {
      assert.equal(id, null, `${where}: everyday cards carry no vignette`);
      continue;
    }
    assert.ok(DEVICE_FAMILIES.includes(id) || isChapterDevice(id), `${where} -> ${id}`);
    if (card.world === "unusual") assert.ok(isChapterDevice(id), `${where}: unusual cards use the chapter vignette`);
    if (card.world === "absurd") {
      // Absurd devices are mapped on purpose in the table; a device the bank adds or rewrites before the table learns
      // it falls back to keywords (then the chapter vignette), so it is reported, not failed (round 2: the bank moves).
      if (!Object.prototype.hasOwnProperty.call(DEVICE_TABLE, card.fp.device)) {
        unmapped.push(`${card.fp.device} -> ${id}`);
        continue;
      }
      const family = DEVICE_TABLE[card.fp.device];
      if (family === "chapter") assert.ok(isChapterDevice(id), where);
      else assert.equal(id, family, where);
    }
  }
  if (unmapped.length) t.diagnostic(`absurd devices mapped by keyword, not yet in DEVICE_TABLE: ${[...new Set(unmapped)].join(", ")}`);
  for (const family of Object.values(DEVICE_TABLE)) assert.ok(family === "chapter" || DEVICE_FAMILIES.includes(family), family);
  assert.equal(DEVICE_FAMILIES.length, 24);
});

test("every device family has a glyph; removed cards' devices are gone; unknown devices still get a glyph or vignette", async (t) => {
  const { DEVICE_GLYPHS } = await import("../src/art/shapes.js");
  for (const family of DEVICE_FAMILIES) assert.ok(DEVICE_GLYPHS[family]?.l, `glyph for ${family}`);
  for (const gone of ["unlockable-wish-phone", "flickering-lamp", "fairy-godparent", "shared-genie-wish", "wizard-apprentice", "wish-granting-duty", "wishing-well-door", "genie-fame-deal"]) {
    assert.ok(!Object.prototype.hasOwnProperty.call(DEVICE_TABLE, gone), `${gone} was removed from the bank`);
  }
  // Rows the bank no longer uses are reported, not failed: the bank moves while card writers work (round 2).
  const absurd = new Set(bankCards().filter(({ card }) => card.world === "absurd").map(({ card }) => card.fp.device));
  const stale = Object.keys(DEVICE_TABLE).filter((d) => !absurd.has(d));
  if (stale.length) t.diagnostic(`DEVICE_TABLE rows no absurd card uses right now: ${stale.join(", ")}`);
  // Graceful fallback for a device a concurrent bank edit adds: every absurd card of every chapter resolves.
  for (const { card } of bankCards()) {
    const id = deviceFor({ ...card, fp: { ...card.fp, device: `new-${card.fp.device}-${card.id}` } });
    if (card.world === "everyday") assert.equal(id, null);
    else assert.ok(DEVICE_FAMILIES.includes(id) || isChapterDevice(id), `${card.id} -> ${id}`);
  }
  assert.equal(deviceFor({ id: "S-132", type: "sealed", world: "absurd", fp: { device: "achievement-mountain" } }), "mountain");
  assert.equal(deviceFor({ id: "C3-80", chapter: 3, world: "absurd", fp: { device: "two-person-sweater" } }), "yarn");
  assert.equal(deviceFor({ id: "C5-126", chapter: 5, world: "absurd", fp: { device: "snail-racer" } }), "shell");
  assert.equal(deviceFor({ id: "C4-53", chapter: 4, world: "absurd", fp: { device: "balloon-date-bill" } }), "balloon");
});

test("no lamp and no genie: Genii is a slime, so no device family, glyph or keyword draws a lamp (round 2)", () => {
  assert.ok(!DEVICE_FAMILIES.includes("lamp"));
  assert.ok(!Object.values(DEVICE_TABLE).includes("lamp"));
  for (const text of ["a genie lamp", "Genii grants one wish", "a fairy godparent", "a wizard's apprentice", "a flickering lamp", "Genii offers you a deal"]) {
    const family = keywordFamily(text);
    assert.ok(family && family !== "lamp" && DEVICE_FAMILIES.includes(family), `${text} -> ${family}`);
  }
  assert.equal(keywordFamily("Genii grants one wish a year"), "star");
  assert.equal(keywordFamily("Genii offers you a phone that never dies"), "gift");
  assert.equal(keywordFamily("an invitation to every wedding"), "envelope");
  // Specific objects beat the generic Genii offer.
  assert.equal(keywordFamily("Genii offers a polite tornado"), "weather");
  // "start" is not a star.
  assert.equal(keywordFamily("you start a new job"), null);
});

test("deviceFor chapter fallbacks name the right chapter; keyword table matches section 6", () => {
  assert.equal(deviceFor({ id: "C4-1", chapter: 4, world: "unusual", fp: { device: "x" } }), "chapter-4");
  assert.equal(deviceFor({ id: "S-9", type: "sealed", world: "absurd", fp: { device: "reunion-name-tag" } }), "chapter-finale");
  assert.equal(deviceFor({ id: "X-R3-31", world: "absurd", fp: { device: "unheard-oddity" } }), "chapter-extras");
  assert.equal(deviceFor({ id: "C4-123", chapter: 4, world: "absurd", fp: { device: "polite-tornado" } }), "weather");
  assert.equal(deviceFor(null), null);
  assert.equal(keywordFamily("a talking doorbell"), "bell");
  assert.equal(keywordFamily("a fairy with one wish"), "star");
  assert.equal(keywordFamily("the magic 8-ball"), "fortune");
  assert.equal(keywordFamily("a ten year sleep"), "time");
  assert.equal(deviceFamily("unheard-of-thing", "A mermaid knocks"), "water");
});

// ------------------------------------------------------------------ color discipline

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

test("no hex color literals in src/art outside the token-mirrored canvas defaults (palette.js)", () => {
  const offenders = [];
  for (const file of walk(ART)) {
    if (!/\.(m?jsx?|css|svg)$/.test(file) || path.basename(file) === "palette.js") continue;
    const text = fs.readFileSync(file, "utf8");
    const hits = text.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (hits) offenders.push(`${path.relative(ART, file)}: ${hits.join(", ")}`);
  }
  assert.deepEqual(offenders, []);
});

test("no em dashes in src/art", () => {
  for (const file of walk(ART)) assert.ok(!fs.readFileSync(file, "utf8").includes("\u2014"), file);
});

// ------------------------------------------------------------------ the stub's public surface (7.3)

test("src/art/index.js exports every 7.3 component and function; each renders aria-hidden with className", async () => {
  const server = await createServer({ root: path.join(here, ".."), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  try {
    const art = await server.ssrLoadModule("/src/art/index.js");
    const fns = ["deviceFor", "sigilFor"];
    for (const name of fns) assert.equal(typeof art[name], "function", name);
    assert.equal(typeof art.geometry.archPath, "function");
    assert.equal(typeof art.geometry.mosaic, "function");
    assert.equal(typeof art.geometry.facetGeometry, "function");
    assert.equal(typeof art.geometry.sigilParts, "function");
    assert.equal(typeof art.shapes.SPARKLE, "string");
    const cases = {
      MirrorArch: { seed: "run-1", filled: [{ chapter: 1 }, { chapter: 2 }], fog: 0.5, glow: 0.6, mullion: true, size: 320 },
      Islet: { chapter: 3, size: 120 },
      ChapterGlyph: { chapter: "finale" },
      FormatGlyph: { type: "receipts" },
      DeviceGlyph: { id: "bell" },
      SetupGlyph: { id: "partner" },
      RoomDoor: { room: "love", open: false },
      Facet: { axes: [{ key: "R1", lean: 0.5 }], size: 300, theme: "night" },
      Sigil: { code: "We·Soft·Own" },
      EmotionBead: { emotion: "delight" },
      Sparkle: {},
      SparkleBurst: { count: 6, origin: { x: 10, y: 20 } },
      LockPane: { state: "sealed" },
      Backdrop: { scene: "island-2", animated: false },
    };
    for (const [name, props] of Object.entries(cases)) {
      assert.equal(typeof art[name], "function", `${name} exported`);
      const html = renderToStaticMarkup(React.createElement(art[name], { ...props, className: "probe" }));
      assert.match(html, /^<[a-z]+[^>]*aria-hidden="true"/, `${name} aria-hidden`);
      assert.match(html, /class="probe"/, `${name} className passthrough`);
      assert.ok(!/<text\b/.test(html), `${name} bakes no text`);
    }
    for (const chapter of [1, 7, "extras", "finale"]) assert.match(renderToStaticMarkup(React.createElement(art.Islet, { chapter })), /assets\/island\/(?:ch\d|hero-portrait)-\d+\.webp/);
    for (const state of ["clear", "frosted", "sealed", "hit", "miss", "pass"]) renderToStaticMarkup(React.createElement(art.LockPane, { state }));
    for (const scene of ["day", "dusk", "clear", "night", "island-9"]) renderToStaticMarkup(React.createElement(art.Backdrop, { scene }));
    assert.match(renderToStaticMarkup(React.createElement(art.DeviceGlyph, { id: "chapter-4" })), /assets\/island\/ch4-360\.webp/);
  } finally {
    await server.close();
  }
});
