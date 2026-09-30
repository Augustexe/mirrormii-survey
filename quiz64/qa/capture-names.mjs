// Plain names sheet (LAUNCH-SPEC section 26): every title card for three players in both voices at 390x844 (names
// screen, character sheet, core traits, share screen, the story-size share image and the Evidence Article cover), laid
// out on one sheet, docs/NAMES-FINAL.png.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-names.mjs [baseUrl] [outDir]
// Needs the dev server. Run ids must match /^[a-z0-9]{6,32}$/.
import fs from "node:fs";
import path from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5211/";
const OUT = process.argv[3] || path.resolve("qa/names");
fs.mkdirSync(OUT, { recursive: true });

const PLAYERS = {
  a: { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 },
  b: { R1: -0.9, R2: 0.8, R3: 0.5, L1: -0.8, L2: 0.7, L3: -0.6 },
  c: { R1: 0.7, R2: 0.9, R3: -0.8, L1: -0.5, L2: -0.8, L3: -0.9 },
};
const SCREENS = ["names", "map", "traits", "share"];

async function seed(page, signs, voice, id) {
  return page.evaluate(async ({ signs, voice, id }) => {
    localStorage.clear();
    const P = await import("/src/persona/session.js");
    const lean = (card) => {
      const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
      const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
      if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i].sort((a, b) => a - b);
      if (card.type === "rank") return ranked.map((r) => r.i);
      return ranked[0].i;
    };
    let s = P.chooseLobby(P.startRun(P.newRun({ runId: id }), { closest: "best_friend", pronoun: "they" }), { voice, depth: "anything", rooms: ["love", "work", "family"] });
    for (let g = 0; g < 200; g++) {
      const st = P.currentStep(s);
      if (st.kind === "result") break;
      if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
      s = P.answerCard(s, st.card.id, lean(st.card), { ms: 4200 });
    }
    localStorage.setItem("genii.persona.v2.run", P.serialize(s));
    return true;
  }, { signs, voice, id });
}

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
const shots = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" });
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push(e.message));
for (const [key, signs] of Object.entries(PLAYERS)) {
  for (const voice of ["fun", "heart"]) {
    const tag = `${key}-${voice}`;
    await page.goto(BASE);
    await seed(page, signs, voice, `names${key}${voice}`);
    await page.goto(BASE);
    await page.waitForSelector(".mm-landing", { timeout: 15000 });
    await page.locator(".mm-landing__cta").click();
    await page.waitForTimeout(300);
    const start = page.locator(".mm-interlude__start");
    if (await start.count()) await start.click();
    await page.waitForSelector(".rv-room", { timeout: 15000 });
    const seen = new Set();
    for (let i = 0; i < 40 && seen.size < SCREENS.length; i++) {
      const id = await page.locator(".rv-slide.is-current").getAttribute("data-story");
      if (SCREENS.includes(id) && !seen.has(id)) {
        seen.add(id);
        await page.waitForTimeout(id === "share" ? 2200 : 1200);
        const file = path.join(OUT, `${tag}-${id}.png`);
        await page.screenshot({ path: file });
        shots.push({ tag, id, file });
        if (id === "share") {
          // The story-size share image itself, as the canvas drew it.
          const data = await page.evaluate(() => { const c = document.querySelector(".rv-slide.is-current .rv-card canvas"); return c ? c.toDataURL("image/png") : null; });
          if (data) { const f = path.join(OUT, `${tag}-card.png`); fs.writeFileSync(f, Buffer.from(data.split(",")[1], "base64")); shots.push({ tag, id: "card", file: f }); }
          else errors.push(`${tag}: no share canvas`);
        }
      }
      if (id === "app") break;
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(300);
    }
    if (seen.size < SCREENS.length) errors.push(`${tag}: reached ${[...seen].join(",")}`);
    await page.goto(`${BASE}#article`);
    await page.waitForSelector(".ea-cover", { timeout: 15000 }).catch(() => errors.push(`${tag}: no article cover`));
    await page.waitForTimeout(1500);
    const cover = path.join(OUT, `${tag}-article.png`);
    await page.screenshot({ path: cover });
    shots.push({ tag, id: "article", file: cover });
    await page.locator("#party").scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(900);
    const party = path.join(OUT, `${tag}-party.png`);
    await page.locator("#party").screenshot({ path: party }).catch(() => errors.push(`${tag}: no party section`));
    if (fs.existsSync(party)) shots.push({ tag, id: "party", file: party });
  }
}
await ctx.close();

// The sheet: one row per player and voice, one column per surface.
const cols = ["names", "map", "traits", "share", "card", "article", "party"];
const rows = [...new Set(shots.map((s) => s.tag))];
const img = (f) => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
const html = `<!doctype html><html><body style="margin:0;background:#1d1838;font:600 22px system-ui;color:#fff">
<div style="padding:24px 24px 8px;font-size:30px">Plain names: kicker, name and one plain line on every title card (LAUNCH-SPEC 26), three players, both voices, 390x844</div>
<table style="border-spacing:14px"><tr><td></td>${cols.map((c) => `<td style="text-align:center">${c}</td>`).join("")}</tr>
${rows.map((r) => `<tr><td style="writing-mode:vertical-rl;transform:rotate(180deg)">${r}</td>${cols.map((c) => { const s = shots.find((x) => x.tag === r && x.id === c); return `<td style="vertical-align:top">${s ? `<img src="${img(s.file)}" style="width:390px;border-radius:12px">` : ""}</td>`; }).join("")}</tr>`).join("")}
</table></body></html>`;
const sheetFile = path.join(OUT, "sheet.html");
fs.writeFileSync(sheetFile, html);
const sp = await (await browser.newContext({ viewport: { width: 3000, height: 1200 }, deviceScaleFactor: 0.5 })).newPage();
await sp.goto(`file://${sheetFile}`);
await sp.waitForTimeout(800);
const target = path.resolve("docs/NAMES-FINAL.png");
await sp.screenshot({ path: target, fullPage: true });
await browser.close();
console.log(`${shots.length} shots, sheet ${target}`);
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; }
