import React, { useEffect, useState } from "react";
import { geniiEvents } from "./events.js";
import { GENII_MOODS, geniiSizes } from "./tokens.js";
import { GeniiForm } from "../genii/GeniiForm.jsx";
import { clamp01, evolutionFor, expressionFor, formAt, stageOf } from "../genii/evolution.js";

// Pause every Genii loop while the tab is hidden (one listener shared by all instances).
let visibilityBound = false;
function bindVisibility() {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  const sync = () => { document.documentElement.dataset.hidden = String(document.hidden); };
  document.addEventListener("visibilitychange", sync);
  sync();
}

// Four-point star (A-15 shape), drawn inline so Genii never waits on another module.
const STAR = "M6 0 C6.5 3.6 8.4 5.5 12 6 C8.4 6.5 6.5 8.4 6 12 C5.5 8.4 3.6 6.5 0 6 C3.6 5.5 5.5 3.6 6 0 Z";

const SPARKLES = { xs: 0, s: 0, m: 3, l: 5, xl: 7 };
// Below this evolution Genii is still the orb: pure CSS light, and three.js is never loaded.
const ORB_ONLY = 0.02;

// `evolution` is a number 0..1, or the play state { answered, total, confidence, phase } (see evolutionFor).
function evolutionOf(evolution) {
  if (typeof evolution === "number") return Number.isFinite(evolution) ? clamp01(evolution) : null;
  if (evolution && typeof evolution === "object") return evolutionFor(evolution);
  return null;
}

/**
 * Genii (DESIGN-DIRECTION 3.3, asset A-07; LAUNCH-SPEC section 23, ruling 1). Without `evolution`, or at 0, Genii is
 * the orb: a luminous core, a bloom and orbiting sparkles, pure CSS. With `evolution` in 0..1 the orb grows into
 * Genii's real form (src/genii): droplet, then the bead at the tip, then the eyes, then full Genii with expressions.
 * `evolution` also takes the play state, { answered, total, confidence, phase }; lock, finale and reveal are complete.
 * Genii is a glass slime, never a genie and never a lamp.
 * mood: listening | noted | thinking | hush | sure | idle (motion, and the face once Genii is complete).
 * expression: optional face override (alert, curious, skeptical, happy, thinking). size: xs 24, s 32, m 72, l 160, xl 280.
 * line: one Genii line, set in Fraunces italic and announced politely. voice "cards" (Just the cards) shows no line.
 * placement: "row" (line beside the orb) or "below" (line under the orb, centered).
 * geniiEvents.emit("noted" | "thinking" | "sure") from anywhere makes every mounted Genii react.
 */
export function GeniiLight({ mood = "listening", size = "xs", line = null, voice = "fun", placement = "row", className = "", evolution = null, expression = null }) {
  const [pulse, setPulse] = useState(0);
  const [react, setReact] = useState(0);
  const [eventMood, setEventMood] = useState(null);
  useEffect(() => {
    bindVisibility();
    return geniiEvents.on((name) => {
      if (name === "noted" || name === "sure") setPulse((n) => n + 1);
      if (name === "noted") setReact((n) => n + 1);
      if (name === "thinking" || name === "sure") setEventMood(name);
    });
  }, []);
  useEffect(() => {
    if (!pulse) return undefined;
    const id = setTimeout(() => setPulse(0), 700);
    return () => clearTimeout(id);
  }, [pulse]);
  useEffect(() => {
    if (!eventMood) return undefined;
    const id = setTimeout(() => setEventMood(null), 2400);
    return () => clearTimeout(id);
  }, [eventMood]);

  const safeSize = geniiSizes[size] ? size : "xs";
  const safeMood = eventMood || (GENII_MOODS.includes(mood) ? mood : "listening");
  const showLine = Boolean(line) && voice !== "cards";
  const sparkles = SPARKLES[safeSize];
  const evo = evolutionOf(evolution);
  const formed = evo !== null && evo > ORB_ONLY;
  const form = formed ? formAt(evo) : null;
  const face = form && form.expressive > 0.5 ? (expression || expressionFor(safeMood)) : "alert";
  return (
    <span
      className={`genii-light${pulse || safeMood === "noted" ? " is-pulse" : ""}${className ? ` ${className}` : ""}`}
      data-mood={safeMood}
      data-size={safeSize}
      data-placement={placement}
      data-stage={evo === null ? "orb" : stageOf(evo)}
      data-formed={formed ? "true" : undefined}
      style={form ? { "--gl-light": form.glow.toFixed(3), "--gl-clear": form.clarity.toFixed(3) } : undefined}
    >
      <span className="genii-light__orb" aria-hidden="true">
        <span className="genii-light__bloom" />
        {formed ? <GeniiForm evolution={evo} expression={face} size={safeSize} pulse={pulse} react={react} /> : null}
        <span className="genii-light__core" key={pulse} />
        <span className="genii-light__glint" />
        {sparkles ? (
          <span className="genii-light__sparkles">
            {Array.from({ length: sparkles }, (_, i) => (
              <span key={i} className="genii-light__sparkle" style={{ "--i": i, "--n": sparkles }}>
                <svg viewBox="0 0 12 12" focusable="false"><path d={STAR} fill="currentColor" /></svg>
              </span>
            ))}
          </span>
        ) : null}
      </span>
      {showLine ? <span className="genii-light__line" aria-live="polite">{line}</span> : null}
    </span>
  );
}
