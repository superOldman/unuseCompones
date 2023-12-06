export function getOpsOptions(val) {
    switch (val) {
        case 'STRING':
        case 'LIST':
        case 'VERSION':
            return [
                { label: '等于', value: 'EQUAL' },
                { label: '不等于', value: 'NOT_EQUAL' },
                { label: '包含', value: 'CONTAIN' },
                { label: '不包含', value: 'NOT_CONTAIN' },
                { label: '有值', value: 'IS_SET' },
                { label: '没值', value: 'NOT_SET' }
            ]
        case 'NUM':
            return [
                { label: '等于', value: 'EQUAL' },
                { label: '不等于', value: 'NOT_EQUAL' },
                { label: '小于等于', value: 'MOST' },
                { label: '大于等于', value: 'LEAST' },
                { label: '小于', value: 'LESS' },
                { label: '大于', value: 'GREATER' },
                { label: '区间', value: 'BETWEEN' },
                { label: '有值', value: 'IS_SET' },
                { label: '没值', value: 'NOT_SET' }
            ]
        case 'DATETIME':
            return [
                { label: '最近几天', value: 'RELATIVE_WITHIN' },
                { label: '区间', value: 'ABSOLUTE_BETWEEN' }
            ]
        case 'BOOLEAN':
            return [
                { label: '为真', value: 'IS_TRUE' },
                { label: '为假', value: 'IS_FALSE' }
            ]
        default:
            return []
    }
}