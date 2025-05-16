import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next"],
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-this-alias": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-require-imports": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-wrapper-object-types": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
      "@typescript-eslint/no-unsafe-function-type": [
        "error",
        {
          ignorePatterns: ["src/generated/**/*"],
        },
      ],
    },
    overrides: [
      {
        files: ["src/generated/**/*"],
        rules: {
          "@typescript-eslint/no-explicit-any": "off",
          "@typescript-eslint/no-unused-vars": "off",
          "@typescript-eslint/no-empty-object-type": "off",
          "@typescript-eslint/no-unused-expressions": "off",
          "@typescript-eslint/no-this-alias": "off",
          "@typescript-eslint/no-require-imports": "off",
          "@typescript-eslint/no-wrapper-object-types": "off",
          "@typescript-eslint/no-unsafe-function-type": "off",
        },
      },
    ],
  }),
];

export default eslintConfig;
