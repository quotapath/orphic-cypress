import type { ComponentStory } from "@storybook/react";
import * as React from "react";
// @ts-ignore
import mdx from "./index.mdx";
import { Button } from "stories";

export default { component: Button };

export const CSFStoriesWithArbitraryMDX: ComponentStory<typeof Button> = (
  args
) => <Button {...args} />;
CSFStoriesWithArbitraryMDX.args = {
  label: "Documentation provided by arbitrary mdx file imports",
};
// don't show the component in the docs created by mdx
CSFStoriesWithArbitraryMDX.parameters = {
  docs: {
    page: mdx,
  },
};
