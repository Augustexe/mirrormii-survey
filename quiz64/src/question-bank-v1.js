import {
  PRODUCT_AXES,
  createBankManifest,
  defineQuestionTemplate,
} from "./evidence-framework.js";

export const QUESTION_BANK_V1_VERSION = "genii-playful-disclosure-bank-v1";
export const QUESTION_SURVEY_V1_VERSION = "genii-playful-disclosure-survey-v1";
export const QUESTION_MAPPING_V1_VERSION = "genii-playful-disclosure-mapping-v1";
export const QUESTION_WORDING_V1_VERSION = "genii-playful-disclosure-en-v1";
export const QUESTION_ADAPTER_V1_VERSION = "genii-choice-adapter-v1";

export const QUESTION_SECTIONS_V1 = Object.freeze([
  {
    id: "permission_lobby",
    title: "Before Genii gets nosy",
    purpose: "Set tone, result preference and topic permission without producing personality evidence.",
    tone: "clear, conspiratorial and low-pressure",
  },
  {
    id: "social_theater",
    title: "Social theater",
    purpose: "Collect actions and emotions around recognition, ambiguity and repair.",
    tone: "dry, observant and lightly roasty",
  },
  {
    id: "secret_menu",
    title: "The secret menu",
    purpose: "Make fantasies and temptations easier to report through projective, consequence-light prompts.",
    tone: "mischievous, non-moralizing and explicitly hypothetical",
  },
  {
    id: "when_real",
    title: "When it got real",
    purpose: "Ask about recent behavior when pressure, cost or vulnerability was present.",
    tone: "warmer, plainer and less performative",
  },
  {
    id: "operating_mode",
    title: "Your operating mode",
    purpose: "Test recurring response patterns across plans, uncertainty and unfamiliar options.",
    tone: "fast, game-like and behavior-first",
  },
  {
    id: "prediction_booth",
    title: "Genii puts its cards down",
    purpose: "Capture held-out choices only after profile and baseline predictions are frozen.",
    tone: "clean, playful and free of result hints",
  },
]);

export const RESULT_DISPLAY_V1 = Object.freeze({
  id: "genii-evidence-display-v1",
  defaultView: "compact",
  respondentOrder: [
    {
      id: "identity",
      title: "Your current Genii read",
      content: ["provisional_identity", "central_tension", "one_line_scope"],
      rule: "Identity and hook must be exact audited claims; no renderer-authored inference.",
    },
    {
      id: "patterns",
      title: "The patterns that actually showed up",
      content: ["supported_patterns", "mixed_patterns", "context_splits"],
      rule: "Show supported, mixed and context-dependent patterns before numeric diagnostics.",
    },
    {
      id: "inside_outside",
      title: "What happened outside / what happened inside",
      content: ["reported_actions", "reported_emotions", "reported_fantasies", "reported_temptations", "reported_desires"],
      rule: "Label fantasy, temptation, emotion and action as different evidence kinds; never present one as another.",
    },
    {
      id: "receipts",
      title: "Why Genii thinks this",
      content: ["plain_language_receipts", "counterexamples", "source_status", "claim_limits"],
      rule: "Default to a short explanation and expose exact private receipts only on request.",
    },
    {
      id: "unknowns",
      title: "What Genii is not claiming",
      content: ["unknowns", "thin_signals", "prohibited_inferences"],
      rule: "Missing answers remain unknown rather than becoming neutral scores.",
    },
    {
      id: "prediction",
      title: "Did Genii call it?",
      content: ["frozen_predictions", "no_profile_baseline", "heldout_outcomes", "abstentions"],
      rule: "Prediction performance is separate from profile evidence and user resonance. One held-out item per axis is exploratory item-level feedback, not meaningful construct validation.",
    },
    {
      id: "correction",
      title: "Your right of reply",
      content: ["accurate", "partly_accurate", "inaccurate", "prefer_not_to_say"],
      rule: "Corrections are overlays; they never rewrite the frozen evidence snapshot.",
    },
  ],
  privateEvidenceDefault: "collapsed",
  shareSafeDefault: "disabled_until_public_allowlists_are_approved",
});

const AXIS_IDS = new Set(PRODUCT_AXES.map((axis) => axis.id));
const STANDARD_EXITS = Object.freeze([
  { id: "different_story", text: "My version is a different kind of mess", reason: "other_unscored" },
  { id: "skip", text: "Not opening that tab", reason: "skip" },
]);
const SENSITIVE_NON_CLAIMS = Object.freeze([
  "diagnosis",
  "attachment style",
  "moral worth",
  "secret motive",
  "likelihood of acting on a fantasy",
]);
const CONTEXT_SCHEMA = Object.freeze({
  setting: ["work_school", "close_relationship", "peer_group", "social_event", "household", "public_service", "self_directed", "general_plan"],
  audience: ["public_group", "one_to_one", "unfamiliar_group", "private_self"],
  stakes: ["low", "medium", "high"],
});

function axisSignal(itemId, optionId, axisId, direction, strength, claimText) {
  if (!AXIS_IDS.has(axisId)) throw new Error(`Unknown axis ${axisId}`);
  if (direction !== "left" && direction !== "right") throw new Error(`Axis direction required for ${itemId}:${optionId}`);
  if (![0.35, 0.7, 1].includes(strength)) throw new Error(`Reviewed axis strength required for ${itemId}:${optionId}`);
  return {
    id: `${itemId}:${optionId}:${axisId}`,
    construct: axisId,
    value: { directionalClass: `${direction}_${strength === 1 ? "strong" : strength === 0.7 ? "moderate" : "slight"}` },
    claimText,
    claimTemplateId: `${itemId}-${optionId}-${axisId}-v1`,
    allowedInferenceKeys: ["bounded_behavior"],
    allowedScopeIds: ["selected_situation"],
    axisId,
    direction,
    strength,
    claimLimits: ["This is a reviewed directional category for this answer, not a personality percentage or equal-interval scale."],
    excludesClaims: ["formal trait", "probability", "percentile", "diagnosis"],
  };
}

function literalSignal(itemId, optionId, construct, value, claimText, kind = "reported_content") {
  return {
    id: `${itemId}:${optionId}:${construct.replaceAll(" ", "_")}`,
    kind,
    domain: "reported_experience",
    construct,
    value,
    claimText,
    claimTemplateId: `${itemId}-${optionId}-${construct.replaceAll(" ", "-")}-v1`,
    allowedInferenceKeys: ["literal_report"],
    allowedScopeIds: ["selected_situation"],
    strength: 1,
    claimLimits: ["This supports only the content the respondent selected."],
    excludesClaims: [...SENSITIVE_NON_CLAIMS],
  };
}

function choice(id, text, neutralMeaning, predicates = []) {
  return { id, text, neutralMeaning, predicates };
}

const ITEM_SPECS = [
  {
    itemId: "GQB1-001",
    sectionId: "permission_lobby",
    tone: "conspiratorial",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "result style preference",
    prompt: "What kind of ending makes this worth the emotional paperwork?",
    sourceStatus: "stated_preference",
    scored: false,
    options: [
      choice("sharp", "Give me one sharp read. No TED Talk.", "Prefers a concise, sharp result."),
      choice("receipts", "Show me the read, then show your receipts.", "Prefers an evidence-forward result."),
      choice("funny", "If I am being perceived, at least make it funny.", "Prefers a more playful result."),
      choice("gentle", "Be useful, but keep the emotional furniture intact.", "Prefers a gentler result."),
    ],
  },
  {
    itemId: "GQB1-002",
    sectionId: "permission_lobby",
    tone: "clear",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "disclosure mode preference",
    prompt: "If this gets personal, how should Genii knock?",
    sourceStatus: "stated_preference",
    scored: false,
    options: [
      choice("sideways", "Put me in a ridiculous scenario. I will expose myself accidentally.", "Prefers projective scenarios."),
      choice("direct", "Ask directly. We both know why I am here.", "Prefers direct questions."),
      choice("hybrid", "Start sideways, then ask what you actually mean.", "Prefers a projective-to-direct sequence."),
      choice("surface", "Keep it light today. The vault has office hours.", "Prefers lower-disclosure questions."),
    ],
  },
  {
    itemId: "GQB1-003",
    sectionId: "permission_lobby",
    tone: "consent_forward",
    sensitivity: "medium",
    responseFormat: "multi_choice",
    construct: "topic permission",
    prompt: "Which rooms are open tonight? Pick any that Genii may enter.",
    sourceStatus: "context_fact",
    scored: false,
    options: [
      choice("friends", "Friends and group chats", "Permits friendship scenarios."),
      choice("dating", "Dating and romantic ambiguity", "Permits dating scenarios."),
      choice("work_school", "Work, school and authority", "Permits work or school scenarios."),
      choice("family", "Family dynamics", "Permits family scenarios."),
      choice("private_thoughts", "The thoughts I normally keep in drafts", "Permits private-thought prompts."),
    ],
    exits: [{ id: "prefer_not", text: "Keep every door politely closed", reason: "prefer_not" }],
  },
  {
    itemId: "GQB1-004",
    sectionId: "social_theater",
    tone: "dry_roast",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "credit response",
    prompt: "Your idea just received a standing ovation while wearing someone else’s name tag. Your move?",
    sourceStatus: "hypothetical_choice",
    eligibleAxes: ["social_signal_style", "friction_posture"],
    requiredAnyPermissions: ["work_school"],
    authoredContext: { setting: "work_school", audience: "public_group", stakes: "medium" },
    options: [
      choice("public", "Correct the record while the applause is still warm.", "Would correct the attribution publicly.", [
        axisSignal("GQB1-004", "public", "social_signal_style", "right", 1, "In this scenario, the selected response makes the credit claim visible to the group."),
        axisSignal("GQB1-004", "public", "friction_posture", "right", 1, "In this scenario, the selected response addresses the credit problem immediately."),
      ]),
      choice("joke", "Make a joke that casually returns my name to the crime scene.", "Would use humor to make their contribution visible.", [
        axisSignal("GQB1-004", "joke", "social_signal_style", "right", 0.7, "In this scenario, the selected response makes the contribution visible through humor."),
        axisSignal("GQB1-004", "joke", "friction_posture", "right", 0.35, "In this scenario, the selected response lightly names the credit problem."),
      ]),
      choice("private", "Congratulate them, then request a private plot correction.", "Would address the attribution privately.", [
        axisSignal("GQB1-004", "private", "social_signal_style", "left", 0.7, "In this scenario, the selected response keeps the credit correction private."),
        axisSignal("GQB1-004", "private", "friction_posture", "right", 0.7, "In this scenario, the selected response still addresses the credit problem."),
      ]),
      choice("absorb", "Leave it for now and decide later whether it is worth raising.", "Would defer deciding whether to address the attribution.", [
        axisSignal("GQB1-004", "absorb", "social_signal_style", "left", 1, "In this scenario, the selected response keeps the credit concern unspoken for now."),
        axisSignal("GQB1-004", "absorb", "friction_posture", "left", 1, "In this scenario, the selected response defers deciding whether to address the credit problem."),
      ]),
    ],
  },
  {
    itemId: "GQB1-005",
    sectionId: "social_theater",
    tone: "warm_wry",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "reported first emotion after exclusion",
    prompt: "Think of a recent time people you care about did something without you. What arrived first, before your public-relations department took over?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant event",
    requiredAnyPermissions: ["friends"],
    authoredContext: { setting: "peer_group", audience: "private_self", stakes: "medium" },
    options: [
      choice("relief", "Relief. My calendar had already filed for workers’ compensation.", "Reports relief as the first emotion.", [literalSignal("GQB1-005", "relief", "first emotion", "relief", "For the recalled event, the respondent reported relief as the first emotion.", "reported_emotion")]),
      choice("sting", "A small clean sting, annoyingly well-aimed.", "Reports hurt or disappointment as the first emotion.", [literalSignal("GQB1-005", "sting", "first emotion", "hurt_or_disappointment", "For the recalled event, the respondent reported hurt or disappointment as the first emotion.", "reported_emotion")]),
      choice("anger", "Irritation. Apparently I had been elected mayor of How Dare They.", "Reports irritation or anger as the first emotion.", [literalSignal("GQB1-005", "anger", "first emotion", "irritation_or_anger", "For the recalled event, the respondent reported irritation or anger as the first emotion.", "reported_emotion")]),
      choice("curiosity", "Curiosity. I immediately wanted the missing episode recap.", "Reports curiosity as the first response.", [literalSignal("GQB1-005", "curiosity", "first emotion", "curiosity", "For the recalled event, the respondent reported curiosity as the first response.", "reported_emotion")]),
      choice("numb", "Nothing readable. The internal subtitles were unavailable.", "Reports no clearly readable first emotion.", [literalSignal("GQB1-005", "numb", "first emotion", "not_clearly_readable", "For the recalled event, the respondent could not identify a clear first emotion.", "reported_emotion")]),
    ],
    exits: [
      { id: "no_recent", text: "No recent example comes to mind", reason: "no_recent_example" },
      ...STANDARD_EXITS,
    ],
  },
  {
    itemId: "GQB1-006",
    sectionId: "social_theater",
    tone: "internet_native",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "response to an important delayed reply",
    prompt: "Someone important has left your message marinating for long enough to develop a personality. What do you actually do?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant event",
    eligibleAxes: ["social_signal_style", "activation_tempo"],
    requiredAnyPermissions: ["friends", "dating", "family"],
    authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "medium" },
    options: [
      choice("ask", "Ask if everything is okay. I prefer data to fan fiction.", "Would ask directly about the delay.", [
        axisSignal("GQB1-006", "ask", "social_signal_style", "right", 1, "For the recalled event, the respondent reported asking directly about the delayed reply."),
        axisSignal("GQB1-006", "ask", "activation_tempo", "right", 1, "For the recalled event, the respondent reported acting on the delayed reply by asking directly."),
      ]),
      choice("double", "Send a second message with a suspiciously casual little hat on it.", "Would send a low-pressure follow-up.", [
        axisSignal("GQB1-006", "double", "social_signal_style", "right", 0.7, "For the recalled event, the respondent reported sending a low-pressure follow-up."),
        axisSignal("GQB1-006", "double", "activation_tempo", "right", 0.7, "For the recalled event, the respondent reported acting on the delay with a follow-up."),
      ]),
      choice("draft", "Write a follow-up, then leave it in drafts until I know I still mean it.", "Would prepare but not send a follow-up.", [
        axisSignal("GQB1-006", "draft", "social_signal_style", "left", 0.7, "For the recalled event, the respondent reported drafting but withholding a follow-up."),
        axisSignal("GQB1-006", "draft", "activation_tempo", "left", 0.7, "For the recalled event, the respondent reported pausing before acting on the delayed reply."),
      ]),
      choice("wait", "Give them space and continue with my day.", "Would wait without raising the delay.", [
        axisSignal("GQB1-006", "wait", "social_signal_style", "left", 1, "For the recalled event, the respondent reported waiting without raising the delayed reply."),
        axisSignal("GQB1-006", "wait", "activation_tempo", "left", 1, "For the recalled event, the respondent reported waiting rather than acting on the delayed reply."),
      ]),
    ],
    exits: [{ id: "no_recent", text: "No recent example", reason: "no_recent_example" }, ...STANDARD_EXITS],
  },
  {
    itemId: "GQB1-007",
    sectionId: "social_theater",
    tone: "dry_roast",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "repair after a joke lands badly",
    prompt: "Your joke lands wrong and the room develops weather. In the first minute, which move comes first?",
    sourceStatus: "hypothetical_choice",
    eligibleAxes: ["social_signal_style", "friction_posture"],
    requiredAnyPermissions: ["friends", "work_school"],
    authoredContext: { setting: "peer_group", audience: "public_group", stakes: "medium" },
    options: [
      choice("name", "Name it immediately: ‘That came out wrong. I’m sorry.’", "Would acknowledge and apologize immediately.", [
        axisSignal("GQB1-007", "name", "social_signal_style", "right", 1, "In this scenario, the selected response makes the repair explicit in the room."),
        axisSignal("GQB1-007", "name", "friction_posture", "right", 1, "In this scenario, the selected response addresses the rupture immediately."),
      ]),
      choice("check_private", "Check on the person privately before my soul leaves my body.", "Would initiate a private repair.", [
        axisSignal("GQB1-007", "check_private", "social_signal_style", "left", 0.7, "In this scenario, the selected response moves the repair into a private conversation."),
        axisSignal("GQB1-007", "check_private", "friction_posture", "right", 0.7, "In this scenario, the selected response actively checks the impact and attempts repair."),
      ]),
      choice("ask", "Ask whether it landed badly instead of appointing myself judge and jury.", "Would ask about the impact.", [
        axisSignal("GQB1-007", "ask", "social_signal_style", "right", 0.7, "In this scenario, the selected response asks visibly about the impact."),
        axisSignal("GQB1-007", "ask", "friction_posture", "right", 0.7, "In this scenario, the selected response opens a repair conversation."),
      ]),
      choice("outfunny", "Lighten the room first and see whether the tension stays.", "Would first try to lighten the room without naming the rupture.", [
        axisSignal("GQB1-007", "outfunny", "social_signal_style", "right", 0.35, "In this scenario, the selected response stays outwardly expressive without naming the rupture."),
        axisSignal("GQB1-007", "outfunny", "friction_posture", "left", 0.7, "In this scenario, the selected response avoids directly addressing the rupture."),
      ]),
      choice("vanish", "Pause without addressing it in the room.", "Would pause without addressing the joke in the room.", [
        axisSignal("GQB1-007", "vanish", "social_signal_style", "left", 1, "In this scenario, the selected response withdraws rather than signaling a repair."),
        axisSignal("GQB1-007", "vanish", "friction_posture", "left", 1, "In this scenario, the selected response waits rather than addressing the rupture."),
      ]),
    ],
  },
  {
    itemId: "GQB1-008",
    sectionId: "secret_menu",
    tone: "mischievous_projective",
    sensitivity: "high_optional",
    responseFormat: "single_choice",
    construct: "imagined message fantasy",
    prompt: "If you feel like playing: imagine one message could land with no social fallout. You do not need to name anyone, and you can skip. Which draft feels closest?",
    sourceStatus: "stated_preference",
    projective: true,
    requiredAnyPermissions: ["private_thoughts"],
    disallowedDisclosureModes: ["surface"],
    authoredContext: { setting: "close_relationship", audience: "private_self", stakes: "high" },
    options: [
      choice("desire", "‘I want you. There, the draft escaped.’", "Selects a fantasy of directly expressing desire.", [literalSignal("GQB1-008", "desire", "fantasy content", "express_desire", "In this consequence-free prompt, the respondent selected a fantasy of directly expressing desire.", "reported_fantasy")]),
      choice("callout", "‘You knew exactly what you were doing.’", "Selects a fantasy of confronting someone.", [literalSignal("GQB1-008", "callout", "fantasy content", "confront_someone", "In this consequence-free prompt, the respondent selected a fantasy of confronting someone.", "reported_fantasy")]),
      choice("reassurance", "‘Please tell me we are actually okay.’", "Selects a fantasy of directly requesting reassurance.", [literalSignal("GQB1-008", "reassurance", "fantasy content", "request_reassurance", "In this consequence-free prompt, the respondent selected a fantasy of directly requesting reassurance.", "reported_fantasy")]),
      choice("envy", "‘I’m happy for you, and yes, part of me is jealous.’", "Selects a fantasy of admitting mixed envy.", [literalSignal("GQB1-008", "envy", "fantasy content", "admit_envy", "In this consequence-free prompt, the respondent selected a fantasy of admitting mixed envy.", "reported_fantasy")]),
    ],
  },
  {
    itemId: "GQB1-009",
    sectionId: "secret_menu",
    tone: "heist_comedy",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "harmless unfamiliar-treat temptation",
    prompt: "At a party, one plate has your reliable favorite and one has the host’s strange signature dessert. You have room for one. Which first pull feels closest? This is a hypothetical, not a confession booth.",
    sourceStatus: "hypothetical_choice",
    projective: true,
    eligibleAxes: ["novelty_aperture"],
    requiredAnyPermissions: ["private_thoughts"],
    disallowedDisclosureModes: ["surface"],
    authoredContext: { setting: "social_event", audience: "public_group", stakes: "low" },
    options: [
      choice("strange", "The strange signature dessert. Today we acquire dessert lore.", "Selects the unfamiliar dessert.", [
        literalSignal("GQB1-009", "strange", "temptation", "choose_unfamiliar", "In this hypothetical prompt, the respondent selected the unfamiliar dessert.", "reported_temptation"),
        axisSignal("GQB1-009", "strange", "novelty_aperture", "right", 1, "In this low-stakes hypothetical, the selected response chooses the unfamiliar option."),
      ]),
      choice("favorite", "The favorite. Reliability has already completed dessert probation.", "Selects the familiar dessert.", [
        literalSignal("GQB1-009", "favorite", "temptation", "choose_familiar", "In this hypothetical prompt, the respondent selected the familiar dessert.", "reported_temptation"),
        axisSignal("GQB1-009", "favorite", "novelty_aperture", "left", 1, "In this low-stakes hypothetical, the selected response chooses the familiar option."),
      ]),
      choice("sample", "Request a tiny sample of the strange one before awarding the plate.", "Selects sampling the unfamiliar dessert before choosing.", [
        literalSignal("GQB1-009", "sample", "temptation", "sample_then_choose", "In this hypothetical prompt, the respondent selected sampling the unfamiliar dessert before choosing.", "reported_temptation"),
        axisSignal("GQB1-009", "sample", "novelty_aperture", "right", 0.7, "In this low-stakes hypothetical, the selected response samples the unfamiliar option before choosing."),
      ]),
      choice("half", "Half of each, if the laws of plating permit it.", "Selects trying both desserts.", [literalSignal("GQB1-009", "half", "temptation", "try_both", "In this hypothetical prompt, the respondent selected trying both desserts.", "reported_temptation")]),
      choice("pass", "Neither. My attention has joined another subplot.", "Selects neither offered dessert.", [literalSignal("GQB1-009", "pass", "temptation", "neither", "In this hypothetical prompt, the respondent selected neither offered dessert.", "reported_temptation")]),
    ],
  },
  {
    itemId: "GQB1-010",
    sectionId: "secret_menu",
    tone: "domestic_absurdity",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "temptation versus prior intention",
    prompt: "Think of the last plan you wanted all week. When it was time to leave and your blanket made a competitive offer, what won?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant plan",
    authoredContext: { setting: "social_event", audience: "private_self", stakes: "low" },
    options: [
      choice("cancel", "Blanket. I issued a tasteful cancellation and rejoined civilization later.", "Reports staying home for the recalled plan.", [literalSignal("GQB1-010", "cancel", "temptation outcome", "stayed_home", "For the recalled plan, the respondent reported staying home.", "reported_action")]),
      choice("delay", "I negotiated with the ceiling until the decision nearly made itself.", "Reports delaying the decision for the recalled plan.", [literalSignal("GQB1-010", "delay", "temptation outcome", "delayed_decision", "For the recalled plan, the respondent reported delaying the decision.", "reported_action")]),
      choice("brief", "I went, but on a limited diplomatic visa.", "Reports attending briefly for the recalled plan.", [literalSignal("GQB1-010", "brief", "temptation outcome", "attended_briefly", "For the recalled plan, the respondent reported attending briefly.", "reported_action")]),
      choice("go", "I left before home-me could launch an appeal.", "Reports following through for the recalled plan.", [literalSignal("GQB1-010", "go", "temptation outcome", "followed_through", "For the recalled plan, the respondent reported following through.", "reported_action")]),
    ],
  },
  {
    itemId: "GQB1-011",
    sectionId: "secret_menu",
    tone: "mischievous_projective",
    sensitivity: "high_optional",
    responseFormat: "single_choice",
    construct: "wish to be understood without explanation",
    prompt: "Optional secret-menu question: what do you most wish people understood without requiring your full director’s commentary?",
    sourceStatus: "stated_preference",
    projective: true,
    requiredAnyPermissions: ["private_thoughts"],
    disallowedDisclosureModes: ["surface"],
    authoredContext: { setting: "close_relationship", audience: "private_self", stakes: "high" },
    options: [
      choice("space", "Needing space is not the same as caring less.", "Selects a wish for others to understand a need for space.", [literalSignal("GQB1-011", "space", "desired understanding", "space_not_less_care", "The respondent selected a wish for others to understand that needing space does not mean caring less.", "reported_desire")]),
      choice("invite", "Sometimes I want the invitation even when I might say no.", "Selects a wish to remain included without committing to attend.", [literalSignal("GQB1-011", "invite", "desired understanding", "want_invitation_without_commitment", "The respondent selected a wish for others to understand that an invitation can matter even when they may decline.", "reported_desire")]),
      choice("quiet", "My excitement is real even when it arrives without fireworks.", "Selects a wish for quieter excitement to be recognized.", [literalSignal("GQB1-011", "quiet", "desired understanding", "quiet_excitement", "The respondent selected a wish for quieter expressions of excitement to be recognized.", "reported_desire")]),
      choice("direct", "When I am direct, I am usually trying to make the relationship easier to navigate.", "Selects a wish for directness to be understood as navigation.", [literalSignal("GQB1-011", "direct", "desired understanding", "directness_as_navigation", "The respondent selected a wish for their directness to be understood as an attempt to make the relationship easier to navigate.", "reported_desire")]),
      choice("time", "I may need time before I know what I actually feel.", "Selects a wish for emotional processing time to be understood.", [literalSignal("GQB1-011", "time", "desired understanding", "processing_time", "The respondent selected a wish for their emotional processing time to be understood.", "reported_desire")]),
    ],
  },
  {
    itemId: "GQB1-012",
    sectionId: "when_real",
    tone: "plain_warm",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "response to a visible mistake",
    prompt: "Think of the last mistake other people could actually see. In the first minute, which move came first?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent visible mistake",
    eligibleAxes: ["social_signal_style", "friction_posture"],
    requiredAnyPermissions: ["work_school"],
    authoredContext: { setting: "work_school", audience: "public_group", stakes: "medium" },
    options: [
      choice("own", "Named it and said what I would do next.", "Reported naming the mistake and next step.", [
        axisSignal("GQB1-012", "own", "social_signal_style", "right", 1, "For the recalled event, the respondent reported naming the visible mistake and the next step."),
        axisSignal("GQB1-012", "own", "friction_posture", "right", 1, "For the recalled event, the respondent reported addressing the mistake immediately."),
      ]),
      choice("fix_first", "Tried to fix it before making an announcement about my downfall.", "Reported attempting a repair before discussing the mistake.", [
        axisSignal("GQB1-012", "fix_first", "social_signal_style", "left", 0.7, "For the recalled event, the respondent reported attempting a repair before discussing the mistake."),
        axisSignal("GQB1-012", "fix_first", "friction_posture", "right", 0.7, "For the recalled event, the respondent reported actively repairing the mistake."),
      ]),
      choice("explain", "Explained the context immediately, perhaps with a suspicious amount of evidence.", "Reported immediately explaining the context.", [
        axisSignal("GQB1-012", "explain", "social_signal_style", "right", 0.7, "For the recalled event, the respondent reported immediately explaining the context around the mistake."),
        axisSignal("GQB1-012", "explain", "friction_posture", "right", 0.35, "For the recalled event, the respondent reported engaging with the mistake through explanation."),
      ]),
      choice("quiet", "Paused and collected myself before saying anything.", "Reported pausing before discussing the mistake.", [
        axisSignal("GQB1-012", "quiet", "social_signal_style", "left", 1, "For the recalled event, the respondent reported becoming quiet before discussing the mistake."),
        axisSignal("GQB1-012", "quiet", "friction_posture", "left", 0.7, "For the recalled event, the respondent reported waiting before addressing the mistake."),
      ]),
    ],
    exits: [{ id: "no_recent", text: "No example comes to mind", reason: "no_recent_example" }, ...STANDARD_EXITS],
  },
  {
    itemId: "GQB1-013",
    sectionId: "when_real",
    tone: "plain_warm",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "response to an ambiguous task",
    prompt: "Last time you received an important task with fog where the instructions should be, what did you actually do?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant task",
    eligibleAxes: ["activation_tempo", "structure_reliance"],
    requiredAnyPermissions: ["work_school"],
    authoredContext: { setting: "work_school", audience: "one_to_one", stakes: "medium" },
    options: [
      choice("prototype", "Made a rough first version so the confusion had something physical to fight.", "Reported making a rough first version.", [
        axisSignal("GQB1-013", "prototype", "activation_tempo", "right", 1, "For the recalled task, the respondent reported creating a rough first version before full clarity."),
        axisSignal("GQB1-013", "prototype", "structure_reliance", "left", 0.7, "For the recalled task, the respondent reported using a prototype rather than seeking a complete plan first."),
      ]),
      choice("questions", "Turned the fog into a list of questions and requested coordinates.", "Reported structuring questions before proceeding.", [
        axisSignal("GQB1-013", "questions", "activation_tempo", "right", 0.35, "For the recalled task, the respondent reported taking an early clarification step."),
        axisSignal("GQB1-013", "questions", "structure_reliance", "right", 1, "For the recalled task, the respondent reported creating structure through explicit questions."),
      ]),
      choice("model", "Found an example and reverse-engineered what ‘good’ probably meant.", "Reported finding a model before proceeding.", [
        axisSignal("GQB1-013", "model", "activation_tempo", "right", 0.35, "For the recalled task, the respondent reported beginning by finding an example."),
        axisSignal("GQB1-013", "model", "structure_reliance", "right", 0.7, "For the recalled task, the respondent reported using an existing model to create structure."),
      ]),
      choice("wait", "Waited for clearer instructions rather than manufacturing the wrong universe.", "Reported waiting for clearer instructions.", [
        axisSignal("GQB1-013", "wait", "activation_tempo", "left", 1, "For the recalled task, the respondent reported waiting for clearer instructions."),
        axisSignal("GQB1-013", "wait", "structure_reliance", "right", 1, "For the recalled task, the respondent reported requiring clearer structure before proceeding."),
      ]),
    ],
    exits: [{ id: "no_recent", text: "No recent example", reason: "no_recent_example" }, ...STANDARD_EXITS],
  },
  {
    itemId: "GQB1-014",
    sectionId: "when_real",
    tone: "plain_warm",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "response to an unfamiliar invitation",
    prompt: "Think of the last invitation where you knew almost nobody. What did you actually do?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant invitation",
    eligibleAxes: ["novelty_aperture"],
    requiredAnyPermissions: ["friends"],
    authoredContext: { setting: "social_event", audience: "unfamiliar_group", stakes: "medium" },
    options: [
      choice("go", "Went and let future-me locate the exits.", "Reported attending without additional preparation.", [
        axisSignal("GQB1-014", "go", "novelty_aperture", "right", 1, "For the recalled invitation, the respondent reported entering the unfamiliar setting without additional preparation."),
      ]),
      choice("ally", "Went after securing one human life raft.", "Reported attending after arranging a familiar contact.", [
        axisSignal("GQB1-014", "ally", "novelty_aperture", "right", 0.7, "For the recalled invitation, the respondent reported entering the unfamiliar setting with a familiar contact."),
      ]),
      choice("research", "Investigated the people, place and likely escape routes first.", "Reported researching the unfamiliar setting before deciding.", [
        axisSignal("GQB1-014", "research", "novelty_aperture", "right", 0.35, "For the recalled invitation, the respondent reported keeping the unfamiliar setting open while reducing uncertainty."),
      ]),
      choice("decline", "Declined. Mystery is charming until it requires trousers.", "Reported declining the unfamiliar invitation.", [
        axisSignal("GQB1-014", "decline", "novelty_aperture", "left", 1, "For the recalled invitation, the respondent reported declining the unfamiliar setting."),
      ]),
    ],
    exits: [{ id: "no_recent", text: "No recent example", reason: "no_recent_example" }, ...STANDARD_EXITS],
  },
  {
    itemId: "GQB1-015",
    sectionId: "when_real",
    tone: "plain_warm",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "help request under low capacity",
    prompt: "Last time someone asked for help when your internal battery was already showing a red icon, what did you do?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent relevant request",
    eligibleAxes: ["social_signal_style", "friction_posture"],
    requiredAnyPermissions: ["friends", "family", "work_school"],
    authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "medium" },
    options: [
      choice("clear_no", "Said I could not do it and did not submit a closing argument.", "Reported declining directly.", [
        axisSignal("GQB1-015", "clear_no", "social_signal_style", "right", 1, "For the recalled request, the respondent reported communicating the refusal directly."),
        axisSignal("GQB1-015", "clear_no", "friction_posture", "right", 1, "For the recalled request, the respondent reported setting a clear boundary."),
      ]),
      choice("smaller", "Offered a smaller version I could genuinely manage.", "Reported negotiating a smaller form of help.", [
        axisSignal("GQB1-015", "smaller", "social_signal_style", "right", 0.7, "For the recalled request, the respondent reported communicating a smaller available offer."),
        axisSignal("GQB1-015", "smaller", "friction_posture", "right", 0.7, "For the recalled request, the respondent reported negotiating the boundary."),
      ]),
      choice("yes_resent", "Said yes without mentioning my low battery; handled the feeling privately.", "Reported agreeing without communicating low capacity.", [
        axisSignal("GQB1-015", "yes_resent", "social_signal_style", "left", 0.7, "For the recalled request, the respondent reported not communicating the low capacity directly."),
        axisSignal("GQB1-015", "yes_resent", "friction_posture", "left", 1, "For the recalled request, the respondent reported agreeing rather than setting a capacity boundary."),
      ]),
      choice("delay", "Delayed answering until circumstances or guilt made the decision for me.", "Reported delaying the response.", [
        axisSignal("GQB1-015", "delay", "social_signal_style", "left", 1, "For the recalled request, the respondent reported delaying communication."),
        axisSignal("GQB1-015", "delay", "friction_posture", "left", 0.7, "For the recalled request, the respondent reported waiting rather than setting an immediate boundary."),
      ]),
    ],
    exits: [{ id: "no_recent", text: "No recent example", reason: "no_recent_example" }, ...STANDARD_EXITS],
  },
  {
    itemId: "GQB1-016",
    sectionId: "operating_mode",
    tone: "kinetic",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "response to a last-minute plan change",
    prompt: "Think of the last time a plan changed at the last minute. Which version of you clocked in?",
    sourceStatus: "retrospective_self_report",
    referencePeriod: "most recent last-minute plan change",
    eligibleAxes: ["structure_reliance"],
    authoredContext: { setting: "general_plan", audience: "public_group", stakes: "low" },
    options: [
      choice("pivot", "‘New plot.’ I pivoted before the old plan finished buffering.", "Reports adapting without rebuilding the plan first.", [
        axisSignal("GQB1-016", "pivot", "structure_reliance", "left", 1, "For the recalled change, the respondent reported adapting without rebuilding structure first."),
      ]),
      choice("minimum", "I asked for the new time, place and one sentence explaining reality.", "Reports requesting minimal concrete details.", [
        axisSignal("GQB1-016", "minimum", "structure_reliance", "right", 0.35, "For the recalled change, the respondent reported requesting a small amount of concrete structure."),
      ]),
      choice("rebuild", "I rebuilt the plan because someone had attacked the load-bearing spreadsheet.", "Reports reconstructing the plan before continuing.", [
        axisSignal("GQB1-016", "rebuild", "structure_reliance", "right", 1, "For the recalled change, the respondent reported rebuilding structure before continuing."),
      ]),
      choice("exit", "I stopped participating. The original timeline was part of the product.", "Reports withdrawing after the last-minute change.", [
        axisSignal("GQB1-016", "exit", "structure_reliance", "right", 0.7, "For the recalled change, the respondent reported that loss of the original structure affected willingness to continue."),
      ]),
    ],
  },
  {
    itemId: "GQB1-017",
    sectionId: "operating_mode",
    tone: "adventure_comedy",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "response to an unfamiliar opportunity",
    prompt: "An opportunity appears with real upside and absolutely no user manual. What gets it through customs?",
    sourceStatus: "hypothetical_choice",
    eligibleAxes: ["novelty_aperture"],
    authoredContext: { setting: "self_directed", audience: "private_self", stakes: "medium" },
    options: [
      choice("try", "A small reversible trial. Adventure, but with an undo button.", "Would run a small reversible trial.", [
        axisSignal("GQB1-017", "try", "novelty_aperture", "right", 1, "In this scenario, the selected response experiments with the unfamiliar opportunity through a reversible trial."),
      ]),
      choice("criteria", "Keep it in consideration while I give it three criteria and a deadline.", "Would keep the opportunity in consideration while applying decision criteria.", [
        axisSignal("GQB1-017", "criteria", "novelty_aperture", "right", 0.7, "In this scenario, the selected response keeps the unfamiliar opportunity in consideration while applying decision criteria."),
      ]),
      choice("expert", "Keep it on the table while I find someone who survived this side quest.", "Would keep the opportunity open while seeking an experienced reference.", [
        axisSignal("GQB1-017", "expert", "novelty_aperture", "right", 0.35, "In this scenario, the selected response keeps the unfamiliar opportunity open while seeking an experienced reference."),
      ]),
      choice("known", "Choose a familiar alternative. I do not owe every mystery a character arc.", "Would choose a familiar alternative.", [
        axisSignal("GQB1-017", "known", "novelty_aperture", "left", 1, "In this scenario, the selected response chooses a familiar alternative over the unfamiliar opportunity."),
      ]),
    ],
  },
  {
    itemId: "GQB1-018",
    sectionId: "operating_mode",
    tone: "committee_satire",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "response to group indecision",
    prompt: "The group has discussed dinner for forty minutes and accidentally invented a parliament. What do you do?",
    sourceStatus: "hypothetical_choice",
    eligibleAxes: ["activation_tempo", "structure_reliance"],
    requiredAnyPermissions: ["friends", "work_school"],
    authoredContext: { setting: "peer_group", audience: "public_group", stakes: "low" },
    options: [
      choice("book", "Book something before the committee develops subcommittees.", "Would choose and execute an option.", [
        axisSignal("GQB1-018", "book", "activation_tempo", "right", 1, "In this scenario, the selected response moves the group into action immediately."),
        axisSignal("GQB1-018", "book", "structure_reliance", "left", 0.7, "In this scenario, the selected response resolves uncertainty through action rather than additional planning."),
      ]),
      choice("vote", "Drop two acceptable options and force democracy to finish its shift.", "Would reduce the options and call for a vote.", [
        axisSignal("GQB1-018", "vote", "activation_tempo", "right", 0.7, "In this scenario, the selected response creates an immediate decision step."),
        axisSignal("GQB1-018", "vote", "structure_reliance", "right", 0.7, "In this scenario, the selected response creates a simple decision structure."),
      ]),
      choice("goal", "Ask what people actually care about: cheap, close or good.", "Would clarify decision criteria.", [
        axisSignal("GQB1-018", "goal", "activation_tempo", "right", 0.35, "In this scenario, the selected response advances the decision by clarifying priorities."),
        axisSignal("GQB1-018", "goal", "structure_reliance", "right", 1, "In this scenario, the selected response establishes explicit decision criteria."),
      ]),
      choice("observe", "Let the process continue. I am now studying it as a natural phenomenon.", "Would continue observing without intervening.", [
        axisSignal("GQB1-018", "observe", "activation_tempo", "left", 1, "In this scenario, the selected response waits rather than intervening in the decision."),
      ]),
    ],
  },
  {
    itemId: "GQB1-019",
    sectionId: "prediction_booth",
    tone: "clean_playful",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "heldout activation tempo",
    prompt: "Your train stops one station early and the announcement explains almost nothing. Which move comes first?",
    sourceStatus: "heldout",
    eligibleAxes: ["activation_tempo"],
    authoredContext: { setting: "public_service", audience: "unfamiliar_group", stakes: "medium" },
    options: [
      choice("wait", "Stay put until the next announcement gives the plot back.", "Would wait for another announcement.", [axisSignal("GQB1-019", "wait", "activation_tempo", "left", 1, "In this held-out scenario, the selected response waits for another announcement before acting.")]),
      choice("ask", "Find staff and ask for the actual options.", "Would immediately seek actionable information.", [axisSignal("GQB1-019", "ask", "activation_tempo", "right", 0.7, "In this held-out scenario, the selected response immediately seeks actionable information.")]),
      choice("route", "Get off and build a new route from the platform.", "Would immediately begin an alternate route.", [axisSignal("GQB1-019", "route", "activation_tempo", "right", 1, "In this held-out scenario, the selected response immediately begins an alternate route.")]),
      choice("scan", "Check the map and crowd movement before choosing.", "Would assess available signals before moving.", [axisSignal("GQB1-019", "scan", "activation_tempo", "left", 0.35, "In this held-out scenario, the selected response assesses available signals before moving.")]),
    ],
  },
  {
    itemId: "GQB1-020",
    sectionId: "prediction_booth",
    tone: "clean_playful",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "heldout social signal style",
    prompt: "A friend shares genuinely good news in a busy group chat. Which response is closest to yours?",
    sourceStatus: "heldout",
    eligibleAxes: ["social_signal_style"],
    authoredContext: { setting: "peer_group", audience: "public_group", stakes: "low" },
    options: [
      choice("private", "Send them a detailed private message later.", "Would respond with detailed private support.", [axisSignal("GQB1-020", "private", "social_signal_style", "left", 1, "In this held-out scenario, the selected response communicates detailed support privately.")]),
      choice("public", "Celebrate loudly in the chat while the confetti window is open.", "Would celebrate visibly in the group.", [axisSignal("GQB1-020", "public", "social_signal_style", "right", 1, "In this held-out scenario, the selected response communicates celebration visibly in the group.")]),
      choice("react", "React now, then follow up when I have something real to say.", "Would signal briefly in public and follow up later.", [axisSignal("GQB1-020", "react", "social_signal_style", "left", 0.35, "In this held-out scenario, the selected response uses a brief public signal and reserves fuller communication for later.")]),
      choice("call", "Leave the chat and call them one-to-one.", "Would move the celebration to a one-to-one channel.", [axisSignal("GQB1-020", "call", "social_signal_style", "left", 0.7, "In this held-out scenario, the selected response moves the celebration to a one-to-one channel.")]),
    ],
  },
  {
    itemId: "GQB1-021",
    sectionId: "prediction_booth",
    tone: "clean_playful",
    sensitivity: "medium",
    responseFormat: "single_choice",
    construct: "heldout friction posture",
    prompt: "A shared-space annoyance has happened for the third time. What is your first move?",
    sourceStatus: "heldout",
    eligibleAxes: ["friction_posture"],
    authoredContext: { setting: "household", audience: "one_to_one", stakes: "low" },
    options: [
      choice("fix", "Fix it myself this time and watch whether a pattern develops a fourth season.", "Would fix the issue without raising it yet.", [axisSignal("GQB1-021", "fix", "friction_posture", "left", 1, "In this held-out scenario, the selected response fixes the issue without raising it yet.")]),
      choice("private", "Ask the relevant person privately for a different system.", "Would address the issue privately and request a change.", [axisSignal("GQB1-021", "private", "friction_posture", "right", 0.7, "In this held-out scenario, the selected response privately addresses the recurring issue and requests a change.")]),
      choice("group", "Name the recurring issue to everyone and propose a rule.", "Would address the issue with the group and propose a rule.", [axisSignal("GQB1-021", "group", "friction_posture", "right", 1, "In this held-out scenario, the selected response addresses the recurring issue with the group.")]),
    ],
  },
  {
    itemId: "GQB1-022",
    sectionId: "prediction_booth",
    tone: "clean_playful",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "heldout structure reliance",
    prompt: "You get an empty room and two hours to make a small gathering work. Where do you begin?",
    sourceStatus: "heldout",
    eligibleAxes: ["structure_reliance"],
    authoredContext: { setting: "self_directed", audience: "public_group", stakes: "low" },
    options: [
      choice("anchors", "Choose three anchors—food, music, seating—and improvise the rest.", "Would establish a few anchors and improvise around them.", [axisSignal("GQB1-022", "anchors", "structure_reliance", "left", 0.35, "In this held-out scenario, the selected response uses a few anchors while leaving the rest flexible.")]),
      choice("plan", "Make a short sequence so future-me does not inherit a room-shaped emergency.", "Would create a short ordered plan.", [axisSignal("GQB1-022", "plan", "structure_reliance", "right", 1, "In this held-out scenario, the selected response creates a short ordered plan.")]),
      choice("start", "Start arranging the room and let the next need announce itself.", "Would begin and adapt without a prior sequence.", [axisSignal("GQB1-022", "start", "structure_reliance", "left", 1, "In this held-out scenario, the selected response begins and adapts without a prior sequence.")]),
      choice("model", "Find one setup that worked before and adapt it.", "Would adapt an existing model.", [axisSignal("GQB1-022", "model", "structure_reliance", "right", 0.7, "In this held-out scenario, the selected response uses an existing model to structure the setup.")]),
    ],
  },
  {
    itemId: "GQB1-023",
    sectionId: "prediction_booth",
    tone: "clean_playful",
    sensitivity: "low",
    responseFormat: "single_choice",
    construct: "heldout novelty aperture",
    prompt: "A tool you already know offers an optional beta workflow that could save time but will feel unfamiliar. What do you choose?",
    sourceStatus: "heldout",
    eligibleAxes: ["novelty_aperture"],
    authoredContext: { setting: "self_directed", audience: "private_self", stakes: "medium" },
    options: [
      choice("classic", "Keep the known workflow. Reliability has already passed probation.", "Would keep the familiar workflow.", [axisSignal("GQB1-023", "classic", "novelty_aperture", "left", 1, "In this held-out scenario, the selected response keeps the familiar workflow.")]),
      choice("beta", "Try the beta on one low-risk task and collect evidence.", "Would test the unfamiliar workflow on a low-risk task.", [axisSignal("GQB1-023", "beta", "novelty_aperture", "right", 1, "In this held-out scenario, the selected response tests the unfamiliar workflow on a low-risk task.")]),
      choice("reviews", "Wait for other people to discover the exciting new bugs first.", "Would wait for external experience before deciding.", [axisSignal("GQB1-023", "reviews", "novelty_aperture", "left", 0.35, "In this held-out scenario, the selected response waits for external experience before trying the unfamiliar workflow.")]),
    ],
  },
];

function toTemplate(spec) {
  const heldout = spec.sourceStatus === "heldout";
  const exits = spec.exits || (spec.sectionId === "permission_lobby" ? [{ id: "skip", text: "Skip", reason: "skip" }] : STANDARD_EXITS);
  return defineQuestionTemplate({
    itemId: spec.itemId,
    surveyVersion: QUESTION_SURVEY_V1_VERSION,
    bankVersion: QUESTION_BANK_V1_VERSION,
    semanticVersion: `${spec.itemId.toLowerCase()}-semantic-v1`,
    wordingVersion: QUESTION_WORDING_V1_VERSION,
    mappingVersion: QUESTION_MAPPING_V1_VERSION,
    adapterVersion: QUESTION_ADAPTER_V1_VERSION,
    responseFormat: spec.responseFormat,
    construct: spec.construct,
    prompt: spec.prompt,
    referencePeriod: spec.referencePeriod || (heldout ? "heldout occasion" : "selected situation"),
    eligibleAxes: spec.eligibleAxes || [],
    contextSchema: spec.contextSchema || CONTEXT_SCHEMA,
    authoredContext: spec.authoredContext || {},
    projectionContextKeys: spec.projectionContextKeys || ["setting", "audience", "stakes"],
    event: {
      id: `${spec.itemId.toLowerCase()}-event`,
      kind: spec.sourceStatus === "retrospective_self_report" || spec.sourceStatus === "repeated_self_report"
        ? "reported_event"
        : spec.projective ? "projective_prompt" : heldout ? "heldout_scenario" : "scenario",
      phase: heldout ? "heldout" : "profile",
      sourceStatus: spec.sourceStatus,
      claimLimits: [
        "Supports only the authored interpretation of the selected response.",
        ...(spec.projective ? ["Fantasy, temptation or desired-understanding content is not evidence that the respondent acted or will act on it."] : []),
      ],
      notEvidenceFor: spec.projective
        ? [...SENSITIVE_NON_CLAIMS]
        : ["diagnosis", "formal personality score", "moral worth", "secret motive"],
    },
    options: spec.options,
    exits,
  });
}

export const QUESTION_SEQUENCE_V1 = Object.freeze([
  "GQB1-001", "GQB1-002", "GQB1-003",
  "GQB1-004", "GQB1-005", "GQB1-006", "GQB1-007",
  "GQB1-010", "GQB1-009", "GQB1-011", "GQB1-008",
  "GQB1-012", "GQB1-013", "GQB1-014", "GQB1-015",
  "GQB1-016", "GQB1-017", "GQB1-018",
  "GQB1-019", "GQB1-020", "GQB1-021", "GQB1-022", "GQB1-023",
]);

export const QUESTION_CONSENT_V1 = Object.freeze({
  id: "genii-question-consent-v1",
  disclosureModeItemId: "GQB1-002",
  topicPermissionItemId: "GQB1-003",
  rule: "A topic permission opens eligible prompts; it never creates personality evidence. Surface mode blocks all high-optional projective prompts.",
});

export const QUESTION_PRESENTATION_V1 = Object.freeze(ITEM_SPECS.map((spec) => Object.freeze({
  itemId: spec.itemId,
  sectionId: spec.sectionId,
  tone: spec.tone,
  sensitivity: spec.sensitivity,
  scored: spec.scored !== false,
  prompt: spec.prompt,
  optionIds: spec.options.map((option) => option.id),
  requiredAnyPermissions: [...(spec.requiredAnyPermissions || [])],
  disallowedDisclosureModes: [...(spec.disallowedDisclosureModes || [])],
  sequence: QUESTION_SEQUENCE_V1.indexOf(spec.itemId),
})));

export const QUESTION_TEMPLATES_V1 = Object.freeze(ITEM_SPECS.map(toTemplate));

export const QUESTION_BANK_MANIFEST_V1 = createBankManifest(QUESTION_TEMPLATES_V1, {
  // Public labels and claim text remain founder-review gates. Runtime callers
  // cannot opt into public claims or axes until a future bank version allows it.
  publicAxisIds: [],
  publicClaimTemplateIds: [],
});

export function questionTemplateV1(itemId) {
  return QUESTION_TEMPLATES_V1.find((template) => template.itemId === itemId) || null;
}

export function questionPresentationV1(itemId) {
  return QUESTION_PRESENTATION_V1.find((item) => item.itemId === itemId) || null;
}

export function questionsForSectionV1(sectionId) {
  return QUESTION_TEMPLATES_V1
    .filter((template) => questionPresentationV1(template.itemId)?.sectionId === sectionId)
    .sort((left, right) => questionPresentationV1(left.itemId).sequence - questionPresentationV1(right.itemId).sequence);
}

export function questionEligibilityV1(itemId, answers = {}) {
  const presentation = questionPresentationV1(itemId);
  if (!presentation) return Object.freeze({ eligible: false, reason: "unknown_item" });
  const disclosureMode = answers[QUESTION_CONSENT_V1.disclosureModeItemId] || null;
  const rawPermissions = answers[QUESTION_CONSENT_V1.topicPermissionItemId];
  const permissions = new Set(Array.isArray(rawPermissions) ? rawPermissions : rawPermissions ? [rawPermissions] : []);
  if (presentation.disallowedDisclosureModes.includes(disclosureMode)) {
    return Object.freeze({ eligible: false, reason: "disclosure_mode_blocked" });
  }
  if (presentation.requiredAnyPermissions.length > 0 && !presentation.requiredAnyPermissions.some((permission) => permissions.has(permission))) {
    return Object.freeze({ eligible: false, reason: "topic_permission_missing" });
  }
  return Object.freeze({ eligible: true, reason: "eligible" });
}

export function routeQuestionBankV1(answers = {}) {
  return [...QUESTION_TEMPLATES_V1]
    .filter((template) => questionEligibilityV1(template.itemId, answers).eligible)
    .sort((left, right) => questionPresentationV1(left.itemId).sequence - questionPresentationV1(right.itemId).sequence);
}
