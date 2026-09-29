import React, { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, EyeOff, Eye, Heart, Lock } from "lucide-react";

function Zone({ zone, tone, children }) {
  return (
    <article className={`fr-zone fr-zone--${tone}`}>
      <h2>{zone.title}</h2>
      {zone.sub && <p className="fr-zone__sub">{zone.sub}</p>}
      {zone.items.length ? <ul>{zone.items.map((item, i) => <li key={i}>{item}</li>)}</ul> : zone.empty ? <p className="fr-empty">{zone.empty}</p> : null}
      {children}
    </article>
  );
}

// Owner only: how one friend read you. Stings show here because only the owner sees this page.
export function FriendResultsView({ view, onBack, onHideRoast }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [view.challengeId]);
  return (
    <motion.main className="persona-result fr page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
      <button type="button" className="button button--quiet fr-back" onClick={onBack}><ArrowLeft size={16} /> Back to my result</button>
      <section className="pr-hero fr-hero">
        <div className="pr-hero__copy">
          <span className="eyebrow"><Lock size={12} aria-hidden="true" /> Only you see this page</span>
          <h1 ref={heading} tabIndex="-1" className="fr-title">{view.title}</h1>
          <p className="fr-compare">{view.comparison}</p>
          {view.flexNotes.map((n, i) => <p className="fr-flex" key={i}>{n}</p>)}
          <p className="fr-band">{view.band}</p>
          <div className="fr-counts">
            <span><b>{view.x}/6</b> sides</span>
            {view.level2Line && <span>{view.level2Line}</span>}
            {view.level3Line && <span>{view.level3Line}</span>}
          </div>
        </div>
      </section>
      <section className="fr-zones">
        <Zone zone={view.zones.getYou} tone="get" />
        <Zone zone={view.zones.dontSee} tone="miss" />
        <Zone zone={view.zones.thinkYouAre} tone="think" />
        {view.zones.otherGuesses.items.length > 0 && <Zone zone={view.zones.otherGuesses} tone="other" />}
      </section>
      {view.biggestMiss && (
        <section className="pr-twist fr-surprise">
          <h2>{view.biggestMiss.title}</h2>
          <p>{view.biggestMiss.line}</p>
          {view.biggestMiss.reason && <p className="fr-reason">{view.biggestMiss.reason}</p>}
        </section>
      )}
      {view.level4 && (
        <section className="pr-panel fr-bonus">
          <h2>Bonus round</h2>
          {view.level4.sting && <p><Heart size={14} aria-hidden="true" /> {view.level4.sting}</p>}
          <h3>{view.level4.roastHeader}</h3>
          {view.level4.roast ? (
            view.level4.hidden
              ? <p className="fr-empty">Roast hidden. <button type="button" className="persona-link" onClick={() => onHideRoast(false)}><Eye size={14} /> Show it again</button></p>
              : <>
                <blockquote>“{view.level4.roast.text}”</blockquote>
                <p>{view.level4.roast.line}</p>
                <button type="button" className="persona-link" onClick={() => onHideRoast(true)}><EyeOff size={14} /> {view.level4.hideLabel}</button>
              </>
          ) : <p className="fr-empty">{view.level4.roastSkipped}</p>}
        </section>
      )}
    </motion.main>
  );
}
