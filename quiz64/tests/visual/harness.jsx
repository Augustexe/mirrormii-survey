// Test harness for package B (not shipped): renders one card from cards.json inside the real app chrome, so the fold
// test (fold.mjs) and the evidence test (play-evidence.mjs) can drive every card in a real browser.
// Query: ?card=ID&voice=fun|heart|cards&theme=day|dusk|clear&mode=quiz|new|legacy&motion=on|off
import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import "../../src/system/layers.css";
import { KIT } from "../../src/persona/kit.js";
import { PersonaHeader } from "../../src/persona/screens/index.js";
import { PersonaQuizView, PersonaCard, LockView, PersonaChapterMap } from "../../src/persona/play/index.js";
import { setTheme } from "../../src/system/index.js";
import { Backdrop } from "../../src/art/index.js";
import { LegacyPersonaCard } from "./legacy-card.jsx";
import { FriendGame, FriendResultsView } from "../../src/persona/play/index.js";
import * as Friend from "../../src/persona/friend.js";
import { ADULT, clock, completeRun, leaning } from "../persona-helpers.mjs";

function friendFixture() {
  const owner = completeRun(ADULT, leaning({ R1: 1, R2: 1, R3: -1, L1: -1, L2: 1, L3: 1 }), "harnessfriend1");
  const { state, challenge } = Friend.createChallenge(owner, { rel: "bestie", stings: true, name: "Robin" }, { now: clock(), id: "harnchal01", seed: 3 });
  const ch = Friend.parseChallenge(Friend.challengePayload(state, challenge));
  return { state, challenge, ch, view: Friend.friendDeckView(ch) };
}

const q = new URLSearchParams(window.location.search);
const ALL = [...KIT.chapters.flatMap((c) => c.cards), ...KIT.finale, ...KIT.extras];
window.__cards = ALL.map((c) => ({ id: c.id, type: c.type, options: c.options.length, prompt: c.prompt.length, heartPrompt: c.heart && c.heart.prompt ? c.heart.prompt.length : null }));
window.__answers = [];

let voice = q.get("voice") || "fun";
const theme = q.get("theme") || (voice === "heart" ? "dusk" : voice === "cards" ? "clear" : "day");
setTheme(theme);
const motionOn = q.get("motion") !== "off";
document.body.dataset.motion = motionOn ? "on" : "off";

function stepFor(card) {
  const finale = card.type === "sealed";
  const extra = !!card.axisFor && !finale;
  const chapter = finale ? "finale" : extra ? "extra" : card.chapter;
  const index = Number(q.get("index") || (finale ? 3 : 2));
  return {
    kind: "card", phase: finale ? "finale" : extra ? "extra" : "chapter", card, chapter: finale ? "finale" : extra ? "extra" : chapter,
    index, size: finale ? 8 : 6, resolved: finale ? index - 1 : Number(q.get("resolved") || 7), total: finale ? 8 : 40,
    round: card.round ? { index: Number(q.get("round") || 1), size: 2 } : null, ordinal: extra ? null : Math.min(card.chapter || 1, 7), chapters: 7,
  };
}
const PROGRESS = { 1: { open: true, done: 6, total: 6 }, 2: { open: true, done: 1, total: 6 }, 3: { open: true, done: 0, total: 0 }, 4: { open: true, done: 0, total: 0 }, 5: { open: false, done: 0, total: 0 }, 6: { open: true, done: 0, total: 0 }, 7: { open: true, done: 0, total: 0 } };

function App() {
  const mode = q.get("mode") || "quiz";
  const [shown, setShown] = useState({ id: q.get("card") || ALL[0].id, voice, k: 0 });
  // The fold test switches cards without a reload: window.__show(id, voice) resolves after the next paint.
  window.__show = (nextId, nextVoice = shown.voice) => new Promise((resolve) => {
    voice = nextVoice;
    setTheme(nextVoice === "heart" ? "dusk" : nextVoice === "cards" ? "clear" : "day");
    window.__answers = [];
    setShown((prev) => ({ id: nextId, voice: nextVoice, k: prev.k + 1 }));
    requestAnimationFrame(() => requestAnimationFrame(() => resolve(true)));
  });
  const id = shown.id;
  const card = ALL.find((c) => c.id === id) || ALL[0];
  const [n, setN] = useState(0);
  const [map, setMap] = useState(q.get("map") === "1");
  const onAnswer = (value, meta) => { window.__answers.push({ value, meta }); if (q.get("repeat") === "1") setN((x) => x + 1); };
  const k = `${shown.k}-${n}`;
  const step = stepFor(card);
  const cardVoice = shown.voice === "heart" ? "heart" : "fun";
  if (mode === "legacy") return <main className="quiz-page"><LegacyPersonaCard key={k} card={card} step={step} voice={cardVoice} onAnswer={onAnswer} /></main>;
  if (mode === "new") return <main className="play"><PersonaCard key={k} card={card} step={step} voice={cardVoice} onAnswer={onAnswer} /></main>;
  if (mode === "friend" || mode === "friendResult") {
    const f = friendFixture();
    const g = { level1: {}, level2: {}, why: {}, level3: [], level4: null };
    const play = { payload: "", stage: q.get("stage") || "intro", step: Number(q.get("step") || 0), guesses: g, updatedAt: "" };
    let body;
    if (mode === "friend") body = <FriendGame ch={f.ch} play={play} isOwnLink={false} onProgress={() => {}} onYourTurn={() => {}} onLeave={() => {}} />;
    else {
      const view = f.view;
      const guesses = { level1: Object.fromEntries(view.level1.map((x) => [x.axis, x.truth])), level2: {}, why: {}, level3: [], level4: null };
      const reply = Friend.replyPayload(f.ch, view, Friend.cleanGuesses(view, guesses));
      const imported = Friend.importReply(f.state, reply, { now: clock() });
      body = <FriendResultsView view={Friend.ownerFriendView(imported.state, f.challenge.id)} onBack={() => {}} onHideRoast={() => {}} />;
    }
    return <div className="app-shell persona-app"><Backdrop scene={theme} animated={false} /><PersonaHeader onHome={() => {}} onMore={() => {}} />{body}</div>;
  }
  const lock = mode === "lock" || mode === "locked";
  return (
    <div className="app-shell persona-app" data-screen={lock ? "lock" : "card"}>
      <Backdrop scene={lock ? "night" : theme} animated={false} />
      <PersonaHeader onHome={() => {}} onMore={() => {}} onMap={() => setMap(true)} onSave={() => {}} />
      {lock
        ? <LockView locked={mode === "locked"} lockHash="d36a79071138cfda8e2b4c1d9f0a7b3c5e6d7f8091a2b3c4d5e6f708192a3b4c" onLock={() => {}} onStart={() => {}} onSave={() => {}} progress={PROGRESS} seed="harness" />
        : <PersonaQuizView step={step} setup={{ closest: "best_friend", pronoun: "she" }} onAnswer={onAnswer} onMap={() => setMap(true)} cardKey={`${card.id}-${k}`} voice={voice} progress={step.phase === "chapter" ? { ...PROGRESS, [card.chapter]: { open: true, done: 1, total: 6 } } : PROGRESS} seed="harness" />}
      <PersonaChapterMap open={map} onClose={() => setMap(false)} progress={PROGRESS} />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<MotionConfig reducedMotion={motionOn ? "user" : "always"}><App /></MotionConfig>);
