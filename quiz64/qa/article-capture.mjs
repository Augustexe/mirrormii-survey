// Evidence Article captures (LAUNCH-SPEC section 25 item 3): opens a finished run, walks the Stories deck to its end,
// opens the article with "Read the long version", and screenshots every section at phone (390x844) and desktop
// (1440x900), plus one full-page shot per size. Also reports CLS, console errors and horizontal overflow.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/article-capture.mjs [baseUrl] [outDir]
// Env: SIZES=phone,desktop  VOICE=fun|heart  PLAYER=a|b|c|d  FULL=1 (full-page shots)
import fs from "node:fs";
import path from "node:path";
import { openArticle, SIZES } from "./article-open.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const BASE = process.argv[2] || "http://127.0.0.1:5202/";
const OUT = process.argv[3] || path.resolve("qa/article");
const VOICE = process.env.VOICE || "fun";
const only = process.env.SIZES ? process.env.SIZES.split(",") : ["phone", "desktop"];
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const report = {};
for (const size of only) {
  const vp = SIZES[size];
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.mobile, hasTouch: vp.mobile });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await openArticle(page, BASE, { voice: VOICE, player: process.env.PLAYER || "a", id: `articleshot${VOICE}` });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, `${size}-${VOICE}-00-cover.png`) });
  const ids = await page.$$eval(".ea-main > section", (els) => els.map((e) => e.id || [...e.classList].find((c) => c !== "ea-sec")));
  let n = 1;
  for (const id of ids) {
    const sel = id.startsWith("ea-") ? `.${id}` : `#${id}`;
    await page.evaluate((s) => { const el = document.querySelector(s); window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - (s === ".ea-close" ? 0 : 58), behavior: "instant" }); }, sel);
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(OUT, `${size}-${VOICE}-${String(n).padStart(2, "0")}-${id.replace(/^ea-/, "")}.png`) });
    n++;
    const tall = await page.evaluate((s) => document.querySelector(s).getBoundingClientRect().height, sel);
    if (tall > vp.height * 1.3) {
      await page.evaluate((h) => window.scrollBy({ top: h, behavior: "instant" }), Math.round(vp.height * 0.8));
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(OUT, `${size}-${VOICE}-${String(n).padStart(2, "0")}-${id.replace(/^ea-/, "")}-b.png`) });
      n++;
    }
  }
  if (process.env.FULL) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: path.join(OUT, `${size}-${VOICE}-full.png`), fullPage: true });
  }
  const metrics = await page.evaluate(() => ({
    cls: window.__cls || 0,
    overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    height: document.documentElement.scrollHeight,
    words: document.querySelector(".ea-main").innerText.split(/\s+/).filter(Boolean).length,
  }));
  report[size] = { ...metrics, errors };
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, `report-${VOICE}.json`), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report, null, 1));
