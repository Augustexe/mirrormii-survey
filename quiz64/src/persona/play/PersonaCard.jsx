import React, { useContext, useEffect, useRef, useState } from "react";
import { MotionConfigContext, useReducedMotion } from "motion/react";
import { S, CHAPTERS } from "../kit.js";
import { LOBBY_COPY } from "../lobby.js";
import { DeviceGlyph, FormatGlyph, Sparkle, deviceFor } from "../../art/index.js";
import { emotionTint } from "../../art/palette.js";
import { motion as systemMotion, tokens } from "../../system/index.js";
import {
  EXIT_LABEL, EXIT_KEYS, exitOrder, toggleReceipt, receiptsValue, receiptsTally, togglePick,
  initialRank, rankTap, rankReorder, rankMove, rankReady, rankValue, promptSize,
} from "./answer-model.js";
import { ChoiceList, BetChoices, FeelingChoices, formatVariant } from "./formats/Choices.jsx";
import { Receipt } from "./formats/Receipt.jsx";
import { Thread } from "./formats/Thread.jsx";
import { Split } from "./formats/Split.jsx";
import { PickTwo } from "./formats/PickTwo.jsx";
import { Rank } from "./formats/Rank.jsx";
import { Flip } from "./formats/Flip.jsx";
import { ghost, burst } from "./flight.js";
import "./play.css";

// Base beats (ms, Day; round 2, section 23 ruling 3). Every format holds the picked answer on screen like the reply
// does: the pick bounces and glows, its shard flies to the mirror, and the card leaves in the last `leave` ms of the
// hold. A pick two first waits 600 ms so a second thought can cancel it, then holds a shorter beat; the last finale card
// holds for the "all panes etched" beat (5.11). Every beat scales with the voice's motion (Dusk slower, Clear quicker).
// A tap anywhere during a hold skips the rest of it (never block a tap).
export const BEATS = Object.freeze({
  hold: tokens.beats.hold, reply: tokens.beats.hold + 360, settle: 600, afterSettle: 480, receipt: 760, finaleEnd: 1000, leave: tokens.beats.leave,
});

const now = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const mark = (name) => { try { performance.mark(name); } catch { /* marks are best effort */ } };

// Kicker text per format (the previous card's frame labels, kept word for word where they existed).
export function frameFor(card, step, setup = null) {
  const chapter = step.phase === "finale" ? null : step.phase === "extra" ? LOBBY_COPY.extras.badge : (CHAPTERS.find((c) => c.id === step.chapter) || {}).title || null;
  if (step.phase === "finale") return { label: `Final ${step.index} of ${step.size}`, chapter: null, glyph: "sealed" };
  const t = card.type;
  const label = t === "real" ? "From your life"
    : t === "this_or_that" ? (step.round && step.round.size > 1 ? `Quick round ${step.round.index} of ${step.round.size}` : "Quick pick")
    : t === "pick_two" ? "Pick two"
    : t === "role" ? "Pick your role"
    : t === "feeling" ? "First feeling"
    : t === "receipts" ? "Receipts check"
    : t === "bet" ? "Genii's bet"
    : t === "rank" ? "Rank it"
    : t === "eyes" ? (setup && setup.closest === "best_friend" ? "Through your best friend's eyes" : "Through a friend's eyes")
    : t === "reply" ? "Your reply"
    : t === "others" ? "First thought"
    : "Picture this";
  // Long labels carry the whole kicker row on a phone; the chapter name would wrap it to a third line.
  return { label, chapter: label.length > 24 ? null : chapter, glyph: t };
}

const chapterOf = (step) => (step.phase === "finale" ? "finale" : step.phase === "extra" ? "extras" : step.chapter);

// Two overlapping circles: a second lens (eyes vignette).
const Lenses = () => (
  <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true" focusable="false" className="pc-lenses">
    <circle cx="19" cy="24" r="11" /><circle cx="29" cy="24" r="11" />
  </svg>
);

// Genii's chip (bet): a small glass poker chip that spins once on enter.
const Chip = () => (
  <svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true" focusable="false" className="pc-betchip">
    <circle cx="14" cy="14" r="12" className="pc-betchip__rim" />
    <circle cx="14" cy="14" r="7.5" className="pc-betchip__face" />
    {[0, 60, 120, 180, 240, 300].map((a) => <rect key={a} x="13" y="2.4" width="2" height="3.6" rx="1" transform={`rotate(${a} 14 14)`} className="pc-betchip__notch" />)}
    <path d="M14 10.2l1.1 2.5 2.7.3-2 1.8.6 2.6-2.4-1.4-2.4 1.4.6-2.6-2-1.8 2.7-.3z" className="pc-betchip__star" />
  </svg>
);

function originOf(e) {
  const t = e && e.currentTarget;
  if (e && e.clientX && e.clientY && e.detail !== 0) return { x: e.clientX, y: e.clientY };
  if (t && t.getBoundingClientRect) { const r = t.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
  return null;
}

/**
 * One persona card (5.5 to 5.7). Evidence is unchanged from the previous card: the same taps send the same values
 * (index, index arrays, exit ids) with the same meta ({ ms } or { ms, flip }), and ms is measured at the answering tap.
 * voice: "heart" reads the card's Heart to heart text when it has one; anything else reads Make it fun.
 * onPick({ value, origin }) fires at the tap (shard flight, Genii's pulse); onAnswer fires after the exit beat.
 */
export function PersonaCard({ card, step, voice = "fun", onAnswer, onPick = null, busy = false, error = "", setup = null }) {
  const heading = useRef(null);
  const root = useRef(null);
  const paper = useRef(null);
  const shownAt = useRef(now());
  const timer = useRef(null);
  const settleTimer = useRef(null);
  const pending = useRef(null);
  const sent = useRef(false);
  const reduced = useReducedMotion();
  const { reducedMotion } = useContext(MotionConfigContext);
  const still = reduced || reducedMotion === "always";
  const [picks, setPicks] = useState([]);
  const [depends, setDepends] = useState(null);
  const [chosen, setChosen] = useState(null);
  const [rank, setRank] = useState(() => initialRank(card));
  const [grabbed, setGrabbed] = useState(null);
  const [announce, setAnnounce] = useState("");
  const [settling, setSettling] = useState(false);
  const [kbdOn, setKbdOn] = useState(false);
  const [sentFrom, setSentFrom] = useState(null);
  const [leaving, setLeaving] = useState(false);
  const [torn, setTorn] = useState(false);
  const leaveTimer = useRef(null);
  const type = card.type;
  const pickTwo = type === "pick_two";
  const receipts = type === "receipts";
  const isRank = type === "rank";
  const multi = pickTwo || receipts || isRank;
  const need = card.pick || 2;
  const finale = step.phase === "finale";
  const texts = card.options.map((_, i) => S.optionText(card, i, voice));
  const prompt = S.promptFor(card, voice);

  useEffect(() => {
    shownAt.current = now();
    sent.current = false;
    pending.current = null;
    setPicks([]);
    setDepends(null);
    setChosen(null);
    setRank(initialRank(card));
    setGrabbed(null);
    setSettling(false);
    setLeaving(false);
    setTorn(false);
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
    // A tap answers after a short beat; leaving the card first (Save and leave, a dialog) cancels it.
    return () => {
      clearTimeout(timer.current);
      clearTimeout(settleTimer.current);
      clearTimeout(leaveTimer.current);
      if (pending.current && typeof window !== "undefined") window.removeEventListener("pointerdown", pending.current, true);
      timer.current = null;
      pending.current = null;
    };
  }, [card.id]);

  const scale = () => { try { return systemMotion.scale || 1; } catch { return 1; } };
  const elapsed = () => Math.max(0, Math.round(now() - shownAt.current));

  // Hand the answer in. Everything the player sees afterwards is decoration; the value and meta are final here.
  const commit = (value, meta, { e = null, delay = BEATS.hold } = {}) => {
    if (busy || sent.current) return;
    sent.current = true;
    setChosen(value);
    mark("play:answer");
    const el = e && e.currentTarget && e.currentTarget.nodeType === 1 ? e.currentTarget : null;
    onPick?.({ value, origin: originOf(e), card, el });
    const go = () => {
      if (pending.current !== go) return;
      pending.current = null;
      clearTimeout(timer.current);
      clearTimeout(leaveTimer.current);
      if (typeof window !== "undefined") window.removeEventListener("pointerdown", go, true);
      onAnswer(value, meta);
    };
    pending.current = go;
    // Never block a tap: any tap anywhere while the answer is on its way completes it now.
    if (!still && typeof window !== "undefined") window.addEventListener("pointerdown", go, true);
    const wait = finale && step.index === step.size ? Math.max(delay, BEATS.finaleEnd) : delay;
    if (still) go();
    else {
      // The hold: the pick stays on screen, then the card leaves in the last beat of it.
      timer.current = setTimeout(go, wait * scale());
      leaveTimer.current = setTimeout(() => setLeaving(true), Math.max(0, wait - BEATS.leave) * scale());
    }
  };
  // Never block a tap: a tap while an answer is on its way completes it now.
  const flush = () => { if (pending.current) pending.current(); };

  const locked = busy || chosen !== null;

  const tap = (i, e) => {
    if (busy || sent.current) return;
    if (pickTwo) return togglePickTwo(i);
    if (isRank) { if (!rank.moved) setRank((r) => rankTap(r, i)); return; }
    if (receipts) { setPicks((p) => toggleReceipt(card, p, i)); return; }
    if (card.options[i].depends && card.flip) { setDepends({ index: i, ms: elapsed() }); return; }
    if (type === "this_or_that" && !still && e && e.currentTarget) {
      const other = root.current?.querySelector(`.pc-slab[data-index="${1 - i}"]`);
      if (other) burst(other.getBoundingClientRect(), 8);
    }
    if (type === "reply" && e && e.currentTarget) setSentFrom(e.currentTarget.getBoundingClientRect());
    commit(i, { ms: elapsed() }, { e, delay: type === "reply" ? BEATS.reply : BEATS.hold });
  };

  const togglePickTwo = (i) => {
    if (settling) {
      // A tap in the settle window cancels the send. Tapping a picked one takes it back; tapping another swaps it in.
      clearTimeout(settleTimer.current);
      setSettling(false);
      if (picks.includes(i)) { setPicks(picks.filter((x) => x !== i)); return; }
      const swapped = [...picks.slice(0, need - 1), i];
      return settle(swapped);
    }
    const next = togglePick(picks, i);
    if (next.length > need) return;
    setPicks(next);
    if (next.length === need) settle(next);
  };
  const settle = (next) => {
    setPicks(next);
    const ms = elapsed();
    setSettling(true);
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => { setSettling(false); commit([...next], { ms }, { delay: BEATS.afterSettle }); }, BEATS.settle);
  };
  const removeSlot = (k) => {
    if (sent.current) return;
    clearTimeout(settleTimer.current);
    setSettling(false);
    setPicks((p) => p.filter((_, j) => j !== k));
  };

  const done = (e) => {
    if (busy || sent.current) return;
    if (isRank) {
      if (!rankReady(rank)) return;
      commit(rankValue(rank), { ms: elapsed() }, { e });
      return;
    }
    if (receipts && paper.current && !still) {
      const h = paper.current.getBoundingClientRect().height;
      ghost(paper.current, [
        { transform: "translateY(0) rotate(0deg)", opacity: 1, clipPath: `inset(0 0 0 0)` },
        { transform: "translateY(4px) rotate(-0.6deg)", opacity: 1, clipPath: `inset(0 0 0 0)`, offset: 0.25 },
        { transform: "translateY(20px) rotate(-1.4deg)", opacity: 0, clipPath: `inset(0 0 ${Math.round(h * 0.04)}px 0)` },
      ], { className: "is-tearing", duration: BEATS.receipt * 0.7 * scale() });
      setTorn(true);
    }
    commit(receiptsValue(picks), { ms: elapsed() }, { e, delay: BEATS.receipt });
  };

  const exit = (id, e) => { if (!locked) commit(id, { ms: elapsed() }, { e }); };

  // Rank: drag, keyboard moves and announcements.
  const onReorder = (order) => { if (!locked) setRank((r) => rankReorder(r, order)); };
  const onKeyMove = (i, delta) => {
    setRank((r) => {
      const next = rankMove(r, i, delta);
      const pos = next.order.indexOf(i);
      setAnnounce(`${texts[i]}, moved to position ${pos + 1} of ${next.order.length}`);
      return next;
    });
  };
  const onGrab = (i) => {
    setGrabbed(i);
    if (i !== null) setAnnounce(`${texts[i]} picked up. Use the arrow keys, then Space to drop.`);
    else setAnnounce("Dropped.");
  };

  // Keys (desktop hints 5.5): 1 to 9 pick, S skip, N not my life, R no recent example, Enter done, arrows on splits.
  useEffect(() => {
    const onKey = (e) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target;
      if (t && (t.closest?.("input, textarea, select, dialog") || t.isContentEditable)) return;
      if (typeof document !== "undefined" && document.querySelector("dialog[open]")) return;
      const k = e.key.toLowerCase();
      if (pending.current) { flush(); return; }
      if (depends) return;
      let handled = true;
      if (/^[1-9]$/.test(k)) {
        const n = Number(k) - 1;
        if (isRank) { if (n < rank.order.length) tap(rank.order[n]); } else if (n < card.options.length) tap(n, null);
      } else if (EXIT_KEYS[k] && (card.exits || []).includes(EXIT_KEYS[k])) exit(EXIT_KEYS[k], null);
      else if (k === "enter" && (receipts || isRank) && !(t && t.closest?.("button"))) done(null);
      else if (type === "this_or_that" && (k === "arrowup" || k === "arrowleft")) tap(0, null);
      else if (type === "this_or_that" && (k === "arrowdown" || k === "arrowright")) tap(1, null);
      else handled = false;
      if (handled) { e.preventDefault(); setKbdOn(true); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const frame = frameFor(card, step, setup);
  const chapter = chapterOf(step);
  const device = type === "eyes" ? "lenses" : (() => { try { return deviceFor(card); } catch { return null; } })();
  // A reply's thread carries the scene, so its prompt steps down one size to keep the drafts above the fold.
  const size = type === "reply" ? ({ s: "m", m: "l", l: "l" })[promptSize(prompt)] : promptSize(prompt);
  const isChosen = (i) => (multi ? picks.includes(i) : chosen === i || (depends && depends.index === i));
  const tally = receipts ? receiptsTally(card, picks) : 0;
  const wash = type === "feeling" && Number.isInteger(chosen) ? emotionTint(card.options[chosen].emotion, chapter) : null;
  const exits = exitOrder(card);
  const firstOfChapter = !finale && step.index === 1;
  const common = { card, texts, locked, kbd: kbdOn };

  let body;
  if (depends) {
    body = (
      <Flip card={card} picked={texts[depends.index]} locked={locked}
        onFlip={(f, e) => commit(depends.index, { ms: depends.ms, flip: f }, { e })}
        onSkip={(e) => commit(depends.index, { ms: depends.ms, flip: null }, { e })}
        onBack={() => setDepends(null)} />
    );
  } else if (receipts) {
    body = <Receipt {...common} picks={picks} tally={tally} onToggle={tap} onDone={done} paperRef={paper} voice={voice} />;
  } else if (type === "reply") {
    body = <Thread {...common} thread={S.threadFor(card, voice) || []} chosen={chosen} onTap={tap} still={still} from={sentFrom} />;
  } else if (type === "this_or_that") {
    body = <Split {...common} chosen={chosen} onTap={tap} />;
  } else if (pickTwo) {
    body = <PickTwo {...common} picks={picks} need={need} settling={settling} onToggle={(i) => tap(i)} onSlot={removeSlot} />;
  } else if (isRank) {
    body = (
      <Rank {...common} rank={rank} grabbed={grabbed} onGrab={onGrab} onTap={(i) => tap(i)} onReorder={onReorder}
        onKeyMove={onKeyMove} onDone={done} ready={rankReady(rank)} announce={announce} />
    );
  } else if (type === "bet") {
    body = <BetChoices {...common} isChosen={isChosen} onTap={tap} variant="plain" />;
  } else if (type === "feeling") {
    body = <FeelingChoices {...common} isChosen={isChosen} onTap={tap} />;
  } else {
    body = <ChoiceList {...common} isChosen={isChosen} onTap={tap} variant={formatVariant(type)} />;
  }

  const promptEl = (
    <h1 ref={heading} tabIndex="-1" className="pc-prompt" data-size={size}>
      {type === "bet" ? <Chip /> : null}
      {prompt}
    </h1>
  );

  return (
    <article
      ref={root}
      className={`pc${chosen !== null ? " is-answered" : ""}${leaving ? " is-leaving" : ""}${torn ? " is-torn" : ""}${kbdOn ? " has-kbd" : ""}`}
      data-card-type={type}
      data-phase={step.phase}
      data-chapter={typeof step.chapter === "number" ? step.chapter : chapter}
      data-world={card.world || "everyday"}
      data-test={finale ? "true" : "false"}
      style={{ "--pc-tint": `var(--tint-${typeof chapter === "number" ? `ch${chapter}` : chapter})`, ...(wash ? { "--pc-wash": wash } : {}) }}
    >
      <div className="pc-head">
        {device ? (
          <span className="pc-vignette" aria-hidden="true">
            {device === "lenses" ? <Lenses /> : <DeviceGlyph id={device} size={36} />}
          </span>
        ) : null}
        <p className="pc-kicker">
          <FormatGlyph type={frame.glyph} size={16} className="pc-kicker__glyph" />
          <span className="pc-kicker__label">{frame.label}</span>
          {frame.chapter ? <><span className="pc-kicker__dot" aria-hidden="true">·</span><span className="pc-kicker__chapter">{frame.chapter}</span></> : null}
          {type === "this_or_that" && step.round && step.round.size > 1 ? (
            <span className="pc-pips" aria-hidden="true">
              {Array.from({ length: step.round.size }, (_, k) => <i key={k} className={k < step.round.index ? "is-on" : ""} />)}
            </span>
          ) : null}
        </p>
        {type === "real" ? (
          <div className="pc-memory">
            <p className="pc-memory__strip" aria-hidden="true"><span className="pc-memory__clock" />Rewind</p>
            {promptEl}
          </div>
        ) : promptEl}
        {type === "scenario" && card.world === "absurd" ? (
          <span className="pc-trail" aria-hidden="true">{[0, 1, 2, 3].map((k) => <span key={k} style={{ "--k": k }}><Sparkle size={10} /></span>)}</span>
        ) : null}
      </div>
      {body}
      {!depends ? (
        <div className="pc-exits" role="group" aria-label="Or">
          {exits.map((id) => (
            <button type="button" key={id} className="pc-exit" disabled={locked} onClick={(e) => exit(id, e)}>
              {EXIT_LABEL[id]}
              {kbdOn ? <kbd className="pc-kbd" aria-hidden="true">{id === "skip" ? "S" : id === "not_my_life" ? "N" : "R"}</kbd> : null}
            </button>
          ))}
        </div>
      ) : null}
      {finale ? <p className="pc-save">Each final answer locks when you tap it.</p> : firstOfChapter ? <p className="pc-save">Saved on this device</p> : null}
      {error ? <p className="pc-error" role="alert">{error}</p> : null}
    </article>
  );
}
