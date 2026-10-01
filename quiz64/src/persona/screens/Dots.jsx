import React from "react";

// Step dots for setup and lobby (DESIGN-DIRECTION 5.2, 5.3): the current dot is a pill, done dots are filled.
// The words ("Question 1 of 2") are for screen readers only.
export function Dots({ index, total, label }) {
  return (
    <span className="mm-dots-wrap">
      <span className="mm-dots" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => <i key={i} data-state={i < index ? "done" : i === index ? "current" : "next"} />)}
      </span>
      <span className="mm-sr">{label}</span>
    </span>
  );
}
