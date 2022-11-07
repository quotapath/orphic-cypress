module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:storybook/recommended",
  ],
  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  ignorePatterns: ["dist"],
  rules: {
    "linebreak-style": ["error", "unix"],
    "storybook/use-storybook-expect": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    // not good practice overall, but lots of generics in this lib
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/semi": ["error", "always"],
    quotes: ["error", "double"],
  },
};
