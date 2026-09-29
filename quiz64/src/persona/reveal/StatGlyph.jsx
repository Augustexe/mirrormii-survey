// One small code-made glyph per game stat (src/persona/stats.js), drawn in currentColor on a 24 grid so it sits next
// to the stat name like an icon on a character sheet. Decorative: the stat name carries the meaning.
import React from "react";

const G = {
  // Orbit: a planet with a ring and a moon.
  R1: (
    <>
      <circle cx="12" cy="12" r="4.2" />
      <ellipse cx="12" cy="12" rx="9.5" ry="4" transform="rotate(-24 12 12)" />
      <circle cx="19.6" cy="7.4" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  // Delivery: a speech bubble with a spark.
  R2: (
    <>
      <path d="M4.5 6.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H11l-4.5 4v-4h0a3 3 0 0 1-2-3z" />
      <path d="M12 7.2l.9 2 2 .9-2 .9-.9 2-.9-2-2-.9 2-.9z" fill="currentColor" stroke="none" />
    </>
  ),
  // Blueprint: a floor plan with a door swing.
  R3: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M3.5 12h7M13.5 3.5v6M13.5 14v6.5" />
      <path d="M10.5 12a3 3 0 0 1 3 3" strokeDasharray="1.6 1.8" />
    </>
  ),
  // Compass: a ring with a four-point needle.
  L1: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 5.2l2 6.8-2 6.8-2-6.8z" fill="currentColor" fillOpacity="0.35" />
      <path d="M12 5.2l2 6.8h-4z" fill="currentColor" stroke="none" />
    </>
  ),
  // Engine: a speed dial with its needle.
  L2: (
    <>
      <path d="M4 16.5a8 8 0 1 1 16 0" />
      <path d="M6.3 11.2l1.3.8M12 6.9v1.5M17.7 11.2l-1.3.8" />
      <path d="M12 16.5l4-5" />
      <circle cx="12" cy="16.5" r="1.7" fill="currentColor" stroke="none" />
    </>
  ),
  // Code: an open book with a ribbon.
  L3: (
    <>
      <path d="M12 6.5c-2-1.6-4.8-2-7.5-1.6v12.6c2.7-.4 5.5 0 7.5 1.6 2-1.6 4.8-2 7.5-1.6V4.9C16.8 4.5 14 4.9 12 6.5z" />
      <path d="M12 6.5v12.6" />
      <path d="M15.5 5v5.5l1.3-1 1.3 1V4.8" fill="currentColor" fillOpacity="0.35" />
    </>
  ),
};

export function StatGlyph({ axis, size = 16, className = "" }) {
  const body = G[axis];
  if (!body) return null;
  return (
    <svg className={`rv-statglyph ${className}`} data-art="stat-glyph" data-stat={axis} viewBox="0 0 24 24" width={size} height={size}
      fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {body}
    </svg>
  );
}
