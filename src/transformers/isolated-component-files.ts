/**
 * @module transformers
 */
import * as ts from "typescript";

/** becomes `import { executeCyTests } from "cypress-storybook-component-tests"` */
const createImportStatement = (
  factory: ts.NodeFactory,
  opts: ts.CompilerOptions,
  executeCyTestsLocation: string
) => {
  // handle commonjs module type as chosen in tsconfig.json
  if (opts.module === ts.ModuleKind.CommonJS) {
    return factory.createVariableStatement(
      /* modifiers */ undefined,
      factory.createVariableDeclarationList([
        factory.createVariableDeclaration(
          "executeCyTests",
          /* exclamation token */ undefined,
          /* type */ undefined,
          factory.createPropertyAccessExpression(
            factory.createCallExpression(
              factory.createIdentifier("require"),
              /* type arguments */ undefined,
              [factory.createStringLiteral(executeCyTestsLocation)]
            ),
            factory.createIdentifier("executeCyTests")
          )
        ),
      ])
    );
  }
  return factory.createImportDeclaration(
    /* modifiers */ undefined,
    factory.createImportClause(
      /* isTypeOnly */ false,
      /* name (so default import) */ undefined,
      factory.createNamedImports([
        factory.createImportSpecifier(
          /* isTypeOnly */ false,
          /* name (would mean `export { executeCyTests as })`) */ undefined,
          factory.createIdentifier("executeCyTests")
        ),
      ])
    ),
    factory.createStringLiteral(executeCyTestsLocation)
  );
};

/**
 * Transform a typescript stories file by adding `executeCyTests` to the bottom
 * with all exports explicitly passed in and the default recreated to be passed
 * in as 'default' prop.
 *
 * In webpack, can use with ts-loader like so
 * ```ts
 * {
 *   test: /\.[jt]sx?$/,
 *   exclude: [/node_modules/],
 *   use: [
 *     {
 *       loader: "ts-loader",
 *       options: {
 *         happyPackMode: true,
 *         transpileOnly: true,
 *         ...(useIsolatedComponentFiles && {
 *           getCustomTransformers: () => ({
 *             before: [transformIsolatedComponentFiles()],
 *           }),
 *         }),
 *       },
 *     },
 *   ],
 * }
 * ```
 */
export const transformIsolatedComponentFiles =
  (
    /**
     * Location for `executeCyTests`. Defaults to this module, but you could import it elsewhere
     * and change via pre/post call, or rewrite entirely and point to it from here
     */
    executeCyTestsLocation = "cypress-storybook-component-tests"
  ): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (source) => {
    const exports = (
      source as any as {
        symbol: {
          exports: Map<string, { declarations: ts.ExportAssignment[] }>;
        };
      }
    ).symbol?.exports;
    const defaultExport = exports?.get("default")?.declarations?.[0];
    if (
      !source?.fileName?.includes(".stories.ts") ||
      !exports ||
      !defaultExport
    ) {
      return source;
    }

    const { factory } = context;
    const opts = context.getCompilerOptions();

    const newImport = createImportStatement(
      factory,
      opts,
      executeCyTestsLocation
    );

    const newExportObject = factory.createObjectLiteralExpression([
      factory.createPropertyAssignment("default", defaultExport.expression),
      ...[...exports.keys()]
        .filter((name) => name !== "default")
        .map((name) => factory.createShorthandPropertyAssignment(name)),
    ]);

    /** becomes `executeCyCall({ default: {<default export obj>}, OtherStory, <...> })` */
    const executeCyCall = factory.createCallExpression(
      factory.createIdentifier("executeCyTests"),
      [],
      [newExportObject]
    ) as any as ts.Statement;

    const allStatements = [newImport, ...source.statements, executeCyCall];
    return factory.updateSourceFile(source, allStatements);
  };
