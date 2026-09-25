import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { QUESTIONS, ROUTE_SLOTS } from "../src/data.js";
import { ITEM_COPY, WORDING_VERSION, CHAPTER_COPY, CONTEXT_VALUE_LABELS, CONTEXT_FIELD_LABELS } from "../src/respondent-copy.js";
import { HOST_REACTIONS } from "../src/host-reactions.js";
import { receiptLimit, receiptExplanation, receiptMeta, receiptContext } from "../src/result-language.js";
import {
  fresh, setAnswer, routeQuestions, observations, portrait, freeze, restore, exportAttempt,
  stats, CONTEXT_FIELDS, HELDOUT_TRANSFER_RULES,
} from "../src/engine.js";

const baseline = JSON.parse(fs.readFileSync(new URL("./fixtures/v4-semantics-533c3da.json", import.meta.url), "utf8"));
const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
const banned = /V4-[A-Z\d-]+|context_capture|source units?|claim.audit|inferred_from_gate|authored_scenario|recorded (?:target|requester|relationship)|motive\/value|status cost|cost (?:high|medium)|P-only|pre-freeze source|literal (?:field|operating|receipt)|glitter.pen|room.temperature control/i;
const assertPlain = (text, name) => assert.doesNotMatch(text, banned, name);
const metadata = ({ title, setup, wordingVersion, options, exits, ...q }) => ({
  ...q,
  options: options.map(({ text, why, ...option }) => option),
  exits: exits.map(({ text, why, ...exit }) => exit),
});
const context = (id) => ({ bindings: Object.fromEntries((CONTEXT_FIELDS[id] || []).map((field) => [field.key, field.values[0]])) });
function choose(state, q, value) {
  const parentId = q.dependsOn?.questionId || ({ "V4-010": "V4-005", "V4-016": "V4-011", "V4-022": "V4-021" })[q.id];
  if (parentId && !state.answers[parentId]) {
    const parent = byId.get(parentId);
    choose(state, parent, parent.options[0].id);
  }
  setAnswer(state, q.id, value, { ...context(q.id), ...(value === "other_unscored" ? { otherText: "My own answer" } : {}) });
}
function completeTraining(choices = {}, seed = null) {
  const state = fresh();
  let random = seed;
  while (true) {
    const q = routeQuestions(state).find((item) => !item.test && !Object.hasOwn(state.answers, item.id));
    if (!q) break;
    if (random !== null) random = (random * 1664525 + 1013904223) >>> 0;
    const value = choices[q.id] ?? (q.id === "V4-003" ? ["F"] : q.options[random === null ? 0 : random % q.options.length].id);
    choose(state, q, value);
  }
  state.locked = freeze(state);
  return state;
}

// Semantic parity is exhaustive, not a handful of spot-checked tags. Only display wording changes.
test("all 52 rewritten items retain every non-copy field from 533c3da", () => {
  assert.equal(Object.keys(ITEM_COPY).length, 52);
  assert.equal(CHAPTER_COPY.length, 9);
  assert.deepEqual(QUESTIONS.map(metadata), baseline.questions.map(metadata));
  assert.deepEqual(ROUTE_SLOTS, baseline.routeSlots);
  assert.deepEqual(CONTEXT_FIELDS, baseline.contextFields);
  assert.deepEqual(HELDOUT_TRANSFER_RULES, baseline.transferRules);
  for (const q of QUESTIONS) {
    assert.equal(q.wordingVersion, WORDING_VERSION);
    assert.equal(q.title, ITEM_COPY[q.id].title);
    assert.equal(q.setup, ITEM_COPY[q.id].setup);
    assert.deepEqual(q.options.map((option) => option.text), ITEM_COPY[q.id].options);
    assertPlain([q.title, q.setup, ...q.options.map((o) => o.text), ...q.exits.map((o) => o.text)].join("\n"), q.id);
  }
});

test("every rewritten profile option produces its exact question, answer and unchanged interpretation metadata", () => {
  for (const q of QUESTIONS.filter((q) => !q.test)) {
    for (const option of q.options) {
      const state = fresh();
      choose(state, q, option.id);
      const rows = observations(state).filter((row) => row.questionId === q.id);
      assert.equal(rows.length, option.tags.length, `${q.id}/${option.id}`);
      rows.forEach((row, index) => {
        assert.equal(row.questionTitle, q.title);
        assert.equal(row.answer, option.text);
        assert.equal(row.why, option.text);
        assert.equal(row.optionId, option.id);
        assert.equal(row.wordingVersion, WORDING_VERSION);
        assert.equal(row.d, option.tags[index].d);
        assert.equal(row.v, option.tags[index].v);
        assert.equal(row.role, q.meta.evidence);
        assert.equal(row.linkedEventId, q.meta.linkedEventId);
        assert.equal(row.window, q.meta.window);
        assert.deepEqual(row.unsupportedInferences, q.meta.notEvidenceFor);
        assert.equal(row.claimLimit, option.claimLimit || q.meta.claimLimit);
        assertPlain([receiptLimit(row), receiptExplanation(row), receiptMeta(row), receiptContext(row)].join(" "), `${q.id}/${option.id} disclosure`);
      });
      const receipts = portrait(state).receipts.filter((row) => row.questionId === q.id);
      for (const receipt of receipts) {
        assert.equal(receipt.optionText, option.text);
        assert.equal(receipt.questionText, q.title);
        assert.equal(receipt.wordingVersion, WORDING_VERSION);
      }
    }
    for (const exit of q.exits) {
      const state = fresh();
      choose(state, q, exit.id);
      const row = observations(state).find((row) => row.questionId === q.id);
      assert.equal(row.kind, "missingness");
      assert.equal(row.missingness, exit.id);
      assert.equal(row.answer, exit.text);
      assert.equal(portrait(state).receipts.some((row) => row.questionId === q.id), false);
    }
  }
});

test("every check option retains a literal evaluation receipt and never enters portrait evidence", () => {
  const frozen = completeTraining();
  const original = portrait(frozen);
  for (const q of QUESTIONS.filter((q) => q.test)) {
    for (const option of [...q.options, ...q.exits]) {
      const state = structuredClone(frozen);
      choose(state, q, option.id);
      const trial = stats(state).trials.find((row) => row.question === q.id);
      assert.equal(trial.questionText, q.title);
      assert.equal(trial.answerText, option.text);
      assert.equal(trial.wordingVersion, WORDING_VERSION);
      assert.deepEqual(portrait(state), original);
      assert.equal(observations(state).some((row) => row.questionId === q.id), false);
    }
  }
});

test("new wording cannot silently relabel old saved answers or frozen snapshots", () => {
  const state = completeTraining();
  assert.equal(restore(state).wordingVersion, WORDING_VERSION);
  const old = structuredClone(state);
  delete old.wordingVersion;
  assert.deepEqual(restore(old), fresh());
  const mixedVersion = structuredClone(state);
  mixedVersion.locked.copyVersion = "v4-copy-2026-09-19";
  mixedVersion.answers["V4-H01"] = "A";
  assert.equal(restore(mixedVersion).locked, null);
  assert.equal(restore(mixedVersion).answers["V4-H01"], undefined);
  const exported = exportAttempt(state);
  assert.equal(exported.copyVersion, WORDING_VERSION);
  assert.ok(exported.evidenceReceipts.every((row) => row.wordingVersion === WORDING_VERSION));
});

test("export before freezing preserves context alongside the literal answer", () => {
  for (const id of Object.keys(CONTEXT_FIELDS)) {
    const state = fresh();
    choose(state, byId.get(id), "A");
    const row = exportAttempt(state).evidenceReceipts.find((receipt) => receipt.questionId === id);
    assert.deepEqual(row.context, state.bindings[id]);
    assert.equal(row.optionText, byId.get(id).options[0].text);
  }
});

test("result examples remain grammatical, bounded and linked across 120 deterministic answer sets", () => {
  for (let seed = 1; seed <= 120; seed++) {
    const state = completeTraining({}, seed);
    const result = portrait(state);
    const text = [result.titleLead, result.titleEmphasis, result.summary, result.thesis, result.cta,
      ...result.sections.flatMap((section) => [section.title, section.text, section.limit]),
      ...result.claims.flatMap((claim) => [claim.scope, claim.nextValidation, ...claim.alternativeExplanations]),
      ...result.unknowns, ...result.shareCards.flatMap((card) => [card.title, card.line]),
    ].join("\n");
    assertPlain(text, `seed ${seed}`);
    assert.doesNotMatch(text, /undefined|null|\[object Object\]|\.\s*\.”|your default|you tend to/i);
    assert.equal(result.auditPassed, true, `seed ${seed}: ${JSON.stringify(result.clauseAudit.filter((clause) => clause.verdict === "block"))}`);
    const receipts = new Map(result.receipts.map((row) => [row.evidenceId, row]));
    for (const id of result.thesisEvidenceIds) {
      assert.ok(result.thesis.includes(receipts.get(id).optionText), `${seed}: thesis source mismatch`);
    }
    for (const section of result.sections.filter((section) => section.key !== "dark_side")) {
      assert.ok(section.observations.some((row) => section.text.includes(row.answer)));
      assert.ok(section.evidenceIds.every((id) => receipts.has(id)));
    }
  }
});

test("thesis never borrows an unrelated event's motive and support does not substitute a result goal", () => {
  const state = fresh();
  choose(state, byId.get("V4-005"), "B");
  choose(state, byId.get("V4-013"), "C");
  choose(state, byId.get("V4-014"), "B");
  choose(state, byId.get("V4-001"), "A");
  choose(state, byId.get("V4-043"), "D");
  const result = portrait(state);
  assert.doesNotMatch(result.thesis, /Their understanding of what I meant/);
  assert.match(result.thesis, /do not have a reason/);
  const support = result.sections.find((section) => section.key === "support");
  assert.match(support.text, /Draft what I could say/);
  assert.doesNotMatch(support.text, /funny but fair roast/);
});

test("all context selectors and selective reactions have ordinary labels without new evidence", () => {
  for (const fields of Object.values(CONTEXT_FIELDS)) for (const field of fields) {
    assert.ok(CONTEXT_FIELD_LABELS[field.key]);
    for (const value of field.values) assert.ok(CONTEXT_VALUE_LABELS[value], value);
  }
  for (const [id, reactions] of Object.entries(HOST_REACTIONS)) for (const [option, text] of Object.entries(reactions)) {
    assert.ok(byId.get(id).options.some((o) => o.id === option));
    assertPlain(text, `${id}/${option}`);
  }
  assert.doesNotMatch(HOST_REACTIONS["V4-035"].A, /story potential/i);
  assert.doesNotMatch(HOST_REACTIONS["V4-044"].E, /advice|receipts/i);
});

test("gentle and hands-off preferences keep the roast or further prompting out", () => {
  const gentle = completeTraining({ "V4-002": "A", "V4-008": "D" });
  assert.ok(!portrait(gentle).sections.some((section) => section.key === "dark_side"));
  for (const id of ["V4-041", "V4-043"]) {
    const state = completeTraining({ [id]: "F", "V4-008": "D" });
    const result = portrait(state);
    assert.ok(!result.sections.some((section) => section.key === "dark_side"));
    assert.match(result.cta, /do not need to do anything next/);
  }
});
