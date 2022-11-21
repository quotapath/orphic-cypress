import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { ClickCount } from "../Button";

export default { component: ClickCount };

export const CallExplicitArgtypeStub: ComponentStoryCy<typeof ClickCount> = (
  args
) => <ClickCount {...args} />;
CallExplicitArgtypeStub.argTypes = {
  onClick: { action: "myClickStub" },
};
CallExplicitArgtypeStub.cy = function () {
  cy.dataCy("count").should("contain", 0);
  cy.dataCy("button").click();

  // name on actions is `onClick`
  cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
  // but the action string also functions as an alias
  cy.get("@myClickStub").should("be.calledOnceWith", 0);
  // and it's also aliased as argTypesRegex.onClick since the argtypes would have applied
  cy.get("@argTypesRegex.onClick").should("be.calledWith", 0);

  cy.dataCy("count").should("contain", 1);

  cy.dataCy("button")
    .click()
    .then(() => {
      // just proving that `this` access works
      const self = this as any;
      expect(self.actions.onClick).to.have.callCount(2).and.be.calledWith(1);
      expect(self.myClickStub).to.have.callCount(2).and.be.calledWith(1);
      expect(self["argTypesRegex.onClick"])
        .to.have.callCount(2)
        .and.be.calledWith(1);
      cy.dataCy("count").should("contain", 2);
    });
};
// story-code @end

export const CallImplicitArgtypeActionStubAutomaticallyViaRegex: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cy: function () {
    cy.dataCy("button").click();

    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
    // confirming that `this` access also works
    // @ts-ignore
    expect(this.actions.onClick).to.be.calledOnceWith(0);
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
    // @ts-ignore
    onSomethingElse: () => 1,
  },
  cy: () => {
    // these won't be called, but asserting not called proves they were stubbed and are stubs/spies
    cy.get("@actions").its("onSomethingElse").should("not.be.called");
    cy.get("@argTypesRegex.onSomethingElse").should("not.be.called");
  },
  // story-code @skip-start
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
  // story-code @skip-end
};

export const MockIfProvidedViaArgTypesRegardlessOfDocgen: ComponentStoryObjCy<
  typeof ClickCount
> = {
  argTypes: {
    // @ts-ignore
    onSomethingElse: { action: "onSomethingElseAlias" },
  },
  cy: () => {
    cy.get("@actions").its("onSomethingElse").should("not.be.called");
    cy.get("@onSomethingElseAlias").should("not.be.called");
  },
};
