// Lazy chunk: the Paper Shaders mesh gradient behind the Backdrop (loaded only when a Backdrop owns the
// single WebGL slot). Colors resolve from the live tokens, so Day, Dusk, Clear and Night follow the theme.
// Frames are driven here at 30 fps (the mount's own loop stays at speed 0) and stop while the page is
// hidden or the layer is off screen.
import { useEffect, useRef, useState } from "react";
import { MeshGradient } from "@paper-design/shaders-react";
import { resolve } from "./palette.js";

const SPEED = 0.15;
const FRAME_MS = 1000 / 30;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(full, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : null;
}

// Blend a glow toward the base by (1 - strength), which is how Clear quiets the glows to 50%.
function soften(color, base, strength) {
  const a = hexToRgb(color);
  const b = hexToRgb(base);
  if (!a || !b || strength >= 1) return color;
  const c = a.map((x, i) => Math.round(b[i] + (x - b[i]) * strength));
  return `rgb(${c.join(",")})`;
}

function colorsFor(el, spec) {
  const get = (name) => resolve(name, el);
  const strength = spec.night ? 1 : spec.strength ?? (parseFloat(get("glow-strength")) || 1);
  const base = get(spec.base);
  // Airy, not saturated: glows reach about half strength in Day and a third at Night.
  const k = spec.night ? 0.38 : 0.55;
  return [base, soften(get(spec.a), base, strength * k), get(spec.base2), soften(get(spec.b), base, strength * k * 0.85)];
}

export default function BackdropShader({ spec }) {
  const wrap = useRef(null);
  const [colors, setColors] = useState(null);
  const [shown, setShown] = useState(false);
  const key = `${spec.base}|${spec.a}|${spec.b}|${spec.strength}`;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const update = () => setColors(colorsFor(el, spec));
    update();
    const mo = new MutationObserver(update);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => mo.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    let raf = 0;
    let frame = 0;
    let last = performance.now();
    let drawn = 0;
    let visible = true;
    let revealed = false;
    const running = () => visible && !document.hidden;
    const tick = (now) => {
      raf = 0;
      if (!running()) return;
      frame += (now - last) * SPEED;
      last = now;
      if (now - drawn >= FRAME_MS) {
        drawn = now;
        const mount = el.firstElementChild?.paperShaderMount;
        if (mount) {
          mount.setFrame(frame);
          if (!revealed) {
            revealed = true;
            setShown(true);
          }
        }
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf && running()) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = typeof IntersectionObserver === "function"
      ? new IntersectionObserver(([entry]) => {
          visible = entry?.isIntersecting ?? true;
          visible ? start() : stop();
        })
      : null;
    io?.observe(el);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);
    start();
    return () => {
      stop();
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxPixelCount = typeof window === "undefined" ? 1920 * 1080 : Math.round(window.innerWidth * window.innerHeight * 2.25);

  return (
    <div ref={wrap} data-part="shader" style={{ position: "absolute", inset: 0, opacity: shown ? 0.92 : 0, transition: "opacity 600ms ease" }}>
      {colors ? (
        <MeshGradient
          colors={colors}
          speed={0}
          frame={0}
          distortion={0.7}
          swirl={0.12}
          grainMixer={0}
          grainOverlay={0}
          minPixelRatio={1}
          maxPixelCount={maxPixelCount}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
      ) : null}
    </div>
  );
}
