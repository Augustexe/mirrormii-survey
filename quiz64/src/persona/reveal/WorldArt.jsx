// Round 3 reveal craft (LAUNCH-SPEC section 24 item 6) and the canon world (section 25 item 1). Aura is the glow that
// stands behind a mirror, a card or a grid of panes: a breathing bloom, slow rays and one ring of light when the frame
// lands, all transform and opacity only (compositor work, no blur filters). WorldScene is the get-the-app picture:
// Genii's floating island from the GDD (white marble terraces, waterfalls, the lavender tree and the World Mirror at
// its center), our own 3D Genii waiting beside the mirror, and the photo you snapped of lunch arriving on a trail of
// light. The render loads only when the reveal mounts it (the reveal is its own lazy chunk) and decodes off the main
// thread. Reduced motion: every layer holds still.
import React, { useId } from "react";
import { Sparkle } from "../../art/index.js";
import { ISLAND } from "../../art/world.js";
import { GeniiLight } from "../../system/index.js";

export function Aura({ className = "", tone = "violet", style, ring = true }) {
  return (
    <span className={`rv-aura ${className}`} data-tone={tone} style={style} aria-hidden="true">
      <i className="rv-aura__bloom" />
      <i className="rv-aura__rays" />
      {ring ? <i className="rv-aura__ring" /> : null}
    </span>
  );
}

// A bowl of ramen, drawn for the polaroid you snapped. `k` scales it; `x`, `y` place its center.
function Bowl({ x, y, k = 1, rid }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx="0" cy="16" rx="30" ry="6" fill="var(--n-900)" opacity="0.18" />
      <path d="M-30 0 C-30 18 -16 26 0 26 C16 26 30 18 30 0 Z" fill={`url(#${rid}-bowl)`} />
      <path d="M-30 0 C-30 18 -16 26 0 26 C16 26 30 18 30 0" fill="none" stroke="var(--c-on-deep)" strokeOpacity="0.6" strokeWidth="1.2" />
      <ellipse cx="0" cy="0" rx="30" ry="8" fill={`url(#${rid}-broth)`} stroke="var(--c-on-deep)" strokeWidth="1.4" />
      <path d="M-20 -1 C-12 -6 -6 4 2 -2 C8 -6 14 3 21 -2" fill="none" stroke="var(--tint-ch4)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M-17 3 C-9 -2 -3 6 5 1 C11 -2 15 5 20 2" fill="none" stroke="var(--tint-ch4)" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
      <ellipse cx="-9" cy="-2" rx="6.5" ry="4.2" fill="var(--c-on-deep)" />
      <ellipse cx="-9" cy="-2" rx="3" ry="2.2" fill="var(--tint-ch4-deep)" opacity="0.85" />
      <circle cx="9" cy="-3" r="2" fill="var(--tint-ch5)" />
      <circle cx="13" cy="0" r="1.6" fill="var(--tint-ch5)" />
      <circle cx="5" cy="1" r="1.5" fill="var(--tint-ch5)" />
      <path d="M-4 -14 L26 -26 M0 -12 L30 -22" stroke="var(--tint-ch2-deep)" strokeWidth="2.2" strokeLinecap="round" />
    </g>
  );
}

function Polaroid() {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <svg className="rv-world__polaroid" viewBox="0 0 112 118" width="92" height="97" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${rid}-bowl`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--tint-ch1)" /><stop offset="1" stopColor="var(--tint-ch1-deep)" /></linearGradient>
        <radialGradient id={`${rid}-broth`} cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="var(--tint-ch4)" /><stop offset="1" stopColor="var(--tint-ch2-deep)" /></radialGradient>
        <linearGradient id={`${rid}-photo`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--tint-ch2)" /><stop offset="1" stopColor="var(--tint-ch4)" /></linearGradient>
      </defs>
      <rect x="0" y="0" width="112" height="118" rx="6" fill="var(--c-on-deep)" />
      <rect x="8" y="8" width="96" height="82" rx="3" fill={`url(#${rid}-photo)`} />
      <Bowl x={56} y={52} k={1.05} rid={rid} />
      <rect x="0" y="0" width="112" height="118" rx="6" fill="none" stroke="var(--mirror-silver-2)" strokeWidth="1" />
    </svg>
  );
}

// The get-the-app picture. `width` is the stage width (the island bleeds edge to edge); `height` the room it has.
// The render is cropped around the island (the mirror sits at 50% across, about 38% down the 2:3 render); Genii floats
// on the plaza to the right of the mirror, and the snapped photo leans in at the top left with its trail landing on him.
export function WorldScene({ width = 390, height = 300, snap, lives }) {
  const img = ISLAND.hero;
  const iw = Math.round(Math.max(width, height * 1.02));
  const ih = Math.round((iw * img.h) / img.w);
  const il = Math.round((width - iw) / 2);
  // The island's plaza (image y about 0.42) sits at 58% of the picture's height.
  const it = Math.round(height * 0.58 - ih * 0.42);
  const mx = il + iw * 0.5; // the mirror's foot
  const my = it + ih * 0.46;
  const gs = 72; // GeniiLight size m
  const gx = mx + Math.min(iw * 0.2, 86);
  const gy = my - 4;
  const px = Math.max(10, width * 0.04);
  const py = 8;
  const f = (n) => Math.round(n);
  const trail = `M${f(px + 84)} ${f(py + 70)} C ${f(px + 150)} ${f(py + 96)} ${f(gx - gs * 0.9)} ${f(gy - gs * 1.3)} ${f(gx - gs * 0.2)} ${f(gy - gs * 0.62)}`;
  return (
    <figure className="rv-world" style={{ "--w": `${width}px`, "--h": `${height}px` }} aria-hidden="true">
      <span className="rv-world__land" style={{ left: il, top: it, width: iw, height: ih }}>
        <img src={img.src} srcSet={img.srcSet} sizes={`${iw}px`} width={iw} height={ih} alt="" decoding="async" loading="lazy" />
      </span>
      <Aura className="rv-world__aura" tone="world" ring={false} style={{ left: mx, top: my - ih * 0.1, width: iw * 0.7, height: ih * 0.34 }} />
      <span className="rv-world__genii" style={{ left: gx, top: gy }}>
        <i className="rv-world__gglow" />
        <i className="rv-world__gshadow" />
        <span className="rv-world__gform"><GeniiLight size="m" evolution={1} mood="sure" /></span>
      </span>
      <svg className="rv-world__trail" width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
        <path d={trail} />
      </svg>
      <span className="rv-world__snap" style={{ left: px, top: py }}><Polaroid /></span>
      <span className="rv-world__spark rv-world__spark--a" style={{ left: gx - gs * 0.7, top: gy - gs * 1.2 }}><Sparkle size={16} /></span>
      <span className="rv-world__spark rv-world__spark--b" style={{ left: mx - iw * 0.16, top: my - ih * 0.14 }}><Sparkle size={11} /></span>
      <figcaption className="rv-world__caps">
        <span className="rv-world__cap rv-world__cap--snap" style={{ left: px + 4, top: py + 104 }}>{snap}</span>
        <span className="rv-world__cap rv-world__cap--lives" style={{ right: Math.max(12, width * 0.05), top: Math.min(height - 36, my + 26) }}>{lives}</span>
      </figcaption>
    </figure>
  );
}
