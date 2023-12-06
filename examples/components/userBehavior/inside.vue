<template>
  <!-- 用户行为满足 -->
  <div class="tagConRight innerItem sonLabelForm">
    <el-form ref="sonLabelForm" :model="currentItem" :rules="rules" :hide-required-asterisk="true" :inline="true">
      <div class="tagConRight_header twiceItem">
        <div class="flex aic">
          <!-- <div class="conditionDom"> -->
          <!-- 第一层第一项 -->
          <el-form-item prop="timeParams" :rules="rules.requiredRule">
            <DatePickerNew v-model="currentItem.timeParams" :disabled="isPreview || isQuote" type="daterange" value-format="yyyy-MM-dd" unlink-panels :picker-options="pickerOptionsCustom"
              :witchTimeShortcutText="witchTimeShortcutText" @getWitchTimeShortcutText="getTimeShortcutText" @change="changeDate">
              <moreDatePickerTrigger slot="default" slot-scope="{data}" width="340" :data="data" :witchTimeShortcutText="witchTimeShortcutText" :disabled="isPreview || isQuote">
              </moreDatePickerTrigger>
            </DatePickerNew>
          </el-form-item>
          <!-- 第一层第二项 -->
          <el-form-item prop="measure.done" :rules="rules.requiredRule">
            <el-select v-model="currentItem.measure.done" :disabled="isPreview || isQuote" style="width:104px;" size="large" class="appName" placeholder="请选择">
              <el-option v-for="(item5, index5) in doneLists" :key="index5" :label="item5.name" :value="item5.value" />
            </el-select>
          </el-form-item>
          <!-- 第一层第三项 -->
          <el-form-item prop="measure.eventName" :rules="(isPreview || isQuote) ? rules.eventRequired[0] : rules.eventRequired">
            <DsMultiTypeSelect v-model="currentItem.measure.eventName" :isNeedChangeWidth="true" :disabled="isPreview || isQuote" :options="eventOptions.options" :checkList="eventOptions.checkList" checkShow
              searchShow :statusJudge="isCopy" size="large" placeholder="请选择" @change="(val) => getNextSelectValue(val)"></DsMultiTypeSelect>
          </el-form-item>
          <!-- </div> -->
          <span v-if="!isQuote" class="cz-box cursor" @click="addGroupItem()">
            <span class="addFilterBtn">添加筛选</span>
          </span>
        </div>
        <div v-if="!isQuote" class="tagGroupItemAddBtn cz-box" @click="delItem()">
          <span class="textStyle">删除</span>
        </div>
      </div>
      <div v-if="currentItem.filters[0].subFilters.length > 0" class="fx">
        <div v-if="currentItem.filters[0]['subFilters'].length > 1" class="tagGroupLeft" style="padding:6px 0">
          <div v-if="currentItem.filters[0]['subFilters'].length > 1" class="line"></div>
          <div class="div-switch">
            <el-switch v-model="currentItem.filters[0].relation" :disabled="isPreview || isQuote || currentItem.filters[0]['subFilters'].length <= 1" :active-value="'AND'" :inactive-value="'OR'"
              size="medium" languageType="Chinese" active-text="且" inactive-text="或" />
          </div>
        </div>
        <div class="tagGroupItemBox fx fx-full fx-c">
          <div v-for="(item2, index2) in currentItem.filters[0].subFilters" :key="index2" class="tagGroupItem fx">
            <el-form-item :prop="'filters[0].subFilters.' + index2 + '.field'" :rules="(isPreview || isQuote) ? rules.checkLegal[0] : rules.checkLegal">
              <DsMultiTypeSelect v-model="item2.field" :isNeedChangeWidth="true" :disabled="isPreview || isQuote"
                :options="currentItem.detailOptionsSignle && currentItem.detailOptionsSignle.options ? currentItem.detailOptionsSignle.options : []" searchShow size="large" placeholder="请选择"
                pTypeJudge :statusJudge="isCopy" @change="(val) => optionTypeChangeLabel(val, index2, item2)"></DsMultiTypeSelect>
            </el-form-item>
            <el-form-item :prop="'filters[0].subFilters.' + index2 + '.function'" :rules="rules.requiredRule">
              <el-select v-model="item2.function" style="width:110px" :disabled="isPreview || isQuote" size="large" placeholder="请选择" @change="val => changeCondition(val, index2)">
                <el-option v-for="(item3, index3) in item2.conditionOptions" :key="index3" :label="item3.label" :value="item3.value" />
              </el-select>
            </el-form-item>
            <!-- 为时间枚举展示下面 -->
            <div v-if="item2.function === 'ABSOLUTE_BETWEEN'">
              <el-form-item :prop="'filters[0].subFilters.' + index2 + '.params'" :rules="rules.requiredRule">
                <el-date-picker v-model="item2.params" style="width:230px;" size="large" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd"
                  value-format="yyyy-MM-dd" :disabled="isPreview || isQuote" />
              </el-form-item>
            </div>
            <div v-if="item2.function === 'RELATIVE_WITHIN'">
              <template v-if="item2.isInput">
                <el-form-item :prop="'filters[0].subFilters.' + index2 + '.fieldValue'" :rules="rules.requiredRule">
                  <el-input v-model="item2.fieldValue" :disabled="isPreview || isQuote" class="tagGroupItemValueInner" size="large" placeholder
                    @change="val => transformFieldValue(item2, val, 2, index2)" /><span class="ml-12 mr-12">天</span>
                </el-form-item>
              </template>
            </div>
            <!-- 不为时间的枚举展示下面 -->
            <div v-if="item2.function !== 'RELATIVE_WITHIN' && item2.function !== 'ABSOLUTE_BETWEEN'">
              <span v-if="item2.function !== 'BETWEEN'">
                <template v-if="item2.isInput && item2.fieldType != 'NUM'">
                  <el-form-item v-if="['LESS', 'GREATER'].includes(item2.function)" :prop="'filters[0].subFilters.' + index2 + '.params'" :rules="rules.requiredRule">
                    <el-select :ref="`filterData${currentIndex + 1}${index2 + 1}`" v-model="item2.params" :disabled="isPreview || isQuote" size="large" filterable collapsed
                      :remote-method="val => remoteMethod(val, item2, 'One', index2)" reserve-keyword remote :loading="getThreeSelectDataLoadingOne" placeholder="请输入内容"
                      @change="val => transformFieldValue(item2, val, 2, index2, true)" @visible-change="val => getThirdSelectData(val, item2, 'One', index2, '', true)">
                      <el-option v-for="(i, num) in item2.optionsNew" :key="i + num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-else :prop="'filters[0].subFilters.' + index2 + '.params'" :rules="rules.requiredRule">
                    <el-select :ref="`filterData${currentIndex + 1}${index2 + 1}`" v-model="item2.params" :disabled="isPreview || isQuote" size="large" multiple :multiple-limit="100" filterable
                      collapsed :remote-method="val => remoteMethod(val, item2, 'Two', index2)" reserve-keyword remote :loading="getThreeSelectDataLoadingTwo" placeholder="请输入内容" :tagCount="1"
                      @change="val => transformFieldValue(item2, val, 1, index2)" @visible-change="val => getThirdSelectData(val, item2, 'Two', index2, '', true)">
                      <el-option v-for="(i, num) in item2.optionsNew" :key="i + num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                </template>
                <!-- NUM 类型不使用模糊查询，后端不支持，需要沿用创建功能 -->
                <template v-if="item2.isInput && item2.fieldType == 'NUM'">
                  <el-form-item v-if="['LESS', 'GREATER'].includes(item2.function)" :prop="'filters[0].subFilters.' + index2 + '.params'" :rules="rules.requiredRule">
                    <el-select :ref="`filterData${currentIndex + 1}${index2 + 1}`" v-model="item2.params" :disabled="isPreview || isQuote" size="large" filterable allow-create default-first-option
                      :loading="getThreeSelectDataLoadingOne" placeholder="请输入内容" style="width:200px" @change="val => transformFieldValue(item2, val, 2, index2, true)"
                      @visible-change="val => getThirdSelectData(val, item2, 'One')">
                      <el-option v-for="(i, num) in item2.optionsNew" :key="num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-else :prop="'filters[0].subFilters.' + index2 + '.params'" :rules="rules.requiredRule">
                    <el-select v-model="item2.params" :disabled="isPreview || isQuote" size="large" multiple :multiple-limit="100" filterable allow-create default-first-option
                      :loading="getThreeSelectDataLoadingTwo" placeholder="请输入内容" style="width:200px" :tagCount="1" @change="val => transformFieldValue(item2, val, 1, index2)"
                      @visible-change="val => getThirdSelectData(val, item2, 'Two')">
                      <el-option v-for="(i, num) in item2.optionsNew" :key="num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                </template>
              </span>
              <div v-if="item2.function === 'BETWEEN'" class="between-box fx-ps-center">
                <el-form-item :prop="'filters[0].subFilters.' + index2 + '.fieldValue1'" :rules="rules.requiredRule">
                  <el-input v-model="item2.fieldValue1" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" class="tagGroupItemValueInner shortWidth" size="large"
                    placeholder @change="val => transformFieldValue(item2, val, 6, index2)" /><span class="ml-12">与</span>
                </el-form-item>
                <el-form-item :prop="'filters[0].subFilters.' + index2 + '.fieldValue2'" :rules="rules.requiredRule">
                  <el-input v-model="item2.fieldValue2" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" class="tagGroupItemValueInner shortWidth" size="large"
                    placeholder @change="val => transformFieldValue(item2, val, 7, index2)" /><span class="ml-12 mr-12">之间</span>
                </el-form-item>
              </div>
            </div>
            <div v-if="!isQuote" class="tagGroupItemDel fx-ps-center fr cz-box ml-12" @click="delCurrentItem(index2)">
              <span class="textStyle">删除</span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentItem.measure.done === 'DONE'" class="fx-full fx-between fx-s-center tagConRight_header twiceItem_bottom">
        <div>
          <el-form-item prop="measure.fieldValue" :rules="rules.requiredRule">
            <el-cascader :key="cascaderKey" v-model="currentItem.measure.fieldValue" :disabled="isPreview || isQuote" size="large" :options="currentItem.optionsTwice" style="width: 192px;"
              :props="{ expandTrigger: 'hover', key: 'id', value: 'eventPropertyCode', label: 'eventPropertyName', children: 'eventFilterDTOs' }" @change="val => handleChangeMeasureField(val)" />
          </el-form-item>
          <el-form-item prop="function" :rules="rules.requiredRule">
            <el-select v-model="currentItem.function" :disabled="isPreview || isQuote" style="width:110px;" size="large" class="appName" placeholder="请选择">
              <el-option v-for="(item3, index3) in conditionOptions7" :key="index3" :label="item3.label" :value="item3.value" />
            </el-select>
          </el-form-item>
          <span v-if="currentItem.function === 'BETWEEN'">
            <el-form-item prop="betweenRranking1" :rules="rules.requiredRule">
              <el-input v-model="currentItem.betweenRranking1" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" class="tagGroupItemValueInner" size="large" placeholder
                @input="(val) => numVerify(val, 1)" @change="val => transformFieldValue(currentItem, val, 8)" /><span class="ml-12">至</span>
            </el-form-item>
            <el-form-item prop="betweenRranking2" :rules="rules.requiredRule">
              <el-input v-model="currentItem.betweenRranking2" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" class="tagGroupItemValueInner" size="large" placeholder
                @input="(val) => numVerify(val, 2)" @change="val => transformFieldValue(currentItem, val, 9)" /><span class="ml-12">之间</span>
            </el-form-item>
          </span>
          <span v-if="currentItem.function !== 'BETWEEN'">
            <el-form-item prop="ranking" :rules="rules.requiredRule">
              <!-- onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" -->
              <el-input v-model="currentItem.ranking" :min="0" controls-position="right" :disabled="isPreview || isQuote" style="width:92px;margin-right:12px;" size="large" placeholder
                oninput="value=value.replace(/[^\d^\.]+/g, '').replace(/^0+(\d)/, '$1').replace(/^\./, '0.').match(/^\d*(\.?\d{0,2})/g)[0]" @change="val => transformFieldValue(currentItem, val, 5)"
                @blur="numBlur" />
              <span>次</span>
            </el-form-item>
          </span>
        </div>
        <div>
          <template v-if="currentData.dataLength && currentData.dataLength > 1">
            <span v-if="!isQuote && showAdd" class="cz-box cursor" @click="addInsideData()">
              <span>新增</span>
            </span>
          </template>
        </div>
      </div>
    </el-form>
  </div>
</template>
<script>
import { getEventActionProperty, getFieldValuesSelect } from 'packages/api/index'
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
import { getWitchTimeShortcutText } from '@/utils/index'
export default {
  name: 'UserBehaviorInside',
  mixins: [enumerationConditionOptions],
  props: {
    currentData: {
      type: Object,
      default: () => { }
    },
    optionsData: {
      type: Object,
      default: () => { }
    },
    eventOptions: {
      type: Object,
      default: () => { }
    },
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
      doneLists: [
        { name: '做过', value: 'DONE' },
        { name: '未做过', value: 'NOT_DONE' }
      ],
      timeParamsBF: [], // 第一层时间
      fieldValueBF: '', // 第一层枚举（下）
      optionsSign: [],
      currentItem: [], //当前项数据
      currentIndex: 0, //[当前项索引， 父项索引]
      witchTimeShortcut: [],
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
        eventRequired: [
          { required: true, message: ' ' },
          { validator: this.$attributeStatus, trigger: 'change' }
        ]
      },
      pickerOptionsCustom: {
        disabledDate: (time) => {
          return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
        }
      },
      cascaderKey: 0,
      witchTimeShortcutText: '',
      getThreeSelectDataLoadingOne: false,
      getThreeSelectDataLoadingTwo: false,
    }
  },
  computed: {
    showAdd() {
      return this.currentData.level === 1 || this.currentData.showAddIndex === this.currentIndex
    }
  },
  watch: {
    currentData: { // 为了实时获取父的数据
      handler(val) {
        if (val) {
          this.currentItem = JSON.parse(JSON.stringify(val.item))
          this.currentIndex = this.currentData.indexArr[0]
          // 只针对回显
          if (this.isPreview || this.isModify || this.isCopy) {
            this.reShow(this.currentItem)
          }
          // if (this.isCopy) {
          //   this.getThirdSelectData(this.currentItem)
          // }
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    // 模糊查询
    remoteMethod(val, item, loadingType, index) {
      this.getThirdSelectData(true, item, loadingType, index, val, true)
    },
    numBlur(e) {
      // 单独区分  0.00  和 0.0
      if (['0.00', '0.0'].includes(e.target.value)) this.currentItem.ranking = 0
    },
    numVerify(val, type) {
      this.currentItem[`betweenRranking${type}`] = val.replace(/^(0+)|[^\d]+/g, '')
    },
    validate(callback) { //当前组件的规则校验钩子
      this.$refs.sonLabelForm.validate((valid) => {
        callback(valid)
      })
    },
    async delCurrentItem(cindex) {
      await this.$parent.updateData()
      console.log(cindex, this.currentItem)
      this.currentItem.filters[0].subFilters.splice(cindex, 1)
    },
    async delItem() {
      await this.$parent.updateData()
      this.$emit('delItem', { indexArr: this.currentData.indexArr, level: this.currentData.level })
    },
    async addInsideData() {
      await this.$parent.updateData()
      let index = this.currentIndex
      this.$emit('addInsideData', index)
    },
    changeDate(val) { },
    reShow(data) {
      // 如果是单选，需要将  [''] 转化为''
      data.filters[0].subFilters.forEach((item) => {
        if (['LESS', 'GREATER'].includes(item.function) && Array.isArray(item.params)) {
          item.params = item.params.toString()
        }
      })
      if (data.timeFunction === 'absolute_time') {
        this.witchTimeShortcutText = ''
        return
      }
      if (data.witchTimeShortcut?.length === 1) {
        let [type] = data.witchTimeShortcut
        this.witchTimeShortcutText = getWitchTimeShortcutText(type)
        return
      }
      let witchTimeShortcut = data.witchTimeShortcut || []
      this.witchTimeShortcutText = this.dealDynamicText(witchTimeShortcut)
    },
    getTimeShortcutText(val) {
      let { selectValue = '', text = '' } = val
      if (selectValue === 'CONCRETE') {
        this.currentItem.timeFunction = 'absolute_time'
      } else {
        this.currentItem.timeFunction = 'relative_time'
      }
      this.dealTimeShortcutText(selectValue, text)
    },
    dealDynamicText(val = []) {
      let [start, end] = val
      let exp = /^[12]{1}\d{3}[/-]{1}\d{2}[/-]{1}\d{2}$/
      let startText = exp.test(start) ? start : `过去${start}天`
      let endTexts = {
        0: '今日',
        1: '昨天'
      }
      let endText = Number(end) > 1 ? `过去${end}天` : endTexts[end]
      return `${startText} 至 ${endText}`
    },
    dealTimeShortcutText(selectValue, text) {
      if (selectValue === 'CONCRETE') {
        this.currentItem.witchTimeShortcut = []
        this.witchTimeShortcutText = ''
        return
      }
      if (selectValue === 'DYNAMIC') {
        /**
         * witchTimeShortcut: ['2022-02-02', 2] | [2, '2022-02-02']
         * witchTimeShortcutText：2022-02-02至过去2天
        */
        this.currentItem.witchTimeShortcut = text
        this.witchTimeShortcutText = this.dealDynamicText(text)
        return
      }
      // OTHER情况
      /**
       * witchTimeShortcut: ['YESTERDAY']
       * witchTimeShortcutText：昨天
      */
      this.currentItem.witchTimeShortcut = [selectValue]
      this.witchTimeShortcutText = text
    },
    addGroupItem() {
      this.$emit('addGroupItem', this.currentData.level + 1, this.currentData.indexArr)
    },
    handleChangeMeasureField(val) {
      // 当枚举选择为自定义插入的，只传aggregator----2023/03/15
      this.currentItem.measure.field = ['GENERAL', 'TIMES_PER_DAY', 'DISTRIBUTION_DAYS'].includes(val[0]) ? { nameEn: '' } : { nameEn: val[0] }
      this.currentItem.measure.aggregator = val[val.length - 1]
    },
    changeCondition(val, index2) {
      this.currentItem.filters[0].subFilters[index2].fieldValue = ''
      this.currentItem.filters[0].subFilters[index2].betweenRranking1 = ''
      this.currentItem.filters[0].subFilters[index2].betweenRranking2 = ''
      this.currentItem.filters[0].subFilters[index2].params = []
      const res = ['IS_SET', 'NOT_SET', 'IS_EMPTY', 'NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(val)
      if (res) {
        this.currentItem.filters[0].subFilters[index2].isInput = false
        return
      }
      this.currentItem.filters[0].subFilters[index2].isInput = true
    },
    transformFieldValue(item, val, sign, index2, isString) {
      let index = this.currentIndex
      console.log(item, val, sign, index, index2, isString)
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

      // 单个输入框输入---用户行为满足
      if (sign === 2) {
        const list = []
        list.push(val)
        this.currentItem.filters[0].subFilters[index2].params = list.splice(list.length - 1)
      } else if (sign === 8) {
        this.currentItem.betweenRranking1 = val
        // 输完第一个框，判断第二个框是否为空，为空拼接给params
        if (this.currentItem.betweenRranking2 !== '') {
          const leftInput = this.currentItem.betweenRranking1
          const rightInput = this.currentItem.betweenRranking2
          this.currentItem.params = this.comparedData(leftInput, rightInput)
          this.currentItem.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else if (sign === 9) {
        this.currentItem.betweenRranking2 = val
        // 输完第二个框，判断第一个框是否为空，为空拼接给params
        if (this.currentItem.betweenRranking1 !== '') {
          const leftInput = this.currentItem.betweenRranking1
          const rightInput = this.currentItem.betweenRranking2
          this.currentItem.params = this.comparedData(leftInput, rightInput)
          this.currentItem.betweenRranking1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.betweenRranking2 = this.comparedData(leftInput, rightInput)[1]
        }
        // 单个输入框输入---用户行为满足（外层）
      } else if (sign === 5) {
        const list = []
        let str = val
        if (['0.00', '0.0'].includes(val)) {
          str = 0
        }
        list.push(str)
        this.currentItem.params = list.splice(list.length - 1)
        // 区间输入---用户行为满足（内层）
      } else if (sign === 6) {
        this.currentItem.filters[0].subFilters[index2].fieldValue1 = val
        // 输完第一个框，判断第二个框是否为空，为空拼接给params
        if (this.currentItem.filters[0].subFilters[index2].fieldValue2 !== '') {
          const leftInput = this.currentItem.filters[0].subFilters[index2].fieldValue1
          const rightInput = this.currentItem.filters[0].subFilters[index2].fieldValue2
          this.currentItem.filters[0].subFilters[index2].params = this.comparedData(leftInput, rightInput)
          this.currentItem.filters[0].subFilters[index2].fieldValue1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.filters[0].subFilters[index2].fieldValue2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else if (sign === 7) {
        this.currentItem.filters[0].subFilters[index2].fieldValue2 = val
        // 输完第二个框，判断第一个框是否为空，为空拼接给params
        if (this.currentItem.filters[0].subFilters[index2].fieldValue1 !== '') {
          const leftInput = this.currentItem.filters[0].subFilters[index2].fieldValue1
          const rightInput = this.currentItem.filters[0].subFilters[index2].fieldValue2
          this.currentItem.filters[0].subFilters[index2].params = this.comparedData(leftInput, rightInput)
          this.currentItem.filters[0].subFilters[index2].fieldValue1 = this.comparedData(leftInput, rightInput)[0]
          this.currentItem.filters[0].subFilters[index2].fieldValue2 = this.comparedData(leftInput, rightInput)[1]
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
        this.currentItem.filters[0].subFilters[index2].params = val
      }
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
    // 替换掉接口返回的枚举值的第二层结构
    replaceResData(val) {
      return val.map((item) => {
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

    async getNextSelectValue(val) {
      return new Promise(resolve => {
        // 清空
        this.currentItem.detailOptionsSignleChoose = null
        //新增下执行subFilters=[]
        if (!this.isPreview && this.currentItem) {
          this.currentItem.filters[0].subFilters = []
          this.currentItem.detailOptionsSignle = null
        }
        const param = {
          eventActionCode: val.nameEn
          // eventPropertyType: 0
        }
        getEventActionProperty(param).then((res) => {
          if (res.success) {
            this.nextButtonLoading = false
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
            const optionsTwice = this.replaceResData(arrAfterTwice)
            const fieldValue = optionsTwice[0]?.eventPropertyCode
            this.cascaderKey++
            this.currentItem.optionsTwice = optionsTwice
            this.currentItem.measure.fieldValue = [fieldValue]
            // 切换的时候需要重置 aggregator
            this.currentItem.measure.aggregator = fieldValue
            if (this.fieldValueBF === '') {
              this.fieldValueBF = fieldValue
            }
            // 有逻辑联动，需数据同步更新给父
            this.$parent.updateData()
            resolve(true)
          }
        }).catch((err) => {
          this.nextButtonLoading = false
          console.log(err)
        })
      })
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
          this.getThreeSelectDataLoadingOne = false
          this.getThreeSelectDataLoadingTwo = false
          reject(err)
        })
      })
    },
    async optionTypeChangeLabel(val, index2, item) {
      this.currentItem.filters[0].subFilters[index2].params = []
      // eventPropertyFieldType      0.string 1.int 2.boolean 3.date 4.date_select
      this.currentItem.filters[0].subFilters[index2].isInput = true
      this.currentItem.filters[0].subFilters[index2].fieldValue = ''
      // 第一列切换后需要清除第二列已经选中的枚举，否则会出现短暂展示之前已选枚举
      this.currentItem.filters[0].subFilters[index2].function = ''
      this.currentItem.filters[0].subFilters[index2].fieldType = val.fieldType
      this.currentItem.filters[0].subFilters[index2].filterType = val.type
      this.currentItem.filters[0].subFilters[index2].conditionOptions = this.AnalyzingConditions(val.fieldType)
      let _function = this.AnalyzingConditions(val.fieldType)[0].value
      this.currentItem.filters[0].subFilters[index2].function = _function
      // 为布尔不需获取第三个框的数据
      if (val.fieldType !== 'BOOLEAN') {
        const data = await this.getFieldValuesSelectList(val.nameEn, val.type, val.parentId)
        item.optionsNew = JSON.parse(JSON.stringify(data))
        item.oldOptions = JSON.parse(JSON.stringify(data))
      }
      this.$nextTick(() => {
        this.changeCondition(_function, index2)
      })
      // 为了回显，detailOptionsSignle数据太多不能直接给后端
      /**
       * 创建-detailOptionsSignle-数据变化-增加变量detailOptionsSignleChoose存放精准匹配数据集-创建数据-增加变量detailOptionsSignleChoose赋给detailOptionsSignle
       * 回显-detailOptionsSignle
       */
      let detailOptionsSignleChoose = this.currentItem?.detailOptionsSignleChoose
        ? this.currentItem.detailOptionsSignleChoose
        : {
          checkList: null,
          options: [
            {
              id: 1,
              label: '用户属性',
              options: []
            },
            {
              id: 2,
              label: '用户标签',
              options: []
            },
            {
              id: 3,
              label: '用户分群',
              options: []
            },
            {
              id: 4,
              label: '事件属性',
              options: []
            }
          ]
        }
      // 汇总选中数据集
      let data = this.getDetailOptionsSignle(detailOptionsSignleChoose.options, val)
      detailOptionsSignleChoose.options = data
      this.currentItem.detailOptionsSignleChoose = detailOptionsSignleChoose
    },
    getDetailOptionsSignle(data, val) {
      data = JSON.parse(JSON.stringify(data))
      // 去重
      let tempCheck = []
      data.forEach(item => {
        item.options.forEach(sItem => {
          if (sItem.name === val.name) tempCheck.push(true)
        })
      })
      // 如果已有此数据，原封不动的返回数据集
      if (tempCheck.some(item => item)) {
        return data
      }
      // 汇总数据集
      let _data = this.currentItem?.detailOptionsSignle?.options || []
      _data = JSON.parse(JSON.stringify(_data))
      _data.forEach(item => {
        item.options = item.options.forEach(sItem => {
          if (sItem.name === val.name) {
            data[sItem.parentId - 1].options.push(sItem)
          }
        })
      })
      return data
    },
    filterData(e, index2, item2) {
      let str = e.data
      this.$refs[`filterData${this.currentIndex + 1}${index2 + 1}`][0].selectedLabel = str
      const re = /^\d{1}$/
      if (!re.test(str)) {
        e.target.value = ''
        this.$refs[`filterData${this.currentIndex + 1}${index2 + 1}`][0].blur()
      } else {
        // 不生效的时候过滤失效  需要执行handleFilter
        this.handleFilter(str, item2)
        this.$nextTick(() => {
          e.target.value = e.data
        })
      }
      this.$refs[`filterData${this.currentIndex + 1}${index2 + 1}`][0].$forceUpdate()
    },
    handleFilter(value, item2) {
      item2.optionsNew = item2.oldOptions.filter(i => i.indexOf(value) > -1)
    },
    // 回显的时候处理最后一列枚举的获取
    // async getThirdSelectData(val) {
    //   let arrBf = val.filters[0].subFilters || []
    //   if (arrBf.length < 1) return
    //   const arrBfList = arrBf.map(async (ite, ind) => {
    //     const { nameEn, type, parentId } = ite?.field || {};
    //     if (!nameEn || !parentId) return;
    //     const data = await this.getFieldValuesSelectList(nameEn, type, parentId);
    //     return {
    //       ...ite,
    //       optionsNew: data
    //     };
    //   });
    //   const results = await Promise.all(arrBfList);
    //   val.filters[0].subFilters = results;
    // },
    async getThirdSelectData(status, val, loadingType, index, keyword, isRemote) {
      if (status || isRemote) {
        const { nameEn, type, parentId, fieldType } = val.field;
        if (!nameEn) return
        if (fieldType !== 'BOOLEAN') {
          this.openOrLoading(loadingType, true)
          const data = await this.getFieldValuesSelectList(nameEn, type, parentId, keyword, isRemote);
          this.$set(val, 'optionsNew', data);
          this.openOrLoading(loadingType, false)
          // 通过组件库源码更改 query 不能为''，否则弹出层不展示
          if (isRemote) {
            let selectRef = this.$refs[`filterData${this.currentIndex + 1}${index + 1}`][0]
            if ((!data || data.length < 1) && !keyword) this.$set(selectRef, 'query', ' ');
          }
        }
      }
    },
    openOrLoading(type, status) {
      if (status) {
        this[`getThreeSelectDataLoading${type}`] = true
      } else {
        this[`getThreeSelectDataLoading${type}`] = false
      }
    }
  },
}
</script>
<style lang="scss" scoped>
::v-deep .el-form-item__error {
  padding-top: 1px !important;
}

.tagGroupItemValueInner {
  width: 92px;
  margin-left: 0;

  &.shortWidth {
    width: 60px;
  }
}

.tagGroupItemBox {
  border-bottom-right-radius: 4px;
  padding: 0 0 0 6px;

  .tagGroupItem {
    width: 100%;
    box-sizing: border-box;
    padding: 6px;

    //穿透失效
    &:hover {
      border-radius: 4px;
      background: #e5e6eb !important;
    }
    .tagGroupItemDel {
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

  .between-box {
    min-width: 210px;
  }

  &.fx-full {
    width: auto;
  }
}

.tagConRight_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-radius: 4px;

  &:hover {
    background: #e5e6eb !important;
  }

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
  margin-left: 12px;
  cursor: pointer;

  i {
    font-size: 12px;
    cursor: pointer;
    position: relative;
    top: -1px;
  }
}

.cz-box {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 20x;
  cursor: pointer;

  .cz-box-icon {
    color: #1d2129;
  }

  .icon__del {
    color: #4e5969 !important;
  }

  span {
    font-size: 12px;
    font-family: PingFang SC-Regular, PingFang SC;
    font-weight: 400;
    color: #1d2129;
    margin-left: 5px;
  }

  &:hover {
    span,
    .cz-box-icon {
      color: #165dff !important;
    }
  }
}

.twiceItem {
  padding: 6px 0 6px 6px;
  justify-content: flex-start !important;
}

.twiceItem_bottom {
  padding: 6px !important;
}

.addFilterBtn {
  width: 48px;
}

.textStyle {
  cursor: pointer;
  font-size: 12px;
  color: #333;
  display: inline-block;
  width: 24px;
  margin-left: 4px;
}

.isDisable {
  background: #f5f7fa;
  height: 38px;
}

.customArea {
  border-radius: 4px;
  border: 1px solid #dcdfe6;
  min-width: 235px !important;
  padding-left: 10px;
  display: flex;
  align-items: center;
  .dateText {
    color: #606266;
    font-size: 14px;
    padding-left: 8px;
  }

  .dateCustom {
    width: 210px !important;
    border: none;
    padding: 0;
    height: 26px;
    line-height: 26px;

    ::v-deep .el-range__icon {
      position: inherit !important;
      display: none;
    }

    ::v-deep .el-range-separator {
      line-height: 26px;
      width: 10%;
    }
  }
}

.slotArea {
  .date {
    color: #606266;
    font-size: 14px;
    white-space: nowrap;
  }

  .mgl5 {
    margin-left: 5px;
  }

  .mgr5 {
    margin-right: 5px;
  }

  .label {
    color: #303133;
    font-size: 14px;
    padding: 0 10px;
  }

  .line {
    position: relative;
    top: -1px;
  }
}

.sonLabelForm {
  ::v-deep .el-form {
    .el-form-item:not(:last-child) {
      margin-bottom: 0;
      margin-right: 12px;
    }

    .el-form-item:last-child {
      margin-right: 0px !important;
    }
  }
}

.twiceItem {
  ::-webkit-scrollbar {
    width: 3px;
    height: 3px;
  }

  * {
    scrollbar-width: thin;
  }
}

// .conditionDom {
//   overflow-x: auto;
//   white-space: nowrap;
//   max-width: 554px;
//   overflow-y: hidden;
//   height: 38px;
// }
// 设置可输入下拉框--输入宽度
::v-deep .el-select__tags {
  .el-select__input {
    min-width: 60px;
  }
}
</style>
