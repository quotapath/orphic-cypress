import { composeStories } from "@storybook/react";
import React from "react";
import * as stories from "./index.stories";

// this is necessary b/c stories here have mdx generated docs
delete (stories.default as { includeStories?: string[] }).includeStories;
const { ExternalTest } = composeStories(stories);

describe("External test file", () => {
  it("should contain the external label", () => {
    cy.mount(<ExternalTest />);
    cy.dataCy("button").should(
      "contain",
      "Will be tested in external .cy file"
    );
  });
});
