<template>
  <el-form ref="form" :model="formData" hide-required-asterisk="true" :inline="true">
    <div class="fx-s-center">
      <el-form-item prop="eventPropertyCode">
        <DsMultiTypeSelect v-model="formData.eventActionCode" :options="eventOptions" :checkList="eventCheckList" checkShow ptypeJudge searchShow placeholder="请选择" @change="handleChange" />
      </el-form-item>
      <el-form-item prop="eventActionIndicatorCode">
        <el-cascader ref="cascader" v-model="formData.eventActionIndicatorCode" :options="targetOptions" placeholder="请选择"
          :props="{ expandTrigger: 'hover', key: 'id', value: 'eventPropertyCode',label: 'eventPropertyName', children: 'eventFilterDTOs' }" @change="changeValue" @visible-change="visibleChange" />
      </el-form-item>
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
    </div>
  </el-form>
</template>
<script>

import SuperFormMixin from 'src/mixins/super-form-mixin'
import { deepClone, toUUIDObject } from 'src/utils/object'
import { isArray, isObject } from 'src/utils/types'
import { getEventActionIndicator, getEventActionIndicatorAdd, getEventLabel } from "packages/api"
import DsMultiTypeSelect from "../../multi-type-select"


const eventFilterDTOs_NUM = [
  { eventPropertyCode: 'SUM', eventPropertyName: '总和' },
  { eventPropertyCode: 'AVG', eventPropertyName: '均值' },
  { eventPropertyCode: 'MAX', eventPropertyName: '最大值' },
  { eventPropertyCode: 'MIN', eventPropertyName: '最小值' },
  { eventPropertyCode: 'AVG_PERSON', eventPropertyName: '人均值' },
  { eventPropertyCode: 'DISTINCT', eventPropertyName: '去重数' }
]
const newEventFilterDTOs_OTHER = [
  { eventPropertyCode: 'DISTINCT', eventPropertyName: '去重数' }
]

const constTargetOptions = [
  {
    "eventPropertyCode": "100001",
    "eventPropertyName": "总次数"
  },
  {
    "eventPropertyCode": "100002",
    "eventPropertyName": "用户数"
  },
  {
    "eventPropertyCode": "100003",
    "eventPropertyName": "人均次数"
  }
]


const defaultItem = {
  conditionType: 0,
  // 事件行为下拉框id
  eventActionCode: '',
  // 事件行为指标id
  eventActionIndicatorCode: [],
  // 事件规则详情
  eventPropertyConditionGroupDTOs: []
}

export default {
  name: 'DsRuleAnalysisGroup',
  components: {
    DsMultiTypeSelect
  },
  mixins: [SuperFormMixin],
  data() {
    return {
      formData: toUUIDObject(deepClone(defaultItem)),
      targetOptions: constTargetOptions,
      eventOptions: [],
      eventCheckList: []
    }
  },
  created() {
    this.reqGetEventLabel()
  },
  mounted() {
    this.reqGetSecondOptions(this.formData?.eventActionCode)
  },
  methods: {
    reqGetEventLabel() {
      getEventLabel({}).then(({ code, data, message }) => {
        this.eventOptions = data.options || []
        this.eventCheckList = data.checkList || []
      }).catch(err => { console.log('err: ', err) }).finally(() => { })
    },
    handleChange(val) {
      this.formData.eventPropertyConditionGroupDTOs = []
      this.reqGetSecondOptions(val)
      console.log(constTargetOptions[0].eventPropertyCode)
      this.formData.eventActionIndicatorCode = [constTargetOptions[0].eventPropertyCode]
      this.changeValue()
    },
    reqGetSecondOptions(val) {
      if (!val?.nameEn) return
      getEventActionIndicatorAdd({ eventActionCode: val.nameEn }).then(({ code, data, message }) => {
        // 再赋值
        this.targetOptions = [
          ...constTargetOptions,
          ...(data || []).map(e => ({
            ...e,
            eventFilterDTOs: e.eventFieldType == 'NUM' ? eventFilterDTOs_NUM : newEventFilterDTOs_OTHER
          }))
        ]
      }).catch(err => {
        console.log('err: ', err)
      })
      // Promise.all([
      // getEventActionIndicator({ eventActionCode: val.nameEn }),
      //   getEventActionIndicatorAdd({ eventActionCode: val.nameEn })
      // ]).then(([res, res1]) => {
      //   // 再赋值
      //   this.targetOptions = [
      //     ...(res?.data || []),
      //     ...(res1?.data || []).map(e => ({
      //       ...e,
      //       eventFilterDTOs: e.eventFieldType == 'NUM' ? eventFilterDTOs_NUM : newEventFilterDTOs_OTHER
      //     }))
      //   ]
      // }).catch(err => {
      //   console.log('err: ', err)
      // })
    },
    clickAdd() {
      this.$refs?.RuleProp?.clickAdd()
    },
    clickDeletes() {
      this.$refs?.RuleProp?.clickDeletes()
    },
    visibleChange() {
      this.$nextTick(() => {
        let panel = this.$refs?.cascader?.$refs?.panel
        if (panel) {
          panel.activePath = []
        }
      })
    },
  },
}
</script>
<style lang="scss" scoped>
</style>
