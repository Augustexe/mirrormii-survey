// The first paint (integration, 2026-09-29). The game itself (the 174-card kit, the scorer, every screen) is a lazy
// chunk of about 280 KB gzipped; on a mid phone over 4G that pushed the landing's first paint past 3 s. Boot draws the
// same landing from a small chunk (header, backdrop, the fogged mirror and the copy) while the game loads, then
// PersonaApp replaces it with identical markup. A tap on the button before the game is ready is kept, not lost.
import React from "react";
import { Backdrop } from "./art/index.js";
import { PersonaHeader } from "./persona/screens/Header.jsx";
import { PersonaLanding } from "./persona/screens/Landing.jsx";
import "./persona/screens/screens.css";

// Must match session.js STORAGE_KEY and store.js MOTION_KEY (kept literal so this chunk never pulls in the kit).
export const BOOT_RUN_KEY = "genii.persona.v2.run";
const MOTION_KEY = "genii.motion.v1";

// Taps made before the game chunk arrives; PersonaApp reads and clears them once it mounts.
export const bootIntent = { begin: false, how: false };

function saved() {
  try {
    const raw = window.localStorage.getItem(BOOT_RUN_KEY);
    if (!raw) return { progress: null, seed: undefined };
    const s = JSON.parse(raw);
    const seed = s && typeof s.runId === "string" ? s.runId : undefined;
    if (!s || !s.setup) return { progress: null, seed };
    return { progress: s.frozen && s.finale && Object.keys(s.finale).length >= 8 ? "result" : "run", seed };
  } catch {
    return { progress: null, seed: undefined };
  }
}

export function Boot() {
  const link = typeof window !== "undefined" && /#(play|reply)=/.test(window.location.hash);
  let motionOff = false;
  try { motionOff = window.localStorage.getItem(MOTION_KEY) === "off"; } catch { /* default on */ }
  if (typeof document !== "undefined" && document.body) document.body.dataset.motion = motionOff ? "off" : "on";
  return (
    <div className="app-shell persona-app mm-app" data-screen={link ? "boot" : "landing"} aria-busy="true">
      <Backdrop scene="day" animated={false} />
      <PersonaHeader onHome={() => {}} onMore={() => {}} />
      {link ? null : (
        <PersonaLanding
          progress={saved().progress}
          seed={saved().seed}
          onBegin={() => { bootIntent.begin = true; }}
          onHow={() => { bootIntent.how = true; }}
        />
      )}
    </div>
  );
}
