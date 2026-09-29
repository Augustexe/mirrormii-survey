// A-21: favicon.svg, apple-touch-icon.png (180) and og.png (1200 x 630), generated fresh in code.
//
//   node scripts/render-icons.mjs                 (favicon + apple-touch-icon via resvg)
//   PLAYWRIGHT_MODULE=/path/playwright/index.mjs node scripts/render-icons.mjs --og
//
// favicon and apple-touch-icon: hand-authored SVG, svgo-optimized, rasterized with @resvg/resvg-js.
// og.png: the fogged mirror (the real <MirrorArch> from src/art, server-rendered) with the landing line
// in Fraunces. resvg cannot read the woff2 fontsource ships, so the OG pass renders in Playwright Chrome
// with the same tokens.css and the fontsource Fraunces file. Colors come from src/art/palette.js.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import { optimize } from "svgo";
import { CANVAS_DEFAULTS as C } from "../src/art/palette.js";
import { archPath, mosaic } from "../src/art/geometry.js";
import { star } from "../src/art/shapes.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
const refs = path.join(root, "docs/design-refs/art-sheet");
// svgo 4: preset-default no longer removes the viewBox, so the preset alone keeps it.
const svgoConfig = { multipass: true, plugins: ["preset-default"] };

// ---------------------------------------------------------------- favicon: the arch, a sparkle at its shoulder

export function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
<defs>
<linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${C["g-brand-1"]}"/><stop offset="1" stop-color="${C["g-deep-1"]}"/></linearGradient>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C["c-violet-100"]}"/><stop offset="1" stop-color="${C["c-on-deep"]}"/></linearGradient>
</defs>
<path d="M4.5 30.5V14.5a11.5 11.5 0 0 1 23 0v16z" fill="url(#f)"/>
<path d="M8.5 27V15a7.5 7.5 0 0 1 15 0v12z" fill="url(#g)"/>
<path d="M8.5 22.5 20 11.4a7.5 7.5 0 0 1 2.2 2.4L8.5 27z" fill="${C["c-violet-300"]}" opacity=".55"/>
<path d="${star(25, 7, 6.2)}" fill="${C["c-on-deep"]}" stroke="${C["c-violet-text"]}" stroke-width="1.1" stroke-linejoin="round"/>
</svg>`;
}

// ---------------------------------------------------------------- apple-touch-icon: the arch with a seeded mosaic

const TINTS = [1, 2, 3, 4, 5, 6, 7].map((n) => C[`tint-ch${n}`]);

export function touchIconSvg() {
  const w = 96;
  const h = 128;
  const cells = mosaic("mirrormii", 24, { w, h }).cells;
  const shards = cells.map((c, i) => `<path d="${c.path}" fill="${TINTS[i % 7]}" fill-opacity=".82"/>`).join("");
  const cracks = cells.map((c) => c.path).join(" ");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
<defs>
<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C["c-violet-100"]}"/><stop offset="1" stop-color="${C["c-canvas"]}"/></linearGradient>
<radialGradient id="glow" cx=".5" cy=".42" r=".5"><stop offset="0" stop-color="${C["c-violet"]}" stop-opacity=".45"/><stop offset="1" stop-color="${C["c-violet"]}" stop-opacity="0"/></radialGradient>
<linearGradient id="fr" x1="0" y1="0" x2="1" y2=".25"><stop offset="0" stop-color="${C["mirror-silver-2"]}"/><stop offset=".2" stop-color="${C["c-on-deep"]}"/><stop offset=".45" stop-color="${C["mirror-silver-1"]}"/><stop offset=".7" stop-color="${C["mirror-silver-2"]}"/><stop offset=".85" stop-color="${C["c-on-deep"]}"/><stop offset="1" stop-color="${C["mirror-silver-2"]}"/></linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C["c-violet-300"]}"/><stop offset="1" stop-color="${C["mirror-silver-1"]}"/></linearGradient>
<linearGradient id="sh" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/></linearGradient>
<clipPath id="c"><path d="${archPath(w, h)}"/></clipPath>
</defs>
<rect width="180" height="180" fill="url(#bg)"/>
<ellipse cx="90" cy="84" rx="86" ry="92" fill="url(#glow)"/>
<g transform="translate(42 30)">
<path d="${archPath(w + 10, h + 5)}" transform="translate(-5 -5)" fill="url(#fr)"/>
<g clip-path="url(#c)"><rect width="${w}" height="${h}" fill="url(#gl)"/>${shards}<path d="${cracks}" fill="none" stroke="#fff" stroke-width=".7" stroke-opacity=".85"/><rect width="${w}" height="${h}" fill="url(#sh)"/></g>
<path d="${archPath(w, h)}" fill="none" stroke="#fff" stroke-width="1.2"/>
<rect x="-9" y="${h - 1.5}" width="${w + 18}" height="8" rx="3" fill="url(#fr)"/>
<path d="${star(w + 2, 4, 11)}" fill="#fff" stroke="${C["c-violet-text"]}" stroke-width="1.6" stroke-linejoin="round"/>
</g>
</svg>`;
}

function png(svg, width) {
  return new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } }).render().asPng();
}

const clean = (svg) => optimize(svg, svgoConfig).data;

const favicon = clean(faviconSvg());
fs.writeFileSync(path.join(pub, "favicon.svg"), favicon + "\n");
fs.writeFileSync(path.join(pub, "apple-touch-icon.png"), png(clean(touchIconSvg()), 180));
fs.mkdirSync(refs, { recursive: true });
for (const size of [16, 32, 64]) fs.writeFileSync(path.join(refs, `favicon-${size}.png`), png(favicon, size));
console.log("wrote public/favicon.svg, public/apple-touch-icon.png, favicon previews");

// ---------------------------------------------------------------- og.png (Playwright Chrome for Fraunces)

if (process.argv.includes("--og")) {
  const { createServer } = await import("vite");
  const React = (await import("react")).default;
  const { renderToStaticMarkup } = await import("react-dom/server");
  const server = await createServer({ root, server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  const art = await server.ssrLoadModule("/src/art/index.js");
  await server.close();
  const h = React.createElement;
  const filled = Array.from({ length: 40 }, (_, i) => ({ chapter: Math.min(7, Math.floor((i * 7) / 40) + 1) }));
  const markup = renderToStaticMarkup(
    h("div", { className: "og" },
      h(art.Backdrop, { scene: "day", animated: false }),
      h("div", { className: "floor" }),
      h("div", { className: "mirror" }, h(art.MirrorArch, { seed: "og-mirrormii", filled, fog: 0.62, glow: 0.9, mullion: true, size: 300 })),
      h("div", { className: "spark s1" }, h(art.Sparkle, { size: 22 })),
      h("div", { className: "spark s2" }, h(art.Sparkle, { size: 14 })),
    ),
  );
  const fontDir = path.join(root, "node_modules/@fontsource-variable/fraunces/files");
  const fontFile = fs.readdirSync(fontDir).find((f) => /^fraunces-latin-full-normal\.woff2$/.test(f)) || fs.readdirSync(fontDir).find((f) => /latin-(full|wght)-normal/.test(f));
  const font = fs.readFileSync(path.join(fontDir, fontFile)).toString("base64");
  const wordmark = fs.readFileSync(path.join(pub, "assets/mirrormii-wordmark.svg")).toString("base64");
  const tokens = fs.readFileSync(path.join(root, "src/system/tokens.css"), "utf8");
  const html = `<!doctype html><html data-theme="day"><head><meta charset="utf-8"><style>
@font-face{font-family:"Fraunces";src:url(data:font/woff2;base64,${font}) format("woff2");font-weight:100 900;font-display:block}
${tokens}
html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:var(--c-canvas)}
.og{position:relative;width:1200px;height:630px;overflow:hidden;transform:translateZ(0)}
.floor{position:absolute;left:700px;top:500px;width:480px;height:90px;border-radius:50%;background:radial-gradient(closest-side,color-mix(in srgb,var(--c-violet) 30%,transparent),transparent)}
.mirror{position:absolute;left:790px;top:78px;filter:drop-shadow(0 28px 48px rgba(86,70,192,.28))}
.spark{position:absolute;color:var(--c-violet)} .s1{left:1110px;top:120px} .s2{left:760px;top:430px;color:var(--c-violet-300)}
.copy{position:absolute;left:84px;top:150px;width:640px;font-family:Fraunces,serif;font-variation-settings:"SOFT" 100,"WONK" 0;color:var(--c-ink)}
.wm{position:absolute;left:84px;top:64px;height:30px}
.kicker{font:700 20px/1 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:var(--c-violet-text);margin:0 0 26px}
h1{margin:0;font-weight:600;font-size:96px;line-height:.98;letter-spacing:-.03em}
h1 span{display:block} h1 .two{color:var(--c-violet-text)}
.reflect{display:block;font-weight:600;font-size:96px;line-height:.98;letter-spacing:-.03em;color:var(--c-violet-text);transform:scaleY(-1);opacity:.14;height:44px;overflow:hidden;-webkit-mask-image:linear-gradient(180deg,transparent,#000);mask-image:linear-gradient(180deg,transparent,#000)}
</style></head><body>${markup.replace('<div class="og">', `<div class="og"><img class="wm" src="data:image/svg+xml;base64,${wordmark}" alt=""><div class="copy"><p class="kicker">A personality game</p><h1><span>Let's get</span><span class="two">oddly specific.</span></h1><span class="reflect" aria-hidden="true">oddly specific.</span></div>`)}</body></html>`;
  const tmp = path.join(refs, "og.html");
  fs.writeFileSync(tmp, html);
  const pw = process.env.PLAYWRIGHT_MODULE || "playwright";
  const { chromium } = await import(pw.startsWith("/") ? pathToFileURL(pw).href : pw);
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(pub, "og.png"), type: "png" });
  await browser.close();
  fs.rmSync(tmp);
  console.log("wrote public/og.png");
}
