/**
 * Utilities to provide cypress stubs for storybook actions.
 * This will mock all explicitly defined argTypes in any location.
 *
 * Happens automatically for `executeCyTests`, but would be executed
 * manually for external test files.
 *
 * @module
 */
import type { ArgTypes } from "@storybook/react";

import type {
  ComponentStoryCy,
  ComponentStoryObjCy,
  StoryFileCy,
} from "./types";

/**
 * Object of function name keys to stubbed actions values.
 * Might be more likely that you'd access these stubs via `cy.get("@actions")`
 */
export type WrappedActions = {
  [fnName: string]: ReturnType<typeof cy.stub | typeof cy.spy>;
};

/** Quick util to stub or spy and alias, which isn't consistent in cypress API */
const mockAs = (alias: string, toSpy?: any) => {
  if (toSpy) return cy.spy(toSpy).as(alias);
  const stub = cy.stub();
  stub.as(alias);
  return stub;
};

const addAlias = (
  stubOrSpy: ReturnType<typeof cy.stub | typeof cy.spy>,
  alias: string
) => {
  stubOrSpy.as(alias);
  return stubOrSpy;
};

/**
 * Wrap argTypes in cy.stubs. Unit test framework from storybook at this point doesn't do
 * anything with these argTypes, nor does it add props/stubs for actions.argTypesRegex.
 * As such, its recommended to manually specify crucial argTypes, or write `.cy` tests
 * which provide mocks.
 *
 * In executeCyTests will operate on `export default { argTypes: { some: { action: 'some' } } }`
 * and combine that with any action argTypes defined on the story level.
 * Will be available at `cy.get("@actions")` or `this.actions` within tests.
 *
 * @private
 */
const stubArgTypeActions = (
  args: ComponentStoryCy<any>["args"] | ComponentStoryObjCy<any>["args"],
  argTypes?: Partial<ArgTypes<any>>,
  seed?: WrappedActions
): WrappedActions =>
  Object.entries(argTypes ?? {}).reduce((acc, [key, value]) => {
    if (value && value.action) {
      // alias the stub with the name given to the action. shows up really well in cypress
      // as a stub with call count and in assertion names etc.
      return {
        ...acc,
        [key]: acc[key]
          ? addAlias(acc[key], value.action)
          : mockAs(value.action, args?.[key]),
      };
    }
    return acc;
  }, seed ?? {});

/**
 * Object of either component obj of function
 * @private
 */
export type Stories = {
  [name: string]: (ComponentStoryCy<any> | ComponentStoryObjCy<any>) & {
    /** this seems to be the accurate storyName for the component */
    storyName: string;
  };
};

/**
 * Get argTypes from both the default export and the individual story.
 * Useful for a per-component beforeEach or top-of-test declaration.
 * Note that you'll want to return undefined from `beforeEach`
 *
 * ```ts
 * describe("SomeComponent", () => {
 *   beforeEach(() => {
 *     stubStoryActions(SomeComponent, stories);
 *   });
 *
 *   it("should render ok and call someAction on init", () => {
 *     cy.mount(<SomeComponent {...this.actions} />);
 *     cy.get("@actions").its("someAction").should("be.calledWith", "");
 *   });
 * });
 * ```
 *
 * ```ts
 * it("should do something", () => {
 *   // could just be `const actions = { someAction: cy.stub(), ... }`
 *   const actions = stubStoryActions(SomeStory, stories);
 *   cy.mount(<SomeStory {...actions} />);
 *   cy.dataCy("something").click().then(() => {
 *     expect(actions.someAction).to.have.callCount(1);
 *   });
 *   // or without the promise
 *   cy.dataCy("something").click();
 *   cy.get("@actions").its("someAction").should("have.callCount", 2);
 * });
 * ```
 *
 * Mostly an internal detail: precedence order, 3 through end will have essentially the same effect
 * 1) explicitly provided args/props for story which will become spies
 * 2) explicitly provided args at default export which will become spies
 * 3) local argTypes action definition
 * 4) global argTypes action definition
 * 5) local argTypes regex definition
 * 6) global argTypes regex definition
 */
export const stubStoryActions = <T extends StoryFileCy>(
  composedStory: ComponentStoryCy<any> | ComponentStoryObjCy<any>,
  stories: T,
  seed?: WrappedActions
): WrappedActions => {
  const { argTypes, storyName, parameters, args } = composedStory;
  const argTypesRegex = parameters?.actions?.argTypesRegex;

  const docgenInfo = (
    stories.default?.component as any as { __docgenInfo: any }
  )?.__docgenInfo;
  const asRegex = new RegExp(argTypesRegex);
  // start with args and props, unique
  const argKeys = [
    ...new Set([
      ...Object.keys(args ?? {}),
      ...Object.keys(docgenInfo?.props ?? {}),
    ]),
  ];
  const toAutoMock = argTypesRegex
    ? Object.fromEntries(
        argKeys.flatMap((key) =>
          asRegex.test(key)
            ? [[key, mockAs(`argTypesRegex.${key}`, args?.[key])]]
            : []
        )
      )
    : {};

  const argTypesFromStoryObj = storyName
    ? (stories as any as Stories)[storyName]?.argTypes
    : null;
  const actions = stubArgTypeActions(
    { ...(stories.default?.args ?? {}), ...composedStory.args },
    {
      ...(stories.default?.argTypes ?? {}),
      ...(argTypes ?? {}),
      ...(argTypesFromStoryObj ?? {}),
    },
    {
      ...toAutoMock,
      ...(seed ?? {}),
    }
  );
  cy.wrap(actions).as("actions");
  return actions;
};
