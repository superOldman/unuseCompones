import { deepClone } from 'src/utils/object'
export default {
    props: {
        formKey: {
            type: String,
            default: ''
        },
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: Object,
            default: () => ({})
        }
    },
    data() {
        return {
            formData: {}
        }
    },
    computed: {
        partFormData() {
            return this.formKey ? this.value[this.formKey] : this.value
        },
    },
    watch: {
        partFormData: {
            immediate: true,
            handler: function (val) {
                this.toFormData(deepClone(val))
            }
        },
    },
    methods: {
        toFormData(val) {
            this.formData = val || {}
        },
        validForm() {
            let result = false
            this.$refs['form'].validate((valid) => {
                this.form = this.formData
                result = valid
            })
            return result
        },
    }
}

