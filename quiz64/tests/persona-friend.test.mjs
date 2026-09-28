import test from "node:test";
import assert from "node:assert/strict";
import * as Session from "../src/persona/session.js";
import * as Friend from "../src/persona/friend.js";
import { decodePayload, encodePayload, readHash, linkFor, LinkError, MAX_PAYLOAD } from "../src/persona/links.js";
import { S, TAG, FRIEND, KIT_ID } from "../src/persona/kit.js";
import { restoreRun } from "../src/persona/store.js";
import { ADULT, TEEN, clock, completeRun, leaning } from "./persona-helpers.mjs";

const consistent = leaning({ R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 });
const owner = completeRun(ADULT, consistent, "friendown1");
const teenOwner = completeRun(TEEN, consistent, "friendteen");

function challenge(state, input, id = "chal000001", seed = 42) {
  return Friend.createChallenge(state, input, { now: clock(), id, seed });
}

const perfectGuesses = (view) => ({
  level1: Object.fromEntries(view.level1.map((q) => [q.axis, q.truth])),
  level2: Object.fromEntries(view.level2.cards.map((c) => [c.id, c.answer])),
  why: {},
  level3: view.level3.cards.filter((c) => c.role === "true").map((c) => c.id),
  level4: view.level4 ? { sting: view.level4.stingPick.lines.find((l) => l.true).tag, roast: view.level4.pickTheRoast.lines[0].id } : null,
});
const wrongGuesses = (view) => ({
  level1: Object.fromEntries(view.level1.map((q) => [q.axis, -q.truth])),
  level2: Object.fromEntries(view.level2.cards.map((c) => [c.id, c.answer === "a" ? "b" : "a"])),
  why: Object.fromEntries(view.level2.cards.map((c) => [c.id, "gut"])),
  level3: view.level3.cards.filter((c) => c.role === "opposite").map((c) => c.id),
  level4: view.level4 ? { sting: view.level4.stingPick.lines.find((l) => !l.true).tag, roast: null } : null,
});

test("a challenge link carries ids and the answer key only: no answer text, stings, research or scores", () => {
  for (const rel of ["partner", "crush", "friendOrCoworker", "bestie"]) {
    const { state, challenge: ch } = challenge(owner, { rel, stings: true, name: "Alex" });
    const body = Friend.challengeBody(state, ch);
    const json = JSON.stringify(body);
    assert.deepEqual(Object.keys(body).sort(), ["a", "b", "c", "d", "e", "i", "k", "n", "o", "p", "r", "s", "v", "w"].sort());
    const { result, profile } = Session.resultFor(state);
    for (const t of result.tags) assert.ok(!json.includes(t.sting), "no sting text");
    for (const id of Object.keys(state.answers)) {
      const card = S.cardById[id];
      if (!card) continue;
      for (const o of card.options) if (o.t.length > 12) assert.ok(!json.includes(o.t), `no answer text from ${id}`);
    }
    for (const word of ["said", "research", "net", "support", "evidence", "ms", "circumstance", "profile", "mask"]) assert.ok(!json.includes(`"${word}"`), word);
    assert.ok(!json.includes(String(profile.axes.R1.score)) || profile.axes.R1.score === 0 || Math.abs(profile.axes.R1.score) === 1);
    if (rel !== "bestie") assert.equal(body.d, null, "sting round is bestie only");
    const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
    assert.equal(parsed.rel, rel);
    assert.equal(parsed.name, "Alex");
    if (rel === "friendOrCoworker") {
      assert.equal(parsed.love, false);
      for (const id of parsed.level3 ? parsed.level3.cards : []) assert.ok(!FRIEND.relationships.tagPairGroups.love.pairs.includes(id.slice(0, 3)));
      for (const row of parsed.level2) assert.equal(((FRIEND.level2.cards[row.id] || {}).level || "everyday"), "everyday");
    }
  }
});

test("level 2 never uses private, locked, rushed, circumstance or depends answers", () => {
  const { state, challenge: ch } = challenge(owner, { rel: "bestie" });
  const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
  for (const { id } of parsed.level2) {
    const card = S.cardById[id];
    assert.equal(card.privacy, "normal");
    const a = state.answers[id];
    assert.ok(Number.isInteger(a) || Array.isArray(a));
    for (const i of [a].flat()) assert.ok(!card.options[i].circumstance && !card.options[i].depends);
    assert.ok(state.ms[id] >= 1500);
  }
});

test("teen owner: no marriage and kids switch, no 18+ tags in any round", () => {
  assert.equal(Friend.toggleOptions("partner", TEEN).mk, null);
  const { state, challenge: ch } = challenge(teenOwner, { rel: "bestie", mk: true, stings: true });
  assert.equal(ch.mk, false);
  const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
  for (const id of [...(parsed.level3 ? parsed.level3.cards : []), ...(parsed.level4 ? parsed.level4.lines : [])]) assert.ok(!TAG[id].locked18, id);
});

test("friend plays perfectly and badly; the friend sees counts only; the owner's view matches", () => {
  const { state, challenge: ch } = challenge(owner, { rel: "bestie", stings: true, name: "Alex" });
  const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
  const view = Friend.friendDeckView(parsed);
  assert.equal(view.level1.length, 6);
  assert.deepEqual(view.level1.map((q) => q.axis), ["R1", "R2", "R3", "L1", "L2", "L3"]);

  const good = Friend.cleanGuesses(view, perfectGuesses(view));
  assert.ok(Friend.guessesComplete(view, good));
  const friendSide = Friend.friendSafeResult(parsed, view, good);
  assert.deepEqual(Object.keys(friendSide).sort(), ["N", "countsLine", "guessedType", "scoreLine", "total", "typeLine", "x", "y", "yourTurn", "z"].sort());
  assert.equal(friendSide.x, 6);
  assert.equal(friendSide.y, view.level2.cards.length);
  assert.equal(friendSide.z, view.level3.N);
  assert.match(friendSide.scoreLine, /^You read 6\/6 sides of Alex\./);
  assert.ok(!JSON.stringify(friendSide).includes("sting"));

  const reply = Friend.replyPayload(parsed, view, good);
  const imported = Friend.importReply(state, reply, { now: clock() });
  const ownerView = Friend.ownerFriendView(imported.state, ch.id);
  assert.equal(ownerView.x, friendSide.x);
  assert.equal(ownerView.score.level2.y, friendSide.y);
  assert.equal(ownerView.score.level3.z, friendSide.z);
  assert.match(ownerView.comparison, /Bestie 🐸 guessed your exact type/);
  assert.equal(ownerView.zones.dontSee.items.length, 0);
  assert.match(ownerView.level4.sting, /picked the exact line/);

  const bad = Friend.cleanGuesses(view, wrongGuesses(view));
  const badSide = Friend.friendSafeResult(parsed, view, bad);
  assert.equal(badSide.x, 0);
  const again = Friend.importReply(imported.state, Friend.replyPayload(parsed, view, bad), { now: clock() });
  assert.equal(again.state.friendResults.length, 1, "a second reply to one link replaces the first");
  const badView = Friend.ownerFriendView(again.state, ch.id);
  assert.match(badView.band, /pictures someone pretty different/);
  assert.equal(badView.zones.thinkYouAre.items.length, view.level3.N);
  assert.equal(badView.zones.dontSee.items.length, view.level3.N);
  assert.ok(badView.biggestMiss && /bet on/.test(badView.biggestMiss.line));
  assert.match(badView.biggestMiss.reason, /Pure gut/);
  assert.match(badView.level4.sting, /It's actually/);

  const restored = restoreRun(Session.serialize(again.state));
  assert.equal(Friend.ownerFriendView(restored, ch.id).band, badView.band);
});

test("marriage and kids opt-in: an under-18 friend gets the version without those tags", () => {
  const { state, challenge: ch } = challenge(owner, { rel: "partner", mk: true, love: true });
  const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
  assert.equal(parsed.mk, true);
  const young = Friend.friendDeckView(parsed, { under18: true });
  for (const c of young.level3.cards) assert.ok(!TAG[c.id].locked18, c.id);
  const g = Friend.cleanGuesses(young, perfectGuesses(young));
  const imported = Friend.importReply(state, Friend.replyPayload(parsed, young, g, { under18: true }), { now: clock() });
  assert.equal(imported.state.friendResults[0].under18, true);
  assert.equal(Friend.ownerFriendView(imported.state, ch.id).score.level3.z, young.level3.N);
});

test("ranking: two played links, best reader first, owner only", () => {
  let s = owner;
  const made = [];
  for (const [i, rel] of ["bestie", "partner"].entries()) {
    const r = challenge(s, { rel }, `rankchal0${i}`, 7 + i);
    s = r.state;
    made.push(r.challenge);
  }
  const play = (ch, good) => { const parsed = Friend.parseChallenge(Friend.challengePayload(s, ch)); const view = Friend.friendDeckView(parsed); return Friend.replyPayload(parsed, view, Friend.cleanGuesses(view, good ? perfectGuesses(view) : wrongGuesses(view))); };
  s = Friend.importReply(s, play(made[0], false), { now: clock() }).state;
  s = Friend.importReply(s, play(made[1], true), { now: clock() }).state;
  const rank = Friend.ranking(s);
  assert.equal(rank.unlocked, true);
  assert.match(rank.rows[0].line, /^1\. Partner/);
});

test("malformed, tampered and foreign links are rejected with a readable reason", () => {
  const { state, challenge: ch } = challenge(owner, { rel: "bestie", stings: true });
  const good = Friend.challengePayload(state, ch);
  const body = Friend.challengeBody(state, ch);
  const rejects = (raw, code) => assert.throws(() => Friend.parseChallenge(raw), (e) => e instanceof LinkError && (!code || e.code === code) && typeof e.message === "string" && e.message.length > 5);
  rejects("", "missing");
  rejects(good.slice(0, -3), "malformed");
  rejects(good.slice(0, 40) + good.slice(41), undefined);
  rejects(`${good.split(".")[0]}.00000000`, "checksum");
  rejects("x".repeat(MAX_PAYLOAD + 1), "too_long");
  rejects("<script>alert(1)</script>.abcdef12", "malformed");
  rejects(encodePayload([1, 2, 3]), "malformed");
  const mutate = (fn) => { const copy = structuredClone(body); fn(copy); return encodePayload(copy); };
  rejects(mutate((b) => { b.k = "persona-quiz-v1@old"; }), "kit_changed");
  rejects(mutate((b) => { b.v = 2; }), "version");
  rejects(mutate((b) => { b.x = "extra"; }), "invalid");
  rejects(mutate((b) => { b.n = "<img src=x onerror=alert(1)>"; }), "invalid");
  rejects(mutate((b) => { b.r = "boss"; }), "invalid");
  rejects(mutate((b) => { b.b[0][0] = "C3-8"; }), "invalid");
  rejects(mutate((b) => { b.b[0][0] = "C3-7"; }), "invalid");
  rejects(mutate((b) => { b.b[0][1] = "c"; }), "invalid");
  rejects(mutate((b) => { b.b = b.b.slice(0, 3); }), "invalid");
  rejects(mutate((b) => { b.c.t = b.c.t.slice(1); }), "invalid");
  rejects(mutate((b) => { b.c.d[0] = "T11A"; }), "invalid");
  rejects(mutate((b) => { b.d = null; }), "invalid");
  rejects(mutate((b) => { b.d.r.push("R99"); }), "invalid");
  rejects(mutate((b) => { b.o[1] = 1; }), "invalid");
  rejects(mutate((b) => { b.a[0] = [0, 0]; }), "invalid");
  const ownRejects = mutate((b) => { b.r = "friendOrCoworker"; b.d = null; b.o = [1, 0, 0, 1]; });
  rejects(ownRejects, "invalid");

  const parsed = Friend.parseChallenge(good);
  const view = Friend.friendDeckView(parsed);
  const reply = Friend.replyPayload(parsed, view, Friend.cleanGuesses(view, perfectGuesses(view)));
  const replyBody = decodePayload(reply);
  const replyRejects = (raw, code) => assert.throws(() => Friend.importReply(state, raw, { now: clock() }), (e) => e instanceof LinkError && (!code || e.code === code));
  replyRejects(reply.slice(0, -1), "malformed");
  replyRejects(encodePayload({ ...replyBody, i: "zzzzzzzzzz" }), "unknown_challenge");
  replyRejects(encodePayload({ ...replyBody, a: [1, 1, 1, 1, 1, 2] }), "invalid");
  replyRejects(encodePayload({ ...replyBody, b: [["C3-8", "a", ""]] }), "invalid");
  replyRejects(encodePayload({ ...replyBody, c: ["T99A"] }), "invalid");
  replyRejects(encodePayload({ ...replyBody, c: [TAG[replyBody.c[0]].pair === replyBody.c[1] ? "T01A" : Object.keys(TAG).find((id) => !view.level3.cards.some((c) => c.id === id))] }), "invalid");
  replyRejects(encodePayload({ ...replyBody, b: [...replyBody.b, ["C2-3", "a", "hacked"]] }), "invalid");
  replyRejects(encodePayload({ ...replyBody, k: "other" }), "kit_changed");

  assert.deepEqual(readHash("https://x.test/index.html#play=abc.12345678"), { kind: "play", payload: "abc.12345678" });
  assert.deepEqual(readHash("#reply=abc.12345678"), { kind: "reply", payload: "abc.12345678" });
  assert.equal(readHash("#elsewhere"), null);
  assert.equal(linkFor("play", "p.1", "http://127.0.0.1/"), "http://127.0.0.1/#play=p.1");
  assert.ok(KIT_ID);
});

test("names: letters only, 24 characters; without one the lines still read naturally", () => {
  assert.equal(Friend.cleanName("  Zoë  Marie-Claire "), "Zoë Marie-Claire");
  assert.throws(() => Friend.cleanName("<b>x</b>"), { code: "bad_name" });
  assert.throws(() => Friend.cleanName("a".repeat(25)), { code: "bad_name" });
  assert.throws(() => Friend.cleanName("http://spam.example"), { code: "bad_name" });
  assert.equal(Friend.fillOwner("{name} only has 2 tags. Ask {them}.", { pronoun: "she", name: "" }), "Your friend only has 2 tags. Ask her.");
  assert.equal(Friend.fillOwner("You're guessing {name}'s choices.", { pronoun: "he", name: "" }), "You're guessing your friend's choices.");
  assert.equal(Friend.fillOwner("{Their} call, {name}.", { pronoun: "they", name: "Sam" }), "Their call, Sam.");
});

test("an owner with no named tags (all rushed) still gets a working friend game without an invented tag round", () => {
  const rushed = completeRun(ADULT, (card) => ({ value: card.type === "pick_two" ? [0, 1] : 0, ms: 800 }), "rushowner1");
  assert.equal(Session.resultFor(rushed).result.tags.length, 0);
  const { state, challenge: ch } = challenge(rushed, { rel: "bestie", stings: true }, "rushchal01", 9);
  const parsed = Friend.parseChallenge(Friend.challengePayload(state, ch));
  assert.equal(parsed.level3, null);
  assert.equal(parsed.level2.length, 0, "rushed answers never become level 2 cards");
  const view = Friend.friendDeckView(parsed);
  assert.equal(view.level3.skipped, true);
  assert.equal(view.level4.stingPick, null);
  const g = Friend.cleanGuesses(view, { level1: Object.fromEntries(view.level1.map((q) => [q.axis, q.truth])), level4: { roast: view.level4.pickTheRoast.lines[0].id } });
  assert.ok(Friend.guessesComplete(view, g));
  const imported = Friend.importReply(state, Friend.replyPayload(parsed, view, g), { now: clock() });
  const ownerView = Friend.ownerFriendView(imported.state, ch.id);
  assert.equal(ownerView.x, 6);
  assert.equal(ownerView.level3Line, null);
});
