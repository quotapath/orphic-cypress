import { themes } from "@storybook/theming";
import { DocsPage } from "../src/storybook/page";
import { transformSource } from "../src/storybook/story-code";

export const parameters = {
  docs: {
    page: DocsPage,
    source: { state: "open" },
    transformSource: transformSource({ includeObjects: true }),
    theme: themes.dark,
  },
  viewMode: "docs",
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
    hideNoControlsWarning: true,
  },
  options: {
    storySort: {
      order: [
        "Overview",
        "FileFormats",
        "StubActions",
        ["Overview"],
        "SkippingAndSelecting",
        ["Overview"],
        "MDX",
      ],
    },
  },
};
