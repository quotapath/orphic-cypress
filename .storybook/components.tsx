import { DocsContext, Title as SBTitle } from "@storybook/addon-docs";
import { startCase } from "lodash";
import React from "react";

/**
 * Just a quick and dirty story title that can get the story name from docs
 * context, though thats not helpful if there's more than one story.
 * `startCase`'s the name if from context or provided
 */
export const Title = ({ name, pad }: { name?: string; pad?: boolean }) => {
  const context = React.useContext(DocsContext);
  return (
    <>
      {pad && <br />}
      <SBTitle>{startCase(name || context.name)}</SBTitle>
    </>
  );
};
