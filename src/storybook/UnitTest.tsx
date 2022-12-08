import { DocsContext, getStoryId } from "@storybook/addon-docs";
import { Source } from "@storybook/components";
import React, { createContext, useContext } from "react";
import dedent from "ts-dedent";

import type { WithCy } from "../types";

/** Props for the UnitTest component, mostly to link to story */
export type UnitTestProps = {
  /** name matching the story's name */
  name?: string;
  /** id matching the story's name. either name or id must be provided */
  id?: string;
  /**
   * description for tests which have cy function or cyTest formats.
   * Provides a reasonable default but can opt out with `false`
   */
  description?: string | false;
  /**
   * Parameters, probably passed in from parent in unitTestDecorator,
   * though I suppose passing in directly could be useful somehow
   */
  parameters?: WithCy<any>;
};

/** Get entries to map over to then display in each Preview component */
const getNormalizedCyTestEntries = (parameters: any, props: UnitTestProps) => {
  if (!parameters) return [];
  const { cy, cyTest } = parameters;
  const defaultDescription = `should pass the following a ${
    cyTest ? "cyTest" : "cy"
  } expectation`;
  if (cy) {
    return typeof cy === "object"
      ? Object.entries(cy)
      : [[props.description ?? defaultDescription, cy]];
  }
  if (cyTest) {
    return [[props.description ?? defaultDescription, cyTest]];
  }
  return [];
};

/** Context for parameters used in unitTestDecorator */
export const ParametersContext = createContext({});

/**
 * Display test information for pure unit test stories.
 * This is likey used in mdx files and must have a 'name' or 'id' which would appropriately
 * match to the proper story.
 * See [the task story](https://quotapath.github.io/orphic-cypress/storybook/?path=/docs/cypressutils-tasks--arbitrary-task#literate-testing)
 * for detailed use.
 * ```ts
 * <Story
 *   name="ArbitraryTask"
 *   parameters={{
 *     cy: () =>
 *       cy.arbitraryTask(2).then(($num) => expect($num).to.equal(2)),
 *   }}
 * >
 *   <UnitTest name="ArbitraryTask" />
 * </Story>
 * ```
 *
 * Or by providing the `unitTestDecorator` decorator and setting a `cyUnitTest`
 * parameter to `true`
 */
export const UnitTest = (props: UnitTestProps) => {
  // lots of different possible ways of getting parameters in here
  const context = useContext(DocsContext);
  const parametersContext = useContext(ParametersContext);
  let parameters = props.parameters;
  const hasContext = context && Object.keys(context).length > 0;
  const hasParametersContext =
    parametersContext && Object.keys(parametersContext).length > 0;
  if (!parameters) {
    if (hasContext) {
      const storyId = getStoryId(props, context);
      const story = context.componentStories().find(({ id }) => id === storyId);
      parameters = story?.parameters;
    } else if (hasParametersContext) {
      parameters = parametersContext;
    }
  }

  if (!parameters) return null;

  const cyMap = getNormalizedCyTestEntries(parameters, props);

  const previews = cyMap.map(([key, orgCode], i) => {
    const code = dedent((orgCode as () => void).toString());
    return (
      <div key={key || i}>
        {key && <div className="orphic-cypress-unit-test">{key}</div>}
        <Source language="tsx" dark format={false} code={code} />
      </div>
    );
  });

  return <>{previews}</>;
};

/**
 * A storybook decorator that provides a parameter context for the sake
 * of showing UnitTest components in cypress and storybook canvas as opposed
 * to just docs, and allows display without manually adding a UnitTest component
 * via `cyUnitTest` parameter.
 * TODO: types would be nice, but have been annoying
 */
export const unitTestDecorator = (Story: any, context: any) => {
  const parameters = { ...context.originalStoryFn, ...context.parameters };
  return (
    <ParametersContext.Provider value={parameters}>
      <Story />
      {context.parameters?.cyUnitTest && (
        <span data-cy="cy-unit-test">
          <br />
          <UnitTest name={context.name} parameters={parameters} />
        </span>
      )}
    </ParametersContext.Provider>
  );
};
