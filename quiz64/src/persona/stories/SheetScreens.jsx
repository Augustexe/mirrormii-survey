// Round 3 content screens (LAUNCH-SPEC section 24, items 1, 2 and 4): the character sheet (story 4), the core traits
// (story 8) and the stings, open book (story 9). Everything shown comes from story-data.js, which reads it from the
// player's own score: no number and no percentage ever renders here.
import React from "react";
import { ChapterGlyph } from "../../art/index.js";
import { StatGlyph } from "../reveal/StatGlyph.jsx";
import { bothEnds } from "../stats.js";
import { seeded } from "../reveal/layout.js";
import { UI_COPY } from "./story-data.js";
import "./sheet-screens.css";

// Five pips, lit from the left for a lean; a near-even stat shows every pip half lit ("Both"), an unfinished one none.
export function Pips({ n = 0, split = false }) {
  return (
    <span className="rv-pips" data-split={split ? "true" : undefined} aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => <i key={i} className={split ? "is-half" : i <= n ? "is-on" : undefined} />)}
    </span>
  );
}

function endText(row) {
  if (row.unfinished) return bothEnds(row.a, row.b, "or");
  if (row.flex) return bothEnds(row.a, row.b);
  return row.leadEnd;
}

const PIP_WORDS = ["no", "one", "two", "three", "four", "five"];
// What a screen reader hears for one stat: the stat, the level and the end, the plain line, and the badge.
function sentence(row, badge) {
  const head = row.unfinished ? `${row.stat}: ${row.level}.` : row.flex ? `${row.stat}: ${row.level}, ${bothEnds(row.a, row.b)}.` : `${row.stat}: ${row.leadEnd}, ${row.level}, ${PIP_WORDS[row.pips] || "no"} pips of five.`;
  return [badge ? `${badge.label}.` : "", head, row.note, badge ? badge.note : ""].filter(Boolean).join(" ");
}

function StatRow({ row, i, badges }) {
  const state = row.unfinished ? "open" : row.flex ? "flex" : "lean";
  const badge = row.badge ? badges[row.badge] : null;
  return (
    <li className="rv-stat" data-state={state} data-badge={row.badge || undefined} data-stat={row.key} style={{ "--i": i }}>
      <span className="sr-only">{sentence(row, badge)}</span>
      <span className="rv-stat__head" aria-hidden="true">
        <span className="rv-stat__name"><StatGlyph axis={row.key} size={14} />{row.stat}</span>
        {badge ? <span className="rv-stat__badge">{badge.label}</span> : null}
        <Pips n={row.pips} split={row.split} />
      </span>
      <span className="rv-stat__end" aria-hidden="true">
        <b>{endText(row)}</b>
        <em>{row.level}</em>
      </span>
      <span className="rv-stat__line" aria-hidden="true">{row.note}</span>
    </li>
  );
}

// Story 4: the character sheet. People stats above, life stats below; the signature stat glows, the wild card is
// dashed. The sentence under the title says what both marks mean.
export function SheetScreen({ s }) {
  let n = 0;
  const badges = { signature: s.signature, wild: s.wild };
  return (
    <div className="rv-body rv-body--map rv-body--cs">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      {s.sub ? <p className="rv-sub rv-cs__sub rv-in">{s.sub}</p> : null}
      <div className="rv-cs rv-in">
        {s.groups.map((g) => (
          <div key={g.label} className="rv-cs__group" role="group" aria-label={g.label}>
            <p className="rv-pairs__label">{g.label}</p>
            <ul>{g.rows.map((r) => <StatRow key={r.key} row={r} i={n++} badges={badges} />)}</ul>
          </div>
        ))}
      </div>
    </div>
  );
}

// Story 8: the core traits. Five or six keywords, each with where it came from (the trait or the stat behind it) and
// one line of evidence. The first two are the hero pair. Marriage and kids traits are marked as kept off the card.
export function CoreTraitsScreen({ s }) {
  const core = s.core || [];
  return (
    <div className="rv-body rv-body--traits rv-body--core">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      {!core.length ? (
        <p className="rv-core__empty rv-in">{s.empty}</p>
      ) : (
        <ul className="rv-core" data-count={core.length}>
          {core.map((k, i) => (
            <li key={k.key} className={`rv-core__item rv-in${i < 2 ? " is-hero" : ""}`} style={{ "--i": i }} data-kind={k.kind}>
              <span className="rv-core__mark" aria-hidden="true">
                {k.kind === "tag" ? <ChapterGlyph chapter={k.chapter ?? "extras"} size={20} /> : <StatGlyph axis={k.axis} size={17} />}
              </span>
              <span className="rv-core__text">
                <span className="rv-core__top">
                  <strong className="rv-core__kw">{k.keyword}</strong>
                  <span className="rv-core__src">{k.source}</span>
                </span>
                <span className="rv-core__line">{k.line}</span>
                {k.private ? <span className="rv-core__private">{UI_COPY.privateTrait}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Story 9: the stings, open book. The back of the mirror (old silver foxing), the kicker, the title, the lines.
export function StingsScreen({ s, seed }) {
  const specks = seeded(`${seed}-foxing`, 72);
  return (
    <div className="rv-body rv-body--stings">
      <span className="rv-foxing" aria-hidden="true">
        {Array.from({ length: 24 }, (_, i) => (
          <i key={i} style={{ left: `${specks[i * 3] * 100}%`, top: `${specks[i * 3 + 1] * 100}%`, "--r": `${10 + specks[i * 3 + 2] * 46}px` }} />
        ))}
      </span>
      {s.kicker ? <p className="rv-kicker rv-stings__kicker rv-in">{s.kicker}</p> : null}
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ul className="rv-stings">
        {s.stings.map((line, i) => <li className="rv-in" key={i} style={{ "--i": i }}>{line}</li>)}
      </ul>
    </div>
  );
}
