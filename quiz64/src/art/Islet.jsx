// A-03: the chapter islands (LAUNCH-SPEC 25 item 1). Each chapter is one small floating islet of Genii's island, a
// render made from the GDD v0.2 (white pearl marble, lavender wisteria, still pools): 1 your phone (a signal tower),
// 2 friends (a picnic terrace), 3 love (a gazebo), 4 money (a vault with crystal fragments), 5 work (a notice board and
// a lookout), 6 family (a cottage), 7 play (a plaza with a chessboard and dice). "extras" and "finale" have no islet of
// their own: they show the whole island (hero render) in an oval vignette. Decorative: aria-hidden, alt "".
// Images load lazily unless `eager`; the smallest file that covers `size` at 2x is picked.
import { ISLAND, islet } from "./world.js";

export const ISLAND_NAMES = {
  ch1: "Signal Tower",
  ch2: "Picnic Terrace",
  ch3: "Garden Gazebo",
  ch4: "Crystal Vault",
  ch5: "Lookout Board",
  ch6: "Home Cottage",
  ch7: "Game Plaza",
  extras: "Genii's Island",
  finale: "The World Mirror",
};

export function Islet({ chapter, size = 160, className = "", eager = false, ...rest }) {
  const it = islet(chapter);
  const common = {
    alt: "",
    "aria-hidden": "true",
    decoding: "async",
    loading: eager ? "eager" : "lazy",
    width: Math.round(size),
    height: Math.round(size),
    draggable: false,
    "data-art": "islet",
    "data-chapter": String(chapter),
    ...rest,
  };
  if (it) return <img {...common} className={className || undefined} src={it.pick(size)} />;
  // The whole island in an oval vignette, cropped around the World Mirror and the terraces under it.
  return (
    <img {...common} className={className || undefined} src={ISLAND.hero.src}
      style={{ objectFit: "cover", objectPosition: "50% 46%", WebkitMaskImage: "radial-gradient(closest-side, black 62%, transparent)", maskImage: "radial-gradient(closest-side, black 62%, transparent)" }} />
  );
}
