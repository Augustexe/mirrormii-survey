#!/usr/bin/env node
// Docs guard for the locked launch spec (docs/LAUNCH-SPEC.md section 0).
//
// Fails when:
//   1. docs/LAUNCH-SPEC.md names a retired label or asset anywhere outside its Changes log (the last "Changes"
//      section). Retired content lives only in docs/history/, never in the spec.
//   2. Any text file under docs/ or quiz64/docs/, or AGENTS.md or quiz64/README.md, contains an em dash
//      (Jerry's standing rule: no em dashes anywhere).
//
// Run: node scripts/check-docs.mjs   (also run by quiz64/tests/docs-check.test.mjs inside npm test)

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, extname } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SPEC = "docs/LAUNCH-SPEC.md";

// Retired player-facing labels and assets (plain names pass, 2026-09-29; canon world, 2026-09-29).
// Matched case-insensitively on word boundaries.
export const RETIRED = Object.freeze([
  "Slow Burner",
  "Creature of Habit",
  "Easygoer",
  "Wanderer",
  "Orbit",
  "Blueprint",
  "Old School",
  "stained glass",
  "gothic arch",
  "public/assets/world",
]);

const EM_DASH = "—";
const TEXT_EXT = new Set([".md", ".json", ".csv", ".txt", ".mjs", ".js", ".yaml", ".yml", ".html", ".svg"]);
const EM_DASH_DIRS = ["docs", "quiz64/docs"];
const EM_DASH_FILES = ["AGENTS.md", "quiz64/README.md"];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");

// The spec without its Changes log: everything from the last "## ... Changes" heading on is history by design.
export function specBody(text) {
  const heads = [...text.matchAll(/^##\s+(?:\d+\.\s*)?Changes\b.*$/gm)];
  if (!heads.length) return text;
  return text.slice(0, heads[heads.length - 1].index);
}

export function retiredHits(text) {
  const hits = [];
  const lines = specBody(text).split("\n");
  for (const term of RETIRED) {
    const re = new RegExp(`(^|[^A-Za-z])${escape(term)}([^A-Za-z]|$)`, "i");
    lines.forEach((line, i) => {
      if (re.test(line)) hits.push({ term, line: i + 1, text: line.trim().slice(0, 140) });
    });
  }
  return hits;
}

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of entries) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(name).toLowerCase())) out.push(p);
  }
  return out;
}

export function emDashHits(root = ROOT) {
  const files = [
    ...EM_DASH_DIRS.flatMap((d) => walk(join(root, d))),
    ...EM_DASH_FILES.map((f) => join(root, f)),
  ];
  const hits = [];
  for (const f of files) {
    let text;
    try {
      text = readFileSync(f, "utf8");
    } catch {
      continue;
    }
    if (!text.includes(EM_DASH)) continue;
    text.split("\n").forEach((line, i) => {
      if (line.includes(EM_DASH)) hits.push({ file: relative(root, f), line: i + 1, text: line.trim().slice(0, 140) });
    });
  }
  return hits;
}

export function runChecks(root = ROOT) {
  const spec = readFileSync(join(root, SPEC), "utf8");
  return { retired: retiredHits(spec), emDashes: emDashHits(root) };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { retired, emDashes } = runChecks();
  for (const h of retired) console.log(`retired  ${SPEC}:${h.line}  "${h.term}"  ${h.text}`);
  for (const h of emDashes) console.log(`em dash  ${h.file}:${h.line}  ${h.text}`);
  const n = retired.length + emDashes.length;
  console.log(n ? `check-docs: ${n} problem(s)` : "check-docs: ok (no retired labels in the spec body, no em dashes in the docs)");
  process.exit(n ? 1 : 0);
}
