// Genii as light (DESIGN-DIRECTION 3.3, A-07; package A criterion 3): without an evolution, every mood and size renders
// as code-made light with zero raster images, honors reduced motion, pauses when the tab is hidden, and reacts to geniiEvents.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

let server;
const load = (p) => server.ssrLoadModule(p);
const css = fs.readFileSync(new URL("../src/system/system.css", import.meta.url), "utf8");

test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
});
test.after(async () => { await server.close(); });

test("GeniiLight renders every mood at every size with no raster and no face", async () => {
  const { GeniiLight, tokens } = await load("/src/system/index.js");
  for (const mood of tokens.GENII_MOODS) {
    for (const size of Object.keys(tokens.geniiSizes)) {
      const html = renderToStaticMarkup(React.createElement(GeniiLight, { mood, size }));
      assert.match(html, new RegExp(`data-mood="${mood}"`), `${mood} ${size}`);
      assert.match(html, new RegExp(`data-size="${size}"`), `${mood} ${size}`);
      assert.match(html, /genii-light__core/);
      assert.doesNotMatch(html, /<img|\.webp|\.png|\.jpe?g|\b(eye|eyes|face|mouth)\b/i, `${mood} ${size}`);
      assert.match(html, /aria-hidden="true"/, "the light is decorative");
    }
  }
  const big = renderToStaticMarkup(React.createElement(GeniiLight, { size: "xl", mood: "sure" }));
  assert.doesNotMatch(big, /wisp|curl|smoke|lamp/, "Genii is a slime, never a genie: no lamp smoke (LAUNCH-SPEC 23)");
  assert.equal((big.match(/genii-light__sparkle"/g) || []).length, 7, "xl carries seven sparkles");
  const tiny = renderToStaticMarkup(React.createElement(GeniiLight, { size: "xs" }));
  assert.doesNotMatch(tiny, /genii-light__sparkle"/, "xs is a clean dot of light");
});

test("GeniiLight lines: Fraunces italic, polite, hidden for Just the cards", async () => {
  const { GeniiLight } = await load("/src/system/index.js");
  const line = "Oh, you enjoyed that one.";
  const fun = renderToStaticMarkup(React.createElement(GeniiLight, { line, voice: "fun" }));
  assert.ok(fun.includes(line));
  assert.match(fun, /aria-live="polite"/);
  const cards = renderToStaticMarkup(React.createElement(GeniiLight, { line, voice: "cards" }));
  assert.ok(!cards.includes(line));
  assert.match(css, /\.genii-light__line\s*\{[^}]*font: var\(--type-genii\)/);
});

test("GeniiLight motion: loops only without reduced motion, paused while hidden, one pulse on noted", () => {
  const motionBlock = css.slice(css.indexOf("@media (prefers-reduced-motion: no-preference)", css.indexOf("Genii's light")));
  assert.match(motionBlock, /genii-breath/);
  assert.match(motionBlock, /body:not\(\[data-motion="off"\]\)/);
  assert.match(css, /html\[data-hidden="true"\] \.genii-light \*/);
  assert.match(css, /animation-play-state: paused/);
  const jsx = fs.readFileSync(new URL("../src/system/GeniiLight.jsx", import.meta.url), "utf8");
  assert.match(jsx, /visibilitychange/);
  assert.match(jsx, /geniiEvents\.on/);
});

test("geniiEvents reaches every mounted light (the bus is shared across packages)", async () => {
  const sys = await load("/src/system/index.js");
  const events = await load("/src/system/events.js");
  assert.equal(sys.geniiEvents, events.geniiEvents, "one bus for everyone");
  const got = [];
  const offA = sys.geniiEvents.on((n) => got.push(`a:${n}`));
  const offB = sys.geniiEvents.on((n) => got.push(`b:${n}`));
  sys.geniiEvents.emit("noted");
  offA(); offB();
  sys.geniiEvents.emit("sure");
  assert.deepEqual(got, ["a:noted", "b:noted"]);
});

test("theme store: voice commits a light, preview shows one and goes back", async () => {
  const theme = await load("/src/system/theme.js");
  const store = { theme: "day" };
  globalThis.document = { documentElement: { dataset: store }, body: { dataset: {} } };
  globalThis.window = { matchMedia: () => ({ matches: false }) };
  try {
    const seen = [];
    const off = theme.subscribeTheme((t) => seen.push(t));
    theme.setThemeForVoice("heart");
    assert.equal(store.theme, "dusk");
    theme.previewTheme("clear");
    assert.equal(store.theme, "clear");
    theme.previewTheme(null);
    assert.equal(store.theme, "dusk", "preview returns to the committed light");
    theme.setThemeForVoice("fun");
    assert.equal(store.theme, "day");
    off();
    assert.deepEqual(seen, ["dusk", "clear", "dusk", "day"]);
  } finally {
    delete globalThis.document;
    delete globalThis.window;
  }
});
