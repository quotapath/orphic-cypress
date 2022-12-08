import React from "react";
import type { ComponentStoryCy } from "orphic-cypress";
import { Button } from "stories";

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

/* istanbul ignore next */ // story-code @skip
export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

/* istanbul ignore next */ // story-code @skip
SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
SkippedFunction.cySkip = true;
// story-code @end

export const Skipped = {
  ...NotSkipped,
  args: { label: "Another" },
  cy:
    /* istanbul ignore next */ // story-code @skip
    () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
  cySkip: true,
};
