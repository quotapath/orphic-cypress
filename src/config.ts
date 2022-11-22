/**
 * Configration and environment variables to enable isolated files or to
 * opt out of specific or all storybook file formats
 *
 * @module config
 */

/**
 * Option to make each *.stories.tsx file into a test file, whereas omitting
 * means all test files will need to be gathered as exports and executed
 * via a mount.cy.ts file which gathers all exports from these files and
 * iterates over them.
 */
export const useIsolatedComponentFiles =
  process.env.CYPRESS_USE_ISOLATED_CT_FILES;

/**
 * Configure the cypress storybook test runner.
 * You can put this in config object e.g.
 * ```ts
 * // in cypress.config.ts
 * export defineConfig({
 *   // ... other config
 *   component: {
 *     env: {
 *       cyTest: {
 *         format: {
 *           cyTest: false,
 *           object: false,
 *           function: true,
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 * or similarly in setupNodeEvents via `config.env.cyTest.format.object = false` etc.
 *
 * Provide format.cyTest to disable adding `.cyTest` format tests to stories,
 * format.object to disable `.cy = {"should x", () => ...}`, format.function to
 * disable `.cy = () => ...`. If false is provided for all three, then tests must
 * be kept in external files.
 *
 * Default is `true` for all values.
 */
export type CyTestConfig = {
  /** top level key */
  format?: {
    /** disable .cyTest format */
    cyTest?: boolean;
    /** disable .cy object format */
    object?: boolean;
    /** disable .cy function format */
    function?: boolean;
  };
};
