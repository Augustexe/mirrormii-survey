// Writes answers.json and sealed-answers.json for the three verifier play-throughs.
import fs from "node:fs";
const P = {
  jasmine: { setup: { age: "adult", closest: "partner", pronoun: "she", name: "Jasmine" },
    a: { "C1-1":2,"C1-2":1,"C1-3":0,"C1-4":1,"C1-5":0,"C1-7":1,"C1-6":1,"C1-8":1,
      "C2-1":2,"C2-2":0,"C2-3":1,"C2-4":[3,4],"C2-7":3,"C2-5":1,"C2-6":0,"C2-9":2,"C2-8":4,
      "C3-1":0,"C3-2":2,"C3-8":[2,3],"C3-3":1,"C3-5":0,"C3-6":2,"C3-7":0,"C3-12":3,"C3-9":3,"C3-9.flip":1,"C3-4":[0,4],
      "C4-1":2,"C4-5":0,"C4-2":0,"C4-4":0,"C4-3":0,"C4-7":2,"C4-8":[2,5],
      "C5-1":1,"C5-2":1,"C5-10":0,"C5-4":2,"C5-5":1,"C5-9":[2,3],"C5-6":1,"C5-7":2,"C5-8":1,
      "C6-6":1,"C6-3":0,"C6-10":1,"C6-9":0,"C6-4":3,"C6-5":1,"C6-2":1,"C6-1":1,"C6-8":2,"C6-7":[2,3],
      "C7-1":3,"C7-6":0,"C7-5":1,"C7-4":1,"C7-3":1,"C7-2":0,"C7-7":1,"C7-9":[0,3],"C7-10":0 },
    s: { "C2-10":2,"C4-10":1,"C6-S1":2,"C5-S1":2,"C7-S1":3,"C3-10":0,"C2-11":1,"C7-S2":1 } },
  jordan: { setup: { age: "adult", closest: "friend", pronoun: "he", name: "Jordan" },
    a: { "C1-1":1,"C1-2":3,"C1-3":3,"C1-4":4,"C1-5":3,"C1-7":0,"C1-6":0,"C1-8":1,
      "C2-1":0,"C2-2":1,"C2-3":2,"C2-4":[0,2],"C2-7":2,"C2-5":0,"C2-6":1,"C2-9":3,"C2-8":1,
      "C3-1":3,"C3-2":3,"C3-8":[3,4],"C3-3":0,"C3-5":0,"C3-6":0,"C3-7":1,"C3-12":1,"C3-4":[1,3],
      "C4-1":1,"C4-5":2,"C4-2":0,"C4-4":1,"C4-3":1,"C4-7":0,"C4-8":[0,4],
      "C5-1":0,"C5-2":1,"C5-10":0,"C5-4":0,"C5-5":3,"C5-9":[0,1],"C5-6":1,"C5-7":1,"C5-8":2,
      "C6-6":2,"C6-3":1,"C6-10":0,"C6-9":0,"C6-4":1,"C6-5":1,"C6-2":0,"C6-1":0,"C6-8":1,"C6-7":[0,2],
      "C7-1":0,"C7-6":0,"C7-5":0,"C7-4":1,"C7-3":2,"C7-2":0,"C7-7":0,"C7-9":[2,5],"C7-10":"not_my_life" },
    s: { "C2-10":0,"C4-10":"not_my_life","C6-S1":3,"C5-S1":0,"C7-S1":0,"C3-10":3,"C2-11":0,"C7-S2":1 } },
  riley: { setup: { age: "teen", closest: "best friend", pronoun: "they", name: "Riley" },
    a: { "C1-1":4,"C1-2":0,"C1-3":4,"C1-4":0,"C1-5":0,"C1-7":0,"C1-6":1,"C1-8":0,
      "C2-1":1,"C2-2":3,"C2-3":0,"C2-4":[1,5],"C2-7":0,"C2-5":4,"C2-6":3,"C2-9":1,"C2-8":2,
      "C3-1":1,"C3-2":0,"C3-3":3,"C3-5":1,"C3-6":1,"C3-7":3,"C3-12":2,"C3-4":[2,4],
      "C4-1":0,"C4-5":3,"C4-2":1,"C4-4":0,"C4-3":0,"C4-7":1,"C4-8":[1,5],
      "C5-1":1,"C5-2":1,"C5-10":1,"C5-4":3,"C5-5":0,"C5-9":[2,5],"C5-6":0,"C5-7":0,"C5-8":0,
      "C6-6":3,"C6-6.flip":0,"C6-3":0,"C6-10":1,"C6-4":3,"C6-5":3,"C6-2":3,"C6-1":3,"C6-8":4,"C6-7":[4,5],
      "C7-1":1,"C7-6":1,"C7-5":3,"C7-4":2,"C7-3":0,"C7-2":3,"C7-7":1,"C7-9":[1,3],"C7-10":1 },
    s: { "C2-10":3,"C4-10":0,"C6-S1":1,"C5-S1":3,"C7-S1":1,"C3-10":2,"C2-11":1,"C7-S2":0 } },
};
// timings: a deterministic spread, real cards slower, a few fast this_or_that taps (still over 1.5 s except two per player)
const cards = JSON.parse(fs.readFileSync("../final/cards.json", "utf8"));
const type = Object.fromEntries(cards.chapters.flatMap((c) => c.cards).map((c) => [c.id, c.type]));
for (const [name, p] of Object.entries(P)) {
  fs.mkdirSync(name, { recursive: true });
  for (const f of fs.readdirSync(name)) fs.rmSync(`${name}/${f}`);
  const ms = {}; let k = 0;
  for (const id of Object.keys(p.a)) {
    if (id.includes(".")) continue;
    const t = type[id]; k++;
    ms[id] = t === "real" ? 9000 + (k * 611) % 5000 : t === "this_or_that" ? 2400 + (k * 353) % 2500 : t === "feeling" ? 2600 : 5200 + (k * 479) % 4000;
  }
  // two rushed taps each, on this_or_that cards, to exercise the rushed rule
  Object.keys(ms).filter((id) => type[id] === "this_or_that").slice(-2).forEach((id) => (ms[id] = 1100));
  fs.writeFileSync(`${name}/answers.json`, JSON.stringify({ setup: p.setup, ...p.a, _ms: ms }, null, 2) + "\n");
  fs.writeFileSync(`${name}/sealed-answers.json`, JSON.stringify(p.s, null, 2) + "\n");
}
