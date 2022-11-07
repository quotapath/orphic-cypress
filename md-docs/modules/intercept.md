# Module: intercept

## Functions

### mockToCyIntercept

▸ **mockToCyIntercept**(`mockData`): `void`

Turn mockData intended for storybook plugin storybook-addon-mock
into cypress intercepts. Very likely to be used in a beforeEach.
Aliases as the url provided for each mock. Nothing crazy happening
here, you could just write `cy.intercept`s for non-storybook component
tests, or nbd to have ones that are redundant of mockData

#### Parameters

| Name | Type |
| :------ | :------ |
| `mockData` | { `method`: `string` ; `response`: `unknown` ; `status`: `number` ; `url`: `string`  }[] |

#### Returns

`void`

#### Defined in

[src/intercept.ts:10](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/intercept.ts#L10)
