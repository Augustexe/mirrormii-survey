// Fold test (DESIGN-DIRECTION 5.5 and 7.4 B2). Renders EVERY card in cards.json inside the real card screen
// (tests/visual/harness.html) in a headless Chromium and checks the fold:
//   390 x 844: cards with up to 5 options and a prompt up to 140 characters show every option and the exits row.
//   375 x 667: the first two options are visible.
// Cards outside the rule (6 or more options, longer prompts) are measured and reported too, for the bank owner.
// Run: PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node tests/visual/fold.mjs [--voices fun,heart] [--out file]
// Exit code 1 when a card inside the rule fails. Motion is off so entrance transforms never skew a measurement.
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : def; };
const voices = opt("voices", "fun,heart").split(",");
const out = opt("out", fileURLToPath(new URL("./fold-report.json", import.meta.url)));
const pw = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const chromium = pw.chromium || pw.default.chromium;

const server = await createServer({ root, logLevel: "silent", server: { port: 0, host: "127.0.0.1", hmr: false, watch: { ignored: ["**/*"] } } });
await server.listen();
const { port } = server.httpServer.address();
const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || "chrome" });

const MEASURE = () => {
  const vh = window.innerHeight;
  const q = (s) => [...document.querySelectorAll(s)];
  const answers = q(".play .pc-tile, .play .pc-slab, .play .pc-draft, .play .pc-receipt__row, .play .pc-rank__item");
  const exits = document.querySelector(".play .pc-exits");
  const done = document.querySelector(".play .pc-done");
  const bottom = (el) => (el ? Math.round(el.getBoundingClientRect().bottom) : null);
  return {
    vh,
    answers: answers.map(bottom),
    exits: bottom(exits),
    done: bottom(done),
    prompt: bottom(document.querySelector(".play .pc-prompt")),
    scroll: document.documentElement.scrollWidth > window.innerWidth + 1,
  };
};

async function run(width, height) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(`http://127.0.0.1:${port}/tests/visual/harness.html?motion=off`);
  await page.waitForFunction(() => window.__cards && window.__show);
  await page.evaluate(() => document.fonts.ready);
  const cards = await page.evaluate(() => window.__cards);
  const rows = [];
  for (const voice of voices) {
    for (const c of cards) {
      await page.evaluate(([id, v]) => window.__show(id, v), [c.id, voice]);
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(MEASURE);
      rows.push({ id: c.id, type: c.type, voice, options: c.options, promptChars: voice === "heart" && c.heartPrompt ? c.heartPrompt : c.prompt, ...m });
    }
  }
  await page.close();
  return rows;
}

const phone = await run(390, 844);
const small = await run(375, 667);
await browser.close();
await server.close();

const inRule = (r) => r.options <= 5 && r.promptChars <= 140;
const failsPhone = (r) => r.answers.some((b) => b > r.vh) || (r.exits ?? 0) > r.vh;
const report = { at: new Date().toISOString(), voices, total: phone.length, rule: [], outside: [], small: [], overflowX: [] };
for (const r of phone) {
  const worst = Math.max(...r.answers, r.exits ?? 0);
  const row = { id: r.id, type: r.type, voice: r.voice, options: r.options, promptChars: r.promptChars, lastAnswer: Math.max(...r.answers), exits: r.exits, done: r.done, over: worst - r.vh };
  if (failsPhone(r)) (inRule(r) ? report.rule : report.outside).push(row);
  if (r.scroll) report.overflowX.push(r.id);
}
for (const r of small) if (r.answers.length >= 2 && r.answers[1] > r.vh) report.small.push({ id: r.id, type: r.type, voice: r.voice, second: r.answers[1], promptChars: r.promptChars });
report.summary = {
  phoneChecked: phone.length,
  phoneInRule: phone.filter(inRule).length,
  phoneRuleFails: report.rule.length,
  phoneOutsideRuleFails: report.outside.length,
  smallFails: report.small.length,
  overflowX: report.overflowX.length,
};
writeFileSync(out, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.summary));
for (const r of report.rule) console.log(`FAIL 390x844 ${r.id} ${r.type} ${r.voice} ${r.options} options, prompt ${r.promptChars}: ${r.over}px below the fold`);
for (const r of report.outside) console.log(`note 390x844 ${r.id} ${r.type} ${r.voice} ${r.options} options, prompt ${r.promptChars}: ${r.over}px below (outside the rule)`);
for (const r of report.small) console.log(`FAIL 375x667 ${r.id} ${r.type} ${r.voice}: second option ends at ${r.second}`);
process.exitCode = report.rule.length || report.small.length ? 1 : 0;
