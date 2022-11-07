# Module: actions

Utilities to provide cypress stubs for storybook actions.
This will mock all explicitly defined argTypes in any location.

Happens automatically for `executeCyTests`, but would be executed
manually for external test files.

## Type Aliases

### Stories

Ƭ **Stories**: `Object`

#### Index signature

▪ [name: `string`]: [`ComponentStoryCy`](types.md#componentstorycy)<`any`\> \| [`ComponentStoryObjCy`](types.md#componentstoryobjcy)<`any`\>

#### Defined in

[src/actions.ts:61](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/actions.ts#L61)

___

### WrappedActions

Ƭ **WrappedActions**: `Object`

Object of function name keys to stubbed actions values.
Might be more likely that you'd access these stubs via `cy.get("@actions")`

#### Index signature

▪ [fnName: `string`]: `ReturnType`<typeof `cy.stub` \| typeof `cy.spy`\>

#### Defined in

[src/actions.ts:22](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/actions.ts#L22)

## Functions

### stubStoryActions

▸ **stubStoryActions**<`T`\>(`composedStory`, `stories`): [`WrappedActions`](actions.md#wrappedactions)

Get argTypes from both the default export and the individual story.
Useful for a per-component beforeEach or top-of-test declaration.
Note that you'll want to return undefined from `beforeEach`

```ts
describe("SomeComponent", () => {
  beforeEach(() => {
    stubStoryActions(SomeComponent, stories);
  });

  it("should render ok and call someAction on init", () => {
    cy.mount(<SomeComponent {...this.actions} />);
    cy.get("@actions").its("someAction").should("be.calledWith", "");
  });
});
```

```ts
it("should do something", () => {
  // could just be `const actions = { someAction: cy.stub(), ... }`
  const actions = stubStoryActions(SomeStory, stories);
  cy.mount(<SomeStory {...actions} />);
  cy.dataCy("something").click().then(() => {
    expect(actions.someAction).to.have.callCount(1);
  });
  // or without the promise
  cy.dataCy("something").click();
  cy.get("@actions").its("someAction").should("have.callCount", 2);
});
```

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`StoryFileCy`](types.md#storyfilecy) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `composedStory` | [`ComponentStoryCy`](types.md#componentstorycy)<`any`\> \| [`ComponentStoryObjCy`](types.md#componentstoryobjcy)<`any`\> |
| `stories` | `T` |

#### Returns

[`WrappedActions`](actions.md#wrappedactions)

#### Defined in

[src/actions.ts:152](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/actions.ts#L152)
