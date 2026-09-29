// Story 4, your map (round 2, VISUAL-JUDGE-CODEX-R2 screen 11): the six leans as six labelled opposing pairs, each a
// glass rod with the two poles at its ends and a lit bead where you land. The pole you lean to is bright and large,
// the other sits dim at the far end; the rod glows from the middle toward your side, longer when the lean is
// stronger. People above, life below. A flex lean keeps its bead in the middle with a double halo; an unfinished one
// is a hollow bead. No numbers (the result carries no scores). Every row is a list item with a plain sentence for
// screen readers; the rods are decoration.
import React from "react";
import { UI_COPY } from "../stories/story-data.js";

function sentence(row) {
  if (row.unfinished) return `${row.left} or ${row.right}: ${UI_COPY.mapOpen}.`;
  if (row.flex) return `${UI_COPY.mapBetween} ${row.left} and ${row.right}.`;
  const lead = row.side === "left" ? row.left : row.right;
  const other = row.side === "left" ? row.right : row.left;
  return `${lead} ${UI_COPY.mapOver} ${other}.`;
}

function Pair({ row, i }) {
  const leanLeft = row.side === "left";
  const state = row.unfinished ? "open" : row.flex ? "flex" : "lean";
  // The lit part of the rod runs from the middle to the bead.
  const from = Math.min(50, row.pos);
  const to = Math.max(50, row.pos);
  return (
    <li className="rv-pair" data-state={state} data-side={row.side} style={{ "--i": i, "--pos": `${row.pos}%`, "--from": `${from}%`, "--to": `${to}%` }}>
      <span className="sr-only">{sentence(row)}</span>
      <span className="rv-pair__poles" aria-hidden="true">
        <b className={state === "lean" && leanLeft ? "is-lead" : ""}>{row.left}</b>
        <b className={state === "lean" && !leanLeft ? "is-lead" : ""}>{row.right}</b>
      </span>
      <span className="rv-pair__rod" aria-hidden="true">
        <i className="rv-pair__glass" />
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
