// The shard rail's groups (5.8), pure. One group per open chapter in play order (then the bonus cards), each with its
// size and how many of its cards are answered. Sizes come from chapterProgress when PersonaApp passes it; chapters that
// have not started yet share the rest of the run evenly (the picker sizes them when they start).

const ORDER = [1, 2, 3, 4, 5, 6, 7];

function spread(n, parts) {
  if (parts <= 0) return [];
  const base = Math.floor(n / parts);
  const extra = n - base * parts;
  return Array.from({ length: parts }, (_, i) => Math.max(0, base + (i < extra ? 1 : 0)));
}

export function railGroups(step, progress = null) {
  if (!step || step.kind === "lock") return { finale: false, groups: [], total: 0, current: -1 };
  if (step.phase === "finale") {
    return { finale: true, groups: [], panes: step.size || 8, done: Math.max(0, (step.index || 1) - 1), total: step.size || 8, current: (step.index || 1) - 1 };
  }
  const total = step.total || 40;
  const current = step.resolved;
  const extra = step.phase === "extra";
  const p = progress && typeof progress === "object" && Object.keys(progress).length ? progress : null;
  let groups;
  if (p) {
    const open = ORDER.filter((id) => !p[id] || p[id].open !== false);
    groups = open.map((id) => {
      const isCurrent = !extra && id === step.chapter;
      const info = p[id] || { done: 0, total: 0 };
      if (isCurrent) return { key: id, chapter: id, size: step.size, done: step.index - 1, current: true };
      return { key: id, chapter: id, size: info.total || 0, done: Math.min(info.done || 0, info.total || 0), current: false, known: !!info.total };
    });
    if (extra) groups.push({ key: "extra", chapter: "extras", size: step.size, done: step.index - 1, current: true });
    const known = groups.reduce((a, g) => a + (g.current || g.known ? g.size : 0), 0);
    const unknown = groups.filter((g) => !g.current && !g.known);
    const shares = spread(Math.max(unknown.length, total - known), unknown.length);
    unknown.forEach((g, i) => { g.size = Math.max(1, shares[i]); g.done = 0; });
  } else {
    const count = extra ? (step.chapters || 1) : step.chapters || 1;
    const ordinal = extra ? count + 1 : step.ordinal || 1;
    const doneBefore = Math.max(0, current - (step.index - 1));
    const before = spread(doneBefore, ordinal - 1);
    const after = extra ? [] : spread(Math.max(0, total - doneBefore - step.size), count - ordinal);
    groups = [
      ...before.map((n, i) => ({ key: `b${i}`, chapter: null, size: Math.max(1, n), done: Math.max(1, n), current: false })),
      extra ? { key: "extra", chapter: "extras", size: step.size, done: step.index - 1, current: true } : { key: step.chapter, chapter: step.chapter, size: step.size, done: step.index - 1, current: true },
      ...after.map((n, i) => ({ key: `a${i}`, chapter: null, size: Math.max(1, n), done: 0, current: false })),
    ];
  }
  // Global slot index of each group's first shard, so the current card's slot can be found.
  let at = 0;
  for (const g of groups) { g.start = at; at += g.size; }
  return { finale: false, groups, total: at, current };
}

// The mosaic's filled shards in answer order ({ chapter } per answered card), for MirrorArch.
export function filledShards(rail) {
  if (!rail || rail.finale) return [];
  const out = [];
  for (const g of rail.groups) for (let i = 0; i < g.done; i++) out.push({ chapter: g.chapter || "extras" });
  return out;
}
