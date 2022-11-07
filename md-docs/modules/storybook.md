# Module: storybook

## Functions

### CustomDocsStory

▸ **CustomDocsStory**(`props`, `context?`): ``null`` \| `ReactElement`<`any`, `any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `PropsWithChildren`<`DocsStoryProps`\> |
| `context?` | `any` |

#### Returns

``null`` \| `ReactElement`<`any`, `any`\>

#### Defined in

node_modules/@types/react/index.d.ts:548

___

### CustomStories

▸ **CustomStories**(): ``null`` \| `Element`

#### Returns

``null`` \| `Element`

#### Defined in

[src/storybook/page.tsx:44](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/storybook/page.tsx#L44)

___

### DocsPage

▸ `Private` **DocsPage**(`props`, `context?`): ``null`` \| `ReactElement`<`any`, `any`\>

This storybook uses nearly the same components for every story as a mechanism
for testing. So we can forgo showing the arg table or component at all, opting
instead just for the story's description and code block, if provided (default
code blocks were essentially useless)

#### Parameters

| Name | Type |
| :------ | :------ |
| `props` | `Object` |
| `context?` | `any` |

#### Returns

``null`` \| `ReactElement`<`any`, `any`\>

#### Defined in

node_modules/@types/react/index.d.ts:548
