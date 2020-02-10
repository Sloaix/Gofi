import router from './router'
import store from './store'

import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import { message } from 'ant-design-vue'
import i18n from '@/locales'

NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar

  const initialized = store.getters.initialized // 已经安装设置完成
  const navigatingToSetup = to.name === 'setup' // 正在导航到setup页面
  const hasRequireAuth = to.matched.some(record => record.meta.requireAuth) // to的meta里面是否有requireAuth元信息
  const isLogin = store.getters.isLogin // 是否已登录
  const redirectToSetup = () => next({ replace: true, name: 'setup' }) // 重定向到Setup页面
  const redirectToLogin = () => next({ replace: true, name: 'login' }) // 重定向到登录页
  const showNotAuthMessage = () => message.warn(i18n.t('auth.requireAuth.content'))

  if (initialized || navigatingToSetup) {
    // 需要登录
    if (hasRequireAuth) {
      // 已经登录
      if (isLogin) {
        next()
      } else { // 没有登录,重定向到登录页
        showNotAuthMessage()
        redirectToLogin()
      }
    } else {
      next()
    }
  } else {
    redirectToSetup()
  }
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})
