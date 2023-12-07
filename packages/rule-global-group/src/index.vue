<template>
  <div class="ds-rule-item">
    <el-form ref="form" :model="formData">
      <div class="ds-rule-item-header" :class="{'has-body': !!formData.eventPropertyConditionGroupDTOs.length}">
        <!-- <DsIconFont name="ds-icon-user-prop"></DsIconFont> -->
        <div class="ds-rule-item-title ml-0">全局筛选</div>
        <el-tooltip effect="dark" placement="top-start">
          <div slot="content">
            <div>全局筛选可以帮助您进行用户的过滤和筛选，确定需要分析的是符合哪些条件的用户，具备最高优先级。</div>
          </div>
          <i class="ds-icon-help ml-8" />
        </el-tooltip>
        <div class="fx-full" />
        <div v-if="!disabled" class="ds-rule-item-actions">
          <el-tooltip effect="dark" content="添加全局筛选条件" placement="bottom">
            <div class="ds-rule-item-action" @click="clickAdd"><i class="ds-icon-rule-add" /></div>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除全局筛选条件" placement="bottom">
            <div class="ds-rule-item-action danger" @click="clickDeletes"><i class="ds-icon-rule-delete" /></div>
          </el-tooltip>
        </div>
      </div>
      <DsRuleProp1 ref="RuleProp" v-bind="$attrs" :disabled="disabled" class="ds-rule-item-body" v-model="formData" @change="changeValue" />
    </el-form>
  </div>
</template>
<script>
import DsRuleProp1 from '../../rule-prop1'
import SuperFormMixin from 'src/mixins/super-form-mixin'
import { deepClone, toUUIDObject, omit } from 'src/utils/object'
import { isArray, isObject } from 'src/utils/types'

const defaultFrom = {
  conditionType: 0,
  eventPropertyConditionGroupDTOs: []
}

export default {
  name: 'DsRuleGlobalGroup',
  components: {
    DsRuleProp1
  },
  mixins: [SuperFormMixin],
  data() {
    return {
      formData: deepClone(defaultFrom),
    }
  },
  methods: {
    // changeValue(val) {
    //   this.inner_value = this.fromDataTo(this.formData)
    //   this.$emit('input', this.inner_value)
    //   this.$emit('change', this.inner_value)
    //   console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!`, val)
    // },
    toFormData(val) {
      const formData = val || deepClone(defaultFrom)
      const eventPropertyConditionGroupDTOs = formData?.eventPropertyConditionGroupDTOs?.map(v => {
        const { conditionType, eventPropertyConditionDTOs } = v
        return toUUIDObject({ conditionType: conditionType || 0, eventPropertyConditionDTOs: eventPropertyConditionDTOs.map(toUUIDObject) })
      })
      Object.assign(this.formData, {
        ...formData,
        eventPropertyConditionGroupDTOs: eventPropertyConditionGroupDTOs || []
      })
    },
    fromDataTo(formData) {
      formData = omit(formData, ['_uuid'])
      const eventPropertyConditionGroupDTOs = formData?.eventPropertyConditionGroupDTOs?.map(v => {
        return v
      })
      return {
        ...formData,
        eventPropertyConditionGroupDTOs: eventPropertyConditionGroupDTOs || []
      }
    },
    clickAdd() {
      this.$refs?.RuleProp?.clickAdd()
    },
    clickDeletes() {
      this.$refs?.RuleProp?.clickDeletes()
    }
  },
}
</script>
<style lang="scss" scoped>
</style>
