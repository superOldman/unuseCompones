import emitter from "packages/multi-editor/src/mixins/emitter"
import { TaEditorConst } from "packages/multi-editor/src/utils/const"

export default {
    mixins: [emitter],
    componentName: TaEditorConst.POPOVER,
    props: {
        options: {
            type: Object,
            default: null
        }
    },
    computed: {
        trigger() {
            return this.options?.trigger || "click"
        },
        width() {
            return this.options?.width || "364"
        },
        placement() {
            return this.options?.placement || "bottom-start"
        },
        reference() {
            return this.options?.reference
        }
    },
    created() {
        this.$on('editor-popover-hide', this.hide)
    },
    methods: {
        hide() {
            this.$nextTick(() => {
                if (this.$refs?.popover?.showPopper) {
                    this.reference && this.reference.click()
                }
            })
        },
        show() {
            if (!this.$refs?.popover?.showPopper) {
                this.reference && this.reference.click()
            }
        }
    },
    beforeDestroy() {
      this.$off('editor-popover-hide', this.hide)
    }
}
