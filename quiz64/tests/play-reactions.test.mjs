// Genii's between-card reactions (DESIGN-DIRECTION 5.9, 7.4 B6).
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as R from "../src/persona/reactions.js";
import * as Session from "../src/persona/session.js";
import { completeRun, ROOM_SETS, DEPTHS, lobbyFor } from "./persona-helpers.mjs";

const lib = JSON.parse(readFileSync(new URL("../../research/persona-quiz-v2/final/library.json", import.meta.url)));
const lines = R.allReactionLines();

test("reactions: 96 or more lines, 4 per emotion per voice, each at most 48 characters, no em dashes", () => {
  assert.ok(lines.length >= 96, `${lines.length} lines`);
  for (const e of R.REACTION_EMOTIONS) for (const v of ["fun", "heart"]) assert.ok(R.REACTIONS[e][v].length >= 4, `${e} ${v}`);
  assert.equal(R.REACTION_EMOTIONS.length, 12);
  for (const l of lines) {
    assert.ok(l.length <= 48, `too long: ${l}`);
    assert.ok(!l.includes("\u2014") && !l.includes("\u2013"), `dash: ${l}`);
  }
  for (const l of R.REACTIONS.delight.heart.concat(...R.REACTION_EMOTIONS.map((e) => R.REACTIONS[e].heart))) assert.ok(!l.includes("!"), `Heart to heart never shouts: ${l}`);
  assert.equal(new Set(lines).size, lines.length, "no duplicate lines");
});

test("reactions never name a tag, a type or a pole from library.json", () => {
  const poles = lib.axes.flatMap((a) => [a.plus, a.minus]);
  const names = [...lib.tags.map((t) => t.name), ...lib.relationship.map((h) => h.name), ...lib.life.map((h) => h.name)];
  for (const l of lines) {
    for (const p of poles) assert.doesNotMatch(l, new RegExp(`\\b${p}\\b`, "i"), `pole "${p}" in: ${l}`);
    for (const n of names) assert.ok(!l.toLowerCase().includes(n.toLowerCase()), `name "${n}" in: ${l}`);
    assert.doesNotMatch(l, /\b(trait|type|axis|evidence|archetype|score)\b/i, l);
  }
});

test("reactionFor: Just the cards is silent; feeling and finale cards never react; a bet card never carries one", () => {
  const bet = { id: "B", type: "bet", options: [{ t: "a", emotion: "guilt" }, { t: "b" }] };
  const plain = { id: "P", type: "scenario", options: [{ t: "a", emotion: "delight" }, { t: "b" }] };
  assert.equal(R.reactionFor({ card: bet, optionIndex: 0, voice: "cards", seed: "x", cardIndex: 3 }), null);
  assert.equal(R.reactionFor({ card: bet, optionIndex: 0, voice: "fun", seed: "x", cardIndex: 3, nextCard: { type: "feeling" } }), null);
  assert.equal(R.reactionFor({ card: bet, optionIndex: 0, voice: "fun", seed: "x", cardIndex: 3, phase: "finale" }), null);
  assert.ok(R.REACTIONS.guilt.fun.includes(R.reactionFor({ card: bet, optionIndex: 0, voice: "fun", seed: "x", cardIndex: 3, nextCard: plain })));
  assert.ok(R.REACTIONS.guilt.heart.includes(R.reactionFor({ card: bet, optionIndex: 0, voice: "heart", seed: "x", cardIndex: 3, nextCard: plain })));
  assert.ok(R.EXIT_REACTIONS.fun.includes(R.reactionFor({ card: bet, optionIndex: "skip", voice: "fun", seed: "x", cardIndex: 3 })));
  assert.ok(R.NEUTRAL_REACTIONS.fun.includes(R.reactionFor({ card: bet, optionIndex: 1, voice: "fun", seed: "x", cardIndex: 3 })));
  for (let i = 0; i < 200; i++) assert.equal(R.reactionFor({ card: plain, optionIndex: 0, voice: "fun", seed: `s${i}`, cardIndex: 5, nextCard: bet }), null, "a bet card itself shows none");
  for (let i = 0; i < 200; i++) assert.equal(R.reactionFor({ card: plain, optionIndex: 0, voice: "fun", seed: `s${i}`, cardIndex: 5, previousWasReaction: true, nextCard: plain }), null);
  // Deterministic from the seed.
  const a = R.reactionFor({ card: plain, optionIndex: 0, voice: "fun", seed: "same", cardIndex: 9, nextCard: plain });
  assert.equal(a, R.reactionFor({ card: plain, optionIndex: 0, voice: "fun", seed: "same", cardIndex: 9, nextCard: plain }));
});

// Plays a run through the real picker and replays Genii's line decisions card by card, the way the card screen does.
function reactionsOn(runId, lobby) {
  let r = 0x9e3779b9 ^ runId.length;
  for (const ch of runId) r = Math.imul(r ^ ch.charCodeAt(0), 2654435761) >>> 0;
  const rnd = () => ((r = Math.imul(r ^ (r >>> 15), 2246822507) >>> 0) / 4294967296);
  const choose = (card) => {
    const n = card.options.length;
    if (rnd() < 0.08) return { value: "skip" };
    if (card.type === "receipts") return { value: [Math.floor(rnd() * (n - 1))] };
    if (card.type === "rank") return { value: card.options.map((_, i) => i).sort(() => rnd() - 0.5) };
    if (card.type === "pick_two") { const a = Math.floor(rnd() * n); return { value: [a, (a + 1) % n] }; }
    return { value: Math.floor(rnd() * n) };
  };
  const state = completeRun(undefined, choose, runId, lobby);
  const route = Session.routeFor(state);
  const shown = [false];
  for (let i = 1; i < route.length; i++) {
    const prev = route[i - 1];
    const line = R.reactionFor({ card: prev, optionIndex: state.answers[prev.id], voice: "fun", seed: runId, cardIndex: i, previousWasReaction: shown[i - 1], nextCard: route[i], phase: "chapter" });
    shown.push(!!line);
  }
  return { route, shown };
}

test("frequency over 1,000 simulated runs: about 40%, never two in a row, always after a bet, never on feeling cards", () => {
  let cards = 0;
  let reacted = 0;
  let afterBets = 0;
  for (let k = 0; k < 1000; k++) {
    const lobby = lobbyFor(ROOM_SETS[k % ROOM_SETS.length], DEPTHS[k % 2]);
    const { route, shown } = reactionsOn(`react${k}`, lobby);
    for (let i = 0; i < route.length; i++) {
      cards++;
      if (shown[i]) reacted++;
      if (i > 0) assert.ok(!(shown[i] && shown[i - 1]), `two in a row in react${k} at ${i}`);
      if (route[i].type === "feeling" || route[i].type === "sealed") assert.ok(!shown[i], `react${k}: quiet card ${route[i].id}`);
      if (i > 0 && route[i - 1].type === "bet" && route[i].type !== "feeling") { afterBets++; assert.ok(shown[i], `react${k}: after the bet ${route[i - 1].id}`); }
    }
  }
  const rate = reacted / cards;
  assert.ok(afterBets > 100, "bets were served");
  assert.ok(rate > 0.35 && rate < 0.45, `reaction rate ${rate.toFixed(3)}`);
});
