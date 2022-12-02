import { setGlobalConfig } from "@storybook/testing-react";
import { mount } from "cypress/react";
import "@bahmutov/cypress-code-coverage/support";

import * as commands from "./commands";
import { addCommands } from "../../src/cypress";
import * as sbPreview from "../../.storybook/preview";

const commandsWithMount = { ...commands, mount };

setGlobalConfig(sbPreview);
addCommands(commandsWithMount);

/* eslint-disable @typescript-eslint/no-namespace */
type Commands = typeof commandsWithMount;
declare global {
  namespace Cypress {
    interface Chainable extends Commands {
      mount(el: JSX.Element): null;
    }
  }
}
