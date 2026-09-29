// Tap-through Stories for the final screen: progress bars on top, tap the right side (or the right arrow key) to go
// on, the left side (or left arrow) to go back. Every screen is in the markup (inactive ones hidden), so the page
// server-renders whole. Motion is CSS only and stops under reduced motion or the header's Motion off.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import { StoryScreen } from "./StoryScreens.jsx";
import { GUESS_COPY, printFor } from "./story-data.js";
import { shareText } from "../views.js";
import { downloadShareImage, downloadStoryImage } from "../share-image.js";
import { FriendsPanel } from "../FriendsPanel.jsx";
import "./stories.css";

const FRIEND_SHEET_TITLE = "Send it to a friend";
const INTERACTIVE = "button, a, input, textarea, select, label, summary, [role='dialog']";

function Sheet({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = typeof document !== "undefined" ? document.activeElement : null;
    ref.current?.focus({ preventScroll: true });
    return () => { if (prev && prev.focus) prev.focus({ preventScroll: true }); };
  }, []);
  return (
    <div className="pst-sheet-wrap" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pst-sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex="-1" ref={ref}>
        <header className="pst-sheet__head">
          <h2>{title}</h2>
          <button type="button" className="pst-icon" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        <div className="pst-sheet__body">{children}</div>
      </div>
    </div>
  );
}

export function GuessSheet({ guesses }) {
  return (
    <div className="pst-guesses">
      <p>{GUESS_COPY.intro}</p>
      {guesses.called > 0 ? (
        <p className="pst-guesses__score"><strong>{guesses.exact} of {guesses.called}</strong> called exactly.</p>
      ) : <p className="pst-guesses__score">{GUESS_COPY.none}</p>}
      <ol>
        {guesses.rows.map((r) => (
          <li key={r.key} className={`pst-guess pst-guess--${r.status}`}>
            <span className="pst-guess__prompt">{r.prompt}</span>
            <span className="pst-guess__pill">{r.status === "hit" && <Check size={12} aria-hidden="true" />}{r.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function StoryDeck({ stories, friends, onFriendAction, onRestart, onDownload, onDelete, storageOK, start = 0 }) {
  const { slides, share, guesses } = stories;
  const n = slides.length;
  const [index, setIndex] = useState(() => Math.max(0, Math.min(n - 1, start)));
  const [sheet, setSheet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const stage = useRef(null);
  const mounted = useRef(false);

  const go = useCallback((i) => { setSaveError(""); setIndex((cur) => Math.max(0, Math.min(n - 1, typeof i === "function" ? i(cur) : i))); }, [n]);
  const next = useCallback(() => go((i) => i + 1), [go]);
  const back = useCallback(() => go((i) => i - 1), [go]);

  // Focus follows the screen, so screen readers hear each one; the first render keeps the page at the top.
  useEffect(() => {
    const el = stage.current?.querySelector(`[data-slide="${index}"] [data-focus]`);
    el?.focus({ preventScroll: true });
    if (!mounted.current) { mounted.current = true; if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" }); }
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (sheet) { if (e.key === "Escape") setSheet(null); return; }
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); back(); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); go(n - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, next, back, go, n]);

  const onTap = (e) => {
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    if (typeof window !== "undefined" && window.getSelection && String(window.getSelection())) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.3) back(); else next();
  };

  const slide = slides[index];
  const save = async () => {
    setSaveError("");
    setSaving(true);
    try {
      if (slide.id === "share") await downloadShareImage(share);
      else await downloadStoryImage(printFor(slide), `my-genii-${slide.id}.png`);
    } catch { setSaveError("The image couldn't be made in this browser."); }
    setSaving(false);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText(share)); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };
  const screenProps = {
    onInvite: () => setSheet("friends"),
    onFriends: () => setSheet("friends"),
    onGuesses: () => setSheet("guesses"),
    hasGuesses: Boolean(guesses),
    guessLabel: GUESS_COPY.button,
    onCopy: copy,
    copied,
    onRestart,
    onDownload,
    onDelete,
    storageOK,
  };

  return (
    <main className="pst-page page-enter" aria-label="Your result" data-voice={stories.wording}>
      <div className="pst-frame" data-tone={slide.tone}>
        <div className="pst-bars" aria-hidden="true">
          {slides.map((s, i) => <i key={s.id} className={i < index ? "is-done" : i === index ? "is-now" : ""}><b /></i>)}
        </div>
        <div className="pst-top">
          <span className="pst-brand"><i aria-hidden="true" /> Genii</span>
          <span className="sr-only" aria-live="polite">{`Screen ${index + 1} of ${n}`}</span>
          <button type="button" className="pst-save" onClick={save} disabled={saving} aria-label="Save this screen as an image">
            <Download size={15} aria-hidden="true" /> <span>Save</span>
          </button>
        </div>
        {saveError && <p className="pst-save-error" role="alert">{saveError}</p>}
        <div className="pst-stage" ref={stage} onClick={onTap}>
          {slides.map((s, i) => (
            <section key={s.id} className={`pst-slide pst-slide--${s.id}${i === index ? " is-on" : ""}`} data-slide={i} data-story={s.id} data-tone={s.tone}
              hidden={i !== index} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
              <StoryScreen slide={s} {...screenProps} />
            </section>
          ))}
        </div>
        <nav className="pst-nav" aria-label="Screens">
          <button type="button" className="pst-icon" onClick={back} disabled={index === 0} aria-label="Previous screen"><ChevronLeft size={20} /></button>
          <span className="pst-hint" aria-hidden="true">{index < n - 1 ? "Tap to continue" : ""}</span>
          <button type="button" className="pst-icon" onClick={next} disabled={index === n - 1} aria-label="Next screen"><ChevronRight size={20} /></button>
        </nav>
      </div>

      {sheet === "friends" && (
        <Sheet title={FRIEND_SHEET_TITLE} onClose={() => setSheet(null)}>
          {friends ? <FriendsPanel friends={friends} onAction={onFriendAction} /> : <p>The friend game opens once your result is saved.</p>}
        </Sheet>
      )}
      {sheet === "guesses" && guesses && (
        <Sheet title={GUESS_COPY.title} onClose={() => setSheet(null)}>
          <GuessSheet guesses={guesses} />
        </Sheet>
      )}
    </main>
  );
}
