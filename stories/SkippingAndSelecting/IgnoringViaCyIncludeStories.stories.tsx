import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

export default {
  component: Button,
  cyIncludeStories: ["NotSkippedFunction", "NotSkippedObject"],
};

export const NotSkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");

export const NotSkippedObject = {
  ...NotSkippedFunction,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Another"),
};

export const SkippedObject = {
  ...NotSkippedFunction,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
