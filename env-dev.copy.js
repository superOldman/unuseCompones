export const xToken = "FNr2GMvyXsHr066xNqUUWLQr0T3f9IaQ"
export const xProjectId = 2759

// 类似url: `/admin/sys/role/getRoleDetail/${id}`,  这种后面拼接id 的一定要使用模板字符串
// -- dev接口生成调试区 --
const devApiFileMap = {
    "/src/api/index.js": {}
}
// -- 结束
export const devApiMap = Object.keys(devApiFileMap).reduce((p, n) => {
    p = { ...p, ...devApiFileMap[n] }
    return p
}, {})

export const devMatchApiMap = Object.keys(devApiFileMap).reduce((p, n) => {
    Object.keys(devApiFileMap[n]).forEach((v) => {
        if (v.includes('/${')) {
            p[v.replace(/\$\{[_a-zA-Z0-9]+?\}/g, '*')] = devApiFileMap[n][v]
        }
    })
    return p
}, {})
