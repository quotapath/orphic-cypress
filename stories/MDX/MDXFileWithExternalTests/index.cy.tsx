import { composeStories } from "@storybook/react";
import React from "react";
// @ts-ignore
import * as stories from "./index.stories.mdx";

const { mdxFileWithExternalTests: MDXFileWithExternalTests } =
  composeStories(stories);

describe("External test file", () => {
  it("should contain the external label", () => {
    const onClick = cy.stub();
    cy.mount(<MDXFileWithExternalTests onClick={onClick} />);
    cy.dataCy("button").should("contain", "In MDX");
    cy.dataCy("button")
      .click()
      .then(() => expect(onClick).to.be.calledOnceWith(0));
  });
});
