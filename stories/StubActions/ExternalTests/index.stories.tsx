import type { ComponentStoryObjCy } from "src";
import { ClickCount } from "../../Button";

export default {
  component: ClickCount,
  cySkip: true as const,
  // when using an external file, the argTypesRegex doesn't get brought in from main 'parameters'
  // so you either have to add this, or manually provide the global preview to `composeStories`
  // parameters: {
  //   actions: {
  //     argTypesRegex: "^on[A-Z].*",
  //   },
  // },
};

export const CallExplicitArgtypeActionStubAutomatically: ComponentStoryObjCy<
  typeof ClickCount
> = {
  argTypes: {
    onClick: { action: "myClickStub" },
  },
};

export const CallImplicitArgtypeActionStubAutomaticallyViaRegex: ComponentStoryObjCy<
  typeof ClickCount
> = {};
