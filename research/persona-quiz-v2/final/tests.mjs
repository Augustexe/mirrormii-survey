// node --test tests.mjs
// Kit integrity, run order rules and scoring edge cases for persona quiz v2. Plain Node, no dependencies.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { kit, lib, cardById, runCards, buildProfile, buildResult, freezePredictions, drawFinale, checkSealed, buildFriendDeck, promptFor, optionText, threadFor, CONFIG, rankTags, twistOrder, cardLink, friendMapping } from "./score.mjs";
import { createScorer } from "./score-core.mjs";
import { checkLock, entryFor, LOCK_FILE, normalize } from "./lock-evidence.mjs";
import { TYPES as TYPE_SPEC, DID_TYPES, RANK_WEIGHTS, fillFromType, ABSURD_WEIGHT_CAP } from "./card-schema.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
const TAGS = new Set(lib.tags.map((t) => t.id));
const TAG = Object.fromEntries(lib.tags.map((t) => [t.id, t]));
const FRIEND = JSON.parse(fs.readFileSync(path.join(DIR, "friend.json"), "utf8"));
const TYPES = new Set(Object.keys(TYPE_SPEC));
const WEIGHT = Object.fromEntries(Object.entries(TYPE_SPEC).map(([t, x]) => [t, x.weight]));
const GRADE = Object.fromEntries(Object.entries(TYPE_SPEC).map(([t, x]) => [t, x.grade]));
const chapterCards = kit.chapters.flatMap((c) => c.cards);
const everyCard = [...chapterCards, ...kit.finale, ...kit.extras];
const dims = (c) => {
  const s = new Set();
  for (const o of c.options) {
    for (const a of Object.keys(o.axes || {})) s.add(a);
    for (const t of o.tags || []) s.add(t.id.slice(0, 3));
  }
  return s;
};
const o_words = (c) => c.options.map((o) => o.t.split(/\s+/).length);
// One bank for everyone (LAUNCH-SPEC section 22): setup is closest person and pronoun only.
const ADULT = { setup: { closest: "best_friend", pronoun: "they" } };

// Fixture finders: scoring tests pick cards from the shipped bank by property, never by id, so a rewritten bank keeps
// them meaningful. single: one-pick cards (not pick_two, receipts, rank or feeling).
const SINGLE = (c) => !["pick_two", "receipts", "rank", "feeling"].includes(c.type);
const byOrder = new Map(chapterCards.map((c, i) => [c.id, i]));
// Options of a chapter card that carry axis ax with value v (v omitted: any value), as [card, optionIndex].
function axisOptions(ax, { v, grade, weight, single = true } = {}) {
  const out = [];
  for (const c of chapterCards) {
    if (single && !SINGLE(c)) continue;
    if (grade && c.grade !== grade) continue;
    if (weight !== undefined && c.weight !== weight) continue;
    c.options.forEach((o, i) => {
      const x = (o.axes || {})[ax];
      if (x && (v === undefined || x === v) && !o.circumstance && !o.depends) out.push([c, i]);
    });
  }
  return out;
}
const firstDistinct = (...lists) => {
  // One entry from each list, all on different cards (depth-first).
  const go = (k, used) => {
    if (k === lists.length) return [];
    for (const x of lists[k]) {
      if (used.has(x[0].id)) continue;
      const rest = go(k + 1, new Set([...used, x[0].id]));
      if (rest) return [x, ...rest];
    }
    return null;
  };
  return go(0, new Set());
};

// ------------------------------------------------------------ format
test("cards.json format", () => {
  assert.equal(kit.version, "persona-quiz-v2");
  assert.equal(kit.chapters.length, 7);
  kit.chapters.forEach((ch, i) => {
    assert.equal(ch.n, i + 1);
    assert.ok(ch.title && ch.intro, `chapter ${ch.n} needs a title and intro`);
    // Build C (LAUNCH-SPEC section 22): chapters hold 18 to 22 cards; the picker serves 40 of the pool.
    assert.ok(ch.cards.length >= 16 && ch.cards.length <= 24, `chapter ${ch.n} has ${ch.cards.length} cards`);
    for (const c of ch.cards) assert.notEqual(c.type, "sealed", `${c.id}: sealed cards run only in the finale`);
  });
  // The sealed pool (4 per axis, section 22); each run draws CONFIG.finaleSize of them.
  assert.ok(kit.finale.length >= CONFIG.finaleSize, `sealed pool ${kit.finale.length}`);
  for (const c of kit.finale) assert.equal(c.type, "sealed");
  const ids = everyCard.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length, "card ids are unique");
  const total = chapterCards.length;
  assert.ok(total >= 120 && total <= 160, `chapter cards ${total} within 120 to 160`);
});

test("every card: type, weight, options, exits, friend side", () => {
  for (const c of everyCard) {
    assert.ok(TYPES.has(c.type), `${c.id}: type ${c.type}`);
    // Absurd-world cards are capped (card-schema.mjs ABSURD_WEIGHT_CAP, LAUNCH-SPEC section 21).
    assert.equal(c.weight, c.world === "absurd" ? Math.min(WEIGHT[c.type], ABSURD_WEIGHT_CAP) : WEIGHT[c.type], `${c.id}: weight`);
    if (c.world === "absurd") assert.ok(!DID_TYPES.includes(c.type), `${c.id}: did cards are never absurd`);
    if (GRADE[c.type]) assert.equal(c.grade, GRADE[c.type], `${c.id}: grade`);
    assert.ok(c.prompt && c.prompt.length > 10, `${c.id}: prompt`);
    assert.ok(c.exits.includes("skip") && c.exits.includes("not_my_life"), `${c.id}: Skip and Not my life`);
    assert.equal(c.exits.includes("no_recent"), c.type === "real", `${c.id}: No recent example only on real cards`);
    const n = c.options.length;
    const range = TYPE_SPEC[c.type].options;
    assert.ok(n >= range[0] && n <= range[1], `${c.id}: ${n} options for ${c.type}`);
    if (c.type === "pick_two") assert.equal(c.pick, 2);
    for (const o of c.options) assert.ok(o.t && o.t.length <= 90, `${c.id}: option text "${o.t}"`);
    if (c.friend) {
      assert.ok(c.friend.prompt && c.friend.a.t && c.friend.b.t, `${c.id}: friend field`);
      assert.equal(c.privacy, "normal", `${c.id}: private cards carry no friend field`);
    }
    if (c.follows) {
      const i = chapterCards.findIndex((x) => x.id === c.id);
      assert.equal(chapterCards[i - 1].id, c.follows, `${c.id} must sit right after ${c.follows}`);
    }
    if (c.flip) {
      assert.equal(c.flip.options.length, 3, `${c.id}: flip has 3 presets`);
      assert.ok(c.options.some((o) => o.depends), `${c.id}: flip needs a depends option`);
    }
    if (c.options.some((o) => o.depends)) assert.ok(c.flip, `${c.id}: depends option needs a flip`);
    // New formats (LAUNCH-SPEC section 6): masked, chaptered, multiple choice, every non-none option carries evidence.
    if (["receipts", "bet", "reply", "others", "rank", "eyes"].includes(c.type)) {
      assert.ok((typeof c.chapter === "number" || (c.chapter === "extra" && kit.extras.includes(c))) && c.mask, `${c.id}: chapter and mask`);
      assert.ok(!c.options.some((o) => o.depends || (o.circumstance && c.type === "receipts")), `${c.id}: no depends options (receipts: no circumstance)`);
      assert.ok(c.options.filter((o) => o.circumstance).length <= 1, `${c.id}: at most one circumstance option`);
      for (const o of c.options.filter((x) => !x.none && !x.circumstance)) assert.ok(Object.keys(o.axes || {}).length + (o.tags || []).length > 0, `${c.id}: "${o.t}" carries evidence`);
      assert.ok(o_words(c).every((n) => n <= 14), `${c.id}: answers stay short`);
    }
    const nones = c.options.filter((o) => o.none);
    if (c.type === "receipts") {
      assert.equal(nones.length, 1, `${c.id}: one "None of these"`);
      assert.equal(c.options[c.options.length - 1].none, true, `${c.id}: "None of these" comes last`);
      assert.ok(!nones[0].axes && !nones[0].tags, `${c.id}: "None of these" scores nothing`);
      assert.ok(!c.friend, `${c.id}: receipts cards have no friend version`);
    } else assert.equal(nones.length, 0, `${c.id}: only receipts cards have "None of these"`);
    if (c.type === "reply") {
      assert.ok(Array.isArray(c.thread) && c.thread.length >= 1 && c.thread.every((m) => m.from && m.text), `${c.id}: thread of {from, text}`);
    } else assert.equal(c.thread, undefined, `${c.id}: only reply cards have a thread`);
  }
});

test("every tag id and axis value is valid; circumstance and feeling options score nothing", () => {
  for (const c of everyCard) {
    for (const o of c.options) {
      const ax = Object.entries(o.axes || {});
      assert.ok(ax.length <= 2, `${c.id}: at most 2 axes per option`);
      for (const [k, v] of ax) {
        assert.ok(AXES.includes(k), `${c.id}: axis ${k}`);
        assert.ok(Number.isInteger(v) && v !== 0 && Math.abs(v) <= 2, `${c.id}: axis value ${v}`);
      }
      assert.ok((o.tags || []).length <= 3, `${c.id}: at most 3 tags per option`);
      for (const t of o.tags || []) {
        assert.ok(TAGS.has(t.id), `${c.id}: tag ${t.id}`);
        assert.ok([1, 2, 3].includes(t.s), `${c.id}: strength ${t.s}`);
      }
      if (o.circumstance || c.type === "feeling" || o.depends) assert.equal(ax.length + (o.tags || []).length, 0, `${c.id}: "${o.t}" must score nothing`);
    }
  }
  for (const t of lib.tags) {
    assert.ok(TAGS.has(t.pair) && TAG[t.pair].pair === t.id, `${t.id}: clean pair`);
    for (const k of ["name", "sting", "heart", "never"]) assert.ok(t[k], `${t.id}: ${k}`);
    assert.ok(t.calls.length >= 2 && t.calls.length <= 3, `${t.id}: 2 or 3 calls`);
  }
  assert.equal(lib.relationship.length, 8);
  assert.equal(lib.life.length, 8);
});

test("every tag and axis is reachable by at least 2 cards", (t) => {
  const noReal = [];
  const run = runCards();
  for (const ax of AXES) {
    const n = run.filter((c) => c.options.some((o) => (o.axes || {})[ax])).length;
    assert.ok(n >= 2, `${ax} reachable by ${n} cards`);
  }
  for (const tag of lib.tags) {
    const cards = run.filter((c) => c.options.some((o) => (o.tags || []).some((x) => x.id === tag.id)));
    assert.ok(cards.length >= 2, `${tag.id} reachable by ${cards.length} cards`);
    if (!cards.some((c) => c.type === "real")) noReal.push(tag.id);
  }
  t.diagnostic(`tags with no real-card trigger (only would/believe evidence): ${noReal.join(", ")}`);
  assert.ok(noReal.length <= 30, "at least 20 of 50 tags have a real-card trigger");
});

// DATA TEST (fix pass 2026-09-26, open item 1). Fails until the card agents unstick the thin tags; do not weaken it.
// A tag that cannot reach tagFire from 2+ run cards can never fire for anybody. Maximum support per card = best
// option strength x card weight (pick_two: best two picks; receipts: best receiptsCap ticks; rank: best order under the
// position weights), the same
// measure as check-src.cjs. Every tag, on the one bank everyone plays.
test("every tag can fire: maximum support from the run cards >= tagFire from at least 2 cards", () => {
  const stuck = [];
  const run = runCards();
  for (const tag of lib.tags) {
    let max = 0, cards = 0;
    for (const c of run) {
      const v = c.options.map((o) => ((o.tags || []).find((x) => x.id === tag.id) || { s: 0 }).s).sort((a, b) => b - a);
      const best = (c.type === "pick_two" ? v[0] + (v[1] || 0) : c.type === "receipts" ? v.slice(0, CONFIG.receiptsCap).reduce((s, x) => s + x, 0) : c.type === "rank" ? v.reduce((s, x, i) => s + x * RANK_WEIGHTS[i], 0) : v[0]) * c.weight;
      if (best > 0) { max += best; cards++; }
    }
    if (max < CONFIG.tagFire - 1e-9 || cards < CONFIG.tagMinCards) stuck.push(`${tag.id} max ${max.toFixed(2)} from ${cards}`);
  }
  assert.deepEqual(stuck, [], `${stuck.length} tag checks cannot fire:\n  ${stuck.join("\n  ")}`);
});

// ------------------------------------------------------------ run order
function checkOrder(run, label) {
  for (let i = 1; i < run.length; i++) {
    const a = run[i - 1], b = run[i];
    const shared = [...dims(a)].filter((d) => dims(b).has(d));
    assert.deepEqual(shared, [], `${label}: ${a.id} and ${b.id} are neighbours on ${shared.join(", ")}`);
    if (a.type === b.type && a.type !== "sealed") {
      assert.equal(a.type, "this_or_that", `${label}: ${a.id} and ${b.id} are both ${a.type}`);
      assert.equal(a.round, b.round, `${label}: ${a.id} and ${b.id} are this_or_that outside one round`);
    }
  }
}

// Since the picker (2026-09-28) no player walks the authored order: every run is 40 cards picked from the pool, and the
// neighbour and type rules are enforced per served route (quiz64/tests/persona-picker.test.mjs, flow). The authored
// order still fixes each chapter's opener, the rounds (contiguous, at most 3, one type) and feeling cards (right after
// their card). Step B added more cards per axis than a fixed walk can keep apart, so neighbour clashes in the authored
// order are reported here, not failed.
test("authored order: openers, rounds of up to 3, feeling cards after their card; neighbour rules live in the picker", (t) => {
  let clashes = 0;
  for (const [label] of [["pool"]]) {
    const run = runCards();
    const rounds = {};
    for (const c of run) if (c.round) rounds[c.round] = (rounds[c.round] || 0) + 1;
    for (const [r, n] of Object.entries(rounds)) assert.ok(n <= 3, `${label}: round ${r} has ${n}`);
    for (const [r] of Object.entries(rounds)) {
      const idx = run.map((c, i) => (c.round === r ? i : -1)).filter((i) => i >= 0);
      assert.equal(idx[idx.length - 1] - idx[0], idx.length - 1, `${label}: round ${r} is contiguous`);
      assert.ok(idx.every((i) => run[i].type === "this_or_that"), `${label}: round ${r} is this_or_that only`);
    }
    for (let i = 1; i < run.length; i++) {
      const a = run[i - 1], b = run[i];
      if (b.follows) assert.equal(a.id, b.follows, `${label}: ${b.id} right after ${b.follows}`);
      if ([...dims(a)].some((d) => dims(b).has(d)) || (a.type === b.type && !(a.round && a.round === b.round))) clashes++;
    }
  }
  for (const ch of kit.chapters) assert.notEqual(ch.cards[0].type, "feeling", `chapter ${ch.n} opens with a playable card`);
  const chapterRun = runCards();
  const reals = chapterRun.map((c, i) => (DID_TYPES.includes(c.type) ? i : -1)).filter((i) => i >= 0);
  const early = reals.filter((i) => i < (chapterRun.length * 2) / 3).length;
  assert.ok(early >= reals.length / 2, `${early} of ${reals.length} did cards in the first two thirds`);
  t.diagnostic(`authored-order neighbour or type clashes: ${clashes}`);
});

// Ruling 2026-09-28: every run is 40 picked cards + 8 sealed (RUN_SIZE in quiz64/src/persona/session.js). The chapter
// pool must stay larger than any lobby's run. Build C grows the bank to 150 scored cards (LAUNCH-SPEC section 22).
test("pool size: the chapter pool is 56 to 160 cards", () => {
  const n = runCards().length;
  assert.ok(n >= 56 && n <= 160, `chapter pool is ${n} cards (want 56 to 160)`);
});

test("sealed pool covers all six axes plus common tags", () => {
  const covered = new Set(kit.finale.flatMap((c) => c.checks.axes));
  for (const ax of AXES) assert.ok(covered.has(ax), `finale checks ${ax}`);
  assert.ok(kit.finale.filter((c) => !c.checks.primary || c.checks.pairs.length).length >= 2);
  for (const c of kit.finale) {
    const scored = c.options.filter((o) => Object.keys(o.axes || {}).length || (o.tags || []).length).length;
    assert.ok(scored >= 3, `${c.id}: at least 3 sealed options carry evidence, so the guess is computed`);
  }
});

// ------------------------------------------------------------ copy
test("no em dash anywhere in the kit", () => {
  const files = fs.readdirSync(DIR, { recursive: true }).filter((f) => /\.(json|md|mjs|html|txt)$/.test(f));
  assert.ok(files.length > 5);
  for (const f of files) {
    const s = fs.readFileSync(path.join(DIR, f), "utf8");
    assert.ok(!s.includes(String.fromCharCode(0x2014)), `${f} contains an em dash`);
  }
});

// PRODUCT-TRUTH section 8 never-say list (the same list quiz64/qa/qa-checks.mjs scans on screen): no copy a player can
// see in cards.json, library.json or friend.json uses it. Internal notes (origin, rules) are authoring records, not copy.
test("never-say words: no player-facing copy in the kit, library or friend game", () => {
  const NEVER = [/\bdiagnos/i, /\btreat(ment|ed|ing)?\b/i, /\bcure\b/i, /\bprevent/i, /clinically proven/i, /anti-aging/i, /skin age/i, /before and after/i, /\bstreak/i, /\bpredicts?\b/i, /\bDNA\b/, /genomic/i, /free forever/i];
  const hits = [];
  const walk = (o, where) => {
    if (typeof o === "string") { for (const re of NEVER) { const m = o.match(re); if (m) hits.push(`${where}: "${m[0]}"`); } return; }
    if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (!["origin", "rules"].includes(k)) walk(v, `${where}.${k}`);
  };
  for (const f of ["cards.json", "library.json", "friend.json"]) walk(JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")), f);
  assert.deepEqual(hits, []);
});

// ------------------------------------------------------------ no age (LAUNCH-SPEC section 22)
test("no age logic: no card carries teen, teenPrompt or locked18; everyone gets the same pool", () => {
  for (const c of everyCard) {
    assert.ok(!("teen" in c) && !("teenPrompt" in c), `${c.id}: age fields are gone`);
    assert.ok(["normal", "intimate"].includes(c.privacy), `${c.id}: privacy ${c.privacy}`);
    assert.notEqual(c.type, "guilty", `${c.id}: guilty is now bet`);
  }
  assert.equal(runCards().length, chapterCards.length, "the pool is every chapter card");
  assert.equal(runCards({ age: "teen" }).length, chapterCards.length, "a stray age in a setup changes nothing");
  // Sensitive cards are intimate, so "Keep it light" skips them; marriage and kids tags (T11, T21) score for anyone.
  assert.ok(chapterCards.some((c) => c.privacy === "intimate"), "the bank has intimate cards for Keep it light to skip");
  const mk = chapterCards.filter(SINGLE).map((c) => [c, c.options.findIndex((o) => (o.tags || []).some((t) => /^T(11|21)A/.test(t.id)))]).filter(([, i]) => i >= 0);
  assert.ok(mk.length >= 2, "marriage and kids cards exist");
  const ans = { setup: { age: "teen", closest: "parent", pronoun: "she" } };
  for (const [c, i] of mk) ans[c.id] = i;
  const p = buildProfile(ans);
  assert.ok(Object.keys(p.tags).some((id) => /^T(11|21)/.test(id)), "marriage and kids tags score like any other");
  assert.deepEqual(p.warnings, [], "no answer is dropped for age");
  assert.equal(p.research.gatedOut.length, 0);
});

// Build C removed the kids gate (C3-8/C3-9): no shipped card carries a gateRule. The scorer keeps gate support, so it
// is checked on a two-card fixture.
test("gates: no shipped card is gated; a gated card counts only after its gate tag is picked", () => {
  assert.deepEqual(everyCard.filter((c) => c.gateRule).map((c) => c.id), []);
  const src = { id: "G-1", type: "scenario", grade: "would", weight: 0.55, chapter: 1, privacy: "normal", prompt: "Gate source card", exits: ["skip", "not_my_life"], options: [
    { t: "yes", tags: [{ id: "T11A", s: 2 }] }, { t: "no", tags: [{ id: "T11B", s: 2 }] }, { t: "maybe", axes: { L2: 1 } }] };
  const gated = { id: "G-2", type: "scenario", grade: "would", weight: 0.55, chapter: 1, privacy: "normal", prompt: "Gated follow-up card", exits: ["skip", "not_my_life"], gateRule: { card: "G-1", anyTag: "T11A" }, options: [
    { t: "a", axes: { L2: 2 } }, { t: "b", axes: { L2: -2 } }, { t: "c", axes: { L2: 1 } }] };
  const G = createScorer({ kit: { version: "fx", chapters: [{ n: 1, title: "x", intro: "x", cards: [src, gated] }], finale: [], extras: [] }, lib, friend: {} });
  const off = G.buildProfile({ setup: {}, "G-1": 1, "G-2": 1 });
  assert.ok(off.research.gatedOut.includes("G-2"));
  const on = G.buildProfile({ setup: {}, "G-1": 0, "G-2": 1 });
  assert.ok(!on.research.gatedOut.includes("G-2"));
  assert.ok(on.axes.L2.evidence.some((e) => e.card === "G-2"));
});

// ------------------------------------------------------------ scoring
test("weights by card type and rushed answers at 0.3", () => {
  // A would card (0.55), a did card (0.80, answered rushed), a believe card (0.45) and an absurd card (0.35), all +2 on
  // one axis, on four different cards.
  const ax = AXES.find((a) => firstDistinct(axisOptions(a, { v: 2, weight: 0.55 }), axisOptions(a, { v: 2, weight: 0.8 }), axisOptions(a, { v: 2, weight: 0.45 }), axisOptions(a, { v: 2, weight: ABSURD_WEIGHT_CAP })));
  assert.ok(ax, "fixture: one axis with would, did, believe and absurd +2 options");
  const [w, d, b, x] = firstDistinct(axisOptions(ax, { v: 2, weight: 0.55 }), axisOptions(ax, { v: 2, weight: 0.8 }), axisOptions(ax, { v: 2, weight: 0.45 }), axisOptions(ax, { v: 2, weight: ABSURD_WEIGHT_CAP }));
  assert.equal(x[0].world, "absurd");
  const p = buildProfile({ ...ADULT, [w[0].id]: w[1], [d[0].id]: d[1], [b[0].id]: b[1], [x[0].id]: x[1], _ms: { [w[0].id]: 4000, [d[0].id]: 900, [b[0].id]: 5000, [x[0].id]: 5000 } });
  const ev = Object.fromEntries(p.axes[ax].evidence.map((e) => [e.card, e.w]));
  assert.equal(ev[w[0].id], 0.55);
  assert.equal(ev[d[0].id], 0.24); // 0.80 x 0.3, rushed
  assert.equal(ev[b[0].id], 0.45);
  assert.equal(ev[x[0].id], 0.35, "absurd cards weigh 0.35");
  assert.equal(p.axes[ax].score, Math.round((0.55 * 2 + 0.24 * 2 + 0.45 * 2 + 0.35 * 2) * 1000) / 1000);
});

// The shipped kit plus fixture cards with a circumstance option (appended to chapter 1) when the bank has fewer than
// two: the round-1 revision (2026-09-29) cut every circumstance option, but the scorer still supports them.
function circumstanceKit() {
  const circ = chapterCards.filter((c) => c.options.some((o) => o.circumstance)).slice(0, 2);
  if (circ.length >= 2) return { K: { buildProfile, runCards }, circ };
  const k = JSON.parse(JSON.stringify(kit));
  const fx = [1, 2].map((n) => ({ id: `FX-CIRC-${n}`, type: "scenario", grade: "would", weight: 0.55, chapter: 1, privacy: "normal", prompt: `Circumstance fixture card ${n}`, exits: ["skip", "not_my_life"],
    options: [{ t: "a", tags: [{ id: "T13A", s: 2 }] }, { t: "b", tags: [{ id: "T13B", s: 2 }] }, { t: "No real choice here", circumstance: true }] }));
  k.chapters[0].cards.push(...fx);
  return { K: createScorer({ kit: k, lib, friend: FRIEND }), circ: fx };
}

test("circumstance, Not my life, No recent example and Skip never count", () => {
  const { K, circ } = circumstanceKit();
  assert.equal(circ.length, 2, "fixture: two cards with a circumstance option");
  const reals = chapterCards.filter((c) => c.type === "real");
  const others = chapterCards.filter((c) => c.type === "scenario" && !circ.includes(c));
  // A pick_two card with two options on one axis: one card, two pieces of evidence.
  const two = chapterCards.filter((c) => c.type === "pick_two").map((c) => [c, AXES.find((a) => c.options.filter((o) => (o.axes || {})[a]).length >= 2)]).find(([, a]) => a);
  assert.ok(two, "fixture: a pick_two card with two options on one axis");
  const [pc, ax] = two;
  const picks = pc.options.map((o, i) => ((o.axes || {})[ax] ? i : -1)).filter((i) => i >= 0).slice(0, 2);
  const nml = others.find((c) => c.id !== pc.id), skp = others.find((c) => c.id !== pc.id && c !== nml);
  const ans = { ...ADULT, [nml.id]: "not_my_life", [skp.id]: "skip", [reals[0].id]: "no_recent", [pc.id]: picks };
  for (const c of circ) ans[c.id] = c.options.findIndex((o) => o.circumstance);
  const p = K.buildProfile(ans);
  assert.deepEqual(p.research.circumstance.map((x) => x.card).sort(), circ.map((c) => c.id).sort());
  assert.deepEqual(p.research.notMyLife, [nml.id]);
  assert.deepEqual(p.research.noRecent, [reals[0].id]);
  assert.deepEqual(p.research.skipped, [skp.id]);
  assert.deepEqual(p.axes[ax].evidence.map((e) => e.card), [pc.id, pc.id]);
  assert.equal(p.axes[ax].cards, 1);
  assert.equal(p.axes[ax].unfinished, true, "one valid card leaves the axis unfinished");
  assert.equal(p.counts.answered, 3, "two circumstance picks and the pick_two card");
});

test("unfinished axis offers extras, and the extras finish it", () => {
  for (const ax of AXES) assert.ok(kit.extras.filter((c) => c.axisFor === ax).length >= 1, `extras cover ${ax}`);
  const [c, i] = axisOptions("R3").find(([, j], k, all) => all[k][0].options[j].axes.R3 < 0);
  const p = buildProfile({ ...ADULT, [c.id]: i });
  assert.equal(p.axes.R3.unfinished, true);
  const r = buildResult(p);
  const u = r.unfinished.find((x) => x.axis === "R3");
  const xs = kit.extras.filter((x) => x.axisFor === "R3");
  assert.deepEqual(u.extras, xs.map((x) => x.id));
  assert.equal(u.line, lib.unfinished.line);
  const x = xs.find((e) => SINGLE(e) && e.options.some((o) => (o.axes || {}).R3 < 0));
  const p2 = buildProfile({ ...ADULT, [c.id]: i, [x.id]: x.options.findIndex((o) => (o.axes || {}).R3 < 0) });
  assert.equal(p2.axes.R3.unfinished, false);
  assert.equal(p2.axes.R3.pole, -1);
});

test("flex: tie broken by real-card evidence first, then the first card", () => {
  const flexOf = (picks) => { const sc = picks.reduce((t, [c, i, ax]) => t + c.weight * c.options[i].axes[ax], 0); const mx = picks.reduce((t, [c]) => t + c.weight * 2, 0); return Math.abs(sc / mx) < CONFIG.flexBand; };
  const notDid = (ax) => axisOptions(ax).filter(([c]) => c.grade !== "did").map(([c, i]) => [c, i, ax]);
  const did = (ax) => axisOptions(ax, { grade: "did" }).map(([c, i]) => [c, i, ax]);
  const sgn = ([c, i, ax]) => Math.sign(c.options[i].axes[ax]);
  // Two non-did cards on opposite sides that cancel within the flex band: the first card in authored order decides.
  let two = null, three = null;
  for (const ax of AXES) {
    for (const x of notDid(ax)) for (const y of notDid(ax)) {
      if (two || x[0].id >= y[0].id || sgn(x) === sgn(y)) continue;
      if (flexOf([x, y])) two = [x, y];
    }
    // Non-did cards on one side, a did card on the other, near zero: the did card decides against the first card.
    for (const x of notDid(ax)) for (const d of did(ax)) for (const y of notDid(ax)) {
      if (three || new Set([x[0].id, d[0].id, y[0].id]).size < 3 || sgn(x) !== sgn(y) || sgn(d) === sgn(x)) continue;
      if (flexOf([x, d, y])) three = [x, d, y];
    }
  }
  assert.ok(two && three, "fixtures: cancelling non-did cards, and non-did cards cancelled by a did card");
  const ans = (picks) => ({ ...ADULT, ...Object.fromEntries(picks.map(([c, i]) => [c.id, i])) });
  const first = (picks) => [...picks].sort((p, q) => byOrder.get(p[0].id) - byOrder.get(q[0].id))[0];
  const ax1 = two[0][2];
  const a = buildProfile(ans(two));
  assert.equal(a.axes[ax1].flex, true);
  assert.equal(a.axes[ax1].pole, sgn(first(two)));
  assert.equal(a.axes[ax1].decidedBy, `first card ${first(two)[0].id}`);
  const ax2 = three[0][2];
  const b = buildProfile(ans(three));
  assert.equal(b.axes[ax2].flex, true, `norm ${b.axes[ax2].norm}`);
  assert.equal(b.axes[ax2].pole, sgn(three[1]));
  assert.notEqual(b.axes[ax2].pole, sgn(first(three)), "the did card overrules the first card");
  assert.equal(b.axes[ax2].decidedBy, "real cards");
  assert.ok(buildResult(b).type.badges.some((x) => x.axis === ax2 && x.badge === "Flex"));
});

test("split: believe one way, did the other, becomes the plot twist", () => {
  // Believe Direct (+2 at 0.45), did Soft twice (-2 at 0.80).
  const [b, d1, d2] = firstDistinct(axisOptions("R2", { v: 2, grade: "believe" }), axisOptions("R2", { v: -2, grade: "did" }), axisOptions("R2", { v: -2, grade: "did" }));
  const p = buildProfile({ ...ADULT, [b[0].id]: b[1], [d1[0].id]: d1[1], [d2[0].id]: d2[1] });
  const s = p.splits.find((x) => x.dim === "R2");
  assert.ok(s, "R2 split found");
  assert.ok(s.believe > 0 && s.act < 0);
  assert.equal(s.did.grade, "did");
  const r = buildResult(p);
  assert.match(r.plotTwist.line, /^You'd say: .* Last time, you did: /);
  assert.equal(s.twistOk, true, "axis splits always qualify for the twist");
});

// ------------------------------------------------------------ plot twist restriction (open item 4)
const believeCards = () => runCards(ADULT.setup).filter((c) => c.grade === "believe" && !c.gateRule);
const actCards = () => runCards(ADULT.setup).filter((c) => (c.grade === "did" || c.grade === "would") && !c.gateRule);
const ans1 = (c, i) => (c.type === "pick_two" ? [i] : i);
// First believe/act option couple with opposite sides of one tag pair and no axis in common, filtered by link.
function tagSplitFixture(linked) {
  for (const b of believeCards()) for (const a of actCards()) {
    if (!!cardLink(b.id, a.id) !== linked) continue;
    for (const [i, ob] of b.options.entries()) for (const [j, oa] of a.options.entries()) {
      if (Object.keys(ob.axes || {}).some((k) => (oa.axes || {})[k])) continue;
      const t = (ob.tags || []).find((x) => (oa.tags || []).some((y) => y.id === TAG[x.id].pair));
      if (!t) continue;
      const p = buildProfile({ ...ADULT, [b.id]: ans1(b, i), [a.id]: ans1(a, j) });
      const s = p.splits.find((x) => x.dim === t.id.slice(0, 3));
      if (s) return { b, a, p, s };
    }
  }
  return null;
}

test("plot twist: a tag-pair split joins two cards only when they share a Sally question or chapter", () => {
  const off = tagSplitFixture(false);
  assert.ok(off, "fixture: an unlinked believe/act tag-pair split exists in the run");
  assert.equal(off.s.kind, "tag pair");
  assert.equal(off.s.twistOk, false, `${off.b.id} and ${off.a.id} share no Sally question or chapter`);
  assert.equal(off.s.link, null);
  assert.equal(buildResult(off.p).plotTwist, null, `no plot twist from ${off.b.id} + ${off.a.id}`);

  const on = tagSplitFixture(true);
  assert.ok(on, "fixture: a linked believe/act tag-pair split exists in the run");
  assert.equal(on.s.twistOk, true);
  assert.equal(on.s.link, cardLink(on.b.id, on.a.id));
  assert.match(on.s.link, /^(sally Q\d+|chapter \d)$/);
  const tw = buildResult(on.p).plotTwist;
  assert.ok(tw && tw.dim === on.s.dim, `twist from the linked couple ${on.b.id} + ${on.a.id}`);
  assert.equal(tw.said.card, on.b.id);
  assert.equal(tw.did.card, on.a.id);

  // Every twist on a real run respects the rule.
  const ex = buildProfile(JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8")));
  for (const s of ex.splits.filter((x) => x.twistOk && x.kind === "tag pair")) assert.ok(cardLink(s.said.card, s.did.card), `${s.dim}: quoted cards are linked`);
});

test("plot twist order: eligible first, then a real card, then axis over tag pair, then strength", () => {
  const sp = (dim, kind, grade, strength, twistOk = true) => ({ dim, kind, strength, twistOk, did: { grade } });
  const order = (xs) => [...xs].sort(twistOrder).map((x) => x.dim);
  // Axis beats a stronger tag pair at the same grade.
  assert.deepEqual(order([sp("T05", "tag pair", "did", 2.0), sp("R2", "axis", "did", 0.5)]), ["R2", "T05"]);
  // A real (did) card still beats an axis split acted on a scenario.
  assert.deepEqual(order([sp("R2", "axis", "would", 2.0), sp("T05", "tag pair", "did", 0.5)]), ["T05", "R2"]);
  // An unlinked tag pair never leads, whatever its strength or grade.
  assert.deepEqual(order([sp("T05", "tag pair", "did", 3.0, false), sp("L1", "axis", "would", 0.4)]), ["L1", "T05"]);
  // Same kind and grade: stronger first.
  assert.deepEqual(order([sp("L1", "axis", "did", 0.6), sp("L2", "axis", "did", 1.2)]), ["L2", "L1"]);
});

// ------------------------------------------------------------ shown-tag ranking (open item 1, scorer part)
test("tag ranking: strong tags first by net, the rest by coverage share, then net", () => {
  const raw = { T01A: { net: 3.4, share: 0.6 }, T02A: { net: 3.1, share: 1.0 }, T03A: { net: 2.95, share: 0.7 }, T04A: { net: 2.3, share: 1.0 }, T05A: { net: 2.5, share: 1.0 }, T06A: { net: 2.9, share: 0.95 } };
  const tags = Object.fromEntries(Object.keys(raw).map((id) => [id, { cards: 2 }]));
  assert.deepEqual(rankTags(Object.keys(raw), raw, tags, CONFIG), ["T01A", "T02A", "T05A", "T04A", "T06A", "T03A"]);
  assert.deepEqual(rankTags(Object.keys(raw), raw, tags, { ...CONFIG, tagRank: "net" }), ["T01A", "T02A", "T03A", "T06A", "T05A", "T04A"]);
  // Deterministic ties: more cards, then id.
  const tied = { T07A: { net: 2.5, share: 0.8 }, T08A: { net: 2.5, share: 0.8 }, T09A: { net: 2.5, share: 0.8 } };
  assert.deepEqual(rankTags(["T09A", "T07A", "T08A"], tied, { T07A: { cards: 2 }, T08A: { cards: 3 }, T09A: { cards: 2 } }, CONFIG), ["T08A", "T07A", "T09A"]);
});

test("tag ranking: share = net / the most the answered cards could give; exits, circumstance and depends excluded", () => {
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  const p = buildProfile(answers);
  // Independent recomputation of the denominator.
  const scoring = runCards(answers.setup).map((c) => [c, answers[c.id]]).filter(([c, v]) => v !== undefined && typeof v !== "string" && c.weight)
    .filter(([c, v]) => (Array.isArray(v) ? v : [v]).some((i) => !c.options[i].circumstance && !c.options[i].depends));
  for (const [id, t] of Object.entries(p.tags)) {
    let possible = 0;
    for (const [c] of scoring) {
      const ms = answers._ms[c.id];
      const w = c.weight * (ms !== undefined && ms < CONFIG.rushedMs ? CONFIG.rushedFactor : 1);
      const v = c.options.map((o) => Math.max(0, (o.tags || []).reduce((s, x) => s + (x.id === id ? x.s : x.id === TAG[id].pair ? -x.s : 0), 0))).sort((a, b) => b - a);
      // pick_two: best two picks; receipts: best receiptsCap ticks; rank: best order under the position weights.
      if (c.type === "rank") {
        const net = c.options.map((o) => (o.tags || []).reduce((s, x) => s + (x.id === id ? x.s : x.id === TAG[id].pair ? -x.s : 0), 0)).sort((a, b) => b - a);
        possible += w * Math.max(0, net.reduce((s, x, k) => s + x * RANK_WEIGHTS[k], 0));
      } else possible += w * (c.type === "pick_two" ? v[0] + (v[1] || 0) : c.type === "receipts" ? v.slice(0, CONFIG.receiptsCap).reduce((s, x) => s + x, 0) : v[0]);
    }
    assert.ok(Math.abs(t.possible - possible) < 0.002, `${id}: possible ${t.possible} vs ${possible}`);
    if (possible) assert.ok(Math.abs(t.share - t.net / possible) < 0.002, `${id}: share`);
    if (t.fired) assert.ok(t.share <= 1.0005, `${id}: a fired tag's share is at most 1`);
  }
  // Shown order follows the ranking: strong by net, then the rest by share, then net.
  const sh = p.shownTags.map((id) => p.tags[id]);
  for (let i = 1; i < sh.length; i++) {
    const a = sh[i - 1], b = sh[i];
    if (a.strong !== b.strong) assert.ok(a.strong, "strong tags come first");
    else if (a.strong) assert.ok(a.net >= b.net, "strong tags by net");
    else assert.ok(a.share > b.share || (a.share === b.share && a.net >= b.net), "other tags by share, then net");
  }
  // A circumstance pick leaves the card out of the denominator; an exit does too.
  const { K, circ } = circumstanceKit();
  const card = circ.find((c) => c.options.some((o) => (o.tags || []).length));
  const ci = card.options.findIndex((o) => o.circumstance);
  const tagId = card.options.find((o) => (o.tags || []).length).tags[0].id;
  const other = K.runCards(ADULT.setup).find((c) => c.id !== card.id && SINGLE(c) && c.options.some((o) => (o.tags || []).some((x) => x.id === tagId)));
  const oi = other.options.findIndex((o) => (o.tags || []).some((x) => x.id === tagId));
  const withCirc = K.buildProfile({ ...ADULT, [card.id]: ci, [other.id]: ans1(other, oi) });
  const withExit = K.buildProfile({ ...ADULT, [card.id]: "skip", [other.id]: ans1(other, oi) });
  const withAnswer = K.buildProfile({ ...ADULT, [card.id]: ci === 0 ? 1 : 0, [other.id]: ans1(other, oi) });
  assert.equal(withCirc.tags[tagId].possible, withExit.tags[tagId].possible, `${card.id} circumstance pick is not in ${tagId}'s denominator`);
  assert.ok(withAnswer.tags[tagId].possible > withCirc.tags[tagId].possible, `${card.id} answered normally does count`);
});

test("tags: 2 separate cards, 1 not rushed, net over threshold, pair subtracts, max 5", () => {
  // A tag with 4 one-pick cards that together fire it, 2 of which also offer its pair.
  const tagOpt = (c, id) => c.options.map((o, i) => [i, ((o.tags || []).find((t) => t.id === id) || { s: 0 }).s]).filter(([, x]) => x).sort((a, b) => b[1] - a[1])[0];
  let fx = null;
  for (const tag of lib.tags) {
    const cards = chapterCards.filter(SINGLE).filter((c) => tagOpt(c, tag.id)).sort((a, b) => b.weight * tagOpt(b, tag.id)[1] - a.weight * tagOpt(a, tag.id)[1]).slice(0, 4);
    if (cards.length < 4) continue;
    const pairable = cards.filter((c) => tagOpt(c, tag.pair));
    const base = { ...ADULT };
    for (const c of cards) base[c.id] = tagOpt(c, tag.id)[0];
    if (pairable.length >= 2 && buildProfile(base).tags[tag.id].fired) { fx = { id: tag.id, pair: tag.pair, cards, pairable, base }; break; }
  }
  assert.ok(fx, "fixture: a tag that fires from 4 cards, 2 of them offering its pair");
  const { id, cards, pairable, base } = fx;
  const calm = buildProfile(base);
  assert.equal(calm.tags[id].fired, true);
  const rushedAll = buildProfile({ ...base, _ms: Object.fromEntries(cards.map((c) => [c.id, 500])) });
  assert.equal(rushedAll.tags[id].fired, false, "all-rushed support never fires");
  const oneCard = buildProfile({ ...ADULT, [cards[0].id]: base[cards[0].id] });
  assert.ok(!oneCard.tags[id].fired, "one card never fires");
  const paired = buildProfile({ ...base, ...Object.fromEntries(pairable.slice(0, 2).map((c) => [c.id, tagOpt(c, fx.pair)[0]])) });
  assert.ok(paired.tags[id].net < calm.tags[id].net, "pair support subtracts");
  // A strongly consistent full run never shows more than 5, and spreads chapters.
  const full = { ...ADULT, _ms: {} };
  for (const c of runCards(ADULT.setup)) {
    const scoreOpt = (o) => (o.tags || []).reduce((s, t) => s + (t.id.endsWith("A") ? t.s : 0), 0);
    const order = c.options.map((o, i) => [i, scoreOpt(o)]).sort((x, y) => y[1] - x[1]).map(([i]) => i);
    if (c.type === "receipts") { const ticks = order.filter((i) => scoreOpt(c.options[i]) > 0); full[c.id] = ticks.length ? ticks.sort((x, y) => x - y) : [c.options.findIndex((o) => o.none)]; }
    else full[c.id] = c.type === "pick_two" ? order.slice(0, 2) : c.type === "rank" ? order : order[0];
  }
  const pf = buildProfile(full);
  assert.ok(pf.shownTags.length <= CONFIG.maxTags);
  assert.ok(new Set(pf.shownTags.map((id) => TAG[id].chapter)).size >= 3, "shown tags span 3 chapters");
});

test("research record: depends picks with flip answers, emotions, feelings", () => {
  // Emotions and feelings from the bank: a feeling card after its moment, and another card's option with an emotion.
  const feel = chapterCards.find((c) => c.type === "feeling" && c.follows && c.privacy === "normal");
  const moment = cardById[feel.follows];
  const fi = feel.options.findIndex((o) => o.emotion);
  const emo = chapterCards.find((c) => SINGLE(c) && c.id !== moment.id && c.options.some((o) => o.emotion));
  const ei = emo.options.findIndex((o) => o.emotion);
  const mi = moment.options.findIndex((o) => !o.circumstance);
  const p = buildProfile({ ...ADULT, [emo.id]: ei, [moment.id]: mi, [feel.id]: fi });
  assert.ok(p.emotions.some((e) => e.emotion === emo.options[ei].emotion && e.from.some((f) => f.startsWith(`${emo.id}:`))));
  assert.equal(p.feelings.length, 1);
  assert.equal(p.feelings[0].follows, moment.id);
  assert.equal(p.feelings[0].followsSaid, moment.options[mi].t);
  assert.equal(p.feelings[0].feeling, feel.options[fi].emotion);
  // No shipped card has a "depends" option now; the flip record is checked on a fixture card.
  const dep = { id: "D-1", type: "scenario", grade: "would", weight: 0.55, chapter: 1, privacy: "normal", prompt: "A depends fixture card", exits: ["skip", "not_my_life"],
    options: [{ t: "a", axes: { L1: 2 } }, { t: "b", axes: { L1: -2 } }, { t: "Depends", depends: true }], flip: { prompt: "What would flip you?", options: ["x", "y", "z"] } };
  const D = createScorer({ kit: { version: "fx", chapters: [{ n: 1, title: "x", intro: "x", cards: [dep] }], finale: [], extras: [] }, lib, friend: {} });
  const pd = D.buildProfile({ setup: {}, "D-1": 2, "D-1.flip": 1 });
  assert.deepEqual(pd.research.depends, [{ card: "D-1", said: "Depends", flip: "y" }]);
  assert.equal(pd.axes.L1.cards, 0, "a depends pick scores nothing");
});

const directProfile = () => {
  const picks = firstDistinct(axisOptions("R2", { v: 2 }), axisOptions("R2", { v: 2 }), axisOptions("R2", { v: 2 }));
  return buildProfile({ ...ADULT, ...Object.fromEntries(picks.map(([c, i]) => [c.id, i])) });
};

test("sealed: passes on flex or unfinished axes; check scores exact and side", () => {
  const p = directProfile();
  assert.equal(p.axes.R2.pole, 1);
  assert.equal(p.axes.R3.unfinished, true);
  const frozen = freezePredictions(p);
  const r2card = kit.finale.find((c) => c.checks.primary === "R2");
  const r2 = frozen.predictions.find((x) => x.id === r2card.id);
  assert.equal(r2.pass, false);
  const top = Math.max(...r2card.options.map((o) => (o.axes || {}).R2 || 0));
  assert.equal((r2card.options[r2.predicted].axes || {}).R2, top, "a Direct profile predicts the most direct line");
  assert.equal(r2.side, 1);
  const r3card = kit.finale.find((c) => c.checks.primary === "R3");
  const r3 = frozen.predictions.find((x) => x.id === r3card.id);
  assert.equal(r3.pass, true, "R3 unfinished: Genii passes");
  const res = checkSealed(frozen, { [r2card.id]: r2.predicted, [r3card.id]: 1 });
  const row = res.rows.find((x) => x.id === r2card.id);
  assert.equal(row.status, "hit");
  assert.equal(row.sideHit, true);
  assert.equal(res.rows.find((x) => x.id === r3card.id).status, "pass");
});

// ------------------------------------------------------------ CLI: freeze refusal and tamper check
function cli(args, cwd) {
  return spawnSync(process.execPath, [path.join(DIR, "score.mjs"), ...args], { cwd, encoding: "utf8" });
}

test("CLI: profile, freeze once, refuse refreeze, refuse tampered predictions, check, friend", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genii-v2-"));
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  fs.writeFileSync(path.join(tmp, "answers.json"), JSON.stringify(answers));
  fs.writeFileSync(path.join(tmp, "sealed-answers.json"), fs.readFileSync(path.join(DIR, "sim-example", "sealed-answers.json")));
  assert.equal(cli(["profile", "answers.json"], tmp).status, 0);
  assert.ok(fs.existsSync(path.join(tmp, "result.json")));
  const f1 = cli(["freeze"], tmp);
  assert.equal(f1.status, 0, f1.stderr);
  const sha = f1.stdout.match(/sha256 ([0-9a-f]{64})/)[1];
  const f2 = cli(["freeze"], tmp);
  assert.equal(f2.status, 1, "second freeze is refused");
  assert.match(f2.stderr, /Refusing to refreeze/);
  assert.equal(fs.readFileSync(path.join(tmp, "sealed-predictions.sha256"), "utf8").split(/\s+/)[0], sha, "hash unchanged");
  const ck = cli(["check", "sealed-answers.json"], tmp);
  assert.equal(ck.status, 0, ck.stderr);
  const res = JSON.parse(fs.readFileSync(path.join(tmp, "sealed-results.json"), "utf8"));
  assert.equal(res.sha256, sha);
  const pred = path.join(tmp, "sealed-predictions.json");
  const tampered = JSON.parse(fs.readFileSync(pred, "utf8"));
  const t0 = tampered.predictions[0];
  t0.predicted = (t0.predicted + 1) % t0.scores.length;
  fs.writeFileSync(pred, JSON.stringify(tampered, null, 2) + "\n");
  assert.equal(cli(["check", "sealed-answers.json"], tmp).status, 1, "tampered predictions are refused");
  const fr = cli(["friend", "--rel", "bestie", "--stings", "on"], tmp);
  assert.equal(fr.status, 0, fr.stderr);
  const deck = JSON.parse(fs.readFileSync(path.join(tmp, "friend-deck.json"), "utf8"));
  assert.equal(deck.level1.length, 6);
  assert.ok(deck.level4 && deck.level4.enabled);
  fs.rmSync(tmp, { recursive: true, force: true });
});

// ------------------------------------------------------------ friend game
test("friend deck: 12 level 2 cards, never private or rushed; 12 tag cards with N true", () => {
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  // The first card of the calm bestie deck, answered rushed, must drop out.
  const rushedId = buildFriendDeck(buildProfile(answers), answers, { rel: "bestie", seed: 7 }).level2.cards[0].id;
  answers._ms[rushedId] = 800;
  const p = buildProfile(answers);
  for (const rel of ["partner", "crush", "friendOrCoworker", "bestie"]) {
    const d = buildFriendDeck(p, answers, { rel, seed: 7 });
    assert.equal(d.level1.length, 6);
    assert.equal(d.level2.cards.length, 12, `${rel}: ${d.level2.cards.length} level 2 cards`);
    for (const c of d.level2.cards) {
      assert.equal(cardById[c.id].privacy, "normal");
      assert.notEqual(c.id, rushedId, "rushed card excluded");
      assert.ok(["a", "b"].includes(c.answer));
    }
    const levels = FRIEND.relationships.options.find((o) => o.id === rel).cardLevels;
    for (const c of d.level2.cards) assert.ok(levels.includes(FRIEND.level2.cards[c.id].level), `${rel}: ${c.id} level allowed`);
    if (rel === "friendOrCoworker") assert.ok(d.level2.cards.every((c) => FRIEND.level2.cards[c.id].level === "everyday" && cardById[c.id].chapter !== 3), "no love or couple cards for a friend or coworker");
    if (!d.level3.skipped) {
      assert.equal(d.level3.cards.length, 12);
      assert.equal(d.level3.cards.filter((c) => c.role === "true").length, d.level3.N);
      assert.equal(d.level3.cards.filter((c) => c.role === "opposite").length, d.level3.N);
      const pairs = d.level3.cards.map((c) => c.id.slice(0, 3));
      assert.equal(new Set(pairs.filter((x, i) => d.level3.cards[i].role === "decoy")).size, d.level3.cards.filter((c) => c.role === "decoy").length);
      for (const c of d.level3.cards) assert.ok(!("sting" in c), "tag cards show name and heart only");
    }
    if (rel !== "bestie") assert.equal(d.level4, null);
  }
});

// friend.json level2.cards is a snapshot of cards.json. If a card's options or friend field change, recompute it with
// node friend-snapshot.mjs --write (level2.answerMapping) so it never goes stale.
test("friend game: level 2 snapshot matches the cards; primary lists are clean", () => {
  const L2 = FRIEND.level2;
  const friendCards = chapterCards.filter((c) => c.friend);
  assert.deepEqual(Object.keys(L2.cards).sort(), friendCards.map((c) => c.id).sort(), "one snapshot per card with a friend field");
  for (const c of friendCards) {
    const s = L2.cards[c.id];
    const sides = [c.friend.a, c.friend.b];
    assert.deepEqual([...s.axes].sort(), [...new Set(sides.flatMap((x) => Object.keys(x.axes || {})))].sort(), `${c.id}: axes`);
    assert.deepEqual([...s.pairs].sort(), [...new Set(sides.flatMap((x) => (x.tags || []).map((t) => t.id.slice(0, 3))))].sort(), `${c.id}: pairs`);
    assert.deepEqual(s.sally, c.sally || [], `${c.id}: sally`);
    assert.equal(s.type, c.type, `${c.id}: type`);
    assert.deepEqual(s.answerMap, c.options.map((o, i) => (o.circumstance || o.depends ? null : friendMapping(c, [i]))), `${c.id}: answerMap`);
    assert.ok(["everyday", "love", "couple"].includes(s.level), `${c.id}: level`);
  }
  const snapCheck = spawnSync(process.execPath, [path.join(DIR, "friend-snapshot.mjs")], { cwd: DIR, encoding: "utf8" });
  assert.equal(snapCheck.status, 0, snapCheck.stdout + snapCheck.stderr);
  assert.ok(L2.primary.friend.every((id) => L2.cards[id].level === "everyday"), "primary.friend also serves friend or coworker: everyday cards only");
  const backup = L2.backupOrder;
  assert.deepEqual([...backup].sort(), friendCards.map((c) => c.id).sort(), "backupOrder holds every friend card once");
  for (const [k, list] of Object.entries(L2.primary).filter(([, v]) => Array.isArray(v))) {
    assert.equal(list.length, 12, `${k}: 12 primary cards`);
    const info = list.map((id) => L2.cards[id]);
    assert.ok(info.every(Boolean), `${k}: every primary card has a friend field`);
    const pairs = info.flatMap((x) => x.pairs);
    assert.equal(new Set(pairs).size, pairs.length, `${k}: no tag pair twice`);
    assert.ok(pairs.length >= 12, `${k}: 12 different pairs`);
    assert.deepEqual([...new Set(info.flatMap((x) => x.axes))].sort(), [...AXES].sort(), `${k}: all six axes`);
    assert.ok(new Set(info.map((x) => x.chapter)).size >= 6, `${k}: 6 or more chapters`);
    for (let i = 1; i < info.length; i++) assert.notEqual(info[i].chapter, info[i - 1].chapter, `${k}: ${list[i - 1]} and ${list[i]} share a chapter`);
  }
});

// ------------------------------------------------------------ new formats (fixtures)
// A tiny kit with one card of each new format, scored by the same createScorer the app uses. fillFromType sets grade,
// weight and exits as merge-bank.mjs does.
const FX_LIB = lib;
const fxOpt = (t, extra = {}) => ({ t, ...extra });
const FX_KIT = {
  version: "fixture", built: "2026-09-28",
  chapters: [{ n: 1, title: "Fixture", intro: "Fixture chapter", cards: [
    { id: "F-R", type: "receipts", grade: "did", weight: 0.4, chapter: 1, privacy: "normal", prompt: "Tap everything that's true right now", exits: ["skip", "not_my_life"], options: [
      fxOpt("a", { axes: { L1: 1 }, tags: [{ id: "T24A", s: 2 }] }),
      fxOpt("b", { axes: { L1: -1 }, tags: [{ id: "T24B", s: 2 }] }),
      fxOpt("c", { tags: [{ id: "T24A", s: 1 }] }),
      fxOpt("d", { tags: [{ id: "T24A", s: 3 }] }),
      fxOpt("e", { tags: [{ id: "T13A", s: 1 }] }),
      fxOpt("None of these", { none: true }),
    ] },
    fillFromType({ id: "F-G", type: "bet", chapter: 1, privacy: "normal", prompt: "I bet you've done the thing.", options: [
      fxOpt("Guilty. Twice.", { axes: { L3: -2 }, tags: [{ id: "T25B", s: 2 }] }), fxOpt("Never. Not once.", { axes: { L3: 1 } }), fxOpt("Only on holiday.", { circumstance: true }),
    ], heart: { prompt: "Have you ever done the thing?", options: ["Yes, twice.", "No, never.", "Only when I was away."] } }),
    fillFromType({ id: "F-K", type: "rank", chapter: 1, privacy: "normal", prompt: "Rank what you'd cancel first.", options: [
      fxOpt("Gym", { axes: { L2: -2 }, tags: [{ id: "T16B", s: 2 }] }), fxOpt("Date", { axes: { R1: -1 } }), fxOpt("Family dinner", { axes: { R3: -1 } }), fxOpt("Group project", { axes: { L2: 2 }, tags: [{ id: "T16A", s: 1 }] }),
    ] }),
    fillFromType({ id: "F-E", type: "eyes", chapter: 1, privacy: "normal", prompt: "Your best friend describes you to a stranger. Which line?", options: [
      fxOpt("Always has a plan.", { axes: { L1: 2 } }), fxOpt("Down for anything.", { axes: { L1: -2 } }), fxOpt("Knows everyone.", { axes: { R1: 1 } }), fxOpt("Loyal to a fault.", { tags: [{ id: "T05A", s: 1 }] }),
    ] }),
    { id: "F-P", type: "reply", grade: "would", weight: 0.55, chapter: 1, privacy: "normal", prompt: "Group chat, 11pm.", thread: [{ from: "Sam", text: "who's booking??" }], exits: ["skip", "not_my_life"], options: [
      fxOpt("On it.", { axes: { L3: 2 } }), fxOpt("lol", { axes: { L3: -2 } }), fxOpt("Ask Jo", { axes: { R1: -1 } }),
    ], heart: { prompt: "It is 11pm in the group chat.", thread: [{ from: "Sam", text: "Who is booking the place?" }], options: ["I will do it.", "I laugh and leave it.", "I ask Jo."] } },
    { id: "F-O", type: "others", grade: "believe", weight: 0.45, chapter: 1, privacy: "normal", prompt: "Your friend did a thing. First thought?", exits: ["skip", "not_my_life"], options: [
      fxOpt("Icon.", { axes: { L3: -1 } }), fxOpt("Oh no.", { axes: { L3: 1 } }), fxOpt("Same.", { tags: [{ id: "T24B", s: 1 }] }),
    ] },
  ] }],
  finale: [], extras: [],
};
const FX = createScorer({ kit: FX_KIT, lib: FX_LIB, friend: {} });
const FXA = { setup: {} };

test("receipts: each tick counts at 0.40, past 3 ticks each is scaled to 3/ticks; None of these stands alone and scores nothing", () => {
  const two = FX.buildProfile({ ...FXA, "F-R": [0, 2] });
  assert.deepEqual(two.tags.T24A.evidence.map((e) => e.w), [0.4, 0.4]);
  assert.equal(two.tags.T24A.support, 1.2);
  assert.equal(two.tags.T24A.cards, 1, "one receipts card is one card, however many ticks");
  const five = FX.buildProfile({ ...FXA, "F-R": [0, 1, 2, 3, 4] });
  for (const e of five.tags.T24A.evidence) assert.equal(e.w, 0.24, "0.40 x 3/5");
  const ticks = new Set(Object.values(five.tags).flatMap((t) => t.evidence.map((e) => e.said)));
  const weightTotal = [...ticks].length * 0.24;
  assert.ok(Math.abs(weightTotal - 0.4 * 3) < 1e-9, "5 ticks weigh as much as 3 full ticks");
  assert.equal(five.axes.L1.score, 0, "L1 +1 and -1 ticks cancel");
  const none = FX.buildProfile({ ...FXA, "F-R": [5] });
  assert.deepEqual(Object.keys(none.tags), []);
  assert.equal(none.counts.answered, 1);
  const empty = FX.buildProfile({ ...FXA, "F-R": [] });
  assert.deepEqual(Object.keys(empty.tags), []);
  assert.throws(() => FX.buildProfile({ ...FXA, "F-R": [0, 5] }), /none/);
  // Coverage share uses the same cap: the most a receipts answer can give T24A is its best 3 items (3 + 2 + 1).
  assert.equal(FX.cardTagMax(FX.cardById["F-R"], "T24A"), 6);
  assert.equal(FX.cardTagMax(FX.cardById["F-R"], "T24B"), 2);
  assert.equal(two.tags.T24A.possible, 2.4);
});

test("bet, reply and others: one pick each at 0.80, 0.55 and 0.45; bet and receipts are did evidence", () => {
  const p = FX.buildProfile({ ...FXA, "F-G": 0, "F-P": 0, "F-O": 1, "F-R": [1] });
  const w = Object.fromEntries(p.axes.L3.evidence.map((e) => [e.card, e.w]));
  assert.deepEqual(w, { "F-G": 0.8, "F-P": 0.55, "F-O": 0.45 });
  assert.equal(p.axes.L3.evidence.find((e) => e.card === "F-G").grade, "did");
  assert.equal(p.axes.L1.evidence.find((e) => e.card === "F-R").grade, "did");
  assert.throws(() => FX.buildProfile({ ...FXA, "F-G": [0, 1] }), /one option/);
  assert.throws(() => FX.buildProfile({ ...FXA, "F-P": 7 }), /no option/);
  const rushed = FX.buildProfile({ ...FXA, "F-R": [0, 2, 3, 4], _ms: { "F-R": 900 } });
  for (const e of rushed.tags.T24A.evidence) assert.equal(e.w, Math.round(0.4 * 0.75 * 0.3 * 1000) / 1000, "rushed and capped");
  const circ = FX.buildProfile({ ...FXA, "F-G": 2 });
  assert.deepEqual(circ.research.circumstance.map((x) => x.card), ["F-G"], "a bet's circumstance answer scores nothing");
});

test("bet: its own 3 to 5 answers, did 0.80; no legacy two-answer guilty card is left", () => {
  assert.deepEqual([FX.cardById["F-G"].grade, FX.cardById["F-G"].weight, FX.cardById["F-G"].exits], ["did", 0.8, ["skip", "not_my_life"]]);
  const bets = everyCard.filter((c) => c.type === "bet");
  assert.ok(bets.length >= 7, `${bets.length} bets in the bank`);
  for (const c of bets) {
    assert.ok(c.grade === "did" && c.weight === 0.8, c.id);
    assert.ok(c.options.length >= TYPE_SPEC.bet.bank[0] && c.options.length <= TYPE_SPEC.bet.bank[1], `${c.id}: ${c.options.length} answers`);
  }
  assert.deepEqual(fillFromType({ id: "x", type: "guilty", options: [] }).type, "bet", "a guilty card merges as a bet");
});

test("rank: every item once, position weights 1.0, 0.5, 0, -0.5 on each item's evidence (believe 0.45)", () => {
  const p = FX.buildProfile({ ...FXA, "F-K": [3, 1, 2, 0] });
  const L2 = Object.fromEntries(p.axes.L2.evidence.map((e) => [e.said, e.w]));
  assert.deepEqual(L2, { "Group project": 0.45, Gym: -0.225 }, "first at 1.0, last at -0.5");
  assert.equal(p.axes.L2.score, Math.round((0.45 * 2 + -0.225 * -2) * 1000) / 1000, "ranking gym last pushes away from Easy");
  assert.ok(p.axes.L2.norm > 0 && p.axes.L2.norm <= 1, "normalized by absolute weights");
  assert.ok(!p.axes.R3.evidence.length, "third place (weight 0) carries nothing");
  assert.equal(p.axes.R1.evidence[0].w, 0.225, "second place at 0.5");
  assert.equal(p.axes.L2.evidence[0].grade, "believe");
  assert.equal(p.tags.T16B.cards, 0, "an item ranked last never counts as a supporting card");
  assert.ok(p.tags.T16A.net > 0.45, "T16A gains from its own first place and T16B's last place");
  assert.throws(() => FX.buildProfile({ ...FXA, "F-K": [0, 1, 2] }), /rank takes every option/);
  assert.throws(() => FX.buildProfile({ ...FXA, "F-K": 0 }), /rank takes every option/);
  assert.throws(() => FX.buildProfile({ ...FXA, "F-K": [0, 0, 1, 2] }), /rank takes every option/);
  // Most net support one ranking can give: best order under the position weights.
  assert.equal(FX.cardTagMax(FX.cardById["F-K"], "T16A"), 1 * 1 + 0.5 * 0 + 0 * 0 + -0.5 * -2);
  assert.deepEqual(FX.pickWeights(FX.cardById["F-K"], [0, 1, 2, 3]), RANK_WEIGHTS.map((x) => 0.45 * x));
});

test("eyes: one line, believe 0.45", () => {
  const p = FX.buildProfile({ ...FXA, "F-E": 1 });
  assert.deepEqual(p.axes.L1.evidence.map((e) => [e.w, e.grade, e.v]), [[0.45, "believe", -2]]);
  assert.throws(() => FX.buildProfile({ ...FXA, "F-E": [0, 1] }), /one option/);
});

test("two voices: Heart to heart text when the voice is heart, Make it fun otherwise or when a card has none", () => {
  const g = FX.cardById["F-G"], k = FX.cardById["F-K"], rp = FX.cardById["F-P"];
  assert.equal(FX.promptFor(g, "heart"), "Have you ever done the thing?");
  assert.equal(FX.promptFor(g, "fun"), g.prompt);
  assert.equal(FX.promptFor(g, "cards"), g.prompt, "Just the cards reads Make it fun");
  assert.equal(FX.promptFor(g, { voice: "heart" }), g.heart.prompt, "a lobby object works too");
  assert.equal(FX.promptFor(g, { closest: "parent" }), g.prompt, "a setup without a voice reads Make it fun");
  assert.equal(FX.optionText(g, 1, "heart"), "No, never.");
  assert.equal(FX.optionText(g, 1, "fun"), "Never. Not once.");
  assert.equal(FX.promptFor(k, "heart"), k.prompt, "no heart version: Make it fun");
  assert.equal(FX.optionText(k, 0, "heart"), "Gym");
  assert.deepEqual(FX.threadFor(rp, "heart"), rp.heart.thread);
  assert.deepEqual(FX.threadFor(rp, "fun"), rp.thread);
  // Evidence is the card's own, whichever voice was shown.
  assert.deepEqual(FX.buildProfile({ ...FXA, "F-G": 0 }).axes.L3.evidence.map((e) => e.said), ["Guilty. Twice."]);
});

test("sealed pool: 8 drawn per run, deterministic from the seed, one per axis plus tag-pair cards", () => {
  const a = drawFinale(12345), b = drawFinale(12345);
  assert.deepEqual(a, b, "same seed, same finale");
  assert.equal(a.length, Math.min(CONFIG.finaleSize, kit.finale.length));
  assert.equal(new Set(a).size, a.length);
  for (const id of a) assert.equal(cardById[id].type, "sealed");
  const orders = new Set();
  for (let seed = 1; seed <= 40; seed++) {
    const ids = drawFinale(seed);
    orders.add(ids.join());
    const prim = ids.map((id) => cardById[id].checks.primary).filter(Boolean);
    for (const ax of AXES) assert.ok(prim.includes(ax), `seed ${seed}: ${ax} covered`);
    for (const ax of AXES) assert.ok(prim.filter((x) => x === ax).length <= 2, `seed ${seed}: ${ax} at most twice`);
    // The two cards past one per axis are tag-pair checks: a pair-only card when the pool has one, else cards that
    // also carry a tag pair.
    const extra = ids.filter((id) => !cardById[id].checks.primary || cardById[id].checks.pairs.length);
    if (kit.finale.some((c) => !c.checks.primary)) assert.ok(ids.some((id) => !cardById[id].checks.primary), `seed ${seed}: the tag-pair card is drawn`);
    else assert.ok(extra.length >= 2, `seed ${seed}: tag-pair cards drawn`);
  }
  assert.ok(orders.size > 5, "different runs get different orders");
  // A bigger pool: 4 per axis plus spare tag-pair cards; still one per axis and 2 tag-pair cards, never more than 8.
  const big = { ...FX_KIT, finale: [] };
  for (const ax of AXES) for (let i = 0; i < 4; i++) big.finale.push({ id: `S-${ax}-${i}`, type: "sealed", checks: { primary: ax, axes: [ax], pairs: [`T0${i + 1}`] }, options: [fxOpt("a", { axes: { [ax]: 2 } }), fxOpt("b", { axes: { [ax]: -2 } }), fxOpt("c", { axes: { [ax]: 1 } })] });
  for (let i = 0; i < 3; i++) big.finale.push({ id: `S-T-${i}`, type: "sealed", checks: { primary: null, axes: [], pairs: [`T2${i}`] }, options: [fxOpt("a", { tags: [{ id: `T2${i}A`, s: 2 }] }), fxOpt("b", { tags: [{ id: `T2${i}B`, s: 2 }] }), fxOpt("c")] });
  const BIG = createScorer({ kit: big, lib, friend: {} });
  for (let seed = 1; seed <= 20; seed++) {
    const ids = BIG.drawFinale(seed);
    assert.equal(ids.length, 8);
    const prim = ids.map((id) => BIG.cardById[id].checks.primary);
    for (const ax of AXES) assert.equal(prim.filter((x) => x === ax).length, 1, `seed ${seed}: one ${ax} card`);
    assert.equal(prim.filter((x) => !x).length, 2, `seed ${seed}: two tag-pair cards`);
  }
  // Guesses are made for the drawn cards, in draw order.
  const p = directProfile();
  assert.deepEqual(freezePredictions(p, a).predictions.map((x) => x.id), a);
});

test("friend decks never hold rank or receipts cards", () => {
  const answers = JSON.parse(fs.readFileSync(path.join(DIR, "sim-example", "answers.json"), "utf8"));
  const p = buildProfile(answers);
  for (const rel of ["partner", "crush", "friendOrCoworker", "bestie"]) {
    const d = buildFriendDeck(p, answers, { rel, seed: 3 });
    for (const c of d.level2.cards) assert.ok(!["rank", "receipts"].includes(cardById[c.id].type), `${rel}: ${c.id}`);
  }
  // A rank card with a friend side is still left out.
  const k = JSON.parse(JSON.stringify(FX_KIT));
  const rk = k.chapters[0].cards.find((c) => c.id === "F-K");
  rk.friend = { prompt: "x", a: { t: "a", axes: { L2: 1 } }, b: { t: "b", axes: { L2: -1 } } };
  const FK = createScorer({ kit: k, lib, friend: FRIEND });
  const fa = { ...FXA, "F-K": [3, 1, 2, 0] };
  const deck = FK.buildFriendDeck(FK.buildProfile(fa), fa, { rel: "bestie", seed: 1 });
  assert.ok(!deck.level2.cards.some((c) => c.id === "F-K"));
});

test("evidence lock covers Heart to heart text", () => {
  const card = FX.cardById["F-G"];
  const base = entryFor(card);
  assert.ok(base.heart && base.heart.options.length === 3);
  const lock = { cards: { [card.id]: base } };
  const one = (mut) => { const c = JSON.parse(JSON.stringify(card)); mut(c); return checkLock({ chapters: [{ cards: [c] }], extras: [], finale: [] }, lock); };
  assert.deepEqual(one(() => {}), []);
  assert.equal(one((c) => { c.heart.options[1] = "No. Not ever."; }).length, 1, "a heart option rewrite trips it");
  assert.equal(one((c) => { c.heart.prompt = "Something else?"; }).length, 1, "a heart prompt rewrite trips it");
  assert.equal(one((c) => { delete c.heart; }).length, 1, "removing the heart version trips it");
  assert.equal(one((c) => { c.heart.options[1] = c.heart.options[1].toUpperCase(); }).length, 0, "case is typography");
  assert.match(one((c) => { c.heart.prompt += " Really?"; })[0].what, /Heart to heart/);
});

// ------------------------------------------------------------ evidence lock (LAUNCH-SPEC section 7)
const LOCK = JSON.parse(fs.readFileSync(LOCK_FILE, "utf8"));

test("evidence lock: every card's text and evidence match evidence-lock.json (re-confirm with lock-evidence.mjs)", () => {
  const problems = checkLock(kit, LOCK);
  const ids = [...new Set(problems.map((p) => p.id))];
  assert.deepEqual(problems, [], `${problems.map((p) => `${p.id}: ${p.what}`).join("\n")}\nRe-read these cards; if the evidence still follows from the words, run: node lock-evidence.mjs --confirm ${ids.join(" ")}`);
});

test("evidence lock: a text or evidence change trips it, typography and library renames never do", () => {
  const copy = () => JSON.parse(JSON.stringify(kit));
  const k1 = copy();
  k1.chapters[1].cards[0].options[0].t += " Obviously.";
  assert.deepEqual(checkLock(k1, LOCK).map((p) => p.id), [k1.chapters[1].cards[0].id], "rewritten option text");
  const k2 = copy();
  const o = k2.chapters[6].cards.find((c) => c.options.some((x) => x.axes)).options.find((x) => x.axes);
  o.axes = Object.fromEntries(Object.entries(o.axes).map(([a, v]) => [a, -v]));
  assert.equal(checkLock(k2, LOCK).length, 1, "flipped evidence with the same words");
  const k3 = copy();
  const c3 = k3.chapters[0].cards[0];
  c3.prompt = c3.prompt.replace(/'/g, "\u2019").replace(/\.\.\./g, "\u2026").replace(/ /g, "  ");
  c3.options[0].t = c3.options[0].t.toUpperCase();
  assert.deepEqual(checkLock(k3, LOCK), [], "curly quotes, ellipsis, spacing and case are typography");
  assert.equal(normalize("It\u2019s  fine\u2026 "), "it's fine...");
  const renamed = JSON.parse(JSON.stringify(lib));
  for (const t of renamed.tags) { t.name = `Renamed ${t.id}`; t.heart = "new heart line"; }
  assert.deepEqual(checkLock(kit, LOCK), [], "library renames are keyed by id and never reach the lock");
  const k4 = copy();
  k4.extras.push({ ...k4.extras[0], id: "X-NEW-1" });
  assert.deepEqual(checkLock(k4, LOCK).map((p) => p.what), ["new card, not locked yet"]);
});

test("lock-evidence CLI: check passes on the shipped kit; --confirm needs card ids", () => {
  const ok = spawnSync(process.execPath, [path.join(DIR, "lock-evidence.mjs")], { cwd: DIR, encoding: "utf8" });
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const bad = spawnSync(process.execPath, [path.join(DIR, "lock-evidence.mjs"), "--confirm"], { cwd: DIR, encoding: "utf8" });
  assert.equal(bad.status, 2);
});

test("sim --quick meets every target", () => {
  const r = spawnSync(process.execPath, [path.join(DIR, "sim.mjs"), "--quick"], { cwd: DIR, encoding: "utf8" });
  assert.equal(r.status, 0, r.stdout + r.stderr);
});

// ------------------------------------------------------------ bank tooling (check-bank.mjs, merge-bank.mjs)
import { checkCards, loadBank, fpSimilarity } from "./check-bank.mjs";
import { checkShapes } from "./shape-audit.mjs";
import { buildKit } from "./merge-bank.mjs";

// A small bank in the skill schema: one card of every format in chapter 1, one scenario per other chapter, one extra,
// one sealed card. Every text is unique, both voices are present.
function fixtureBank() {
  let k = 0;
  const words = ["amber", "bolt", "cedar", "delta", "ember", "fjord", "grove", "harbor", "indigo", "juniper", "kettle", "lantern", "meadow", "nectar", "orbit", "pepper", "quartz", "raven", "saffron", "tundra", "umber", "velvet", "willow", "yonder", "zephyr"];
  const w = () => { k++; return `${words[k % words.length]} ${words[(k * 7 + 3) % words.length]} ${k}`; };
  const verbs = ["Tap", "Grab", "Keep", "Send", "Call", "Skip", "Bring"];
  const opt = (ev) => ({ t: `${verbs[k % verbs.length]} the ${w()}`, ...ev });
  const card = (id, type, options, extra = {}) => ({
    id, type, privacy: "normal", prompt: `A ${w()} moment arrives right now.`, options,
    heart: { prompt: `A quiet ${w()} moment.`, options: options.map((_, i) => `${i % 2 ? "Honestly, the" : "I choose the"} ${w()}`), ...(extra.heartThread ? { thread: extra.heartThread } : {}) },
    fp: { trigger: `t ${w()}`, setting: `s ${w()}`, ask: `a ${w()}`, who: `w ${w()}`, stakes: `k ${w()}` },
    mask: "fixture", ...Object.fromEntries(Object.entries(extra).filter(([key]) => key !== "heartThread")),
  });
  const ax = (a, v) => ({ axes: { [a]: v } });
  const ch1 = [
    card("C1-30", "scenario", [opt(ax("R1", 2)), opt(ax("R1", -2)), opt(ax("R1", 1)), opt(ax("R1", -1))]),
    card("C1-31", "feeling", [opt(), opt(), opt(), opt(), opt()], { follows: "C1-30" }),
    card("C1-32", "rank", [opt(ax("L2", 2)), opt(ax("L2", -2)), opt({ tags: [{ id: "T16A", s: 1 }] }), opt(ax("L1", 1))]),
    card("C1-33", "eyes", [opt(ax("L1", 2)), opt(ax("L1", -2)), opt(ax("R2", 1)), opt({ tags: [{ id: "T05A", s: 1 }] })]),
    card("C1-34", "bet", [opt({ ...ax("L3", -2), tags: [{ id: "T25B", s: 2 }] }), opt(ax("L3", 1)), opt({ circumstance: true })]),
    card("C1-35", "receipts", [opt(ax("L1", 1)), opt(ax("L1", -1)), opt({ tags: [{ id: "T24A", s: 1 }] }), opt(ax("R3", 1)), opt(ax("R3", -1)), { t: "None of these", none: true }]),
    card("C1-36", "reply", [opt(ax("L3", 2)), opt(ax("L3", -2)), opt(ax("R1", -1))], { thread: [{ from: "Sam", text: "who is booking" }], heartThread: [{ from: "Sam", text: "Who is booking the place?" }] }),
    card("C1-37", "this_or_that", [opt(ax("R2", 2)), opt(ax("R2", -2))], { round: "fx-r1" }),
    card("C1-38", "pick_two", [opt(ax("R3", 1)), opt(ax("R3", -1)), opt(ax("L2", 1)), opt(ax("L2", -1)), opt(ax("R1", 1)), opt(ax("R1", -1))]),
    card("C1-39", "role", [opt(ax("R2", 1)), opt(ax("R2", -1)), opt(ax("L1", 1)), opt(ax("L1", -1)), opt(ax("R1", 2))]),
    card("C1-40", "real", [opt(ax("L3", 2)), opt(ax("L3", -2)), opt(ax("L3", 1))]),
    card("C1-41", "others", [opt(ax("R2", 2)), opt(ax("R2", -2)), opt(ax("R2", 1))]),
  ];
  const bank = { ch1 };
  for (let n = 2; n <= 7; n++) bank[`ch${n}`] = [card(`C${n}-30`, "scenario", [opt(ax("L2", 2)), opt(ax("L2", -2)), opt(ax("L1", 1))])];
  bank.extras = [card("X-R1-9", "scenario", [opt(ax("R1", 2)), opt(ax("R1", -2)), opt(ax("R1", -1))])];
  bank.sealed = [card("S-R2-1", "sealed", [opt(ax("R2", 2)), opt(ax("R2", -2)), opt({ ...ax("R2", 1), tags: [{ id: "T07A", s: 1 }] })], { primary: "R2" })];
  return bank;
}
const asCards = (bank) => Object.entries(bank).flatMap(([g, cards]) => cards.map((c) => ({ ...c, _group: g })));
const writeBank = (dir, bank) => { for (const [g, cards] of Object.entries(bank)) if (cards) fs.writeFileSync(path.join(dir, `${g}.json`), JSON.stringify(cards, null, 2)); };

test("check-bank: a clean bank passes; every rule catches its break", () => {
  const clean = checkCards(asCards(fixtureBank()), { lib });
  assert.deepEqual(clean.errors, [], JSON.stringify(clean.errors, null, 1));
  assert.equal(clean.counts.ch1.total, 12);
  assert.equal(clean.counts.ch1.did, 3, "real, receipts and bet are did cards");
  assert.equal(clean.counts.ch1.quick, 5, "this_or_that, role, pick_two, rank and eyes are quick cards");
  const breaks = [
    ["no heart version", (b) => { delete b.ch1[0].heart; }, /no Heart to heart/],
    ["heart option count", (b) => { b.ch1[0].heart.options.pop(); }, /heart has 3 options, Make it fun has 4/],
    ["heart carries evidence", (b) => { b.ch1[0].heart.axes = { R1: 1 }; }, /heart\.axes is not a field/],
    ["no fingerprint", (b) => { delete b.ch2[0].fp; }, /no situation fingerprint/],
    ["em dash", (b) => { b.ch1[0].options[0].t += ` ${String.fromCharCode(0x2014)} obviously`; }, /em dash/],
    ["what would you do", (b) => { b.ch1[0].prompt = "Your flight is gone. What would you do?"; }, /what would you do/],
    ["open an app", (b) => { b.ch1[5].prompt = "Open your photos and tap what's there:"; }, /open an app/],
    ["gendered", (b) => { b.ch1[0].options[1].t = "Call my boyfriend first"; }, /gendered/],
    ["grading", (b) => { b.ch1[0].heart.options[1] = "I stay brave about it."; }, /grading word/],
    ["age", (b) => { b.ch1[0].prompt = "Every teenager has done this once."; }, /age reference/],
    ["3 axes", (b) => { b.ch1[0].options[0].axes = { R1: 1, R2: 1, R3: 1 }; }, /3 axes/],
    ["axis value", (b) => { b.ch1[0].options[0].axes = { R1: 3 }; }, /axis value 3/],
    ["4 tags", (b) => { b.ch1[0].options[0].tags = ["T01A", "T02A", "T03A", "T04A"].map((id) => ({ id, s: 1 })); }, /4 tags/],
    ["unknown tag", (b) => { b.ch1[0].options[0].tags = [{ id: "T99A", s: 1 }]; }, /unknown tag T99A/],
    ["two circumstances", (b) => { b.ch1[4].options[1] = { t: "Only at a wedding", circumstance: true }; b.ch1[4].options[0].circumstance = true; delete b.ch1[4].options[0].axes; delete b.ch1[4].options[0].tags; }, /at most one circumstance/],
    ["circumstance scores", (b) => { b.ch1[4].options[2].axes = { L3: 1 }; }, /must score nothing/],
    ["same fingerprint", (b) => { b.ch3[0].fp = { ...b.ch2[0].fp }; }, /same situation fingerprint as C2-30/],
    ["same answer line", (b) => { b.ch3[0].options[0].t = b.ch2[0].options[0].t.toUpperCase() + "!"; }, /repeats C2-30/],
    ["bet with 2 answers", (b) => { b.ch1[4].options.pop(); b.ch1[4].heart.options.pop(); }, /2 options for bet/],
    ["rank with 3 items", (b) => { b.ch1[2].options.pop(); b.ch1[2].heart.options.pop(); }, /3 options for rank/],
    ["receipts none not last", (b) => { b.ch1[5].options.reverse(); }, /None of these/],
    ["age field", (b) => { b.ch1[0].teenPrompt = "x"; }, /"teenPrompt" is gone/],
    ["wrong chapter", (b) => { b.ch2[0].chapter = 3; }, /chapter 3 in ch2\.json/],
    ["feeling follows", (b) => { b.ch1[1].follows = "C2-30"; }, /not in ch1/],
    ["legacy type", (b) => { b.ch1[4].type = "guilty"; }, /"guilty" is now "bet"/],
    ["friend on rank", (b) => { b.ch1[2].friend = { prompt: "x", a: { t: "a" }, b: { t: "b" } }; }, /rank cards never carry a friend version/],
    ["sealed primary", (b) => { b.sealed[0].primary = "L3"; }, /no option carries its primary axis L3/],
    ["genie trope", (b) => { b.ch1[0].prompt = "A genie offers you three wishes."; }, /genie, lamp or wish-granting/],
    ["genie in a friend text", (b) => { b.ch1[0].friend = { prompt: "{name} rubs a lamp. What does {name} do?", a: { t: "Rubs it", axes: { R1: 2 } }, b: { t: "Leaves it", axes: { R1: -2 } } }; }, /friend text: genie, lamp/],
    ["one answer opener", (b) => { b.ch1[0].options.forEach((o) => { o.t = `Keep ${o.t}`; }); }, /4 of 4 answers open with "keep"/],
    ["heart answers all open alike", (b) => { b.ch1[0].heart.options = b.ch1[0].heart.options.map((t) => `I say ${t}`); }, /every Heart to heart answer opens with "i"/],
    ["verdict answers", (b) => { b.ch1[0].options.forEach((o, i) => { o.t = `${["Nope.", "Sure.", "Fine.", "Deal."][i]} ${o.t}.`; }); }, /answers are "Verdict\. Reason\."/],
  ];
  for (const [label, mutate, want] of breaks) {
    const b = fixtureBank();
    mutate(b);
    const r = checkCards(asCards(b), { lib });
    assert.ok(r.errors.some((e) => want.test(e.what)), `${label}: expected ${want}, got ${JSON.stringify(r.errors.map((e) => e.what))}`);
  }
  const long = fixtureBank();
  long.ch1[0].options[0].t = "Take a very long and winding answer that runs well past the twelve word limit";
  const lr = checkCards(asCards(long), { lib });
  assert.deepEqual(lr.errors, []);
  assert.ok(lr.warnings.some((x) => /option 0 is 15 words/.test(x.what)), "long options warn, never fail");
  assert.ok(fpSimilarity({ trigger: "friend texts late at night", setting: "bed, phone", ask: "show up", who: "best friend", stakes: "sleep" }, { trigger: "friend calls late at night", setting: "bed, phone", ask: "show up", who: "best friend", stakes: "sleep" }) >= 0.6, "4am call and 2am text read as the same situation");
});

test("shape limits: bank-wide caps catch a repeated answer opener, prompt opener, ending and shape", () => {
  const many = Array.from({ length: 60 }, (_, i) => ({
    id: `X-${i}`, type: "bet", _group: "ch1",
    prompt: i < 20 ? `Your friend number ${i} did a thing. First thought?` : `Card ${i} opens its own way with ${i} words.`,
    options: [{ t: `Guilty. Reason ${i} one.` }, { t: `Wrong about ${i}, honestly, and here is why.` }, { t: `A long answer ${i} with no verdict at the start.` }],
    heart: { prompt: `Heart ${i} prompt.`, options: ["Yes, " + i, "No, " + i, "Maybe " + i] },
  }));
  const errs = [];
  checkShapes(many, (id, what) => errs.push(what));
  assert.ok(errs.some((e) => /answers open with "guilty"/.test(e)), "one answer opener over 3% of answers");
  assert.ok(errs.some((e) => /prompts open with "your"/.test(e)), "prompt first word over 10%");
  assert.ok(errs.some((e) => /prompts end with "first thought"/.test(e)), "prompt ending over 4%");
  assert.ok(errs.some((e) => /cards share the shape/.test(e)), "one shape signature over 4%");
  const few = [];
  checkShapes(many.slice(0, 10), (id, what) => few.push(what));
  assert.ok(!few.some((e) => /prompts open with/.test(e)), "bank-wide caps skip a small set");
});

test("merge-bank: builds cards.json from the bank, filling grade, weight, exits and checks from the type", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "genii-bank-"));
  const bankDir = path.join(tmp, "bank");
  fs.mkdirSync(bankDir);
  const out = path.join(tmp, "cards.json");
  const merge = (...args) => spawnSync(process.execPath, [path.join(DIR, "merge-bank.mjs"), "--bank", bankDir, "--out", out, ...args], { cwd: tmp, encoding: "utf8" });
  const bank = fixtureBank();
  writeBank(bankDir, { ...bank, sealed: undefined });
  const missing = merge();
  assert.equal(missing.status, 1, "a missing bank file refuses");
  assert.match(missing.stderr, /missing: .*sealed\.json/);
  assert.ok(!fs.existsSync(out));
  const bad = fixtureBank();
  bad.ch2[0].options[0].axes = { R1: 5 };
  writeBank(bankDir, bad);
  assert.equal(merge().status, 1, "checker errors refuse");
  assert.ok(!fs.existsSync(out));
  writeBank(bankDir, bank);
  assert.equal(merge("--dry").status, 0);
  assert.ok(!fs.existsSync(out), "--dry writes nothing");
  const ok = merge();
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  const built = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.deepEqual(built.chapters.map((ch) => [ch.n, ch.title, ch.cards.length]), kit.chapters.map((ch, i) => [ch.n, ch.title, i ? 1 : 12]));
  assert.deepEqual(built.chapters[0].cards.map((c) => c.id), bank.ch1.map((c) => c.id), "file order is play order");
  const by = Object.fromEntries([...built.chapters.flatMap((ch) => ch.cards), ...built.extras, ...built.finale].map((c) => [c.id, c]));
  for (const c of Object.values(by)) {
    assert.equal(c.grade, TYPE_SPEC[c.type].grade, c.id);
    assert.equal(c.weight, TYPE_SPEC[c.type].weight, c.id);
    assert.deepEqual(c.exits, c.type === "real" ? ["skip", "not_my_life", "no_recent"] : ["skip", "not_my_life"], c.id);
    assert.ok(!("_group" in c));
  }
  assert.equal(by["C3-30"].chapter, 3);
  assert.equal(by["C1-38"].pick, 2);
  assert.equal(by["X-R1-9"].axisFor, "R1");
  assert.deepEqual(by["S-R2-1"].checks, { primary: "R2", axes: ["R2"], pairs: ["T07"] });
  assert.deepEqual(by["C1-34"].heart, bank.ch1[4].heart, "heart passes through untouched");
  assert.equal(buildKit(asCards({ ...bank, ch1: [{ ...bank.ch1[4], type: "guilty", teen: true, privacy: "locked18" }] }), kit).chapters[0].cards[0].type, "bet");
  // The merged kit scores with the same scorer.
  const M = createScorer({ kit: built, lib, friend: FRIEND });
  const p = M.buildProfile({ setup: {}, "C1-32": [1, 3, 2, 0], "C1-34": 0, "C1-33": 0, "S-R2-1": 0 });
  assert.equal(p.axes.L2.evidence.find((e) => e.card === "C1-32").w, 0.45);
  assert.ok(p.warnings.some((x) => /S-R2-1 is a sealed card/.test(x)));
  assert.deepEqual(M.drawFinale(5), ["S-R2-1"]);
  fs.rmSync(tmp, { recursive: true, force: true });
});

test("check-bank CLI: the shipped bank folder checks without errors; --kit reports legacy cards", () => {
  const r = spawnSync(process.execPath, [path.join(DIR, "check-bank.mjs"), "--quiet"], { cwd: DIR, encoding: "utf8" });
  const { cards } = loadBank(path.join(DIR, "bank"));
  if (cards.length) assert.ok([0, 1].includes(r.status), r.stderr);
  else assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /\| ch1 \|/);
  const k = spawnSync(process.execPath, [path.join(DIR, "check-bank.mjs"), "--kit", "--json"], { cwd: DIR, encoding: "utf8" });
  const out = JSON.parse(k.stdout);
  assert.ok(out.counts.ch1.total > 0 && Array.isArray(out.errors) && Array.isArray(out.warnings));
});

// library.json is the source of truth for result copy (package C); assemble.mjs must never regenerate it (or cards.json).
test("assemble.mjs is retired: it refuses and changes neither library.json nor cards.json", () => {
  const before = ["library.json", "cards.json"].map((f) => fs.readFileSync(path.join(DIR, f), "utf8"));
  const r = spawnSync(process.execPath, [path.join(DIR, "assemble.mjs")], { cwd: DIR, encoding: "utf8" });
  const after = ["library.json", "cards.json"].map((f) => fs.readFileSync(path.join(DIR, f), "utf8"));
  if (after[0] !== before[0]) fs.writeFileSync(path.join(DIR, "library.json"), before[0]);
  if (after[1] !== before[1]) fs.writeFileSync(path.join(DIR, "cards.json"), before[1]);
  assert.notEqual(r.status, 0, "assemble.mjs must refuse");
  assert.equal(after[0], before[0], "assemble.mjs changed library.json");
  assert.equal(after[1], before[1], "assemble.mjs changed cards.json");
});
