import DsRemoteJs from './src'

DsRemoteJs.install = function (Vue) {
  Vue.component(DsRemoteJs.name, DsRemoteJs)
}
export default DsRemoteJs