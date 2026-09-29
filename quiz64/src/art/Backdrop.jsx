// A-08: backdrops. scene: day|dusk|clear|night|island-1..9 (8 = extras, 9 = finale).
// Static CSS layers from tokens (glows, a still-water horizon at 62%, grain) always render. When
// `animated` is true, the page is visible, motion is allowed and WebGL2 exists, a Paper Shaders mesh
// gradient loads lazily on top of the glows: one WebGL canvas at most across the app (the most recently
// mounted animated Backdrop owns it), 30 fps, DPR capped at 1.5, paused off screen and while hidden.
import { Component, lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { tint, v } from "./palette.js";
import { GRAIN_URL, SPECKS_URL } from "./textures.js";

const ShaderLayer = lazy(() => import("./BackdropShader.jsx"));

export function islandChapter(scene) {
  const m = /^island-(\d)$/.exec(scene || "");
  if (!m) return null;
  const n = Number(m[1]);
  return n <= 7 ? n : n === 8 ? "extras" : "finale";
}

// Token names per scene, used both by the CSS layers and (resolved) by the shader.
export function backdropSpec(scene) {
  if (scene === "night") {
    return { night: true, base: "n-900", base2: "n-800", a: "c-violet", b: "n-violet", c: "tint-ch1", strength: 0.55 };
  }
  const ch = islandChapter(scene);
  if (ch != null) {
    const t = typeof ch === "number" ? `tint-ch${ch}` : `tint-${ch}`;
    return { night: false, base: "c-canvas", base2: "c-canvas-2", a: t, b: "c-violet-300", c: t, strength: 1 };
  }
  return { night: false, base: "c-canvas", base2: "c-canvas-2", a: "glow-a", b: "glow-b", c: "glow-c", strength: null };
}

const mix = (token, pct, strength) =>
  `color-mix(in srgb, ${v(token)} calc(${strength == null ? "var(--glow-strength, 1)" : strength} * ${pct}%), transparent)`;

function layers(spec) {
  const s = spec.strength;
  return [
    `radial-gradient(62% 48% at 16% 10%, ${mix(spec.a, 62, s)}, transparent 72%)`,
    `radial-gradient(52% 42% at 92% 26%, ${mix(spec.b, 52, s)}, transparent 72%)`,
    `radial-gradient(80% 42% at 50% 104%, ${mix(spec.c, 46, s)}, transparent 70%)`,
    `radial-gradient(40% 30% at 50% 58%, ${mix(spec.night ? "c-violet" : "c-on-deep", spec.night ? 22 : 55, s ?? 1)}, transparent 70%)`,
    `linear-gradient(180deg, ${v(spec.base)} 0%, ${v(spec.base)} 52%, ${v(spec.base2)} 100%)`,
  ].join(", ");
}

// ---------------------------------------------------------------- one WebGL canvas at a time

const owners = [];
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());
const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const currentOwner = () => owners[owners.length - 1] ?? null;
function claim(token) {
  owners.push(token);
  emit();
  return () => {
    const i = owners.lastIndexOf(token);
    if (i >= 0) owners.splice(i, 1);
    emit();
  };
}

let webgl = null;
export function webglAvailable() {
  if (webgl !== null) return webgl;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2");
    webgl = Boolean(gl);
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    webgl = false;
  }
  return webgl;
}

function motionAllowed() {
  try {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return false;
    return document.body?.dataset?.motion !== "off" && document.documentElement.dataset.motion !== "off";
  } catch {
    return false;
  }
}

// Re-evaluates when the OS setting or the in-app motion toggle (body[data-motion]) changes.
function useMotionAllowed() {
  const [ok, setOk] = useState(false);
  useEffect(() => {
    const update = () => setOk(motionAllowed());
    update();
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener?.("change", update);
    const mo = typeof MutationObserver === "function" ? new MutationObserver(update) : null;
    if (mo && document.body) mo.observe(document.body, { attributes: true, attributeFilter: ["data-motion"] });
    return () => {
      mq?.removeEventListener?.("change", update);
      mo?.disconnect();
    };
  }, []);
  return ok;
}

class ShaderBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {}
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const fill = { position: "absolute", inset: 0 };

export function Backdrop({ scene = "day", animated = true, className }) {
  const spec = backdropSpec(scene);
  const token = useRef({});
  const motion = useMotionAllowed();
  const wants = Boolean(animated && motion);
  const [gl, setGl] = useState(false);
  useEffect(() => {
    if (wants) setGl(webglAvailable());
  }, [wants]);
  useEffect(() => (wants && gl ? claim(token.current) : undefined), [wants, gl]);
  const owner = useSyncExternalStore(subscribe, currentOwner, () => null);
  const live = wants && gl && owner === token.current;

  return (
    <div
      aria-hidden="true"
      className={className}
      data-art="backdrop"
      data-scene={scene}
      data-animated={animated ? "true" : "false"}
      data-shader={live ? "on" : "off"}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden", background: layers(spec) }}
    >
      {live ? (
        <ShaderBoundary>
          <Suspense fallback={null}>
            <ShaderLayer spec={spec} />
          </Suspense>
        </ShaderBoundary>
      ) : null}
      {spec.night ? <div style={{ ...fill, backgroundImage: SPECKS_URL, backgroundSize: "480px 480px", opacity: 0.7 }} /> : null}
      <div
        data-part="water"
        style={{ position: "absolute", left: 0, right: 0, top: "62%", bottom: 0, background: `linear-gradient(180deg, ${mix(spec.night ? "n-violet" : "c-on-deep", spec.night ? 10 : 34, 1)}, transparent 45%)` }}
      />
      <div
        data-part="horizon"
        style={{ position: "absolute", left: 0, right: 0, top: "62%", height: 1, opacity: spec.night ? 0.3 : 0.2, background: `linear-gradient(90deg, transparent, ${v(spec.night ? "n-violet" : "c-violet")} 30%, ${v(spec.night ? "n-violet" : "c-violet")} 70%, transparent)` }}
      />
      <div data-part="grain" style={{ ...fill, backgroundImage: GRAIN_URL, backgroundSize: "var(--grain-size, 160px)", opacity: "var(--grain-opacity, 0.035)", mixBlendMode: "soft-light" }} />
    </div>
  );
}

// Island scenes read the chapter tint; exported for screens that want the same color as the backdrop.
export const backdropTint = (scene) => {
  const ch = islandChapter(scene);
  return ch == null ? null : tint(ch);
};
