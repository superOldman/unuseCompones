<template>
  <!-- 表情包 -->
  <el-popover v-if="reference" ref="popover" :reference="reference" :placement="placement" :width="width" :trigger="trigger">
    <div class="fx-w">
      <div v-for="(emoji, index) in qqFaceIcons" :key="index" class="fx" @click="insertEditorNode(emoji)">
        <img :src="emoji.url" :alt="emoji.label">
      </div>
    </div>
  </el-popover>
</template>

<script>
import { getEmojiElement } from 'packages/multi-editor/src/components/qqEmojiPopover/config'
import popoverMixin from "packages/multi-editor/src/mixins/popover-mixin"
import { qqFaceIcons } from "packages/multi-editor/src/utils/qqEmoji"
import { TaEditorConst } from "packages/multi-editor/src/utils/const"

export default {
  name: "QQEmojiPopover",
  mixins: [popoverMixin],
  data() {
    return {
      qqFaceIcons
    }
  },

  methods: {
    insertEditorNode(item) {
      console.log('item', item)
      this.dispatch(TaEditorConst.EDITOR, 'editorInsertNode', {
        nodeFunc: () => getEmojiElement(item)
      })
      this.hide()
    },
  }
}
</script>
<style lang="scss" scoped>
img {
  width: 28px;
  height: 28px;
  cursor: pointer;
}
</style>
