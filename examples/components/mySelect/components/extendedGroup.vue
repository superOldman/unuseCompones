<template>
  <ul v-show="visible" class="el-select-group__wrap">
    <li class="el-select-group__title">
      <span class="groupName">{{ label }}</span>
      <span class="groupNum ml-4">{{ groupNum }}</span>
    </li>
    <li>
      <ul class="el-select-group">
        <slot></slot>
      </ul>
    </li>
  </ul>

</template>

<script type="text/babel">
import Emitter from '../mixins/emitter'

export default {
  name: 'ElOptionGroup',
  mixins: [Emitter],
  componentName: 'ElOptionGroup',
  props: {
    label: String,
    disabled: {
      type: Boolean,
      default: false
    },
    groupNum: {
      type: Number
    }
  },

  data() {
    return {
      visible: true
    }
  },

  watch: {
    disabled(val) {
      this.broadcast('ElOption', 'handleGroupDisabled', val)
    }
  },

  created() {
    this.$on('queryChange', this.queryChange)
  },

  mounted() {
    if (this.disabled) {
      this.broadcast('ElOption', 'handleGroupDisabled', this.disabled)
    }
  },

  methods: {
    queryChange() {
      // console.log(this.$children)
      // this.visible = this.$children &&
      //   Array.isArray(this.$children) &&
      //   this.$children.some(option => option.visible === true)
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../style/index.scss";
@import "../style/indexNew.scss";
</style>
