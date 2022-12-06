import { Canvas, Story } from "@storybook/addon-docs";

# Fully Skipped

You can full skip test files via the cySkip property on the default export.
If you need to completely ignore them instead of marking as pending, see
[cyIncludeFiles](/docs/ignoring-via-cyincludestories--not-skipped-function)

<Canvas>
  <Story id="skippingandselecting-fullyskipped--skipped" />
</Canvas>

<Canvas>
  <Story id="skippingandselecting-fullyskipped--another" />
</Canvas>

# Ignoring Via cyIncludeStories

```md
`cyIncludeStories` allows similar functionality to includeStories on the default export.
It can be used to ensure that only some stories are tested while the others don't
register with cypress at all, where [.cySkip](/docs/skippingandselecting-fullyskipped--skipped)
will designate them as 'pending'.
```
