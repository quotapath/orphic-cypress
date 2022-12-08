import {
  Anchor,
  Subheading,
  Canvas,
  Description,
  DocsContext,
  DocsStoryProps,
  Story,
  Title as SBTitle,
} from "@storybook/addon-docs";
import { themes } from "@storybook/theming";
import React, { useContext } from "react";
import { transformSource } from "../src/storybook/story-code";
import { unitTestDecorator } from "../src/storybook/UnitTest";
import "./styles.css";

const CustomDocsStory: React.FC<DocsStoryProps> = ({
  id,
  name,
  expanded = true,
  parameters = {},
}) => {
  let description;
  const { docs } = parameters;
  if (expanded && docs) {
    description = docs.description?.story;
  }

  const subheading = expanded && name;

  return (
    <Anchor storyId={id ?? ""}>
      {subheading && <Subheading>{subheading}</Subheading>}
      {description && <Description markdown={description} />}
      <Canvas>
        <Story id={id} parameters={parameters} />
      </Canvas>
    </Anchor>
  );
};

const CustomStories = () => {
  const { componentStories } = useContext(DocsContext);

  let stories: DocsStoryProps[] = componentStories();
  stories = stories.filter((story) => !story.parameters?.docs?.disable);
  if (!stories || stories?.length === 0) return null;

  return (
    <>
      {stories.map(
        (story) =>
          story && <CustomDocsStory key={story.id} {...story} expanded />
      )}
    </>
  );
};

/**
 * This storybook uses nearly the same components for every story as a mechanism
 * for testing. So we can forgo showing the arg table or component at all, opting
 * instead just for the story's description and code block, if provided (default
 * code blocks were essentially useless)
 *
 * @private
 */
const DocsPage: React.FC = ({ children }) => (
  <>
    <SBTitle />
    <CustomStories />
    {children}
  </>
);

export const parameters = {
  docs: {
    page: DocsPage,
    source: { state: "open" },
    transformSource: transformSource({ includeObjects: true }),
    theme: themes.dark,
  },
  viewMode: "docs",
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
    expanded: true,
    hideNoControlsWarning: true,
  },
  options: {
    storySort: {
      order: [
        "Overview",
        "FileFormats",
        "StubActions",
        ["Overview"],
        "SkippingAndSelecting",
        ["Overview"],
        "MDX",
      ],
    },
  },
};

export const decorators = [unitTestDecorator];
