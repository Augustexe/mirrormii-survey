// The web build strips card fingerprints (kit-strip.mjs) but keeps the scene device, so every absurd card draws
// the same art in the shipped app as in the full kit.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { stripAuthoring } from "../kit-strip.mjs";
import { deviceFor } from "../src/art/devices.js";

const kit = JSON.parse(fs.readFileSync(new URL("../../research/persona-quiz-v2/final/cards.json", import.meta.url), "utf8"));
const cards = [];
const walk = (v) => {
  if (Array.isArray(v)) v.forEach(walk);
  else if (v && typeof v === "object") {
    if (typeof v.id === "string" && typeof v.prompt === "string") cards.push(v);
    else Object.values(v).forEach(walk);
  }
};
walk(kit);

test("stripped absurd cards resolve the same device art as the full kit", () => {
  const absurd = cards.filter((c) => c.world === "absurd");
  assert.ok(absurd.length > 0);
  for (const card of absurd) assert.equal(deviceFor(stripAuthoring(card)), deviceFor(card), card.id);
});
