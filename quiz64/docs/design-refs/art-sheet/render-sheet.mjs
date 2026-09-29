// Package D visual reference sheet: renders every src/art asset (server-side React into one HTML page
// with the real tokens.css), then screenshots it with Playwright Chrome into PNGs next to this file.
//
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node docs/design-refs/art-sheet/render-sheet.mjs
//
// Output: docs/design-refs/art-sheet/sheet.html, sheet.png (full page) and one PNG per section.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const h = React.createElement;

const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
const art = await server.ssrLoadModule("/src/art/index.js");
const { CHAPTER_KEYS, FORMAT_TYPES, SETUP_IDS, ROOMS } = art.shapes;
await server.close();

const tokens = fs.readFileSync(path.join(root, "src/system/tokens.css"), "utf8")
  .replace('html[data-theme="dusk"]', 'html[data-theme="dusk"], .t-dusk')
  .replace('html[data-theme="clear"]', 'html[data-theme="clear"], .t-clear');

// Every asset is rendered inside ONE React root (as in the app), so useId keeps gradient ids unique.
const pending = [];
const r = (el) => `@@ART${pending.push(el) - 1}@@`;
function flush(text) {
  const marked = renderToStaticMarkup(h(React.Fragment, null, pending.map((el, i) => h(React.Fragment, { key: i }, h("template", { "data-m": i }), el))));
  const parts = marked.split(/<template data-m="\d+"><\/template>/).slice(1);
  return text.replace(/@@ART(\d+)@@/g, (_, i) => parts[Number(i)]);
}
const cell = (label, inner, cls = "") => `<figure class="cell ${cls}"><div class="art">${inner}</div><figcaption>${label}</figcaption></figure>`;
const sections = [];
const section = (id, title, body, cls = "") => sections.push({ id, html: `<section id="${id}" class="${cls}"${/night/.test(cls) ? ' data-scene="night"' : ""}><h2>${title}</h2><div class="row">${body}</div></section>` });

const mixed = (n) => Array.from({ length: n }, (_, i) => ({ chapter: Math.min(7, Math.floor((i * 7) / 40) + 1) }));

section("arch", "A-01 MirrorArch (seeded mosaic, fog, glow, mullion)", [
  cell("seed run-7f3a, empty, glow .6", r(h(art.MirrorArch, { seed: "run-7f3a", size: 200 }))),
  cell("12 shards filled", r(h(art.MirrorArch, { seed: "run-7f3a", filled: mixed(12), size: 200 }))),
  cell("40 filled + mullion", r(h(art.MirrorArch, { seed: "run-7f3a", filled: mixed(40), mullion: true, size: 200 }))),
  cell("fog .75", r(h(art.MirrorArch, { seed: "run-7f3a", filled: mixed(40), fog: 0.75, mullion: true, size: 200 }))),
  cell("seed run-b21c, glow 1", r(h(art.MirrorArch, { seed: "run-b21c", filled: mixed(40), glow: 1, mullion: true, size: 200 }))),
  cell("seed 12345, glow 0", r(h(art.MirrorArch, { seed: 12345, filled: mixed(26), glow: 0, size: 200 }))),
].join(""));
section("arch-night", "A-01 on night", [
  cell("night, 40 filled", r(h(art.MirrorArch, { seed: "night-1", filled: mixed(40), mullion: true, glow: 0.9, size: 220 }))),
  cell("night, fogged", r(h(art.MirrorArch, { seed: "night-1", filled: mixed(40), mullion: true, fog: 0.9, glow: 0.8, size: 220 }))),
  cell("small 72", r(h(art.MirrorArch, { seed: "night-2", filled: mixed(18), size: 72 }))),
].join(""), "night");

section("islands", "A-03 IslandScene, scene (320)", CHAPTER_KEYS.map((c) => cell(`${c}: ${art.ISLAND_NAMES[typeof c === "number" ? `ch${c}` : c]}`, r(h(art.IslandScene, { chapter: c, size: 300 })))).join(""));
section("islands-ambient", "A-03 ambient (8% silhouette) and vignette (48 and 96)", CHAPTER_KEYS.map((c) => cell(String(c), `<div class="stack">${r(h(art.IslandScene, { chapter: c, variant: "ambient", size: 120 }))}<span class="well">${r(h(art.IslandScene, { chapter: c, variant: "vignette", size: 48 }))}</span>${r(h(art.IslandScene, { chapter: c, variant: "vignette", size: 96 }))}</div>`)).join(""));

section("chapter-glyphs", "A-04 ChapterGlyph (24, 48)", CHAPTER_KEYS.map((c) => cell(String(c), `${r(h(art.ChapterGlyph, { chapter: c, size: 24 }))} ${r(h(art.ChapterGlyph, { chapter: c, size: 48 }))}`)).join(""));
section("format-glyphs", "A-06 FormatGlyph (16, 24, 48)", FORMAT_TYPES.map((t) => cell(t, `${r(h(art.FormatGlyph, { type: t, size: 16 }))} ${r(h(art.FormatGlyph, { type: t, size: 24 }))} ${r(h(art.FormatGlyph, { type: t, size: 48 }))}`)).join(""));
section("device-glyphs", "A-05 DeviceGlyph families (24, 48 in a violet-100 well)", [...art.DEVICE_FAMILIES, "chapter-2", "chapter-extras"].map((id) => cell(id, `${r(h(art.DeviceGlyph, { id, size: 24 }))} <span class="well">${r(h(art.DeviceGlyph, { id, size: 48 }))}</span>`)).join(""));
section("setup-glyphs", "A-09 SetupGlyph (40; and selected: white on deep)", SETUP_IDS.map((id) => cell(id, `${r(h(art.SetupGlyph, { id, size: 40 }))} <span class="sel">${r(h(art.SetupGlyph, { id, size: 40 }))}</span>`)).join(""));
section("doors", "A-10 RoomDoor (open, closed)", ROOMS.map((room) => cell(room, `${r(h(art.RoomDoor, { room, open: true, size: 112 }))} ${r(h(art.RoomDoor, { room, open: false, size: 112 }))}`)).join(""));

const axesA = [
  { key: "R1", lean: 0.9, plus: "We", minus: "Me" }, { key: "R2", lean: -0.5, plus: "Direct", minus: "Soft" }, { key: "R3", lean: 0.1, flex: true },
  { key: "L1", lean: 0.6 }, { key: "L2", lean: -0.95 }, { key: "L3", lean: 0.35 },
];
const axesB = [{ key: "R1", lean: -0.4 }, { key: "R2", lean: 0.8 }, { key: "R3", lean: -0.9 }, { key: "L1", lean: -0.2 }, { key: "L2", lean: 0.5 }, { key: "L3", lean: 0, unfinished: true }];
section("facet", "A-11 Facet (night)", [cell("axes A", r(h(art.Facet, { axes: axesA, size: 300 }))), cell("axes B", r(h(art.Facet, { axes: axesB, size: 300 }))), cell("small 120", r(h(art.Facet, { axes: axesA, size: 120 })))].join(""), "night");
section("facet-light", "A-11 Facet (light)", [cell("axes A", r(h(art.Facet, { axes: axesA, size: 260, theme: "light" }))), cell("axes B", r(h(art.Facet, { axes: axesB, size: 260, theme: "light" })))].join(""));

const codes = [];
for (const a of ["We", "Me"]) for (const b of ["Direct", "Soft"]) for (const c of ["Classic", "Own"]) codes.push(`${a}·${b}·${c}`);
for (const a of ["Steady", "Venture"]) for (const b of ["Push", "Easy"]) for (const c of ["Rules", "Context"]) codes.push(`${a}·${b}·${c}`);
section("sigils", "A-12 Sigil (16 halves, white on night)", codes.map((code) => cell(code, r(h(art.Sigil, { code, size: 56 })))).join(""), "night sigils");
section("sigils-light", "A-12 Sigil (ink on light, 24 and 48)", codes.map((code) => cell(code, `${r(h(art.Sigil, { code, size: 24 }))} ${r(h(art.Sigil, { code, size: 48 }))}`)).join(""), "inky");

const EMO = ["delight", "pride", "warmth", "relief", "longing", "worry", "guilt", "cringe", "irritation", "resentment", "envy", "sting", "unknown"];
section("beads", "A-13 EmotionBead (28, 56)", EMO.map((e) => cell(e, `${r(h(art.EmotionBead, { emotion: e, chapter: 3 }))} ${r(h(art.EmotionBead, { emotion: e, size: 56, chapter: 3 }))}`)).join(""));

const STATES = ["clear", "frosted", "sealed", "hit", "miss", "pass"];
section("panes", "A-17 LockPane (light) and A-15 Sparkle / SparkleBurst", [
  ...STATES.map((s) => cell(s, `${r(h(art.LockPane, { state: s, size: 36 }))} ${r(h(art.LockPane, { state: s, size: 72 }))}`)),
  cell("Sparkle 12, 24, 48", `<span style="color:var(--c-violet)">${r(h(art.Sparkle, { size: 12 }))} ${r(h(art.Sparkle, { size: 24 }))} ${r(h(art.Sparkle, { size: 48 }))}</span>`),
  cell("SparkleBurst (frozen)", `<div class="burst">${r(h(art.SparkleBurst, { count: 10, origin: { x: 60, y: 50 } }))}</div>`),
].join(""));
section("panes-night", "A-17 LockPane (night)", STATES.map((s) => cell(s, r(h(art.LockPane, { state: s, size: 56 })))).join(""), "night");
section("tablet", "A-18 AppTablet (on the deep gradient)", [cell("150", r(h(art.AppTablet, { size: 150 }))), cell("220", r(h(art.AppTablet, { size: 220 })))].join(""), "deep");

const scenes = ["day", "dusk", "clear", "night", ...Array.from({ length: 9 }, (_, i) => `island-${i + 1}`)];
section("backdrops", "A-08 Backdrop (static CSS layers; shader loads in the browser only)", scenes.map((s) => cell(s, `<div class="bd ${s === "dusk" ? "t-dusk" : s === "clear" ? "t-clear" : ""}">${r(h(art.Backdrop, { scene: s, animated: false }))}</div>`)).join(""));

const textures = art.textures;
section("textures", "A-14 frost, A-19 foxing, grain", [
  cell("frost on violet-100", `<div class="tex" style="background:var(--c-violet-100);background-image:${textures.FROST_URL}"></div>`),
  cell("foxing on n-900", `<div class="tex" style="background-color:var(--n-900);background-image:${textures.FOXING_URL};background-size:200px 400px"></div>`),
  cell("grain x6 on canvas", `<div class="tex" style="background:var(--c-canvas)"><div style="position:absolute;inset:0;background-image:${textures.GRAIN_URL};opacity:.2;mix-blend-mode:soft-light"></div></div>`),
  cell("shards A-02", `<svg viewBox="0 0 110 20" width="330" height="60">${art.shapes.SHARDS.map((d, i) => `<path transform="translate(${i * 13 + 2},1)" d="${d}" fill="var(--tint-ch${(i % 7) + 1})" stroke="white" stroke-width=".8"/>`).join("")}</svg>`),
].join(""));

const html = flush(`<!doctype html><html data-theme="day"><head><meta charset="utf-8"><title>src/art reference sheet</title><style>
${tokens}
*{box-sizing:border-box} body{margin:0;background:var(--c-canvas);font:500 13px/1.3 system-ui,sans-serif;color:var(--c-ink-2);padding:24px 28px}
h1{font:600 22px system-ui;color:var(--c-ink);margin:0 0 8px} h2{font:700 12px system-ui;letter-spacing:.1em;text-transform:uppercase;color:var(--c-violet-text);margin:0 0 12px}
section{padding:18px 20px;border-radius:18px;margin:0 0 16px;background:linear-gradient(180deg,#fff9,#fff4);border:1px solid var(--c-line)}
section.night{background:var(--n-900);border-color:var(--n-700);color:var(--n-ink-2)} section.night h2{color:var(--n-violet)}
section.deep{background:linear-gradient(135deg,#5A4ED6,#4A63D3)} section.deep h2,section.deep figcaption{color:#fff}
section.sigils{color:#F3F1FF} section.inky{color:var(--c-ink)}
.row{display:flex;flex-wrap:wrap;gap:14px;align-items:flex-end}
.cell{margin:0;display:flex;flex-direction:column;align-items:center;gap:6px} .cell .art{display:flex;gap:10px;align-items:flex-end}
figcaption{font-size:11px;opacity:.8}
.well{display:inline-flex;padding:0;border-radius:16px;background:var(--c-violet-100)}
.sel{display:inline-flex;padding:8px;border-radius:14px;background:linear-gradient(135deg,#5A4ED6,#4A63D3)} .sel [data-part]{stroke:#fff;fill:#fff} .sel [data-part="accent"]{fill:#fff;opacity:.35}
.stack{display:flex;gap:8px;align-items:flex-end}
.bd{position:relative;width:180px;height:220px;border-radius:14px;overflow:hidden;transform:translateZ(0)}
.tex{position:relative;width:180px;height:120px;border-radius:12px;overflow:hidden}
.burst{position:relative;width:120px;height:100px} .burst [data-art="sparkle-burst"]>span{opacity:1!important}
.burst [data-art="sparkle-burst"]>span:nth-child(1){transform:translate(-50%,-50%) translate(30px,4px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(2){transform:translate(-50%,-50%) translate(18px,28px) rotate(20deg)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(3){transform:translate(-50%,-50%) translate(-8px,34px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(4){transform:translate(-50%,-50%) translate(-30px,20px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(5){transform:translate(-50%,-50%) translate(-36px,-6px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(6){transform:translate(-50%,-50%) translate(-22px,-30px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(7){transform:translate(-50%,-50%) translate(4px,-38px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(8){transform:translate(-50%,-50%) translate(26px,-26px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(9){transform:translate(-50%,-50%) translate(44px,-10px)!important}
.burst [data-art="sparkle-burst"]>span:nth-child(10){transform:translate(-50%,-50%) translate(40px,22px)!important}
</style></head><body><h1>src/art reference sheet (package D)</h1>${sections.map((s) => s.html).join("\n")}</body></html>`);

const outHtml = path.join(here, "sheet.html");
fs.writeFileSync(outHtml, html);

const pwPath = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(pwPath.startsWith("/") ? pathToFileURL(pwPath).href : pwPath);
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(outHtml).href);
await page.waitForTimeout(300);
const only = process.argv.slice(2);
if (!only.length) await page.screenshot({ path: path.join(here, "sheet.png"), fullPage: true, scale: "css" });
for (const s of sections) {
  if (only.length && !only.includes(s.id)) continue;
  await page.locator(`#${s.id}`).screenshot({ path: path.join(here, `${s.id}.png`) });
}
await browser.close();
console.log(`wrote ${sections.length} sections to ${path.relative(root, here)}`);
