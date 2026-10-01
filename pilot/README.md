# Genii tag pilot (test build)

A plain, usable test build for [TAG-VALIDATION-SPEC.md](../docs/questions/TAG-VALIDATION-SPEC.md). It checks whether Sally's tags describe people accurately. It is not the game UI, and there's no answer screen or article yet.

Flow: setup (age band, closest person) → quick takes (one stance per tag, 5 positions, timed) → real moments (masked scenes) → Genii seals its guesses → 8 sealed checks with reveal → tag list with "that's me" / "not me" per tag, a 1 to 5 rating, JSON export and a swap test.

| File | Role |
|---|---|
| `bank.js` | The questions and their evidence mappings. Single source of truth |
| `engine.js` | Scoring: tags, splits, pauses, sealed predictions |
| `app.js`, `index.html` | The test app (no build step, no backend; state in localStorage) |
| `tests.cjs` | `node --test tests.cjs`: integrity, symmetry, gender-neutral wording, teen gating, synthetic respondents, persona runs |
| `personas.cjs` | Scripted answers for Jasmine (SYN-23) and Jordan (SYN-17) |
| `build-doc.cjs` | `node build-doc.cjs` regenerates [PILOT-BANK-V1.md](../docs/questions/PILOT-BANK-V1.md) |

Run locally: `python3 -m http.server 8790` from this folder, then open http://localhost:8790. Opening the file directly also works.

Answers never leave the browser. Exports carry answers, timings and tags, no name or email.
