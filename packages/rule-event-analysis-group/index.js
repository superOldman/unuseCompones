import DsRuleEventAnalysisGroup, { getDefaultItem } from './src'

DsRuleEventAnalysisGroup.install = function (Vue) {
  Vue.component(DsRuleEventAnalysisGroup.name, DsRuleEventAnalysisGroup)
}
DsRuleEventAnalysisGroup.getDefaultItem = getDefaultItem
export default DsRuleEventAnalysisGroup
