<template>
  <div class="ds-rule-item">
    <el-form ref="form" :model="formData" @submit.native.prevent>
      <div class="ds-rule-item-header" :class="{'has-body': true}">
        <!-- <DsIconFont name="ds-icon-user-prop"></DsIconFont> -->
        <template v-if="$scopedSlots.title">
          <slot name="title" :from="formData" />
        </template>
        <template v-else-if="$slots.title">
          <slot name="title" />
        </template>
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
      <DsRuleAnalysisProp class="ds-rule-item-body" ref="RuleAnalysisProp" v-bind="$attrs" :disabled="disabled" :value="formData" />
    </el-form>
  </div>
</template>
<script>
import DsRuleAnalysisProp from '../../rule-analysis-group'
import SuperFormMixin from 'src/mixins/super-form-mixin'
import { deepClone, toUUIDObject, omit } from 'src/utils/object'
import { isArray, isObject } from 'src/utils/types'

const defaultItem = {
  nameSwitch: true, // 名字开关
  // 事件名称
  conditionName: '任意事件',
  // 事件规则属性开关
  conditionType: 0,
  // 事件行为下拉框id
  eventActionCode: '',
  // 事件行为指标id
  eventActionIndicatorCode: [],
  // 事件规则详情
  eventPropertyConditionGroupDTOs: []
}

export const getDefaultItem = () => {
  return toUUIDObject(deepClone(defaultItem))
}

export default {
  name: 'DsRuleEventAnalysisGroup',
  components: {
    DsRuleAnalysisProp
  },
  mixins: [SuperFormMixin],
  data() {
    return {
      formData: getDefaultItem(),
      targetOptions: []
    }
  },
  methods: {
    toFormData(val) {
      const formData = val || deepClone(defaultFrom)
      // const labelRules = formData?.labelRules?.map(v => {
      //   if (isArray(v?.labelRules) && v?.labelRules.length) {
      //     const { relation, labelRules } = v
      //     return toUUIDObject({ relation, labelRules: labelRules.map(toUUIDObject) })
      //   }
      //   return toUUIDObject({ relation: "AND", labelRules: [toUUIDObject(v)] })
      // })
      const conditionName = formData?.conditionName || '任意事件'
      const conditionType = formData?.conditionType || 0
      const lastArr = formData?.eventActionIndicatorFormula ? [formData?.eventActionIndicatorFormula] : []
      const eventActionIndicatorCode_ = typeof formData?.eventActionIndicatorCode === 'string' ? [formData?.eventActionIndicatorCode] : formData?.eventActionIndicatorCode
      const eventActionIndicatorCode = eventActionIndicatorCode_ ? [...eventActionIndicatorCode_, ...lastArr] : [...lastArr]
      const eventActionCode = formData?.eventActionCode || ''
      Object.assign(this.formData, {
        ...formData,
        conditionName,
        conditionType,
        eventActionIndicatorCode,
        eventActionCode
      })
    },
    fromDataTo(formData) {
      formData = omit(formData, ['_uuid'])
      const [eventActionIndicatorCode, eventActionIndicatorFormula] = formData.eventActionIndicatorCode
      // const labelRules = formData?.labelRules?.map(v => {
      //   if (v?.labelRules?.length == 1) {
      //     return v?.labelRules[0]
      //   }
      //   return v
      // })
      return {
        ...formData,
        eventActionIndicatorCode,
        eventActionIndicatorFormula
      }
    },
    clickAdd() {
      // this.$refs?.RuleProp?.clickAdd()
    },
    clickDeletes() {
      // this.$refs?.RuleProp?.clickDeletes()
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
