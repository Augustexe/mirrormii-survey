// Story 10, Genii's calls (round 2, LAUNCH-SPEC 21 and 23; G6 redesign, DESIGN-DIRECTION section 8 D11; round 3
// light behind the grid and behind each called pane): the eight
// guesses Genii locked before the final cards, in the order they were played, each a pane of glass named by its scene.
// The panes arrive face down and flip into place one by one: a call Genii got exactly turns clear and lit with a glint
// and the end of the stat it called; a call where Genii had the right side but not the exact move turns half clear
// ("Same side", an honest partial that never counts as a hit); a surprise turns frosted with a cracked mark; a pass
// or a skipped card stays dim. A one-line key under the verdict says what each state means. Genii sits by the one
// number the result allows and its face reacts to
// the tally. Nothing shows what the player answered: only whether the locked guess matched.
import React from "react";
import { Check } from "lucide-react";
import { GeniiLight } from "../../system/index.js";
import { Aura } from "./WorldArt.jsx";

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
    <div className="rv-body rv-body--calls" tabIndex="0" data-tally={s.called ? Math.round((s.exact / s.called) * 4) : 0}>
      <Aura className="rv-calls__aura" />
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
      {s.key ? <p className="rv-calls__key rv-in">{s.key}</p> : null}
      <ol className="rv-calls" aria-label={s.intro}>
        {s.rows.map((r, i) => {
          return (
            <li key={r.key} className={`rv-call rv-call--${r.status}`} data-state={state(r)} style={{ "--i": i }}>
              <span className="sr-only">{srLine(r)}</span>
              {/* Round 3: light blooms behind a pane Genii called (and, softer, a same-side pane) as it lands. */}
              <i className="rv-call__bloom" aria-hidden="true" />
              <span className="rv-call__glass" aria-hidden="true">
                <span className="rv-call__top">
                  <b className="rv-call__n">{i + 1}</b>
                  <PaneMark status={r.status} near={r.near} />
                </span>
                {/* A non-breaking hyphen keeps "five-year" whole in the narrow tile. */}
                <span className="rv-call__title">{String(r.title || r.topic).replace(/-/g, "\u2011")}</span>
                <span className="rv-call__foot">
                  {/* A long stat end fills the footer on its own; the check mark and the key already say "Called it". */}
                  <span className={`rv-call__status${r.status === "hit" && r.side && r.side.length > 9 ? " sr-only" : ""}`}>{r.shown || r.label}</span>
                  {r.status === "hit" && r.side ? <span className="rv-call__side">{r.side}</span> : null}
                </span>
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
