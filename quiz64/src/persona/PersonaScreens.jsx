import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight, BookOpen, Briefcase, Check, Gamepad2, Heart, House, Lock, Menu, Moon, Smartphone, Sparkles, Sun, Users, Wallet,
} from "lucide-react";
import { asset } from "../assets.js";
import { GeniiStage } from "../components/GeniiStage.jsx";
import { ConversationProgress } from "../components/ConversationProgress.jsx";
import { ChapterObject } from "../components/ChapterObject.jsx";
import { PersonaCard } from "./PersonaCard.jsx";
import { CHAPTERS, FINALE_TITLE } from "./kit.js";
import { CLOSEST_OPTIONS, PRONOUN_OPTIONS, RUN_SIZE } from "./session.js";
import { LOBBY_COPY, LOBBY_DEFAULTS, hostLine, chapterIntro, cardVoice } from "./lobby.js";

export const CHAPTER_ICONS = [Smartphone, Users, Heart, Wallet, Briefcase, House, Gamepad2, Sparkles];
const RIBBON = [...CHAPTERS.map((c) => ({ id: c.id, title: c.title })), { id: 8, title: "Finale" }];

export function PersonaHeader({ saved, onHome, onMap, onMore, motionOn, setMotionOn }) {
  return (
    <header className="site-header">
      <button type="button" className="brand-button" onClick={onHome} aria-label="Return to Genii home">
        <img src={asset("mirrormii-wordmark.svg")} width="265" height="43" alt="MirrorMii" />
      </button>
      <div className="header-trail">
        <span className="genii-chip"><Sparkles size={13} /> Genii</span>
        {saved > 0 && <span className="header-saved">{saved} answers saved on this device</span>}
      </div>
      <nav className="site-nav" aria-label="Game navigation">
        {onMap && <button type="button" className="nav-button" onClick={onMap}>Chapter map</button>}
        <button type="button" className="nav-button" onClick={onHome}>Save and leave</button>
        <button type="button" className="motion-button" onClick={() => setMotionOn(!motionOn)} aria-pressed={motionOn}>
          {motionOn ? <Sun size={16} /> : <Moon size={16} />} <span>{motionOn ? "Motion on" : "Motion off"}</span>
        </button>
        <button type="button" className="nav-button nav-button--more" onClick={onMore}><Menu size={16} /> More</button>
      </nav>
      <button type="button" className="menu-button" aria-label="Open more menu" onClick={onMore}><Menu size={21} /></button>
    </header>
  );
}

export function PersonaLanding({ progress, onBegin, onHow }) {
  const label = progress === "result" ? "See my result" : progress === "run" ? "Pick up where I left off" : "Meet Genii";
  return (
    <motion.main className="landing-page page-enter" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <section className="landing-hero">
        <div className="hero-copy">
          <span className="eyebrow">A personality game. Genii is taking notes.</span>
          <h1>Let’s get<br /><em>oddly specific.</em></h1>
          <p className="hero-promise">
            {LOBBY_COPY.landing.promise}
          </p>
          <div className="hero-actions">
            <button type="button" className="button button--primary button--large" onClick={onBegin}>
              {label} <ArrowRight size={19} />
            </button>
            {progress && <span className="resume-count">Your answers are waiting in this browser</span>}
          </div>
        </div>
        <div className="landing-stage">
          <GeniiStage mood="curious" scene="welcome" bubble="Small talk? In this economy?" />
          <span className="stage-charm charm-heart"><img src={asset("badge-mood.png")} width="240" height="240" alt="" /></span>
          <span className="stage-charm charm-spark"><img src={asset("badge-radiant.png")} width="240" height="240" alt="" /></span>
        </div>
      </section>
      <section className="chapter-journey" aria-label="How the game works">
        <div className="journey-intro">
          <strong>Tap what you'd actually do.</strong>
          <small>No typing. No right answers. The cool answer doesn't exist.</small>
        </div>
        <div className="journey-fact"><b>{LOBBY_COPY.landing.factTitle}</b><span>{LOBBY_COPY.landing.factBody}</span></div>
        <div className="journey-fact"><b>8 guesses</b><span>Genii locks them in before the finale.</span></div>
        <div className="journey-fact"><b>Skip anytime</b><span>“Not my life” is always an answer.</span></div>
        <div className="journey-fact"><b>Friends</b><span>Then see who really knows you.</span></div>
      </section>
      <section className="landing-foot">
        <button type="button" className="how-button" onClick={onHow}>
          <span className="how-mark"><BookOpen size={17} /></span>
          <span><strong>How this works</strong><small>Answers stay on this device. It's a game, not a test.</small></span>
          <ArrowRight size={16} />
        </button>
      </section>
    </motion.main>
  );
}

// Setup: two taps, closest person and pronoun. There is no age question (LAUNCH-SPEC section 22).
export const SETUP_STEPS = [
  { key: "closest", eyebrow: "Before we start", title: "Who's your closest person right now?", note: "“Your person” in the cards means them. It can be a crush, a partner or your closest friend.", options: CLOSEST_OPTIONS },
  { key: "pronoun", eyebrow: "Before we start", title: "When friends play about you, Genii should say…", note: "Only used in the friend game.", options: PRONOUN_OPTIONS },
];

export function SetupView({ onDone, onBack, busy }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);
  const s = SETUP_STEPS[step];
  const choose = (id) => {
    const next = { ...values, [s.key]: id };
    setValues(next);
    if (step < SETUP_STEPS.length - 1) setStep(step + 1);
    else onDone(next);
  };
  return (
    <motion.main className="quiz-page page-enter persona-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
      <div className="quiz-topline">
        <div><span className="eyebrow">{s.eyebrow}</span><strong>Question {step + 1} of {SETUP_STEPS.length}</strong></div>
      </div>
      <ConversationProgress value={step} total={SETUP_STEPS.length} />
      <div className="quiz-layout">
        <article className="question-card persona-card" data-chapter="1" data-role="context">
          <div className="question-head"><div>
            <span className="eyebrow question-frame"><Sparkles size={15} aria-hidden="true" /> Setup</span>
            <h1 ref={heading} tabIndex="-1">{s.title}</h1>
            <p className="question-setup">{s.note}</p>
          </div></div>
          <div className="answer-list persona-answers" role="group" aria-label={s.title}>
            {s.options.map((o, i) => (
              <button type="button" key={o.id} className={`answer-option persona-option ${values[s.key] === o.id ? "answer-option--selected" : ""}`} disabled={busy} onClick={() => choose(o.id)}>
                <span className="answer-token">{String.fromCharCode(65 + i)}</span>
                <span className="answer-copy">{o.text}</span>
              </button>
            ))}
          </div>
          <div className="question-actions">
            <button type="button" className="button button--quiet" onClick={() => (step ? setStep(step - 1) : onBack())}>Back</button>
          </div>
        </article>
        <aside className="quiz-guide">
          <GeniiStage mood="curious" compact bubble={LOBBY_COPY.setupGuide} />
          <div className="guide-copy"><span className="eyebrow">Stays on this device</span><p>No account. No names needed.</p><small>You can delete everything from the More menu.</small></div>
        </aside>
      </div>
    </motion.main>
  );
}

// The lobby: three unscored taps after setup (voice, how personal, rooms). Rooms is a multi-select that starts with
// every room open.
export function LobbyView({ onDone, onBack, busy, error = "" }) {
  const steps = LOBBY_COPY.steps;
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ rooms: [...LOBBY_DEFAULTS.rooms] });
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, [step]);
  const s = steps[step];
  const next = (vals) => {
    setValues(vals);
    if (step < steps.length - 1) setStep(step + 1);
    else onDone({ voice: vals.voice, depth: vals.depth, rooms: vals.rooms });
  };
  const toggleRoom = (id) => setValues((v) => ({ ...v, rooms: v.rooms.includes(id) ? v.rooms.filter((r) => r !== id) : [...v.rooms, id] }));
  return (
    <motion.main className="quiz-page page-enter persona-setup persona-lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22 }}>
      <div className="quiz-topline">
        <div><span className="eyebrow">{LOBBY_COPY.eyebrow}</span><strong>{LOBBY_COPY.counter(step + 1, steps.length)}</strong></div>
      </div>
      <ConversationProgress value={step} total={steps.length} />
      <div className="quiz-layout">
        <article className="question-card persona-card" data-chapter="1" data-role="context">
          <div className="question-head"><div>
            <span className="eyebrow question-frame"><Sparkles size={15} aria-hidden="true" /> {LOBBY_COPY.eyebrow}</span>
            <h1 ref={heading} tabIndex="-1">{s.title}</h1>
            <p className="question-setup">{s.note}</p>
          </div></div>
          <div className="answer-list persona-answers" role="group" aria-label={s.title}>
            {s.options.map((o, i) => {
              const on = s.multi ? values.rooms.includes(o.id) : values[s.key] === o.id;
              return (
                <button type="button" key={o.id} className={`answer-option persona-option ${on ? "answer-option--selected" : ""}`} disabled={busy}
                  aria-pressed={s.multi ? on : undefined}
                  onClick={() => (s.multi ? toggleRoom(o.id) : next({ ...values, [s.key]: o.id }))}>
                  <span className="answer-token">{s.multi ? (on ? <Check size={15} aria-hidden="true" /> : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}</span>
                  <span className="answer-copy">{o.text}{s.multi && <small className="lobby-room-state"> {on ? s.open : s.closed}</small>}</span>
                </button>
              );
            })}
          </div>
          {error && <p className="save-error" role="alert">{error}</p>}
          <div className="question-actions">
            <button type="button" className="button button--quiet" onClick={() => (step ? setStep(step - 1) : onBack())}>{LOBBY_COPY.back}</button>
            {s.multi && <button type="button" className="button button--primary" disabled={busy} onClick={() => next(values)}>{LOBBY_COPY.continue} <ArrowRight size={17} /></button>}
          </div>
        </article>
        <aside className="quiz-guide">
          <GeniiStage mood="curious" compact bubble={LOBBY_COPY.guide} />
          <div className="guide-copy"><span className="eyebrow">{LOBBY_COPY.eyebrow}</span><p>{LOBBY_COPY.guideNote}</p></div>
        </aside>
      </div>
    </motion.main>
  );
}

export function PersonaInterlude({ chapter, count, onContinue, onSave }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [chapter.id]);
  return (
    <motion.main className="interlude-page page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
      <div className="interlude-art">
        <div className="interlude-ring" />
        <GeniiStage scene="chapter" mood={chapter.id % 2 ? "attentive" : "curious"} bubble={chapter.intro} />
      </div>
      <div className="interlude-copy">
        <ChapterObject chapter={chapter.id} icon={CHAPTER_ICONS[chapter.id - 1]} />
        <span className="chapter-kicker">{chapter.kicker}</span>
        <h1 ref={heading} tabIndex="-1">{chapter.title}</h1>
        <p>{chapter.sub}</p>
        {count > 0 && (
          <div className="interlude-progress">
            <span><b>{count}</b> cards in this chapter</span>
            <div>{Array.from({ length: count }, (_, i) => <i key={i} />)}</div>
          </div>
        )}
        <div className="hero-actions">
          <button type="button" className="button button--primary button--large" onClick={onContinue}>Start <ArrowRight size={19} /></button>
          <button type="button" className="button button--secondary" onClick={onSave}>Save and leave</button>
        </div>
      </div>
    </motion.main>
  );
}

export function interludeFor(step, voice = LOBBY_DEFAULTS.voice) {
  const X = LOBBY_COPY.extras;
  if (step.phase === "extra") return { id: 7, key: "extra", kicker: X.kicker, title: X.title, intro: chapterIntro(voice, X.intro), sub: X.sub };
  const ch = CHAPTERS.find((c) => c.id === step.chapter);
  return { id: ch.id, key: `chapter-${ch.id}`, kicker: LOBBY_COPY.chapterKicker(step.ordinal || ch.id, step.chapters || CHAPTERS.length), title: ch.title, intro: chapterIntro(voice, ch.intro), sub: "Tap what you'd actually do. Skip anything that isn't yours." };
}

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
          <GeniiStage
            mood={step.phase === "finale" ? "skeptical" : card.type === "real" ? "attentive" : "curious"}
            compact
            bubble={bubble}
            chapter={typeof step.chapter === "number" ? step.chapter : undefined}
            progress={step.size ? ((step.index - 1) / step.size) * 100 : 0}
          />
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
        <GeniiStage scene="thinking" mood="skeptical" bubble={null} />
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
