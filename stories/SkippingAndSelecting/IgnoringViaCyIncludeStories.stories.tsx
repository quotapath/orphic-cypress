import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

export default {
  component: Button,
  cyIncludeStories: ["NotSkippedFunction", "NotSkippedObject"],
  id: "ignoring-via-cyincludestories", // story-code @skip
};

export const NotSkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");
// story-code @end @include-default
NotSkippedFunction.parameters = {
  docs: {
    description: {
      story: `
\`cyIncludeStories\` allows similar functionality to includeStories on the default export.
It can be used to ensure that only some stories are tested while the others don't
register with cypress at all, where [.cySkip](/docs/skippingandselecting-fullyskipped--skipped)
will designate them as 'pending'.`,
    },
  },
};

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
// story-code @end

export const NotSkippedObject = {
  ...SkippedFunction,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Another"),
};

export const SkippedObject = {
  ...SkippedFunction,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
