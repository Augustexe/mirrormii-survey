import React from "react";
import { AnswerTile } from "../AnswerTile.jsx";
import { pickTwoGrid } from "../answer-model.js";

// Pick two (5.7): two empty slots fill as you tap. A 600 ms settle ring runs on the second slot before the answer
// goes in; any tap in that window cancels it, so a mistake is recoverable.
export function PickTwo({ card, texts, picks, need, settling, locked, onToggle, onSlot, kbd }) {
  const grid = pickTwoGrid(texts);
  return (
    <>
      <div className="pc-slots" aria-hidden="true">
        {Array.from({ length: need }, (_, k) => {
          const i = picks[k];
          const filled = Number.isInteger(i);
          return (
            <button
              type="button"
              tabIndex={-1}
              key={k}
              className={`pc-slot${filled ? " is-filled" : ""}${settling && k === need - 1 ? " is-settling" : ""}`}
              onClick={() => filled && onSlot(k)}
              disabled={locked || !filled}
            >
              <span className="pc-slot__n">{k + 1}</span>
              <span className="pc-slot__text">{filled ? texts[i] : ""}</span>
              {settling && k === need - 1 ? (
                <svg className="pc-slot__ring" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><circle cx="18" cy="18" r="15" /></svg>
              ) : null}
            </button>
          );
        })}
      </div>
      <p className="pc-sr" aria-live="polite">{picks.length} of {need} picked</p>
      <div className={`pc-answers pc-answers--${grid ? "grid" : "list"}`} role="group" aria-label={`Choose ${need} answers`}>
        {texts.map((text, i) => (
          <AnswerTile
            key={`${card.id}-${i}`}
            index={i}
            variant={grid ? "short" : "plain"}
            selected={picks.includes(i)}
            pressed={picks.includes(i)}
            disabled={locked}
            kbd={kbd && i < 9 ? String(i + 1) : null}
            onClick={(e) => onToggle(i, e)}
            style={{ "--i": i }}
          >
            {text}
          </AnswerTile>
        ))}
      </div>
    </>
  );
}
