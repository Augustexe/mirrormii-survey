// The light behind every story screen (round 2): one WebGL canvas for the whole deck, a custom fragment shader on the
// Paper Shaders mount. Night and deep screens get volumetric rays from Genii's light, a slow aurora and floating glass
// shards on three depth layers (iridescent thin-film edges, two-tone facets, parallax drift); light screens get the
// same room as pearl: soft silk glows and faint shards. Changing screens eases every uniform to the next look, so the
// room itself moves between stories. Loaded lazily; while it loads, and wherever WebGL2 is missing, the CSS layers in
// reveal.css show instead. Reduced motion: one still frame per look, no drift. 30 fps, DPR at most 1.5, paused while
// the page is hidden.
import React, { Component, useEffect, useRef, useState } from "react";
import { ShaderMount } from "@paper-design/shaders-react";

const FRAME_MS = 1000 / 30;

export const STAGE_FRAGMENT = `#version 300 es
precision highp float;
uniform float u_time;
uniform mediump vec2 u_resolution;
uniform vec4 u_base0;
uniform vec4 u_base1;
uniform vec4 u_glowA;
uniform vec4 u_glowB;
uniform vec4 u_glowC;
uniform vec2 u_focus;
uniform float u_rays;
uniform float u_shards;
uniform float u_light;
out vec4 fragColor;

float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}
vec3 thinFilm(float t) { return 0.55 + 0.45 * cos(6.2831 * (t + vec3(0.0, 0.33, 0.67))); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float aspect = u_resolution.x / u_resolution.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y);
  float t = mod(u_time, 600.0);
  vec2 f = vec2((u_focus.x - 0.5) * aspect, u_focus.y);

  vec3 col = mix(u_base0.rgb, u_base1.rgb, smoothstep(0.0, 1.0, uv.y));

  // Aurora: two slow fbm fields tinted by the look's glows.
  float n1 = fbm(vec2(p.x * 1.5 + t * 0.018, p.y * 1.1 - t * 0.012));
  float n2 = fbm(vec2(p.x * 2.2 - t * 0.014, p.y * 1.8 + 3.0 + t * 0.01));
  float near = smoothstep(0.85, 0.0, length((p - f) * vec2(1.0, 0.75)));
  col = mix(col, u_glowA.rgb, u_glowA.a * near * (0.45 + 0.75 * n1));
  col = mix(col, u_glowB.rgb, u_glowB.a * smoothstep(0.42, 0.9, n2) * smoothstep(1.15, 0.25, uv.y));
  col = mix(col, u_glowC.rgb, u_glowC.a * smoothstep(0.5, 0.95, n1) * smoothstep(0.35, 1.0, uv.y));

  // Volumetric rays from Genii's light.
  vec2 d = p - f;
  float ang = atan(d.x, d.y + 0.35);
  float r = noise(vec2(ang * 7.0, t * 0.09)) * 0.6 + noise(vec2(ang * 17.0 - t * 0.05, 4.0)) * 0.4;
  r = pow(r, 3.2) * smoothstep(1.35, 0.02, length(d)) * smoothstep(-0.12, 0.3, d.y);
  vec3 rayCol = mix(vec3(1.0), u_glowA.rgb, 0.45);
  col += rayCol * r * u_rays * mix(1.0, 0.35, u_light);
  // A soft core where the light sits.
  col += rayCol * u_rays * 0.22 * smoothstep(0.32, 0.0, length(d)) * mix(1.0, 0.4, u_light);

  // Floating glass shards on three depth layers: sparse, small, the far ones soft as bokeh, the near ones sharp with
  // thin-film rims and a rare glint.
  for (int L = 0; L < 3; L++) {
    float fl = float(L);
    float scale = 9.0 - fl * 2.6;
    vec2 q = p * scale + vec2(fl * 7.3, -t * (0.03 + 0.022 * fl) + fl * 3.1);
    vec2 id = floor(q);
    vec2 g = fract(q) - 0.5;
    float h = hash(id + fl * 11.0);
    if (h > 0.8) {
      float spin = (mod(id.x + id.y, 2.0) * 2.0 - 1.0) * (0.12 + 0.2 * h);
      float a = h * 6.2831 + t * spin;
      mat2 R = mat2(cos(a), -sin(a), sin(a), cos(a));
      vec2 off = (vec2(hash(id + 3.1), hash(id + 7.7)) - 0.5) * 0.5;
      vec2 s = R * (g - off);
      float size = 0.05 + 0.07 * hash(id + 1.9);
      s.x /= 1.0 + 0.9 * hash(id + 5.5);
      float sd = abs(s.x) * 0.9 + abs(s.y) * 0.5 - size;
      float soft = 0.006 + (2.0 - fl) * 0.022;
      float body = smoothstep(soft, -soft, sd);
      float rim = smoothstep(0.012 + (2.0 - fl) * 0.02, 0.0, abs(sd));
      float facet = step(0.0, s.x * s.y);
      float depth = 0.3 + 0.35 * fl;
      vec3 film = thinFilm(h * 2.3 + t * 0.03 + (s.x - s.y) * 3.0);
      vec3 glass = mix(film * 0.7 + 0.25, vec3(1.0), 0.3 + 0.4 * facet);
      float glint = pow(max(0.0, sin(t * 0.6 + h * 40.0)), 30.0);
      col = mix(col, glass, body * u_shards * depth * mix(0.2, 0.14, u_light));
      col += rim * u_shards * depth * mix(vec3(1.0), film, 0.6) * mix(0.3, 0.16, u_light);
      col += body * glint * u_shards * depth * 0.4;
    }
  }

  // Dust in the light.
  vec2 dq = p * 38.0 + vec2(0.0, -t * 0.4);
  float dh = hash(floor(dq));
  float dust = step(0.985, dh) * smoothstep(0.35, 0.0, length(fract(dq) - 0.5)) * near;
  col += dust * u_rays * 0.8 * mix(1.0, 0.3, u_light);

  // A still-water floor: the lower eighth reflects the light, cut by one silver line.
  float fy = 0.9;
  float floorBand = smoothstep(fy - 0.004, fy, uv.y);
  col = mix(col, col * mix(0.82, 0.97, u_light) + rayCol * 0.05, floorBand);
  col += mix(vec3(1.0), u_glowA.rgb, 0.5) * 0.16 * smoothstep(0.004, 0.0, abs(uv.y - fy)) * smoothstep(0.55, 0.0, abs(p.x)) * (1.0 - 0.5 * u_light);

  // Vignette on the dark looks; grain everywhere.
  float vig = smoothstep(1.3, 0.3, length((uv - vec2(0.5, 0.42)) * vec2(aspect * 1.15, 1.0)));
  col *= mix(0.62 + 0.38 * vig, 1.0, u_light);
  col += (hash(gl_FragCoord.xy + fract(t * 7.0)) - 0.5) * 0.028;
  fragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

function hexToRgb(hex) {
  const m = /#([0-9a-f]{6})/i.exec(String(hex || ""));
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}
function token(el, name, fallback) {
  try {
    const raw = getComputedStyle(el).getPropertyValue(`--${name}`).trim();
    return raw || fallback;
  } catch { return fallback; }
}
const vec4 = (hex, a, fb) => [...(hexToRgb(hex) || hexToRgb(fb) || [0.5, 0.5, 0.5]), a];

// Uniforms for one look, from the live tokens (Day, Dusk and Clear change the light screens; night is the same for all).
export function lookUniforms(el, look, id) {
  const deepStops = String(token(el, "g-deep", "#5A4ED6, #4A63D3")).match(/#[0-9a-f]{6}/gi) || ["#5A4ED6", "#4A63D3"];
  const glowStrength = parseFloat(token(el, "glow-strength", "1")) || 1;
  if (look === "light") {
    return {
      u_base0: vec4(token(el, "c-canvas", "#F8F8FF"), 1, "#F8F8FF"),
      u_base1: vec4(token(el, "c-canvas-2", "#EFEDFC"), 1, "#EFEDFC"),
      u_glowA: vec4(token(el, "glow-a", "#988DEA"), 0.5 * glowStrength, "#988DEA"),
      u_glowB: vec4(token(el, "glow-b", "#8FB8F2"), 0.45 * glowStrength, "#8FB8F2"),
      u_glowC: vec4(token(el, "glow-c", "#C9B3F0"), 0.4 * glowStrength, "#C9B3F0"),
      u_focus: [0.5, 0.06],
      u_rays: 0.45,
      u_shards: 0.35,
      u_light: 1,
    };
  }
  if (look === "deep") {
    return {
      u_base0: vec4(deepStops[0], 1, "#5A4ED6"),
      u_base1: vec4(deepStops[1] || deepStops[0], 1, "#4A63D3"),
      u_glowA: vec4(token(el, "n-ink", "#F3F1FF"), 0.28, "#F3F1FF"),
      u_glowB: vec4(token(el, "tint-ch3", "#F2A7C3"), 0.34, "#F2A7C3"),
      u_glowC: vec4(token(el, "tint-ch1", "#8FB8F2"), 0.3, "#8FB8F2"),
      u_focus: [0.5, id === "app" ? 0.22 : 0.12],
      u_rays: 0.6,
      u_shards: 0.5,
      u_light: 0.15,
    };
  }
  const stings = id === "stings";
  return {
    u_base0: vec4(token(el, "n-900", "#171625"), 1, "#171625"),
    u_base1: vec4(token(el, stings ? "n-900" : "n-800", "#1F1D33"), 1, "#1F1D33"),
    u_glowA: vec4(token(el, stings ? "mirror-silver-2" : "c-violet", "#8071E4"), stings ? 0.1 : id === "intro" || id === "names" ? 0.5 : 0.38, "#8071E4"),
    u_glowB: vec4(token(el, "tint-ch6", "#C9B3F0"), stings ? 0.05 : 0.22, "#C9B3F0"),
    u_glowC: vec4(token(el, "tint-ch1", "#8FB8F2"), stings ? 0.04 : 0.18, "#8FB8F2"),
    u_focus: [0.5, id === "intro" ? 0.3 : id === "names" ? 0.16 : 0.14],
    u_rays: stings ? 0.15 : id === "intro" || id === "names" ? 0.95 : 0.55,
    u_shards: stings ? 0.2 : 0.85,
    u_light: 0,
  };
}

const lerp = (a, b, k) => (Array.isArray(a) ? a.map((x, i) => x + (b[i] - x) * k) : a + (b - a) * k);
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

function Light({ look, id, reduced }) {
  const wrap = useRef(null);
  const live = useRef({ from: null, to: null, at: 0, dur: 900, still: reduced, settled: false });
  const [first, setFirst] = useState(null);
  const [on, setOn] = useState(false);

  // The first look's uniforms, read from the live tokens once the wrapper is in the page.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    try {
      const probe = document.createElement("canvas").getContext("webgl2");
      if (!probe) return;
      probe.getExtension("WEBGL_lose_context")?.loseContext();
    } catch { return; }
    const u = lookUniforms(el, look, id);
    live.current.from = u;
    live.current.to = u;
    live.current.at = performance.now();
    setFirst(u);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drive frames at 30 fps; ease uniforms between looks; pause while hidden or when still and settled.
  useEffect(() => {
    const el = wrap.current;
    if (!el || !first) return undefined;
    let raf = 0;
    let frame = 1200;
    let last = performance.now();
    let drawn = 0;
    let shown = false;
    const mountOf = () => el.firstElementChild && el.firstElementChild.paperShaderMount;
    const tick = (now) => {
      raf = 0;
      if (document.hidden) return;
      const m = mountOf();
      if (!m) { raf = requestAnimationFrame(tick); return; }
      const L = live.current;
      const k = Math.min(1, (now - L.at) / L.dur);
      if (!L.settled) {
        const e = ease(k);
        const u = {};
        for (const key of Object.keys(L.to)) u[key] = lerp(L.from[key], L.to[key], e);
        m.setUniforms(u);
        if (k >= 1) L.settled = true;
      }
      if (!L.still) frame += now - last;
      last = now;
      if (now - drawn >= FRAME_MS) {
        drawn = now;
        m.setFrame(frame);
        if (!shown) { shown = true; setOn(true); }
      }
      if (!L.still || !L.settled || !shown) raf = requestAnimationFrame(tick);
    };
    live.current.kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); } };
    live.current.kick();
    const onVis = () => { if (!document.hidden && live.current.kick) live.current.kick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener("visibilitychange", onVis);
      live.current.kick = null;
    };
  }, [first]);

  // A new screen: ease from wherever the light is now to the next look.
  useEffect(() => {
    const el = wrap.current;
    const L = live.current;
    if (!el || !L.to) return;
    const next = lookUniforms(el, look, id);
    const now = performance.now();
    const k = Math.min(1, (now - L.at) / L.dur);
    const cur = {};
    for (const key of Object.keys(L.to)) cur[key] = lerp(L.from[key], L.to[key], ease(k));
    L.from = cur;
    L.to = next;
    L.at = now;
    L.dur = reduced ? 1 : 900;
    L.settled = false;
    L.still = reduced;
    if (L.kick) L.kick();
  }, [look, id, reduced]);

  const px = typeof window === "undefined" ? 390 * 844 : Math.round(Math.min(window.innerWidth, 540) * Math.min(window.innerHeight, 960) * 2.25);
  return (
    <div ref={wrap} className="rv-light" data-on={on ? "true" : "false"} aria-hidden="true">
      {first ? (
        <ShaderMount fragmentShader={STAGE_FRAGMENT} uniforms={first} speed={0} frame={0} minPixelRatio={1} maxPixelCount={px}
          webGlContextAttributes={{ antialias: false, alpha: false, premultipliedAlpha: false }}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      ) : null}
    </div>
  );
}

// A failed shader (an old GPU, a lost context) must never take the result down: the CSS layers stay.
class Boundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? null : this.props.children; }
}

export default function StageLight(props) {
  return <Boundary><Light {...props} /></Boundary>;
}
