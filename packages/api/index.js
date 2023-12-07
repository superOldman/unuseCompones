import axios from "axios"
let baseURL = ''
let requestUse = () => { }
const CancelToken = axios.CancelToken

export const use = function (reqFunc, url) {
  if (!reqFunc) {
    return console.error('[di-smart-component error]: 没有配置request')
  }
  if (!url) {
    return console.error(`
      [di-smart-component error]: 没有配置baseURL, 根据环境使用:
          pre地址: https://preapiconsole.71360.com/api/app/cdp-tag
          prod地址: https://api.71360.com/api/app/cdp-tag
      `
    )
  }
  requestUse = reqFunc
  baseURL = url
}
export default { use }

const requestA = (data) => {
  return requestUse({ ...data, ...{ baseURL: `${baseURL}/cdp-tag` } })
}
const requestB = (data) => {
  return requestUse({ ...data, ...{ baseURL: `${baseURL}/cdp-analysis` } })
}


// 
export function getFieldValuesSelect(data) {
  return requestA({
    url: '/user/getFieldValues',
    method: 'post',
    data
  })
}

// 查询行为事件标签  /common/getEventLabelV3
export function getEventLabel(data) {
  return requestA({
    url: '/common/getEventLabelV3',
    method: 'post',
    data
  })
}

//  查询标签(用户属性，用户行为，用户分群，事件属性)
export function getLabel(data) {
  return requestA({
    url: '/common/getLabelV3',
    method: 'post',
    data
  })
}

// 根据事件行为选中的值掉接口返回事件属性（事件行为属性）
export function getEventActionProperty(data) {
  return requestA({
    url: '/common/queryEventActionPropertyV3',
    method: 'post',
    data
  })
}


// 查询分析事件行为指标
let getEventActionIndicatorAddCancel
export function getEventActionIndicatorAdd(data) {
  getEventActionIndicatorAddCancel && getEventActionIndicatorAddCancel()
  return requestA({
    url: '/common/queryEventActionProperty',
    method: 'post',
    data,
    cancelToken: new CancelToken(function executor(c) {
      getEventActionIndicatorAddCancel = c
    })
  })
}

let getEventActionIndicatorCancel
export const getEventActionIndicator = (params) => {
  getEventActionIndicatorCancel && getEventActionIndicatorCancel()
  return requestB({
    url: '/analysis/queryEventActionIndicatorV2',
    method: 'post',
    params,
    cancelToken: new CancelToken(function executor(c) {
      getEventActionIndicatorCancel = c
    })
  })
}