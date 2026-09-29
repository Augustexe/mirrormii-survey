// The nine story screens (LAUNCH-SPEC section 21). Each renders one slide object from story-data.js. Every heading
// carries data-focus so the deck can move focus to it when the screen changes.
import React from "react";
import { ArrowRight, Download, Copy, Heart, Lock, RotateCcw, Trash2, Users, Sparkles } from "lucide-react";

function Kicker({ children }) {
  return <p className="pst-kicker pst-in">{children}</p>;
}

function Intro({ s }) {
  return (
    <div className="pst-body pst-body--center">
      <div className="pst-orb pst-in" aria-hidden="true" />
      <Kicker>{s.kicker}</Kicker>
      <h2 className="pst-title pst-title--xl pst-in" data-focus tabIndex="-1">{s.title}</h2>
      <p className="pst-sub pst-in">{s.sub}</p>
    </div>
  );
}

function Names({ s }) {
  return (
    <div className="pst-body">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{`${s.people.name} and ${s.life.name}`}</h2>
      <div className="pst-names">
        {[s.people, s.life].map((h, i) => (
          <div className="pst-name pst-in" key={i}>
            <span className="pst-name__label">{h.label}</span>
            <strong className="pst-name__name">{h.name}</strong>
          </div>
        ))}
      </div>
      <p className="pst-sub pst-in">{s.sub}</p>
    </div>
  );
}

function Read({ s }) {
  return (
    <div className="pst-body">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{s.kicker}</h2>
      <ol className="pst-read">
        {s.lines.map((line, i) => <li className="pst-in" key={i}>{line}</li>)}
      </ol>
    </div>
  );
}

function MapRow({ row }) {
  const cls = row.unfinished ? "is-open" : row.flex ? "is-flex" : `is-${row.side}`;
  const label = row.unfinished ? `Between ${row.left} and ${row.right}, still open` : row.flex ? `Right between ${row.left} and ${row.right}` : `${row.side === "left" ? row.left : row.right}, over ${row.side === "left" ? row.right : row.left}`;
  return (
    <li className={`pst-map__row pst-in ${cls}`} aria-label={label}>
      <span className="pst-map__ends" aria-hidden="true"><b className="pst-map__left">{row.left}</b><b className="pst-map__right">{row.right}</b></span>
      <span className="pst-map__track" aria-hidden="true"><i className="pst-map__dot" style={{ left: `${row.pos}%` }} /></span>
    </li>
  );
}

function MapScreen({ s }) {
  return (
    <div className="pst-body">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="pst-title pst-in" data-focus tabIndex="-1">{s.title}</h2>
      {s.groups.map((g) => (
        <div className="pst-map" key={g.label}>
          <p className="pst-map__label pst-in">{g.label}</p>
          <ul>{g.rows.map((r) => <MapRow row={r} key={r.key} />)}</ul>
        </div>
      ))}
      {s.caption && <p className="pst-caption pst-in">{s.caption}</p>}
    </div>
  );
}

function Traits({ s }) {
  return (
    <div className="pst-body">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="pst-title pst-in" data-focus tabIndex="-1">{s.title}</h2>
      {s.empty ? <p className="pst-sub pst-in">{s.empty}</p> : (
        <ul className="pst-traits">
          {s.tags.map((t) => (
            <li className="pst-trait pst-in" key={t.key}>
              <strong>{t.name}</strong>
              <span>{t.line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Insight({ s }) {
  return (
    <div className="pst-body pst-body--center">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="pst-insight pst-in" data-focus tabIndex="-1">{s.line}</h2>
    </div>
  );
}

function Stings({ s }) {
  return (
    <div className="pst-body">
      <p className="pst-only pst-in"><Lock size={12} aria-hidden="true" /> {s.badge}</p>
      <h2 className="pst-title pst-in" data-focus tabIndex="-1">{s.title}</h2>
      <ul className="pst-stings">
        {s.stings.map((line, i) => <li className="pst-in" key={i}>{line}</li>)}
      </ul>
    </div>
  );
}

export function ShareCard({ share }) {
  return (
    <figure className="pst-card" aria-label="Share card">
      <span className="pst-card__brand">{share.brand || "Genii · MirrorMii"}</span>
      <div className="pst-card__names">
        {share.names.map((n, i) => (
          <div key={i}><span>{n.label}</span><strong>{n.name}</strong></div>
        ))}
      </div>
      {share.tags.length > 0 && (
        <ul className="pst-card__tags">
          {share.tags.map((t, i) => <li key={i}><b>{t.name}</b> <span><Heart size={12} aria-hidden="true" /> {t.heart}</span></li>)}
        </ul>
      )}
    </figure>
  );
}

function Share({ s, onInvite, onCopy, copied }) {
  return (
    <div className="pst-body">
      <Kicker>{s.kicker}</Kicker>
      <h2 className="sr-only" data-focus tabIndex="-1">{s.kicker}</h2>
      <div className="pst-in"><ShareCard share={s.share} /></div>
      <button type="button" className="pst-cta pst-in" onClick={onInvite}>{s.share.invite} <ArrowRight size={18} aria-hidden="true" /></button>
      <p className="pst-sub pst-sub--small pst-in">{s.sub}</p>
      <button type="button" className="pst-link pst-in" onClick={onCopy}><Copy size={14} aria-hidden="true" /> {copied ? "Copied" : "Copy the text"}</button>
    </div>
  );
}

function App({ s, onFriends, onGuesses, hasGuesses, guessLabel, onRestart, onDownload, onDelete, storageOK }) {
  const placeholder = s.link.startsWith("#");
  return (
    <div className="pst-body pst-body--center">
      <div className="pst-orb pst-orb--small pst-in" aria-hidden="true" />
      <Kicker>{s.kicker}</Kicker>
      <h2 className="pst-title pst-in" data-focus tabIndex="-1">{s.title}</h2>
      <p className="pst-sub pst-in">{s.body}</p>
      <a className="pst-cta pst-in" href={s.link} onClick={placeholder ? (e) => e.preventDefault() : undefined} data-placeholder={placeholder ? "true" : undefined}>
        <Sparkles size={18} aria-hidden="true" /> {s.button}
      </a>
      <p className="pst-note pst-in">{s.note}</p>
      <div className="pst-end pst-in">
        <button type="button" className="pst-ghost" onClick={onFriends}><Users size={16} aria-hidden="true" /> Do you really know me?</button>
        {hasGuesses && <button type="button" className="pst-link" onClick={onGuesses}>{guessLabel}</button>}
      </div>
      <div className="pst-footer pst-in">
        <p>{storageOK ? "Saved on this device only." : "Saving is unavailable. This result lives in this tab."}</p>
        <div>
          <button type="button" className="pst-link" onClick={onDownload}><Download size={14} aria-hidden="true" /> Download my data</button>
          <button type="button" className="pst-link" onClick={onRestart}><RotateCcw size={14} aria-hidden="true" /> Start over</button>
          <button type="button" className="pst-link pst-danger" onClick={onDelete}><Trash2 size={14} aria-hidden="true" /> Delete my data</button>
        </div>
      </div>
    </div>
  );
}

export function StoryScreen({ slide, ...props }) {
  switch (slide.id) {
    case "intro": return <Intro s={slide} />;
    case "names": return <Names s={slide} />;
    case "read": return <Read s={slide} />;
    case "map": return <MapScreen s={slide} />;
    case "traits": return <Traits s={slide} />;
    case "insight": return <Insight s={slide} />;
    case "stings": return <Stings s={slide} />;
    case "share": return <Share s={slide} {...props} />;
    case "app": return <App s={slide} {...props} />;
    default: return null;
  }
}
