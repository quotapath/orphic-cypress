/**
 * @module storybook
 */
import {
  Anchor,
  Subheading,
  Description,
  DocsContext,
  DocsStoryProps,
  Source,
  Title,
} from "@storybook/addon-docs";
import React, { useContext } from "react";

export const CustomDocsStory: React.FC<DocsStoryProps> = ({
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
      {docs.source.code === null ? null : docs.source.code ? (
        <Source code={docs.source.code} dark />
      ) : (
        <div style={{ color: "white", padding: "20px" }}>
          No code block provided, see Canvas → Story tab instead
        </div>
      )}
    </Anchor>
  );
};

export const CustomStories = () => {
  const { componentStories } = useContext(DocsContext);

  let stories: DocsStoryProps[] = componentStories();
  stories = stories.filter((story) => !story.parameters?.docs?.disable);
  if (!stories || stories.length === 0) return null;

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
export const DocsPage: React.FC = ({ children }) => (
  <>
    <Title />
    <CustomStories />
    {children}
  </>
);
