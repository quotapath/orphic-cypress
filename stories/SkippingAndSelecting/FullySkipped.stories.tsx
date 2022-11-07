import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";

export default {
  component: Button,
  cySkip: true,
};

export const Skipped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

Skipped.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");

// Also shows object spread syntax
export const Another = {
  ...Skipped,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};
