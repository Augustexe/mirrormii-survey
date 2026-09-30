// Shared by the article QA scripts: seeds a finished run in the page with the app's own session module, opens the
// result, walks the Stories deck to its last screen and opens the Evidence Article with "Read the long version".
// Also installs a CLS observer (window.__cls) before the app loads.
export const SIZES = {
  phone: { width: 390, height: 844, mobile: true },
  desktop: { width: 1440, height: 900, mobile: false },
};

const PLAYERS = {
  a: { signs: { R1: 0.7, R2: -0.75, R3: -0.55, L1: 0.18, L2: 0.8, L3: -0.6 }, noise: 0.25 },
  b: { signs: { R1: -0.9, R2: 0.8, R3: 0.5, L1: -0.8, L2: 0.7, L3: -0.6 }, noise: 0.5 },
  c: { signs: { R1: 0.7, R2: 0.9, R3: -0.8, L1: -0.5, L2: -0.8, L3: -0.9 }, noise: 0.4 },
  d: { signs: { R1: -0.6, R2: -0.9, R3: 0.9, L1: 0.8, L2: 0.9, L3: 0.4 }, noise: 0.6 },
};

// Run ids must match /^[a-z0-9]{6,32}$/.
export async function seedResult(page, { voice = "fun", player = "a", id = "articleqa" } = {}) {
  return page.evaluate(async ({ voice, cfg, id }) => {
    localStorage.clear();
    const P = await import("/src/persona/session.js");
    const signs = cfg.signs;
    let seed = 11;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const lean = (card, finale) => {
      const score = (o) => Object.entries(o.axes || {}).reduce((a, [k, v]) => a + (signs[k] || 0) * v, 0) + (o.tags || []).reduce((a, t) => a + (t.id.endsWith("A") ? 1 : -1) * t.s * 0.3, 0);
      const ranked = card.options.map((o, i) => ({ i, s: o.circumstance || o.depends || o.none ? -99 : score(o) })).sort((a, b) => b.s - a.s || a.i - b.i);
      if (finale && cfg.noise && rnd() < cfg.noise) return ranked[Math.min(ranked.length - 1, 1 + Math.floor(rnd() * (ranked.length - 1)))].i;
      if (card.type === "pick_two" || card.type === "receipts") return [ranked[0].i, ranked[1].i].sort((a, b) => a - b);
      if (card.type === "rank") return ranked.map((r) => r.i);
      return ranked[0].i;
    };
    let s = P.chooseLobby(P.startRun(P.newRun({ runId: id }), { closest: "best_friend", pronoun: "she" }), { voice, depth: "anything", rooms: ["love", "work", "family"] });
    for (let g = 0; g < 200; g++) {
      const st = P.currentStep(s);
      if (st.kind === "result") break;
      if (st.kind === "lock") { s = P.lockGuesses(s); continue; }
      s = P.answerCard(s, st.card.id, lean(st.card, st.phase === "finale"), { ms: 4200 });
    }
    localStorage.setItem("genii.persona.v2.run", P.serialize(s));
    return P.currentStep(s).kind;
  }, { voice, cfg: PLAYERS[player] || PLAYERS.a, id });
}

export async function openArticle(page, base, opts = {}) {
  await page.addInitScript(() => {
    window.__cls = 0;
    try {
      new PerformanceObserver((list) => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true });
    } catch { /* no layout-shift entries in this browser */ }
  });
  await page.goto(base);
  const kind = await seedResult(page, opts);
  if (kind !== "result") throw new Error(`seeded run did not finish (${kind})`);
  await page.goto(base);
  await page.waitForSelector(".mm-landing__cta", { timeout: 10000 });
  await page.locator(".mm-landing__cta").click();
  await page.waitForSelector(".rv-room", { timeout: 10000 });
  await page.waitForTimeout(600);
  await page.keyboard.press("End");
  await page.waitForTimeout(900);
  await page.locator(".rv-slide.is-current .rv-readmore").click();
  await page.waitForSelector(".ea-cover", { timeout: 10000 });
  // CLS counts from the article's first paint (the deck is a different page).
  await page.evaluate(() => { window.__cls = 0; });
}
