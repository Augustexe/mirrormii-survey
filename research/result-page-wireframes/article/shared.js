// Shared model for the three Evidence Article concepts. Reads data.json (built by build-data.mjs from the app's own
// scorer and story projection) and turns it into one article model per voice. Concept files only lay it out.
// Rule kept here, not in the concepts: every claim is a library line picked by evidence, or a frame from
// article-copy.json that carries no claim of its own. No answer is quoted, no percentage is shown.

export async function loadData() {
  const res = await fetch("data.json", { cache: "no-cache" });
  return res.json();
}

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
const fill = (t, vars) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ""));

export function getVoice() {
  try { const v = new URLSearchParams(location.search).get("voice") || localStorage.getItem("mm-article-voice"); return v === "heart" ? "heart" : "fun"; } catch { return "fun"; }
}
export function setVoice(v) {
  try { localStorage.setItem("mm-article-voice", v); } catch { /* private mode: the toggle still works for this view */ }
}

export function buildArticle(data, voice) {
  const V = data.voices[voice];
  const N = data.newCopy;
  const t = (entry, vars = {}) => fill(entry ? entry[voice] || entry.fun : "", vars);
  const slide = (id) => V.slides.find((s) => s.id === id) || null;
  const names = slide("names");
  const read = slide("read");
  const map = slide("map");
  const knows = slide("knows");
  const rooms = slide("rooms");
  const insight = slide("insight");
  const traits = slide("traits");
  const stings = slide("stings");
  const calls = slide("calls");
  const share = slide("share");
  const app = slide("app");
  const lib = V.library;

  // Stats: the sheet row plus what the other end looks like at the same level (library sheet lines, both ends).
  const statLib = Object.fromEntries(lib.stats.map((s) => [s.stat, s]));
  const rows = map.groups.flatMap((g) => g.rows.map((r) => ({ ...r, group: g.label })));
  const sheet = rows.map((r) => {
    const L = statLib[r.stat];
    const band = r.band === "both" ? "clear" : r.band || "clear";
    const otherIsPlus = r.leadEnd === L.minusEnd;
    const otherLine = L.sheet[otherIsPlus ? "plus" : "minus"][band] || L.sheet[otherIsPlus ? "plus" : "minus"].clear;
    const know = (knows.findings.find((f) => f.stat === r.stat) || {}).line || null;
    return {
      stat: r.stat, group: r.group, a: r.a, b: r.b, leadEnd: r.leadEnd, otherEnd: r.otherEnd, leadSide: r.leadSide, pips: r.pips, level: r.level,
      flex: r.flex, badge: r.badge, note: r.note, otherLine, know, strength: r.strength, axis: r.key,
      badgeNote: r.badge === "signature" ? map.signature.note : r.badge === "wild" ? map.wild.note : null,
      badgeLabel: r.badge === "signature" ? map.signature.label : r.badge === "wild" ? map.wild.label : null,
    };
  });

  // Core traits with where each comes from (a top trait by name, or a stat end).
  const core = traits.core.filter((c) => !c.private).map((c) => {
    const [stat, end] = String(c.source).split(" · ");
    const from = c.kind === "stat" ? t(N.core.statFrom, { stat, end }) : c.source;
    // A stat-backed trait reads the stat's "what Genii knows" line, so the sheet and the traits never repeat a line.
    const row = c.kind === "stat" ? sheet.find((r) => r.stat === stat) : null;
    if (row) row.inCore = true;
    return { keyword: c.keyword, from, line: (row && row.know) || c.line, kind: c.kind };
  });

  // Rooms: every room with a clearly evidenced lean; the room that leans against the overall end is "the flip".
  const overallEnd = Object.fromEntries(rows.map((r) => [r.stat, r.leadEnd]));
  const roomList = lib.roomsAll.map((rm) => ({ chapter: rm.chapter, room: rm.room, lines: rm.lines.slice(0, 2) }));
  // A tag-kind room from the story (a room with no clear stat lean) joins with its one line.
  for (const r of rooms ? rooms.rows : []) if (r.kind === "tag" && !roomList.find((x) => x.chapter === r.chapter)) roomList.push({ chapter: r.chapter, room: r.room, lines: [{ line: r.line, stat: null, end: r.lead }] });
  const order = [3, 5, 6, 2, 4, 1, 7];
  roomList.sort((a, b) => order.indexOf(a.chapter) - order.indexOf(b.chapter));
  let flip = null;
  for (const rm of roomList) for (const ln of rm.lines) if (ln.differs && !flip) flip = { room: rm.room, chapter: rm.chapter, stat: ln.stat, roomEnd: ln.end, overall: overallEnd[ln.stat], line: ln.line };
  if (flip) flip.sentence = t(N.rooms.flipLine, { overall: flip.overall, room: flip.room, roomEnd: flip.roomEnd });

  // Two sides at one table: strongest people stat end x strongest life stat end, from the crossover table.
  const endKey = (r) => `${r.axis}${statLib[r.stat].plusEnd === r.leadEnd ? "+" : "-"}`;
  const byStrength = (list) => list.filter((r) => !r.flex).sort((x, y) => y.pips - x.pips || y.strength - x.strength);
  const peopleRows = byStrength(sheet.filter((r) => r.axis.startsWith("R")));
  const lifeRows = byStrength(sheet.filter((r) => r.axis.startsWith("L")));
  const cross = {};
  for (const p of peopleRows) for (const l of lifeRows) {
    const cell = N.crossover[`${endKey(p)}|${endKey(l)}`];
    if (cell && !cross[cell.type]) cross[cell.type] = { a: `${p.leadEnd}`, aStat: p.stat, b: `${l.leadEnd}`, bStat: l.stat, line: cell[voice] || cell.fun };
  }

  // Party: click with (the wild card's half with that stat flipped) and the opposite (every pole flipped).
  const arche = data.archetypes;
  const peopleName = names.people.name;
  const lifeName = names.life.name;
  const codeOf = (name) => (arche.find((a) => a.name === name) || {}).code || "";
  const FLIP = { We: "Me", Me: "We", Direct: "Soft", Soft: "Direct", Classic: "Own", Own: "Classic", Steady: "Venture", Venture: "Steady", Push: "Easy", Easy: "Push", Rules: "Context", Context: "Rules" };
  const flipCode = (code, only = null) => code.split("·").map((p, i) => (only === null || only === i ? FLIP[p] : p)).join("·");
  const nameOf = (code) => (arche.find((a) => a.code === code) || {}).name || "";
  let click = null;
  const wild = sheet.find((r) => r.badge === "wild");
  if (wild) {
    const onLife = wild.axis.startsWith("L");
    const idx = Number(wild.axis[1]) - 1;
    const code = flipCode(codeOf(onLife ? lifeName : peopleName), idx);
    click = { name: nameOf(code), label: t(N.party.clickLabel), line: t(N.party.click), via: wild.stat, pair: onLife ? [peopleName, nameOf(code)] : [nameOf(code), lifeName] };
  }
  const opposite = { a: nameOf(flipCode(codeOf(peopleName))), b: nameOf(flipCode(codeOf(lifeName))), label: t(N.party.oppositeLabel), line: t(N.party.opposite) };

  // Said for you: the first-person heart lines of both halves and the shown traits (never a private trait).
  const hearts = [...lib.halves.map((h) => ({ line: h.heart, from: h.name })), ...lib.tags.filter((x) => !x.locked18).map((x) => ({ line: x.heart, from: x.name }))].filter((h) => h.line);
  const bio = `${peopleName}. ${lifeName}. ${core.slice(0, 3).map((c, i) => (i ? c.keyword.toLowerCase() : c.keyword)).join(", ")}.`;

  return {
    voice, t, N,
    readTime: t(N.readTime),
    cover: { dek: t(N.cover.dek), issue: t(N.cover.issue), people: names.people, life: names.life, hook: names.hook, keywords: names.keywords, sub: names.sub },
    lede: { title: t(N.lede), lines: read.lines, bodies: read.bodies },
    sheet: { kicker: map.kicker, title: t(N.sheet.title), intro: t(N.sheet.intro), sub: map.sub, rows: sheet, yours: t(N.sheet.yours), other: t(N.sheet.other), showOther: t(N.sheet.showOther), signature: map.signature, wild: map.wild },
    knows: { kicker: knows.kicker, title: knows.title, findings: knows.findings },
    core: { kicker: traits.kicker, title: t(N.core.title), items: core, fromLabel: t(N.core.from) },
    rooms: { kicker: rooms ? rooms.kicker : "Room by room", title: rooms ? rooms.title : "", intro: t(N.rooms.intro), list: roomList, flip, flipTitle: t(N.rooms.flipTitle), differs: rooms ? rooms.differs : "" },
    insight: { kicker: insight.kicker, belief: insight.parts.belief, behavior: insight.parts.behavior, line: insight.line },
    said: { title: t(N.said.title), intro: t(N.said.intro), hearts },
    stings: { kicker: stings.kicker, title: stings.title, intro: t(N.stings.intro), lines: stings.stings },
    record: calls ? { kicker: calls.kicker, title: t(N.record.title), headline: calls.title, intro: calls.intro, exact: calls.exact, count: calls.count, of: calls.of, key: calls.key, rows: calls.rows.map((r) => ({ title: r.title, status: r.status, near: r.near, shown: r.shown, side: r.side })) } : null,
    sides: { title: t(N.sides.title), intro: t(N.sides.intro, { people: peopleName, life: lifeName }), team: cross.team ? { ...cross.team, label: t(N.sides.team) } : null, clash: cross.clash ? { ...cross.clash, label: t(N.sides.clash) } : null },
    party: { title: t(N.party.title), click, opposite },
    bio: { title: t(N.bio.title), text: bio, copy: t(N.bio.copy), copied: t(N.bio.copied) },
    closing: t(N.closing),
    share: { kicker: share.kicker, sub: share.sub, challenge: share.challenge, card: share.share },
    app: { kicker: app.kicker, title: app.title, body: app.body, button: app.button, store: app.store, note: app.note, snap: app.snap, lives: app.lives },
    labels: { voiceFun: N.voice.fun, voiceHeart: N.voice.heart, save: t(N.saveStory), fog: t(N.fog), flipHint: t(N.flipHint), contents: t(N.contents) },
  };
}

// Five pips, filled to the stat's level (a flex stat shows two half-lit pips).
export function pipsHTML(pips, flex = false, cls = "pips") {
  let h = `<span class="${cls}" aria-hidden="true">`;
  for (let i = 1; i <= 5; i++) h += `<i class="${flex ? (i === 2 || i === 4 ? "half" : "") : i <= pips ? "on" : ""}"></i>`;
  return `${h}</span>`;
}

export const reducedMotion = () => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } };

// Voice switch: a two-option radio group; re-renders the page in place and keeps scroll position by section.
export function mountVoiceSwitch(el, voice, labels, onChange) {
  el.setAttribute("role", "radiogroup");
  el.setAttribute("aria-label", "How Genii talks");
  el.innerHTML = ["fun", "heart"].map((v) => `<button type="button" role="radio" aria-checked="${v === voice}" data-v="${v}">${esc(v === "fun" ? labels.voiceFun.fun : labels.voiceHeart.heart)}</button>`).join("");
  el.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b || b.getAttribute("aria-checked") === "true") return;
    setVoice(b.dataset.v);
    el.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    onChange(b.dataset.v);
  });
}
