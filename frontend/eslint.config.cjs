const globals = require("globals");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const vuePlugin = require("eslint-plugin-vue");

module.exports = [
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: require("vue-eslint-parser"),
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
        extraFileExtensions: [".vue"],
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": "off",
      "vue/require-default-prop": "off",
      "vue/no-v-html": "warn",
      "vue/no-multiple-template-root": "off",
      "vue/attribute-hyphenation": ["warn", "always"],
      "vue/v-on-event-hyphenation": ["warn", "always"],
    },
  },
  {
    files: ["**/*.ts", "**/*.js", "**/*.vue"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
  {
    ignores: [
      "node_modules/",
      ".nuxt/",
      ".output/",
      "dist/",
      "coverage/",
      "*.config.js",
      "*.config.ts",
      ".eslintrc.*",
    ],
  },
];
