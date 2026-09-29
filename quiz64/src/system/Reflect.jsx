import React from "react";

/**
 * Reflection type (asset A-22): the text plus an aria-hidden, flipped, masked copy below it at 14% opacity.
 * Used only on landing H1 line 2, chapter titles and the reveal names.
 */
export function Reflect({ children, as: Tag = "span", className = "" }) {
  return (
    <Tag className={`reflect${className ? ` ${className}` : ""}`}>
      {children}
      <span className="reflect__mirror" aria-hidden="true">{children}</span>
    </Tag>
  );
}
