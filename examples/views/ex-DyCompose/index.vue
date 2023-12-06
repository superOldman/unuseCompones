<template>
  <div class="w-100">
    <DsRuleUserProp :propOptions="propOptions" :value="data"></DsRuleUserProp>
  </div>
</template>

<script>

import { getLabel } from "packages/api"
import { omit } from "src/utils/object"
import { mockData } from './mock-Data'
export default {
  components: {

  },
  props: {
    filterList: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      propOptions: {},
      data: omit(mockData, ['eventFilterDTOs'])
    }
  },
  created() {
    this.reqGetLabel()
  },
  methods: {
    reqGetLabel() {
      const param = { typeList: [1], filterList: this.filterList }
      getLabel(param).then(({ code, data, message }) => {
        if (code != 200) return
        // 处理请求结果
        this.propOptions = omit(data, ['eventFilterDTOs'])
      }).catch(err => { console.log(err) }).finally(() => { })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>