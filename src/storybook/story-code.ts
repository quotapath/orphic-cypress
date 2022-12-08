import type { LocationsMap } from "@storybook/source-loader";
import type { StoryContext } from "@storybook/types";

const regex = {
  /** Any comment syntax (really, with any number of stars) with story-code at start */
  init: "(//|/\\*+)(\\s+)?story-code(\\s+?)",
  /**
   * Include from start of file to after default block,
   * can be defined on @end line or 1 after end
   */
  includeStart: "@include-start",
  /** Include the default block, can be defined on @end line or 1 after end */
  includeDefault: "@include-default",
};

/**
 * Create named capture groups for @skip-end etc. A match but no groups
 * means its a normal `@skip` line with no suffix
 */
const skipRegex = (() => {
  const skipParts = ["end", "start", "next"] as const;
  const skipJoin = skipParts.map((name) => `(?<${name}>-${name})`).join("|");
  return new RegExp(`${regex.init}@skip(${skipJoin})?`, "gm");
})();

/**
 * Remove lines with @skip, after @skip-next or between @skip-start and
 * @skip-end, all starting with `// story-code `
 *
 * @private
 */
export const removeSkips = (codeLines: string[]) => {
  const skip = { next: false, block: false };
  const lines = [];

  for (const line of codeLines) {
    const groups = line.matchAll(skipRegex).next().value?.groups as
      | Record<"end" | "start" | "next", string | undefined>
      | undefined;
    if (skip.block) {
      if (groups?.end) skip.block = false;
    } else if (groups?.start) {
      skip.block = true;
    } else if (groups?.next) {
      skip.next = true;
    } else if (skip.next) {
      skip.next = false;
    } else if (groups === undefined) {
      lines.push(line);
    }
  }
  return lines;
};

/**
 * Story context augmented by storysource addon
 */
export type StoryContextStorySource = StoryContext & {
  /** parameters extension */
  parameters: {
    /** what's added by storysource */
    storySource: {
      /** full file as a single string */
      source: string;
      /** start/end locations of stories in above source */
      locationsMap: LocationsMap;
    };
  };
};

/** Options available for story-code's `transformSource` */
export type TransformSourceOptions = {
  /**
   * storysource doesn't handle ComponentStoryObj syntax well, failing to provide a
   * location. Passing in `true` here will mean the code block in the story docs
   * will attempt to include the object itself, overcomming that issue.
   */
  includeObjects?: boolean;
};

const getDataFromStoryObject = (
  name: string,
  allLines: string[]
): [string, any] => {
  const componentName = name.replace(/ /g, "");
  // Naive attempt to fix object syntax source
  const startIndex = allLines.findIndex((line) =>
    new RegExp(`export const ${componentName}`).test(line)
  );
  const endIndex = allLines
    .slice(startIndex)
    .findIndex((line) => /^};/.test(line));
  return [
    componentName,
    {
      startLoc: { col: 0, line: startIndex },
      endLoc: { col: 0, line: endIndex + startIndex + 1 },
    },
  ];
};

/** Some super simple validation on the location lines */
const validateLocation = (
  allLines: string[],
  startLine: number,
  endLine: number
) => {
  if (allLines.length < startLine) {
    throw new Error(
      `Start line of ${startLine} exceeds file length of ${allLines.length}`
    );
  }
  if (allLines.length < endLine) {
    throw new Error(
      `End line of ${endLine} exceeds file length of ${allLines.length}`
    );
  }
};

/** check the comment line and end line for a given directive */
const checkForDirective =
  (linesFromStart: string[], endLineComment: number, endLoc: number) =>
  (re: keyof typeof regex): boolean =>
    new RegExp(regex[re]).test(linesFromStart[endLineComment]) ||
    new RegExp(`${regex.init}${regex[re]}`).test(linesFromStart[endLoc]);

/**
 * Add comment directives that will enable transforming the story source code
 * into the code snippet for the story.
 *
 * Relies on storysource addon
 *
 * Notable issues:
 * * if a story is all object syntax, then it won't have
 *   a storySource at all. That's likely a limitation of source-loader.
 * * If a story name is very long, story-loader's handling can get weird
 *
 * TODO: some notable naive approaches here. Could parse AST to get
 * the default export, to automatically include assignments to stories, or
 * to better parse story objects.
 *
 * TODO: Some of this might be suitable contribution to storysource, but
 * the goals there often different, e.g. to show how to use a component
 * whereas here we're showing how to build stories.
 *
 * TODO: ideas include-render, include-template, include-region
 *
 * All comments start with `// story-code` or with `/*` or `/**` style
 * single line comments. So `// story-code @end SomeComponent @include-default`
 * for example.
 *
 * ## Available commands:
 * * `@end`: end the previous story's code block. Note, this is works across
 *   stories such that any story which does not specify its end which begins
 *   before this use will end at this point. Use named end's if you need specificity
 *   ```ts
 *   const SomeStory: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
 *   SomeStory.args = { prop: 1 };
 *   // story-code @end
 *   ```
 * * `@end SomeComponent`: same as above, but only mark the end for the given component
 *   ```ts
 *   const SomeStory: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
 *   const OtherStory: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
 *   OtherStory.args = { prop: 1 };
 *   // story-code @end OtherStory
 *   ```
 * * `@include-default`: include the default code export. Can occur in an `@end` line
 *   or on the line following a natural or designated end.
 *   ```ts
 *   const SomeStory: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
 *   SomeStory.args = { prop: 1 };
 *   // story-code @end @include-default
 *   ```
 * * `@include-start`: include from the top of the file through to the default code export.
 *   Can occur in an `@end` line or on the line following a natural or designated end.
 *   ```ts
 *   const SomeStory: ComponentStory<typeof Comp> = (args) => <Comp {...args} />;
 *   // story-code @include-start
 *   ```
 * * `@skip`: Skip the current line
 *   ```ts
 *   const somethingToIgnore = 1; // story-code @skip
 *   ```
 * * `@skip-next`: Skip the next line
 *   ```ts
 *   // story-code @skip-next
 *   const somethingToIgnore = 1;
 *   ```
 * * `@skip-start` and `@skip-end`: Skip a block of text, e.g.
 *   ```ts
 *   // story-code @skip-start
 *   const hideThis = 1;
 *   const andThis = 2;
 *   // story-code @skip-end
 *   ```
 *   There's nothing enforcing that you have to have a @skip-end if you have a @skip-start
 */
export const transformSource =
  (opts: TransformSourceOptions = {}) =>
  /** Inner function which can be assigned to docs.transformSource */
  (snippet: string, storyContext: StoryContextStorySource): string => {
    try {
      const {
        parameters: {
          storySource: { source, locationsMap },
        },
        originalStoryFn,
        id,
        name,
      } = storyContext;
      let componentName = originalStoryFn.name;

      const locationKey = id.split("--")[1];
      let location = locationsMap[locationKey];
      const allLines = source.split("\n");

      if (!location && opts.includeObjects) {
        [componentName, location] = getDataFromStoryObject(name, allLines);
      }

      const {
        startLoc: { line: startLine },
        endLoc: { line: endLine },
      } = location;

      validateLocation(allLines, startLine, endLine);

      const linesFromStart = allLines.slice(startLine - 1);
      const endLineComment = linesFromStart.findIndex((line) =>
        new RegExp(`${regex.init}@end(\\s+)?($|@|${componentName})`).test(line)
      );
      const endLoc =
        endLineComment > 0 ? endLineComment : endLine - startLine + 1;

      const [includeDefault, includeStart] = (
        ["includeDefault", "includeStart"] as const
      ).map(checkForDirective(linesFromStart, endLineComment, endLoc));

      let defaultLines: string[] = [];

      if (includeDefault || includeStart) {
        // This is pretty naive
        const defaultStartIndex = allLines.findIndex((line) =>
          /export default {/.test(line)
        );
        if (defaultStartIndex !== -1) {
          const linesFromDefaultStart = includeStart
            ? allLines
            : allLines.slice(defaultStartIndex);
          if (allLines[defaultStartIndex]?.includes("};")) {
            defaultLines = [...linesFromDefaultStart.slice(0, 1), ""];
          } else {
            const endDefaultLine = linesFromDefaultStart.findIndex((line) =>
              /^};$/.test(line)
            );
            if (endDefaultLine > 0) {
              defaultLines = linesFromDefaultStart.slice(0, endDefaultLine + 1);
              if (defaultLines.at(-1) !== "") {
                defaultLines = [...defaultLines, ""];
              }
            }
          }
        }
      }

      return removeSkips([
        ...defaultLines,
        ...linesFromStart.slice(0, endLoc),
      ]).join("\n");
    } catch (e) {
      console.warn(
        "Something went wrong while getting the story source for code snippet",
        e
      );
      return snippet;
    }
  };
