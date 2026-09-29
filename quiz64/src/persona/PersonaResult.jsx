import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy, Download, Heart, Lock, RotateCcw, Trash2 } from "lucide-react";
import { GeniiStage } from "../components/GeniiStage.jsx";
import { shareText } from "./views.js";
import { downloadShareImage } from "./share-image.js";
import { FriendsPanel } from "./FriendsPanel.jsx";

function OnlyYou() {
  return <span className="pr-only-you"><Lock size={11} aria-hidden="true" /> Only you see this</span>;
}

function Chip({ chip }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="pr-chip-wrap">
      <button type="button" className={`pr-chip ${chip.flex ? "pr-chip--flex" : ""} ${chip.unfinished ? "pr-chip--open" : ""}`} aria-expanded={open} onClick={() => setOpen(!open)}>
        {chip.unfinished ? "?" : chip.pole}{chip.flex && <small>Flex</small>}
      </button>
      {open && <span className="pr-chip-line" role="note">{chip.unfinished ? "This side isn't finished yet." : chip.line}</span>}
    </span>
  );
}

function StatusPill({ status }) {
  const text = { hit: "Called it", miss: "Missed", pass: "Passed", skipped: "Skipped", unanswered: "Skipped" }[status];
  return <span className={`pr-pill pr-pill--${status}`}>{status === "hit" && <Check size={12} aria-hidden="true" />}{text}</span>;
}

export function PersonaResult({ view, friends, onFriendAction, onRestart, onDownload, onDelete, storageOK }) {
  const heading = useRef(null);
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState("");
  const invite = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, []);
  const [rel, life] = view.typeName.split(" × ");
  const copyShare = async () => {
    try { await navigator.clipboard.writeText(shareText(view.share)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const saveImage = async () => {
    setImageError("");
    try { await downloadShareImage(view.share); } catch { setImageError("The image couldn't be made in this browser. Copy the text instead."); }
  };
  return (
    <motion.main className="persona-result page-enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <section className="pr-hero" aria-labelledby="pr-type">
        <div className="pr-hero__copy">
          <span className="eyebrow">Genii's read on you</span>
          <h1 id="pr-type" ref={heading} tabIndex="-1" className="pr-type">
            <span>{rel}</span> <em aria-hidden="true">×</em><span className="sr-only"> and </span> <span>{life}</span>
          </h1>
          <p className="pr-code">{view.code}</p>
          {view.badges.map((b, i) => (
            <p className="pr-badge" key={i}><b>{b.badge}</b> <span>{b.on}.</span> {b.line}</p>
          ))}
          <p className="pr-storage">{storageOK ? "Saved on this device only." : "Saving is unavailable. This result lives in this tab."}</p>
        </div>
        <div className="pr-hero__stage"><GeniiStage mood="attentive" compact bubble="Told you I was taking notes." /></div>
      </section>

      <section className="pr-halves" aria-label="The two halves">
        {view.halves.map((h) => (
          <article className={`pr-half pr-half--${h.side}`} key={h.side}>
            <span className="pr-kicker">{h.side === "relationship" ? "With your people" : "How you run your life"}</span>
            <h2>{h.name}</h2>
            <p>{h.desc}</p>
            <div className="pr-chips">{h.chips.map((c, i) => <Chip chip={c} key={i} />)}</div>
          </article>
        ))}
      </section>

      <section className="pr-pair">
        <article className="pr-panel pr-panel--sting">
          <div className="pr-panel__head"><h2>What stings</h2><OnlyYou /></div>
          <ul>{view.stings.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </article>
        <article className="pr-panel pr-panel--heart">
          <div className="pr-panel__head"><h2>What you love about it</h2></div>
          <ul>{view.hearts.map((s, i) => <li key={i}><Heart size={14} aria-hidden="true" /> {s}</li>)}</ul>
        </article>
      </section>

      <section className="pr-tags" aria-labelledby="pr-tags-title">
        <h2 id="pr-tags-title">Your tags</h2>
        {view.noTagsReason && (
          <p className="pr-empty">
            {view.noTagsReason === "rushed"
              ? "Genii didn't name any this time. Most answers came in super fast, and Genii only names what at least one unhurried answer backs up. Play again at your own pace and see what shows up."
              : "Genii didn't find enough to name one yet. Skips and “Not my life” never count, so there wasn't much to go on."}
          </p>
        )}
        <div className="pr-tag-list">
          {view.tags.map((t) => (
            <article className={`pr-tag pr-tag--${t.strength}`} key={t.key}>
              <header><h3>{t.name}</h3><span className="pr-strength">{t.strength}</span></header>
              {t.quotes.length > 0 && (
                <div className="pr-told"><span>You told Genii:</span><ul>{t.quotes.map((q, i) => <li key={i}>{q}</li>)}</ul></div>
              )}
              <p className="pr-tag-sting"><OnlyYou /> {t.sting}</p>
              <p className="pr-tag-heart"><Heart size={14} aria-hidden="true" /> <em>{t.heart}</em></p>
            </article>
          ))}
        </div>
      </section>

      {view.calls.length > 0 && (
        <section className="pr-calls" aria-labelledby="pr-calls-title">
          <h2 id="pr-calls-title">Genii's calls</h2>
          <ul>{view.calls.map((c, i) => <li key={i}><ArrowRight size={16} aria-hidden="true" /> {c}</li>)}</ul>
        </section>
      )}

      {view.plotTwist && (
        <section className="pr-twist" aria-labelledby="pr-twist-title">
          <div className="pr-panel__head"><h2 id="pr-twist-title">Plot twist</h2><OnlyYou /></div>
          <p>{view.plotTwist}</p>
        </section>
      )}

      <section className="pr-guesses" aria-labelledby="pr-guesses-title">
        <h2 id="pr-guesses-title">Genii's guesses</h2>
        <p className="pr-guess-line">{view.guesses.line}</p>
        <ol>
          {view.guesses.rows.map((r) => (
            <li key={r.key} className={`pr-guess pr-guess--${r.status}`}>
              <p className="pr-guess__prompt">{r.prompt}</p>
              {r.guess && <p><b>Genii guessed</b> {r.guess}</p>}
              {r.answer && <p><b>You</b> {r.answer}</p>}
              <p className="pr-guess__note"><StatusPill status={r.status} /> {r.note}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pr-share" aria-labelledby="pr-share-title">
        <div className="pr-share__intro">
          <span className="eyebrow">Share card</span>
          <h2 id="pr-share-title">The part you can show people</h2>
          <p>Your type, what Genii calls you, and the lines you love about yourself. Never your stings, your answers or Genii's guesses.</p>
        </div>
        <figure className="pr-share-card" aria-label="Share card preview">
          <span className="pr-share-card__brand">Genii · MirrorMii</span>
          <strong className="pr-share-card__type">{view.share.typeName}</strong>
          {view.share.tags.length > 0 && <ul>{view.share.tags.map((t, i) => <li key={i}><b>{t.name}</b> <span>{t.heart}</span></li>)}</ul>}
          <button type="button" className="button button--primary" onClick={() => invite.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>
            {view.share.invite} <ArrowRight size={17} />
          </button>
        </figure>
        <div className="pr-share__actions">
          <button type="button" className="button button--secondary" onClick={saveImage}><Download size={16} /> Save as image</button>
          <button type="button" className="button button--secondary" onClick={copyShare}><Copy size={16} /> {copied ? "Copied" : "Copy the text"}</button>
          {imageError && <p className="save-error" role="alert">{imageError}</p>}
        </div>
      </section>

      <div ref={invite} className="pr-anchor" />
      <FriendsPanel friends={friends} onAction={onFriendAction} />

      <footer className="pr-footer">
        <p>This is a game about you, not a test of you. Your answers never left this device.</p>
        <div className="pr-footer__actions">
          <button type="button" className="button button--quiet" onClick={onDownload}><Download size={16} /> Download my data</button>
          <button type="button" className="button button--quiet" onClick={onRestart}><RotateCcw size={16} /> Play again from the start</button>
          <button type="button" className="button button--quiet pr-danger" onClick={onDelete}><Trash2 size={16} /> Delete my data</button>
        </div>
      </footer>
    </motion.main>
  );
}

