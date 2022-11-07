# Module: execute

## Functions

### executeCyTests

▸ **executeCyTests**<`T`\>(`stories`, `describeText?`): `void`

Execute standard cypress tests against a set of storybook components.
If the storybook story or object is normal, then it will perform a simple
'mount' and expect no errors to throw. If the story or object has a `cy`
property, then the keys of that object will be used as 'it' descriptions
and each test there will be executed.

**`Throws`**

CyTestConfigError

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`StoryFileCy`](types.md#storyfilecy) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `stories` | `T` |
| `describeText?` | `string` |

#### Returns

`void`

#### Defined in

[src/execute.tsx:64](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/execute.tsx#L64)

___

### tComposeStories

▸ **tComposeStories**<`TModule`\>(`storiesImport`, `globalConfig?`): `Omit`<`StoriesWithPartialProps`<`TModule`\>, keyof `StoryFile`\>

A composeStories that carries over other keys as well as those from
@storybook/testing-react's version. The only important one is `argTypes`
which should come along in the built-in version.

If you are using storybook's version _and_ calling `stubStoryActions`
manually, you'll want to do
```ts
const { SomeComponent } = composeStories(stories);
stubStoryActions(SomeComponent, stories)
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `TModule` | extends `StoryFile` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `storiesImport` | `TModule` |
| `globalConfig?` | `GlobalConfig` |

#### Returns

`Omit`<`StoriesWithPartialProps`<`TModule`\>, keyof `StoryFile`\>

#### Defined in

node_modules/@storybook/testing-react/dist/index.d.ts:78
