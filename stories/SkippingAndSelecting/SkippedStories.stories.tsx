import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

export default { component: Button };

export const NotSkipped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkipped.cy = () => cy.dataCy("button").should("contain", "Story function");
// story-code @end @include-default
NotSkipped.parameters = {
  docs: {
    description: {
      story:
        "You can skip individual stories via `.cySkip` property on the story itself.",
    },
  },
};

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
SkippedFunction.cySkip = true;
// story-code @end

export const Skipped = {
  ...NotSkipped,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
  cySkip: true,
};
