import React from "react";
import type { ComponentStoryObjCy } from "src";
import { ClickCount } from "../Button";

export default { component: ClickCount };

export const CallExplicitArgtypeActionStubAutomatically: ComponentStoryObjCy<
  typeof ClickCount
> = {
  argTypes: {
    onClick: { action: "myClickStub" },
  },
  cy: () => {
    cy.dataCy("count").should("contain", 0);
    cy.dataCy("button").click();

    // name on actions is `onClick`
    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    // but the action string also functions as an alias
    cy.get("@myClickStub").should("be.calledOnceWith", 0);
    // which is a nice-to-have, but is important during test b/c the stub
    // for the regex is still created, its just overwritten
    cy.get("@argTypesRegex.onClick").should("not.be.called");

    cy.dataCy("count").should("contain", 1);
  },
};

export const CallImplicitArgtypeActionStubAutomaticallyViaRegex: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cy: () => {
    cy.dataCy("button").click();

    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    // this time, it is the regex and no other stubs were created
    cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
  },
};

export const CallWithExplicitStubAsPropToStory: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cyTest: (Story) => {
    beforeEach(() => {
      cy.spy(() => 1).as("beforeEachSpy");
    });

    it("should call the spy and not the argTypesRegex stub", function () {
      // could be alias syntax, but showing variant
      cy.mount(<Story onClick={this.beforeEachSpy} />);
      cy.dataCy("button")
        .click()
        .then(() => {
          expect(this.actions.onClick).to.have.callCount(0);
          expect(this["argTypesRegex.onClick"]).to.have.callCount(0);
          expect(this.beforeEachSpy).to.be.calledOnceWith(0);
        });
    });
  },
};

export const MockIfProvidedViaArgsRegardlessOfDocgen: ComponentStoryObjCy<
  typeof ClickCount
> = {
  args: {
    // eslint-disable-next-line
    // @ts-ignore
    onSomethingElse: () => 1,
  },
  cy: () => {
    // these won't be called, but asserting not called proves they were stubbed and are stubs/spies
    cy.get("@actions").its("onSomethingElse").should("not.be.called");
    cy.get("@argTypesRegex.onSomethingElse").should("not.be.called");
  },
  parameters: {
    docs: {
      description: {
        story: `
Proves that you can mock without presence of docgen plugin as long as it comes in as an arg.
Providing a mock not acceptable by typescript was easier than building a separate pipeline
without docgen`,
      },
    },
  },
};

export const MockIfProvidedViaArgTypesRegardlessOfDocgen: ComponentStoryObjCy<
  typeof ClickCount
> = {
  argTypes: {
    // eslint-disable-next-line
    // @ts-ignore
    onSomethingElse: { action: "onSomethingElseAlias" },
  },
  cy: () => {
    cy.get("@actions").its("onSomethingElse").should("not.be.called");
    cy.get("@onSomethingElseAlias").should("not.be.called");
  },
};
