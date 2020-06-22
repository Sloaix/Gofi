import { BasicLayout, UserLayout } from '@/layouts'
import FileList from '@/views/disk/FileList'
import config from '@/config/defaultSettings'
import FileDetail from '@/views/disk/preview/FilePreview'
import store from '@/store'

/**
 * 基础路由
 * @type { *[] }
 *
 * path一定在以/开头，不然SMenu渲染MenuItem的时候Key则不是以/开头，匹配路由的时候会导致失败
 */
const basicRoutes = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.title.index' },
    redirect: { name: 'file-list' },
    children: [
      {
        path: '/file',
        name: 'file-list',
        component: FileList,
        meta: {
          title: 'menu.title.allFile',
          icon: 'folder'
        }
      },
      {
        path: '/blob',
        name: 'file-detail',
        component: FileDetail,
        hidden: true
      },
      {
        path: '/setting',
        name: 'setting',
        component: () => import('@/views/settings/Index'),
        meta: {
          title: 'menu.title.setting',
          icon: 'setting'
        },
        redirect: () => {
          return store.getters.isAdmin ? { name: 'base-setting' } : { name: 'account-setting' }
        },
        hideChildrenInMenu: true,
        children: [
          {
            path: 'account',
            name: 'account-setting',
            component: () => import('@/views/settings/Account'),
            meta: { title: 'menu.title.setting.account', requireAuth: true }
          },
          {
            path: 'base',
            name: 'base-setting',
            component: () => import('@/views/settings/Base'),
            meta: { title: 'menu.title.setting.base', requireAuth: true }
          },
          {
            path: 'custom',
            name: 'custom-setting',
            component: () => import('@/views/settings/Custom'),
            meta: { title: 'menu.title.setting.custom', requireAuth: true }
          }
        ]
      }
    ]
  },
  {
    path: '/auth',
    name: 'auth',
    component: UserLayout,
    redirect: { name: 'login' },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/auth/Login')
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
    name: 'notfound',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '*', redirect: { name: 'notfound' }, hidden: true
  }
]

// Preview模式下渲染到导航菜单栏的外部链接
const previewRoutes = [
  {
    path: 'https://github.com/Sloaix/Gofi',
    name: 'gofi',
    meta: { title: 'preview.nav.github', icon: 'github', target: '_blank', dot: true }
  },
  {
    path: 'https://Gofi-doc.sloaix.com',
    name: 'doc',
    meta: { title: 'preview.nav.userGuide', icon: 'book', target: '_blank', dot: true }
  }
]

if (config.preview) {
  const menuRoutes = basicRoutes.find(item => item.path === '/')
  menuRoutes.children = menuRoutes.children.concat(previewRoutes)
}

export default basicRoutes
