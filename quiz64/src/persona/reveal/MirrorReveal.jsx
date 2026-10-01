// The Reflection (DESIGN-DIRECTION 3.2, 5.12 stories 1 and 2; LAUNCH-SPEC 25 item 2). Story 1: every answered card is
// a shard of clear glass with an opal edge, orbiting Genii's light; hold to speed them up, let go (or tap) and they rush
// in, chapter by chapter, and rebuild the World Mirror (the oval opal mirror at the center of Genii's island), whose
// shard pattern is seeded by your run. Story 2: the fog wipes from the center out and your title and its one line
// resolve in the glass, over the room the mirror looks into. Titles are in the DOM from the first frame.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as m } from "motion/react";
import { MirrorArch, Sparkle, geometry } from "../../art/index.js";
import { MIRROR } from "../../art/world.js";
import { OPAL } from "../../art/palette.js";
import { Aura } from "./WorldArt.jsx";
import { GeniiLight, tokens } from "../../system/index.js";
import { archBox, archClip, durationMs } from "./layout.js";

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
  return useMemo(() => geometry.mosaic(mirror.seed, count, { w: MIRROR.w, h: MIRROR.h }).cells, [mirror.seed, count]);
}

// The mirror as it stands after the shards land: the World Mirror (MirrorArch: opal frame render, round plinth, the room
// inside the clear glass) plus a light tint and fog over the glass, a breathing aura of light behind the frame and a
// bead of light that travels round the rim.
function StandingMirror({ box, mirror, fog = 0, children, className = "" }) {
  const clip = archClip(box);
  const pad = 6;
  return (
    <div className={`rv-mirror ${className}`} aria-hidden="true">
      <Aura className="rv-mirror__aura" style={{ left: box.cx, top: box.glassTop + box.glassH * 0.46, width: box.glassW * 2.5, height: box.glassH * 1.55 }} />
      <span className="rv-mirror__halo" style={{ left: box.cx, top: box.glassTop + box.glassH * 0.42, width: box.glassW * 1.9, height: box.glassH * 1.2 }} />
      <span className="rv-mirror__art" style={{ left: box.svgLeft, top: box.svgTop }}>
        <MirrorArch seed={mirror.seed} filled={mirror.filled} glow={0.8} fog={0} size={box.svgW} />
      </span>
      <span className="rv-mirror__glass" style={{ clipPath: clip }} />
      <span className="rv-mirror__fog" style={{ clipPath: clip, opacity: fog }} />
      <svg className="rv-mirror__rimlight" style={{ left: box.glassLeft - pad, top: box.glassTop - pad }} width={box.glassW + pad * 2} height={box.glassH + pad * 2}
        viewBox={`${-pad} ${-pad} ${box.glassW + pad * 2} ${box.glassH + pad * 2}`} focusable="false">
        <path className="rv-mirror__rimglow" d={geometry.archPath(box.glassW, box.glassH)} pathLength="1" />
        <path className="rv-mirror__rimcore" d={geometry.archPath(box.glassW, box.glassH)} pathLength="1" />
      </svg>
      <span className="rv-mirror__floor" style={{ top: box.foot, left: box.glassLeft - box.glassW * 0.45, width: box.glassW * 1.9 }} />
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
            <defs>
              <linearGradient id="rv-shard-glass" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={OPAL.marble.hi} stopOpacity="0.78" />
                <stop offset="0.5" stopColor={OPAL.edge[3]} stopOpacity="0.32" />
                <stop offset="1" stopColor={OPAL.marble.hi} stopOpacity="0.6" />
              </linearGradient>
              <linearGradient id="rv-shard-edge" x1="0" y1="0" x2="1" y2="1">
                {OPAL.edge.map((c, i) => <stop key={i} offset={[0, 0.35, 0.65, 1][i]} stopColor={c} />)}
              </linearGradient>
            </defs>
            <path className="rv-shards__outline" d={geometry.archPath(box.glassW, box.glassH)} transform={`translate(${box.glassLeft} ${box.glassTop})`} pathLength="1" />
            {shards.map((sh) => (
              <path key={sh.i} ref={(el) => { paths.current[sh.i] = el; }} d={sh.cell.path} className="rv-shard"
                transform={`translate(${stage.w / 2} ${stage.h * 0.3}) scale(0.01)`} />
            ))}
          </svg>
          <span className="rv-intro__fog" style={{ clipPath: archClip(box) }} aria-hidden="true" />
          <span className="rv-intro__flash" style={{ left: box.cx, top: box.glassTop + box.glassH * 0.5, width: box.glassW * 2.2, height: box.glassW * 2.2 }} aria-hidden="true" />
        </>
      )}
      <div className="rv-intro__copy" style={still ? { top: box.foot + 18 } : undefined}>
        <p className="rv-kicker rv-in">{s.kicker}</p>
        <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
        {!still && <p className="rv-intro__sub rv-in">{s.sub}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- story 2

// Decision 1a (2026-09-30): one title, one line. The glass carries only the people archetype and the one story line that
// merges both halves, set large and centered where the oval is widest; everything else sits in two quiet rows under the
// plinth. The title is sized from its longest word so it never breaks mid-word in a narrow glass.
export function etchType(name, glassW) {
  const words = String(name || "").split(/\s+/).filter(Boolean);
  const longest = Math.max(4, ...words.map((w) => w.length));
  const room = glassW * 0.86;
  let size = Math.min(glassW * 0.2, room / (longest * 0.58), 52);
  // A short name ("Old Soul", "The Glue") stays on one line rather than stacking two small words.
  const whole = String(name || "").trim().length;
  if (whole <= 10) size = Math.min(size, room / (whole * 0.6));
  const title = Math.round(Math.max(24, size));
  const line = Math.round(Math.max(16, Math.min(21, glassW * 0.083)));
  return { title, line };
}

// "Loyal to a few, relaxed and down-to-earth": the core traits read as one plain phrase, not a row of pills.
export function traitPhrase(keys) {
  if (!keys.length) return "";
  const list = keys.map((k, i) => (i ? k.charAt(0).toLowerCase() + k.slice(1) : k));
  if (list.length < 2) return list[0] || "";
  return `${list.slice(0, -1).join(", ")} and ${list[list.length - 1]}`;
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
  const first = active && wipe ? settle : 0;
  const clip = archClip(box);
  const title = s.title || { name: s.people ? s.people.name : "", line: s.people ? s.people.read : "" };
  const type = etchType(title.name, box.glassW);
  // The strongest traits, as many as read on one line (up to three; the full list waits on the core traits screen).
  const short = stage.h < 720;
  const all = (s.keywords || []).map((k) => (typeof k === "string" ? k : k && (k.keyword || k.name))).filter(Boolean);
  let keys = all.slice(0, 1);
  for (let n = 2; n <= Math.min(3, all.length); n++) if (traitPhrase(all.slice(0, n)).length <= 30) keys = all.slice(0, n);
  const labels = s.labels || {};
  const rows = [
    s.life && s.life.name && labels.life ? { key: "life", label: labels.life, value: s.life.name, kind: "name" } : null,
    keys.length && labels.traits ? { key: "traits", label: labels.traits, value: traitPhrase(keys), kind: "traits" } : null,
  ].filter(Boolean);
  const midY = box.glassTop + box.glassH * 0.48;
  return (
    <div className="rv-names" data-wipe={wiping ? "on" : "off"} data-short={short ? "true" : undefined}>
      <StandingMirror box={box} mirror={mirror} fog={0}>
        {/* One soft shadow behind the lettering, so the words read while the room and the shards stay clear toward the rim. */}
        <span className="rv-mirror__shade" style={{ clipPath: clip, "--cx": `${box.cx}px`, "--cy": `${midY}px`, "--rx": `${box.glassW * 0.74}px`, "--ry": `${box.glassH * 0.34}px` }} />
        <span className="rv-mirror__wipe" style={{ clipPath: clip }} />
        <span className="rv-mirror__pass" style={{ clipPath: clip }} />
      </StandingMirror>
      <span className="rv-names__genii" style={{ left: box.cx, top: box.glassTop + box.glassW * 0.16 }} aria-hidden="true" />
      <div className="rv-etch" style={{ left: box.glassLeft, top: box.glassTop, width: box.glassW, height: box.glassH, "--etch-title": `${type.title}px`, "--etch-line": `${type.line}px` }}>
        <m.h2 className="rv-etch__title" data-focus tabIndex="-1" initial={first ? { opacity: 0, y: 10, scale: 0.97 } : false}
          animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...tokens.springs.settle, delay: first }}>
          {String(title.name || "").split(/\s+/).filter(Boolean).map((w, i) => <React.Fragment key={i}>{i ? " " : ""}<span className="rv-etch__word">{w}</span></React.Fragment>)}
          {sparkles && active && wipe ? (
            <span className="rv-etch__sparks" aria-hidden="true">
              {[0, 1, 2].map((i) => <i key={i} style={{ "--i": i }}><Sparkle size={10 + (i % 2) * 4} /></i>)}
            </span>
          ) : null}
        </m.h2>
        <span className="rv-etch__rule" aria-hidden="true" />
        {title.line ? (
          <m.p className="rv-etch__line" initial={first ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }}
            transition={{ ...tokens.springs.settle, delay: first ? first + 0.18 : 0 }}>{title.line}</m.p>
        ) : null}
      </div>
      {rows.length ? (
        <dl className="rv-names__rows" style={{ top: box.foot + (short ? 10 : 18) }}>
          {rows.map((r, i) => (
            <div key={r.key} className="rv-names__row rv-in" data-kind={r.kind} style={{ "--i": i }}>
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}
