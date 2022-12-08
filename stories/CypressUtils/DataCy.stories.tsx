import * as React from "react";
import type { ComponentStoryCy } from "orphic-cypress";
import { ClickCount } from "stories";
import dedent from "ts-dedent";

export default {
  component: ClickCount,
};

export const DataCy: ComponentStoryCy<typeof ClickCount> = (args) => (
  <ClickCount {...args} />
);
DataCy.cy = () => {
  cy.dataCy("count").should("contain", 0);
  // nesting data-cy
  cy.dataCy("click-container").dataCy("count").should("contain", 0);
  cy.get("[data-cy=click-container]").dataCy("count").should("contain", 0);
  // children accessors, don't have to be data-cy
  cy.dataCy("click-container", "[data-cy=count]").should("contain", 0);
  // arbitrarily trying the unlikely approach to dataCy
  cy.dataCy("click-container").then(($clickContainer) =>
    cy.dataCy($clickContainer, "count").should("contain", 0)
  );
};

DataCy.parameters = {
  cyUnitTest: true,
  docs: {
    description: {
      story: dedent`
        \`dataCy\` is used to access components by their data-cy designation'.
        This file is mostly just for test purposes.
        See [module docs](https://quotapath.github.io/orphic-cypress/orphic-cypress/docs/functions/cypress.dataCy-1.html)
        for more detail 
      `,
    },
  },
};
