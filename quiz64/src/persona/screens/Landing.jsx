import React, { useEffect, useRef } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { Reflect } from "../../system/index.js";
import { LOBBY_COPY } from "../lobby.js";
import { FogMirror } from "./FogMirror.jsx";

/**
 * Landing (DESIGN-DIRECTION 5.1): kicker, a two-line hero with the reflection device on its second line, a two-line
 * promise, one primary action, and the fogged mirror you can wipe clear. Chips and "How this works" below the fold.
 * progress: null (new), "run" (answers waiting) or "result".
 */
export function PersonaLanding({ progress, onBegin, onHow, seed }) {
  const L = LOBBY_COPY.landing;
  const label = progress === "result" ? "See my result" : progress === "run" ? "Pick up where I left off" : "Meet Genii";
  const stage = useRef(null);
  // Desktop pointer parallax: the mirror moves 6 px, the glows 14 px (CSS reads --px and --py, -1 to 1).
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof window === "undefined" || !window.matchMedia?.("(pointer: fine)").matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        el.style.setProperty("--px", ((e.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        el.style.setProperty("--py", ((e.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);
  return (
    <main className="mm-screen mm-landing" ref={stage}>
      <section className="mm-landing__hero">
        <div className="mm-landing__copy">
          <p className="mm-kicker mm-enter" style={{ "--step": 0 }}>{L.kicker}</p>
          <h1 className="mm-landing__title mm-enter" style={{ "--step": 0 }}>
            <span className="mm-landing__line">Let’s get</span>{" "}
            <Reflect className="mm-landing__line mm-landing__line--violet">oddly specific.</Reflect>
          </h1>
          <p className="mm-landing__promise mm-enter" style={{ "--step": 1 }}>{L.promise}</p>
          <div className="mm-landing__actions mm-enter" style={{ "--step": 2 }}>
            <button type="button" className="mm-btn mm-btn--primary mm-landing__cta" onClick={onBegin}>
              {label} <ArrowRight size={19} strokeWidth={2} aria-hidden="true" />
            </button>
            {progress ? <span className="mm-landing__resume">{L.resume}</span> : null}
          </div>
          <ul className="mm-landing__chips mm-landing__chips--desk mm-enter" style={{ "--step": 3 }} aria-label="How the game works">
            {L.chips.map((c) => <li key={c} className="mm-chip">{c}</li>)}
          </ul>
        </div>
        <div className="mm-landing__stage mm-decor">
          <FogMirror seed={seed || "mirrormii-landing"} />
        </div>
      </section>
      <section className="mm-landing__below" aria-label="More about the game">
        <ul className="mm-landing__chips mm-landing__chips--phone" aria-label="How the game works" tabIndex={0}>
          {L.chips.map((c) => <li key={c} className="mm-chip">{c}</li>)}
        </ul>
        <button type="button" className="mm-how mm-tile" onClick={onHow}>
          <span className="mm-how__mark" aria-hidden="true"><BookOpen size={18} strokeWidth={1.75} /></span>
          <span className="mm-how__copy"><strong>{L.howTitle}</strong><small>{L.howSub}</small></span>
          <ArrowRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </section>
    </main>
  );
}
