import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base = "/martitas-dream/" para GitHub Pages (project site).
// En local (dev) usamos "/" para que funcione sin la subruta.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/martitas-dream/" : "/",
  plugins: [react()],
}));
