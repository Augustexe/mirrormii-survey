// The Evidence Article page (LAUNCH-SPEC section 25 item 3): the long read after the Stories deck. A normal document
// that scrolls natively. Nothing here moves the page on its own: the only programmatic page scroll is the one a reader
// asks for by tapping a section tab (or opening a deep link to a section). The scroll spy only marks the current tab
// and slides the tab strip itself sideways (ul.scrollTo), never the page; concept C's bug was scrollIntoView on the
// active tab, which scrolled the document too and cancelled the reader's scroll.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { buildArticle } from "./article-data.js";
import { Closing, Cover, Lede, OpenBook, Party, Record, Rooms, Stats, Surprise, Traits, TwoSides } from "./ArticleSections.jsx";
import "./article.css";

const reducedMotion = () => {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.body.dataset.motion === "off"; } catch { return true; }
};

// Section reveals: each [data-reveal] block gets data-in when it first comes into view (IntersectionObserver, no scroll
// listener). Until the page has mounted, and with reduced motion, everything is simply visible.
function useReveal(root) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    if (reducedMotion()) { el.dataset.motion = "off"; return undefined; }
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) { e.target.setAttribute("data-in", ""); io.unobserve(e.target); }
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    el.querySelectorAll("[data-reveal]").forEach((n) => io.observe(n));
    el.dataset.motion = "on";
    return () => io.disconnect();
  }, [root]);
}

// Which tab is current: the last section whose top has passed the line under the sticky bar.
function useSpy(root, tabs, onChange) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const secs = [...el.querySelectorAll("[data-tab]")];
    const seen = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) seen.set(e.target, e.isIntersecting);
      const on = secs.filter((s) => seen.get(s));
      if (on.length) onChange(on[0].dataset.tab);
    }, { rootMargin: "-30% 0px -55% 0px" });
    secs.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [root, tabs, onChange]);
}

export function ArticlePage({ stories, lib, section = null, onBack, onChallenge, onData, onSave, onSection }) {
  const A = useMemo(() => buildArticle({ stories, lib }), [stories, lib]);
  const root = useRef(null);
  const strip = useRef(null);
  const [current, setCurrent] = useState(null);
  const [menu, setMenu] = useState(false);
  const menuRef = useRef(null);
  useReveal(root);
  useSpy(root, A.tabs, setCurrent);

  // The tab strip follows the current tab by scrolling itself sideways; the page is never touched.
  useEffect(() => {
    const ul = strip.current;
    if (!ul || !current) return;
    const a = ul.querySelector(`[data-id="${current}"]`);
    if (!a) return;
    const left = a.offsetLeft - (ul.clientWidth - a.offsetWidth) / 2;
    const max = ul.scrollWidth - ul.clientWidth;
    ul.scrollTo({ left: Math.max(0, Math.min(max, left)), behavior: reducedMotion() ? "auto" : "smooth" });
  }, [current]);

  // Opening: the top of the page, or the section a deep link names (an explicit request, so the page may move).
  useEffect(() => {
    const target = section ? document.getElementById(section) : null;
    if (target) { target.scrollIntoView({ block: "start" }); target.querySelector(".ea-h2")?.focus({ preventScroll: true }); }
    else { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); document.getElementById("ea-h1")?.focus({ preventScroll: true }); }
    // Only on open: later section changes come from the reader's own taps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The phone section menu closes on Escape and on a tap outside it.
  useEffect(() => {
    if (!menu) return undefined;
    const onKey = (e) => { if (e.key === "Escape") setMenu(false); };
    const onDown = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("pointerdown", onDown); };
  }, [menu]);

  const go = (id) => (e) => {
    e.preventDefault();
    setMenu(false);
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
    target.querySelector(".ea-h2")?.focus({ preventScroll: true });
    setCurrent(id);
    if (onSection) onSection(id);
  };

  return (
    <div className="ea" ref={root} data-wording={A.wording}>
      <header className="ea-top">
        <button type="button" className="ea-back" onClick={onBack}><ChevronLeft size={20} strokeWidth={1.75} aria-hidden="true" />{A.back}</button>
        <img className="ea-top__mark" src={`${import.meta.env.BASE_URL}assets/mirrormii-wordmark.svg`} width="96" height="20" alt="MirrorMii" />
      </header>
      <main className="ea-main">
        <Cover A={A} />
        <nav className="ea-tabs" aria-label={A.tabsLabel} ref={menuRef}>
          <button type="button" className="ea-tabs__menu" aria-expanded={menu} aria-controls="ea-sections" onClick={() => setMenu((m) => !m)}>
            <i aria-hidden="true" /><span>{(A.tabs.find((t) => t.id === current) || {}).label || A.tabsLabel}</span>
            <small>{A.allSections}</small><ChevronDown size={18} strokeWidth={2} aria-hidden="true" />
          </button>
          <ul className="ea-tabs__list" id="ea-sections" data-open={menu ? "true" : undefined}>
            {A.tabs.map((t) => (
              <li key={t.id}>
                <a href={`#article/${t.id}`} aria-current={current === t.id ? "location" : undefined} onClick={go(t.id)}><i aria-hidden="true" />{t.label}</a>
              </li>
            ))}
          </ul>
          <ul className="ea-tabs__strip" ref={strip}>
            {A.tabs.map((t) => (
              <li key={t.id}>
                <a href={`#article/${t.id}`} data-id={t.id} aria-current={current === t.id ? "location" : undefined} onClick={go(t.id)} data-tab-link={t.id}>
                  <i aria-hidden="true" />{t.label}
                </a>
              </li>
            ))}
          </ul>
          <span className="ea-tabs__progress" aria-hidden="true" />
        </nav>
        <Lede A={A} />
        <Stats A={A} />
        <Traits A={A} />
        <Surprise A={A} onSave={onSave} />
        <Rooms A={A} />
        <TwoSides A={A} />
        <OpenBook A={A} />
        <Record A={A} />
        <Party A={A} onChallenge={onChallenge} />
        <Closing A={A} onChallenge={onChallenge} />
      </main>
      <footer className="ea-foot">
        <p>{A.closing.foot}</p>
        <p className="ea-foot__links">
          <button type="button" className="ea-textbtn" onClick={onBack}>{A.back}</button>
          {onData ? <button type="button" className="ea-textbtn" onClick={onData}>Your data</button> : null}
        </p>
      </footer>
    </div>
  );
}

export default ArticlePage;
