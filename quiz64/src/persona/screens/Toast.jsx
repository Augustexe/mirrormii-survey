import React from "react";
import { Sparkle } from "../../art/index.js";

/**
 * Glass toast at the top of the content (DESIGN-DIRECTION 5.0): a small frost glyph, one or two sentences and at most
 * two text buttons. Never shows run ids, hashes, kits or error codes.
 * actions: [{ label, onClick }] (max 2). tone: "status" (polite) or "alert".
 */
export function Toast({ title = null, children, actions = [], tone = "status" }) {
  return (
    <div className="mm-toast mm-glass" role={tone === "alert" ? "alert" : "status"}>
      <span className="mm-toast__glyph" aria-hidden="true"><Sparkle size={14} /></span>
      <div className="mm-toast__body">
        {title ? <strong className="mm-toast__title">{title}</strong> : null}
        {children ? <p>{children}</p> : null}
        {actions.length ? (
          <div className="mm-toast__actions">
            {actions.slice(0, 2).map((a) => (
              <button key={a.label} type="button" className="mm-text-btn" onClick={a.onClick}>{a.label}</button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
