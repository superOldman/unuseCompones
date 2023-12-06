<template>
  <!-- 行为序列 -->
  <div class="fx fx-full fx-c bs-page-contains" :class="showEnterStyle ? 'enter-style' : ''">
    <el-form ref="actionOrderRule" :model="itemRule" :rules="rules" :hide-required-asterisk="true" :inline="true">
      <div class="fx-s-center bs-page-contains-item">
        <div class="fx-s-center mr-12">
          <!-- 第一层第一项 -->
          <el-form-item prop="timeParams" :rules="rules.requiredRule">
            <DatePickerNew v-model="itemRule.timeParams" type="daterange" :class="{ isDisable: isPreview || isQuote }" :disabled="isPreview || isQuote" value-format="yyyy-MM-dd" unlink-panels
              :picker-options="pickerOptionsCustom" :witchTimeShortcutText="witchTimeShortcutText" @getWitchTimeShortcutText="getTimeShortcutText" @change="changeDate">
              <moreDatePickerTrigger slot="default" slot-scope="{data}" width="340" :data="data" :witchTimeShortcutText="witchTimeShortcutText" :disabled="isPreview || isQuote"></moreDatePickerTrigger>
            </DatePickerNew>
          </el-form-item>
          <el-tag bg-type="grey" size="medium">依次做过</el-tag>
        </div>
        <div v-if="!isPreview && !isQuote && dataLength > 0" class="fx-s-center text-style" @click="deleteLabelRule(currentIndex)" @mouseenter="showEnterStyle = true"
          @mouseleave="showEnterStyle = false">
          <span>删除组</span>
        </div>
      </div>
      <!--添加事件 这个层级错了 -->
      <div v-for="(event_item, index) in itemRule.steps" :key="index" class="fx-c">
        <div class="fx-s-center w-100 bs-page-contains-item">
          <el-form-item :prop="`steps.${index}.event`" :rules="(isPreview || isQuote) ? rules.eventRequired[0] : rules.eventRequired" :data-type="`steps.${index}.event`">
            <!-- {{event_item.event}} -->
            <DsMultiTypeSelect v-model="event_item.event" :options="event_list.options" :isNeedChangeWidth="true" :checkList="event_list.checkList" checkShow searchShow size="large"
              :statusJudge="isCopy" :disabled="isPreview || isQuote" placeholder="请选择" @change="val => event_change(val, index)" />
          </el-form-item>
          <span v-if="!isPreview && !isQuote" class="text-style mr-12" @click="addGroupItem(index)">
            <span>添加筛选</span>
          </span>
          <div v-if="!isPreview && !isQuote && itemRule.steps.length > 2" class="fx-s-center text-style" @click="deleteEvent(index)">
            <span>删除</span>
          </div>
        </div>
        <div v-if="event_item.filters[0].subFilters.length" class="fx w-100 tagGroupRight-box">
          <div v-if="event_item.filters[0].subFilters.length" class="fx-ps-center tagGroupLeft" :style="`padding:${event_item.filters[0].subFilters.length > 1 ? 6 : 4}px 0;margin-left: 6px;`">
            <div class="line"></div>
            <div class="div-switch" :class="showEnterStyle ? 'enter-style' : ''">
              <el-switch v-model="event_item.filters[0].relation" :disabled="isPreview || isQuote || event_item.filters[0].subFilters.length < 2" :active-value="'AND'" :inactive-value="'OR'"
                size="medium" languageType="Chinese" active-text="且" inactive-text="或" />
            </div>
          </div>
          <div class="fx fx-full fx-c tagGroupRight">
            <!-- 添加塞选的条件的数据应该是放在这个里面 -->
            <div v-for="(sub_item, sub_item_index) in event_item.filters[0].subFilters" :key="sub_item_index" class="fx fx-s_center bs-page-contains-item">
              <!-- 筛选条件第一个弹框  筛选第一个弹框 如果第一个弹框发生了变化 这个 change也需要   -->
              <el-form-item :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.field`" :rules="(isPreview || isQuote) ? rules.checkLegal[0] : rules.checkLegal">
                <DsMultiTypeSelect v-model="sub_item.field" :isNeedChangeWidth="true" :options="event_item.optionsSign" :disabled="isPreview || isQuote" searchShow size="large" placeholder="请选择"
                  pTypeJudge :statusJudge="isCopy" @change="val => optionTypeChangeLabel(val, sub_item_index, index)">
                </DsMultiTypeSelect>
              </el-form-item>
              <!-- 筛选条件第二个弹框 -->
              <el-form-item :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.function`" :rules="rules.requiredLength">
                <el-select v-model="sub_item.function" style="width:110px" :disabled="isPreview || isQuote" size="large" class="tagGroupItemCondition" placeholder="请选择"
                  @change="val => changeCondition(val, sub_item_index, index)">
                  <el-option v-for="(item3, index3) in sub_item.conditionOptions" :key="index3" :label="item3.label" :value="item3.value" />
                </el-select>
              </el-form-item>
              <!-- 筛选条件第三个 这个根据第三个之后数据格式不一样 -->
              <!-- 为时间枚举展示下面 -->
              <div v-if="sub_item.function === 'ABSOLUTE_BETWEEN'">
                <el-form-item :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.params`" :rules="rules.requiredLength">
                  <el-date-picker v-model="sub_item.params" style="width:230px;" size="large" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" format="yyyy-MM-dd"
                    value-format="yyyy-MM-dd" :disabled="isPreview || isQuote" />
                </el-form-item>
              </div>
              <div v-else-if="sub_item.function === 'RELATIVE_WITHIN'">
                <el-form-item :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.fieldValue`" :rules="rules.requiredLength">
                  <el-input v-if="sub_item.isInput" v-model="sub_item.fieldValue" :disabled="isPreview || isQuote" class="tagGroupItemValueInner" size="large" placeholder
                    @change="val => transformFieldValue(index, sub_item, val, 2, sub_item_index)" /><span class="ml-12">天</span>
                </el-form-item>
              </div>
              <template v-else-if="sub_item.function == 'IS_SET' || sub_item.function == 'NOT_SET' || sub_item.fieldType == 'BOOLEAN'" />
              <!-- 不为时间的枚举展示下面 -->
              <div v-else>
                <template v-if="sub_item.function !== 'BETWEEN' && sub_item.isInput && sub_item.fieldType != 'NUM'">
                  <el-form-item v-if="['LESS', 'GREATER'].includes(sub_item.function)" :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.params`" :rules="rules.requiredLength">
                    <el-select :key="sub_item_index" :ref="`filterData${currentIndex + 1}${sub_item_index + 1}`" v-model="sub_item.params" style="width:200px" :disabled="isPreview || isQuote"
                      size="large" filterable placeholder="请输入内容" :loading="getThreeSelectDataLoadingOne" collapsed :remote-method="val => remoteMethod(val, sub_item, 'One', sub_item_index)"
                      reserve-keyword remote @change="val => transformFieldValue(index, sub_item, val, 2, sub_item_index)"
                      @visible-change="val => getThirdSelectData(val, sub_item, 'One', sub_item_index, '', true)">
                      <el-option v-for="(i, num) in sub_item.optionsNew" :key="i + num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-else :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.params`" :rules="rules.requiredLength">
                    <el-select :ref="`filterData${currentIndex + 1}${sub_item_index + 1}`" v-model="sub_item.params" style="width:200px" size="large" multiple :multiple-limit="100" filterable
                      :disabled="isPreview || isQuote" :remote-method="val => remoteMethod(val, sub_item, 'Two', sub_item_index)" reserve-keyword remote placeholder="请输入" :tagCount="1"
                      :loading="getThreeSelectDataLoadingTwo" collapsed @visible-change="val => getThirdSelectData(val, sub_item, 'Two', sub_item_index, '', true)">
                      <el-option v-for=" (item, num) in sub_item.optionsNew" :key="item + num" :value="item" :label="item" />
                    </el-select>
                  </el-form-item>
                </template>
                <!-- NUM 类型不使用模糊查询，后端不支持，需要沿用创建功能 -->
                <template v-if="sub_item.function !== 'BETWEEN' && sub_item.isInput && sub_item.fieldType == 'NUM'">
                  <el-form-item v-if="['LESS', 'GREATER'].includes(sub_item.function)" :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.params`" :rules="rules.requiredLength">
                    <el-select :key="sub_item_index" :ref="`filterData${currentIndex + 1}${sub_item_index + 1}`" v-model="sub_item.params" style="width:200px" :disabled="isPreview || isQuote"
                      size="large" filterable allow-create default-first-option placeholder="请输入内容" :loading="getThreeSelectDataLoadingOne"
                      @change="val => transformFieldValue(index, sub_item, val, 2, sub_item_index)" @visible-change="val => getThirdSelectData(val, sub_item, 'One')">
                      <el-option v-for="(i, num) in sub_item.optionsNew" :key="num" :value="i" :label="i" />
                    </el-select>
                  </el-form-item>
                  <el-form-item v-else :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.params`" :rules="rules.requiredLength">
                    <el-select v-model="sub_item.params" style="width:200px" size="large" multiple :multiple-limit="100" filterable allow-create default-first-option :disabled="isPreview || isQuote"
                      placeholder="请输入" :loading="getThreeSelectDataLoadingTwo" :tagCount="1" @visible-change="val => getThirdSelectData(val, sub_item, 'Two')">
                      <el-option v-for=" (item, num) in sub_item.optionsNew" :key="num" :value="item" :label="item" />
                    </el-select>
                  </el-form-item>
                </template>
                <div v-if="sub_item.function === 'BETWEEN'" class="fx-ps-center between-box">
                  <el-form-item v-if="sub_item.isInput" :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.fieldValue1`" :rules="rules.requiredLength">
                    <el-input v-model="sub_item.fieldValue1" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" style="width: 60px;" class="mr-12" size="large"
                      placeholder @change="val => transformFieldValue(index, sub_item, val, 6, sub_item_index)" />于
                  </el-form-item>
                  <el-form-item :prop="`steps.${index}.filters[0].subFilters.${sub_item_index}.fieldValue2`" :rules="rules.requiredLength">
                    <el-input v-model="sub_item.fieldValue2" onkeyup="value=value.replace(/^(0+)|[^\d]+/g,'')" :disabled="isPreview || isQuote" style="width: 60px;" class="mr-12" size="large"
                      placeholder @change="val => transformFieldValue(index, sub_item, val, 7, sub_item_index)" />之间
                  </el-form-item>
                </div>
              </div>
              <!-- 删除筛选条件 -->
              <div v-if="!isPreview && !isQuote" class="fx-s-center text-style" @click="delCurrentItem(sub_item_index, index)">
                <span>删除</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- 底部添加事件 -->
      <div class="add-event-wrapper">
        <el-button v-if="!isPreview && !isQuote" class="add-event" size="mini" iconPoi="left" type="plain" @click="addEvent">
          <span>添加事件</span>
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script type="text/javascript">
import enumerationConditionOptions from '@/mixins/userBehaviorAttribute'
import { getFieldValuesSelect } from 'packages/api/index'
import { getWitchTimeShortcutText } from '@/utils/index'
export default {
  components: {
  },
  mixins: [enumerationConditionOptions],
  props: {
    appNames: {
      type: Array,
      default: () => []
    },
    currentData: {
      type: Object,
      default: () => { }
    },
    optionsData: {
      type: Object,
      default: () => ({})
    },
    event_list: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    var checkLength = (rule, value, callback) => {
      if (value && String(value).length) {
        callback()
      } else {
        callback(new Error(' '))
      }
    }
    return {
      isCopy: false,
      isPreview: false,
      isQuote: false,
      showEnterStyle: false,
      timeParamsBF: [],
      itemRule: {},
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
      currentIndex: -1,
      dataLength: 0,
      optionsSign: [],
      optionsTwice: [],
      inFunctionBF: [],
      witchTimeShortcut: [],
      pickerOptionsCustom: {
        disabledDate: (time) => {
          return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
        }
      },
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
        },
        shortcuts: [
          {
            text: '今日',
            onClick: (picker) => {
              this.witchTimeShortcut = ['TODAY']
              const end = new Date()
              const start = new Date()
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '昨日',
            onClick: (picker) => {
              this.witchTimeShortcut = ['YESTERDAY']
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24)
              end.setTime(end.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本周',
            onClick: (picker) => {
              this.witchTimeShortcut = ['THIS_WEEK']
              const time = new Date()
              const end = new Date()
              const start = new Date(time.getFullYear(), time.getMonth(), time.getDate() + 1 - (time.getDay() || 7))
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上周',
            onClick: (picker) => {
              this.witchTimeShortcut = ['LAST_WEEK']
              const time = new Date()
              const start = new Date(time.getFullYear(), time.getMonth(), time.getDate() - time.getDay() - 6)
              const end = new Date(time.getFullYear(), time.getMonth(), time.getDate() - time.getDay() - 0)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '本月',
            onClick: (picker) => {
              this.witchTimeShortcut = ['THIS_MONTH']
              const end = new Date()
              const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '上月',
            onClick: (picker) => {
              this.witchTimeShortcut = ['LAST_MOTH']
              const time = new Date()
              const getMonthDays = (new Date(time.getFullYear(), time.getMonth(), 1) - new Date(time.getFullYear(), time.getMonth(), 1)) / ((1000 * 60 * 60 * 24))
              const end = new Date(time.getFullYear(), time.getMonth(), getMonthDays)
              const start = new Date(time.getFullYear(), time.getMonth() - 1, 1)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '过去7天',
            onClick: (picker) => {
              this.witchTimeShortcut = ['LAST_SEVEN_DAY']
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
              end.setTime(end.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          },
          {
            text: '过去30天',
            onClick: (picker) => {
              this.witchTimeShortcut = ['LAST_THIRTY_DAY']
              const end = new Date()
              const start = new Date()
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
              end.setTime(end.getTime() - 3600 * 1000 * 24)
              picker.$emit('pick', [start, end])
            }
          }
        ]
      },
      witchTimeShortcutText: '',
      getThreeSelectDataLoadingOne: false,
      getThreeSelectDataLoadingTwo: false,
    }
  },
  watch: {
    optionsData: {
      handler(val) {
        this.optionsSign = val.optionsSign
        this.optionsTwice = val.optionsTwice
      },
      deep: true,
      immediate: true
    },
    currentData: {
      handler() {
        this.itemRule = this.currentData.item
        this.currentIndex = this.currentData.indexArr[0]
        this.dataLength = this.currentData.dataLength
        // 只针对回显
        if (!this.isAdd) {
          this.reShow(this.itemRule)
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
    changeDate(val) {
      // witchTimeShortcut为['LAST_THIRTY_DAY']证明选的是相对时间
      // let witchTimeShortcut = this.witchTimeShortcut
      // this.itemRule.timeFunction = witchTimeShortcut.length ? 'relative_time' : 'absolute_time'
      // this.itemRule.witchTimeShortcut = witchTimeShortcut
      // this.witchTimeShortcut = []
    },
    reShow(data) {
      // 如果是单选，需要将  [''] 转化为''
      data.steps.forEach((itemStep) => {
        itemStep.filters[0].subFilters.forEach((item) => {
          if (['LESS', 'GREATER'].includes(item.function)) {
            Array.isArray(item.params) && item.params.toString()
          }
        })
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
      if (text) {
        this.itemRule.timeFunction = 'relative_time'
      } else {
        this.itemRule.timeFunction = 'absolute_time'
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
        this.itemRule.witchTimeShortcut = []
        this.witchTimeShortcutText = ''
        return
      }
      if (selectValue === 'DYNAMIC') {
        /**
         * witchTimeShortcut: ['2022-02-02', 2] | [2, '2022-02-02']
         * witchTimeShortcutText：2022-02-02至过去2天
        */
        this.itemRule.witchTimeShortcut = text
        this.witchTimeShortcutText = this.dealDynamicText(text)
        return
      }
      // OTHER情况
      /**
       * witchTimeShortcut: ['YESTERDAY']
       * witchTimeShortcutText：昨天
      */
      this.itemRule.witchTimeShortcut = [selectValue]
      this.witchTimeShortcutText = text
    },
    deleteLabelRule() { // 删除行为规则
      this.$emit('deleteLabelRule', { indexArr: this.currentData.indexArr })
    },
    event_change(val, stepIndex) {
      this.itemRule.steps[stepIndex].filters[0].subFilters = []
      this.itemRule.steps[stepIndex].optionsSign = []
    },
    async optionTypeChangeLabel(val, index2, stepIndex) { // 筛选条件第一个弹框
      let currentItem = this.itemRule.steps[stepIndex]
      // 多加了一个判断条件 是因为用户属性和行为属性有同一个参数
      let detail = currentItem.optionsSign.find(item => item.options && item.options.find(subItem => subItem.nameEn == val.nameEn && subItem.parentId == val.parentId))
      currentItem.filters[0].subFilters[index2].isInput = true
      // 第一列切换后需要清除第二列已经选中的枚举，否则会出现短暂展示之前已选枚举
      currentItem.filters[0].subFilters[index2].function = ''
      currentItem.filters[0].subFilters[index2].fieldValue = ''
      currentItem.filters[0].subFilters[index2].fieldValue1 = ''
      currentItem.filters[0].subFilters[index2].fieldValue2 = ''
      currentItem.filters[0].subFilters[index2].params = []

      let detaiOption = detail.options.find(item => item.nameEn == val.nameEn)

      currentItem.filters[0].subFilters[index2].fieldType = detaiOption.fieldType
      currentItem.filters[0].subFilters[index2].type = detaiOption.type
      currentItem.filters[0].subFilters[index2].field = detaiOption

      currentItem.filters[0].subFilters[index2].conditionOptions = this.AnalyzingConditions(val.fieldType)
      // detaiOption.eventFilterDTOs
      currentItem.filters[0].subFilters[index2].ckCloumn = detaiOption.ckCloumn

      let _function = currentItem.filters[0].subFilters[index2].conditionOptions[0].value
      currentItem.filters[0].subFilters[index2].function = _function
      // detaiOption.eventFilterDTOs[0]?.eventFunctionCode //第二个下拉框
      // currentItem.filters[0].subFilters[index2].limit = detaiOption.eventFilterDTOs[0]?.inputNum // 第三个下拉框的输入的值的个数
      currentItem.filters[0].subFilters[index2].filterType = detaiOption.type
      const res = ['IS_SET', 'NOT_SET', 'IS_EMPTY', 'NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(currentItem.filters[0].subFilters[index2].function) // 是否存在第三个框
      currentItem.filters[0].subFilters[index2].isInput = !res
      // 为布尔不需获取第三个框的数据
      if (val.fieldType !== 'BOOLEAN') {
        const data = await this.getFieldValuesSelectList(detaiOption.nameEn, detaiOption.parentId)
        currentItem.filters[0].subFilters[index2].optionsNew = data
        currentItem.filters[0].subFilters[index2].oldOptions = JSON.parse(JSON.stringify(data))
      }
    },
    changeCondition(val, index2, stepIndex) { // 筛选条件第二个弹框  isInput == true的时候状态才会有第三个框
      this.itemRule.steps[stepIndex].filters[0].subFilters[index2].fieldValue = ''
      // let detail = this.itemRule.steps[stepIndex].filters[0].subFilters[index2].conditionOptions.find(item => item.eventFunctionCode == val)
      // this.itemRule.steps[stepIndex].filters[0].subFilters[index2].limit = detail.inputNum
      const res = ['IS_SET', 'NOT_SET', 'IS_EMPTY', 'NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(val)
      this.itemRule.steps[stepIndex].filters[0].subFilters[index2].isInput = !res
    },
    transformFieldValue(stepIndex, item, val, sign, index2, isString) { // 筛选条件的第三个
      let index = this.currentIndex
      // 下拉框输入时去除空格
      if (Array.isArray(val)) {
        if (val.length > 0) val.splice(-1, 1, val[val.length - 1].trim())
      }
      const { fieldType, params, function: functionCode } = item
      // 正则都是数字(有可能包含年龄)
      const regPos = /^\d+$/
      const regPos1 = /^[0-9]+(\.[0-9]{1,2})?$/
      let currentItem = this.itemRule.steps[stepIndex]
      if (sign === 2) {
        const list = []
        list.push(val)
        currentItem.filters[0].subFilters[index2].params = list.splice(list.length - 1)
      } else if (sign === 6) {
        currentItem.filters[0].subFilters[index2].fieldValue1 = val
        // 输完第一个框，判断第二个框是否为空，为空拼接给params
        if (currentItem.filters[0].subFilters[index2].fieldValue2 !== '') {
          const leftInput = currentItem.filters[0].subFilters[index2].fieldValue1
          const rightInput = currentItem.filters[0].subFilters[index2].fieldValue2
          currentItem.filters[0].subFilters[index2].params = this.comparedData(leftInput, rightInput)
          currentItem.filters[0].subFilters[index2].fieldValue1 = this.comparedData(leftInput, rightInput)[0]
          currentItem.filters[0].subFilters[index2].fieldValue2 = this.comparedData(leftInput, rightInput)[1]
        }
      } else if (sign === 7) {
        currentItem.filters[0].subFilters[index2].fieldValue2 = val
        // 输完第二个框，判断第一个框是否为空，为空拼接给params
        if (currentItem.filters[0].subFilters[index2].fieldValue1 !== '') {
          const leftInput = currentItem.filters[0].subFilters[index2].fieldValue1
          const rightInput = currentItem.filters[0].subFilters[index2].fieldValue2
          currentItem.filters[0].subFilters[index2].params = this.comparedData(leftInput, rightInput)
          currentItem.filters[0].subFilters[index2].fieldValue1 = this.comparedData(leftInput, rightInput)[0]
          currentItem.filters[0].subFilters[index2].fieldValue2 = this.comparedData(leftInput, rightInput)[1]
        }
      }
    },
    async getFieldValuesSelectList(val, type, keyword, isRemote) {
      // 事件属性也需要掉接口---2023/03/17
      // if (type != 1 && type != 2) return []
      const params = {
        field: val, // 字段属性
        ruleType: type // 所属分类
      }
      if (isRemote) params.keyword = keyword
      if (!keyword) delete params.keyword
      let res = await getFieldValuesSelect(params).catch(() => {
        this.getThreeSelectDataLoadingOne = false
        this.getThreeSelectDataLoadingTwo = false
      })
      if (res?.success) { return res.data } else return []
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
    delCurrentItem(cindex, stepIndex) { // 筛选条件删除
      this.itemRule.steps[stepIndex].filters[0].subFilters.splice(cindex, 1)
    },
    addGroupItem(index) { // 添加筛选条件
      this.$emit('addGroupItem', index, this.currentData.indexArr)
    },
    addEvent() { // 添加事件
      let detail = this.event_list.options.find(item => item.options && item.options.length > 0)
      this.itemRule.steps.push({
        event: {
          ...detail.options[0]
        },
        filters: [{
          type: 'FILTERS_RELATION',
          relation: 'AND',
          subFilters: []
        }]

      })
    },
    deleteEvent(index) {
      this.itemRule.steps.splice(index, 1)
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
    async getThirdSelectData(status, val, loadingType, index, keyword, isRemote) {
      if (status || isRemote) {
        const { nameEn, parentId, fieldType } = val.field;
        if (!nameEn) return
        if (fieldType !== 'BOOLEAN') {
          this.openOrLoading(loadingType, true)
          const data = await this.getFieldValuesSelectList(nameEn, parentId, keyword, isRemote);
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
  }
}
</script>

<style scoped lang="scss">
::v-deep .el-form-item__error {
  padding-top: 1px !important;
}

.tagGroupItemValueInner {
  width: 92px;
}

.bs-page-contains {
  border-radius: 4px;

  & + .bs-page-contains {
    margin-top: 12px;
  }

  ::v-deep {
    .el-form-item {
      margin-bottom: 0;
      margin-right: 12px;
    }
  }

  &-item {
    padding: 6px;
    border-radius: 4px;

    &:hover {
      background: #e5e6eb;
    }
  }

  .tagGroupRight-box {
    .fx-full {
      width: auto !important;
    }
  }

  .text-style {
    width: 64px;
    cursor: pointer;
    font-size: 12px;
    color: #1d2129;

    &-icon {
      color: #1d2129;
    }

    .icon__del {
      color: #4e5969 !important;
    }

    cursor: pointer;

    &:hover {
      color: #165dff;

      .text-style-icon {
        color: #165dff !important;
      }
    }
  }

  .tagGroupRight {
    padding: 0 0 0 6px;

    .between-box {
      min-width: 210px;
    }
  }

  .add-event-wrapper {
    padding: 6px;
  }

  .add-event {
    padding: 6px 8px;

    span {
      font-size: 12px;
      font-family: PingFang SC-Regular, PingFang SC;
      font-weight: 400;
      color: #1d2129;
    }
  }
}

.isDisable {
  background: #f5f7fa;
}

.enter-style {
  background: #e5e6eb !important;
}
</style>
