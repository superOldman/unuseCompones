<template>
  <div v-clickoutside="handleClose" class="el-select" :class="[selectSize ? 'el-select--' + selectSize : '']" @click.stop="toggleMenu">
    <div v-if="multiple" ref="tags" class="el-select__tags" :style="{ 'max-width': inputWidth - 32 + 'px', width: '100%' }">
      <span v-if="collapseTags && selected.length">
        <el-tag :closable="!selectDisabled" :size="collapseTagSize" :hit="selected[0].hitState" type="info" disable-transitions @close="deleteTag($event, selected[0])">
          <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
        </el-tag>
        <el-tag v-if="selected.length > 1" :closable="false" :size="collapseTagSize" type="info" disable-transitions>
          <span class="el-select__tags-text">+ {{ selected.length - 1 }}</span>
        </el-tag>
      </span>
      <transition-group v-if="!collapseTags" @after-leave="resetInputHeight">
        <el-tag v-for="item in selected" :key="getValueKey(item)" :closable="!selectDisabled" :size="collapseTagSize" :hit="item.hitState" type="info" disable-transitions
          @close="deleteTag($event, item)">
          <span class="el-select__tags-text">
            <slot v-if="$scopedSlots.content" name="content" :item="item"></slot>
            <template v-else>{{ item.currentLabel }}</template>
          </span>
        </el-tag>
      </transition-group>

      <input v-if="filterable" ref="input" v-model="query" type="text" class="el-select__input" :class="[selectSize ? `is-${selectSize}` : '']" :disabled="selectDisabled"
        :autocomplete="autoComplete || autocomplete" :style="{ 'flex-grow': '1', width: inputLength / (inputWidth - 32) + '%', 'max-width': inputWidth - 42 + 'px' }" @focus="handleFocus"
        @blur="softFocus = false" @click.stop @keyup="managePlaceholder" @keydown="resetInputState" @keydown.down.prevent="navigateOptions('next')" @keydown.up.prevent="navigateOptions('prev')"
        @keydown.enter.prevent="selectOption" @keydown.esc.stop.prevent="visible = false" @keydown.delete="deletePrevTag" @compositionstart="handleComposition" @compositionupdate="handleComposition"
        @compositionend="handleComposition" @input="debouncedQueryChange" />
    </div>
    <el-input :id="id" ref="reference" v-model="selectedLabel" type="text" :placeholder="currentPlaceholder" :name="name" :autocomplete="autoComplete || autocomplete" :size="selectSize"
      :disabled="selectDisabled" :readonly="readonly" :validate-event="false" :class="{ 'is-focus': visible }" @focus="handleFocus" @blur="handleBlur" @keyup.native="debouncedOnInputChange"
      @keydown.native.down.stop.prevent="navigateOptions('next')" @keydown.native.up.stop.prevent="navigateOptions('prev')" @keydown.native.enter.prevent="selectOption"
      @keydown.native.esc.stop.prevent="visible = false" @keydown.native.tab="visible = false" @paste.native="debouncedOnInputChange" @mouseenter.native="inputHovering = true"
      @mouseleave.native="inputHovering = false">
      <template v-if="$slots.prefix" slot="prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <i v-show="!showClose" :class="['el-select__caret', 'el-input__icon', 'el-icon-' + iconClass]"></i>
        <!-- TODO ：组件库没有该element图标  el-icon-circle-close -->
        <!-- <i v-if="showClose" class="el-select__caret el-input__icon" @click="handleClearClick"></i> -->
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-guanbi-1" @click="handleClearClick"></i>
      </template>
    </el-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <el-select-menu v-show="visible && emptyText !== false" ref="popper" :append-to-body="popperAppendToBody">
        <div v-show="searchShow && $parent._props.options.length" class="select-input">
          <el-input v-model="searchValue" class="search-input" :size="inputSize" placeholder="搜索" suffix-icon="el-icon-search" @input="selectInput"></el-input>
        </div>
        <div v-show="checkShow && checkList.length" class="screen-box">
          <el-checkbox-group v-model="checkValue" @change="checkChange">
            <el-checkbox v-for="item in checkList" :key="item.eventType" :label="item.eventType">{{ item.eventTypeName }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div ref="grouplabelBox" class="flex" :class="{'grouplabelBox': !checkShow || checkList.length < 1}">
          <el-scrollbar v-show="options.length > 0 && !loading" class="scrollbar-left" tag="ul" wrap-class="el-select-dropdown__wrap_group" view-class="el-select-dropdown__list_group"
            :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 }">
            <div v-for="group in optionsData" :key="group.id" class="group-item" :class="{ higStyle: higGroup === group.id }" :label="group.label" @click="goTag(group.id)">{{ group.label }}</div>
          </el-scrollbar>
          <el-scrollbar v-show="options.length > 0 && !loading && allShow" id="scrollbar-right" ref="scrollbar" class="scrollbar-right" tag="ul" wrap-class="el-select-dropdown__wrap"
            view-class="el-select-dropdown__list" :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 }">
            <el-option v-if="showNewOption" :value="query" created></el-option>
            <slot></slot>
          </el-scrollbar>
          <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.length === 0)) && !allShow">
            <slot v-if="$slots.empty" name="empty"></slot>
            <template v-else>
              <div class="extendedSelect_empty">
                暂无数据
                <!-- <my-empty width="60" :label="emptyText" /> -->
              </div>
            </template>
          </template>
        </div>
        <div v-show="JSON.stringify(labelInfo) !== '{}'" ref="ruleInfoBox" class="rule_info fx-c" :class="ruleLocation ? 'rule_info_left' : 'rule_info_right'">
          <el-scrollbar class="rule_info_scroll">
            <slot name="ruleInfo" :labelInfos="labelInfo"></slot>
          </el-scrollbar>
        </div>
      </el-select-menu>
    </transition>
  </div>
</template>
<script>
import { Select } from 'modesign'
import debounce from 'throttle-debounce/debounce'
// import { getWidth } from '@/utils'
export default {
  name: 'ExtendedSelect',
  mixins: [Select],
  inheritAttrs: false,
  props: {
    // 下拉list
    optionsData: {
      type: Array,
      default: () => []
    },
    // 筛选list
    checkList: {
      type: Array,
      default: () => []
    },
    // 搜索是否显示
    searchShow: {
      type: Boolean,
      default: false
    },
    // 筛选是否显示
    checkShow: {
      type: Boolean,
      default: false
    },
    // 下拉框内的输入框尺寸
    inputSize: {
      type: String,
      default: 'medium'
    },
    // 右侧介绍信息
    labelInfo: {
      type: Object,
      default: () => ({})
    },
    // 是否根据所选数据自适应select宽度
    isNeedChangeWidth: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchValue: '',
      higGroup: '',
      checkValue: [],
      ruleLocation: true
    }
  },
  computed: {
    emptyText() {
      if (this.loading) {
        return this.loadingText || this.t('el.select.loading')
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) return false
        if ((this.searchShow || this.filterable) && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || this.t('el.select.noMatch')
        }
        if (this.options.length === 0) {
          return this.noDataText || this.t('el.select.noData')
        }
        if (!this.allShow) {
          return this.noMatchText || this.t('el.select.noMatch')
        }
      }
      return null
    },
    // 自适应宽度
    // selectWidthNew() {
    //   if (!this.selectedLabel) return `width:160px`
    //   let str = getWidth(this.selectedLabel, 14)
    //   // 420 + 12 + 40 + 2   (420:30个文字宽度；12/40：下拉框左右padding；2：边框)
    //   if (str >= 420) return `width:474px`
    //   if (str + 54 < 172) return `width:172px`
    //   return `width:${str + 54}px`
    // },
    allShow() {
      return this.options.some(i => i.visible === true)
    }
  },
  watch: {
  },
  created() {
    this.selectInput = debounce(this.debounce, (val) => {
      this.$emit('update:labelInfo', {})
      this.checkValue = []
      this.query = val
      this.handleQueryChange(this.query)
    })
    this.checkChange = (val) => {
      this.searchValue = ''
      this.options.forEach(i => {
        if (val.length) {
          val.some(i1 => i1 === i._props.value.eventType) ? i.visible = true : i.visible = false
        } else {
          i.visible = true
        }
      })
    }
  },
  mounted() {
  },
  methods: {
    judgeLocation() {
      this.$nextTick(() => {
        // 视口宽度-元素右边缘相对于视口左边缘的距离，如果大于rule_info容器宽度则显示在右边否则显示在左边
        this.ruleLocation = document.body.clientWidth - this.$refs.grouplabelBox.getBoundingClientRect().right >= 268
      })
    },
    initialize() {
      this.searchValue = ''
      this.checkValue = []
      this.higGroup = ''
      this.selectInput('')
      this.$emit('update:labelInfo', {})
    },

    goTag(id) {
      this.higGroup = id
      // scrollTo方法接收两个参数，依次为X坐标和Y坐标；设置滚动条的偏移位置;document.getElementById(id).offsetTo获取元素到offsetParent顶部的距离(offsetParent：距离元素最近的一个具有定位的祖宗元素（relative，absolute，fixed），若祖宗都不符合条件，offsetParent为body)
      // document.getElementById('scrollbar-right').querySelector('.el-scrollbar__wrap').scrollTo(0, document.getElementById(id).offsetTop)
      // ------以上为废弃方案(遍历多个组件后会有dom紊乱问题)------
      let [VNode] = this.$slots.default.filter(i => i.key === id)
      // let offsetTop = VNode.elm.offsetTop
      // this.$refs.scrollbar.$refs.wrap.scrollTo(0, offsetTop)
      VNode.elm.scrollIntoView({
        block: "start",
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../style/index.scss";
@import "../style/indexNew.scss";
</style>
