import React, { useRef } from "react";
import { X } from "lucide-react";
import { useDialogFocus } from "../../components/useDialogFocus.js";
import { ChapterGlyph } from "../../art/index.js";
import { CHAPTERS } from "../kit.js";
import { LOBBY_COPY } from "../lobby.js";
import "./play.css";

// Node states for the constellation: done, current, next (open, not started), closed (room shut in the lobby).
export function mapNodes(progress = {}) {
  const p = progress || {};
  const chapters = CHAPTERS.map((ch) => {
    const info = p[ch.id] || { open: true, done: 0, total: 0 };
    const state = info.open === false ? "closed" : info.total && info.done >= info.total ? "done" : info.total ? "current" : "next";
    return { key: ch.id, chapter: ch.id, title: ch.title, state, done: info.done || 0, total: info.total || 0 };
  });
  const fin = p[8];
  const finale = { key: "finale", chapter: "finale", title: "Finale", state: fin ? (fin.done >= fin.total ? "done" : "current") : "next", done: fin ? fin.done : 0, total: fin ? fin.total : 0 };
  // Only one "current": the first started chapter that is not finished, or the finale once it runs.
  let seen = false;
  for (const n of [...chapters, finale]) {
    if (n.state === "current") { if (seen) n.state = "next"; seen = true; }
  }
  if (fin && chapters.some((n) => n.state === "current")) chapters.forEach((n) => { if (n.state === "current") n.state = "done"; });
  return [...chapters, finale];
}

const statusText = (n) => (n.state === "closed" ? "Closed" : n.state === "done" || n.state === "current" ? `${n.done} of ${n.total}` : n.chapter === "finale" ? LOBBY_COPY.mapFinale : "Up next");

/**
 * The chapter map (5.8): a constellation of islands along an S-curve, dotted lines between them. Done chapters light in
 * their tint with a count, the current one pulses, closed rooms are dimmed, future ones are outlined. Read-only: the run
 * moves card by card, so the map orients, it never jumps. Bottom sheet on phone, dialog on desktop.
 */
export function PersonaChapterMap({ open, onClose, progress }) {
  const ref = useRef(null);
  const drag = useRef(null);
  useDialogFocus(ref, open);
  const close = () => { if (ref.current?.open) ref.current.close(); onClose(); };
  const nodes = mapNodes(progress);
  const rows = nodes.length;
  const H = rows * 60;
  const xs = nodes.map((_, i) => (i % 4 === 0 ? 22 : i % 4 === 2 ? 78 : 50));
  const path = nodes.map((_, i) => {
    const x = xs[i];
    const y = i * 60 + 30;
    if (!i) return `M${x},${y}`;
    const px = xs[i - 1];
    const py = (i - 1) * 60 + 30;
    return `C${px},${py + 30} ${x},${y - 30} ${x},${y}`;
  }).join(" ");
  return (
    <dialog ref={ref} className="cmap" aria-labelledby="cmap-title"
      onCancel={(e) => { e.preventDefault(); close(); }}
      onClick={(e) => { if (e.target === ref.current) close(); }}>
      <div className="cmap__sheet">
        <span className="cmap__handle" aria-hidden="true"
          onPointerDown={(e) => { drag.current = e.clientY; }}
          onPointerUp={(e) => { if (drag.current !== null && e.clientY - drag.current > 60) close(); drag.current = null; }} />
        <div className="cmap__top">
          <div>
            <p className="cmap__kicker">Your run</p>
            <h2 id="cmap-title" className="cmap__title">Chapter map</h2>
          </div>
          <button type="button" className="cmap__close" onClick={close} aria-label="Close chapter map"><X size={20} /></button>
        </div>
        <p className="cmap__lede">{LOBBY_COPY.mapLede}</p>
        <div className="cmap__sky" style={{ "--cmap-h": `${H}px` }}>
          <svg className="cmap__path" viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <path d={path} vectorEffect="non-scaling-stroke" />
          </svg>
          <ol className="cmap__nodes">
            {nodes.map((n, i) => (
              <li key={n.key} className={`cmap__node is-${n.state}`} style={{ "--x": `${xs[i]}%`, "--y": `${i * 60 + 30}px`, "--node-tint": n.chapter === "finale" ? "var(--tint-finale)" : `var(--tint-ch${n.chapter})` }}
                aria-current={n.state === "current" ? "step" : undefined}>
                <span className="cmap__star" aria-hidden="true"><ChapterGlyph chapter={n.chapter} size={24} /></span>
                <span className="cmap__label">
                  <b>{n.title}</b>
                  <small>{statusText(n)}</small>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </dialog>
  );
}
