// Story 12 art, get the app (round 2, VISUAL-JUDGE-CODEX-R2 screen 14): one large, legible in-game moment instead of
// a tiny composite. A glass phone stands in the light; on its screen, the photo you snapped of lunch sits as a
// polaroid, and under it the same lunch has arrived on Genii's island, set on a little table in the finale world.
// That is the whole loop in one picture: you snap a moment of your real day, Miia lives it. Code-made (SVG and the
// island art), no character art. Two captions carry the loop in words.
import React, { useId } from "react";
import { IslandScene, Sparkle } from "../../art/index.js";
import { GeniiLight } from "../../system/index.js";

// A bowl of ramen, drawn for the polaroid and for the island table. `k` scales it; `x`, `y` place its center.
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

export function AppScene({ width = 300, snap, lives }) {
  const rid = useId().replace(/:/g, "");
  const W = 300;
  const H = 360;
  const u = (k) => `url(#${rid}-${k})`;
  return (
    <figure className="rv-appscene" style={{ width, height: (width * H) / W }} aria-hidden="true">
      <span className="rv-appscene__halo" />
      <svg viewBox={`0 0 ${W} ${H}`} width={width} height={(width * H) / W} overflow="visible">
        <defs>
          <linearGradient id={`${rid}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--c-on-deep)" stopOpacity="0.95" />
            <stop offset="0.5" stopColor="var(--mirror-silver-2)" stopOpacity="0.9" />
            <stop offset="1" stopColor="var(--c-on-deep)" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id={`${rid}-screen`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--c-violet-300)" />
            <stop offset="0.55" stopColor="var(--tint-ch3)" />
            <stop offset="1" stopColor="var(--tint-ch2)" />
          </linearGradient>
          <linearGradient id={`${rid}-bowl`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--tint-ch1)" />
            <stop offset="1" stopColor="var(--tint-ch1-deep)" />
          </linearGradient>
          <radialGradient id={`${rid}-broth`} cx="0.45" cy="0.4" r="0.7">
            <stop offset="0" stopColor="var(--tint-ch4)" />
            <stop offset="1" stopColor="var(--tint-ch2-deep)" />
          </radialGradient>
          <linearGradient id={`${rid}-photo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--tint-ch2)" />
            <stop offset="1" stopColor="var(--tint-ch4)" />
          </linearGradient>
          <linearGradient id={`${rid}-sheen`} x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0.3" stopColor="var(--c-on-deep)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--c-on-deep)" stopOpacity="0.4" />
            <stop offset="0.7" stopColor="var(--c-on-deep)" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`${rid}-clip`}><rect x="78" y="22" width="144" height="300" rx="22" /></clipPath>
        </defs>
        {/* The phone, tilted a little in the light, with a thick glass edge. */}
        <g className="rv-appscene__phone">
          <rect x="70" y="14" width="160" height="316" rx="30" fill={u("body")} />
          <rect x="70" y="14" width="160" height="316" rx="30" fill="none" stroke="var(--c-on-deep)" strokeWidth="2" />
          <rect x="78" y="22" width="144" height="300" rx="22" fill={u("screen")} />
          <g clipPath={u("clip")}>
            {/* Genii's island under the photo: the finale world, with the same lunch on its table. */}
            <g transform="translate(62 150)">
              <IslandScene chapter="finale" size={176} />
            </g>
            <g transform="translate(150 262)">
              <rect x="-26" y="2" width="52" height="5" rx="2.5" fill="var(--tint-ch2-deep)" opacity="0.8" />
              <rect x="-20" y="7" width="3" height="14" fill="var(--tint-ch2-deep)" opacity="0.7" />
              <rect x="17" y="7" width="3" height="14" fill="var(--tint-ch2-deep)" opacity="0.7" />
              <Bowl x={0} y={-6} k={0.52} rid={rid} />
            </g>
            <rect x="78" y="22" width="144" height="300" fill={u("sheen")} />
          </g>
          <rect x="128" y="30" width="44" height="10" rx="5" fill="var(--n-900)" opacity="0.85" />
        </g>
        {/* The photo you snapped, as a polaroid leaning out of the screen. */}
        <g transform="translate(96 58) rotate(-7)"><g className="rv-appscene__photo">
          <rect x="0" y="0" width="112" height="118" rx="6" fill="var(--c-on-deep)" />
          <rect x="8" y="8" width="96" height="82" rx="3" fill={u("photo")} />
          <Bowl x={56} y={52} k={1.05} rid={rid} />
          <rect x="0" y="0" width="112" height="118" rx="6" fill="none" stroke="var(--mirror-silver-2)" strokeWidth="1" />
        </g></g>
        {/* The arrow of light from the photo down to the island. */}
        <path className="rv-appscene__trail" d="M176 170 C 214 196 210 232 172 250" fill="none" stroke="var(--c-on-deep)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="2 7" />
        <g transform="translate(206 196)" className="rv-appscene__spark"><Sparkle size={18} /></g>
      </svg>
      {/* Genii at home on its island, beside the lunch that just arrived (G6). */}
      <span className="rv-appscene__genii"><GeniiLight size="s" mood="sure" evolution={1} expression="happy" voice="cards" /></span>
      <figcaption className="rv-appscene__caps">
        <span className="rv-appscene__cap rv-appscene__cap--snap">{snap}</span>
        <span className="rv-appscene__cap rv-appscene__cap--lives">{lives}</span>
      </figcaption>
    </figure>
  );
}
