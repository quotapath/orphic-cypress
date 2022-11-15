module.exports = {
  stories: [
    "../stories/**/*.stories.mdx",
    "../stories/**/*.stories.@(js|jsx|ts|tsx)",
  ],
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
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5",
  },
};
