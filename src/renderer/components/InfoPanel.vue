<template v-slot:header xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
    <v-container>
        <v-container class="info-panel" v-bind:style="compPanel">
            <v-autocomplete
                    v-model="compAttributes.NameSpace"
                    :items="compAttributes.NameSpaces"
                    label="NameSpace"
            ></v-autocomplete>
            <v-text-field
                    v-model="compAttributes.Name"
                    label="Name"
            ></v-text-field>
            <v-autocomplete
                    v-model="compAttributes.Type"
                    :items="compAttributes.Types"
                    label="Type"
            ></v-autocomplete>
            <v-text-field
                    v-model="compAttributes.BaseID"
                    label="BaseID"
            ></v-text-field>
            <v-btn color="success" @click="updateComponentInfo()">Update</v-btn>
        </v-container>
        <v-container class="info-panel" v-bind:style="compViewPanel">
            <v-text-field
                    v-model="compViews.NameSpace"
                    label="NameSpace"
            ></v-text-field>
            <v-text-field
                    v-model="compViews.Name"
                    label="Name"
            ></v-text-field>
            <v-autocomplete
                    v-model="compViews.Kind"
                    :items="compViews.Kinds"
                    label="Kind"
            ></v-autocomplete>
            <v-btn color="success" @click="updateComponentView()">Update</v-btn>
        </v-container>
        <v-container class="info-panel" v-bind:style="portPanel">
            <v-text-field
                    v-model="portAttributes.Name"
                    label="Name"
            ></v-text-field>
            <v-autocomplete
                    v-model="portAttributes.Role"
                    :items="portAttributes.Roles"
                    label="Role"
            ></v-autocomplete>
            <v-autocomplete
                    v-model="portAttributes.Type"
                    :items="portAttributes.Types"
                    label="Type"
            ></v-autocomplete>
            <v-autocomplete
                    v-model="portAttributes.Direction"
                    :items="portAttributes.Directions"
                    label="Direction"
            ></v-autocomplete>
            <v-text-field
                    v-model="portAttributes.Number"
                    label="Number"
            ></v-text-field>
            <v-autocomplete
                    v-model="portAttributes.Kind"
                    :items="portAttributes.Kinds"
                    label="Kind"
            ></v-autocomplete>
            <v-btn color="success" @click="updatePortInfo()">Update</v-btn>
        </v-container>
    </v-container>
</template>

<script lang='ts'>
    import Vue from "vue";
    import view from "@/store/view";
    import CyManager from "@/store/CyManager";
    import { Route } from "vue-router/types/router";
    import fprime from "../../fprime";
    import { ViewType } from "../../fprime/FPPModelManagement/FPPModelManager";
    export default Vue.extend({
        name: "info-panel",
        data(){
            return{
                OldCompAttributes: {
                    Name: "",
                    BaseID: "",
                    Type: "",
                    NameSpace: "",
                    NameSpaces: [""],
                    Types: [""],
                    Ports: [""],
                },
                compAttributes: {
                    Name: "",
                    BaseID: "",
                    Type: "",
                    NameSpace: "",
                    NameSpaces: [""],
                    Types: [""],
                    Ports: [""],
                },
                oldCompViews:{
                    Name: "",
                    NameSpace: "",
                    Kind: "",
                    Kinds: ["active","passive","queued"],
                },
                compViews:{
                    Name: "",
                    NameSpace: "",
                    Kind: "",
                    Kinds: ["active","passive","queued"],
                },
                oldPortAttributes: {
                    Name:"",
                    Names:[""],
                    Direction: "",
                    Directions:["in","out"],
                    Number:"",
                    Role:"",
                    Roles:["Cmd","CmdRegistration","CmdResponse","LogEvent","LogEvent","Telemetry","TimeGet","None"],
                    Type : "",
                    Types:[""],
                    Kind: "",
                    Kinds: [""],
                },
                portAttributes: {
                    Name:"",
                    Names:[""],
                    Direction: "",
                    Directions:["in","out"],
                    Number:"",
                    Role:"",
                    Roles:["Cmd","CmdRegistration","CmdResponse","LogEvent","LogEvent","Telemetry","TimeGet","None"],
                    Type : "",
                    Types:[""],
                    Kind: "",
                    Kinds: [""],
                },
                compPanel: {
                    display: 'none',
                },
                compViewPanel:{
                    display: 'none',
                },
                portPanel: {
                    display: 'none',
                },
            };
        },
        created(){
            this.getComponentInfo;
            this.getPortInfo;
        },
        mounted(){
            CyManager.cyShowComponentInfo = this.showComponentInfo;
            CyManager.cyShowComponentView = this.showComponentView;
            CyManager.cyShowPortInfo = this.showPortInfo;

        },
        // Get all components in the current model and push them to the items of the selector.
        computed:{

            items() {
                return view.GetViewList();
            },
            getComponentInfo: function() {

                view.getComponents().then(value => {
                    var type:string[] = new Array();
                    var namespace:string[] = new Array();
                    //var port:string[] = new Array();
                    for(var i=0; i < value.length;i++){
                        type.push(value[i].name);
                        namespace.push(value[i].namespace);
                        //port.push(value[i].ports);
                    }
                    this.compAttributes.Types = type;
                    this.compAttributes.NameSpaces = namespace;
                    //this.comPorts = port;
                });
            },
            getPortInfo: function() {
                view.getPorts().then(value => {
                    var names:string[] = new Array();
                    var roles:string[] = new Array();
                    var types:string[] = new Array();
                    var kinds:string[] = new Array();
                    //var port:string[] = new Array();
                    for(let p of value){
                        //console.log(p);
                        const prop = p.properties;
                        if (prop.name){
                            names.push(prop.name);
                        }
                        if (prop.role) {
                            roles.push(prop.role);
                        }
                        if (prop.type) {
                            types.push(prop.type);
                        }
                        if (prop.kind) {
                            kinds.push(prop.kind);
                        }
                    }
                    this.portAttributes.Names = this.uniq(names);
                    this.portAttributes.Types = this.uniq(types);
                    this.portAttributes.Kinds = this.uniq(kinds);
                });
            }
        },

        watch: {
            $route: function(to: Route, from: Route) {
                if(to !== from) {
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                    this.portPanel.display = "none";
                }
            }
        },
        methods:{
            // Remove duplicated elements in an array
            uniq(arr: string[]){
              let ret = [];
              for (let i = 0; i < arr.length; ++i){
                  if (ret.indexOf(arr[i]) === -1){
                      ret.push(arr[i]);
                  }
              }
              return ret;
            },
            // Get the information of the selected component view and assign it to the v-model of the selector.
            showComponentView(compName: string, compNamespace: string, kind: string ){
                if (this.$route.params.viewType === ViewType.Component ) {
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "block";
                    this.portPanel.display = "none";
                }
                else{
                    this.compViewPanel.display = "none";
                }
                // If it is in Function View, none of the InfoPanels should be shown
                if(this.$route.params.viewType === ViewType.Function){
                    this.portPanel.display = "none";
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                }
                this.oldCompViews.Name = compName;
                this.oldCompViews.NameSpace = compNamespace;
                this.oldCompViews.Kind = kind;
                this.compViews.Name = compName;
                this.compViews.NameSpace = compNamespace;
                this.compViews.Kind = kind;
            },
            // Get the information of the selected component instance and assign it to the v-model of the selector.
            showComponentInfo(compType :string, compNamespace: string, compName: string, compBaseID: string){
                // Check whether the current selected instance is the centric instance of the current view

                //console.log(this.$route.params.viewName,this.$route.params.viewType);
                if (this.$route.params.viewType === ViewType.InstanceCentric ) {
                    if (this.$route.params.viewName === compNamespace + "." + compName) {
                        this.compPanel.display = "block";
                        this.compViewPanel.display = "none";
                        this.portPanel.display = "none";
                    } else {
                        this.compPanel.display = "none";
                        this.compViewPanel.display = "none";
                        this.portPanel.display = "none";
                    }
                }
                else{
                    if (this.$route.params.viewType !== ViewType.Component){
                        this.portPanel.display = "block";
                    }else{
                        this.portPanel.display = "none";
                    }
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                }
                // If it is in Function View, none of the InfoPanels should be shown
                if(this.$route.params.viewType === ViewType.Function){
                    this.portPanel.display = "none";
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                }
                this.compAttributes.Name = compName;
                this.compAttributes.BaseID = compBaseID;
                this.compAttributes.Type = compType;
                this.compAttributes.NameSpace = compNamespace;
                this.OldCompAttributes.Name = compName;
                this.OldCompAttributes.BaseID = compBaseID;
                this.OldCompAttributes.Type = compType;
                this.OldCompAttributes.NameSpace = compNamespace;
            },
            // Get the information of the selected port and assign it to the v-model of the selector.
            showPortInfo(portName: string, portDirect: string, portNumber: string, portRole: string, portType:string, portKind:string){
                if (this.$route.params.viewType === ViewType.Component) {
                    this.portPanel.display = "block";
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                    this.portAttributes.Name = portName;
                    this.portAttributes.Direction = portDirect;
                    this.portAttributes.Number = portNumber;
                    this.portAttributes.Role = portRole;
                    this.portAttributes.Type = portType;
                    this.portAttributes.Kind = portKind;
                    this.oldPortAttributes.Name = portName;
                    this.oldPortAttributes.Direction = portDirect;
                    this.oldPortAttributes.Number = portNumber;
                    this.oldPortAttributes.Role = portRole;
                    this.oldPortAttributes.Type = portType;
                    this.oldPortAttributes.Kind = portKind;
                }
                else{
                    this.portPanel.display = "none";
                }
                // If it is in Function View, none of the InfoPanels should be shown
                if(this.$route.params.viewType === ViewType.Function){
                    this.portPanel.display = "none";
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "none";
                }
            },
            updateComponentView(){
                if(this.compViews.Name && this.compViews.NameSpace && this.compViews.Kind){
                    const oldName = this.oldCompViews.NameSpace + "." + this.oldCompViews.Name;
                    const newName = this.compViews.NameSpace + "." + this.compViews.Name;
                    const non_existed = view.UpdateViewList(oldName,newName);
                    if(non_existed) {
                        const result = fprime.viewManager.updateAttributes(ViewType.Component, {
                            ["NameSpace"]: this.compViews.NameSpace,
                            ["Name"]: newName,
                            ["Kind"]: this.compViews.Kind,
                            ["OldName"]: oldName
                        });
                        if (result){
                            console.log(this.$route.params.viewName);
                            this.$route.params.viewName = newName;
                            console.log(this.$route.params.viewName);
                            if (newName === oldName) {
                                this.$root.$emit("updateContent", newName);
                            }
                            else{
                                this.$root.$emit("updateCytoscape", newName);
                            }
                            this.oldCompViews.Name = newName.split(".")[1];
                            this.oldCompViews.NameSpace = newName.split(".")[0];
                        }
                    }
                    else{
                        alert("The name you want to change has already been in the model!");
                    }
                }
                else{
                    let ret = "Attribute ";
                    if (!this.compViews.Name){
                        ret += "Name,"
                    }
                    if (!this.compViews.NameSpace){
                        ret += "NameSpace,"
                    }
                    if (!this.compViews.Kind){
                        ret += "Kind,"
                    }
                    ret = ret.substring(0,ret.length-1);
                    ret += " cannot be empty!";
                    alert(ret + " Please use valid input!");
                }
            },
            updateComponentInfo(){

                if(this.compAttributes.Type && this.compAttributes.NameSpace && this.compAttributes.Name && this.compAttributes.BaseID){
                    // CyManager.cyUpdateComponentInfo(this.compType, this.compNameSpace);
                    // 1 update model
                    const oldName = this.OldCompAttributes.NameSpace + "." + this.OldCompAttributes.Name;
                    const newName = this.compAttributes.NameSpace + "." + this.compAttributes.Name;
                    // First update the viewList.
                    const non_existed = view.UpdateViewList(oldName,newName);
                    if(non_existed) {
                        const result = fprime.viewManager.updateAttributes(ViewType.InstanceCentric,
                            {
                                ["Type"]: this.compAttributes.Type,
                                ["NameSpace"]: this.compAttributes.NameSpace,
                                ["Name"]: this.compAttributes.Name,
                                ["BaseID"]: this.compAttributes.BaseID,
                                ["NewName"]: this.compAttributes.NameSpace + "." + this.compAttributes.Name,
                                ["OldName"]: this.OldCompAttributes.NameSpace + "." + this.OldCompAttributes.Name
                            });
                        if (result) {
                            // 2 content: rerender
                            this.$route.params.viewName = newName;

                            this.$root.$emit("updateCytoscape", newName);
                            this.$root.$emit("updateContent", newName);
                            this.OldCompAttributes.NameSpace = newName.split(".")[0];
                            this.OldCompAttributes.Name = newName.split(".")[1];

                        }
                    }
                    else{
                        alert("The name you want to change has already been in the model!");
                    }
                }
                else{
                    let ret = "Attribute ";
                    if (!this.compAttributes.NameSpace){
                        ret += "NameSpace,"
                    }
                    if (!this.compAttributes.Name){
                        ret += "Name,"
                    }
                    if (!this.compAttributes.Type){
                        ret += "Type,"
                    }
                    if (!this.compAttributes.BaseID){
                        ret += "BaseID,"
                    }
                    ret = ret.substring(0,ret.length-1);
                    ret += " cannot be empty!";
                    alert(ret + " Please use valid input!");
                }
            },
            updatePortInfo(){
                const oldName = this.oldPortAttributes.Name;
                const newName = this.portAttributes.Name;
                const result = fprime.viewManager.updateAttributes("Port",
                    {
                        ["CompName"]: this.$route.params.viewName,
                        ["ViewType"]: this.$route.params.viewType,
                        ["Name"]: this.portAttributes.Name,
                        ["Direction"]: this.portAttributes.Direction,
                        ["Number"]: this.portAttributes.Number,
                        ["Role"]: this.portAttributes.Role,
                        ["Type"]: this.portAttributes.Type,
                        ["Kind"]: this.portAttributes.Kind,
                        ["OldName"]: oldName,
                        ["NewName"]: newName
                    });
                if(result){
                    this.$root.$emit("updateContent",this.$route.params.viewName);
                    this.oldPortAttributes.Name = newName;
                }

            }
        },
    })
</script>

<style>
    .info-panel {
        display: block;
        height: 480px;
        position: fixed;
        box-shadow: 0px -0.5px 1px #bdbdbd;
        background-color: white;
        z-index: 1000;
    }
</style>
