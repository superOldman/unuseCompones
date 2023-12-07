<template>
  <!-- 用户属性满足 -->
  <el-form ref="form" class="fx-s-center ds-rule-prop-item" :model="formData" :hide-required-asterisk="true" :inline="true">
    <!-- 第一项 -->
    <!-- <el-form-item prop="field" :rules="disabled ? rules.checkLegal[0] : rules.checkLegal"> -->
    <el-form-item prop="eventPropertyCode">
      <DsMultiTypeSelect v-model="formData.eventPropertyCode" :isNeedChangeWidth="true" :disabled="disabled" :options="propOptions.options" searchShow placeholder="请选择"
        @change="handleChange($event, formData)" />
    </el-form-item>
    <!-- 第二项 -->
    <!-- <el-form-item prop="function" :rules="rules.requiredRule"> -->
    <el-form-item prop="eventFilterCode">
      <el-select v-model="formData.eventFilterCode" :disabled="disabled" placeholder="请选择" @change="changeCondition($event)">
        <el-option v-for="(item,idx) in opsOptions" :key="idx" :label="item.label" :value="item.value" />
      </el-select>
    </el-form-item>
    <!-- 第三项 -->
    <ValueItem :disabled="disabled" v-model="formData" @change="changeValue()" />
    <el-tooltip effect="dark" v-if="addAble && !disabled" content="添加子条件" placement="bottom">
      <div class="ds-rule-item-action" @click="$emit('addItem')">
        <i class="ds-icon-rule-add" />
      </div>
    </el-tooltip>
    <el-tooltip effect="dark" v-if="!disabled" content="删除子条件" placement="bottom">
      <div class="ds-rule-item-action" @click="$emit('deleteItem')">
        <i class="ds-icon-rule-close" />
      </div>
    </el-tooltip>
  </el-form>
</template>
<script>
import DsMultiTypeSelect from "../../multi-type-select"
import SuperFormMixin from 'src/mixins/super-form-mixin'
import ValueItem from './valueItem'
import { getOpsOptions } from "src/utils/business"
export default {
  name: 'DsRulePropItem',
  mixins: [SuperFormMixin],
  components: {
    DsMultiTypeSelect,
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
      this.opsOptions = getOpsOptions(val?.eventFieldType)
      this.formData = val || {}
    },
    changeCondition(val) {
      this.resetThreeValue()
      this.changeValue()
    },
    async handleChange(val) {
      this.resetThreeValue()
      this.formData.type = val.type
      this.formData.ckColumn = val.ckColumn
      this.formData.eventFieldType = val.fieldType
      // 为布尔不需获取第三个框的数据
      this.opsOptions = getOpsOptions(val.fieldType)
      this.formData.eventFilterCode = this.opsOptions?.[0]?.value
      this.changeValue()
    },

    resetThreeValue() {
      this.formData.eventPropertyValue = []
    }
  }
}
</script>
<style lang="scss" scoped>
.ds-rule-prop-item {
  padding: 6px;
}
</style>
