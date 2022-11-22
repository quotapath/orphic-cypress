import type { ComponentStory, ComponentStoryObj } from "@storybook/react";
import type { StoryFile } from "@storybook/testing-react/dist/types";
import type { JSXElementConstructor } from "react";

/** Function which expects no arg and returns void */
export type VoidFn = () => void;
/** A test function where `cy` is available */
export type CyTest = VoidFn;
/** .cy format with object syntax where keys are `it` descriptions */
export type CyObj = {
  [itTestText: string]: CyTest;
};
/** .cyTest property, as opposed to .cy with a test */
export type CyTestProp<T> = (comp: T) => void;
/** Additional properties which can be added to stories to control cypress */
export type WithCy<T> = {
  /**
   * Either a function directly, or an object of test description
   * keys to test function values. A major advantage here is there
   * is no need to `mount` or pass mocked actions to the component
   * just write some assertions
   */
  cy?: CyTest | CyObj;
  /**
   * Write a function that will execute within cypress and so can
   * contain `it`, `beforeEach`, `it.skip` etc
   */
  cyTest?: CyTestProp<T>;
  /** use it.only for the test(s) for this component */
  cyOnly?: boolean;
  /** use it.skip for the test(s) for this component */
  cySkip?: boolean;
};

/**
 * Drop this in where you would normally see ComponentStory type to add
 * cypress controls to storybook stories in the story format.
 */
export type ComponentStoryCy<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = ComponentStory<T> & WithCy<T>;

/**
 * Drop this in where you would normally see ComponentStoryObj type to add
 * cypress controls to storybook stories in the object format.
 */
export type ComponentStoryObjCy<
  T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>
> = ComponentStoryObj<T> & WithCy<T>;

/** Extensions to the default export from storybook files */
export type StoryFileCyExtension = {
  /** Add a function to execute within cypress. Can contain setup `beforeEach` etc */
  cy?: VoidFn;
  /** Add cySkip to default export to use `describe.skip` for these story tests */
  cySkip?: boolean;
  /** Add cyOnly to default export to use `describe.only` for these story tests */
  cyOnly?: boolean;
  /**
   * You could specify this as a way of not skipping, but completely ignoring some/all
   * stories.
   *
   * If it is an array of strings, then it will simply replace the `includeStories`.
   *
   * If it is true, then it remove includeStories, which is useful for a
   * special case when using an mdx file as source of documentation but writing
   * components in CSF. You'll want to have have default export `includeStories: []`
   * but then will need to specify this (unless using an external test file) in
   * order for `composeStories` to pick up the stories properly
   * see [DocsInMDX story](/orphic-cypress/storybook/?path=/docs/docs-in-mdx)
   */
  cyIncludeStories?: boolean | string[];
};

/** Adds to default export of storybook files. Likely not too necessary externally */
export type StoryFileCy = StoryFile & {
  /** normal default export from storybook with extensions */
  default: StoryFileCyExtension;
};
