// Genii in real-time 3D (LAUNCH-SPEC section 23, ruling 1). Loaded lazily by GeniiForm, so three.js never sits on the
// landing's first paint. One view per visible Genii: a glass and jelly slime (MeshPhysicalMaterial with transmission,
// thickness, iridescence and clearcoat) around a soft lavender-to-periwinkle heart, a pearl bead at the tip and two
// white eyes laid on the surface. The body is a sphere displaced in the vertex shader, so the same mesh morphs from the
// orb to the droplet to Genii, wobbles like jelly and ripples on each answer.
import {
  NoToneMapping,
  PlaneGeometry,
  BackSide,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  ShaderMaterial,
  Shape,
  ShapeGeometry,
  SphereGeometry,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { BODY, beadCenter, clamp01, eyesFor, formAt, mixEyes, radiusAt, REACTIONS } from "./evolution.js";

const VIEW_HALF = 1.5; // the canvas shows 1.5 body half-widths each way (the canvas is 150% of the orb box)
const FOV = 24;
const CAM_Z = VIEW_HALF / Math.tan((FOV / 2) * (Math.PI / 180));

// ---------- Shared GLSL: the body surface (mirrors radiusAt in evolution.js, plus jelly motion) ----------
const SURFACE_GLSL = /* glsl */ `
uniform float uDrop;
uniform float uTime;
uniform float uWobble;
uniform float uRipple;
uniform float uRippleT;
uniform float uInset;
uniform vec3 uAxes;
uniform vec3 uTip;
uniform float uTilt;
uniform vec4 uTipShape;
uniform vec3 uNeck;
float gRadius(vec3 d) {
  vec3 ax = mix(vec3(1.0), uAxes, uDrop);
  float t = uTilt * uDrop;
  float c = cos(t), s = sin(t);
  vec3 q = vec3(c * d.x + s * d.y, -s * d.x + c * d.y, d.z);
  float re = 1.0 / length(q / ax);
  float k = max(dot(d, uTip), 0.0);
  float r = re + uDrop * (uTipShape.x * pow(k, uTipShape.y) + uTipShape.z * pow(k, uTipShape.w)) + uNeck.z * uNeck.x * pow(k, uNeck.y);
  float w = 0.5 * sin(dot(d, vec3(2.1, 1.3, 0.7)) * 2.0 + uTime * 1.7) + 0.5 * sin(dot(d, vec3(-1.2, 2.4, 1.1)) * 2.4 - uTime * 1.25);
  r += uWobble * w * (1.0 - 0.85 * pow(k, 5.0));
  float ang = acos(clamp(dot(d, normalize(vec3(-0.25, 0.05, 1.0))), -1.0, 1.0));
  r += uRipple * sin(ang * 6.0 - uRippleT * 13.0) * exp(-ang * 0.9) * (1.0 - pow(k, 5.0));
  return r * uInset;
}
vec3 gSurface(vec3 d) { return d * gRadius(d); }
vec3 gNormal(vec3 d, vec3 p0) {
  vec3 up = abs(d.y) < 0.95 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(up, d));
  vec3 t2 = cross(d, t1);
  float h = 0.004;
  vec3 p1 = gSurface(normalize(d + t1 * h));
  vec3 p2 = gSurface(normalize(d + t2 * h));
  vec3 n = normalize(cross(p1 - p0, p2 - p0));
  return dot(n, d) < 0.0 ? -n : n;
}
`;

// The canon body color: lavender top left, periwinkle middle, sky blue low, deep saturated blue at the rim.
const GRADIENT_GLSL = /* glsl */ `
vec3 gGradient(vec3 p, float facing) {
  float g = clamp(0.5 + 0.55 * (p.y * 0.8 - p.x * 0.45), 0.0, 1.0);
  // Linear values of the canon colors: lavender #CDB9F6, periwinkle #A3AEF4, sky #93C8F8, deep #4F6FE6.
  vec3 lav = vec3(0.61, 0.49, 0.92);
  vec3 peri = vec3(0.37, 0.42, 0.90);
  vec3 sky = vec3(0.29, 0.58, 0.94);
  vec3 deep = vec3(0.08, 0.16, 0.79);
  vec3 col = mix(peri, lav, smoothstep(0.45, 1.0, g));
  col = mix(sky, col, smoothstep(0.0, 0.42, g));
  return mix(deep, col, smoothstep(0.08, 0.7, facing));
}
`;

function surfaceUniforms() {
  return {
    uDrop: { value: 0 },
    uTime: { value: 0 },
    uWobble: { value: 0 },
    uRipple: { value: 0 },
    uRippleT: { value: 0 },
    uInset: { value: 1 },
    uAxes: { value: new Vector3(...BODY.axes) },
    uTip: { value: new Vector3(...BODY.tip) },
    uTilt: { value: BODY.tilt },
    uTipShape: { value: [BODY.tipA, BODY.tipK1, BODY.tipB, BODY.tipK2] },
    uNeck: { value: new Vector3(BODY.neckA, BODY.neckK, 0) },
  };
}

// The body mesh: a sphere whose pole points at the tip, so vertices crowd where the point forms.
function bodyGeometry(segments) {
  const g = new SphereGeometry(1, segments, Math.round(segments * 0.75));
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(...BODY.tip));
  g.applyQuaternion(q);
  return g;
}

// The environment Genii reflects: three's PMREM room (soft white panels, the bright sweep of the canon renders) with
// the canon's colored light added: a periwinkle wall on each side and a cyan floor bounce that feeds the bottom rim.
function studioEnvironment(renderer) {
  const room = new RoomEnvironment();
  const glow = (hex, k) => new MeshBasicMaterial({ color: new Color(hex).multiplyScalar(k) });
  const panel = (mat, w, h, pos, look) => {
    const m = new Mesh(new PlaneGeometry(w, h), mat);
    m.position.set(...pos);
    m.lookAt(...look);
    room.add(m);
    return m;
  };
  const extra = [
    panel(glow("#4f6fe6", 2.2), 6, 8, [-9, -1, 2], [0, 0, 0]),
    panel(glow("#6d7ff0", 1.8), 6, 8, [9, 0, -2], [0, 0, 0]),
    panel(glow("#7fd0ff", 3.2), 10, 6, [0, -9, 3], [0, 0, 0]),
    panel(glow("#ffffff", 9), 5, 2.4, [-5, 7, 6], [0, 0, 0]),
  ];
  const pmrem = new PMREMGenerator(renderer);
  // Blurred so the room's many small panels read as soft light on the glass, not as scattered window reflections.
  const tex = pmrem.fromScene(room, 0.14).texture;
  pmrem.dispose();
  extra.forEach((m) => { m.geometry.dispose(); m.material.dispose(); });
  room.dispose();
  return tex;
}

// What the glass refracts: a soft lavender, periwinkle and sky field with a white bloom and faint glass shards, drawn
// only into three's transmission pass (it never paints the page), so the body shows real refraction instead of the
// empty white a transparent canvas would give it.
function refractionBackdrop() {
  const mat = new ShaderMaterial({
    depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      varying vec2 vUv;
      float line(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return 1.0 - smoothstep(0.0, 0.012, length(pa - ba * h));
      }
      void main() {
        vec2 p = vUv;
        vec3 lav = vec3(0.7, 0.52, 1.0);
        vec3 peri = vec3(0.3, 0.38, 0.98);
        vec3 sky = vec3(0.22, 0.72, 1.0);
        // The gradient spans about the body's own footprint, so the glass shows lavender high and sky blue low.
        float g = clamp((p.y - 0.5) * 2.6 - (p.x - 0.5) * 0.9 + 0.5, 0.0, 1.0);
        vec3 col = mix(sky, peri, smoothstep(0.1, 0.5, g));
        col = mix(col, lav, smoothstep(0.55, 0.95, g));
        col += vec3(0.45, 0.4, 0.55) * exp(-dot(p - vec2(0.42, 0.6), p - vec2(0.42, 0.6)) * 90.0);
        col += vec3(0.2, 0.45, 0.6) * exp(-dot(p - vec2(0.5, 0.36), p - vec2(0.5, 0.36)) * 70.0);
        float sh = line(p, vec2(0.34, 0.66), vec2(0.55, 0.45)) + line(p, vec2(0.55, 0.45), vec2(0.68, 0.58)) + line(p, vec2(0.42, 0.34), vec2(0.55, 0.45));
        col += vec3(0.16) * sh;
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const mesh = new Mesh(new PlaneGeometry(5.2, 5.2), mat);
  mesh.position.set(0, 0, -1.6);
  mesh.renderOrder = -10;
  // Draw only into the transmission render target: the main pass renders to the canvas (no render target).
  mesh.onBeforeRender = (renderer) => { mat.colorWrite = renderer.getRenderTarget() !== null; };
  return mesh;
}

// The heart: an opaque inner body the glass refracts, painted in the canon gradient (lavender top left, periwinkle
// middle, sky blue low) with a white glow that is the orb's light at stage 0.
function heartMaterial(uniforms) {
  return new ShaderMaterial({
    uniforms: { ...uniforms, uGlow: { value: 1 }, uLight: { value: 1 } },
    vertexShader: `
      ${SURFACE_GLSL}
      varying vec3 vPos;
      varying vec3 vN;
      void main() {
        vec3 d = normalize(position);
        vec3 p = gSurface(d);
        vPos = p;
        vN = normalize(normalMatrix * gNormal(d, p));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: `
      ${GRADIENT_GLSL}
      uniform float uGlow;
      uniform float uLight;
      varying vec3 vPos;
      varying vec3 vN;
      void main() {
        float facing = clamp(vN.z, 0.0, 1.0);
        vec3 col = gGradient(vPos, facing) * (0.92 + 0.14 * facing);
        vec3 glow = mix(vec3(0.78, 0.72, 1.0), vec3(1.0), pow(facing, 3.0));
        col = mix(col, glow * 1.25, uGlow);
        gl_FragColor = vec4(col * uLight, 1.0);
      }`,
  });
}

function shellMaterial(uniforms, envMap) {
  const mat = new MeshPhysicalMaterial({
    color: new Color("#ffffff"),
    roughness: 0.03,
    metalness: 0,
    transmission: 1,
    thickness: 0.9,
    ior: 1.38,
    attenuationColor: new Color("#a69cf4"),
    attenuationDistance: 3.2,
    iridescence: 0.55,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [180, 520],
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    specularIntensity: 1,
    envMap,
    envMapIntensity: 0.32,
    emissive: new Color("#ffffff"),
    emissiveIntensity: 0,
  });
  mat.transparent = true;
  mat.userData.rim = { value: 0.7 };
  mat.userData.tint = { value: 1 };
  mat.userData.glowK = { value: 0 };
  mat.userData.clear = { value: 0 };
  mat.userData.flash = { value: 0 };
  mat.userData.rimColor = { value: new Color("#2f56ee") };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms, { uRim: mat.userData.rim, uRimColor: mat.userData.rimColor, uTint: mat.userData.tint, uGlowK: mat.userData.glowK, uClear: mat.userData.clear, uFlash: mat.userData.flash });
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${SURFACE_GLSL}`)
      .replace("#include <beginnormal_vertex>", "vec3 gDir = normalize(position);\nvec3 gP = gSurface(gDir);\nvec3 objectNormal = gNormal(gDir, gP);")
      .replace("#include <begin_vertex>", "vec3 transformed = gP;\nvGPos = gP;")
      .replace("void main() {", "varying vec3 vGPos;\nvoid main() {");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\nuniform float uRim;\nuniform vec3 uRimColor;\nuniform float uTint;\nuniform float uGlowK;\nuniform float uClear;\nuniform float uFlash;\nvarying vec3 vGPos;\n${GRADIENT_GLSL}`)
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        float gFacing = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
        float gFres = 1.0 - gFacing;
        vec3 gBody = mix(gGradient(vGPos, gFacing), vec3(0.8, 0.76, 1.0), uGlowK * 0.75);
        // While Genii is still mostly light, the edge is soft like the orb's.
        diffuseColor.a *= mix(1.0, smoothstep(0.0, 0.75, gFacing), uGlowK);
        // The glass tint: three multiplies refracted light by the diffuse color, so this is the color the glass lends to
        // what it refracts (the canon gradient, kept bright); the frosted stage also lights it directly.
        diffuseColor.rgb = mix(vec3(1.0), min(gBody * 1.3, vec3(1.0)), 0.9);
        // Toward the edge the glass is thicker to the eye: it filters to a saturated blue, as in the canon renders.
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.12, 0.3, 1.0), smoothstep(0.65, 0.08, gFacing) * 0.95 * uRim);
        totalEmissiveRadiance += gBody * (0.8 + 0.32 * gFacing) * uTint;
        totalEmissiveRadiance += vec3(1.0, 0.97, 1.0) * pow(gFacing, 2.0) * uGlowK * 2.2;
        vec3 gV = normalize(vViewPosition);
        vec3 gR = reflect(-gV, normal);
        float gLow = smoothstep(0.3, -0.85, vGPos.y);
        vec2 gNd = normal.xy / max(length(normal.xy), 1e-4);
        float gBottom = smoothstep(0.05, 0.85, dot(gNd, normalize(vec2(-0.2, -1.0))));
        // Saturated blue rim all round, strongest low, where the glass is thickest to the eye.
        totalEmissiveRadiance += uRimColor * pow(gFres, 2.0) * uRim * (0.35 + 0.35 * gBottom);
        // The caustic: a bright cyan band hugging the bottom edge inside the glass, and a thin white fresnel edge.
        float gCaustic = gBottom * smoothstep(0.04, 0.12, gFacing) * (1.0 - smoothstep(0.3, 0.48, gFacing));
        totalEmissiveRadiance += vec3(0.12, 0.55, 1.0) * gCaustic * (0.7 + 0.5 * uClear) * uRim;
        totalEmissiveRadiance += vec3(0.85, 0.93, 1.0) * exp(-((gFacing - 0.3) * (gFacing - 0.3)) / 0.0049) * (0.2 + 0.6 * smoothstep(0.1, -0.9, vGPos.x)) * uRim * 0.8;
        totalEmissiveRadiance += vec3(1.0) * pow(gFres, 14.0) * uRim * (0.8 + 0.8 * uClear);
        // Light through the jelly pools low in the body.
        totalEmissiveRadiance += vec3(0.4, 0.75, 1.0) * gLow * gFacing * 0.18 * uRim;
        // The specular sweep: a broad window arc along the upper left, a crisp glint in it, a small kick low right.
        float gUL = smoothstep(0.3, 0.9, dot(gNd, normalize(vec2(-0.62, 0.78))));
        float gArc = smoothstep(0.24, 0.34, gFacing) * (1.0 - smoothstep(0.6, 0.76, gFacing)) * gUL;
        vec3 gKey = normalize(vec3(-0.5, 0.72, 0.48));
        float gK = max(dot(gR, gKey), 0.0);
        totalEmissiveRadiance += vec3(1.0) * (gArc * (0.22 + 0.28 * uClear) + pow(gK, 300.0) * 1.2) * uRim;
        float gK2 = max(dot(gR, normalize(vec3(0.75, -0.25, 0.6))), 0.0);
        totalEmissiveRadiance += vec3(0.9, 0.95, 1.0) * pow(gK2, 120.0) * 0.9 * uRim;
        // Complete: the whole glass glows softly from inside, and flashes once as Genii lands.
        totalEmissiveRadiance += vec3(0.82, 0.8, 1.0) * (pow(gFacing, 1.5) * 0.18 * uClear + (pow(gFres, 1.5) * 0.9 + 0.25) * uFlash);
`);
  };
  mat.customProgramCacheKey = () => "genii-shell";
  return mat;
}

// The bead: a clear glass pearl with a white heart, a blue rim and one hard highlight, like the canon's.
function pearlMaterial(envMap) {
  const mat = new MeshPhysicalMaterial({
    color: new Color("#ffffff"), roughness: 0.02, metalness: 0, transmission: 0.6, thickness: 0.35, ior: 1.5,
    attenuationColor: new Color("#d7d2ff"), attenuationDistance: 0.6, clearcoat: 1, clearcoatRoughness: 0.02,
    envMap, envMapIntensity: 0.5,
  });
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
      float pF = clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0);
      vec3 pR = reflect(-normalize(vViewPosition), normal);
      totalEmissiveRadiance += vec3(0.86, 0.86, 0.98) * pow(pF, 1.4) * 0.5 * (0.75 + 0.25 * smoothstep(-0.6, 0.6, dot(normal, normalize(vec3(-0.5, 0.6, 0.6)))));
      totalEmissiveRadiance += vec3(0.15, 0.3, 1.0) * pow(1.0 - pF, 2.2) * 0.8;
      totalEmissiveRadiance += vec3(1.0) * pow(max(dot(pR, normalize(vec3(-0.5, 0.72, 0.48))), 0.0), 400.0) * 3.0;
      totalEmissiveRadiance += vec3(1.0) * pow(1.0 - pF, 10.0) * 0.8;
    `);
  };
  mat.customProgramCacheKey = () => "genii-pearl";
  return mat;
}

// Surface depth at (x, y) on the front of the body (for laying the eyes on it).
function surfaceZ(x, y, drop) {
  let lo = 0, hi = 1.4;
  for (let i = 0; i < 22; i++) {
    const z = (lo + hi) / 2;
    const l = Math.hypot(x, y, z);
    const inside = l < radiusAt([x / l, y / l, z / l], drop);
    if (inside) lo = z; else hi = z;
  }
  return lo;
}

export function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * One live Genii on a canvas. opts: { pixels (CSS px of the canvas), quality: "low" | "high", onLost }.
 * Returns { set({ evolution, expression, reduced }), impulse("card" | "chapter"), react(), setActive(bool), dispose() }.
 */
export function createGeniiView(canvas, { pixels = 120, quality = "high", onLost = null, from = null } = {}) {
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(2, (typeof window !== "undefined" && window.devicePixelRatio) || 1));
  renderer.setSize(pixels, pixels, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  // No tone curve: the canon's saturated blues and cyans must stay saturated (a filmic or neutral curve bleaches them
  // toward white); highlights simply clip to white, as they do in the canon renders.
  renderer.toneMapping = NoToneMapping;

  const env = studioEnvironment(renderer);
  const scene = new Scene();
  scene.environment = env;
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);
  camera.position.set(0, 0, CAM_Z);

  const segments = quality === "high" ? 180 : 110;
  const geo = bodyGeometry(segments);
  const shellU = surfaceUniforms();
  const heartU = surfaceUniforms();
  heartU.uInset.value = 0.985;
  const shellMat = shellMaterial(shellU, env);
  const heartMat = heartMaterial(heartU);

  const root = new Group();
  const body = new Group();
  root.add(body);
  scene.add(root);
  const backdrop = refractionBackdrop();
  scene.add(backdrop);
  const heart = new Mesh(geo, heartMat);
  const shell = new Mesh(geo, shellMat);
  body.add(heart, shell);

  const bead = new Mesh(new SphereGeometry(BODY.bead, 48, 32), pearlMaterial(env));
  body.add(bead);

  const eyeMat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, side: DoubleSide, toneMapped: false });
  const eyes = [new Mesh(undefined, eyeMat), new Mesh(undefined, eyeMat)];
  eyes.forEach((m) => { m.renderOrder = 10; body.add(m); });

  // ---------- State ----------
  const st = {
    target: 0, shown: from === null ? 0 : clamp01(from), reduced: false,
    expr: "alert", exprFrom: eyesFor("alert"), exprTo: eyesFor("alert"), exprT: 1, reaction: null, reactionUntil: 0, reactionIndex: 0,
    squash: 0, squashV: 0, ripple: 0, rippleT: 0, beadS: 0, beadV: 0,
    blink: 0, blinkAt: 2.5, blinkSeq: [], eyesSeen: false,
    time: 0, last: 0, active: true, raf: 0, lastEyeKey: "", wantExpr: null, flash: 0, prevShown: 0,
  };
  st.prevShown = st.shown;
  st.beadS = formAt(st.shown).bead;
  st.eyesSeen = formAt(st.shown).eyes > 0.5;

  function buildEyes(pts, drop) {
    pts.forEach((outline, i) => {
      const shape = new Shape(outline.map(([x, y]) => new Vector2(x, y)));
      const g = new ShapeGeometry(shape, 1);
      const pos = g.attributes.position;
      for (let k = 0; k < pos.count; k++) {
        const x = pos.getX(k), y = pos.getY(k);
        pos.setZ(k, surfaceZ(x, y, drop) + 0.02);
      }
      pos.needsUpdate = true;
      if (eyes[i].geometry) eyes[i].geometry.dispose();
      eyes[i].geometry = g;
    });
  }

  function currentEyes(now) {
    const reacting = st.reaction && now < st.reactionUntil;
    const want = reacting ? st.reaction : st.expr;
    if (want !== st.wantExpr) {
      st.exprFrom = mixEyes(st.exprFrom, st.exprTo, st.exprT);
      st.exprTo = eyesFor(want);
      st.exprT = st.reduced ? 1 : 0;
      st.wantExpr = want;
    }
    return mixEyes(st.exprFrom, st.exprTo, st.exprT);
  }

  function step(dt) {
    const now = st.time;
    // Evolution eases toward its target; bigger steps take a little longer.
    const k = st.reduced ? 1 : 1 - Math.exp(-dt / 0.45);
    st.shown += (st.target - st.shown) * k;
    if (Math.abs(st.target - st.shown) < 1e-4) st.shown = st.target;
    const f = formAt(st.shown);

    // Bead: an underdamped spring, so it pops.
    if (st.reduced) { st.beadS = f.bead; st.beadV = 0; } else {
      st.beadV += (-(st.beadS - f.bead) * 260 - st.beadV * 11) * dt;
      st.beadS += st.beadV * dt;
    }
    // Squash and stretch spring (impulses from answers and chapter beats).
    st.squashV += (-st.squash * 170 - st.squashV * 7.5) * dt;
    st.squash += st.squashV * dt;
    st.ripple *= Math.exp(-dt * 2.6);
    st.rippleT += dt;

    // Eyes: fade in, first blink is a moment, then blink every few seconds.
    if (!st.eyesSeen && f.eyes > 0.5) {
      st.eyesSeen = true;
      if (!st.reduced) st.blinkSeq = [now + 0.05, now + 0.5];
    }
    if (!st.reduced && f.eyes > 0.5 && now > st.blinkAt) {
      st.blinkSeq.push(now);
      st.blinkAt = now + 2.8 + Math.random() * 3.4;
    }
    let blink = 0;
    for (const t0 of st.blinkSeq) {
      const t = now - t0;
      if (t >= 0 && t < 0.24) blink = Math.max(blink, t < 0.08 ? t / 0.08 : 1 - (t - 0.08) / 0.16);
    }
    st.blinkSeq = st.blinkSeq.filter((t0) => now - t0 < 0.3);
    if (st.shown < 0.7 && f.eyes > 0 && !st.reduced) blink = Math.max(blink, 1 - smooth01((f.eyes - 0.2) / 0.6)); // eyes open as they fade in
    st.exprT = Math.min(1, st.exprT + dt / 0.22);

    // Uniforms.
    for (const u of [shellU, heartU]) {
      u.uDrop.value = f.drop;
      u.uTime.value = now;
      u.uWobble.value = st.reduced ? 0 : 0.008 + 0.01 * f.glass;
      u.uRipple.value = st.reduced ? 0 : st.ripple;
      u.uRippleT.value = st.rippleT;
    }
    heartMat.uniforms.uGlow.value = f.glow;
    heartMat.uniforms.uLight.value = 0.92 + 0.3 * f.glow;
    shellMat.emissiveIntensity = 0;
    shellMat.userData.glowK.value = f.glow;
    // Frosted while Genii forms (0.75 reads slightly frosted), clear glass once complete.
    shellMat.transmission = f.glass * (0.45 + 0.5 * f.clarity);
    shellMat.roughness = 0.34 - 0.32 * f.clarity;
    shellMat.userData.tint.value = (1 - 0.55 * f.glow) * (1 - 0.82 * f.clarity);
    shellMat.userData.clear.value = f.clarity;
    heartU.uInset.value = 0.985 - 0.4 * f.clarity;
    heart.visible = f.clarity < 0.6;
    for (const u of [shellU, heartU]) u.uNeck.value.z = f.bead;
    if (!st.reduced && st.prevShown < 0.985 && st.shown >= 0.985) { st.flash = 1; st.squashV -= 2.6; st.ripple = 0.03; st.rippleT = 0; }
    st.prevShown = st.shown;
    st.flash *= Math.exp(-dt * 2.4);
    shellMat.userData.flash.value = st.flash;
    shellMat.userData.rim.value = 0.15 + 0.85 * f.glass;
    shellMat.iridescence = 0.55 * f.glass;

    const breath = st.reduced ? 0 : Math.sin(now * (Math.PI * 2) / 4.2) * 0.012;
    const s = f.scale;
    const sq = st.squash + breath;
    body.scale.set(s * (1 - sq * 0.6), s * (1 + sq), s * (1 - sq * 0.4));
    root.position.set(BODY.center[0], BODY.center[1] + (st.reduced ? 0 : Math.sin(now * 0.9) * 0.02), 0);
    root.rotation.y = st.reduced ? -0.12 : -0.12 + Math.sin(now * 0.45) * 0.1;
    root.rotation.x = st.reduced ? 0.04 : 0.04 + Math.sin(now * 0.37 + 1) * 0.035;

    const bc = beadCenter(f.drop, f.bead);
    bead.position.set(bc[0], bc[1], bc[2]);
    bead.scale.setScalar(Math.max(0.0001, st.beadS));
    bead.visible = st.beadS > 0.01;

    eyeMat.opacity = f.eyes;
    eyes.forEach((m) => { m.visible = f.eyes > 0.01; });
    if (f.eyes > 0.01) {
      const pts = currentEyes(now);
      const squashed = blink > 0 ? pts.map((eye) => {
        const ys = eye.map((p) => p[1]);
        const lo = Math.min(...ys), hi = Math.max(...ys);
        const pivot = lo + (hi - lo) * 0.34;
        return eye.map(([x, y]) => [x, pivot + (y - pivot) * (1 - 0.92 * blink)]);
      }) : pts;
      const key = `${st.wantExpr}:${st.exprT.toFixed(3)}:${blink.toFixed(3)}:${f.drop.toFixed(3)}`;
      if (key !== st.lastEyeKey) { buildEyes(squashed, f.drop); st.lastEyeKey = key; }
    }
  }

  function render() {
    renderer.render(scene, camera);
  }

  function loop(ts) {
    st.raf = 0;
    const t = ts / 1000;
    const dt = st.last ? Math.min(0.05, t - st.last) : 1 / 60;
    st.last = t;
    st.time += dt;
    step(dt);
    render();
    if (st.active && !st.reduced) st.raf = requestAnimationFrame(loop);
  }
  function kick() {
    if (st.reduced) { step(1); render(); return; }
    if (!st.raf && st.active) { st.last = 0; st.raf = requestAnimationFrame(loop); }
  }

  const lost = (e) => { e.preventDefault(); if (onLost) onLost(); };
  canvas.addEventListener("webglcontextlost", lost);

  return {
    set({ evolution, expression, reduced } = {}) {
      if (Number.isFinite(evolution)) st.target = clamp01(evolution);
      if (expression) st.expr = expression;
      if (typeof reduced === "boolean") st.reduced = reduced;
      kick();
    },
    impulse(kind = "card") {
      if (st.reduced) return;
      const big = kind === "chapter";
      st.squashV += big ? -3.2 : -1.4;
      st.ripple = big ? 0.035 : 0.018;
      st.rippleT = 0;
      kick();
    },
    react() {
      if (st.reduced || formAt(st.shown).expressive < 0.5) return;
      st.reaction = REACTIONS[st.reactionIndex++ % REACTIONS.length];
      st.reactionUntil = st.time + 1.5;
      kick();
    },
    setActive(on) {
      st.active = Boolean(on);
      if (!st.active && st.raf) { cancelAnimationFrame(st.raf); st.raf = 0; }
      else kick();
    },
    dispose() {
      if (st.raf) cancelAnimationFrame(st.raf);
      canvas.removeEventListener("webglcontextlost", lost);
      geo.dispose();
      shellMat.dispose();
      heartMat.dispose();
      backdrop.geometry.dispose();
      backdrop.material.dispose();
      bead.geometry.dispose();
      bead.material.dispose();
      eyeMat.dispose();
      eyes.forEach((m) => m.geometry && m.geometry.dispose());
      env.dispose();
      renderer.dispose();
    },
  };
}

function smooth01(x) {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
}
