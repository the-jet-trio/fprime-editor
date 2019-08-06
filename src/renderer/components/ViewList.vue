<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <v-navigation-drawer value="true" stateless>
    <v-list
    >
      <v-list-group 
      v-for="(viewtype, typeid) in items" 
      :key="typeid" 
      no-action 
      sub-group 
      v-model="toggle[typeid]" 
      >
        <template v-slot:activator>
          <v-list-tile>
            <v-list-tile-title>{{viewtype.name}}</v-list-tile-title>
            <v-list-tile-action>
              <v-icon @click.stop="addNewItem(viewtype.name)">add</v-icon>
            </v-list-tile-action>
          </v-list-tile>
        </template>

        <v-list-tile
          v-for="(viewitem, viewid) in viewtype.children"
          :key="viewid"
          :to="viewitem.route"
          draggable="true"
          @dragstart="dragStart(viewtype.name, viewitem.name, $event)"
          @contextmenu.stop="showMenu(viewitem.name, viewtype.name, $event)"
          @dragover.prevent
          @drop="dropItem(viewtype.name, viewitem.name, $event)"
        >
          <v-list-tile-title v-text="viewitem.name"></v-list-tile-title>
        </v-list-tile>
      </v-list-group>
    </v-list>
    <!-- right click menu -->
    <v-menu
      v-model="menu.showMenu"
      :position-x="menu.x"
      :position-y="menu.y"
      absolute
      offset-y
      flat="true"
    >
      <v-list>
        <v-list-tile
          v-for="(menuitem, menuid) in menuitems"
          :key="menuid"
          @click="clickMenuItem(menuitem.title)"
        >
          <v-list-tile-title>{{ menuitem.title }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>
    <!-- dialog when instantiate -->
    <v-dialog v-model="instance_dialog.showDialog" scrollable max-width="300px">
      <v-card>
        <v-card-title>Select Component to instantiate</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px;">
          <v-radio-group v-model="instance_dialog.selected" column>
            <v-radio
              v-for="compitem in componentsItems"
              :key="compitem.id"
              :label="compitem.name"
              :value="compitem.name"
            ></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-btn color="blue darken-1" flat @click="resetDialog()">Cancel</v-btn>
          <v-btn
            color="blue darken-1"
            flat
            @click="
              instance_dialog.confirmed = true;
              addNewItem('InstanceCentric View', instance_dialog.selected);
            "
          >OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- dialog when rename -->
    <v-dialog
        v-model="rename_dialog.showDialog"
        max-width="300px"
      >
        <v-card>
          <v-card-title class="headline">Rename the Topology</v-card-title>
  
          <v-form v-model="rename_dialog.valid">
            <v-container grid-list-xl>
              <v-layout wrap>
                <v-flex
                  xs12
                  md6
                >
                  <v-text-field
                    v-model="rename_dialog.namespace"
                    :rules="rename_dialog.namespaceRules"
                    label="Namespace"
                    required
                  ></v-text-field>
                </v-flex>
        
                <v-flex
                  xs12
                  md6
                >
                  <v-text-field
                    v-model="rename_dialog.name"
                    :rules="rename_dialog.nameRules"
                    label="Name"
                    required
                  ></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-form>
  
          <v-card-actions>
            <v-spacer></v-spacer>
  
            <v-btn
              color="blue darken-1"
              flat
              @click="rename_dialog.showDialog = false"
            >
              Cancel
            </v-btn>
  
            <v-btn
              color="blue darken-1"
              flat
              :disabled="!rename_dialog.valid"
              @click="renameItem();
              rename_dialog.showDialog = false;"
            >
              OK
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </v-navigation-drawer>
</template>

<script lang='ts'>
import Vue from "vue";
import View from "@/store/view";
import { Route } from "vue-router/types/router";
import { IViewListItem } from "../../fprime/ViewManagement/ViewManager";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
import fprime from "fprime";

export default Vue.extend({
  name: "view-list",
  data() {
    return {
      instance_dialog: {
        showDialog: false,
        confirmed: false,
        selected: ""
      },
      rename_dialog: {
        showDialog: false,
        valid: false,
        namespace: '',
        name: '',
        previousID: '',
        nameRules: [
          (v: string) => !!v || 'Name is required',
          (v: string) => v.length <= 20 || 'Name must be less than 10 characters',
        ],
        namespaceRules: [
          (v: string) => !!v || 'Namespace is required',
          (v: string) => v.length <= 10 || 'Namespace must be less than 10 characters',
        ],
      },
      menu: {
        showMenu: false,
        x: 0,
        y: 0,
        clickedName: "",
        clickedType: ""
      },
      menuitems: [] as {title: string}[],
      viewlist: View.state.views,
      toggle: [false, false, false, false, false]
    };
  },
  computed: {
    items() {
      return View.GetViewList();
    },
    componentsItems: function() {
      var components = this.items.find(function(items) {
        return items.name === ViewType.Component;
      });
      return components == undefined ? null : components.children;
    }
  },
  watch: {
    $route(to: Route) {
      if (to.params.viewName) {
        View.LoadViewByName(to.params.viewName);
        // Show corresponding text
        this.$root.$emit("showText", to.params);
        // console.dir(to);
      }
    }
  },
  methods: {
    showMenu(viewitem: string, viewtype: string, e: any) {
      this.menu.showMenu = false;
      this.menu.x = e.clientX;
      this.menu.y = e.clientY;
      this.menu.clickedName = viewitem;
      this.menu.clickedType = viewtype;

      // add menu options
      this.menuitems = [];
      this.menuitems.push({ title: "add" });
      this.menuitems.push({ title: "delete" });
      if (viewtype === ViewType.Component) {
        this.menuitems.push({ title: "instantiate" });
      }
      if (viewtype === ViewType.Function) {
        this.menuitems.push({ title: "rename"});
      }

      this.$nextTick(() => {
        this.menu.showMenu = true;
      });
    },
    clickMenuItem(menuitem: string) {

      if (menuitem === "add") {
        this.addNewItem(this.menu.clickedType);
      } else if (menuitem === "delete") {
        // Remove the type of the Type selections of an instance if there is a component got deleted.
        if (this.menu.clickedType === ViewType.Component){
          this.$root.$emit("removeType", this.menu.clickedName);
        }
        View.removeItem(this.menu.clickedName, this.menu.clickedType);
        // Remove tab
        this.$root.$emit("closeTab", this.menu.clickedName);
      } else if (menuitem === "instantiate") {
        // must be component
        this.addNewItem(ViewType.InstanceCentric, this.menu.clickedName);
      } else if (menuitem === "rename") {
        // rename the item name
        // open dialog
        this.rename_dialog.showDialog = true;
        this.rename_dialog.previousID = this.menu.clickedName;
        var splits = this.menu.clickedName.split('.');
        if(splits.length == 2) {
          this.rename_dialog.namespace = splits[0];
          this.rename_dialog.name = splits[1];
        }
      }
    },
    addNewItem(itemType: string, compName?: string) {
      var newitem: IViewListItem;
      if (compName && compName.length > 0) {
        newitem = View.addNewItem(itemType, compName);

      } else if (itemType === ViewType.InstanceCentric) {
        // open dialog
        this.instance_dialog.showDialog = true;
        return;
      } else {
        newitem = View.addNewItem(itemType);
      }
      if (newitem) {
        // Add a new type to Type selections of an instance.
        if (itemType === ViewType.Component){
          this.$root.$emit("addType", newitem.name);
        }
        // open the tab
        View.LoadViewByName(newitem.name);
        const newRoute: string = View.GetViewRoute(newitem);
        this.$router.push(newRoute);
      }
      this.resetDialog();
    },
    renameItem() {
      if (this.rename_dialog.showDialog && this.rename_dialog.valid) {
        var newname = this.rename_dialog.namespace + '.' + this.rename_dialog.name;
        if(newname !== this.rename_dialog.previousID)
          View.renameItem(this.rename_dialog.previousID, newname);
      }
    },
    resetDialog() {
      this.instance_dialog.showDialog = false;
      this.instance_dialog.confirmed = false;
      this.instance_dialog.selected = "";
    },
    dragStart(viewtype: string, itemname: string, e: any) {
      if(viewtype === ViewType.PortType) {
        // drag a port to a component
        this.toggle = [false, false, true, false, false] // open 3rd category
      } else if(viewtype === ViewType.Component) {
        // drag a component to instantiate
        this.toggle = [false, false, false, true, false] // open 4th category
      } else if (viewtype === ViewType.InstanceCentric) {
        // drag an instance to a function view
        this.toggle = [false, false, false, false, true] // open 5th category
      }
      
      e.dataTransfer.setData("text/plain", viewtype + "&" + itemname);
    },
    dropItem(viewtype: string, itemname: string, event: any) {
      event.preventDefault();
      const data = event.dataTransfer.getData("text").split("&");
      // console.log(data)
      let droptype: string = data[0];
      let dropname: string = data[1];
      if(droptype === ViewType.PortType && viewtype === ViewType.Component) {
        // a port is dropped
          fprime.viewManager.addPortToComponent(dropname, itemname);
      } else if (droptype === ViewType.Component && viewtype === ViewType.InstanceCentric) {
        // a component is dropped
        this.addNewItem(viewtype, dropname);
      } else if (droptype === ViewType.InstanceCentric) {
        // an instance is dropped
        fprime.viewManager.addInstanceToTopo(dropname, itemname);
      }
      if(View.state.opened.find((i) => {return (i.name === itemname &&
       (i.type === ViewType.Component || i.type === ViewType.Function))})) {
        // if the tab is opened, update the content
        this.$root.$emit("updateContent", itemname);
      }
    }
  }
});
</script>

<style>
.v-list__group__header .v-list__group__header__append-icon,
.v-list__group__header .v-list__group__header__prepend-icon {
  padding: 0 8px;
}
.v-list__group__header .v-list__group__header__prepend-icon {
  min-width: 0px;
}

.v-list__tile__action {
  min-width: 0px;
}

.v-list__group__items--no-action .v-list__tile {
  padding-left: 40px;
}
</style>
