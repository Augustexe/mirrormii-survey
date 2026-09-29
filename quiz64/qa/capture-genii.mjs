// Stage sheet for Genii's evolution (LAUNCH-SPEC section 23, ruling 1): the canon render beside stages 0, 0.25, 0.5,
// 0.75 and 1, live three.js, on the day field.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-genii.mjs [baseUrl] [out.png] [query]
// Needs the dev server (`npm run dev -- --port 5181`).
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
await page.goto(new URL(`qa/genii-lab.html?${QUERY}`, BASE).href);
await page.waitForTimeout(WAIT);
const live = await page.$$eval(".genii-form", (els) => els.map((e) => e.dataset.live));
await page.locator('[data-row="live"]').screenshot({ path: OUT });
console.log(JSON.stringify({ out: OUT, live, errors }));
await browser.close();
