/**
 * @module bundlers
 */

const mdUse = (skipCsf: boolean) => [
  {
    loader: "babel-loader",
    options: {
      babelrc: false,
      configFile: false,
      presets: ["@babel/preset-env", "@babel/preset-react"],
    },
  },
  {
    loader: require.resolve("@storybook/mdx1-csf/loader"),
    options: { skipCsf },
  },
];

type SimplifiedUse = { loader?: string };
type SimplifiedRule = { use?: SimplifiedUse[] };

/**
 * This is likely a highly specialized use case for adding mdx functionality
 * and code coverage in the cypress.config.ts file. It assumes that you've
 * already added ts-loader to the webpack config file proper.
 */
export const cypressWebpackConfigMdx = (
  /** webpack config to be updated */
  config: any,
  /** add coverage via babel-loader + istanbul */
  coverage = true
) => {
  const rules = config.module?.rules || [];

  let indexOfTsLoader = -1;
  let tsLoaderRule: SimplifiedRule = {};
  let tsLoaderUse: SimplifiedUse = {};
  rules?.some((rule: { use: SimplifiedUse[] }, i: number) => {
    const loaderUse = rule?.use?.find(
      (useItem) => useItem.loader === "ts-loader"
    );
    if (loaderUse) {
      indexOfTsLoader = i;
      tsLoaderRule = rule;
      tsLoaderUse = loaderUse;
      return true;
    }
    return false;
  });

  if (indexOfTsLoader >= 0 && tsLoaderRule?.use !== undefined) {
    const tsLoaderRuleWithCoverage = coverage
      ? {
          ...tsLoaderRule,
          use: [
            {
              loader: "babel-loader",
              options: {
                plugins: ["istanbul"],
                babelrc: false,
                configFile: false,
              },
            },
            ...tsLoaderRule.use,
          ],
        }
      : tsLoaderRule;
    return {
      ...config,
      module: {
        ...config.module,
        rules: [
          ...[
            ...rules.slice(0, indexOfTsLoader),
            tsLoaderRuleWithCoverage,
            ...rules.slice(indexOfTsLoader + 1),
          ],
          // Required to support arbitary mdx imports in csf and mdx test files
          {
            test: /\.mdx$/,
            use: [tsLoaderUse, ...mdUse(false)],
          },
          {
            test: /\.md$/,
            use: mdUse(true),
          },
        ],
      },
    };
  }

  console.error(
    "cypressWebpackConfigMdx found no rule that used ts-loader, config will remain unchanged"
  );

  return config;
};
