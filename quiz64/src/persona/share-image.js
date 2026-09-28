// A local PNG of the share card: type name, tag names with their heart lines, and the invite. Nothing else is drawn.
function wrap(ctx, text, width) {
  const lines = [];
  let line = "";
  for (const word of String(text).split(" ")) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export async function downloadShareImage(share) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export unavailable");
  const bg = ctx.createLinearGradient(0, 0, 1080, 1350);
  bg.addColorStop(0, "#fdfdff");
  bg.addColorStop(1, "#e9e1fb");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1080, 1350);
  ctx.strokeStyle = "#c9b7e6";
  ctx.lineWidth = 2;
  ctx.strokeRect(56, 56, 968, 1238);
  ctx.fillStyle = "#6a4bb8";
  ctx.font = "700 26px sans-serif";
  ctx.fillText("GENII · MIRRORMII", 100, 135);
  ctx.fillStyle = "#1c1530";
  ctx.font = "800 70px sans-serif";
  let y = 250;
  for (const line of wrap(ctx, share.typeName, 880)) { ctx.fillText(line, 100, y); y += 80; }
  y += 30;
  for (const tag of share.tags.slice(0, 5)) {
    ctx.fillStyle = "#3a2a6e";
    ctx.font = "700 36px sans-serif";
    ctx.fillText(tag.name, 100, y);
    y += 46;
    ctx.fillStyle = "#6d528c";
    ctx.font = "italic 28px sans-serif";
    for (const line of wrap(ctx, tag.heart, 880)) { ctx.fillText(line, 100, y); y += 36; }
    y += 26;
  }
  ctx.fillStyle = "#7450c7";
  ctx.fillRect(100, 1150, 520, 84);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 34px sans-serif";
  ctx.fillText(share.invite, 130, 1204);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Image export unavailable");
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "my-genii-type.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
