<template>
  <!-- 用户属性满足 -->
  <el-form ref="form" v-if="formData.eventPropertyConditionGroupDTOs.length" class="fx" :model="formData" :hide-required-asterisk="true" :inline="true">
    <div class="ds-rule-switch-warp" v-if="formData.eventPropertyConditionGroupDTOs.length > 1">
      <DsSwitchWarp v-model="formData.conditionType" @change="changeValue" :disabled="disabled" :active-value="0" :inactive-value="1" />
    </div>
    <div class="fx-full">
      <div class="fx" v-for="(item,index) in formData.eventPropertyConditionGroupDTOs" :key="index">
        <div class="ds-rule-switch-warp" v-if="hasChildrenCount(item) > 1">
          <DsSwitchWarp v-model="item.conditionType" @change="changeValue" :disabled="disabled" :active-value="0" :inactive-value="1" />
        </div>
        <div class="fx-full ds-rule-group">
          <RulePropItem :style="propItemStyle(item)" v-for="(inIt, idx) in item.eventPropertyConditionDTOs" @addItem="clickAddItem(item)" @deleteItem="clickDeleteItem(item, idx)"
            v-model="item.eventPropertyConditionDTOs[idx]" @change="changeValue" :key="inIt._uuid" :addAble="addAble(item, idx)" v-bind="$attrs" :disabled="disabled" />
        </div>
      </div>
    </div>
  </el-form>
</template>
<script>
import SuperFormMixin from 'src/mixins/super-form-mixin'
import RulePropItem from "./rulePropItem.vue"
import { deepClone, toUUIDObject } from 'src/utils/object'

const defaultItem = {
  // 属性分析第一个下拉框枚举
  eventPropertyCode: '',
  // 属性分析关系id
  eventFilterCode: '',
  // 属性分析输入框内容
  eventPropertyValue: [],
  // 属性字段类型
  eventFieldType: '',
  ckColumn: '',
  type: ''
}

export default {
  name: 'DsRuleProp1',
  mixins: [SuperFormMixin],
  components: {
    RulePropItem
  },
  props: {
    baseLevel: {
      type: Number,
      default: 0
    }
  },
  computed: {
    propItemStyle() {
      return (item) => {
        const outer = this.formData.eventPropertyConditionGroupDTOs.length > 1
        const inner = this.hasChildrenCount(item) > 1
        const levelLeft = 12 + 32 * (this.baseLevel + [outer, inner].filter(v => v).length)
        return {
          'margin-left': `-${levelLeft}px`,
          'padding-left': `${levelLeft}px`,
          'margin-right': `-${12}px`,
          'padding-right': `${12}px`
        }
      }
    },
    hasChildrenCount() {
      return item => item?.eventPropertyConditionDTOs?.length
    },
    addAble() {
      return (outItem, idx) => {
        const itemsCount = outItem.eventPropertyConditionDTOs.length
        if (this.formData.eventPropertyConditionGroupDTOs.length == 1 && itemsCount == 1) {
          return false
        }
        return itemsCount && idx == itemsCount - 1
      }
    }
  },
  methods: {
    beforeAdd() {
      const items = this.formData.eventPropertyConditionGroupDTOs
      const childrenCount = items.reduce((prev, next) => {
        prev += next?.eventPropertyConditionDTOs?.length || 0
        return prev
      }, 0)
      if (childrenCount >= 20) {
        this.$message.warning('筛选条件最多为20条')
        return false
      }
      return true
    },
    clickAdd() {
      if (!this.beforeAdd()) return
      const item = {
        conditionType: 0,
        eventPropertyConditionDTOs: [toUUIDObject(deepClone(defaultItem))]
      }
      this.formData.eventPropertyConditionGroupDTOs.push(toUUIDObject(item))
      this.changeValue()
      // TODO: 强制刷新问题等待后期处理
      this.$forceUpdate()
    },
    clickDeletes() {
      this.formData.eventPropertyConditionGroupDTOs = []
      this.formData.conditionType = 0
      this.changeValue()
    },
    clickAddItem(outItem) {
      if (!this.beforeAdd()) return
      outItem.eventPropertyConditionDTOs.push(toUUIDObject(deepClone(defaultItem)))
      this.changeValue()
    },
    clickDeleteItem(outItem, idx) {
      outItem.eventPropertyConditionDTOs.splice(idx, 1);
      if (outItem.eventPropertyConditionDTOs.length < 1) {
        this.formData.eventPropertyConditionGroupDTOs.splice(this.formData.eventPropertyConditionGroupDTOs.indexOf(outItem), 1);
      } else if (outItem.eventPropertyConditionDTOs.length < 2) {
        outItem.conditionType = 0
      }
      if (this.formData.eventPropertyConditionGroupDTOs.length < 2) {
        this.formData.conditionType = 0
      }
      this.changeValue()
    }
  }
}
</script>
<style lang="scss" scoped>
.ds-rule-group:hover .ds-rule-prop-item {
  background-color: #f0f6fd;
}
.ds-rule-prop-item:hover {
  background-color: #d9e8fd !important;
}
</style>
