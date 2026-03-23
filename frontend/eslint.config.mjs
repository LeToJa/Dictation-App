import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vuePlugin from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: [
      "node_modules/**",
      ".nuxt/**",
      ".output/**",
      "dist/**",
      "coverage/**",
      "*.config.js",
      "*.config.ts",
    ],
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
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
      "vue/component-name-in-template-casing": ["warn", "PascalCase"],
      "vue/valid-template-root": "error",
      "vue/no-unused-vars": "warn",
    },
    overrides: [
      {
        files: ['**/*.vue'],
        extends: ['plugin:@typescript-eslint/disable-type-checked'],
      },
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { 
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_" 
      }],
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
    },
  },
];