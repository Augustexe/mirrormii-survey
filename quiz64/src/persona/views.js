// Player-facing projections of a finished run. The final screen is Stories (LAUNCH-SPEC sections 21 and 23): every line is
// a library line in the player's voice. Answers, ids, scores and research fields stay inside score-core output and
// never reach these views.
import { S, LIB, KIT } from "./kit.js";
import { resultFor } from "./session.js";
import { UI_COPY, buildStories, voiceOf } from "./stories/story-data.js";
import { sceneTitle } from "./scene-titles.js";
import { HALVES } from "./stats.js";
import { COMBO_LINES, comboLine } from "./combo-lines.js";

// The share card: the one title (the people archetype) with its story line (decision 1a), both archetype names under
// their kickers as data, trait names with their heart lines, the invite. Never stings or answers.
export function shareProjection(result, stories = null) {
  if (stories) return stories.share;
  const half = (side) => (result.halves || []).find((h) => h.side === side) || {};
  const def = (list, h) => ((list || []).find((x) => x.code === h.code) || {}).define || "";
  const people = half("relationship");
  const life = half("life");
  return {
    title: { name: people.name, line: comboLine(COMBO_LINES, people.code, life.code, "fun") || "" },
    names: [
      { label: HALVES.people.kicker, name: people.name, define: def(LIB.relationship, people) },
      { label: HALVES.life.kicker, name: life.name, define: def(LIB.life, life) },
    ],
    tags: (result.share ? result.share.tags : []).map((t) => ({ name: t.name, heart: t.heart })),
    invite: UI_COPY.invite,
  };
}

// The text that rides along with a shared image: the title and its line first, then the day-to-day half, the traits and
// the invite.
export function shareText(share) {
  const title = share.title && share.title.name ? [`${share.title.name}${share.title.line ? `. ${share.title.line}` : ""}`] : [];
  const rest = (share.names || []).filter((n) => !share.title || n.name !== share.title.name).map((n) => `${n.label}: ${n.name}`);
  const names = title.length ? rest : (share.names || []).map((n) => `${n.label}: ${n.name}${n.define ? `. ${n.define}` : ""}`);
  return [...title, ...names, ...share.tags.map((t) => `${t.name}: ${t.heart}`), share.invite].join("\n");
}

// A sealed card's prompt in the player's voice (Heart to heart reads card.heart.prompt when a card has one).
function sealedPrompt(id, setup, wording) {
  const card = KIT.finale.find((c) => c.id === id);
  if (!card) return "";
  if (wording === "heart" && card.heart && typeof card.heart.prompt === "string") return card.heart.prompt;
  try { return S.promptFor(card, setup); } catch { return card.prompt || ""; }
}

// The reveal art: the run id seeds the mirror's crack pattern, and every answered card is one shard in its chapter's
// tint, in the order it was answered. Only chapters leave this function; no card id, option or answer does.
export function mirrorFor(state) {
  const ids = Object.keys((state && state.answers) || {}).filter((k) => !k.endsWith(".flip"));
  const filled = ids.map((id) => {
    const card = S.cardById ? S.cardById[id] : null;
    const value = state.answers[id];
    return { chapter: card && card.chapter != null ? card.chapter : "extras", skipped: typeof value === "string" };
  });
  return { seed: String((state && state.runId) || "mirror"), filled, panes: Object.keys((state && state.finale) || {}).length };
}

// A locked guess, as the calls screen shows it: what the card tested (its main lean, by the library's topic name), and
// for a hit the pole Genii guessed on that lean. The guess comes from the frozen predictions, never from the answer.
// The title is the card's scene in a few words: kit-strip.mjs derives it at build time before the fingerprint is
// stripped; node (the full kit) derives the same words from the fingerprint.
export function callInfo(state, id) {
  const card = KIT.finale.find((c) => c.id === id);
  if (!card) return null;
  const axis = card.checks && card.checks.primary;
  const meta = axis ? LIB.axes.find((a) => a.id === axis) : null;
  const frozen = state && state.frozen && Array.isArray(state.frozen.predictions) ? state.frozen.predictions.find((p) => p.id === id) : null;
  const pole = frozen && meta && frozen.side ? (frozen.side > 0 ? meta.plus : meta.minus) : null;
  return { topic: (meta && meta.topic) || "", title: card.title || sceneTitle(card.fp) || "", pole, axis: axis || null };
}

export const chapterOf = (id) => {
  const card = S.cardById ? S.cardById[id] : null;
  return card && typeof card.chapter === "number" ? card.chapter : null;
};

// The owner's result: the story screens plus the guess sheet.
export function resultView(state) {
  const { profile, result, sealed } = resultFor(state);
  const voice = voiceOf(state.lobby);
  const stories = buildStories({
    result,
    profile,
    sealed,
    lib: LIB,
    voice,
    promptFor: (id) => sealedPrompt(id, state.setup, voice === "heart" ? "heart" : "fun"),
    callFor: (id) => callInfo(state, id),
    chapterOf,
    mirror: mirrorFor(state),
    lines: COMBO_LINES,
  });
  return { ...stories, share: shareProjection(result, stories) };
}
