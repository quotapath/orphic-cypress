# Cypress Storybook Component Tests

A set of utilities, typescript transformers, and general examples on how to cover storybook stories with cypress component tests.

## Features

* An automatic cypress component test executor for storybook stories to test that stories render without any additional files or changes
* [A series of file syntaxes](#additional-syntaxes) to support `.play` like functionality inside of story files for extremely terse testing
* [Automatic action stubs and spies](#stubbing-actions) with first level cypress support
* [A typescript transform](#isolated-component-files-transformer) that turns your `stories.tsx` files into cypress executable files with just a bit of black magic, making for pleasent headed cypress runs and better debuggability
* Tools for turning [storybook addon mock api calls into cypress intercepts](#intercepting-api-requests)
* [A comprehensive set of examples](https://quotapath.github.io/cypress-storybook-component-tests/storybook/) for using cypress to test storybook with or without tools given here, including some surprising finds [like how to use composeStories with mdx files](https://quotapath.github.io/cypress-storybook-component-tests/storybook/?path=/docs/mdx-file-with-external-tests)

See extended module documentation in [github pages](https://quotapath.github.io/cypress-storybook-component-tests/) and numerous examples at a [hosted storybook](https://quotapath.github.io/cypress-storybook-component-tests/storybook/)

<br/>

# What this is

We love storybook and component driven development, but we also love cypress!

We were initially excited about [storybook's interaction testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing). We even wrote some tests and committed to this as the direction forward, translating over our early enzyme tests.

Ultimately though, we found that the bringing in net-new technologies like jest and testing-library would be too much cognitive overhead and dissonance alongside our end-to-end tests already written using cypress, and our unit tests already using the mocha/chai/sinon stack.

So, we set out to come up with a standard for executing storybook tests in cypress with just the right balance of spooky magic that we have minimal boilerplate, encourage writing tests early and often, and cover stories which don't have explicit tests. Although it's with a heavy heart that we leave behind some of the benefits of storybook's solution, we're thrilled to have test coverage that fits with our existing paradigms. And cypress component testing is really slick.

We also export a few helpers that we find useful for things like creating commands and tasks in typescript.

<br/>

# Using this package

As is, you could set up cypress component testing following [their guide](https://docs.cypress.io/guides/component-testing/quickstart-react#Configuring-Component-Testing) and write tests like this without any need for the code in this package.

```ts
import { composeStories } from "@storybook/testing-react";
import React from "react";

import * as stories from "./index.stories";

const { CompWithLabel } = composeStories(stories);

describe("SomeComponent", () => {
  it("should render ok", () => {
    cy.mount(<CompWithLabel />);
  });

  it("should show the provided label", () => {
    cy.mount(<CompWithLabel />);
    cy.get(".typography").should("be.visible").and("contain", "test");
  });
});
```

But, that could conceivably be seen as a lot of boilerplate, especially when compared to the `play` syntax of storybook's interactive tests. You'd have to drop something like this into every directory containing a storybook story and perform the `should render ok` test to make sure your stories aren't breaking. And we haven't even gotten into things like stubbing actions or mocking API calls which would be duplicative of storybook setup.

Instead we could write some simple utilities so that we can keep the files in the `*.stories.tsx`:
```ts
const CompWithLabel = () => <Something label="test" />; // was already here
CompWithLabel.cy = () =>
  cy.get(".typography").should("be.visible").and("contain", "test");
```

<br/>

# Additional Syntaxes

There are 3 available syntaxes for in-file use.

1) 'function' syntax, already shown above is the most succinct
    ```ts
    CompWithLabel.cy = () =>
      cy.get(".typography").should("be.visible").and("contain", "test");
    ```
1) 'object' syntax allows you to tag the test with a description of the expectation and to write multiple tests for the same component
    ```ts
    CompWithLabel.cy = {
      "should contain the 'test' label": () =>
        cy.get(".typography").should("be.visible").and("contain", "test"),

      "should show an expanded label when clicked": () => {
        cy.get(".typography").click();
        cy.get(".expanded-label").should("be.visible").and("contain", "more details here");
      },
    };
    ```
    Each of these is executed in it's own isolated `it` function.
1) 'cyTest' syntax allows the most control but backs off of some of the automatic setup that takes place
    ```ts
    CompWithLabel.cyTest = (Story) => {
      it("should contain the 'test' label", () => {
        cy.mount(<Story />);
        cy.get(".typography").should("be.visible").and("contain", "test");
      });

      it("should show an expanded label when clicked", () => {
        cy.mount(<Story additionalArgs="more details" />);
        cy.get(".typography").click();
        cy.get(".expanded-label").should("be.visible").and("contain", "more details here");
      });
    };
    ```
    This executes within it's own `describe` block and is useful for providing component props or setup not included in stories, or for writing `before`, `beforeEach`, etc hooks.

You can opt out of allowing any or all of these syntaxes via cypress configuration. See [config module documentation](https://quotapath.github.io/cypress-storybook-component-tests/types/config.CyTestConfig.html) for more details and [storybook](https://quotapath.github.io/cypress-storybook-component-tests/storybook/?path=/docs/file-formats) for comprehensive examples.

<br/>

# Stubbing Actions

By default, `composeStories` will not stub your actions. This package introduces `stubStoryActions` to do this automatically when running in the cypress test mode. See [its documentation](md-docs/modules/actions.md#stubstoryactions) for manual use.

TODO: screenshots including the stub

<br/>

# Isolated Component Files Transformer

TODO

<br/>

# Intercepting API Requests

TODO

<br/>

# A General Overview of the Landscape

## What are component tests?

Component tests are near to unit tests in that they are low-level tests that cover small units of logic, but they also cover React (or other) components specifically and so have some concept of rendering that component in isolation to test against. This is highly preferable to end-to-end testing in that you can test in isolation from the rest of an application without a large amount of setup or database seeding, which means these tests will execute much faster. A lot has been said about component tests, so I won't go into too much detail on what they are or their value, but here's some further reading: 
* [Cypress: Writing Your First Component Test](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test)
* [React: Testing Overview](https://reactjs.org/docs/testing.html)
* [Storybook: Interaction Testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing)

Lets take a simple example: we have a component that shows some copy if the user is not permissioned, but shows some copy and does a bit of logic if they do have access. Here's some pseudo-code of what you'd expect to see as tests:

```ts
it("should show copy for a user without permissions", () => {
  const element = render(<OurComponent>);
  expect(element.text).to.equal("No soup for you!");
});

it("should show details for a user ", () => {
  const element = render(<OurComponent isPermissioned={true} flagCount={4}>);
  expect(element.text).to.equal("You have four flagged items you need to address");
  expect(numToWord).to.be.calledOnce.with(4);
});
```

Storybook stories make fantastic jumping off points for testing because they're fundamentally designed to illustrate common use cases and already perform a majority of the work that'd need to be done to setup for that component in terms of component state and mocking API or function calls.

---

### Nice-to-haves for component tests
* They execute quickly
* They're as easy as possible to set up with minimal boilerplate
* Optional headed execution so that you can visually see whats happening and debug in a real browser
* When executing headlessly in CI for instance, screenshots on errors make for similarly easy debugging as local headed execution

---

### Comparison of Existing Solutions
#### Storybook interactive tests
This is the standard that we're working against here. They'll look like this when using the story function syntax

```ts
SomeStory.play = async ({ canvasElement }) => {
  const canvas = within(canvasElement);
  expect(canvas.getByTestId("Attainment")).toBeVisible();
  // Should not see earnings
  expect(canvas.queryByTestId("Earnings")).toEqual(null);
  // Should not see more menu
  expect(canvas.queryByTestId("moreMenu-team")).toEqual(null);
};
```

* Pros:
  * They’re built into storybook so you get to show interactive stories right there
  * We’ve already written some. Pretty smooth experience
  * `actions` are automatically supplied and are stubs for easy testing
* Cons:
  * It requires new knowledge. Jest and testing-library instead of cypress and chai, alongside some specifics to storybook execution
  * It’s a true pain to set up in CI. They have their own test runner in playwrite, but I couldn’t get it working with a quick pass in circleci. I built a custom cypress executor, but that broke when we moved to nginx.

---

#### Cypress execution of builtin interactive tests by visiting the story's url or iframe
TODO

---

#### Cypress component tests directly without storybook
They look like this (example pulled from cypress docs):

```ts
import { Stepper } from "./";

it('stepper should default to 0', () => {
  cy.mount(<Stepper />)
  cy.get(counterSelector).should('have.text', '0')
})
```

* Pros:
  * We already all know cypress and its tooling
  * It's slick
* Cons:
  * distinct from storybook (though see below) and so we lose that interconnectedness
  * still technically in beta, though its pretty sophisticated and clear they’re following through with it

---

#### Cypress component tests using storybook components. **What this project does**

These could be written in the storybook file with some type updates, or alongside in a new file. See [Using this package](README.md#using-this-package) above for an example of what this'll look like.

* Pros:
  * We already know and love cypress
  * Uses stories as test cases, which reduces duplication and increases usefulness/documentative natures of both test and story
* Cons:
  * Still wont appear in storybook so you’d still have to pull up a separate process to see the interactive story/test
  * currently only works with typescript or javascript story files, not mdx

---

#### Mocha or other headless execution of storybook interactive tests:

TODO: Add in a realistic example

```ts
```

Use composeStories from above and then execute the .play

* Pros:
  * back to tests being visible in storybook through interaction testing addon
  * simpler headless CI execution than storybook's playwrite executor
* Cons:
  * only works with .tsx, not .mdx
  * we’d have to build out some infrastructure to support automatic discovery and execution
  * headless, so won’t get screens of component on error, but could still interact in storybook
  * back to having to know jest + testing-library