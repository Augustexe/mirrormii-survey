import React, { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { IslandScene, MirrorArch, shapes } from "../../art/index.js";
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
export function PersonaInterlude({ chapter, count, onContinue, filled = [], seed = "mirrormii", voice = LOBBY_DEFAULTS.voice }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [chapter.id, chapter.key]);
  const scene = chapter.scene ?? chapter.id;
  const tint = typeof scene === "number" ? `ch${scene}` : scene;
  return (
    <main className="mm-screen mm-interlude" data-chapter={String(scene)} style={{ "--ch-tint": `var(--tint-${tint})`, "--ch-deep": `var(--tint-${tint}-deep)` }}>
      <div className="mm-interlude__scene mm-decor" aria-hidden="true">
        <div className="mm-interlude__island">
          <IslandScene chapter={scene} variant="scene" />
        </div>
      </div>
      <div className="mm-interlude__genii mm-decor" aria-hidden="true">
        <GeniiLight size="m" mood="listening" />
      </div>
      <div className="mm-interlude__copy">
        {chapter.intro ? (
          <div className="mm-interlude__intro mm-enter" style={{ "--step": 1 }}>
            <GeniiLight size="xs" mood="listening" line={chapter.intro} voice={voice === "cards" ? "fun" : voice} />
          </div>
        ) : null}
        <p className="mm-kicker mm-enter" style={{ "--step": 0 }}>{chapter.kicker}</p>
        <h1 ref={heading} tabIndex="-1" className="mm-interlude__title mm-enter" style={{ "--step": 0 }}>
          <Reflect>{chapter.title}</Reflect>
        </h1>
        {chapter.sub ? <p className="mm-interlude__sub mm-enter" style={{ "--step": 1 }}>{chapter.sub}</p> : null}
        <div className="mm-interlude__progress mm-enter" style={{ "--step": 2 }}>
          {count > 0 ? (
            <div className="mm-shards" role="img" aria-label={`${count} cards in this chapter`}>
              {Array.from({ length: count }, (_, i) => (
                <svg key={i} viewBox={shapes.SHARD_VIEWBOX} width="12" height="18" aria-hidden="true" focusable="false">
                  <path d={shapes.shardFor(i + filled.length)} />
                </svg>
              ))}
              <span className="mm-shards__count">{count} cards</span>
            </div>
          ) : <span className="mm-shards__count">{filled.length} answers in your mirror so far</span>}
          <div className="mm-interlude__mirror" role="img" aria-label={`${filled.length} ${filled.length === 1 ? "answer" : "answers"} in your mirror so far`}>
            <MirrorArch seed={seed} filled={filled} fog={0} glow={0.5} size={46} />
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
