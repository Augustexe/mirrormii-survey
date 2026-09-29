import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./system/layers.css";
import { setThemeForVoice } from "./system/theme.js";
import { Boot, BOOT_RUN_KEY as STORAGE_KEY } from "./Boot.jsx";

// The game is a lazy chunk; Boot paints the landing first (see Boot.jsx).
const App = lazy(() => import("./PersonaApp.jsx"));

// Paint the saved run's light before the first frame, so a Heart to heart player never flashes through Day.
try {
  const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  if (saved && saved.lobby && saved.lobby.voice) setThemeForVoice(saved.lobby.voice);
} catch { /* no storage or an unreadable save: stay on Day */ }

createRoot(document.getElementById("root")).render(<Suspense fallback={<Boot />}><App /></Suspense>);
