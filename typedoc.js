const isHtml = process.env.IS_HTML;
/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
  entryPoints: ["src"],
  // make modules individual files
  entryPointStrategy: "expand",
  excludeExternals: true,
  name: "Cypress Storybook Component Tests",
  mergeModulesMergeMode: "module",
  // including these with module merge would just mean adding a bunch of 're-exports' lines
  exclude: ["**/*/index.ts"],
  treatWarningsAsErrors: true,
  ...(isHtml
    ? {
        plugin: ["typedoc-plugin-merge-modules"],
        out: "docs",
        githubPages: true,
        readme: "./README.md",
      }
    : {
        readme: "none",
        hideBreadcrumbs: true,
        hideInPageTOC: true,
        out: "md-docs",
        githubPages: false,
      }),
};
