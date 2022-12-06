import { setGlobalConfig } from "@storybook/testing-react";
import { mount } from "cypress/react";
import "@bahmutov/cypress-code-coverage/support";

import * as commands from "./commands";
import * as tasks from "./tasks";
import { Tasks, addCommands, addTasks } from "../../src/cypress";
import * as sbPreview from "../../.storybook/preview";

const commandsWithMount = { ...commands, mount };

setGlobalConfig(sbPreview);
addCommands(commandsWithMount);
addTasks(tasks);

/* eslint-disable @typescript-eslint/no-namespace */
type Commands = typeof commandsWithMount & Tasks<typeof tasks>;
declare global {
  namespace Cypress {
    interface Chainable extends Commands {
      mount(el: JSX.Element): null;
    }
  }
}
