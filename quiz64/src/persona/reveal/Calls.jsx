// Story 10, Genii's calls (round 2, LAUNCH-SPEC 21 "How Genii read you" and 23): the guesses Genii locked before the
// final cards, as panes of glass. A called pane is clear and lit and names the side Genii guessed; a missed pane stays
// frosted; a pass (Genii held back on a side that was still open) is dim. The count is the one number the result
// allows. Nothing shows what the player answered: only whether the locked guess matched.
import React from "react";
import { Check } from "lucide-react";
import { LockPane } from "../../art/index.js";

const PANE = { hit: "hit", miss: "miss", pass: "pass" };

export function CallsScreen({ s, onGuesses }) {
  return (
    <div className="rv-body rv-body--calls">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      {s.called > 0 ? (
        <p className="rv-calls__score rv-in"><strong>{s.exact}</strong><span> of {s.called}</span> <em>{s.of}</em></p>
      ) : null}
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <p className="rv-calls__intro rv-in">{s.intro}</p>
      <ol className="rv-calls">
        {s.rows.map((r, i) => (
          <li key={r.key} className={`rv-call rv-call--${r.status}`} style={{ "--i": i }}>
            <span className="rv-call__pane" aria-hidden="true"><LockPane state={PANE[r.status] || "frosted"} size={30} /></span>
            <span className="rv-call__text">
              <span className="rv-call__topic">{r.topic}</span>
              <span className="rv-call__status">{r.status === "hit" ? <Check size={12} strokeWidth={2.5} aria-hidden="true" /> : null}{r.label}</span>
              {r.side ? <em className="rv-call__side">{r.side}</em> : null}
            </span>
            <span className="rv-call__frost" aria-hidden="true" />
          </li>
        ))}
      </ol>
      {onGuesses ? <button type="button" className="rv-textbtn rv-in" onClick={onGuesses}>{s.more}</button> : null}
    </div>
  );
}
