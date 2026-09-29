// A-14 and A-19: writes the texture files from the same sources src/art/textures.js uses at runtime.
//   node scripts/make-textures.mjs
// Output (src/art/textures/): frost.svg, foxing.svg, grain.svg, and grain.png (160 px, for canvas code
// such as the share image, which cannot tile an SVG filter; written directly as seeded grayscale noise).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";
import { foxingSvg, frostSvg, grainSvg } from "../src/art/textures.js";
import { mulberry32 } from "../src/art/geometry.js";

// Seeded 8-bit grayscale noise PNG (about 26 KB at 160 px; well under the 60 KB raster budget).
function grainPng(size, seed = "grain") {
  const rand = mulberry32(seed);
  const raw = Buffer.alloc((size + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size + 1)] = 0;
    for (let x = 0; x < size; x++) raw[y * (size + 1) + 1 + x] = Math.round(64 + ((rand() + rand() + rand()) / 3) * 128);
  }
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 255] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 0; // grayscale
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "src/art/textures");
fs.mkdirSync(out, { recursive: true });

const files = { "frost.svg": frostSvg(), "foxing.svg": foxingSvg(), "grain.svg": grainSvg() };
for (const [name, svg] of Object.entries(files)) fs.writeFileSync(path.join(out, name), `${svg}\n`);
fs.writeFileSync(path.join(out, "grain.png"), grainPng(160));
console.log(`wrote ${Object.keys(files).length + 1} files to ${path.relative(root, out)}`);
