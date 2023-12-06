<template>
    <div>
        <!-- <DsDyDatePicker v-model="currentItem.timeParams" type="daterange" value-format="yyyy-MM-dd" unlink-panels
            :picker-options="pickerOptionsCustom" :timeFunction="currentItem.timeFunction"
            :witchTimeShortcut="currentItem.witchTimeShortcut" @getWitchTimeShortcutText="getTimeShortcutText">
            <span slot="default" slot-scope="{data}" class="customArea slotArea fx-s-center">
                <svg aria-hidden="true" class="labelDatePicker">
                    <use xlink:href="#icon-riqi"></use>
                </svg>
                <template v-if="witchTimeShortcutText">
                    <span class="date mgr5 mgl5">{{ witchTimeShortcutText }}</span>
                    <span class="date line">|</span>
                </template>
                <span class="mgl5 date">{{ data[0] }}</span>
                <span class="label">至</span>
                <span class="date mgr5">{{ data[1] }}</span>
            </span>
        </DsDyDatePicker> -->
        <hr style="margin-block: 16px;">
        <h1>
            <pre>{{ currentItem }}</pre>
        </h1>
        <datePickerNew v-if="true" v-model="currentItem.timeParams" type="daterange" value-format="yyyy-MM-dd" unlink-panels
            :picker-options="pickerOptionsCustom" :timeFunction="currentItem.timeFunction"
            :witchTimeShortcut="currentItem.witchTimeShortcut" @getWitchTimeShortcutText="getTimeShortcutText">
            <!-- 自定义日期输入框内容 -->
            <span slot="default" slot-scope="{data}" class="customArea slotArea fx-s-center">
                <i class="el-icon-date labelDatePicker"></i>
                <template v-if="witchTimeShortcutText">
                    <span class="date mgr5 mgl5">{{ witchTimeShortcutText }}</span>
                    <span class="date line">|</span>
                </template>
                <span class="mgl5 date">{{ data[0] }}</span>
                <span class="label">至</span>
                <span class="date mgr5">{{ data[1] }}</span>
            </span>
        </datePickerNew>
        <hr style="margin-block: 16px;">
        <datePickerNew v-model="testCurrentItem.timeParams" type="daterange" value-format="yyyy-MM-dd" unlink-panels
            :picker-options="pickerOptionsCustom" :timeFunction="testCurrentItem.timeFunction"
            :witchTimeShortcut="testCurrentItem.witchTimeShortcut" @change="handleChangeTime">
        </datePickerNew>
        <h1>
            <pre>{{ testCurrentItem }}</pre>
        </h1>
    </div>
</template>

<script>
export default {
    name: "TestDyDatePicker",
    data() {
        return {
            currentItem: {
                "timeFunction": "relative_time",
                "timeParams": ["2023-11-13 00:00:00", "2023-11-19 23:59:59"
                ],
                "witchTimeShortcut": ["LAST_SEVEN_DAY"],
            },
            testCurrentItem: {
                "timeFunction": "relative_time",
                "timeParams": ["2023-11-14", "2023-11-19"],
                // "witchTimeShortcut": ["LAST_SEVEN_DAY"],
                // "witchTimeShortcut": [5, 2],
                // "witchTimeShortcut": ["2023-11-01", 3],
            },
            witchTimeShortcutText: '',
            pickerOptionsCustom: {
                disabledDate: (time) => {
                    // return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
                }
            },
        }
    },
    mounted() {
        this.reShow(this.currentItem)
    },
    methods: {
        handleChangeTime(data) {
            console.log('bin:change', data)
        },
        reShow(data) {
            if (data.timeFunction === 'absolute_time') {
                this.witchTimeShortcutText = ''
                return
            }
            if (data.witchTimeShortcut.length === 1) {
                let [type] = data.witchTimeShortcut
                this.witchTimeShortcutText = this.getWitchTimeShortcutText(type)
                return
            }
            let witchTimeShortcut = data.witchTimeShortcut
            this.witchTimeShortcutText = this.dealDynamicText(witchTimeShortcut)
        },
        getWitchTimeShortcutText() {
            let witchTimeShortcut =
                this.currentItem.witchTimeShortcut || this.witchTimeShortcut || []
            witchTimeShortcut =
                witchTimeShortcut.length > 0 ? witchTimeShortcut[0] : ''
            switch (witchTimeShortcut) {
                case 'TODAY':
                    return '今日'
                case 'YESTERDAY':
                    return '昨日'
                case 'THIS_WEEK':
                    return '本周'
                case 'LAST_WEEK':
                    return '上周'
                case 'THIS_MONTH':
                    return '本月'
                case 'LAST_MOTH':
                    return '上月'
                case 'LAST_SEVEN_DAY':
                    return '过去7天'
                case 'LAST_THIRTY_DAY':
                    return '过去30天'
                default:
                    return ''
            }
        },
        getTimeShortcutText(val) {
            let { selectValue = '', text = '' } = val
            if (selectValue === 'CONCRETE') {
                this.currentItem.timeFunction = 'absolute_time'
            } else {
                this.currentItem.timeFunction = 'relative_time'
            }
            this.dealTimeShortcutText(selectValue, text)
        },
        dealTimeShortcutText(selectValue, text) {
            if (selectValue === 'CONCRETE') {
                this.currentItem.witchTimeShortcut = []
                this.witchTimeShortcutText = ''
                return
            }
            if (selectValue === 'DYNAMIC') {
                /**
                 * witchTimeShortcut: ['2022-02-02', 2] | [2, '2022-02-02']
                 * witchTimeShortcutText：2022-02-02至过去2天
                */
                this.currentItem.witchTimeShortcut = text
                this.witchTimeShortcutText = this.dealDynamicText(text)
                return
            }
            // OTHER情况
            /**
             * witchTimeShortcut: ['YESTERDAY']
             * witchTimeShortcutText：昨天
            */
            this.currentItem.witchTimeShortcut = [selectValue]
            this.witchTimeShortcutText = text
        },
        dealDynamicText(val = []) {
            let [start, end] = val
            let exp = /^[12]{1}\d{3}[/-]{1}\d{2}[/-]{1}\d{2}$/
            let startText = exp.test(start) ? start : `过去${start}天`
            let endTexts = {
                0: '今日',
                1: '昨天'
            }
            let endText = Number(end) > 1 ? `过去${end}天` : endTexts[end]
            return `${startText} 至 ${endText}`
        },
    }
}
</script>
<style scoped lang="scss">
.customArea {
    border-radius: 4px;
    border: 1px solid #dcdfe6;
    min-width: 235px !important;
    padding-left: 10px;
    display: flex;
    align-items: center;

    .labelDatePicker {
        color: #c0c4cc;
        font-size: 14px;
        width: 14px;
        height: 14px;
    }

    .dateText {
        color: #606266;
        font-size: 14px;
        padding-left: 8px;
    }

    .dateCustom {
        width: 210px !important;
        border: none;
        padding: 0;
        height: 26px;
        line-height: 26px;

        ::v-deep .el-range__icon {
            position: inherit !important;
            display: none;
        }

        ::v-deep .el-range-separator {
            line-height: 26px;
            width: 10%;
        }
    }
}
</style>