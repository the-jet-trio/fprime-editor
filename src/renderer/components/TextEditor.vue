<template>
    <div class = "text-editor">
        <v-autocomplete
                v-model="fileName"
                :items="fileNames"
        ></v-autocomplete>
        <!-- bidirectional data binding（双向数据绑定） -->


        <!-- or to manually control the datasynchronization（或者手动控制数据流，需要像这样手动监听changed事件） -->
        <codemirror ref="myCm"
                    :value="code"
                    :options="cmOptions"
                    @ready="onCmReady"
                    @focus="onCmFocus"
                    @input="onCmCodeChange"
                    @cursorActivity="onCursorActivity">
        </codemirror>

        <!--        &lt;!&ndash; if Nust.js/SSR（如果在 Nuxt.js 环境下，需要外面包裹一层 no-ssr） &ndash;&gt;-->
        <!--        <no-ssr placeholder="Codemirror Loading...">-->
        <!--            <codemirror ref="myCm"-->
        <!--                        :value="code"-->
        <!--                        :options="cmOptions"-->
        <!--                        @ready="onCmReady"-->
        <!--                        @focus="onCmFocus"-->
        <!--                        @input="onCmCodeChange">-->
        <!--            </codemirror>-->
        <!--        </no-ssr>-->

    </div>
</template>

<script>
    // language js
    import 'codemirror/mode/javascript/javascript.js'
    // theme css
    import 'codemirror/theme/base16-dark.css'
    // more codemirror resources
    // import 'codemirror/some-resource...'
    import view from "@/store/view";
    import FPPModelManager from "../../fprime/FPPModelManagement/FPPModelManager";
    import Vue from "vue";
    export default Vue.extend({
        name: "text-editor",
        data () {
            return {
                fileName: "",
                fileNames: [],
                files: {},
                text: {},
                code: "",
                cmOptions: {
                    // codemirror options
                    tabSize: 4,
                    mode: 'text/javascript',
                    theme: 'default',
                    lineNumbers: true,
                    line: true,
                    // more codemirror options, 更多 codemirror 的高级配置...
                }
            }
        },
        methods: {
            onCmReady(cm) {
                console.log('the editor is readied!', cm)
            },
            onCmFocus(cm) {
                console.log('the editor is focus!', cm)
            },
            onCmCodeChange(newCode) {
                this.code = newCode
                this.files[this.fileName] = newCode;  // Update code stored in text editor
            },
            onCursorActivity(cm) {
            },
            // Read text from Modelmanager
            generateText() {
                this.getText;
                console.dir(this.files);
            },
            // Write text to Modelmanager
            applyText() {
                view.applyText(files);
            },
            // Return text files
            returnFiles() {
                return this.files;
            },
            // Show corresponding text to the selected element
            showText(params) {
                console.dir(params);
                const viewName = params.viewName.split(".", 2);
                const name = viewName[1];
                const namespace = viewName[0];
                const type = params.viewType;
                let path = "";
                if (type === "DataType View") {
                    path = namespace + "\\DataType.fpp";
                }
                else if (type === "Component View" || type === "PortType View") {
                    path = namespace + "\\" + name + ".fpp";
                }
                else if (type === "Function View" || type === "InstanceCentric View") {
                    path = namespace + "\\System.fpp";
                }
                if (this.fileNames.includes(path))
                {
                    this.fileName = path;
                }
            },
            readText(text) {
                this.files = text;
                this.fileNames = Object.keys(text);
                if (this.fileName in this.files)
                {
                    this.code = this.files[this.fileName];
                }
                else {
                    this.code = "";
                    this.fileName = "";
                }
                console.dir(this);
            }
        },
        computed: {
            codemirror() {
                return this.$refs.myCm.codemirror
            },
            // Get text from ModelManager
            getText: function () {
                view.getText().then(value => {
                    if (Object.keys(value).length !== 0) {
                        // this.fileNames = Object.keys(value);
                        this.files = value;
                    }
                    console.dir(value)
                });
            },
        },
        watch: {
            files: function (val, oldVal) {
                this.fileNames = Object.keys(val);
            },
            fileName: function (val, oldVal) {
                if (val) {
                    this.code = this.files[val];
                }
            },
        },
        mounted(){
            view.updateEditor = this.readText;
        }
    })
</script>
