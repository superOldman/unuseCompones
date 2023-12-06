export default {
    props: {
        show: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        show: {
            immediate: true,
            handler: function (val, oldVal) {
                if (val) {
                    this.visible = false
                    this.$nextTick(() => {
                        this.visible = true
                    })
                }
            }
        }
    },
    data() {
        return {
            visible: false,
            popupHideNull: true
        }
    },
    methods: {
        beforeCloseDialog(done) {
            this.$emit('beforeClose')
            done()
        },
        changeShow(val) {
            this.visible = val
            this.$emit('update:show', val);
        },
        closedDialog() {
            this.visible = false
            const value = this.popupHideNull ? null : false
            this.$emit('update:show', value);
        },
        doClose() {
            this.changeShow(false)
        }
    }

}