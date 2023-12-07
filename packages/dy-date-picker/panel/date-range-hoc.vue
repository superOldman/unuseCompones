<script>
import Vue from 'vue'
import types from './types'
import DateRangePanel from './date-range'
import DynamicDate from './dynamic-date'
import moment from 'moment'
// bin-todo 
// import store from '@/store/index'
export default {
  name: 'dateRangeHoc',
  components: {
    DateRangePanel,
    DynamicDate,
  },
  mixins: [],
  computed: {
    projectDate() {
      return '1970-01-01'
      // return store.state.user.projectDate
    }
  },
  data() {
    return {
      types,
      relativeTime: [
        { date: '', pastValue: null, tab: 1 },
        { date: '', pastValue: null, tab: 1 }
      ],
      // 动态时间
      absoluteTime: [], // 具体时间
      selectValue: 'CONCRETE',
      defaultTimes: [], // 回显的默认值
      // 其他时间
      sliderOtherTime: { label: '', date: [] },
      dynamicDateDom: null,
    }
  },
  created() { },
  mounted() {
    this.$nextTick(() => {
      this.dateOrigin = this.$refs.dateOrigin
      this.dynamicDateDom = this.$refs.dynamicDate;
      this.init()
      this.initDate()
    })
  },
  watch: {},
  methods: {
    init() {
      // bin-todo-delete
      // this.dynamicDateDom = new Vue(DynamicDate).$mount()
      // console.log('bin:50', this.dynamicDateDom)
      // 设置动态时间
      this.dynamicDateDom.$on('startDates', (date = '', visible = false) => {
        // 开始时间
        this.relativeTime[0] = date
        this.relativeTime.push()
        // 给日期组件赋值
        let [start, end] = this.relativeTime
        if (start.date && end.date) {
          this.setValueForDatePicker([start.date, end.date])
        }
      })
      this.dynamicDateDom.$on('endDates', (date = '', visible = false) => {
        // 开始时间
        this.relativeTime[1] = date
        this.relativeTime.push()
        // 给日期组件赋值
        let [start, end] = this.relativeTime
        if (start.date && end.date) {
          this.setValueForDatePicker([start.date, end.date])
        }
      })
    },
    initDate() {
      if (!this?.dateOrigin?.value) return
      this.defaultTimes = this.dateOrigin.value
      const timeFunction = this.dateOrigin.timeFunction;
      const witchTimeShortcut = this.dateOrigin.witchTimeShortcut || []
      if (timeFunction !== 'absolute_time') {
        if (witchTimeShortcut?.length === 1) {
          const [type] = witchTimeShortcut;
          this.selectValue = type;
          let [{ getDate, label }] = this.types.filter(item => item.value === type)
          this.sliderOtherTime = { label, date: getDate() }
        } else if (witchTimeShortcut?.length === 2) {
          this.selectValue = 'DYNAMIC';
          this.setDynamicDate(true, 'DYNAMIC')
          const [start, end] = witchTimeShortcut;
          const checkDate = (date) => moment(date, 'YYY-MM-DD', true).isValid();
          const computedDate = (num) => moment().subtract(num, 'days').format('YYYY-MM-DD')
          if (!checkDate(start)) {
            this.dynamicDateDom?.emitStartDateToHoc(computedDate(start), start, 2);
          } else {
            this.dynamicDateDom?.emitStartDateToHoc(start, null, 1);
            this.dynamicDateDom.dateOrigin.value = new Date(start)
          }
          const diff = moment().diff(this.dateOrigin.value[1], 'days')
          let endTab = 1;
          if (diff === 0) {
            endTab = 1;
          } else if (diff === 1) {
            endTab = 2
          } else {
            endTab = 3
          }
          this.dynamicDateDom?.emitEndDateToHoc(moment(this.dateOrigin.value[1]).format('YYYY-MM-DD'), end, endTab);
          // this.dynamicDateDom?.changeEndTab(endTab)
        }
      } else {
        // 初始化动态时间
        // 开始时间
        this.relativeTime[0] = {
          ...this.relativeTime[0],
          date: moment(new Date()).format('YYYY-MM-DD'),
          pastValue: null
        }
        // 结束时间
        this.relativeTime[1] = {
          ...this.relativeTime[1],
          date: moment(new Date()).format('YYYY-MM-DD'),
          pastValue: null
        }
        // 初始化其他时间
        this.sliderOtherTime = {
          label: '今日',
          date: [moment(new Date()).format('YYYY-MM-DD'), moment(new Date()).format('YYYY-MM-DD')]
        }
        this.selectValue = 'CONCRETE';
        this.dateOrigin.isDynamicDate = false
        this.setValueForDatePicker(this.defaultTimes);
      }
      // 初始化具体时间
      this.absoluteTime = this.dealDate(this.defaultTimes)
      // 获得具体时间
      this.dateOrigin.$on('pick', (date = '') => {
        let [start, end] = date
        let [{ getDate }] = !this.isCorDTime() ? [{ getDate: () => [] }] : this.types.filter(item => item.value === this.selectValue)
        let [cStart, cEnd] = getDate()
        // 日期区间选择后的时间  和  左侧快捷时间比较，不等则是'CONCRETE'或者DYNAMIC
        if (!this.getDateStatus(start, end, cStart, cEnd)) {
          if (this.selectValue !== 'DYNAMIC') {
            this.selectValue = 'CONCRETE'
          }
        }
        this.absoluteTime = this.dealDate(date)
      })
    },
    isCorDTime() {
      return !['CONCRETE', 'DYNAMIC'].includes(this.selectValue)
    },
    getDateStatus(start, end, cStart, cEnd) {
      return (Date.parse(start) === Date.parse(cStart)) && (Date.parse(end) === Date.parse(cEnd))
    },
    // 给日期组件赋值
    setValueForDatePicker(value) {
      this.dateOrigin.value = value
    },
    dealDate(values) {
      return [moment(values[0]).format('YYYY-MM-DD'), moment(values[1]).format('YYYY-MM-DD')]
    },
    // 选择相对时间，去年之类
    changeSelect(value) {
      // 显示两联日期
      this.dateOrigin.isDynamicDate = false
      this.selectValue = value
      let [{ getDate, label }] = this.types.filter(item => item.value === value)
      // 给日期组件赋值
      this.setValueForDatePicker(getDate())
      // 给当前组件赋选中值
      this.sliderOtherTime = {
        label: label,
        date: getDate()
      }
      // 隐藏日期框
      // this.$nextTick(() => { this.handleConfirm() })
    },
    setDynamicDate(status, type) {
      if (status) {
        this.dynamicDateDom.startEngine = true
        // bin-todo-delete
        // let dynamicDom = document.querySelectorAll('.el-picker-panel__body__dynamic')
        // dynamicDom = dynamicDom[dynamicDom.length - 1]
        // if (!this.hasChildDom(dynamicDom)) {
        //   dynamicDom.appendChild(this.dynamicDateDom.$el)
        //   // 先启动组件内的dom挂载
        //   this.dynamicDateDom.startEngine = true
        // }
      }
      if (type === 'CONCRETE') {
        // 给日期组件赋值
        const end = new Date()
        const start = new Date()
        this.setValueForDatePicker([start, end])
        // 日期框头部时间赋值
        this.absoluteTime = this.dealDate([start, end])
      }
      this.dateOrigin.isDynamicDate = status
      this.selectValue = type
    },
    dealWitchTimeShortcutText(type = 'OTHER') {
      let actions = new Map([
        ['CONCRETE', () => ''],
        ['DYNAMIC', () => {
          let [start, end] = this.relativeTime
          let startText = start.tab === 1 ? start.date : start.pastValue
          let endTexts = { 1: '0', 2: '1', 3: end.pastValue }
          let endText = endTexts[end.tab]
          return [startText, endText]
        }],
        ['OTHER', () => this.sliderOtherTime.label || '']
      ])
      return actions.get(type)()
    },
    handleConfirm() {
      let type = ['CONCRETE', 'DYNAMIC'].includes(this.selectValue) ? this.selectValue : 'OTHER'
      this.$emit('WitchTimeShortcutText', { selectValue: this.selectValue, text: this.dealWitchTimeShortcutText(type) })
      this.$emit('handleConfirm', { selectValue: this.selectValue, text: this.dealWitchTimeShortcutText(type) })
      this.dateOrigin.handleConfirm(false, 'wangbin')
    },
    cancelConfirm() {
      this?.dateOrigin?.handleCancel()
    },
    hasChildDom(parent) {
      return !!parent.lastChild
    }
  },
  render(h) {
    let [start, end] = this.relativeTime
    const dynamicStartDom = (
      <span>{start.tab === 1 ? start.date : `过去${start.pastValue}天`}</span>
    )
    const dynamicEndDom = (
      <span>
        {end.tab === 1 && '今日'}
        {end.tab === 2 && '昨日'}
        {end.tab === 3 && `过去${end.pastValue}天`}
      </span>
    )
    const sliderOtherTimeDate = this.dealDate(this.sliderOtherTime.date)
    /**
     * pickerTop：自定义日期弹窗头部
     * sidebarCustom：自定义日期弹窗左侧快捷项
     * pickerBottom：自定义日期弹窗底部
     */
    return (
      <DateRangePanel ref="dateOrigin">
        <div class="header" slot="pickerTop">
          {!['CONCRETE', 'DYNAMIC'].includes(this.selectValue) &&
            <div class="title">
              <span class="date-label mgr8">{this.sliderOtherTime.label}</span>
              {sliderOtherTimeDate[0]} 至 {sliderOtherTimeDate[1]}
            </div>
          }
          {this.selectValue === 'CONCRETE' &&
            <div class="title">{this.absoluteTime[0]} 至 {this.absoluteTime[1]}</div>
          }
          {this.selectValue === 'DYNAMIC' &&
            <div class="title">
              <span class="date-label mgr8">{dynamicStartDom} 至 {dynamicEndDom}</span>
              {start.date} 至 {end.date}</div>
          }
        </div>
        <div class="left" slot="sidebarCustom">
          <div class="first-category">
            {
              this.types.map(item => {
                return (
                  item.category === 'first' &&
                  <div
                    class={item.value === this.selectValue ? 'select label' : 'label'}
                    onClick={() => this.changeSelect(item.value)}>
                    {item.label}
                  </div>
                )
              })
            }
          </div>
          <div class="second-category">
            {
              this.types.map(item => {
                return (
                  item.category === 'second' &&
                  <div
                    class={item.value === this.selectValue ? 'select label' : 'label'}
                    onClick={() => this.changeSelect(item.value)}>
                    {item.label}
                  </div>
                )
              })
            }
          </div>
          <div class="other-category">
            <div
              class={this.selectValue === 'CONCRETE' ? 'select label' : 'label'}
              onClick={() => this.setDynamicDate(false, 'CONCRETE')}>选择具体时间段</div>
            <div
              class={this.selectValue === 'DYNAMIC' ? 'select label' : 'label'}
              onClick={() => this.setDynamicDate(true, 'DYNAMIC')}>设置动态时间段</div>
          </div>
        </div>
        <div class="footer" slot="pickerBottom">
          <el-button type="plain" size="mini" class="el-picker-panel__link-btn"
            onClick={this.cancelConfirm}> 取消 </el-button>
          <el-button plain disabled={start.date > end.date} size="mini" class="el-picker-panel__link-btn"
            onClick={this.handleConfirm}> 确定 </el-button>
        </div>
        <DynamicDate ref="dynamicDate" slot='dynamicDate' />
      </DateRangePanel>
    )
  }
}
</script>
<style lang='scss' scoped>
.header {
  display: flex;
  padding: 12px;
  border-top: 1px solid #E5E6EB;
  border-bottom: 1px solid #E5E6EB;

  .title {
    flex: 1;
  }
}


.date-label {
  color: #fff;
  font-size: 12px;
  height: 22px;
  line-height: 22px;
  font-weight: 500;
  padding: 0 8px;
  margin-right: 12px;
  border-radius: 4px;
  display: inline-block;
  background: linear-gradient(180deg, #5689FF 0%, #4D83FF 51%, #3E79FF 59%, #0853FF 100%);
}

.mgl8 {
  margin-left: 8px;
}

.mgr8 {
  margin-right: 8px;
}

.left {
  flex: 0 0 196px;
  padding: 12px;
  border: 1px solid #E9EBF2;
  background: #F7F8FA;

  .label {
    width: 78px;
    height: 28px;
    font-size: 12px;
    border-radius: 2px;
    border: 1px solid #E5E6EB;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    cursor: pointer;

    &:hover {
      opacity: .8;
      background: #E5E6EB;
    }

    &.select {
      color: #165DFF;
      border: 1px solid #165DFF;
    }
  }

  .first-category,
  .second-category {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #E5E6EB;
    margin-bottom: 12px;

  }

  .other-category {
    gap: 12px;
    display: flex;
    flex-direction: column;

    .label {
      width: 100%;
    }
  }
}

.footer {
  margin-top: auto;
  display: flex;
  padding: 12px;
  justify-content: flex-end;
}
</style>
