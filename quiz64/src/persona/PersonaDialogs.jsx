import React, { useRef } from "react";
import { ArrowLeft, Check, Download, Info, Lock, Map, Moon, RotateCcw, Sun, Trash2, X } from "lucide-react";
import { useDialogFocus } from "../components/useDialogFocus.js";
import { CHAPTERS } from "./kit.js";

function Dialog({ open, onClose, id, eyebrow, title, className = "", children }) {
  const ref = useRef(null);
  useDialogFocus(ref, open);
  const close = () => { if (ref.current?.open) ref.current.close(); onClose(); };
  return (
    <dialog ref={ref} className={`map-dialog ${className}`} aria-labelledby={id}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === ref.current) close(); }}>
      <div className="dialog-top">
        <div><span className="eyebrow">{eyebrow}</span><h2 id={id}>{title}</h2></div>
        <button type="button" className="icon-button" onClick={close} aria-label={`Close ${title.toLowerCase()}`}><X size={20} /></button>
      </div>
      {typeof children === "function" ? children(close) : children}
    </dialog>
  );
}

// Read-only: the run moves forward card by card, so the map shows progress, not shortcuts.
export function PersonaChapterMap({ open, onClose, progress }) {
  return (
    <Dialog open={open} onClose={onClose} id="pmap-title" eyebrow="Your run" title="Chapter map">
      <p className="dialog-lede">Seven chapters, then Genii locks its guesses and you play the final eight.</p>
      <div className="chapter-list">
        {[...CHAPTERS, { id: 8, title: "Finale", intro: "Eight new cards. Genii guesses first." }].map((ch) => {
          const p = progress[ch.id] || { done: 0, total: 0 };
          const locked = p.total === 0 && ch.id !== 1;
          return (
            <div key={ch.id} className={`chapter-row ${locked ? "chapter-row--locked" : ""}`}>
              <span className="chapter-emblem">{locked ? <Lock size={16} /> : p.total && p.done >= p.total ? <Check size={18} /> : <Map size={15} />}</span>
              <span className="chapter-copy"><strong>{ch.title}</strong><small>{ch.intro}</small></span>
              <span className="chapter-count">{p.total ? `${p.done} of ${p.total}` : ch.id === 8 ? "After chapter 7" : "Up next"}</span>
            </div>
          );
        })}
      </div>
    </Dialog>
  );
}

export function PersonaHowDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} id="phow-title" eyebrow="Small print, in human language" title="How this works" className="how-dialog">
      <div className="how-copy">
        <p>Genii is a personality game for fun and self-discovery. It isn't a scientific test, a diagnosis or a label for life.</p>
        <div className="how-grid">
          <div><b>Only taps</b><span>Every answer is a tap. Genii adds up what the answers you picked point to, with fixed rules. No AI writes your result.</span></div>
          <div><b>Not your life?</b><span>Skip, “Not my life” and “No recent example” never count for or against you. Neither do answers about money or time you simply don't have.</span></div>
          <div><b>Eight locked guesses</b><span>Before the finale, Genii locks one guess per card. You see how many it called at the end.</span></div>
          <div><b>Stays here</b><span>Your answers stay in this browser. No account, no tracking. The friend game sends only what a friend needs to play, in the link you choose to share.</span></div>
        </div>
        <p className="how-boundary">Some lines on your result are only for you, like the ones that sting a little. Your share card and friend links never include them unless you turn on the bestie bonus round.</p>
      </div>
    </Dialog>
  );
}

export function PersonaMoreDialog({ open, onClose, onMap, onHow, onHome, onDownload, onRestart, onDelete, motionOn, setMotionOn, hasRun }) {
  const item = (close, fn, Icon, title, sub, extra = "") => (
    <button type="button" className={extra} onClick={() => { close(); fn(); }}>
      <Icon size={17} /><span><b>{title}</b><small>{sub}</small></span>
    </button>
  );
  return (
    <Dialog open={open} onClose={onClose} id="pmore-title" eyebrow="More options" title="More" className="more-dialog">
      {(close) => (
        <div className="more-actions">
          {hasRun && item(close, onMap, Map, "Chapter map", "See where you are in the run")}
          {item(close, onHow, Info, "How it works", "What Genii does with your taps")}
          {item(close, onHome, ArrowLeft, "Save and leave", "This browser keeps your place")}
          {hasRun && item(close, onDownload, Download, "Download my data", "A file with your answers. Keep it private.")}
          {hasRun && item(close, onRestart, RotateCcw, "Play again from the start", "Clears this run after one last check")}
          {item(close, onDelete, Trash2, "Delete my data", "Removes everything Genii saved in this browser", "pr-danger")}
          <button type="button" onClick={() => { setMotionOn(!motionOn); close(); }}>
            <span className="more-icon">{motionOn ? <Sun size={17} /> : <Moon size={17} />}</span>
            <span><b>{motionOn ? "Motion on" : "Motion off"}</b><small>{motionOn ? "Turn ambient movement off" : "Turn ambient movement on"}</small></span>
          </button>
        </div>
      )}
    </Dialog>
  );
}

export function ConfirmDialog({ open, onClose, onConfirm, title, body, confirmLabel, keepLabel = "Keep it", danger = false }) {
  return (
    <Dialog open={open} onClose={onClose} id="pconfirm-title" eyebrow="Just checking" title={title} className="reset-dialog persona-confirm">
      {(close) => (
        <>
          <p>{body}</p>
          <div className="dialog-actions">
            <button type="button" className="button button--quiet" onClick={close}>{keepLabel}</button>
            <button type="button" className={`button button--primary ${danger ? "pr-danger-fill" : ""}`} onClick={() => { close(); onConfirm(); }}>{confirmLabel}</button>
          </div>
        </>
      )}
    </Dialog>
  );
}
