import {
  PRODUCT_AXES,
  createBankManifest,
  defineQuestionTemplate,
} from "./evidence-framework.js";
import { presentQuestion } from "./question-voices-v2.js";

/**
 * Routed V2 authoring bank.
 *
 * The bank is deliberately authored as neutral semantic records first, then
 * rendered into a route/voice-specific set of templates.  Voice changes the
 * wrapper and scene language only; option meanings, predicates and exits stay
 * pinned to the same semantic item.  The runtime can therefore route copy
 * without changing the evidence contract.
 */
export const BANK_VERSION = "genii-routed-evidence-bank-v2";
export const SURVEY_VERSION = "genii-routed-evidence-survey-v2";
export const ADAPTER_VERSION = "genii-routed-choice-adapter-v2";
export const MAPPING_VERSION = "genii-routed-evidence-mapping-v2";

export const SECTIONS = Object.freeze([
  { id: "permission_lobby", title: "Before Genii gets nosy", purpose: "Set delivery preference and topic permission without creating personality evidence." },
  { id: "everyday_life", title: "The ordinary plot", purpose: "Collect everyday choices and recent actions across food, plans, money and small surprises." },
  { id: "work_study", title: "When the brief gets weird", purpose: "Test response to ambiguity, revision, credit and changing plans in work or study." },
  { id: "social_theater", title: "Social theater", purpose: "Test visible/private signaling, repair and belonging context without diagnosing relationships." },
  { id: "close_connections", title: "The close-connection appendix", purpose: "Optional, consent-gated questions about attention, requests and repair." },
  { id: "secret_menu", title: "The secret menu", purpose: "Optional hypothetical choices, clearly separated from real behavior." },
  { id: "prediction_booth", title: "Genii puts its cards down", purpose: "Frozen held-out choices collected after the profile snapshot." },
]);

const SECTION_IDS = new Set(SECTIONS.map((section) => section.id));
const AXIS_IDS = new Set(PRODUCT_AXES.map((axis) => axis.id));
const CONTEXT_SCHEMA = Object.freeze({
  setting: ["everyday", "work_study", "peer_group", "close_relationship", "social_event", "self_directed"],
  audience: ["private_self", "one_to_one", "public_group", "unfamiliar_group"],
  stakes: ["low", "medium", "high"],
});

const EXIT = Object.freeze([
  { id: "other", text: "Different story; mine has a different shape", reason: "other_unscored" },
  { id: "skip", text: "Skip this one", reason: "skip" },
]);
const ACTUAL_EXIT = Object.freeze([
  { id: "no_recent_example", text: "No recent example comes to mind", reason: "no_recent_example" },
  ...EXIT,
]);
const LIGHT_EXIT = Object.freeze([
  { id: "not_applicable", text: "That situation is not part of my life", reason: "not_applicable" },
  ...EXIT,
]);
const NON_CLAIMS = Object.freeze([
  "diagnosis",
  "formal personality score",
  "moral worth",
  "relationship quality",
  "infidelity or likelihood of cheating",
  "secret motive",
  "health status or medical conclusion",
]);

function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) freeze(child);
  return Object.freeze(value);
}

function axisPredicate(itemId, optionId, axisId, direction, strength, claimText) {
  if (!AXIS_IDS.has(axisId)) throw new Error(`Unknown axis ${axisId}`);
  if (!["left", "right"].includes(direction)) throw new Error(`Axis direction required for ${itemId}:${optionId}`);
  return {
    id: `${itemId}:${optionId}:${axisId}`,
    construct: axisId,
    value: { directionalClass: `${direction}_${strength === 1 ? "strong" : strength === 0.7 ? "moderate" : "slight"}` },
    claimText,
    claimTemplateId: `${itemId}-${optionId}-${axisId}-v2`,
    allowedInferenceKeys: ["bounded_behavior"],
    allowedScopeIds: ["selected_situation"],
    axisId,
    direction,
    strength,
    claimLimits: ["This is a reviewed directional category for this answer, not a personality percentage or equal-interval scale."],
    excludesClaims: NON_CLAIMS,
  };
}

function literalPredicate(itemId, optionId, construct, value, claimText, kind = "reported_content") {
  return {
    id: `${itemId}:${optionId}:${construct.replaceAll(" ", "_")}`,
    kind,
    domain: "reported_experience",
    construct,
    value,
    claimText,
    claimTemplateId: `${itemId}-${optionId}-${construct.replaceAll(" ", "-")}-v2`,
    allowedInferenceKeys: ["literal_report"],
    allowedScopeIds: ["selected_situation"],
    strength: 1,
    claimLimits: ["This supports only the content the respondent selected."],
    excludesClaims: NON_CLAIMS,
  };
}

function option(id, text, meaning, predicates = []) {
  return { id, text, neutralMeaning: meaning, predicates };
}

function axisOption(itemId, axisId, direction, strength, id, text, meaning) {
  return option(id, text, meaning, [axisPredicate(itemId, id, axisId, direction, strength, meaning)]);
}

function reportOption(...args) {
  let [itemId, id, text, meaning, construct, value, kind = "reported_content", axis] = args;
  // The compact authoring rows below intentionally allow `reportOption(id,
  // text, meaning, construct, value, kind)` for readability. Normalize that
  // form here before the semantic template is built; the test suite asserts
  // that no placeholder or long answer text reaches the public option ID.
  if (!String(itemId).startsWith("GQB2-")) {
    axis = args.find((candidate) => candidate && typeof candidate === "object" && candidate.axisId) || null;
    kind = args[5] || "reported_content";
    value = args[4];
    construct = args[3];
    meaning = args[2];
    text = args[1];
    id = args[0];
    itemId = "__pending__";
  }
  const predicates = [literalPredicate(itemId, id, construct, value, meaning, kind)];
  if (axis) predicates.push(axisPredicate(itemId, id, axis.axisId, axis.direction, axis.strength, axis.claimText || meaning));
  return option(id, text, meaning, predicates);
}

function routeKey(route) {
  const value = String(route || "universal").toLowerCase().replaceAll("-", "_");
  if (["everyday", "ordinary", "general"].includes(value)) return "everyday";
  if (["light", "surface", "no_personal", "broad"].includes(value)) return "light";
  if (["social", "belonging", "peer_group"].includes(value)) return "social";
  if (["work", "study", "work_study", "future"].includes(value)) return "work_study";
  if (["close", "relationship", "dating", "close_relationship"].includes(value)) return "close_relationship";
  return "universal";
}

function voiceKey(voice) {
  const value = String(voice || "playful").toLowerCase().replaceAll("-", "_");
  return ["gentle", "sharp", "playful"].includes(value) ? value : "playful";
}

function eventSpec(itemId, sourceStatus, context, target, timeframe) {
  const semanticId = itemId.split("-")[0] === "GQB2" ? itemId.split("-")[1] : itemId;
  const eventGroup = {
    "E02": "recent_everyday_plan",
    "E04": "recent_everyday_plan",
    "E05": "recent_everyday_plan",
    "M02": "recent_everyday_plan",
    "W01": "recent_work_plan",
    "W07": "recent_work_plan",
    "W02": "recent_visible_work_event",
  }[semanticId] || semanticId.toLowerCase();
  return {
    id: `${eventGroup}-event`,
    kind: sourceStatus === "retrospective_self_report" ? "reported_event"
      : sourceStatus === "heldout" ? "heldout_scenario"
        : sourceStatus === "context_fact" ? "context_question" : "scenario",
    sourceStatus,
    target: target || null,
    timeframe: timeframe || null,
    claimLimits: ["Supports only the authored interpretation of the selected response."],
    notEvidenceFor: NON_CLAIMS,
  };
}

function spec(input) {
  if (!SECTION_IDS.has(input.sectionId)) throw new Error(`Unknown section ${input.sectionId}`);
  const options = (input.options || []).map((candidate) => ({
    ...candidate,
    predicates: candidate.predicates.map((predicate) => predicate.id.startsWith("__pending__:")
      ? {
        ...predicate,
        id: `${input.itemId}:${predicate.id.split(":").slice(1).join(":")}`,
        claimTemplateId: predicate.claimTemplateId.replace("__pending__", input.itemId),
        itemId: input.itemId,
      }
      : predicate),
  }));
  return Object.freeze({
    responseFormat: "single_choice",
    sensitivity: "low",
    sourceStatus: "stated_preference",
    eligibleAxes: [],
    requiredAnyPermissions: [],
    disallowedDisclosureModes: [],
    exits: EXIT,
    ...input,
    options,
  });
}

const PROFILE_SPECS = [
  spec({ itemId: "GQB2-P01", sectionId: "permission_lobby", construct: "result_style_preference", sourceStatus: "stated_preference", scored: false, prompt: "What kind of ending makes this worth the emotional paperwork?", options: [option("sharp", "Give me one sharp read. No TED Talk.", "Prefers a concise result."), option("receipts", "Show me the read, then show your receipts.", "Prefers an evidence-forward result."), option("funny", "If I am being perceived, at least make it funny.", "Prefers a playful result."), option("gentle", "Be useful, but keep the emotional furniture intact.", "Prefers a gentler result.")] }),
  spec({ itemId: "GQB2-P02", sectionId: "permission_lobby", construct: "disclosure_mode_preference", sourceStatus: "context_fact", scored: false, prompt: "How personal should this round get? You can change this later.", options: [option("light", "Keep it light: ordinary choices and low-stakes situations only.", "Chooses the light route."), option("context", "Some real-life context is okay; keep it general.", "Allows general personal context."), option("personal", "You can ask more personal questions; no names or details needed.", "Allows personal questions without identifying details."), option("topic_by_topic", "Ask topic by topic; I am the switchboard.", "Requests topic-by-topic permission."), option("prefer_not", "Prefer not to say.", "Does not state a disclosure preference.")] }),
  spec({ itemId: "GQB2-P03", sectionId: "permission_lobby", construct: "topic_permission", sourceStatus: "context_fact", scored: false, responseFormat: "multi_choice", prompt: "Which rooms are open tonight? Pick any, or keep every door closed.", options: [option("social", "Friends, groups and being seen", "Permits social-position prompts."), option("work_study", "Work, school and authority", "Permits work or study prompts."), option("close_connection", "Dating, closeness and relationship ambiguity", "Permits close-connection prompts."), option("private_thoughts", "Private drafts and harmless temptations", "Permits private hypothetical prompts."), option("none", "Not today", "Declines optional topics.")] }),
  spec({ itemId: "GQB2-P04", sectionId: "permission_lobby", construct: "host_voice_preference", sourceStatus: "stated_preference", scored: false, prompt: "When Genii reacts, what delivery mode do you want?", options: [option("gentle", "Warm and low-key; keep the reaction soft.", "Prefers a gentle host voice."), option("playful", "Playful and direct; a little okayyy, noted.", "Prefers a playful host voice."), option("sharp", "Curious and specific; say the thing cleanly.", "Prefers a sharper host voice."), option("minimal", "Mostly ask the next question.", "Prefers minimal host commentary.")] }),

  spec({ itemId: "GQB2-E01", sectionId: "everyday_life", construct: "unfamiliar_low_cost_activity", sourceStatus: "hypothetical_choice", sensitivity: "low", eligibleAxes: ["novelty_aperture"], prompt: "A free, low-stakes activity appears nearby with an easy exit. You have never tried it. What is your move? This is hypothetical, not a forecast.", authoredContext: { setting: "social_event", audience: "public_group", stakes: "low" }, options: [axisOption("GQB2-E01", "novelty_aperture", "right", 1, "try", "Try it as offered. We collect a little new-world data.", "In this low-stakes hypothetical, chooses the unfamiliar activity."), axisOption("GQB2-E01", "novelty_aperture", "right", 0.7, "sample", "Watch for a few minutes, then decide whether to join.", "In this low-stakes hypothetical, samples the unfamiliar activity before joining."), axisOption("GQB2-E01", "novelty_aperture", "left", 1, "known", "Stay with the familiar plan; it already works for me.", "In this low-stakes hypothetical, chooses the familiar activity."), reportOption("GQB2-E01", "pass", "Pass; I do not need a new subplot today.", "In this low-stakes hypothetical, declines the unfamiliar activity.", "activity temptation", "neither", "reported_temptation")] }),
  spec({ itemId: "GQB2-E02", sectionId: "everyday_life", construct: "recent_plan_follow_through", sourceStatus: "retrospective_self_report", prompt: "Think of the latest low-stakes plan you meant to attend this past month. What happened when it was time to go?", referencePeriod: "latest relevant plan in the past month", authoredContext: { setting: "social_event", audience: "private_self", stakes: "low" }, eligibleAxes: ["activation_tempo"], exits: ACTUAL_EXIT, options: [reportOption("GQB2-E02", "went", "Went before home-me opened an appeal.", "For the latest plan, reported following through.", "plan outcome", "followed_through", "reported_action", { axisId: "activation_tempo", direction: "right", strength: 1 }), reportOption("GQB2-E02", "brief", "Went, but on a limited diplomatic visa.", "For the latest plan, reported attending briefly.", "plan outcome", "attended_briefly", "reported_action", { axisId: "activation_tempo", direction: "right", strength: 0.7 }), reportOption("GQB2-E02", "delayed", "Negotiated with the ceiling until the decision made itself.", "For the latest plan, reported delaying the decision.", "plan outcome", "delayed_decision", "reported_action"), reportOption("GQB2-E02", "stayed", "Stayed home; the blanket won the appeal.", "For the latest plan, reported staying home.", "plan outcome", "stayed_home", "reported_action")] }),
  spec({ itemId: "GQB2-E03", sectionId: "everyday_life", construct: "small_purchase_surprise", sourceStatus: "retrospective_self_report", prompt: "Think of the latest small purchase this past month that was not on your original plan. What did you do?", referencePeriod: "latest unplanned small purchase in the past month", authoredContext: { setting: "everyday", audience: "private_self", stakes: "low" }, eligibleAxes: [], exits: ACTUAL_EXIT, options: [reportOption("GQB2-E03", "keep", "Kept it; the object made a persuasive little case.", "For the latest unplanned purchase, reported keeping it.", "purchase outcome", "kept", "reported_action"), reportOption("GQB2-E03", "return", "Returned it before the subplot got expensive.", "For the latest unplanned purchase, reported returning it.", "purchase outcome", "returned", "reported_action"), reportOption("GQB2-E03", "pause", "Kept the receipt and waited before deciding whether it was worth it.", "For the latest unplanned purchase, reported keeping the decision open.", "purchase outcome", "paused", "reported_action"), reportOption("GQB2-E03", "gift", "Bought it for someone else; the plot changed owners.", "For the latest unplanned purchase, reported changing the purchase purpose to a gift.", "purchase outcome", "gifted", "reported_action")] }),
  spec({ itemId: "GQB2-E04", sectionId: "everyday_life", construct: "changed_plan_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest ordinary plan change this past month. Which version of you clocked in?", referencePeriod: "latest plan change in the past month", authoredContext: { setting: "everyday", audience: "one_to_one", stakes: "medium" }, eligibleAxes: ["structure_reliance"], exits: ACTUAL_EXIT, options: [axisOption("GQB2-E04", "structure_reliance", "left", 1, "pivot", "New plot. I pivoted before the old plan finished buffering.", "For the latest plan change, reported adapting without rebuilding the full plan."), axisOption("GQB2-E04", "structure_reliance", "right", 0.35, "details", "Asked for the new time, place and one sentence explaining reality.", "For the latest plan change, requested a small amount of concrete structure."), axisOption("GQB2-E04", "structure_reliance", "right", 1, "rebuild", "Rebuilt the plan; someone had attacked the load-bearing spreadsheet.", "For the latest plan change, reported rebuilding the structure."), reportOption("exit", "Stopped participating; the original timeline was part of the product.", "For the latest plan change, reported leaving the plan.", "plan outcome", "left_plan", "reported_action")] }),
  spec({ itemId: "GQB2-E05", sectionId: "everyday_life", construct: "unfamiliar_invitation", sourceStatus: "retrospective_self_report", prompt: "Think of the latest invitation this past month where you knew almost nobody. What did you actually do?", referencePeriod: "latest relevant invitation in the past month", authoredContext: { setting: "social_event", audience: "unfamiliar_group", stakes: "medium" }, eligibleAxes: ["novelty_aperture"], exits: ACTUAL_EXIT, options: [axisOption("GQB2-E05", "novelty_aperture", "right", 1, "go", "Went and let future-me locate the exits.", "For the latest invitation, reported attending without extra preparation."), axisOption("GQB2-E05", "novelty_aperture", "right", 0.7, "ally", "Went after securing one human life raft.", "For the latest invitation, reported attending with one familiar support."), reportOption("GQB2-E05", "research", "Investigated the people and escape routes first.", "For the latest invitation, researched before deciding.", "invitation response", "research", "reported_action"), reportOption("GQB2-E05", "decline", "Declined; mystery is charming until it requires trousers.", "For the latest invitation, reported declining.", "invitation response", "declined", "reported_action")] }),
  spec({ itemId: "GQB2-E06", sectionId: "everyday_life", construct: "ordinary_decision_style", sourceStatus: "stated_preference", prompt: "For a small decision with no emergency attached, what usually helps you choose?", options: [reportOption("GQB2-E06", "criteria", "A short list of criteria; the tiny committee gets three minutes.", "Prefers explicit criteria for small decisions.", "decision preference", "criteria", "reported_desire"), reportOption("GQB2-E06", "try", "A quick test; reality can vote.", "Prefers a quick test before deciding.", "decision preference", "quick_test", "reported_desire"), reportOption("GQB2-E06", "ask", "One trusted opinion, then I decide.", "Prefers one outside perspective before deciding.", "decision preference", "trusted_opinion", "reported_desire"), reportOption("GQB2-E06", "feel", "A first instinct, followed by a brief legal review.", "Prefers an initial instinct with a short review.", "decision preference", "instinct_review", "reported_desire")] }),

  spec({ itemId: "GQB2-W01", sectionId: "work_study", construct: "ambiguous_brief_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest work or study task this past month where the instructions were foggy. What did you actually do first?", referencePeriod: "latest ambiguous work or study task in the past month", authoredContext: { setting: "work_study", audience: "one_to_one", stakes: "medium" }, eligibleAxes: ["activation_tempo", "structure_reliance"], exits: ACTUAL_EXIT, requiredAnyPermissions: ["work_study"], options: [reportOption("GQB2-W01", "prototype", "Made a rough first version so the confusion had something physical to fight.", "For the latest ambiguous task, made a rough first version.", "task response", "prototype", "reported_action", { axisId: "activation_tempo", direction: "right", strength: 1, claimText: "For the latest ambiguous task, moved into a rough first version." }), reportOption("GQB2-W01", "questions", "Turned the fog into a list of questions and requested coordinates.", "For the latest ambiguous task, created explicit questions before proceeding.", "task response", "questions", "reported_action", { axisId: "structure_reliance", direction: "right", strength: 1, claimText: "For the latest ambiguous task, created explicit structure through questions." }), reportOption("GQB2-W01", "model", "Found an example and reverse-engineered what good probably meant.", "For the latest ambiguous task, used an example to create structure.", "task response", "model", "reported_action", { axisId: "structure_reliance", direction: "right", strength: 0.7, claimText: "For the latest ambiguous task, used an example as structure." }), reportOption("GQB2-W01", "wait", "Waited for clearer instructions rather than manufacturing the wrong universe.", "For the latest ambiguous task, waited for clearer instructions.", "task response", "waited", "reported_action", { axisId: "activation_tempo", direction: "left", strength: 1, claimText: "For the latest ambiguous task, waited before moving." })] }),
  spec({ itemId: "GQB2-W02", sectionId: "work_study", construct: "visible_mistake_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest mistake other people could actually see in work or study. In the first minute, which move came first?", referencePeriod: "latest visible work or study mistake in the past month", authoredContext: { setting: "work_study", audience: "public_group", stakes: "medium" }, eligibleAxes: ["social_signal_style", "friction_posture"], exits: ACTUAL_EXIT, requiredAnyPermissions: ["work_study"], options: [axisOption("GQB2-W02", "friction_posture", "right", 1, "own", "Named it and said what I would do next.", "For the latest visible mistake, addressed it and named a next step."), axisOption("GQB2-W02", "friction_posture", "right", 0.7, "fix", "Tried to fix it before announcing my downfall.", "For the latest visible mistake, repaired it before discussing it."), axisOption("GQB2-W02", "social_signal_style", "right", 0.7, "explain", "Explained the context, perhaps with suspicious evidence.", "For the latest visible mistake, explained the context visibly."), axisOption("GQB2-W02", "friction_posture", "left", 0.7, "quiet", "Paused and collected myself before saying anything.", "For the latest visible mistake, paused before addressing it.")] }),
  spec({ itemId: "GQB2-W03", sectionId: "work_study", construct: "feedback_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest useful criticism you received this past month. What did you do first?", referencePeriod: "latest criticism received in the past month", authoredContext: { setting: "work_study", audience: "one_to_one", stakes: "medium" }, exits: ACTUAL_EXIT, requiredAnyPermissions: ["work_study"], options: [reportOption("ask", "Asked what they meant or for an example.", "For the latest criticism, asked for clarification.", "criticism response", "asked_for_example", "reported_action"), reportOption("explain", "Explained my side, then considered their point.", "For the latest criticism, explained context before considering it.", "criticism response", "explained_then_considered", "reported_action"), reportOption("pause", "Took time before responding.", "For the latest criticism, paused before responding.", "criticism response", "paused", "reported_action"), reportOption("use", "Looked for one part I could use.", "For the latest criticism, identified one usable part.", "criticism response", "found_use", "reported_action")] }),
  spec({ itemId: "GQB2-W04", sectionId: "work_study", construct: "credit_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest shared effort this past month where contributions were not clearly recognized. What did you do?", referencePeriod: "latest unclear-credit event in the past month", authoredContext: { setting: "work_study", audience: "public_group", stakes: "medium" }, exits: ACTUAL_EXIT, requiredAnyPermissions: ["work_study"], eligibleAxes: ["social_signal_style", "friction_posture"], options: [reportOption("let_pass", "Let it pass; naming my part did not feel important then.", "For the latest unclear-credit event, let the recognition gap pass.", "credit response", "let_pass", "reported_action"), axisOption("GQB2-W04", "friction_posture", "right", 0.35, "casual", "Mentioned my part casually while the work was still in view.", "For the latest unclear-credit event, clarified the contribution in the moment."), reportOption("private", "Told the person privately what I wanted credited.", "For the latest unclear-credit event, requested private credit clarification.", "credit response", "private_request", "reported_action"), axisOption("GQB2-W04", "social_signal_style", "right", 0.7, "visible", "Added or clarified my contribution where people could see the work.", "For the latest unclear-credit event, made the contribution visible.")] }),
  spec({ itemId: "GQB2-W05", sectionId: "work_study", construct: "plan_structure_preference", sourceStatus: "stated_preference", prompt: "For an ordinary work or study plan with a few moving parts, what amount of planning feels like enough?", requiredAnyPermissions: ["work_study"], eligibleAxes: ["structure_reliance"], options: [axisOption("GQB2-W05", "structure_reliance", "left", 1, "start", "Start and let the next need announce itself.", "Prefers beginning and adapting without a prior sequence."), axisOption("GQB2-W05", "structure_reliance", "right", 0.35, "anchors", "Choose a few anchors and improvise the rest.", "Prefers a few planning anchors with flexibility."), axisOption("GQB2-W05", "structure_reliance", "right", 0.7, "sequence", "Make a short sequence so future-me has fewer surprises.", "Prefers a short ordered sequence."), reportOption("GQB2-W05", "depends", "It depends on time, energy, money and how many people are involved.", "Reports that planning needs change with available resources and context.", "planning context", "context_dependent", "reported_context")] }),
  spec({ itemId: "GQB2-W06", sectionId: "work_study", construct: "unfamiliar_opportunity", sourceStatus: "hypothetical_choice", prompt: "An opportunity has real upside and no user manual. What gets it through customs?", requiredAnyPermissions: ["work_study"], authoredContext: { setting: "work_study", audience: "private_self", stakes: "medium" }, eligibleAxes: ["novelty_aperture"], options: [axisOption("GQB2-W06", "novelty_aperture", "right", 1, "trial", "Run a small reversible trial. Adventure, but with an undo button.", "In this hypothetical, tests the unfamiliar opportunity through a reversible trial."), reportOption("criteria", "Give it three criteria and a deadline before deciding.", "In this hypothetical, applies criteria and a deadline before deciding.", "opportunity response", "criteria", "hypothetical_choice"), reportOption("reference", "Find someone who survived this side quest.", "In this hypothetical, seeks an experienced reference first.", "opportunity response", "reference", "hypothetical_choice"), axisOption("GQB2-W06", "novelty_aperture", "left", 1, "known", "Choose a familiar alternative. I do not owe every mystery a character arc.", "In this hypothetical, chooses a familiar alternative.")] }),
  spec({ itemId: "GQB2-W07", sectionId: "work_study", construct: "revision_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time a work or study plan changed after you had started. What happened next?", referencePeriod: "latest started plan that changed in the past month", authoredContext: { setting: "work_study", audience: "one_to_one", stakes: "high" }, requiredAnyPermissions: ["work_study"], exits: ACTUAL_EXIT, eligibleAxes: ["structure_reliance"], options: [axisOption("GQB2-W07", "structure_reliance", "left", 0.7, "adapt", "Changed the next step and kept moving.", "For the latest changed plan, adapted the next step without rebuilding everything."), axisOption("GQB2-W07", "structure_reliance", "right", 1, "rebuild", "Rebuilt the sequence before continuing.", "For the latest changed plan, rebuilt the sequence before continuing."), reportOption("ask", "Asked which part had actually changed before touching the plan.", "For the latest changed plan, clarified the changed requirement first.", "revision response", "clarified_change", "reported_action"), reportOption("pause", "Paused until the new version stopped moving.", "For the latest changed plan, paused while the new version settled.", "revision response", "paused", "reported_action")] }),
  spec({ itemId: "GQB2-W08", sectionId: "work_study", construct: "help_request_capacity", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time someone asked for your help when your capacity was already low. What did you do?", referencePeriod: "latest help request during a low-capacity period in the past month", authoredContext: { setting: "work_study", audience: "one_to_one", stakes: "medium" }, requiredAnyPermissions: ["work_study"], exits: ACTUAL_EXIT, eligibleAxes: ["friction_posture"], options: [axisOption("GQB2-W08", "friction_posture", "right", 1, "no", "Said I could not do it and skipped the closing argument.", "For the latest low-capacity request, stated that I could not help."), axisOption("GQB2-W08", "friction_posture", "right", 0.7, "smaller", "Offered a smaller version I could genuinely manage.", "For the latest low-capacity request, offered a manageable alternative."), reportOption("GQB2-W08", "yes", "Said yes without naming the low battery; dealt with the request quietly.", "For the latest low-capacity request, agreed without stating the capacity limit.", "help response", "agreed_without_limit", "reported_action"), reportOption("GQB2-W08", "delay", "Delayed answering until circumstances made the decision for me.", "For the latest low-capacity request, delayed the answer.", "help response", "delayed", "reported_action")] }),
  spec({ itemId: "GQB2-W09", sectionId: "work_study", construct: "activation_first_step", sourceStatus: "retrospective_self_report", prompt: "Think of a different work or study task from this past month that you chose to begin. What was your first move?", referencePeriod: "a separate work or study task started in the past month", authoredContext: { setting: "work_study", audience: "private_self", stakes: "medium" }, requiredAnyPermissions: ["work_study"], exits: ACTUAL_EXIT, eligibleAxes: ["activation_tempo"], options: [axisOption("GQB2-W09", "activation_tempo", "right", 1, "start", "Started with the first small step.", "For this separate task, started with a concrete first step."), axisOption("GQB2-W09", "activation_tempo", "right", 0.7, "clarify", "Asked one focused question, then began.", "For this separate task, asked one focused question and then began."), reportOption("GQB2-W09", "schedule", "Set a time to start and waited for it.", "For this separate task, scheduled a start before beginning.", "activation response", "scheduled_start", "reported_action"), axisOption("GQB2-W09", "activation_tempo", "left", 1, "wait", "Waited for clearer direction before moving.", "For this separate task, waited for clearer direction before starting.")] }),

  spec({ itemId: "GQB2-S01", sectionId: "social_theater", construct: "delayed_reply_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time this past month a person's reply mattered and took longer than hoped. What did you actually do?", referencePeriod: "latest meaningful delayed reply in the past month", authoredContext: { setting: "peer_group", audience: "one_to_one", stakes: "medium" }, exits: ACTUAL_EXIT, eligibleAxes: ["activation_tempo"], requiredAnyPermissions: ["social"], options: [axisOption("GQB2-S01", "activation_tempo", "right", 1, "ask", "Asked whether everything was okay; I prefer data to fan fiction.", "For the latest meaningful delayed reply, asked directly."), axisOption("GQB2-S01", "activation_tempo", "right", 0.7, "followup", "Sent a second message with a suspiciously casual little hat.", "For the latest meaningful delayed reply, sent a low-pressure follow-up."), axisOption("GQB2-S01", "activation_tempo", "left", 0.7, "draft", "Wrote a follow-up, then left it in drafts.", "For the latest meaningful delayed reply, drafted but did not send a follow-up."), axisOption("GQB2-S01", "activation_tempo", "left", 1, "wait", "Gave them space and continued with my day.", "For the latest meaningful delayed reply, waited without raising the delay.")] }),
  spec({ itemId: "GQB2-S02", sectionId: "social_theater", construct: "social_gap_first_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time a plan or conversation moved without you. What showed up first?", referencePeriod: "latest relevant social gap in the past month", authoredContext: { setting: "peer_group", audience: "public_group", stakes: "medium" }, exits: ACTUAL_EXIT, requiredAnyPermissions: ["social"], options: [reportOption("sting", "A small clean sting, annoyingly well-aimed.", "For the latest social gap, reported hurt or disappointment first.", "first emotion", "hurt_or_disappointment", "reported_emotion"), reportOption("curiosity", "Curiosity; I wanted the missing episode recap.", "For the latest social gap, reported curiosity first.", "first emotion", "curiosity", "reported_emotion"), reportOption("relief", "Relief; my calendar had filed for workers' compensation.", "For the latest social gap, reported relief first.", "first emotion", "relief", "reported_emotion"), reportOption("irritation", "Irritation; apparently I was mayor of How Dare They.", "For the latest social gap, reported irritation first.", "first emotion", "irritation", "reported_emotion"), reportOption("nothing", "Nothing readable; internal subtitles were unavailable.", "For the latest social gap, no clear first emotion was readable.", "first emotion", "not_clearly_readable", "reported_emotion")] }),
  spec({ itemId: "GQB2-S03", sectionId: "social_theater", construct: "joke_repair", sourceStatus: "hypothetical_choice", prompt: "Your joke lands wrong and the room develops weather. In the first minute, what do you do?", authoredContext: { setting: "peer_group", audience: "public_group", stakes: "medium" }, eligibleAxes: ["social_signal_style", "friction_posture"], requiredAnyPermissions: ["social"], options: [axisOption("GQB2-S03", "friction_posture", "right", 1, "name", "Name it immediately: that came out wrong; I am sorry.", "In this scenario, names the impact and attempts repair immediately."), axisOption("GQB2-S03", "social_signal_style", "left", 0.7, "private", "Check on the person privately before my soul leaves my body.", "In this scenario, moves repair into a private conversation."), axisOption("GQB2-S03", "social_signal_style", "right", 0.7, "ask", "Ask whether it landed badly instead of appointing myself judge and jury.", "In this scenario, asks visibly about the impact."), axisOption("GQB2-S03", "friction_posture", "left", 0.7, "lighten", "Lighten the room first and see whether the tension stays.", "In this scenario, delays naming the rupture while trying to lower tension."), axisOption("GQB2-S03", "friction_posture", "left", 1, "pause", "Pause without addressing it in the room.", "In this scenario, waits rather than addressing the rupture.")] }),
  spec({ itemId: "GQB2-S04", sectionId: "social_theater", construct: "new_group_entry", sourceStatus: "stated_preference", prompt: "When you are finding your place in a newer group, what do you edit first, if anything?", requiredAnyPermissions: ["social"], options: [reportOption("pace", "How quickly I talk; I see how the room breathes.", "Prefers adjusting speaking pace in a newer group.", "new-group strategy", "speaking_pace", "reported_preference"), reportOption("humor", "My humor; I see how it lands.", "Prefers testing humor in a newer group.", "new-group strategy", "humor", "reported_preference"), reportOption("opinions", "My opinions; the sharper version can wait.", "Prefers holding some opinions back initially.", "new-group strategy", "opinions", "reported_preference"), reportOption("nothing", "Nothing much; I let the fit reveal itself.", "Prefers not to edit much in a newer group.", "new-group strategy", "nothing", "reported_preference"), reportOption("useful", "Become useful before becoming known.", "Prefers joining a newer group through useful action.", "new-group strategy", "usefulness", "reported_preference")] }),
  spec({ itemId: "GQB2-S05", sectionId: "social_theater", construct: "support_signal_style", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time a friend shared good news in a busy group chat. What did you actually do?", referencePeriod: "latest friend good-news message in the past month", authoredContext: { setting: "peer_group", audience: "public_group", stakes: "low" }, requiredAnyPermissions: ["social"], exits: ACTUAL_EXIT, eligibleAxes: ["social_signal_style"], options: [axisOption("GQB2-S05", "social_signal_style", "right", 1, "public", "Celebrate loudly in the chat while the confetti window is open.", "For the latest good-news message, celebrated visibly in the group."), axisOption("GQB2-S05", "social_signal_style", "left", 1, "private", "Send a detailed private message later.", "For the latest good-news message, followed up privately."), axisOption("GQB2-S05", "social_signal_style", "left", 0.35, "react", "React now, then follow up when I have something real to say.", "For the latest good-news message, gave a brief public signal and reserved fuller support for later."), reportOption("call", "Leave the chat and call them one-to-one.", "For the latest good-news message, moved support to a call.", "support channel", "call", "reported_action")] }),
  spec({ itemId: "GQB2-S06", sectionId: "social_theater", construct: "group_indecision", sourceStatus: "hypothetical_choice", prompt: "The group has discussed dinner for forty minutes and accidentally invented a parliament. What do you do?", authoredContext: { setting: "peer_group", audience: "public_group", stakes: "low" }, requiredAnyPermissions: ["social"], eligibleAxes: ["activation_tempo", "structure_reliance"], options: [axisOption("GQB2-S06", "activation_tempo", "right", 1, "book", "Book something before the committee develops subcommittees.", "In this scenario, moves the group into action immediately."), axisOption("GQB2-S06", "structure_reliance", "right", 0.7, "vote", "Drop two acceptable options and let democracy finish its shift.", "In this scenario, creates a simple decision structure."), axisOption("GQB2-S06", "structure_reliance", "right", 1, "criteria", "Ask what people actually care about: cheap, close or good.", "In this scenario, establishes explicit decision criteria."), axisOption("GQB2-S06", "activation_tempo", "left", 1, "observe", "Let the process continue; I am studying it as a natural phenomenon.", "In this scenario, waits rather than intervening.")] }),
  spec({ itemId: "GQB2-S07", sectionId: "social_theater", construct: "credit_visibility_hypothetical", sourceStatus: "hypothetical_choice", prompt: "Your idea receives applause while wearing someone else's name tag. Your move?", authoredContext: { setting: "work_study", audience: "public_group", stakes: "medium" }, requiredAnyPermissions: ["social", "work_study"], eligibleAxes: ["social_signal_style", "friction_posture"], options: [axisOption("GQB2-S07", "social_signal_style", "right", 1, "public", "Correct the record while the applause is still warm.", "In this scenario, makes the credit claim visible to the group."), axisOption("GQB2-S07", "social_signal_style", "right", 0.7, "joke", "Make a joke that returns my name to the crime scene.", "In this scenario, makes the contribution visible through humor."), axisOption("GQB2-S07", "friction_posture", "right", 0.7, "private", "Congratulate them, then request a private plot correction.", "In this scenario, addresses the credit problem privately."), reportOption("later", "Leave it for now and decide later whether it is worth raising.", "In this scenario, defers deciding whether to address the credit problem.", "credit response", "defer", "hypothetical_choice")] }),
  spec({ itemId: "GQB2-S08", sectionId: "social_theater", construct: "social_recovery_preference", sourceStatus: "stated_preference", prompt: "After a social moment gets stuck in your head, what helps before you decide what it meant?", requiredAnyPermissions: ["social"], options: [reportOption("trusted", "One trusted person giving me a real read.", "Prefers one trusted perspective before interpreting a social moment.", "interpretation strategy", "trusted_person", "reported_preference"), reportOption("alone", "Time alone; the brain needs a quieter tab.", "Prefers private time before interpreting a social moment.", "interpretation strategy", "time_alone", "reported_preference"), reportOption("concrete", "Doing something concrete.", "Prefers an absorbing concrete activity before interpreting a social moment.", "interpretation strategy", "concrete_activity", "reported_preference"), reportOption("facts", "Checking facts or asking a simple question.", "Prefers checking facts before interpreting a social moment.", "interpretation strategy", "fact_check", "reported_preference"), reportOption("humor", "Humor, memes or an anyway reset.", "Prefers humor or a reset before interpreting a social moment.", "interpretation strategy", "humor_reset", "reported_preference")] }),
  spec({ itemId: "GQB2-S09", sectionId: "social_theater", construct: "social_plan_structure", sourceStatus: "retrospective_self_report", prompt: "Think of a different group plan you helped arrange this past month. How did you give it shape?", referencePeriod: "a separate group plan arranged in the past month", authoredContext: { setting: "social_event", audience: "public_group", stakes: "medium" }, requiredAnyPermissions: ["social"], exits: ACTUAL_EXIT, eligibleAxes: ["structure_reliance"], options: [axisOption("GQB2-S09", "structure_reliance", "left", 1, "improvise", "Started and let the next need announce itself.", "For this separate group plan, started and adapted without a preset sequence."), axisOption("GQB2-S09", "structure_reliance", "left", 0.35, "anchors", "Picked a few anchors and left the rest open.", "For this separate group plan, set a few anchors while keeping the rest flexible."), axisOption("GQB2-S09", "structure_reliance", "right", 1, "sequence", "Made a short order of operations.", "For this separate group plan, made a short ordered sequence."), axisOption("GQB2-S09", "structure_reliance", "right", 0.35, "ask", "Asked everyone for the one thing that mattered most.", "For this separate group plan, gathered a priority before arranging the rest.")] }),

  spec({ itemId: "GQB2-R01", sectionId: "close_connections", construct: "welcome_attention_preference", sourceStatus: "stated_preference", prompt: "If someone's attention could land exactly right this week, what would you most want it to say?", requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], options: [reportOption("specific", "I notice the weirdly specific things about you.", "Would value attention to specific details about them.", "wanted attention", "specific_notice", "reported_desire"), reportOption("time", "I want more of your time, on purpose.", "Would value intentional time together.", "wanted attention", "intentional_time", "reported_desire"), reportOption("steady", "You can relax; I am not about to vanish.", "Would value reassurance of continued presence.", "wanted attention", "steady_presence", "reported_desire"), reportOption("story", "Tell me the full story.", "Would value fuller disclosure and conversation.", "wanted attention", "full_story", "reported_desire"), reportOption("space", "Please give me a little space right now.", "Would value respectful space.", "wanted attention", "space", "reported_desire")] }),
  spec({ itemId: "GQB2-R02", sectionId: "close_connections", construct: "interest_response", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time this past month someone caught your interest a little. What did you actually do with that information?", referencePeriod: "latest interest event in the past month", authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "medium" }, requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], exits: ACTUAL_EXIT, eligibleAxes: ["activation_tempo"], options: [axisOption("GQB2-R02", "activation_tempo", "right", 0.7, "talk", "Found a small reason to keep talking.", "For the latest interest event, continued the conversation."), reportOption("updates", "Paid more attention to their posts or updates.", "For the latest interest event, paid more attention to updates.", "interest response", "attention", "reported_action"), reportOption("friend", "Told a friend, then did nothing.", "For the latest interest event, told a friend without taking further action.", "interest response", "told_friend", "reported_action"), axisOption("GQB2-R02", "activation_tempo", "left", 0.35, "pace", "Kept my usual pace and did not make a move.", "For the latest interest event, kept the usual pace."), axisOption("GQB2-R02", "activation_tempo", "right", 1, "invite", "Made a clear plan, invite or flirt attempt.", "For the latest interest event, made a clear approach."), reportOption("private", "Let it stay a private thought.", "For the latest interest event, kept it as a private thought.", "interest response", "private_thought", "reported_action")] }),
  spec({ itemId: "GQB2-R03", sectionId: "close_connections", construct: "need_expression", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time this past month you wanted something from a person whose opinion mattered to you. How did you let them know?", referencePeriod: "latest request or unsaid need in the past month", authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "medium" }, requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], exits: ACTUAL_EXIT, eligibleAxes: ["social_signal_style"], options: [axisOption("GQB2-R03", "social_signal_style", "right", 1, "plain", "Said what I wanted plainly.", "For the latest need, stated the request plainly."), reportOption("hint", "Hinted or waited to see if they would notice.", "For the latest need, hinted or waited for recognition.", "need expression", "hinted", "reported_action"), reportOption("self", "Tried to handle it myself.", "For the latest need, handled it without asking.", "need expression", "self_handled", "reported_action"), reportOption("drop", "Decided it was not worth bringing up.", "For the latest need, decided not to raise it.", "need expression", "dropped", "reported_action")] }),
  spec({ itemId: "GQB2-R04", sectionId: "close_connections", construct: "repair_after_impact", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time this past month you realized something you said or did landed badly. What happened next?", referencePeriod: "latest recognized-impact event in the past month", authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "high" }, requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], exits: ACTUAL_EXIT, eligibleAxes: ["friction_posture"], options: [axisOption("GQB2-R04", "friction_posture", "right", 1, "repair", "Checked in and tried to make it right.", "For the latest recognized-impact event, attempted repair."), reportOption("explain", "Explained what I meant.", "For the latest recognized-impact event, explained intent.", "repair response", "explained", "reported_action"), reportOption("space", "Gave them space and came back later.", "For the latest recognized-impact event, gave space before returning.", "repair response", "space_then_return", "reported_action"), reportOption("unsure", "Was not sure what to do.", "For the latest recognized-impact event, reported uncertainty about the next step.", "repair response", "unsure", "reported_action")] }),
  spec({ itemId: "GQB2-R05", sectionId: "close_connections", construct: "receiving_help", sourceStatus: "retrospective_self_report", prompt: "Think of the latest time someone offered you practical help this past month. What did you do?", referencePeriod: "latest practical help offer in the past month", authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "medium" }, requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], exits: ACTUAL_EXIT, options: [reportOption("accepted", "Accepted it.", "For the latest help offer, accepted the help.", "help response", "accepted", "reported_action"), reportOption("details", "Accepted after talking through the details.", "For the latest help offer, accepted after clarifying details.", "help response", "accepted_with_details", "reported_action"), reportOption("declined", "Declined and handled it myself.", "For the latest help offer, declined and handled it independently.", "help response", "declined_self", "reported_action"), reportOption("different", "Declined, but asked for a different kind of support.", "For the latest help offer, requested a different kind of support.", "help response", "different_support", "reported_action")] }),
  spec({ itemId: "GQB2-R06", sectionId: "close_connections", construct: "connection_definition", sourceStatus: "stated_preference", prompt: "In a connection you care about, which ask is easiest to keep in drafts?", requiredAnyPermissions: ["close_connection"], sensitivity: "high_optional", disallowedDisclosureModes: ["light"], options: [reportOption("plan", "Can we make a real plan sometime?", "Selects a concrete-plan request as the ask left unsent in this connection.", "unsaid ask", "plan", "reported_desire"), reportOption("meaning", "Can you tell me how you see this connection?", "Selects a request for clarity about the connection as the ask left unsent in this connection.", "unsaid ask", "meaning", "reported_desire"), reportOption("time", "I want more one-on-one time.", "Selects a one-on-one-time request as the ask left unsent in this connection.", "unsaid ask", "one_to_one_time", "reported_desire"), reportOption("honesty", "Can we be more honest about the awkward thing?", "Selects a directness request as the ask left unsent in this connection.", "unsaid ask", "honesty", "reported_desire"), reportOption("light", "I do not have an ask; keeping it light is the point.", "Selects no unsaid ask in this connection.", "unsaid ask", "none", "reported_desire")] }),

  spec({ itemId: "GQB2-M01", sectionId: "secret_menu", construct: "harmless_private_fantasy", sourceStatus: "hypothetical_choice", projective: true, sensitivity: "high_optional", disallowedDisclosureModes: ["light"], requiredAnyPermissions: ["private_thoughts"], prompt: "If one message could land with no social fallout, which draft feels closest? You can skip; this is a thought experiment.", authoredContext: { setting: "close_relationship", audience: "private_self", stakes: "high" }, options: [reportOption("GQB2-M01", "desire", "I want you. There, the draft escaped.", "In this consequence-free prompt, selects a fantasy of expressing desire.", "fantasy content", "express_desire", "reported_fantasy"), reportOption("GQB2-M01", "callout", "You knew exactly what you were doing.", "In this consequence-free prompt, selects a fantasy of confronting someone.", "fantasy content", "confront", "reported_fantasy"), reportOption("GQB2-M01", "reassurance", "Please tell me we are actually okay.", "In this consequence-free prompt, selects a fantasy of requesting reassurance.", "fantasy content", "reassurance", "reported_fantasy"), reportOption("GQB2-M01", "envy", "I am happy for you, and yes, part of me is jealous.", "In this consequence-free prompt, selects a fantasy of admitting mixed envy.", "fantasy content", "mixed_envy", "reported_fantasy")] }),
  spec({ itemId: "GQB2-M02", sectionId: "secret_menu", construct: "temptation_vs_intention", sourceStatus: "retrospective_self_report", prompt: "Think of the latest plan you wanted all week. When it was time to leave, what won?", referencePeriod: "latest planned outing in the past month", authoredContext: { setting: "social_event", audience: "private_self", stakes: "low" }, exits: ACTUAL_EXIT, options: [reportOption("blanket", "Blanket. I issued a tasteful cancellation.", "For the latest planned outing, reported staying home.", "plan outcome", "stayed_home", "reported_action"), reportOption("delay", "Negotiated with the ceiling until the decision made itself.", "For the latest planned outing, reported delaying the decision.", "plan outcome", "delayed", "reported_action"), reportOption("brief", "Went, but on a limited diplomatic visa.", "For the latest planned outing, reported attending briefly.", "plan outcome", "brief", "reported_action"), reportOption("go", "Left before home-me could launch an appeal.", "For the latest planned outing, reported following through.", "plan outcome", "followed_through", "reported_action")] }),
  spec({ itemId: "GQB2-M03", sectionId: "secret_menu", construct: "unfamiliar_option_trial", sourceStatus: "hypothetical_choice", projective: true, sensitivity: "medium", requiredAnyPermissions: ["private_thoughts"], prompt: "An unfamiliar option appears beside your reliable favorite. What is your first pull? This is hypothetical, not a forecast.", authoredContext: { setting: "everyday", audience: "private_self", stakes: "low" }, eligibleAxes: ["novelty_aperture"], options: [axisOption("GQB2-M03", "novelty_aperture", "right", 1, "new", "Try the unfamiliar one; today we acquire lore.", "In this hypothetical, chooses the unfamiliar option."), axisOption("GQB2-M03", "novelty_aperture", "right", 0.7, "sample", "Request a tiny sample before choosing.", "In this hypothetical, samples the unfamiliar option."), axisOption("GQB2-M03", "novelty_aperture", "left", 1, "known", "Choose the favorite; reliability has passed probation.", "In this hypothetical, chooses the familiar option."), reportOption("both", "Try a little of each if the laws of plating permit it.", "In this hypothetical, tries both options.", "temptation", "try_both", "reported_temptation")] }),
  spec({ itemId: "GQB2-M04", sectionId: "secret_menu", construct: "desired_understanding", sourceStatus: "stated_preference", projective: true, sensitivity: "high_optional", disallowedDisclosureModes: ["light"], requiredAnyPermissions: ["private_thoughts"], prompt: "What do you most wish people understood without requiring your full director's commentary?", authoredContext: { setting: "close_relationship", audience: "private_self", stakes: "high" }, options: [reportOption("space", "Needing space is not the same as caring less.", "Selects a wish for space to be understood as distinct from caring less.", "desired understanding", "space_not_less_care", "reported_desire"), reportOption("invite", "Sometimes I want the invitation even when I might say no.", "Selects a wish to remain included without committing to attend.", "desired understanding", "invitation_without_commitment", "reported_desire"), reportOption("quiet", "My excitement is real even when it arrives without fireworks.", "Selects a wish for quieter excitement to be recognized.", "desired understanding", "quiet_excitement", "reported_desire"), reportOption("time", "I may need time before I know what I feel.", "Selects a wish for emotional processing time to be understood.", "desired understanding", "processing_time", "reported_desire")] }),
];

const HELDOUT_SPECS = [
  spec({ itemId: "GQB2-H01", sectionId: "prediction_booth", construct: "heldout_activation_tempo", sourceStatus: "heldout", prompt: "Your train stops one station early and the announcement explains almost nothing. Which move comes first?", authoredContext: { setting: "everyday", audience: "public_group", stakes: "medium" }, eligibleAxes: ["activation_tempo"], options: [axisOption("GQB2-H01", "activation_tempo", "left", 1, "wait", "Stay put until the next announcement gives the plot back.", "In this held-out scenario, waits for more information before acting."), axisOption("GQB2-H01", "activation_tempo", "right", 0.7, "ask", "Find staff and ask for the actual options.", "In this held-out scenario, seeks actionable information immediately."), axisOption("GQB2-H01", "activation_tempo", "right", 1, "route", "Get off and build a new route from the platform.", "In this held-out scenario, immediately begins an alternate route."), axisOption("GQB2-H01", "activation_tempo", "left", 0.35, "scan", "Check the map and crowd movement before choosing.", "In this held-out scenario, assesses signals before moving.")] }),
  spec({ itemId: "GQB2-H02", sectionId: "prediction_booth", construct: "heldout_social_signal_style", sourceStatus: "heldout", prompt: "During a live team or class meeting, someone shares genuinely good news. Which response is closest to yours?", authoredContext: { setting: "work_study", audience: "public_group", stakes: "low" }, eligibleAxes: ["social_signal_style"], options: [axisOption("GQB2-H02", "social_signal_style", "right", 1, "public", "Acknowledge it in the room while the moment is open.", "In this held-out meeting scenario, celebrates visibly in the group."), axisOption("GQB2-H02", "social_signal_style", "left", 1, "private", "Send a detailed message after the meeting.", "In this held-out meeting scenario, communicates support privately afterward."), axisOption("GQB2-H02", "social_signal_style", "right", 0.35, "react", "Give a brief signal now and follow up later.", "In this held-out meeting scenario, gives a brief visible signal and reserves fuller support for later."), reportOption("call", "Wait and contact them one-to-one after the room clears.", "In this held-out meeting scenario, moves support to one-to-one contact.", "support channel", "one_to_one", "heldout")] }),
  spec({ itemId: "GQB2-H03", sectionId: "prediction_booth", construct: "heldout_friction_posture", sourceStatus: "heldout", prompt: "A shared-space annoyance has happened for the third time. What is your first move?", authoredContext: { setting: "everyday", audience: "public_group", stakes: "medium" }, eligibleAxes: ["friction_posture"], options: [axisOption("GQB2-H03", "friction_posture", "left", 1, "fix", "Fix it myself this time and watch whether a fourth season appears.", "In this held-out scenario, fixes the issue without raising it yet."), axisOption("GQB2-H03", "friction_posture", "right", 0.7, "private", "Ask the relevant person privately for a different system.", "In this held-out scenario, privately addresses the recurring issue."), axisOption("GQB2-H03", "friction_posture", "right", 1, "group", "Name the recurring issue to everyone and propose a rule.", "In this held-out scenario, addresses the recurring issue with the group."), reportOption("leave", "Leave the shared setup and use another one.", "In this held-out scenario, changes the setup without raising the issue.", "friction response", "leave_setup", "heldout")] }),
  spec({ itemId: "GQB2-H04", sectionId: "prediction_booth", construct: "heldout_structure_reliance", sourceStatus: "heldout", prompt: "You get an empty room and two hours to make a small gathering work. Where do you begin?", authoredContext: { setting: "self_directed", audience: "public_group", stakes: "low" }, eligibleAxes: ["structure_reliance"], options: [axisOption("GQB2-H04", "structure_reliance", "left", 0.35, "anchors", "Choose three anchors and improvise the rest.", "In this held-out scenario, uses a few anchors while leaving the rest flexible."), axisOption("GQB2-H04", "structure_reliance", "right", 1, "plan", "Make a short sequence so future-me inherits fewer emergencies.", "In this held-out scenario, creates a short ordered plan."), axisOption("GQB2-H04", "structure_reliance", "left", 1, "start", "Start arranging the room and let the next need announce itself.", "In this held-out scenario, begins and adapts without a prior sequence."), axisOption("GQB2-H04", "structure_reliance", "right", 0.7, "model", "Find one setup that worked before and adapt it.", "In this held-out scenario, uses an existing model to create structure.")] }),
  spec({ itemId: "GQB2-H05", sectionId: "prediction_booth", construct: "heldout_novelty_aperture", sourceStatus: "heldout", prompt: "Your familiar app offers an unfamiliar layout with an easy undo and no change to what it can do. What do you choose?", authoredContext: { setting: "everyday", audience: "private_self", stakes: "low" }, eligibleAxes: ["novelty_aperture"], options: [axisOption("GQB2-H05", "novelty_aperture", "right", 1, "try", "Try the new layout; there is an undo button.", "In this held-out scenario, chooses to try the unfamiliar layout."), axisOption("GQB2-H05", "novelty_aperture", "right", 0.7, "preview", "Preview it briefly, then decide whether to switch.", "In this held-out scenario, previews the unfamiliar layout before deciding."), axisOption("GQB2-H05", "novelty_aperture", "left", 1, "known", "Keep the familiar layout; it already works for me.", "In this held-out scenario, chooses the familiar layout."), reportOption("pass", "Pass; the current layout is doing its job.", "In this held-out scenario, declines the unfamiliar layout.", "layout choice", "pass", "heldout")] }),
  spec({ itemId: "GQB2-H06", sectionId: "prediction_booth", construct: "heldout_activation_tempo_second", sourceStatus: "heldout", prompt: "A small task has no deadline, but finishing it would clear one annoying tab. What do you do first?", authoredContext: { setting: "self_directed", audience: "private_self", stakes: "low" }, eligibleAxes: ["activation_tempo"], options: [axisOption("GQB2-H06", "activation_tempo", "right", 1, "start", "Do the first two minutes now.", "In this held-out scenario, starts the task immediately."), axisOption("GQB2-H06", "activation_tempo", "right", 0.35, "setup", "Put the task where future-me can start quickly.", "In this held-out scenario, makes a small activation step."), axisOption("GQB2-H06", "activation_tempo", "left", 1, "later", "Leave it for a time when I have more room.", "In this held-out scenario, defers the task."), reportOption("drop", "Decide the tab can remain open; not every task needs a finale.", "In this held-out scenario, drops the task without starting it.", "task outcome", "dropped", "heldout")] }),
  spec({ itemId: "GQB2-H07", sectionId: "prediction_booth", construct: "heldout_social_signal_style_second", sourceStatus: "heldout", prompt: "A friend sends you a small win one-to-one. How do you answer first?", authoredContext: { setting: "close_relationship", audience: "one_to_one", stakes: "low" }, eligibleAxes: ["social_signal_style"], options: [axisOption("GQB2-H07", "social_signal_style", "right", 1, "celebrate", "Send the full celebration while the moment is warm.", "In this held-out scenario, responds with visible enthusiasm in the conversation."), axisOption("GQB2-H07", "social_signal_style", "left", 0.7, "detail", "Ask one thoughtful question and stay with the story.", "In this held-out scenario, responds through focused one-to-one conversation."), axisOption("GQB2-H07", "social_signal_style", "left", 0.35, "react", "Send a quick reaction and return when I can give it attention.", "In this held-out scenario, gives a brief signal before fuller support later."), reportOption("save", "Save it for later so I can answer properly.", "In this held-out scenario, delays the response for a fuller reply.", "support response", "delayed", "heldout")] }),
  spec({ itemId: "GQB2-H08", sectionId: "prediction_booth", construct: "heldout_friction_posture_second", sourceStatus: "heldout", prompt: "A tiny misunderstanding appears in a shared plan. What do you do first?", authoredContext: { setting: "work_study", audience: "one_to_one", stakes: "medium" }, eligibleAxes: ["friction_posture"], options: [axisOption("GQB2-H08", "friction_posture", "right", 1, "name", "Name the mismatch and ask what should change.", "In this held-out scenario, addresses the mismatch directly."), axisOption("GQB2-H08", "friction_posture", "right", 0.7, "private", "Message the relevant person privately and compare notes.", "In this held-out scenario, addresses the mismatch privately."), axisOption("GQB2-H08", "friction_posture", "left", 0.7, "adjust", "Quietly adjust my part and keep the plan moving.", "In this held-out scenario, absorbs the mismatch and adjusts independently."), reportOption("wait", "Wait to see if the mismatch resolves itself.", "In this held-out scenario, waits before raising the mismatch.", "friction response", "wait", "heldout")] }),
];

const ALL_SPECS = Object.freeze([...PROFILE_SPECS, ...HELDOUT_SPECS]);

function permitted(specification, route, personal) {
  if (specification.sourceStatus === "heldout") return true;
  const required = specification.requiredAnyPermissions || [];
  // Route selection is the runtime's permission decision.  `requiredAnyPermissions`
  // remains in presentation metadata for finer topic switches; it must not make
  // the light route empty because ordinary social/work scenes are safe to show.
  if (route === "light" && (specification.sensitivity === "high_optional" || specification.sectionId === "secret_menu" || specification.sectionId === "close_connections")) return false;
  if (!personal && required.some((permission) => ["private_thoughts", "close_connection"].includes(permission))) return false;
  if (!personal && specification.sensitivity === "high_optional") return false;
  if (route === "social" && specification.sectionId === "work_study" && specification.itemId !== "GQB2-W04") return false;
  if (route === "work_study" && specification.sectionId === "social_theater" && !["GQB2-S07"].includes(specification.itemId)) return false;
  if (route === "close_relationship" && specification.sectionId === "work_study" && specification.itemId !== "GQB2-W08") return false;
  return true;
}

function toTemplate(specification, route, voice) {
  const heldout = specification.sourceStatus === "heldout";
  const semanticId = specification.itemId.toLowerCase();
  const wordingVersion = `${BANK_VERSION}-${voice}-wording`;
  const copy = presentQuestion(specification, voice);
  const prompt = copy.prompt;
  const exits = specification.exits || (heldout ? EXIT : specification.sourceStatus === "retrospective_self_report" ? ACTUAL_EXIT : LIGHT_EXIT);
  const event = eventSpec(`${specification.itemId}-${route}-${voice}`, specification.sourceStatus, specification.authoredContext, specification.target, specification.referencePeriod);
  return defineQuestionTemplate({
    itemId: specification.itemId,
    surveyVersion: SURVEY_VERSION,
    bankVersion: BANK_VERSION,
    semanticVersion: `${semanticId}-semantic-v2`,
    wordingVersion,
    mappingVersion: MAPPING_VERSION,
    adapterVersion: ADAPTER_VERSION,
    responseFormat: specification.responseFormat,
    construct: specification.construct,
    prompt,
    referencePeriod: specification.referencePeriod || (heldout ? "heldout occasion" : "selected situation"),
    eligibleAxes: specification.eligibleAxes,
    contextSchema: CONTEXT_SCHEMA,
    authoredContext: specification.authoredContext || {},
    projectionContextKeys: ["setting", "audience", "stakes"],
    event: { ...event, phase: heldout ? "heldout" : "profile" },
    options: specification.options.map((item) => ({ ...item, text: copy.options[item.id] || item.text })),
    exits,
  });
}

function presentationFor(template, specification) {
  return {
    itemId: template.itemId,
    sectionId: specification.sectionId,
    tone: specification.tone || "observant_playful",
    sensitivity: specification.sensitivity,
    scored: specification.scored !== false,
    prompt: template.prompt,
    options: template.options.map((item) => ({ id: item.id, text: item.text })),
    exits: template.exits.map((item) => ({ id: item.id, text: item.text })),
    requiredAnyPermissions: [...(specification.requiredAnyPermissions || [])],
    disallowedDisclosureModes: [...(specification.disallowedDisclosureModes || [])],
  };
}

function routeProfileSpecs(route, personal) {
  return PROFILE_SPECS
    // Route and voice are already explicit runtime inputs. Do not ask a
    // respondent for delivery/topic settings that the runtime will ignore.
    .filter((item) => !item.itemId.startsWith("GQB2-P"))
    .filter((item) => item.itemId !== "GQB2-M02")
    .filter((item) => permitted(item, route, personal));
}

/**
 * Return one immutable routed bank. `personal` is a coarse safety gate; the
 * presentation metadata still exposes per-item permission requirements so a
 * runtime can apply finer topic switches without changing authored semantics.
 */
export function getBank({ route = "universal", voice = "playful", personal = true } = {}) {
  const selectedRoute = routeKey(route);
  const selectedVoice = voiceKey(voice);
  const profileSpecs = routeProfileSpecs(selectedRoute, personal);
  const specs = [...profileSpecs, ...HELDOUT_SPECS];
  const templates = Object.freeze(specs.map((item) => toTemplate(item, selectedRoute, selectedVoice)));
  const manifest = createBankManifest(templates, { publicAxisIds: [], publicClaimTemplateIds: [] });
  const presentation = Object.freeze(Object.fromEntries(templates.map((template) => [template.itemId, Object.freeze(presentationFor(template, specs.find((item) => item.itemId === template.itemId)))])));
  const profileIds = Object.freeze(templates.filter((template) => template.event.phase === "profile").map((template) => template.itemId));
  const heldoutIds = Object.freeze(templates.filter((template) => template.event.phase === "heldout").map((template) => template.itemId));
  const sections = Object.freeze(SECTIONS.map((section) => Object.freeze({
    ...section,
    itemIds: Object.freeze(templates.filter((template) => presentation[template.itemId].sectionId === section.id).map((template) => template.itemId)),
  })));
  return freeze({
    bankVersion: BANK_VERSION,
    surveyVersion: SURVEY_VERSION,
    route: selectedRoute,
    voice: selectedVoice,
    personal: Boolean(personal),
    templates,
    manifest,
    presentation,
    profileIds,
    heldoutIds,
    sections,
  });
}

export const DEFAULT_BANK_V2 = getBank();
