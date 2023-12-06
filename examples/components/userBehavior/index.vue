<template>
  <div class="tagConRight userBehavior firstBox inputInnerBg">
    <div class="tagConRight_header">
      <div class="title_icon_box">
        <div>用户行为满足</div>
      </div>
      <!-- 不是查看 不是编辑 -->
      <div v-if="!isPreview && !isQuote" class="tagGroupItemAddBtn">
        <el-button type="primary" size="mini" @click="addGroupItem(1)">
          <div class="fx-s-center">
            添加
          </div>
        </el-button>
      </div>
    </div>
    <div v-if="dataList.length" class="tagConRightCon settingDataList">
      <div v-if="dataList.length > 1" class="tagGroupLeft" :class="[dataList.length > 1 ? 'userGroup_behavior' : '']">
        <div v-if="dataList.length > 1" class="line"></div>
        <div class="div-switch">
          <el-switch v-model="relation" :disabled="isPreview || isQuote || dataList.length <= 1" :active-value="'AND'" :inactive-value="'OR'" size="medium" languageType="Chinese" active-text="且"
            inactive-text="或" @change="updateData" />
        </div>
      </div>
      <div class="tagGroupRight userConRight">
        <div v-for="(item,index) in dataList" :key="index" class="tagConRightCon">
          <template v-if="item.labelRules && item.labelRules.length > 1">
            <div class="tagGroupLeft" :class="[item.labelRules.length > 1 ? 'userGroup_behavior' : '']">
              <div v-if="item.labelRules.length > 1" class="line"></div>
              <div class="div-switch">
                <el-switch v-model="item.relation" :disabled="isPreview || isQuote || item.labelRules.length <= 1" :active-value="'AND'" :inactive-value="'OR'" size="medium" languageType="Chinese"
                  active-text="且" inactive-text="或" @change="updateData" />
              </div>
            </div>
            <div class="tagGroupRight userConRight">
              <div v-for="(sItem,sIndex) in item.labelRules" :key="sIndex">
                <UserBehaviorInside :ref="`labelComponent${index+1}${sIndex+1}`" :key="updateKey" :eventOptions="eventOptions" :attributeOptions="attributeOptions"
                  :currentData="{item:sItem,indexArr:[sIndex,index],level:2,showAddIndex:item.labelRules.length-1,dataLength:dataList.length}" @addInsideData="addInsideData(index,item)"
                  @changeData="changeData($event,item)" @addGroupItem="addGroupItem" @delItem="delItem($event,item)" />
              </div>
            </div>
          </template>
          <template v-else>
            <UserBehaviorInside :ref="`labelComponent${index+1}`" :key="updateKey" :eventOptions="eventOptions" :attributeOptions="attributeOptions"
              :currentData="{item,indexArr:[index],level:1,dataLength:dataList.length}" @addInsideData="addInsideData(index,item)" @changeData="changeData($event,item)" @addGroupItem="addGroupItem"
              @delItem="delItem($event,item)" />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { getLabel, getEventActionProperty } from 'packages/api/index'
import UserBehaviorInside from './inside.vue'
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
export default {
  name: 'UserBehavior',
  components: {
    UserBehaviorInside
  },
  mixins: [enumerationConditionOptions],
  props: {
    userBehaviorData: {
      type: Array,
      default: () => []
    },
    userBehaviorRelation: {
      type: String,
      default: () => 'AND'
    }
  },
  data() {
    return {
      isPreview: false,
      isQuote: false,
      dataList: [],
      relation: 'AND',
      timeParamsBF: [], // 第一层时间
      fieldBF: '', // 内层枚举
      inFunctionBF: [], // 内层关系
      fieldValueBF: '', // 第一层枚举（下）
      optionsSign: [],
      optionsTwice: [],
      updateKey: 1, //更新组件状态
      eventOptions: {},
      attributeOptions: {}
    }
  },
  computed: {
  },
  watch: {
    userBehaviorData: {
      async handler(newVal, oldVal) {
        console.log(newVal, oldVal, '>>>>>>>>');
        let userBehaviorDataCp = JSON.parse(JSON.stringify(newVal));
        let userBehaviorDataNew = await this.getSelect(userBehaviorDataCp);
        this.dataList = userBehaviorDataNew
      },
      deep: true,
      immediate: true,
    },
    userBehaviorRelation: {
      async handler() {
        this.relation = this.userBehaviorRelation
      }
    },
    // '$store.state.attributeAndBehavior.eventOptions': { // 监听事件标签
    //   handler(val) {
    //     if (Object.keys(val).length > 0) {
    //       this.eventOptions = val
    //       let eventCode = val?.options && val?.options[0]?.options[0]?.nameEn || ''
    //       // 创建逻辑获取默认值
    //       if (!this.isPreview) this.getNextSelectValue(eventCode)
    //     }
    //   },
    //   deep: true,
    //   immediate: true
    // },

    // '$store.state.attributeAndBehavior.attributeOptions': { // 监听属性标签
    //   handler(val) {
    //     if (Object.keys(val).length > 0) {
    //       this.attributeOptions = val
    //     }
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },
  async created() {
    const year = new Date().getFullYear()
    const month = new Date().getMonth() + 1
    const day = new Date().getDate()
    const today = `${year}-${month > 9 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
    this.timeParamsBF = [today, today]
  },
  mounted() {
  },
  methods: {
    updateData() {
      // 收集子组件数据
      return new Promise(resolve => {
        let _datas = JSON.parse(JSON.stringify(this.dataList))
        _datas = _datas.map((item, index) => {
          if (Array.isArray(item.labelRules) && item.labelRules.length > 0) {
            item.labelRules = item.labelRules.map((sItem, sIndex) => {
              let name = `labelComponent${index + 1}${sIndex + 1}`
              sItem = this.$refs[name][0].currentItem
              return sItem
            })
            return item
          } else {
            let name = `labelComponent${index + 1}`
            item = this.$refs[name][0].currentItem
            return item
          }
        })
        this.dataList = _datas
        resolve(true)
      })
    },
    async saveData() {
      // 一条数据都没有等于校验通过
      if (!this.dataList.length) return [true]
      let refsNames = []
      // 校验规则
      let _datas = JSON.parse(JSON.stringify(this.dataList))
      _datas = _datas.map((item, index) => {
        if (Array.isArray(item.labelRules) && item.labelRules.length > 0) {
          item.labelRules = item.labelRules.map((sItem, sIndex) => {
            let name = `labelComponent${index + 1}${sIndex + 1}`
            sItem = this.$refs[name][0].currentItem
            refsNames.push(name)
            return sItem
          })
          return item
        } else {
          let name = `labelComponent${index + 1}`
          item = this.$refs[name][0].currentItem
          refsNames.push(`labelComponent${index + 1}`)
          return item
        }
      })
      this.dataList = _datas
      let _data = await this.getValidateAllComponent(refsNames)
      return _data
    },
    getValidateAllComponent(refsNames) {
      let allValidateSuccess = []
      refsNames.forEach((name, index) => {
        allValidateSuccess.push(new Promise(resolve => {
          console.log(this.$refs[name], name)
          this.$refs[name][0].validate((valid) => {
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
    getNextSelectValue(val) { // 初始化值需要
      if (!val) return
      return new Promise(resolve => {
        const param = {
          eventActionCode: val
          // eventPropertyType: 0
        }
        getEventActionProperty(param).then((res) => {
          if (res.success) {
            const arrBefore = JSON.parse(JSON.stringify(res.data || []).replace(/eventFilterName/g, 'eventPropertyName'))
            let arrAfter = JSON.parse(JSON.stringify(arrBefore).replace(/eventFilterCode/g, 'eventPropertyCode'))
            // 往接口返回的数据里面塞一个总次数，放在外层
            if (!arrAfter.length || arrAfter[0]?.eventPropertyCode !== 'GENERAL') {
              const general = [
                {
                  eventPropertyCode: 'GENERAL',
                  eventPropertyName: '总次数',
                  eventFieldType: 'NUM',
                  isReplace: true
                },
                {
                  eventPropertyCode: 'TIMES_PER_DAY',
                  eventPropertyName: '每日次数',
                  eventFieldType: 'NUM',
                  isReplace: true
                },
                {
                  eventPropertyCode: 'DISTRIBUTION_DAYS',
                  eventPropertyName: '天数分布',
                  eventFieldType: 'NUM',
                  isReplace: true
                }
              ]
              arrAfter = [...general, ...arrAfter]
            }
            // 筛选类型为num的赋值给到外层下拉框
            const arrAfterTwice = arrAfter.filter(item => item.eventFieldType === 'NUM')
            this.optionsTwice = this.replaceResData(arrAfterTwice)
            if (this.fieldValueBF === '') {
              this.fieldValueBF = this.optionsTwice[0].eventPropertyCode
            }
            resolve(true)
          }
        }).catch((err) => {
          console.log(err)
        })
      })
    },
    // 替换掉接口返回的枚举值的第二层结构
    replaceResData(val) { // 初始化值需要
      return val.map((item) => {
        // if (item.eventFilterDTOs) {
        //   item.eventFilterDTOs = this.newEventFilterDTOs3
        // }
        // 总次数不加替换的枚举
        if (item.isReplace) {
          // item.eventFilterDTOs = this.newEventFilterDTOs3
        } else {
          item.eventFilterDTOs = this.newEventFilterDTOs3
        }
        // item.eventFilterDTOs = this.newEventFilterDTOs3
        return item
      })
    },
    deleteData(dataList, indexArr, level) { //删除数据
      if (!level || level > 2) return
      console.log(dataList, indexArr, level)
      if (level === 1) { // 只有一层直接删除
        dataList.splice(indexArr[0], 1)
      } else {
        dataList && dataList.map((item, index) => { //递归删除
          if (index === indexArr[level - 1]) {
            if (item.labelRules.length > 2) {
              this.deleteData(item.labelRules, indexArr, level - 1)
            } else {
              //特殊业务：小于两条数据，更改数据结构
              item.labelRules.splice(indexArr[0], 1)
              item = Object.assign(item, item.labelRules[0])
              if (item.labelRules && item.labelRules.length) delete item.labelRules
              return item
            }
          }
        })
      }
      return dataList
    },
    mergeData(dataList, cval, indexArr, level) { //合并数据
      if (!level || level > 2) return
      dataList && dataList.map((item, index) => {
        if (level === 1) { //只有一层时
          if (index === indexArr[0]) {
            item = Object.assign(item, cval)
            return item
          }
        } else {
          if (index === indexArr[level - 1]) { //层级减1, 走递归
            this.mergeData(item.labelRules, cval, indexArr, level - 1)
          }
        }
      })
      return dataList
    },
    changeData(sData, data) {
      /**
       * cval:     当前操作项数据
       * indexArr：[当前项索引， 父项索引]
       * level：   当前操作项层级
       */
      let { cval, indexArr, level } = sData
      console.log(cval, indexArr, level, 11111)
      let dataList = JSON.parse(JSON.stringify(this.dataList))
      dataList = this.mergeData(dataList, cval, indexArr, level)
      this.dataList = dataList
      console.log('总', this.dataList)
      // this.dataList.push()
    },
    delItem(sData, data) {
      let { indexArr, level } = sData
      if (!indexArr.length && !level) return
      let dataList = this.deleteData(this.dataList, indexArr, level)
      this.dataList = dataList
      console.log(this.dataList)
      // this.dataList.push()
      // this.updateKey = Date.parse(new Date())
    },
    addInsideData(index, data) {
      // 只需要外层逻辑
      console.log(index, data)
      let dataList = JSON.parse(JSON.stringify(this.dataList))
      let currentItem = JSON.parse(JSON.stringify(data))
      let labelRules = JSON.parse(JSON.stringify(data.labelRules || []))
      labelRules = labelRules.length < 2 ? [] : labelRules
      if (labelRules && labelRules.length >= 2) {
        labelRules.push(this.firstLevelData(dataList))
      } else {
        labelRules = [currentItem, this.firstLevelData(dataList)]
      }
      let newCurrent = {
        labelRules: labelRules,
        ruleType: 'USER_RELATION',
        relation: 'AND'
      }
      dataList[index] = newCurrent
      console.log(dataList)
      this.dataList = dataList
      this.dataList.push()

    },
    async getLabel(val) {
      let params = { typeList: [1, 2, 3, 4], eventActionCode: val, filterList: null }
      if (!this.isAdd) params.filterList = [
        {
          id: this.crowdOrTagType == 3 ? this.detailData.id : this.detailId,
          type: this.crowdOrTagType
        }
      ]
      let res = await getLabel(params)
      let detail = {}
      if (res.code == 200) {
        detail = res.data
      } else this.$message.error(`${res.message}`)
      return detail
    },
    firstLevelData(dataList) {
      let eventCode = this.eventOptions?.options[0]?.options[0] || ''
      return {
        measure: {
          fieldValue: [this.fieldValueBF],
          fieldList: [], // 第一个输入框
          aggregator: this.fieldValueBF, //  下方左侧下拉框二层枚举
          // field: '', // 下方左侧下拉框第一层枚举
          type: 'NUM', // 写死
          eventName: eventCode, // 启动APP枚举
          done: 'DONE' // 是否做过
        },
        optionsTwice: this.optionsTwice, // 数据对象
        ruleType: 'USER_BEHAVIOR', // 写死
        sort: dataList.length + 1,
        type: 'EVENT', // 写死
        timeFunction: 'absolute_time', // relative_time
        timeParams: this.timeParamsBF,
        witchTimeShortcut: [],
        params: [], // 下方输入框内容
        betweenRranking1: '',
        betweenRranking2: '',
        function: this.conditionOptions7[0].value, // 下方第二个下拉框枚举--最多的是区间，没有topIn
        filters: [
          {
            type: 'FILTERS_RELATION', // 写死
            relation: 'AND',
            subFilters: [
            ]
          }
        ]
      }
    },
    thirdLevelData() {
      return {
        fieldValue: '',
        fieldValue1: '',
        fieldValue2: '',
        isInput: true,
        conditionOptions: [],
        type: 'FILTER', // 写死    EVENT_FIELD
        fieldType: '', // 第一个下拉框对应的属性的类型，数值型NUM、 日期DATE、字符串STRING、布尔BOOLEAN
        field: '', // 下拉框枚举
        function: '',
        params: [],
        optionsNew: []
      }
    },
    addData(dataList, indexArr, level) {
      if (!level) return
      level = level - 1
      dataList && dataList.map(async (item, index) => {
        if (index === indexArr[level]) { //层级减1, 走递归
          if (!item.labelRules[indexArr[0]].detailOptionsSignle) {
            let str = item?.labelRules[indexArr[0]]?.measure?.eventName?.nameEn || ''
            let detail = await this.getLabel(str)
            item.labelRules[indexArr[0]].detailOptionsSignle = detail
          }
          if (!this.isPreview) {
            item = item?.labelRules[indexArr[0]].filters[0].subFilters.push(this.thirdLevelData())
            return item
          }
        }
      })
      return dataList
    },
    async addGroupItem(level, indexArr) {
      await this.updateData()
      let dataList = JSON.parse(JSON.stringify(this.dataList))
      if (level === 1) {
        if (dataList.length >= 20) return this.$message.warning('筛选条件最多为20条')
        let eventDetail = this.firstLevelData(dataList)
        console.log(eventDetail)
        dataList.push(eventDetail)
        this.dataList = dataList
        return
      }
      // 添加筛选为第二层逻辑
      if (level === 2) {
        dataList[indexArr[0]].filters[0].subFilters.push(this.thirdLevelData())
        if (!dataList[indexArr[0]].detailOptionsSignle) {
          let detail = await this.getLabel(dataList[indexArr[0]].measure.eventName.nameEn)
          dataList[indexArr[0]].detailOptionsSignle = detail
        }
        this.dataList = dataList
        return
      }
      // 添加筛选为第三层逻辑
      let _data = this.addData(dataList, indexArr, level - 1)
      this.dataList = _data
    },
    // 回显时--每一个大的子项获取下拉枚举值
    async getSelect(val) {
      if (val.length < 1) return val;
      const updatedVal = [];
      await Promise.all(
        val.map(async (item) => {
          const updatedItem = JSON.parse(JSON.stringify(item));
          if (updatedItem.labelRules && updatedItem.labelRules.length > 1) {
            updatedItem.labelRules = await Promise.all(
              updatedItem.labelRules.map(async (sItem) => {
                let str = sItem?.measure?.eventName?.nameEn || '';
                let detail = await this.getLabel(str);
                sItem.detailOptionsSignle = detail;
                return sItem;
              })
            );
          } else {
            let str = updatedItem?.measure?.eventName?.nameEn || '';
            let detail = await this.getLabel(str);
            updatedItem.detailOptionsSignle = detail;
          }
          updatedVal.push(updatedItem);
        })
      );
      return updatedVal;
    }
  },
  destroyed() {
  }
}
</script>
<style lang="scss" scoped>
.tagConRight {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: 0;
  padding: 8px 12px;
  ::v-deep .el-form-item__info {
    padding: 0;
  }
  .settingDataList {
    display: flex;
    margin-bottom: 4px;
    ::v-deep .tagGroupLeft {
      border-top: 0px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-right: none;
      border-bottom-left-radius: 4px;
      position: relative;
      .div-switch {
        height: 40px;
        line-height: 40px;
        text-align: center;
        background: #fff;
        z-index: 99;
      }
      .line {
        width: 1px;
        height: 100%;
        transform: translateX(21px);
      }
    }
    .tagGroupRight {
      flex: 1;
      display: flex;
      margin-top: -1px;
      border-bottom-right-radius: 4px;
      padding: 0 0 0 6px;
      .tagGroupName {
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
      }
      .tagGroupItemBox {
        flex: 1;
      }
      .tagGroupItem {
        display: flex;
        box-sizing: border-box;
        padding: 6px 0;
        //穿透失效

        ::v-deep .el-select .el-select__tags > span {
          display: contents !important;
        }
        .tagGroupItemCondition {
          margin: 0 10px;
        }
        .tagGroupItemDel {
          margin-left: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          i {
            font-size: 12px;
            cursor: pointer;
            position: relative;
            top: 1px;
          }
          .question_mark {
            width: 150px;
          }
        }
      }
    }
    .userGroupPadding {
      padding: 17px 0 !important;
    }
    .userGroup_behavior {
      padding: 8px 0;
    }
  }
}
.tagGroupItemValueInner {
  width: 60px;
  margin: 0 10px;
}
.tagConRight_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  // padding: 8px 0;
  .title_icon_box {
    div i {
      height: 30px;
      line-height: 30px;
    }
    div {
      height: 100%;
      display: flex;
      align-items: center;
      color: #1d2129;
      font-weight: bold;
    }
    justify-content: center;
    align-content: center;
  }
}
.tagGroupItemAddBtn {
  &-icon {
    display: inline-flex;
    margin-right: 4px;
  }
  ::v-deep .el-button--mini {
    border-radius: 4px;
  }
}
.tagConRightCon {
  display: flex;
  padding-top: 6px;
  .tagConRightCon_line {
    margin-right: 15px;
  }
}
.userBehavior {
  margin-top: 16px;
  .tagConRight {
    padding: 0;
  }
  .tagConRight_header {
    padding-left: 0;
  }
}
.cz-box {
  display: flex;
  align-items: center;
  line-height: 23px;
  cursor: pointer;
  span {
    font-size: 14px;
    color: #333;
    margin-left: 5px;
  }
}
.userConRight {
  display: flex;
  flex-direction: column;
}
.twiceItem {
  padding: 6px 0 6px 6px;
  .afterDone {
    width: 100px;
    margin-left: 10px;
  }
  .afterDoneNew {
    width: 200px;
    margin-left: 10px;
  }
}
.firstBox {
  border-radius: 4px;
  border: 1px solid #e5e6eb;
}
</style>
