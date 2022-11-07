/**
 * @module cypress
 */

/**
 * Add cypress commands from raw typescript functions.
 * This allows smaller definition footprints while keeping documentation
 * and go to definition IDE utils.
 *
 * ```ts
 * // original
 * Cypress.Commands.add('clickLink', (label) => {
 *   cy.get('a').contains(label).click()
 * });
 * // with addCommands
 * export const clickLink = (label: string) =>
 *   cy.get('a').contains(label).click();
 * // likely create object with `import * as commands from ...`
 * const commands = { clickLink };
 * addCommands(commands);
 * // type def
 * type Commands = typeof commands;
 * declare global {
 *   namespace Cypress {
 *     interface Chainable extends Commands {
 *       // can still put types here defined in the old Cypress.Commands.add way
 *       getInDocument(selector: string): Chainable;
 *       // overwrite default type, should really accept string | number
 *       type(text: string | number, options?: Partial<TypeOptions>): Chainable;
 *     }
 *   }
 * }
 * ```
 */
export const addCommands = <T extends Record<string, any>>(commands: T) => {
  for (const [key, value] of Object.entries<
    Cypress.CommandFn<any> & {
      commandOptions: Cypress.CommandOptions & { prevSubject: false };
    }
  >(commands)) {
    const chainableKey = key as keyof Cypress.Chainable;
    if (value.commandOptions) {
      Cypress.Commands.add(chainableKey, value.commandOptions, value);
    } else {
      Cypress.Commands.add(chainableKey, value);
    }
  }
};

export type TaskFn = (() => any) | ((arg: any) => any);
// map as promise returning versions of the tasks
export type Tasks<T extends { [event: string]: TaskFn }> = {
  [Key in keyof T]: Parameters<T[Key]>[0] extends undefined
    ? () => Promise<ReturnType<T[Key]>>
    : (arg: Parameters<T[Key]>[0]) => Promise<ReturnType<T[Key]>>;
};

/**
 * Add cypress tasks defined as commands so that
 * ```ts
 * cy.task("doSomething", 1)
 * // becomes
 * cy.doSomething(1)
 * ```
 * with type support and go to definition IDE utils.
 *
 * ```ts
 * // likely create object with `import * as tasks from ...`
 * const tasks = { getUUID: () => 'a uuid' };
 * addTasks(tasks);
 * // type def, see above `addCommands` for further namespace extension details
 * type Commands = typeof commands & Tasks<typeof tasks>;
 * declare global { // ...
 * ```
 * afterwards, tasks will be available as commands that return well-typed promises
 * ```ts
 * cy.getUUID().then(uuid => ...)`
 * ```
 */
export const addTasks = <T extends { [event: string]: TaskFn }>(tasks: T) => {
  for (const key of Object.keys(tasks)) {
    const chainableKey = key as keyof Cypress.Chainable;
    const taskFn: any = (arg: any) => cy.task(key, arg);
    Cypress.Commands.add(chainableKey, taskFn);
  }
};
