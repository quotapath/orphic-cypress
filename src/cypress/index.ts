/**
 * General utils for cypress including clean methods of adding commands and tasks
 *
 * @module
 */
export * from "./add";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Cypress {
    interface Chainable {
      mount(el: JSX.Element): null;
    }
  }
}
