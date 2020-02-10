import Vue from 'vue'
import store from '@/store/'
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAV_MODE,
  DEFAULT_THEME,
  TOKEN
} from '@/store/mutation-types'
import config from '@/config/defaultSettings'
import { defaultValue } from '@/utils/util'
import notification from 'ant-design-vue'

export default function Initializer () {
  store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
  store.commit('TOGGLE_NAV_MODE', Vue.ls.get(DEFAULT_NAV_MODE, config.navMode))
  store.commit('SWITCH_LANGUAGE', Vue.ls.get(DEFAULT_LANGUAGE, config.language))
  const token = Vue.ls.get(TOKEN, '')
  store.commit('SET_TOKEN', token)
  // 如果token存在，请求用户信息
  if (token) {
    store.dispatch('GetUser')
  }

  store.dispatch('GetConfiguration')
    .then((data) => {
      applyConfigurationFromServer(data)
    })
    .catch((e) => {
      notification.error({
        message: '错误',
        description: e
      })
    })
}

function applyConfigurationFromServer (configuration) {
  store.commit('TOGGLE_THEME', defaultValue(configuration.themeStyle, config.navTheme))
  store.commit('TOGGLE_NAV_MODE', defaultValue(configuration.navMode, config.navMode))
}
