<template>
  <!-- @click.stop="toggleMenu"去掉stop，因为阻止冒泡会导致popover的监听事件不生效 -->
  <div class="el-select" ref="select" :class="[selectSize ? 'el-select--' + selectSize : '', {'el-select__multiple': multiple}]" @click="toggleMenu" v-clickoutside="handleClose"
    @mouseenter="inputHovering = true" @mouseleave="inputHovering = visible">
    <!-- 多选 -->
    <template v-if="multiple">
      <div class="el-select__tags" :class="{'is-disabled': disabled}" :style="tagsTranslate" ref="tags">
        <span @after-leave="resetInputHeight" v-if="!collapsedTag && selected.length" ref="tagses" :class="{'nofocus': !collapsedTag}">
          <el-tag :closable="!selectDisabled" :size="selectSize" :hit="selected[0].hitState" type="info" @close="deleteTag($event, selected[0])" disable-transitions>
            <span class="el-select__tags-text">{{ selected[0].currentLabel }}</span>
          </el-tag>
          <el-tag v-if="tagCount > 1 && selected.length > 1" :closable="!selectDisabled" :size="selectSize" :hit="selected[1].hitState" type="info" @close="deleteTag($event, selected[1])"
            disable-transitions>
            <span class="el-select__tags-text">{{ selected[1].currentLabel }}</span>
          </el-tag>
          <el-tag v-if="selected.length > tagCount" :closable="false" :size="selectSize" type="info" disable-transitions>
            <span class="el-select__tags-text">+{{ selected.length - tagCount }}</span>
          </el-tag>
        </span>
        <transition-group @after-leave="resetInputHeight" ref="sectagses" v-if="collapsedTag">
          <el-tag v-for="item in selected" :key="getValueKey(item)" :closable="!selectDisabled" :size="selectSize" :hit="item.hitState" type="info" @close="deleteTag($event, item)"
            disable-transitions>
            <span class="el-select__tags-text">{{ item.currentLabel }}</span>
          </el-tag>
        </transition-group>
        <input type="text" class="el-select__input" :class="[selectSize ? `is-${ selectSize }` : '', { 'no-border': !border }]" :disabled="selectDisabled" :autocomplete="autoComplete || autocomplete"
          @focus.stop="handleFocus" @blur.stop="refinputBlur" @keyup="managePlaceholder" @keydown="resetInputState" @keydown.down.prevent="navigateOptions('next')"
          @keydown.up.prevent="navigateOptions('prev')" @keydown.enter.prevent="selectOption" @keydown.esc.stop.prevent="visible = false" @keydown.delete="deletePrevTag" @keydown.tab="visible = false"
          @compositionstart="handleComposition" @compositionupdate="handleComposition" @compositionend="handleComposition" v-model="query" @input="debouncedQueryChange" style="width: 10px"
          ref="input" />
      </div>
      <div class="el-select-tags-modal" :class="{'modal-is-active': visible,'selectDisabled':selectDisabled}" v-if="selected.length"></div>
    </template>
    <!--  ? selectDisabled : '' -->
    <!-- 不是只读？怎么关联了disabled？ -->
    <el-input ref="reference" v-model="selectedLabel" type="text" :placeholder="currentPlaceholder" :name="name" :id="id" :autocomplete="autoComplete || autocomplete" :size="selectSize"
      :disabled="disabled" :readonly="readonly" :validate-event="false" :class="{ 'is-focus': visible, 'is-readable': readable, 'no-border': !border }"
      :tabindex="(multiple || filterable) ? '-1' : null" @focus.stop="handleFocus" @blur.stop="handleBlur" @input="debouncedOnInputChange" @keydown.native.down.stop.prevent="navigateOptions('next')"
      @keydown.native.up.stop.prevent="navigateOptions('prev')" @keydown.native.enter.prevent="selectOption" @keydown.native.esc.stop.prevent="visible = false" @keydown.native.tab="visible = false">
      <template slot="prefix" v-if="$slots.prefix">
        <slot name="prefix"></slot>
      </template>
      <template slot="suffix">
        <div>
          <i v-show="!showClose && filterable && visible" class="el-select__caret el-input__icon el-icon-search"></i>
          <i v-show="filterable ? (!showClose && !visible) : !showClose" :class="['el-select__caret', 'el-input__icon', iconClass ? 'el-icon-' + iconClass : '']"></i>
          <i v-show="showClose" key="clear" class="el-input__icon el-icon-close close-svg" @click.stop="handleClearClick">
          </i>
        </div>
      </template>
    </el-input>
    <transition name="el-zoom-in-top" @before-enter="handleMenuEnter" @after-leave="doDestroy">
      <el-select-menu ref="popper" :append-to-body="popperAppendToBody" v-show="visible && emptyText !== false">
        <el-scrollbar @mouseleave.native="menuLeave" tag="ul" wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list" ref="scrollbar"
          :class="{ 'is-empty': !allowCreate && query && filteredOptionsCount === 0 && !treeSelect}" v-show="options.length > 0 && !loading">
          <el-option :value="query" created v-if="showNewOption && !emptyText">
          </el-option>
          <slot></slot>
        </el-scrollbar>
        <template v-if="emptyText && (!allowCreate || loading || (allowCreate && options.length === 0 )) && !treeSelect">
          <slot name="empty" v-if="$slots.empty"></slot>
          <p class="el-select-dropdown__empty" v-else>
            {{ emptyText }}
          </p>
        </template>
      </el-select-menu>
    </transition>
  </div>
</template>

<script type="text/babel">
import Emitter from 'el-ui/src/mixins/emitter';
import Focus from 'el-ui/src/mixins/focus';
import Locale from 'el-ui/src/mixins/locale';
import ElInput from 'el-ui/packages/input';
import ElSelectMenu from './select-dropdown.vue';
import ElOption from './option.vue';
import ElTag from 'el-ui/packages/tag';
import ElScrollbar from 'el-ui/packages/scrollbar';
import debounce from 'throttle-debounce/debounce';
import Clickoutside from 'el-ui/src/utils/clickoutside';
import { addResizeListener, removeResizeListener } from 'el-ui/src/utils/resize-event';
import scrollIntoView from 'el-ui/src/utils/scroll-into-view';
import { getValueByPath, valueEquals, isIE, isEdge } from 'el-ui/src/utils/util';
import NavigationMixin from './navigation-mixin';
import { isKorean } from 'src/utils/shared';
import { ConfigConsumerProps } from '../../config-provider/src/configConsumerProps';

export default {
  mixins: [Emitter, Locale, Focus('reference'), NavigationMixin],

  name: 'ElSelect',

  componentName: 'ElSelect',

  inject: {
    elForm: {
      default: ''
    },

    elFormItem: {
      default: ''
    },
    configProvider: { default: () => ConfigConsumerProps }
  },

  provide() {
    return {
      'select': this
    };
  },

  computed: {
    tagsTranslate() {
      // 处理刚开始绑定的是value，options更新后tagsWidth不会更新的问题
      if (this.options.length && this.$refs.tags) {
        this.$nextTick(() => {
          this.tagsWidth = this.$refs.tags.getBoundingClientRect().width
        })
      }
      if (this.tagsWidth === 0 || (this.multiple && !this.selected.length)) {
        return {}
      }
    },
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },

    readonly() {
      return !this.filterable || this.multiple || (!isIE() && !isEdge() && !this.visible)
    },


    showClose() {
      let hasValue = this.multiple
        ? Array.isArray(this.value) && this.value.length > 0
        : this.value !== undefined && this.value !== null && this.value !== '';
      let criteria = this.clearable &&
        !this.selectDisabled &&
        this.inputHovering &&
        hasValue;
      return criteria;
    },

    iconClass() {
      if (this.isPagination === true) {
        return this.visible ? 'caret-up-blod is-reverse' : 'caret-up-blod';
      }
      else {
        return this.visible ? 'arrow-down is-reverse' : 'arrow-down';
      }
    },

    debounce() {
      return this.remote ? 300 : 0;
    },

    emptyText() {
      if (this.loading) {
        return this.loadingText || this.t('el.select.loading');
      } else {
        if (this.remote && this.query === '' && this.options.length === 0) return false;
        if ((this.filterable || this.multiple) && this.query && this.options.length > 0 && this.filteredOptionsCount === 0) {
          return this.noMatchText || this.t('el.select.noMatch');
        }
        if (this.options.length === 0) {
          return this.noDataText || this.t('el.select.noData');
        }
      }
      return null;
    },

    showNewOption() {
      let hasExistingOption = this.options.filter(option => !option.created)
        .some(option => option.currentLabel === this.query);
      return this.filterable && this.allowCreate && this.query !== '' && !hasExistingOption;
    },

    selectSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },


    selectDisabled() {
      // ？？？？
      if (this.readable) {
        return this.disabled || this.readable || (this.elForm || {}).disabled || (this.elForm || {}).readable;
      } else {
        // return this.disabled || (this.elForm || {}).disabled || (this.elForm || {}).readable;
        return this.disabled || (this.elForm || {}).disabled || (this.elForm || {}).readable;
      }
    },
    propPlaceholder() {
      return typeof this.placeholder !== 'undefined' ? this.placeholder : this.t('el.select.placeholder');
    }
  },

  components: {
    ElInput,
    ElSelectMenu,
    ElOption,
    ElTag,
    ElScrollbar
  },

  directives: { Clickoutside },

  props: {
    name: String,
    id: String,
    value: {
      required: true
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    /** @Deprecated in next major version */
    autoComplete: {
      type: String,
      validator(val) {
        process.env.NODE_ENV !== 'production' &&
          console.warn('[El Warn][Select]\'auto-complete\' property will be deprecated in next major version. please use \'autocomplete\' instead.');
        return true;
      }
    },
    automaticDropdown: Boolean,
    size: String,
    disabled: Boolean,
    clearable: Boolean,
    filterable: Boolean,
    allowCreate: Boolean,
    loading: Boolean,
    readable: Boolean,
    popperClass: String,
    remote: Boolean,
    loadingText: String,
    noMatchText: String,
    noDataText: String,
    remoteMethod: Function,
    filterMethod: Function,
    closeHighLight: {
      type: Boolean,
      default: false
    },
    multiple: Boolean,
    multipleLimit: {
      type: Number,
      default: 0
    },
    // 显示个数
    tagCount: {
      type: Number,
      default: 2
    },
    // 是否显示边框
    border: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      required: false
    },
    defaultFirstOption: Boolean,
    reserveKeyword: Boolean,
    valueKey: {
      type: String,
      default: 'value'
    },
    collapsed: Boolean,
    popperAppendToBody: {
      type: Boolean,
      default: true
    },
    isPagination: {
      type: Boolean,
      default: false
    },
    treeSelect: {
      // true 表示树选择
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      options: [],
      cachedOptions: [],
      createdLabel: null,
      createdSelected: false,
      selected: this.multiple ? [] : {},
      inputLength: 20,
      inputWidth: 0,
      initialInputHeight: 0,
      cachedPlaceHolder: '',
      optionsCount: 0,
      filteredOptionsCount: 0,
      visible: false,
      softFocus: false,
      selectedLabel: '',
      hoverIndex: -1,
      query: '',
      previousQuery: null,
      inputHovering: false,
      currentPlaceholder: '',
      menuVisibleOnFocus: false,
      isOnComposition: false,
      isSilentBlur: false,
      tagsWidth: 0, // 标签的总宽度
      selectWidth: 0,
      timer: null,
      collapsedTag: false
    };
  },
  watch: {
    selectDisabled() {
      this.$nextTick(() => {
        this.refreshHeight()
        this.resetInputHeight();
      });
    },
    propPlaceholder(val) {
      this.cachedPlaceHolder = this.currentPlaceholder = val;
    },
    multiple(val) {
      this.selectedLabel = '';
      this.query = ''
      this.selected = val ? [] : {}
      this.$emit('input', val ? [] : '');
    },
    value: {
      handler(val, oldVal) {
        if (this.multiple) {
          this.resetInputHeight();
          /*if ((val && val.length > 0) || (this.$refs.input && this.query !== '')) {
            this.currentPlaceholder = '';
          } else {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }*/
          if ((this.filterable || this.multiple) && !this.reserveKeyword) {
            this.query = '';
            this.handleQueryChange(this.query);
          }
        }
        this.setSelected();
        if (this.filterable && !this.multiple) {
          this.inputLength = 20;
        }
        if (!valueEquals(val, oldVal)) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
        if ((val && val.length > 0) || (this.$refs.input && this.query !== '')) {
          this.currentPlaceholder = '';
        } else {
          this.currentPlaceholder = this.cachedPlaceHolder;
        }
        // if (this.multiple) {
        //   this.$refs.input && this.$refs.input.focus()
        // }
      },
      immediate: true
    },
    visible(val) {
      if (!val) {
        this.broadcast('ElSelectDropdown', 'destroyPopper');
        if (this.$refs.input) {
          this.$refs.input.blur();
        }
        this.query = '';
        // if (this.filterable && this.multiple) {
        //   this.resizeFilterableInput(this.query);
        // }
        this.previousQuery = null;
        this.selectedLabel = '';
        this.inputLength = 20;
        this.menuVisibleOnFocus = false;
        this.resetHoverIndex();
        this.$nextTick(() => {
          if (this.$refs.input &&
            this.$refs.input.value === '' &&
            this.selected.length === 0) {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
        });
        if (!this.multiple) {
          if (this.selected) {
            if (this.filterable && this.allowCreate &&
              this.createdSelected && this.createdLabel) {
              this.selectedLabel = this.createdLabel;
            } else {
              this.selectedLabel = this.selected.currentLabel;
            }
            if (this.filterable) this.query = this.selectedLabel;
          }

          if (this.filterable) {
            this.currentPlaceholder = this.cachedPlaceHolder;
          }
        }
      } else {
        if (this.selected.length === 0 || this.selected.value === '') {
          this.options && this.options.map(option => {
            option.hover = !!option.itemSelected
          })
        }
        this.broadcast('ElSelectDropdown', 'updatePopper');
        if (this.filterable) {
          this.query = '';
          this.handleQueryChange(this.query);
          if (this.multiple) {
            this.$refs.input.focus();
          } else {
            if (!this.remote) {
              this.broadcast('ElOption', 'queryChange', '');
              this.broadcast('ElOptionGroup', 'queryChange');
            }

            if (this.selectedLabel) {
              this.currentPlaceholder = this.selectedLabel;
              this.selectedLabel = '';
            }
          }
        }
      }
      this.$emit('visible-change', val);
    },

    options() {
      if (this.$isServer) return;
      this.$nextTick(() => {
        this.broadcast('ElSelectDropdown', 'updatePopper');
      });
      if (this.multiple) {
        this.resetInputHeight();
      }
      let inputs = this.$el.querySelectorAll('input');
      if ([].indexOf.call(inputs, document.activeElement) === -1) {
        this.setSelected();
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption();
      }
    },
    tagCount() {
      this.refreshHeight()
    },
    selected(val) {
      if (this.$refs.tags) {
        this.$nextTick(() => {
          //todo：为了处理删除tag时，tagsWidth不会自动更新
          if (this.timer) clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.tagsWidth = this.$refs.tags && this.$refs.tags.getBoundingClientRect().width;
          }, 100);
        })
      }
      this.$nextTick(() => {
        if (val.length) {
          if (this.multiple && !this.filterable) {
            this.$refs.input && this.$refs.input.focus()
          }
          if (this.$refs && this.$refs.input) {
            this.$refs.input.style.marginLeft = '2px';
          }
        } else {
          if (this.$refs && this.$refs.input) {
            this.$refs.input.style.marginLeft = '8px';
          }
          this.options && this.options.map(option => {
            option.hover = !!option.itemSelected
          })
        }
        this.calcFilterableInputWidth()
      })
    }
  },

  methods: {
    menuLeave() {
      this.options.forEach(option => {
        option.hover = !!option.itemSelected
      });
    },
    handleComposition(event) {
      const text = event.target.value;
      if (event.type === 'compositionend') {
        this.isOnComposition = false;
        this.$nextTick(_ => this.handleQueryChange(text));
      } else {
        const lastCharacter = text[text.length - 1] || '';
        this.isOnComposition = !isKorean(lastCharacter);
      }
    },
    handleQueryChange(val) {
      if (this.previousQuery === val || this.isOnComposition) return;
      if (
        this.previousQuery === null &&
        (typeof this.filterMethod === 'function' || typeof this.remoteMethod === 'function')
      ) {
        this.previousQuery = val;
        return;
      }
      this.previousQuery = val;
      this.$nextTick(() => {
        if (this.visible) this.broadcast('ElSelectDropdown', 'updatePopper');
      });
      this.hoverIndex = -1;
      if (this.multiple || this.filterable) {
        if (this.$refs.input) {
          this.$nextTick(() => {
            const length = this.$refs.input.value.length * 15 + 20;
            this.inputLength = !this.collapsedTag ? Math.min(50, length) : length;
            this.managePlaceholder();
            this.resetInputHeight();
          });
        }
      }
      if (this.remote && typeof this.remoteMethod === 'function') {
        this.hoverIndex = -1;
        this.remoteMethod(val);
      } else if (typeof this.filterMethod === 'function') {
        this.filterMethod(val);
        this.broadcast('ElOptionGroup', 'queryChange');
      } else {
        this.filteredOptionsCount = this.optionsCount;
        this.broadcast('ElOption', 'queryChange', val);
        this.broadcast('ElOptionGroup', 'queryChange');
      }
      if (this.defaultFirstOption && (this.filterable || this.remote) && this.filteredOptionsCount) {
        this.checkDefaultFirstOption();
      }
      this.$emit('filterData', val);
    },

    scrollToOption(option) {
      const target = Array.isArray(option) && option[0] ? option[0].$el : option.$el;
      if (this.$refs.popper && target) {
        const menu = this.$refs.popper.$el.querySelector('.el-select-dropdown__wrap');
        scrollIntoView(menu, target);
      }
      this.$refs.scrollbar && this.$refs.scrollbar.handleScroll();
    },

    handleMenuEnter() {
      this.$nextTick(() => this.scrollToOption(this.selected));
    },

    emitChange(val) {
      if (!valueEquals(this.value, val)) {
        if (this.collapsed) {
          this.collapsedTag = val.length > this.tagCount
        }
        this.$emit('change', val);
      }
    },

    getOption(value) {
      let option;
      const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
      const isNull = Object.prototype.toString.call(value).toLowerCase() === '[object null]';
      const isUndefined = Object.prototype.toString.call(value).toLowerCase() === '[object undefined]';

      for (let i = this.cachedOptions.length - 1; i >= 0; i--) {
        const cachedOption = this.cachedOptions[i];
        const isEqual = isObject
          ? getValueByPath(cachedOption.value, this.valueKey) === getValueByPath(value, this.valueKey)
          : cachedOption.value === value;
        if (isEqual) {
          option = cachedOption;
          break;
        }
      }
      if (option) return option;
      const label = (!isObject && !isNull && !isUndefined)
        ? String(value) : '';
      let newOption = {
        value: value,
        currentLabel: label
      };
      if (this.multiple) {
        newOption.hitState = false;
      }
      return newOption;
    },

    setSelected() {
      if (!this.multiple) {
        let option = this.getOption(this.value);
        if (option.created) {
          this.createdLabel = option.currentLabel;
          this.createdSelected = true;
        } else {
          this.createdSelected = false;
        }
        this.selectedLabel = option.currentLabel;
        this.selected = option;
        if (this.filterable) this.query = this.selectedLabel;
        return;
      }
      let result = [];
      if (Array.isArray(this.value)) {
        this.value.forEach(value => {
          result.push(this.getOption(value));
        });
      }
      this.selected = result;
      this.$nextTick(() => {
        this.refreshHeight('focus')
      })
    },

    handleFocus(event) {
      if (this.readable) return
      if (this.multiple) {
        this.$refs.input && this.$refs.input.focus()
      }
      if (!this.softFocus) {
        if (this.automaticDropdown || this.filterable) {
          this.visible = true;
          if (this.filterable) {
            this.menuVisibleOnFocus = true;
          }
        }
        this.$emit('focus', event);
      } else {
        this.softFocus = false;
      }
      this.inputHovering = true
      this.collapsedTag = this.collapsed
      this.refreshHeight('focus')
    },
    refreshHeight(val) {
      if (!this.$refs.tags) return
      this.$refs.tags.style.flexWrap = this.collapsedTag ? 'wrap' : 'nowrap'
      this.$nextTick(() => {
        if (this.$refs.tags) {
          this.tagsWidth = this.$refs.tagses ? this.$refs.tagses.getBoundingClientRect().width : 0;
          // this.tagsWidth = this.$refs.tags.getBoundingClientRect().width;
        }
        this.selectWidth = this.$refs.select && this.$refs.select.getBoundingClientRect().width;
        if (!this.treeSelect) {
          // 树选择器加上这个样式后，在宽度不够的情况下，多选会出现样式错乱
          this.$refs.tags.style.left = '4px'
        }
        if (this.tagsWidth <= this.selectWidth - 38) {
          this.$refs.tags.style.transform = 'translate(0, -50%)'
        } else {
          if (this.selected.length >= this.tagCount) {
            if (this.collapsedTag || this.treeSelect) {
              this.$refs.tags.style.transform = 'translate(0, -50%)'
              this.$refs.tags.style.right = '36px'
            } else {
              // if (val && val === 'focus') {
              //   this.$refs.tags.style.transform = `translate(-${this.tagsWidth - this.selectWidth + 52}px, -50%)`
              // } else {
              this.$refs.tags.style.transform = `translate(-${this.tagsWidth - this.selectWidth + 60}px, -50%)`
              // }
              this.$refs.tags.style.right = '0px'
            }
          } else {
            this.$refs.tags.style.transform = 'translate(0, -50%)'
          }
        }
        this.resetInputHeight()
      })
    },
    refinputBlur() {
      this.softFocus = false;
      this.refreshHeight()
      // this.$refs.input.style.width = 0;
      // this.tagsWidth -= 12
      // this.query = "";
    },

    blur() {
      this.visible = false;
      this.$refs.reference.blur();
    },

    handleBlur(event) {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        if (this.isSilentBlur) {
          this.isSilentBlur = false;
        } else {
          this.$emit('blur', event);
        }
      }, 50);
      this.inputHovering = false
      this.softFocus = false;
    },

    handleClearClick(event) {
      this.deleteSelected(event);
    },

    doDestroy() {
      this.$refs.popper && this.$refs.popper.doDestroy();
    },

    handleClose() {
      // if(this.$refs.input) {
      //   this.$refs.input.style.width = 0;
      //   // this.tagsWidth -= 12
      // }
      if (!this.reserveKeyword) {
        this.query = '';
        this.handleQueryChange(this.query);
      }
      this.collapsedTag = false
      this.visible = false;
      this.inputHovering = false
      if (this.collapsed) {
        this.refreshHeight()
      }
    },

    toggleLastOptionHitState(hit) {
      if (!Array.isArray(this.selected)) return;
      const option = this.selected[this.selected.length - 1];
      if (!option) return;

      if (hit === true || hit === false) {
        option.hitState = hit;
        return hit;
      }

      //#region 处理多选删除时键盘删除要按两次才能删除，优化为按一次就删除
      if (hit === undefined) {
        return false
      }
      //#endregion

      option.hitState = !option.hitState;
      return option.hitState;
    },

    deletePrevTag(e) {
      if (e.target.value.length <= 0 && !this.toggleLastOptionHitState()) {
        const value = this.value.slice();
        value.pop();
        this.$emit('input', value);
        this.emitChange(value);
      }
    },

    managePlaceholder() {
      if (this.currentPlaceholder !== '') {
        this.currentPlaceholder = this.$refs.input.value ? '' : this.cachedPlaceHolder;
      }
    },

    resetInputState(e) {
      if (e.keyCode !== 8) this.toggleLastOptionHitState(false);
      this.inputLength = this.$refs.input.value.length * 15 + 20;
      this.resetInputHeight();
    },

    resetInputHeight() {
      this.$nextTick(() => {
        if (!this.$refs.reference) return;
        // input加了一层div，所以最后面还要加一层childNodes
        if (this.collapsed) {
          let inputChildNodes = this.$refs.reference.$el.childNodes[0].childNodes;
          let input = [].filter.call(inputChildNodes, item => item.tagName === 'INPUT')[0];
          const tags = this.$refs.tags;
          const tagsHeight = tags ? Math.round(tags.getBoundingClientRect().height) : 0;
          const sizeMap = {
            medium: 36,
            small: 32,
            mini: 28
          };
          let num = input.getBoundingClientRect().height || sizeMap[this.selectSize];
          const sizeInMap = this.initialInputHeight || num;
          input.style.height = this.selected.length === 0
            ? sizeInMap + 'px'
            : Math.max(
              tags ? (tagsHeight + (tagsHeight > sizeInMap ? 6 : 0)) : 0,
              sizeInMap
            ) + 'px';
        }
        if (this.visible && this.emptyText !== false) {
          this.broadcast('ElSelectDropdown', 'updatePopper');
        }
      });
    },

    resetHoverIndex() {
      if (this.timer) clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        if (!this.multiple) {
          this.hoverIndex = this.selected ? this.options.indexOf(this.selected) : -1;
        } else {
          if (this.selected.length > 0) {
            this.hoverIndex = Math.min.apply(null, this.selected.map(item => this.options.indexOf(item)));
          } else {
            this.hoverIndex = -1;
          }
        }
      }, 300);
    },
    handleOptionSelect(option, byClick) {
      if (this.multiple) {
        const value = (this.value || []).slice();
        const optionIndex = this.getValueIndex(value, option.value);
        if (optionIndex > -1) {
          value.splice(optionIndex, 1);
        } else if (this.multipleLimit <= 0 || value.length < this.multipleLimit) {
          value.push(option.value);
        }
        this.$emit('input', value);
        this.emitChange(value);
        if (option.created) {
          this.query = '';
          this.handleQueryChange('');
          this.inputLength = 20;
        }
        if (this.filterable) this.$refs.input.focus();
      } else {
        this.$emit('input', option.value);
        this.emitChange(option.value);
        this.visible = false;
      }
      this.isSilentBlur = byClick;
      // this.setSoftFocus(); // 选中后不要聚焦
      if (this.visible) return;
      this.$nextTick(() => {
        this.scrollToOption(option);
      });
    },

    setSoftFocus() {
      this.softFocus = true;
      const input = this.$refs.input || this.$refs.reference;
      if (input) {
        input.focus();
      }
    },

    getValueIndex(arr = [], value) {
      const isObject = Object.prototype.toString.call(value).toLowerCase() === '[object object]';
      if (!isObject) {
        return arr.indexOf(value);
      } else {
        const valueKey = this.valueKey;
        let index = -1;
        arr.some((item, i) => {
          if (getValueByPath(item, valueKey) === getValueByPath(value, valueKey)) {
            index = i;
            return true;
          }
          return false;
        });
        return index;
      }
    },

    toggleMenu() {
      if (!this.selectDisabled) {
        if (this.menuVisibleOnFocus) {
          this.menuVisibleOnFocus = false;
        } else {
          this.visible = !this.visible;
        }
        if (this.visible) {
          this.$nextTick(() => {
            (this.$refs.input || this.$refs.reference).focus();
            this.collapsedTag = this.collapsed
            if (this.$refs.input) {
              if (!this.query) {
                this.$refs.input.style.width = "10px"
              }
              this.calcFilterableInputWidth()
              this.tagsWidth += 12;
            }
          })
        }
      }
    },

    selectOption() {
      if (!this.visible) {
        this.toggleMenu();
      } else {
        if (this.options[this.hoverIndex]) {
          this.handleOptionSelect(this.options[this.hoverIndex]);
        }
      }
    },

    deleteSelected(event) {
      event.stopPropagation();
      const value = this.multiple ? [] : '';
      this.$emit('input', value);
      this.emitChange(value);
      this.visible = false;
      this.$emit('clear');
    },

    deleteTag(event, tag) {
      let index = this.selected.indexOf(tag);
      if (index > -1 && !this.selectDisabled) {
        const value = this.value.slice();
        value.splice(index, 1);
        this.$emit('input', value);
        this.emitChange(value);
        this.$emit('remove-tag', tag.value);
      }
      event.stopPropagation();
      this.collapsedTag = false
      this.visible = false;
      if (this.collapsed) {
        this.refreshHeight()
      }
      this.$nextTick(() => {
        this.calcFilterableInputWidth()
      })
    },

    onInputChange() {
      if (this.filterable && this.query !== this.selectedLabel) {
        this.query = this.selectedLabel;
        this.handleQueryChange(this.query);
      }
    },

    onOptionDestroy(index) {
      if (index > -1) {
        this.optionsCount--;
        this.filteredOptionsCount--;
        this.options.splice(index, 1);
      }
    },

    resetInputWidth() {
      this.inputWidth = this.$refs.reference && this.$refs.reference.$el.getBoundingClientRect().width;
    },

    handleResize() {
      this.resetInputWidth();
      if (this.multiple) this.resetInputHeight();
    },

    checkDefaultFirstOption() {
      this.hoverIndex = -1;
      // highlight the created option
      let hasCreated = false;
      for (let i = this.options.length - 1; i >= 0; i--) {
        if (this.options[i].created) {
          hasCreated = true;
          this.hoverIndex = i;
          break;
        }
      }
      if (hasCreated) return;
      for (let i = 0; i !== this.options.length; ++i) {
        const option = this.options[i];
        if (this.query) {
          // highlight first options that passes the filter
          if (!option.disabled && !option.groupDisabled && option.visible) {
            this.hoverIndex = i;
            break;
          }
        } else {
          // highlight currently selected option
          if (option.itemSelected) {
            this.hoverIndex = i;
            break;
          }
        }
      }
    },

    getValueKey(item) {
      if (Object.prototype.toString.call(item.value).toLowerCase() !== '[object object]') {
        return item.value;
      } else {
        return getValueByPath(item.value, this.valueKey);
      }
    },
    resizeFilterableInput(val) {
      if (val && val.trim() && this.$refs.input.style.width === '12px') {
        this.$refs.input.style.width = '60px';
        this.tagsWidth += 48;
      } else if ((!val || !val.trim()) && this.$refs.input.style.width === '60px') {
        this.$refs.input.style.width = '10px';
        this.tagsWidth -= 48;
      }
    },

    // 计算搜索的input的宽度
    calcFilterableInputWidth() {
      this.$nextTick(() => {
        if (this.multiple) {
          // 需要将ref="tags"下面的tag全部选出来并计算他们的宽度之和，然后与ref="select"的宽度比较
          const tags = this.$refs.tags.querySelectorAll(".el-tag");
          const tagsWith = this.$refs.tags.getBoundingClientRect().width
          let countWidth = 0;
          tags.forEach(item => {
            countWidth += item.getBoundingClientRect().width
          })
          const selectWidth = this.$refs.select.getBoundingClientRect().width
          if (this.$refs.input) {
            if (!this.collapsedTag) {
              if (countWidth == 0) {
                this.$refs.input.style.width = selectWidth - 52 + "px";
              } else if (selectWidth > countWidth) {
                const difCount = selectWidth - countWidth - 52
                this.$refs.input.style.width = difCount > 0 ? difCount + "px" : '12px';
              } else {
                this.$refs.input.style.width = '12px'
              }
            } else {
              if (tags.length === 0) {
                this.$refs.input.style.width = selectWidth - 52 + "px";
              } else {
                this.$refs.tags.style.width = selectWidth - 52 + 'px'
                if (countWidth < selectWidth - 62) {
                  this.$refs.input.style.width = selectWidth - countWidth - 70 + 'px'
                  this.$refs.input.style.flex = 'none'
                } else {
                  this.$refs.input.style.flex = 1
                }
              }
            }
          }
        }
      })

    }
  },

  created() {
    this.cachedPlaceHolder = this.currentPlaceholder = this.propPlaceholder;
    if (this.multiple && !Array.isArray(this.value)) {
      this.$emit('input', []);
    }
    if (!this.multiple && Array.isArray(this.value)) {
      this.$emit('input', '');
    }

    this.debouncedOnInputChange = debounce(this.debounce, () => {
      this.onInputChange();
    });

    this.debouncedQueryChange = debounce(this.debounce, (e) => {
      // this.resizeFilterableInput(e.target.value);
      this.handleQueryChange(e.target.value);
    });

    this.$on('handleOptionClick', this.handleOptionSelect);
    this.$on('setSelected', this.setSelected);
  },

  mounted() {
    if (this.multiple && Array.isArray(this.value) && this.value.length > 0) {
      this.currentPlaceholder = '';
    }
    addResizeListener(this.$el, this.handleResize);

    const reference = this.$refs.reference;
    if (reference && reference.$el) {
      const sizeMap = {
        medium: 36,
        small: 32,
        mini: 28
      };
      const input = reference.$el.querySelector('input');
      this.initialInputHeight = input.getBoundingClientRect().height || sizeMap[this.selectSize];
    }
    if (this.remote && this.multiple) {
      this.resetInputHeight();
    }
    this.$nextTick(() => {
      if (reference && reference.$el) {
        this.inputWidth = reference.$el.getBoundingClientRect().width;
      }
    });
    this.setSelected();
  },

  beforeDestroy() {
    if (this.$el && this.handleResize) removeResizeListener(this.$el, this.handleResize);
  }
};
</script>
