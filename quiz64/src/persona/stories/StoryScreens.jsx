// The story screens (LAUNCH-SPEC sections 21 and 23, DESIGN-DIRECTION 5.12). Each renders one slide from
// story-data.js. Every screen has one heading with data-focus so the deck can move focus to it when the screen
// changes. The reveal art (the mirror, the pairs, the gems, the rooms, the flip, the panes, the card, the app scene)
// lives in ../reveal.
import React, { useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, Lock, Share, Sparkles, Users } from "lucide-react";
import { ChapterGlyph, MirrorArch, Sigil } from "../../art/index.js";
import { IntroScreen, NamesScreen } from "../reveal/MirrorReveal.jsx";
import { MapScreen } from "../reveal/FacetScreen.jsx";
import { KnowsScreen } from "../reveal/Findings.jsx";
import { RoomsScreen } from "../reveal/Rooms.jsx";
import { CallsScreen } from "../reveal/Calls.jsx";
import { AppScene } from "../reveal/AppScene.jsx";
import { InsightFlip } from "../reveal/InsightFlip.jsx";
import { seeded } from "../reveal/layout.js";
import { renderShareCard, FORMATS, SHARE_TRAITS } from "../share-image.js";
import { UI_COPY } from "./story-data.js";

function Kicker({ children }) {
  return <p className="rv-kicker rv-in">{children}</p>;
}

// Story 3: the read, etched on two glass tablets, one per half: the confident line over the longer description.
function Read({ s }) {
  const marks = s.marks || [];
  const bodies = s.bodies || [];
  return (
    <div className="rv-body rv-body--read">
      <span className="rv-watermark" aria-hidden="true"><MirrorArch seed="watermark" filled={[]} mullion glow={0} size={300} /></span>
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{s.kicker}</h2>
      <ol className="rv-tablets">
        {s.lines.map((line, i) => {
          const mk = marks[i] || { kind: "none" };
          return (
            <li className="rv-tablet rv-in" key={i} style={{ "--i": i }} data-half={i ? "life" : "people"}>
              <span className="rv-tablet__mark" aria-hidden="true">
                {mk.kind === "sigil" ? <Sigil code={mk.code} size={30} /> : mk.kind === "chapter" ? <ChapterGlyph chapter={mk.chapter} size={26} /> : null}
              </span>
              <span className="rv-tablet__line">{line}</span>
              {bodies[i] ? <span className="rv-tablet__body">{bodies[i]}</span> : null}
              <span className="rv-tablet__sweep" aria-hidden="true" />
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Story 8: traits as charms hanging from the mirror's frame; the two strongest hang larger, in the brand glass.
function Traits({ s }) {
  return (
    <div className="rv-body rv-body--traits">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <span className="rv-chain" aria-hidden="true" />
      {s.empty ? (
        <ul className="rv-charms"><li className="rv-charm rv-charm--frost rv-in" style={{ "--i": 0 }}><span className="rv-charm__line">{s.empty}</span></li></ul>
      ) : (
        <ul className="rv-charms" data-count={s.tags.length}>
          {s.tags.map((t, i) => (
            <li className={`rv-charm${i < 2 ? " rv-charm--hero" : ""}`} key={t.key} style={{ "--i": i }} data-level={t.level}>
              <span className="rv-charm__glyph" aria-hidden="true"><ChapterGlyph chapter={t.chapter ?? "extras"} size={28} /></span>
              <span className="rv-charm__text">
                <strong className="rv-charm__name">{t.name}</strong>
                <span className="rv-charm__line">{t.line}</span>
                {t.private ? <span className="rv-charm__private"><Lock size={11} aria-hidden="true" /> {UI_COPY.privateTrait}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Story 9: the back of the mirror. Old silver foxing, a lock badge, the stings in Genii's italic.
function Stings({ s, seed }) {
  const specks = seeded(`${seed}-foxing`, 72);
  return (
    <div className="rv-body rv-body--stings">
      <span className="rv-foxing" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ left: `${specks[i * 3] * 100}%`, top: `${specks[i * 3 + 1] * 100}%`, "--r": `${10 + specks[i * 3 + 2] * 46}px` }} />
        ))}
      </span>
      <p className="rv-badge rv-in"><Lock size={12} aria-hidden="true" /> {s.badge}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ul className="rv-stings">
        {s.stings.map((line, i) => <li className="rv-in" key={i} style={{ "--i": i }}>{line}</li>)}
      </ul>
    </div>
  );
}

// Story 11: the mirror card. The preview is the real image, drawn by share-image.js; until it is drawn (or where
// canvas is unavailable) the same content shows as text.
export function MirrorCard({ card, active, format = "story", theme = "night" }) {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    if (!active || !ref.current) return undefined;
    let live = true;
    renderShareCard(card, { format, theme, canvas: ref.current }).then(() => { if (live) setDrawn(true); }, () => { if (live) setDrawn(false); });
    return () => { live = false; };
  }, [active, card, format, theme]);
  const { w, h } = FORMATS[format] || FORMATS.story;
  return (
    <figure className="rv-card" data-card data-format={format} data-theme={theme} data-drawn={drawn ? "true" : "false"} aria-label="Your mirror card">
      <canvas ref={ref} width={w} height={h} aria-hidden="true" />
      <div className="rv-card__text">
        {card.names.map((n, i) => (
          <p key={i} className="rv-card__name"><span>{n.label}</span> <strong>{n.name}</strong></p>
        ))}
        {card.tags.length > 0 && (
          <ul className="rv-card__tags">
            {card.tags.slice(0, SHARE_TRAITS).map((t, i) => <li key={i}><b>{t.name}</b> <span>{t.heart}</span></li>)}
          </ul>
        )}
        <p className="rv-card__invite">{card.invite}</p>
      </div>
    </figure>
  );
}

function Seg({ value, options, onChange, label }) {
  return (
    <div className="rv-seg" role="radiogroup" aria-label={label}>
      {options.map(([id, text]) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} className={value === id ? "is-on" : ""} onClick={() => onChange(id)}>{text}</button>
      ))}
    </div>
  );
}

function ShareScreen({ s, active, onInvite, onShareImage, onCopy, copied, format, setFormat, cardTheme, setCardTheme, busy }) {
  return (
    <div className="rv-body rv-body--share">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{s.kicker}</h2>
      <div className="rv-cardwrap rv-in"><MirrorCard card={s.share} active={active} format={format} theme={cardTheme} /></div>
      <div className="rv-cardopts rv-in">
        <Seg label="Card shape" value={format} onChange={setFormat} options={[["story", UI_COPY.shareFormats.story], ["post", UI_COPY.shareFormats.post]]} />
        <Seg label="Card light" value={cardTheme} onChange={setCardTheme} options={[["night", "Night"], ["day", "Day"]]} />
      </div>
      <div className="rv-actions rv-in">
        <button type="button" className="rv-textbtn rv-pillbtn rv-pillbtn--strong" onClick={onShareImage} disabled={busy}><Share size={17} aria-hidden="true" /> {UI_COPY.shareImage}</button>
        <button type="button" className="rv-textbtn rv-pillbtn" onClick={onCopy}><Link2 size={17} aria-hidden="true" /> {copied ? UI_COPY.copied : UI_COPY.copyLink}</button>
      </div>
      <button type="button" className="rv-cta rv-cta--deep rv-in" onClick={onInvite}>{s.share.invite} <ArrowRight size={18} aria-hidden="true" /></button>
      <p className="rv-sub rv-in">{s.sub}</p>
      {s.opposite && <p className="rv-opposite rv-in">{s.opposite}</p>}
    </div>
  );
}

// Story 12: get the app. One large in-game moment (you snap lunch, Miia lives it), then one job: Get MirrorMii. The
// friend game and the guesses step back to small links; the data actions wait behind "Your data".
function App({ s, stage, onFriends, onGuesses, hasGuesses, guessLabel, onData }) {
  const placeholder = s.link.startsWith("#");
  const h = stage ? stage.h : 844;
  const w = stage ? stage.w : 390;
  const art = Math.round(Math.max(190, Math.min(300, (h - 470) * 0.8, w * 0.72)));
  return (
    <div className="rv-body rv-body--app">
      <AppScene width={art} snap={s.snap} lives={s.lives} />
      <Kicker>{s.kicker}</Kicker>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <p className="rv-body-l rv-in">{s.body}</p>
      <a className="rv-cta rv-cta--white rv-in" href={s.link} onClick={placeholder ? (e) => e.preventDefault() : undefined} data-placeholder={placeholder ? "true" : undefined}>
        <Sparkles size={18} aria-hidden="true" /> {s.button}
      </a>
      <p className="rv-note rv-in">{s.note}</p>
      <div className="rv-end rv-in">
        <div className="rv-end__links">
          <button type="button" className="rv-textbtn" onClick={onFriends}><Users size={15} aria-hidden="true" /> Do you really know me?</button>
          {hasGuesses && <button type="button" className="rv-textbtn" onClick={onGuesses}>{guessLabel}</button>}
          <button type="button" className="rv-textbtn" onClick={onData}>{UI_COPY.yourData}</button>
        </div>
      </div>
    </div>
  );
}

export function StoryScreen({ slide, ...props }) {
  switch (slide.id) {
    case "intro": return <IntroScreen s={slide} stage={props.stage} active={props.active} reduced={props.reduced} phase={props.reveal} onStart={props.onAssemble} onDone={props.onAssembled} />;
    case "names": return <NamesScreen s={slide} stage={props.stage} active={props.active} reduced={props.reduced} wipe={props.wipe} onWiped={props.onWiped} sparkles={props.sparkles} />;
    case "read": return <Read s={slide} />;
    case "map": return <MapScreen s={slide} />;
    case "knows": return <KnowsScreen s={slide} />;
    case "rooms": return <RoomsScreen s={slide} />;
    case "calls": return <CallsScreen s={slide} onGuesses={props.onGuesses} />;
    case "traits": return <Traits s={slide} />;
    case "insight": return <InsightFlip s={slide} active={props.active} />;
    case "stings": return <Stings s={slide} seed={props.seed} />;
    case "share": return <ShareScreen s={slide} {...props} />;
    case "app": return <App s={slide} {...props} />;
    default: return null;
  }
}
