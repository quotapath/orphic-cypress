import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

export default { component: Button };

export const NotSkipped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkipped.cy = () => cy.dataCy("button").should("contain", "Story function");

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
SkippedFunction.cySkip = true;

// Also shows object spread syntax
export const Skipped = {
  ...NotSkipped,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
  cySkip: true,
};