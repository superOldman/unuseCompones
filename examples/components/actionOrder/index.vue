<template>
  <div class="fx fx-full fx-c action-order-container inputInnerBg">
    <div class="fx fx-between fx-s-center">
      <div class="title_icon_box">行为序列</div>
      <el-button v-if="!isPreview && !isQuote" type="primary" size="mini" class="tagGroupItemAddBtn" @click="addActionOrder">
        <div class="fx-s-center">
          添加
        </div>
      </el-button>
    </div>
    <!-- 行为序列里面的判断 -->
    <div v-if="actionDataNew && actionDataNew.labelRules && actionDataNew.labelRules.length" class="fx tagConRightCon">
      <div class="fx-ps-center tagGroupLeft userGroup_behavior">
        <div class="line" :style="`background: ${actionDataNew.labelRules.length < 1 ? '#BEDAFF' : '#165DFF'}`"></div>
        <div class="div-switch">
          <el-switch v-model="actionDataNew.relation" :disabled="isPreview || isQuote || actionDataNew.labelRules.length <= 1" :active-value="'AND'" :inactive-value="'OR'" size="medium"
            languageType="Chinese" active-text="且" inactive-text="或" />
        </div>
      </div>
      <div v-if="actionDataNew.labelRules.length>0" class="fx-full tagGroupRight">
        <action-order-inside v-for="(item, index) in actionDataNew.labelRules" :key="index" :ref="`actionOrder${index+1}`"
          :currentData="{item,indexArr:[index],dataLength:actionDataNew.labelRules.length}" :appNames="appNames" :optionsData="{optionsSign,optionsTwice}" :data-wrap="`actionOrder${index+1}`"
          :event_list="event_list" :isQuote="isQuote" @deleteLabelRule="deleteLabelRule" @addGroupItem="addGroupItem"></action-order-inside>
      </div>
    </div>
  </div>
</template>

<script type="text/javascript">
import ActionOrderInside from './inside.vue'
import { getEventLabel, getLabel, getFieldValuesSelect } from 'packages/api/index'
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
// 这两个接口要存放两个数据
// import { mapState } from 'vuex'
export default {
  components: {
    ActionOrderInside
  },
  mixins: [enumerationConditionOptions],
  props: {
    actionData: {
      type: Object,
      default: () => ({})
    },
    relationSet: {
      type: String,
      default: 'AND'
    }
  },
  data() {
    return {
      event_list: {},
      optionsSign: [],
      isPreview: false,
      isQuote: false,
      appNames: [],
      timeParamsBF: [],
      fieldValueBF: '', // 第一层枚举（下）
      optionsTwice: [],
      actionDataNew: {}
    }
  },

  computed: {
    // ...mapState({
    //   event_list: state => state.attributeAndBehavior.eventOptions,
    //   optionsSign: state => state.attributeAndBehavior.attributeOptions.options
    // })
  },
  watch: {
    actionData: {
      handler(val) {
        this.actionDataNew = JSON.parse(JSON.stringify(val))
        if (!this.isAdd) {
          this.initList()
        }
      },
      deep: true,
      immediate: true
    }
  },
  async created() {
    //  await this.getEventActions()
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const day = new Date().getDate()
    const today = `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
    this.timeParamsBF = [today, today]
    //this.getNextSelectValue() //this.event_list.options[0].options[0].value
  },
  mounted() {
    // this.initList()
  },
  methods: {
    initList() {
      let data = (this.actionDataNew?.labelRules && Array.isArray(this.actionDataNew.labelRules)) ? this.actionDataNew.labelRules : []
      if (!this.isAdd && data.length > 0) {
        this.actionDataNew.labelRules.forEach(async item => {
          item.steps.forEach(async step => {
            let res = await this.getNextSelectValue(step.event)
            this.$set(step, 'optionsSign', res)
          })
        })
      }
    },
    async saveData() {
      // 一条数据都没有等于校验通过
      if (!this.actionDataNew.labelRules.length) return [true]
      let wrapName = []
      this.actionDataNew.labelRules.forEach((item, index) => {
        wrapName.push(`actionOrder${index + 1}`)
      })
      return await this.getValidateAllComponent(wrapName)
    },
    getValidateAllComponent(refsNames) {
      let allValidateSuccess = []
      refsNames.forEach((name, index) => {
        allValidateSuccess.push(new Promise(resolve => {
          console.log(this.$refs[name], name, this.$refs[name][0].$refs.actionOrderRule)
          this.$refs[name][0].$refs.actionOrderRule.validate((valid) => {
            if (valid) {
              resolve(valid)
            } else {
              resolve(false)
            }
          })
        }))
      })
      return new Promise(resolve => {
        Promise.all(allValidateSuccess)
          .then(res => {
            resolve(res)
          })
      })
    },
    async getEventActions() {
      let res = await getEventLabel({})
      if (res.code == 200) {
        this.event_list = res.data
      } else this.$message.error(`${res.message}`)
    },
    addActionOrder() { // 点击添加 行为序列
      let detail = this.event_list?.options?.find(item => item.options && item.options.length > 0)
      let labelRules = [
        ...this.actionDataNew.labelRules, {
          timeFunction: 'absolute_time', // relative_time
          timeParams: this.timeParamsBF,
          steps: [{
            event: detail?.options[0],
            filters: [{
              type: 'FILTERS_RELATION',
              relation: 'AND',
              subFilters: []
            }]
          },
          {
            event: detail?.options[0],
            filters: [{
              type: 'FILTERS_RELATION',
              relation: 'AND',
              subFilters: []
            }]
          }]
        }]
      this.$set(this.actionDataNew, 'labelRules', labelRules)
    },
    deleteLabelRule(obj) { // 删除行为序列 step
      this.actionDataNew.labelRules.splice(obj.indexArr, 1)
    },
    thirdLevelData(optionsSign) {
      let detail = optionsSign.find(item => item.options && item.options.length > 0)
      return {
        fieldValue: '',
        fieldValue1: '',
        fieldValue2: '',
        isInput: !['IS_SET', 'NOT_SET', 'IS_EMPTY', 'NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(this.AnalyzingConditions(detail.options[0].type)[0].value), //)detail.options[0]?.eventFilterDTOs[0]?.eventFunctionCode),
        conditionOptions: this.AnalyzingConditions(detail.options[0].type), // detail.options[0].eventFilterDTOs,
        type: detail.options[0]?.type, // 写死    EVENT_FIELD
        fieldType: detail.options[0]?.fieldType, // 第一个下拉框对应的属性的类型，数值型NUM、 日期DATE、字符串STRING、布尔BOOLEAN
        field: {
          ...detail.options[0]
        }, // 下拉框枚举 //eventFunctionCode
        ckCloumn: detail.options[0].ckCloumn,
        function: this.AnalyzingConditions(detail.options[0].type)[0].value, //detail.options[0]?.eventFilterDTOs[0]?.eventFunctionCode,
        // limit: detail.options[0]?.eventFilterDTOs[0]?.inputNum,
        filterType: detail.options[0].type,
        params: []
      }
    },
    async getFieldValuesSelectList(val, type) {
      // 事件属性也需要掉接口---2023/03/17
      // if (type != 1 && type != 2) return []
      let res = await getFieldValuesSelect({
        field: val, // 字段属性
        ruleType: type
      })
      if (res.success) { return res.data } else return []
    },
    async getNextSelectValue(val) { // 初始化值需要
      let params = { typeList: [1, 2, 3, 4], eventActionCode: val.nameEn, filterList: null }
      if (!this.isAdd) params.filterList = [
        {
          id: this.crowdOrTagType == 3 ? this.detailData.id : this.detailId,
          type: this.crowdOrTagType
        }
      ]
      let res = await getLabel(params)
      let options = []
      if (res.code == 200) {
        options = res.data.options
      } else this.$message.error(`${res.message}`)
      return options
    },
    // 替换掉接口返回的枚举值的第二层结构
    replaceResData(val) { // 初始化值需要
      return val.map((item) => {
        // 总次数不加替换的枚举
        if (!item.isReplace) {
          item.eventFilterDTOs = this.newEventFilterDTOs3
        }
        return item
      })
    },
    async addGroupItem(stepIndex, index) { // filters[0].subFilters.push(this.thirdLevelData())
      console.log(stepIndex, index)
      let res = this.actionDataNew.labelRules[index].steps[stepIndex].optionsSign ? JSON.parse(JSON.stringify(this.actionDataNew.labelRules[index].steps[stepIndex].optionsSign)) : []
      if (res.length == 0) {
        res = await this.getNextSelectValue(this.actionDataNew.labelRules[index].steps[stepIndex].event)
        this.actionDataNew.labelRules[index].steps[stepIndex].optionsSign = res
      }
      let detail = res.find(item => item.options && item.options.length > 0)
      let data = []
      if (detail.options[0] && detail.options[0].filterType != 'BOOLEAN') data = await this.getFieldValuesSelectList(detail.options[0]?.nameEn, detail.options[0].parentId)
      let itemData = this.thirdLevelData(res)
      itemData.optionsNew = data
      this.actionDataNew.labelRules[index].steps[stepIndex].filters[0].subFilters.push(itemData)
      // 筛选条件和前面的事件有关系
    }
  }
}
</script>

<style scoped lang="scss">
.action-order-container {
  padding: 8px 12px;
  margin-top: 16px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  .title_icon_box {
    color: #1d2129;
    font-weight: bold;
    div i {
      height: 30px;
      line-height: 30px;
    }
  }
  .tagGroupItemAddBtn.el-button--mini {
    border-radius: 4px;
  }
  ::v-deep .tagGroupLeft {
    border-right: none;
    position: relative;
    .div-switch {
      padding: 10px 0;
      text-align: center;
      background: #fff;
      z-index: 99;
    }
    .line {
      width: 1px;
      height: 100%;
      background: #165dff;
      transform: translateX(21px);
    }
  }
  .tagConRightCon {
    .fx-full {
      width: auto;
    }
  }
  .userGroup_behavior {
    padding: 12px 0 6px;
  }
  .tagGroupRight {
    flex-direction: column;
    padding: 6px 0px 0px 6px;
  }
}
</style>
