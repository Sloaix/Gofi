import { BasicLayout } from '@/layouts'
import AllFile from '@/views/disk/AllFile'

/**
 * 基础路由
 * @type { *[] }
 */
export default [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.index' },
    redirect: '/all-file',
    children: [
      {
        path: '/all-file',
        name: 'all-file',
        component: AllFile,
        meta: {
          title: 'menu.allFile',
          icon: 'folder',
          permission: ['dashboard']
        }
      },
      {
        path: '/setting',
        name: 'setting',
        component: () => import('@/views/settings/Index'),
        meta: { title: 'menu.setting', icon: 'setting' },
        redirect: '/settings/base',
        hideChildrenInMenu: true,
        children: [
          {
            path: '/settings/base',
            name: 'BaseSetting',
            component: () => import('@/views/settings/BaseSetting'),
            meta: { title: 'setting.baseSetting' }
          },
          {
            path: '/settings/custom',
            name: 'CustomSetting',
            component: () => import('@/views/settings/Custom'),
            meta: { title: 'setting.customSetting' }
          }
        ]
      }
    ]
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/configuration/initial/SetupForm')
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]
