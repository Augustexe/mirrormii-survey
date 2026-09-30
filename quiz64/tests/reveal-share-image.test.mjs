// The mirror card (DESIGN-DIRECTION 5.13): both formats and both lights draw from the share projection only. A
// recording canvas captures every string the card draws: no sting, answer, number, guess score or banned word, and
// marriage and kids traits never appear. Story-screen images drop private lines too.
import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
});
test.after(async () => { await server.close(); });

// A 2D context that records text and accepts every other call.
function recorder() {
  const texts = [];
  const state = { font: "10px x" };
  const grad = { addColorStop() {} };
  const ctx = new Proxy(state, {
    get(target, key) {
      if (key === "texts") return texts;
      if (key === "fillText") return (t) => { texts.push(String(t)); };
      if (key === "measureText") return (t) => ({ width: String(t).length * (parseFloat(/(\d+(?:\.\d+)?)px/.exec(target.font)?.[1] || 10) * 0.52) });
      if (key in target) return target[key];
      return () => grad;
    },
    set(target, key, value) { target[key] = value; return true; },
  });
  return ctx;
}

async function finishedView(voice = "fun") {
  const { ADULT, completeRun, leaning } = await import("./persona-helpers.mjs");
  const { resultView } = await load("/src/persona/views.js");
  const Session = await load("/src/persona/session.js");
  const run = completeRun(ADULT, leaning({ R1: 1, R2: -1, R3: -1, L1: 1, L2: -1, L3: 1 }), "sharecard1", { voice, depth: "anything", rooms: ["love", "work", "family"] });
  return { view: resultView(run), run, Session };
}

const BANNED = /\b(?:evidence|axis|axes|sealed|score|called exactly)\b/i;

test("the mirror card draws names, traits, the invite and the address, and nothing private", async () => {
  const { drawShareCard, FORMATS } = await load("/src/persona/share-image.js");
  assert.deepEqual(FORMATS.story, { w: 1080, h: 1920 });
  assert.deepEqual(FORMATS.post, { w: 1080, h: 1350 });
  for (const voice of ["fun", "heart"]) {
    const { view, run, Session } = await finishedView(voice);
    const { result, profile } = Session.resultFor(run);
    const answers = [...result.tags.flatMap((t) => (t.youToldGenii || []).map((q) => q.said)), ...(profile.splits || []).flatMap((s) => [s.said && s.said.text, s.did && s.did.text])].filter(Boolean);
    const stings = view.slides.find((s) => s.id === "stings").stings;
    for (const format of ["story", "post"]) {
      for (const theme of ["night", "day"]) {
        const ctx = recorder();
        drawShareCard(ctx, view.share, { format, theme });
        const all = ctx.texts.join(" | ");
        for (const n of view.share.names) assert.ok(all.includes(n.name.split(" ")[0]), `${voice} ${format} ${theme}: ${n.name}`);
        assert.ok(all.includes("Do you really know me?"));
        assert.ok(all.includes("mirrormii.ai"));
        assert.doesNotMatch(all, /\d/, `${format} ${theme}: no numbers`);
        assert.doesNotMatch(all, BANNED);
        for (const s of stings) assert.ok(!all.includes(s), "no sting");
        for (const a of answers) assert.ok(!all.includes(a), `no quoted answer: ${a}`);
        // Round 3: the core traits as keywords, in rank order, as many as two rows hold at feed size (at least three
        // when the player has them); the rest stay on the traits screen.
        const drawn = ctx.texts.filter((t) => view.share.tags.some((k) => k.name === t));
        assert.deepEqual(drawn, view.share.tags.slice(0, drawn.length).map((k) => k.name), `${voice} ${format} ${theme}: keywords in rank order`);
        assert.ok(drawn.length >= Math.min(3, view.share.tags.length), `${voice} ${format} ${theme}: ${drawn.length} keywords on the card`);
      }
    }
  }
});

test("story 2 carries one sharp line inside the frame: Genii's clearest finding, never an answer", async () => {
  for (const voice of ["fun", "heart"]) {
    const { view, run, Session } = await finishedView(voice);
    const names = view.slides.find((s) => s.id === "names");
    const findings = view.slides.find((s) => s.id === "knows").findings;
    assert.ok(names.hook, `${voice}: a plaque line`);
    const top = findings.find((f) => f.kind === "axis");
    assert.equal(names.hook, top ? top.line : names.people.read, `${voice}: the plaque is the clearest finding`);
    const { result } = Session.resultFor(run);
    const said = result.tags.flatMap((t) => (t.youToldGenii || []).map((q) => q.said)).filter(Boolean);
    for (const a of said) assert.ok(!names.hook.includes(a), "no quoted answer");
  }
});

test("marriage and kids traits never reach the card or a story image", async () => {
  const { buildStories, printFor } = await load("/src/persona/stories/story-data.js");
  const { drawShareCard, drawStory } = await load("/src/persona/share-image.js");
  const lib = {
    axes: [["R1", "We", "Me"], ["R2", "Direct", "Soft"], ["R3", "Classic", "Own"], ["L1", "Steady", "Venture"], ["L2", "Push", "Easy"], ["L3", "Rules", "Context"]].map(([id, plus, minus]) => ({ id, plus, minus, plusLine: `${plus} line.`, minusLine: `${minus} line.` })),
    relationship: [{ code: "We·Soft·Own", name: "Golden Retriever", read: "PEOPLE-READ", sting: "PEOPLE-STING", heart: "p" }, { code: "Me·Direct·Classic", name: "Straight Shooter", read: "x" }],
    life: [{ code: "Steady·Push·Rules", name: "The Planner", read: "LIFE-READ", sting: "LIFE-STING", heart: "l" }, { code: "Venture·Easy·Context", name: "The Wanderer", read: "y" }],
    tags: [
      { id: "T11A", name: "Wants kids someday", line: "KIDS-LINE", heart: "KIDS-HEART", sting: "KIDS-STING", chapter: 6, locked18: true },
      { id: "T02A", name: "Yes first", line: "YES-LINE", heart: "YES-HEART", chapter: 2 },
    ],
  };
  const row = (axis, pole) => ({ axis, pole, flex: false, unfinished: false });
  const result = {
    halves: [
      { side: "relationship", name: "Golden Retriever", code: "We·Soft·Own", axes: [row("R1", "We"), row("R2", "Soft"), row("R3", "Own")] },
      { side: "life", name: "The Planner", code: "Steady·Push·Rules", axes: [row("L1", "Steady"), row("L2", "Push"), row("L3", "Rules")] },
    ],
    tags: [{ id: "T11A", name: "Wants kids someday", heart: "KIDS-HEART" }, { id: "T02A", name: "Yes first", heart: "YES-HEART" }],
    stings: [], calls: [],
  };
  const view = buildStories({ result, profile: {}, lib, voice: "fun" });
  const hook = view.slides.find((s) => s.id === "names").hook;
  assert.ok(hook && !/KIDS|kids/.test(hook), "a kids trait never becomes the story 2 line");
  assert.ok(view.slides.find((s) => s.id === "traits").tags[0].private, "the owner still sees it, marked private");
  assert.deepEqual(view.share.tags.map((t) => t.name), ["Yes first"]);
  assert.equal(view.slides.find((s) => s.id === "share").opposite, "Your opposite: Straight Shooter and The Wanderer. Know one?");
  const card = recorder();
  drawShareCard(card, view.share, { format: "story" });
  assert.ok(!card.texts.join(" ").includes("kids"));
  for (const id of ["read", "traits", "names", "knows", "map"]) {
    const ctx = recorder();
    drawStory(ctx, printFor(view.slides.find((s) => s.id === id)));
    const all = ctx.texts.join(" ");
    assert.ok(!/KIDS|kids/.test(all), `${id} image has no kids trait`);
  }
  // Round 3, open book: the stings screen can be shared like any other, so a kids or marriage trait never gives it a
  // sting.
  const stingsSlide = view.slides.find((s) => s.id === "stings");
  assert.ok(!stingsSlide.stings.some((x) => /KIDS/.test(x)), "no kids sting on the stings screen");
  const stingsPrint = printFor(stingsSlide);
  assert.equal(stingsPrint.private, false, "the stings image shares like any other");
  assert.ok(!stingsPrint.quotes.some((x) => /KIDS/.test(x)));
});
