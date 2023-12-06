<template>
  <extended-select ref="extendedSelect" class="my-select" v-bind="$attrs" :value="value" :multiple="multiple" value-key="uniqueValue" :filterMethod="filterMethod" :hideOptions="hideOptions"
    :optionsData="realOptions" :leftNav="leftNav" :labelInfo.sync="labelInfo" no-match-text="暂无数据" :popper-class="specialStyle ? 'specialStyle' : 'extendedSelect_popper'" v-on="$listeners"
    @checkChange="checkChange" @visible-change="visibleChange">
    <RecycleScroller :items="realOptions" :key="recycleScrollerKey" direction="vertical" :itemSecondarySize="337" :gridItems="1" :item-size="36" key-field="name" v-slot="{ item }">
      <div v-if="item.isTitle" class="el-select-group__title">
        <span class="groupName">{{ item.label }}</span>
        <span class="groupNum ml-4">{{ item.groupNum }}</span>
      </div>
      <!-- v-show="hideOption(item)" -->
      <ExtendedOption v-else :label="item.name || '-'" class="fx-s-center" :value="item" :key="item.name" :disabled="itemDisable(item)" @mouseenter.native="optionEnter(item)"
        @mouseleave.native="optionleave">
        <DsIconFont name="ds-icon-event-prefix" />
        <span class="ml-8 sl">{{ item.name | cutStr }}</span>
      </ExtendedOption>
    </RecycleScroller>

    <template #ruleInfo="{ labelInfos }">
      <slot name="ruleInfos" :labelInfos="labelInfos">
        <div ref="ruleMain" class="rule-main">
          <div class="header fx aic">
            <template v-for="(i, index) in labelInfos.tag">
              <p :key="index" class="header-tag" :class="{ 'set-header-tag': index }">
                <DsIconFont v-show="!index" name="ds-icon-event-prefix" />
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
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { RecycleScroller } from 'vue-virtual-scroller'
import ExtendedSelect from './extendedSelect.vue'
import ExtendedGroup from './extendedGroup.vue'
import ExtendedOption from './extendedOption.vue'
import DsIconFont from 'packages/icon-font'
import lodash from 'lodash'
export default {
  name: 'DsMultiTypeSelect',
  components: {
    ExtendedSelect,
    ExtendedGroup,
    ExtendedOption,
    DsIconFont,
    RecycleScroller
  },
  filters: {
    cutStr(str) {
      if (str == '') str = '--'
      return String(str).length > 30 ? `${str.substring(0, 30)}...` : str
    }
  },
  inheritAttrs: false,
  props: {
    multiple: Boolean,
    // 下拉选项list
    options: {
      type: Array,
      default: () => []
    },
    value: {
      type: [String, Object, Array],
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
      },
      realOptions: [],
      realOptionsSource: [],
      leftNav: [],
      recycleScrollerKey: 0,
      hideOptions: [],
      searchParams: {
        keywords: '',
        nav: '',
        eventTypes: []
      }
    }
  },
  computed: {
    // 当前选中项全部数据，是个对象
    checkedNodes() {
      if (this.multiple) {
        return this.realOptions.filter(e => {
          if (e.isTitle) return false
          return this.value.some(v => v.uniqueValue === e.uniqueValue)
        })
      }
      return this.realOptions.find(e => {
        if (e.isTitle) return false
        return e.uniqueValue === this.value?.uniqueValue
      })
    },
    // 对比当前选中项ptype数据和v-model传入的数据的ptype是否一致
    ptypeFit() {
      if (!this.ptypeJudge || !this.checkedNodes || !this.value) return false
      if (this.multiple) {
        return this.checkedNodes.some(e => Object.hasOwnProperty.call(e, 'ptype') && (e.ptype !== this.value.ptype))
      }
      return Object.hasOwnProperty.call(this.checkedNodes, 'ptype') && this.checkedNodes.ptype !== this.value.ptype
    },
    // 对比当前选中项status数据和v-model传入的数据的status是否一致
    statusFit() {
      if (!this.ptypeJudge || !this.checkedNodes || !this.value) return false
      if (this.multiple) {
        return this.checkedNodes.some(e => Object.hasOwnProperty.call(e, 'status') && (e.status !== this.value.status))
      }
      return Object.hasOwnProperty.call(this.checkedNodes, 'status') && this.checkedNodes.status !== this.value.status
    },
    /**
     * status
     * 0 不展示
     * 1 启用
     * 2 禁用
     */
    eventStatusDisabled() {
      return (data) => {
        return data.hasOwnProperty('status') && typeof data.status === 'number' ? [2].includes(data.status) : false
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
    },

    itemDisable() {
      return item => {
        return item.disabled || this.eventStatusDisabled(item)
      }
    },
    //判断某个资源是否被回收，如果ptype存在并且为null，则资源被回收。 返回true
    $resourceRecycle() {
      return (data) => {
        return Object.prototype.hasOwnProperty.call(data, 'ptype') && data.ptype === null
      }
    },
    hideOption() {
      return (item) => {
        return !(!this.eventStatusHide(item) || this.$resourceRecycle(item))
      }
    }
  },
  created() {
    var valueWatcher = this.$watch('value', (newVal) => {
      if (newVal) {
        if (this.multiple) {
          this.hideOptions = newVal
        }
        else if (Object.keys(newVal).length) {
          // newVal._isHidden = true
          // TODO 检测列表中是否有这项
          this.hideOptions = [newVal]
        }
      }
      //关闭监听
      this.$nextTick(() => { valueWatcher?.() })
    }, { immediate: true })
    //监听ptypeFit，如果为true则v-model传入的ptype可能为旧值，同步新值出去
    if (this.ptypeJudge) {
      var watcher = this.$watch('ptypeFit', (newVal) => {
        if (newVal) {
          this.$emit('input', this.checkedNodes)
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
          this.$emit('input', this.checkedNodes)
          //关闭监听
          statusWatcher?.()
        }
      }, {
        immediate: true
      })
    }
  },
  watch: {
    options: {
      deep: true,
      immediate: true,
      handler: function (val, oldVal) {
        // 把title和选项 混在一起。用isTitle区分
        let real = []
        // 左侧导航
        this.leftNav = []
        for (let index = 0; index < val.length; index++) {
          const element = val[index]
          this.leftNav.push({
            id: element.id,
            label: element.label,
          })
          real = [
            ...real,
            {
              isTitle: true,
              label: element.label,
              name: element.label,
              groupNum: element.options.length
            },
            ...element.options
          ]
        }
        this.realOptions = real
        this.realOptionsSource = lodash.cloneDeep(real)
      }
    },
  },
  mounted() {

    console.log('multiple', this.multiple);
  },
  methods: {
    searchOptions() {
      this.realOptions = this.realOptionsSource.filter(e => {
        if (e.isTitle) return true
        return (this.searchParams.eventTypes.length ? this.searchParams.eventTypes.includes(e.eventType) : true) &&
          (this.searchParams.keywords ? e.name.indexOf(this.searchParams.keywords) !== -1 : true)
      })
    },
    checkChange(eventTypes) {
      this.searchParams.eventTypes = eventTypes
      this.searchOptions()
      console.log('this.realOptions', this.realOptions)
      this.recycleScrollerKey++
    },
    filterMethod(keywords) {
      this.searchParams.keywords = keywords
      this.searchOptions()
      console.log('搜索了：', JSON.stringify(this.realOptions))
    },
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
        this.searchParams.keywords = ''
        this.searchParams.eventTypes = []
        this.realOptions = this.realOptionsSource
      } else {
        this.$refs.extendedSelect.judgeLocation()
      }
      this.$emit('visible-change', val)
    },
    // 根据当前选中项id获取选中项全部数据,主要是抛出给部分业务需求使用比如回显
    // TODO 弃用
    // getCheckedNodes(uniqueValue) {
    //   return this.realOptions.find(e => {
    //     if (e.isTitle) return false
    //     return e.uniqueValue === uniqueValue
    //   })
    // }
  }
}
</script>

<style lang="scss">
.vue-recycle-scroller {
  max-height: 274px;
  width: 100%;
  min-width: 330px;
}
.vue-recycle-scroller__item-wrapper {
  // position: static;
}
</style>
