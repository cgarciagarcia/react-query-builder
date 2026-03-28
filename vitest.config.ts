import { resolve } from "path";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@tests": resolve(__dirname, "./tests"),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      thresholds: {
        lines: 85,
      },
    },
  },
});
