import React, { useContext, useEffect, useMemo, useRef } from "react";
import { MotionConfigContext, useReducedMotion } from "motion/react";
import { GeniiLight, geniiEvents, useTheme, tokens } from "../../system/index.js";
import { MirrorArch, IslandScene, DeviceGlyph, deviceFor } from "../../art/index.js";
import { hostLine, cardVoice, LOBBY_DEFAULTS } from "../lobby.js";
import { reactionFor, unit } from "../reactions.js";
import { PersonaCard } from "./PersonaCard.jsx";
import { ShardRail } from "./ShardRail.jsx";
import { railGroups, filledShards } from "./rail-model.js";
import { flyShard, catchShard } from "./flight.js";
import "./play.css";

// Reactions need the previous answer and whether the previous card showed one. The quiz view unmounts at every
// chapter title card, so this memory lives at module level, per run seed.
const MEMORY = new Map();
function memoryFor(seed) {
  if (!MEMORY.has(seed)) {
    if (MEMORY.size > 8) MEMORY.delete(MEMORY.keys().next().value);
    MEMORY.set(seed, { answers: new Map(), lines: new Map() });
  }
  return MEMORY.get(seed);
}

export function rememberAnswer(seed, step, card, value) {
  if (!step || step.phase === "finale") return;
  memoryFor(seed).answers.set(step.resolved, { card, value });
}

// The line in Genii's row for this card: nothing on feeling and finale cards (the moment is the player's), nothing for
// Just the cards, the speed nudge when rushing, a reaction on about 40% of cards, otherwise the voice's host line.
// The voice's host lines rotate by the card's place in the whole run (not the chapter), offset by the run seed, so a
// new chapter never restarts on the same line; the speed nudge shows once per rushed streak; and no line ever shows on
// two cards in a row (a reload, a chapter break or a reaction pool can otherwise land on the same words).
export function geniiLineFor(step, voice, { rushing = false, seed = "genii" } = {}) {
  if (!step || !step.card) return null;
  if (voice === "cards" || step.phase === "finale" || step.card.type === "feeling") return null;
  const m = memoryFor(seed);
  const idx = step.resolved;
  const cached = m.lines.get(idx);
  if (cached && cached.id === step.card.id && cached.rushing === rushing) return cached.shown;
  const before = m.lines.get(idx - 1) || {};
  const prev = m.answers.get(idx - 1);
  const reaction = prev
    ? reactionFor({ card: prev.card, optionIndex: prev.value, voice, seed, cardIndex: idx, previousWasReaction: !!before.line, nextCard: step.card, phase: step.phase })
    : null;
  const nudge = rushing && !before.rushing ? hostLine(voice, { phase: step.phase, rushing: true }) : null;
  const hostAt = (k) => hostLine(voice, { phase: step.phase, index: k, rushing: false });
  const base = Math.floor(unit(seed, "host") * 4) + idx;
  let shown = nudge || reaction || hostAt(base);
  for (let k = 1; shown && shown === before.shown && k < 6; k++) shown = hostAt(base + k);
  if (shown === before.shown) shown = null;
  m.lines.set(idx, { id: step.card.id, line: nudge ? null : reaction, shown, nudge: !!nudge, rushing });
  return shown;
}

const tintOf = (step) => (step.phase === "finale" ? "var(--tint-finale-rim)" : step.phase === "extra" ? "var(--tint-extras)" : `var(--tint-ch${step.chapter})`);

/**
 * The card screen (5.5, 5.8, 5.9). Phone: shard rail in the header's centre, Genii's line, the card sheet.
 * Desktop: the mirror niche (live mosaic, island, Genii) beside the sheet.
 * voice: the lobby voice (fun, heart or cards). progress (chapterProgress) and seed (the run id) are optional; the
 * rail and reactions fall back gracefully without them.
 */
export function PersonaQuizView({ step, setup, onAnswer, onMap, busy, error, cardKey, rushing = false, voice = LOBBY_DEFAULTS.voice, progress = null, seed = "genii", shards = null }) {
  const card = step.card;
  const reduced = useReducedMotion();
  const { reducedMotion } = useContext(MotionConfigContext);
  const still = reduced || reducedMotion === "always";
  const { theme } = useTheme();
  const line = geniiLineFor(step, voice, { rushing, seed });
  const hush = step.phase === "finale" || card.type === "feeling";
  const rail = useMemo(() => railGroups(step, progress), [step, progress]);
  // The run's shards in answer order (PersonaApp passes views.mirrorFor's list, the one the reveal lands); the rail's
  // grouping is the fallback when a caller has none. The finale keeps the full mirror behind the fog.
  const filled = useMemo(() => (Array.isArray(shards) ? shards : filledShards(rail)), [shards, rail]);
  const nicheRef = useRef(null);
  const enterFrom = card.type === "this_or_that" && step.round && step.round.index > 1 ? "side" : "below";
  const device = useMemo(() => { try { return card.world === "absurd" ? deviceFor(card) : null; } catch { return null; } }, [card]);
  const chapterKey = step.phase === "finale" ? "finale" : step.phase === "extra" ? "extras" : step.chapter;

  // Performance marks: how long from an answer tap until the next prompt is readable (5.9 and 7.4 B4).
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const el = document.querySelector(".play .pc");
    const done = () => {
      try {
        performance.mark("play:prompt-ready");
        const answers = performance.getEntriesByName("play:answer");
        const last = answers[answers.length - 1];
        if (last) {
          const ms = performance.now() - last.startTime;
          (window.__playTimings = window.__playTimings || []).push(Math.round(ms));
          performance.clearMarks("play:answer");
        }
      } catch { /* marks are best effort */ }
    };
    if (!el || still) { done(); return undefined; }
    const anims = el.getAnimations ? el.getAnimations() : [];
    if (!anims.length) { done(); return undefined; }
    let live = true;
    Promise.all(anims.map((a) => a.finished.catch(() => null))).then(() => { if (live) done(); });
    return () => { live = false; };
  }, [cardKey, still]);

  // The answer's shard (5.9, round 2 Codex fix 2): it lifts off the picked answer's own shard mark (or the tap) just
  // after the pick bounce, flies into the mirror at the head of the rail (desktop: the niche mirror), and the mirror
  // flashes as it lands, while the pick holds on screen. The rail and mirror then gain the shard when the card leaves.
  const onPick = ({ value, origin, el }) => {
    rememberAnswer(seed, step, card, value);
    geniiEvents.emit("noted");
    if (still || typeof document === "undefined") return;
    const mark = el && el.querySelector ? el.querySelector(".pc-tile__shard") || el.querySelector(".pc-tile__lead") : null;
    let from = origin;
    if (mark) { const r = mark.getBoundingClientRect(); if (r.width) from = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
    if (!from) return;
    const wide = window.matchMedia && window.matchMedia("(min-width: 1024px)").matches;
    const target = wide && nicheRef.current
      ? nicheRef.current.querySelector(".play-niche__arch")
      : document.querySelector(".shard-rail .rail-mirror") || document.querySelector('.shard-rail [data-rail-slot="current"]');
    if (!target) return;
    const slot = document.querySelector('.shard-rail [data-rail-slot="current"]');
    flyShard({
      from, to: target, color: tintOf(step), index: step.resolved, trail: theme !== "clear", delay: tokens.beats.launch,
      onLaunch: () => { if (mark) mark.classList.add("is-flown"); },
      onLand: () => { catchShard(target); if (slot && slot !== target) catchShard(slot, "is-caught-slot"); },
    });
  };

  return (
    <main className="play" data-phase={step.phase} data-type={card.type} data-voice={voice} data-enter={enterFrom}>
      <ShardRail step={step} progress={progress} onOpen={onMap} shards={filled} seed={seed} />
      <div className="play-world" aria-hidden="true" data-chapter={String(chapterKey)} style={{ "--world-tint": tintOf(step) }}>
        <span className="play-world__glow" />
        <span className="play-world__island"><IslandScene chapter={chapterKey} variant="scene" size={300} /></span>
      </div>
      <div className="play-grid">
        <aside className="play-niche" ref={nicheRef} aria-hidden="true">
          <div className="play-niche__island"><IslandScene chapter={chapterKey} variant="ambient" size={460} /></div>
          <div className="play-niche__arch">
            <MirrorArch seed={seed} filled={filled} fog={step.phase === "finale" ? 0.55 : 0.08} glow={0.7} mullion={false} size={300} />
            {device ? <span className="play-niche__device"><DeviceGlyph id={device} size={96} /></span> : null}
          </div>
          <div className="play-niche__genii">
            <GeniiLight mood={hush ? "hush" : "listening"} size="m" voice={voice} />
            {line ? <p className="play-niche__line" key={line}>{line}</p> : null}
          </div>
        </aside>
        <section className="play-col">
          <div className={`play-genii${hush ? " is-hush" : ""}`}>
            <GeniiLight mood={hush ? "hush" : "listening"} size="s" voice={voice} />
            <p className="play-genii__line" aria-hidden="true" key={line || "none"}>{line || ""}</p>
          </div>
          <p className="pc-sr" aria-live="polite">{line || ""}</p>
          <PersonaCard key={cardKey} card={card} step={step} voice={cardVoice(voice)} setup={setup} onAnswer={onAnswer} onPick={onPick} busy={busy} error={error} />
        </section>
      </div>
    </main>
  );
}
