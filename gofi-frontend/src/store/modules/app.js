import Vue from 'vue'
import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAV_MODE,
  DEFAULT_THEME
} from '@/store/mutation-types'
import {
  getSetting,
  setup,
  updateLanguage,
  updateSetting,
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
    settings: {}
  },
  mutations: {
    SET_SETTINGS: (state, settings) => {
      state.settings = settings
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
      // 更改自有组件的语言
      i18n.locale = language
    }
  },
  actions: {
    // 获取用户信息
    GetSettings ({ commit }) {
      return new Promise((resolve, reject) => {
        getSetting().then(settings => {
          commit('SET_SETTINGS', settings)
          resolve(settings)
        }).catch(error => {
          reject(error)
        })
      })
    },
    Setup ({ commit }, forms) {
      return new Promise((resolve, reject) => {
        setup(forms).then(settings => {
          commit('SET_SETTINGS', settings)
          resolve(settings)
        }).catch(error => {
          reject(error)
        })
      })
    },
    UpdateSettings ({ commit }, params) {
      return new Promise((resolve, reject) => {
        console.log(params)
        updateSetting(params).then(settings => {
          commit('SET_SETTINGS', settings)
          resolve(settings)
        }).catch(error => {
          reject(error)
        })
      })
    },
    UpdateStoragePath ({ commit }, storagePath) {
      return new Promise((resolve, reject) => {
        updateStoragePath(storagePath).then(settings => {
          commit('SET_SETTINGS', settings)
          resolve(settings)
        }).catch(error => {
          reject(error)
        })
      })
    },
    SwitchLanguage ({ commit }, language) {
      return new Promise((resolve, reject) => {
        console.log(language)
        updateLanguage(language).then(response => {
          commit('SWITCH_LANGUAGE', language)
          resolve(response)
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
