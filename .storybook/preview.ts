import { themes } from "@storybook/theming";
import { DocsPage } from "../src/storybook/page";

export const parameters = {
  docs: {
    page: DocsPage,
    source: { state: "open" },
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
      order: ["*", "SkippingAndSelecting", ["Overview"]],
    },
  },
};
