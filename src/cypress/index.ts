/**
 * General utils for cypress including clean methods of adding commands and tasks
 *
 * @module
 */
export * from "./add";
export * from "./data-cy";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      mount(el: JSX.Element): null;
    }
  }
}
