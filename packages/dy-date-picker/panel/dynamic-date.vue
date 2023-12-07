<template>
  <div class="dynamic-date-body">
    <div class="left">
      <div class="dynamic-header">
        <div class="title">开始时间：</div>
        <div class="button-box">
          <div :class="selectStartTab === item.value ? 'select label' : 'label'" v-for="item in startTab"
            :key="item.value" @click="changeStartTab(item.value)">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div v-show="selectStartTab === 1">
        <el-date-picker v-show="false" popper-class="dateSingle" ref="datePickeDynamic" v-model="value1" type="date" />
        <div :class="'dynamicStart__origin__' + randClassName"></div>
      </div>
      <div v-show="selectStartTab === 2">
        <el-input-number style="width: 100%;" :key="startPastValue" :min="1" :max="365" step-strictly
          v-model="startPastValue" placeholder="请输入内容" />
      </div>
    </div>
    <div class="right">
      <div class="dynamic-header">
        <div class="title">结束时间：</div>
        <div class="button-box">
          <div :class="selectEndTab === item.value ? 'select label' : 'label'" v-for="item in endTab" :key="item.value"
            @click="changeEndTab(item.value)">
            {{ item.label }}
          </div>
        </div>
      </div>
      <div v-show="selectEndTab === 3">
        <el-input-number style="width: 100%;" :key="endPastValue" :min="2" :max="365" step-strictly v-model="endPastValue"
          placeholder="请输入内容" />
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import moment from 'moment'
export default {
  name: 'dynamicDate',
  components: {
  },
  mixins: [],
  props: {

  },
  data() {
    return {
      startEngine: false,
      value1: '',
      startPastValue: 1,
      endPastValue: 3,
      startTab: [
        { value: 1, label: '具体时间' },
        { value: 2, label: '过去N天' }
      ],
      endTab: [
        { value: 1, label: '今日' },
        { value: 2, label: '昨日' },
        { value: 3, label: '过去N天' }
      ],
      selectStartTab: 1,
      selectEndTab: 1,
      randClassName: new Date().getTime(),
      startTimes: []
    }
  },
  computed: {},
  watch: {
    startEngine: {
      handler(val) {
        if (val) {
          let name = `.dynamicStart__origin__${this.randClassName}`
          let dynamicStartDomOrigin = document.querySelector(name)
          // 判断有无子dom，无就挂载dom
          if (!this.hasChildDom(dynamicStartDomOrigin)) {
            this.dateOrigin.$el.className += ' dateSingle'
            dynamicStartDomOrigin.appendChild(this.dateOrigin.$el)
            this.dateOrigin.disabledDate = (time) => {
              return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
            }
            this.dateOrigin.visible = true
          }
        }
      }
    },
    startPastValue: {
      handler(val) {
        this.startPastValue = Math.min(val, 365)
        let date = moment().subtract(this.startPastValue, 'days').format('YYYY-MM-DD')
        this.emitStartDateToHoc(date)
      }
    },
    endPastValue: {
      handler(val) {
        this.endPastValue = Math.min(val, 365)
        let date = moment().subtract(this.endPastValue, 'days').format('YYYY-MM-DD')
        this.emitEndDateToHoc(date)
      }
    }
  },
  created() { },
  mounted() {
    this.dateOrigin = new Vue(this.$refs.datePickeDynamic.panel).$mount()
    this.dateOrigin.$on('pick', (date = '', visible = false) => {
      this.dateOrigin.value = new Date(date)
      date = moment(date).format('YYYY-MM-DD')
      this.emitStartDateToHoc(date)
    })
  },
  methods: {
    emitStartDateToHoc(date, pastValue, tab) {
      console.log('bin:114', { date, pastValue, tab })
      if (tab) {
        this.selectStartTab = tab
      }
      if (pastValue) {
        this.startPastValue = pastValue
      }
      this.$emit('startDates', {
        date,
        pastValue: this.startPastValue,
        tab: this.selectStartTab
      })
    },
    emitEndDateToHoc(date, pastValue, tab) {
      if (pastValue >= 2) {
        this.endPastValue = pastValue
      }
      if (tab) {
        this.selectEndTab = tab
      }
      this.$emit('endDates', {
        date,
        pastValue: this.endPastValue,
        tab: this.selectEndTab
      })
    },
    getTrueDom(domName) {
      let dynamicDom = document.querySelectorAll(domName)
      return dynamicDom[dynamicDom.length - 1]
    },
    changeStartTab(type) {
      this.selectStartTab = type
      // 过去N天
      let date = moment().format('YYYY-MM-DD')
      if (type === 2) {
        date = moment().subtract(this.startPastValue, 'days').format('YYYY-MM-DD')
      }
      this.emitStartDateToHoc(date)
    },
    changeEndTab(type) {
      this.selectEndTab = type
      // 今日
      let date = moment().format('YYYY-MM-DD')
      // 昨日
      if (type === 2) {
        date = moment().subtract(1, 'days').format('YYYY-MM-DD')
      }
      // 过去N天
      if (type === 3) {
        date = moment().subtract(this.endPastValue, 'days').format('YYYY-MM-DD')
      }
      this.emitEndDateToHoc(date)
    },
    hasChildDom(parent) {
      return !!parent.lastChild
    }
  }
}
</script>
<style lang='scss' scoped>
.dynamic-date-body {
  display: flex;
  flex: 1;

  .left,
  .right {
    flex: 0 0 50%;
    padding: 12px;

    .dynamic-header {
      .title {
        font-size: 14px;
        font-weight: 600;
        color: #1D2129;
      }

      .button-box {
        display: flex;
        gap: 12px;
        margin: 12px 0;

        .label {
          width: 70px;
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

      }
    }
  }

  .left {
    border-right: 1px solid #E9EBF2;
  }

}

::v-deep .dateSingle {
  box-shadow: none;
  border: none;
  width: unset;

  .el-date-table {
    width: unset;
  }
}
</style>
