import fprime from "fprime";
import {
    IViewList,
    IViewListItem
} from "fprime/ViewManagement/ViewManager";

const views: IViewList = fprime.viewManager.ViewList;
const opened: IViewListItem[] = [];
export default {
    state: {
        /**
         * The view list generated from the view manager.
         */
        views,
        /**
         * The opened views. This is the data source for ViewTabs.vue component.
         */
        opened,
        /**
         * The filterPort option. Used for option floats component.
         */
        filterPort: fprime.viewManager.filterPorts,
    },
    /**
     * GetViewList returns a JSON object with type:
     * INavItem: {
     *  name: string,
     *  children: INavItem[],
     *  route: string,
     *  element: string
     * }
     * When the user click on the navigation item, we should change the
     * route (path)
     * of the program. Thus, we set route to "/view/:viewType/:viewName/edit".
     */
    GetViewList() {
        return Object.keys(views).map((key) => {
            return {
                name: key,
                children: views[key].map((i) => {
                    return {
                        name: i.name,
                        route: this.GetViewRoute(i),
                    };
                }),
            };
        });
    },
    /**
     * This function first checks whether the new name user wants to change is already
     * existed in the model. If it is, return false. Else, update the item in the viewlist
     * with the new name.
     * @param oldName
     * @param newName
     * @constructor
     */
    UpdateViewList(oldName: string, newName: string) {
        if (oldName === newName){
            return true;
        }
        const existed =
            Object.keys(views)
                .map((key) => views[key])
                .reduce((x, y) => x.concat(y))
                .filter((i) => i.name === newName);
        if (existed.length > 0) {
            return false;
        }
        const cur =
            opened
                .filter((i) => i.name === oldName)[0];
        cur.name = newName;
        return true;
    },
    /**
     * Open a given view in the tab. If the view is not opened, find the
     * corresponding IViewListItem and push it to the opened list.
     * @param name The name of the view to load.
     * @returns true if the opened list is updated; otherwise false.
     */
    LoadViewByName(name: string): boolean {
        const updated =
            opened
                .filter((i) => i.name === name)
                .length === 0;
        if (updated) {
            opened.push(
                Object.keys(views)
                    .map((key) => views[key])
                    .reduce((x, y) => x.concat(y))
                    .filter((i) => i.name === name)
                    [0]);
        }
        return updated;
    },

    /**
     * Close the tab a given view. This will cause the IViewListItem be removed
     * from the opened list.
     * @param name The name of the view to close.
     * @returns The index of the closed view in the opened list. -1 if the view
     * is not in the opened list, meaning that it is not opened.
     */
    CloseViewByName(name: string): number {
        let i;
        for (i = 0; i < opened.length; i++) {
            if (opened[i].name === name) {
                break;
            }
        }
        if (i < opened.length) {
            opened.splice(i, 1);
            // Close the view from ViewManager
            fprime.viewManager.closeViewDescriptor(name);
        }
        return i < opened.length + 1 ? i : -1;
    },

    /**
     * Close all the opening tabs.
     */
    CloseAll() {
        opened.splice(0, opened.length);
    },

    /**
     * Get the IViewListItem of a view with given name.
     * @param name The name of the view.
     * @returns The corresponding view item; null if no view with such name.
     */
    GetViewByName(name: string): IViewListItem | null {
        const namedViews =
            Object.keys(views)
                .map((key) => views[key])
                .reduce((x, y) => x.concat(y))
                .filter((i) => i.name === name);
        if (namedViews.length === 0) {
            return null;
        } else {
            return namedViews[0];
        }
    },

    /**
     * Generate the url for a view item. When the user opens a view, we change
     * the URL to notify the system to load the target view. The URL has the
     * format: "/view/:viewType/:viewName/edit"
     * @param item The view item.
     * @returns The encoded URL.
     */
    GetViewRoute(item: IViewListItem): string {
        return encodeURI("/view/" + item.type + "/" + item.name + "/edit");
    },

    refreshOpened() {
        let all_views = Object.keys(views)
                        .map((key) => views[key])
                        .reduce((x, y) => x.concat(y));
        opened.forEach(i => {
            if (!all_views.some((ele) => ele.name === i.name)) {
               this.CloseViewByName(i.name); 
            }
        });
    },

    /**
     * Add a new item to the view list.
     * When the user wants to add a new item to the list,
     * create an item with default vaule.
     * @param name The view category aimed to add the item
     */
    addNewItem(name: string, compName?: string): IViewListItem {
        // add a new viewlist item
        if (compName) {
            return fprime.viewManager.addNewItem(name, compName);
        } else {
            return fprime.viewManager.addNewItem(name);
        }
    },

    removeItem(name: string, type: string) {
        fprime.viewManager.removeItem(name, type);
    },

    renameItem(previous: string, newname: string) {
        if(this.UpdateViewList(previous, newname)) {
            fprime.viewManager.renameItem(previous, newname);
        }
    },
    /**
     * Get all the components in the current model.
     */
    getComponents() {
        return fprime.viewManager.getComponents();
    },
    /**
     * Get all the ports in the current model.
     */
    getPorts(){
        return fprime.viewManager.getPorts();
    },
    /**
     * Get all the text in the current model.
     */
    getText() {
        return fprime.viewManager.getText();
    },
    /**
     * Generate text according to the current model.
     */
    generateText() {
        fprime.viewManager.generateText();
    },
    /**
     * Update text according to the text editor.
     */
    applyText(files: {[fileName: string]: string}) {
        fprime.viewManager.applyText(files);
    },

    updateEditor(_: any) {

    },
    compInfo(){

    },
    portInfo(){

    },
    resetInfoPanel(){

    },
}

