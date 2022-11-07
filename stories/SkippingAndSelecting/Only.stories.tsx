import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

// eslint-disable-next-line storybook/story-exports
export default {
  component: Button,
  // comment out this line to see the only's apply
  includeStories: [],
};

export const NotSkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");
NotSkippedFunction.cyOnly = true;

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");

export const NotSkippedObject = {
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Another"),
  cyOnly: true,
};

export const SkippedObject = {
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
