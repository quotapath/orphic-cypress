const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.@(mdx|js|jsx|ts|tsx)"],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        transcludeMarkdown: true,
        sourceLoaderOptions: {
          injectStoryParameters: false,
        },
      },
    },
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-storysource",
    "storybook-addon-mock",
  ],
  webpackFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        src: path.resolve(__dirname, "..", "src"),
        stories: path.resolve(__dirname, "..", "stories"),
        "storybook/preview": path.resolve(__dirname, "preview"),
        "storybook/components": path.resolve(__dirname, "components"),
      },
    };
    return config;
  },
  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
};
