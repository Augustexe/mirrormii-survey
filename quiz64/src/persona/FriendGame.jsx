import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Copy, Heart, Share2, Sparkles } from "lucide-react";
import { GeniiStage } from "../components/GeniiStage.jsx";
import { ConversationProgress } from "../components/ConversationProgress.jsx";
import { FRIEND } from "./kit.js";
import { friendDeckView, friendIntro, friendSafeResult, cleanGuesses, fillOwner, fillVars, replyPayload, WHY_CHIPS } from "./friend.js";
import { linkFor } from "./links.js";

const EMPTY = { level1: {}, level2: {}, why: {}, level3: [], level4: null };

function Frame({ kicker, title, children, progress, bubble }) {
  const heading = useRef(null);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: "instant" }); }, [title]);
  return (
    <motion.main className="quiz-page page-enter fg" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.22 }}>
      <div className="quiz-topline"><div><span className="eyebrow">Do you really know me?</span><strong>{kicker}</strong></div></div>
      {progress && <ConversationProgress value={progress[0]} total={progress[1]} />}
      <div className="quiz-layout">
        <article className="question-card persona-card fg-card" data-chapter="3" data-role="hypothetical">
          <div className="question-head"><div><h1 ref={heading} tabIndex="-1">{title}</h1></div></div>
          {children}
        </article>
        <aside className="quiz-guide"><GeniiStage mood="curious" compact bubble={bubble} /></aside>
      </div>
    </motion.main>
  );
}

function Choice({ text, on, onClick, token, disabled }) {
  return (
    <button type="button" className={`answer-option persona-option ${on ? "answer-option--selected" : ""}`} aria-pressed={on} onClick={onClick} disabled={disabled}>
      <span className="answer-token">{token}</span>
      <span className="answer-copy">{text}</span>
      <Check className="answer-check" size={18} strokeWidth={2.5} aria-hidden="true" />
    </button>
  );
}

export function FriendGame({ ch, play, isOwnLink, onProgress, onYourTurn, onLeave }) {
  const view = useMemo(() => friendDeckView(ch), [ch]);
  const intro = useMemo(() => friendIntro(ch), [ch]);
  const who = { pronoun: ch.pronoun, name: ch.name };
  const g = useMemo(() => cleanGuesses(view, play.guesses || EMPTY), [view, play.guesses]);
  const [copied, setCopied] = useState("");
  const stage = play.stage || "intro";
  const step = play.step || 0;
  const save = (patch) => onProgress({ ...play, ...patch, guesses: patch.guesses || g });
  const name = ch.name || "your friend";
  const Name = ch.name || "Your friend";

  if (stage === "intro") {
    return (
      <Frame kicker={`A game about ${name}`} title={intro.title} bubble="No typing. Just guesses.">
        {isOwnLink && <p className="fg-note" role="status">This is your own link. Send it to them, or play it here to see what they'll see.</p>}
        <p className="question-setup">{intro.preGame}</p>
        <div className="question-actions">
          <button type="button" className="button button--quiet" onClick={onLeave}>Not now</button>
          <button type="button" className="button button--primary" onClick={() => save({ stage: "level1", step: 0 })}>{intro.cta} <ArrowRight size={17} /></button>
        </div>
      </Frame>
    );
  }

  if (stage === "level1") {
    const done = step >= view.level1.length;
    if (done) {
      const guessed = friendSafeResult(ch, view, g).guessedType;
      return (
        <Frame kicker={FRIEND.level1.title} title={fillVars(fillOwner(FRIEND.level1.guessedTypeLine.t, who), { guessedType: guessed })} progress={[6, 6]} bubble="Bold. Let's see.">
          <p className="question-setup">Genii will tell {name} how close you got.</p>
          <div className="question-actions">
            <button type="button" className="button button--primary" onClick={() => save({ stage: "level2", step: 0 })}>Next level <ArrowRight size={17} /></button>
          </div>
        </Frame>
      );
    }
    const q = view.level1[step];
    const pick = (pole) => save({ guesses: { ...g, level1: { ...g.level1, [q.axis]: pole } }, step: step + 1 });
    return (
      <Frame kicker={`${FRIEND.level1.title} · ${step + 1} of 6`} title={q.prompt} progress={[step, 6]} bubble={fillOwner(FRIEND.level1.intro, who)}>
        <div className="answer-list persona-answers" role="group" aria-label="Pick one">
          {q.options.map((o, i) => <Choice key={o.pole} token={String.fromCharCode(65 + i)} text={o.t} on={g.level1[q.axis] === o.pole} onClick={() => pick(o.pole)} />)}
        </div>
      </Frame>
    );
  }

  if (stage === "level2") {
    const title = fillOwner(FRIEND.level2.title, who);
    if (view.level2.skipped) {
      return (
        <Frame kicker={title} title={view.level2.line} bubble="On we go.">
          <div className="question-actions"><button type="button" className="button button--primary" onClick={() => save({ stage: "level3", step: 0 })}>Next level <ArrowRight size={17} /></button></div>
        </Frame>
      );
    }
    const cards = view.level2.cards;
    const c = cards[Math.min(step, cards.length - 1)];
    const chosen = g.level2[c.id];
    const next = () => save({ step: step + 1, ...(step + 1 >= cards.length ? { stage: "level3", step: 0 } : {}) });
    return (
      <Frame kicker={`${title} · ${step + 1} of ${cards.length}`} title={c.prompt} progress={[step, cards.length]} bubble={fillOwner(FRIEND.level2.intro, who).replace(/^12\b/, String(cards.length))}>
        <div className="answer-list persona-answers" role="group" aria-label="Pick one">
          {c.order.map((side, i) => <Choice key={side} token={String.fromCharCode(65 + i)} text={c[side]} on={chosen === side} onClick={() => save({ guesses: { ...g, level2: { ...g.level2, [c.id]: side } } })} />)}
        </div>
        {chosen && (
          <fieldset className="fg-why">
            <legend>{FRIEND.level2.whyChips.prompt}</legend>
            <div>
              {WHY_CHIPS.map((chip) => (
                <button type="button" key={chip.id} className={`fg-chip ${g.why[c.id] === chip.id ? "is-on" : ""}`} aria-pressed={g.why[c.id] === chip.id}
                  onClick={() => save({ guesses: { ...g, why: { ...g.why, [c.id]: g.why[c.id] === chip.id ? undefined : chip.id } } })}>
                  {fillOwner(chip.t, who)}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div className="question-actions">
          <span />
          <button type="button" className="button button--primary" disabled={!chosen} onClick={next}>Next <ArrowRight size={17} /></button>
        </div>
      </Frame>
    );
  }

  if (stage === "level3") {
    const L = view.level3;
    if (L.skipped) {
      return (
        <Frame kicker={FRIEND.level3.title} title={L.line} bubble="Private is allowed.">
          <div className="question-actions"><button type="button" className="button button--primary" onClick={() => save({ stage: view.level4 ? "level4" : "done", step: 0 })}>Next <ArrowRight size={17} /></button></div>
        </Frame>
      );
    }
    const toggle = (id) => {
      const has = g.level3.includes(id);
      if (!has && g.level3.length >= L.N) return;
      save({ guesses: { ...g, level3: has ? g.level3.filter((x) => x !== id) : [...g.level3, id] } });
    };
    return (
      <Frame kicker={FRIEND.level3.title} title={L.prompt} progress={[g.level3.length, L.N]} bubble="Name and heart only. Trust your gut.">
        {L.fewTagsLine && <p className="question-setup">{L.fewTagsLine}</p>}
        <p className="persona-pick-count" aria-live="polite">{g.level3.length} of {L.N} picked</p>
        <div className="fg-tags" role="group" aria-label={`Pick ${L.N}`}>
          {L.cards.map((c) => {
            const on = g.level3.includes(c.id);
            return (
              <button type="button" key={c.id} className={`fg-tag ${on ? "is-on" : ""}`} aria-pressed={on} disabled={!on && g.level3.length >= L.N} onClick={() => toggle(c.id)}>
                <b>{c.name}</b><span><Heart size={12} aria-hidden="true" /> {c.heart}</span>
              </button>
            );
          })}
        </div>
        <div className="question-actions">
          <span />
          <button type="button" className="button button--primary" disabled={g.level3.length !== L.N} onClick={() => save({ stage: view.level4 ? "level4" : "done", step: 0 })}>{view.level4 ? "Bonus round" : "See my score"} <ArrowRight size={17} /></button>
        </div>
      </Frame>
    );
  }

  if (stage === "level4" && view.level4) {
    const L4 = view.level4;
    const title = fillOwner(FRIEND.level4.title, who);
    const g4 = g.level4 || { sting: null, roast: null };
    if (step === 0 && L4.stingPick) {
      return (
        <Frame kicker={title} title={L4.stingPick.prompt} bubble="Only one of these is real.">
          <div className="answer-list persona-answers" role="group" aria-label="Pick one">
            {L4.stingPick.lines.map((l, i) => <Choice key={l.tag} token={String.fromCharCode(65 + i)} text={l.t} on={g4.sting === l.tag} onClick={() => save({ guesses: { ...g, level4: { ...g4, sting: l.tag } }, step: 1 })} />)}
          </div>
        </Frame>
      );
    }
    return (
      <Frame kicker={title} title={L4.pickTheRoast.prompt} bubble={FRIEND.level4.pickTheRoast.guardLine}>
        <div className="answer-list persona-answers" role="group" aria-label="Pick one, or skip">
          {L4.pickTheRoast.lines.map((l, i) => <Choice key={l.id} token={String.fromCharCode(65 + i)} text={l.t} on={g4.roast === l.id} onClick={() => save({ guesses: { ...g, level4: { ...g4, roast: l.id } }, stage: "done", step: 0 })} />)}
        </div>
        <div className="question-actions"><span /><button type="button" className="button button--quiet" onClick={() => save({ guesses: { ...g, level4: { ...g4, roast: null } }, stage: "done", step: 0 })}>{FRIEND.level4.pickTheRoast.skipLabel}</button></div>
      </Frame>
    );
  }

  // Done: counts only. The friend never sees which ones they missed.
  const res = friendSafeResult(ch, view, g);
  const reply = linkFor("reply", replyPayload(ch, view, g));
  const copy = async (text, what) => { try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 1800); } catch { setCopied(""); } };
  const share = async () => { try { await navigator.share({ text: `My answers about you, from Genii's friend game:`, url: reply }); } catch { /* closed */ } };
  return (
    <motion.main className="interlude-page page-enter fg-done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      <div className="interlude-art"><div className="interlude-ring" /><GeniiStage scene="chapter" mood="attentive" bubble={`${res.x}/6. Interesting.`} /></div>
      <div className="interlude-copy">
        <span className="chapter-kicker">Do you know {name}?</span>
        <h1 tabIndex="-1">{res.scoreLine}</h1>
        <p className="fg-counts">{res.countsLine}</p>
        {res.typeLine && <p className="fg-type"><Sparkles size={15} aria-hidden="true" /> {res.typeLine}</p>}
        <div className="fg-send">
          <h2>Send your answers back to {name}</h2>
          <p>Only {name} sees them. Without this, {name} never finds out how you did.</p>
          <label className="fp-field"><span>Your reply link</span><input readOnly value={reply} onFocus={(e) => e.target.select()} /></label>
          <div className="fp-actions">
            <button type="button" className="button button--primary" onClick={() => copy(reply, "reply")}><Copy size={16} /> {copied === "reply" ? "Copied" : "Copy reply link"}</button>
            {typeof navigator !== "undefined" && navigator.share && <button type="button" className="button button--secondary" onClick={share}><Share2 size={16} /> Share</button>}
          </div>
        </div>
        <div className="hero-actions">
          <button type="button" className="button button--primary button--large" onClick={onYourTurn}>{res.yourTurn} <ArrowRight size={19} /></button>
        </div>
        <small className="boundary-note">{Name}'s answers stay on {ch.pronoun === "she" ? "her" : ch.pronoun === "he" ? "his" : "their"} device. Yours stay on yours until you send the link.</small>
      </div>
    </motion.main>
  );
}
