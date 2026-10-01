// Stage sheet for Genii's evolution (LAUNCH-SPEC section 23, ruling 1): the canon render beside stages 0, 0.25, 0.5,
// 0.75 and 1, live three.js, on the day field.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-genii.mjs [baseUrl] [out.png] [query]
// Needs the dev server (`npm run dev -- --port 5181`).
// STILL=1: instead of the sheet, save one transparent still of full Genii (our own three.js scene, reduced motion, alert
// face) to [out.png]; the share image draws it (public/assets/island/genii-still.png, LAUNCH-SPEC 25 item 1):
//   STILL=1 node qa/capture-genii.mjs http://127.0.0.1:5201/ public/assets/island/genii-still.png
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5181/";
const OUT = process.argv[3] || "docs/GENII-EVOLUTION.png";
const QUERY = process.argv[4] || "size=l";
const WAIT = Number(process.env.WAIT || 2600);

const browser = await chromium.launch({ channel: process.env.CHANNEL || "chrome", args: ["--use-angle=metal", "--enable-gpu"] });
const page = await browser.newPage({ viewport: { width: Number(process.env.W || 1920), height: Number(process.env.H || 420) }, deviceScaleFactor: 2 });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
if (process.env.STILL) {
  await page.setViewportSize({ width: 600, height: 600 });
  await page.goto(new URL("qa/genii-lab.html?still=1&size=xl&stages=1&mood=listening", BASE).href);
  await page.waitForFunction(() => document.querySelector('.genii-form[data-live="true"]'), null, { timeout: 15000 });
  await page.waitForTimeout(WAIT);
  // Only Genii's own body: no page field, no captions, no orb bloom or sparkles around it.
  await page.addStyleTag({ content: "html, body, main, figure, div { background: transparent !important; } figcaption, .genii-light__bloom, .genii-light__sparkles, .genii-light__core, .genii-light__glint, .genii-form__ring { display: none !important; } img { visibility: hidden; }" });
  await page.waitForTimeout(300);
  await page.locator(".genii-form").first().screenshot({ path: OUT, omitBackground: true });
  console.log(JSON.stringify({ out: OUT, errors }));
  await browser.close();
  process.exit(0);
}
await page.goto(new URL(`qa/genii-lab.html?${QUERY}`, BASE).href);
await page.waitForTimeout(WAIT);
const live = await page.$$eval(".genii-form", (els) => els.map((e) => e.dataset.live));
await page.locator('[data-row="live"]').screenshot({ path: OUT });
console.log(JSON.stringify({ out: OUT, live, errors }));
await browser.close();
