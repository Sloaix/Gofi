import Vue from 'vue'
import store from '@/store/'
import {
  DEFAULT_COLOR, DEFAULT_LANGUAGE,
  DEFAULT_NAV_MODE,
  DEFAULT_THEME
} from '@/store/mutation-types'
import config from '@/config/defaultSettings'
import themeColor from '@/components/SettingDrawer/themeColor'

export default function Initializer () {
  store.commit('TOGGLE_THEME', Vue.ls.get(DEFAULT_THEME, config.navTheme))
  store.commit('TOGGLE_NAV_MODE', Vue.ls.get(DEFAULT_NAV_MODE, config.navMode))
  store.commit('TOGGLE_COLOR', Vue.ls.get(DEFAULT_COLOR, config.primaryColor))
  store.commit('SWITCH_LANGUAGE', Vue.ls.get(DEFAULT_LANGUAGE, config.language))
  // init theme color
  if (store.getters.color) {
    themeColor.changeColor(store.getters.color)
  }
}
