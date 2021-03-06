<template>
  <div
    id="cytoscape"
    :style="{ maxHeight: parentHeight + 'px' }"
    v-resize="onResize"
    @dragover.prevent
    @drop="dropItem($event)"
  ></div>
</template>

<script lang="ts">
import Vue from "vue";
import fprime from "fprime";
import { Route } from "vue-router";
import CyManager from "@/store/CyManager";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
import view from "../store/view";
import { IRenderJSON } from "../../fprime/ViewManagement/ViewDescriptor";

export default Vue.extend({
  props: ["offset"],
  data() {
    return {
      parentHeight: 0,
      viewName: "",
    };
  },
  methods: {
    onResize() {
      // FIXME: 40 is the height of the header, 24 is the height of the footer
      // This part need refinement.
      this.parentHeight = window.innerHeight - 40 - 24 - this.offset;
    },
    updateCytoscape(name: string) {
      this.viewName = name;
      const render = fprime.viewManager.render(this.viewName, view.state.filterPort);
      console.log(render);
      if(render!=null) {
        CyManager.startUpdate(this.viewName, render);
        CyManager.endUpdate();
      }
    },
    dropItem(event: any) {
      console.log("Drop");
      event.preventDefault();
      const data = event.dataTransfer.getData("text").split("&");
      console.log(data)
      let droptype: string = data[0];
      let dropname: string = data[1];
      console.log(droptype + " " + dropname + " " + this.viewName);
      var res = false;
      if(droptype === ViewType.PortType) {
        res = fprime.viewManager.addPortToComponent(dropname, this.viewName);
      } else if (droptype === ViewType.InstanceCentric) {
        res = fprime.viewManager.addInstanceToTopo(dropname, this.viewName);
      }
      if(res) this.updateContent(this.viewName);
    },
    allowDrop(event: any) {
      event.preventDefault();
    },
    updateContent(name: string) {
      console.log("updateContent:" + name);
      
      var render: IRenderJSON | null;
        render = fprime.viewManager.rerender(name, CyManager.getDescriptor());
        console.log(render);
      if (render) {
        CyManager.startUpdate(this.viewName, render);
        CyManager.endUpdate();
      }
    }
  },
  mounted() {
    this.viewName = this.$route.params.viewName;
    CyManager.init(document.getElementById("cytoscape")!);
    this.updateCytoscape(this.viewName);
    // mount updateContent calling from viewlist
    this.$root.$on('updateContent', (name: string) => {
      this.updateContent(name);
    });
    this.$root.$on('updateCytoscape', (name: string)=>{
      this.updateCytoscape(name);
    });
  },
  beforeDestroy() {
    CyManager.destroy();
  },
  watch: {
    $route: function(to: Route, from: Route) {
      // Save the current cytoscape json
      fprime.viewManager.updateViewDescriptorFor(
        from.params.viewName,
        CyManager.getDescriptor(),
      );
      this.viewName = to.params.viewName;
      this.updateCytoscape(this.viewName);
    }
  }
});
</script>

<style>
#cytoscape {
  height: 100%;
  width: 100%;
}

.custom-context-menu {
  z-index: 9999;
  position: absolute;
}
.custom-menu-item {
  background-color: #eee;
  padding: 4px;
  margin: 2px;
  border-color: rgba(0,0,0,0.14);
  border-style: solid;
  font-family: sans-serif;
  font-size: small;
}

</style>
