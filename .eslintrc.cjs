/** @type {import('eslint').Linter.Config} */
const config = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:jsx-a11y/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react/recommended",
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
  plugins: ["@typescript-eslint", "import", "unused-imports", "@vitest"],
  rules: {
    "react/prop-types": "off",
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
    "import/consistent-type-specifier-style": ["error", "prefer-inline"],
    "import/no-duplicates": "error",
    "object-curly-spacing": ["warn", "always"],

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
  settings: {
    react: { version: "detect" },
  },
};

module.exports = config;
