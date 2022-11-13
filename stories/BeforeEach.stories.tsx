import React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "./Button";

export default {
  component: Button,
  cy: () => {
    beforeEach(() => {
      // just something simple to prove this happens at top
      cy.wrap("Wrapped label").as("wrappedLabel");
    });
  },
};

// These are more repetitive than necessary, real story scenarios would use a 'render'
// prop to the default export, use object syntax throughout, build a template, etc.

export const Wrapped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Wrapped label" />
);

Wrapped.cy = () => {
  cy.get("@wrappedLabel").then((wrappedLabel) =>
    cy.dataCy("button").should("contain", wrappedLabel)
  );
  cy.wrap("This will be reset").as("wrappedLabel");
};

Wrapped.parameters = {
  docs: {
    description: {
      story: `
You can use default export's \`cy\` property to do things like execute
hooks such as \`beforeEach\` to establish test state.`,
    },
    source: {
      code: `
export default {
  component: Button,
  cy: () => {
    beforeEach(() => {
      // just something simple to prove this happens at top
      cy.wrap("Wrapped label").as("wrappedLabel");
    });
  },
};

export const Wrapped: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} label="Wrapped label" />
);

Wrapped.cy = () => {
  cy.get("@wrappedLabel").then((wrappedLabel) =>
    cy.dataCy("button").should("contain", wrappedLabel)
  );
  cy.wrap("This will be reset").as("wrappedLabel");
};`,
    },
  },
};

export const WrappedCyTest: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} />
);

WrappedCyTest.cyTest = (Story) => {
  beforeEach(() => {
    cy.wrap("Before Wrapped label").as("beforeWrappedLabel");
  });

  it("should get label arg from default export beforeEach setup", function () {
    // function keyword + this instead of .get("@alias") just to show variant
    cy.mount(<Story label={this.wrappedLabel} />);
    cy.dataCy("button").should("contain", this.wrappedLabel);
  });

  it("should get label arg from beforeEach in local cyTest", function () {
    cy.mount(<Story label={this.beforeWrappedLabel} />);
    cy.dataCy("button").should("contain", this.beforeWrappedLabel);
  });
};

WrappedCyTest.parameters = {
  docs: {
    description: {
      story: `
The .cyTest format can contain hooks like beforeEach directly inside its function body,
which is the only way to have such hooks execute for only specific story tests.
`,
    },
    source: {
      code: `
export const WrappedCyTest: ComponentStoryCy<typeof Button> = (args) => (
  <Button {...args} />
);
WrappedCyTest.cyTest = (Story) => {
  beforeEach(() => {
    cy.wrap("Before Wrapped label").as("beforeWrappedLabel");
  });

  it("should get label arg from default export beforeEach setup", function () {
    // function keyword + this instead of .get("@alias") just to show variant
    cy.mount(<Story label={this.wrappedLabel} />);
    cy.dataCy("button").should("contain", this.wrappedLabel);
  });

  it("should get label arg from beforeEach in local cyTest", function () {
    cy.mount(<Story label={this.beforeWrappedLabel} />);
    cy.dataCy("button").should("contain", this.beforeWrappedLabel);
  });
};`,
    },
  },
};