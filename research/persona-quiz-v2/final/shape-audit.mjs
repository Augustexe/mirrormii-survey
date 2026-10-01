// Shape audit for the persona quiz bank (LAUNCH-SPEC section 23 ruling 4; skill genii-card-writer section 2b).
// Uniqueness of situation is checked by check-bank.mjs; this measures uniqueness of SHAPE: cards that read alike
// because the prompt opens and closes the same way, or the answers share one opening word, one grammatical form and
// one length rhythm. Plain Node, no deps.
//
//   node shape-audit.mjs                 -> report on bank/ (both voices), top clusters and the cards in them
//   node shape-audit.mjs --bank DIR      -> another bank folder
//   node shape-audit.mjs --json          -> the numbers as JSON (used for before/after comparisons)
//   node shape-audit.mjs --limits        -> only the SHAPE_LIMITS verdicts (what check-bank.mjs enforces)
//
// check-bank.mjs imports checkShapes() and fails the bank when a SHAPE_LIMITS line is broken, so variety can't regress.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const GROUPS = ["ch1", "ch2", "ch3", "ch4", "ch5", "ch6", "ch7", "extras", "sealed"];

// ---------------------------------------------------------------- limits (enforced by check-bank.mjs)
export const SHAPE_LIMITS = Object.freeze({
  // Inside one card: no opening word may lead more than half the answers (Make it fun), and the Heart to heart answers
  // may not all open with the same word ("I ... / I ... / I ... / I ...").
  cardFirstWordShare: 0.5,
  // Inside one card: at most half the answers are "verdict + reason" ("Keep it. Reason." / "Guilty. Reason.").
  cardVerdictShare: 0.5,
  // Bank-wide, Make it fun answers: one opening word leads at most 3% of all answers; verdict-form answers at most 20%.
  bankFirstWordShare: 0.03,
  bankVerdictShare: 0.20,
  // Bank-wide prompts: one first word opens at most 10% of cards; one closing pair of words ends at most 4%
  // ("First thought?", "actually do?", "that's true:"); Heart to heart prompts: same two opening words at most 6%.
  promptFirstWordShare: 0.10,
  promptEndShare: 0.04,
  heartOpenShare: 0.06,
  // Bank-wide: at most 4% of cards share one full shape signature, and at most 20% of cards have a flat rhythm (every
  // answer the same number of sentences and within 2 words of each other).
  clusterShare: 0.04,
  flatRhythmShare: 0.20,
  // Crutch words that make absurd cards sound alike: at most this many prompts each.
  crutch: { magic: 3, catch: 3, genii: 6 },
  // Bank-wide shares only mean something on a real bank: below this many cards only the per-card rules apply.
  minCards: 50,
});

// ---------------------------------------------------------------- text helpers
const clean = (t) => String(t || "").normalize("NFKC").replace(/[’‘]/g, "'").replace(/[“”]/g, '"').trim();
const wordsOf = (t) => clean(t).split(/\s+/).filter(Boolean);
export function firstWord(t) {
  const w = clean(t).replace(/^["'(\[]+/, "").split(/\s+/)[0] || "";
  const x = w.toLowerCase().replace(/[^a-z0-9']/g, "");
  if (/^i('d|'m|'ll|'ve)?$/.test(x)) return "i";
  return x;
}
const sentences = (t) => clean(t).replace(/"[^"]*"/g, (q) => q.replace(/[.!?]/g, "")).split(/(?<=[.!?])\s+/).filter((s) => s.trim());
// Answer form: quote (dialogue), verdict (a 1-2 word sentence then a reason: "Guilty. Month three."), i (I, my, me),
// you, or other (imperative or fragment).
export function formOf(t) {
  const s = clean(t);
  if (/^["']/.test(s)) return "quote";
  const sn = sentences(s);
  if (sn.length >= 2 && wordsOf(sn[0]).length <= 2) return "verdict";
  const f = firstWord(s);
  if (["i", "my", "me", "we", "our", "us"].includes(f)) return "i";
  if (["you", "your", "you're", "you'd"].includes(f)) return "you";
  return "other";
}
const promptEnd = (p) => clean(p).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").trim().split(/\s+/).slice(-2).join(" ");
const promptOpen = (p, n) => clean(p).toLowerCase().replace(/[^a-z0-9' ]+/g, " ").trim().split(/\s+/).slice(0, n).join(" ");
function openClass(p) {
  const f = promptOpen(p, 1);
  if (/^genii/.test(f)) return "genii";
  if (["your", "you", "you're", "you've"].includes(f)) return f.startsWith("you") && f !== "your" ? "you" : "your";
  if (["a", "an", "the"].includes(f)) return "article";
  if (/^\d/.test(f)) return "number";
  return "other";
}
const endClass = (p) => { const s = clean(p); return s.endsWith("?") ? "?" : s.endsWith(":") ? ":" : s.endsWith("...") ? "..." : "."; };

// ---------------------------------------------------------------- per card shape
export function shapeOf(c) {
  const opts = (c.options || []).filter((o) => o && !o.none).map((o) => o.t);
  const hopts = c.heart && Array.isArray(c.heart.options) ? c.heart.options.filter((_, i) => !(c.options[i] && c.options[i].none)) : [];
  const count = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const top = (m) => [...m.entries()].sort((a, b) => b[1] - a[1])[0] || ["", 0];
  const fw = opts.map(firstWord);
  const hfw = hopts.map(firstWord);
  const forms = opts.map(formOf);
  const sent = opts.map((t) => sentences(t).length);
  const lens = opts.map((t) => wordsOf(t).length);
  const [topWord, topWordN] = top(count(fw));
  const [hTopWord, hTopWordN] = top(count(hfw));
  const verdicts = forms.filter((f) => f === "verdict").length;
  const flat = opts.length >= 2 && new Set(sent).size === 1 && Math.max(...lens) - Math.min(...lens) <= 2;
  const formPattern = [...count(forms).entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([f, n]) => `${f}${n}`).join("+");
  const ps = sentences(c.prompt || "").length;
  const signature = [openClass(c.prompt), endClass(c.prompt), `s${Math.min(ps, 4)}`, `n${opts.length}`, formPattern, flat ? "flat" : "varied"].join(" | ");
  return {
    id: c.id, type: c.type, group: c._group,
    promptOpen1: promptOpen(c.prompt, 1), promptOpen2: promptOpen(c.prompt, 2), promptEnd: promptEnd(c.prompt),
    heartOpen2: c.heart ? promptOpen(c.heart.prompt, 2) : "", heartEnd: c.heart ? promptEnd(c.heart.prompt) : "",
    openClass: openClass(c.prompt), endClass: endClass(c.prompt), promptSentences: ps, promptWords: wordsOf(c.prompt).length,
    n: opts.length, firstWords: fw, heartFirstWords: hfw, forms, sentencesPer: sent, lengths: lens,
    topWord, topWordN, hTopWord, hTopWordN, verdicts, flat, formPattern, signature,
  };
}

// ---------------------------------------------------------------- bank audit
export function auditShapes(cards) {
  const shapes = cards.filter((c) => c && Array.isArray(c.options)).map(shapeOf);
  const N = shapes.length;
  const allOpts = shapes.flatMap((s) => s.firstWords);
  const allForms = shapes.flatMap((s) => s.forms);
  const tally = (arr) => [...arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map()).entries()].sort((a, b) => b[1] - a[1]);
  const group = (key) => { const m = new Map(); for (const s of shapes) { const k = s[key]; if (!m.has(k)) m.set(k, []); m.get(k).push(s.id); } return [...m.entries()].sort((a, b) => b[1].length - a[1].length); };
  const cardFirstWordFails = shapes.filter((s) => s.n >= 2 && s.topWordN > s.n * SHAPE_LIMITS.cardFirstWordShare);
  const cardHeartSameFails = shapes.filter((s) => s.heartFirstWords.length >= 2 && s.hTopWordN === s.heartFirstWords.length);
  const cardVerdictFails = shapes.filter((s) => s.n >= 2 && s.verdicts > s.n * SHAPE_LIMITS.cardVerdictShare);
  const heartAllI = shapes.filter((s) => s.heartFirstWords.length >= 2 && s.hTopWord === "i" && s.hTopWordN === s.heartFirstWords.length);
  const text = cards.map((c) => [c.prompt, ...(c.thread || []).map((m) => m.text)].join(" ").toLowerCase());
  const crutch = Object.fromEntries(Object.keys(SHAPE_LIMITS.crutch).map((w) => [w, cards.filter((c, i) => new RegExp(`\\b${w}\\w*`).test(text[i])).map((c) => c.id)]));
  return {
    cards: N, options: allOpts.length, shapes,
    optionFirstWords: tally(allOpts).slice(0, 15),
    optionForms: tally(allForms),
    verdictShare: allForms.filter((f) => f === "verdict").length / allForms.length,
    promptFirstWords: group("promptOpen1").slice(0, 10).map(([k, ids]) => [k, ids.length, ids]),
    promptOpeners: group("promptOpen2").slice(0, 10).map(([k, ids]) => [k, ids.length, ids]),
    promptEnds: group("promptEnd").slice(0, 10).map(([k, ids]) => [k, ids.length, ids]),
    heartOpeners: group("heartOpen2").slice(0, 10).map(([k, ids]) => [k, ids.length, ids]),
    heartEnds: group("heartEnd").slice(0, 8).map(([k, ids]) => [k, ids.length, ids]),
    clusters: group("signature").slice(0, 12).map(([k, ids]) => [k, ids.length, ids]),
    flat: shapes.filter((s) => s.flat).map((s) => s.id),
    cardFirstWordFails: cardFirstWordFails.map((s) => `${s.id} (${s.topWord} x${s.topWordN}/${s.n})`),
    cardHeartSameFails: cardHeartSameFails.map((s) => `${s.id} (${s.hTopWord} x${s.hTopWordN})`),
    heartAllI: heartAllI.map((s) => s.id),
    cardVerdictFails: cardVerdictFails.map((s) => `${s.id} (${s.verdicts}/${s.n})`),
    crutch,
  };
}

// The limits as errors, for check-bank.mjs: err(id, what).
export function checkShapes(cards, err) {
  const L = SHAPE_LIMITS;
  const a = auditShapes(cards);
  const N = a.cards;
  const cap = (share) => Math.max(2, Math.ceil(N * share));
  for (const s of a.shapes) {
    if (s.n >= 2 && s.topWordN > s.n * L.cardFirstWordShare) err(s.id, `shape: ${s.topWordN} of ${s.n} answers open with "${s.topWord}" (max half): vary how the answers start`);
    if (s.heartFirstWords.length >= 2 && s.hTopWordN === s.heartFirstWords.length) err(s.id, `shape: every Heart to heart answer opens with "${s.hTopWord}": vary at least one`);
    if (s.n >= 2 && s.verdicts > s.n * L.cardVerdictShare) err(s.id, `shape: ${s.verdicts} of ${s.n} answers are "Verdict. Reason." (max half)`);
  }
  if (N < L.minCards) return a;
  const optCap = Math.max(3, Math.ceil(a.options * L.bankFirstWordShare));
  for (const [w, n] of a.optionFirstWords) if (w && w !== "i" && n > optCap) err("bank", `shape: ${n} answers open with "${w}" (max ${optCap}, 3% of answers)`);
  if (a.verdictShare > L.bankVerdictShare) err("bank", `shape: ${(a.verdictShare * 100).toFixed(1)}% of answers are "Verdict. Reason." (max ${L.bankVerdictShare * 100}%)`);
  const over = (rows, share, what) => { for (const [k, n, ids] of rows) if (k && n > cap(share)) err(ids.slice(cap(share)).join(", "), `shape: ${n} ${what} "${k}" (max ${cap(share)}; first: ${ids.slice(0, cap(share)).join(", ")})`); };
  over(a.promptFirstWords, L.promptFirstWordShare, "prompts open with");
  over(a.promptEnds, L.promptEndShare, "prompts end with");
  over(a.heartOpeners, L.heartOpenShare, "Heart to heart prompts open with");
  over(a.heartEnds, L.promptEndShare, "Heart to heart prompts end with");
  over(a.clusters, L.clusterShare, "cards share the shape");
  if (a.flat.length > Math.ceil(N * L.flatRhythmShare)) err("bank", `shape: ${a.flat.length} cards have a flat answer rhythm (max ${Math.ceil(N * L.flatRhythmShare)}): mix one-line and two-beat answers, short and long`);
  for (const [w, ids] of Object.entries(a.crutch)) if (ids.length > L.crutch[w]) err(ids.slice(L.crutch[w]).join(", "), `shape: "${w}" in ${ids.length} prompts (max ${L.crutch[w]}; first: ${ids.slice(0, L.crutch[w]).join(", ")})`);
  return a;
}

// ---------------------------------------------------------------- CLI
function loadBank(dir) {
  const cards = [];
  for (const g of GROUPS) {
    const p = path.join(dir, `${g}.json`);
    if (fs.existsSync(p)) for (const c of JSON.parse(fs.readFileSync(p, "utf8"))) cards.push({ ...c, _group: g });
  }
  return cards;
}

export function summary(a) {
  const pct = (x) => `${(x * 100).toFixed(1)}%`;
  return {
    cards: a.cards,
    answers: a.options,
    topAnswerOpener: a.optionFirstWords.filter(([w]) => w !== "i")[0],
    answersOpeningWithI: (a.optionFirstWords.find(([w]) => w === "i") || ["i", 0])[1],
    verdictAnswers: pct(a.verdictShare),
    cardsHalfSameOpener: a.cardFirstWordFails.length,
    cardsHeartAllSameOpener: a.cardHeartSameFails.length,
    cardsVerdictHeavy: a.cardVerdictFails.length,
    flatRhythmCards: a.flat.length,
    biggestCluster: a.clusters[0] && [a.clusters[0][0], a.clusters[0][1]],
    topPromptFirstWord: a.promptFirstWords[0] && a.promptFirstWords[0].slice(0, 2),
    topPromptEnd: a.promptEnds[0] && a.promptEnds[0].slice(0, 2),
    topHeartOpener: a.heartOpeners[0] && a.heartOpeners[0].slice(0, 2),
    crutch: Object.fromEntries(Object.entries(a.crutch).map(([k, v]) => [k, v.length])),
  };
}

function main(argv) {
  const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  const cards = loadBank(path.resolve(val("--bank", path.join(DIR, "bank"))));
  if (argv.includes("--limits")) {
    const errors = [];
    checkShapes(cards, (id, what) => errors.push(`${id}: ${what}`));
    errors.forEach((e) => console.log(`ERROR ${e}`));
    console.log(`${errors.length} shape limit error(s).`);
    return errors.length ? 1 : 0;
  }
  const a = auditShapes(cards);
  if (argv.includes("--json")) { const { shapes, ...rest } = a; console.log(JSON.stringify({ summary: summary(a), ...rest }, null, 1)); return 0; }
  const s = summary(a);
  console.log(`Shape audit: ${a.cards} cards, ${a.options} Make it fun answers\n`);
  console.log(JSON.stringify(s, null, 1));
  const show = (title, rows) => { console.log(`\n${title}`); for (const [k, n, ids] of rows) console.log(`  ${String(n).padStart(3)}  ${k}${ids ? `   ${ids.join(" ")}` : ""}`); };
  show("Answer opening words (Make it fun):", a.optionFirstWords);
  show("Answer forms:", a.optionForms);
  show("Prompt first words:", a.promptFirstWords);
  show("Prompt openers (2 words):", a.promptOpeners);
  show("Prompt endings (last 2 words):", a.promptEnds);
  show("Heart to heart prompt openers:", a.heartOpeners);
  show("Heart to heart prompt endings:", a.heartEnds);
  show("Shape clusters (open | end | sentences | answers | forms | rhythm):", a.clusters);
  console.log(`\nCards where one word opens more than half the answers (${a.cardFirstWordFails.length}): ${a.cardFirstWordFails.join(", ")}`);
  console.log(`\nCards whose Heart to heart answers all open the same (${a.cardHeartSameFails.length}): ${a.cardHeartSameFails.join(", ")}`);
  console.log(`\nVerdict-heavy cards (${a.cardVerdictFails.length}): ${a.cardVerdictFails.join(", ")}`);
  console.log(`\nFlat rhythm (${a.flat.length}): ${a.flat.join(", ")}`);
  console.log(`\nCrutch words: ${Object.entries(a.crutch).map(([k, v]) => `${k} ${v.length} (${v.join(" ")})`).join("; ")}`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
