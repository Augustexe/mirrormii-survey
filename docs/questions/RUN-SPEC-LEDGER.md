---
title: Run spec ledger, what is current, proposed and outdated
status: current
owner: jerry
created: 2026-09-26
updated: 2026-09-28
source_basis: Jerry's rulings in the 2026-09-26 and 2026-09-28 sessions; 2026-09-26 (survey spec, grill rounds, Sally's research, team transcript, gauntlet, internal-run grill round 1)
---

# Run spec ledger

One page to check before any survey work. When a ruling changes, update this page and move the old line to "Outdated". Detail lives in the linked docs; this page says which of them still holds.

## Central purpose

People **finish**, get a **personality prediction** that feels accurate and fun, and **share** it so friends answer about them. The friend loop is what lowers acquisition cost. Everything else serves that.

## Current (ruled by Jerry)

| Area | Ruling | Date |
|---|---|---|
| Launch build | Persona quiz V2 (the kit plus the web MVP) is the one launch survey. Improve it; no parallel builds or new specs. State and next steps: [../STATE.md](../STATE.md) | 2026-09-28 |
| Result voice | Smooth and natural. No gotcha lines that catch the player out ("You'd say X. Last three times, you did Y.") and no sitcom lines ("Genii called this before you answered") | 2026-09-28 |
| Result goal | Spicy information: "I didn't know that about me." Distinct from generic personality tests; unique and tasteful. Serves feeling understood and wanting the app | 2026-09-28 |
| Sally's system | A template for structure and humor, not a translation source. English type names, tags and lines may be rewritten or replaced so they land natively in English | 2026-09-28 |
| Result display | The Stories (tap-through) format is preferred; layout and language not final ([drafts](../../research/result-page-wireframes/)) | 2026-09-28 |
| Governing architecture | Sally v2 (research/sally-v2-2026-09-26): 64 types from 6 axes, up to 5 paired tags, friend game (guess type, guess choices, guess tags, bestie sting level), hidden research record | 2026-09-26 |
| Evidence layer | Every answer option is tagged directly: axis values and persona tags, with grade weights, circumstance and exits. No topic scores | 2026-09-26 |
| Persona quiz V2 build | research/persona-quiz-v2 (BRIEF.md is the build spec); run wf_a800d5eb-cdf; spec lands in docs/questions/PERSONA-QUIZ-SPEC-V2.md | 2026-09-26 |


| Area | Ruling | Date |
|---|---|---|
| Product | Web game on GitHub Pages later; a marketing tool; collects no health data | 2026-09-24/26 |
| Result | A **personality prediction**, not an essay: predicted personality and common traits, in a fun manner; shows emotions; predicts how they'd act in specific situations; mostly qualitative, light evidence. Jerry decides when it is good enough for a visual; the visual (Genii and Miia, generated) comes after | 2026-09-26 |
| Tags | Built from Sally's research (research/sally-values-2026-09-26); 5 levels (strongly A, leaning A, depends, leaning B, strongly B); 37 tags in 7 areas ([PILOT-BANK-V1](PILOT-BANK-V1.md) plus 5 added in [GAUNTLET-SPEC-V1](GAUNTLET-SPEC-V1.md)) | 2026-09-26 |
| Question style | Vivid imagined scenarios in the style of Jerry's Gemini example are the main format; the 9-card golden set is approved as the register | 2026-09-26 |
| Question rules | Multiple choice only, never free text; every question masked; answers short and legible, action first, true details; no cool answer; gender neutral | 2026-09-26 |
| Survey layers | Onion: L1 the question, L2 emotion, psychology, targeting and response timing, L3 evidence | 2026-09-26 |
| Onboarding | Hybrid: a few routing taps, then scored opening scenes; email collected once there is a backend | 2026-09-26 |
| Audience | Gender neutral questions; women are no longer the survey's core ICP (company ICP change in PRODUCT-TRUTH not yet made); teens 13 to 17 in scope | 2026-09-26 |
| Internal team run | Tests the prediction's accuracy **and** the friend loop (teammates answer about each other) | 2026-09-26 |
| First test method | A blind Claude Code agent runs the 45-card kit through lavish-axi pages, parses with `score.mjs`, seals guesses (sha256) before the sealed cards, writes the prediction, collects line-by-line verdicts. Kit: research/blind-test-kit. No static page or backend yet | 2026-09-26 |
| AI generation | Deferred; a demo version first. Generation path to be decided with the team | 2026-09-26 |
| Storage | SQLite for now, not Lark | 2026-09-26 |
| Hosting | No backend for now. Internal first; published to GitHub Pages later so teammates take it themselves | 2026-09-26 |
| Git | Launch work on local branch `survey/launch` (the V2 kit plus the web game). Old builds removed from this branch; they stay in git history and on `main`. Nothing pushed | 2026-09-28 |

## Proposed, not yet ruled

- Persona quiz V2 web game (2026-09-27): the quiz64 shell plays the V2 kit end to end with the friend game over fragment links, scored by the kit's `score-core.mjs` ([quiz64/docs/PERSONA-MVP.md](../../quiz64/docs/PERSONA-MVP.md)). On branch `survey/launch`; not deployed.

- Persona tags (Sally's paired library, 41 meme-style tags with sting and 💛 lines) as the named layer of the result, plus her friend game ("Do you really know me?") on a static page via link fragments ([PERSONA-TAGS-V1](PERSONA-TAGS-V1.md)).

- Prediction register: title like a zodiac name, three short paragraphs from strongest tags, emotions and one split, "Genii's calls", "What people miss about you" (research/blind-test-kit/PREDICTION-REGISTER.md). In test on Jerry's run.

- Voices: ship Be kind, Make it fun (default) and Call me out; cut Cozy quest and the Oracle ([GAUNTLET-SPEC-V1](GAUNTLET-SPEC-V1.md)).
- Question types: scenario (about half a run), real "last time" moment (about a quarter, the anchors), hot take (only for believe-versus-did mirrors), sealed check, feeling follow-up, friend version.
- Answer format: a 4-step ladder, plus an optional "circumstance" option that records context and never scores (the $200 jacket's bill line).
- Gaming costumes ("Play") for existing tags; five personas added to the judge panel (Mika, Wei, Linda or Tanya, Harper, Devin or Yuki).
- The adaptive picker; the emotional arc order.
- Rewrite rules 10 to 21 in GAUNTLET-SPEC-V1, with the section i postmortem overriding their plainness.
- Pilot size: 100 cards for 200 people, or all cards for about 400 people.

## Outdated (do not build from these)

| Outdated | Replaced by |
|---|---|
| A/B opinion polls as the main question format | Vivid scenarios (golden set) |
| 10-word hard cap and "no imagination" plainness (PILOT-VOICES-V1 rewrite) | Short and legible, but the situation carries the fun; about 12 words when the extra words add character |
| Gauntlet winners.json as final copy | Reference only; the register is the golden set |
| An LLM "article" (essay) as the result | The personality prediction described above |
| A sectioned result ("Genii's read", "You're the one who", labelled sections) | Rejected by Jerry as robotic; replaced by the prediction register |
| One static test page as the first test | The lavish-axi agent kit (faster, no build) |
| Blind-test kit v1 (45 topic-scored cards) and its register | Failed test 1 (0/6 sealed exact, 2/5 overall, repeated and ladder answers); replaced by persona quiz V2 |
| pilot/ build (32 topic tags, plain copy) and PILOT-BANK-V1 / PILOT-VOICES-V1 | Superseded by persona quiz V2 |
| Topic-scored tags (dimensions) as the result layer | Persona tags and Sally's 6 axes, tagged per answer |
| Lark Base as the pilot store | SQLite |
| Prolific pass thresholds as the gate for the visual | Jerry's own judgment; panel metrics stay for the later pilot |
| Women 18 to 34 as the survey's core audience; women-framed debate topics | Gender neutral questions and hooks |
| The live build's 50-name title from 5 axes (quiz64) | Still live, but not the direction for the new build |
| Git: work saved at commit 4dd09fa (2026-09-26) | The Git row above |
| Literal English translations of Sally's half-names and tags as final copy | English-native rewrite, Sally's as the template (2026-09-28) |

## Open

- SURVEY-SPEC-V3's six decisions (A to E tags, need_voice, emotional signature, five new questions, voice pass, pair mode) were written against the older 5-axis bank. Close as superseded or carry into V2: Jerry's call.

- How the prediction gets generated for teammates who run it themselves (template in the browser, or a hosted function with an API key).
- Where SQLite lives once the build is on GitHub Pages (Pages cannot run a database).
- Teen scope against PRODUCT-TRUTH's anti-ICP line on minors.
- Company ICP change in PRODUCT-TRUTH (needs Jerry's explicit yes).
