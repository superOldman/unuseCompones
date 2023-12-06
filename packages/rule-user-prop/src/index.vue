<template>
  <div class="ds-rule-item">
    <el-form ref="form" :model="formData">
      <div class="ds-rule-item-header" :class="{'has-body': !!formData.labelRules.length}">
        <DsIconFont name="ds-icon-user-prop"></DsIconFont>
        <div class="ds-rule-item-title">用户属性满足</div>
        <div class="fx-full" />
        <div v-if="!disabled" class="ds-rule-item-actions">
          <el-tooltip effect="dark" content="添加条件组" placement="bottom">
            <div class="ds-rule-item-action" @click="clickAdd"><i class="ds-icon-rule-add" /></div>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除条件组" placement="bottom">
            <div class="ds-rule-item-action danger" @click="clickDeletes"><i class="ds-icon-rule-delete" /></div>
          </el-tooltip>
        </div>
      </div>
      <!-- <el-collapse-transition> -->
      <DsRuleProp ref="RuleProp" v-bind="$attrs" :disabled="disabled" class="ds-rule-item-body" :value="formData" />
    </el-form>
    <!-- </el-collapse-transition> -->
  </div>
</template>
<script>
import DsRuleProp from '../../rule-prop'
import SuperFormMixin from 'src/mixins/super-form-mixin'
import { deepClone, toUUIDObject } from 'src/utils/object'
import { isArray, isObject } from 'src/utils/types'

const defaultFrom = {
  relation: "AND",
  labelRules: []
}

export default {
  name: 'DsRuleUserProp',
  components: {
    DsRuleProp
  },
  mixins: [SuperFormMixin],
  data() {
    return {
      formData: deepClone(defaultFrom),
    }
  },
  methods: {
    toFormData(val) {
      const formData = val || deepClone(defaultFrom)
      const labelRules = formData?.labelRules?.map(v => {
        if (isArray(v?.labelRules) && v?.labelRules.length) {
          const { relation, labelRules } = v
          return toUUIDObject({ relation, labelRules: labelRules.map(toUUIDObject) })
        }
        return toUUIDObject({ relation: "AND", labelRules: [toUUIDObject(v)] })
      })
      this.formData = {
        ...formData,
        labelRules: labelRules || []
      }
    },
    clickAdd() {
      this.$refs?.RuleProp?.clickAdd()
    },
    clickDeletes() {
      this.$refs?.RuleProp?.clickDeletes()
    },
    // 最外层添加数据
    validForm() {
      let result = false
      this.$refs['form'].validate((valid) => {
        this.form = this.formData
        result = valid
      })
      return result
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
