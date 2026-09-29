// Shared layout for the reveal (package C). The mirror sits in the same place on story 1 (where the shards land) and
// story 2 (where the fog clears), so both screens compute it from the stage size with archBox.
import { useEffect, useLayoutEffect, useState } from "react";
import { useReducedMotionConfig } from "motion/react";

// MirrorArch draws the glass in a 100 x 160 box inside a viewBox padded by 6 on every side (src/art/MirrorArch.jsx).
export const ARCH = Object.freeze({ w: 100, h: 160, pad: 6 });
export const MULLION_AT = 0.5;

const clamp = (lo, v, hi) => Math.max(lo, Math.min(hi, v));

// Pixel box of the mirror for a stage of w x h. `glass*` is the arch itself; `svg*` is the MirrorArch element box.
export function archBox(w = 390, h = 844, { scale = 1 } = {}) {
  const glassW = clamp(180, Math.min(w * 0.72, h * 0.52 * (ARCH.w / ARCH.h)), 320) * scale;
  const u = glassW / ARCH.w;
  const glassH = ARCH.h * u;
  const glassTop = Math.max(64, h * 0.115);
  const glassLeft = (w - glassW) / 2;
  const svgW = (ARCH.w + ARCH.pad * 2) * u;
  return {
    u, glassW, glassH, glassTop, glassLeft,
    svgW, svgH: (ARCH.h + ARCH.pad * 2) * u, svgLeft: glassLeft - ARCH.pad * u, svgTop: glassTop - ARCH.pad * u,
    mullionY: glassTop + glassH * MULLION_AT,
    bottom: glassTop + glassH,
    cx: w / 2,
  };
}

// The arch outline as a CSS path() in stage pixels, for clip-path on fog and glass layers.
export function archClip(box) {
  const { glassLeft: x, glassTop: y, glassW: w, glassH: h } = box;
  const r = w / 2;
  const f = (n) => Math.round(n * 10) / 10;
  return `path("M${f(x)},${f(y + h)} L${f(x)},${f(y + r)} A${f(r)},${f(r)} 0 0 1 ${f(x + w)},${f(y + r)} L${f(x + w)},${f(y + h)} Z")`;
}

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

// Live size of an element (the story stage). Server render and first paint assume a 390 x 844 phone.
export function useElementSize(ref, fallback = { w: 390, h: 844 }) {
  const [size, setSize] = useState(fallback);
  useIso(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => {
      const r = el.getBoundingClientRect();
      if (r.width && r.height) setSize((s) => (Math.abs(s.w - r.width) < 0.5 && Math.abs(s.h - r.height) < 0.5 ? s : { w: r.width, h: r.height }));
    };
    read();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

// Reduced motion from the OS or the header's Motion off (PersonaApp wraps the app in MotionConfig).
export function useReduced() {
  return Boolean(useReducedMotionConfig());
}

// Duration tokens as numbers (ms), read from the live CSS so Dusk and Clear scale with their theme.
export function durationMs(name, fallback) {
  try {
    if (typeof document === "undefined") return fallback;
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--d-${name}`).trim();
    const n = parseFloat(raw);
    if (!Number.isFinite(n)) return fallback;
    // Registered <time> properties compute to seconds ("1.6s"); plain tokens stay as written ("1600ms").
    return /ms$/i.test(raw) ? n : /s$/i.test(raw) ? n * 1000 : n;
  } catch {
    return fallback;
  }
}

// Deterministic 0..1 values from a string seed (used for the foxing specks and sparkle spots).
export function seeded(seed, n) {
  let h = 2166136261;
  const s = String(seed ?? "");
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  const out = [];
  let a = h >>> 0;
  for (let i = 0; i < n; i++) {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    out.push(((t ^ (t >>> 14)) >>> 0) / 4294967296);
  }
  return out;
}
