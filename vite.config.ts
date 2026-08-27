import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the built `dist/` works from a domain root, from a
  // subdirectory, or straight off the filesystem. Combined with hash routing that
  // means the site can be hosted anywhere static with no rewrite rules at all —
  // which is what "make it web-accessible" has to mean in practice.
  base: "./",
  build: {
    sourcemap: false
  }
});
