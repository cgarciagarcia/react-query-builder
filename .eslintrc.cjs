// Legacy config kept only for Codacy, which runs ESLint 8 and cannot read
// eslint.config.js. ESLint 10 ignores this file; keep both in sync.
/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react-hooks/recommended",
  ],
  env: {
    es2022: true,
    browser: true,
    commonjs: true,
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint", "unused-imports", "@vitest"],
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

    // Vitest Configuration
    "@vitest/no-disabled-tests": "warn",
    "@vitest/no-focused-tests": "error",
    "@vitest/valid-expect": "error",
  },
  ignorePatterns: [
    ".eslintrc.cjs",
    "*.config.js",
    "*.config.cjs",
    "*.config.ts",
    "coverage",
    "examples",
  ],
  reportUnusedDisableDirectives: true,
  globals: {
    React: "writable",
  },
};

module.exports = config;
