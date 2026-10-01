// Genii evolution lab (dev only, `npm run dev` then /qa/genii-lab.html). Shows the canon render beside every stage of
// the evolving form, live 3D and the SVG fallback, on the day and night fields. ?still=1 renders still frames (reduced
// motion) for the stage sheet; ?size=xl|l|m|s picks the GeniiLight size; ?mood= picks the mood at full evolution.
import React from "react";
import { createRoot } from "react-dom/client";
import "../src/system/layers.css";
import { GeniiLight } from "../src/system/index.js";
import { GeniiSvg } from "../src/genii/index.js";

const q = new URLSearchParams(location.search);
if (q.get("still")) document.body.dataset.motion = "off";
const size = q.get("size") || "xl";
const mood = q.get("mood") || "listening";
const STAGES = (q.get("stages") || "0,0.25,0.5,0.75,1").split(",").map(Number);
const night = q.get("night") === "1";
const CELL = { xl: 440, l: 260, m: 130, s: 70 }[size] || 300;

function Cell({ children, label, night: dark = night }) {
  return (
    <figure style={{ margin: 0, width: CELL, display: "grid", justifyItems: "center", gap: 6 }}>
      <div style={{ width: CELL, height: CELL, display: "grid", placeItems: "center", position: "relative" }}>{children}</div>
      <figcaption style={{ font: "600 15px/1.2 Satoshi, system-ui, sans-serif", color: dark ? "#E9E6FF" : "#171625" }}>{label}</figcaption>
    </figure>
  );
}

function Sheet() {
  const moods = [["listening", "alert"], ["noted", "curious"], ["hush", "skeptical"], ["sure", "happy"], ["thinking", "thinking"]];
  const row = { display: "flex", gap: 12, alignItems: "start", padding: "18px 24px" };
  return (
    <main data-row="live" style={{ background: "#F8F8FF", width: "max-content" }}>
      <div style={row}>
        <Cell label="canon render"><img src="/assets/genii-opal-alert.webp" alt="" style={{ width: 230, height: 230 }} /></Cell>
        {STAGES.map((e) => <Cell key={e} label={`evolution ${e}`}><GeniiLight size={size} evolution={e} mood="listening" /></Cell>)}
      </div>
      <div style={{ ...row, background: "#171625" }}>
        <Cell label="" night><span /></Cell>
        {moods.map(([m, x]) => <Cell key={m} label={`${x} (${m})`} night><GeniiLight size={size} evolution={1} mood={m} /></Cell>)}
      </div>
    </main>
  );
}

function Lab() {
  if (q.get("sheet")) return <Sheet />;
  const svgOnly = q.get("svg") === "1";
  return (
    <main style={{ padding: 24, background: night ? "#171625" : "#F8F8FF", minHeight: "100vh", boxSizing: "border-box" }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "start" }} data-row="live">
        <Cell label="canon"><img src="/assets/genii-opal-alert.webp" alt="" style={{ width: 250, height: 250 }} /></Cell>
        {q.get("moods") ? q.get("moods").split(",").map((m) => (
          <Cell key={m} label={m}><GeniiLight size={size} evolution={1} mood={m} /></Cell>
        )) : STAGES.map((e) => (
          <Cell key={e} label={`evolution ${e}`}>
            {svgOnly ? <span style={{ width: 280, height: 280, display: "block" }}><GeniiSvg evolution={e} expression="alert" /></span>
              : <GeniiLight size={size} evolution={e} mood={e >= 1 ? mood : "listening"} />}
          </Cell>
        ))}
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<Lab />);
