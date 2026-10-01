// Genii blind test scorer. Deterministic evidence parsing, no model judgment.
//   node score.mjs profile answers.json          -> profile.json
//   node score.mjs freeze                         -> sealed-predictions.json + sha256 (show it BEFORE the sealed cards)
//   node score.mjs check sealed-answers.json      -> sealed-results.json
// answers.json: { "O1": 2, "S01": 0, "R04": "skip", ..., "_ms": { "S01": 4100 } }  (values are option indexes)
import fs from "node:fs";
import crypto from "node:crypto";

const kit = JSON.parse(fs.readFileSync(new URL("./cards.json", import.meta.url)));
const byId = Object.fromEntries(kit.cards.map((c) => [c.id, c]));
const [cmd, file] = process.argv.slice(2);
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const write = (p, o) => fs.writeFileSync(p, JSON.stringify(o, null, 2));
const median = (xs) => { const s = [...xs].sort((a, b) => a - b); const m = s.length >> 1; return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : null; };

function profile(ans) {
  const tags = {};
  const emotions = [];
  const signals = {};
  const circumstances = [];
  const ms = ans._ms || {};
  const med = median(Object.values(ms).filter((x) => typeof x === "number"));
  for (const c of kit.cards) {
    if (c.type === "sealed") continue;
    const v = ans[c.id];
    if (typeof v !== "number") continue;
    const opt = c.options[v];
    if (!opt) throw new Error(`${c.id}: no option ${v}`);
    if (opt.emotion && opt.emotion !== "none") emotions.push({ emotion: opt.emotion, card: c.id, answer: opt.t });
    if (opt.signal) signals[opt.signal] = (signals[opt.signal] || 0) + 1;
    if (opt.circumstance) circumstances.push({ card: c.id, circumstance: opt.circumstance });
    if (!c.tag || typeof opt.level !== "number") continue;
    const t = (tags[c.tag] ||= { stance: [], behavior: [] });
    const src = { card: c.id, type: c.type, level: opt.level, weight: kit.weights[c.type], answer: c.type === "hot_take" ? (opt.level < 0 ? c.a : opt.level > 0 ? c.b : "Both / depends") : opt.t, caution: opt.caution || null, paused: !!(med && ms[c.id] > 2 * med && ms[c.id] > 6000) };
    (c.type === "hot_take" ? t.stance : t.behavior).push(src);
  }
  const out = {};
  for (const [id, t] of Object.entries(tags)) {
    const all = [...t.behavior, ...t.stance];
    const wmean = (xs) => { const w = xs.reduce((s, x) => s + x.weight, 0); return w ? xs.reduce((s, x) => s + x.weight * x.level, 0) / w : null; };
    const behavior = wmean(t.behavior);
    const stance = t.stance.length ? t.stance[0].level : null;
    const mean = wmean(all);
    const split = stance !== null && stance !== 0 && behavior !== null && Math.abs(behavior) >= 0.5 && Math.sign(stance) !== Math.sign(behavior);
    const lead = behavior !== null ? behavior : mean;
    const agree = all.filter((x) => x.level !== 0 && Math.sign(x.level) === Math.sign(lead)).length;
    let strength;
    if (lead === null) strength = "unknown";
    else if (split) strength = "split";
    else if (Math.abs(lead) < 0.5) strength = "depends";
    else if (all.length === 1) strength = "early signal";
    else if (Math.abs(lead) >= 1.25 && agree >= 2) strength = "strong";
    else strength = "leaning";
    const pole = lead === null || Math.abs(lead) < 0.5 ? null : lead < 0 ? "A" : "B";
    out[id] = {
      label: pole ? kit.tags[id][pole] : null, pole, strength,
      behaviorLevel: behavior === null ? null : +behavior.toFixed(2),
      stanceLevel: stance, stanceSaid: stance === null ? null : stance < 0 ? kit.tags[id].A : stance > 0 ? kit.tags[id].B : "Both / depends",
      sources: all.length, evidence: all,
    };
  }
  const RANK = { strong: 0, split: 1, leaning: 2, "early signal": 3 };
  const ranked = Object.entries(out).filter(([, t]) => t.pole).sort((a, b) => RANK[a[1].strength] - RANK[b[1].strength] || b[1].sources - a[1].sources || Math.abs(b[1].behaviorLevel ?? 0) - Math.abs(a[1].behaviorLevel ?? 0));
  const emoCount = emotions.reduce((m, e) => ((m[e.emotion] = (m[e.emotion] || 0) + 1), m), {});
  return {
    version: kit.version,
    opening: { age: kit.opening[0].options[ans.O1] ?? null, closest: kit.opening[1].options[ans.O2] ?? null },
    strongest: ranked.slice(0, 6).map(([id, t]) => ({ tag: id, label: t.label, strength: t.strength })),
    splits: Object.entries(out).filter(([, t]) => t.strength === "split").map(([id, t]) => ({ tag: id, believes: t.stanceSaid, did: t.behaviorLevel < 0 ? kit.tags[id].A : kit.tags[id].B })),
    emotions: Object.entries(emoCount).sort((a, b) => b[1] - a[1]).map(([emotion, n]) => ({ emotion, times: n, from: emotions.filter((e) => e.emotion === emotion).map((e) => `${e.card}: ${e.answer}`) })),
    signals, circumstances, tags: out,
    coverage: { tags: Object.keys(out).length, withPole: ranked.length, strong: Object.values(out).filter((t) => t.strength === "strong").length },
  };
}

function freeze(prof) {
  const preds = kit.cards.filter((c) => c.type === "sealed").map((c) => {
    const t = prof.tags[c.tag];
    const lead = t ? (t.behaviorLevel ?? t.stanceLevel) : null;
    if (!t || lead === null || ["unknown", "depends", "split"].includes(t.strength)) return { id: c.id, tag: c.tag, abstain: true, why: t ? t.strength : "no evidence" };
    let best = 0, bd = 9;
    c.options.forEach((o, i) => { const d = Math.abs(o.level - lead); if (d < bd) { bd = d; best = i; } });
    return { id: c.id, tag: c.tag, abstain: false, option: best, guess: c.options[best].t, confidence: t.strength };
  });
  const body = JSON.stringify(preds);
  return { predictions: preds, sha256: crypto.createHash("sha256").update(body).digest("hex") };
}

function check(frozen, ans) {
  let exact = 0, side = 0, guessed = 0, abstained = 0;
  const rows = frozen.predictions.map((p) => {
    const c = byId[p.id];
    const a = ans[p.id];
    if (p.abstain) { abstained++; return { ...p, actual: typeof a === "number" ? c.options[a].t : null }; }
    if (typeof a !== "number") return { ...p, actual: null };
    guessed++;
    const hit = a === p.option;
    const sameSide = Math.sign(c.options[a].level) === Math.sign(c.options[p.option].level);
    exact += hit; side += sameSide;
    return { ...p, actual: c.options[a].t, hit, sameSide };
  });
  return { exact, sameSide: side, guessed, abstained, chance: { exact: 0.25, sameSide: 0.5 }, rows };
}

if (cmd === "profile") { const p = profile(read(file)); write("profile.json", p); console.log(JSON.stringify({ strongest: p.strongest, splits: p.splits, emotions: p.emotions.map((e) => `${e.emotion} x${e.times}`), coverage: p.coverage }, null, 2)); }
else if (cmd === "freeze") { const f = freeze(read("profile.json")); if (fs.existsSync("sealed-predictions.json")) throw new Error("Already frozen. Never re-freeze after seeing sealed answers."); write("sealed-predictions.json", f); console.log(`Frozen ${f.predictions.filter((p) => !p.abstain).length} guesses, ${f.predictions.filter((p) => p.abstain).length} passes.\nsha256 ${f.sha256}`); }
else if (cmd === "check") { const r = check(read("sealed-predictions.json"), read(file)); write("sealed-results.json", r); console.log(`Exact ${r.exact}/${r.guessed} (chance 25%), right side ${r.sameSide}/${r.guessed} (chance 50%), passed ${r.abstained}`); }
else console.log("usage: node score.mjs profile answers.json | freeze | check sealed-answers.json");
