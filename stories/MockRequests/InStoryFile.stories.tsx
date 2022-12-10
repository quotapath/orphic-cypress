import * as React from "react";
import type { ComponentStoryCy, ComponentStoryObjCy } from "orphic-cypress";
import { Button } from "stories";

export const WillFetch: ComponentStoryCy<typeof Button> = (args) => {
  const [label, setLabel] = React.useState("loading");
  React.useEffect(() => {
    fetch("/api/label?q=2")
      .then((result) => {
        if (result.ok) return result.json();
        throw new Error("Not ok!");
      })
      .then((result) => setLabel(result.data))
      .catch((error) => setLabel(error.toString()));
  }, []);
  return <Button {...args} label={label} />;
};

export default {
  component: Button,
  // bit of a weird pattern here to allow spread and work around storysource bug
  // where a functional story must be present for code locations to exist
  render: WillFetch,
};

WillFetch.cy = () => {
  cy.wait("@/api/label?q=2").then((interception) => {
    expect(interception.request.url).to.contain("q=2");
    // maybe not worth testing in reality considering we know what we've mocked
    expect(interception.response!.statusCode).to.equal(200);
    expect(interception.response!.body).to.deep.equal({ data: "Loaded" });
  });
};

WillFetch.parameters = {
  mockData: [
    {
      url: "/api/label?q=2",
      method: "GET",
      status: 200,
      response: { data: "Loaded" },
    },
  ],
  // story-code @skip-start
  docs: {
    description: {
      story: "Mock a simple API GET request via storybook-addon-mock",
    },
  }, // story-code @skip-end
};
// story-code @end

export const AliasedButWillFail = {
  ...WillFetch,
  parameters: {
    mockData: [
      {
        url: "/api/label?q=2",
        method: "GET",
        status: 500,
        response: { data: "Failed" },
        alias: "label",
      },
    ],
    // story-code @skip-start
    docs: {
      description: {
        story: `Will fail, but shows how to provide a specific label for a request.
NOTE: storybook docs only has the single request so you'll only see the one 'Loaded' label
on that tab. That's a known outcome of storybook-addon-mock.
`,
      },
    }, // story-code @skip-end
  },
  cy() {
    cy.wait("@label").then((interception) => {
      expect(interception.response!.statusCode).to.equal(500);
      expect(interception.response!.body).to.deep.equal({ data: "Failed" });
    });
  },
};

export const CyTestFormatAlsoAutoMocks: ComponentStoryObjCy<typeof Button> = {
  ...WillFetch,
  cyTest(Comp) {
    it("should require a manual call of `mockToCyIntercept`", () => {
      cy.mount(<Comp />);
      cy.wait("@/api/label?q=2").then((interception) => {
        expect(interception.response!.body).to.deep.equal({ data: "Loaded" });
      });
    });

    it("should allow manual intercept calls just fine", () => {
      // you could do this instead, here or in a beforeEach or in default `cy` param
      cy.intercept("GET", "/api/label?q=2", { body: { data: "Manual" } }).as(
        "manual"
      );
      cy.mount(<Comp />);
      cy.wait("@manual").then((interception) => {
        expect(interception.response!.body).to.deep.equal({ data: "Manual" });
      });
    });
  },
};
