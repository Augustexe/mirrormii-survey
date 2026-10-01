/* Genii tag pilot engine. Pure functions shared by the app and the node tests.
 * answers = {
 *   setup: { age: "teen"|"adult", closest: string },
 *   stance: { [dimId]: { level: -2..2 | null, ms } },   // null = skipped
 *   scene:  { [dimId]: { option: index | null, exit: "no_recent"|"skip"|null, ms } },
 *   sealed: { [sealedId]: { option: index | null, ms } }
 * }
 */
(function (root) {
  function median(xs) {
    if (!xs.length) return null;
    const s = [...xs].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  function eligibleDimensions(bank, setup) {
    const teen = setup && setup.age === "teen";
    return bank.DIMENSIONS.filter((d) => !(teen && d.adultOnly));
  }

  function stancePrompt(dim, setup) {
    return setup && setup.age === "teen" && dim.stance.teenPrompt ? dim.stance.teenPrompt : dim.stance.prompt;
  }

  function computeProfile(bank, answers) {
    const setup = answers.setup || {};
    const dims = eligibleDimensions(bank, setup);
    const stanceMs = Object.values(answers.stance || {}).map((a) => a.ms).filter((x) => typeof x === "number");
    const med = median(stanceMs);
    const tags = [];
    const also = {};
    const emotions = [];
    for (const dim of dims) {
      const st = (answers.stance || {})[dim.id];
      const sc = (answers.scene || {})[dim.id];
      const s = st && typeof st.level === "number" ? st.level : null;
      let c = null;
      let sceneText = null;
      if (dim.scene && sc && typeof sc.option === "number") {
        const opt = dim.scene.options[sc.option];
        sceneText = opt.t;
        c = typeof opt.level === "number" ? opt.level : null;
        for (const a of opt.also || []) also[a] = (also[a] || 0) + 1;
        if (opt.emotion) emotions.push({ emotion: opt.emotion, dim: dim.id });
      }
      const final = c !== null ? c : s;
      const contradiction = s !== null && c !== null && s !== 0 && c !== 0 && Math.sign(s) !== Math.sign(c);
      const agree = s !== null && c !== null && s !== 0 && Math.sign(s) === Math.sign(c);
      let strength;
      if (final === null) strength = "unknown";
      else if (contradiction) strength = "split";
      else if (final === 0) strength = "depends";
      else if (Math.abs(final) === 2 || agree) strength = "clear";
      else strength = "leaning";
      const source = s !== null && c !== null ? "stance+scene" : c !== null ? "scene" : s !== null ? "stance" : "none";
      const hesitated = !!(st && med && st.ms > 2 * med && st.ms > 6000);
      tags.push({
        id: dim.id, domain: dim.domain,
        pole: final === null || final === 0 ? null : final < 0 ? "A" : "B",
        label: final === null ? null : final === 0 ? "Depends" : final < 0 ? dim.A : dim.B,
        level: final, stanceLevel: s, sceneLevel: c, sceneText,
        strength, source, contradiction, hesitated,
        stanceSaid: s === null ? null : s < 0 ? dim.A : s > 0 ? dim.B : "Depends",
        never: dim.never,
      });
    }
    const counted = tags.filter((t) => t.strength === "clear" || t.strength === "leaning" || t.strength === "split");
    return {
      version: bank.version,
      tags, also, emotions,
      coverage: { dimensions: tags.length, nonNeutral: counted.length, clear: tags.filter((t) => t.strength === "clear").length, contradictions: tags.filter((t) => t.contradiction).length },
      stanceMedianMs: med,
    };
  }

  function predictSealed(bank, profile) {
    const byId = Object.fromEntries(profile.tags.map((t) => [t.id, t]));
    return bank.SEALED.map((h) => {
      const tag = byId[h.dim];
      if (!tag || tag.level === null || tag.level === 0 || tag.strength === "split") return { id: h.id, abstain: true };
      let best = 0;
      let bestD = Infinity;
      h.options.forEach((o, i) => {
        const d = Math.abs(o.level - tag.level);
        if (d < bestD) { bestD = d; best = i; }
      });
      return { id: h.id, abstain: false, option: best };
    });
  }

  function scoreSealed(bank, predictions, sealedAnswers) {
    let answered = 0, exact = 0, side = 0, abstained = 0, guessed = 0;
    const rows = predictions.map((p) => {
      const h = bank.SEALED.find((x) => x.id === p.id);
      const a = (sealedAnswers || {})[p.id];
      const actual = a && typeof a.option === "number" ? a.option : null;
      if (actual !== null) answered++;
      if (p.abstain) { abstained++; return { id: p.id, abstain: true, actual }; }
      if (actual === null) return { id: p.id, abstain: false, predicted: p.option, actual: null };
      guessed++;
      const hit = actual === p.option;
      const sameSide = Math.sign(h.options[actual].level) === Math.sign(h.options[p.option].level);
      if (hit) exact++;
      if (sameSide) side++;
      return { id: p.id, abstain: false, predicted: p.option, actual, hit, sameSide };
    });
    return { answered, guessed, exact, side, abstained, rows };
  }

  const ENGINE = { median, eligibleDimensions, stancePrompt, computeProfile, predictSealed, scoreSealed };
  root.GENII_PILOT_ENGINE = ENGINE;
  if (typeof module !== "undefined" && module.exports) module.exports = ENGINE;
})(typeof window !== "undefined" ? window : globalThis);
