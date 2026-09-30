// Round 3 reveal craft (LAUNCH-SPEC section 24 items 6 and 7): the light behind the frames and the real MirrorMii
// world on the product screens. Aura is the glow that stands behind a mirror, a card or a grid of panes: a breathing
// bloom, slow rays and one ring of light when the frame lands, all transform and opacity only (compositor work, no
// blur filters). WorldScene is the get-the-app picture: the MirrorMii World diorama with the CGI glass Genii floating
// over its plaza, the photo you snapped of lunch arriving on a trail of light, and the city from the world style key
// as the sky behind; layers drift at different depths. The rasters load only when the reveal mounts them (the reveal
// is its own lazy chunk) and decode off the main thread. Reduced motion: every layer holds still.
import React, { useId } from "react";
import { Sparkle } from "../../art/index.js";
import { WORLD } from "../../art/world.js";

export function Aura({ className = "", tone = "violet", style, ring = true }) {
  return (
    <span className={`rv-aura ${className}`} data-tone={tone} style={style} aria-hidden="true">
      <i className="rv-aura__bloom" />
      <i className="rv-aura__rays" />
      {ring ? <i className="rv-aura__ring" /> : null}
    </span>
  );
}

export function GeniiCgi({ width = 120, className = "", eager = false }) {
  return (
    <img className={`rv-genii-cgi ${className}`} src={WORLD.genii.src} srcSet={WORLD.genii.srcSet} sizes={`${Math.round(width)}px`}
      width={Math.round(width)} height={Math.round((width * WORLD.genii.h) / WORLD.genii.w)} alt="" decoding="async" loading={eager ? "eager" : "lazy"} />
  );
}

export function IslandImg({ width, className = "" }) {
  return (
    <picture className={`rv-island ${className}`}>
      <source type="image/avif" srcSet={`${WORLD.island.avif} 1440w`} sizes={`${Math.round(width)}px`} />
      <img src={WORLD.island.src} srcSet={WORLD.island.srcSet} sizes={`${Math.round(width)}px`} width={Math.round(width)} height={Math.round((width * WORLD.island.h) / WORLD.island.w)}
        alt="" decoding="async" loading="lazy" />
    </picture>
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

// The get-the-app picture. `width` is the stage width (the scene bleeds edge to edge); `height` the room it has.
// Positions come from the diorama itself: Genii floats over the middle of the town, clear of the MirrorMii World sign.
export function WorldScene({ width = 390, height = 300, snap, lives }) {
  const iw = Math.round(Math.min(width * 1.34, height * 2));
  const ih = Math.round((iw * WORLD.island.h) / WORLD.island.w);
  const il = Math.round((width - iw) / 2);
  const it = height - ih;
  const gw = Math.round(Math.max(72, Math.min(104, iw * 0.17)));
  const gx = il + iw * 0.5;
  const gy = it + ih * 0.5; // Genii's feet
  // The snapped photo leans in at the top right, clear of the MirrorMii World sign; its trail of light lands on Genii.
  const px = width - 92 - Math.max(10, width * 0.04);
  const py = 6;
  const f = (n) => Math.round(n);
  const trail = `M${f(px + 8)} ${f(py + 74)} C ${f(px - 40)} ${f(py + 70)} ${f(gx + gw * 0.9)} ${f(gy - gw * 0.95)} ${f(gx + gw * 0.46)} ${f(gy - gw * 0.52)}`;
  return (
    <figure className="rv-world" style={{ "--w": `${width}px`, "--h": `${height}px` }} aria-hidden="true">
      <span className="rv-world__sky"><img src={WORLD.mirror.small} srcSet={WORLD.mirror.srcSet} sizes={`${Math.round(width)}px`} alt="" decoding="async" loading="lazy" /></span>
      <Aura className="rv-world__aura" tone="world" ring={false} style={{ left: gx, top: gy - gw * 0.3, width: iw * 1.05, height: ih * 1.5 }} />
      <span className="rv-world__land" style={{ left: il, top: it, width: iw, height: ih }}><IslandImg width={iw} /></span>
      <span className="rv-world__genii" style={{ left: gx, top: gy, width: gw }}>
        <i className="rv-world__gglow" />
        <i className="rv-world__gshadow" />
        <GeniiCgi width={gw} />
      </span>
      <svg className="rv-world__trail" width={width} height={height} viewBox={`0 0 ${width} ${height}`} focusable="false">
        <path d={trail} />
      </svg>
      <span className="rv-world__snap" style={{ left: px, top: py }}><Polaroid /></span>
      <span className="rv-world__spark rv-world__spark--a" style={{ left: gx - gw * 0.6, top: gy - gw * 1.05 }}><Sparkle size={16} /></span>
      <span className="rv-world__spark rv-world__spark--b" style={{ left: gx + gw * 0.75, top: gy - gw * 0.2 }}><Sparkle size={11} /></span>
      <figcaption className="rv-world__caps">
        <span className="rv-world__cap rv-world__cap--snap" style={{ right: Math.max(10, width * 0.04) - 4, top: py + 100 }}>{snap}</span>
        <span className="rv-world__cap rv-world__cap--lives" style={{ left: Math.max(12, il + iw * 0.16), top: it + ih * 0.66 }}>{lives}</span>
      </figcaption>
    </figure>
  );
}
