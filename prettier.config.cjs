/** @typedef  {import('@ianvs/prettier-plugin-sort-imports').PluginConfig} SortImportsConfig */
/** @typedef  {import('prettier').Config} PrettierConfig */
/** @typedef  {{ tailwindConfig: string }} TailwindConfig */

/** @type { PrettierConfig | SortImportsConfig | TailwindConfig } */
const config = {
    arrowParens: 'always',
    printWidth: 80,
    singleQuote: false,
    jsxSingleQuote: false,
    semi: true,
    trailingComma: 'all',
    tabWidth: 2,
    plugins: [
        '@ianvs/prettier-plugin-sort-imports',
    ],
    importOrder: [
        '^(react/(.*)$)|^(react$)',
        '<THIRD_PARTY_MODULES>',
        '^[../]',
        '^[./]'
    ],
    importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
    importOrderTypeScriptVersion: '5.0.0',
    bracketSpacing: true
}

module.exports = config
