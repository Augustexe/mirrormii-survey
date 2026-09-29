// Player-facing projections of a finished run (RESULT-TEMPLATE.md). Every line is a library line or the player's
// own answer. Ids, scores, masks and research fields stay inside score-core output and never reach these views.
import { S, LIB, KIT } from "./kit.js";
import { resultFor } from "./session.js";

const AXIS = Object.fromEntries(LIB.axes.map((a) => [a.id, a]));
const REL_AXES = ["R1", "R2", "R3"];
const LIFE_AXES = ["L1", "L2", "L3"];
const quote = (text) => `“${String(text).replaceAll("\"", "'").replaceAll("“", "'").replaceAll("”", "'")}”`;

function passLine(why) {
  if (/unfinished/.test(why || "")) return "Genii passed: this side isn't finished yet.";
  if (/flex/.test(why || "")) return "Genii passed: you're flex here.";
  return "Genii passed: not enough to go on yet.";
}

export function shareProjection(result) {
  return {
    typeName: result.share.typeName,
    tags: result.share.tags.map((t) => ({ name: t.name, heart: t.heart })),
    invite: result.share.invite,
  };
}

export function shareText(share) {
  return [share.typeName, ...share.tags.map((t) => `${t.name}: ${t.heart}`), share.invite].join("\n");
}

// The owner's full result page. ownerOnly marks lines that never leave this view.
export function resultView(state) {
  const { profile, result, sealed } = resultFor(state);
  const unfinished = new Set(profile.type.unfinished);
  const part = (ax) => (unfinished.has(ax) ? "?" : profile.axes[ax].poleName);
  const chip = (row) => ({ pole: row.pole, line: row.line, flex: row.flex, unfinished: row.unfinished, label: `${AXIS[row.axis].plus} or ${AXIS[row.axis].minus}` });
  const cards = Object.fromEntries(KIT.finale.map((c) => [c.id, c]));
  return {
    typeName: result.type.name,
    code: `${REL_AXES.map(part).join("·")} | ${LIFE_AXES.map(part).join("·")}`,
    badges: result.type.badges.map((b) => ({ badge: b.badge, line: b.line, on: `${AXIS[b.axis].plus} or ${AXIS[b.axis].minus}` })),
    halves: result.halves.map((h) => ({ side: h.side, name: h.name, desc: h.desc, chips: h.axes.map(chip) })),
    stings: result.stings,
    hearts: result.hearts,
    tags: result.tags.map((t) => ({ key: t.id, name: t.name, strength: t.strength, quotes: t.youToldGenii.map((q) => quote(q.said)), sting: t.sting, heart: t.heart })),
    calls: result.calls.map((c) => c.line),
    // Nothing is invented when no tag qualifies: the page says why instead.
    noTagsReason: result.tags.length ? null : profile.counts.rushed * 2 >= profile.counts.answered ? "rushed" : "thin",
    plotTwist: result.plotTwist ? result.plotTwist.line : null,
    guesses: {
      line: sealed.line,
      rows: sealed.rows.map((r) => ({
        key: r.id,
        prompt: S.promptFor(cards[r.id], state.setup),
        status: r.status,
        guess: r.status === "hit" || r.status === "miss" ? r.predictedText : null,
        answer: r.answerText || null,
        note: r.status === "pass" ? passLine(r.passWhy) : r.status === "skipped" || r.status === "unanswered" ? "You kept this one to yourself." : r.status === "hit" ? "Genii called it." : "You surprised Genii.",
      })),
    },
    share: shareProjection(result),
    ownerOnly: { stings: true, tagStings: true, plotTwist: true },
  };
}
