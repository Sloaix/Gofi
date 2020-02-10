import Vue from 'vue'
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAV_MODE,
  DEFAULT_THEME
} from '@/store/mutation-types'
import {
  getConfiguration,
  setup,
  updateConfiguration,
  updateStoragePath
} from '@/api/app'
import i18n from '@/locales'

const app = {
  state: {
    sidebar: true,
    device: 'desktop',
    theme: '',
    navMode: '',
    language: 'zh-CN',
    acceptLanguage: {},
    configuration: {}
  },
  mutations: {
    SET_CONFIGURATION: (state, configuration) => {
      state.configuration = configuration
    },
    TOGGLE_DEVICE: (state, device) => {
      state.device = device
    },
    TOGGLE_THEME: (state, theme) => {
      Vue.ls.set(DEFAULT_THEME, theme)
      state.theme = theme
    },
    TOGGLE_NAV_MODE: (state, navMode) => {
      Vue.ls.set(DEFAULT_NAV_MODE, navMode)
      state.navMode = navMode
    },
    SWITCH_LANGUAGE: (state, language) => {
      Vue.ls.set(DEFAULT_LANGUAGE, language)
      // 更改vue内置组件的语言
      state.language = language
      state.acceptLanguage = { 'Accept-Language': language }
      // 更改自有组件的语言
      i18n.locale = language
    }
  },
  actions: {
    // 获取配置
    GetConfiguration ({ commit }) {
      return new Promise((resolve, reject) => {
        getConfiguration().then(configuration => {
          commit('SET_CONFIGURATION', configuration)
          resolve(configuration)
        }).catch(error => {
          reject(error)
        })
      })
    },
    Setup ({ commit }, forms) {
      return new Promise((resolve, reject) => {
        setup(forms).then(configuration => {
          commit('SET_CONFIGURATION', configuration)
          resolve(configuration)
        }).catch(error => {
          reject(error)
        })
      })
    },
    UpdateConfiguration ({ commit }, params) {
      return new Promise((resolve, reject) => {
        console.log(params)
        updateConfiguration(params).then(configuration => {
          commit('SET_CONFIGURATION', configuration)
          resolve(configuration)
        }).catch(error => {
          reject(error)
        })
      })
    },
    UpdateStoragePath ({ commit }, storagePath) {
      return new Promise((resolve, reject) => {
        updateStoragePath(storagePath).then(configuration => {
          commit('SET_CONFIGURATION', configuration)
          resolve(configuration)
        }).catch(error => {
          reject(error)
        })
      })
    },
    ToggleDevice ({ commit }, device) {
      commit('TOGGLE_DEVICE', device)
    },
    ToggleTheme ({ commit }, theme) {
      commit('TOGGLE_THEME', theme)
    },
    ToggleLayoutMode ({ commit }, mode) {
      commit('TOGGLE_NAV_MODE', mode)
    }
  }
}

export default app
