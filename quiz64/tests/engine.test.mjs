import test from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, VERSION } from "../src/data.js";
import {
  KEY,
  fresh,
  selected,
  facts,
  buildRoute,
  routeQuestions,
  observations,
  profile,
  freeze,
  portrait,
  stats,
  setAnswer,
  restore,
  exportAttempt,
  reviewClaim,
  predict,
  CONTEXT_FIELDS,
  contextValueAvailable,
  optionAvailable,
  HELDOUT_TRANSFER_RULES,
  auditRenderedClausesForTest,
} from "../src/engine.js";

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));

function firstValue(question) {
  return question.responseFormat === "multi_select" ? [question.options[0].id] : question.options[0].id;
}

function contextMeta(id, overrides = {}) {
  const fields = CONTEXT_FIELDS?.[id] || [];
  if (!fields.length) return overrides;
  return { ...overrides, bindings: Object.fromEntries(fields.map((field) => [field.key, field.values[0]])) };
}

function fillTraining(state, choices = {}) {
  while (true) {
    const question = routeQuestions(state).find((item) => !item.test && !Object.hasOwn(state.answers, item.id));
    if (!question) break;
    const desired = Object.hasOwn(choices, question.id) ? choices[question.id] : firstValue(question);
    setAnswer(state, question.id, desired, contextMeta(question.id, desired === "other_unscored" ? { otherText: "custom" } : {}));
  }
  return state;
}

function frozen(choices = {}) {
  const state = fillTraining(fresh(), choices);
  state.locked = freeze(state);
  return state;
}

function answerAllChecks(state, value = "abstain") {
  for (const question of routeQuestions(state).filter((q) => q.test)) {
    if (!Object.hasOwn(state.answers, question.id)) setAnswer(state, question.id, value);
  }
  return state;
}

test("new storage/version boundary fails closed from v3 attempts", () => {
  assert.equal(VERSION, "genii-personality-game-v4");
  assert.equal(KEY, "genii.personality-game.v4.astra.v1");
  assert.deepEqual(restore({ version: "genii-switch-modes.v3", answers: {} }), fresh());
});

test("literal frame and support fields are locked as facts, not trait claims", () => {
  const state = fresh();
  setAnswer(state, "V4-001", "A");
  setAnswer(state, "V4-002", "E");
  setAnswer(state, "V4-003", ["A", "D"]);
  setAnswer(state, "V4-004", "C");
  setAnswer(state, "V4-041", "D");
  setAnswer(state, "V4-042", "B");
  setAnswer(state, "V4-043", "C");
  setAnswer(state, "V4-044", ["A", "E"]);
  assert.deepEqual(facts(state.answers), {
    resultStyle: "playful_roast",
    toneBoundary: "receipts_first",
    topicBoundaries: ["dating", "work_school"],
    finishValue: "prediction_game",
    supportPreferences: ["permission_first", "one_later", "recommendation", "explicit_no_once", "public_embarrassment"],
  });
  const result = portrait(state);
  assert.ok(result.literalSupportFields.length >= 4);
  assert.ok(result.sections.find((section) => section.key === "support"));
  assert.equal(result.clauseAudit.every((clause) => clause.verdict === "pass"), true);
});

test("visible exits remain unscored and distinct", () => {
  const state = fresh();
  setAnswer(state, "V4-001", "skip");
  assert.equal(selected(byId.get("V4-001"), state.answers), undefined);
  assert.equal(observations(state.answers).find((row) => row.questionId === "V4-001").missingness, "skip");

  setAnswer(state, "V4-005", "other_unscored", { otherText: "depends on who was there" });
  assert.equal(state.other["V4-005"], "depends on who was there");
  assert.equal(observations(state.answers).find((row) => row.questionId === "V4-005").missingness, "other_unscored");

  const actual = fresh();
  setAnswer(actual, "V4-009", "no_recent_example");
  const row = observations(actual.answers).find((item) => item.questionId === "V4-009");
  assert.equal(row.missingness, "no_recent_example");
  assert.equal(evidence(actual.answers).length, 0);
});

test("changing a parent answer removes its linked followup and clears its data", () => {
  const state = fresh();
  setAnswer(state, "V4-005", "B");
  assert.equal(buildRoute(state.answers).ids.includes("V4-006"), true);
  setAnswer(state, "V4-006", "A");
  setAnswer(state, "V4-005", "prefer_not");
  assert.equal(buildRoute(state.answers).ids.includes("V4-006"), false);
  assert.equal(state.answers["V4-006"], undefined);
});

test("freeze excludes heldouts and preserves pre-check profile when checks are answered", () => {
  const state = frozen({
    "V4-005": "B",
    "V4-006": "A",
    "V4-011": "E",
    "V4-012": "A",
    "V4-041": "E",
    "V4-044": ["A"],
  });
  assert.equal(state.locked.predictions.length, 8);
  assert.equal(state.locked.observations.some((row) => row.questionId.startsWith("V4-H")), false);
  const before = JSON.stringify(state.locked);
  setAnswer(state, "V4-H01", "C");
  assert.equal(JSON.stringify(state.locked), before);
  assert.equal(observations(state.answers).some((row) => row.questionId.startsWith("V4-H")), false);
});

test("portrait is identity-first, sectioned, audited, and source-faithful", () => {
  const state = frozen({
    "V4-001": "B",
    "V4-002": "E",
    "V4-004": "A",
    "V4-005": "B",
    "V4-006": "A",
    "V4-011": "E",
    "V4-012": "A",
    "V4-013": "A",
    "V4-014": "D",
    "V4-023": "A",
    "V4-024": "A",
    "V4-029": "B",
    "V4-030": "A",
    "V4-041": "E",
    "V4-044": ["A", "E"],
  });
  const result = portrait(state);
  assert.ok(["Sharp Glimpse", "Velvet Clipboard", "Composed Firecracker", "Boundary Bouncer", "Choice Lawyer"].includes(result.publicName));
  assert.doesNotMatch(result.thesis, /fake personality type/);
  assert.match(result.thesis, /response might change with the situation/i);
  for (const key of ["action", "emotion", "value", "support"]) {
    assert.ok(result.sections.some((section) => section.key === key), `missing ${key}`);
  }
  assert.ok(result.sections.every((section) => !/\b\d+ scenes (says|repeat|gives|records)\b/.test(section.text)), "section grammar regressed");
  assert.doesNotMatch(
    [result.thesis, ...result.sections.map((section) => section.text)].join(" "),
    /V4-[A-Z0-9-]+/,
    "internal item ids leaked into respondent-facing copy",
  );
  assert.equal(result.auditPassed, true);
  assert.ok(result.receipts.every((receipt) => receipt.questionId && receipt.optionId && receipt.timeframe && receipt.cost));
  assert.ok(result.claims.every((claim) => claim.evidenceIds.length && claim.observations.every((row) => row.answer && row.questionId)));
});

test("archetype gates exclude literal frame/support rows and require independent substantive units", () => {
  const supportOnly = fresh();
  setAnswer(supportOnly, "V4-001", "B");
  setAnswer(supportOnly, "V4-002", "E");
  setAnswer(supportOnly, "V4-003", ["F"]);
  setAnswer(supportOnly, "V4-004", "A");
  setAnswer(supportOnly, "V4-041", "E");
  setAnswer(supportOnly, "V4-042", "B");
  setAnswer(supportOnly, "V4-043", "C");
  setAnswer(supportOnly, "V4-044", ["A", "E"]);
  const literalResult = portrait(supportOnly);
  assert.equal(literalResult.publicName, "Still Mysterious");
  assert.equal(literalResult.strength, "Unknown");
  assert.ok(literalResult.sections.some((section) => section.key === "support"));
  assert.equal(literalResult.sections.some((section) => section.key === "pattern"), false);

  const sameModule = fresh();
  setAnswer(sameModule, "V4-005", "B");
  setAnswer(sameModule, "V4-006", "A");
  setAnswer(sameModule, "V4-009", "B");
  const thinResult = portrait(sameModule);
  assert.equal(thinResult.publicName, "Sharp Glimpse");
  assert.notEqual(thinResult.publicName, "Velvet Clipboard");
});

test("authored item-option gates can earn distinct named archetypes", () => {
  const cases = [
    ["Velvet Clipboard", [["V4-005", "B"], ["V4-006", "A"], ["V4-009", "B"], ["V4-029", "B"], ["V4-030", "A"], ["V4-031", "B"], ["V4-032", "D"]]],
    ["Composed Firecracker", [["V4-011", "E"], ["V4-012", "A"], ["V4-015", "B"], ["V4-038", "E"]]],
    ["Boundary Bouncer", [["V4-027", "C"], ["V4-029", "D"], ["V4-030", "C"], ["V4-031", "D"], ["V4-032", "D"], ["V4-033", "E"]]],
    ["Quiet Cartographer", [["V4-017", "D"], ["V4-018", "D"], ["V4-019", "D"], ["V4-020", "E"], ["V4-021", "C"], ["V4-022", "E"], ["V4-033", "E"]]],
    ["Spotlight Strategist", [["V4-005", "B"], ["V4-008", "D"], ["V4-010", "E"], ["V4-026", "A"], ["V4-039", "D"], ["V4-040", "A"]]],
  ];
  for (const [expected, entries] of cases) {
    const state = fresh();
    for (const [id, value] of entries) setAnswer(state, id, value, contextMeta(id));
    const result = portrait(state);
    assert.equal(result.publicName, expected);
    assert.ok(["Signature", "Split-mode", "Shape"].includes(result.strength));
  }
});

test("sections use semantically correct sources and dark-side roast is evidence-bounded", () => {
  const desireAction = fresh();
  setAnswer(desireAction, "V4-035", "B");
  setAnswer(desireAction, "V4-036", "B");
  const desireResult = portrait(desireAction);
  assert.equal(desireResult.sections.some((section) => section.key === "desire"), false, "temptation action must not become Desire");
  assert.equal(desireResult.sections.some((section) => section.key === "fear"), false, "fear stays unknown without direct fear evidence");
  assert.ok(desireResult.unknowns.some((line) => line.includes("not asked directly about your fears")));

  const roast = fresh();
  setAnswer(roast, "V4-008", "D");
  const roastResult = portrait(roast);
  const dark = roastResult.sections.find((section) => section.key === "dark_side");
  assert.ok(dark);
  assert.match(dark.text, /wait to see whether it happens again/);
  assert.equal(dark.evidenceIds.length, 1);

  const noRoast = fresh();
  setAnswer(noRoast, "V4-005", "B");
  assert.equal(portrait(noRoast).sections.some((section) => section.key === "dark_side"), false);
});

test("default result layer avoids debug language and share cards are backed", () => {
  const state = frozen({
    "V4-001": "B",
    "V4-002": "C",
    "V4-005": "B",
    "V4-006": "A",
    "V4-011": "E",
    "V4-012": "A",
    "V4-023": "A",
    "V4-024": "A",
    "V4-029": "B",
    "V4-030": "A",
    "V4-041": "E",
  });
  const result = portrait(state);
  const defaultText = [result.summary, result.thesis, ...result.sections.map((section) => section.text), ...result.shareCards.map((card) => `${card.title} ${card.line}`)].join("\n");
  assert.doesNotMatch(defaultText, /selected motive\/value rows|does not prove|identity-first read|provisional character portrait|exact answer receipts|generic placeholder/i);
  assert.ok(result.shareCards.length >= 2 && result.shareCards.length <= 3);
  const receiptIds = new Set(result.receipts.map((receipt) => receipt.evidenceId));
  const literalIds = new Set(result.literalSupportFields.map((field) => `${VERSION}:${field.questionId}:${field.optionId}:0`));
  for (const card of result.shareCards) {
    if (card.source === "low_evidence_exit") continue;
    assert.ok(card.evidenceIds.length > 0, `${card.title} has no backing`);
    assert.ok(card.evidenceIds.every((id) => receiptIds.has(id) || literalIds.has(id)), `${card.title} cites missing evidence`);
  }
});

test("sparse fallback does not invent hidden labels or motives", () => {
  const state = fresh();
  while (true) {
    const question = routeQuestions(state).find((q) => !q.test && !Object.hasOwn(state.answers, q.id));
    if (!question) break;
    const value = question.exits?.find((exit) => exit.id === "prefer_not")?.id || question.exits?.find((exit) => exit.id === "skip")?.id || firstValue(question);
    setAnswer(state, question.id, value);
  }
  state.locked = freeze(state);
  answerAllChecks(state, "abstain");
  const result = portrait(state);
  assert.equal(result.claims.length, 0);
  assert.match(result.summary, /glint|mysterious/i);
  assert.ok(result.unknowns.length > 0);
  assert.ok(result.unknowns.length <= 5);
  assert.equal(result.auditPassed, true);
  assert.equal(stats(state).predicted, 0);
});

test("claim feedback is immutable correction metadata and cannot rewrite portrait", () => {
  const state = frozen({ "V4-005": "B", "V4-006": "A", "V4-041": "E" });
  const claim = portrait(state).claims[0];
  const beforePortrait = JSON.stringify(portrait(state));
  const beforeLocked = JSON.stringify(state.locked);
  reviewClaim(state, claim.id, false, "Depends on the room");
  assert.equal(JSON.stringify(portrait({ ...state, feedback: [] })), beforePortrait);
  assert.equal(JSON.stringify(state.locked), beforeLocked);
  assert.equal(state.feedback[0].endorsement, false);
  assert.equal(state.feedback[0].claimTextSnapshot, claim.text);
  assert.deepEqual(state.feedback[0].evidenceIdsSnapshot, claim.evidenceIds);
});

test("private export keeps exact provenance and separates heldout panel", () => {
  const state = frozen({ "V4-001": "A", "V4-002": "C", "V4-005": "B", "V4-006": "A" });
  const partial = exportAttempt(state);
  assert.equal(partial.provenance.routeSlots, 52);
  assert.equal(partial.provenance.trainingQuestions, 44);
  assert.equal(partial.provenance.heldoutQuestions, 8);
  assert.equal(partial.heldoutsResolved, false);
  assert.equal(partial.predictions[0].status, "hidden until all sealed checks are resolved");
  answerAllChecks(state, "abstain");
  const full = exportAttempt(state);
  assert.equal(full.heldoutsResolved, true);
  assert.equal(full.evaluation.eligible, 8);
  assert.equal(full.evaluation.abstained, 8);
  assert.equal(full.portrait.heldoutStats.trials.length, 8);
  assert.equal(partial.portrait.heldoutStats, null);
});

test("restore validates v4 frozen snapshots and drops forged feedback", () => {
  const state = frozen({ "V4-005": "B", "V4-006": "A" });
  const restored = restore(JSON.parse(JSON.stringify(state)));
  assert.equal(restored.locked.signature, state.locked.signature);
  const raw = JSON.parse(JSON.stringify(state));
  raw.feedback = [{ claimId: "claim:action", value: true, resultId: "portrait:forged" }];
  const cleaned = restore(raw);
  assert.equal(cleaned.feedback.length, 0);
});

test("profile counts linked event source units rather than followup tags as independent support", () => {
  const groups = profile({ "V4-005": "B", "V4-006": "A" });
  for (const group of groups) assert.equal(group.n, 1);
});

test("heldout transfer rules use explicit existing source pairs, never bare option letters", () => {
  for (const [heldoutId, rule] of Object.entries(HELDOUT_TRANSFER_RULES)) {
    assert.ok(byId.get(heldoutId)?.test, `${heldoutId} is not a heldout question`);
    for (const [heldoutOption, pairs] of Object.entries(rule.optionMap || {})) {
      assert.ok(byId.get(heldoutId).options.some((option) => option.id === heldoutOption), `${heldoutId}:${heldoutOption} missing heldout option`);
      assert.ok(Array.isArray(pairs), `${heldoutId}:${heldoutOption} must declare an explicit pair array; an empty array means the option is deliberately not predictable from training evidence`);
      for (const pair of pairs) {
        assert.equal(typeof pair, "object", `${heldoutId}:${heldoutOption} uses a bare mapping`);
        assert.match(pair.questionId, /^V4-\d{3}$/);
        assert.match(pair.optionId, /^[A-Z]$/);
        const sourceQuestion = byId.get(pair.questionId);
        assert.ok(sourceQuestion && !sourceQuestion.test, `${heldoutId}:${heldoutOption} unknown source ${pair.questionId}`);
        assert.ok(sourceQuestion.options.some((option) => option.id === pair.optionId), `${heldoutId}:${heldoutOption} missing source ${pair.questionId}:${pair.optionId}`);
      }
    }
  }
});

test("predict only uses pre-freeze evidence and abstains on ties", () => {
  const thin = predict(byId.get("V4-H01"), { "V4-001": "A" });
  assert.equal(thin.option, null);
  assert.match(thin.reason, /not enough relevant earlier answers/);
  const tied = predict(byId.get("V4-H06"), { "V4-035": "B", "V4-036": "A" });
  assert.equal(tied.option, null);
  assert.match(tied.reason, /tied/i);
});

test("dense fixtures produce frozen transfer predictions while sparse fixtures can abstain", () => {
  const dense = frozen({
    "V4-005": "B",
    "V4-006": "A",
    "V4-008": "D",
    "V4-010": "E",
    "V4-011": "E",
    "V4-013": "A",
    "V4-017": "D",
    "V4-019": "D",
    "V4-021": "C",
    "V4-023": "A",
    "V4-024": "A",
    "V4-027": "C",
    "V4-028": "B",
    "V4-029": "B",
    "V4-031": "B",
    "V4-032": "D",
    "V4-035": "B",
    "V4-037": "A",
    "V4-041": "E",
    "V4-042": "B",
    "V4-043": "C",
    "V4-044": ["A"],
  });
  assert.ok(dense.locked.predictions.filter((item) => item.option).length >= 4);
  assert.ok(dense.locked.predictions.every((item) => item.baseline));
  const sparse = fresh();
  while (true) {
    const question = routeQuestions(sparse).find((q) => !q.test && !Object.hasOwn(sparse.answers, q.id));
    if (!question) break;
    const value = question.exits?.find((exit) => exit.id === "prefer_not")?.id || question.exits?.find((exit) => exit.id === "skip")?.id || firstValue(question);
    setAnswer(sparse, question.id, value, contextMeta(question.id));
  }
  sparse.locked = freeze(sparse);
  assert.equal(sparse.locked.predictions.filter((item) => item.option).length, 0);
});

test("required context capture validates, stores, freezes, restores, and receipts actual values", () => {
  const state = fresh();
  assert.throws(() => setAnswer(state, "V4-021", "A"), /Context fields required/);
  const missingAtFreeze = fillTraining(fresh(), { "V4-021": "A" });
  delete missingAtFreeze.bindings["V4-021"];
  assert.throws(() => freeze(missingAtFreeze), /Missing context binding/);
  const exitState = fresh();
  setAnswer(exitState, "V4-021", "skip");
  assert.equal(exitState.answers["V4-021"], "skip");
  assert.equal(exitState.bindings["V4-021"], undefined);
  const binding = {
    relationship_object: "newer_person",
    safety_power_status: "safe_equal",
    counterparty_reliability: "mixed",
    experience_route: "recent_example",
  };
  setAnswer(state, "V4-021", "A", { bindings: binding });
  assert.deepEqual(state.bindings["V4-021"], binding);
  fillTraining(state);
  state.bindings["V4-021"] = binding;
  state.locked = freeze(state);
  assert.deepEqual(state.locked.bindings["V4-021"], binding);
  const row = state.locked.evidenceReceipts.find((item) => item.questionId === "V4-021");
  assert.equal(row.context.relationship_object, "newer_person");
  assert.match(row.literalObservation, /Who is this with\?: newer person/);
  const restored = restore(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored.bindings["V4-021"], binding);
});

test("matched contrasts and parent-bound followups are invalidated by parent exits", () => {
  for (const [contrast, parent] of Object.entries({
    "V4-010": "V4-005",
    "V4-016": "V4-011",
    "V4-022": "V4-021",
    "V4-028": "V4-027",
    "V4-032": "V4-031",
    "V4-040": "V4-039",
  })) {
    const state = fresh();
    setAnswer(state, parent, "prefer_not");
    assert.equal(buildRoute(state.answers).ids.includes(contrast), false, `${contrast} routed after ${parent} exit`);
  }
});

test("V4-003 work/school boundary omits authority route and records omissions", () => {
  const state = fresh();
  setAnswer(state, "V4-003", ["D"]);
  const route = buildRoute(state.answers);
  for (const id of ["V4-016", "V4-023", "V4-027", "V4-028"]) {
    assert.equal(route.ids.includes(id), false);
    assert.ok(route.omitted.some((item) => item.questionId === id && item.reason === "omitted_by_boundary_work_school"));
  }
});

test("dating and family boundaries remove target choices and invalidate stale answers", () => {
  const state = fresh();
  setAnswer(state, "V4-019", "A");
  setAnswer(state, "V4-020", "B");
  setAnswer(state, "V4-003", ["A", "B"]);
  assert.equal(Object.hasOwn(state.answers, "V4-020"), false);
  assert.equal(optionAvailable("V4-020", "B", state), false);
  assert.equal(optionAvailable("V4-020", "C", state), false);
  assert.equal(optionAvailable("V4-020", "A", state), true);
  assert.equal(contextValueAvailable("V4-021", "relationship_object", "partner_or_date", state), false);
  assert.equal(contextValueAvailable("V4-021", "relationship_object", "family", state), false);
  assert.throws(() => setAnswer(state, "V4-020", "B"), /topic boundary/);
  assert.throws(
    () => setAnswer(state, "V4-021", "A", {
      bindings: {
        relationship_object: "partner_or_date",
        safety_power_status: "safe_equal",
        counterparty_reliability: "usually_reliable",
        experience_route: "recent_example",
      },
    }),
    /topic boundary/,
  );
});

test("V4-018 appraisal stays outside emotion rendering", () => {
  const state = fresh();
  setAnswer(state, "V4-017", "A");
  setAnswer(state, "V4-018", "D");
  const rows = observations(state).filter((row) => row.questionId === "V4-018");
  assert.ok(rows.every((row) => row.d === "interpretation_appraisal" && row.section === "appraisal"));
  assert.equal(portrait(state).sections.some((section) => section.key === "emotion"), false);
});

test("clause audit blocks unsupported emotion or literal/source swaps", () => {
  const base = frozen({ "V4-005": "B", "V4-006": "A" });
  const result = portrait(base);
  const receipt = result.receipts.find((row) => row.questionId === "V4-005");
  const fake = {
    ...result,
    receipts: [receipt],
    sections: [{ id: "section:action", key: "action", text: "You felt afraid because your hidden motive is rejection.", evidenceIds: [receipt.evidenceId] }],
    unknowns: [],
  };
  const audit = auditRenderedClausesForTest(fake);
  assert.ok(audit.some((item) => item.verdict === "block"));
});

function evidence(answers) {
  return observations(answers).filter((row) => row.kind === "evidence");
}
