// Every player-facing label on the result, read from the one source each lives in (docs/NAMING-RULES.md). The cold
// reader panel (LAUNCH-SPEC section 6, "The gate") scores this list; run it again after any label change:
//   node scripts/naming-inventory.mjs > /tmp/inventory.json
// Each item: { id, set, label, where, kind }. `where` tells a cold reader where the label sits on the phone, never what
// it means. kind "result" labels describe the player (the share gate applies); kind "ui" labels are headings, chips
// and buttons (clear and hurt gates only).
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { STATS } from "../quiz64/src/persona/stats.js";
import { STORY_COPY, UI_COPY, GUESS_COPY } from "../quiz64/src/persona/stories/story-data.js";
import { LOBBY_COPY } from "../quiz64/src/persona/lobby.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const LIB = JSON.parse(readFileSync(join(root, "research/persona-quiz-v2/final/library.json"), "utf8"));

const items = [];
const seen = new Set();
function add(set, label, where, kind = "ui", extra = {}) {
  if (typeof label !== "string" || !label.trim()) return;
  const key = `${set}|${label}`;
  if (seen.has(key)) return;
  seen.add(key);
  items.push({ id: `${set}:${items.filter((x) => x.set === set).length + 1}`, set, label, where, kind, ...extra });
}

const peopleKicker = STORY_COPY.fun.names.people;
const lifeKicker = STORY_COPY.fun.names.life;
add("kicker", STORY_COPY.fun.names.kicker, "small heading at the top of the result screen, above two personality names", "ui");
add("kicker", peopleKicker, "small heading right above the first personality name on a result card", "result");
add("kicker", lifeKicker, "small heading right above the second personality name on a result card", "result");

for (const r of LIB.relationship) {
  add("people-name", r.name, `personality name on a quiz result card, under the heading "${peopleKicker}"`, "result", { code: r.code, exempt: true });
  if (r.define) add("define", r.define, `one short line directly under the personality name "${r.name}"`, "result", { code: r.code });
}
for (const r of LIB.life) {
  add("life-name", r.name, `personality name on a quiz result card, under the heading "${lifeKicker}"`, "result", { code: r.code });
  if (r.define) add("define", r.define, `one short line directly under the personality name "${r.name}"`, "result", { code: r.code });
}

for (const s of Object.values(STATS)) {
  const a = s.ends[s.first];
  const b = s.ends[s.second];
  add("stat", `${s.stat}: ${a} / ${b}`, "one stat on a game-style character sheet: the stat name, then the two ends of its scale (left / right); a bead shows where you land", "result", { axis: s.axis });
}
for (const v of ["fun", "heart"]) {
  const m = STORY_COPY[v].map;
  for (const [k, w] of Object.entries(m.levels)) {
    const where = k === "open" ? "status shown on a stat that has too few answers to call"
      : k === "both" ? "word shown on a stat where you sit exactly between the two ends"
        : `word showing how strongly you lean toward your end of a stat, printed after it, like "${Object.values(STATS)[0].ends.We} · ${w}", next to five dots (more dots filled = stronger lean)`;
    add("level", w, where, k === "open" ? "ui" : "result", { key: k, voice: v });
  }
  add("badge", m.signature, "small chip on the one stat row where you lean the hardest", "ui", { voice: v });
  add("badge", m.wild, "small chip on the one stat row closest to the middle of its scale", "ui", { voice: v });
}

for (const a of LIB.axes) {
  add("keyword", a.plusKeyword, "one of five or six trait words on a personality result card", "result", { axis: a.id, end: "plus" });
  add("keyword", a.minusKeyword, "one of five or six trait words on a personality result card", "result", { axis: a.id, end: "minus" });
}
for (const t of LIB.tags) {
  add("keyword", t.keyword, "one of five or six trait words on a personality result card", "result", { tag: t.id });
  add("tag", t.name, "a short trait title on a personality result, followed by one sentence about you", "result", { tag: t.id });
}
for (const [ch, r] of Object.entries(LIB.rooms)) add("room", r.name, "label for one area of life on a result screen titled 'Room by room'", "ui", { chapter: Number(ch) });

// Stories deck headings, chips and buttons, both voices.
const deck = (v) => {
  const C = STORY_COPY[v];
  const at = (screen) => `heading on the "${screen}" screen of a personality quiz result`;
  add("deck", C.intro.kicker, at("intro"));
  add("deck", C.intro.title, at("intro"));
  add("deck", C.intro.sub, "instruction under the intro title: hold the screen to put the mirror together");
  add("deck", C.names.sub, "line under the two personality names");
  add("deck", C.read.kicker, at("read"));
  add("deck", C.map.kicker, at("stats"));
  add("deck", C.map.title, at("stats"));
  add("deck", C.map.sub, "line under the stats title");
  add("deck", C.map.signatureNote, "note on the stat where you lean the hardest");
  add("deck", C.map.wildNote, "note on the stat closest to the middle");
  add("deck", C.map.people, "group label above three stats about friends, family and love");
  add("deck", C.map.life, "group label above three stats about everyday habits and goals");
  add("deck", C.knows.kicker, at("findings"));
  add("deck", C.knows.title, at("findings"));
  for (const w of [...Object.values(C.knows.tiers), ...Object.values(C.knows.short)]) add("deck", w, "chip beside a finding about you on the \"What Genii is surest about\" screen, saying how clearly it showed in your answers");
  add("deck", C.rooms.kicker, at("rooms"));
  add("deck", C.rooms.title, at("rooms"));
  add("deck", C.rooms.differs, "chip on one area of life where you act differently than usual");
  add("deck", C.traits.kicker, at("traits"));
  add("deck", C.traits.title, at("traits"));
  add("deck", C.insight.kicker, at("insight"));
  add("deck", C.stings.kicker, `small heading above the title "${C.stings.title}"`);
  add("deck", C.stings.title, "heading on the screen that shows the downside of your strengths");
  add("deck", C.calls.kicker, at("guesses"));
  for (const w of Object.values(C.calls.titles)) add("deck", w, "headline over a row of cards showing how many of your answers the quiz host Genii guessed right");
  add("deck", C.calls.of, "text after a score like '5 of 8'");
  for (const w of Object.values(C.calls.status)) add("calls", w, "status chip on a small card: the result of Genii's guess about your answer to that card", "ui", { voice: v });
  add("deck", C.calls.key, "legend line explaining the status chips on Genii's guess cards");
  add("deck", C.calls.more, "text button under Genii's guess cards");
  add("deck", C.share.kicker, at("share"));
  add("deck", C.share.sub, "line under the shareable result card");
  add("deck", C.share.challenge, "button on the share screen");
  add("deck", C.app.kicker, at("app download"));
  add("deck", C.app.title, "headline on the app download screen");
  add("deck", C.app.button, "app store button");
  add("deck", C.app.snap, "caption on a small picture of the app");
  add("deck", C.app.lives, `caption on a small picture of the app, after "${C.app.snap}"`);
};
deck("fun");
deck("heart");
for (const [k, w] of Object.entries(UI_COPY)) if (typeof w === "string") add("button", w, `button or small label on the result (${k})`);
for (const w of Object.values(UI_COPY.shareFormats)) add("button", w, "toggle for the share image shape (tall for stories, or for feed posts)");
for (const w of Object.values(UI_COPY.shareThemes)) add("button", w, "toggle for the share image lighting");
for (const w of Object.values(GUESS_COPY.status)) add("calls", w, "status chip on a guess card in the 'How Genii read you' sheet");
add("button", GUESS_COPY.title, "link at the end of the result that opens Genii's guesses");
add("button", UI_COPY.invite, "invite line printed at the bottom of the shareable result card, and the name of the friend game", "result");
add("button", "Send it to a friend", "sheet title for sharing the friend game");

// Lock screen.
add("lock", LOBBY_COPY.lockEyebrow, "small heading on the screen before the last eight cards");
add("lock", "Guesses locked", "small heading after the quiz host locks in its guesses");
add("lock", "Genii will guess your last eight answers.", "headline before the last eight cards");
add("lock", "Genii has made its guesses.", "headline after the quiz host locks its guesses");
add("lock", "How do I know Genii can't cheat?", "link on the lock screen");
add("lock", "Lock in Genii's guesses", "main button on the lock screen");
add("lock", "Play the final 8", "main button after the guesses are locked");

// Evidence Article frames (short labels, titles and tabs), both voices. Templated frames get an example fill.
const F = LIB.article;
const frames = [
  ["readMore", "button at the end of the result"], ["back", "button at the top of the long read"], ["masthead", "title of the long read page"],
  ["readTime", "small line under the long read title"], ["cover.keywords", "label above the trait words on the long read cover"],
  ...["stats", "traits", "surprise", "rooms", "book", "record", "party"].map((t) => [`tabs.${t}`, "section tab on the long read, next to tabs like \"Stats\" and \"Traits\""]),
  ["tabs.label", "label of the section menu on the long read"], ["tabs.all", "button that shows every section of the long read"],
  ["sheet.title", "section title on the long read"], ["sheet.yours", "label on a stat card: where you land"], ["sheet.other", "label on a stat card: the opposite end"],
  ["sheet.hint", "hint under the stats section"],
  ["core.title", "section title on the long read"], ["core.from", "label on a trait card, before where it comes from"], ["core.backTag", "label on the back of a flipped trait card, above a line in your own voice"],
  ["core.backStat", "label on the back of a flipped stat card, above a line about the other end of that stat"], ["core.turn", "button on a trait card"], ["core.turnBack", "button on a trait card"], ["core.kept", "note on a private trait card"],
  ["surprise.save", "button on the surprise section"], ["rooms.title", "section title on the long read"], ["rooms.flipTitle", "title of the area of life where you act differently"],
  ["sides.title", "section title on the long read"], ["sides.team", "label on one of two cards about how your two results get along"], ["sides.clash", "label on the other of two cards about how your two results get along"],
  ["book.saidTitle", "section subtitle on the long read"], ["record.title", "section title on the long read"], ["record.order", "small line on the long read"],
  ["party.title", "section title on the long read"], ["party.clickLabel", "label above a personality name you get along with"], ["party.oppositeLabel", "label above your opposite personality"],
  ["bio.title", "label above a one-line bio you can copy"],
];
const get = (path) => path.split(".").reduce((n, k) => (n && typeof n === "object" ? n[k] : null), F);
for (const [path, where] of frames) {
  const node = get(path);
  if (!node) continue;
  for (const v of ["fun", "heart"]) add("article", typeof node === "string" ? node : node[v], where);
}
const statFrom = get("core.statFrom");
if (statFrom) {
  const s = Object.values(STATS)[0];
  for (const v of ["fun", "heart"]) add("article", statFrom[v].replace("{stat}", s.stat).replace("{end}", s.ends[s.first]), "text after the label \"Comes from\" on a trait card");
}

process.stdout.write(`${JSON.stringify({ built: new Date().toISOString().slice(0, 10), count: items.length, items }, null, 1)}\n`);
