import * as eslintrc from "@eslint/eslintrc";
import tseslint from "typescript-eslint";

/** ESM named export locally; some bundlers expose `default.FlatCompat` (e.g. Next on Vercel). */
const FlatCompat =
  eslintrc.FlatCompat ??
  (typeof eslintrc.default === "object" && eslintrc.default !== null
    ? /** @type {{ FlatCompat: (typeof eslintrc)["FlatCompat"] }} */ (
        eslintrc.default
      ).FlatCompat
    : undefined);
if (!FlatCompat) {
  throw new Error("@eslint/eslintrc: FlatCompat not found");
}

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default tseslint.config(
  {
    ignores: [".next", "generated/**", "node_modules/**"],
  },
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
    },
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
);
