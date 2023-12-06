<template>
  <div ref="select" v-clickoutside="handleClose" class="el-select" :style="isNeedChangeWidth ? selectWidthNew : {}" :class="[selectSize ? 'el-select--' + selectSize : '']" @click.stop="toggleMenu">
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
        <i v-if="showClose" class="el-select__caret el-input__icon el-icon-guanbi-1" @click="handleClearClick"></i>
      </template>
    </el-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <el-select-menu v-show="visible && emptyText !== false" ref="popper" :append-to-body="popperAppendToBody">
        <div v-show="searchShow && $parent._props.options.length" class="select-input">
          <el-input v-model="searchValue" class="search-input" :size="inputSize" placeholder="搜索" suffix-icon="el-icon-search" @input="selectInput"></el-input>
        </div>
        <div v-show="checkShow && checkList&& checkList.length" class="screen-box">
          <el-checkbox-group v-model="checkValue" @change="checkChange">
            <el-checkbox v-for="item in checkList" :key="item.eventType" :label="item.eventType">{{ item.eventTypeName }}</el-checkbox>
          </el-checkbox-group>
        </div>
        <div ref="groupLabelBox" class="fx" :class="{'group-label-box': !checkShow || (checkList&&checkList.length < 1)}">
          <el-scrollbar class="scrollbar-left fx-none" tag="ul" wrap-class="el-scrollbar__wrap-noXscroll" view-class="el-select-dropdown__list_group">
            <div v-for="group in leftNav" :key="group.id" class="group-item" :class="{ higStyle: higGroup === group.id }" @click="goCategory(group)">{{ group.label }}</div>
          </el-scrollbar>
          <div v-show="optionsLength > 0 && !loading">
            <slot></slot>
          </div>
          <template v-if="emptyText && (!allowCreate || loading || (allowCreate && optionsLength === 0))">
            <slot v-if="$slots.empty" name="empty"></slot>
            <template v-else>
              <div class="extendedSelect_empty">
                <div>
                  <DsIconFont name="ds-icon-empty" width="60" />
                  <div class="mt-12">{{emptyText}}</div>
                </div>
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

    <!-- TODO 测试多个回显， 并动态删除 -->
    <div v-show="false">
      <ExtendedOption v-for="(item,index) in hideOptions" :key="item.name + index" :label="item.name || '-'" class="fx-s-center" :value="item" />
    </div>
  </div>
</template>
<script>
import { Select } from 'modesign'
import lodash from 'lodash'
// 计算文本宽度
export const getWidth = (text, fontSize = 14) => {
  let str = text.replace(/\s/g, '\xa0')
  //fontSize:代表汉字的大小，英文字会自动按照默认值
  let span = document.createElement('span')
  span.style.visibility = 'hidden'
  span.style.fontSize = `${fontSize}px`
  span.style.fontFamily = 'Arial'
  document.body.appendChild(span)
  span.innerText = str
  let spanWidth = span.getBoundingClientRect().width // - result.width;
  span.remove()
  return spanWidth
}
import { RecycleScroller } from 'vue-virtual-scroller'
import DsIconFont from 'packages/icon-font'
import ExtendedOption from './extendedOption.vue'
export default {
  name: 'ExtendedSelect',
  mixins: [Select],
  inheritAttrs: false,
  components: {
    ExtendedOption,
    RecycleScroller,
    DsIconFont
  },
  props: {
    hideOptions: {
      type: Array,
      default: () => []
    },
    optionsData: {
      type: Array,
      default: () => []
    },
    leftNav: {
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
    },
    // 多选时是否将选中值按文字的形式展示
    collapseTags: {
      type: Boolean,
      default: true
    },
    collapseTagSize: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // hideOptions: [],
      searchValue: '',
      higGroup: '',
      checkValue: [],
      ruleLocation: true
    }
  },
  computed: {
    optionsLength() {
      return this.optionsData.length - this.leftNav.length
    },
    emptyText() {
      if (this.loading) {
        return this.loadingText || '加载中'
      } else {
        if (this.remote && this.query === '' && this.optionsLength === 0) return false
        if ((this.searchShow || this.filterable) && this.query && this.optionsLength > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || '无匹配数据'
        }
        if (this.optionsLength === 0) {
          return this.noDataText || '暂无数据'
        }
      }
      return null
    },
    // 自适应宽度
    selectWidthNew() {
      if (!this.selectedLabel) return `width:160px`
      let str = getWidth(this.selectedLabel, 14)
      // 420 + 12 + 40 + 2   (420:30个文字宽度；12/40：下拉框左右padding；2：边框)
      if (str >= 420) return `width:474px`
      if (str + 54 < 172) return `width:172px`
      return `width:${str + 54}px`
    }
  },
  created() {
    this.selectInput = lodash.debounce((val) => {
      this.$emit('update:labelInfo', {})
      // this.checkValue = []
      this.query = val
      this.handleQueryChange(this.query)
    })
  },
  mounted() {
  },
  methods: {
    checkChange(val) {
      // this.searchValue = ''
      this.$emit('checkChange', val)
    },
    // 修改原方法
    // setSelected() {
    //   if (!this.multiple) {
    //     let option = this.getOption(this.value);
    //     if (option.created) {
    //       this.createdLabel = option.currentLabel;
    //       this.createdSelected = true;
    //     } else {
    //       this.createdSelected = false;
    //     }
    //     this.selectedLabel = option.currentLabel;
    //     this.selected = option;
    //     if (this.filterable) this.query = this.selectedLabel;
    //     return;
    //   }
    //   let result = [];
    //   if (Array.isArray(this.value)) {
    //     this.value.forEach(value => {
    //       result.push(this.getOption(value));
    //     });
    //   }
    //   this.selected = result;
    //   this.$nextTick(() => {
    //     this.refreshHeight('focus')
    //   })
    // },
    scrollToOption(option) {
      if (Array.isArray(option)) {
        if (option.length) {
          this.scrollToItem(option[0].value.name)
        }
      } else {
        this.scrollToItem(option.value.name)
      }
    },
    onOptionDestroy(index, item) {
      // console.log('jijiang销毁：', item);

      if (index > -1) {
        // console.log('销毁：', item);
        // console.log('options', this.options);
        this.optionsCount--;
        this.filteredOptionsCount--;
        this.options.splice(index, 1);

        if (this.hideOptions && this.hideOptions.length) {
          // this.hideOptions.find(e=>{

          //  return e ===this.select.selected
          // })
        }
      }
    },
    // handleQueryChange(val) {
    //   if (this.previousQuery === val || this.isOnComposition) return;
    //   if (
    //     this.previousQuery === null &&
    //     (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')
    //   ) {
    //     this.previousQuery = val;
    //     return;
    //   }
    //   this.previousQuery = val;
    //   this.$nextTick(() => {
    //     if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
    //   });
    //   this.hoverIndex = -1;
    //   if (this.multiple || this.filterable) {
    //     if (this.$refs.input) {
    //       this.$nextTick(() => {
    //         const length = this.$refs.input.value.length * 15 + 20;
    //         this.inputLength = !this.collapsedTag ? Math.min(50, length) : length;
    //         this.managePlaceholder();
    //         this.resetInputHeight();
    //       });
    //     }
    //   }
    //   if (this.remote && typeof this.remoteMethod === 'function') {
    //     this.hoverIndex = -1;
    //     this.remoteMethod(val);
    //   } else if (typeof this.filterMethod === 'function') {
    //     this.filterMethod(val);
    //     this.broadcast('ElOptionGroup', 'queryChange');
    //   } else {
    //     this.filteredOptionsCount = this.optionsCount;
    //     this.broadcast('ElOption', 'queryChange', val);
    //     this.broadcast('ElOptionGroup', 'queryChange');
    //   }
    //   if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
    //     this.checkDefaultFirstOption();
    //   }
    //   this.$emit('filterData', val);
    // },
    judgeLocation() {
      this.$nextTick(() => {
        // 视口宽度-元素右边缘相对于视口左边缘的距离，如果大于rule_info容器宽度则显示在右边否则显示在左边
        this.ruleLocation = document.body.clientWidth - this.$refs.groupLabelBox.getBoundingClientRect().right >= 268
      })
    },
    initialize() {
      this.searchValue = ''
      this.checkValue = []
      this.higGroup = ''
      this.selectInput('')
      this.$emit('update:labelInfo', {})
    },
    goCategory(option) {
      this.higGroup = option.id
      this.scrollToItem(option.label)
    },
    scrollToItem(label) {
      const [VNode] = this.$slots.default
      const component = VNode.componentInstance
      const index = component.items.findIndex(e => e.name === label)
      component.scrollToItem(index)
    }
  }
}
</script>