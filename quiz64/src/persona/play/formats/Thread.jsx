import React, { useLayoutEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";

// The avatar letter for a sender label ("Your parent" -> P, "Sam" -> S).
const initialOf = (from) => {
  const words = String(from || "").trim().split(/\s+/).filter(Boolean);
  const word = words.length > 1 && /^(your|my|the)$/i.test(words[0]) ? words[words.length - 1] : words[0] || "";
  return word.charAt(0).toUpperCase();
};

// Your reply (5.7): one chat window. Received bubbles sit on the left with the sender's avatar and arrive in sequence
// behind a typing indicator; your draft replies wait on the right, on the sent side, each with a send mark; tapping one
// sends it into the thread as your bubble with "Delivered".
export function Thread({ card, thread, texts, chosen, locked, onTap, kbd, still, from }) {
  const sentRef = useRef(null);
  useLayoutEffect(() => {
    // The chosen draft flies up into the thread as the outgoing bubble (FLIP from the chip's place).
    const bubble = sentRef.current;
    if (!bubble || still || !from || typeof bubble.animate !== "function") return;
    const r = bubble.getBoundingClientRect();
    const dx = from.left + from.width - (r.left + r.width);
    const dy = from.top - r.top;
    bubble.animate(
      [{ transform: `translate(${dx}px, ${dy}px) scale(0.96)`, opacity: 0.7 }, { transform: "translate(0, 0) scale(1)", opacity: 1 }],
      { duration: 220, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  }, [chosen, still, from]);
  return (
    <div className="pc-thread-panel">
      <ol className="pc-thread" data-part="persona-thread" aria-label="The messages">
        {thread.map((m, k) => {
          const you = m.from === "you";
          const first = k === 0 || thread[k - 1].from !== m.from;
          const last = k === thread.length - 1 || thread[k + 1].from !== m.from;
          return (
            <li key={k} className={`pc-bubble${you ? " pc-bubble--you" : " pc-bubble--in"}${last ? " is-last" : ""}`} style={{ "--k": k }}>
              {!you ? <span className="pc-bubble__avatar" aria-hidden="true">{last ? initialOf(m.from) : ""}</span> : null}
              <span className="pc-bubble__col">
                {!you && first ? <span className="pc-bubble__from">{m.from}</span> : null}
                <span className="pc-bubble__body">
                  {k > 0 ? <span className="pc-typing" aria-hidden="true"><i /><i /><i /></span> : null}
                  <span className="pc-bubble__text">{m.text}</span>
                </span>
              </span>
            </li>
          );
        })}
        {chosen !== null && Number.isInteger(chosen) ? (
          <li className="pc-bubble pc-bubble--sent" ref={sentRef}>
            <span className="pc-bubble__col">
              <span className="pc-bubble__body"><span className="pc-bubble__text">{texts[chosen]}</span></span>
              <span className="pc-bubble__delivered">Delivered</span>
            </span>
          </li>
        ) : null}
      </ol>
      <div className="pc-drafts" role="group" aria-label="Your reply">
        {texts.map((text, i) => (
          <button
            type="button"
            key={`${card.id}-${i}`}
            className={`pc-draft${chosen === i ? " is-sent" : ""}`}
            data-index={i}
            disabled={locked}
            onClick={(e) => onTap(i, e)}
            style={{ "--i": i }}
          >
            {kbd && i < 9 ? <kbd className="pc-kbd" aria-hidden="true">{i + 1}</kbd> : null}
            <span className="pc-draft__text">{text}</span>
            <span className="pc-draft__send" aria-hidden="true"><SendHorizontal size={14} strokeWidth={2.25} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
