import Picker from '../picker.vue'
import DatePanel from '../panel/date'
import DateRangePanel from '../panel/date-range-hoc'

const getPanel = function(type) {
  if (type === 'daterange' || type === 'datetimerange') {
    return DateRangePanel
  }
  // 未被使用的分支
  return DatePanel
}

export default {
  mixins: [Picker],
  name: 'DsDyDatePicker',
  props: {
    type: {
      type: String,
      default: 'date'
    },
    timeArrowControl: Boolean,
    timeFunction:{
      type:String,
      default:'absolute_time'
    },
    witchTimeShortcut:{
      type:Array,
      default: () => []
    }
  },
  watch: {
    type(type) {
      if (this.picker) {
        this.unmountPicker()
        this.panel = getPanel(type)
        this.mountPicker()
      } else {
        this.panel = getPanel(type)
      }
    }
  },

  created() {
    this.panel = getPanel(this.type)
  }
}
