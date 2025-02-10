import prettier from "eslint-config-prettier";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  {
    files: ["**/*.js"],
    ignores: ["node_modules"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: {
      prettier: pluginPrettier,
    },
    extends: ["eslint:recommended", prettier],
    rules: {
      "prettier/prettier": "error",
    },
    env: {
      node: true,
    },
  },
];
