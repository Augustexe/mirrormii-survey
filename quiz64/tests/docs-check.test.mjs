// The locked spec stays clean (docs/LAUNCH-SPEC.md section 0): no retired label or asset outside its Changes log, and
// no em dash anywhere in the docs. Runs scripts/check-docs.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { runChecks, retiredHits, specBody } from "../../scripts/check-docs.mjs";

test("docs check passes (node scripts/check-docs.mjs)", () => {
  const { retired, emDashes } = runChecks();
  assert.deepEqual(retired.map((h) => `LAUNCH-SPEC.md:${h.line} ${h.term}`), []);
  assert.deepEqual(emDashes.map((h) => `${h.file}:${h.line}`), []);
});

test("the check catches a retired label in the spec body but not in the Changes log", () => {
  const body = "# Spec\n\n## 6. Names\n\nThe Quiet Achiever\n";
  const log = "## 11. Changes\n\n- 2026-09-29: The Slow Burner became The Quiet Achiever; Orbit retired.\n";
  assert.equal(retiredHits(body + log).length, 0);
  assert.ok(!specBody(body + log).includes("Slow Burner"));
  const leaked = retiredHits("## 7. Visual\n\nThe gothic arch frames the Wanderer.\n" + log);
  assert.deepEqual(leaked.map((h) => h.term).sort(), ["Wanderer", "gothic arch"]);
});
