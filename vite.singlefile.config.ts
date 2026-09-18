import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { viteSingleFile } from "vite-plugin-singlefile";

/**
 * Standalone single-file HTML build -- for sending this app around the org
 * as one `.html` attachment/link, no server needed. Separate from the
 * normal `vite.config.ts` (dev server + regular multi-file production
 * build) so neither build mode compromises the other.
 *
 * Usage: `npm run build:html` -> emits `dist-standalone/index.html`.
 *
 * - `vite-plugin-singlefile` inlines all JS/CSS into the one HTML file.
 * - `assetsInlineLimit: Number.MAX_SAFE_INTEGER` inlines every image/font
 *   as a base64 data URI instead of emitting separate `dist/assets/*` files
 *   (the plugin only rewrites `<script>`/`<link>` tags -- this is required
 *   for images/icons referenced from CSS or JS to end up in the one file).
 *
 * This app has no client-side router, so there's no `about:srcdoc` origin
 * crash risk when this gets embedded in a sandboxed iframe (as happens on
 * puppy.walmart.com/sharing) -- unlike a HashRouter/BrowserRouter app,
 * nothing here needs to construct a `URL` from `location`.
 */
export default defineConfig({
  plugins: [
    react({
      exclude: /src\/(components|patterns|common|hooks)\/.*/,
    }),
    viteSingleFile(),
  ],
  resolve: {
    alias: {
      "@livingdesign/react": path.resolve(__dirname, "src/index.ts"),
    },
  },
  build: {
    outDir: "dist-standalone",
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 100000,
  },
});
