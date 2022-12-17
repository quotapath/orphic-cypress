<div align="center">
  <img
    src="https://user-images.githubusercontent.com/9889378/203303857-c5e4682d-afda-4956-bd3b-d54630a7041c.jpeg"
    alt="Van Gogh's Painting of 'Road with Cypress and Star'"
    width="400px"
  />
</div>

# Orphic Cypress

[![Storybook](https://raw.githubusercontent.com/storybookjs/brand/main/badge/badge-storybook.svg)](https://quotapath.github.io/orphic-cypress/storybook/) <a href="https://quotapath.github.io/orphic-cypress/"><img height="20" src="https://user-images.githubusercontent.com/9889378/203390045-ba98e185-2701-42d7-9c26-a9dae3446ece.png" /></a> [![CI](https://github.com/quotapath/orphic-cypress/actions/workflows/ci.yml/badge.svg)](https://github.com/quotapath/orphic-cypress/actions/workflows/ci.yml) [![test coverage](https://quotapath.github.io/orphic-cypress/test-coverage.svg)](https://quotapath.github.io/orphic-cypress/lcov-report) [![npm version](https://badge.fury.io/js/orphic-cypress.svg)](https://www.npmjs.com/package/orphic-cypress)

A set of utilities, typescript transformers, and general examples on how to cover storybook stories with cypress component tests.
In short, this is a little overengineering, a little black magic, and a lot of documentation on making these kinds of tests as easy and concise as possible.

## Features

- [A comprehensive set of examples](https://quotapath.github.io/orphic-cypress/storybook/) for using cypress to test storybook with or without tools given here, including some surprising finds [like how to use composeStories with mdx files](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/mdx-file-with-external-tests)
- An automatic cypress component test executor for plain old storybook stories, written in typescript or mdx
- [A series of file syntaxes](#additional-syntaxes) to support `.play` like functionality in story files
- [Automatic action stubs and spies](#stubbing-actions) with first level cypress support
- [A typescript transform](#isolated-component-files-transformer) that turns your `stories.tsx` files into cypress test files with just a bit of black magic
- Tools for turning [storybook addon mock api calls into cypress intercepts](#intercepting-api-requests)
- General storybook doc utils for building [snippets from storysource](https://quotapath.github.io/orphic-cypress/functions/storybook_story_code.transformSource.html) or to [segment an mdx file](https://quotapath.github.io/orphic-cypress/functions/storybook_segment_mdx.segmentMdx.html) to use in multiple doc locations.
- When taken to the extreme, this is a mechanism for [literate testing!](#literate-testing)

See extended module documentation in [github pages](https://quotapath.github.io/orphic-cypress/) and numerous examples at a [hosted storybook](https://quotapath.github.io/orphic-cypress/storybook/)

<br/>

# What this is

We love storybook and component driven development, but we also love cypress!

We were initially excited about [storybook's interaction testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing). We even wrote some tests and committed to it as the right direction to translating over our early enzyme tests.

Ultimately though, we found that bringing in net-new technologies like jest and testing-library was too much cognitive overhead and code dissonance alongside our existing end-to-end tests in cypress and unit tests in the mocha/chai/sinon stack.

So, we set out to come up with a standard for executing storybook tests in cypress with just the right balance of spooky magic. We wanted minimal boilerplate to encourage writing tests early and often, and to cover stories which don't have explicit tests to prevent stories going stale and breaking. Although it's with a heavy heart that we leave behind some of the benefits of storybook's solution, we're thrilled to have test coverage that fits with our existing paradigms. And cypress component testing is really slick.

<br/>

# Using this package

As is, you could set up cypress component testing following [their guide](https://docs.cypress.io/guides/component-testing/quickstart-react#Configuring-Component-Testing) and write tests like this without any need for the code in this package.

```tsx
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

But, that could conceivably be seen as a lot of boilerplate, especially when compared to the `play` syntax of storybook's interactive tests. You'd have to drop something like this into every directory containing a storybook story and perform the `should render ok` test to make sure your stories aren't breaking. And we haven't even gotten into things like stubbing actions or mocking API calls, which would be duplicative of storybook setup.

Instead we could write some simple utilities so that we can keep the files in the `*.stories.tsx`:

```tsx
const CompWithLabel = () => <Something label="test" />; // this story was already here
CompWithLabel.cy = () =>
  cy.get(".typography").should("be.visible").and("contain", "test");
```

<br/>

# Additional Syntaxes

There are 3 available syntaxes for in-file use. See [storybook](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/fileformats-storybookfiles) for comprehensive examples.

## `function` syntax

already shown above is the most succinct

```ts
CompWithLabel.cy = () =>
  cy.get(".typography").should("be.visible").and("contain", "test");
```

## `object` syntax

allows you to tag the test with a description of the expectation and to write multiple tests for the same component

```ts
CompWithLabel.cy = {
  "should contain the 'test' label": () =>
    cy.get(".typography").should("be.visible").and("contain", "test"),

  "should show an expanded label when clicked": () => {
    cy.get(".typography").click();
    cy.get(".expanded-label")
      .should("be.visible")
      .and("contain", "more details here");
  },
};
```

Each of these is executed in it's own isolated `it` function.

## `cyTest` syntax

allows the most control but backs off of some of the automatic setup that takes place

```tsx
CompWithLabel.cyTest = (Story) => {
  it("should contain the 'test' label", () => {
    cy.mount(<Story />);
    cy.get(".typography").should("be.visible").and("contain", "test");
  });

  it("should show an expanded label when clicked", () => {
    cy.mount(<Story additionalArgs="more details" />);
    cy.get(".typography").click();
    cy.get(".expanded-label")
      .should("be.visible")
      .and("contain", "more details here");
  });
};
```

This executes within it's own `describe` block and is useful for providing component props or setup not included in stories, or for writing `before`, `beforeEach`, etc hooks.

All of these properties could also be added to the story's `parameters`. That might be more canonical but is often messier and less-well-typed. In mdx files, they _must_
be parameters:

```tsx
<Story
  name="StoryFunctionWithCyFunction"
  parameters={{
    cy: () => cy.dataCy("button").should("contain", "Story function"),
  }}
>
  {(args) => <Button {...args} label="Story function" />}
</Story>
```

See more mdx examples in storybook [here and in surrounding stories](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/mdx-mdxautomatictestfileformats-storybookfiles--story-function-with-cy-function)

## Opting out

You can opt out of allowing any or all of these syntaxes via cypress configuration. See [config module documentation](https://quotapath.github.io/orphic-cypress/types/config.CyTestConfig.html) for more details.

<br/>

# Stubbing Actions

By default, `composeStories` will not stub your actions. This package introduces `stubStoryActions` to do this automatically when running in the cypress test mode. See [its documentation](md-docs/modules/actions.md#stubstoryactions) for manual use.

See [storybook](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/stubactions) for example uses with various file types and configurations, and [module docs](https://quotapath.github.io/orphic-cypress/functions/actions.stubStoryActions.html) for more details

Cypress component test stubs are really slick and the test runner provides a great, interactive interface for debugging

https://user-images.githubusercontent.com/9889378/203308863-105eac48-a70a-4c21-a439-dead63ef0aed.mp4

<br/>

# Isolated Component Files Transformer

There are two ways to run these tests: via importing all storybook files by glob and iterating through them in one file, or by using a little bit of black magic in the form of a typescript transformer to enable the storybook typescript and mdx files themselves to act as the cypress tests. This is perhaps best explained with a couple of screenshots.

![required tests](https://user-images.githubusercontent.com/9889378/206868377-27d1b7d9-dd85-477a-bd31-fb6e4a04b6f4.png)
![isolated tests](https://user-images.githubusercontent.com/9889378/206868376-e9b60b72-4883-401d-a34e-a46dba76dd50.png)

The first is the approach via a single file, and the second is via the transformer. The require approach is decently faster despite the actual test execution time being equivalent. That's helped a bit by [experimentSingleTabRunMode](https://docs.cypress.io/guides/references/experiments#Component-Testing), which seems pretty stable, but the transformer version is about half as slow. What the latter gives you though is isolation and debugability. You can `-s` to specify a spec pattern and run just a single test, you can add `.only` or the orphic-cypress equivalent `.cyOnly` and only affect the one file's worth of tests. And most importantly you can pull up a headed run and execute just a single file's tests.

![isolated tests spec screen](https://user-images.githubusercontent.com/9889378/206868853-ae2c148d-6088-4c3c-9857-3e610869a3af.png)
![isolated tests single run](https://user-images.githubusercontent.com/9889378/206868833-0bfb4914-56d3-41aa-beee-bd8dc83dcd41.png)

The files are the tests, which is exactly the mental model cypress uses. The way that works is by taking a file like this

```tsx
import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
import { Comp } from "components/Comp";
import * as React from "react";
export default {
  component: Comp,
  title: "Component",
};
export const StoryFn: ComponentStory<typeof Comp> = (args) => (
  <Comp {...args} />
);
export const StoryObj: ComponentStoryObj<typeof Comp> = {
  args: { label: "test" },
};
```

and during the typescript compilation process, add a line at the top and bottom:

```ts
import { executeCyTests } from "orphic-cypress";
// whole rest of file...
executeCyTests({
  default: { component: Comp, title: "Component" },
  StoryFn,
  StoryObj,
});
```

You can read about how to add it to webpack [here](https://quotapath.github.io/orphic-cypress/functions/transformers.transformIsolatedComponentFiles-1.html), it should also work with other mechanisms of involving transformers in the typescript process.

The require version uses that same [executeCyTests](https://quotapath.github.io/orphic-cypress/functions/execute.executeCyTests.html), though it has to loop through files and execute in one describe block, just a bit truncated

```ts
describe(description, () => {
  Cypress.env("storybookFiles").forEach((file: string) => {
    const stories = requireFileCallback(file);
    executeCyTests(stories, stories.default.title || file);
  });
});
```

## Finally, how to actually run the thing

This repo sets up and runs both require and isolated tests, and contains commands for headed versions of both. It's hopefully a good reference besides the docs. Look to [the cypress config file](https://github.com/quotapath/orphic-cypress/blob/main/cypress.config.ts), the [package.json scripts](https://github.com/quotapath/orphic-cypress/blob/main/package.json#L7) and the [mount test](https://github.com/quotapath/orphic-cypress/blob/main/stories/mount.cy.ts).

### Isolated Files

To run isolated tests, you won't need much config: just get the transformer in place and then run with `CYPRESS_USE_ISOLATED_CT_FILES=true` environment variable set. Details on that transformer webpack config are again [here](https://quotapath.github.io/orphic-cypress/functions/transformers.transformIsolatedComponentFiles-1.html), but I'll copy in a snippet from orphic-cypress' [webpack config](https://github.com/quotapath/orphic-cypress/blob/main/webpack.config.ts) for overkill

```ts
import {
  transformIsolatedComponentFiles,
  useIsolatedComponentFiles,
} from "orphic-cypress";

module.exports = {
  // ...
  module: {
    // hide warnings for 'Critical dependency: require function is used in a way
    // in which dependencies cannot be statically extracted', at least in packages
    exprContextCritical: false,
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
            options: {
              happyPackMode: true,
              transpileOnly: true,
              ...(useIsolatedComponentFiles && {
                getCustomTransformers: () => ({
                  before: [transformIsolatedComponentFiles()],
                }),
              }),
            },
          },
        ],
      },
    ],
  },
};
```

`useIsolatedComponentFiles` is just the boolean from `CYPRESS_USE_ISOLATED_CT_FILES` env var and it can be used elsewhere for convenience.

### Require Files

The `require` version takes more configuration. You'll need to set storybook files in the cypress config file's component test section via [setStoryBookFiles](https://quotapath.github.io/orphic-cypress/functions/mount.setStorybookFiles.html)

```ts
export default defineConfig({
  component: {
    setupNodeEvents: (on, config) => {
      setStorybookFiles(on, config);
      return config;
    },
  },
});
```

Then call [mountTest]() in a `Something.cy.tsx` named file, passing it a [requireFileCallback](https://quotapath.github.io/orphic-cypress/types/mount.RequireFileCallback.html) which necessarily has to have a bit of manual input to get webpack to import correctly. This is copied from the `requireFileCallback` link above, but for our real world case, that looked like

```ts
// in mount.cy.tsx
import { mountTest } from "orphic-cypress";

const requireFileCallback: RequireFileCallback = (fullFilePath: string) => {
  const replaced = fullFilePath
    .replace("src/app/", "")
    .replace("src/common/", "");
  // We have to give webpack a little bit to hook onto, so we remove
  // the module entrypoint and include that directly as a string to `require`
  if (fullFilePath.startsWith("src/app")) {
    return require("app/" + replaced);
  }
  if (fullFilePath.startsWith("src/common")) {
    return require("common/" + replaced);
  }
  return;
};

mountTest(
  [], // files to skip altogether
  requireFileCallback
);
```

In orphic-cypress' tests, it just looks like [this](https://github.com/quotapath/orphic-cypress/blob/main/stories/mount.cy.ts)

```ts
mountTest([], (fullFilePath) =>
  require("stories/" + fullFilePath.replace("stories/", ""))
);
```

### Switching back and forth

You might run into cases with webpack cache where the stories are still instrumented with ts magic even though you wanted to run the require version, which will result in duplicating those tests. If you see that come up, run `rm -rf node_modules/.cache`

<br/>

# Intercepting API Requests

Mocking requests can be done in essentially the same way as any cypress test, via `cy.intercept`, but having some utils at hand is always nice.

We've used [storybook-addon-mock](https://github.com/nutboltu/storybook-addon-mock/) for our own storybook. Although tempted by mock service workers, storybook-addon-mock was dead simple to set up and worked out of the box. It also offers a nice and clean `mockData` story parameter which we can hook off of. So orphic-cypress exports [mockToCyIntercept](https://quotapath.github.io/orphic-cypress/functions/intercept.mockToCyIntercept.html) which transforms the specified mock objects to intercepts. That's called on `executeCyTests` and so is automatically invoked on either isolated or non-isolated test runs, but must be manually called for external files.

See [storybook files](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/mockrequests-overview--page) for example uses.

![intercept api requests in cypress](https://user-images.githubusercontent.com/9889378/204159804-a2df1b09-7efe-4a93-8f57-a631f53401ac.png)

<br/>

# Literate Testing

MDX is a phenomenal format for literate programming and once we had loading of MDX files down, it becomes a fantastic means of literate testing. Then I realized there was no reason in particular that we could only test components, why not units?

Already we had this at hand

```mdx
1 + 1 should equal 2, obviously

<Story
  name="SimpleMath"
  parameters={{
    cy: () => expect(1 + 1).to.equal(2),
  }}
>
  <></>
</Story>
```

Awesome, we can document our javascript logic in storybook with ample markdown and confirm accuracy in cypress. But, with above, nothing shows up in the cypress panel and the test code itself doesn't appear in storybook. So I made a quick [UnitTest](https://quotapath.github.io/orphic-cypress/functions/storybook_UnitTest.UnitTest.html) component and [decorator](https://quotapath.github.io/orphic-cypress/functions/storybook_UnitTest.unitTestDecorator.html). Update to

```diff
- <></>
+ <UnitTest name="SimpleMath" />
```

and now you'll get the tests to render (with the caveat that its compiled code so you'd have to opt out of minimization, see [storybook main](./.storybook/main.ts#L27).

![literate testing in storybook](https://user-images.githubusercontent.com/9889378/206355127-ed6cfdf8-8021-4949-8769-f9f2080a3d06.png)

In storybook, that looks like this, where the top of the file is markdown and the first test display starts at the 'Arbitrary Task' header. [See it live here](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/cypressutils-tasks-and-literate-testing--arbitrary-task).

And then in cypress, and in the 'canvas' view, we get this

![literate testing in cypress](https://user-images.githubusercontent.com/9889378/206355138-ef45d0db-bd92-47b4-9ed6-e2a626c5a2d6.png)

I'm psyched. But did I stop there, nope. The fact that the code is compiled is a little lame. We have the mdx in a reasonable format, so we can do some slightly hacky things and support using code blocks! With this code (swap out `"` for triple backticks)

```
<Story name="CyCodeBlock" parameters={{ cyCodeBlock: true }}>
  <></>
</Story>

"ts CyCodeBlock
/**
  * should work as a code block where this first comment is an optional
  * description; it can be any kind of js comment as long as it's the first
  * thing in the block
  */
const expected: number = 2;

cy.arbitraryTask(2).then(($num) => {
  expect($num).to.equal(expected);
});
"
```

we get this in storybook in the first image and cypress in the second

![code block in storybook](https://user-images.githubusercontent.com/9889378/206865846-9715783f-5e1f-4d05-aaab-053023360145.png)
![code block in cypress](https://user-images.githubusercontent.com/9889378/206865829-66fffb3a-25f6-439d-aafe-f79b7dc5912b.png)

Just link the block by story name and drop in an optional comment to become the `it` test description. Code blocks are great because they can be linted and formatted via prettier/eslint, maybe even type checked.

Note: this is not something we've tried out yet, could be/probably is totally off the rails.

<br/>

# Test Coverage

This turned out to be fairly simple. To instrument the code, I added `'istanbul'` to the babel plugins, and added a [.nycrc.json](https://github.com/quotapath/orphic-cypress/blob/main/.nycrc.json) config file. Then for cypress to gather coverage, I added a fork of cypress's coverage lib [@bahmutov/cypress-code-coverage](https://github.com/bahmutov/cypress-code-coverage), following [this well written blog post](https://glebbahmutov.com/blog/component-code-coverage/), and that was that. Instead of opting for codecov or something, I wrote a [quick python script](https://github.com/quotapath/orphic-cypress/blob/main/.github/scripts/get_coverage_url.py) which grabs the line coverage percentage and makes an svg via [img.shields.io](https://img.shields.io/badge/). Coverage for the isolated and required variants of the test runs are merged, though not for any particular reason besides curiousity. Finally the badge and the lcov gets thrown into the `docs` dir for github pages publishing, the whole process taking place within github actions.

# Contributing to this orphic-cypress

Do it! That'd be great. I could probably expand this a bit, but generally everything is available via npm scripts: `npm run test` runs mount/require version and `npm run test:isolated` runs isolated version, then `npm run test:headed` and `npm run test:isolated:headed` are the headed browser versions. All of those test the storybook stories located at `./stories`, as well as unit tests. `npm run storybook` will bring up that storybook environment.

# A General Overview of the Landscape

## What are component tests?

Component tests are near to unit tests in that they are low-level tests that cover small units of logic, but they also cover React (or other) components specifically and so have some concept of rendering that component in isolation to test against. This is highly preferable to end-to-end testing in that you can test in isolation from the rest of an application without a large amount of setup or database seeding, which means these tests will execute much faster. A lot has been said about component tests, so I won't go into too much detail on what they are or their value, but here's some further reading:

- [Cypress: Writing Your First Component Test](https://docs.cypress.io/guides/component-testing/writing-your-first-component-test)
- [React: Testing Overview](https://reactjs.org/docs/testing.html)
- [Storybook: Interaction Testing](https://storybook.js.org/docs/react/writing-tests/interaction-testing)

Lets take a simple example: we have a component that shows some copy if the user is not permissioned, but shows some copy and does a bit of logic if they do have access. Here's some pseudo-code of what you'd expect to see as tests:

```tsx
it("should show copy for a user without permissions", () => {
  const element = render(<OurComponent />);
  expect(element.text).to.equal("No soup for you!");
});

it("should show details for a user ", () => {
  const element = render(<OurComponent isPermissioned={true} flagCount={4} />);
  expect(element.text).to.equal(
    "You have four flagged items you need to address"
  );
  expect(numToWord).to.be.calledOnce.with(4);
});
```

Storybook stories make fantastic jumping off points for testing because they're fundamentally designed to illustrate common use cases and already perform a majority of the work that'd need to be done to setup for that component in terms of component state and mocking API or function calls.

---

### Nice-to-haves for component tests

- They execute quickly
- They're as easy as possible to set up with minimal boilerplate
- Optional headed execution so that you can visually see whats happening and debug in a real browser
- When executing headlessly in CI for instance, screenshots on errors make for similarly easy debugging as local headed execution

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

- Pros:
  - They’re built into storybook so you get to show interactive stories right there
  - We’ve already written some. Pretty smooth experience
  - `actions` are automatically supplied and are stubs for easy testing
- Cons:
  - It requires new knowledge. Jest and testing-library instead of cypress and chai, alongside some specifics to storybook execution
  - It’s a true pain to set up in CI. They have their own test runner in playwrite, but I couldn’t get it working with a quick pass in circleci. I built a custom cypress executor, but that broke when we moved to nginx.

---

#### Cypress execution of builtin interactive tests by visiting the story's url or iframe

This was another path I'd gone down. You can have hit storybook via an e2e cypress configuration and then do some combination of loading the normal page, writing an assertion against the interactive addon panel, going to the iframe and/or hooking into cypress internals all while writing some of the assertions in storybook and some in cypress. It ends up being a bizarre hybrid. Storybook themselves [have an example of this sort](https://storybook.js.org/docs/react/writing-tests/importing-stories-in-tests#example-with-cypress). Rarely if ever is the automatic execution of stories mentioned.

Which is why I kind of liked our approach. A first attempt traversed the sidebar and checked the interactions panel, but a second one got the stories.json output, went to the generic iframe page and hooked into storybook's event emitter to load stories and execute play, like so:

```ts
/**
 * Test that there are no errors in a storybook's iframe, which will throw exceptions
 * for expect assertion failures.
 *
 * Expects to already be on the styleguide page from a previous `cy.visitStyleguide`
 * but will go to a story if needed.
 */
export const testStory = ({ id: storyId }: { id: string }) => {
  // for some reason, error state requires a full revisit
  cy.window().then((win) => {
    // @ts-ignore
    if (win.__test_runner_error) {
      // @ts-ignore
      win.__test_runner_error = false;
      return cy.visitStyleguide(storyId, true);
    }
  });
  cy.get("#root").should("exist");

  // pure documentation pages do not register 'storyRendered' etc events
  if (/--page$/.test(storyId)) return;

  // adapted from storybook's playwright test runner
  // https://github.com/storybookjs/test-runner/blob/next/playwright/custom-environment.js#L110-L124
  cy.window()
    .its("__STORYBOOK_ADDONS_CHANNEL__")
    .then((channel) =>
      new Promise((resolve, reject) => {
        channel.once("storyRendered", resolve);
        channel.once("storyUnchanged", resolve);
        channel.once("storyErrored", ({ description }) =>
          reject(new StorybookTestRunnerError(storyId, description))
        );
        channel.once("storyThrewException", (error: Error) =>
          reject(new StorybookTestRunnerError(storyId, error.message))
        );
        channel.once(
          "storyMissing",
          (id: string) =>
            id === storyId &&
            reject(
              new StorybookTestRunnerError(
                storyId,
                "The story was missing when trying to access it."
              )
            )
        );
        channel.emit("setCurrentStory", { storyId });
      }).catch((e) => {
        cy.window().then((win) => {
          // @ts-ignore
          win.__test_runner_error = true;
          throw e;
        });
      })
    );
};
```

Which, as the code docs say, was inspired by the official storybook playwright runner. Again, very cool, but ulimately, in our opinion, an untenable hybrid with too much cognitive overhead.

---

#### Cypress component tests directly without storybook

They look like this (example pulled from cypress docs):

```tsx
import { Stepper } from "./";

it("stepper should default to 0", () => {
  cy.mount(<Stepper />);
  cy.get(counterSelector).should("have.text", "0");
});
```

- Pros:
  - We already all know cypress and its tooling
  - It's slick
- Cons:
  - distinct from storybook (though see below) and so we lose that interconnectedness
  - still technically in beta, though its pretty sophisticated and clear they’re following through with it

---

#### Cypress component tests using storybook components. **What this project does**

These could be written in the storybook file with some type updates, or alongside in a new file. See [Using this package](#using-this-package) above for an example of what this'll look like.

- Pros:
  - We already know and love cypress
  - Uses stories as test cases, which reduces duplication and increases usefulness/documentative natures of both test and story
- Cons:
  - Still wont appear in storybook so you’d still have to pull up a separate process to see the interactive story/test
  - currently only works with typescript or javascript story files, not mdx

---

#### Jest, or other, headless execution of storybook interactive tests:

You could execute the `.play` property in jest tests directly, and could likely write out an instrumented mocha/chai or whatever framework to support the same kind of execution.

Here's storybook's own example from [testing-react docs](https://storybook.js.org/addons/@storybook/testing-react)

```tsx
const { InputFieldFilled } = composeStories(stories);

test("renders with play function", async () => {
  const { container } = render(<InputFieldFilled />);

  // pass container as canvasElement and play an interaction that fills the input
  await InputFieldFilled.play({ canvasElement: container });

  const input = screen.getByRole("textbox") as HTMLInputElement;
  expect(input.value).toEqual("Hello world!");
});
```

- Pros:
  - back to tests being visible in storybook through interaction testing addon
  - simpler headless CI execution than storybook's playwrite executor
- Cons:
  - only works with .tsx, not .mdx
  - we’d have to build out some infrastructure to support automatic discovery and execution
  - headless, so won’t get screens of component on error, but could still interact in storybook
  - back to having to know jest + testing-library

<br/>

# Whats in a name?

When it comes to javascript naming, we find ourselves in a realm of mythology and powerful symbolism.
From the Greek cannon, we have the likes of Apollo and Ajax, from more recent invented myths we have Falcor, Mithril, and Zod.
The list goes on, and well it should, myths share with programming a deep understanding of the power of language and symbols.
Even in javascript testing we have Sinon, named for the Greek warrior who lied to the Trojans to convince them that the giant wooden horse at their gates was only a gift, and was totally not filled to the brim with his comrades. What a brilliant name for a mocking library.
So you'd think that Cypress would join in on this tradition, the cypress being an ancient tree known throughout human culture. There is a wealth of deep symbolism there. Van Gogh claimed they looked like Egyptian obelisks and painted them with an intense fiery energy literally leaping out of the frame.

But no, if we dig around a bit, we find that [cypress was named because](https://docs.cypress.io/faq/questions/company-faq#Why-the-name-Cypress)

> We believe that tests should always pass -- in other words, should always be green. A cypress is an evergreen tree. So, Cypress!

Lame. So utterly lame. So we're naming this after the [Orphic Tablets](https://repository.brynmawr.edu/cgi/viewcontent.cgi?article=1095&context=classics_pubs) which were found in the tombs of the Greeks which contained instructions on the afterlife, wherein a white cypress stands as a guidepost in that dark underworld. Fitting for tests which execute in a different realm.

> You will find in the halls of Hades a spring on the left, and standing by it, a glowing white cypress tree

It's a literary, _storybook_, name. Why name a repo which is mostly examples? Just for fun.

# Some more ideas

- vite support. I've never used it
  - vitest headless execution of literate testing could bypass `mount` calls
- mdx2 support. tried it, was fairly close
- storybook 7 beta support
- more transforms:
  - add the file name as the storyname due to a common pattern we have of `import { RealCompName } from "./"; /* ... */ export const Default = () => /* single story */; Default.storyName = "RealCompName;` so that it rolls up
  - transforms around the docgen details so that you could dynamically change them before they hit anything in storybook, e.g. add `_Optional_` to optional props b/c the red star isn't obvous enough
- an addon panel? Maybe it could display the results or even snapshots of the last cypress run of that test
- e2e tests for example purposes and to validate docs, with merged coverage. e2e works fine, getting it to properly cover the storybook code wasn't yet
- vue support. Or angular, plain html etc. not sure how much appetite I have for that since our daily driver is react and it'd probably be an undertaking, but maybe. Contributions welcome!

# Prior Art

[Cypress's recommendation on component testing storybook](https://www.cypress.io/blog/2021/05/19/cypress-x-storybook-2-0/) by Bart Ledoux is essentially the 'what you can do without this package'.

[cypress-storybook](https://github.com/NicholasBoll/cypress-storybook) is a collection of utils for e2e testing which end up hooking into storybook's event emitter. That style of testing seems less preferrable than component tests, but it's fun and some of the ideas could still be applicable
