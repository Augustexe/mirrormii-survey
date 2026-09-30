// The Evidence Article scrolls natively to the bottom (LAUNCH-SPEC section 25 item 3). Concept C's bug: its scroll spy
// called scrollIntoView on the active tab, which scrolled the document too and cancelled the reader's scroll. This test
// scrolls the real article with the mouse wheel (desktop, 1440x900) and with touch swipes (phone, 390x844, Chrome's
// synthesized touch scroll gesture) and fails if the page ever moves backwards on its own or does not reach the end.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/visual/article-scroll.mjs [baseUrl]
// Needs the dev server (npm run dev -- --port 5202).
import { openArticle, SIZES } from "../../qa/article-open.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5202/";

const browser = await chromium.launch({ channel: "chrome" });
const failures = [];
const results = {};
const atBottom = (page) => page.evaluate(() => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2);

for (const [size, input] of [["desktop", "wheel"], ["phone", "touch"]]) {
  const vp = SIZES[size];
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile });
  const page = await ctx.newPage();
  await openArticle(page, BASE, { voice: "fun", id: `scroll${size}` });
  await page.waitForTimeout(800);
  const cdp = input === "touch" ? await ctx.newCDPSession(page) : null;
  const trail = [];
  let backwards = 0;
  let steps = 0;
  for (; steps < 400 && !(await atBottom(page)); steps++) {
    const before = await page.evaluate(() => window.scrollY);
    if (input === "wheel") {
      await page.mouse.move(vp.width / 2, vp.height / 2);
      await page.mouse.wheel(0, 420);
    } else {
      await cdp.send("Input.synthesizeScrollGesture", { x: Math.round(vp.width / 2), y: Math.round(vp.height * 0.7), yDistance: -Math.round(vp.height * 0.5), speed: 1600, gestureSourceType: "touch", repeatCount: 1 });
    }
    // Let smooth scrolling, the scroll spy and the tab strip settle, then check the page kept (or grew) its position.
    await page.waitForTimeout(260);
    const after = await page.evaluate(() => window.scrollY);
    await page.waitForTimeout(260);
    const settled = await page.evaluate(() => window.scrollY);
    trail.push(settled);
    if (after < before - 2 || settled < after - 2) backwards++;
    if (settled <= before && !(await atBottom(page))) {
      // One more try before calling it stuck: a gesture can land during a momentum tail.
      if (trail.length > 2 && trail[trail.length - 2] === settled && trail[trail.length - 3] === settled) break;
    }
  }
  const bottom = await atBottom(page);
  const footer = await page.evaluate(() => { const r = document.querySelector(".ea-foot").getBoundingClientRect(); return r.top < window.innerHeight && r.bottom > 0; });
  results[size] = { input, steps, bottom, footerVisible: footer, backwards, height: await page.evaluate(() => document.documentElement.scrollHeight) };
  if (!bottom || !footer) failures.push(`${size} (${input}): did not reach the bottom (${steps} steps, at ${trail[trail.length - 1]})`);
  if (backwards) failures.push(`${size} (${input}): the page moved backwards ${backwards} time(s) on its own`);
  // A tab tap is the one allowed programmatic scroll: it lands on its section and the page stays there.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.locator('.ea-tabs a[data-id="record"]').click();
  await page.waitForTimeout(1400);
  const landed = await page.evaluate(() => Math.round(document.getElementById("record").getBoundingClientRect().top));
  results[size].tabLanding = landed;
  if (Math.abs(landed - 58) > 30) failures.push(`${size}: the Record tab landed ${landed}px from the top`);
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
if (failures.length) { console.error(`FAIL\n${failures.join("\n")}`); process.exit(1); }
console.log("PASS: wheel and touch reach the bottom of the article on desktop and phone; no scroll is cancelled.");
