import * as ts from "typescript";
import { dedent } from "ts-dedent";

import * as DocsOnly from "./__mock__/DocsOnly";
import * as StandardCSFButAutomaticallyRenderTested from "./__mock__/StandardCSFButAutomaticallyRenderTested";
import csfCommonjsOutput from "!!raw-loader!./__mock__/csf-commonjs-output.jsx.raw";
import { transformIsolatedComponentFiles } from "./isolated-component-files";

const testTransformer = ({
  transformerFns,
  file,
  fileName,
  commonjs,
}: {
  transformerFns: any[];
  file: string | null;
  fileName: string;
  commonjs?: boolean;
}) =>
  ts
    .transpileModule(file!, {
      compilerOptions: commonjs
        ? {
            module: ts.ModuleKind.CommonJS,
            esModuleInterop: true,
            moduleResollution: "node",
          }
        : {
            module: ts.ModuleKind.ES2022,
            target: ts.ScriptTarget.ES2022,
          },
      fileName,
      transformers: {
        before: transformerFns,
      },
    })
    .outputText.replace(/\r/g, "");

// these could be in files and raw imported, but probably better documentation
// to have them directly at hand here
const csf = dedent`
  import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
  import { Comp, CompProps } from "components/Comp";
  import * as React from "react";

  export default {
    component: Comp,
    title: "Component",
  };

  export const StoryFn: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
  export const StoryObj: ComponentStoryObj<typeof Comp> = {
    args: { label: "test" };
  };
`;

const csfTransformed = dedent`
  import { executeCyTests } from "orphic-cypress";
  import { Comp } from "components/Comp";
  import * as React from "react";
  export default {
      component: Comp,
      title: "Component",
  };
  export const StoryFn = (args) => <Comp {...args}/>;
  export const StoryObj = {
      args: { label: "test" }
  };
  executeCyTests({ default: {
          component: Comp,
          title: "Component",
      }, StoryFn, StoryObj })\n
`;

const csfNotTransformed = dedent`
  import { Comp } from "components/Comp";
  import * as React from "react";
  export default {
      component: Comp,
      title: "Component",
  };
  export const StoryFn = (args) => <Comp {...args}/>;
  export const StoryObj = {
      args: { label: "test" }
  };\n
`;

describe("transformIsolatedComponentFiles", () => {
  it("should transform a csf file by adding the execute import and call on all exports", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: csf,
      fileName: "Comp.stories.tsx",
      transformerFns: [transformerFn],
    });

    expect(result).to.equal(csfTransformed);
  });

  it("should skip non-story files based on story name match, even if the file is otherwise a csf", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: csf,
      fileName: "Comp.tsx",
      transformerFns: [transformerFn],
    });

    expect(result)
      .to.not.contain("executeCyTests")
      .and.not.contain("orphic-cypress");
    expect(result).to.equal(csfNotTransformed);
  });

  it("should accept alternate location for executeCyTests incase its altered and exported from elsewhere", () => {
    const transformerFn = transformIsolatedComponentFiles("../some/file/path");
    const result = testTransformer({
      file: csf,
      fileName: "Comp.stories.tsx",
      transformerFns: [transformerFn],
    });

    expect(result.split("\n")[0]).to.equal(
      'import { executeCyTests } from "../some/file/path";'
    );
  });

  it("should accept alternate story pattern regex for matching", () => {
    const transformerFn = transformIsolatedComponentFiles(
      undefined,
      /\.st.*book\./
    );

    expect(
      testTransformer({
        file: csf,
        fileName: "Comp.storybook.tsx",
        transformerFns: [transformerFn],
      })
    ).to.equal(csfTransformed);

    expect(
      testTransformer({
        file: csf,
        fileName: "Comp.starrybook.tsx",
        transformerFns: [transformerFn],
      })
    ).to.equal(csfTransformed);

    expect(
      testTransformer({
        file: csf,
        fileName: "Comp.nopebook.tsx",
        transformerFns: [transformerFn],
      })
    ).to.equal(csfNotTransformed);
  });

  it("should accept alternate story pattern string for matching", () => {
    const transformerFn = transformIsolatedComponentFiles(
      undefined,
      ".storybook."
    );

    expect(
      testTransformer({
        file: csf,
        fileName: "Comp.storybook.tsx",
        transformerFns: [transformerFn],
      })
    ).to.equal(csfTransformed);

    expect(
      testTransformer({
        file: csf,
        fileName: "Comp.starrybook.tsx",
        transformerFns: [transformerFn],
      })
    ).to.equal(csfNotTransformed);
  });

  it("should not transform if no default export is found", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const file = dedent`
      import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
      import { Comp, CompProps } from "components/Comp";
      import * as React from "react";

      export const StoryFn: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
      export const StoryObj: ComponentStoryObj<typeof Comp> = {
        args: { label: "test" };
      };
    `;

    expect(
      testTransformer({
        file,
        fileName: "Comp.stories.tsx",
        transformerFns: [transformerFn],
      })
    )
      .to.not.contain("executeCyTests")
      .and.not.contain("orphic-cypress");
  });

  it("should not transform if no named exports are found", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const file = dedent`
      import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
      import { Comp, CompProps } from "components/Comp";
      import * as React from "react";

      export default {
        component: Comp,
        title: "Component",
      };
    `;

    expect(
      testTransformer({
        file,
        fileName: "Comp.stories.tsx",
        transformerFns: [transformerFn],
      })
    )
      .to.not.contain("executeCyTests")
      .and.not.contain("orphic-cypress");
  });

  it("should transform a commonjs build config", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: csf,
      fileName: "Comp.stories.tsx",
      transformerFns: [transformerFn],
      commonjs: true,
    });

    expect(result).to.contain("executeCyTests");
    expect(result).to.equal(csfCommonjsOutput);
  });

  it("should handle an empty file", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: "",
      fileName: "Comp.stories.tsx",
      transformerFns: [transformerFn],
    });

    expect(result).to.equal("");
  });

  it("should transform a csf mdx file, post transform to jsx", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: StandardCSFButAutomaticallyRenderTested.input,
      fileName: "StandardCSFButAutomaticallyRenderTested.stories.mdx",
      transformerFns: [transformerFn],
    });

    expect(result).to.contain("executeCyTests");
    expect(result).to.equal(StandardCSFButAutomaticallyRenderTested.output);
  });

  it("should handle a docs only mdx file, post transform to jsx", () => {
    const transformerFn = transformIsolatedComponentFiles();
    const result = testTransformer({
      file: DocsOnly.input,
      fileName: "DocsOnly.stories.mdx",
      transformerFns: [transformerFn],
    });

    expect(result).not.to.contain("executeCyTests");
    expect(result).to.equal(DocsOnly.output);
  });
});
