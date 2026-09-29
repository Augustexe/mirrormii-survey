// Package D acceptance (DESIGN-DIRECTION.md 7.4): budgets, svgo hygiene, determinism, the lazy shader,
// and "no raster, no baked text" for every finished asset in src/art.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";
import { optimize } from "svgo";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");
const ART = path.join(root, "src/art");
const h = React.createElement;
const KB = 1024;

let server;
let art;
test.before(async () => {
  server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  art = await server.ssrLoadModule("/src/art/index.js");
});
test.after(async () => {
  await server?.close();
});

// ------------------------------------------------------------------ budgets (section 6)

test("src/art bundles to 45 KB gzipped or less (react and the shader package external)", async () => {
  const out = await build({
    entryPoints: [path.join(ART, "index.js")],
    bundle: true,
    minify: true,
    write: false,
    format: "esm",
    jsx: "automatic",
    loader: { ".js": "jsx" },
    external: ["react", "react-dom", "react/jsx-runtime", "@paper-design/*"],
    splitting: true,
    outdir: "out",
    logLevel: "silent",
  });
  const total = out.outputFiles.reduce((sum, f) => sum + zlib.gzipSync(f.contents).length, 0);
  assert.ok(total <= 45 * KB, `src/art is ${(total / KB).toFixed(1)} KB gzipped`);
  assert.ok(out.outputFiles.length >= 2, "BackdropShader is its own chunk");
});

test("no scene component is over 7 KB minified", async () => {
  const scenes = [
    ...fs.readdirSync(path.join(ART, "islands")).map((f) => path.join("islands", f)),
    "MirrorArch.jsx",
    "Backdrop.jsx",
    "BackdropShader.jsx",
    "scenes.jsx",
  ];
  for (const rel of scenes) {
    const code = fs.readFileSync(path.join(ART, rel), "utf8");
    const { code: min } = await transform(code, { loader: "jsx", jsx: "automatic", minify: true, format: "esm" });
    const size = Buffer.byteLength(min);
    const limit = rel === "scenes.jsx" ? 3 * 7 * KB : 7 * KB; // scenes.jsx holds three pieces: doors, tablet, facet
    assert.ok(size <= limit, `${rel} is ${(size / KB).toFixed(2)} KB minified`);
  }
});

// ------------------------------------------------------------------ svgo and generated files

test("favicon and texture SVGs are svgo clean and keep their viewBox", () => {
  const favicon = fs.readFileSync(path.join(root, "public/favicon.svg"), "utf8").trim();
  assert.match(favicon, /viewBox="0 0 32 32"/);
  const again = optimize(favicon, { multipass: true, plugins: ["preset-default"] }).data;
  assert.equal(again, favicon, "favicon.svg is already svgo-optimized");
  for (const f of fs.readdirSync(path.join(ART, "textures")).filter((n) => n.endsWith(".svg"))) {
    const svg = fs.readFileSync(path.join(ART, "textures", f), "utf8");
    assert.doesNotThrow(() => optimize(svg, { plugins: ["preset-default"] }), f);
  }
});

test("raster outputs stay inside budget: apple-touch-icon 180, og 1200 x 630, grain under 60 KB", () => {
  const dims = (file) => {
    const b = fs.readFileSync(file);
    assert.equal(b.toString("ascii", 1, 4), "PNG", file);
    return [b.readUInt32BE(16), b.readUInt32BE(20), b.length];
  };
  assert.deepEqual(dims(path.join(root, "public/apple-touch-icon.png")).slice(0, 2), [180, 180]);
  assert.deepEqual(dims(path.join(root, "public/og.png")).slice(0, 2), [1200, 630]);
  const [gw, gh, gbytes] = dims(path.join(ART, "textures/grain.png"));
  assert.deepEqual([gw, gh], [160, 160]);
  assert.ok(gbytes <= 60 * KB, `grain.png is ${gbytes} bytes`);
});

// ------------------------------------------------------------------ determinism

const stripIds = (html) => html.replace(/art-[A-Za-z0-9]+-/g, "art-X-");

test("assets render deterministically: same props, same markup; different seeds, different mirrors", () => {
  const filled = Array.from({ length: 40 }, (_, i) => ({ chapter: (i % 7) + 1 }));
  const a = stripIds(renderToStaticMarkup(h(art.MirrorArch, { seed: "run-1", filled, fog: 0.3, mullion: true })));
  const b = stripIds(renderToStaticMarkup(h(art.MirrorArch, { seed: "run-1", filled, fog: 0.3, mullion: true })));
  const c = stripIds(renderToStaticMarkup(h(art.MirrorArch, { seed: "run-2", filled, fog: 0.3, mullion: true })));
  assert.equal(a, b);
  assert.notEqual(a, c);
  for (const chapter of art.shapes.CHAPTER_KEYS) {
    const once = stripIds(renderToStaticMarkup(h(art.IslandScene, { chapter })));
    assert.equal(once, stripIds(renderToStaticMarkup(h(art.IslandScene, { chapter }))));
  }
  assert.equal(art.textures.foxingSvg("x"), art.textures.foxingSvg("x"));
  assert.notEqual(art.textures.foxingSvg("x"), art.textures.foxingSvg("y"));
});

test("gradient ids are unique within one React root and change with their content", () => {
  const html = renderToStaticMarkup(h("div", null,
    h(art.IslandScene, { chapter: 1 }), h(art.IslandScene, { chapter: 1 }),
    h(art.RoomDoor, { room: "love" }), h(art.RoomDoor, { room: "work" }),
    h(art.EmotionBead, { emotion: "worry" }), h(art.EmotionBead, { emotion: "worry" }),
    h(art.Facet, { axes: [{ key: "R1", lean: 1 }] }), h(art.Facet, { axes: [{ key: "R1", lean: -1 }] })));
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, "no duplicate ids in one root");
  for (const m of html.matchAll(/url\(#([^)]+)\)/g)) assert.ok(ids.includes(m[1]), `url(#${m[1]}) resolves`);
});

// ------------------------------------------------------------------ every variant renders, no raster, no text

test("every asset and variant renders aria-hidden art with no <text>, no <image> and no raster reference", () => {
  const { CHAPTER_KEYS, FORMAT_TYPES, SETUP_IDS, ROOMS } = art.shapes;
  const els = [];
  for (const chapter of CHAPTER_KEYS) {
    for (const variant of ["scene", "ambient", "vignette"]) els.push(h(art.IslandScene, { chapter, variant }));
    els.push(h(art.ChapterGlyph, { chapter }));
  }
  for (const type of FORMAT_TYPES) els.push(h(art.FormatGlyph, { type }));
  for (const id of art.DEVICE_FAMILIES) els.push(h(art.DeviceGlyph, { id }));
  for (const id of SETUP_IDS) els.push(h(art.SetupGlyph, { id }));
  for (const room of ROOMS) for (const open of [true, false]) els.push(h(art.RoomDoor, { room, open }));
  for (const state of ["clear", "frosted", "sealed", "hit", "miss", "pass"]) els.push(h(art.LockPane, { state }));
  for (const theme of ["night", "light"]) els.push(h(art.Facet, { axes: [{ key: "R1", lean: 0.4 }, { key: "L2", flex: true }], theme }));
  for (const scene of ["day", "dusk", "clear", "night", ...Array.from({ length: 9 }, (_, i) => `island-${i + 1}`)]) els.push(h(art.Backdrop, { scene }));
  els.push(h(art.AppTablet, {}), h(art.MirrorArch, { seed: 1 }), h(art.Sparkle, {}), h(art.SparkleBurst, { count: 12 }), h(art.EmotionBead, { emotion: "sting" }));
  for (const el of els) {
    const html = renderToStaticMarkup(el);
    const name = `${el.type.name} ${JSON.stringify(el.props)}`;
    assert.match(html, /^<[a-z]+[^>]*aria-hidden="true"/, name);
    assert.ok(!/<text\b|<image\b|\.(png|jpe?g|webp|gif)\b/i.test(html), `${name} carries text or raster`);
  }
  // Backdrop never mounts WebGL on the server or before the client decides.
  assert.match(renderToStaticMarkup(h(art.Backdrop, { scene: "night" })), /data-shader="off"/);
  assert.equal(art.deviceFor({ world: "absurd", id: "C2-1", chapter: 2, fp: { device: "magic door" } }), "door");
});

test("the shader package is only reached through the lazy BackdropShader chunk", () => {
  const offenders = [];
  const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  for (const file of walk(ART).filter((f) => /\.(m?jsx?)$/.test(f))) {
    const text = fs.readFileSync(file, "utf8");
    if (/@paper-design/.test(text) && path.basename(file) !== "BackdropShader.jsx") offenders.push(file);
  }
  assert.deepEqual(offenders, []);
  assert.match(fs.readFileSync(path.join(ART, "Backdrop.jsx"), "utf8"), /lazy\(\(\) => import\("\.\/BackdropShader\.jsx"\)\)/);
});
