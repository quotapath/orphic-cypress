# Module: transformers

## Functions

### transformIsolatedComponentFiles

▸ **transformIsolatedComponentFiles**(`executeCyTestsLocation?`): `TransformerFactory`<`SourceFile`\>

Transform a typescript stories file by adding `executeCyTests` to the bottom
with all exports explicitly passed in and the default recreated to be passed
in as 'default' prop.

In webpack, can use with ts-loader like so
```ts
{
  test: /\.[jt]sx?$/,
  exclude: [/node_modules/],
  use: [
    {
      loader: "ts-loader",
      options: {
        happyPackMode: true,
        transpileOnly: true,
        ...(useIsolatedComponentFiles && {
          getCustomTransformers: () => ({
            before: [transformIsolatedComponentFiles()],
          }),
        }),
      },
    },
  ],
}
```

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `executeCyTestsLocation` | `string` | `"cypress-storybook-component-tests"` | Location for `executeCyTests`. Defaults to this module, but you could import it elsewhere and change via pre/post call, or rewrite entirely and point to it from here |

#### Returns

`TransformerFactory`<`SourceFile`\>

#### Defined in

[src/transformers/isolated-component-files.ts:78](https://github.com/quotapath/cypress-storybook-component-tests/blob/aa91031/src/transformers/isolated-component-files.ts#L78)
