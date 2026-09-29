import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { geometry } from "../../art/index.js";
import { GeniiLight, tokens } from "../../system/index.js";

const W = 100;
const H = 160;
const ARCH = geometry.archPath(W, H);
const BRUSH = 36; // px radius of the clearing brush (DESIGN-DIRECTION 5.1)

function cssVar(name, fallback) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

// The frosted layer: a pale gradient with a few soft breath patches, clipped to the arch.
function paintFog(ctx, w, h, seed) {
  const rand = geometry.mulberry32(`${seed}-fog`);
  ctx.save();
  ctx.clearRect(0, 0, w, h);
  ctx.scale(w / W, h / H);
  ctx.clip(new Path2D(ARCH));
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, cssVar("--c-surface-solid", tokens.color.surfaceSolid));
  g.addColorStop(1, cssVar("--c-canvas-2", tokens.color.canvas2));
  ctx.globalAlpha = 0.66;
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  for (let i = 0; i < 9; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 14 + rand() * 26;
    const blob = ctx.createRadialGradient(x, y, 0, x, y, r);
    blob.addColorStop(0, "rgba(255, 255, 255, 0.26)");
    blob.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = blob;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  ctx.restore();
}

/**
 * The fogged mirror on the landing (DESIGN-DIRECTION 5.1, A-01 geometry, A-14 fog). The arch stands on a small glass
 * plinth over still water with Genii's light glowing behind the frost. A finger or cursor clears the fog along its
 * path (36 px brush) and it refills over 2.5 s; the first wipe makes Genii brighten for a second. A tap shows the
 * inside for 1.5 s (the only interaction under reduced motion). Purely decorative: aria-hidden, never required.
 */
export function FogMirror({ seed = "mirrormii", className = "" }) {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const box = useRef(null);
  const canvasRef = useRef(null);
  const state = useRef({ fog: null, mask: null, w: 0, h: 0, dpr: 1, last: null, raf: 0, lastInput: 0, lastFrame: 0, down: false, moved: 0, noticed: false });
  const reducedOS = useReducedMotion();
  const [noticed, setNoticed] = useState(false);
  const [peek, setPeek] = useState(false);
  const cells = useMemo(() => geometry.mosaic(seed, 40, { w: W, h: H }).cells, [seed]);
  const motionOff = () => Boolean(reducedOS) || (typeof document !== "undefined" && document.body.dataset.motion === "off");

  const compose = useCallback(() => {
    const s = state.current;
    const c = canvasRef.current;
    if (!c || !s.fog) return;
    const ctx = c.getContext("2d");
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.drawImage(s.fog, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.drawImage(s.mask, 0, 0);
    ctx.globalCompositeOperation = "source-over";
  }, []);

  // Size the canvases to the box (DPR capped at 1.5) and paint the fog.
  useEffect(() => {
    const el = box.current;
    const c = canvasRef.current;
    if (!el || !c || typeof ResizeObserver === "undefined") return undefined;
    const setup = () => {
      const s = state.current;
      const rect = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w === s.w && h === s.h) return;
      Object.assign(s, { w, h, dpr });
      c.width = w;
      c.height = h;
      s.fog = document.createElement("canvas");
      s.fog.width = w;
      s.fog.height = h;
      s.mask = document.createElement("canvas");
      s.mask.width = w;
      s.mask.height = h;
      paintFog(s.fog.getContext("2d"), w, h, seed);
      compose();
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(el);
    return () => { ro.disconnect(); cancelAnimationFrame(state.current.raf); };
  }, [seed, compose]);

  // Refill: fade the clearing mask back to nothing over about 2.5 s, at 30 fps, only while something is cleared.
  const tick = useCallback((now) => {
    const s = state.current;
    s.raf = 0;
    if (!s.mask) return;
    const since = now - s.lastInput;
    const dt = s.lastFrame ? now - s.lastFrame : 33;
    if (dt >= 30) {
      s.lastFrame = now;
      const m = s.mask.getContext("2d");
      m.globalCompositeOperation = "destination-out";
      m.fillStyle = `rgba(0, 0, 0, ${Math.min(1, 1 - Math.pow(0.02, dt / tokens.loops.fogRefill))})`;
      m.fillRect(0, 0, s.w, s.h);
      m.globalCompositeOperation = "source-over";
      compose();
    }
    if (since > tokens.loops.fogRefill + 300) {
      s.mask.getContext("2d").clearRect(0, 0, s.w, s.h);
      compose();
      s.lastFrame = 0;
      return;
    }
    if (!document.hidden) s.raf = requestAnimationFrame(tick);
  }, [compose]);

  const wipe = (x, y) => {
    const s = state.current;
    if (!s.mask) return;
    const m = s.mask.getContext("2d");
    const r = BRUSH * s.dpr;
    const from = s.last || [x, y];
    const dist = Math.hypot(x - from[0], y - from[1]);
    const steps = Math.max(1, Math.ceil(dist / (r / 4)));
    for (let i = 1; i <= steps; i++) {
      const px = from[0] + ((x - from[0]) * i) / steps;
      const py = from[1] + ((y - from[1]) * i) / steps;
      const g = m.createRadialGradient(px, py, 0, px, py, r);
      g.addColorStop(0, "rgba(0, 0, 0, 0.95)");
      g.addColorStop(0.6, "rgba(0, 0, 0, 0.6)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      m.fillStyle = g;
      m.fillRect(px - r, py - r, r * 2, r * 2);
    }
    s.last = [x, y];
    s.lastInput = performance.now();
    compose();
    if (!s.noticed) {
      s.noticed = true;
      setNoticed(true);
      setTimeout(() => setNoticed(false), 1000);
    }
    if (!s.raf) s.raf = requestAnimationFrame(tick);
  };

  const point = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const s = state.current;
    return [(e.clientX - rect.left) * s.dpr, (e.clientY - rect.top) * s.dpr];
  };
  const onPointerDown = (e) => {
    const s = state.current;
    s.down = true;
    s.moved = 0;
    s.last = null;
    if (!motionOff() && e.pointerType !== "mouse") wipe(...point(e));
  };
  const onPointerMove = (e) => {
    if (motionOff()) return;
    const s = state.current;
    if (e.pointerType !== "mouse" && !s.down) return;
    s.moved += Math.abs(e.movementX || 0) + Math.abs(e.movementY || 0);
    wipe(...point(e));
  };
  const onPointerUp = () => {
    const s = state.current;
    const tapped = s.down && s.moved < 8;
    s.down = false;
    s.last = null;
    if (tapped && motionOff()) {
      setPeek(true);
      setTimeout(() => setPeek(false), tokens.loops.fogPeek);
    }
  };
  const onPointerLeave = () => { state.current.last = null; state.current.down = false; };

  return (
    <div className={`mm-fogmirror${peek ? " is-peek" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <div className="mm-fogmirror__glow" />
      <div className="mm-fogmirror__arch" ref={box}>
        <svg className="mm-fogmirror__glass" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
          <defs>
            <clipPath id={`${rid}-clip`}><path d={ARCH} /></clipPath>
            <linearGradient id={`${rid}-sky`} x1="0" y1="0" x2="0.4" y2="1">
              <stop offset="0" stopColor="var(--c-violet)" />
              <stop offset="0.5" stopColor="var(--glow-c)" />
              <stop offset="1" stopColor="var(--glow-b)" />
            </linearGradient>
            <radialGradient id={`${rid}-halo`} cx="0.5" cy="0.36" r="0.55">
              <stop offset="0" stopColor="var(--c-surface-solid)" stopOpacity="0.55" />
              <stop offset="1" stopColor="var(--c-surface-solid)" stopOpacity="0" />
            </radialGradient>
          </defs>
          <g clipPath={`url(#${rid}-clip)`}>
            <rect width={W} height={H} fill={`url(#${rid}-sky)`} />
            <rect width={W} height={H} fill={`url(#${rid}-halo)`} />
            <g className="mm-fogmirror__cracks" fill="none" stroke="var(--c-surface-solid)" strokeWidth="0.35" strokeOpacity="0.55">
              {cells.map((c) => <path key={c.index} d={c.path} />)}
            </g>
          </g>
        </svg>
        <div className="mm-fogmirror__inside">
          <span className="mm-fogmirror__drift mm-fogmirror__drift--a" />
          <span className="mm-fogmirror__drift mm-fogmirror__drift--b" />
          <span className="mm-fogmirror__drift mm-fogmirror__drift--c" />
          <GeniiLight size="l" mood={noticed ? "sure" : "listening"} className="mm-fogmirror__genii" />
        </div>
        <canvas
          ref={canvasRef}
          className="mm-fogmirror__fog"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerLeave}
          onPointerLeave={onPointerLeave}
        />
        <svg className="mm-fogmirror__rim" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
          <defs>
            <linearGradient id={`${rid}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--c-surface-solid)" />
              <stop offset="0.45" stopColor="var(--mirror-silver-2)" />
              <stop offset="1" stopColor="var(--c-violet-300)" />
            </linearGradient>
          </defs>
          <path d={ARCH} fill="none" stroke={`url(#${rid}-rim)`} strokeWidth="5" vectorEffect="non-scaling-stroke" />
          <path d={ARCH} fill="none" stroke="var(--c-surface-solid)" strokeOpacity="0.9" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
        </svg>
        <span className="mm-fogmirror__sheen" />
      </div>
      <div className="mm-fogmirror__plinth" />
      <div className="mm-fogmirror__reflection">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
          <path d={ARCH} fill={`url(#${rid}-sky)`} />
        </svg>
      </div>
    </div>
  );
}
