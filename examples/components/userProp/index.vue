<template>
  <div>
    <div>
      <div>用户属性满足</div>
      <el-button :disabled="disabled" type="primary" @click="addTagGroupItem">添加</el-button>
    </div>
    <div v-if="dataList.length">
      <div :class="[dataList.length > 1 ? 'userGroupPadding' : '']">
        <div v-if="dataList.length > 1"></div>
        <el-switch v-model="relation" :disabled="disabled || dataList.length <= 1" :active-value="'AND'" :inactive-value="'OR'" active-text="且" inactive-text="或" />
      </div>
      <div>
        <div>
          <div v-for="(item,index) in dataList" :key="index">
            <template v-if="item.labelRules && item.labelRules.length > 1">
              <div>
                <div>
                  <el-switch v-model="item.relation" :disabled="disabled || item.labelRules.length <= 1" :active-value="'AND'" :inactive-value="'OR'" active-text="且" inactive-text="或" />
                </div>
              </div>
              <div>
                <div v-for="(sItem,sIndex) in item.labelRules" :key="sIndex">
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
    disabled: {
      type: Boolean,
      default: false
    },
    userAttributeData: {
      type: Array,
      default: () => []
    },
    userAttributeRelation: {
      type: String,
      default: () => 'AND'
    },
    aaa: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
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
        this.relation = this.userAttributeRelation || 'AND'
      },
      deep: true,
      immediate: true
    },
    aaa: {
      deep: true,
      immediate: true,
      handler: function (val, oldVal) {
        this.attributeOptions = val
      }
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
  },
}
</script>
<style lang="scss" scoped>
</style>
