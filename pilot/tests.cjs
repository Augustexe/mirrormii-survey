// node --test tests.cjs
const test = require("node:test");
const assert = require("node:assert/strict");
const BANK = require("./bank.js");
const E = require("./engine.js");
const PERSONAS = require("./personas.cjs");

const allStrings = (o) => typeof o === "string" ? [o] : Array.isArray(o) ? o.flatMap(allStrings) : o && typeof o === "object" ? Object.values(o).flatMap(allStrings) : [];

test("every dimension is complete and uniquely named", () => {
  const ids = new Set();
  for (const d of BANK.DIMENSIONS) {
    assert.ok(!ids.has(d.id), `duplicate ${d.id}`); ids.add(d.id);
    for (const k of ["A", "B", "never", "domain"]) assert.ok(d[k], `${d.id} missing ${k}`);
    assert.ok(BANK.DOMAINS[d.domain], `${d.id} unknown domain`);
    for (const k of ["prompt", "a", "b", "mask", "feel"]) assert.ok(d.stance[k], `${d.id} stance missing ${k}`);
    assert.ok(d.sally.length, `${d.id} has no Sally source`);
  }
});

test("scene and sealed options are symmetric: both poles reachable", () => {
  for (const d of BANK.DIMENSIONS.filter((x) => x.scene)) {
    const lv = d.scene.options.map((o) => o.level).filter((x) => typeof x === "number");
    assert.ok(lv.some((x) => x < 0) && lv.some((x) => x > 0), `${d.id} scene is one-sided`);
    assert.ok(d.scene.options.length >= 4, `${d.id} needs 4 options`);
  }
  for (const h of BANK.SEALED) {
    const dim = BANK.DIMENSIONS.find((d) => d.id === h.dim);
    assert.ok(dim, `${h.id} unknown dim`);
    const lv = h.options.map((o) => o.level);
    assert.ok(lv.some((x) => x < 0) && lv.some((x) => x > 0), `${h.id} one-sided`);
  }
});

test("copy has no em dashes and no gendered defaults", () => {
  const text = allStrings(BANK).join("\n");
  assert.ok(!text.includes("—"), "em dash found");
  for (const w of [/\bboyfriend\b/i, /\bgirlfriend\b/i, /\bhusband\b/i, /\bwife\b/i, /\bthe man\b/i, /\bthe woman\b/i, /\bhe pays\b/i, /\bshe pays\b/i]) {
    assert.ok(!w.test(text.replace(/"never"/g, "")), `gendered wording ${w}`);
  }
});

test("teens skip adult-only items and get teen prompts", () => {
  const teen = E.eligibleDimensions(BANK, { age: "teen" });
  assert.ok(teen.every((d) => !d.adultOnly));
  const strings = BANK.DIMENSIONS.find((d) => d.id === "strings_attached");
  assert.match(E.stancePrompt(strings, { age: "teen" }), /curfew/);
});

test("contradiction and strength rules", () => {
  const answers = { setup: { age: "adult" }, stance: { support_capacity: { level: 2, ms: 3000 } }, scene: { support_capacity: { option: 0, ms: 5000 } }, sealed: {} };
  const t = E.computeProfile(BANK, answers).tags.find((x) => x.id === "support_capacity");
  assert.equal(t.contradiction, true);
  assert.equal(t.strength, "split");
  assert.equal(t.level, -2, "the scene (what she did) sets the level");
  const p = E.predictSealed(BANK, E.computeProfile(BANK, answers)).find((x) => x.id === "H01");
  assert.equal(p.abstain, true, "no sealed guess on a split tag");
});

// Synthetic respondents with a hidden true level per dimension. Tests the pipeline, not human validity.
function rng(seed) { return () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648); }
function simulate(kind, n, seed) {
  const r = rng(seed);
  let nonNeutral = 0, exact = 0, side = 0, guessed = 0;
  for (let k = 0; k < n; k++) {
    const latent = Object.fromEntries(BANK.DIMENSIONS.map((d) => [d.id, [-2, -1, 1, 2][Math.floor(r() * 4)]]));
    const near = (lv) => kind === "random" ? [-2, -1, 0, 1, 2][Math.floor(r() * 5)] : Math.max(-2, Math.min(2, lv + (r() < 0.25 ? (r() < 0.5 ? -1 : 1) : 0)));
    const pick = (opts, lv) => { let best = 0, bd = 9; opts.forEach((o, i) => { if (typeof o.level === "number") { const d = Math.abs(o.level - lv) + r() * 0.01; if (d < bd) { bd = d; best = i; } } }); return best; };
    const answers = { setup: { age: "adult" }, stance: {}, scene: {}, sealed: {} };
    for (const d of BANK.DIMENSIONS) {
      answers.stance[d.id] = { level: r() < 0.08 ? null : near(latent[d.id]), ms: 3000 };
      if (d.scene) answers.scene[d.id] = r() < 0.1 ? { option: null, exit: "no_recent" } : { option: kind === "random" ? Math.floor(r() * d.scene.options.length) : pick(d.scene.options, near(latent[d.id])) };
    }
    const prof = E.computeProfile(BANK, answers);
    const preds = E.predictSealed(BANK, prof);
    for (const h of BANK.SEALED) answers.sealed[h.id] = { option: kind === "random" ? Math.floor(r() * 4) : pick(h.options, near(latent[h.dim])) };
    const sc = E.scoreSealed(BANK, preds, answers.sealed);
    nonNeutral += prof.coverage.nonNeutral; exact += sc.exact; side += sc.side; guessed += sc.guessed;
  }
  return { avgNonNeutral: +(nonNeutral / n).toFixed(1), exactRate: +(exact / guessed).toFixed(2), sideRate: +(side / guessed).toFixed(2) };
}

test("pipeline: consistent respondents are predicted, random ones are not", () => {
  const consistent = simulate("consistent", 400, 7);
  const random = simulate("random", 400, 11);
  console.log("synthetic consistent", consistent, "random", random);
  assert.ok(consistent.exactRate > 0.5, "engine should recover a consistent respondent");
  assert.ok(random.exactRate < 0.35, "random answers should not look predictable");
  assert.ok(consistent.avgNonNeutral >= 20);
});

test("persona runs: Jasmine (SYN-23) and Jordan (SYN-17)", () => {
  for (const p of PERSONAS) {
    const answers = p.answers;
    const prof = E.computeProfile(BANK, answers);
    const preds = E.predictSealed(BANK, prof);
    const sc = E.scoreSealed(BANK, preds, answers.sealed);
    const tags = prof.tags.filter((t) => t.level).map((t) => `${t.strength === "split" ? "SPLIT " : ""}${t.label}${t.contradiction ? ` (believes ${t.stanceSaid})` : ""}`);
    console.log(`\n${p.name}: ${prof.coverage.nonNeutral}/${prof.coverage.dimensions} non-neutral, ${prof.coverage.contradictions} contradictions, sealed ${sc.exact} exact / ${sc.side} right side of ${sc.guessed} guessed, ${sc.abstained} passed`);
    console.log("  " + tags.join(" · "));
    assert.ok(prof.coverage.nonNeutral >= 20);
  }
});
