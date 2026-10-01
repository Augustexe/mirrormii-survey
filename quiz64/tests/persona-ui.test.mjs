import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { ADULT, clock, completeRun, leaning, firstOption } from "./persona-helpers.mjs";

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
  for (const c of S.allCards) { walk(c.prompt); walk(c.options.map((o) => o.t)); if (c.flip) walk(c.flip); if (c.thread) walk(c.thread.map((m) => [m.from, m.text])); if (c.heart) walk(c.heart); }
  walk(LIB.tags.map((t) => [t.name, t.sting, t.heart, t.calls]));
  walk([LIB.relationship, LIB.life].flat().map((h) => [h.name, h.desc, h.sting, h.heart]));
  walk(LIB.axes.map((a) => [a.plus, a.minus, a.plusLine, a.minusLine]));
  walk(FRIEND);
  const sorted = [...strings].sort((a, b) => b.length - a.length);
  return (text) => sorted.reduce((acc, s) => acc.split(s.replace(/\{[a-zA-Z]+\}/g, "")).join(" "), text);
}

test("every card renders its prompt, options and only its own exits, in both voices; no age label anywhere", async () => {
  const { PersonaCard } = await load("/src/persona/play/index.js");
  const { S, KIT } = await load("/src/persona/kit.js");
  const strip = await contentStripper();
  const cards = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras];
  for (const voice of ["fun", "heart"]) {
    for (const card of cards) {
      const step = { phase: card.type === "sealed" ? "finale" : card.axisFor ? "extra" : "chapter", chapter: card.chapter, index: 1, size: 8, round: card.round ? { index: 1, size: 3 } : null };
      const html = renderToStaticMarkup(React.createElement(PersonaCard, { card, step, voice, onAnswer() {} }));
      const text = visible(html);
      assert.ok(text.includes(S.promptFor(card, voice).replace(/\s+/g, " ")), `${card.id} prompt`);
      card.options.forEach((o, i) => assert.ok(text.includes(S.optionText(card, i, voice).replace(/\s+/g, " ")), `${card.id} option`));
      for (const m of S.threadFor(card, voice) || []) assert.ok(text.includes(m.text.replace(/\s+/g, " ")), `${card.id} thread line`);
      assert.equal(html.includes("persona-done"), ["receipts", "rank"].includes(card.type), `${card.id}: Done button only on receipts and rank`);
      assert.equal(html.includes("persona-thread"), card.type === "reply", `${card.id}: chat bubbles only on reply cards`);
      assert.equal(text.includes("No recent example"), card.exits.includes("no_recent"), `${card.id} no recent`);
      assert.doesNotMatch(text, /18\+|13 and up|How old/, `${card.id}: no age label`);
      const chrome = strip(text);
      assert.doesNotMatch(chrome, IDS, card.id);
      assert.doesNotMatch(chrome, WORDS, card.id);
    }
  }
});

test("voices on a card: Heart to heart text for heart, Make it fun otherwise, and Make it fun when a card has none", async () => {
  const { PersonaCard } = await load("/src/persona/play/index.js");
  const card = {
    id: "UI-1", type: "reply", chapter: 1, privacy: "normal", exits: ["skip", "not_my_life"], grade: "would", weight: 0.55,
    prompt: "Group chat, 11:40pm. Chaos.", thread: [{ from: "Sam", text: "who's booking??" }],
    options: [{ t: "On it. Link in five.", axes: { L3: 2 } }, { t: "lol not me", axes: { L3: -2 } }, { t: "Tag the planner", axes: { R1: -1 } }],
    heart: { prompt: "It is late, and the group chat needs a plan.", thread: [{ from: "Sam", text: "Who is booking the place?" }], options: ["I will book it now.", "I would rather someone else did.", "I ask our planner to do it."] },
  };
  const step = { phase: "chapter", chapter: 1, index: 1, size: 8, round: null };
  const render = (voice) => visible(renderToStaticMarkup(React.createElement(PersonaCard, { card, step, voice, onAnswer() {} })));
  const heart = render("heart");
  const fun = render("fun");
  for (const t of [card.heart.prompt, card.heart.thread[0].text, ...card.heart.options]) { assert.ok(heart.includes(t), t); assert.ok(!fun.includes(t), t); }
  for (const t of [card.prompt, card.thread[0].text, ...card.options.map((o) => o.t)]) { assert.ok(fun.includes(t), t); assert.ok(!heart.includes(t), t); }
  const { heart: _, ...plain } = card;
  const fallback = visible(renderToStaticMarkup(React.createElement(PersonaCard, { card: plain, step, voice: "heart", onAnswer() {} })));
  assert.ok(fallback.includes(card.prompt) && fallback.includes(card.options[0].t), "no heart version: Make it fun");
});

test("new formats render: rank with a Done button and order hint, bet and eyes as one-tap lists", async () => {
  const { PersonaCard } = await load("/src/persona/play/index.js");
  const base = { chapter: 1, privacy: "normal", exits: ["skip", "not_my_life"] };
  const step = { phase: "chapter", chapter: 1, index: 1, size: 8, round: null };
  const rank = { ...base, id: "UI-R", type: "rank", prompt: "Rank what you'd cancel first.", options: ["Gym", "Date night", "Family dinner", "Group project"].map((t) => ({ t })) };
  const html = renderToStaticMarkup(React.createElement(PersonaCard, { card: rank, step, onAnswer() {} }));
  assert.ok(html.includes("persona-done") && visible(html).includes("Rank it") && visible(html).includes("0/4 placed"));
  const bet = { ...base, id: "UI-B", type: "bet", prompt: "I bet you've unblocked someone to check on them.", options: [{ t: "Guilty. Blocked again that night." }, { t: "Guilty. We're friends now." }, { t: "Never. Blocked means gone." }] };
  const bt = visible(renderToStaticMarkup(React.createElement(PersonaCard, { card: bet, step, onAnswer() {} })));
  assert.ok(bt.includes("Genii's bet") && bet.options.every((o) => bt.includes(o.t)));
  const eyes = { ...base, id: "UI-E", type: "eyes", prompt: "Your best friend describes you to a stranger. Which line?", options: ["Always has a plan", "Down for anything", "Knows everyone", "Loyal to a fault"].map((t) => ({ t })) };
  const et = visible(renderToStaticMarkup(React.createElement(PersonaCard, { card: eyes, step, onAnswer() {} })));
  assert.ok(et.includes("Through a friend's eyes"));
});

// The result page (Stories) tests live in persona-result.test.mjs (Build C package F).

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
    const play = { payload: "", stage, step, guesses, updatedAt: "" };
    const text = visible(renderToStaticMarkup(React.createElement(FriendGame, { ch, play, isOwnLink: false, onProgress() {}, onYourTurn() {}, onLeave() {} })));
    assert.doesNotMatch(text, /How old|18 or older|Under 18/, `${stage}: the friend is never asked their age`);
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

test("setup has no age screen: two questions, closest person then pronoun", async () => {
  const { SetupView, SETUP_STEPS } = await load("/src/persona/screens/index.js");
  assert.deepEqual(SETUP_STEPS.map((s) => s.key), ["closest", "pronoun"]);
  const text = visible(renderToStaticMarkup(React.createElement(SetupView, { onDone() {}, onBack() {} })));
  assert.ok(text.includes(SETUP_STEPS[0].title));
  assert.ok(text.includes("Question 1 of 2"));
  assert.doesNotMatch(text, /How old|18 or older|13 to 17|Under 13/);
});

test("lobby screen renders its first question and options; the card screen's bubble follows the voice", async () => {
  const { LobbyView, interludeFor } = await load("/src/persona/screens/index.js");
  const { PersonaQuizView } = await load("/src/persona/play/index.js");
  const { geniiLineFor } = await load("/src/persona/play/Quiz.jsx");
  const { LOBBY_COPY } = await load("/src/persona/lobby.js");
  const Session = await load("/src/persona/session.js");
  const lobbyText = visible(renderToStaticMarkup(React.createElement(LobbyView, { onDone() {}, onBack() {} })));
  const first = LOBBY_COPY.steps[0];
  assert.ok(lobbyText.includes(first.title));
  for (const o of first.options) assert.ok(lobbyText.includes(o.text), o.text);
  assert.ok(lobbyText.includes(LOBBY_COPY.counter(1, LOBBY_COPY.steps.length)));
  assert.doesNotMatch(lobbyText, IDS);
  assert.doesNotMatch(lobbyText, WORDS);

  assert.equal(LOBBY_COPY.steps.length, 3, "three taps: voice, how personal, rooms");
  assert.doesNotMatch(lobbyText, /ending|How should your ending read/i);

  let s = Session.chooseLobby(Session.startRun(Session.newRun({ runId: "uilobby01" }), ADULT), { voice: "fun", depth: "light", rooms: ["work"] });
  s = Session.answerCard(s, Session.currentStep(s).card.id, 0, { ms: 4000 });
  const step = Session.currentStep(s);
  const seeds = { fun: "uilobby01", heart: "uilobby01h", cards: "uilobby01c" };
  const render = (voice) => visible(renderToStaticMarkup(React.createElement(PersonaQuizView, { step, setup: ADULT, onAnswer() {}, onMap() {}, cardKey: "k", voice, seed: seeds[voice] })));
  // Genii's line comes from the voice's own host lines (or a reaction); Just the cards shows none.
  const line = geniiLineFor(step, "fun", { seed: seeds.fun });
  const heartLine = geniiLineFor(step, "heart", { seed: seeds.heart });
  assert.ok(LOBBY_COPY.host.fun.chapter.includes(line) && LOBBY_COPY.host.heart.chapter.includes(heartLine));
  assert.ok(render("fun").includes(line));
  assert.ok(render("heart").includes(heartLine) && !render("heart").includes(line), "Heart to heart has its own lines");
  assert.ok(!render("cards").includes(line) && !render("cards").includes(heartLine), "Just the cards hides Genii's between-card line");
  assert.ok(render("cards").includes(step.card.prompt.replace(/\s+/g, " ").slice(0, 20)), "Just the cards reads Make it fun wording");
  const seen = visible(renderToStaticMarkup(React.createElement(PersonaQuizView, { step, setup: ADULT, onAnswer() {}, onMap() {}, cardKey: "k", voice: "fun", seed: seeds.fun })).replace(/<span class="pc-sr"[^>]*>[^<]*<\/span>/g, ""));
  // G6 (R3): the rail carries one readable count beside its mirror, "Card N of 40", once; no second counter.
  assert.equal((seen.match(/Card \d+ of \d+/g) || []).length, 1, "one readable count on the rail");
  assert.ok(seen.includes(`Card ${step.resolved + 1} of ${step.total}`), "the count is the card's place in the run");
  assert.doesNotMatch(seen, /\d+ \/ 40 cards/, "no second counter");
  const intro = interludeFor(Session.currentStep(Session.chooseLobby(Session.startRun(Session.newRun({ runId: "uilobby02" }), ADULT), { voice: "cards", depth: "light", rooms: [] })), "cards");
  assert.equal(intro.kicker, LOBBY_COPY.chapterKicker(1, 4), "chapter numbering counts only open rooms");
});
