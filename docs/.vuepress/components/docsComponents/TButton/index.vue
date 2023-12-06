<template>
  <div>
    <div>
      <el-button size="small" type="primary" @click="exportExcel">导出</el-button>
    </div>
  </div>
</template>
<script>
export default {
  name: 'el-button-demo',
  data () {
    return {
    }
  },
  computed: {
  },
  created () {
  },
  methods: {
    // 导出
    async exportExcel () {
      console.log('导出')
    },
  }
}
</script>
