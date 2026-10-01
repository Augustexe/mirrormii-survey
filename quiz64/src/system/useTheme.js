import { useCallback, useSyncExternalStore } from "react";
import { currentTheme, setTheme as writeTheme, subscribeTheme } from "./theme.js";

// { theme: "day" | "dusk" | "clear", setTheme, scene } where scene is the backdrop scene for the current light.
export function useTheme() {
  const theme = useSyncExternalStore(subscribeTheme, currentTheme, () => "day");
  const setTheme = useCallback((next) => writeTheme(next), []);
  return { theme, setTheme, scene: theme };
}
