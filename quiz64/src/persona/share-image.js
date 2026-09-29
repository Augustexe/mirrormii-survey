// Local PNGs of the story screens, drawn on a canvas in this browser (nothing is uploaded). Each screen passes a
// plain print spec (stories/story-data.js printFor): kicker, title, name pairs, lines, items, the map, a badge and a
// button. Only what the screen itself shows is drawn.
const W = 1080;
const H = 1920;
const PAD = 96;
const FONT = "Manrope, system-ui, -apple-system, 'Segoe UI', sans-serif";

const TONES = {
  iris: { from: "#8a77e6", to: "#332089", ink: "#ffffff", soft: "rgba(255,255,255,0.82)", accent: "#ffffff", track: "rgba(255,255,255,0.3)", card: "rgba(255,255,255,0.14)" },
  night: { from: "#241654", to: "#0f0a2e", ink: "#ffffff", soft: "rgba(255,255,255,0.8)", accent: "#ffb3c8", track: "rgba(255,255,255,0.26)", card: "rgba(255,255,255,0.1)" },
  dawn: { from: "#fdfdff", to: "#e4dbff", ink: "#1c1530", soft: "#5a4a86", accent: "#6a4bb8", track: "rgba(114,96,210,0.22)", card: "rgba(255,255,255,0.7)" },
  pearl: { from: "#fdfdff", to: "#d9e5ff", ink: "#12193a", soft: "#4a5288", accent: "#5958b1", track: "rgba(89,88,177,0.22)", card: "rgba(255,255,255,0.7)" },
  peach: { from: "#fffaf8", to: "#f6d6ca", ink: "#2a1633", soft: "#6d4c6a", accent: "#7a4bb0", track: "rgba(122,75,176,0.2)", card: "rgba(255,255,255,0.66)" },
};

function wrap(ctx, text, width) {
  const lines = [];
  let line = "";
  for (const word of String(text || "").split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, { size, weight = 600, color, width = W - PAD * 2, lh = 1.28, italic = false }) {
  ctx.font = `${italic ? "italic " : ""}${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  let yy = y;
  for (const line of wrap(ctx, value, width)) { ctx.fillText(line, x, yy); yy += size * lh; }
  return yy;
}

// The content block, from y0 down. Returns where it ended, so drawStory can center it.
function drawContent(ctx, spec, t, y0) {
  let y = y0;
  if (spec.badge) {
    ctx.font = `800 26px ${FONT}`;
    const bw = ctx.measureText(spec.badge.toUpperCase()).width + 56;
    ctx.fillStyle = t.card;
    roundRect(ctx, PAD, y - 44, bw, 64, 32);
    ctx.fill();
    text(ctx, spec.badge.toUpperCase(), PAD + 28, y, { size: 26, weight: 800, color: t.ink });
    y += 90;
  }
  if (spec.kicker) y = text(ctx, spec.kicker.toUpperCase(), PAD, y, { size: 30, weight: 800, color: t.accent }) + 24;
  if (spec.title) y = text(ctx, spec.title, PAD, y + 50, { size: 86, weight: 800, color: t.ink, lh: 1.08 }) + 30;

  if (spec.pairs && spec.pairs.length) {
    const colW = (W - PAD * 2 - 40) / 2;
    let bottom = y;
    spec.pairs.forEach((p, i) => {
      const x = PAD + i * (colW + 40);
      ctx.fillStyle = t.card;
      roundRect(ctx, x, y + 10, colW, 360, 40);
      ctx.fill();
      text(ctx, p.label, x + 36, y + 80, { size: 28, weight: 700, color: t.soft, width: colW - 72 });
      bottom = Math.max(bottom, text(ctx, p.name, x + 36, y + 170, { size: 60, weight: 800, color: t.ink, width: colW - 72, lh: 1.08 }));
    });
    y = Math.max(y + 400, bottom + 40);
  }

  if (spec.map) {
    for (const group of spec.map) {
      y = text(ctx, group.label.toUpperCase(), PAD, y + 40, { size: 26, weight: 800, color: t.accent }) + 10;
      for (const row of group.rows) {
        ctx.font = `800 32px ${FONT}`;
        ctx.fillStyle = row.side === "left" || row.flex ? t.ink : t.soft;
        ctx.fillText(row.left, PAD, y + 30);
        const rw = ctx.measureText(row.right).width;
        ctx.fillStyle = row.side === "right" || row.flex ? t.ink : t.soft;
        ctx.fillText(row.right, W - PAD - rw, y + 30);
        ctx.fillStyle = t.track;
        roundRect(ctx, PAD, y + 56, W - PAD * 2, 14, 7);
        ctx.fill();
        const cx = PAD + ((W - PAD * 2) * row.pos) / 100;
        ctx.beginPath();
        ctx.arc(cx, y + 63, row.unfinished ? 14 : 22, 0, Math.PI * 2);
        ctx.fillStyle = t.accent;
        ctx.globalAlpha = row.unfinished ? 0.45 : 1;
        ctx.fill();
        ctx.globalAlpha = 1;
        y += 118;
      }
    }
    y += 20;
  }

  if (spec.items && spec.items.length) {
    const small = spec.items.length > 3;
    for (const it of spec.items) {
      if (y > H - 300) break;
      y = text(ctx, it.name, PAD, y + 40, { size: small ? 44 : 50, weight: 800, color: t.ink }) + 2;
      y = text(ctx, it.line, PAD, y + 4, { size: small ? 32 : 36, weight: 500, color: t.soft, italic: spec.button !== undefined }) + 18;
    }
  }

  for (const line of spec.lines || []) {
    if (!line || y > H - 260) continue;
    y = text(ctx, line, PAD, y + 50, { size: spec.big ? 70 : 48, weight: spec.big ? 800 : 700, color: t.ink, lh: spec.big ? 1.14 : 1.24 }) + 16;
  }
  return y;
}

export function drawStory(ctx, spec) {
  const t = TONES[spec.tone] || TONES.dawn;
  const bg = ctx.createLinearGradient(0, 0, W * 0.4, H);
  bg.addColorStop(0, t.from);
  bg.addColorStop(1, t.to);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  text(ctx, "GENII · MIRRORMII", PAD, 150, { size: 28, weight: 800, color: t.soft });

  // Measure on a scratch canvas, then center the block between the brand line and the button (or the bottom).
  let top = 330;
  const probe = typeof document !== "undefined" ? document.createElement("canvas") : null;
  const pctx = probe && (probe.width = W, probe.height = H, probe.getContext("2d"));
  if (pctx) {
    const height = drawContent(pctx, spec, t, 0);
    const room = (spec.button ? H - 330 : H - 140) - 260;
    top = 260 + Math.max(70, (room - height) / 2);
  }
  drawContent(ctx, spec, t, top);

  if (spec.button) {
    ctx.fillStyle = t.accent;
    roundRect(ctx, PAD, H - 290, W - PAD * 2, 120, 60);
    ctx.fill();
    ctx.font = `800 44px ${FONT}`;
    const bw = ctx.measureText(spec.button).width;
    ctx.fillStyle = spec.tone === "iris" || spec.tone === "night" ? "#2a1b6b" : "#ffffff";
    ctx.fillText(spec.button, (W - bw) / 2, H - 214);
  }
}

async function saveCanvas(canvas, filename) {
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Image export unavailable");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// One story screen as a 1080 x 1920 PNG.
export async function downloadStoryImage(spec, filename = "my-genii-read.png") {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export unavailable");
  if (document.fonts && document.fonts.ready) { try { await document.fonts.ready; } catch { /* system font is fine */ } }
  drawStory(ctx, spec);
  await saveCanvas(canvas, filename);
}

// The share card: both archetype names, trait names with their heart lines, the invite. Nothing else is drawn.
export function downloadShareImage(share) {
  return downloadStoryImage({ tone: "dawn", kicker: "Genii says I'm", pairs: share.names, items: share.tags.map((t) => ({ name: t.name, line: t.heart })), button: share.invite }, "my-genii-card.png");
}
