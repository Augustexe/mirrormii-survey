// Assembles the blind test 2 kit from the chapter and library sources.
//   node assemble.mjs   -> library.json + cards.json (in this folder)
// Sources: ../chapters/ch1..7.final.json, ../library/types.json, ../library/tags.json,
// ../judges/flow.json (finale order). Plain Node, no dependencies.
import fs from "node:fs";

const here = (p) => new URL(p, import.meta.url);
const read = (p) => JSON.parse(fs.readFileSync(here(p), "utf8"));
const write = (p, o) => fs.writeFileSync(here(p), JSON.stringify(o, null, 2) + "\n");

const types = read("../library/types.json");
const tagsLib = read("../library/tags.json");
const flow = read("../judges/flow.json");

// ---------- library.json ----------
const library = {
  version: "persona-quiz-v2",
  built: "2026-09-26",
  sources: ["../library/types.json", "../library/tags.json"],
  axes: types.axes,
  relationship: types.relationship,
  life: types.life,
  typeNameRule: types.typeNameRule,
  typeCodeRule: types.typeCodeRule,
  flex: types.flex,
  unfinished: types.unfinished,
  examples: types.examples,
  tagRules: tagsLib.rules,
  tagChapters: tagsLib.chapters,
  tags: tagsLib.tags,
};
write("./library.json", library);

// ---------- cards.json ----------
const GRADE = { real: "did", scenario: "would", this_or_that: "believe", role: "believe", pick_two: "believe", feeling: "emotion", sealed: "none" };
const WEIGHT = { did: 0.8, would: 0.55, believe: 0.45, emotion: 0, none: 0 };

function decorate(card, n) {
  const c = structuredClone(card);
  c.chapter = n;
  c.grade = GRADE[c.type];
  c.weight = WEIGHT[c.grade];
  c.exits = c.type === "real" ? ["skip", "not_my_life", "no_recent"] : ["skip", "not_my_life"];
  if (c.type === "pick_two") c.pick = 2;
  c.teen = c.privacy !== "locked18";
  if (c.flip) {
    for (const o of c.options) {
      const empty = !o.circumstance && !Object.keys(o.axes || {}).length && !(o.tags || []).length;
      if (empty && /^depends/i.test(o.t)) o.depends = true;
    }
  }
  if (c.id === "C3-9") c.gateRule = { card: "C3-8", anyTag: "T11A" };
  if (c.type === "sealed") {
    const axes = {}, pairs = {};
    for (const o of c.options) {
      for (const [k, v] of Object.entries(o.axes || {})) axes[k] = (axes[k] || 0) + Math.abs(v);
      for (const t of o.tags || []) { const p = t.id.slice(0, 3); pairs[p] = (pairs[p] || 0) + t.s; }
    }
    const primary = Object.keys(axes).sort((a, b) => axes[b] - axes[a])[0] || null;
    c.checks = { primary, axes: Object.keys(axes), pairs: Object.keys(pairs) };
  }
  return c;
}

const chapters = [];
const sealedPool = {};
for (let n = 1; n <= 7; n++) {
  const src = read(`../chapters/ch${n}.final.json`);
  const byId = Object.fromEntries(src.cards.map((c) => [c.id, c]));
  const order = src.order || src.cards.filter((c) => c.type !== "sealed").map((c) => c.id);
  for (const c of src.cards) if (c.type === "sealed") sealedPool[c.id] = decorate(c, n);
  const cards = order.map((id) => {
    if (!byId[id]) throw new Error(`ch${n}: order names missing card ${id}`);
    return decorate(byId[id], n);
  });
  // this_or_that rounds: consecutive this_or_that cards form one round
  let r = 0;
  for (let i = 0; i < cards.length; i++) {
    if (cards[i].type !== "this_or_that") continue;
    if (i === 0 || cards[i - 1].type !== "this_or_that") r++;
    cards[i].round = `ch${n}-r${r}`;
  }
  chapters.push({ n, title: src.title, intro: src.intro, cards });
}

// Finale: the flow judge's 8 (one check per axis plus two common-tag checks: C2-11 T05/T06, C7-S2 T22).
const finaleIds = flow.order.finale;
const finale = finaleIds.map((id) => {
  if (!sealedPool[id]) throw new Error(`finale card ${id} not found among sealed cards`);
  return sealedPool[id];
});
const unused = Object.keys(sealedPool).filter((id) => !finaleIds.includes(id));
if (unused.length) console.log("sealed cards not in finale:", unused.join(", "));

// Extra cards for an unfinished axis (brief: "the player is offered 1 or 2 extra cards for it").
// New, written in the golden-set register. Axis evidence only; they never feed tags.
const X = (id, axis, type, prompt, options, extra = {}) => {
  const grade = GRADE[type];
  return { id, type, axisFor: axis, prompt, privacy: "normal", options, grade, weight: WEIGHT[grade], exits: ["skip", "not_my_life"], teen: true, chapter: "extra", mask: `extra card, only when ${axis} is unfinished; measures ${axis} only`, ae: ["A", "D"], ...extra };
};
const extras = [
  X("X-R1-1", "R1", "scenario", "Your closest person suddenly has a free weekend. They text: 'Plans? Or do you want the weekend to yourself?'", [
    { t: "Book a two-day plan for us before they change their mind.", axes: { R1: 2 } },
    { t: "Drag them along to my friends' thing. They'll fit right in.", axes: { R1: 1 } },
    { t: "Saturday together. Sunday, phone off, just me.", axes: { R1: -1 } },
    { t: "Tell them to have fun. I've been saving a solo weekend.", axes: { R1: -2 } },
  ]),
  X("X-R1-2", "R1", "this_or_that", "Good news just landed. Big, happy, yours. Who hears it first?", [
    { t: "My person, before I even finish reading it.", axes: { R1: 2 } },
    { t: "Nobody, for a day. I like holding it alone first.", axes: { R1: -2 } },
  ]),
  X("X-R2-1", "R2", "scenario", "Your friend borrowed your hoodie a month ago. Tonight they show up in it again, like it came with them at birth.", [
    { t: "'Love the hoodie. It's mine. I want it back tonight.'", axes: { R2: 2 } },
    { t: "'Nice hoodie. Looks weirdly familiar.' Wait for it to land.", axes: { R2: 1 } },
    { t: "Say nothing tonight. Text them tomorrow, nicely.", axes: { R2: -1 } },
    { t: "Let it go. It honestly looks better on them.", axes: { R2: -2 } },
  ]),
  X("X-R2-2", "R2", "this_or_that", "The group's Saturday plan is honestly bad. Everyone else is already hyped.", [
    { t: "Say it in the chat: 'This plan is bad. Hear me out.'", axes: { R2: 2 } },
    { t: "Go along with it. Pitch my idea next time, gently.", axes: { R2: -2 } },
  ]),
  X("X-R3-1", "R3", "this_or_that", "Your birthday. Cake, candles, the whole song?", [
    { t: "Obviously. Candles, song, one wish. Every single year.", axes: { R3: 2 } },
    { t: "Skip the song. Tacos and a movie is my tradition now.", axes: { R3: -2 } },
  ]),
  X("X-R3-2", "R3", "scenario", "Someday it's your home and your rules. A normal weeknight dinner looks like...", [
    { t: "Everyone at the table at 7. Phones in a basket.", axes: { R3: 2 } },
    { t: "Sunday dinner is sacred. Weeknights are a free-for-all.", axes: { R3: 1 } },
    { t: "A different friend cooks every Friday. We made that up.", axes: { R3: -1 } },
    { t: "Whoever's hungry eats. The couch counts as a table.", axes: { R3: -2 } },
  ]),
  X("X-L1-1", "L1", "this_or_that", "A mystery trip: you pay now, and you find out the city at the airport.", [
    { t: "Book it. Not knowing is the whole point.", axes: { L1: -2 } },
    { t: "Pass. I need to know where I'm sleeping.", axes: { L1: 2 } },
  ]),
  X("X-L1-2", "L1", "scenario", "Your friend wants to start a snack stand and asks you to put in half your savings. Half the profit is yours, if there is any.", [
    { t: "In. Worst case, I get a story and free snacks.", axes: { L1: -2 } },
    { t: "In, and I bring two more friends to split the risk.", axes: { L1: -1 } },
    { t: "Only if I see the numbers every single week.", axes: { L1: 1 } },
    { t: "Keep my savings. Offer to design the sign for free.", axes: { L1: 2 } },
  ]),
  X("X-L2-1", "L2", "this_or_that", "Your favorite game adds a ranked mode with a public top 100.", [
    { t: "Grind till my name is on it. It belongs there.", axes: { L2: 2 } },
    { t: "Stay casual. Ranked sounds like homework.", axes: { L2: -2 } },
  ]),
  X("X-L2-2", "L2", "scenario", "Your friends start a 30-day challenge: learn anything, post your progress daily.", [
    { t: "Pick something hard. Make a progress chart. Win.", axes: { L2: 2 } },
    { t: "Join with something that helps my actual plans.", axes: { L2: 1 } },
    { t: "Join for the chat. Post when the mood hits.", axes: { L2: -1 } },
    { t: "Skip it. I learn things on my own clock.", axes: { L2: -2 } },
  ]),
  X("X-L3-1", "L3", "this_or_that", "Long coffee line. The person behind you is late for an exam and asks to cut in.", [
    { t: "Let them in. It's one coffee.", axes: { L3: -2 } },
    { t: "Point them to the back of the line, kindly.", axes: { L3: 2 } },
  ]),
  X("X-L3-2", "L3", "scenario", "You run the sign-up sheet for the class trip. It's full. Someone who missed the deadline by one hour asks for a spot.", [
    { t: "'Sorry, the list closed. Next trip, you're first.'", axes: { L3: 2 } },
    { t: "'Waitlist. If anyone drops, you're in.'", axes: { L3: 1 } },
    { t: "Ask the group if anyone minds one more.", axes: { L3: -1 } },
    { t: "Squeeze them in. One more seat is fine.", axes: { L3: -2 } },
  ]),
];

const kit = {
  version: "persona-quiz-v2",
  built: "2026-09-26",
  sources: {
    chapters: [1, 2, 3, 4, 5, 6, 7].map((n) => `../chapters/ch${n}.final.json`),
    finaleOrder: "../judges/flow.json order.finale",
  },
  weights: { real: 0.8, scenario: 0.55, this_or_that: 0.45, role: 0.45, pick_two: 0.45, feeling: 0, sealed: 0, rushedMs: 1500, rushedFactor: 0.3 },
  exits: {
    skip: { t: "Skip", scores: false },
    not_my_life: { t: "Not my life", scores: false, research: "premise does not fit (Sally 前提不符)" },
    no_recent: { t: "No recent example", scores: false, onlyOn: "real" },
  },
  flow: [
    "setup (age, closest person, pronoun)",
    "chapters 1 to 7, in order, each opened by its title and intro",
    "teen run (setup.age = teen): locked18 cards are never shown; teenPrompt replaces prompt where present",
    "C3-9 shows only if the C3-8 picks include a T11A line (gateRule)",
    "a feeling card always plays right after the card named in follows",
    "after chapter 7: node score.mjs profile; for any axis marked unfinished, play up to 2 extras with axisFor = that axis, then profile again",
    "node score.mjs freeze (sha256 shown before the finale)",
    "finale: the 8 sealed cards",
    "result page, then feedback",
  ],
  chapters,
  finale,
  extras,
};
write("./cards.json", kit);

const n = chapters.reduce((s, c) => s + c.cards.length, 0);
const teen = chapters.reduce((s, c) => s + c.cards.filter((x) => x.teen).length, 0);
console.log(`library.json: ${library.tags.length} tags, 16 half-names`);
console.log(`cards.json: ${n} chapter cards (${teen} teen), ${finale.length} finale, ${extras.length} extras`);
