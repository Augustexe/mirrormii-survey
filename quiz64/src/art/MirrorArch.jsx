// A-01: the World Mirror (GDD v0.2 section 3.4, LAUNCH-SPEC 25 items 1 and 2). A tall oval of clear glass in an
// iridescent opal frame on a round marble plinth. The frame is the canon render (public/assets/island/mirror-frame-*),
// laid over a code-drawn opal ring and plinth of the same shape, so the mirror is whole before the image arrives and
// if it never does. Inside the glass: the room the mirror looks into (mirror-inside-*), Genii's light, then the shards.
//
// The mechanic stays: answers become shards that rebuild the mirror. The glass is cut into a seeded mosaic; a shard not
// yet earned is frosted over, an earned one is clear glass with an opal edge (never colored stained glass), and the
// newest ones carry data-fresh so a screen can play their arrival (system.css, motion on only).
// Animation hooks for screens: [data-part="glow" | "light" | "cells" | "sweep" | "fog" | "frame"], and every earned
// cell carries data-index. Fog and glow are plain opacity, so they tween cheaply. The export keeps its old name
// (MirrorArch) so every screen and test reads the new mirror without a rename.
import { useId, useMemo } from "react";
import { archPath, mosaic } from "./geometry.js";
import { OPAL, v } from "./palette.js";
import { Svg, safeId } from "./Svg.jsx";
import { ISLAND, MIRROR } from "./world.js";

const W = MIRROR.w;
const H = MIRROR.h;
const F = MIRROR.frame;
const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));

// The code-drawn frame (ring and two plinth discs) in glass units; also the fallback under the render.
export function OpalFrame({ rid }) {
  const u = (k) => `url(#${rid}-${k})`;
  const ringPad = MIRROR.ring / 2;
  return (
    <g data-part="frame-code">
      <defs>
        <linearGradient id={`${rid}-opal`} x1="0" y1="0" x2="1" y2="1">
          {OPAL.ring.map((c, i) => <stop key={i} offset={i / (OPAL.ring.length - 1)} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${rid}-marble`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={OPAL.marble.hi} />
          <stop offset="1" stopColor={OPAL.marble.lo} />
        </linearGradient>
      </defs>
      <ellipse cx={W / 2} cy="240" rx="79.5" ry="8" fill={OPAL.marble.side} />
      <rect x="-29.5" y="224" width="159" height="16" fill={u("marble")} />
      <ellipse cx={W / 2} cy="224" rx="79.5" ry="8" fill={OPAL.marble.top} />
      <ellipse cx={W / 2} cy="219" rx="68" ry="7" fill={OPAL.marble.side2} />
      <rect x="-18" y="207" width="136" height="12" fill={u("marble")} />
      <ellipse cx={W / 2} cy="207" rx="68" ry="7" fill={OPAL.marble.top2} />
      <path d={archPath(W + MIRROR.ring, H + MIRROR.ring)} transform={`translate(${-ringPad} ${-ringPad})`} fill="none" stroke={u("opal")} strokeWidth={MIRROR.ring - 1} />
      <path d={archPath(W + MIRROR.ring * 2 - 1, H + MIRROR.ring * 2 - 1)} transform={`translate(${-MIRROR.ring + 0.5} ${-MIRROR.ring + 0.5})`} fill="none" stroke={OPAL.marble.hi} strokeOpacity="0.9" strokeWidth="0.8" />
      <path d={archPath(W, H)} fill="none" stroke={OPAL.rim} strokeWidth="1.1" />
    </g>
  );
}

// world: the picture inside the glass. Leave it out for the room the mirror looks into, pass a URL for another one, or
// false for bare glass. frame: false leaves the render out (the code frame alone). seams: "dark" draws the shard lines in
// deep violet so the mosaic reads on a pale page before any shard is earned. mullion is accepted for old call sites and
// ignored (the World Mirror has none).
export function MirrorArch({ seed, filled = [], fog = 0, glow = 0.6, mullion = false, size = 320, className, fresh = 0, seams = "light", world, frame = true }) {
  const rid = safeId(useId(), "arch");
  const count = Math.max(filled.length, 40);
  const cells = useMemo(() => mosaic(seed ?? "mirror", count, { w: W, h: H }).cells, [seed, count]);
  const lines = useMemo(() => cells.map((c) => c.path).join(" "), [cells]);
  const glassPx = (size * W) / F.w;
  const inside = world === false ? null : world || ISLAND.inside.pick(glassPx);
  const outline = archPath(W, H);
  const f = clamp01(fog);
  const g = clamp01(glow);
  const u = (k) => `url(#${rid}-${k})`;
  const white = v("c-on-deep");
  const frost = v("c-canvas-2");

  return (
    <Svg viewBox={`${F.x} ${F.y} ${F.w} ${F.h}`} width={size} height={(size * F.h) / F.w} className={className} overflow="visible" data-art="mirror-arch" data-filled={filled.length}>
      <defs>
        <clipPath id={`${rid}-clip`}>
          <path d={archPath(W + 3, H + 3)} transform="translate(-1.5 -1.5)" />
        </clipPath>
        <radialGradient id={`${rid}-halo`}>
          <stop offset="0" stopColor={v("c-violet")} stopOpacity="0.46" />
          <stop offset="0.5" stopColor={v("c-violet-300")} stopOpacity="0.24" />
          <stop offset="1" stopColor={v("c-violet-300")} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={OPAL.glass[0]} />
          <stop offset="0.55" stopColor={OPAL.glass[1]} />
          <stop offset="1" stopColor={OPAL.glass[2]} />
        </linearGradient>
        <radialGradient id={`${rid}-light`} cx="0.5" cy="0.4" r="0.55">
          <stop offset="0" stopColor={white} stopOpacity="0.9" />
          <stop offset="0.3" stopColor={white} stopOpacity="0.35" />
          <stop offset="1" stopColor={white} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rid}-frost`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={white} stopOpacity="0.78" />
          <stop offset="1" stopColor={frost} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${rid}-shard`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={white} stopOpacity="0.34" />
          <stop offset="0.45" stopColor={white} stopOpacity="0.02" />
          <stop offset="1" stopColor={white} stopOpacity="0.14" />
        </linearGradient>
        <linearGradient id={`${rid}-edge`} x1="0" y1="0" x2="1" y2="1">
          {OPAL.edge.map((c, i) => <stop key={i} offset={[0, 0.35, 0.65, 1][i]} stopColor={c} />)}
        </linearGradient>
        <linearGradient id={`${rid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={white} stopOpacity="0" />
          <stop offset="0.5" stopColor={white} stopOpacity="0.6" />
          <stop offset="1" stopColor={white} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${rid}-fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v("mirror-silver-1")} stopOpacity="0.9" />
          <stop offset="1" stopColor={white} stopOpacity="0.96" />
        </linearGradient>
      </defs>

      <ellipse data-part="glow" cx={W / 2} cy={H * 0.46} rx={W * 0.95} ry={H * 0.62} fill={u("halo")} opacity={g} />
      <OpalFrame rid={rid} />

      <g clipPath={u("clip")}>
        <rect x="-2" y="-2" width={W + 4} height={H + 4} fill={u("glass")} />
        {inside ? <image data-part="world" href={inside} x="-2" y="-2" width={W + 4} height={H + 4} preserveAspectRatio="xMidYMid slice" /> : null}
        <rect data-part="light" x="0" y="0" width={W} height={H} fill={u("light")} opacity={0.15 + 0.4 * g} />
        <g data-part="cells">
          {cells.map((cell, i) => {
            const shard = filled[i];
            if (!shard) return <path key={cell.index} d={cell.path} fill={u("frost")} />;
            const isFresh = fresh > 0 && i >= filled.length - fresh;
            return (
              <path key={cell.index} data-index={cell.index} data-fresh={isFresh ? "true" : undefined} style={isFresh ? { "--fresh-i": i - (filled.length - fresh) } : undefined}
                d={cell.path} fill={u("shard")} stroke={u("edge")} strokeWidth="0.55" strokeOpacity={shard.skipped ? 0.3 : 0.55} strokeLinejoin="round" />
            );
          })}
        </g>
        {seams === "dark" ? <path d={lines} fill="none" stroke={v("c-violet-text")} strokeOpacity="0.28" strokeWidth="0.7" strokeLinejoin="round" /> : null}
        {/* Hairline seams: clear where the mirror is whole again, a touch stronger over the frost still to rebuild. */}
        <path d={lines} fill="none" stroke={white} strokeOpacity={filled.length >= count ? 0.18 : 0.4} strokeWidth="0.3" strokeLinejoin="round" />
        <path data-part="sweep" d="M8,-4 L30,-4 L-4,210 L-26,210 Z" fill={u("sweep")} opacity="0.5" />
        <g data-part="fog" opacity={f}>
          <rect x="0" y="0" width={W} height={H} fill={u("fog")} />
          <ellipse cx="30" cy="70" rx="34" ry="16" fill={white} opacity="0.5" />
          <ellipse cx="70" cy="136" rx="38" ry="17" fill={white} opacity="0.45" />
          <ellipse cx="46" cy="172" rx="30" ry="12" fill={v("c-violet-100")} opacity="0.6" />
        </g>
      </g>
      <path d={outline} fill="none" stroke={white} strokeOpacity="0.7" strokeWidth="0.6" />

      {frame ? <image data-part="frame" href={ISLAND.frame.pick(size)} x={F.x} y={F.y} width={F.w} height={F.h} preserveAspectRatio="none" /> : null}
    </Svg>
  );
}
