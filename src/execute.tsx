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
  const describeFn =
    stories.default.cyOnly || stories.default.parameters?.cyOnly
      ? describe.only
      : stories.default.cySkip || stories.default.parameters?.cySkip
      ? describe.skip
      : describe;
  describeFn(describeText || stories.default.title || "CyTest", () => {
    // adding `cy` property to default is a way to add hooks like `beforeEach`
    // for all tests in the file. I guess you could even write a test here.
    const defaultCy = stories.default.cy || stories.default.parameters?.cy;
    if (defaultCy) defaultCy();
    const config: CyTestConfig = Cypress.env("cyTest");

    const cyIncludeStories =
      stories.default.cyIncludeStories ||
      stories.default.parameters?.cyIncludeStories;
    if (cyIncludeStories) {
      if (cyIncludeStories === true) {
        delete stories.default.includeStories;
      } else {
        stories.default.includeStories = cyIncludeStories;
      }
    }
    const composed = composeStories(stories);
    const composedEntries = Object.entries(composed) as [
      [name: string, Comp: any]
    ];
    composedEntries.forEach(([name, Comp]) => {
      if (typeof Comp !== "function") return;

      describe(storyNameFromExport(name), () => {
        const story = (stories as any as Stories)[name];
        const parameters = story.parameters || {};
        const cyTest = story.cyTest || parameters.cyTest;
        beforeEach(() => {
          if (cyTest && config?.format?.cyTest === false) {
            throw new CyTestConfigError("cyTest", stories.default.title);
          }
          stubStoryActions(Comp, stories);
          const mockData = [
            ...(stories.default.parameters?.mockData || []),
            ...(Comp.parameters?.mockData || []),
          ];
          if (mockData.length > 0) mockToCyIntercept(mockData);
        });

        // cy test format where a function can then contain 'it's and 'before' etc
        // actions will be available at `cy.get("@actions")` or `this.actions`
        // and you can skip/only in the test
        if (cyTest) return cyTest(Comp);
        // cy object format for a more streamlined test that does the mount for you
        const itFn =
          story.cyOnly || parameters.cyOnly
            ? it.only
            : story.cySkip || parameters.cySkip
            ? it.skip
            : it;
        const storyCy = story.cy || parameters.cy;
        if (storyCy) {
          // cy is a function directly
          if (typeof storyCy === "function") {
            return itFn("should satisfy a cy test expectation", function () {
              if (config?.format?.function === false) {
                throw new CyTestConfigError("function", stories.default.title);
              }
              cy.mount(<Comp {...this.actions} />);
              storyCy.bind(this)();
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
              cyTest.bind(this)();
            });
          });
        }
        // mdx files with no stories are docs only and will intentionally throw an error if rendered
        if (name !== "__page") {
          // no test defined, just check that it renders ok
          itFn(`${name} should render ok`, function () {
            cy.mount(<Comp {...this.actions} />);
          });
        }
      });
    });
  });
};
