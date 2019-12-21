import { BasicLayout } from '@/layouts'
import FileList from '@/views/disk/FileList'
import config from '@/config/defaultSettings'
import FileDetail from '@/views/disk/preview/FilePreview'

/**
 * 基础路由
 * @type { *[] }
 */
const basicRoutes = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.index' },
    redirect: '/file',
    children: [
      {
        path: '/file',
        name: 'file-list',
        component: FileList,
        meta: {
          title: 'menu.allFile',
          icon: 'folder',
          permission: ['dashboard']
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
    name: 'notfound',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  },
  {
    path: '*', redirect: '/404', hidden: true
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
