import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const visibleText = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/\s+/g, " ");
const banned = /V4-[A-Z\d-]+|source units?|claim.audit|inferred_from_gate|authored_scenario|context_capture|v4-mapping|recorded (?:target|requester|relationship)|Thin evidence|Literal observation|profile_support/;

test("real React question/result/disclosure surfaces render ordinary text and all nine ribbon icons", async () => {
  const server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom" });
  try {
    const { ChapterRibbon } = await server.ssrLoadModule("/src/components/ChapterRibbon.jsx");
    const { QuestionCard } = await server.ssrLoadModule("/src/components/QuestionCard.jsx");
    const { EvidenceSummary } = await server.ssrLoadModule("/src/components/EvidenceSummary.jsx");
    const { makePreviewState } = await server.ssrLoadModule("/src/preview-fixtures.js");
    const { QUESTIONS } = await server.ssrLoadModule("/src/data.js");
    const { fresh, CONTEXT_FIELDS } = await server.ssrLoadModule("/src/engine.js");
    const ribbon = renderToStaticMarkup(React.createElement(ChapterRibbon, { current: 1 }));
    assert.equal((ribbon.match(/class="ribbon-icon"/g) || []).length, 9);
    for (const q of QUESTIONS) {
      const state = fresh();
      const bindings = Object.fromEntries((CONTEXT_FIELDS[q.id] || []).map((field) => [field.key, field.values[0]]));
      const text = visibleText(renderToStaticMarkup(React.createElement(QuestionCard, {
        q, state, draft: q.options[0].id, contextBinding: bindings,
      })));
      assert.ok(text.includes(q.title), q.id);
      for (const option of q.options) assert.ok(text.includes(option.text), `${q.id}/${option.id}`);
      for (const exit of q.exits) assert.ok(text.includes(exit.text), `${q.id}/${exit.id}`);
      assert.doesNotMatch(text, banned, q.id);
    }
    // The decorative character reads visibility once during render; no DOM effects run in SSR.
    globalThis.document = { hidden: false };
    for (const fixture of ["complete", "mixed", "sparse", "skipped"]) {
      const state = makePreviewState(fixture);
      const text = visibleText(renderToStaticMarkup(React.createElement(EvidenceSummary, { state })));
      assert.doesNotMatch(text, banned, fixture);
      assert.ok(text.includes("See the answers behind your result"));
      assert.ok(text.includes("How did the guesses compare?"));
      assert.ok(text.includes("Only share them if you are comfortable"));
      const partial = { ...state, answers: { ...state.answers } };
      delete partial.answers["V4-H08"];
      const partialText = visibleText(renderToStaticMarkup(React.createElement(EvidenceSummary, { state: partial })));
      assert.ok(!partialText.includes("How did the guesses compare?"), "partial checks must stay hidden even if _stats exists");
    }
  } finally {
    delete globalThis.document;
    await server.close();
  }
});

test("App forwards the required context state through QuizView to QuestionCard", () => {
  const app = fs.readFileSync(new URL("../src/App.jsx", import.meta.url), "utf8");
  const caller = app.slice(app.indexOf("<QuizView"), app.indexOf("/>", app.indexOf("<QuizView")));
  assert.match(caller, /contextBinding=\{contextBinding\}/);
  assert.match(caller, /setContextBinding=\{setContextBinding\}/);
  const signature = app.slice(app.indexOf("function QuizView("), app.indexOf(") {", app.indexOf("function QuizView(")));
  assert.match(signature, /contextBinding/);
  assert.match(signature, /setContextBinding/);
});
