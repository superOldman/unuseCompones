<template>
  <extended-select ref="extendedSelect" v-bind="$attrs" :value="value" class="my-select" value-key="uniqueValue" :optionsData="options" :labelInfo.sync="labelInfo" no-match-text="暂无数据"
    :popper-class="specialStyle ? 'specialStyle' : 'extendedSelect_popper'" v-on="$listeners" @visible-change="visibleChange">
    <extended-group v-for="group in options" :id="group.id" :key="group.id" ref="grouplabel" :label="group.label" :groupNum="eventOptionsNum(group.options)">
      <!-- ptype为空则表明资源权限被回收禁用 -->
      <template v-for="(item, index) in group.options">
        <!-- 使用eventStatusHide样式隐藏选项，不要用-v-show,执行select搜索功能时源码里的方法会修改option的disabled属性，会造成v-show的样式被覆盖 -->
        <el-option :key="item.name + index" :class="{ 'eventStatusHide': !eventStatusHide(item) }" :label="item.name || '-'" :value="item"
          :disabled="item.disabled || eventStatusDisabled(item)" @mouseenter.native="optionEnter(item)" @mouseleave.native="optionleave">
          <!-- <svg-icon icon-class="icon-yuzhizijianzhuxing" size="20"></svg-icon> -->
          <span class="ml-8 sl">{{ item.name | cutStr }}</span>
        </el-option>
      </template>
    </extended-group>
    <template #ruleInfo="{ labelInfos }">
      <slot name="ruleInfos" :labelInfos="labelInfos">
        <div ref="ruleMain" class="rule-main">
          <div class="header flex aic">
            <template v-for="(i, index) in labelInfos.tag">
              <p :key="index" class="header-tag" :class="{ 'set-header-tag': index }">
                <!-- <svg-icon v-show="!index" icon-class="icon-yuzhizijianzhuxing" size="20"></svg-icon> -->
                <span :class="{ 'tag-color-title': specialStyle && !index }">{{ i }}</span>
              </p>
            </template>
          </div>
          <div class="rule-content">
            <p class="mb-12 rul-title">{{ labelInfos.eventName || labelInfos.nameEn }}</p>
            <template v-for="(val, key, index) in labelInfos.propertyInfo">
              <div :key="index" class="mb-8">
                <p class="mb-6 key-style">{{ key || '--' }}</p>
                <p class="info-style">{{ val || '--' }}</p>
              </div>
            </template>
          </div>
        </div>
      </slot>
    </template>
  </extended-select>
</template>
<script>
import ExtendedSelect from './components/extendedSelect.vue'
import ExtendedGroup from './components/extendedGroup.vue'
import lodash from 'lodash'
export default {
  name: 'MySelect',
  components: {
    ExtendedSelect,
    ExtendedGroup
  },
  filters: {
    cutStr(str) {
      if (str == '') str = '--'
      return String(str).length > 30 ? `${str.substring(0, 30)}...` : str
    }
  },
  inheritAttrs: false,
  props: {
    // 下拉选项list
    options: {
      type: Array,
      default: () => []
    },
    valueKey: {
      type: String,
      default: ''
    },
    value: {
      type: [String, Object],
      default: ''
    },
    specialStyle: {
      type: Boolean,
      default: false
    },
    // 是否做ptype判断逻辑
    ptypeJudge: {
      type: Boolean,
      default: false
    },
    // 是否做status判断逻辑
    statusJudge: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // 鼠标悬浮项的详细信息
      labelInfo: {
        // tag: ['预置事件属性', '分析全部值'],
        // eventName: '事件发生时间',
        // propertyInfo: {
        //   属性名称: '$event_time',
        //   属性描述: '-',
        //   数据类型: 'dateTime',
        //   最近修改: '2022-10-12'
        // }
      }
    }
  },
  computed: {
    // 当前选中项全部数据，是个对象
    CheckedNodes() {
      let obj
      this.options.find(i => {
        let item = i.options.find(i1 => i1.uniqueValue === this.value?.uniqueValue)
        if (item) {
          obj = item
          return true
        }
      })
      return obj
    },
    // 对比当前选中项ptype数据和v-model传入的数据的ptype是否一致
    ptypeFit() {
      return this.CheckedNodes?.hasOwnProperty('ptype') && (this.CheckedNodes?.ptype !== this.value?.ptype) && this.ptypeJudge
    },
    // 对比当前选中项status数据和v-model传入的数据的status是否一致
    statusFit() {
      return this.CheckedNodes?.hasOwnProperty('status') && (this.CheckedNodes?.status !== this.value?.status) && this.statusJudge
    },
    /**
     * status
     * 0 不展示
     * 1 启用
     * 2 禁用
     */
    eventStatusDisabled() {
      return (data) => {
        return data.hasOwnProperty('status') && typeof data.status === 'number' ? [0].includes(data.status) : false
      }
    },
    eventStatusHide() {
      return (data) => {
        return data.hasOwnProperty('status') && typeof data.status === 'number' ? [1, 2].includes(data.status) : true
      }
    },
    //当前分组tag数量
    eventOptionsNum() {
      return (data) => {
        return data.filter(i => i?.status).length
      }
    }
  },
  created() {
    //监听ptypeFit，如果为true则v-model传入的ptype可能为旧值，同步新值出去
    if (this.ptypeJudge) {
      var watcher = this.$watch('ptypeFit', (newVal) => {
        if (newVal) {
          this.$emit('input', this.CheckedNodes)
          //关闭监听
          watcher?.()
        }
      }, {
        immediate: true
      })
    }
    //监听statusFit，如果为true则v-model传入的status可能为旧值，同步新值出去
    if (this.statusJudge) {
      var statusWatcher = this.$watch('statusFit', (newVal) => {
        if (newVal) {
          this.$emit('input', this.CheckedNodes)
          //关闭监听
          statusWatcher?.()
        }
      }, {
        immediate: true
      })
    }
  },
  mounted() {
  },
  methods: {
    // 鼠标移入待选项出现右侧详细信息
    optionEnter: lodash.debounce(function (item) {
      this.labelInfo = item.labelInfo
      this.labelInfo.nameEn = item.nameEn
    }, 200),
    optionleave() {
      this.labelInfo = {}
    },
    // 关闭弹出框时清空搜索输入框文字和打开弹框判断规则弹框该显示的位置
    visibleChange(val) {
      // 清空右侧信息
      if (!val) {
        this.$refs.extendedSelect.initialize()
      } else {
        this.$refs.extendedSelect.judgeLocation()
      }
      this.$emit('visible-change', val)
    },
    // 根据当前选中项id获取选中项全部数据,主要是抛出给部分业务需求使用比如回显
    getCheckedNodes(uniqueValue) {
      let obj
      this.options.find(i => {
        let item = i.options.find(i1 => i1.uniqueValue === uniqueValue)
        if (item) {
          obj = item
          return true
        }
      })
      return obj
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./style/index.scss";
@import "./style/indexNew.scss";

/* 只在 Safari 中生效 */
@media (-webkit-min-device-pixel-ratio: 0) and (min-width: 0) {
  .sl {
    display: inline-block;
    width: 268px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:hover {
      padding: 0px !important;
    }
  }
}

::v-deep .el-select-dropdown.el-popper {
  padding: 0px !important;
}

::v-deep .el-select-dropdown__item {
  max-width: 320px;
  display: flex;
  align-items: center;
  padding: 0 12px !important;
  min-width: 0;
  white-space: unset;
}
</style>
