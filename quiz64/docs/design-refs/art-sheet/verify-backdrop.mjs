// Drives backdrop-harness.html in Chrome: lazy shader chunk, one WebGL canvas, 30 fps driver pauses
// while hidden, and a static CSS fallback with no console errors when WebGL is blocked.
//   PLAYWRIGHT_MODULE=/path/playwright/index.mjs node docs/design-refs/art-sheet/verify-backdrop.mjs
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createServer } from "vite";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../..");
const server = await createServer({ root, logLevel: "silent", server: { port: 5199, host: "127.0.0.1" } });
await server.listen();
const url = "http://127.0.0.1:5199/docs/design-refs/art-sheet/backdrop-harness.html";
const pw = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = await import(pw.startsWith("/") ? pathToFileURL(pw).href : pw);
const results = {};

async function run(label, args, scene = "day") {
  const browser = await chromium.launch({ channel: "chrome", args });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  const chunks = [];
  page.on("console", (m) => m.type() === "error" && !/Failed to load resource/.test(m.text()) && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && errors.push(`${r.status()} ${new URL(r.url()).pathname}`));
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("request", (r) => /BackdropShader|paper-design/.test(r.url()) && chunks.push(r.url().split("/").pop()));
  await page.goto(`${url}?scene=${scene}`);
  await page.waitForTimeout(2500);
  const state = await page.evaluate(async () => {
    const canvases = document.querySelectorAll("canvas").length;
    const shaders = [...document.querySelectorAll('[data-art="backdrop"]')].map((el) => el.dataset.shader);
    const mount = document.querySelector('[data-part="shader"]')?.firstElementChild?.paperShaderMount;
    const f0 = mount?.getCurrentFrame();
    await new Promise((r) => setTimeout(r, 400));
    const f1 = mount?.getCurrentFrame();
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
    await new Promise((r) => setTimeout(r, 100));
    const f2 = mount?.getCurrentFrame();
    await new Promise((r) => setTimeout(r, 500));
    const f3 = mount?.getCurrentFrame();
    const c = document.querySelector("canvas");
    return { canvases, shaders, advancing: f1 > f0, pausedWhenHidden: f2 === f3, canvasPx: c ? [c.width, c.height] : null, dpr: devicePixelRatio };
  });
  await page.screenshot({ path: path.join(here, `backdrop-live-${label}.png`) });
  await browser.close();
  results[label] = { ...state, chunks: [...new Set(chunks)].length, errors };
}

await run("webgl", [], "day");
await run("webgl-night", [], "night");
await run("no-webgl", ["--disable-webgl", "--disable-webgl2", "--disable-3d-apis"], "island-3");
await server.close();
console.log(JSON.stringify(results, null, 2));
