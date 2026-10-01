// The Evidence Article's art (V2 pass, 2026-09-30): one small opal-glass object per section, set beside the type as
// spot art, and one quiet sky band on the cover. No banner photos. The set is generated into public/assets/article/
// and listed in its MANIFEST.json (docs/ARTICLE-ART-SET.md). Until a piece exists the page draws a code-made glass
// placeholder of the same size, so the layout never shifts when the real file lands.
import { asset } from "../../assets.js";

// The manifest is read at build time when it exists (an empty object otherwise), so a missing set never breaks a build.
const FOUND = import.meta.glob("/public/assets/article/MANIFEST.json", { eager: true, import: "default" });
const MANIFEST = Object.values(FOUND)[0] || null;

// Page name (what a section asks for) to the file stem in the set.
export const SPOT_STEMS = Object.freeze({
  "cover-band": "cover-band",
  divider: "divider",
  backdrop: "backdrop-tile",
  stats: "stats-crystal",
  traits: "traits-pebbles",
  secret: "insight-shard",
  "room-ch1": "room-phone",
  "room-ch2": "room-friends",
  "room-ch3": "room-love",
  "room-ch4": "room-money",
  "room-ch5": "room-work",
  "room-ch6": "room-home",
  "room-ch7": "room-play",
  "two-sides": "two-sides-orb",
  "open-book": "open-book",
  record: "record-quill",
  "heist-planner": "heist-planner",
  "heist-driver": "heist-driver",
  "heist-inside": "heist-inside",
  "heist-distraction": "heist-distraction",
  flags: "flags-pair",
  bets: "bets-chips",
  seed: "island-seed",
  closing: "closing-mirror",
});

// Every entry the manifest lists for a stem, as { file, w, h }, whatever shape the manifest takes (an array of files,
// or an object keyed by stem with a list of sizes).
function filesFor(stem) {
  if (!MANIFEST) return [];
  const out = [];
  const push = (f) => {
    if (!f || typeof f !== "object") return;
    const file = f.file || f.path || f.src || f.name;
    if (typeof file !== "string") return;
    const base = file.split("/").pop();
    if (!base.startsWith(`${stem}-`) && !base.startsWith(`${stem}.`)) return;
    const [sw, sh] = String(f.size || "").split("x").map(Number);
    const w = Number(f.width || f.w) || sw || Number((/-(\d+)\.\w+$/.exec(base) || [])[1]) || 0;
    const h = Number(f.height || f.h) || sh || w;
    out.push({ file: base, w, h });
  };
  const walk = (node) => {
    if (Array.isArray(node)) node.forEach((n) => (typeof n === "string" ? push({ file: n }) : n && (n.file || n.path || n.src) ? push(n) : walk(n)));
    else if (node && typeof node === "object") {
      if (node.file || node.path || node.src) push(node);
      else Object.values(node).forEach(walk);
    }
  };
  walk(MANIFEST);
  // WebP when the set has it, else whatever image format it ships; one file per width.
  const imgs = out.filter((f) => /\.(webp|avif|png|jpe?g)$/i.test(f.file));
  const webp = imgs.filter((f) => /\.webp$/i.test(f.file));
  const seen = new Set();
  return (webp.length ? webp : imgs).sort((a, b) => a.w - b.w).filter((f) => (seen.has(f.w) ? false : seen.add(f.w)));
}

// One piece of spot art: { src, srcSet, w, h } from the set, or null while it does not exist yet.
export function spot(name) {
  const stem = SPOT_STEMS[name];
  if (!stem) return null;
  const files = filesFor(stem);
  if (!files.length) return null;
  const best = files.find((f) => f.w >= 360) || files[files.length - 1];
  const at = (f) => asset(`article/${f.file}`);
  return {
    src: at(best),
    srcSet: files.length > 1 ? files.map((f) => `${at(f)} ${f.w}w`).join(", ") : undefined,
    w: best.w || 360,
    h: best.h || best.w || 360,
  };
}

export const HAS_ART = Boolean(MANIFEST);

// The room islet for a chapter (1 phone, 2 friends, 3 love, 4 money, 5 work, 6 home, 7 play).
export const roomArt = (chapter) => `room-ch${Number(chapter)}`;
