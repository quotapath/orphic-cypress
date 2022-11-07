# Module: cypress

## Type Aliases

### TaskFn

Ƭ **TaskFn**: () => `any` \| (`arg`: `any`) => `any`

#### Defined in

[src/cypress/add.ts:50](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/cypress/add.ts#L50)

___

### Tasks

Ƭ **Tasks**<`T`\>: { [Key in keyof T]: Parameters<T[Key]\>[0] extends undefined ? Function : Function }

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Defined in

[src/cypress/add.ts:52](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/cypress/add.ts#L52)

## Functions

### addCommands

▸ **addCommands**<`T`\>(`commands`): `void`

Add cypress commands from raw typescript functions.
This allows smaller definition footprints while keeping documentation
and go to definition IDE utils.

```ts
// original
Cypress.Commands.add('clickLink', (label) => {
  cy.get('a').contains(label).click()
});
// with addCommands
export const clickLink = (label: string) =>
  cy.get('a').contains(label).click();
// likely create object with `import * as commands from ...`
const commands = { clickLink };
addCommands(commands);
// type def
type Commands = typeof commands;
declare global {
  namespace Cypress {
    interface Chainable extends Commands {
      // can still put types here defined in the old Cypress.Commands.add way
      getInDocument(selector: string): Chainable;
      // overwrite default type, should really accept string | number
      type(text: string | number, options?: Partial<TypeOptions>): Chainable;
    }
  }
}
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Record`<`string`, `any`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `commands` | `T` |

#### Returns

`void`

#### Defined in

[src/cypress/add.ts:35](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/cypress/add.ts#L35)

___

### addTasks

▸ **addTasks**<`T`\>(`tasks`): `void`

Add cypress tasks defined as commands so that
```ts
cy.task("doSomething", 1)
// becomes
cy.doSomething(1)
```
with type support and go to definition IDE utils.

```ts
// likely create object with `import * as tasks from ...`
const tasks = { getUUID: () => 'a uuid' };
addTasks(tasks);
// type def, see above `addCommands` for further namespace extension details
type Commands = typeof commands & Tasks<typeof tasks>;
declare global { // ...
```
afterwards, tasks will be available as commands that return well-typed promises
```ts
cy.getUUID().then(uuid => ...)`
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `tasks` | `T` |

#### Returns

`void`

#### Defined in

[src/cypress/add.ts:80](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/cypress/add.ts#L80)
