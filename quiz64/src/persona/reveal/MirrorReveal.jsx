// The Reflection (DESIGN-DIRECTION 3.2, 5.12 stories 1 and 2). Story 1: every answered card is a shard in its
// chapter's tint, orbiting Genii's light; hold to speed them up, let go (or tap) and they rush in, chapter by chapter,
// and fuse into your mirror, whose crack pattern is seeded by your run. Story 2: the fog wipes from the center out and
// your two names resolve in the two panes of the arch. Names and titles are in the DOM from the first frame.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as m } from "motion/react";
import { AppTablet, IslandScene, MirrorArch, Sigil, Sparkle, geometry } from "../../art/index.js";
import { tint, v } from "../../art/palette.js";
import { GeniiLight, tokens } from "../../system/index.js";
import { archBox, archClip, durationMs } from "./layout.js";
import { splitInsight } from "../stories/story-data.js";

const TAU = Math.PI * 2;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (a, b, t) => a + (b - a) * t;

// A stand-in mirror for runs saved before the reveal existed: forty shards across the seven chapters.
function mirrorOf(slide) {
  const mirror = slide && slide.mirror;
  if (mirror && Array.isArray(mirror.filled) && mirror.filled.length) return mirror;
  return { seed: (mirror && mirror.seed) || "mirror", filled: Array.from({ length: 40 }, (_, i) => ({ chapter: 1 + (Math.floor(i / 6) % 7) })) };
}

function useCells(mirror) {
  const count = Math.max(mirror.filled.length, 40);
  return useMemo(() => geometry.mosaic(mirror.seed, count, { w: 100, h: 160 }).cells, [mirror.seed, count]);
}

// The mirror as it stands after the shards land: D's MirrorArch plus the glass, fog and silver floor line.
function StandingMirror({ box, mirror, fog = 0, children, className = "" }) {
  const clip = archClip(box);
  return (
    <div className={`rv-mirror ${className}`} aria-hidden="true">
      <span className="rv-mirror__halo" style={{ left: box.cx, top: box.glassTop + box.glassH * 0.42, width: box.glassW * 1.9, height: box.glassH * 1.2 }} />
      <span className="rv-mirror__art" style={{ left: box.svgLeft, top: box.svgTop }}>
        <MirrorArch seed={mirror.seed} filled={mirror.filled} mullion glow={0.8} fog={0} size={box.svgW} />
      </span>
      <span className="rv-mirror__glass" style={{ clipPath: clip }} />
      <span className="rv-mirror__fog" style={{ clipPath: clip, opacity: fog }} />
      <span className="rv-mirror__floor" style={{ top: box.bottom, left: box.glassLeft - box.glassW * 0.35, width: box.glassW * 1.7 }} />
      {children}
    </div>
  );
}

// ---------------------------------------------------------------- story 1

export function IntroScreen({ s, stage, active, reduced, phase, onStart, onDone }) {
  const mirror = mirrorOf(s);
  const cells = useCells(mirror);
  const box = archBox(stage.w, stage.h);
  const paths = useRef([]);
  const genii = useRef(null);
  const holding = useRef(false);
  const holdAt = useRef(0);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const [landed, setLanded] = useState(false);

  const shards = useMemo(() => {
    const order = [];
    for (const f of mirror.filled) if (!order.includes(String(f.chapter))) order.push(String(f.chapter));
    const perRing = [0, 0, 0];
    return mirror.filled.map((f, i) => {
      const cell = cells[i];
      if (!cell) return null;
      const xs = cell.points.map((p) => p[0]);
      const ys = cell.points.map((p) => p[1]);
      const diam = Math.max(4, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)));
      const ring = i % 3;
      const slot = perRing[ring]++;
      return { i, cell, diam, ring, slot, wave: order.indexOf(String(f.chapter)), waves: order.length, skipped: Boolean(f.skipped), chapter: f.chapter };
    }).filter(Boolean).map((sh) => ({ ...sh, ofRing: perRing[sh.ring] }));
  }, [cells, mirror.filled]);

  // The animation loop: orbit until the player lets go, then assembly, then the arch draws and the glass fogs.
  useEffect(() => {
    if (!active || reduced || phase === "set") return undefined;
    const { w, h } = stage;
    const O = { x: w / 2, y: Math.min(h * 0.33, box.glassTop + box.glassH * 0.5) };
    const rings = [
      { rx: w * 0.22, ry: h * 0.06, tilt: -0.22, speed: 1.3 },
      { rx: w * 0.34, ry: h * 0.105, tilt: 0.14, speed: 1 },
      { rx: w * 0.46, ry: h * 0.15, tilt: -0.06, speed: 0.78 },
    ];
    const total = durationMs("reveal", tokens.durations.reveal);
    const flight = Math.min(total * 0.55, 900);
    const starts = new Map();
    let revs = 0;
    let speed = 0.08;
    let last = performance.now();
    let assembleAt = null;
    let finished = false;
    let raf = 0;

    const orbitOf = (sh, now) => {
      const r = rings[sh.ring];
      const a = (sh.slot / Math.max(1, sh.ofRing)) * TAU + sh.ring * 0.7 + revs * TAU * r.speed;
      const x = r.rx * Math.cos(a);
      const y = r.ry * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2;
      const size = 13 + 15 * depth;
      return {
        x: O.x + x * Math.cos(r.tilt) - y * Math.sin(r.tilt),
        y: O.y + x * Math.sin(r.tilt) + y * Math.cos(r.tilt),
        k: size / sh.diam,
        rot: ((revs * 0.6 + sh.i * 0.37) * 360) % 360,
        o: (sh.skipped ? 0.45 : 1) * (0.4 + 0.6 * depth),
      };
    };
    const target = (sh) => ({ x: box.glassLeft + sh.cell.centroid[0] * box.u, y: box.glassTop + sh.cell.centroid[1] * box.u, k: box.u, rot: 0, o: 1 });
    const put = (sh, st) => {
      const el = paths.current[sh.i];
      if (!el) return;
      el.setAttribute("transform", `translate(${st.x.toFixed(2)} ${st.y.toFixed(2)}) rotate(${st.rot.toFixed(1)}) scale(${st.k.toFixed(4)}) translate(${-sh.cell.centroid[0]} ${-sh.cell.centroid[1]})`);
      el.style.opacity = st.o.toFixed(3);
    };

    const frame = (now) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const want = holding.current ? 0.4 : 0.08;
      speed += (want - speed) * Math.min(1, dt * 2.5);
      revs += speed * dt;
      if (genii.current) genii.current.style.setProperty("--rv-charge", String(Math.min(1, (speed - 0.08) / 0.32)));
      if (holding.current && phaseRef.current === "orbit" && now - holdAt.current > 2400) { holding.current = false; onStart(); }

      if (phaseRef.current === "assemble" && assembleAt === null) assembleAt = now;
      const t = assembleAt === null ? -1 : now - assembleAt;
      let done = assembleAt !== null;
      for (const sh of shards) {
        if (assembleAt === null) { put(sh, orbitOf(sh, now)); continue; }
        const begin = sh.waves > 1 ? (sh.wave * (total - flight)) / (sh.waves - 1) : 0;
        const jitter = (sh.slot % 5) * 14;
        const p = Math.max(0, Math.min(1, (t - begin - jitter) / flight));
        if (p <= 0) { put(sh, orbitOf(sh, now)); starts.delete(sh.i); done = false; continue; }
        if (!starts.has(sh.i)) starts.set(sh.i, orbitOf(sh, now));
        const a = starts.get(sh.i);
        const b = target(sh);
        const e = easeInOut(p);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const bend = (sh.i % 2 ? 1 : -1) * 0.22;
        const cx = mx - dy * bend;
        const cy = my + dx * bend;
        const x = (1 - e) * (1 - e) * a.x + 2 * (1 - e) * e * cx + e * e * b.x;
        const y = (1 - e) * (1 - e) * a.y + 2 * (1 - e) * e * cy + e * e * b.y;
        put(sh, { x, y, k: lerp(a.k, b.k, e), rot: lerp(a.rot > 180 ? a.rot - 360 : a.rot, 0, e), o: lerp(a.o, 1, e) });
        if (p < 1) done = false;
      }
      if (assembleAt !== null && t > total - 300 && !finished) setLanded(true);
      if (done && !finished) {
        finished = true;
        setLanded(true);
        const id = setTimeout(onDone, Math.max(420, durationMs("slow", 420)));
        raf = 0;
        cleanupTimer = id;
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    let cleanupTimer = 0;
    raf = requestAnimationFrame(frame);
    return () => { if (raf) cancelAnimationFrame(raf); if (cleanupTimer) clearTimeout(cleanupTimer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, reduced, phase === "set", stage.w, stage.h, shards]);

  useEffect(() => { if (phase === "orbit") setLanded(false); }, [phase]);

  const still = reduced || phase === "set";
  const down = (e) => {
    if (still || phase !== "orbit") return;
    if (e.button != null && e.button !== 0) return;
    holding.current = true;
    holdAt.current = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const up = () => {
    if (!holding.current) return;
    holding.current = false;
    if (phaseRef.current === "orbit") onStart();
  };
  const cancel = () => { holding.current = false; };

  const assembling = phase === "assemble";
  return (
    <div className="rv-intro" data-phase={still ? "set" : phase} data-landed={landed ? "true" : "false"}
      onPointerDown={down} onPointerUp={up} onPointerCancel={cancel} onClick={(e) => { if (!still) e.stopPropagation(); }}>
      {still ? (
        <StandingMirror box={box} mirror={mirror} fog={1} className="rv-mirror--intro" />
      ) : (
        <>
          <StandingMirror box={box} mirror={mirror} fog={0} className="rv-mirror--landing" />
          <span className="rv-intro__genii" ref={genii} style={assembling
            ? { left: box.cx, top: box.glassTop + box.glassH * 0.4 }
            : { left: stage.w / 2, top: Math.min(stage.h * 0.33, box.glassTop + box.glassH * 0.5) }} aria-hidden="true">
            <span className="rv-intro__halo" />
            <GeniiLight mood={assembling ? "sure" : "listening"} size="l" evolution={1} />
            <span className="rv-intro__core" />
          </span>
          <svg className="rv-shards" width={stage.w} height={stage.h} viewBox={`0 0 ${stage.w} ${stage.h}`} aria-hidden="true" focusable="false">
            <path className="rv-shards__outline" d={geometry.archPath(box.glassW, box.glassH)} transform={`translate(${box.glassLeft} ${box.glassTop})`} pathLength="1" />
            {shards.map((sh) => (
              <path key={sh.i} ref={(el) => { paths.current[sh.i] = el; }} d={sh.cell.path} className="rv-shard"
                style={{ fill: tint(sh.chapter) }} transform={`translate(${stage.w / 2} ${stage.h * 0.3}) scale(0.01)`} />
            ))}
          </svg>
          <span className="rv-intro__fog" style={{ clipPath: archClip(box) }} aria-hidden="true" />
        </>
      )}
      <div className="rv-intro__copy" style={still ? { top: box.bottom + 28 } : undefined}>
        <p className="rv-kicker rv-in">{s.kicker}</p>
        <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
        {!still && <p className="rv-intro__sub rv-in">{s.sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- story 2

function Pane({ half, where, box, first, sparkle }) {
  const h = box.glassH / 2;
  const style = { left: box.glassLeft, top: where === "up" ? box.glassTop : box.mullionY, width: box.glassW, height: h };
  return (
    <span className={`rv-pane rv-pane--${where}`} style={style}>
      <span className="rv-pane__label">
        <span className="rv-pane__sigil" aria-hidden="true"><Sigil code={half.code} size={Math.round(Math.min(24, box.glassW * 0.085))} /></span>
        {half.label}
      </span>
      <m.span className="rv-pane__name" initial={first ? { opacity: 0, y: 8, scale: 0.96 } : false}
        animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...tokens.springs.settle, delay: first ? first : 0 }}>
        {half.name}
        {sparkle ? (
          <span className="rv-pane__sparks" aria-hidden="true">
            {[0, 1, 2].map((i) => <i key={i} style={{ "--i": i }}><Sparkle size={10 + (i % 2) * 4} /></i>)}
          </span>
        ) : null}
      </m.span>
    </span>
  );
}

export function NamesScreen({ s, stage, active, reduced, wipe, onWiped, sparkles }) {
  const mirror = mirrorOf(s);
  const box = archBox(stage.w, stage.h);
  const [wiping, setWiping] = useState(false);
  useEffect(() => {
    if (!active || !wipe) { setWiping(false); return undefined; }
    setWiping(true);
    const id = setTimeout(() => { setWiping(false); onWiped && onWiped(); }, reduced ? durationMs("reduced", 120) + 80 : durationMs("reveal", 1600) * 0.75);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, wipe, reduced]);
  const settle = wipe && !reduced ? durationMs("reveal", 1600) * 0.28 / 1000 : 0;
  const clip = archClip(box);
  // The plaque carries the finding's first sentence; the whole line waits on the findings screen.
  const plaque = s.hook ? splitInsight(s.hook).belief : "";
  return (
    <div className="rv-names" data-wipe={wiping ? "on" : "off"} data-plaque={plaque ? "true" : "false"}>
      <StandingMirror box={box} mirror={mirror} fog={0}>
        {/* Two panes, two characters (people warm, life cool), and a soft scrim behind each block of lettering so the
            names read while the glass stays glass around them. */}
        <span className="rv-mirror__panes" style={{ clipPath: clip, "--t": `${box.glassTop}px`, "--m": `${box.mullionY}px`, "--b": `${box.bottom}px` }} />
        <span className="rv-mirror__scrim" style={{ clipPath: clip, left: 0, top: 0, width: stage.w, height: stage.h, "--up": `${box.mullionY - box.glassH * 0.2}px`, "--down": `${box.mullionY + box.glassH * 0.25}px`, "--rx": `${box.glassW * 0.62}px`, "--ry": `${box.glassH * 0.2}px`, "--cx": `${box.cx}px` }} />
        <span className="rv-mirror__wipe" style={{ clipPath: clip }} />
        <span className="rv-mirror__pass" style={{ clipPath: clip }} />
        <span className="rv-names__reflection" style={{ transformOrigin: `0 ${box.bottom}px`, WebkitMaskImage: `linear-gradient(to bottom, transparent ${box.bottom - 150}px, black ${box.bottom}px, transparent ${box.bottom}px)`, maskImage: `linear-gradient(to bottom, transparent ${box.bottom - 150}px, black ${box.bottom}px, transparent ${box.bottom}px)` }}>
          <span className="rv-mirror__art" style={{ left: box.svgLeft, top: box.svgTop }}>
            <MirrorArch seed={mirror.seed} filled={mirror.filled} mullion glow={0} fog={0} size={box.svgW} />
          </span>
          <span className="rv-pane rv-pane--echo" style={{ left: box.glassLeft, top: box.mullionY, width: box.glassW, height: box.glassH / 2 }}>
            <span className="rv-pane__name">{s.life.name}</span>
          </span>
        </span>
      </StandingMirror>
      <span className="rv-names__genii" style={{ left: box.cx, top: box.glassTop + box.glassW * 0.16 }} aria-hidden="true" />
      <h2 className="rv-names__panes" data-focus tabIndex="-1">
        <Pane half={s.people} where="up" box={box} first={active && wipe ? settle : 0} sparkle={sparkles && active && wipe} />
        <span className="sr-only">. </span>
        <Pane half={s.life} where="down" box={box} first={active && wipe ? settle + 0.12 : 0} sparkle={sparkles && active && wipe} />
      </h2>
      {/* One line inside the frame: Genii's clearest finding, etched on a glass plaque at the foot of the lower pane,
          so the screenshot carries the names and the read together. */}
      {plaque ? (
        <p className="rv-plaque" style={{ left: box.glassLeft + 10, width: box.glassW - 20, top: box.bottom - 22 }}>
          <span className="rv-plaque__line">{plaque}</span>
        </p>
      ) : null}
      <div className="rv-names__under" style={{ top: box.bottom + (plaque ? 54 : 22) }}>
        <p className="rv-names__sub rv-in">{s.sub}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- story 9 art: the mirror opens onto the world

// The player's own mirror, its glass opened in the middle onto a glimpse of Genii's island world (a dusk sky, the
// mirror island in front and two far islands from the chapters they played most), with a few of their shards
// drifting out toward a glass phone: the reflection that lives in the app. Drawn from src/art pieces only.
const OPEN = 14; // the ring of shards left around the opening, in arch units (glass is 100 x 160)

function topChapters(filled) {
  const count = new Map();
  for (const f of filled) { const k = String(f.chapter); if (k !== "extras") count.set(k, (count.get(k) || 0) + 1); }
  const order = [...count.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => Number(k) || k);
  const pick = order.filter((c) => c !== 3).slice(0, 2);
  while (pick.length < 2) pick.push(pick.length ? 1 : 6);
  return pick;
}

export function WorldPortal({ mirror, size = 200 }) {
  const mm = mirrorOf({ mirror });
  const cells = useCells(mm);
  const u = size / 112; // MirrorArch pads the 100 x 160 glass by 6 on every side
  const svgH = 172 * u;
  const ow = (100 - OPEN * 2) * u;
  const oh = (160 - OPEN - 8) * u;
  const ox = (6 + OPEN) * u;
  const oy = (6 + OPEN) * u;
  const r = ow / 2;
  const f = (n) => Math.round(n * 10) / 10;
  const opening = `path("M${f(ox)},${f(oy + oh)} L${f(ox)},${f(oy + r)} A${f(r)},${f(r)} 0 0 1 ${f(ox + ow)},${f(oy + r)} L${f(ox + ow)},${f(oy + oh)} Z")`;
  const [far1, far2] = topChapters(mm.filled);
  // Six of the player's shards, in the order they answered, drifting out of the glass.
  const drift = [[-0.12, 0.3, -18], [1.1, 0.2, 16], [-0.2, 0.58, 24], [1.16, 0.44, -12], [-0.06, 0.86, -30], [0.94, 0.06, 20]];
  const loose = drift.map((d, i) => ({ d, cell: cells[i * 5 % cells.length], chapter: (mm.filled[i * 5] || mm.filled[i] || {}).chapter ?? 1 }));
  const W = size * 1.5;
  return (
    <div className="rv-world" style={{ width: W, height: svgH, "--rv-world-u": `${u}px` }} aria-hidden="true">
      <span className="rv-world__halo" />
      <span className="rv-world__arch" style={{ left: (W - size) / 2 }}>
        <MirrorArch seed={mm.seed} filled={mm.filled} mullion={false} glow={0.9} size={size} />
        <span className="rv-world__open" style={{ clipPath: opening }}>
          <span className="rv-world__sky" />
          <span className="rv-world__sun" style={{ left: ox + ow * 0.5, top: oy + r * 0.62 }} />
          <span className="rv-world__far" style={{ left: ox - ow * 0.1, top: oy + oh * 0.22 }}><IslandScene chapter={far1} size={ow * 0.62} /></span>
          <span className="rv-world__far rv-world__far--2" style={{ left: ox + ow * 0.52, top: oy + oh * 0.3 }}><IslandScene chapter={far2} size={ow * 0.56} /></span>
          <span className="rv-world__near" style={{ left: ox - ow * 0.16, top: oy + oh * 0.42 }}><IslandScene chapter="finale" size={ow * 1.32} /></span>
          <span className="rv-world__mist" />
        </span>
        <svg className="rv-world__rim" width={size} height={svgH} viewBox={`0 0 ${size} ${svgH}`}>
          <path d={`M${f(ox)},${f(oy + oh)} L${f(ox)},${f(oy + r)} A${f(r)},${f(r)} 0 0 1 ${f(ox + ow)},${f(oy + r)} L${f(ox + ow)},${f(oy + oh)}`} fill="none" />
        </svg>
      </span>
      <svg className="rv-world__shards" width={W} height={svgH} viewBox={`0 0 ${W} ${svgH}`} overflow="visible">
        {loose.map(({ d, cell, chapter }, i) => cell ? (
          <path key={i} d={cell.path} fill={tint(chapter)} stroke={v("c-on-deep")} strokeOpacity="0.8" strokeWidth="0.6"
            transform={`translate(${f((W - size) / 2 + d[0] * size)} ${f(d[1] * svgH)}) rotate(${d[2]}) scale(${f(u * 0.42)}) translate(${-cell.centroid[0]} ${-cell.centroid[1]})`}
            style={{ "--i": i }} />
        ) : null)}
      </svg>
      <span className="rv-world__tablet" style={{ left: (W + size) / 2 - size * 0.16, top: svgH - size * 0.62 }}><AppTablet size={size * 0.28} /></span>
    </div>
  );
}
