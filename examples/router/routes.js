import MultiTypeSelect from '@/views/ex-MultiTypeSelect'
import RemoteJs from '@/views/ex-RemoteJs'
import DsMultiEditor from '@/views/ex-MultiEditor'
import DyCompose from '@/views/ex-DyCompose'
import layout from '@/layout/layout.vue'
const routes = [
  {
    path: '/',
    name: '',
    meta: {
      title: '组件测试'
    },
    redirect: '/index',
    component: layout,
    children: [
      {
        path: '/index',
        name: 'index',
        meta: {
          title: '属性选择器'
        },
        component: MultiTypeSelect,
      },
      {
        path: '/compose',
        name: 'compose',
        meta: {
          title: '组合表单'
        },
        component: DyCompose,
      },
      {
        path: '/remote-js',
        name: 'remote-js',
        meta: {
          title: '按需加载JS'
        },
        component: RemoteJs,
      },
      {
        path: '/DSMultiEditor',
        name: 'ExDsMultiEditor',
        meta: {
          title: '富文本'
        },
        component: DsMultiEditor,
      },
      {
        path: 'testDsDyDatePicker',
        name: 'testDsDyDatePicker',
        meta: {
          title: '动态时间组件'
        },
        component: () => import('@/views/ex-DyDatePicker/index')
      },
     
    ]
  },
  // {
  //   path: '/about',
  //   name: 'About',
  //   meta: {
  //     title: '业务组件2'
  //   },
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

export default routes
