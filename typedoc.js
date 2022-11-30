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
  name: "Orphic Cypress",
  mergeModulesMergeMode: "module",
  exclude: [
    // including these with module merge means adding a bunch of 're-exports' lines,
    // but its also the only way to get module docs from that index file
    // "**/*/index.ts",
    "src/index.ts",
    "**/*.cy.*",
  ],
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
