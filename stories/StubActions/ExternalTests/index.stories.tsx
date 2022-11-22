import React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "src";
import { ClickCount } from "../../Button";

export default {
  component: ClickCount,
  cySkip: true,
  // when using an external file, the argTypesRegex doesn't get brought in from main 'parameters'
  // so you either have to add this, or manually provide the global preview to `composeStories`
  // parameters: {
  //   actions: {
  //     argTypesRegex: "^on[A-Z].*",
  //   },
  // },
};

export const ArgtypeActionStub: ComponentStoryCy<typeof ClickCount> = (
  args
) => <ClickCount {...args} />;
ArgtypeActionStub.argTypes = {
  onClick: { action: "myClickStub" },
};
// story-code @end @include-start

export const ImplicitArgtypeActionStubViaRegex: ComponentStoryObjCy<
  typeof ClickCount
> = {
  args: { label: "Call via Regex" },
};
