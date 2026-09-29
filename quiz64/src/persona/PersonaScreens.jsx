// Shim (package A): the header, landing, setup, lobby and interludes live in ./screens now. PersonaQuizView and
// LockView below are the pre-rebuild card and lock screens that package B replaces in ./play; they stay here, with
// Genii drawn as light, until the play barrel stops pointing at them. Integration removes this file.
import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, Briefcase, Gamepad2, Heart, House, Lock, Smartphone, Sparkles, Users, Wallet,
} from "lucide-react";
import { GeniiLight } from "../system/index.js";
import { ConversationProgress } from "../components/ConversationProgress.jsx";
import { PersonaCard } from "./PersonaCard.jsx";
import { CHAPTERS, FINALE_TITLE } from "./kit.js";
import { RUN_SIZE } from "./session.js";
import { LOBBY_COPY, LOBBY_DEFAULTS, hostLine, cardVoice } from "./lobby.js";

export { PersonaHeader, PersonaLanding, SetupView, SETUP_STEPS, LobbyView, PersonaInterlude, interludeFor } from "./screens/index.js";

export const CHAPTER_ICONS = [Smartphone, Users, Heart, Wallet, Briefcase, House, Gamepad2, Sparkles];
const RIBBON = [...CHAPTERS.map((c) => ({ id: c.id, title: c.title })), { id: 8, title: "Finale" }];

function PersonaRibbon({ current, onOpen }) {
  return (
    <button type="button" className="chapter-ribbon" onClick={onOpen} aria-label={`Chapter map. ${RIBBON.find((c) => c.id === current)?.title || ""}`}>
      {RIBBON.map((chapter, index) => {
        const Icon = CHAPTER_ICONS[index] || Sparkles;
        return (
          <span key={chapter.id} className={`ribbon-stop ${chapter.id === current ? "ribbon-stop--current" : ""} ${chapter.id < current ? "ribbon-stop--past" : ""}`} aria-hidden="true">
            <span className="ribbon-icon"><Icon size={17} strokeWidth={1.7} /></span>
            <span className="ribbon-label">{chapter.title}</span>
          </span>
        );
      })}
    </button>
  );
}

// voice: the lobby voice (fun, heart or cards). Cards read Heart to heart for "heart", Make it fun otherwise; Genii's
// between-card lines follow the voice and are hidden for Just the cards.
export function PersonaQuizView({ step, setup, onAnswer, onMap, busy, error, cardKey, rushing = false, voice = LOBBY_DEFAULTS.voice }) {
  const current = step.phase === "finale" ? 8 : step.phase === "extra" ? 7 : step.chapter;
  const chapterTitle = step.phase === "finale" ? FINALE_TITLE : step.phase === "extra" ? LOBBY_COPY.extras.title : CHAPTERS.find((c) => c.id === step.chapter).title;
  const bubble = hostLine(voice, { phase: step.phase, index: step.index, rushing });
  const card = step.card;
  const label = step.phase === "finale" ? `Final card ${step.index} of ${step.size}` : LOBBY_COPY.runLabel(step.resolved + 1, step.total || RUN_SIZE);
  return (
    <motion.main className="quiz-page page-enter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
      <PersonaRibbon current={current} onOpen={onMap} />
      <div className="quiz-topline">
        <div><span className="eyebrow">{chapterTitle}</span><strong>{label}</strong></div>
        <span className="quiz-count">{step.resolved} / {step.total} {step.phase === "finale" ? "final cards" : "cards"}</span>
      </div>
      <ConversationProgress value={step.resolved} total={step.total} />
      <div className="quiz-layout">
        <PersonaCard key={cardKey} card={card} step={step} voice={cardVoice(voice)} onAnswer={onAnswer} busy={busy} error={error} />
        <aside className="quiz-guide">
          <GeniiLight size="m" placement="below" mood={step.phase === "finale" ? "hush" : "listening"} line={bubble} voice={voice} />
          <div className="guide-copy">
            <span className="eyebrow">{step.phase === "finale" ? "The finale" : "This chapter"}</span>
            <p><b>{step.index}</b> of {step.size}</p>
            <small>{step.phase === "finale" ? "Genii's guesses stay hidden until you finish." : "Tap an answer to move on. Skip anything that isn't yours."}</small>
          </div>
        </aside>
      </div>
    </motion.main>
  );
}

// The finale gate: Genii locks its eight guesses, shows the lock code, then the finale starts.
export function LockView({ locked, lockHash, onLock, onStart, onSave, busy, error }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [locked]);
  const short = lockHash ? lockHash.slice(0, 16).match(/.{4}/g).join(" ") : "";
  return (
    <motion.main className="gateway-page page-enter" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}>
      <div className="gateway-symbol">
        <GeniiLight size="l" mood={locked ? "sure" : "thinking"} />
        <span className="gateway-seal" aria-hidden="true">08</span>
      </div>
      <div className="gateway-copy">
        <span className="eyebrow">{locked ? "Guesses locked" : LOBBY_COPY.lockEyebrow}</span>
        <h1 ref={heading} tabIndex="-1">{locked ? <>Genii has made<br /><em>its guesses.</em></> : <>Eight cards.<br /><em>Eight guesses.</em></>}</h1>
        <p>
          {locked
            ? "Your move. Eight new situations. Genii's guesses stay hidden until the last card, and nothing you tap now can change them."
            : "Before you see the last eight cards, Genii locks in one guess for each, using only the answers you already gave. Then you play them and see how many it called."}
        </p>
        {locked ? (
          <div className="freeze-note persona-lock-code">
            <b>Lock code <Lock size={13} aria-hidden="true" /></b>
            <span><code aria-label={`Lock code ${lockHash}`}>{short}</code></span>
            <details>
              <summary>What's this?</summary>
              <p>This code is made from Genii's eight guesses. If a single guess changed later, the code would change too. Full code: <code className="persona-lock-full">{lockHash}</code></p>
            </details>
          </div>
        ) : (
          <div className="freeze-note">
            <b>Your answers so far stay put</b>
            <span>After this, the chapter cards can't be changed. Genii can pass on a guess when a side of you is too close to call.</span>
          </div>
        )}
        {error && <p className="save-error" role="alert">{error}</p>}
        <div className="hero-actions">
          {locked
            ? <button type="button" className="button button--primary button--large" onClick={onStart}>Play the final 8 <ArrowRight size={19} /></button>
            : <button type="button" className="button button--primary button--large" onClick={onLock} disabled={busy}>Lock in Genii's guesses <Lock size={17} /></button>}
          <button type="button" className="button button--quiet" onClick={onSave}>Save and leave</button>
        </div>
        <small className="boundary-note">It's a game about you, not a test of you. Genii's guesses are for fun.</small>
      </div>
    </motion.main>
  );
}
