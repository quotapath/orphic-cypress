import { composeStories } from "@storybook/react";
import React from "react";
import { stubStoryActions } from "src";
import * as sbPreview from "storybook/preview";
import * as stories from "./index.stories";

const { ArgtypeActionStub, ImplicitArgtypeActionStubViaRegex } = composeStories(
  stories,
  sbPreview
);

// With the caveat of argTypesRegex not carrying over from the main parameters
// all of the nuance expressed in ./BeforeEach.stories.tsx and
// ./PerStoryArgs.stories.tsx can be represented in external cases as well

describe("ExternalTests", () => {
  describe("with argType explicitly provided", () => {
    describe("direct approach", () => {
      it("should call the proper stubs", function () {
        const actions = stubStoryActions(ArgtypeActionStub, stories);
        cy.mount(<ArgtypeActionStub {...actions} />);

        cy.dataCy("count").should("contain", 0);
        // can expect directly on actions
        cy.dataCy("button")
          .click()
          .then(() => expect(actions.onClick).to.be.calledOnceWith(0));

        // name on actions is `onClick`
        cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
        // but the action string also functions as an alias
        cy.get("@myClickStub").should("be.calledOnceWith", 0);
        // would also come from regex
        cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);

        cy.dataCy("count").should("contain", 1);
      });
    });

    describe("in before each", () => {
      beforeEach(() => {
        stubStoryActions(ArgtypeActionStub, stories);
      });

      it("should stub tests when argtype is explicitly provided", function () {
        cy.mount(<ArgtypeActionStub {...this.actions} />);

        cy.dataCy("count").should("contain", 0);
        // can expect directly on actions
        cy.dataCy("button")
          .click()
          .then(() => expect(this.actions.onClick).to.be.calledOnceWith(0));
        cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
        cy.get("@myClickStub").should("be.calledOnceWith", 0);
        cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
      });
    });
  });

  describe("without argtype explicitly provided", () => {
    describe("direct approach", () => {
      it("should call the proper stubs", function () {
        const actions = stubStoryActions(
          ImplicitArgtypeActionStubViaRegex,
          stories
        );
        cy.mount(<ImplicitArgtypeActionStubViaRegex {...actions} />);

        cy.dataCy("count").should("contain", 0);
        // can expect directly on actions
        cy.dataCy("button")
          .click()
          .then(() => expect(actions.onClick).to.be.calledOnceWith(0));

        cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
        cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);

        cy.dataCy("count").should("contain", 1);
      });
    });

    describe("in before each", () => {
      beforeEach(() => {
        stubStoryActions(ImplicitArgtypeActionStubViaRegex, stories);
      });

      it("should stub tests when argtype is explicitly provided", function () {
        cy.mount(<ImplicitArgtypeActionStubViaRegex {...this.actions} />);
        cy.dataCy("button").click();
        cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
        cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
      });
    });
  });
});
