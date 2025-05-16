import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.config({
    extends: ["next"],
  }),
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": [
        "error",
        {
          ignoreRestArgs: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-empty-object-type": ["error"],
      "@typescript-eslint/no-unused-expressions": ["error"],
      "@typescript-eslint/no-this-alias": ["error"],
      "@typescript-eslint/no-require-imports": ["error"],
      "@typescript-eslint/no-unsafe-function-type": ["error"],
    },
  },
  {
    files: ["src/generated/**/*"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
    },
  },
];

export default eslintConfig;
