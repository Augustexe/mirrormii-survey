import React from "react";

// "It depends" and "What would flip you?" (5.7): the chosen tile stays on top in its selected style, the flip question
// under it, three preset flips as chips, Skip as a text button, and a way back.
export function Flip({ card, picked, locked, onFlip, onSkip, onBack }) {
  return (
    <section className="pc-flip" aria-labelledby={`flip-${card.id}`}>
      <p className="pc-flip__picked">{picked}</p>
      <h2 className="pc-flip__prompt" id={`flip-${card.id}`}>{card.flip.prompt}</h2>
      <div className="pc-flip__chips">
        {card.flip.options.map((text, f) => (
          <button type="button" key={f} className="pc-chip" disabled={locked} onClick={(e) => onFlip(f, e)}>{text}</button>
        ))}
      </div>
      <div className="pc-exits">
        <button type="button" className="pc-exit" disabled={locked} onClick={(e) => onSkip(e)}>Skip</button>
        <button type="button" className="pc-exit pc-exit--link" onClick={onBack}>Pick a different answer</button>
      </div>
    </section>
  );
}
