<template>
    <div class="main">
        <div class="header">
            <el-button size="mini" @click="changeDate(1)">绝对时间</el-button>
            <el-button size="mini" @click="changeDate(2)">上个月</el-button>
            <el-button size="mini" @click="changeDate(3)">动态时间一</el-button>
            <el-button size="mini" @click="changeDate(4)">动态时间二</el-button>
            <el-button size="mini" @click="changeDate(5)">动态时间三</el-button>

        </div>
        <datePickerNew v-model="currentItem.timeParams" type="daterange" value-format="yyyy-MM-dd" unlink-panels
            :picker-options="pickerOptionsCustom" :timeFunction="currentItem.timeFunction"
            :witchTimeShortcut="currentItem.witchTimeShortcut" @getData="handleChangeTime">
        </datePickerNew>
        <h1>
            <pre>{{ currentItem }}</pre>
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
                "timeParams": ["2023-11-14", "2023-11-19"],
                // "witchTimeShortcut": ["LAST_SEVEN_DAY"],
                // "witchTimeShortcut": [5, 2],
                "witchTimeShortcut": ["2023-11-01", 3],
            },
            pickerOptionsCustom: {
                disabledDate: (time) => {
                    return time.getTime() > Date.now() // 开始时间不选时，结束时间最大值小于等于当天
                }
            },
        }
    },
    mounted() {
        this.changeDate(3)
    },
    methods: {
        changeDate(type) {
            switch (type) {
                case 1:
                    this.currentItem = {
                        "timeFunction": "absolute_time",
                        "witchTimeShortcut": [], "timeParams": ["2023-11-01", "2023-11-04"]
                    };
                    break;
                case 2:
                    this.currentItem = {
                        "timeFunction": "relative_time",
                        "witchTimeShortcut": ["LAST_MOTH"],
                        "timeParams": ["2023-11-01", "2023-11-30"]
                    }
                    break;
                case 3:
                    this.currentItem = {
                        "timeFunction": "relative_time",
                        "witchTimeShortcut": ["2023-11-08", 11],
                        "timeParams": ['2023-11-08', '2023-11-20']
                    }
                    break;
                case 4:
                    this.currentItem = {
                        "timeFunction": "relative_time",
                        "witchTimeShortcut": ["2023-11-25", "1"],
                        "timeParams": ['2023-11-25', '2023-11-30']
                    }
                    break;
                case 5:
                    this.currentItem = {
                        "timeFunction": "relative_time",
                        "witchTimeShortcut": [10, 4],
                        "timeParams": ['2023-11-21', '2023-11-27']
                    }
                    break;
                default:
                    break;
            }

        },
        handleChangeTime(data) {
            this.currentItem.timeFunction = data.timeFunction
            this.currentItem.witchTimeShortcut = data.witchTimeShortcut
            console.log('bin:change', { ...data })
        },
    }
}
</script>
<style scoped lang="scss">
.main {
    width: 100%;
    display: flex;
    gap: 16px;
    align-items: center;
    flex-direction: column;

    .header {
        display: flex;
        align-items: center;
        gap: 16px;
    }
}
</style>