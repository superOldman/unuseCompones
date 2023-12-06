const requireComponent = require.context(
    // 组件的相对路径
    './',
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式， 这里匹配文件名为xxx.vue格式
    /^\.\/[^/]*?\/index.vue$/
)
const components = requireComponent.keys().map((fileName) => {
    // 获取组件配置
    const componentConfig = requireComponent(fileName)
    // 剥去文件名开头的 `./` 和结尾的扩展名 eg: ./food-header.vue -> foodHeader
    const componentName = fileName
        .replace(/^\.\//, '')
        .replace(/\/index.vue$/, '')
        // console.log(componentConfig.default || componentConfig)
    return [componentName, componentConfig.default || componentConfig]
}).reduce((prev, next) => (prev[next[0]] = next[1], prev), {})

export default components

const requireConfig = require.context(
    // 组件的相对路径
    './',
    // 是否查询其子目录
    true,
    // 匹配基础组件文件名的正则表达式， 这里匹配文件名为xxx.vue格式
    /^\.\/[^/]*?\/config.js$/
)
export const OtherTools = requireConfig.keys().map((fileName) => {
    let configOptions = requireConfig(fileName)
    const configName = fileName
        .replace(/^\.\//, '')
        .replace(/\/config.js$/, '')
    configOptions = configOptions.default || configOptions
    if (/Popover$/.test(configName)) {
        configOptions.compPopover = configName
    } else if (/Dialog$/.test(configName)){
        configOptions.compDialog = configName
    }
    const name = configName.replace(/(Popover|Dialog)/, '')
    configOptions.name = `ta-${name}`
    return [name, configOptions]
}).reduce((prev, next) => (prev[next[0]] = next[1], prev), {})





