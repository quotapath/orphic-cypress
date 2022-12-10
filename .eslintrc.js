module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:storybook/recommended",
    "prettier",
  ],
  settings: {
    react: {
      version: "detect",
    },
    "mdx/code-blocks": true,
  },
  overrides: [
    // typescript
    // TODO: this would be neat, but has plenty of legit errors, and doesn't
    // yet work well with the pseudo files created from markdown blocks
    // {
    //   files: ["**/*.ts{,x}"],
    //   extends: [
    //     "plugin:@typescript-eslint/recommended-requiring-type-checking",
    //   ],
    //   parserOptions: {
    //     tsconfigRootDir: __dirname,
    //     project: ["./tsconfig.json"],
    //   },
    // },

    // md, mdx, and code blocks in those files
    {
      files: ["**/*.md{,x}{,/*.{ts,tsx,mdx}}"],
      extends: "plugin:mdx/recommended",
      rules: {
        "react/react-in-jsx-scope": "off",
        // got weird on blocks that were just components, e.g. ```ts<></>;```
        "@typescript-eslint/semi": "off",
      },
      globals: {
        Story: "readonly",
        it: "readonly",
        before: "readonly",
        beforeEach: "readonly",
        cy: "readonly",
        expect: "readonly",
      },
    },

    // just mdx and md, and mdx blocks in mdx
    // nothing here anymore, but worthwhile categorization
    // { files: ["**/*.md{,x}{,/*.{md,mdx}}"] },

    // just code blocks
    {
      files: ["**/*.md{,x}/*.{ts,tsx,mdx}"],
      rules: {
        // these are only unimportant in code blocks which aren't a part of
        // literate testing, but that should be ok due to them being under test
        "react/jsx-no-undef": "off",
        // if we're in a code block, the type is just there for example
        "@typescript-eslint/no-inferrable-types": "off",
      },
    },
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  ignorePatterns: ["dist", "docs", "__mock__", "!.storybook"],
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
    quotes: ["error", "double", { avoidEscape: true }],
  },
};
