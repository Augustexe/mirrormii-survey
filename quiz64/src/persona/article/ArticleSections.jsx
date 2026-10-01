// The Evidence Article's sections (V2 pass, 2026-09-30). One editorial grid for every section: a plate on the left
// rail (one small opal-glass object from the MirrorMii world, art.js) and the body on the right; on a phone the plate
// sits beside the heading. Part one walks the Stories beats in the deck's own order, deeper; part two is new (two
// sides, the heist crew, green flag and red flag, Genii's bets, your people, your island seed). No banner photos: the
// cover's sky band is the only full-width image. Every word shown comes from article-data.js.
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Download, Plus, Sparkles } from "lucide-react";
import { GeniiLight } from "../../system/index.js";
import { GeniiSvg } from "../../genii/GeniiSvg.jsx";
import { StatGlyph } from "../reveal/StatGlyph.jsx";
import { roomArt, spot } from "./art.js";
import { ISLETS } from "./article-data.js";

const NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const TINTS = { 1: "var(--tint-ch1)", 2: "var(--tint-ch2)", 3: "var(--tint-ch3)", 4: "var(--tint-ch4)", 5: "var(--tint-ch5)", 6: "var(--tint-ch6)", 7: "var(--tint-ch7)" };
const CARD_TINTS = ["#C9B3F0", "#8FB8F2", "#F4B8A0", "#96D8C4", "#F2D48A", "#F2A7C3"];

// One piece of spot art, or a code-made glass stand-in of the same box while the set has no file for it. Always
// decorative: the words around it carry the meaning.
export function Spot({ name, className = "", sizes = "180px", eager = false }) {
  const a = spot(name);
  if (!a) return <span className={`ea-spot ea-spot--ph ${className}`} data-art={name} aria-hidden="true"><i /></span>;
  return (
    <span className={`ea-spot ${className}`} data-art={name} aria-hidden="true">
      <img src={a.src} srcSet={a.srcSet} sizes={sizes} width={a.w} height={a.h} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
    </span>
  );
}

// A small oval, the World Mirror's shape, marks each section label.
function Mark() {
  return <i className="ea-mark" aria-hidden="true" />;
}

// Every section: the plate (spot art) on the rail, the heading and the body. `wide` lets the body run under the plate.
function Section({ id, tab, art, label, title, intro, className = "", scene, wide = false, head, children }) {
  const hid = `ea-h-${id}`;
  return (
    <section id={id} className={`ea-sec ${className}`} data-tab={tab || id} data-scene={scene} aria-labelledby={hid}>
      <div className={`ea-wrap ea-spread${wide ? " ea-spread--wide" : ""}`}>
        {art ? <div className="ea-plate" data-reveal=""><Spot name={art} sizes="(min-width: 900px) 220px, 96px" /></div> : null}
        <header className="ea-head" data-reveal="">
          {label ? <p className="ea-label"><Mark />{label}</p> : null}
          <h2 id={hid} className="ea-h2" tabIndex="-1">{title}</h2>
          {intro ? <p className="ea-intro">{intro}</p> : null}
          {head}
        </header>
        <div className="ea-body">{children}</div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- cover
export function Cover({ A }) {
  const c = A.cover;
  const t = c.title;
  return (
    <section className="ea-cover" aria-labelledby="ea-h1">
      <div className="ea-band" aria-hidden="true">
        <Spot name="cover-band" className="ea-band__art" sizes="100vw" eager />
      </div>
      <div className="ea-wrap ea-cover__grid">
        <p className="ea-mast">{c.masthead}</p>
        <h1 id="ea-h1" className="ea-title" tabIndex="-1">
          <span className="ea-title__kicker">{t.kicker}</span>
          <span className="ea-title__name">{t.name}</span>
          {t.line ? <span className="ea-title__line">{t.line}</span> : null}
        </h1>
        <span className="ea-cover__genii" aria-hidden="true"><GeniiLight size="l" evolution={1} mood="sure" expression="happy" /></span>
        <div className="ea-cover__aside">
          <p className="ea-dayrow"><span>{c.lifeRow.label}</span><b>{c.lifeRow.name}</b></p>
          {c.keywords.length ? (
            <div className="ea-covertags">
              <p className="ea-covertags__label">{c.keywordsLabel}</p>
              <ul>{c.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
            </div>
          ) : null}
          <p className="ea-dek">{c.dek}</p>
          <p className="ea-readtime">{c.readTime}</p>
        </div>
      </div>
    </section>
  );
}

// The short version: both reads over both descriptions, set like a magazine lede.
export function Lede({ A }) {
  const c = A.cover;
  return (
    <section className="ea-lede" aria-label={c.masthead}>
      <div className="ea-wrap ea-lede__grid">
        {[c.people, c.life].map((h, i) => (
          <article key={h.label} className="ea-lede__col" data-half={i ? "life" : "people"} data-reveal="" style={{ "--d": i }}>
            <p className="ea-label"><Mark />{h.label}</p>
            <p className="ea-lede__read">{h.read}</p>
            {h.desc ? <p className="ea-lede__desc">{h.desc}</p> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

// A part opener: the part's name set large, what it holds, and the bead ribbon divider.
export function PartOpener({ part, n }) {
  return (
    <div className={`ea-part ea-part--${n}`} role="group" aria-label={part.label}>
      <div className="ea-wrap ea-part__in" data-reveal="">
        <p className="ea-part__label">{part.label}</p>
        <p className="ea-part__title">{part.title}</p>
        <p className="ea-part__intro">{part.intro}</p>
        <Spot name="divider" className="ea-part__divider" sizes="(min-width: 900px) 480px, 280px" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------- stats
function Pips({ n, split }) {
  return (
    <span className="ea-pips" data-split={split ? "true" : undefined} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={split ? "is-half" : i <= n ? "is-on" : undefined} style={{ "--p": i }} />)}
    </span>
  );
}

function StatRow({ r, open, onToggle, S }) {
  const id = useId();
  const decided = !r.flex && !r.unfinished;
  const end = r.unfinished ? `${r.a} or ${r.b}` : r.flex ? `${r.a} and ${r.b}` : r.leadEnd;
  const spoken = decided ? `${r.level} ${r.leadEnd}, ${NUM[r.pips]} of five` : `${r.level}, ${end}`;
  const hasDrawer = Boolean(r.otherLine || r.note || r.know || r.badgeNote);
  return (
    <li className="ea-stat" data-badge={r.badge || undefined} data-open={open ? "true" : undefined} data-state={decided ? "lean" : r.flex ? "flex" : "open"}>
      <button type="button" className="ea-stat__btn" aria-expanded={open} aria-controls={id} onClick={onToggle} disabled={!hasDrawer}>
        <span className="ea-stat__name"><StatGlyph axis={r.key} size={16} />{r.stat}</span>
        <span className="ea-stat__end">{end}</span>
        <Pips n={r.pips} split={r.split} />
        <span className="ea-stat__level" aria-hidden="true">{r.level}</span>
        <span className="sr-only">{spoken}</span>
        <span className="ea-stat__chev" aria-hidden="true" />
      </button>
      <div className="ea-drawer" id={id} role="region" aria-label={r.stat} data-open={open ? "true" : undefined}>
        <div className="ea-drawer__in">
          <div className="ea-cmp">
            <div className="ea-cmp__me"><p className="ea-cmp__h">{decided ? `${S.yours}: ${r.leadEnd}` : end}</p><p>{r.note}</p></div>
            {r.otherLine ? <div className="ea-cmp__them"><p className="ea-cmp__h">{`${S.other}: ${r.otherEnd}`}</p><p>{r.otherLine}</p></div> : null}
          </div>
          {r.know ? <p className="ea-know">{r.know}</p> : null}
          {r.badgeNote ? <p className="ea-badgenote"><span className="ea-stat__badge">{r.badgeLabel}</span> {r.badgeNote}</p> : null}
        </div>
      </div>
    </li>
  );
}

export function Stats({ A }) {
  const S = A.sheet;
  const first = (S.groups.flatMap((g) => g.rows).find((r) => r.badge === "signature") || {}).key || null;
  const [open, setOpen] = useState(() => new Set(first ? [first] : []));
  const toggle = (k) => setOpen((o) => { const n = new Set(o); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  return (
    <Section id="stats" className="ea-stats" art="stats" label={S.kicker} title={S.title} intro={S.intro}>
      <div className="ea-sheet" data-reveal="">
        {S.groups.map((g) => (
          <div key={g.label} className="ea-sheet__group" role="group" aria-label={g.label}>
            <p className="ea-sheet__label">{g.label}</p>
            <ul>{g.rows.map((r) => <StatRow key={r.key} r={r} S={S} open={open.has(r.key)} onToggle={() => toggle(r.key)} />)}</ul>
          </div>
        ))}
        <p className="ea-sheetkey"><Pips n={5} /><span>{S.key}</span></p>
        <p className="ea-hint">{S.hint}</p>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- rooms
export function Rooms({ A }) {
  const R = A.rooms;
  const [sel, setSel] = useState(() => (R ? (R.flip ? R.flip.chapter : R.rows[0].chapter) : null));
  if (!R) return null;
  const lit = new Set(R.rows.map((r) => r.chapter));
  return (
    <Section id="rooms" className="ea-rooms" art={roomArt(sel || 3)} label={R.kicker} title={R.title} intro={R.intro} wide>
      <div className="ea-rooms__grid">
        <div className="ea-map" role="group" aria-label={R.mapLabel} data-reveal="">
          <span className="ea-map__sky" aria-hidden="true" />
          {[1, 7, 2, 3, 5, 4, 6].map((ch) => {
            const p = ISLETS[ch];
            return (
              <span key={ch} className="ea-islet" data-lit={lit.has(ch) ? "true" : undefined} data-sel={sel === ch ? "true" : undefined}
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, "--c": TINTS[ch] }}>
                <Spot name={roomArt(ch)} sizes={`(min-width: 900px) ${Math.round(p.w * 6)}px, ${p.w}vw`} />
              </span>
            );
          })}
          {R.rows.map((r, i) => {
            const p = ISLETS[r.chapter];
            return (
              <button key={r.chapter} type="button" className="ea-pin" data-flip={r.differs ? "true" : undefined} aria-pressed={sel === r.chapter}
                onClick={() => setSel(r.chapter)} style={{ left: `${p.x}%`, top: `${p.y - p.w * 0.36 - (p.lift || 0)}%`, "--c": TINTS[r.chapter], "--i": i }}>
                <span>{r.room}</span>
              </button>
            );
          })}
        </div>
        <div className="ea-rooms__side">
          <p className="ea-rooms__quiet">{R.quiet}</p>
          <ul className="ea-roomlist">
            {R.rows.map((r) => (
              <li key={r.chapter} className="ea-room" data-sel={sel === r.chapter ? "true" : undefined} data-flip={r.differs ? "true" : undefined} style={{ "--c": TINTS[r.chapter] }} onClick={() => setSel(r.chapter)}>
                <Spot name={roomArt(r.chapter)} className="ea-room__art" sizes="80px" />
                <div>
                  <h3 className="ea-room__name">{r.room}{r.end ? <span className="ea-room__end">{r.end}</span> : null}</h3>
                  <p className="ea-room__line">{r.line}</p>
                  {r.differs && R.flip ? <p className="ea-room__flip"><b>{R.flip.title}.</b> {R.flip.line}</p> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- surprise
export function Surprise({ A, onSave }) {
  const s = A.surprise;
  const [state, setState] = useState("");
  if (!s) return null;
  const save = async () => {
    setState("busy");
    try { await onSave(s.slide); setState("done"); } catch { setState(""); }
  };
  return (
    <section id="surprise" className="ea-sec ea-surprise" data-tab="surprise" data-scene="night" aria-labelledby="ea-h-surprise">
      <div className="ea-wrap ea-spread">
        <div className="ea-plate" data-reveal=""><Spot name="secret" sizes="(min-width: 900px) 220px, 96px" /></div>
        <header className="ea-head" data-reveal="">
          <h2 id="ea-h-surprise" className="ea-label ea-label--night" tabIndex="-1"><Mark />{s.kicker}</h2>
        </header>
        <div className="ea-body ea-surprise__text" data-reveal="">
          <blockquote className="ea-pull">
            <p className="ea-pull__belief">{s.belief}</p>
            {s.behavior ? <p className="ea-pull__turn">{s.behavior}</p> : null}
          </blockquote>
          <div className="ea-surprise__foot">
            {onSave ? (
              <button type="button" className="ea-btn ea-btn--glass" onClick={save} disabled={state === "busy"}>
                {state === "done" ? <Check size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />} {state === "done" ? s.saved : s.save}
              </button>
            ) : null}
            <span className="ea-surprise__genii" aria-hidden="true"><GeniiLight size="m" evolution={1} mood="hush" expression="curious" /></span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- traits
function TraitCard({ k, i, T }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef(null);
  const onMove = (e) => {
    if (e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    ref.current.style.setProperty("--rx", `${((0.5 - y) * 10).toFixed(2)}deg`);
    ref.current.style.setProperty("--ry", `${((x - 0.5) * 14).toFixed(2)}deg`);
    ref.current.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    ref.current.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
  };
  const onLeave = () => { if (ref.current) { ref.current.style.setProperty("--rx", "0deg"); ref.current.style.setProperty("--ry", "0deg"); } };
  return (
    <li className="ea-card" ref={ref} data-flipped={flipped ? "true" : undefined} data-kind={k.kind} data-flips={k.back ? "true" : undefined} data-i={i} style={{ "--i": i, "--tint": CARD_TINTS[i % CARD_TINTS.length] }}
      onPointerMove={onMove} onPointerLeave={onLeave} onClick={k.back ? (e) => { if (!e.target.closest("button")) setFlipped((v) => !v); } : undefined}>
      <div className="ea-card__inner">
        <article className="ea-card__face ea-card__front" aria-hidden={flipped ? "true" : undefined}>
          <span className="ea-card__art" aria-hidden="true">
            {k.chapter ? <Spot name={roomArt(k.chapter)} sizes="140px" /> : <><Spot name="stats" sizes="120px" /><span className="ea-card__glyph"><StatGlyph axis={k.axis} size={26} /></span></>}
          </span>
          <h3 className="ea-card__kw">{k.keyword}</h3>
          <p className="ea-card__from"><span>{T.fromLabel}</span> {k.from}</p>
          <p className="ea-card__line">{k.line}</p>
          {k.private ? <p className="ea-card__kept">{T.kept}</p> : null}
        </article>
        {k.back ? (
          <div className="ea-card__face ea-card__back" aria-hidden={flipped ? undefined : "true"}>
            <p className="ea-card__backlabel">{k.backLabel}</p>
            <p className="ea-card__quote">{k.back}</p>
            <p className="ea-card__backkw">{k.backName}</p>
          </div>
        ) : null}
      </div>
      {k.back ? (
        <button type="button" className="ea-card__turn" aria-pressed={flipped} onClick={(e) => { e.stopPropagation(); setFlipped((v) => !v); }}>
          <span className="sr-only">{`${k.keyword}: `}</span>{flipped ? T.turnBack : T.turn}
        </button>
      ) : null}
    </li>
  );
}

export function Traits({ A }) {
  const T = A.traits;
  const items = T.items;
  const deck = useRef(null);
  const [at, setAt] = useState(0);
  // Which card is in view in the phone carousel (the deck's own sideways scroll; the page never moves).
  useEffect(() => {
    const el = deck.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) setAt(Number(e.target.dataset.i)); }, { root: el, threshold: 0.6 });
    el.querySelectorAll(".ea-card").forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, [items.length]);
  const show = (i) => { const el = deck.current; const c = el && el.querySelectorAll(".ea-card")[i]; if (c) el.scrollTo({ left: c.offsetLeft - el.offsetLeft - 16, behavior: "smooth" }); };
  return (
    <Section id="traits" className="ea-traits" art="traits" label={A.tabs.find((t) => t.id === "traits").label} title={T.title} intro={items.length ? T.intro : null} wide>
      {items.length ? (
        <>
          <ul className="ea-deck" data-count={items.length} data-reveal="" ref={deck}>
            {items.map((k, i) => <TraitCard key={k.key} k={k} i={i} T={T} />)}
          </ul>
          <p className="ea-dots__label" aria-live="polite">{T.position(at + 1, items.length)}</p>
          <div className="ea-dots" role="group" aria-label={T.title}>
            {items.map((k, i) => (
              <button key={k.key} type="button" aria-label={k.keyword} aria-current={i === at ? "true" : undefined} onClick={() => show(i)}><i /></button>
            ))}
          </div>
        </>
      ) : <p className="ea-intro">{T.empty}</p>}
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- open book
export function OpenBook({ A }) {
  const b = A.book;
  if (!b) return null;
  return (
    <Section id="book" className="ea-book" art="open-book" label={b.kicker} title={b.title} intro={b.intro}>
      <ul className="ea-stings">
        {b.stings.map((line, i) => <li key={i} data-reveal="" style={{ "--d": i }}>{line}</li>)}
      </ul>
      {b.hearts.length ? (
        <div className="ea-said" data-reveal="">
          <h3 className="ea-said__title">{b.saidTitle}</h3>
          <p className="ea-said__intro">{b.saidIntro}</p>
          <ul>
            {b.hearts.map((h) => <li key={h.line}><q>{h.line}</q><span>{h.from}</span></li>)}
          </ul>
        </div>
      ) : null}
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- the record
export function Record({ A }) {
  const r = A.record;
  if (!r) return null;
  const score = (
    <div className="ea-score" data-reveal="">
      <span className="ea-score__genii" aria-hidden="true"><GeniiLight size="m" evolution={1} mood="sure" expression={r.face || "happy"} /></span>
      <p className="ea-score__text"><b>{r.exact}</b><span>{` of ${r.called} ${r.of}`}</span></p>
    </div>
  );
  return (
    <Section id="record" className="ea-record" scene="night" art="record" label={r.kicker} title={r.headline} intro={r.intro} head={score} wide>
      {r.key ? <p className="ea-key">{r.key}</p> : null}
      <p className="ea-record__order">{r.order}</p>
      <ol className="ea-panes" data-reveal="">
        {r.rows.map((x, i) => (
          <li key={x.key} className="ea-pane" data-status={x.near ? "near" : x.status} style={{ "--i": i }}>
            <span className="ea-pane__glass" aria-hidden="true"><i />{x.status === "hit" ? <Check size={18} strokeWidth={2.5} /> : x.near ? null : <Sparkles size={16} strokeWidth={1.75} />}</span>
            <span className="ea-pane__title">{x.title}</span>
            <span className="ea-pane__status"><span className="ea-pane__chip">{x.shown}</span>{x.side ? <em>{x.side}</em> : null}</span>
          </li>
        ))}
      </ol>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- two sides
export function TwoSides({ A }) {
  const s = A.sides;
  if (!s) return null;
  return (
    <Section id="sides" className="ea-sides" art="two-sides" title={s.title} intro={s.intro} wide>
      <div className="ea-cells">
        {s.cells.map((c) => (
          <article key={c.type} className="ea-cell" data-type={c.type} data-reveal="">
            <h3 className="ea-cell__label">{c.label}</h3>
            <p className="ea-cell__pair"><span><small>{c.aStat}</small>{c.a}</span><i aria-hidden="true">{c.type === "team" ? "+" : "×"}</i><span className="sr-only">{c.type === "team" ? " and " : " against "}</span><span><small>{c.bStat}</small>{c.b}</span></p>
            <p className="ea-cell__line">{c.line}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- heist crew
export function Heist({ A, onChallenge }) {
  const h = A.heist;
  const mine = h.roles.find((r) => r.mine);
  return (
    <Section id="heist" className="ea-heist" art={`heist-${h.role}`} title={h.title} intro={h.intro} wide>
      <ol className="ea-crew" data-reveal="">
        {h.roles.map((r, i) => (
          <li key={r.id} className="ea-crew__seat" data-mine={r.mine ? "true" : undefined} style={{ "--i": i }}>
            <Spot name={`heist-${r.id}`} className="ea-crew__tool" sizes="(min-width: 900px) 140px, 96px" />
            <p className="ea-crew__tag">{r.mine ? h.yoursLabel : h.openLabel}</p>
            <h3 className="ea-crew__name">{r.name}</h3>
            <p className="ea-crew__job">{r.job}</p>
          </li>
        ))}
      </ol>
      <div className="ea-why" data-reveal="">
        <p className="ea-why__role"><span>{h.yoursLabel}</span> {mine.name}</p>
        <p className="ea-why__line">{h.why}</p>
        <p className="ea-why__from">{h.from}</p>
      </div>
      <p className="ea-recruit">{h.recruit} <button type="button" className="ea-textbtn" onClick={onChallenge}>{A.party.challenge}</button></p>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- flags
function Flag({ f, kind }) {
  return (
    <article className="ea-flag" data-kind={kind} data-reveal="">
      <p className="ea-flag__cloth"><span>{f.label}</span></p>
      <p className="ea-flag__line">{f.line}</p>
      <p className="ea-flag__from">{f.from}</p>
    </article>
  );
}

export function Flags({ A }) {
  const F = A.flags;
  if (!F) return null;
  return (
    <Section id="flags" className="ea-flags" art="flags" title={F.title} intro={F.intro}>
      <div className="ea-flagpair">
        <Flag f={F.green} kind="green" />
        <Flag f={F.red} kind="red" />
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- bets
export function Bets({ A }) {
  const B = A.bets;
  if (!B) return null;
  return (
    <Section id="bets" className="ea-bets" art="bets" title={B.title} intro={B.intro}>
      <ul className="ea-slips">
        {B.items.map((b, i) => (
          <li key={b.key} className="ea-slip" data-reveal="" style={{ "--d": i }}>
            <p className="ea-slip__stake">{b.stake}</p>
            <p className="ea-slip__line">{b.line}</p>
            <p className="ea-slip__from">{b.from}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- party
export function Party({ A, onChallenge }) {
  const p = A.party;
  const b = A.bio;
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = useCallback(async () => {
    try { await navigator.clipboard.writeText(b.text); setCopied(true); clearTimeout(timer.current); timer.current = setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  }, [b.text]);
  return (
    <Section id="party" className="ea-party" art={null} label={A.tabs.find((t) => t.id === "party").label} title={p.title} wide>
      <ul className="ea-slots" data-reveal="">
        <li className="ea-slot ea-slot--you" style={{ "--i": 0 }}>
          <span className="ea-slot__genii" aria-hidden="true"><GeniiSvg evolution={1} expression="happy" /></span>
          <p className="ea-slot__label">{p.you}</p>
          <p className="ea-slot__name">{p.me.name}</p>
          {p.me.line ? <p className="ea-slot__story">{p.me.line}</p> : null}
        </li>
        {p.click ? (
          <li className="ea-slot ea-slot--click" style={{ "--i": 1 }}>
            <span className="ea-slot__genii ea-slot__genii--tilt" aria-hidden="true"><GeniiSvg evolution={1} expression="curious" /></span>
            <p className="ea-slot__label">{p.click.label}</p>
            <p className="ea-slot__name">{p.click.name}</p>
            {p.click.line ? <p className="ea-slot__story">{p.click.line}</p> : null}
            <p className="ea-slot__line">{p.click.diff}</p>
          </li>
        ) : null}
        {p.opposite ? (
          <li className="ea-slot ea-slot--opp" style={{ "--i": 2 }}>
            <span className="ea-slot__genii ea-slot__genii--flip" aria-hidden="true"><GeniiSvg evolution={1} expression="skeptical" /></span>
            <p className="ea-slot__label">{p.opposite.label}</p>
            <p className="ea-slot__name">{p.opposite.name}</p>
            {p.opposite.line ? <p className="ea-slot__story">{p.opposite.line}</p> : null}
            <p className="ea-slot__line">{p.opposite.diff}</p>
          </li>
        ) : null}
        <li className="ea-slot ea-slot--add" style={{ "--i": 3 }}>
          <button type="button" className="ea-slot__add" onClick={onChallenge}>
            <span className="ea-slot__ring" aria-hidden="true"><Plus size={26} strokeWidth={1.5} /></span>
            <b>{p.challenge}</b>
            <small>{p.challengeSub}</small>
          </button>
        </li>
      </ul>
      <div className="ea-bio" data-reveal="">
        <p className="ea-bio__label">{b.title}</p>
        <p className="ea-bio__text">{b.text}</p>
        <button type="button" className="ea-btn ea-btn--light" onClick={copy}>{copied ? <Check size={17} aria-hidden="true" /> : <Copy size={17} aria-hidden="true" />} {copied ? b.copied : b.copy}</button>
        <span className="sr-only" aria-live="polite">{copied ? b.copied : ""}</span>
      </div>
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- seed and the app
function StoreGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M12 7.5v7M9 11.8l3 3 3-3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

// Your island seed doubles as the app hook: the seed packet, then the one store button.
export function Seed({ A }) {
  const s = A.seed;
  const app = A.closing.app;
  if (!s && !app) return null;
  const placeholder = app && String(app.link || "").startsWith("#");
  return (
    <Section id="seed" className="ea-seed" art={null} title={s ? s.title : app.title} intro={s ? s.intro : app.body}>
      {s ? (
        <div className="ea-packet" data-reveal="">
          <p className="ea-packet__soon">{s.soon}</p>
          <Spot name="seed" className="ea-packet__art" sizes="(min-width: 900px) 200px, 140px" />
          <dl className="ea-packet__rows">
            <div><dt>{s.label}</dt><dd>{s.what}</dd></div>
            <div><dt>{s.howLabel}</dt><dd>{s.how}</dd></div>
          </dl>
        </div>
      ) : null}
      {app ? (
        <div className="ea-app" data-reveal="">
          {s ? <p className="ea-app__hook">{s.hook}</p> : null}
          {s ? <p className="ea-app__title">{app.title}</p> : null}
          {s ? <p className="ea-app__body">{app.body}</p> : null}
          <div className="ea-app__actions">
            <a className="ea-store" href={app.link} onClick={placeholder ? (e) => e.preventDefault() : undefined} data-placeholder={placeholder ? "true" : undefined}>
              <StoreGlyph /><span><small>{app.store}</small><b>{app.button}</b></span>
            </a>
            {app.note ? <p className="ea-app__note">{app.note}</p> : null}
          </div>
        </div>
      ) : null}
    </Section>
  );
}

// ---------------------------------------------------------------------------------------------------------- closing
export function Closing({ A, onChallenge }) {
  const c = A.closing;
  return (
    <div className="ea-close">
      <div className="ea-wrap ea-close__in" data-reveal="">
        <Spot name="closing" className="ea-close__art" sizes="(min-width: 900px) 200px, 120px" />
        <p className="ea-close__line">{c.line}</p>
        <button type="button" className="ea-btn ea-btn--ink" onClick={onChallenge}>{c.challenge}</button>
      </div>
    </div>
  );
}
