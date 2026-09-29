// Screenshot matrix for design review (DESIGN-DIRECTION 7.5): every screen of the persona game at 390x844 ("phone"),
// 375x667 ("small") and 1440x900 ("desktop"), in both voices, with the file names of the pre-rebuild capture plus the
// screens it missed (every card format, chapter map, lobby voice preview, Dusk and Clear cards, share sheet, guess
// sheet, reduced-motion reveal, reduced transparency, friend game).
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/capture-screens.mjs [baseUrl] [outDir]
// Needs the dev server (`npm run dev -- --port 5175`): states are built in the page with the app's own session module.
// Env: SIZES=phone,small,desktop  ONLY=<regex on the file label>  WAIT=<ms before each shot, default 1400>
//      PLAYER=<a|b|c|d> a leaning player preset (default a); b, c and d lean elsewhere and answer the final cards with
//      some noise, so Genii's calls show hits, partials and surprises (G6).
import fs from "node:fs";
import path from "node:path";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5175/";
const OUT = process.argv[3] || path.resolve("qa/screens");
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
const WAIT = Number(process.env.WAIT || 1400);
fs.mkdirSync(OUT, { recursive: true });

const SIZES = {
  phone: { width: 390, height: 844, mobile: true },
  small: { width: 375, height: 667, mobile: true },
  desktop: { width: 1440, height: 900, mobile: false },
};
const only = process.env.SIZES ? process.env.SIZES.split(",") : Object.keys(SIZES);
// COVER=<file>: after every shot, record which selectors of the legacy cascade layer match something on screen (pseudo
// classes stripped), so integration can keep only legacy rules the app really uses.
const COVER = process.env.COVER || null;
const covered = new Set();
const legacySelectors = new Set();
async function cover(p) {
  if (!COVER) return;
  const res = await p.evaluate(() => {
    const all = [], hit = [];
    const strip = (sel) => sel.replace(/::?(?:before|after|backdrop|placeholder|selection|marker|-webkit-[\w-]+)/g, "").replace(/:(hover|focus|focus-visible|focus-within|active|visited|disabled|checked|empty|first-child|last-child|not\([^)]*\))/g, "").trim() || "*";
    const visit = (rules, inLegacy) => {
      for (const r of rules) {
        const legacy = inLegacy || (r.constructor.name === "CSSLayerBlockRule" && r.name === "legacy");
        if (r.cssRules && r.constructor.name !== "CSSStyleRule") visit(r.cssRules, legacy);
        else if (legacy && r.selectorText) for (const sel of r.selectorText.split(/,(?![^(]*\))/)) {
          const t = sel.trim(); all.push(t);
          try { if (document.querySelector(strip(t))) hit.push(t); } catch { hit.push(t); }
        }
      }
    };
    for (const sh of document.styleSheets) { try { visit(sh.cssRules, false); } catch { /* cross-origin */ } }
    return { all, hit };
  });
  res.all.forEach((x) => legacySelectors.add(x));
  res.hit.forEach((x) => covered.add(x));
}
const TYPES = ["scenario", "real", "this_or_that", "role", "pick_two", "receipts", "bet", "reply", "others", "feeling", "rank", "eyes"];

// Built in the page: plays a leaning player with the real session module until `stop` matches, then saves the run.
// Run ids must match /^[a-z0-9]{6,32}$/ (the app rejects anything else as a corrupt save).
const PLAYERS = {
  a: { signs: { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 }, noise: 0 },
  b: { signs: { R1: -0.9, R2: 0.8, R3: 0.5, L1: -0.8, L2: 0.7, L3: -0.6 }, noise: 0.5 },
  c: { signs: { R1: 0.7, R2: 0.9, R3: -0.8, L1: -0.5, L2: -0.8, L3: -0.9 }, noise: 0.4 },
  d: { signs: { R1: -0.6, R2: -0.9, R3: 0.9, L1: 0.8, L2: 0.9, L3: 0.4 }, noise: 0.6 },
};
const PLAYER = PLAYERS[process.env.PLAYER || "a"] || PLAYERS.a;

async function seedRun(page, cfg) {
  return page.evaluate(async (cfg) => {
    localStorage.clear();
    if (!cfg) return true;
    const P = await import("/src/persona/session.js");
    const signs = cfg.player.signs;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const lean = (card, finale) => {
      const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
      const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
      if (finale && cfg.player.noise && rnd() < cfg.player.noise) return ranked[Math.min(ranked.length - 1, 1 + Math.floor(rnd() * (ranked.length - 1)))].i;
      if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i].sort((a, b) => a - b);
      if (card.type === "rank") return ranked.map((r) => r.i);
      return ranked[0].i;
    };
    const tries = cfg.tries || 1;
    for (let t = 0; t < tries; t++) {
      const id = `${cfg.id}${t}`;
      let s = P.chooseLobby(P.startRun(P.newRun({ runId: id }), { closest: "best_friend", pronoun: "they" }), { voice: cfg.voice, depth: "anything", rooms: ["love", "work", "family"] });
      let hit = false;
      for (let g = 0; g < 200; g++) {
        const st = P.currentStep(s);
        if (cfg.stop === "type" && st.kind === "card" && st.phase !== "finale" && st.card.type === cfg.type && st.index > 1) { hit = true; break; }
        if (cfg.stop === "lock" && st.kind === "lock") { hit = true; break; }
        if (cfg.stop === "finale" && st.kind === "card" && st.phase === "finale") { hit = true; break; }
        if (cfg.stop === "mid" && st.kind === "card" && st.resolved === 17) { hit = true; break; }
        if (cfg.stop === "late" && st.kind === "card" && st.phase !== "finale" && st.resolved >= 30 && st.card.type === "scenario") { hit = true; break; }
        if (st.kind === "result") { hit = cfg.stop === "result"; break; }
        if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
        s = P.answerCard(s, st.card.id, lean(st.card, st.phase === "finale"), { ms: 4200 });
      }
      if (hit) { localStorage.setItem("genii.persona.v2.run", P.serialize(s)); return true; }
    }
    return false;
  }, cfg && { ...cfg, player: PLAYER });
}

const browser = await chromium.launch({ channel: "chrome" });
const errors = [];
let count = 0;
for (const size of only) {
  const vp = SIZES[size];
  const mk = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 2, isMobile: vp.mobile, hasTouch: vp.mobile, ...opts });
    const page = await ctx.newPage();
    page.on("pageerror", (e) => errors.push(`${size}: ${e.message}`));
    page.on("console", (m) => { if (m.type() === "error") errors.push(`${size} console: ${m.text()}`); });
    return { ctx, page };
  };
  let { ctx, page } = await mk();
  const want = (label) => !ONLY || ONLY.test(label);
  const snap = async (label, wait = WAIT, p = page) => {
    if (!want(label)) return;
    await p.waitForTimeout(wait);
    await p.screenshot({ path: path.join(OUT, `${size}-${label}.png`) });
    await cover(p);
    count++;
  };
  // Opens the app on a seeded run and walks past the landing into it.
  const open = async (cfg, p = page) => {
    await p.goto(BASE);
    const ok = await seedRun(p, cfg);
    await p.goto(BASE);
    await p.waitForSelector(".mm-landing", { timeout: 8000 });
    if (cfg) await p.locator(".mm-landing__cta").click();
    await p.waitForTimeout(300);
    const start = p.locator(".mm-interlude__start");
    if (await start.count()) await start.click();
    return ok;
  };

  // Landing, setup and lobby by tapping, as a new player.
  if (want("0") || want("lobby")) {
    await open(null);
    await snap("01-landing", 1800);
    await page.locator(".mm-landing__cta").click();
    await page.waitForSelector(".mm-setup");
    await snap("02-setup-1");
    await page.locator(".mm-object").first().click();
    await page.waitForSelector(".mm-setup[data-step=pronoun]");
    await snap("03-setup-2");
    await page.locator(".mm-pill").nth(2).click();
    await page.waitForSelector(".mm-lobby");
    await snap("04-lobby-1");
    // Voice preview: hover (desktop) or focus shows the light before it is chosen.
    await page.locator(".mm-voice").nth(1).hover();
    await page.locator(".mm-voice").nth(1).focus();
    await snap("lobby-voice-preview", 900);
    await page.locator(".mm-voice").nth(0).click();
    await page.waitForTimeout(1200); // the pick holds on screen before the next step (round 2)
    if (await page.locator(".mm-lobby[data-step=voice]").count()) await page.locator(".mm-panel__go").click();
    await page.waitForSelector(".mm-lobby[data-step=depth]");
    await snap("05-lobby-2");
    await page.locator(".mm-depth").nth(1).click();
    await page.waitForTimeout(1200); // the pick holds on screen before the next step (round 2)
    if (await page.locator(".mm-lobby[data-step=depth]").count()) await page.locator(".mm-panel__go").click();
    await page.waitForSelector(".mm-lobby[data-step=rooms]");
    await snap("06-lobby-3");
    await page.locator(".mm-panel__go").click();
    await page.waitForSelector(".mm-interlude");
    await snap("07-chapter-intro", 1800);
  }

  // Every card format, in Make it fun and Heart to heart. Before-names: <size>-card-<type>; new: <size>-heart-card-<type>.
  for (const [voice, prefix] of [["fun", "card"], ["heart", "heart-card"]]) {
    for (const type of TYPES) {
      const label = `${prefix}-${type}`;
      if (!want(label)) continue;
      const ok = await open({ voice, stop: "type", type, id: `shot${voice}${type.replace(/_/g, "")}`, tries: 30 });
      if (!ok) { errors.push(`${size}: no ${voice} ${type} card reached`); continue; }
      await page.waitForSelector(`article.pc[data-card-type=${type}]`, { timeout: 6000 }).catch(() => errors.push(`${size}: ${label} not on screen`));
      await snap(label);
    }
  }
  // The pre-rebuild names for the Heart to heart card and the three lights.
  if (want("heart-card") || want("card-dusk") || want("card-clear") || want("card-day")) {
    await open({ voice: "heart", stop: "type", type: "scenario", id: "shotheartscen", tries: 30 });
    await snap("heart-card");
    await snap("card-dusk", 200);
    await open({ voice: "cards", stop: "type", type: "scenario", id: "shotclearscen", tries: 30 });
    await snap("card-clear");
    await open({ voice: "fun", stop: "type", type: "scenario", id: "shotdayscen", tries: 30 });
    await snap("card-day");
  }
  // A late-run card (Genii evolved), for the jury's screen 8.
  if (want("card-late")) {
    const ok = await open({ voice: "fun", stop: "late", id: "shotlaterun" });
    if (ok) { await page.waitForSelector("article.pc", { timeout: 6000 }).catch(() => {}); await snap("card-late", 2400); } else errors.push(`${size}: no late card reached`);
  }
  // Chapter map, from the shard rail on a mid-run card.
  if (want("chapter-map")) {
    await open({ voice: "fun", stop: "mid", id: "shotmapmid" });
    await page.waitForSelector("article.pc");
    await page.locator(".shard-rail").first().click();
    await snap("chapter-map", 900);
  }
  // The lock, locked, and the first finale card.
  if (want("lock") || want("finale")) {
    await open({ voice: "fun", stop: "lock", id: "shotlockrun" });
    await page.waitForSelector("main.lock");
    await snap("lock", 1800);
    await page.getByRole("button", { name: /lock in genii/i }).click();
    await snap("lock-locked", 2600);
    await open({ voice: "fun", stop: "finale", id: "shotfinalerun" });
    const play = page.getByRole("button", { name: /play the final 8/i });
    if (await play.count()) await play.click();
    await page.waitForSelector("article.pc[data-phase=finale]", { timeout: 6000 }).catch(() => {});
    await snap("finale");
    await snap("card-sealed", 100);
  }
  // The reveal: every story screen per voice (twelve with rooms and calls, round 2), then the share and guess sheets.
  for (const voice of ["fun", "heart"]) {
    if (!want(`result-${voice}`) && !want("sheet")) continue;
    await open({ voice, stop: "result", id: `shotresult${voice}` });
    await page.waitForSelector(".rv-room", { timeout: 8000 });
    const seen = [];
    const slides = await page.locator(".rv-slide").count();
    for (let i = 0; i < 80 && seen.length < slides; i++) {
      const id = await page.locator(".rv-slide.is-current").getAttribute("data-story");
      if (!seen.includes(id)) {
        seen.push(id);
        await snap(`result-${voice}-${String(seen.length).padStart(2, "0")}`, seen.length === 1 ? 3200 : 2000);
        if (id === "share" && voice === "fun") {
          await page.locator(".rv-slide.is-current .rv-icon, .rv-icon").first().click().catch(() => {});
          await snap("share-sheet", 1200);
          await page.keyboard.press("Escape");
          await page.waitForTimeout(300);
        }
        if (id === "app" && voice === "fun") {
          const g = page.locator(".rv-slide.is-current .rv-end__links .rv-textbtn").nth(0);
          if (await g.count()) { await g.click(); await snap("guess-sheet", 1200); await page.keyboard.press("Escape"); await page.waitForTimeout(300); }
        }
      }
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(250);
    }
    if (seen.length < slides || slides < 12) errors.push(`${size}: ${voice} reveal reached ${seen.length} of ${slides} screens (${seen.join(",")})`);
  }
  // Reduced motion and reduced transparency.
  if (want("reduced")) {
    await ctx.close();
    ({ ctx, page } = await mk({ reducedMotion: "reduce" }));
    await open({ voice: "fun", stop: "result", id: "shotreduced" });
    await page.waitForSelector(".rv-room", { timeout: 8000 });
    await snap("reduced-motion-reveal", 700);
    await open({ voice: "fun", stop: "type", type: "scenario", id: "shotreducedcard", tries: 30 });
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-transparency", value: "reduce" }, { name: "prefers-reduced-motion", value: "reduce" }] });
    await snap("reduced-transparency-card", 700);
    await open(null);
    await snap("reduced-transparency-landing", 700);
  }
  await ctx.close();
}
await browser.close();
console.log(`${count} screenshots in ${OUT}`);
if (COVER) {
  fs.writeFileSync(COVER, JSON.stringify({ all: [...legacySelectors].sort(), hit: [...covered].sort() }, null, 1));
  console.log(`legacy selectors: ${legacySelectors.size}, matched: ${covered.size} (${COVER})`);
}
if (errors.length) { console.log(errors.join("\n")); process.exitCode = 1; }
