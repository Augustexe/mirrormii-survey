// The Evidence Article's sections (LAUNCH-SPEC section 25 item 3). Each section has its own light and its own piece of
// the canon world, so no two read alike: the cover (the island at dawn), the character sheet (the World Mirror), the
// holo trait cards (each trait's own islet), the surprise (the island at night), the rooms (the archipelago), the two
// sides (two Genii at one table), the open book (the room inside the mirror), the record (eight panes of glass), the
// party and the closing (the island in daylight). Every word shown comes from article-data.js.
import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Download, Plus, Sparkles } from "lucide-react";
import { GeniiLight } from "../../system/index.js";
import { GeniiSvg } from "../../genii/GeniiSvg.jsx";
import { StatGlyph } from "../reveal/StatGlyph.jsx";
import { ART, islet } from "./art.js";
import { ISLETS } from "./article-data.js";

const NUM = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const TINTS = { 1: "var(--tint-ch1)", 2: "var(--tint-ch2)", 3: "var(--tint-ch3)", 4: "var(--tint-ch4)", 5: "var(--tint-ch5)", 6: "var(--tint-ch6)", 7: "var(--tint-ch7)" };
const CARD_TINTS = ["#C9B3F0", "#8FB8F2", "#F4B8A0", "#96D8C4", "#F2D48A", "#F2A7C3"];

// A small oval, the World Mirror's shape, marks each section (its color is the section's own).
function Mark() {
  return <i className="ea-mark" aria-hidden="true" />;
}

function Head({ id, label, title, intro, tag = "h2", children }) {
  const H = tag;
  return (
    <header className="ea-head" data-reveal="">
      {label ? <p className="ea-label"><Mark />{label}</p> : null}
      <H id={id} className="ea-h2" tabIndex="-1">{title}</H>
      {intro ? <p className="ea-intro">{intro}</p> : null}
      {children}
    </header>
  );
}

// The World Mirror with the room it shows inside the glass.
export function WorldMirror({ className = "", sizes = "240px", eager = false }) {
  const g = ART.frame.glass;
  return (
    <span className={`ea-mirror ${className}`} aria-hidden="true">
      <span className="ea-mirror__glass" style={{ left: `${g.left}%`, top: `${g.top}%`, width: `${g.width}%`, height: `${g.height}%` }}>
        <img src={ART.inside.src} srcSet={ART.inside.srcSet} sizes={sizes} width={ART.inside.w} height={ART.inside.h} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
        <i className="ea-mirror__sheen" />
      </span>
      <img className="ea-mirror__frame" src={ART.frame.src} srcSet={ART.frame.srcSet} sizes={sizes} width={ART.frame.w} height={ART.frame.h} alt="" loading={eager ? "eager" : "lazy"} decoding="async" />
    </span>
  );
}

// ---------------------------------------------------------------------------------------------------------- cover
export function Cover({ A }) {
  const c = A.cover;
  return (
    <section className="ea-cover" aria-labelledby="ea-h1">
      <div className="ea-cover__art" aria-hidden="true">
        <picture>
          <source media="(min-width: 900px)" srcSet={ART.wide.srcSet} sizes="100vw" width={ART.wide.w} height={ART.wide.h} />
          <img src={ART.portrait.src} srcSet={ART.portrait.srcSet} sizes="100vw" width={ART.portrait.w} height={ART.portrait.h} alt="" fetchpriority="high" decoding="async" />
        </picture>
        <p className="ea-mast"><span>{c.masthead}</span></p>
        <span className="ea-cover__genii"><GeniiLight size="xl" evolution={1} mood="sure" expression="happy" /></span>
      </div>
      <div className="ea-cover__text">
        <h1 id="ea-h1" className="ea-names" tabIndex="-1">
          <span className="ea-names__row"><span className="ea-names__label">{c.people.label}</span><span className="ea-names__name">{c.people.name}</span></span>
          <span className="ea-names__row ea-names__row--life"><span className="ea-names__label">{c.life.label}</span><span className="ea-names__name">{c.life.name}</span></span>
        </h1>
        <div className="ea-cover__foot">
          <p className="ea-dek">{c.dek}</p>
          {c.keywords.length ? (
            <div className="ea-covertags">
              <p className="ea-covertags__label">{c.keywordsLabel}</p>
              <ul>{c.keywords.map((k) => <li key={k}>{k}</li>)}</ul>
            </div>
          ) : null}
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
          <article key={h.name} className="ea-lede__col" data-half={i ? "life" : "people"} data-reveal="" style={{ "--d": i }}>
            <p className="ea-label"><Mark />{h.label}</p>
            <p className="ea-lede__read">{h.read}</p>
            {h.desc ? <p className="ea-lede__desc">{h.desc}</p> : null}
          </article>
        ))}
      </div>
    </section>
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
    <section id="stats" className="ea-sec ea-stats" data-tab="stats" aria-labelledby="ea-h-stats">
      <div className="ea-wrap ea-stats__grid">
        <div className="ea-stats__side">
          <Head id="ea-h-stats" label={S.kicker} title={S.title} intro={S.intro} />
          <WorldMirror className="ea-stats__mirror" sizes="(min-width: 900px) 300px, 150px" />
        </div>
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- traits
function TraitCard({ k, i, n, T }) {
  const [flipped, setFlipped] = useState(false);
  const ref = useRef(null);
  const art = k.chapter ? islet(k.chapter) : null;
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
            {art ? <img src={art.src} srcSet={art.srcSet} sizes="(min-width: 900px) 220px, 200px" width={art.w} height={art.h} alt="" loading="lazy" decoding="async" />
              : <img className="ea-card__frame" src={ART.frame.src} srcSet={ART.frame.srcSet} sizes="120px" width={ART.frame.w} height={ART.frame.h} alt="" loading="lazy" decoding="async" />}
            {!art ? <span className="ea-card__glyph"><StatGlyph axis={k.axis} size={30} /></span> : null}
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
    <section id="traits" className="ea-sec ea-traits" data-tab="traits" aria-labelledby="ea-h-traits">
      <div className="ea-wrap">
        <Head id="ea-h-traits" label={A.tabs.find((t) => t.id === "traits").label} title={T.title} intro={items.length ? T.intro : null} />
        {items.length ? (
          <>
            <ul className="ea-deck" data-count={items.length} data-reveal="" ref={deck}>
              {items.map((k, i) => <TraitCard key={k.key} k={k} i={i} n={items.length} T={T} />)}
            </ul>
            <p className="ea-dots__label" aria-live="polite">{T.position(at + 1, items.length)}</p>
            <div className="ea-dots" role="group" aria-label={T.title}>
              {items.map((k, i) => (
                <button key={k.key} type="button" aria-label={k.keyword} aria-current={i === at ? "true" : undefined} onClick={() => show(i)}><i /></button>
              ))}
            </div>
          </>
        ) : <p className="ea-intro">{T.empty}</p>}
      </div>
    </section>
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
      <picture className="ea-surprise__bg" aria-hidden="true">
        <img src={ART.night.src} srcSet={ART.night.srcSet} sizes="(min-width: 900px) 60vw, 100vw" width={ART.night.w} height={ART.night.h} alt="" loading="lazy" decoding="async" />
      </picture>
      <div className="ea-wrap ea-surprise__grid">
        <div className="ea-surprise__text" data-reveal="">
          <h2 id="ea-h-surprise" className="ea-label ea-label--night" tabIndex="-1"><Mark />{s.kicker}</h2>
          <blockquote className="ea-pull">
            <p className="ea-pull__belief">{s.belief}</p>
            {s.behavior ? <p className="ea-pull__turn">{s.behavior}</p> : null}
          </blockquote>
          {onSave ? (
            <button type="button" className="ea-btn ea-btn--glass" onClick={save} disabled={state === "busy"}>
              {state === "done" ? <Check size={17} aria-hidden="true" /> : <Download size={17} aria-hidden="true" />} {state === "done" ? s.saved : s.save}
            </button>
          ) : null}
        </div>
        <span className="ea-surprise__genii" aria-hidden="true"><GeniiLight size="l" evolution={1} mood="hush" expression="curious" /></span>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- rooms
export function Rooms({ A }) {
  const R = A.rooms;
  const [sel, setSel] = useState(() => (R ? (R.flip ? R.flip.chapter : R.rows[0].chapter) : null));
  if (!R) return null;
  const lit = new Set(R.rows.map((r) => r.chapter));
  return (
    <section id="rooms" className="ea-sec ea-rooms" data-tab="rooms" aria-labelledby="ea-h-rooms">
      <div className="ea-wrap">
        <Head id="ea-h-rooms" label={R.kicker} title={R.title} intro={R.intro} />
        <div className="ea-rooms__grid">
          <div className="ea-map" role="group" aria-label={R.mapLabel} data-reveal="">
            <span className="ea-map__sky" aria-hidden="true" />
            {[1, 7, 2, 3, 5, 4, 6].map((ch) => {
              const p = ISLETS[ch];
              const art = islet(ch);
              return (
                <img key={ch} className="ea-islet" data-lit={lit.has(ch) ? "true" : undefined} data-sel={sel === ch ? "true" : undefined}
                  src={art.src} srcSet={art.srcSet} sizes={`(min-width: 900px) ${Math.round(p.w * 6)}px, ${p.w}vw`} width={art.w} height={art.h} alt="" aria-hidden="true" loading="lazy" decoding="async"
                  style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, "--c": TINTS[ch] }} />
              );
            })}
            {R.rows.map((r, i) => {
              const p = ISLETS[r.chapter];
              return (
                <button key={r.chapter} type="button" className="ea-pin" data-flip={r.differs ? "true" : undefined} aria-pressed={sel === r.chapter}
                  onClick={() => setSel(r.chapter)} style={{ left: `${p.x}%`, top: `${p.y - p.w * 0.36}%`, "--c": TINTS[r.chapter], "--i": i }}>
                  <span>{r.room}</span>
                </button>
              );
            })}
          </div>
          <div className="ea-rooms__side">
          <p className="ea-rooms__quiet">{R.quiet}</p>
          <ul className="ea-roomlist">
            {R.rows.map((r) => {
              const art = islet(r.chapter);
              return (
                <li key={r.chapter} className="ea-room" data-sel={sel === r.chapter ? "true" : undefined} data-flip={r.differs ? "true" : undefined} style={{ "--c": TINTS[r.chapter] }} onClick={() => setSel(r.chapter)} data-reveal="">
                  <img className="ea-room__art" src={art.src} width={art.w} height={art.h} alt="" loading="lazy" decoding="async" />
                  <div>
                    <h3 className="ea-room__name">{r.room}{r.end ? <span className="ea-room__end">{r.end}</span> : null}</h3>
                    <p className="ea-room__line">{r.line}</p>
                    {r.differs && R.flip ? <p className="ea-room__flip"><b>{R.flip.title}.</b> {R.flip.line}</p> : null}
                  </div>
                </li>
              );
            })}
          </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- two sides
export function TwoSides({ A }) {
  const s = A.sides;
  if (!s) return null;
  return (
    <section id="sides" className="ea-sec ea-sides" data-tab="rooms" aria-labelledby="ea-h-sides">
      <div className="ea-wrap">
        <Head id="ea-h-sides" title={s.title} intro={s.intro} />
        <div className="ea-sides__stage">
          <div className="ea-table" aria-hidden="true" data-reveal="">
            <span className="ea-table__glow" />
            <span className="ea-table__seat ea-table__seat--a"><GeniiSvg evolution={1} expression="happy" /></span>
            <span className="ea-table__seat ea-table__seat--b"><GeniiSvg evolution={1} expression="curious" /></span>
            <span className="ea-table__top" />
            <span className="ea-table__card ea-table__card--a">{s.people}</span>
            <span className="ea-table__card ea-table__card--b">{s.life}</span>
          </div>
          {s.cells.map((c) => (
            <article key={c.type} className="ea-cell" data-type={c.type} data-reveal="">
              <h3 className="ea-cell__label">{c.label}</h3>
              <p className="ea-cell__pair"><span><small>{c.aStat}</small>{c.a}</span><i aria-hidden="true">{c.type === "team" ? "+" : "\u00d7"}</i><span className="sr-only">{c.type === "team" ? " and " : " against "}</span><span><small>{c.bStat}</small>{c.b}</span></p>
              <p className="ea-cell__line">{c.line}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- open book
export function OpenBook({ A }) {
  const b = A.book;
  if (!b) return null;
  return (
    <section id="book" className="ea-sec ea-book" data-tab="book" aria-labelledby="ea-h-book">
      <div className="ea-wrap ea-book__grid">
        <figure className="ea-book__art" aria-hidden="true" data-reveal="">
          <img src={ART.inside.src} srcSet={ART.inside.srcSet} sizes="(min-width: 900px) 40vw, 92vw" width={ART.inside.w} height={ART.inside.h} alt="" loading="lazy" decoding="async" />
        </figure>
        <div className="ea-book__text">
          <Head id="ea-h-book" label={b.kicker} title={b.title} intro={b.intro} />
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
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- the record
export function Record({ A }) {
  const r = A.record;
  if (!r) return null;
  return (
    <section id="record" className="ea-sec ea-record" data-tab="record" data-scene="night" aria-labelledby="ea-h-record">
      <div className="ea-wrap">
        <div className="ea-record__top">
          <Head id="ea-h-record" label={r.kicker} title={r.headline} intro={r.intro} />
          <div className="ea-score" data-reveal="">
            <span className="ea-score__genii" aria-hidden="true"><GeniiLight size="m" evolution={1} mood="sure" expression={r.face || "happy"} /></span>
            <p className="ea-score__text"><b>{r.exact}</b><span>{` of ${r.called} ${r.of}`}</span></p>
          </div>
          <p className="ea-key">{r.key}</p>
        </div>
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
      </div>
    </section>
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
    <section id="party" className="ea-sec ea-party" data-tab="party" aria-labelledby="ea-h-party">
      <div className="ea-wrap">
        <Head id="ea-h-party" label={A.tabs.find((t) => t.id === "party").label} title={p.title} />
        <ul className="ea-slots" data-reveal="">
          <li className="ea-slot ea-slot--you" style={{ "--i": 0 }}>
            <span className="ea-slot__genii" aria-hidden="true"><GeniiSvg evolution={1} expression="happy" /></span>
            <p className="ea-slot__label">{p.you}</p>
            <p className="ea-slot__name">{p.halves.people}<small>{`${p.with} ${p.halves.life}`}</small></p>
          </li>
          {p.click ? (
            <li className="ea-slot ea-slot--click" style={{ "--i": 1 }}>
              <span className="ea-slot__genii ea-slot__genii--tilt" aria-hidden="true"><GeniiSvg evolution={1} expression="curious" /></span>
              <p className="ea-slot__label">{p.click.label}</p>
              <p className="ea-slot__name">{p.click.name}<small>{`${p.with} ${p.click.side === "life" ? p.halves.people : p.halves.life}`}</small></p>
              <p className="ea-slot__line">{p.click.line}</p>
            </li>
          ) : null}
          {p.opposite ? (
            <li className="ea-slot ea-slot--opp" style={{ "--i": 2 }}>
              <span className="ea-slot__genii ea-slot__genii--flip" aria-hidden="true"><GeniiSvg evolution={1} expression="skeptical" /></span>
              <p className="ea-slot__label">{p.opposite.label}</p>
              <p className="ea-slot__name">{p.opposite.a}<small>{`${p.with} ${p.opposite.b}`}</small></p>
              <p className="ea-slot__line">{p.opposite.line}</p>
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
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------------------------------------- closing
function StoreGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M12 7.5v7M9 11.8l3 3 3-3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

export function Closing({ A, onChallenge }) {
  const c = A.closing;
  const app = c.app;
  const placeholder = app && String(app.link || "").startsWith("#");
  return (
    <section className="ea-sec ea-close" data-tab="party" aria-labelledby="ea-h-close">
      <div className="ea-wrap">
        <p className="ea-close__line" data-reveal="">{c.line}</p>
      </div>
      {app ? (
        <div className="ea-app">
          <picture className="ea-app__art" aria-hidden="true">
            <source media="(min-width: 900px)" srcSet={ART.wide.srcSet} sizes="100vw" width={ART.wide.w} height={ART.wide.h} />
            <img src={ART.portrait.src} srcSet={ART.portrait.srcSet} sizes="100vw" width={ART.portrait.w} height={ART.portrait.h} alt="" loading="lazy" decoding="async" />
          </picture>
          <span className="ea-app__genii" aria-hidden="true"><GeniiLight size="l" evolution={1} mood="sure" expression="happy" /></span>
          <div className="ea-wrap ea-app__wrap">
            <div className="ea-app__panel" data-reveal="">
              <p className="ea-label"><Mark />{app.kicker}</p>
              <h2 id="ea-h-close" className="ea-h2">{app.title}</h2>
              <p className="ea-app__body">{app.body}</p>
              <div className="ea-app__actions">
                <a className="ea-store" href={app.link} onClick={placeholder ? (e) => e.preventDefault() : undefined} data-placeholder={placeholder ? "true" : undefined}>
                  <StoreGlyph /><span><small>{app.store}</small><b>{app.button}</b></span>
                </a>
              </div>
              <p className="ea-app__note">{app.note} <button type="button" className="ea-textbtn" onClick={onChallenge}>{c.challenge}</button></p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
