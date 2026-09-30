// The final screen as Stories (LAUNCH-SPEC sections 21 to 23): the screens from a synthetic result, no quoted
// answers, Heart to heart picks the h variants, and the screen still works on a library without the Build C fields.
// Display accuracy against real runs lives in reveal-accuracy.test.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { STATS, endOf } from "../src/persona/stats.js";

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const WORDS = /\b(?:evidence|axis|axes|sealed|score|scores)\b/i;
const IDS = /\b(?:C[1-7]-(?:\d+|S\d)|X-[RL]\d-\d|T\d\d[AB]|[RL][1-3])\b/;
// A synthetic run has no chapters to read rooms from; with a guess check it has the calls screen.
const ORDER = ["intro", "names", "read", "map", "knows", "insight", "traits", "stings", "calls", "share", "app"];
const ORDER_NO_CALLS = ORDER.filter((id) => id !== "calls");

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

// ---------------------------------------------------------------- synthetic fixtures
const AXES = [
  { id: "R1", plus: "We", minus: "Me", plusLine: "Close means shared.", minusLine: "Close still means space." },
  { id: "R2", plus: "Direct", minus: "Soft", plusLine: "You say it straight.", minusLine: "You hold the person first." },
  { id: "R3", plus: "Classic", minus: "Own", plusLine: "Traditions matter to you.", minusLine: "You write your own script." },
  { id: "L1", plus: "Steady", minus: "Venture", plusLine: "Security first.", minusLine: "You leap first." },
  { id: "L2", plus: "Push", minus: "Easy", plusLine: "You chase the win.", minusLine: "You run on your own clock." },
  { id: "L3", plus: "Rules", minus: "Context", plusLine: "A rule is a rule.", minusLine: "It depends, and you know it." },
];

// The 2026-09-26 library shape: no read, line, h, insights or insightFallback.
function oldLibrary() {
  return {
    axes: AXES.map((a) => ({ ...a })),
    relationship: [{ code: "We·Soft·Own", name: "Golden Retriever", desc: "OLD-DESC-PEOPLE", sting: "OLD-STING-PEOPLE", heart: "OLD-HEART-PEOPLE" }],
    life: [{ code: "Steady·Push·Rules", name: "The Planner", desc: "OLD-DESC-LIFE", sting: "OLD-STING-LIFE", heart: "OLD-HEART-LIFE" }],
    tags: [
      { id: "T01A", name: "Here, scroll my phone", heart: "OLD-TAGHEART-1", sting: "OLD-TAGSTING-1", calls: ["CALL-1A", "CALL-1B"] },
      { id: "T02A", name: "Yes first", heart: "OLD-TAGHEART-2", sting: "OLD-TAGSTING-2", calls: ["CALL-2A"] },
      { id: "T03A", name: "Reads the rulebook", heart: "OLD-TAGHEART-3", sting: "OLD-TAGSTING-3", calls: [] },
    ],
  };
}

// The Build C library shape (section 22): read, line, h variants, insights and insightFallback.
function newLibrary() {
  const lib = oldLibrary();
  lib.axes = lib.axes.map((a) => ({ ...a, h: { plusLine: `H-${a.plusLine}`, minusLine: `H-${a.minusLine}` } }));
  lib.relationship[0] = { ...lib.relationship[0], read: "NEW-READ-PEOPLE", h: { desc: "H-DESC-PEOPLE", read: "H-READ-PEOPLE", sting: "H-STING-PEOPLE", heart: "H-HEART-PEOPLE" } };
  lib.life[0] = { ...lib.life[0], read: "NEW-READ-LIFE", h: { desc: "H-DESC-LIFE", read: "H-READ-LIFE", sting: "H-STING-LIFE", heart: "H-HEART-LIFE" } };
  lib.tags = lib.tags.map((t, i) => ({ ...t, line: `NEW-LINE-${i + 1}`, h: { line: `H-LINE-${i + 1}`, sting: `H-TAGSTING-${i + 1}`, heart: `H-TAGHEART-${i + 1}` } }));
  lib.insights = { L2: { believePlus: "NEW-INSIGHT-PLUS", believeMinus: "NEW-INSIGHT-MINUS", h: { believePlus: "H-INSIGHT-PLUS", believeMinus: "H-INSIGHT-MINUS" } } };
  lib.insightFallback = { "We·Soft·Own": { line: "NEW-FALLBACK-PEOPLE", h: { line: "H-FALLBACK-PEOPLE" } } };
  return lib;
}

const QUOTES = ["QUOTED-ANSWER-ONE", "QUOTED-ANSWER-TWO", "QUOTED-TWIST-SAID", "QUOTED-TWIST-DID"];
const row = (axis, pole, flex = false) => ({ axis, pole, line: "x", flex, unfinished: false });

function syntheticResult({ tags = 3 } = {}) {
  const tagRows = [
    { id: "T01A", name: "Here, scroll my phone", strength: "strong", heart: "OLD-TAGHEART-1", sting: "OLD-TAGSTING-1", youToldGenii: [{ card: "C1-2", said: QUOTES[0], grade: "did" }, { card: "C2-3", said: QUOTES[1], grade: "would" }] },
    { id: "T02A", name: "Yes first", strength: "showing", heart: "OLD-TAGHEART-2", sting: "OLD-TAGSTING-2", youToldGenii: [] },
    { id: "T03A", name: "Reads the rulebook", strength: "showing", heart: "OLD-TAGHEART-3", sting: "OLD-TAGSTING-3", youToldGenii: [] },
  ].slice(0, tags);
  return {
    type: { name: "Golden Retriever × The Planner", code: "We·Soft·Own | Steady·Push·Rules", badges: [] },
    halves: [
      { side: "relationship", name: "Golden Retriever", code: "We·Soft·Own", desc: "OLD-DESC-PEOPLE", axes: [row("R1", "We"), row("R2", "Soft"), row("R3", "Own", true)] },
      { side: "life", name: "The Planner", code: "Steady·Push·Rules", desc: "OLD-DESC-LIFE", axes: [row("L1", "Steady"), row("L2", "Push"), row("L3", "Rules")] },
    ],
    stings: ["OLD-STING-PEOPLE", "OLD-STING-LIFE"],
    hearts: ["OLD-HEART-PEOPLE", "OLD-HEART-LIFE"],
    tags: tagRows,
    calls: [{ line: "CALL-1A", fromTag: "T01A" }, { line: "CALL-2A", fromTag: "T02A" }],
    plotTwist: { line: `You'd say: ‘${QUOTES[2]}’ Last time, you did: ‘${QUOTES[3]}’`, dim: "L2", said: { card: "C4-1", text: QUOTES[2] }, did: { card: "C4-2", text: QUOTES[3], grade: "did" } },
    share: { typeName: "Golden Retriever × The Planner", tags: tagRows.map((t) => ({ name: t.name, heart: t.heart })), invite: "How well do you know me?" },
  };
}

function syntheticProfile({ split = true, rushed = 0, answered = 40 } = {}) {
  const axes = { R1: { pole: 1, norm: 0.61 }, R2: { pole: -1, norm: -0.83 }, R3: { pole: -1, norm: -0.04 }, L1: { pole: 1, norm: 0.37 }, L2: { pole: 1, norm: 0.12 }, L3: { pole: 1, norm: 0.72 } };
  return {
    axes,
    counts: { answered, rushed },
    splits: split ? [{ dim: "L2", kind: "axis", believe: -1.4, act: 2.1, said: { card: "C4-1", text: QUOTES[2] }, did: { card: "C4-2", text: QUOTES[3], grade: "did" } }] : [],
  };
}

const SEALED = {
  called: 6, exact: 4,
  rows: [
    { id: "C1-S1", status: "hit", predictedText: QUOTES[0], answerText: QUOTES[0] },
    { id: "C2-S1", status: "miss", predictedText: "GUESS-TEXT", answerText: QUOTES[1] },
    { id: "C3-S1", status: "pass" },
  ],
};

async function render(view, extra = {}) {
  const { PersonaResult } = await load("/src/persona/PersonaResult.jsx");
  const friends = { setup: { closest: "best_friend", pronoun: "she" }, defaults: {}, challenges: [], ranking: null, returnTo: null };
  return renderToStaticMarkup(React.createElement(PersonaResult, { view, friends, onFriendAction() {}, onRestart() {}, onDownload() {}, onDelete() {}, storageOK: true, ...extra }));
}
const slideHtml = (html, id) => {
  const at = html.indexOf(`data-story="${id}"`);
  const start = html.indexOf(">", at) + 1;
  const end = html.indexOf("</section>", start);
  return html.slice(start, end);
};

// ---------------------------------------------------------------- tests
test("the screens render in order from a synthetic result, with only the first one showing", async () => {
  const { buildStories, STORY_COPY, UI_COPY, GUESS_COPY } = await load("/src/persona/stories/story-data.js");
  const C = STORY_COPY.fun;
  const view = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: SEALED, lib: newLibrary(), voice: "fun", promptFor: (id) => `PROMPT ${id.length}` });
  assert.deepEqual(view.slides.map((s) => s.id), ORDER);
  const html = await render(view);
  const found = [...html.matchAll(/data-story="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(found, ORDER);
  assert.equal((html.match(/<section[^>]*hidden=""/g) || []).length, ORDER.length - 1, "every screen but the first starts hidden");
  const text = visible(html);
  assert.ok(text.includes(C.intro.title));

  const names = visible(slideHtml(html, "names"));
  assert.ok(names.includes("Golden Retriever") && names.includes("The Planner"));
  assert.ok(!text.includes("Golden Retriever × The Planner") && !/Golden Retriever (?:with|and) The Planner energy/.test(text), "the two names are never glued");

  const read = visible(slideHtml(html, "read"));
  for (const line of ["NEW-READ-PEOPLE", "NEW-READ-LIFE", "OLD-DESC-PEOPLE", "OLD-DESC-LIFE"]) assert.ok(read.includes(line), line);
  assert.ok(!read.includes("NEW-LINE-1"), "the traits keep their own lines");

  const map = slideHtml(html, "map");
  assert.equal((map.match(/class="rv-stat"/g) || []).length, 6, "six stats on the character sheet");
  // Round 3: a character sheet of game stats (src/persona/stats.js); the internal pole names never show.
  for (const a of AXES) {
    assert.ok(map.includes(endOf(a.plus)) || map.includes(endOf(a.minus)), `${a.id}: an end shows`);
    assert.ok(map.includes(STATS[a.id].stat), STATS[a.id].stat);
    // The L3 stat is named Rules, like its internal plus pole; the stat name is the label, never the pole.
    assert.ok((a.plus === STATS[a.id].stat || !map.includes(`>${a.plus}<`)) && !map.includes(`>${a.minus}<`), `no bare ${a.plus} or ${a.minus}`);
  }
  const lv = Object.values(C.map.levels).join("|");
  assert.ok(new RegExp(`Closeness: Stays close, (${lv}), \\w+ pips of five\\.`).test(visible(map)) && visible(map).includes("Traditions: Right in the middle, Carries them on and starts new ones."), "each stat reads as a sentence");
  assert.doesNotMatch(visible(map), /%/, "no percentage on the map");
  assert.doesNotMatch(visible(map), /\d/, "no numbers on the map");

  const knows = visible(slideHtml(html, "knows"));
  assert.ok(knows.includes(C.knows.kicker));
  assert.ok(knows.includes("You hold the person first."), "the clearest lean first");
  assert.ok(Object.values(C.knows.tiers).some((t) => knows.includes(t)), "a clarity cue in words");

  const traits = visible(slideHtml(html, "traits"));
  for (const i of [1, 2, 3]) assert.ok(traits.includes(`NEW-LINE-${i}`));
  assert.ok(visible(slideHtml(html, "insight")).includes("NEW-INSIGHT-MINUS"), "believe minus, acted plus");
  const stings = visible(slideHtml(html, "stings"));
  assert.ok(stings.includes("OLD-STING-PEOPLE") && stings.includes("OLD-STING-LIFE") && stings.includes("OLD-TAGSTING-1") && stings.includes(C.stings.title) && !stings.includes("Only you see this"), "open book: no hiding frame");

  const calls = visible(slideHtml(html, "calls"));
  assert.ok(calls.includes("4") && calls.includes("of 6") && calls.includes(C.calls.status.hit) && calls.includes(C.calls.status.miss) && calls.includes(C.calls.status.pass));

  const share = slideHtml(html, "share");
  const card = share.slice(share.indexOf("data-card"), share.indexOf("</figure>"));
  // Round 3: the card carries the core traits as keywords (a pre-round-3 library lets the trait name stand in) with their evidence line.
  for (const t of ["Here, scroll my phone", "NEW-LINE-1", "Golden Retriever", "The Planner"]) assert.ok(card.includes(t), t);
  for (const s of ["OLD-STING-PEOPLE", "OLD-STING-LIFE", "OLD-TAGSTING-1", "NEW-READ-PEOPLE"]) assert.ok(!card.includes(s), `no ${s} on the share card`);
  assert.ok(visible(share).includes(UI_COPY.invite));

  const app = visible(slideHtml(html, "app"));
  for (const t of [C.app.title, "On the App Store", "Get MirrorMii", UI_COPY.invite, GUESS_COPY.button, UI_COPY.yourData]) assert.ok(app.includes(t), t);
  for (const t of ["Start over", "Delete my data", "Download my data"]) assert.ok(!app.includes(t), `${t} waits behind Your data`);
  const { DataSheet } = await load("/src/persona/reveal/Sheets.jsx");
  const data = visible(renderToStaticMarkup(React.createElement(DataSheet, { storageOK: true, onDownload() {}, onRestart() {}, onDelete() {} })));
  for (const t of ["Start over", "Delete my data", "Download my data"]) assert.ok(data.includes(t), t);
});

test("no quoted answers, ids, numbers, scores or system words reach the main screens", async () => {
  const { buildStories } = await load("/src/persona/stories/story-data.js");
  for (const voice of ["fun", "heart", "cards"]) {
    for (const lib of [oldLibrary(), newLibrary()]) {
      const view = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: SEALED, lib, voice, promptFor: () => "A PROMPT" });
      const html = await render(view);
      const callsAt = html.indexOf('data-story="calls"');
      const withoutCalls = callsAt < 0 ? html : html.slice(0, callsAt) + html.slice(html.indexOf("</section>", callsAt));
      const text = visible(withoutCalls);
      for (const q of QUOTES) assert.ok(!html.includes(q), `${voice}: no quoted answer ${q}`);
      assert.ok(!html.includes("GUESS-TEXT"));
      assert.ok(!/You told Genii|You'd say|Last time, you did/.test(text));
      assert.doesNotMatch(text, WORDS, voice);
      assert.doesNotMatch(text, IDS, voice);
      const SENTINEL = /\b(?:OLD|NEW|H|CALL)-[A-Z0-9-]+/g;
      assert.doesNotMatch(text.replace(SENTINEL, "").replace("40 answers in", "").replace(/Screen \d+ of \d+/, ""), /\d/, `${voice}: no numbers outside the calls`);
      assert.ok(!html.includes("We·Soft·Own"), "no type code");
    }
  }
});

test("Heart to heart reads the h variants; Make it fun and Just the cards read the defaults", async () => {
  const { buildStories, voiceOf, STORY_COPY, GUESS_COPY } = await load("/src/persona/stories/story-data.js");
  const heart = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: null, lib: newLibrary(), voice: "heart" });
  assert.deepEqual(heart.slides.map((s) => s.id), ORDER_NO_CALLS, "no calls screen without a guess check");
  const html = visible(await render(heart));
  for (const t of ["H-READ-PEOPLE", "H-READ-LIFE", "H-DESC-PEOPLE", "H-LINE-1", "H-LINE-2", "H-LINE-3", "H-INSIGHT-MINUS", "H-STING-PEOPLE", "H-STING-LIFE", "H-TAGSTING-1", STORY_COPY.heart.stings.title, STORY_COPY.heart.knows.title]) assert.ok(html.includes(t), t);
  for (const t of ["NEW-READ-PEOPLE", "NEW-LINE-1", "NEW-INSIGHT-MINUS", "OLD-STING-PEOPLE"]) assert.ok(!html.includes(t), `heart hides ${t}`);
  assert.equal(heart.slides.find((s) => s.id === "knows").findings[0].line, "H-You hold the person first.", "the clearest finding, in voice");
  assert.equal(heart.slides.find((s) => s.id === "names").hook, "H-You hold the person first.", "the plaque carries it too");
  assert.ok(!html.includes(GUESS_COPY.button), "no guess button without a guess check");

  for (const voice of ["fun", "cards"]) {
    const v = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: null, lib: newLibrary(), voice });
    const text = visible(await render(v));
    assert.ok(text.includes("NEW-READ-PEOPLE") && text.includes("NEW-LINE-1") && !text.includes("H-LINE-1"), voice);
    assert.ok(!text.includes("H-READ-PEOPLE") && !text.includes("H-LINE-1"), voice);
  }

  assert.equal(voiceOf({ voice: "heart" }), "heart");
  assert.equal(voiceOf({ voice: "cards" }), "cards");
  assert.equal(voiceOf({ delivery: "gentle" }), "fun", "today's lobby has no voice yet");
  assert.equal(voiceOf(null), "fun");
  assert.equal(voiceOf({ voice: "loud" }), "fun");
});

test("fallbacks: a library without the Build C fields still fills every screen", async () => {
  const { buildStories } = await load("/src/persona/stories/story-data.js");
  for (const voice of ["fun", "heart"]) {
    const view = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: null, lib: oldLibrary(), voice });
    const by = Object.fromEntries(view.slides.map((s) => [s.id, s]));
    assert.deepEqual(by.read.lines, ["OLD-DESC-PEOPLE", "OLD-DESC-LIFE"], `${voice}: desc stands in for read`);
    assert.deepEqual(by.read.bodies, ["", ""], `${voice}: no body repeats the line`);
    assert.deepEqual(by.traits.tags.map((t) => t.line), ["CALL-1A", "CALL-2A", "OLD-TAGHEART-3"], `${voice}: calls, then heart, stand in for line`);
    assert.equal(by.insight.line, "CALL-1B", `${voice}: no insights yet, so a call nobody has seen`);
    assert.deepEqual(by.stings.stings, ["OLD-STING-PEOPLE", "OLD-STING-LIFE", "OLD-TAGSTING-1"]);
    assert.equal(by.knows.findings[0].line, "You hold the person first.", "the axis line stands in for a missing finding line");
    for (const s of view.slides) assert.ok(JSON.stringify(s).length > 20);
  }

  // No axis split: the half fallback; no fallback either: an unused call.
  const lib = newLibrary();
  const noSplit = buildStories({ result: syntheticResult(), profile: syntheticProfile({ split: false }), lib, voice: "fun" });
  assert.equal(noSplit.slides.find((s) => s.id === "insight").line, "NEW-FALLBACK-PEOPLE");
  assert.equal(buildStories({ result: syntheticResult(), profile: syntheticProfile({ split: false }), lib, voice: "heart" }).slides.find((s) => s.id === "insight").line, "H-FALLBACK-PEOPLE");

  // Section 22 pair shape: { fun, heart } per line.
  const paired = newLibrary();
  paired.insights = { L2: { believeMinus: { fun: "PAIR-FUN", heart: "PAIR-HEART" }, believePlus: { fun: "x", heart: "y" } } };
  paired.insightFallback = { "Steady·Push·Rules": { fun: "PAIR-FALLBACK-FUN", heart: "PAIR-FALLBACK-HEART" } };
  const pick = (voice, split = true) => buildStories({ result: syntheticResult(), profile: syntheticProfile({ split }), lib: paired, voice }).slides.find((s) => s.id === "insight").line;
  assert.equal(pick("fun"), "PAIR-FUN");
  assert.equal(pick("heart"), "PAIR-HEART");
  assert.equal(pick("cards", false), "PAIR-FALLBACK-FUN", "the life half code works too");
  assert.equal(pick("heart", false), "PAIR-FALLBACK-HEART");

  // No traits at all: screen 5 says why, screen 3 still has three lines.
  const bare = buildStories({ result: { ...syntheticResult({ tags: 0 }), calls: [] }, profile: syntheticProfile({ rushed: 30, answered: 40 }), lib: oldLibrary(), voice: "fun" });
  const traits = bare.slides.find((s) => s.id === "traits");
  assert.equal(traits.tags.length, 0);
  assert.match(traits.empty, /fast/);
  assert.equal(bare.slides.find((s) => s.id === "read").lines.length, 2);
  const text = visible(await render(bare));
  assert.ok(text.includes(traits.empty));

  // A result with no profile at all still places six dots.
  const noProfile = buildStories({ result: syntheticResult(), lib: oldLibrary() });
  assert.equal(noProfile.slides.find((s) => s.id === "map").groups.flatMap((g) => g.rows).length, 6);
});

test("the map places each dot on its side: decided sides off center, flex near the middle", async () => {
  const { buildStories, dotPosition } = await load("/src/persona/stories/story-data.js");
  const rows = buildStories({ result: syntheticResult(), profile: syntheticProfile(), lib: oldLibrary() }).slides.find((s) => s.id === "map").groups.flatMap((g) => g.rows);
  const at = Object.fromEntries(rows.map((r) => [r.key, r]));
  assert.ok(at.R1.pos > 50 && at.R1.side === "right");
  assert.ok(at.R2.pos < 50 && at.R2.side === "left");
  assert.ok(at.R3.flex && at.R3.pos >= 43 && at.R3.pos <= 57);
  assert.ok(at.L2.pos >= 62, "a small lean still lands on its side");
  assert.equal(dotPosition({ unfinished: true, sign: 1 }), 50);
  assert.ok(dotPosition({ sign: -1, norm: -1 }) >= 8);
});

test("the optional guess sheet shows the guess check without answers", async () => {
  const { buildStories, GUESS_COPY } = await load("/src/persona/stories/story-data.js");
  const { GuessSheet } = await load("/src/persona/stories/StoryDeck.jsx");
  const view = buildStories({ result: syntheticResult(), profile: syntheticProfile(), sealed: SEALED, lib: oldLibrary(), promptFor: (id) => `Prompt for ${id === "C1-S1" ? "one" : "another"}` });
  const text = visible(renderToStaticMarkup(React.createElement(GuessSheet, { guesses: view.guesses })));
  assert.ok(text.includes("4 of 6"));
  assert.ok(text.includes(GUESS_COPY.status.hit) && text.includes(GUESS_COPY.status.miss) && text.includes(GUESS_COPY.status.pass));
  for (const q of QUOTES) assert.ok(!text.includes(q));
  assert.doesNotMatch(text, WORDS);
});

test("a real finished run projects into the story screens with no quoted answers", async () => {
  const { ADULT, completeRun, leaning } = await import("./persona-helpers.mjs");
  const { resultView } = await load("/src/persona/views.js");
  const Session = await load("/src/persona/session.js");
  const run = completeRun(ADULT, leaning({ R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 }), "storyrun1");
  const view = resultView(run);
  const { STORY_IDS } = await load("/src/persona/stories/story-data.js");
  const ids = view.slides.map((s) => s.id);
  assert.deepEqual(ids, STORY_IDS.filter((id) => ids.includes(id)), "in story order");
  for (const id of ["intro", "names", "read", "map", "knows", "rooms", "insight", "traits", "stings", "calls", "share", "app"]) assert.ok(ids.includes(id), id);
  const { result, profile } = Session.resultFor(run);
  const html = await render(view);
  const said = [...result.tags.flatMap((t) => t.youToldGenii.map((q) => q.said)), ...profile.splits.flatMap((s) => [s.said.text, s.did.text])];
  for (const s of said) assert.ok(!visible(html).includes(s), `no quoted answer: ${s}`);
  assert.doesNotMatch(visible(html), WORDS);
  assert.doesNotMatch(visible(html), IDS);
  const names = visible(slideHtml(html, "names"));
  for (const h of result.halves) assert.ok(names.includes(h.name));
  const card = slideHtml(html, "share");
  for (const s of result.stings) assert.ok(!card.includes(s), "no sting on the share card");
});
