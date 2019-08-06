<template>
    <div
            class="message-panel"
            :class="{ 'message-panel-active': show }"
            :style="{ bottom: offset + 'px', width: panelWidth + 'px' }"
            v-resize="onResize"
    >
        <v-tabs :height="25" v-model="curtab">
            <v-tab
                    ripple
                    id="msg-output-tab"
                    :key="output"
                    @click="outputPanel"
            >
                <span class="ml-3 mr-3" style="text-transform: none;">Output</span>
            </v-tab>

            <v-tab
                    ripple
                    id="msg-analysis-tab"
                    :key="analysis"
                    @click="analysisPanel"
            >
                <span class="ml-3 mr-3" style="text-transform: none;">Analysis</span>
            </v-tab>

            <v-tab
                    ripple
                    id="msg-editor-tab"
                    :key="editor"
                    @click="editorPanel"
            >
                <span class="ml-3 mr-3" style="text-transform: none;">Editor</span>
            </v-tab>

            <v-tab :style="{ display: 'none' }"></v-tab>

            <v-tab-item :key="output">
                <pre>
                    <p>{{ compilerOutput }}</p>
                </pre>
            </v-tab-item>

            <v-tab-item :key="analysis">
                <pre>
                    <p>{{ analysisOutput }}</p>
                </pre>
            </v-tab-item>

            <v-tab-item :key="editor">
                <text-editor ref="editor"></text-editor>
            </v-tab-item>

        </v-tabs>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import panel, { PanelName } from "@/store/panel";
    import TextEditor from "./TextEditor.vue";
    // require component
    const codemirror = require('vue-codemirror');
    Vue.use(codemirror);
    // require styles
    import 'codemirror/lib/codemirror.css'
    export default Vue.extend({
        props: ["offset"],
        name: "message-panel",
        components: {
            TextEditor,
        },
        methods: {
            outputPanel() {
                this.state.curPanel = PanelName.Output;
            },
            analysisPanel() {
                this.state.curPanel = PanelName.Analysis;
            },
            editorPanel() {
                this.state.curPanel = PanelName.Editor;
            },
            onResize() {
                this.panelWidth = this.$el.parentElement!.clientWidth;
            },
            generateText() {
                console.dir(this.$refs);
                (this.$refs.editor as Vue & { generateText: () => boolean }).generateText();
            },
            applyText() {
                console.dir(this.$refs);
                (this.$refs.editor as Vue & { applyText: () => boolean }).applyText();
            },
            returnFiles()
            {
                return (this.$refs.editor as Vue & { returnFiles: () => any }).returnFiles();
            },
            showText(element: any) {
                (this.$refs.editor as Vue & { showText: (element: any) => boolean }).showText(element);
            },
        },
        mounted() {
            this.$nextTick(() => {
                this.onResize();
            });
            this.$root.$on('showText', (element: string) => {
                this.showText(element);
            });
        },
        data() {
            return {
                state: panel.state,
                curtab: 2,
                output: PanelName.Output,
                analysis: PanelName.Analysis,
                editor: PanelName.Editor,
                panelWidth: 0,
            };
        },
        computed: {
            show(): boolean {
                return this.state.show;
            },
            compilerOutput(): string {
                return this.state.outputMessage.compile;
            },
            analysisOutput(): string {
                return this.state.outputMessage.analysis;
            },
            editorOutput(): string {
                return this.state.outputMessage.editor;
            },
        }
    });
</script>

<style>
    .message-panel {
        display: none;
        height: 350px;
        position: fixed;
        box-shadow: 0px -0.5px 1px #bdbdbd;
        background-color: white;
    }
    .message-panel-active {
        display: block;
        z-index: 1000;
    }
    .message-panel .v-tabs__content {
        transition: none;
        padding: 8px;
        padding-top: 0px;
        white-space: pre-wrap;
    }
    .message-panel .v-window__container p {
        overflow: auto;
        max-height: 300px;
    }

    .message-panel .v-window__container .text-editor {
        overflow: hidden;
        max-height: 320px;
    }
</style>
