// Story 4, your map (DESIGN-DIRECTION 5.12): the facet, a gem cut by your six leans. People above the waterline,
// life below; at each spoke tip the pole you lean to, large, with the other pole under it. No numbers (the result
// carries no scores). The gem is drawn here, simpler than the share-image jewel: one clear fill and a strong outline,
// so the shape reads at 390 px. "Read it as a list" swaps the gem for six plain rows; the list is always in the DOM
// for screen readers.
import React, { useId, useState } from "react";
import { geometry } from "../../art/index.js";
import { v } from "../../art/palette.js";
import { UI_COPY } from "../stories/story-data.js";

// Room each side label needs beyond its spoke tip, in px (a seven-letter pole word at the label size).
const LABEL_W = 86;
const LABEL_GAP = 12;

// Gem size for a stage: the side labels must fit inside the stage beside the upper and lower spoke tips.
export function mapSize(stage) {
  const half = Math.min(stage.w - 24, 440) / 2;
  const byWidth = (half - LABEL_GAP - LABEL_W) / (0.866 * 0.36);
  return Math.round(Math.max(220, Math.min(byWidth, stage.h * 0.42, 400)));
}

function MapGem({ facet, size }) {
  const rid = useId().replace(/:/g, "");
  const g = geometry.facetGeometry(facet, size);
  const [cx, cy] = g.center;
  const ring = (reach) => g.spokes.map((s, i) => `${i ? "L" : "M"}${(cx + (s.tip[0] - cx) * reach).toFixed(1)},${(cy + (s.tip[1] - cy) * reach).toFixed(1)}`).join(" ") + " Z";
  const white = v("c-on-deep");
  const line = v("n-ink-3");
  return (
    <svg className="rv-gem" data-art="facet" data-theme="night" viewBox={`0 0 ${size} ${size}`} width={size} height={size} overflow="visible" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${rid}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={v("n-violet")} stopOpacity="0.75" />
          <stop offset="1" stopColor={v("c-violet")} stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={line}>
        <path d={ring(1)} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="2 5" strokeLinecap="round" />
        <path d={ring(0.28)} strokeOpacity="0.35" strokeWidth="1" />
        <line x1={g.waterline[0][0]} y1={cy} x2={g.waterline[1][0]} y2={cy} strokeOpacity="0.6" strokeWidth="1" strokeDasharray="6 5" />
        {g.spokes.map((s) => <line key={s.key} x1={cx} y1={cy} x2={s.tip[0]} y2={s.tip[1]} strokeOpacity="0.5" strokeWidth="1" />)}
        {g.spokes.map((s) => <circle key={`t${s.key}`} cx={s.tip[0]} cy={s.tip[1]} r="2.6" fill={line} stroke="none" />)}
      </g>
      <path data-part="gem" d={g.path} fill={`url(#${rid}-fill)`} stroke={white} strokeWidth="3" strokeLinejoin="round" />
      <g fill={white} stroke={v("c-violet")} strokeWidth="2">
        {g.vertices.map((vx) => (vx.double
          ? vx.double.map(([x, y], i) => <circle key={`${vx.key}-${i}`} cx={x} cy={y} r="4" />)
          : <circle key={vx.key} cx={vx.x} cy={vx.y} r="5.5" />))}
      </g>
    </svg>
  );
}

// Pole labels sit just outside each spoke tip: above the top spoke, below the bottom one, beside the four others.
function Labels({ facet, size }) {
  const g = geometry.facetGeometry(facet, size);
  const byKey = Object.fromEntries(facet.map((a) => [a.key, a]));
  return g.spokes.map((sp) => {
    const vx = g.vertices.find((x) => x.key === sp.key) || {};
    const a = byKey[sp.key] || {};
    const soft = !vx.lead;
    const cos = Math.cos((sp.angle * Math.PI) / 180);
    const anchor = Math.abs(cos) < 0.2 ? "middle" : cos > 0 ? "start" : "end";
    const upper = sp.angle > 0 && sp.angle < 180;
    const dx = anchor === "start" ? LABEL_GAP : anchor === "end" ? -LABEL_GAP : 0;
    const dy = anchor === "middle" ? (upper ? -LABEL_GAP : LABEL_GAP) : 0;
    return (
      <span key={sp.key} className={`rv-facet__label${soft ? " is-soft" : ""}`} data-anchor={anchor} data-upper={upper ? "true" : "false"}
        style={{ left: sp.tip[0] + dx, top: sp.tip[1] + dy }}>
        <b>{soft ? a.minus : vx.lead}</b>
        <i>{soft ? a.plus : vx.other}</i>
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
  const size = mapSize(stage);
  return (
    <div className="rv-body rv-body--map" data-list={list ? "true" : "false"}>
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <div className="rv-facet rv-in" style={{ width: size, height: size }} aria-hidden="true">
        <span className="rv-facet__glow" />
        <span className="rv-facet__art"><MapGem facet={s.facet} size={size} /></span>
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
