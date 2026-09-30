#!/usr/bin/env node
// Validates the backend contracts in docs/contracts against the real kit and the real app code. Plain Node 22, no
// dependencies (the schemas are standard JSON Schema draft 2020-12; this file carries a small validator for the subset
// they use, so the check runs anywhere `node --test` runs. A server can load the same schemas into Ajv 2020).
//
//   node scripts/validate-contracts.mjs          -> one line per check, exit 1 on any failure
//   node scripts/validate-contracts.mjs --json   -> the same as JSON
//   node scripts/validate-contracts.mjs --write-examples -> rewrites docs/contracts/examples/*.json from a real run
//
// What is checked (docs/contracts/README.md):
//   1. every schema is draft 2020-12, has an $id and uses only the keywords this validator knows
//   2. cards.json (full and build-stripped), library.json and friend.json against their schemas
//   3. real runs: simulated players drive the app's own step machine (quiz64/src/persona/session.js) to a finished
//      run in every voice; the stored run, the result record, the app's resultView, the friend links (challenge and
//      reply, decoded), the saved challenge and reply, and the proposed server shapes are validated
//   4. the question pack export (docs/question-pack) is current with cards.json
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as QuestionPack from "./export-question-pack.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const CONTRACTS = path.join(ROOT, "docs", "contracts");
const KIT_DIR = path.join(ROOT, "research", "persona-quiz-v2", "final");
const DRAFT = "https://json-schema.org/draft/2020-12/schema";

// ---------------------------------------------------------------- a small JSON Schema 2020-12 validator
const ANNOTATIONS = new Set(["$schema", "$id", "$comment", "title", "description", "default", "examples", "deprecated", "readOnly", "writeOnly", "format", "$defs"]);
const KEYWORDS = new Set([
  "type", "enum", "const", "properties", "required", "additionalProperties", "patternProperties", "propertyNames",
  "minProperties", "maxProperties", "items", "prefixItems", "minItems", "maxItems", "uniqueItems", "contains",
  "minimum", "maximum", "exclusiveMinimum", "exclusiveMaximum", "multipleOf", "minLength", "maxLength", "pattern",
  "$ref", "allOf", "anyOf", "oneOf", "not", "if", "then", "else",
]);

const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
const typeOk = (v, t) => (t === "number" ? typeof v === "number" && Number.isFinite(v) : t === "integer" ? Number.isInteger(v) : typeOf(v) === t);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const esc = (k) => String(k).replaceAll("~", "~0").replaceAll("/", "~1");

// Registry: every docs/contracts/*.schema.json by file name and by $id.
export function loadSchemas(dir = CONTRACTS) {
  const reg = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".schema.json")).sort()) {
    const schema = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    reg.set(f, schema);
    if (schema.$id) reg.set(schema.$id, schema);
  }
  return reg;
}

function resolveRef(ref, doc, reg) {
  const [file, frag = ""] = ref.split("#");
  let target = file ? reg.get(file) || reg.get(path.basename(file)) : doc;
  if (!target) throw new Error(`unknown schema file in $ref ${ref}`);
  const base = target;
  for (const part of frag.split("/").filter(Boolean)) {
    target = target[part.replaceAll("~1", "/").replaceAll("~0", "~")];
    if (target === undefined) throw new Error(`unresolved $ref ${ref}`);
  }
  return { schema: target, doc: base };
}

// Returns a list of { at, error } (empty when valid). doc is the schema document local refs resolve against.
export function validate(schema, value, { reg = new Map(), doc = schema, at = "" } = {}) {
  const errs = [];
  const fail = (error) => errs.push({ at: at || "/", error });
  if (schema === true) return errs;
  if (schema === false) { fail("no value is allowed here"); return errs; }
  for (const k of Object.keys(schema)) {
    if (!KEYWORDS.has(k) && !ANNOTATIONS.has(k) && !k.startsWith("x-")) throw new Error(`schema keyword "${k}" at ${at || "/"} is outside the supported subset`);
  }
  const sub = (s, v, where, d = doc) => validate(s, v, { reg, doc: d, at: where });
  if (schema.$ref) {
    const r = resolveRef(schema.$ref, doc, reg);
    errs.push(...sub(r.schema, value, at, r.doc));
  }
  if (schema.type !== undefined) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((t) => typeOk(value, t))) { fail(`expected ${types.join(" or ")}, got ${typeOf(value)}`); return errs; }
  }
  if (schema.enum && !schema.enum.some((e) => same(e, value))) fail(`not one of ${JSON.stringify(schema.enum).slice(0, 160)}: ${JSON.stringify(value).slice(0, 80)}`);
  if (schema.const !== undefined && !same(schema.const, value)) fail(`expected ${JSON.stringify(schema.const)}, got ${JSON.stringify(value).slice(0, 80)}`);
  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) fail(`${value} < minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) fail(`${value} > maximum ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) fail(`${value} <= ${schema.exclusiveMinimum}`);
    if (schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) fail(`${value} >= ${schema.exclusiveMaximum}`);
    if (schema.multipleOf !== undefined && Math.abs(value / schema.multipleOf - Math.round(value / schema.multipleOf)) > 1e-9) fail(`${value} is not a multiple of ${schema.multipleOf}`);
  }
  if (typeof value === "string") {
    const n = [...value].length;
    if (schema.minLength !== undefined && n < schema.minLength) fail(`shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && n > schema.maxLength) fail(`longer than ${schema.maxLength}`);
    if (schema.pattern !== undefined && !new RegExp(schema.pattern, "u").test(value)) fail(`"${value.slice(0, 60)}" does not match ${schema.pattern}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`fewer than ${schema.minItems} items (${value.length})`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail(`more than ${schema.maxItems} items (${value.length})`);
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) fail("items are not unique");
    const pre = schema.prefixItems || [];
    pre.forEach((s, i) => { if (i < value.length) errs.push(...sub(s, value[i], `${at}/${i}`)); });
    if (schema.items !== undefined) for (let i = pre.length; i < value.length; i++) errs.push(...sub(schema.items, value[i], `${at}/${i}`));
    if (schema.contains !== undefined && !value.some((v, i) => !sub(schema.contains, v, `${at}/${i}`).length)) fail("no item matches contains");
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const keys = Object.keys(value);
    if (schema.minProperties !== undefined && keys.length < schema.minProperties) fail(`fewer than ${schema.minProperties} properties`);
    if (schema.maxProperties !== undefined && keys.length > schema.maxProperties) fail(`more than ${schema.maxProperties} properties`);
    for (const r of schema.required || []) if (!Object.prototype.hasOwnProperty.call(value, r)) fail(`missing required "${r}"`);
    const props = schema.properties || {};
    const pats = Object.entries(schema.patternProperties || {}).map(([p, s]) => [new RegExp(p, "u"), s]);
    for (const k of keys) {
      const where = `${at}/${esc(k)}`;
      if (schema.propertyNames) { const e = sub(schema.propertyNames, k, where); if (e.length) fail(`property name "${k}" is not allowed`); }
      let matched = false;
      if (Object.prototype.hasOwnProperty.call(props, k)) { matched = true; errs.push(...sub(props[k], value[k], where)); }
      for (const [re, s] of pats) if (re.test(k)) { matched = true; errs.push(...sub(s, value[k], where)); }
      if (!matched && schema.additionalProperties !== undefined) {
        if (schema.additionalProperties === false) fail(`unexpected property "${k}"`);
        else errs.push(...sub(schema.additionalProperties, value[k], where));
      }
    }
  }
  for (const s of schema.allOf || []) errs.push(...sub(s, value, at));
  if (schema.anyOf && !schema.anyOf.some((s) => !sub(s, value, at).length)) {
    const best = schema.anyOf.map((s) => sub(s, value, at)).sort((a, b) => a.length - b.length)[0];
    fail(`matches none of anyOf (closest: ${best.slice(0, 2).map((e) => `${e.at} ${e.error}`).join("; ")})`);
  }
  if (schema.oneOf) {
    const results = schema.oneOf.map((s) => sub(s, value, at));
    const ok = results.filter((r) => !r.length).length;
    if (ok !== 1) {
      const best = [...results].sort((a, b) => a.length - b.length)[0];
      fail(ok ? `matches ${ok} of oneOf` : `matches none of oneOf (closest: ${best.slice(0, 2).map((e) => `${e.at} ${e.error}`).join("; ")})`);
    }
  }
  if (schema.not && !sub(schema.not, value, at).length) fail("matches a forbidden schema (not)");
  if (schema.if !== undefined) {
    const cond = !sub(schema.if, value, at).length;
    if (cond && schema.then !== undefined) errs.push(...sub(schema.then, value, at));
    if (!cond && schema.else !== undefined) errs.push(...sub(schema.else, value, at));
  }
  return errs;
}

// Validates value against file#pointer from the registry.
export function check(reg, target, value) {
  const [file, frag] = target.split("#");
  const doc = reg.get(file);
  if (!doc) throw new Error(`no schema ${file}`);
  const schema = frag ? resolveRef(`#${frag}`, doc, reg).schema : doc;
  return validate(schema, value, { reg, doc });
}

// Walks a schema and throws on any keyword outside the subset (so a schema never silently skips a rule).
function lint(schema, at, file) {
  if (typeof schema === "boolean") return;
  if (!schema || typeof schema !== "object") throw new Error(`${file}${at}: a schema must be an object or boolean`);
  for (const k of Object.keys(schema)) {
    if (!KEYWORDS.has(k) && !ANNOTATIONS.has(k) && !k.startsWith("x-")) throw new Error(`${file}${at}: keyword "${k}" is outside the supported subset`);
  }
  const kids = (o, p) => Object.entries(o || {}).forEach(([k, s]) => lint(s, `${at}/${p}/${k}`, file));
  kids(schema.properties, "properties");
  kids(schema.patternProperties, "patternProperties");
  kids(schema.$defs, "$defs");
  for (const k of ["items", "additionalProperties", "propertyNames", "contains", "not", "if", "then", "else"]) if (schema[k] !== undefined && typeof schema[k] === "object") lint(schema[k], `${at}/${k}`, file);
  for (const k of ["prefixItems", "allOf", "anyOf", "oneOf"]) (schema[k] || []).forEach((s, i) => lint(s, `${at}/${k}/${i}`, file));
}

// ---------------------------------------------------------------- the checks
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const url = (p) => pathToFileURL(p).href;

// Deterministic simulated players on the app's own step machine. Each leans on the six axes, picks the option that
// fits (with some noise), sometimes skips or says "Not my life", and taps some cards fast (rushed), so the run carries
// every answer shape the store can hold.
export const PLAYERS = Object.freeze([
  { runId: "contract01", lobby: { voice: "fun", depth: "anything", rooms: ["love", "work", "family"] }, lean: { R1: 1, R2: 1, R3: -1, L1: 1, L2: 1, L3: 1 }, exits: 0.05, rushed: 0.05, rel: "bestie" },
  { runId: "contract02", lobby: { voice: "heart", depth: "light", rooms: ["love"] }, lean: { R1: -1, R2: -1, R3: 1, L1: -1, L2: -1, L3: -1 }, exits: 0.1, rushed: 0.15, rel: "partner" },
  { runId: "contract03", lobby: { voice: "cards", depth: "anything", rooms: [] }, lean: { R1: 1, R2: -1, R3: 1, L1: -1, L2: 1, L3: -1 }, exits: 0.02, rushed: 0.3, rel: "friendOrCoworker" },
]);

function playerChooser(p) {
  let s = 0;
  for (const ch of p.runId) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  const r = () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  return (card) => {
    const ms = r() < p.rushed ? 700 + Math.floor(r() * 600) : 2500 + Math.floor(r() * 6000);
    if (card.type !== "sealed" && card.type !== "feeling" && r() < p.exits) return { value: card.exits.includes("no_recent") && r() < 0.5 ? "no_recent" : r() < 0.5 ? "skip" : "not_my_life", ms };
    const fit = (o) => Object.entries(o.axes || {}).reduce((a, [ax, v]) => a + (p.lean[ax] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 0.3 : -0.3) * t.s, 0) + (r() - 0.5) * 1.5;
    const ranked = card.options.map((o, i) => ({ i, f: o.none ? -9 : fit(o) })).sort((a, b) => b.f - a.f || a.i - b.i);
    if (card.type === "receipts") {
      const ticks = ranked.filter((x) => x.f > 0.4).map((x) => x.i).sort((a, b) => a - b);
      const none = card.options.findIndex((o) => o.none);
      return { value: ticks.length ? ticks : none >= 0 ? [none] : [], ms };
    }
    if (card.type === "rank") return { value: ranked.map((x) => x.i), ms };
    if (card.type === "pick_two") return { value: [ranked[0].i, ranked[1].i], ms };
    return { value: ranked[0].i, ms };
  };
}

async function appModules() {
  const q = (p) => import(url(path.join(ROOT, "quiz64", p)));
  const [Session, Friend, Links, Views, Strip, Records] = await Promise.all([
    q("src/persona/session.js"), q("src/persona/friend.js"), q("src/persona/links.js"), q("src/persona/views.js"), q("kit-strip.mjs"),
    import(url(path.join(CONTRACTS, "records.mjs"))),
  ]);
  return { Session, Friend, Links, Views, Strip, Records };
}

let tick = 0;
const clock = () => new Date(Date.UTC(2026, 8, 30, 9, 0, tick++)).toISOString();

// One finished run through the real step machine: setup, lobby, 40 cards, the lock, 8 sealed cards.
export function playRun(Session, p) {
  const choose = playerChooser(p);
  let s = Session.startRun(Session.newRun({ now: clock(), runId: p.runId }), { closest: "best_friend", pronoun: "they" }, { now: clock() });
  s = Session.chooseLobby(s, p.lobby, { now: clock() });
  for (let guard = 0; guard < 200; guard++) {
    const step = Session.currentStep(s);
    if (step.kind === "lock") { s = Session.lockGuesses(s, { now: clock() }); continue; }
    if (step.kind !== "card") break;
    const pick = choose(step.card);
    s = Session.answerCard(s, step.card.id, pick.value, { ms: pick.ms, now: clock() });
  }
  if (Session.currentStep(s).kind !== "result") throw new Error(`${p.runId}: the run did not finish`);
  return s;
}

// A friend's guesses: a plausible, partly wrong reader.
function friendGuesses(view, seed = 7) {
  let s = seed;
  const r = () => { s = (s * 1103515245 + 12345) >>> 0; return s / 4294967296; };
  const g = { level1: {}, level2: {}, why: {}, level3: [], level4: null };
  for (const q of view.level1) g.level1[q.axis] = r() < 0.7 ? q.truth : -q.truth;
  for (const c of view.level2.cards) { g.level2[c.id] = r() < 0.6 ? c.answer : c.answer === "a" ? "b" : "a"; if (r() < 0.5) g.why[c.id] = "seen"; }
  if (!view.level3.skipped) g.level3 = view.level3.cards.filter((c) => c.role === "true" || r() < 0.2).map((c) => c.id).slice(0, view.level3.N);
  if (view.level4) g.level4 = { sting: view.level4.stingPick ? view.level4.stingPick.lines[0].tag : null, roast: view.level4.pickTheRoast.lines.length ? view.level4.pickTheRoast.lines[0].id : null };
  return g;
}

export async function runChecks() {
  const results = [];
  const add = (name, fn) => {
    try {
      const errs = fn() || [];
      results.push({ name, ok: errs.length === 0, errors: errs.slice(0, 12), count: errs.length });
    } catch (e) {
      results.push({ name, ok: false, errors: [{ at: "/", error: e.message }], count: 1 });
    }
  };

  // 1. schemas
  const reg = loadSchemas();
  const files = [...reg.keys()].filter((k) => k.endsWith(".schema.json") && !k.includes("/"));
  for (const f of files) add(`schema ${f}: draft 2020-12, $id, supported keywords`, () => {
    const s = reg.get(f);
    const errs = [];
    if (s.$schema !== DRAFT) errs.push({ at: "/$schema", error: `must be ${DRAFT}` });
    if (typeof s.$id !== "string" || !s.$id.endsWith(f)) errs.push({ at: "/$id", error: "must end with the file name" });
    lint(s, "", f);
    return errs;
  });

  // 2. the kit
  const cards = readJSON(path.join(KIT_DIR, "cards.json"));
  const library = readJSON(path.join(KIT_DIR, "library.json"));
  const friend = readJSON(path.join(KIT_DIR, "friend.json"));
  const M = await appModules();
  add("cards.json (full kit) against card.schema.json", () => check(reg, "card.schema.json", cards));
  add("cards.json (build-stripped, as shipped in the app) against card.schema.json", () => check(reg, "card.schema.json", M.Strip.stripAuthoring(cards)));
  add("library.json against library.schema.json", () => check(reg, "library.schema.json", library));
  add("friend.json against friend-content.schema.json", () => check(reg, "friend-content.schema.json", friend));

  // 3. real runs
  for (const p of PLAYERS) {
    let state;
    add(`${p.runId} (${p.lobby.voice}, ${p.lobby.depth}, rooms ${p.lobby.rooms.join("+") || "none"}): plays to the result`, () => { state = playRun(M.Session, p); return []; });
    if (!state) continue;
    add(`${p.runId}: stored run against run.schema.json`, () => check(reg, "run.schema.json", JSON.parse(M.Session.serialize(state))));
    add(`${p.runId}: result record against result.schema.json`, () => check(reg, "result.schema.json", M.Records.buildResultRecord(state)));
    add(`${p.runId}: the app's resultView against result.schema.json#/$defs/resultView`, () => check(reg, "result.schema.json#/$defs/resultView", JSON.parse(JSON.stringify(M.Views.resultView(state)))));

    // Friend game: the owner makes a link, a friend plays it and sends a reply, the owner imports it.
    let owner, ch, payload, view, guesses, reply;
    add(`${p.runId}: friend link today (${p.rel}): challenge body, payload, saved challenge`, () => {
      const made = M.Friend.createChallenge(state, { rel: p.rel, stings: true, love: true, name: "Sam" }, { now: clock(), id: `${p.runId}x`, seed: 424242 });
      owner = made.state; ch = made.challenge;
      payload = M.Friend.challengePayload(owner, ch);
      return [
        ...check(reg, "friend-challenge.schema.json#/$defs/linkPayload", payload),
        ...check(reg, "friend-challenge.schema.json#/$defs/challengeLinkBody", M.Links.decodePayload(payload)),
        ...check(reg, "friend-challenge.schema.json#/$defs/savedChallenge", ch),
      ];
    });
    if (!owner) continue;
    add(`${p.runId}: friend plays: public deck (proposed), friend-safe result, reply body`, () => {
      const parsed = M.Friend.parseChallenge(payload);
      view = M.Friend.friendDeckView(parsed);
      guesses = M.Friend.cleanGuesses(view, friendGuesses(view));
      reply = M.Friend.replyPayload(parsed, view, guesses);
      return [
        ...check(reg, "friend-challenge.schema.json#/$defs/publicChallenge", M.Records.buildPublicChallenge(parsed, view)),
        ...check(reg, "friend-challenge.schema.json#/$defs/guesses", guesses),
        ...check(reg, "friend-challenge.schema.json#/$defs/friendSafeResult", M.Friend.friendSafeResult(parsed, view, guesses)),
        ...check(reg, "friend-challenge.schema.json#/$defs/linkPayload", reply),
        ...check(reg, "friend-challenge.schema.json#/$defs/replyLinkBody", M.Links.decodePayload(reply)),
      ];
    });
    add(`${p.runId}: owner imports the reply: saved reply, stored run, comparison, server record (proposed)`, () => {
      const got = M.Friend.importReply(owner, reply, { now: clock() });
      const entry = got.state.friendResults.find((x) => x.challengeId === ch.id);
      return [
        ...check(reg, "friend-challenge.schema.json#/$defs/savedReply", entry),
        ...check(reg, "run.schema.json", JSON.parse(M.Session.serialize(got.state))),
        ...check(reg, "friend-challenge.schema.json#/$defs/ownerComparison", JSON.parse(JSON.stringify(M.Friend.ownerFriendView(got.state, ch.id)))),
        ...check(reg, "friend-challenge.schema.json#/$defs/challengeRecord", M.Records.buildChallengeRecord(got.state, ch, { now: "2026-09-30T09:00:00.000Z" })),
        ...check(reg, "friend-challenge.schema.json#/$defs/friendSubmission", { challengeId: ch.id, kit: got.state.kit, guesses }),
      ];
    });
  }

  // Example files (docs/contracts/examples): each still validates against its schema.
  const exDir = path.join(CONTRACTS, "examples");
  if (fs.existsSync(exDir)) {
    for (const [file, target] of Object.entries(EXAMPLE_TARGETS)) {
      add(`example ${file} against ${target}`, () => {
        const p = path.join(exDir, file);
        if (!fs.existsSync(p)) return [{ at: "/", error: "missing: run node scripts/validate-contracts.mjs --write-examples" }];
        return check(reg, target, readJSON(p));
      });
    }
  }

  // 4. question pack export is current
  add("docs/question-pack is current with cards.json (node scripts/export-question-pack.mjs)", () => {
    const pack = QuestionPack.buildPack();
    const errs = [];
    for (const [name, text] of Object.entries(pack.files)) {
      const p = path.join(ROOT, "docs", "question-pack", name);
      if (!fs.existsSync(p) || fs.readFileSync(p, "utf8") !== text) errs.push({ at: `/docs/question-pack/${name}`, error: "stale or missing: run node scripts/export-question-pack.mjs" });
    }
    return errs;
  });

  return results;
}

// Example files for docs/contracts/examples, and the schema each one must match.
export const EXAMPLE_TARGETS = Object.freeze({
  "run.json": "run.schema.json",
  "result.json": "result.schema.json",
  "challenge-link-body.json": "friend-challenge.schema.json#/$defs/challengeLinkBody",
  "reply-link-body.json": "friend-challenge.schema.json#/$defs/replyLinkBody",
  "challenge-record.json": "friend-challenge.schema.json#/$defs/challengeRecord",
  "public-challenge.json": "friend-challenge.schema.json#/$defs/publicChallenge",
  "friend-submission.json": "friend-challenge.schema.json#/$defs/friendSubmission",
  "friend-safe-result.json": "friend-challenge.schema.json#/$defs/friendSafeResult",
});

// One synthetic player (never a real person) end to end: the objects Desmond's endpoints would carry.
export async function buildExamples() {
  const M = await appModules();
  const p = PLAYERS[0];
  const state = playRun(M.Session, p);
  const { state: owner, challenge: ch } = M.Friend.createChallenge(state, { rel: p.rel, stings: true, love: true, name: "Sam" }, { now: "2026-09-30T09:05:00.000Z", id: "example01", seed: 424242 });
  const payload = M.Friend.challengePayload(owner, ch);
  const parsed = M.Friend.parseChallenge(payload);
  const view = M.Friend.friendDeckView(parsed);
  const guesses = M.Friend.cleanGuesses(view, friendGuesses(view));
  const reply = M.Friend.replyPayload(parsed, view, guesses);
  const done = M.Friend.importReply(owner, reply, { now: "2026-09-30T09:20:00.000Z" }).state;
  return {
    "run.json": JSON.parse(M.Session.serialize(done)),
    "result.json": M.Records.buildResultRecord(state),
    "challenge-link-body.json": M.Links.decodePayload(payload),
    "reply-link-body.json": M.Links.decodePayload(reply),
    "challenge-record.json": M.Records.buildChallengeRecord(owner, ch, { now: "2026-09-30T09:05:00.000Z" }),
    "public-challenge.json": M.Records.buildPublicChallenge(parsed, view),
    "friend-submission.json": { challengeId: ch.id, kit: owner.kit, guesses },
    "friend-safe-result.json": M.Friend.friendSafeResult(parsed, view, guesses),
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) && process.argv.includes("--write-examples")) {
  const ex = await buildExamples();
  const dir = path.join(CONTRACTS, "examples");
  fs.mkdirSync(dir, { recursive: true });
  for (const [file, data] of Object.entries(ex)) fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2) + "\n");
  console.log(`wrote ${Object.keys(ex).length} examples to docs/contracts/examples`);
  process.exit(0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const results = await runChecks();
  if (process.argv.includes("--json")) console.log(JSON.stringify(results, null, 2));
  else {
    for (const r of results) {
      console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}`);
      if (!r.ok) for (const e of r.errors) console.log(`        ${e.at}: ${e.error}`);
      if (!r.ok && r.count > r.errors.length) console.log(`        ... ${r.count - r.errors.length} more`);
    }
    const bad = results.filter((r) => !r.ok).length;
    console.log(`\n${results.length - bad} of ${results.length} contract checks pass`);
  }
  process.exit(results.every((r) => r.ok) ? 0 : 1);
}
