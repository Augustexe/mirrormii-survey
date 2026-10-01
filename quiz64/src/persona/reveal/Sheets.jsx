// Sheets for the result (DESIGN-DIRECTION 5.12, 5.14, 5.16): the share sheet behind the top bar's share icon, the
// "Your data" sheet on story 9, and "How Genii read you" (the one place a number is allowed).
import React, { useEffect, useRef, useState } from "react";
import { Check, Download, Lock, RotateCcw, Share, Trash2, X } from "lucide-react";
import { LockPane } from "../../art/index.js";
import { GUESS_COPY, UI_COPY } from "../stories/story-data.js";

export function Sheet({ title, onClose, children, tone = "night", className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = typeof document !== "undefined" ? document.activeElement : null;
    ref.current?.focus({ preventScroll: true });
    return () => { if (prev && prev.focus) prev.focus({ preventScroll: true }); };
  }, []);
  // Keep Tab inside the sheet.
  const onKey = (e) => {
    if (e.key !== "Tab" || !ref.current) return;
    const items = [...ref.current.querySelectorAll("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((el) => !el.disabled && el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className="rv-sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`rv-sheet ${className}`} data-scene={tone === "night" ? "night" : undefined} role="dialog" aria-modal="true" aria-label={title} tabIndex="-1" ref={ref} onKeyDown={onKey}>
        <span className="rv-sheet__handle" aria-hidden="true" />
        <header className="rv-sheet__head">
          <h2>{title}</h2>
          <button type="button" className="rv-icon" onClick={onClose} aria-label="Close"><X size={20} strokeWidth={1.75} /></button>
        </header>
        <div className="rv-sheet__body">{children}</div>
      </div>
    </div>
  );
}

// "How Genii read you": the eight frosted panes defrost left to right; tap one to read its card.
export function GuessSheet({ guesses }) {
  const [open, setOpen] = useState(null);
  const rows = guesses.rows || [];
  const pane = { hit: "hit", miss: "miss", pass: "pass" };
  return (
    <div className="rv-guesses">
      <p className="rv-guesses__intro">{GUESS_COPY.intro}</p>
      {guesses.called > 0 ? (
        <p className="rv-guesses__score"><strong>{guesses.exact} of {guesses.called}</strong> <span>called exactly.</span></p>
      ) : <p className="rv-guesses__score rv-guesses__score--none">{GUESS_COPY.none}</p>}
      <ol className="rv-panes">
        {rows.map((r, i) => (
          <li key={r.key} className={`rv-gpane rv-gpane--${r.status}`} style={{ "--i": i }}>
            <button type="button" className="rv-gpane__btn" aria-expanded={open === r.key} onClick={() => setOpen(open === r.key ? null : r.key)}>
              <span className="rv-gpane__glass" aria-hidden="true"><LockPane state={pane[r.status] || "frosted"} size={30} /></span>
              <span className="rv-guess__prompt">{r.prompt}</span>
              <span className="rv-guess__pill">{r.status === "hit" && <Check size={12} aria-hidden="true" />}{r.label}</span>
            </button>
            <span className="rv-gpane__frost" aria-hidden="true" />
          </li>
        ))}
      </ol>
      {open && (
        <div className="rv-gpop" role="note">
          <p>{(rows.find((r) => r.key === open) || {}).prompt}</p>
          <button type="button" className="rv-textbtn" onClick={() => setOpen(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export function DataSheet({ storageOK, onDownload, onRestart, onDelete }) {
  return (
    <div className="rv-data">
      <p className="rv-data__note">{storageOK ? "Saved on this device only." : "Saving is unavailable. This result lives in this tab."}</p>
      <button type="button" className="rv-row" onClick={onDownload}><Download size={18} strokeWidth={1.75} aria-hidden="true" /> Download my data</button>
      <button type="button" className="rv-row" onClick={onRestart}><RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" /> Start over</button>
      <button type="button" className="rv-row rv-row--danger" onClick={onDelete}><Trash2 size={18} strokeWidth={1.75} aria-hidden="true" /> Delete my data</button>
    </div>
  );
}

// The share sheet for the current screen. On the stings screen it offers "Save for me" only.
export function ShareSheet({ slide, busy, status, onShare, onSave }) {
  if (slide.private) {
    return (
      <div className="rv-sharesheet">
        <p className="rv-sharesheet__note"><Lock size={14} aria-hidden="true" /> {UI_COPY.stingsNote}</p>
        <button type="button" className="rv-cta rv-cta--deep" onClick={onSave} disabled={busy}><Download size={18} aria-hidden="true" /> {UI_COPY.saveForMe}</button>
        {status && <p className="rv-sharesheet__status" role="status">{status}</p>}
      </div>
    );
  }
  return (
    <div className="rv-sharesheet">
      <button type="button" className="rv-cta rv-cta--deep" onClick={onShare} disabled={busy}><Share size={18} aria-hidden="true" /> {UI_COPY.shareImage}</button>
      <button type="button" className="rv-row" onClick={onSave} disabled={busy}><Download size={18} strokeWidth={1.75} aria-hidden="true" /> {UI_COPY.saveImage}</button>
      {status && <p className="rv-sharesheet__status" role="status">{status}</p>}
    </div>
  );
}
