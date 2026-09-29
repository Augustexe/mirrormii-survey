import React, { useEffect, useId, useState } from "react";
import { geniiEvents } from "./events.js";
import { GENII_MOODS, geniiSizes } from "./tokens.js";

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
// Lamp smoke: two soft curls that wrap the core (100 x 100 space, the core sits at 50, 50).
const WISP_A = "M50 84 C30 80 18 62 24 44 C30 26 50 18 64 26 C76 33 76 50 64 56 C54 61 44 54 47 45";
const WISP_B = "M52 16 C72 20 84 38 78 56 C72 74 52 82 38 74 C27 67 28 52 39 47 C48 43 56 50 52 58";

const SPARKLES = { xs: 0, s: 0, m: 3, l: 5, xl: 7 };

/**
 * Genii as light (DESIGN-DIRECTION 3.3, asset A-07): a luminous core, a bloom, a curl of lamp smoke and orbiting
 * sparkles. No face, no body, no raster. Mood is motion only.
 * mood: listening | noted | thinking | hush | sure | idle. size: xs 24, s 32, m 72, l 160, xl 280.
 * line: one Genii line, set in Fraunces italic and announced politely. voice "cards" (Just the cards) shows no line.
 * placement: "row" (line beside the orb) or "below" (line under the orb, centered).
 * geniiEvents.emit("noted" | "thinking" | "sure") from anywhere makes every mounted light react.
 */
export function GeniiLight({ mood = "listening", size = "xs", line = null, voice = "fun", placement = "row", className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const [pulse, setPulse] = useState(0);
  const [eventMood, setEventMood] = useState(null);
  useEffect(() => {
    bindVisibility();
    return geniiEvents.on((name) => {
      if (name === "noted" || name === "sure") setPulse((n) => n + 1);
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
  const wisp = safeSize !== "xs";
  return (
    <span
      className={`genii-light${pulse || safeMood === "noted" ? " is-pulse" : ""}${className ? ` ${className}` : ""}`}
      data-mood={safeMood}
      data-size={safeSize}
      data-placement={placement}
    >
      <span className="genii-light__orb" aria-hidden="true">
        <span className="genii-light__bloom" />
        {wisp ? (
          <svg className="genii-light__wisp" viewBox="0 0 100 100" focusable="false">
            <defs>
              <linearGradient id={`${uid}-wisp`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--c-surface-solid)" stopOpacity="0.95" />
                <stop offset="0.55" stopColor="var(--c-violet-300)" stopOpacity="0.8" />
                <stop offset="1" stopColor="var(--c-violet)" stopOpacity="0" />
              </linearGradient>
              <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={safeSize === "s" ? 0.9 : 1.6} />
              </filter>
            </defs>
            <g filter={`url(#${uid}-soft)`} fill="none" strokeLinecap="round">
              <path className="genii-light__curl genii-light__curl--a" d={WISP_A} stroke={`url(#${uid}-wisp)`} strokeWidth="5" />
              <path className="genii-light__curl genii-light__curl--b" d={WISP_B} stroke={`url(#${uid}-wisp)`} strokeWidth="3.4" />
            </g>
          </svg>
        ) : null}
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
