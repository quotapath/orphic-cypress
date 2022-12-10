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
  description?: string | false | null;
  /**
   * Parameters, probably passed in from parent in unitTestDecorator,
   * though I suppose passing in directly could be useful somehow
   */
  parameters?: WithCy<any>;
  /**
   * Potentially internal only: if the literate test is from code block. Used to
   * deduplicate display of code block in docs view
   */
  isCodeBlock?: boolean;
};

const getDefaultDescription = (cyTest: unknown) =>
  `should pass the following ${cyTest ? "cyTest" : "cy"} expectation`;

/** Get entries to map over to then display in each Preview component */
const getNormalizedCyTestEntries = (parameters: any, props: UnitTestProps) => {
  if (!parameters) return [];
  const { cy, cyTest } = parameters;
  if (cy) {
    return typeof cy === "object"
      ? Object.entries(cy)
      : [[props.description ?? getDefaultDescription(false), cy]];
  }
  if (cyTest) {
    return [[props.description ?? getDefaultDescription(true), cyTest]];
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
  const docsContext = useContext(DocsContext);
  const parametersContext = useContext(ParametersContext);
  let parameters = props.parameters;
  const hasDocsContext = docsContext && Object.keys(docsContext).length > 0;
  const hasParametersContext =
    parametersContext && Object.keys(parametersContext).length > 0;
  if (!parameters) {
    if (hasDocsContext) {
      const storyId = getStoryId(props, docsContext);
      const story = docsContext
        .componentStories()
        .find(({ id }) => id === storyId);
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
      <div key={String(key) || i}>
        {key && <div className="orphic-cypress-unit-test">{key}</div>}
        {!(props.isCodeBlock && hasDocsContext) && (
          <Source language="tsx" dark format={false} code={code} />
        )}
      </div>
    );
  });

  return <>{previews}</>;
};

const regex = {
  multilineInit: /^\s?\/\*/,
  multilineClose: /\*\//,
  comment: /^\s?(\/\/|\/\*\*|\*\/|\*)\s?/,
};

const partitionCommentsAndCode = (
  fnToParse: string
): [comments: string, code: string] => {
  const [comments, code]: [string[], string[]] = [[], []];
  const fnToParseSplit = fnToParse.split("\n");
  let isMultiLine =
    regex.multilineInit.test(fnToParseSplit[0]) &&
    !regex.multilineClose.test(fnToParseSplit[0]);
  for (const line of fnToParse.split("\n")) {
    if (code.length === 0 && (regex.comment.test(line) || isMultiLine)) {
      if (regex.multilineClose.test(line)) isMultiLine = false;
      const newComment = line.replace(regex.comment, "");
      // strip empty lines
      if (newComment.length) comments.push(newComment);
    } else {
      code.push(line);
    }
  }
  // for now at least,
  const joinedDescription = comments.length > 0 ? comments.join(" ") : "";
  return [joinedDescription, code.join("\n")];
};

/**
 * Gets the code block matching a story from the mdx page.
 * Just a tad hacky with how its getting to the MDXContent
 * @private
 */
export const getStoryCyFromMDXCodeBlock = (
  parameters: any,
  storyName: string,
  functionize?: boolean
): { [description: string]: string } => {
  const mdxContent = parameters?.docs?.page?.()?.props?.children?.type?.({});
  for (const child of mdxContent?.props?.children ?? []) {
    if (child?.props?.mdxType === "pre") {
      const childrenProps = child.props.children?.props;
      if (childrenProps.metastring === storyName) {
        const [description, code] = partitionCommentsAndCode(
          childrenProps.children
        );
        return {
          [description.length ? description : getDefaultDescription(false)]:
            functionize ? `() => { ${code} }` : code,
        };
      }
    }
  }
  return {};
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
  if (parameters.cyCodeBlock) {
    parameters.cy = getStoryCyFromMDXCodeBlock(
      context.parameters,
      context.originalStoryFn.storyName
    );
  }

  return (
    <ParametersContext.Provider value={parameters}>
      <Story />
      {(parameters.cyUnitTest || parameters.cyCodeBlock) && (
        <span data-cy="cy-unit-test">
          <br />
          <UnitTest
            name={context.name}
            parameters={parameters}
            isCodeBlock={parameters.cyCodeBlock}
          />
        </span>
      )}
    </ParametersContext.Provider>
  );
};
