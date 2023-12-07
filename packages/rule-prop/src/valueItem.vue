<template>
  <!-- 用户属性满足 -->
  <div v-if="!['IS_SET', 'NOT_SET', 'IS_TRUE', 'IS_FALSE'].includes(formData.function)">
    <!-- DATETIME  NUM类型------- 开始 ------------------- -->
    <div v-if="formData.function == 'BETWEEN'">
      <!-- <el-form-item prop="betweenRranking1" :rules="rules.requiredRule"> -->
      <el-form-item prop="betweenRranking1">
        <el-input v-model="formData.betweenRranking1" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue_NUM_BETWEEN" />于
      </el-form-item>
      <!-- <el-form-item prop="betweenRranking2" :rules="rules.requiredRule"> -->
      <el-form-item prop="betweenRranking2">
        <el-input v-model="formData.betweenRranking2" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue_NUM_BETWEEN" />之间
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
        <el-input v-model="formData.paramsToString" :disabled="disabled" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" @change="transformFieldValue($event, true)" />
      </el-form-item>
    </div>
    <!-- DATETIME  时间类型------- 结束 ------------------- -->

    <!-- DATETIME  STRING/LIST/VERSION类型------- 开始 ------------------- -->
    <!-- <el-form-item prop="paramsToString" :rules="rules.requiredRule"> -->
    <el-form-item v-else-if="['NOT_CONTAIN','CONTAIN'].includes(formData.function)" prop="paramsToString">
      <el-input v-model="formData.paramsToString" :disabled="disabled" @change="transformFieldValue($event, true)" />
    </el-form-item>
    <!-- DATETIME  STRING/LIST/VERSION------- 结束 ------------------- -->

    <!-- NUM 类型不使用模糊查询，后端不支持，需要沿用创建功能 -->
    <!-- <el-form-item v-if="formData.isInput" prop="params" :rules="rules.requiredRule"> -->
    <el-form-item v-else-if="formData.fieldType == 'NUM'" prop="params">
      <el-select v-model="formData.params" :disabled="disabled" multiple :tagCount="1" :multiple-limit="100" filterable allow-create default-first-option placeholder="请输入内容" :loading="dataLoading"
        @change="transformFieldValue" @visible-change="getThirdSelectData">
        <el-option v-for="(i,num) in remoteOptions" :key="num" :value="i" :label="i" />
      </el-select>
    </el-form-item>
    <!-- <el-form-item v-if="formData.isInput" prop="params" :rules="rules.requiredRule"> -->
    <el-form-item v-else prop="params">
      <el-select ref="remoteSelect" v-model="formData.params" :disabled="disabled" :tagCount="1" multiple :multiple-limit="100" filterable placeholder="请输入内容" :loading="dataLoading"
        :remote-method="remoteMethod" reserve-keyword remote @change="transformFieldValue" @visible-change="getThirdSelectData($event, '', true)">
        <el-option v-for="(i,num) in remoteOptions" :key="i + num" :value="i" :label="i" />
      </el-select>
    </el-form-item>
  </div>
</template>
<script>
import { getFieldValuesSelect } from 'packages/api/index'
const checkLength = (rule, value, callback) => {
  if (value && value.length) {
    callback()
  } else {
    callback(new Error(' '))
  }
}
// 比较输入的两个值，如果左边小于右边，正常返回数组，否则对换顺序，再输出数组
function comparedData(num1, num2) {
  num1 = Number(num1)
  num2 = Number(num2)
  if (num1 > num2) {
    const thirdNum = num1
    num1 = num2
    num2 = thirdNum
  }
  return [num1, num2]
}

export default {
  name: 'DsValueItem',
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
      dataLoading: false,
      remoteOptions: []
    }
  },
  computed: {
    formData: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit('input', val);
        this.$emit('change', val)
      }
    }
  },
  methods: {
    // 模糊查询
    remoteMethod(val) {
      this.getThirdSelectData(true, val, true)
    },
    transformFieldValue_NUM_BETWEEN() {
      // this.formData.betweenRranking1 = val
      // 输完第一个框，判断第二个框是否为空，为空拼接给params
      const leftInput = this.formData.betweenRranking1
      const rightInput = this.formData.betweenRranking2
      if ([leftInput, rightInput].every(v => v !== '')) {
        this.formData.params = comparedData(leftInput, rightInput)
        this.formData.betweenRranking1 = this.formData.params[0]
        this.formData.betweenRranking2 = this.formData.params[1]
      }
    },

    transformFieldValue(val, isString) {
      val = isString ? [val] : Array.isArray(val) ? val : []
      const params = this.formData?.params
      if (!/^[0-9]+(\.[0-9]{1,2})?$/.test(params[params.length - 1])) {
        return params.pop()
      }
      if (['GREATER', 'LESS', 'MOST', 'LEAST'].includes(this.formData.function) && val.length > 1) {
        return params.pop()
      }
      this.formData.params = val
    },
    getFieldValuesSelectList(field, ruleType = null, keyword, isRemote) {
      // 字段属性 // 所属分类
      const params = { field }
      if (isRemote && keyword.trim()) params.keyword = keyword
      if (ruleType) params.ruleType = ruleType
      return new Promise((resolve, reject) => {
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
    async getThirdSelectData(visible, keyword, isRemote) {
      if (visible || isRemote) {
        const { nameEn, parentId } = this.formData.field;
        if (!nameEn) return
        this.dataLoading = true
        const data = await this.getFieldValuesSelectList(nameEn, parentId, keyword, isRemote);
        this.remoteOptions = data
        this.dataLoading = false
        // 通过组件库源码更改 query 不能为''，否则弹出层不展示
        if ((!data || data.length < 1) && !keyword && isRemote) this.$set(this.$refs.remoteSelect, 'query', ' ');
      }
    },
  }
}
</script>
