// The drama stats (Jerry, 2026-09-30; src/persona/rpg-stats.js, LAUNCH-SPEC sections 3 and 6). Each stat is
// recomputed here from the profile with its own copy of the documented formula, every score is a whole number from 1
// to 20, the Stories screen picks the three highest plus the most surprising one (else the fourth highest), the dump
// stat is the lowest, the same profile always gives the same numbers, every stat moves only with its listed evidence,
// thin evidence lands near the middle, and the calibration sim spreads typical players from about 6 to 18. The new
// copy passes the never-say list and the voice rules.
import test from "node:test";
import assert from "node:assert/strict";
import * as R from "../src/persona/rpg-stats.js";
import { LIB } from "../src/persona/kit.js";
import { simulateProfiles, quantile } from "../scripts/calibrate-drama.mjs";

// The formulas as documented (rpg-stats.js header and LAUNCH-SPEC section 6), written out again on purpose.
const FORMULAS = {
  CHA: [["axis", "R1", 1, 1.0], ["axis", "R2", -1, 1.0], ["tag", "T04B", 1.0], ["tag", "T08A", 0.8]],
  ROM: [["tag", "T09A", 1.5], ["tag", "T05B", 1.0], ["tag", "T10A", 0.5]],
  LOY: [["axis", "R1", 1, 1.0], ["tag", "T18A", 1.0], ["tag", "T05A", 0.8], ["tag", "T10A", 0.8]],
  PEACE: [["axis", "R2", -1, 1.0], ["tag", "T08A", 1.0], ["tag", "T10B", 0.8], ["tag", "T25B", 0.8]],
  TEA: [["axis", "L3", -1, 1.0], ["tag", "T02B", 1.0], ["tag", "T08B", 1.0], ["tag", "T24A", 0.6]],
  PETTY: [["axis", "R2", 1, 1.0], ["tag", "T08B", 1.0], ["tag", "T02B", 0.8], ["tag", "T12A", 0.6]],
};
const pairOf = (id) => id.slice(0, 3) + (id.endsWith("A") ? "B" : "A");

function reference(profile, id) {
  let sw = 0, sx = 0, sc = 0;
  for (const f of FORMULAS[id]) {
    let x = 0, c = 0;
    if (f[0] === "axis") {
      const a = profile.axes[f[1]];
      const w = f[3];
      if (a && !a.unfinished) { x = Math.max(-1, Math.min(1, a.norm)) * f[2]; c = 1 - Math.exp(-a.cards / 3); }
      sw += w; sx += w * c * x; sc += w * c;
    } else {
      const t = profile.tags[f[1]];
      const p = profile.tags[pairOf(f[1])];
      const net = t ? t.net : p ? -p.net : 0;
      const n = (t ? t.cards : 0) + (p ? p.cards : 0);
      if (n || net) { x = Math.tanh(net / 2.5); c = 1 - Math.exp(-n / 2.5); }
      sw += f[2]; sx += f[2] * c * x; sc += f[2] * c;
    }
  }
  const raw = sx / sw;
  const conf = sc / sw;
  // Percentile knots to scores, linear, ends running to 1 and 20.
  const xs = R.CALIBRATION[id];
  const ys = [3, 6, 9, 12, 15, 18, 20];
  let mapped;
  if (raw <= xs[0]) mapped = 1 + (ys[0] - 1) * Math.max(0, Math.min(1, (raw + 1) / (xs[0] + 1)));
  else if (raw >= xs[6]) mapped = ys[6] + (20 - ys[6]) * Math.max(0, Math.min(1, (raw - xs[6]) / (1 - xs[6])));
  else { let i = 1; while (raw > xs[i]) i++; mapped = ys[i - 1] + (ys[i] - ys[i - 1]) * (raw - xs[i - 1]) / (xs[i] - xs[i - 1]); }
  const k = Math.max(0, Math.min(1, conf / R.CONF_FULL));
  return { raw, conf, score: Math.round(Math.max(1, Math.min(20, 12 + (mapped - 12) * k))) };
}

let PROFILES = null;
const profiles = () => (PROFILES ||= simulateProfiles({ n: 270, tag: "dramatest" }));

test("the six stats: formulas as documented, every listed id is a real axis or a real, shareable trait", () => {
  assert.deepEqual(R.DRAMA_ORDER, ["CHA", "ROM", "LOY", "PEACE", "TEA", "PETTY"]);
  assert.deepEqual(R.DRAMA_ORDER.map((id) => R.DRAMA_STATS[id].name), ["Charm", "Romance", "Loyalty", "Peacemaker", "Tea Radar", "Petty"]);
  const axes = new Set(LIB.axes.map((a) => a.id));
  const tags = Object.fromEntries(LIB.tags.map((t) => [t.id, t]));
  for (const id of R.DRAMA_ORDER) {
    const parts = R.DRAMA_STATS[id].parts;
    assert.deepEqual(parts.map((p) => (p.kind === "axis" ? ["axis", p.axis, p.pole, p.w] : ["tag", p.tag, p.w])), FORMULAS[id], `${id}: formula`);
    for (const p of parts) {
      if (p.kind === "axis") assert.ok(axes.has(p.axis) && Math.abs(p.pole) === 1, `${id}: ${p.axis}`);
      else {
        assert.ok(tags[p.tag], `${id}: ${p.tag} is a library tag`);
        assert.ok(!tags[p.tag].locked18, `${id}: never a kids or wedding tag (${p.tag})`);
      }
      assert.ok(p.about && p.w > 0, `${id}: every part says what it reads`);
    }
    assert.equal(R.CALIBRATION[id].length, R.KNOTS.length, `${id}: one raw value per knot`);
    assert.ok(R.CALIBRATION[id].every((v, i, a) => !i || v > a[i - 1]), `${id}: knots rise`);
  }
});

test("each stat recomputed from the profile matches, in range 1 to 20, deterministic", () => {
  for (const p of profiles()) {
    const got = R.dramaStats(p);
    const again = R.dramaStats(JSON.parse(JSON.stringify(p)));
    assert.deepEqual(again, got, "the same profile gives the same numbers");
    for (const s of got) {
      const want = reference(p, s.id);
      assert.ok(Math.abs(s.raw - want.raw) < 1e-9 && Math.abs(s.conf - want.conf) < 1e-9, `${s.id}: raw and confidence`);
      assert.equal(s.score, want.score, `${s.id}: score`);
      assert.ok(Number.isInteger(s.score) && s.score >= 1 && s.score <= 20, `${s.id}: ${s.score} in range`);
    }
  }
});

test("the stat screen picks the three highest plus the most surprising (else the fourth); the dump stat is the lowest", () => {
  let surprise = 0;
  let fourth = 0;
  for (const p of profiles()) {
    const six = R.dramaStats(p);
    const pick = R.topFour(six);
    assert.equal(pick.length, 4);
    assert.equal(new Set(pick.map((s) => s.id)).size, 4, "four different stats");
    const high = six.slice().sort((a, b) => b.score - a.score || b.raw - a.raw || a.order - b.order);
    assert.deepEqual(pick.slice(0, 3).map((s) => s.id), high.slice(0, 3).map((s) => s.id), "the three highest first");
    const most = six.reduce((m, s) => (s.surprise > m.surprise ? s : m), six[0]);
    if (high.slice(0, 3).some((s) => s.id === most.id)) { assert.equal(pick[3].id, high[3].id, "the fourth highest"); assert.equal(pick[3].pick, "top"); fourth++; }
    else { assert.equal(pick[3].id, most.id, "the most surprising"); assert.equal(pick[3].pick, "surprise"); surprise++; }
    // Most surprising: furthest from the population median for its spread.
    for (const s of six) {
      const k = R.CALIBRATION[s.id];
      assert.ok(Math.abs(s.surprise - Math.abs(s.raw - k[3]) / (k[4] - k[2]) * Math.min(1, s.conf / R.CONF_FULL)) < 1e-9, `${s.id}: surprise`);
    }
    const dump = R.dumpStat(six);
    assert.ok(six.every((s) => s.score >= dump.score), "nothing below the dump stat");
    assert.equal(R.topStat(six).id, high[0].id);
  }
  assert.ok(surprise >= 20 && fourth >= 20, `both picks exercised (${surprise} surprise, ${fourth} fourth highest)`);
});

test("stats trace to their listed evidence only; thin evidence lands near the middle", () => {
  const base = profiles()[3];
  const listed = new Set(R.DRAMA_ORDER.flatMap((id) => R.DRAMA_STATS[id].parts.map((p) => p.axis || p.tag)));
  // Evidence nobody lists (L1, L2, R3, T13A and more) never moves a stat.
  const moved = JSON.parse(JSON.stringify(base));
  for (const ax of ["R3", "L1", "L2"]) moved.axes[ax] = { ...moved.axes[ax], norm: -moved.axes[ax].norm || 0.9, cards: 9 };
  for (const id of ["T13A", "T14A", "T16A", "T20A"]) moved.tags[id] = { net: 6, cards: 5 };
  assert.ok(!["R3", "L1", "L2", "T13A", "T14A", "T16A", "T20A"].some((x) => listed.has(x)));
  assert.deepEqual(R.dramaStats(moved).map((s) => s.score), R.dramaStats(base).map((s) => s.score), "unlisted evidence changes nothing");
  // Each listed part moves its own stat: a strong push on it raises the stat (or holds it at 20).
  for (const id of R.DRAMA_ORDER) {
    for (const part of R.DRAMA_STATS[id].parts) {
      const p = JSON.parse(JSON.stringify(base));
      if (part.kind === "axis") p.axes[part.axis] = { ...p.axes[part.axis], norm: part.pole, cards: 12, unfinished: false };
      else { p.tags[part.tag] = { ...(p.tags[part.tag] || {}), net: 8, cards: 6 }; delete p.tags[pairOf(part.tag)]; }
      const before = R.dramaStats(base).find((s) => s.id === id);
      const after = R.dramaStats(p).find((s) => s.id === id);
      assert.ok(after.raw > before.raw || before.score === 20, `${id}: ${part.axis || part.tag} pushes the stat up`);
    }
  }
  // No evidence at all: every stat sits at the middle. A run with a handful of answers stays soft.
  for (const s of R.dramaStats({ axes: {}, tags: {} })) assert.equal(s.score, R.MID, `${s.id}: no evidence, the middle`);
  for (const s of R.dramaStats({})) assert.equal(s.score, R.MID);
  const thin = { axes: { R1: { norm: 1, cards: 1, unfinished: true }, R2: { norm: -1, cards: 1, unfinished: true }, L3: { norm: -1, cards: 1, unfinished: true } }, tags: { T08B: { net: 1, cards: 1 } } };
  for (const s of R.dramaStats(thin)) assert.ok(Math.abs(s.score - R.MID) <= 3, `${s.id}: thin evidence stays soft (${s.score})`);
  assert.equal(R.lineSide(R.MID - 1), "high");
  assert.equal(R.lineSide(R.MID - 2), "low");
});

test("calibration: typical players spread about 6 to 18 on every stat, not everyone at the middle", () => {
  const all = profiles().map((p) => R.dramaStats(p));
  for (const id of R.DRAMA_ORDER) {
    const xs = all.map((six) => six.find((s) => s.id === id).score).sort((a, b) => a - b);
    const p05 = quantile(xs, 0.05);
    const p50 = quantile(xs, 0.5);
    const p95 = quantile(xs, 0.95);
    assert.ok(p05 >= 4 && p05 <= 8, `${id}: 5th percentile ${p05}`);
    assert.ok(p95 >= 16 && p95 <= 19, `${id}: 95th percentile ${p95}`);
    assert.ok(p50 >= 10 && p50 <= 14, `${id}: median ${p50}`);
    assert.ok(new Set(xs).size >= 12, `${id}: ${new Set(xs).size} different scores`);
    const counts = xs.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
    assert.ok(Math.max(...counts.values()) <= xs.length * 0.2, `${id}: no score holds a fifth of players`);
  }
  // Every stat is somebody's top stat and somebody's dump stat.
  const tops = new Set(all.map((six) => R.topStat(six).id));
  const dumps = new Set(all.map((six) => R.dumpStat(six).id));
  assert.equal(tops.size, 6, `top stats seen: ${[...tops]}`);
  assert.equal(dumps.size, 6, `dump stats seen: ${[...dumps]}`);
});

test("the drama copy: four lines per stat in both voices, never-say clean, affectionate, upright and number-free", () => {
  const NEVER = /\b(streaks?|gacha|lottery|jackpot|predicts?|predicted|clinically|diagnos\w*|treat(ment|ed|ing|s)?|cures?|prevent\w*|dna|genomic|genies?|lamps?|wish(es|ed)?|energy|evidence|axis|score|result|profile)\b|—|%/i;
  const HEART = /\b(boundaries|valid|healing|trauma|toxic|self-care|kind|brave|healthy|mature|selfish|responsible)\b|!/i;
  const GENDERED = /\b(girls?|girlies?|queens?|divas?|ladies|lady|guys?|bros?|dudes?|boyfriends?|girlfriends?|wives|wife|husbands?|moms?|dads?|babes?|kings?)\b/i;
  const MEAN = /\b(stupid|dumb|loser|boring|lame|weirdo|cringe|annoying|clingy|needy|cold|fake|shallow)\b/i;
  const RETIRED = /\b(Closeness|Hard truths|Traditions|New things|Pace)\b/;
  assert.ok(LIB.drama && typeof LIB.drama.rule === "string");
  for (const id of R.DRAMA_ORDER) {
    const c = LIB.drama.stats[id];
    for (const f of ["high", "low", "top", "dump"]) {
      const { fun, heart } = c[f];
      assert.ok(fun && heart && fun !== heart, `${id}.${f}: two voices`);
      for (const [v, line] of [["fun", fun], ["heart", heart]]) {
        assert.doesNotMatch(line, NEVER, `${id}.${f} ${v}: never-say`);
        assert.doesNotMatch(line, /\d/, `${id}.${f} ${v}: no numbers`);
        assert.doesNotMatch(line, GENDERED, `${id}.${f} ${v}: no gendered words`);
        assert.doesNotMatch(line, MEAN, `${id}.${f} ${v}: never mean`);
        assert.doesNotMatch(line, RETIRED, `${id}.${f} ${v}: no retired stat name`);
        assert.doesNotMatch(line, /\b(AI|kids?|children|wedding|married|marriage)\b/, `${id}.${f} ${v}: never about AI, kids or weddings`);
        assert.doesNotMatch(line, /\bwith \w+ energy\b|You'd say|Last time, you/i, `${id}.${f} ${v}: voice rules`);
        const words = line.split(/\s+/).length;
        assert.ok(f === "high" || f === "low" ? words <= 12 : words <= 18, `${id}.${f} ${v}: short (${words} words)`);
      }
      assert.doesNotMatch(heart, HEART, `${id}.${f} heart: no therapy or grading words, no exclamation`);
      assert.doesNotMatch(heart, /\b(do not|does not|is not|are not|cannot|it is|you are|you will|you would)\b/i, `${id}.${f} heart: contractions`);
    }
  }
  for (const f of ["title", "intro", "top", "dump"]) {
    const v = LIB.article.stats[f];
    assert.ok(v.fun && v.heart, `article.stats.${f}`);
    for (const line of [v.fun, v.heart]) { assert.doesNotMatch(line, NEVER); assert.doesNotMatch(line, /\d/); }
  }
  assert.equal(LIB.article.stats.dump.fun, "Dump stat");
});
