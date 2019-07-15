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
            <v-text-field
                    v-model="compViews.Kind"
                    label="Kind"
            ></v-text-field>
            <v-btn color="success" @click="updateComponentView()">Update</v-btn>
        </v-container>
<!--        <v-container class="info-panel" v-bind:style="portPanel">-->
<!--            <v-text-field-->
<!--                    v-model="portAttributes.Name"-->
<!--                    label="Name"-->
<!--            ></v-text-field>-->
<!--            <v-autocomplete-->
<!--                    v-model="portAttributes.Role"-->
<!--                    :items="portAttributes.Roles"-->
<!--                    label="NameSpace"-->
<!--            ></v-autocomplete>-->
<!--            <v-autocomplete-->
<!--                    v-model="portAttributes.Type"-->
<!--                    :items="portAttributes.Types"-->
<!--                    label="Type"-->
<!--            ></v-autocomplete>-->
<!--            <v-autocomplete-->
<!--                    v-model="portAttributes.Direction"-->
<!--                    :items="portAttributes.Directions"-->
<!--                    label="Type"-->
<!--            ></v-autocomplete>-->
<!--            <v-text-field-->
<!--                    v-model="portAttributes.Number"-->
<!--                    label="Number"-->
<!--            ></v-text-field>-->
<!--            <v-btn color="success" @click="updatePortInfo()">Update</v-btn>-->
<!--        </v-container>-->
    </v-container>
</template>

<script lang='ts'>
    import Vue from "vue";
    import view from "@/store/view";
    import CyManager from "@/store/CyManager";
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
                compViews:{
                    Name: "",
                    NameSpace: "",
                    Kind: ""
                },
                portAttributes: {
                    Name:"",
                    Direction: "",
                    Directions:["in","out"],
                    Number:"",
                    Role:"",
                    Roles:[""],
                    Type : "",
                    Types:[""],
                },
                compPanel: {
                    display: 'none',
                },
                compViewPanel:{
                    display: 'none',
                },
                portPanel: {
                    display: 'none',
                }
            };
        },
        created(){
            this.getComponentInfo;
            //this.getPortInfo;
        },
        mounted(){
            CyManager.cyShowComponentInfo = this.showComponentInfo;
            CyManager.cyShowComponentView = this.showComponentView;


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
            // getPortInfo: function() {
            //     view.getPorts().then(value => {
            //         var roles:string[] = new Array();
            //         var types:string[] = new Array();
            //         //var port:string[] = new Array();
            //         for(var i=0; i < value.length;i++){
            //             console.log(value[i]);
            //             // roles.push(value[i].roles);
            //             // types.push(value[i].types);
            //         }
            //         this.portAttributes.Types = types;
            //         this.portAttributes.Roles = roles;
            //     });
            // }
        },

        methods:{
            // Get the information of the selected component view and assign it to the v-model of the selector.
            showComponentView(compName: string, compNamespace: string, kind: string ){
                if (this.$route.params.viewType === ViewType.Component ) {
                    this.compPanel.display = "none";
                    this.compViewPanel.display = "block";
                    this.portPanel.display = "none";
                }
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
                    this.compPanel.display = "none";
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
            updateComponentView(){
                if(this.compViews.Name && this.compViews.NameSpace && this.compViews.Kind){

                }
                else{
                    alert("Please use valid input!");
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
                            console.log("Old:", this.OldCompAttributes);
                            console.log("New:", this.compAttributes);
                            var grab = CyManager.getGrabbed();
                            CyManager.showCompView(grab,"ComponentView");
                            console.log(grab);
                            this.$root.$emit("updateContent", newName);
                            this.$route.params.viewName = newName;
                            this.OldCompAttributes.NameSpace = newName.split(".")[0];
                            this.OldCompAttributes.Name = newName.split(".")[1];
                        }
                    }
                    else{
                        alert("The name you want to change has already been in the model!");
                    }
                }
                else{
                    alert("Please use valid input!");
                }
            }
        },
    })
</script>

<style>
    .info-panel {
        display: block;
        height: 350px;
        position: fixed;
        box-shadow: 0px -0.5px 1px #bdbdbd;
        background-color: white;
        z-index: 1000;
    }
</style>
