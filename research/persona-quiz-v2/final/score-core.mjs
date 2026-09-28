// Genii persona quiz v2 scoring core. Deterministic evidence parsing, no model judgment, no I/O.
//
// createScorer({ kit, lib, friend }) returns the whole scorer bound to one content kit: kit is cards.json,
// lib is library.json, friend is friend.json (or a function that loads it on first use). score.mjs wraps this
// for the Node CLI, sim.mjs and tests.mjs; the quiz64 web app imports it directly, so the browser and the
// reference kit share one scoring implementation.
export function createScorer({ kit, lib, friend }) {
  let friendCache = null;
  const friendLib = () => (typeof friend === "function" ? (friendCache ||= friend()) : friend);

  // Thresholds set by sim.mjs (see SIM-REPORT.md). Everything else follows the brief.
  const CONFIG = {
    rushedMs: 1500, // answers faster than this count at rushedFactor
    rushedFactor: 0.3,
    minAxisCards: 2, // fewer valid cards on an axis: "this side isn't finished yet"
    flexBand: 0.12, // |normalized axis score| below this: Flex badge, tie broken by real cards then the first card
    tagFire: 2.25, // net support (tag minus its pair) needed to fire
    tagStrong: 3.0, // net support that marks a fired tag "strong"
    tagFloor: 1.25, // nobody leaves with 0 tags: if none fire, the best candidate above this (same card rules) shows as "leaning"
    tagMinCards: 2, // separate cards that must support a tag
    maxTags: 5,
    minChapters: 3, // shown tags come from at least this many chapters where possible
    // Shown-tag ranking. "share": strong tags (net >= tagStrong) first by net, then the other fired tags by coverage
    // share (net / the most net support the cards this player answered could have given the tag), then by net.
    // "net": every fired tag by net (the pre fix-pass ranking, kept for sim comparison).
    tagRank: "share",
    splitMin: 0.4, // both believe and did/would evidence must reach this (weighted) to call a split
    // Plot twist: an axis split always qualifies. A tag-pair split qualifies only when the quoted believe card and the
    // quoted did/would card share one of these ("sally" question, "chapter"), so a twist never joins unrelated situations.
    twistPairLink: ["sally", "chapter"],
    sealedPairScale: 1.2, // tag-pair net support that counts as a full-strength profile position for sealed guesses
    sealedTagWeight: 0.6, // tag evidence weight relative to axis evidence in sealed guesses
  };

  const AXES = lib.axes.map((a) => a.id);
  const TAG = Object.fromEntries(lib.tags.map((t) => [t.id, t]));
  const pairOf = (id) => id.slice(0, 3);
  const pairSign = (id) => (id.endsWith("A") ? 1 : -1);
  const EXIT = new Set(["skip", "not_my_life", "no_recent"]);
  const round = (x, d = 3) => Math.round(x * 10 ** d) / 10 ** d;
  const sign = (x) => (x > 0 ? 1 : x < 0 ? -1 : 0);

  const allCards = [...kit.chapters.flatMap((c) => c.cards), ...kit.finale, ...kit.extras];
  const cardById = Object.fromEntries(allCards.map((c) => [c.id, c]));

  function isTeen(setup) {
    return (setup && setup.age) === "teen";
  }

  // The chapter run for this player, in order (no finale, no extras).
  function runCards(setup) {
    const teen = isTeen(setup);
    return kit.chapters.flatMap((ch) => ch.cards.filter((c) => !teen || c.teen));
  }

  function promptFor(card, setup) {
    return isTeen(setup) && card.teenPrompt ? card.teenPrompt : card.prompt;
  }

  // Signed evidence vector of one option: axes as is; tags on their pair, + for A, - for B.
  function optionVector(opt) {
    const v = {};
    for (const [k, x] of Object.entries(opt.axes || {})) v[k] = (v[k] || 0) + x;
    for (const t of opt.tags || []) v[pairOf(t.id)] = (v[pairOf(t.id)] || 0) + pairSign(t.id) * t.s;
    return v;
  }

  // Normalize one card answer into { kind, picks, flip, ms, rushed }.
  function readAnswer(card, answers) {
    const raw = answers[card.id];
    const ms = answers._ms && typeof answers._ms[card.id] === "number" ? answers._ms[card.id] : null;
    const rushed = ms !== null && ms < CONFIG.rushedMs;
    if (raw === undefined || raw === null) return { kind: "unanswered", ms, rushed: false };
    if (typeof raw === "string") {
      if (!EXIT.has(raw)) throw new Error(`${card.id}: unknown answer "${raw}"`);
      if (raw === "no_recent" && card.type !== "real") return { kind: "skip", ms, rushed };
      return { kind: raw, ms, rushed };
    }
    const picks = Array.isArray(raw) ? [...new Set(raw)] : [raw];
    for (const i of picks) if (!Number.isInteger(i) || !card.options[i]) throw new Error(`${card.id}: no option ${i}`);
    if (card.type === "pick_two" && picks.length > 2) throw new Error(`${card.id}: pick_two takes at most 2 picks`);
    if (card.type !== "pick_two" && picks.length !== 1) throw new Error(`${card.id}: takes one option`);
    const flipRaw = answers[`${card.id}.flip`];
    const flip = Number.isInteger(flipRaw) && card.flip && card.flip.options[flipRaw] !== undefined ? flipRaw : null;
    return { kind: "picked", picks, flip, ms, rushed };
  }

  function gateOpen(card, answers) {
    if (!card.gateRule) return true;
    const src = cardById[card.gateRule.card];
    const a = readAnswer(src, answers);
    if (a.kind !== "picked") return false;
    return a.picks.some((i) => (src.options[i].tags || []).some((t) => t.id === card.gateRule.anyTag));
  }

  // ---------------------------------------------------------------- profile
  function buildProfile(answers, cfg = {}) {
    const C = { ...CONFIG, ...cfg };
    const setup = answers.setup || {};
    const teen = isTeen(setup);
    const run = runCards(setup);
    const extras = kit.extras.filter((c) => answers[c.id] !== undefined);
    const scored = [...run, ...extras];
    const order = Object.fromEntries(scored.map((c, i) => [c.id, i]));
    const warnings = [];
    for (const k of Object.keys(answers)) {
      if (k === "setup" || k === "_ms" || k.endsWith(".flip")) continue;
      if (!cardById[k]) warnings.push(`unknown card id ${k} ignored`);
      else if (cardById[k].type === "sealed") warnings.push(`${k} is a sealed card; sealed answers never count as profile evidence`);
      else if (!order.hasOwnProperty(k)) warnings.push(`${k} is not in this player's run (teen or gated); ignored`);
    }

    const axisEv = Object.fromEntries(AXES.map((a) => [a, []]));
    const tagEv = {};
    const emotions = [];
    const feelings = [];
    const research = { circumstance: [], notMyLife: [], noRecent: [], skipped: [], unanswered: [], depends: [], rushed: [], gatedOut: [], ms: answers._ms || {} };
    const answered = {};
    const scoringCards = []; // { card, w, picks } for every answer that can carry evidence (the coverage-share denominator)

    for (const card of scored) {
      if (!gateOpen(card, answers)) {
        research.gatedOut.push(card.id);
        continue;
      }
      const a = readAnswer(card, answers);
      answered[card.id] = a;
      if (a.kind === "unanswered") { research.unanswered.push(card.id); continue; }
      if (a.kind === "skip") { research.skipped.push(card.id); continue; }
      if (a.kind === "not_my_life") { research.notMyLife.push(card.id); continue; }
      if (a.kind === "no_recent") { research.noRecent.push(card.id); continue; }
      if (a.rushed) research.rushed.push({ card: card.id, ms: a.ms });
      const w = card.weight * (a.rushed ? C.rushedFactor : 1);
      if (w && a.picks.some((i) => !card.options[i].circumstance && !card.options[i].depends)) scoringCards.push({ card, w });
      for (const i of a.picks) {
        const o = card.options[i];
        if (o.emotion) emotions.push({ emotion: o.emotion, card: card.id, said: o.t, rushed: a.rushed });
        if (card.type === "feeling") {
          const prev = card.follows && answered[card.follows];
          const prevCard = card.follows && cardById[card.follows];
          feelings.push({ card: card.id, follows: card.follows || null, followsSaid: prev && prev.kind === "picked" ? prev.picks.map((j) => prevCard.options[j].t).join(" + ") : null, feeling: o.emotion || null, said: o.t });
          continue;
        }
        if (o.circumstance) { research.circumstance.push({ card: card.id, said: o.t }); continue; }
        if (o.depends) { research.depends.push({ card: card.id, said: o.t, flip: a.flip === null ? null : card.flip.options[a.flip] }); continue; }
        if (!w) continue;
        for (const [ax, v] of Object.entries(o.axes || {})) {
          if (!v) continue;
          axisEv[ax].push({ card: card.id, option: i, said: o.t, v, w, grade: card.grade, rushed: a.rushed, order: order[card.id], chapter: card.chapter });
        }
        for (const t of o.tags || []) {
          if (teen && TAG[t.id] && TAG[t.id].locked18) continue;
          (tagEv[t.id] ||= []).push({ card: card.id, option: i, said: o.t, s: t.s, w, sup: w * t.s, grade: card.grade, rushed: a.rushed, order: order[card.id], chapter: card.chapter });
        }
      }
    }

    // Axes
    const axes = {};
    for (const ax of AXES) {
      const ev = axisEv[ax];
      const cards = new Set(ev.map((e) => e.card));
      const score = ev.reduce((s, e) => s + e.w * e.v, 0);
      const max = ev.reduce((s, e) => s + e.w * 2, 0);
      const norm = max ? score / max : 0;
      const unfinished = cards.size < C.minAxisCards;
      let pole, decidedBy;
      if (!unfinished && Math.abs(norm) >= C.flexBand) { pole = sign(score); decidedBy = "score"; }
      else {
        const real = ev.filter((e) => e.grade === "did").reduce((s, e) => s + e.w * e.v, 0);
        const first = [...ev].sort((a, b) => a.order - b.order)[0];
        if (unfinished && score) { pole = sign(score); decidedBy = "score (unfinished)"; }
        else if (real) { pole = sign(real); decidedBy = "real cards"; }
        else if (first) { pole = sign(first.v); decidedBy = `first card ${first.card}`; }
        else { pole = 1; decidedBy = "no evidence (provisional)"; }
      }
      const flex = !unfinished && Math.abs(norm) < C.flexBand;
      const meta = lib.axes.find((a) => a.id === ax);
      axes[ax] = {
        score: round(score), norm: round(norm), cards: cards.size, pole, poleName: pole > 0 ? meta.plus : meta.minus,
        line: pole > 0 ? meta.plusLine : meta.minusLine, flex, unfinished, decidedBy,
        evidence: ev.map(({ card, said, v, w, grade, rushed }) => ({ card, said, v, w: round(w), grade, rushed })),
      };
    }

    // Tags
    const sup = (id) => (tagEv[id] || []).reduce((s, e) => s + e.sup, 0);
    const tags = {};
    const raw = {}; // unrounded net and share, used for ranking
    for (const t of lib.tags) {
      if (teen && t.locked18) continue;
      const ev = tagEv[t.id] || [];
      const support = sup(t.id);
      const net = support - sup(t.pair);
      const cards = new Set(ev.map((e) => e.card));
      const calm = new Set(ev.filter((e) => !e.rushed).map((e) => e.card));
      const fired = cards.size >= C.tagMinCards && calm.size >= 1 && net >= C.tagFire;
      if (!ev.length && !sup(t.pair)) continue;
      const possible = scoringCards.reduce((s, x) => s + x.w * cardTagMax(x.card, t.id), 0);
      const share = possible > 0 ? net / possible : 0;
      raw[t.id] = { net, share };
      tags[t.id] = {
        name: t.name, pair: t.pair, chapter: t.chapter, support: round(support), net: round(net), possible: round(possible), share: round(share),
        cards: cards.size, calmCards: calm.size,
        fired, strong: fired && net >= C.tagStrong, leaning: false,
        floorOk: cards.size >= C.tagMinCards && calm.size >= 1 && net >= C.tagFloor,
        evidence: ev.map(({ card, said, s, w, grade, rushed, chapter }) => ({ card, chapter, said, s, w: round(w), grade, rushed })),
      };
    }
    const fired = rankTags(Object.keys(tags).filter((id) => tags[id].fired), raw, tags, C).map((id) => [id, tags[id]]);
    let shown = pickSpread(fired.map(([id]) => id), tags, C);
    if (!shown.length) {
      const floor = Object.entries(tags).filter(([, t]) => t.floorOk).sort((a, b) => b[1].net - a[1].net)[0];
      if (floor) { floor[1].leaning = true; shown = [floor[0]]; }
    }

    // Splits: believe-grade evidence one way, did/would the other, on the same axis or tag pair.
    const dims = {};
    const addDim = (dim, e, signed) => {
      const d = (dims[dim] ||= { believe: 0, act: 0, believeEv: [], actEv: [] });
      if (e.grade === "believe") { d.believe += signed; d.believeEv.push({ ...e, signed }); }
      else { d.act += signed; d.actEv.push({ ...e, signed }); }
    };
    for (const ax of AXES) for (const e of axisEv[ax]) addDim(ax, e, e.w * e.v);
    for (const [id, ev] of Object.entries(tagEv)) for (const e of ev) addDim(pairOf(id), e, e.sup * pairSign(id));
    // A split qualifies for the plot twist (twistOk) when it is an axis split, or a tag-pair split whose quoted believe
    // card and quoted did/would card share a Sally question or a chapter (CONFIG.twistPairLink). For a tag pair, the
    // quoted cards are the strongest linked couple (a did card first, as for axes); with no linked couple the split is
    // kept for research with twistOk false.
    const bySize = (a, b) => Math.abs(b.signed) - Math.abs(a.signed) || a.order - b.order;
    const splits = [];
    for (const [dim, d] of Object.entries(dims)) {
      if (Math.abs(d.believe) < C.splitMin || Math.abs(d.act) < C.splitMin || sign(d.believe) === sign(d.act)) continue;
      const says = d.believeEv.filter((e) => sign(e.signed) === sign(d.believe)).sort(bySize);
      const acts = d.actEv.filter((e) => sign(e.signed) === sign(d.act)).sort((a, b) => (b.grade === "did") - (a.grade === "did") || bySize(a, b));
      const kind = AXES.includes(dim) ? "axis" : "tag pair";
      let said = says[0], did = acts[0], twistOk = true, link = null;
      if (kind === "tag pair") {
        twistOk = false;
        for (const act of acts) {
          const hit = says.map((b) => [b, cardLink(b.card, act.card, C)]).find(([, l]) => l);
          if (hit) { [said, link] = hit; did = act; twistOk = true; break; }
        }
      }
      splits.push({
        dim, kind, believe: round(d.believe), act: round(d.act), strength: round(Math.min(Math.abs(d.believe), Math.abs(d.act))), twistOk, link,
        said: { card: said.card, text: said.said }, did: { card: did.card, text: did.said, grade: did.grade },
      });
    }
    splits.sort(twistOrder);

    const emoCount = {};
    for (const e of emotions) emoCount[e.emotion] = (emoCount[e.emotion] || 0) + 1;
    const scoredCount = Object.values(answered).filter((a) => a.kind === "picked").length;

    return {
      version: kit.version,
      setup,
      config: C,
      counts: { run: scored.length, answered: scoredCount, skipped: research.skipped.length, notMyLife: research.notMyLife.length, noRecent: research.noRecent.length, unanswered: research.unanswered.length, rushed: research.rushed.length, circumstance: research.circumstance.length },
      axes,
      type: typeOf(axes),
      tags,
      firedTags: fired.map(([id]) => id),
      shownTags: shown,
      strongTags: shown.filter((id) => tags[id].strong),
      splits,
      emotions: Object.entries(emoCount).sort((a, b) => b[1] - a[1]).map(([emotion, times]) => ({ emotion, times, from: emotions.filter((e) => e.emotion === emotion).map((e) => `${e.card}: ${e.said}`) })),
      feelings,
      research,
      warnings,
    };
  }

  // Most net support (tag strength minus pair strength, before the card weight) one answer to this card can give a tag.
  // pick_two counts its best two picks. Never below 0.
  const tagMaxCache = new Map();
  function cardTagMax(card, tagId) {
    const key = `${card.id}|${tagId}`;
    if (tagMaxCache.has(key)) return tagMaxCache.get(key);
    const pair = TAG[tagId] ? TAG[tagId].pair : null;
    const vals = card.options.map((o) => (o.tags || []).reduce((s, t) => s + (t.id === tagId ? t.s : t.id === pair ? -t.s : 0), 0))
      .map((v) => Math.max(0, v)).sort((a, b) => b - a);
    const m = card.type === "pick_two" ? (vals[0] || 0) + (vals[1] || 0) : vals[0] || 0;
    tagMaxCache.set(key, m);
    return m;
  }

  // Split order; the first twistOk split is the plot twist. Twist-eligible first; then a real (did) card on the acted
  // side; then axis before tag pair; then strength; then dim id.
  function twistOrder(a, b) {
    return b.twistOk - a.twistOk || (b.did.grade === "did") - (a.did.grade === "did") ||
      (a.kind === "axis" ? 0 : 1) - (b.kind === "axis" ? 0 : 1) || b.strength - a.strength || a.dim.localeCompare(b.dim);
  }

  // Do two cards share a Sally question or a chapter (per CONFIG.twistPairLink)? Returns the link or null.
  function cardLink(idA, idB, C = CONFIG) {
    const a = cardById[idA], b = cardById[idB];
    if (!a || !b || idA === idB) return null;
    if (C.twistPairLink.includes("sally")) {
      const q = (a.sally || []).find((x) => (b.sally || []).includes(x));
      if (q) return `sally ${q}`;
    }
    if (C.twistPairLink.includes("chapter") && typeof a.chapter === "number" && a.chapter === b.chapter) return `chapter ${a.chapter}`;
    return null;
  }

  // Fired-tag ranking (CONFIG.tagRank). "share": strong tags first by net; the rest by coverage share, then net.
  // "net": all by net. Ties: more cards, then tag id, so the order is deterministic.
  function rankTags(ids, raw, tags, C = CONFIG) {
    const strong = (id) => raw[id].net >= C.tagStrong;
    const tie = (a, b) => tags[b].cards - tags[a].cards || a.localeCompare(b);
    return [...ids].sort((a, b) => {
      if (C.tagRank === "net") return raw[b].net - raw[a].net || tie(a, b);
      if (strong(a) !== strong(b)) return strong(b) - strong(a);
      if (strong(a)) return raw[b].net - raw[a].net || tie(a, b);
      return raw[b].share - raw[a].share || raw[b].net - raw[a].net || tie(a, b);
    });
  }

  // Up to maxTags in rank order (ids arrive ranked), from at least minChapters chapters where possible. A swap drops the
  // lowest-ranked tag from a chapter that has two and adds the best-ranked tag from a new chapter. Output keeps rank order.
  function pickSpread(ids, tags, C) {
    const picked = ids.slice(0, C.maxTags);
    const chapters = () => new Set(picked.map((id) => tags[id].chapter));
    const target = Math.min(C.minChapters, new Set(ids.map((id) => tags[id].chapter)).size);
    let guard = 0;
    while (chapters().size < target && guard++ < 10) {
      const have = chapters();
      const add = ids.find((id) => !picked.includes(id) && !have.has(tags[id].chapter));
      if (!add) break;
      const counts = {};
      for (const id of picked) counts[tags[id].chapter] = (counts[tags[id].chapter] || 0) + 1;
      const drop = [...picked].reverse().find((id) => counts[tags[id].chapter] > 1);
      if (drop && picked.length >= C.maxTags) picked.splice(picked.indexOf(drop), 1);
      else if (picked.length >= C.maxTags) break;
      picked.push(add);
    }
    return picked.sort((a, b) => ids.indexOf(a) - ids.indexOf(b));
  }

  function typeOf(axes) {
    const rel = lib.relationship.find((h) => h.R1 === axes.R1.pole && h.R2 === axes.R2.pole && h.R3 === axes.R3.pole);
    const life = lib.life.find((h) => h.L1 === axes.L1.pole && h.L2 === axes.L2.pole && h.L3 === axes.L3.pole);
    return {
      name: `${rel.name} × ${life.name}`,
      code: `${rel.code} | ${life.code}`,
      relationship: rel,
      life,
      flex: AXES.filter((a) => axes[a].flex),
      unfinished: AXES.filter((a) => axes[a].unfinished),
    };
  }

  // ---------------------------------------------------------------- result page data
  function buildResult(p) {
    const T = p.type;
    const shown = p.shownTags.map((id) => {
      const t = TAG[id];
      const rank = { did: 0, would: 1, believe: 2 };
      const ev = p.tags[id].evidence.filter((e) => e.s > 0).sort((a, b) => rank[a.grade] - rank[b.grade] || b.s * b.w - a.s * a.w);
      return {
        id, name: t.name, strength: p.tags[id].strong ? "strong" : p.tags[id].leaning ? "leaning" : "showing", heart: t.heart, sting: t.sting, stingOwnerOnly: true,
        youToldGenii: ev.slice(0, 3).map((e) => ({ card: e.card, chapter: e.chapter, said: e.said, grade: e.grade, rushed: e.rushed })),
        evidenceCards: ev.length,
      };
    });
    const calls = [];
    for (let k = 0; calls.length < 3 && k < 3; k++) {
      for (const id of p.shownTags) {
        const c = (TAG[id].calls || [])[k];
        if (c && calls.length < 3 && !calls.some((x) => x.line === c)) calls.push({ line: c, fromTag: id });
      }
    }
    const s = p.splits.find((x) => x.twistOk);
    const plotTwist = s ? {
      line: s.did.grade === "did" ? `You'd say: ‘${s.said.text}’ Last time, you did: ‘${s.did.text}’` : `You'd say: ‘${s.said.text}’ Put on the spot, you'd go with: ‘${s.did.text}’`,
      dim: s.dim, said: s.said, did: s.did,
    } : null;
    const axisRow = (ax) => ({ axis: ax, pole: p.axes[ax].poleName, line: p.axes[ax].line, flex: p.axes[ax].flex, unfinished: p.axes[ax].unfinished });
    return {
      version: p.version,
      ownerOnly: ["stings", "tags[].sting", "plotTwist", "unfinished"],
      type: {
        name: T.name,
        code: T.code,
        badges: [...T.flex.map((a) => ({ axis: a, badge: lib.flex.badge, line: lib.flex.line })), ...T.unfinished.map((a) => ({ axis: a, badge: "Unfinished", line: lib.unfinished.line }))],
      },
      halves: [
        { side: "relationship", name: T.relationship.name, code: T.relationship.code, desc: T.relationship.desc, axes: ["R1", "R2", "R3"].map(axisRow) },
        { side: "life", name: T.life.name, code: T.life.code, desc: T.life.desc, axes: ["L1", "L2", "L3"].map(axisRow) },
      ],
      stings: [T.relationship.sting, T.life.sting],
      hearts: [T.relationship.heart, T.life.heart],
      tags: shown,
      calls,
      plotTwist,
      unfinished: T.unfinished.map((ax) => ({ axis: ax, line: lib.unfinished.line, extras: kit.extras.filter((c) => c.axisFor === ax).map((c) => c.id) })),
      share: {
        typeName: T.name,
        tags: shown.map((t) => ({ name: t.name, heart: t.heart })),
        invite: "Do you really know me?",
      },
    };
  }

  // ---------------------------------------------------------------- sealed predictions
  function profilePosition(p, C = CONFIG) {
    const pos = {};
    for (const ax of AXES) pos[ax] = p.axes[ax].norm;
    const pairs = {};
    for (const [id, t] of Object.entries(p.tags)) pairs[pairOf(id)] = (pairs[pairOf(id)] || 0) + pairSign(id) * t.support;
    for (const [pr, v] of Object.entries(pairs)) pos[pr] = Math.max(-1, Math.min(1, v / C.sealedPairScale));
    return pos;
  }

  function predictCard(card, p, cfg = {}) {
    const C = { ...CONFIG, ...cfg };
    const pos = profilePosition(p, C);
    const { primary, pairs } = card.checks;
    let pass = null;
    if (primary && (p.axes[primary].flex || p.axes[primary].unfinished)) pass = `${primary} is ${p.axes[primary].unfinished ? "unfinished" : "flex"}`;
    if (!primary && pairs.every((pr) => Math.abs(pos[pr] || 0) < 0.15)) pass = `no evidence on ${pairs.join(", ")}`;
    const scores = card.options.map((o) => {
      let s = 0;
      for (const [k, v] of Object.entries(o.axes || {})) s += (pos[k] || 0) * (v / 2);
      for (const t of o.tags || []) s += C.sealedTagWeight * (pos[pairOf(t.id)] || 0) * (pairSign(t.id) * t.s / 3);
      return round(s, 4);
    });
    let best = 0;
    scores.forEach((s, i) => { if (s > scores[best]) best = i; });
    return { id: card.id, primary: primary || pairs[0] || null, pass: !!pass, why: pass, predicted: best, predictedText: card.options[best].t, side: sideOf(card, best), scores };
  }

  function sideOf(card, i) {
    const o = card.options[i];
    const { primary, pairs } = card.checks;
    if (primary) return sign((o.axes || {})[primary] || 0);
    const v = optionVector(o);
    return sign(v[pairs[0]] || 0);
  }

  function freezePredictions(p) {
    return { version: kit.version, predictions: kit.finale.map((c) => predictCard(c, p)) };
  }

  function checkSealed(frozen, sealedAnswers) {
    const rows = frozen.predictions.map((pr) => {
      const card = cardById[pr.id];
      const raw = sealedAnswers[pr.id];
      const base = { id: pr.id, predicted: pr.predicted, predictedText: pr.predictedText };
      if (typeof raw !== "number" || !card.options[raw]) return { ...base, status: raw === undefined ? "unanswered" : "skipped", answer: raw ?? null };
      const actualSide = sideOf(card, raw);
      const sideHit = pr.side !== 0 && actualSide !== 0 ? pr.side === actualSide : null;
      const exact = raw === pr.predicted;
      return { ...base, answer: raw, answerText: card.options[raw].t, status: pr.pass ? "pass" : exact ? "hit" : "miss", exact, sideHit, passWhy: pr.why, options: card.options.length };
    });
    const called = rows.filter((r) => r.status === "hit" || r.status === "miss");
    const sided = called.filter((r) => r.sideHit !== null);
    return {
      version: kit.version,
      rows,
      called: called.length,
      exact: called.filter((r) => r.exact).length,
      exactRate: called.length ? round(called.filter((r) => r.exact).length / called.length) : null,
      exactChance: called.length ? round(called.reduce((s, r) => s + 1 / r.options, 0) / called.length) : null,
      side: sided.filter((r) => r.sideHit).length,
      sideOf: sided.length,
      sideRate: sided.length ? round(sided.filter((r) => r.sideHit).length / sided.length) : null,
      sideChance: 0.5,
      passes: rows.filter((r) => r.status === "pass").length,
      line: `Genii called ${called.filter((r) => r.exact).length} of ${called.length} exactly (chance about ${called.length ? Math.round((100 * called.reduce((s, r) => s + 1 / r.options, 0)) / called.length) : 0}%).`,
    };
  }

  // ---------------------------------------------------------------- friend game deck
  function rng(seed) {
    let s = seed >>> 0 || 1;
    return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  }
  function shuffle(xs, r) {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  // The friend side (a or b) the owner's picks map to, with the owner's match score (friend.json answerMapping).
  function friendMatch(card, picks) {
    const f = card.friend;
    if (!f) return null;
    const owner = {};
    for (const i of picks) for (const [k, v] of Object.entries(optionVector(card.options[i]))) owner[k] = (owner[k] || 0) + v;
    const side = (s) => Object.entries(optionVector(s)).reduce((acc, [k, v]) => acc + (owner[k] || 0) * v, 0);
    const a = side(f.a), b = side(f.b);
    if (a > 0 && a > b) return { side: "a", score: a };
    if (b > 0 && b > a) return { side: "b", score: b };
    return null;
  }

  function friendMapping(card, picks) {
    const m = friendMatch(card, picks);
    return m ? m.side : null;
  }

  // Owner pronoun and name tokens in friend game lines (friend.json tokens). An unset name keeps "{name}".
  function pronounsFor(setup) {
    const p = (setup || {}).pronoun;
    return p === "she" ? ["she", "her", "her"] : p === "he" ? ["he", "him", "his"] : ["they", "them", "their"];
  }
  function friendFill(s, setup = {}) {
    const pr = pronounsFor(setup);
    const cap = (w) => w[0].toUpperCase() + w.slice(1);
    return (s || "")
      .replaceAll("{they}", pr[0]).replaceAll("{them}", pr[1]).replaceAll("{their}", pr[2])
      .replaceAll("{They}", cap(pr[0])).replaceAll("{Their}", cap(pr[2]))
      .replaceAll("{name}", setup.name || "{name}");
  }

  function buildFriendDeck(p, answers, opts = {}) {
    const F = friendLib();
    const rel = opts.rel || "bestie";
    const relOpt = F.relationships.options.find((o) => o.id === rel);
    if (!relOpt) throw new Error(`unknown relationship ${rel}; use one of ${F.relationships.options.map((o) => o.id).join(", ")}`);
    const r = rng(opts.seed ?? 20260926);
    const setup = answers.setup || {};
    const teen = isTeen(setup);
    const toggles = F.relationships.privacyToggles;
    const def = (id) => toggles.find((t) => t.id === id).default[rel];
    const love = def("loveTags") === null ? false : opts.love ?? def("loveTags");
    const mk = teen || def("marriageKidsTags") === null ? false : opts.mk ?? def("marriageKidsTags");
    const stings = relOpt.level4 ? opts.stings ?? true : false;
    const groups = F.relationships.tagPairGroups;
    const allowed = new Set([...groups.open.pairs, ...(love ? groups.love.pairs : []), ...(mk ? groups.marriageKids.pairs : [])]);
    const pr = pronounsFor(setup);
    const fill = (s) => friendFill(s, setup);

    // Level 1: the truth for each axis.
    const set = relOpt.level1Set;
    const level1 = F.level1.questions[set].map((q) => {
      const ax = p.axes[q.axis];
      const right = q.options.find((o) => o.pole === ax.pole);
      return { axis: q.axis, prompt: fill(q.prompt), options: q.options.map((o) => ({ pole: o.pole, label: o.label, t: fill(o.t) })), truth: ax.pole, truthLabel: right.label, acceptEither: ax.flex || ax.unfinished, why: ax.unfinished ? "unfinished" : ax.flex ? "flex" : null };
    });

    // Level 2: 12 cards from the run, via friend.json level2 selection.
    const L2 = F.level2;
    const snap = L2.cards || {};
    const runIds = new Set(runCards(setup).filter((c) => gateOpen(c, answers)).map((c) => c.id));
    const info = (id) => {
      const c = cardById[id];
      const s = snap[id] || {};
      const pairs = s.pairs || [...new Set([...Object.keys(optionVector(c.friend.a)), ...Object.keys(optionVector(c.friend.b))].filter((k) => !AXES.includes(k)))];
      const axes = s.axes || [...new Set([...Object.keys(c.friend.a.axes || {}), ...Object.keys(c.friend.b.axes || {})])];
      return { id, card: c, level: s.level || "everyday", teenOk: s.teenOk !== false, pairs, axes, chapter: c.chapter };
    };
    const eligible = (id) => {
      const c = cardById[id];
      if (!c || !c.friend || c.privacy !== "normal" || !runIds.has(id)) return null;
      const i = info(id);
      if (!relOpt.cardLevels.includes(i.level)) return null;
      if (teen && !i.teenOk) return null;
      const a = readAnswer(c, answers);
      if (a.kind !== "picked" || a.rushed) return null;
      if (a.picks.some((j) => c.options[j].circumstance || c.options[j].depends)) return null;
      const side = friendMapping(c, a.picks);
      if (!side) return null;
      return { ...i, answerSide: side, ownerSaid: a.picks.map((j) => c.options[j].t).join(" + ") };
    };
    const primary = L2.primary[relOpt.level2Primary] || L2.primary.friend;
    const slots = primary.map((id) => eligible(id));
    const inDeck = () => slots.filter(Boolean);
    const usedPairs = () => new Set(inDeck().flatMap((x) => x.pairs));
    const coveredAxes = () => new Set(inDeck().flatMap((x) => x.axes));
    const has = (id) => inDeck().some((x) => x.id === id);
    for (let k = 0; k < primary.length; k++) {
      if (slots[k]) continue;
      const droppedAxes = cardById[primary[k]] ? info(primary[k]).axes : [];
      for (const ax of droppedAxes) {
        if (coveredAxes().has(ax)) continue;
        const pick = L2.backupOrder.map(eligible).find((x) => x && !has(x.id) && x.axes.includes(ax) && !x.pairs.some((q) => usedPairs().has(q)));
        if (pick) { slots[k] = pick; break; }
      }
    }
    const fillFrom = (allowRepeat) => {
      for (const id of L2.backupOrder) {
        if (inDeck().length >= 12) return;
        const x = eligible(id);
        if (!x || has(id)) continue;
        if (!allowRepeat && x.pairs.some((q) => usedPairs().has(q))) continue;
        const empty = slots.indexOf(null);
        if (empty >= 0 && empty < 12) slots[empty] = x; else slots.push(x);
      }
    };
    fillFrom(false);
    fillFrom(true);
    let deck = inDeck().slice(0, 12);
    const clash = (x, y) => x && y && (x.chapter === y.chapter || x.pairs.some((q) => y.pairs.includes(q)));
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < deck.length; i++) {
        if (!clash(deck[i - 1], deck[i])) continue;
        const moving = deck[i];
        const rest = [...deck.slice(0, i), ...deck.slice(i + 1)];
        for (let k = i + 1; k <= rest.length; k++) {
          if (!clash(rest[k - 1], moving) && !clash(moving, rest[k])) { rest.splice(k, 0, moving); deck = rest; break; }
        }
      }
    }
    const level2 = deck.length < 6
      ? { skipped: true, line: fill(L2.skippedLine.t), cards: [] }
      : { skipped: false, cards: deck.map((x) => ({ id: x.id, chapter: x.chapter, prompt: fill(x.card.friend.prompt), a: fill(x.card.friend.a.t), b: fill(x.card.friend.b.t), answer: x.answerSide, ownerSaid: x.ownerSaid, weight: x.card.weight })) };

    // Level 3: the 12-card tag deck.
    const trueTags = p.shownTags.filter((id) => allowed.has(pairOf(id)));
    const N = trueTags.length;
    const face = (id, role) => ({ id, role, name: TAG[id].name, heart: TAG[id].heart });
    const used = new Set(trueTags.map(pairOf));
    // Decoys come from pairs the owner has no fired tag in (Sally: never a pair she already hit). Only if those run out,
    // a fired-but-not-shown pair is used, showing the side the owner did NOT fire, so a decoy is never secretly true.
    const firedIds = new Set(p.firedTags || []);
    const firedPairs = new Set([...firedIds].map(pairOf));
    const openPairs = [...allowed].filter((q) => !used.has(q));
    const decoyPairs = [...shuffle(openPairs.filter((q) => !firedPairs.has(q)), r), ...shuffle(openPairs.filter((q) => firedPairs.has(q)), r)]
      .slice(0, Math.max(0, 12 - 2 * N));
    const decoySide = (q) => (firedIds.has(q + "A") ? "B" : firedIds.has(q + "B") ? "A" : r() < 0.5 ? "A" : "B");
    const cards3 = shuffle([
      ...trueTags.map((id) => face(id, "true")),
      ...trueTags.map((id) => face(TAG[id].pair, "opposite")),
      ...decoyPairs.map((q) => face(q + decoySide(q), "decoy")),
    ], r);
    const level3 = N === 0
      ? { skipped: true, line: fill(F.level3.skippedLine.t), cards: [] }
      : { skipped: false, N, pick: N, prompt: fill(F.level3.prompt[rel === "bestie" ? "bestie" : "friend"].t.replace("{N}", N)), fewTagsLine: N <= 2 ? fill(F.level3.fewTagsLine.t.replace("{N}", N)) : null, cards: cards3 };

    // Level 4: bestie only, when the owner opens sting lines.
    let level4 = null;
    if (rel === "bestie") {
      if (!stings) level4 = { enabled: false, why: "sting lines are off for this link" };
      else {
        const trueId = trueTags[0];
        const shownPairs = new Set(p.shownTags.map(pairOf));
        // The 3 other sting lines never belong to a tag the owner fired (shown or not), and come from pairs with no fired tag first.
        const poolAll = shuffle(lib.tags.filter((t) => allowed.has(pairOf(t.id)) && !shownPairs.has(pairOf(t.id)) && !firedIds.has(t.id)), r);
        const pool = [...poolAll.filter((t) => !firedPairs.has(pairOf(t.id))), ...poolAll.filter((t) => firedPairs.has(pairOf(t.id)))];
        const others = [];
        const otherCh = pool.filter((t) => !trueId || t.chapter !== TAG[trueId].chapter);
        for (const t of [...otherCh.slice(0, 2), ...pool]) {
          if (others.length >= 3) break;
          if (!others.some((o) => pairOf(o.id) === pairOf(t.id))) others.push(t);
        }
        const roastsAll = F.level4.pickTheRoast.roasts.filter((x) => love || !groups.love.pairs.includes(pairOf(x.tag)));
        const topPairs = p.shownTags.slice(0, 3).map(pairOf);
        const tied = roastsAll.filter((x) => topPairs.includes(pairOf(x.tag)));
        const rest = shuffle(roastsAll.filter((x) => !tied.includes(x)), r);
        level4 = {
          enabled: true,
          stingPick: trueId ? {
            prompt: fill(F.level4.stingPick.prompt.t),
            lines: shuffle([{ tag: trueId, t: TAG[trueId].sting, true: true }, ...others.map((t) => ({ tag: t.id, t: t.sting, true: false }))], r),
          } : null,
          pickTheRoast: { prompt: fill(F.level4.pickTheRoast.prompt.t), lines: shuffle([...tied, ...rest].slice(0, 6), r).map((x) => ({ id: x.id, tag: x.tag, t: x.t, ownersTag: p.shownTags.includes(x.tag) ? true : p.shownTags.includes(TAG[x.tag].pair) ? "opposite" : firedIds.has(x.tag) ? "fired, not shown" : false })) },
        };
      }
    }

    return {
      version: kit.version,
      relationship: rel,
      toggles: { loveTags: love, marriageKidsTags: mk, stingLines: stings },
      owner: { type: p.type.name, code: p.type.code, pronoun: pr[0] },
      level1,
      level2,
      level3,
      level4,
    };
  }

  // ---------------------------------------------------------------- friend game scoring
  // Scores one friend's guesses against a deck from buildFriendDeck, per friend.json level1 to level4 and results.
  // guesses: { level1: { R1: 1 | -1, ... }, level2: { "<cardId>": "a" | "b" }, why: { "<cardId>": chipId },
  //            level3: [tagId, ...], level4: { sting: tagId | null, roast: roastId | null } }
  // answers (optional): the owner's own answers. Only the owner's device has them; with them the biggest Level 2
  // surprise is ranked (results.owner.biggestMiss.pickRule). Without them it is null.
  function scoreFriendGame(deck, guesses = {}, answers = null) {
    const F = friendLib();
    const g1 = guesses.level1 || {};
    const l1 = deck.level1.map((q) => {
      const guess = g1[q.axis] === 1 || g1[q.axis] === -1 ? g1[q.axis] : null;
      return { axis: q.axis, guess, truth: q.truth, acceptEither: !!q.acceptEither, why: q.why || null, hit: guess !== null && (!!q.acceptEither || guess === q.truth) };
    });
    const x = l1.filter((r) => r.hit).length;
    const guessedType = l1.every((r) => r.guess !== null)
      ? typeOf(Object.fromEntries(l1.map((r) => [r.axis, { pole: r.guess }])))
      : null;
    const missedAxes = new Set(l1.filter((r) => !r.hit).map((r) => r.axis));

    const chips = new Set(F.level2.whyChips.options.map((o) => o.id));
    const g2 = guesses.level2 || {};
    const why = guesses.why || {};
    const l2cards = deck.level2.skipped ? [] : deck.level2.cards;
    const l2 = l2cards.map((c, order) => {
      const guess = g2[c.id] === "a" || g2[c.id] === "b" ? g2[c.id] : null;
      return { id: c.id, order, guess, answer: c.answer, hit: guess === c.answer, why: chips.has(why[c.id]) ? why[c.id] : null };
    });
    let biggestMiss = null;
    if (answers) {
      for (const r of l2.filter((row) => row.guess !== null && !row.hit)) {
        const card = cardById[r.id];
        const a = readAnswer(card, answers);
        const m = a.kind === "picked" ? friendMatch(card, a.picks) : null;
        if (!m) continue;
        const snap = (F.level2.cards || {})[r.id] || {};
        const axes = snap.axes || [...new Set([...Object.keys(card.friend.a.axes || {}), ...Object.keys(card.friend.b.axes || {})])];
        const score = card.weight * m.score * (axes.some((ax) => missedAxes.has(ax)) ? 1.5 : 1);
        if (!biggestMiss || score > biggestMiss.score) biggestMiss = { id: r.id, score: round(score, 4), guess: r.guess, answer: r.answer, why: r.why };
      }
    }

    const L3 = deck.level3;
    const faces = L3.skipped ? [] : L3.cards;
    const role = Object.fromEntries(faces.map((c) => [c.id, c.role]));
    const picked = (Array.isArray(guesses.level3) ? [...new Set(guesses.level3)] : []).filter((id) => role[id]).slice(0, L3.N || 0);
    const truth = faces.filter((c) => c.role === "true").map((c) => c.id);
    const l3 = L3.skipped ? { skipped: true, z: 0, N: 0, picked: [], getYou: [], dontSee: [], thinkYouAre: [], otherGuesses: [] } : {
      skipped: false,
      N: L3.N,
      picked,
      z: picked.filter((id) => role[id] === "true").length,
      getYou: truth.filter((id) => picked.includes(id)),
      dontSee: truth.filter((id) => !picked.includes(id)),
      thinkYouAre: picked.filter((id) => role[id] === "opposite").map((id) => ({ picked: id, actual: TAG[id].pair })),
      otherGuesses: picked.filter((id) => role[id] === "decoy"),
    };

    let l4 = null;
    if (deck.level4 && deck.level4.enabled) {
      const g4 = guesses.level4 || {};
      const lines = deck.level4.stingPick ? deck.level4.stingPick.lines : [];
      const trueLine = lines.find((l) => l.true) || null;
      const stingPicked = lines.some((l) => l.tag === g4.sting) ? g4.sting : null;
      const roast = deck.level4.pickTheRoast.lines.find((l) => l.id === g4.roast) || null;
      l4 = {
        sting: trueLine ? { picked: stingPicked, truth: trueLine.tag, hit: stingPicked !== null && stingPicked === trueLine.tag } : null,
        roast: roast ? { id: roast.id, tag: roast.tag, ownersTag: roast.ownersTag } : null,
      };
    }

    const N = l3.skipped ? 0 : l3.N;
    const bandSet = F.results.owner.scoreBands.useFor[deck.relationship] || "friend";
    return {
      relationship: deck.relationship,
      level1: { x, rows: l1, guessedType: guessedType && { name: guessedType.name, code: guessedType.code }, exact: !!guessedType && guessedType.code === deck.owner.code },
      level2: { skipped: !!deck.level2.skipped, y: l2.filter((r) => r.hit).length, total: l2.length, rows: l2, biggestMiss },
      level3: l3,
      level4: l4,
      band: x === 6 ? "6" : x >= 4 ? "4-5" : x >= 2 ? "2-3" : "0-1",
      bandSet,
      rate: round((x + l3.z) / (6 + N), 4),
    };
  }

  // Owner-only ranking (friend.json ranking.sort): hit rate (Level 1 + Level 3) / (6 + N), then Level 2 hits, then
  // whoever played first. rows: [{ key, score, playedAt }] with score from scoreFriendGame.
  function rankFriends(rows) {
    return [...rows].sort((a, b) => b.score.rate - a.score.rate || b.score.level2.y - a.score.level2.y || String(a.playedAt).localeCompare(String(b.playedAt)));
  }

  return {
    kit, lib, friendLib, AXES, TAG, pairOf, pairSign, gateOpen, rng, shuffle, CONFIG, allCards, cardById, isTeen, runCards, promptFor, optionVector, readAnswer, buildProfile, cardTagMax, twistOrder, cardLink, rankTags, typeOf, buildResult, profilePosition, predictCard, freezePredictions, checkSealed, friendMatch, friendMapping, pronounsFor, friendFill, buildFriendDeck, scoreFriendGame, rankFriends,
  };
}
