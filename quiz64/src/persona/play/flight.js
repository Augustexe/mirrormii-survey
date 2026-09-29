// Detached DOM effects that outlive the card (the card unmounts 200 ms after a tap, the effects keep going):
// the shard flight from the tapped answer to its slot in the rail (5.9), and "ghosts" (a torn receipt falling away,
// a this-or-that slab dissolving). Transform and opacity only; nothing here runs under reduced motion.
import { shardFor, SHARD_VIEWBOX, SPARKLE, SPARKLE_VIEWBOX } from "../../art/shapes.js";

const SVG = "http://www.w3.org/2000/svg";
const canAnimate = () => typeof document !== "undefined" && typeof Element !== "undefined" && typeof Element.prototype.animate === "function";

function layer() {
  let el = document.getElementById("play-fx");
  if (!el) {
    el = document.createElement("div");
    el.id = "play-fx";
    el.className = "play-fx";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
  }
  return el;
}

function shape(path, viewBox, w, h, color) {
  const svg = document.createElementNS(SVG, "svg");
  svg.setAttribute("viewBox", viewBox);
  svg.setAttribute("width", String(w));
  svg.setAttribute("height", String(h));
  const p = document.createElementNS(SVG, "path");
  p.setAttribute("d", path);
  p.setAttribute("fill", color);
  p.setAttribute("stroke", "var(--c-surface-solid)");
  p.setAttribute("stroke-width", "1");
  svg.appendChild(p);
  return svg;
}

// Read a duration token (ms) from the live theme, so Dusk flies slower and Clear quicker.
export function tokenMs(name, fallback) {
  try {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(`--d-${name}`).trim();
    const n = parseFloat(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

const easing = (name, fallback) => {
  try {
    return getComputedStyle(document.documentElement).getPropertyValue(`--e-${name}`).trim() || fallback;
  } catch {
    return fallback;
  }
};

/**
 * A glass shard flies on an arc from `from` ({x, y} viewport px) to the element `to` (or a point).
 * color: a CSS color (chapter tint var). trail: sparkles behind it. delay: ms before it lifts off (the pick bounce
 * plays first); onLaunch fires as it lifts off, onLand as it arrives. Round 2: a larger glass shard with a white rim
 * and a soft chapter glow, which grows as it lifts, spins once and shrinks into its slot.
 */
export function flyShard({ from, to, color, index = 0, trail = true, delay = 0, onLaunch, onLand }) {
  if (!canAnimate() || !from || !to) { onLaunch?.(); onLand?.(); return; }
  const scale = tokenMs("slow", 420) / 420;
  const wait = Math.max(0, delay) * scale;
  const launch = () => {
    const target = to instanceof Element ? to.getBoundingClientRect() : { left: to.x, top: to.y, width: 0, height: 0 };
    const tx = target.left + target.width / 2;
    const ty = target.top + target.height / 2;
    const dx = tx - from.x;
    const dy = ty - from.y;
    const host = layer();
    const node = document.createElement("span");
    node.className = "play-fx__shard";
    node.style.left = `${from.x - 8}px`;
    node.style.top = `${from.y - 12}px`;
    node.style.setProperty("--fx-tint", color);
    node.appendChild(shape(shardFor(index), SHARD_VIEWBOX, 16, 24, color));
    host.appendChild(node);
    onLaunch?.();
    const ms = tokenMs("slow", 420) * 1.1;
    const lift = Math.min(140, Math.max(56, Math.abs(dx) * 0.4 + Math.abs(dy) * 0.12));
    const frames = [
      { transform: "translate(0, 0) scale(0.7) rotate(0deg)", opacity: 0 },
      { transform: `translate(${dx * 0.08}px, ${dy * 0.08 - lift * 0.35}px) scale(1.45) rotate(40deg)`, opacity: 1, offset: 0.18 },
      { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - lift}px) scale(1.2) rotate(200deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.45) rotate(340deg)`, opacity: 0.35 },
    ];
    const anim = node.animate(frames, { duration: ms, easing: easing("in-out", "cubic-bezier(0.65, 0, 0.35, 1)"), fill: "forwards" });
    if (trail) {
      for (let i = 0; i < 7; i++) {
        const t = (i + 1) / 8;
        const s = document.createElement("span");
        s.className = "play-fx__spark";
        const x = from.x + dx * t;
        const y = from.y + dy * t - lift * 4 * t * (1 - t);
        s.style.left = `${x - 4}px`;
        s.style.top = `${y - 4}px`;
        s.appendChild(shape(SPARKLE, SPARKLE_VIEWBOX, 8, 8, i % 2 ? color : "var(--c-violet-300)"));
        host.appendChild(s);
        const a = s.animate(
          [{ opacity: 0, transform: "scale(0.4)" }, { opacity: 0.95, transform: "scale(1.1)", offset: 0.3 }, { opacity: 0, transform: "scale(0.2)" }],
          { duration: ms * 0.8, delay: ms * t * 0.85, easing: "ease-out", fill: "backwards" },
        );
        a.onfinish = () => s.remove();
      }
    }
    anim.onfinish = () => { node.remove(); onLand?.(); };
    anim.oncancel = () => node.remove();
  };
  if (wait) setTimeout(launch, wait); else launch();
}

/**
 * A shard arrives: the target flashes (class `cls` for one beat) and a ring of light ripples out from it.
 */
export function catchShard(el, cls = "is-caught") {
  if (!canAnimate() || !el || !el.isConnected) return;
  el.classList.remove(cls);
  // Restart the flash even when two answers land in a row.
  void el.getBoundingClientRect();
  el.classList.add(cls);
  const ms = tokenMs("slow", 420);
  setTimeout(() => el.classList.remove(cls), ms * 1.6);
  const r = el.getBoundingClientRect();
  const ring = document.createElement("span");
  ring.className = "play-fx__ring";
  const d = Math.max(28, Math.min(64, Math.max(r.width, r.height) * 1.3));
  Object.assign(ring.style, { left: `${r.left + r.width / 2 - d / 2}px`, top: `${r.top + r.height / 2 - d / 2}px`, width: `${d}px`, height: `${d}px` });
  layer().appendChild(ring);
  const a = ring.animate(
    [{ opacity: 0.9, transform: "scale(0.35)" }, { opacity: 0, transform: "scale(1.6)" }],
    { duration: ms * 1.4, easing: easing("out", "cubic-bezier(0.2, 0.8, 0.2, 1)") },
  );
  a.onfinish = () => ring.remove();
  a.oncancel = () => ring.remove();
}

/**
 * Clone an element into the fixed effects layer at its current place and animate the clone. The original can then
 * unmount. keyframes: WAAPI frames; the clone keeps the original's size.
 */
export function ghost(el, keyframes, { duration, easing: ease = "ease-in", className = "" } = {}) {
  if (!canAnimate() || !el) return null;
  const r = el.getBoundingClientRect();
  const clone = el.cloneNode(true);
  clone.removeAttribute("id");
  clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
  clone.setAttribute("aria-hidden", "true");
  clone.classList.add("play-fx__ghost");
  if (className) clone.classList.add(className);
  Object.assign(clone.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, margin: "0" });
  layer().appendChild(clone);
  const anim = clone.animate(keyframes, { duration: duration ?? tokenMs("slow", 420), easing: ease, fill: "forwards" });
  anim.onfinish = () => clone.remove();
  anim.oncancel = () => clone.remove();
  return anim;
}

// Eight sparkles bursting from the centre of a rect (the this-or-that dissolve).
export function burst(rect, count = 8, color = "var(--c-violet-300)") {
  if (!canAnimate() || !rect) return;
  const host = layer();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const ms = tokenMs("slow", 420) * 0.76;
  for (let i = 0; i < Math.min(12, count); i++) {
    const a = (i / count) * Math.PI * 2;
    const s = document.createElement("span");
    s.className = "play-fx__spark";
    s.style.left = `${cx - 5 + Math.cos(a) * rect.width * 0.18}px`;
    s.style.top = `${cy - 5 + Math.sin(a) * rect.height * 0.25}px`;
    s.appendChild(shape(SPARKLE, SPARKLE_VIEWBOX, 10, 10, color));
    host.appendChild(s);
    const d = 26 + (i % 3) * 10;
    const anim = s.animate(
      [{ opacity: 0, transform: "translate(0,0) scale(0.3)" }, { opacity: 1, transform: `translate(${Math.cos(a) * d * 0.5}px, ${Math.sin(a) * d * 0.5}px) scale(1)`, offset: 0.35 }, { opacity: 0, transform: `translate(${Math.cos(a) * d}px, ${Math.sin(a) * d}px) scale(0.4)` }],
      { duration: ms, easing: "ease-out" },
    );
    anim.onfinish = () => s.remove();
  }
}
