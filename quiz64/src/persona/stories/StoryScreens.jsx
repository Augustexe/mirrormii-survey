// The story screens (LAUNCH-SPEC sections 21 and 23, DESIGN-DIRECTION 5.12). Each renders one slide from
// story-data.js. Every screen has one heading with data-focus so the deck can move focus to it when the screen
// changes. The reveal art (the mirror, the pairs, the gems, the rooms, the flip, the panes, the card, the app scene)
// lives in ../reveal.
import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Link2, Share, Users } from "lucide-react";
import { ChapterGlyph, MirrorArch, Sigil } from "../../art/index.js";
import { IntroScreen, NamesScreen } from "../reveal/MirrorReveal.jsx";
import { CoreTraitsScreen, SheetScreen, StingsScreen } from "./SheetScreens.jsx";
import { KnowsScreen } from "../reveal/Findings.jsx";
import { RoomsScreen } from "../reveal/Rooms.jsx";
import { CallsScreen } from "../reveal/Calls.jsx";
import { Aura, WorldScene } from "../reveal/WorldArt.jsx";
import { InsightFlip } from "../reveal/InsightFlip.jsx";
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

// Story 11 (G6): the card first, a little smaller; Share image is the one primary action; the friend game is a named
// challenge with what it is under it; Copy link steps back to a text button. Round 3: the card stands in light on the
// real MirrorMii World island, with the CGI Genii beside it (drawn into the card), and light blooms behind it.
// "Read the long version": the Evidence Article (LAUNCH-SPEC 25 item 3), on the last two screens.
function ReadMore({ label, onArticle, className = "" }) {
  if (!label || !onArticle) return null;
  return <button type="button" className={`rv-textbtn rv-pillbtn rv-readmore ${className}`} onClick={onArticle}><BookOpen size={17} aria-hidden="true" /> {label}</button>;
}

function ShareScreen({ s, active, onInvite, onShareImage, onCopy, copied, format, setFormat, cardTheme, setCardTheme, busy, onArticle, readMore }) {
  return (
    <div className="rv-body rv-body--share">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{s.kicker}</h2>
      <div className="rv-cardwrap rv-in">
        {/* The card itself carries the island and the CGI Genii (share-image.js); the page adds the light behind it. */}
        <span className="rv-cardstage" aria-hidden="true"><Aura className="rv-cardstage__aura" /></span>
        <MirrorCard card={s.share} active={active} format={format} theme={cardTheme} />
      </div>
      <div className="rv-cardopts rv-in">
        <Seg label="Card shape" value={format} onChange={setFormat} options={[["story", UI_COPY.shareFormats.story], ["post", UI_COPY.shareFormats.post]]} />
        <Seg label="Card light" value={cardTheme} onChange={setCardTheme} options={[["night", UI_COPY.shareThemes.night], ["day", UI_COPY.shareThemes.day]]} />
      </div>
      <button type="button" className="rv-cta rv-cta--deep rv-in" onClick={onShareImage} disabled={busy}><Share size={18} aria-hidden="true" /> {UI_COPY.shareImage}</button>
      <div className="rv-actions rv-in">
        <button type="button" className="rv-textbtn rv-pillbtn rv-pillbtn--strong" onClick={onInvite}><Users size={17} aria-hidden="true" /> {s.challenge || s.share.invite}</button>
        <button type="button" className="rv-textbtn rv-pillbtn" onClick={onCopy}><Link2 size={17} aria-hidden="true" /> {copied ? UI_COPY.copied : UI_COPY.copyLink}</button>
        <ReadMore label={readMore} onArticle={onArticle} />
      </div>
      <p className="rv-sub rv-in">{s.sub}</p>
      {s.opposite && <p className="rv-opposite rv-in">{s.opposite}</p>}
    </div>
  );
}

// Story 12: get the app (G6, round 3). The loop in one picture on the real MirrorMii World island (you snap lunch, it
// lands in the game, the CGI Genii waits on the plaza), a headline that says what the game does with your real day,
// one App Store style button; the friend game, the guesses and the data actions are small links under it.
function StoreGlyph() {
  // A plain phone with a download arrow: a store cue drawn in code, not a platform's mark.
  return (
    <svg className="rv-store__glyph" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="6" y="2.5" width="12" height="19" rx="3" />
      <path d="M12 7.5v7M9 11.8l3 3 3-3" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

function App({ s, stage, onFriends, onGuesses, hasGuesses, guessLabel, onData, onArticle, readMore }) {
  const placeholder = s.link.startsWith("#");
  const h = stage ? stage.h : 844;
  const w = stage ? stage.w : 390;
  const art = Math.round(Math.max(140, Math.min(320, h - 520)));
  return (
    <div className="rv-body rv-body--app">
      <WorldScene width={w} height={art} snap={s.snap} lives={s.lives} />
      <Kicker>{s.kicker}</Kicker>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <p className="rv-body-l rv-in">{s.body}</p>
      <a className="rv-cta rv-store rv-in" href={s.link} onClick={placeholder ? (e) => e.preventDefault() : undefined} data-placeholder={placeholder ? "true" : undefined}>
        <StoreGlyph />
        <span className="rv-store__text"><small>{s.store}</small><b>{s.button}</b></span>
      </a>
      <p className="rv-note rv-in">{s.note}</p>
      <ReadMore label={readMore} onArticle={onArticle} className="rv-pillbtn--strong rv-in" />
      <div className="rv-end rv-in">
        <div className="rv-end__links">
          <button type="button" className="rv-textbtn" onClick={onFriends}><Users size={15} aria-hidden="true" /> {UI_COPY.invite}</button>
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
    case "map": return <SheetScreen s={slide} />;
    case "knows": return <KnowsScreen s={slide} />;
    case "rooms": return <RoomsScreen s={slide} />;
    case "calls": return <CallsScreen s={slide} onGuesses={props.onGuesses} />;
    case "traits": return <CoreTraitsScreen s={slide} />;
    case "insight": return <InsightFlip s={slide} active={props.active} />;
    case "stings": return <StingsScreen s={slide} seed={props.seed} />;
    case "share": return <ShareScreen s={slide} {...props} />;
    case "app": return <App s={slide} {...props} />;
    default: return null;
  }
}
