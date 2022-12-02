import { dedent } from "ts-dedent";

import {
  removeSkips,
  transformSource,
  TransformSourceOptions,
} from "./story-code";

describe("story-code", () => {
  describe("removeSkips", () => {
    it("should remove lines skipped with @skip", () => {
      const lines = [
        "const notSkipped = 1;",
        "const skipped = 1; // story-code @skip",
        "const notSkipped2 = 2;",
        "// story-code @skip", // test blank line
        // test extra whitespace
        "const skipped2 = 2; //    story-code   @skip",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
      ]);
    });

    it("should remove next lines skipped with @skip-next", () => {
      const lines = [
        "const notSkipped = 1;",
        "// story-code @skip-next",
        "const skipped = 1;",
        "const notSkipped2 = 2;",
        "// story-code @skip-next",
        "// story-code @skip-next", // test repeated
        "const skipped2 = 2;",
        "// story-code @skip-next",
        // test interaction with skip
        "const alreadySkipped = 3 // story-code @skip",
        // same line still skips
        "// story-code @skip-next @skip",
        "const skipped3 = 3;",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
      ]);
    });

    it("should remove skip sections", () => {
      const lines = [
        "const notSkipped = 1;",
        "// story-code @skip-start",
        "const skipped = 1;",
        "// story-code @skip-end",
        "const notSkipped2 = 2;",
        "// story-code @skip-start",
        "const skipped2 = 2;",
        "const skipped3 = 3;",
        "// story-code @skip-end",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
      ]);
    });

    it("should remove skip sections inclusive of commented line", () => {
      const lines = [
        "const notSkipped = 1;",
        "const skipped = 1; // story-code @skip-start",
        "const skipped2 = 2;",
        "const skipped3 = 3; // story-code @skip-end",
        "const notSkipped2 = 2;",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
      ]);
    });

    it("should ignore dupe starts and skip lines with skip-end regardless", () => {
      const lines = [
        "const notSkipped = 1;",
        "const skipped = 1; // story-code @skip-start",
        "const skipped2 = 2; // story-code @skip-start",
        "const skipped3 = 3;",
        "const skipped4 = 4; // story-code @skip-end",
        "const skipped5 = 5; // story-code @skip-end",
        "const notSkipped2 = 2;",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
      ]);
    });

    it("should override @skip with regions, but only if in that order", () => {
      // so really just: 'some wonkiness ensues if you combine'
      const lines = [
        "const notSkipped = 1;",
        "const skipped = 1; // story-code @skip-start @skip",
        "const skipped3 = 3;",
        "const skipped4 = 4; // story-code @skip-end",
        "const notSkipped2 = 2;",
        "const skipped = 1; // story-code @skip @skip-start",
        "const skipped3 = 3;",
        "const skipped4 = 4; // story-code @skip-end",
      ];
      expect(removeSkips(lines)).to.deep.equal([
        "const notSkipped = 1;",
        "const notSkipped2 = 2;",
        "const skipped3 = 3;",
      ]);
    });
  });

  describe("transformSource", () => {
    const basicTest = (source: string, startLine: number, endLine: number) =>
      transformSource()("<SomeComponent prop={1} />", {
        id: "somedir-nested--some-story",
        originalStoryFn: { name: "SomeStory" },
        parameters: {
          storySource: {
            source,
            locationsMap: {
              "some-story": {
                startLoc: { line: startLine },
                endLoc: { line: endLine },
              },
            },
          },
        },
      } as any);

    it("should gather start and end locations as provided by storysource addon", () => {
      const result = basicTest(
        dedent`
          import type { ComponentStory } from "@storybook/react";
          import { SomeComponent } from "./";

          export default { component: SomeComponent };

          export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} />
          );
          SomeStory.args = { prop: 1 };

          export const OtherStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} prop={1} />
          );
          OtherStory.args = { prop2: 2 };
        `,
        6,
        8
      );
      const expected = dedent`
        export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
         <SomeComponent {...args} />
        );
      `;
      expect(result).to.equal(expected);
    });

    it("should include default line as a single line", () => {
      const result = basicTest(
        dedent`
          import type { ComponentStory } from "@storybook/react";
          import { SomeComponent } from "./";

          export default { component: SomeComponent };

          export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} />
          );
          // story-code @include-default
          SomeStory.args = { prop: 1 };

          export const OtherStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} prop={1} />
          );
          OtherStory.args = { prop2: 2 };
        `,
        6,
        8
      );
      const expected = dedent`
        export default { component: SomeComponent };

        export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
         <SomeComponent {...args} />
        );
      `;
      expect(result).to.equal(expected);
    });

    it("should gather and include default lines", () => {
      const result = basicTest(
        dedent`
          import type { ComponentStory } from "@storybook/react";
          import { SomeComponent } from "./";

          export default {
            component: SomeComponent,
            title: "SomeDir/Nested",
          };

          export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} />
          );
          // story-code @include-default
          SomeStory.args = { prop: 1 };

          export const OtherStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} prop={1} />
          );
          OtherStory.args = { prop2: 2 };
        `,
        9,
        11
      );
      const expected = dedent`
        export default {
          component: SomeComponent,
          title: "SomeDir/Nested",
        };

        export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
         <SomeComponent {...args} />
        );
      `;
      expect(result).to.equal(expected);
    });

    it("should gather and include start lines", () => {
      const result = basicTest(
        dedent`
          import type { ComponentStory } from "@storybook/react";
          import { SomeComponent } from "./";

          const somethingElseImportant = 1;

          export default {
            component: SomeComponent,
            title: "SomeDir/Nested",
          };

          export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} />
          );
          // story-code @include-start
          SomeStory.args = { prop: 1 };

          export const OtherStory: ComponentStory<typeof SomeStory> = (args) => (
           <SomeComponent {...args} prop={1} />
          );
          OtherStory.args = { prop2: 2 };
        `,
        11,
        13
      );
      const expected = dedent`
        import type { ComponentStory } from "@storybook/react";
        import { SomeComponent } from "./";

        const somethingElseImportant = 1;

        export default {
          component: SomeComponent,
          title: "SomeDir/Nested",
        };

        export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
         <SomeComponent {...args} />
        );
      `;
      expect(result).to.equal(expected);
    });

    describe("object file syntax", () => {
      const source = dedent`
        import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
        import { SomeComponent } from "./";

        export default {
          component: SomeComponent,
          title: "SomeDir/Nested",
        };

        export const SomeStory: ComponentStory<typeof SomeStory> = (args) => (
         <SomeComponent {...args} />
        );
        // story-code @include-start
        SomeStory.args = { prop: 1 };

        export const OtherStoryObj: ComponentStoryObj<typeof SomeStory> = {
         <SomeComponent {...args} prop={1} />
        };
        OtherStoryObj.args = { prop2: 2 };
        // story-code @end
      `;
      const objTest = (opts: TransformSourceOptions) =>
        transformSource(opts)("<OtherStoryObj prop={1} />", {
          id: "somedir-nested--other-story-obj",
          originalStoryFn: { name: null },
          name: "Other Story Obj",
          parameters: {
            storySource: {
              source,
              locationsMap: {
                // note: missing other-story-obj
                "some-story": { startLoc: { line: 9 }, endLoc: { line: 15 } },
              },
            },
          },
        } as any);

      it("should get location information from objects despite storysource not generating it", () => {
        const expected = dedent`\n
          export const OtherStoryObj: ComponentStoryObj<typeof SomeStory> = {
           <SomeComponent {...args} prop={1} />
          };
          OtherStoryObj.args = { prop2: 2 };
        `;
        expect(objTest({ includeObjects: true })).to.equal(expected);
      });

      it("should get the snippet for objects if includeObjects is not true", () => {
        const expected = dedent`\n
          export const OtherStoryObj: ComponentStoryObj<typeof SomeStory> = {
           <SomeComponent {...args} prop={1} />
          };
          OtherStoryObj.args = { prop2: 2 };
        `;
        expect(objTest({})).to.equal("<OtherStoryObj prop={1} />");
      });
    });

    it("should return the snippet if anything goes wrong", () => {
      const result = basicTest(
        "import type { ComponentStory } from '@storybook/react'",
        900,
        1100
      );
      const expected = "<SomeComponent prop={1} />";
      expect(result).to.equal(expected);
    });
  });
});
