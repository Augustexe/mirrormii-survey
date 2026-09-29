// Story 10, Genii's calls (round 2, LAUNCH-SPEC 21 and 23; G6 redesign, DESIGN-DIRECTION section 8 D11): the eight
// guesses Genii locked before the final cards, in the order they were played, each a pane of glass named by its scene.
// The panes arrive face down and flip into place one by one: a call Genii got exactly turns clear and lit with a glint
// and the end of the stat it called; a call where Genii had the right side but not the exact move turns half clear
// ("Right side", an honest partial that never counts as a hit); a surprise turns frosted and a hairline crack draws
// across it; a pass or a skipped card stays dim. Genii sits by the one number the result allows and its face reacts to
// the tally. Nothing shows what the player answered: only whether the locked guess matched.
import React from "react";
import { Check } from "lucide-react";
import { GeniiLight } from "../../system/index.js";

// The crack drawn over a surprised pane: a hairline from the top-right corner, through the pane's mark, fading out
// before the title, with a short branch; seeded per pane so no two cracks match. 100 x 100 box, right side only.
function crack(i) {
  const x0 = 70 + ((i * 13) % 18);
  const y1 = 44 + ((i * 17) % 20);
  return {
    main: `M${x0} -2 L${x0 + 6} 14 L${x0 - 4} 26 L${x0 + 10} ${y1} L102 ${y1 + 18}`,
    branch: `M${x0 - 4} 26 L${x0 - 16} 34 L${x0 - 24} 32`,
  };
}

function PaneMark({ status, near }) {
  if (status === "hit") return <span className="rv-call__mark" aria-hidden="true"><Check size={14} strokeWidth={3} /></span>;
  if (near) return <span className="rv-call__mark rv-call__mark--half" aria-hidden="true"><i /></span>;
  if (status === "miss") return <span className="rv-call__mark rv-call__mark--miss" aria-hidden="true"><svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 3.5 L5.5 6 L4.5 8.5 L10 10" /></svg></span>;
  return <span className="rv-call__mark rv-call__mark--dim" aria-hidden="true" />;
}

function srLine(r) {
  const title = r.title || r.topic || "A card";
  if (r.status === "hit") return `${title}: Genii called it exactly${r.side ? `, ${r.side}` : ""}.`;
  if (r.near) return `${title}: Genii had the right side but not the exact answer.`;
  if (r.status === "miss") return `${title}: you surprised Genii.`;
  if (r.status === "pass") return `${title}: Genii passed on this one.`;
  return `${title}: skipped.`;
}

export function CallsScreen({ s, onGuesses }) {
  const state = (r) => (r.status === "hit" ? "hit" : r.near ? "near" : r.status === "miss" ? "miss" : "dim");
  return (
    <div className="rv-body rv-body--calls" data-tally={s.called ? Math.round((s.exact / s.called) * 4) : 0}>
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <div className="rv-calls__hero rv-in">
        <span className="rv-calls__genii" aria-hidden="true">
          <i className="rv-calls__halo" />
          <GeniiLight size="m" mood="sure" evolution={1} expression={s.face || "happy"} voice="cards" className="rv-calls__slime" />
        </span>
        {s.called > 0 ? (
          <p className="rv-calls__score"><strong>{s.exact}</strong><span> of {s.called}</span> <em>{s.of}</em></p>
        ) : null}
      </div>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ol className="rv-calls" aria-label={s.intro}>
        {s.rows.map((r, i) => {
          const c = crack(i + 1);
          return (
            <li key={r.key} className={`rv-call rv-call--${r.status}`} data-state={state(r)} style={{ "--i": i }}>
              <span className="sr-only">{srLine(r)}</span>
              <span className="rv-call__glass" aria-hidden="true">
                <span className="rv-call__top">
                  <b className="rv-call__n">{i + 1}</b>
                  <PaneMark status={r.status} near={r.near} />
                </span>
                <span className="rv-call__title">{r.title || r.topic}</span>
                <span className="rv-call__foot">
                  <span className="rv-call__status">{r.shown || r.label}</span>
                  {r.status === "hit" && r.side ? <span className="rv-call__side">{r.side}</span> : null}
                </span>
                {state(r) === "miss" ? (
                  <svg className="rv-call__crack" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                    <path d={c.main} pathLength="1" />
                    <path d={c.branch} pathLength="1" />
                  </svg>
                ) : null}
                <span className="rv-call__glint" />
              </span>
            </li>
          );
        })}
      </ol>
      {onGuesses ? <button type="button" className="rv-textbtn rv-calls__more rv-in" onClick={onGuesses}>{s.more}</button> : null}
    </div>
  );
}
