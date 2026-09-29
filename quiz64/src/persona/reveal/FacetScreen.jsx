// Story 4, your map (round 2, VISUAL-JUDGE-CODEX-R2 screen 11): the six leans as six game stats, each a
// glass rod with the two poles at its ends and a lit bead where you land. The pole you lean to is bright and large,
// the other sits dim at the far end; the rod glows from the middle toward your side, longer when the lean is
// stronger. People above, life below. A flex lean keeps its bead in the middle with a double halo; an unfinished one
// is a hollow bead. No numbers (the result carries no scores). Every row is a list item with a plain sentence for
// screen readers; the rods are decoration.
import React from "react";
import { UI_COPY } from "../stories/story-data.js";
import { StatGlyph } from "./StatGlyph.jsx";

// Round 3 (G6, Jerry 2026-09-29 evening): each lean is a game stat (src/persona/stats.js): the stat name with its
// glyph, the two human ends (the first pole of the type code on the left) and the bead where the player lands. Both
// ends are the same size; the one you lean to is lit. Internal pole names never reach the page.
function sentence(row) {
  if (row.unfinished) return `${row.stat}: ${row.a} or ${row.b}, ${UI_COPY.mapOpen}.`;
  if (row.flex) return `${row.stat}: ${UI_COPY.mapBetween} ${row.a} and ${row.b}.`;
  return `${row.stat}: ${row.leadEnd} ${UI_COPY.mapOver} ${row.otherEnd}.`;
}

function Pair({ row, i }) {
  const state = row.unfinished ? "open" : row.flex ? "flex" : "lean";
  const lead = state === "lean" ? row.leadSide : null;
  // The lit part of the rod runs from the middle to the bead.
  const from = Math.min(50, row.at);
  const to = Math.max(50, row.at);
  return (
    <li className="rv-pair" data-state={state} data-side={lead === "a" ? "left" : lead === "b" ? "right" : "none"} data-stat={row.key} style={{ "--i": i, "--pos": `${row.at}%`, "--from": `${from}%`, "--to": `${to}%` }}>
      <span className="sr-only">{sentence(row)}</span>
      <span className="rv-pair__poles" aria-hidden="true">
        <b className={lead === "a" ? "is-lead" : ""}>{row.a}</b>
        <span className="rv-pair__stat"><StatGlyph axis={row.key} size={15} />{row.stat}</span>
        <b className={lead === "b" ? "is-lead" : ""}>{row.b}</b>
      </span>
      <span className="rv-pair__rod" aria-hidden="true">
        <i className="rv-pair__glass" />
        <i className="rv-pair__ticks" />
        <i className="rv-pair__fill" />
        <i className="rv-pair__mid" />
        <i className="rv-pair__bead"><i /></i>
      </span>
    </li>
  );
}

export function MapScreen({ s }) {
  let n = 0;
  return (
    <div className="rv-body rv-body--map">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      {s.sub ? <p className="rv-sub rv-map__sub rv-in">{s.sub}</p> : null}
      <div className="rv-pairs rv-in">
        {s.groups.map((g) => (
          <div key={g.label} className="rv-pairs__group" role="group" aria-label={g.label}>
            <p className="rv-pairs__label">{g.label}</p>
            <ul>{g.rows.map((r) => <Pair key={r.key} row={r} i={n++} />)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// The old name, kept for callers that still import it.
export const FacetScreen = MapScreen;
