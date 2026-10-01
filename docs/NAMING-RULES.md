# Naming rules for the result

Every label a player reads on the result (archetype names, kickers, stat names and ends, level words, trait keywords,
tag names, room labels, section titles, tabs, chips and buttons) follows these rules. LAUNCH-SPEC section 6 holds the
locked tables; `docs/NAMING-PANEL.json` holds the scores. Written 2026-09-29 after Jerry: "Nobody understands what a
slow burner is" and "If they're progressive and you label them traditional, that's just bad."

## The rules

1. **A stranger gets it in one second, with no context.** The label is read on a phone, often in someone else's story,
   by a person who never played. If it needs the quiz to explain it, it fails.
2. **Everyday words, no metaphor to decode.** Orbit, Blueprint, Engine, Code, Slow Burner and Full Send all failed
   because the reader had to translate them first. Say the behavior itself: "Stays close", "Tries new things".
3. **Describe behavior, never beliefs, politics, religion or identity.** "Traditional", "Old School" and "Classic at
   heart" read as politics or gender roles. "Keeps family traditions" describes what someone does at the holidays.
4. **Both ends of every scale are flattering and shareable.** No end is the failing grade of the other: "Says it
   straight / Says it gently", never "Blunt / Soft". Test: would each person happily post their own end?
5. **Every title card is kicker + name + one plain line.** The kicker says the scope ("With the people you love", "Day to
   day"), the name is the hook, and the line directly under the name defines it in plain words ("Plans ahead and sees
   it through."). A name never stands alone.
6. **One grammar.** Labels that describe the player (names, ends, keywords, tag names, defining lines) are subjectless
   phrases ("Says it straight", "Protects free time"), never "their" or "my". Headings, kickers and sentences that
   talk to the player use "you" ("With the people you love"). Sentence case in the source (a design may set a small
   heading in capitals); no period on a label, a period on a defining line or a full sentence.
7. **One source.** Stat names, ends and kickers live in `quiz64/src/persona/stats.js`; archetype names, defining lines,
   tag names and keywords live in `research/persona-quiz-v2/final/library.json`. Nothing else spells a label out, and
   `quiz64/tests/naming-retired.test.mjs` fails if a retired label renders anywhere.
8. **The gate.** A label ships only after the cold-reader panel passes it: `node scripts/naming-inventory.mjs` lists
   every label with where it sits; a Codex panel of six readers aged 20 to 35 (a progressive activist, a religious
   conservative, an ESL speaker, a Gen Z TikTok user, a nurse, an engineer) scores each one with no explanation. Pass:
   **clear 4.5 or more, hurt 2 or less, share 3.5 or more** (averages; share applies to labels about the player, not to
   buttons and headings). Replace and re-test until everything passes.

## Where the rules come from

- Plain language: Digital.gov's plain language guide says to prefer common words readers already know over obscure or
  complex ones, and to keep the verb in its direct form rather than turning it into a noun
  ([Familiar terms](https://digital.gov/guides/writing-understanding/familiar-terms),
  [Writing for understanding](https://digital.gov/guides/plain-language/writing); plainlanguage.gov now redirects to
  [digital.gov/guides/plain-language](https://digital.gov/guides/plain-language)).
- Users' words: Nielsen Norman Group's usability heuristic 2 says an interface should "speak the users' language"
  ([Match between the system and the real world](https://www.nngroup.com/articles/match-system-real-world/)); their
  jargon test asks whether most readers know a term and whether it is essential, and replaces it with the plain word
  when not ([Dealing with technical or professional jargon](https://www.nngroup.com/articles/technical-jargon/),
  [User-centric vs. maker-centric language](https://www.nngroup.com/articles/user-centric-language/)).
- Result labels in the wild: 16Personalities shows each type as a name, a code and a one-line description
  ([Personality types](https://www.16personalities.com/personality-types)); the Enneagram Institute shows a number, a
  name and a short line of traits per type ([Type descriptions](https://www.enneagraminstitute.com/type-descriptions));
  Spotify Wrapped pairs every listening character, aura or personality with a short plain description, and defines each
  scale behind its 2022 personalities in one line
  ([2023 listening characters](https://newsroom.spotify.com/2023-11-29/me-in-2023-streaming-habits-wrapped/),
  [2022 listening personality](https://newsroom.spotify.com/2022-11-30/get-to-know-your-music-listening-personality-from-2022-wrapped/),
  [2021 Audio Aura](https://newsroom.spotify.com/2021-12-01/learn-more-about-the-audio-aura-in-your-spotify-2021-wrapped-with-aura-reader-mystic-michaela/)).
  The pattern is the same everywhere: a name is never shown without the plain line that says what it means.
- Labels and buttons: sentence case for UI labels and headings
  ([Microsoft style guide](https://learn.microsoft.com/en-us/style-guide/capitalization),
  [Google developer style guide](https://developers.google.com/style/capitalization)); button text is a couple of short
  words in active voice that name the action, with no period
  ([Windows app writing style](https://learn.microsoft.com/en-us/windows/apps/design/style/writing-style)).

## Failures to learn from

| Label | Why it failed |
|---|---|
| The Slow Burner | Read as slow to understand, or a slow-burn romance; clear 2.8 |
| Blueprint: Old School / Own Lane | A metaphor, and Old School reads as politics or age; clear 3.0 |
| Code: By the Book / Read the Room | One end sounds socially clueless; hurt 3.3 |
| Traditional | Labels politics or religion instead of a habit; hurt 3.2 |
| With your life | Reads as life satisfaction; clear 2.8 |
| Same side | Reads as politics or team loyalty; clear 2.2 |
| Scrupulous, Self-possessed, Discerning | Words many readers never use; clear 2.5 to 3.3 |
