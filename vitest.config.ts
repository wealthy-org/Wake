import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@wake/core": path.resolve(__dirname, "packages/core/src/index.ts"),
      "@wake/store": path.resolve(__dirname, "packages/store/src/index.ts"),
      "@wake/engine": path.resolve(__dirname, "packages/engine/src/index.ts"),
      "@wake/api": path.resolve(__dirname, "packages/api/src/index.ts"),
      "@wake/signals": path.resolve(__dirname, "packages/signals/src/index.ts"),
      "@wake/context": path.resolve(__dirname, "packages/context/src/index.ts"),
      "@wake/research": path.resolve(__dirname, "packages/research/src/index.ts"),
      "@wake/calls": path.resolve(__dirname, "packages/calls/src/index.ts"),
      "@wake/cli": path.resolve(__dirname, "packages/cli/src/index.tsx"),
    },
  },
});
