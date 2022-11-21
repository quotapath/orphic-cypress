/**
 * Utilities for executing all cypress tests within a single describe block
 * as opposed to `useIsolatedComponentFiles` option which uses a typescript
 * transformer to make the story files themselves into cypress tests.
 *
 * If you're opting for `useIsolatedComponentFiles` or have provided `false`
 * for all format configs such that you only want to support external test
 * files, then you won't need anything in here.
 */
import * as fs from "fs";
import * as path from "path";
import { useIsolatedComponentFiles } from "./config";
import { executeCyTests } from "./execute";
import { StoryFileCy } from "./types";

/**
const defaultRequireFileCallback = (
  fullFilePath: string
): StoryFileCy | undefined => {
  const replaced = fullFilePath
    .replace("src/app/", "")
    .replace("src/common/", "");
  // We have to give webpack a little bit to hook onto, so we remove
  // the module entrypoint and include that directly as a string to `require`
  if (fullFilePath.startsWith("src/app")) {
    return require("app/" + replaced);
  }
  if (fullFilePath.startsWith("src/common")) {
    return require("common/" + replaced);
  }
  return;
};
*/

/**
 * Execute all tests as part of one large cypress describe block.
 * Put it into a file like `mount.cy.ts` with
 *
 * ```ts
 * import { mountTest } from "./test";
 *
 * // if the full file needs to be skipped for some reason, instead of just
 * // putting `cySkip: true` on the default export for that file. E.g. if
 * // the file uses webpack plugins that you don't want to bother with
 * const skipFiles = [
 *   "src/common/components/SomeComponent/index.stories.tsx",
 *   "src/app/other/component/index.stories.tsx",
 * ];
 * mountTest(skipFiles);
 * ```
 */
export const mountTest = (
  /**
   * Any *.stories.tsx files with their full paths from root dir through to filetype suffix
   */
  skipFiles?: string[],
  /**
   * Transform the full file path into the imported module. This can be tricky
   * b/c webpack needs some manual text to hook in properly. See `defaultRequireFileCallback`
   */
  requireFileCallback = (fullFilePath: string): StoryFileCy | undefined =>
    require(fullFilePath),
  /** Text passed to cypress's describe block */
  description = "mount all storybook files"
) => {
  describe(description, () => {
    Cypress.env("storybookFiles").forEach((file: string) => {
      if (skipFiles?.includes(file)) return;
      const stories = requireFileCallback(file);
      if (!stories || !stories.default) {
        throw new Error(
          `No stories found! you may want to add this to skipFile: ${file}`
        );
      }
      executeCyTests(stories, stories.default.title || file);
    });
  });
};

/**
 * Recursively look for files in a provided directory that include `.stories.ts`.
 * Could be done easily with the `glob` library, but this is simple enough to
 * keep locally maintained. See `setStorybookFiles` for use innside `setupNodeEvents`
 */
export const getStorybookFiles = (dir: string): string[] =>
  fs.readdirSync(dir).flatMap((file) => {
    const absolute = path.join(dir, file);
    if (fs.statSync(absolute).isDirectory()) {
      return getStorybookFiles(absolute);
    }
    return absolute.includes(".stories.ts") ? [absolute] : [];
  });

/**
 * Get storybook files recursively, then make them available at
 * `Cypress.env("storybookFiles")`. Put this in `setupNodeEvents` if either
 * opting for the mountTest style of tests or if you want to maintain the
 * option of switching to isolated component files.
 *
 * Drop in to `setupNodeEvents` for `component` tests in cypress.config.ts
 * If this is the only thing you're doing there, could look like
 * `setupNodeEvents: setStorybookFiles`. Otherwise:
 *
 * ```ts
 * setupNodeEvents: (on, config) => {
 *   on.task({...});
 *   setStorybookFiles(on, config);
 *   config.env.something = "something";
 *   return config; // be sure to return config
 * },
 * ```
 */
export const setStorybookFiles = (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions
): Cypress.PluginConfigOptions => {
  if (!useIsolatedComponentFiles) {
    config.env.storybookFiles = getStorybookFiles(
      config.env.storyLocation || "./src/"
    );
  }
  return config;
};
