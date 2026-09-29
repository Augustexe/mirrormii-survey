import React from "react";
import { Reorder, useDragControls } from "motion/react";

const Grip = () => (
  <svg viewBox="0 0 12 20" width="12" height="20" aria-hidden="true" focusable="false">
    {[4, 10, 16].map((y) => [3, 9].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="currentColor" />))}
  </svg>
);

function RankItem({ i, pos, text, placed, showNumber, grabbed, locked, onTap, onGrab, onKeyMove, kbd }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      as="li"
      value={i}
      dragListener={false}
      dragControls={controls}
      className={`pc-rank__item${grabbed ? " is-grabbed" : ""}${placed ? " is-placed" : ""}`}
      whileDrag={{ scale: 1.02, y: -8, boxShadow: "var(--e3)", zIndex: 3 }}
      transition={{ duration: 0.2 }}
      data-index={i}
    >
      <button type="button" className="pc-rank__tap" disabled={locked} onClick={() => onTap(i)} aria-label={placed ? `${text}, placed ${pos + 1}` : text}>
        <span className={`pc-rank__badge${showNumber ? " is-on" : ""}`} aria-hidden="true">{showNumber ? pos + 1 : ""}</span>
        <span className="pc-rank__text">{text}</span>
        {kbd ? <kbd className="pc-kbd" aria-hidden="true">{pos + 1}</kbd> : null}
      </button>
      <button
        type="button"
        className="pc-rank__grip"
        aria-label={grabbed ? `${text}. Moving. Arrow keys to move, Space to drop.` : `Move ${text}. Space to pick up.`}
        aria-pressed={grabbed}
        disabled={locked}
        onPointerDown={(e) => { if (!locked) { e.preventDefault(); controls.start(e); } }}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") { e.preventDefault(); onGrab(grabbed ? null : i); }
          else if (grabbed && (e.key === "ArrowUp" || e.key === "ArrowDown")) { e.preventDefault(); onKeyMove(i, e.key === "ArrowUp" ? -1 : 1); }
          else if (grabbed && (e.key === "Escape" || e.key === "Tab")) onGrab(null);
        }}
      >
        <Grip />
      </button>
    </Reorder.Item>
  );
}

// Rank it (5.7): a podium list. Drag by the grip (motion Reorder), tap items in order as a fallback, or use the
// keyboard: focus a grip, Space to pick up, arrows to move, Space to drop.
export function Rank({ card, texts, rank, locked, grabbed, onGrab, onTap, onReorder, onKeyMove, onDone, ready, announce, kbd }) {
  const n = texts.length;
  return (
    <div className="pc-rank">
      <span className="pc-rank__end" aria-hidden="true">First</span>
      <Reorder.Group as="ol" axis="y" values={rank.order} onReorder={onReorder} className="pc-rank__list" aria-label="Put these in order, first to last">
        {rank.order.map((i, pos) => (
          <RankItem
            key={`${card.id}-${i}`}
            i={i}
            pos={pos}
            text={texts[i]}
            placed={rank.moved || pos < rank.placed}
            showNumber={rank.moved || pos < rank.placed}
            grabbed={grabbed === i}
            locked={locked}
            onTap={onTap}
            onGrab={onGrab}
            onKeyMove={onKeyMove}
            kbd={kbd}
          />
        ))}
      </Reorder.Group>
      <span className="pc-rank__end" aria-hidden="true">Last</span>
      <p className="pc-sr" aria-live="polite">{announce || `${rank.moved ? n : rank.placed}/${n} placed`}</p>
      <div className="pc-done" data-part="persona-done">
        <button type="button" className="pc-primary" disabled={locked || !ready} onClick={onDone}>
          {rank.placed === 0 && !rank.moved ? "This order" : "Done"}
          {kbd ? <kbd className="pc-kbd pc-kbd--on-deep" aria-hidden="true">Enter</kbd> : null}
        </button>
      </div>
    </div>
  );
}
