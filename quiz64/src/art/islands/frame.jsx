// A-03 shared island frame: the floating glass-pastel island, its aura, the still water and the
// reflection. Each chapter file adds its objects as { box, hero(P), rest(P) } in a 320 x 320 box.
import { tint, tintDeep, v } from "../palette.js";
import { ISLAND_BODY, ISLAND_CRACKS, ISLAND_DROP, ISLAND_FACETS, ISLAND_TOP, ISLAND_WATER_Y, star } from "../shapes.js";

// Paints handed to every scene: token colors plus gradient urls scoped to this instance.
export function paints(chapter, rid) {
  const u = (k) => `url(#${rid}-${k})`;
  return {
    rid,
    t: tint(chapter),
    d: tintDeep(chapter),
    w: v("c-on-deep"),
    v: v("c-violet"),
    v3: v("c-violet-300"),
    v1: v("c-violet-100"),
    s1: v("mirror-silver-1"),
    s2: v("mirror-silver-2"),
    warm: v("tint-ch4"),
    wd: v("tint-ch4-deep"),
    o: u("o"),
    od: u("d"),
    g: u("g"),
    l: u("l"),
    m: u("m"),
  };
}

const Stop = ({ o, c, a = 1 }) => <stop offset={o} stopColor={c} stopOpacity={a} />;

export function IslandDefs({ P, ambient }) {
  const id = (k) => `${P.rid}-${k}`;
  return (
    <defs>
      <radialGradient id={id("a")}>
        <Stop o="0" c={P.t} a="0.62" />
        <Stop o="0.55" c={P.t} a="0.2" />
        <Stop o="1" c={P.t} a="0" />
      </radialGradient>
      <linearGradient id={id("t")} x1="0" y1="0" x2="0" y2="1">
        <Stop o="0" c={P.w} />
        <Stop o="0.45" c={P.t} a="0.75" />
        <Stop o="1" c={P.t} />
      </linearGradient>
      <linearGradient id={id("b")} x1="0" y1="0" x2="0" y2="1">
        <Stop o="0" c={P.t} />
        <Stop o="0.5" c={P.d} a="0.55" />
        <Stop o="1" c={P.v} a="0.55" />
      </linearGradient>
      <linearGradient id={id("r")} x1="0" y1="0" x2="1" y2="0">
        <Stop o="0" c={P.w} a="0.2" />
        <Stop o="0.3" c={P.w} />
        <Stop o="0.7" c={P.w} a="0.85" />
        <Stop o="1" c={P.w} a="0.1" />
      </linearGradient>
      <linearGradient id={id("o")} x1="0.2" y1="0" x2="0.6" y2="1">
        <Stop o="0" c={P.w} />
        <Stop o="0.55" c={P.t} a="0.9" />
        <Stop o="1" c={P.t} />
      </linearGradient>
      <linearGradient id={id("d")} x1="0" y1="0" x2="0.4" y2="1">
        <Stop o="0" c={P.t} />
        <Stop o="1" c={P.d} a="0.85" />
      </linearGradient>
      <linearGradient id={id("g")} x1="0" y1="0" x2="0.8" y2="1">
        <Stop o="0" c={P.w} a="0.95" />
        <Stop o="0.5" c={P.w} a="0.4" />
        <Stop o="1" c={P.v3} a="0.5" />
      </linearGradient>
      <radialGradient id={id("l")}>
        <Stop o="0" c={P.w} />
        <Stop o="0.25" c={P.w} a="0.85" />
        <Stop o="0.55" c={P.t} a="0.45" />
        <Stop o="1" c={P.t} a="0" />
      </radialGradient>
      <radialGradient id={id("m")}>
        <Stop o="0" c={P.warm} />
        <Stop o="0.35" c={P.warm} a="0.6" />
        <Stop o="1" c={P.warm} a="0" />
      </radialGradient>
      <linearGradient id={id("h")} x1="0" y1="0" x2="1" y2="0">
        <Stop o="0" c={P.v3} a="0" />
        <Stop o="0.5" c={P.v3} a="0.9" />
        <Stop o="1" c={P.v3} a="0" />
      </linearGradient>
      <linearGradient id={id("f")} gradientUnits="userSpaceOnUse" x1="0" y1={ISLAND_WATER_Y} x2="0" y2="320">
        <Stop o="0" c={P.w} a="0.9" />
        <Stop o="1" c={P.w} a="0" />
      </linearGradient>
      <mask id={id("k")}>
        <rect x="0" y={ISLAND_WATER_Y} width="320" height={320 - ISLAND_WATER_Y} fill={`url(#${id("f")})`} />
      </mask>
      {ambient ? (
        <filter id={id("s")}>
          <feFlood floodColor={P.d} />
          <feComposite in2="SourceAlpha" operator="in" />
        </filter>
      ) : null}
    </defs>
  );
}

// Contact shadow under an object standing on the island.
export const Shadow = ({ P, x, y, rx, ry = rx * 0.22 }) => <ellipse cx={x} cy={y} rx={rx} ry={ry} fill={P.d} opacity="0.2" />;
export const Star = ({ x, y, r, fill, o = 1 }) => <path d={star(x, y, r)} fill={fill} opacity={o} />;

function IslandBase({ P }) {
  return (
    <g data-part="island">
      <ellipse cx="160" cy="246" rx="124" ry="34" fill={`url(#${P.rid}-a)`} />
      <path d={ISLAND_BODY} fill={`url(#${P.rid}-b)`} />
      <path d={ISLAND_FACETS} fill={P.w} opacity="0.2" />
      <path d={ISLAND_CRACKS} fill="none" stroke={P.w} strokeOpacity="0.55" strokeWidth="0.9" strokeLinecap="round" />
      <path d={ISLAND_DROP} fill={P.g} stroke={P.w} strokeWidth="0.8" strokeOpacity="0.8" />
      <path d="M124,246 L128,252 L124,262 L120,252 Z M196,246 L200,251 L196,259 L192,251 Z" fill={P.g} opacity="0.85" />
      <path d={ISLAND_TOP} fill={`url(#${P.rid}-t)`} />
      <ellipse cx="160" cy="183" rx="100" ry="13" fill={P.w} opacity="0.3" />
      <path d={ISLAND_TOP} fill="none" stroke={`url(#${P.rid}-r)`} strokeWidth="1.6" />
      <path d="M58,196 C90,206 140,209 172,209" fill="none" stroke={P.w} strokeOpacity="0.7" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

// The full scene: aura, sky sparkles, water and reflection, island, objects.
export function IslandArt({ P, scene, reflect = true, bare = false }) {
  const W = ISLAND_WATER_Y;
  if (bare) {
    return (
      <>
        <IslandBase P={P} />
        {scene.rest(P)}
        {scene.hero(P)}
      </>
    );
  }
  return (
    <>
      <ellipse data-part="aura" cx="160" cy="160" rx="158" ry="148" fill={`url(#${P.rid}-a)`} />
      <g data-part="sparkles">
        <Star x={44} y={58} r={5} fill={P.w} o={0.9} />
        <Star x={286} y={40} r={4} fill={P.w} o={0.8} />
        <Star x={272} y={150} r={3} fill={P.d} o={0.35} />
        <Star x={30} y={150} r={3.5} fill={P.w} o={0.85} />
        <circle cx="120" cy="30" r="1.6" fill={P.w} />
        <circle cx="206" cy="24" r="1.2" fill={P.d} opacity="0.35" />
      </g>
      <g data-part="water">
        <path d={`M14,${W} H306`} stroke={`url(#${P.rid}-h)`} strokeWidth="1.3" />
        <path d={`M92,${W + 9} H132 M178,${W + 9} H236 M120,${W + 18} H150 M196,${W + 22} H214`} stroke={P.w} strokeOpacity="0.6" strokeWidth="1.1" strokeLinecap="round" />
      </g>
      {reflect ? (
        <g data-part="reflection" mask={`url(#${P.rid}-k)`}>
          <g transform={`translate(0,${W * 2}) scale(1,-1)`} opacity="0.34">
            <IslandBase P={P} />
          </g>
        </g>
      ) : null}
      <IslandBase P={P} />
      <g data-part="objects" transform="translate(160 202) scale(1.08) translate(-160 -202)">
        {scene.rest(P)}
        {scene.hero(P)}
      </g>
    </>
  );
}
