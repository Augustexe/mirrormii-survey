// The card's answer rules, pure (no React), so the evidence test can drive them against the legacy card
// (tests/play-evidence.test.mjs). Every value the new card hands to onAnswer is built here.
// Evidence first (LAUNCH-SPEC section 1): these keep exactly what the previous card sent for the same taps.

export const EXIT_LABEL = Object.freeze({ skip: "Skip", not_my_life: "Not my life", no_recent: "No recent example" });
export const EXIT_KEYS = Object.freeze({ s: "skip", n: "not_my_life", r: "no_recent" });

// Real moments show "No recent example" first (5.7); the ids and what they send never change.
export function exitOrder(card) {
  const exits = [...(card.exits || [])];
  if (card.type !== "real") return exits;
  return [...exits.filter((e) => e === "no_recent"), ...exits.filter((e) => e !== "no_recent")];
}

// Receipts: tap toggles an item; "None of these" stands alone (ticking it clears the others, ticking an item clears it).
export function toggleReceipt(card, picks, i) {
  const none = !!card.options[i].none;
  if (picks.includes(i)) return picks.filter((x) => x !== i);
  return none ? [i] : [...picks.filter((x) => !card.options[x].none), i];
}
export const receiptsValue = (picks) => [...picks].sort((a, b) => a - b);
export const receiptsTally = (card, picks) => picks.filter((x) => !card.options[x].none).length;

// Pick two: tap toggles; the value is the picks in tap order once `need` are picked.
export const togglePick = (picks, i) => (picks.includes(i) ? picks.filter((x) => x !== i) : [...picks, i]);

// Rank it. `order` is the full list top to bottom; the first `placed` items are the ones placed by tap.
// Tapping an unplaced item places it next; tapping a placed item takes it back (the rest keep their order), exactly
// like the previous tap-in-order card. A drag or a keyboard move sets the whole order at once.
export function initialRank(card) {
  return { order: card.options.map((_, i) => i), placed: 0, moved: false };
}
export function rankTap(rank, i) {
  const { order, placed } = rank;
  const at = order.indexOf(i);
  if (at < 0) return rank;
  if (at < placed) {
    const head = order.slice(0, placed).filter((x) => x !== i);
    const tail = order.slice(placed).concat(i).sort((a, b) => a - b);
    return { order: [...head, ...tail], placed: placed - 1, moved: false };
  }
  const head = order.slice(0, placed).concat(i);
  const tail = order.slice(placed).filter((x) => x !== i);
  return { order: [...head, ...tail], placed: placed + 1, moved: false };
}
export function rankReorder(rank, order) {
  return { order: [...order], placed: order.length, moved: true };
}
export function rankMove(rank, i, delta) {
  const order = [...rank.order];
  const at = order.indexOf(i);
  const to = Math.max(0, Math.min(order.length - 1, at + delta));
  if (at < 0 || to === at) return rank;
  order.splice(at, 1);
  order.splice(to, 0, i);
  return { order, placed: order.length, moved: true };
}
// Done: after a drag or a keyboard move, after every item is placed by tap, or untouched (the starting order counts
// when the player confirms it). Partly placed by tap: finish placing first.
export const rankReady = (rank) => rank.moved || rank.placed === 0 || rank.placed === rank.order.length;
export const rankValue = (rank) => [...rank.order];

// Prompt size class by character count (4.1): s up to 70, m up to 120, l above.
export function promptSize(text) {
  const n = String(text || "").length;
  return n <= 70 ? "s" : n <= 120 ? "m" : "l";
}

// Role lines: "Title. The line." renders as a role title and a line (5.7 Role).
const ROLE = /^([A-Z][A-Za-z' -]{1,22})\.\s+(.+)$/;
export function parseRole(text) {
  const m = ROLE.exec(String(text || ""));
  return m ? { title: m[1], line: m[2] } : null;
}

// Short-tile grid for pick two (5.7 Pick two). The spec's 42-character line is raised to 72 so every six-option
// card in the bank fits above the fold on a phone (the fold rule outranks the column count).
export const PICK_TWO_GRID_MAX = 72;
export const pickTwoGrid = (texts) => texts.every((t) => String(t).length <= PICK_TWO_GRID_MAX);
