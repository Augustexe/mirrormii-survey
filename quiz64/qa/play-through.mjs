// Play one complete run through the real UI: landing, setup, lobby, every interlude, 40 cards, the lock, the final 8
// and all 9 reveal screens. Answers by mouse (default) or keys only (KEYS=1). Records Genii's line on every card and
// fails on a back-to-back repeat, a console error or a stuck screen.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/play-through.mjs [baseUrl] [voice fun|heart|cards] [outDir]
// Env: KEYS=1 keyboard only; VIEW=phone|desktop; SHOTS=1 writes a screenshot per step to outDir.
import fs from "node:fs";
import path from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5175/";
const VOICE = process.argv[3] || "fun";
const OUT = process.argv[4] || path.resolve("qa/play-through");
const KEYS = process.env.KEYS === "1";
const VIEW = process.env.VIEW || "phone";
const SHOTS = process.env.SHOTS === "1";
if (SHOTS) fs.mkdirSync(OUT, { recursive: true });

const vp = VIEW === "phone" ? { width: 390, height: 844, mobile: true } : { width: 1440, height: 900, mobile: false };
const browser = await chromium.launch({ channel: "chrome" });
const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

let n = 0;
const shot = async (label) => { if (SHOTS) await page.screenshot({ path: path.join(OUT, `${String(++n).padStart(3, "0")}-${label}.png`) }); };
const press = (k) => page.keyboard.press(k);
// Keyboard: Tab to a control whose text matches, then Enter. Mouse: click it.
async function activate(locator) {
  if (!KEYS) return locator.click();
  await locator.focus();
  return press("Enter");
}

await page.goto(BASE);
await page.evaluate(() => localStorage.clear());
await page.goto(BASE);
await page.waitForSelector(".mm-landing");
await shot("landing");
await activate(page.getByRole("button", { name: /meet genii/i }));
await page.waitForSelector(".mm-setup");
await activate(page.locator(".mm-object").first());
await page.waitForSelector(".mm-setup[data-step=pronoun]");
await activate(page.locator(".mm-pill").nth(2));
await page.waitForSelector(".mm-lobby");
const voiceIndex = { fun: 0, heart: 1, cards: 2 }[VOICE];
await activate(page.locator(".mm-voice").nth(voiceIndex));
await page.waitForTimeout(400);
if (await page.locator(".mm-lobby[data-step=voice]").count()) await activate(page.locator(".mm-panel__go"));
await page.waitForSelector(".mm-lobby[data-step=depth]");
await activate(page.locator(".mm-depth").nth(1));
await page.waitForTimeout(400);
if (await page.locator(".mm-lobby[data-step=depth]").count()) await activate(page.locator(".mm-panel__go"));
await page.waitForSelector(".mm-lobby[data-step=rooms]");
await shot("lobby-rooms");
await activate(page.locator(".mm-panel__go"));

const lines = [];
const log = [];
let cards = 0, finale = 0, interludes = 0, locked = false, stuck = 0, lastSig = "";
for (let guard = 0; guard < 400; guard++) {
  await page.waitForTimeout(120);
  if (await page.locator(".rv-room").count()) break;
  if (await page.locator(".mm-interlude").count()) {
    interludes++;
    await shot(`interlude-${interludes}`);
    await activate(page.locator(".mm-interlude__start"));
    await page.waitForSelector(".play", { timeout: 5000 });
    continue;
  }
  if (await page.locator("main.lock").count()) {
    const lockBtn = page.getByRole("button", { name: /lock in genii/i });
    const playBtn = page.getByRole("button", { name: /play the final 8/i });
    if (await lockBtn.count()) { await shot("lock"); await activate(lockBtn); locked = true; await page.waitForTimeout(1600); continue; }
    if (await playBtn.count()) { await shot("locked"); await activate(playBtn); await page.waitForSelector(".play", { timeout: 5000 }); continue; }
    await page.waitForTimeout(300);
    continue;
  }
  const art = page.locator("article.pc").first();
  if (!(await art.count())) { if (++stuck > 40) throw new Error("no card, lock, interlude or result on screen"); continue; }
  const type = await art.getAttribute("data-card-type");
  const phase = await art.getAttribute("data-phase");
  const prompt = (await page.locator(".pc-prompt").first().innerText()).trim();
  const sig = `${phase}|${prompt}`;
  if (sig === lastSig) { if (++stuck > 60) throw new Error(`stuck on ${type}: ${prompt}`); continue; }
  stuck = 0;
  lastSig = sig;
  const line = (await page.locator(".play-genii__line").first().innerText().catch(() => "")).trim();
  if (phase === "finale") finale++; else cards++;
  if (phase !== "finale") lines.push(line);
  log.push({ i: cards + finale, phase, type, line, prompt: prompt.slice(0, 60) });
  if (SHOTS) await shot(`${phase}-${type}`);
  // A person reads the card first; answers under 1.5 s count as rushed (score-core rushedMs). DWELL=0 plays at speed.
  await page.waitForTimeout(Number(process.env.DWELL ?? 1700));
  if (KEYS) {
    if (type === "pick_two") { await press("1"); await press("2"); await page.waitForTimeout(900); }
    else if (type === "receipts") { await press("1"); await press("Enter"); }
    else if (type === "rank") { const k = await art.locator(".pc-rank__tap").count(); for (let i = 1; i <= k; i++) await press(String(i)); await press("Enter"); }
    else await press("1");
  } else {
    if (type === "pick_two") {
      const tiles = art.locator("button[data-index]");
      await tiles.nth(0).click(); await tiles.nth(1).click(); await page.waitForTimeout(900);
    } else if (type === "receipts") {
      await art.locator("button[data-index]").first().click();
      await art.locator(".pc-primary--tear").click();
    } else if (type === "rank") {
      const k = await art.locator(".pc-rank__tap").count();
      for (let i = 0; i < k; i++) await art.locator(".pc-rank__item:not(.is-placed) .pc-rank__tap").first().click();
      await art.locator(".pc-primary").click();
    } else {
      const b = art.locator("button[data-index]").first();
      if (await b.count()) await b.click(); else await press("1");
    }
  }
  await page.waitForTimeout(500);
}

// The reveal: 9 screens.
await page.waitForSelector(".rv-room", { timeout: 8000 });
const stories = [];
for (let i = 0; i < 40 && stories.length < 9; i++) {
  await page.waitForTimeout(i === 0 ? 1500 : 1100);
  const id = await page.locator(".rv-slide.is-current").getAttribute("data-story").catch(() => null);
  if (id && !stories.includes(id)) { stories.push(id); await shot(`reveal-${String(stories.length).padStart(2, "0")}-${id}`); }
  if (stories.length === 9) break;
  if (KEYS) await press("ArrowRight");
  else {
    const next = page.locator(".rv-arrow--next");
    if (await next.isVisible().catch(() => false)) await next.click().catch(() => press("ArrowRight"));
    else await page.locator(".rv-slide.is-current").click({ position: { x: vp.width * 0.8, y: vp.height * 0.45 } }).catch(() => press("ArrowRight"));
  }
}

const repeats = lines.map((l, i) => (i && l && l === lines[i - 1] ? i : -1)).filter((i) => i >= 0);
const distinct = new Set(lines.filter(Boolean)).size;
const summary = { voice: VOICE, keys: KEYS, view: VIEW, cards, finale, interludes, locked, stories, distinctLines: distinct, backToBackRepeats: repeats.length, errors };
console.log(JSON.stringify(summary, null, 1));
if (process.env.VERBOSE) for (const r of log) console.log(`${String(r.i).padStart(2)} ${r.phase.padEnd(7)} ${r.type.padEnd(12)} | ${r.line}`);
await browser.close();
if (cards !== 40 || finale !== 8 || stories.length !== 9 || repeats.length || errors.length) process.exitCode = 1;
