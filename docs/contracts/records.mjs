// Reference mappings from the app's own objects to the backend contracts in this folder (README.md). Plain ES module,
// no I/O: it imports the web app's session, views and friend modules and only reshapes what they return, so a backend
// or a future network layer in quiz64 can reuse it as is. scripts/validate-contracts.mjs runs every function here on
// real runs and validates the output against the schemas, so a change in the app that breaks a contract fails a test.
//
//   buildResultRecord(state)            -> result.schema.json (the finished result, ids plus the copy the player saw)
//   buildPublicChallenge(parsed, view)  -> friend-challenge.schema.json#/$defs/publicChallenge (the deck without truth)
//   buildChallengeRecord(state, ch)     -> friend-challenge.schema.json#/$defs/challengeRecord (server-held answer key)
import { resultFor, voiceFor } from "../../quiz64/src/persona/session.js";
import { resultView } from "../../quiz64/src/persona/views.js";
import { challengeBody } from "../../quiz64/src/persona/friend.js";
import { KIT_ID } from "../../quiz64/src/persona/kit.js";

export const RESULT_SCHEMA = "genii.persona.result/1";
export const CHALLENGE_SCHEMA = "genii.persona.challenge/1";

const slideOf = (view, id) => view.slides.find((s) => s.id === id) || null;
const half = (h) => ({ code: h.code, kicker: h.label, name: h.name, define: h.define, read: h.read, desc: h.desc });

// The finished result of one run. Everything the reveal and the long read show is here, keyed by ids a backend can
// join on (archetype code, axis id, tag id, chapter, sealed card id), with the copy in the player's voice. Never any
// answer text, option index or scorer number beyond the lean and the pips (answers live only in the stored run).
export function buildResultRecord(state) {
  const { profile, result, sealed } = resultFor(state);
  const view = resultView(state);
  const names = slideOf(view, "names");
  const map = slideOf(view, "map");
  const knows = slideOf(view, "knows");
  const rooms = slideOf(view, "rooms");
  const insight = slideOf(view, "insight");
  const traits = slideOf(view, "traits");
  const stings = slideOf(view, "stings");
  const share = slideOf(view, "share");
  const calls = slideOf(view, "calls");
  const relCode = result.halves.find((h) => h.side === "relationship").code;
  const lifeCode = result.halves.find((h) => h.side === "life").code;
  const opposite = share && share.opposite ? share.opposite : null;
  return {
    schema: RESULT_SCHEMA,
    kit: KIT_ID,
    runId: state.runId,
    completedAt: state.updatedAt,
    voice: voiceFor(state),
    lobby: { depth: state.lobby.depth, rooms: [...state.lobby.rooms] },
    archetype: {
      people: { ...half(names.people), code: relCode },
      life: { ...half(names.life), code: lifeCode },
      opposite,
    },
    axes: map.groups.flatMap((g, gi) => g.rows.map((r) => ({
      axis: r.key,
      half: gi === 0 ? "people" : "life",
      stat: r.stat,
      pole: r.flex || r.unfinished ? null : r.lead,
      end: r.flex || r.unfinished ? null : r.leadEnd,
      sign: r.flex || r.unfinished ? 0 : r.side === "right" ? 1 : -1,
      strength: Math.round(Math.abs(profile.axes[r.key].norm) * 1000) / 1000,
      cards: profile.axes[r.key].cards,
      pips: r.pips,
      level: r.levelKey,
      levelWord: r.level,
      flex: r.flex,
      unfinished: r.unfinished,
      badge: r.badge || null,
      line: r.note,
    }))),
    findings: knows.findings.map((f) => ({ axis: f.key, kind: f.kind, end: f.kind === "flex" ? null : f.leadEnd, level: f.level, tier: f.tier, line: f.line })),
    tags: traits.tags.map((t) => ({ id: t.key, name: t.name, chapter: t.chapter, strength: t.strength, level: t.level, private: t.private, line: t.line, heart: t.heart })),
    coreTraits: traits.core.map((k) => ({ keyword: k.keyword, kind: k.kind, source: k.kind === "tag" ? k.tag : k.axis, line: k.line, private: k.private })),
    rooms: rooms ? rooms.rows.map((r) => ({ chapter: r.chapter, room: r.room, kind: r.kind, axis: r.axis || null, tag: r.tag || null, end: r.kind === "axis" ? r.leadEnd : null, level: r.level, differs: r.differs, line: r.line })) : [],
    insight: { line: insight.line, from: insight.from },
    stings: stings ? [...stings.stings] : [],
    calls: {
      called: sealed.called,
      exact: sealed.exact,
      rows: sealed.rows.map((r) => {
        const shown = calls ? calls.rows.find((x) => x.key === r.id) : null;
        return { card: r.id, axis: shown ? shown.axis : null, status: r.status, near: shown ? shown.near : false, end: shown ? shown.side : null };
      }),
    },
    share: {
      names: view.share.names.map((n) => ({ label: n.label, name: n.name, define: n.define || "" })),
      keywords: [...view.share.keywords],
      tags: view.share.tags.map((t) => ({ name: t.name, line: t.heart, kind: t.kind })),
      invite: view.share.invite,
      url: view.share.url,
    },
    counts: { ...profile.counts },
    empty: traits.empty || null,
  };
}

// What a backend returns to the friend who opens a challenge: the playable deck with no truth in it. Today the friend's
// device gets the truth in the link (friendDeckView carries truth, answer and role); a server keeps those and scores
// the submission itself.
export function buildPublicChallenge(parsed, view) {
  return {
    schema: CHALLENGE_SCHEMA,
    id: parsed.id,
    kit: KIT_ID,
    rel: parsed.rel,
    owner: { name: parsed.name, pronoun: parsed.pronoun },
    emoji: parsed.emoji,
    invite: parsed.invite,
    level1: view.level1.map((q) => ({ axis: q.axis, prompt: q.prompt, options: q.options.map((o) => ({ pole: o.pole, t: o.t })), eitherCounts: q.acceptEither })),
    level2: view.level2.skipped ? { skipped: true, line: view.level2.line, cards: [] } : { skipped: false, cards: view.level2.cards.map((c) => ({ id: c.id, prompt: c.prompt, a: c.a, b: c.b, order: c.order })) },
    level3: view.level3.skipped ? { skipped: true, line: view.level3.line, cards: [] } : { skipped: false, pick: view.level3.N, prompt: view.level3.prompt, fewTagsLine: view.level3.fewTagsLine, cards: view.level3.cards.map((c) => ({ id: c.id, name: c.name, heart: c.heart })) },
    level4: view.level4 ? {
      stingPick: view.level4.stingPick ? { prompt: view.level4.stingPick.prompt, lines: view.level4.stingPick.lines.map((l) => ({ tag: l.tag, t: l.t })) } : null,
      pickTheRoast: { prompt: view.level4.pickTheRoast.prompt, lines: view.level4.pickTheRoast.lines.map((l) => ({ id: l.id, t: l.t })) },
    } : null,
  };
}

// What a backend stores for one challenge: the owner's choices plus the answer key that today rides in the link body
// (a, b, c.t, d.t). The friend never receives this object.
export function buildChallengeRecord(state, ch, { now = new Date().toISOString(), ttlDays = 30 } = {}) {
  const body = challengeBody(state, ch);
  const expires = new Date(Date.parse(now) + ttlDays * 86400000).toISOString();
  return {
    schema: CHALLENGE_SCHEMA,
    id: ch.id,
    kit: KIT_ID,
    ownerRunId: state.runId,
    rel: ch.rel,
    name: ch.name,
    pronoun: state.setup.pronoun,
    emoji: ch.emoji,
    invite: ch.invite,
    seed: ch.seed,
    toggles: { love: ch.love, mk: ch.mk, stings: ch.stings, showType: ch.showType },
    answerKey: {
      level1: body.a.map(([truth, why]) => ({ truth, either: why !== 0 })),
      level2: body.b.map(([card, side]) => ({ card, side })),
      level3: body.c ? { cards: body.c.d, truth: body.c.t } : null,
      level4: body.d ? { lines: body.d.l, truth: body.d.t || null, roasts: body.d.r } : null,
    },
    createdAt: ch.createdAt,
    expiresAt: expires,
    status: "open",
  };
}
