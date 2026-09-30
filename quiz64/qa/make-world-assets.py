"""Build the round 3 world assets for quiz64/public/assets/world/ from Jerry's approved library files.
Originals are read only; outputs are cropped, cut out and compressed WebP (plus AVIF for the large island)."""
import os
from collections import deque
from PIL import Image, ImageFilter, ImageChops
import numpy as np

LIB = "/Users/jerryzhang/Workspace-Draft/assets/Genomii AI.library/images"
SCENE = "/Users/jerryzhang/Workspace-Draft/assets/production-media/brand-new-main-video-shot/scene 1"
OUT = "/Users/jerryzhang/Workspace-Draft/products/survey/quiz64/public/assets/world"
os.makedirs(OUT, exist_ok=True)


def save(im, name, q=78, avif=False):
    p = os.path.join(OUT, name + ".webp")
    im.save(p, "WEBP", quality=q, method=6, alpha_quality=85)
    out = [p]
    if avif:
        pa = os.path.join(OUT, name + ".avif")
        im.save(pa, "AVIF", quality=max(40, q - 22))
        out.append(pa)
    for f in out:
        print(f"{os.path.basename(f):32s} {im.size} {os.path.getsize(f) // 1024} KB")


# 1. The island: the MirrorMii World diorama, cropped past the left UI pill, with the two garbled sign faces blanked.
isl = Image.open(f"{LIB}/MSHA0GYPDP5PS.info/composite-world-map.png").convert("RGBA")
a = np.array(isl).astype(np.float32)
for (x0, y0, x1, y1) in [(1486, 882, 1678, 968), (1810, 836, 2032, 958)]:
    reg = a[y0:y1, x0:x1, :3]
    lum = reg.mean(axis=2)
    dark = lum < 205
    dm = Image.fromarray((dark * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    dark = np.array(dm) > 0
    for r in range(reg.shape[0]):
        row = reg[r]
        bright = row[~dark[r]]
        col = np.median(bright, axis=0) if len(bright) else np.array([236, 236, 240])
        row[dark[r]] = col
    a[y0:y1, x0:x1, :3] = reg
    patch = Image.fromarray(a[y0:y1, x0:x1].astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
    a[y0:y1, x0:x1] = np.array(patch).astype(np.float32)
isl = Image.fromarray(a.astype(np.uint8), ).crop((880, 120, 2980, 1136))
bbox = isl.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
isl = isl.crop(bbox)
print("island crop", isl.size)
for w in (720, 1440):
    save(isl.resize((w, round(isl.height * w / isl.width)), Image.LANCZOS), f"island-{w}", q=74, avif=(w == 1440))

# 2. Genii: the CGI glass render, cut from its white studio backdrop (flood fill from the border, so the white eyes
# stay), edges un-premultiplied from white, the floor reflection faded out under the body.
g = Image.open(f"{LIB}/MSFUZVKQOL0LC.info/genii-v2-screenshot-02.png").convert("RGB")
g = g.crop((420, 300, 1740, 1560))
G = np.array(g).astype(np.float32)
dist = (255 - G).max(axis=2)  # 0 on pure white
H, W = dist.shape
bg = np.zeros((H, W), bool)
thr = 26
q = deque([(0, x) for x in range(W)] + [(H - 1, x) for x in range(W)] + [(y, 0) for y in range(H)] + [(y, W - 1) for y in range(H)])
while q:
    y, x = q.popleft()
    if bg[y, x] or dist[y, x] >= thr:
        continue
    bg[y, x] = True
    if y > 0: q.append((y - 1, x))
    if y < H - 1: q.append((y + 1, x))
    if x > 0: q.append((y, x - 1))
    if x < W - 1: q.append((y, x + 1))
obj = Image.fromarray((~bg * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(2))
alpha = np.array(obj).astype(np.float32) / 255
soft = np.clip(dist / 60, 0, 1)
alpha = np.maximum(alpha, soft * (np.array(Image.fromarray((~bg * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(9))) > 0))
# The contact line sits near y=1215 in this crop; keep a short, fading reflection under it.
ys = np.arange(H)[:, None]
fade = np.clip(1 - (ys - 1150) / 50, 0, 1)
alpha = alpha * fade
a3 = np.clip(alpha, 1e-3, 1)[..., None]
rgb = np.clip((G - 255 * (1 - a3)) / a3, 0, 255)
out = np.dstack([rgb, alpha * 255]).astype(np.uint8)
gi = Image.fromarray(out)
gi = gi.crop(gi.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox())
print("genii crop", gi.size)
for w in (240, 480):
    save(gi.resize((w, round(gi.height * w / gi.width)), Image.LANCZOS), f"genii-{w}", q=82)

# 3. The mirror world: the airy white-lavender city with floating islands (world style key, left panel), cut to the
# arch's 100 x 160 proportion; it is what the glass shows behind the fog and the shards.
k = Image.open(f"{SCENE}/01-@REF-01-world-style-material-key.png").convert("RGB")
panel = k.crop((20, 24, 546, 866))  # 526 x 842 = 0.625
print("mirror world", panel.size)
save(panel.resize((320, 512), Image.LANCZOS), "mirror-world-320", q=72)
save(panel, "mirror-world-526", q=74)

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT) if f.endswith(".webp"))
print("webp total", total // 1024, "KB")
