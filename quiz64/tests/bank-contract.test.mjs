import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { QUESTIONS, ROUTE_SLOTS, VERSION, BANK_VERSION, MEASURES } from "../src/data.js";
import { buildRoute } from "../src/engine.js";

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
const specialExitIds = new Set(["skip", "prefer_not", "no_recent_example", "other_unscored", "abstain", "not_enough_experience", "unsafe_to_answer", "capacity_not_comparable"]);

test("v4 bank is the versioned 52-item personality-game packet", () => {
  assert.equal(VERSION, "genii-personality-game-v4");
  assert.equal(BANK_VERSION, "v4-authoring-packet-2026-09-19");
  assert.equal(QUESTIONS.length, 52);
  assert.equal(QUESTIONS.filter((q) => !q.test).length, 44);
  assert.equal(QUESTIONS.filter((q) => q.test).length, 8);
  assert.equal(Object.keys(MEASURES).length, 0);
  assert.equal(ROUTE_SLOTS.length, 52);
  assert.equal(new Set(QUESTIONS.map((q) => q.id)).size, 52);
  assert.deepEqual(ROUTE_SLOTS.flatMap((slot) => slot.candidates).sort(), [...byId.keys()].sort());
});

test("every item preserves packet metadata, exact option receipts, and visible exits", () => {
  for (const question of QUESTIONS) {
    assert.ok(question.id.startsWith("V4-"));
    assert.ok(question.title);
    assert.ok(question.meta?.packetVersion);
    assert.ok(question.meta?.sourceType);
    assert.ok(question.meta?.target);
    assert.ok(question.meta?.timeframe);
    assert.ok(question.meta?.cost);
    assert.ok(question.meta?.claimLimit);
    assert.ok(Array.isArray(question.meta?.notEvidenceFor));
    assert.equal(new Set(question.options.map((option) => option.id)).size, question.options.length);
    for (const option of question.options) {
      assert.equal(option.why, option.text, `${question.id}/${option.id} literal receipt drift`);
      assert.ok(option.neutralMeaning);
      assert.ok(Array.isArray(option.tags));
      for (const tag of option.tags) assert.ok(tag.d && tag.v && tag.target && tag.section);
    }
    assert.ok((question.exits || []).length > 0, `${question.id} missing visible exits`);
    for (const exit of question.exits) {
      assert.ok(specialExitIds.has(exit.id), `${question.id} unsupported exit ${exit.id}`);
      assert.equal(exit.why, exit.text);
      assert.ok(exit.meaning);
    }
  }
});

test("parent-linked followups route only after authored parent answers and invalidate on exit", () => {
  const linked = QUESTIONS.filter((q) => q.dependsOn?.questionId);
  assert.ok(linked.length >= 10);
  const none = buildRoute({});
  for (const question of linked) assert.equal(none.ids.includes(question.id), false, `${question.id} routed without parent`);
  const parentAnswers = Object.fromEntries(linked.map((q) => [q.dependsOn.questionId, byId.get(q.dependsOn.questionId).options[0].id]));
  const full = buildRoute(parentAnswers);
  for (const question of linked) assert.equal(full.ids.includes(question.id), true, `${question.id} not routed after parent`);
  const exitedParents = Object.fromEntries(linked.map((q) => [q.dependsOn.questionId, "prefer_not"]));
  const missing = buildRoute(exitedParents);
  for (const question of linked) assert.equal(missing.ids.includes(question.id), false, `${question.id} routed after parent exit`);
});

test("heldouts are frozen P-only with baselines and excluded from profile route until freeze", () => {
  const heldouts = QUESTIONS.filter((q) => q.test);
  assert.equal(heldouts.length, 8);
  for (const question of heldouts) {
    assert.equal(question.kind, "heldout");
    assert.equal(question.meta.evidence, "heldout");
    assert.ok(question.baseline);
    assert.ok(question.meta.heldoutMetadata?.fixed_baseline?.option_id);
    assert.match(question.meta.claimLimit, /P-only|sealed check/i);
    assert.ok(question.exits.some((exit) => exit.id === "abstain"));
    assert.ok(question.exits.some((exit) => exit.id === "prefer_not"));
  }
});

test("v4 source avoids first-session wellness/routine/clinical collection", () => {
  const files = ["src/data.js", "src/App.jsx", "src/components/EvidenceSummary.jsx", "src/preview-fixtures.js"];
  const banned = /\b(sleep|food|hydration|exercise|fitness|workout|therapy questionnaire|wellness questionnaire|habit tracker|health assessment|routine score)\b/i;
  for (const file of files) {
    const source = fs.readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.equal(banned.test(source), false, `${file} leaks first-session wellness/routine framing`);
  }
});
