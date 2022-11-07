import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { Button } from "../Button";

export default {
  title: "File Formats/Storybook Files",
  component: Button,
};

// These are more repetitive than necessary, real story scenarios would use a 'render'
// prop to the default export, use object syntax throughout, build a template, etc.

export const StoryFunctionWithCyFunction: ComponentStoryCy<typeof Button> = (
  args
) => <Button {...args} label="Story function" />;

StoryFunctionWithCyFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");

StoryFunctionWithCyFunction.parameters = {
  docs: {
    description: {
      story:
        ".cy is the simplest format, expecting just a function which executes in cypress",
    },
    source: {
      code: `
export default { component: Button };

export const StoryFunctionWithCyFunction: ComponentStoryCy<typeof Button> = (
  args
) => <Button {...args} label="Story function" />;

StoryFunctionWithCyFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");`,
    },
  },
};

export const StoryFunctionWithCyObject: ComponentStoryCy<typeof Button> = (
  args
) => <Button {...args} label="Story object" />;

StoryFunctionWithCyObject.cy = {
  "should contain 'Story object' label": () =>
    cy.dataCy("button").should("contain", "Story object"),

  "should not be disabled by default": () =>
    cy.dataCy("button").should("not.be.disabled"),
};

StoryFunctionWithCyObject.parameters = {
  docs: {
    description: {
      story: `
.cy also allows an object syntax where the text keys become the input for cypress \`it\`'s
and the bodies execute within their own tests.

\`\`\`tsx
export const StoryFunctionWithCyObject: ComponentStoryCy<typeof Button> = (
  args
) => <Button {...args} label="Story object" />;

StoryFunctionWithCyObject.cy = {
  "should contain 'Story object' label": () =>
    cy.dataCy("button").should("contain", "Story object"),

  "should not be disabled by default": () =>
    cy.dataCy("button").should("not.be.disabled"),
};
\`\`\`

becomes

\`\`\`tsx
describe("Story Function With Cy Object", () => {
  it("should contain 'Story object' label", () =>
    cy.dataCy("button").should("contain", "Story object")
  );

  it("should not be disabled by default", () =>
    cy.dataCy("button").should("not.be.disabled")
  );
});
\`\`\`
`,
    },
    source: { code: null },
  },
};

// Could accept args, but label is required, so just showing a non-args version
export const StoryFunctionWithCyTest: ComponentStoryCy<typeof Button> = (
  args
) => <Button label="Story test" {...args} />;

StoryFunctionWithCyTest.cyTest = (Story) => {
  it("should contain 'Story test' label", () => {
    cy.mount(<Story />);
    cy.dataCy("button").should("contain", "Story test");
  });

  it("should accept a disabled prop", () => {
    cy.mount(<Story disabled />);
    cy.dataCy("button").should("be.disabled");
  });

  it.skip("should skip a test", () => {
    cy.mount(<Story />);
    cy.dataCy("button").should(
      "contain",
      "This test would fail if not skipped"
    );
  });
};

export const StoryObjectWithCyFunction: ComponentStoryObjCy<typeof Button> = {
  args: { label: "Story function" },
  cy: () => cy.dataCy("button").should("contain", "Story function"),
};
