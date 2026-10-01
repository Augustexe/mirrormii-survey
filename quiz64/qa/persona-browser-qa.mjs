// Real-browser QA for the persona game MVP. Drives the built app (vite preview) through the flows in
// docs/PERSONA-MVP-VERIFICATION.md and writes screenshots plus qa/evidence/report.json.
//
//   npm run build && npx vite preview --host 127.0.0.1 --port 4188 --strictPort   (separate shell)
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/persona-browser-qa.mjs [http://127.0.0.1:4188/]
//
// Uses the installed Google Chrome (channel "chrome"). Answers are timed above the 1.5 s rushed threshold on the
// adult run so the result reflects calm answers; the teen run taps faster on purpose.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { encodePayload } from "../src/persona/links.js";
import { KIT_ID } from "../src/persona/kit.js";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:4188/";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "evidence");
fs.mkdirSync(OUT, { recursive: true });
const kit = JSON.parse(fs.readFileSync(path.join(HERE, "../../research/persona-quiz-v2/final/cards.json"), "utf8"));
const allCards = [...kit.chapters.flatMap((c) => c.cards), ...kit.finale, ...kit.extras];
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const byPrompt = new Map();
for (const c of allCards) { byPrompt.set(norm(c.prompt), c); if (c.teenPrompt) byPrompt.set(norm(c.teenPrompt), c); }
const LOCKED18 = allCards.filter((c) => c.privacy === "locked18");

const report = { base: BASE, startedAt: new Date().toISOString(), flows: {}, failures: [] };
const check = (flow, ok, what, detail) => {
  (report.flows[flow] ||= { checks: [] }).checks.push({ ok: !!ok, what, ...(detail !== undefined ? { detail } : {}) });
  if (!ok) report.failures.push(`${flow}: ${what}${detail !== undefined ? ` (${JSON.stringify(detail)})` : ""}`);
};

const browser = await chromium.launch({ channel: "chrome", headless: true });
async function context(name, opts = {}) {
  const ctx = await browser.newContext({ viewport: opts.mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 }, deviceScaleFactor: 1, isMobile: !!opts.mobile, hasTouch: !!opts.mobile, reducedMotion: opts.reducedMotion || "no-preference" });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: new URL(BASE).origin }).catch(() => {});
  const page = await ctx.newPage();
  const log = { console: [], pageErrors: [], requests: [], failed: [] };
  page.on("console", (m) => { if (["error", "warning"].includes(m.type())) log.console.push(`${m.type()}: ${m.text()}`); });
  page.on("pageerror", (e) => log.pageErrors.push(e.message));
  page.on("request", (r) => log.requests.push(r.url()));
  page.on("requestfailed", (r) => log.failed.push(`${r.url()} ${r.failure()?.errorText}`));
  report.flows[name] ||= { checks: [] };
  report.flows[name].log = log;
  return { ctx, page, log };
}
const shot = async (page, name, full = false) => { await page.waitForTimeout(900); await page.screenshot({ path: path.join(OUT, `${name}.jpg`), type: "jpeg", quality: 62, fullPage: full }); };
const screenOf = (page) => page.locator(".app-shell").getAttribute("data-screen");
const h1 = async (page) => norm(await page.locator("main h1").first().innerText());
const noOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);

// Consistent player: leans each side by its sign, avoids circumstance and "depends" options.
function leaning(signs, card) {
  const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
  const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
  return card.type === "pick_two" ? { pick: [ranked[0].i, ranked[1].i] } : { option: ranked[0].i };
}

async function waitChange(page, before) {
  await page.waitForFunction((prev) => {
    const shell = document.querySelector(".app-shell");
    const title = document.querySelector("main h1")?.innerText || "";
    return shell && (shell.dataset.screen !== prev.screen || title.replace(/\s+/g, " ").trim() !== prev.title);
  }, before, { timeout: 8000 });
}

async function answerCard(page, choose, wait, seen, before = null) {
  const title = await h1(page);
  const card = byPrompt.get(title);
  if (!card) throw new Error(`unknown card on screen: ${title.slice(0, 80)}`);
  seen.push(card.id);
  if (before) await before(card);
  await page.waitForTimeout(wait);
  const action = choose(card);
  const was = { screen: await screenOf(page), title };
  const options = page.locator(".persona-option");
  if (action.exit) await page.locator(".persona-exit", { hasText: action.exit }).click();
  else if (action.pick) { await options.nth(action.pick[0]).click(); await options.nth(action.pick[1]).click(); }
  else {
    await options.nth(action.option).click();
    if (card.options[action.option].depends) await page.locator(".persona-flip__options .button").nth(action.flip ?? 0).click();
  }
  await waitChange(page, was);
  return card;
}

// Plays from wherever the page is until the result page. Returns what happened on the way.
async function playToResult(page, { choose, wait = 1600, flow, shots = {}, beforeCard = null }) {
  const seen = [];
  const interludes = [];
  let lockCode = null;
  for (let guard = 0; guard < 200; guard++) {
    const screen = await screenOf(page);
    if (screen === "result") break;
    if (screen === "interlude") {
      interludes.push(await h1(page));
      if (shots.interlude && interludes.length === 1) await shot(page, shots.interlude);
      if (shots.extra && /Two more cards/.test(interludes.at(-1))) await shot(page, shots.extra);
      const before = { screen, title: await h1(page) };
      await page.getByRole("button", { name: /^Start/ }).click();
      await waitChange(page, before);
    } else if (screen === "card") {
      await answerCard(page, choose, wait, seen, beforeCard);
    } else if (screen === "lock") {
      const lockBtn = page.getByRole("button", { name: /Lock in Genii's guesses/ });
      if (await lockBtn.count()) {
        const text = await page.locator("main").innerText();
        check(flow, !/Genii guessed|Called it/.test(text), "no guess is shown before the finale");
        if (shots.lock) await shot(page, `${shots.lock}-before`);
        await lockBtn.click();
        await page.getByRole("button", { name: /Play the last eight cards/ }).waitFor();
        lockCode = await page.locator(".persona-lock-code code").first().innerText();
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("genii.persona.v2.run")).lockHash);
        check(flow, stored && stored.startsWith(lockCode.replace(/\s/g, "")), "the lock code on screen matches the stored lock hash, before any finale card", { lockCode, stored });
        if (shots.lock) await shot(page, `${shots.lock}-after`);
      }
      const before = { screen, title: await h1(page) };
      await page.getByRole("button", { name: /Play the last eight cards/ }).click();
      await waitChange(page, before);
      if (shots.finale) await shot(page, shots.finale);
    } else throw new Error(`unexpected screen ${screen}`);
  }
  return { seen, interludes, lockCode };
}

async function setup(page, age, closest, pronoun) {
  await page.goto(BASE);
  await page.getByRole("button", { name: /Meet Genii/ }).click();
  await page.getByRole("button", { name: age }).click();
  await page.getByRole("button", { name: closest }).click();
  await page.getByRole("button", { name: pronoun }).click();
  await page.locator(".app-shell[data-screen='interlude']").waitFor();
}

function logChecks(flow, log) {
  check(flow, log.pageErrors.length === 0, "no page errors", log.pageErrors);
  check(flow, log.console.length === 0, "no console errors or warnings", log.console);
  const origin = new URL(BASE).origin;
  const external = log.requests.filter((u) => !u.startsWith(origin) && !u.startsWith("data:") && !u.startsWith("blob:"));
  check(flow, external.length === 0, "no requests leave the local origin", external);
  check(flow, log.failed.length === 0, "no failed requests", log.failed);
  check(flow, log.requests.every((u) => !/[?&#](play|reply)=/.test(u)), "no link payload is ever sent in a request");
}

// ---------------------------------------------------------------- 1. adult owner, desktop, full run and result
const adult = await context("adult-desktop");
{
  const { page, log } = adult;
  const flow = "adult-desktop";
  await page.goto(BASE);
  await shot(page, "01-landing-desktop");
  await page.getByRole("button", { name: /Meet Genii/ }).click();
  await shot(page, "02-setup-desktop");
  await page.getByRole("button", { name: /18 or older/ }).click();
  await page.getByRole("button", { name: /My best friend/ }).click();
  await page.getByRole("button", { name: /she \/ her/ }).click();
  await page.locator(".app-shell[data-screen='interlude']").waitFor();
  const signs = { R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 };
  let pickShot = false;
  let cardShot = false;
  const res = await playToResult(page, {
    flow, wait: 1600, shots: { interlude: "03-interlude-desktop", lock: "06-lock-desktop", finale: "07-finale-card-desktop" },
    beforeCard: async (card) => {
      if (!cardShot && card.type === "scenario") { cardShot = true; await shot(page, "04-card-desktop"); }
      if (!pickShot && card.type === "pick_two") { pickShot = true; await shot(page, "05-pick-two-desktop"); }
    },
    choose: (card) => (card.id === "C2-3" ? { option: card.options.findIndex((o) => o.depends), flip: 1 } : leaning(signs, card)),
  });
  const chapterSeen = res.seen.filter((id) => !id.startsWith("X-") && !kit.finale.some((c) => c.id === id));
  check(flow, chapterSeen.length >= 60 && chapterSeen.length <= 61, "adult sees 60 or 61 chapter cards", chapterSeen.length);
  check(flow, LOCKED18.filter((c) => c.id !== "C3-9").every((c) => chapterSeen.includes(c.id)), "adult sees the 18+ cards");
  check(flow, res.seen.filter((id) => kit.finale.some((c) => c.id === id)).length === 8, "8 finale cards");
  check(flow, res.interludes.length >= 7, "every chapter opens with its title card", res.interludes);
  const flipStored = await page.evaluate(() => JSON.parse(localStorage.getItem("genii.persona.v2.run")).answers["C2-3.flip"]);
  check(flow, flipStored === 1, "the depends follow-up was recorded", flipStored);
  const text = await page.locator("main").innerText();
  for (const h of ["What stings", "What you love about it", "Your tags", "Genii's calls", "Genii's guesses", "Do you really know me?"]) check(flow, text.includes(h), `result shows "${h}"`);
  check(flow, /Genii called \d+ of \d+ exactly/.test(text), "finale scored against the lock", text.match(/Genii called[^\n]*/)?.[0]);
  check(flow, !/\bT\d\d[AB]\b|\bC\d-\d+\b|\bX-[RL]\d/.test(text), "no internal ids on the result page");
  check(flow, !/\b(sealed|axis|axes)\b/i.test(text), "no system words on the result page");
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("genii.persona.v2.run")));
  const rushed = Object.values(stored.ms).filter((ms) => ms < 1500).length;
  check(flow, rushed === 0, "calm answers were timed above the rushed threshold", rushed);
  await shot(page, "08-result-top-desktop");
  await shot(page, "09-result-full-desktop", true);
  report.flows[flow].result = { code: text.match(/[A-Z?][A-Za-z?]+·[^\n]*\|[^\n]*/)?.[0], line: text.match(/Genii called[^\n]*/)?.[0], lockCode: res.lockCode };

  // Resume on the result after a reload.
  await page.reload();
  await page.getByRole("button", { name: /See my result/ }).click();
  await page.locator(".persona-result").waitFor();
  check(flow, true, "reload keeps the finished result");
  logChecks(flow, log);
}

// ---------------------------------------------------------------- 2. friend challenge: owner -> friend -> owner
{
  const flow = "friend-loop";
  const { page } = adult;
  await page.locator("#fp-title").scrollIntoViewIfNeeded();
  await page.locator(".fp-rel", { hasText: "Bestie" }).click();
  const toggles = await page.locator(".fp-toggle").allInnerTexts();
  check(flow, toggles.some((t) => /Bonus round/.test(t)), "bestie offers the sting bonus round", toggles);
  await page.locator(".fp-toggle", { hasText: "Bonus round" }).locator("input").check();
  await page.locator(".fp-emoji label").nth(2).click();
  await page.locator(".fp-field input").first().fill("Alex");
  await shot(page, "10-composer-desktop");
  await page.getByRole("button", { name: /Make their link/ }).click();
  const link = await page.locator(".fp-made input").inputValue();
  check(flow, /#play=[A-Za-z0-9_-]+\.[0-9a-f]{8}$/.test(link), "challenge link is a fragment payload", link.length);
  check(flow, link.length < 4000, "challenge link is short enough to paste", link.length);
  report.flows[flow].link = link;
  await shot(page, "11-link-ready-desktop");
  const stings = await page.evaluate(() => [...document.querySelectorAll(".pr-tag-sting, .pr-panel--sting li")].map((e) => e.innerText.replace("Only you see this", "").trim()));

  const friend = await context("friend-mobile", { mobile: true });
  const fp = friend.page;
  await fp.goto(link);
  await fp.locator(".app-shell[data-screen='friend']").waitFor();
  check(flow, (await h1(fp)).includes("Alex"), "friend sees the owner's chosen name", await h1(fp));
  await shot(fp, "12-friend-intro-mobile");
  await fp.getByRole("button", { name: /Start guessing/ }).click();
  for (let i = 0; i < 6; i++) { const t = await h1(fp); await fp.locator(".persona-option").first().click(); await fp.waitForFunction((p) => document.querySelector("main h1")?.innerText.replace(/\s+/g, " ").trim() !== p, t); if (i === 0) await shot(fp, "13-friend-level1-mobile"); }
  check(flow, /Your guess for Alex/.test(await h1(fp)), "guessed type shown after question 6");
  await fp.getByRole("button", { name: /Next level/ }).click();
  let l2 = 0;
  for (; l2 < 12; l2++) {
    if (!(await fp.locator(".persona-option").count())) break;
    await fp.locator(".persona-option").nth(l2 % 2).click();
    if (l2 === 0) { await fp.locator(".fg-chip", { hasText: "Pure gut" }).click(); await shot(fp, "14-friend-level2-mobile"); }
    const t = await h1(fp);
    await fp.getByRole("button", { name: /^Next/ }).click();
    await fp.waitForFunction((p) => document.querySelector("main h1")?.innerText.replace(/\s+/g, " ").trim() !== p, t);
    if (/Guess the tags|Which of these/.test(await fp.locator("main").innerText())) { l2++; break; }
  }
  const need = Number((await fp.locator(".persona-pick-count").innerText()).match(/of (\d)/)[1]);
  for (let i = 0; i < need; i++) await fp.locator(".fg-tag:not([disabled])").nth(i).click();
  await shot(fp, "15-friend-level3-mobile");
  await fp.getByRole("button", { name: /Bonus round|See my score/ }).click();
  const stingLines = await fp.locator(".persona-option").allInnerTexts();
  await shot(fp, "16-friend-level4-mobile");
  await fp.locator(".persona-option").first().click();
  await fp.locator(".persona-option").first().click();
  await fp.locator(".fg-done").waitFor();
  const doneText = await fp.locator("main").innerText();
  check(flow, /You read \d\/6 sides of Alex/.test(doneText), "friend sees their score", doneText.match(/You read[^\n]*/)?.[0]);
  check(flow, /Choices called: \d+\/\d+\. Tags spotted: \d\/\d\./.test(doneText), "friend sees counts only");
  check(flow, stings.every((s) => !doneText.includes(s)), "friend's result shows none of the owner's stings");
  check(flow, stingLines.length === 4, "bestie round shows 4 sting lines", stingLines.length);
  check(flow, await noOverflow(fp), "no horizontal overflow on the friend result (mobile)");
  await shot(fp, "17-friend-done-mobile", true);
  const reply = await fp.locator(".fg-send input").inputValue();
  check(flow, /#reply=[A-Za-z0-9_-]+\.[0-9a-f]{8}$/.test(reply), "reply link is a fragment payload", reply.length);
  const friendStorage = await fp.evaluate(() => Object.keys(localStorage));
  check(flow, friendStorage.every((k) => k.startsWith("genii.")) && !friendStorage.includes("genii.persona.v2.run"), "the friend's browser keeps only its friend-game progress", friendStorage);

  // Your turn: the friend starts their own run.
  await fp.getByRole("button", { name: /Your turn/ }).click();
  await fp.locator(".app-shell[data-screen='setup']").waitFor();
  check(flow, true, "Your turn starts the friend's own run");
  await fp.getByRole("button", { name: /Under 13/ }).click();
  await fp.locator(".app-shell[data-screen='blocked']").waitFor();
  const afterBlock = await fp.evaluate(() => localStorage.getItem("genii.persona.v2.run"));
  check(flow, afterBlock === null, "an under-13 stop after Your turn saves no run and no name", afterBlock);
  logChecks("friend-mobile", friend.log);
  await friend.ctx.close();

  // Owner opens the reply.
  await page.goto(reply);
  await page.locator(".fr").waitFor();
  const ownerText = await page.locator("main").innerText();
  for (const z of ["They get you", "What they don't see", "Who they think you are", "Only you see this page", "Bonus round"]) check(flow, ownerText.toLowerCase().includes(z.toLowerCase()), `owner view shows "${z}"`);
  check(flow, /Bestie \S+ (thinks you're .+\. You're .+\. They read \d\/6 sides of you\.|guessed your exact type)/.test(ownerText), "owner view compares the guessed type", ownerText.match(/Bestie \S+ (thinks|guessed)[^\n]*/)?.[0]);
  check(flow, (await page.evaluate(() => location.hash)) === "", "the reply fragment is cleared after import");
  await shot(page, "18-owner-friend-view-desktop", true);
  await page.getByRole("button", { name: /Back to my result/ }).click();
  const played = await page.locator(".fp-sent__row", { hasText: "Played" }).count();
  check(flow, played === 1, "the sent link shows as played");

  // Two tabs: a second tab makes a link; the first tab follows it and never overwrites it.
  const tab2 = await adult.ctx.newPage();
  await tab2.goto(BASE);
  await tab2.getByRole("button", { name: /See my result/ }).click();
  await tab2.locator(".fp-rel", { hasText: "Crush" }).click();
  await tab2.getByRole("button", { name: /Make their link/ }).click();
  await tab2.locator(".fp-made input").waitFor();
  await page.locator(".persona-broken", { hasText: "another tab" }).waitFor({ timeout: 5000 }).catch(() => {});
  check(flow, (await page.locator(".persona-broken", { hasText: "another tab" }).count()) === 1, "the first tab notices the other tab's save");
  await page.locator(".fp-rel", { hasText: "Partner" }).click();
  await page.getByRole("button", { name: /Make their link/ }).click();
  await page.locator(".fp-made input").waitFor();
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem("genii.persona.v2.run")));
  check(flow, kept.challenges.length === 3 && kept.friendResults.length === 1, "no link or reply is lost across two tabs", { links: kept.challenges.map((c) => c.rel), replies: kept.friendResults.length });
  await tab2.close();
  logChecks(flow, adult.log);
}

// ---------------------------------------------------------------- 3. tampered save fails closed
{
  const flow = "tamper";
  const t = await context(flow);
  const state = await adult.ctx.storageState();
  await t.page.goto(BASE);
  const run = state.origins.find((o) => o.origin === new URL(BASE).origin).localStorage.find((x) => x.name === "genii.persona.v2.run").value;
  const data = JSON.parse(run);
  const p = data.frozen.predictions.find((x) => !x.pass);
  p.predicted = (p.predicted + 1) % 3;
  await t.page.evaluate((v) => localStorage.setItem("genii.persona.v2.run", v), JSON.stringify(data));
  await t.page.reload();
  const text = await t.page.locator("body").innerText();
  check(flow, /changed after Genii locked its guesses/.test(text), "a save whose guesses changed after the lock is refused", text.match(/This run[^\n]*/)?.[0]);
  check(flow, /Meet Genii/.test(text), "and the player can start fresh");
  await shot(t.page, "19-tampered-save-desktop");
  await t.ctx.close();
}

// ---------------------------------------------------------------- 4. teen run, mobile, reduced motion, keyboard
{
  const flow = "teen-mobile";
  const teen = await context(flow, { mobile: true, reducedMotion: "reduce" });
  const { page, log } = teen;
  await setup(page, /13 to 17/, /A crush/, /they \/ them/);
  await shot(page, "20-teen-interlude-mobile");
  await page.getByRole("button", { name: /^Start/ }).click();
  // Keyboard: Tab to the first option and press Enter.
  const firstTitle = await h1(page);
  let focused = false;
  for (let i = 0; i < 25 && !focused; i++) { await page.keyboard.press("Tab"); focused = await page.evaluate(() => document.activeElement?.classList.contains("persona-option")); }
  check(flow, focused, "an answer can be reached with Tab");
  await page.waitForTimeout(400);
  await page.keyboard.press("Enter");
  await waitChange(page, { screen: "card", title: firstTitle });
  check(flow, (await h1(page)) !== firstTitle, "Enter answers the focused option");
  const sizes = await page.evaluate(() => [...document.querySelectorAll(".persona-option, .persona-exit")].map((e) => Math.round(e.getBoundingClientRect().height)));
  check(flow, sizes.every((h) => h >= 44), "tap targets are at least 44px tall on mobile", Math.min(...sizes));
  check(flow, await noOverflow(page), "no horizontal overflow on a card (mobile)");
  await shot(page, "21-teen-card-mobile");
  const res = await playToResult(page, { flow, wait: 350, choose: (card) => leaning({ R1: -1, R2: 1, R3: 1, L1: -1, L2: 1, L3: -1 }, card) });
  const seen = [byPrompt.get(firstTitle).id, ...res.seen];
  check(flow, LOCKED18.every((c) => !seen.includes(c.id)), "no 18+ card is ever shown to a teen", seen.filter((id) => LOCKED18.some((c) => c.id === id)));
  const chapterSeen = seen.filter((id) => !id.startsWith("X-") && !kit.finale.some((c) => c.id === id));
  check(flow, chapterSeen.length <= 57, "teen sees at most 57 chapter cards", chapterSeen.length);
  const teenPrompted = seen.map((id) => allCards.find((c) => c.id === id)).filter((c) => c.teenPrompt);
  check(flow, teenPrompted.length > 0, "teen versions of prompts were used", teenPrompted.length);
  const text = await page.locator("main").innerText();
  const lockedTagNames = ["Future parent, with terms", "Full life, no kids required", "The wedding's for the family", "Love without the paperwork"];
  check(flow, lockedTagNames.every((n) => !text.includes(n)), "no marriage or kids tag on a teen result");
  check(flow, await noOverflow(page), "no horizontal overflow on the result (mobile)");
  await shot(page, "22-teen-result-mobile", true);
  await page.locator(".fp-rel", { hasText: "Partner" }).click();
  const toggles = await page.locator(".fp-toggle").allInnerTexts();
  check(flow, toggles.every((t) => !/Marriage and kids/.test(t)), "a teen owner is never offered the marriage and kids switch", toggles);
  logChecks(flow, log);
  await teen.ctx.close();
}

// ---------------------------------------------------------------- 5. unfinished side -> adaptive extras
{
  const flow = "extras";
  const x = await context(flow);
  const { page, log } = x;
  await setup(page, /18 or older/, /My partner/, /he \/ him/);
  const res = await playToResult(page, {
    flow, wait: 250, shots: { extra: "23-extras-interlude-desktop" },
    choose: (card) => (!card.axisFor && card.type !== "sealed" && card.options.some((o) => o.axes && o.axes.R1) ? { exit: "Skip" } : { option: 0, pick: card.type === "pick_two" ? [0, 1] : undefined }),
  });
  const extras = res.seen.filter((id) => id.startsWith("X-"));
  check(flow, res.interludes.some((t) => /Two more cards and Genii can call it/.test(t)), "an unfinished side gets the extras title card", res.interludes);
  check(flow, extras.length >= 1 && extras.length <= 2 && extras.every((id) => id.startsWith("X-R1")), "only extras for the unfinished side, 1 or 2 of them", extras);
  const code = (await page.locator(".pr-code").innerText()).trim();
  check(flow, !code.includes("?"), "the extras finished the side", code);
  logChecks(flow, log);
  await x.ctx.close();
}

// ---------------------------------------------------------------- 6. malformed links
{
  const flow = "malformed-links";
  const m = await context(flow, { mobile: true });
  const { page, log } = m;
  const realLink = (await adult.page.evaluate(() => [...document.querySelectorAll(".fp-sent__row")].length)) ? await adult.page.evaluate(() => JSON.parse(localStorage.getItem("genii.persona.v2.run")).challenges[0].id) : null;
  check(flow, Boolean(realLink), "owner has a saved challenge for the link tests");
  const body = report.flows["friend-loop"].link.split("#play=")[1];
  const flipped = body.slice(0, 30) + (body[30] === "A" ? "B" : "A") + body.slice(31);
  const cases = [
    ["garbage", `${BASE}#play=garbage`, /cut off or changed/],
    ["bad-checksum", `${BASE}#play=eyJ2IjoxfQ.00000000`, /cut off or changed/],
    ["edited-real-link", `${BASE}#play=${flipped}`, /cut off or changed/],
    ["script", `${BASE}#play=%3Cimg%20src%3Dx%20onerror%3D%22window.__xss%3D1%22%3E`, /cut off or changed/],
    ["too-long", `${BASE}#play=${"A".repeat(7000)}.00000000`, /too long/],
    ["other-kit", `${BASE}#play=${encodePayload({ v: 1, k: "persona-quiz-v1@old", i: "abcdefghij" })}`, /different version/],
    ["html-name", `${BASE}#play=${encodePayload({ v: 1, k: KIT_ID, i: "abcdefghij", r: "bestie", n: "<b>x</b>", p: "she", e: 0, s: 1, w: 0, o: [0, 0, 0, 1], a: [], b: [], c: null, d: null })}`, /cut off or changed/],
    ["reply-elsewhere", `${BASE}#reply=${encodePayload({ v: 1, k: KIT_ID, i: "abcdefghij", u: 0, a: [1, 1, 1, 1, 1, 1], b: [], c: [], d: null })}`, /another browser/],
    ["broken-reply", `${BASE}#reply=eyJ2IjoxfQ.11111111`, /cut off or changed/],
  ];
  for (const [name, url, expect] of cases) {
    await page.goto("about:blank");
    await page.goto(url);
    await page.locator(".app-shell[data-screen='linkError']").waitFor({ timeout: 5000 });
    const text = await page.locator("main").innerText();
    check(flow, expect.test(text), `${name}: readable error`, text.split("\n").slice(0, 2).join(" | "));
    check(flow, !(await page.evaluate(() => typeof window.__xss !== "undefined")), `${name}: nothing executed`);
    if (name === "garbage") {
      await shot(page, "24-malformed-link-mobile");
      await page.reload();
      await page.locator(".app-shell[data-screen='landing']").waitFor();
      check(flow, (await page.evaluate(() => location.hash)) === "", "a bad link is cleared, so a reload lands on the start page");
    }
  }
  check(flow, log.pageErrors.length === 0, "no page errors on malformed links", log.pageErrors);
  await m.ctx.close();
}

// ---------------------------------------------------------------- 7. resume mid-run, restart, delete data
{
  const flow = "resume-delete";
  const r = await context(flow);
  const { page, log } = r;
  await setup(page, /18 or older/, /A sibling/, /they \/ them/);
  await page.getByRole("button", { name: /^Start/ }).click();
  const seen = [];
  for (let i = 0; i < 5; i++) await answerCard(page, (card) => leaning({ R1: 1 }, card), 200, seen);
  const expected = await h1(page);
  await page.reload();
  await page.getByRole("button", { name: /Pick up where I left off/ }).click();
  await page.locator(".app-shell[data-screen='card']").waitFor();
  check(flow, (await h1(page)) === expected, "reload resumes on the same card", { expected, got: await h1(page) });
  const before = await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("genii.persona.v2.run")).answers).length);
  check(flow, before === 5, "five answers were saved", before);
  // Restart from the More menu.
  await page.getByRole("button", { name: /More/ }).first().click();
  await page.getByRole("button", { name: /Play again from the start/ }).click();
  await page.getByRole("button", { name: /^Start again$/ }).click();
  await page.locator(".app-shell[data-screen='setup']").waitFor();
  const afterRestart = await page.evaluate(() => localStorage.getItem("genii.persona.v2.run"));
  check(flow, afterRestart === null, "restart clears the saved run and returns to setup", afterRestart && afterRestart.slice(0, 60));
  // Delete everything.
  await page.getByRole("button", { name: /More/ }).first().click();
  await page.getByRole("button", { name: /Delete my data/ }).click();
  await shot(page, "25-delete-confirm-desktop");
  await page.getByRole("button", { name: /^Delete my data$/ }).last().click();
  await page.locator(".app-shell[data-screen='landing']").waitFor();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  check(flow, keys.filter((k) => k.startsWith("genii.")).length === 0, "delete removes every genii key", keys);
  check(flow, (await page.getByRole("button", { name: /Meet Genii/ }).count()) === 1, "landing starts fresh after delete");
  logChecks(flow, log);
  await r.ctx.close();
}

// ---------------------------------------------------------------- mobile landing and owner result check
{
  const flow = "mobile-landing";
  const m = await context(flow, { mobile: true });
  await m.page.goto(BASE);
  check(flow, await noOverflow(m.page), "no horizontal overflow on the landing (mobile)");
  await shot(m.page, "26-landing-mobile");
  logChecks(flow, m.log);
  await m.ctx.close();
}

await adult.ctx.close();
await browser.close();
report.finishedAt = new Date().toISOString();
report.passed = report.failures.length === 0;
report.counts = Object.fromEntries(Object.entries(report.flows).map(([k, v]) => [k, `${v.checks.filter((c) => c.ok).length}/${v.checks.length}`]));
for (const flow of Object.values(report.flows)) if (flow.log) flow.log = { pageErrors: flow.log.pageErrors, console: flow.log.console, failed: flow.log.failed, requests: flow.log.requests.length, externalRequests: flow.log.requests.filter((u) => !u.startsWith(new URL(BASE).origin)).length };
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report.counts, null, 1));
if (report.failures.length) { console.log("FAILURES:\n" + report.failures.join("\n")); process.exitCode = 1; }
else console.log("all browser checks passed");
