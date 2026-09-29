// System guardrails (DESIGN-DIRECTION 7.4, package A criteria 2, 4 and 8):
// - only src/system (tokens) and src/art may hold color, font-family and duration literals in CSS; the legacy layer
//   is exempt until integration deletes it;
// - the shipped module graph never references the retired library Genii renders or badges;
// - the brand fonts stay inside the 220 KB budget and Satoshi is never requested.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../", import.meta.url));
const rel = (p) => path.relative(ROOT, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out); else out.push(p);
  }
  return out;
}

const legacy = new Set([...read("src/system/layers.css").matchAll(/@import url\("([^"]+)"\) layer\(legacy\);/g)]
  .map((m) => rel(path.resolve(ROOT, "src/system", m[1]))));
// Files integration deletes with the dossier build (never imported by the persona app).
const DOSSIER = /^src\/(dossier[\w-]*|preview)\.css$/;
const exempt = (f) => f.startsWith("src/system/") || f.startsWith("src/art/") || legacy.has(f) || DOSSIER.test(f);

// Declarations of a stylesheet, comments removed: [{ prop, value }].
function declarations(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");
  return [...clean.matchAll(/([a-zA-Z-]+)\s*:\s*([^;{}]+)(?=;|\})/g)].map((m) => ({ prop: m[1].toLowerCase(), value: m[2].trim() }));
}
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const TIMED = /^(transition|animation)(-duration|-delay)?$/;
const RAW_DURATION = /(^|[\s,(])(\d*\.)?\d+m?s\b/;

export function styleViolations(file, css) {
  const out = [];
  for (const { prop, value } of declarations(css)) {
    if (prop.startsWith("--")) continue;
    if (HEX.test(value)) out.push(`${file}: hex color in ${prop}: ${value}`);
    if (prop === "font-family") out.push(`${file}: font-family: ${value}`);
    if (prop === "font" && !/var\(--(type|font)-/.test(value) && !/^(inherit|initial|unset)$/.test(value)) out.push(`${file}: font shorthand without a token: ${value}`);
    if (TIMED.test(prop) && RAW_DURATION.test(value.replace(/var\([^)]*\)/g, ""))) out.push(`${file}: raw duration in ${prop}: ${value}`);
  }
  return out;
}

// Pre-rebuild stylesheets another package is still rewriting (stories.css was one, now gone). Reported, not
// failed, until integration empties this list; every new stylesheet is checked from its first line.
const PENDING_CSS = new Set([]);

test("style guard: no hex colors, font-family or raw durations in CSS outside src/system, src/art and the legacy layer", (t) => {
  const files = walk(path.join(ROOT, "src")).filter((f) => f.endsWith(".css")).map(rel).filter((f) => !exempt(f));
  assert.ok(files.includes("src/persona/screens/screens.css"), "the screens stylesheet is checked");
  const pending = files.filter((f) => PENDING_CSS.has(f)).map((f) => [f, styleViolations(f, read(f)).length]).filter(([, n]) => n);
  if (pending.length) t.diagnostic(`pending rewrite: ${pending.map(([f, n]) => `${f} (${n})`).join(", ")}`);
  const bad = files.filter((f) => !PENDING_CSS.has(f)).flatMap((f) => styleViolations(f, read(f)));
  assert.deepEqual(bad, []);
});

test("style guard catches each forbidden literal (self-check)", () => {
  const v = styleViolations("x.css", ".a { color: #fff; font-family: Arial; transition: opacity 200ms ease; animation-delay: 1s; } .b { color: var(--c-ink); transition: opacity var(--d-base) var(--e-out); }");
  assert.equal(v.length, 4);
  assert.deepEqual(styleViolations("y.css", ".c { --x: #fff; animation: spin var(--d-loop-orbit) linear infinite; font: var(--type-body); }"), []);
});

test("package A files hold no hex colors or font names in JSX", () => {
  const files = [...walk(path.join(ROOT, "src/persona/screens")), path.join(ROOT, "src/PersonaApp.jsx"), path.join(ROOT, "src/persona/PersonaDialogs.jsx")]
    .filter((f) => f.endsWith(".jsx"));
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(src, /["'`]#[0-9a-fA-F]{3,8}["'`]/, `${rel(f)} has a hex literal`);
    assert.doesNotMatch(src, /fontFamily|Satoshi|Manrope/, `${rel(f)} names a font`);
  }
});

// ---------------------------------------------------------------- the shipped module graph
const RETIRED = /genii-opal|genii-glass|genii-ribbon|genii-alert|genii-curious|genii-attentive|genii-skeptical|badge-mood|badge-radiant|halo-scene/;
const EXT = ["", ".js", ".jsx", ".mjs", "/index.js", "/index.jsx"];
function resolveImport(from, spec) {
  if (!spec.startsWith(".") && !spec.startsWith("/")) return null;
  const base = spec.startsWith("/") ? path.join(ROOT, spec) : path.resolve(path.dirname(from), spec);
  for (const e of EXT) { const p = base + e; if (fs.existsSync(p) && fs.statSync(p).isFile()) return p; }
  return null;
}
function shippedGraph() {
  const seen = new Set();
  const queue = [path.join(ROOT, "src/main.jsx")];
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f) || !/\.(jsx?|mjs|css)$/.test(f) || f.includes(`${path.sep}research${path.sep}`)) continue;
    seen.add(f);
    const src = fs.readFileSync(f, "utf8");
    const specs = f.endsWith(".css")
      ? [...src.matchAll(/@import url\("([^"]+)"\)/g)].map((m) => m[1])
      : [...src.matchAll(/(?:import|export)\s[^"'`;]*?from\s*["']([^"']+)["']|import\s*["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1] || m[2] || m[3]);
    for (const s of specs) { const r = resolveImport(f, s); if (r) queue.push(r); }
  }
  return [...seen].map(rel);
}
// Pre-rebuild screens that other packages are replacing in this pass. Integration empties this list.
const PENDING = new Set([]);

test("the shipped app never references the retired library Genii renders or badges", (t) => {
  const graph = shippedGraph();
  assert.ok(graph.includes("src/PersonaApp.jsx") && graph.includes("src/persona/screens/Landing.jsx"));
  assert.doesNotMatch(read("index.html"), RETIRED, "index.html");
  const hits = graph.filter((f) => !f.endsWith(".css") && RETIRED.test(read(f)));
  const pending = hits.filter((f) => PENDING.has(f));
  if (pending.length) t.diagnostic(`still pending in other packages: ${pending.join(", ")}`);
  assert.deepEqual(hits.filter((f) => !PENDING.has(f)), []);
  for (const f of graph.filter((g) => g.endsWith(".css") && !legacy.has(g))) assert.doesNotMatch(read(f), RETIRED, f);
  assert.ok(!graph.includes("src/components/AmbientWorld.jsx"), "AmbientWorld is retired");
});

test("package A never draws Genii from the library: screens, system and the app shell", () => {
  const files = [...walk(path.join(ROOT, "src/system")), ...walk(path.join(ROOT, "src/persona/screens")), path.join(ROOT, "src/PersonaApp.jsx"), path.join(ROOT, "src/persona/PersonaDialogs.jsx"), path.join(ROOT, "index.html")]
    .filter((f) => /\.(jsx?|css|html)$/.test(f));
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(src, RETIRED, rel(f));
    assert.doesNotMatch(src, /GeniiStage|AmbientWorld/, `${rel(f)} uses a retired component`);
  }
});

// ---------------------------------------------------------------- fonts
test("fonts: Fraunces and Figtree together at or under 220 KB; Satoshi is aliased, never fetched", () => {
  const css = read("src/system/fonts.css");
  const faces = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((m) => m[1]);
  const brand = faces.filter((f) => /font-family:\s*"(Fraunces|Figtree)"/.test(f));
  assert.equal(brand.length, 3, "Figtree, Fraunces upright, Fraunces italic");
  const files = new Set(brand.flatMap((f) => [...f.matchAll(/url\("([^"]+)"\)/g)].map((m) => path.resolve(ROOT, "src/system", m[1]))));
  const bytes = [...files].reduce((sum, f) => sum + fs.statSync(f).size, 0);
  assert.ok(bytes <= 220 * 1024, `font payload ${bytes} bytes`);
  const satoshi = faces.find((f) => /font-family:\s*Satoshi/.test(f));
  assert.ok(satoshi && /figtree-latin\.woff2/.test(satoshi), "Satoshi resolves to the Figtree file");
  assert.doesNotMatch(read("index.html"), /Satoshi/);
});
