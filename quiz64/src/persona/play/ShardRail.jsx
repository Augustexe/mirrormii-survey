import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { shardFor, SHARD_VIEWBOX } from "../../art/shapes.js";
import { MirrorArch } from "../../art/MirrorArch.jsx";
import { CHAPTERS } from "../kit.js";
import { LOBBY_COPY } from "../lobby.js";
import { railGroups } from "./rail-model.js";

const tintVar = (chapter) => (typeof chapter === "number" ? `var(--tint-ch${chapter})` : chapter === "extras" ? "var(--tint-extras)" : "var(--c-violet-300)");

function Shard({ index, state, chapter, slot }) {
  return (
    <span className={`rail-shard is-${state}`} data-rail-slot={slot} style={{ "--rail-tint": tintVar(chapter) }}>
      <svg viewBox={SHARD_VIEWBOX} aria-hidden="true" focusable="false"><path d={shardFor(index)} /></svg>
    </span>
  );
}

export function railLabel(step) {
  if (!step) return "";
  if (step.phase === "finale") return `Final card ${step.index} of ${step.size}. Open the chapter map.`;
  const title = step.phase === "extra" ? LOBBY_COPY.extras.title : (CHAPTERS.find((c) => c.id === step.chapter) || {}).title || "";
  return `${LOBBY_COPY.runLabel(step.resolved + 1, step.total || 40)}, ${title}. Open the chapter map.`;
}

/**
 * The one progress indicator (5.8): 40 shards grouped by chapter. Phone shows the current chapter's shards at full
 * size and other chapters as thin capsules; desktop shows every shard. The finale swaps it for 8 panes.
 * The rail is a button that opens the chapter map. Its accessible name is its (visually hidden) text.
 */
export function ShardRail(props) {
  // Dock into the header's centre slot (#mm-header-center, package A) when it exists; otherwise float over the header.
  const [host, setHost] = useState(null);
  const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;
  useIso(() => { setHost(document.getElementById("mm-header-center")); }, []);
  const rail = <RailButton {...props} docked={!!host} />;
  return host ? createPortal(rail, host) : rail;
}

// The World Mirror itself, small, at the head of the rail: every answer lands in it as a clear glass shard with an opal
// edge, in the run's own shard pattern, so the finale mirror is the one the player watched rebuild.
// Only shards added while the rail is on screen play their landing (a remount after a chapter title shows them still).
function RailMirror({ shards, seed, fog = 0 }) {
  const seen = useRef({ len: null, fresh: 0 });
  const len = Array.isArray(shards) ? shards.length : 0;
  if (seen.current.len !== len) seen.current = { len, fresh: seen.current.len === null ? 0 : Math.max(0, len - seen.current.len) };
  if (!Array.isArray(shards)) return null;
  return (
    <span className="rail-mirror" aria-hidden="true">
      <MirrorArch seed={seed} filled={shards} fresh={seen.current.fresh} fog={fog} glow={0.5} seams="dark" size={24} />
    </span>
  );
}

function RailButton({ step, progress = null, onOpen, docked = false, shards = null, seed = "genii" }) {
  const rail = railGroups(step, progress);
  const last = useRef(null);
  const landing = useRef(-1);
  const key = rail.finale ? `f${rail.done}` : `r${step ? step.resolved : 0}`;
  if (last.current !== null && last.current !== key) landing.current = rail.finale ? rail.done - 1 : (step ? step.resolved - 1 : -1);
  useEffect(() => { last.current = key; });
  const label = railLabel(step);

  if (rail.finale) {
    return (
      <button type="button" className={`shard-rail shard-rail--finale${docked ? " is-docked" : ""}`} onClick={onOpen} data-count={rail.panes}>
        <span className="pc-sr">{label}</span>
        <RailMirror shards={shards} seed={seed} fog={0.45} />
        <span className="rail-count" aria-hidden="true">Final <b>{Math.min(rail.done + 1, rail.panes)}</b> of {rail.panes}</span>
        <span className="rail-panes" aria-hidden="true">
          {Array.from({ length: rail.panes }, (_, i) => (
            <span key={i} data-rail-slot={i === rail.current ? "current" : i}
              className={`rail-pane${i < rail.done ? " is-sealed" : i === rail.current ? " is-current" : ""}${i === landing.current ? " is-landing" : ""}`} />
          ))}
        </span>
      </button>
    );
  }

  let n = 0;
  return (
    <button type="button" className={`shard-rail${docked ? " is-docked" : ""}`} onClick={onOpen}>
      <span className="pc-sr">{label}</span>
      <RailMirror shards={shards} seed={seed} />
      {/* G6: a readable count beside the mirror (R3); the other chapters' capsules step back on phone. */}
      <span className="rail-count" aria-hidden="true">Card <b>{step ? step.resolved + 1 : 1}</b> of {(step && step.total) || 40}</span>
      <span className="rail-groups" aria-hidden="true">
        {rail.groups.map((g) => {
          const shards = [];
          for (let i = 0; i < g.size; i++) {
            const slot = g.start + i;
            const state = i < g.done ? "filled" : g.current && i === g.done ? "current" : "empty";
            shards.push(<Shard key={i} index={n++} state={`${state}${g.current && i === g.done - 1 && landing.current >= 0 ? " is-landing" : ""}`} chapter={g.chapter} slot={g.current && i === g.done ? "current" : slot} />);
          }
          const pct = g.size ? Math.round((g.done / g.size) * 100) : 0;
          return (
            <span key={g.key} className={`rail-group${g.current ? " is-current" : ""}${g.done >= g.size ? " is-done" : ""}`} style={{ "--rail-tint": tintVar(g.chapter), "--rail-size": g.size, "--rail-fill": `${pct}%` }}>
              <span className="rail-capsule"><i /></span>
              <span className="rail-shards">{shards}</span>
            </span>
          );
        })}
      </span>
    </button>
  );
}
