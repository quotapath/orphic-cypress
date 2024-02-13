// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.@(mdx|js|jsx|ts|tsx)"],

  addons: [
    {
      // eslint-disable-next-line storybook/no-uninstalled-addons
      name: "@storybook/addon-docs",
      options: {
        transcludeMarkdown: true,
        // sourceLoaderOptions: {
        //   injectStoryParameters: false,
        // },
      },
    },
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-storysource",
    "storybook-addon-mock",
    "@storybook/addon-mdx-gfm",
  ],

  webpackFinal: async (config) => {
    // I don't want to minimize because I'm running some literate testing
    // through UnitTest and, for example's sake, have some that don't use
    // strings for .cy and .cyTest, or code blocks, but print the actual
    // compiled code in the story
    config.optimization.minimizer = [];
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        "orphic-cypress": path.resolve(__dirname, "..", "src"),
        stories: path.resolve(__dirname, "..", "stories"),
        "dot-storybook/preview": path.resolve(__dirname, "preview"),
        "dot-storybook/components": path.resolve(__dirname, "components"),
      },
    };
    return config;
  },

  framework: {
    name: "@storybook/react-webpack5",

    options: {
      builder: {
        useSWC: true,
      },
    },
  },

  docs: {
    autodocs: "tag",
  },
};
