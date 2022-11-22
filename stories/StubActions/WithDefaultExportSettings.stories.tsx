import type Sinon from "cypress/types/sinon";
import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { ClickCount } from "../Button";

// With both of these, you'd probably just be passing in normal functions,
// but here we're spying for the sake of meta-test assertions.
const hasCypress = Boolean((global as any).Cypress);
const onClickSpy = hasCypress ? Cypress.sinon.spy(() => 1) : () => 1;
const onClickSpy2 = hasCypress ? Cypress.sinon.spy(() => 1) : () => 1;

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
    // and if it would have come from argtypes regex as well, then
    cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);

    cy.dataCy("count").should("contain", 1);
  },
};
// story-code @include-start

export const SpyOnArgsWhichAreAlreadyProvided: ComponentStoryObjCy<
  typeof ClickCount
> = {
  args: {
    onClick: onClickSpy,
  },
  cy: () => {
    (onClickSpy as Sinon.SinonSpy).resetHistory();
    cy.dataCy("button")
      .click()
      // So the spy itself is already called (you'd probably just provide a normal function)
      .then(() => expect(onClickSpy).to.be.calledOnceWith(0));
    // And then the important thing: actions object wraps that provided function in a spy
    cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
    // still aliased as the argtype name as well and not from regex
    cy.get("@myClickStub").should("be.calledOnceWith", 0);
    cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
  },
};

export const SpyOnProvided: ComponentStoryCy<typeof ClickCount> = (args) => (
  <ClickCount {...args} />
);
SpyOnProvided.args = {
  onClick: onClickSpy,
};
SpyOnProvided.cy = () => {
  (onClickSpy as Sinon.SinonSpy).resetHistory();
  cy.dataCy("button")
    .click()
    .then(() => expect(onClickSpy).to.be.calledOnceWith(0));
  cy.get("@actions").its("onClick").should("be.calledOnceWith", 0);
  cy.get("@myClickStub").should("be.calledOnceWith", 0);
  cy.get("@argTypesRegex.onClick").should("be.calledOnceWith", 0);
};
// story-code @end SpyOnProvided

export const SpyOnArgsWhichAreProvidedInDefaultExport: ComponentStoryObjCy<
  typeof ClickCount
> = {
  cy: () => {
    (onClickSpy2 as Sinon.SinonSpy).resetHistory();
    cy.dataCy("button-2")
      .click()
      .then(() => expect(onClickSpy2).to.be.calledOnceWith(0));
    cy.get("@actions").its("onClick2").should("be.calledOnceWith", 0);
    // No argTypes provided for onClick2, so this goes to the argTypesRegex generated stub
    cy.get("@argTypesRegex.onClick2").should("be.calledOnceWith", 0);
  },
};
