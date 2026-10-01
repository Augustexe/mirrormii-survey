// Story 6, the thing you didn't know (DESIGN-DIRECTION 5.12): the belief sits above a waterline; the answer to it
// first shows as its own reflection, upside down under the line, then flips upright. A one-sentence insight has no
// split: it sits centered with a slow reflection under it. Reduced motion: both upright, a static ghost under the line.
import React from "react";

export function InsightFlip({ s, active }) {
  const { belief, behavior } = s.parts || { belief: s.line, behavior: null };
  const split = Boolean(behavior);
  return (
    <div className={`rv-body rv-body--insight${split ? " is-split" : " is-single"}`} data-play={active ? "true" : "false"}>
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-insight" data-focus tabIndex="-1">
        <span className="rv-insight__belief rv-in">{belief}</span>
        {split ? <span className="sr-only"> </span> : null}
        <span className="rv-insight__water" aria-hidden="true" />
        {split ? (
          <span className="rv-insight__turn">
            <span className="rv-insight__behavior">{behavior}</span>
          </span>
        ) : (
          <span className="rv-insight__echo" aria-hidden="true">{belief}</span>
        )}
      </h2>
    </div>
  );
}
