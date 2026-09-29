import React from "react";
import { createRoot } from "react-dom/client";
import App from "./PersonaApp.jsx";
import { STORAGE_KEY } from "./persona/session.js";
import { setThemeForVoice } from "./system/index.js";

// Paint the saved run's light before the first frame, so a Heart to heart player never flashes through Day.
try {
  const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
  if (saved && saved.lobby && saved.lobby.voice) setThemeForVoice(saved.lobby.voice);
} catch { /* no storage or an unreadable save: stay on Day */ }

createRoot(document.getElementById("root")).render(<App />);
