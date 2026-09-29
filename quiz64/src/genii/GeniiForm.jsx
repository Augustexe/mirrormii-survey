import React, { useEffect, useRef, useState } from "react";
import { GeniiSvg } from "./GeniiSvg.jsx";
import { clamp01 } from "./evolution.js";
import "./genii.css";

// Genii's evolving form inside GeniiLight's orb box. Paints the SVG stage at once (server render, first paint, the
// smallest size, no WebGL), then loads the three.js view in its own chunk and swaps to it once the first frame is
// drawn. The loop runs only while the form is on screen and the tab is visible; reduced motion renders one still frame.
//
// Genii is one character, so the last evolution any form showed is remembered: a form that mounts further along (the
// chapter interlude, the lock) grows from there with a bigger beat, and a form whose evolution rises while mounted
// (each answer) takes a small ripple.
const memory = { last: null };
const PIXELS = { s: 48, m: 108, l: 240, xl: 420 };

let scenePromise = null;
const loadScene = () => (scenePromise = scenePromise || import("./scene.js"));

function reducedMotion() {
  if (typeof window === "undefined") return true;
  try {
    if (document.body && document.body.dataset.motion === "off") return true;
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch {
    return false;
  }
}

export function GeniiForm({ evolution = 1, expression = "alert", size = "m", pulse = 0, react = 0 }) {
  const e = clamp01(evolution);
  const canvasRef = useRef(null);
  const boxRef = useRef(null);
  const viewRef = useRef(null);
  const [live, setLive] = useState(false);
  const [beat, setBeat] = useState(null);
  const latest = useRef({ e, expression });
  latest.current = { e, expression };
  const use3d = size !== "xs" && Boolean(PIXELS[size]);

  // Mount: decide where this form grows from, and start the 3D view.
  useEffect(() => {
    const from = memory.last;
    memory.last = e;
    const grew = from !== null && e - from > 0.004;
    if (grew) {
      setBeat("chapter");
      const id = setTimeout(() => setBeat(null), 1400);
      if (!use3d) return () => clearTimeout(id);
    }
    if (!use3d) return undefined;
    let dead = false;
    let io = null;
    let view = null;
    const onVis = () => view && view.setActive(!document.hidden && visible);
    let visible = true;
    loadScene().then((mod) => {
      if (dead || !canvasRef.current || !mod.webglAvailable()) return;
      try {
        view = mod.createGeniiView(canvasRef.current, {
          pixels: PIXELS[size],
          quality: size === "l" || size === "xl" ? "high" : "low",
          from: grew ? from : e,
          onLost: () => { setLive(false); viewRef.current = null; },
        });
      } catch {
        return;
      }
      viewRef.current = view;
      const reduced = reducedMotion();
      view.set({ evolution: latest.current.e, expression: latest.current.expression, reduced });
      if (grew) view.impulse("chapter");
      requestAnimationFrame(() => { if (!dead) setLive(true); });
      if (typeof IntersectionObserver !== "undefined" && boxRef.current) {
        io = new IntersectionObserver((entries) => {
          visible = entries.some((en) => en.isIntersecting);
          onVis();
        });
        io.observe(boxRef.current);
      }
      document.addEventListener("visibilitychange", onVis);
    }).catch(() => {});
    return () => {
      dead = true;
      if (io) io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      if (view) view.dispose();
      viewRef.current = null;
    };
  }, [use3d, size]); // eslint-disable-line react-hooks/exhaustive-deps

  // Evolution and expression changes while mounted.
  const prevE = useRef(e);
  useEffect(() => {
    const rose = e - prevE.current > 0.004;
    prevE.current = e;
    memory.last = e;
    const view = viewRef.current;
    if (view) {
      view.set({ evolution: e, expression, reduced: reducedMotion() });
      if (rose) view.impulse("card");
    }
  }, [e, expression]);

  useEffect(() => { if (pulse && viewRef.current) viewRef.current.impulse("card"); }, [pulse]);
  useEffect(() => { if (react && viewRef.current) viewRef.current.react(); }, [react]);

  return (
    <span className="genii-form" ref={boxRef} data-live={live ? "true" : "false"} data-beat={beat || undefined}>
      <GeniiSvg evolution={e} expression={expression} className="genii-form__poster" />
      {use3d ? <canvas ref={canvasRef} className="genii-form__canvas" /> : null}
      <span className="genii-form__ring" />
    </span>
  );
}

// For tests and tools: reset the shared memory.
export function resetGeniiMemory() { memory.last = null; }
