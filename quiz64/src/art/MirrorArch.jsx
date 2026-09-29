// A-01: the mirror arch. Silver frame, glass with Genii's light behind it, the run-seeded crack mosaic
// (filled center out, one shard per answer in its chapter tint), a specular sweep, fog and the mullion.
// Animation hooks for screens: [data-part="glow" | "light" | "cells" | "sweep" | "fog" | "mullion"],
// and every cell carries data-index. Fog and glow are plain opacity, so they tween cheaply.
// Inside [data-scene="night"] the glass stops (c-canvas-2, c-canvas) turn to the dark scale, so white
// names read on the panes; in Day they are lavender and near-white.
import { useId, useMemo } from "react";
import { archPath, archMullion, mosaic } from "./geometry.js";
import { chapterKey, v } from "./palette.js";
import { star } from "./shapes.js";
import { Svg, safeId } from "./Svg.jsx";

const W = 100;
const H = 160;
const clamp01 = (n) => Math.max(0, Math.min(1, Number(n) || 0));

// fresh: how many of the last filled shards just landed; they carry data-fresh so a screen can play their arrival
// (system.css animates them only when motion is on). seams: "dark" draws the cracks in deep violet with a white
// highlight, so the mosaic reads on a pale page before any shard is filled.
export function MirrorArch({ seed, filled = [], fog = 0, glow = 0.6, mullion = false, size = 320, className, fresh = 0, seams = "light" }) {
  const rid = safeId(useId(), "arch");
  const count = Math.max(filled.length, 40);
  const cells = useMemo(() => mosaic(seed ?? "mirror", count, { w: W, h: H }).cells, [seed, count]);
  const cracks = useMemo(() => cells.map((c) => c.path).join(" "), [cells]);
  const outline = archPath(W, H);
  const bar = archMullion(W, H);
  const f = clamp01(fog);
  const g = clamp01(glow);
  const keys = [...new Set(filled.map((s) => chapterKey(s?.chapter)))];
  const u = (k) => `url(#${rid}-${k})`;
  const white = v("c-on-deep");

  return (
    <Svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} width={size} height={(size * (H + 12)) / (W + 12)} className={className} overflow="visible" data-art="mirror-arch" data-filled={filled.length}>
      <defs>
        <clipPath id={`${rid}-clip`}>
          <path d={outline} />
        </clipPath>
        <radialGradient id={`${rid}-halo`}>
          <stop offset="0" stopColor={v("c-violet")} stopOpacity="0.5" />
          <stop offset="0.5" stopColor={v("c-violet-300")} stopOpacity="0.28" />
          <stop offset="1" stopColor={v("c-violet-300")} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rid}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v("c-violet-300")} />
          <stop offset="0.5" stopColor={v("c-canvas-2")} />
          <stop offset="1" stopColor={v("c-canvas")} />
        </linearGradient>
        <radialGradient id={`${rid}-light`} cx="0.5" cy="0.36" r="0.6">
          <stop offset="0" stopColor={white} />
          <stop offset="0.18" stopColor={white} stopOpacity="0.75" />
          <stop offset="0.5" stopColor={v("c-violet-300")} stopOpacity="0.3" />
          <stop offset="1" stopColor={v("c-violet-300")} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${rid}-frame`} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0" stopColor={v("mirror-silver-2")} />
          <stop offset="0.18" stopColor={white} />
          <stop offset="0.4" stopColor={v("mirror-silver-1")} />
          <stop offset="0.62" stopColor={v("mirror-silver-2")} />
          <stop offset="0.82" stopColor={white} />
          <stop offset="1" stopColor={v("mirror-silver-2")} />
        </linearGradient>
        <linearGradient id={`${rid}-sheen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={white} stopOpacity="0.5" />
          <stop offset="0.4" stopColor={white} stopOpacity="0" />
          <stop offset="0.75" stopColor={white} stopOpacity="0" />
          <stop offset="1" stopColor={white} stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={`${rid}-sweep`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={white} stopOpacity="0" />
          <stop offset="0.5" stopColor={white} stopOpacity="0.7" />
          <stop offset="1" stopColor={white} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`${rid}-fog`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={v("mirror-silver-1")} stopOpacity="0.88" />
          <stop offset="1" stopColor={white} stopOpacity="0.96" />
        </linearGradient>
        {keys.map((k) => (
          <linearGradient key={k} id={`${rid}-c-${k}`} x1="0" y1="0" x2="0.8" y2="1">
            <stop offset="0" stopColor={white} stopOpacity="0.85" />
            <stop offset="0.45" stopColor={v(`tint-${k}`)} />
            <stop offset="1" stopColor={v(`tint-${k}-deep`)} stopOpacity="0.55" />
          </linearGradient>
        ))}
      </defs>

      <ellipse data-part="glow" cx={W / 2} cy={H * 0.42} rx={W * 0.8} ry={H * 0.62} fill={u("halo")} opacity={g} />
      <path data-part="frame" d={archPath(W + 10, H + 5)} transform="translate(-5,-5)" fill={u("frame")} stroke={v("mirror-silver-2")} strokeWidth="0.6" />

      <g clipPath={u("clip")}>
        <rect x="0" y="0" width={W} height={H} fill={u("glass")} />
        <rect data-part="light" x="0" y="0" width={W} height={H} fill={u("light")} opacity={0.35 + 0.65 * g} />
        <g data-part="cells">
          {cells.map((cell, i) => {
            const shard = filled[i];
            const isFresh = fresh > 0 && i >= filled.length - fresh;
            return shard ? <path key={cell.index} data-index={cell.index} data-fresh={isFresh ? "true" : undefined} style={isFresh ? { "--fresh-i": i - (filled.length - fresh) } : undefined} d={cell.path} fill={u(`c-${chapterKey(shard.chapter)}`)} fillOpacity="0.9" /> : null;
          })}
        </g>
        {seams === "dark" ? <path d={cracks} fill="none" stroke={v("c-violet-text")} strokeOpacity="0.45" strokeWidth="0.9" strokeLinejoin="round" /> : null}
        <path d={cracks} fill="none" stroke={white} strokeOpacity={filled.length ? 0.8 : 0.5} strokeWidth="0.4" strokeLinejoin="round" />
        <rect x="0" y="0" width={W} height={H} fill={u("sheen")} />
        <path data-part="sweep" d="M8,-4 L30,-4 L-4,170 L-26,170 Z" fill={u("sweep")} opacity="0.55" />
        <g data-part="fog" opacity={f}>
          <rect x="0" y="0" width={W} height={H} fill={u("fog")} />
          <ellipse cx="30" cy="60" rx="34" ry="14" fill={white} opacity="0.5" />
          <ellipse cx="70" cy="112" rx="38" ry="15" fill={white} opacity="0.45" />
          <ellipse cx="46" cy="140" rx="30" ry="10" fill={v("c-violet-100")} opacity="0.6" />
        </g>
      </g>

      <path d={outline} fill="none" stroke={white} strokeOpacity="0.95" strokeWidth="0.9" />
      <path d={outline} fill="none" stroke={v("mirror-silver-2")} strokeOpacity="0.7" strokeWidth="0.3" transform="translate(0.6,0.6) scale(0.988)" />
      {mullion ? (
        <g data-part="mullion">
          <rect x="0" y={bar.y1 - 1.3} width={W} height="2.6" fill={u("frame")} stroke={v("mirror-silver-2")} strokeWidth="0.3" />
          <path d={`M0,${bar.y1 - 1.1} H${W}`} stroke={white} strokeWidth="0.5" />
          <circle cx={W / 2} cy={bar.y1} r="3" fill={u("frame")} stroke={v("mirror-silver-2")} strokeWidth="0.4" />
          <path d={star(W / 2, bar.y1, 2.2)} fill={white} />
        </g>
      ) : null}
      <rect x="-8" y={H - 1.5} width={W + 16} height="7" rx="2.5" fill={u("frame")} stroke={v("mirror-silver-2")} strokeWidth="0.5" />
      <path d={`M-6,${H - 0.6} H${W + 6}`} stroke={white} strokeWidth="0.7" strokeLinecap="round" />
      <circle cx={W / 2} cy="-5" r="4.2" fill={u("frame")} stroke={v("mirror-silver-2")} strokeWidth="0.4" />
      <path d={star(W / 2, -5, 3.4)} fill={white} />
    </Svg>
  );
}
