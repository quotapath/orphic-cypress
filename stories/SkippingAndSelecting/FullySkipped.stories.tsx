import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";
// @ts-ignore
import mdx from "./FullySkipped.mdx";

// eslint-disable-next-line storybook/story-exports
export default {
  component: Button,
  cySkip: true,
  // story-code @skip-start
  parameters: {
    docs: {
      page: mdx,
    },
  },
  // story-code @skip-end
};

export const Skipped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

Skipped.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
// story-code @end @include-default

export const Another = {
  ...Skipped,
  args: { label: "Another" },
  cy: () => cy.dataCy("button").should("contain", "Would fail if not skipped"),
};