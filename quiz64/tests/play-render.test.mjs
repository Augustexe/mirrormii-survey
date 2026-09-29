// Package B render checks (DESIGN-DIRECTION 5.7, 5.8, 5.10, 7.4 B1, B3, B7): every format has its own body in both
// voices, one progress indicator, the lock screen never shows its code outside the disclosure sheet.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { started, ADULT, firstOption, playUntil } from "./persona-helpers.mjs";

let server;
const load = (p) => server.ssrLoadModule(p);
const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ");
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true, hmr: false }, appType: "custom", logLevel: "silent" });
  globalThis.document = globalThis.document || { hidden: false };
});
test.after(async () => { await server.close(); });

const MARK = {
  scenario: "pc-answers--list", real: "pc-memory", receipts: "pc-receipt", bet: "pc-betchip", reply: "pc-thread-panel",
  others: "pc-tile--thought", this_or_that: "pc-split", role: "pc-role__badge", pick_two: "pc-slots", rank: "pc-rank__list",
  eyes: "pc-tile--quote", feeling: "pc-answers--beads", sealed: "pc-tile--sealed",
};

test("all 13 formats render their own body in both voices", async () => {
  const { PersonaCard } = await load("/src/persona/play/PersonaCard.jsx");
  const { S, KIT } = await load("/src/persona/kit.js");
  const cards = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras];
  const seen = new Set();
  for (const card of cards) {
    for (const voice of ["fun", "heart"]) {
      const finale = card.type === "sealed";
      const step = { phase: finale ? "finale" : card.axisFor ? "extra" : "chapter", chapter: finale ? "finale" : card.chapter, index: 1, size: 8, round: card.round ? { index: 1, size: 2 } : null };
      const html = renderToStaticMarkup(React.createElement(PersonaCard, { card, step, voice, onAnswer() {} }));
      assert.ok(html.includes(MARK[card.type]), `${card.id} ${card.type}: ${MARK[card.type]}`);
      for (const [type, cls] of Object.entries(MARK)) if (type !== card.type && !["scenario"].includes(type) && cls !== MARK[card.type]) assert.ok(!html.includes(`"${cls}`) && !html.includes(` ${cls}"`) , `${card.id} carries ${type}'s ${cls}`);
      assert.doesNotMatch(html, /answer-token|<code/, `${card.id}: no letter tokens, no monospace`);
      assert.ok(visible(html).includes(S.promptFor(card, voice).replace(/\s+/g, " ")), `${card.id} prompt`);
      seen.add(card.type);
    }
  }
  assert.equal(seen.size, 13);
});

test("the card screen has one progress indicator, the shard rail, with a text label", async () => {
  const { PersonaQuizView } = await load("/src/persona/play/Quiz.jsx");
  const Session = await load("/src/persona/session.js");
  let s = started(ADULT, "railrun01");
  s = playUntil(s, firstOption, (step) => step.kind === "card" && step.resolved >= 3);
  const step = Session.currentStep(s);
  const html = renderToStaticMarkup(React.createElement(PersonaQuizView, { step, setup: ADULT, onAnswer() {}, onMap() {}, cardKey: "k", voice: "fun", progress: Session.chapterProgress(s), seed: s.runId }));
  const text = visible(html);
  assert.ok(html.includes("shard-rail"));
  assert.match(html, /<span class="pc-sr">Card 4 of 40, [^<]+\. Open the chapter map\.<\/span>/);
  assert.doesNotMatch(text, /\d+ \/ \d+ cards|\d+ of \d+ cards/);
  assert.doesNotMatch(html, /progressbar|chapter-ribbon|conversation-progress|quiz-count/);
  assert.equal((html.match(/class="shard-rail/g) || []).length, 1);
});

test("rail groups: 40 slots in chapter order; the finale swaps to 8 panes", async () => {
  const { railGroups, filledShards } = await load("/src/persona/play/rail-model.js");
  const Session = await load("/src/persona/session.js");
  let s = started(ADULT, "railrun02");
  s = playUntil(s, firstOption, (step) => step.kind === "card" && step.resolved >= 9);
  const step = Session.currentStep(s);
  const rail = railGroups(step, Session.chapterProgress(s));
  assert.equal(rail.groups.reduce((a, g) => a + g.size, 0), 40);
  assert.equal(rail.groups.filter((g) => g.current).length, 1);
  assert.equal(filledShards(rail).length, 9);
  const bare = railGroups(step, null);
  assert.equal(bare.groups.filter((g) => g.current).length, 1);
  assert.ok(railGroups({ phase: "finale", index: 3, size: 8 }).finale);
});

test("lock: no code on the main screen, the full code only in the disclosure sheet, in groups of four", async () => {
  const { LockView } = await load("/src/persona/play/Lock.jsx");
  const hash = "d36a79071138cfda8e2b4c1d9f0a7b3c5e6d7f8091a2b3c4d5e6f708192a3b4c";
  const open = renderToStaticMarkup(React.createElement(LockView, { locked: false, lockHash: null, onLock() {}, onStart() {}, onSave() {} }));
  assert.ok(visible(open).includes("Eight cards.") && visible(open).includes("Lock in Genii's guesses"));
  const locked = renderToStaticMarkup(React.createElement(LockView, { locked: true, lockHash: hash, onLock() {}, onStart() {}, onSave() {} }));
  const main = locked.slice(0, locked.indexOf("<dialog"));
  const sheet = locked.slice(locked.indexOf("<dialog"));
  assert.ok(!main.includes(hash.slice(0, 4)), "no code on the main screen");
  assert.ok(visible(main).includes("How do I know Genii can't cheat?"));
  assert.ok(visible(main).includes("Play the final 8"));
  assert.ok(sheet.includes("d36a 7907 1138 cfda"), "grouped in fours");
  assert.doesNotMatch(locked, /<code|monospace/);
  assert.equal((main.match(/data-art="lock-pane"/g) || []).length, 8);
});

test("chapter map: a node per chapter plus the finale; closed rooms say so", async () => {
  const { PersonaChapterMap, mapNodes } = await load("/src/persona/play/ChapterMapSheet.jsx");
  const progress = { 1: { open: true, done: 6, total: 6 }, 2: { open: true, done: 2, total: 6 }, 3: { open: false, done: 0, total: 0 }, 4: { open: true, done: 0, total: 0 }, 5: { open: true, done: 0, total: 0 }, 6: { open: true, done: 0, total: 0 }, 7: { open: true, done: 0, total: 0 } };
  const nodes = mapNodes(progress);
  assert.equal(nodes.length, 8);
  assert.deepEqual(nodes.slice(0, 4).map((n) => n.state), ["done", "current", "closed", "next"]);
  const text = visible(renderToStaticMarkup(React.createElement(PersonaChapterMap, { open: false, onClose() {}, progress })));
  assert.ok(text.includes("6 of 6") && text.includes("2 of 6") && text.includes("Closed"));
});

test("Genii's line: hidden on feeling and finale cards and for Just the cards", async () => {
  const { geniiLineFor } = await load("/src/persona/play/Quiz.jsx");
  const feeling = { phase: "chapter", index: 2, resolved: 5, card: { id: "F", type: "feeling" } };
  assert.equal(geniiLineFor(feeling, "fun"), null);
  assert.equal(geniiLineFor({ ...feeling, phase: "finale", card: { id: "S", type: "sealed" } }, "heart"), null);
  assert.equal(geniiLineFor({ ...feeling, card: { id: "X", type: "scenario" } }, "cards"), null);
  assert.ok(geniiLineFor({ ...feeling, card: { id: "X", type: "scenario" } }, "fun"));
});

test("Genii's line varies: never the same line on two cards in a row, the speed nudge once per rushed streak", async () => {
  const { geniiLineFor, rememberAnswer } = await load("/src/persona/play/Quiz.jsx");
  const Session = await load("/src/persona/session.js");
  for (const voice of ["fun", "heart"]) {
    for (const [runId, ms] of [["linesrun01", 4000], ["linesrun02", 900], ["linesrun03", 4000]]) {
      let s = started(ADULT, `${runId}${voice}`, { voice, depth: "anything", rooms: ["love", "work", "family"] });
      const lines = [];
      let nudges = 0;
      for (let g = 0; g < 60; g++) {
        const step = Session.currentStep(s);
        if (step.kind !== "card" || step.phase === "finale") break;
        const line = geniiLineFor(step, voice, { seed: s.runId, rushing: Session.recentlyRushed(s) });
        if (line && lines.length && line === lines[lines.length - 1]) assert.fail(`${voice} ${runId}: "${line}" twice in a row at card ${step.resolved}`);
        lines.push(line);
        if (voice === "fun" && line && /Speedrun/.test(line)) nudges++;
        const value = firstOption(step.card).value;
        rememberAnswer(s.runId, step, step.card, value);
        s = Session.answerCard(s, step.card.id, value, { ms });
      }
      assert.ok(new Set(lines.filter(Boolean)).size >= 6, `${voice} ${runId}: lines vary (${new Set(lines).size})`);
      if (ms < 1500 && voice === "fun") assert.equal(nudges, 1, "one speed nudge for one long rushed streak");
    }
  }
});
