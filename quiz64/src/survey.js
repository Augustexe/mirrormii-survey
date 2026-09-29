import { QUESTIONS, CHAPTERS, DIMS, VERSION } from "./data.js";
import {
  facts,
  applicable as isApplicable,
  selected,
  label,
  buildRoute,
  routeQuestions as engineRouteQuestions,
} from "./engine.js";

export const chapterFor = (q) =>
  CHAPTERS.find((c) => c.id === q?.chapter) || CHAPTERS[0];
export { asset } from "./assets.js";
export const questionIndex = (id) => QUESTIONS.findIndex((q) => q.id === id);
export const isResolved = (state, q) =>
  Object.prototype.hasOwnProperty.call(state?.answers || {}, q.id);
export const trainingQuestions = QUESTIONS.filter((q) => !q.test);
export const testQuestions = QUESTIONS.filter((q) => q.test);
export const routeQuestions = (state) => engineRouteQuestions(state);
export const routeQuestionsFor = routeQuestions;
export const trainingQuestionsFor = (state) =>
  routeQuestions(state).filter((q) => !q.test);
export const testQuestionsFor = (state) =>
  routeQuestions(state).filter((q) => q.test);
export const routeIndex = (id, state) =>
  buildRoute(state?.answers || {}).ids.indexOf(id);
export const resolvedTraining = (state) =>
  trainingQuestionsFor(state).filter((q) => isResolved(state, q)).length;
export const resolvedTests = (state) =>
  testQuestionsFor(state).filter((q) => isResolved(state, q)).length;
export const nextOpenIndex = (state, from = 0, includeTests = false) => {
  const route = routeQuestions(state);
  const start = Math.max(0, from);
  const q = route.find(
    (item, index) =>
      index >= start &&
      !isResolved(state, item) &&
      (includeTests || !item.test),
  );
  return q ? route.indexOf(q) : route.length;
};
export const personLabel = (state) => {
  const close = facts(state?.answers || {}).close;
  if (!close || close === "none" || close === "unspecified")
    return "the person you have in mind";
  if (close === "friend") return "your close friend";
  return `your ${close}`;
};
export const interpolate = (value, state) =>
  String(value || "").replaceAll("{close}", personLabel(state));
export const applicable = (q, state) => {
  try {
    return isApplicable(q, state?.answers || {});
  } catch {
    return false;
  }
};
export const questionStatus = (q, state) =>
  !applicable(q, state)
    ? "inapplicable"
    : state?.answers?.[q.id] === "skip"
      ? "skipped"
      : state?.answers?.[q.id] === "no_example"
        ? "no_example"
        : state?.answers?.[q.id] === "other"
          ? "other"
          : isResolved(state, q)
            ? "answered"
            : "open";
export const chapterCount = (state, chapterId) => {
  const qs = routeQuestions(state).filter((q) => q.chapter === chapterId);
  const resolved = qs.filter((q) => isResolved(state, q));
  return {
    resolved: resolved.length,
    answered: resolved.filter(
      (q) => !["skip", "no_example", "other"].includes(state.answers[q.id]),
    ).length,
    skipped: resolved.filter((q) => state.answers?.[q.id] === "skip").length,
    total: qs.length,
  };
};
export const safeTitle = (q, state) => interpolate(q.title, state);
export const optionText = (option, state) =>
  interpolate(option?.text ?? option?.label ?? "", state);
export { QUESTIONS, CHAPTERS, DIMS, VERSION, facts, selected, label };
