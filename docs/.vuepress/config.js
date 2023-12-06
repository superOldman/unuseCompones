const path = require('path')
module.exports = {
  title: 'Tui基础组件文档库',
  description: '基于Element-ui二次封装基础组件示例',
  base: '/t-ui/',
  // port: 6666,
  // dest: './dist',   // 设置输出目录
  head: [
    ['link', { rel: 'shortcut icon', type: 'image/x-icon', href: `./favicon.ico` }],
    ['script', { type: 'text/javascript', src: `https://scrm-static.marketingforce.com/modesign/vue/2.6.14-temp/vue.js` }],
    ['link', { rel: 'stylesheet', type: 'text/css', href: `https://scrm-static.marketingforce.com/modesign/1.0.5.6/theme-chalk/index.css` }],
    ['script', { type: 'text/javascript', src: `https://scrm-static.marketingforce.com/modesign/1.0.5.6/index.js` }],
  ],
  markdown: {
    lineNumbers: true // 代码块显示行号
  },
  themeConfig: {
    // 你的GitHub仓库，请正确填写
    // repo: 'https://github.com/wocwin/t-ui',
    // 自定义仓库链接文字。
    // repoLabel: 'GitHub',
    nav: [
      { text: '主页', link: '/' },
      { text: '实际项目问题', link: '/projectProblem/permission' },
      { text: '基础组件', link: '/baseComponents/' },
      // { text: "Gitee码云", link: "https://gitee.com/wocwin/t-ui" }
    ],
    sidebar: {
      '/projectProblem/': [
        {
          title: 'Vue项目',
          collapsable: false,
          children: [
            'permission',
            'keepAlive',
            'axios'
          ]
        }
      ],
      '/baseComponents/': [
        // {
        //   title: '基于element封装',
        //   collapsable: true,
        //   children: [
        {
          title: '常用组件',
          collapsable: false,
          children: [
            'TButton/base', // button组件
            'DsRemoteJs/base', // button组件
            'DsMultiEditor/base', // 富文本组件
          ]
        },
        {
          title: '敬请期待',
          collapsable: false,
          children: [

          ]
        }
      ],
    }
  },
  chainWebpack(config) {
    config.resolve.alias.set('core-js/library/fn', 'core-js/features');
  },
  configureWebpack: {
    resolve: {
      alias: {
        packages: path.resolve(__dirname, '../../packages'),
        // examples: path.resolve(__dirname, './examples'),
        src: path.resolve(__dirname, '../../src')
      }
    },
    externals: {
      vue: 'Vue',
      modesign: 'MODESIGN', // 注意大写
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            'cache-loader',
            {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                configFile: false,
                presets: [
                  '@babel/preset-env', // 可以识别es6语法
                  '@vue/babel-preset-jsx' // 解析jsx语法
                ]
              }
            },
            {
              loader: 'ts-loader',
              options: {
                appendTsxSuffixTo: [/\.vue$/, /\.md$/]
              }
            }
          ]
        }
      ]
    }
  },
  plugins: [
    [
      'vuepress-plugin-typescript',
      {
        tsLoaderOptions: {
          // ts-loader 的所有配置项
        },
      },
    ],
    // ['@vuepress/plugins-back-to-top', false],
    ['vuepress-plugin-gotop-plus', {
      // mobileShow: false,
      threshold: 150
    }],
    '@vuepress-reco/extract-code'
  ]
}
