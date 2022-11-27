import * as React from "react";

/**
 * Check if the first prop of a
 */
const isRawMd = (childProps: {
  mdxType?: string;
  children?: { props?: { className?: string } };
}): boolean =>
  childProps.mdxType === "pre" &&
  childProps.children?.props?.className === "language-md";

/** Rendered child, with props */
export type RenderedChild = any;
/** mdx component as it exists after importing via `import someMdx from "./some.mdx"` */
export type MDX = (props: unknown) => RenderedChild;
/** Object gathered for each header */
export type ParsedMDX = {
  /** Full content of this segment of markdown including the header */
  full: RenderedChild[];
  /** Content of this segment of markdown excluding header */
  body: RenderedChild[];
  /** Raw string extracted from 'md' code blocks */
  md: string;
};
/** Function returned for each header, with properties assigned for more specific use cases */
export type MDXSegment = {
  /** Function which is useful passed to parameters.docs.page directly */
  (): RenderedChild[];
} & ParsedMDX;
/** Header in kebab case as key to object of markdown segments */
export type HeaderKeyedMDXSegment = { [id: string]: MDXSegment };

const cache: Map<MDX, HeaderKeyedMDXSegment> = new Map();

/**
 * Split up an MDX files into headers for easy use in multiple parts of documentation
 * or in multiple files, with some added perks.
 *
 * Currently, this breaks on any header such that a file like
 * ```md
 * # First Component
 *
 * Something
 *
 * ## Second Component
 *
 * \`\`\`md
 * # Second header description
 * This second component does stuff
 * \`\`\`
 * ```
 * becomes essentially
 * ```ts
 * {
 *   "first-component": {
 *     full: [<h1>First Component</h1>,<p>Something</p>],
 *     body: [<p>Something</p>],
 *     md: "",
 *   },
 *   "second-component": {
 *     full: [<h1>Second Component</h1>,<p>Other</p>],
 *     body: [<code>....</code>],
 *     md: "# Second header description\nThis second component does stuff",
 *   },
 * }
 * ```
 * Although actually they'll be functions at those locations that also have those properties,
 * but is `() => full` at invocation. Note how it picks up md code blocks as raw text, suitable
 * for story descriptions.
 *
 *
 * Then you can use it like
 * ```ts
 * import mdx from "./some.mdx";
 * const mdxObject = segmentMDX(mdx);
 * // define FirstComponent...
 * FirstComponent.parameters = {
 *   docs: {
 *     page: mdxObject['first-component'],
 *   }
 * };
 * // define SecondComponent...
 * SecondComponent.parameters = {
 *   docs: {
 *     story: {
 *       description: mdxObject['second-component'].md,
 *     }
 *   }
 * };
 * ```
 *
 * And if you needed to combine them you could do something like
 * ```ts
 * docs: {
 *   page: () => [
 *     ...mdxObject["first-component"].full,
 *     ...mdxObject["second-component"].full,
 *   ]
 * }
 * ```
 *
 * Or, in an mdx file like so (real example):
 * ```mdx
 * import { Meta } from "@storybook/addon-docs";
 * import readme from "../../README.md";
 * import { segmentMDX } from "orphic-cypress";
 *
 * <Meta title="MockRequests/Overview" />
 *
 * <>{segmentMDX(readme)["intercepting-api-requests"].full}</>
 *
 * <-- more markdown -->
 * # Further afield
 * ```
 *
 * Uses a dead simple FIFO cache of size 50 just to avoid thinking about memory consumption issues.
 */
export const segmentMDX = (
  mdx: MDX,
  /** force skipping the cache */
  force?: boolean
): HeaderKeyedMDXSegment => {
  if (typeof mdx !== "function") return {};

  const fromCache = !force && cache.get(mdx);
  if (fromCache) return fromCache;

  const rendered = mdx({});

  let currentId = "file";

  const collection: { [id: string]: ParsedMDX } = {
    file: { full: [], body: [], md: "" },
  };

  React.Children.forEach(rendered.props.children, (child) => {
    if (/^h\d$/.test(child.props.mdxType)) {
      currentId = child.props.id;
      collection[currentId] = { full: [child], body: [], md: "" };
    } else if (collection[currentId]) {
      collection[currentId].full.push(child);
      collection[currentId].body.push(child);
      if (isRawMd(child.props)) {
        const rawMd = child.props.children.props.children;
        collection[currentId].md += rawMd;
      }
    }
  });
  const result = Object.fromEntries(
    Object.entries(collection).map(([k, v]): [string, MDXSegment] => [
      k,
      Object.assign(() => v.full, v),
    ])
  );

  // quick and dirty fifo
  if (cache.size === 50) {
    cache.delete(cache.keys().next().value);
  }
  cache.set(mdx, result);

  return result;
};
