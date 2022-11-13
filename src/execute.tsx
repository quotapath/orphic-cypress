import { storyNameFromExport } from "@storybook/csf";
import { composeStories } from "@storybook/testing-react";
import React from "react";

import type { Stories } from "./actions";
import { stubStoryActions } from "./actions";
import type { CyTestConfig } from "./config";
import { mockToCyIntercept } from "./intercept";
import type { StoryFileCy } from "./types";

class CyTestConfigError extends Error {
  constructor(format: "cyTest" | "object" | "function", storyTitle?: string) {
    super(
      `Opted out of allowing the ${format} format. See your setupNodeEvents` +
        ` and/or env.cyTest.format.${format} to alter the config, or update the test${
          storyTitle ? ` for ${storyTitle}` : ""
        } by changing it to a supported format or moving it to an external file`
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * A composeStories that carries over other keys as well as those from
 * @storybook/testing-react's version. The only important one is `argTypes`
 * which should come along in the built-in version.
 *
 * If you are using storybook's version _and_ calling `stubStoryActions`
 * manually, you'll want to do
 * ```ts
 * const { SomeComponent } = composeStories(stories);
 * stubStoryActions(SomeComponent, stories)
 * ```
 */
export const tComposeStories: typeof composeStories = (
  storiesImport,
  globalConfig
) => {
  const composed = composeStories(storiesImport, globalConfig);
  for (const key in composed) {
    const typedKey = key as keyof typeof composed;
    // TODO: something could be done on the types here
    // @ts-ignore
    composed[typedKey].cy = storiesImport[typedKey].cy;
    // @ts-ignore
    composed[typedKey].cyTest = storiesImport[typedKey].cyTest;
    // @ts-ignore
    composed[typedKey].argTypes = storiesImport[typedKey].argTypes;
  }
  return composed;
};

/**
 * Execute standard cypress tests against a set of storybook components.
 * If the storybook story or object is normal, then it will perform a simple
 * 'mount' and expect no errors to throw. If the story or object has a `cy`
 * property, then the keys of that object will be used as 'it' descriptions
 * and each test there will be executed.
 *
 * @throws CyTestConfigError
 */
export const executeCyTests = <T extends StoryFileCy>(
  stories: T,
  describeText?: string
) => {
  // don't compose exports that aren't capitalized, which is a naive way to
  // test if they are reasonably stories or not.
  const filteredStories = Object.entries(stories).reduce(
    (acc, [k, v]) =>
      k === "default" || k[0] === k[0].toUpperCase() ? { ...acc, [k]: v } : acc,
    {} as typeof stories
  );
  const describeFn = stories.default.cyOnly
    ? describe.only
    : stories.default.cySkip
    ? describe.skip
    : describe;
  describeFn(describeText || stories.default.title || "CyTest", () => {
    // adding `cy` property to default is a way to add hooks like `beforeEach`
    // for all tests in the file. I guess you could even write a test here.
    if (stories.default.cy) stories.default.cy();
    const mockData = stories.default.parameters?.mockData;
    const config: CyTestConfig = Cypress.env("cyTest");

    if (mockData) {
      beforeEach(() => {
        mockToCyIntercept(mockData);
      });
    }

    if (stories.default.cyIncludeStories) {
      if (stories.default.cyIncludeStories === true) {
        delete stories.default.includeStories;
      } else {
        stories.default.includeStories = stories.default.cyIncludeStories;
      }
    }
    const composed = composeStories(filteredStories);
    const composedEntries = Object.entries(composed) as [
      [name: string, Comp: any]
    ];
    composedEntries.forEach(([name, Comp]) => {
      if (typeof Comp !== "function") return;

      describe(storyNameFromExport(name), () => {
        const story = (filteredStories as Stories)[name];
        beforeEach(() => {
          if (story.cyTest && config?.format?.cyTest === false) {
            throw new CyTestConfigError("cyTest", stories.default.title);
          }
          stubStoryActions(Comp, filteredStories);
        });
        // cy test format where a function can then contain 'it's and 'before' etc
        // actions will be available at `cy.get("@actions")` or `this.actions`
        // and you can skip/only in the test
        if (story.cyTest) return story.cyTest(Comp);
        // cy object format for a more streamlined test that does the mount for you
        const itFn = story.cyOnly ? it.only : story.cySkip ? it.skip : it;
        if (story.cy) {
          const storyCy = story.cy;
          // cy is a function directly
          if (typeof storyCy === "function") {
            return itFn("should satisfy a cy test expectation", function () {
              if (config?.format?.function === false) {
                throw new CyTestConfigError("function", stories.default.title);
              }
              cy.mount(<Comp {...this.actions} />);
              storyCy();
            });
          }
          // otherwise cy is an object with story descriptions as keys and test
          // functions as values
          return Object.entries(storyCy).forEach(([desc, cyTest]) => {
            itFn(desc, function () {
              if (config?.format?.object === false) {
                throw new CyTestConfigError("object", stories.default.title);
              }
              cy.mount(<Comp {...this.actions} />);
              cyTest();
            });
          });
        }
        // no test defined, just check that it renders ok
        itFn(`${name} should render ok`, function () {
          cy.mount(<Comp {...this.actions} />);
        });
      });
    });
  });
};
