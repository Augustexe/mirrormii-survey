// System barrel (package A). Every package imports tokens, Genii's light, sheets and theme helpers from here.
// Stylesheets are not exported: PersonaApp.jsx imports ./system/layers.css once.
export { GeniiLight } from "./GeniiLight.jsx";
export { geniiEvents, createEventBus, GENII_EVENTS } from "./events.js";
export { Reflect } from "./Reflect.jsx";
export { Sheet } from "./Sheet.jsx";
export { motion, THEMES, currentTheme, setTheme, setThemeForVoice, subscribeTheme, previewTheme } from "./theme.js";
export { useTheme } from "./useTheme.js";
export * as tokens from "./tokens.js";
