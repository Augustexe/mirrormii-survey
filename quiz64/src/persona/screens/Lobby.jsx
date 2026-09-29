import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ChapterGlyph, RoomDoor } from "../../art/index.js";
import { GeniiLight, motion, previewTheme, setThemeForVoice, tokens } from "../../system/index.js";
import { CHAPTERS } from "../kit.js";
import { ALWAYS_CHAPTERS, LOBBY_COPY, LOBBY_DEFAULTS } from "../lobby.js";
import { Dots } from "./Dots.jsx";

// A two-position dial (Keep it light points left, Ask me anything points right). Colors come from CSS.
function Dial({ at }) {
  const angle = at === "light" ? -48 : 48;
  return (
    <svg className="mm-dial" viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false">
      <path d="M7 27 A14 14 0 0 1 33 27" fill="none" className="mm-dial__track" strokeWidth="3" strokeLinecap="round" />
      <circle cx="9.5" cy="18" r="1.8" className={`mm-dial__stop${at === "light" ? " is-on" : ""}`} />
      <circle cx="30.5" cy="18" r="1.8" className={`mm-dial__stop${at === "anything" ? " is-on" : ""}`} />
      <g transform={`rotate(${angle} 20 27)`}>
        <path d="M20 27 L20 13" className="mm-dial__needle" strokeWidth="3" strokeLinecap="round" />
      </g>
      <circle cx="20" cy="27" r="4" className="mm-dial__hub" />
    </svg>
  );
}

/**
 * The lobby (DESIGN-DIRECTION 5.3): tune the mirror in three taps. Voice cards preview their light on the whole page
 * (hover, press, or keyboard focus held 400 ms) and commit it on tap; depth is two dial tiles; rooms are three doors
 * that swing shut when closed. Values are stored exactly as before: onDone({ voice, depth, rooms }).
 */
export function LobbyView({ onDone, onBack, busy, error = "" }) {
  const steps = LOBBY_COPY.steps;
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({ rooms: [...LOBBY_DEFAULTS.rooms] });
  const [picked, setPicked] = useState(null);
  const heading = useRef(null);
  const timer = useRef(0);
  const focusTimer = useRef(0);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); setPicked(null); }, [step]);
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(focusTimer.current); previewTheme(null); }, []);
  const s = steps[step];
  const advance = (vals) => {
    setValues(vals);
    if (step < steps.length - 1) setStep(step + 1);
    else onDone({ voice: vals.voice, depth: vals.depth, rooms: vals.rooms });
  };
  const pick = (vals, id) => {
    if (picked) return;
    setPicked(id);
    const hold = document.body?.dataset.motion === "off" ? 0 : Math.round(motion.ms.base * 0.92);
    timer.current = setTimeout(() => advance(vals), hold);
  };
  const chooseVoice = (id) => {
    if (picked) return;
    clearTimeout(focusTimer.current);
    setThemeForVoice(id, { fade: true });
    pick({ ...values, voice: id }, id);
  };
  const preview = (id) => { if (!picked) previewTheme(tokens.themeForVoice(id)); };
  const unpreview = () => { clearTimeout(focusTimer.current); if (!picked) previewTheme(null); };
  const focusPreview = (id) => { clearTimeout(focusTimer.current); focusTimer.current = setTimeout(() => preview(id), 400); };
  const toggleRoom = (id) => setValues((v) => ({ ...v, rooms: v.rooms.includes(id) ? v.rooms.filter((r) => r !== id) : [...v.rooms, id] }));
  const back = () => { clearTimeout(timer.current); setPicked(null); if (step) setStep(step - 1); else onBack(); };
  const always = CHAPTERS.filter((c) => ALWAYS_CHAPTERS.includes(c.id));

  return (
    <main className="mm-screen mm-lobby" data-step={s.key}>
      <article className="mm-panel mm-panel--wide mm-glass" key={s.key}>
        <GeniiLight size="s" mood={picked ? "noted" : "listening"} line={LOBBY_COPY.guide} className="mm-panel__genii mm-enter" />
        <div className="mm-panel__head">
          <div className="mm-panel__meta mm-enter" style={{ "--step": 0 }}>
            <span className="mm-kicker">{LOBBY_COPY.eyebrow}</span>
            <Dots index={step} total={steps.length} label={LOBBY_COPY.counter(step + 1, steps.length)} />
          </div>
          <h1 ref={heading} tabIndex="-1" className="mm-panel__title mm-enter" style={{ "--step": 0 }}>{s.title}</h1>
          <p className="mm-panel__note mm-enter" style={{ "--step": 1 }}>{s.note}</p>
        </div>

        {s.key === "voice" && (
          <div className={`mm-voices${picked ? " has-pick" : ""}`} role="group" aria-label={s.title}>
            {s.options.map((o, i) => {
              const card = LOBBY_COPY.voiceCards[o.id] || {};
              const on = values.voice === o.id;
              return (
                <button type="button" key={o.id} className={`mm-voice mm-tile mm-enter${on ? " is-on" : ""}${picked === o.id ? " is-picked" : ""}`} style={{ "--step": 1 + i }}
                  data-voice={o.id} aria-pressed={on} disabled={busy}
                  onClick={() => chooseVoice(o.id)}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") preview(o.id); }}
                  onPointerLeave={(e) => { if (e.pointerType === "mouse") unpreview(); }}
                  onPointerDown={(e) => { if (e.pointerType !== "mouse") preview(o.id); }}
                  onPointerCancel={unpreview}
                  onFocus={() => focusPreview(o.id)}
                  onBlur={unpreview}>
                  <span className="mm-voice__orb" aria-hidden="true"><i /></span>
                  <span className="mm-voice__copy">
                    <span className="mm-voice__name">{o.text}</span>
                    <span className="mm-voice__sample">{card.sample}</span>
                  </span>
                  <span className="mm-voice__light" aria-hidden="true">{card.light}</span>
                </button>
              );
            })}
          </div>
        )}

        {s.key === "depth" && (
          <div className={`mm-depths${picked ? " has-pick" : ""}`} role="group" aria-label={s.title}>
            {s.options.map((o, i) => {
              const on = values.depth === o.id;
              return (
                <button type="button" key={o.id} className={`mm-depth mm-tile mm-enter${on ? " is-on" : ""}`} style={{ "--step": 1 + i }}
                  aria-pressed={on} disabled={busy} onClick={() => pick({ ...values, depth: o.id }, o.id)}>
                  <Dial at={o.id} />
                  <span className="mm-depth__copy">
                    <span className="mm-depth__name">{o.text}</span>
                    <span className="mm-depth__sub">{LOBBY_COPY.depthCards[o.id]}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {s.key === "rooms" && (
          <>
            <div className="mm-doors" role="group" aria-label={s.title}>
              {s.options.map((o, i) => {
                const on = values.rooms.includes(o.id);
                return (
                  <button type="button" key={o.id} className={`mm-door mm-enter${on ? " is-open" : " is-closed"}`} style={{ "--step": 1 + i }}
                    data-room={o.id} aria-pressed={on} aria-label={`${o.text}, ${on ? s.open.toLowerCase() : s.closed.toLowerCase()}`}
                    disabled={busy} onClick={() => toggleRoom(o.id)}>
                    <span className="mm-door__art" aria-hidden="true"><RoomDoor room={o.id} open={on} /></span>
                    <span className="mm-door__label" aria-hidden="true">{o.text}</span>
                    <span className="mm-door__state" aria-hidden="true">{on ? <><Check size={13} strokeWidth={2.5} /> {s.open}</> : s.closed}</span>
                  </button>
                );
              })}
            </div>
            <div className="mm-always mm-enter" style={{ "--step": 4 }}>
              <span className="mm-always__label">{LOBBY_COPY.alwaysOpen}</span>
              <ul>
                {always.map((c) => <li key={c.id}><ChapterGlyph chapter={c.id} size={18} /> {c.title}</li>)}
              </ul>
            </div>
          </>
        )}

        {error && <p className="mm-panel__error" role="alert">{error}</p>}
        <div className="mm-panel__foot">
          <button type="button" className="mm-text-btn" onClick={back}><ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" /> {LOBBY_COPY.back}</button>
          {s.multi ? (
            <button type="button" className="mm-btn mm-btn--primary mm-panel__go" disabled={busy} onClick={() => advance(values)}>
              {LOBBY_COPY.continue} <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : <span className="mm-panel__private">{LOBBY_COPY.guideNote}</span>}
        </div>
      </article>
    </main>
  );
}
