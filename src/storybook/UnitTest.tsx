import { DocsContext, getStoryId } from "@storybook/addon-docs";
import { Preview } from "@storybook/components";
import React, { useContext } from "react";
import dedent from "ts-dedent";

/** Props for the UnitTest component, mostly to link to story */
export type UnitTestProps = {
  /** name matching the story's name */
  name?: string;
  /** id matching the story's name. either name or id must be provided */
  id?: string;
  /**
   * description for tests which have cy function or cyTest formats.
   * Provides a reasonable default
   */
  description?: string;
};

/** Get entries to map over to then display in each Preview component */
const getNormalizedCyTestEntries = (parameters: any, props: UnitTestProps) => {
  if (!parameters) return [];
  const { cy, cyTest } = parameters;
  if (cy) {
    return typeof cy === "object"
      ? Object.entries(cy)
      : [[props.description || "should pass a cy expectation", cy]];
  }
  if (cyTest) {
    return [[props.description || "should pass a cyTest expectation", cyTest]];
  }
  return [];
};

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
 *        cy.arbitraryTask(2).then(($num) => expect($num).to.equal(2)),
 *   }}
 * >
 *   <UnitTest name="ArbitraryTask" />
 * </Story>
 * ```
 */
export const UnitTest = (props: UnitTestProps) => {
  const context = useContext(DocsContext);
  // unfortunately, cypress doesn't get DocsContext and so we'll just
  // render an empty element
  if (!context || Object.keys(context).length === 0) return null;

  const storyId = getStoryId(props, context);
  const story = context.componentStories().find(({ id }) => id === storyId);

  const cyMap = getNormalizedCyTestEntries(story?.parameters, props);

  const previews = cyMap.map(([key, code]) => (
    <Preview
      key={key}
      withSource={{
        language: "tsx",
        code: dedent(
          (code as () => void).toString().split("\n").slice(1, -1).join("\n")
        ),
      }}
      isExpanded
    >
      <span className="orphic-cypress-unit-test" key={key}>
        {key}
      </span>
    </Preview>
  ));

  return <>{previews}</>;
};
