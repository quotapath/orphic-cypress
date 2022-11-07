import type { ComponentStory } from "@storybook/react";
import * as React from "react";
import { Button } from "../../Button";

// eslint-disable-next-line storybook/story-exports
export default {
  component: Button,
  // otherwise this would do a mount test like Untested.stories.tsx
  // which would be fine in this case, just redundant
  cyIncludeStories: [],
  // mdx generated docs
  includeStories: [],
};

export const ExternalTest: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);
ExternalTest.args = { label: "Will be tested in external .cy file" };
// don't show the component in the docs created by mdx
ExternalTest.parameters = {
  docs: { disable: true },
};
