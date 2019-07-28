<template>
    <v-layout 
    class="option-floats"
    :class="{'option-floats-active': showDisplayPort}"
    align-start justify-start row>
    <v-flex .caption pa-1>
        <v-switch
        v-model="filterPorts"
        label="Show unconnected ports">
        </v-switch>
    </v-flex>
    </v-layout>
</template>

<script lang="ts">
import Vue from "vue";
import { Route } from "vue-router";
import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
import view from "../store/view";
import CyManager from "@/store/CyManager";
import fprime from "../../fprime";
export default Vue.extend({
    data()
    {
        return {
            filterPorts: view.state.filterPort,
            showDisplayPort: false
        };
    },
    watch: 
    {
        filterPorts: function(visible) {
            if(visible) {
                CyManager.showUnusedPort();
            }
            else {
                CyManager.hideUnusedPort();
            }
            fprime.viewManager.filterPorts = visible;
        },
        $route: function(from: Route) {
            if(from.params.viewType === ViewType.Function ||
            from.params.viewType === ViewType.InstanceCentric) {
                this.showDisplayPort = true;
            }
            else {
                this.showDisplayPort = false;
            }
        }
    }
})
</script>
<style>
    .option-floats {
        display: none;
        position: fixed;    
        margin-top: 25px;
    }
    .option-floats-active {
        display: block;
        position: fixed;
       z-index: 1000;
    }
</style>



