#!/usr/bin/env node
// Question pack export: one readable, versioned view of the card bank for developers and content work.
//
//   node scripts/export-question-pack.mjs          -> writes docs/question-pack/question-pack.csv and question-pack.json
//   node scripts/export-question-pack.mjs --check  -> exit 1 when the committed files differ from cards.json
//
// Source of truth stays research/persona-quiz-v2/final/cards.json (merged from bank/*.json by merge-bank.mjs). This
// export never feeds the app; it is regenerated after every bank merge, and scripts/validate-contracts.mjs fails while
// it is stale. Output is deterministic (no timestamps), so an unchanged bank gives an unchanged file.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const KIT = path.join(ROOT, "research", "persona-quiz-v2", "final");
const OUT = path.join(ROOT, "docs", "question-pack");
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];

export const COLUMNS = Object.freeze([
  "id", "group", "chapter", "chapter_title", "position", "format", "grade", "weight", "world", "privacy", "sq",
  "sub_question", "prompt_fun", "prompt_heart", "thread_fun", "options_fun", "options_heart", "evidence", "axes",
  "tag_pairs", "sealed_checks", "follows", "round", "friend_card", "mask",
]);

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replaceAll("\"", "\"\"")}"` : s;
};
const signed = (v) => (v > 0 ? `+${v}` : String(v));

// One option's evidence in a short readable form: "R1+2 T02B:2 (envy)"; exits and none say so.
function evidenceOf(o) {
  if (o.none) return "none of these (scores nothing)";
  if (o.circumstance) return "circumstance (scores nothing)";
  if (o.depends) return "depends (scores nothing, opens a follow-up)";
  const parts = [
    ...Object.entries(o.axes || {}).map(([a, v]) => `${a}${signed(v)}`),
    ...(o.tags || []).map((t) => `${t.id}:${t.s}`),
  ];
  const s = parts.join(" ") || "no evidence";
  return o.emotion ? `${s} (${o.emotion})` : s;
}

function row(card, group, chapter, position, sqText) {
  const heart = card.heart || {};
  const axes = new Set();
  const pairs = new Set();
  for (const o of card.options) {
    for (const [a, v] of Object.entries(o.axes || {})) if (v) axes.add(a);
    for (const t of o.tags || []) pairs.add(t.id.slice(0, 3));
  }
  const list = (xs) => xs.map((t, i) => `${i + 1}. ${t}`).join(" || ");
  return {
    id: card.id,
    group,
    chapter: chapter ? chapter.n : "",
    chapter_title: chapter ? chapter.title : group === "extra" ? "Extras (axis cards)" : "Sealed finale",
    position,
    format: card.type,
    grade: card.grade,
    weight: card.weight,
    world: card.world || "",
    privacy: card.privacy || "",
    sq: card.sq || "",
    sub_question: sqText || "",
    prompt_fun: card.prompt,
    prompt_heart: heart.prompt || "",
    thread_fun: (card.thread || []).map((m) => `${m.from}: ${m.text}`).join(" || "),
    options_fun: list(card.options.map((o) => o.t)),
    options_heart: list(heart.options || []),
    evidence: card.options.map((o, i) => `${i + 1}. ${evidenceOf(o)}`).join(" || "),
    axes: AXES.filter((a) => axes.has(a)).join(" "),
    tag_pairs: [...pairs].sort().join(" "),
    sealed_checks: card.checks ? [card.checks.primary || "", ...(card.checks.pairs || [])].filter(Boolean).join(" ") : card.axisFor ? `extra for ${card.axisFor}` : "",
    follows: card.follows || "",
    round: card.round || "",
    friend_card: card.friend ? "yes" : "",
    mask: card.mask || "",
  };
}

const count = (xs, key) => {
  const out = {};
  for (const x of xs) { const k = String(key(x)); out[k] = (out[k] || 0) + 1; }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b, "en", { numeric: true })));
};

export function buildPack() {
  const raw = fs.readFileSync(path.join(KIT, "cards.json"), "utf8");
  const kit = JSON.parse(raw);
  const lib = JSON.parse(fs.readFileSync(path.join(KIT, "library.json"), "utf8"));
  const friend = JSON.parse(fs.readFileSync(path.join(KIT, "friend.json"), "utf8"));
  const sqs = JSON.parse(fs.readFileSync(path.join(KIT, "subquestions.json"), "utf8"));
  const sqText = Object.fromEntries((sqs.subquestions || []).map((q) => [q.id, q.question]));

  const rows = [];
  for (const ch of kit.chapters) ch.cards.forEach((c, i) => rows.push({ card: c, r: row(c, "chapter", ch, i + 1, sqText[c.sq]) }));
  kit.extras.forEach((c, i) => rows.push({ card: c, r: row(c, "extra", null, i + 1, sqText[c.sq]) }));
  kit.finale.forEach((c, i) => rows.push({ card: c, r: row(c, "sealed", null, i + 1, sqText[c.sq]) }));

  const csv = [COLUMNS.join(","), ...rows.map(({ r }) => COLUMNS.map((k) => csvCell(r[k])).join(","))].join("\n") + "\n";

  // Scored pool: chapter cards and extras (sealed cards never score).
  const scored = rows.filter(({ r }) => r.group !== "sealed").map(({ card }) => card);
  const perAxis = Object.fromEntries(AXES.map((a) => [a, scored.filter((c) => c.options.some((o) => (o.axes || {})[a])).length]));
  const perTag = {};
  for (const t of lib.tags) perTag[t.id] = scored.filter((c) => c.options.some((o) => (o.tags || []).some((x) => x.id === t.id))).length;
  const meta = {
    what: "Question pack export of research/persona-quiz-v2/final/cards.json. Generated by scripts/export-question-pack.mjs; do not edit by hand.",
    kitId: `${kit.version}@${kit.built}/${lib.built}/${friend.version}`,
    version: kit.version,
    built: kit.built,
    cardsSha256: crypto.createHash("sha256").update(raw).digest("hex"),
    columns: COLUMNS,
    counts: {
      cards: rows.length,
      byGroup: count(rows, ({ r }) => r.group),
      byChapter: count(rows.filter(({ r }) => r.group === "chapter"), ({ r }) => `${r.chapter} ${r.chapter_title}`),
      byFormat: count(rows, ({ r }) => r.format),
      byGrade: count(rows, ({ r }) => r.grade),
      byWorld: count(rows, ({ r }) => r.world),
      byPrivacy: count(rows, ({ r }) => r.privacy),
      friendCards: rows.filter(({ card }) => card.friend).length,
      scoredCardsPerAxis: perAxis,
      scoredCardsPerTag: perTag,
    },
    weights: kit.weights,
    exits: Object.fromEntries(Object.entries(kit.exits).map(([k, v]) => [k, v.t])),
  };
  return { rows: rows.map(({ r }) => r), meta, files: { "question-pack.csv": csv, "question-pack.json": JSON.stringify(meta, null, 2) + "\n" } };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pack = buildPack();
  if (process.argv.includes("--check")) {
    const stale = Object.entries(pack.files).filter(([name, text]) => !fs.existsSync(path.join(OUT, name)) || fs.readFileSync(path.join(OUT, name), "utf8") !== text).map(([n]) => n);
    if (stale.length) { console.error(`stale: ${stale.join(", ")} (run node scripts/export-question-pack.mjs)`); process.exit(1); }
    console.log(`question pack current: ${pack.meta.counts.cards} cards, ${pack.meta.kitId}`);
  } else {
    fs.mkdirSync(OUT, { recursive: true });
    for (const [name, text] of Object.entries(pack.files)) fs.writeFileSync(path.join(OUT, name), text);
    console.log(`wrote docs/question-pack: ${pack.meta.counts.cards} cards, ${pack.meta.kitId}, cards.json sha256 ${pack.meta.cardsSha256.slice(0, 12)}`);
  }
}
