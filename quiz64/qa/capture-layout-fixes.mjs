// Before and after of the three end-sequence layout bugs (package L2): the Evidence Article party section under the
// sticky section menu, the stat screen title under the top icon row, and the share screen's secondary actions.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-layout-fixes.mjs before|after [baseUrl] [outDir]
//   ... node qa/capture-layout-fixes.mjs sheet [baseUrl] [outDir]     composes docs/LAYOUT-FIXES.png from both sets
// Needs the dev server.
import fs from "node:fs";
import path from "node:path";
import { gotoStory, openRun } from "./layout-lib.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const MODE = process.argv[2] || "after";
const BASE = process.argv[3] || "http://127.0.0.1:5215/";
const OUT = process.argv[4] || path.resolve("qa/layout-fixes");
fs.mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { id: "party-390", label: "Article party sliding under the section menu, 390x844: before, the cards showed through the bar; after, a solid frosted backing", w: 390, h: 844 },
  { id: "map-375", label: "Stat screen at 375x667, scrolled to its end: before, the last stats were cut off by the stage; after, the list scrolls in a box that starts under Genii and the share icon", w: 375, h: 667 },
  { id: "share-375", label: "Share screen actions, 375x667", w: 375, h: 667 },
  { id: "share-390", label: "Share screen actions, 390x844", w: 390, h: 844 },
];

const browser = await chromium.launch({ channel: "chrome" });
if (MODE === "sheet") {
  const img = (f) => (fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString("base64")}` : "");
  const html = `<!doctype html><html><body style="margin:0;background:#1d1838;font:600 22px system-ui;color:#fff">
<div style="padding:24px 24px 4px;font-size:30px">Layout fixes (package L2): before and after, reduced motion, fun voice</div>
<div style="padding:0 24px 8px;font-size:18px;color:#cfc8ff">1. Article: solid frosted section bar, scroll padding. 2. Stat screen: list scrolls under the top bar, never under its icons. 3. Share: pill actions, Share image stays primary.</div>
<table style="border-spacing:18px">${SHOTS.map((s) => `<tr><td style="vertical-align:top;width:220px;font-size:17px;line-height:1.35">${s.label}</td>
<td style="vertical-align:top"><div style="margin-bottom:6px;color:#f2a7c3">Before</div><img src="${img(path.join(OUT, `before-${s.id}.png`))}" style="width:${s.w}px;border-radius:12px"></td>
<td style="vertical-align:top"><div style="margin-bottom:6px;color:#a8f0c8">After</div><img src="${img(path.join(OUT, `after-${s.id}.png`))}" style="width:${s.w}px;border-radius:12px"></td></tr>`).join("")}</table></body></html>`;
  const file = path.join(OUT, "sheet.html");
  fs.writeFileSync(file, html);
  const p = await (await browser.newContext({ viewport: { width: 1180, height: 1000 }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`file://${file}`);
  await p.waitForTimeout(600);
  const target = path.resolve("docs/LAYOUT-FIXES.png");
  await p.screenshot({ path: target, fullPage: true });
  await browser.close();
  console.log(`sheet ${target}`);
  process.exit(0);
}

const errors = [];
for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${s.id}: ${e.message}`));
  await openRun(page, BASE, { voice: "fun", stop: "result", id: `layoutfix${s.w}` });
  await page.waitForSelector(".rv-room", { timeout: 15000 });
  const file = path.join(OUT, `${MODE}-${s.id}.png`);
  if (s.id.startsWith("party")) {
    await page.goto(`${BASE}#article`);
    await page.waitForSelector(".ea-cover", { timeout: 15000 });
    await page.waitForTimeout(800);
    // Scroll so a party card's name sits right under the sticky menu (its top 14 px under the viewport top).
    await page.evaluate(() => { const el = document.querySelectorAll("#party .ea-slot__name")[1]; window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 14); });
    await page.waitForTimeout(700);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width: s.w, height: 420 } });
  } else {
    const id = s.id.split("-")[0];
    if (!(await gotoStory(page, id))) errors.push(`${s.id}: story not reached`);
    await page.waitForTimeout(1600);
    // The stat screen: scroll its list to the end (a no-op before the fix, when the body did not scroll).
    if (id === "map") { await page.evaluate(() => { const b = document.querySelector(".rv-slide.is-current .rv-body"); b.scrollTop = b.scrollHeight; }); await page.waitForTimeout(400); }
    await page.screenshot({ path: file });
  }
  await ctx.close();
}
await browser.close();
console.log(`${SHOTS.length} shots in ${OUT} (${MODE})`);
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; }
