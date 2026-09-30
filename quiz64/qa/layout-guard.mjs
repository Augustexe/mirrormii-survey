// Layout guard (package L2): walks the whole flow at 375x667, 390x844 and 1440x900 in both voices and fails on
// layout collisions. Steps: landing, setup, the three lobby steps, the chapter interlude, a card of each of the 12
// chapter formats, the lock (open and locked), a final sealed card, every Stories screen (scrolled in steps when a
// screen scrolls), and the whole Evidence Article scrolled in steps plus the phone section menu.
// On every step it checks, in the page:
//   overlap        visible text painted under or over other text, an icon or a control (hit stack at points on
//                  every text line; elements with a solid backing that are part of a fixed or sticky bar hide text
//                  legitimately; any other element on top of a text line is a collision)
//   see-through    text sliding under a fixed or sticky bar whose backing is not solid (alpha under 0.9)
//   clipped        text cut by an overflow: hidden or clip box (its own or an ancestor's); ellipsis or line clamp
//                  that actually truncates (data-truncate-ok opts an element out)
//   offscreen      text or a control running past the left or right edge, or the page scrolling sideways
//   cramped        a round or near-round pill control whose label wraps to three lines or more
//   covered-target a control that, once focused (Tab order, both directions), sits under a fixed or sticky bar
// Output: <outDir>/report.json (every failure with its step, selector, text and box) and one screenshot per failing
// step with the failing boxes outlined. Exit code 1 when a failure is not in EXCEPTIONS below.
//   PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node qa/layout-guard.mjs [baseUrl] [outDir]
// Env: SIZES=small,phone,desktop  VOICES=fun,heart  ONLY=<regex on the step label>  PLAYER=a|b|c (a leaning player)
// Needs the dev server (states are built in the page with the app's own session module). Runs with reduced motion so
// every step is measured at rest.
import fs from "node:fs";
import path from "node:path";
import { gotoStory, openRun } from "./layout-lib.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "playwright");
const BASE = process.argv[2] || "http://127.0.0.1:5215/";
const OUT = process.argv[3] || path.resolve("qa/layout-report");
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY) : null;
fs.mkdirSync(OUT, { recursive: true });

const SIZES = {
  small: { width: 375, height: 667, mobile: true },
  phone: { width: 390, height: 844, mobile: true },
  desktop: { width: 1440, height: 900, mobile: false },
};
const sizes = process.env.SIZES ? process.env.SIZES.split(",") : Object.keys(SIZES);
const voices = process.env.VOICES ? process.env.VOICES.split(",") : ["fun", "heart"];
const TYPES = ["scenario", "real", "this_or_that", "role", "pick_two", "receipts", "bet", "reply", "others", "feeling", "rank", "eyes"];
// Formats a run cannot reach are notes, not errors (LAUNCH-SPEC sections 4 and 10): feeling cards while SERVE_FEELING
// is off, and rank, whose one chapter card (C2-142) sits on the sub-question the chapter 2 opener takes, so only the
// extra X-L2-40 can serve it, and only for L2 coverage. tests/visual/fold.mjs still renders every card of both.
const { SERVE_FEELING } = await import("../../research/persona-quiz-v2/final/score-core.mjs");
const UNSERVED = { ...(SERVE_FEELING ? {} : { feeling: "feeling cards are off: SERVE_FEELING" }), rank: "rank cards are served only for coverage: one card per sub-question" };

// Justified exceptions: { kind, sel: RegExp on the selector, reason }. Keep this list short and explained.
const EXCEPTIONS = [];

// ------------------------------------------------------------------------------------------------ the in-page scan
function scan() {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const fails = [];
  const INTERACTIVE = "button, a[href], input, select, textarea, summary, [role=button], [role=radio], [role=tab], [role=checkbox], [role=switch]";
  const csCache = new Map();
  const cs = (el) => { let c = csCache.get(el); if (!c) { c = getComputedStyle(el); csCache.set(el, c); } return c; };
  const sel = (el) => {
    const parts = [];
    for (let e = el, i = 0; e && e.nodeType === 1 && i < 3; e = e.parentElement, i++) {
      const cls = typeof e.className === "string" ? e.className.trim().split(/\s+/).filter((c) => c && !/^is-|^rv-in$/.test(c)).slice(0, 2) : [];
      parts.unshift(`${e.tagName.toLowerCase()}${cls.length ? `.${cls.join(".")}` : ""}${e.id ? `#${e.id}` : ""}`);
    }
    return parts.join(" > ");
  };
  const box = (r) => ({ x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) });
  const shown = new Map();
  const isShown = (el) => {
    if (shown.has(el)) return shown.get(el);
    let ok = true;
    const c = cs(el);
    if (c.display === "none" || c.visibility === "hidden" || Number(c.opacity) < 0.05 || el.hasAttribute("hidden")) ok = false;
    else if (el.parentElement) ok = isShown(el.parentElement);
    shown.set(el, ok);
    return ok;
  };
  const srOnly = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const c = cs(e);
      if (c.clip === "rect(0px, 0px, 0px, 0px)" || /inset\(50%/.test(c.clipPath)) return true;
      const r = e.getBoundingClientRect();
      if (r.width <= 2 && r.height <= 2 && c.overflow !== "visible") return true;
    }
    return false;
  };
  const alpha = (color) => { const m = color.match(/rgba?\(([^)]+)\)/); if (!m) return color === "transparent" ? 0 : 1; const p = m[1].split(/[\s,/]+/).filter(Boolean); return p.length > 3 ? Number(p[3].replace("%", "")) / (p[3].includes("%") ? 100 : 1) : 1; };
  const color = (c) => { const m = String(c).match(/color\(srgb[^)]*\/\s*([\d.]+)\)/); return m ? Number(m[1]) : alpha(c); };
  // A fixed or sticky ancestor (a bar), or null.
  const barOf = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const p = cs(e).position; if (p === "fixed" || p === "sticky") return e; } return null; };
  // Strongest backing alpha between el and its ancestor `stop` (exclusive).
  const backing = (el, stop) => { let a = 0; for (let e = el; e && e !== stop && e !== document.documentElement; e = e.parentElement) { const c = cs(e); a = Math.max(a, color(c.backgroundColor)); if (c.backgroundImage !== "none" && !/gradient/.test(c.backgroundImage)) a = Math.max(a, 1); } return a; };
  const hasOwnText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && /\S/.test(n.data));
  // An icon: a small inline SVG (lucide glyphs, sigils). Large SVGs, images and canvases are art, not icons.
  // An icon: a small inline SVG in a control or a lucide glyph. Large SVGs, images, canvases and loose sparkles are art.
  const isIcon = (el) => { const s = el.closest("svg"); if (!s) return false; const b = s.getBoundingClientRect(); return b.width <= 48 && b.height <= 48 && (s.classList.contains("lucide") || Boolean(s.closest("button, a[href], [role=button]"))); };
  // Effective opacity: faint decoration (a 14% reflection, a ghost word) is not reading text.
  const opacityOf = (el) => { let o = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) o *= Number(cs(e).opacity); return o; };
  // The part of a rect that clipping ancestors (overflow other than visible) let through, or null.
  const visiblePart = (el, r) => {
    let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (let e = el.parentElement; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
      const c = cs(e);
      if (c.overflowX === "visible" && c.overflowY === "visible") continue;
      const b = e.getBoundingClientRect();
      if (c.overflowX !== "visible") { L = Math.max(L, b.left); R = Math.min(R, b.right); }
      if (c.overflowY !== "visible") { T = Math.max(T, b.top); B = Math.min(B, b.bottom); }
      if (R - L < 2 || B - T < 2) return null;
    }
    return { left: L, top: T, right: R, bottom: B, width: R - L, height: B - T };
  };
  // A card face turned away (backface-visibility: hidden inside a preserve-3d flip) is not painted.
  const turnedAway = (el) => {
    for (let face = el; face && face !== document.body; face = face.parentElement) {
      if (cs(face).backfaceVisibility !== "hidden") continue;
      // The face's own turn times every turn of the preserve-3d parents it sits in.
      let sign = 1;
      for (let e = face; e && e !== document.body; e = e.parentElement) {
        const t = cs(e).transform;
        if (t && t !== "none" && new DOMMatrix(t).a < 0) sign = -sign;
        if (!e.parentElement || cs(e.parentElement).transformStyle !== "preserve-3d") break;
      }
      if (sign < 0) return true;
    }
    return false;
  };
  const common = (a, b) => { for (let e = a; e; e = e.parentElement) if (e.contains(b)) return e; return null; };

  // Every visible text line: [element, rect].
  const lines = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (/\S/.test(n.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT) });
  const range = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const el = n.parentElement;
    if (!el || el.closest("script, style, noscript, svg, template") || !isShown(el) || srOnly(el) || turnedAway(el)) continue;
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) if (r.width > 1 && r.height > 1) lines.push([el, r, n.data.trim().slice(0, 60)]);
  }

  // Force hit testing on everything so decoration with pointer-events: none is still seen as painted above.
  const force = document.createElement("style");
  force.textContent = "*, *::before, *::after { pointer-events: auto !important; }";
  document.head.appendChild(force);
  const seen = new Set();
  const push = (f) => { const k = `${f.kind}|${f.sel}|${f.other || ""}`; if (!seen.has(k)) { seen.add(k); fails.push(f); } };

  for (let [el, r, text] of lines) {
    // offscreen: horizontally out of the viewport, unless a sideways scroller holds it
    if (r.right > W + 1 || r.left < -1) {
      let scroller = false;
      for (let e = el; e && e !== document.documentElement; e = e.parentElement) if (/auto|scroll/.test(cs(e).overflowX) && e !== document.body) { scroller = true; break; }
      const clippedAway = (() => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const c = cs(e); if (/hidden|clip/.test(c.overflowX)) { const b = e.getBoundingClientRect(); if (r.left >= b.right || r.right <= b.left) return true; } } return false; })();
      if (!scroller && !clippedAway) push({ kind: "offscreen", sel: sel(el), text, box: box(r) });
    }
    // clipped: an overflow hidden/clip box (own or ancestor) cuts the line; stop an axis at a scroller
    let stopX = false; let stopY = false;
    for (let e = el; e && e !== document.documentElement && e !== document.body; e = e.parentElement) {
      const c = cs(e);
      const b = e.getBoundingClientRect();
      const L = b.left + e.clientLeft; const T = b.top + e.clientTop;
      const R = L + (e.clientWidth || b.width); const B = T + (e.clientHeight || b.height);
      if (!stopX && /hidden|clip/.test(c.overflowX) && (r.left < L - 1 || r.right > R + 1) && r.right > L && r.left < R) { push({ kind: "clipped", sel: sel(el), text, box: box(r), other: sel(e) }); break; }
      if (!stopY && /hidden|clip/.test(c.overflowY) && (r.top < T - 1 || r.bottom > B + 1)) {
        // wholly outside a clipping box is "clipped away" too: text the reader can never reach
        push({ kind: "clipped", sel: sel(el), text, box: box(r), other: sel(e) }); break;
      }
      if (/auto|scroll/.test(c.overflowX)) stopX = true;
      if (/auto|scroll/.test(c.overflowY)) stopY = true;
      if (stopX && stopY) break;
    }
    // overlap and see-through: points along the painted part of the line, only where it is on screen
    if (opacityOf(el) < 0.2) continue;
    const vr = visiblePart(el, r);
    if (!vr) continue;
    r = vr;
    if (r.bottom < 1 || r.top > H - 1 || r.right < 1 || r.left > W - 1 || r.width < 4 || r.height < 4) continue;
    const y = Math.min(H - 1, Math.max(1, r.top + r.height / 2));
    const inset = Math.min(6, r.width / 4);
    for (const x of [r.left + inset, r.left + r.width / 2, r.right - inset]) {
      if (x < 1 || x > W - 1) continue;
      const stack = document.elementsFromPoint(x, y);
      for (const a of stack) {
        if (a === el || el.contains(a) || a.contains(el)) break; // reached the text itself (or its box): nothing above
        const c = cs(a);
        if (c.visibility === "hidden" || Number(c.opacity) < 0.05 || !isShown(a) || turnedAway(a)) continue;
        const bar = barOf(a);
        const barOfText = barOf(el);
        const anc = common(a, el);
        const back = backing(a, anc);
        if (bar && bar !== barOfText) {
          if (back < 0.9) push({ kind: "see-through", sel: sel(el), text, box: box(r), other: sel(bar), note: `bar backing alpha ${back.toFixed(2)}` });
          break; // a bar with a solid backing hides the text: fine
        }
        const ctl = a.closest(INTERACTIVE);
        if (isIcon(a) || (ctl && !ctl.contains(el))) { push({ kind: "overlap", sel: sel(el), text, box: box(r), other: sel(isIcon(a) ? a.closest("svg") : ctl) }); break; }
        if (hasOwnText(a) && srOnly(a) === false) { push({ kind: "overlap", sel: sel(el), text, box: box(r), other: sel(a) }); break; }
        if (back >= 0.9 && a.tagName !== "HTML" && a.tagName !== "BODY") { push({ kind: "overlap", sel: sel(el), text, box: box(r), other: sel(a), note: "covered by a solid element" }); break; }
      }
    }
  }
  force.remove();

  // truncation: ellipsis and line clamp that actually cut text
  for (const el of document.querySelectorAll("body *")) {
    if (!isShown(el) || el.closest("[data-truncate-ok]")) continue;
    const c = cs(el);
    if (c.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) push({ kind: "clipped", sel: sel(el), text: el.textContent.trim().slice(0, 60), box: box(el.getBoundingClientRect()), note: "ellipsis" });
    if (c.webkitLineClamp && c.webkitLineClamp !== "none" && el.scrollHeight > el.clientHeight + 1) push({ kind: "clipped", sel: sel(el), text: el.textContent.trim().slice(0, 60), box: box(el.getBoundingClientRect()), note: "line clamp" });
  }
  // offscreen controls and sideways page scroll
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    if (!isShown(el) || srOnly(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) continue;
    if (r.right > W + 1 || r.left < -1) {
      let scroller = false;
      for (let e = el.parentElement; e && e !== document.documentElement; e = e.parentElement) if (/auto|scroll|hidden|clip/.test(cs(e).overflowX) && e !== document.body) { scroller = true; break; }
      if (!scroller) push({ kind: "offscreen", sel: sel(el), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 60), box: box(r) });
    }
  }
  // cramped: a round or near-round pill control whose label wraps to three lines or more (text squeezed into a circle)
  for (const el of document.querySelectorAll(INTERACTIVE)) {
    if (!isShown(el) || srOnly(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || !/\S/.test(el.textContent || "")) continue;
    const radius = parseFloat(cs(el).borderTopLeftRadius) || 0;
    if (radius < r.height / 2 - 1 || r.width > r.height * 2.2) continue; // only round or near-round pills
    const rg = document.createRange();
    rg.selectNodeContents(el);
    const tops = new Set([...rg.getClientRects()].filter((x) => x.width > 1 && x.height > 6).map((x) => Math.round(x.top / 4)));
    if (tops.size >= 3) push({ kind: "cramped", sel: sel(el), text: el.textContent.trim().slice(0, 60), box: box(r), note: `${tops.size} lines in a pill` });
  }
  const side = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (side > 1) push({ kind: "offscreen", sel: "html", text: `page scrolls sideways by ${side}px`, box: { x: 0, y: 0, w: W, h: 1 } });
  return fails;
}

// Focus every control in Tab order (forward, then backward) and report the ones a fixed or sticky bar covers.
function focusWalk(scope) {
  const root = scope ? document.querySelector(scope) : document.body;
  if (!root) return [];
  const fails = [];
  const FOCUS = "button:not([disabled]), a[href], input:not([disabled]), select, textarea, summary, [tabindex]:not([tabindex='-1'])";
  const barOf = (el) => { for (let e = el; e && e !== document.documentElement; e = e.parentElement) { const p = getComputedStyle(e).position; if (p === "fixed" || p === "sticky") return e; } return null; };
  const list = [...root.querySelectorAll(FOCUS)].filter((el) => { const c = getComputedStyle(el); const r = el.getBoundingClientRect(); return c.visibility !== "hidden" && r.width > 2 && r.height > 2 && !el.closest("[hidden], [aria-hidden='true']"); });
  const start = window.scrollY;
  const scrolled = [...document.querySelectorAll("body *")].map((e) => [e, e.scrollTop, e.scrollLeft]);
  for (const order of [list, [...list].reverse()]) {
    for (const el of order) {
      el.focus();
      if (document.activeElement !== el) continue;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) continue;
      const pts = [[r.left + r.width / 2, r.top + Math.min(8, r.height / 2)], [r.left + r.width / 2, r.top + r.height / 2], [r.left + r.width / 2, r.bottom - Math.min(8, r.height / 2)]];
      for (const [x, y] of pts) {
        if (y < 0 || y > window.innerHeight) continue;
        const top = document.elementFromPoint(x, y);
        if (!top || el.contains(top) || top.contains(el)) continue;
        const bar = barOf(top);
        if (bar && !bar.contains(el)) { fails.push({ kind: "covered-target", sel: el.className ? `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]}` : el.tagName.toLowerCase(), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 60), box: { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }, other: bar.className || bar.tagName }); break; }
      }
    }
  }
  document.activeElement?.blur?.();
  // Focus may scroll a clipping box (overflow: hidden is still scrollable by focus): report it, then put it back.
  for (const [e, t, l] of scrolled) {
    if (e.scrollTop !== t && /hidden|clip/.test(getComputedStyle(e).overflowY) && e !== document.body) fails.push({ kind: "covered-target", sel: `${e.tagName.toLowerCase()}.${String(e.className).split(" ")[0]}`, text: `focus scrolled a clipped box by ${e.scrollTop - t}px`, box: { x: 0, y: 0, w: 10, h: 10 } });
    e.scrollTop = t; e.scrollLeft = l;
  }
  window.scrollTo(0, start);
  return fails;
}

// ------------------------------------------------------------------------------------------------ the walk
const report = { base: BASE, player: process.env.PLAYER || "a", at: new Date().toISOString(), sizes, voices, steps: 0, failures: [], exceptions: [], errors: [], notes: [] };
const excepted = (f) => EXCEPTIONS.find((e) => e.kind === f.kind && e.sel.test(f.sel));

async function check(page, meta, label, { focus = null } = {}) {
  if (ONLY && !ONLY.test(label)) return;
  report.steps++;
  await page.waitForTimeout(80);
  let fails = await page.evaluate(scan);
  if (focus) fails = fails.concat(await page.evaluate(focusWalk, focus === true ? null : focus));
  if (!fails.length) return;
  const real = [];
  for (const f of fails) {
    const x = excepted(f);
    const row = { size: meta.size, voice: meta.voice, step: label, ...f };
    if (x) report.exceptions.push({ ...row, reason: x.reason }); else real.push(row);
  }
  if (!real.length) return;
  const file = `${meta.size}-${meta.voice}-${label}.png`.replace(/[^a-z0-9.-]+/gi, "-");
  await page.evaluate((boxes) => {
    const host = document.createElement("div");
    host.id = "layout-guard-marks";
    host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none";
    for (const b of boxes) { const d = document.createElement("div"); d.style.cssText = `position:absolute;left:${b.x - 2}px;top:${b.y - 2}px;width:${b.w + 4}px;height:${b.h + 4}px;outline:2px solid #ff2d55;background:rgba(255,45,85,0.12)`; host.appendChild(d); }
    document.body.appendChild(host);
  }, real.map((f) => f.box));
  await page.screenshot({ path: path.join(OUT, file) });
  await page.evaluate(() => document.getElementById("layout-guard-marks")?.remove());
  for (const f of real) report.failures.push({ ...f, screenshot: file });
}

// A Stories screen, and when its body scrolls, the rest of it in steps.
async function checkScroller(page, meta, label, scope) {
  await check(page, meta, label, { focus: scope });
  const h = await page.evaluate((s) => { const b = document.querySelector(s); return b ? { sh: b.scrollHeight, ch: b.clientHeight } : null; }, scope);
  if (!h || h.sh <= h.ch + 1) return;
  for (let y = Math.round(h.ch * 0.7), i = 1; y < h.sh; y += Math.round(h.ch * 0.7), i++) {
    await page.evaluate(([s, top]) => { document.querySelector(s).scrollTop = top; }, [scope, y]);
    await page.waitForTimeout(150);
    await check(page, meta, `${label}-scroll${i}`);
  }
  await page.evaluate((s) => { document.querySelector(s).scrollTop = 0; }, scope);
}

async function walk(browser, size, voice) {
  const vp = SIZES[size];
  const meta = { size: `${vp.width}x${vp.height}`, voice };
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1, isMobile: vp.mobile, hasTouch: vp.mobile, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => report.errors.push(`${meta.size} ${voice}: ${e.message}`));
  // A group runs when ONLY matches its name or names one of its steps (ONLY=story-names runs the reveal walk).
  const want = (l) => !ONLY || ONLY.test(l) || ONLY.source.includes(l);
  const tag = `${vp.width}${voice}`;
  try {
    // Landing, setup, lobby and the first interlude, as a new player.
    if (want("landing") || want("setup") || want("lobby") || want("interlude")) {
      await openRun(page, BASE, null);
      await page.waitForSelector(".mm-app:not([aria-busy])", { timeout: 15000 }).catch(() => {});
      await page.waitForTimeout(900);
      await check(page, meta, "landing", { focus: true });
      await page.locator(".mm-landing__cta").click();
      await page.waitForSelector(".mm-setup");
      await page.waitForTimeout(600);
      await check(page, meta, "setup-closest", { focus: true });
      await page.locator(".mm-object").first().click();
      await page.waitForSelector(".mm-setup[data-step=pronoun]");
      await page.waitForTimeout(600);
      await check(page, meta, "setup-pronoun", { focus: true });
      await page.locator(".mm-pill").nth(2).click();
      await page.waitForSelector(".mm-lobby");
      await page.waitForTimeout(600);
      await check(page, meta, "lobby-voice", { focus: true });
      await page.locator(".mm-voice").nth(voice === "fun" ? 0 : 1).click();
      await page.waitForTimeout(1200);
      if (await page.locator(".mm-lobby[data-step=voice]").count()) await page.locator(".mm-panel__go").click();
      await page.waitForSelector(".mm-lobby[data-step=depth]");
      await page.waitForTimeout(600);
      await check(page, meta, "lobby-depth", { focus: true });
      await page.locator(".mm-depth").nth(1).click();
      await page.waitForTimeout(1200);
      if (await page.locator(".mm-lobby[data-step=depth]").count()) await page.locator(".mm-panel__go").click();
      await page.waitForSelector(".mm-lobby[data-step=rooms]");
      await page.waitForTimeout(600);
      await check(page, meta, "lobby-rooms", { focus: true });
      await page.locator(".mm-panel__go").click();
      await page.waitForSelector(".mm-interlude");
      await page.waitForTimeout(1200);
      await check(page, meta, "interlude", { focus: true });
    }
    // A card of every chapter format.
    for (const type of TYPES) {
      const label = `card-${type.replace(/_/g, "")}`;
      if (!want(label)) continue;
      const ok = await openRun(page, BASE, { voice, stop: "type", type, id: `lg${tag}${type.replace(/_/g, "")}`, tries: 30 });
      if (!ok) {
        if (UNSERVED[type]) report.notes.push(`${meta.size} ${voice}: no ${type} card reached (${UNSERVED[type]})`);
        else report.errors.push(`${meta.size} ${voice}: no ${type} card reached`);
        continue;
      }
      await page.waitForSelector(`article.pc[data-card-type=${type}]`, { timeout: 8000 }).catch(() => report.errors.push(`${meta.size} ${voice}: ${type} card not on screen`));
      await page.waitForTimeout(900);
      await check(page, meta, label, { focus: true });
    }
    // The lock, then locked; a final sealed card.
    if (want("lock")) {
      await openRun(page, BASE, { voice, stop: "lock", id: `lg${tag}lock` });
      await page.waitForSelector("main.lock", { timeout: 8000 });
      await page.waitForTimeout(1200);
      await check(page, meta, "lock", { focus: true });
      await page.getByRole("button", { name: /lock in genii/i }).click();
      await page.waitForTimeout(2400);
      await check(page, meta, "lock-locked");
    }
    if (want("finale")) {
      await openRun(page, BASE, { voice, stop: "finale", id: `lg${tag}fin` });
      const play = page.getByRole("button", { name: /play the last eight cards/i });
      if (await play.count()) await play.click();
      await page.waitForSelector("article.pc[data-phase=finale]", { timeout: 8000 }).catch(() => {});
      await page.waitForTimeout(900);
      await check(page, meta, "card-finale", { focus: true });
    }
    // Every Stories screen, then the whole article.
    if (want("story") || want("article")) {
      await openRun(page, BASE, { voice, stop: "result", id: `lg${tag}res` });
      await page.waitForSelector(".rv-room", { timeout: 15000 });
      const ids = await page.locator(".rv-slide").evaluateAll((els) => els.map((e) => e.dataset.story));
      if (want("story")) {
        for (const id of ids) {
          if (!(await gotoStory(page, id, 60))) { report.errors.push(`${meta.size} ${voice}: story ${id} not reached`); continue; }
          await page.waitForTimeout(id === "intro" ? 2600 : id === "share" ? 1800 : 1100);
          await checkScroller(page, meta, `story-${id}`, ".rv-slide.is-current .rv-body");
        }
      }
      if (want("article")) {
        await page.goto(`${BASE}#article`);
        await page.waitForSelector(".ea-cover", { timeout: 15000 });
        await page.waitForTimeout(1000);
        const total = await page.evaluate(() => document.documentElement.scrollHeight);
        const step = Math.round(vp.height * 0.6);
        for (let y = 0, i = 0; y < total; y += step, i++) {
          await page.evaluate((top) => window.scrollTo(0, top), y);
          await page.waitForTimeout(220);
          await check(page, meta, `article-${String(i).padStart(2, "0")}`);
        }
        await page.evaluate(() => window.scrollTo(0, 0));
        await check(page, meta, "article-focus", { focus: true });
        // The phone section menu, open, over the middle of the article.
        const menu = page.locator(".ea-tabs__menu");
        if (await menu.isVisible()) {
          await page.evaluate(() => document.getElementById("party")?.scrollIntoView({ block: "start" }));
          await page.waitForTimeout(300);
          await menu.click();
          await page.waitForTimeout(400);
          await check(page, meta, "article-menu");
          await page.keyboard.press("Escape");
        }
        // Every section tab: the section heading must land clear of the sticky bar.
        const tabs = await page.locator(".ea-tabs__list a, .ea-tabs__strip a").evaluateAll((els) => [...new Set(els.map((a) => a.getAttribute("href").split("/")[1]))]);
        for (const id of tabs) {
          await page.evaluate((s) => document.getElementById(s)?.scrollIntoView({ block: "start" }), id);
          await page.waitForTimeout(200);
          const hit = await page.evaluate((s) => {
            const h = document.querySelector(`#${s} .ea-h2`) || document.getElementById(s);
            const bar = document.querySelector(".ea-tabs");
            if (!h || !bar) return null;
            const hb = h.getBoundingClientRect(); const bb = bar.getBoundingClientRect();
            return hb.top < bb.bottom ? { heading: Math.round(hb.top), bar: Math.round(bb.bottom) } : null;
          }, id);
          if (hit && (!ONLY || ONLY.test("article-tabs"))) report.failures.push({ size: meta.size, voice, step: `article-tab-${id}`, kind: "covered-target", sel: `#${id} .ea-h2`, text: `heading top ${hit.heading} under bar bottom ${hit.bar}`, box: { x: 0, y: hit.heading, w: vp.width, h: 10 } });
        }
      }
    }
  } catch (e) {
    report.errors.push(`${meta.size} ${voice}: ${String(e).split("\n")[0]}`);
  }
  await ctx.close();
}

const browser = await chromium.launch({ channel: "chrome" });
await Promise.all(sizes.flatMap((s) => voices.map((v) => walk(browser, s, v))));
await browser.close();

const byKind = {};
for (const f of report.failures) byKind[f.kind] = (byKind[f.kind] || 0) + 1;
report.summary = { steps: report.steps, failures: report.failures.length, byKind, exceptions: report.exceptions.length, errors: report.errors.length, notes: report.notes.length };
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.summary));
for (const f of report.failures.slice(0, 60)) console.log(`${f.size} ${f.voice} ${f.step} ${f.kind}: ${f.sel} "${f.text}"${f.other ? ` / ${f.other}` : ""}${f.note ? ` (${f.note})` : ""}`);
if (report.failures.length > 60) console.log(`... ${report.failures.length - 60} more in ${path.join(OUT, "report.json")}`);
if (report.notes.length) console.log(`notes (not failures):\n${report.notes.join("\n")}`);
if (report.errors.length) console.log(report.errors.join("\n"));
if (report.failures.length || report.errors.length) process.exitCode = 1;
