<template>
  <ul class="el-select-group__wrap" :class="{'show-component' : visible, 'no-border': !showbroder}" v-show="visible">
    <li class="el-select-group__title">{{ label }}</li>
    <li>
      <ul class="el-select-group">
        <slot></slot>
      </ul>
    </li>
  </ul>
</template>

<script type="text/babel">
  import Emitter from 'el-ui/src/mixins/emitter';

  export default {
    mixins: [Emitter],

    name: 'ElOptionGroup',

    componentName: 'ElOptionGroup',

    props: {
      label: String,
      disabled: {
        type: Boolean,
        default: false
      }
    },

    data() {
      return {
        visible: true,
        showbroder: true
      };
    },

    watch: {
      disabled(val) {
        this.broadcast('ElOption', 'handleGroupDisabled', val);
      }
    },
    // 参考TDeisgn 分组标题保留，不然的话，可能有底部多一条分割线的情况
    methods: {
      queryChange() {
        this.visible = this.$children &&
          Array.isArray(this.$children) &&
          this.$children.some(option => option.visible === true);
          this.$nextTick(() => {
            if (this.$parent.$children.filter(e => e.$el._prevClass.includes('show-component')).length === 1 && this.visible) {
              this.showbroder = false
            } else {
              this.showbroder = true
            }
          })
      }
    },

    created() {
      this.$on('queryChange', this.queryChange);
    },

    mounted() {
      if (this.disabled) {
        this.broadcast('ElOption', 'handleGroupDisabled', this.disabled);
      }
    }
  };
</script>
