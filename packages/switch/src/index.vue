<template>
  <div class="ds-switch" @click="handleChange" @mouseenter="handleHover(true)" @mouseleave="handleHover(false)" :class="{checked, disabled}">
    <span v-if="checked">且</span>
    <span v-else>或</span>
  </div>
</template>

<script>
export default {
  name: "DsSwitch",
  props: {
    value: {
      type: [Boolean, String, Number],
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    activeValue: {
      type: [Boolean, String, Number],
      default: true
    },
    inactiveValue: {
      type: [Boolean, String, Number],
      default: false
    },
  },
  computed: {
    checked() {
      console.log(this.value, this.activeValue)
      return this.value === this.activeValue;
    },
  },
  watch: {
    checked: {
      deep: true,
      immediate: true,
      handler: function (val, oldVal) {
        this.$emit('checkedChange', val)
      }
    },
  },
  created() {
    if (!~[this.activeValue, this.inactiveValue].indexOf(this.value)) {
      this.$emit('input', this.inactiveValue);
    }
  },
  methods: {
    handleChange() {
      if (this.disabled) return
      const val = this.checked ? this.inactiveValue : this.activeValue;
      this.$emit('input', val);
      this.$emit('change', val);
    },
    handleHover(val) {
      this.$emit('hover', val)
    }
  }
}
</script>
