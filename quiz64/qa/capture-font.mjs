// Before and after of the one-font change (Satoshi everywhere): landing, a chapter card, story screen 2 (names),
// the stat screen (map) and the Evidence Article cover, all at 390x844, fun voice, reduced motion.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-font.mjs before|after [baseUrl] [outDir]
//   ... node qa/capture-font.mjs sheet [baseUrl] [outDir]     composes docs/FONT-SATOSHI.png from both sets
// Needs the dev server.
import fs from "node:fs";
import path from "node:path";
import { gotoStory, openRun } from "./layout-lib.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const MODE = process.argv[2] || "after";
const BASE = process.argv[3] || "http://127.0.0.1:5215/";
const OUT = process.argv[4] || path.resolve("qa/font-satoshi");
fs.mkdirSync(OUT, { recursive: true });
const W = 390;
const H = 844;
const SHOTS = [
  { id: "landing", label: "Landing" },
  { id: "card", label: "A chapter card" },
  { id: "names", label: "Story screen 2 (names)" },
  { id: "map", label: "The stat screen" },
  { id: "article", label: "Evidence Article cover" },
];

const browser = await chromium.launch({ channel: "chrome" });
if (MODE === "sheet") {
  const img = (f) => (fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString("base64")}` : "");
  const col = (s) => `<td style="vertical-align:top;padding:0 10px"><div style="font-size:17px;margin-bottom:8px">${s.label}</div>
<div style="color:#f2a7c3;font-size:14px;margin-bottom:4px">Before</div><img src="${img(path.join(OUT, `before-${s.id}.png`))}" style="width:${W * 0.62}px;border-radius:10px;display:block;margin-bottom:12px">
<div style="color:#a8f0c8;font-size:14px;margin-bottom:4px">After (Satoshi)</div><img src="${img(path.join(OUT, `after-${s.id}.png`))}" style="width:${W * 0.62}px;border-radius:10px;display:block"></td>`;
  const html = `<!doctype html><html><body style="margin:0;background:#1d1838;font:600 20px system-ui;color:#fff">
<div style="padding:24px 24px 4px;font-size:28px">One font: Satoshi everywhere (before: Fraunces display plus Figtree text)</div>
<div style="padding:0 24px 14px;font-size:16px;color:#cfc8ff">390x844, fun voice, reduced motion. Hierarchy from weight, size and tracking only; no italic.</div>
<table style="border-spacing:6px;margin:0 14px 24px"><tr>${SHOTS.map(col).join("")}</tr></table></body></html>`;
  const file = path.join(OUT, "sheet.html");
  fs.writeFileSync(file, html);
  const p = await (await browser.newContext({ viewport: { width: 1340, height: 1000 }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`file://${file}`);
  await p.waitForTimeout(600);
  const target = path.resolve("docs/FONT-SATOSHI.png");
  await p.screenshot({ path: target, fullPage: true });
  await browser.close();
  console.log(`sheet ${target}`);
  process.exit(0);
}

const errors = [];
const settle = async (page, ms = 1200) => { await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(ms); };
for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${s.id}: ${e.message}`));
  const file = path.join(OUT, `${MODE}-${s.id}.png`);
  if (s.id === "landing") {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.goto(BASE);
    await page.waitForSelector(".mm-landing", { timeout: 15000 });
  } else if (s.id === "card") {
    await openRun(page, BASE, { voice: "fun", stop: "type", type: "scenario", id: "fontcard" });
    await page.waitForSelector("article.pc", { timeout: 15000 }).catch(() => errors.push("card not on screen"));
  } else {
    await openRun(page, BASE, { voice: "fun", stop: "result", id: "fontresult" });
    await page.waitForSelector(".rv-room", { timeout: 15000 });
    if (s.id === "article") {
      await page.goto(`${BASE}#article`);
      await page.waitForSelector(".ea-cover", { timeout: 15000 });
    } else if (!(await gotoStory(page, s.id))) errors.push(`${s.id}: story not reached`);
  }
  await settle(page);
  await page.screenshot({ path: file });
  await ctx.close();
}
await browser.close();
console.log(`${SHOTS.length} shots in ${OUT} (${MODE})`);
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; }
