import { deepClone } from 'src/utils/object'
import _ from "lodash"
export default {
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        value: {
            type: Object | Array,
            default: () => ({})
        }
    },
    data() {
        return {
            formData: {}
        }
    },
    watch: {
        value: {
            // deep: true,
            handler(val) {
                this.valueChange(val)
            },
            immediate: true
        }
    },
    methods: {
        valueChange(val) {
            if (!_.isEqual(val, this.inner_value)) {
                this.inner_value = val
                this.toFormData(val)
                this.changeValue()
            } else {
                this.valueChangeEnd()
            }
        },
        valueChangeEnd() {

        },
        toFormData(val) {
            // 如果不相等 才赋值  不相等则被默认为赋值  
            Object.assign(this.formData, deepClone(val) || this.$options.data().formData)
        },
        changeValue() {
            this.inner_value = this.fromDataTo(this.formData)
            this.$emit('input', this.inner_value)
            this.$emit('change', this.inner_value)
        },
        fromDataTo(formData) {
            return this.formData
        },
        validForm() {
            let result = false
            this.$refs['form'].validate((valid) => { result = valid })
            return result
        }
    }
}

