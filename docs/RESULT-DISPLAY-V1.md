# Genii Evidence Display V1

Status: **display principles still apply; the implemented result is the personality dossier below (live since 2026-09-23)**  
Machine contract (V1 principles): `RESULT_DISPLAY_V1` in `quiz64/src/question-bank-v1.js`

## Implemented result: the personality dossier

Built 2026-09-21 on `codex/final-survey-dossier`; Jerry approved the dimensional layout and asked for richer answer-dependent language, curiosity, sharing and game details.

- **Frame:** a private, playful evidence dossier (white paper, purple rules, mono metadata) with the canon Genii stage, 3D objects and motion. Only this final packet may depart from the approved pre-result visuals. A stamp reads "humor only, no type, no score".
- **Game nickname:** `quiz64/src/game-outcome.js`, version `genii-character-pairs-v2`: 40 two-axis rules and 10 single-axis fallbacks, 50 unique nicknames, plus "Plot still developing" when no axis is supported. A nickname needs a supported or strongly supported axis with a clear direction; strong support ranks first, then evidence count, then canonical axis order. Voice changes the hook, never the nickname. Nicknames are provisional playful roles, never types or diagnoses; if labels change, bump the version.
- **Five facets**, each with four labelled beats, literal source disclosures and context limits: First move (action replay), Social signal (message commentary), Friction (a tiny hearing), Structure (plan versus plot twist), Novelty (curiosity menu). Thin signals read as early clues; mixed signals keep their split.
- **Stories:** answer-seeded authored variations (about 1,700 to 2,100 words for a complete light route), citing profile answers only. Skipped answers yield no invented scenes; imagined choices stay labelled as imagined.
- **Prediction reveal:** one eight-card reveal of the sealed checks with baseline and abstentions in a single scoring disclosure. Checks never rescore the profile.
- **Corrections:** accurate, partly accurate or inaccurate, appended; they never rewrite the frozen reading. Viewing a completed answer does not create a revision; a real edit creates a child attempt.
- **Share and export:** the share-safe PNG card carries only the nickname and a generic invitation. Private JSON export is separate and lossless. The app handoff is a labelled placeholder.
- `quiz64/src/dossier-story.js` owns result editorial variants; `/preview.html` shows synthetic fixtures by edition and voice.

## Display thesis

The result should feel like one memorable Genii read, then let the respondent inspect how it was earned. It is not a dashboard of personality percentages.

```text
memorable read
→ strongest supported patterns
→ inside/outside distinctions
→ short reasons
→ exact receipts on demand
→ unknowns and counterexamples
→ separate prediction booth
→ correction
```

## Default compact result

### 1. Your current Genii read

Show, in order:

- one provisional identity label, only when an exact audited claim is available;
- one central tension, only when exact audited synthesis language is available;
- the scope line: “This describes patterns in the situations you answered, not your whole personality.”

If no audited identity claim passes, do not invent one. Use the honest fallback:

> **A few patterns are showing up. Genii is not naming the whole creature yet.**

### 2. The patterns that actually showed up

Display at most three supported or mixed patterns. Each row contains:

- human endpoint labels, never 0–5 or a percentage;
- `supported`, `mixed`, `thin` or `unknown` in plain language;
- number of independent situations;
- one context split when relevant;
- expandable counterexample.

Example shape:

> **When things stall: more likely to create a next move**  
> Supported in three separate situations · different pattern in one higher-stakes setting  
> `Why?`

The prose above must be an audited claim before use. Until then, render the approved axis label and endpoint without adding a sentence.

### 3. What happened outside / what happened inside

Keep evidence kinds visibly separate:

| Outside | Inside |
| --- | --- |
| Reported actions | Reported emotions |
| Communication and repair choices | Selected fantasies |
| Boundaries and follow-through | Selected temptations |
| Context-specific response patterns | Desired understanding |

Use labels such as “You said you did…,” “You reported feeling…,” and “In an imagined no-fallout prompt, you selected…”. Never collapse these into “You are…”.

Projective content is private by default and collapsed behind:

> **A private pull you recognized**

It never appears in share-safe output without a future explicit public allowlist and separate consent design.

### 4. Why Genii thinks this

Default collapsed. First expansion shows short neutral receipts:

- situation label;
- exact neutral meaning of the selected answer;
- actual / repeated report / hypothetical / stated preference;
- context: setting, audience and stakes;
- counterexample when present.

A second explicit action may reveal exact private answer wording. Other text is never promoted into an authored score.

### 5. What Genii is not claiming

Always display at least one relevant limit:

- “We did not see enough independent situations yet.”
- “Your answers differed by context, so Genii kept both patterns.”
- “This came from an imagined situation, not a report of what you did.”
- “This does not establish a formal trait, diagnosis or probability.”

Unknown is a valid result state, not an error screen.

### 6. Did Genii call it?

Held-out checks appear only after profile and baseline predictions are frozen.

For this base bank, report item-level outcomes only:

- prediction;
- answer;
- match / mismatch / abstention;
- fixed no-profile baseline answer;
- explicit line: “One check per pattern is exploratory and is not an accuracy score.”

Never convert five checks into a personality-accuracy percentage.

### 7. Your right of reply

Every interpretation supports:

- Fits
- Partly fits
- Does not fit
- Prefer not to say

The response is an immutable correction overlay. It does not silently rescore the snapshot or count as a prediction hit.

## Private evidence view

Adds:

- all eligible audited claims;
- exact answer receipts;
- source status and source-unit identity;
- context splits and counterevidence;
- missingness reasons;
- corrections;
- next validation prompts.

## Share-safe view

Disabled in Question Bank V1 because both public allowlists are empty. A later bank version must approve exact claim templates and axis labels. Runtime callers cannot enable sharing by supplying their own IDs.

When enabled, share-safe must omit:

- exact private answers;
- fantasies, temptations and desires;
- sensitive contexts;
- missingness;
- correction reasons;
- receipts and debug scores;
- any generated paraphrase.

## Visual hierarchy

1. One large identity/tension surface.
2. Two or three pattern rows.
3. Inside/outside reveal.
4. Evidence drawer.
5. Unknowns and limits.
6. Prediction booth.
7. Correction controls.

The interface may be playful and animated. Animation cannot imply confidence, goodness, diagnosis or measurement precision.

## Approval gaps

- Game nicknames are authored and gated, but human copy review should decide whether to soften occupational or capability-implying titles (such as "Officer" or "Manager" roles) before wider use.
- Public axis names and endpoints are not approved.
- No human session establishes comprehension, humor, shareability or usefulness.
- No held-out performance claim is justified by eight sealed checks on synthetic data.
- Share-safe content is limited to the nickname card; broader sharing of claims or axes stays disabled.
