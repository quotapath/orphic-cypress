import * as React from "react";
import dedent from "ts-dedent";
import { ComponentStoryCy } from "../../src";

export const ArbitraryTask: ComponentStoryCy<any> = () => <></>; // story-code @skip
export default { component: ArbitraryTask }; // story-code @skip

ArbitraryTask.cy = {
  // story-code @skip
  "it should execute an arbitrary task via task syntax": () => {
    cy.task("arbitraryTask", 2).then(($num) => expect($num).to.equal(2));
  },
};
// story-code @end
ArbitraryTask.parameters = {
  docs: {
    description: {
      story: dedent`
        Should execute an arbitrary task and and get the result from a promise. 
        There's no need for this to be a story, just playing with a kind of literate
        testing document here. Would be nicer if I can get mdx story-code snippets
        to work, or just repeat that code in a code block.
      `,
    },
  },
};

export const ArbitraryTaskWithCommandSyntax = { ...ArbitraryTask }; // story-code @skip
ArbitraryTaskWithCommandSyntax.cy = {
  "it should execute an arbitrary task via command syntax": () => {
    cy.arbitraryTask(2).then(($num) => expect($num).to.equal(2));
  },
};
ArbitraryTaskWithCommandSyntax.parameters = {
  docs: {
    description: {
      story: "Command task for more convenient, well typed execution",
    },
  },
};
