const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'
function resolve(dir) {
    return path.join(__dirname, dir)
}
module.exports = {
    productionSourceMap: !isProduction,
    // 修改 src 目录 为 examples 目录
    pages: {
        index: {
            entry: 'examples/main.js',
            template: 'public/index.html',
            filename: 'index.html'
        }
    },
    // 强制内联CSS（使用组件时，不需要再引入css）
    css: {
        extract: false
    },
    configureWebpack: {
        resolve: {
            // 别名
            alias: {
                '@': resolve('examples'),
                'src': resolve('src'),
                'packages': resolve('packages')
            }
        },
        externals: {
            vue: 'Vue',
            modesign: 'MODESIGN', // 注意大写
            vuex: 'Vuex',
            'vue-router': 'VueRouter',
        }
    },
    chainWebpack: config => {
        // config.resolve.alias['@'] = resolve('examples')
        // config.resolve.alias['src'] = resolve('src')
        // config.resolve.alias['components'] = resolve('examples/components')
        // config.resolve.alias['packages'] = resolve('packages')
        // console.log(config.resolve.alias);
        // 生产环境配置
        if (isProduction) {
            config.mode = 'production'
            // 打包文件大小配置
            config.performance = {
                maxEntrypointSize: 10000000,
                maxAssetSize: 30000000
            }
        }
    },
    devServer: {
        port: 7000, // 设置端口号
        // open: true, // 启动项目自动打开浏览器
        proxy: { // 解决跨域问题
            '/api': {
                target: 'http://localhost:2222/', // 本地json数据
                changeOrigin: true,
                ws: false,
                pathRewrite: {
                    '/api': '/mock' // 本地
                }
            }
        }
    },
}