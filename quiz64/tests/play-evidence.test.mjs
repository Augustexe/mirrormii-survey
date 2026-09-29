// Evidence untouched (DESIGN-DIRECTION 7.4 B8), model level. The new card builds every onAnswer value with
// src/persona/play/answer-model.js; this drives random tap sequences over every card in the bank through a transcript
// of the previous card's tap rules and through the model, and requires identical values.
// The browser-level twin (tests/visual/play-evidence.mjs) clicks the real legacy and new components side by side.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "silent" });
  globalThis.document = globalThis.document || { hidden: false };
});
test.after(async () => { await server.close(); });

// The previous PersonaCard's rules (src/persona/PersonaCard.jsx before package B), as a reducer.
function legacy(card, taps) {
  const need = card.pick || 2;
  let picks = [];
  for (const t of taps) {
    if (t === "done") {
      if (card.type === "rank") { if (picks.length === card.options.length) return [...picks]; continue; }
      return [...picks].sort((a, b) => a - b);
    }
    if (typeof t === "string") return t;
    if (card.type === "pick_two") { const next = picks.includes(t) ? picks.filter((x) => x !== t) : [...picks, t]; picks = next; if (next.length === need) return next; continue; }
    if (card.type === "rank") { picks = picks.includes(t) ? picks.filter((x) => x !== t) : [...picks, t]; continue; }
    if (card.type === "receipts") { const none = !!card.options[t].none; picks = picks.includes(t) ? picks.filter((x) => x !== t) : none ? [t] : [...picks.filter((x) => !card.options[x].none), t]; continue; }
    return t;
  }
  return undefined;
}

// The new card's rules, through answer-model.js (tap order into the model, as PersonaCard wires it).
function model(M, card, taps) {
  const need = card.pick || 2;
  let picks = [];
  let rank = M.initialRank(card);
  for (const t of taps) {
    if (t === "done") {
      if (card.type === "rank") { if (rank.placed === rank.order.length) return M.rankValue(rank); continue; }
      return M.receiptsValue(picks);
    }
    if (typeof t === "string") return t;
    if (card.type === "pick_two") { const next = M.togglePick(picks, t); picks = next; if (next.length === need) return [...next]; continue; }
    if (card.type === "rank") { rank = M.rankTap(rank, t); continue; }
    if (card.type === "receipts") { picks = M.toggleReceipt(card, picks, t); continue; }
    return t;
  }
  return undefined;
}

test("every bank card: random tap sequences send identical values through the old rules and answer-model", async () => {
  const M = await load("/src/persona/play/answer-model.js");
  const { KIT } = await load("/src/persona/kit.js");
  const cards = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras];
  let seed = 7;
  const rnd = (n) => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed % n; };
  let runs = 0;
  for (const card of cards) {
    for (let k = 0; k < 60; k++) {
      const taps = [];
      const len = 1 + rnd(8);
      for (let i = 0; i < len; i++) taps.push(rnd(10) === 0 ? card.exits[rnd(card.exits.length)] : rnd(6) === 0 ? "done" : rnd(card.options.length));
      if (card.type === "rank" && rnd(2)) taps.push(...[3, 1, 0, 2], "done");
      assert.deepEqual(model(M, card, taps), legacy(card, taps), `${card.id} ${JSON.stringify(taps)}`);
      runs++;
    }
  }
  assert.ok(runs > 10000);
});

test("rank model: taps place and take back like before; drags and keyboard moves set the whole order", async () => {
  const M = await load("/src/persona/play/answer-model.js");
  const card = { options: [{}, {}, {}, {}] };
  let r = M.initialRank(card);
  assert.ok(M.rankReady(r), "untouched order can be confirmed");
  r = M.rankTap(r, 2); r = M.rankTap(r, 0);
  assert.deepEqual(r.order.slice(0, r.placed), [2, 0]);
  assert.ok(!M.rankReady(r), "part placed: finish first");
  r = M.rankTap(r, 2);
  assert.deepEqual(r.order.slice(0, r.placed), [0]);
  r = M.rankReorder(r, [3, 2, 1, 0]);
  assert.deepEqual(M.rankValue(r), [3, 2, 1, 0]);
  r = M.rankMove(r, 0, -2);
  assert.deepEqual(M.rankValue(r), [3, 0, 2, 1]);
  assert.ok(M.rankReady(r));
});

test("exits keep their ids; real cards list No recent example first", async () => {
  const M = await load("/src/persona/play/answer-model.js");
  assert.deepEqual(M.exitOrder({ type: "real", exits: ["skip", "not_my_life", "no_recent"] }), ["no_recent", "skip", "not_my_life"]);
  assert.deepEqual(M.exitOrder({ type: "scenario", exits: ["skip", "not_my_life"] }), ["skip", "not_my_life"]);
  assert.equal(M.promptSize("x".repeat(70)), "s");
  assert.equal(M.promptSize("x".repeat(71)), "m");
  assert.equal(M.promptSize("x".repeat(121)), "l");
  assert.deepEqual(M.parseRole('Line keeper. "First twelve."'), { title: "Line keeper", line: '"First twelve."' });
});

test("reduced motion: the card renders under MotionConfig reducedMotion always", async () => {
  const { PersonaCard } = await load("/src/persona/play/PersonaCard.jsx");
  const { MotionConfig } = await import("motion/react");
  const { KIT } = await load("/src/persona/kit.js");
  const card = KIT.chapters[1].cards.find((c) => c.type === "rank") || KIT.chapters[0].cards[0];
  const html = renderToStaticMarkup(React.createElement(MotionConfig, { reducedMotion: "always" }, React.createElement(PersonaCard, { card, step: { phase: "chapter", chapter: card.chapter, index: 1, size: 6 }, onAnswer() {} })));
  assert.ok(html.includes("pc-prompt"));
});
