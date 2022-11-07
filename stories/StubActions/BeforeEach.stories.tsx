import type Sinon from "cypress/types/sinon";
import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { ClickCount } from "../Button";

// With both of these, you'd probably just be passing in normal functions,
// but here we're spying for the sake of meta-test assertions.
const onClickSpy = (global as any).Cypress
  ? Cypress.sinon.spy(() => 1)
  : ((() => 1) as Sinon.SinonSpy);
const onClickSpy2 = (global as any).Cypress
  ? Cypress.sinon.spy(() => 1)
  : ((() => 1) as Sinon.SinonSpy);

export default {
  component: ClickCount,
  argTypes: {
    onClick: { action: "myClickStub" },
  },
  args: {
    // not tested until SpyOnArgsWhichAreProvidedInDefaultExport
    onClick2: onClickSpy2,
  },
};

export const StubActionsDefinedOnDefaultExport: ComponentStoryObjCy<
  typeof ClickCount
> = {
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
  parameters: {
    docs: {
      source: {
        code: `
export const StubActionsDefinedOnDefaultExport: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cy: () => {
    cy.dataCy("count").should("contain", 0);
    cy.dataCy("button").click();

    // name on actions is \`onClick\`
    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    // but the action string also functions as an alias
    cy.get("@myClickStub").should("be.calledOnceWith", 0);
    // which is a nice-to-have, but is important during test b/c the stub
    // for the regex is still created, its just overwritten
    cy.get("@argTypesRegex.onClick").should("not.be.called");

    cy.dataCy("count").should("contain", 1);
  }
};`,
      },
    },
  },
};

export const SpyOnArgsWhichAreAlreadyProvided: ComponentStoryObjCy<
  typeof ClickCount
> = {
  args: {
    onClick: onClickSpy,
  },
  cy: () => {
    onClickSpy.resetHistory();
    cy.dataCy("button")
      .click()
      // So the spy itself is already called (you'd probably just provide a normal function)
      .then(() => expect(onClickSpy).to.be.calledOnceWith(0));
    // And then the important thing: actions object wraps that provided function in a spy
    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    // this time, it is the regex and no other stubs were created
    cy.get("@argTypesRegex.onClick").should("not.be.called");
  },
};

export const SpyOnArgsWhichAreProvidedToFnSyntax: ComponentStoryCy<
  typeof ClickCount
> = (args) => <ClickCount {...args} />;
SpyOnArgsWhichAreProvidedToFnSyntax.args = {
  onClick: onClickSpy,
};
SpyOnArgsWhichAreProvidedToFnSyntax.cy = () => {
  onClickSpy.resetHistory();
  cy.dataCy("button")
    .click()
    .then(() => expect(onClickSpy).to.be.calledOnceWith(0));
  cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
  cy.get("@argTypesRegex.onClick").should("not.be.called");
};

export const SpyOnArgsWhichAreProvidedInDefaultExport: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cy: () => {
    onClickSpy2.resetHistory();
    cy.dataCy("button-2")
      .click()
      .then(() => expect(onClickSpy2).to.be.calledOnceWith(0));
    cy.get("@actions").its("onClick2").should("be.calledOnceWith", 0);
    // No argTypes provided for onClick2, so this goes to the argTypesRegex genereted stub
    cy.get("@argTypesRegex.onClick2").should("be.calledOnceWith", 0);
  },
};
