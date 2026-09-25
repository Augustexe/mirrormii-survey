import { QUESTIONS } from "./data.js";
import { CONTEXT_FIELD_LABELS, CONTEXT_VALUE_LABELS, ITEM_COPY } from "./respondent-copy.js";

const byId = new Map(QUESTIONS.map((question) => [question.id, question]));
export const SOURCE_LABELS = {
  actual_event: "An example you recalled", hypothetical: "An imagined situation",
  self_report: "Something you told us", self_description: "Your description of yourself",
  context: "A preference you shared", heldout: "A final check",
  self_reported_event: "Based on your account", authored_scenario: "Based on your selected answer",
};
export const SECTION_LABELS = {
  action: "Your response", emotion: "Feelings and outward response", pattern: "A possible pattern",
  value: "What mattered", desire: "What you wanted", support: "Your preferences",
  context: "Your preferences", appraisal: "Your first interpretation", dark_side: "A small roast",
};

// Human explanations alongside (not in place of) the unchanged machine claim limits.
const LIMITS = [
  "This is the result style you prefer. It does not tell us your personality or how much criticism you can take.",
  "This is your preferred tone. It does not tell us how resilient or open you are.",
  "These are topics to leave out. Choosing them is not evidence of fear or avoidance.",
  "This is what you hope to get from the result. It does not show that the result achieved it.",
  "This is what you said you would do about public credit. It does not tell us your motive or how competitive you are.",
  "This is your stated reason for that credit response. It is part of the same example, not a second example of a pattern.",
  "This is the action you chose around someone else’s success. It does not establish jealousy, admiration or generosity.",
  "This is your response to similar work getting attention. It does not establish possessiveness or insecurity.",
  "This is one event you recalled. It does not establish your usual response or how much recognition you need.",
  "This compares audiences in the same credit situation. It is not a second independent example.",
  "This is your outward response to a correction. It does not tell us how calm, hurt or embarrassed you would feel.",
  "This describes only the feeling and outward response you selected. We do not know how long the feeling would last.",
  "This is your chosen response to a joke landing badly. It does not establish guilt, kindness or social skill.",
  "This is your stated reason for the response to the joke. Both answers describe the same situation.",
  "This is how you said you would get back on track after a mistake. It does not establish overall competence or emotional recovery.",
  "This compares who gives the same correction. It does not establish obedience or rebelliousness.",
  "This is a response to possibly being left out. It does not explain the friendship or reveal an unspoken feeling.",
  "This is your first explanation, not a fact about what happened or a measure of how you feel.",
  "This response needs to be understood alongside who you pictured and any risk in being direct. It does not establish neglect or a relationship pattern.",
  "This describes who you pictured and any risk in being direct. It is not a personality judgment.",
  "This response applies to the person, safety, reliability and experience you selected. It does not establish dependence or avoidance.",
  "This compares a close friend with a newer person. It does not establish how independent or secure you are in general.",
  "This is a response to advice delivered like an order. It does not establish maturity, stubbornness or obedience.",
  "This is what mattered in that advice situation. It is not a second independent example.",
  "This is your response to a changed plan. It does not establish your work ethic or how flexible you are in general.",
  "This is a group decision strategy. Waiting or delegating does not mean you lack leadership ability.",
  "This response depends on what you can manage and the risks of pushing back. It does not establish laziness, courage or obedience.",
  "This compares the same request with a reason and a real choice. It only works as a comparison if the cost, available capacity and risks stay the same.",
  "This is one favor request you recalled, with the circumstances you recorded. It does not establish generosity, selfishness or reliability.",
  "This is your reason for that same favor decision. It is not another independent example.",
  "This is what you said you would do for a close friend in one situation. It does not establish loyalty or generosity in general.",
  "This compares only how close you are to the person asking. The request, cost, urgency, reliability and risks must stay the same.",
  "This is a strategy for dealing with a difficult person. It does not establish manipulation, generosity or how strongly you dislike them.",
  "This is what made saying yes costly. It does not establish resentment or a relationship pattern.",
  "This is one choice between fun now and a cost tomorrow. It does not establish discipline or self-control in general.",
  "This is what appeals to you about that same choice. It does not establish a lasting appetite for excitement or risk.",
  "This is about sharing information in the circumstances you selected. It does not establish honesty, deception or moral character.",
  "This is your response to a subtle comment at your expense. It does not establish anger, revenge or forgiveness.",
  "This is about a small scheduling or paperwork advantage only. It does not establish honesty, greed or how you handle more serious decisions.",
  "This compares only who can see the same scheduling or paperwork choice. It does not establish integrity or a general concern with appearances.",
  "This is how you want Genii to respond. It is not evidence of dependence, avoidance or resilience.",
  "This is how often to retry after no response. It does not establish motivation or override a request to stop.",
  "This is the help you prefer. It does not establish your ability or prove that this help will work.",
  "These are boundaries to respect. They do not establish fragility, avoidance or emotional stability.",
];

export function questionForReceipt(row) {
  return byId.get(row.questionId || row.question);
}
export function receiptLimit(row) {
  const q = questionForReceipt(row);
  if (q?.test) return "This answer checks a guess made earlier. It does not change your portrait.";
  return LIMITS[Number(q?.id.slice(3)) - 1] || "This answer does not justify guessing an unspoken motive or a fixed personality type.";
}
export function receiptMeta(row) {
  const q = questionForReceipt(row);
  const source = q?.id === "V4-030" ? "The reason you selected" : SOURCE_LABELS[row.sourceRole || row.role] || "Your answer";
  const time = q?.id === "V4-030" ? "The same favor from the past 30 days"
    : q?.id === "V4-034" ? "Past 30 days, or a current pattern"
    : q?.meta.window === "current" ? "Your preference now"
    : q?.meta.evidence === "actual_event" ? "Past 30 days"
      : q?.test ? "Answered after the guesses were saved" : "An imagined situation";
  return `${source} · ${time}`;
}
export function receiptContext(row) {
  if (!row.context) return "";
  return Object.entries(row.context).map(([key, value]) =>
    `${CONTEXT_FIELD_LABELS[key] || "Situation"} ${CONTEXT_VALUE_LABELS[value] || "Not specified"}.`,
  ).join(" ");
}
export function receiptExplanation(row) {
  const q = questionForReceipt(row);
  if (!q) return "The selected answer is shown above.";
  if (q.id === "V4-030") return "This is the reason you selected for the favor decision you recalled.";
  if (q.id === "V4-034") return "This is your account of a recent example or a current pattern, not something Genii observed.";
  if (q.chapter === 1 || q.chapter === 8) return "You selected this preference directly. We do not treat it as a personality clue.";
  if (q.meta.evidence === "actual_event") return "This is your account of an example, not something Genii observed.";
  return `This is the answer you chose when asked about ${ITEM_COPY[q.id].scene}.`;
}
export function literalPreferences(answers) {
  return QUESTIONS.filter((q) => !q.test && [1, 8].includes(q.chapter)).flatMap((q) => {
    const value = answers[q.id];
    const selected = Array.isArray(value) ? value : [value];
    const options = q.options.filter((option) => selected.includes(option.id));
    return options.length ? [{ title: q.title, text: options.map((option) => option.text).join("; ") }] : [];
  });
}
