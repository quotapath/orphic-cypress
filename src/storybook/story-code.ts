/**
 * @module story-code
 */
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
const getSkipRegex = () => {
  const skipParts = ["end", "start", "next"] as const;
  const skipJoin = skipParts.map((name) => `(?<${name}>-${name})`).join("|");
  return new RegExp(`${regex.init}@skip(${skipJoin})?`, "gm");
};
const skipRegex = getSkipRegex();

/**
 * Remove lines with @skip, after @skip-next or between @skip-start and
 * @skip-end, all starting with `// story-code `
 */
const removeSkips = (codeLines: string[]) => {
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
 * opt-in for object story support
 *
 * All comments start with `// story-code` or with `/*` or `/**` style
 * single line comments. So `// story-code @end SomeComponent @include-default`
 * for example.
 *
 * ## Available commands:
 * * `@end`: end the previous story's code block. Note, this is works across
 *   stories such that any story which does not specify its end which begins
 *   before this use will end at this point. Use named end's if you need specificity
 * * `@end SomeComponent`: same as above, but only mark the end for the given component
 * * `@include-default`: include the default code export. Can occur in an `@end` line
 *   or on the line following a natural or designated end.
 * * `@include-start`: include from the top of the file through to the default code export.
 *   Can occur in an `@end` line or on the line following a natural or designated end.
 * * `@skip`: Skip the current line, e.g. `const something = 1; // story-code @skip`
 * * `@skip-next`: Skip the next line
 * * `@skip-start` and `@skip-end`: Skip a block of text, e.g.
 *   ```ts
 *   // story-code @skip-start
 *   const hideThis = 1;
 *   const andThis = 2;
 *   // story-code @skip-end
 *   ```
 *   There's nothing enforcing that you have to have a @skip-end if you have a @skip-start
 */
export const transformSource = (
  snippet: string,
  storyContext: StoryContextStorySource
): string => {
  try {
    const { source, locationsMap } = storyContext.parameters.storySource;
    let componentName = storyContext.originalStoryFn.name;
    const locationKey = storyContext.id.split("--")[1];
    let location = locationsMap[locationKey];
    const allLines = source.split("\n");

    if (!location) {
      componentName = storyContext.name.replace(/ /g, "");
      // Naive attempt to fix object syntax source
      const startIndex = allLines.findIndex((line) =>
        new RegExp(`export const ${componentName}`).test(line)
      );
      const endIndex = allLines
        .slice(startIndex)
        .findIndex((line) => /^};/.test(line));
      location = {
        startLoc: { col: 0, line: startIndex },
        endLoc: { col: 0, line: endIndex + startIndex + 1 },
      } as any;
    }

    const linesFromStart = allLines.slice(location.startLoc.line - 1);
    const endLine = linesFromStart.findIndex((line) =>
      new RegExp(`${regex.init}@end(\\s+)?($|@|${componentName})`).test(line)
    );
    const endLoc =
      endLine > 0 ? endLine : location.endLoc.line - location.startLoc.line + 1;

    const includeDefault =
      new RegExp(regex.includeDefault).test(linesFromStart[endLine]) ||
      new RegExp(`${regex.init}${regex.includeDefault}`).test(
        linesFromStart[endLoc]
      );
    const includeStart =
      new RegExp(regex.includeStart).test(linesFromStart[endLine]) ||
      new RegExp(`${regex.init}${regex.includeStart}`).test(
        linesFromStart[endLoc]
      );

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
          defaultLines = [
            ...linesFromDefaultStart.slice(0, defaultStartIndex + 1),
            "",
          ];
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
    console.log(e);
    return snippet;
  }
};
