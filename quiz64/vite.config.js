import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { stripKitPlugin } from "./kit-strip.mjs";

export default defineConfig({
  base: "./",
  plugins: [stripKitPlugin(), react()],
  server: {
    // The persona game reads the maintained kit in research/persona-quiz-v2/final directly.
    fs: { allow: [fileURLToPath(new URL(".", import.meta.url)), fileURLToPath(new URL("../research/persona-quiz-v2/final", import.meta.url))] },
  },
  build: {
    // One product: the persona game. The older dossier developer preview (preview.html) stays available under
    // `npm run dev` only and is no longer shipped.
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./index.html", import.meta.url)),
      },
    },
  },
});
