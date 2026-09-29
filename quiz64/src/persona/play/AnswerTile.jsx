import React from "react";
import { Check } from "lucide-react";
import { shardFor, SHARD_VIEWBOX } from "../../art/shapes.js";

// The shard glyph at the tile's left (5.6): violet-300, violet on hover, white on select.
export function ShardMark({ index = 0, className = "pc-tile__shard" }) {
  return (
    <svg className={className} viewBox={SHARD_VIEWBOX} width="10" height="15" aria-hidden="true" focusable="false">
      <path d={shardFor(index)} fill="currentColor" />
    </svg>
  );
}

/**
 * One answer tile (5.6): full width, no letter tokens, shard glyph at left, check at right when selected.
 * variant adds the format's hook (thought, quote, bead, role, half, etched). `lead` replaces the shard glyph
 * (a bead, a role badge, a rank badge); `kbd` is the desktop key hint.
 */
export function AnswerTile({ index = 0, selected = false, disabled = false, variant = "plain", lead = null, kbd = null, onClick, label, className = "", children, pressed, ...rest }) {
  return (
    <button
      type="button"
      className={`pc-tile pc-tile--${variant}${selected ? " is-selected" : ""}${className ? ` ${className}` : ""}`}
      data-index={index}
      aria-pressed={pressed}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {variant === "thought" ? <span className="pc-tile__thought" aria-hidden="true"><i /><i /></span> : null}
      <span className="pc-tile__lead" aria-hidden="true">{lead || <ShardMark index={index} />}</span>
      <span className="pc-tile__text">{children}</span>
      {kbd ? <kbd className="pc-kbd" aria-hidden="true">{kbd}</kbd> : null}
      <Check className="pc-tile__check" size={18} strokeWidth={2.5} aria-hidden="true" />
      <span className="pc-tile__fx" aria-hidden="true" />
    </button>
  );
}
