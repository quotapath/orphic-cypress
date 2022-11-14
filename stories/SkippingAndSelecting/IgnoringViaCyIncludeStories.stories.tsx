import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../Button";
// @ts-ignore
import mdx from "./IgnoringViaCyIncludeStories.mdx";

export default {
  component: Button,
  cyIncludeStories: ["NotSkippedFunction", "NotSkippedObject"],
  id: "ignoring-via-cyincludestories",
};

export const NotSkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

NotSkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");
NotSkippedFunction.parameters = { docs: { page: mdx } };

export const SkippedFunction: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Story function" />
);

SkippedFunction.cy = () =>
  cy.dataCy("button").should("contain", "Would fail if not skipped");
SkippedFunction.parameters = { docs: { page: mdx } };

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
