import React from "react";
import { MirrorArch } from "../../art/index.js";
import { MIRROR } from "../../art/world.js";
import { archClip } from "./layout.js";

/**
 * The friend game's hero (DESIGN-DIRECTION 5.15): the owner's World Mirror, with the shard pattern seeded by the owner's
 * run, fogged over. `fog` runs from 1 (nothing guessed yet) to 0 (every level played), so the friend clears the glass
 * by playing. Names stay off this art; the friend screen carries its own "Do you really know {them}?" line.
 */
export function FriendMirrorHero({ ownerSeed, fog = 1, pronoun, size = 180 }) {
  const f = Math.max(0, Math.min(1, Number(fog)));
  const F = MIRROR.frame;
  const u = size / F.w;
  const box = { glassLeft: -F.x * u, glassTop: -F.y * u, glassW: MIRROR.w * u, glassH: MIRROR.h * u };
  const filled = Array.from({ length: 40 }, (_, i) => ({ chapter: 1 + (Math.floor(i / 6) % 7) }));
  return (
    <div className="rv-friendhero" aria-hidden="true" data-pronoun={pronoun || undefined} style={{ width: size, height: size * (F.h / F.w) }}>
      <span className="rv-friendhero__glow" />
      <MirrorArch seed={ownerSeed || "mirror"} filled={filled} mullion glow={0.7} size={size} />
      <span className="rv-friendhero__fog" style={{ clipPath: archClip(box), opacity: f * 0.94 }} />
    </div>
  );
}
