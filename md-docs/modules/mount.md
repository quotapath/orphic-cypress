# Module: mount

## Functions

### getStorybookFiles

▸ **getStorybookFiles**(`dir`): `string`[]

Recursively look for files in a provided directory that include `.stories.ts`.
Could be done easily with the `glob` library, but this is simple enough to
keep locally maintained. See `setStorybookFiles` for use innside `setupNodeEvents`

#### Parameters

| Name | Type |
| :------ | :------ |
| `dir` | `string` |

#### Returns

`string`[]

#### Defined in

[src/mount.ts:85](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/mount.ts#L85)

___

### mountTest

▸ **mountTest**(`skipFiles?`, `requireFileCallback?`, `description?`): `void`

Execute all tests as part of one large cypress describe block.
Put it into a file like `mount.cy.ts` with

```ts
import { mountTest } from "./test";

// if the full file needs to be skipped for some reason, instead of just
// putting `cySkip: true` on the default export for that file. E.g. if
// the file uses webpack plugins that you don't want to bother with
const skipFiles = [
  "src/common/components/SomeComponent/index.stories.tsx",
  "src/app/other/component/index.stories.tsx",
];
mountTest(skipFiles);
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `skipFiles?` | `string`[] | `undefined` | Any *.stories.tsx files with their full paths from root dir through to filetype suffix |
| `requireFileCallback` | (`fullFilePath`: `string`) => `undefined` \| [`StoryFileCy`](types.md#storyfilecy) | `undefined` | Transform the full file path into the imported module. This can be tricky b/c webpack needs some manual text to hook in properly. See `defaultRequireFileCallback` |
| `description` | `string` | `"mount all storybook files"` | Text passed to cypress's describe block |

#### Returns

`void`

#### Defined in

[src/mount.ts:52](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/mount.ts#L52)

___

### setStorybookFiles

▸ **setStorybookFiles**(`on`, `config`): `PluginConfigOptions`

Get storybook files recursively, then make them available at
`Cypress.env("storybookFiles")`. Put this in `setupNodeEvents` if either
opting for the mountTest style of tests or if you want to maintain the
option of switching to isolated component files.

Drop in to `setupNodeEvents` for `component` tests in cypress.config.ts
If this is the only thing you're doing there, could look like
`setupNodeEvents: setStorybookFiles`. Otherwise:

```ts
setupNodeEvents: (on, config) => {
  on.task({...});
  setStorybookFiles(on, config);
  config.env.something = "something";
  return config; // be sure to return config
},
```

#### Parameters

| Name | Type |
| :------ | :------ |
| `on` | `PluginEvents` |
| `config` | `PluginConfigOptions` |

#### Returns

`PluginConfigOptions`

#### Defined in

[src/mount.ts:113](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/mount.ts#L113)
