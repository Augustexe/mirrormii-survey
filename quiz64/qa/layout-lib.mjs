// Helpers for the layout guard (layout-guard.mjs): build a game state in the page
// with the app's own session module, then open the app on it. Needs the dev server (the page imports /src/...).
// Run ids must match /^[a-z0-9]{6,32}$/ (the app rejects anything else as a corrupt save).

// Leaning players; PLAYER=a|b|c picks one (default a).
export const PLAYERS = {
  a: { R1: 1, R2: -0.6, R3: -0.4, L1: 0.9, L2: -0.5, L3: 0.9 },
  b: { R1: -0.9, R2: 0.8, R3: 0.5, L1: -0.8, L2: 0.7, L3: -0.6 },
  c: { R1: 0.7, R2: 0.9, R3: -0.8, L1: -0.5, L2: -0.8, L3: -0.9 },
};
export const PLAYER = PLAYERS[process.env.PLAYER || "a"] || PLAYERS.a;

// Plays a leaning player until `stop` matches, then saves the run. Returns true when the stop was reached.
//   stop: "type" (a chapter card of cfg.type), "lock", "finale", "result"
export async function seedRun(page, cfg) {
  return page.evaluate(async (cfg) => {
    localStorage.clear();
    if (!cfg) return true;
    const P = await import("/src/persona/session.js");
    const signs = cfg.signs;
    const lean = (card) => {
      const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
      const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
      if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i].sort((a, b) => a - b);
      if (card.type === "rank") return ranked.map((r) => r.i);
      return ranked[0].i;
    };
    for (let t = 0; t < (cfg.tries || 1); t++) {
      const id = `${cfg.id}${t}`;
      let s = P.chooseLobby(P.startRun(P.newRun({ runId: id }), { closest: "best_friend", pronoun: "they" }), { voice: cfg.voice, depth: "anything", rooms: ["love", "work", "family"] });
      let hit = false;
      for (let g = 0; g < 200; g++) {
        const st = P.currentStep(s);
        if (cfg.stop === "type" && st.kind === "card" && st.phase !== "finale" && st.card.type === cfg.type && st.index > 1) { hit = true; break; }
        if (cfg.stop === "lock" && st.kind === "lock") { hit = true; break; }
        if (cfg.stop === "finale" && st.kind === "card" && st.phase === "finale") { hit = true; break; }
        if (st.kind === "result") { hit = cfg.stop === "result"; break; }
        if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
        s = P.answerCard(s, st.card.id, lean(st.card), { ms: 4200 });
      }
      if (hit) { localStorage.setItem("genii.persona.v2.run", P.serialize(s)); return true; }
    }
    return false;
  }, cfg && { signs: PLAYER, ...cfg });
}

// Opens the app on a seeded run (or as a new player when cfg is null) and walks past the landing into it.
export async function openRun(page, base, cfg) {
  await page.goto(base);
  const ok = await seedRun(page, cfg);
  await page.goto(base);
  await page.waitForSelector(".mm-landing", { timeout: 15000 });
  if (cfg) await page.locator(".mm-landing__cta").click();
  await page.waitForTimeout(300);
  const start = page.locator(".mm-interlude__start");
  if (await start.count()) await start.click();
  return ok;
}

// On the reveal: steps forward until the story with this id is current. Returns true when it got there.
export async function gotoStory(page, id, max = 40) {
  for (let i = 0; i < max; i++) {
    const cur = await page.locator(".rv-slide.is-current").getAttribute("data-story").catch(() => null);
    if (cur === id) return true;
    if (cur === "app" && id !== "app") return false;
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(260);
  }
  return false;
}
