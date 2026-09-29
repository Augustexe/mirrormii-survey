// Step 0 scaffold checks (docs/DESIGN-DIRECTION.md sections 4 and 7.1): tokens.css and tokens.js agree, themes and
// night scoping exist, the layer order is declared with the legacy files inside it, and the barrels name their exports.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import * as T from "../src/system/tokens.js";
import { createEventBus, geniiEvents } from "../src/system/events.js";

const read = (rel) => fs.readFileSync(new URL(`../${rel}`, import.meta.url), "utf8");
const css = read("src/system/tokens.css");

// Custom properties declared in the first block that matches `selector {`.
function block(selector) {
  const start = css.indexOf(`${selector} {`);
  assert.ok(start >= 0, `missing block ${selector}`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("\n}", start));
  const vars = {};
  for (const m of body.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
  return vars;
}
const norm = (v) => String(v).replace(/\s+/g, " ").toUpperCase();

test("tokens.css day colors match section 4.2 and tokens.js", () => {
  const root = block(":root");
  const expect = {
    "--c-canvas": T.color.canvas, "--c-canvas-2": T.color.canvas2, "--c-surface": T.color.surface,
    "--c-surface-solid": T.color.surfaceSolid, "--c-ink": T.color.ink, "--c-ink-2": T.color.ink2, "--c-ink-3": T.color.ink3,
    "--c-line": T.color.line, "--c-violet": T.color.violet, "--c-violet-300": T.color.violet300, "--c-violet-100": T.color.violet100,
    "--c-violet-text": T.color.violetText, "--c-violet-strong": T.color.violetStrong, "--c-focus": T.color.focus, "--c-danger": T.color.danger,
    "--n-900": T.night.n900, "--n-800": T.night.n800, "--n-700": T.night.n700, "--n-600": T.night.n600,
    "--n-ink": T.night.ink, "--n-ink-2": T.night.ink2, "--n-ink-3": T.night.ink3, "--n-violet": T.night.violet,
  };
  for (const [name, value] of Object.entries(expect)) assert.equal(norm(root[name]), norm(value), name);
  assert.equal(root["--c-canvas"], "#F8F8FF");
  assert.equal(root["--c-violet-strong"], "#6A5AD6");
  assert.equal(root["--n-900"], "#171625");
  assert.match(root["--g-brand"], /135deg, #988DEA, #5B8BEB/);
  assert.match(root["--g-deep"], /135deg, #5A4ED6, #4A63D3/);
  for (const [ch, v] of Object.entries(T.chapterTint)) {
    const name = /^\d$/.test(ch) ? `ch${ch}` : ch;
    assert.equal(norm(root[`--tint-${name}`]), norm(v.tint), `tint ${name}`);
    assert.equal(norm(root[`--tint-${name}-deep`]), norm(v.deep), `deep ${name}`);
  }
  assert.equal(root["--mirror-silver-1"], T.materials.mirror.backing[0]);
  assert.equal(root["--mirror-silver-2"], T.materials.mirror.backing[1]);
  for (const [name, v] of Object.entries(T.beads)) assert.equal(norm(root[`--bead-${name}`]), norm(v), `bead ${name}`);
});

test("tokens.css space, radii, elevation and motion match tokens.js", () => {
  const root = block(":root");
  T.space.forEach((px, i) => assert.equal(root[`--s-${i + 1}`], `${px}px`));
  const radii = { "--r-chip": "chip", "--r-tile-s": "tileS", "--r-answer": "answer", "--r-sheet": "sheet", "--r-hero": "hero", "--r-pill": "pill" };
  for (const [name, key] of Object.entries(radii)) assert.equal(root[name], `${T.radii[key]}px`, name);
  for (const k of ["e1", "e2", "e3"]) assert.equal(root[`--${k}`], T.elevation[k], k);
  assert.equal(root["--glow-g1"], T.elevation.glowG1);
  for (const [k, ms] of Object.entries(T.durations)) assert.equal(root[`--d-${k}`], `${ms}ms`, k);
  const ease = { "--e-out": "out", "--e-in-out": "inOut", "--e-in": "in" };
  for (const [name, key] of Object.entries(ease)) assert.equal(root[name].replace(/\s/g, ""), `cubic-bezier(${T.easings[key].join(",")})`, name);
  assert.deepEqual([T.springs.tap.stiffness, T.springs.tap.damping, T.springs.settle.stiffness, T.springs.settle.damping], [520, 34, 180, 24]);
});

test("type scale: phone values in :root, desktop overrides in the 1024 media query", () => {
  const root = block(":root");
  const names = { hero: "hero", display: "display", "prompt-s": "promptS", "prompt-m": "promptM", "prompt-l": "promptL", title: "title", genii: "genii", quote: "quote", "body-l": "bodyL", answer: "answer", body: "body", small: "small", kicker: "kicker", micro: "micro" };
  const desk = css.slice(css.indexOf("@media (min-width: 1024px)"), css.indexOf("@media (max-width: 359.98px)"));
  for (const [css_, js] of Object.entries(names)) {
    const tok = T.type[js];
    assert.equal(root[`--type-${css_}-size`], `${tok.phone[0]}px`, `${css_} size`);
    assert.equal(root[`--type-${css_}-line`], `${tok.phone[1]}px`, `${css_} line`);
    assert.equal(Number(root[`--type-${css_}-weight`]), tok.weight, `${css_} weight`);
    assert.equal(parseFloat(root[`--type-${css_}-track`]), tok.track, `${css_} track`);
    assert.ok(root[`--type-${css_}`], `${css_} shorthand`);
    if (tok.desktop[0] !== tok.phone[0]) assert.match(desk, new RegExp(`--type-${css_}-size: ${tok.desktop[0]}px`), `${css_} desktop size`);
    if (tok.desktop[1] !== tok.phone[1]) assert.match(desk, new RegExp(`--type-${css_}-line: ${tok.desktop[1]}px`), `${css_} desktop line`);
  }
  assert.match(root["--font-display"], /^"Fraunces"/);
  assert.match(root["--font-text"], /^"Figtree"/);
  assert.doesNotMatch(css, /monospace/);
});

test("themes: day, dusk and clear via html[data-theme]; night scoped with [data-scene=night]", () => {
  const dusk = block('html[data-theme="dusk"]');
  assert.equal(dusk["--c-canvas"], "#F7F2FB");
  assert.equal(dusk["--c-canvas-2"], "#F6E9F1");
  assert.match(dusk["--g-deep"], /#5A4ED6, #8A4FB8/);
  assert.equal(dusk["--glow-a"], "#F2C4D8");
  assert.equal(dusk["--glow-b"], "#F8D5C6");
  const clear = block('html[data-theme="clear"]');
  assert.equal(clear["--glow-strength"], "0.5");
  for (const [theme, vars] of [["dusk", dusk], ["clear", clear]]) {
    const scale = T.themes[theme].motionScale;
    assert.equal(Number(vars["--motion-scale"]), scale);
    for (const k of ["instant", "quick", "base", "slow", "scene", "reveal"]) assert.equal(parseFloat(vars[`--d-${k}`]), T.durations[k] * scale, `${theme} ${k}`);
    assert.equal(vars["--sparkle-bursts"], "0");
  }
  assert.ok(block('html[data-theme="day"]'));
  const night = block('[data-scene="night"]');
  assert.equal(night["--c-canvas"], "#171625");
  assert.equal(night["--c-ink"], "#F3F1FF");
  assert.equal(night["--e3"], T.elevation.e3Night);
  assert.match(css, /prefers-reduced-transparency: reduce/);
  assert.deepEqual(T.VOICE_THEME, { fun: "day", heart: "dusk", cards: "clear" });
  assert.equal(T.motionFor("dusk").ms.base, 300);
  assert.equal(T.motionFor("clear").ms.base, 204);
  assert.equal(T.motionFor("day").s.reveal, 1.6);
});

test("emotion beads map all 12 bank emotions; unknown falls back to the chapter tint", () => {
  assert.equal(Object.keys(T.EMOTION_BEAD).length, 12);
  assert.equal(T.beadFor("pride", 1), T.beads.butter);
  assert.equal(T.beadFor("nope", 3), T.chapterTint[3].tint);
});

test("layers.css declares the layer order and keeps the 13 legacy stylesheets in the legacy layer", () => {
  const layers = read("src/system/layers.css");
  assert.match(layers, /@layer legacy, system, art, play, reveal, screens;/);
  const legacy = [...layers.matchAll(/@import url\("([^"]+)"\) layer\(legacy\);/g)].map((m) => m[1]);
  assert.equal(legacy.length, 13);
  for (const rel of legacy) assert.ok(fs.existsSync(new URL(`../src/system/${rel}`, import.meta.url)), rel);
  for (const f of ["fonts.css", "tokens.css", "system.css"]) assert.match(layers, new RegExp(`@import url\\("\\./${f}"\\) layer\\(system\\);`));
  const app = read("src/PersonaApp.jsx");
  assert.match(app, /import "\.\/system\/layers\.css";/);
  assert.doesNotMatch(app, /import "\.\/(styles|launch|persona\/persona)\.css";/);
});

test("fonts: subset files exist, Figtree is preloaded, Fontaine is wired", () => {
  const fonts = read("src/system/fonts.css");
  for (const m of fonts.matchAll(/url\("([^"]+)"\)/g)) assert.ok(fs.existsSync(new URL(m[1], new URL("../src/system/", import.meta.url))), m[1]);
  assert.match(read("index.html"), /rel="preload"[\s\S]*?figtree-latin\.woff2/);
  assert.match(read("vite.config.js"), /FontaineTransform\.vite\(/);
  const pkg = JSON.parse(read("package.json"));
  for (const dep of ["@fontsource-variable/fraunces", "@fontsource-variable/figtree", "fontaine", "@paper-design/shaders-react"]) assert.ok(pkg.dependencies[dep], dep);
  for (const dep of ["@resvg/resvg-js", "svgo"]) assert.ok(pkg.devDependencies[dep], dep);
});

test("barrels export the names PersonaApp and the packages rely on", () => {
  const names = (rel) => new Set([...read(rel).matchAll(/export \{([^}]+)\}/g)].flatMap((m) => m[1].split(",").map((s) => s.trim().split(/\s+as\s+/).pop())).filter(Boolean));
  const screens = names("src/persona/screens/index.js");
  for (const n of ["PersonaHeader", "PersonaLanding", "SetupView", "LobbyView", "PersonaInterlude", "interludeFor", "PersonaHowDialog", "PersonaMoreDialog", "ConfirmDialog"]) assert.ok(screens.has(n), `screens ${n}`);
  const play = names("src/persona/play/index.js");
  for (const n of ["PersonaQuizView", "LockView", "PersonaChapterMap", "FriendGame", "FriendResultsView"]) assert.ok(play.has(n), `play ${n}`);
  const reveal = names("src/persona/reveal/index.js");
  for (const n of ["PersonaResult", "FriendMirrorHero", "resultView"]) assert.ok(reveal.has(n), `reveal ${n}`);
  const system = read("src/system/index.js");
  for (const n of ["GeniiLight", "geniiEvents", "Reflect", "motion", "useTheme"]) assert.match(system, new RegExp(`\\b${n}\\b`), `system ${n}`);
  assert.match(system, /export \* as tokens from/);
});

test("GeniiLight placeholder uses no raster and no retired Genii renders", () => {
  const src = read("src/system/GeniiLight.jsx") + read("src/system/system.css");
  assert.doesNotMatch(src, /\.(webp|png|jpe?g|gif)\b|asset\(|genii-opal|genii-glass|halo-scene/);
});

test("geniiEvents delivers to every listener and unsubscribes", () => {
  const bus = createEventBus();
  const got = [];
  const off = bus.on((name, detail) => got.push([name, detail]));
  bus.on((name) => got.push([name, "second"]));
  bus.emit("noted", 3);
  off();
  bus.emit("sure");
  assert.deepEqual(got, [["noted", 3], ["noted", "second"], ["sure", "second"]]);
  assert.equal(typeof geniiEvents.emit, "function");
});
