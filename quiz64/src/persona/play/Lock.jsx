import React, { useContext, useEffect, useRef, useState } from "react";
import { MotionConfigContext, useReducedMotion } from "motion/react";
import { ArrowRight, Lock, X } from "lucide-react";
import { useDialogFocus } from "../../components/useDialogFocus.js";
import { MirrorArch, LockPane } from "../../art/index.js";
import { ISLAND } from "../../art/world.js";
import { GeniiLight, geniiEvents } from "../../system/index.js";
import { LOBBY_COPY } from "../lobby.js";
import "./play.css";

const PANES = 8;
const RITUAL_MS = 2200;

// Every shard lit for the lock scene: the real chapters when progress is known, otherwise an even spread.
function allShards(progress) {
  if (progress && Object.keys(progress).length) {
    const out = [];
    for (let ch = 1; ch <= 7; ch++) {
      const p = progress[ch];
      if (p && p.open !== false) for (let i = 0; i < (p.done || 0); i++) out.push({ chapter: ch });
    }
    while (out.length < 40) out.push({ chapter: "extras" });
    return out;
  }
  return Array.from({ length: 40 }, (_, i) => ({ chapter: (i % 7) + 1 }));
}

export const groupCode = (hash) => (String(hash || "").match(/.{1,4}/g) || []).join(" ");

function CheatSheet({ open, onClose, lockHash }) {
  const ref = useRef(null);
  useDialogFocus(ref, open);
  const close = () => { if (ref.current?.open) ref.current.close(); onClose(); };
  return (
    <dialog ref={ref} className="lock-sheet" aria-labelledby="lock-sheet-title" data-scene="night"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === ref.current) close(); }}>
      <div className="lock-sheet__inner">
        <div className="lock-sheet__top">
          <h2 id="lock-sheet-title">How do I know Genii can't cheat?</h2>
          <button type="button" className="cmap__close" onClick={close} aria-label="Close"><X size={20} /></button>
        </div>
        <p>Genii locked one guess for each of your last eight cards before you saw them, using only the answers you had already given.</p>
        <p>This code is made from Genii's eight guesses. If a single guess changed later, the code would change too, and Genii would refuse to score the run.</p>
        <p className="lock-sheet__code" aria-label={`Full code ${lockHash || ""}`}>{groupCode(lockHash)}</p>
      </div>
    </dialog>
  );
}

/**
 * The lock moment (5.10): eight small panes orbit the full mirror; locking sends Genii's light past each one, they
 * frost and take a seal, then line up under the mirror. The locked state shows the panes, never a code; the full code
 * lives in the "How do I know Genii can't cheat?" sheet. The ritual is skippable by a tap and instant under reduced motion.
 */
export function LockView({ locked, lockHash, onLock, onStart, onSave, busy, error, progress = null, seed = "genii", shards = null }) {
  const heading = useRef(null);
  const reduced = useReducedMotion();
  const { reducedMotion } = useContext(MotionConfigContext);
  const still = reduced || reducedMotion === "always";
  const [ritual, setRitual] = useState(false);
  const [sheet, setSheet] = useState(false);
  const wasLocked = useRef(locked);
  const timer = useRef(null);

  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [locked]);
  useEffect(() => {
    if (locked && !wasLocked.current && !still) {
      setRitual(true);
      geniiEvents.emit("thinking");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => { setRitual(false); geniiEvents.emit("sure"); }, RITUAL_MS);
    }
    wasLocked.current = locked;
    return undefined;
  }, [locked, still]);
  useEffect(() => () => clearTimeout(timer.current), []);
  const skip = () => { if (ritual) { clearTimeout(timer.current); setRitual(false); } };

  // The run's own shards (the same colors, cells and order the player watched fill the rail and the chapter mirrors,
  // and the reveal lands); an even spread only when a caller has none.
  const filled = Array.isArray(shards) && shards.length ? shards : allShards(progress);
  const state = ritual ? "ritual" : locked ? "locked" : "open";

  return (
    <main className="lock" data-scene="night" data-state={state} onPointerDown={skip}>
      <div className="lock__grid">
        <div className="lock__scene" aria-hidden="true">
          <span className="lock__horizon" />
          <div className="lock__mirror">
            {/* Genii's island at night stands behind the mirror, placed so the island's own mirror hides behind this one. */}
            <img className="lock__island" src={ISLAND.night.src} alt="" width="720" height="1080" decoding="async" loading="lazy" />
            <MirrorArch seed={seed} filled={filled} fog={locked ? 0.35 : 0.05} glow={0.9} size={170} />
          </div>
          <span className="lock__light"><GeniiLight mood={ritual ? "thinking" : locked ? "sure" : "listening"} size="s" voice="cards" evolution={1} /></span>
          <div className="lock__panes">
            {Array.from({ length: PANES }, (_, i) => {
              const a = (-90 + i * (360 / PANES)) * (Math.PI / 180);
              return (
                <span key={i} className="lock__pane" style={{ "--i": i, "--ox": `${Math.cos(a) * 150}px`, "--oy": `${Math.sin(a) * 128}px`, "--rx": `${(i - (PANES - 1) / 2) * 40}px`, "--pane-tint": `var(--tint-ch${(i % 7) + 1})` }}>
                  <LockPane state={locked ? "sealed" : "clear"} size={32} />
                  {/* Each pane is one of Genii's eight guesses: numbered and tinted, so they read as eight, not a pattern. */}
                  <span className="lock__pane-n">{i + 1}</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="lock__copy">
          <p className="lock__kicker">{locked ? "Guesses locked" : LOBBY_COPY.lockEyebrow}</p>
          <h1 ref={heading} tabIndex="-1" className="lock__title">
            {locked ? <>Genii has made<br /><em>its guesses.</em></> : <>Genii will guess<br /><em>your last eight answers.</em></>}
          </h1>
          {locked ? (
            <p className="lock__body">Locked before you play. They stay hidden until the end.</p>
          ) : (
            <ol className="lock__steps">
              <li>Genii guesses your last 8 cards from the answers you gave.</li>
              <li>Then you play them and see what it called.</li>
            </ol>
          )}
          {locked ? (
            <button type="button" className="lock__why" onClick={() => setSheet(true)}>How do I know Genii can't cheat?</button>
          ) : (
            <div className="lock__note">
              <Lock size={16} aria-hidden="true" />
              <p><b>Your chapter answers lock after this.</b> Genii can pass when a side of you is too close to call.</p>
            </div>
          )}
          {error ? <p className="pc-error" role="alert">{error}</p> : null}
          <div className="lock__actions">
            {locked
              ? <button type="button" className="pc-primary pc-primary--large" onClick={() => { skip(); onStart(); }}>Play the last eight cards <ArrowRight size={19} aria-hidden="true" /></button>
              : <button type="button" className="pc-primary pc-primary--large" onClick={onLock} disabled={busy}>Lock in Genii's guesses <Lock size={17} aria-hidden="true" /></button>}
          </div>
          <p className="lock__boundary">It's a game about you, not a test of you. Genii's guesses are for fun.</p>
        </div>
      </div>
      <CheatSheet open={sheet} onClose={() => setSheet(false)} lockHash={lockHash} />
    </main>
  );
}

