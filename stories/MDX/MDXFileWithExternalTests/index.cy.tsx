import { composeStories } from "@storybook/react";
import * as sbPreview from "dot-storybook/preview";
import React from "react";
import { stubStoryActions } from "orphic-cypress";
// @ts-ignore
import * as stories from "./index.stories.mdx";

const { mdxFileWithExternalTests: MdxFileWithExternalTests } = composeStories(
  stories,
  sbPreview
);

describe("External test file", () => {
  it("should contain the external label", () => {
    const actions = stubStoryActions(MdxFileWithExternalTests, stories);
    cy.mount(<MdxFileWithExternalTests {...actions} />);
    cy.dataCy("button").should("contain", "In MDX");
    cy.dataCy("button")
      .click()
      .then(() => expect(actions.onClick).to.be.calledOnceWith(0));
  });
});
