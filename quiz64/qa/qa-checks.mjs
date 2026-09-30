// Visual QA checklist 7.5, automated parts: axe-core (contrast and WCAG 2 AA), fonts in use, player-facing copy,
// horizontal overflow at 390 px and at 200% zoom (195 CSS px), share PNGs, the friend link flow end to end, and
// LCP / CLS from the Performance API. Writes a JSON report and the share PNGs to outDir.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/qa-checks.mjs [baseUrl] [outDir]
// Needs the dev server (states are built in the page with the app's own session module).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const { default: AxeBuilder } = await import("@axe-core/playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5175/";
const OUT = process.argv[3] || path.resolve("qa/qa-report");
fs.mkdirSync(OUT, { recursive: true });
void require;

// PRODUCT-TRUTH section 8 never-say list, plus the words the result must never show (LAUNCH-SPEC 13, DESIGN 7.5).
const NEVER = [/\bdiagnos/i, /\btreat(ment|ed|ing)?\b/i, /\bcure\b/i, /\bprevent/i, /clinically proven/i, /anti-aging/i, /skin age/i, /before and after/i, /\bstreak/i, /\bpredicts?\b/i, /\bDNA\b/, /genomic/i, /free forever/i];
const SYSTEM_WORDS = [/\bevidence\b/i, /\baxis\b/i, /\baxes\b/i, /\bsealed\b/i, /run id/i, /\bhash\b/i];
const EM_DASH = /\u2014/;

const report = { screens: [], axe: {}, fonts: new Set(), copy: [], overflow: [], share: [], friend: {}, perf: {}, errors: [] };

async function seed(page, cfg) {
  return page.evaluate(async (cfg) => {
    localStorage.clear();
    if (!cfg) return true;
    const P = await import("/src/persona/session.js");
    const signs = { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 };
    const lean = (card) => {
      const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0);
      const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
      if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i].sort((a, b) => a - b);
      if (card.type === "rank") return ranked.map((r) => r.i);
      return ranked[0].i;
    };
    for (let t = 0; t < (cfg.tries || 1); t++) {
      let s = P.chooseLobby(P.startRun(P.newRun({ runId: `${cfg.id}${t}` }), { closest: "best_friend", pronoun: "they" }), { voice: cfg.voice, depth: "anything", rooms: ["love", "work", "family"] });
      let hit = false;
      for (let g = 0; g < 200; g++) {
        const st = P.currentStep(s);
        if (cfg.stop === "type" && st.kind === "card" && st.phase !== "finale" && st.card.type === cfg.type && st.index > 1) { hit = true; break; }
        if (cfg.stop === "lock" && st.kind === "lock") { hit = true; break; }
        if (cfg.stop === "finale" && st.kind === "card" && st.phase === "finale") { hit = true; break; }
        if (st.kind === "result") { hit = cfg.stop === "result"; break; }
        if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
        s = P.answerCard(s, st.card.id, lean(st.card), { ms: 4200 });
      }
      if (hit) { localStorage.setItem("genii.persona.v2.run", P.serialize(s)); return true; }
    }
    return false;
  }, cfg);
}

async function audit(page, label, { axe = true } = {}) {
  await page.waitForTimeout(900);
  const info = await page.evaluate(() => {
    const fams = new Set();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const el = n.parentElement;
      if (!el || !n.textContent.trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      fams.add(cs.fontFamily.split(",")[0].replace(/["']/g, "").trim());
    }
    const loaded = [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, ""));
    return {
      text: document.body.innerText,
      fams: [...fams],
      loaded: [...new Set(loaded)],
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      mono: [...document.querySelectorAll("body *")].some((el) => el.childElementCount === 0 && el.textContent.trim() && /mono|courier|consolas/i.test(getComputedStyle(el).fontFamily)),
    };
  });
  info.fams.forEach((f) => report.fonts.add(f));
  info.loaded.forEach((f) => report.fonts.add(`loaded:${f}`));
  if (info.mono) report.copy.push(`${label}: monospace text on screen`);
  if (EM_DASH.test(info.text)) report.copy.push(`${label}: em dash on screen`);
  for (const re of [...NEVER, ...SYSTEM_WORDS]) { const m = info.text.match(re); if (m) report.copy.push(`${label}: "${m[0]}" in "${info.text.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, " ")}"`); }
  if (info.overflow > 1) report.overflow.push(`${label}: horizontal scroll ${info.overflow}px`);
  // Fold: on phone and desktop the screen's main action is fully visible without scrolling (not at 200% zoom).
  if (!label.startsWith("zoom200")) {
    const fold = await page.evaluate(() => {
      const sel = ".mm-landing__cta, .mm-interlude__start, .mm-panel__go, .pc-primary:not([disabled]), .lock .mm-btn--primary, .rv-slide.is-current .rv-cta";
      const el = [...document.querySelectorAll(sel)].find((e) => { const b = e.getBoundingClientRect(); return b.width && b.height && getComputedStyle(e).visibility !== "hidden"; });
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { cls: el.className.toString().split(" ")[0], bottom: Math.round(b.bottom), vh: innerHeight };
    });
    report.fold = report.fold || [];
    if (fold) report.fold.push({ label, ...fold, ok: fold.bottom <= fold.vh });
  }
  if (axe) {
    const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    for (const v of res.violations) {
      const key = `${v.id}`;
      report.axe[key] = report.axe[key] || { impact: v.impact, help: v.help, screens: [], samples: [] };
      report.axe[key].screens.push(label);
      for (const node of v.nodes.slice(0, 3)) if (report.axe[key].samples.length < 12) report.axe[key].samples.push(`${label}: ${node.target.join(" ")} ${node.any?.[0]?.message || node.failureSummary || ""}`.slice(0, 300));
    }
  }
  report.screens.push(label);
}

const browser = await chromium.launch({ channel: "chrome" });
const VIEWS = { phone: { width: 390, height: 844, mobile: true }, desktop: { width: 1440, height: 900, mobile: false }, zoom200: { width: 195, height: 422, mobile: true } };
for (const [vname, vp] of Object.entries(VIEWS)) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile, acceptDownloads: true });
  await ctx.addInitScript(() => { try { Object.defineProperty(navigator, "canShare", { value: undefined }); Object.defineProperty(navigator, "share", { value: undefined }); } catch { /* ok */ } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.errors.push(`${vname}: ${e.message}`));
  page.on("console", (m) => { if (m.type() === "error") report.errors.push(`${vname} console: ${m.text()}`); });
  const axe = vname !== "zoom200";
  const open = async (cfg) => {
    await page.goto(BASE);
    const ok = await seed(page, cfg);
    await page.goto(BASE);
    await page.waitForSelector(".mm-landing");
    if (cfg) await page.locator(".mm-landing__cta").click();
    await page.waitForTimeout(300);
    if (await page.locator(".mm-interlude__start").count()) await page.locator(".mm-interlude__start").click();
    return ok;
  };
  // Landing, setup, lobby, interlude.
  await open(null);
  if (vname !== "zoom200") {
    // LCP and CLS on a cold landing.
    const perf = await page.evaluate(() => new Promise((resolve) => {
      let lcp = 0, cls = 0;
      new PerformanceObserver((l) => { for (const e of l.getEntries()) lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value; }).observe({ type: "layout-shift", buffered: true });
      setTimeout(() => resolve({ lcp: Math.round(lcp), cls: Number(cls.toFixed(4)) }), 2500);
    }));
    report.perf[`${vname}-landing-dev`] = perf;
  }
  await audit(page, `${vname} landing`, { axe });
  await page.locator(".mm-landing__cta").click();
  await page.waitForSelector(".mm-setup");
  await audit(page, `${vname} setup-1`, { axe });
  await page.locator(".mm-object").first().click();
  await page.waitForSelector(".mm-setup[data-step=pronoun]");
  await audit(page, `${vname} setup-2`, { axe });
  await page.locator(".mm-pill").nth(2).click();
  await page.waitForSelector(".mm-lobby");
  await audit(page, `${vname} lobby-voice`, { axe });
  await page.locator(".mm-voice").nth(1).click();
  await page.waitForTimeout(1200); // the pick holds on screen before the next step (round 2)
  if (await page.locator(".mm-lobby[data-step=voice]").count()) await page.locator(".mm-panel__go").click();
  await page.waitForSelector(".mm-lobby[data-step=depth]");
  await audit(page, `${vname} lobby-depth (dusk)`, { axe });
  await page.locator(".mm-depth").nth(1).click();
  await page.waitForTimeout(1200);
  if (await page.locator(".mm-lobby[data-step=depth]").count()) await page.locator(".mm-panel__go").click();
  await page.waitForSelector(".mm-lobby[data-step=rooms]");
  await audit(page, `${vname} lobby-rooms (dusk)`, { axe });
  await page.locator(".mm-panel__go").click();
  await page.waitForSelector(".mm-interlude");
  await audit(page, `${vname} interlude (dusk)`, { axe });
  await page.locator(".mm-header__menu").click();
  await audit(page, `${vname} more-sheet`, { axe });
  await page.keyboard.press("Escape");

  // Every format in both voices, and the Clear light.
  for (const voice of ["fun", "heart", "cards"]) {
    for (const type of ["scenario", "real", "this_or_that", "role", "pick_two", "receipts", "bet", "reply", "others", "feeling", "rank", "eyes"]) {
      if (voice === "cards" && type !== "scenario") continue;
      if (!(await open({ voice, stop: "type", type, id: `qa${voice}${type.replace(/_/g, "")}`, tries: 30 }))) { report.errors.push(`${vname}: no ${voice} ${type}`); continue; }
      await page.waitForSelector("article.pc", { timeout: 6000 }).catch(() => {});
      await audit(page, `${vname} card ${type} (${voice})`, { axe });
    }
  }
  await page.locator(".shard-rail").first().click().catch(() => {});
  await audit(page, `${vname} chapter-map`, { axe });
  await page.keyboard.press("Escape");
  await open({ voice: "fun", stop: "lock", id: "qalockrun" });
  await page.waitForSelector("main.lock");
  await audit(page, `${vname} lock`, { axe });
  await page.getByRole("button", { name: /lock in genii/i }).click();
  await page.waitForTimeout(2200);
  await audit(page, `${vname} locked`, { axe });
  await page.getByRole("button", { name: /play the last eight cards/i }).click();
  await audit(page, `${vname} finale card`, { axe });

  for (const voice of ["fun", "heart"]) {
    await open({ voice, stop: "result", id: `qaresult${voice}` });
    await page.waitForSelector(".rv-room");
    const seen = [];
    const slides = await page.locator(".rv-slide").count();
    for (let i = 0; i < 80 && seen.length < slides; i++) {
      const id = await page.locator(".rv-slide.is-current").getAttribute("data-story");
      if (!seen.includes(id)) {
        seen.push(id);
        await page.waitForTimeout(id === "intro" ? 2500 : 1200);
        await audit(page, `${vname} result ${seen.length} ${id} (${voice})`, { axe });
        if (vname === "phone" && voice === "fun" && id === "share") {
          for (const fmt of ["story", "post"]) {
            if (fmt === "post") await page.getByRole("radio", { name: "Post" }).click().catch(() => {});
            const dl = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
            await page.locator(".rv-slide.is-current button", { hasText: /share image/i }).first().click();
            const d = await dl;
            if (d) { const f = path.join(OUT, `share-${fmt}.png`); await d.saveAs(f); report.share.push(f); } else report.errors.push(`share ${fmt}: no download`);
          }
          await page.getByRole("radio", { name: "Story" }).click().catch(() => {});
        }
        if (vname === "phone" && voice === "fun" && ["traits", "stings", "names"].includes(id)) {
          await page.locator(".rv-slide.is-current .rv-icon, .rv-icon[aria-label]").first().click().catch(() => {});
          await page.waitForTimeout(500);
          if (await page.locator(".rv-sheet").count()) {
            await audit(page, `${vname} share sheet (${id})`, { axe });
            const dl = page.waitForEvent("download", { timeout: 8000 }).catch(() => null);
            await page.locator(".rv-sheet .rv-cta, .rv-sheet .rv-row").last().click().catch(() => {});
            const d = await dl;
            if (d) { const f = path.join(OUT, `story-${id}.png`); await d.saveAs(f); report.share.push(f); }
            await page.keyboard.press("Escape");
            await page.waitForTimeout(300);
          }
        }
        if (id === "app" && voice === "fun") {
          const g = page.locator(".rv-slide.is-current .rv-end__links .rv-textbtn").nth(0);
          if (await g.count()) { await g.click(); await audit(page, `${vname} guess sheet`, { axe }); await page.keyboard.press("Escape"); await page.waitForTimeout(300); }
        }
      }
      await page.keyboard.press("ArrowRight");
      await page.waitForTimeout(200);
    }
    report.reveal = report.reveal || {};
    report.reveal[`${vname} ${voice}`] = seen;
    if (seen.length !== slides || slides < 12) report.errors.push(`${vname} ${voice}: reveal ${seen.length} of ${slides} screens`);
  }

  // Friend link flow, once per view: owner makes a link, a friend plays it in a fresh browser, the reply comes home.
  if (vname !== "zoom200") {
    await open({ voice: "fun", stop: "result", id: "qafriendowner" });
    await page.waitForSelector(".rv-room");
    await page.keyboard.press("End");
    await page.waitForTimeout(800);
    await page.locator(".rv-slide.is-current .rv-textbtn", { hasText: /really know me/i }).click();
    await page.waitForSelector(".fp-composer");
    await audit(page, `${vname} friends sheet`, { axe });
    await page.locator(".fp-rel").first().click();
    await page.getByRole("button", { name: /make their link/i }).click();
    await page.waitForSelector(".fp-made");
    await audit(page, `${vname} friend link made`, { axe });
    const link = await page.locator(".fp-made input").inputValue();
    const fctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile });
    const fp = await fctx.newPage();
    fp.on("pageerror", (e) => report.errors.push(`${vname} friend: ${e.message}`));
    await fp.goto(link);
    await fp.waitForSelector(".fg-skin");
    const stages = [];
    let reply = null;
    for (let i = 0; i < 80 && !reply; i++) {
      await fp.waitForTimeout(250);
      const stage = await fp.evaluate(() => document.querySelector(".fg-done") ? "done" : (document.querySelector(".pc-kicker")?.textContent || "").slice(0, 40));
      if (!stages.includes(stage)) { stages.push(stage); await audit(fp, `${vname} friend: ${stage}`, { axe }); }
      if (stage === "done") { reply = await fp.locator(".fg-send input").inputValue(); break; }
      const tagOff = fp.locator(".fg-tag:not(.is-on):not([disabled])");
      const primary = fp.locator(".pc-primary:not([disabled])");
      const tile = fp.locator("button[data-index]:not([disabled]):not([aria-pressed=true])");
      if (await tagOff.count()) { await tagOff.first().click(); continue; }
      const pressed = await fp.locator("button[data-index][aria-pressed=true]").count();
      if (pressed && await primary.count()) { await primary.first().click(); continue; }
      if (await tile.count()) { await tile.first().click(); continue; }
      if (await primary.count()) { await primary.first().click(); continue; }
      const exit = fp.locator(".pc-exit");
      if (await exit.count()) await exit.last().click();
    }
    await fctx.close();
    report.friend[vname] = { stages, gotReply: Boolean(reply) };
    if (reply) {
      await page.goto(reply);
      await page.waitForTimeout(1500);
      const ok = await page.locator(".fr-zones, .fr-hero").count();
      report.friend[vname].ownerSawResults = ok > 0;
      await audit(page, `${vname} friend results (owner)`, { axe });
    }
  }
  await ctx.close();
}
await browser.close();
report.fonts = [...report.fonts].sort();
fs.writeFileSync(path.join(OUT, "qa-report.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ fold: (report.fold || []).filter((f) => !f.ok), reveal: report.reveal, screens: report.screens.length, axe: Object.fromEntries(Object.entries(report.axe).map(([k, v]) => [k, v.screens.length])), fonts: report.fonts, copy: report.copy.length, overflow: report.overflow.length, share: report.share.length, friend: report.friend, perf: report.perf, errors: report.errors.length }, null, 1));
