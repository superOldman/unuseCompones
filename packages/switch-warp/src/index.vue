<template>
  <div class="ds-switch-warp" :class="{checked, hover}">
    <DsSwitch v-bind="$attrs" v-on="$listeners" @hover="hover = $event" @checkedChange="checked = $event" />
  </div>
</template>

<script>
import DsSwitch from 'packages/switch'
export default {
  name: "DsSwitchWarp",
  components: {
    DsSwitch
  },
  data() {
    return {
      hover: false,
      checked: false
    }
  },
}
</script>
