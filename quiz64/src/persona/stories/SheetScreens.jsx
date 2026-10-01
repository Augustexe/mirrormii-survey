// Content screens: the drama stats (story 4, 2026-09-30), the core traits (story 8) and the stings, open book
// (story 9). Everything shown comes from story-data.js, which reads it from the player's own score. The stat scores
// (1 to 20) are the only numbers here; no percentage ever renders.
import React from "react";
import { BookOpen } from "lucide-react";
import { ChapterGlyph } from "../../art/index.js";
import { StatGlyph } from "../reveal/StatGlyph.jsx";
import { seeded } from "../reveal/layout.js";
import { UI_COPY } from "./story-data.js";
import "./sheet-screens.css";

// One stat block, D&D style: the abbreviation over the score inside an oval frame (the World Mirror's shape); beside
// it the full name and the short line. A screen reader hears it as one sentence.
function StatBlock({ b, i, surprise }) {
  return (
    <li className="rv-ds" data-pick={b.pick} data-stat={b.id} style={{ "--i": i }}>
      <span className="sr-only">{`${b.name}, ${b.score}.${b.pick === "surprise" ? ` ${surprise}.` : ""} ${b.line}`}</span>
      <span className="rv-ds__box" aria-hidden="true">
        <span className="rv-ds__abbr">{b.abbr}</span>
        <span className="rv-ds__score">{b.score}</span>
      </span>
      <span className="rv-ds__text" aria-hidden="true">
        <span className="rv-ds__head">
          <span className="rv-ds__name">{b.name}</span>
          {b.pick === "surprise" ? <span className="rv-ds__tag">{surprise}</span> : null}
        </span>
        <span className="rv-ds__line">{b.line}</span>
      </span>
    </li>
  );
}

// Story 4: the drama stats. The three highest and the most surprising one, then the link to all six in the article.
export function DramaScreen({ s, onArticle }) {
  return (
    <div className="rv-body rv-body--map rv-body--ds" tabIndex="0">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ul className="rv-dsl rv-in">
        {(s.blocks || []).map((b, i) => <StatBlock key={b.id} b={b} i={i} surprise={s.surprise} />)}
      </ul>
      {onArticle ? (
        <button type="button" className="rv-textbtn rv-ds__more rv-in" onClick={() => onArticle("stats")}><BookOpen size={16} aria-hidden="true" /> {s.more}</button>
      ) : null}
    </div>
  );
}

// Story 8: the core traits. Five or six keywords, each with where it came from (the trait or the stat behind it) and
// one line of evidence. The first two are the hero pair. Marriage and kids traits are marked as kept off the card.
export function CoreTraitsScreen({ s }) {
  const core = s.core || [];
  return (
    <div className="rv-body rv-body--traits rv-body--core" tabIndex="0">
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
