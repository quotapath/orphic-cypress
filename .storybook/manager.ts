import { addons } from "@storybook/addons";
import { startCase } from "lodash";
import theme from "./theme";

addons.setConfig({
  theme,
  sidebar: {
    // put spaces in dir names as well
    renderLabel: ({ name }) => startCase(name),
  },
});
