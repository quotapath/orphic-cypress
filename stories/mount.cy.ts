import { mountTest } from "../src/mount";

mountTest([], (fullFilePath) =>
  require("stories/" + fullFilePath.replace("stories/", ""))
);
