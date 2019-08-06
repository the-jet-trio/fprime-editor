import ViewManager from "./ViewManagement/ViewManager";
import * as path from "path";
// import view from "@/store/view";

const viewManager = new ViewManager();
// Load the test/Ref project by default in development mode
if (process.env.NODE_ENV === "development") {
  viewManager.build(path.resolve(__dirname, "../../test/Ref"));
}

viewManager.newProject(".");

export default {
  viewManager,
};
