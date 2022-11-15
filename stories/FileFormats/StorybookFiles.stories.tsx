import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { Button } from "../Button";

export default {
  component: Button,
  id: "fileformats-storybookfiles", // story-code @skip
};

// These are more repetitive than necessary, real story scenarios would use a 'render'
// prop to the default export, use object syntax throughout, build a template, etc.

export const StoryFunctionWithCyFunction: ComponentStoryCy<typeof Button> = (
  args
) => <Button {...args} label="Story function" />;

StoryFunctionWithCyFunction.cy = () =>
  cy.dataCy("button").should("contain", "Story function");
// story-code @end @include-default
StoryFunctionWithCyFunction.parameters = {
  docs: {
    description: {
      story:
        ".cy is the simplest format, expecting just a function which executes in cypress",
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
// story-code @end
StoryFunctionWithCyTest.parameters = {
  docs: {
    description: {
      story: `
.cyTest offers the most control and is the most verbose.
It allows executing test hooks like beforeEach, calling it.skip,
or passing new arguments to the story at each test, but requires
manually calling cy.mount on the component that comes in as an argument.`,
    },
  },
};

export const StoryObjectWithCyFunction: ComponentStoryObjCy<typeof Button> = {
  args: { label: "Story function" },
  cy: () => cy.dataCy("button").should("contain", "Story function"),
  // story-code @skip-start
  parameters: {
    docs: {
      description: {
        story: `
.cy is the most concise testing syntax and CSF object syntax is the most concise
story format. Together, they can make for some truly small but powerful tests.`,
      },
    },
  },
  // story-code @skip-end
};
