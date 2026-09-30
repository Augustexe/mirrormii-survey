// Package A screens (DESIGN-DIRECTION 5.0 to 5.4, 7.4 criteria 5 to 7): header, landing, setup, lobby, interludes
// and the More sheet render their contract, keep the stored values exactly as before and never show internal words.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { ADULT } from "./persona-helpers.mjs";

const visible = (html) => html.replace(/<[^>]*>/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, "\"").replace(/&amp;/g, "&").replace(/\s+/g, " ");
const INTERNAL = /\b(run id|hash|kit|evidence|axis|axes|sealed|research)\b/i;
const EM_DASH = /\u2014/;
const render = (C, props) => renderToStaticMarkup(React.createElement(C, props));

let server;
const load = (p) => server.ssrLoadModule(p);
test.before(async () => {
  server = await createServer({ root: fileURLToPath(new URL("../", import.meta.url)), server: { middlewareMode: true }, appType: "custom", logLevel: "silent" });
  globalThis.document = { hidden: false };
});
test.after(async () => { delete globalThis.document; await server.close(); });

test("header: wordmark, menu, optional rail slot; no Genii chip, no saved count", async () => {
  const { PersonaHeader } = await load("/src/persona/screens/index.js");
  const html = render(PersonaHeader, { onHome() {}, onMore() {}, onMap() {}, onSave() {}, rail: React.createElement("span", { id: "rail" }, "R") });
  assert.match(html, /mirrormii-wordmark\.svg/);
  assert.match(html, /aria-label="Open the menu"/);
  assert.match(html, /id="mm-header-center"[^>]*><span id="rail">/);
  assert.ok(visible(html).includes("Chapter map") && visible(html).includes("Save and leave"));
  assert.doesNotMatch(html, /genii-chip|answers saved|Motion on/);
  assert.equal(render(PersonaHeader, { onHome() {}, onMore() {}, hidden: true }), "", "hidden on the result stories");
});

test("More sheet holds Chapter map, How this works, Save and leave, Motion and Your data", async () => {
  const { PersonaMoreDialog } = await load("/src/persona/screens/index.js");
  const text = visible(render(PersonaMoreDialog, { open: true, onClose() {}, hasRun: true, motionOn: true, setMotionOn() {}, onMap() {}, onHow() {}, onHome() {}, onDownload() {}, onRestart() {}, onDelete() {} }));
  for (const item of ["Chapter map", "How this works", "Save and leave", "Motion", "Your data", "Download my data", "Play again from the start", "Delete my data"]) assert.ok(text.includes(item), item);
  const html = render(PersonaMoreDialog, { open: true, onClose() {}, hasRun: false, motionOn: false, setMotionOn() {}, onMap() {}, onHow() {}, onHome() {}, onDownload() {}, onRestart() {}, onDelete() {} });
  assert.match(html, /role="switch" aria-checked="false"/);
  assert.ok(!visible(html).includes("Chapter map"), "no map before a run exists");
});

test("landing: hook, reflection line, one primary action, the fogged mirror, chips below", async () => {
  const { PersonaLanding } = await load("/src/persona/screens/index.js");
  const { LOBBY_COPY } = await load("/src/persona/lobby.js");
  const html = render(PersonaLanding, { progress: null, onBegin() {}, onHow() {} });
  const text = visible(html);
  assert.ok(text.includes("Let’s get") && text.includes("oddly specific."));
  assert.match(html, /class="reflect__mirror" aria-hidden="true">oddly specific\./, "the second line carries its reflection");
  assert.ok(text.includes(LOBBY_COPY.landing.promise));
  assert.equal((html.match(/mm-btn--primary/g) || []).length, 1, "one primary action");
  assert.ok(text.includes("Meet Genii"));
  assert.match(html, /class="mm-fogmirror[^"]*" aria-hidden="true"/);
  assert.match(html, /<canvas[^>]*mm-fogmirror__fog/);
  for (const chip of LOBBY_COPY.landing.chips) assert.ok(text.includes(chip), chip);
  // Round 4 (LAUNCH-SPEC 25): the landing's only rasters are the canon island renders: the World Mirror's frame, the
  // room inside its glass and Genii's island behind it. Nothing from the landing page or the asset library.
  const imgs = [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(imgs.map((src) => src.replace(/^.*\/assets\/island\/([a-z-]+)-\d+\.webp$/, "$1")).sort(), ["hero-portrait", "mirror-frame", "mirror-inside"], "only the canon island renders");
  assert.match(html, /class="mm-fogmirror__photo"[^>]*fetchpriority="high"/, "the room in the glass loads first");
  assert.match(html, /class="mm-fogmirror__island"[^>]*fetchpriority="low"/, "the island loads last");
  assert.ok(visible(render(PersonaLanding, { progress: "run", onBegin() {}, onHow() {} })).includes("Pick up where I left off"));
  assert.ok(visible(render(PersonaLanding, { progress: "result", onBegin() {}, onHow() {} })).includes("See my result"));
  assert.doesNotMatch(text, INTERNAL);
  assert.doesNotMatch(text, EM_DASH);
});

test("setup: six object tiles, no letter tokens, dots instead of a bar; values unchanged", async () => {
  const { SetupView, SETUP_STEPS } = await load("/src/persona/screens/index.js");
  const Session = await load("/src/persona/session.js");
  const html = render(SetupView, { onDone() {}, onBack() {} });
  assert.equal((html.match(/class="mm-object /g) || []).length, 6);
  assert.equal((html.match(/data-art="setup-glyph"/g) || []).length, 6, "each tile carries its object glyph");
  assert.doesNotMatch(html, /answer-token|conversation-progress|progressbar/);
  assert.match(html, /class="mm-dots"/);
  assert.match(html, /aria-pressed="false"/);
  assert.deepEqual(SETUP_STEPS[0].options.map((o) => o.id), Session.CLOSEST_OPTIONS.map((o) => o.id));
  assert.deepEqual(SETUP_STEPS[1].options.map((o) => o.id), Session.PRONOUN_OPTIONS.map((o) => o.id));
  assert.doesNotMatch(visible(html), /How old|18 or older|13 to 17|Under 13/);
  const src = fs.readFileSync(new URL("../src/persona/screens/Setup.jsx", import.meta.url), "utf8");
  assert.match(src, /onDone\(next\)/, "setup hands back { closest, pronoun } as before");
  assert.ok(Session.validSetup(ADULT));
});

test("lobby: voice cards with a live sample and a light, dial tiles, doors as toggle buttons", async () => {
  const { LobbyView } = await load("/src/persona/screens/index.js");
  const { LOBBY_COPY } = await load("/src/persona/lobby.js");
  const html = render(LobbyView, { onDone() {}, onBack() {} });
  const text = visible(html);
  for (const o of LOBBY_COPY.steps[0].options) {
    assert.ok(text.includes(o.text), o.text);
    assert.ok(text.includes(LOBBY_COPY.voiceCards[o.id].sample), `${o.id} sample`);
    assert.match(html, new RegExp(`data-voice="${o.id}"`));
  }
  assert.equal(LOBBY_COPY.voiceCards.fun.sample, LOBBY_COPY.host.fun.chapter[3], "Make it fun sample is a real host line");
  assert.equal(LOBBY_COPY.voiceCards.heart.sample, LOBBY_COPY.host.heart.chapter[0], "Heart to heart sample is a real host line");
  assert.doesNotMatch(text, INTERNAL);
  assert.doesNotMatch(text, EM_DASH);
  const src = fs.readFileSync(new URL("../src/persona/screens/Lobby.jsx", import.meta.url), "utf8");
  assert.match(src, /onDone\(\{ voice: vals\.voice, depth: vals\.depth, rooms: vals\.rooms \}\)/, "stored values unchanged");
  assert.match(src, /previewTheme\(/);
  assert.match(src, /setThemeForVoice\(/);
  assert.match(src, /aria-pressed=\{on\}/);
  assert.match(src, /RoomDoor room=\{o\.id\} open=\{on\}/);
  assert.match(src, /setTimeout\(\(\) => preview\(id\), 400\)/, "keyboard preview waits 400 ms");
});

test("interlude: island scene, chapter kicker in text type, reflected title, shard preview and the mirror so far", async () => {
  const { PersonaInterlude, interludeFor } = await load("/src/persona/screens/index.js");
  const Session = await load("/src/persona/session.js");
  let s = Session.chooseLobby(Session.startRun(Session.newRun({ runId: "scrinter01" }), ADULT), { voice: "fun", depth: "anything", rooms: ["love", "work", "family"] });
  const first = interludeFor(Session.currentStep(s), "fun");
  assert.equal(first.scene, 1);
  assert.ok(first.sub, "chapter 1 keeps the tap-what-you'd-do line");
  const html = render(PersonaInterlude, { chapter: first, count: 6, onContinue() {}, filled: [{ chapter: 1 }, { chapter: 1 }], seed: "scrinter01", voice: "fun" });
  const text = visible(html);
  assert.match(html, /data-art="islet"[^>]*src="[^"]*assets\/island\/ch1-/, "chapter 1's canon islet");
  assert.match(html, /data-art="mirror-arch"/);
  assert.match(html, /class="reflect__mirror"/);
  assert.ok(text.includes(first.kicker) && text.includes(first.title) && text.includes(first.intro));
  assert.equal((html.match(/<path d="M/g) || []).length >= 6, true);
  assert.ok(text.includes("Start"));
  assert.doesNotMatch(text, /Save and leave/, "save lives in the menu");
  assert.doesNotMatch(html, /monospace|genii-opal|assets\/world\//);
  // Later chapters drop the repeated sub line.
  for (let g = 0; g < 80; g++) {
    const st = Session.currentStep(s);
    if (st.kind !== "card" || (st.ordinal > 1 && st.index === 1)) break;
    s = Session.answerCard(s, st.card.id, "skip", { ms: 4000 });
  }
  const later = interludeFor(Session.currentStep(s), "heart");
  assert.equal(later.sub, "");
  assert.match(later.kicker, /^Chapter 2 of \d$/);
});

test("reduced motion: every screen entrance and loop sits behind prefers-reduced-motion and Motion off", () => {
  const css = fs.readFileSync(new URL("../src/persona/screens/screens.css", import.meta.url), "utf8");
  const animations = [...css.matchAll(/animation:\s*mm-(rise|decor|drift|sheen|island-rise)/g)];
  assert.ok(animations.length >= 4);
  const unguarded = css.split("@media (prefers-reduced-motion: no-preference)").slice(0, 1).join("").match(/animation:\s*mm-(rise|decor|drift|sheen|island-rise|bob)/g);
  assert.equal(unguarded, null, "no motion before the first reduced-motion guard");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  const fog = fs.readFileSync(new URL("../src/persona/screens/FogMirror.jsx", import.meta.url), "utf8");
  assert.match(fog, /useReducedMotion/);
  assert.match(fog, /setPeek\(true\)/, "reduced motion: a tap shows the inside instead of wiping");
});
