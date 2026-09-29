import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { S, KIT, LIB, FRIEND } from "../src/persona/kit.js";
import * as Reference from "../../research/persona-quiz-v2/final/score.mjs";
import { createScorer } from "../../research/persona-quiz-v2/final/score-core.mjs";
import { stripAuthoring, AUTHORING_KEYS } from "../kit-strip.mjs";
import { canonicalJSON } from "../src/persona/sha256.js";

const dir = new URL("../../research/persona-quiz-v2/final/", import.meta.url);
const readJSON = (name) => JSON.parse(fs.readFileSync(new URL(name, dir), "utf8"));
const simAnswers = readJSON("sim-example/answers.json");
const simSealed = readJSON("sim-example/sealed-answers.json");

function randomAnswers(seed, age) {
  const r = S.rng(seed);
  const answers = { setup: { age, closest: "best_friend", pronoun: "they" }, _ms: {} };
  for (const card of S.runCards(answers.setup)) {
    const roll = r();
    if (roll < 0.08) answers[card.id] = "skip";
    else if (roll < 0.12) answers[card.id] = "not_my_life";
    else if (card.type === "pick_two") answers[card.id] = [0, 1 + Math.floor(r() * (card.options.length - 1))];
    else answers[card.id] = Math.floor(r() * card.options.length);
    answers._ms[card.id] = Math.floor(600 + r() * 5000);
  }
  return answers;
}

test("the web app scores with the reference kit's own code: identical profile, result, lock and friend deck", () => {
  for (const answers of [simAnswers, randomAnswers(11, "adult"), randomAnswers(12, "teen")]) {
    const mine = S.buildProfile(answers);
    const ref = Reference.buildProfile(answers);
    assert.equal(canonicalJSON(mine), canonicalJSON(ref));
    assert.equal(canonicalJSON(S.buildResult(mine)), canonicalJSON(Reference.buildResult(ref)));
    assert.equal(canonicalJSON(S.freezePredictions(mine)), canonicalJSON(Reference.freezePredictions(ref)));
    assert.equal(canonicalJSON(S.buildFriendDeck(mine, answers, { rel: "bestie", stings: true, seed: 5 })), canonicalJSON(Reference.buildFriendDeck(ref, answers, { rel: "bestie", stings: true, seed: 5 })));
  }
  const frozen = Reference.freezePredictions(Reference.buildProfile(simAnswers));
  assert.deepEqual(S.checkSealed(frozen, simSealed), Reference.checkSealed(frozen, simSealed));
  assert.deepEqual(S.buildResult(S.buildProfile(simAnswers)), readJSON("sim-example/result.json"));
});

test("the bundle strips authoring fields without changing a single score", () => {
  const full = createScorer({ kit: readJSON("cards.json"), lib: readJSON("library.json"), friend: readJSON("friend.json") });
  const stripped = createScorer({ kit: stripAuthoring(readJSON("cards.json")), lib: stripAuthoring(readJSON("library.json")), friend: stripAuthoring(readJSON("friend.json")) });
  for (const [i, answers] of [simAnswers, randomAnswers(21, "adult"), randomAnswers(22, "teen"), randomAnswers(23, "adult")].entries()) {
    const a = full.buildProfile(answers);
    const b = stripped.buildProfile(answers);
    assert.equal(canonicalJSON(a), canonicalJSON(b), `profile ${i}`);
    assert.equal(canonicalJSON(full.buildResult(a)), canonicalJSON(stripped.buildResult(b)));
    for (const rel of ["partner", "crush", "friendOrCoworker", "bestie"]) {
      assert.equal(canonicalJSON(full.buildFriendDeck(a, answers, { rel, seed: i })), canonicalJSON(stripped.buildFriendDeck(b, answers, { rel, seed: i })), rel);
    }
  }
  const text = JSON.stringify(stripAuthoring(readJSON("cards.json")));
  for (const key of AUTHORING_KEYS) assert.ok(!text.includes(`"${key}":`), key);
  assert.ok(!/looks like .*; measures/.test(text));
});

test("kit shape the app relies on: seven chapters, eight finale cards, twelve extras, friend content", () => {
  assert.equal(KIT.chapters.length, 7);
  assert.equal(KIT.finale.length, 8);
  assert.equal(KIT.extras.length, 12);
  assert.deepEqual(LIB.axes.map((a) => a.id), ["R1", "R2", "R3", "L1", "L2", "L3"]);
  for (const set of Object.values(FRIEND.level1.questions)) assert.deepEqual(set.map((q) => q.axis), ["R1", "R2", "R3", "L1", "L2", "L3"]);
  for (const card of S.allCards) for (const exit of card.exits) assert.ok(["skip", "not_my_life", "no_recent"].includes(exit));
  for (const card of S.allCards) if (card.exits.includes("no_recent")) assert.equal(card.type, "real");
});
