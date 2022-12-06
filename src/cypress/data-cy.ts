/**
 * @module cypress
 */

type CyOptions = Partial<
  Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow
>;

type DataCyWithSubject = (
  subject: Cypress.JQueryWithSelector<HTMLElement> | HTMLElement | undefined,
  selector: string,
  children?: string | null,
  options?: CyOptions
) => Cypress.Chainable<Cypress.JQueryWithSelector<HTMLElement>>;

type DataCy = DataCyWithSubject & {
  (
    selector: string,
    children?: string | null,
    options?: CyOptions,
    never?: never
  ): Cypress.Chainable<Cypress.JQueryWithSelector<HTMLElement>>;
  commandOptions?: {
    prevSubject: "optional";
  };
};

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
 *
 * Note: this is not added to cypress commands by default. Pass to {@link addCommands}
 * or a custom function this should be added as a cypress command.
 */
export const dataCy: DataCy = (...args: any) => {
  // handle the unlikely scenario someone takes the first signature literally
  if (!args[0] && typeof args[1] !== "string") {
    return cy.wrap(args[1]).dataCy(args[2], args[3], args[4]);
  }
  const [subject, selector, children, options] =
    args as Parameters<DataCyWithSubject>;
  return subject
    ? cy.wrap(subject).within(() => cy.dataCy(selector, children, options))
    : cy.get(
        `[data-cy="${selector}"]${children ? ` ${children}` : ""}`,
        options
      );
};
// unnecessary IIFE, just avoiding typedoc thinking this is a namespace
(() => {
  dataCy.commandOptions = {
    prevSubject: "optional",
  };
})();
