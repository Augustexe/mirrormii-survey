import React from "react";
import { Menu } from "lucide-react";
import { asset } from "../../assets.js";

/**
 * Global header (DESIGN-DIRECTION 5.0). Phone: 52 px glass flush to the top, wordmark left, the shard rail in the
 * center during cards and the finale, a 44 px menu button right. Desktop: 64 px, plus "Chapter map" and
 * "Save and leave" text buttons. No Genii chip, no saved-answer count.
 * rail: the progress node (package B's shard rail) or null. Package B may also portal into #mm-header-center.
 * hidden: true on the result stories, which carry their own top bar.
 */
export function PersonaHeader({ onHome, onMore, onMap = null, onSave = null, rail = null, hidden = false }) {
  if (hidden) return null;
  return (
    <header className="mm-header mm-glass-bar">
      <div className="mm-header__inner">
        <button type="button" className="mm-header__brand" onClick={onHome} aria-label="MirrorMii, back to the start">
          <img src={asset("mirrormii-wordmark.svg")} width="265" height="43" alt="MirrorMii" />
        </button>
        <div className="mm-header__center" id="mm-header-center">{rail}</div>
        <nav className="mm-header__nav" aria-label="Game">
          {onMap ? <button type="button" className="mm-header__link" onClick={onMap}>Chapter map</button> : null}
          {onSave ? <button type="button" className="mm-header__link" onClick={onSave}>Save and leave</button> : null}
          <button type="button" className="mm-icon-btn mm-header__menu" aria-label="Open the menu" aria-haspopup="dialog" onClick={onMore}>
            <Menu size={20} strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </header>
  );
}
