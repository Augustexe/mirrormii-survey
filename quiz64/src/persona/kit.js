// The maintained persona quiz V2 kit, bound once for the web app. Content and scoring come from
// research/persona-quiz-v2/final: cards.json, library.json and friend.json are the content, score-core.mjs is the
// same deterministic scorer the reference CLI, simulator and kit tests use. Nothing here re-implements scoring.
import cards from "../../../research/persona-quiz-v2/final/cards.json" with { type: "json" };
import library from "../../../research/persona-quiz-v2/final/library.json" with { type: "json" };
import friend from "../../../research/persona-quiz-v2/final/friend.json" with { type: "json" };
import { createScorer } from "../../../research/persona-quiz-v2/final/score-core.mjs";

export const S = createScorer({ kit: cards, lib: library, friend });
export const KIT = cards;
export const LIB = library;
export const FRIEND = friend;

// Saved runs and links are only valid against the kit they were made with.
export const KIT_ID = `${cards.version}@${cards.built}/${library.built}/${friend.version}`;

export const AXES = S.AXES;
export const TAG = S.TAG;
export const CHAPTERS = cards.chapters.map((ch) => ({ id: ch.n, title: ch.title, intro: ch.intro }));
