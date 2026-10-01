// The drama stats contact sheet (2026-09-30): for four players in both voices at 390 x 844, the Stories stat screen
// (story 4) and the article's stat block (opened from the screen's "See all six in the long version" link), plus the
// article cover after the cuts in both voices. Needs the dev server.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/drama-sheet.mjs [baseUrl] [out.png] [shotDir]
// Default out: docs/DRAMA-STATS.png. Shots land in shotDir (default qa/drama-sheet/, ignored).
import fs from "node:fs";
import path from "node:path";
// Simulated players (tests/persona-sim.mjs, the calibration sim's player model) chosen for variety: different top
// stats, dump stats and surprise picks.
async function seedResult(page, { voice = "fun", player = "sheet1", id = "dramasheet" } = {}) {
  return page.evaluate(async ({ voice, player, id }) => {
    localStorage.clear();
    const P = await import("/src/persona/session.js");
    const { makePlayer, playPicker } = await import("/tests/persona-sim.mjs");
    const s = playPicker({ closest: "best_friend", pronoun: "she" }, { voice, depth: "anything", rooms: ["love", "work", "family"] }, makePlayer(player, { noise: 0.2 }), id);
    localStorage.setItem("genii.persona.v2.run", P.serialize(s));
    return P.currentStep(s).kind;
  }, { voice, player, id });
}
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");

const BASE = process.argv[2] || "http://127.0.0.1:5261/";
const OUT = path.resolve(process.argv[3] || "docs/DRAMA-STATS.png");
const DIR = path.resolve(process.argv[4] || "qa/drama-sheet");
const PLAYERS = (process.env.PLAYERS || "sheet1,sheet5,sheet6,sheet12").split(",");
const VOICES = ["fun", "heart"];
fs.mkdirSync(DIR, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });
const newPage = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
  return { ctx, page: await ctx.newPage() };
};
// Seeds the run, opens the result and steps to story 4.
async function toStatScreen(page, opts) {
  await page.goto(BASE);
  const kind = await seedResult(page, opts);
  if (kind !== "result") throw new Error(`seeded run did not finish (${kind})`);
  await page.goto(BASE);
  await page.waitForSelector(".mm-landing__cta", { timeout: 10000 });
  await page.locator(".mm-landing__cta").click();
  await page.waitForSelector(".rv-room", { timeout: 10000 });
  await page.locator(".rv-bars i").nth(3).click();
  await page.waitForSelector('.rv-slide.is-current[data-story="map"] .rv-ds', { timeout: 10000 });
  await page.waitForTimeout(700);
}

const shots = [];
for (const player of PLAYERS) {
  for (const voice of VOICES) {
    const { ctx, page } = await newPage();
    const id = `dramasheet${player}${voice}`;
    await toStatScreen(page, { voice, player, id });
    const deck = path.join(DIR, `${player}-${voice}-deck.png`);
    await page.screenshot({ path: deck });
    const blocks = await page.$$eval('.rv-slide.is-current .rv-ds', (els) => els.map((e) => e.querySelector(".sr-only").textContent));
    // The link opens the article at the stat block.
    await page.locator(".rv-slide.is-current .rv-ds__more").click();
    await page.waitForSelector("#stats .ea-abilities", { timeout: 10000 });
    await page.addStyleTag({ content: ".ea-tabs{position:relative!important}" });
    await page.waitForTimeout(500);
    const hash = await page.evaluate(() => window.location.hash);
    const art = path.join(DIR, `${player}-${voice}-article.png`);
    await page.locator("#stats").screenshot({ path: art });
    const block = await page.$$eval("#stats .ea-ability .sr-only", (els) => els.map((e) => e.textContent));
    shots.push({ player, voice, deck, art, blocks, block, hash });
    await ctx.close();
  }
}
// The cover after the cuts, once per voice.
const covers = [];
for (const voice of VOICES) {
  const { ctx, page } = await newPage();
  await toStatScreen(page, { voice, player: PLAYERS[0], id: `dramacover${voice}` });
  await page.keyboard.press("End");
  await page.waitForTimeout(700);
  await page.locator(".rv-slide.is-current .rv-readmore").click();
  await page.waitForSelector(".ea-cover", { timeout: 10000 });
  await page.waitForTimeout(600);
  const file = path.join(DIR, `cover-${voice}.png`);
  await page.screenshot({ path: file });
  covers.push({ voice, file });
  await ctx.close();
}

const W = 390;
const fig = (file, caption, h = 844) => `<figure style="margin:0;width:${W}px;position:relative">
  <div style="width:${W}px;${h ? `height:${h}px;` : ""}overflow:hidden;border-radius:10px;box-shadow:0 0 0 1px #ddd;background:#f6f5ff"><img src="${path.basename(file)}" style="width:${W}px;display:block"></div>
  <figcaption style="font:600 12px system-ui;color:#444;margin-top:6px">${caption}</figcaption></figure>`;
const html = `<!doctype html><body style="margin:0;padding:24px;width:max-content;background:#fff;font:600 20px system-ui;color:#1E1B2E">
  <h1 style="font:700 26px system-ui;margin:0 0 6px">MirrorMii drama stats (2026-09-30): Stories stat screen and the article stat block, four players, both voices, 390 x 844</h1>
  <p style="font:500 14px system-ui;margin:0 0 18px;color:#555">Each pair: story 4 (three highest plus the most surprising), then the article opened from "See all six in the long version". Last row: the article cover after the cuts.</p>
  <div style="display:grid;grid-template-columns:repeat(4, ${W * 2 + 12}px);gap:28px 22px">
  ${shots.map((s) => `<div style="display:flex;gap:12px;align-items:flex-start">${fig(s.deck, `${s.player} ${s.voice}: ${s.blocks.map((b) => b.split(".")[0]).join(" / ")}`)}${fig(s.art, `article ${s.hash}`, null)}</div>`).join("")}
  </div>
  <h2 style="font:700 18px system-ui;margin:26px 0 8px">Article cover after the cuts</h2>
  <div style="display:flex;gap:22px">${covers.map((c) => fig(c.file, `cover, ${c.voice}`)).join("")}</div>
</body>`;
const sheetFile = path.join(DIR, "sheet.html");
fs.writeFileSync(sheetFile, html);
const sctx = await browser.newContext({ viewport: { width: 1200, height: 800 }, deviceScaleFactor: 1 });
const sheet = await sctx.newPage();
await sheet.goto(`file://${sheetFile}`, { waitUntil: "load" });
await sheet.setViewportSize({ width: await sheet.evaluate(() => document.body.scrollWidth), height: 800 });
await sheet.screenshot({ path: OUT, fullPage: true });
await browser.close();
console.log(JSON.stringify({ out: OUT, shots: shots.map((s) => ({ who: `${s.player} ${s.voice}`, deck: s.blocks, article: s.block, hash: s.hash })) }, null, 1));
