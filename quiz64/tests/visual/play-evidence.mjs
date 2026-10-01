// Evidence untouched (DESIGN-DIRECTION 7.4 B8). Drives EVERY card in cards.json through the same taps on the frozen
// pre-package-B card (legacy-card.jsx) and on the new card, in a real browser, and compares what onAnswer receives:
// the value (index, index arrays, exit ids) and the meta keys (ms, flip). ms itself is timing, so only its type is
// compared. The new pick two waits 600 ms before sending (a spec'd cancel window); the value is the same.
// Run: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/visual/play-evidence.mjs
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const chromium = pw.chromium || pw.default.chromium;
const server = await createServer({ root, logLevel: "silent", server: { port: 0, host: "127.0.0.1", hmr: false, watch: { ignored: ["**/*"] } } });
await server.listen();
const { port } = server.httpServer.address();
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });

// Tap scripts per card: arrays of steps. { opt: i } taps option i, { exit: id } taps an exit, { done: true } taps Done.
function scriptsFor(card) {
  const n = card.options;
  const none = card.none;
  const exits = card.exits.map((id) => [{ exit: id }]);
  if (card.type === "receipts") {
    const s = [[{ opt: 0 }, { opt: 2 }, { done: true }], [{ done: true }], [{ opt: 1 }, { opt: 1 }, { opt: 3 }, { done: true }]];
    if (none >= 0) s.push([{ opt: 0 }, { opt: none }, { done: true }], [{ opt: none }, { opt: 1 }, { done: true }]);
    return [...s, ...exits];
  }
  if (card.type === "pick_two") return [[{ opt: 1 }, { opt: 4 }], [{ opt: 5 }, { opt: 0 }], [{ opt: 2 }, { opt: 2 }, { opt: 3 }, { opt: 0 }], ...exits];
  if (card.type === "rank") return [[{ opt: 2 }, { opt: 0 }, { opt: 3 }, { opt: 1 }, { done: true }], [{ opt: 3 }, { opt: 1 }, { opt: 1 }, { opt: 2 }, { opt: 1 }, { opt: 0 }, { done: true }], ...exits];
  return [...Array.from({ length: n }, (_, i) => [{ opt: i }]), ...exits];
}

const EXIT_TEXT = { skip: "Skip", not_my_life: "Not my life", no_recent: "No recent example" };

async function play(page, impl, card, voice, script) {
  await page.evaluate(([id, v]) => window.__show(id, v), [card.id, voice]);
  for (const step of script) {
    if (step.exit) {
      const sel = impl === "legacy" ? ".persona-exit" : ".pc-exit";
      await page.locator(sel, { hasText: EXIT_TEXT[step.exit] }).first().click();
    } else if (step.done) {
      await page.locator(impl === "legacy" ? ".persona-done button" : ".pc-done button").click();
    } else if (impl === "legacy") {
      await page.locator(".persona-option").nth(step.opt).click();
    } else if (card.type === "rank") {
      await page.locator(`.pc-rank__item[data-index="${step.opt}"] .pc-rank__tap`).click();
    } else {
      await page.locator(`.pc [data-index="${step.opt}"]`).first().click();
    }
  }
  await page.waitForFunction(() => window.__answers.length > 0, null, { timeout: 2500 }).catch(() => null);
  return page.evaluate(() => window.__answers.map((a) => ({ value: a.value, meta: Object.keys(a.meta).sort(), ms: typeof a.meta.ms, flip: a.meta.flip })));
}

const pages = {};
for (const impl of ["legacy", "new"]) {
  pages[impl] = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pages[impl].goto(`http://127.0.0.1:${port}/tests/visual/harness.html?mode=${impl}&motion=off`);
  await pages[impl].waitForFunction(() => window.__cards && window.__show);
}
const cards = await pages.new.evaluate(async () => {
  const { KIT } = await import("/src/persona/kit.js");
  return [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras].map((c) => ({ id: c.id, type: c.type, options: c.options.length, exits: c.exits, none: c.options.findIndex((o) => o.none) }));
});
let checked = 0;
const diffs = [];
const byType = {};
for (const card of cards) {
  for (const voice of ["fun", "heart"]) {
    for (const script of scriptsFor(card)) {
      const a = await play(pages.legacy, "legacy", card, voice, script);
      const b = await play(pages.new, "new", card, voice, script);
      checked++;
      byType[card.type] = (byType[card.type] || 0) + 1;
      if (JSON.stringify(a) !== JSON.stringify(b)) diffs.push({ id: card.id, type: card.type, voice, script, legacy: a, next: b });
    }
  }
}
await browser.close();
await server.close();
console.log(JSON.stringify({ cards: cards.length, tapScripts: checked, byType, differences: diffs.length }));
for (const d of diffs.slice(0, 20)) console.log("DIFF", JSON.stringify(d));
process.exitCode = diffs.length ? 1 : 0;
