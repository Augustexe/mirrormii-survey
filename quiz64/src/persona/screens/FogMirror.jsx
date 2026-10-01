import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { geometry } from "../../art/index.js";
import { OpalFrame } from "../../art/MirrorArch.jsx";
import { OPAL } from "../../art/palette.js";
import { ISLAND, MIRROR } from "../../art/world.js";
import { GeniiLight, tokens } from "../../system/index.js";

const W = MIRROR.w;
const H = MIRROR.h;
const F = MIRROR.frame;
const ARCH = geometry.archPath(W, H);
const BRUSH = 36; // px radius of the clearing brush (DESIGN-DIRECTION 5.1)
// Mosaic cells already rebuilt on the landing: seven clear shards with an opal edge, spread over the glass, so the
// mirror reads as "your answers become this" before the first tap.
const PIECES = [5, 11, 17, 22, 28, 33, 38];
const pct = (n, of) => `${((n / of) * 100).toFixed(3)}%`;
// Where the glass sits in the frame render, as percentages of the whole mirror (frame and plinth).
const GLASS_BOX = { left: pct(-F.x, F.w), top: pct(-F.y, F.h), width: pct(W, F.w), height: pct(H, F.h) };

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
  ctx.globalAlpha = 0.44; // round 3 (H4): thinner again, so the real city reads behind the frost at phone size
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  // A breath of clear glass in the middle: Genii's light and the island behind it show through before any wipe; the
  // frost stays thick at the rim.
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.translate(W / 2, H * 0.5);
  ctx.scale(1, 2);
  const breath = ctx.createRadialGradient(0, 0, 0, 0, 0, W * 0.48);
  breath.addColorStop(0, "rgba(0, 0, 0, 0.8)");
  breath.addColorStop(0.6, "rgba(0, 0, 0, 0.5)");
  breath.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = breath;
  ctx.fillRect(-W, -H, W * 2, H * 2);
  ctx.restore();
  for (let i = 0; i < 11; i++) {
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
 * The fogged World Mirror on the landing (DESIGN-DIRECTION 5.1; LAUNCH-SPEC 25: the oval opal mirror of GDD v0.2
 * section 3.4). The mirror stands where it stands in the game, at the center of Genii's floating island (the hero render
 * behind it is aligned so the island's own mirror hides behind this one). Inside the glass: the room the mirror looks
 * into, Genii's light glowing behind the frost. A finger or cursor clears the fog along its path (36 px brush) and it
 * refills over 2.5 s; the first wipe makes Genii brighten for a second. A tap shows the inside for 1.5 s (the only
 * interaction under reduced motion). Loading: the room (mirror-inside-360, preloaded by index.html) and the frame render
 * are small; a code-drawn sky and opal frame of the same shape stand in until they decode, so nothing shifts. The island
 * loads last, at low priority, and fades in. Purely decorative: aria-hidden, never required.
 */
export function FogMirror({ seed = "mirrormii", className = "" }) {
  const rid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const box = useRef(null);
  const canvasRef = useRef(null);
  const state = useRef({ fog: null, mask: null, w: 0, h: 0, dpr: 1, last: null, raf: 0, lastInput: 0, lastFrame: 0, down: false, moved: 0, noticed: false });
  const reducedOS = useReducedMotion();
  const [noticed, setNoticed] = useState(false);
  const [peek, setPeek] = useState(false);
  // The room inside the glass, the frame render and the island each fade in once decoded (absolutely placed, so their
  // arrival never moves anything); until then the code-drawn sky and opal frame stand in.
  const [world, setWorld] = useState(false);
  const [framed, setFramed] = useState(false);
  const [island, setIsland] = useState(false);
  const photo = useRef(null);
  const frameImg = useRef(null);
  const islandImg = useRef(null);
  // The island is the heaviest picture on the page: it is only requested once the page has loaded, so the mirror (and
  // the game chunk) never wait for it.
  const [wantIsland, setWantIsland] = useState(false);
  useEffect(() => {
    const ok = (r) => Boolean(r.current && r.current.complete && r.current.naturalWidth);
    if (ok(photo)) setWorld(true);
    if (ok(frameImg)) setFramed(true);
    if (typeof document === "undefined" || document.readyState === "complete") { setWantIsland(true); return undefined; }
    const go = () => setWantIsland(true);
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  useEffect(() => { if (wantIsland && islandImg.current && islandImg.current.complete && islandImg.current.naturalWidth) setIsland(true); }, [wantIsland]);
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

  const rid2 = `${rid}f`;
  return (
    <div className={`mm-fogmirror${peek ? " is-peek" : ""}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <div className="mm-fogmirror__glow" />
      {wantIsland ? (
        <img ref={islandImg} className="mm-fogmirror__island" data-loaded={island ? "true" : "false"} src={ISLAND.hero.src} srcSet={ISLAND.hero.srcSet}
          sizes="(min-width: 1024px) 1250px, 340px" alt="" decoding="async" fetchpriority="low" onLoad={() => setIsland(true)} />
      ) : null}
      <div className="mm-fogmirror__object">
        <svg className="mm-fogmirror__framecode" viewBox={`${F.x} ${F.y} ${F.w} ${F.h}`} preserveAspectRatio="none" focusable="false" data-hidden={framed ? "true" : "false"}>
          <OpalFrame rid={rid2} />
        </svg>
        <div className="mm-fogmirror__arch" ref={box} style={GLASS_BOX}>
          <svg className="mm-fogmirror__glass" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
            <defs>
              <clipPath id={`${rid}-clip`}><path d={ARCH} /></clipPath>
              <linearGradient id={`${rid}-sky`} x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0" stopColor={OPAL.sky[0]} />
                <stop offset="0.55" stopColor={OPAL.sky[1]} />
                <stop offset="1" stopColor={OPAL.sky[2]} />
              </linearGradient>
              <radialGradient id={`${rid}-halo`} cx="0.5" cy="0.4" r="0.55">
                <stop offset="0" stopColor="var(--c-surface-solid)" stopOpacity="0.55" />
                <stop offset="1" stopColor="var(--c-surface-solid)" stopOpacity="0" />
              </radialGradient>
            </defs>
            <g clipPath={`url(#${rid}-clip)`}>
              <rect width={W} height={H} fill={`url(#${rid}-sky)`} />
              <rect width={W} height={H} fill={`url(#${rid}-halo)`} />
            </g>
          </svg>
          <div className="mm-fogmirror__inside">
            <img ref={photo} className="mm-fogmirror__photo" data-loaded={world ? "true" : "false"} src={ISLAND.inside.small} srcSet={`${ISLAND.inside.small} 360w, ${ISLAND.inside.src} 720w`}
              sizes="(min-width: 1024px) 260px, 150px" alt="" decoding="async" fetchpriority="high" onLoad={() => setWorld(true)} onError={() => setWorld(false)} />
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
          {/* The shard lines sit over the frost as fine white hairlines; seven shards are already rebuilt: clear glass with
              an opal edge that fly in with the landing and glint now and then (never colored stained glass). */}
          <svg className="mm-fogmirror__seams" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" focusable="false">
            <defs>
              <linearGradient id={`${rid}-piece`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="var(--c-surface-solid)" stopOpacity="0.7" />
                <stop offset="0.5" stopColor="var(--c-surface-solid)" stopOpacity="0.06" />
                <stop offset="1" stopColor="var(--c-surface-solid)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id={`${rid}-edge`} x1="0" y1="0" x2="1" y2="1">
                {OPAL.edge.map((c, i) => <stop key={i} offset={[0, 0.35, 0.65, 1][i]} stopColor={c} />)}
              </linearGradient>
            </defs>
            <g clipPath={`url(#${rid}-clip)`} className="mm-fogmirror__pieces">
              {PIECES.map((cell, k) => cells[cell] ? (
                <g key={cell} className="mm-fogmirror__piece" style={{ "--k": k }}>
                  <path d={cells[cell].path} fill={`url(#${rid}-piece)`} stroke={`url(#${rid}-edge)`} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                </g>
              ) : null)}
            </g>
            <g clipPath={`url(#${rid}-clip)`} fill="none" strokeLinejoin="round">
              <g stroke="var(--c-surface-solid)" strokeOpacity="0.3" strokeWidth="0.6">
                {cells.map((c) => <path key={c.index} d={c.path} vectorEffect="non-scaling-stroke" />)}
              </g>
            </g>
          </svg>
          <span className="mm-fogmirror__sheen" />
        </div>
        <img ref={frameImg} className="mm-fogmirror__frame" data-loaded={framed ? "true" : "false"} src={ISLAND.frame.src} srcSet={ISLAND.frame.srcSet}
          sizes="(min-width: 1024px) 380px, 210px" alt="" decoding="async" fetchpriority="high" onLoad={() => setFramed(true)} />
      </div>
    </div>
  );
}
