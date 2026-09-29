// Glass glyphs, sigils, sparkles, beads and panes (DESIGN-DIRECTION.md sections 4.5 and 6).
// Colors are presentation attributes from CSS custom properties, so screen CSS can restyle a glyph
// (for example a selected tile turning it white) by targeting [data-part="line"|"accent"|"solid"|"glint"].
import { useEffect, useId, useRef } from "react";
import { deviceFor, isChapterDevice } from "./devices.js";
import { sigilParts, SIGIL_GRID, SIGIL_STROKE } from "./geometry.js";
import { EMOTION_TINT, chapterKey, emotionTint, tint, tintDeep, v } from "./palette.js";
import {
  CHAPTER_GLYPHS, DEVICE_GLYPHS, FORMAT_GLYPHS, GLYPH_VIEWBOX, PANE, PANE_SHEEN, PANE_VIEWBOX,
  SEAL, SEAL_RING, SETUP_GLYPHS, SPARKLE, SPARKLE_VIEWBOX, star,
} from "./shapes.js";
import { IslandScene } from "./islands/index.jsx";
import { Svg, safeId } from "./Svg.jsx";

// Stroke stays near 1.75 px on screen at 16 to 24 px and thickens gently above.
const strokeFor = (size) => Math.max(1.05, Math.min(2.4, (1.75 * 24) / Math.max(8, Number(size) || 24)));

export function Glyph({ g, size = 24, line, accent, className, art, id }) {
  if (!g) return null;
  const sw = strokeFor(size);
  return (
    <Svg viewBox={GLYPH_VIEWBOX} width={size} height={size} className={className} data-art={art} data-id={id} overflow="visible">
      {g.a ? <path data-part="accent" d={g.a} fill={accent} fillOpacity="0.78" /> : null}
      {g.l ? <path data-part="line" d={g.l} fill="none" stroke={line} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {g.f ? <path data-part="solid" d={g.f} fill={line} stroke={line} strokeWidth={sw * 0.35} strokeLinejoin="round" /> : null}
      {g.h ? <path data-part="glint" d={g.h} fill={v("c-on-deep")} fillOpacity="0.9" /> : null}
    </Svg>
  );
}

// A-04: chapter and phase glyphs. chapter: 1..7, "extras", "finale".
export function ChapterGlyph({ chapter, size = 24, className }) {
  const key = chapterKey(chapter);
  const g = CHAPTER_GLYPHS[key.startsWith("ch") ? Number(key.slice(2)) : key];
  return <Glyph g={g} size={size} line={tintDeep(chapter)} accent={tint(chapter)} className={className} art="chapter-glyph" id={String(chapter)} />;
}

// A-06: format glyphs (13 card types). Unknown types fall back to the scenario spark.
export function FormatGlyph({ type, size = 16, className }) {
  const g = FORMAT_GLYPHS[type] || FORMAT_GLYPHS.scenario;
  return <Glyph g={g} size={size} line={v("c-violet-text")} accent={v("c-violet-300")} className={className} art="format-glyph" id={type} />;
}

// A-05: world-device glyphs. id is a family from DEVICE_FAMILIES, or "chapter-<key>" for the chapter
// vignette (the island's hero object), which is what unusual cards and unmapped absurd devices show.
export function DeviceGlyph({ id, size = 48, className }) {
  if (!id) return null;
  if (isChapterDevice(id)) {
    const key = id.slice("chapter-".length);
    const chapter = /^\d$/.test(key) ? Number(key) : key;
    return <IslandScene chapter={chapter} variant="vignette" size={size} className={className} data-device={id} />;
  }
  return <Glyph g={DEVICE_GLYPHS[id] || DEVICE_GLYPHS.frame} size={size} line={v("c-violet-text")} accent={v("c-violet-300")} className={className} art="device-glyph" id={id} />;
}

export { deviceFor };

// A-09: setup object glyphs. id: best_friend|partner|crush|sibling|parent|other.
export function SetupGlyph({ id, size = 40, className }) {
  const g = SETUP_GLYPHS[id] || SETUP_GLYPHS.other;
  return <Glyph g={g} size={size} line={v("c-violet-text")} accent={v("c-violet-300")} className={className} art="setup-glyph" id={id} />;
}

// A-12: sigils, generative from the half's three poles on a 48 grid. Drawn in currentColor
// (white on night panes, ink on light), with a faint halo so the emblem reads as one object.
export function sigilFor(code) {
  return sigilParts(code);
}

export function Sigil({ code, size = 48, className }) {
  const parts = sigilParts(code);
  const c = SIGIL_GRID / 2;
  return (
    <Svg viewBox={`0 0 ${SIGIL_GRID} ${SIGIL_GRID}`} width={size} height={size} className={className} data-art="sigil" data-id={code} overflow="visible">
      <circle cx={c} cy={c} r="22.5" fill="currentColor" fillOpacity="0.07" />
      <circle cx={c} cy={c} r="22.5" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.8" />
      <g fill="none" stroke="currentColor" strokeWidth={SIGIL_STROKE} strokeLinecap="round" strokeLinejoin="round">
        {parts.map((p, i) => (
          <path key={i} data-pole={p.pole} d={p.d} fill={p.fill ? "currentColor" : "none"} strokeDasharray={p.dash ? p.dash.join(" ") : undefined} />
        ))}
      </g>
    </Svg>
  );
}

// A-13: emotion beads: a glowing glass bead in the emotion's tint (4.2), chapter tint when unknown.
export function EmotionBead({ emotion, size = 28, chapter, className }) {
  const rid = safeId(useId(), `bead-${emotion}-${chapter}`);
  const fill = emotionTint(emotion, chapter);
  const key = EMOTION_TINT[emotion];
  const deep = key ? v(`tint-${key}-deep`) : tintDeep(chapter);
  return (
    <Svg viewBox="0 0 28 28" width={size} height={size} className={className} data-art="emotion-bead" data-id={emotion} overflow="visible">
      <defs>
        <radialGradient id={`${rid}-g`}>
          <stop offset="0.45" stopColor={fill} stopOpacity="0.55" />
          <stop offset="1" stopColor={fill} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${rid}-b`} cx="0.36" cy="0.3" r="0.8">
          <stop offset="0" stopColor={v("c-on-deep")} stopOpacity="0.95" />
          <stop offset="0.38" stopColor={v("c-on-deep")} stopOpacity="0" />
          <stop offset="0.8" stopColor={deep} stopOpacity="0.08" />
          <stop offset="1" stopColor={deep} stopOpacity="0.4" />
        </radialGradient>
      </defs>
      <circle data-part="glow" cx="14" cy="14" r="16" fill={`url(#${rid}-g)`} />
      <circle data-part="bead" cx="14" cy="14" r="9.5" fill={fill} />
      <circle cx="14" cy="14" r="9.5" fill={`url(#${rid}-b)`} />
      <circle cx="14" cy="14" r="9.1" fill="none" stroke={v("c-on-deep")} strokeOpacity="0.7" strokeWidth="0.8" />
      {key === "finale" ? <circle cx="14" cy="14" r="9.8" fill="none" stroke={v("tint-finale-rim")} strokeOpacity="0.45" strokeWidth="0.8" /> : null}
      <path d="M9.2,12.6 C9.6,10.4 11.2,8.9 13.2,8.6" fill="none" stroke={v("c-on-deep")} strokeWidth="1.6" strokeLinecap="round" />
    </Svg>
  );
}

// A-15: the four-point sparkle.
export function Sparkle({ size = 12, className }) {
  return (
    <Svg viewBox={SPARKLE_VIEWBOX} width={size} height={size} className={className} data-art="sparkle">
      <path d={SPARKLE} fill="currentColor" />
    </Svg>
  );
}

// A-15: a burst of up to 12 sparkles around `origin` ({ x, y } in px of the positioned parent).
// Web Animations API, transform and opacity only. Day theme only: the burst renders nothing when the
// theme sets --sparkle-bursts: 0 (Dusk, Clear) or when the player asked for reduced motion.
const BURST_ANGLES = [0.1, 0.9, 1.7, 2.35, 3.2, 3.9, 4.6, 5.4, 0.5, 2.8, 4.3, 5.9];

function burstsAllowed() {
  if (typeof window === "undefined") return true;
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    if (document.body?.dataset?.motion === "off" || document.documentElement.dataset.motion === "off") return false;
    return getComputedStyle(document.documentElement).getPropertyValue("--sparkle-bursts").trim() !== "0";
  } catch {
    return true;
  }
}

export function SparkleBurst({ count = 8, origin, className }) {
  const ref = useRef(null);
  const n = Math.max(0, Math.min(12, Math.floor(count)));
  const x = origin?.x ?? 0;
  const y = origin?.y ?? 0;
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!burstsAllowed() || typeof el.animate !== "function") {
      el.style.display = "none";
      return undefined;
    }
    const anims = Array.from(el.children).map((child, i) => {
      const a = BURST_ANGLES[i];
      const d = 26 + (i % 3) * 9;
      return child.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)", opacity: 0 },
          { opacity: 1, offset: 0.25 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(1) rotate(45deg)`, opacity: 0 },
        ],
        { duration: 560 + (i % 4) * 40, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards", delay: (i % 3) * 18 },
      );
    });
    return () => anims.forEach((an) => an.cancel());
  }, [n, x, y]);
  return (
    <span ref={ref} aria-hidden="true" className={className} data-art="sparkle-burst" style={{ position: "absolute", left: x, top: y, width: 0, height: 0, pointerEvents: "none", color: v("c-violet-300") }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ position: "absolute", left: 0, top: 0, opacity: 0, transform: "translate(-50%, -50%)", color: i % 3 === 1 ? v("c-violet") : i % 3 === 2 ? v("c-on-deep") : undefined, display: "block", lineHeight: 0 }}>
          <Sparkle size={i % 2 ? 8 : 12} />
        </span>
      ))}
    </span>
  );
}

// A-17: lock panes. state: clear|frosted|sealed|hit|miss|pass.
// clear: clear glass with a tiny sparkle; frosted: frost over it; sealed: frost plus the star seal;
// hit: Genii called it (violet, white seal); miss: frost with an empty ring; pass: a dashed, faint pane.
export function LockPane({ state = "clear", size = 36, className }) {
  const rid = safeId(useId(), "pane");
  const frost = state === "frosted" || state === "sealed" || state === "miss" || state === "pass";
  const hit = state === "hit";
  return (
    <Svg viewBox={PANE_VIEWBOX} width={size} height={(size * 44) / 36} className={className} data-art="lock-pane" data-state={state} overflow="visible">
      <defs>
        <linearGradient id={`${rid}-g`} x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor={v("c-on-deep")} stopOpacity="0.9" />
          <stop offset="0.45" stopColor={v("c-on-deep")} stopOpacity="0.25" />
          <stop offset="1" stopColor={v("c-violet-300")} stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${rid}-h`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={v("g-deep-1")} />
          <stop offset="1" stopColor={v("g-deep-2")} />
        </linearGradient>
        <clipPath id={`${rid}-c`}>
          <path d={PANE} />
        </clipPath>
        {frost ? (
          <filter id={`${rid}-f`} x="0" y="0" width="1" height="1">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
            <feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 1.8 0 0 0 -0.7" />
          </filter>
        ) : null}
      </defs>
      {state === "sealed" ? <circle cx="18" cy="21.5" r="17" fill={v("c-violet")} opacity="0.16" /> : null}
      <path d={PANE} fill={hit ? `url(#${rid}-h)` : frost ? v("mirror-silver-1") : v("c-violet-100")} fillOpacity={hit ? 1 : frost ? (state === "pass" ? 0.55 : 0.92) : 0.35} />
      {!hit ? <path d={PANE} fill={`url(#${rid}-g)`} opacity={frost ? 0.55 : 0.9} /> : null}
      {frost ? <rect x="0" y="0" width="36" height="44" filter={`url(#${rid}-f)`} clipPath={`url(#${rid}-c)`} opacity={state === "pass" ? 0.35 : 0.7} /> : null}
      <path d={PANE_SHEEN} fill={v("c-on-deep")} opacity={hit ? 0.22 : 0.55} />
      {state === "clear" ? <path d={star(24, 15, 4.5)} fill={v("c-violet")} opacity="0.75" /> : null}
      {state === "clear" ? <path d={star(13, 29, 2.4)} fill={v("c-violet-300")} /> : null}
      {state === "sealed" || hit ? (
        <>
          <path d={SEAL_RING} fill="none" stroke={hit ? v("c-on-deep") : v("c-violet")} strokeWidth="1.3" strokeDasharray="1.2 2.2" strokeLinecap="round" />
          <path d={SEAL} fill={hit ? v("c-on-deep") : v("c-violet")} stroke={hit ? v("c-on-deep") : v("c-violet")} strokeWidth="0.8" strokeLinejoin="round" />
        </>
      ) : null}
      {state === "miss" ? <path d={SEAL_RING} fill="none" stroke={v("c-ink-3")} strokeWidth="1.3" strokeDasharray="2.5 2.5" strokeLinecap="round" /> : null}
      <path d={PANE} fill="none" stroke={hit ? v("c-on-deep") : v("c-violet-300")} strokeOpacity={hit ? 0.5 : 0.9} strokeWidth="1.2" strokeDasharray={state === "pass" ? "3 3" : undefined} />
      <path d="M8,2.2 L28,2.2 Q33.8,2.2 33.8,8" fill="none" stroke={v("c-on-deep")} strokeOpacity="0.85" strokeWidth="1" strokeLinecap="round" />
    </Svg>
  );
}
