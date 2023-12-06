// enhanceApp.js
import VueHighlightJS from 'vue-highlight.js'
import modesign from 'modesign'
import DiSmartComponent from 'packages'
import { message } from './public/utils/resetMessage' // 防止重复点击重复弹出message弹框
import vueClipboard from 'vue-clipboard2'
import './public/utils/directives' // 自定义指令
import '../.vuepress/public/css/index.scss'
import moment from 'moment'
moment.suppressDeprecationWarnings = true // 去掉警告



export default ({
  Vue: Vue,
}) => {
  Vue.use(VueHighlightJS),
    Vue.use(modesign),
    Vue.use(DiSmartComponent),
    Vue.use(vueClipboard),
    Vue.prototype.$messageUpload = message,
    Vue.prototype.$message = modesign.Message,
    Vue.prototype.$loading = modesign.Loading.service,
    Vue.prototype.$msgbox = modesign.MessageBox,
    Vue.prototype.$alert = modesign.MessageBox.alert,
    Vue.prototype.$confirm = modesign.MessageBox.confirm,
    Vue.prototype.$prompt = modesign.MessageBox.prompt
  // 过滤器
  // Object.keys(filters).forEach(key => {
  //   Vue.filter(key, filters[key])
  // })
}
