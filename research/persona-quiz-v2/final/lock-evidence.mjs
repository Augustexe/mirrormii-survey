// Evidence lock (LAUNCH-SPEC section 7, step B): card and answer text can be rewritten freely, but never silently.
// evidence-lock.json holds, per card, a sha256 of each normalized text (prompt, teen prompt, chat thread, every option,
// the friend-game sides) next to the evidence that text carries (axes, tags, grade, type, weight, circumstance,
// depends, none). tests.mjs fails while any text or evidence differs from its locked entry, until a person has
// re-read the card and confirmed that the evidence still follows from the new words.
//
//   node lock-evidence.mjs                     -> check: lists every card whose text or evidence changed (exit 1 if any)
//   node lock-evidence.mjs --confirm C2-5 ...  -> after review: shows each card's current text and evidence, re-locks it
//   node lock-evidence.mjs --all               -> locks every card as it is now (the initial lock, or a full re-review)
//
// Ids are the keys: renaming tags, types or result lines in library.json never trips the lock. Plain Node, no deps.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const DIR = path.dirname(fileURLToPath(import.meta.url));
export const LOCK_FILE = path.join(DIR, "evidence-lock.json");
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));

// Typography and spacing never change meaning: Unicode NFKC, straight quotes, "..." for the ellipsis, one space, no
// outer spaces, lower case.
export function normalize(text) {
  return String(text ?? "")
    .normalize("NFKC")
    .replace(/[‘’‚′]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/…/g, "...")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
const sha = (text) => crypto.createHash("sha256").update(normalize(text)).digest("hex");

// The evidence one option (or friend side) carries, in a stable shape.
function evidenceOf(o) {
  const ev = {};
  const axes = Object.entries(o.axes || {}).filter(([, v]) => v).sort(([a], [b]) => a.localeCompare(b));
  if (axes.length) ev.axes = Object.fromEntries(axes);
  const tags = [...(o.tags || [])].map((t) => ({ id: t.id, s: t.s })).sort((a, b) => a.id.localeCompare(b.id));
  if (tags.length) ev.tags = tags;
  for (const k of ["circumstance", "depends", "none"]) if (o[k]) ev[k] = true;
  return ev;
}

// The lock entry for one card as it is now.
export function entryFor(card) {
  const e = {
    type: card.type, grade: card.grade ?? null, weight: card.weight ?? null,
    prompt: sha(card.prompt),
    options: card.options.map((o) => ({ text: sha(o.t), evidence: evidenceOf(o) })),
  };
  if (card.teenPrompt) e.teenPrompt = sha(card.teenPrompt);
  if (card.thread) e.thread = sha(card.thread.map((m) => `${m.from}: ${m.text}`).join("\n"));
  if (card.friend) e.friend = { prompt: sha(card.friend.prompt), a: { text: sha(card.friend.a.t), evidence: evidenceOf(card.friend.a) }, b: { text: sha(card.friend.b.t), evidence: evidenceOf(card.friend.b) } };
  return e;
}

export function allCards(kit) {
  return [...kit.chapters.flatMap((c) => c.cards), ...kit.extras, ...kit.finale];
}

// Every difference between the kit and the lock, one line each: [{ id, what }].
export function checkLock(kit, lock) {
  const out = [];
  const cards = allCards(kit);
  const ids = new Set(cards.map((c) => c.id));
  for (const card of cards) {
    const locked = lock.cards[card.id];
    if (!locked) { out.push({ id: card.id, what: "new card, not locked yet" }); continue; }
    const now = entryFor(card);
    for (const k of ["type", "grade", "weight"]) if (now[k] !== locked[k]) out.push({ id: card.id, what: `${k} ${locked[k]} -> ${now[k]}` });
    for (const k of ["prompt", "teenPrompt", "thread"]) if (now[k] !== locked[k]) out.push({ id: card.id, what: `${k} text changed` });
    if (now.options.length !== locked.options.length) out.push({ id: card.id, what: `${locked.options.length} options -> ${now.options.length}` });
    now.options.forEach((o, i) => {
      const l = locked.options[i];
      if (!l) return;
      if (o.text !== l.text) out.push({ id: card.id, what: `option ${i} text changed ("${card.options[i].t}"); evidence locked as ${JSON.stringify(l.evidence)}` });
      if (JSON.stringify(o.evidence) !== JSON.stringify(l.evidence)) out.push({ id: card.id, what: `option ${i} evidence ${JSON.stringify(l.evidence)} -> ${JSON.stringify(o.evidence)}` });
    });
    if (JSON.stringify(now.friend || null) !== JSON.stringify(locked.friend || null)) out.push({ id: card.id, what: "friend version text or evidence changed" });
  }
  for (const id of Object.keys(lock.cards)) if (!ids.has(id)) out.push({ id, what: "locked card no longer in the kit" });
  return out;
}

function describe(card) {
  const lines = [`${card.id} (${card.type}, ${card.grade}, ${card.weight}): ${card.prompt}`];
  if (card.teenPrompt) lines.push(`  teen: ${card.teenPrompt}`);
  for (const m of card.thread || []) lines.push(`  [${m.from}] ${m.text}`);
  card.options.forEach((o, i) => lines.push(`  ${i}. ${o.t}  ${JSON.stringify(evidenceOf(o))}`));
  if (card.friend) lines.push(`  friend: ${card.friend.prompt} / a: ${card.friend.a.t} ${JSON.stringify(evidenceOf(card.friend.a))} / b: ${card.friend.b.t} ${JSON.stringify(evidenceOf(card.friend.b))}`);
  return lines.join("\n");
}

function main(argv) {
  const kit = readJSON(path.join(DIR, "cards.json"));
  const lock = fs.existsSync(LOCK_FILE) ? readJSON(LOCK_FILE) : { note: "", cards: {} };
  const today = new Date().toISOString().slice(0, 10);
  const write = () => {
    lock.note = "Evidence lock for cards.json. Written only by lock-evidence.mjs after a person re-reads the card; see that file.";
    lock.normalize = "NFKC, straight quotes, ... for the ellipsis, single spaces, trimmed, lower case; sha256 hex";
    const cards = Object.fromEntries(Object.keys(lock.cards).sort().map((id) => [id, lock.cards[id]]));
    fs.writeFileSync(LOCK_FILE, JSON.stringify({ note: lock.note, normalize: lock.normalize, cards }, null, 2) + "\n");
  };
  if (argv.includes("--all")) {
    lock.cards = {};
    for (const card of allCards(kit)) lock.cards[card.id] = { confirmed: today, ...entryFor(card) };
    write();
    console.log(`locked ${Object.keys(lock.cards).length} cards`);
    return 0;
  }
  const at = argv.indexOf("--confirm");
  if (at >= 0) {
    const ids = argv.slice(at + 1).filter((x) => !x.startsWith("--"));
    if (!ids.length) { console.error("name the card ids to confirm, e.g. --confirm C2-5 C7-3"); return 2; }
    const byId = Object.fromEntries(allCards(kit).map((c) => [c.id, c]));
    for (const id of ids) {
      if (!byId[id]) {
        if (lock.cards[id]) { delete lock.cards[id]; console.log(`${id}: removed from the lock (no longer in the kit)`); continue; }
        console.error(`${id}: no such card`); return 2;
      }
      console.log(`confirming what this card now says and measures:\n${describe(byId[id])}\n`);
      lock.cards[id] = { confirmed: today, ...entryFor(byId[id]) };
    }
    write();
    return 0;
  }
  const problems = checkLock(kit, lock);
  if (!problems.length) { console.log(`evidence lock holds: ${Object.keys(lock.cards).length} cards`); return 0; }
  for (const p of problems) console.log(`${p.id}: ${p.what}`);
  const ids = [...new Set(problems.map((p) => p.id))];
  console.log(`\n${problems.length} change(s) on ${ids.length} card(s). Re-read each card; when its evidence still follows from its words, run:\n  node lock-evidence.mjs --confirm ${ids.join(" ")}`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
