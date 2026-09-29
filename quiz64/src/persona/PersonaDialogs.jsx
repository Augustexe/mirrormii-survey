import React from "react";
import { ArrowLeft, ArrowRight, Check, Download, Info, Lock, Map, RotateCcw, Trash2 } from "lucide-react";
import { ChapterGlyph } from "../art/index.js";
import { Sheet } from "../system/index.js";
import { CHAPTERS } from "./kit.js";
import { LOBBY_COPY } from "./lobby.js";

// Read-only: the run moves forward card by card, so the map shows progress, not shortcuts.
// Package B replaces this with the constellation sheet (DESIGN-DIRECTION 5.8); until then it wears the sheet styles.
export function PersonaChapterMap({ open, onClose, progress }) {
  return (
    <Sheet open={open} onClose={onClose} id="pmap-title" kicker="Your run" title="Chapter map" className="mm-map">
      <p className="mm-sheet__lede">{LOBBY_COPY.mapLede}</p>
      <ol className="mm-map__list">
        {[...CHAPTERS, { id: 8, title: "Finale", intro: "Eight new cards. Genii guesses first." }].map((ch) => {
          const p = progress[ch.id] || { done: 0, total: 0, open: true };
          const closed = p.open === false;
          const locked = closed || (p.total === 0 && ch.id !== 1);
          const done = p.total && p.done >= p.total;
          return (
            <li key={ch.id} className={`mm-map__row${locked ? " is-locked" : ""}${done ? " is-done" : ""}`}>
              <span className="mm-map__glyph" aria-hidden="true"><ChapterGlyph chapter={ch.id === 8 ? "finale" : ch.id} size={28} /></span>
              <span className="mm-map__copy"><strong>{ch.title}</strong><small>{ch.intro}</small></span>
              <span className="mm-map__count">
                {closed ? <><Lock size={13} aria-hidden="true" /> {LOBBY_COPY.mapClosed}</> : done ? <><Check size={14} aria-hidden="true" /> {`${p.done} of ${p.total}`}</> : p.total ? `${p.done} of ${p.total}` : ch.id === 8 ? LOBBY_COPY.mapFinale : "Up next"}
              </span>
            </li>
          );
        })}
      </ol>
    </Sheet>
  );
}

export function PersonaHowDialog({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} id="phow-title" kicker="Small print, in human language" title="How this works" className="mm-how-sheet">
      <p className="mm-sheet__lede">Genii is a personality game for fun and self-discovery. It isn't a scientific test, a diagnosis or a label for life.</p>
      <div className="mm-how-grid">
        <div><b>Only taps</b><span>Every answer is a tap. Genii adds up what the answers you picked point to, with fixed rules. No AI writes your result.</span></div>
        <div><b>Not your life?</b><span>Skip, “Not my life” and “No recent example” never count for or against you. Neither do answers about money or time you simply don't have.</span></div>
        <div><b>Eight locked guesses</b><span>Before the finale, Genii locks one guess per card. You see how many it called at the end.</span></div>
        <div><b>Stays here</b><span>Your answers stay in this browser. No account, no tracking. The friend game sends only what a friend needs to play, in the link you choose to share.</span></div>
      </div>
      <p className="mm-sheet__fine">Some lines on your result are only for you, like the ones that sting a little. Your share card and friend links never include them unless you turn on the bestie bonus round.</p>
    </Sheet>
  );
}

function Item({ close, onClick, Icon, title, sub, danger = false }) {
  return (
    <button type="button" className={`mm-menu__item${danger ? " is-danger" : ""}`} onClick={() => { close(); onClick(); }}>
      <span className="mm-menu__icon" aria-hidden="true"><Icon size={18} strokeWidth={1.75} /></span>
      <span className="mm-menu__copy"><b>{title}</b><small>{sub}</small></span>
      {danger ? null : <ArrowRight className="mm-menu__go" size={16} strokeWidth={1.75} aria-hidden="true" />}
    </button>
  );
}

/**
 * The More sheet (DESIGN-DIRECTION 5.0): Chapter map, How this works, Save and leave, Motion, and Your data
 * (download, play again, delete). Same actions and confirm dialogs as before.
 */
export function PersonaMoreDialog({ open, onClose, onMap, onHow, onHome, onDownload, onRestart, onDelete, motionOn, setMotionOn, hasRun }) {
  return (
    <Sheet open={open} onClose={onClose} id="pmore-title" title="Menu" className="mm-menu">
      {(close) => (
        <>
          <div className="mm-menu__group">
            {hasRun && <Item close={close} onClick={onMap} Icon={Map} title="Chapter map" sub="See where you are in the run" />}
            <Item close={close} onClick={onHow} Icon={Info} title="How this works" sub="What Genii does with your taps" />
            <Item close={close} onClick={onHome} Icon={ArrowLeft} title="Save and leave" sub="This browser keeps your place" />
          </div>
          <div className="mm-menu__switch">
            <span className="mm-menu__copy" id="pmore-motion"><b>Motion</b><small>{motionOn ? "Light, shards and fog move" : "Everything holds still"}</small></span>
            <button type="button" role="switch" aria-checked={motionOn} aria-labelledby="pmore-motion" className="mm-switch" onClick={() => setMotionOn(!motionOn)}>
              <span className="mm-switch__thumb" />
            </button>
          </div>
          <div className="mm-menu__group">
            <span className="mm-menu__heading">Your data</span>
            {hasRun && <Item close={close} onClick={onDownload} Icon={Download} title="Download my data" sub="A file with your answers. Keep it private." />}
            {hasRun && <Item close={close} onClick={onRestart} Icon={RotateCcw} title="Play again from the start" sub="Clears this run after one last check" />}
            <Item close={close} onClick={onDelete} Icon={Trash2} title="Delete my data" sub="Removes everything Genii saved in this browser" danger />
          </div>
        </>
      )}
    </Sheet>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, keepLabel = "Keep it", danger = false }) {
  return (
    <Sheet open={open} onClose={onClose} id="pconfirm-title" kicker="Just checking" title={title} className="mm-confirm">
      {(close) => (
        <>
          <p className="mm-sheet__lede">{body}</p>
          <div className="mm-confirm__actions">
            <button type="button" className="mm-btn mm-btn--outline mm-btn--small" onClick={close}>{keepLabel}</button>
            <button type="button" className={`mm-btn mm-btn--small ${danger ? "mm-btn--danger" : "mm-btn--primary"}`} onClick={() => { close(); onConfirm(); }}>{confirmLabel}</button>
          </div>
        </>
      )}
    </Sheet>
  );
}
