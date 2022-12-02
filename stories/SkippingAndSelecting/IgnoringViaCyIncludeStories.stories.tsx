import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "stories";
import mdxObj from "./mdx";

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
      /* istanbul ignore else */ // story-code @skip
      story: mdxObj["ignoring-via-cyincludestories"]?.md,
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
// story-code @end

export const NotSkippedObject = {
  ...SkippedFunction,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Another"),
};

export const SkippedObject = {
  ...SkippedFunction,
  args: { label: "Another" },
  cy:
    /* istanbul ignore next */ // story-code @skip
    () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
