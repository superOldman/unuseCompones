<template>
  <el-dialog :visible="visible" append-to-body title="选择用户属性" width="520px" @update:visible="changeShow" @closed="closedDialog">
    <el-form ref="form" label-position="top" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="用户属性" prop="attribute">
        <el-select v-model="form.attribute" filterable :loading="optionLoading" class="w-100" placeholder="请选择用户属性">
          <el-option v-for="(item) in options" :key="item.id" :label="item.label" :value="item.value"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="" prop="defaultValue">
        <template slot="label">
          <div><span>默认值</span><span class="ml-8 tip">(建议填写默认值，用于属性被删除或空值时占位)</span></div>
        </template>
        <el-input v-model="form.defaultValue"></el-input>
      </el-form-item>
    </el-form>
    <template slot="footer">
      <el-button type="primary" @click="submitForm">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import popupMixin from 'packages/multi-editor/src/mixins/popup-mixin'
import { getElement } from 'packages/multi-editor/src/components/userPropDialog/config'
import { TaEditorConst } from "packages/multi-editor/src/utils/const"
import emitter from "packages/multi-editor/src/mixins/emitter"
import { getLabel } from "packages/multi-editor/src/api"

export default {
  name: 'UserPropDialog',
  mixins: [popupMixin, emitter],
  props: {
    data: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      // popupHideNull: false,
      options: [],
      optionLoading: false,
      form: {
        type: 'FIELD',
        attribute: '',
        defaultValue: ''
      },
      rules: {
        attribute: [
          { required: true, message: '请输入用户属性', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.reqGetLabel()
    if (this.data) {
      // console.log('this.data', this.data)
      const [type, prop, value] = this.data.value.split(':')
      this.form.attribute = prop
      this.form.defaultValue = value
    }
  },
  methods: {
    reqGetLabel() {
      this.optionLoading = true
      getLabel().then(({ code, data }) => {
        const options = data?.options?.[0]?.options || []
        this.options = options.map(({ uniqueValue, name, nameEn }) => {
          return { label: name, value: nameEn, id: uniqueValue }
        })
      }).catch((err) => { console.log('err: ', err) }).finally(() => {
        this.optionLoading = false
      })
    },
    submitForm() {
      this.$refs.form.validate(valid => {
        if (!valid) return console.log('表单验证失败')
        const { attribute: prop, defaultValue: value, type } = this.form
        const item = {
          type,
          prop,
          value,
          label: this.options.find(v => v.value == prop)?.label
        }
        // console.log('this.options', this.options)
        console.log(this.options.find(v => v.value == prop))
        // console.log('item', item)
        if (this.data?.target) {
          this.updateEditorNode(item, this.data?.target)
        } else {
          this.insertEditorNode(item)
        }

      })
    },
    async updateEditorNode(item, img) {
      console.log('999', 999, item, img)
      // img.setAttribute('data-emoticon', true)
      // img.setAttribute('data-mce-resize', "false")
      // img.setAttribute('data-mce-placeholder', true)
      // img.setAttribute('draggable', false)
      // img.setAttribute('data-ta-use', 'userPropDialog')
      // img.setAttribute('data-ta-type', "text")
      // img.setAttribute('data-ta-prop', item.prop)
      // img.setAttribute('data-ta-value', item.value)
      // img.setAttribute('title', `${item.prop}: ${item.value}`)
      // img.style.display = 'none'
      // generateImageFromDOM(`<span style="display: inline-block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.prop}</span>`).then(({ image, width, height }) => {
      //   img.style = `vertical-align:bottom;outline:none;width:${width}px;height:${height}px;cursor:pointer;margin:0 1px;`
      //   img.src = image
      // }).catch(() => {
      // })
      getElement(item, img)
      this.changeShow(false)
    },
    async insertEditorNode(item) {
      this.dispatch(TaEditorConst.EDITOR, 'editorInsertNode', {
        nodeFunc: context => {
          return getElement(item)
        }
      })
      this.changeShow(false)
    }
  }
}
</script>

<style lang="scss" scoped>
.tip {
  font-size: 12px;
  color: #999;
}
</style>
