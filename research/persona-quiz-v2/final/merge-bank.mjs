// Builds cards.json from the bank (LAUNCH-SPEC section 22). Plain Node, no dependencies.
//
//   node merge-bank.mjs                 -> checks bank/ch1.json .. ch7.json, extras.json, sealed.json with check-bank.mjs,
//                                          then writes cards.json (refuses while a bank file is missing or has errors)
//   node merge-bank.mjs --dry           -> checks and prints what it would write; writes nothing
//   node merge-bank.mjs --bank DIR --out FILE --base FILE
//                                       -> another bank folder, output file, or kit to take chapter titles and intros from
//   node merge-bank.mjs --force         -> writes even with checker errors (never for a release)
//
// Each bank file is a JSON array of cards in the card-writer skill schema (skills/shared/genii-card-writer). The merge
// fills grade, weight and exits from the type (card-schema.mjs), sets each card's chapter from its file, fills pick 2
// on pick_two, axisFor on extras and checks on sealed cards when missing, renames the legacy guilty type to bet and
// drops age fields. Chapter titles and intros, exits and flow come from the base kit (cards.json). Card order within a
// file is play order: a chapter opens with its first card. After a merge, re-read new or changed cards and run
// lock-evidence.mjs, then audit.mjs and sim.mjs.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { TYPES, fillFromType, stripAgeFields } from "./card-schema.mjs";
import { GROUPS, checkCards, loadBank } from "./check-bank.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const AXES = ["R1", "R2", "R3", "L1", "L2", "L3"];

// Axes and tag pairs a card's options carry, with weights (for sealed checks and extras' axisFor).
function carried(card) {
  const axes = {};
  const pairs = {};
  for (const o of card.options || []) {
    for (const [k, v] of Object.entries(o.axes || {})) axes[k] = (axes[k] || 0) + Math.abs(v);
    for (const t of o.tags || []) { const p = t.id.slice(0, 3); pairs[p] = (pairs[p] || 0) + t.s; }
  }
  return { axes, pairs };
}

export function prepareCard(raw, group) {
  const { _group, ...rest } = raw;
  let c = fillFromType(stripAgeFields(rest));
  if (/^ch[1-7]$/.test(group)) c.chapter = Number(group.slice(2));
  if (group === "extras") {
    c.chapter = "extra";
    if (!c.axisFor) {
      const ax = Object.keys(carried(c).axes);
      if (ax.length === 1) c.axisFor = ax[0];
    }
  }
  if (c.type === "pick_two" && c.pick === undefined) c.pick = 2;
  if (c.type === "sealed" && !c.checks) {
    const { axes, pairs } = carried(c);
    const primary = c.primary && AXES.includes(c.primary) ? c.primary : Object.keys(axes).sort((a, b) => axes[b] - axes[a])[0] || null;
    c.checks = { primary, axes: Object.keys(axes), pairs: Object.keys(pairs) };
  }
  return c;
}

// The kit object merge would write. base: the current kit (chapter titles and intros, exits, flow, version).
export function buildKit(cards, base, { built = new Date().toISOString().slice(0, 10) } = {}) {
  const by = Object.fromEntries(GROUPS.map((g) => [g, []]));
  for (const c of cards) by[c._group].push(prepareCard(c, c._group));
  return {
    version: base.version,
    built,
    sources: { bank: GROUPS.map((g) => `bank/${g}.json`), merge: "merge-bank.mjs" },
    weights: { ...Object.fromEntries(Object.entries(TYPES).map(([t, s]) => [t, s.weight])), rushedMs: base.weights.rushedMs, rushedFactor: base.weights.rushedFactor, rankPositions: base.weights.rankPositions || [1, 0.5, 0, -0.5] },
    exits: base.exits,
    flow: base.flow,
    chapters: base.chapters.map((ch) => ({ n: ch.n, title: ch.title, intro: ch.intro, cards: by[`ch${ch.n}`] })),
    finale: by.sealed,
    extras: by.extras,
  };
}

function main(argv) {
  const flag = (k) => argv.includes(k);
  const val = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : d; };
  const bankDir = path.resolve(val("--bank", path.join(DIR, "bank")));
  const out = path.resolve(val("--out", path.join(DIR, "cards.json")));
  const basePath = path.resolve(val("--base", path.join(DIR, "cards.json")));
  const lib = JSON.parse(fs.readFileSync(val("--lib", path.join(DIR, "library.json")), "utf8"));
  const { cards, missing, broken } = loadBank(bankDir);
  if (missing.length || broken.length) {
    for (const g of missing) console.error(`missing: ${path.join(bankDir, `${g}.json`)}`);
    for (const b of broken) console.error(`${b.group}.json: ${b.what}`);
    console.error("Refusing to merge: every bank file must exist and parse. Nothing was written.");
    return 1;
  }
  const res = checkCards(cards, { lib });
  for (const e of res.errors) console.error(`ERROR ${e.id}: ${e.what}`);
  console.log(`check-bank: ${res.errors.length} error(s), ${res.warnings.length} warning(s) (node check-bank.mjs --bank ${bankDir} for the warnings)`);
  if (res.errors.length && !flag("--force")) { console.error("Refusing to merge while the bank has errors. Nothing was written."); return 1; }
  const kit = buildKit(cards, JSON.parse(fs.readFileSync(basePath, "utf8")));
  const n = kit.chapters.reduce((s, ch) => s + ch.cards.length, 0);
  const summary = `${n} chapter cards (${kit.chapters.map((ch) => `${ch.n}: ${ch.cards.length}`).join(", ")}), ${kit.extras.length} extras, ${kit.finale.length} sealed`;
  if (flag("--dry")) { console.log(`dry run: would write ${out}: ${summary}`); return 0; }
  fs.writeFileSync(out, JSON.stringify(kit, null, 2) + "\n");
  console.log(`wrote ${out}: ${summary}`);
  console.log("Next: node lock-evidence.mjs (re-read and --confirm new or changed cards), node audit.mjs, node sim.mjs --quick, node --test tests.mjs");
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) process.exitCode = main(process.argv.slice(2));
