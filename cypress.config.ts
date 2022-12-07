/* eslint-disable @typescript-eslint/no-var-requires */
import { defineConfig } from "cypress";
import ReactDocgenTypescriptPlugin from "react-docgen-typescript-plugin";

import * as tasks from "./cypress/support/tasks";
import { setStorybookFiles, useIsolatedComponentFiles } from "./src";
// @ts-ignore
import webpackConfig from "./webpack.config";

webpackConfig.plugins.push(new ReactDocgenTypescriptPlugin());

const mdUse = (skipCsf: boolean) => [
  {
    loader: "babel-loader",
    options: {
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-env", "@babel/preset-react"],
    },
  },
  {
    loader: require.resolve("@storybook/mdx1-csf/loader"),
    options: { skipCsf },
  },
];

const tsLoaderUse = webpackConfig.module.rules[0].use[0];
webpackConfig.module.rules[0].use.unshift({
  loader: "babel-loader",
  options: {
    plugins: ["istanbul"],
    babelrc: false,
    configFile: false,
  },
});

// Required to support arbitary mdx imports in csf and mdx test files
webpackConfig.module.rules.push({
  test: /\.mdx$/,
  use: [tsLoaderUse, ...mdUse(false)],
});
webpackConfig.module.rules.push({
  test: /\.md$/,
  use: mdUse(true),
});
webpackConfig.module.rules.push({
  test: /\.css$/i,
  use: ["style-loader", "css-loader"],
});

export default defineConfig({
  videoUploadOnPasses: false,
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
      webpackConfig,
    },
    ...(useIsolatedComponentFiles && {
      specPattern: [
        "**/*.stories.ts{,x}",
        "**/*.cy.ts{,x}",
        "**/*.stories.mdx",
      ],
      excludeSpecPattern: ["**/*/mount.cy.ts{,x}", "**/*/Overview.*"],
    }),
    setupNodeEvents: (on, config) => {
      config.env.storyLocation = "./stories/";
      require("@bahmutov/cypress-code-coverage/plugin")(on, config);
      on("task", tasks);
      return setStorybookFiles(on, config);
    },
    experimentalSingleTabRunMode: true,
  },
});
