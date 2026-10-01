# Question pack (`card.schema.json`)

**Today.** `research/persona-quiz-v2/final/cards.json`, merged from `bank/*.json` by `merge-bank.mjs`. The readable export and how the bank is organized: [../question-pack/QUESTION-PACK.md](../question-pack/QUESTION-PACK.md).

Shape: `chapters[7]` (n, title, intro, cards in authored order), `extras[12]` (axis cards, `chapter: "extra"`, `axisFor`), `finale[24]` (sealed pool; 8 drawn per run, `checks`), plus `weights`, `exits` and `flow`.

One card: `id`, `type` (13 formats), `grade` and `weight` (filled from the format by the merge; absurd-world cards capped at 0.35), `world`, `sq`, `prompt` and `options[].t` (Make it fun), `heart` (Heart to heart: prompt, options in the same order, optional thread), per option `axes` (-2 to +2, at most 2) and `tags` (strength 1 to 3, at most 3), optional `emotion`, `none`, `circumstance`, `depends`; `privacy` (normal, intimate), `exits`, optional `friend` (third person, sides a and b), `follows`, `round`, `pick`, `thread`.

Authoring-only fields (`mask`, `fp`, `ae` and others) are stripped from the app bundle by `quiz64/kit-strip.mjs`, which adds `title` and `device`. The schema accepts both forms. Bank rules (spice, uniqueness, option counts per format, bans) are enforced by `check-bank.mjs`, not by this schema; evidence is locked by `evidence-lock.json`.
