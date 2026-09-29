// Screenshot every screen of the persona game for design review (phone and desktop).
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-screens.mjs [baseUrl] [outDir]
// The dev server must be running. States are built with the real session code, then loaded via localStorage.
import fs from "node:fs";
import path from "node:path";
import * as P from "../src/persona/session.js";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://localhost:5174/";
const OUT = process.argv[3] || path.resolve("qa/screens");
fs.mkdirSync(OUT, { recursive: true });

let rng = 7;
const rnd = () => ((rng = (rng * 16807) % 2147483647) / 2147483647);
const signs = { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 };
function lean(card) {
  const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
  const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) + (rnd() - 0.5) * 0.3 })).sort((a, b) => b.s - a.s || a.i - b.i);
  if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i];
  if (card.type === "rank") return ranked.map((r) => r.i);
  return ranked[0].i;
}
function fresh(voice = "fun", id = "shot0000001") {
  let s = P.newRun({ runId: id });
  s = P.startRun(s, { closest: "best_friend", pronoun: "they" });
  return P.chooseLobby(s, { voice, depth: "anything", rooms: ["love", "work", "family"] });
}
// Play until the next card satisfies `stop`, or to the end.
function playUntil(s, stop) {
  for (let g = 0; g < 200; g++) {
    const st = P.currentStep(s);
    if (stop(st, s)) return s;
    if (st.kind === "result") return s;
    if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
    s = P.answerCard(s, st.card.id, lean(st.card), { ms: 4200 });
  }
  return s;
}
const states = {};
const types = ["scenario", "real", "this_or_that", "role", "pick_two", "receipts", "bet", "reply", "others", "feeling", "rank", "eyes"];
for (const t of types) {
  for (let r = 0; r < 40; r++) {
    const s = playUntil(fresh("fun", `shot${t}${r}`), (st) => st.kind === "card" && st.phase === "chapter" && st.card.type === t);
    const st = P.currentStep(s);
    if (st.kind === "card" && st.card.type === t) { states[`card-${t}`] = s; break; }
  }
}
states["lock"] = playUntil(fresh(), (st) => st.kind === "lock");
states["finale"] = playUntil(fresh(), (st) => st.kind === "card" && st.phase === "finale");
states["result-fun"] = playUntil(fresh("fun", "shotresult1"), () => false);
states["result-heart"] = playUntil(fresh("heart", "shotresult2"), () => false);
states["heart-card"] = playUntil(fresh("heart", "shotheart1"), (st) => st.kind === "card" && st.card.type === "scenario");

const browser = await chromium.launch({ headless: true, channel: process.env.PW_CHANNEL || "chrome" });
const sizes = { phone: { width: 390, height: 844, isMobile: true, hasTouch: true }, desktop: { width: 1440, height: 900 } };
const shots = [];
for (const [sizeName, vp] of Object.entries(sizes)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: !!vp.isMobile, hasTouch: !!vp.hasTouch });
  const page = await ctx.newPage();
  const snap = async (name) => { await page.waitForTimeout(3500); const f = path.join(OUT, `${sizeName}-${name}.png`); await page.screenshot({ path: f }); shots.push(f); };
  const load = async (state) => {
    await page.goto(BASE);
    await page.evaluate((raw) => { Object.keys(localStorage).filter((k) => k.startsWith("genii.")).forEach((k) => localStorage.removeItem(k)); if (raw) localStorage.setItem("genii.persona.v2.run", raw); }, state ? P.serialize(state) : null);
    await page.goto(BASE);
    await page.waitForTimeout(800);
  };
  // Landing, setup and lobby by clicking.
  await load(null); await snap("01-landing");
  await page.getByRole("button", { name: /meet genii/i }).click().catch(() => {}); await snap("02-setup-1");
  const clickFirstOption = async () => { const b = page.locator("main button").filter({ hasNotText: /back|skip|save|more|chapter map/i }).first(); await b.click().catch(() => {}); };
  await clickFirstOption(); await snap("03-setup-2");
  await clickFirstOption(); await snap("04-lobby-1");
  await clickFirstOption(); await snap("05-lobby-2");
  await clickFirstOption(); await snap("06-lobby-3");
  await page.getByRole("button", { name: /continue/i }).click().catch(() => {}); await snap("07-chapter-intro");
  for (const [name, st] of Object.entries(states)) {
    if (!st) continue;
    await load(st);
    await page.getByRole("button", { name: /pick up where|see my result/i }).click().catch(() => {});
    if (name.startsWith("result")) {
      for (let i = 1; i <= 9; i++) { await snap(`${name}-${String(i).padStart(2, "0")}`); await page.keyboard.press("ArrowRight"); }
    } else {
      const start = page.getByRole("button", { name: /^start$/i });
      if (await start.count()) await start.first().click().catch(() => {});
      await snap(name);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`${shots.length} screenshots in ${OUT}`);
