import router from './router'
import store from './store'

import NProgress from 'nprogress' // progress bar
import '@/components/NProgress/nprogress.less' // progress bar custom style
import notification from 'ant-design-vue/es/notification'
import { defaultValue } from '@/utils/util'
import config from '@/config/defaultSettings'

NProgress.configure({ showSpinner: false })

router.beforeEach((to, from, next) => {
  NProgress.start() // start progress bar
  fetchSettingsIfNotExist(next, to)
})

router.afterEach(() => {
  NProgress.done() // finish progress bar
})

function setupOrNext (next, to) {
  // if initialized, just call next()
  const initialized = store.getters.settings.initialized
  console.log('initialized ' + initialized)
  if (to.name === 'setup') {
    if (initialized) {
      next({ replace: true, path: '/' })
    } else {
      next()
    }
  } else {
    if (initialized) {
      next()
    } else {
      next({ replace: true, name: 'setup' })
    }
  }
}

function applySettingFromServer (settings) {
  store.commit('TOGGLE_THEME',
    defaultValue(settings.themeStyle, config.navTheme))
  store.commit('TOGGLE_NAV_MODE',
    defaultValue(settings.navMode, config.navMode))
}

function fetchSettingsIfNotExist (next, to) {
  if (store.getters.settingsValid) {
    console.log('settings valid')
    setupOrNext(next, to)
  } else {
    console.log('get settings')
    // make sure settings is always exist before navigate to any where.
    store.dispatch('GetSettings')
      .then((data) => {
        setupOrNext(next, to)
        applySettingFromServer(data)
      })
      .catch((e) => {
        notification.error({
          message: '错误',
          description: e
        })
      })
  }
}
