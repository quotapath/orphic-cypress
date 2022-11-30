import { composeStories } from "@storybook/react";
import * as sbPreview from "preview";
import React from "react";
import { stubStoryActions } from "src";
// @ts-ignore
import * as stories from "./index.stories.mdx";

const { mdxFileWithExternalTests: MDXFileWithExternalTests } = composeStories(
  stories,
  sbPreview
);

describe("External test file", () => {
  it("should contain the external label", () => {
    const actions = stubStoryActions(MDXFileWithExternalTests, stories);
    cy.mount(<MDXFileWithExternalTests {...actions} />);
    cy.dataCy("button").should("contain", "In MDX");
    cy.dataCy("button")
      .click()
      .then(() => expect(actions.onClick).to.be.calledOnceWith(0));
  });
});
