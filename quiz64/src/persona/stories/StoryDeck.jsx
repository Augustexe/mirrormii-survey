// The result as tap-through Stories on a 9:16 stage (DESIGN-DIRECTION 5.12). Phone: the stage is the whole screen.
// Desktop: the stage stands in a night mirror room with the arrows outside it. Tap the right 70% (or the right arrow,
// Space, PageDown) to go on, the left 30% (or the left arrow, PageUp) to go back; press and hold pauses the motion.
// Story 1 is the exception: hold speeds the shards up and letting go assembles the mirror. Every screen is in the
// markup from the first render (inactive ones hidden), so screen readers and the server render get the whole result.
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Share } from "lucide-react";
import { MirrorArch } from "../../art/index.js";
import { GeniiLight, setThemeForVoice, useTheme } from "../../system/index.js";
import { StoryScreen } from "./StoryScreens.jsx";
import { GUESS_COPY, UI_COPY, printFor } from "./story-data.js";
import { shareText } from "../views.js";
import { downloadStoryImage, shareImage } from "../share-image.js";
import { FriendsPanel } from "../FriendsPanel.jsx";
import { DataSheet, GuessSheet, ShareSheet, Sheet } from "../reveal/Sheets.jsx";
import { useElementSize, useReduced } from "../reveal/layout.js";
import "../reveal/reveal.css";

export { GuessSheet };

const FRIEND_SHEET_TITLE = "Send it to a friend";
const INTERACTIVE = "button, a, input, textarea, select, label, summary, [role='dialog'], [role='radiogroup']";

export function StoryDeck({ stories, friends, onFriendAction, onRestart, onDownload, onDelete, storageOK, start = 0 }) {
  const { slides, share, guesses } = stories;
  const n = slides.length;
  const reduced = useReduced();
  const { theme } = useTheme();
  const [index, setIndex] = useState(() => Math.max(0, Math.min(n - 1, start)));
  const [reveal, setReveal] = useState(() => (start > 0 ? "set" : "orbit"));
  const [wipe, setWipe] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [format, setFormat] = useState("story");
  const [cardTheme, setCardTheme] = useState("night");
  const stageRef = useRef(null);
  const stage = useElementSize(stageRef);
  const held = useRef({ timer: 0, long: false });
  const mounted = useRef(false);
  const mirror = (slides[0] && slides[0].mirror) || null;

  // The player's light carries into the result (Make it fun: Day, Heart to heart: Dusk, Just the cards: Clear).
  useEffect(() => { setThemeForVoice(stories.voice); }, [stories.voice]);
  useEffect(() => { if (reduced && reveal !== "set") setReveal("set"); }, [reduced, reveal]);

  const go = useCallback((i) => {
    setStatus("");
    setIndex((cur) => Math.max(0, Math.min(n - 1, typeof i === "function" ? i(cur) : i)));
  }, [n]);

  const assembled = useCallback(() => { setReveal("set"); setWipe(true); go(1); }, [go]);
  const next = useCallback(() => {
    if (index === 0 && reveal === "orbit" && !reduced) { setReveal("assemble"); return; }
    if (index === 0 && reveal === "assemble") { assembled(); return; }
    if (index === 0) { setWipe(true); go(1); return; }
    if (index === 1 && wipe) { setWipe(false); return; }
    setWipe(false);
    go((i) => i + 1);
  }, [index, reveal, reduced, wipe, assembled, go]);
  const back = useCallback(() => { setWipe(false); go((i) => i - 1); }, [go]);

  // Focus follows the screen, so screen readers hear each one; the first render keeps the page at the top.
  useEffect(() => {
    const el = stageRef.current?.querySelector(`[data-slide="${index}"] [data-focus]`);
    el?.focus({ preventScroll: true });
    if (!mounted.current) { mounted.current = true; if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "instant" }); }
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (sheet) { if (e.key === "Escape") setSheet(null); return; }
      const t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if ((e.key === " " || e.key === "Enter") && t && t.closest && t.closest(INTERACTIVE)) return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); back(); }
      else if (e.key === "Home") { e.preventDefault(); go(0); }
      else if (e.key === "End") { e.preventDefault(); setReveal("set"); go(n - 1); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet, next, back, go, n]);

  // Press and hold pauses the screen's motion; a long press never counts as a tap.
  const onDown = (e) => {
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    held.current.long = false;
    clearTimeout(held.current.timer);
    held.current.timer = setTimeout(() => { held.current.long = true; stageRef.current?.setAttribute("data-held", "true"); }, 280);
  };
  const onUp = () => { clearTimeout(held.current.timer); stageRef.current?.removeAttribute("data-held"); };
  const onTap = (e) => {
    if (held.current.long) { held.current.long = false; return; }
    if (e.target.closest && e.target.closest(INTERACTIVE)) return;
    if (typeof window !== "undefined" && window.getSelection && String(window.getSelection())) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (e.clientX - rect.left < rect.width * 0.3) back(); else next();
  };

  const slide = slides[index];
  const deliver = async (shareIt) => {
    setBusy(true);
    setStatus(UI_COPY.saving);
    try {
      let out;
      if (slide.id === "share") out = await shareImage(slide.share, { format, theme: cardTheme, share: shareIt });
      else out = await downloadStoryImage(printFor(slide), `my-mirror-${slide.id}.png`, { share: shareIt && !slide.private });
      setStatus(out === "cancelled" ? "" : out === "shared" ? "" : "Saved.");
    } catch { setStatus(UI_COPY.saveFailed); }
    setBusy(false);
  };
  const shareCard = async () => {
    setBusy(true);
    try { await shareImage(share, { format, theme: cardTheme, share: true }); } catch { /* the preview stays */ }
    setBusy(false);
  };
  const copy = async () => {
    const url = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
    try { await navigator.clipboard.writeText(`${shareText(share)}\n${url}`); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  };

  const screenProps = {
    stage,
    reduced,
    reveal,
    wipe,
    seed: mirror ? mirror.seed : "mirror",
    sparkles: theme === "day",
    onAssemble: () => setReveal((r) => (r === "orbit" ? "assemble" : r)),
    onAssembled: assembled,
    onWiped: () => setWipe(false),
    onInvite: () => setSheet("friends"),
    onFriends: () => setSheet("friends"),
    onGuesses: () => setSheet("guesses"),
    onData: () => setSheet("data"),
    onShareImage: shareCard,
    hasGuesses: Boolean(guesses),
    guessLabel: GUESS_COPY.button,
    onCopy: copy,
    copied,
    busy,
    format,
    setFormat,
    cardTheme,
    setCardTheme,
  };

  const closeThen = (fn) => () => { setSheet(null); fn && fn(); };
  return (
    <main className="rv-room" data-reduced={reduced ? "true" : "false"} data-voice={stories.wording} aria-label="Your result">
      <div className="rv-room__art" aria-hidden="true">
        <span className="rv-room__arch"><MirrorArch seed={mirror ? mirror.seed : "mirror"} filled={mirror ? mirror.filled : []} mullion glow={0.4} size={560} /></span>
      </div>
      <div className="rv-stagewrap">
        <div className="rv-stage" ref={stageRef} data-look={slide.look} data-current={slide.id} data-scene={slide.look === "light" ? undefined : "night"}
          onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={onUp}>
          <div className="rv-bg" aria-hidden="true"><i className="rv-bg__night" /><i className="rv-bg__light" /><i className="rv-bg__deep" /><i className="rv-bg__grain" /></div>
          <div className="rv-top">
            <div className="rv-bars" aria-hidden="true">
              {slides.map((s, i) => <i key={s.id} className={i < index ? "is-done" : i === index ? "is-now" : ""}><b /></i>)}
            </div>
            <div className="rv-top__row">
              <span className="rv-brand"><GeniiLight mood={slide.id === "stings" ? "hush" : "sure"} size="xs" evolution={1} /> Genii</span>
              <span className="sr-only" aria-live="polite">{`Screen ${index + 1} of ${n}`}</span>
              {index > 0 && (
                <button type="button" className="rv-icon" onClick={() => { setStatus(""); setSheet("share"); }} aria-label={slide.private ? UI_COPY.saveForMe : UI_COPY.shareSheet}>
                  <Share size={20} strokeWidth={1.75} aria-hidden="true" />
                </button>
              )}
            </div>
          </div>
          <div className="rv-slides" onClick={onTap}>
            {slides.map((s, i) => (
              <section key={s.id} className={`rv-slide rv-slide--${s.id}${i === index ? " is-current" : ""}`} data-slide={i} data-story={s.id} data-look={s.look}
                hidden={i !== index} aria-roledescription="slide" aria-label={`${i + 1} of ${n}`}>
                <StoryScreen slide={s} active={i === index} {...screenProps} />
              </section>
            ))}
          </div>
        </div>
        <nav className="rv-arrows" aria-label="Screens">
          <button type="button" className="rv-arrow rv-arrow--back" onClick={back} disabled={index === 0} aria-label="Previous screen"><ChevronLeft size={22} strokeWidth={1.75} /></button>
          <button type="button" className="rv-arrow rv-arrow--next" onClick={next} disabled={index === n - 1} aria-label="Next screen"><ChevronRight size={22} strokeWidth={1.75} /></button>
        </nav>
      </div>

      {sheet === "friends" && (
        <Sheet title={FRIEND_SHEET_TITLE} onClose={() => setSheet(null)} className="rv-sheet--friends" tone="light">
          {friends ? <FriendsPanel friends={friends} onAction={onFriendAction} /> : <p>The friend game opens once your result is saved.</p>}
        </Sheet>
      )}
      {sheet === "guesses" && guesses && (
        <Sheet title={GUESS_COPY.title} onClose={() => setSheet(null)}>
          <GuessSheet guesses={guesses} />
        </Sheet>
      )}
      {sheet === "data" && (
        <Sheet title={UI_COPY.dataTitle} onClose={() => setSheet(null)}>
          <DataSheet storageOK={storageOK} onDownload={onDownload} onRestart={closeThen(onRestart)} onDelete={closeThen(onDelete)} />
        </Sheet>
      )}
      {sheet === "share" && (
        <Sheet title={slide.private ? UI_COPY.stingsSheet : UI_COPY.shareSheet} onClose={() => setSheet(null)}>
          <ShareSheet slide={slide} busy={busy} status={status} onShare={() => deliver(true)} onSave={() => deliver(false)} />
        </Sheet>
      )}
    </main>
  );
}
