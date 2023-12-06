<template>
  <div class="flex dynamic-date-body">
    <div class="left">
      <div @click="statcscss">开始时间：</div>
      <div class="flex jcsb">
        <div 
          v-for="item in startTab" 
          :key="item.value" 
          @click="changeStartTab(item.value)">{{item.label}}</div>
      </div>
      <div v-show="selectStartTab === 1">特殊听他说
        <div :class="'dynamicStart__origin__'+randClassName"></div>
      </div>
      <div v-show="selectStartTab === 2">
        <el-input v-model="value2" placeholder="请输入内容"></el-input>
      </div>
    </div>
    <div class="right">
      <div>结束时间：</div>
    </div>
  </div>
</template>
<script>
import DatePicker from './date'
import Picker from '../picker'
export default {
  name: 'dynamicDate',
  components: {
  },
  mixins: [Picker],
  props: {

  },
  data() {
    return {
      startEngine: false,
      value1: '',
      value2: 1,
      startTab: [{
        value: 1,
        label: '具体时间'
      },
      {
        value: 2,
        label: '过去N天'
      }],
      endTab: [{
        value: 1,
        label: '今日'
      },
      {
        value: 2,
        label: '昨日'
      },
      {
        value: 3,
        label: '过去N天'
      }],
      selectStartTab: 1,
      selectEndTab: 1,
      randClassName: new Date().getTime()
    }
  },
  computed: {

  },
  watch: {
    startEngine: {
      handler(val) {
        if (val) {
          // // hasChildDom
          if (this.picker) {
            this.picker.visible = true
            let name = `.dynamicStart__origin__${this.randClassName}`
            this.dynamicStartDomOrigin = document.querySelector(name)
            this.dynamicStartDomOrigin.appendChild(this.picker.$el)
          }
        }
      }
    }
  },
  created() {
    this.type = 'date'
    this.panel = DatePicker
    this.mountPicker()
  },
  mounted() {

  },
  methods: {
    statcscss() {
      this.$emit('startDates', new Date().getTime())
    },
    changeStartTab(type) {
      this.selectStartTab = type
    },
    hasChildDom(parent) {
      console.log(parent.lastChild)
      // if (parent.lastChild.tagName === 'SPAN') return true
      // return false
    }
  }
}
</script>
<style lang='scss' scoped>
</style>
