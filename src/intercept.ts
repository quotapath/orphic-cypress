import { Method } from "cypress/types/net-stubbing";

/**
 * Turn mockData intended for storybook plugin storybook-addon-mock
 * into cypress intercepts. Very likely to be used in a beforeEach.
 * Aliases as the url provided for each mock. Nothing crazy happening
 * here, you could just write `cy.intercept`s for non-storybook component
 * tests, or nbd to have ones that are redundant of mockData
 */
export const mockToCyIntercept = (
  mockData: Array<{
    url: string;
    method: string;
    status: number;
    response: unknown;
  }>
) =>
  mockData.forEach(({ response, status, url, method }) => {
    cy.intercept(method as Method, url, {
      body: response,
      statusCode: status,
    }).as(url);
  });
