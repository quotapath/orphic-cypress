import { composeStories } from "@storybook/react";
import React from "react";
import { mockToCyIntercept } from "src";
import * as stories from "./index.stories";

const { WillFetch } = composeStories(stories);

describe("ExternalTests", () => {
  it("should fail if no interception provided", () => {
    cy.mount(<WillFetch />);
    cy.dataCy("button").should("contain", "Not Found!");
  });

  it("should be okay with a manual intercept", () => {
    // this could also happen in a beforeEach etc
    cy.intercept("GET", "/api/label", { body: { data: "Manual" } }).as(
      "manual"
    );
    cy.mount(<WillFetch />);
    cy.wait("@manual").then((interception) => {
      expect(interception?.response?.body).to.deep.equal({ data: "Manual" });
    });
    cy.dataCy("button").should("contain", "Manual");
  });

  it("should be okay after calling mockToCyIntercept util with component's mockData", () => {
    // could also happen in a beforeEach etc
    mockToCyIntercept(WillFetch.parameters?.mockData);
    cy.mount(<WillFetch />);
    cy.wait("@/api/label").then((interception) => {
      expect(interception?.response?.body).to.deep.equal({ data: "Loaded" });
    });
    cy.dataCy("button").should("contain", "Loaded");
  });
});
