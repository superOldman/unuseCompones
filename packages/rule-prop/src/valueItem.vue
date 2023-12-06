<template>
  <!-- 用户属性满足 -->
  <div v-if="!['IS_SET', 'NOT_SET', 'IS_TRUE', 'IS_FALSE'].includes(formData.function)">

    <!-- DATETIME  NUM类型------- 开始 ------------------- -->
    <div v-if="formData.function == 'BETWEEN'">
      <!-- <el-form-item prop="betweenRranking1" :rules="rules.requiredRule"> -->
      <el-form-item prop="betweenRranking1">
        <el-input v-model="formData.betweenRranking1" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue(formData, $event, 3)" />于
      </el-form-item>
      <!-- <el-form-item prop="betweenRranking2" :rules="rules.requiredRule"> -->
      <el-form-item prop="betweenRranking2">
        <el-input v-model="formData.betweenRranking2" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue(formData, $event, 4)" />之间
      </el-form-item>
    </div>
    <!-- DATETIME  NUM类型------- 结束 ------------------- -->

    <!-- DATETIME  时间类型------- 开始 ------------------- -->
    <!-- <el-form-item prop="params" :rules="rules.requiredRule"> -->
    <el-form-item v-else-if="formData.function == 'ABSOLUTE_BETWEEN'" prop="params">
      <el-date-picker v-model="formData.params" :disabled="disabled" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd" />
    </el-form-item>
    <div v-else-if="formData.function == 'RELATIVE_WITHIN'">
      <!-- <el-form-item prop="paramsToString" :rules="rules.requiredRule"> -->
      <el-form-item prop="paramsToString">
        <el-input v-model="formData.paramsToString" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue(formData, $event, 1, true)" />
      </el-form-item>
    </div>
    <!-- DATETIME  时间类型------- 结束 ------------------- -->

    <!-- DATETIME  STRING/LIST/VERSION类型------- 开始 ------------------- -->
    <div v-else-if="['NOT_CONTAIN','CONTAIN'].includes(formData.function)">
      <!-- <el-form-item prop="paramsToString" :rules="rules.requiredRule"> -->
      <el-form-item prop="paramsToString">
        <el-input v-model="formData.paramsToString" :disabled="disabled" @change="transformFieldValue(formData, $event, 1, true)" />
      </el-form-item>
    </div>
    <!-- DATETIME  时间类型------- 结束 ------------------- -->

    <!-- NUM 类型不使用模糊查询，后端不支持，需要沿用创建功能 -->
    <div v-if="formData.fieldType == 'NUM'">
      <!-- <el-form-item v-if="formData.isInput" prop="params" :rules="rules.requiredRule"> -->
      <el-form-item v-if="formData.isInput" prop="params">
        <el-select v-model="formData.params" :disabled="disabled" multiple :tagCount="1" :multiple-limit="100" filterable allow-create placeholder="请输入内容" :loading="dataLoading"
          @change="transformFieldValue(formData, $event, 1)" @visible-change="getThirdSelectData($event,formData)">
          <el-option v-for="(i,num) in formData.optionsNew" :key="num" :value="i" :label="i" />
        </el-select>
      </el-form-item>
    </div>
    <div v-else>
      <!-- <el-form-item v-if="formData.isInput" prop="params" :rules="rules.requiredRule"> -->
      <el-form-item v-if="formData.isInput" prop="params">
        <el-select ref="remoteSelect" v-model="formData.params" :disabled="disabled" :tagCount="1" multiple :multiple-limit="100" filterable placeholder="请输入内容" :loading="dataLoading"
          :remote-method="val=>remoteMethod(val,formData)" reserve-keyword remote @change="transformFieldValue(formData, $event, 1)" @visible-change="getThirdSelectData($event,formData,'',true)">
          <el-option v-for="(i,num) in formData.optionsNew" :key="i + num" :value="i" :label="i" />
        </el-select>
      </el-form-item>
    </div>
  </div>
</template>
<script>
import { getFieldValuesSelect } from 'packages/api/index'
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
const checkLength = (rule, value, callback) => {
  if (value && value.length) {
    callback()
  } else {
    callback(new Error(' '))
  }
}

export default {
  name: 'DsValueItem',
  mixins: [enumerationConditionOptions],
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    value: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
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
      dataLoading: false
    }
  },
  computed: {
    formData: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
      }
    }
  },
  methods: {
    // 模糊查询
    remoteMethod(val, item) {
      this.getThirdSelectData(true, item, val, true)
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
      // let index = this.currentIndex
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
        this.formData.betweenRranking1 = val
        // 输完第一个框，判断第二个框是否为空，为空拼接给params
        if (this.formData.betweenRranking2 !== '') {
          const leftInput = this.formData.betweenRranking1
          const rightInput = this.formData.betweenRranking2
          this.formData.params = this.comparedData(leftInput, rightInput)
          this.formData.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.formData.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else if (sign === 4) {
        this.formData.betweenRranking2 = val
        // 输完第二个框，判断第一个框是否为空，为空拼接给params
        if (this.formData.betweenRranking1 !== '') {
          const leftInput = this.formData.betweenRranking1
          const rightInput = this.formData.betweenRranking2
          this.formData.params = this.comparedData(leftInput, rightInput)
          this.formData.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.formData.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else {
        val = isString ? [val] : Array.isArray(val) ? val : []
        if (['GREATER', 'LESS'].includes(functionCode) && val.length > 1) {
          item.params.pop()
          return
        }
        this.formData.params = val
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
          this.dataLoading = false
          reject(err)
        })
      })
    },
    async getThirdSelectData(status, val, keyword, isRemote) {
      if (status || isRemote) {
        const { nameEn, type, parentId, fieldType } = val.field;
        if (!nameEn) return
        if (fieldType !== 'BOOLEAN') {
          this.dataLoading = true
          const data = await this.getFieldValuesSelectList(nameEn, type, parentId, keyword, isRemote);
          this.$set(val, 'optionsNew', data);
          this.dataLoading = false
          // 通过组件库源码更改 query 不能为''，否则弹出层不展示
          if ((!data || data.length < 1) && !keyword && isRemote) this.$set(this.$refs.remoteSelect, 'query', ' ');
        }
      }
    }
  }
}
</script>
