import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { ADULT, TEEN, clock, completeRun, leaning } from "./persona-helpers.mjs";

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
// Internal ids and system words that must never reach the screen.
const IDS = /\b(?:C[1-7]-(?:\d+|S\d)|X-[RL]\d-\d|T\d\d[AB]|R\d{2}|[RL][1-3]\b)/;
const WORDS = /\b(?:sealed|evidence|axis|axes|mask|research|support|net)\b/i;

let server;
const load = (p) => server.ssrLoadModule(p);

test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  globalThis.document = { hidden: false };
});
test.after(async () => {
  delete globalThis.document;
  await server.close();
});

// Removes every line of kit content, so the checks below see only the app's own words.
async function contentStripper() {
  const { S, LIB, FRIEND } = await load("/src/persona/kit.js");
  const strings = new Set();
  const walk = (v) => { if (typeof v === "string") { if (v.length > 3) strings.add(v); } else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === "object") Object.values(v).forEach(walk); };
  for (const c of S.allCards) { walk(c.prompt); walk(c.teenPrompt); walk(c.options.map((o) => o.t)); if (c.flip) walk(c.flip); }
  walk(LIB.tags.map((t) => [t.name, t.sting, t.heart, t.calls]));
  walk([LIB.relationship, LIB.life].flat().map((h) => [h.name, h.desc, h.sting, h.heart]));
  walk(LIB.axes.map((a) => [a.plus, a.minus, a.plusLine, a.minusLine]));
  walk(FRIEND);
  const sorted = [...strings].sort((a, b) => b.length - a.length);
  return (text) => sorted.reduce((acc, s) => acc.split(s.replace(/\{[a-zA-Z]+\}/g, "")).join(" "), text);
}

test("every card renders its prompt, options and only its own exits; 18+ label only on locked cards; teens get teen prompts", async () => {
  const { PersonaCard } = await load("/src/persona/PersonaCard.jsx");
  const { S, KIT } = await load("/src/persona/kit.js");
  const strip = await contentStripper();
  const cards = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras];
  for (const setup of [ADULT, TEEN]) {
    for (const card of cards) {
      if (setup === TEEN && !card.teen) continue;
      const step = { phase: card.type === "sealed" ? "finale" : card.axisFor ? "extra" : "chapter", chapter: card.chapter, index: 1, size: 8, round: card.round ? { index: 1, size: 3 } : null };
      const text = visible(renderToStaticMarkup(React.createElement(PersonaCard, { card, step, setup, onAnswer() {} })));
      assert.ok(text.includes(S.promptFor(card, setup).replace(/\s+/g, " ")), `${card.id} prompt`);
      if (setup === TEEN && card.teenPrompt) assert.ok(text.includes(card.teenPrompt.replace(/\s+/g, " ")), `${card.id} teen prompt`);
      for (const o of card.options) assert.ok(text.includes(o.t.replace(/\s+/g, " ")), `${card.id} option`);
      assert.equal(text.includes("No recent example"), card.exits.includes("no_recent"), `${card.id} no recent`);
      assert.equal(/18\+/.test(text), card.privacy === "locked18", `${card.id} lock label`);
      const chrome = strip(text);
      assert.doesNotMatch(chrome, IDS, card.id);
      assert.doesNotMatch(chrome, WORDS, card.id);
    }
  }
});

test("the result page follows the template, marks owner-only lines and leaks no ids or system words", async () => {
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const { resultView } = await load("/src/persona/views.js");
  const strip = await contentStripper();
  for (const [setup, choose] of [[ADULT, leaning({ R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 })], [TEEN, leaning({ R1: -1, R2: 1, R3: 1, L1: -1, L2: 1, L3: -1 })]]) {
    const run = completeRun(setup, choose, "uiresult1");
    const view = resultView(run);
    const friends = { setup, defaults: {}, challenges: [], ranking: null, returnTo: null };
    const html = renderToStaticMarkup(React.createElement(PersonaResult, { view, friends, onFriendAction() {}, storageOK: true }));
    const text = visible(html);
    for (const heading of ["What stings", "What you love about it", "Your tags", "Genii's calls", "Genii's guesses", "Do you really know me?"]) assert.ok(text.includes(heading), heading);
    assert.ok(text.includes(view.typeName.split(" × ")[0]));
    assert.ok(text.includes(view.code));
    for (const s of view.stings) assert.ok(text.includes(s));
    for (const t of view.tags) { assert.ok(text.includes(t.name)); assert.ok(text.includes(t.sting)); assert.ok(text.includes(t.heart)); }
    assert.ok((text.match(/Only you see this/g) || []).length >= 1 + view.tags.length);
    if (view.plotTwist) assert.ok(text.includes("Plot twist"));
    assert.ok(text.includes(view.guesses.line));
    const chrome = strip(text);
    assert.doesNotMatch(chrome, IDS);
    assert.doesNotMatch(chrome, WORDS);
    assert.equal((chrome.match(/\btags?\b/gi) || []).length, 1, "the word tags appears only in the heading");
    const card = html.slice(html.indexOf("pr-share-card"), html.indexOf("</figure>"));
    for (const s of [...view.stings, ...view.tags.map((t) => t.sting)]) assert.ok(!card.includes(s), "no sting on the share card");
    assert.ok(!card.includes(view.code));
  }
});

test("friend game screens: every level renders, the done screen shows counts only", async () => {
  const { FriendGame } = await load("/src/persona/FriendGame.jsx");
  const { FriendResultsView } = await load("/src/persona/FriendResultsView.jsx");
  const Friend = await load("/src/persona/friend.js");
  const strip = await contentStripper();
  const owner = completeRun(ADULT, leaning({ R1: 1, R2: 1, R3: -1, L1: -1, L2: 1, L3: 1 }), "uifriend1");
  const { state, challenge } = Friend.createChallenge(owner, { rel: "bestie", stings: true, name: "Robin" }, { now: clock(), id: "uichal0001", seed: 3 });
  const ch = Friend.parseChallenge(Friend.challengePayload(state, challenge));
  const view = Friend.friendDeckView(ch);
  const guesses = { level1: Object.fromEntries(view.level1.map((q) => [q.axis, q.truth])), level2: Object.fromEntries(view.level2.cards.map((c) => [c.id, c.answer])), why: {}, level3: view.level3.cards.filter((c) => c.role === "decoy").slice(0, view.level3.N).map((c) => c.id), level4: { sting: view.level4.stingPick.lines[0].tag, roast: null } };
  const stages = [["intro", 0], ["level1", 0], ["level1", 6], ["level2", 0], ["level3", 0], ["level4", 0], ["level4", 1], ["done", 0]];
  for (const [stage, step] of stages) {
    const play = { payload: "", under18: false, stage, step, guesses, updatedAt: "" };
    const text = visible(renderToStaticMarkup(React.createElement(FriendGame, { ch, play, isOwnLink: false, onProgress() {}, onYourTurn() {}, onLeave() {} })));
    const chrome = strip(text);
    assert.doesNotMatch(chrome, IDS, stage);
    if (stage === "done") {
      assert.ok(text.includes("You read 6/6 sides of Robin"));
      assert.ok(text.includes("Send your answers back to Robin"));
      for (const l of view.level4.stingPick.lines) assert.ok(!text.includes(l.t), "the friend never sees which sting was real");
      for (const c of view.level3.cards) assert.ok(!text.includes(c.name), "the friend never sees which tags were right");
    }
    if (stage === "level3") for (const c of view.level3.cards) { assert.ok(text.includes(c.name)); assert.ok(text.includes(c.heart)); }
  }
  const reply = Friend.replyPayload(ch, view, Friend.cleanGuesses(view, guesses));
  const imported = Friend.importReply(state, reply, { now: clock() });
  const ownerView = Friend.ownerFriendView(imported.state, challenge.id);
  const text = visible(renderToStaticMarkup(React.createElement(FriendResultsView, { view: ownerView, onBack() {}, onHideRoast() {} })));
  for (const zone of ["They get you", "What they don't see", "Who they think you are"]) assert.ok(text.includes(zone), zone);
  assert.ok(text.includes("Only you see this page"));
  assert.doesNotMatch(strip(text), IDS);
});

test("a result with no named tags says why instead of showing empty sections", async () => {
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const { resultView } = await load("/src/persona/views.js");
  const run = completeRun(ADULT, (card) => ({ value: card.type === "pick_two" ? [0, 1] : 0, ms: 700 }), "uinotags1");
  const view = resultView(run);
  assert.equal(view.tags.length, 0);
  assert.equal(view.noTagsReason, "rushed");
  const text = visible(renderToStaticMarkup(React.createElement(PersonaResult, { view, friends: { setup: ADULT, defaults: {}, challenges: [], ranking: null, returnTo: null }, onFriendAction() {}, storageOK: true })));
  assert.ok(text.includes("Genii didn't name any this time"));
  assert.ok(!text.includes("Genii's calls"));
});

test("lobby screen renders its first question and options; the card screen's bubble follows the delivery", async () => {
  const { LobbyView, PersonaQuizView, interludeFor } = await load("/src/persona/PersonaScreens.jsx");
  const { LOBBY_COPY, hostLine } = await load("/src/persona/lobby.js");
  const Session = await load("/src/persona/session.js");
  const lobbyText = visible(renderToStaticMarkup(React.createElement(LobbyView, { onDone() {}, onBack() {} })));
  const first = LOBBY_COPY.steps[0];
  assert.ok(lobbyText.includes(first.title));
  for (const o of first.options) assert.ok(lobbyText.includes(o.text), o.text);
  assert.ok(lobbyText.includes(LOBBY_COPY.counter(1, LOBBY_COPY.steps.length)));
  assert.doesNotMatch(lobbyText, IDS);
  assert.doesNotMatch(lobbyText, WORDS);

  let s = Session.chooseLobby(Session.startRun(Session.newRun({ runId: "uilobby01" }), ADULT), { depth: "some", rooms: ["work"], delivery: "playful" });
  s = Session.answerCard(s, Session.currentStep(s).card.id, 0, { ms: 4000 });
  const step = Session.currentStep(s);
  const render = (delivery) => visible(renderToStaticMarkup(React.createElement(PersonaQuizView, { step, setup: ADULT, onAnswer() {}, onMap() {}, cardKey: "k", delivery })));
  const line = hostLine("playful", { phase: step.phase, index: step.index });
  assert.ok(render("playful").includes(line));
  assert.ok(!render("minimal").includes(line), "minimal hides Genii's between-card line");
  assert.ok(render("playful").includes(LOBBY_COPY.runLabel(step.resolved + 1, Session.RUN_SIZE)));
  const intro = interludeFor(Session.currentStep(Session.chooseLobby(Session.startRun(Session.newRun({ runId: "uilobby02" }), ADULT), { depth: "light", rooms: [], delivery: "minimal" })), "minimal");
  assert.equal(intro.kicker, LOBBY_COPY.chapterKicker(1, 4), "chapter numbering counts only open rooms");
});
