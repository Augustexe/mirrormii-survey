import * as Engine from "./engine.js";
import * as Survey from "./survey.js";

export const PREVIEW_FIXTURES = [
  { id: "complete", label: "Complete", detail: "Vivid identity-first portrait with sealed checks" },
  { id: "mixed", label: "Mixed", detail: "Context split, same-event follow-ups, and literal support" },
  { id: "sparse", label: "Sparse", detail: "Visible exits and unknowns preserved" },
  { id: "skipped", label: "Skipped", detail: "Unknown remains a valid result" },
];

const COMPLETE = {
  "V4-001": "B",
  "V4-002": "E",
  "V4-003": ["F"],
  "V4-004": "A",
  "V4-005": "B",
  "V4-006": "A",
  "V4-007": "C",
  "V4-008": "D",
  "V4-009": "B",
  "V4-010": "E",
  "V4-011": "E",
  "V4-012": "A",
  "V4-013": "A",
  "V4-014": "D",
  "V4-017": "D",
  "V4-018": "B",
  "V4-023": "A",
  "V4-024": "A",
  "V4-029": "B",
  "V4-030": "A",
  "V4-031": "B",
  "V4-032": "D",
  "V4-035": "B",
  "V4-036": "B",
  "V4-041": "E",
  "V4-042": "B",
  "V4-043": "C",
  "V4-044": ["A", "E"],
};

const MIXED = {
  ...COMPLETE,
  "V4-001": "A",
  "V4-002": "C",
  "V4-005": "E",
  "V4-006": "E",
  "V4-011": "D",
  "V4-012": "D",
  "V4-023": "C",
  "V4-024": "C",
  "V4-029": "D",
  "V4-030": "C",
  "V4-035": "C",
  "V4-036": "D",
  "V4-041": "D",
  "V4-044": ["A", "C"],
};

const SPARSE_IDS = new Set(["V4-001", "V4-002", "V4-004", "V4-041", "V4-044", "V4-007"]);
const CHECKS = {
  "V4-H01": "C",
  "V4-H02": "A",
  "V4-H03": "D",
  "V4-H04": "A",
  "V4-H05": "B",
  "V4-H06": "B",
  "V4-H07": "C",
  "V4-H08": "B",
};

function firstOption(question) {
  return question.responseFormat === "multi_select" ? [question.options[0]?.id].filter(Boolean) : question.options[0]?.id;
}

function contextMeta(question, value) {
  const fields = Engine.CONTEXT_FIELDS?.[question.id] || [];
  const base = value === "other_unscored" ? { otherText: "custom" } : {};
  if (!fields.length) return base;
  return { ...base, bindings: Object.fromEntries(fields.map((field) => [field.key, field.values[0]])) };
}

function response(question, fixture) {
  if (fixture === "skipped") return question.exits?.some((exit) => exit.id === "skip") ? "skip" : "prefer_not";
  if (fixture === "sparse" && !SPARSE_IDS.has(question.id)) {
    if (question.exits?.some((exit) => exit.id === "no_recent_example")) return "no_recent_example";
    if (question.exits?.some((exit) => exit.id === "prefer_not")) return "prefer_not";
    if (question.exits?.some((exit) => exit.id === "skip")) return "skip";
    return firstOption(question);
  }
  const map = fixture === "mixed" ? MIXED : COMPLETE;
  const value = map[question.id] ?? firstOption(question);
  return value;
}

export function makePreviewState(fixtureId = "complete") {
  const fixture = PREVIEW_FIXTURES.some((item) => item.id === fixtureId) ? fixtureId : "complete";
  const state = Engine.fresh();
  while (true) {
    const question = Engine.routeQuestions(state).find((item) => !item.test && !Object.hasOwn(state.answers, item.id));
    if (!question) break;
    const value = response(question, fixture);
    Engine.setAnswer(state, question.id, value, contextMeta(question, value));
  }
  state.locked = Engine.freeze(state);
  for (const question of Engine.routeQuestions(state).filter((item) => item.test)) {
    const answer = fixture === "skipped" || fixture === "sparse" ? "abstain" : CHECKS[question.id] || question.options[0]?.id;
    Engine.setAnswer(state, question.id, answer);
  }
  state.previewFixture = fixture;
  state.previewSynthetic = true;
  state._stats = Engine.stats(state);
  return state;
}

export function reviewPreviewClaim(state, claim, value) {
  const next = structuredClone(state);
  Engine.reviewClaim(next, claim.id, value);
  next._stats = Engine.stats(next);
  return next;
}

export function exportPreview(state) {
  return {
    preview: { synthetic: true, fixture: state.previewFixture, label: "Developer preview; synthetic data" },
    attempt: Engine.exportAttempt(state),
  };
}

export function reviewRows(state) {
  return Engine.routeQuestions(state).map((question) => {
    const option = Engine.selected(question, state.answers);
    const raw = state.answers[question.id];
    const missingText = {
      skip: "Skipped",
      prefer_not: "Prefer not to answer",
      no_recent_example: "No recent example",
      other_unscored: "Other / depends",
      abstain: "Abstained",
    }[Array.isArray(raw) ? raw[0] : raw] || "No answer";
    const answerText = Array.isArray(option)
      ? option.map((item) => Survey.optionText?.(item, state) || item.text).join(", ")
      : option
        ? Survey.optionText?.(option, state) || option.text
        : missingText;
    return {
      id: question.id,
      title: Survey.safeTitle?.(question, state) || Survey.interpolate?.(question.title, state) || question.title,
      answerText,
      test: Boolean(question.test),
    };
  });
}
