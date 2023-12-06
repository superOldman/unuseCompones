import { version } from '../package.json'

import api from './api'
import DsDyDatePicker from "./dy-date-picker"
import DsRemoteJs from "./remote-js"
import DsMultiTypeSelect from "./multi-type-select"
import DsRuleUserProp from "./rule-user-prop"
import DsIconFont from "./icon-font"
import DsSwitch from "./switch"
import DsSwitchWarp from "./switch-warp"
import datePickerNew from "./multipleTypesDatePicker/picker/date-picker"


export const components = [
    DsDyDatePicker,
    DsRemoteJs,
    DsMultiTypeSelect,
    DsDyDatePicker,
    DsRuleUserProp,
    DsIconFont,
    DsSwitch,
    DsSwitchWarp,
    datePickerNew
]

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (Vue, opts = {}) {
    api.use(opts.request, opts.baseURL)
    // 判断是否安装
    if (install.installed) return
    install.installed = true
    // 遍历注册全局组件
    components.forEach(component => {
        Vue.component(component.name, component)
    })
}


// 判断是否是直接引入文件
// if (typeof window !== 'undefined' && window.Vue) {
//     install(window.Vue);
// }

export const componentsMap = components.reduce((p, v) => (p[v.name] = v, p), {})

function loadCodeSign(){
    const link = document.createElement('link');
    link.href = 'https://cdn3.codesign.qq.com/icons/myB3P048nX0n7lQ/latest/iconfont.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    // 加载 
    const script = document.createElement('script');
    script.src = 'https://cdn3.codesign.qq.com/icons/myB3P048nX0n7lQ/latest/iconfont.js';
    document.body.appendChild(script);
}
loadCodeSign()

export default {
    version,
    // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
    install,
    ...componentsMap
}