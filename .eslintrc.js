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
  ignorePatterns: ["dist", "docs"],
  rules: {
    "linebreak-style": ["error", "unix"],
    "storybook/use-storybook-expect": "off",
    "@typescript-eslint/ban-ts-comment": "off",
    // not good practice overall, but lots of generics in this lib
    "@typescript-eslint/no-explicit-any": "off",
    // normally would have this, but this project being largely tests, I'm okay with a little type cheating
    // especially when in this case optional chaining leads to unnecessary branches in the eyes of coverage
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/semi": ["error", "always"],
    quotes: ["error", "double"],
  },
};
