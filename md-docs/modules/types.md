# Module: types

## Type Aliases

### ComponentStoryCy

Ƭ **ComponentStoryCy**<`T`\>: `ComponentStory`<`T`\> & [`WithCy`](types.md#withcy)<`T`\>

Drop this in where you would normally see ComponentStory type to add
cypress controls to storybook stories in the story format.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof `JSX.IntrinsicElements` \| `JSXElementConstructor`<`any`\> |

#### Defined in

[src/types.ts:29](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/types.ts#L29)

___

### ComponentStoryObjCy

Ƭ **ComponentStoryObjCy**<`T`\>: `ComponentStoryObj`<`T`\> & [`WithCy`](types.md#withcy)<`T`\>

Drop this in where you would normally see ComponentStoryObj type to add
cypress controls to storybook stories in the object format.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends keyof `JSX.IntrinsicElements` \| `JSXElementConstructor`<`any`\> |

#### Defined in

[src/types.ts:37](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/types.ts#L37)

___

### StoryFileCy

Ƭ **StoryFileCy**: `StoryFile` & { `default`: [`StoryFileCyExtension`](types.md#storyfilecyextension)  }

Adds to default export of storybook files. Likely not too necessary externally

#### Defined in

[src/types.ts:65](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/types.ts#L65)

___

### StoryFileCyExtension

Ƭ **StoryFileCyExtension**: `Object`

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cy?` | () => `void` | Add a function to execute within cypress. Can contain setup `beforeEach` etc |
| `cyOnly?` | ``true`` | Add cyOnly to default export to use `describe.only` for these story tests |
| `cyOverrideInclude?` | ``true`` \| `string`[] | You could specify this as a way of not skipping, but completely ignoring some/all stories.  If it is a string, then it will simply replace the `includeStories`.  If it is true, then it remove includeStories, which is useful for a special case when using an mdx file as source of documentation but writing components in CSF. You'll want to have have default export `includeStories: []` but then will need to specify this (unless using an external test file) in order for `composeStories` to pick up the stories properly see [DocsInMDX story](/cypress-storybook-component-tests/storybook/?path=/docs/docs-in-mdx--docs-in-mdx) |
| `cySkip?` | ``true`` | Add cySkip to default export to use `describe.skip` for these story tests |

#### Defined in

[src/types.ts:41](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/types.ts#L41)

___

### WithCy

Ƭ **WithCy**<`T`\>: `Object`

Additional properties which can be added to stories to control cypress

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type | Description |
| :------ | :------ | :------ |
| `cy?` | () => `void` \| { `[itTestText: string]`: () => `void`;  } | Either a function directly, or an object of test description keys to test function values. A major advantage here is there is no need to `mount` or pass mocked actions to the component just write some assertions |
| `cyOnly?` | ``true`` | use it.only for the test(s) for this component |
| `cySkip?` | ``true`` | use it.skip for the test(s) for this component |
| `cyTest?` | (`comp`: `T`) => `void` | Write a function that will execute within cypress and so can contain `it`, `beforeEach`, `it.skip` etc |

#### Defined in

[src/types.ts:6](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/types.ts#L6)
