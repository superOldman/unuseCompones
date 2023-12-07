<template>
  <div class="w-100">
    <DsRuleEventAnalysisGroup :propOptions="propOptions" v-model="data[idx]" v-for="(item, idx) in data" :key="item._uuid">
      <template slot="title">
        <div class="ds-rule-item-index">
          <span>{{indexCon(idx)}}</span>
        </div>
        <template v-if="item.nameSwitch">
          <div class="ds-rule-item-title">{{item.conditionName}}</div>
          <div class="ds-rule-item-action ml-16" @click="clickEditName(item)">
            <i class="ds-icon-edit" />
          </div>
        </template>
        <el-input v-else ref="input" class="ds-rule-item-title-input" v-model.trim="item.conditionName" :maxlength="10" :minlength="1" @blur.self="handleEditBlur(item)"
          @keyup.enter.native="handleEditEnter" />
      </template>
    </DsRuleEventAnalysisGroup>
  </div>
</template>

<script>

import { getLabel } from "packages/api"
import { omit } from "src/utils/object"
import { mockData } from './mock-Data'
// import Ds from "packages"
// import { toUUIDObject } from 'src/utils/object'
// const getDefaultItem = Ds.DsRuleEventAnalysisGroup.getDefaultItem




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
      data: mockData.eventConditionGroupDTO.eventConditionDTOs,
    }
  },
  computed: {
    indexCon() {
      return idx => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'][idx]
    },
  },
  created() {
    this.reqGetLabel()
  },
  created() {
  },
  methods: {
    clickEditName(item) {
      item.nameSwitch = !item.nameSwitch
      this.$nextTick(() => {
        this.$refs.input?.[0]?.focus()
      })
    },
    handleEditEnter(event) {
      event.target.blur()
    },
    handleEditNameSuccess(item) {
      item.nameSwitch = true
    },
    handleEditBlur(item) {
      if (!this.validateNameFunc) {
        return this.handleEditNameSuccess(item)
      }
      const promise = this.validateNameFunc(item.conditionName)
      if (promise.then) {
        promise.then(() => {
          this.handleEditNameSuccess(item)
        }).catch(err => {
          this.$message.warning(err.message)
        })
      }
    },
    validateNameFunc(name) {
      return new Promise((resolve, reject) => {
        if (!name) {
          return reject(new Error('事件名称长度在 1 到 10 个字'))
        }
        if (/[,，]/.test(name)) {
          return reject(new Error('事件名称不能包含,，'))
        }
        const data = this.data.filter(item => item.conditionName === name)
        if (data.length > 1) {
          return reject(new Error('事件名称不能与其他一致'))
        }
        resolve()
      })
    },
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
.ds-rule-item-index {
  display: inline-flex;

  width: 24px;
  width: 20px;
  height: 20px;
  background: #165dff;
  border-radius: 2px;
  color: #fff;
  font-size: 12px;
  justify-content: center;
  align-items: center;
}
.ds-rule-item-title-input {
  margin-left: 8px;
  width: 188px;
}
.ds-rule-item-title-input ::v-deep .el-input__inner {
  border-top-color: transparent !important;
  border-left-width: 0;
  border-right-width: 0;
  border-radius: 0;
  background-color: transparent !important;
}
</style>