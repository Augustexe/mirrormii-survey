import React, { useState } from "react";
import { ArrowRight, Check, Copy, Link2, Share2, Trophy } from "lucide-react";
import { FRIEND_EMOJI, RELATIONSHIPS, toggleOptions, inviteText, friendLabel } from "./friend.js";

const TOGGLE_ORDER = ["love", "mk", "stings", "showType"];

function Composer({ setup, defaults, sentBefore, onCreate }) {
  const [rel, setRel] = useState(defaults.rel || null);
  const [flags, setFlags] = useState({});
  const [emoji, setEmoji] = useState(0);
  const [invite, setInvite] = useState(0);
  const [name, setName] = useState(defaults.name || "");
  const [error, setError] = useState("");
  const [made, setMade] = useState(null);
  const [copied, setCopied] = useState("");
  const offered = rel ? toggleOptions(rel, setup) : null;
  const flag = (key) => (key in flags ? flags[key] : offered[key].default);
  const chooseRel = (id) => { setRel(id); setFlags({}); setInvite(0); setMade(null); setError(""); };
  const create = () => {
    setError("");
    const input = { rel, emoji, invite, name };
    for (const key of TOGGLE_ORDER) if (offered[key]) input[key] = flag(key);
    const out = onCreate(input);
    if (out.error) setError(out.error);
    else setMade(out);
  };
  const copy = async (text, what) => {
    try { await navigator.clipboard.writeText(text); setCopied(what); setTimeout(() => setCopied(""), 1800); } catch { setCopied(""); }
  };
  const share = async () => {
    try { await navigator.share({ text: made.invite, url: made.link }); } catch { /* the player closed the share sheet */ }
  };
  if (made) {
    return (
      <div className="fp-made" role="status">
        <p className="fp-made__title"><Check size={16} aria-hidden="true" /> Link ready for {made.label}</p>
        <p className="fp-made__invite">“{made.invite}”</p>
        <label className="fp-field"><span>Their link</span><input readOnly value={made.link} onFocus={(e) => e.target.select()} /></label>
        <div className="fp-actions">
          <button type="button" className="button button--primary" onClick={() => copy(`${made.invite} ${made.link}`, "both")}><Copy size={16} /> {copied === "both" ? "Copied" : "Copy invite and link"}</button>
          <button type="button" className="button button--secondary" onClick={() => copy(made.link, "link")}><Link2 size={16} /> {copied === "link" ? "Copied" : "Copy link only"}</button>
          {typeof navigator !== "undefined" && navigator.share && <button type="button" className="button button--secondary" onClick={share}><Share2 size={16} /> Share</button>}
        </div>
        <small>When they finish, they get a link to send back. Open it in this browser to see how they did.</small>
        <button type="button" className="persona-link" onClick={() => { setMade(null); setRel(null); }}>Send to someone else</button>
      </div>
    );
  }
  return (
    <div className="fp-composer">
      <fieldset className="fp-rels">
        <legend>Who are you sending this to?</legend>
        {RELATIONSHIPS.map((o) => (
          <label key={o.id} className={`fp-rel ${rel === o.id ? "is-on" : ""}`}>
            <input type="radio" name="fp-rel" value={o.id} checked={rel === o.id} onChange={() => chooseRel(o.id)} />
            <b>{o.label}</b><small>{o.sub}</small>
          </label>
        ))}
      </fieldset>
      {rel && (
        <>
          <fieldset className="fp-toggles">
            <legend>What they can see</legend>
            {TOGGLE_ORDER.filter((key) => offered[key]).map((key) => (
              <label key={key} className="fp-toggle">
                <input type="checkbox" checked={flag(key)} onChange={(e) => setFlags({ ...flags, [key]: e.target.checked })} />
                <span>{offered[key].label}{key === "stings" && flag(key) && offered[key].confirm && <small>{offered[key].confirm}</small>}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="fp-emoji">
            <legend>Their label: <b>{friendLabel(rel, emoji)}</b></legend>
            <div>
              {FRIEND_EMOJI.map((e, i) => (
                <label key={i} className={emoji === i ? "is-on" : ""}>
                  <input type="radio" name="fp-emoji" checked={emoji === i} onChange={() => setEmoji(i)} aria-label={`Emoji ${i + 1}`} />
                  <span aria-hidden="true">{e}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="fp-field">
            <span>Your first name, the way they know you <small>(optional)</small></span>
            <input value={name} maxLength={24} autoComplete="given-name" onChange={(e) => setName(e.target.value)} placeholder="Leave blank to stay “your friend”" />
          </label>
          <fieldset className="fp-invites">
            <legend>Your invite line</legend>
            {[0, 1, 2].map((i) => (
              <label key={i} className={`fp-invite ${invite === i ? "is-on" : ""}`}>
                <input type="radio" name="fp-invite" checked={invite === i} onChange={() => setInvite(i)} />
                <span>{inviteText(rel, i, { stings: offered.stings ? flag("stings") : false, sentBefore })}</span>
              </label>
            ))}
          </fieldset>
          {error && <p className="save-error" role="alert">{error}</p>}
          <button type="button" className="button button--primary button--large" onClick={create}>Make their link <ArrowRight size={18} /></button>
        </>
      )}
    </div>
  );
}

export function FriendsPanel({ friends, onAction }) {
  const [paste, setPaste] = useState("");
  const [pasteError, setPasteError] = useState("");
  const [copiedId, setCopiedId] = useState("");
  const openPaste = () => {
    const out = onAction("import", paste);
    if (out && out.error) setPasteError(out.error);
    else { setPaste(""); setPasteError(""); }
  };
  const copy = async (id, text) => {
    try { await navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(""), 1800); } catch { setCopiedId(""); }
  };
  return (
    <section className="fp" aria-labelledby="fp-title">
      <div className="fp-intro">
        <span className="eyebrow">The friend game</span>
        <h2 id="fp-title">Do you really know me?</h2>
        <p>Send a link. They guess your type, a few of your choices and what Genii calls you. You see what they get right, and what they don't see.</p>
        {friends.returnTo && <p className="fp-return">{friends.returnTo.name || "Your friend"} played about you. Send one back and see if they really know you.</p>}
      </div>
      <Composer setup={friends.setup} defaults={friends.defaults} sentBefore={friends.challenges.length > 0} onCreate={(input) => onAction("create", input)} />
      {friends.challenges.length > 0 && (
        <div className="fp-sent">
          <h3>Links you've sent</h3>
          <ul>
            {friends.challenges.map((c) => (
              <li key={c.id} className="fp-sent__row">
                <span className="fp-sent__who"><b>{c.label}</b><small>{c.played ? "Played" : "Waiting for their reply"}</small></span>
                <span className="fp-sent__actions">
                  {c.played && <button type="button" className="button button--primary" onClick={() => onAction("open", c.id)}>See how they did <ArrowRight size={16} /></button>}
                  <button type="button" className="button button--secondary" onClick={() => copy(c.id, c.link)}><Copy size={15} /> {copiedId === c.id ? "Copied" : "Copy link"}</button>
                </span>
              </li>
            ))}
          </ul>
          <div className="fp-paste">
            <label className="fp-field">
              <span>Got a reply link? If it opened somewhere else, paste it here.</span>
              <input value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste the reply link" />
            </label>
            <button type="button" className="button button--secondary" onClick={openPaste} disabled={!paste.trim()}>Open reply</button>
            {pasteError && <p className="save-error" role="alert">{pasteError}</p>}
          </div>
        </div>
      )}
      {friends.ranking && (
        <div className="fp-rank">
          <h3><Trophy size={16} aria-hidden="true" /> {friends.ranking.title}</h3>
          <small>{friends.ranking.sub}</small>
          {friends.ranking.unlocked
            ? <ol>{friends.ranking.rows.map((r, i) => <li key={r.key}>{r.line}{i === 0 && <span className="fp-badge">{friends.ranking.topBadge}</span>}</li>)}</ol>
            : <p>{friends.ranking.locked}</p>}
        </div>
      )}
    </section>
  );
}
