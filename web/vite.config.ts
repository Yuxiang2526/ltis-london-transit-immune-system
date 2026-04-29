import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * `base` is set from `VITE_BASE_PATH` so the same build works for:
 *   - local dev / Vercel root deploy → base = "/"
 *   - GitHub Pages under a project subpath → base = "/<repo-name>/"
 *
 * The router (routes/router.tsx) reads `import.meta.env.BASE_URL` and the
 * data loader (hooks/useLTISData.ts) prefixes fetch URLs with the same
 * value, so changing `base` is the only knob that needs touching.
 */
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH ?? "/",
});
