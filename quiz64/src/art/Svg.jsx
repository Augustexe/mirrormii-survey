// Shared SVG wrapper: every art piece is decorative (aria-hidden, not focusable) and passes className through.
export function Svg({ viewBox, width, height, className, style, children, ...rest }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

// Short FNV-1a hash, for ids that must differ whenever the defs they name differ.
export function hashString(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193);
  return (h >>> 0).toString(36);
}

// Ids are content-addressed on top of useId: two separate React roots (or static markup renders) on one
// page can repeat a useId, so every caller adds a suffix that changes whenever its defs change. A clash
// then only ever points at identical defs.
// Stable, CSS-safe id for gradients and clip paths (React's useId contains colons).
export function safeId(raw, suffix) {
  return `art-${String(raw).replace(/[^a-zA-Z0-9_-]/g, "")}-${suffix}`;
}
