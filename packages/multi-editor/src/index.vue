<template>
  <div class="ta-editor-container">
    <DsRemoteJs src="https://predataengine.marketingforce.com/gma/tinymceNew/tinymce.js" @loaded="initTinymce()"></DsRemoteJs>
    <div :id="editorId"></div>
    <template v-for="(item, index) in compDialogMap">
      <component :is="index" v-if="compDialogMap[index] != null" :key="index" :data="compDialogOption[index]" :show.sync="compDialogMap[index]" />
    </template>
    <template v-for="(item, index) in compPopoverMap">
      <component :is="index" :key="index" :options="compPopoverMap[index]" />
    </template>
    <div class="text-lenght">{{textLength}}/{{maxlength}}</div>
  </div>
</template>

<script>
import { toolbar, config } from "packages/multi-editor/src/utils/data"
import { isFunction, isObject, getImgAttributes, delegate, getContentText } from "packages/multi-editor/src/utils"
import components, { OtherTools } from "packages/multi-editor/src/components"
import { TaEditorConst } from "packages/multi-editor/src/utils/const"
import emitter from "packages/multi-editor/src/mixins/emitter"
import DsRemoteJs from "packages/remote-js"
console.log('OtherTools', OtherTools)
export default {
  name: 'DsMultiEditor',
  componentName: TaEditorConst.EDITOR,
  components: {
    ...components,
    DsRemoteJs,
  },
  mixins: [emitter],
  props: {
    toolbarAble: {
      type: Boolean,
      default: true
    },
    toolbar: {
      type: Array,
      default: () => toolbar
    },
    customTools: {
      type: Array,
      default: () => []
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: ''
    },
    contentType: {
      type: String,
      default: 'text' // text html
    },
    maxlength: {
      type: String | Number,
      default: 5000
    }
  },
  data() {
    return {
      // CustomToolCompDialog 存放位置
      compDialogMap: {},
      compDialogOption: {},
      // CustomToolCompDialog 存放位置
      compPopoverMap: {},
      editorId: `editor-${Date.now()}`,
      editor: null,
      html: null,
    }
  },
  computed: {
    validCustomTools() {
      const validCustomTools = this.customTools.map(v => OtherTools[v]).filter(v => v)
      if (validCustomTools.length != this.customTools.length) {
        console.warn('[taEditor:error]: 部分自定义工具无效')
      }
      return validCustomTools
    },
    useToolbar() {
      const customToolbar = [this.validCustomTools.map(v => v.name).join(' ')]
      if (this.toolbarAble) return [...this.toolbar, ...customToolbar].map(v => v)
      return customToolbar
    },
    textLength() {
      let { value } = this
      // console.log('value', `<${value}>`)
      // 换行符算2个字符
      // console.log('value.length', value.length)
      if (this.contentType == 'text') {
        value = value.replaceAll('\n', '**')
      }
      // console.log('value1', `<${value}>`)
      // console.log('value.length', value.length)
      // 匹配插件内容
      value = value.replace(/\{[^}]+?\}/g, (matchText) => {
        // 插件内容使用插件方法转化为html
        for (const plugin of this.validCustomTools) {
          const { textReg, textLengthFn } = plugin
          if (textReg && textLengthFn && textReg.test(matchText)) {
            return matchText.replace(textReg, textLengthFn)
          }
        }
        return matchText
      })
      console.log(333, value)
      return value.length
    }
  },
  watch: {
    disabled() {
      this.setDisabledMdoe()
    },
    value() {
      // this.setContent()
    }
  },
  mounted() {
    // this.initTinymce()
    this.$on('editorInsertNode', this.handleInsertNode);
  },
  methods: {
    handleEditorInited() {
      console.log('Editor inited')
      this.setDisabledMdoe()
      this.setContent(this.value)
    },
    handleChange() {
      const content = this.editor.getContent()
      this.html = content
      if (this.preValue == content) return
      this.preValue = content
      let value = content

      // 匹配插件内容
      value = value.replace(/<img[^>]+>/g, (matchText) => {
        // console.log(22222222, matchText)
        // 插件内容使用插件方法转化为文本
        for (const plugin of this.validCustomTools) {
          const { htmlReg, convertHtmlToText } = plugin
          if (htmlReg && convertHtmlToText && htmlReg.test(matchText)) {
            return matchText.replace(htmlReg, convertHtmlToText)
          }
        }
        return matchText
      })
      value = getContentText(value)
      if (value == this.value) return
      console.log('content', content)
      console.warn('value', `"${value}"`)
      this.$emit('input', value)
    },
    setContent(value = this.value) {
      if (!this.editor) return
      // console.log('setContentStart', value)
      let html = value || ''
      if (this.contentType == 'text') {
        html = html.split('\n').map(text => `<p>${text.replaceAll(' ', '&nbsp;')}</p>`).join('')
      }
      html = html.replace(/(\{[^}]+?\}|\[[\u4e00-\u9fa5]{1,4}])/g, (matchText) => {
        console.log('matchText', matchText)
        // 插件内容使用插件方法转化为html
        for (const plugin of this.validCustomTools) {
          const { textReg, convertTextToHtml } = plugin
          if (textReg && convertTextToHtml && textReg.test(matchText)) {
            const text = matchText.replace(textReg, convertTextToHtml)
            // console.log('text', text)
            return text
          }
        }
        return matchText
      })

      // console.log('html', html)
      if (html == this.html) return
      this.editor.setContent(html)
      // console.log('setContendEnd',)
    },
    setDisabledMdoe() {
      const { editor, disabled } = this
      if (editor !== null) {
        if (typeof editor.mode?.set === 'function') {
          editor.mode.set(disabled ? 'readonly' : 'design');
        } else {
          editor.setMode(disabled ? 'readonly' : 'design');
        }
      }
    },
    doShowDialog(compDialog) {
      this.broadcast(TaEditorConst.POPOVER, 'editor-popover-hide')
      this.$set(this.compDialogOption, compDialog, null)
      this.$set(this.compDialogMap, compDialog, true)
    },
    // 以下是交互字段
    handleInsertNode({ nodeFunc }) {
      const editor = window.tinymce.get(this.editorId)
      // 获取插入对象
      let range = editor.selection.getRng()
      // 创建node
      const node = nodeFunc(editor.getDoc())
      // 插入node
      range.insertNode(node)
      // 光标聚焦并移动至插入的表情后
      editor.execCommand('seleceAll')
      editor.selection.getRng().collapse()
      editor.focus()
      this.handleChange()
    },

    /* -------------------------------------------- 以下是载入信息 ------------------------------------------------- */
    getCustomContentStyle() {
      return this.validCustomTools.map(v => {
        return v.content_style || ""
      }).join('')
    },
    initTinymce() {
      const content_style = `${config.content_style || ''}${this.getCustomContentStyle()}`
      window.tinymce.init({
        ...config,
        readonly: this.disabled,
        selector: `#${this.editorId}`,
        toolbar: this.useToolbar,
        paste_as_text: true, // 粘贴为纯文本
        content_style,
        copy_pre_process: (content) => {
          const imgRegex = /<img\b[^>]*>/g
          return content.replace(imgRegex, function (imgStr) {
            console.log('imgStr-----', imgStr, '---------', getImgAttributes(imgStr))
            return ""
          })
        },
        init_instance_callback: (editor) => {
          delegate(editor.getBody(), 'click', 'img[data-ta-use]', (e) => {
            const useComp = e.target.getAttribute('data-ta-use')
            // const prop = e.target.getAttribute('data-ta-prop')
            const value = e.target.getAttribute('data-ta-value')
            this.$set(this.compDialogOption, useComp, { target: e.target, value })
            this.$set(this.compDialogMap, useComp, true)
          })
          this.handleEditorInited()
        },
        setup: (editor) => {
          this.editor = editor
          this.loadCustomTools(editor)
          editor.on('NodeChange Change KeyUp', () => {
            // console.log("内容已更改")
            // console.log('editor', editor.getContent())
            this.handleChange()
          })
        }
      })
    },
    loadCustomTools(editor) {
      this.validCustomTools.forEach(customTool => {
        let { name, toolOptions } = customTool
        toolOptions = toolOptions || {}
        this.loadCustomProps(customTool)
        this.loadCustomToolbar(editor, toolOptions, name)

      })
    },
    loadCustomToolbar(editor, options, name) {
      const _this = this
      const props = {}
      for (const key in options) {
        if (Object.hasOwnProperty.call(options, key)) {
          const value = options[key]
          // 设置customToolbar
          props[key] = value
          if (isFunction(value)) {
            props[key] = function () {
              value.apply(_this, [_this, editor, ...arguments])
            }
          }
        }
      }
      editor.ui.registry.addButton(name, { ...props })
    },
    // ---------------------------------------------  以下是加载自定义的一些字段处理  -----------------------------------------------
    // comp 弹出框组件名
    loadCustomProps(tool) {
      // 加载
      this.loadCustomToolCompDialog(tool)
      this.loadCustomToolCompPopover(tool)
    },

    loadCustomToolCompDialog(tool) {
      const dialog = tool.compDialog
      if (!dialog) return
      this.$set(this.compDialogMap, dialog, null)
    },

    loadCustomToolCompPopover(tool) {
      const popover = tool.compPopover
      if (!popover || !tool?.compPopoverOptions) return
      let options = {}
      if (isFunction(tool?.compPopoverOptions)) {
        options = tool?.compPopoverOptions(this)
      } else if (isObject(tool?.compPopoverOptions)) {
        options = tool?.compPopoverOptions
      }
      this.$set(this.compPopoverMap, popover, options)
    }
  },
  beforeDestroy() {
    if (this.editor) {
      window.tinymce.remove(this.editor)
    }
  },
}
</script>

<style lang="scss" scoped>
.text-lenght {
  padding: 8px 16px;
  text-align: right;
}
</style>
