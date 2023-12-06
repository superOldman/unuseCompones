<template>
  <div>
    <el-button :disabled="!!remoteUrl" :loading="loading" type="primary" @click="clickLoadJs">
      按需加载jquery
    </el-button>
    <ds-remote-js v-if="remoteUrl" :src="remoteUrl" @loaded="handleLoaded"></ds-remote-js>
  </div>
</template>

<script>
const remoteUrl = 'https://code.jquery.com/jquery-3.7.1.slim.min.js'
export default {
  data() {
    return {
      remoteUrl: "",
      loading: false
    }
  },
  methods: {
    clickLoadJs() {
      this.remoteUrl = remoteUrl
      this.loading = true
    },
    handleLoaded() {
      this.loading = false
      this.$message.success(`loaded ${this.remoteUrl} 成功`)
      console.log(`loaded ${this.remoteUrl} 成功`, window.$)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>