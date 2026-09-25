import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "motion/react";
import { EvidenceSummary } from "./components/EvidenceSummary.jsx";
import { AmbientWorld } from "./components/AmbientWorld.jsx";
import {
  exportPreview,
  makePreviewState,
  PREVIEW_FIXTURES,
  reviewPreviewClaim,
  reviewRows,
} from "./preview-fixtures.js";
import "./styles.css";
import "./voice-polish.css";
import "./launch.css";
import "./result-visuals.css";
import "./preview.css";
import "./world.css";
import "./jewels.css";
import "./living-world.css";
import "./result-details.css";
import "./micro-details.css";
import "./domain-surfaces.css";
import "./result-final.css";

function Preview() {
  const [fixture, setFixture] = useState("complete");
  const [answersOpen, setAnswersOpen] = useState(false);
  const [state, setState] = useState(() => makePreviewState("complete"));
  const rows = useMemo(() => reviewRows(state), [state]);
  const onExport = () => {
    const contents = JSON.stringify(exportPreview(state), null, 2);
    const url = URL.createObjectURL(
      new Blob([contents], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `genii-synthetic-preview-${fixture}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <MotionConfig reducedMotion="user">
      <div className="preview-page">
        <AmbientWorld scene="complete" chapter={8} pulseKey={fixture} />
        <header className="preview-toolbar">
          <a
            className="preview-return"
            href="./"
            aria-label="Return to the Genii survey"
          >
            ← <span>Back to survey</span>
          </a>
          <div className="preview-heading">
            <strong>Result preview</strong>
            <span className="preview-badge">
              SYNTHETIC DATA · DEVELOPER ONLY
            </span>
          </div>
          <label className="preview-picker">
            <span>Fixture</span>
            <select
              aria-label="Preview fixture"
              value={fixture}
              onChange={(event) => {
                setFixture(event.target.value);
                setState(makePreviewState(event.target.value));
                setAnswersOpen(false);
              }}
            >
              {PREVIEW_FIXTURES.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label} - {item.detail}
                </option>
              ))}
            </select>
          </label>
        </header>
        <div className="preview-notice" role="note">
          <strong>Synthetic preview.</strong> These answers are generated in
          memory for interface review. They are never saved to survey storage or
          sent as telemetry.
          <button
            type="button"
            className="preview-review-toggle"
            aria-expanded={answersOpen}
            onClick={() => setAnswersOpen((open) => !open)}
          >
            {answersOpen
              ? "Hide answer list"
              : "Review question and answer list"}
          </button>
        </div>
        {answersOpen && (
          <section
            className="preview-answer-list"
            aria-label="Synthetic question and answer list"
          >
            <h2>Synthetic answers</h2>
            <ol>
              {rows.map((row) => (
                <li key={row.id}>
                  <span>{row.title}</span>
                  <strong>{row.answerText}</strong>
                  {row.test && <small>Sealed check</small>}
                </li>
              ))}
            </ol>
          </section>
        )}
        <EvidenceSummary
          state={state}
          onExport={onExport}
          onReview={() => setAnswersOpen(true)}
          onReset={() => {
            setState(makePreviewState(fixture));
            setAnswersOpen(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onReviewClaim={(claim, value) =>
            setState((current) => reviewPreviewClaim(current, claim, value))
          }
        />
      </div>
    </MotionConfig>
  );
}

createRoot(document.getElementById("root")).render(<Preview />);
