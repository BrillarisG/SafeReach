import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/",
  esbuild: {
    jsx: "automatic",
    jsxImportSource: "react",
  },
  resolve: {
    alias: {
      "@": path.resolve(process.cwd()),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  preview: {
    host: "0.0.0.0",
    port: 3000,
  },
});
