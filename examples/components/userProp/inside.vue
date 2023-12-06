<template>
  <!-- 用户属性满足 -->
  <el-form ref="sonLabelForm" :model="currentItem" :rules="rules" :hide-required-asterisk="true" :inline="true">
    <!-- 第一项 -->
    <!-- <el-form-item prop="field" :rules="(isPreview || isQuote) ? rules.checkLegal[0] : rules.checkLegal"> -->
    <el-form-item prop="field">
      <mySelect v-model="currentItem.field" :isNeedChangeWidth="true" :disabled="isPreview || isQuote" :options="attributeOptions.options" searchShow placeholder="请选择" pTypeJudge
        :statusJudge="isCopy" @change="handleChange($event, currentItem)" />
    </el-form-item>
    <!-- 第二项 -->
    <!-- <el-form-item prop="function" :rules="rules.requiredRule"> -->
    <el-form-item prop="function">
      <el-select v-model="currentItem.function" :disabled="isPreview || isQuote" placeholder="请选择" @change="changeCondition($event)">
        <el-option v-for="(item21,index22) in currentItem.conditionOptions" :key="index22" :label="item21.label" :value="item21.value" />
      </el-select>
    </el-form-item>
    <!-- 第三项 -->
    <div>
      <template v-if="currentItem.function == 'ABSOLUTE_BETWEEN'">
        <!-- <el-form-item prop="params" :rules="rules.requiredRule"> -->
        <el-form-item prop="params">
          <el-date-picker v-model="currentItem.params" :disabled="isPreview || isQuote" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
            value-format="yyyy-MM-dd" />
        </el-form-item>
      </template>
      <template v-else-if="currentItem.function == 'BETWEEN'">
        <div>
          <!-- <el-form-item prop="betweenRranking1" :rules="rules.requiredRule"> -->
          <el-form-item prop="betweenRranking1">
            <el-input v-model="currentItem.betweenRranking1" :disabled="isPreview || isQuote" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"
              @change="transformFieldValue(currentItem, $event, 3)" />于
          </el-form-item>
          <!-- <el-form-item prop="betweenRranking2" :rules="rules.requiredRule"> -->
          <el-form-item prop="betweenRranking2">
            <el-input v-model="currentItem.betweenRranking2" :disabled="isPreview || isQuote" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"
              @change="transformFieldValue(currentItem, $event, 4)" />之间
          </el-form-item>
        </div>
      </template>
      <template v-else-if="currentItem.function == 'RELATIVE_WITHIN'">
        <div>
          <!-- <el-form-item prop="paramsToString" :rules="rules.requiredRule"> -->
          <el-form-item prop="paramsToString">
            <el-input v-model="currentItem.paramsToString" :disabled="isPreview || isQuote" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')"
              @change="transformFieldValue(currentItem, $event, 1, true)" />
          </el-form-item>
        </div>
      </template>
      <template v-else-if="['NOT_CONTAIN','CONTAIN'].includes(currentItem.function)">
        <div>
          <!-- <el-form-item prop="paramsToString" :rules="rules.requiredRule"> -->
          <el-form-item prop="paramsToString">
            <el-input v-model="currentItem.paramsToString" :disabled="isPreview || isQuote" @change="transformFieldValue(currentItem, $event, 1, true)" />
          </el-form-item>
        </div>
      </template>
      <!-- <template v-else-if="currentItem.function == 'IS_SET'">
      </template> -->
      <template v-else-if="currentItem.function !== 'IS_SET'">
        <!-- NUM 类型不使用模糊查询，后端不支持，需要沿用创建功能 -->
        <div v-if="currentItem.fieldType == 'NUM'">
          <!-- <el-form-item v-if="currentItem.isInput" prop="params" :rules="rules.requiredRule"> -->
          <el-form-item v-if="currentItem.isInput" prop="params">
            <el-select v-model="currentItem.params" :disabled="isPreview || isQuote" multiple :tagCount="1" :multiple-limit="100" filterable allow-create default-first-option placeholder="请输入内容"
              :loading="getThirdSelectDataLoading" @change="transformFieldValue(currentItem, $event, 1)" @visible-change="getThirdSelectData($event,currentItem)">
              <el-option v-for="(i,num) in currentItem.optionsNew" :key="num" :value="i" :label="i" />
            </el-select>
          </el-form-item>
        </div>
        <div v-else>
          <!-- <el-form-item v-if="currentItem.isInput" prop="params" :rules="rules.requiredRule"> -->
          <el-form-item v-if="currentItem.isInput" prop="params">
            <el-select ref="remoteSelect" v-model="currentItem.params" :disabled="isPreview || isQuote" :tagCount="1" multiple :multiple-limit="100" filterable placeholder="请输入内容"
              :loading="getThirdSelectDataLoading" :remote-method="val=>remoteMethod(val,currentItem)" reserve-keyword remote @change="transformFieldValue(currentItem, $event, 1)"
              @visible-change="getThirdSelectData($event,currentItem,'',true)">
              <el-option v-for="(i,num) in currentItem.optionsNew" :key="i + num" :value="i" :label="i" />
            </el-select>
          </el-form-item>
        </div>
      </template>
    </div>
    <template v-if="currentData.dataLength && currentData.dataLength>1">
      <div v-if="!isPreview && !isQuote && showAdd" @click="addInsideData()">
        <span>添加</span>
      </div>
    </template>
    <div v-if="!isPreview && !isQuote" @click="delTagGroupItem()">
      <span>删除</span>
    </div>
  </el-form>
</template>
<script>
import { getFieldValuesSelect } from 'packages/api/index'
import mySelect from "../mySelect"
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
export default {
  name: 'UserAttributeInside',
  mixins: [enumerationConditionOptions],
  components: {
    mySelect
  },
  props: {
    currentData: {
      type: Object,
      default: () => { }
    },
    // 查询接口数据
    attributeOptions: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    var checkLength = (rule, value, callback) => {
      if (value && value.length) {
        callback()
      } else {
        callback(new Error(' '))
      }
    }
    return {
      isCopy: false,
      isPreview: false,
      isQuote: false,
      currentItem: JSON.parse(JSON.stringify(this.currentData.item)), //当前项数据
      currentIndex: this.currentData.indexArr[0], //[当前项索引， 父项索引]
      // 表单校验
      rules: {
        requiredRule: { required: true, message: ' ' },
        requiredLength: [
          { required: true, message: ' ', trigger: 'change' },
          { validator: checkLength, trigger: 'change' }
        ],
        checkLegal: [
          { required: true, message: ' ', trigger: 'change' },
          { validator: this.$ResourceWhetherRecycle, trigger: 'change' },
          { validator: this.$attributeStatus, trigger: 'change' }
        ],
      },
      getThirdSelectDataLoading: false
    }
  },
  computed: {
    showAdd() {
      return this.currentData.level === 1 || this.currentData.showAddIndex === this.currentIndex
    }
  },
  watch: {
    currentItem: {
      handler(val) {
        this.$emit('changeData', { cval: val, indexArr: this.currentData.indexArr, level: this.currentData.level })
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 模糊查询
    remoteMethod(val, item) {
      this.getThirdSelectData(true, item, val, true)
    },
    validate(callback) { //当前组件的规则校验钩子
      this.$refs.sonLabelForm.validate((valid) => {
        callback(valid)
      })
    },
    delTagGroupItem() {
      this.$emit('delTagGroupItem', { indexArr: this.currentData.indexArr, level: this.currentData.level })
    },
    addInsideData() {
      let index = this.currentIndex
      this.$emit('addInsideData', index)
    },
    // 递归最下级childList不存在设为undefind
    operationChildList(arr = [], val = []) {
      arr.map((x) => {
        if (x.childList && x.childList.length > 0) {
          this.operationChildList(x.childList)
        } else {
          x.childList = undefined
        }
      })
    },
    changeCondition(val) {
      let index = this.currentIndex
      this.currentItem.fieldValue = ''
      this.currentItem.betweenRranking1 = ''
      this.currentItem.betweenRranking2 = ''
      this.currentItem.params = []
      this.currentItem.paramsToString = ''
      const res = ['IS_SET', 'NOT_SET', 'IS_EMPTY', 'NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(val)
      if (res) {
        this.currentItem.isInput = false
        return
      }
      this.currentItem.isInput = true
    },
    async handleChange(val, item) {
      let index = this.currentIndex
      console.log(val, index, item)
      item.function = ''
      item.isInput = true
      item.params = []
      item.type = val.type
      item.ckColumn = val.ckColumn
      // 为布尔不需获取第三个框的数据
      if (val.fieldType !== 'BOOLEAN') {
        const data = await this.getFieldValuesSelectList(val.nameEn, val.type, val.parentId)
        item.optionsNew = data
      }
      this.handleChangeSelectData(val, index, item)
    },
    async handleChangeSelectData(val, index, item) {
      // const obj = this.options1.find(item => item.field == val[0])
      // await this.operationChildList(obj.childList, val)
      const conditionOptions = this.AnalyzingConditions(val.fieldType)
      item.conditionOptions = conditionOptions // 给第二个下拉框的options
      item.fieldType = val.fieldType
      this.currentItem = item
      // this.$nextTick(() => {
      item.function = conditionOptions[0].value // 给第二个框赋默认值
      this.changeCondition(conditionOptions[0].value)
      // })
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
    transformFieldValue(item, val, sign, isString) {
      let index = this.currentIndex
      // 下拉框输入时去除空格
      if (Array.isArray(val)) {
        if (val.length > 0) val.splice(-1, 1, val[val.length - 1]?.trim())
      }
      const { fieldType, params, function: functionCode } = item
      // 正则都是数字(有可能包含年龄)
      const regPos = /^\d+$/
      const regPos1 = /^[0-9]+(\.[0-9]{1,2})?$/
      // 下方支持输入整数和小数
      // const regPos = /^[0-9]+([.]{1}[0-9]+){0,1}$/

      if (sign === 3) {
        this.currentItem.betweenRranking1 = val
        // 输完第一个框，判断第二个框是否为空，为空拼接给params
        if (this.currentItem.betweenRranking2 !== '') {
          const leftInput = this.currentItem.betweenRranking1
          const rightInput = this.currentItem.betweenRranking2
          this.currentItem.params = this.comparedData(leftInput, rightInput)
          this.currentItem.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else if (sign === 4) {
        this.currentItem.betweenRranking2 = val
        // 输完第二个框，判断第一个框是否为空，为空拼接给params
        if (this.currentItem.betweenRranking1 !== '') {
          const leftInput = this.currentItem.betweenRranking1
          const rightInput = this.currentItem.betweenRranking2
          this.currentItem.params = this.comparedData(leftInput, rightInput)
          this.currentItem.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else {
        val = isString ? [val] : Array.isArray(val) ? val : []
        if (fieldType === 'NUM') {
          let fieId = this.currentItem.field
          // 如果是年龄输入框必须是整数，其他的非年龄数字类型输入框可以是保留两位小数的数字
          if ((!regPos.test(params[params.length - 1]) && fieId === 'basic_u_b_cust_age') || (!regPos1.test(params[params.length - 1]) && fieId !== 'basic_u_b_cust_age')) {
            item.params.pop()
            return
          }
        }
        if (['GREATER', 'LESS'].includes(functionCode) && val.length > 1) {
          item.params.pop()
          return
        }
        this.currentItem.params = val
      }
    },
    getFieldValuesSelectList(val, type, parentId = null, keyword, isRemote) {
      return new Promise((resolve, reject) => {
        const params = {
          field: val, // 字段属性
          ruleType: parentId // 所属分类
        }
        if (isRemote) params.keyword = keyword
        if (!keyword) delete params.keyword
        if (!parentId) delete params.ruleType
        getFieldValuesSelect(params).then((res) => {
          if (res.success) {
            resolve(res.data)
          }
        }).catch((err) => {
          this.getThirdSelectDataLoading = false
          reject(err)
        })
      })
    },
    async getThirdSelectData(status, val, keyword, isRemote) {
      if (status || isRemote) {
        const { nameEn, type, parentId, fieldType } = val.field;
        if (!nameEn) return
        if (fieldType !== 'BOOLEAN') {
          this.getThirdSelectDataLoading = true
          const data = await this.getFieldValuesSelectList(nameEn, type, parentId, keyword, isRemote);
          this.$set(val, 'optionsNew', data);
          this.getThirdSelectDataLoading = false
          // 通过组件库源码更改 query 不能为''，否则弹出层不展示
          if ((!data || data.length < 1) && !keyword && isRemote) this.$set(this.$refs.remoteSelect, 'query', ' ');
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
