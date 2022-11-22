// const isHtml = process.env.IS_HTML;
const isHtml = true;
/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
  entryPoints: ["src"],
  // make modules individual files
  entryPointStrategy: "expand",
  hideGenerator: true,
  excludeExternals: true,
  excludePrivate: true,
  name: "Cypress Storybook Component Tests",
  mergeModulesMergeMode: "module",
  // including these with module merge would just mean adding a bunch of 're-exports' lines
  exclude: ["**/*/index.ts", "src/storybook/**/{index,page}.ts{,x}"],
  navigationLinks: {
    Storybook: "https://quotapath.github.io/orphic-cypress/storybook/",
    Github: "https://github.com/quotapath/orphic-cypress",
  },
  validation: {
    invalidLink: true,
    // make sure everything is documented
    notDocumented: true,
    notExported: true,
  },
  treatWarningsAsErrors: true,
  ...(isHtml
    ? {
        plugin: ["typedoc-plugin-merge-modules"],
        out: "docs",
        githubPages: true,
        readme: "./README.md",
        searchInComments: true,
      }
    : {
        readme: "none",
        hideBreadcrumbs: true,
        hideInPageTOC: true,
        out: "md-docs",
        githubPages: false,
      }),
};
