import { DocsContext, Title as SBTitle } from "@storybook/addon-docs";
import { startCase } from "lodash";
import React from "react";

export const Title = ({ name, pad }: { name?: string; pad?: boolean }) => {
  const context = React.useContext(DocsContext);
  return (
    <>
      {pad && <br />}
      <SBTitle>{startCase(name || context.name)}</SBTitle>
    </>
  );
};
