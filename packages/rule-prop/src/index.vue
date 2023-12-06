<template>
  <!-- 用户属性满足 -->
  <el-form ref="form" v-if="formData.labelRules.length" class="fx" :model="formData" :hide-required-asterisk="true" :inline="true">
    <div class="ds-rule-switch-warp" v-if="formData.labelRules.length > 1">
      <DsSwitchWarp v-model="formData.relation" :disabled="disabled" active-value="AND" inactive-value="OR" />
    </div>
    <div class="fx-full">
      <div class="fx" v-for="(item,index) in formData.labelRules" :key="index">
        <div class="ds-rule-switch-warp" v-if="hasChildrenCount(item) > 1">
          <DsSwitchWarp v-model="item.relation" :disabled="disabled" active-value="AND" inactive-value="OR" />
        </div>
        <div class="fx-full">
          <RulePropItem v-for="(inIt, idx) in item.labelRules" :value="inIt" :key="inIt._uuid" :addAble="addAble(item, idx)" v-bind="$attrs" :disabled="disabled" />
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
  optionsNew: [],
  isInput: true,
  conditionOptions: [],
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
  computed: {
    hasChildrenCount() {
      return item => item?.labelRules?.length
    },
    addAble() {
      return (outItem, idx) => {
        const itemsCount = outItem.labelRules.length
        return itemsCount > 1 && idx == itemsCount - 1
      }
    }
  },
  methods: {
    clickAdd() {
      const items = this.formData.labelRules
      const childrenCount = items.reduce((prev, next) => {
        prev += next?.labelRules?.length || 0
        return prev
      }, 0)
      if (childrenCount >= 20) return this.$message.warning('筛选条件最多为20条')
      const item = {
        relation: "AND",
        labelRules: [toUUIDObject(deepClone(defaultItem))]
      }
      this.formData.labelRules.push(toUUIDObject(item))
    },
    clickDeletes() {
      this.$refs?.RuleProp?.clickDeletes()
      this.formData.labelRules = []
      // this.dataList = []
    },

    clickInnerAdd() {

    },

    changeData() {

    },
    clickDelete() {

    },

  }
}
</script>
