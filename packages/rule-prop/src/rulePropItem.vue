<template>
  <!-- 用户属性满足 -->
  <el-form ref="form" class="fx" :model="formData" :rules="rules" :hide-required-asterisk="true" :inline="true">
    <!-- 第一项 -->
    <!-- <el-form-item prop="field" :rules="disabled ? rules.checkLegal[0] : rules.checkLegal"> -->
    <el-form-item prop="field">
      <mySelect v-model="formData.field" :isNeedChangeWidth="true" :disabled="disabled" :options="propOptions.options" searchShow placeholder="请选择" @change="handleChange($event, formData)" />
    </el-form-item>
    <!-- 第二项 -->
    <!-- <el-form-item prop="function" :rules="rules.requiredRule"> -->
    <el-form-item prop="function">
      <el-select v-model="formData.function" :disabled="disabled" placeholder="请选择" @change="changeCondition($event)">
        <el-option v-for="(item,idx) in opsOptions" :key="idx" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <!-- 第三项 -->
    <ValueItem :disabled="disabled" v-model="formData" />
    <div v-if="addAble && !disabled" @click="addInsideData()">
      <span>添加</span>
    </div>
    <div v-if="!disabled" @click="delTagGroupItem()">
      <span>删除</span>
    </div>
  </el-form>
</template>
<script>
import mySelect from "@/components/mySelect"
import SuperFormMixin from 'src/mixins/super-form-mixin'
import ValueItem from './valueItem'
import { getOpsOptions } from "src/utils/business"
export default {
  name: 'DsRulePropItem',
  mixins: [SuperFormMixin],
  components: {
    mySelect,
    ValueItem
  },
  props: {
    addAble: {
      type: Boolean,
      default: false
    },
    // 查询接口数据
    propOptions: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    const checkLength = (rule, value, callback) => {
      if (value && value.length) {
        callback()
      } else {
        callback(new Error(' '))
      }
    }
    return {
      // 表单校验
      rules: {
        requiredRule: { required: true, message: ' ' },
        requiredLength: [
          { required: true, message: ' ', trigger: 'change' },
          { validator: checkLength, trigger: 'change' }
        ],
        opsOptions: [],
        checkLegal: [
          { required: true, message: ' ', trigger: 'change' },
          { validator: this.$ResourceWhetherRecycle, trigger: 'change' },
          { validator: this.$attributeStatus, trigger: 'change' }
        ],
      },
      getThirdSelectDataLoading: false
    }
  },
  computed: {
    showAdd() {
      return true
    }
  },
  methods: {
    toFormData(val) {
      this.opsOptions = getOpsOptions(val?.fieldType)
      this.formData = val || {}
    },
    changeCondition(val) {
      this.formData.betweenRranking1 = ''
      this.formData.betweenRranking2 = ''
      this.formData.params = []
      this.formData.paramsToString = ''
      this.formData.isInput = !['IS_SET', 'NOT_SET', 'IS_TRUE', 'IS_FALSE'].includes(val)
    },
    async handleChange(val) {
      this.formData.isInput = true
      
      this.formData.betweenRranking1 = ''
      this.formData.betweenRranking2 = ''
      this.formData.params = []
      this.formData.paramsToString = ''

      this.formData.type = val.type
      this.formData.ckColumn = val.ckColumn
      this.formData.fieldType = val.fieldType
      // 为布尔不需获取第三个框的数据
      this.opsOptions = getOpsOptions(val.fieldType)
      this.formData.function = this.opsOptions?.[0]?.value
    },

  }
}
</script>
