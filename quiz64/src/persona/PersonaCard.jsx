import React, { useContext, useEffect, useRef, useState } from "react";
import { motion, MotionConfigContext, useReducedMotion } from "motion/react";
import { Check, Clock3, Heart, Lightbulb, Lock, Sparkles, SkipForward, Users, Zap, Layers } from "lucide-react";
import { S } from "./kit.js";

const EXIT_LABEL = { skip: "Skip", not_my_life: "Not my life", no_recent: "No recent example" };

function frameFor(card, step) {
  if (step.phase === "finale") return { icon: Lock, text: `Final ${step.index} of ${step.size}` };
  if (step.phase === "extra") return { icon: Sparkles, text: "One more card" };
  if (card.type === "real") return { icon: Clock3, text: "From your life" };
  if (card.type === "this_or_that") return { icon: Zap, text: step.round && step.round.size > 1 ? `Quick round ${step.round.index}/${step.round.size}` : "Quick pick" };
  if (card.type === "pick_two") return { icon: Layers, text: "Pick two" };
  if (card.type === "role") return { icon: Users, text: "Pick your role" };
  if (card.type === "feeling") return { icon: Heart, text: "First feeling" };
  return { icon: Lightbulb, text: "Picture this" };
}

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());

/**
 * One persona card. Taps answer immediately (the kit's one-card-at-a-time rule); the time from the card appearing
 * to the answering tap is reported so rushed taps can count less. No free text anywhere.
 */
export function PersonaCard({ card, step, setup, onAnswer, busy = false, error = "" }) {
  const heading = useRef(null);
  const shownAt = useRef(now());
  const timer = useRef(null);
  const reduced = useReducedMotion();
  const { reducedMotion } = useContext(MotionConfigContext);
  const still = reduced || reducedMotion === "always";
  const [picks, setPicks] = useState([]);
  const [depends, setDepends] = useState(null);
  const [chosen, setChosen] = useState(null);
  const pickTwo = card.type === "pick_two";
  const need = card.pick || 2;

  useEffect(() => {
    shownAt.current = now();
    setPicks([]);
    setDepends(null);
    setChosen(null);
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    // A tap answers after a short beat; leaving the card first (Save and leave, a dialog) cancels it.
    return () => { clearTimeout(timer.current); timer.current = null; };
  }, [card.id]);

  const elapsed = () => Math.max(0, Math.round(now() - shownAt.current));
  const send = (value, meta) => {
    if (busy) return;
    setChosen(value);
    const go = () => onAnswer(value, meta);
    if (still) go();
    else timer.current = setTimeout(go, 220);
  };
  const tap = (i) => {
    if (busy || chosen !== null) return;
    if (pickTwo) {
      const next = picks.includes(i) ? picks.filter((x) => x !== i) : [...picks, i];
      setPicks(next);
      if (next.length === need) send(next, { ms: elapsed() });
      return;
    }
    if (card.options[i].depends && card.flip) {
      setDepends({ index: i, ms: elapsed() });
      return;
    }
    send(i, { ms: elapsed() });
  };
  const frame = frameFor(card, step);
  const FrameIcon = frame.icon;
  const selected = (i) => (pickTwo ? picks.includes(i) : chosen === i || (depends && depends.index === i));

  return (
    <article
      className="question-card persona-card"
      data-role={card.type === "real" ? "actual" : "hypothetical"}
      data-chapter={typeof step.chapter === "number" ? step.chapter : step.phase === "finale" ? 8 : 7}
      data-test={step.phase === "finale" ? "true" : "false"}
      data-card-type={card.type}
    >
      <div className="question-head">
        <div>
          <span className="eyebrow question-frame">
            <FrameIcon size={15} aria-hidden="true" /> {frame.text}
            {card.privacy === "locked18" && <span className="persona-lock-badge"><Lock size={11} aria-hidden="true" /> 18+</span>}
          </span>
          <h1 ref={heading} tabIndex="-1">{S.promptFor(card, setup)}</h1>
          {pickTwo && (
            <p className="question-setup persona-pick-count" aria-live="polite">
              Tap the {need} that fit best. {picks.length}/{need} picked.
            </p>
          )}
        </div>
      </div>
      {!depends && (
        <div className="answer-list persona-answers" role="group" aria-label={pickTwo ? `Choose ${need} answers` : "Choose one answer"}>
          {card.options.map((option, i) => (
            <motion.button
              type="button"
              key={`${card.id}-${i}`}
              initial={still ? false : { opacity: 0, y: 7 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: still ? 0 : i * 0.035 }}
              className={`answer-option persona-option ${selected(i) ? "answer-option--selected" : ""}`}
              aria-pressed={pickTwo ? picks.includes(i) : undefined}
              disabled={busy || (chosen !== null && !selected(i))}
              onClick={() => tap(i)}
            >
              <span className="answer-token">{String.fromCharCode(65 + i)}</span>
              <span className="answer-copy">{option.t}</span>
              <Check className="answer-check" size={18} strokeWidth={2.5} aria-hidden="true" />
            </motion.button>
          ))}
        </div>
      )}
      {depends && (
        <section className="persona-flip" aria-labelledby={`flip-${card.id}`}>
          <p className="persona-flip__picked">{card.options[depends.index].t}</p>
          <h2 id={`flip-${card.id}`}>{card.flip.prompt}</h2>
          <div className="persona-flip__options">
            {card.flip.options.map((text, f) => (
              <button type="button" key={f} className="button button--secondary" disabled={busy || chosen !== null} onClick={() => send(depends.index, { ms: depends.ms, flip: f })}>{text}</button>
            ))}
            <button type="button" className="button button--quiet" disabled={busy || chosen !== null} onClick={() => send(depends.index, { ms: depends.ms, flip: null })}>
              <SkipForward size={15} aria-hidden="true" /> Skip
            </button>
          </div>
          <button type="button" className="persona-link" onClick={() => setDepends(null)}>Pick a different answer</button>
        </section>
      )}
      {!depends && (
        <div className="persona-exits" role="group" aria-label="Or">
          {card.exits.map((exit) => (
            <button type="button" key={exit} className="persona-exit" disabled={busy || chosen !== null} onClick={() => send(exit, { ms: elapsed() })}>
              {EXIT_LABEL[exit]}
            </button>
          ))}
        </div>
      )}
      <p className="save-hint persona-save-hint">
        <span className="save-dot save-dot--on" /> {step.phase === "finale" ? "Each final answer locks when you tap it." : "Saved on this device as you go."}
      </p>
      {error && <p className="save-error" role="alert">{error}</p>}
    </article>
  );
}
