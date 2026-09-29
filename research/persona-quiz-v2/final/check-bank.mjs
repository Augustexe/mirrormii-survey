// Bank checker for the persona quiz (LAUNCH-SPEC sections 7, 21 and 22; skill genii-card-writer). Plain Node, no deps.
//
//   node check-bank.mjs                    -> checks bank/ch1.json .. ch7.json, extras.json, sealed.json (files not
//                                             written yet are reported, not failed)
//   node check-bank.mjs --bank DIR         -> another bank folder
//   node check-bank.mjs --kit [cards.json] -> checks an assembled kit instead (legacy cards included)
//   node check-bank.mjs --json             -> errors, warnings and counts as JSON
//   node check-bank.mjs --quiet            -> counts and totals only, no per-card lines
//
// Errors (exit 1): schema per type, option counts, both voices with equal option counts, fingerprint present, identical
// fingerprints or answer lines, banned words and patterns, evidence rules. Warnings: options over 12 words, prompts over
// 30 words, near-duplicate fingerprints and answer lines, family words, missing mask or round. Then per-chapter and
// per-format counts against the section 22 targets.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TYPES, LEGACY_TYPES, PRIVACY, FP_FIELDS, DID_TYPES, QUICK_TYPES, WORLDS, cardTexts } from "./card-schema.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];
export const GROUPS = Object.freeze(["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "extras", "sealed"]);

// LAUNCH-SPEC section 22 bank targets: total and per format family.
export const TARGETS = Object.freeze({
  ch1: { total: 22, did: 7, scenario: 5, reply: 2, others: 2, quick: 5, feeling: 1 },
  ch2: { total: 22, did: 7, scenario: 5, reply: 2, others: 2, quick: 5, feeling: 1 },
  ch3: { total: 18, did: 5, scenario: 5, reply: 2, others: 2, quick: 3, feeling: 1 },
  ch4: { total: 20, did: 6, scenario: 5, reply: 2, others: 2, quick: 4, feeling: 1 },
  ch5: { total: 18, did: 5, scenario: 5, reply: 2, others: 2, quick: 3, feeling: 1 },
  ch6: { total: 18, did: 5, scenario: 5, reply: 2, others: 2, quick: 3, feeling: 1 },
  ch7: { total: 20, did: 6, scenario: 5, reply: 2, others: 2, quick: 4, feeling: 1 },
  extras: { total: 12, scenario: 6, quick: 6 },
  sealed: { total: 24, sealed: 24 },
});
export const FAMILIES = Object.freeze(["did", "scenario", "reply", "others", "quick", "feeling", "sealed"]);
export const familyOf = (type) => (DID_TYPES.includes(type) ? "did" : QUICK_TYPES.includes(type) ? "quick" : type);

export const LIMITS = Object.freeze({ optionWords: 12, promptWords: 30, fpNear: 0.6, lineNear: 0.8 });

// ---------------------------------------------------------------- banned words and patterns
const EM_DASH = String.fromCharCode(0x2014);
export const BANS = Object.freeze([
  { id: "what-would-you-do", re: /\bwhat would you do\b/i, why: "never ask \"what would you do\"" },
  { id: "open-private", re: /\b(open|check|scroll|go (in)?to|look (at|through)|pull up)\s+(up\s+)?(your|ur)\s+(\w+\s+)?(app|apps|bank|banking|account|messages|texts|dms|inbox|email|photos|camera roll|gallery|screen time|notes app|browser history|search history|wallet)\b/i, why: "never ask the player to open an app, account or private data" },
  { id: "gendered", re: /\b(he|she|him|her|his|hers|himself|herself|boyfriend|girlfriend|bf|gf|husband|wife|hubby|wifey|guy|guys|girl|girls|boy|boys|man|woman|men|women|dude|bro|lady|ladies|gentleman|gentlemen|king|queen)\b/i, why: "gendered word (use \"your person\", \"they\")" },
  { id: "grading", re: /\b(kind(?!\s+of\b)|kindness|brave|bravery|healthy|unhealthy|responsible|irresponsible|mature|immature|selfish|selfless)\b/i, why: "grading word" },
  { id: "age", re: /\b(teen|teens|teenager|teenagers|adult|adults|minor|minors|under ?18|over ?18|18\+|21\+|years? old|your age|underage|grown-?up)\b/i, why: "age reference" },
  { id: "brand-never-say", re: /\b(streaks?|gacha|lottery|jackpot|predicts?|clinically|diagnose)\b/i, why: "brand never-say word (PRODUCT-TRUTH: no streaks, no gacha or lottery words, never \"predicts\")" },
  { id: "health", re: /\b(diet|dieting|calories|weight loss|lose weight|therapy|therapist|diagnos\w*|medication|meds|depress\w*|anxiety disorder|adhd|autis\w*)\b/i, why: "health or diagnosis content" },
]);
// Family roles are gendered but often the true detail; flagged for a second look, never failed.
const FAMILY_WORDS = /\b(mom|mum|dad|mother|father|sister|brother|aunt|uncle|grandma|grandpa|grandmother|grandfather|son|daughter|niece|nephew)\b/i;

// ---------------------------------------------------------------- text helpers
const STOP = new Set("a an the and or but of to in on at for with your you my me i it its is are was were be been this that they them their our we us as by from up out just so do does did not no".split(" "));
export const normLine = (t) => String(t || "").normalize("NFKC").toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z0-9' ]+/g, " ").replace(/\s+/g, " ").trim();
export const tokens = (t) => new Set(normLine(t).split(" ").filter((w) => w && !STOP.has(w)));
export function jaccard(a, b) {
  if (!a.size && !b.size) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
const words = (t) => String(t || "").trim().split(/\s+/).filter(Boolean).length;
// Fingerprint similarity: mean token-set similarity over the five fields.
export function fpSimilarity(a, b) {
  return FP_FIELDS.reduce((s, k) => s + jaccard(tokens(a[k]), tokens(b[k])), 0) / FP_FIELDS.length;
}
const fpKey = (fp) => FP_FIELDS.map((k) => normLine(fp[k])).join("|");

// ---------------------------------------------------------------- the checker
// cards: [{ ...card, _group }] (group: ch1..ch7, extras, sealed, or "kit"). lib: library.json. opts.legacy relaxes the
// bank-only rules (option counts, both voices, fingerprints) for an assembled kit that still holds pre-Build C cards.
export function checkCards(cards, { lib, legacy = false } = {}) {
  const errors = [];
  const warnings = [];
  const err = (id, what) => errors.push({ id, what });
  const warn = (id, what) => warnings.push({ id, what });
  const TAG = new Set((lib && lib.tags ? lib.tags : []).map((t) => t.id));
  const ids = new Map();
  for (const c of cards) {
    const id = c && typeof c.id === "string" ? c.id : `(${c && c._group} card without id)`;
    if (!c || typeof c.id !== "string" || !c.id) { err(id, "missing id"); continue; }
    if (ids.has(c.id)) err(c.id, `duplicate id (also in ${ids.get(c.id)})`);
    ids.set(c.id, c._group);
  }

  for (const c of cards) {
    if (!c || typeof c.id !== "string") continue;
    const id = c.id;
    const group = c._group;
    let type = c.type;
    if (LEGACY_TYPES[type]) { (legacy ? warn : err)(id, `type "${type}" is now "${LEGACY_TYPES[type]}"`); type = LEGACY_TYPES[type]; }
    const spec = TYPES[type];
    if (!spec) { err(id, `unknown type "${c.type}"`); continue; }
    const opts = Array.isArray(c.options) ? c.options : [];
    if (!Array.isArray(c.options) || !opts.length) { err(id, "no options"); continue; }

    // Where the card lives.
    if (/^ch[1-7]$/.test(group)) {
      const n = Number(group.slice(2));
      if (c.chapter !== undefined && c.chapter !== n) err(id, `chapter ${c.chapter} in ${group}.json`);
      if (!new RegExp(`^C${n}-`).test(id)) warn(id, `id does not start with C${n}-`);
      if (type === "sealed") err(id, "sealed cards belong in sealed.json");
    }
    if (group === "extras" && !["scenario", ...QUICK_TYPES].includes(type)) err(id, `extras are scenario or quick cards, not ${type}`);
    if (group === "sealed" && type !== "sealed") err(id, "only sealed cards in sealed.json");
    if (group !== "sealed" && group !== "kit" && type === "sealed") err(id, "sealed card outside sealed.json");

    // Schema.
    if (typeof c.prompt !== "string" || c.prompt.trim().length < 5) err(id, "prompt missing");
    opts.forEach((o, i) => { if (!o || typeof o.t !== "string" || !o.t.trim()) err(id, `option ${i} has no text`); });
    const [lo, hi] = legacy ? spec.options : spec.bank;
    if (opts.length < lo || opts.length > hi) err(id, `${opts.length} options for ${type} (want ${lo === hi ? lo : `${lo} to ${hi}`})`);
    if (!PRIVACY.includes(c.privacy)) err(id, `privacy "${c.privacy}" (normal or intimate)`);
    if (c.friend && c.privacy !== "normal") err(id, "intimate cards never carry a friend version");
    if (c.friend && ["receipts", "rank"].includes(type)) err(id, `${type} cards never carry a friend version`);
    for (const k of ["teen", "teenPrompt"]) if (k in c) err(id, `"${k}" is gone (no age logic)`);
    if (!c.mask) warn(id, "no mask (what it looks like versus what it measures)");
    // Sub-question first and worlds (Jerry, 2026-09-29).
    if (c.world !== undefined && !WORLDS.includes(c.world)) err(id, `world "${c.world}" (everyday, unusual or absurd)`);
    if (c.world === "absurd" && DID_TYPES.includes(type)) err(id, `${type} cards are what you did: they stay everyday or unusual, never absurd`);
    if (group !== "kit" && !c.world) warn(id, "no world (everyday, unusual or absurd)");
    if (group !== "kit" && type !== "feeling" && !c.sq) warn(id, "no sq (the sub-question id this card tests, from subquestions.json)");

    // Both voices.
    const h = c.heart;
    if (!h || typeof h !== "object") (legacy ? warn : err)(id, "no Heart to heart version (heart)");
    else {
      if (typeof h.prompt !== "string" || !h.prompt.trim()) err(id, "heart.prompt missing");
      if (!Array.isArray(h.options) || h.options.some((t) => typeof t !== "string" || !t.trim())) err(id, "heart.options must be strings");
      else if (h.options.length !== opts.length) err(id, `heart has ${h.options.length} options, Make it fun has ${opts.length}`);
      if (h.thread !== undefined && (!Array.isArray(h.thread) || !Array.isArray(c.thread) || h.thread.length !== c.thread.length)) err(id, "heart.thread must match the thread's length");
      for (const k of Object.keys(h)) if (!["prompt", "options", "thread"].includes(k)) err(id, `heart.${k} is not a field (evidence is never duplicated)`);
    }

    // Fingerprint.
    const fp = c.fp;
    if (!fp || typeof fp !== "object") (legacy ? warn : err)(id, "no situation fingerprint (fp)");
    else for (const k of FP_FIELDS) if (typeof fp[k] !== "string" || !fp[k].trim()) err(id, `fp.${k} missing`);

    // Formats.
    const nones = opts.filter((o) => o && o.none);
    if (type === "receipts") {
      if (nones.length !== 1 || !opts[opts.length - 1].none) err(id, "receipts end with one \"None of these\" (none: true)");
    } else if (nones.length) err(id, "only receipts cards have a none option");
    if (type === "reply") {
      if (!Array.isArray(c.thread) || c.thread.length < 1 || c.thread.length > 3 || !c.thread.every((m) => m && m.from && m.text)) err(id, "reply needs a thread of 1 to 3 { from, text }");
    } else if (c.thread !== undefined) err(id, "only reply cards have a thread");
    if (type === "pick_two" && c.pick !== undefined && c.pick !== 2) err(id, "pick_two picks 2");
    if (type === "this_or_that" && !c.round) warn(id, "this_or_that without a round id");
    if (type === "feeling") {
      if (!c.follows) err(id, "feeling cards name the card they follow (follows)");
      else if (!cards.some((x) => x.id === c.follows && x._group === group)) err(id, `follows ${c.follows}, which is not in ${group}`);
    }
    if (type === "sealed") {
      const scored = opts.filter((o) => Object.keys(o.axes || {}).length || (o.tags || []).length).length;
      if (scored < 3) err(id, "a sealed card needs 3 options with evidence so Genii's guess can be computed");
      const primary = c.primary ?? (c.checks && c.checks.primary);
      if (primary && !AXES.includes(primary)) err(id, `primary ${primary} is not an axis`);
      if (primary && !opts.some((o) => (o.axes || {})[primary])) err(id, `no option carries its primary axis ${primary}`);
    }
    const dep = opts.filter((o) => o.depends).length;
    if (dep && !(c.flip && Array.isArray(c.flip.options) && c.flip.options.length === 3)) err(id, "a depends option needs a flip with 3 presets");

    // Evidence.
    if (opts.filter((o) => o.circumstance).length > 1) err(id, "at most one circumstance option");
    opts.forEach((o, i) => {
      const ax = Object.entries(o.axes || {});
      const tg = o.tags || [];
      if (ax.length > 2) err(id, `option ${i}: ${ax.length} axes (max 2)`);
      for (const [k, v] of ax) {
        if (!AXES.includes(k)) err(id, `option ${i}: unknown axis ${k}`);
        if (!Number.isInteger(v) || v === 0 || Math.abs(v) > 2) err(id, `option ${i}: axis value ${v} (whole number -2 to 2, not 0)`);
      }
      if (!Array.isArray(tg) || tg.length > 3) err(id, `option ${i}: ${tg.length} tags (max 3)`);
      for (const t of Array.isArray(tg) ? tg : []) {
        if (!t || !TAG.has(t.id)) err(id, `option ${i}: unknown tag ${t && t.id}`);
        if (!t || ![1, 2, 3].includes(t.s)) err(id, `option ${i}: tag strength ${t && t.s} (1 to 3)`);
      }
      const carries = ax.length + tg.length > 0;
      if ((o.circumstance || o.depends || o.none || type === "feeling") && carries) err(id, `option ${i} must score nothing (${o.none ? "none" : o.circumstance ? "circumstance" : o.depends ? "depends" : "feeling"})`);
      if (!carries && !o.circumstance && !o.depends && !o.none && type !== "feeling") (type === "sealed" ? warn : err)(id, `option ${i} carries no evidence`);
    });

    // Copy: length, bans (both voices), em dash anywhere in the card.
    if (JSON.stringify(c).includes(EM_DASH)) err(id, "em dash");
    for (const x of cardTexts(c)) {
      if (/option \d+$/.test(x.where) && !/flip/.test(x.where) && words(x.text) > LIMITS.optionWords) warn(id, `${x.where} is ${words(x.text)} words (12 or fewer)`);
      if (/prompt$/.test(x.where) && words(x.text) > LIMITS.promptWords) warn(id, `${x.where} is ${words(x.text)} words (about 30)`);
      for (const b of BANS) { const m = x.text.match(b.re); if (m) err(id, `${x.where}: ${b.why} ("${m[0]}")`); }
      const fam = x.text.match(FAMILY_WORDS);
      if (fam) warn(id, `${x.where}: family word "${fam[0]}" is gendered; keep it only when it is the true detail`);
    }
  }

  // Uniqueness across the bank: fingerprints.
  const withFp = cards.filter((c) => c && c.fp && typeof c.fp === "object" && FP_FIELDS.every((k) => typeof c.fp[k] === "string"));
  const seenFp = new Map();
  for (const c of withFp) {
    const k = fpKey(c.fp);
    if (seenFp.has(k)) err(c.id, `same situation fingerprint as ${seenFp.get(k)}`);
    else seenFp.set(k, c.id);
  }
  for (let i = 0; i < withFp.length; i++) for (let j = i + 1; j < withFp.length; j++) {
    const a = withFp[i], b = withFp[j];
    if (fpKey(a.fp) === fpKey(b.fp)) continue;
    const sim = fpSimilarity(a.fp, b.fp);
    if (sim >= LIMITS.fpNear) warn(b.id, `situation close to ${a.id} (fingerprint similarity ${sim.toFixed(2)}); same trigger, ask and who is the same situation`);
  }

  // Uniqueness across the bank: answer lines, per voice ("None of these" excepted).
  for (const voice of ["fun", "heart"]) {
    const lines = [];
    for (const c of cards) {
      if (!c || !Array.isArray(c.options)) continue;
      c.options.forEach((o, i) => {
        if (!o || o.none) return;
        const t = voice === "fun" ? o.t : c.heart && Array.isArray(c.heart.options) ? c.heart.options[i] : null;
        if (typeof t !== "string" || !t.trim()) return;
        lines.push({ id: c.id, i, t, norm: normLine(t), tok: tokens(t) });
      });
    }
    const seen = new Map();
    for (const l of lines) {
      const prev = seen.get(l.norm);
      if (prev && prev.id !== l.id) err(l.id, `${voice === "heart" ? "heart " : ""}answer "${l.t}" repeats ${prev.id}`);
      else if (!prev) seen.set(l.norm, l);
    }
    for (let i = 0; i < lines.length; i++) for (let j = i + 1; j < lines.length; j++) {
      const a = lines[i], b = lines[j];
      if (a.id === b.id || a.norm === b.norm || a.tok.size < 3 || b.tok.size < 3) continue;
      const sim = jaccard(a.tok, b.tok);
      if (sim >= LIMITS.lineNear) warn(b.id, `${voice === "heart" ? "heart " : ""}answer "${b.t}" is close to ${a.id} "${a.t}" (${sim.toFixed(2)})`);
    }
  }

  // Pattern variety (Jerry, 2026-09-28): no repeated hook shape. Clock times and day-or-time stamps in prompts,
  // and the same two opening words, are capped across the bank and per chapter file.
  checkVariety(cards, err);

  return { errors, warnings, counts: countCards(cards) };
}

const CLOCK = /\b\d{1,2}(:\d{2})?\s?(am|pm)\b|\b\d{1,2}:\d{2}\b|\bmidnight\b|\bnoon\b/i;
const STAMP_OPEN = /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tonight|this morning|\d{1,2}(:\d{2})?\s?(am|pm)?)\b/i;
const opener = (p) => p.toLowerCase().replace(/[^a-z0-9' ]+/g, " ").trim().split(/\s+/).slice(0, 2).join(" ");

export function checkVariety(cards, err) {
  const list = cards.filter((c) => c && typeof c.prompt === "string" && c.type !== "feeling");
  const n = list.length;
  const bankCap = (share) => Math.max(2, Math.ceil(n * share));
  const over = (items, cap, why) => items.slice(cap).forEach((c) => err(c.id, `${why} (${items.length} cards, max ${cap}: ${items.slice(0, cap).map((x) => x.id).join(", ")} already use it)`));
  // Clock times or day/time stamps anywhere in the prompt: at most 5% of the bank, at most 1 per chapter file.
  const timed = list.filter((c) => CLOCK.test(c.prompt) || STAMP_OPEN.test(c.prompt.trim()));
  over(timed, bankCap(0.05), "clock time or day stamp in the prompt: vary the hook");
  const byGroup = new Map();
  for (const c of timed) { const g = c._group || "kit"; if (!byGroup.has(g)) byGroup.set(g, []); byGroup.get(g).push(c); }
  if (!(byGroup.size === 1 && byGroup.has("kit"))) for (const [g, items] of byGroup) over(items, 1, `more than one timed hook in ${g}`);
  // The same two opening words: at most 4% of the bank (Genii's bet stems count too, so bets vary their stem).
  const byOpen = new Map();
  for (const c of list) { const k = opener(c.prompt); if (!byOpen.has(k)) byOpen.set(k, []); byOpen.get(k).push(c); }
  for (const [k, items] of byOpen) if (k && items.length > bankCap(0.04)) over(items, bankCap(0.04), `prompts opening "${k}" repeat`);
}

// Per group: total and per format family, next to the section 22 targets.
export function countCards(cards) {
  const out = {};
  for (const c of cards) {
    if (!c || !c._group) continue;
    const g = (out[c._group] ||= { total: 0, ...Object.fromEntries(FAMILIES.map((f) => [f, 0])), types: {} });
    const type = LEGACY_TYPES[c.type] || c.type;
    g.total++;
    const f = familyOf(type);
    if (f in g) g[f]++;
    g.types[type] = (g.types[type] || 0) + 1;
  }
  return out;
}

// ---------------------------------------------------------------- loading
export function loadBank(dir) {
  const cards = [];
  const missing = [];
  const broken = [];
  for (const g of GROUPS) {
    const p = path.join(dir, `${g}.json`);
    if (!fs.existsSync(p)) { missing.push(g); continue; }
    let data;
    try { data = JSON.parse(fs.readFileSync(p, "utf8")); } catch (e) { broken.push({ group: g, what: `not valid JSON: ${e.message}` }); continue; }
    if (!Array.isArray(data)) { broken.push({ group: g, what: "must be a JSON array of cards" }); continue; }
    for (const c of data) cards.push({ ...c, _group: g });
  }
  return { cards, missing, broken };
}

export function kitCards(kit) {
  return [
    ...kit.chapters.flatMap((ch) => ch.cards.map((c) => ({ ...c, _group: `ch${ch.n}` }))),
    ...kit.extras.map((c) => ({ ...c, _group: "extras" })),
    ...kit.finale.map((c) => ({ ...c, _group: "sealed" })),
  ];
}

function countTable(counts) {
  const rows = ["| Group | Cards | did | scenario | reply | others | quick | feeling | sealed |", "|---|---|---|---|---|---|---|---|---|"];
  const cell = (have, want) => (want === undefined ? `${have || 0}` : `${have || 0}/${want}${(have || 0) < want ? " short" : (have || 0) > want ? " over" : ""}`);
  let total = 0, target = 0;
  for (const g of GROUPS) {
    const c = counts[g] || {};
    const t = TARGETS[g];
    total += c.total || 0;
    target += t.total;
    rows.push(`| ${g} | ${cell(c.total, t.total)} | ${FAMILIES.map((f) => cell(c[f], t[f])).join(" | ")} |`);
  }
  rows.push(`| all | ${total}/${target} | | | | | | | |`);
  const types = {};
  for (const c of Object.values(counts)) for (const [k, v] of Object.entries(c.types)) types[k] = (types[k] || 0) + v;
  rows.push("", `Formats: ${Object.keys(TYPES).map((t) => `${t} ${types[t] || 0}`).join(", ")}`);
  return rows.join("\n");
}

function main(argv) {
  const flag = (k) => argv.includes(k);
  const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
  const lib = JSON.parse(fs.readFileSync(val("--lib", path.join(DIR, "library.json")), "utf8"));
  let cards, missing = [], broken = [], legacy = false, source;
  if (flag("--kit")) {
    source = path.resolve(val("--kit", path.join(DIR, "cards.json")));
    cards = kitCards(JSON.parse(fs.readFileSync(source, "utf8")));
    legacy = true;
  } else {
    source = path.resolve(val("--bank", path.join(DIR, "bank")));
    ({ cards, missing, broken } = loadBank(source));
  }
  const res = checkCards(cards, { lib, legacy });
  for (const b of broken) res.errors.push({ id: `${b.group}.json`, what: b.what });
  if (flag("--json")) {
    console.log(JSON.stringify({ source, missing, ...res }, null, 1));
    return res.errors.length ? 1 : 0;
  }
  console.log(`Checked ${cards.length} cards from ${source}${legacy ? " (assembled kit: legacy cards allowed their old option counts and missing voices or fingerprints as warnings)" : ""}`);
  if (missing.length) console.log(`Not written yet: ${missing.map((g) => `${g}.json`).join(", ")}`);
  if (!flag("--quiet")) {
    for (const e of res.errors) console.log(`ERROR ${e.id}: ${e.what}`);
    for (const w of res.warnings) console.log(`warn  ${w.id}: ${w.what}`);
  }
  console.log(`\n${countTable(res.counts)}\n`);
  console.log(`${res.errors.length} error(s), ${res.warnings.length} warning(s).`);
  return res.errors.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
