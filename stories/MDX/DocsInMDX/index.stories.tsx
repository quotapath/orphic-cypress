import type { ComponentStory } from "@storybook/react";
import * as React from "react";
import { Button } from "stories";

// eslint-disable-next-line storybook/story-exports
export default {
  component: Button,
  // mdx generated docs
  includeStories: [],
  cyIncludeStories: true,
};

export const DocsInMDX: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);
DocsInMDX.args = {
  label: "Documentation provided by mdx file while component is written in csf",
};
// don't show the component in the docs created by mdx
DocsInMDX.parameters = {
  docs: { disable: true },
};
