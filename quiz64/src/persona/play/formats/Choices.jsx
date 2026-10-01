import React from "react";
import { EmotionBead } from "../../../art/index.js";
import { AnswerTile } from "../AnswerTile.jsx";
import { parseRole } from "../answer-model.js";

// Single-choice formats (5.7): scenario, real, bet, others, eyes, role, feeling and sealed share one list; each
// gives the tiles its own hook. Props from PersonaCard: texts (option text per voice), isChosen(i), locked (a
// choice is on its way), onTap(i, event), kbd (show key hints).

const Badge = () => (
  <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false" className="pc-role__badge">
    <path d="M7 1.5h6v4.2a3 3 0 0 1-6 0z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <rect x="3" y="7.5" width="14" height="11" rx="3" fill="currentColor" opacity="0.18" stroke="currentColor" strokeWidth="1.6" />
    <path d="M6.5 13h7M6.5 15.8h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

const Quote = () => <span className="pc-quote__mark" aria-hidden="true">{"“"}</span>;

export function ChoiceList({ card, texts, isChosen, locked, onTap, kbd, variant = "plain", layout = "list", label = "Choose one answer", emotions = null }) {
  return (
    <div className={`pc-answers pc-answers--${layout}`} role="group" aria-label={label} data-count={texts.length}>
      {texts.map((text, i) => {
        const on = isChosen(i);
        let lead = null;
        let body = text;
        let tileVariant = variant;
        if (variant === "bead") lead = <EmotionBead emotion={emotions ? emotions[i] : null} size={28} className="pc-bead" />;
        if (variant === "quote") lead = <Quote />;
        if (variant === "role") {
          const role = parseRole(text);
          lead = <Badge />;
          if (role) body = <><span className="pc-role__title">{role.title}.</span> <span className="pc-role__line">{role.line}</span></>;
          else tileVariant = "plain";
        }
        return (
          <AnswerTile
            key={`${card.id}-${i}`}
            index={i}
            variant={tileVariant}
            lead={lead}
            selected={on}
            disabled={locked && !on}
            kbd={kbd && i < 9 ? String(i + 1) : null}
            onClick={(e) => onTap(i, e)}
            style={{ "--i": i }}
            data-emotion={emotions ? emotions[i] || undefined : undefined}
          >
            {body}
          </AnswerTile>
        );
      })}
    </div>
  );
}

// Genii's bet: two-answer legacy bets sit side by side; 3 to 5 answers are standard tiles.
export function BetChoices(props) {
  return <ChoiceList {...props} layout={props.texts.length === 2 ? "split" : "list"} label="Your answer to Genii's bet" />;
}

export function FeelingChoices({ card, ...props }) {
  return <ChoiceList card={card} {...props} variant="bead" layout="beads" emotions={card.options.map((o) => o.emotion || null)} label="Your first feeling" />;
}

export function formatVariant(type) {
  if (type === "others") return "thought";
  if (type === "eyes") return "quote";
  if (type === "role") return "role";
  if (type === "sealed") return "sealed";
  return "plain";
}
