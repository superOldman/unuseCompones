<template>
  <li
    @mouseenter="hoverItem"
    @click.stop="selectOptionClick"
    class="el-select-dropdown__item"
    v-show="visible"
    :class="{
      'selected': itemSelected,
      'is-disabled': disabled || groupDisabled || limitReached,
      'hover': hover,
      'line-feed': lineFeed
    }">
    <slot>
      <el-checkbox v-if="select.multiple" @click.stop.native="()=>{}" @change="selectOptionClick" v-model="itemSelected"></el-checkbox>
      <span v-html="showHighLight(currentLabel)" :ref="'el-select-dropdown__item' + currentLabel"></span>
    </slot>
  </li>
</template>

<script type="text/babel">
  import Emitter from 'el-ui/src/mixins/emitter';
  import { getValueByPath, escapeRegexpString } from 'el-ui/src/utils/util';

  export default {
    mixins: [Emitter],

    name: 'ElOption',

    componentName: 'ElOption',

    inject: ['select'],

    props: {
      value: {
        required: true
      },
      label: [String, Number],
      created: Boolean,
      disabled: {
        type: Boolean,
        default: false
      },
      treeSelect: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        index: -1,
        groupDisabled: false,
        visible: true,
        hitState: false,
        hover: false,
        lineFeed: false
      };
    },

    computed: {
      isObject() {
        return Object.prototype.toString.call(this.value).toLowerCase() === '[object object]';
      },

      currentLabel() {
        return this.label || (this.isObject ? '' : this.value);
      },

      currentValue() {
        return this.value || this.label || '';
      },

      itemSelected: {
        get() {
          if (!this.select.multiple) {
            return this.isEqual(this.value, this.select.value);
          } else {
            return this.contains(this.select.value, this.value);
          }
        },
        set() {}
      },

      limitReached() {
        if (this.select.multiple) {
          return !this.itemSelected &&
            (this.select.value || []).length >= this.select.multipleLimit &&
            this.select.multipleLimit > 0;
        } else {
          return false;
        }
      }
    },

    watch: {
      currentLabel() {
        if (!this.created && !this.select.remote) this.dispatch('ElSelect', 'setSelected');
      },
      value(val, oldVal) {
        const { remote, valueKey } = this.select;
        if (!this.created && !remote) {
          if (valueKey && typeof val === 'object' && typeof oldVal === 'object' && val[valueKey] === oldVal[valueKey]) {
            return;
          }
          this.dispatch('ElSelect', 'setSelected');
        }
      }
    },

    methods: {
      showHighLight(val) {
        const keyword = this.select.selectedLabel || this.select.query
        return (this.select.filterable && !this.select.closeHighLight && keyword) ? val.replace(new RegExp(keyword, 'g'),
        `<span style="font-weight: var(--font-weight-500);">${keyword}</span>`
        ) : val
      },

      isEqual(a, b) {
        if (!this.isObject) {
          return a === b;
        } else {
          const valueKey = this.select.valueKey;
          return getValueByPath(a, valueKey) === getValueByPath(b, valueKey);
        }
      },

      contains(arr = [], target) {
        if (!this.isObject) {
          return arr && arr.indexOf(target) > -1;
        } else {
          const valueKey = this.select.valueKey;
          return arr && arr.some(item => {
            return getValueByPath(item, valueKey) === getValueByPath(target, valueKey);
          });
        }
      },

      handleGroupDisabled(val) {
        this.groupDisabled = val;
      },

      hoverItem() {
        if (!this.disabled && !this.groupDisabled) {
          this.select.hoverIndex = this.select.options.indexOf(this);
        }
      },

      selectOptionClick() {
        if (this.disabled !== true && this.groupDisabled !== true && !this.treeSelect) {
          this.dispatch('ElSelect', 'handleOptionClick', [this, true]);
        }
      },

      queryChange(query) {
        if (this.treeSelect) {
          this.visible = true;
        } else {
          this.visible = new RegExp(escapeRegexpString(query), 'i').test(this.currentLabel) || this.created;
          if (!this.visible) {
            this.select.filteredOptionsCount--;
          }
        }
      }
    },

    created() {
      this.select.options.push(this);
      this.select.cachedOptions.push(this);
      this.select.optionsCount++;
      this.select.filteredOptionsCount++;

      this.$on('queryChange', this.queryChange);
      this.$on('handleGroupDisabled', this.handleGroupDisabled);
    },

    beforeDestroy() {
      const { selected, multiple } = this.select;
      let selectedOptions = multiple ? selected : [selected];
      let index = this.select.cachedOptions.indexOf(this);
      let selectedIndex = selectedOptions.indexOf(this);

      // if option is not selected, remove it from cache
      if (index > -1 && selectedIndex < 0) {
        this.select.cachedOptions.splice(index, 1);
      }
      this.select.onOptionDestroy(this.select.options.indexOf(this));
    }
  };
</script>
