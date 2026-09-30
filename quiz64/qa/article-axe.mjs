// axe (WCAG 2 AA) on the Evidence Article at phone and desktop, both voices, with every stat drawer open, a trait card
// turned over and the phone section menu open. Needs the dev server.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/article-axe.mjs [baseUrl]
import { createRequire } from "node:module";
import { openArticle, SIZES } from "./article-open.mjs";
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const require = createRequire(import.meta.url);
const axeSource = require("fs").readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] || "http://127.0.0.1:5202/";

const browser = await chromium.launch({ channel: "chrome" });
const out = [];
for (const voice of ["fun", "heart"]) {
  for (const size of ["phone", "desktop"]) {
    const vp = SIZES[size];
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, hasTouch: vp.mobile, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await openArticle(page, BASE, { voice, id: `axe${voice}${size}` });
    await page.waitForTimeout(600);
    // Open every closed drawer and turn the first card over, so their contents are checked too.
    await page.$$eval('.ea-stat__btn[aria-expanded="false"]:not([disabled])', (bs) => bs.forEach((b) => b.click()));
    await page.locator(".ea-card__turn").first().click().catch(() => {});
    if (vp.mobile) await page.locator(".ea-tabs__menu").click();
    await page.waitForTimeout(600);
    await page.addScriptTag({ content: axeSource });
    const res = await page.evaluate(async () => {
      const r = await window.axe.run(document.querySelector(".ea"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] } });
      return r.violations.map((v) => ({ id: v.id, impact: v.impact, n: v.nodes.length, nodes: v.nodes.slice(0, 3).map((n) => `${n.target.join(" ")} :: ${n.failureSummary.split("\n")[1] || ""}`) }));
    });
    out.push({ voice, size, violations: res });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(out, null, 1));
const total = out.reduce((t, r) => t + r.violations.length, 0);
console.log(total ? `FAIL: ${total} violation group(s)` : "PASS: axe clean on the article (phone and desktop, both voices)");
process.exit(total ? 1 : 0);
