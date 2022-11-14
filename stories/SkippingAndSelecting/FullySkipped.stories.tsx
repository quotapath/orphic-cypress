import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

// eslint-disable-next-line storybook/story-exports
export default {
  component: Button,
  cySkip: true,
  // rest is internal meta
  includeStories: [],
  cyIncludeStories: true,
};

export const Skipped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

Skipped.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
Skipped.parameters = { docs: { disable: true } };

// Also shows object spread syntax
export const Another = {
  ...Skipped,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
