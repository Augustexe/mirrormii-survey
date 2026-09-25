# Genii survey evidence glossary

The stable language for answers, evidence, provisional interpretations, projections and results. See [EVIDENCE-FRAMEWORK.md](EVIDENCE-FRAMEWORK.md) for the executable contract.

**Response**: A person's selected answer or written reply to one question. It is self-report, not independently observed behavior.

**QuestionTemplate**: A versioned semantic adapter defining how a response becomes evidence. Its wording and visual presentation may change independently of its semantic mapping.

**Context fact**: An explicitly reported circumstance, such as audience, relationship target, stakes, capacity or recent disruption. It scopes evidence and is not personality support by itself.

**Authored context**: A setting, audience or stakes value established by the reviewed prompt itself. It is template-bound, cannot be overwritten by response state and may scope a context split without becoming personality evidence.

**EvidenceEvent**: One normalized, versioned answer-derived observation with exact answer text, source status, target, timeframe, context, claim limits and predicates.

**SourceUnit**: The independence boundary used for aggregation. Several answers about one event may enrich one SourceUnit but do not count as repeated corroboration.

**Predicate**: A normalized assertion emitted by a question adapter, such as a reported action, explicit motive, context signature, preference or product-axis direction.

**Projective report**: A selected fantasy, temptation, desire or imagined response used to make disclosure easier. It records only the selected imagined content; it does not establish conduct, intent, morality, attachment or diagnosis.

**AuditedClaim**: A bounded interpretation that passed evidence and language checks and retains support, counterevidence, alternatives, scope, uncertainty and next validation.

**ProfileSnapshot**: The immutable canonical profile frozen before held-out checks. It contains profile evidence, missingness, audited claims, unknowns, versions and audit state.

**ProductProjection**: A reversible, versioned compression of snapshot evidence into product constructs. It is not a formal trait, diagnosis, percentile or probability.

**ResultCard**: A parseable view contract selecting existing axes and claims from one snapshot for a specific renderer and privacy level. It cannot create new inference.

**CorrectionRecord**: Append-only feedback on a claim. Fits / Not quite feedback does not mutate the snapshot; an explicit answer edit creates a child snapshot.

**Evidence observation**: Legacy name for a response-derived record in the V4 engine. It can be adapted into an EvidenceEvent without inventing projection predicates.

**Behavioral dimension**: A named product construct for which explicit predicates may provide supporting or conflicting observations. It is not automatically a validated psychological scale.

**Routine measure**: A directly reported frequency or pattern within a stated period. Its position does not represent overall health or prediction accuracy.

**Usual pattern**: The respondent's report about their past month unless the question explicitly defines another period.

**Recent state**: The respondent's report about the last seven days, kept distinct from their usual pattern.

**Interpretation**: A provisional plain-language claim drawn from evidence, distinct from the respondent's literal answer.

**Support level**: `unknown`, `thin`, `mixed`, `supported` or `strongly_supported` based on independent source units, source status, counterevidence and context. It is not calibrated probability or “percent personality.”

**Coverage**: How far a construct progressed from absent to mentioned, discriminative item, interpretable answer or prospectively tested. Coverage is separate from direction.

**Held-out check**: A question whose answer is excluded from the frozen profile used to predict it.

**Q / E / P**: Separate evaluations of question quality, evidence support and held-out predictive performance. They never combine into one accuracy score.

**Endorsement**: Fits / Not quite feedback on an interpretation. It expresses resonance and does not independently demonstrate prediction accuracy.

**Missingness**: An explicit no-answer state such as skip, prefer-not, no example, not applicable, unsafe or omitted by route. Missingness is retained and never scored as neutral.

**Other response**: A reply outside authored options, preserved as private text without assigning an authored score.
