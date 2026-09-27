// node build-doc.cjs  → writes ../docs/questions/PILOT-BANK-V1.md from bank.js (never edit the md by hand)
const fs = require("fs");
const path = require("path");
const BANK = require("./bank.js");
const lv = (x) => (x === null || x === undefined ? "none on this tag" : { "-2": "A2 strongly A", "-1": "A1 leaning A", "0": "0 depends", "1": "B1 leaning B", "2": "B2 strongly B" }[String(x)]);
const out = [];
out.push(`---
title: Tag pilot bank V1, questions broken down into evidence
status: proposed
owner: jerry
created: 2026-09-26
updated: 2026-09-26
source_basis: generated from products/survey/pilot/bank.js (${BANK.version}); Sally's research in research/sally-values-2026-09-26; TAG-VALIDATION-SPEC.md
---

# Tag pilot bank V1

Generated from \`pilot/bank.js\` by \`pilot/build-doc.cjs\`. Edit the bank, not this page.

${BANK.DIMENSIONS.length} tag dimensions (${BANK.DIMENSIONS.filter((d) => d.scene).length} with a masked scene), ${BANK.SEALED.length} sealed checks. Every tag has a stance item (what they believe, 5 positions, grade *prefer*). Scenes (what they did, grade *did*) set the tag level when answered. A stance and scene on opposite sides make a **split** tag. Levels: A2 strongly A, A1 leaning A, 0 depends, B1 leaning B, B2 strongly B.

Sources: Qnn are Sally's 48 dilemmas; Tnn are her 60 debate topics.
`);
for (const [dk, dname] of Object.entries(BANK.DOMAINS)) {
  out.push(`\n## ${dname}\n`);
  for (const d of BANK.DIMENSIONS.filter((x) => x.domain === dk)) {
    out.push(`### \`${d.id}\`: ${d.A} ↔ ${d.B}${d.adultOnly ? " (18+ only)" : ""}\n`);
    out.push(`Sally: ${d.sally.join(", ")} · Never read as: ${d.never}\n`);
    out.push(`**Stance** (${d.stance.feel}; ${d.stance.mask}): "${d.stance.prompt}"${d.stance.teenPrompt ? ` Teen version: "${d.stance.teenPrompt}"` : ""}\n`);
    out.push(`- A: ${d.stance.a}\n- B: ${d.stance.b}\n`);
    if (d.scene) {
      out.push(`\n**Scene** (${d.scene.feel}; ${d.scene.mask}): "${d.scene.prompt}"\n`);
      out.push(`| Option | Level | Also records |\n|---|---|---|`);
      for (const o of d.scene.options) out.push(`| ${o.t} | ${lv(o.level)} | ${[...(o.also || []), o.emotion ? `emotion: ${o.emotion}` : "", o.flag ? `caution: ${o.flag}` : ""].filter(Boolean).join("; ")} |`);
      out.push(`| No recent example / Skip | missing | |`);
    }
    const sealed = BANK.SEALED.filter((h) => h.dim === d.id);
    for (const h of sealed) {
      out.push(`\n**Predicts, sealed check ${h.id}:** "${h.prompt}"\n`);
      out.push(h.options.map((o) => `- ${o.t} (${lv(o.level)})`).join("\n"));
      out.push(`\nGenii guesses the option closest to the tag level, and passes if the tag is unknown, depends or split.\n`);
    }
    out.push("");
  }
}
fs.writeFileSync(path.join(__dirname, "../docs/questions/PILOT-BANK-V1.md"), out.join("\n"));
console.log("wrote docs/questions/PILOT-BANK-V1.md");
