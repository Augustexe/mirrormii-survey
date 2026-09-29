import React, { useRef } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "../components/useDialogFocus.js";

/**
 * Sheet (DESIGN-DIRECTION 5.16): a bottom sheet on phone and a centered dialog from 600 px, on a soft scrim.
 * Native <dialog> with the existing focus trap, Escape and backdrop click to close, focus returned on close.
 * children may be a function that receives close().
 * scene="night" gives the sheet the brand dark scale (lock disclosure, guess sheet).
 */
export function Sheet({ open, onClose, id, kicker = null, title, className = "", scene, children }) {
  const ref = useRef(null);
  useDialogFocus(ref, open);
  const close = () => { if (ref.current?.open) ref.current.close(); onClose(); };
  return (
    <dialog ref={ref} className={`mm-sheet${className ? ` ${className}` : ""}`} aria-labelledby={id} data-scene={scene}
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === ref.current) close(); }}>
      <span className="mm-sheet__handle" aria-hidden="true" />
      <div className="mm-sheet__top">
        <div>
          {kicker ? <span className="mm-kicker">{kicker}</span> : null}
          <h2 id={id}>{title}</h2>
        </div>
        <button type="button" className="mm-icon-btn" onClick={close} aria-label={`Close ${String(title).toLowerCase()}`}><X size={20} strokeWidth={1.75} /></button>
      </div>
      {typeof children === "function" ? children(close) : children}
    </dialog>
  );
}
