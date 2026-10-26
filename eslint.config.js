import eslintReact from "@eslint-react/eslint-plugin";
import eslint from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import importX from "eslint-plugin-import-x";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: [
      "dist/",
      "docs/",
      "examples/",
      "**/coverage/",
      "eslint.config.js",
      ".eslintrc.cjs",
      "*.config.js",
      "*.config.cjs",
      "*.config.ts",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  reactHooks.configs.flat.recommended,
  eslintReact.configs["recommended-typescript"],
  eslintReact.configs["disable-conflict-eslint-plugin-react-hooks"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        React: "writable",
      },
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    plugins: {
      "import-x": importX,
      "unused-imports": unusedImports,
      "@vitest": vitest,
    },
    rules: {
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "unused-imports/no-unused-imports": "error",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [
        2,
        { checksVoidReturn: { attributes: false } },
      ],
      "import-x/consistent-type-specifier-style": ["error", "prefer-inline"],
      "import-x/no-duplicates": "error",

      // Vitest Configuration
      "@vitest/no-disabled-tests": "warn",
      "@vitest/no-focused-tests": "error",
      "@vitest/valid-expect": "error",
    },
  },
);
