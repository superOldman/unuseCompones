const path = require('path')
const isProduction = process.env.NODE_ENV === 'production'
function resolve(dir) {
    return path.join(__dirname, dir)
}
const externals_prod = {
    vue: {
        commonjs: 'vue',
        commonjs2: 'vue',
        amd: 'vue',
        root: 'Vue',
    },
    modesign: {
        commonjs: 'modesign',
        commonjs2: 'modesign',
        amd: 'modesign',
        root: 'MODESIGN'
    },
    vuex: {
        commonjs: 'vuex',
        commonjs2: 'vuex',
        amd: 'vuex',
        root: 'Vuex'
    },
    'vue-router': {
        commonjs: 'vue-router',
        commonjs2: 'vue-router',
        amd: 'vue-router',
        root: 'VueRouter'
    }
}
const externals_dev = {
    vue: "Vue",
    modesign: "MODESIGN",
    vuex: "Vuex",
    'vue-router': "VueRouter"
}
const externals = isProduction ? externals_prod : externals_dev

module.exports = {
    productionSourceMap: !isProduction,
    parallel: false,
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
            extensions: ['.js', 'css', 'scss', '.vue'],
            // 别名
            alias: {
                '@': resolve('examples'),
                'src': resolve('src'),
                'packages': resolve('packages')
            }
        },
        externals
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
            config.performance.maxEntrypointSize = 10000000
            config.performance.maxAssetSize = 30000000
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