/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

type CyOptions = Partial<
  Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow
>;

/**
 * Select an html element by its data-cy attribute.
 *
 * ```ts
 * cy.dataCy('something').click() // -> cy.get("[data-cy='something']").click()
 * ```
 *
 * Accepts children which will then become further selectors
 *
 * ```ts
 * cy.dataCy('something', '.nested').click()
 * // -> cy.get("[data-cy='something'] .nested").click()
 * ```
 *
 * And is chainable such that it will use the previous element as its scope
 *
 * ```ts
 * cy.dataCy('something').dataCy("other").click()
 * // -> cy.get("[data-cy='something']").within(() => cy.get("[data-cy='other']").click())
 * cy.get('.top').dataCy('something') // same idea as above
 * ```
 *
 * Finally, it supports taking the first signature literally and passing in
 * a subject directly. That's very likely an unnecessary step and convention/obvious errors
 * would prevent it, but going for complete here
 *
 * ```ts
 * cy.get(".first-selector").then(($first) =>
 *   cy.dataCy($first, "second-selector").should("contain", 0)
 * );
 * ```
 */
export function dataCy(
  subject: Cypress.JQueryWithSelector<HTMLElement> | HTMLElement | undefined,
  selector: string,
  children?: string | null,
  options?: CyOptions
): Cypress.Chainable<Cypress.JQueryWithSelector<HTMLElement>>;
export function dataCy(
  selector: string,
  children?: string | null,
  options?: CyOptions,
  never?: never
): Cypress.Chainable<Cypress.JQueryWithSelector<HTMLElement>>;
export function dataCy(...args: any) {
  // handle the unlikely scenario someone takes the first signature literally
  if (!args[0] && typeof args[1] !== "string") {
    return cy.wrap(args[1]).dataCy(args[2], args[3], args[4]);
  }
  const [subject, selector, children, options] = args as [
    HTMLElement | undefined,
    string,
    string | null | undefined,
    CyOptions | undefined
  ];
  return subject
    ? cy.wrap(subject).within(() => cy.dataCy(selector, children, options))
    : cy.get(
        `[data-cy="${selector}"]${children ? ` ${children}` : ""}`,
        options
      );
}
dataCy.commandOptions = { prevSubject: "optional" };
