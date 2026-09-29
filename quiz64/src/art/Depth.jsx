// Round 2 backdrop depth (LAUNCH-SPEC section 23): the flat glows get a world behind them. Three planes over the
// static gradient, all code-drawn and decorative:
//   far   two small glass islands resting on the horizon, hazy (atmospheric perspective)
//   mid   soft light shafts from the upper left, like sun through frosted glass
//   near  floating glass shards at three depths (small and hazy far, larger and crisp near) plus a few bokeh motes
// Moving only when `animated` (landing, interludes, lock, result): a slow drift (16 to 30 s loops) and, on a fine
// pointer, a small parallax per depth. Card screens get the same planes standing still, so the frosted card sheet
// never re-blurs a moving layer. Reduced motion and Motion off: still. Transform and opacity only (art.css).
import { useEffect, useId, useRef } from "react";
import { v } from "./palette.js";
import { Svg, safeId } from "./Svg.jsx";

// Irregular glass shards in a 40 x 60 box.
const SHAPES = [
  "M6,2 L36,8 L30,58 L2,50 Z",
  "M4,6 L34,2 L38,44 L12,58 Z",
  "M20,1 L38,30 L22,59 L3,26 Z",
  "M2,10 L30,2 L38,52 L16,57 Z",
];

// [left %, top %, width px, rotate deg, depth 1 far to 3 near, shape, color slot a|b|c, drift s]. They keep to the
// screen's edges and the top, so no shard ever sits behind a line of text: near ones large, soft and cut by the
// edge (a foreground out of focus), mid ones crisp, far ones small and hazy.
const SHARDS = [
  [-5, 17, 54, -18, 3, 0, "a", 22],
  [89, 9, 28, 22, 2, 1, "b", 24],
  [92, 38, 60, -26, 3, 2, "c", 20],
  [-4, 57, 24, 12, 2, 3, "a", 26],
  [90, 74, 20, 30, 1, 0, "b", 30],
  [-3, 84, 44, 28, 3, 1, "c", 21],
  [47, 2, 14, 64, 1, 3, "a", 32],
  [70, 95, 16, -8, 1, 2, "b", 28],
];
const MOTES = [[22, 6, 10], [76, 22, 7], [96, 60, 8], [3, 44, 6], [84, 90, 9]];

function Shard({ id, spec, rid }) {
  const [x, y, w, rot, depth, shape, slot, drift] = spec;
  const grad = `${rid}-g${slot}`;
  return (
    <span
      className="bd-shard"
      data-depth={depth}
      style={{ left: `${x}%`, top: `${y}%`, width: w, "--rot": `${rot}deg`, "--drift": `${drift}s`, "--delay": `${-id * 3.7}s`, "--depth": depth }}
    >
      <svg viewBox="0 0 40 60" width={w} height={w * 1.5} aria-hidden="true" focusable="false">
        <path d={SHAPES[shape]} fill={`url(#${grad})`} />
        <path d={SHAPES[shape]} fill="none" stroke={v("c-on-deep")} strokeOpacity="0.85" strokeWidth="1.1" strokeLinejoin="round" />
        <path d={SHAPES[shape]} fill={`url(#${rid}-hi)`} />
      </svg>
    </span>
  );
}

// A far glass island: a lens top and a faceted underside, in a 120 x 70 box.
function FarIsland({ rid, slot }) {
  return (
    <Svg viewBox="0 0 120 70" width="120" height="70" className="bd-far__isle">
      <path d="M8,22 C8,14 34,10 60,10 C86,10 112,14 112,22 C104,40 84,54 60,66 C36,54 16,40 8,22 Z" fill={`url(#${rid}-g${slot})`} />
      <ellipse cx="60" cy="20" rx="52" ry="10" fill={v("c-on-deep")} fillOpacity="0.7" />
      <path d="M26,30 L60,66 L44,30 Z M94,30 L60,66 L76,30 Z" fill={v("c-on-deep")} fillOpacity="0.28" />
    </Svg>
  );
}

export function Depth({ animated = false, night = false, a, b, c }) {
  const rid = safeId(useId(), "depth");
  const root = useRef(null);
  // Fine-pointer parallax: --px and --py (-1 to 1) on the root; each depth moves a little more than the one behind.
  useEffect(() => {
    const el = root.current;
    if (!animated || !el || typeof window === "undefined" || !window.matchMedia?.("(pointer: fine)").matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [animated]);

  const stops = { a, b, c };
  return (
    <div ref={root} className="bd-depth" data-animated={animated ? "true" : "false"} data-night={night ? "true" : "false"} aria-hidden="true">
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
        <defs>
          {Object.entries(stops).map(([k, col]) => (
            <linearGradient key={k} id={`${rid}-g${k}`} x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0" stopColor={v("c-on-deep")} stopOpacity={night ? 0.35 : 0.95} />
              <stop offset="0.55" stopColor={col} stopOpacity={night ? 0.55 : 0.6} />
              <stop offset="1" stopColor={col} stopOpacity={night ? 0.25 : 0.32} />
            </linearGradient>
          ))}
          <linearGradient id={`${rid}-hi`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={v("c-on-deep")} stopOpacity="0.75" />
            <stop offset="0.3" stopColor={v("c-on-deep")} stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="bd-shafts">
        <span className="bd-shaft bd-shaft--a" />
        <span className="bd-shaft bd-shaft--b" />
        <span className="bd-shaft bd-shaft--c" />
      </div>
      <div className="bd-far">
        <span className="bd-far__slot bd-far__slot--l"><FarIsland rid={rid} slot="a" /></span>
        <span className="bd-far__slot bd-far__slot--r"><FarIsland rid={rid} slot="b" /></span>
      </div>
      <div className="bd-near">
        {SHARDS.map((spec, i) => <Shard key={i} id={i} spec={spec} rid={rid} />)}
        {MOTES.map(([x, y, s], i) => <span key={`m${i}`} className="bd-mote" style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, "--delay": `${-i * 2.3}s` }} />)}
      </div>
    </div>
  );
}
