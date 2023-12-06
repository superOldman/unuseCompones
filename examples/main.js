import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/styles/index.scss'
import DSComponent from 'packages' // 二次封装组件
import "packages/theme-chalk/src/index.scss"
import request from "@/service/index"
const baseURL = "https://preapiconsole.71360.com/api/app/cdp-tag"

Vue.config.productionTip = false
Vue.use(DSComponent, { request, baseURL })

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
