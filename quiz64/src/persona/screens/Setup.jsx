import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { SetupGlyph } from "../../art/index.js";
import { GeniiLight, motion, tokens } from "../../system/index.js";
import { CLOSEST_OPTIONS, PRONOUN_OPTIONS } from "../session.js";
import { LOBBY_COPY } from "../lobby.js";
import { Dots } from "./Dots.jsx";

// Setup: two taps, closest person and pronoun. There is no age question (LAUNCH-SPEC section 22).
export const SETUP_STEPS = [
  { key: "closest", eyebrow: "Before we start", title: "Who’s your closest person right now?", note: "“Your person” in the cards means them. It can be a crush, a partner or your closest friend.", options: CLOSEST_OPTIONS },
  { key: "pronoun", eyebrow: "Before we start", title: "When friends play about you, Genii should say…", note: "Only used in the friend game.", options: PRONOUN_OPTIONS },
];

// Setup object glyph ids (A-09) for the session's closest-person ids.
const GLYPH = { best_friend: "best_friend", partner: "partner", crush: "crush", sibling: "sibling", parent: "parent", someone_else: "other" };

/**
 * Setup (DESIGN-DIRECTION 5.2): who stands next to you in the mirror. Tap 1 is a 2 x 3 grid of object tiles,
 * tap 2 three pronoun pills. A tap selects, holds 220 ms, then moves on. Values are stored exactly as before:
 * onDone({ closest, pronoun }).
 */
export function SetupView({ onDone, onBack, busy }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [picked, setPicked] = useState(null);
  const heading = useRef(null);
  const timer = useRef(0);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); setPicked(null); }, [step]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const s = SETUP_STEPS[step];
  const choose = (id) => {
    if (picked) return;
    const next = { ...values, [s.key]: id };
    setValues(next);
    setPicked(id);
    const go = () => { if (step < SETUP_STEPS.length - 1) setStep(step + 1); else onDone(next); };
    // The pick holds on screen like a card answer does (round 2), a little shorter: setup has no shard to fly.
    const hold = document.body?.dataset.motion === "off" ? 0 : Math.round(tokens.beats.hold * 0.8 * motion.scale);
    timer.current = setTimeout(go, hold);
  };
  const back = () => { clearTimeout(timer.current); setPicked(null); if (step) setStep(step - 1); else onBack(); };
  return (
    <main className="mm-screen mm-setup" data-step={s.key}>
      <article className="mm-panel mm-glass" key={s.key}>
        <GeniiLight size="s" mood={picked ? "noted" : "listening"} line={LOBBY_COPY.setupGuide} className="mm-panel__genii mm-enter" />
        <div className="mm-panel__head">
          <div className="mm-panel__meta mm-enter" style={{ "--step": 0 }}>
            <span className="mm-kicker">{s.eyebrow}</span>
            <Dots index={step} total={SETUP_STEPS.length} label={`Question ${step + 1} of ${SETUP_STEPS.length}`} />
          </div>
          <h1 ref={heading} tabIndex="-1" className="mm-panel__title mm-enter" style={{ "--step": 0 }}>{s.title}</h1>
          <p className="mm-panel__note mm-enter" style={{ "--step": 1 }}>{s.note}</p>
        </div>
        {s.key === "closest" ? (
          <div className={`mm-objects${picked ? " has-pick" : ""}`} role="group" aria-label={s.title}>
            {s.options.map((o, i) => {
              const on = values[s.key] === o.id;
              return (
                <button type="button" key={o.id} className={`mm-object mm-tile mm-enter${on ? " is-on" : ""}`} style={{ "--step": 1 + Math.floor(i / 2) }}
                  aria-pressed={on} disabled={busy} onClick={() => choose(o.id)}>
                  <span className="mm-object__well"><SetupGlyph id={GLYPH[o.id] || "other"} size={40} /></span>
                  <span className="mm-object__label">{o.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className={`mm-pills${picked ? " has-pick" : ""}`} role="group" aria-label={s.title}>
            {s.options.map((o, i) => {
              const on = values[s.key] === o.id;
              return (
                <button type="button" key={o.id} className={`mm-pill mm-tile mm-enter${on ? " is-on" : ""}`} style={{ "--step": 1 + i }}
                  aria-pressed={on} disabled={busy} onClick={() => choose(o.id)}>{o.text}</button>
              );
            })}
          </div>
        )}
        <div className="mm-panel__foot">
          <button type="button" className="mm-text-btn" onClick={back}><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> Back</button>
          <span className="mm-panel__private">Stays on this device. No account.</span>
        </div>
      </article>
    </main>
  );
}
