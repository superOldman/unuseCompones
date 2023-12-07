<template>
  <!-- 用户属性满足 -->
  <el-form ref="form" v-if="formData.labelRules.length" class="fx" :model="formData" :hide-required-asterisk="true" :inline="true">
    <div class="ds-rule-switch-warp" v-if="formData.labelRules.length > 1">
      <DsSwitchWarp v-model="formData.relation" @change="changeValue" :disabled="disabled" active-value="AND" inactive-value="OR" />
    </div>
    <div class="fx-full">
      <div class="fx" v-for="(item,index) in formData.labelRules" :key="index">
        <div class="ds-rule-switch-warp" v-if="hasChildrenCount(item) > 1">
          <DsSwitchWarp v-model="item.relation" @change="changeValue" :disabled="disabled" active-value="AND" inactive-value="OR" />
        </div>
        <div class="fx-full ds-rule-group">
          <RulePropItem :style="propItemStyle(item)" v-for="(inIt, idx) in item.labelRules" @addItem="clickAddItem(item)" @deleteItem="clickDeleteItem(item, idx)" v-model="item.labelRules[idx]"
            @change="changeValue" :key="inIt._uuid" :addAble="addAble(item, idx)" v-bind="$attrs" :disabled="disabled" />
          <!-- <UserAttributeInside v-for="(labelRule,index1) in item.labelRules" :key="index1" :attributeOptions="attributeOptions"
            :currentData="{item:labelRule,indexArr:[index1,index],level:2,showAddIndex:item.labelRules.length-1,dataLength:formData.labelRules.length}" @addInsideData="clickInnerAdd(index,item)"
            @delTagGroupItem="clickDelete($event,item)" @changeData="changeData($event,item)" /> -->
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
  type: '',
  ruleType: 'USER_FIELD',
  field: '',
  fieldType: '',
  function: '',
  params: [],
  paramsToString: '',
  isInput: true,
  betweenRranking1: '',
  betweenRranking2: '',
  fieldValue: '',
}

export default {
  name: 'DsRuleProp',
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
        const outer = this.formData.labelRules.length > 1
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
      return item => item?.labelRules?.length
    },
    addAble() {
      return (outItem, idx) => {
        const itemsCount = outItem.labelRules.length
        if (this.formData.labelRules.length == 1 && itemsCount == 1) {
          return false
        }
        return itemsCount && idx == itemsCount - 1
      }
    }
  },
  methods: {
    beforeAdd() {
      const items = this.formData.labelRules
      const childrenCount = items.reduce((prev, next) => {
        prev += next?.labelRules?.length || 0
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
        relation: "AND",
        labelRules: [toUUIDObject(deepClone(defaultItem))]
      }
      this.formData.labelRules.push(toUUIDObject(item))
      this.changeValue()
      // TODO: 强制刷新问题等待后期处理
      this.$forceUpdate()
    },
    clickDeletes() {
      this.formData.labelRules = []
      this.formData.relation = "AND"
      this.changeValue()
    },
    clickAddItem(outItem) {
      if (!this.beforeAdd()) return
      outItem.labelRules.push(toUUIDObject(deepClone(defaultItem)))
      this.changeValue()
    },
    clickDeleteItem(outItem, idx) {
      outItem.labelRules.splice(idx, 1);
      if (outItem.labelRules.length < 1) {
        this.formData.labelRules.splice(this.formData.labelRules.indexOf(outItem), 1);
      } else if (outItem.labelRules.length < 2) {
        outItem.relation = "AND"
      }
      if (this.formData.labelRules.length < 2) {
        this.formData.relation = "AND"
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
