import React, { useRef } from "react";

const SWIPE = 64;

// This or that (5.7): the split. Two tall glass slabs with an "or" coin on the seam. Tap a slab, or swipe toward one
// (up and down on phone, left and right on desktop), or press 1 and 2 / the arrow keys.
export function Split({ card, texts, chosen, locked, onTap, kbd }) {
  const start = useRef(null);
  const wide = () => typeof window !== "undefined" && window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
  const onPointerDown = (e) => { if (!locked) start.current = { x: e.clientX, y: e.clientY }; };
  const onPointerUp = (e) => {
    const s = start.current;
    start.current = null;
    if (!s || locked || texts.length !== 2) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    const horizontal = wide();
    const d = horizontal ? dx : dy;
    const other = horizontal ? dy : dx;
    if (Math.abs(d) < SWIPE || Math.abs(other) > Math.abs(d)) return;
    e.preventDefault();
    onTap(d < 0 ? 0 : 1, e, { swiped: true });
  };
  return (
    <div
      className={`pc-split${chosen !== null ? " has-choice" : ""}`}
      role="group"
      aria-label="Pick one side"
      data-count={texts.length}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { start.current = null; }}
    >
      {texts.map((text, i) => (
        <React.Fragment key={`${card.id}-${i}`}>
          {i > 0 ? <span className="pc-split__coin" aria-hidden="true">or</span> : null}
          <button
            type="button"
            className={`pc-slab pc-slab--${i % 2 ? "b" : "a"}${chosen === i ? " is-chosen" : chosen !== null ? " is-dropped" : ""}`}
            data-index={i}
            aria-pressed={chosen === i}
            disabled={locked && chosen !== i}
            onClick={(e) => onTap(i, e)}
          >
            <span className="pc-slab__text">{text}</span>
            {kbd ? <kbd className="pc-kbd" aria-hidden="true">{i + 1}</kbd> : null}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}
