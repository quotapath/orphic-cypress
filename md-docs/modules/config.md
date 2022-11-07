# Module: config

Configration and environment variables to enable isolated files or to
opt out of specific or all storybook file formats

## Type Aliases

### CyTestConfig

Ƭ **CyTestConfig**: `Object`

Configure the cypress storybook test runner.
You can put this in config object e.g.
```ts
// in cypress.config.ts
export defineConfig({
  // ... other config
  component: {
    env: {
      cyTest: {
        format: {
          cyTest: false,
          object: false,
          function: true,
        }
      }
    }
  }
});
```
or similarly in setupNodeEvents via `config.env.cyTest.format.object = false` etc.

Provide format.cyTest to disable adding `.cyTest` format tests to stories,
format.object to disable `.cy = {"should x", () => ...}`, format.function to
disable `.cy = () => ...`. If false is provided for all three, then tests must
be kept in external files.

Default is `true` for all values.

#### Type declaration

| Name | Type |
| :------ | :------ |
| `format?` | { `cyTest?`: `boolean` ; `function?`: `boolean` ; `object?`: `boolean`  } |
| `format.cyTest?` | `boolean` |
| `format.function?` | `boolean` |
| `format.object?` | `boolean` |

#### Defined in

[src/config.ts:46](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/config.ts#L46)

## Variables

### useIsolatedComponentFiles

• `Const` **useIsolatedComponentFiles**: `undefined` \| `string` = `process.env.CYPRESS_USE_ISOLATED_CT_FILES`

Option to make each *.stories.tsx file into a test file, whereas omitting
means all test files will need to be gathered as exports and executed
via a mount.cy.ts file which gathers all exports from these files and
iterates over them.

#### Defined in

[src/config.ts:14](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/config.ts#L14)
