# Evidence review — interview checkpoint 1

Status: source behavior verified; proposed changes await interview decisions. No runtime changes.

## Locked presentation

Jerry approved the R6 website layout and design in this conversation. Preserve commit b0d7a89b964e0c0d00adec1093435a570f606343 as the visual baseline. This review concerns evidence semantics, question mappings and result interpretation only.

## Source under review

The current approved build is in runs/20260918T003758Z-1798bfab3e72/scratch/worktree/quiz64. The canonical project checkout contains unrelated in-progress work and is not assumed to be the serving build. This document and CONTEXT.md are additive documentation only.

This is a local code and founder-decision review, not a fresh synthesis of company data. No new Lark business claims are made; earlier company-source references are historical provenance for this checkpoint.

## Current pipeline

1. data.js defines 76 candidates routed into 64 slots (56 profile/context, eight checks); english-copy.js supplies respondent wording.
2. Selected option IDs expose authored context facts, behavioral tags, routine measures or emotional signals. One answer can produce multiple observations, but that does not create independent corroboration.
3. engine.js observations() retains question/option/version/source, time window and evidence role. Other, Skip and no-example do not create scored observations; notes are unscored. Ineligible questions are replaced from the slot's candidate list.
4. profile() groups tags by dimension and target. One distinct question is Thin evidence; two or more are Mixed evidence when the winning tag share is below two thirds; otherwise Repeated pattern. Only Repeated pattern emits a claim.
5. measureRecords() populates usual/recent routine markers from authored option values. These are descriptive ordinal values, not inferred health scores. If multiple records target the same measure and period, the later record replaces the displayed value while source IDs accumulate; do not assume averaging.
6. claimConfidence() labels one source low, two medium, three or more high. It counts distinct questions, without source-quality weighting or calibration. Routine confidence currently pools both time windows.
7. emotionsFor() collects feeling, response and recovery signals by seven families; it does not establish a clinical personality type.
8. freeze() captures the profile and predictions before check answers. predict() uses smoothed exact-tag matches, requires two matching source questions, and abstains on a top-two score gap below 0.025. Its ranking scores are explicitly not probabilities.
9. True/False appends feedback and preserves the original result. Browser localStorage holds the current attempt; this is not a deployed inference service or a live company-data enrichment pipeline.

## Concrete mappings

- q02: Just me -> household=alone -> shared-household questions become ineligible; a relevant candidate occupies the route slot. This does not imply loneliness or independence.
- q45: Finish it, then sleep later -> D14a:delay and D14d:obligation, hypothetical/scenario. This can support contextual behavior claims but does not alter reported sleep duration or regularity.
- q72: Usually consistent -> sleep_regularity=2, past_month. q73 answers populate the separate last_7_days marker. A difference is a reported contrast, not proof of improvement or deterioration.

The full existing author map is copied into this run's output/QUESTION-MAP.md for inspection. It includes all answer mappings, not just these examples.

## Meaningful gaps to decide

- Hypothetical choices and reports of actual events currently contribute equal tag counts; independence is approximated by distinct question IDs.
- Confidence is a count heuristic, including conflicting observations; it does not measure calibrated reliability.
- Some dimensions combine distinct concepts. D14a includes clock timing and protecting/delaying sleep; these need separate subdimensions before interpreting disagreement as inconsistency.
- The eight authored checks are an internal demo evaluation, not independent validation. Their calibration and coverage remain open.

## Design tree and first decision frontier

Confirmed: visual baseline locked; playful voice retained; direct facts versus interpretations distinct; usual/recent separate; Other unscored; True/False feedback only.

Q1 — Evidence structure: separate routine, contextual behavior, and emotion facets before aggregating. Recommended: yes, preserve relationships between facets without collapsing them into one trait.
Q2 — Evidence strength: prefer corroborating reports of actual events over hypothetical choices when making behavior claims. Recommended: yes, retain both source types; numerical weights remain a later decision and self-report is not ground truth.
Q3 — Conflicting answers: preserve the contextual difference and soften or withhold a broad claim; use a follow-up when context does not explain it. Recommended: this approach rather than simple majority or treating changes as dishonest.

Downstream after Q1–Q3: precise facets, source independence and confidence criteria; targeted follow-up budget; prediction targets and validation coverage. Do not choose dependent thresholds prematurely.

No ADR yet: the frontier contains proposals, not a new accepted architectural trade-off. Record an ADR only when a consequential choice is settled. The grilling skill requests shared understanding before implementation; this checkpoint documents current facts without changing behavior.
