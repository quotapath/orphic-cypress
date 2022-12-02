/**
 * @module transformers
 */
import * as ts from "typescript";

/** becomes `import { executeCyTests } from "orphic-cypress"` */
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

type Source = ts.SourceFile & {
  symbol: {
    exports: Map<string, { declarations: ts.ExportAssignment[] }>;
  };
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
 *
 * TODO: docs for mdx
 */
export const transformIsolatedComponentFiles =
  (
    /**
     * Location for `executeCyTests`. Defaults to this module, but you could import it elsewhere
     * and change via pre/post call, or rewrite entirely and point to it from here
     */
    executeCyTestsLocation = "orphic-cypress",
    /** story filename pattern */
    storyPattern: string | RegExp = /\.stories|story\./
  ): ts.TransformerFactory<ts.SourceFile> =>
  (context) =>
  (source) => {
    const exports = (source as Source).symbol?.exports ?? new Map();
    const defaultExport = exports.get("default")?.declarations?.[0];

    const matches =
      source.fileName &&
      (storyPattern instanceof RegExp
        ? storyPattern.test(source.fileName)
        : source.fileName.includes(storyPattern));
    // docs only stories will have a ___page which intentionally throws an error
    if (!matches || !exports || exports.has("___page") || !defaultExport) {
      return source;
    }

    const exportKeys = [...exports.keys()].filter((name) => name !== "default");
    if (!exportKeys.length) return source;

    const { factory: f, getCompilerOptions } = context;
    const opts = getCompilerOptions();

    const newImport = createImportStatement(f, opts, executeCyTestsLocation);

    const newExportObject = f.createObjectLiteralExpression([
      f.createPropertyAssignment("default", defaultExport.expression),
      ...exportKeys.map((k) => f.createShorthandPropertyAssignment(k)),
    ]);

    /** becomes `executeCyCall({ default: {<default export obj>}, OtherStory, <...> })` */
    const executeCyCall = f.createCallExpression(
      f.createIdentifier("executeCyTests"),
      [],
      [newExportObject]
    ) as any as ts.Statement;

    const allStatements = [newImport, ...source.statements, executeCyCall];
    return f.updateSourceFile(source, allStatements);
  };
