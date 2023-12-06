import axios from 'axios'
import { Message } from 'modesign'
let xToken, xProjectId;
try {
    xToken = require("../../env-dev.local.js").xToken
    xProjectId = require("../../env-dev.local.js").xProjectId
} catch (error) {
    
}

const baseURL = process.env.VUE_APP_BASE_API
const service = axios.create({
    baseURL,
    timeout: 100000 * 50, // 请求超时时间
    withCredentials: true
})

// request拦截,在请求发起前
service.interceptors.request.use((config) => {
    // 权限管理获取数据集成项目资源列表需要的请求头字段
    config.headers['X-Token'] = xToken
    config.headers.projectId = xProjectId
    return config
})

// response拦截,获取请求数据后，搞事情
service.interceptors.response.use(
    // 正常获取数据
    (response) => {
        const resData = response?.data
        if (resData && (resData.code == 0 || resData.code === 200)) {
            return response.data
        } else if (resData.code == 401) {
            // 用户信息已过期 或者用户已离职1
            const message = resData.message || resData.msg || response.msg
            Message({ type: 'error', message })
        } else if (response.data.code === 510) {
            // 510位表单验证不通过时 去报errorList里的内容
            Message.error(response.data?.errorList?.[0]?.errorInfo)
        } else if (response.data.code === 511) {
            const message = resData.message || resData.msg || response.msg
            Message({ type: 'error', message })
            return Promise.reject(response)
        } else {
            return response.data
        }
        return Promise.reject(response)
    },
    // 请求失败
    (error) => {
        // 积分商城状态值不是200代表请求失败返回数据有code需要给用户提示
        if (error?.response && error.response.data.code && error.response.data.code != 4024) {
            Message({ type: 'error', message: error.response.data.message || error.response.data.msg })
        }
        return Promise.reject(error)
    }
)

export default service
