<template>
  <div class="fx-c fx-between fx-full tagConRight firstBox inputInnerBg">
    <div class="fx-between fx-s-center">
      <div class="title">用户属性满足</div>
      <el-button v-if="!isQuote" class="flex aic tagGroupItemAddBtn" type="primary" size="mini" @click="addTagGroupItem">添加</el-button>
    </div>
    <div v-if="dataList.length" class="fx settingDataList">
      <div class="tagGroupLeft fx-ps-center switch-text" :class="[dataList.length > 1 ? 'userGroupPadding' : '']">
        <div v-if="dataList.length > 1" class="line"></div>
        <div class="div-switch">
          <el-switch v-model="relation" :disabled="isPreview || isQuote || dataList.length <= 1" :active-value="'AND'" :inactive-value="'OR'" size="medium" languageType="Chinese" active-text="且"
            inactive-text="或" />
        </div>
      </div>
      <div class="fx fx-full tagGroupRight">
        <div class="fx-full">
          <div v-for="(item,index) in dataList" :key="index" class="tagConRightCon fx w-100">
            <template v-if="item.labelRules && item.labelRules.length > 1">
              <div class="tagGroupLeft fx-ps-center switch-text">
                <div v-if="item.labelRules.length > 1" class="line"></div>
                <div class="div-switch">
                  <el-switch v-model="item.relation" :disabled="isPreview || isQuote || item.labelRules.length <= 1" :active-value="'AND'" :inactive-value="'OR'" size="medium" languageType="Chinese"
                    active-text="且" inactive-text="或" />
                </div>
              </div>
              <div class="fx fx-full fx-c tagGroupRight">
                <div v-for="(sItem,sIndex) in item.labelRules" :key="sIndex" class="">
                  <UserAttributeInside :ref="`labelComponent${index+1}${sIndex+1}`" :key="updateKey" :attributeOptions="attributeOptions"
                    :currentData="{item:sItem,indexArr:[sIndex,index],level:2,showAddIndex:item.labelRules.length-1,dataLength:dataList.length}" @addInsideData="addInsideData(index,item)"
                    @delTagGroupItem="delTagGroupItem($event,item)" @changeData="changeData($event,item)" />
                </div>
              </div>
            </template>
            <template v-else>
              <UserAttributeInside :ref="`labelComponent${index+1}`" :key="updateKey" :attributeOptions="attributeOptions" :currentData="{item,indexArr:[index],level:1,dataLength:dataList.length}"
                @addInsideData="addInsideData(index,item)" @delTagGroupItem="delTagGroupItem($event,item)" @changeData="changeData($event,item)" />
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import UserAttributeInside from './inside.vue'
import { getFieldValuesSelect } from 'packages/api/index'
export default {
  name: 'UserAttribute',
  components: {
    UserAttributeInside
  },
  props: {
    userAttributeData: {
      type: Array,
      default: () => []
    },
    userAttributeRelation: {
      type: String,
      default: () => 'AND'
    }
  },
  data() {
    return {
      isPreview: false,
      isQuote: false,
      dataList: [],
      relation: this.userAttributeRelation || 'AND',
      updateKey: 1,
      attributeOptions: {}
    }
  },
  watch: {
    userAttributeData: {
      async handler() {
        this.dataList = JSON.parse(JSON.stringify(this.userAttributeData))
        console.log('父级数据改变---------------------->>>>>>>>>>>>>>>>');
        this.relation = this.userAttributeRelation || 'AND'
        // if (this.isCopy && this.dataList.length > 0) {
        //   this.getThirdSelectData(JSON.parse(JSON.stringify(this.userAttributeData)))
        // }
      },
      deep: true,
      immediate: true
    },
    // '$store.state.attributeAndBehavior.attributeOptionsWithAttribute': { // 监听属性标签
    //   handler(val) {
    //     console.log('handler attributeOptions', val)
    //     this.attributeOptions = val
    //   },
    //   deep: true,
    //   immediate: true
    // }
  },

  async created() {
  },
  methods: {
    async saveData() {
      // 一条数据都没有等于校验通过
      if (!this.dataList.length) {
        //this.$message.warning('请添加有效规则！')
        return [true]
      }
      let refsNames = []

      this.dataList.forEach((item, index) => {
        if (Array.isArray(item.labelRules) && item.labelRules.length > 0) {
          item.labelRules.forEach((sItem, sIndex) => {
            refsNames.push(`labelComponent${index + 1}${sIndex + 1}`)
          })
        } else {
          refsNames.push(`labelComponent${index + 1}`)
        }
      })
      let _data = await this.getValidateAllComponent(refsNames)
      return _data
    },
    getValidateAllComponent(refsNames) {
      let allValidateSuccess = []
      refsNames.forEach((name, index) => {
        allValidateSuccess.push(new Promise(resolve => {
          console.log(this.$refs[name], name)
          this.$refs[name][0].$refs.sonLabelForm.validate((valid) => {
            if (valid) {
              resolve(valid)
            } else {
              resolve(false)
            }
          })
        }))
      })
      return new Promise((resolve, reject) => {
        Promise.all(allValidateSuccess)
          .then(res => {
            resolve(res)
          })
      })
    },
    mergeData(dataList, cval, indexArr, level) { //合并数据
      if (!level || level > 2 || !dataList) return
      dataList.forEach((item, index) => {
        if (level === 1) { // 只有一层时
          if (index === indexArr[0]) {
            Object.assign(item, cval)
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
      let dataList = this.mergeData(this.dataList, cval, indexArr, level)
      this.dataList = dataList
      // this.dataList.push()
      console.log('总11', this.dataList)
    },
    deleteData(dataList, indexArr, level) { //删除数据
      if (!level || level > 2 || !dataList) return
      if (level === 1) { // 只有一层直接删除
        dataList.splice(indexArr[0], 1)
      } else {
        dataList.forEach((item, index) => {
          if (index === indexArr[level - 1]) {
            if (item.labelRules && item.labelRules.length > 2) {
              this.deleteData(item.labelRules, indexArr, level - 1)
            } else {
              // 特殊业务：小于两条数据，更改数据结构
              item.labelRules.splice(indexArr[0], 1)
              item = Object.assign(item, item.labelRules[0])
              if (item.labelRules && item.labelRules.length) delete item.labelRules
            }
          }
        })
      }
      return dataList
    },
    delTagGroupItem(sData, data) {
      let { indexArr, level } = sData
      if (!indexArr.length && !level) return
      let dataList = this.deleteData(this.dataList, indexArr, level)
      this.dataList = dataList
      // this.dataList.push()
      this.updateKey = Date.parse(new Date())
    },
    // 内层数据添加
    addInsideData(index, data) {
      // 只需要外层逻辑
      console.log(index, data)
      let dataList = JSON.parse(JSON.stringify(this.dataList))
      let currentItem = JSON.parse(JSON.stringify(data))
      let labelRules = JSON.parse(JSON.stringify(data.labelRules || []))
      labelRules = labelRules.length < 2 ? [] : labelRules
      if (labelRules && labelRules.length >= 2) {
        labelRules.push({
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
          sort: labelRules.length + 1
        })
      } else {
        labelRules = [currentItem, {
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
          sort: labelRules.length + 1
        }]
      }
      let newCurrent = {
        labelRules: labelRules,
        relation: labelRules.length <= 2 ? 'AND' : currentItem.relation,
        ruleType: 'USER_RELATION'
      }
      dataList[index] = newCurrent
      console.log(dataList)
      this.dataList = dataList
      this.dataList.push()

    },
    // 最外层添加数据
    addTagGroupItem() {
      if (this.dataList.length >= 20) return this.$message.warning('筛选条件最多为20条')
      this.dataList.push({
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
        sort: this.dataList.length + 1
      })
    },
    // 比较输入的两个值，如果左边小于右边，正常返回数组，否则对换顺序，再输出数组
    comparedData(num1, num2) {
      num1 = Number(num1)
      num2 = Number(num2)
      if (num1 > num2) {
        const thirdNum = num1
        num1 = num2
        num2 = thirdNum
      }
      return [num1, num2]
    },
    getFieldValuesSelectList(val, type, parentId = null) {
      return new Promise((resolve, reject) => {
        const params = {
          field: val, // 字段属性
          ruleType: parentId // 所属分类
        }
        if (!parentId) delete params.ruleType
        getFieldValuesSelect(params).then((res) => {
          if (res.success) {
            resolve(res.data)
          }
        }).catch((err) => {
          reject(err)
        })
      })
    },
    // async getThirdSelectData(allArrData) {
    //   const promises = allArrData.map(async (levelOneObj, levelOneIndex) => {
    //     if (levelOneObj.labelRules.length > 0) {
    //       const levelTwoPromises = levelOneObj.labelRules.map(async (levelTwoObj, levelTwoIndex) => {
    //         const { nameEn, type, parentId, fieldType } = levelTwoObj.field;
    //         if (fieldType !== 'BOOLEAN') {
    //           const data = await this.getFieldValuesSelectList(nameEn, type, parentId);
    //           this.$set(levelTwoObj, 'optionsNew', data);
    //           // this.$refs[`labelComponent${levelOneIndex + 1}${levelTwoIndex + 1}`].$forceUpdate()
    //         }
    //       });
    //       await Promise.all(levelTwoPromises);
    //     } else {
    //       const { nameEn, type, parentId, fieldType } = levelOneObj.field;
    //       if (fieldType !== 'BOOLEAN') {
    //         const data = await this.getFieldValuesSelectList(nameEn, type, parentId);
    //         this.$set(levelOneObj, 'optionsNew', data);
    //         // this.$refs[`labelComponent${levelOneIndex + 1}`].$forceUpdate()
    //       }
    //     }
    //   });
    //   await Promise.all(promises);
    //   this.$forceUpdate(); // 强制更新组件
    //   this.$nextTick(() => {
    //     console.log(allArrData);
    //     this.dataList = allArrData
    //     console.log(this.dataList, ' this.dataList------------------>>>>>>>>>>');
    //   })
    // },
  },
}
</script>
<style lang="scss" scoped>
.tagConRight {
  margin-top: 0;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #e5e6eb;
  .title {
    color: #1d2129;
    font-weight: bold;
  }
  .settingDataList {
    padding-top: 6px;
    .tagGroupLeft {
      padding: 6px 0;
      border-top: 0px;
      border-right: none;
      border-bottom-left-radius: 4px;
      position: relative;
      .div-switch {
        height: 36px;
        line-height: 36px;
        text-align: center;
        background: #fff;
        z-index: 99;
      }
      .line {
        width: 1px;
        height: 100%;
        transform: translateX(21px);
      }
      .userGroupPadding {
        padding: 8px 0 !important;
      }
    }
    .tagGroupRight {
      padding: 0 0 0 6px;
    }
    .fx-full {
      width: auto;
    }
  }
  ::v-deep .btnSvg {
    svg {
      vertical-align: -0.1rem;
    }
  }
}
</style>
