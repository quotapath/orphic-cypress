import * as React from "react";
import type { ComponentStoryCy } from "src";
import { Button } from "../../Button";

export default { component: Button, cyIncludeStories: [] };

export const WillFetch: ComponentStoryCy<typeof Button> = (args) => {
  const [label, setLabel] = React.useState("loading");
  React.useEffect(() => {
    fetch("/api/label")
      .then((result) => {
        if (result.ok) return result.json();
        if (result.status === 404) throw new Error("Not Found!");
        throw new Error("Not ok!");
      })
      .then((result) => setLabel(result.data))
      .catch((error) => setLabel(error.toString()));
  }, []);
  return <Button {...args} label={label} />;
};

WillFetch.parameters = {
  mockData: [
    {
      url: "/api/label",
      method: "GET",
      status: 200,
      response: { data: "Loaded" },
    },
  ],
  // story-code @skip-start
  docs: {
    description: {
      story: `External tests will need to manually call \`cy.intercept\` or
\`mockToCyIntercept(Story.parameters.mockData)\``,
    },
  }, // story-code @skip-end
};
// story-code @end
