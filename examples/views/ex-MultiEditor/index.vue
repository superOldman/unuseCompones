<template>
  <div>
    <DsMultiEditor :customTools="customTools" v-model="text" @input="handleTextChange"></DsMultiEditor>
  </div>
</template>

<script>
import DsMultiEditor from 'packages/multi-editor'

export default {
  name: 'Examples-DsMultiTypeSelect',
  components:{
    DsMultiEditor
  },
  data() {
    return {
      customTools: [
        'qqEmoji',
        'userProp',
        'content',
        'eventProp'
      ],
      text: '{$company:gs}[惊讶]\n111   2',
      // text: '{FIELD:$company:gs:公司}[惊讶]\n111   2',
    }
  },
  methods: {
    handleTextChange(val) {
      console.log(val)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
