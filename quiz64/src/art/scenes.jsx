// Room doors (A-10), the app tablet (A-18) and the facet gem (A-11). Islands live in ./islands and the
// backdrop in ./Backdrop.jsx; both are re-exported here so older imports keep working.
import { useId } from "react";
import { facetGeometry } from "./geometry.js";
import { ROOM_CHAPTER, tint, tintDeep, v } from "./palette.js";
import {
  DOOR_FRAME, DOOR_HEART, DOOR_KNOB, DOOR_KNOCKER_RING, DOOR_LEAF, DOOR_OPENING, DOOR_PANELS, DOOR_PLAQUE, DOOR_VIEWBOX,
  DOOR_WINDOW, DOOR_WINDOW_BARS, TABLET, TABLET_ISLAND, TABLET_SCREEN, TABLET_VIEWBOX, star,
} from "./shapes.js";
import { IslandScene, ISLAND_SCENES } from "./islands/index.jsx";
import { IslandArt, IslandDefs, paints } from "./islands/frame.jsx";
import { Svg, hashString, safeId } from "./Svg.jsx";

export { IslandScene };
export { Backdrop } from "./Backdrop.jsx";

// A-10: room doors. room: love|work|family. Open: the leaf swings ajar around its hinge (a 2D
// scale-and-skew on [data-part="leaf"]; Chrome mis-resolves gradients inside 3D-transformed SVG groups
// when several doors share a page, so no rotateY),
// warm light spills out. Closed: the door shuts and the whole door desaturates to 40%.
export function RoomDoor({ room, open = true, size, className }) {
  const rid = safeId(useId(), `door-${room}`);
  const chapter = ROOM_CHAPTER[room] ?? "extras";
  const t = tint(chapter);
  const d = tintDeep(chapter);
  const w = v("c-on-deep");
  const warm = v("tint-ch4");
  const px = size ?? 112;
  const ease = "var(--d-base, 240ms) var(--e-out, cubic-bezier(.2,.8,.2,1))";
  const u = (k) => `url(#${rid}-${k})`;
  return (
    <Svg
      viewBox={DOOR_VIEWBOX}
      width={px}
      height={(px * 96) / 60}
      className={className}
      overflow="visible"
      data-art="room-door"
      data-room={room}
      data-open={open ? "true" : "false"}
      style={{ filter: open ? "saturate(1)" : "saturate(0.4)", opacity: open ? 1 : 0.78, transition: `filter ${ease}, opacity ${ease}` }}
    >
      <defs>
        <linearGradient id={`${rid}-l`} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor={w} stopOpacity="0.95" />
          <stop offset="0.4" stopColor={t} />
          <stop offset="1" stopColor={t} />
        </linearGradient>
        <linearGradient id={`${rid}-f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={v("mirror-silver-2")} />
          <stop offset="0.3" stopColor={w} />
          <stop offset="0.7" stopColor={v("mirror-silver-1")} />
          <stop offset="1" stopColor={v("mirror-silver-2")} />
        </linearGradient>
        <radialGradient id={`${rid}-i`} cx="0.5" cy="0.62" r="0.7">
          <stop offset="0" stopColor={w} />
          <stop offset="0.45" stopColor={warm} stopOpacity="0.85" />
          <stop offset="1" stopColor={t} />
        </radialGradient>
        <radialGradient id={`${rid}-w`} cx="0.5" cy="0.7">
          <stop offset="0" stopColor={w} />
          <stop offset="0.5" stopColor={warm} />
          <stop offset="1" stopColor={warm} stopOpacity="0.6" />
        </radialGradient>
        <linearGradient id={`${rid}-s`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={warm} stopOpacity="0.8" />
          <stop offset="1" stopColor={warm} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path data-part="spill" d="M9,95 L51,95 L68,108 L-8,108 Z" fill={u("s")} opacity={open ? 1 : 0} style={{ transition: `opacity ${ease}` }} />
      <path d={DOOR_FRAME} fill={u("f")} stroke={d} strokeOpacity="0.35" strokeWidth="0.8" />
      <path d={DOOR_OPENING} fill={u("i")} />
      <path d={`${star(24, 44, 2.6)} ${star(34, 70, 1.8)}`} fill={w} />
      <g
        data-part="leaf"
        style={{ transformBox: "view-box", transformOrigin: "9px 60px", transform: open ? "scale(0.84, 1) skewY(-3deg)" : "none", transition: `transform ${ease}` }}
      >
        <path d={DOOR_LEAF} fill={u("l")} stroke={d} strokeOpacity="0.45" strokeWidth="0.8" />
        {room === "family" ? (
          <>
            <path d="M15,86 L15,60 L45,60 L45,86 Z" fill={w} fillOpacity="0.18" stroke={d} strokeOpacity="0.3" strokeWidth="0.7" />
            <circle cx="30" cy="42" r="12" fill={warm} opacity="0.35" />
            <path d={DOOR_WINDOW} fill={u("w")} stroke={d} strokeOpacity="0.5" strokeWidth="0.8" />
            <path d={DOOR_WINDOW_BARS} stroke={d} strokeOpacity="0.5" strokeWidth="0.9" />
          </>
        ) : (
          <path d={DOOR_PANELS} fill={w} fillOpacity="0.18" stroke={d} strokeOpacity="0.3" strokeWidth="0.7" />
        )}
        {room === "love" ? (
          <>
            <path d={DOOR_KNOCKER_RING} fill="none" stroke={d} strokeOpacity="0.75" strokeWidth="1.3" />
            <path d={DOOR_HEART} fill={d} fillOpacity="0.85" />
            <path d="M26.3,40.5 a1.6,1.6 0 0 1 1.8,-1.4" fill="none" stroke={w} strokeWidth="0.9" strokeLinecap="round" />
          </>
        ) : null}
        {room === "work" ? (
          <>
            <path d={DOOR_PLAQUE} fill={w} fillOpacity="0.9" stroke={d} strokeOpacity="0.55" strokeWidth="0.8" />
            <path d={star(30, 41, 2.6)} fill={d} fillOpacity="0.7" />
            <circle cx="20.5" cy="41" r="0.8" fill={d} opacity="0.6" />
            <circle cx="39.5" cy="41" r="0.8" fill={d} opacity="0.6" />
          </>
        ) : null}
        <path d={DOOR_KNOB} fill={d} />
        <circle cx="41.3" cy="64.3" r="0.9" fill={w} />
        <path d="M11.5,93 V28 A18.5,18.5 0 0 1 22,12" fill="none" stroke={w} strokeOpacity="0.7" strokeWidth="1" strokeLinecap="round" />
      </g>
      <rect x="1" y="94" width="58" height="3" rx="1.5" fill={u("f")} stroke={v("mirror-silver-2")} strokeWidth="0.4" />
    </Svg>
  );
}

// A-18: the app tablet for story 9: a glass phone with the finale island glowing inside (no Miia art).
export function AppTablet({ size, className }) {
  const rid = safeId(useId(), "tab");
  const P = paints("finale", rid);
  const w = size ?? 150;
  const white = v("c-on-deep");
  const u = (k) => `url(#${rid}-${k})`;
  return (
    <Svg viewBox={TABLET_VIEWBOX} width={w} height={w * 2} className={className} overflow="visible" data-art="app-tablet">
      <IslandDefs P={P} />
      <defs>
        <linearGradient id={`${rid}-body`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={white} stopOpacity="0.85" />
          <stop offset="0.45" stopColor={white} stopOpacity="0.25" />
          <stop offset="1" stopColor={v("c-violet-300")} stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`${rid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v("c-violet-300")} />
          <stop offset="0.5" stopColor={v("c-violet-100")} />
          <stop offset="1" stopColor={v("tint-finale")} />
        </linearGradient>
        <radialGradient id={`${rid}-halo`}>
          <stop offset="0" stopColor={v("c-violet")} stopOpacity="0.45" />
          <stop offset="1" stopColor={v("c-violet")} stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${rid}-clip`}>
          <path d={TABLET_SCREEN} />
        </clipPath>
      </defs>
      <ellipse data-part="glow" cx="75" cy="150" rx="118" ry="190" fill={u("halo")} />
      <path d={TABLET} fill={u("body")} stroke={white} strokeWidth="1.6" />
      <path d={TABLET_SCREEN} fill={u("sky")} />
      <g clipPath={u("clip")}>
        <g transform="translate(1.5,96) scale(0.46)">
          <IslandArt P={P} scene={ISLAND_SCENES.finale} />
        </g>
        <circle data-part="light" cx="75" cy="74" r="30" fill={P.l} />
        <path d={`${star(75, 74, 7)} ${star(38, 46, 3)} ${star(114, 60, 2.4)} ${star(108, 238, 2)}`} fill={white} />
        <path data-part="sweep" d="M20,0 L58,0 L-10,300 L-48,300 Z" fill={white} opacity="0.14" />
      </g>
      <path d={TABLET_ISLAND} fill={v("n-700")} opacity="0.35" />
      <path d="M148.5,80 V104 M1.5,70 V84 M1.5,92 V106" stroke={v("mirror-silver-2")} strokeWidth="2" strokeLinecap="round" />
      <path d="M8,40 V24 Q8,8 24,8 H70" fill="none" stroke={white} strokeWidth="1.6" strokeLinecap="round" opacity="0.9" />
    </Svg>
  );
}

// A-11: the facet gem (story 4, share image). People above the waterline, life below; no labels baked
// in (screens set the pole words from `facetGeometry(...).labels`). Hooks: [data-part="sweep"|"spokes"|"gem"].
export function Facet({ axes = [], size = 300, theme = "night", className }) {
  const g = facetGeometry(axes, size);
  const rid = safeId(useId(), `facet-${theme}-${hashString(g.path)}`);
  const k = size / 300;
  const night = theme === "night";
  const line = night ? v("n-ink-3") : v("c-ink-3");
  const white = v("c-on-deep");
  const [cx, cy] = g.center;
  const ring = (reach) => g.spokes.map((s, i) => {
    const x = cx + (s.tip[0] - cx) * reach;
    const y = cy + (s.tip[1] - cy) * reach;
    return `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
  const tri = g.points.map((p, i) => {
    const q = g.points[(i + 1) % g.points.length];
    return `M${cx},${cy} L${p[0]},${p[1]} L${q[0]},${q[1]} Z`;
  });
  const u = (id) => `url(#${rid}-${id})`;
  return (
    <Svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={className} overflow="visible" data-art="facet" data-theme={theme}>
      <defs>
        <linearGradient id={`${rid}-gem`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={v("g-brand-1")} />
          <stop offset="0.45" stopColor={v("g-deep-1")} />
          <stop offset="1" stopColor={v("g-deep-2")} />
        </linearGradient>
        <radialGradient id={`${rid}-glow`}>
          <stop offset="0" stopColor={v("c-violet")} stopOpacity={night ? 0.55 : 0.35} />
          <stop offset="1" stopColor={v("c-violet")} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={white} stopOpacity="0" />
          <stop offset="0.5" stopColor={white} stopOpacity="0.6" />
          <stop offset="1" stopColor={white} stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${rid}-clip`}>
          <path d={g.path} />
        </clipPath>
      </defs>
      <circle data-part="glow" cx={cx} cy={cy} r={g.spokeLength * 1.3} fill={u("glow")} />
      <g data-part="spokes" fill="none" stroke={line}>
        <path d={ring(1)} strokeOpacity="0.4" strokeWidth={1 * k} strokeDasharray={`${1 * k} ${5 * k}`} strokeLinecap="round" />
        <path d={ring(0.28)} strokeOpacity="0.3" strokeWidth={0.8 * k} strokeDasharray={`${2 * k} ${3 * k}`} />
        <line x1={g.waterline[0][0]} y1={cy} x2={g.waterline[1][0]} y2={cy} strokeOpacity="0.55" strokeWidth={1 * k} strokeDasharray={`${5 * k} ${4 * k}`} />
        {g.spokes.map((s) => (
          <line key={s.key} x1={cx} y1={cy} x2={s.tip[0]} y2={s.tip[1]} strokeOpacity="0.45" strokeWidth={1 * k} />
        ))}
        {g.spokes.map((s) => (
          <circle key={`t${s.key}`} cx={s.tip[0]} cy={s.tip[1]} r={2.2 * k} fill={line} fillOpacity="0.7" stroke="none" />
        ))}
      </g>
      <g data-part="gem">
        <path d={g.path} fill={u("gem")} fillOpacity="0.9" />
        {tri.map((d, i) => (
          <path key={i} d={d} fill={white} fillOpacity={[0.2, 0.05, 0.12, 0.02, 0.1, 0.16][i]} />
        ))}
        {g.facetLines.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={white} strokeOpacity="0.3" strokeWidth={1 * k} />
        ))}
        <g clipPath={u("clip")}>
          <path data-part="sweep" d={`M${cx - 60 * k},${cy - 120 * k} L${cx - 30 * k},${cy - 120 * k} L${cx - 70 * k},${cy + 120 * k} L${cx - 100 * k},${cy + 120 * k} Z`} fill={u("sweep")} />
        </g>
        <path d={g.path} fill="none" stroke={white} strokeOpacity="0.8" strokeWidth={1.4 * k} strokeLinejoin="round" />
      </g>
      <g data-part="vertices" fill={white}>
        {g.vertices.map((vx) => (vx.double ? (
          vx.double.map(([x, y], i) => <circle key={`${vx.key}-${i}`} cx={x} cy={y} r={2.4 * k} fillOpacity="0.9" />)
        ) : (
          <path key={vx.key} d={star(vx.x, vx.y, 5.5 * k)} />
        )))}
      </g>
    </Svg>
  );
}
