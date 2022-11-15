import React from "react";
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

export const CallExplicitArgtypeActionStub = () => <ClickCount />;
CallExplicitArgtypeActionStub.argTypes = {
  onClick: { action: "myClickStub" },
};
// story-code @end @include-start

export const CallImplicitArgtypeActionStubViaRegex: ComponentStoryObjCy<
  typeof ClickCount
> = {
  args: { label: "Call via Regex" },
};
