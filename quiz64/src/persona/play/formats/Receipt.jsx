import React from "react";
import { Check } from "lucide-react";

// Receipts check (5.7): an actual receipt. Zigzag paper in a till-roll face, items with a check box and a quantity
// column that prints "x1" when ticked, "None of these" last behind a dashed rule, a running total, and "Tear it off"
// to hand it in (quiet until something is ticked, then dark with the count).
export function Receipt({ card, texts, picks, locked, onToggle, onDone, tally, kbd, paperRef, voice }) {
  const items = texts.map((text, i) => ({ text, i, none: !!card.options[i].none }));
  const facts = items.filter((x) => !x.none);
  const none = items.filter((x) => x.none);
  const row = ({ text, i, none: isNone }) => {
    const on = picks.includes(i);
    return (
      <button
        type="button"
        key={`${card.id}-${i}`}
        className={`pc-receipt__row${on ? " is-on" : ""}${isNone ? " pc-receipt__row--none" : ""}`}
        aria-pressed={on}
        disabled={locked}
        onClick={(e) => onToggle(i, e)}
        data-index={i}
      >
        <span className="pc-receipt__box" aria-hidden="true">{on ? <Check size={15} strokeWidth={3} /> : null}</span>
        <span className="pc-receipt__text">{text}</span>
        <span className="pc-receipt__qty" aria-hidden="true">{on && !isNone ? "x1" : ""}</span>
        {kbd && i < 9 ? <kbd className="pc-kbd" aria-hidden="true">{i + 1}</kbd> : null}
      </button>
    );
  };
  return (
    <div className="pc-receipt-wrap">
      <div className="pc-receipt-shade">
      <div className="pc-receipt" ref={paperRef}>
        <p className="pc-receipt__head" aria-hidden="true">
          <span>{voice === "heart" ? "What's true, lately" : "Receipts. Right now."}</span>
        </p>
        <div className="pc-receipt__items" role="group" aria-label="Tap every one that is true">
          {facts.map(row)}
          {none.length ? <div className="pc-receipt__rule" aria-hidden="true" /> : null}
          {none.map(row)}
        </div>
        <p className="pc-receipt__total" aria-live="polite">
          <span>Total</span>
          <span className="pc-receipt__count"><span className="pc-sr">{tally} tapped. </span><span aria-hidden="true">{tally}</span></span>
        </p>
      </div>
      </div>
      <div className="pc-done" data-part="persona-done">
        <button type="button" className={`pc-primary pc-primary--tear${picks.length ? " is-ready" : ""}`} disabled={locked} onClick={onDone}>
          Tear it off
          {tally > 0 ? <span className="pc-tear__count" aria-hidden="true">{tally}</span> : null}
          {kbd ? <kbd className="pc-kbd pc-kbd--on-deep" aria-hidden="true">Enter</kbd> : null}
        </button>
      </div>
    </div>
  );
}
