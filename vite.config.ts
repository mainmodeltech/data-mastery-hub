import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// ──────────────────────────────────────────────────────────────────────────────
// NOTE : vite-plugin-prerender est incompatible avec @vitejs/plugin-react-swc
// (il requiert Babel). Supprimé de l'import.
//
// Le prerendering est géré via le script scripts/prerender.ts (voir ci-joint).
// ──────────────────────────────────────────────────────────────────────────────

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // ── Code splitting manuel pour améliorer LCP (Core Web Vitals → SEO) ──
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query-vendor": ["@tanstack/react-query"],
        },
      },
    },
  },
}));
