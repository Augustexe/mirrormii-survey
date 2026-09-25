import React, { useEffect, useMemo, useRef, useContext } from "react";
import { motion, MotionConfigContext, useReducedMotion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  MessageCircle,
  Clock3,
  Lightbulb,
  Ellipsis,
  SkipForward,
} from "lucide-react";
import { applicable, optionText, safeTitle, interpolate } from "../survey.js";
import {
  CONTEXT_FIELDS,
  contextValueAvailable,
  optionAvailable,
} from "../engine.js";
import { HOST_REACTIONS } from "../host-reactions.js";
import { CONTEXT_FIELD_LABELS, CONTEXT_VALUE_LABELS } from "../respondent-copy.js";

const contextValueLabels = {
  close_friend: "A close friend",
  newer_person: "Someone newer in my life",
  partner_or_date: "A partner or date",
  family: "Family",
  work_school: "Someone from work or school",
  other: "Someone else",
  close_person: "Someone close to me",
  friend: "A friend",
  acquaintance: "An acquaintance",
  peer: "A peer",
  authority: "Someone with authority here",
  group: "A group",
  safe_equal: "Safe and roughly equal",
  some_power_gap: "There is a power gap",
  unsafe_or_costly: "Directness could cost me",
  usually_reliable: "Usually reliable",
  mixed: "Mixed track record",
  unreliable: "Usually unreliable",
  unknown: "I do not know yet",
  recent_example: "I have a recent example",
  familiar_pattern: "I know this pattern",
  hypothetical_only: "This is mostly hypothetical",
  time: "Time",
  energy: "Energy",
  money: "Money",
  reputation: "Reputation",
  emotional_labor: "Emotional labor",
  had_capacity: "I had room",
  stretched: "I was stretched",
  at_capacity: "I was already at capacity",
  urgent: "Actually urgent",
  soon: "Needed soon, not immediately",
  not_urgent: "Not urgent",
  unclear: "Unclear",
  free_to_share: "Mine to share",
  partial_confidential: "Some of it is confidential",
  explicit_obligation: "I had a clear duty to disclose",
};

const contextValueLabel = (value) =>
  CONTEXT_VALUE_LABELS[value] || contextValueLabels[value] || "Not specified";

export function QuestionCard({
  q,
  state,
  draft,
  setDraft,
  note,
  setNote,
  otherText = "",
  setOtherText,
  contextBinding = {},
  setContextBinding,
  onContinue,
  onBack,
  onSkip,
  readOnly = false,
  saving = true,
  error = "",
}) {
  const heading = useRef(null);
  const reduced = useReducedMotion();
  const { reducedMotion } = useContext(MotionConfigContext);
  const staticMotion = reduced || reducedMotion === "always";
  const qApplicable = applicable(q, state);
  const committed = state.answers?.[q.id];
  const committedOther = state.other?.[q.id] || "";
  const committedNote = state.notes?.[q.id] || "";
  const currentDraft = Array.isArray(draft) ? draft : draft ? [draft] : [];
  const committedDraft = Array.isArray(committed)
    ? committed
    : committed
      ? [committed]
      : [];
  const hasUnsaved =
    JSON.stringify(currentDraft) !== JSON.stringify(committedDraft) ||
    (note || "") !== committedNote ||
    (otherText || "") !== committedOther ||
    JSON.stringify(contextBinding || {}) !== JSON.stringify(state.bindings?.[q.id] || {});
  const actual = q.meta?.evidence === "actual_event" || q.role === "actual";
  const multi = q.responseFormat === "multi_select";
  const selectedOption = useMemo(
    () => q.options?.find((option) => currentDraft.includes(option.id)),
    [q.options, currentDraft],
  );
  const selectedReaction =
    selectedOption?.reaction || HOST_REACTIONS?.[q.id]?.[selectedOption?.id];
  const contextFields = CONTEXT_FIELDS?.[q.id] || [];
  const exitIds = new Set((q.exits || []).map((exit) => exit.id));
  const selectedExit = currentDraft.some((value) => exitIds.has(value));
  const contextComplete = selectedExit || !contextFields.length || contextFields.every((field) => field.values.includes(contextBinding?.[field.key]));

  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [q.id]);

  const choose = (id) => {
    if (readOnly || (q.test && committed)) return;
    if (!multi) return setDraft(id);
    if (exitIds.has(id)) return setDraft(id);
    const current = Array.isArray(draft) ? draft : draft && !exitIds.has(draft) ? [draft] : [];
    const next = current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id];
    setDraft(next.length ? next : null);
  };
  const continueWith = () => {
    if (readOnly) return onContinue();
    const selected = Array.isArray(draft) ? draft : draft ? [draft] : [];
    const needsOther = selected.includes("other") || selected.includes("other_unscored");
    onContinue(draft, {
      otherText: needsOther ? String(otherText || "").trim() : undefined,
      note: note || "",
      bindings: contextFields.length ? contextBinding : undefined,
    });
  };
  const responseOptions = [
    ...(q.options || []).filter((option) => optionAvailable(q.id, option.id, state)),
    ...(q.exits || []),
  ];

  return (
    <article
      className={`question-card ${readOnly ? "question-card--readonly" : ""}`}
      data-role={q.role || "hypothetical"}
      data-evidence={q.meta?.evidence || "unspecified"}
      data-chapter={q.chapter ?? "unknown"}
      data-test={q.test ? "true" : "false"}
      data-readonly={readOnly ? "true" : "false"}
    >
      <div className="question-head">
        <div>
          <span className="eyebrow question-frame">
            {actual ? (
              <Clock3 size={15} aria-hidden="true" />
            ) : (
              <Lightbulb size={15} aria-hidden="true" />
            )}
            {q.sourceLabel || (q.test
              ? "A final check"
              : q.chapter === 1 || q.chapter === 8
                ? "Your preferences"
                : q.meta?.evidence === "actual_event" || actual || q.id === "V4-030"
                  ? "From your life"
                  : "Picture this")}
          </span>
          <h1 ref={heading} tabIndex="-1">
            {safeTitle(q, state)}
          </h1>
          {q.setup && (
            <p className="question-setup">{interpolate(q.setup, state)}</p>
          )}
        </div>
      </div>
      {contextFields.length > 0 && qApplicable && !readOnly && !selectedExit && (
        <section className="context-capture" aria-label="Required context for this scene">
          <p className="question-setup">
            A few details first. Who is involved and what is at stake can change your answer.
          </p>
          {contextFields.map((field) => (
            <label key={field.key} className="context-field">
              <span>{CONTEXT_FIELD_LABELS[field.key] || field.label}</span>
              <select
                value={contextBinding?.[field.key] || ""}
                onChange={(e) => setContextBinding?.({ ...(contextBinding || {}), [field.key]: e.target.value })}
                disabled={readOnly || (q.test && Boolean(committed))}
                required
              >
                <option value="">Choose an answer…</option>
                {field.values
                  .filter((value) => contextValueAvailable(q.id, field.key, value, state))
                  .map((value) => (
                    <option key={value} value={value}>{contextValueLabel(value)}</option>
                  ))}
              </select>
            </label>
          ))}
        </section>
      )}
      <fieldset
        className="answer-list"
        disabled={readOnly || (q.test && Boolean(committed))}
      >
        <legend className="sr-only">{multi ? "Choose one or more answers" : "Choose one answer"}</legend>
        {responseOptions.map((o, i) => {
          const checked = currentDraft.includes(o.id);
          const isExit = Boolean(o.exit || exitIds.has(o.id));
          return (
          <motion.label
            initial={staticMotion ? false : { opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, delay: staticMotion ? 0 : i * 0.035 }}
            whileTap={staticMotion ? undefined : { scale: 0.994 }}
            key={o.id}
            className={`answer-option ${checked ? "answer-option--selected" : ""}`}
          >
            <input
              type={multi && !isExit ? "checkbox" : "radio"}
              name={q.id}
              value={o.id}
              checked={checked}
              onChange={() => choose(o.id)}
            />
            <span className="answer-token">
              {o.id === "other" || o.id === "other_unscored" ? (
                <Ellipsis size={17} aria-hidden="true" />
              ) : isExit ? (
                <SkipForward size={16} aria-hidden="true" />
              ) : (
                String.fromCharCode(65 + i)
              )}
            </span>
            <span className="answer-copy">{optionText(o, state)}</span>
            <Check
              className="answer-check"
              size={18}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </motion.label>
        );})}
      </fieldset>
      {(currentDraft.includes("other") || currentDraft.includes("other_unscored")) && qApplicable && !readOnly && (
        <div className="other-field">
          <label htmlFor={`other-${q.id}`}>
            <MessageCircle size={15} aria-hidden="true" /> In your own words
          </label>
          <textarea
            id={`other-${q.id}`}
            value={otherText}
            maxLength={1200}
            onChange={(e) => setOtherText?.(e.target.value)}
            placeholder="A short answer is perfect."
          />
          <small>
            {(otherText || "").length}/1200. Optional. Saved as a note, not used to interpret your personality.
          </small>
        </div>
      )}
      {selectedReaction && !currentDraft.includes("other") && !currentDraft.includes("other_unscored") && (
        <motion.div
          key={selectedOption.id}
          className="host-reaction"
          role="status"
          initial={staticMotion ? false : { opacity: 0, y: 8, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.32, ease: [0.2, 0.75, 0.25, 1] }}
        >
          <MessageCircle size={15} aria-hidden="true" />
          <span>{interpolate(selectedReaction, state)}</span>
        </motion.div>
      )}
      {!q.setupPreference && <details className="context-details">
        <summary>
          <ChevronDown size={16} aria-hidden="true" /> Add context{" "}
          <span>Optional. Saved with your answer, not used in your result.</span>
        </summary>
        <textarea
          value={note || ""}
          maxLength={1200}
          onChange={(e) => setNote(e.target.value)}
          disabled={readOnly || (q.test && Boolean(committed))}
          placeholder="A small footnote for future you..."
          aria-label="Optional context note"
        />
        <small>{(note || "").length}/1200</small>
      </details>}
      {qApplicable && actual && !readOnly && !(q.exits || []).some((exit) => exit.id === "no_recent_example") && (
        <button
          type="button"
          className="none-fit"
          onClick={() => onContinue("no_recent_example", { note: note || "" })}
        >
          No recent example <span>We will not draw a conclusion from this</span>
        </button>
      )}
      <div className="question-actions">
        <button
          type="button"
          className="button button--quiet"
          onClick={onBack}
          disabled={!onBack}
        >
          <ArrowLeft size={17} aria-hidden="true" /> Back
        </button>
        <div className="actions-right">
          {!q.setupPreference && !readOnly && !(q.exits || []).some((exit) => exit.id === "skip") && (
            <button
              type="button"
              className="button button--quiet"
              onClick={() => onSkip("skip", { note: note || "" })}
            >
              <SkipForward size={16} aria-hidden="true" /> Skip
            </button>
          )}
          <button
            type="button"
            className="button button--primary"
            onClick={continueWith}
            disabled={readOnly ? false : qApplicable ? !draft || !contextComplete : false}
          >
            {q.test && committed ? "Next check" : "Continue"}{" "}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>
      <p className="save-hint" role="status">
        <span
          className={`save-dot ${saving && committed && !hasUnsaved ? "save-dot--on" : ""}`}
        />{" "}
        {!saving
          ? "Saving unavailable"
          : hasUnsaved
            ? "Unsaved changes. Continue to save"
            : committed
              ? "Saved on this device"
              : "Saves when you continue"}{" "}
        {q.test
          ? ". You cannot change this check after Continue."
          : ". You can revisit this answer later."}
      </p>
      {error && (
        <p className="save-error" role="alert">
          {error}
        </p>
      )}
    </article>
  );
}
