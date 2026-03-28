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
      reporter: ["text", "lcov"],
      reportsDirectory: "./tests/coverage",
      exclude: [
        "**/*.config.{cjs,js,ts}",
        "**/.eslintrc.cjs",
        "index.ts",
        "src/index.ts",
      ],
      thresholds: {
        lines: 95,
        branches: 85,
      },
    },
  },
});
