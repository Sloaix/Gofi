import { BasicLayout, BlankLayout, UserLayout } from '@/layouts'
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
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/configuration/initial/SetupForm')
  },
  {
    path: '/test',
    component: BlankLayout,
    redirect: '/test/home',
    children: [
      {
        path: 'home',
        name: 'TestHome',
        component: () => import('@/views/Home')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '*', redirect: '/404', hidden: true
  }
]
