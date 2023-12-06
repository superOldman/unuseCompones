<template>
  <div>
    <!-- 
      1.该组件支持el-select组件所有的自定义事件方法，visibleChange事件在mySelect文件夹下的index.vue组件有自己的逻辑需要注意
      2.该组件支持el-select组件的所有功能传值，在此基础上新增checkShow(是否显示弹出框的搜索输入框)、checkShow(是否显示事件类型筛选checkbox)、inputSize(弹出框的搜索输入框尺寸)
      3.options为下拉弹出框选项的list数组，数据结构参考下方data
      4.v-model用法和element一样
      5.新增ruleInfos插槽，可以自定义弹出框右侧结构
      checkList为筛选事件类型list
      6.valueKey作用：如果传递 valueKey (传递的内容是唯一标识符字段名)change事件的回调参数是当前选中项的全部数据，如果不传的话change事件的回调就是唯一标识符信息,注意：如果是事件行为有事件筛选功能的话valueKey为必传项,
      7.第6条已废弃valueKey写死了，因为后端接口数据有重复code所以现在v-model收集的统一是对象
    -->

    <el-button @click="dianwo">点我</el-button>
    <el-button @click="groupNum+=10">增加10个</el-button>

    <DsMultiTypeSelect v-for="item in groupNum" multiple   :key="item" ref="examples" v-model="selectValue" :options="options" :checkList="checkList" valueKey="uniqueValue" ptypeJudge statusJudge checkShow
      searchShow clearable size="large" placeholder="请选择" @change="selectChange">
      <!-- <template #ruleInfos="{ labelInfos }">
        {{labelInfos}} -->
      <!-- 可自定义右侧信息 -->
      <!-- </template> -->
    </DsMultiTypeSelect>

  </div>
</template>

<script>
import DsMultiTypeSelect from 'packages/multi-type-select/src/multiTypeSelect.vue'
import data from './data.json'
import data2 from './data2.json'
export default {
  name: 'Examples-DsMultiTypeSelect',
  components: {
    DsMultiTypeSelect
  },
  data() {
    return {
      groupNum: 1,
      checkList: [
        // {
        //   eventType: 1,
        //   eventTypeName: '一般事件'
        // },
        // {
        //   eventType: 2,
        //   eventTypeName: '虚拟事件'
        // },
        // {
        //   eventType: 3,
        //   eventTypeName: '圈选事件'
        // },
        // {
        //   eventType: 4,
        //   eventTypeName: '圈选事件'
        // }
      ],
      options: [
        {
          label: '热门城市',
          id: 1,
          options: [
            {
              nameEn: 'Beijing',
              uniqueValue: 'Beijing-1',
              name: '北京',
              eventType: 1,
              labelInfo: {
                tag: ['预置事件属性', '分析全部值'],
                eventName: '事件发生时间1',
                propertyInfo: {
                  属性名称: '$event_time',
                  属性描述: '-',
                  数据类型: 'dateTime',
                  最近修改: '2022-10-12'
                }
              }
            }

          ]
        },
        {
          label: '热门城市2',
          id: 2,
          options: [
            {
              nameEn: 'Beijing',
              uniqueValue: 'Beijing-2',
              name: '北京',
              eventType: 1,
              labelInfo: {
                tag: ['预置事件属性', '分析全部值'],
                eventName: '事件发生时间1',
                propertyInfo: {
                  属性名称: '$event_time',
                  属性描述: '-',
                  数据类型: 'dateTime',
                  最近修改: '2022-10-12'
                }
              }
            }
          ]
        }
      ],
      // selectValue: {
      //   nameEn: 'Beijing',
      //   uniqueValue: 'Beijing-1'
      // },
      selectValue: [
        {
        "id": null,
        "uniqueValue": "$MPViewScreen",
        "parentId": null,
        "nameEn": "$MPViewScreen",
        "name": "小程序页面浏览",
        "fieldType": null,
        "type": null,
        "status": 1,
        "sort": null,
        "ckColumn": null,
        "eventType": 1,
        "labelInfo": {
          "id": 3405,
          "eventNameEn": "$MPViewScreen",
          "eventNameCn": "小程序页面浏览",
          "tag": [
            "预置一般事件"
          ],
          "eventName": "小程序页面浏览",
          "owningPage": null,
          "elementXPath": null,
          "elementSelector": null,
          "elementContent": null,
          "experimentId": null,
          "propertyInfo": {
            "最近修改": "2023-12-06 00:02:02",
            "属性描述": null,
            "属性名称": "$MPViewScreen"
          }
        },
        "eventFilterDTOs": null,
        "ptype": 3
      }
      ]
    }
  },
  mounted() {
    this.initData()
  },
  methods: {
    initData() {
      this.checkList = data.data.checkList
      this.options = data.data.options

    },
    selectChange(val) {
      console.log(val, this.selectValue)
    },
    dianwo() {
      let data = this.$refs.examples[0].getCheckedNodes(this.selectValue.uniqueValue)
      console.log(data)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
