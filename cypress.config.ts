import { defineConfig } from "cypress";
import ReactDocgenTypescriptPlugin from "react-docgen-typescript-plugin";
import { setStorybookFiles, useIsolatedComponentFiles } from "./src";
// @ts-ignore
import webpackConfig from "./webpack.config";

webpackConfig.plugins.push(new ReactDocgenTypescriptPlugin());
// Only required to support arbitary mdx imports in csf
webpackConfig.module.rules.push({
  test: /\.mdx$/,
  use: [
    {
      loader: "babel-loader",
      options: {
        babelrc: false,
        configFile: false,
        sourceType: "unambiguous",
        presets: ["@babel/preset-env", "@babel/preset-react"],
      },
    },
    {
      loader: require.resolve("@storybook/mdx1-csf/loader"),
      options: { skipCsf: false },
    },
  ],
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
      specPattern: ["**/*.stories.ts{,x}", "**/*.cy.ts{,x}"],
      excludeSpecPattern: ["**/*/mount.cy.ts{,x}"],
    }),
    setupNodeEvents: (on, config) => {
      config.env.storyLocation = "./stories/";
      return setStorybookFiles(on, config);
    },
    experimentalSingleTabRunMode: true,
  },
});
