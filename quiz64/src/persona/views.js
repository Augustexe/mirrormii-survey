// Player-facing projections of a finished run. The final screen is Stories (LAUNCH-SPEC section 21): every line is
// a library line in the player's voice. Answers, ids, scores and research fields stay inside score-core output and
// never reach these views.
import { S, LIB, KIT } from "./kit.js";
import { resultFor } from "./session.js";
import { buildStories, voiceOf } from "./stories/story-data.js";

// The share card: both archetype names, trait names with their heart lines, the invite. Never stings or answers.
export function shareProjection(result, stories = null) {
  if (stories) return stories.share;
  const [people, life] = (result.halves || []).map((h) => h.name);
  return {
    names: [{ label: "With your people", name: people }, { label: "With your life", name: life }],
    tags: (result.share ? result.share.tags : []).map((t) => ({ name: t.name, heart: t.heart })),
    invite: (result.share && result.share.invite) || "Do you really know me?",
  };
}

export function shareText(share) {
  return [...share.names.map((n) => `${n.label}: ${n.name}`), ...share.tags.map((t) => `${t.name}: ${t.heart}`), share.invite].join("\n");
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

// The owner's result: nine story screens plus the optional guess sheet.
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
    mirror: mirrorFor(state),
  });
  return { ...stories, share: shareProjection(result, stories) };
}
