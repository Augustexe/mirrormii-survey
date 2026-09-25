# Genii personality-game v4 question map

**Frozen authoring reference.** The original packet wording below is retained for comparison. The Astra candidate renders `src/respondent-copy.js`; its unchanged meanings and metadata are checked against `tests/fixtures/v4-semantics-533c3da.json`. See `ASTRA-IMPLEMENTATION.md` for wording/version boundaries and validation.

Version: genii-personality-game-v4

Bank: v4-authoring-packet-2026-09-19

Packet: genii-personality-game-v4-authoring-packet

This map is generated from the v4 authoring packet. Profile/support items feed the frozen portrait; heldouts are post-freeze P-only checks and never enter profile evidence. Skip, no recent example, prefer not, other/depends and abstain are distinct visible exits. Support preferences are literal operating preferences only.

## Counts

- Profile/support: 44
- Heldout: 8
- Total authored items: 52

## V4-001 — desired result style

- Kind: profile_support
- Section: Frame and literal preferences
- Source role: direct preference
- Target: self
- Timeframe: current preference
- Cost/stakes: low social cost; sets expectation only
- Linked event: not_applicable
- Claim limit: Locks preferred result style; not evidence for personality, confidence, or emotional tolerance.
- Not evidence for: toughness; sensitivity; social pressure response; personality type; future behavior

Prompt: What kind of read should Genii try to earn for you today?

Options:
- A: A funny but fair roast | neutral: Prefers playful pointed result framing | tags: desire:playful_roast
- B: A very specific pattern read | neutral: Prefers specificity over softness | tags: desire:specific_pattern
- C: A useful operating manual | neutral: Prefers practical interpretation | tags: desire:operating_manual
- D: A softer reflection | neutral: Prefers lower-intensity wording | tags: desire:soft_reflection
- E: Surprise me if the evidence is clear | neutral: Permits evidence-led result framing | tags: desire:surprise_if_supported

Visible exits:
- skip: Skip this preference — No result-style preference recorded.

## V4-002 — tone boundary

- Kind: profile_support
- Section: Frame and literal preferences
- Source role: direct preference
- Target: self
- Timeframe: current preference
- Cost/stakes: low social cost; protects result tone
- Linked event: not_applicable
- Claim limit: Locks tone boundary for rendering; not evidence for resilience, openness, or emotional stability.
- Not evidence for: resilience; openness; emotional stability; attachment; personality type

Prompt: If Genii notices a pattern, how should it say it?

Options:
- A: Gentle and careful | neutral: Prefers low-intensity wording | tags: support_preference:gentle
- B: Clear and kind | neutral: Prefers direct but warm wording | tags: support_preference:clear_kind
- C: Playful and pointed | neutral: Prefers humorous pointed wording | tags: support_preference:playful_pointed
- D: Ask before sensitive reads | neutral: Requires permission before sensitive interpretation | tags: support_preference:permission_first
- E: Show receipts before commentary | neutral: Prefers evidence-first wording | tags: support_preference:receipts_first

Visible exits:
- skip: Skip this preference — No tone boundary recorded.

## V4-003 — off-limit topics

- Kind: profile_support
- Section: Frame and literal preferences
- Source role: direct preference
- Target: self
- Timeframe: current boundary
- Cost/stakes: privacy cost; routing only
- Linked event: not_applicable
- Claim limit: Controls routing and privacy only; never supports a character or avoidance claim.
- Not evidence for: avoidance; fear; comfort; disclosure style; personality type

Prompt: Any zones Genii should route around today?

Options:
- A: Dating or romantic situations | neutral: Avoid dating or romantic content this round | tags: support_preference:dating
- B: Family situations | neutral: Avoid family content this round | tags: support_preference:family
- C: Money or spending situations | neutral: Avoid money or spending content this round | tags: support_preference:money
- D: Work or school situations | neutral: Avoid work or school content this round | tags: support_preference:work_school
- E: Personal appearance topics | neutral: Avoid appearance-related content this round | tags: support_preference:appearance
- F: No special boundary for this round | neutral: No selected topic boundary | tags: support_preference:none

Visible exits:
- prefer_not: Prefer not to set a topic boundary — No boundary recorded; still may use item-level exits.

## V4-004 — finish value

- Kind: profile_support
- Section: Frame and literal preferences
- Source role: direct preference
- Target: self
- Timeframe: current preference
- Cost/stakes: low social cost; expectation only
- Linked event: not_applicable
- Claim limit: Locks preferred result payoff; not evidence that the payoff is achieved.
- Not evidence for: trait; social comparison need; validation need; prediction performance

Prompt: What payoff are you hoping the read earns?

Options:
- A: It names a pattern I recognize | neutral: Wants recognition of a pattern | tags: desire:recognized_pattern
- B: It catches a context switch | neutral: Wants nuance across situations | tags: desire:context_switch
- C: It predicts a few choices cleanly | neutral: Wants heldout-style prediction | tags: desire:prediction_game
- D: It gives me language for myself | neutral: Wants usable self-description | tags: desire:self_language
- E: It gives me something fun to compare | neutral: Wants socially shareable comparison | tags: desire:compare_fun

Visible exits:
- skip: Skip this preference — No finish-value preference recorded.

## V4-005 — credit response

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: controlled scenario
- Target: peer or teammate
- Timeframe: scenario
- Cost/stakes: status cost high; relationship cost medium; visibility public
- Linked event: EV4-STATUS-CREDIT
- Claim limit: Supports first intended action in a public credit scenario only; no humility, pettiness, or competitiveness claim without more evidence.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Someone gets applause for something you helped make happen. What do you do first?

Options:
- A: Let the moment pass and note it for later | neutral: Avoids immediate correction while retaining information | tags: reported_action:defer_credit_correction
- B: Congratulate them, then clarify privately | neutral: Separates public goodwill from private correction | tags: reported_action:private_credit_correction
- C: Add context in the room without making a speech | neutral: Publicly clarifies contribution in a contained way | tags: reported_action:contained_public_context
- D: Make the next contribution visibly traceable | neutral: Shifts future process toward visibility | tags: reported_action:future_visibility
- E: Put less effort into the next shared thing | neutral: Reduces future investment after unfair credit | tags: reported_action:reduce_future_investment

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-006 — credit motive

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: parent-bound motive
- Target: same peer or teammate as V4-005
- Timeframe: same scenario
- Cost/stakes: same event as V4-005; motive cost private
- Linked event: EV4-STATUS-CREDIT
- Runtime dependency: V4-005 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Direct motive for the V4-005 event only; cannot be counted as a second evidence unit.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What was the main thing you were protecting there?

Options:
- A: Fairness of the record | neutral: Directly reports fairness motive | tags: value:fair_record
- B: Not making the room weird | neutral: Directly reports social-smoothness motive | tags: value:social_smoothness
- C: Keeping the relationship workable | neutral: Directly reports relationship-preservation motive | tags: value:relationship_workable
- D: Being seen accurately | neutral: Directly reports recognition motive | tags: value:accurate_visibility
- E: Protecting future opportunity | neutral: Directly reports future-opportunity motive | tags: value:future_opportunity
- F: I am not sure yet | neutral: Motive not specified | tags: value:unknown

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-007 — response to close peer win

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: controlled scenario
- Target: close peer in a shared arena
- Timeframe: scenario
- Cost/stakes: status cost medium; envy risk medium; closeness cost medium
- Linked event: EV4-STATUS-PEER-WIN
- Claim limit: Supports reported first action around a close peer win; no jealousy, envy, admiration, or generosity claim unless separately asked.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: A close person gets a win in a lane you care about. First move?

Options:
- A: Celebrate them in the moment | neutral: Prioritizes outward celebration first | tags: reported_action:celebrate_peer_win
- B: Ask how they pulled it off | neutral: Moves toward learning from their win | tags: reported_action:ask_method
- C: Take a private minute, then rejoin warmly | neutral: Creates private processing space before engaging | tags: reported_action:private_reset_then_warmth
- D: Get quieter until the feeling settles | neutral: Reduces outward engagement while processing | tags: reported_action:quiet_processing
- E: Use it as fuel for your own next move | neutral: Channels comparison into future effort | tags: reported_action:turn_to_fuel

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-008 — copied idea response

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: controlled scenario
- Target: peer or acquaintance
- Timeframe: scenario
- Cost/stakes: ownership cost high; reputation cost medium
- Linked event: EV4-STATUS-COPIED
- Claim limit: Supports ownership/visibility response in one scenario; not evidence of possessiveness or insecurity.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Your thing shows up under someone else’s spotlight. What is your move?

Options:
- A: Name the overlap directly to them | neutral: Addresses similarity with the person privately or directly | tags: reported_action:direct_overlap_callin
- B: Differentiate your next version clearly | neutral: Responds by making own version more distinct | tags: reported_action:differentiate_next_version
- C: Make a light comment that marks the connection | neutral: Uses humor to signal prior connection | tags: reported_action:light_public_marker
- D: Let it pass unless it keeps happening | neutral: Uses threshold before acting | tags: reported_action:threshold_before_action
- E: Save examples in case it matters later | neutral: Preserves evidence without immediate action | tags: reported_action:save_examples

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-009 — recent recognition response

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: retrospective self-report
- Target: peer, group, authority, or unspecified
- Timeframe: past 30 days
- Cost/stakes: actual-event status cost; memory optional
- Linked event: EV4-STATUS-RECENT-CREDIT
- Claim limit: One recalled event only; cannot prove usual pattern or lack of recognition need.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Recent credit moment, if one comes to mind: what did you do?

Options:
- A: Said nothing in the moment | neutral: Reports no immediate outward correction | tags: reported_action:said_nothing
- B: Clarified privately afterward | neutral: Reports private clarification | tags: reported_action:private_clarification
- C: Clarified in the shared space | neutral: Reports shared-space clarification | tags: reported_action:shared_clarification
- D: Changed how visible my work was after that | neutral: Reports future visibility adjustment | tags: reported_action:visibility_adjustment
- E: Reduced what I contributed next time | neutral: Reports reduced future contribution | tags: reported_action:reduced_contribution

Visible exits:
- no_recent_example: No recent example — No recalled event; unknown, not negative evidence.
- prefer_not: Prefer not to answer — Boundary; no profile evidence.
- other_unscored: Other / it was complicated — Literal context only; unscored by default.

## V4-010 — credit visibility shift

- Kind: profile_support
- Section: Status / recognition / jealousy
- Source role: controlled matched contrast
- Target: same peer or teammate as V4-005
- Timeframe: scenario contrast
- Cost/stakes: same unfair credit; only audience visibility changes
- Linked event: EV4-STATUS-CREDIT
- Claim limit: Tests visibility/audience shift against V4-005; only one field changes. Not independent of parent if interpreted as same dilemma.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: If only one trusted person caught it, what would you do?

Options:
- A: Still correct the record directly | neutral: Maintains direct correction despite lower visibility | tags: decision_pattern:still_direct
- B: Talk it through with the trusted person | neutral: Uses trusted witness as processing channel | tags: decision_pattern:trusted_processing
- C: Let it go for this round | neutral: Drops action when visibility is lower | tags: decision_pattern:drop_low_visibility
- D: Use it as private motivation | neutral: Turns low-visibility unfairness into future effort | tags: decision_pattern:private_motivation
- E: Ask that person to back me up later if needed | neutral: Uses witness for contingent support | tags: decision_pattern:contingent_backup

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-011 — public correction first action

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: controlled scenario
- Target: group with mixed familiarity
- Timeframe: scenario
- Cost/stakes: embarrassment cost high; reputation cost medium
- Linked event: EV4-EMB-CORRECTION
- Claim limit: Supports outward first action only; does not prove embarrassment intensity, calmness, shame, or defensiveness.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: You are corrected out loud after saying the thing with confidence. First move?

Options:
- A: Acknowledge it and keep the conversation moving | neutral: Accepts correction with forward motion | tags: reported_action:acknowledge_move_on
- B: Ask one clarifying question | neutral: Seeks information before accepting or contesting | tags: reported_action:clarify_correction
- C: Explain what led you there | neutral: Provides context for original statement | tags: reported_action:explain_reasoning
- D: Go quieter and re-enter later | neutral: Temporarily reduces participation | tags: reported_action:quiet_reenter
- E: Use a small joke to reset the room | neutral: Uses humor to regulate public moment | tags: reported_action:joke_reset

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-012 — inside/outside correction pairing

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: emotion micro-format
- Target: same group as V4-011
- Timeframe: same scenario
- Cost/stakes: inside/outside display pairing only; recovery and settling condition not captured; privacy cost medium
- Linked event: EV4-EMB-CORRECTION
- Runtime dependency: V4-011 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Directly supports only the selected same-event inside/outside pairing; recovery, settling time, and unselected feelings are unknown.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What was the inside/outside pairing in that moment?

Options:
- A: Inside stung; outside steady | neutral: Reports a stung internal state with steady outward display | tags: emotion_expression:stung_steady
- B: Inside curious; outside engaged | neutral: Reports curiosity with engaged outward display | tags: emotion_expression:curious_engaged
- C: Inside blank; outside automatic | neutral: Reports momentary blankness with automatic outward display | tags: emotion_expression:blank_automatic
- D: Inside irritated; outside contained | neutral: Reports irritation with contained outward display | tags: emotion_expression:irritated_contained
- E: Inside fine; outside visibly fine | neutral: Reports low internal load and matching outward display | tags: emotion_expression:fine_matching
- F: I would not know until later | neutral: Reports unknown immediate inside/outside pairing | tags: emotion_expression:unknown_until_later

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-013 — joke impact repair

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: controlled scenario
- Target: friend or group member
- Timeframe: scenario
- Cost/stakes: closeness cost medium; reputation cost medium
- Linked event: EV4-EMB-JOKE-IMPACT
- Claim limit: Supports repair strategy for one social-impact scene; does not prove guilt, shame, kindness, or social skill.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: A joke lands weird and someone gets quieter. Next move?

Options:
- A: Check in with them one-on-one | neutral: Uses private repair channel | tags: interpersonal_response:private_checkin
- B: Clarify intent briefly without pushing | neutral: Offers contained clarification | tags: interpersonal_response:brief_clarify
- C: Give space and return later | neutral: Uses time delay before repair | tags: interpersonal_response:space_then_return
- D: Name it lightly in the group | neutral: Uses shared-space acknowledgement | tags: interpersonal_response:light_group_ack
- E: Stop joking with them for now | neutral: Changes future behavior with that person | tags: interpersonal_response:reduce_joking

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-014 — repair motive

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: parent-bound motive
- Target: same person as V4-013
- Timeframe: same scenario
- Cost/stakes: same event; motive private
- Linked event: EV4-EMB-JOKE-IMPACT
- Runtime dependency: V4-013 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Direct motive for V4-013 only; not independent corroboration.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What were you mainly trying to protect?

Options:
- A: Their comfort | neutral: Directly reports concern for other person comfort | tags: value:their_comfort
- B: My intent being understood | neutral: Directly reports intent-clarity motive | tags: value:intent_understood
- C: Not making it bigger | neutral: Directly reports containment motive | tags: value:contain_situation
- D: The relationship staying workable | neutral: Directly reports relationship-continuity motive | tags: value:relationship_continuity
- E: Getting time to read the room | neutral: Directly reports information/time motive | tags: value:read_room_time
- F: I am not sure | neutral: Motive not specified | tags: value:unknown

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-015 — visible mistake recovery

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: controlled scenario
- Target: group or public setting
- Timeframe: scenario
- Cost/stakes: reputation cost high; competence cost high
- Linked event: EV4-EMB-MISTAKE
- Claim limit: Supports recovery strategy after a visible mistake; not evidence for competence, shame level, or responsibility as a global trait.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: The mistake is visible. How do you recover?

Options:
- A: State the fix and execute it | neutral: Moves to concrete repair | tags: visible mistake recovery:state_fix_execute
- B: Take a short reset before returning | neutral: Uses brief withdrawal before re-engagement | tags: visible mistake recovery:short_reset
- C: Narrate the miss plainly | neutral: Uses transparency about the mistake | tags: visible mistake recovery:plain_narration
- D: Ask for one useful handoff or check | neutral: Uses help/check to recover | tags: visible mistake recovery:ask_useful_help
- E: Use humor after the fix is underway | neutral: Uses humor only after repair starts | tags: visible mistake recovery:humor_after_fix

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-016 — correction source contrast

- Kind: profile_support
- Section: Embarrassment / criticism / repair
- Source role: controlled matched contrast
- Target: authority versus peer
- Timeframe: scenario contrast
- Cost/stakes: same correction; only source status changes
- Linked event: EV4-EMB-CORRECTION
- Claim limit: Tests source-status shift only; does not support age, status, submission, rebellion, or attachment claims.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: If the correction comes from the person with power in the room, what shifts?

Options:
- A: I become more concise | neutral: Authority source narrows outward response | tags: decision_pattern:more_concise
- B: I ask for the standard they are using | neutral: Authority source triggers criteria-seeking | tags: decision_pattern:ask_standard
- C: I save disagreement for later | neutral: Authority source delays disagreement | tags: decision_pattern:delay_disagreement
- D: I respond about the same | neutral: Authority source does not change selected strategy | tags: decision_pattern:no_change_authority
- E: I document the point before moving on | neutral: Authority source triggers record-keeping | tags: decision_pattern:document_point

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-017 — not invited response

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: controlled scenario
- Target: friend group
- Timeframe: scenario
- Cost/stakes: closeness cost high; rejection ambiguity medium
- Linked event: EV4-EXCL-NOT-INVITED
- Claim limit: Supports first action after an ambiguous exclusion cue; no attachment, insecurity, anger, or social value claim without context fields.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: You find out they hung out without you. First move?

Options:
- A: Ask one person directly what happened | neutral: Uses direct information-seeking | tags: not invited response:direct_ask
- B: Make a light probe and watch the response | neutral: Uses indirect information-seeking | tags: not invited response:light_probe
- C: Say nothing and update my expectations | neutral: Internally recalibrates without asking | tags: not invited response:recalibrate_silently
- D: Step back from the group for a while | neutral: Reduces access after exclusion cue | tags: not invited response:step_back
- E: Plan something separate with people who show up | neutral: Redirects effort toward available ties | tags: not invited response:redirect_to_available_ties

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-018 — first interpretation

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: interpretation/appraisal follow-up
- Target: same friend group as V4-017
- Timeframe: same scenario
- Cost/stakes: interpretation ambiguity; privacy cost medium
- Linked event: EV4-EXCL-NOT-INVITED
- Runtime dependency: V4-017 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Directly supports reported first interpretation/appraisal only; does not establish what happened or prove fear, jealousy, relief, or other felt emotion.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Before you have facts, which explanation shows up first?

Options:
- A: It was probably logistics | neutral: Initial interpretation is logistical | tags: emotion_trigger:logistics
- B: They may have chosen a different mix | neutral: Initial interpretation is social composition | tags: emotion_trigger:different_mix
- C: I need more data before deciding | neutral: Initial stance is uncertainty/data-seeking | tags: emotion_trigger:need_more_data
- D: This fits a pattern I have noticed | neutral: Initial interpretation references prior pattern | tags: emotion_trigger:prior_pattern
- E: Maybe it was not about me | neutral: Initial interpretation de-centers the self without deciding cause | tags: emotion_trigger:not_about_me
- F: I am not sure | neutral: No clear interpretation reported | tags: emotion_trigger:unknown

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-019 — important delayed reply response

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: controlled scenario
- Target: selected relationship object
- Timeframe: scenario
- Cost/stakes: uncertainty cost medium; closeness/status cost variable
- Linked event: EV4-EXCL-DELAYED-REPLY
- Claim limit: Supports delayed-reply action only with recorded target/safety context; no attachment or neglect claim by itself.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: The message matters, and the reply is not coming. First move?

Options:
- A: Follow up once with the clearest ask | neutral: Uses one direct follow-up | tags: important delayed reply response:one_clear_followup
- B: Check whether there is practical urgency | neutral: Separates urgency from meaning | tags: important delayed reply response:check_urgency
- C: Wait and put attention elsewhere | neutral: Delays action and redirects attention | tags: important delayed reply response:wait_redirect
- D: Draft what I want to say but hold it | neutral: Prepares message without sending | tags: important delayed reply response:draft_hold
- E: Ask a neutral third party for context | neutral: Seeks context through another source | tags: important delayed reply response:third_party_context

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-020 — reply target context

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: context field
- Target: person from V4-019
- Timeframe: same scenario
- Cost/stakes: context capture; privacy cost medium
- Linked event: EV4-EXCL-DELAYED-REPLY
- Runtime dependency: V4-019 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Captures target/safety context only; cannot support relationship style, fear, or avoidance.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Who is this, broadly, without naming them?

Options:
- A: Close friend or chosen-family person | neutral: Target is close non-romantic tie | tags: reply target context:close_friend
- B: Dating or partner context | neutral: Target is romantic or dating tie | tags: reply target context:dating_partner
- C: Family context | neutral: Target is family tie | tags: reply target context:family
- D: Work, school, or authority context | neutral: Target involves authority or institutional stakes | tags: reply target context:work_school_authority
- E: Newer or lower-trust person | neutral: Target is newer or lower-trust tie | tags: reply target context:newer_low_trust
- F: Power or safety makes directness costly | neutral: Direct action is constrained by power/safety | tags: reply target context:power_safety_constrained

Visible exits:
- prefer_not: Prefer not to specify — No target scope; restrict claims.
- not_enough_experience: Not enough experience with this situation — No target evidence; unknown.

## V4-021 — reassurance request strategy

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: controlled scenario
- Target: recorded relationship object from context_capture before action choice
- Timeframe: scenario
- Cost/stakes: closeness/vulnerability cost plus recorded safety, power, reliability, and experience context
- Linked event: EV4-EXCL-REASSURANCE
- Claim limit: Supports reassurance strategy only within the recorded target/safety/reliability/experience context; no attachment, dependence, or avoidance claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: After the context is clear, you want to check where you stand. Move?

Options:
- A: Ask plainly and keep it short | neutral: Uses direct reassurance request | tags: reassurance request strategy:plain_short_ask
- B: Ask through a smaller practical question | neutral: Uses indirect but content-related signal | tags: reassurance request strategy:small_practical_question
- C: Act normal and wait for more evidence | neutral: Delays reassurance-seeking | tags: reassurance request strategy:wait_for_evidence
- D: Get steadied by someone else first | neutral: Seeks support from another person before asking | tags: reassurance request strategy:external_steadying
- E: Decide the cost is not worth it right now | neutral: Chooses not to seek reassurance in this moment | tags: reassurance request strategy:not_worth_cost_now

Visible exits:
- not_enough_experience: Not enough experience with this situation — No reassurance-strategy evidence; unknown.
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-022 — reassurance closeness contrast

- Kind: profile_support
- Section: Exclusion / neglect / closeness
- Source role: controlled matched contrast
- Target: close friend versus newer person
- Timeframe: scenario contrast
- Cost/stakes: same reassurance need; only relationship closeness changes
- Linked event: EV4-EXCL-REASSURANCE
- Claim limit: Tests closeness/trust shift only; no global attachment, neediness, or independence claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: If this is a newer person instead of a close one, what shifts?

Options:
- A: I still ask plainly | neutral: Maintains direct ask with newer person | tags: decision_pattern:still_plain_ask
- B: I make the ask smaller | neutral: Reduces size/directness of ask | tags: decision_pattern:smaller_ask
- C: I wait for a clearer signal | neutral: Delays action with lower trust | tags: decision_pattern:wait_clearer_signal
- D: I choose a different support source | neutral: Moves support-seeking elsewhere | tags: decision_pattern:different_support_source
- E: I drop it unless the pattern repeats | neutral: Uses repetition threshold before action | tags: decision_pattern:drop_until_repeat

Visible exits:
- not_enough_experience: Not enough experience with this contrast — Unknown; no profile evidence.
- prefer_not: Prefer not to answer — Boundary; no profile evidence.

## V4-023 — instruction-framed advice response

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: controlled scenario
- Target: peer, authority, or helper
- Timeframe: scenario
- Cost/stakes: autonomy cost medium; usefulness high
- Linked event: EV4-POWER-INSTRUCTION
- Claim limit: Supports response to instruction-framed advice; no maturity, stubbornness, or obedience claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: The advice is useful, but the tone is “do this.” What happens first?

Options:
- A: Ask for the reasoning before deciding | neutral: Seeks rationale while preserving choice | tags: instruction-framed advice response:ask_reasoning
- B: Use the advice but adjust it my way | neutral: Accepts substance while retaining agency | tags: instruction-framed advice response:adapt_advice
- C: Name that the framing is not working for me | neutral: Addresses tone/framing directly | tags: instruction-framed advice response:name_framing
- D: Comply for now and revisit later | neutral: Delays autonomy issue for later | tags: instruction-framed advice response:comply_revisit
- E: Pause before I accidentally push back | neutral: Recognizes pushback impulse and delays action | tags: instruction-framed advice response:pause_pushback

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-024 — instruction response motive

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: parent-bound motive
- Target: same person as V4-023
- Timeframe: same scenario
- Cost/stakes: same event; motive privacy low
- Linked event: EV4-POWER-INSTRUCTION
- Runtime dependency: V4-023 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Direct motive for V4-023 only; not independent evidence.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What part changed your reaction most?

Options:
- A: Having a real choice | neutral: Directly reports choice/autonomy motive | tags: value:real_choice
- B: The quality of the advice | neutral: Directly reports advice-quality motive | tags: value:advice_quality
- C: The timing | neutral: Directly reports timing motive | tags: value:timing
- D: Not being underestimated | neutral: Directly reports competence/status motive | tags: value:not_underestimated
- E: Keeping the interaction efficient | neutral: Directly reports efficiency motive | tags: value:efficiency
- F: Nothing about it bothered me much | neutral: Reports low friction | tags: value:low_friction

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-025 — last-minute plan change

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: controlled scenario
- Target: group or collaborator
- Timeframe: scenario
- Cost/stakes: control cost high; effort cost medium; fairness variable
- Linked event: EV4-POWER-PLAN-CHANGE
- Claim limit: Supports response to plan override; no control-freak, flexibility, or work-ethic claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Your carefully built plan gets rerouted at the last minute. First move?

Options:
- A: Rebuild the plan around the new facts | neutral: Moves into adaptive replanning | tags: last-minute plan change:adaptive_replan
- B: State the impact before agreeing | neutral: Makes cost visible before consent | tags: last-minute plan change:state_impact
- C: Go flexible for this round | neutral: Accepts change this time | tags: last-minute plan change:flex_this_round
- D: Push for the original constraint that matters most | neutral: Defends the key original requirement | tags: last-minute plan change:defend_key_constraint
- E: Reduce my investment to my own part | neutral: Narrows ownership after override | tags: last-minute plan change:narrow_ownership

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-026 — group drift response

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: controlled scenario
- Target: group of peers
- Timeframe: scenario
- Cost/stakes: coordination cost medium; status cost medium
- Linked event: EV4-POWER-GROUP-DRIFT
- Claim limit: Supports group decision strategy; waiting or delegating is not low leadership without context.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: The group is doing the group thing where nothing becomes a decision. Your move?

Options:
- A: Take the lead and name a path | neutral: Moves into decisive leadership | tags: group drift response:take_lead
- B: Ask preferences, then propose a decision | neutral: Uses consult-then-decide strategy | tags: group drift response:consult_then_decide
- C: Wait for enough consensus | neutral: Uses consensus threshold | tags: group drift response:wait_consensus
- D: Handle my own part clearly | neutral: Narrows responsibility to own part | tags: group drift response:own_part
- E: Nominate the best-fit person to decide | neutral: Delegates leadership intentionally | tags: group drift response:nominate_decider

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-027 — entitled authority request

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: controlled scenario
- Target: authority figure
- Timeframe: scenario
- Cost/stakes: same extra-effort request; record safety/power and capacity constraints; resource cost medium
- Linked event: EV4-POWER-AUTHORITY-ASK
- Claim limit: Supports first response under entitled authority request within recorded safety/power/capacity constraints; no laziness, courage, compliance, or rebellion claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Someone with power asks for extra effort like it is automatic. First move?

Options:
- A: Do the required part and keep the record | neutral: Power-risk branch: complies with documentation | tags: entitled authority request:required_part_record
- B: Negotiate the scope if it is safe | neutral: Boundary branch: negotiates scope when directness is viable | tags: entitled authority request:negotiate_scope_if_safe
- C: Name my capacity and ask for priority | neutral: Capacity branch: makes resource limit explicit | tags: entitled authority request:name_capacity_priority
- D: Push back directly if the risk is acceptable | neutral: Direct branch: challenges request when safe enough | tags: entitled authority request:direct_pushback_if_safe
- E: Get advice or coverage before responding | neutral: Safety/power branch: seeks backup before action | tags: entitled authority request:seek_coverage_first

Visible exits:
- unsafe_to_answer: Too safety- or power-loaded to answer as written — Safety/power constraint; no trait evidence.
- capacity_not_comparable: My capacity would decide this, not the request style — Capacity constraint; restrict claims.
- prefer_not: Prefer not to answer — Boundary; no profile evidence.
- other_unscored: Other / depends — Literal context only; unscored by default.

## V4-028 — choice-rationale contrast

- Kind: profile_support
- Section: Power / autonomy / control
- Source role: controlled matched contrast
- Target: same authority figure as V4-027
- Timeframe: scenario contrast
- Cost/stakes: exact same authority/request/cost/capacity as V4-027; only rationale and real-choice framing changes
- Linked event: EV4-POWER-AUTHORITY-ASK
- Runtime dependency: V4-027 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Tests autonomy-support framing only under exact matched authority/request/cost/capacity/safety conditions; not independent proof of generosity or resistance.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Same ask, same cost; only rationale and real choice are different. What shifts?

Options:
- A: I am more willing on the same terms | neutral: Autonomy framing increases willingness while request/cost stays fixed | tags: decision_pattern:more_willing_same_terms
- B: I still negotiate the same scope | neutral: Maintains scope boundary despite better framing | tags: decision_pattern:still_negotiate_same_scope
- C: I use the reason to prioritize capacity | neutral: Uses rationale to allocate fixed capacity | tags: decision_pattern:rationale_prioritize_capacity
- D: My capacity answer stays the same | neutral: Capacity branch unchanged by better framing | tags: decision_pattern:capacity_answer_same
- E: My safety/power answer stays the same | neutral: Safety/power branch unchanged by better framing | tags: decision_pattern:safety_power_same

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-029 — recent help under cost

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: retrospective self-report
- Target: recorded requester object from context_capture
- Timeframe: past 30 days
- Cost/stakes: recorded cost type, capacity, urgency, safety/power, and requester reliability for one actual event
- Linked event: EV4-BOUNDARY-RECENT-HELP
- Claim limit: One actual event with recorded requester/capacity/cost/safety context only; no generosity, selfishness, attachment, or reliability claim by itself.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Recent favor request, if one comes to mind: what was your move?

Options:
- A: Helped fully | neutral: Reports full help despite cost | tags: recent help under cost:full_help
- B: Helped with a clear limit | neutral: Reports bounded help | tags: recent help under cost:bounded_help
- C: Redirected or rescheduled | neutral: Reports alternate support route | tags: recent help under cost:redirect_reschedule
- D: Said no clearly | neutral: Reports direct refusal | tags: recent help under cost:clear_no
- E: Avoided answering until the moment passed | neutral: Reports non-response to costly ask | tags: recent help under cost:nonresponse

Visible exits:
- no_recent_example: No recent example — No recalled event; unknown, not negative evidence.
- prefer_not: Prefer not to answer — Boundary; no profile evidence.
- other_unscored: Other / it was complicated — Literal context only; unscored by default.

## V4-030 — help motive

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: parent-bound motive
- Target: same requester as V4-029
- Timeframe: same past-30-day event
- Cost/stakes: same event; motive cost private
- Linked event: EV4-BOUNDARY-RECENT-HELP
- Runtime dependency: V4-029 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Direct motive for V4-029 only; not independent corroboration.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What was the main factor in that favor decision?

Options:
- A: Care for the person | neutral: Directly reports care motive | tags: value:care_for_person
- B: The principle of the ask | neutral: Directly reports principle/fairness motive | tags: value:principle
- C: My capacity that day | neutral: Directly reports capacity motive | tags: value:capacity
- D: Possible fallout if I refused | neutral: Directly reports consequence/fallout motive | tags: value:fear_fallout
- E: Whether they usually show up too | neutral: Directly reports reciprocity context | tags: value:reciprocity
- F: I am not sure | neutral: Motive not specified | tags: value:unknown

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-031 — close-friend inconvenient help

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: controlled scenario
- Target: close friend
- Timeframe: scenario
- Cost/stakes: same ask/cost later contrasted in V4-032; urgency, capacity, safety/power, and requester reliability are recorded or held fixed
- Linked event: EV4-BOUNDARY-CLOSE-HELP
- Claim limit: Supports action in one close-friend costly-help scenario; no global loyalty or generosity claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: A close person needs help right when your own plan matters. Your move?

Options:
- A: Pause my plan and help now | neutral: Prioritizes immediate close-person help | tags: close-friend inconvenient help:help_now
- B: Split the difference with a clear limit | neutral: Balances help and own plan | tags: close-friend inconvenient help:split_limit
- C: Ask how urgent it really is first | neutral: Clarifies urgency before committing | tags: close-friend inconvenient help:ask_urgency
- D: Say no warmly and offer another route | neutral: Declines with care and alternative | tags: close-friend inconvenient help:warm_no_route
- E: Make the timing or exchange explicit | neutral: Makes timing/resource trade explicit | tags: close-friend inconvenient help:explicit_time_trade

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-032 — acquaintance help contrast

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: controlled matched contrast
- Target: acquaintance
- Timeframe: scenario contrast
- Cost/stakes: exact same ask, cost, urgency, capacity, safety/power, and reliability as V4-031; only requester closeness changes
- Linked event: EV4-BOUNDARY-CLOSE-HELP
- Runtime dependency: V4-031 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Tests requester-closeness shift only under exact matched ask/cost/urgency/capacity/safety/reliability conditions; not a second independent help event.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: If the same ask comes from someone less close, what shifts?

Options:
- A: I still help now | neutral: Maintains immediate help across lower closeness | tags: acquaintance help contrast:help_now
- B: I set a clearer limit | neutral: Increases boundary clarity with acquaintance | tags: acquaintance help contrast:clearer_limit
- C: I ask urgency before deciding | neutral: Maintains urgency-check strategy | tags: acquaintance help contrast:ask_urgency
- D: I decline and offer a route | neutral: Declines with alternative route | tags: acquaintance help contrast:decline_route
- E: Make the time trade explicit | neutral: Makes timing/resource trade explicit with acquaintance | tags: acquaintance help contrast:explicit_time_trade

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-033 — favor for difficult person

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: controlled scenario
- Target: low-trust peer or difficult acquaintance
- Timeframe: scenario
- Cost/stakes: reputation opportunity medium; dislike/friction medium; boundary cost medium
- Linked event: EV4-BOUNDARY-DIFFICULT-FAVOR
- Claim limit: Supports strategy with a low-trust requester; no manipulation, generosity, or dislike intensity claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: A difficult person needs help, and saying yes has upside. Move?

Options:
- A: Help, but keep the interaction contained | neutral: Provides help with limits | tags: favor for difficult person:contained_help
- B: Decline without extra explanation | neutral: Refuses cleanly | tags: favor for difficult person:clean_decline
- C: Help through a neutral channel | neutral: Helps while reducing direct contact | tags: favor for difficult person:neutral_channel_help
- D: Make the terms explicit first | neutral: Conditions help on clarity/terms | tags: favor for difficult person:explicit_terms
- E: Stay cordial and keep distance | neutral: Maintains civility without taking favor | tags: favor for difficult person:civil_distance

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-034 — yes-with-friction condition

- Kind: profile_support
- Section: Generosity / boundary / resentment
- Source role: retrospective self-report
- Target: self with recent or usual pattern
- Timeframe: past 30 days or current self-report
- Cost/stakes: privacy cost medium; conflict/capacity cost variable
- Linked event: EV4-BOUNDARY-YES-FRICTION
- Claim limit: Directly reports possible friction source; does not prove resentment, martyrdom, or relationship style.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: If a yes felt costly lately, what made it costly?

Options:
- A: The ask was bigger than it sounded | neutral: Cost came from unclear ask size | tags: yes-with-friction condition:ask_bigger_than_sounded
- B: I had less capacity than they knew | neutral: Cost came from capacity mismatch | tags: yes-with-friction condition:capacity_mismatch
- C: The timing was the problem | neutral: Cost came from timing | tags: yes-with-friction condition:timing_problem
- D: The requester mattered | neutral: Cost depended on requester relationship/history | tags: yes-with-friction condition:requester_mattered
- E: I wanted the effort noticed | neutral: Cost included recognition/acknowledgment | tags: yes-with-friction condition:wanted_noticed

Visible exits:
- no_recent_example: No recent example — No recent yes-with-friction event; unknown, not negative evidence.
- prefer_not: Prefer not to answer — Boundary; no profile evidence.
- other_unscored: Other / complicated — Literal context only; unscored by default.

## V4-035 — fun versus tomorrow cost

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: controlled scenario
- Target: self, optional social context
- Timeframe: scenario
- Cost/stakes: future obligation cost medium; pleasure/social pull medium
- Linked event: EV4-DESIRE-FUTURE-COST
- Claim limit: Supports action in one non-health future-cost scenario; no discipline, impulsivity, or self-control trait claim alone.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Tonight has a tempting option; tomorrow still has receipts. Move?

Options:
- A: Take the fun option fully | neutral: Chooses immediate reward despite future cost | tags: fun versus tomorrow cost:take_fun_fully
- B: Choose a smaller version | neutral: Modifies reward to reduce future cost | tags: fun versus tomorrow cost:smaller_version
- C: Delay the reward until after the obligation | neutral: Prioritizes future obligation first | tags: fun versus tomorrow cost:delay_reward
- D: Ask someone to help me stick to the plan | neutral: Uses external accountability | tags: fun versus tomorrow cost:ask_accountability
- E: Decide based on who is involved | neutral: Social context determines choice | tags: fun versus tomorrow cost:depends_people

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-036 — temptation motive

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: parent-bound motive
- Target: same context as V4-035
- Timeframe: same scenario
- Cost/stakes: same event; motive private
- Linked event: EV4-DESIRE-FUTURE-COST
- Runtime dependency: V4-035 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Direct motive for V4-035 only; not enough for sensation-seeking or positive-urgency trait.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: What is the hook in the tempting option?

Options:
- A: It makes a better story | neutral: Directly reports story value motive | tags: value:story_value
- B: It gives immediate relief | neutral: Directly reports relief motive | tags: value:relief
- C: It feels like choosing for myself | neutral: Directly reports autonomy/rebellion motive | tags: value:choosing_for_self
- D: The people involved pull me in | neutral: Directly reports social pull motive | tags: value:social_pull
- E: The chance feels rare | neutral: Directly reports scarcity motive | tags: value:scarcity
- F: I am not sure | neutral: Motive not specified | tags: value:unknown

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-037 — information-management strategy under conflict

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: controlled scenario
- Target: recorded target context: peer, close person, authority, or safety/power constrained
- Timeframe: scenario
- Cost/stakes: conflict/trust cost plus recorded target, safety, power, and disclosure obligation context
- Linked event: EV4-DESIRE-TRUTH
- Claim limit: Supports information-management strategy in one recorded conflict context; no global honesty, deception, courage, avoidance, or moral claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: There is a conflict cost around what to share. First move?

Options:
- A: Share the relevant part with context | neutral: Information-management strategy: relevant disclosure plus context | tags: information-management strategy under conflict:relevant_with_context
- B: State what I can share and what I cannot | neutral: Information-management strategy: explicit disclosure boundary | tags: information-management strategy under conflict:share_boundary
- C: Delay until there is a safer channel | neutral: Information-management strategy: timing/channel management | tags: information-management strategy under conflict:delay_safer_channel
- D: Answer the exact question and invite follow-up | neutral: Information-management strategy: narrow answer with follow-up path | tags: information-management strategy under conflict:exact_question_followup
- E: Check with an appropriate safer person first | neutral: Information-management strategy: consult before disclosure | tags: information-management strategy under conflict:consult_safer_person

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-038 — subtle embarrassment response

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: controlled scenario
- Target: peer or group member
- Timeframe: scenario
- Cost/stakes: reputation cost medium; conflict cost medium
- Linked event: EV4-DESIRE-SUBTLE-EMBARRASSMENT
- Claim limit: Supports self-protection response to subtle embarrassment; no revengefulness, forgiveness, anger, or cruelty claim.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: They make you look a little bad without fully saying it. Move?

Options:
- A: Name it directly after the moment | neutral: Addresses it directly but not mid-moment | tags: subtle embarrassment response:direct_after
- B: Reduce warmth toward them | neutral: Changes access/affect toward person | tags: subtle embarrassment response:reduce_warmth
- C: Perform better and move on | neutral: Responds through competence/status | tags: subtle embarrassment response:outperform_move_on
- D: Return a light comment in the moment | neutral: Uses contained public counter-comment | tags: subtle embarrassment response:light_counter
- E: Save the pattern in case it repeats | neutral: Tracks pattern without immediate response | tags: subtle embarrassment response:track_pattern

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-039 — private advantage decision

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: controlled scenario
- Target: self versus absent group in a non-sensitive scheduling/admin domain
- Timeframe: scenario
- Cost/stakes: low-stakes scheduling/admin advantage; rules are stated as ambiguous-but-non-sensitive; no money/body/sex/health domain
- Linked event: EV4-DESIRE-PRIVATE-ADVANTAGE
- Claim limit: Supports bounded non-sensitive private-advantage strategy only; no greed, honesty, shame, spending, sex, appearance, law-breaking, or moral inference.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Tiny scheduling/admin edge, rules not fully clear, no audience. Move?

Options:
- A: Use it if a quick rule check says it is allowed | neutral: Uses advantage after confirming permissibility | tags: private advantage decision:use_after_rule_check
- B: Share the edge with the relevant group | neutral: Makes the advantage visible to affected people | tags: private advantage decision:share_with_group
- C: Pass on it unless the rule is clearly allowed | neutral: Declines when rules remain ambiguous | tags: private advantage decision:pass_if_ambiguous
- D: Use it once and record why | neutral: Uses advantage with traceable rationale and later review | tags: private advantage decision:use_once_record_why
- E: Ask the responsible person how to handle it | neutral: Escalates ambiguous rule to responsible person | tags: private advantage decision:ask_responsible_person

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-040 — private advantage audience contrast

- Kind: profile_support
- Section: Desire / risk / self-protection
- Source role: controlled matched contrast
- Target: same non-sensitive scheduling/admin advantage as V4-039
- Timeframe: scenario contrast
- Cost/stakes: exact same domain, advantage, rule ambiguity, and stakes as V4-039; only trusted audience visibility changes
- Linked event: EV4-DESIRE-PRIVATE-ADVANTAGE
- Runtime dependency: V4-039 must have an authored answer; changing the parent invalidates this answer.
- Claim limit: Tests trusted-audience visibility shift only under exact matched V4-039 domain/rules/stakes; not independent proof of integrity or image management.
- Not evidence for: formal personality type; clinical or diagnostic state; moral worth; hidden motive; hidden emotion; future certainty

Prompt: Same tiny admin edge, same rules; only respected people can see the move. What shifts?

Options:
- A: I make the same choice | neutral: Audience does not change stated action | tags: private advantage audience contrast:same_choice
- B: I become more careful about the rule | neutral: Audience increases rule-checking | tags: private advantage audience contrast:more_rule_care
- C: I disclose it sooner | neutral: Audience increases disclosure | tags: private advantage audience contrast:disclose_sooner
- D: I avoid it even if allowed | neutral: Audience changes action toward avoidance | tags: private advantage audience contrast:avoid_if_seen
- E: I explain my reasoning before acting | neutral: Audience adds explanation step | tags: private advantage audience contrast:explain_reasoning

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-041 — pattern commentary style

- Kind: profile_support
- Section: Support preference module
- Source role: direct preference
- Target: Genii-to-user
- Timeframe: current preference
- Cost/stakes: low cost; operating instruction only
- Linked event: not_applicable
- Claim limit: Literal support preference only; cannot imply dependence, avoidance, resilience, or personality type.
- Not evidence for: personality trait; dependence; avoidance; emotional stability; discipline

Prompt: When Genii has a read, what delivery style is least annoying?

Options:
- A: Say it directly | neutral: Prefers direct pattern statement | tags: support_preference:direct
- B: Soften it first | neutral: Prefers gentler entry | tags: support_preference:gentle_entry
- C: Make it playful | neutral: Prefers playful framing | tags: support_preference:playful
- D: Ask before going deep | neutral: Prefers permission before depth | tags: support_preference:permission_first
- E: Show receipts first | neutral: Prefers evidence before commentary | tags: support_preference:receipts_first
- F: Do not comment unless I ask | neutral: Prefers no unsolicited commentary | tags: support_preference:only_if_asked

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-042 — ignored-nudge retry frequency

- Kind: profile_support
- Section: Support preference module
- Source role: direct preference
- Target: Genii-to-user
- Timeframe: current preference
- Cost/stakes: low cost; operating instruction only
- Linked event: not_applicable
- Claim limit: Literal ignored-nudge retry frequency only; no inference about conscientiousness, motivation, avoidance, or support need.
- Not evidence for: conscientiousness; motivation level; avoidance; support need; personality type

Prompt: If Genii nudges and you do not bite, what retry count is right?

Options:
- A: Do not retry | neutral: Prefers zero retries after ignore | tags: ignored-nudge retry frequency:zero
- B: Retry once later | neutral: Prefers one later retry | tags: ignored-nudge retry frequency:one_later
- C: Retry twice, then stop | neutral: Prefers two retries before stopping | tags: ignored-nudge retry frequency:two_then_stop
- D: Retry at the next clearly relevant moment only | neutral: Prefers one context-triggered retry | tags: ignored-nudge retry frequency:next_relevant_only
- E: Ask me to set the retry count | neutral: Prefers explicit user-set frequency | tags: ignored-nudge retry frequency:user_sets_count

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-043 — least-annoying support type

- Kind: profile_support
- Section: Support preference module
- Source role: direct preference
- Target: Genii-to-user
- Timeframe: current preference
- Cost/stakes: low cost; operating instruction only
- Linked event: not_applicable
- Claim limit: Literal support type preference only; not evidence for capability, avoidance, or personality.
- Not evidence for: capability; avoidance; independence; dependence; personality type

Prompt: If you are stuck, what kind of help should Genii try first?

Options:
- A: Name the pattern | neutral: Prefers pattern labeling | tags: least-annoying support type:name_pattern
- B: Give me options | neutral: Prefers option set | tags: least-annoying support type:options
- C: Make one recommendation | neutral: Prefers single recommendation | tags: least-annoying support type:recommendation
- D: Draft the message or script | neutral: Prefers script assistance | tags: least-annoying support type:script
- E: Make it funny first | neutral: Prefers humor entry | tags: least-annoying support type:humor_entry
- F: Hands off unless I ask | neutral: Prefers user-initiated support | tags: least-annoying support type:hands_off

Visible exits:
- prefer_not: Prefer not to answer — Boundary or privacy choice; no profile evidence.
- other_unscored: Other / depends — Literal custom context only; unscored by default.

## V4-044 — explicit-no and topic pause boundaries

- Kind: profile_support
- Section: Support preference module
- Source role: direct boundary
- Target: Genii-to-user
- Timeframe: current boundary
- Cost/stakes: privacy and autonomy cost; operating instruction only
- Linked event: not_applicable
- Claim limit: Literal explicit-no/topic/inference boundary only; overrides support persistence when stricter and carries no trait meaning.
- Not evidence for: fragility; openness; avoidance; emotional stability; personality type

Prompt: Where is the literal stop-or-ask-first line?

Options:
- A: When I say no once | neutral: Explicit no stops persistence | tags: explicit-no and topic pause boundaries:explicit_no_once
- B: Dating or conflict topics | neutral: Pause/ask-first around dating or conflict topics | tags: explicit-no and topic pause boundaries:dating_conflict
- C: Family topics | neutral: Pause/ask-first around family topics | tags: explicit-no and topic pause boundaries:family
- D: Money, work, or school stakes | neutral: Pause/ask-first around money/work/school stakes | tags: explicit-no and topic pause boundaries:money_work_school
- E: Public embarrassment moments | neutral: Pause/ask-first around public embarrassment topics | tags: explicit-no and topic pause boundaries:public_embarrassment
- F: Before any sensitive inference | neutral: Ask permission before sensitive interpretation | tags: explicit-no and topic pause boundaries:sensitive_inference_permission

Visible exits:
- prefer_not: Prefer not to set this boundary — No extra pause boundary recorded; item-level exits still apply.
- other_unscored: Other boundary / custom wording — Literal boundary text only; unscored by default.

## V4-H01 — credit response transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: acquaintance in a public group
- Timeframe: post-freeze scenario
- Cost/stakes: status cost medium; relationship cost lower than V4-005
- Linked event: HEV4-H01
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: A not-that-close person gets credit for the shared idea in chat. First move?

Options:
- A: Let it pass unless it affects the next step | neutral: Uses threshold before action | tags: heldout:credit_threshold
- B: Reply with added context in the thread | neutral: Publicly clarifies in channel | tags: heldout:credit_thread_context
- C: Message them privately | neutral: Uses direct private correction | tags: heldout:credit_private_message
- D: Make my next contribution traceable | neutral: Changes future visibility process | tags: heldout:credit_future_trace
- E: Ask someone neutral how they read it | neutral: Seeks external read before acting | tags: heldout:credit_neutral_read

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: C; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H02 — awkward repair transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: group member after accidental interruption
- Timeframe: post-freeze scenario
- Cost/stakes: reputation cost medium; repair cost medium
- Linked event: HEV4-H02
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: You talked over someone, everyone clocked it, and now the room is weird. Move?

Options:
- A: Hand the floor back to them directly | neutral: Repairs by restoring turn | tags: heldout:emb_hand_floor
- B: Make a brief apology and continue later | neutral: Repairs briefly then delays own point | tags: heldout:emb_brief_apology
- C: Use a light line to reset, then invite them in | neutral: Uses humor plus repair | tags: heldout:emb_light_reset_invite
- D: Go quiet until the topic changes | neutral: Withdraws from immediate repair | tags: heldout:emb_go_quiet
- E: Check in after the conversation | neutral: Uses delayed private repair | tags: heldout:emb_after_checkin

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: A; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H03 — ambiguous exclusion transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: two friends with prior reliability unknown
- Timeframe: post-freeze scenario
- Cost/stakes: closeness cost medium; ambiguity high
- Linked event: HEV4-H03
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: They plan something right there and somehow you are not included. First move?

Options:
- A: Ask lightly if it is open | neutral: Uses direct but low-pressure ask | tags: heldout:excl_light_ask
- B: Wait to see if they include me later | neutral: Delays action for more evidence | tags: heldout:excl_wait_later
- C: Make separate plans without commenting | neutral: Redirects effort without asking | tags: heldout:excl_separate_plans
- D: Ask one of them privately afterward | neutral: Uses private clarification | tags: heldout:excl_private_ask
- E: Step back from the plan and the topic | neutral: Reduces engagement immediately | tags: heldout:excl_step_back

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: A; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H04 — instruction response transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: skilled friend giving directive help
- Timeframe: post-freeze scenario
- Cost/stakes: autonomy cost medium; advice quality high
- Linked event: HEV4-H04
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: The advice is good; the delivery is “do this.” What do you do?

Options:
- A: Ask for the reason so I can buy in | neutral: Seeks rationale for agency | tags: heldout:auto_ask_reason
- B: Use it but modify the execution | neutral: Accepts substance with agency | tags: heldout:auto_modify
- C: Tell them the instruction tone is the issue | neutral: Names framing problem | tags: heldout:auto_name_tone
- D: Follow it because the outcome matters | neutral: Prioritizes outcome over tone | tags: heldout:auto_follow_outcome
- E: Pause before responding | neutral: Delays response to avoid unhelpful pushback | tags: heldout:auto_pause

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: A; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H05 — costly help transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: reliable close person or lower-closeness requester per prediction
- Timeframe: post-freeze scenario
- Cost/stakes: capacity cost high; relationship cost medium
- Linked event: HEV4-H05
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: A usually-solid person needs help right in your protected time. Move?

Options:
- A: Help now and absorb the cost | neutral: Prioritizes immediate help | tags: heldout:help_absorb
- B: Offer a bounded version now | neutral: Gives limited immediate help | tags: heldout:help_bounded_now
- C: Ask what part is truly urgent | neutral: Clarifies urgency before committing | tags: heldout:help_ask_urgent
- D: Offer a later time or alternate route | neutral: Defers or redirects help | tags: heldout:help_later_route
- E: Say no clearly for this block | neutral: Protects time block with refusal | tags: heldout:help_no_block

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: C; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H06 — temptation transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: self with optional group invite
- Timeframe: post-freeze scenario
- Cost/stakes: future obligation cost medium; social pull variable
- Linked event: HEV4-H06
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: The invite has story potential; tomorrow still exists. Move?

Options:
- A: Go all in | neutral: Chooses memorable option fully | tags: heldout:desire_all_in
- B: Go for a shorter version | neutral: Chooses modified reward | tags: heldout:desire_shorter
- C: Decline and keep the commitment clean | neutral: Prioritizes next-day commitment | tags: heldout:desire_decline_commitment
- D: Ask someone to hold me to an exit time | neutral: Uses accountability boundary | tags: heldout:desire_exit_accountability
- E: Decide based on who is going | neutral: Social composition determines choice | tags: heldout:desire_who_going

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: B; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H07 — truth management transfer

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: close collaborator or peer
- Timeframe: post-freeze scenario
- Cost/stakes: conflict cost high; trust cost medium
- Linked event: HEV4-H07
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: You can be fully clear now, or keep the surface calm for a bit. Move?

Options:
- A: Tell them the whole thing with context | neutral: Full disclosure with context | tags: heldout:truth_full_context
- B: Tell the part that affects their decision | neutral: Decision-relevant disclosure | tags: heldout:truth_relevant_part
- C: Wait until I can say it without heat | neutral: Delay for delivery quality | tags: heldout:truth_wait_no_heat
- D: Answer if they ask directly | neutral: Conditional disclosure | tags: heldout:truth_if_asked
- E: Talk to a safer person first | neutral: Third-party processing before disclosure | tags: heldout:truth_safe_person_first

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: B; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.

## V4-H08 — applied support preference consistency

- Kind: heldout (heldout P-only)
- Section: Held-out P checks
- Source role: holdout check
- Target: Genii-to-user
- Timeframe: post-freeze scenario
- Cost/stakes: autonomy cost low; support relevance medium
- Linked event: HEV4-H08
- Claim limit: P-only sealed check. Exact option match evaluates a frozen prediction against a fixed baseline; no profile evidence.
- Not evidence for: profile evidence; archetype selection; result correction; trait proof; validation of whole person

Prompt: Genii has a read and a next question. What delivery would you choose right now?

Options:
- A: Pattern first, then the question | neutral: Prefers direct sequence | tags: heldout:support_pattern_first
- B: Receipts first, then the read | neutral: Prefers evidence-first sequence | tags: heldout:support_receipts_first
- C: Ask permission before the read | neutral: Prefers permission before depth | tags: heldout:support_permission
- D: Make it playful and brief | neutral: Prefers playful concise delivery | tags: heldout:support_playful_brief
- E: Save the next question unless I ask | neutral: Prefers no unsolicited follow-up | tags: heldout:support_save_question

Visible exits:
- abstain: Abstain / not enough to choose — Answered as abstention; excluded from exact-match denominator and preserved in denominator report.
- prefer_not: Prefer not to answer — Boundary; excluded from profile and exact-match denominator.

Heldout baseline: B; scoring: Exact option ID match over attempted answered checks only. Baseline scored on the same denominator. Abstain and prefer_not are reported separately.
