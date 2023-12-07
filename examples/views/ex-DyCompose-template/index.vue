<template>
  <div class="w-100">
    
    
  </div>
</template>

<script>

import { getLabel } from "packages/api"
import { omit } from "src/utils/object"
import { mockData } from './mock-Data'
import Ds from "packages"
import { toUUIDObject } from 'src/utils/object'




export default {
  components: {

  },

  data() {
    return {
      propOptions: {},
      data: mockData.userArr,
    }
  },
  computed: {
 
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