// Genii persona quiz v2 scorer. Deterministic evidence parsing, no model judgment. Plain Node, no dependencies.
//
//   node score.mjs profile answers.json       -> profile.json + result.json (result page data)
//   node score.mjs freeze                      -> sealed-predictions.json + sealed-predictions.sha256 (refuses to refreeze)
//   node score.mjs check sealed-answers.json   -> sealed-results.json
//   node score.mjs friend [--rel bestie|partner|crush|friendOrCoworker] [--stings on|off] [--love on|off] [--mk on|off] [--seed N]
//                                              -> friend-deck.json (reads answers.json and profile.json in this folder)
//
// Outputs are written to the current working directory. Kit files (cards.json, library.json, friend.json) are read
// from the folder this script lives in.
//
// answers.json:
// { "setup": { "age": "teen|adult", "closest": "...", "pronoun": "she|he|they", "name": "optional display name" },
//   "<cardId>": optionIndex | [i, j] (pick_two) | "skip" | "not_my_life" | "no_recent",
//   "<cardId>.flip": index,                      (only after a "depends" option)
//   "_ms": { "<cardId>": ms } }
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createScorer } from "./score-core.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const readJSON = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
export const kit = readJSON(path.join(DIR, "cards.json"));
export const lib = readJSON(path.join(DIR, "library.json"));

// All scoring lives in score-core.mjs (shared with the quiz64 web app). This file adds the kit files and the CLI.
const scorer = createScorer({ kit, lib, friend: () => readJSON(path.join(DIR, "friend.json")) });
export const {
  CONFIG, allCards, cardById, isTeen, runCards, promptFor, optionVector, readAnswer, buildProfile, cardTagMax, twistOrder,
  cardLink, rankTags, typeOf, buildResult, profilePosition, predictCard, freezePredictions, checkSealed, friendMapping,
  buildFriendDeck,
} = scorer;
const { AXES, TAG } = scorer;

// ---------------------------------------------------------------- CLI
function sha256File(p) {
  return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
}
function writeOut(name, obj) {
  const p = path.resolve(process.cwd(), name);
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
  return p;
}
function flags(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) o[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "on";
  return o;
}
const onOff = (v) => (v === undefined ? undefined : v === "on" || v === "true" || v === "yes");

function main(argv) {
  const [cmd, file] = argv;
  if (cmd === "profile") {
    const answers = readJSON(file || "answers.json");
    const p = buildProfile(answers);
    writeOut("profile.json", p);
    const res = buildResult(p);
    writeOut("result.json", res);
    console.log(`type: ${p.type.name}  (${p.type.code})`);
    console.log(`axes: ${AXES.map((a) => `${a} ${p.axes[a].poleName}${p.axes[a].flex ? " (flex)" : ""}${p.axes[a].unfinished ? " (UNFINISHED)" : ""}`).join(", ")}`);
    console.log(`tags shown: ${p.shownTags.map((id) => `${TAG[id].name}${p.tags[id].strong ? " [strong]" : ""}`).join("; ") || "none"}`);
    console.log(`splits: ${p.splits.length}; rushed: ${p.counts.rushed}; wrote profile.json and result.json`);
    if (p.type.unfinished.length) console.log(`unfinished axes: ${p.type.unfinished.join(", ")}. Offer: ${res.unfinished.map((u) => u.extras.join(", ")).join("; ")}`);
    for (const w of p.warnings) console.log(`warning: ${w}`);
    return 0;
  }
  if (cmd === "freeze") {
    const out = path.resolve(process.cwd(), "sealed-predictions.json");
    if (fs.existsSync(out)) {
      console.error(`Refusing to refreeze: ${out} already exists (sha256 ${sha256File(out)}). Guesses are locked once.`);
      return 1;
    }
    const profPath = path.resolve(process.cwd(), "profile.json");
    if (!fs.existsSync(profPath)) { console.error("No profile.json here. Run: node score.mjs profile answers.json"); return 1; }
    const p = readJSON(profPath);
    const frozen = { ...freezePredictions(p), frozenAt: new Date().toISOString(), profileSha256: sha256File(profPath) };
    fs.writeFileSync(out, JSON.stringify(frozen, null, 2) + "\n", { flag: "wx" });
    const h = sha256File(out);
    fs.writeFileSync(path.resolve(process.cwd(), "sealed-predictions.sha256"), `${h}  sealed-predictions.json\n`);
    console.log(`sealed ${frozen.predictions.length} guesses (${frozen.predictions.filter((x) => x.pass).length} passes)`);
    console.log(`sha256 ${h}`);
    return 0;
  }
  if (cmd === "check") {
    const predPath = path.resolve(process.cwd(), "sealed-predictions.json");
    const shaPath = path.resolve(process.cwd(), "sealed-predictions.sha256");
    if (!fs.existsSync(predPath)) { console.error("No sealed-predictions.json. Run freeze first."); return 1; }
    const h = sha256File(predPath);
    const locked = fs.existsSync(shaPath) ? fs.readFileSync(shaPath, "utf8").split(/\s+/)[0] : null;
    if (locked && locked !== h) { console.error(`sealed-predictions.json changed after the freeze (locked ${locked}, now ${h}). Refusing to score.`); return 1; }
    const res = { ...checkSealed(readJSON(predPath), readJSON(file || "sealed-answers.json")), sha256: h };
    writeOut("sealed-results.json", res);
    console.log(res.line);
    console.log(`exact ${res.exact}/${res.called} (chance ${res.exactChance}), right side ${res.side}/${res.sideOf} (chance 0.5), passes ${res.passes}`);
    return 0;
  }
  if (cmd === "friend") {
    const f = flags(argv.slice(1));
    const answers = readJSON(path.resolve(process.cwd(), f.answers || "answers.json"));
    const profPath = path.resolve(process.cwd(), f.profile || "profile.json");
    const p = fs.existsSync(profPath) ? readJSON(profPath) : buildProfile(answers);
    const deck = buildFriendDeck(p, answers, { rel: f.rel, stings: onOff(f.stings), love: onOff(f.love), mk: onOff(f.mk), seed: f.seed ? Number(f.seed) : undefined });
    writeOut("friend-deck.json", deck);
    console.log(`friend deck (${deck.relationship}): level 1 six sides, level 2 ${deck.level2.cards.length} cards, level 3 ${deck.level3.cards.length} tag cards (N=${deck.level3.N ?? 0}), level 4 ${deck.level4 ? (deck.level4.enabled ? "on" : "off") : "n/a"}`);
    return 0;
  }
  console.error("usage: node score.mjs profile answers.json | freeze | check sealed-answers.json | friend [--rel bestie] [--stings on|off] [--love on|off] [--mk on|off] [--seed N]");
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { process.exitCode = main(process.argv.slice(2)); }
  catch (e) { console.error(`error: ${e.message}`); process.exitCode = 1; }
}
