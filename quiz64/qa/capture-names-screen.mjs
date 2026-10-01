// Before and after of story 2 (the names screen) and the share card, for decision 1a (one title, one story line).
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-names-screen.mjs before|after [baseUrl] [outDir]
//   ... node qa/capture-names-screen.mjs sheet [baseUrl] [outDir]     composes docs/NAMES-SCREEN-FINAL.png from both sets
// Shots: story 2 for four leaning players in both voices at 375x667, 390x844 and 1440x900 (reduced motion, so the
// settled frame), plus the share card (story and post shapes, night light) for each player in Make it fun.
// Needs the dev server.
import fs from "node:fs";
import path from "node:path";
import { gotoStory, openRun } from "./layout-lib.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const MODE = process.argv[2] || "after";
const BASE = process.argv[3] || "http://127.0.0.1:5241/";
const OUT = process.argv[4] || path.resolve("qa/names-screen");
fs.mkdirSync(OUT, { recursive: true });

// Four players that land on four different people archetypes.
const PLAYERS = {
  a: { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 },
  b: { R1: -0.9, R2: 0.8, R3: 0.5, L1: -0.8, L2: 0.7, L3: -0.6 },
  c: { R1: 0.7, R2: 0.9, R3: -0.8, L1: -0.5, L2: -0.8, L3: -0.9 },
  d: { R1: -0.6, R2: -0.9, R3: 0.9, L1: 0.8, L2: 0.9, L3: 0.4 },
};
const SIZES = { small: [375, 667], phone: [390, 844], desktop: [1440, 900] };
const VOICES = (process.env.VOICES || "fun,heart").split(",");
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;

const browser = await chromium.launch({ channel: "chrome" });

if (MODE === "sheet") {
  const img = (f) => (fs.existsSync(f) ? `data:image/png;base64,${fs.readFileSync(f).toString("base64")}` : "");
  const col = (title, color, file, w) => `<td style="vertical-align:top"><div style="margin-bottom:6px;color:${color}">${title}</div><img src="${img(file)}" style="width:${w}px;border-radius:12px;display:block"></td>`;
  const rows = [
    ["a", "fun", "phone"], ["b", "heart", "phone"], ["c", "fun", "small"], ["d", "heart", "small"],
  ].map(([pl, v, sz]) => `<tr><td style="vertical-align:top;width:170px;font-size:16px;line-height:1.35">Story 2, player ${pl}, ${v === "fun" ? "Make it fun" : "Heart to heart"}, ${SIZES[sz].join("x")}</td>
${col("Before", "#f2a7c3", path.join(OUT, `before-names-${pl}-${v}-${sz}.png`), 300)}${col("After", "#a8f0c8", path.join(OUT, `after-names-${pl}-${v}-${sz}.png`), 300)}</tr>`).join("");
  const desk = `<tr><td style="vertical-align:top;font-size:16px">Story 2, player a, Make it fun, 1440x900</td>${col("Before", "#f2a7c3", path.join(OUT, "before-names-a-fun-desktop.png"), 300 * 1.6)}${col("After", "#a8f0c8", path.join(OUT, "after-names-a-fun-desktop.png"), 300 * 1.6)}</tr>`;
  const cards = ["a", "c"].map((pl) => `<tr><td style="vertical-align:top;font-size:16px">Share card, player ${pl}, story and post</td>
<td style="vertical-align:top"><div style="margin-bottom:6px;color:#f2a7c3">Before</div><img src="${img(path.join(OUT, `before-card-${pl}-story.png`))}" style="width:240px;border-radius:12px"> <img src="${img(path.join(OUT, `before-card-${pl}-post.png`))}" style="width:240px;border-radius:12px;vertical-align:top"></td>
<td style="vertical-align:top"><div style="margin-bottom:6px;color:#a8f0c8">After</div><img src="${img(path.join(OUT, `after-card-${pl}-story.png`))}" style="width:240px;border-radius:12px"> <img src="${img(path.join(OUT, `after-card-${pl}-post.png`))}" style="width:240px;border-radius:12px;vertical-align:top"></td></tr>`).join("");
  const html = `<!doctype html><html><body style="margin:0;background:#1d1838;font:600 20px system-ui;color:#fff">
<div style="padding:24px 24px 4px;font-size:30px">Names screen and share card: one title, one story line (decision 1a)</div>
<div style="padding:0 24px 8px;font-size:17px;color:#cfc8ff">Inside the World Mirror: only the people archetype and the one line that merges both halves (names-64.json). Below the mirror: the day-to-day half and the core traits, in quiet rows. Reduced motion, settled frame.</div>
<table style="border-spacing:18px">${rows}${desk}${cards}</table></body></html>`;
  const file = path.join(OUT, "sheet.html");
  fs.writeFileSync(file, html);
  const p = await (await browser.newContext({ viewport: { width: 1200, height: 1000 }, deviceScaleFactor: 1 })).newPage();
  await p.goto(`file://${file}`);
  await p.waitForTimeout(800);
  const target = path.resolve("docs/NAMES-SCREEN-FINAL.png");
  await p.screenshot({ path: target, fullPage: true });
  await browser.close();
  console.log(`sheet ${target}`);
  process.exit(0);
}

const errors = [];
let shots = 0;
for (const [pl, signs] of Object.entries(PLAYERS)) {
  for (const voice of VOICES) {
    for (const [sz, [w, h]] of Object.entries(SIZES)) {
      const label = `names-${pl}-${voice}-${sz}`;
      const card = voice === "fun" && sz === "phone";
      if (ONLY && !ONLY.test(label)) continue;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: sz !== "desktop", hasTouch: sz !== "desktop", reducedMotion: "reduce" });
      const page = await ctx.newPage();
      page.on("pageerror", (e) => errors.push(`${label}: ${e.message}`));
      await openRun(page, BASE, { voice, stop: "result", id: `names${pl}${voice}${sz}`, signs });
      await page.waitForSelector(".rv-room", { timeout: 15000 });
      if (!(await gotoStory(page, "names"))) errors.push(`${label}: story 2 not reached`);
      await page.waitForTimeout(1400);
      await page.screenshot({ path: path.join(OUT, `${MODE}-${label}.png`) });
      shots++;
      if (card) {
        // The share card at full size, drawn by the app's own share-image.js from the run's own share projection.
        for (const format of ["story", "post"]) {
          const data = await page.evaluate(async (format) => {
            const { restore } = await import("/src/persona/session.js");
            const { resultView } = await import("/src/persona/views.js");
            const { renderShareCard } = await import("/src/persona/share-image.js");
            const state = restore(localStorage.getItem("genii.persona.v2.run"));
            const c = await renderShareCard(resultView(state).share, { format, theme: "night" });
            return c.toDataURL("image/png");
          }, format).catch((e) => { errors.push(`${label} card ${format}: ${e.message}`); return null; });
          if (data) { fs.writeFileSync(path.join(OUT, `${MODE}-card-${pl}-${format}.png`), Buffer.from(data.split(",")[1], "base64")); shots++; }
        }
      }
      await ctx.close();
    }
  }
}
await browser.close();
console.log(`${shots} shots in ${OUT} (${MODE})`);
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; }
