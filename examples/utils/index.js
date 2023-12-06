/* 返回自定义封装时间组件--快捷方式枚举回显值 */
export function getWitchTimeShortcutText(val) {
    switch (val) {
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
        case 'THIS_YEAR':
            return '本年'
        case 'LAST_YEAR':
            return '去年'
        case 'LAST_SEVEN_DAY':
            return '过去7天'
        case 'LAST_THIRTY_DAY':
            return '过去30天'
        case 'LAST_SIXTY_DAY':
            return '过去60天'
        case 'LAST_NINETY_DAY':
            return '过去90天'
        case 'LAST_180_DAY':
            return '过去180天'
        case 'ONLINE_TIME':
            return '上线至今'
        case 'SPECIFIC_TIME_PERIOD':
            return '具体时间段'
        case 'DYNAMIC_TIME_PERIOD':
            return '动态时间段'
        default:
            return ''
    }
}