// A-03: chapter island scenes. chapter: 1..7, "extras", "finale". variant: scene (320 box),
// ambient (the scene as a flat silhouette at 8%), vignette (the hero object alone, for 48 px wells).
import { useId } from "react";
import { chapterKey } from "../palette.js";
import { ISLAND_VIEWBOX } from "../shapes.js";
import { Svg, safeId } from "../Svg.jsx";
import ch1 from "./ch1.jsx";
import ch2 from "./ch2.jsx";
import ch3 from "./ch3.jsx";
import ch4 from "./ch4.jsx";
import ch5 from "./ch5.jsx";
import ch6 from "./ch6.jsx";
import ch7 from "./ch7.jsx";
import extras from "./extras.jsx";
import finale from "./finale.jsx";
import { IslandArt, IslandDefs, paints } from "./frame.jsx";

export const ISLAND_SCENES = { ch1, ch2, ch3, ch4, ch5, ch6, ch7, extras, finale };
export const ISLAND_NAMES = {
  ch1: "Notification Isle",
  ch2: "Group Chat Cove",
  ch3: "Two-Cup Terrace",
  ch4: "Treat Market",
  ch5: "Ambition Ridge",
  ch6: "Home Harbor",
  ch7: "Rulebook Arcade",
  extras: "Genii's Notebook",
  finale: "The Mirror",
};

export const sceneFor = (chapter) => ISLAND_SCENES[chapterKey(chapter)];

export function IslandScene({ chapter, variant = "scene", size, className, ...rest }) {
  const rid = safeId(useId(), `isl-${chapterKey(chapter)}-${variant}`);
  const scene = sceneFor(chapter);
  const P = paints(chapter, rid);
  const vignette = variant === "vignette";
  const ambient = variant === "ambient";
  const px = size ?? (vignette ? 48 : 320);
  const common = { width: px, height: px, className, "data-art": "island", "data-variant": variant, "data-chapter": String(chapter), ...rest };
  if (vignette) {
    const [x, y, w] = scene.box.split(" ").map(Number);
    return (
      <Svg viewBox={scene.box} {...common}>
        <IslandDefs P={P} />
        <circle cx={x + w / 2} cy={y + w / 2} r={w / 2} fill={`url(#${rid}-a)`} />
        {scene.hero(P)}
      </Svg>
    );
  }
  return (
    <Svg viewBox={ISLAND_VIEWBOX} {...common} opacity={ambient ? 0.08 : undefined}>
      <IslandDefs P={P} ambient={ambient} />
      {ambient ? (
        <g filter={`url(#${rid}-s)`}>
          <IslandArt P={P} scene={scene} bare />
        </g>
      ) : (
        <IslandArt P={P} scene={scene} />
      )}
    </Svg>
  );
}
