// Story 5, what Genii knows best (round 2, LAUNCH-SPEC 23 ruling 5): five or six findings, clearest first, each a
// confident line with a clarity gem as its cue. The gem is a cut crystal seen from above: the table, the crown ring
// and the girdle ring light up as the evidence behind the finding gets clearer (one ring, two, all three with a
// glint); a flex finding is a gem split in two colors. The clearest finding opens as a large crystal card. No numbers:
// the cue is the gem and a word.
import React, { useId } from "react";
import { StatGlyph } from "./StatGlyph.jsx";

const TAU = Math.PI * 2;
const pt = (r, a) => [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
const poly = (pts) => pts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(" ") + " Z";

// Octagonal brilliant: table (r 17), crown kites to r 33, girdle triangles to r 46.
const N = 8;
const at = (k) => (k / N) * TAU - Math.PI / 2 + Math.PI / N;
const TABLE = Array.from({ length: N }, (_, k) => pt(17, at(k)));
const CROWN = Array.from({ length: N }, (_, k) => poly([pt(17, at(k)), pt(33, at(k) + Math.PI / N), pt(17, at(k + 1)), pt(10, at(k) + Math.PI / N)]));
const GIRDLE = Array.from({ length: N }, (_, k) => [
  poly([pt(17, at(k)), pt(46, at(k)), pt(33, at(k) + Math.PI / N)]),
  poly([pt(33, at(k) + Math.PI / N), pt(46, at(k + 1)), pt(17, at(k + 1))]),
]).flat();
const OUTLINE = poly(Array.from({ length: N }, (_, k) => pt(46, at(k))));

export function ClarityGem({ level = 1, size = 40, flex = false, className, art = "clarity-gem" }) {
  const rid = useId().replace(/:/g, "");
  const lit = (ring) => flex || level >= ring;
  const u = (k) => `url(#${rid}-${k})`;
  return (
    <svg className={`rv-gem2 ${className || ""}`} data-art={art} data-level={flex ? "flex" : level} viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" overflow="visible">
      <defs>
        <linearGradient id={`${rid}-a`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--rv-gem-hi, #FFFFFF)" />
          <stop offset="0.45" stopColor="var(--rv-gem-a, #B3AAF0)" />
          <stop offset="1" stopColor="var(--rv-gem-b, #5A4ED6)" />
        </linearGradient>
        <linearGradient id={`${rid}-b`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rv-gem-c, #8EDBE6)" />
          <stop offset="0.6" stopColor="var(--rv-gem-a, #B3AAF0)" />
          <stop offset="1" stopColor="var(--rv-gem-hi, #FFFFFF)" />
        </linearGradient>
        <linearGradient id={`${rid}-f`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--rv-gem-frost, #FFFFFF)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--rv-gem-frost, #FFFFFF)" stopOpacity="0.04" />
        </linearGradient>
        <radialGradient id={`${rid}-g`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="var(--rv-gem-a, #B3AAF0)" stopOpacity="0.7" />
          <stop offset="1" stopColor="var(--rv-gem-a, #B3AAF0)" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`${rid}-half`}><rect x="50" y="-10" width="70" height="120" /></clipPath>
      </defs>
      {level >= 3 && !flex ? <circle cx="50" cy="50" r="62" fill={u("g")} /> : null}
      <g>
        {GIRDLE.map((d, i) => <path key={`g${i}`} d={d} fill={lit(3) ? u(i % 2 ? "b" : "a") : u("f")} opacity={lit(3) ? 0.92 - (i % 4) * 0.08 : 1} />)}
        {CROWN.map((d, i) => <path key={`c${i}`} d={d} fill={lit(2) ? u(i % 2 ? "a" : "b") : u("f")} opacity={lit(2) ? 0.96 - (i % 3) * 0.1 : 1} />)}
        <path d={poly(TABLE)} fill={u("a")} />
      </g>
      {flex ? (
        <g clipPath={`url(#${rid}-half)`}>
          <path d={OUTLINE} fill="var(--rv-gem-c, #8EDBE6)" opacity="0.55" style={{ mixBlendMode: "color" }} />
        </g>
      ) : null}
      <g fill="none" stroke="var(--rv-gem-edge, #FFFFFF)" strokeLinejoin="round">
        <path d={OUTLINE} strokeWidth="2.4" strokeOpacity={lit(3) ? 0.95 : 0.5} strokeDasharray={lit(3) ? undefined : "3 4"} />
        <path d={poly(TABLE)} strokeWidth="1.2" strokeOpacity="0.8" />
        {CROWN.map((d, i) => <path key={i} d={d} strokeWidth="0.8" strokeOpacity={lit(2) ? 0.55 : 0.28} />)}
      </g>
      {flex ? <line x1="50" y1="2" x2="50" y2="98" stroke="var(--rv-gem-edge, #FFFFFF)" strokeWidth="1.6" strokeOpacity="0.9" /> : null}
      {level >= 3 && !flex ? (
        <path className="rv-gem2__glint" d="M30 18 L32 26 L40 28 L32 30 L30 38 L28 30 L20 28 L28 26 Z" fill="var(--rv-gem-hi, #FFFFFF)" />
      ) : null}
    </svg>
  );
}

function Head({ f }) {
  return (
    <span className="rv-find__stat">
      <StatGlyph axis={f.key} size={f.top ? 16 : 14} />
      <span>{f.stat}</span>
    </span>
  );
}

// Round 3 (G6): the stat name and the end you lean to lead each finding (src/persona/stats.js), the lines sit on dark
// glass for contrast, and every row carries its signal word ("Strong", "Clear", "Some", "Both") beside the gem, so
// the gems never need a legend; tier words say how strong the signal is, never certainty.
export function KnowsScreen({ s }) {
  const [top, ...rest] = s.findings;
  return (
    <div className="rv-body rv-body--knows">
      <p className="rv-kicker rv-in">{s.kicker}</p>
      <h2 className="rv-title rv-in" data-focus tabIndex="-1">{s.title}</h2>
      <ol className="rv-finds">
        {top ? (
          <li className="rv-find rv-find--top" style={{ "--i": 0 }} data-level={top.kind === "flex" ? "flex" : top.level}>
            <span className="rv-find__gem"><ClarityGem level={top.level} flex={top.kind === "flex"} size={72} /></span>
            <span className="rv-find__head">
              <Head f={{ ...top, top: true }} />
              <strong className="rv-find__lead">{top.leadEnd || top.lead}</strong>
              <span className="rv-find__tier">{top.tier}</span>
            </span>
            <span className="rv-find__line">{top.line}</span>
            <span className="rv-find__sweep" aria-hidden="true" />
          </li>
        ) : null}
        {rest.map((f, i) => (
          <li className="rv-find" key={f.key} style={{ "--i": i + 1 }} data-level={f.kind === "flex" ? "flex" : f.level}>
            <span className="rv-find__gem"><ClarityGem level={f.level} flex={f.kind === "flex"} size={26} /></span>
            <span className="rv-find__head">
              <Head f={f} />
              <span className="rv-find__tag"><span className="sr-only">, </span>{f.tierShort || f.tier}</span>
            </span>
            <span className="rv-find__line"><b className="rv-find__end">{f.leadEnd || f.lead}.</b> {f.short || f.line}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
