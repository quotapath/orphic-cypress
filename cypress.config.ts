/* eslint-disable @typescript-eslint/no-var-requires */
import { defineConfig } from "cypress";
import ReactDocgenTypescriptPlugin from "react-docgen-typescript-plugin";

import * as tasks from "./cypress/support/tasks";
import {
  cypressWebpackConfigMdx,
  setStorybookFiles,
  useIsolatedComponentFiles,
} from "./src";
// @ts-ignore
import webpackConfigDev from "./webpack.config";

const webpackConfig = cypressWebpackConfigMdx(webpackConfigDev);

webpackConfig.plugins.push(new ReactDocgenTypescriptPlugin());

webpackConfig.module.rules.push({
  test: /\.css$/i,
  use: ["style-loader", "css-loader"],
});

export default defineConfig({
  videoUploadOnPasses: false,
  component: {
    env: {
      "orphic-cypress": {
        storyLocation: "./stories/",
      },
    },
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
      require("@bahmutov/cypress-code-coverage/plugin")(on, config);
      on("task", tasks);
      return setStorybookFiles(on, config);
    },
    experimentalSingleTabRunMode: true,
  },
});
