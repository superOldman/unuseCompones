<template>
  <div class="ds-icon-font" :style="warpStyle">
    <svg class="ds-font-icons" aria-hidden="true" :style="svgStyle">
      <use :xlink:href="`${realName}`"></use>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'DsIconFont',
  props: {
    name: String,
    width: {
      type: String | Number
    },
    height: {
      type: String | Number
    }
  },
  computed: {
    realName() {
      return `#${this.name}`
    },
    warpStyle() {
      const { width, height } = this
      const arr = [width, height].filter(v => v).map(v => `${v}`.replace('px', '') + 'px')
      if (arr.length < 0) return {}
      if (arr.length == 1) return { width: arr[0], height: arr[0] }
      return { width: arr[0], height: arr[1] }
    },
    svgStyle() {
      const { width, height } = this
      const arr = [width, height].filter(v => v).map(v => `${v}`.replace('px', '') + 'px')
      if (arr.length < 0) return {}
      return { fontSize: arr[0] }
    },
  }
}
</script>
