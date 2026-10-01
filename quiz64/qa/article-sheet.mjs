// The Evidence Article contact sheet (V2 pass, 2026-09-30): the whole article for three players in both voices, at
// phone (390) and desktop (1440) width, laid out on one image. Needs the dev server.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/article-sheet.mjs [baseUrl] [out.png] [shotDir]
// Default out: qa/article-sheet/sheet.png. Full-page shots land in shotDir (default qa/article-sheet/). Both ignored.
import fs from "node:fs";
import path from "node:path";
import { openArticle } from "./article-open.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const BASE = process.argv[2] || "http://127.0.0.1:5202/";
const OUT = path.resolve(process.argv[3] || "qa/article-sheet/sheet.png");
const DIR = path.resolve(process.argv[4] || "qa/article-sheet");
const PLAYERS = (process.env.PLAYERS || "a,b,c").split(",");
const VOICES = ["fun", "heart"];
const WIDTHS = [390, 1440];
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const shots = [];
for (const width of WIDTHS) {
  for (const player of PLAYERS) {
    for (const voice of VOICES) {
      const phone = width < 900;
      const ctx = await browser.newContext({ viewport: { width, height: phone ? 844 : 900 }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await openArticle(page, BASE, { voice, player, id: `sheet${player}${voice}${width}` });
      // Walk the page once so every lazy image loads, then shoot from the top with the tab bar unstuck (a sticky bar
      // would repeat down a full-page shot).
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < total; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(50); }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.addStyleTag({ content: ".ea-tabs{position:relative!important}" });
      await page.waitForTimeout(900);
      const file = path.join(DIR, `${width}-${player}-${voice}.png`);
      await page.screenshot({ path: file, fullPage: true });
      const title = await page.evaluate(() => document.querySelector(".ea-title__name")?.textContent || "");
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      shots.push({ width, player, voice, file, title, height });
      await ctx.close();
    }
  }
}

// The sheet: phones in one row, each page cut into three strips; desktops below, each cut into two.
const cut = (s, parts, scale) => Array.from({ length: parts }, (_, i) => ({ ...s, i, parts, scale }));
const rows = [
  { label: "Phone 390", cols: shots.filter((s) => s.width === 390).flatMap((s) => cut(s, 3, 0.4)) },
  { label: "Desktop 1440", cols: shots.filter((s) => s.width === 1440).flatMap((s) => cut(s, 2, 0.16)) },
];
const img = (c) => {
  const h = Math.ceil(c.height / c.parts);
  return `<figure style="width:${Math.round(c.width * c.scale)}px;height:${Math.round(h * c.scale)}px;overflow:hidden;margin:0;position:relative;border-radius:6px;box-shadow:0 0 0 1px #ddd">
    <img src="${path.basename(c.file)}" style="position:absolute;left:0;top:${-Math.round(h * c.i * c.scale)}px;width:${Math.round(c.width * c.scale)}px">
    ${c.i === 0 ? `<figcaption style="position:absolute;left:0;top:0;background:#1E1B2E;color:#fff;font:600 11px system-ui;padding:3px 6px;border-radius:0 0 6px 0">${c.player} ${c.voice}: ${c.title}</figcaption>` : ""}
  </figure>`;
};
const html = `<!doctype html><body style="margin:0;padding:24px;width:max-content;background:#fff;font:600 20px system-ui;color:#1E1B2E">
  <h1 style="font:700 26px system-ui;margin:0 0 6px">MirrorMii Evidence Article V2 (2026-09-30): three players, both voices, phone and desktop, top to bottom</h1>
  <p style="font:500 14px system-ui;margin:0 0 18px;color:#555">Each page is cut into strips read left to right. Spot art from public/assets/article (ARTICLE-ART-SET.md); no banner photos.</p>
  ${rows.map((r) => `<h2 style="font:700 18px system-ui;margin:18px 0 8px">${r.label}</h2><div style="display:flex;gap:8px;align-items:flex-start">${r.cols.map(img).join("")}</div>`).join("")}
</body>`;
const sheetCtx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
const sheet = await sheetCtx.newPage();
// The sheet page sits next to the shots and loads them by file name (inlined data would be too large for one page).
const sheetFile = path.join(DIR, "sheet.html");
fs.writeFileSync(sheetFile, html);
await sheet.goto(`file://${sheetFile}`, { waitUntil: "load" });
await sheet.setViewportSize({ width: await sheet.evaluate(() => document.body.scrollWidth), height: 800 });
await sheet.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log(JSON.stringify({ out: OUT, shots: shots.map((s) => `${s.width} ${s.player} ${s.voice} ${s.title} ${s.height}px`) }, null, 1));
