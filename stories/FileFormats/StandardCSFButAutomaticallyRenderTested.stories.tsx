import type { ComponentStory } from "@storybook/react";
import React from "react";
import { Button } from "../Button";

export default { component: Button };

export const ShouldMount: ComponentStory<typeof Button> = (args) => (
  <Button {...args} />
);
ShouldMount.args = { label: "No cypress tests here" };
// story-code @end @include-start
ShouldMount.parameters = {
  docs: {
    description: {
      story:
        "Simply check if the component renders okay without extra cypress assertions",
    },
  },
};
