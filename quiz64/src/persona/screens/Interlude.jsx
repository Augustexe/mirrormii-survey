import React, { useEffect, useLayoutEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Islet, MirrorArch, shapes } from "../../art/index.js";
import { GeniiLight, Reflect } from "../../system/index.js";
import { CHAPTERS } from "../kit.js";
import { LOBBY_COPY, LOBBY_DEFAULTS, chapterIntro } from "../lobby.js";

const FIRST_SUB = "Tap what you'd actually do. Skip anything that isn't yours.";

// What the interlude shows for the step about to start. `scene` is the island: 1..7 or "extras".
export function interludeFor(step, voice = LOBBY_DEFAULTS.voice) {
  const X = LOBBY_COPY.extras;
  if (step.phase === "extra") return { id: 7, key: "extra", scene: "extras", kicker: X.kicker, title: X.title, intro: chapterIntro(voice, X.intro), sub: X.sub };
  const ch = CHAPTERS.find((c) => c.id === step.chapter);
  const ordinal = step.ordinal || ch.id;
  return {
    id: ch.id, key: `chapter-${ch.id}`, scene: ch.id,
    kicker: LOBBY_COPY.chapterKicker(ordinal, step.chapters || CHAPTERS.length),
    title: ch.title, intro: chapterIntro(voice, ch.intro),
    sub: ordinal === 1 ? FIRST_SUB : "",
  };
}

/**
 * Chapter interlude (DESIGN-DIRECTION 5.4): the chapter's island floating over still water with Genii's light
 * hovering by it, and Genii's intro line (set under the scene so it never covers the island's objects); the chapter title with the reflection device; this chapter's
 * shards (unfilled) and a small mirror showing every shard placed so far; one Start button.
 * filled: [{ chapter }] for every answered card in order; seed: the run id (the mirror's crack pattern).
 */
// How many of the last shards belong to the chapter just finished (they land in the mirror as the title card opens).
export function justFinished(filled = []) {
  if (!filled.length) return 0;
  const last = String(filled[filled.length - 1].chapter);
  let n = 0;
  for (let i = filled.length - 1; i >= 0 && String(filled[i].chapter) === last; i--) n++;
  return n;
}

// Where each returning shard starts (px from the mirror), scattered over the island above it: seeded by index so a
// screenshot is stable. Up to 10 shards fly; the rest arrive with them.
const SCATTER = [[150, -420], [40, -330], [250, -380], [-10, -270], [200, -300], [110, -470], [290, -280], [70, -260], [230, -440], [0, -380]];

// On phone the chapter's text (Genii's line, kicker, title) sits between the island and the mirror, so the shards must
// never fly straight down. Each one rises off the island, sweeps out past the left edge above the text, drops down off
// screen and slides into the mirror from the side. The two waypoints are measured from the live layout: --lift is the
// highest text line's top minus a margin (relative to the mirror's center), --out is just past the screen's left edge.
function useFlightPath(air) {
  useLayoutEffect(() => {
    const el = air.current;
    if (!el) return;
    const place = () => {
      const o = el.getBoundingClientRect();
      const copy = el.closest(".mm-interlude__copy");
      const texts = copy ? copy.querySelectorAll(".mm-interlude__intro, .mm-kicker, .mm-interlude__title, .mm-interlude__sub") : [];
      let top = Infinity;
      texts.forEach((t) => { const b = t.getBoundingClientRect(); if (b.height) top = Math.min(top, b.top); });
      if (Number.isFinite(top)) el.style.setProperty("--lift", `${Math.round(top - o.top - 34)}px`);
      el.style.setProperty("--out", `${Math.round(-o.left - 48)}px`);
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [air]);
}

/**
 * The reassembly (round 2): the chapter you just finished comes home. Its shards rise off the island, tumble through the
 * air and fuse into the mirror one after another; each lands as a bright cell (MirrorArch data-fresh), and the mirror
 * flares once when the last one is in. On the first chapter the mirror is empty and a light sweeps its seams, so the
 * mechanic reads before the first answer. Decorative only; with reduced motion the mirror is simply complete.
 */
function MirrorAssembly({ seed, filled, size }) {
  const fresh = justFinished(filled);
  const flying = Math.min(fresh, SCATTER.length);
  const start = filled.length - fresh;
  const air = useRef(null);
  useFlightPath(air);
  return (
    <div className={`mm-assembly${fresh ? " is-returning" : " is-empty"}`} style={{ "--fly": flying }}>
      <MirrorArch seed={seed} filled={filled} fresh={fresh} fog={0} glow={0.7} seams="dark" size={size} />
      {flying ? (
        <span ref={air} className="mm-assembly__air" aria-hidden="true">
          {Array.from({ length: flying }, (_, i) => {
            const [x, y] = SCATTER[i];
            const shard = filled[start + i] || filled[filled.length - 1];
            const key = typeof shard.chapter === "number" ? `ch${shard.chapter}` : shard.chapter === "extras" ? "extras" : "finale";
            return (
              <svg key={i} className="mm-assembly__shard" viewBox={shapes.SHARD_VIEWBOX} width="24" height="36" focusable="false"
                style={{ "--fx": `${x}px`, "--fy": `${y}px`, "--r": `${(i % 2 ? 1 : -1) * (160 + i * 37)}deg`, "--i": i, "--tint": `var(--tint-${key})` }}>
                <path d={shapes.shardFor(start + i)} />
              </svg>
            );
          })}
        </span>
      ) : null}
    </div>
  );
}

export function PersonaInterlude({ chapter, count, onContinue, filled = [], seed = "mirrormii", voice = LOBBY_DEFAULTS.voice, total = 40 }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [chapter.id, chapter.key]);
  const scene = chapter.scene ?? chapter.id;
  const tint = typeof scene === "number" ? `ch${scene}` : scene;
  return (
    <main className="mm-screen mm-interlude" data-chapter={String(scene)} style={{ "--ch-tint": `var(--tint-${tint})`, "--ch-deep": `var(--tint-${tint}-deep)` }}>
      <div className="mm-interlude__scene mm-decor" aria-hidden="true">
        <div className="mm-interlude__island">
          <Islet chapter={scene} size={320} eager />
        </div>
      </div>
      <div className="mm-interlude__genii mm-decor" aria-hidden="true">
        <GeniiLight size="m" mood="listening" evolution={{ answered: filled.length, total }} />
      </div>
      <div className="mm-interlude__copy">
        {chapter.intro ? (
          <div className="mm-interlude__intro mm-enter" style={{ "--step": 1 }}>
            <GeniiLight size="xs" mood="listening" line={chapter.intro} voice={voice === "cards" ? "fun" : voice} evolution={{ answered: filled.length, total }} />
          </div>
        ) : null}
        <p className="mm-kicker mm-enter" style={{ "--step": 0 }}>{chapter.kicker}</p>
        <h1 ref={heading} tabIndex="-1" className="mm-interlude__title mm-enter" style={{ "--step": 0 }}>
          <Reflect>{chapter.title}</Reflect>
        </h1>
        {chapter.sub ? <p className="mm-interlude__sub mm-enter" style={{ "--step": 1 }}>{chapter.sub}</p> : null}
        <div className="mm-interlude__progress mm-enter" style={{ "--step": 2 }}>
          <div className="mm-interlude__mirror" role="img" aria-label={`${filled.length} ${filled.length === 1 ? "answer" : "answers"} in your mirror so far`}>
            <MirrorAssembly seed={seed} filled={filled} size={72} />
          </div>
          <div className="mm-interlude__tally">
            <p className="mm-interlude__count">
              <strong>{`${filled.length} of ${total}`}</strong>
              <span>{filled.length ? "shards in your mirror" : "shards. Each answer adds one."}</span>
            </p>
            {count > 0 ? (
              <div className="mm-shards" role="img" aria-label={`${count} cards in this chapter`}>
                {Array.from({ length: count }, (_, i) => (
                  <svg key={i} viewBox={shapes.SHARD_VIEWBOX} width="14" height="21" aria-hidden="true" focusable="false" style={{ "--i": i }}>
                    <path d={shapes.shardFor(i + filled.length)} />
                  </svg>
                ))}
                <span className="mm-shards__count">{count} cards next</span>
              </div>
            ) : null}
          </div>
        </div>
        <div className="mm-interlude__actions mm-enter" style={{ "--step": 3 }}>
          <button type="button" className="mm-btn mm-btn--primary mm-interlude__start" onClick={onContinue}>
            Start <ArrowRight size={19} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}
