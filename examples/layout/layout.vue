<template>
  <el-container class="wh-100 fx layout-warp">
    <div class="fx-none side-warp h-100">
      <sidebar />
    </div>
    <el-container class="fx-full h-100">
      <router-view style="padding: 16px;" />
    </el-container>
  </el-container>
</template>

<script>
import sidebar from './sidebar/sidebar'
export default {
  name: 'Layout',
  components: {
    sidebar
  },
  props: {

  },
  data() {
    return {

    }
  },
  mounted() {
    console.log(this);
  },
  methods: {

  }
}
</script>

<style scoped lang="scss">
.side-warp {
  position: relative;
  z-index: 1;
  width: 200px;
  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: 0;
    width: 1px;
    height: 100%;
    background-color: #d5d5d5;
  }
}
</style>
