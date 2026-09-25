# Genii Playful Disclosure Question Bank V1

Status: **local review candidate; not approved, merged, deployed or human-validated**  
Source: `quiz64/src/question-bank-v1.js`  
Tests: `quiz64/tests/question-bank-v1.test.mjs`

## Product frame

Category: a playful personality-discovery and social self-understanding game. The confirmed broad direction remains English-first, North America and all genders. The “socially surrounded, privately unrooted” 21–25 cohort remains a proposed alpha test wedge, not a proven ICP or an eligibility rule.

The question experience is designed to make normally awkward information easier to report through recognition, comic distance and projective scenarios. Humor is a disclosure surface, not permission to deceive. Genii must still make topic choice, skipping and private/public boundaries legible.

## Content thesis

Questions can be funny and answers can be funny. The hidden evidence mapping remains literal and reviewed.

```text
fun scenario + distinct answer
→ exact neutral receipt
→ reported action / emotion / fantasy / temptation / desire
→ optional reviewed product-axis direction
→ bounded claim and explicit non-claims
```

A fantasy is not an action. A temptation is not intent. A selected emotion is not a diagnosis. A joke is not evidence beyond the action it names.

## Base bank

The candidate contains 23 authored items:

- 3 permission and presentation inputs;
- 15 profile/disclosure items;
- 5 held-out checks, one exploratory item per proposed product axis.

The five held-out items exercise the freeze/evaluation lifecycle. One item per axis is not meaningful construct validation and must not be reported as accuracy.

### Sections

1. **Before Genii gets nosy** — result style, disclosure mode and topic permission; no personality predicates.
2. **Social theater** — recognition, exclusion, delayed replies and repair; dry observational humor.
3. **The secret menu** — a gradual sequence from a recent low-stakes temptation to optional fantasies and desired understanding.
4. **When it got real** — recent visible behavior; warmer and plainer language.
5. **Your operating mode** — plans, ambiguity, group decisions and unfamiliar opportunities.
6. **Genii puts its cards down** — materially different held-out transfer contexts after freeze.

## Consent and routing

`GQB1-002` records preferred disclosure mode. `GQB1-003` records allowed topic rooms. These are context/preferences and never personality evidence.

Routing is deterministic through `questionEligibilityV1()` and `routeQuestionBankV1()`:

- `surface` mode blocks all high-optional projective prompts;
- a sensitive prompt is omitted unless one of its authored topic permissions is selected;
- topic permission opens a route but never creates a claim;
- no selected topic produces no sensitive prompt and no sensitive output;
- every profile prompt retains a visible Skip or Other/no-example exit.

This is an authoring/runtime routing contract, not a substitute for the product’s actual retention, export and privacy notice.

## Evidence mapping

The candidate does **not** force categorical answers onto an equal-interval 0–5 scale. Axis-bearing answers use reviewed classes:

- left/right direction;
- slight/moderate/strong within that authored answer;
- explicit claim text and non-claims.

A future item may use 0–5 when its six options form a defensible ordered continuum. That number would remain an item signal, never a personality percentage, probability or percentile.

Authored context is bound into the template and event. Setting, audience and stakes cannot be overwritten by runtime response state. This allows the projection to preserve context reversals instead of averaging unlike situations.

## Disclosure kinds

The bank keeps these distinct:

- `reported_action`
- `reported_emotion`
- `reported_fantasy`
- `reported_temptation`
- `reported_desire`
- axis-bearing bounded behavior
- unscored permission, missingness and Other text

Projective prompts explicitly prohibit inference about morality, attachment, diagnosis, secret motive or likelihood of acting.

## Result display

The maintained [Evidence Display V1](RESULT-DISPLAY-V1.md) and `RESULT_DISPLAY_V1` define one progressive result:

1. **Your current Genii read** — provisional identity and central tension from audited claims.
2. **Patterns that actually showed up** — supported, mixed and context-dependent patterns.
3. **What happened outside / inside** — actions, emotions, fantasies, temptations and desires remain labeled separately.
4. **Why Genii thinks this** — plain receipts by default; exact private receipts on request.
5. **What Genii is not claiming** — unknowns, thin signals and prohibited inference.
6. **Did Genii call it?** — frozen held-out outcomes versus baseline, explicitly exploratory in this base bank.
7. **Your right of reply** — accurate, partly accurate, inaccurate or prefer not to say as an immutable overlay.

Public axes and claim templates are empty allowlists in this bank. Share-safe results remain disabled until founder and human review approve exact public language.

## Review gates

Before this bank enters a respondent flow:

1. founder review of every prompt, option and exact receipt;
2. Council Q audit of every mapping and context;
3. moderated comprehension sessions checking answer distinction, shame, bias and topic permission;
4. route tests for every disclosure mode and topic combination;
5. balanced option-order experiments without changing semantics;
6. a larger preregistered held-out set before any prediction-performance statement;
7. separate approval for identity labels, public axes and share-safe claims.
