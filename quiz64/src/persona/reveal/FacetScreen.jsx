// Story 4, your map (DESIGN-DIRECTION 5.12): the facet, a gem cut by your six leans. People above the waterline,
// life below; at each spoke tip the pole you lean to, with the other under it. No numbers. "Read it as a list" swaps
// the gem for six plain rows; the list is always in the DOM for screen readers.
import React, { useState } from "react";
import { Facet, geometry } from "../../art/index.js";
import { UI_COPY } from "../stories/story-data.js";

function Labels({ facet, size }) {
  const g = geometry.facetGeometry(facet, size);
  const byKey = Object.fromEntries(facet.map((a) => [a.key, a]));
  return g.labels.map((l) => {
    const v = g.vertices.find((x) => x.key === l.key) || {};
    const a = byKey[l.key] || {};
    const soft = !v.lead;
    const lead = soft ? a.minus : v.lead;
    const other = soft ? a.plus : v.other;
    return (
      <span key={l.key} className={`rv-facet__label${soft ? " is-soft" : ""}`} data-anchor={l.anchor} data-upper={l.upper ? "true" : "false"}
        style={{ left: l.x, top: l.y }}>
        <b>{lead}</b>
        <i>{other}</i>
      </span>
    );
  });
}

function Row({ row }) {
  const lead = row.side === "left" ? row.left : row.right;
  const other = row.side === "left" ? row.right : row.left;
  if (row.unfinished) return <li><b>{row.left}</b> <span>{UI_COPY.mapBetween.toLowerCase()}</span> <b>{row.right}</b>, <span>{UI_COPY.mapOpen}</span></li>;
  if (row.flex) return <li><span>{UI_COPY.mapBetween}</span> <b>{row.left}</b> <span>and</span> <b>{row.right}</b></li>;
  return <li><b>{lead}</b> <span>{UI_COPY.mapOver}</span> <i>{other}</i></li>;
}

export function FacetScreen({ s, stage }) {
  const [list, setList] = useState(false);
  const size = Math.round(Math.max(220, Math.min(stage.w * 0.82, stage.h * 0.44, 380)));
  return (
    <div className="rv-body rv-body--map" data-list={list ? "true" : "false"}>
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <div className="rv-facet rv-in" style={{ width: size, height: size }} aria-hidden="true">
        <span className="rv-facet__glow" />
        <span className="rv-facet__art"><Facet axes={s.facet} size={size} theme="night" /></span>
        <span className="rv-facet__sweep" style={{ clipPath: `path("${geometry.facetGeometry(s.facet, size).path}")` }} />
        <Labels facet={s.facet} size={size} />
      </div>
      <div className="rv-maplist" id="rv-maplist">
        {s.groups.map((g) => (
          <div key={g.label} className="rv-maplist__group">
            <p className="rv-maplist__label">{g.label}</p>
            <ul>{g.rows.map((r) => <Row key={r.key} row={r} />)}</ul>
          </div>
        ))}
      </div>
      {s.caption && <p className="rv-caption rv-in">{s.caption}</p>}
      <button type="button" className="rv-textbtn rv-in" aria-expanded={list} aria-controls="rv-maplist" onClick={() => setList((x) => !x)}>
        {list ? UI_COPY.mapGem : UI_COPY.mapList}
      </button>
    </div>
  );
}
