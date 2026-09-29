import React, { useId } from "react";
import { BODY, beadCenter, eyesFor, formAt, pathOf, silhouette } from "./evolution.js";

// The same stage of Genii drawn in SVG: the poster before three.js loads, the form at the smallest size, and the
// fallback when WebGL is off. Same geometry as the 3D view (evolution.js), same canon palette.
const S = 100; // px per body unit in the viewBox (viewBox is 1.5 units each way)
const H = 150;

export function GeniiSvg({ evolution = 1, expression = "alert", className = "" }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const f = formAt(evolution);
  const ox = H + BODY.center[0] * S;
  const oy = H - BODY.center[1] * S;
  const k = f.scale;
  const body = pathOf(silhouette(f.drop), S * k, ox, oy);
  const bc = beadCenter(f.drop);
  const eyes = f.eyes > 0.01 ? eyesFor(expression) : [];
  const g = (id) => `${uid}-${id}`;
  return (
    <svg className={`genii-svg${className ? ` ${className}` : ""}`} viewBox={`0 0 ${H * 2} ${H * 2}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={g("fill")} x1="0.15" y1="0.1" x2="0.8" y2="0.95">
          <stop offset="0" stopColor="#CDBBF6" />
          <stop offset="0.45" stopColor="#9AA3F1" />
          <stop offset="0.85" stopColor="#86B6F5" />
          <stop offset="1" stopColor="#A9D4FA" />
        </linearGradient>
        <radialGradient id={g("glow")} cx="0.47" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.35" stopColor="#F4F1FF" />
          <stop offset="0.7" stopColor="#C9C0F6" />
          <stop offset="1" stopColor="#988DEA" />
        </radialGradient>
        <radialGradient id={g("bead")} cx="0.38" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#F1EFFC" />
          <stop offset="1" stopColor="#B7B5E6" />
        </radialGradient>
        <clipPath id={g("clip")}><path d={body} /></clipPath>
        <filter id={g("soft")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="7" /></filter>
      </defs>
      <path d={body} fill={`url(#${g("fill")})`} />
      <g clipPath={`url(#${g("clip")})`}>
        <path d={body} fill="none" stroke="#5B7BEA" strokeOpacity={0.55 * f.glass} strokeWidth="22" filter={`url(#${g("soft")})`} />
        <ellipse cx={ox - 38 * k} cy={oy - 44 * k} rx={54 * k} ry={30 * k} fill="#FFFFFF" opacity={0.42 * f.glass} filter={`url(#${g("soft")})`} transform={`rotate(-24 ${ox - 38 * k} ${oy - 44 * k})`} />
        <path d={`M${ox - 70 * k} ${oy + 58 * k} Q${ox} ${oy + 86 * k} ${ox + 72 * k} ${oy + 46 * k}`} fill="none" stroke="#FFFFFF" strokeOpacity={0.7 * f.glass} strokeWidth={5 * k} strokeLinecap="round" filter={`url(#${g("soft")})`} />
        <path d={body} fill={`url(#${g("glow")})`} opacity={f.glow} />
      </g>
      <path d={body} fill="none" stroke="#FFFFFF" strokeOpacity={0.35 + 0.35 * f.glass} strokeWidth={2.2} />
      {f.bead > 0.01 ? (
        <circle cx={ox + bc[0] * S * k} cy={oy - bc[1] * S * k} r={BODY.bead * S * k * f.bead} fill={`url(#${g("bead")})`} stroke="#FFFFFF" strokeOpacity="0.7" strokeWidth="1.5" />
      ) : null}
      {eyes.map((eye, i) => (
        <path key={i} className="genii-svg__eye" d={pathOf(eye, S * k, ox, oy)} fill="#FFFFFF" opacity={f.eyes} />
      ))}
    </svg>
  );
}
